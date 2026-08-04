/* PACE · events-adapter-web.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ADAPTADOR WEB / PWA del contrato EventStore (`docs/product/EVENTOS_SCHEMA.md`
   §10, §19.1). Capa B: aqui SI se nombran `localStorage` y `navigator.locks`,
   porque son detalles de ESTE backend. El modelo canonico
   (`events-model.js`) no los conoce y no debe conocerlos.

   NADA DE ESTE ARCHIVO SALE DEL DISPOSITIVO. No hay `fetch`, ni `XMLHttpRequest`,
   ni `sendBeacon`, ni WebSocket, ni URL remota: el unico destino de una escritura
   es `localStorage` del propio navegador. Si algun dia alguien anade aqui una
   llamada de red, esta violando la premisa del subsistema, no ajustandolo.

   EXCLUSION (§19.1). Toda read-modify-write —activacion, emision, consolidacion,
   poda, reset, import y su recuperacion— corre DENTRO de
   `navigator.locks.request('pace.events.writer.v1', {mode:'exclusive'})`.
   Esta PROHIBIDO cualquier sucedaneo con `localStorage`, evento `storage`,
   heartbeat, `BroadcastChannel` o `setTimeout`: comunican pestanas, pero no dan
   exclusion mutua atomica. Sin `navigator.locks` NO se emite: se cae a
   READ_ONLY (si el contenedor se puede leer) o UNAVAILABLE.

   PROPIEDAD POR OPERACION, no liderazgo: pedir lock -> releer DENTRO del lock ->
   validar -> una sola mutacion -> medir presupuesto -> escribir -> liberar.
   Nunca leer fuera del lock y escribir esa copia dentro.
*/

const EVENTS_WEB_KEY = 'pace.events.v1';
const EVENTS_WEB_LOCK = 'pace.events.writer.v1';

/* Modos de capacidad (§18). Son tambien los estados diagnosticos, sin PII. */
const EVENTS_READ_WRITE = 'events.read_write';
const EVENTS_READ_ONLY = 'events.read_only';
const EVENTS_UNAVAILABLE = 'events.unavailable';

/* Resultado de toda operacion mutadora (§10). Exactamente uno; no existe
   «probablemente escrito». */
const EVENTS_COMMITTED = 'committed';
const EVENTS_REJECTED = 'rejected';
const EVENTS_INTERRUPTED = 'interrupted';
const EVENTS_UNAVAILABLE_RESULT = 'unavailable';

/* --- Sondas de entorno --------------------------------------------------- */

/* ¿`localStorage` es utilizable? En modo restringido el mero ACCESO lanza
   SecurityError, asi que la sonda escribe y borra una clave propia. */
function eventsWebStorageUsable() {
  try {
    const probe = '__pace_events_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch (e) {
    return false;
  }
}

function eventsWebLocksAvailable() {
  try {
    return typeof navigator !== 'undefined' && !!navigator.locks &&
           typeof navigator.locks.request === 'function';
  } catch (e) {
    return false;
  }
}

/* --- Lectura / escritura crudas (siempre bajo lock las mutaciones) -------- */

/* Devuelve `{ container, corrupt }`. Un contenedor ilegible NO revienta la app:
   se reporta como corrupto y el llamador lo reinicia (§23). Un contenedor
   ausente devuelve el vacio con `corrupt:false` — no es un error, es la primera
   vez. */
function eventsWebRead() {
  let raw;
  try {
    raw = localStorage.getItem(EVENTS_WEB_KEY);
  } catch (e) {
    return { container: null, corrupt: true };
  }
  if (raw === null || raw === undefined) {
    return { container: emptyEventsContainer(), corrupt: false };
  }
  try {
    return { container: normalizeEventsContainer(JSON.parse(raw)), corrupt: false };
  } catch (e) {
    return { container: null, corrupt: true };
  }
}

/* Escribe el contenedor ENTERO. `localStorage.setItem` de una clave escribe
   todo o no cambia nada (WHATWG Web Storage), que es lo que permite que una RMW
   dentro del lock no deje una «poda a medias».

   Ante error de almacenamiento: poda una vez, consolidando en baseline, y
   reintenta UNA sola vez (§16). Si vuelve a fallar se conserva el ultimo
   contenedor valido y se devuelve error controlado — nunca un bucle, y nunca el
   `catch(e){}` mudo de `persistState()`. */
function eventsWebWrite(container) {
  const attempt = function (c) {
    try {
      localStorage.setItem(EVENTS_WEB_KEY, JSON.stringify(c));
      return true;
    } catch (e) {
      return false;
    }
  };

  let target = container;
  if (isOverEventsBudget(target)) {
    target = eventsWebPruneForBudget(target);
  }
  if (attempt(target)) return { result: EVENTS_COMMITTED, container: target };

  const pruned = eventsWebPruneForBudget(target);
  if (pruned !== target && attempt(pruned)) return { result: EVENTS_COMMITTED, container: pruned };

  return { result: EVENTS_REJECTED, container: null };
}

/* Poda por PRESION DE PRESUPUESTO (§16), no por calendario.

   OJO — esto no es la poda por retencion de §12, que es la que barre por
   antiguedad y que en s155 NO se programa: la Fase 1 del esquema no tiene
   emisores, asi que no hay nada que barrer, y §25 situa la consolidacion en la
   Fase 3. Este camino existe solo para que el contenedor no pueda crecer sin
   limite si algun dia se llena, y **destila antes de borrar**: el lote se funde
   en `baseline` (totales por tipo + tallies de feedback), de modo que se pierde
   el DETALLE por hecho pero nunca el total. La reconstruccion de agregados
   sigue siendo `baseline + fold(retenidos)`.

   Punto de extension declarado: cuando la Fase 3 programe la poda por
   retencion, va aqui al lado reutilizando `selectEventsToPrune` +
   `foldEventsIntoBaseline` + `nextPruneCursor`, y sin un segundo reloj (se
   engancha al rollover diario, §12). */
function eventsWebPruneForBudget(container) {
  const c = normalizeEventsContainer(container);
  if (!c.events.length) return c;

  /* Suelo: nunca se vacia entero por presupuesto. Se poda de lo mas antiguo
     hacia delante, por mitades, hasta caber. */
  let kept = c.events.slice();
  let baseline = c.baseline;
  let cursor = c.pruneCursor;
  let guard = 0;

  while (guard++ < 24) {
    const candidate = { schemaVersion: c.schemaVersion, activatedAt: c.activatedAt,
                        events: kept, baseline: baseline, pruneCursor: cursor, marker: c.marker };
    if (!isOverEventsBudget(candidate)) return candidate;
    if (!kept.length) return candidate;
    const cut = Math.max(1, Math.floor(kept.length / 2));
    const batch = kept.slice(0, cut);
    baseline = foldEventsIntoBaseline(baseline, batch, cursor);
    cursor = nextPruneCursor(batch, cursor);
    kept = kept.slice(cut);
  }
  return { schemaVersion: c.schemaVersion, activatedAt: c.activatedAt,
           events: kept, baseline: baseline, pruneCursor: cursor, marker: c.marker };
}

/* --- Exclusion ----------------------------------------------------------- */

/* Ejecuta `fn(container)` DENTRO del lock exclusivo. `fn` recibe el contenedor
   RELEIDO dentro del lock y devuelve `{ container, result }`; si devuelve
   `container` nulo no se escribe nada.

   Una excepcion dentro del callback libera el lock igualmente (lo garantiza la
   API de Web Locks al rechazarse la promesa) y se traduce a `rejected`: la otra
   pestana que espera no se queda colgada. */
function eventsWebRunExclusive(fn) {
  if (!eventsWebLocksAvailable() || !eventsWebStorageUsable()) {
    return Promise.resolve({ result: EVENTS_UNAVAILABLE_RESULT, container: null });
  }
  return navigator.locks.request(EVENTS_WEB_LOCK, { mode: 'exclusive' }, function () {
    const read = eventsWebRead();
    const current = read.corrupt ? emptyEventsContainer() : read.container;
    let out;
    try {
      out = fn(current, read.corrupt);
    } catch (e) {
      return { result: EVENTS_REJECTED, container: null };
    }
    if (!out || !out.container) {
      return { result: out && out.result ? out.result : EVENTS_REJECTED, container: null };
    }
    const written = eventsWebWrite(out.container);
    if (written.result !== EVENTS_COMMITTED) return written;
    /* Verificacion de relectura: si lo escrito no se puede volver a leer, la
       operacion NO se da por buena (§15.1 — nunca se habilita la emision sin
       comprobar que el contenedor se relee). */
    const back = eventsWebRead();
    if (back.corrupt || !back.container) return { result: EVENTS_REJECTED, container: null };
    return { result: out.result || EVENTS_COMMITTED, container: back.container };
  }).catch(function () {
    return { result: EVENTS_REJECTED, container: null };
  });
}

/* --- Operaciones del contrato (§10) -------------------------------------- */

/* Capacidad ACTUAL sin escribir nada (§18). */
function eventsWebCapability() {
  if (!eventsWebStorageUsable()) return EVENTS_UNAVAILABLE;
  if (!eventsWebLocksAvailable()) return EVENTS_READ_ONLY;
  return EVENTS_READ_WRITE;
}

/* Activacion + captura UNICA del baseline (§15.1), y recuperacion de una
   operacion a medias (§22) — las dos dentro de la misma exclusion, porque las
   dos son read-modify-write sobre el mismo contenedor.

   `legacyState` es el estado vivo de `pace.state.v2`, del que sale el tally
   inicial de feedback. Se pasa por parametro para que este archivo no dependa
   del store: el adaptador no sabe de React ni de `getState`. */
function eventsWebInitialize(legacyState) {
  if (eventsWebCapability() !== EVENTS_READ_WRITE) {
    return Promise.resolve({ result: EVENTS_UNAVAILABLE_RESULT, container: null });
  }
  return eventsWebRunExclusive(function (current, wasCorrupt) {
    let c = current;

    /* Marcador vivo = una operacion quedo a medias. Se completa de forma
       IDEMPOTENTE antes de nada mas: reiniciar el contenedor era justo el
       destino declarado del import y del reset, asi que rehacerlo no duplica
       nada (§22). */
    if (c.marker) {
      c = eventsWebFreshContainer(legacyState);
      return { container: c, result: EVENTS_COMMITTED };
    }

    /* Contenedor ilegible: se reinicia en vez de arrastrar basura (§23). */
    if (wasCorrupt) {
      return { container: eventsWebFreshContainer(legacyState), result: EVENTS_COMMITTED };
    }

    /* `activatedAt` ya existe -> NO se recaptura el baseline. Esta es la
       condicion que impide el doble conteo (§15.1 paso 3). */
    if (c.activatedAt) {
      return { container: c, result: EVENTS_COMMITTED };
    }

    return { container: eventsWebFreshContainer(legacyState), result: EVENTS_COMMITTED };
  });
}

/* Contenedor recien nacido: `activatedAt` nuevo, sin eventos, con el baseline
   capturado del estado legacy que haya EN ESE MOMENTO. */
function eventsWebFreshContainer(legacyState) {
  const now = new Date().toISOString();
  const c = emptyEventsContainer();
  c.activatedAt = now;
  c.baseline = captureEventsBaseline(legacyState, now);
  c.marker = null;
  return c;
}

/* Lectura sin mutar. Devuelve el contenedor normalizado (o el vacio). */
function eventsWebReadSnapshot() {
  const read = eventsWebRead();
  return read.corrupt || !read.container ? emptyEventsContainer() : read.container;
}

/* Anade un evento bajo exclusion. En s155 NO lo llama nadie: los emisores son
   la Fase 2 del esquema y §25 prohibe emitir antes de estar en READ_WRITE.
   Existe porque es el contrato, y porque las pruebas lo ejercitan. */
function eventsWebAppend(event) {
  if (!isValidEventEnvelope(event)) {
    return Promise.resolve({ result: EVENTS_REJECTED, container: null });
  }
  return eventsWebRunExclusive(function (current) {
    if (!current.activatedAt) return { result: EVENTS_REJECTED, container: null };
    for (let i = 0; i < current.events.length; i++) {
      if (current.events[i].id === event.id) {
        /* Ya estaba: el fold es idempotente por id, asi que esto es un exito
           sin cambio, no un error. */
        return { container: current, result: EVENTS_COMMITTED };
      }
    }
    const next = {
      schemaVersion: current.schemaVersion,
      activatedAt: current.activatedAt,
      events: current.events.concat([event]).sort(compareEvents),
      baseline: current.baseline,
      pruneCursor: current.pruneCursor,
      marker: current.marker,
    };
    return { container: next, result: EVENTS_COMMITTED };
  });
}

/* Vacia el contenedor y renueva `activatedAt` (§17). No toca el estado legacy:
   quien quiera borrar `pace.state.v2` lo hace aparte y a proposito. */
function eventsWebReset(legacyState) {
  return eventsWebRunExclusive(function () {
    return { container: eventsWebFreshContainer(legacyState), result: EVENTS_COMMITTED };
  });
}

/* Reemplazo TOTAL desde un backup ya validado (§17). No mezcla ni deduplica, y
   es idempotente: el mismo backup deja el mismo estado. */
function eventsWebReplaceFromImport(rawSection) {
  const check = validateEventsImport(rawSection);
  if (!check.ok) {
    return Promise.resolve({ result: EVENTS_REJECTED, container: null, reason: check.reason });
  }
  return eventsWebRunExclusive(function () {
    return { container: check.container, result: EVENTS_COMMITTED };
  });
}

/* Marca el inicio de una operacion que toca DOS almacenes (§22). Se escribe
   ANTES de tocar `pace.state.v2`, para que un corte a mitad deje rastro. */
function eventsWebMark(op) {
  return eventsWebRunExclusive(function (current) {
    const next = {
      schemaVersion: current.schemaVersion,
      activatedAt: current.activatedAt,
      events: current.events,
      baseline: current.baseline,
      pruneCursor: current.pruneCursor,
      marker: { op: String(op || 'unknown'), startedAt: new Date().toISOString() },
    };
    return { container: next, result: EVENTS_COMMITTED };
  });
}

function eventsWebDiagnostics() {
  const cap = eventsWebCapability();
  const snap = cap === EVENTS_UNAVAILABLE ? null : eventsWebReadSnapshot();
  return {
    adapter: 'web',
    capability: cap,
    storage: eventsWebStorageUsable(),
    locks: eventsWebLocksAvailable(),
    activated: !!(snap && snap.activatedAt),
    events: snap ? snap.events.length : 0,
    pendingMarker: !!(snap && snap.marker),
    bytes: snap ? measureEventsBytes(snap) : 0,
  };
}

Object.assign(window, {
  EVENTS_WEB_KEY, EVENTS_WEB_LOCK,
  EVENTS_READ_WRITE, EVENTS_READ_ONLY, EVENTS_UNAVAILABLE,
  EVENTS_COMMITTED, EVENTS_REJECTED, EVENTS_INTERRUPTED, EVENTS_UNAVAILABLE_RESULT,
  eventsWebStorageUsable, eventsWebLocksAvailable, eventsWebRead, eventsWebWrite,
  eventsWebPruneForBudget, eventsWebRunExclusive, eventsWebCapability,
  eventsWebInitialize, eventsWebFreshContainer, eventsWebReadSnapshot,
  eventsWebAppend, eventsWebReset, eventsWebReplaceFromImport, eventsWebMark,
  eventsWebDiagnostics,
});
