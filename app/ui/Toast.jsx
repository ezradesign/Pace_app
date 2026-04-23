/* PACE · Toast (para notificar logros desbloqueados) */

const { useState: useStateTO, useEffect: useEffectTO } = React;

function ToastHost() {
  const [toasts, setToasts] = useStateTO([]);

  useEffectTO(() => {
    return onToast((t) => {
      // Resolver datos del logro
      if (t.type === 'achievement') {
        const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === t.id);
        if (!a) return;
        const full = { ...t, title: a.title, desc: a.desc, glyph: a.glyph };
        setToasts(prev => [...prev, full]);
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x._id !== full._id));
        }, 5000);
      }
    });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t._id} style={{
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
          }}>{t.glyph}</div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--achievement)' }}>Nuevo sello</div>
            <div style={{ ...displayItalic, fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ToastHost });
