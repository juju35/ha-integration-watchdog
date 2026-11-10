"""Diagnostics for Integration Watchdog: options and the watchdog's state, without personal data."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from . import IntegrationWatchdogConfigEntry
from .const import CONF_NOTIFY

# Entry titles often hold an e-mail address, a user name or a host (one per account or device), and notify
# action names often a person's name (notify.mobile_app_<phone>). Domains and entry ids are kept.
TO_REDACT = {
    "title",
    "switch_name",
    CONF_NOTIFY,
    "username",
    "password",
    "email",
    "host",
    "url",
    "token",
    "access_token",
    "api_key",
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry
) -> dict[str, Any]:
    watchdog = entry.runtime_data
    last_reload = watchdog.last_reload
    data = {
        "entry": {"data": dict(entry.data), "options": dict(entry.options)},
        "watchdog": {
            "ignored": sorted(watchdog.ignored),
            "ignored_entries": sorted(watchdog.ignored_entries),
            "grace_period": watchdog.grace_period.total_seconds(),
            "grace_overrides": {d: g.total_seconds() for d, g in watchdog.grace_overrides.items()},
            "max_reloads": watchdog.max_reloads,
            "running": watchdog.running,
            "started_at": watchdog.started_at.isoformat() if watchdog.started_at else None,
            "last_check": watchdog.last_check.isoformat() if watchdog.last_check else None,
            "reloads": watchdog.reloads,
            "last_reload": {**asdict(last_reload), "at": last_reload.at.isoformat()} if last_reload else None,
            "unavailable": [watchdog.as_dict(item) for item in watchdog.unavailable],
            "attempts": {entry_id: attempts.as_dict() for entry_id, attempts in watchdog.attempts.items()},
            "history": watchdog.history,
            "power_cycles": [
                {
                    "device_id": c.device_id,
                    "switch": c.switch,
                    "delay": c.delay.total_seconds(),
                    "off_time": c.off_time.total_seconds(),
                }
                for c in watchdog.power_cycles
            ],
            "power_cycle_attempts": {d: a.as_dict() for d, a in watchdog.cycle_attempts.items()},
            "powered_off": sorted(watchdog.powered_off),
        },
    }
    return async_redact_data(data, TO_REDACT)
