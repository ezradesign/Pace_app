/* PACE · state-feedback.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Feedback ligero por rutina (s116 · B2.2b-2 · «¿Te ayudó esta pausa?»).
   Split por dominio (patrón s57: state-hydrate / state-custom / state-timer).
   Depende de: state-core (getState, setState) · state-history (todayISO).
   Carga DESPUÉS de state-core y state-history, ANTES de state.jsx (índice).

   Modelo de datos — slice `routineFeedback` bajo pace.state.v2:
     routineFeedback: {
       [routineId]: { yes, some, no, lastPromptDay, lastNoDay }
     }
   `lastNoDay` es el día del último «No» (desde el 5 nov. 2026; lo de antes no lo trae).
   Conteos COMPLETOS (decisión s116): se guardan los tres contadores; `answered`
   y cualquier `helpScore` se DERIVAN, NUNCA se persisten (evita fijar una
   ponderación prematura). «Ahora no» (later) NO incrementa contadores pero SÍ
   escribe lastPromptDay (control de frecuencia). Sin sistema de eventos: esto
   es solo el CONTADOR; el consumidor (Pausa PACE / «qué te ayuda» premium)
   llega en fases posteriores. Voz/TTS y porcentajes visibles: fuera de alcance.

   Frecuencia: la pregunta se muestra como máximo UNA vez por rutina y DÍA LOCAL
   (todayISO() — regla #10, prohibido new Date("YYYY-MM-DD")). Salir por el CTA
   sin responder NO escribe lastPromptDay: la pregunta puede reaparecer tras
   otra finalización válida de esa rutina el mismo día.
*/

const FEEDBACK_RESPONSES = ['yes', 'some', 'no', 'later'];

/* Sanitiza la respuesta a uno de los cuatro tokens válidos, o null. */
function sanitizeFeedbackResponse(response) {
  return FEEDBACK_RESPONSES.indexOf(response) !== -1 ? response : null;
}

/* Entero finito >= 0 (deuda P1 de §15.3 del esquema de eventos, cerrada en
   s190). `cur.yes || 0` conservaba el TIPO: un contador que llegara como `'3'`
   --de un backup editado a mano, o del import, que aún no sanea (deuda A-7)--
   sobrevivía a la guarda y la suma lo CONCATENABA: `'3' + 1 === '31'`. La capa
   de eventos ya se defendía con `eventCount`; este slice no. Medido, no
   supuesto. */
function feedbackCount(n) {
  const x = typeof n === 'string' ? Number(n) : n;
  if (typeof x !== 'number' || !isFinite(x) || x < 0) return 0;
  return Math.floor(x);
}

/* Sanitiza el id de rutina a un string no vacío, o ''. */
function sanitizeRoutineId(routineId) {
  return typeof routineId === 'string' ? routineId.trim() : '';
}

/* nextRoutineFeedback — helper PURO: dado el slice previo, devuelve el SLICE
   siguiente sin mutar el argumento. No hace setState ni persiste (los efectos
   viven en la acción pública). Escribe lastPromptDay = hoy en toda respuesta
   válida (incluida «later»); solo yes/some/no incrementan su contador.
   Entrada inválida (id vacío o respuesta desconocida) → devuelve el slice tal
   cual (normalizado a objeto). */
function nextRoutineFeedback(prev, routineId, response) {
  const base = (prev && typeof prev === 'object') ? prev : {};
  const id = sanitizeRoutineId(routineId);
  const resp = sanitizeFeedbackResponse(response);
  if (!id || !resp) return base;
  const cur = base[id] || {};
  const nextEntry = {
    yes:  feedbackCount(cur.yes),
    some: feedbackCount(cur.some),
    no:   feedbackCount(cur.no),
    lastPromptDay: todayISO(),
  };
  /* El día del último «No»: el veto de la pausa dura una semana desde él (breakVetadas,
     Ez, 5 nov. 2026). Las otras respuestas lo conservan. */
  if (resp === 'no') nextEntry.lastNoDay = nextEntry.lastPromptDay;
  else if (typeof cur.lastNoDay === 'string') nextEntry.lastNoDay = cur.lastNoDay;
  /* Suma sin volver a coaccionar: los tres campos de `nextEntry` ya son enteros
     por construccion. Coaccionar aqui TAMBIEN seria una segunda guarda del
     mismo invariante, y el banco de mutantes lo demostro -- con las dos puestas,
     romper cualquiera de ellas dejaba los asertos en verde, o sea que no habia
     forma de saber si alguna funcionaba (la regla de s187). */
  if (resp !== 'later') nextEntry[resp] = nextEntry[resp] + 1;
  return { ...base, [id]: nextEntry };
}

/* recordRoutineFeedback — acción pública. setState con updater FUNCIONAL (sin
   side-effects dentro del updater: los sonidos/handlers viven en la UI). Ignora
   silenciosamente id vacío o respuesta no reconocida. */
function recordRoutineFeedback(routineId, response, opciones) {
  const id = sanitizeRoutineId(routineId);
  const resp = sanitizeFeedbackResponse(response);
  if (!id || !resp) return;
  setState(prev => ({
    ...prev,
    routineFeedback: nextRoutineFeedback(prev.routineFeedback, id, resp),
  }));
  /* s172 · dual-write: el contador de arriba sigue siendo la fuente de verdad
     de «que te ayuda»; el evento se anade al lado. `later` NO emite (§15.2) y
     tampoco emite si la sesion correlacionada no es esta rutina — el `runId`
     de §7.1 referencia una sesion que EXISTE, no se inventa.
     `sinEvento`: el «No» se puede deshacer mientras la pantalla sigue abierta, y el
     registro no se reescribe, asi que SessionFeedback lo emite al salir. */
  if (opciones && opciones.sinEvento) return;
  if (typeof emitFeedbackAnswered === 'function') emitFeedbackAnswered(id, resp);
}

/* restaurarRoutineFeedback — «Deshacer»: deja la entrada de la rutina como estaba antes
   de contestar (`antes` null o ausente = no habia ninguna). */
function restaurarRoutineFeedback(routineId, antes) {
  const id = sanitizeRoutineId(routineId);
  if (!id) return;
  setState(prev => {
    const fb = Object.assign({}, (prev.routineFeedback && typeof prev.routineFeedback === 'object') ? prev.routineFeedback : {});
    if (antes && typeof antes === 'object') fb[id] = Object.assign({}, antes);
    else delete fb[id];
    return { ...prev, routineFeedback: fb };
  });
}

/* shouldPromptRoutineFeedback — ¿mostrar la pregunta para esta rutina AHORA?
   true si no se preguntó hoy (lastPromptDay !== día local). Lectura defensiva:
   un state previo SIN el slice devuelve true (primera vez). id vacío → false. */
function shouldPromptRoutineFeedback(routineId) {
  const id = sanitizeRoutineId(routineId);
  if (!id) return false;
  const fb = getState().routineFeedback || {};
  const entry = fb[id];
  if (!entry) return true;
  return entry.lastPromptDay !== todayISO();
}

Object.assign(window, {
  feedbackCount,
  nextRoutineFeedback,
  recordRoutineFeedback,
  restaurarRoutineFeedback,
  shouldPromptRoutineFeedback,
});
