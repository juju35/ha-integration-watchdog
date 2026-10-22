# Changelog

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
