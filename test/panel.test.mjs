// Unit tests for the sidebar panel: the panel file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const source = readFileSync(
  new URL('../custom_components/integration_watchdog/frontend/integration-watchdog-panel.js', import.meta.url),
  'utf8',
);
// attachShadow returns a root without elements: rendering is skipped (see _renderTabs)
const shadow = { getElementById: () => null, querySelector: () => null };
const context = {
  HTMLElement: class {
    attachShadow() {
      this.shadowRoot = shadow;
      return shadow;
    }
  },
  customElements: {
    defined: new Set(['integration-watchdog-card']),
    get(name) {
      return this.defined.has(name);
    },
    define() {},
    whenDefined: async () => {},
  },
  CSS: { escape: (s) => String(s) },
  console: { ...console, error() {} },
  setTimeout: () => 0,
  clearTimeout() {},
};
vm.createContext(context);
vm.runInContext(
  `${source}\nthis.panel = { IntegrationWatchdogPanel, IntegrationWatchdogPanelI18n, IW_PANEL_TABS, IW_PANEL_PICK_MAX, iwPanelT, iwPanelEsc, iwPanelTone, iwPanelOverrides, iwPanelMatch, iwPanelGroups, iwPanelEntities, iwPanelEvent };`,
  context,
);
const {
  IntegrationWatchdogPanel,
  IntegrationWatchdogPanelI18n,
  IW_PANEL_TABS,
  IW_PANEL_PICK_MAX,
  iwPanelT,
  iwPanelEsc,
  iwPanelTone,
  iwPanelOverrides,
  iwPanelMatch,
  iwPanelGroups,
  iwPanelEntities,
  iwPanelEvent,
} = context.panel;

const LANGUAGES = [
  'bg', 'cs', 'da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'lv', 'nl', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sr-Latn', 'sv', 'uk',
];
const plain = (x) => JSON.parse(JSON.stringify(x));
const placeholders = (s) => [...String(s).matchAll(/\{\w+\}/g)].map((m) => m[0]).sort();

test('panel i18n parity: every language has exactly the English keys and placeholders, and no empty text', () => {
  const en = IntegrationWatchdogPanelI18n.en;
  assert.deepEqual(Object.keys(IntegrationWatchdogPanelI18n).sort(), LANGUAGES);
  for (const lang of LANGUAGES) {
    const strings = IntegrationWatchdogPanelI18n[lang];
    assert.deepEqual(Object.keys(strings).sort(), Object.keys(en).sort(), `keys of ${lang}`);
    for (const key of Object.keys(en)) {
      assert.ok(strings[key], `${lang}.${key} is empty`);
      assert.deepEqual(placeholders(strings[key]), placeholders(en[key]), `placeholders of ${lang}.${key}`);
    }
  }
});

test('panel i18n Serbian: the Latin table is the Cyrillic one letter for letter, each in its own script', () => {
  const cyr = 'абвгдђежзијклљмнњопрстћуфхцчџш';
  const lat = ['a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'dž', 'š'];
  const map = new Map();
  [...cyr].forEach((c, i) => {
    map.set(c, lat[i]);
    map.set(c.toUpperCase(), lat[i][0].toUpperCase() + lat[i].slice(1));
  });
  for (const [key, text] of Object.entries(IntegrationWatchdogPanelI18n.sr)) {
    assert.equal([...text].map((c) => map.get(c) ?? c).join(''), IntegrationWatchdogPanelI18n['sr-Latn'][key], key);
    const latin = text.replace(/Integration Watchdog|Home Assistant|input_boolean|binary_sensor|switch|schedule|\{\w+\}/g, '');
    assert.ok(!/[a-zA-Z]/.test(latin), `${key} in Cyrillic`);
  }
});

test('helpers: text with placeholders and English fallback, escaping, entry tone, overrides compared as sets', () => {
  assert.equal(iwPanelT('fr', 'pc_count', { n: 1, max: 3 }), 'redémarrages : 1/3');
  assert.equal(iwPanelT('ja', 'save'), 'Save');
  assert.equal(iwPanelEsc('<b a="x">'), '&#60;b a=&#34;x&#34;&#62;');
  assert.equal(iwPanelTone('loaded'), 'good');
  assert.equal(iwPanelTone('setup_error'), 'bad');
  assert.equal(iwPanelOverrides('zha: 30\n\ntuya:90'), iwPanelOverrides('Tuya: 90, zha:30'));
  assert.deepEqual(plain(IW_PANEL_TABS), ['status', 'power_cycles', 'settings']);
});

const options = {
  scan_interval: 5,
  grace_period: 15,
  grace_overrides: 'zha: 30',
  max_reloads: 3,
  ignored_integrations: [],
  ignored_entries: [],
  pause_entity: null,
  notify_services: ['notify.phone'],
};

function panelWith(settings, calls = []) {
  const panel = new IntegrationWatchdogPanel();
  panel._hass = {
    language: 'en',
    callWS: async (msg) => {
      calls.push(msg);
      if (msg.type === 'integration_watchdog/settings') return settings;
      return { ok: true, options };
    },
  };
  panel._settings = settings;
  return panel;
}

const settings = () => ({
  entry: { state: 'loaded' },
  options: { ...options },
  limits: { scan_interval: [1, 1440], grace_period: [1, 1440], max_reloads: [1, 10], delay: [1, 1440], off_time: [1, 300] },
  defaults: { delay: 10, off_time: 10 },
  power_cycles: [
    { device_id: 'box', device_name: 'Internet box', switch: 'switch.box', switch_name: 'Box plug', switch_state: 'off', delay: 10, off_time: 10, unavailable: true, count: 1, gave_up: false },
  ],
  device_options: [
    { value: 'box', label: 'Internet box', detail: '' },
    { value: 'hub', label: 'Zigbee hub', detail: 'Hall' },
  ],
  switch_options: [
    { value: 'switch.box', label: 'Box plug', detail: '', device_id: 'plug1' },
    { value: 'switch.hub_led', label: 'Hub LED', detail: '', device_id: 'hub' },
  ],
  pause_options: [{ value: 'input_boolean.maintenance', label: 'Maintenance' }],
  integration_options: [],
  entry_options: [],
  notify_options: ['notify.phone'],
});

test('settings: typed values over the stored ones; Save only once something valid changed', () => {
  const panel = panelWith(settings());
  assert.ok(!panel._changed());
  panel._edit('grace_overrides', 'zha:30\n');
  assert.ok(!panel._changed());
  panel._edit('pause_entity', 'input_boolean.maintenance');
  assert.ok(panel._changed());
  panel._edit('scan_interval', '0');
  assert.ok(!panel._valid());
  panel._edit('scan_interval', '10');
  assert.ok(panel._valid());
});

test('Save sends every setting with numbers, and the pause entity as null when none', async () => {
  const calls = [];
  const panel = panelWith(settings(), calls);
  panel._edit('max_reloads', '4');
  await panel._save();
  assert.deepEqual(plain(calls[0]), {
    type: 'integration_watchdog/update_settings',
    scan_interval: 5,
    grace_period: 15,
    max_reloads: 4,
    grace_overrides: 'zha: 30',
    ignored_integrations: [],
    ignored_entries: [],
    pause_entity: null,
    notify_services: ['notify.phone'],
  });
  assert.equal(panel._status.save.text, 'Saved');
  assert.deepEqual(plain(panel._drafts), {});
});

test('power cycles: the list shows the plug, the delays, the state and a warning for a plug off', () => {
  const panel = panelWith(settings());
  const html = panel._cycleHtml(panel._settings.power_cycles[0]);
  assert.match(html, /Internet box/);
  assert.match(html, /Box plug · unavailable for 10 min · off for 10 s · power cycles: 1\/3/);
  assert.match(html, /pill warn">Unavailable/);
  assert.match(html, /Plug off: left alone/);
  assert.match(html, /data-do="remove" data-device="box"/);
  const gaveUp = panel._cycleHtml({ ...panel._settings.power_cycles[0], gave_up: true, switch_state: 'on' });
  assert.match(gaveUp, /pill bad">Given up/);
  assert.doesNotMatch(gaveUp, /Plug off/);
});

test('add form: devices already cycled and the plugs of the chosen device are not offered; Add sends the form', async () => {
  const calls = [];
  const panel = panelWith(settings(), calls);
  let html = panel._addHtml();
  assert.doesNotMatch(html, /value="box"/);
  assert.match(html, /value="hub"/);
  assert.match(html, /value="switch.hub_led"/);
  panel._cycle.device_id = 'hub';
  html = panel._addHtml();
  assert.doesNotMatch(html, /value="switch.hub_led"/);
  assert.ok(!panel._cycleValid());
  panel._cycle.switch = 'switch.box';
  panel._cycle.off_time = '20';
  assert.ok(panel._cycleValid());
  await panel._add();
  assert.deepEqual(plain(calls[0]), {
    type: 'integration_watchdog/add_power_cycle',
    device_id: 'hub',
    switch: 'switch.box',
    delay: 10,
    off_time: 20,
  });
  assert.equal(panel._status.cycle.text, 'Power cycle added');
  assert.deepEqual(plain(panel._cycle), {});
});

test('pickers: search without case nor accents on every word, grouped by area, outlets first', () => {
  const options = [
    { value: 'switch.a', label: 'Lampe', area: 'Salón', detail: 'Hue' },
    { value: 'switch.b', label: 'Prise box', area: 'Bureau', detail: 'Tapo', outlet: true },
    { value: 'switch.c', label: 'Ventilo', area: 'Bureau', detail: 'Tuya' },
    { value: 'switch.d', label: 'Garage', area: '', detail: '' },
  ];
  assert.deepEqual(plain(iwPanelMatch(options, 'SALON')).map((o) => o.value), ['switch.a']);
  assert.deepEqual(plain(iwPanelMatch(options, 'bureau tapo')).map((o) => o.value), ['switch.b']);
  assert.equal(iwPanelMatch(options, '  ').length, 4);
  const groups = (first) => plain(iwPanelGroups(options, first)).map(([area, items]) => [area, items.map((o) => o.value)]);
  assert.deepEqual(groups(''), [['Bureau', ['switch.b', 'switch.c']], ['Salón', ['switch.a']], ['', ['switch.d']]]);
  assert.deepEqual(groups('Salón')[0], ['Salón', ['switch.a']]);
});

test('pickers: the plugs of the device area first, a bounded list, Change and a choice that drops the own plug', () => {
  const data = settings();
  data.device_options[1].area = 'Hall';
  data.switch_options.push({ value: 'switch.hall', label: 'Hall plug', detail: 'Plug', area: 'Hall', device_id: 'plug2', outlet: true });
  for (let i = 0; i < IW_PANEL_PICK_MAX + 5; i++) data.switch_options.push({ value: `switch.x${i}`, label: `Plug ${i}`, area: 'Attic' });
  const panel = panelWith(data);
  panel._cycle.device_id = 'hub';
  const list = panel._pickListHtml('switch');
  assert.equal(list.count, IW_PANEL_PICK_MAX);
  assert.match(list.html, /^<div class="pick-group" role="presentation">Hall · same area as the device<\/div>/);
  assert.match(list.html, /id="pick-switch-0" data-pick-value="switch.hall"/);
  assert.match(list.html, /\d+ more: type to narrow down/);
  panel._pick.switch.q = 'nothing like it';
  assert.equal(panel._pickListHtml('switch').count, 0);
  assert.match(panel._pickListHtml('switch').html, /No match/);
  // The device chosen shows with a Change button instead of its search
  assert.match(panel._pickHtml('device_id', 'Device', '', ''), /data-pick-clear="device_id"/);
  assert.doesNotMatch(panel._pickHtml('device_id', 'Device', '', ''), /data-pick="device_id"/);
  // Choosing the hub drops a plug of its own picked before
  panel._cycle = { switch: 'switch.hub_led' };
  panel._choose('device_id', 'hub');
  assert.equal(panel._cycle.switch, '');
  assert.equal(panel._pick.switch.q, 'nothing like it');
  panel._choose('switch', 'switch.box');
  assert.deepEqual(plain(panel._pick.switch), { q: '', active: 0 });
});

test('errors: the panel text, else the options flow error of the same key, else the message', () => {
  const panel = panelWith(settings());
  panel._strings.en = { 'component.integration_watchdog.options.error.switch_on_device': 'The plug is on the device' };
  assert.equal(panel._error({ error: 'unknown_device' }).text, 'Unknown device');
  assert.equal(panel._error({ error: 'switch_on_device' }).text, 'The plug is on the device');
  assert.equal(panel._error({ error: 'other', message: 'boom' }).text, 'boom');
  assert.equal(panel._error(null).text, 'Something went wrong');
});

test('labels come from the options flow translations, with the key as fallback', () => {
  const panel = panelWith(settings());
  assert.equal(panel._s('step.settings.data.scan_interval', 'scan_interval'), 'scan_interval');
  panel._strings.en = { 'component.integration_watchdog.options.step.settings.data.scan_interval': 'Check interval' };
  assert.match(panel._number('scan_interval', 5, 'u_min'), /<span>Check interval<\/span>/);
});

test('start: the settings and labels are requested at once, without loading the card', () => {
  const calls = [];
  const panel = panelWith(null, calls);
  panel._settings = null;
  panel._strings = {};
  panel._render = () => {}; // the stub shadow root has no elements
  panel._start();
  assert.deepEqual(
    calls.map((msg) => msg.type),
    ['integration_watchdog/settings', 'frontend/get_translations'],
  );
  assert.ok(!/integration-watchdog-card/.test(source.slice(source.indexOf('class IntegrationWatchdogPanel'))), 'no card in the panel');
});

test('status: the watchdog entities are found by translation key or id, on the device that lists the integrations', () => {
  const hass = {
    entities: {
      'sensor.iw_unavailable_integrations': { platform: 'integration_watchdog', device_id: 'd1' },
      'sensor.iw_last_reload': { platform: 'integration_watchdog', device_id: 'd1', translation_key: 'last_reload' },
      'sensor.iw_last_check': { platform: 'integration_watchdog', device_id: 'd1' },
      'button.iw_check_now': { platform: 'integration_watchdog', device_id: 'd1' },
      'sensor.old_unavailable_integrations': { platform: 'integration_watchdog', device_id: 'd0' },
      'sensor.other_last_reload': { platform: 'zha', device_id: 'd1' },
    },
    states: { 'sensor.iw_unavailable_integrations': { attributes: { integrations: [] } }, 'sensor.old_unavailable_integrations': { state: 'unavailable', attributes: {} } },
  };
  assert.deepEqual(plain(iwPanelEntities(hass)), {
    unavailable: 'sensor.iw_unavailable_integrations',
    last_reload: 'sensor.iw_last_reload',
    last_check: 'sensor.iw_last_check',
    check: 'button.iw_check_now',
  });
  assert.equal(iwPanelEntities({ entities: {}, states: {} }), null);
  assert.deepEqual(plain(iwPanelEvent('reloaded')), { tone: 'good', label: 'w_reloaded', cycle: false });
  assert.deepEqual(plain(iwPanelEvent('power_cycle_failed')), { tone: 'warn', label: 'w_power_cycle_failed', cycle: true });
  assert.deepEqual(plain(iwPanelEvent('power_cycle_gave_up')), { tone: 'bad', label: 'w_gave_up_event', cycle: true });
});

test('status: an unavailable integration links to its entry, says since when and its reloads; given up gets Try again', () => {
  const panel = panelWith(null);
  const since = new Date(Date.now() - 3 * 3600000).toISOString();
  const waiting = panel._unavailableItem({ title: '<Hue>', domain: 'hue', entry_id: 'e1', since, reloads: 1 }, 3);
  assert.match(waiting, /href="\/config\/integrations\/integration\/hue#config_entry=e1"/);
  assert.match(waiting, /&#60;Hue&#62;/);
  assert.match(waiting, /unavailable for 3 hours/);
  assert.match(waiting, /reload 1\/3|1\/3 reloads/);
  assert.doesNotMatch(waiting, /data-reset/);
  const givenUp = panel._unavailableItem({ title: 'Hue', domain: 'hue', entry_id: 'e1', gave_up: true }, 3);
  assert.match(givenUp, /class="item bad"/);
  assert.match(givenUp, /data-reset="e1"/);
  const cycle = panel._historyItem({ kind: 'power_cycled', title: 'Printer', domain: 'ipp', switch_name: 'Plug', attempt: 1, max_reloads: 3, at: since });
  assert.match(cycle, /Power cycled/);
  assert.match(cycle, /Plug · power cycle 1\/3/);
  assert.match(cycle, /3 hours ago/);
});

test('panel, narrow, route and hass set before the element was defined go through the setters once it is', () => {
  // In the release the element is defined once the page's language file is in: Home Assistant has already set
  // these on the element, as plain properties that hide the setters.
  const panel = Object.create(IntegrationWatchdogPanel.prototype);
  let started = 0;
  panel._start = () => started++;
  panel._subscribe = () => {};
  panel._watchConnection = () => {};
  panel._showTab = (tab) => {
    panel._tab = tab;
  };
  const hass = { language: 'fr' };
  const tab = IW_PANEL_TABS[1];
  const before = { panel: { url_path: 'x' }, narrow: true, route: { path: `/${tab}` }, hass };
  for (const [name, value] of Object.entries(before)) {
    Object.defineProperty(panel, name, { value, writable: true, enumerable: true, configurable: true });
  }
  panel.connectedCallback();
  assert.equal(started, 1, 'the panel starts');
  assert.equal(panel._hass, hass);
  assert.equal(panel._narrow, true);
  assert.equal(panel._panel, before.panel);
  assert.equal(panel._tab, tab, 'the tab of the address');
  for (const name of Object.keys(before)) assert.ok(!Object.hasOwn(panel, name), name);
  const next = { language: 'fr' };
  panel.hass = next;
  assert.equal(panel._hass, next, 'later updates reach the setter');
  assert.equal(started, 1);
});
