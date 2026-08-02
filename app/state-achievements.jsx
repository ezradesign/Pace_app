/* PACE · state-achievements.jsx
   Logros: unlockAchievement, detectores, complete*Session, updateStreak.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (getState, setState, showToast, ensureDayFresh).
*/

/* Mapa routineId → categoria para contadores de tipo de rutina. */
const BREATH_ROUTINE_CATEGORIES = {
  'breathe.box.4':          'box',
  'breathe.box.6':          'box',
  'breathe.coherent.55':    'coherent',
  'breathe.coherent.66':    'coherent',
  'breathe.rounds.full':    'rounds',
  'breathe.rounds.express': 'rounds',
};

/* first.ritual (4 modulos en un dia) y first.plan (completar el plan) tenian
   la MISMA condicion — s146 lo midio: caian siempre juntos y eran dos de los
   once del primer dia. Ahora `first.plan` pide sostenerlo TRES dias, que es lo
   que distingue «lo hice» de «asi es como uso esto». */
const PLAN_DIAS_PARA_LOGRO = 3;

function checkPlanAchievements() {
  const s = getState();
  const p = s.plan || {};
  /* `first.day` se comprueba AQUI y no en `updateStreak`: updateStreak retorna
     pronto cuando el dia ya esta marcado, asi que solo corria en la primera
     actividad de la jornada — momento en el que el plan tiene UNA marca y la
     condicion de dos nunca se cumplia. El banco de `scripts/audit/logros.js` lo
     cazo: el logro no se ganaba ni con un año de uso exhaustivo. */
  checkPrimerDiaDeVerdad();
  if (!(p.muevete && p.respira && p.extra && p.hidratate)) return;
  unlockAchievement('first.ritual');
  const hoy = new Date().toDateString();
  const list = Array.isArray(s.planDates) ? s.planDates : [];
  if (!list.includes(hoy)) {
    const next = [...list, hoy].slice(-30);
    setState({ planDates: next });
    if (next.length >= PLAN_DIAS_PARA_LOGRO) unlockAchievement('first.plan');
  } else if (list.length >= PLAN_DIAS_PARA_LOGRO) {
    unlockAchievement('first.plan');
  }
}

/* master.dawn / master.dusk / morning.5 + secretos de hora.
   s146: `dawn` y `dusk` estaban en «maestria» pidiendo UNA sesion — una sola
   sesion no es maestria de nada. Pasan a 5 dias distintos, el mismo criterio
   que ya usaba `morning.5` a su lado. Se cuentan DIAS, no sesiones: tres
   respiraciones seguidas a las 6:50 son una madrugada, no tres. */
const DAWN_DIAS = 5;
const DUSK_DIAS = 5;

function marcaDia(campo, limite) {
  const hoy = new Date().toDateString();
  const s = getState();
  const list = Array.isArray(s[campo]) ? s[campo] : [];
  if (list.includes(hoy)) return list.length;
  const next = [...list, hoy].slice(-limite * 3);
  setState({ [campo]: next });
  return next.length;
}

function checkTimeOfDayAchievements() {
  const now = new Date();
  const h = now.getHours();
  if (h < 7 && marcaDia('dawnDates', DAWN_DIAS) >= DAWN_DIAS) unlockAchievement('master.dawn');
  if (h >= 21 && marcaDia('duskDates', DUSK_DIAS) >= DUSK_DIAS) unlockAchievement('master.dusk');
  if (h < 9) {
    const today = now.toDateString();
    const s = getState();
    const list = Array.isArray(s.morningDates) ? s.morningDates : [];
    if (!list.includes(today)) {
      const next = [...list, today].slice(-30);
      setState({ morningDates: next });
      if (next.length >= 5) unlockAchievement('morning.5');
    }
  }
  checkSecretosDeHora();
  checkFechasSenaladas();
}

/* master.collector.half / master.collector.full.
   s146 MIDIO que `full` era IMPOSIBLE: pedia 100 logros y solo 69 tenian
   detector, asi que estaba declarado como implementado sin poder ganarse nunca
   (el caso exacto del §3.4). Los umbrales siguen siendo FIJOS —decision s90:
   un denominador por catalogo se distorsiona al crecer— pero ahora por debajo
   del techo real. Si algun dia se añaden detectores, estos numeros suben con
   ellos A MANO: es el precio de que sean fijos, y esta anotado a proposito. */
const COLLECTOR_HALF = 45;
const COLLECTOR_FULL = 75;

function checkCollectorAchievements() {
  const count = Object.keys(getState().achievements).length;
  if (count >= COLLECTOR_HALF) unlockAchievement('master.collector.half');
  if (count >= COLLECTOR_FULL) unlockAchievement('master.collector.full');
}

/* master.silent.day — s146: pedia UN dia con el sonido apagado, que es un
   ajuste, no una maestria. Ahora cinco. */
const SILENT_DIAS = 5;

function checkSilentDayAchievement() {
  const s = getState();
  if (s.soundOn) return;
  const today = new Date().toDateString();
  const list = Array.isArray(s.silentDates) ? s.silentDates : [];
  if (!list.includes(today)) {
    const next = [...list, today].slice(-30);
    setState({ silentDates: next });
    if (next.length >= SILENT_DIAS) unlockAchievement('master.silent.day');
  } else if (list.length >= SILENT_DIAS) {
    unlockAchievement('master.silent.day');
  }
}

/* Contadores por tipo de rutina (master.box.15, coherent.15, rounds.15, atg.20).
   s146: los tres de respiracion suben de 10 a 15. Con uso diario de una tecnica
   los 10 caian dentro del primer mes, a la vez que media categoria de
   constancia; 15 los separa sin volverlos remotos. `atg.20` se queda: ya pedia
   repeticion de verdad. */
const MASTER_BREATH_REPS = 15;

function checkRoutineCountAchievements(category) {
  const c = getState().routineCounts || {};
  if (category === 'box'      && (c.box      || 0) >= MASTER_BREATH_REPS) unlockAchievement('master.box.15');
  if (category === 'coherent' && (c.coherent || 0) >= MASTER_BREATH_REPS) unlockAchievement('master.coherent.15');
  if (category === 'rounds'   && (c.rounds   || 0) >= MASTER_BREATH_REPS) unlockAchievement('master.rounds.15');
  if (category === 'atg'      && (c.atg      || 0) >= 20) unlockAchievement('master.atg.20');
}

/* Detectores de logros de Estadisticas (sesion 46).
   Llamado desde ensureDayFresh() despues de un rollover. */
function checkStatsAchievements() {
  const { history } = getState();
  const days   = history.days   || {};
  const months = history.months || {};

  const monthDayCounts = {};
  Object.keys(days).forEach(d => {
    const mk = d.slice(0, 7);
    monthDayCounts[mk] = (monthDayCounts[mk] || 0) + 1;
  });
  if (Object.values(monthDayCounts).some(n => n >= 20)) {
    unlockAchievement('stats.month.first');
  }

  /* s146: 600 min/mes («diez horas») se alcanzaban en SEIS dias con cuatro
     pomodoros diarios — un logro mensual que caia dentro de la primera semana.
     1200 (veinte horas) lo devuelve a la escala de un mes. La descripcion del
     catalogo se corrige en el mismo cambio. */
  if (Object.values(months).some(m => m.focusMinutes >= 1200)) {
    unlockAchievement('stats.month.focus');
  }

  const yearMonthCounts = {};
  Object.keys(months).forEach(k => {
    const yr = k.slice(0, 4);
    yearMonthCounts[yr] = (yearMonthCounts[yr] || 0) + 1;
  });
  if (Object.values(yearMonthCounts).some(n => n >= 12)) {
    unlockAchievement('stats.year.first');
  }
}

/* master.path.all7 (s78) — desbloquea cuando el usuario ha completado al
   menos UNA vez cada uno de los Caminos del catalogo (count >= 1 en cada
   entrada de paths.completed). El guard catalog.length >= 7 evita que se
   dispare antes de tiempo si en el futuro reducimos el catalogo. */
function checkAllPathsCompleted() {
  const s = getState();
  const catalog = (typeof window !== 'undefined' && window.PATH_CATALOG) || [];
  if (catalog.length < 7) return;
  const compl = (s.paths && s.paths.completed) || {};
  for (let i = 0; i < catalog.length; i++) {
    const entry = compl[catalog[i].id];
    if (!entry || (entry.count || 0) < 1) return;
  }
  unlockAchievement('master.path.all7');
}

/* first.day — un dia con DOS actividades distintas del plan. Antes bastaba con
   existir; el nombre del logro («Primer dia») no cambia, cambia lo que cuenta
   como dia. */
function checkPrimerDiaDeVerdad() {
  const p = getState().plan || {};
  const hechas = ['muevete', 'respira', 'extra', 'hidratate'].filter(k => p[k]).length;
  if (hechas >= 2) unlockAchievement('first.day');
}

/* master.retreat — breathMinutes[day] + moveMinutes[day] >= 120 */
function checkRetreatAchievement() {
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const todayBreath = (s.weeklyStats.breathMinutes || [])[day] || 0;
  const todayMove   = (s.weeklyStats.moveMinutes   || [])[day] || 0;
  if (todayBreath + todayMove >= 120) unlockAchievement('master.retreat');
}

/* ENTREGA ESCALONADA (s145 · Fase 2.5) — decisión del usuario: **uno por
   sesión**, el resto en cola invisible.

   EL PROBLEMA, MEDIDO: una primera sesión de Respira a las 6:50 desbloqueaba
   CUATRO logros de golpe, con sus cuatro toasts en cascada — `first.breath`
   (siempre) + `explore.<tipo>` (lo tienen 12 de las 20 rutinas) + `master.dawn`
   (antes de las 7) + `first.day` (`updateStreak` lo da con `current >= 1`). Con
   el plan del día completo entraban además `first.ritual` y `first.plan`. Es
   literalmente el «con hacer media cosa ya consigues 4 logros seguidos» que
   reportó el usuario.

   LO QUE NO CAMBIA: el logro se GANA en el momento y queda registrado en
   `achievements` al instante. Solo se aplaza el AVISO. Nada se pierde, nadie
   ve progreso retroceder — la regla §2.5 «progreso sin culpa» queda intacta.

   La cola se PERSISTE (`achievementQueue`) porque si viviera en memoria, una
   recarga se comería las celebraciones pendientes: el logro seguiría ahí, pero
   nunca se anunciaría. Se drena en los cierres de sesión, UNO por vez.
   Precedente: los toasts aplazados durante un Camino (s105). */
function unlockAchievement(id, note) {
  const s = getState();
  if (s.achievements[id]) return false;
  setState({
    achievements: { ...s.achievements, [id]: { unlockedAt: Date.now(), note } },
    achievementQueue: [...(s.achievementQueue || []), id],
  });
  checkCollectorAchievements();
  return true;
}

/* Saca UNO de la cola y lo celebra. Se llama al cerrar una sesión, gane o no
   gane un logro nuevo: si no drenara también sin desbloqueos, una cola de tres
   se quedaría esperando para siempre a que hubiera un cuarto.

   s146b — EL AVISO TIENE QUE HABLAR DE ESTA SESIÓN. Reportado por el usuario y
   reproducido: al acabar 4·7·8 salía «Primer estirón», porque la cola es FIFO y
   drenaba lo más antiguo — el logro de la sesión anterior. Ahora se recorre la
   cola y se coge **el primero que encaje con el módulo**; lo que no encaja NO se
   pierde ni se adelanta, se queda esperando a una sesión suya. Los logros
   transversales (rachas, horas del día, hitos de colección) no declaran módulo y
   siguen valiendo en cualquier sesión: no prometen relación con la actividad.

   `modulo` sin valor = superficie que no es de módulo (agua desde la home): se
   comporta como antes y drena lo más antiguo que encaje. */
function flushAchievementToast(modulo) {
  const q = getState().achievementQueue || [];
  if (!q.length) return false;
  /* DOS PASADAS, y el orden importa. Primero lo que es DE ESTE modulo; solo si
     no hay nada suyo, un transversal. Con una sola pasada FIFO los transversales
     —que son mas antiguos y encajan en todo— se colaban por delante: al acabar
     4·7·8 salia «Primer dia» y «Primer aliento» se quedaba en la cola. Sigue
     habiendo un solo aviso por sesion (§16.2); lo que cambia es cual. */
  let i = modulo ? q.findIndex(id => MODULO_DE_LOGRO[id] === modulo) : -1;
  if (i === -1) i = q.findIndex(id => encajaEnSesion(id, modulo));
  if (i === -1) return false;
  const siguiente = q[i];
  setState({ achievementQueue: q.filter((_, n) => n !== i) });
  showToast({ id: siguiente, type: 'achievement' });
  return true;
}

function updateStreak() {
  const s = getState();
  const today = new Date().toDateString();
  const last = s.streak.lastActiveDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  let current = s.streak.current;
  if (last === yesterday) current += 1;
  else current = 1;
  const longest = Math.max(s.streak.longest, current);
  setState({ streak: { current, longest, lastActiveDate: today } });
  /* s146: `first.day` ya no cuelga de aqui. Se daba con `current >= 1`, o sea
     en la PRIMERA sesion de la vida, cayendo junto a `first.breath` sin
     significar nada distinto. Ahora pide un dia de verdad (dos actividades) y
     se comprueba en `checkPlanAchievements`, que es quien ve el plan al dia. */
  if (current >= 3)   unlockAchievement('streak.3');
  if (current >= 7)   unlockAchievement('streak.7');
  if (current >= 14)  unlockAchievement('streak.14');
  if (current >= 30)  { unlockAchievement('streak.30'); unlockAchievement('stats.streak.30'); }
  if (current >= 60)  unlockAchievement('streak.60');
  if (current >= 100) unlockAchievement('streak.100');
  if (current >= 365) unlockAchievement('streak.365');
}

/* ============================
   ACCIONES DE SESION
   ============================ */

function completeBreathSession(routineId, durationMin) {
  ensureDayFresh();
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const week = [...s.weeklyStats.breathMinutes];
  week[day] += durationMin;
  setState({
    plan: { ...s.plan, respira: true },
    weeklyStats: { ...s.weeklyStats, breathMinutes: week },
    breatheSessionsTotal: (s.breatheSessionsTotal || 0) + 1,
  });
  unlockAchievement('first.breath');
  if (getState().breatheSessionsTotal >= 10) unlockAchievement('breathe.sessions.10');
  if (getState().breatheSessionsTotal >= 50) unlockAchievement('breathe.sessions.50');
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  const explorationMap = {
    'breathe.box.4':          'explore.box',
    'breathe.box.6':          'explore.box',
    'breathe.478':            'explore.478',
    'breathe.coherent.55':    'explore.coherent',
    'breathe.coherent.66':    'explore.coherent',
    'breathe.rounds.full':    'explore.rounds',
    'breathe.rounds.express': 'explore.rounds',
    'breathe.bellows':        'explore.bhastrika',
    'breathe.nadi.shodhana':  'explore.nadi',
    'breathe.ujjayi':         'explore.ujjayi',
    'breathe.kapalabhati':    'explore.kapalabhati',
    'breathe.physiological':  'explore.physiological',
  };
  /* s146: explorar deja de ser «lo probe una vez». El logro de una tecnica
     llega a la TERCERA sesion de esa tecnica — asi `explore.*` deja de caer el
     mismo dia que `first.breath` y la categoria de exploracion (16 de 16 eran
     de un solo uso) empieza a pedir algo. */
  const exploreId = explorationMap[routineId];
  if (exploreId && bumpCount(exploreId) >= EXPLORE_REPS) unlockAchievement(exploreId);
  checkExploreCompleto();
  checkMaestriasDeVolumen();
  checkZen();
  /* secret.rain — tres respiraciones el mismo dia */
  if (contarHoy('respiraHoy') >= 3) unlockAchievement('secret.rain');
  checkRetreatAchievement();
  checkSilentDayAchievement();
  const breathCat = BREATH_ROUTINE_CATEGORIES[routineId];
  if (breathCat) {
    const c = getState().routineCounts || {};
    setState({ routineCounts: { ...c, [breathCat]: (c[breathCat] || 0) + 1 } });
    checkRoutineCountAchievements(breathCat);
  }
  updateStreak();
  flushAchievementToast('breathe');
}

function completeMoveSession(routineId, durationMin) {
  ensureDayFresh();
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const week = [...s.weeklyStats.moveMinutes];
  week[day] += durationMin;
  setState({
    plan: { ...s.plan, muevete: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
    moveSessionsTotal: (s.moveSessionsTotal || 0) + 1,
  });
  unlockAchievement('first.stretch');
  if (getState().moveSessionsTotal >= 25) unlockAchievement('move.sessions.25');
  contarRutina(routineId);
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  checkExploreCompleto();
  checkMaestriasDeVolumen();
  checkRetreatAchievement();
  checkSilentDayAchievement();
  updateStreak();
  flushAchievementToast('move');
}

function completeExtraSession(routineId, durationMin) {
  if (durationMin === undefined) durationMin = 0;
  ensureDayFresh();
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const week = [...s.weeklyStats.moveMinutes];
  if (durationMin > 0) week[day] += durationMin;
  setState({
    plan: { ...s.plan, extra: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
  });
  unlockAchievement('first.extra');
  contarRutina(routineId);
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  /* NOTA (sesion 15): rutinas de movilidad pasaron de MOVE a EXTRA_ROUTINES.
     Los ids move.* se conservan como identificadores estables. */
  const exploreMap = {
    'move.hips.5':      'explore.hips',
    'move.shoulders.5': 'explore.shoulders',
    'move.atg.knees':   'explore.atg',
    'move.ancestral':   'explore.ancestral',
    'move.neck.3':      'explore.neck',
    'move.desk.quick':  'explore.desk',
  };
  /* misma regla que en Respira: tercera vez, no primera (s146) */
  const exploreId = exploreMap[routineId];
  if (exploreId && bumpCount(exploreId) >= EXPLORE_REPS) unlockAchievement(exploreId);
  checkExploreCompleto();
  checkMaestriasDeVolumen();
  checkRetreatAchievement();
  checkSilentDayAchievement();
  if (routineId === 'move.atg.knees') {
    const c = getState().routineCounts || {};
    setState({ routineCounts: { ...c, atg: (c.atg || 0) + 1 } });
    checkRoutineCountAchievements('atg');
  }
  updateStreak();
  flushAchievementToast('extra');
}

Object.assign(window, {
  unlockAchievement,
  flushAchievementToast,
  completeBreathSession,
  completeMoveSession,
  completeExtraSession,
  updateStreak,
  checkStatsAchievements,
  checkAllPathsCompleted,
});
