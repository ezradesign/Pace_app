/* PACE · state-feedback.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Feedback ligero por rutina (s116 · B2.2b-2 · «¿Te ayudó esta pausa?»).
   Split por dominio (patrón s57: state-hydrate / state-custom / state-timer).
   Depende de: state-core (getState, setState) · state-history (todayISO).
   Carga DESPUÉS de state-core y state-history, ANTES de state.jsx (índice).

   Modelo de datos — slice `routineFeedback` bajo pace.state.v2:
     routineFeedback: {
       [routineId]: { yes, some, no, lastPromptDay }
     }
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
    yes:  cur.yes  || 0,
    some: cur.some || 0,
    no:   cur.no   || 0,
    lastPromptDay: todayISO(),
  };
  if (resp !== 'later') nextEntry[resp] = (nextEntry[resp] || 0) + 1;
  return { ...base, [id]: nextEntry };
}

/* recordRoutineFeedback — acción pública. setState con updater FUNCIONAL (sin
   side-effects dentro del updater: los sonidos/handlers viven en la UI). Ignora
   silenciosamente id vacío o respuesta no reconocida. */
function recordRoutineFeedback(routineId, response) {
  const id = sanitizeRoutineId(routineId);
  const resp = sanitizeFeedbackResponse(response);
  if (!id || !resp) return;
  setState(prev => ({
    ...prev,
    routineFeedback: nextRoutineFeedback(prev.routineFeedback, id, resp),
  }));
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
  nextRoutineFeedback,
  recordRoutineFeedback,
  shouldPromptRoutineFeedback,
});
