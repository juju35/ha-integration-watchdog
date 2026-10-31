/**
 * integration-watchdog-card — the overall status of Integration Watchdog: the integrations whose entities are all
 * unavailable, and the recent reloads (with the failed ones and the integrations given up).
 * Served and added to the dashboard resources by the integration.
 * https://github.com/juju35/ha-integration-watchdog
 */
var INTEGRATION_WATCHDOG_CARD_VERSION = '0.6.0';

const IW_I18N = {
  en: {
    title: 'Integration Watchdog',
    all_ok: 'All available',
    unavailable_one: '{n} unavailable',
    unavailable_many: '{n} unavailable',
    gave_up_one: '{n} given up',
    gave_up_many: '{n} given up',
    checking: 'Checking…',
    not_loaded: 'Integration Watchdog is not set up',
    never_checked: 'Not checked yet',
    checked: 'Checked {d}',
    check_now: 'Check now',
    stat_unavailable: 'Unavailable',
    stat_reloads: 'Reloads',
    stat_reloads_hint: 'Since Home Assistant started',
    stat_ignored: 'Ignored',
    unavailable_title: 'Unavailable integrations',
    history_title: 'Recent reloads',
    no_history: 'No reload yet',
    since: 'unavailable for {d}',
    attempts: '{n}/{max} reloads',
    attempt: 'reload {n}/{max}',
    waiting: 'Grace period',
    gave_up: 'Given up',
    reloaded: 'Reloaded',
    reload_failed: 'Failed',
    gave_up_event: 'Given up',
    gave_up_after: 'after {n} reloads',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} d',
    ed_entity: 'Integration Watchdog sensor',
    ed_entity_helper: 'Unavailable integrations sensor; leave empty to find it automatically',
    ed_title: 'Title',
    ed_title_helper: 'Leave empty for “Integration Watchdog”',
    ed_show_stats: 'Summary',
    ed_show_stats_helper: 'Unavailable, reloads since start and ignored integrations',
    ed_show_unavailable: 'Unavailable integrations',
    ed_show_unavailable_helper: 'The integrations whose entities are all unavailable, with their reloads',
    ed_show_history: 'Recent reloads',
    ed_show_history_helper: 'The last reloads, failed reloads and integrations given up',
    ed_history_count: 'Reloads shown',
    ed_check_button: '“Check now” button',
    ed_check_button_helper: 'Runs a check from the header, for every user who sees the card',
    ed_hide_when_ok: 'Hide the card when everything is available',
    ed_hide_when_ok_helper: 'The card only appears when an integration is unavailable',
    ed_language: 'Language',
    ed_language_helper: 'Leave empty to follow Home Assistant',
  },
  fr: {
    title: 'Integration Watchdog',
    all_ok: 'Tout est disponible',
    unavailable_one: '{n} indisponible',
    unavailable_many: '{n} indisponibles',
    gave_up_one: '{n} abandonnée',
    gave_up_many: '{n} abandonnées',
    checking: 'Vérification…',
    not_loaded: 'Integration Watchdog n’est pas configuré',
    never_checked: 'Pas encore vérifié',
    checked: 'Vérifié {d}',
    check_now: 'Vérifier maintenant',
    stat_unavailable: 'Indisponibles',
    stat_reloads: 'Rechargements',
    stat_reloads_hint: 'Depuis le démarrage de Home Assistant',
    stat_ignored: 'Ignorées',
    unavailable_title: 'Intégrations indisponibles',
    history_title: 'Derniers rechargements',
    no_history: 'Aucun rechargement pour l’instant',
    since: 'indisponible depuis {d}',
    attempts: '{n}/{max} rechargements',
    attempt: 'rechargement {n}/{max}',
    waiting: 'Délai de grâce',
    gave_up: 'Abandonnée',
    reloaded: 'Rechargée',
    reload_failed: 'Échec',
    gave_up_event: 'Abandon',
    gave_up_after: 'après {n} rechargements',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} j',
    ed_entity: 'Capteur Integration Watchdog',
    ed_entity_helper: 'Capteur des intégrations indisponibles ; laisser vide pour le trouver automatiquement',
    ed_title: 'Titre',
    ed_title_helper: 'Laisser vide pour « Integration Watchdog »',
    ed_show_stats: 'Résumé',
    ed_show_stats_helper: 'Indisponibles, rechargements depuis le démarrage et intégrations ignorées',
    ed_show_unavailable: 'Intégrations indisponibles',
    ed_show_unavailable_helper: 'Les intégrations dont toutes les entités sont indisponibles, avec leurs rechargements',
    ed_show_history: 'Derniers rechargements',
    ed_show_history_helper: 'Les derniers rechargements, échecs et intégrations abandonnées',
    ed_history_count: 'Rechargements affichés',
    ed_check_button: 'Bouton « Vérifier maintenant »',
    ed_check_button_helper: 'Lance une vérification depuis l’en-tête, pour tout utilisateur qui voit la carte',
    ed_hide_when_ok: 'Masquer la carte quand tout est disponible',
    ed_hide_when_ok_helper: 'La carte n’apparaît que si une intégration est indisponible',
    ed_language: 'Langue',
    ed_language_helper: 'Laisser vide pour suivre Home Assistant',
  },
  de: {
    title: 'Integration Watchdog',
    all_ok: 'Alles verfügbar',
    unavailable_one: '{n} nicht verfügbar',
    unavailable_many: '{n} nicht verfügbar',
    gave_up_one: '{n} aufgegeben',
    gave_up_many: '{n} aufgegeben',
    checking: 'Prüfung läuft…',
    not_loaded: 'Integration Watchdog ist nicht eingerichtet',
    never_checked: 'Noch nicht geprüft',
    checked: 'Geprüft {d}',
    check_now: 'Jetzt prüfen',
    stat_unavailable: 'Nicht verfügbar',
    stat_reloads: 'Neuladungen',
    stat_reloads_hint: 'Seit dem Start von Home Assistant',
    stat_ignored: 'Ignoriert',
    unavailable_title: 'Nicht verfügbare Integrationen',
    history_title: 'Letzte Neuladungen',
    no_history: 'Noch keine Neuladung',
    since: 'nicht verfügbar seit {d}',
    attempts: '{n}/{max} Neuladungen',
    attempt: 'Neuladung {n}/{max}',
    waiting: 'Karenzzeit',
    gave_up: 'Aufgegeben',
    reloaded: 'Neu geladen',
    reload_failed: 'Fehlgeschlagen',
    gave_up_event: 'Aufgegeben',
    gave_up_after: 'nach {n} Neuladungen',
    minutes: '{n} Min.',
    hours: '{n} Std.',
    days: '{n} Tg.',
    ed_entity: 'Integration-Watchdog-Sensor',
    ed_entity_helper: 'Sensor der nicht verfügbaren Integrationen; leer lassen, um ihn automatisch zu finden',
    ed_title: 'Titel',
    ed_title_helper: 'Leer lassen für „Integration Watchdog“',
    ed_show_stats: 'Übersicht',
    ed_show_stats_helper: 'Nicht verfügbare, Neuladungen seit dem Start und ignorierte Integrationen',
    ed_show_unavailable: 'Nicht verfügbare Integrationen',
    ed_show_unavailable_helper: 'Die Integrationen, deren Entitäten alle nicht verfügbar sind, mit ihren Neuladungen',
    ed_show_history: 'Letzte Neuladungen',
    ed_show_history_helper: 'Die letzten Neuladungen, Fehlschläge und aufgegebenen Integrationen',
    ed_history_count: 'Angezeigte Neuladungen',
    ed_check_button: 'Schaltfläche „Jetzt prüfen“',
    ed_check_button_helper: 'Startet eine Prüfung aus der Kopfzeile, für alle Benutzer, die die Karte sehen',
    ed_hide_when_ok: 'Karte ausblenden, wenn alles verfügbar ist',
    ed_hide_when_ok_helper: 'Die Karte erscheint nur, wenn eine Integration nicht verfügbar ist',
    ed_language: 'Sprache',
    ed_language_helper: 'Leer lassen, um Home Assistant zu folgen',
  },
  es: {
    title: 'Integration Watchdog',
    all_ok: 'Todo disponible',
    unavailable_one: '{n} no disponible',
    unavailable_many: '{n} no disponibles',
    gave_up_one: '{n} abandonada',
    gave_up_many: '{n} abandonadas',
    checking: 'Comprobando…',
    not_loaded: 'Integration Watchdog no está configurado',
    never_checked: 'Aún sin comprobar',
    checked: 'Comprobado {d}',
    check_now: 'Comprobar ahora',
    stat_unavailable: 'No disponibles',
    stat_reloads: 'Recargas',
    stat_reloads_hint: 'Desde que se inició Home Assistant',
    stat_ignored: 'Ignoradas',
    unavailable_title: 'Integraciones no disponibles',
    history_title: 'Últimas recargas',
    no_history: 'Aún no hay recargas',
    since: 'no disponible desde hace {d}',
    attempts: '{n}/{max} recargas',
    attempt: 'recarga {n}/{max}',
    waiting: 'Periodo de gracia',
    gave_up: 'Abandonada',
    reloaded: 'Recargada',
    reload_failed: 'Fallida',
    gave_up_event: 'Abandono',
    gave_up_after: 'tras {n} recargas',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} d',
    ed_entity: 'Sensor de Integration Watchdog',
    ed_entity_helper: 'Sensor de integraciones no disponibles; déjalo vacío para encontrarlo automáticamente',
    ed_title: 'Título',
    ed_title_helper: 'Déjalo vacío para «Integration Watchdog»',
    ed_show_stats: 'Resumen',
    ed_show_stats_helper: 'No disponibles, recargas desde el inicio e integraciones ignoradas',
    ed_show_unavailable: 'Integraciones no disponibles',
    ed_show_unavailable_helper: 'Las integraciones cuyas entidades no están disponibles, con sus recargas',
    ed_show_history: 'Últimas recargas',
    ed_show_history_helper: 'Las últimas recargas, los fallos y las integraciones abandonadas',
    ed_history_count: 'Recargas mostradas',
    ed_check_button: 'Botón «Comprobar ahora»',
    ed_check_button_helper: 'Lanza una comprobación desde la cabecera, para cualquier usuario que vea la tarjeta',
    ed_hide_when_ok: 'Ocultar la tarjeta cuando todo esté disponible',
    ed_hide_when_ok_helper: 'La tarjeta solo aparece cuando una integración no está disponible',
    ed_language: 'Idioma',
    ed_language_helper: 'Déjalo vacío para seguir a Home Assistant',
  },
};

const iwLang = (hass, config) => {
  const raw = String(config?.language || hass?.locale?.language || hass?.language || 'en');
  if (IW_I18N[raw]) return raw;
  const l = raw.slice(0, 2);
  return IW_I18N[l] ? l : 'en';
};

const iwT = (lang, key, vars = {}) =>
  (IW_I18N[lang]?.[key] ?? IW_I18N.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

const iwEsc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const IW_DEFAULTS = {
  show_stats: true,
  show_unavailable: true,
  show_history: true,
  history_count: 5,
  check_button: true,
  hide_when_ok: false,
};
const IW_MAX_HISTORY = 20;

// Minutes elapsed since `iso` (0 for a date in the future or unreadable).
const iwMinutes = (iso, now = Date.now()) => {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.max(0, (now - t) / 60000) : 0;
};

// The integration's entities, from the entity registry: { device: { unavailable, last_reload, last_check, button } }.
// Each entity is told apart by its translation key, else by the end of its entity ID (renamed IDs keep the key).
const IW_KEYS = { unavailable: '_unavailable_integrations', last_reload: '_last_reload', last_check: '_last_check', check: '_check_now' };
function iwDevices(registry) {
  const devices = {};
  for (const [id, e] of Object.entries(registry || {})) {
    if (e?.platform !== 'integration_watchdog') continue;
    const d = (devices[e.device_id || ''] ||= {});
    const key = Object.keys(IW_KEYS).find((k) => e.translation_key === k) || Object.keys(IW_KEYS).find((k) => id.endsWith(IW_KEYS[k]));
    if (!key) continue;
    d[key === 'check' ? 'button' : key] = id;
  }
  return devices;
}

// The "Unavailable integrations" sensor among `candidates`: the one whose state carries the integration list.
const iwPick = (hass, candidates) => candidates.find((id) => Array.isArray(hass?.states?.[id]?.attributes?.integrations));

class IntegrationWatchdogCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('integration-watchdog-card-editor');
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = { ...IW_DEFAULTS, ...config };
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this._sig = null;
    this._render();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    // Nothing the card shows changed: the same state objects, registry, language and minute ("3 min ago").
    const ids = this._ids;
    if (
      old &&
      this._sig &&
      ids &&
      // No sensor found yet (watchdog not loaded): its return must be seen at once, not at the next minute.
      ids.unavailable &&
      hass.entities === old.entities &&
      Object.values(ids).every((id) => !id || hass.states[id] === old.states[id]) &&
      iwLang(hass, this._config) === iwLang(old, this._config) &&
      Math.floor(Date.now() / 60000) === this._sigMinute
    ) {
      return;
    }
    this._render();
  }

  getCardSize() {
    return 2 + (this._rows || 0);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 'auto' };
  }

  _t(key, vars) {
    return iwT(iwLang(this._hass, this._config), key, vars);
  }

  // "12 min", "3 h", "2 d".
  _duration(minutes) {
    if (minutes < 60) return this._t('minutes', { n: Math.max(1, Math.floor(minutes)) });
    const h = minutes / 60;
    return h < 48 ? this._t('hours', { n: Math.floor(h) }) : this._t('days', { n: Math.floor(h / 24) });
  }

  // "3 minutes ago", "yesterday"… in the card's language.
  _ago(iso) {
    const m = iwMinutes(iso);
    const lang = iwLang(this._hass, this._config);
    let rtf;
    try {
      rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    } catch {
      return this._duration(m);
    }
    if (m < 1) return rtf.format(0, 'second');
    if (m < 60) return rtf.format(-Math.floor(m), 'minute');
    if (m < 1440) return rtf.format(-Math.floor(m / 60), 'hour');
    return rtf.format(-Math.floor(m / 1440), 'day');
  }

  _absolute(iso) {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return '';
    try {
      return d.toLocaleString(iwLang(this._hass, this._config), { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return d.toISOString();
    }
  }

  // The entities of the device of the chosen (or found) sensor. Cached per registry object, never when empty.
  _lookup() {
    const registry = this._hass.entities;
    if (!this._reg || this._reg.registry !== registry) {
      const devices = iwDevices(registry);
      this._reg = Object.keys(devices).length ? { registry, devices } : null;
    }
    const devices = this._reg?.devices || {};
    let entity = this._config.entity;
    if (!entity) entity = iwPick(this._hass, Object.values(devices).map((d) => d.unavailable).filter(Boolean));
    if (!entity) return {};
    const device = Object.values(devices).find((d) => d.unavailable === entity) || {};
    return { ...device, unavailable: entity };
  }

  _render() {
    if (!this._config || !this._hass || !this.shadowRoot) return;
    const c = this._config;
    const ids = this._lookup();
    this._ids = ids;
    const states = this._hass.states;
    // Without its list (unavailable or restored while the watchdog is not loaded), the sensor says nothing: not set up.
    const sensorSt = ids.unavailable && states[ids.unavailable];
    const st = Array.isArray(sensorSt?.attributes?.integrations) ? sensorSt : null;
    const reloadSt = ids.last_reload && states[ids.last_reload];
    const checkSt = ids.last_check && states[ids.last_check];
    const buttonSt = ids.button && states[ids.button];

    const minute = Math.floor(Date.now() / 60000);
    this._sigMinute = minute;
    const sig = JSON.stringify([c, iwLang(this._hass, c), ids, sensorSt, reloadSt, checkSt, buttonSt?.state, minute]);
    if (sig === this._sig) return;
    this._sig = sig;

    const items = Array.isArray(st?.attributes?.integrations) ? st.attributes.integrations : [];
    const ignored = Array.isArray(st?.attributes?.ignored) ? st.attributes.ignored : [];
    const max = Number(st?.attributes?.max_reloads) || null;
    const history = Array.isArray(reloadSt?.attributes?.history) ? reloadSt.attributes.history : [];
    const reloads = Number(reloadSt?.attributes?.reloads) || 0;
    const givenUp = items.filter((i) => i.gave_up);
    // The button is unavailable while a check runs.
    const checking = buttonSt?.state === 'unavailable';
    const level = !st ? 'na' : givenUp.length ? 'alert' : items.length ? 'warn' : 'ok';

    const hidden = c.hide_when_ok && st && !items.length;
    this.style.display = hidden ? 'none' : '';
    if (hidden) return;

    const count = Math.min(IW_MAX_HISTORY, Math.max(1, Number(c.history_count) || IW_DEFAULTS.history_count));
    const shownHistory = c.show_history ? history.slice(0, count) : [];
    this._rows = (c.show_unavailable ? items.length : 0) + shownHistory.length + (c.show_stats && st ? 1 : 0);

    const checkedAt = checkSt && !['unknown', 'unavailable'].includes(checkSt.state) ? checkSt.state : null;
    const subtitle = !st ? '' : checkedAt ? this._t('checked', { d: this._ago(checkedAt) }) : this._t('never_checked');
    const icon = { ok: 'mdi:shield-check-outline', warn: 'mdi:shield-alert-outline', alert: 'mdi:shield-off-outline', na: 'mdi:shield-outline' }[level];

    this.shadowRoot.innerHTML = `
      <style>${IntegrationWatchdogCard.styles}</style>
      <ha-card class="lvl-${level}">
        <div class="head">
          <div class="badge"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="heading">
            <div class="title">${iwEsc(c.title || this._t('title'))}</div>
            ${subtitle ? `<div class="subtitle" title="${iwEsc(checkedAt ? this._absolute(checkedAt) : '')}">${iwEsc(subtitle)}</div>` : ''}
          </div>
          ${this._checkButton(checking)}
          <div class="pill">${iwEsc(this._status(st, items, givenUp, checking))}</div>
        </div>
        ${c.show_stats && st ? this._stats(items.length, reloads, ignored) : ''}
        ${c.show_unavailable && items.length ? this._section('unavailable_title', items.map((i) => this._unavailableRow(i, max)).join('')) : ''}
        ${
          c.show_history && st
            ? this._section(
                'history_title',
                shownHistory.length ? shownHistory.map((h) => this._historyRow(h)).join('') : `<div class="empty">${iwEsc(this._t('no_history'))}</div>`,
              )
            : ''
        }
      </ha-card>`;

    this.shadowRoot.querySelector('.check')?.addEventListener('click', () => this._check());
    for (const el of this.shadowRoot.querySelectorAll('.row[data-domain]')) {
      el.addEventListener('click', () => this._openIntegration(el.dataset.domain));
    }
    // A brand image that doesn't exist (custom integration without a brand) falls back to the generic icon.
    for (const img of this.shadowRoot.querySelectorAll('img.brand')) {
      img.addEventListener('error', () => img.parentElement?.classList.add('nobrand'), { once: true });
    }
  }

  _status(st, items, givenUp, checking) {
    if (!st) return this._t('not_loaded');
    if (checking) return this._t('checking');
    const parts = [];
    const available = items.length - givenUp.length;
    if (available) parts.push(this._t(available > 1 ? 'unavailable_many' : 'unavailable_one', { n: available }));
    if (givenUp.length) parts.push(this._t(givenUp.length > 1 ? 'gave_up_many' : 'gave_up_one', { n: givenUp.length }));
    return parts.length ? parts.join(' · ') : this._t('all_ok');
  }

  _checkButton(checking) {
    if (!this._config.check_button || !this._ids.button) return '';
    const label = iwEsc(this._t('check_now'));
    return `<button class="check" title="${label}" aria-label="${label}"${checking ? ' disabled' : ''}><ha-icon icon="mdi:refresh"></ha-icon></button>`;
  }

  _check() {
    if (this._ids.button) this._hass.callService('button', 'press', { entity_id: this._ids.button });
  }

  _stats(unavailable, reloads, ignored) {
    const tile = (cls, value, key, title = '') =>
      `<div class="stat ${cls}"${title ? ` title="${iwEsc(title)}"` : ''}><span class="val">${iwEsc(value)}</span><span class="lbl">${iwEsc(this._t(key))}</span></div>`;
    return `<div class="stats">
          ${tile(unavailable ? 'warn' : '', unavailable, 'stat_unavailable')}
          ${tile('', reloads, 'stat_reloads', this._t('stat_reloads_hint'))}
          ${tile('', ignored.length, 'stat_ignored', ignored.join(', '))}
        </div>`;
  }

  _section(key, body) {
    return `<div class="section"><div class="stitle">${iwEsc(this._t(key))}</div><div class="list">${body}</div></div>`;
  }

  // The integration's logo from the Home Assistant brands, with the generic icon behind it when there is none.
  _brand(domain, fallback) {
    const dark = this._hass.themes?.darkMode ? 'dark_' : '';
    const src = `https://brands.home-assistant.io/_/${encodeURIComponent(domain)}/${dark}icon.png`;
    return `<span class="ic"><img class="brand" src="${iwEsc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer"><ha-icon icon="${fallback}"></ha-icon></span>`;
  }

  _unavailableRow(i, max) {
    const kind = i.gave_up ? 'alert' : 'warn';
    const sub = [i.domain, i.since ? this._t('since', { d: this._duration(iwMinutes(i.since)) }) : ''].filter(Boolean).join(' · ');
    const value = i.gave_up ? this._t('gave_up') : i.reloads && max ? this._t('attempts', { n: i.reloads, max }) : this._t('waiting');
    return `
          <button class="row ${kind}" data-domain="${iwEsc(i.domain)}" title="${iwEsc(i.title)} (${iwEsc(i.domain)})">
            ${this._brand(i.domain, 'mdi:puzzle-remove-outline')}
            <span class="txt">
              <span class="name">${iwEsc(i.title)}</span>
              <span class="sub">${iwEsc(sub)}</span>
            </span>
            <span class="tag">${iwEsc(value)}</span>
          </button>`;
  }

  _historyRow(h) {
    const kind = h.kind === 'reloaded' ? 'ok' : h.kind === 'reload_failed' ? 'warn' : 'alert';
    const icon = { ok: 'mdi:check-circle', warn: 'mdi:alert-circle', alert: 'mdi:cancel' }[kind];
    const label = this._t(h.kind === 'gave_up' ? 'gave_up_event' : h.kind);
    const detail =
      h.kind === 'gave_up'
        ? this._t('gave_up_after', { n: h.attempt })
        : h.max_reloads
          ? this._t('attempt', { n: h.attempt, max: h.max_reloads })
          : '';
    const sub = [h.domain, detail].filter(Boolean).join(' · ');
    return `
          <button class="row hist ${kind}" data-domain="${iwEsc(h.domain)}" title="${iwEsc(label)} — ${iwEsc(this._absolute(h.at))}">
            <span class="ic ev"><ha-icon icon="${icon}"></ha-icon></span>
            <span class="txt">
              <span class="name">${iwEsc(h.title)}</span>
              <span class="sub">${iwEsc(sub)}</span>
            </span>
            <span class="when">
              <span class="lbl">${iwEsc(label)}</span>
              <span class="ago">${iwEsc(this._ago(h.at))}</span>
            </span>
          </button>`;
  }

  // The integration's page in Settings, where its entries can be reloaded or their logs read.
  _openIntegration(domain) {
    if (!domain) return;
    window.history.pushState(null, '', `/config/integrations/integration/${encodeURIComponent(domain)}`);
    window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
  }

  static get styles() {
    return `
      :host {
        --iw-ok: var(--success-color, #43a047);
        --iw-warn: var(--warning-color, #ffa600);
        --iw-alert: var(--error-color, #db4437);
        --iw-na: var(--disabled-color, #9e9e9e);
      }
      ha-card { padding: 12px; overflow: hidden; }
      ha-card.lvl-ok    { --c: var(--iw-ok); }
      ha-card.lvl-warn  { --c: var(--iw-warn); }
      ha-card.lvl-alert { --c: var(--iw-alert); }
      ha-card.lvl-na    { --c: var(--iw-na); }

      .head { display: flex; align-items: center; gap: 10px; }
      .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
               background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
      .badge ha-icon { --mdc-icon-size: 24px; }
      .heading { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .title { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
               white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .subtitle { font-size: 12px; line-height: 1.3; color: var(--secondary-text-color);
                  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pill { flex: none; font-size: 11px; font-weight: 500; padding: 1px 8px; border-radius: 999px;
              color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); }
      .check { all: unset; cursor: pointer; flex: none; width: 26px; height: 26px; border-radius: 50%;
               display: grid; place-items: center; color: var(--secondary-text-color); }
      .check:hover { background: color-mix(in srgb, var(--secondary-text-color) 14%, transparent); color: var(--primary-text-color); }
      .check:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .check[disabled] { cursor: default; opacity: .4; background: none; }
      .check ha-icon { --mdc-icon-size: 16px; }

      .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
      .stat { --t: var(--secondary-text-color); display: flex; flex-direction: column; align-items: center; gap: 1px;
              padding: 6px 4px; border-radius: 10px; min-width: 0;
              background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .stat.warn { --t: var(--iw-warn); background: color-mix(in srgb, var(--t) 12%, var(--secondary-background-color, transparent)); }
      .stat .val { font-size: 18px; font-weight: 500; line-height: 1.2; font-variant-numeric: tabular-nums; color: var(--primary-text-color); }
      .stat.warn .val { color: var(--t); }
      .stat .lbl { font-size: 11px; color: var(--secondary-text-color); max-width: 100%;
                   white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .section { margin-top: 12px; }
      .stitle { font-size: 12px; font-weight: 500; color: var(--secondary-text-color); margin: 0 2px 6px;
                text-transform: uppercase; letter-spacing: .04em; }
      .list { display: flex; flex-direction: column; gap: 6px; }
      .empty { font-size: 13px; color: var(--secondary-text-color); padding: 8px 10px; border-radius: 10px;
               background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .row { --t: var(--iw-ok); all: unset; box-sizing: border-box; cursor: pointer; min-width: 0;
             display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 10px;
             background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .row.warn  { --t: var(--iw-warn); }
      .row.alert { --t: var(--iw-alert); }
      /* Unavailable integrations are tinted; the history keeps the neutral tile, its colour on the icon */
      .row:not(.hist) { background: color-mix(in srgb, var(--t) 12%, var(--secondary-background-color, transparent)); }
      .row:hover { background: color-mix(in srgb, var(--t) 18%, var(--secondary-background-color, transparent)); }
      .row.hist:hover { background: color-mix(in srgb, var(--secondary-text-color) 10%, var(--secondary-background-color, transparent)); }
      .row:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
      .ic { position: relative; flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
            color: var(--t); background: color-mix(in srgb, var(--t) 18%, transparent); overflow: hidden; }
      .ic ha-icon { --mdc-icon-size: 16px; }
      .ic img.brand { position: absolute; inset: 5px; width: 18px; height: 18px; object-fit: contain; }
      .ic:not(.nobrand) img.brand + ha-icon { visibility: hidden; }
      .ic.nobrand img.brand { display: none; }
      .txt { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .name { font-size: 13px; font-weight: 500; line-height: 1.2; color: var(--primary-text-color);
              white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .sub { font-size: 11px; line-height: 1.2; color: var(--secondary-text-color);
             white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tag { flex: none; font-size: 12px; font-weight: 500; color: var(--t); font-variant-numeric: tabular-nums; }
      .when { flex: none; display: flex; flex-direction: column; align-items: flex-end; }
      .when .lbl { font-size: 12px; font-weight: 500; line-height: 1.2; color: var(--t); }
      .when .ago { font-size: 11px; line-height: 1.2; color: var(--secondary-text-color); }
    `;
  }
}

// ── Editor ───────────────────────────────────────────────────────────────────
const IW_HELPERS = ['entity', 'title', 'show_stats', 'show_unavailable', 'show_history', 'check_button', 'hide_when_ok', 'language'];

class IntegrationWatchdogCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  _update() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement('ha-form');
      const t = (key) => iwT(iwLang(this._hass, this._config), key);
      this._form.computeLabel = (s) => t(`ed_${s.name}`);
      this._form.computeHelper = (s) => (IW_HELPERS.includes(s.name) ? t(`ed_${s.name}_helper`) : undefined);
      this._form.addEventListener('value-changed', (ev) => {
        const config = { ...ev.detail.value };
        // Options left at their default are not written to the YAML.
        for (const k of Object.keys(config)) {
          if (config[k] === '' || config[k] == null || IW_DEFAULTS[k] === config[k]) delete config[k];
        }
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    const c = this._config;
    const lang = iwLang(this._hass, c);
    // Reassigning the schema at every Home Assistant update would re-render ha-form while the user is typing.
    if (this._deps && this._deps.config === c && this._deps.lang === lang) return;
    this._deps = { config: c, lang };
    this._form.data = { ...IW_DEFAULTS, ...c };
    this._form.schema = [
      { name: 'entity', selector: { entity: { filter: { integration: 'integration_watchdog', domain: 'sensor' } } } },
      { name: 'title', selector: { text: {} } },
      { name: 'show_stats', selector: { boolean: {} } },
      { name: 'show_unavailable', selector: { boolean: {} } },
      { name: 'show_history', selector: { boolean: {} } },
      ...(c.show_history === false
        ? []
        : [{ name: 'history_count', selector: { number: { min: 1, max: IW_MAX_HISTORY, mode: 'box' } } }]),
      { name: 'check_button', selector: { boolean: {} } },
      { name: 'hide_when_ok', selector: { boolean: {} } },
      {
        name: 'language',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Français' },
              { value: 'de', label: 'Deutsch' },
              { value: 'es', label: 'Español' },
            ],
          },
        },
      },
    ];
  }
}

if (!customElements.get('integration-watchdog-card')) {
  customElements.define('integration-watchdog-card', IntegrationWatchdogCard);
  customElements.define('integration-watchdog-card-editor', IntegrationWatchdogCardEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'integration-watchdog-card',
    name: 'Integration Watchdog Card',
    description: 'The overall status of Integration Watchdog: unavailable integrations and recent reloads',
    preview: true,
    documentationURL: 'https://github.com/juju35/ha-integration-watchdog',
  });
  console.info(
    `%c INTEGRATION-WATCHDOG-CARD %c v${INTEGRATION_WATCHDOG_CARD_VERSION} `,
    'background:#14b8a6;color:#fff;font-weight:700',
    '',
  );
}
