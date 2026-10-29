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
   (MoveSession) no distingue. `min` se deriva al guardar (`customSegundos`:
   un paso por lados cuenta sus dos lados). El `mode` no se guarda: lo pone
   `moveRutinaGuiada` al abrirla, con el registro de ejercicios. El prefijo `custom.` nunca colisiona con los ids
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

/* Una rutina necesita al menos un paso que no sea «Descanso»: solo con descansos se guardaba y,
   hecha, contaba como Mueve sin ningún ejercicio (auditoría del 21 oct.). */
function customTieneTrabajo(steps) {
  return (Array.isArray(steps) ? steps : []).some(s => s && s.name && s.name !== 'Descanso');
}

/* Lo que dura de verdad: un paso por lados es su tiempo por cada lado más el cambio, como lo
   estima el runner (`estimateDuration`). */
function customSegundos(steps) {
  const lados = (n) => typeof window.ejercicioPorLados === 'function' && window.ejercicioPorLados(n);
  const cambio = window.V1_CHANGE_SECONDS || 10;
  return (Array.isArray(steps) ? steps : []).reduce((acc, s) => acc + (lados(s.name) ? s.dur * 2 + cambio : s.dur), 0);
}

/* LOS MINUTOS DE UNA RUTINA PROPIA, los mismos en la tarjeta, el constructor y la vista previa
   (revisión de ChatGPT del 28 oct., C2: la tarjeta contaba solo el trabajo y la vista previa le
   sumaba la preparación y las colocaciones; 12 pasos de 40 s eran 8 min y 9). Se mide la rutina
   preparada para el runner (`moveRutinaGuiada`) con `estimateDuration`, como el catálogo; antes
   de que eso cargue, el trabajo solo. Los pasos propios van con reloj, así que no hay rango. */
function customMinutos(steps) {
  const lista = Array.isArray(steps) ? steps.filter(s => s && s.name) : [];
  let seg = customSegundos(lista);
  if (lista.length && typeof window.moveRutinaGuiada === 'function' && typeof window.estimateDuration === 'function') {
    const descanso = (getState() || {}).restBetweenSets;
    seg = window.estimateDuration(window.moveRutinaGuiada({ id: 'custom.medida', steps: lista }), descanso).maxSec;
  }
  return Math.max(1, Math.ceil(seg / 60));
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
  const min = customMinutos(steps);
  return { name, steps, min };
}

/* Crea una rutina. Devuelve la rutina o null si no pasa los límites. */
function addCustomRoutine(draft) {
  if (getCustomRoutines().length >= CUSTOM_LIMITS.maxRoutines) return null;
  const clean = sanitizeCustomRoutine(draft);
  if (clean.steps.length < CUSTOM_LIMITS.minSteps || !customTieneTrabajo(clean.steps)) return null;
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
  if (clean.steps.length < CUSTOM_LIMITS.minSteps || !customTieneTrabajo(clean.steps)) return null;
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
  CUSTOM_LIMITS, customTieneTrabajo, customSegundos, customMinutos,
  getCustomRoutines, getCustomRoutine,
  addCustomRoutine, updateCustomRoutine, deleteCustomRoutine,
});
