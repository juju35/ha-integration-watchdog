"""Tests for Integration Watchdog."""

from __future__ import annotations

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntryState
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED, STATE_UNAVAILABLE
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
    async_mock_service,
)

from custom_components.integration_watchdog import watchdog as watchdog_module
from custom_components.integration_watchdog.const import (
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_MAX_RELOADS,
    CONF_NOTIFY,
    CONF_SCAN_INTERVAL,
    DOMAIN,
    EVENT_RELOADED,
)

from .conftest import add_integration

UNAVAILABLE = "sensor.integration_watchdog_unavailable_integrations"
LAST_RELOAD = "sensor.integration_watchdog_last_reload"
LAST_CHECK = "sensor.integration_watchdog_last_check"
BUTTON = "button.integration_watchdog_check_now"
OPTIONS = {
    CONF_SCAN_INTERVAL: 5,
    CONF_GRACE_PERIOD: 15,
    CONF_MAX_RELOADS: 3,
    CONF_IGNORED: [],
    CONF_NOTIFY: [],
}


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
        {
            CONF_SCAN_INTERVAL: 10,
            CONF_GRACE_PERIOD: 30,
            CONF_MAX_RELOADS: 2,
            CONF_IGNORED: ["zha", "demo", " "],
            CONF_NOTIFY: ["mobile_app_phone"],
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["options"] == {
        CONF_SCAN_INTERVAL: 10,
        CONF_GRACE_PERIOD: 30,
        CONF_MAX_RELOADS: 2,
        CONF_IGNORED: ["demo", "zha"],
        CONF_NOTIFY: ["notify.mobile_app_phone"],
    }


async def test_single_instance(hass):
    await _setup(hass)
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.ABORT


async def test_options_flow(hass):
    entry = await _setup(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {CONF_SCAN_INTERVAL: 2, CONF_GRACE_PERIOD: 5, CONF_MAX_RELOADS: 3, CONF_IGNORED: ["mqtt"]},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options == {
        CONF_SCAN_INTERVAL: 2,
        CONF_GRACE_PERIOD: 5,
        CONF_MAX_RELOADS: 3,
        CONF_IGNORED: ["mqtt"],
        CONF_NOTIFY: [],
    }
    assert entry.state is ConfigEntryState.LOADED
    assert hass.states.get(UNAVAILABLE).attributes["ignored"] == ["mqtt"]


async def test_reloads_unavailable_integration_after_grace_period(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE, STATE_UNAVAILABLE])
    add_integration(hass, "partial", [STATE_UNAVAILABLE, "12"])
    add_integration(hass, "alive", ["on"])
    add_integration(hass, "empty", [])
    add_integration(hass, "unloaded", [STATE_UNAVAILABLE], state=ConfigEntryState.NOT_LOADED)
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


async def test_disabled_entities_are_skipped(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    entry = add_integration(hass, "mixed", [STATE_UNAVAILABLE])
    registry = er.async_get(hass)
    disabled = registry.async_get_or_create(
        "sensor", "mixed", "disabled", config_entry=entry, disabled_by=er.RegistryEntryDisabler.USER
    )
    hass.states.async_set(disabled.entity_id, "on")
    await _setup(hass)
    freezer.tick(timedelta(minutes=20))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
    reload.assert_awaited_once_with(entry.entry_id)


async def test_entities_not_provided_count_as_unavailable(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    """Loaded, but its entities were never created (device off): only "restored" placeholders."""
    entry = add_integration(hass, "printer", [])
    registry = er.async_get(hass)
    for i in range(3):
        entity = registry.async_get_or_create("sensor", "printer", f"p{i}", config_entry=entry)
        hass.states.async_set(entity.entity_id, STATE_UNAVAILABLE, {"restored": True, "supported_features": 0})
    await _setup(hass)
    freezer.tick(timedelta(minutes=15))
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

        # One grace period after the first reload, the button runs a check that reloads again.
        reload.reset_mock()
        freezer.tick(timedelta(minutes=1))
        await hass.services.async_call("button", "press", {"entity_id": BUTTON}, blocking=True)
        await hass.async_block_till_done()
        reload.assert_awaited_once_with(dead.entry_id)


async def test_unload(hass):
    entry = await _setup(hass)
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED


async def test_no_reload_while_starting(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    add_integration(hass, "dead", [STATE_UNAVAILABLE])
    hass.set_state(CoreState.starting)
    await _setup(hass)
    freezer.tick(timedelta(hours=1))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
        async_fire_time_changed(hass)
        await hass.async_block_till_done()
        reload.assert_not_awaited()
        assert hass.states.get(LAST_CHECK).state == "unknown"

        # Started: first check right away, but nothing reloaded during the grace period.
        hass.set_state(CoreState.running)
        hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
        await hass.async_block_till_done()
        reload.assert_not_awaited()
        assert hass.states.get(UNAVAILABLE).state == "1"

        freezer.tick(timedelta(minutes=15))
        await _check(hass)
        reload.assert_awaited_once()


async def test_backoff_and_give_up(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass)  # grace 15 min, 3 reloads
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        times = []
        # Checks every 5 minutes for 3 hours.
        for minute in range(0, 180, 5):
            count = reload.await_count
            await _check(hass)
            if reload.await_count > count:
                times.append(minute)
            freezer.tick(timedelta(minutes=5))
    # Reloads at 0, +15 min, +30 min (delay doubled), then never again.
    assert times == [0, 15, 45]
    assert reload.await_count == 3
    item = hass.states.get(UNAVAILABLE).attributes["integrations"][0]
    assert item["reloads"] == 3
    assert item["gave_up"] is True
    notifications = persistent_notification._async_get_or_create_notifications(hass)
    notification = notifications[f"{DOMAIN}_{dead.entry_id}"]
    assert "still unavailable after 3 reloads" in notification["message"]


async def test_recovery_resets_after_its_delay(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    entity_id = "sensor.dead_0"
    await _setup(hass, **{CONF_MAX_RELOADS: 1})
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
        assert reload.await_count == 1
        # Back for a moment long after the reload, then down again: the count is kept, no new reload.
        freezer.tick(timedelta(minutes=30))
        hass.states.async_set(entity_id, "1")
        await _check(hass)
        hass.states.async_set(entity_id, STATE_UNAVAILABLE)
        freezer.tick(timedelta(minutes=16))
        await _check(hass)
        assert reload.await_count == 1
        # Available for the delay, measured from its return: starts over.
        hass.states.async_set(entity_id, "1")
        await _check(hass)
        freezer.tick(timedelta(minutes=10))
        await _check(hass)
        freezer.tick(timedelta(minutes=5))
        await _check(hass)
        hass.states.async_set(entity_id, STATE_UNAVAILABLE)
        freezer.tick(timedelta(minutes=16))
        await _check(hass)
        assert reload.await_count == 2
        reload.assert_awaited_with(dead.entry_id)


async def test_gives_up_only_after_the_last_delay(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    """The give-up notification waits for the delay after the last reload."""
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass)  # grace 15 min, 3 reloads: at 0, 15, 45, then the last delay is 60 min
    freezer.tick(timedelta(minutes=15))
    key = f"{DOMAIN}_{dead.entry_id}"
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)):
        gave_up_at = None
        for minute in range(0, 180, 5):
            await _check(hass)
            item = hass.states.get(UNAVAILABLE).attributes["integrations"][0]
            if item["gave_up"] and gave_up_at is None:
                gave_up_at = minute
                message = persistent_notification._async_get_or_create_notifications(hass)[key]["message"]
                assert "still unavailable after 3 reloads" in message
            freezer.tick(timedelta(minutes=5))
    assert gave_up_at == 105


async def test_blip_after_give_up_keeps_the_count(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    add_integration(hass, "dead", [STATE_UNAVAILABLE])
    entity_id = "sensor.dead_0"
    await _setup(hass)
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        for _ in range(36):
            await _check(hass)
            freezer.tick(timedelta(minutes=5))
        assert reload.await_count == 3
        assert hass.states.get(UNAVAILABLE).attributes["integrations"][0]["gave_up"] is True
        # One check with the integration available, then down again for hours: nothing more.
        hass.states.async_set(entity_id, "1")
        await _check(hass)
        hass.states.async_set(entity_id, STATE_UNAVAILABLE)
        for _ in range(36):
            freezer.tick(timedelta(minutes=5))
            await _check(hass)
        assert reload.await_count == 3
        item = hass.states.get(UNAVAILABLE).attributes["integrations"][0]
        assert item["reloads"] == 3
        assert item["gave_up"] is True


async def _check_past_timeout(hass: HomeAssistant, freezer: FrozenDateTimeFactory, timeout: timedelta) -> None:
    """Run a check that hangs, and move the clock past `timeout` so that it gives up waiting."""
    task = hass.async_create_task(_check(hass))
    for _ in range(10):
        await asyncio.sleep(0)
    freezer.tick(timeout + timedelta(seconds=1))
    async_fire_time_changed(hass)
    await task


async def test_hung_reload_times_out(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    """A reload that never returns counts as failed and doesn't keep the check running."""
    add_integration(hass, "hung", [STATE_UNAVAILABLE])
    other = add_integration(hass, "other", [STATE_UNAVAILABLE])
    await _setup(hass)
    events = async_capture_events(hass, EVENT_RELOADED)
    freezer.tick(timedelta(minutes=15))
    release = asyncio.Event()

    async def reload_side_effect(entry_id):
        if entry_id != other.entry_id:
            await release.wait()
        return True

    with patch.object(hass.config_entries, "async_reload", AsyncMock(side_effect=reload_side_effect)):
        await _check_past_timeout(hass, freezer, watchdog_module.RELOAD_TIMEOUT)
        assert [(e.data["domain"], e.data["success"]) for e in events] == [("hung", False), ("other", True)]
        assert not hass.config_entries.async_entries(DOMAIN)[0].runtime_data.running
        assert hass.states.get(BUTTON).state != "unavailable"
        release.set()
        await hass.async_block_till_done(wait_background_tasks=True)


async def test_hung_notifier_times_out(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    add_integration(hass, "dead", [STATE_UNAVAILABLE])
    release = asyncio.Event()

    async def hang(_call):
        await release.wait()

    hass.services.async_register("notify", "stuck", hang)
    await _setup(hass, **{CONF_NOTIFY: ["notify.stuck"]})
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check_past_timeout(hass, freezer, watchdog_module.NOTIFY_TIMEOUT)
    reload.assert_awaited_once()
    assert not hass.config_entries.async_entries(DOMAIN)[0].runtime_data.running
    release.set()
    await hass.async_block_till_done()


async def test_helpers_are_not_reloaded(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    add_integration(hass, "template", [STATE_UNAVAILABLE])
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass)
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
    reload.assert_awaited_once_with(dead.entry_id)
    assert [i["domain"] for i in hass.states.get(UNAVAILABLE).attributes["integrations"]] == ["dead"]


async def test_notifications(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    calls = async_mock_service(hass, "notify", "mobile_app_phone")
    await _setup(hass, **{CONF_NOTIFY: ["notify.mobile_app_phone", "notify.missing"]})
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)):
        await _check(hass)
    notification = persistent_notification._async_get_or_create_notifications(hass)[f"{DOMAIN}_{dead.entry_id}"]
    assert notification["title"] == "Integration reloaded"
    assert notification["message"].startswith("Dead (dead) was reloaded")
    assert "Reload 1/3" in notification["message"]
    assert len(calls) == 1
    assert calls[0].data == {"title": "Integration reloaded", "message": notification["message"]}


async def test_failed_reload_notification(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    await _setup(hass)
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=False)):
        await _check(hass)
    notification = persistent_notification._async_get_or_create_notifications(hass)[f"{DOMAIN}_{dead.entry_id}"]
    assert notification["title"] == "Integration reload failed"


async def test_options_change_keeps_the_grace_from_the_states(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    """Changing the options reloads the watchdog: an integration already down long enough is reloaded right away."""
    dead = add_integration(hass, "dead", [STATE_UNAVAILABLE])
    entry = await _setup(hass)
    freezer.tick(timedelta(minutes=10))
    real_reload = hass.config_entries.async_reload

    async def reload_side_effect(entry_id):
        return True if entry_id == dead.entry_id else await real_reload(entry_id)

    with patch.object(hass.config_entries, "async_reload", AsyncMock(side_effect=reload_side_effect)) as reload:
        result = await hass.config_entries.options.async_init(entry.entry_id)
        await hass.config_entries.options.async_configure(
            result["flow_id"],
            {CONF_SCAN_INTERVAL: 5, CONF_GRACE_PERIOD: 1, CONF_MAX_RELOADS: 3, CONF_IGNORED: []},
        )
        await hass.async_block_till_done()
    # The watchdog's first check after its own reload reloads the integration right away.
    reload.assert_any_await(dead.entry_id)


async def test_setup_retry_and_error_are_watched(hass: HomeAssistant, freezer: FrozenDateTimeFactory):
    retry = add_integration(hass, "retry", [STATE_UNAVAILABLE], state=ConfigEntryState.SETUP_RETRY)
    error = add_integration(hass, "error", [STATE_UNAVAILABLE], state=ConfigEntryState.SETUP_ERROR)
    await _setup(hass)
    assert {i["domain"] for i in hass.states.get(UNAVAILABLE).attributes["integrations"]} == {
        "retry",
        "error",
    }
    freezer.tick(timedelta(minutes=15))
    with patch.object(hass.config_entries, "async_reload", AsyncMock(return_value=True)) as reload:
        await _check(hass)
    assert {c.args[0] for c in reload.await_args_list} == {retry.entry_id, error.entry_id}
