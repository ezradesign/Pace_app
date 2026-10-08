/* PACE · Toast (para notificar logros desbloqueados) */

const { useState: useStateTO, useEffect: useEffectTO } = React;

function ToastHost() {
  const [toasts, setToasts] = useStateTO([]);
  const { t, lang } = useT();
  /* s167 — el aviso copiaba `a.title`/`a.desc` del catalogo, asi que el «Nuevo
     sello» se anunciaba en español aunque la app estuviera en ingles. Mismo
     helper que Achievements.jsx y que Respira/Mueve/Extra. */
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };

  useEffectTO(() => {
    return onToast((toast) => {
      // Resolver datos del logro
      if (toast.type === 'achievement') {
        const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === toast.id);
        if (!a) return;
        /* s79: exiting=false al insertar; la transicion CSS de opacity hace el fade. */
        const full = { ...toast,
          title: tR('ach.item.' + a.id + '.title', a.title),
          desc: tR('ach.item.' + a.id + '.desc', a.desc),
          glyph: a.glyph, glyphSvg: a.glyphSvg, exiting: false };
        try { playSound(a.secret ? 'achievement.secret' : 'achievement.unlock'); } catch(e) {}
        mostrar(full, (typeof TOAST_DURATION_MS === 'number') ? TOAST_DURATION_MS : 3000);
      }
      /* El enlace de un código de PACE completo (state-licencia.js). Sin sonido: no
         es un logro. Dura el doble, porque llega al abrir la app y hay que leerlo. */
      if (toast.type === 'licencia') {
        mostrar({ ...toast, exiting: false, licencia: true,
          eyebrow: t('premium.settings.code'),
          title: t(toast.ok ? 'premium.ok.title' : 'premium.err.title'),
          desc: toast.ok ? t(toast.tester ? 'premium.ok.tester' : 'premium.ok.other')
            : t('premium.err.' + (toast.motivo || 'formato')) }, 6000);
      }
    });
  }, []);

  /* Tres fases: visible (durationMs) -> exiting (300 ms de opacity 1->0) -> fuera del array. */
  function mostrar(full, durationMs) {
    setToasts(prev => [...prev, full]);
    setTimeout(() => {
      setToasts(prev => prev.map(x => x._id === full._id ? { ...x, exiting: true } : x));
    }, durationMs);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x._id !== full._id));
    }, durationMs + 300);
  }

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
        <div key={toast._id} data-pace-toast={toast.licencia ? 'licencia' : 'logro'} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 20px',
          background: 'var(--paper)',
          border: '1px solid ' + (toast.licencia ? 'var(--premium)' : 'var(--achievement)'),
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-card)',
          animation: 'pace-slide-up 320ms var(--ease)',
          minWidth: 280,
          maxWidth: 'calc(100vw - 32px)',
          opacity: toast.exiting ? 0 : 1,
          transition: 'opacity 300ms ease-out',
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: '50%',
            border: '1px solid ' + (toast.licencia ? 'var(--premium)' : 'var(--achievement)'),
            display: 'grid', placeItems: 'center', flex: 'none',
            color: toast.licencia ? 'var(--premium)' : 'var(--achievement)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 18,
          }}>
            {/* s147: el aviso pintaba el glifo VIEJO. Este bloque era una TERCERA
                copia del render de glifo, y s146 solo unificó modal y sidebar, así
                que las máscaras del usuario no llegaban aquí: desbloquear un logro
                con dibujo nuevo seguía anunciando el SVG heráldico. Ahora delega en
                el `renderGlyph` compartido —la misma función, no una copia—, que
                resuelve máscara → SVG → carácter. `toast` ya lleva id/glyph/glyphSvg,
                que es todo lo que esa función lee. */}
            {toast.licencia ? <PaceCandado size={14} abierto={!!toast.ok} />
              : window.renderGlyph
              ? window.renderGlyph(toast)
              : <span style={{ fontStyle: 'italic' }}>{toast.glyph}</span>
            }
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: toast.licencia ? 'var(--premium)' : 'var(--achievement)' }}>{toast.eyebrow || t('ach.toast.new')}</div>
            <div style={{ ...displayItalic, fontSize: 18, fontWeight: 500, lineHeight: 1.2 }}>{toast.title}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{toast.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { ToastHost });