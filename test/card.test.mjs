// Unit tests for the card: the card file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(
  new URL('../custom_components/integration_watchdog/frontend/integration-watchdog-card.js', import.meta.url),
  'utf8',
);

// Elements found in the rendered HTML by a selector: enough to click the check button.
const fakeNode = () => ({
  innerHTML: '',
  style: {},
  handlers: {},
  addEventListener(type, fn) {
    this.handlers[type] = fn;
  },
  appendChild() {},
  // An ha-form stand-in: what the user changes in the editor.
  dispatch(value) {
    this.handlers['value-changed']({ detail: { value } });
  },
  attachShadow() {
    const elements = {};
    this.shadowRoot = {
      innerHTML: '',
      querySelector: (sel) => {
        if (sel !== '.check' || !this.shadowRoot.innerHTML.includes('class="check"')) return null;
        elements[sel] ||= fakeNode();
        return elements[sel];
      },
      querySelectorAll: () => [],
      elements,
    };
    return this.shadowRoot;
  },
});
const windowListeners = {};
const pushed = [];
const context = {
  HTMLElement: class {},
  customElements: { get: () => true, define() {} },
  window: {
    history: { pushState: (_s, _t, url) => pushed.push(url) },
    addEventListener: (type, fn) => (windowListeners[type] = fn),
    dispatchEvent() {},
  },
  document: { createElement: () => fakeNode() },
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
  Intl,
  console,
  Date,
};
vm.createContext(context);
vm.runInContext(
  `${source}\nthis.iw = { IntegrationWatchdogCard, IntegrationWatchdogCardEditor, IW_I18N, iwEsc, iwLang, iwDevices, IW_DEFAULTS };`,
  context,
);
const { IntegrationWatchdogCard, IntegrationWatchdogCardEditor, IW_I18N, iwEsc, iwLang, iwDevices, IW_DEFAULTS } = context.iw;

const UNAVAILABLE = 'sensor.integration_watchdog_unavailable_integrations';
const LAST_RELOAD = 'sensor.integration_watchdog_last_reload';
const LAST_CHECK = 'sensor.integration_watchdog_last_check';
const BUTTON = 'button.integration_watchdog_check_now';

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

const REGISTRY = {
  [UNAVAILABLE]: { platform: 'integration_watchdog', device_id: 'd1', translation_key: 'unavailable' },
  [LAST_RELOAD]: { platform: 'integration_watchdog', device_id: 'd1', translation_key: 'last_reload' },
  [LAST_CHECK]: { platform: 'integration_watchdog', device_id: 'd1', translation_key: 'last_check' },
  [BUTTON]: { platform: 'integration_watchdog', device_id: 'd1', translation_key: 'check' },
  'sensor.other': { platform: 'demo', device_id: 'd2' },
};

const event = (kind, title, attempt, at) => ({
  kind,
  at,
  entry_id: `id_${title}`,
  domain: title.toLowerCase(),
  title,
  attempt,
  max_reloads: 3,
});

function makeHass({ integrations = [], history = [], reloads = 0, button = 'unknown', language = 'en', entities = REGISTRY } = {}) {
  const calls = [];
  return {
    calls,
    language,
    entities,
    states: {
      [UNAVAILABLE]: {
        state: String(integrations.length),
        attributes: { integrations, ignored: ['mobile_app', 'zha'], max_reloads: 3 },
      },
      [LAST_RELOAD]: { state: history[0]?.at || 'unknown', attributes: { history, reloads } },
      [LAST_CHECK]: { state: minutesAgo(3), attributes: {} },
      [BUTTON]: { state: button, attributes: {} },
    },
    callService: (...args) => calls.push(args),
  };
}

function render(config, hass) {
  const card = new IntegrationWatchdogCard();
  card.attachShadow = fakeNode().attachShadow;
  card.style = {};
  card.dispatchEvent = () => {};
  card.setConfig(config);
  card.hass = hass;
  return card;
}

const html = (card) => card.shadowRoot.innerHTML;

test('every language has the English keys', () => {
  const keys = Object.keys(IW_I18N.en).sort();
  for (const [lang, strings] of Object.entries(IW_I18N)) {
    assert.deepEqual(Object.keys(strings).sort(), keys, lang);
  }
});

test('language follows Home Assistant, then the config, with English as fallback', () => {
  assert.equal(iwLang({ language: 'fr-FR' }, {}), 'fr');
  assert.equal(iwLang({ language: 'fr' }, { language: 'de' }), 'de');
  assert.equal(iwLang({ language: 'ja' }, {}), 'en');
});

test('entities found by translation key, or by entity ID when it is missing', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(iwDevices(REGISTRY).d1)), { unavailable: UNAVAILABLE, last_reload: LAST_RELOAD, last_check: LAST_CHECK, button: BUTTON });
  const noKeys = Object.fromEntries(Object.entries(REGISTRY).map(([id, e]) => [id, { ...e, translation_key: undefined }]));
  assert.equal(iwDevices(noKeys).d1.unavailable, UNAVAILABLE);
  assert.equal(iwDevices(noKeys).d1.button, BUTTON);
});

test('all available: ok status, summary and empty history', () => {
  const card = render({}, makeHass());
  const out = html(card);
  assert.match(out, /lvl-ok/);
  assert.match(out, /All available/);
  assert.match(out, /Checked 3 minutes ago/);
  assert.match(out, /No reload yet/);
  assert.doesNotMatch(out, />Unavailable integrations</);
  // Summary: 0 unavailable, 0 reloads, 2 ignored.
  assert.match(out, /<span class="val">2<\/span><span class="lbl">Ignored/);
});

test('unavailable integrations: warning, reloads done, waiting for the grace period', () => {
  const hass = makeHass({
    integrations: [
      { domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(130), reloads: 2, gave_up: false },
      { domain: 'hue', title: 'Hue', entry_id: 'b', since: minutesAgo(5), reloads: 0, gave_up: false },
    ],
  });
  const out = html(render({}, hass));
  assert.match(out, /lvl-warn/);
  assert.match(out, /2 unavailable/);
  assert.match(out, /Zigbee/);
  assert.match(out, /zha · unavailable for 2 h/);
  assert.match(out, /2\/3 reloads/);
  assert.match(out, /Grace period/);
});

test('an integration given up is an alert, counted apart', () => {
  const hass = makeHass({
    integrations: [
      { domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(600), reloads: 3, gave_up: true },
      { domain: 'hue', title: 'Hue', entry_id: 'b', since: minutesAgo(20), reloads: 1, gave_up: false },
    ],
  });
  const out = html(render({}, hass));
  assert.match(out, /lvl-alert/);
  assert.match(out, /1 unavailable · 1 given up/);
  assert.match(out, /Given up/);
});

test('recent reloads: newest first, limited by history_count, with their outcome', () => {
  const history = [
    event('gave_up', 'Zigbee', 3, minutesAgo(10)),
    event('reload_failed', 'Zigbee', 3, minutesAgo(70)),
    event('reloaded', 'Hue', 1, minutesAgo(200)),
  ];
  const out = html(render({ history_count: 2 }, makeHass({ history, reloads: 4 })));
  assert.match(out, /Recent reloads/);
  assert.match(out, /after 3 reloads/);
  assert.match(out, /reload 3\/3/);
  assert.match(out, /Failed/);
  assert.doesNotMatch(out, /Hue/);
  assert.ok(out.indexOf('after 3 reloads') < out.indexOf('Failed'));
  assert.match(out, /<span class="val">4<\/span><span class="lbl">Reloads/);
  assert.match(html(render({}, makeHass({ history }))), /Hue/);
});

test('history_count is kept between 1 and 20', () => {
  const history = Array.from({ length: 25 }, (_, i) => event('reloaded', `I${i}x`, 1, minutesAgo(i)));
  const rows = (card) => (html(card).match(/class="row hist/g) || []).length;
  assert.equal(rows(render({ history_count: 100 }, makeHass({ history }))), 20);
  assert.equal(rows(render({ history_count: -3 }, makeHass({ history }))), 1);
});

test('sections can be hidden', () => {
  const hass = makeHass({
    integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(30), reloads: 1, gave_up: false }],
    history: [event('reloaded', 'Zigbee', 1, minutesAgo(10))],
  });
  const out = html(render({ show_stats: false, show_unavailable: false, show_history: false }, hass));
  assert.doesNotMatch(out, /class="stats"/);
  assert.doesNotMatch(out, /class="row/);
  assert.match(out, /1 unavailable/);
});

test('hide_when_ok hides the card only while everything is available', () => {
  const card = render({ hide_when_ok: true }, makeHass());
  assert.equal(card.style.display, 'none');
  card.hass = makeHass({ integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(1), reloads: 0 }] });
  assert.equal(card.style.display, '');
});

test('check button presses the button, disabled while a check runs', () => {
  const hass = makeHass();
  const card = render({}, hass);
  card.shadowRoot.querySelector('.check').handlers.click();
  assert.equal(JSON.stringify(hass.calls), JSON.stringify([['button', 'press', { entity_id: BUTTON }]]));
  const running = render({}, makeHass({ button: 'unavailable' }));
  assert.match(html(running), /Checking…/);
  assert.match(html(running), /class="check"[^>]*disabled/);
  assert.doesNotMatch(html(render({ check_button: false }, makeHass())), /class="check"/);
});

test('not set up: tells so', () => {
  const out = html(render({}, { ...makeHass(), entities: {}, states: {} }));
  assert.match(out, /lvl-na/);
  assert.match(out, /Integration Watchdog is not set up/);
});

test('titles and names are escaped', () => {
  const hass = makeHass({ history: [event('reloaded', '<b>x</b>', 1, minutesAgo(1))] });
  const out = html(render({ title: '"><img>' }, hass));
  assert.doesNotMatch(out, /<b>x<\/b>/);
  assert.doesNotMatch(out, /"><img>/);
  assert.equal(iwEsc(`<&>"'`), '&lt;&amp;&gt;&quot;&#39;');
});

test('French', () => {
  const hass = makeHass({
    language: 'fr',
    integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(30), reloads: 1, gave_up: false }],
    history: [event('reloaded', 'Zigbee', 1, minutesAgo(10))],
  });
  const out = html(render({}, hass));
  assert.match(out, /1 indisponible/);
  assert.match(out, /Derniers rechargements/);
  assert.match(out, /rechargement 1\/3/);
});

test('no re-render while nothing changed', () => {
  const hass = makeHass();
  const card = render({}, hass);
  card.shadowRoot.innerHTML = 'kept';
  card.hass = { ...hass };
  assert.equal(card.shadowRoot.innerHTML, 'kept');
});

test('editor leaves the defaults out of the YAML', () => {
  const editor = new IntegrationWatchdogCardEditor();
  editor.appendChild = () => {};
  const sent = [];
  editor.dispatchEvent = (ev) => sent.push(ev.detail.config);
  editor.setConfig({});
  editor.hass = makeHass();
  editor._form.dispatch({ ...IW_DEFAULTS, title: '', history_count: 8, show_stats: false });
  assert.deepEqual(JSON.parse(JSON.stringify(sent.at(-1))), { history_count: 8, show_stats: false });
  // The count is only offered while the history is shown.
  assert.ok(editor._form.schema.some((s) => s.name === 'history_count'));
  editor.setConfig({ show_history: false });
  assert.ok(!editor._form.schema.some((s) => s.name === 'history_count'));
});

// The sensor while the watchdog is not loaded (entry disabled or failed, Home Assistant starting): restored, no list.
const notLoaded = (hass) => ({
  ...hass,
  states: { ...hass.states, [UNAVAILABLE]: { state: 'unavailable', attributes: { restored: true, friendly_name: 'Unavailable integrations' } } },
});

test('chosen sensor unavailable: not set up, never "All available", never hidden', () => {
  for (const config of [{ entity: UNAVAILABLE }, { entity: UNAVAILABLE, hide_when_ok: true }, {}]) {
    const card = render(config, notLoaded(makeHass()));
    const out = html(card);
    assert.match(out, /lvl-na/, JSON.stringify(config));
    assert.match(out, /Integration Watchdog is not set up/, JSON.stringify(config));
    assert.doesNotMatch(out, /All available/, JSON.stringify(config));
    assert.equal(card.style.display, '', JSON.stringify(config));
  }
});

test('sensor back after being unavailable: shown at once, same registry and minute', () => {
  for (const config of [{}, { entity: UNAVAILABLE }]) {
    const hass = makeHass();
    const card = render(config, notLoaded(hass));
    assert.match(html(card), /not set up/);
    card.hass = makeHass({ integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(1), reloads: 0 }] });
    assert.match(html(card), /1 unavailable/, JSON.stringify(config));
  }
});

test('sensor going unavailable after being loaded: the card follows', () => {
  const hass = makeHass();
  const card = render({}, hass);
  assert.match(html(card), /All available/);
  card.hass = notLoaded(hass);
  assert.match(html(card), /not set up/);
});
