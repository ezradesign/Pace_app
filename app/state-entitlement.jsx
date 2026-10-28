/* PACE · state-entitlement.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Guard central de acceso a contenido (sesion 95 / v0.40.0).

   ÚNICO punto de verdad del entitlement: canAccessRoutine / canAccessPath /
   hasPremiumEntitlement. Abren PACE completo dos cosas, y ninguna se fabrica
   tocando el estado a mano: un CÓDIGO cuya firma se ha comprobado
   (`paceLicenciaVigente`, state-licencia.js: el de los testers y el de quien
   compre en la web) y lo que la tienda del canal sabe que ya tienes
   (`tieneCompraVigente`: Play Billing, vacía hasta que llegue). Además, hasta
   v1, lo abierto para todos (`PREMIUM_ABIERTO_HASTA_V1`). Un booleano guardado
   en el estado no abre nada: cualquiera lo cambia desde las herramientas del
   navegador, y `verify` falla si vuelve a aparecer en `app/`. Los
   consumidores (RoutineCard, CustomRoutines, PathBreatheStep/PathBodyStep,
   getSuggestedPath) no se tocan. La compra también pasa por aquí (abajo).

   Degustacion EXPLICITA: un contexto de degustacion pasa { tasting: true } y
   el guard concede acceso a una rutina premium sin PACE completo. Hoy: los 2
   steps premium de path.weekend (nadi.shodhana + atg.knees, decision s89
   D-8a). Deja de ser una excepcion tacita del catalogo.

   Depende (todo en window, resuelto en tiempo de LLAMADA, no de carga):
     paceLicenciaVigente (state-licencia), getBreatheRoutine (BreatheLibrary),
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
   porque las pruebas lo apagan para medir el candado. El día que pase a `false`,
   quien ya usaba PACE recibe su semana y conserva las de pago que hizo
   (state-paso-v1.js). */
const PREMIUM_ABIERTO_HASTA_V1 = true;

/* ¿Está PACE completo abierto ahora sin código ni compra? Hasta v1, para todos; desde v1,
   durante la semana de prueba de quien ya usaba PACE. Es lo que abría el interruptor. */
function paceAbiertoAhora() {
  return window.PREMIUM_ABIERTO_HASTA_V1 === true || !!(window.pacePruebaV1Vigente && window.pacePruebaV1Vigente());
}

/* canAccessRoutine(routineId, { tasting }) -> boolean
     rutina desconocida  -> true  (fail-open: no es trabajo del guard bloquear
                                    ids que no existen; StepError/lookup ya lo
                                    manejan, y ocultarlos escondería bugs)
     access !== 'premium' -> true
     premium              -> código || compra || tasting || abierto ahora
                             || una de las que ya hizo antes de v1 */
function canAccessRoutine(routineId, opts) {
  const tasting = !!(opts && opts.tasting);
  const routine = resolveAnyRoutine(routineId);
  if (!routine) return true;
  if (routine.access !== 'premium') return true;
  return hasPremiumEntitlement() || tasting || paceAbiertoAhora()
    || !!(window.pacePasoV1Conserva && window.pacePasoV1Conserva(routineId));
}

/* canAccessPath(pathId) -> boolean
     path desconocido / access !== 'premium' -> true
     premium -> código || compra
   Hoy los 7 Caminos son access:'free' -> siempre true (sin cambio observable). */
function canAccessPath(pathId) {
  const path = (window.getPath && window.getPath(pathId)) || null;
  if (!path) return true;
  if (path.access !== 'premium') return true;
  return hasPremiumEntitlement();
}

/* hasPremiumEntitlement() -> boolean   (s149)
     No todo lo premium es CONTENIDO. El constructor de rutinas propias es una
     SUPERFICIE entera de pago (s93): no hay `routineId` ni `pathId` que pasarle
     a los dos guards de arriba. Con esta tercera funcion la promesa de la
     cabecera se cumple: al llegar la licencia real SOLO cambia este archivo. */
function hasPremiumEntitlement() {
  return tieneLicenciaPremium() || tieneCompraVigente();
}

/* puedeMantenerCalendario() -> boolean   (14 oct. 2026)
     «Mantenerlo al día solo» en «Al calendario» es de PACE completo; llevar el
     día y esquivar reuniones siguen gratis. Hasta v1, abierto como las rutinas. */
function puedeMantenerCalendario() {
  return hasPremiumEntitlement() || paceAbiertoAhora();
}

/* puedeCrearRutinas() -> boolean   (20 oct. 2026)
     El constructor de «Tus rutinas» es de PACE completo, pero hasta v1 se abre como
     lo demás: Google tiene que poder revisar toda la app en la prueba de Play, y en
     Android no hay código ni compra con que abrirlo. Quien cree rutinas sin código
     las verá cerradas al llegar v1; Ez lo eligió sabiéndolo. */
function puedeCrearRutinas() {
  return hasPremiumEntitlement() || paceAbiertoAhora();
}

/* puedeAprender() -> boolean   (16 oct. 2026)
     El motor de la semana de «A tu ritmo» y la carta del lunes son de PACE completo; las
     series y su capa 1 siguen gratis. Hasta v1, abierto como las rutinas. */
function puedeAprender() {
  return hasPremiumEntitlement() || paceAbiertoAhora();
}

/* puedeVariar() -> boolean   (20 oct. 2026)
     En «A tu ritmo», mover el cuerpo entero cada día es gratis; que las rutinas cambien de
     un día a otro es de PACE completo (Ez, 20 oct.). Hasta v1, abierto como las rutinas. */
function puedeVariar() {
  return hasPremiumEntitlement() || paceAbiertoAhora();
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

/* Los planes con su precio aunque aún no se pueda comprar: mientras PACE completo está abierto
   hasta v1, la bienvenida dice lo que costará después. Solo los sabe la tienda que los tiene
   escritos (la web); Play los da cuando llegue Billing, así que en Android y en el iPhone sale
   vacío y la bienvenida no dice ningún importe. */
function paceTiendaPrecios(lang) {
  const tienda = tiendaDelCanal();
  if (!tienda) return [];
  return tienda.planes().map((p) => Object.assign({}, p, { precio: window.paceTiendaPrecioTexto(p, lang) }));
}

/* La pantalla de PACE completo que cierra la bienvenida: 'compra' con la tienda abierta (la del
   16 oct.); 'abierto' mientras todo está abierto hasta v1 y esta persona no lo tiene (Ez, 2A del
   27 oct.); null si no toca ninguna. */
function paceBienvenidaCompleto() {
  if (paceTiendaAbierta()) return 'compra';
  if (window.PREMIUM_ABIERTO_HASTA_V1 === true && !hasPremiumEntitlement()) return 'abierto';
  return null;
}

function paceComprar(plan) {
  const tienda = tiendaDelCanal();
  if (!tienda || !tienda.listo()) return Promise.resolve({ ok: false, motivo: 'cerrada' });
  return tienda.comprar(plan).then((r) => {
    if (r && r.ok && r.licencia && window.paceLicenciaCanjear) return window.paceLicenciaCanjear(r.licencia);
    return r || { ok: false, motivo: 'error' };
  }, () => ({ ok: false, motivo: 'error' }));
}

/* ¿Hay dónde gestionar la suscripción? (Ajustes y el aviso del fin de la prueba). */
function paceTiendaPuedeGestionar() {
  const tienda = tiendaDelCanal();
  return !!(tienda && tienda.puedeGestionar && tienda.puedeGestionar());
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
  canAccessRoutine, canAccessPath, hasPremiumEntitlement, tieneLicenciaPremium, puedeMantenerCalendario, puedeAprender, puedeVariar, puedeCrearRutinas, PREMIUM_ABIERTO_HASTA_V1, paceAbiertoAhora,
  paceTiendaAbierta, paceTiendaPlanes, paceTiendaPrecios, paceBienvenidaCompleto, paceComprar, paceGestionarCompra, paceTiendaPuedeGestionar, tieneCompraVigente,
});
