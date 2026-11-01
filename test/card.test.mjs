// Unit tests for the card: the card file is evaluated with stubs, no browser needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { contrast, over, resolve, rules } from './wcag.mjs';

const source = readFileSync(
  new URL('../custom_components/integration_watchdog/frontend/integration-watchdog-card.js', import.meta.url),
  'utf8',
);

// Keys of the elements focused by the card, and the options of each focus() call.
const focused = [];
const focusOptions = [];

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
      // The focusable elements of the rendered HTML, by their data-focus key.
      querySelectorAll: (sel) =>
        sel === '[data-focus]'
          ? [...this.shadowRoot.innerHTML.matchAll(/data-focus="([^"]*)"/g)].map(([, key]) => ({
              dataset: { focus: key.replace(/&amp;/g, '&').replace(/&quot;/g, '"') },
              focus(options) {
                focused.push(key);
                focusOptions.push(options);
              },
            }))
          : [],
      activeElement: null,
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
  `${source}\nthis.iw = { IntegrationWatchdogCard, IntegrationWatchdogCardEditor, IW_I18N, iwEsc, iwLang, iwLocale, iwDevices, IW_DEFAULTS, iwT };`,
  context,
);
const { IntegrationWatchdogCard, IntegrationWatchdogCardEditor, IW_I18N, iwEsc, iwLang, iwLocale, iwDevices, IW_DEFAULTS, iwT } = context.iw;

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
    user: { is_admin: true },
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

// The {x} placeholders of a string, sorted.
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('every language has the English keys, arrays and placeholders', () => {
  const keys = Object.keys(IW_I18N.en).sort();
  for (const lang of ['fr', 'de', 'es', 'it', 'nl', 'pt', 'pl', 'sr', 'sr-Latn']) assert.ok(IW_I18N[lang], lang);
  for (const [lang, strings] of Object.entries(IW_I18N)) {
    // A "_few" form (2-4 in Serbian and Polish) is optional, next to the "_one"/"_many" forms of English.
    const few = Object.keys(strings).filter((k) => k.endsWith('_few'));
    for (const k of few) assert.ok(IW_I18N.en[k.replace(/_few$/, '_many')], `${lang}.${k}`);
    for (const k of few) assert.deepEqual(placeholders(strings[k]), placeholders(IW_I18N.en[k.replace(/_few$/, '_many')]), `${lang}.${k}`);
    assert.deepEqual(Object.keys(strings).filter((k) => !k.endsWith('_few')).sort(), keys, lang);
    for (const key of keys) {
      const en = IW_I18N.en[key];
      const other = strings[key];
      assert.equal(Array.isArray(other), Array.isArray(en), `${lang}.${key}`);
      if (Array.isArray(en)) assert.equal(other.length, en.length, `${lang}.${key}`);
      for (const [i, s] of (Array.isArray(en) ? en : [en]).entries()) {
        const o = Array.isArray(other) ? other[i] : other;
        assert.ok(String(o).trim(), `${lang}.${key}`);
        assert.deepEqual(placeholders(o), placeholders(s), `${lang}.${key}`);
      }
    }
  }
});

// Serbian: no Latin letter in Cyrillic, no Cyrillic in Latin, but brands, placeholders and units.
test('Serbian strings stay in their script', () => {
  const strip = (s) => s.replace(/Integration Watchdog|Home Assistant|\{\w+\}|\b(?:min|h|d)$/g, '');
  for (const [key, s] of Object.entries(IW_I18N.sr)) assert.doesNotMatch(strip(s), /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F]/, `sr.${key}`);
  for (const [key, s] of Object.entries(IW_I18N['sr-Latn'])) assert.doesNotMatch(s, /[\u0400-\u04FF]/, `sr-Latn.${key}`);
});

test('language follows Home Assistant, then the config, with English as fallback', () => {
  assert.equal(iwLang({ language: 'fr-FR' }, {}), 'fr');
  assert.equal(iwLang({ language: 'fr' }, { language: 'de' }), 'de');
  assert.equal(iwLang({ language: 'ja' }, {}), 'en');
  assert.equal(iwLang({ language: 'sr-Latn' }, {}), 'sr-Latn');
  assert.equal(iwLang({ language: 'sr' }, {}), 'sr');
  assert.equal(iwLang({ locale: { language: 'sr-Latn' }, language: 'sr' }, {}), 'sr-Latn');
  assert.equal(iwLang({ language: 'sr-Latn' }, { language: 'sr' }), 'sr');
});

test('Italian, Dutch, Portuguese and Polish: full tag, then the part before the dash, then English', () => {
  assert.equal(iwLang({ language: 'it-IT' }, {}), 'it');
  assert.equal(iwLang({ language: 'nl-BE' }, {}), 'nl');
  assert.equal(iwLang({ language: 'pt' }, {}), 'pt');
  // Brazilian Portuguese falls back to European Portuguese.
  assert.equal(iwLang({ language: 'pt-BR' }, {}), 'pt');
  assert.equal(iwLang({ language: 'pl-PL' }, {}), 'pl');
  assert.equal(iwLang({ language: 'sr-Latn' }, {}), 'sr-Latn');
  assert.equal(iwLang({ language: 'ja' }, {}), 'en');
  assert.equal(iwLang({ language: 'en' }, { language: 'pl' }), 'pl');
});

test('the editor offers every language of the card', () => {
  const editor = new IntegrationWatchdogCardEditor();
  editor.appendChild = () => {};
  editor.setConfig({});
  editor.hass = makeHass();
  const field = editor._form.schema.find((f) => f.name === 'language');
  assert.equal(JSON.stringify(field.selector.select.options.map((o) => o.value).sort()), JSON.stringify(Object.keys(IW_I18N).sort()));
  // European Portuguese is named as such: pt-BR users get it as a fallback.
  assert.equal(field.selector.select.options.find((o) => o.value === 'pt').label, 'Português (Portugal)');
});

test('Intl gets Home Assistant\'s full locale when it matches the card language', () => {
  assert.equal(iwLocale({ language: 'pt-BR' }, {}), 'pt-BR');
  assert.equal(iwLocale({ locale: { language: 'nl-BE' }, language: 'nl' }, {}), 'nl-BE');
  // Home Assistant's "pt" is European Portuguese: Intl must not fall back to Brazilian formats.
  assert.equal(iwLocale({ language: 'pt' }, {}), 'pt-PT');
  assert.equal(iwLocale({ locale: { language: 'pt' }, language: 'pt' }, {}), 'pt-PT');
  assert.equal(iwLocale({ language: 'en' }, { language: 'pt' }), 'pt-PT');
  assert.equal(iwLocale({ language: 'pt' }, { language: 'de' }), 'de');
  assert.equal(new Intl.NumberFormat(iwLocale({ language: 'pt' }, {})).format(12345), new Intl.NumberFormat('pt-PT').format(12345));
  assert.equal(iwLocale({ language: 'sr-Latn' }, {}), 'sr-Latn');
  // The card's language: option wins over a different Home Assistant language.
  assert.equal(iwLocale({ language: 'pt-BR' }, { language: 'pl' }), 'pl');
  assert.equal(iwLocale({ language: 'pt-BR' }, { language: 'pt' }), 'pt-BR');
  assert.equal(iwLocale({ language: 'ja' }, {}), 'en');
});

test('Serbian: Cyrillic and Latin, relative times included', () => {
  const hass = (language) =>
    makeHass({
      language,
      integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(30), reloads: 1, gave_up: false }],
      history: [event('reloaded', 'Zigbee', 1, minutesAgo(10))],
    });
  const cyr = html(render({}, hass('sr')));
  assert.match(cyr, /1 недоступна/);
  assert.match(cyr, /Недавна поновна учитавања/);
  assert.match(cyr, /Проверено пре 3 минута/);
  const lat = html(render({}, hass('sr-Latn')));
  assert.match(lat, /1 nedostupna/);
  assert.match(lat, /Nedavna ponovna učitavanja/);
  // Intl in sr-Latn writes the relative time in Latin script.
  assert.match(lat, /Provereno pre 3 minuta/);
  assert.doesNotMatch(lat, /[\u0400-\u04FF]/);
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
  assert.match(out, /Not set up/);
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
    assert.match(out, /Not set up/, JSON.stringify(config));
    assert.doesNotMatch(out, /All available/, JSON.stringify(config));
    assert.equal(card.style.display, '', JSON.stringify(config));
  }
});

test('sensor back after being unavailable: shown at once, same registry and minute', () => {
  for (const config of [{}, { entity: UNAVAILABLE }]) {
    const hass = makeHass();
    const card = render(config, notLoaded(hass));
    assert.match(html(card), /Not set up/);
    card.hass = makeHass({ integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(1), reloads: 0 }] });
    assert.match(html(card), /1 unavailable/, JSON.stringify(config));
  }
});

test('sensor going unavailable after being loaded: the card follows', () => {
  const hass = makeHass();
  const card = render({}, hass);
  assert.match(html(card), /All available/);
  card.hass = notLoaded(hass);
  assert.match(html(card), /Not set up/);
});

// Home Assistant's default light and dark themes (the colours of the screenshots).
const STATE_COLOURS = { '--success-color': '#43a047', '--warning-color': '#ffa600', '--error-color': '#db4437' };
const THEMES = {
  light: {
    ...STATE_COLOURS,
    '--card-background-color': '#ffffff',
    '--secondary-background-color': '#ececec',
    '--primary-text-color': '#212121',
    '--secondary-text-color': '#727272',
    '--disabled-color': '#bdbdbd',
  },
  dark: {
    ...STATE_COLOURS,
    '--card-background-color': '#1c1c1c',
    '--secondary-background-color': '#282828',
    '--primary-text-color': '#e1e1e1',
    '--secondary-text-color': '#9b9b9b',
    '--disabled-color': '#6f6f6f',
  },
};

test('text is readable on its tile in light and dark themes (WCAG AA, 4.5:1)', () => {
  const css = rules(IntegrationWatchdogCard.styles);
  const last = (selectors, prop) => selectors.map((s) => css[s]?.[prop]).filter(Boolean).at(-1);
  const level = { ok: 'var(--iw-ok)', warn: 'var(--iw-warn)', alert: 'var(--iw-alert)', na: 'var(--iw-na)' };
  // [what, custom properties of the element, selectors giving its colour, selectors of each background it sits on]
  const cases = [];
  for (const k of ['ok', 'warn', 'alert', 'na']) cases.push([`status pill ${k}`, { '--c': level[k] }, ['.pill'], [['.pill']]]);
  for (const k of ['warn', 'alert']) {
    const tile = [['.row:not(.hist)'], ['button.row:hover']];
    for (const text of ['.tag', '.name', '.sub']) cases.push([`unavailable ${k} ${text}`, { '--t': level[k] }, [text], tile]);
  }
  for (const k of ['ok', 'warn', 'alert']) {
    for (const text of ['.when .lbl', '.when .ago']) cases.push([`history ${k} ${text}`, { '--t': level[k] }, [text], [['.row'], ['button.row.hist:hover']]]);
  }
  cases.push(['stat warn value', { '--t': 'var(--iw-warn)' }, ['.stat .val', '.stat.warn .val'], [['.stat.warn']]]);
  cases.push(['stat warn label', { '--t': 'var(--iw-warn)' }, ['.stat .lbl'], [['.stat.warn']]]);
  cases.push(['empty history', {}, ['.empty'], [['.empty']]]);
  const failures = [];
  for (const [what, own, text, backgrounds] of cases) {
    for (const [theme, colours] of Object.entries(THEMES)) {
      const vars = { ...colours, ...css[':host'], ...own };
      const card = resolve(vars['--card-background-color'], vars);
      const fg = resolve(last(text, 'color'), vars);
      for (const bg of backgrounds) {
        const ratio = contrast(fg, over(resolve(last(bg, 'background'), vars), card));
        if (ratio < 4.5) failures.push(`${what} (${theme}, on ${bg.at(-1)}): ${ratio.toFixed(2)}:1`);
      }
    }
  }
  assert.deepEqual(failures, []);
});

test('state colours stay on the badge, pill and icons', () => {
  const css = rules(IntegrationWatchdogCard.styles);
  assert.match(css['.badge'].color, /^var\(--c\)$/);
  assert.match(css['.pill'].background, /var\(--c\)/);
  assert.match(css['.ic'].color, /^var\(--t\)$/);
  // The state text keeps its hue, darkened (light theme) or lightened (dark theme) towards the text colour.
  for (const sel of ['.pill', '.tag', '.when .lbl', '.stat.warn .val']) assert.match(css[sel].color, /color-mix\(in srgb, var\(--[ct]\) \d+%, var\(--primary-text-color\)\)/, sel);
});

test('a re-render keeps the keyboard focus on the same row or button', () => {
  const zha = { domain: 'zha', title: 'Zigbee', entry_id: 'e1', since: minutesAgo(5), reloads: 1 };
  const hue = { domain: 'hue', title: 'Hue', entry_id: 'e2', since: minutesAgo(9), reloads: 0 };
  const history = [event('reload_failed', 'Zha', 1, minutesAgo(2))];
  const card = render({}, makeHass({ integrations: [zha, hue], history }));
  const keys = card.shadowRoot.querySelectorAll('[data-focus]').map((el) => el.dataset.focus);
  assert.equal(new Set(keys).size, keys.length, 'one key per element');
  assert.ok(keys.includes('check'));
  for (const [n, key] of keys.entries()) {
    focused.length = 0;
    card.shadowRoot.activeElement = { dataset: { focus: key } };
    // A state change re-renders the card (innerHTML): the same element gets the focus back.
    // The reload count differs at each turn: an identical state (same millisecond) is rightly not re-rendered.
    card.hass = makeHass({ integrations: [hue, zha], history: [event('reloaded', 'Hue', 1, minutesAgo(1)), ...history], reloads: n + 1 });
    assert.deepEqual(focused, [key], key);
  }
  // Nothing focused in the card: nothing is focused.
  focused.length = 0;
  card.shadowRoot.activeElement = null;
  card.hass = makeHass({ integrations: [hue], history });
  assert.deepEqual(focused, []);
  // The focused row gone: no error, no focus.
  card.shadowRoot.activeElement = { dataset: { focus: keys.find((k) => k.includes('e1')) } };
  card.hass = makeHass({ integrations: [], history: [] });
  assert.deepEqual(focused, []);
});

test('giving the focus back after a re-render never scrolls the page', () => {
  const hue = { domain: 'hue', title: 'Hue', entry_id: 'e2', since: minutesAgo(9), reloads: 0 };
  const card = render({}, makeHass({ integrations: [hue] }));
  focusOptions.length = 0;
  card.shadowRoot.activeElement = { dataset: { focus: 'check' } };
  card.hass = makeHass({ integrations: [hue], reloads: 7 });
  assert.equal(focusOptions.length, 1);
  assert.equal(focusOptions[0]?.preventScroll, true);
  // The source has no other focus() call that could scroll.
  for (const m of source.matchAll(/\.focus\(([^)]*)\)/g)) assert.match(m[1], /preventScroll: true/, m[0]);
});

// ── Review pass 9 ────────────────────────────────────────────────────────────

// The @container blocks of the stylesheet: { query: { selector: { property: value } } }.
const containerRules = (css) => {
  const out = {};
  for (const m of css.matchAll(/@container\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) out[m[1].trim()] = rules(m[2]);
  return out;
};

test('narrow header: the pill keeps its full text while there is room, the title keeps a few characters, the button never shrinks', () => {
  const css = rules(IntegrationWatchdogCard.styles);
  // The pill takes the room it needs and only shrinks (then truncates) when there is not enough of it.
  assert.equal(css['.pill'].flex, '0 1 auto');
  assert.equal(css['.pill']['min-width'], '0');
  assert.equal(css['.pill']['max-width'], undefined, 'no cap on the pill: it truncates only when the room runs out');
  assert.equal(css['.pill'].overflow, 'hidden');
  assert.equal(css['.pill']['white-space'], 'nowrap');
  assert.equal(css['.pill .ptxt']['text-overflow'], 'ellipsis');
  // The title takes what is left (basis 0, so it does not take the pill's room) and keeps ~4 characters.
  assert.equal(css['.heading'].flex, '1 1 0');
  assert.match(css['.heading']['min-width'], /^[4-9](\.\d+)?ch$/);
  assert.equal(css['.check'].flex, 'none');
  assert.equal(css['.badge'].flex, 'none');
  // The header is a size container: below the threshold the pill keeps only its coloured dot.
  assert.equal(css['.head']['container-type'], 'inline-size');
  const queries = containerRules(IntegrationWatchdogCard.styles);
  assert.equal(Object.keys(queries).length, 1);
  const [[query, compact]] = Object.entries(queries);
  // Only where even a short status cannot fit: a 245 px card (header 221 px) still shows the text.
  const threshold = Number(query.match(/max-width:\s*(\d+)px/)?.[1]);
  assert.ok(threshold >= 150 && threshold < 221, query);
  assert.equal(compact['.head .pill .dot'].display, 'block');
  // The text is hidden visually only: screen readers still read it.
  assert.match(compact['.head .pill .ptxt'].clip || compact['.head .pill .ptxt']['clip-path'], /rect|inset/);
  assert.equal(css['.pill .dot'].display, 'none');
  // In the rows, the outcome on the right gives way (up to half the row) instead of hiding the name.
  for (const sel of ['.tag', '.when']) {
    assert.equal(css[sel].flex, '0 1 auto', sel);
    assert.equal(css[sel]['min-width'], '0', sel);
    assert.equal(css[sel]['max-width'], '50%', sel);
  }
  assert.equal(css['.tag']['text-overflow'], 'ellipsis');
  assert.equal(css['.when > span']['text-overflow'], 'ellipsis');
});

test('the card is at least 8 columns wide: 6 columns of a phone section (~156 px) cannot hold the header', () => {
  const card = new IntegrationWatchdogCard();
  assert.deepEqual({ ...card.getGridOptions() }, { columns: 12, min_columns: 8, rows: 'auto' });
});

test('in a container sized by its content (inline-block, grid auto column) the header keeps a usable width', () => {
  const css = rules(IntegrationWatchdogCard.styles);
  // A size container contributes nothing to its parent's intrinsic width: without an intrinsic size the card
  // falls to its padding (~24 px) in layout-card, button-card or a grid `auto` column.
  const size = Number.parseFloat(css['.head']['contain-intrinsic-inline-size']);
  assert.ok(size >= 180, css['.head']['contain-intrinsic-inline-size']);
  // ...but no wider than the content of the narrowest card allowed by getGridOptions (8 columns ≈ 208 px on a phone).
  assert.ok(size <= 208 - 24, css['.head']['contain-intrinsic-inline-size']);
});

test('the pill carries its full text in a tooltip', () => {
  const hass = makeHass({
    integrations: [
      { domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(600), reloads: 3, gave_up: true },
      { domain: 'hue', title: 'Hue', entry_id: 'b', since: minutesAgo(20), reloads: 1, gave_up: false },
    ],
  });
  assert.match(html(render({}, hass)), /class="pill" title="1 unavailable · 1 given up"/);
  assert.match(html(render({}, { ...makeHass(), entities: {}, states: {} })), /class="pill" title="Not set up"/);
});

test('"not set up" does not repeat the title in any language', () => {
  for (const [lang, strings] of Object.entries(IW_I18N)) assert.doesNotMatch(strings.not_loaded, /Integration Watchdog/, lang);
});

// The pill for `n` unavailable integrations and `g` given up, in `language`.
const pill = (language, n, g = 0) => {
  const integrations = Array.from({ length: n + g }, (_, i) => ({
    domain: `d${i}`,
    title: `I${i}`,
    entry_id: `e${i}`,
    since: minutesAgo(5),
    reloads: 1,
    gave_up: i >= n,
  }));
  return html(render({}, makeHass({ language, integrations }))).match(/<span class="ptxt">([^<]*)</)[1];
};

test('plurals: 1, 2, 5, 21 and 22 in every language with plural forms', () => {
  const expected = {
    en: ['1 unavailable', '2 unavailable', '5 unavailable', '21 unavailable', '22 unavailable'],
    fr: ['1 indisponible', '2 indisponibles', '5 indisponibles', '21 indisponibles', '22 indisponibles'],
    sr: ['1 недоступна', '2 недоступне', '5 недоступних', '21 недоступна', '22 недоступне'],
    'sr-Latn': ['1 nedostupna', '2 nedostupne', '5 nedostupnih', '21 nedostupna', '22 nedostupne'],
    pl: ['1 niedostępna', '2 niedostępne', '5 niedostępnych', '21 niedostępnych', '22 niedostępne'],
  };
  for (const [lang, forms] of Object.entries(expected)) {
    assert.deepEqual([1, 2, 5, 21, 22].map((n) => pill(lang, n)), forms, lang);
  }
  const gaveUp = {
    sr: ['1 напуштена', '2 напуштене', '5 напуштених', '21 напуштена', '22 напуштене'],
    'sr-Latn': ['1 napuštena', '2 napuštene', '5 napuštenih', '21 napuštena', '22 napuštene'],
    pl: ['1 porzucona', '2 porzucone', '5 porzuconych', '21 porzuconych', '22 porzucone'],
  };
  for (const [lang, forms] of Object.entries(gaveUp)) {
    assert.deepEqual([1, 2, 5, 21, 22].map((g) => pill(lang, 0, g)), forms, lang);
  }
});

test('plurals follow the card\'s language option, not Home Assistant\'s', () => {
  const integrations = (n) =>
    Array.from({ length: n }, (_, i) => ({ domain: `d${i}`, title: `I${i}`, entry_id: `e${i}`, since: minutesAgo(5), reloads: 1, gave_up: false }));
  const out = (language, n) => html(render({ language }, makeHass({ language: 'en', integrations: integrations(n) })));
  assert.match(out('sr', 3), /3 недоступне/);
  assert.match(out('pl', 22), /22 niedostępne/);
  // English has no "few" form: 3 stays "3 unavailable" even with Serbian Home Assistant.
  assert.match(html(render({ language: 'en' }, makeHass({ language: 'sr', integrations: integrations(3) }))), /3 unavailable/);
});

test('Serbian: an integration given up is "abandoned" (feminine) everywhere, like the pill', () => {
  for (const key of ['gave_up', 'gave_up_event']) {
    assert.equal(IW_I18N.sr[key], 'Напуштена', key);
    assert.equal(IW_I18N['sr-Latn'][key], 'Napuštena', key);
  }
});

test('Polish: one word for a reload, like the rest of the card and the integration', () => {
  assert.equal(IW_I18N.pl.stat_reloads, 'Ponowne wczytania');
  assert.equal(IW_I18N.pl.reloaded, 'Wczytana ponownie');
});

test('rows open Settings for administrators only', () => {
  const data = {
    integrations: [{ domain: 'zha', title: 'Zigbee', entry_id: 'a', since: minutesAgo(30), reloads: 1, gave_up: false }],
    history: [event('reloaded', 'Hue', 1, minutesAgo(10))],
  };
  const admin = html(render({}, { ...makeHass(data), user: { is_admin: true } }));
  assert.equal((admin.match(/<button class="row/g) || []).length, 2);
  for (const user of [{ is_admin: false }, undefined]) {
    const card = render({}, { ...makeHass(data), user });
    const out = html(card);
    assert.doesNotMatch(out, /<button class="row/, JSON.stringify(user));
    assert.equal((out.match(/<div class="row/g) || []).length, 2, JSON.stringify(user));
    // Not clickable, not focusable: no domain to open, no focus key.
    assert.doesNotMatch(out, /class="row[^"]*" data-domain/);
    assert.doesNotMatch(out, /data-focus="[uh]:/);
    // The check button is still there.
    assert.match(out, /class="check"/);
  }
  // Same states, the user becomes an administrator: the rows become buttons at once.
  const hass = { ...makeHass(data), user: { is_admin: false } };
  const card = render({}, hass);
  card.hass = { ...hass, user: { is_admin: true } };
  assert.equal((html(card).match(/<button class="row/g) || []).length, 2);
  // Only the clickable rows get the pointer and the hover tint.
  const css = rules(IntegrationWatchdogCard.styles);
  assert.equal(css['.row'].cursor, undefined);
  assert.equal(css['button.row'].cursor, 'pointer');
  assert.ok(!css['.row:hover'] && css['button.row:hover']);
});

test('a failed "Check now" is reported, not left as an unhandled rejection', async () => {
  const hass = makeHass();
  hass.callService = () => Promise.reject(new Error('Connection lost'));
  const card = render({}, hass);
  const events = [];
  card.dispatchEvent = (ev) => events.push(ev);
  await card.shadowRoot.querySelector('.check').handlers.click();
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(events.length, 1);
  assert.equal(events[0].type, 'hass-notification');
  assert.match(events[0].detail.message, /Connection lost/);
  // In the card's language.
  const fr = makeHass({ language: 'fr' });
  fr.callService = () => {
    throw new Error('boom');
  };
  const frCard = render({}, fr);
  const frEvents = [];
  frCard.dispatchEvent = (ev) => frEvents.push(ev);
  await frCard.shadowRoot.querySelector('.check').handlers.click();
  await new Promise((r) => setTimeout(r, 0));
  assert.match(frEvents[0]?.detail?.message || '', /boom/);
  assert.equal(frEvents[0].detail.message, iwT('fr', 'check_failed', { error: 'boom' }));
});
