"""Base entity: one service device, entities refreshed after every check."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .watchdog import IntegrationWatchdog


class IntegrationWatchdogEntity(Entity):
    """Shared device and check listener."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, watchdog: IntegrationWatchdog, entry_id: str, key: str) -> None:
        self.watchdog = watchdog
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry_id)},
            name="Integration Watchdog",
            manufacturer="juju35",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://github.com/juju35/ha-integration-watchdog",
        )

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(self.watchdog.async_add_listener(self.async_write_ha_state))
