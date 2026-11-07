"""Render the Integration Watchdog card with mock data and save the README screenshots.

Usage: python scripts/screenshots.py  (needs `pip install playwright` and `playwright install chromium`)
CHROMIUM_PATH=/path/to/chrome to use another browser. The clock is frozen so the durations and "x min ago" stay the same.
Integration logos are not fetched (the generic icon is shown), so the captures don't depend on the network.
Every capture keeps a 16 px frame of the theme background around the card.
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


def page_html(theme, width):
    variables = "".join(f"{k}:{v};" for k, v in {**THEMES[theme], **COMMON}.items())
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
:root {{ {variables} }}
body {{ margin: 0; padding: 16px; background: var(--primary-background-color);
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
            box = page.locator("#root").bounding_box()
            clip = {"x": 0, "y": 0, "width": width + 32, "height": int(box["height"] + 0.999) + 32}
            path = ROOT / "screenshots" / f"{shot['file']}.png"
            path.parent.mkdir(exist_ok=True)
            png = page.screenshot(clip=clip, animations="disabled")
            if same_pixels(page, png, path):
                print(f"{path.relative_to(ROOT)} (unchanged)")
            else:
                path.write_bytes(png)
                print(path.relative_to(ROOT))
            page.close()
        browser.close()


if __name__ == "__main__":
    main()
