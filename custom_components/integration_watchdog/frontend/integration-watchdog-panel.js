/*
 * Integration Watchdog sidebar panel — the status, the power cycles and the settings on one page (administrators only).
 *
 * Three tabs under the toolbar, as in Smart Comfort: Status (drawn by the panel itself from the watchdog's sensors:
 * a summary, the unavailable integrations and the reload history), Power cycles (the devices switched off and on with their smart plug: list, add, remove) and Settings
 * (the options of Configure). Backed by the integration_watchdog/settings, update_settings, add_power_cycle and
 * remove_power_cycle WebSocket commands. The form labels and hints are the integration's own translations (options
 * flow, fetched with frontend/get_translations); the strings below are the panel's own. The page follows the config
 * entry (config_entries/subscribe), so options changed from Configure show up here. The tab is in the address
 * (/integration-watchdog/settings).
 *
 * https://github.com/juju35/ha-integration-watchdog
 */
var INTEGRATION_WATCHDOG_PANEL_VERSION = '1.10.0';

// Rows shown at most by a device or plug picker: the search narrows the rest down
var IW_PANEL_PICK_MAX = 50;

var IntegrationWatchdogPanelI18n = {
  en: {
    title: 'Integration Watchdog',
    status: 'Status',
    power_cycles: 'Power cycles',
    settings: 'Settings',
    none: 'Not set up yet: add the integration to Home Assistant.',
    open_add: 'Add the integration',
    loading: 'Loading…',
    load_failed: 'Could not load: {error}. Trying again on its own.',
    retry: 'Retry',
    pick: 'Add…',
    no_choice: 'Nothing else to add',
    remove_chip: 'Remove {name}',
    no_pause: 'None',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    pc_none: 'No power cycle yet: add a device and the plug that powers it below.',
    add: 'Add',
    adding: 'Adding…',
    added: 'Power cycle added',
    pick_device: 'Search a device: name, area, integration…',
    pick_switch: 'Search a plug: name, area, device…',
    change: 'Change',
    no_match: 'No match',
    pick_more: '{n} more: type to narrow down',
    no_area: 'No area',
    same_area: '{area} · same area as the device',
    pc_line: 'unavailable for {delay} min · off for {off} s',
    pc_count: 'power cycles: {n}/{max}',
    pc_gave_up: 'Given up',
    pc_unavailable: 'Unavailable',
    pc_available: 'Available',
    plug_off: 'Plug off: left alone',
    plug_unavailable: 'Plug unavailable',
    unknown_device: 'Device removed',
    remove_title: 'Remove the power cycle of {name}',
    removed: 'Power cycle removed',
    open_device: 'Device',
    open_integration: 'Devices & services',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integration not set up',
    err_invalid_pause_entity: 'Not an input_boolean, switch, binary_sensor or schedule',
    err_unknown_device: 'Unknown device',
    err_generic: 'Something went wrong',
    st_loaded: 'Running',
    st_setup_retry: 'Retrying',
    st_setup_error: 'Setup failed',
    st_not_loaded: 'Stopped',
    st_other: 'Unavailable',
    w_all_ok: 'All available',
    w_unavailable_one: '{n} unavailable',
    w_unavailable_many: '{n} unavailable',
    w_gave_up_one: '{n} given up',
    w_gave_up_many: '{n} given up',
    w_checking: 'Checking…',
    w_never_checked: 'Not checked yet',
    w_checked: 'Checked {d}',
    w_check_now: 'Check now',
    w_check_failed: 'Check failed: {error}',
    w_retry: 'Try again',
    w_retry_failed: 'Try again failed: {error}',
    w_stat_unavailable: 'Unavailable',
    w_stat_reloads: 'Reloads',
    w_stat_reloads_hint: 'Since Home Assistant started',
    w_stat_ignored: 'Ignored',
    w_unavailable_title: 'Unavailable integrations',
    w_history_title: 'Recent reloads',
    w_no_history: 'No reload yet',
    w_since: 'unavailable for {d}',
    w_attempts: '{n}/{max} reloads',
    w_attempt: 'reload {n}/{max}',
    w_waiting: 'Grace period',
    w_gave_up: 'Given up',
    w_reloaded: 'Reloaded',
    w_reload_failed: 'Failed',
    w_gave_up_event: 'Given up',
    w_gave_up_after: 'after {n} reloads',
    w_power_cycled: 'Power cycled',
    w_power_cycle_failed: 'Power cycle failed',
    w_cycle_attempt: 'power cycle {n}/{max}',
    w_cycle_gave_up_after: 'after {n} power cycles',
    w_not_loaded: 'Not set up',
  },
  fr: {
    title: 'Integration Watchdog',
    status: 'État',
    power_cycles: 'Redémarrages par prise',
    settings: 'Réglages',
    none: 'Pas encore configuré : ajoutez l’intégration à Home Assistant.',
    open_add: 'Ajouter l’intégration',
    loading: 'Chargement…',
    load_failed: 'Chargement impossible : {error}. Nouvel essai automatique.',
    retry: 'Réessayer',
    pick: 'Ajouter…',
    no_choice: 'Plus rien à ajouter',
    remove_chip: 'Retirer {name}',
    no_pause: 'Aucune',
    save: 'Enregistrer',
    saving: 'Enregistrement…',
    saved: 'Enregistré',
    pc_none: 'Aucun redémarrage par prise : ajoutez ci-dessous un appareil et la prise qui l’alimente.',
    add: 'Ajouter',
    adding: 'Ajout…',
    added: 'Redémarrage par prise ajouté',
    pick_device: 'Rechercher un appareil : nom, pièce, intégration…',
    pick_switch: 'Rechercher une prise : nom, pièce, appareil…',
    change: 'Changer',
    no_match: 'Aucun résultat',
    pick_more: '{n} de plus : tapez pour affiner',
    no_area: 'Sans pièce',
    same_area: '{area} · même pièce que l’appareil',
    pc_line: 'indisponible depuis {delay} min · éteinte {off} s',
    pc_count: 'redémarrages : {n}/{max}',
    pc_gave_up: 'Abandonné',
    pc_unavailable: 'Indisponible',
    pc_available: 'Disponible',
    plug_off: 'Prise éteinte : pas touchée',
    plug_unavailable: 'Prise indisponible',
    unknown_device: 'Appareil supprimé',
    remove_title: 'Retirer le redémarrage par prise de {name}',
    removed: 'Redémarrage par prise retiré',
    open_device: 'Appareil',
    open_integration: 'Appareils et services',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Intégration non configurée',
    err_invalid_pause_entity: 'Ni input_boolean, ni switch, ni binary_sensor, ni schedule',
    err_unknown_device: 'Appareil inconnu',
    err_generic: 'Une erreur s’est produite',
    st_loaded: 'En marche',
    st_setup_retry: 'Nouvel essai',
    st_setup_error: 'Échec du démarrage',
    st_not_loaded: 'Arrêtée',
    st_other: 'Indisponible',
    w_all_ok: 'Tout est disponible',
    w_unavailable_one: '{n} indisponible',
    w_unavailable_many: '{n} indisponibles',
    w_gave_up_one: '{n} abandonnée',
    w_gave_up_many: '{n} abandonnées',
    w_checking: 'Vérification…',
    w_never_checked: 'Pas encore vérifié',
    w_checked: 'Vérifié {d}',
    w_check_now: 'Vérifier maintenant',
    w_check_failed: 'Échec de la vérification : {error}',
    w_retry: 'Réessayer',
    w_retry_failed: 'Échec de la nouvelle tentative : {error}',
    w_stat_unavailable: 'Indisponibles',
    w_stat_reloads: 'Rechargements',
    w_stat_reloads_hint: 'Depuis le démarrage de Home Assistant',
    w_stat_ignored: 'Ignorées',
    w_unavailable_title: 'Intégrations indisponibles',
    w_history_title: 'Derniers rechargements',
    w_no_history: 'Aucun rechargement pour l’instant',
    w_since: 'indisponible depuis {d}',
    w_attempts: '{n}/{max} rechargements',
    w_attempt: 'rechargement {n}/{max}',
    w_waiting: 'Délai de grâce',
    w_gave_up: 'Abandonnée',
    w_reloaded: 'Rechargée',
    w_reload_failed: 'Échec',
    w_gave_up_event: 'Abandon',
    w_gave_up_after: 'après {n} rechargements',
    w_power_cycled: 'Redémarré par la prise',
    w_power_cycle_failed: 'Échec du redémarrage',
    w_cycle_attempt: 'redémarrage {n}/{max}',
    w_cycle_gave_up_after: 'après {n} redémarrages',
    w_not_loaded: 'Non configuré',
  },
  de: {
    title: 'Integration Watchdog',
    status: 'Status',
    power_cycles: 'Neustarts per Steckdose',
    settings: 'Einstellungen',
    none: 'Noch nicht eingerichtet: Integration zu Home Assistant hinzufügen.',
    open_add: 'Integration hinzufügen',
    loading: 'Wird geladen…',
    load_failed: 'Laden fehlgeschlagen: {error}. Wird automatisch erneut versucht.',
    retry: 'Erneut versuchen',
    pick: 'Hinzufügen…',
    no_choice: 'Nichts mehr hinzuzufügen',
    remove_chip: '{name} entfernen',
    no_pause: 'Keine',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert',
    pc_none: 'Noch kein Neustart per Steckdose: unten ein Gerät und die Steckdose, die es versorgt, hinzufügen.',
    add: 'Hinzufügen',
    adding: 'Wird hinzugefügt…',
    added: 'Neustart per Steckdose hinzugefügt',
    pick_device: 'Gerät suchen: Name, Bereich, Integration…',
    pick_switch: 'Steckdose suchen: Name, Bereich, Gerät…',
    change: 'Ändern',
    no_match: 'Keine Treffer',
    pick_more: '{n} weitere: zum Eingrenzen tippen',
    no_area: 'Kein Bereich',
    same_area: '{area} · gleicher Bereich wie das Gerät',
    pc_line: '{delay} min nicht verfügbar · {off} s aus',
    pc_count: 'Neustarts: {n}/{max}',
    pc_gave_up: 'Aufgegeben',
    pc_unavailable: 'Nicht verfügbar',
    pc_available: 'Verfügbar',
    plug_off: 'Steckdose aus: unberührt',
    plug_unavailable: 'Steckdose nicht verfügbar',
    unknown_device: 'Gerät entfernt',
    remove_title: 'Neustart per Steckdose von {name} entfernen',
    removed: 'Neustart per Steckdose entfernt',
    open_device: 'Gerät',
    open_integration: 'Geräte & Dienste',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integration nicht eingerichtet',
    err_invalid_pause_entity: 'Kein input_boolean, switch, binary_sensor oder schedule',
    err_unknown_device: 'Unbekanntes Gerät',
    err_generic: 'Etwas ist schiefgelaufen',
    st_loaded: 'Läuft',
    st_setup_retry: 'Neuer Versuch',
    st_setup_error: 'Einrichtung fehlgeschlagen',
    st_not_loaded: 'Gestoppt',
    st_other: 'Nicht verfügbar',
    w_all_ok: 'Alles verfügbar',
    w_unavailable_one: '{n} nicht verfügbar',
    w_unavailable_many: '{n} nicht verfügbar',
    w_gave_up_one: '{n} aufgegeben',
    w_gave_up_many: '{n} aufgegeben',
    w_checking: 'Prüfung läuft…',
    w_never_checked: 'Noch nicht geprüft',
    w_checked: 'Geprüft {d}',
    w_check_now: 'Jetzt prüfen',
    w_check_failed: 'Prüfung fehlgeschlagen: {error}',
    w_retry: 'Erneut versuchen',
    w_retry_failed: 'Erneuter Versuch fehlgeschlagen: {error}',
    w_stat_unavailable: 'Nicht verfügbar',
    w_stat_reloads: 'Neuladungen',
    w_stat_reloads_hint: 'Seit dem Start von Home Assistant',
    w_stat_ignored: 'Ignoriert',
    w_unavailable_title: 'Nicht verfügbare Integrationen',
    w_history_title: 'Letzte Neuladungen',
    w_no_history: 'Noch keine Neuladung',
    w_since: 'nicht verfügbar seit {d}',
    w_attempts: '{n}/{max} Neuladungen',
    w_attempt: 'Neuladung {n}/{max}',
    w_waiting: 'Karenzzeit',
    w_gave_up: 'Aufgegeben',
    w_reloaded: 'Neu geladen',
    w_reload_failed: 'Fehlgeschlagen',
    w_gave_up_event: 'Aufgegeben',
    w_gave_up_after: 'nach {n} Neuladungen',
    w_power_cycled: 'Per Steckdose neu gestartet',
    w_power_cycle_failed: 'Neustart fehlgeschlagen',
    w_cycle_attempt: 'Neustart {n}/{max}',
    w_cycle_gave_up_after: 'nach {n} Neustarts',
    w_not_loaded: 'Nicht eingerichtet',
  },
  es: {
    title: 'Integration Watchdog',
    status: 'Estado',
    power_cycles: 'Reinicios por enchufe',
    settings: 'Ajustes',
    none: 'Aún no configurado: añade la integración a Home Assistant.',
    open_add: 'Añadir la integración',
    loading: 'Cargando…',
    load_failed: 'No se pudo cargar: {error}. Se reintenta automáticamente.',
    retry: 'Reintentar',
    pick: 'Añadir…',
    no_choice: 'Nada más que añadir',
    remove_chip: 'Quitar {name}',
    no_pause: 'Ninguna',
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    pc_none: 'Aún no hay reinicios por enchufe: añade abajo un dispositivo y el enchufe que lo alimenta.',
    add: 'Añadir',
    adding: 'Añadiendo…',
    added: 'Reinicio por enchufe añadido',
    pick_device: 'Buscar un dispositivo: nombre, área, integración…',
    pick_switch: 'Buscar un enchufe: nombre, área, dispositivo…',
    change: 'Cambiar',
    no_match: 'Sin resultados',
    pick_more: '{n} más: escribe para afinar',
    no_area: 'Sin área',
    same_area: '{area} · misma área que el dispositivo',
    pc_line: 'no disponible {delay} min · apagado {off} s',
    pc_count: 'reinicios: {n}/{max}',
    pc_gave_up: 'Abandonado',
    pc_unavailable: 'No disponible',
    pc_available: 'Disponible',
    plug_off: 'Enchufe apagado: no se toca',
    plug_unavailable: 'Enchufe no disponible',
    unknown_device: 'Dispositivo eliminado',
    remove_title: 'Quitar el reinicio por enchufe de {name}',
    removed: 'Reinicio por enchufe quitado',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivos y servicios',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integración no configurada',
    err_invalid_pause_entity: 'No es un input_boolean, switch, binary_sensor ni schedule',
    err_unknown_device: 'Dispositivo desconocido',
    err_generic: 'Algo ha fallado',
    st_loaded: 'En marcha',
    st_setup_retry: 'Reintentando',
    st_setup_error: 'Error de configuración',
    st_not_loaded: 'Detenida',
    st_other: 'No disponible',
    w_all_ok: 'Todo disponible',
    w_unavailable_one: '{n} no disponible',
    w_unavailable_many: '{n} no disponibles',
    w_gave_up_one: '{n} abandonada',
    w_gave_up_many: '{n} abandonadas',
    w_checking: 'Comprobando…',
    w_never_checked: 'Aún sin comprobar',
    w_checked: 'Comprobado {d}',
    w_check_now: 'Comprobar ahora',
    w_check_failed: 'La comprobación ha fallado: {error}',
    w_retry: 'Reintentar',
    w_retry_failed: 'El reintento ha fallado: {error}',
    w_stat_unavailable: 'No disponibles',
    w_stat_reloads: 'Recargas',
    w_stat_reloads_hint: 'Desde que se inició Home Assistant',
    w_stat_ignored: 'Ignoradas',
    w_unavailable_title: 'Integraciones no disponibles',
    w_history_title: 'Últimas recargas',
    w_no_history: 'Aún no hay recargas',
    w_since: 'no disponible desde hace {d}',
    w_attempts: '{n}/{max} recargas',
    w_attempt: 'recarga {n}/{max}',
    w_waiting: 'Periodo de gracia',
    w_gave_up: 'Abandonada',
    w_reloaded: 'Recargada',
    w_reload_failed: 'Fallida',
    w_gave_up_event: 'Abandono',
    w_gave_up_after: 'tras {n} recargas',
    w_power_cycled: 'Reiniciado por enchufe',
    w_power_cycle_failed: 'Reinicio fallido',
    w_cycle_attempt: 'reinicio {n}/{max}',
    w_cycle_gave_up_after: 'tras {n} reinicios',
    w_not_loaded: 'No configurado',
  },
  it: {
    title: 'Integration Watchdog',
    status: 'Stato',
    power_cycles: 'Riavvii tramite presa',
    settings: 'Impostazioni',
    none: 'Non ancora configurato: aggiungi l’integrazione a Home Assistant.',
    open_add: 'Aggiungi l’integrazione',
    loading: 'Caricamento…',
    load_failed: 'Caricamento non riuscito: {error}. Nuovo tentativo automatico.',
    retry: 'Riprova',
    pick: 'Aggiungi…',
    no_choice: 'Nient’altro da aggiungere',
    remove_chip: 'Rimuovi {name}',
    no_pause: 'Nessuna',
    save: 'Salva',
    saving: 'Salvataggio…',
    saved: 'Salvato',
    pc_none: 'Ancora nessun riavvio tramite presa: aggiungi qui sotto un dispositivo e la presa che lo alimenta.',
    add: 'Aggiungi',
    adding: 'Aggiunta…',
    added: 'Riavvio tramite presa aggiunto',
    pick_device: 'Cerca un dispositivo: nome, area, integrazione…',
    pick_switch: 'Cerca una presa: nome, area, dispositivo…',
    change: 'Cambia',
    no_match: 'Nessun risultato',
    pick_more: 'altri {n}: digita per restringere',
    no_area: 'Nessuna area',
    same_area: '{area} · stessa area del dispositivo',
    pc_line: 'non disponibile per {delay} min · spenta {off} s',
    pc_count: 'riavvii: {n}/{max}',
    pc_gave_up: 'Abbandonato',
    pc_unavailable: 'Non disponibile',
    pc_available: 'Disponibile',
    plug_off: 'Presa spenta: non toccata',
    plug_unavailable: 'Presa non disponibile',
    unknown_device: 'Dispositivo rimosso',
    remove_title: 'Rimuovi il riavvio tramite presa di {name}',
    removed: 'Riavvio tramite presa rimosso',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivi e servizi',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrazione non configurata',
    err_invalid_pause_entity: 'Non è un input_boolean, switch, binary_sensor o schedule',
    err_unknown_device: 'Dispositivo sconosciuto',
    err_generic: 'Qualcosa è andato storto',
    st_loaded: 'In esecuzione',
    st_setup_retry: 'Nuovo tentativo',
    st_setup_error: 'Configurazione non riuscita',
    st_not_loaded: 'Ferma',
    st_other: 'Non disponibile',
    w_all_ok: 'Tutto disponibile',
    w_unavailable_one: '{n} non disponibile',
    w_unavailable_many: '{n} non disponibili',
    w_gave_up_one: '{n} abbandonata',
    w_gave_up_many: '{n} abbandonate',
    w_checking: 'Controllo in corso…',
    w_never_checked: 'Non ancora controllato',
    w_checked: 'Controllato {d}',
    w_check_now: 'Controlla ora',
    w_check_failed: 'Controllo non riuscito: {error}',
    w_retry: 'Riprova',
    w_retry_failed: 'Nuovo tentativo non riuscito: {error}',
    w_stat_unavailable: 'Non disponibili',
    w_stat_reloads: 'Ricaricamenti',
    w_stat_reloads_hint: 'Dall’avvio di Home Assistant',
    w_stat_ignored: 'Ignorate',
    w_unavailable_title: 'Integrazioni non disponibili',
    w_history_title: 'Ricaricamenti recenti',
    w_no_history: 'Ancora nessun ricaricamento',
    w_since: 'non disponibile da {d}',
    w_attempts: '{n}/{max} ricaricamenti',
    w_attempt: 'ricaricamento {n}/{max}',
    w_waiting: 'In attesa',
    w_gave_up: 'Abbandonata',
    w_reloaded: 'Ricaricata',
    w_reload_failed: 'Fallito',
    w_gave_up_event: 'Abbandono',
    w_gave_up_after: 'dopo {n} ricaricamenti',
    w_power_cycled: 'Riavviato dalla presa',
    w_power_cycle_failed: 'Riavvio non riuscito',
    w_cycle_attempt: 'riavvio {n}/{max}',
    w_cycle_gave_up_after: 'dopo {n} riavvii',
    w_not_loaded: 'Non configurato',
  },
  nl: {
    title: 'Integration Watchdog',
    status: 'Status',
    power_cycles: 'Herstarts via stekker',
    settings: 'Instellingen',
    none: 'Nog niet ingesteld: voeg de integratie toe aan Home Assistant.',
    open_add: 'Integratie toevoegen',
    loading: 'Laden…',
    load_failed: 'Laden mislukt: {error}. Wordt automatisch opnieuw geprobeerd.',
    retry: 'Opnieuw proberen',
    pick: 'Toevoegen…',
    no_choice: 'Niets meer toe te voegen',
    remove_chip: '{name} verwijderen',
    no_pause: 'Geen',
    save: 'Opslaan',
    saving: 'Opslaan…',
    saved: 'Opgeslagen',
    pc_none: 'Nog geen herstart via stekker: voeg hieronder een apparaat en de stekker die het voedt toe.',
    add: 'Toevoegen',
    adding: 'Toevoegen…',
    added: 'Herstart via stekker toegevoegd',
    pick_device: 'Zoek een apparaat: naam, ruimte, integratie…',
    pick_switch: 'Zoek een stekker: naam, ruimte, apparaat…',
    change: 'Wijzigen',
    no_match: 'Geen resultaten',
    pick_more: 'nog {n}: typ om te verfijnen',
    no_area: 'Geen ruimte',
    same_area: '{area} · zelfde ruimte als het apparaat',
    pc_line: '{delay} min onbeschikbaar · {off} s uit',
    pc_count: 'herstarts: {n}/{max}',
    pc_gave_up: 'Opgegeven',
    pc_unavailable: 'Onbeschikbaar',
    pc_available: 'Beschikbaar',
    plug_off: 'Stekker uit: onaangeroerd',
    plug_unavailable: 'Stekker onbeschikbaar',
    unknown_device: 'Apparaat verwijderd',
    remove_title: 'Herstart via stekker van {name} verwijderen',
    removed: 'Herstart via stekker verwijderd',
    open_device: 'Apparaat',
    open_integration: 'Apparaten en diensten',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integratie niet ingesteld',
    err_invalid_pause_entity: 'Geen input_boolean, switch, binary_sensor of schedule',
    err_unknown_device: 'Onbekend apparaat',
    err_generic: 'Er is iets misgegaan',
    st_loaded: 'Actief',
    st_setup_retry: 'Opnieuw proberen',
    st_setup_error: 'Instellen mislukt',
    st_not_loaded: 'Gestopt',
    st_other: 'Niet beschikbaar',
    w_all_ok: 'Alles beschikbaar',
    w_unavailable_one: '{n} niet beschikbaar',
    w_unavailable_many: '{n} niet beschikbaar',
    w_gave_up_one: '{n} opgegeven',
    w_gave_up_many: '{n} opgegeven',
    w_checking: 'Controleren…',
    w_never_checked: 'Nog niet gecontroleerd',
    w_checked: 'Gecontroleerd {d}',
    w_check_now: 'Nu controleren',
    w_check_failed: 'Controle mislukt: {error}',
    w_retry: 'Opnieuw proberen',
    w_retry_failed: 'Opnieuw proberen mislukt: {error}',
    w_stat_unavailable: 'Niet beschikbaar',
    w_stat_reloads: 'Herladen',
    w_stat_reloads_hint: 'Sinds Home Assistant is gestart',
    w_stat_ignored: 'Genegeerd',
    w_unavailable_title: 'Niet-beschikbare integraties',
    w_history_title: 'Recente herlaadpogingen',
    w_no_history: 'Nog geen herlaadpogingen',
    w_since: '{d} niet beschikbaar',
    w_attempts: '{n}/{max} herlaadpogingen',
    w_attempt: 'herlaadpoging {n}/{max}',
    w_waiting: 'Wachttijd',
    w_gave_up: 'Opgegeven',
    w_reloaded: 'Herladen',
    w_reload_failed: 'Mislukt',
    w_gave_up_event: 'Opgegeven',
    w_gave_up_after: 'na {n} herlaadpogingen',
    w_power_cycled: 'Herstart via stekker',
    w_power_cycle_failed: 'Herstart mislukt',
    w_cycle_attempt: 'herstart {n}/{max}',
    w_cycle_gave_up_after: 'na {n} herstarts',
    w_not_loaded: 'Niet ingesteld',
  },
  pt: {
    title: 'Integration Watchdog',
    status: 'Estado',
    power_cycles: 'Reinícios por tomada',
    settings: 'Definições',
    none: 'Ainda não configurado: adicione a integração ao Home Assistant.',
    open_add: 'Adicionar a integração',
    loading: 'A carregar…',
    load_failed: 'Não foi possível carregar: {error}. Nova tentativa automática.',
    retry: 'Tentar novamente',
    pick: 'Adicionar…',
    no_choice: 'Nada mais a adicionar',
    remove_chip: 'Remover {name}',
    no_pause: 'Nenhuma',
    save: 'Guardar',
    saving: 'A guardar…',
    saved: 'Guardado',
    pc_none: 'Ainda sem reinícios por tomada: adicione abaixo um dispositivo e a tomada que o alimenta.',
    add: 'Adicionar',
    adding: 'A adicionar…',
    added: 'Reinício por tomada adicionado',
    pick_device: 'Procurar um dispositivo: nome, área, integração…',
    pick_switch: 'Procurar uma tomada: nome, área, dispositivo…',
    change: 'Alterar',
    no_match: 'Sem resultados',
    pick_more: 'mais {n}: escreva para filtrar',
    no_area: 'Sem área',
    same_area: '{area} · mesma área do dispositivo',
    pc_line: 'indisponível {delay} min · desligada {off} s',
    pc_count: 'reinícios: {n}/{max}',
    pc_gave_up: 'Desistiu',
    pc_unavailable: 'Indisponível',
    pc_available: 'Disponível',
    plug_off: 'Tomada desligada: não é tocada',
    plug_unavailable: 'Tomada indisponível',
    unknown_device: 'Dispositivo removido',
    remove_title: 'Remover o reinício por tomada de {name}',
    removed: 'Reinício por tomada removido',
    open_device: 'Dispositivo',
    open_integration: 'Dispositivos e serviços',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integração não configurada',
    err_invalid_pause_entity: 'Não é um input_boolean, switch, binary_sensor nem schedule',
    err_unknown_device: 'Dispositivo desconhecido',
    err_generic: 'Algo correu mal',
    st_loaded: 'Em execução',
    st_setup_retry: 'Nova tentativa',
    st_setup_error: 'Configuração falhou',
    st_not_loaded: 'Parada',
    st_other: 'Indisponível',
    w_all_ok: 'Tudo disponível',
    w_unavailable_one: '{n} indisponível',
    w_unavailable_many: '{n} indisponíveis',
    w_gave_up_one: '{n} abandonada',
    w_gave_up_many: '{n} abandonadas',
    w_checking: 'A verificar…',
    w_never_checked: 'Ainda não verificado',
    w_checked: 'Verificado {d}',
    w_check_now: 'Verificar agora',
    w_check_failed: 'A verificação falhou: {error}',
    w_retry: 'Tentar novamente',
    w_retry_failed: 'A nova tentativa falhou: {error}',
    w_stat_unavailable: 'Indisponíveis',
    w_stat_reloads: 'Recarregamentos',
    w_stat_reloads_hint: 'Desde o arranque do Home Assistant',
    w_stat_ignored: 'Ignoradas',
    w_unavailable_title: 'Integrações indisponíveis',
    w_history_title: 'Recarregamentos recentes',
    w_no_history: 'Ainda nenhum recarregamento',
    w_since: 'indisponível há {d}',
    w_attempts: '{n}/{max} recarregamentos',
    w_attempt: 'recarregamento {n}/{max}',
    w_waiting: 'Em espera',
    w_gave_up: 'Abandonada',
    w_reloaded: 'Recarregada',
    w_reload_failed: 'Falhou',
    w_gave_up_event: 'Abandono',
    w_gave_up_after: 'após {n} recarregamentos',
    w_power_cycled: 'Reiniciado pela tomada',
    w_power_cycle_failed: 'Falha no reinício',
    w_cycle_attempt: 'reinício {n}/{max}',
    w_cycle_gave_up_after: 'após {n} reinícios',
    w_not_loaded: 'Não configurado',
  },
  pl: {
    title: 'Integration Watchdog',
    status: 'Stan',
    power_cycles: 'Restarty przez gniazdko',
    settings: 'Ustawienia',
    none: 'Jeszcze nie skonfigurowano: dodaj integrację do Home Assistant.',
    open_add: 'Dodaj integrację',
    loading: 'Ładowanie…',
    load_failed: 'Nie udało się wczytać: {error}. Ponowna próba automatycznie.',
    retry: 'Spróbuj ponownie',
    pick: 'Dodaj…',
    no_choice: 'Nie ma już nic do dodania',
    remove_chip: 'Usuń {name}',
    no_pause: 'Brak',
    save: 'Zapisz',
    saving: 'Zapisywanie…',
    saved: 'Zapisano',
    pc_none: 'Brak restartów przez gniazdko: dodaj poniżej urządzenie i gniazdko, które je zasila.',
    add: 'Dodaj',
    adding: 'Dodawanie…',
    added: 'Dodano restart przez gniazdko',
    pick_device: 'Szukaj urządzenia: nazwa, obszar, integracja…',
    pick_switch: 'Szukaj gniazdka: nazwa, obszar, urządzenie…',
    change: 'Zmień',
    no_match: 'Brak wyników',
    pick_more: 'jeszcze {n}: pisz, aby zawęzić',
    no_area: 'Brak obszaru',
    same_area: '{area} · ten sam obszar co urządzenie',
    pc_line: 'niedostępne {delay} min · wyłączone {off} s',
    pc_count: 'restarty: {n}/{max}',
    pc_gave_up: 'Porzucone',
    pc_unavailable: 'Niedostępne',
    pc_available: 'Dostępne',
    plug_off: 'Gniazdko wyłączone: nietknięte',
    plug_unavailable: 'Gniazdko niedostępne',
    unknown_device: 'Urządzenie usunięte',
    remove_title: 'Usuń restart przez gniazdko dla {name}',
    removed: 'Usunięto restart przez gniazdko',
    open_device: 'Urządzenie',
    open_integration: 'Urządzenia i usługi',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integracja nie jest skonfigurowana',
    err_invalid_pause_entity: 'To nie jest input_boolean, switch, binary_sensor ani schedule',
    err_unknown_device: 'Nieznane urządzenie',
    err_generic: 'Coś poszło nie tak',
    st_loaded: 'Działa',
    st_setup_retry: 'Ponawianie',
    st_setup_error: 'Konfiguracja nie powiodła się',
    st_not_loaded: 'Zatrzymana',
    st_other: 'Niedostępna',
    w_all_ok: 'Wszystko dostępne',
    w_unavailable_one: '{n} niedostępna',
    w_unavailable_many: '{n} niedostępnych',
    w_gave_up_one: '{n} porzucona',
    w_gave_up_many: '{n} porzuconych',
    w_checking: 'Sprawdzanie…',
    w_never_checked: 'Jeszcze nie sprawdzono',
    w_checked: 'Sprawdzono {d}',
    w_check_now: 'Sprawdź teraz',
    w_check_failed: 'Sprawdzanie nie powiodło się: {error}',
    w_retry: 'Spróbuj ponownie',
    w_retry_failed: 'Ponowna próba nie powiodła się: {error}',
    w_stat_unavailable: 'Niedostępne',
    w_stat_reloads: 'Ponowne wczytania',
    w_stat_reloads_hint: 'Od uruchomienia Home Assistant',
    w_stat_ignored: 'Ignorowane',
    w_unavailable_title: 'Niedostępne integracje',
    w_history_title: 'Ostatnie ponowne wczytania',
    w_no_history: 'Brak ponownych wczytań',
    w_since: 'niedostępna od {d}',
    w_attempts: 'Próby: {n}/{max}',
    w_attempt: 'ponowne wczytanie {n}/{max}',
    w_waiting: 'Okres karencji',
    w_gave_up: 'Porzucona',
    w_reloaded: 'Wczytana ponownie',
    w_reload_failed: 'Błąd',
    w_gave_up_event: 'Porzucenie',
    w_gave_up_after: 'ponowne wczytania: {n}',
    w_power_cycled: 'Zrestartowane przez gniazdko',
    w_power_cycle_failed: 'Restart nieudany',
    w_cycle_attempt: 'restart {n}/{max}',
    w_cycle_gave_up_after: 'po {n} restartach',
    w_not_loaded: 'Nie skonfigurowano',
  },
  sr: {
    title: 'Integration Watchdog',
    status: 'Стање',
    power_cycles: 'Рестарти преко утичнице',
    settings: 'Подешавања',
    none: 'Још није подешено: додајте интеграцију у Home Assistant.',
    open_add: 'Додај интеграцију',
    loading: 'Учитавање…',
    load_failed: 'Учитавање није успело: {error}. Аутоматски се покушава поново.',
    retry: 'Покушај поново',
    pick: 'Додај…',
    no_choice: 'Нема више шта да се дода',
    remove_chip: 'Уклони {name}',
    no_pause: 'Нема',
    save: 'Сачувај',
    saving: 'Чување…',
    saved: 'Сачувано',
    pc_none: 'Још нема рестарта преко утичнице: додајте испод уређај и утичницу која га напаја.',
    add: 'Додај',
    adding: 'Додавање…',
    added: 'Рестарт преко утичнице додат',
    pick_device: 'Претражите уређај: назив, простор, интеграција…',
    pick_switch: 'Претражите утичницу: назив, простор, уређај…',
    change: 'Промени',
    no_match: 'Нема резултата',
    pick_more: 'још {n}: куцајте да сузите',
    no_area: 'Без простора',
    same_area: '{area} · исти простор као уређај',
    pc_line: 'недоступан {delay} мин · искључена {off} с',
    pc_count: 'рестарти: {n}/{max}',
    pc_gave_up: 'Одустато',
    pc_unavailable: 'Недоступан',
    pc_available: 'Доступан',
    plug_off: 'Утичница искључена: не дира се',
    plug_unavailable: 'Утичница недоступна',
    unknown_device: 'Уређај уклоњен',
    remove_title: 'Уклони рестарт преко утичнице за {name}',
    removed: 'Рестарт преко утичнице уклоњен',
    open_device: 'Уређај',
    open_integration: 'Уређаји и услуге',
    u_min: 'мин',
    u_s: 'с',
    err_not_found: 'Интеграција није подешена',
    err_invalid_pause_entity: 'Није input_boolean, switch, binary_sensor ни schedule',
    err_unknown_device: 'Непознат уређај',
    err_generic: 'Нешто је пошло наопако',
    st_loaded: 'Ради',
    st_setup_retry: 'Поновни покушај',
    st_setup_error: 'Подешавање није успело',
    st_not_loaded: 'Заустављена',
    st_other: 'Недоступна',
    w_all_ok: 'Све је доступно',
    w_unavailable_one: '{n} недоступна',
    w_unavailable_many: '{n} недоступних',
    w_gave_up_one: '{n} напуштена',
    w_gave_up_many: '{n} напуштених',
    w_checking: 'Проверавање…',
    w_never_checked: 'Још није проверено',
    w_checked: 'Проверено {d}',
    w_check_now: 'Провери сада',
    w_check_failed: 'Провера није успела: {error}',
    w_retry: 'Покушај поново',
    w_retry_failed: 'Поновни покушај није успео: {error}',
    w_stat_unavailable: 'Недоступне',
    w_stat_reloads: 'Поновна учитавања',
    w_stat_reloads_hint: 'Од покретања Home Assistant-а',
    w_stat_ignored: 'Игнорисане',
    w_unavailable_title: 'Недоступне интеграције',
    w_history_title: 'Недавна поновна учитавања',
    w_no_history: 'Још нема поновних учитавања',
    w_since: 'недоступна већ {d}',
    w_attempts: '{n}/{max} поновних учитавања',
    w_attempt: 'поновно учитавање {n}/{max}',
    w_waiting: 'Период чекања',
    w_gave_up: 'Напуштена',
    w_reloaded: 'Поново учитана',
    w_reload_failed: 'Неуспело',
    w_gave_up_event: 'Напуштена',
    w_gave_up_after: 'после {n} поновних учитавања',
    w_power_cycled: 'Рестартован преко утичнице',
    w_power_cycle_failed: 'Рестарт није успео',
    w_cycle_attempt: 'рестарт {n}/{max}',
    w_cycle_gave_up_after: 'после {n} рестарта',
    w_not_loaded: 'Није подешено',
  },
  'sr-Latn': {
    title: 'Integration Watchdog',
    status: 'Stanje',
    power_cycles: 'Restarti preko utičnice',
    settings: 'Podešavanja',
    none: 'Još nije podešeno: dodajte integraciju u Home Assistant.',
    open_add: 'Dodaj integraciju',
    loading: 'Učitavanje…',
    load_failed: 'Učitavanje nije uspelo: {error}. Automatski se pokušava ponovo.',
    retry: 'Pokušaj ponovo',
    pick: 'Dodaj…',
    no_choice: 'Nema više šta da se doda',
    remove_chip: 'Ukloni {name}',
    no_pause: 'Nema',
    save: 'Sačuvaj',
    saving: 'Čuvanje…',
    saved: 'Sačuvano',
    pc_none: 'Još nema restarta preko utičnice: dodajte ispod uređaj i utičnicu koja ga napaja.',
    add: 'Dodaj',
    adding: 'Dodavanje…',
    added: 'Restart preko utičnice dodat',
    pick_device: 'Pretražite uređaj: naziv, prostor, integracija…',
    pick_switch: 'Pretražite utičnicu: naziv, prostor, uređaj…',
    change: 'Promeni',
    no_match: 'Nema rezultata',
    pick_more: 'još {n}: kucajte da suzite',
    no_area: 'Bez prostora',
    same_area: '{area} · isti prostor kao uređaj',
    pc_line: 'nedostupan {delay} min · isključena {off} s',
    pc_count: 'restarti: {n}/{max}',
    pc_gave_up: 'Odustato',
    pc_unavailable: 'Nedostupan',
    pc_available: 'Dostupan',
    plug_off: 'Utičnica isključena: ne dira se',
    plug_unavailable: 'Utičnica nedostupna',
    unknown_device: 'Uređaj uklonjen',
    remove_title: 'Ukloni restart preko utičnice za {name}',
    removed: 'Restart preko utičnice uklonjen',
    open_device: 'Uređaj',
    open_integration: 'Uređaji i usluge',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integracija nije podešena',
    err_invalid_pause_entity: 'Nije input_boolean, switch, binary_sensor ni schedule',
    err_unknown_device: 'Nepoznat uređaj',
    err_generic: 'Nešto je pošlo naopako',
    st_loaded: 'Radi',
    st_setup_retry: 'Ponovni pokušaj',
    st_setup_error: 'Podešavanje nije uspelo',
    st_not_loaded: 'Zaustavljena',
    st_other: 'Nedostupna',
    w_all_ok: 'Sve je dostupno',
    w_unavailable_one: '{n} nedostupna',
    w_unavailable_many: '{n} nedostupnih',
    w_gave_up_one: '{n} napuštena',
    w_gave_up_many: '{n} napuštenih',
    w_checking: 'Proveravanje…',
    w_never_checked: 'Još nije provereno',
    w_checked: 'Provereno {d}',
    w_check_now: 'Proveri sada',
    w_check_failed: 'Provera nije uspela: {error}',
    w_retry: 'Pokušaj ponovo',
    w_retry_failed: 'Ponovni pokušaj nije uspeo: {error}',
    w_stat_unavailable: 'Nedostupne',
    w_stat_reloads: 'Ponovna učitavanja',
    w_stat_reloads_hint: 'Od pokretanja Home Assistant-a',
    w_stat_ignored: 'Ignorisane',
    w_unavailable_title: 'Nedostupne integracije',
    w_history_title: 'Nedavna ponovna učitavanja',
    w_no_history: 'Još nema ponovnih učitavanja',
    w_since: 'nedostupna već {d}',
    w_attempts: '{n}/{max} ponovnih učitavanja',
    w_attempt: 'ponovno učitavanje {n}/{max}',
    w_waiting: 'Period čekanja',
    w_gave_up: 'Napuštena',
    w_reloaded: 'Ponovo učitana',
    w_reload_failed: 'Neuspelo',
    w_gave_up_event: 'Napuštena',
    w_gave_up_after: 'posle {n} ponovnih učitavanja',
    w_power_cycled: 'Restartovan preko utičnice',
    w_power_cycle_failed: 'Restart nije uspeo',
    w_cycle_attempt: 'restart {n}/{max}',
    w_cycle_gave_up_after: 'posle {n} restarta',
    w_not_loaded: 'Nije podešeno',
  },
  ro: {
    title: 'Integration Watchdog',
    status: 'Stare',
    power_cycles: 'Reporniri prin priză',
    settings: 'Setări',
    none: 'Încă neconfigurat: adaugă integrarea în Home Assistant.',
    open_add: 'Adaugă integrarea',
    loading: 'Se încarcă…',
    load_failed: 'Încărcarea a eșuat: {error}. Se reîncearcă automat.',
    retry: 'Reîncearcă',
    pick: 'Adaugă…',
    no_choice: 'Nimic altceva de adăugat',
    remove_chip: 'Elimină {name}',
    no_pause: 'Niciuna',
    save: 'Salvează',
    saving: 'Se salvează…',
    saved: 'Salvat',
    pc_none: 'Încă nicio repornire prin priză: adaugă mai jos un dispozitiv și priza care îl alimentează.',
    add: 'Adaugă',
    adding: 'Se adaugă…',
    added: 'Repornire prin priză adăugată',
    pick_device: 'Căutați un dispozitiv: nume, zonă, integrare…',
    pick_switch: 'Căutați o priză: nume, zonă, dispozitiv…',
    change: 'Schimbă',
    no_match: 'Niciun rezultat',
    pick_more: 'încă {n}: tastați pentru a restrânge',
    no_area: 'Fără zonă',
    same_area: '{area} · aceeași zonă ca dispozitivul',
    pc_line: 'indisponibil {delay} min · oprită {off} s',
    pc_count: 'reporniri: {n}/{max}',
    pc_gave_up: 'Abandonat',
    pc_unavailable: 'Indisponibil',
    pc_available: 'Disponibil',
    plug_off: 'Priză oprită: neatinsă',
    plug_unavailable: 'Priză indisponibilă',
    unknown_device: 'Dispozitiv eliminat',
    remove_title: 'Elimină repornirea prin priză pentru {name}',
    removed: 'Repornire prin priză eliminată',
    open_device: 'Dispozitiv',
    open_integration: 'Dispozitive și servicii',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrare neconfigurată',
    err_invalid_pause_entity: 'Nu este input_boolean, switch, binary_sensor sau schedule',
    err_unknown_device: 'Dispozitiv necunoscut',
    err_generic: 'Ceva nu a mers',
    st_loaded: 'Rulează',
    st_setup_retry: 'Se reîncearcă',
    st_setup_error: 'Configurarea a eșuat',
    st_not_loaded: 'Oprită',
    st_other: 'Indisponibilă',
    w_all_ok: 'Totul este disponibil',
    w_unavailable_one: '{n} indisponibilă',
    w_unavailable_many: 'Indisponibile: {n}',
    w_gave_up_one: '{n} abandonată',
    w_gave_up_many: 'Abandonate: {n}',
    w_checking: 'Se verifică…',
    w_never_checked: 'Neverificat încă',
    w_checked: 'Verificat {d}',
    w_check_now: 'Verifică acum',
    w_check_failed: 'Verificarea a eșuat: {error}',
    w_retry: 'Reîncearcă',
    w_retry_failed: 'Reîncercarea a eșuat: {error}',
    w_stat_unavailable: 'Indisponibile',
    w_stat_reloads: 'Reîncărcări',
    w_stat_reloads_hint: 'De la pornirea Home Assistant',
    w_stat_ignored: 'Ignorate',
    w_unavailable_title: 'Integrări indisponibile',
    w_history_title: 'Reîncărcări recente',
    w_no_history: 'Nicio reîncărcare încă',
    w_since: 'indisponibilă de {d}',
    w_attempts: 'Reîncărcări: {n}/{max}',
    w_attempt: 'reîncărcare {n}/{max}',
    w_waiting: 'Perioadă de grație',
    w_gave_up: 'Abandonată',
    w_reloaded: 'Reîncărcată',
    w_reload_failed: 'Eșuată',
    w_gave_up_event: 'Abandon',
    w_gave_up_after: 'reîncărcări: {n}',
    w_power_cycled: 'Repornit prin priză',
    w_power_cycle_failed: 'Repornire eșuată',
    w_cycle_attempt: 'repornirea {n}/{max}',
    w_cycle_gave_up_after: 'după {n} reporniri',
    w_not_loaded: 'Neconfigurat',
  },
  da: {
    title: 'Integration Watchdog',
    status: 'Status',
    power_cycles: 'Genstarter via stik',
    settings: 'Indstillinger',
    none: 'Ikke sat op endnu: tilføj integrationen til Home Assistant.',
    open_add: 'Tilføj integrationen',
    loading: 'Indlæser…',
    load_failed: 'Kunne ikke indlæse: {error}. Prøver igen automatisk.',
    retry: 'Prøv igen',
    pick: 'Tilføj…',
    no_choice: 'Ikke mere at tilføje',
    remove_chip: 'Fjern {name}',
    no_pause: 'Ingen',
    save: 'Gem',
    saving: 'Gemmer…',
    saved: 'Gemt',
    pc_none: 'Ingen genstarter via stik endnu: tilføj en enhed og det stik, der forsyner den, herunder.',
    add: 'Tilføj',
    adding: 'Tilføjer…',
    added: 'Genstart via stik tilføjet',
    pick_device: 'Søg efter en enhed: navn, område, integration…',
    pick_switch: 'Søg efter et stik: navn, område, enhed…',
    change: 'Skift',
    no_match: 'Ingen resultater',
    pick_more: '{n} mere: skriv for at indsnævre',
    no_area: 'Intet område',
    same_area: '{area} · samme område som enheden',
    pc_line: 'utilgængelig {delay} min · slukket {off} s',
    pc_count: 'genstarter: {n}/{max}',
    pc_gave_up: 'Opgivet',
    pc_unavailable: 'Utilgængelig',
    pc_available: 'Tilgængelig',
    plug_off: 'Stik slukket: røres ikke',
    plug_unavailable: 'Stik utilgængeligt',
    unknown_device: 'Enhed fjernet',
    remove_title: 'Fjern genstart via stik for {name}',
    removed: 'Genstart via stik fjernet',
    open_device: 'Enhed',
    open_integration: 'Enheder og tjenester',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrationen er ikke sat op',
    err_invalid_pause_entity: 'Ikke en input_boolean, switch, binary_sensor eller schedule',
    err_unknown_device: 'Ukendt enhed',
    err_generic: 'Noget gik galt',
    st_loaded: 'Kører',
    st_setup_retry: 'Prøver igen',
    st_setup_error: 'Opsætning mislykkedes',
    st_not_loaded: 'Stoppet',
    st_other: 'Utilgængelig',
    w_all_ok: 'Alt er tilgængeligt',
    w_unavailable_one: '{n} utilgængelig',
    w_unavailable_many: '{n} utilgængelige',
    w_gave_up_one: '{n} opgivet',
    w_gave_up_many: '{n} opgivet',
    w_checking: 'Kontrollerer…',
    w_never_checked: 'Ikke kontrolleret endnu',
    w_checked: 'Kontrolleret {d}',
    w_check_now: 'Kontrollér nu',
    w_check_failed: 'Kontrollen mislykkedes: {error}',
    w_retry: 'Prøv igen',
    w_retry_failed: 'Nyt forsøg mislykkedes: {error}',
    w_stat_unavailable: 'Utilgængelige',
    w_stat_reloads: 'Genindlæsninger',
    w_stat_reloads_hint: 'Siden Home Assistant startede',
    w_stat_ignored: 'Ignorerede',
    w_unavailable_title: 'Utilgængelige integrationer',
    w_history_title: 'Seneste genindlæsninger',
    w_no_history: 'Ingen genindlæsninger endnu',
    w_since: 'utilgængelig i {d}',
    w_attempts: '{n}/{max} genindlæsninger',
    w_attempt: 'genindlæsning {n}/{max}',
    w_waiting: 'Respitperiode',
    w_gave_up: 'Opgivet',
    w_reloaded: 'Genindlæst',
    w_reload_failed: 'Mislykkedes',
    w_gave_up_event: 'Opgivet',
    w_gave_up_after: 'efter {n} genindlæsninger',
    w_power_cycled: 'Genstartet via stik',
    w_power_cycle_failed: 'Genstart mislykkedes',
    w_cycle_attempt: 'genstart {n}/{max}',
    w_cycle_gave_up_after: 'efter {n} genstarter',
    w_not_loaded: 'Ikke konfigureret',
  },
  sv: {
    title: 'Integration Watchdog',
    status: 'Status',
    power_cycles: 'Omstarter via uttag',
    settings: 'Inställningar',
    none: 'Inte konfigurerat ännu: lägg till integrationen i Home Assistant.',
    open_add: 'Lägg till integrationen',
    loading: 'Läser in…',
    load_failed: 'Kunde inte läsa in: {error}. Försöker igen automatiskt.',
    retry: 'Försök igen',
    pick: 'Lägg till…',
    no_choice: 'Inget mer att lägga till',
    remove_chip: 'Ta bort {name}',
    no_pause: 'Ingen',
    save: 'Spara',
    saving: 'Sparar…',
    saved: 'Sparat',
    pc_none: 'Inga omstarter via uttag än: lägg till en enhet och uttaget som driver den nedan.',
    add: 'Lägg till',
    adding: 'Lägger till…',
    added: 'Omstart via uttag tillagd',
    pick_device: 'Sök en enhet: namn, område, integration…',
    pick_switch: 'Sök ett uttag: namn, område, enhet…',
    change: 'Ändra',
    no_match: 'Inga träffar',
    pick_more: '{n} till: skriv för att begränsa',
    no_area: 'Inget område',
    same_area: '{area} · samma område som enheten',
    pc_line: 'otillgänglig {delay} min · av {off} s',
    pc_count: 'omstarter: {n}/{max}',
    pc_gave_up: 'Uppgiven',
    pc_unavailable: 'Otillgänglig',
    pc_available: 'Tillgänglig',
    plug_off: 'Uttag av: lämnas orört',
    plug_unavailable: 'Uttag otillgängligt',
    unknown_device: 'Enhet borttagen',
    remove_title: 'Ta bort omstart via uttag för {name}',
    removed: 'Omstart via uttag borttagen',
    open_device: 'Enhet',
    open_integration: 'Enheter och tjänster',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrationen är inte konfigurerad',
    err_invalid_pause_entity: 'Inte en input_boolean, switch, binary_sensor eller schedule',
    err_unknown_device: 'Okänd enhet',
    err_generic: 'Något gick fel',
    st_loaded: 'Körs',
    st_setup_retry: 'Försöker igen',
    st_setup_error: 'Konfigurationen misslyckades',
    st_not_loaded: 'Stoppad',
    st_other: 'Otillgänglig',
    w_all_ok: 'Allt är tillgängligt',
    w_unavailable_one: '{n} otillgänglig',
    w_unavailable_many: '{n} otillgängliga',
    w_gave_up_one: '{n} övergiven',
    w_gave_up_many: '{n} övergivna',
    w_checking: 'Kontrollerar…',
    w_never_checked: 'Inte kontrollerad än',
    w_checked: 'Kontrollerad {d}',
    w_check_now: 'Kontrollera nu',
    w_check_failed: 'Kontrollen misslyckades: {error}',
    w_retry: 'Försök igen',
    w_retry_failed: 'Nytt försök misslyckades: {error}',
    w_stat_unavailable: 'Otillgängliga',
    w_stat_reloads: 'Omladdningar',
    w_stat_reloads_hint: 'Sedan Home Assistant startade',
    w_stat_ignored: 'Ignorerade',
    w_unavailable_title: 'Otillgängliga integrationer',
    w_history_title: 'Senaste omladdningar',
    w_no_history: 'Inga omladdningar än',
    w_since: 'otillgänglig i {d}',
    w_attempts: '{n}/{max} omladdningar',
    w_attempt: 'omladdning {n}/{max}',
    w_waiting: 'Respittid',
    w_gave_up: 'Övergiven',
    w_reloaded: 'Omladdad',
    w_reload_failed: 'Misslyckades',
    w_gave_up_event: 'Övergiven',
    w_gave_up_after: 'efter {n} omladdningar',
    w_power_cycled: 'Omstartad via uttag',
    w_power_cycle_failed: 'Omstart misslyckades',
    w_cycle_attempt: 'omstart {n}/{max}',
    w_cycle_gave_up_after: 'efter {n} omstarter',
    w_not_loaded: 'Inte konfigurerad',
  },
  bg: {
    title: 'Integration Watchdog',
    status: 'Състояние',
    power_cycles: 'Рестарти чрез контакт',
    settings: 'Настройки',
    none: 'Все още не е настроено: добавете интеграцията в Home Assistant.',
    open_add: 'Добавяне на интеграцията',
    loading: 'Зареждане…',
    load_failed: 'Неуспешно зареждане: {error}. Автоматичен нов опит.',
    retry: 'Опитай отново',
    pick: 'Добавяне…',
    no_choice: 'Няма какво повече да се добави',
    remove_chip: 'Премахване на {name}',
    no_pause: 'Няма',
    save: 'Запазване',
    saving: 'Запазване…',
    saved: 'Запазено',
    pc_none: 'Все още няма рестарти чрез контакт: добавете по-долу устройство и контакта, който го захранва.',
    add: 'Добавяне',
    adding: 'Добавяне…',
    added: 'Рестартът чрез контакт е добавен',
    pick_device: 'Търсене на устройство: име, зона, интеграция…',
    pick_switch: 'Търсене на контакт: име, зона, устройство…',
    change: 'Промяна',
    no_match: 'Няма резултати',
    pick_more: 'още {n}: пишете, за да стесните',
    no_area: 'Без зона',
    same_area: '{area} · същата зона като устройството',
    pc_line: 'недостъпно {delay} мин · изключен {off} с',
    pc_count: 'рестарти: {n}/{max}',
    pc_gave_up: 'Отказано',
    pc_unavailable: 'Недостъпно',
    pc_available: 'Достъпно',
    plug_off: 'Контактът е изключен: не се пипа',
    plug_unavailable: 'Контактът е недостъпен',
    unknown_device: 'Устройството е премахнато',
    remove_title: 'Премахване на рестарта чрез контакт за {name}',
    removed: 'Рестартът чрез контакт е премахнат',
    open_device: 'Устройство',
    open_integration: 'Устройства и услуги',
    u_min: 'мин',
    u_s: 'с',
    err_not_found: 'Интеграцията не е настроена',
    err_invalid_pause_entity: 'Не е input_boolean, switch, binary_sensor или schedule',
    err_unknown_device: 'Неизвестно устройство',
    err_generic: 'Нещо се обърка',
    st_loaded: 'Работи',
    st_setup_retry: 'Нов опит',
    st_setup_error: 'Настройката е неуспешна',
    st_not_loaded: 'Спряна',
    st_other: 'Недостъпна',
    w_all_ok: 'Всичко е достъпно',
    w_unavailable_one: '{n} недостъпна',
    w_unavailable_many: '{n} недостъпни',
    w_gave_up_one: '{n} изоставена',
    w_gave_up_many: '{n} изоставени',
    w_checking: 'Проверка…',
    w_never_checked: 'Още не е проверено',
    w_checked: 'Проверено {d}',
    w_check_now: 'Провери сега',
    w_check_failed: 'Проверката не бе успешна: {error}',
    w_retry: 'Опитай отново',
    w_retry_failed: 'Новият опит не бе успешен: {error}',
    w_stat_unavailable: 'Недостъпни',
    w_stat_reloads: 'Презареждания',
    w_stat_reloads_hint: 'От стартирането на Home Assistant',
    w_stat_ignored: 'Игнорирани',
    w_unavailable_title: 'Недостъпни интеграции',
    w_history_title: 'Последни презареждания',
    w_no_history: 'Още няма презареждания',
    w_since: 'недостъпна от {d}',
    w_attempts: 'Презареждания: {n}/{max}',
    w_attempt: 'презареждане {n}/{max}',
    w_waiting: 'Гратисен период',
    w_gave_up: 'Изоставена',
    w_reloaded: 'Презаредена',
    w_reload_failed: 'Неуспешно',
    w_gave_up_event: 'Изоставена',
    w_gave_up_after: 'презареждания: {n}',
    w_power_cycled: 'Рестартирано чрез контакт',
    w_power_cycle_failed: 'Неуспешен рестарт',
    w_cycle_attempt: 'рестарт {n}/{max}',
    w_cycle_gave_up_after: 'след {n} рестарта',
    w_not_loaded: 'Не е настроено',
  },
  ru: {
    title: 'Integration Watchdog',
    status: 'Состояние',
    power_cycles: 'Перезапуски через розетку',
    settings: 'Настройки',
    none: 'Ещё не настроено: добавьте интеграцию в Home Assistant.',
    open_add: 'Добавить интеграцию',
    loading: 'Загрузка…',
    load_failed: 'Не удалось загрузить: {error}. Повтор выполняется автоматически.',
    retry: 'Повторить',
    pick: 'Добавить…',
    no_choice: 'Больше нечего добавить',
    remove_chip: 'Убрать {name}',
    no_pause: 'Нет',
    save: 'Сохранить',
    saving: 'Сохранение…',
    saved: 'Сохранено',
    pc_none: 'Перезапусков через розетку пока нет: добавьте ниже устройство и розетку, которая его питает.',
    add: 'Добавить',
    adding: 'Добавление…',
    added: 'Перезапуск через розетку добавлен',
    pick_device: 'Поиск устройства: имя, пространство, интеграция…',
    pick_switch: 'Поиск розетки: имя, пространство, устройство…',
    change: 'Изменить',
    no_match: 'Ничего не найдено',
    pick_more: 'ещё {n}: уточните поиск',
    no_area: 'Без пространства',
    same_area: '{area} · то же пространство, что и устройство',
    pc_line: 'недоступно {delay} мин · выключена {off} с',
    pc_count: 'перезапуски: {n}/{max}',
    pc_gave_up: 'Отказ',
    pc_unavailable: 'Недоступно',
    pc_available: 'Доступно',
    plug_off: 'Розетка выключена: не трогается',
    plug_unavailable: 'Розетка недоступна',
    unknown_device: 'Устройство удалено',
    remove_title: 'Удалить перезапуск через розетку для {name}',
    removed: 'Перезапуск через розетку удалён',
    open_device: 'Устройство',
    open_integration: 'Устройства и службы',
    u_min: 'мин',
    u_s: 'с',
    err_not_found: 'Интеграция не настроена',
    err_invalid_pause_entity: 'Не input_boolean, switch, binary_sensor или schedule',
    err_unknown_device: 'Неизвестное устройство',
    err_generic: 'Что-то пошло не так',
    st_loaded: 'Работает',
    st_setup_retry: 'Повторная попытка',
    st_setup_error: 'Ошибка настройки',
    st_not_loaded: 'Остановлена',
    st_other: 'Недоступна',
    w_all_ok: 'Всё доступно',
    w_unavailable_one: 'Недоступно: {n}',
    w_unavailable_many: 'Недоступно: {n}',
    w_gave_up_one: 'Прекращено: {n}',
    w_gave_up_many: 'Прекращено: {n}',
    w_checking: 'Проверка…',
    w_never_checked: 'Ещё не проверялось',
    w_checked: 'Проверено {d}',
    w_check_now: 'Проверить сейчас',
    w_check_failed: 'Ошибка проверки: {error}',
    w_retry: 'Повторить',
    w_retry_failed: 'Повторная попытка не удалась: {error}',
    w_stat_unavailable: 'Недоступно',
    w_stat_reloads: 'Перезагрузки',
    w_stat_reloads_hint: 'С момента запуска Home Assistant',
    w_stat_ignored: 'Исключены',
    w_unavailable_title: 'Недоступные интеграции',
    w_history_title: 'Последние перезагрузки',
    w_no_history: 'Перезагрузок пока не было',
    w_since: 'недоступна уже {d}',
    w_attempts: 'Перезагрузки: {n}/{max}',
    w_attempt: 'перезагрузка {n}/{max}',
    w_waiting: 'Период ожидания',
    w_gave_up: 'Прекращено',
    w_reloaded: 'Перезагружена',
    w_reload_failed: 'Ошибка',
    w_gave_up_event: 'Прекращено',
    w_gave_up_after: 'перезагрузок: {n}',
    w_power_cycled: 'Перезапущено розеткой',
    w_power_cycle_failed: 'Перезапуск не удался',
    w_cycle_attempt: 'перезапуск {n}/{max}',
    w_cycle_gave_up_after: 'после {n} перезапусков',
    w_not_loaded: 'Не настроено',
  },
  uk: {
    title: 'Integration Watchdog',
    status: 'Стан',
    power_cycles: 'Перезапуски через розетку',
    settings: 'Налаштування',
    none: 'Ще не налаштовано: додайте інтеграцію до Home Assistant.',
    open_add: 'Додати інтеграцію',
    loading: 'Завантаження…',
    load_failed: 'Не вдалося завантажити: {error}. Повтор виконується автоматично.',
    retry: 'Повторити',
    pick: 'Додати…',
    no_choice: 'Більше нічого додати',
    remove_chip: 'Прибрати {name}',
    no_pause: 'Немає',
    save: 'Зберегти',
    saving: 'Збереження…',
    saved: 'Збережено',
    pc_none: 'Перезапусків через розетку ще немає: додайте нижче пристрій і розетку, що його живить.',
    add: 'Додати',
    adding: 'Додавання…',
    added: 'Перезапуск через розетку додано',
    pick_device: 'Пошук пристрою: назва, простір, інтеграція…',
    pick_switch: 'Пошук розетки: назва, простір, пристрій…',
    change: 'Змінити',
    no_match: 'Нічого не знайдено',
    pick_more: 'ще {n}: уточніть пошук',
    no_area: 'Без простору',
    same_area: '{area} · той самий простір, що й пристрій',
    pc_line: 'недоступний {delay} хв · вимкнена {off} с',
    pc_count: 'перезапуски: {n}/{max}',
    pc_gave_up: 'Відмова',
    pc_unavailable: 'Недоступний',
    pc_available: 'Доступний',
    plug_off: 'Розетка вимкнена: не чіпається',
    plug_unavailable: 'Розетка недоступна',
    unknown_device: 'Пристрій видалено',
    remove_title: 'Видалити перезапуск через розетку для {name}',
    removed: 'Перезапуск через розетку видалено',
    open_device: 'Пристрій',
    open_integration: 'Пристрої та служби',
    u_min: 'хв',
    u_s: 'с',
    err_not_found: 'Інтеграцію не налаштовано',
    err_invalid_pause_entity: 'Не input_boolean, switch, binary_sensor чи schedule',
    err_unknown_device: 'Невідомий пристрій',
    err_generic: 'Щось пішло не так',
    st_loaded: 'Працює',
    st_setup_retry: 'Повторна спроба',
    st_setup_error: 'Помилка налаштування',
    st_not_loaded: 'Зупинена',
    st_other: 'Недоступна',
    w_all_ok: 'Усе доступне',
    w_unavailable_one: 'Недоступно: {n}',
    w_unavailable_many: 'Недоступно: {n}',
    w_gave_up_one: 'Припинено: {n}',
    w_gave_up_many: 'Припинено: {n}',
    w_checking: 'Перевірка…',
    w_never_checked: 'Ще не перевірялося',
    w_checked: 'Перевірено {d}',
    w_check_now: 'Перевірити зараз',
    w_check_failed: 'Помилка перевірки: {error}',
    w_retry: 'Повторити',
    w_retry_failed: 'Повторна спроба не вдалася: {error}',
    w_stat_unavailable: 'Недоступно',
    w_stat_reloads: 'Перезавантаження',
    w_stat_reloads_hint: 'Від запуску Home Assistant',
    w_stat_ignored: 'Ігнорується',
    w_unavailable_title: 'Недоступні інтеграції',
    w_history_title: 'Історія перезавантажень',
    w_no_history: 'Перезавантажень ще не було',
    w_since: 'недоступна вже {d}',
    w_attempts: 'Перезавантаження: {n}/{max}',
    w_attempt: 'перезавантаження {n}/{max}',
    w_waiting: 'Очікування',
    w_gave_up: 'Припинено',
    w_reloaded: 'Перезавантажено',
    w_reload_failed: 'Помилка',
    w_gave_up_event: 'Припинено',
    w_gave_up_after: 'перезавантажень: {n}',
    w_power_cycled: 'Перезапущено розеткою',
    w_power_cycle_failed: 'Перезапуск не вдався',
    w_cycle_attempt: 'перезапуск {n}/{max}',
    w_cycle_gave_up_after: 'після {n} перезапусків',
    w_not_loaded: 'Не налаштовано',
  },
  hu: {
    title: 'Integration Watchdog',
    status: 'Állapot',
    power_cycles: 'Konnektoros újraindítások',
    settings: 'Beállítások',
    none: 'Még nincs beállítva: adja hozzá az integrációt a Home Assistanthoz.',
    open_add: 'Integráció hozzáadása',
    loading: 'Betöltés…',
    load_failed: 'A betöltés nem sikerült: {error}. Automatikus újrapróbálás.',
    retry: 'Újra',
    pick: 'Hozzáadás…',
    no_choice: 'Nincs több hozzáadnivaló',
    remove_chip: '{name} eltávolítása',
    no_pause: 'Nincs',
    save: 'Mentés',
    saving: 'Mentés…',
    saved: 'Mentve',
    pc_none: 'Még nincs konnektoros újraindítás: lent adjon hozzá egy eszközt és az azt tápláló konnektort.',
    add: 'Hozzáadás',
    adding: 'Hozzáadás…',
    added: 'Konnektoros újraindítás hozzáadva',
    pick_device: 'Eszköz keresése: név, terület, integráció…',
    pick_switch: 'Konnektor keresése: név, terület, eszköz…',
    change: 'Módosítás',
    no_match: 'Nincs találat',
    pick_more: 'még {n}: gépeljen a szűkítéshez',
    no_area: 'Nincs terület',
    same_area: '{area} · ugyanaz a terület, mint az eszközé',
    pc_line: 'elérhetetlen {delay} perc · kikapcsolva {off} mp',
    pc_count: 'újraindítások: {n}/{max}',
    pc_gave_up: 'Feladva',
    pc_unavailable: 'Elérhetetlen',
    pc_available: 'Elérhető',
    plug_off: 'Konnektor kikapcsolva: érintetlen',
    plug_unavailable: 'Konnektor elérhetetlen',
    unknown_device: 'Eszköz eltávolítva',
    remove_title: '{name} konnektoros újraindításának eltávolítása',
    removed: 'Konnektoros újraindítás eltávolítva',
    open_device: 'Eszköz',
    open_integration: 'Eszközök és szolgáltatások',
    u_min: 'perc',
    u_s: 'mp',
    err_not_found: 'Az integráció nincs beállítva',
    err_invalid_pause_entity: 'Nem input_boolean, switch, binary_sensor vagy schedule',
    err_unknown_device: 'Ismeretlen eszköz',
    err_generic: 'Valami hiba történt',
    st_loaded: 'Fut',
    st_setup_retry: 'Újrapróbálás',
    st_setup_error: 'A beállítás sikertelen',
    st_not_loaded: 'Leállítva',
    st_other: 'Nem érhető el',
    w_all_ok: 'Minden elérhető',
    w_unavailable_one: '{n} nem elérhető',
    w_unavailable_many: '{n} nem elérhető',
    w_gave_up_one: '{n} feladva',
    w_gave_up_many: '{n} feladva',
    w_checking: 'Ellenőrzés…',
    w_never_checked: 'Még nincs ellenőrizve',
    w_checked: 'Ellenőrizve: {d}',
    w_check_now: 'Ellenőrzés most',
    w_check_failed: 'Az ellenőrzés sikertelen: {error}',
    w_retry: 'Újra',
    w_retry_failed: 'Az újrapróbálás sikertelen: {error}',
    w_stat_unavailable: 'Nem elérhető',
    w_stat_reloads: 'Újratöltések',
    w_stat_reloads_hint: 'A Home Assistant indulása óta',
    w_stat_ignored: 'Mellőzve',
    w_unavailable_title: 'Nem elérhető integrációk',
    w_history_title: 'Legutóbbi újratöltések',
    w_no_history: 'Még nem volt újratöltés',
    w_since: '{d} óta nem elérhető',
    w_attempts: '{n}/{max} újratöltés',
    w_attempt: '{n}/{max}. újratöltés',
    w_waiting: 'Türelmi idő',
    w_gave_up: 'Feladva',
    w_reloaded: 'Újratöltve',
    w_reload_failed: 'Sikertelen',
    w_gave_up_event: 'Feladva',
    w_gave_up_after: '{n} újratöltés után',
    w_power_cycled: 'Újraindítva konnektorral',
    w_power_cycle_failed: 'Sikertelen újraindítás',
    w_cycle_attempt: 'újraindítás {n}/{max}',
    w_cycle_gave_up_after: '{n} újraindítás után',
    w_not_loaded: 'Nincs beállítva',
  },
  sk: {
    title: 'Integration Watchdog',
    status: 'Stav',
    power_cycles: 'Reštarty cez zásuvku',
    settings: 'Nastavenia',
    none: 'Zatiaľ nenastavené: pridajte integráciu do Home Assistant.',
    open_add: 'Pridať integráciu',
    loading: 'Načítava sa…',
    load_failed: 'Načítanie zlyhalo: {error}. Automaticky sa skúša znova.',
    retry: 'Skúsiť znova',
    pick: 'Pridať…',
    no_choice: 'Už nie je čo pridať',
    remove_chip: 'Odstrániť {name}',
    no_pause: 'Žiadna',
    save: 'Uložiť',
    saving: 'Ukladá sa…',
    saved: 'Uložené',
    pc_none: 'Zatiaľ žiadny reštart cez zásuvku: nižšie pridajte zariadenie a zásuvku, ktorá ho napája.',
    add: 'Pridať',
    adding: 'Pridáva sa…',
    added: 'Reštart cez zásuvku pridaný',
    pick_device: 'Hľadať zariadenie: názov, oblasť, integrácia…',
    pick_switch: 'Hľadať zásuvku: názov, oblasť, zariadenie…',
    change: 'Zmeniť',
    no_match: 'Žiadne výsledky',
    pick_more: 'ďalších {n}: píšte na zúženie',
    no_area: 'Bez oblasti',
    same_area: '{area} · rovnaká oblasť ako zariadenie',
    pc_line: 'nedostupné {delay} min · vypnutá {off} s',
    pc_count: 'reštarty: {n}/{max}',
    pc_gave_up: 'Vzdané',
    pc_unavailable: 'Nedostupné',
    pc_available: 'Dostupné',
    plug_off: 'Zásuvka vypnutá: nedotknutá',
    plug_unavailable: 'Zásuvka nedostupná',
    unknown_device: 'Zariadenie odstránené',
    remove_title: 'Odstrániť reštart cez zásuvku pre {name}',
    removed: 'Reštart cez zásuvku odstránený',
    open_device: 'Zariadenie',
    open_integration: 'Zariadenia a služby',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrácia nie je nastavená',
    err_invalid_pause_entity: 'Nie je input_boolean, switch, binary_sensor ani schedule',
    err_unknown_device: 'Neznáme zariadenie',
    err_generic: 'Niečo sa pokazilo',
    st_loaded: 'Beží',
    st_setup_retry: 'Skúša sa znova',
    st_setup_error: 'Nastavenie zlyhalo',
    st_not_loaded: 'Zastavená',
    st_other: 'Nedostupná',
    w_all_ok: 'Všetko je dostupné',
    w_unavailable_one: '{n} nedostupná',
    w_unavailable_many: 'Nedostupné: {n}',
    w_gave_up_one: '{n} vzdaná',
    w_gave_up_many: 'Vzdané: {n}',
    w_checking: 'Kontroluje sa…',
    w_never_checked: 'Zatiaľ neskontrolované',
    w_checked: 'Skontrolované {d}',
    w_check_now: 'Skontrolovať teraz',
    w_check_failed: 'Kontrola zlyhala: {error}',
    w_retry: 'Skúsiť znova',
    w_retry_failed: 'Nový pokus zlyhal: {error}',
    w_stat_unavailable: 'Nedostupné',
    w_stat_reloads: 'Opätovné načítania',
    w_stat_reloads_hint: 'Od spustenia Home Assistant',
    w_stat_ignored: 'Ignorované',
    w_unavailable_title: 'Nedostupné integrácie',
    w_history_title: 'Posledné opätovné načítania',
    w_no_history: 'Zatiaľ žiadne opätovné načítanie',
    w_since: 'nedostupná už {d}',
    w_attempts: 'Opätovné načítania: {n}/{max}',
    w_attempt: 'opätovné načítanie {n}/{max}',
    w_waiting: 'Ochranná lehota',
    w_gave_up: 'Vzdaná',
    w_reloaded: 'Znovu načítaná',
    w_reload_failed: 'Zlyhalo',
    w_gave_up_event: 'Vzdaná',
    w_gave_up_after: 'opätovné načítania: {n}',
    w_power_cycled: 'Reštartované cez zásuvku',
    w_power_cycle_failed: 'Reštart zlyhal',
    w_cycle_attempt: 'reštart {n}/{max}',
    w_cycle_gave_up_after: 'reštarty: {n}',
    w_not_loaded: 'Nie je nastavené',
  },
  cs: {
    title: 'Integration Watchdog',
    status: 'Stav',
    power_cycles: 'Restarty přes zásuvku',
    settings: 'Nastavení',
    none: 'Zatím nenastaveno: přidejte integraci do Home Assistant.',
    open_add: 'Přidat integraci',
    loading: 'Načítání…',
    load_failed: 'Načtení se nezdařilo: {error}. Automaticky se zkouší znovu.',
    retry: 'Zkusit znovu',
    pick: 'Přidat…',
    no_choice: 'Už není co přidat',
    remove_chip: 'Odebrat {name}',
    no_pause: 'Žádná',
    save: 'Uložit',
    saving: 'Ukládání…',
    saved: 'Uloženo',
    pc_none: 'Zatím žádný restart přes zásuvku: níže přidejte zařízení a zásuvku, která ho napájí.',
    add: 'Přidat',
    adding: 'Přidávání…',
    added: 'Restart přes zásuvku přidán',
    pick_device: 'Hledat zařízení: název, oblast, integrace…',
    pick_switch: 'Hledat zásuvku: název, oblast, zařízení…',
    change: 'Změnit',
    no_match: 'Žádné výsledky',
    pick_more: 'dalších {n}: pište pro zúžení',
    no_area: 'Bez oblasti',
    same_area: '{area} · stejná oblast jako zařízení',
    pc_line: 'nedostupné {delay} min · vypnutá {off} s',
    pc_count: 'restarty: {n}/{max}',
    pc_gave_up: 'Vzdáno',
    pc_unavailable: 'Nedostupné',
    pc_available: 'Dostupné',
    plug_off: 'Zásuvka vypnutá: nedotčená',
    plug_unavailable: 'Zásuvka nedostupná',
    unknown_device: 'Zařízení odebráno',
    remove_title: 'Odebrat restart přes zásuvku pro {name}',
    removed: 'Restart přes zásuvku odebrán',
    open_device: 'Zařízení',
    open_integration: 'Zařízení a služby',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrace není nastavena',
    err_invalid_pause_entity: 'Není input_boolean, switch, binary_sensor ani schedule',
    err_unknown_device: 'Neznámé zařízení',
    err_generic: 'Něco se pokazilo',
    st_loaded: 'Běží',
    st_setup_retry: 'Zkouší se znovu',
    st_setup_error: 'Nastavení selhalo',
    st_not_loaded: 'Zastavena',
    st_other: 'Nedostupná',
    w_all_ok: 'Vše je dostupné',
    w_unavailable_one: '{n} nedostupná',
    w_unavailable_many: 'Nedostupné: {n}',
    w_gave_up_one: '{n} vzdaná',
    w_gave_up_many: 'Vzdané: {n}',
    w_checking: 'Probíhá kontrola…',
    w_never_checked: 'Zatím nezkontrolováno',
    w_checked: 'Zkontrolováno {d}',
    w_check_now: 'Zkontrolovat nyní',
    w_check_failed: 'Kontrola selhala: {error}',
    w_retry: 'Zkusit znovu',
    w_retry_failed: 'Nový pokus selhal: {error}',
    w_stat_unavailable: 'Nedostupné',
    w_stat_reloads: 'Opětovná načtení',
    w_stat_reloads_hint: 'Od spuštění Home Assistant',
    w_stat_ignored: 'Ignorované',
    w_unavailable_title: 'Nedostupné integrace',
    w_history_title: 'Nedávná opětovná načtení',
    w_no_history: 'Zatím žádné opětovné načtení',
    w_since: 'nedostupná už {d}',
    w_attempts: 'Opětovná načtení: {n}/{max}',
    w_attempt: 'opětovné načtení {n}/{max}',
    w_waiting: 'Ochranná lhůta',
    w_gave_up: 'Vzdaná',
    w_reloaded: 'Znovu načtena',
    w_reload_failed: 'Selhalo',
    w_gave_up_event: 'Vzdaná',
    w_gave_up_after: 'opětovná načtení: {n}',
    w_power_cycled: 'Restartováno přes zásuvku',
    w_power_cycle_failed: 'Restart selhal',
    w_cycle_attempt: 'restart {n}/{max}',
    w_cycle_gave_up_after: 'restarty: {n}',
    w_not_loaded: 'Nenastaveno',
  },
  sl: {
    title: 'Integration Watchdog',
    status: 'Stanje',
    power_cycles: 'Ponovni zagoni prek vtičnice',
    settings: 'Nastavitve',
    none: 'Še ni nastavljeno: dodajte integracijo v Home Assistant.',
    open_add: 'Dodaj integracijo',
    loading: 'Nalaganje…',
    load_failed: 'Nalaganje ni uspelo: {error}. Samodejno se poskuša znova.',
    retry: 'Poskusi znova',
    pick: 'Dodaj…',
    no_choice: 'Ničesar več za dodati',
    remove_chip: 'Odstrani {name}',
    no_pause: 'Brez',
    save: 'Shrani',
    saving: 'Shranjevanje…',
    saved: 'Shranjeno',
    pc_none: 'Še ni ponovnih zagonov prek vtičnice: spodaj dodajte napravo in vtičnico, ki jo napaja.',
    add: 'Dodaj',
    adding: 'Dodajanje…',
    added: 'Ponovni zagon prek vtičnice dodan',
    pick_device: 'Iskanje naprave: ime, območje, integracija…',
    pick_switch: 'Iskanje vtičnice: ime, območje, naprava…',
    change: 'Spremeni',
    no_match: 'Ni zadetkov',
    pick_more: 'še {n}: tipkajte za zožitev',
    no_area: 'Brez območja',
    same_area: '{area} · isto območje kot naprava',
    pc_line: 'nedosegljiva {delay} min · izklopljena {off} s',
    pc_count: 'ponovni zagoni: {n}/{max}',
    pc_gave_up: 'Opuščeno',
    pc_unavailable: 'Nedosegljiva',
    pc_available: 'Dosegljiva',
    plug_off: 'Vtičnica izklopljena: nedotaknjena',
    plug_unavailable: 'Vtičnica nedosegljiva',
    unknown_device: 'Naprava odstranjena',
    remove_title: 'Odstrani ponovni zagon prek vtičnice za {name}',
    removed: 'Ponovni zagon prek vtičnice odstranjen',
    open_device: 'Naprava',
    open_integration: 'Naprave in storitve',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integracija ni nastavljena',
    err_invalid_pause_entity: 'Ni input_boolean, switch, binary_sensor ali schedule',
    err_unknown_device: 'Neznana naprava',
    err_generic: 'Nekaj je šlo narobe',
    st_loaded: 'Teče',
    st_setup_retry: 'Ponovni poskus',
    st_setup_error: 'Nastavitev ni uspela',
    st_not_loaded: 'Ustavljena',
    st_other: 'Nedosegljiva',
    w_all_ok: 'Vse je na voljo',
    w_unavailable_one: 'Ni na voljo: {n}',
    w_unavailable_many: 'Ni na voljo: {n}',
    w_gave_up_one: 'Opuščene: {n}',
    w_gave_up_many: 'Opuščene: {n}',
    w_checking: 'Preverjanje…',
    w_never_checked: 'Še ni preverjeno',
    w_checked: 'Preverjeno {d}',
    w_check_now: 'Preveri zdaj',
    w_check_failed: 'Preverjanje ni uspelo: {error}',
    w_retry: 'Poskusi znova',
    w_retry_failed: 'Ponoven poskus ni uspel: {error}',
    w_stat_unavailable: 'Ni na voljo',
    w_stat_reloads: 'Ponovna nalaganja',
    w_stat_reloads_hint: 'Od zagona Home Assistanta',
    w_stat_ignored: 'Prezrte',
    w_unavailable_title: 'Integracije, ki niso na voljo',
    w_history_title: 'Nedavna ponovna nalaganja',
    w_no_history: 'Še ni ponovnih nalaganj',
    w_since: 'ni na voljo že {d}',
    w_attempts: 'Ponovna nalaganja: {n}/{max}',
    w_attempt: 'ponovno nalaganje {n}/{max}',
    w_waiting: 'Čakalna doba',
    w_gave_up: 'Opuščena',
    w_reloaded: 'Ponovno naložena',
    w_reload_failed: 'Neuspešno',
    w_gave_up_event: 'Opuščena',
    w_gave_up_after: 'ponovna nalaganja: {n}',
    w_power_cycled: 'Ponovno zagnano prek vtičnice',
    w_power_cycle_failed: 'Ponovni zagon ni uspel',
    w_cycle_attempt: 'ponovni zagon {n}/{max}',
    w_cycle_gave_up_after: 'ponovni zagoni: {n}',
    w_not_loaded: 'Ni nastavljeno',
  },
  lv: {
    title: 'Integration Watchdog',
    status: 'Stāvoklis',
    power_cycles: 'Restartēšanas ar kontaktligzdu',
    settings: 'Iestatījumi',
    none: 'Vēl nav iestatīts: pievienojiet integrāciju Home Assistant.',
    open_add: 'Pievienot integrāciju',
    loading: 'Ielādē…',
    load_failed: 'Neizdevās ielādēt: {error}. Automātiski mēģina vēlreiz.',
    retry: 'Mēģināt vēlreiz',
    pick: 'Pievienot…',
    no_choice: 'Nav vairs ko pievienot',
    remove_chip: 'Noņemt {name}',
    no_pause: 'Nav',
    save: 'Saglabāt',
    saving: 'Saglabā…',
    saved: 'Saglabāts',
    pc_none: 'Vēl nav restartēšanu ar kontaktligzdu: zemāk pievienojiet ierīci un kontaktligzdu, kas to baro.',
    add: 'Pievienot',
    adding: 'Pievieno…',
    added: 'Restartēšana ar kontaktligzdu pievienota',
    pick_device: 'Meklēt ierīci: nosaukums, zona, integrācija…',
    pick_switch: 'Meklēt kontaktligzdu: nosaukums, zona, ierīce…',
    change: 'Mainīt',
    no_match: 'Nav rezultātu',
    pick_more: 'vēl {n}: rakstiet, lai sašaurinātu',
    no_area: 'Bez zonas',
    same_area: '{area} · tā pati zona kā ierīcei',
    pc_line: 'nepieejama {delay} min · izslēgta {off} s',
    pc_count: 'restartēšanas: {n}/{max}',
    pc_gave_up: 'Atmests',
    pc_unavailable: 'Nepieejama',
    pc_available: 'Pieejama',
    plug_off: 'Kontaktligzda izslēgta: netiek aiztikta',
    plug_unavailable: 'Kontaktligzda nepieejama',
    unknown_device: 'Ierīce noņemta',
    remove_title: 'Noņemt restartēšanu ar kontaktligzdu ierīcei {name}',
    removed: 'Restartēšana ar kontaktligzdu noņemta',
    open_device: 'Ierīce',
    open_integration: 'Ierīces un pakalpojumi',
    u_min: 'min',
    u_s: 's',
    err_not_found: 'Integrācija nav iestatīta',
    err_invalid_pause_entity: 'Nav input_boolean, switch, binary_sensor vai schedule',
    err_unknown_device: 'Nezināma ierīce',
    err_generic: 'Kaut kas nogāja greizi',
    st_loaded: 'Darbojas',
    st_setup_retry: 'Mēģina vēlreiz',
    st_setup_error: 'Iestatīšana neizdevās',
    st_not_loaded: 'Apturēta',
    st_other: 'Nav pieejama',
    w_all_ok: 'Viss ir pieejams',
    w_unavailable_one: 'Nav pieejamas: {n}',
    w_unavailable_many: 'Nav pieejamas: {n}',
    w_gave_up_one: 'Atmestas: {n}',
    w_gave_up_many: 'Atmestas: {n}',
    w_checking: 'Notiek pārbaude…',
    w_never_checked: 'Vēl nav pārbaudīts',
    w_checked: 'Pārbaudīts {d}',
    w_check_now: 'Pārbaudīt tagad',
    w_check_failed: 'Pārbaude neizdevās: {error}',
    w_retry: 'Mēģināt vēlreiz',
    w_retry_failed: 'Atkārtotais mēģinājums neizdevās: {error}',
    w_stat_unavailable: 'Nav pieejamas',
    w_stat_reloads: 'Pārlādes',
    w_stat_reloads_hint: 'Kopš Home Assistant palaišanas',
    w_stat_ignored: 'Ignorētas',
    w_unavailable_title: 'Nepieejamās integrācijas',
    w_history_title: 'Nesenās pārlādes',
    w_no_history: 'Vēl nav pārlāžu',
    w_since: 'nav pieejama jau {d}',
    w_attempts: 'Pārlādes: {n}/{max}',
    w_attempt: 'pārlāde {n}/{max}',
    w_waiting: 'Nogaidīšanas laiks',
    w_gave_up: 'Atmesta',
    w_reloaded: 'Pārlādēta',
    w_reload_failed: 'Neizdevās',
    w_gave_up_event: 'Atmesta',
    w_gave_up_after: 'pārlādes: {n}',
    w_power_cycled: 'Restartēta ar kontaktligzdu',
    w_power_cycle_failed: 'Restartēšana neizdevās',
    w_cycle_attempt: 'restartēšana {n}/{max}',
    w_cycle_gave_up_after: 'restartēšanas: {n}',
    w_not_loaded: 'Nav iestatīts',
  },
  el: {
    title: 'Integration Watchdog',
    status: 'Κατάσταση',
    power_cycles: 'Επανεκκινήσεις μέσω πρίζας',
    settings: 'Ρυθμίσεις',
    none: 'Δεν έχει ρυθμιστεί ακόμη: προσθέστε την ενσωμάτωση στο Home Assistant.',
    open_add: 'Προσθήκη της ενσωμάτωσης',
    loading: 'Φόρτωση…',
    load_failed: 'Αποτυχία φόρτωσης: {error}. Νέα αυτόματη προσπάθεια.',
    retry: 'Δοκιμή ξανά',
    pick: 'Προσθήκη…',
    no_choice: 'Δεν υπάρχει τίποτα άλλο να προστεθεί',
    remove_chip: 'Αφαίρεση {name}',
    no_pause: 'Καμία',
    save: 'Αποθήκευση',
    saving: 'Αποθήκευση…',
    saved: 'Αποθηκεύτηκε',
    pc_none: 'Δεν υπάρχουν ακόμη επανεκκινήσεις μέσω πρίζας: προσθέστε παρακάτω μια συσκευή και την πρίζα που την τροφοδοτεί.',
    add: 'Προσθήκη',
    adding: 'Προσθήκη…',
    added: 'Η επανεκκίνηση μέσω πρίζας προστέθηκε',
    pick_device: 'Αναζήτηση συσκευής: όνομα, περιοχή, ενσωμάτωση…',
    pick_switch: 'Αναζήτηση πρίζας: όνομα, περιοχή, συσκευή…',
    change: 'Αλλαγή',
    no_match: 'Κανένα αποτέλεσμα',
    pick_more: 'ακόμη {n}: πληκτρολογήστε για περιορισμό',
    no_area: 'Χωρίς περιοχή',
    same_area: '{area} · ίδια περιοχή με τη συσκευή',
    pc_line: 'μη διαθέσιμη {delay} λεπ. · κλειστή {off} δ',
    pc_count: 'επανεκκινήσεις: {n}/{max}',
    pc_gave_up: 'Εγκαταλείφθηκε',
    pc_unavailable: 'Μη διαθέσιμη',
    pc_available: 'Διαθέσιμη',
    plug_off: 'Πρίζα κλειστή: δεν αγγίζεται',
    plug_unavailable: 'Πρίζα μη διαθέσιμη',
    unknown_device: 'Η συσκευή αφαιρέθηκε',
    remove_title: 'Αφαίρεση επανεκκίνησης μέσω πρίζας για {name}',
    removed: 'Η επανεκκίνηση μέσω πρίζας αφαιρέθηκε',
    open_device: 'Συσκευή',
    open_integration: 'Συσκευές και υπηρεσίες',
    u_min: 'λεπ.',
    u_s: 'δ',
    err_not_found: 'Η ενσωμάτωση δεν έχει ρυθμιστεί',
    err_invalid_pause_entity: 'Δεν είναι input_boolean, switch, binary_sensor ή schedule',
    err_unknown_device: 'Άγνωστη συσκευή',
    err_generic: 'Κάτι πήγε στραβά',
    st_loaded: 'Σε λειτουργία',
    st_setup_retry: 'Νέα προσπάθεια',
    st_setup_error: 'Η ρύθμιση απέτυχε',
    st_not_loaded: 'Σταματημένη',
    st_other: 'Μη διαθέσιμη',
    w_all_ok: 'Όλα διαθέσιμα',
    w_unavailable_one: '{n} μη διαθέσιμη',
    w_unavailable_many: '{n} μη διαθέσιμες',
    w_gave_up_one: '{n} διακόπηκε',
    w_gave_up_many: '{n} διακόπηκαν',
    w_checking: 'Έλεγχος…',
    w_never_checked: 'Δεν έχει ελεγχθεί ακόμα',
    w_checked: 'Ελέγχθηκε {d}',
    w_check_now: 'Έλεγχος τώρα',
    w_check_failed: 'Ο έλεγχος απέτυχε: {error}',
    w_retry: 'Δοκιμή ξανά',
    w_retry_failed: 'Η νέα προσπάθεια απέτυχε: {error}',
    w_stat_unavailable: 'Μη διαθέσιμες',
    w_stat_reloads: 'Επαναφορτώσεις',
    w_stat_reloads_hint: 'Από την εκκίνηση του Home Assistant',
    w_stat_ignored: 'Αγνοούνται',
    w_unavailable_title: 'Μη διαθέσιμες ενσωματώσεις',
    w_history_title: 'Πρόσφατες επαναφορτώσεις',
    w_no_history: 'Καμία επαναφόρτωση ακόμα',
    w_since: 'μη διαθέσιμη εδώ και {d}',
    w_attempts: '{n}/{max} επαναφορτώσεις',
    w_attempt: 'επαναφόρτωση {n}/{max}',
    w_waiting: 'Περίοδος χάριτος',
    w_gave_up: 'Διακόπηκε',
    w_reloaded: 'Επαναφορτώθηκε',
    w_reload_failed: 'Απέτυχε',
    w_gave_up_event: 'Εγκατάλειψη',
    w_gave_up_after: 'μετά από {n} επαναφορτώσεις',
    w_power_cycled: 'Επανεκκίνηση μέσω πρίζας',
    w_power_cycle_failed: 'Η επανεκκίνηση απέτυχε',
    w_cycle_attempt: 'επανεκκίνηση {n}/{max}',
    w_cycle_gave_up_after: 'μετά από {n} επανεκκινήσεις',
    w_not_loaded: 'Δεν έχει ρυθμιστεί',
  },
};

// Option limits, filled in from the settings command (the Python constants are the reference)
var IW_PANEL_LIMITS = { scan_interval: [1, 1440], grace_period: [1, 1440], max_reloads: [1, 10], delay: [1, 1440], off_time: [1, 300] };
var IW_PANEL_NUMBERS = ['scan_interval', 'grace_period', 'max_reloads'];
var IW_PANEL_LISTS = ['ignored_integrations', 'ignored_entries', 'notify_services'];
var IW_PANEL_TABS = ['status', 'power_cycles', 'settings'];
// Reloads and power cycles listed at most in the Status tab, the latest first
var IW_PANEL_HISTORY = 50;

// The watchdog's entities, by what they are: its translation key, else the end of its entity id
var IW_PANEL_ROLES = {
  unavailable: '_unavailable_integrations',
  last_reload: '_last_reload',
  last_check: '_last_check',
  check: '_check_now',
};

// The watchdog's sensors and button: those of the device whose "Unavailable integrations" sensor lists the integrations
function iwPanelEntities(hass) {
  var byDevice = {};
  Object.entries(hass?.entities || {}).forEach(([id, entry]) => {
    if (entry?.platform !== 'integration_watchdog') return;
    var role = Object.keys(IW_PANEL_ROLES).find((r) => entry.translation_key === r || id.endsWith(IW_PANEL_ROLES[r]));
    if (role) (byDevice[entry.device_id || ''] ||= {})[role] = id;
  });
  return Object.values(byDevice).find((ids) => Array.isArray(hass?.states?.[ids.unavailable]?.attributes?.integrations)) || null;
}

// Tone and label key of a history item: a reload or a power cycle, done, failed or given up
function iwPanelEvent(kind) {
  var tone = { reloaded: 'good', power_cycled: 'good', reload_failed: 'warn', power_cycle_failed: 'warn' }[kind] || 'bad';
  var label = String(kind).endsWith('gave_up') ? 'w_gave_up_event' : `w_${kind}`;
  return { tone, label, cycle: String(kind).startsWith('power_cycle') };
}

function iwPanelT(lang, key, vars) {
  var table = IntegrationWatchdogPanelI18n[lang] || IntegrationWatchdogPanelI18n.en;
  var text = table[key] || IntegrationWatchdogPanelI18n.en[key] || key;
  Object.entries(vars || {}).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v);
  });
  return text;
}

function iwPanelEsc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

// Tone of the config entry state, for its pill
// Lower case without accents, so "salon" finds "Salón" and "é" finds "e"
function iwPanelFold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// The options matching every word of the search (name, area, detail or id)
function iwPanelMatch(options, query) {
  var words = iwPanelFold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return options;
  return options.filter((o) => {
    var text = iwPanelFold([o.label, o.area, o.detail, o.value].join(' '));
    return words.every((w) => text.includes(w));
  });
}

// Options grouped by area (areas in alphabetical order, those without one last); `first` (an area) leads.
// Within a group, outlets come before the other switches.
function iwPanelGroups(options, first) {
  var groups = new Map();
  for (const o of options) {
    var area = o.area || '';
    if (!groups.has(area)) groups.set(area, []);
    groups.get(area).push(o);
  }
  var rank = (area) => (area === first && first ? 0 : area ? 1 : 2);
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([area, items]) => [area, items.sort((x, y) => Number(!!y.outlet) - Number(!!x.outlet))]);
}

function iwPanelTone(state) {
  if (state === 'loaded') return 'good';
  if (state === 'setup_retry' || state === 'not_loaded') return 'warn';
  return 'bad';
}

function iwPanelSameList(a, b) {
  return JSON.stringify([...(a || [])].sort()) === JSON.stringify([...(b || [])].sort());
}

// "zha: 30" lines compared without blank lines, spaces or order
function iwPanelOverrides(text) {
  return String(text || '')
    .split(/[\n,]/)
    .map((l) => l.replace(/\s+/g, '').toLowerCase())
    .filter(Boolean)
    .sort()
    .join('\n');
}

class IntegrationWatchdogPanel extends HTMLElement {
  // The release checks it matches the other versions; the panel no longer loads the card with it
  static VERSION = INTEGRATION_WATCHDOG_PANEL_VERSION;

  static STYLE = `
    :host { display:block; min-height:100%; background:var(--primary-background-color); color:var(--primary-text-color);
            --tone-good: var(--success-color, #43a047); --tone-warn: var(--warning-color, #ffa600); --tone-bad: var(--error-color, #db4437); }
    .toolbar { height:var(--header-height, 56px); display:flex; align-items:center; gap:8px; padding:0 12px; box-sizing:border-box;
               background:var(--app-header-background-color, var(--primary-color)); color:var(--app-header-text-color, #fff);
               border-bottom:var(--app-header-border-bottom, none); font-size:20px; position:sticky; top:0; z-index:2; }
    .toolbar .grow { flex:1; }
    .toolbar a { color:inherit; display:flex; padding:8px; border-radius:50%; --mdc-icon-size:22px; }
    .toolbar a:hover { background:rgba(255,255,255,.12); }
    /* Tabs under the toolbar, as in Smart Comfort: text, the active one underlined, sticky with the toolbar */
    .tabs { display:flex; gap:4px; padding:0 12px; overflow-x:auto; background:var(--app-header-background-color, var(--primary-color));
            position:sticky; top:var(--header-height, 56px); z-index:2; }
    .tab { background:none; border:none; border-bottom:2px solid transparent; color:var(--app-header-text-color, #fff); opacity:.75;
           padding:12px 14px; font:inherit; font-size:14px; cursor:pointer; white-space:nowrap; }
    .tab:hover, .tab:focus-visible { opacity:1; outline:none; }
    .tab.active { opacity:1; border-bottom-color:var(--app-header-text-color, #fff); }
    main { max-width:1040px; margin:0 auto; padding:16px; box-sizing:border-box; }
    section[hidden] { display:none; }
    .column { display:flex; flex-direction:column; gap:12px; min-width:0; }
    .note { padding:16px; color:var(--secondary-text-color); display:flex; flex-direction:column; gap:10px; align-items:flex-start; }
    .note.error { color:var(--primary-text-color); border-left:3px solid var(--error-color, #db4437); }
    .block { padding:14px 16px; display:flex; flex-direction:column; gap:12px; }
    .head { display:flex; align-items:center; gap:12px; }
    .avatar { width:40px; height:40px; flex:none; border-radius:50%; display:grid; place-items:center; --mdc-icon-size:22px;
              color:var(--primary-color); background:color-mix(in srgb, var(--primary-color) 15%, transparent); }
    .who { flex:1; min-width:0; }
    .who .n { font-size:16px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .who .s { font-size:12px; color:var(--secondary-text-color); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .pill { flex:none; font-size:11px; font-weight:500; padding:2px 10px; border-radius:12px; color:var(--tone-text); background:color-mix(in srgb, var(--tone) 15%, transparent); }
    .good { --tone:var(--tone-good); } .warn { --tone:var(--tone-warn); } .bad { --tone:var(--tone-bad); }
    /* Text in a state colour: half-way to the text colour, so it stays readable (4.5:1) in light and dark themes */
    .good, .warn, .bad { --tone-text: color-mix(in srgb, var(--tone) 50%, var(--primary-text-color)); }
    .intro { font-size:13px; color:var(--secondary-text-color); margin:0; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:10px 14px; }
    .wide { grid-column:1 / -1; }
    .ctl { display:flex; flex-direction:column; gap:4px; min-width:0; }
    .ctl > span { font-size:12px; color:var(--secondary-text-color); }
    .ctl small { font-size:11px; color:var(--secondary-text-color); opacity:.85; }
    .box { display:flex; align-items:center; border-radius:8px; border:1px solid var(--divider-color, rgba(127,127,127,.3));
           background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .box:focus-within { border-color:var(--primary-color); }
    .box.bad-value { border-color:var(--tone-bad); }
    .box input, .box select, .box textarea { flex:1; min-width:0; border:0; outline:0; background:none; color:inherit; font:inherit; font-size:14px; padding:8px 10px; }
    .box textarea { resize:vertical; min-height:60px; font-family:var(--code-font-family, monospace); font-size:13px; }
    .box select option { color:initial; }
    .box em { font-style:normal; font-size:12px; color:var(--secondary-text-color); padding-right:10px; }
    .chips { display:flex; flex-wrap:wrap; gap:6px; }
    .chip { display:inline-flex; align-items:center; gap:4px; max-width:100%; font-size:13px; padding:3px 4px 3px 10px; border-radius:14px;
            background:color-mix(in srgb, var(--primary-color) 12%, transparent); }
    .chip > span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .chip small { font-size:11px; color:var(--secondary-text-color); white-space:nowrap; }
    .chip button { border:0; background:none; cursor:pointer; color:var(--secondary-text-color); padding:2px; border-radius:50%; display:flex; --mdc-icon-size:16px; }
    .chip button:hover { background:color-mix(in srgb, var(--primary-color) 18%, transparent); color:var(--primary-color); }
    .bar { display:flex; align-items:center; flex-wrap:wrap; gap:8px; border-top:1px solid var(--divider-color, rgba(127,127,127,.2)); padding-top:10px; }
    .bar .links { flex:1; display:flex; gap:4px; flex-wrap:wrap; align-items:center; }
    .bar .links a { font-size:12px; color:var(--secondary-text-color); text-decoration:none; display:inline-flex; align-items:center; gap:4px;
                    padding:4px 8px; border-radius:8px; --mdc-icon-size:15px; }
    .bar .links a:hover { background:var(--secondary-background-color); color:var(--primary-text-color); }
    .msg { font-size:12px; color:var(--secondary-text-color); overflow-wrap:anywhere; }
    .msg.good, .msg.bad { color:var(--tone-text); }
    .act { display:inline-flex; align-items:center; gap:6px; border:0; cursor:pointer; font:inherit; font-size:13px; font-weight:500;
           padding:7px 12px; border-radius:8px; --mdc-icon-size:16px; color:var(--primary-color); text-decoration:none;
           background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .act:hover:not([disabled]) { background:color-mix(in srgb, var(--primary-color) 22%, transparent); }
    .act.quiet { color:var(--primary-text-color); background:var(--secondary-background-color, rgba(127,127,127,.12)); }
    .act[disabled] { opacity:.5; cursor:default; }
    /* Device and plug pickers: side by side when there is room, a search over a short scrolling list grouped by area */
    .pair { grid-column:1 / -1; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px 14px; }
    .pick .box > ha-icon { --mdc-icon-size:18px; color:var(--secondary-text-color); padding-left:10px; flex:none; }
    .pick .box.picked { min-height:52px; gap:10px; padding-right:2px; }
    .pick .who { display:flex; flex-direction:column; min-width:0; flex:1; }
    .pick .who .n { font-size:14px; font-weight:400; }
    .pick-list { max-height:min(280px, 40vh); overflow-y:auto; overscroll-behavior:contain; border-radius:8px;
                 border:1px solid var(--divider-color, rgba(127,127,127,.3)); }
    .pick-group { position:sticky; top:0; z-index:1; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:.04em;
                  color:var(--secondary-text-color); padding:6px 10px 4px; background:var(--card-background-color, var(--primary-background-color)); }
    .pick-option { display:flex; align-items:center; gap:10px; padding:6px 10px; cursor:pointer; --mdc-icon-size:18px; }
    .pick-option > ha-icon { color:var(--secondary-text-color); flex:none; }
    .pick-option:hover { background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    .pick-option.active { background:color-mix(in srgb, var(--primary-color) 14%, transparent); }
    .pick-option .n { font-size:14px; }
    .pick-empty, .pick-more { font-size:12px; color:var(--secondary-text-color); padding:10px; }
    .icon-btn { border:0; background:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; display:flex; --mdc-icon-size:20px; }
    .icon-btn:hover:not([disabled]) { background:var(--secondary-background-color); color:var(--error-color, #db4437); }
    .icon-btn[disabled] { opacity:.5; cursor:default; }
    .warn-line { font-size:12px; color:var(--tone-text); --tone:var(--tone-warn); display:flex; align-items:center; gap:6px; --mdc-icon-size:16px; }
    /* Status tab: summary tiles, the check button, then the unavailable integrations and the history side by side */
    .tiles { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:10px; }
    .tile { padding:12px 14px; display:flex; align-items:center; gap:12px; min-width:0; }
    .tile .avatar { --mdc-icon-size:20px; color:var(--tone-text, var(--primary-color)); background:color-mix(in srgb, var(--tone, var(--primary-color)) 15%, transparent); }
    .tile.lead { grid-column:span 2; }
    .tile .who .n { font-size:15px; }
    .tile .who .n b { font-size:20px; font-weight:500; margin-right:4px; font-variant-numeric:tabular-nums; }
    .tile .act { flex:none; }
    .lists { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap:12px; align-items:start; }
    .list { padding:6px 0; overflow:hidden; }
    .lhead { display:flex; align-items:center; gap:10px; padding:8px 14px 6px; --mdc-icon-size:18px; color:var(--secondary-text-color); }
    .lhead .lname { flex:1; font-size:14px; font-weight:500; color:var(--primary-text-color); }
    .lhead .lcount { font-size:12px; }
    .item { display:flex; align-items:center; gap:12px; padding:8px 14px; min-width:0; }
    a.item { color:inherit; text-decoration:none; }
    a.item:hover { background:var(--secondary-background-color, rgba(127,127,127,.08)); }
    a.item:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
    .logo { position:relative; flex:none; width:28px; height:28px; display:grid; place-items:center; --mdc-icon-size:22px; color:var(--tone-text); }
    .logo img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; background:var(--card-background-color, #fff); border-radius:6px; }
    .logo.nobrand img { display:none; }
    .item .who .n, .item .who .s { display:block; }
    .item .side { flex:none; display:flex; flex-direction:column; align-items:flex-end; gap:2px; font-size:12px; text-align:right; }
    .item .side .tag { font-weight:500; color:var(--tone-text); }
    .item .side .ago { color:var(--secondary-text-color); white-space:nowrap; }
    .item-line { display:flex; align-items:center; }
    .item-line > a.item { flex:1; }
    .item-line .icon-btn { margin-right:8px; }
    .item-line .icon-btn:hover:not([disabled]) { color:var(--primary-color); }
    .empty { padding:18px 14px; color:var(--secondary-text-color); display:flex; align-items:center; gap:10px; --mdc-icon-size:20px; }
    .empty.good ha-icon { color:var(--tone-text); }
    @media (max-width: 600px) {
      main { padding:12px 8px; }
      .tile { padding:10px 12px; gap:10px; }
      .tile .avatar { width:32px; height:32px; --mdc-icon-size:18px; }
      .tile .who .n, .tile .who .s { white-space:normal; }
    }
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._settings = null;
    // The integration's translations (options flow): form labels and hints, by language
    this._strings = {};
    // Fields the user edited: the rest of the form always shows the stored values
    this._drafts = {};
    this._cycle = {};
    // The device and plug pickers: what is typed in the search and the option highlighted (keyboard)
    this._pick = { device_id: { q: '', active: 0 }, switch: { q: '', active: 0 } };
    this._status = {};
    this._busy = null;
    this._tab = 'status';
  }

  // /integration-watchdog/<tab> opens that tab (Home Assistant sets the route; the base address is Status)
  set route(route) {
    var path = (route?.path || '').split('/').filter(Boolean)[0];
    var tab = IW_PANEL_TABS.includes(path) ? path : 'status';
    if (tab !== this._tab) this._showTab(tab);
  }

  // Shows a tab; `focus` moves the keyboard to its button (arrow keys). The address follows, so a reload or a link
  // comes back to the same tab.
  _goTab(tab, focus) {
    if (!IW_PANEL_TABS.includes(tab)) return;
    this._showTab(tab, focus);
    var base = (this._panel?.url_path || 'integration-watchdog').replace(/^\//, '');
    try {
      history.replaceState(history.state, '', `/${base}${tab === 'status' ? '' : `/${tab}`}`);
    } catch (_err) {
      // no history (a test, a sandboxed page): the tab still shows
    }
    // The power cycles show live states (device unavailable, plug off): fresh ones when the tab opens
    if (tab === 'power_cycles' && this._settings) this._load();
  }

  _showTab(tab, focus) {
    this._tab = tab;
    var root = this.shadowRoot;
    root.querySelectorAll?.('.tab').forEach((button) => {
      var selected = button.dataset.tab === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus({ preventScroll: true });
    });
    IW_PANEL_TABS.forEach((name) => {
      var panel = root.getElementById(`tab-${name}`);
      if (panel) panel.hidden = name !== tab;
    });
  }

  set hass(hass) {
    var first = !this._hass;
    var langBefore = this._lang();
    this._hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (first) this._start();
    else if (this._lang() !== langBefore) {
      this._render();
      this._loadStrings();
    }
    // Home Assistant makes a new state object only when an entity changes: the status is drawn again only then,
    // or once a minute for the "3 minutes ago"
    else if (this._statusSignature() !== this._drawnStatus) this._renderStatus();
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
  }

  set panel(panel) {
    this._panel = panel;
  }

  // Home Assistant creates the panel as soon as its file has run and sets panel, narrow, route and hass right away.
  // In the release, the element is only defined once the page's language file is in (scripts/i18n-split.mjs): the
  // values set before land as plain properties on the not-yet-defined element and hide the setters, so the panel
  // stayed empty on its first opening. They are passed through the setters now (hass last: it starts the panel).
  _upgradeProperties() {
    ['panel', 'narrow', 'route', 'hass'].forEach((name) => {
      if (!Object.hasOwn(this, name)) return;
      var value = this[name];
      delete this[name];
      this[name] = value;
    });
  }

  connectedCallback() {
    this._upgradeProperties();
    if (this._hass && !this._unsub) this._subscribe();
    this._watchConnection(true);
    // Back on the panel after a failed load: try again now.
    if (this._hass && this._failed) this._reload();
  }

  disconnectedCallback() {
    this._watchConnection(false);
    clearTimeout(this._retryTimer);
    if (this._unsub) {
      this._unsub.then((off) => off()).catch(() => {});
      this._unsub = null;
    }
  }

  // The connection back (Home Assistant restarted, the app resumed): load again, the data may have changed meanwhile.
  _watchConnection(on) {
    var connection = this._hass?.connection;
    if (!connection?.addEventListener) return;
    this._onReady = this._onReady || (() => this._reload());
    connection.removeEventListener('ready', this._onReady);
    if (on) connection.addEventListener('ready', this._onReady);
  }

  // A load that failed (Home Assistant still starting, the connection dropped) is tried again after 2 s, 5 s, 15 s,
  // then every 30 s while the panel is shown, instead of leaving it empty.
  _retry(failed) {
    clearTimeout(this._retryTimer);
    this._failed = failed;
    if (!failed) {
      this._retries = 0;
      return;
    }
    var delay = [2000, 5000, 15000, 30000][Math.min(this._retries || 0, 3)];
    this._retries = (this._retries || 0) + 1;
    this._retryTimer = setTimeout(() => {
      if (this.isConnected) this._reload();
    }, delay);
  }

  _reload() {
    this._load();
    if (!this._strings[this._hass?.language || 'en']) this._loadStrings();
  }

  // Full code when it has a table (sr-Latn), else its base (de-AT → de), else English
  _lang() {
    var code = this._hass?.language || 'en';
    if (IntegrationWatchdogPanelI18n[code]) return code;
    var base = code.split('-')[0];
    return IntegrationWatchdogPanelI18n[base] ? base : 'en';
  }

  _t(key, vars) {
    return iwPanelT(this._lang(), key, vars);
  }

  // A text of the integration's options flow (`step.settings.data.scan_interval`), or the fallback
  _s(path, fallback) {
    var table = this._strings[this._hass?.language || 'en'] || {};
    return table[`component.integration_watchdog.options.${path}`] || fallback || '';
  }

  // The status is drawn at once from the watchdog's sensors; the settings and the form labels load alongside.
  _start() {
    this._render();
    this._subscribe();
    this._watchConnection(this.isConnected);
    this._load();
    this._loadStrings();
  }

  async _loadStrings() {
    var language = this._hass?.language || 'en';
    try {
      var res = await this._hass.callWS({ type: 'frontend/get_translations', language, category: 'options', integration: ['integration_watchdog'] });
      this._strings[language] = res?.resources || {};
    } catch (err) {
      console.error('Integration Watchdog panel: could not load the translations', err);
      return;
    }
    this._renderTabs();
  }

  // Reload the settings when the entry is added, removed, reloaded (options changed elsewhere) or changes state
  _subscribe() {
    if (this._unsub || !this._hass?.connection) return;
    this._unsub = this._hass.connection
      .subscribeMessage(
        (events) => {
          if ([].concat(events || []).some((ev) => ev?.entry?.domain === 'integration_watchdog')) this._load();
        },
        { type: 'config_entries/subscribe', type_filter: ['service'] },
      )
      .catch(() => () => {});
  }

  async _load() {
    try {
      this._settings = await this._hass.callWS({ type: 'integration_watchdog/settings' });
      Object.assign(IW_PANEL_LIMITS, this._settings.limits || {});
      this._loadError = null;
      this._retry(false);
    } catch (err) {
      console.error('Integration Watchdog panel: could not load the settings', err);
      this._retry(true);
      // Never loaded: the error with a Retry button, not "not set up". Loaded before: kept.
      if (this._settings === null) this._loadError = String(err?.message || err).replace(/\.\s*$/, '');
    }
    this._renderTabs();
  }

  _render() {
    var root = this.shadowRoot;
    var esc = iwPanelEsc;
    root.innerHTML = `
      <style>${IntegrationWatchdogPanel.STYLE}</style>
      <div class="toolbar">
        <ha-menu-button></ha-menu-button>
        <span class="grow">${esc(this._t('title'))}</span>
        <a href="/config/integrations/integration/integration_watchdog" title="${esc(this._t('open_integration'))}"><ha-icon icon="mdi:cog"></ha-icon></a>
      </div>
      <div class="tabs" role="tablist">${IW_PANEL_TABS.map((tab) => this._tabHtml(tab)).join('')}</div>
      <main>
        <section class="column" id="tab-status" role="tabpanel" aria-labelledby="tabbtn-status"><div class="column" id="iw-status"></div></section>
        <section class="column" id="tab-power_cycles" role="tabpanel" aria-labelledby="tabbtn-power_cycles"></section>
        <section class="column" id="tab-settings" role="tabpanel" aria-labelledby="tabbtn-settings"></section>
      </main>`;
    this._menu = root.querySelector('ha-menu-button');
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    root.querySelectorAll('.tab').forEach((button) => {
      button.addEventListener('click', () => this._goTab(button.dataset.tab));
      // Left and right arrows move between the tabs, as in a native tab bar
      button.addEventListener('keydown', (ev) => {
        var step = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        ev.preventDefault();
        var i = IW_PANEL_TABS.indexOf(this._tab);
        this._goTab(IW_PANEL_TABS[(i + step + IW_PANEL_TABS.length) % IW_PANEL_TABS.length], true);
      });
    });
    this._showTab(this._tab);
    this._bindStatus();
    this._renderStatus();
    this._renderTabs();
  }

  _tabHtml(tab) {
    var selected = tab === this._tab;
    return `<button class="tab${selected ? ' active' : ''}" role="tab" id="tabbtn-${tab}" data-tab="${tab}" aria-selected="${selected}" aria-controls="tab-${tab}" tabindex="${selected ? 0 : -1}">${iwPanelEsc(this._t(tab))}</button>`;
  }

  // ── Status tab ─────────────────────────────────────────────────────────────
  // The watchdog's entities are looked up in the entity registry once, not at every state change of Home Assistant
  _statusIds() {
    if (!this._ids || this._idsRegistry !== this._hass?.entities || !this._hass?.states?.[this._ids.unavailable]) {
      this._idsRegistry = this._hass?.entities;
      this._ids = iwPanelEntities(this._hass);
    }
    return this._ids;
  }

  _statusSignature() {
    var ids = this._statusIds();
    var states = this._hass?.states || {};
    var minute = Math.floor(Date.now() / 60000);
    return ids ? [minute, ...Object.values(ids).map((id) => states[id]?.last_updated)].join('|') : `${minute}`;
  }

  _bindStatus() {
    var root = this.shadowRoot;
    root.getElementById?.('iw-status')?.addEventListener('click', (ev) => {
      var link = ev.target.closest?.('a.item');
      // Inside the app, a link moves to the integration's page without reloading Home Assistant
      if (link && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && ev.button === 0) {
        ev.preventDefault();
        window.history.pushState(null, '', link.getAttribute('href'));
        window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } }));
        return;
      }
      var button = ev.target.closest?.('button');
      if (button?.dataset.check !== undefined) this._checkNow();
      else if (button?.dataset.reset) this._resetEntry(button.dataset.reset, button);
    });
  }

  // "3 minutes ago", in the language of the page
  _ago(iso) {
    var minutes = Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000);
    var [value, unit] =
      minutes < 1 ? [0, 'minute'] : minutes < 60 ? [minutes, 'minute'] : minutes < 1440 ? [minutes / 60, 'hour'] : [minutes / 1440, 'day'];
    try {
      return new Intl.RelativeTimeFormat(this._hass?.language || 'en', { numeric: 'auto' }).format(-Math.floor(value), unit);
    } catch (_err) {
      return String(iso).slice(0, 16).replace('T', ' ');
    }
  }

  // "3 hours", "2 days": how long an integration has been unavailable
  _for(iso) {
    var minutes = Math.max(1, (Date.now() - new Date(iso).getTime()) / 60000);
    var [value, unit] = minutes < 60 ? [minutes, 'minute'] : minutes < 2880 ? [minutes / 60, 'hour'] : [minutes / 1440, 'day'];
    try {
      return new Intl.NumberFormat(this._hass?.language || 'en', { style: 'unit', unit, unitDisplay: 'long' }).format(Math.floor(value));
    } catch (_err) {
      return `${Math.floor(value)} ${unit}`;
    }
  }

  _when(iso) {
    try {
      return new Date(iso).toLocaleString(this._hass?.language || 'en', { dateStyle: 'medium', timeStyle: 'short' });
    } catch (_err) {
      return String(iso);
    }
  }

  _count(n, one, many) {
    return this._t(n === 1 ? one : many, { n });
  }

  // The integration's logo (Home Assistant brands), the icon behind it when there is none
  _logo(domain, icon) {
    var esc = iwPanelEsc;
    var dark = this._hass?.themes?.darkMode ? 'dark_' : '';
    var src = `https://brands.home-assistant.io/_/${encodeURIComponent(domain || '')}/${dark}icon.png`;
    return `<span class="logo"><ha-icon icon="${icon}"></ha-icon><img src="${esc(src)}" alt="" loading="lazy" referrerpolicy="no-referrer"></span>`;
  }

  // Settings → the integration's page, on its entry: an ordinary link, the frontend follows it without reloading
  _href(domain, entry) {
    if (!domain) return '';
    return `/config/integrations/integration/${encodeURIComponent(domain)}${entry ? `#config_entry=${encodeURIComponent(entry)}` : ''}`;
  }

  _unavailableItem(item, max) {
    var esc = iwPanelEsc;
    var tone = item.gave_up ? 'bad' : 'warn';
    var tag = item.gave_up ? this._t('w_gave_up') : item.reloads && max ? this._t('w_attempts', { n: item.reloads, max }) : this._t('w_waiting');
    var sub = [item.domain, item.since ? this._t('w_since', { d: this._for(item.since) }) : ''].filter(Boolean).join(' · ');
    var link = `<a class="item ${tone}" href="${esc(this._href(item.domain, item.entry_id))}">
        ${this._logo(item.domain, 'mdi:puzzle-remove-outline')}
        <span class="who"><span class="n">${esc(item.title)}</span><span class="s">${esc(sub)}</span></span>
        <span class="side"><span class="tag">${esc(tag)}</span></span>
      </a>`;
    if (!item.gave_up || !item.entry_id) return link;
    var label = esc(`${this._t('w_retry')} — ${item.title}`);
    return `<div class="item-line">${link}<button class="icon-btn" data-reset="${esc(item.entry_id)}" title="${label}" aria-label="${label}"><ha-icon icon="mdi:restart"></ha-icon></button></div>`;
  }

  _historyItem(h) {
    var esc = iwPanelEsc;
    var event = iwPanelEvent(h.kind);
    var icon = { good: 'mdi:check-circle', warn: 'mdi:alert-circle', bad: 'mdi:cancel' }[event.tone];
    var detail = '';
    if (String(h.kind).endsWith('gave_up')) detail = this._t(event.cycle ? 'w_cycle_gave_up_after' : 'w_gave_up_after', { n: h.attempt });
    else if (h.max_reloads) detail = this._t(event.cycle ? 'w_cycle_attempt' : 'w_attempt', { n: h.attempt, max: h.max_reloads });
    var sub = [event.cycle ? h.switch_name || h.switch : h.domain, detail].filter(Boolean).join(' · ');
    return `<a class="item ${event.tone}" href="${esc(this._href(h.domain, h.entry_id))}" title="${esc(this._when(h.at))}">
        <span class="logo"><ha-icon icon="${icon}"></ha-icon></span>
        <span class="who"><span class="n">${esc(h.title)}</span><span class="s">${esc(sub)}</span></span>
        <span class="side"><span class="tag">${esc(this._t(event.label))}</span><span class="ago">${esc(this._ago(h.at))}</span></span>
      </a>`;
  }

  _tile(icon, tone, title, detail, extra = '', lead = false) {
    var esc = iwPanelEsc;
    return `<ha-card class="tile ${tone}${lead ? ' lead' : ''}"><div class="avatar"><ha-icon icon="${icon}"></ha-icon></div>
      <div class="who"><div class="n">${title}</div>${detail ? `<div class="s">${esc(detail)}</div>` : ''}</div>${extra}</ha-card>`;
  }

  _renderStatus() {
    var box = this.shadowRoot?.getElementById?.('iw-status');
    if (!box) return;
    this._drawnStatus = this._statusSignature();
    var esc = iwPanelEsc;
    var ids = this._statusIds();
    var states = this._hass?.states || {};
    var sensor = ids && states[ids.unavailable];
    if (!sensor) {
      box.innerHTML = `<ha-card class="note">${esc(this._t('w_not_loaded'))}</ha-card>`;
      return;
    }
    var items = sensor.attributes.integrations;
    var ignored = sensor.attributes.ignored || [];
    var max = Number(sensor.attributes.max_reloads) || null;
    var reloadState = ids.last_reload && states[ids.last_reload];
    var history = (reloadState?.attributes?.history || []).slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
    var checkState = ids.last_check && states[ids.last_check];
    var checkedAt = checkState && !['unknown', 'unavailable'].includes(checkState.state) ? checkState.state : null;
    // The button is unavailable while a check runs
    var checking = ids.check && states[ids.check]?.state === 'unavailable';
    var givenUp = items.filter((i) => i.gave_up).length;
    var waiting = items.length - givenUp;
    var tone = givenUp ? 'bad' : items.length ? 'warn' : 'good';
    var summary = [waiting && this._count(waiting, 'w_unavailable_one', 'w_unavailable_many'), givenUp && this._count(givenUp, 'w_gave_up_one', 'w_gave_up_many')]
      .filter(Boolean)
      .join(' · ');
    var check = ids.check
      ? `<button class="act" data-check${checking ? ' disabled' : ''}><ha-icon icon="mdi:refresh"></ha-icon>${esc(this._t(checking ? 'w_checking' : 'w_check_now'))}</button>`
      : '';
    var icon = { good: 'mdi:shield-check-outline', warn: 'mdi:shield-alert-outline', bad: 'mdi:shield-off-outline' }[tone];
    var number = (n, label) => `<b>${esc(n)}</b>${esc(this._t(label))}`;
    box.innerHTML = `
      <div class="tiles">
        ${this._tile(icon, tone, esc(summary || this._t('w_all_ok')), checkedAt ? this._t('w_checked', { d: this._ago(checkedAt) }) : this._t('w_never_checked'), check, true)}
        ${this._tile('mdi:restart', '', number(Number(reloadState?.attributes?.reloads) || 0, 'w_stat_reloads'), this._t('w_stat_reloads_hint'))}
        ${this._tile('mdi:eye-off-outline', '', number(ignored.length, 'w_stat_ignored'), ignored.join(', '))}
      </div>
      <div class="lists">
        <ha-card class="list">
          <div class="lhead"><ha-icon icon="mdi:puzzle-remove-outline"></ha-icon><span class="lname">${esc(this._t('w_unavailable_title'))}</span>
            <span class="lcount">${items.length}</span></div>
          ${
            items.length
              ? items.map((i) => this._unavailableItem(i, max)).join('')
              : `<div class="empty good"><ha-icon icon="mdi:check-circle-outline"></ha-icon>${esc(this._t('w_all_ok'))}</div>`
          }
        </ha-card>
        <ha-card class="list">
          <div class="lhead"><ha-icon icon="mdi:history"></ha-icon><span class="lname">${esc(this._t('w_history_title'))}</span>
            <span class="lcount">${history.length}</span></div>
          ${
            history.length
              ? history.slice(0, IW_PANEL_HISTORY).map((h) => this._historyItem(h)).join('')
              : `<div class="empty">${esc(this._t('w_no_history'))}</div>`
          }
        </ha-card>
      </div>`;
    // A brand without a logo (custom integration): the icon behind it shows
    box.querySelectorAll('.logo img').forEach((img) => {
      img.addEventListener('error', () => img.parentElement.classList.add('nobrand'), { once: true });
    });
  }

  // "Check now": presses the watchdog's button; a failure is a Home Assistant toast
  async _checkNow() {
    try {
      await this._hass.callService('button', 'press', { entity_id: this._statusIds()?.check });
    } catch (err) {
      this._toast(this._t('w_check_failed', { error: err?.message || err?.code || String(err) }));
    }
  }

  // "Try again" on an integration given up: forgets its reloads and reloads it (the reset action)
  async _resetEntry(entryId, button) {
    button.disabled = true;
    try {
      await this._hass.callService('integration_watchdog', 'reset', { entry_id: entryId });
    } catch (err) {
      button.disabled = false;
      this._toast(this._t('w_retry_failed', { error: err?.message || err?.code || String(err) }));
    }
  }

  _toast(message) {
    this.dispatchEvent(new CustomEvent('hass-notification', { detail: { message }, bubbles: true, composed: true }));
  }

  // The settings form: the fields the user typed over the stored values (so a change made elsewhere shows up)
  _draft() {
    return { ...(this._settings?.options || {}), ...this._drafts };
  }

  _edit(key, value) {
    this._drafts[key] = value;
    delete this._status.save;
  }

  _changed() {
    var stored = this._settings?.options || {};
    var d = this._draft();
    return (
      IW_PANEL_NUMBERS.some((k) => String(d[k]) !== String(stored[k])) ||
      IW_PANEL_LISTS.some((k) => !iwPanelSameList(d[k], stored[k])) ||
      (d.pause_entity || '') !== (stored.pause_entity || '') ||
      iwPanelOverrides(d.grace_overrides) !== iwPanelOverrides(stored.grace_overrides)
    );
  }

  _ok(key, value) {
    var [lo, hi] = IW_PANEL_LIMITS[key];
    var n = Number(value);
    return value !== '' && value != null && Number.isInteger(n) && n >= lo && n <= hi;
  }

  _valid() {
    var d = this._draft();
    return IW_PANEL_NUMBERS.every((k) => this._ok(k, d[k]));
  }

  _number(key, value, unit, data = 'key') {
    var esc = iwPanelEsc;
    var [lo, hi] = IW_PANEL_LIMITS[key];
    var step = key === 'delay' || key === 'off_time' ? 'step.add_power_cycle' : 'step.settings';
    return `
      <label class="ctl">
        <span>${esc(this._s(`${step}.data.${key}`, key))}</span>
        <div class="box${this._ok(key, value) ? '' : ' bad-value'}">
          <input type="number" inputmode="numeric" min="${lo}" max="${hi}" step="1" data-${data}="${key}" value="${esc(value)}">
          ${unit ? `<em>${esc(this._t(unit))}</em>` : ''}
        </div>
        <small>${esc(this._s(`${step}.data_description.${key}`))}</small>
      </label>`;
  }

  // The choices of a list field: {value, label, detail}; a value chosen but no longer offered keeps its name
  _choices(key) {
    var s = this._settings;
    if (key === 'notify_services') return (s.notify_options || []).map((v) => ({ value: v, label: v.replace(/^notify\./, '') }));
    if (key === 'ignored_integrations') return (s.integration_options || []).map((o) => ({ value: o.value, label: o.label, detail: o.value }));
    return (s.entry_options || []).map((o) => ({ value: o.value, label: o.label, detail: o.detail }));
  }

  _chips(key) {
    var esc = iwPanelEsc;
    var label = this._s(`step.settings.data.${key}`, key);
    var chosen = this._draft()[key] || [];
    var byValue = new Map(this._choices(key).map((c) => [c.value, c]));
    var chips = chosen
      .map((value) => {
        var c = byValue.get(value) || { value, label: value };
        return `
          <span class="chip" title="${esc(c.value)}">
            <span>${esc(c.label)}${c.detail ? ` <small>${esc(c.detail)}</small>` : ''}</span>
            <button type="button" data-remove="${esc(value)}" data-list="${key}" title="${esc(this._t('remove_chip', { name: c.label }))}"><ha-icon icon="mdi:close"></ha-icon></button>
          </span>`;
      })
      .join('');
    var left = [...byValue.values()].filter((c) => !chosen.includes(c.value));
    var options = left
      .map((c) => `<option value="${esc(c.value)}">${esc(c.label)}${c.detail ? ` — ${esc(c.detail)}` : ''}</option>`)
      .join('');
    return `
      <div class="ctl wide">
        <span>${esc(label)}</span>
        ${chips ? `<div class="chips">${chips}</div>` : ''}
        <div class="box">
          <select data-key="${key}" aria-label="${esc(label)}"${left.length ? '' : ' disabled'}>
            <option value="">${esc(this._t(left.length ? 'pick' : 'no_choice'))}</option>${options}
          </select>
        </div>
        <small>${esc(this._s(`step.settings.data_description.${key}`))}</small>
      </div>`;
  }

  _pauseHtml() {
    var esc = iwPanelEsc;
    var chosen = this._draft().pause_entity || '';
    var label = this._s('step.settings.data.pause_entity', 'pause_entity');
    var options = (this._settings.pause_options || [])
      .map((o) => `<option value="${esc(o.value)}"${o.value === chosen ? ' selected' : ''}>${esc(o.label)} — ${esc(o.value)}</option>`)
      .join('');
    return `
      <label class="ctl wide">
        <span>${esc(label)}</span>
        <div class="box"><select data-key="pause_entity" aria-label="${esc(label)}"><option value="">${esc(this._t('no_pause'))}</option>${options}</select></div>
        <small>${esc(this._s('step.settings.data_description.pause_entity'))}</small>
      </label>`;
  }

  _settingsHtml() {
    var esc = iwPanelEsc;
    var busy = this._busy;
    var status = this._status.save;
    var d = this._draft();
    var canSave = !busy && this._changed() && this._valid();
    var overrides = this._s('step.settings.data.grace_overrides', 'grace_overrides');
    return `
      <ha-card class="block" id="form">
        <div class="grid">
          ${this._number('scan_interval', d.scan_interval, 'u_min')}
          ${this._number('grace_period', d.grace_period, 'u_min')}
          ${this._number('max_reloads', d.max_reloads, '')}
          <label class="ctl wide">
            <span>${esc(overrides)}</span>
            <div class="box"><textarea data-key="grace_overrides" rows="3" spellcheck="false" placeholder="zha: 30" aria-label="${esc(overrides)}">${esc(d.grace_overrides)}</textarea></div>
            <small>${esc(this._s('step.settings.data_description.grace_overrides'))}</small>
          </label>
          ${this._chips('ignored_integrations')}
          ${this._chips('ignored_entries')}
          ${this._pauseHtml()}
          ${this._chips('notify_services')}
        </div>
        <div class="bar">
          <div class="links">${status ? `<span class="msg ${status.tone || ''}">${esc(status.text)}</span>` : ''}</div>
          <button class="act" data-do="save"${canSave ? '' : ' disabled'}><ha-icon icon="mdi:content-save"></ha-icon>${esc(this._t(busy === 'save' ? 'saving' : 'save'))}</button>
        </div>
      </ha-card>`;
  }

  // One power cycle: the device, its plug and delays, its state (available, unavailable, given up) and Remove
  _cycleHtml(c) {
    var esc = iwPanelEsc;
    var name = c.device_name || this._t('unknown_device');
    var max = this._settings.options?.max_reloads;
    var [tone, label] = c.gave_up ? ['bad', 'pc_gave_up'] : c.unavailable ? ['warn', 'pc_unavailable'] : ['good', 'pc_available'];
    var sub = [c.switch_name || c.switch, this._t('pc_line', { delay: c.delay, off: c.off_time })];
    if (c.count) sub.push(this._t('pc_count', { n: c.count, max }));
    var plug = c.switch_state === 'off' ? 'plug_off' : c.switch_state == null || c.switch_state === 'unavailable' ? 'plug_unavailable' : null;
    var busy = this._busy === `remove:${c.device_id}`;
    return `
      <ha-card class="block cycle">
        <div class="head">
          <div class="avatar"><ha-icon icon="mdi:power-plug-outline"></ha-icon></div>
          <div class="who">
            <div class="n">${esc(name)}${c.area ? ` <small class="msg">${esc(c.area)}</small>` : ''}</div>
            <div class="s" title="${esc(c.switch)}">${esc(sub.join(' · '))}</div>
          </div>
          <span class="pill ${tone}">${esc(this._t(label))}</span>
          ${c.device_name ? `<a class="icon-btn" href="/config/devices/device/${esc(c.device_id)}" title="${esc(this._t('open_device'))}"><ha-icon icon="mdi:devices"></ha-icon></a>` : ''}
          <button class="icon-btn" data-do="remove" data-device="${esc(c.device_id)}" title="${esc(this._t('remove_title', { name }))}" aria-label="${esc(this._t('remove_title', { name }))}"${this._busy ? ' disabled' : ''}><ha-icon icon="${busy ? 'mdi:timer-sand' : 'mdi:delete-outline'}"></ha-icon></button>
        </div>
        ${plug ? `<div class="warn-line"><ha-icon icon="mdi:power-plug-off-outline"></ha-icon>${esc(this._t(plug))}</div>` : ''}
      </ha-card>`;
  }

  _cycleForm() {
    var defaults = this._settings.defaults || {};
    return { delay: defaults.delay ?? 10, off_time: defaults.off_time ?? 10, device_id: '', switch: '', ...this._cycle };
  }

  _cycleValid() {
    var f = this._cycleForm();
    return !!f.device_id && !!f.switch && this._ok('delay', f.delay) && this._ok('off_time', f.off_time);
  }

  // The options of a picker: the devices not power-cycled yet, or the plugs (not the chosen device's own: they would go
  // unavailable with it)
  _pickOptions(key) {
    var f = this._cycleForm();
    if (key === 'device_id') {
      var taken = new Set((this._settings.power_cycles || []).map((c) => c.device_id));
      return (this._settings.device_options || []).filter((o) => !taken.has(o.value));
    }
    return (this._settings.switch_options || []).filter((o) => !f.device_id || o.device_id !== f.device_id);
  }

  // The area to list first: for the plugs, the chosen device's (a plug is usually next to what it powers)
  _pickFirstArea(key) {
    if (key !== 'switch') return '';
    var device = (this._settings.device_options || []).find((o) => o.value === this._cycleForm().device_id);
    return device?.area || '';
  }

  // The matching options, grouped by area, as listbox rows; at most IW_PANEL_PICK_MAX (the search narrows them down)
  _pickListHtml(key) {
    var esc = iwPanelEsc;
    var pick = this._pick[key];
    var matches = iwPanelMatch(this._pickOptions(key), pick.q);
    if (!matches.length) return { html: `<div class="pick-empty">${esc(this._t('no_match'))}</div>`, count: 0 };
    var first = this._pickFirstArea(key);
    var shown = 0;
    var rows = [];
    for (const [area, items] of iwPanelGroups(matches, first)) {
      if (shown >= IW_PANEL_PICK_MAX) break;
      var title = area && area === first ? this._t('same_area', { area }) : area || this._t('no_area');
      rows.push(`<div class="pick-group" role="presentation">${esc(title)}</div>`);
      for (const o of items) {
        if (shown >= IW_PANEL_PICK_MAX) break;
        var index = shown++;
        var icon = key === 'device_id' ? 'mdi:devices' : o.outlet ? 'mdi:power-socket-eu' : 'mdi:toggle-switch-outline';
        var active = index === pick.active && (pick.q || pick.nav);
        rows.push(`<div class="pick-option${active ? ' active' : ''}" role="option" id="pick-${key}-${index}" data-pick-value="${esc(o.value)}" data-index="${index}" aria-selected="${!!active}" title="${esc(o.value)}">
            <ha-icon icon="${icon}"></ha-icon>
            <span class="who"><span class="n">${esc(o.label)}</span>${o.detail ? `<span class="s">${esc(o.detail)}</span>` : ''}</span>
          </div>`);
      }
    }
    if (matches.length > shown) rows.push(`<div class="pick-more">${esc(this._t('pick_more', { n: matches.length - shown }))}</div>`);
    return { html: rows.join(''), count: shown };
  }

  // A device or plug field: the choice with a Change button, else a search over a short scrolling list grouped by area
  _pickHtml(key, label, hint, placeholder) {
    var esc = iwPanelEsc;
    var chosen = this._cycleForm()[key];
    var option = chosen && (key === 'device_id' ? this._settings.device_options : this._settings.switch_options)?.find((o) => o.value === chosen);
    var field;
    if (chosen) {
      var icon = key === 'device_id' ? 'mdi:devices' : option?.outlet ? 'mdi:power-socket-eu' : 'mdi:toggle-switch-outline';
      var sub = [option?.area, option?.detail].filter(Boolean).join(' · ');
      field = `<div class="box picked">
          <ha-icon icon="${icon}"></ha-icon>
          <span class="who"><span class="n">${esc(option?.label || chosen)}</span>${sub ? `<span class="s">${esc(sub)}</span>` : ''}</span>
          <button class="icon-btn" data-pick-clear="${key}" title="${esc(this._t('change'))}" aria-label="${esc(`${this._t('change')} — ${label}`)}"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>`;
    } else {
      var list = this._pickListHtml(key);
      var pick = this._pick[key];
      var active = list.count && (pick.q || pick.nav) ? ` aria-activedescendant="pick-${key}-${this._pick[key].active}"` : '';
      field = `<div class="box search"><ha-icon icon="mdi:magnify"></ha-icon><input type="search" data-pick="${key}" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls="pick-list-${key}" aria-labelledby="pick-label-${key}"${active} placeholder="${esc(placeholder)}" value="${esc(this._pick[key].q)}" autocomplete="off" spellcheck="false"></div>
        <div class="pick-list" role="listbox" id="pick-list-${key}" data-pick-list="${key}" aria-labelledby="pick-label-${key}">${list.html}</div>`;
    }
    return `
      <div class="ctl pick">
        <span id="pick-label-${key}">${esc(label)}</span>
        ${field}
        <small>${esc(hint)}</small>
      </div>`;
  }

  _addHtml() {
    var esc = iwPanelEsc;
    var f = this._cycleForm();
    var status = this._status.cycle;
    var device = this._s('step.add_power_cycle.data.device_id', 'device_id');
    var plug = this._s('step.add_power_cycle.data.switch', 'switch');
    return `
      <ha-card class="block" id="add">
        <div class="head">
          <div class="avatar"><ha-icon icon="mdi:power-cycle"></ha-icon></div>
          <div class="who"><div class="n">${esc(this._s('step.add_power_cycle.title', this._t('add')))}</div></div>
        </div>
        <p class="intro">${esc(this._s('step.add_power_cycle.description'))}</p>
        <div class="grid">
          <div class="pair">
            ${this._pickHtml('device_id', device, this._s('step.add_power_cycle.data_description.device_id'), this._t('pick_device'))}
            ${this._pickHtml('switch', plug, this._s('step.add_power_cycle.data_description.switch'), this._t('pick_switch'))}
          </div>
          ${this._number('delay', f.delay, 'u_min', 'cycle')}
          ${this._number('off_time', f.off_time, 'u_s', 'cycle')}
        </div>
        <div class="bar">
          <div class="links">${status ? `<span class="msg ${status.tone || ''}">${esc(status.text)}</span>` : ''}</div>
          <button class="act" data-do="add"${!this._busy && this._cycleValid() ? '' : ' disabled'}><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t(this._busy === 'add' ? 'adding' : 'add'))}</button>
        </div>
      </ha-card>`;
  }

  // Chooses an option of a picker; the plug of the device itself is dropped (no longer offered). The focus moves on to
  // the next empty picker, else to the delay.
  _choose(key, value) {
    this._cycle[key] = value;
    this._pick[key] = { q: '', active: 0 };
    if (key === 'device_id') {
      var own = (this._settings.switch_options || []).find((o) => o.value === this._cycle.switch);
      if (own && own.device_id === value) this._cycle.switch = '';
    }
    delete this._status.cycle;
    this._renderTabs();
    var root = this.shadowRoot;
    var next = !value ? root.querySelector(`[data-pick="${key}"]`) : root.querySelector('[data-pick="switch"]') || root.querySelector('input[data-cycle="delay"]');
    next?.focus({ preventScroll: true });
  }

  // The search changed or the highlight moved: only the list is redrawn, so typing keeps the focus and the caret
  _refreshPick(box, key, scroll) {
    var list = box.querySelector(`[data-pick-list="${key}"]`);
    var input = box.querySelector(`[data-pick="${key}"]`);
    if (!list || !input) return;
    var { html, count } = this._pickListHtml(key);
    list.innerHTML = html;
    var pick = this._pick[key];
    if (count && (pick.q || pick.nav)) input.setAttribute('aria-activedescendant', `pick-${key}-${this._pick[key].active}`);
    else input.removeAttribute('aria-activedescendant');
    if (scroll) list.querySelector('.pick-option.active')?.scrollIntoView?.({ block: 'nearest' });
  }

  _bindPick(box) {
    box.querySelectorAll('input[data-pick]').forEach((input) => {
      var key = input.dataset.pick;
      input.addEventListener('input', () => {
        this._pick[key] = { q: input.value, active: 0 };
        this._refreshPick(box, key);
        box.querySelector(`[data-pick-list="${key}"]`)?.scrollTo?.(0, 0);
      });
      input.addEventListener('keydown', (ev) => {
        var count = box.querySelectorAll(`[data-pick-list="${key}"] .pick-option`).length;
        var pick = this._pick[key];
        if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && count) {
          ev.preventDefault();
          // The first arrow press highlights the first option; then it moves
          if (pick.q || pick.nav) pick.active = (pick.active + (ev.key === 'ArrowDown' ? 1 : count - 1)) % count;
          pick.nav = true;
          this._refreshPick(box, key, true);
        } else if (ev.key === 'Enter' && count && (pick.q || pick.nav)) {
          ev.preventDefault();
          var option = box.querySelector(`#pick-${key}-${Math.min(pick.active, count - 1)}`);
          if (option) this._choose(key, option.dataset.pickValue);
        } else if (ev.key === 'Escape' && pick.q) {
          ev.preventDefault();
          input.value = '';
          this._pick[key] = { q: '', active: 0 };
          this._refreshPick(box, key);
        }
      });
    });
    box.querySelectorAll('[data-pick-list]').forEach((list) => {
      // mousedown: chosen before the search loses the focus
      list.addEventListener('mousedown', (ev) => ev.preventDefault());
      list.addEventListener('click', (ev) => {
        var option = ev.target.closest?.('[data-pick-value]');
        if (option) this._choose(list.dataset.pickList, option.dataset.pickValue);
      });
    });
    box.querySelectorAll('[data-pick-clear]').forEach((button) => {
      button.addEventListener('click', () => this._choose(button.dataset.pickClear, ''));
    });
  }

  _cyclesHtml() {
    var esc = iwPanelEsc;
    var cycles = this._settings.power_cycles || [];
    var entry = this._settings.entry;
    var state = this._t(`st_${entry.state}`) === `st_${entry.state}` ? this._t('st_other') : this._t(`st_${entry.state}`);
    var list = cycles.length
      ? cycles.map((c) => this._cycleHtml(c)).join('')
      : `<ha-card class="note">${esc(this._t('pc_none'))}</ha-card>`;
    var removed = this._status.remove;
    return `
      ${entry.state === 'loaded' ? '' : `<ha-card class="note"><span class="pill ${iwPanelTone(entry.state)}">${esc(state)}</span></ha-card>`}
      ${removed ? `<span class="msg ${removed.tone || ''}" role="status">${esc(removed.text)}</span>` : ''}
      ${list}
      ${this._addHtml()}`;
  }

  // The Power cycles and Settings tabs, both from the settings command (the Status tab holds the card)
  _renderTabs() {
    var root = this.shadowRoot;
    var cycles = root.getElementById('tab-power_cycles');
    var settings = root.getElementById('tab-settings');
    if (!cycles || !settings) return;
    var esc = iwPanelEsc;
    var note = null;
    if (this._settings === null && this._loadError) {
      note = `<ha-card class="note error" role="alert">${esc(this._t('load_failed', { error: this._loadError }))}
        <button class="act" data-retry><ha-icon icon="mdi:refresh"></ha-icon>${esc(this._t('retry'))}</button></ha-card>`;
    } else if (this._settings === null) note = `<ha-card class="note" aria-busy="true">${esc(this._t('loading'))}</ha-card>`;
    else if (!this._settings.entry) {
      note = `<ha-card class="note">${esc(this._t('none'))}
        <a class="act" href="/config/integrations/dashboard/add?domain=integration_watchdog"><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t('open_add'))}</a></ha-card>`;
    }
    if (note) {
      cycles.innerHTML = note;
      settings.innerHTML = note;
      for (const b of root.querySelectorAll('[data-retry]')) b.addEventListener('click', () => this._reload());
      return;
    }
    var focus = this._focusOf(root.querySelector('main'));
    cycles.innerHTML = this._cyclesHtml();
    settings.innerHTML = this._settingsHtml();
    this._bind(cycles);
    this._bind(settings);
    this._refocus(root.querySelector('main'), focus);
  }

  // The focused field or button (attribute, caret), so a re-render can give the focus back.
  // A button disabled meanwhile (Save while it runs) gets it back on the next render that enables it again.
  _focusOf(box) {
    var el = this.shadowRoot.activeElement;
    if (!el || !box.contains(el)) {
      var pending = this._pendingFocus;
      return pending && !el ? pending : null;
    }
    var attr = ['key', 'cycle', 'pick', 'do', 'remove'].find((a) => el.dataset?.[a] != null);
    if (!attr) return null;
    var focus = { attr: `data-${attr}`, value: el.dataset[attr], range: null };
    try {
      // Number inputs have no selection (null, or an exception in some browsers)
      if (el.selectionStart != null) focus.range = [el.selectionStart, el.selectionEnd, el.selectionDirection];
    } catch (_err) {
      focus.range = null;
    }
    return focus;
  }

  _refocus(box, focus) {
    this._pendingFocus = null;
    if (!focus) return;
    var el = box.querySelector(`[${focus.attr}="${CSS.escape(focus.value)}"]`);
    if (!el) return;
    if (el.disabled) {
      // Only while an action runs: a Save left disabled after saving must not grab the focus later
      if (this._busy) this._pendingFocus = focus;
      return;
    }
    el.focus({ preventScroll: true });
    if (!focus.range) return;
    try {
      el.setSelectionRange(...focus.range);
    } catch (_err) {
      // the caret cannot be set on this field type
    }
  }

  // Refresh only the buttons and the field borders, so typing keeps the focus
  _refreshBar(box) {
    var save = box.querySelector('[data-do="save"]');
    if (save) save.disabled = !!this._busy || !this._changed() || !this._valid();
    var add = box.querySelector('[data-do="add"]');
    if (add) add.disabled = !!this._busy || !this._cycleValid();
    box.querySelectorAll('input[type="number"]').forEach((input) => {
      var key = input.dataset.key || input.dataset.cycle;
      input.parentElement.classList.toggle('bad-value', !this._ok(key, input.value));
    });
    var msg = box.querySelector('#form .links');
    if (msg && !this._status.save) msg.innerHTML = '';
  }

  _bind(box) {
    box.querySelectorAll('input[data-key], textarea[data-key]').forEach((input) => {
      input.addEventListener('input', () => {
        this._edit(input.dataset.key, input.value);
        this._refreshBar(box);
      });
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && input.tagName === 'INPUT' && !box.querySelector('[data-do="save"]').disabled) this._save();
      });
    });
    box.querySelectorAll('input[data-cycle]').forEach((input) => {
      input.addEventListener('input', () => {
        this._cycle[input.dataset.cycle] = input.value;
        delete this._status.cycle;
        this._refreshBar(box);
      });
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !box.querySelector('[data-do="add"]').disabled) this._add();
      });
    });
    this._bindPick(box);
    box.querySelectorAll('select[data-key]').forEach((select) => {
      select.addEventListener('change', () => {
        var key = select.dataset.key;
        if (key === 'pause_entity') {
          this._edit(key, select.value || null);
          this._refreshBar(box);
          return;
        }
        if (!select.value) return;
        this._edit(key, [...(this._draft()[key] || []), select.value]);
        this._renderTabs();
      });
    });
    box.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        var key = button.dataset.list;
        this._edit(key, (this._draft()[key] || []).filter((v) => v !== button.dataset.remove));
        this._renderTabs();
        box.querySelector(`select[data-key="${key}"]`)?.focus({ preventScroll: true });
      });
    });
    box.querySelector('[data-do="save"]')?.addEventListener('click', () => this._save());
    box.querySelector('[data-do="add"]')?.addEventListener('click', () => this._add());
    box.querySelectorAll('[data-do="remove"]').forEach((button) => {
      button.addEventListener('click', () => this._remove(button.dataset.device));
    });
  }

  async _run(kind, slot, call) {
    this._busy = kind;
    this._renderTabs();
    try {
      this._status[slot] = await call();
    } catch (err) {
      this._status[slot] = { tone: 'bad', text: err?.message || this._t('err_generic') };
    }
    this._busy = null;
    this._renderTabs();
  }

  // An error key of the command: the panel's own text, else the options flow's error (same keys), else the message
  _error(res) {
    var error = res?.error || 'generic';
    var own = `err_${error}`;
    var text = this._t(own) !== own ? this._t(own) : this._s(`error.${error}`) || res?.message || this._t('err_generic');
    return { tone: 'bad', text };
  }

  _save() {
    var d = this._draft();
    return this._run('save', 'save', async () => {
      var res = await this._hass.callWS({
        type: 'integration_watchdog/update_settings',
        scan_interval: Number(d.scan_interval),
        grace_period: Number(d.grace_period),
        max_reloads: Number(d.max_reloads),
        grace_overrides: d.grace_overrides || '',
        ignored_integrations: d.ignored_integrations || [],
        ignored_entries: d.ignored_entries || [],
        pause_entity: d.pause_entity || null,
        notify_services: d.notify_services || [],
      });
      if (!res?.ok) return this._error(res);
      this._drafts = {};
      this._settings.options = res.options;
      return { tone: 'good', text: this._t('saved') };
    });
  }

  _add() {
    var f = this._cycleForm();
    return this._run('add', 'cycle', async () => {
      var res = await this._hass.callWS({
        type: 'integration_watchdog/add_power_cycle',
        device_id: f.device_id,
        switch: f.switch,
        delay: Number(f.delay),
        off_time: Number(f.off_time),
      });
      if (!res?.ok) return this._error(res);
      this._cycle = {};
      await this._load();
      return { tone: 'good', text: this._t('added') };
    });
  }

  _remove(device) {
    return this._run(`remove:${device}`, 'remove', async () => {
      var res = await this._hass.callWS({ type: 'integration_watchdog/remove_power_cycle', device_id: device });
      if (!res?.ok) return this._error(res);
      await this._load();
      return { tone: 'good', text: this._t('removed') };
    });
  }
}

if (!customElements.get('integration-watchdog-panel')) {
  customElements.define('integration-watchdog-panel', IntegrationWatchdogPanel);
}
