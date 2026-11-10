/*
 * Integration Watchdog sidebar panel — the status, the power cycles and the settings on one page (administrators only).
 *
 * Three tabs under the toolbar, as in Smart Comfort: Status (the bundled integration-watchdog-card with the whole
 * history), Power cycles (the devices switched off and on with their smart plug: list, add, remove) and Settings
 * (the options of Configure). Backed by the integration_watchdog/settings, update_settings, add_power_cycle and
 * remove_power_cycle WebSocket commands. The form labels and hints are the integration's own translations (options
 * flow, fetched with frontend/get_translations); the strings below are the panel's own. The page follows the config
 * entry (config_entries/subscribe), so options changed from Configure show up here. The tab is in the address
 * (/integration-watchdog/settings).
 *
 * https://github.com/juju35/ha-integration-watchdog
 */
var INTEGRATION_WATCHDOG_PANEL_VERSION = '1.8.1';

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
    pick_device: 'Choose a device…',
    pick_switch: 'Choose a plug…',
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
    pick_device: 'Choisir un appareil…',
    pick_switch: 'Choisir une prise…',
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
    pick_device: 'Gerät wählen…',
    pick_switch: 'Steckdose wählen…',
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
    pick_device: 'Elige un dispositivo…',
    pick_switch: 'Elige un enchufe…',
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
    pick_device: 'Scegli un dispositivo…',
    pick_switch: 'Scegli una presa…',
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
    pick_device: 'Kies een apparaat…',
    pick_switch: 'Kies een stekker…',
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
    pick_device: 'Escolher um dispositivo…',
    pick_switch: 'Escolher uma tomada…',
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
    pick_device: 'Wybierz urządzenie…',
    pick_switch: 'Wybierz gniazdko…',
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
    pick_device: 'Изаберите уређај…',
    pick_switch: 'Изаберите утичницу…',
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
    pick_device: 'Izaberite uređaj…',
    pick_switch: 'Izaberite utičnicu…',
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
    pick_device: 'Alege un dispozitiv…',
    pick_switch: 'Alege o priză…',
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
    pick_device: 'Vælg en enhed…',
    pick_switch: 'Vælg et stik…',
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
    pick_device: 'Välj en enhet…',
    pick_switch: 'Välj ett uttag…',
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
    pick_device: 'Изберете устройство…',
    pick_switch: 'Изберете контакт…',
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
    pick_device: 'Выберите устройство…',
    pick_switch: 'Выберите розетку…',
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
    pick_device: 'Виберіть пристрій…',
    pick_switch: 'Виберіть розетку…',
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
    pick_device: 'Válasszon eszközt…',
    pick_switch: 'Válasszon konnektort…',
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
    pick_device: 'Vyberte zariadenie…',
    pick_switch: 'Vyberte zásuvku…',
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
    pick_device: 'Vyberte zařízení…',
    pick_switch: 'Vyberte zásuvku…',
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
    pick_device: 'Izberite napravo…',
    pick_switch: 'Izberite vtičnico…',
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
    pick_device: 'Izvēlieties ierīci…',
    pick_switch: 'Izvēlieties kontaktligzdu…',
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
    pick_device: 'Επιλέξτε συσκευή…',
    pick_switch: 'Επιλέξτε πρίζα…',
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
  },
};

// Option limits, filled in from the settings command (the Python constants are the reference)
var IW_PANEL_LIMITS = { scan_interval: [1, 1440], grace_period: [1, 1440], max_reloads: [1, 10], delay: [1, 1440], off_time: [1, 300] };
var IW_PANEL_NUMBERS = ['scan_interval', 'grace_period', 'max_reloads'];
var IW_PANEL_LISTS = ['ignored_integrations', 'ignored_entries', 'notify_services'];
var IW_PANEL_TABS = ['status', 'power_cycles', 'settings'];

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
    .icon-btn { border:0; background:none; cursor:pointer; color:var(--secondary-text-color); padding:8px; border-radius:50%; display:flex; --mdc-icon-size:20px; }
    .icon-btn:hover:not([disabled]) { background:var(--secondary-background-color); color:var(--error-color, #db4437); }
    .icon-btn[disabled] { opacity:.5; cursor:default; }
    .warn-line { font-size:12px; color:var(--tone-text); --tone:var(--tone-warn); display:flex; align-items:center; gap:6px; --mdc-icon-size:16px; }
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
    if (this._card) this._card.hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (first) this._start();
    else if (this._lang() !== langBefore) {
      this._render();
      this._loadStrings();
    }
  }

  set narrow(narrow) {
    this._narrow = narrow;
    if (this._menu) this._menu.narrow = narrow;
  }

  set panel(panel) {
    this._panel = panel;
  }

  connectedCallback() {
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

  // The settings and labels load at once, the card alongside: its bundle and language file take up to a few seconds,
  // and the other tabs don't need it. The card goes into its slot whenever it's defined.
  _start() {
    this._render();
    this._subscribe();
    this._watchConnection(this.isConnected);
    this._load();
    this._loadStrings();
    return this._loadCard();
  }

  async _loadCard() {
    try {
      if (!customElements.get('integration-watchdog-card')) await this._importCard();
      // Defined only once its language file is in, after the import resolved
      await customElements.whenDefined('integration-watchdog-card');
    } catch (err) {
      console.error('Integration Watchdog panel: could not load the card', err);
      return;
    }
    this._mountCard();
  }

  _importCard() {
    var version = this._panel?.config?.version || INTEGRATION_WATCHDOG_PANEL_VERSION;
    return import(`/integration_watchdog/integration-watchdog-card.js?v=${version}`);
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
        <section class="column" id="tab-status" role="tabpanel" aria-labelledby="tabbtn-status"><div id="card"></div></section>
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
    if (this._card) root.getElementById('card').appendChild(this._card);
    this._renderTabs();
  }

  _tabHtml(tab) {
    var selected = tab === this._tab;
    return `<button class="tab${selected ? ' active' : ''}" role="tab" id="tabbtn-${tab}" data-tab="${tab}" aria-selected="${selected}" aria-controls="tab-${tab}" tabindex="${selected ? 0 : -1}">${iwPanelEsc(this._t(tab))}</button>`;
  }

  _mountCard() {
    if (this._card || !customElements.get('integration-watchdog-card')) return;
    this._card = document.createElement('integration-watchdog-card');
    // The whole history; no `language`: the card follows hass.language, so it switches language with the panel.
    this._card.setConfig({ history_count: 20 });
    this._card.hass = this._hass;
    this.shadowRoot.getElementById('card')?.appendChild(this._card);
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

  _addHtml() {
    var esc = iwPanelEsc;
    var f = this._cycleForm();
    var taken = new Set((this._settings.power_cycles || []).map((c) => c.device_id));
    var devices = (this._settings.device_options || []).filter((o) => !taken.has(o.value));
    // A plug of the device itself would go unavailable with it: not offered
    var switches = (this._settings.switch_options || []).filter((o) => !f.device_id || o.device_id !== f.device_id);
    var opt = (o, chosen) =>
      `<option value="${esc(o.value)}"${o.value === chosen ? ' selected' : ''}>${esc(o.label)}${o.detail ? ` — ${esc(o.detail)}` : ''}</option>`;
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
          <label class="ctl">
            <span>${esc(device)}</span>
            <div class="box"><select data-cycle="device_id" aria-label="${esc(device)}"><option value="">${esc(this._t('pick_device'))}</option>${devices.map((o) => opt(o, f.device_id)).join('')}</select></div>
            <small>${esc(this._s('step.add_power_cycle.data_description.device_id'))}</small>
          </label>
          <label class="ctl">
            <span>${esc(plug)}</span>
            <div class="box"><select data-cycle="switch" aria-label="${esc(plug)}"><option value="">${esc(this._t('pick_switch'))}</option>${switches.map((o) => opt(o, f.switch)).join('')}</select></div>
            <small>${esc(this._s('step.add_power_cycle.data_description.switch'))}</small>
          </label>
          ${this._number('delay', f.delay, 'u_min', 'cycle')}
          ${this._number('off_time', f.off_time, 'u_s', 'cycle')}
        </div>
        <div class="bar">
          <div class="links">${status ? `<span class="msg ${status.tone || ''}">${esc(status.text)}</span>` : ''}</div>
          <button class="act" data-do="add"${!this._busy && this._cycleValid() ? '' : ' disabled'}><ha-icon icon="mdi:plus"></ha-icon>${esc(this._t(this._busy === 'add' ? 'adding' : 'add'))}</button>
        </div>
      </ha-card>`;
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
    var attr = ['key', 'cycle', 'do', 'remove'].find((a) => el.dataset?.[a] != null);
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
    box.querySelectorAll('select[data-cycle]').forEach((select) => {
      select.addEventListener('change', () => {
        this._cycle[select.dataset.cycle] = select.value;
        // The plug chosen may be one of the new device's own: dropped from the list, so chosen again
        if (select.dataset.cycle === 'device_id') {
          var own = (this._settings.switch_options || []).find((o) => o.value === this._cycle.switch);
          if (own && own.device_id === select.value) this._cycle.switch = '';
        }
        delete this._status.cycle;
        this._renderTabs();
      });
    });
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
