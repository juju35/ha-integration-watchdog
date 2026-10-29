# Changelog

## 0.5.1

### Fixes
- The integration icon is back in Settings → Devices & services: the release zip installed by HACS includes the brand images again.
- Changing the options no longer resets the last reload sensor (it went back to unknown) and its `reloads` total, which now really count since Home Assistant started.
- An unexpected error while handling one integration is logged and no longer stops the check of the others; the sensors and the Check now button are updated even when a check fails.
- The give-up notification gives the number of reloads actually done, instead of the current limit after it was lowered.
- Spanish: more natural wording of the reload notifications.

### Maintenance
- The list of unavailable integrations and the ignored domains are no longer stored in the recorder database at every check.
- A release is published only once the tests pass; the Ruff lint job uses the same Ruff version as pre-commit.

## 0.5.0

### What's new
- German and Spanish translations (configuration, options, entities, action, notifications).

### Maintenance
- Test checking that every translation has the same keys and placeholders as English.

## 0.4.3

### Fixes
- An integration that becomes available again while a check is reloading others is no longer reloaded (and its reload count no longer goes up).
- A notification translation with a broken placeholder no longer aborts the check: the raw text is sent and a warning is logged. A missing notification text is logged too.
- A scheduled check that queued behind another one no longer runs a second check right after it.
- Removing Integration Watchdog and adding it back while a check runs no longer allows two checks at the same time after the next options change.
- Removing Integration Watchdog now clears its state on Home Assistant versions before 2025.3 too.

### Maintenance
- HACS installs the release zip, which no longer contains the internal agent documentation and brand images.
- Release runs are serialized; lint and pre-commit config cleanup, Lint can be run manually; tests for the fixes.

## 0.4.2

### Fixes
- Disabling an integration resets its reload count right away. Before, the count was only reset if a check ran while it was disabled, so disabling and enabling it again within a few minutes left the watchdog given up on it.
- Removing Integration Watchdog during a check stops that check after the reload in progress, instead of going on reloading the other unavailable integrations while the removal waits.

### Maintenance
- Tests for the fixes; the duplication check runs on Node 22.

## 0.4.1

### Changes
- An integration you disable starts over once you enable it again: its reload count is reset, even if the watchdog had given up on it.
- An integration whose setup is still in progress, or that has no enabled entity with a state, is no longer taken as available again: it keeps its reload count until one of its entities is actually available.

### Fixes
- An integration whose reload went past the 5 minute timeout was reloaded forever, without the **Reloads in a row** limit: the watchdog now gives up on it as expected.
- The error of the `integration_watchdog.check` action when the watchdog is not loaded is translated.
- Removing the integration during a check waits for the check to end.

### Maintenance
- Tests run on Home Assistant 2026.10 and on the minimum version (2024.12), and fail on any deprecated Home Assistant call; new tests for the fixes.

## 0.4.0

### Changes
- Requires Home Assistant 2024.12 or later.
- The watchdog gives up on an integration only after the delay of its last reload: with the defaults (15 min grace period, 3 reloads), reloads at 0, 15 and 45 min and the give-up at 105 min, instead of 50 min.
- The reload count is reset only once the integration has stayed available for the current delay, so an integration that keeps dropping no longer starts over.
- Saving the options keeps the reload counts: an integration given up on stays so, and raising **Reloads in a row** gives it the extra reloads. A restart still starts over.
- Helpers (template, group, utility_meter…) are no longer reloaded: their entities follow their sources.
- The `integration_watchdog.check` action waits for a running check, then runs its own, instead of returning at once.

### Fixes
- A reload that never returns is stopped after 5 minutes instead of blocking every later check until a restart, and each notification call is limited to 30 s.
- The same integration is no longer reloaded twice while the watchdog reloads itself.

### Maintenance
- New pytest tests for the fixes; notification texts moved to the `common` translations section.
- CI hardening: actions pinned by commit SHA, read-only token, Dependabot for actions, duplication check with PR annotations.

## 0.3.2

### Maintenance
- Tooling only, no functional change: ruff/Biome/pre-commit, a Lint CI with duplication and dead-code checks, and internal modernizations.

## 0.3.1

### Maintenance
- README: **Prerequisites** and **Screenshots** sections, like the other repositories.

## 0.3.0

### What's new
- Integrations whose setup failed (`setup_retry`, `setup_error`) are watched too: listed when their entities are all unavailable, and reloaded like the others, which retries their setup right away instead of waiting for Home Assistant's next retry. The reload limit and notifications apply as usual.

## 0.2.2

### Fixes
- The grace period after startup is counted from when Home Assistant started, not from the watchdog's own reload: changing the options or installing an update no longer delays the reloads by a grace period. An integration already down for longer than the grace period is reloaded at the first check after the options are saved.

## 0.2.1

### Fixes
- Integrations whose entities were never created (device off or unreachable when the integration loaded, shown as "not provided") were ignored, so they were never reloaded. These entities now count as unavailable.

## 0.2.0

### What's new
- Notification for each reload, failed reload and give-up: a persistent notification per integration, and the notify actions chosen in the new **Notify actions** option.
- **Reloads in a row** option (3 by default): an integration that stays unavailable is reloaded again after the grace period, then twice the grace period, and so on; after the last reload the watchdog gives up on it until it recovers.
- The `integration_watchdog_reloaded` event carries `attempt` and `max_reloads`; the **Unavailable integrations** sensor lists `reloads` and `gave_up` for each integration.

### Fixes
- Nothing is reloaded while Home Assistant is starting or stopping, nor during the grace period after it has started, including from the button and the action.

## 0.1.0

### What's new
- First release: checks every loaded integration at a set interval and reloads those whose enabled entities are all `unavailable` for longer than the grace period.
- Integrations to ignore, chosen in the integration options among those set up (or typed as a domain).
- Check interval (5 minutes by default) and grace period (15 minutes by default) in the integration options.
- **Check now** button and `integration_watchdog.check` action (administrators only).
- **Unavailable integrations** sensor listing them, **Last reload** and **Last check** sensors, and an `integration_watchdog_reloaded` event for each reload.
- English and French.
