"""The sidebar panel and its WebSocket commands (administrators only)."""

from __future__ import annotations

from homeassistant.components import frontend
from homeassistant.const import STATE_ON, STATE_UNAVAILABLE, EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.integration_watchdog.const import (
    CONF_GRACE_OVERRIDES,
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_MAX_RELOADS,
    CONF_NOTIFY,
    CONF_POWER_CYCLES,
    CONF_SCAN_INTERVAL,
    DOMAIN,
    PANEL_PATH,
)

OPTIONS = {CONF_SCAN_INTERVAL: 5, CONF_GRACE_PERIOD: 15, CONF_MAX_RELOADS: 3, CONF_IGNORED: [], CONF_NOTIFY: []}


async def _setup(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN, options={**OPTIONS, **options})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _device(hass: HomeAssistant, state: str) -> str:
    box = MockConfigEntry(domain="box", title="Box")
    box.add_to_hass(hass)
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=box.entry_id, identifiers={("box", "1")}, name="Internet box"
    )
    entity = er.async_get(hass).async_get_or_create(
        "sensor", "box", "box_0", config_entry=box, device_id=device.id, suggested_object_id="box_0"
    )
    hass.states.async_set(entity.entity_id, state)
    hass.states.async_set("switch.box_plug", STATE_ON, {"friendly_name": "Box plug"})
    return device.id


async def _ws(client, **msg):
    await client.send_json_auto_id(msg)
    response = await client.receive_json()
    assert response["success"], response
    return response["result"]


async def test_panel_registered_for_admins(hass: HomeAssistant):
    await _setup(hass)
    panel = hass.data[frontend.DATA_PANELS][PANEL_PATH]
    assert panel.require_admin
    assert panel.config["_panel_custom"]["name"] == "integration-watchdog-panel"


async def test_settings_and_update(hass: HomeAssistant, hass_ws_client):
    device_id = _device(hass, STATE_UNAVAILABLE)
    entry = await _setup(
        hass,
        grace_overrides={"zha": 30},
        power_cycles=[{"device_id": device_id, "switch": "switch.box_plug", "delay": 10, "off_time": 15}],
    )
    hass.states.async_set("input_boolean.maintenance", "off", {"friendly_name": "Maintenance"})
    client = await hass_ws_client(hass)

    result = await _ws(client, type=f"{DOMAIN}/settings")
    assert result["entry"]["state"] == "loaded"
    assert result["options"][CONF_GRACE_OVERRIDES] == "zha: 30"
    assert result["options"]["pause_entity"] is None
    assert result["limits"]["off_time"] == [1, 300]
    assert result["power_cycles"] == [
        {
            "device_id": device_id,
            "device_name": "Internet box",
            "area": None,
            "switch": "switch.box_plug",
            "switch_name": "Box plug",
            "switch_state": "on",
            "delay": 10,
            "off_time": 15,
            "unavailable": True,
            "count": 0,
            "gave_up": False,
        }
    ]
    assert {"value": device_id, "label": "Internet box", "detail": "box", "area": ""} in result["device_options"]
    # The watchdog's own service device is not offered.
    assert all(o["label"] != "Integration Watchdog" for o in result["device_options"])
    assert result["switch_options"][0]["value"] == "switch.box_plug"
    assert result["switch_options"][0]["outlet"] is False
    assert {"value": "input_boolean.maintenance", "label": "Maintenance"} in result["pause_options"]
    assert {"value": "box", "label": "box"} in result["integration_options"]

    # Invalid overrides and pause entity: refused, nothing stored.
    assert (await _ws(client, type=f"{DOMAIN}/update_settings", grace_overrides="zha"))["error"] == "invalid_overrides"
    bad = await _ws(client, type=f"{DOMAIN}/update_settings", pause_entity="light.kitchen")
    assert bad["error"] == "invalid_pause_entity"

    result = await _ws(
        client,
        type=f"{DOMAIN}/update_settings",
        max_reloads=5,
        grace_overrides="tuya: 90\nzha: 30",
        pause_entity="input_boolean.maintenance",
    )
    await hass.async_block_till_done()
    assert result["ok"]
    assert entry.options[CONF_MAX_RELOADS] == 5
    assert entry.options[CONF_GRACE_OVERRIDES] == {"tuya": 90, "zha": 30}
    assert entry.options["pause_entity"] == "input_boolean.maintenance"
    # The power cycles are kept.
    assert len(entry.options[CONF_POWER_CYCLES]) == 1

    # Back to no pause entity, overrides cleared.
    await _ws(client, type=f"{DOMAIN}/update_settings", pause_entity=None, grace_overrides="")
    await hass.async_block_till_done()
    assert "pause_entity" not in entry.options
    assert CONF_GRACE_OVERRIDES not in entry.options


async def test_add_and_remove_power_cycle(hass: HomeAssistant, hass_ws_client):
    device_id = _device(hass, "12")
    entry = await _setup(hass)
    client = await hass_ws_client(hass)
    add = {"type": f"{DOMAIN}/add_power_cycle", "device_id": device_id, "switch": "switch.box_plug", "off_time": 20}

    assert (await _ws(client, **{**add, "device_id": "nope"}))["error"] == "unknown_device"
    assert (await _ws(client, **add))["ok"]
    await hass.async_block_till_done()
    assert entry.options[CONF_POWER_CYCLES] == [
        {"device_id": device_id, "switch": "switch.box_plug", "delay": 10, "off_time": 20}
    ]
    assert entry.runtime_data.power_cycles[0].device_id == device_id
    assert (await _ws(client, **add))["error"] == "device_already_cycled"

    assert (await _ws(client, type=f"{DOMAIN}/remove_power_cycle", device_id=device_id))["ok"]
    await hass.async_block_till_done()
    assert CONF_POWER_CYCLES not in entry.options
    assert entry.options[CONF_MAX_RELOADS] == 3


async def test_commands_without_entry(hass: HomeAssistant, hass_ws_client):
    entry = await _setup(hass)
    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()
    client = await hass_ws_client(hass)
    assert (await _ws(client, type=f"{DOMAIN}/settings"))["entry"] is None
    assert (await _ws(client, type=f"{DOMAIN}/update_settings", max_reloads=2))["error"] == "not_found"
    assert (await _ws(client, type=f"{DOMAIN}/remove_power_cycle", device_id="x"))["error"] == "not_found"


async def test_commands_need_an_admin(hass: HomeAssistant, hass_ws_client, hass_read_only_access_token):
    await _setup(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/settings"})
    response = await client.receive_json()
    assert not response["success"]
    assert response["error"]["code"] == "unauthorized"


async def test_switch_options_leave_out_config_switches(hass: HomeAssistant, hass_ws_client):
    """A configuration or diagnostic switch is never a power plug; an outlet is flagged, with its device and area."""
    await _setup(hass)
    plugs = MockConfigEntry(domain="plugs", title="Plugs")
    plugs.add_to_hass(hass)
    area = ar.async_get(hass).async_create("Office")
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=plugs.entry_id, identifiers={("plugs", "1")}, name="Smart plug"
    )
    dr.async_get(hass).async_update_device(device.id, area_id=area.id)
    registry = er.async_get(hass)
    outlet = registry.async_get_or_create(
        "switch", "plugs", "outlet", config_entry=plugs, device_id=device.id, original_device_class="outlet"
    )
    lock = registry.async_get_or_create(
        "switch", "plugs", "lock", config_entry=plugs, device_id=device.id, entity_category=EntityCategory.CONFIG
    )
    hass.states.async_set(outlet.entity_id, STATE_ON, {"friendly_name": "Office plug"})
    hass.states.async_set(lock.entity_id, STATE_ON, {"friendly_name": "Child lock"})
    client = await hass_ws_client(hass)

    options = (await _ws(client, type=f"{DOMAIN}/settings"))["switch_options"]
    assert [o["value"] for o in options] == [outlet.entity_id]
    assert options[0] == {
        "value": outlet.entity_id,
        "label": "Office plug",
        "detail": "Smart plug",
        "area": "Office",
        "device_id": device.id,
        "outlet": True,
    }
