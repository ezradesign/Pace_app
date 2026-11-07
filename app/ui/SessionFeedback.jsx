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

   EL «NO» DICE LO QUE HACE (Ez, 5 nov. 2026: 2A, «pero durante una semana»). Un «No»
   a una rutina que nunca ayudó la aparta una semana de lo que PACE propone
   (breakVetadas), y hasta entonces solo se leía «Gracias». Ahora el acuse lo dice y
   lleva «Deshacer», que devuelve la pregunta y la entrada de antes. Por eso el evento
   de ese «No» espera a que se deje la pantalla (o la página): el registro no se
   reescribe, y un «No» deshecho no debe quedar en él. Solo se promete apartar lo que
   se propone de verdad (breakProponible).

   «AHORA NO», EN SU LÍNEA (Ez, 5 nov. 2026): debajo de Sí · Un poco · No, centrado.
   Hasta entonces iba al final de la misma fila (Ez, 16 oct., opción B).

   Props: routineId (clave del conteo) · kind ('move'|'extra'|'breathe', informa
   el acento) · accent (color CSS var del módulo, para el hover de los chips).
*/

const { useState: useStateSF, useRef: useRefSF, useEffect: useEffectSF } = React;

function SessionFeedback({ routineId, kind = 'move', accent = 'var(--move)' }) {
  const { t } = useT();
  // Gate por-día CAPTURADO en el mount (no reactivo — ver cabecera).
  const [shouldShow] = useStateSF(() => {
    try { return shouldPromptRoutineFeedback(routineId); } catch (e) { return false; }
  });
  const [decided, setDecided] = useStateSF(false);
  const [aparta, setAparta] = useStateSF(false);
  const lockRef = useRefSF(false);
  /* El «No» que aún se puede deshacer: { antes } con la entrada previa. */
  const pendienteRef = useRefSF(null);

  useEffectSF(() => {
    const emitir = () => {
      if (!pendienteRef.current) return;
      pendienteRef.current = null;
      try { if (typeof emitFeedbackAnswered === 'function') emitFeedbackAnswered(routineId, 'no'); } catch (e) {}
    };
    window.addEventListener('pagehide', emitir);
    return () => { window.removeEventListener('pagehide', emitir); emitir(); };
  }, [routineId]);

  if (!shouldShow) return null;

  const answer = (response) => {
    if (lockRef.current) return;            // guard SÍNCRONO: máx UNA decisión
    lockRef.current = true;
    const no = response === 'no';
    let antes = null;
    try { antes = no ? ((getState().routineFeedback || {})[routineId] || null) : null; } catch (e) {}
    try { recordRoutineFeedback(routineId, response, { sinEvento: no }); } catch (e) {}
    if (no) {
      pendienteRef.current = { antes: antes };
      let si = false;
      try { si = breakProponible(routineId) && !!breakVetadas(getState().routineFeedback)[routineId]; } catch (e) {}
      setAparta(si);
    }
    setDecided(true);
  };

  const deshacer = () => {
    const p = pendienteRef.current;
    pendienteRef.current = null;
    try { restaurarRoutineFeedback(routineId, p ? p.antes : null); } catch (e) {}
    lockRef.current = false;
    setAparta(false);
    setDecided(false);
  };

  const wrapStyle = {
    ...sessionFeedbackStyles.wrap,
    // El hover de los chips toma el acento del módulo vía esta custom prop.
    '--pace-fb-accent': letraDe(accent),   /* pinta letra y filo: el hondo (Ez, 2B) */
  };

  return (
    <div data-pace-session-feedback data-pace-fb-kind={kind} style={wrapStyle}>
      <div data-pace-fb-rule style={sessionFeedbackStyles.rule} />
      {decided ? (
        <div data-pace-fb-thanks style={sessionFeedbackStyles.thanks}>
          {aparta ? (
            <React.Fragment>
              {t('session.feedback.aparta')}{' '}
              <button type="button" data-pace-fb-deshacer onClick={deshacer} style={sessionFeedbackStyles.deshacer}>
                {t('session.feedback.deshacer')}
              </button>
            </React.Fragment>
          ) : t('session.feedback.thanks')}
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
    fontSize: 17, color: 'var(--ink-2)',
    marginBottom: 14,
  },
  /* «Ahora no» va en su línea, debajo (Ez, 5 nov.). El 16 oct. (opción B) iba al final de esta
     fila porque debajo, en las ventanas bajas, «Volver al inicio» lo tapaba; desde entonces el
     cierre ocupa el alto del centro y el dibujo encoge (lo mide cierre-sin-pisar.spec.js). */
  chips: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 10,
  },
  /* Las respuestas son píldoras en la serif itálica, como las de la pausa (la A de Ez,
     10 oct., docs/traspaso/archivos/cierre-y-linea-10oct/): con la letra de interfaz de
     antes, la pantalla final «mantenía la tipografía estándar» y se veía «un poco cutre». */
  chip: {
    ...displayItalic,
    padding: '0 22px', minHeight: 42, fontSize: 17, fontWeight: 500,
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-pill)',
    background: 'var(--paper-2)', color: 'var(--ink)',
    transition: 'border-color 160ms ease, color 160ms ease, background 160ms ease',
  },
  /* «Ahora no» es un enlace, como «Saltar esta pausa». */
  ghost: {
    ...displayItalic,
    fontSize: 15, color: 'var(--ink-3)',
    background: 'none', border: 'none', padding: '4px 10px', marginTop: 8,
    textDecoration: 'underline', textUnderlineOffset: 3,
    transition: 'color 160ms ease',
  },
  /* «Deshacer», dentro del acuse: el mismo enlace, en su línea de texto. */
  deshacer: {
    ...displayItalic,
    fontSize: 'inherit', color: 'var(--ink-2)',
    background: 'none', border: 'none', padding: '0 2px', cursor: 'pointer',
    textDecoration: 'underline', textUnderlineOffset: 3,
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
    }

    @media (max-width: 640px) {
      [data-pace-session-feedback] { margin-top: 2px !important; }
      [data-pace-fb-rule] { margin-bottom: 14px !important; }
      [data-pace-fb-question] { margin-bottom: 12px !important; }
      [data-pace-fb-chip] { padding: 0 20px !important; }
    }
    @media (min-width: 641px) and (max-height: 560px) {
      [data-pace-fb-rule] { margin-bottom: 12px !important; }
      [data-pace-fb-question] { font-size: 15px !important; margin-bottom: 10px !important; }
      [data-pace-fb-chip] { padding: 0 18px !important; min-height: 38px !important; }
      [data-pace-fb-ghost] { margin-top: 4px !important; padding: 2px 10px !important; }
    }
    @media (min-width: 641px) and (max-height: 430px) {
      [data-pace-session-feedback] { margin-top: 0 !important; }
      [data-pace-fb-rule] { display: none !important; }
      [data-pace-fb-question] { font-size: 14px !important; margin-bottom: 8px !important; }
      [data-pace-fb-chip] { padding: 0 16px !important; min-height: 34px !important; font-size: 15px !important; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  SessionFeedback, sessionFeedbackStyles,
});
