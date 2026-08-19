/* PACE · state-events.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL EMISOR de `pace.events.v1` (s172 · Fase 3, PASO 2). El puente entre el
   dominio —una sesión que termina, un feedback contestado, un paso de Camino—
   y el envelope canónico de `docs/product/EVENTOS_SCHEMA.md`.

   POR QUÉ VIVE EN LA CAPA DE ESTADO Y NO EN LA UI (decisión s169). Las seis
   llamadas a `complete*Session` están repartidas por cinco componentes; emitir
   desde ahí serían seis puntos que se desincronizan. Aquí hay UNO por tipo de
   evento, junto a la escritura legacy (dual-write): lo legacy manda y sigue
   mandando —stats, logros, rachas— y el evento se añade al lado. Si el evento
   falla, no se cae nada: `paceEmitirEvento` se traga todo, patrón `playSound`.

   Y POR QUÉ EL `paceEventsAppend` ESTÁ AQUÍ Y NO DENTRO DE `app/events/`.
   `scripts/verify.eventos.js` §5 define «emisor» como una llamada a
   `paceEventsAppend` FUERA de `app/events/`, y con eso exige que el backup
   público lleve la sección de eventos —la promesa de `privacy.html`—. Si esta
   llamada se escondiera dentro del subsistema, el gate seguiría diciendo «sin
   emisores todavía» con emisores puestos: un verde que no mira nada. La
   frontera del checker es lo que hace que este archivo esté donde está.

   ── LO QUE SE DECIDIÓ MIRANDO EL CATÁLOGO, NO EL PREFIJO ──────────────────
   El registro de Caminos usa `kind:'body'` y el enum del esquema no lo tiene;
   había que mapearlo. El plan heredado decía «`move.` → move, `extra.` →
   stretch», Y ESO ESTÁ AL REVÉS EN LOS CINCO CASOS QUE EXISTEN: `move.neck.3`,
   `move.hips.5`, `move.atg.knees` y `move.chair.antidote` viven en
   `EXTRA_ROUTINES` (Estira) y `extra.desk.pushups` vive en `MOVE_ROUTINES`
   (Mueve). Los ids son históricos —s15 movió rutinas de un módulo al otro y
   los conservó como identificadores estables— así que NO dicen de qué módulo
   son. Quien lo sabe es `resolveBodyRoutine()`, el mismo resolutor que usa
   `PathBodyStep` para elegir el runner. Se pregunta al catálogo.

   ── DURACIONES (§6.4), en un solo sitio para que se puedan leer juntas ─────
     Foco     → preset (15/25/35/45 min), `preset`.
     Mueve v1 → `estimateDuration().minSec`, `derived`. NO `routine.min`: el
                declarado se desvía del calculado (por eso existe el dev-check).
     legacy   → `routine.min × 60`, `declared`.
     Respira  → rondas: rondas × respiraciones × ciclo, `derived`.
                no-rondas: `routine.min × 60`, `declared` — el motor termina
                por TIEMPO ACTIVO contra ese número, así que se conoce antes de
                empezar. §6.4 no contempla el caso (su fila habla de rondas);
                se aplica el mismo trato que el documento da al legacy de
                cuerpo, que es el precedente más cercano. **Anotado como
                desviación consciente de la letra, no como interpretación.**

   ── `runId` SIN TOCAR LOS RUNNERS ─────────────────────────────────────────
   §7.1 exige que `session.completed` y su `feedback.answered` compartan
   `runId`, y §7.2 dice que no hace falta persistirlo: el feedback sólo se
   contesta con el DONE montado. Así que el id se genera AQUÍ al emitir la
   sesión y se recuerda en memoria (`paceUltimaSesion`) hasta que otra sesión
   lo sustituya. El feedback correlaciona sólo si su `routineId` es el de esa
   última sesión; si no coincide, NO se emite — antes que inventar una
   correlación falsa, se pierde el evento (§7.1: no se crean runId ficticios).

   Depende de: app/events/* (por window, en runtime) · state-core (getState) ·
   app/paths/registry.js (resolveBodyRoutine). Carga DESPUÉS de events-store.
*/

/* Última sesión emitida, EN MEMORIA y nunca persistida (§7.2). Se limpia sola
   al recargar, que es justo lo que se quiere: un DONE no sobrevive a eso. */
let paceUltimaSesion = null;

/* El ÚNICO punto que escribe en el almacén de eventos. Devuelve si se intentó,
   no si se commiteó: el append es asíncrono y el llamante no espera. Si el
   almacén lo rechaza, el `.then` deshace la memoria del runId para que un
   feedback posterior no referencie una sesión que no existe. */
function paceEmitirEvento(evento, alRechazar) {
  if (!evento || typeof window.paceEventsAppend !== 'function') return false;
  try {
    const p = window.paceEventsAppend(evento);
    if (p && typeof p.then === 'function') {
      p.then(function (r) {
        if (!r || r.result !== 'committed') { if (alRechazar) alRechazar(); }
      }, function () { if (alRechazar) alRechazar(); });
    }
    return true;
  } catch (e) { return false; }
}

/* El módulo de un paso de cuerpo, preguntando al CATÁLOGO (ver cabecera).
   `null` si la rutina no se resuelve: sin módulo no hay evento válido, y
   perderlo es mejor que etiquetarlo mal. */
function paceModuloDeCuerpo(routineId) {
  const r = window.resolveBodyRoutine && window.resolveBodyRoutine(routineId);
  if (!r) return null;
  return r.source === 'extra' ? 'stretch' : 'move';
}

/* `stepKind` de un paso de Camino: 'body' se resuelve; el resto tiene que
   estar en el enum del esquema o no se emite (un `kind` nuevo sin fila en
   EVENT_STEP_KINDS caería igualmente en `normalizeEventPayload`, pero ahí no
   se vería el porqué). */
function paceStepKindEvento(step) {
  if (!step || !step.kind) return null;
  const k = step.kind === 'body' ? paceModuloDeCuerpo(step.routineId) : step.kind;
  const enums = window.EVENT_STEP_KINDS || [];
  return enums.indexOf(k) !== -1 ? k : null;
}

/* Foco no tiene rutina, pero el payload pide `routineId` (§8). Se sintetiza
   por duración, que es la única identidad que un bloque de foco tiene, y con
   el mismo estilo que los ids del catálogo (`move.*`, `breathe.*`). */
function paceFocusRoutineId(minutos) {
  const n = Math.max(1, Math.round(Number(minutos) || 0));
  return 'focus.' + n;
}

/* El `pathRunId` vivo, o null. Nace en `startPath` y muere con `paths.current`
   (§7.1). Un Camino empezado ANTES de que existiera el emisor no lo tiene: sus
   pasos no se emiten, y es correcto — no se inventa una ejecución. */
function paceCaminoRunId() {
  const s = (typeof getState === 'function') ? getState() : null;
  const c = s && s.paths && s.paths.current;
  return (c && typeof c.pathRunId === 'string' && c.pathRunId) ? c.pathRunId : null;
}

/* session.completed — el emisor de los cuatro módulos. `datos` lo arma cada
   runner con lo que sólo él sabe (tiempos y plan); aquí se decide la
   correlación y se recuerda el runId para el feedback. */
function emitSessionCompleted(module, routineId, datos) {
  const d = datos || {};
  /* Sin tiempos no hay evento: `normalizeEventPayload` lo rechazaría igual,
     pero un llamante que aún no los pasa se vería como un silencio. */
  if (typeof d.elapsedSeconds !== 'number' || typeof d.activeSeconds !== 'number') return null;
  const runId = window.newEventId ? window.newEventId() : null;
  if (!runId) return null;
  const pathRunId = d.inPath ? paceCaminoRunId() : null;
  const evento = window.makeEvent && window.makeEvent({
    type: 'session.completed',
    context: d.inPath ? 'path' : 'standalone',
    runId: runId,
    pathRunId: pathRunId,
    payload: {
      module: module,
      routineId: routineId,
      completionReason: d.completionReason === 'early' ? 'early' : 'natural',
      elapsedSeconds: d.elapsedSeconds,
      activeSeconds: d.activeSeconds,
      plannedSeconds: typeof d.plannedSeconds === 'number' ? d.plannedSeconds : null,
      plannedSecondsSource: d.plannedSecondsSource || null,
      variant: d.variant || null,
    },
  });
  if (!evento) return null;
  paceUltimaSesion = { runId: runId, routineId: routineId, module: module };
  paceEmitirEvento(evento, function () { paceUltimaSesion = null; });
  return runId;
}

/* feedback.answered — «Ahora no» (later) NO emite (§15.2), y sin la sesión
   correlacionada tampoco: el `runId` es obligatorio y referencia una que
   existe. El módulo se toma de la sesión recordada, no se deduce del id. */
function emitFeedbackAnswered(routineId, response) {
  if (response === 'later') return false;
  const u = paceUltimaSesion;
  if (!u || u.routineId !== routineId) return false;
  const evento = window.makeEvent && window.makeEvent({
    type: 'feedback.answered',
    context: 'standalone',
    runId: u.runId,
    payload: { routineId: routineId, module: u.module, response: response },
  });
  return paceEmitirEvento(evento);
}

/* path.step.completed — `pathRunId` obligatorio; `runId` va a null a propósito:
   correlacionar el paso con SU sub-sesión exigiría enhebrar el id por
   `onExit(reason)` en los cuatro steps, y §7.1 lo declara opcional. La
   correlación Camino↔sesión ya viaja por `pathRunId` en `session.completed`,
   que es lo que §6.4 necesita para sumar el activo del Camino.
   El `pathRunId` llega POR PARÁMETRO y no se lee del estado: en el último paso
   el avance ya ha puesto `paths.current` a null cuando esto se llama, así que
   leerlo aquí perdería justo el evento que cierra el Camino. */
function emitPathStepCompleted(pathId, stepIndex, step, pathRunId) {
  const kind = paceStepKindEvento(step);
  if (!pathRunId || !kind) return false;
  const evento = window.makeEvent && window.makeEvent({
    type: 'path.step.completed',
    context: 'path',
    pathRunId: pathRunId,
    payload: { pathId: pathId, stepIndex: stepIndex, stepKind: kind },
  });
  return paceEmitirEvento(evento);
}

/* path.completed — `runId` no aplica (§7.1). Se emite con el `pathRunId` que
   se leyó ANTES de que el avance pusiera `paths.current` a null. */
function emitPathCompleted(pathId, stepsCount, pathRunId) {
  if (!pathRunId) return false;
  const evento = window.makeEvent && window.makeEvent({
    type: 'path.completed',
    context: 'path',
    pathRunId: pathRunId,
    payload: { pathId: pathId, stepsCount: stepsCount },
  });
  return paceEmitirEvento(evento);
}

/* Sólo para pruebas: leer y limpiar la correlación en memoria. No lo usa la
   app — existe para que un test pueda comprobar la regla de §7.1 sin abrir el
   almacén. */
function paceUltimaSesionEmitida() { return paceUltimaSesion; }
function paceOlvidarUltimaSesion() { paceUltimaSesion = null; }

Object.assign(window, {
  paceEmitirEvento, paceModuloDeCuerpo, paceStepKindEvento, paceFocusRoutineId,
  paceCaminoRunId, emitSessionCompleted, emitFeedbackAnswered,
  emitPathStepCompleted, emitPathCompleted,
  paceUltimaSesionEmitida, paceOlvidarUltimaSesion,
});
