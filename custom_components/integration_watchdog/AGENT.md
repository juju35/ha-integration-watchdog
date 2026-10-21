# Integration Watchdog — Agent Context

## Purpose
Home Assistant custom integration that reloads the integrations (config entries) whose enabled entities are all `unavailable`, except the domains listed in the options.

## Architecture

```
custom_components/integration_watchdog/
├── __init__.py      # Action check (admin), entry setup, time interval, first check once HA has started
├── watchdog.py      # IntegrationWatchdog: finds unavailable entries, reloads past the grace period, fires the event
├── config_flow.py   # Single entry; options: scan_interval (min), grace_period (min), ignored_integrations (domains)
├── button.py        # button.*_check_now (unavailable while a check runs)
├── sensor.py        # unavailable (count + integrations/ignored), last_reload (+ domain/title/success/reloads), last_check
├── entity.py        # Shared service device, listener on IntegrationWatchdog
├── const.py / icons.json / services.yaml / translations/{en,fr}.json / brand/
```

## Rules
- An entry counts only when LOADED, not ignored, not this domain, with at least one enabled entity that has a state; states with `restored: true` (entities the integration no longer provides) are skipped.
- `since` = most recent `last_changed` of these states. Reload when `now - since >= grace_period`. A reload recreates the states, so an entry that stays unavailable is reloaded at most once per grace period: no extra bookkeeping.
- Checks are serialized by a lock; a failing reload is logged and doesn't stop the others.
- Scheduled checks are skipped until `CoreState.running`.

## Release
Bump `version` in manifest.json and add its CHANGELOG.md section; pushing to main publishes `vX.Y.Z` with `integration_watchdog.zip` when that tag doesn't exist yet. Rerun notes with the "Update release notes" workflow (input `tag`).

## Tests
`pip install -r requirements_test.txt && pytest` — integrations are `MockConfigEntry` + registry entities (`tests/conftest.py`), reloads are mocked.
