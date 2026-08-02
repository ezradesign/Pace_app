/* PACE · state-achievements.support.jsx
   Soporte sin UI de los logros (s146 · Fase 2.5, mitad 2): contadores
   generalizados + detectores que antes no existian.

   Por que nace este archivo: `state-achievements.jsx` iba por 303 ln y la
   curva nueva (§15.3) mas los detectores que faltaban lo pasaban del limite
   de 500 de CLAUDE.md. Mismo patron que `MoveSessionV1.support.jsx`.

   ---------------------------------------------------------------------------
   AMNISTIA (decision s146). Los umbrales SUBEN pero **nadie pierde un logro
   ya concedido**: la unica escritura sobre `state.achievements` es el spread
   aditivo de `unlockAchievement`, asi que un logro ya ganado no se puede
   retirar ni queriendo. Las reglas nuevas rigen solo para lo aun no ganado.
   Esto ANULA la «excepcion consciente a §2.5/§2.2» que se habia aceptado en
   s136: no hay excepcion, no hay perdida y no hay nada que comunicar.

   Consecuencia practica de la amnistia sobre los contadores: los contadores
   NUEVOS arrancan en cero para todo el mundo. A quien ya tuviera el logro no
   le afecta (lo conserva); a quien no lo tuviera le cuenta desde hoy. Por eso
   los contadores legacy (`box`/`coherent`/`rounds`/`atg`) se siguen
   alimentando: hay progreso vivo colgando de ellos.
   ---------------------------------------------------------------------------
*/

/* ---------------------------------------------------------------------------
   IDS QUE YA NO DECIAN LA VERDAD (s146b)
   ---------------------------------------------------------------------------
   `master.box.10` pasó a pedir 15 y el id seguía diciendo 10. El id es la clave
   de persistencia, así que renombrarlo a secas BORRA el logro de quien lo
   tuviera: desaparece de la colección porque la UI solo pinta lo que está en el
   catálogo. Se renombra Y se migra, y así la amnistía sigue intacta sin tener
   que avisar a nadie.

   Corre AQUI y no en `loadState` a propósito: `state-core` ya está por encima
   de las 500 líneas, y esto es asunto de logros. El módulo carga después de
   state-core, así que el store ya existe. Idempotente: si el id viejo no está,
   no hace nada. */
const LOGRO_RENOMBRADO = {
  'master.box.10':      'master.box.15',
  'master.coherent.10': 'master.coherent.15',
  'master.rounds.10':   'master.rounds.15',
};

function migrarIdsDeLogro() {
  const s = getState();
  const antes = s.achievements || {};
  const next = { ...antes };
  let cambia = false;
  for (const [viejo, nuevo] of Object.entries(LOGRO_RENOMBRADO)) {
    if (!next[viejo]) continue;
    if (!next[nuevo]) next[nuevo] = next[viejo];   // conserva su unlockedAt
    delete next[viejo];
    cambia = true;
  }
  if (!cambia) return;
  setState({
    achievements: next,
    achievementQueue: (s.achievementQueue || []).map(id => LOGRO_RENOMBRADO[id] || id),
  });
}

/* Cuantas veces hay que repetir algo para que deje de ser «lo probe una vez».
   Tres es el numero: una es azar, dos es repetir, tres ya es habito naciente.
   §15.3 pide «repeticion significativa» para lo avanzado y que los primeros
   «no se desbloqueen todos juntos» — con 1 sesion, los 16 de exploracion caian
   el mismo dia que el modulo que los contiene. */
const EXPLORE_REPS = 3;

/* Suma un contador con nombre. Los contadores viven todos en `routineCounts`
   para no abrir un slice nuevo del estado por cada familia. */
function bumpCount(clave, n) {
  const c = getState().routineCounts || {};
  const next = { ...c, [clave]: (c[clave] || 0) + (n === undefined ? 1 : n) };
  setState({ routineCounts: next });
  return next[clave];
}

function getCount(clave) {
  return (getState().routineCounts || {})[clave] || 0;
}

/* Contador que solo vale para HOY. No usa `routineCounts` a proposito: una
   clave por dia lo haria crecer sin techo dentro de localStorage. Guarda
   {fecha, n} y se reinicia solo al cambiar el dia. */
function contarHoy(campo) {
  const hoy = new Date().toDateString();
  const prev = getState()[campo] || {};
  const n = (prev.fecha === hoy ? (prev.n || 0) : 0) + 1;
  setState({ [campo]: { fecha: hoy, n } });
  return n;
}

/* ---------------------------------------------------------------------------
   A QUE MODULO PERTENECE CADA LOGRO (s146b)
   ---------------------------------------------------------------------------
   El problema, reportado por el usuario y reproducido: al acabar una sesion de
   4·7·8 el aviso decia «Primer estiron». La cola de s145 es FIFO y drena gane o
   no gane algo nuevo, asi que **el aviso hablaba siempre de la actividad
   ANTERIOR** — y el logro que si habias ganado respirando se quedaba dentro.

   Regla: **un logro DE MODULO solo se anuncia en una sesion de ese modulo.**
   Los que no son de modulo (rachas, horas del dia, hitos de coleccion,
   efemerides) valen en cualquier sesion: no prometen relacion con lo que
   acabas de hacer, asi que no pueden contradecirla.

   Se declara por PREFIJO y con las excepciones a mano, no por categoria del
   catalogo: `first.breath` y `master.centurion` son de Respira aunque vivan en
   categorias distintas, y `explore.hips` es de Estira pese a llamarse `move.*`
   en los datos (el cruce historico de s15). */
const LOGRO_MODULO = {
  breathe: ['first.breath', 'breathe.sessions.10', 'breathe.sessions.50',
    'master.centurion', 'master.box.15', 'master.coherent.15', 'master.rounds.15',
    'explore.box', 'explore.478', 'explore.coherent', 'explore.rounds',
    'explore.bhastrika', 'explore.nadi', 'explore.ujjayi', 'explore.kapalabhati',
    'explore.physiological', 'explore.all.breathe', 'secret.rain', 'secret.zen'],
  move: ['first.stretch', 'move.sessions.25', 'explore.all.extra'],
  extra: ['first.extra', 'explore.hips', 'explore.shoulders', 'explore.atg',
    'explore.ancestral', 'explore.neck', 'explore.desk', 'explore.all.move',
    'master.atg.20', 'master.hips.20', 'master.shoulders.20',
    'master.ancestral.10', 'master.antidote'],
  focus: ['first.step', 'focus.hours.10', 'focus.hours.50', 'focus.hours.100',
    'master.pomodoro.8', 'master.pomodoro.12', 'master.long.focus',
    'master.focus.day', 'stats.month.focus'],
  hydrate: ['first.sip', 'hydrate.week.perfect', 'master.hydrate.30',
    'master.hydrate.90', 'master.gardener'],
};

/* id -> modulo, invertido una sola vez */
const MODULO_DE_LOGRO = {};
for (const [mod, ids] of Object.entries(LOGRO_MODULO)) {
  for (const id of ids) MODULO_DE_LOGRO[id] = mod;
}

/* ¿Se puede anunciar `id` al cerrar una sesion de `modulo`? Sin modulo
   declarado, el logro es transversal y vale siempre. */
function encajaEnSesion(id, modulo) {
  const suyo = MODULO_DE_LOGRO[id];
  return !suyo || suyo === modulo;
}

/* Cuenta una rutina concreta: su id (para «todas las de Mueve») y su etiqueta
   (para `master.antidote`, 50 sesiones SIT). La etiqueta hay que ir a buscarla
   al catalogo porque las acciones de sesion solo reciben el id. */
function contarRutina(routineId) {
  if (!routineId) return;
  /* Las rutinas PROPIAS llevan id `custom.<Date.now()>`, o sea uno distinto por
     rutina creada y para siempre. Contarlas metia una clave nueva en
     `routineCounts` cada vez —crecimiento SIN TECHO dentro de localStorage— y
     encima no servia para nada: `explore.all.extra` se mide contra el catalogo
     de Mueve, donde una rutina propia no esta. Ni cuentan ni deben. */
  if (routineId.indexOf('custom.') === 0) return;
  bumpCount('rutina.' + routineId);
  const buscar = [window.getMoveRoutine, window.getExtraRoutine];
  for (const fn of buscar) {
    if (typeof fn !== 'function') continue;
    let r = null;
    try { r = fn(routineId); } catch (e) { r = null; }
    if (r && r.tag) { bumpCount('tag.' + r.tag); return; }
  }
}

/* --- minutos de vida, para master.marathon ---------------------------------
   No hay un contador acumulado de minutos: `totalFocusMin` solo cuenta foco, y
   respira/cuerpo viven en la semana en curso y en los agregados de `history`.
   Se suma desde `history.years` (que ya agrega meses) + la semana viva, que
   todavia no ha pasado por el rollover. */
function minutosDeVida() {
  const s = getState();
  const years = (s.history && s.history.years) || {};
  let total = 0;
  for (const y of Object.values(years)) {
    total += (y.focusMinutes || 0) + (y.breathMinutes || 0) + (y.moveMinutes || 0);
  }
  const w = s.weeklyStats || {};
  const suma = arr => (Array.isArray(arr) ? arr.reduce((a, b) => a + (b || 0), 0) : 0);
  total += suma(w.focusMinutes) + suma(w.breathMinutes) + suma(w.moveMinutes);
  return total;
}

/* --- exploracion completa de un modulo -------------------------------------
   «Todas las respiraciones» / «todas las movilidades» / «todos los Extra» se
   resuelven contra los logros `explore.*` que SI tienen detector, no contra el
   numero de rutinas del catalogo: si manana entra una rutina sin logro propio,
   el objetivo no debe moverse solo. */
const EXPLORE_BREATHE = ['explore.box', 'explore.478', 'explore.coherent',
  'explore.rounds', 'explore.bhastrika', 'explore.nadi', 'explore.ujjayi',
  'explore.kapalabhati', 'explore.physiological'];
/* Ojo con los nombres: los ids `move.*` son de ESTIRA y los `extra`/`mueve` se
   cruzaron historicamente (nota de s15 en state-achievements). Estas dos listas
   siguen la etiqueta que ve el usuario, no el prefijo del id. */
const EXPLORE_CUERPO = ['explore.hips', 'explore.shoulders', 'explore.atg',
  'explore.ancestral', 'explore.neck', 'explore.desk'];

function checkExploreCompleto() {
  const a = getState().achievements || {};
  if (EXPLORE_BREATHE.every(id => a[id])) unlockAchievement('explore.all.breathe');
  if (EXPLORE_CUERPO.every(id => a[id])) unlockAchievement('explore.all.move');

  /* «Todos los Extra» no se puede medir con logros `explore.*`: las 6 que hay
     salen TODAS de `completeExtraSession` (Estira) y Mueve no tiene ni uno.
     Se mide entonces contra las rutinas de Mueve realmente completadas, que se
     cuentan una a una en `completeMoveSession`. Guard como el de
     `checkAllPathsCompleted`: si el catalogo aun no ha cargado, no se dispara. */
  const mueve = (typeof window !== 'undefined' && window.MOVE_ROUTINES) || null;
  if (!mueve) return;
  const ids = [];
  for (const grupo of Object.values(mueve)) {
    for (const r of (grupo.items || [])) ids.push(r.id);
  }
  if (ids.length && ids.every(id => getCount('rutina.' + id) > 0)) {
    unlockAchievement('explore.all.extra');
  }
}

/* --- fechas señaladas ------------------------------------------------------
   Solsticios y equinoccios se fijan a fecha civil (no astronomica): el logro
   celebra el dia, no el instante exacto, y una efemeride que cambia de dia
   segun el año seria imposible de explicar en una descripcion de una linea. */
const FECHAS_SENALADAS = {
  'season.solstice.summer': [5, 21],   // 21 de junio
  'season.solstice.winter': [11, 21],  // 21 de diciembre
  'season.equinox.spring':  [2, 20],   // 20 de marzo
  'season.equinox.autumn':  [8, 22],   // 22 de septiembre
  'secret.new.year':        [0, 1],    // 1 de enero
};

function checkFechasSenaladas() {
  const d = new Date();
  const mes = d.getMonth();
  const dia = d.getDate();
  for (const [id, [m, dd]] of Object.entries(FECHAS_SENALADAS)) {
    if (mes === m && dia === dd) unlockAchievement(id);
  }
  /* primer lunes del mes: lunes y el dia cae en la primera semana */
  if (d.getDay() === 1 && dia <= 7) unlockAchievement('secret.first.monday');
}

/* --- secretos de hora y de dosis ------------------------------------------ */
function checkSecretosDeHora() {
  const h = new Date().getHours();
  if (h >= 2 && h < 4) unlockAchievement('secret.night.owl');
  if (h === 14) unlockAchievement('secret.lunch');
}

/* secret.zen — 30 min de respiracion en un mismo dia */
function checkZen() {
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const hoy = (s.weeklyStats.breathMinutes || [])[day] || 0;
  if (hoy >= 30) unlockAchievement('secret.zen');
}

/* --- maestrias que colgaban de contadores inexistentes -------------------- */
function checkMaestriasDeVolumen() {
  const s = getState();
  if ((s.breatheSessionsTotal || 0) >= 100) unlockAchievement('master.centurion');
  if (minutosDeVida() >= 2000) unlockAchievement('master.marathon');
  if (getCount('explore.hips') >= 20) unlockAchievement('master.hips.20');
  if (getCount('explore.shoulders') >= 20) unlockAchievement('master.shoulders.20');
  if (getCount('explore.ancestral') >= 10) unlockAchievement('master.ancestral.10');
  if (getCount('tag.SIT') >= 50) unlockAchievement('master.antidote');
}

/* Una sola vez, al cargar: los ids viejos se llevan su logro al nombre nuevo. */
migrarIdsDeLogro();

Object.assign(window, {
  LOGRO_RENOMBRADO, migrarIdsDeLogro,
  MODULO_DE_LOGRO, encajaEnSesion,
  EXPLORE_REPS, bumpCount, getCount, contarHoy, contarRutina, minutosDeVida,
  EXPLORE_BREATHE, EXPLORE_CUERPO,
  checkExploreCompleto, checkFechasSenaladas, checkSecretosDeHora, checkZen,
  checkMaestriasDeVolumen,
});
