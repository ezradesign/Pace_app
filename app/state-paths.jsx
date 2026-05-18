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
      lastViewed: pathId, // s75: rastrea el ultimo Camino abierto
      current: {
        id: pathId,
        stepIndex: 0,
        startedAt: Date.now(),
        skippedSteps: [],
      },
    },
  }));
}

function setLastViewedPath(pathId) {
  setState(s => ({ ...s, paths: { ...s.paths, lastViewed: pathId } }));
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
      /* s78: tras cerrar un Camino, comprobar si el usuario ha completado
         ya los 7 -> desbloquea master.path.all7. Se llama fuera del setState
         para evitar re-entradas (lo dispara el setTimeout(0) de abajo). */
      if (typeof window.checkAllPathsCompleted === 'function') {
        setTimeout(function () {
          try { window.checkAllPathsCompleted(); } catch (e) {}
        }, 0);
      }
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

/* Jerarquia de seleccion (s78):
     1. lastViewed (s75)    -- la preferencia del usuario manda siempre que
                               siga apuntando a un Camino del catalogo vigente.
     2. timeOfDay match     -- en cuanto el usuario nunca abrio uno, sugerir
                               el slot horario actual (morning/midday/afternoon/
                               evening + weekend). Para el sabado/domingo, el
                               slot 'weekend' gana sobre cualquier slot horario.
     3. 'anytime' (s78)     -- fallback que SIEMPRE entra antes del catalog[0]
                               (p.ej. path.breath, sin hora fija).
     4. catalog[0]          -- ultimo recurso, mantiene la garantia de no
                               devolver null si hay al menos un Camino. */
function getSuggestedPath() {
  const s = getState && getState();
  const lv = s && s.paths && s.paths.lastViewed;
  const catalog = (typeof window !== 'undefined' && window.PATH_CATALOG) || [];
  if (!catalog.length) return null;

  // 1. lastViewed
  if (lv) {
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].id === lv) return lv;
    }
  }

  // 2. slot horario actual
  const now = new Date();
  const dow = now.getDay(); // 0 = domingo, 6 = sabado
  const isWeekend = dow === 0 || dow === 6;
  if (isWeekend) {
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].timeOfDay === 'weekend') return catalog[i].id;
    }
  }
  const h = now.getHours();
  let slot;
  if (h < 9)       slot = 'morning';
  else if (h < 13) slot = 'midday';
  else if (h < 17) slot = 'afternoon';
  else if (h < 21) slot = 'evening';
  else             slot = 'evening';
  for (let i = 0; i < catalog.length; i++) {
    if (catalog[i].timeOfDay === slot) return catalog[i].id;
  }

  // 3. 'anytime'
  for (let i = 0; i < catalog.length; i++) {
    if (catalog[i].timeOfDay === 'anytime') return catalog[i].id;
  }

  // 4. catalog[0]
  return catalog[0].id;
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
  setFavoritePath, clearFavoritePath, toggleFavoritePath, setLastViewedPath,
  getPathStats,
});
