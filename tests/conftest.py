"""Fixtures for Integration Watchdog tests."""

from __future__ import annotations

import logging
import os

import pytest
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import frame
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.integration_watchdog.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Load custom_components/ in every test."""
    yield


class _DeprecationRecorder(logging.Handler):
    """Collects Home Assistant deprecation reports that name this integration."""

    def __init__(self) -> None:
        super().__init__(logging.WARNING)
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        message = record.getMessage()
        lowered = message.lower()
        reported = record.name == frame.__name__ or "deprecated" in lowered or "will stop working" in lowered
        if reported and (f"'{DOMAIN}'" in message or f"custom_components/{DOMAIN}/" in message):
            self.messages.append(message)


@pytest.fixture(autouse=True)
def no_deprecated_calls():
    """Fail a test whose code path makes Home Assistant report a deprecated call of this integration.

    Silent on Home Assistant versions without the deprecation; on newer ones, catches what is left.
    Messages also go to $DEPRECATIONS_LOG (if set), which CI turns into annotations.
    """
    # The frame helper reports each call site once per process: forget them so every test sees its own.
    getattr(frame, "_REPORTED_INTEGRATIONS", set()).clear()
    recorder = _DeprecationRecorder()
    root = logging.getLogger()
    root.addHandler(recorder)
    try:
        yield
    finally:
        root.removeHandler(recorder)
    if recorder.messages and (path := os.environ.get("DEPRECATIONS_LOG")):
        with open(path, "a", encoding="utf-8") as log:
            log.writelines(f"{m}\n" for m in recorder.messages)
    assert not recorder.messages, "\n".join(recorder.messages)


def add_integration(
    hass: HomeAssistant,
    domain: str,
    states: list[str],
    state: ConfigEntryState = ConfigEntryState.LOADED,
) -> MockConfigEntry:
    """A config entry in `state` with one sensor per item of `states`."""
    entry = MockConfigEntry(domain=domain, title=domain.title())
    entry.add_to_hass(hass)
    entry.mock_state(hass, state)
    registry = er.async_get(hass)
    for i, value in enumerate(states):
        entity = registry.async_get_or_create(
            "sensor",
            domain,
            f"{domain}_{i}",
            config_entry=entry,
            suggested_object_id=f"{domain}_{i}",
        )
        hass.states.async_set(entity.entity_id, value)
    return entry
