# Integration Watchdog — Agent Context

## Purpose
Home Assistant custom integration that reloads the integrations (config entries) whose enabled entities are all `unavailable`, except the domains listed in the options.

## Architecture

```
custom_components/integration_watchdog/
├── __init__.py      # Action check (admin), entry setup, time interval, first check once HA has started
├── watchdog.py      # IntegrationWatchdog: finds unavailable entries, reloads with backoff and limit, event + notifications
├── config_flow.py   # Single entry; options: scan_interval, grace_period (min), max_reloads, ignored_integrations (domains), notify_services
├── button.py        # button.*_check_now (unavailable while a check runs)
├── sensor.py        # unavailable (count + integrations/ignored), last_reload (+ domain/title/success/reloads), last_check
├── entity.py        # Shared service device, listener on IntegrationWatchdog
├── const.py / icons.json / services.yaml / translations/{en,fr}.json / brand/
```

## Rules
- An entry counts only when LOADED, SETUP_RETRY or SETUP_ERROR (`WATCHED_STATES`), not ignored, not this domain, not a helper (`integration_type == "helper"`, cached per domain), with at least one enabled entity that has a state. `restored: true` placeholders (entities the integration didn't create, e.g. device off at setup) count as unavailable: an entry with only those is the typical broken one.
- Never reload during startup/shutdown: `async_check` returns unless `CoreState.running`, stops mid-check if that changes, and reloads nothing until `grace_period` after `started_at` (set when HA starts; far in the past when the watchdog is set up with HA already running, e.g. options changed).
- `since` = most recent `last_changed` of these states. Reload when `now - since >= grace_period`.
- No loop: `Attempts` per entry_id (in memory). After reload n, the next waits `grace * 2**(n-1)`; at `max_reloads`, once that delay has passed too → give up (notified once). Reset only when the entry has been available for that delay, counted from the first check that found it back (`recovered_at`, cleared when it falls again), so flapping keeps its count.
- Reloads (`RELOAD_TIMEOUT`, shielded) and notify actions (`NOTIFY_TIMEOUT`) are time-limited: a timeout counts as a failure, the lock is never held forever.
- Each reload / failed reload / give-up: persistent notification id `integration_watchdog_<entry_id>` + optional `notify.*` actions; texts in translations `exceptions.*` (rendered with `str.format`).
- Checks are serialized by a lock; a failing reload or notifier is logged and doesn't stop the others.

## Release
Bump `version` in manifest.json and add its CHANGELOG.md section; pushing to main publishes `vX.Y.Z` with `integration_watchdog.zip` when that tag doesn't exist yet. Rerun notes with the "Update release notes" workflow (input `tag`).

## Tests
`pip install -r requirements_test.txt && pytest` — integrations are `MockConfigEntry` + registry entities (`tests/conftest.py`), reloads are mocked.
