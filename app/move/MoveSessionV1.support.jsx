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

function v1RepSeconds(step) {
  return typeof step.repSeconds === 'number' ? step.repSeconds : V1_REP_SECONDS;
}
function v1RepTarget(step) {
  return (typeof step.reps === 'object' ? step.reps.target : step.reps) || 8;
}

/* Progreso 0..1 del step activo (barra segmentada). Reps guiadas (s113):
   el progreso es tiempo guiado / tiempo objetivo — cadencia, no cuota. */
function v1StepProgress(step, side, elapsed) {
  if (step.mode === 'reps') {
    const total = v1RepTarget(step) * v1RepSeconds(step);
    return total ? Math.min(1, elapsed / total) : 0;
  }
  if (step.mode === 'perSide') return (side * step.dur + elapsed) / (2 * step.dur);
  return step.dur ? elapsed / step.dur : 0;
}
/* Peso del step para la barra segmentada (estimación honesta por tipo). */
function v1StepWeight(step) {
  if (step.mode === 'reps') return v1RepTarget(step) * v1RepSeconds(step);
  if (step.mode === 'perSide') return (step.dur || 20) * 2;
  return step.dur || 20;
}

/* Tamaño del visual instructivo por ALTURA de viewport (s112). s113 añade el
   tramo <720 px SIN el suelo de 150 y con pendiente menor (0.22): en poca
   altura el glifo cede antes que las instrucciones o los controles
   (medido: a 600 px, con 150 el paso de reps desbordaba 16 px; con 132 cabe). */
function v1GlyphSize(vpH) {
  if (vpH >= 720) return Math.max(150, Math.min(240, Math.round(vpH * 0.25)));
  return Math.max(72, Math.round(vpH * 0.22));
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
      [data-pace-v1-glyph] > div { margin-bottom: 12px !important; }
      [data-pace-v1-name] { margin-bottom: 8px !important; }
      [data-pace-v1-cue] { margin-bottom: 10px !important; }
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      [data-pace-v1-glyph] > div { margin-bottom: 10px !important; }
      [data-pace-v1-kicker] { margin-bottom: 8px !important; }
      [data-pace-v1-name] { font-size: 26px !important; }
      [data-pace-v1-cue] { font-size: 14px !important; margin-bottom: 10px !important; }
      [data-pace-v1-support-strong] { font-size: 18px !important; margin-top: 10px !important; }
      [data-pace-v1-support] { font-size: 12px !important; }
      [data-pace-v1-progress] { margin-top: 10px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-v1-glyph] { display: none !important; }
      [data-pace-v1-name] { font-size: 22px !important; margin-bottom: 6px !important; }
      [data-pace-v1-cue] { font-size: 13px !important; margin-bottom: 8px !important; }
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
      [data-pace-v1-progress] { margin-top: 12px !important; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  V1_PLACE_SECONDS, V1_REP_SECONDS, V1_CHANGE_SECONDS,
  v1RepSeconds, v1RepTarget, v1StepProgress, v1StepWeight, v1GlyphSize,
});
