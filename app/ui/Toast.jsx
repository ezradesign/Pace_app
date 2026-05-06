/* PACE · Toast (para notificar logros desbloqueados) */

const { useState: useStateTO, useEffect: useEffectTO } = React;

function ToastHost() {
  const [toasts, setToasts] = useStateTO([]);
  const { t } = useT();

  useEffectTO(() => {
    return onToast((toast) => {
      // Resolver datos del logro
      if (toast.type === 'achievement') {
        const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === toast.id);
        if (!a) return;
        const full = { ...toast, title: a.title, desc: a.desc, glyph: a.glyph };
        setToasts(prev => [...prev, full]);
        try { playSound(a.secret ? 'achievement.secret' : 'achievement.unlock'); } catch(e) {}
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x._id !== full._id));
        }, 5000);
      }
    });
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: 20, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <div key={toast._id} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 20px',
          background: 'var(--paper)',
          border: '1px solid var(--achievement)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-card)',
          animation: 'pace-slide-up 320ms var(--ease)',
          minWidth: 280,
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            border: '1px solid var(--achievement)',
            display: 'grid', placeItems: 'center',
            color: 'var(--achievement)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
          }}>{toast.glyph}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--achievement)' }}>{t('ach.toast.new')}</div>
            <div style={{ ...displayItalic, fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>{toast.title}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{toast.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ToastHost });
