/* PACE · state-hydrate.jsx
   Hidratacion: addWaterGlass, checkHydrateWeekPerfect.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (getState, setState, ensureDayFresh),
               state-achievements (unlockAchievement, checkPlanAchievements,
                                   checkSilentDayAchievement).
*/

/* hydrate.week.perfect — 7 dias consecutivos alcanzando water.goal.
   Ordena waterGoalDates numericamente y verifica 7 entradas seguidas
   separadas exactamente 1 dia (86400000 ms). */
function checkHydrateWeekPerfect() {
  const dates = (getState().waterGoalDates || [])
    .map(d => new Date(d).getTime())
    .sort((a, b) => a - b);
  if (dates.length < 7) return;
  for (let i = dates.length - 1; i >= dates.length - 6; i--) {
    /* Redondeo (s101): los toDateString parseados dan gaps de 23/25h en los
       cambios de hora (DST) -- la igualdad exacta a 24h rompia la cadena. */
    if (Math.round((dates[i] - dates[i - 1]) / 86400000) !== 1) return;
  }
  unlockAchievement('hydrate.week.perfect');
}

function addWaterGlass(delta) {
  if (delta === undefined) delta = 1;
  ensureDayFresh();
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const week = [...s.weeklyStats.waterGlasses];
  week[day] = Math.max(0, (week[day] || 0) + delta);
  const next = Math.max(0, s.water.today + delta);
  setState({
    water: { ...s.water, today: next },
    plan: { ...s.plan, hidratate: next > 0 ? true : s.plan.hidratate },
    weeklyStats: { ...s.weeklyStats, waterGlasses: week },
  });
  if (delta > 0) {
    unlockAchievement('first.sip');
    checkPlanAchievements();
    checkSilentDayAchievement();
    if (getState().water.today >= getState().water.goal) {
      const today = new Date().toDateString();
      const goalDates = Array.isArray(getState().waterGoalDates) ? getState().waterGoalDates : [];
      if (!goalDates.includes(today)) {
        setState({ waterGoalDates: [...goalDates, today].slice(-14) });
        checkHydrateWeekPerfect();
      }
    }
  }
}

Object.assign(window, {
  addWaterGlass,
});
