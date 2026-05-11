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

function checkPlanAchievements() {
  const s = getState();
  const p = s.plan || {};
  if (p.muevete && p.respira && p.extra && p.hidratate) {
    unlockAchievement('first.ritual');
    unlockAchievement('first.plan');
  }
}

/* master.dawn / master.dusk / morning.5 */
function checkTimeOfDayAchievements() {
  const now = new Date();
  const h = now.getHours();
  if (h < 7)  unlockAchievement('master.dawn');
  if (h >= 21) unlockAchievement('master.dusk');
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
}

/* master.collector.half / master.collector.full */
function checkCollectorAchievements() {
  const count = Object.keys(getState().achievements).length;
  if (count >= 50)  unlockAchievement('master.collector.half');
  if (count >= 100) unlockAchievement('master.collector.full');
}

/* master.silent.day */
function checkSilentDayAchievement() {
  const s = getState();
  if (s.soundOn) return;
  const today = new Date().toDateString();
  const list = Array.isArray(s.silentDates) ? s.silentDates : [];
  if (!list.includes(today)) {
    setState({ silentDates: [...list, today].slice(-30) });
    unlockAchievement('master.silent.day');
  }
}

/* Contadores por tipo de rutina (master.box.10, coherent.10, rounds.10, atg.20). */
function checkRoutineCountAchievements(category) {
  const c = getState().routineCounts || {};
  if (category === 'box'      && (c.box      || 0) >= 10) unlockAchievement('master.box.10');
  if (category === 'coherent' && (c.coherent || 0) >= 10) unlockAchievement('master.coherent.10');
  if (category === 'rounds'   && (c.rounds   || 0) >= 10) unlockAchievement('master.rounds.10');
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

  if (Object.values(months).some(m => m.focusMinutes >= 600)) {
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

/* master.retreat — breathMinutes[day] + moveMinutes[day] >= 120 */
function checkRetreatAchievement() {
  const s = getState();
  const day = new Date().getDay();
  const todayBreath = (s.weeklyStats.breathMinutes || [])[day] || 0;
  const todayMove   = (s.weeklyStats.moveMinutes   || [])[day] || 0;
  if (todayBreath + todayMove >= 120) unlockAchievement('master.retreat');
}

function unlockAchievement(id, note) {
  const s = getState();
  if (s.achievements[id]) return false;
  setState({
    achievements: { ...s.achievements, [id]: { unlockedAt: Date.now(), note } }
  });
  showToast({ id, type: 'achievement' });
  checkCollectorAchievements();
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
  if (current >= 1)   unlockAchievement('first.day');
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
  const day = new Date().getDay();
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
  if (explorationMap[routineId]) unlockAchievement(explorationMap[routineId]);
  checkRetreatAchievement();
  checkSilentDayAchievement();
  const breathCat = BREATH_ROUTINE_CATEGORIES[routineId];
  if (breathCat) {
    const c = getState().routineCounts || {};
    setState({ routineCounts: { ...c, [breathCat]: (c[breathCat] || 0) + 1 } });
    checkRoutineCountAchievements(breathCat);
  }
  updateStreak();
}

function completeMoveSession(routineId, durationMin) {
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.moveMinutes];
  week[day] += durationMin;
  setState({
    plan: { ...s.plan, muevete: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
    moveSessionsTotal: (s.moveSessionsTotal || 0) + 1,
  });
  unlockAchievement('first.stretch');
  if (getState().moveSessionsTotal >= 25) unlockAchievement('move.sessions.25');
  checkPlanAchievements();
  checkTimeOfDayAchievements();
  checkRetreatAchievement();
  checkSilentDayAchievement();
  updateStreak();
}

function completeExtraSession(routineId, durationMin) {
  if (durationMin === undefined) durationMin = 0;
  ensureDayFresh();
  const s = getState();
  const day = new Date().getDay();
  const week = [...s.weeklyStats.moveMinutes];
  if (durationMin > 0) week[day] += durationMin;
  setState({
    plan: { ...s.plan, extra: true },
    weeklyStats: { ...s.weeklyStats, moveMinutes: week },
  });
  unlockAchievement('first.extra');
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
  if (exploreMap[routineId]) unlockAchievement(exploreMap[routineId]);
  checkRetreatAchievement();
  checkSilentDayAchievement();
  if (routineId === 'move.atg.knees') {
    const c = getState().routineCounts || {};
    setState({ routineCounts: { ...c, atg: (c.atg || 0) + 1 } });
    checkRoutineCountAchievements('atg');
  }
  updateStreak();
}

Object.assign(window, {
  unlockAchievement,
  completeBreathSession,
  completeMoveSession,
  completeExtraSession,
  updateStreak,
  checkStatsAchievements,
});
