"""Integration Watchdog: reload the integrations whose entities are all unavailable, and the bundled Lovelace card."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import SIGNAL_CONFIG_ENTRY_CHANGED, ConfigEntry, ConfigEntryState
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, Platform
from homeassistant.core import CoreState, Event, HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.storage import Store
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from .const import (
    CARD_URL,
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
    STORAGE_KEY,
    STORAGE_VERSION,
    VERSION,
)
from .watchdog import IntegrationWatchdog

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BUTTON, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type IntegrationWatchdogConfigEntry = ConfigEntry[IntegrationWatchdog]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the card, load it on every dashboard and register the check action (admin: it reloads integrations)."""
    await hass.http.async_register_static_paths(
        [StaticPathConfig(CARD_URL, str(Path(__file__).parent / "frontend" / "integration-watchdog-card.js"), True)]
    )

    async def _register(_: Event | None = None) -> None:
        if not await _async_register_resource(hass):
            # Dashboard resources in YAML mode: load the card on every page instead.
            add_extra_js_url(hass, f"{CARD_URL}?v={VERSION}")

    if hass.state is CoreState.running:
        await _register()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register)

    async def check(_call: ServiceCall) -> None:
        entries = [e for e in hass.config_entries.async_entries(DOMAIN) if e.state is ConfigEntryState.LOADED]
        if not entries:
            raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
        # Waits for a check already running, then runs its own.
        await entries[0].runtime_data.async_check(wait=True)

    async_register_admin_service(hass, DOMAIN, SERVICE_CHECK, check)
    return True


def _storage_resources(hass: HomeAssistant) -> Any | None:
    """Return the dashboard resources collection when it is editable from the UI.

    hass.data["lovelace"] is a dict before 2025.2, then a dataclass whose `mode` field became `resource_mode` in 2026.2.
    """
    lovelace = hass.data.get("lovelace")
    if isinstance(lovelace, dict):
        mode, resources = lovelace.get("resource_mode", lovelace.get("mode")), lovelace.get("resources")
    else:
        mode = getattr(lovelace, "resource_mode", getattr(lovelace, "mode", None))
        resources = getattr(lovelace, "resources", None)
    return resources if mode == "storage" else None


async def _async_register_resource(hass: HomeAssistant) -> bool:
    """Add or update the card in Settings → Dashboards → Resources."""
    resources = _storage_resources(hass)
    if resources is None:
        return False
    url = f"{CARD_URL}?v={VERSION}"
    try:
        await resources.async_get_info()  # loads the collection from storage
        existing = [item for item in resources.async_items() if item.get("url", "").split("?")[0] == CARD_URL]
        if not existing:
            await resources.async_create_item({"res_type": "module", "url": url})
            return True
        if existing[0]["url"] != url:
            await resources.async_update_item(existing[0]["id"], {"res_type": "module", "url": url})
        for duplicate in existing[1:]:
            await resources.async_delete_item(duplicate["id"])
    except Exception:  # noqa: BLE001 - never block the integration on the card
        _LOGGER.exception("Could not register the Integration Watchdog card as a dashboard resource")
        return False
    return True


async def async_setup_entry(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> bool:
    if hass.state is CoreState.running:
        # async_setup runs once per start: after the entry was removed (which drops the card resource) and
        # added again, the resource has to come back without a restart.
        await _async_register_resource(hass)
    options = entry.options
    watchdog = IntegrationWatchdog(
        hass,
        options.get(CONF_IGNORED, []),
        timedelta(minutes=int(options.get(CONF_GRACE_PERIOD, DEFAULT_GRACE_PERIOD))),
        int(options.get(CONF_MAX_RELOADS, DEFAULT_MAX_RELOADS)),
        options.get(CONF_NOTIFY, []),
        # Reload counts and lock, kept in memory until Home Assistant restarts.
        hass.data.setdefault(DOMAIN, {}),
    )
    await watchdog.async_load()
    entry.runtime_data = watchdog
    entry.async_on_unload(watchdog.async_stop)
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_CONFIG_ENTRY_CHANGED, watchdog.async_entry_changed))

    async def scheduled(_now: datetime) -> None:
        # The check itself does nothing while Home Assistant is starting or stopping.
        await watchdog.async_check()

    minutes = int(options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
    entry.async_on_unload(async_track_time_interval(hass, scheduled, timedelta(minutes=minutes)))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def first_check(_hass: HomeAssistant) -> None:
        # Runs right away when Home Assistant is already running (started_at is then already set).
        if watchdog.started_at is None:
            watchdog.started_at = dt_util.utcnow()
        # After a reload of the watchdog, a check of the previous instance may still be running.
        await watchdog.async_check(wait=True)

    entry.async_on_unload(async_at_started(hass, first_check))
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_remove_entry(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> None:
    """Forget the reload counts and the history, and drop the card resource, once a check still running has ended."""
    shared = hass.data.get(DOMAIN)
    if shared is not None and not await _async_forget(hass, entry, shared):
        return
    # A reinstall starts with an empty history. The shared store, if any, also drops a save still pending.
    store = shared.get("store") if shared else None
    await (store or Store(hass, STORAGE_VERSION, STORAGE_KEY)).async_remove()
    if (resources := _storage_resources(hass)) is None:
        return
    for item in list(resources.async_items()):
        if item.get("url", "").split("?")[0] == CARD_URL:
            await resources.async_delete_item(item["id"])


async def _async_forget(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry, shared: dict[str, Any]) -> bool:
    """Drop the shared state, unless the integration was added back meanwhile (then False: keep everything)."""
    if (lock := shared.get("lock")) is not None:
        async with lock:
            pass
    # Only if the integration wasn't added back while the removal waited for the check: a new setup
    # gets the same dict from setdefault, popping it would hand a later options reload a second lock
    # while a check may still run under this one. The entry being removed is skipped: before Home
    # Assistant 2025.3 it is still registered while this callback runs.
    others = [e for e in hass.config_entries.async_entries(DOMAIN) if e.entry_id != entry.entry_id]
    if others or hass.data.get(DOMAIN) is not shared:
        return False
    hass.data.pop(DOMAIN)
    return True


async def _async_reload(hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
