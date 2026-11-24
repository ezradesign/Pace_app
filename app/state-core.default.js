/* PACE · state-core.default.js — EL ESTADO DE FÁBRICA
   ==================================================
   Lo que tiene quien abre PACE por primera vez; `loadState` (state-core.jsx) lo mezcla con lo
   guardado ({...defaultState, ...parsed}) y `paceSanearEstado` lo usa de molde. Sacado de
   state-core.jsx, que estaba en las 500 líneas (auditoría del 24 nov. 2026, H8A de Ez).

   CARGA ANTES QUE state-core.jsx: `let _state = loadState()` corre en el cuerpo de aquel.
   `var` a propósito: un `const` top-level no cruza la IIFE del artefacto. */

var defaultState = {
  // Settings / Tweaks
  palette: 'crema',

  /* Paleta AUTOMÁTICA (s161). `palette` sigue siendo SIEMPRE una paleta real
     ('crema'|'oscuro'), nunca 'auto': si valiera 'auto', `applyTheme` pondría
     data-palette="auto" y ninguna regla de tokens.css casaría — la app entera
     se quedaría con los valores de `:root`. El modo va aparte y `loadState` lo
     RESUELVE en cada arranque; además, mientras la app está abierta lo re-sigue
     en caliente (state-settings.jsx). Esto REVISA la decisión de s89, que solo
     miraba el sistema en el primer arranque de la vida.
     FALSE aquí a propósito, y por la misma razón que `langAuto`: el merge
     `{...defaultState, ...parsed}` pasaría a Auto a TODA instalación existente
     y borraría su elección. El true va solo en la rama sin `raw`. */
  paletteAuto: false,

  font: 'cormorant',
  layout: 'sidebar',
  sidebarCollapsed: false,
  timerStyle: 'aro',
  breathStyle: 'flor',
  logoVariant: 'pace',
  // B1.2 (s108): audio ON por defecto (opt-out en Ajustes). Solo afecta a
  // instalaciones nuevas: el merge de loadState conserva el valor persistido.
  soundOn: true,
  ambientOn: false,
  /* s177 · la tercera opcion de «que suena detras». Arranca APAGADA porque hoy
     solo existe una pieza (Equilibrio) y es una prueba; y es EXCLUYENTE con
     ambientOn -- la interfaz lo mantiene, y `paceMusica` lo vuelve a
     comprobar por si acaso. */
  musicOn: false,

  // s176 · LA VOZ TIENE INTERRUPTOR PROPIO. Hasta s175 iba pegada a `soundOn`,
  // asi que quien tenia sonido se encontro una voz y no podia quitarla sin
  // apagarlo todo -- lo reporto el usuario al probarla.
  // ARRANCA EN `true` A PROPOSITO: es el comportamiento que ya esta publicado
  // en v0.105.0 (la version que el usuario probo), y el merge de loadState
  // conserva el valor de quien lo cambie.
  // Poner `false` aqui le quitaria la voz a quien ya la tiene sin pedirlo.
  voiceOn: true,
  // Cual de las dos locuciones. Los valores validos los declara `PACE_VOCES`
  // (Sound.voz.jsx) y `paceVozActiva` cae a `sulafat` ante cualquier otra cosa,
  // asi que un valor viejo o corrupto en localStorage no deja a nadie sin voz.
  voice: 'sulafat',

  // Descanso entre series de fuerza (s114): solo los rests con restKind:'betweenSets'.
  // Presets de Ajustes 20 / 30 (default) / 45; las instalaciones previas heredan 30 por el merge.
  restBetweenSets: 30,
  // «Auto» de Mueve y Estira (Ez, 1A del 25 oct.): apagado, cada paso espera a «›».
  cuerpoAuto: true,
  vibrar: 'sinSonido',   // «Vibrar» en Mueve y Estira (Ez, 6A del 15 nov.): 'no' · 'sinSonido' (de fábrica) · 'siempre'

  // Aviso de fin de Pomodoro vía notificación del navegador (s102 · PWA).
  // B1.2 (s108): ON por defecto (opt-out en Ajustes). El permiso del navegador
  // exige gesto: se pide en el primer «Comenzar» de Foco (o al encender el
  // toggle en Ajustes); si se deniega, el flag baja a false para que el toggle
  // refleje la realidad. Solo dispara con la pestaña en segundo plano.
  // Ver FocusTimer.support.jsx (maybeRequestNotifyPermission).
  notifyFocusEnd: true, exactaOfrecida: false, miniSolaNo: false, // si ya salió «Avisos a su hora ›» en Android (FocusTimer.avisos.jsx); si la persona cerró la miniventana con el Foco en marcha y ya no se abre sola (Ez, A del 20 nov.; FocusTimer.mini.jsx)
  lang: 'en',

  /* Idioma AUTOMÁTICO (s139 · Fase 1.6). `lang` sigue siendo SIEMPRE un idioma
     real ('es'|'en'), nunca 'auto': si valiera 'auto', `useT` buscaría
     PACE_STRINGS['auto'] y caería a inglés en cada clave. El modo va aparte y
     `loadState` lo RESUELVE en cada arranque.
     FALSE aquí a propósito, aunque las instalaciones nuevas nazcan en Auto: el
     merge `{...defaultState, ...parsed}` pasaría a Auto a TODA instalación
     existente y borraría su elección. El true va solo en la rama sin `raw`. */
  langAuto: false,

  // El código de PACE completo tal como se canjeó (state-licencia.js). Va en el
  // estado para que viaje con la copia de «Tus datos». No hay ningún interruptor
  // de PACE completo en el estado: lo abre este código cuando su firma se ha
  // comprobado, o la tienda del canal (state-entitlement.jsx). Un booleano aquí
  // lo abría cualquiera desde las herramientas del navegador.
  licencia: null,
  // La suscripción (`order`) cuyo aviso del fin de la prueba ya salió (PremiumInvitacion.jsx).
  premiumAvisoPrueba: null, novedadesVistas: null, /* el id de las novedades del sobre ya leídas; '*' las apaga (shell/Sobre.novedades.js) */
  lunesVisto: null, ultimaCopia: null, copiaAvisoVisto: null, /* el lunes en que se abrió la línea de los lunes del sobre (ritmo/ritmo.lunes.jsx); cuándo salió la última copia y el día del aviso de la copia (tweaks/TweaksData.copia.jsx) */

  // Foco
  focusMode: 'foco',
  focusMinutes: 25,
  cycle: 0,
  totalFocusMin: 0,

  // Plan del dia
  plan: { muevete: false, respira: false, extra: false, hidratate: false },

  // Hidratacion
  water: { goal: 8, today: 0, lastReset: null },

  // Logros
  achievements: {},

  // Cola de CELEBRACION de logros (s145 · Fase 2.5). El logro se gana y se
  // registra en `achievements` al instante; aqui solo esperan su AVISO, que
  // sale de uno en uno al cerrar sesion. Se persiste porque una recarga se
  // comeria las celebraciones pendientes. Instalaciones previas lo reciben
  // vacio por el merge {...defaultState, ...parsed} de loadState.
  achievementQueue: [],

  // Stats semanales — INDICE LUNES-PRIMERO (sesion 69 / v0.28.8).
  // [0]=lunes ... [6]=domingo. Antes de v0.28.8 era getDay()-style (0=dom).
  weeklyStats: {
    focusMinutes:  [0,0,0,0,0,0,0],
    breathMinutes: [0,0,0,0,0,0,0],
    moveMinutes:   [0,0,0,0,0,0,0],
    waterGlasses:  [0,0,0,0,0,0,0],
    /* TIEMPO DE RETENCION en SEGUNDOS (s166), no en minutos como los otros
       tres: una retencion dura 15-60 s y redondearla a minutos la dejaria
       casi siempre en 0 o en 1.

       OJO AL LEERLO: el merge de `loadState` es {...defaultState, ...parsed}
       y es SUPERFICIAL, asi que una instalacion existente trae su propio
       `weeklyStats` de cuatro claves y ESTA NO VIENE. Todo consumidor lee con
       fallback; no hay migracion porque no hay nada que migrar (el dato no
       existia) y una semana sin retencion es legitimamente cero. */
    holdSeconds:   [0,0,0,0,0,0,0],
  },

  // Streak
  streak: { current: 0, longest: 0, lastActiveDate: null },

  // Contadores acumulados de sesiones (crecen monotonamente, nunca resetean).
  breatheSessionsTotal: 0,
  moveSessionsTotal: 0,

  // Fechas (toDateString()) con sesion antes de las 9:00. Cap 30.
  morningDates: [],

  /* s146 — idem para logros que pasaron de «una vez» a «varios dias»: dawn/dusk
     (5 dias), plan (3). `respiraHoy` es {fecha,n} y no lista: se reinicia al
     cambiar el dia, asi no crece. Van en defaultState porque una clave que solo
     nace al dispararse el detector no sale en un export. */
  dawnDates: [],
  duskDates: [], ocasoDias: [], ocasoTarde: null, ocasoSalida: {}, /* Ocaso, desde el 11 nov.: jornadas cerradas a su hora (state-achievements.ocaso.js); la salida, un objeto: con `null` el saneado lo borraría */
  planDates: [],
  respiraHoy: { fecha: null, n: 0 },

  intention: '',
  firstSeen: null,

  // Perfil del onboarding (s106). Capturado en la bienvenida de primera vez
  // (app/onboarding/): need 'calm'|'focus'|'body'|'energy' · time 'short'|
  // 'pause'|'block' · environment 'office'|'home'|'mixed'. Campo null =
  // pregunta saltada; completedAt = cuándo se cerró el flujo. Hoy alimenta
  // pickFirstPath (primer Camino); en s107 entrará al scoring de
  // getSuggestedPath. Instalaciones previas lo reciben con nulls por el
  // merge {...defaultState, ...parsed} de loadState (sin migración extra).
  profile: { need: null, time: null, environment: null, completedAt: null },
  supportSeenAt: null,
  supportCopyVariant: 'pastar',
  reminders: [],

  // Fechas de dias silenciosos (soundOn=false). Cap 30.
  silentDates: [],

  // Fechas en que water.today alcanzo water.goal. Cap 14.
  waterGoalDates: [],

  // Contadores por tipo de rutina. { box, coherent, rounds, atg }.
  routineCounts: {},

  // Rutinas custom del constructor premium (s93 · F7). CRUD y shape en
  // state-custom.jsx; los helpers leen con fallback [] por si un import
  // viejo reintroduce un estado sin la key.
  customRoutines: [],

  // Feedback ligero por rutina (s116 · B2.2b-2 · «¿Te ayudó esta pausa?»).
  // { [routineId]: { yes, some, no, lastPromptDay } }. Solo CONTADOR: answered
  // y helpScore se DERIVAN, nunca se persisten. Lógica en state-feedback.jsx.
  // Instalaciones previas lo reciben con {} vía el merge {...defaultState,
  // ...parsed} de loadState (sin migración; el slice se llena al primer voto).
  routineFeedback: {},

  // Historico de actividad (sesion 43).
  // days: { "YYYY-MM-DD": {focusMinutes, breathMinutes, moveMinutes, waterGlasses} }
  // months: { "YYYY-MM": ... }   years: { "YYYY": ... }
  history: { days: {}, months: {}, years: {} },

  // Caminos (sesion 49 / v0.26.0-alpha; lastViewed s75).
  paths: {
    current: null,
    completed: {},
    favorite: null,
    history: [],
    lastViewed: null, // s75: ultimo Camino abierto, base de getSuggestedPath
  },

  // Migration guards.
  _historyMigrated: false,                  // sesion 43 — weeklyStats -> history.days
  _weeklyStatsReindexed_v0_28_8: false,     // sesion 69 — getDay() -> lunes-primero
  _historyRecalculated_v0_28_8: false,      // sesion 69 — months/years desde days

  // Rollover: dia del ultimo uso (toDateString()).
  lastActiveDay: null,
};

Object.assign(window, { defaultState: defaultState });
