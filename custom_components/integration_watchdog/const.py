"""Constants for Integration Watchdog."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "integration_watchdog"
# Same as manifest.json and the card: the card URL carries it, so that browsers load a new release.
VERSION: Final = "0.6.0"

CONF_SCAN_INTERVAL: Final = "scan_interval"
CONF_GRACE_PERIOD: Final = "grace_period"
CONF_IGNORED: Final = "ignored_integrations"
CONF_MAX_RELOADS: Final = "max_reloads"
CONF_NOTIFY: Final = "notify_services"

# Minutes between two checks.
DEFAULT_SCAN_INTERVAL: Final = 5
# Minutes every entity of an integration must have been unavailable before it is reloaded.
DEFAULT_GRACE_PERIOD: Final = 15
MAX_MINUTES: Final = 1440
# Reloads in a row of an integration that stays unavailable, before giving up until it recovers.
# The delay between two of them doubles each time: grace, 2 x grace, 4 x grace...
DEFAULT_MAX_RELOADS: Final = 3
MAX_MAX_RELOADS: Final = 10

SERVICE_CHECK: Final = "check"
EVENT_RELOADED: Final = f"{DOMAIN}_reloaded"

# The card bundled with the integration, served by Home Assistant and added to the dashboard resources.
CARD_URL: Final = f"/{DOMAIN}/integration-watchdog-card.js"

# Recent reloads (and give-ups) kept for the card, newest first, saved across restarts.
HISTORY_SIZE: Final = 20
STORAGE_KEY: Final = f"{DOMAIN}.history"
STORAGE_VERSION: Final = 1
