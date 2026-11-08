"""Repairs: "Try again" on an integration the watchdog gave up on."""

from __future__ import annotations

from typing import Any

from homeassistant import data_entry_flow
from homeassistant.components.repairs import RepairsFlow
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import issue_registry as ir

from . import _loaded_watchdog
from .const import ATTR_ENTRY_ID, DOMAIN


class GaveUpRepairFlow(RepairsFlow):
    """Confirm, then start over for the integration and reload it now."""

    def __init__(self, entry_id: str) -> None:
        self._entry_id = entry_id

    async def async_step_init(self, user_input: dict[str, str] | None = None) -> data_entry_flow.FlowResult:
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input: dict[str, str] | None = None) -> data_entry_flow.FlowResult:
        if user_input is None:
            issue = ir.async_get(self.hass).async_get_issue(DOMAIN, self.issue_id)
            return self.async_show_form(
                step_id="confirm", description_placeholders=issue.translation_placeholders if issue else None
            )
        try:
            watchdog = _loaded_watchdog(self.hass)
        except HomeAssistantError:
            return self.async_abort(reason="not_loaded")
        # The counts are reset (and the issue deleted) even when the reload fails: the watchdog starts over.
        if not await watchdog.async_reset(self._entry_id):
            return self.async_abort(reason="reload_failed")
        return self.async_create_entry(data={})


async def async_create_fix_flow(hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None) -> RepairsFlow:
    return GaveUpRepairFlow((data or {}).get(ATTR_ENTRY_ID) or issue_id.removeprefix("gave_up_"))
