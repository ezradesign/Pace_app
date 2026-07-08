/* PACE · state-entitlement.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Guard central de acceso a contenido (sesion 95 / v0.40.0).

   ÚNICO punto de verdad del entitlement: canAccessRoutine / canAccessPath.
   Hoy derivan del booleano `premiumUnlocked` (state-core). Cuando llegue la
   pre-venta (licencia‖trial — decision F3b, hoy diferida) SOLO cambia este
   archivo: `premiumUnlocked` pasara a derivarse de una clave firmada o de un
   trial, y los consumidores (RoutineCard, PathBreatheStep/PathBodyStep,
   getSuggestedPath) no se tocan.

   Degustacion EXPLICITA: un contexto de degustacion pasa { tasting: true } y
   el guard concede acceso a una rutina premium aunque premiumUnlocked sea
   false. Hoy: los 2 steps premium de path.weekend (nadi.shodhana + atg.knees,
   decision s89 D-8a). Deja de ser una excepcion tacita del catalogo.

   Depende (todo en window, resuelto en tiempo de LLAMADA, no de carga):
     getState (state-core), getBreatheRoutine (BreatheLibrary),
     resolveBodyRoutine + getPath (paths/registry).
*/

/* Resuelve un routineId en cualquiera de las 3 bibliotecas: primero Respira,
   luego Cuerpo (Mueve/Estira via resolveBodyRoutine). Devuelve la rutina o
   null si no existe en ninguna. */
function resolveAnyRoutine(routineId) {
  const b = (window.getBreatheRoutine && window.getBreatheRoutine(routineId)) || null;
  if (b) return b;
  const body = (window.resolveBodyRoutine && window.resolveBodyRoutine(routineId)) || null;
  return body ? body.routine : null;
}

/* canAccessRoutine(routineId, { tasting }) -> boolean
     rutina desconocida  -> true  (fail-open: no es trabajo del guard bloquear
                                    ids que no existen; StepError/lookup ya lo
                                    manejan, y ocultarlos escondería bugs)
     access !== 'premium' -> true
     premium              -> premiumUnlocked || tasting */
function canAccessRoutine(routineId, opts) {
  const tasting = !!(opts && opts.tasting);
  const routine = resolveAnyRoutine(routineId);
  if (!routine) return true;
  if (routine.access !== 'premium') return true;
  const s = getState && getState();
  const unlocked = !!(s && s.premiumUnlocked);
  return unlocked || tasting;
}

/* canAccessPath(pathId) -> boolean
     path desconocido / access !== 'premium' -> true
     premium -> premiumUnlocked
   Hoy los 7 Caminos son access:'free' -> siempre true (sin cambio observable). */
function canAccessPath(pathId) {
  const path = (window.getPath && window.getPath(pathId)) || null;
  if (!path) return true;
  if (path.access !== 'premium') return true;
  const s = getState && getState();
  return !!(s && s.premiumUnlocked);
}

Object.assign(window, { canAccessRoutine, canAccessPath });
