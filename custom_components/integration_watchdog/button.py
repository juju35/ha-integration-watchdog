"""Button that runs a check now."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import IntegrationWatchdogConfigEntry
from .entity import IntegrationWatchdogEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: IntegrationWatchdogConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([CheckButton(entry.runtime_data, entry.entry_id, "check")])


class CheckButton(IntegrationWatchdogEntity, ButtonEntity):
    """Check the integrations now and reload those past the grace period."""

    @property
    def available(self) -> bool:
        return not self.watchdog.running

    async def async_press(self) -> None:
        await self.watchdog.async_check()
