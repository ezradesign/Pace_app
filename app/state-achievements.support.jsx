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

/* Cuenta una rutina concreta: su id (para «todas las de Mueve») y su etiqueta
   (para `master.antidote`, 50 sesiones SIT). La etiqueta hay que ir a buscarla
   al catalogo porque las acciones de sesion solo reciben el id. */
function contarRutina(routineId) {
  if (!routineId) return;
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

Object.assign(window, {
  EXPLORE_REPS, bumpCount, getCount, contarHoy, contarRutina, minutosDeVida,
  EXPLORE_BREATHE, EXPLORE_CUERPO,
  checkExploreCompleto, checkFechasSenaladas, checkSecretosDeHora, checkZen,
  checkMaestriasDeVolumen,
});
