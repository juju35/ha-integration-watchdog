# ha-integration-watchdog

[![Marketplace](https://img.shields.io/badge/Marketplace-Custom-41BDF5.svg)](https://www.home-assistant.io/integrations/marketplace/)
[![HACS Validation](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml)
[![Lint](https://github.com/juju35/ha-integration-watchdog/actions/workflows/lint.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/lint.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-integration-watchdog)](https://github.com/juju35/ha-integration-watchdog/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/juju35/ha-integration-watchdog/blob/main/LICENSE)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/julienstep9)

<p align="center"><img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/custom_components/integration_watchdog/brand/icon.png" alt="Integration Watchdog" width="120"></p>

Home Assistant integration that watches your integrations and reloads the ones whose entities are all unavailable, except those you choose to ignore. It comes with a Lovelace card showing the overall status and the recent reloads.

<p align="center">
  <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card.png" alt="Integration Watchdog card with unavailable integrations" width="420">
  <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card-dark.png" alt="Integration Watchdog card, dark theme" width="420">
</p>

Some integrations lose their connection (cloud API, device reboot, expired session) and never recover until they are reloaded by hand. Integration Watchdog does that reload for you.

[![Open your Home Assistant instance and open a repository inside the Marketplace.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-integration-watchdog&category=integration)

## Features

- **Automatic check** at a set interval (5 minutes by default) of every loaded integration
- **Reload** of an integration once all its enabled entities have been `unavailable` for the grace period (15 minutes by default)
- **Never during startup**: nothing is reloaded while Home Assistant starts or stops, nor during the grace period after it has started
- **No reload loop**: an integration that stays unavailable is reloaded at most 3 times in a row (configurable), the delay between two reloads doubling each time; then the watchdog gives up on it until it recovers. The counts are saved, so a restart doesn't start over
- **Notification** for each reload, failed reload and give-up: persistent notification, and optionally your notify actions (mobile app…)
- **Repairs issue** for each integration given up, removed once it recovers, with **Try again** to start over and reload it now
- **Diagnostics** with personal data redacted
- **Ignored integrations**, chosen in the integration options among those set up, or typed as a domain, and **ignored entries**: one entry of an integration (a camera of several) left alone while its other entries are still watched
- **Pause entity**: while an entity of your choice is on (an `input_boolean` for maintenance, a `schedule` for the night), nothing is reloaded; the checks still list what is unavailable
- **Reloads in 24 h** sensor: how many reloads the last day, per integration — an unstable integration shows up there
- **Check now** button and `integration_watchdog.check` action; `integration_watchdog.reset` action to start over on an integration
- **Unavailable integrations** sensor with the list, **Last reload** sensor, **Last check** sensor
- `integration_watchdog_reloaded` **event** for each reload, to notify or log
- **Lovelace card** bundled with the integration: overall status, unavailable integrations and the recent reloads (kept across restarts)
- **Mini card**: the status and the unavailable integrations on two lines, with a detail button showing the full card
- One failing reload doesn't stop the others; two checks never run at the same time
- English, French, German, Spanish, Italian, Dutch, European Portuguese, Polish, Serbian (Cyrillic and Latin), Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek; pt-BR uses the European Portuguese texts

## Prerequisites

- Home Assistant 2024.12 or newer
- Nothing else: the watchdog only uses Home Assistant's own registries and the integrations' **Reload**, and its card is installed with it. The [System Monitor Card](https://github.com/juju35/ha-system-monitor-card) can also show its sensors on a dashboard

## Installation

### Via the Marketplace (recommended)

Click the button below to add the repository directly:

[![Add to the Marketplace](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/marketplace_repository/?owner=juju35&repository=ha-integration-watchdog&category=integration)

Then click **Install** and restart Home Assistant.

Or manually:

1. Open **Settings → Marketplace → Add from link** (top right; this needs a GitHub account connected)
2. Add `https://github.com/juju35/ha-integration-watchdog` — Type: **Integration**
3. Open **Integration Watchdog** and click **Install**
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
| Grace period per integration | — | One line per integration, `domain: minutes` (`zha: 30`): its own grace period and delays between reloads, for an integration that takes longer (a big Zigbee network) or should be reloaded sooner. Right after Home Assistant starts, the global grace period still applies to all |
| Reloads in a row | 3 | Reloads of an integration that stays unavailable before giving up on it, from 1 to 10 |
| Ignored entries | none | Single entries never reloaded ("Title (domain)"); the other entries of their integration are still watched |
| Ignored integrations | none | Integrations never reloaded. The list offers the integrations set up; type a domain (`zha`, `mqtt`…) to add another one |
| Pause entity | none | An `input_boolean`, `switch`, `binary_sensor` or `schedule`: while it is on, nothing is reloaded (maintenance of the network, a planned outage, the night). The checks still run and list the unavailable integrations, and the *Unavailable integrations* sensor has `paused: true`; reloads start again at the first check after it turns off, the grace period counted from when each integration became unavailable |
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

The count is saved with the history (`.storage/integration_watchdog.history`): after a restart of Home Assistant, an integration given up stays so, and one being reloaded keeps its count and delay. Entries removed while Home Assistant was stopped are dropped when it starts. Changing the options keeps the count too, so an integration given up stays so (until a higher **Reloads in a row** allows more reloads). To start over on an integration, use **Try again** on its Repairs issue, the `integration_watchdog.reset` action or the card's **Try again** button.

### Notifications

Each reload, failed reload and give-up creates a persistent notification, one per integration (the next one replaces it), in the language of Home Assistant. It is dismissed once the watchdog starts over for the integration (recovered, reset, disabled or removed), and when Integration Watchdog is removed. The same title and message are sent to the notify actions chosen in the options.

### Repairs

Giving up on an integration also raises an issue in **Settings → System → Repairs**, one per integration. It goes away by itself once the integration has recovered (available again for its current delay), is disabled or removed, or gets more reloads after **Reloads in a row** was raised. An integration still given up when Home Assistant restarts gets its issue back.

Opening the issue offers **Try again**: submitting it forgets the reloads of the integration, deletes the issue and reloads the integration now (like the `integration_watchdog.reset` action). The reload runs in the background: the dialog closes at once, saying that it was started, and a failed reload is logged. If it is still unavailable afterwards, the watchdog starts over: reloads up to **Reloads in a row**, then gives up again.

### Diagnostics

**Settings → Devices & services → Integration Watchdog → ⋮ → Download diagnostics** gives the options and the watchdog's state: unavailable integrations, reload counts per entry, last reload and history. Integration titles (often an e-mail address or a host) and notify actions are redacted; domains and entry ids are kept.

### Entities

| Entity | Description |
|---|---|
| `button.integration_watchdog_check_now` | Runs a check now. Unavailable while one is running |
| `sensor.integration_watchdog_unavailable_integrations` | Number of integrations whose entities are all unavailable. Attributes: `integrations` (list of `domain`, `title`, `entry_id`, `since`, `reloads`, `gave_up`), `ignored`, `max_reloads`, `paused` (the pause entity is on) |
| `sensor.integration_watchdog_last_reload` | Time of the last reload. Attributes: `domain`, `title`, `entry_id`, `success`, `reloads` (since Home Assistant started), `history` (the last 20 reloads and give-ups, newest first: `kind` = `reloaded` / `reload_failed` / `gave_up`, `at`, `domain`, `title`, `entry_id`, `attempt`, `max_reloads`, `unavailable_since`; kept across restarts, not recorded in the database) |
| `sensor.integration_watchdog_last_check` | End of the last check |
| `sensor.integration_watchdog_reloads_in_24_h` | Reloads and failed reloads of the last 24 hours (from the history). Attributes: `failed`, `integrations` (count per integration) |

### Action `integration_watchdog.check`

Runs a check now and waits for the reloads. If a check is already running, waits for it to end, then runs its own. For administrators. Does nothing while Home Assistant is starting.

```yaml
action: integration_watchdog.check
```

### Action `integration_watchdog.reset`

Starts over for one integration entry: forgets its reloads (given up or not), deletes its Repairs issue and reloads it now. Waits for a check still running. Fails if the entry doesn't exist or the reload fails (the count is reset anyway). For administrators.

| Field | Description |
|---|---|
| `entry_id` | The integration entry (config entry ID), e.g. from the `entry_id` of the **Unavailable integrations** sensor |

```yaml
action: integration_watchdog.reset
data:
  entry_id: 01JABCDEF0123456789ABCDEFG
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
| <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card.png" alt="Card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card-ok.png" alt="Card, all available" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card-dark.png" alt="Card, dark theme" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/card-ok-dark.png" alt="Card, all available, dark theme" width="400"> |

- **Header**: status (all available, *n* unavailable, *n* given up, checking…), time of the last check and the **Check now** button. On a narrow card the status takes a second line, shortens, then keeps only its coloured dot, with the text on hover. In a Sections view the card takes at least 8 columns
- **Summary**: unavailable integrations, reloads since Home Assistant started, ignored integrations (listed on hover)
- **Unavailable integrations**: for each one, how long it has been down and its reloads (*1/3 reloads*), *Grace period* before the first one, *Given up* once the limit is reached
- **Recent reloads**: the last attempt of each integration (reloaded, failed or given up), newest first, with the attempt and how long ago. The history is saved, so it survives a restart
- For an administrator, a row opens the integration's page in **Settings** on its entry (`/config/integrations/integration/<domain>#config_entry=<entry_id>`), to reload it by hand or read its logs (other users can't open Settings, so their rows are not clickable). Integration logos come from the Home Assistant brands
- For an administrator, an integration given up gets a **Try again** button next to its row: it runs the `integration_watchdog.reset` action (start over and reload now)

Every option is in the visual editor:

| Option | Default | Description |
|---|---|---|
| `entity` | found automatically | The **Unavailable integrations** sensor |
| `title` | Integration Watchdog | Card title |
| `show_stats` | `true` | Summary tiles |
| `show_unavailable` | `true` | Unavailable integrations |
| `show_history` | `true` | Recent reloads |
| `history_count` | `5` | Recent reloads shown (one per integration), from 1 to 20 |
| `check_button` | `true` | **Check now** button in the header. It presses the button entity, so any user who sees the card can run a check (only the `integration_watchdog.check` action is limited to administrators) |
| `hide_when_ok` | `false` | Hide the card while every integration is available (always shown while editing the dashboard) |
| `language` | Home Assistant's | `en`, `fr`, `de`, `es`, `it`, `nl`, `pt`, `pl`, `sr`, `sr-Latn`, `ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv` or `el` |

### Mini card

`custom:integration-watchdog-mini-card` shows the essentials on two lines, for a compact dashboard: the icon, title, **Check now** button and status, then a chip per unavailable integration (*Hue Bridge · 1/3 reloads*, *Zigbee · Given up*), or the last reload while everything is available, and the time of the last check. Search for **Integration Watchdog Mini Card** when adding a card, or in YAML:

```yaml
type: custom:integration-watchdog-mini-card
```

| Unavailable integrations | Everything available | Zoomed in |
|---|---|---|
| <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini.png" alt="Mini card" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini-ok.png" alt="Mini card, all available" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini-zoom.png" alt="Mini card zoomed in" width="400"> |
| <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini-dark.png" alt="Mini card, dark theme" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini-ok-dark.png" alt="Mini card, all available, dark theme" width="400"> | <img src="https://raw.githubusercontent.com/juju35/ha-integration-watchdog/main/screenshots/mini-zoom-dark.png" alt="Mini card zoomed in, dark theme" width="400"> |

- The **detail** button (top right) switches the card to the full [card](#card), with the same options, and back, as does a click anywhere else on the page
- For an administrator, an integration's chip opens its page in **Settings**, on its entry; for other users, a chip opens the sensor
- In a Sections view the card takes 6 columns by default, its minimum; on a narrow card the icon gives way and the status keeps only its coloured dot

It takes every option of the full card (they set its detail view, `hide_when_ok` and `check_button` apply to both views), plus:

| Option | Default | Description |
|---|---|---|
| `zoom` | `true` | **Detail** button showing the full card. `false` removes it |

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
2. Add a `## <version>` section at the top of [CHANGELOG.md](https://github.com/juju35/ha-integration-watchdog/blob/main/CHANGELOG.md)
3. Push to `main`: the **Release** workflow creates the tag and the GitHub release with the changelog section as notes

## Translations

The integration and its card follow the language of Home Assistant. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |
| Deutsch | `de` |
| Español | `es` |
| Italiano | `it` |
| Nederlands | `nl` |
| Português (Portugal) | `pt` |
| Português (Brasil) | `pt-BR` (pt-BR uses the European Portuguese texts) |
| Polski | `pl` |
| Română | `ro` |
| Dansk | `da` |
| Svenska | `sv` |
| Български | `bg` |
| Русский | `ru` |
| Українська | `uk` |
| Magyar | `hu` |
| Slovenčina | `sk` |
| Čeština | `cs` |
| Slovenščina | `sl` |
| Latviešu | `lv` |
| Ελληνικά | `el` |
| Српски | `sr` |
| Srpski (latinica) | `sr-Latn` |

Contributions for additional languages are welcome!

## License

[MIT](https://github.com/juju35/ha-integration-watchdog/blob/main/LICENSE)

## Support

If you find this project useful, you can support its development:

<a href="https://buymeacoffee.com/julienstep9"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50"></a>
