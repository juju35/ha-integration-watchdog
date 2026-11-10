"""Render the Integration Watchdog card and sidebar panel (its three tabs) with mock data and save the README screenshots.

Usage: python scripts/screenshots.py  (needs `pip install playwright` and `playwright install chromium`)
CHROMIUM_PATH=/path/to/chrome to use another browser. The clock is frozen so the durations and "x min ago" stay the same.
Integration logos are not fetched (the generic icon is shown), so the captures don't depend on the network.
Every card capture keeps a 16 px frame of the theme background around the card; the panel is shot at 1100 px wide.
A capture is only rewritten when its decoded pixels differ from the file already there (a re-encoded but identical
image is not a change), so an unchanged card never produces a screenshot commit.
"""

import base64
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CARD_JS = (ROOT / "custom_components/integration_watchdog/frontend/integration-watchdog-card.js").read_text()
PANEL_JS = (ROOT / "custom_components/integration_watchdog/frontend/integration-watchdog-panel.js").read_text()
TRANSLATIONS = json.loads((ROOT / "custom_components/integration_watchdog/translations/en.json").read_text())
PANEL_WIDTH = 1100
NOW = datetime.fromisoformat("2026-10-31T14:00:00+01:00")
WIDTH = 460

THEMES = {
    "light": {
        "--primary-background-color": "#e8eaed",
        "--secondary-background-color": "#ececec",
        "--card-background-color": "#ffffff",
        "--primary-text-color": "#212121",
        "--secondary-text-color": "#727272",
        "--divider-color": "rgba(0,0,0,.12)",
    },
    "dark": {
        "--primary-background-color": "#111111",
        "--secondary-background-color": "#282828",
        "--card-background-color": "#1c1c1c",
        "--primary-text-color": "#e1e1e1",
        "--secondary-text-color": "#9b9b9b",
        "--divider-color": "rgba(225,225,225,.12)",
    },
}
COMMON = {
    "--primary-color": "#03a9f4",
    "--success-color": "#43a047",
    "--warning-color": "#ffa600",
    "--error-color": "#db4437",
    "--text-primary-color": "#ffffff",
}

# Material Design Icons paths used by the card (from @mdi/js).
ICONS = {
    "shield-check-outline": "M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9",
    "shield-alert-outline": "M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21M11,7H13V13H11V7M11,15H13V17H11V15Z",
    "shield-off-outline": "M1,4.27L3,6.27V11C3,16.55 6.84,21.74 12,23C13.87,22.54 15.57,21.56 16.97,20.24L19.23,22.5L20.5,21.22L2.28,3L1,4.27M12,21C8.25,20 5,15.54 5,11.22V8.27L15.59,18.86C14.53,19.89 13.3,20.65 12,21M21,5V11C21,13.28 20.35,15.5 19.23,17.4L17.77,15.95C18.54,14.5 19,12.84 19,11.22V6.3L12,3.18L7.16,5.34L5.65,3.82L12,1L21,5Z",
    "shield-outline": "M21,11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1L21,5V11M12,21C15.75,20 19,15.54 19,11.22V6.3L12,3.18L5,6.3V11.22C5,15.54 8.25,20 12,21Z",
    "refresh": "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",
    "puzzle-remove-outline": "M13.2 22V21.7C13.2 20.21 12 19 10.5 19C9 19 7.8 20.21 7.8 21.7V22H4C2.9 22 2 21.11 2 20V16.2H2.3C3.79 16.2 5 15 5 13.5S3.79 10.8 2.3 10.8H2V7C2 5.9 2.9 5 4 5H7.04C7.28 3.3 8.74 2 10.5 2S13.72 3.3 13.96 5H17C18.11 5 19 5.9 19 7V10.04C20.7 10.28 22 11.74 22 13.5C22 13.6 22 13.7 21.97 13.79C21.35 13.44 20.67 13.2 19.93 13.08C19.75 12.46 19.18 12 18.5 12H17V7H12V5.5C12 4.67 11.33 4 10.5 4S9 4.67 9 5.5V7H4V9.12C5.76 9.8 7 11.5 7 13.5S5.75 17.2 4 17.88V20H6.12C6.8 18.25 8.5 17 10.5 17C11.47 17 12.37 17.3 13.12 17.81C13.04 18.19 13 18.59 13 19C13 20.1 13.3 21.12 13.81 22H13.2M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z",
    "check-circle": "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z",
    "alert-circle": "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
    "arrow-expand": "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
    "arrow-collapse": "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
    "clock-check-outline": "M23.5 17L18.5 22L15 18.5L16.5 17L18.5 19L22 15.5L23.5 17M13.1 19.9C12.7 20 12.4 20 12 20C7.6 20 4 16.4 4 12S7.6 4 12 4 20 7.6 20 12C20 12.4 20 12.7 19.9 13.1C20.6 13.2 21.2 13.4 21.8 13.7C21.9 13.1 22 12.6 22 12C22 6.5 17.5 2 12 2S2 6.5 2 12C2 17.5 6.5 22 12 22C12.6 22 13.1 21.9 13.7 21.8C13.4 21.3 13.2 20.6 13.1 19.9M15.6 14.1L12.5 12.3V7H11V13L14.5 15.1C14.8 14.7 15.2 14.4 15.6 14.1Z",
    "restart": "M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z",
    "cancel": "M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z",
    # The sidebar panel.
    "cog": "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",
    "power-plug-outline": "M16 7V3H14V7H10V3H8V7C7 7 6 8 6 9V14.5L9.5 18V21H14.5V18L18 14.5V9C18 8 17 7 16 7M16 13.67L13.09 16.59L12.67 17H11.33L10.92 16.59L8 13.67V9.09C8 9.06 8.06 9 8.09 9H15.92C15.95 9 16 9.06 16 9.09V13.67Z",
    "power-cycle": "M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19M13,17H11V7H13V17Z",
    "devices": "M3 6H21V4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H7V18H3V6M13 12H9V13.78C8.39 14.33 8 15.11 8 16C8 16.89 8.39 17.67 9 18.22V20H13V18.22C13.61 17.67 14 16.88 14 16S13.61 14.33 13 13.78V12M11 17.5C10.17 17.5 9.5 16.83 9.5 16S10.17 14.5 11 14.5 12.5 15.17 12.5 16 11.83 17.5 11 17.5M22 8H16C15.5 8 15 8.5 15 9V19C15 19.5 15.5 20 16 20H22C22.5 20 23 19.5 23 19V9C23 8.5 22.5 8 22 8M21 18H17V10H21V18Z",
    "delete-outline": "M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z",
    "power-plug-off-outline": "M22.11 21.46L2.39 1.73L1.11 3L6.25 8.14C6.1 8.41 6 8.7 6 9V14.5L9.5 18V21H14.5V18L15.31 17.2L20.84 22.73L22.11 21.46M13.09 16.59L12.67 17H11.33L10.92 16.59L8 13.67V9.89L13.89 15.78L13.09 16.59M12.2 9L10.2 7H14V3H16V7C17 7 18 8 18 9V14.5L17.85 14.65L16 12.8V9.09C16 9.06 15.95 9 15.92 9H12.2M10 6.8L8 4.8V3H10V6.8Z",
    "plus": "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
    "content-save": "M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z",
    "close": "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
    "timer-sand": "M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5M10,6H14V6.75L12,8.75L10,6.75V6Z",
    "magnify": "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
    "power-socket-eu": "M7.5,10.5A1.5,1.5 0 0,1 9,12A1.5,1.5 0 0,1 7.5,13.5C6.66,13.5 6,12.83 6,12A1.5,1.5 0 0,1 7.5,10.5M16.5,10.5A1.5,1.5 0 0,1 18,12A1.5,1.5 0 0,1 16.5,13.5A1.5,1.5 0 0,1 15,12A1.5,1.5 0 0,1 16.5,10.5M4.22,2H19.78C21,2 22,3 22,4.22V19.78A2.22,2.22 0 0,1 19.78,22H4.22C3,22 2,21 2,19.78V4.22A2.22,2.22 0 0,1 4.22,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z",
    "toggle-switch-outline": "M17 6H7C3.69 6 1 8.69 1 12S3.69 18 7 18H17C20.31 18 23 15.31 23 12S20.31 6 17 6M17 16H7C4.79 16 3 14.21 3 12S4.79 8 7 8H17C19.21 8 21 9.79 21 12S19.21 16 17 16M17 9C15.34 9 14 10.34 14 12S15.34 15 17 15 20 13.66 20 12 18.66 9 17 9Z",
}

# Minimal stand-ins for Home Assistant's <ha-card> and <ha-icon>.
HA_ELEMENTS = (
    "const ICONS = "
    + json.dumps(ICONS)
    + ";"
    + """
customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--card-background-color);border-radius:12px;" +
      "border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});
customElements.define("ha-icon", class extends HTMLElement {
  static get observedAttributes() { return ["icon"]; }
  connectedCallback() { this._draw(); }
  attributeChangedCallback() { this._draw(); }
  _draw() {
    const path = ICONS[(this.getAttribute("icon") || "").replace("mdi:", "")] || "";
    this.style.display = "inline-flex";
    this.innerHTML = '<svg viewBox="0 0 24 24" style="width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px);fill:currentColor"><path d="' + path + '"/></svg>';
  }
});"""
)

UNAVAILABLE = "sensor.integration_watchdog_unavailable_integrations"
LAST_RELOAD = "sensor.integration_watchdog_last_reload"
LAST_CHECK = "sensor.integration_watchdog_last_check"
BUTTON = "button.integration_watchdog_check_now"


def ago(**delta) -> str:
    return (NOW - timedelta(**delta)).isoformat()


# Mock integrations: one given up, one reloaded once and still down, one within its grace period.
INTEGRATIONS = [
    {
        "domain": "zha",
        "title": "Zigbee coordinator",
        "entry_id": "e_zha",
        "since": ago(hours=5),
        "reloads": 3,
        "gave_up": True,
    },
    {
        "domain": "hue",
        "title": "Hue Bridge",
        "entry_id": "e_hue",
        "since": ago(minutes=40),
        "reloads": 1,
        "gave_up": False,
    },
    {
        "domain": "sonos",
        "title": "Sonos",
        "entry_id": "e_sonos",
        "since": ago(minutes=6),
        "reloads": 0,
        "gave_up": False,
    },
]


def event(kind, domain, title, attempt, **delta):
    return {
        "kind": kind,
        "at": ago(**delta),
        "entry_id": f"entry_{domain}",
        "domain": domain,
        "title": title,
        "attempt": attempt,
        "max_reloads": 3,
    }


HISTORY = [
    event("gave_up", "zha", "Zigbee coordinator", 3, minutes=20),
    event("reloaded", "hue", "Hue Bridge", 1, minutes=25),
    event("reload_failed", "zha", "Zigbee coordinator", 3, hours=1, minutes=20),
    event("reloaded", "zha", "Zigbee coordinator", 2, hours=4, minutes=20),
    event("reloaded", "tuya", "Tuya", 1, days=1, hours=2),
]


def mock_hass(integrations, history, reloads):
    platform = {"platform": "integration_watchdog", "device_id": "watchdog"}
    return {
        "states": {
            UNAVAILABLE: {
                "entity_id": UNAVAILABLE,
                "state": str(len(integrations)),
                "attributes": {
                    "integrations": [{**i, "entry_id": f"entry_{i['domain']}"} for i in integrations],
                    "ignored": ["mobile_app", "tts"],
                    "max_reloads": 3,
                },
            },
            LAST_RELOAD: {
                "entity_id": LAST_RELOAD,
                "state": history[0]["at"] if history else "unknown",
                "attributes": {"history": history, "reloads": reloads},
            },
            LAST_CHECK: {"entity_id": LAST_CHECK, "state": ago(minutes=2), "attributes": {}},
            BUTTON: {"entity_id": BUTTON, "state": "unknown", "attributes": {}},
        },
        "entities": {
            UNAVAILABLE: {**platform, "translation_key": "unavailable"},
            LAST_RELOAD: {**platform, "translation_key": "last_reload"},
            LAST_CHECK: {**platform, "translation_key": "last_check"},
            BUTTON: {**platform, "translation_key": "check"},
        },
        "language": "en",
        "locale": {"language": "en"},
        # An administrator: the rows open the integration's page.
        "user": {"is_admin": True},
    }


MINI = "integration-watchdog-mini-card"
MINI_WIDTH = 400

SHOTS = [
    {"file": "card", "theme": "light", "hass": (INTEGRATIONS, HISTORY, 4)},
    {"file": "card-dark", "theme": "dark", "hass": (INTEGRATIONS, HISTORY, 4)},
    {"file": "card-ok", "theme": "light", "hass": ([], HISTORY[1:], 3)},
    {"file": "card-ok-dark", "theme": "dark", "hass": ([], HISTORY[1:], 3)},
    # Mini card: compact, everything available, and zoomed in on the full card with its detail button.
    *(
        {
            "file": f"mini{suffix}{'-dark' if theme == 'dark' else ''}",
            "theme": theme,
            "card": MINI,
            "width": MINI_WIDTH,
            **extra,
        }
        for theme in ("light", "dark")
        for suffix, extra in (
            ("", {"hass": (INTEGRATIONS, HISTORY, 4)}),
            ("-ok", {"hass": ([], HISTORY[1:], 3)}),
            ("-zoom", {"hass": (INTEGRATIONS, HISTORY, 4), "zoom": True}),
        )
    ),
]


# What the panel's integration_watchdog/settings command answers: the stored options, the power cycles and the choices
# of the forms (neutral names).
PANEL_SETTINGS = {
    "entry": {"entry_id": "watchdog", "state": "loaded", "device_id": "watchdog", "last_check": ago(minutes=2)},
    "options": {
        "scan_interval": 5,
        "grace_period": 15,
        "grace_overrides": "zha: 30",
        "max_reloads": 3,
        "ignored_integrations": ["mobile_app"],
        "ignored_entries": [],
        "pause_entity": "input_boolean.maintenance",
        "notify_services": ["notify.mobile_app_phone"],
    },
    "limits": {
        "scan_interval": [1, 1440],
        "grace_period": [1, 1440],
        "max_reloads": [1, 10],
        "delay": [1, 1440],
        "off_time": [1, 300],
    },
    "defaults": {"delay": 10, "off_time": 10},
    "power_cycles": [
        {
            "device_id": "router",
            "device_name": "Internet box",
            "area": "Office",
            "switch": "switch.router_plug",
            "switch_name": "Router plug",
            "switch_state": "on",
            "delay": 10,
            "off_time": 15,
            "unavailable": False,
            "count": 0,
            "gave_up": False,
        },
        {
            "device_id": "hub",
            "device_name": "Zigbee hub",
            "area": "Hallway",
            "switch": "switch.hub_plug",
            "switch_name": "Hub plug",
            "switch_state": "on",
            "delay": 20,
            "off_time": 10,
            "unavailable": True,
            "count": 1,
            "gave_up": False,
        },
        {
            "device_id": "camera",
            "device_name": "Garden camera",
            "area": "Garden",
            "switch": "switch.garden_plug",
            "switch_name": "Garden plug",
            "switch_state": "off",
            "delay": 30,
            "off_time": 30,
            "unavailable": True,
            "count": 0,
            "gave_up": False,
        },
    ],
    "device_options": [
        {"value": "nas", "label": "NAS", "detail": "synology_dsm", "area": "Office"},
        {"value": "printer", "label": "Printer", "detail": "ipp", "area": "Office"},
        {"value": "tv", "label": "Living room TV", "detail": "webostv", "area": "Living room"},
        {"value": "speaker", "label": "Speaker", "detail": "cast", "area": "Living room"},
        {"value": "purifier", "label": "Air purifier", "detail": "xiaomi_miio", "area": "Bedroom"},
        {"value": "doorbell", "label": "Doorbell", "detail": "ring", "area": "Hallway"},
        {"value": "mesh", "label": "Wi-Fi mesh node", "detail": "tplink_deco", "area": ""},
    ],
    "switch_options": [
        {
            "value": "switch.nas_plug",
            "label": "NAS plug",
            "detail": "Smart plug",
            "area": "Office",
            "device_id": "plug1",
            "outlet": True,
        },
        {
            "value": "switch.desk_plug",
            "label": "Desk plug",
            "detail": "Smart plug",
            "area": "Office",
            "device_id": "plug2",
            "outlet": True,
        },
        {
            "value": "switch.tv_plug",
            "label": "TV plug",
            "detail": "Smart plug",
            "area": "Living room",
            "device_id": "plug3",
            "outlet": True,
        },
        {
            "value": "switch.lamp",
            "label": "Floor lamp",
            "detail": "Relay",
            "area": "Living room",
            "device_id": "relay",
            "outlet": False,
        },
        {
            "value": "switch.heater",
            "label": "Heater",
            "detail": "Smart plug",
            "area": "Bedroom",
            "device_id": "plug4",
            "outlet": True,
        },
    ],
    "pause_options": [{"value": "input_boolean.maintenance", "label": "Maintenance"}],
    "integration_options": [
        {"value": "mobile_app", "label": "Mobile App"},
        {"value": "zha", "label": "Zigbee Home Automation"},
    ],
    "entry_options": [],
    "notify_options": ["notify.mobile_app_phone", "notify.mobile_app_tablet"],
}


def _flat(data, prefix):
    out = {}
    for key, value in data.items():
        if isinstance(value, dict):
            out.update(_flat(value, f"{prefix}.{key}"))
        else:
            out[f"{prefix}.{key}"] = value
    return out


# frontend/get_translations, category options: the labels and hints of the forms.
PANEL_STRINGS = _flat(TRANSLATIONS["options"], "component.integration_watchdog.options")
PANEL_SHOTS = [
    {
        "file": f"panel{'' if tab == 'status' else '-' + tab.replace('_', '-')}{'-dark' if theme == 'dark' else ''}",
        "theme": theme,
        "tab": tab,
    }
    for tab in ("status", "power_cycles", "settings")
    for theme in ("light", "dark")
]

# Mounts the sidebar panel: the card inside it reads the mock states, the forms the mock settings.
MOUNT_PANEL = """([hass, settings, strings, tab, dark]) => {
    const el = document.createElement("integration-watchdog-panel");
    el.panel = { config: {} };
    el.narrow = false;
    el.hass = {
        ...hass,
        themes: { darkMode: dark },
        callService: async () => {},
        callWS: async (msg) =>
            msg.type === "integration_watchdog/settings" ? settings : msg.type === "frontend/get_translations" ? { resources: strings } : { ok: true },
        connection: { subscribeMessage: async () => () => {} },
    };
    document.getElementById("root").appendChild(el);
    el._goTab(tab);
}"""


def page_html(theme, width, padding=16):
    variables = "".join(f"{k}:{v};" for k, v in {**THEMES[theme], **COMMON}.items())
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
:root {{ {variables} }}
body {{ margin: 0; padding: {padding}px; background: var(--primary-background-color);
       font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: {width}px; }}
</style></head><body><div id="root"></div></body></html>"""


MOUNT = """([hass, dark, card, zoom]) => {
    const el = document.createElement(card);
    el.setConfig({ type: `custom:${card}` });
    el.hass = { ...hass, themes: { darkMode: dark }, callService: async () => {} };
    document.getElementById("root").appendChild(el);
    // The mini card zoomed in: its detail button clicked with the mouse (no focus ring), the full card shown.
    if (zoom) el.shadowRoot.querySelector(".zoom").dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
}"""


# Decodes two PNGs (base64) in the browser and tells whether their pixels are the same: no image library needed.
SAME_PIXELS = """async ([a, b]) => {
    const decode = async (data) => {
        const img = new Image();
        img.src = "data:image/png;base64," + data;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    const [x, y] = [await decode(a), await decode(b)];
    if (x.width !== y.width || x.height !== y.height) return false;
    for (let i = 0; i < x.data.length; i++) if (x.data[i] !== y.data[i]) return false;
    return true;
}"""


def same_pixels(page, new: bytes, path: Path) -> bool:
    """True when `path` exists and holds exactly the pixels of the `new` PNG."""
    if not path.exists():
        return False
    old = path.read_bytes()
    if old == new:
        return True
    return page.evaluate(SAME_PIXELS, [base64.b64encode(new).decode(), base64.b64encode(old).decode()])


def save(page, name: str, width: int, frame: int) -> None:
    """Shoot #root (`frame` px of background added below it) into screenshots/<name>.png when its pixels changed."""
    box = page.locator("#root").bounding_box()
    clip = {"x": 0, "y": 0, "width": width, "height": int(box["height"] + 0.999) + frame}
    path = ROOT / "screenshots" / f"{name}.png"
    path.parent.mkdir(exist_ok=True)
    png = page.screenshot(clip=clip, animations="disabled")
    if same_pixels(page, png, path):
        print(f"{path.relative_to(ROOT)} (unchanged)")
    else:
        path.write_bytes(png)
        print(path.relative_to(ROOT))
    page.close()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or None)
        for shot in SHOTS:
            page = browser.new_page(device_scale_factor=2, viewport={"width": 1000, "height": 1600})
            page.on("pageerror", lambda err, name=shot["file"]: print(f"{name}: page error: {err}"))
            # No integration logo: the generic icon, the same on every machine.
            page.route("https://brands.home-assistant.io/**", lambda route: route.abort())
            page.clock.set_fixed_time(NOW.isoformat())
            width = shot.get("width", WIDTH)
            page.set_content(page_html(shot["theme"], width))
            page.add_script_tag(content=HA_ELEMENTS)
            page.add_script_tag(content=CARD_JS)
            card = shot.get("card", "integration-watchdog-card")
            page.evaluate(MOUNT, [mock_hass(*shot["hass"]), shot["theme"] == "dark", card, shot.get("zoom", False)])
            page.wait_for_timeout(400)
            save(page, shot["file"], width + 32, 32)
        for shot in PANEL_SHOTS:
            page = browser.new_page(device_scale_factor=2, viewport={"width": PANEL_WIDTH, "height": 1400})
            page.on("pageerror", lambda err, name=shot["file"]: print(f"{name}: page error: {err}"))
            page.route("https://brands.home-assistant.io/**", lambda route: route.abort())
            page.clock.set_fixed_time(NOW.isoformat())
            page.set_content(page_html(shot["theme"], PANEL_WIDTH, 0))
            page.add_script_tag(content=HA_ELEMENTS)
            page.add_script_tag(content=CARD_JS)
            page.add_script_tag(content=PANEL_JS)
            hass = mock_hass(INTEGRATIONS, HISTORY, 4)
            page.evaluate(MOUNT_PANEL, [hass, PANEL_SETTINGS, PANEL_STRINGS, shot["tab"], shot["theme"] == "dark"])
            page.wait_for_timeout(500)
            save(page, shot["file"], PANEL_WIDTH, 0)
        browser.close()


if __name__ == "__main__":
    main()
