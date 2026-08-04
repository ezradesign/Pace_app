/* PACE · events-model.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   MODELO CANONICO de `pace.events.v1` (s155 · FASE 3 del plan, Fase 1 del
   esquema). Implementa la capa A de `docs/product/EVENTOS_SCHEMA.md` §5-§17:
   envelope, tipos, payloads, correlacion tipada, orden canonico, retencion,
   baseline, presupuesto y export/import.

   REGLA DURA (§5): este archivo es BACKEND-INDEPENDIENTE. Aqui no se nombra
   `localStorage`, ni `setItem`, ni el evento `storage`, ni `navigator.locks`,
   ni SQLite. Todo eso vive en un ADAPTADOR (`events-adapter-*.js`). Si algun
   dia una funcion de este archivo necesita tocar el almacenamiento, esta en el
   archivo equivocado.

   Funciones puras salvo `newEventId()` y `makeEvent()` (que leen el reloj y el
   generador de aleatorios). Ninguna persiste nada.

   REGLA #10 de CLAUDE.md: el dia civil se calcula con `todayISO()` y las claves
   ISO se interpretan con `parseLocalDateKey()` (state-history.jsx). NUNCA
   `new Date("YYYY-MM-DD")`, que parsea medianoche UTC y rompe en husos
   negativos. `occurredAt` SI es un instante absoluto y va con `toISOString()`.

   Cruza la IIFE del build por el `Object.assign(window, …)` del final: el build
   solo re-expone `function` y `var` top-level, asi que las CONSTANTES que otro
   archivo necesita se publican a mano (misma solucion que `sidebarStyles`).
*/

/* Version del CONTENEDOR canonico (§9). El sufijo `v1` de la clave marca un
   cambio INCOMPATIBLE; los compatibles suben este entero. */
const EVENTS_SCHEMA_VERSION = 1;

/* Ventana de crudos en dias (§12, rango aprobado 90-180). */
const EVENTS_RETENTION_DAYS = 120;

/* Presupuesto LOGICO de producto (§16): ~500 KB medidos sobre el JSON
   serializado en UTF-8. No es la cuota fisica de ningun backend; existe para
   que los backups sean comparables entre runtimes. */
const EVENTS_BUDGET_BYTES = 500 * 1024;

/* Tipos aprobados (§6.1). Anadir un `type` NO sube el `v` de los demas. */
const EVENT_TYPES = ['session.completed', 'feedback.answered', 'path.step.completed', 'path.completed'];

/* Correlacion TIPADA (§7.1) — no hay un `runId` universal, y no se inventan
   `runId` ficticios para el tipo que no lo lleva.
     req  = obligatorio · opt = opcional · no = no aplicable (null) */
const EVENT_CORRELATION = {
  'session.completed':   { runId: 'req', pathRunId: 'opt' },
  'feedback.answered':   { runId: 'req', pathRunId: 'opt' },
  'path.step.completed': { runId: 'opt', pathRunId: 'req' },
  'path.completed':      { runId: 'no',  pathRunId: 'req' },
};

const EVENT_CONTEXTS = ['standalone', 'path'];

/* --- Identidad (§7.2) -------------------------------------------------- */

/* UUIDv4 canonico. Primario `crypto.randomUUID()`; donde no exista, 16 bytes
   de `getRandomValues` con los bits de version (0100) y variante (10xx)
   fijados a mano. NUNCA `Math.random` — no es un generador criptografico y el
   `id` es tambien el desempate del orden de poda. */
function newEventId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;   // version 4
      b[8] = (b[8] & 0x3f) | 0x80;   // variante 10xx
      const hex = [];
      for (let i = 0; i < 16; i++) hex.push(b[i].toString(16).padStart(2, '0'));
      const s = hex.join('');
      return s.slice(0, 8) + '-' + s.slice(8, 12) + '-' + s.slice(12, 16) + '-' +
             s.slice(16, 20) + '-' + s.slice(20);
    }
  } catch (e) { /* cae al fallo controlado de abajo */ }
  return null;   // sin generador fiable no se fabrica un id: el emisor rechaza
}

const EVENT_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isEventId(value) {
  return typeof value === 'string' && EVENT_UUID_RE.test(value);
}

/* --- Envelope (§7) ------------------------------------------------------ */

/* Construye un evento canonico. Devuelve `null` si el tipo, la correlacion o
   el payload no cumplen el contrato: preferimos NO registrar a registrar algo
   que un consumidor futuro tendria que adivinar.
   `opts.occurredAt` existe para que las pruebas puedan fijar el instante; en
   produccion se omite y se lee el reloj. */
function makeEvent(opts) {
  const o = opts || {};
  if (EVENT_TYPES.indexOf(o.type) === -1) return null;

  const id = newEventId();
  if (!id) return null;

  const occurredAt = typeof o.occurredAt === 'string' ? o.occurredAt : new Date().toISOString();
  const when = new Date(occurredAt);
  if (isNaN(when.getTime())) return null;

  const context = EVENT_CONTEXTS.indexOf(o.context) !== -1 ? o.context : 'standalone';
  const runId = typeof o.runId === 'string' && o.runId ? o.runId : null;
  const pathRunId = typeof o.pathRunId === 'string' && o.pathRunId ? o.pathRunId : null;
  if (!eventCorrelationOk(o.type, runId, pathRunId)) return null;

  const payload = normalizeEventPayload(o.type, o.payload);
  if (!payload) return null;

  return {
    id: id,
    v: 1,
    type: o.type,
    occurredAt: occurredAt,
    /* El dia civil se captura AL EMITIR; jamas se reconstruye despues desde
       `occurredAt` con el huso vigente, que para un evento antiguo puede ser
       otro (§7.3). Con `occurredAt` inyectado por una prueba, el dia sale de
       ese instante y no de hoy. */
    localDay: typeof o.occurredAt === 'string' ? toISODate(when) : todayISO(),
    /* Offset PARA LA FECHA DEL EVENTO (§7.3): varia por zona y por DST, no es
       una propiedad permanente del usuario. */
    timezoneOffsetMin: when.getTimezoneOffset(),
    context: context,
    runId: runId,
    pathRunId: pathRunId,
    payload: payload,
  };
}

/* Cardinalidad de la correlacion por tipo (§7.1). */
function eventCorrelationOk(type, runId, pathRunId) {
  const rule = EVENT_CORRELATION[type];
  if (!rule) return false;
  if (rule.runId === 'req' && !runId) return false;
  if (rule.runId === 'no' && runId) return false;
  if (rule.pathRunId === 'req' && !pathRunId) return false;
  if (rule.pathRunId === 'no' && pathRunId) return false;
  return true;
}

/* Un evento leido del almacen (o de un backup) es VALIDO si tiene la forma del
   envelope. Ojo: un `type`/`v` DESCONOCIDO no es invalido — se conserva y se
   ignora en los reducers (§9, principio 5). Por eso aqui no se mira la tabla
   de tipos, solo el envelope. */
function isValidEventEnvelope(e) {
  if (!e || typeof e !== 'object') return false;
  if (!isEventId(e.id)) return false;
  if (typeof e.v !== 'number' || !isFinite(e.v)) return false;
  if (typeof e.type !== 'string' || !e.type) return false;
  if (typeof e.occurredAt !== 'string' || isNaN(new Date(e.occurredAt).getTime())) return false;
  if (typeof e.localDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.localDay)) return false;
  if (typeof e.timezoneOffsetMin !== 'number' || !isFinite(e.timezoneOffsetMin)) return false;
  if (EVENT_CONTEXTS.indexOf(e.context) === -1) return false;
  if (e.runId !== null && typeof e.runId !== 'string') return false;
  if (e.pathRunId !== null && typeof e.pathRunId !== 'string') return false;
  if (!e.payload || typeof e.payload !== 'object') return false;
  return true;
}

/* --- Orden canonico (§11) ----------------------------------------------- */

/* UNICO comparador de orden del sistema: `occurredAt` ascendente y, a igualdad,
   `id` lexicografico ascendente. `seq` NO participa: no es global ni estable
   tras una importacion (§7.2). */
function compareEvents(a, b) {
  if (a.occurredAt < b.occurredAt) return -1;
  if (a.occurredAt > b.occurredAt) return 1;
  if (a.id < b.id) return -1;
  if (a.id > b.id) return 1;
  return 0;
}

/* ¿`e` va DESPUES del cursor de poda? Con cursor nulo, todo va despues. */
function isAfterPruneCursor(e, cursor) {
  if (!cursor) return true;
  return compareEvents(e, cursor) > 0;
}

/* --- Contenedor canonico ------------------------------------------------ */

function emptyEventsBaseline() {
  return {
    capturedAt: null,
    /* Tally de `feedback.answered` puenteado desde `routineFeedback` (§15.1). */
    feedback: {},
    /* Totales consolidados por tipo al podar (§13). Vacio hasta la Fase 3. */
    totalsByType: {},
  };
}

function emptyEventsContainer() {
  return {
    schemaVersion: EVENTS_SCHEMA_VERSION,
    activatedAt: null,
    events: [],
    baseline: emptyEventsBaseline(),
    pruneCursor: null,
    /* Marcador de operacion entre almacenes (§22). `null` = nada a medias. */
    marker: null,
  };
}

/* Lectura DEFENSIVA: cualquier cosa que no encaje se normaliza en vez de
   reventar (principio 5 y §23 — un contenedor ilegible se reinicia). Devuelve
   siempre un contenedor con la forma canonica. */
function normalizeEventsContainer(raw) {
  const base = emptyEventsContainer();
  if (!raw || typeof raw !== 'object') return base;

  const sv = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : null;
  base.schemaVersion = sv === null ? EVENTS_SCHEMA_VERSION : sv;
  base.activatedAt = typeof raw.activatedAt === 'string' ? raw.activatedAt : null;

  const list = Array.isArray(raw.events) ? raw.events : [];
  const seen = Object.create(null);
  const kept = [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!isValidEventEnvelope(e)) continue;
    if (seen[e.id]) continue;          // el fold es keyed por id: sin repetidos
    seen[e.id] = true;
    kept.push(e);
  }
  kept.sort(compareEvents);
  base.events = kept;

  const b = (raw.baseline && typeof raw.baseline === 'object') ? raw.baseline : {};
  base.baseline = {
    capturedAt: typeof b.capturedAt === 'string' ? b.capturedAt : null,
    feedback: normalizeFeedbackTally(b.feedback),
    totalsByType: normalizeTotalsByType(b.totalsByType),
  };

  const c = raw.pruneCursor;
  base.pruneCursor = (c && typeof c === 'object' && typeof c.occurredAt === 'string' && isEventId(c.id))
    ? { occurredAt: c.occurredAt, id: c.id } : null;

  const m = raw.marker;
  base.marker = (m && typeof m === 'object' && typeof m.op === 'string')
    ? { op: m.op, startedAt: typeof m.startedAt === 'string' ? m.startedAt : null }
    : null;

  return base;
}

function normalizeFeedbackTally(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  const ids = Object.keys(raw);
  for (let i = 0; i < ids.length; i++) {
    const entry = raw[ids[i]];
    if (!entry || typeof entry !== 'object') continue;
    out[ids[i]] = { yes: eventCount(entry.yes), some: eventCount(entry.some), no: eventCount(entry.no) };
  }
  return out;
}

function normalizeTotalsByType(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  const keys = Object.keys(raw);
  for (let i = 0; i < keys.length; i++) out[keys[i]] = eventCount(raw[keys[i]]);
  return out;
}

/* --- Baseline (§13, §15.1) ---------------------------------------------- */

/* Captura UNICA al activar: los contadores de `routineFeedback` pasan a ser el
   tally inicial de `feedback.*`, para que el dia que haya consumidor no se
   cuente dos veces lo que ya estaba contado antes de existir el log.
   No migra ni borra nada: `routineFeedback` sigue siendo el agregado canonico
   y el control de frecuencia (§15.2). */
function captureEventsBaseline(legacyState, capturedAt) {
  const out = emptyEventsBaseline();
  out.capturedAt = typeof capturedAt === 'string' ? capturedAt : new Date().toISOString();
  const rf = (legacyState && typeof legacyState === 'object') ? legacyState.routineFeedback : null;
  out.feedback = normalizeFeedbackTally(rf);
  return out;
}

/* --- Retencion y poda (§12) --------------------------------------------- */

/* Clave ISO del primer dia RETENIDO: hoy menos la ventana. Un evento con
   `localDay` anterior a esta clave es candidato a poda. */
function eventsRetentionFloorKey(todayKey) {
  const base = parseLocalDateKey(todayKey || todayISO());
  base.setDate(base.getDate() - EVENTS_RETENTION_DAYS);
  return toISODate(base);
}

/* Lote a podar: eventos POSTERIORES al cursor y anteriores al suelo, en orden
   canonico. La poda por lotes no salta ni reprocesa (§12). Las claves ISO se
   comparan como cadenas: `YYYY-MM-DD` ordena lexicograficamente igual que
   cronologicamente, asi que no hace falta construir fechas. */
function selectEventsToPrune(container, todayKey) {
  const floor = eventsRetentionFloorKey(todayKey);
  const out = [];
  const list = container && Array.isArray(container.events) ? container.events : [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!isAfterPruneCursor(e, container.pruneCursor)) continue;
    if (e.localDay < floor) out.push(e);
  }
  out.sort(compareEvents);
  return out;
}

/* Funde un lote en el baseline. IDEMPOTENTE por `id` respecto al cursor: un
   evento que ya quedo detras del cursor no se vuelve a contar. Los tipos
   DESCONOCIDOS no se consolidan (§9): al podarlos se pierde su detalle, y eso
   es preferible a inventarles un agregado. */
function foldEventsIntoBaseline(baseline, batch, cursor) {
  const out = {
    capturedAt: baseline ? baseline.capturedAt : null,
    feedback: normalizeFeedbackTally(baseline ? baseline.feedback : null),
    totalsByType: normalizeTotalsByType(baseline ? baseline.totalsByType : null),
  };
  const list = Array.isArray(batch) ? batch : [];
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!isAfterPruneCursor(e, cursor)) continue;
    if (EVENT_TYPES.indexOf(e.type) === -1) continue;
    out.totalsByType[e.type] = eventCount(out.totalsByType[e.type]) + 1;
    if (e.type === 'feedback.answered') {
      const id = e.payload && e.payload.routineId;
      const resp = e.payload && e.payload.response;
      if (id && EVENT_FEEDBACK_RESPONSES.indexOf(resp) !== -1) {
        const cur = out.feedback[id] || { yes: 0, some: 0, no: 0 };
        out.feedback[id] = {
          yes: eventCount(cur.yes), some: eventCount(cur.some), no: eventCount(cur.no),
        };
        out.feedback[id][resp] = eventCount(out.feedback[id][resp]) + 1;
      }
    }
  }
  return out;
}

/* Cursor tras podar un lote: el ULTIMO evento consolidado y eliminado. */
function nextPruneCursor(batch, prev) {
  if (!Array.isArray(batch) || !batch.length) return prev || null;
  const last = batch[batch.length - 1];
  return { occurredAt: last.occurredAt, id: last.id };
}

/* --- Presupuesto logico (§16) ------------------------------------------- */

/* Bytes del JSON canonico en UTF-8. NUNCA `string.length`, que cuenta unidades
   UTF-16 y miente con cualquier acento (y este producto escribe en espanol). */
function measureEventsBytes(container) {
  const json = JSON.stringify(container);
  try {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(json).byteLength;
  } catch (e) { /* cae al recuento manual */ }
  return utf8ByteLength(json);
}

/* Equivalente UTF-8 sin `TextEncoder`: cuenta por punto de codigo, tratando
   los pares suplentes como un solo caracter de 4 bytes. */
function utf8ByteLength(str) {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes += 1;
    else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff) { bytes += 4; i++; }
    else bytes += 3;
  }
  return bytes;
}

function isOverEventsBudget(container) {
  return measureEventsBytes(container) > EVENTS_BUDGET_BYTES;
}

/* --- Export / import (§17) ---------------------------------------------- */

/* Snapshot canonico. NO lleva detalles fisicos del backend: ni nombre de
   clave, ni tablas, ni locks, ni el marcador (que es de recuperacion local y
   no significa nada en otro dispositivo). */
function buildEventsExport(container) {
  const c = normalizeEventsContainer(container);
  return {
    schemaVersion: c.schemaVersion,
    exportedAt: new Date().toISOString(),
    activatedAt: c.activatedAt,
    baseline: c.baseline,
    events: c.events,
    pruneCursor: c.pruneCursor,
    retentionDays: EVENTS_RETENTION_DAYS,
  };
}

/* Valida un backup ENTERO antes de que nadie toque nada (§17). Devuelve
   `{ ok, reason, container }`. Si `ok` es falso, el llamador tiene prohibido
   modificar ningun almacen. */
function validateEventsImport(raw) {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'shape', container: null };
  if (typeof raw.schemaVersion !== 'number' || !isFinite(raw.schemaVersion)) {
    return { ok: false, reason: 'schema-missing', container: null };
  }
  /* Version FUTURA: se rechaza sin tocar nada, porque no sabemos que campos
     dejariamos a medias. Una version anterior si se acepta (compatible hacia
     adelante) y la normalizacion rellena lo que falte. */
  if (raw.schemaVersion > EVENTS_SCHEMA_VERSION) {
    return { ok: false, reason: 'schema-newer', container: null };
  }
  if (!Array.isArray(raw.events)) return { ok: false, reason: 'events-missing', container: null };
  for (let i = 0; i < raw.events.length; i++) {
    if (!isValidEventEnvelope(raw.events[i])) {
      return { ok: false, reason: 'event-invalid', container: null };
    }
  }
  const container = normalizeEventsContainer({
    schemaVersion: EVENTS_SCHEMA_VERSION,
    activatedAt: raw.activatedAt,
    events: raw.events,
    baseline: raw.baseline,
    pruneCursor: raw.pruneCursor,
    marker: null,
  });
  if (!container.activatedAt) return { ok: false, reason: 'activatedAt-missing', container: null };
  if (isOverEventsBudget(container)) return { ok: false, reason: 'over-budget', container: null };
  return { ok: true, reason: null, container: container };
}

/* ¿Este backup trae seccion de eventos? Un backup ANTERIOR a este subsistema
   no la trae, y entonces la importacion REINICIA el contenedor vacio en vez de
   conservar el actual (§17) — mezclar los eventos de aqui con un estado de
   antes seria exactamente el doble conteo que el baseline evita. */
function backupHasEventsSection(payload) {
  return !!(payload && typeof payload === 'object' && payload.events && typeof payload.events === 'object');
}

Object.assign(window, {
  EVENTS_SCHEMA_VERSION, EVENTS_RETENTION_DAYS, EVENTS_BUDGET_BYTES,
  EVENT_TYPES, EVENT_CORRELATION, EVENT_CONTEXTS,
  newEventId, isEventId, makeEvent, eventCorrelationOk,
  isValidEventEnvelope, compareEvents, isAfterPruneCursor,
  emptyEventsBaseline, emptyEventsContainer, normalizeEventsContainer,
  normalizeFeedbackTally, normalizeTotalsByType, captureEventsBaseline,
  eventsRetentionFloorKey, selectEventsToPrune, foldEventsIntoBaseline, nextPruneCursor,
  measureEventsBytes, utf8ByteLength, isOverEventsBudget,
  buildEventsExport, validateEventsImport, backupHasEventsSection,
});
