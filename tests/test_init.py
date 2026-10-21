"""Tests for Integration Watchdog."""

from __future__ import annotations

from datetime import timedelta
from unittest.mock import AsyncMock, patch

from freezegun.api import FrozenDateTimeFactory
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er

from custom_components.integration_watchdog.const import (
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_SCAN_INTERVAL,
    DOMAIN,
    EVENT_RELOADED,
)

from .conftest import add_integration

UNAVAILABLE = "sensor.integration_watchdog_unavailable_integrations"
LAST_RELOAD = "sensor.integration_watchdog_last_reload"
LAST_CHECK = "sensor.integration_watchdog_last_check"
BUTTON = "button.integration_watchdog_check_now"
OPTIONS = {CONF_SCAN_INTERVAL: 5, CONF_GRACE_PERIOD: 15, CONF_IGNORED: []}


async def _setup(hass: HomeAssistant, **options) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN, options={**OPTIONS, **options})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _check(hass: HomeAssistant) -> None:
    await hass.services.async_call(DOMAIN, "check", {}, blocking=True)
    await hass.async_block_till_done()


async def test_config_flow(hass):
    add_integration(hass, "demo", ["on"])
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"],
        {CONF_SCAN_INTERVAL: 10, CONF_GRACE_PERIOD: 30, CONF_IGNORED: ["zha", "demo", " "]},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["options"] == {CONF_SCAN_INTERVAL: 10, CONF_GRACE_PERIOD: 30, CONF_IGNORED: ["demo", "zha"]}


async def test_single_instance(hass):
    await _setup(hass)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.ABORT


async def test_options_flow(hass):
    entry = await _setup(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_SCAN_INTERVAL: 2, CONF_GRACE_PERIOD: 5, CONF_IGNORED: ["mqtt"]}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options == {CONF_SCAN_INTERVAL: 2, CONF_GRACE_PERIOD: 5, CONF_IGNORED: ["mqtt"]}
    assert entry.state is ConfigEntryState.LOADED
    assert hass.states.get(UNAVAILABLE).attributes["ignored"] == ["mqtt"]


async def test_reloads_unavailable_integration_after_grace_period(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE, STATE_UNAVAILABLE])
    add_integration(hass, "partial", [STATE_UNAVAILABLE, "12"])
    add_integration(hass, "alive", ["on"])
    add_integration(hass, "empty", [])
    add_integration(hass, "failed", [STATE_UNAVAILABLE], state=ConfigEntryState.SETUP_RETRY)
    await _setup(hass)
    events = async_capture_events(hass, EVENT_RELOADED)

    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        # Within the grace period: listed, not reloaded.
        await _check(hass)
        reload.assert_not_awaited()
        state = hass.states.get(UNAVAILABLE)
        assert state.state == "1"
        assert [i["domain"] for i in state.attributes["integrations"]] == ["dead"]

        freezer.tick(timedelta(minutes=15))
        await _check(hass)
        reload.assert_awaited_once_with(dead.entry_id)

    assert len(events) == 1
    assert events[0].data["domain"] == "dead"
    assert events[0].data["success"] is True
    state = hass.states.get(LAST_RELOAD)
    assert state.state not in ("unknown", "unavailable")
    assert state.attributes["domain"] == "dead"
    assert state.attributes["reloads"] == 1
    assert hass.states.get(LAST_CHECK).state not in ("unknown", "unavailable")


async def test_ignored_integration(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass, **{CONF_IGNORED: ["dead"]})
    freezer.tick(timedelta(hours=1))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
    reload.assert_not_awaited()
    assert hass.states.get(UNAVAILABLE).state == "0"


async def test_disabled_and_restored_entities_are_skipped(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    entry = add_integration(hass, "mixed", [STATE_UNAVAILABLE])
    registry = er.async_get(hass)
    disabled = registry.async_get_or_create(
        "sensor", "mixed", "disabled", config_entry=entry, disabled_by=er.RegistryEntryDisabler.USER
    )
    hass.states.async_set(disabled.entity_id, "on")
    orphan = registry.async_get_or_create("sensor", "mixed", "orphan", config_entry=entry)
    hass.states.async_set(orphan.entity_id, "on", {"restored": True})
    await _setup(hass)
    freezer.tick(timedelta(minutes=20))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
    reload.assert_awaited_once_with(entry.entry_id)


async def test_failed_reload_does_not_stop_the_others(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    first = add_integration(hass, "aaa", [STATE_UNAVAILABLE])
    second = add_integration(hass, "bbb", [STATE_UNAVAILABLE])
    await _setup(hass)
    events = async_capture_events(hass, EVENT_RELOADED)
    freezer.tick(timedelta(minutes=20))
    with patch.object(
        hass.config_entries, "async_reload", AsyncMock(side_effect=[RuntimeError("boom"), True])
    ) as reload:
        await _check(hass)
    assert [c.args[0] for c in reload.await_args_list] == [first.entry_id, second.entry_id]
    assert [e.data["success"] for e in events] == [False, True]
    assert hass.states.get(LAST_RELOAD).attributes["reloads"] == 2


async def test_scheduled_check_and_button(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass, **{CONF_SCAN_INTERVAL: 1, CONF_GRACE_PERIOD: 1})
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        freezer.tick(timedelta(minutes=1, seconds=1))
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
        reload.assert_awaited_once_with(dead.entry_id)

        reload.reset_mock()
        await hass.services.async_call("button", "press", {"entity_id": BUTTON}, blocking=True)
        await hass.async_block_till_done()
        # Entities untouched by the mocked reload: still past the grace period.
        reload.assert_awaited_once_with(dead.entry_id)


async def test_unload(hass):
    entry = await _setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED
