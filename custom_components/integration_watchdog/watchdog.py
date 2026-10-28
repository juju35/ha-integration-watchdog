"""Find the integrations whose entities are all unavailable, and reload them.

An integration (config entry) is unavailable when it is loaded or its setup failed, has at least one enabled
entity with a state, and every one of these entities is `unavailable`. It is reloaded once
the most recent of these entities has been unavailable for the grace period.

Nothing is reloaded while Home Assistant is starting or stopping. Helpers (template, group,
utility meter...) are left out: their entities follow their sources, a reload can't fix them.
An integration that stays unavailable is reloaded at most `max_reloads` times in a row, the delay
between two reloads doubling each time (grace, 2 x grace, 4 x grace...); once the delay after the
last one has passed, the watchdog gives up on it until it has been available again for the current
delay. Every reload, and giving up, is notified.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry, ConfigEntryChange, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import CALLBACK_TYPE, CoreState, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.translation import async_get_translations
from homeassistant.loader import async_get_integrations
from homeassistant.util import dt as dt_util

from .const import DOMAIN, EVENT_RELOADED

_LOGGER = logging.getLogger(__name__)

# Entries checked: loaded, or whose setup failed (Home Assistant retries those with a growing delay,
# or not at all after an error; a reload retries right away). Disabled or not loaded ones are left alone.
WATCHED_STATES = (
    ConfigEntryState.LOADED,
    ConfigEntryState.SETUP_RETRY,
    ConfigEntryState.SETUP_ERROR,
)

# A reload or a notify action that doesn't return within this time counts as failed, so that
# a hung integration can't keep the check (and its lock) busy forever.
RELOAD_TIMEOUT = timedelta(minutes=5)
NOTIFY_TIMEOUT = timedelta(seconds=30)


@dataclass(frozen=True)
class UnavailableIntegration:
    """A loaded config entry whose entities are all unavailable."""

    entry_id: str
    domain: str
    title: str
    since: datetime


@dataclass
class Attempts:
    """Reloads in a row of an integration that stays unavailable."""

    count: int = 0
    last: datetime | None = None
    gave_up: bool = False
    # First check that found the integration available again, None while it is unavailable.
    recovered_at: datetime | None = None


@dataclass(frozen=True)
class Reload:
    """A reload done by the watchdog."""

    entry_id: str
    domain: str
    title: str
    success: bool
    at: datetime


class IntegrationWatchdog:
    """Runs the checks and keeps their result for the entities."""

    def __init__(
        self,
        hass: HomeAssistant,
        ignored: Iterable[str],
        grace_period: timedelta,
        max_reloads: int,
        notify_services: Iterable[str] = (),
        shared: dict[str, Any] | None = None,
    ) -> None:
        self.hass = hass
        self.ignored: frozenset[str] = frozenset(ignored) | {DOMAIN}
        self.grace_period = grace_period
        self.max_reloads = max_reloads
        self.notify_services = list(notify_services)
        self.unavailable: list[UnavailableIntegration] = []
        # Kept by __init__ across reloads of the watchdog's entry (options changed), with the lock:
        # an integration given up stays so, and a check still running in the previous instance
        # keeps the new one waiting instead of reloading the same entries twice.
        shared = shared if shared is not None else {}
        self._shared = shared
        shared.setdefault("checks", 0)
        self.attempts: dict[str, Attempts] = shared.setdefault("attempts", {})
        self.last_check: datetime | None = None
        self.last_reload: Reload | None = None
        self.reloads = 0
        # When Home Assistant finished starting: nothing is reloaded before the grace period has
        # passed since then, whatever the states say. None until it has started; set far in the
        # past when the watchdog itself is set up later (options changed, update installed).
        self.started_at: datetime | None = (
            datetime.min.replace(tzinfo=dt_util.UTC) if hass.state is CoreState.running else None
        )
        # Integration domains whose integration_type is "helper", and those known not to be.
        self._helpers: dict[str, bool] = {}
        self._lock: asyncio.Lock = shared.setdefault("lock", asyncio.Lock())
        self._listeners: list[CALLBACK_TYPE] = []
        # Set when the watchdog's entry is unloaded: a check still running stops reloading.
        self._stopped = False

    @property
    def running(self) -> bool:
        return self._lock.locked()

    @callback
    def async_stop(self) -> None:
        """Stop a check still running: the watchdog's entry is being unloaded or removed."""
        self._stopped = True

    @callback
    def async_entry_changed(self, _change: ConfigEntryChange, entry: ConfigEntry) -> None:
        """Forget the reloads of an entry disabled by the user: once enabled again, it starts over.

        Done on the change itself: disabling then enabling again usually takes less than a check interval.
        """
        if entry.disabled_by is not None:
            self.attempts.pop(entry.entry_id, None)

    @callback
    def async_add_listener(self, update_callback: CALLBACK_TYPE) -> Callable[[], None]:
        self._listeners.append(update_callback)
        return lambda: self._listeners.remove(update_callback)

    @callback
    def _notify_listeners(self) -> None:
        for listener in list(self._listeners):
            listener()

    def as_dict(self, item: UnavailableIntegration) -> dict[str, Any]:
        attempts = self.attempts.get(item.entry_id, Attempts())
        return {
            "domain": item.domain,
            "title": item.title,
            "entry_id": item.entry_id,
            "since": item.since.isoformat(),
            "reloads": attempts.count,
            "gave_up": attempts.gave_up,
        }

    async def _async_load_helpers(self) -> None:
        """Learn the integration type of the domains not seen yet."""
        domains = {e.domain for e in self.hass.config_entries.async_entries()} - self._helpers.keys()
        if not domains:
            return
        for domain, integration in (await async_get_integrations(self.hass, domains)).items():
            self._helpers[domain] = not isinstance(integration, Exception) and integration.integration_type == "helper"

    @callback
    def async_find_unavailable(self) -> list[UnavailableIntegration]:
        """Watched, not ignored, not helper config entries whose entities are all unavailable."""
        registry = er.async_get(self.hass)
        found: list[UnavailableIntegration] = []
        for entry in self.hass.config_entries.async_entries():
            if entry.domain in self.ignored or entry.state not in WATCHED_STATES or self._helpers.get(entry.domain):
                continue
            states = []
            for entity in er.async_entries_for_config_entry(registry, entry.entry_id):
                if entity.disabled:
                    continue
                state = self.hass.states.get(entity.entity_id)
                # Entities the integration hasn't created (device off, connection lost at setup) keep an
                # "unavailable" placeholder with `restored: true`: they count as unavailable too.
                if state is None:
                    continue
                states.append(state)
            if not states or any(s.state != STATE_UNAVAILABLE for s in states):
                continue
            found.append(
                UnavailableIntegration(
                    entry_id=entry.entry_id,
                    domain=entry.domain,
                    title=entry.title,
                    since=max(s.last_changed for s in states),
                )
            )
        return sorted(found, key=lambda u: (u.domain, u.title))

    @callback
    def _has_available_entity(self, entry: ConfigEntry) -> bool:
        """A watched entry with at least one enabled entity whose state is not unavailable."""
        if entry.state not in WATCHED_STATES:
            return False
        for entity in er.async_entries_for_config_entry(er.async_get(self.hass), entry.entry_id):
            if entity.disabled:
                continue
            state = self.hass.states.get(entity.entity_id)
            if state is not None and state.state != STATE_UNAVAILABLE:
                return True
        return False

    async def async_check(self, wait: bool = False) -> None:
        """Find the unavailable integrations and reload those that are due.

        While a check is running, a scheduled one is skipped; with `wait` (the action, the first
        check after a reload of the watchdog), it runs once the running one has ended.
        """
        if self.hass.state is not CoreState.running:
            _LOGGER.debug("Home Assistant is not running (%s): no check", self.hass.state)
            return
        if self._lock.locked() and not wait:
            _LOGGER.debug("A check is already running")
            return
        seen = self._shared["checks"]
        async with self._lock:
            if self.hass.state is not CoreState.running or self._stopped:
                return
            # A scheduled check can see the lock free right after a release and still queue behind a
            # waiting one: a check done since the counter was read above means it already ran, skip it.
            if not wait and self._shared["checks"] != seen:
                _LOGGER.debug("A check ran while this one was waiting for the lock")
                return
            self._shared["checks"] += 1
            self._notify_listeners()
            await self._async_load_helpers()
            self.unavailable = self.async_find_unavailable()
            # An integration available again starts over, once it has stayed so for its current
            # delay, counted from the first check that found it back: one that comes back for a
            # moment and falls again keeps its count.
            now = dt_util.utcnow()
            current = {u.entry_id for u in self.unavailable}
            for entry_id, attempts in list(self.attempts.items()):
                if entry_id in current:
                    attempts.recovered_at = None
                    continue
                entry = self.hass.config_entries.async_get_entry(entry_id)
                # Removed, or disabled by the user (also forgotten as soon as it is disabled, see
                # async_entry_changed): once enabled again, it starts over.
                if entry is None or entry.disabled_by is not None:
                    del self.attempts[entry_id]
                    continue
                # Out of the list is not available again: a setup or unload still in progress (a reload past
                # its timeout), or no entity with an available state. Left as it is.
                if not self._has_available_entity(entry):
                    continue
                if attempts.recovered_at is None:
                    attempts.recovered_at = now
                if attempts.count == 0 or now - attempts.recovered_at >= self._delay(attempts):
                    del self.attempts[entry_id]
            for item in self.unavailable:
                # Stop as soon as Home Assistant starts stopping, or the watchdog is unloaded or removed.
                if self.hass.state is not CoreState.running or self._stopped:
                    break
                await self._async_handle(item)
            self.unavailable = self.async_find_unavailable()
            self.last_check = dt_util.utcnow()
        self._notify_listeners()

    async def _async_handle(self, item: UnavailableIntegration) -> None:
        now = dt_util.utcnow()
        attempts = self.attempts.setdefault(item.entry_id, Attempts())
        if self.started_at is None or now - item.since < self.grace_period or now - self.started_at < self.grace_period:
            return
        # The last reload gets its full delay too before giving up.
        if attempts.last is not None and now - attempts.last < self._delay(attempts):
            return
        if attempts.count >= self.max_reloads:
            if not attempts.gave_up:
                attempts.gave_up = True
                _LOGGER.warning(
                    "%s (%s) is still unavailable after %d reloads: not reloading it again until it recovers",
                    item.title,
                    item.domain,
                    attempts.count,
                )
                await self._async_send("gave_up", item, attempts.count)
            return
        # Given up with a lower limit, before the options were changed: reloaded again up to the new one.
        attempts.gave_up = False
        await self._async_reload(item, attempts)

    def _delay(self, attempts: Attempts) -> timedelta:
        """Minimum time after a reload before the next one: grace, 2 x grace, 4 x grace..."""
        return self.grace_period * 2 ** max(attempts.count - 1, 0)

    @staticmethod
    def _log_late_reload(task: asyncio.Task, item: UnavailableIntegration) -> None:
        """Log the failure of a reload that finished after its timeout."""
        if task.cancelled() or (err := task.exception()) is None:
            return
        _LOGGER.error(
            "Reloading %s (%s) failed after its timeout",
            item.title,
            item.domain,
            exc_info=(type(err), err, err.__traceback__),
        )

    async def _async_reload(self, item: UnavailableIntegration, attempts: Attempts) -> None:
        entry: ConfigEntry | None = self.hass.config_entries.async_get_entry(item.entry_id)
        if entry is None or entry.state not in WATCHED_STATES:
            return
        # The unavailable list is a snapshot taken at the start of the check, and the earlier reloads
        # of this check may have taken minutes: skip one that has become available again since.
        if self._has_available_entity(entry):
            return
        _LOGGER.warning(
            "Reloading %s (%s): all its entities are unavailable since %s",
            item.title,
            item.domain,
            item.since.isoformat(),
        )
        # Shielded: on timeout the check goes on, the reload itself isn't cancelled halfway.
        task = self.hass.async_create_background_task(
            self.hass.config_entries.async_reload(item.entry_id), f"{DOMAIN} reload {item.entry_id}"
        )
        try:
            async with asyncio.timeout(RELOAD_TIMEOUT.total_seconds()):
                success = await asyncio.shield(task)
        except TimeoutError:
            _LOGGER.warning(
                "Reloading %s (%s) didn't finish within %s: counted as failed",
                item.title,
                item.domain,
                RELOAD_TIMEOUT,
            )
            # Nobody awaits the shielded reload any more: read its outcome so that a late failure is logged
            # here instead of asyncio's "Task exception was never retrieved".
            task.add_done_callback(lambda t, item=item: self._log_late_reload(t, item))
            success = False
        except Exception:  # noqa: BLE001 - one broken integration must not stop the watchdog
            _LOGGER.exception("Reloading %s (%s) failed", item.title, item.domain)
            success = False
        attempts.count += 1
        attempts.last = dt_util.utcnow()
        self.reloads += 1
        self.last_reload = Reload(item.entry_id, item.domain, item.title, success, attempts.last)
        self.hass.bus.async_fire(
            EVENT_RELOADED,
            {
                "entry_id": item.entry_id,
                "domain": item.domain,
                "title": item.title,
                "success": success,
                "unavailable_since": item.since.isoformat(),
                "attempt": attempts.count,
                "max_reloads": self.max_reloads,
            },
        )
        await self._async_send("reloaded" if success else "reload_failed", item, attempts.count)

    async def _async_send(self, key: str, item: UnavailableIntegration, attempt: int) -> None:
        """Persistent notification (one per integration, replaced), and the notify services chosen."""
        strings = await async_get_translations(self.hass, self.hass.config.language, "common", [DOMAIN])
        placeholders = {
            "title": item.title,
            "domain": item.domain,
            "since": dt_util.as_local(item.since).strftime("%Y-%m-%d %H:%M"),
            "attempt": str(attempt),
            "max": str(self.max_reloads),
        }

        def text(name: str) -> str:
            template = strings.get(f"component.{DOMAIN}.common.{name}", name)
            # A translation with an unknown placeholder or a stray brace must not abort the check.
            try:
                return template.format(**placeholders)
            except (KeyError, IndexError, ValueError):
                _LOGGER.warning("Invalid placeholders in the %s translation: %r", name, template)
                return template

        title, message = text(f"{key}_title"), text(key)
        persistent_notification.async_create(
            self.hass, message, title=title, notification_id=f"{DOMAIN}_{item.entry_id}"
        )
        for service in self.notify_services:
            name = service.removeprefix("notify.")
            if not self.hass.services.has_service("notify", name):
                _LOGGER.warning("Notify action notify.%s not found", name)
                continue
            try:
                async with asyncio.timeout(NOTIFY_TIMEOUT.total_seconds()):
                    await self.hass.services.async_call(
                        "notify", name, {"title": title, "message": message}, blocking=True
                    )
            except TimeoutError:
                _LOGGER.warning("Sending the notification with notify.%s didn't finish within %s", name, NOTIFY_TIMEOUT)
            except Exception:  # noqa: BLE001 - a broken notifier must not stop the watchdog
                _LOGGER.exception("Sending the notification with notify.%s failed", name)
