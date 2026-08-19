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
  /* s146: `master.pomodoro.12` estaba en el catalogo SIN detector — nadie podia
     ganarlo. Cuelga del mismo contador diario que el de 8. */
  if (getState().cycle >= 12) unlockAchievement('master.pomodoro.12');
  /* s146: «Larga sesion» se daba con UN bloque de 45. Ahora cinco: un bloque
     largo es una tarde, cinco es una forma de trabajar. */
  if (focusMinsAtCompletion >= 45 && bumpCount('foco.largo') >= 5) {
    unlockAchievement('master.long.focus');
  }
  checkTimeOfDayAchievements();
  checkSilentDayAchievement();
  updateStreak();
  flushAchievementToast('focus');
}

/* completeFocusSession(context, opts) — punto de entrada unificado del fin de
   una sesion de foco (s96 · motor useCountdown). PRESERVA la distincion
   historica; NO fundir en un solo comportamiento:
     context 'home' -> completePomodoro(): cycle++ + logros de pomodoro
                       (first.step/master.pomodoro.8/master.long.focus). Lee
                       focusMinutes internamente (mismo credito que antes).
     context 'path' -> addFocusMinutes(opts.minutes) + updateStreak(): foco
                       CONTEXTUAL de Camino, SIN cycle ni logros de pomodoro
                       (decision s79/s86). El caller pasa los minutos del step.
   updateStreak se resuelve en runtime (definido en state-achievements, que
   carga despues); el guard typeof lo protege por simetria con el resto. */
function completeFocusSession(context, opts) {
  const mins = (opts && typeof opts.minutes === 'number') ? opts.minutes : 25;
  if (context === 'path') {
    addFocusMinutes(mins);
    if (typeof updateStreak === 'function') updateStreak();
  } else {
    completePomodoro();
  }
  /* s172 · DUAL-WRITE: el evento va DESPUES de la escritura legacy y no puede
     alterarla (`emitSessionCompleted` se traga sus propios fallos). Foco solo
     llega aqui cuando la cuenta atras se agota —salir antes no completa—, asi
     que `completionReason` es SIEMPRE 'natural' (§6.3). El plan es el preset y
     el activo es la propia cuenta: el reloj de `useCountdown` no corre en
     pausa, y lo pausado se queda en `elapsedSeconds` (§6.4). */
  if (typeof emitSessionCompleted === 'function') {
    emitSessionCompleted('focus', paceFocusRoutineId(mins), {
      inPath: context === 'path',
      elapsedSeconds: (opts && opts.elapsedSeconds),
      activeSeconds: (opts && opts.activeSeconds),
      plannedSeconds: mins * 60,
      plannedSecondsSource: 'preset',
      completionReason: 'natural',
    });
  }
}

Object.assign(window, {
  addFocusMinutes,
  completePomodoro,
  completeFocusSession,
});
