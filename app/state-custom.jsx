/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-custom.jsx — rutinas custom del constructor premium (F7 · s93).
   CRUD sobre state.customRoutines (localStorage pace.state.v2), siguiendo
   el split por dominio de la sesión 57.
   Depende de: state-core (getState, setState).

   Shape de rutina custom:
     { id: 'custom.<Date.now()>', name, steps: [{ name, dur, cue }],
       min, createdAt, updatedAt }
   `steps` usa el mismo shape que las rutinas de catálogo — el runner
   (MoveSession) no distingue. `min` se deriva al guardar (ceil de la
   suma de dur). El prefijo `custom.` nunca colisiona con los ids
   blindados `extra.*` / `move.*`, y al no estar en ningún mapa de
   logros (exploreMap, BREATH_ROUTINE_CATEGORIES) una sesión custom
   solo acredita lo genérico de completeMoveSession. */

const CUSTOM_LIMITS = {
  maxRoutines: 10,
  minSteps: 1,
  maxSteps: 12,
  minDur: 10,   // segundos por paso
  maxDur: 120,
  durStep: 5,
  maxNameLen: 40,
};

/* Lectura defensiva: instalaciones previas a v0.38.0 no tienen la key
   (loadState la cubre via defaultState, pero un import de JSON viejo
   podría reintroducir un estado sin ella o corrupto). */
function getCustomRoutines() {
  const list = getState().customRoutines;
  return Array.isArray(list) ? list : [];
}

function getCustomRoutine(id) {
  return getCustomRoutines().find(r => r.id === id) || null;
}

/* Normaliza el borrador del constructor a los límites. */
function sanitizeCustomRoutine(draft) {
  const name = String(draft.name || '').trim().slice(0, CUSTOM_LIMITS.maxNameLen) || 'Rutina propia';
  const steps = (Array.isArray(draft.steps) ? draft.steps : [])
    .slice(0, CUSTOM_LIMITS.maxSteps)
    .map(s => ({
      name: String(s.name || ''),
      dur: Math.min(CUSTOM_LIMITS.maxDur, Math.max(CUSTOM_LIMITS.minDur,
        Math.round((Number(s.dur) || 30) / CUSTOM_LIMITS.durStep) * CUSTOM_LIMITS.durStep)),
      cue: String(s.cue || ''),
    }));
  const totalSec = steps.reduce((acc, s) => acc + s.dur, 0);
  const min = Math.max(1, Math.ceil(totalSec / 60));
  return { name, steps, min };
}

/* Crea una rutina. Devuelve la rutina o null si no pasa los límites. */
function addCustomRoutine(draft) {
  if (getCustomRoutines().length >= CUSTOM_LIMITS.maxRoutines) return null;
  const clean = sanitizeCustomRoutine(draft);
  if (clean.steps.length < CUSTOM_LIMITS.minSteps) return null;
  const now = Date.now();
  const routine = { id: `custom.${now}`, ...clean, createdAt: now, updatedAt: now };
  setState(s => ({
    ...s,
    customRoutines: [...(Array.isArray(s.customRoutines) ? s.customRoutines : []), routine],
  }));
  return routine;
}

/* Edita una rutina existente. Devuelve la rutina o null. */
function updateCustomRoutine(id, draft) {
  const clean = sanitizeCustomRoutine(draft);
  if (clean.steps.length < CUSTOM_LIMITS.minSteps) return null;
  if (!getCustomRoutine(id)) return null;
  let updated = null;
  setState(s => ({
    ...s,
    customRoutines: (Array.isArray(s.customRoutines) ? s.customRoutines : []).map(r => {
      if (r.id !== id) return r;
      updated = { ...r, ...clean, updatedAt: Date.now() };
      return updated;
    }),
  }));
  return updated;
}

function deleteCustomRoutine(id) {
  setState(s => ({
    ...s,
    customRoutines: (Array.isArray(s.customRoutines) ? s.customRoutines : []).filter(r => r.id !== id),
  }));
}

Object.assign(window, {
  CUSTOM_LIMITS,
  getCustomRoutines, getCustomRoutine,
  addCustomRoutine, updateCustomRoutine, deleteCustomRoutine,
});
