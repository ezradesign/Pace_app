/* PACE · Toast (para notificar logros desbloqueados) */

const { useState: useStateTO, useEffect: useEffectTO } = React;

/* EN LA HOME, EL SELLO HABLA DESDE EL ARO (Ez, 9 oct. 2026: «que tampoco tape en la home»).
   El aviso ya espera a que no haya ninguna ventana ni sesión abierta (state-core.toast.jsx),
   pero en la home salía abajo, en una caja encima de la tarjeta o la línea del día, y en el
   móvil no queda ningún hueco libre: todo el alto está ocupado para que no haya scroll. Así
   que ocupa, mientras dura, el sitio de la línea en cursiva de dentro del aro («Ciclo
   completado», «Trabajo en profundidad»): esa línea se esconde y en su lugar se lee «Nuevo
   sello · Primer paso» en dorado, con su dibujo. Sin aro a la vista, la caja de siempre. */
function toastHuecoDelAro() {
  try {
    const sub = document.querySelector('[data-pace-dial-subtitle]');
    if (!sub || !sub.getClientRects().length) return null;
    /* En px CSS, por el lienzo (app/main/_lienzo.js): con el zoom alejado la app crece entera. */
    if (typeof window.paceCaja !== 'function') return null;
    const r = window.paceCaja(sub);
    const caja = window.paceCaja(sub.parentElement);
    /* El interior del aro escala en escritorio: la letra se mide como se pinta. */
    const escala = sub.offsetHeight ? r.height / sub.offsetHeight : 1;
    const fs = parseFloat(getComputedStyle(sub).fontSize) * escala;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, ancho: Math.round(caja.width), fs: fs };
  } catch (e) { return null; }
}
if (!document.getElementById('pace-toast-css')) {
  const st = document.createElement('style');
  st.id = 'pace-toast-css';
  st.textContent = '[data-pace-sello-en-aro] [data-pace-dial-subtitle] { visibility: hidden; }';
  document.head.appendChild(st);
}

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
        /* s79: exiting=false al insertar; transicion CSS opacity controla
           el fade. Patron de tres fases: visible (durationMs) -> exiting
           (TOAST_FADE_MS opacity:1->0) -> desmontaje del array. */
        const full = { ...toast,
          title: tR('ach.item.' + a.id + '.title', a.title),
          desc: tR('ach.item.' + a.id + '.desc', a.desc),
          glyph: a.glyph, glyphSvg: a.glyphSvg, exiting: false, aro: toastHuecoDelAro() };
        setToasts(prev => [...prev, full]);
        try { playSound(a.secret ? 'achievement.secret' : 'achievement.unlock'); } catch(e) {}
        const durationMs = (typeof TOAST_DURATION_MS === 'number') ? TOAST_DURATION_MS : 3000;
        const fadeMs = 300;
        /* 1. Tras durationMs visibles, marcar exiting -> arranca fade. */
        setTimeout(() => {
          setToasts(prev => prev.map(x => x._id === full._id ? { ...x, exiting: true } : x));
        }, durationMs);
        /* 2. Tras durationMs + fadeMs, desmontar del array. */
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x._id !== full._id));
        }, durationMs + fadeMs);
      }
    });
  }, []);

  /* La línea del aro se esconde mientras haya un sello en su sitio, también durante el fundido. */
  const enAro = toasts.some(x => x.aro);
  useEffectTO(() => {
    document.documentElement.toggleAttribute('data-pace-sello-en-aro', enAro);
  }, [enAro]);

  /* Sin `transform` en la caja: un hijo `fixed` se colocaría respecto a ella y no a la ventana. */
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: 20, left: 0, right: 0,
        zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast, i) => toast.aro ? (
        <div key={toast._id} data-pace-sello-aro style={{
          position: 'fixed', left: toast.aro.x, top: toast.aro.y - i * toast.aro.fs * 1.5,
          transform: 'translate(-50%, -50%)', maxWidth: toast.aro.ancho,
          display: 'flex', alignItems: 'center', gap: Math.round(toast.aro.fs * 0.45),
          whiteSpace: 'nowrap', color: 'var(--achievement)',
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: toast.aro.fs, lineHeight: 1.2,
          animation: 'pace-fade-in 320ms var(--ease)',
          opacity: toast.exiting ? 0 : 1, transition: 'opacity 300ms ease-out',
        }}>
          <span style={{ flexShrink: 0, width: Math.round(toast.aro.fs * 1.35), height: Math.round(toast.aro.fs * 1.35), display: 'grid', placeItems: 'center', fontSize: toast.aro.fs }}>
            {window.renderGlyph ? window.renderGlyph(toast) : toast.glyph}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('ach.toast.new')} · {toast.title}</span>
        </div>
      ) : (
        <div key={toast._id} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 20px',
          background: 'var(--paper)',
          border: '1px solid var(--achievement)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-card)',
          animation: 'pace-slide-up 320ms var(--ease)',
          minWidth: 280,
          opacity: toast.exiting ? 0 : 1,
          transition: 'opacity 300ms ease-out',
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
          }}>
            {/* s147: el aviso pintaba el glifo VIEJO. Este bloque era una TERCERA
                copia del render de glifo, y s146 solo unificó modal y sidebar, así
                que las máscaras del usuario no llegaban aquí: desbloquear un logro
                con dibujo nuevo seguía anunciando el SVG heráldico. Ahora delega en
                el `renderGlyph` compartido —la misma función, no una copia—, que
                resuelve máscara → SVG → carácter. `toast` ya lleva id/glyph/glyphSvg,
                que es todo lo que esa función lee. */}
            {window.renderGlyph
              ? window.renderGlyph(toast)
              : <span style={{ fontStyle: 'italic' }}>{toast.glyph}</span>
            }
          </div>
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