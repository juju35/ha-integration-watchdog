"""Find the integrations whose entities are all unavailable, and reload them.

An integration (config entry) is unavailable when it is loaded, has at least one enabled
entity with a state, and every one of these entities is `unavailable`. It is reloaded once
the most recent of these entities has been unavailable for the grace period: a reload
recreates the entities, so an integration that stays unavailable is reloaded at most once
per grace period.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
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

    def as_dict(self) -> dict[str, Any]:
        return {
            "domain": self.domain,
            "title": self.title,
            "entry_id": self.entry_id,
            "since": self.since.isoformat(),
        }


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

    def __init__(self, hass: HomeAssistant, ignored: Iterable[str], grace_period: timedelta) -> None:
        self.hass = hass
        self.ignored: frozenset[str] = frozenset(ignored) | {DOMAIN}
        self.grace_period = grace_period
        self.unavailable: list[UnavailableIntegration] = []
        self.last_check: datetime | None = None
        self.last_reload: Reload | None = None
        self.reloads = 0
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
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

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
        """Find the unavailable integrations and reload those past the grace period."""
        if self._lock.locked():
            _LOGGER.debug("A check is already running")
            return
        async with self._lock:
            self._notify()
            now = dt_util.utcnow()
            self.unavailable = self.async_find_unavailable()
            for item in self.unavailable:
                if now - item.since >= self.grace_period:
                    await self._async_reload(item)
            # Reloaded integrations that came back no longer count as unavailable.
            self.unavailable = self.async_find_unavailable()
            self.last_check = dt_util.utcnow()
        self._notify()

    async def _async_reload(self, item: UnavailableIntegration) -> None:
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
        self.reloads += 1
        self.last_reload = Reload(item.entry_id, item.domain, item.title, success, dt_util.utcnow())
        self.hass.bus.async_fire(
            EVENT_RELOADED,
            {
                "entry_id": item.entry_id,
                "domain": item.domain,
                "title": item.title,
                "success": success,
                "unavailable_since": item.since.isoformat(),
            },
        )
