/* PACE · state-entitlement.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Guard central de acceso a contenido (sesion 95 / v0.40.0).

   ÚNICO punto de verdad del entitlement: canAccessRoutine / canAccessPath /
   hasPremiumEntitlement. Abren PACE completo tres cosas: el booleano
   `premiumUnlocked` (state-core, sin ruta de compra), un CÓDIGO firmado que
   vale (`paceLicenciaVigente`, state-licencia.js: el de los testers y el de
   quien compre en la web) y lo que la tienda del canal sabe que ya tienes
   (`tieneCompraVigente`: Play Billing, vacía hasta que llegue). Los
   consumidores (RoutineCard, CustomRoutines, PathBreatheStep/PathBodyStep,
   getSuggestedPath) no se tocan. La compra también pasa por aquí (abajo).

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
   pero sin «Pronto» y se pueden empezar. Las RUTINAS, el calendario que se
   mantiene solo (`puedeMantenerCalendario`, Ez, 14 oct.: en Android no hay
   códigos y nadie podría probarlo), lo que aprende de tu semana (`puedeAprender`),
   que las rutinas cambien de un día a otro (`puedeVariar`) y el constructor de
   «Tus rutinas» (`puedeCrearRutinas`; las dos, Ez, 20 oct.). Abrirlo
   no es tener PACE completo: `hasPremiumEntitlement` sigue en false sin código ni
   compra. Cuando llegue el cobro, a `false`. Se lee de `window` en cada llamada
   porque las pruebas lo apagan para medir el candado. */
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
  const unlocked = !!(s && s.premiumUnlocked) || tieneLicenciaPremium() || tieneCompraVigente();
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
  return !!(s && s.premiumUnlocked) || tieneLicenciaPremium() || tieneCompraVigente();
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
  return !!(s && s.premiumUnlocked) || tieneLicenciaPremium() || tieneCompraVigente();
}

/* puedeMantenerCalendario() -> boolean   (14 oct. 2026)
     «Mantenerlo al día solo» en «Al calendario» es de PACE completo; llevar el
     día y esquivar reuniones siguen gratis. Hasta v1, abierto como las rutinas. */
function puedeMantenerCalendario() {
  return hasPremiumEntitlement() || window.PREMIUM_ABIERTO_HASTA_V1 === true;
}

/* puedeCrearRutinas() -> boolean   (20 oct. 2026)
     El constructor de «Tus rutinas» es de PACE completo, pero hasta v1 se abre como
     lo demás: Google tiene que poder revisar toda la app en la prueba de Play, y en
     Android no hay código ni compra con que abrirlo. Quien cree rutinas sin código
     las verá cerradas al llegar v1; Ez lo eligió sabiéndolo. */
function puedeCrearRutinas() {
  return hasPremiumEntitlement() || window.PREMIUM_ABIERTO_HASTA_V1 === true;
}

/* puedeAprender() -> boolean   (16 oct. 2026)
     El motor de la semana de «A tu ritmo» y la carta del lunes son de PACE completo; las
     series y su capa 1 siguen gratis. Hasta v1, abierto como las rutinas. */
function puedeAprender() {
  return hasPremiumEntitlement() || window.PREMIUM_ABIERTO_HASTA_V1 === true;
}

/* puedeVariar() -> boolean   (20 oct. 2026)
     En «A tu ritmo», mover el cuerpo entero cada día es gratis; que las rutinas cambien de
     un día a otro es de PACE completo (Ez, 20 oct.). Hasta v1, abierto como las rutinas. */
function puedeVariar() {
  return hasPremiumEntitlement() || window.PREMIUM_ABIERTO_HASTA_V1 === true;
}

/* LA COMPRA PASA POR AQUÍ (Fase 6). La tienda del canal (state-compra.js: Stripe
   en la web, Play en Android, ninguna en el iPhone) se pregunta solo desde estas
   cuatro funciones, y lo que compra vuelve por las fuentes de arriba: el código
   PACE1 de la web por `paceLicenciaCanjear` y lo de Play por `vigente()`.
   La tienda está abierta si se puede comprar y esta persona aún no lo tiene. */
function tiendaDelCanal() {
  return (window.paceTiendaDelCanal && window.paceTiendaDelCanal()) || null;
}

function paceTiendaAbierta() {
  const tienda = tiendaDelCanal();
  return !!(tienda && tienda.listo()) && !hasPremiumEntitlement();
}

/* Los planes con su precio escrito en el idioma de la app, en el orden de la tienda. */
function paceTiendaPlanes(lang) {
  const tienda = tiendaDelCanal();
  if (!tienda || !tienda.listo()) return [];
  return tienda.planes().map((p) => Object.assign({}, p, { precio: window.paceTiendaPrecioTexto(p, lang) }));
}

function paceComprar(plan) {
  const tienda = tiendaDelCanal();
  if (!tienda || !tienda.listo()) return Promise.resolve({ ok: false, motivo: 'cerrada' });
  return tienda.comprar(plan).then((r) => {
    if (r && r.ok && r.licencia && window.paceLicenciaCanjear) return window.paceLicenciaCanjear(r.licencia);
    return r || { ok: false, motivo: 'error' };
  }, () => ({ ok: false, motivo: 'error' }));
}

function paceGestionarCompra() {
  const tienda = tiendaDelCanal();
  return !!(tienda && tienda.gestionar());
}

/* La tercera fuente de PACE completo: lo que la tienda sabe que ya tienes (Play). */
function tieneCompraVigente() {
  const tienda = tiendaDelCanal();
  return !!(tienda && tienda.vigente && tienda.vigente());
}

Object.assign(window, {
  canAccessRoutine, canAccessPath, hasPremiumEntitlement, tieneLicenciaPremium, puedeMantenerCalendario, puedeAprender, puedeVariar, puedeCrearRutinas, PREMIUM_ABIERTO_HASTA_V1,
  paceTiendaAbierta, paceTiendaPlanes, paceComprar, paceGestionarCompra, tieneCompraVigente,
});
