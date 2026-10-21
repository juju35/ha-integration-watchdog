"""Find the integrations whose entities are all unavailable, and reload them.

An integration (config entry) is unavailable when it is loaded, has at least one enabled
entity with a state, and every one of these entities is `unavailable`. It is reloaded once
the most recent of these entities has been unavailable for the grace period.

Nothing is reloaded while Home Assistant is starting or stopping. An integration that stays
unavailable is reloaded at most `max_reloads` times in a row, the delay between two reloads
doubling each time (grace, 2 x grace, 4 x grace...); then the watchdog gives up on it until
one of its entities is available again. Every reload, and giving up, is notified.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import CALLBACK_TYPE, CoreState, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.translation import async_get_translations
from homeassistant.util import dt as dt_util

from .const import DOMAIN, EVENT_RELOADED

_LOGGER = logging.getLogger(__name__)


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
    ) -> None:
        self.hass = hass
        self.ignored: frozenset[str] = frozenset(ignored) | {DOMAIN}
        self.grace_period = grace_period
        self.max_reloads = max_reloads
        self.notify_services = list(notify_services)
        self.unavailable: list[UnavailableIntegration] = []
        self.attempts: dict[str, Attempts] = {}
        self.last_check: datetime | None = None
        self.last_reload: Reload | None = None
        self.reloads = 0
        # First check seen with Home Assistant running: nothing is reloaded before the grace
        # period has passed since then, whatever the states say.
        self._running_since: datetime | None = None
        self._lock = asyncio.Lock()
        self._listeners: list[CALLBACK_TYPE] = []

    @property
    def running(self) -> bool:
        return self._lock.locked()

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

    @callback
    def async_find_unavailable(self) -> list[UnavailableIntegration]:
        """Loaded, not ignored config entries whose entities are all unavailable."""
        registry = er.async_get(self.hass)
        found: list[UnavailableIntegration] = []
        for entry in self.hass.config_entries.async_entries():
            if entry.domain in self.ignored or entry.state is not ConfigEntryState.LOADED:
                continue
            states = []
            for entity in er.async_entries_for_config_entry(registry, entry.entry_id):
                if entity.disabled:
                    continue
                state = self.hass.states.get(entity.entity_id)
                # "restored" states belong to entities the integration no longer provides.
                if state is None or state.attributes.get("restored"):
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

    async def async_check(self) -> None:
        """Find the unavailable integrations and reload those that are due."""
        if self.hass.state is not CoreState.running:
            _LOGGER.debug("Home Assistant is not running (%s): no check", self.hass.state)
            return
        if self._lock.locked():
            _LOGGER.debug("A check is already running")
            return
        if self._running_since is None:
            self._running_since = dt_util.utcnow()
        async with self._lock:
            self._notify_listeners()
            self.unavailable = self.async_find_unavailable()
            # An integration available again starts over, once it has stayed so for its current
            # delay: one that comes back for a moment and falls again keeps its count.
            now = dt_util.utcnow()
            current = {u.entry_id for u in self.unavailable}
            for entry_id in set(self.attempts) - current:
                attempts = self.attempts[entry_id]
                if attempts.last is None or now - attempts.last >= self._delay(attempts):
                    del self.attempts[entry_id]
            for item in self.unavailable:
                # Stop as soon as Home Assistant starts stopping.
                if self.hass.state is not CoreState.running:
                    break
                await self._async_handle(item)
            self.unavailable = self.async_find_unavailable()
            self.last_check = dt_util.utcnow()
        self._notify_listeners()

    async def _async_handle(self, item: UnavailableIntegration) -> None:
        now = dt_util.utcnow()
        attempts = self.attempts.setdefault(item.entry_id, Attempts())
        if now - item.since < self.grace_period or now - self._running_since < self.grace_period:
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
        if attempts.last is not None and now - attempts.last < self._delay(attempts):
            return
        await self._async_reload(item, attempts)

    def _delay(self, attempts: Attempts) -> timedelta:
        """Minimum time after a reload before the next one: grace, 2 x grace, 4 x grace..."""
        return self.grace_period * 2 ** max(attempts.count - 1, 0)

    async def _async_reload(self, item: UnavailableIntegration, attempts: Attempts) -> None:
        entry: ConfigEntry | None = self.hass.config_entries.async_get_entry(item.entry_id)
        if entry is None or entry.state is not ConfigEntryState.LOADED:
            return
        _LOGGER.warning(
            "Reloading %s (%s): all its entities are unavailable since %s",
            item.title,
            item.domain,
            item.since.isoformat(),
        )
        try:
            success = await self.hass.config_entries.async_reload(item.entry_id)
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
        strings = await async_get_translations(self.hass, self.hass.config.language, "exceptions", [DOMAIN])
        placeholders = {
            "title": item.title,
            "domain": item.domain,
            "since": dt_util.as_local(item.since).strftime("%Y-%m-%d %H:%M"),
            "attempt": str(attempt),
            "max": str(self.max_reloads),
        }

        def text(name: str) -> str:
            template = strings.get(f"component.{DOMAIN}.exceptions.{name}.message", name)
            return template.format(**placeholders)

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
                await self.hass.services.async_call(
                    "notify", name, {"title": title, "message": message}, blocking=True
                )
            except Exception:  # noqa: BLE001 - a broken notifier must not stop the watchdog
                _LOGGER.exception("Sending the notification with notify.%s failed", name)
