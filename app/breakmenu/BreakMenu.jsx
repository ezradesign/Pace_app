/* PACE · Menú post-Pomodoro
   Aparece tras completar un ciclo de foco.
   Las 3 opciones se reordenan según lo que el usuario ha hecho menos hoy:
   primero la actividad más necesaria, con indicador "Para ti".
*/

const { useEffect: useEffectBM } = React;

/* Score: cuánto se necesita esta actividad en este momento.
   Mayor → más prioritaria. Water usa escala 0-3 según vasos restantes. */
function computeScore(key, state) {
  const { plan, water } = state;
  if (key === 'breathe') return plan.respira ? 0 : 2;
  if (key === 'move') return plan.muevete ? 0 : 2;
  if (key === 'water') {
    if (water.today === 0) return 3;
    if (water.today < water.goal) return 1;
    return 0;
  }
  return 0;
}

function BreakMenu({ open, onClose, onChoose }) {
  const { t } = useT();

  /* `first.cycle` — Pomodoro completado + pausa activa elegida.
     El BreakMenu sólo se abre tras `completePomodoro`, así que aquí
     basta con detectar que el usuario eligió una de las 3 micro-pausas
     activas (Respira, Mueve, Hidrátate). "Saltar" no cuenta — la
     filosofía del logro es que se cierre el ciclo de verdad.
     Sesión 28. */
  const handleChoose = (key) => {
    if (key === 'breathe' || key === 'move' || key === 'water') {
      try { unlockAchievement('first.cycle'); } catch (e) {}
    }
    onChoose(key);
  };

  // Atajos de teclado: B (Respira) · M (Muévete) · H (Hidrátate) · Esc (Saltar).
  // Los atajos siguen mapeados por actividad (no por posición visual),
  // así el reordenamiento inteligente no los rompe.
  useEffectBM(() => {
    if (!open) return;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'b') { e.preventDefault(); handleChoose('breathe'); }
      else if (k === 'm') { e.preventDefault(); handleChoose('move'); }
      else if (k === 'h') { e.preventDefault(); handleChoose('water'); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onChoose, onClose]);

  if (!open) return null;

  const state = getState();

  const baseOpts = [
    { key: 'breathe', label: t('break.breathe.label'), desc: t('break.breathe.desc'), color: 'var(--breathe)', bg: 'var(--breathe-soft)', icon: <BMWindIcon /> },
    { key: 'move',    label: t('break.move.label'),    desc: t('break.move.desc'),    color: 'var(--move)',    bg: 'var(--move-soft)',    icon: <BMMoveIcon /> },
    { key: 'water',   label: t('break.water.label'),   desc: t('break.water.desc'),   color: 'var(--hydrate)', bg: 'var(--hydrate-soft)', icon: <BMDropIcon /> },
  ];

  // Ordenar por score descendente; empate → orden original (sort estable).
  const opts = baseOpts
    .map(o => ({ ...o, score: computeScore(o.key, state) }))
    .sort((a, b) => b.score - a.score);

  const topScore = opts[0].score;

  return (
    <Modal open={open} onClose={onClose} tagLabel={t('break.tag')} title={t('break.title')} subtitle={t('break.subtitle')} maxWidth={720}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '20px 0' }}>
        {opts.map((o, i) => {
          const done = o.score === 0;
          const recommended = i === 0 && topScore > 0;
          return (
            <button key={o.key}
              onClick={() => handleChoose(o.key)}
              style={{
                position: 'relative',
                padding: '24px 18px',
                background: o.bg,
                border: `1.5px solid ${done ? 'var(--line)' : o.color}`,
                borderRadius: 'var(--r-md)',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 12,
                transition: 'all 220ms var(--ease)',
                cursor: 'pointer',
                color: 'var(--ink)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--sh-card)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Indicador de actividad ya completada hoy (punto color módulo) */}
              {done && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 6, height: 6, borderRadius: '50%',
                  background: o.color, opacity: 0.6,
                }} />
              )}
              {/* Tag "Para ti" en la opción recomendada */}
              {recommended && (
                <Tag color="var(--focus)">{t('break.recommended')}</Tag>
              )}
              <div style={{ color: o.color, fontSize: 28 }}>{o.icon}</div>
              <div>
                <div style={{ ...displayItalic, fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{o.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                  {done ? t('break.done') : o.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Meta>{t('break.shortcut')}</Meta>
        <Button variant="ghost" onClick={onClose}>{t('break.skip')}</Button>
      </div>
    </Modal>
  );
}

/* Iconos locales del BreakMenu (prefijo BM* para distinguirlos de los AB*
   de la ActivityBar en main.jsx: son metodologías visuales distintas para
   los mismos tres conceptos — respira / mueve / gota — y en v0.11.6 se
   renombraron para evitar confusión de lectura). */
function BMWindIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
      <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" />
    </svg>
  );
}
function BMMoveIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v8" />
      <path d="M8 10l4 2 4-2" />
      <path d="M9 20l3-5 3 5" />
    </svg>
  );
}
function BMDropIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5c-3 4.5-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-6.5-6-11z" />
    </svg>
  );
}

Object.assign(window, { BreakMenu });
