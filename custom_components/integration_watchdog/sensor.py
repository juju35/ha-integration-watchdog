"""Sensors: unavailable integrations, last reload and last check."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import IntegrationWatchdogConfigEntry
from .const import DOMAIN
from .entity import IntegrationWatchdogEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    w = entry.runtime_data
    async_add_entities(
        [
            UnavailableSensor(w, entry.entry_id, "unavailable"),
            LastReloadSensor(w, entry.entry_id, "last_reload"),
            LastCheckSensor(w, entry.entry_id, "last_check"),
        ]
    )


class UnavailableSensor(IntegrationWatchdogEntity, SensorEntity):
    """Number of integrations whose entities are all unavailable, listed in the attributes."""

    _attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> int | None:
        return None if self.watchdog.last_check is None else len(self.watchdog.unavailable)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "integrations": [u.as_dict() for u in self.watchdog.unavailable],
            "ignored": sorted(self.watchdog.ignored - {DOMAIN}),
        }


class LastReloadSensor(IntegrationWatchdogEntity, SensorEntity):
    """Time of the last reload, with the integration reloaded."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self) -> datetime | None:
        return self.watchdog.last_reload.at if self.watchdog.last_reload else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        r = self.watchdog.last_reload
        return {
            "domain": r.domain if r else None,
            "title": r.title if r else None,
            "entry_id": r.entry_id if r else None,
            "success": r.success if r else None,
            "reloads": self.watchdog.reloads,
        }


class LastCheckSensor(IntegrationWatchdogEntity, SensorEntity):
    """End of the last check."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    @property
    def native_value(self) -> datetime | None:
        return self.watchdog.last_check
