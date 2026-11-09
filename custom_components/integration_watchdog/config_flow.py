"""Config flow for Integration Watchdog: a single entry, everything in the options."""

from __future__ import annotations

import re
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
)
from homeassistant.loader import async_get_integrations

from .const import (
    CONF_GRACE_OVERRIDES,
    CONF_GRACE_PERIOD,
    CONF_IGNORED,
    CONF_IGNORED_ENTRIES,
    CONF_MAX_RELOADS,
    CONF_NOTIFY,
    CONF_PAUSE_ENTITY,
    CONF_SCAN_INTERVAL,
    DEFAULT_GRACE_PERIOD,
    DEFAULT_MAX_RELOADS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_MAX_RELOADS,
    MAX_MINUTES,
    PAUSE_DOMAINS,
)

_OVERRIDE_LINE = re.compile(r"^\s*([a-z0-9_]+)\s*[:=]\s*(\d+)\s*$")


def parse_overrides(text: str) -> dict[str, int]:
    """One "domain: minutes" per line (or comma separated); raises ValueError on a line that isn't."""
    overrides: dict[str, int] = {}
    for line in re.split(r"[\n,]", text or ""):
        if not line.strip():
            continue
        match = _OVERRIDE_LINE.match(line.strip().lower())
        if not match or not 1 <= int(match[2]) <= MAX_MINUTES:
            raise ValueError(line.strip())
        overrides[match[1]] = int(match[2])
    return dict(sorted(overrides.items()))


def format_overrides(overrides: dict[str, int]) -> str:
    return "\n".join(f"{domain}: {minutes}" for domain, minutes in sorted(overrides.items()))


def _minutes() -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(min=1, max=MAX_MINUTES, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="min")
    )


async def _schema(hass: HomeAssistant, current: dict[str, Any]) -> vol.Schema:
    """Interval, grace period, reload limit, integrations to ignore and notify actions."""
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
    # Single config entries: "Title (domain)", the ones already ignored kept even when removed since.
    ignored_entries: list[str] = list(current.get(CONF_IGNORED_ENTRIES, []))
    entries = {e.entry_id: e for e in hass.config_entries.async_entries() if e.domain != DOMAIN}
    entry_options = sorted(
        (
            SelectOptionDict(
                value=entry_id,
                label=f"{entries[entry_id].title} ({entries[entry_id].domain})" if entry_id in entries else entry_id,
            )
            for entry_id in set(entries) | set(ignored_entries)
        ),
        key=lambda o: o["label"].casefold(),
    )
    notify: list[str] = list(current.get(CONF_NOTIFY, []))
    notify_options = sorted(
        {f"notify.{name}" for name in hass.services.async_services_for_domain("notify")}
        - {"notify.send_message", "notify.persistent_notification"}
        | set(notify)
    )
    return vol.Schema(
        {
            vol.Required(
                CONF_SCAN_INTERVAL, default=current.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            ): _minutes(),
            vol.Required(CONF_GRACE_PERIOD, default=current.get(CONF_GRACE_PERIOD, DEFAULT_GRACE_PERIOD)): _minutes(),
            vol.Optional(
                CONF_GRACE_OVERRIDES,
                description={"suggested_value": format_overrides(current.get(CONF_GRACE_OVERRIDES, {}))},
            ): TextSelector(TextSelectorConfig(multiline=True)),
            vol.Required(CONF_MAX_RELOADS, default=current.get(CONF_MAX_RELOADS, DEFAULT_MAX_RELOADS)): NumberSelector(
                NumberSelectorConfig(min=1, max=MAX_MAX_RELOADS, step=1, mode=NumberSelectorMode.BOX)
            ),
            vol.Optional(CONF_IGNORED, default=ignored): SelectSelector(
                SelectSelectorConfig(
                    options=options,
                    multiple=True,
                    custom_value=True,
                    mode=SelectSelectorMode.DROPDOWN,
                )
            ),
            vol.Optional(CONF_IGNORED_ENTRIES, default=ignored_entries): SelectSelector(
                SelectSelectorConfig(options=entry_options, multiple=True, mode=SelectSelectorMode.DROPDOWN)
            ),
            vol.Optional(
                CONF_PAUSE_ENTITY, description={"suggested_value": current.get(CONF_PAUSE_ENTITY)}
            ): EntitySelector(EntitySelectorConfig(domain=PAUSE_DOMAINS)),
            vol.Optional(CONF_NOTIFY, default=notify): SelectSelector(
                SelectSelectorConfig(
                    options=notify_options,
                    multiple=True,
                    custom_value=True,
                    mode=SelectSelectorMode.DROPDOWN,
                )
            ),
        }
    )


def _options(user_input: dict[str, Any]) -> dict[str, Any]:
    overrides = parse_overrides(user_input.get(CONF_GRACE_OVERRIDES, ""))
    # Ignored single entries only when some are chosen: existing entries keep the options they had.
    entries = sorted(set(user_input.get(CONF_IGNORED_ENTRIES, [])))
    return (
        ({CONF_IGNORED_ENTRIES: entries} if entries else {})
        | {
            CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL]),
            CONF_GRACE_PERIOD: int(user_input[CONF_GRACE_PERIOD]),
            CONF_MAX_RELOADS: int(user_input[CONF_MAX_RELOADS]),
            CONF_IGNORED: sorted({d.strip() for d in user_input.get(CONF_IGNORED, []) if d.strip()}),
            CONF_NOTIFY: sorted(
                {f"notify.{n.strip().removeprefix('notify.')}" for n in user_input.get(CONF_NOTIFY, []) if n.strip()}
            ),
        }
        | ({CONF_PAUSE_ENTITY: user_input[CONF_PAUSE_ENTITY]} if user_input.get(CONF_PAUSE_ENTITY) else {})
        | ({CONF_GRACE_OVERRIDES: overrides} if overrides else {})
    )


def _errors(user_input: dict[str, Any]) -> dict[str, str]:
    try:
        parse_overrides(user_input.get(CONF_GRACE_OVERRIDES, ""))
    except ValueError:
        return {CONF_GRACE_OVERRIDES: "invalid_overrides"}
    return {}


class IntegrationWatchdogConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the config flow."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        errors = _errors(user_input) if user_input is not None else {}
        if user_input is not None and not errors:
            return self.async_create_entry(title="Integration Watchdog", data={}, options=_options(user_input))
        schema = await _schema(self.hass, {})
        if user_input is not None:
            schema = self.add_suggested_values_to_schema(schema, user_input)
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return IntegrationWatchdogOptionsFlow()


class IntegrationWatchdogOptionsFlow(OptionsFlow):
    """Change the interval, the grace period and the ignored integrations."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        errors = _errors(user_input) if user_input is not None else {}
        if user_input is not None and not errors:
            return self.async_create_entry(data=_options(user_input))
        schema = await _schema(self.hass, dict(self.config_entry.options))
        if user_input is not None:
            schema = self.add_suggested_values_to_schema(schema, user_input)
        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)
