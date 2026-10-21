# ha-integration-watchdog

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Validation](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/hacs.yml)
[![Validate](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml/badge.svg)](https://github.com/juju35/ha-integration-watchdog/actions/workflows/validate.yml)
[![Release](https://img.shields.io/github/v/release/juju35/ha-integration-watchdog)](https://github.com/juju35/ha-integration-watchdog/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center"><img src="custom_components/integration_watchdog/brand/icon.png" alt="Integration Watchdog" width="120"></p>

Home Assistant integration that watches your integrations and reloads the ones whose entities are all unavailable, except those you choose to ignore.

Some integrations lose their connection (cloud API, device reboot, expired session) and never recover until they are reloaded by hand. Integration Watchdog does that reload for you.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=juju35&repository=ha-integration-watchdog&category=integration)

## Features

- **Automatic check** at a set interval (5 minutes by default) of every loaded integration
- **Reload** of an integration once all its enabled entities have been `unavailable` for the grace period (15 minutes by default); an integration that stays unavailable is reloaded at most once per grace period
- **Ignored integrations**, chosen in the integration options among those set up, or typed as a domain
- **Check now** button and `integration_watchdog.check` action
- **Unavailable integrations** sensor with the list, **Last reload** sensor, **Last check** sensor
- `integration_watchdog_reloaded` **event** for each reload, to notify or log
- One failing reload doesn't stop the others; two checks never run at the same time
- English and French

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
| Grace period | 15 min | Minutes every entity of an integration must have been unavailable before it is reloaded. Also the delay between two reloads of an integration that stays unavailable |
| Ignored integrations | none | Integrations never reloaded. The list offers the integrations set up; type a domain (`zha`, `mqtt`…) to add another one |

### What counts as unavailable

An integration (config entry) is reloaded when:

- it is loaded (integrations that failed to set up are retried by Home Assistant itself)
- it is not ignored
- it has at least one enabled entity, and **every** enabled entity is `unavailable`
- the most recent of these entities has been unavailable for at least the grace period

Disabled entities, and entities the integration no longer provides (restored, marked "not provided"), are left out. An integration with a single entity still available is not reloaded.

### Entities

| Entity | Description |
|---|---|
| `button.integration_watchdog_check_now` | Runs a check now. Unavailable while one is running |
| `sensor.integration_watchdog_unavailable_integrations` | Number of integrations whose entities are all unavailable. Attributes: `integrations` (list of `domain`, `title`, `entry_id`, `since`), `ignored` |
| `sensor.integration_watchdog_last_reload` | Time of the last reload. Attributes: `domain`, `title`, `entry_id`, `success`, `reloads` (since Home Assistant started) |
| `sensor.integration_watchdog_last_check` | End of the last check |

### Action `integration_watchdog.check`

Runs a check now and waits for the reloads. For administrators.

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

Get notified of each reload:

```yaml
triggers:
  - trigger: event
    event_type: integration_watchdog_reloaded
actions:
  - action: notify.mobile_app_phone
    data:
      message: >
        {{ trigger.event.data.title }} ({{ trigger.event.data.domain }})
        reloaded{{ '' if trigger.event.data.success else ' — failed' }}
```

## How it works

At each interval, the integration goes through the config entries, reads the states of their entities from the entity registry, and reloads the qualifying entries one at a time, as the **Reload** menu of the integration does. Reloading recreates the entities, which resets their `last_changed`: this is what spaces out the reloads of an integration that stays down, without any state kept by the watchdog.

No check runs before Home Assistant has fully started; the first check runs right after.

To debug:

```yaml
logger:
  logs:
    custom_components.integration_watchdog: debug
```

## Development

```bash
pip install -r requirements_test.txt && pytest
```

### Releasing

1. Bump the version in `custom_components/integration_watchdog/manifest.json`
2. Add a `## <version>` section at the top of [CHANGELOG.md](CHANGELOG.md)
3. Push to `main`: the **Release** workflow creates the tag and the GitHub release with the changelog section as notes

## Translations

The integration follows the language of Home Assistant. Currently supported:

| Language | Code |
|---|---|
| English | `en` |
| Français | `fr` |

Contributions for additional languages are welcome!

## License

[MIT](LICENSE)
