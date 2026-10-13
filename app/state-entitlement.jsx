/* PACE · state-entitlement.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Guard central de acceso a contenido (sesion 95 / v0.40.0).

   ÚNICO punto de verdad del entitlement: canAccessRoutine / canAccessPath /
   hasPremiumEntitlement. Abren PACE completo dos cosas: el booleano
   `premiumUnlocked` (state-core, sin ruta de compra todavía) y un CÓDIGO
   firmado que vale (`paceLicenciaVigente`, state-licencia.js: el de los
   testers, y mañana el de quien compre en la web). Cuando llegue Play Billing
   entra aquí como una tercera fuente, y los consumidores (RoutineCard,
   CustomRoutines, PathBreatheStep/PathBodyStep, getSuggestedPath) no se tocan.

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

/* ¿Hay un código de PACE completo que vale? Se lee de `window` al llamarse: el
   guard carga después de state-licencia, pero el artefacto son scripts sueltos. */
function tieneLicenciaPremium() {
  return !!(window.paceLicenciaVigente && window.paceLicenciaVigente());
}

/* HASTA v1, LAS RUTINAS PREMIUM ESTAN ABIERTAS PARA TODOS. Decision de Ez (6 oct.
   2026): el cobro llega despues de cerrar Android, y asi los testers de la prueba
   cerrada las prueban todas. Siguen con su «Premium», que dice que seran de pago,
   pero sin «Pronto» y se pueden empezar. Solo las RUTINAS: el constructor de
   rutinas propias sigue cerrado (`hasPremiumEntitlement`). Cuando llegue el cobro,
   a `false`. Se lee de `window` en cada llamada porque las pruebas lo apagan para
   medir el candado. */
const PREMIUM_ABIERTO_HASTA_V1 = true;

/* canAccessRoutine(routineId, { tasting }) -> boolean
     rutina desconocida  -> true  (fail-open: no es trabajo del guard bloquear
                                    ids que no existen; StepError/lookup ya lo
                                    manejan, y ocultarlos escondería bugs)
     access !== 'premium' -> true
     premium              -> premiumUnlocked || código || tasting || abierto hasta v1 */
function canAccessRoutine(routineId, opts) {
  const tasting = !!(opts && opts.tasting);
  const routine = resolveAnyRoutine(routineId);
  if (!routine) return true;
  if (routine.access !== 'premium') return true;
  const s = getState && getState();
  const unlocked = !!(s && s.premiumUnlocked) || tieneLicenciaPremium();
  return unlocked || tasting || window.PREMIUM_ABIERTO_HASTA_V1 === true;
}

/* canAccessPath(pathId) -> boolean
     path desconocido / access !== 'premium' -> true
     premium -> premiumUnlocked || código
   Hoy los 7 Caminos son access:'free' -> siempre true (sin cambio observable). */
function canAccessPath(pathId) {
  const path = (window.getPath && window.getPath(pathId)) || null;
  if (!path) return true;
  if (path.access !== 'premium') return true;
  const s = getState && getState();
  return !!(s && s.premiumUnlocked) || tieneLicenciaPremium();
}

/* hasPremiumEntitlement() -> boolean   (s149)
     No todo lo premium es CONTENIDO. El constructor de rutinas propias es una
     SUPERFICIE entera de pago (s93): no hay `routineId` ni `pathId` que pasarle
     a los dos guards de arriba, asi que `CustomRoutines.jsx` leia
     `premiumUnlocked` directo — la unica lectura del booleano fuera de este
     archivo que NO era un fallback defensivo, y justo la excepcion que el audit
     integral señalaba por su nombre.
     Con esta tercera funcion la promesa de la cabecera vuelve a cumplirse: al
     llegar la licencia real SOLO cambia este archivo. */
function hasPremiumEntitlement() {
  const s = getState && getState();
  return !!(s && s.premiumUnlocked) || tieneLicenciaPremium();
}

Object.assign(window, { canAccessRoutine, canAccessPath, hasPremiumEntitlement, tieneLicenciaPremium, PREMIUM_ABIERTO_HASTA_V1 });
