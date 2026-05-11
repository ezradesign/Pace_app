/* PACE · state-paths.jsx
   Caminos: CRUD, stats, favoritos.
   Split de state.jsx (sesion 57 / v0.27.5).
   Depende de: state-core (getState, setState, todayISO),
               app/paths/registry.js (window.getPath).
*/

function startPath(pathId) {
  const path = window.getPath && window.getPath(pathId);
  if (!path) return;
  setState(s => ({
    ...s,
    paths: {
      ...s.paths,
      current: {
        id: pathId,
        stepIndex: 0,
        startedAt: Date.now(),
        skippedSteps: [],
      },
    },
  }));
}

function advancePathStep(reason) {
  if (reason === undefined) reason = 'done';
  setState(s => {
    const c = s.paths.current;
    if (!c) return s;
    const path = window.getPath && window.getPath(c.id);
    if (!path) return s;
    const newSkipped = reason === 'skip'
      ? [...c.skippedSteps, c.stepIndex]
      : c.skippedSteps;
    const nextIndex = c.stepIndex + 1;
    if (nextIndex >= path.steps.length) {
      const prev = s.paths.completed[c.id] || { count: 0 };
      return {
        ...s,
        paths: {
          ...s.paths,
          current: null,
          completed: {
            ...s.paths.completed,
            [c.id]: {
              count: prev.count + 1,
              lastDoneAt: todayISO(),
            },
          },
          history: [...(s.paths.history || []), todayISO()],
        },
      };
    }
    return {
      ...s,
      paths: {
        ...s.paths,
        current: { ...c, stepIndex: nextIndex, skippedSteps: newSkipped },
      },
    };
  });
}

function completePath(pathId) {
  setState(s => {
    const prev = s.paths.completed[pathId] || { count: 0 };
    return {
      ...s,
      paths: {
        ...s.paths,
        current: null,
        completed: {
          ...s.paths.completed,
          [pathId]: { count: prev.count + 1, lastDoneAt: todayISO() },
        },
        history: [...(s.paths.history || []), todayISO()],
      },
    };
  });
}

function abandonPath() {
  setState(s => ({
    ...s,
    paths: { ...s.paths, current: null },
  }));
}

function getSuggestedPath(now) {
  if (now === undefined) now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return 'path.weekend';
  const h = now.getHours();
  if (h >= 6  && h <= 11) return 'path.dawn';
  if (h >= 12 && h <= 14) return 'path.midday';
  if (h >= 15 && h <= 17) return 'path.afternoon';
  if (h >= 18 && h <= 22) return 'path.dusk';
  return 'path.dusk';
}

/* ============================
   PATH STATS (sesion 54)
   ============================ */

function computePathStreaks(history) {
  if (!history || history.length === 0) return { currentStreak: 0, bestStreak: 0 };
  const days = new Set(history);
  const sorted = Array.from(days).sort();
  let best = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr - prev) / 86400000);
    if (diff === 1) {
      cur++;
      if (cur > best) best = cur;
    } else if (diff > 1) {
      cur = 1;
    }
  }
  const today = todayISO();
  let cs = 0;
  let check = today;
  while (days.has(check)) {
    cs++;
    const d = new Date(check);
    d.setDate(d.getDate() - 1);
    check = d.toISOString().slice(0, 10);
  }
  return { currentStreak: cs, bestStreak: best };
}

function getPathStats() {
  const s = getState().paths;
  const hist = s.history || [];
  const total = hist.length;
  const byPath = {};
  for (const id in (s.completed || {})) {
    byPath[id] = {
      count: s.completed[id].count || 0,
      lastDoneAt: s.completed[id].lastDoneAt || null,
    };
  }
  const streaks = computePathStreaks(hist);
  return { total, byPath, ...streaks };
}

function setFavoritePath(pathId) {
  setState(s => ({ ...s, paths: { ...s.paths, favorite: pathId } }));
}

function clearFavoritePath() {
  setState(s => ({ ...s, paths: { ...s.paths, favorite: null } }));
}

function toggleFavoritePath(pathId) {
  const current = getState().paths && getState().paths.favorite;
  if (current === pathId) clearFavoritePath();
  else setFavoritePath(pathId);
}

Object.assign(window, {
  startPath, advancePathStep, completePath, abandonPath, getSuggestedPath,
  setFavoritePath, clearFavoritePath, toggleFavoritePath,
  getPathStats,
});
