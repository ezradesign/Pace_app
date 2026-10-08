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
/* EL ORIGEN de una sesion (s194 · rev. 7 del esquema): la PUERTA por la que se
   empezo -- el aro de la home, la pausa, una biblioteca, la tarjeta de la barra
   lateral, la parada de la linea del dia o un Camino -- y, aparte, si lo que se
   empezo era lo que «A tu ritmo» habia servido (`fromMenu`). Dos campos y no uno
   compuesto porque responden a preguntas distintas: «¿por donde entra la gente?»
   y «¿hace lo que el menu sirve?»; con la puerta sola, la pausa y la barra
   lateral son ambiguas. Los dos admiten null: una sesion que sobrevive a una
   recarga (Foco persistido, Respira reanudada) no recuerda su puerta, y un
   evento anterior a s194 no los trae. */
const EVENT_ORIGINS = ['aro', 'pausa', 'biblioteca', 'sidebar', 'parada', 'camino'];

/* EL DIA DE «A TU RITMO» (rev. 8): lo que sirvio y que paso con cada parada, para
   que el motor de la semana aprenda. Solo horas en minutos, modulos e ids de
   rutina del catalogo: ni textos, ni titulos de reuniones, ni nada que escriba
   la persona. Los modulos son los de la regla del dia (ritmo.regla.js). */
const EVENT_RITMO_OPCIONES = ['1h', '2h', 'media', 'jornada'];
const EVENT_RITMO_HABITUAL = ['jornada', 'media', 'libre'];
const EVENT_RITMO_PARADAS = ['pausa', 'larga', 'cierre'];
const EVENT_RITMO_MODULOS = ['estira', 'mueve', 'respira', 'cierre'];
const EVENT_RITMO_ESTADOS = ['hecha', 'saltada'];

/* Minutos desde medianoche, de 0 a 1440; lo demas, null. */
function eventMinuto(n) {
  const x = typeof n === 'string' ? Number(n) : n;
  if (typeof x !== 'number' || !isFinite(x) || x < 0 || x > 1440) return null;
  return Math.round(x);
}

function eventRitmoParada(x) {
  if (!x || typeof x !== 'object') return null;
  const tipo = eventEnum(x.tipo, EVENT_RITMO_PARADAS);
  const hora = eventMinuto(x.hora);
  const platos = (Array.isArray(x.platos) ? x.platos : []).slice(0, 2).map(function (pl) {
    const modulo = eventEnum(pl && pl.modulo, EVENT_RITMO_MODULOS);
    const id = eventId(pl && pl.id);
    if (!modulo || !id) return null;
    const antes = (Array.isArray(pl.antes) ? pl.antes : []).slice(0, 5).map(eventId).filter(Boolean);
    return { modulo: modulo, id: id, otras: eventCount(pl.otras), antes: antes };
  }).filter(Boolean);
  if (!tipo || hora === null || !platos.length) return null;
  return { hora: hora, tipo: tipo, platos: platos,
           estado: eventEnum(x.estado, EVENT_RITMO_ESTADOS), reunion: eventMinuto(x.reunion) || 0 };
}

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
      origin: eventEnum(p.origin, EVENT_ORIGINS),
      fromMenu: p.fromMenu === true ? true : (p.fromMenu === false ? false : null),
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

  if (type === 'ritmo.day.closed') {
    const fecha = typeof p.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.fecha) ? p.fecha : null;
    const opcion = eventEnum(p.opcion, EVENT_RITMO_OPCIONES);
    if (!fecha || !opcion || !Array.isArray(p.paradas)) return null;
    return {
      fecha: fecha, opcion: opcion,
      habitual: eventEnum(p.habitual, EVENT_RITMO_HABITUAL),
      inicio: eventMinuto(p.inicio), salida: eventMinuto(p.salida),
      paradas: p.paradas.slice(0, 40).map(eventRitmoParada).filter(Boolean),
    };
  }

  return null;
}

Object.assign(window, {
  EVENT_MODULES_SESSION, EVENT_MODULES_FEEDBACK, EVENT_STEP_KINDS,
  EVENT_COMPLETION_REASONS, EVENT_PLANNED_SOURCES, EVENT_FEEDBACK_RESPONSES, EVENT_VARIANTS,
  EVENT_ORIGINS, eventCount, eventSeconds, eventEnum, eventId, normalizeEventPayload,
  EVENT_RITMO_OPCIONES, EVENT_RITMO_HABITUAL, EVENT_RITMO_PARADAS, EVENT_RITMO_MODULOS,
  EVENT_RITMO_ESTADOS, eventMinuto, eventRitmoParada,
});
