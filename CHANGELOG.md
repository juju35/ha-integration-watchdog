# Changelog

## 1.11.0 - 2026-11-11

### Deprecated
- **Integration Watchdog is now a module of [System Hub](https://github.com/juju35/ha-system-hub)**, and this repository is archived: no more updates here. Turned on in System Hub, the module takes over the settings of Integration Watchdog. While both are set up, Integration Watchdog raises a repair in **Settings → Repairs**, as it would otherwise run twice and register its cards twice: remove Integration Watchdog and its card resource once the module is on. See [Migrating](https://github.com/juju35/ha-system-hub#migrating) ([juju35/ha-system-hub#49](https://github.com/juju35/ha-system-hub/issues/49), thanks @FredM67).

## 1.10.0 - 2026-11-10

### Improvements
- Panel, **Status** tab: drawn by the panel itself instead of embedding the card, so it shows at the first opening. A summary (unavailable and given-up integrations, last check with **Check now**, reloads since start, ignored integrations), the unavailable integrations (since when, reloads, **Try again** on one given up) and the last 50 reloads and power cycles, side by side on a wide screen and one under the other on a phone. Each line opens its integration.
- Panel shown at once: the release keeps its languages in the panel file instead of a separate file to wait for.

## 1.9.1 - 2026-11-10

### Fixes
- Panel empty on its first opening (fine when coming back to it): in the release, the panel is only defined once the page's language file has loaded, and Home Assistant had already handed it the connection, the address and the layout by then; they were lost and nothing was drawn. They are now taken up when the panel is defined.

## 1.9.0 - 2026-11-10

### Improvements
- **Panel, Power cycles tab: device and plug pickers you can search.** The two long drop-down lists are replaced by a search field over a short scrolling list grouped by area (accents and case ignored, every word must match the name, area, integration or entity ID). Arrow keys and Enter choose, Escape clears the search; the choice shows with its area and a *Change* button, and the focus moves on to the plug, then the delay. The plugs in the chosen device's area are listed first, outlets before the other switches. At most 50 rows are shown: type to narrow down the rest.
- **Fewer plugs offered**: configuration and diagnostic switches (child lock, LED, an integration's options) are no longer offered as a power plug.

## 1.8.1 - 2026-11-10

### Performance
- **Panel opens faster**: the settings and the form labels load alongside the card instead of after it (the card's bundle and language file could delay them by a few seconds).

## 1.8.0 - 2026-11-10

### Features
- **Power cycles**: associate a device with the smart plug that powers it (**Configure → Add a power cycle**: device, plug, *Unavailable for* in minutes, *Off for* in seconds). Once all the device's enabled entities have been unavailable for that delay, the plug is switched off, then on again. Only when the plug is on (one switched off on purpose or unavailable is left alone), never during startup or the grace period after it, nor while the pause entity is on; at most *Reloads in a row* in a row, the delay doubling each time, then given up until the device recovers. Each power cycle, failure and give-up is notified, shown in the card's history with the plug used, and fires the `integration_watchdog_power_cycled` event. The plug is always switched on again, also after a restart of Home Assistant during the power cycle.
- **Configure** now opens a menu: *Settings*, *Add a power cycle*, *Remove power cycles*.
- **Sidebar panel** (administrators only), with tabs under its toolbar as in Smart Comfort: *Status* (the card with the whole history), *Power cycles* (list with their state, add, remove) and *Settings* (every option). The tab is in the address; the form labels are the options flow's translations, the panel's own texts in the 22 languages.

## 1.7.1 - 2026-11-09

### Maintenance
- No code change: released again to check the installation from the Marketplace.

## 1.7.0 - 2026-11-09

### Features
- **Grace period per integration** (option): one line per integration, `domain: minutes` (`zha: 30`), replaces the grace period of that integration and the delays between its reloads (which still double each time). Right after Home Assistant starts, the global grace period still applies to all. A line that isn't `domain: minutes` (1 to 1440) is refused in the form. Shown in the diagnostics.

## 1.6.0 - 2026-11-09

### Features
- **Pause entity** (option): while an `input_boolean`, `switch`, `binary_sensor` or `schedule` of your choice is on, nothing is reloaded — maintenance of the network, a planned outage, the night. The checks still list the unavailable integrations, and the *Unavailable integrations* sensor gets a `paused` attribute.

## 1.5.0 - 2026-11-09

### Performance
- **Translations load on demand**: in the release zip, the frontend files keep English only (`integration-watchdog-card.js` 97 KB → 51 KB) and each other language is its own `<file>.i18n.<lang>.js` file next to them, fetched the first time a card or the panel needs it. Home Assistant loads the card on every dashboard, so each page used to download and parse all 22 languages to use one. The cards and panel are defined once the page's language has arrived (a few milliseconds), so they render translated from the start.

### Maintenance
- The repository keeps every language in the sources: the release runs `scripts/split-frontend.mjs` before building the zip, and the Validate workflow checks the split on a copy (every table is rebuilt from the split files and compared).

## 1.4.1 - 2026-11-08

### Fixes
- The notification of an integration is dismissed once the watchdog starts over for it (recovered, reset, disabled or removed) and when Integration Watchdog itself is removed, instead of staying forever.
- **Try again** on a Repairs issue no longer keeps the dialog waiting for a running check and the reload: it starts the reload in the background and closes at once, saying so; a failed reload is logged.
- A reload started by **Try again** or the `integration_watchdog.reset` action that fails (the integration's setup returns an error) is now logged as a warning; before, only an exception or a timeout was.

## 1.4.0 - 2026-11-07

### What's new
- **Try again** on the Repairs issue of an integration given up: it forgets its reloads and reloads it now.
- **`integration_watchdog.reset` action** (administrators) doing the same for any integration entry, and a **Try again** button next to a given-up row of the card.
- Card rows and mini card chips open the integration's page on its entry (`#config_entry=<entry_id>`), not just the integration.

### Fixes
- The reload counts (and given-up integrations) are saved with the history, so a restart of Home Assistant no longer starts over; entries removed meanwhile are dropped, and the Repairs issue of an integration still given up comes back.

## 1.3.0 - 2026-11-07

### What's new
- **Repairs issue** when the watchdog gives up on an integration, one per integration, removed automatically once it has recovered (or is disabled or removed).
- **Diagnostics**: download them from the integration page to see the options and the watchdog's state (unavailable integrations, reload counts, history), with integration titles and notify actions redacted.

## 1.2.0 - 2026-11-07

### What's new
- **Ignored entries** option: single integration entries never reloaded, while the other entries of their integration are still watched (one camera among several, a printer that is often off). Listed as "Title (domain)" in the options.
- **Reloads in 24 h** sensor: the reloads and failed reloads of the last day, with `failed` and the count per integration in its attributes — an unstable integration stands out, and an automation can warn when one is reloaded too often.

## 1.1.4 - 2026-11-07

### Fixes
- `hide_when_ok`: a hidden card shows again while the dashboard is edited and in the card editor's preview, so that it can still be edited (before, it vanished from the editor as soon as nothing was wrong). A hidden card now also tells Lovelace (`card-visibility-changed`), so a sections view drops its slot instead of leaving a gap.

## 1.1.3 - 2026-11-04

### Documentation
- README: images and links use absolute URLs, so the screenshots, icons, badges and links display in HACS (relative paths broke there).
- README: screenshots get a display size, so cards no longer show oversized in HACS and on GitHub.

## 1.1.2 - 2026-11-04

### What's new
- Added Romanian, Danish, Swedish, Bulgarian, Russian, Ukrainian, Hungarian, Slovak, Czech, Slovenian, Latvian and Greek translations: configuration, options, entities, action, notifications and the cards (`ro`, `da`, `sv`, `bg`, `ru`, `uk`, `hu`, `sk`, `cs`, `sl`, `lv`, `el`). The card editor offers the twelve languages.

## 1.1.1 - 2026-11-02

### Fixes
- Mini card: the badge keeps its full size (40 px) in the compact view, like the full card.

## 1.1.0 - 2026-11-02

### What's new
- **Mini card** (`custom:integration-watchdog-mini-card`), served with the full card: the status on two lines, a chip per unavailable integration (or the last reload while everything is available) and the time of the last check. Its **detail** button, top right, switches it to the full card and back, as does a click anywhere else on the page (`zoom: false` removes it). Every option of the full card is in its visual editor.

## 1.0.1 - 2026-11-02

### What's new
- Card: **Recent reloads** shows only the last attempt of each integration (its last reload, failed reload or give-up), instead of every attempt. **Reloads shown** now counts integrations. The saved history is unchanged.

## 1.0.0 - 2026-11-02

First stable release. No change since 0.6.5.

## 0.6.5 - 2026-11-01

### Fixes
- Card: on a narrow card (a phone, a narrow masonry column), the title is visible again and the status no longer runs out of the card. The status shortens, then keeps only its coloured dot (full text on hover); *Integration Watchdog is not set up* becomes *Not set up*, since the title already names the integration.
- Card: in a Sections view the card is now at least 8 columns wide: at 6 columns a phone leaves it about 156 px, too little for the header.
- Card: the status shows its full text whenever it fits (*2 unavailable* on a 245 px card); the title no longer takes its room. Short of room, it goes onto a second line before it is cut (*Sve je / dostupno*).
- Card: inside layout-card, button-card or another container sized by its content, the card no longer shrinks to a sliver; in two columns side by side (a `1fr 1fr` grid, a horizontal stack, with or without a wrapper around the card) it shrinks with its column instead of running out of it, whatever its state, and on a very narrow header the round icon gives way to the status.
- Card: giving the keyboard focus back after an update no longer scrolls the page.
- Card: the outcome of a row (*Reloaded*, *Grace period*…) gives way to the integration's name on a narrow card.
- Card: rows only open the integration's page in **Settings** for administrators; for other users, who can't open Settings, they are no longer clickable.
- Card: if **Check now** fails (connection lost, button removed), a message says so instead of nothing happening.
- Card: correct Serbian plurals (*2 недоступне*, *5 недоступних*, *21 недоступна*) and Polish plurals (*2 niedostępne*, *5 niedostępnych*); an integration given up is *Напуштена* / *Napuštena* in Serbian everywhere, like in the status.
- Card: Polish uses *ponowne wczytanie* for a reload everywhere (*Ponowne wczytania*, *Wczytana ponownie*), like the rest of the card and the integration.

### Maintenance
- Biome 2.6.4 in the pre-commit hook and the lint job.

## 0.6.4 - 2026-11-01

### What's new
- Added Italian, Dutch, European Portuguese and Polish translations: configuration, options, entities, action, notifications and the card (`it`, `nl`, `pt`, `pl`). pt-BR uses the European Portuguese texts, in the integration and the card, and dates follow the Brazilian format. The card editor offers the four languages.

## 0.6.3 - 2026-11-01

### What's new
- Added Serbian (Cyrillic and Latin) translations: configuration, options, entities, action, notifications and the card (`sr`, `sr-Latn`). The card picks `sr-Latn` when Home Assistant is set to Serbian Latin, and its editor offers both.

## 0.6.2

### Fixes
- Card: the status, the reload attempts, the outcome of the recent reloads and the unavailable count are readable again in the light theme (orange and green text was too faint on its tile), and in the dark theme for the red ones. The colours stay on the badge, the icons and the tiles; the secondary text on the tinted tiles is a little darker too.
- Card: a keyboard user keeps the focus on the **Check now** button or on a row when the card updates.

### Maintenance
- A release now also waits for the Lint and HACS Validation workflows, not only Validate.
- Biome 2.6.3 and Ruff 0.17.3 in the pre-commit hooks and the lint jobs.

## 0.6.1

### Fixes
- A give-up now appears in the card's **Recent reloads** right away: it was only shown after the next reload of another integration, or after a restart.
- Card: when the watchdog is not loaded (entry disabled or failed, Home Assistant starting), a card with a chosen sensor says *Integration Watchdog is not set up* instead of *All available*, and is no longer hidden by `hide_when_ok`.
- Card: once the sensor is back (after changing the options or a restart), the card shows it at once instead of up to a minute later.
- Card editor: the **Check now** button help no longer says it is for administrators: any user who sees the card can run a check.

### Maintenance
- A release now also needs the card tests and the tests on the minimum Home Assistant version to pass.
- Dependabot updates the pre-commit hooks; the Ruff and Biome lint jobs read their version from the pre-commit configuration. The Screenshots workflow no longer installs ffmpeg.

## 0.6.0

### What's new
- **Integration Watchdog Card**, bundled with the integration and added to the dashboard resources automatically: overall status, time of the last check, **Check now** button, summary (unavailable, reloads, ignored), unavailable integrations with their reloads or *Given up*, and the recent reloads (reloaded, failed, given up). A row opens the integration's page. Visual editor; English, French, German and Spanish.
- History of the last 20 reloads and give-ups, newest first, in the `history` attribute of the **Last reload** sensor, saved across restarts (not recorded in the database). The **Unavailable integrations** sensor gives `max_reloads` too.

### Maintenance
- Card unit tests, Biome lint, and a Screenshots workflow that renders the README captures (light and dark) on pull requests.

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
