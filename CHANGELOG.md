# Changelog

## 0.1.0

### What's new
- First release: checks every loaded integration at a set interval and reloads those whose enabled entities are all `unavailable` for longer than the grace period.
- Integrations to ignore, chosen in the integration options among those set up (or typed as a domain).
- Check interval (5 minutes by default) and grace period (15 minutes by default) in the integration options.
- **Check now** button and `integration_watchdog.check` action (administrators only).
- **Unavailable integrations** sensor listing them, **Last reload** and **Last check** sensors, and an `integration_watchdog_reloaded` event for each reload.
- English and French.
