/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   TopBar (sesion 82 / v0.33.2).
   Barra superior del shell: tabs centrados Foco/Pausa/Larga + 3 iconos
   top-right (Stats / Logros / Tweaks), y delante el sobre cuando lleva algo
   (shell/Sobre.jsx; Ez, 30 oct. 2026).

   Extraido literal de main.jsx (lineas 365-444) en split mecanico s82.

   Notas de comportamiento (preservadas):
   - Stats y Tweaks abren via props (onOpenStats / onOpenTweaks).
   - Logros abre via CustomEvent('pace:open-achievements') -- coherente
     con Sidebar.jsx que dispara el mismo evento. PaceApp lo escucha.
   - Tabs Foco/Pausa/Larga cambian state.focusMode. Cambiar de modo reinicia
     la cuenta, así que con un bloque de Foco empezado (en marcha o en pausa)
     se pregunta antes: el bloque se perdería sin contar (Ez, 8 oct. 2026). Con una pausa
     empezada, también, con lo que lleva (Ez, 2A del 8 nov. 2026): un clic la cortaba sin vuelta.
   - Tabs ocultos en movil (@media max-width: 768px en _responsive.js).
   - data-pace-* selectors usados por _responsive.js: data-pace-topbar,
     data-pace-tabs, data-pace-topbar-icon.

   Props:
     onOpenLibrary  -- (no se usa actualmente, preservado por estabilidad de firma)
     onOpenHydrate  -- (idem)
     onOpenStats    -- abre StatsPanel
     onOpenTweaks   -- abre TweaksPanel
*/

const { useState: useStateTB } = React;

function TopBar({ onOpenLibrary, onOpenHydrate, onOpenStats, onOpenTweaks }) {
  const [state, set] = usePace();
  const { t, tn } = useT();
  /* Mientras se pregunta: el modo al que se quiere pasar y, si lo empezado es una pausa, los
     segundos que lleva (`lleva`, null con un Foco). null sin pregunta. */
  const [pendiente, setPendiente] = useStateTB(null);
  const elegirModo = (v) => {
    if (v === state.focusMode) return;
    const foco = typeof paceFocoEmpezado === 'function' && paceFocoEmpezado();
    const lleva = !foco && typeof pacePausaLleva === 'function' ? pacePausaLleva() : null;
    if (foco || lleva != null) { setPendiente({ v, lleva }); return; }
    set({ focusMode: v });
  };
  const pregunta = topBarPregunta(pendiente, t, tn);
  const modes = [
    { v: 'foco', label: t('topbar.mode.focus') },
    { v: 'pausa', label: t('topbar.mode.pause') },
    { v: 'larga', label: t('topbar.mode.long') },
  ];
  return (
    <div data-pace-topbar style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '14px 24px',
      gap: 8,
      flexShrink: 0,
      minHeight: 56,
    }}>
      {/* Tabs centrados (según referencia) */}
      <div data-pace-tabs style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'inline-flex',
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-pill)',
        padding: 3,
        gap: 2,
      }}>
        {/* El modo puesto se ve por el relleno; el lector de pantalla lo oye por `aria-pressed`. */}
        {modes.map(m => (
          <button key={m.v} onClick={() => elegirModo(m.v)} aria-pressed={state.focusMode === m.v}
            style={{
              padding: '6px 18px',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 500,
              borderRadius: 'var(--r-pill)',
              background: state.focusMode === m.v ? 'var(--ink)' : 'transparent',
              color: state.focusMode === m.v ? 'var(--paper)' : 'var(--ink-2)',
              transition: 'all 200ms',
            }}>{m.label}</button>
        ))}
      </div>

      {/* Iconos top-right. Primero el sobre, solo cuando lleva algo (shell/Sobre.jsx). */}
      {typeof PaceSobre === 'function' && <PaceSobre estilo={topBarStyles.iconBtn} />}
      <button data-pace-topbar-icon onClick={onOpenStats} style={topBarStyles.iconBtn} title={t('topbar.stats.title')} aria-label={t('topbar.stats.aria')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" />
        </svg>
      </button>
      <button data-pace-topbar-icon onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} style={topBarStyles.iconBtn} title={t('topbar.achievements.title')} aria-label={t('topbar.achievements.aria')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" /><path d="M8 14l-1 7 5-3 5 3-1-7" />
        </svg>
      </button>
      <button data-pace-topbar-icon data-pace-topbar-ajustes onClick={onOpenTweaks} style={topBarStyles.iconBtn} title={t('topbar.tweaks.title')} aria-label={t('topbar.tweaks.aria')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <Modal open={!!pendiente} onClose={() => setPendiente(null)} maxWidth={440}
             title={pregunta ? pregunta.title : undefined}>
        <p data-pace-cambio-modo style={{ margin: '0 0 22px', color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.55 }}>
          {pregunta ? pregunta.body : null}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => { set({ focusMode: pendiente.v }); setPendiente(null); }}>
            {pregunta ? pregunta.cambiar : null}
          </Button>
          <Button variant="primary" onClick={() => setPendiente(null)}>
            {pregunta ? pregunta.seguir : null}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

/* Los textos de la pregunta. Con un Foco, los de siempre. Con una pausa, «¿Dejar la pausa?» si se
   vuelve al Foco y, entre la corta y la larga, el título de siempre; los minutos que lleva solo
   desde el primero entero, para no decir «0 minutos». */
function topBarPregunta(p, t, tn) {
  if (!p) return null;
  if (p.lleva == null) {
    return { title: t('topbar.cambio.title.' + p.v), body: t('topbar.cambio.body'),
      cambiar: t('topbar.cambio.cambiar'), seguir: t('topbar.cambio.seguir') };
  }
  const min = Math.floor(p.lleva / 60);
  const lleva = min < 1 ? '' : min === 1 ? t('topbar.pausa.lleva.uno') + ' ' : tn('topbar.pausa.lleva', { n: min }) + ' ';
  const alFoco = p.v === 'foco';
  return {
    title: alFoco ? t('topbar.pausa.title') : t('topbar.cambio.title.' + p.v),
    body: lleva + t(alFoco ? 'topbar.pausa.body.foco' : 'topbar.pausa.body.otra'),
    cambiar: alFoco ? t('topbar.pausa.volver') : t('topbar.cambio.cambiar'),
    seguir: t('topbar.pausa.seguir'),
  };
}

const topBarStyles = {
  iconBtn: {
    width: 36, height: 36,
    display: 'grid', placeItems: 'center',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink-2)',
    background: 'transparent',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 180ms',
  }
};

Object.assign(window, { TopBar });
