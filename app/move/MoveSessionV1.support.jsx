/* PACE · Runner v1 — soporte sin UI (s113 · runner guiado)
   =========================================================
   Extraído de MoveSessionV1.jsx (patrón FocusTimer.support, regla <500 ln)
   al crecer el runner con el motor guiado: constantes del método, helpers de
   cadencia/progreso/tamaño y el CSS del pulso + compactación por ALTURA.
   Carga ANTES de MoveSessionV1.jsx (su consumidor).

   Principio rector del motor guiado (s113): «el usuario toca para empezar,
   pausar o adaptar; NO para empujar la rutina hacia delante». */

/* Constantes del método:
     V1_PLACE_SECONDS   gate auto de colocación (s111/s112).
     V1_REP_SECONDS     cadencia por defecto de reps de FUERZA (~4 s/rep:
                        2 bajar + 2 subir, ref. ACE 2-8 s). Un paso puede
                        declarar `repSeconds` propio (control postural con
                        retención, p. ej. chin tucks 8 s); B2.2b-1 lo
                        formaliza como `tempo`.
     V1_CHANGE_SECONDS  transición AUTO de lado (enmienda R3, s113): señal
                        suave → pantalla con el lado siguiente → empieza solo.
                        Override por paso llega con los metadatos B2.2b-1. */
const V1_PLACE_SECONDS = 5;
const V1_REP_SECONDS = 4;
const V1_CHANGE_SECONDS = 10;
const V1_PREP_SECONDS = 5;   // cuenta 5·4·3·2·1 antes del paso 0 (s113)

/* isDev: localhost / 127.0.0.1 / file:// (mismo criterio que useT.jsx). Sólo
   activa el dev-check de duración declarada vs calculada — invisible en prod. */
const _v1IsDev = (typeof location !== 'undefined') &&
  (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:');

/* tempo (s115/B2.2b-1): generaliza el rep-seconds. Objeto {down,hold,up} → suma;
   número → valor; `repSeconds` legacy y V1_REP_SECONDS como respaldo. ÚNICA
   fuente de la cadencia de una rep guiada. */
function v1TempoSeconds(step) {
  const tm = step && step.tempo;
  if (tm && typeof tm === 'object') return (tm.down || 0) + (tm.hold || 0) + (tm.up || 0);
  if (typeof tm === 'number') return tm;
  if (step && typeof step.repSeconds === 'number') return step.repSeconds;
  return V1_REP_SECONDS;
}
function v1RepSeconds(step) { return v1TempoSeconds(step); }
function v1RepTarget(step) {
  return (typeof step.reps === 'object' ? step.reps.target : step.reps) || 8;
}
/* transición de lado (perSide): segundos declarados o el default s113 (10 s). */
function v1TransitionSeconds(step) {
  return (step && step.transition && typeof step.transition.seconds === 'number')
    ? step.transition.seconds : V1_CHANGE_SECONDS;
}
/* completion: 'guided' (avance auto) por defecto en reps; 'manual' reservado
   (sin piloto). El runner respeta el modo; la duración de guided es fija. */
function v1CompletionMode(step) {
  if (step && step.completion && step.completion.mode) return step.completion.mode;
  return step && step.mode === 'reps' ? 'guided' : 'timed';
}

/* Descanso entre series (s114): los rests con restKind:'betweenSets' toman su
   duración del ajuste de Ajustes (state.restBetweenSets, presets 20/30/45); el
   resto de pasos (incl. los cierres respiratorios sin restKind) usan su `dur`
   declarado. Lee el store global (patrón de Sound.jsx) — el runner re-renderiza
   cada segundo, así que un cambio del preset se refleja en ≤1 s. */
function v1RestSeconds() {
  var s = (typeof getState === 'function') ? getState() : null;
  return (s && typeof s.restBetweenSets === 'number') ? s.restBetweenSets : 30;
}
function v1StepDur(step) {
  if (!step) return 0;
  if (step.mode === 'rest' && step.restKind === 'betweenSets') return v1RestSeconds();
  return step.dur || 0;
}

/* Gate de colocación (s115): comportamiento del runner + estimación de duración
   en UNA sola fuente. `setup:{mode:'ready',estimatedSeconds}` declarado (espera
   al usuario, NUNCA cuenta) — floor/pared/material. El resto se DERIVA como en
   s111/s114:
     auto — pasos con reloj (timed/perSide) e idx>0, o el 1er set de fuerza
            (reps con instruction.setup y NO tras un rest) → gate auto de 5 s.
     none — resto. `setup:número` (s112) sigue siendo un gate auto explícito.
   `ready` aporta estimatedSeconds>0 SÓLO para la duración; jamás es countdown. */
function v1StepSetup(routine, idx) {
  const st = routine.steps[idx];
  if (!st) return { mode: 'none', estimatedSeconds: 0 };
  if (st.setup && st.setup.mode === 'ready') {
    return { mode: 'ready', estimatedSeconds: st.setup.estimatedSeconds || V1_PLACE_SECONDS };
  }
  if (typeof st.setup === 'number') return { mode: 'auto', estimatedSeconds: st.setup };
  const clocked = st.mode === 'timed' || st.mode === 'perSide';
  const prev = idx > 0 ? routine.steps[idx - 1] : null;
  const afterRest = !!(prev && prev.mode === 'rest');
  if (clocked && idx > 0) return { mode: 'auto', estimatedSeconds: V1_PLACE_SECONDS };
  if (st.mode === 'reps' && st.instruction && st.instruction.setup && !afterRest) {
    return { mode: 'auto', estimatedSeconds: V1_PLACE_SECONDS };
  }
  return { mode: 'none', estimatedSeconds: 0 };
}

/* Progreso 0..1 del step activo (barra segmentada). Reps guiadas (s113):
   el progreso es tiempo guiado / tiempo objetivo — cadencia, no cuota. */
function v1StepProgress(step, side, elapsed) {
  if (step.mode === 'reps') {
    const total = v1RepTarget(step) * v1RepSeconds(step);
    return total ? Math.min(1, elapsed / total) : 0;
  }
  if (step.mode === 'perSide') return (side * step.dur + elapsed) / (2 * step.dur);
  const d = v1StepDur(step);   // rest betweenSets = preset de Ajustes (s114)
  return d ? elapsed / d : 0;
}
/* Peso del step para la barra segmentada (estimación honesta por tipo).
   s115: la rama timed/rest usa v1StepDur — MISMA fuente efectiva que el
   progreso, el aviso de 5 s y el remaining (antes leía step.dur crudo → con el
   preset 20/45 el peso divergía del llenado; deuda del criterio de aceptación). */
function v1StepWeight(step) {
  if (step.mode === 'reps') return v1RepTarget(step) * v1RepSeconds(step);
  if (step.mode === 'perSide') return (step.dur || 20) * 2;
  return v1StepDur(step) || 20;
}

/* Tamaño del visual instructivo por ALTURA de viewport (s112). s113 añade el
   tramo <720 px SIN el suelo de 150 y con pendiente menor (0.22): en poca
   altura el glifo cede antes que las instrucciones o los controles
   (medido: a 600 px, con 150 el paso de reps desbordaba 16 px; con 132 cabe). */
function v1GlyphSize(vpH) {
  if (vpH >= 720) return Math.max(150, Math.min(240, Math.round(vpH * 0.25)));
  return Math.max(72, Math.round(vpH * 0.22));
}

/* Duración DERIVADA de los pasos (s115/B2.2b-1). Helper PURO: dado el preset de
   descanso, devuelve {minSec,maxSec,breakdown} sin tocar el runner ni el reloj.
     reps guiadas → target × tempo (FIJO; 'manual' añadiría banda, sin piloto).
     perSide      → dur POR LADO × 2 + UNA transición (evita el cuádruple conteo).
     rest         → betweenSets: preset; cierre: su dur.
     timed        → dur.
   + prep global v1 + setup por paso (estimatedSeconds; ready FIJO, nunca cuenta).
   NO se guarda como dato canónico: se recalcula al vuelo (tarjeta, dev-check).
   DURACIÓN PLANIFICADA (no real): «terminar antes» reduce el reloj real, no la
   promesa. La banda del rango nace SÓLO de tiempos variables del contrato
   (completion manual); en los 5 pilotos actuales min===max (guided/timed). */
function estimateDuration(routine, restBetweenSets) {
  const rbs = (typeof restBetweenSets === 'number') ? restBetweenSets : 30;
  const steps = (routine && routine.steps) || [];
  const breakdown = [{ label: 'prep', sec: V1_PREP_SECONDS }];
  let minSec = V1_PREP_SECONDS, maxSec = V1_PREP_SECONDS;
  steps.forEach((st, idx) => {
    const setupSec = v1StepSetup(routine, idx).estimatedSeconds || 0;
    let lo = 0, hi = 0;
    if (st.mode === 'reps') {
      const active = v1RepTarget(st) * v1RepSeconds(st);
      lo = active; hi = v1CompletionMode(st) === 'manual' ? Math.round(active * 1.5) : active;
    } else if (st.mode === 'perSide') {
      lo = hi = (st.dur || 0) * 2 + v1TransitionSeconds(st);
    } else if (st.mode === 'rest') {
      lo = hi = (st.restKind === 'betweenSets') ? rbs : (st.dur || 0);
    } else {
      lo = hi = st.dur || 0;   // timed
    }
    breakdown.push({ i: idx, name: st.name, mode: st.mode, setup: setupSec, active: lo, activeMax: hi });
    minSec += setupSec + lo; maxSec += setupSec + hi;
  });
  return { minSec, maxSec, breakdown };
}

/* Dev-check (s115): compara routine.min DECLARADO con el rango CALCULADO. La
   comparación es a NIVEL de MINUTOS mostrados [floor(min),ceil(max)] — no en
   segundos: una rutina determinista casi nunca cae en un múltiplo exacto de 60,
   así que un umbral en segundos avisaría siempre (ruido). Avisa SÓLO si los
   minutos declarados quedan fuera del rango que ve el usuario (umbral
   verificable, sin ruido para valores dentro). Prod muestra UNA sola promesa
   (la tarjeta usa el derivado); esto es diagnóstico y sólo corre en dev.
   routine.min queda como baseline de auditoría. */
function v1DevCheckDuration(routine, restBetweenSets) {
  if (!_v1IsDev || !routine) return;
  const est = estimateDuration(routine, restBetweenSets);
  const lo = Math.floor(est.minSec / 60), hi = Math.ceil(est.maxSec / 60);
  const outside = routine.min < lo || routine.min > hi;
  const head = `[dur] ${routine.id}: declarado ${routine.min}min vs calculado ${est.minSec}–${est.maxSec}s (rango ${lo}–${hi}min)`;
  if (outside) console.warn(head + ' — DECLARADO fuera del rango mostrado', est.breakdown);
  else console.log(head + ' — dentro', est.breakdown);
}

/* CSS del runner v1 (s113):
   - pace-rep-pulse: pulso de cadencia de las reps guiadas (mitad «bajar» +
     mitad «subir», ease-in-out; la duración real la fija el runner inline
     con repSeconds). NO cuelga de data-pace-essential a propósito: el kill
     global de prefers-reduced-motion (tokens.css) lo congela y queda el
     contador sin animación — el fallback que pide el corte.
   - Compactación por ALTURA, solo ≥641 px de ancho (el responsive móvil por
     anchura de s27/SessionShell sigue gobernando el retrato estrecho, ya
     verificado en 360×640). Orden de reducción: espacios → glifo →
     decorativo; NUNCA instrucciones ni controles. El scroll del centro
     (s112) queda solo como red de seguridad. Tiers: 720 (portátil bajo,
     1280×600) · 560 (1024×512) · 430 (landscape móvil, 844×390 — el glifo
     se oculta: espacios y glifo se agotan antes de tocar instrucciones). */
const _paceMoveV1Css = document.getElementById('pace-move-v1-css');
if (!_paceMoveV1Css) {
  const s = document.createElement('style');
  s.id = 'pace-move-v1-css';
  s.textContent = `
    @keyframes pace-rep-pulse {
      0%   { transform: scale(1); }
      50%  { transform: scale(0.86); }
      100% { transform: scale(1); }
    }
    @media (min-width: 641px) and (max-height: 700px) {
      /* s114: la capa «Cuídate» suma una línea — se recupera altura apretando
         espacios (nunca instrucciones) para mantener el delta 0 de s113. */
      [data-pace-v1-glyph] > div { margin-bottom: 8px !important; }
      [data-pace-v1-name] { margin-bottom: 8px !important; }
      [data-pace-v1-cue] { margin-bottom: 6px !important; }
      [data-pace-v1-care] { margin-top: 6px !important; }
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      [data-pace-v1-glyph] > div { margin-bottom: 10px !important; }
      [data-pace-v1-kicker] { margin-bottom: 8px !important; }
      [data-pace-v1-name] { font-size: 26px !important; }
      [data-pace-v1-cue] { font-size: 14px !important; margin-bottom: 10px !important; }
      [data-pace-v1-support-strong] { font-size: 18px !important; margin-top: 10px !important; }
      [data-pace-v1-support] { font-size: 12px !important; }
      /* s114: en poca altura se oculta el RÓTULO «Cuídate», nunca el contenido
         (decisión A) — la adaptación sigue visible como línea secundaria. */
      [data-pace-v1-care] { font-size: 12px !important; margin-top: 10px !important; }
      [data-pace-v1-care-label] { display: none !important; }
      [data-pace-v1-progress] { margin-top: 10px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-v1-glyph] { display: none !important; }
      [data-pace-v1-name] { font-size: 22px !important; margin-bottom: 6px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 8px !important; }
      [data-pace-v1-care] { font-size: 11.5px !important; margin-top: 8px !important; }
    }
    /* Retrato estrecho con poca altura (360×640: el paso de reps desbordaba
       18 px): SOLO espacios — la tipografía ya la gobierna el bloque móvil
       por anchura de SessionShell/MoveModule (s27). */
    @media (max-width: 640px) and (max-height: 700px) {
      [data-pace-v1-glyph] > div { margin-bottom: 12px !important; }
      [data-pace-v1-kicker] { margin-bottom: 8px !important; }
      [data-pace-v1-name] { margin-bottom: 8px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-support-strong] { margin-top: 10px !important; }
      [data-pace-v1-care] { margin-top: 8px !important; }
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  V1_PLACE_SECONDS, V1_REP_SECONDS, V1_CHANGE_SECONDS, V1_PREP_SECONDS,
  v1RepSeconds, v1RepTarget, v1TempoSeconds, v1TransitionSeconds, v1CompletionMode,
  v1RestSeconds, v1StepDur, v1StepSetup, v1StepProgress, v1StepWeight, v1GlyphSize,
  estimateDuration, v1DevCheckDuration,
});
