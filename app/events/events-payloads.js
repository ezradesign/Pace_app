/* PACE · events-payloads.js
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ESQUEMA DE PAYLOADS de `pace.events.v1` (s155) — la mitad de la capa A que
   decide QUE campos lleva cada tipo de evento. Salio de `events-model.js` al
   rebasar este las 500 lineas (regla 1 de CLAUDE.md), igual que s152 saco la
   segunda tanda del verify.

   AQUI VIVE LA MINIMIZACION, y por eso merece archivo propio: cada payload se
   reconstruye CAMPO A CAMPO desde una LISTA PERMITIDA. No es una lista de
   campos prohibidos —esa siempre se queda corta— sino lo contrario: lo que no
   esta en el esquema no puede colarse aunque nadie lo haya previsto. Medido:
   un payload con `notaLibre`, `ip` y una ruta de archivo sale con tres claves.

   NUNCA entra aqui: texto libre del usuario, datos de salud, nombres de
   archivo, IP, ubicacion, contactos, credenciales, portapapeles ni
   identificador alguno de usuario, dispositivo, publicidad o fingerprint.

   CARGA ANTES de `events-model.js`, que llama a `normalizeEventPayload` desde
   `makeEvent` y usa `eventCount` en sus normalizadores.
*/

/* --- Payloads (§8) ------------------------------------------------------ */

const EVENT_MODULES_SESSION = ['focus', 'breathe', 'move', 'stretch'];
const EVENT_MODULES_FEEDBACK = ['move', 'stretch', 'breathe'];
const EVENT_STEP_KINDS = ['focus', 'breathe', 'move', 'stretch', 'hydrate'];
const EVENT_COMPLETION_REASONS = ['natural', 'early'];
const EVENT_PLANNED_SOURCES = ['preset', 'derived', 'declared'];
const EVENT_FEEDBACK_RESPONSES = ['yes', 'some', 'no'];   // `later` NO emite (§15.2)
const EVENT_VARIANTS = ['v1', 'legacy'];

/* Entero finito >= 0. Cubre la deuda P1 de §15.3: un contador que llegue como
   `"3"` no debe concatenarse ni propagarse como string. */
function eventCount(n) {
  const x = typeof n === 'string' ? Number(n) : n;
  if (typeof x !== 'number' || !isFinite(x) || x < 0) return 0;
  return Math.floor(x);
}

function eventSeconds(n) {
  const x = typeof n === 'string' ? Number(n) : n;
  if (typeof x !== 'number' || !isFinite(x) || x < 0) return null;
  return Math.round(x);
}

function eventEnum(value, allowed) {
  return allowed.indexOf(value) !== -1 ? value : null;
}

function eventId(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/* Devuelve el payload NORMALIZADO del tipo, o `null` si no cumple. Es el unico
   sitio donde se decide que forma tiene cada payload. */
function normalizeEventPayload(type, raw) {
  const p = (raw && typeof raw === 'object') ? raw : null;
  if (!p) return null;

  if (type === 'session.completed') {
    const mod = eventEnum(p.module, EVENT_MODULES_SESSION);
    const routineId = eventId(p.routineId);
    const reason = eventEnum(p.completionReason, EVENT_COMPLETION_REASONS);
    const elapsed = eventSeconds(p.elapsedSeconds);
    const active = eventSeconds(p.activeSeconds);
    if (!mod || !routineId || !reason || elapsed === null || active === null) return null;
    /* `plannedSeconds` y su origen viajan JUNTOS: si uno es null, el otro
       tambien (§6.4 — un Camino con un paso no planificable anula los dos). */
    let planned = p.plannedSeconds === null || p.plannedSeconds === undefined
      ? null : eventSeconds(p.plannedSeconds);
    let source = eventEnum(p.plannedSecondsSource, EVENT_PLANNED_SOURCES);
    if (planned === null || source === null) { planned = null; source = null; }
    return {
      module: mod, routineId: routineId, completionReason: reason,
      elapsedSeconds: elapsed, activeSeconds: active,
      plannedSeconds: planned, plannedSecondsSource: source,
      variant: eventEnum(p.variant, EVENT_VARIANTS),
    };
  }

  if (type === 'feedback.answered') {
    const routineId = eventId(p.routineId);
    const mod = eventEnum(p.module, EVENT_MODULES_FEEDBACK);
    const response = eventEnum(p.response, EVENT_FEEDBACK_RESPONSES);
    if (!routineId || !mod || !response) return null;
    return { routineId: routineId, module: mod, response: response };
  }

  if (type === 'path.step.completed') {
    const pathId = eventId(p.pathId);
    const kind = eventEnum(p.stepKind, EVENT_STEP_KINDS);
    const idx = eventCount(p.stepIndex);
    if (!pathId || !kind || typeof p.stepIndex === 'undefined') return null;
    return { pathId: pathId, stepIndex: idx, stepKind: kind };
  }

  if (type === 'path.completed') {
    const pathId = eventId(p.pathId);
    if (!pathId || typeof p.stepsCount === 'undefined') return null;
    return { pathId: pathId, stepsCount: eventCount(p.stepsCount) };
  }

  return null;
}

Object.assign(window, {
  EVENT_MODULES_SESSION, EVENT_MODULES_FEEDBACK, EVENT_STEP_KINDS,
  EVENT_COMPLETION_REASONS, EVENT_PLANNED_SOURCES, EVENT_FEEDBACK_RESPONSES, EVENT_VARIANTS,
  eventCount, eventSeconds, eventEnum, eventId, normalizeEventPayload,
});
