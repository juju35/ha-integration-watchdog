# Changelog

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
