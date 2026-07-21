/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   SessionFeedback — feedback ligero del cierre de sesión (s116 · B2.2b-2)
   ======================================================================
   Bloque OPCIONAL bajo el copy de cierre del DONE (SessionDone gana un slot
   `feedback`). Una sola pregunta calmada —«¿Te ayudó esta pausa?»— con tres
   respuestas de igual peso (Sí · Un poco · No) + «Ahora no» como salida
   secundaria. Coherente con el tono PACE: opcional, saltable, sin porcentajes,
   sin gamificación. El CTA de regreso del DONE sigue SIEMPRE disponible: no
   hace falta responder para salir.

   Autogestión (el runner solo lo monta cuando NO está en un Camino):
   - Gate por-día capturado UNA vez en el mount (shouldPromptRoutineFeedback):
     si ya se preguntó por esta rutina hoy, el bloque no se muestra (render
     null). Se captura en el inicializador de useState para que NO desaparezca
     al re-renderizar tras registrar (recordRoutineFeedback escribe lastPromptDay
     → shouldPrompt pasaría a false, pero el acuse «Gracias» debe permanecer).
   - Idempotencia: guard SÍNCRONO (lockRef) bloquea reenvíos antes de que React
     re-renderice (doble clic / doble Enter); al decidir, el bloque se sustituye
     por el acuse efímero «Gracias», así los controles dejan de existir.

   Props: routineId (clave del conteo) · kind ('move'|'extra'|'breathe', informa
   el acento) · accent (color CSS var del módulo, para el hover de los chips).
*/

const { useState: useStateSF, useRef: useRefSF } = React;

function SessionFeedback({ routineId, kind = 'move', accent = 'var(--move)' }) {
  const { t } = useT();
  // Gate por-día CAPTURADO en el mount (no reactivo — ver cabecera).
  const [shouldShow] = useStateSF(() => {
    try { return shouldPromptRoutineFeedback(routineId); } catch (e) { return false; }
  });
  const [decided, setDecided] = useStateSF(false);
  const lockRef = useRefSF(false);

  if (!shouldShow) return null;

  const answer = (response) => {
    if (lockRef.current) return;            // guard SÍNCRONO: máx UNA decisión
    lockRef.current = true;
    try { recordRoutineFeedback(routineId, response); } catch (e) {}
    setDecided(true);
  };

  const wrapStyle = {
    ...sessionFeedbackStyles.wrap,
    // El hover de los chips toma el acento del módulo vía esta custom prop.
    '--pace-fb-accent': accent,
  };

  return (
    <div data-pace-session-feedback data-pace-fb-kind={kind} style={wrapStyle}>
      <div data-pace-fb-rule style={sessionFeedbackStyles.rule} />
      {decided ? (
        <div data-pace-fb-thanks style={sessionFeedbackStyles.thanks}>
          {t('session.feedback.thanks')}
        </div>
      ) : (
        <React.Fragment>
          <div data-pace-fb-question style={sessionFeedbackStyles.question}>
            {t('session.feedback.question')}
          </div>
          <div data-pace-fb-chips style={sessionFeedbackStyles.chips}>
            <button type="button" data-pace-fb-chip disabled={decided}
                    onClick={() => answer('yes')} style={sessionFeedbackStyles.chip}>
              {t('session.feedback.yes')}
            </button>
            <button type="button" data-pace-fb-chip disabled={decided}
                    onClick={() => answer('some')} style={sessionFeedbackStyles.chip}>
              {t('session.feedback.some')}
            </button>
            <button type="button" data-pace-fb-chip disabled={decided}
                    onClick={() => answer('no')} style={sessionFeedbackStyles.chip}>
              {t('session.feedback.no')}
            </button>
          </div>
          <button type="button" data-pace-fb-ghost disabled={decided}
                  onClick={() => answer('later')} style={sessionFeedbackStyles.ghost}>
            {t('session.feedback.later')}
          </button>
        </React.Fragment>
      )}
    </div>
  );
}

const sessionFeedbackStyles = {
  wrap: {
    marginTop: 4,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  rule: {
    width: 40, height: 1,
    background: 'var(--line-2)', opacity: 0.7,
    margin: '0 auto 18px',
  },
  question: {
    ...displayItalic,
    fontSize: 16, color: 'var(--ink-2)',
    marginBottom: 14,
  },
  chips: {
    display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10,
  },
  chip: {
    padding: '9px 18px', fontSize: 13,
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--paper-2)', color: 'var(--ink)',
    transition: 'border-color 160ms ease, color 160ms ease, background 160ms ease',
  },
  ghost: {
    marginTop: 12, fontSize: 12, color: 'var(--ink-3)',
    background: 'none', border: 'none', padding: '4px 10px',
    letterSpacing: '0.04em',
    transition: 'color 160ms ease',
  },
  thanks: {
    ...displayItalic,
    fontSize: 16, color: 'var(--ink-3)',
    paddingTop: 2,
  },
};

/* ============================================================
   CSS del bloque de feedback: hover (acento del módulo) + compactación
   responsive propia (vive AQUÍ, no en el shell — cada superficie gobierna la
   suya). El bloque es contenido FUNCIONAL: sus espacios se reducen con la
   altura pero la pregunta, las respuestas y «Ahora no» NUNCA se ocultan; solo
   el filete decorativo desaparece en el tier más bajo. El centro del shell es
   scrollable (red de seguridad de s112) si aun así no cupiese.
   ============================================================ */
const _paceSessionFeedbackCss = document.getElementById('pace-session-feedback-css');
if (!_paceSessionFeedbackCss) {
  const s = document.createElement('style');
  s.id = 'pace-session-feedback-css';
  s.textContent = `
    [data-pace-fb-chip]:hover:not(:disabled) {
      border-color: var(--pace-fb-accent) !important;
      color: var(--pace-fb-accent) !important;
    }
    [data-pace-fb-chip]:disabled { opacity: 0.6; cursor: default; }
    [data-pace-fb-ghost]:hover:not(:disabled) {
      color: var(--ink-2) !important;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    @media (max-width: 640px) {
      [data-pace-session-feedback] { margin-top: 2px !important; }
      [data-pace-fb-rule] { margin-bottom: 14px !important; }
      [data-pace-fb-question] { font-size: 14px !important; margin-bottom: 12px !important; }
      [data-pace-fb-chip] { padding: 8px 15px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      [data-pace-fb-rule] { margin-bottom: 12px !important; }
      [data-pace-fb-question] { font-size: 15px !important; margin-bottom: 10px !important; }
      [data-pace-fb-chip] { padding: 8px 16px !important; }
      [data-pace-fb-ghost] { margin-top: 8px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-session-feedback] { margin-top: 0 !important; }
      [data-pace-fb-rule] { display: none !important; }
      [data-pace-fb-question] { font-size: 14px !important; margin-bottom: 8px !important; }
      [data-pace-fb-chip] { padding: 7px 14px !important; font-size: 12px !important; }
      [data-pace-fb-ghost] { margin-top: 6px !important; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  SessionFeedback, sessionFeedbackStyles,
});
