/**
 * integration-watchdog-card — the overall status of Integration Watchdog: the integrations whose entities are all
 * unavailable, and the recent reloads (with the failed ones and the integrations given up).
 * Served and added to the dashboard resources by the integration.
 * https://github.com/juju35/ha-integration-watchdog
 */
var INTEGRATION_WATCHDOG_CARD_VERSION = '1.0.0';

const IW_I18N = {
  en: {
    title: 'Integration Watchdog',
    all_ok: 'All available',
    unavailable_one: '{n} unavailable',
    unavailable_many: '{n} unavailable',
    gave_up_one: '{n} given up',
    gave_up_many: '{n} given up',
    checking: 'Checking…',
    not_loaded: 'Not set up',
    never_checked: 'Not checked yet',
    checked: 'Checked {d}',
    check_now: 'Check now',
    check_failed: 'Check failed: {error}',
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
    not_loaded: 'Non configuré',
    never_checked: 'Pas encore vérifié',
    checked: 'Vérifié {d}',
    check_now: 'Vérifier maintenant',
    check_failed: 'Échec de la vérification : {error}',
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
    not_loaded: 'Nicht eingerichtet',
    never_checked: 'Noch nicht geprüft',
    checked: 'Geprüft {d}',
    check_now: 'Jetzt prüfen',
    check_failed: 'Prüfung fehlgeschlagen: {error}',
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
    not_loaded: 'No configurado',
    never_checked: 'Aún sin comprobar',
    checked: 'Comprobado {d}',
    check_now: 'Comprobar ahora',
    check_failed: 'La comprobación ha fallado: {error}',
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
  it: {
    title: 'Integration Watchdog',
    all_ok: 'Tutto disponibile',
    unavailable_one: '{n} non disponibile',
    unavailable_many: '{n} non disponibili',
    gave_up_one: '{n} abbandonata',
    gave_up_many: '{n} abbandonate',
    checking: 'Controllo in corso…',
    not_loaded: 'Non configurato',
    never_checked: 'Non ancora controllato',
    checked: 'Controllato {d}',
    check_now: 'Controlla ora',
    check_failed: 'Controllo non riuscito: {error}',
    stat_unavailable: 'Non disponibili',
    stat_reloads: 'Ricaricamenti',
    stat_reloads_hint: 'Dall’avvio di Home Assistant',
    stat_ignored: 'Ignorate',
    unavailable_title: 'Integrazioni non disponibili',
    history_title: 'Ricaricamenti recenti',
    no_history: 'Ancora nessun ricaricamento',
    since: 'non disponibile da {d}',
    attempts: '{n}/{max} ricaricamenti',
    attempt: 'ricaricamento {n}/{max}',
    waiting: 'In attesa',
    gave_up: 'Abbandonata',
    reloaded: 'Ricaricata',
    reload_failed: 'Fallito',
    gave_up_event: 'Abbandono',
    gave_up_after: 'dopo {n} ricaricamenti',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} g',
    ed_entity: 'Sensore Integration Watchdog',
    ed_entity_helper: 'Sensore delle integrazioni non disponibili; lascia vuoto per trovarlo automaticamente',
    ed_title: 'Titolo',
    ed_title_helper: 'Lascia vuoto per «Integration Watchdog»',
    ed_show_stats: 'Riepilogo',
    ed_show_stats_helper: 'Non disponibili, ricaricamenti dall’avvio e integrazioni ignorate',
    ed_show_unavailable: 'Integrazioni non disponibili',
    ed_show_unavailable_helper: 'Le integrazioni le cui entità sono tutte non disponibili, con i loro ricaricamenti',
    ed_show_history: 'Ricaricamenti recenti',
    ed_show_history_helper: 'Gli ultimi ricaricamenti, quelli non riusciti e le integrazioni abbandonate',
    ed_history_count: 'Ricaricamenti mostrati',
    ed_check_button: 'Pulsante «Controlla ora»',
    ed_check_button_helper: 'Avvia un controllo dall’intestazione, per ogni utente che vede la scheda',
    ed_hide_when_ok: 'Nascondi la scheda quando tutto è disponibile',
    ed_hide_when_ok_helper: 'La scheda appare solo quando un’integrazione non è disponibile',
    ed_language: 'Lingua',
    ed_language_helper: 'Lascia vuoto per seguire Home Assistant',
  },
  nl: {
    title: 'Integration Watchdog',
    all_ok: 'Alles beschikbaar',
    unavailable_one: '{n} niet beschikbaar',
    unavailable_many: '{n} niet beschikbaar',
    gave_up_one: '{n} opgegeven',
    gave_up_many: '{n} opgegeven',
    checking: 'Controleren…',
    not_loaded: 'Niet ingesteld',
    never_checked: 'Nog niet gecontroleerd',
    checked: 'Gecontroleerd {d}',
    check_now: 'Nu controleren',
    check_failed: 'Controle mislukt: {error}',
    stat_unavailable: 'Niet beschikbaar',
    stat_reloads: 'Herladen',
    stat_reloads_hint: 'Sinds Home Assistant is gestart',
    stat_ignored: 'Genegeerd',
    unavailable_title: 'Niet-beschikbare integraties',
    history_title: 'Recente herlaadpogingen',
    no_history: 'Nog geen herlaadpogingen',
    since: '{d} niet beschikbaar',
    attempts: '{n}/{max} herlaadpogingen',
    attempt: 'herlaadpoging {n}/{max}',
    waiting: 'Wachttijd',
    gave_up: 'Opgegeven',
    reloaded: 'Herladen',
    reload_failed: 'Mislukt',
    gave_up_event: 'Opgegeven',
    gave_up_after: 'na {n} herlaadpogingen',
    minutes: '{n} min',
    hours: '{n} u',
    days: '{n} d',
    ed_entity: 'Integration Watchdog-sensor',
    ed_entity_helper: 'Sensor van de niet-beschikbare integraties; laat leeg om hem automatisch te vinden',
    ed_title: 'Titel',
    ed_title_helper: 'Laat leeg voor ‘Integration Watchdog’',
    ed_show_stats: 'Overzicht',
    ed_show_stats_helper: 'Niet beschikbaar, herlaadpogingen sinds de start en genegeerde integraties',
    ed_show_unavailable: 'Niet-beschikbare integraties',
    ed_show_unavailable_helper: 'De integraties waarvan alle entiteiten niet beschikbaar zijn, met hun herlaadpogingen',
    ed_show_history: 'Recente herlaadpogingen',
    ed_show_history_helper: 'De laatste herlaadpogingen, mislukte pogingen en opgegeven integraties',
    ed_history_count: 'Getoonde herlaadpogingen',
    ed_check_button: 'Knop ‘Nu controleren’',
    ed_check_button_helper: 'Start een controle vanuit de koptekst, voor elke gebruiker die de kaart ziet',
    ed_hide_when_ok: 'Kaart verbergen als alles beschikbaar is',
    ed_hide_when_ok_helper: 'De kaart verschijnt alleen als een integratie niet beschikbaar is',
    ed_language: 'Taal',
    ed_language_helper: 'Laat leeg om Home Assistant te volgen',
  },
  pt: {
    title: 'Integration Watchdog',
    all_ok: 'Tudo disponível',
    unavailable_one: '{n} indisponível',
    unavailable_many: '{n} indisponíveis',
    gave_up_one: '{n} abandonada',
    gave_up_many: '{n} abandonadas',
    checking: 'A verificar…',
    not_loaded: 'Não configurado',
    never_checked: 'Ainda não verificado',
    checked: 'Verificado {d}',
    check_now: 'Verificar agora',
    check_failed: 'A verificação falhou: {error}',
    stat_unavailable: 'Indisponíveis',
    stat_reloads: 'Recarregamentos',
    stat_reloads_hint: 'Desde o arranque do Home Assistant',
    stat_ignored: 'Ignoradas',
    unavailable_title: 'Integrações indisponíveis',
    history_title: 'Recarregamentos recentes',
    no_history: 'Ainda nenhum recarregamento',
    since: 'indisponível há {d}',
    attempts: '{n}/{max} recarregamentos',
    attempt: 'recarregamento {n}/{max}',
    waiting: 'Em espera',
    gave_up: 'Abandonada',
    reloaded: 'Recarregada',
    reload_failed: 'Falhou',
    gave_up_event: 'Abandono',
    gave_up_after: 'após {n} recarregamentos',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} d',
    ed_entity: 'Sensor do Integration Watchdog',
    ed_entity_helper: 'Sensor das integrações indisponíveis; deixe vazio para o encontrar automaticamente',
    ed_title: 'Título',
    ed_title_helper: 'Deixe vazio para «Integration Watchdog»',
    ed_show_stats: 'Resumo',
    ed_show_stats_helper: 'Indisponíveis, recarregamentos desde o arranque e integrações ignoradas',
    ed_show_unavailable: 'Integrações indisponíveis',
    ed_show_unavailable_helper: 'As integrações cujas entidades estão todas indisponíveis, com os seus recarregamentos',
    ed_show_history: 'Recarregamentos recentes',
    ed_show_history_helper: 'Os últimos recarregamentos, as falhas e as integrações abandonadas',
    ed_history_count: 'Recarregamentos mostrados',
    ed_check_button: 'Botão «Verificar agora»',
    ed_check_button_helper: 'Inicia uma verificação a partir do cabeçalho, para qualquer utilizador que veja o cartão',
    ed_hide_when_ok: 'Ocultar o cartão quando tudo está disponível',
    ed_hide_when_ok_helper: 'O cartão só aparece quando uma integração está indisponível',
    ed_language: 'Idioma',
    ed_language_helper: 'Deixe vazio para seguir o Home Assistant',
  },
  pl: {
    title: 'Integration Watchdog',
    all_ok: 'Wszystko dostępne',
    unavailable_one: '{n} niedostępna',
    unavailable_few: '{n} niedostępne',
    unavailable_many: '{n} niedostępnych',
    gave_up_one: '{n} porzucona',
    gave_up_few: '{n} porzucone',
    gave_up_many: '{n} porzuconych',
    checking: 'Sprawdzanie…',
    not_loaded: 'Nie skonfigurowano',
    never_checked: 'Jeszcze nie sprawdzono',
    checked: 'Sprawdzono {d}',
    check_now: 'Sprawdź teraz',
    check_failed: 'Sprawdzanie nie powiodło się: {error}',
    stat_unavailable: 'Niedostępne',
    stat_reloads: 'Ponowne wczytania',
    stat_reloads_hint: 'Od uruchomienia Home Assistant',
    stat_ignored: 'Ignorowane',
    unavailable_title: 'Niedostępne integracje',
    history_title: 'Ostatnie ponowne wczytania',
    no_history: 'Brak ponownych wczytań',
    since: 'niedostępna od {d}',
    attempts: 'Próby: {n}/{max}',
    attempt: 'ponowne wczytanie {n}/{max}',
    waiting: 'Okres karencji',
    gave_up: 'Porzucona',
    reloaded: 'Wczytana ponownie',
    reload_failed: 'Błąd',
    gave_up_event: 'Porzucenie',
    gave_up_after: 'ponowne wczytania: {n}',
    minutes: '{n} min',
    hours: '{n} godz.',
    days: '{n} dni',
    ed_entity: 'Sensor Integration Watchdog',
    ed_entity_helper: 'Sensor niedostępnych integracji; pozostaw puste, aby znaleźć go automatycznie',
    ed_title: 'Tytuł',
    ed_title_helper: 'Pozostaw puste dla „Integration Watchdog”',
    ed_show_stats: 'Podsumowanie',
    ed_show_stats_helper: 'Niedostępne, ponowne wczytania od uruchomienia i ignorowane integracje',
    ed_show_unavailable: 'Niedostępne integracje',
    ed_show_unavailable_helper: 'Integracje, których wszystkie encje są niedostępne, z ich ponownymi wczytaniami',
    ed_show_history: 'Ostatnie ponowne wczytania',
    ed_show_history_helper: 'Ostatnie ponowne wczytania, niepowodzenia i porzucone integracje',
    ed_history_count: 'Liczba wyświetlanych ponownych wczytań',
    ed_check_button: 'Przycisk „Sprawdź teraz”',
    ed_check_button_helper: 'Uruchamia sprawdzenie z nagłówka, dla każdego użytkownika, który widzi kartę',
    ed_hide_when_ok: 'Ukryj kartę, gdy wszystko jest dostępne',
    ed_hide_when_ok_helper: 'Karta pojawia się tylko wtedy, gdy jakaś integracja jest niedostępna',
    ed_language: 'Język',
    ed_language_helper: 'Pozostaw puste, aby używać języka Home Assistant',
  },
  sr: {
    title: 'Integration Watchdog',
    all_ok: 'Све је доступно',
    unavailable_one: '{n} недоступна',
    unavailable_few: '{n} недоступне',
    unavailable_many: '{n} недоступних',
    gave_up_one: '{n} напуштена',
    gave_up_few: '{n} напуштене',
    gave_up_many: '{n} напуштених',
    checking: 'Проверавање…',
    not_loaded: 'Није подешено',
    never_checked: 'Још није проверено',
    checked: 'Проверено {d}',
    check_now: 'Провери сада',
    check_failed: 'Провера није успела: {error}',
    stat_unavailable: 'Недоступне',
    stat_reloads: 'Поновна учитавања',
    stat_reloads_hint: 'Од покретања Home Assistant-а',
    stat_ignored: 'Игнорисане',
    unavailable_title: 'Недоступне интеграције',
    history_title: 'Недавна поновна учитавања',
    no_history: 'Још нема поновних учитавања',
    since: 'недоступна већ {d}',
    attempts: '{n}/{max} поновних учитавања',
    attempt: 'поновно учитавање {n}/{max}',
    waiting: 'Период чекања',
    gave_up: 'Напуштена',
    reloaded: 'Поново учитана',
    reload_failed: 'Неуспело',
    gave_up_event: 'Напуштена',
    gave_up_after: 'после {n} поновних учитавања',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} d',
    ed_entity: 'Сензор Integration Watchdog',
    ed_entity_helper: 'Сензор недоступних интеграција; оставите празно да би био пронађен аутоматски',
    ed_title: 'Наслов',
    ed_title_helper: 'Оставите празно за „Integration Watchdog“',
    ed_show_stats: 'Преглед',
    ed_show_stats_helper: 'Недоступне, поновна учитавања од покретања и игнорисане интеграције',
    ed_show_unavailable: 'Недоступне интеграције',
    ed_show_unavailable_helper: 'Интеграције чији су сви ентитети недоступни, са њиховим поновним учитавањима',
    ed_show_history: 'Недавна поновна учитавања',
    ed_show_history_helper: 'Последња поновна учитавања, неуспела учитавања и напуштене интеграције',
    ed_history_count: 'Број приказаних поновних учитавања',
    ed_check_button: 'Дугме „Провери сада“',
    ed_check_button_helper: 'Покреће проверу из заглавља, за сваког корисника који види картицу',
    ed_hide_when_ok: 'Сакриј картицу када је све доступно',
    ed_hide_when_ok_helper: 'Картица се појављује само када је нека интеграција недоступна',
    ed_language: 'Језик',
    ed_language_helper: 'Оставите празно да бисте пратили Home Assistant',
  },
  'sr-Latn': {
    title: 'Integration Watchdog',
    all_ok: 'Sve je dostupno',
    unavailable_one: '{n} nedostupna',
    unavailable_few: '{n} nedostupne',
    unavailable_many: '{n} nedostupnih',
    gave_up_one: '{n} napuštena',
    gave_up_few: '{n} napuštene',
    gave_up_many: '{n} napuštenih',
    checking: 'Proveravanje…',
    not_loaded: 'Nije podešeno',
    never_checked: 'Još nije provereno',
    checked: 'Provereno {d}',
    check_now: 'Proveri sada',
    check_failed: 'Provera nije uspela: {error}',
    stat_unavailable: 'Nedostupne',
    stat_reloads: 'Ponovna učitavanja',
    stat_reloads_hint: 'Od pokretanja Home Assistant-a',
    stat_ignored: 'Ignorisane',
    unavailable_title: 'Nedostupne integracije',
    history_title: 'Nedavna ponovna učitavanja',
    no_history: 'Još nema ponovnih učitavanja',
    since: 'nedostupna već {d}',
    attempts: '{n}/{max} ponovnih učitavanja',
    attempt: 'ponovno učitavanje {n}/{max}',
    waiting: 'Period čekanja',
    gave_up: 'Napuštena',
    reloaded: 'Ponovo učitana',
    reload_failed: 'Neuspelo',
    gave_up_event: 'Napuštena',
    gave_up_after: 'posle {n} ponovnih učitavanja',
    minutes: '{n} min',
    hours: '{n} h',
    days: '{n} d',
    ed_entity: 'Senzor Integration Watchdog',
    ed_entity_helper: 'Senzor nedostupnih integracija; ostavite prazno da bi bio pronađen automatski',
    ed_title: 'Naslov',
    ed_title_helper: 'Ostavite prazno za „Integration Watchdog“',
    ed_show_stats: 'Pregled',
    ed_show_stats_helper: 'Nedostupne, ponovna učitavanja od pokretanja i ignorisane integracije',
    ed_show_unavailable: 'Nedostupne integracije',
    ed_show_unavailable_helper: 'Integracije čiji su svi entiteti nedostupni, sa njihovim ponovnim učitavanjima',
    ed_show_history: 'Nedavna ponovna učitavanja',
    ed_show_history_helper: 'Poslednja ponovna učitavanja, neuspela učitavanja i napuštene integracije',
    ed_history_count: 'Broj prikazanih ponovnih učitavanja',
    ed_check_button: 'Dugme „Proveri sada“',
    ed_check_button_helper: 'Pokreće proveru iz zaglavlja, za svakog korisnika koji vidi karticu',
    ed_hide_when_ok: 'Sakrij karticu kada je sve dostupno',
    ed_hide_when_ok_helper: 'Kartica se pojavljuje samo kada je neka integracija nedostupna',
    ed_language: 'Jezik',
    ed_language_helper: 'Ostavite prazno da biste pratili Home Assistant',
  },
};

const iwLang = (hass, config) => {
  const raw = String(config?.language || hass?.locale?.language || hass?.language || 'en');
  if (IW_I18N[raw]) return raw;
  const l = raw.split('-')[0];
  return IW_I18N[l] ? l : 'en';
};

// The locale for Intl: Home Assistant's full tag (pt-BR, nl-BE…) when it is the card's language, else the card's language.
// A bare "pt" is Home Assistant's European Portuguese, but Intl reads it as Brazilian: it becomes pt-PT.
const iwLocale = (hass, config) => {
  const lang = iwLang(hass, config);
  const ha = String(hass?.locale?.language || hass?.language || '');
  const tag = ha && (ha === lang || ha.split('-')[0] === lang) ? ha : lang;
  return tag === 'pt' ? 'pt-PT' : tag;
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
      hass.user === old.user &&
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
    return { columns: 12, min_columns: 8, rows: 'auto' };
  }

  _t(key, vars) {
    return iwT(iwLang(this._hass, this._config), key, vars);
  }

  // "{n} unavailable" with the plural form of the card's language: `key_one`, `key_few` (2-4 in Serbian and Polish,
  // when the language has it) or `key_many`.
  _count(key, n) {
    let cat = n === 1 ? 'one' : 'other';
    try {
      cat = new Intl.PluralRules(iwLocale(this._hass, this._config)).select(n);
    } catch {
      // Unknown locale: the simple rule above.
    }
    const form = cat === 'one' ? 'one' : cat === 'few' && IW_I18N[iwLang(this._hass, this._config)]?.[`${key}_few`] ? 'few' : 'many';
    return this._t(`${key}_${form}`, { n });
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
    let rtf;
    try {
      rtf = new Intl.RelativeTimeFormat(iwLocale(this._hass, this._config), { numeric: 'auto' });
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
      return d.toLocaleString(iwLocale(this._hass, this._config), { dateStyle: 'medium', timeStyle: 'short' });
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
    // Only administrators can open Settings: the rows are links for them only.
    this._admin = this._hass.user?.is_admin === true;
    const sig = JSON.stringify([c, iwLang(this._hass, c), ids, sensorSt, reloadSt, checkSt, buttonSt?.state, minute, this._admin]);
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
    // innerHTML replaces every element: the one that had the keyboard focus gets it back after the render.
    const focusKey = this.shadowRoot.activeElement?.dataset?.focus;
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
          ${this._pill(this._status(st, items, givenUp, checking))}
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
    if (focusKey) [...this.shadowRoot.querySelectorAll('[data-focus]')].find((el) => el.dataset.focus === focusKey)?.focus({ preventScroll: true });
  }

  _status(st, items, givenUp, checking) {
    if (!st) return this._t('not_loaded');
    if (checking) return this._t('checking');
    const parts = [];
    const available = items.length - givenUp.length;
    if (available) parts.push(this._count('unavailable', available));
    if (givenUp.length) parts.push(this._count('gave_up', givenUp.length));
    return parts.length ? parts.join(' · ') : this._t('all_ok');
  }

  // The status pill: its text, or only its coloured dot when the header is narrow (the text stays in the tooltip
  // and for screen readers).
  _pill(text) {
    const t = iwEsc(text);
    return `<div class="pill" title="${t}"><span class="dot"></span><span class="ptxt">${t}</span></div>`;
  }

  // A row: a button opening the integration's page for an administrator, plain text for the other users.
  _row(cls, domain, focus, title, body) {
    const t = iwEsc(title);
    return this._admin
      ? `<button class="${cls}" data-domain="${iwEsc(domain)}" data-focus="${iwEsc(focus)}" title="${t}">${body}</button>`
      : `<div class="${cls}" title="${t}">${body}</div>`;
  }

  _checkButton(checking) {
    if (!this._config.check_button || !this._ids.button) return '';
    const label = iwEsc(this._t('check_now'));
    return `<button class="check" data-focus="check" title="${label}" aria-label="${label}"${checking ? ' disabled' : ''}><ha-icon icon="mdi:refresh"></ha-icon></button>`;
  }

  // A failure (connection lost, button removed) is shown as a Home Assistant toast.
  async _check() {
    if (!this._ids.button) return;
    try {
      await this._hass.callService('button', 'press', { entity_id: this._ids.button });
    } catch (err) {
      const message = this._t('check_failed', { error: err?.message || err?.code || String(err) });
      this.dispatchEvent(new CustomEvent('hass-notification', { detail: { message }, bubbles: true, composed: true }));
    }
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
    return this._row(
      `row ${kind}`,
      i.domain,
      `u:${i.entry_id || i.domain}`,
      `${i.title} (${i.domain})`,
      `
            ${this._brand(i.domain, 'mdi:puzzle-remove-outline')}
            <span class="txt">
              <span class="name">${iwEsc(i.title)}</span>
              <span class="sub">${iwEsc(sub)}</span>
            </span>
            <span class="tag">${iwEsc(value)}</span>`,
    );
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
    return this._row(
      `row hist ${kind}`,
      h.domain,
      `h:${h.at}:${h.entry_id || h.domain}`,
      `${label} — ${this._absolute(h.at)}`,
      `
            <span class="ic ev"><ha-icon icon="${icon}"></ha-icon></span>
            <span class="txt">
              <span class="name">${iwEsc(h.title)}</span>
              <span class="sub">${iwEsc(sub)}</span>
            </span>
            <span class="when">
              <span class="lbl">${iwEsc(label)}</span>
              <span class="ago">${iwEsc(this._ago(h.at))}</span>
            </span>`,
    );
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
        display: block;
        min-width: 0;
        --iw-natural-width: 360px;
        --iw-ok: var(--success-color, #43a047);
        --iw-warn: var(--warning-color, #ffa600);
        --iw-alert: var(--error-color, #db4437);
        --iw-na: var(--disabled-color, #9e9e9e);
        /* Secondary text on the tinted tiles: nudged towards the primary text so it stays readable (WCAG AA) */
        --iw-muted: color-mix(in srgb, var(--secondary-text-color) 70%, var(--primary-text-color));
      }
      /* Width without a minimum. The card contributes no width of its own (inline-size containment): its stats,
         rows and pill would otherwise set a min-content width of 210-354 px, a floor that a 1fr grid column or a
         flex row cannot go below once the card is wrapped in a div (min-width: 0 on the host does not reach the
         wrapper), so the card would run out of its column. The empty, zero-height grid below gives it a natural
         (max-content) width with a min-content width of 0: in a parent sized by its content (layout-card,
         button-card, an inline-block, a grid "auto" column) the card gets that width instead of falling to its
         padding, and in a 1fr 1fr grid or a flex row, wrapped or not, it shrinks to its track. No
         contain-intrinsic-* and no min-width in px: both would be a minimum. */
      :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--iw-natural-width)); height: 0; }
      ha-card { padding: 12px; overflow: hidden; contain: inline-size; }
      ha-card.lvl-ok    { --c: var(--iw-ok); }
      ha-card.lvl-warn  { --c: var(--iw-warn); }
      ha-card.lvl-alert { --c: var(--iw-alert); }
      ha-card.lvl-na    { --c: var(--iw-na); }

      /* The header is a size container: the pill keeps only its dot when it is narrow */
      .head { display: flex; align-items: center; gap: 8px; container-type: inline-size; }
      .badge { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
               background: color-mix(in srgb, var(--c) 16%, transparent); color: var(--c); }
      .badge ha-icon { --mdc-icon-size: 24px; }
      /* The title takes what the pill leaves (basis 0) and keeps a few characters; the pill keeps its full text
         while there is room and only truncates when there is not */
      .heading { flex: 1 1 0; min-width: 5ch; display: flex; flex-direction: column; }
      .title { font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
               white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .subtitle { font-size: 12px; line-height: 1.3; color: var(--secondary-text-color);
                  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pill { flex: 0 1 auto; min-width: 0; display: flex; align-items: center; box-sizing: border-box;
              white-space: nowrap; overflow: hidden;
              font-size: 11px; font-weight: 500; padding: 1px 6px; border-radius: 9px;
              color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color));
              background: color-mix(in srgb, var(--c) 14%, transparent); }
      /* Short of room the status takes a second line before it is cut */
      .pill .ptxt { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.25;
                    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; }
      .pill .dot { display: none; flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--c); }
      @container (max-width: 200px) {
        .head .pill { padding: 5px; }
        .head .pill .dot { display: block; }
        .head .pill .ptxt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      }
      /* A very narrow header (a 1fr 1fr grid on a phone): the badge gives way, the pill's dot still tells the status */
      @container (max-width: 140px) {
        .head .badge { display: none; }
      }
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
      .stat.warn .val { color: color-mix(in srgb, var(--t) 40%, var(--primary-text-color)); }
      .stat .lbl { font-size: 11px; color: var(--iw-muted); max-width: 100%;
                   white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

      .section { margin-top: 12px; }
      .stitle { font-size: 12px; font-weight: 500; color: var(--secondary-text-color); margin: 0 2px 6px;
                text-transform: uppercase; letter-spacing: .04em; }
      .list { display: flex; flex-direction: column; gap: 6px; }
      .empty { font-size: 13px; color: var(--iw-muted); padding: 8px 10px; border-radius: 10px;
               background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .row { --t: var(--iw-ok); all: unset; box-sizing: border-box; min-width: 0;
             display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 10px;
             background: var(--secondary-background-color, rgba(127,127,127,.08)); }
      .row.warn  { --t: var(--iw-warn); }
      .row.alert { --t: var(--iw-alert); }
      /* Unavailable integrations are tinted; the history keeps the neutral tile, its colour on the icon */
      .row:not(.hist) { background: color-mix(in srgb, var(--t) 12%, var(--secondary-background-color, transparent)); }
      /* Only administrators get clickable rows (buttons): they can open Settings */
      button.row { cursor: pointer; }
      button.row:hover { background: color-mix(in srgb, var(--t) 18%, var(--secondary-background-color, transparent)); }
      button.row.hist:hover { background: color-mix(in srgb, var(--secondary-text-color) 10%, var(--secondary-background-color, transparent)); }
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
      .sub { font-size: 11px; line-height: 1.2; color: var(--iw-muted);
             white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      /* The outcome on the right shrinks (up to half the row) before the name does */
      .tag { flex: 0 1 auto; min-width: 0; max-width: 50%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 500; color: color-mix(in srgb, var(--t) 40%, var(--primary-text-color)); font-variant-numeric: tabular-nums; }
      .when { flex: 0 1 auto; min-width: 0; max-width: 50%; display: flex; flex-direction: column; align-items: flex-end; }
      .when > span { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .when .lbl { font-size: 12px; font-weight: 500; line-height: 1.2; color: color-mix(in srgb, var(--t) 40%, var(--primary-text-color)); }
      .when .ago { font-size: 11px; line-height: 1.2; color: var(--iw-muted); }
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
              { value: 'it', label: 'Italiano' },
              { value: 'nl', label: 'Nederlands' },
              { value: 'pt', label: 'Português (Portugal)' },
              { value: 'pl', label: 'Polski' },
              { value: 'sr', label: 'Српски' },
              { value: 'sr-Latn', label: 'Srpski (latinica)' },
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
