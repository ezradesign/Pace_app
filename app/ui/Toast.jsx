/* PACE · Toast (para notificar logros desbloqueados) */

const { useState: useStateTO, useEffect: useEffectTO, useLayoutEffect: useLayoutEffectTO, useRef: useRefTO } = React;

/* EN LA HOME, EL SELLO HABLA DESDE EL ARO (Ez, 9 oct. 2026: «que tampoco tape en la home»).
   El aviso ya espera a que no haya ninguna ventana ni sesión abierta (state-core.toast.jsx),
   pero en la home salía abajo, en una caja encima de la tarjeta o la línea del día, y en el
   móvil no queda ningún hueco libre: todo el alto está ocupado para que no haya scroll. Así
   que ocupa, mientras dura, el sitio de la línea en cursiva de dentro del aro («Ciclo
   completado», «Trabajo en profundidad»): esa línea se esconde y en su lugar se lee «Nuevo
   sello · Primer paso» en dorado, con su dibujo. Sin aro a la vista, la caja de siempre.

   EL ANCHO ES EL DEL CÍRCULO A ESA ALTURA, no el de la caja interior del aro: aquella era
   estrecha y en el móvil de Ez cortaba el texto con puntos suspensivos («Nuevo sello ·
   Prim…»). La cuerda del círculo, con un margen para no rozar el anillo, deja sitio de sobra;
   y si aun así no cabe, la letra encoge un poco y, como último recurso, «Nuevo sello» se
   queda solo para el lector de pantalla (SelloEnAro). Nunca se corta. */
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
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    let ancho = caja.width;
    const marco = sub.closest('[data-pace-dial-fit]');
    if (marco) {
      const m = window.paceCaja(marco);
      const radio = Math.min(m.width, m.height) / 2;
      const dy = y - (m.top + m.height / 2);
      if (radio > Math.abs(dy)) ancho = 2 * Math.sqrt(radio * radio - dy * dy) - radio * 0.24;
    }
    return { x: x, y: y, ancho: Math.round(ancho), fs: fs };
  } catch (e) { return null; }
}
if (!document.getElementById('pace-toast-css')) {
  const st = document.createElement('style');
  st.id = 'pace-toast-css';
  st.textContent = '[data-pace-sello-en-aro] [data-pace-dial-subtitle] { visibility: hidden; }';
  document.head.appendChild(st);
}

/* Lo que solo oye el lector de pantalla. */
const toastSoloLector = { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' };

/* EL SELLO DENTRO DEL ARO VA SOLO CON TEXTO (Ez, 10 oct. 2026, opción B mirando fotos). Con
   dibujo, a 22 px, el brote de «Primer paso» se leía como un «}» y el «?» de un secreto sin
   dibujo parecía un fallo; se probó en un círculo dorado y Ez prefirió el texto solo. El dibujo
   sigue en la colección y en la caja de siempre. Si el texto no cabe, primero encoge la letra
   (hasta un 82 %) y luego «Nuevo sello ·» pasa al lector de pantalla: el título se lee siempre
   entero (lo mide tests/sello-aro.spec.js). */
function SelloEnAro({ toast, t }) {
  const textoRef = useRefTO(null);
  const [ajuste, setAjuste] = useStateTO({ escala: 1, corto: false });
  useLayoutEffectTO(() => {
    const el = textoRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    const cabe = el.clientWidth / el.scrollWidth;
    if (!ajuste.corto && ajuste.escala === 1 && cabe >= 0.82) setAjuste({ escala: cabe * 0.98, corto: false });
    else if (!ajuste.corto) setAjuste({ escala: 1, corto: true });
    else if (ajuste.escala === 1) setAjuste({ escala: Math.max(0.6, cabe * 0.98), corto: true });
  }, [ajuste]);
  const fs = toast.aro.fs;
  return (
    <div data-pace-sello-aro style={{
      position: 'fixed', left: toast.aro.x, top: toast.aro.y,
      transform: 'translate(-50%, -50%)', maxWidth: toast.aro.ancho,
      display: 'flex', alignItems: 'center',
      whiteSpace: 'nowrap', color: 'var(--achievement)',
      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: fs * ajuste.escala, lineHeight: 1.2,
      animation: 'pace-fade-in 320ms var(--ease)',
      opacity: toast.exiting ? 0 : 1, transition: 'opacity 300ms ease-out',
    }}>
      <span data-pace-sello-texto ref={textoRef} style={{ minWidth: 0, overflow: 'hidden' }}>
        <span style={ajuste.corto ? toastSoloLector : undefined}>{t('ach.toast.new')} · </span>{toast.title}
      </span>
    </div>
  );
}

function ToastHost() {
  const [toasts, setToasts] = useStateTO([]);
  const { t, lang } = useT();
  /* s167 — el aviso copiaba `a.title`/`a.desc` del catalogo, asi que el «Nuevo
     sello» se anunciaba en español aunque la app estuviera en ingles. Mismo
     helper que Achievements.jsx y que Respira/Mueve/Extra. */
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };

  /* UNO DETRÁS DE OTRO (fila de s145). El primer Foco puede ganar varios sellos a la vez, y se
     apilaban: en el aro, hacia arriba y encima del contador; abajo, en una torre de cajas.
     Ahora esperan en fila y cada uno sale cuando se ha ido el anterior, con su sonido. Y el
     hueco del aro se mide al SALIR, no al llegar: para entonces la home puede haber cambiado. */
  const colaRef = useRefTO([]);
  const activoRef = useRefTO(false);
  const siguienteRef = useRefTO(null);
  siguienteRef.current = () => {
    if (activoRef.current || !colaRef.current.length) return;
    const full = Object.assign({}, colaRef.current.shift(), { aro: toastHuecoDelAro() });
    activoRef.current = true;
    setToasts(prev => [...prev, full]);
    try { playSound(full.secreto ? 'achievement.secret' : 'achievement.unlock'); } catch(e) {}
    const durationMs = (typeof TOAST_DURATION_MS === 'number') ? TOAST_DURATION_MS : 3000;
    const fadeMs = 300;
    /* s79: tres fases. Visible (durationMs) -> exiting (opacity 1->0) -> fuera del array. */
    setTimeout(() => {
      setToasts(prev => prev.map(x => x._id === full._id ? { ...x, exiting: true } : x));
    }, durationMs);
    setTimeout(() => {
      setToasts(prev => prev.filter(x => x._id !== full._id));
      activoRef.current = false;
      siguienteRef.current();
    }, durationMs + fadeMs);
  };

  useEffectTO(() => {
    return onToast((toast) => {
      // Resolver datos del logro
      if (toast.type === 'achievement') {
        const a = (window.ACHIEVEMENT_CATALOG || []).find(x => x.id === toast.id);
        if (!a) return;
        colaRef.current.push({ ...toast,
          title: tR('ach.item.' + a.id + '.title', a.title),
          desc: tR('ach.item.' + a.id + '.desc', a.desc),
          glyph: a.glyph, glyphSvg: a.glyphSvg, secreto: !!a.secret, exiting: false });
        siguienteRef.current();
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
      {toasts.map(toast => toast.aro ? (
        <SelloEnAro key={toast._id} toast={toast} t={t} />
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
