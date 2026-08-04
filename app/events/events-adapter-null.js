/* PACE · events-adapter-null.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ADAPTADOR INERTE del contrato EventStore: el que se selecciona cuando el
   runtime NO puede emitir (`docs/product/EVENTOS_SCHEMA.md` §18, §19.2, §19.4,
   §20). Cubre tres casos, y ninguno es un error de la app:

     · `file://` (PACE_standalone.html) — §19.2. NO emite en v1 aunque el
       navegador exponga Web Locks: sin origen compartido no hay coordinacion
       entre pestanas que prometer. Se elige este adaptador A PROPOSITO.
     · Capacitor (Android / iOS) — §20. Su adaptador nativo (SQLite +
       Preferences/UserDefaults) es de la fase de porting y todavia no existe.
       Mientras no exista, el runtime queda UNAVAILABLE: lo que esta PROHIBIDO
       es que caiga al adaptador web porque la URL del WebView parezca
       `https://localhost`.
     · Almacenamiento bloqueado o ambiguedad — §20. Ante la duda, UNAVAILABLE;
       nunca un adaptador «adivinado».

   ALCANCE DE LA LIMITACION (§19.5), que es lo que de verdad importa: deshabilitar
   el registro de eventos NO convierte la app en solo-lectura. Foco, Respira,
   Mueve, Estira, Hidratate, Caminos, logros, ajustes y la persistencia de
   `pace.state.v2` siguen funcionando igual. Solo queda apagado el registro
   nuevo.

   Y NO se acumulan eventos «en memoria para guardarlos luego»: produciria una
   semantica distinta (eventos sin durabilidad) y riesgo de duplicacion. Lo que
   no se puede escribir, no se registra.
*/

/* Todas las mutadoras devuelven `unavailable`, que es uno de los cuatro
   resultados del contrato (§10) — no una excepcion ni un `false` ambiguo. */
function eventsNullResult() {
  return Promise.resolve({ result: EVENTS_UNAVAILABLE_RESULT, container: null });
}

function eventsNullCapability(reason) {
  /* READ_ONLY solo si de verdad hay algo legible que exportar; si ni eso,
     UNAVAILABLE. En `file://` con localStorage permitido, un contenedor de una
     sesion anterior servida por http SI podria leerse — pero no en el mismo
     origen, asi que en la practica sale UNAVAILABLE. */
  return reason === 'readable' ? EVENTS_READ_ONLY : EVENTS_UNAVAILABLE;
}

function eventsNullInitialize() { return eventsNullResult(); }
function eventsNullAppend() { return eventsNullResult(); }
function eventsNullReset() { return eventsNullResult(); }
function eventsNullReplaceFromImport() { return eventsNullResult(); }
function eventsNullMark() { return eventsNullResult(); }
function eventsNullReadSnapshot() { return emptyEventsContainer(); }

function eventsNullDiagnostics(runtime, capability) {
  return {
    adapter: 'null',
    runtime: runtime || 'unknown',
    capability: capability || EVENTS_UNAVAILABLE,
    storage: false,
    locks: false,
    activated: false,
    events: 0,
    pendingMarker: false,
    bytes: 0,
  };
}

Object.assign(window, {
  eventsNullResult, eventsNullCapability, eventsNullInitialize, eventsNullAppend,
  eventsNullReset, eventsNullReplaceFromImport, eventsNullMark,
  eventsNullReadSnapshot, eventsNullDiagnostics,
});
