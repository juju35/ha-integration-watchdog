"""Config flow for Integration Watchdog: a single entry, everything in the options."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)
from homeassistant.loader import async_get_integrations

from .const import (
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_SCAN_INTERVAL,
    DEFAULT_GRACE_PERIOD,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_MINUTES,
)


def _minutes() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(min=1, max=MAX_MINUTES, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="min")
    )


async def _schema(hass: HomeAssistant, current: dict[str, Any]) -> vol.Schema:
    """Interval, grace period, and the integrations to ignore among those set up."""
    ignored: list[str] = list(current.get(CONF_IGNORED, []))
    domains = {e.domain for e in hass.config_entries.async_entries() if e.domain != DOMAIN} | set(ignored)
    integrations = await async_get_integrations(hass, domains)
    options = sorted(
        (
            SelectOptionDict(
                value=domain,
                label=f"{getattr(integrations.get(domain), 'name', domain)} ({domain})",
            )
            for domain in domains
        ),
        key=lambda o: o["label"].casefold(),
    )
    return vol.Schema(
        {
            vol.Required(
                CONF_SCAN_INTERVAL, default=current.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            ): _minutes(),
            vol.Required(
                CONF_GRACE_PERIOD, default=current.get(CONF_GRACE_PERIOD, DEFAULT_GRACE_PERIOD)
            ): _minutes(),
            vol.Optional(CONF_IGNORED, default=ignored): SelectSelector(
                SelectSelectorConfig(
                    options=options, multiple=True, custom_value=True, mode=SelectSelectorMode.DROPDOWN
                )
            ),
        }
    )


def _options(user_input: dict[str, Any]) -> dict[str, Any]:
    return {
        CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL]),
        CONF_GRACE_PERIOD: int(user_input[CONF_GRACE_PERIOD]),
        CONF_IGNORED: sorted({d.strip() for d in user_input.get(CONF_IGNORED, []) if d.strip()}),
    }


class IntegrationWatchdogConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title="Integration Watchdog", data={}, options=_options(user_input))
        return self.async_show_form(step_id="user", data_schema=await _schema(self.hass, {}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return IntegrationWatchdogOptionsFlow()


class IntegrationWatchdogOptionsFlow(OptionsFlow):
    """Change the interval, the grace period and the ignored integrations."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(data=_options(user_input))
        return self.async_show_form(
            step_id="init", data_schema=await _schema(self.hass, dict(self.config_entry.options))
        )
