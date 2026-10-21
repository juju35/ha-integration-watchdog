"""Integration Watchdog: reload the integrations whose entities are all unavailable."""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_MAX_RELOADS,
    CONF_NOTIFY,
    CONF_SCAN_INTERVAL,
    DEFAULT_GRACE_PERIOD,
    DEFAULT_MAX_RELOADS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    SERVICE_CHECK,
)
from .watchdog import IntegrationWatchdog

PLATFORMS = [Platform.BUTTON, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type IntegrationWatchdogConfigEntry = ConfigEntry[IntegrationWatchdog]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register the check action, for administrators since it reloads integrations."""

    async def check(call: ServiceCall) -> None:
        entries = [
            e for e in hass.config_entries.async_entries(DOMAIN) if e.state is ConfigEntryState.LOADED
        ]
        if not entries:
            raise ServiceValidationError("Integration Watchdog is not loaded")
        await entries[0].runtime_data.async_check()

    async_register_admin_service(hass, DOMAIN, SERVICE_CHECK, check)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> bool:
    options = entry.options
    watchdog = IntegrationWatchdog(
        hass,
        options.get(CONF_IGNORED, []),
        timedelta(minutes=int(options.get(CONF_GRACE_PERIOD, DEFAULT_GRACE_PERIOD))),
        int(options.get(CONF_MAX_RELOADS, DEFAULT_MAX_RELOADS)),
        options.get(CONF_NOTIFY, []),
    )
    entry.runtime_data = watchdog

    async def scheduled(_now: datetime) -> None:
        # The check itself does nothing while Home Assistant is starting or stopping.
        await watchdog.async_check()

    minutes = int(options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
    entry.async_on_unload(async_track_time_interval(hass, scheduled, timedelta(minutes=minutes)))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def first_check(_hass: HomeAssistant) -> None:
        await watchdog.async_check()

    entry.async_on_unload(async_at_started(hass, first_check))
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_reload(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
