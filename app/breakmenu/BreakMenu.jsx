/* PACE · Menú post-Pomodoro
   Aparece tras completar un ciclo de foco.
   3 opciones: Respira / Mueve / Agua + Saltar
*/

function BreakMenu({ open, onClose, onChoose }) {
  if (!open) return null;

  const opts = [
    { key: 'breathe', label: 'Respira', desc: '2 min para volver al centro', color: 'var(--breathe)', bg: 'var(--breathe-soft)', icon: <BMWindIcon /> },
    { key: 'move', label: 'Muévete', desc: 'Antídoto rápido a la silla', color: 'var(--move)', bg: 'var(--move-soft)', icon: <BMMoveIcon /> },
    { key: 'water', label: 'Hidrátate', desc: 'Un vaso ahora', color: 'var(--hydrate)', bg: 'var(--hydrate-soft)', icon: <BMDropIcon /> },
  ];

  return (
    <Modal open={open} onClose={onClose} tagLabel="Ciclo completado" title="Pausa bien hecha" subtitle="Has cerrado un ciclo de foco. Elige tu micro-pausa." maxWidth={720}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '20px 0' }}>
        {opts.map(o => (
          <button key={o.key}
            onClick={() => onChoose(o.key)}
            style={{
              padding: '24px 18px',
              background: o.bg,
              border: `1.5px solid ${o.color}`,
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
            <div style={{ color: o.color, fontSize: 28 }}>{o.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{o.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{o.desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Meta>Atajo: B · M · H · Esc</Meta>
        <Button variant="ghost" onClick={onClose}>Saltar esta pausa</Button>
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
