"""Sidebar panel: the status, the power cycles and the settings on one page (administrators only).

The panel (``frontend/integration-watchdog-panel.js``) shows the status with the bundled card, and two forms
backed by the WebSocket commands below:

- ``integration_watchdog/settings``: the entry (state, device, last check), its options (defaults filled in), the
  option limits, the power cycles with their device and plug, and the choices of the forms;
- ``integration_watchdog/update_settings``: changes the settings, with the checks of the options flow (the update
  listener reloads the entry once);
- ``integration_watchdog/add_power_cycle`` / ``remove_power_cycle``: like the options flow steps.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.loader import async_get_integrations

from .config_flow import _cycle_errors, _errors, _options, format_overrides
from .const import (
    CONF_DELAY,
    CONF_DEVICE,
    CONF_GRACE_OVERRIDES,
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_IGNORED_ENTRIES,
    CONF_MAX_RELOADS,
    CONF_NOTIFY,
    CONF_OFF_TIME,
    CONF_PAUSE_ENTITY,
    CONF_POWER_CYCLES,
    CONF_SCAN_INTERVAL,
    CONF_SWITCH,
    DEFAULT_CYCLE_DELAY,
    DEFAULT_GRACE_PERIOD,
    DEFAULT_MAX_RELOADS,
    DEFAULT_OFF_TIME,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_MAX_RELOADS,
    MAX_MINUTES,
    MAX_OFF_TIME,
    PANEL_PATH,
    PANEL_URL,
    PAUSE_DOMAINS,
    VERSION,
)

OPTION_DEFAULTS: dict[str, Any] = {
    CONF_SCAN_INTERVAL: DEFAULT_SCAN_INTERVAL,
    CONF_GRACE_PERIOD: DEFAULT_GRACE_PERIOD,
    CONF_GRACE_OVERRIDES: {},
    CONF_MAX_RELOADS: DEFAULT_MAX_RELOADS,
    CONF_IGNORED: [],
    CONF_IGNORED_ENTRIES: [],
    CONF_PAUSE_ENTITY: None,
    CONF_NOTIFY: [],
}
LIMITS = {
    CONF_SCAN_INTERVAL: (1, MAX_MINUTES),
    CONF_GRACE_PERIOD: (1, MAX_MINUTES),
    CONF_MAX_RELOADS: (1, MAX_MAX_RELOADS),
    CONF_DELAY: (1, MAX_MINUTES),
    CONF_OFF_TIME: (1, MAX_OFF_TIME),
}


def _int(key: str) -> vol.All:
    return vol.All(vol.Coerce(int), vol.Range(*LIMITS[key]))


SETTINGS_SCHEMA = {
    vol.Optional(CONF_SCAN_INTERVAL): _int(CONF_SCAN_INTERVAL),
    vol.Optional(CONF_GRACE_PERIOD): _int(CONF_GRACE_PERIOD),
    vol.Optional(CONF_MAX_RELOADS): _int(CONF_MAX_RELOADS),
    # "domain: minutes" lines, as typed in the options flow
    vol.Optional(CONF_GRACE_OVERRIDES): str,
    vol.Optional(CONF_IGNORED): [str],
    vol.Optional(CONF_IGNORED_ENTRIES): [str],
    vol.Optional(CONF_PAUSE_ENTITY): vol.Any(None, str),
    vol.Optional(CONF_NOTIFY): [str],
}


async def async_register_panel(hass: HomeAssistant) -> None:
    """Add the Integration Watchdog entry to the sidebar (administrators only) and its commands."""
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="integration-watchdog-panel",
        sidebar_title="Integration Watchdog",
        sidebar_icon="mdi:shield-check-outline",
        module_url=f"{PANEL_URL}?v={VERSION}",
        require_admin=True,
        config={"version": VERSION},
    )
    for command in (_ws_settings, _ws_update_settings, _ws_add_power_cycle, _ws_remove_power_cycle):
        websocket_api.async_register_command(hass, command)


def _entry(hass: HomeAssistant) -> ConfigEntry | None:
    """The single entry, whatever its state."""
    return next(iter(hass.config_entries.async_entries(DOMAIN)), None)


def _settings_options(entry: ConfigEntry) -> dict[str, Any]:
    """The settings with defaults filled in, the grace overrides as the text of the form."""
    options = {key: entry.options.get(key, default) for key, default in OPTION_DEFAULTS.items()}
    options[CONF_GRACE_OVERRIDES] = format_overrides(options[CONF_GRACE_OVERRIDES] or {})
    return options


def _cycles(entry: ConfigEntry) -> list[dict[str, Any]]:
    return [dict(c) for c in entry.options.get(CONF_POWER_CYCLES, []) if isinstance(c, dict)]


def _update(hass: HomeAssistant, entry: ConfigEntry, options: dict[str, Any]) -> None:
    """Store the options when they changed: the update listener reloads the entry once."""
    if options != dict(entry.options):
        hass.config_entries.async_update_entry(entry, options=options)


def _service_device(hass: HomeAssistant, entry: ConfigEntry) -> dr.DeviceEntry | None:
    """The integration's service device (2026.8+: `async_get_device_by_identifier`, the old call is deprecated)."""
    registry = dr.async_get(hass)
    identifier = (DOMAIN, entry.entry_id)
    if hasattr(type(registry), "async_get_device_by_identifier"):
        return registry.async_get_device_by_identifier(identifier, entry.entry_id)
    return registry.async_get_device(identifiers={identifier})


def _device_label(device: dr.DeviceEntry) -> str:
    return device.name_by_user or device.name or device.id


def _area_name(hass: HomeAssistant, area_id: str | None) -> str | None:
    area = ar.async_get(hass).async_get_area(area_id) if area_id else None
    return area.name if area else None


def _notify_options(hass: HomeAssistant, chosen: list[str]) -> list[str]:
    """The notify actions a form can pick: the ones available, plus the ones already chosen."""
    available = {f"notify.{name}" for name in hass.services.async_services_for_domain("notify")}
    return sorted(available - {"notify.send_message", "notify.persistent_notification"} | set(chosen))


async def _integration_options(hass: HomeAssistant, ignored: list[str]) -> list[dict[str, str]]:
    domains = {e.domain for e in hass.config_entries.async_entries() if e.domain != DOMAIN} | set(ignored)
    integrations = await async_get_integrations(hass, domains)
    options = [{"value": d, "label": getattr(integrations.get(d), "name", d)} for d in domains]
    return sorted(options, key=lambda o: o["label"].casefold())


def _entry_options(hass: HomeAssistant, ignored: list[str]) -> list[dict[str, str]]:
    """Single entries: title and domain; an ignored entry removed since keeps its id."""
    entries = {e.entry_id: e for e in hass.config_entries.async_entries() if e.domain != DOMAIN}
    options = [
        {"value": entry_id, "label": entries[entry_id].title, "detail": entries[entry_id].domain}
        if entry_id in entries
        else {"value": entry_id, "label": entry_id, "detail": ""}
        for entry_id in set(entries) | set(ignored)
    ]
    return sorted(options, key=lambda o: (o["label"].casefold(), o["detail"]))


def _pause_options(hass: HomeAssistant, chosen: str | None) -> list[dict[str, str]]:
    options = {s.entity_id: s.name for s in hass.states.async_all(PAUSE_DOMAINS)}
    if chosen and chosen not in options:
        options[chosen] = chosen
    return sorted(({"value": k, "label": v} for k, v in options.items()), key=lambda o: o["label"].casefold())


def _device_options(hass: HomeAssistant, own: str | None) -> list[dict[str, str]]:
    """Devices with at least one enabled entity, the watchdog's own one left out: name, area and integrations."""
    entities = er.async_get(hass)
    with_entities = {e.device_id for e in entities.entities.values() if e.device_id and not e.disabled}
    options = []
    registry = dr.async_get(hass)
    # Iterating the devices gives the entries from Home Assistant 2026.11 (`.values()` is deprecated), their ids before.
    for item in registry.devices:
        device = registry.async_get(item) if isinstance(item, str) else item
        if device is None:
            continue
        if device.id == own or device.disabled or device.id not in with_entities:
            continue
        platforms = {e.platform for e in er.async_entries_for_device(entities, device.id)}
        options.append(
            {
                "value": device.id,
                "label": _device_label(device),
                "detail": ", ".join(sorted(platforms)),
                "area": _area_name(hass, device.area_id) or "",
            }
        )
    return sorted(options, key=lambda o: (o["label"].casefold(), o["value"]))


def _switch_options(hass: HomeAssistant) -> list[dict[str, Any]]:
    """The switches that can power a device, with their device and area (the panel leaves out the chosen device's own).

    Configuration and diagnostic switches (child lock, LED, an integration's options) never are a power plug: left out.
    """
    entities = er.async_get(hass)
    devices = dr.async_get(hass)
    options = []
    for state in hass.states.async_all("switch"):
        entry = entities.async_get(state.entity_id)
        if entry is not None and entry.entity_category is not None:
            continue
        device = devices.async_get(entry.device_id) if entry and entry.device_id else None
        device_class = (entry.device_class or entry.original_device_class) if entry else None
        options.append(
            {
                "value": state.entity_id,
                "label": state.name,
                "detail": _device_label(device) if device else "",
                "area": _area_name(hass, (entry.area_id if entry else None) or (device.area_id if device else None))
                or "",
                "device_id": device.id if device else None,
                "outlet": (device_class or state.attributes.get("device_class")) == "outlet",
            }
        )
    return sorted(options, key=lambda o: (o["label"].casefold(), o["value"]))


def _power_cycles(hass: HomeAssistant, entry: ConfigEntry, watchdog: Any | None) -> list[dict[str, Any]]:
    """The power cycles, with the device and plug names, the plug state and, while loaded, the current count."""
    attempts = watchdog.cycle_attempts if watchdog is not None else {}
    unavailable = {c.device_id for c, _ in watchdog.async_find_unavailable_devices()} if watchdog is not None else set()
    devices = dr.async_get(hass)
    cycles = []
    for cycle in _cycles(entry):
        device_id = cycle.get(CONF_DEVICE, "")
        device = devices.async_get(device_id)
        plug = hass.states.get(cycle.get(CONF_SWITCH, ""))
        count = attempts.get(device_id)
        cycles.append(
            {
                "device_id": device_id,
                "device_name": _device_label(device) if device else None,
                "area": _area_name(hass, device.area_id) if device else None,
                "switch": cycle.get(CONF_SWITCH),
                "switch_name": plug.name if plug else None,
                "switch_state": plug.state if plug else None,
                "delay": cycle.get(CONF_DELAY, DEFAULT_CYCLE_DELAY),
                "off_time": cycle.get(CONF_OFF_TIME, DEFAULT_OFF_TIME),
                "unavailable": device_id in unavailable,
                "count": count.count if count else 0,
                "gave_up": count.gave_up if count else False,
            }
        )
    return cycles


async def _settings(hass: HomeAssistant, entry: ConfigEntry | None) -> dict[str, Any]:
    if entry is None:
        return {"entry": None, "options": dict(OPTION_DEFAULTS), "limits": {k: list(v) for k, v in LIMITS.items()}}
    options = _settings_options(entry)
    device = _service_device(hass, entry)
    watchdog = entry.runtime_data if entry.state is ConfigEntryState.LOADED else None
    last_check = getattr(watchdog, "last_check", None)
    return {
        "entry": {
            "entry_id": entry.entry_id,
            "state": entry.state.value,
            "device_id": device.id if device else None,
            "last_check": last_check.isoformat() if last_check else None,
        },
        "options": options,
        "limits": {key: list(value) for key, value in LIMITS.items()},
        "defaults": {CONF_DELAY: DEFAULT_CYCLE_DELAY, CONF_OFF_TIME: DEFAULT_OFF_TIME},
        "power_cycles": _power_cycles(hass, entry, watchdog),
        "notify_options": _notify_options(hass, options[CONF_NOTIFY]),
        "integration_options": await _integration_options(hass, options[CONF_IGNORED]),
        "entry_options": _entry_options(hass, options[CONF_IGNORED_ENTRIES]),
        "pause_options": _pause_options(hass, options[CONF_PAUSE_ENTITY]),
        "device_options": _device_options(hass, device.id if device else None),
        "switch_options": _switch_options(hass),
    }


def _not_found(connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], {"ok": False, "error": "not_found"})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/settings"})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_settings(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    connection.send_result(msg["id"], await _settings(hass, _entry(hass)))


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/update_settings", **SETTINGS_SCHEMA})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_update_settings(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (entry := _entry(hass)) is None:
        _not_found(connection, msg)
        return
    form = {**_settings_options(entry), **{key: msg[key] for key in OPTION_DEFAULTS if key in msg}}
    if form[CONF_PAUSE_ENTITY] and form[CONF_PAUSE_ENTITY].split(".", 1)[0] not in PAUSE_DOMAINS:
        connection.send_result(msg["id"], {"ok": False, "error": "invalid_pause_entity"})
        return
    if errors := _errors(form):
        connection.send_result(msg["id"], {"ok": False, "error": next(iter(errors.values()))})
        return
    cycles = _cycles(entry)
    _update(hass, entry, _options(form) | ({CONF_POWER_CYCLES: cycles} if cycles else {}))
    connection.send_result(msg["id"], {"ok": True, "options": _settings_options(entry)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/add_power_cycle",
        vol.Required(CONF_DEVICE): str,
        vol.Required(CONF_SWITCH): vol.All(str, vol.Match(r"^switch\.")),
        vol.Optional(CONF_DELAY, default=DEFAULT_CYCLE_DELAY): _int(CONF_DELAY),
        vol.Optional(CONF_OFF_TIME, default=DEFAULT_OFF_TIME): _int(CONF_OFF_TIME),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_add_power_cycle(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (entry := _entry(hass)) is None:
        _not_found(connection, msg)
        return
    if dr.async_get(hass).async_get(msg[CONF_DEVICE]) is None:
        connection.send_result(msg["id"], {"ok": False, "error": "unknown_device"})
        return
    cycles = _cycles(entry)
    if errors := _cycle_errors(hass, cycles, msg):
        connection.send_result(msg["id"], {"ok": False, "error": next(iter(errors.values()))})
        return
    cycles.append({key: msg[key] for key in (CONF_DEVICE, CONF_SWITCH, CONF_DELAY, CONF_OFF_TIME)})
    _update(hass, entry, {**entry.options, CONF_POWER_CYCLES: cycles})
    connection.send_result(msg["id"], {"ok": True})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/remove_power_cycle", vol.Required(CONF_DEVICE): str})
@websocket_api.require_admin
@websocket_api.async_response
async def _ws_remove_power_cycle(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    if (entry := _entry(hass)) is None:
        _not_found(connection, msg)
        return
    cycles = [c for c in _cycles(entry) if c.get(CONF_DEVICE) != msg[CONF_DEVICE]]
    options = {k: v for k, v in entry.options.items() if k != CONF_POWER_CYCLES}
    _update(hass, entry, options | ({CONF_POWER_CYCLES: cycles} if cycles else {}))
    connection.send_result(msg["id"], {"ok": True})
