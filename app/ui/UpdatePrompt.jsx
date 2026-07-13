/* PACE · UpdatePrompt — aviso de versión nueva del SW (s102 · v0.47.0)
   El registro del SW en PACE.html detecta un worker en waiting (el
   skipWaiting incondicional se retiró de sw.js en s102) y lo anuncia con
   window.__paceSwWaitingReg + CustomEvent 'pace:sw-waiting'. Este componente
   escucha ambos (la referencia en window cubre el caso de que el anuncio
   llegue ANTES de que React monte: Babel standalone compila async).
   "Actualizar" -> postMessage SKIP_WAITING al worker; el controllerchange
   del registro recarga la página ya con la versión nueva.
   "Luego" -> cierra el aviso; el worker queda en waiting y activará solo
   cuando se cierren todas las pestañas de la app.
   En file:// (standalone offline) no hay SW: retorna null siempre. */

const { useState: useStateUP, useEffect: useEffectUP } = React;

function UpdatePrompt() {
  const { t } = useT();
  const [visible, setVisible] = useStateUP(false);
  const [applying, setApplying] = useStateUP(false);

  useEffectUP(() => {
    if (window.__paceSwWaitingReg) setVisible(true); // anunciado antes del mount
    const h = () => setVisible(true);
    window.addEventListener('pace:sw-waiting', h);
    return () => window.removeEventListener('pace:sw-waiting', h);
  }, []);

  if (!visible) return null;

  const apply = () => {
    const reg = window.__paceSwWaitingReg;
    if (reg && reg.waiting) {
      setApplying(true);
      try { reg.waiting.postMessage({ type: 'SKIP_WAITING' }); } catch (e) {}
    } else {
      setVisible(false); // el waiting ya no existe (activó por otra vía)
    }
  };

  return (
    /* Wrapper centrador SIN transform: pace-slide-up anima `transform`
       (translateY) y pisaría un translateX(-50%) de centrado durante los
       280ms. El wrapper centra con flex; la barra interior lleva la
       animación. */
    <div data-pace-update-prompt style={updatePromptStyles.wrap}>
      <div role="status" style={updatePromptStyles.bar}>
        <span style={updatePromptStyles.msg}>{t('update.msg')}</span>
        <button
          onClick={apply}
          disabled={applying}
          style={{ ...updatePromptStyles.cta, opacity: applying ? 0.6 : 1 }}
        >{applying ? t('update.applying') : t('update.cta')}</button>
        {!applying && (
          <button onClick={() => setVisible(false)} style={updatePromptStyles.later}>
            {t('update.later')}
          </button>
        )}
      </div>
    </div>
  );
}

const updatePromptStyles = {
  wrap: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 20,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 150, // sobre paneles (Tweaks 80), bajo los toasts de logros (200)
    padding: '0 16px',
  },
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: 'var(--paper)',
    border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-md)',
    boxShadow: 'var(--sh-card)',
    animation: 'pace-slide-up 280ms var(--ease)',
    maxWidth: '100%',
    pointerEvents: 'auto',
  },
  msg: {
    fontSize: 12,
    color: 'var(--ink-2)',
    letterSpacing: 0.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cta: {
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 0.3,
    color: 'var(--paper)',
    background: 'var(--ink)',
    border: '1px solid var(--ink)',
    borderRadius: 'var(--r-sm)',
    flexShrink: 0,
    transition: 'all 180ms',
  },
  later: {
    padding: '5px 4px',
    fontSize: 11,
    color: 'var(--ink-3)',
    background: 'transparent',
    border: 'none',
    letterSpacing: 0.2,
    flexShrink: 0,
  },
};

Object.assign(window, { UpdatePrompt });
