/* PACE · events-store.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   FACHADA del subsistema `pace.events.v1` (s155): detecta el runtime, elige el
   adaptador (`docs/product/EVENTOS_SCHEMA.md` §20) y publica el contrato
   EventStore (§10) como un unico punto de entrada para el resto de la app.
   Ningun modulo de producto debe hablar con un adaptador directamente.

   ┌─ QUE ES ESTO, EN UNA FRASE ──────────────────────────────────────────────┐
   │ Memoria LOCAL del propio usuario sobre su progreso. No es telemetria: no  │
   │ se envia a ningun sitio, no identifica a nadie y no sale del dispositivo. │
   └──────────────────────────────────────────────────────────────────────────┘

   QUE GUARDA (y solo esto):
     · `activatedAt` — cuando nacio el contenedor, para no contar dos veces lo
       que ya estaba contado antes de existir.
     · `events[]` — hechos con esquema CERRADO y lista permitida de campos
       (§8): modulo, id de rutina del catalogo, motivo de finalizacion,
       duraciones en segundos, indice de paso. En s155 esta SIEMPRE VACIO: los
       emisores son la Fase 2 y §25 prohibe emitir antes de estar en READ_WRITE.
     · `baseline` — totales consolidados. Al activar se copian los tallies que
       YA existen en `routineFeedback` dentro de `pace.state.v2`.
     · `pruneCursor` y `marker` — mecanica interna de poda y recuperacion.

   QUE NO GUARDA, NUNCA: texto libre del usuario (el `routineId` de una rutina
   personalizada es `custom.<timestamp>`, jamas el nombre que escribio) · datos
   de salud o medicos · nombres de archivo · IP · ubicacion · contactos ·
   credenciales · portapapeles · identificador de usuario, de dispositivo,
   publicitario o de fingerprint · nada del navegador mas alla de lo de arriba.

   DONDE: `localStorage`, clave `pace.events.v1`, en el dispositivo. FUERA de
   `pace.state.v2` para que su ciclo de vida sea independiente.

   NO HAY ENVIO REMOTO. En los cuatro archivos de `app/events/` no existe
   `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `Image()`
   de pixel ni ninguna URL. Anadir cualquiera de esas cosas aqui seria un cambio
   de naturaleza del subsistema y una decision aparte, explicita y con el
   consentimiento que corresponda — no un ajuste de implementacion.
*/

/* Runtime detectado y adaptador elegido. Se resuelven UNA vez al cargar. */
let _paceEventsRuntime = null;
let _paceEventsAdapter = null;
let _paceEventsCapability = null;
let _paceEventsReady = null;   // Promise de la inicializacion en curso

/* Deteccion de runtime (§20). NO se basa solo en `location.protocol`:
   Capacitor se mira PRIMERO y de forma explicita, porque el WebView puede
   presentarse como `https://localhost` y caer al adaptador web por accidente
   esta prohibido. */
function detectEventsRuntime() {
  try {
    const cap = (typeof window !== 'undefined') ? window.Capacitor : null;
    if (cap) {
      let platform = null;
      if (typeof cap.getPlatform === 'function') platform = cap.getPlatform();
      if (platform === 'android') return 'capacitor-android';
      if (platform === 'ios') return 'capacitor-ios';
      if (platform && platform !== 'web') return 'capacitor-other';
      if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
        return 'capacitor-other';
      }
    }
  } catch (e) {
    return 'unknown';
  }

  try {
    /* `window.chrome`, NO el identificador pelado: `chrome` solo existe en
       navegadores basados en Chromium y una referencia suelta seria un global
       sin ligar (lo caza el analisis de ambito del `verify`). */
    const ext = (typeof window !== 'undefined') ? window.chrome : null;
    if (ext && ext.runtime && ext.runtime.id && location.protocol === 'chrome-extension:') {
      return 'extension';
    }
  } catch (e) { /* no es una extension; seguimos */ }

  try {
    if (location.protocol === 'file:') return 'file';
    if (location.protocol === 'http:' || location.protocol === 'https:') return 'web';
  } catch (e) {
    return 'unknown';
  }
  return 'unknown';
}

/* Elige adaptador. Solo el runtime `web` puede acabar en READ_WRITE hoy: el
   nativo de Capacitor es de la fase de porting y `file://` no emite por
   diseno. Ante ambiguedad, el inerte. */
function selectEventsAdapter(runtime) {
  return runtime === 'web' ? 'web' : 'null';
}

function paceEventsRuntime() {
  if (_paceEventsRuntime === null) _paceEventsRuntime = detectEventsRuntime();
  return _paceEventsRuntime;
}

function paceEventsAdapter() {
  if (_paceEventsAdapter === null) _paceEventsAdapter = selectEventsAdapter(paceEventsRuntime());
  return _paceEventsAdapter;
}

/* Capacidad actual (§18), sin escribir. */
function paceEventsCapability() {
  if (paceEventsAdapter() === 'web') return eventsWebCapability();
  return eventsNullCapability('none');
}

/* ¿Se puede emitir? Unica pregunta que un emisor futuro debe hacerse. */
function paceEventsCanWrite() {
  return _paceEventsCapability === EVENTS_READ_WRITE;
}

/* --- Contrato EventStore (§10) ------------------------------------------- */

/* Inicializacion IDEMPOTENTE: crea o valida el contenedor, recupera una
   operacion a medias y captura el baseline la PRIMERA vez (§15.1). Se puede
   llamar mil veces; solo la primera captura.

   Nunca lanza: un fallo deja el subsistema en UNAVAILABLE y la app entera
   sigue funcionando por el sistema legacy (§19.5). */
function paceEventsInitialize(legacyState) {
  if (_paceEventsReady) return _paceEventsReady;
  const state = legacyState || paceEventsLegacyState();
  let run;
  try {
    run = paceEventsAdapter() === 'web'
      ? eventsWebInitialize(state)
      : eventsNullInitialize();
  } catch (e) {
    run = Promise.resolve({ result: EVENTS_UNAVAILABLE_RESULT, container: null });
  }
  _paceEventsReady = run.then(function (out) {
    const cap = paceEventsCapability();
    /* Si la inicializacion no confirmo, no se puede emitir — pero la capacidad
       reportada tiene que seguir siendo la REAL: un contenedor de version
       futura es READ_ONLY (se lee y se exporta), no UNAVAILABLE. Solo se
       degrada a UNAVAILABLE el caso contradictorio: el adaptador dice que
       podria escribir y aun asi la inicializacion fallo. */
    _paceEventsCapability = (out && out.result === EVENTS_COMMITTED) ? cap
      : (cap === EVENTS_READ_WRITE ? EVENTS_UNAVAILABLE : cap);
    return out;
  }).catch(function () {
    _paceEventsCapability = EVENTS_UNAVAILABLE;
    return { result: EVENTS_UNAVAILABLE_RESULT, container: null };
  });
  return _paceEventsReady;
}

/* Estado legacy vivo, del que sale el baseline. Se lee de forma defensiva: si
   `getState` aun no existe, el baseline queda vacio en vez de reventar. */
function paceEventsLegacyState() {
  try {
    return typeof getState === 'function' ? getState() : null;
  } catch (e) {
    return null;
  }
}

function paceEventsSnapshot() {
  try {
    return paceEventsAdapter() === 'web' ? eventsWebReadSnapshot() : eventsNullReadSnapshot();
  } catch (e) {
    return emptyEventsContainer();
  }
}

/* Emision. En s155 no la llama ningun modulo de producto (Fase 2). */
function paceEventsAppend(event) {
  if (!paceEventsCanWrite()) return eventsNullResult();
  return eventsWebAppend(event);
}

/* Export del snapshot canonico (§17). NO incluye detalles fisicos del backend
   (clave, locks, marcador). En s155 no se cablea al backup publico de «Tus
   datos»: el contenedor esta vacio y meter una seccion sin contenido en el JSON
   del usuario seria superficie sin dato. El dia que entre el primer emisor, el
   `verify` lo exige — ver `scripts/verify.integridad.js`. */
function paceEventsExport() {
  return buildEventsExport(paceEventsSnapshot());
}

/* Validacion INTEGRA antes de tocar nada (§17). Un JSON sintacticamente valido
   no es un snapshot valido: se comprueban version, forma de cada envelope,
   presencia de `activatedAt` y presupuesto. Si falla, ningun almacen cambia. */
function paceEventsValidateImport(rawSection) {
  return validateEventsImport(rawSection);
}

function paceEventsReplaceFromImport(rawSection) {
  if (!paceEventsCanWrite()) return eventsNullResult();
  return eventsWebReplaceFromImport(rawSection);
}

/* Vacia el contenedor y renueva `activatedAt`. No toca `pace.state.v2`. */
function paceEventsReset(nextLegacyState) {
  if (!paceEventsCanWrite()) return eventsNullResult();
  return eventsWebReset(nextLegacyState || null);
}

function paceEventsDiagnostics() {
  try {
    if (paceEventsAdapter() === 'web') {
      const d = eventsWebDiagnostics();
      d.runtime = paceEventsRuntime();
      return d;
    }
    return eventsNullDiagnostics(paceEventsRuntime(), paceEventsCapability());
  } catch (e) {
    return eventsNullDiagnostics('unknown', EVENTS_UNAVAILABLE);
  }
}

/* --- Barrera entre almacenes (§17, §22) ---------------------------------- */

/* `pace.state.v2` y `pace.events.v1` son DOS almacenes y entre ellos no hay
   atomicidad. Toda operacion que escriba en los dos (importar un backup,
   resetear desde Ajustes) pasa por aqui:

     1. marcador `{op}` en el contenedor de eventos — ANTES de nada;
     2. escritura del estado legacy (la verdad canonica va primero, §11);
     3. contenedor de eventos REINICIADO con `activatedAt` nuevo y baseline
        recapturado del estado que acaba de entrar, y marcador borrado.

   Si el proceso muere entre 2 y 3, el marcador sobrevive y la siguiente
   `paceEventsInitialize()` completa el paso 3 — que es idempotente, porque
   reiniciar dos veces deja lo mismo. Nunca queda una MEZCLA de historial
   anterior con estado importado, que es justo lo que hay que evitar.

   Si el subsistema no puede escribir, `writeLegacy()` se ejecuta igual: el
   import y el reset de Ajustes NO pueden depender de que los eventos
   funcionen (§19.5). */
function paceEventsStoreBarrier(op, writeLegacy, nextLegacyState) {
  /* `writeLegacy` puede fallar de verdad: cuota agotada, almacenamiento
     bloqueado, modo privado. Su resultado NO se descarta — es la condicion de
     la que depende todo lo que viene despues. */
  const doLegacy = function () {
    try { writeLegacy(); return true; } catch (e) { return false; }
  };
  const salida = function (result, legacyWritten) {
    return { result: result, legacyWritten: !!legacyWritten, container: null };
  };

  /* Sin subsistema de eventos no hay contenedor que proteger: la escritura
     legacy se hace igual (§19.5) y se informa de si salio bien. */
  if (!paceEventsCanWrite()) {
    const ok = doLegacy();
    return Promise.resolve(salida(ok ? EVENTS_UNAVAILABLE_RESULT : EVENTS_REJECTED, ok));
  }

  return eventsWebMark(op)
    .then(function (marked) {
      /* Si no se puede ni marcar, no hay red de recuperacion: se ABORTA sin
         tocar nada. Mas vale que el usuario reintente a dejar una operacion de
         dos almacenes sin rastro de por donde iba. */
      if (!marked || marked.result !== EVENTS_COMMITTED) {
        return salida(EVENTS_REJECTED, false);
      }

      if (!doLegacy()) {
        /* LA ESCRITURA CANONICA FALLO -> se aborta y se vuelve a un estado
           conocido. Reiniciar el contenedor aqui seria lo peor de los dos
           mundos: el estado del usuario intacto y su historial borrado.
           Y hay que QUITAR EL MARCADOR: vivo, el proximo arranque reiniciaria
           el contenedor «recuperando» una operacion que nunca ocurrio. */
        return eventsWebClearMarker().then(function () {
          return salida(EVENTS_REJECTED, false);
        }, function () {
          return salida(EVENTS_INTERRUPTED, false);
        });
      }

      return eventsWebReset(nextLegacyState || null).then(function (r) {
        return salida(r && r.result === EVENTS_COMMITTED ? EVENTS_COMMITTED : EVENTS_INTERRUPTED, true);
      });
    })
    .catch(function () {
      return salida(EVENTS_REJECTED, false);
    });
}

/* Borrado TOTAL de los datos del usuario: los dos almacenes, por la barrera.
   Vive aqui y no en el `onClick` de Ajustes porque «borrar todo» dejo de ser
   una linea el dia que hubo dos almacenes, y quien sabe que hay que borrar es
   este modulo. `privacy.html` promete que el borrado desde Ajustes es
   «inmediato y definitivo»: esta funcion es esa promesa. */
function paceEventsWipeAll(alTerminar) {
  /* El almacen legacy lo borra SU dueño (`wipeLocalState`, state-core). Este
     modulo orquesta la operacion de dos almacenes, pero no mete la mano en la
     clave de otro dominio — lo aserta el `verify`, y de hecho lo cazo cuando
     esta funcion nacio haciendo el `removeItem` ella misma.
     `wipeLocalState` devuelve si pudo: si NO pudo, la barrera aborta y el
     contenedor de eventos se queda como estaba, en vez de borrar el historial
     de alguien cuyo estado sigue ahi. */
  const wipe = function () {
    if (!wipeLocalState()) throw new Error('no se pudo borrar el estado local');
  };
  const fin = typeof alTerminar === 'function' ? alTerminar : function () {};
  try {
    paceEventsStoreBarrier('reset', wipe, null).then(fin, fin);
  } catch (e) {
    fin({ result: EVENTS_REJECTED, legacyWritten: false, container: null });
  }
}

/* --- Arranque ------------------------------------------------------------ */

/* Se inicializa solo al cargar, sin bloquear el render (todo el contrato es
   asincrono) y sin poder romper nada: cualquier fallo cae a UNAVAILABLE.
   Se expone tambien como funcion para que las pruebas la conduzcan. */
function paceEventsBoot() {
  try {
    paceEventsInitialize();
  } catch (e) { /* la app no se entera */ }
}

paceEventsBoot();

Object.assign(window, {
  detectEventsRuntime, selectEventsAdapter, paceEventsRuntime, paceEventsAdapter,
  paceEventsCapability, paceEventsCanWrite, paceEventsInitialize, paceEventsLegacyState,
  paceEventsSnapshot, paceEventsAppend, paceEventsExport, paceEventsValidateImport,
  paceEventsReplaceFromImport, paceEventsReset, paceEventsDiagnostics,
  paceEventsStoreBarrier, paceEventsWipeAll, paceEventsBoot,
});
