"""Constants for Integration Watchdog."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "integration_watchdog"

CONF_SCAN_INTERVAL: Final = "scan_interval"
CONF_GRACE_PERIOD: Final = "grace_period"
CONF_IGNORED: Final = "ignored_integrations"

# Minutes between two checks.
DEFAULT_SCAN_INTERVAL: Final = 5
# Minutes every entity of an integration must have been unavailable before it is reloaded.
# Also the delay between two reloads of an integration that stays unavailable.
DEFAULT_GRACE_PERIOD: Final = 15
MAX_MINUTES: Final = 1440

SERVICE_CHECK: Final = "check"
EVENT_RELOADED: Final = f"{DOMAIN}_reloaded"
