# ha-integration-watchdog

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-integration-watchdog)](https://github.com/juju35/ha-integration-watchdog/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center"><img src="custom_components/integration_watchdog/brand/icon.png" alt="Integration Watchdog" width="120"></p>

Home Assistant integration that watches your integrations and reloads the ones whose entities are all unavailable, except those you choose to ignore. It comes with a Lovelace card showing the overall status and the recent reloads.

<p align="center">
  <img src="screenshots/card.png" alt="Integration Watchdog card with unavailable integrations" width="420">
  <img src="screenshots/card-dark.png" alt="Integration Watchdog card, dark theme" width="420">
</p>

Some integrations lose their connection (cloud API, device reboot, expired session) and never recover until they are reloaded by hand. Integration Watchdog does that reload for you.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-integration-watchdog&category=integration)

## Features

- **Automatic check** at a set interval (5 minutes by default) of every loaded integration
- **Reload** of an integration once all its enabled entities have been `unavailable` for the grace period (15 minutes by default)
- **Never during startup**: nothing is reloaded while Home Assistant starts or stops, nor during the grace period after it has started
- **No reload loop**: an integration that stays unavailable is reloaded at most 3 times in a row (configurable), the delay between two reloads doubling each time; then the watchdog gives up on it until it recovers
- **Notification** for each reload, failed reload and give-up: persistent notification, and optionally your notify actions (mobile app…)
- **Ignored integrations**, chosen in the integration options among those set up, or typed as a domain
- **Check now** button and `integration_watchdog.check` action
- **Unavailable integrations** sensor with the list, **Last reload** sensor, **Last check** sensor
- `integration_watchdog_reloaded` **event** for each reload, to notify or log
- **Lovelace card** bundled with the integration: overall status, unavailable integrations and the recent reloads (kept across restarts)
- One failing reload doesn't stop the others; two checks never run at the same time
- English, French, German and Spanish

## Prerequisites

- Home Assistant 2024.12 or newer
- Nothing else: the watchdog only uses Home Assistant's own registries and the integrations' **Reload**, and its card is installed with it. The [System Monitor Card](https://github.com/juju35/ha-system-monitor-card) can also show its sensors on a dashboard

## Installation

### Via HACS (recommended)

Click the button below to add the repository directly:

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-integration-watchdog&category=integration)

Then click **Download** and restart Home Assistant.

Or manually:

1. Open HACS → **⋮** (top right) → **Custom repositories**
2. Add `https://github.com/juju35/ha-integration-watchdog` — Type: **Integration**
3. Search for **Integration Watchdog** and click **Download**
4. Restart Home Assistant

### Manual

Copy `custom_components/integration_watchdog/` to `/config/custom_components/integration_watchdog/`, then restart Home Assistant.

## Configuration

[![Add integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=integration_watchdog)

**Settings → Devices & services → Add integration → Integration Watchdog**. Change the options later with the **Configure** button.

| Option | Default | Description |
|---|---|---|
| Check interval | 5 min | Minutes between two checks, from 1 to 1440 |
| Grace period | 15 min | Minutes every entity of an integration must have been unavailable before it is reloaded. Nothing is reloaded during this time after Home Assistant has started |
| Reloads in a row | 3 | Reloads of an integration that stays unavailable before giving up on it, from 1 to 10 |
| Ignored integrations | none | Integrations never reloaded. The list offers the integrations set up; type a domain (`zha`, `mqtt`…) to add another one |
| Notify actions | none | Also send each notification with these actions (`notify.mobile_app_phone`…). A persistent notification is always created |

### What counts as unavailable

An integration (config entry) is reloaded when:

- it is loaded, or its setup failed (`setup_retry`, `setup_error`): a reload retries it right away instead of waiting for Home Assistant's next retry. Disabled integrations are left alone
- it is not ignored, and it is not a helper (template, group, utility meter, derivative…): their entities follow their sources, so reloading them can't fix anything
- it has at least one enabled entity, and **every** enabled entity is `unavailable`
- the most recent of these entities has been unavailable for at least the grace period
- Home Assistant has been running for at least the grace period

Disabled entities are left out. Entities the integration didn't create, for example because the device was off or unreachable when it loaded (shown as "not provided" in Home Assistant), count as unavailable. An integration with a single entity still available is not reloaded.

The check is per integration entry, not per device: an entry with one device down and another one working is left alone.

### Limiting reloads

An integration that stays unavailable after a reload is reloaded again after the grace period, then after twice the grace period, and so on, up to the **Reloads in a row** option. With the defaults: after 15 minutes, then 15 minutes later, then 30 minutes later. If it is still unavailable once the delay after the last one has passed (60 minutes with the defaults), the watchdog gives up on it, sends a notification, and doesn't touch it again until one of its entities has been available for the current delay, counted from its return. An integration that comes back for a moment and falls again keeps its count. Leaving the list is not a recovery: an integration whose setup or unload is still in progress (a reload that went past its timeout), or that has no enabled entity with a state keeps its count until one of its entities is actually available. Disabling an integration resets its count right away, even if you enable it again a few seconds later: once enabled again, it starts over.

A reload that doesn't finish within 5 minutes, or a notify action that doesn't answer within 30 seconds, counts as failed, so that a hung integration can't block the following checks.

The count is kept in memory: restarting Home Assistant starts over (the history shown by the card is saved, though). Changing the options keeps it, so an integration given up stays so (until a higher **Reloads in a row** allows more reloads).

### Notifications

Each reload, failed reload and give-up creates a persistent notification, one per integration (the next one replaces it), in the language of Home Assistant. The same title and message are sent to the notify actions chosen in the options.

### Entities

| Entity | Description |
|---|---|
| `button.integration_watchdog_check_now` | Runs a check now. Unavailable while one is running |
| `sensor.integration_watchdog_unavailable_integrations` | Number of integrations whose entities are all unavailable. Attributes: `integrations` (list of `domain`, `title`, `entry_id`, `since`, `reloads`, `gave_up`), `ignored`, `max_reloads` |
| `sensor.integration_watchdog_last_reload` | Time of the last reload. Attributes: `domain`, `title`, `entry_id`, `success`, `reloads` (since Home Assistant started), `history` (the last 20 reloads and give-ups, newest first: `kind` = `reloaded` / `reload_failed` / `gave_up`, `at`, `domain`, `title`, `entry_id`, `attempt`, `max_reloads`, `unavailable_since`; kept across restarts, not recorded in the database) |
| `sensor.integration_watchdog_last_check` | End of the last check |

### Action `integration_watchdog.check`

Runs a check now and waits for the reloads. If a check is already running, waits for it to end, then runs its own. For administrators. Does nothing while Home Assistant is starting.

```yaml
action: integration_watchdog.check
```

### Event `integration_watchdog_reloaded`

| Field | Description |
|---|---|
| `entry_id` | Config entry reloaded |
| `domain` | Integration domain |
| `title` | Config entry title |
| `success` | `true` if the integration loaded again |
| `unavailable_since` | When its last entity became unavailable |
| `attempt` | Reload number in a row (1, 2…) |
| `max_reloads` | Reloads in a row before giving up |

Log each reload in the logbook:

```yaml
triggers:
  - trigger: event
    event_type: integration_watchdog_reloaded
actions:
  - action: logbook.log
    data:
      name: Integration Watchdog
      message: >
        reloaded {{ trigger.event.data.title }} ({{ trigger.event.data.domain }}),
        attempt {{ trigger.event.data.attempt }}/{{ trigger.event.data.max_reloads }}
```

## Card

The integration serves the **Integration Watchdog Card** and adds it to the dashboard resources (or loads it on every page when the resources are managed in YAML): no separate install. Add it from the card picker, or:

```yaml
type: custom:integration-watchdog-card
```

| Unavailable integrations | Everything available |
|---|---|
| ![Card](screenshots/card.png) | ![Card, all available](screenshots/card-ok.png) |
| ![Card, dark theme](screenshots/card-dark.png) | ![Card, all available, dark theme](screenshots/card-ok-dark.png) |

- **Header**: status (all available, *n* unavailable, *n* given up, checking…), time of the last check and the **Check now** button
- **Summary**: unavailable integrations, reloads since Home Assistant started, ignored integrations (listed on hover)
- **Unavailable integrations**: for each one, how long it has been down and its reloads (*1/3 reloads*), *Grace period* before the first one, *Given up* once the limit is reached
- **Recent reloads**: reloaded, failed and given up, newest first, with the attempt and how long ago. The history is saved, so it survives a restart
- A row opens the integration's page in **Settings**, to reload it by hand or read its logs. Integration logos come from the Home Assistant brands

Every option is in the visual editor:

| Option | Default | Description |
|---|---|---|
| `entity` | found automatically | The **Unavailable integrations** sensor |
| `title` | Integration Watchdog | Card title |
| `show_stats` | `true` | Summary tiles |
| `show_unavailable` | `true` | Unavailable integrations |
| `show_history` | `true` | Recent reloads |
| `history_count` | `5` | Recent reloads shown, from 1 to 20 |
| `check_button` | `true` | **Check now** button in the header |
| `hide_when_ok` | `false` | Hide the card while every integration is available |
| `language` | Home Assistant's | `en`, `fr`, `de` or `es` |

The [System Monitor Card](https://github.com/juju35/ha-system-monitor-card) can also show the watchdog's sensors next to the rest of the system.

## How it works

At each interval, the integration goes through the config entries, reads the states of their entities from the entity registry, and reloads the qualifying entries one at a time, as the **Reload** menu of the integration does. No check runs before Home Assistant has fully started; the first check runs right after, and only lists the unavailable integrations until the grace period has passed.

To debug:

```yaml
logger:
  logs:
    custom_components.integration_watchdog: debug
```

## Development

```bash
pip install -r requirements_test.txt && pytest
node --test test/*.test.mjs        # card
python scripts/screenshots.py      # README screenshots (Playwright)
```

### Releasing

1. Bump the version in `custom_components/integration_watchdog/manifest.json`, `const.py` (`VERSION`) and the card (`INTEGRATION_WATCHDOG_CARD_VERSION`)
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow creates the tag and the GitHub release with the changelog section as notes

## Translations

The integration and its card follow the language of Home Assistant. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)
