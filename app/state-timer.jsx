/* PACE · state-timer.jsx
   Foco / Pomodoro: addFocusMinutes, completePomodoro.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (getState, setState, ensureDayFresh),
               state-achievements (unlockAchievement, checkTimeOfDayAchievements,
                                   checkSilentDayAchievement, updateStreak).
*/

function checkFocusDayAchievement() {
  const s = getState();
  const day = getDayIndexMondayFirst(new Date());
  const todayMin = (s.weeklyStats.focusMinutes || [])[day] || 0;
  if (todayMin >= 240) unlockAchievement('master.focus.day');
}

function addFocusMinutes(mins) {
  ensureDayFresh();
  setState(prev => {
    const day = getDayIndexMondayFirst(new Date());
    const week = [...prev.weeklyStats.focusMinutes];
    week[day] += mins;
    return {
      ...prev,
      totalFocusMin: prev.totalFocusMin + mins,
      weeklyStats: { ...prev.weeklyStats, focusMinutes: week },
    };
  });
  const h = getState().totalFocusMin / 60;
  if (h >= 10)  unlockAchievement('focus.hours.10');
  if (h >= 50)  unlockAchievement('focus.hours.50');
  if (h >= 100) unlockAchievement('focus.hours.100');
  checkFocusDayAchievement();
}

function completePomodoro() {
  ensureDayFresh();
  const focusMinsAtCompletion = getState().focusMinutes;
  setState(prev => ({ ...prev, cycle: prev.cycle + 1 }));
  addFocusMinutes(focusMinsAtCompletion);
  unlockAchievement('first.step');
  if (getState().cycle >= 8) unlockAchievement('master.pomodoro.8');
  if (focusMinsAtCompletion >= 45) unlockAchievement('master.long.focus');
  checkTimeOfDayAchievements();
  checkSilentDayAchievement();
  updateStreak();
}

Object.assign(window, {
  addFocusMinutes,
  completePomodoro,
});
