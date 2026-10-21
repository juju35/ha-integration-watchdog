"""Fixtures for Integration Watchdog tests."""

from __future__ import annotations

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Load custom_components/ in every test."""
    yield


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
            "sensor", domain, f"{domain}_{i}", config_entry=entry, suggested_object_id=f"{domain}_{i}"
        )
        hass.states.async_set(entity.entity_id, value)
    return entry
