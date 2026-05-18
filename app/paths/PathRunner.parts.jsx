/* PACE · Caminos · PathRunner parts · sesion 80 (split de PathRunner.jsx)
   Componentes auxiliares del overlay del Camino que no son orquestador:
   - PathTopBar: barra superior fija con nombre del Camino y boton cerrar.
   - ExitConfirmModal: confirmacion in-app antes de abandonar el Camino.
   - StepError: fallback visual cuando un routineId no resuelve.
   Aislados aqui para que PathRunner.jsx quede solo con la maquina de
   fases y el dispatcher por step.kind. */

const { useEffect: useEffectPP, useRef: useRefPP } = React;

/* PathTopBar - nombre del Camino + boton de salida.
   Sesion 75: dots eliminados (los reemplaza SenderoBar). */
function PathTopBar({ pathName, onRequestExit }) {
  const { t } = useT();
  return (
    <div className="path-topbar">
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 22, fontWeight: 400, color: 'var(--ink)',
        letterSpacing: '0.005em',
      }}>
        {pathName}
      </div>
      <div style={{ flex: 1 }} />
      <button
        onClick={onRequestExit}
        aria-label={t('path.runner.exit')}
        style={{
          background: 'transparent', border: 'none',
          color: 'var(--ink-3)', cursor: 'pointer',
          padding: 8, fontSize: 20, lineHeight: 1,
        }}
      >
        &#x2715;
      </button>
    </div>
  );
}

/* ExitConfirmModal - confirmacion in-app (sin llamada al dialog nativo) */
function ExitConfirmModal({ open, onCancel, onConfirm }) {
  const { t } = useT();
  const cancelBtnRef = useRefPP(null);

  useEffectPP(() => {
    if (!open) return;
    // Focus en boton Seguir al abrir
    if (cancelBtnRef.current) cancelBtnRef.current.focus();
    // Cerrar con Escape
    function handleKey(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="path-modal-back"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)', borderRadius: 'var(--r-md)',
          padding: 32, maxWidth: 380, width: '90%',
          border: '1px solid var(--line)',
        }}
      >
        <h3 id="exit-confirm-title" style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 500 }}>
          {t('path.runner.exitConfirmTitle')}
        </h3>
        <p style={{ margin: '0 0 24px', color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
          {t('path.runner.exitConfirmBody')}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r-sm)',
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
            }}
          >
            {t('path.runner.exitConfirmNo')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r-sm)',
              background: 'var(--terracota)', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >
            {t('path.runner.exitConfirmYes')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* StepError - fallback si routineId no resuelve */
function StepError({ routineId, onSkip }) {
  const { t } = useT();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      <p style={{ color: 'var(--ink-2)', marginBottom: 20, fontSize: 14 }}>
        {t('path.error.routineNotFound').replace('{id}', routineId)}
      </p>
      <button
        onClick={onSkip}
        style={{
          padding: '10px 24px', borderRadius: 'var(--r-sm)',
          background: 'var(--paper-2)', border: '1px solid var(--line)',
          color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
        }}
      >
        {t('path.runner.skip')}
      </button>
    </div>
  );
}

Object.assign(window, { PathTopBar, ExitConfirmModal, StepError });
