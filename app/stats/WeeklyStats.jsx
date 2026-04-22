/* PACE · Panel de estadísticas semanales */

function WeeklyStats({ open, onClose }) {
  const [state] = usePace();
  const w = state.weeklyStats;

  const totals = {
    focus: w.focusMinutes.reduce((a,b)=>a+b, 0),
    breath: w.breathMinutes.reduce((a,b)=>a+b, 0),
    move: w.moveMinutes.reduce((a,b)=>a+b, 0),
    water: w.waterGlasses.reduce((a,b)=>a+b, 0),
  };

  const bars = [
    { key: 'focus', label: 'Foco', color: 'var(--focus)', data: w.focusMinutes, unit: 'min' },
    { key: 'breath', label: 'Respira', color: 'var(--breathe)', data: w.breathMinutes, unit: 'min' },
    { key: 'move', label: 'Mueve', color: 'var(--move)', data: w.moveMinutes, unit: 'min' },
    { key: 'water', label: 'Hidrátate', color: 'var(--hydrate)', data: w.waterGlasses, unit: 'vasos' },
  ];

  return (
    <Modal open={open} onClose={onClose} tagLabel="Semana" title="Ritmo semanal" subtitle="Métricas suaves. Sin ansiedad, sin comparación." maxWidth={780}>
      {/* Totales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '8px 0 24px' }}>
        {bars.map(b => (
          <div key={b.key} style={{
            padding: '16px 14px',
            background: 'var(--paper-2)',
            borderRadius: 'var(--r-md)',
            border: `1px solid var(--line)`,
            borderTop: `3px solid ${b.color}`,
          }}>
            <Meta style={{ fontSize: 10, marginBottom: 6 }}>{b.label}</Meta>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic', fontSize: 28, fontWeight: 500, lineHeight: 1,
            }}>{b.key === 'water' ? totals[b.key] : totals[b.key]}</div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>{b.unit}</div>
          </div>
        ))}
      </div>

      {/* Gráfico por días */}
      {bars.map(b => (
        <WeekBarRow key={b.key} label={b.label} data={b.data} color={b.color} unit={b.unit} />
      ))}

      <div style={{
        marginTop: 24, padding: 14,
        background: 'var(--paper-2)',
        borderRadius: 'var(--r-sm)',
        fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--ink)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>Nota: </strong>
        no medimos para juzgarte. Los números están aquí para que reconozcas tus ritmos, no para que los persigas.
      </div>
    </Modal>
  );
}

function WeekBarRow({ label, data, color, unit }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = (new Date().getDay() + 6) % 7;
  const max = Math.max(1, ...data);
  // Reordenar: en España empezamos en lunes. data está indexado 0=Dom (getDay)
  const reordered = [data[1], data[2], data[3], data[4], data[5], data[6], data[0]];

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500 }}>{label}</span>
        <Meta>{unit}</Meta>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 64 }}>
        {reordered.map((v, i) => {
          const h = (v / max) * 100;
          const isToday = i === today;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                <div style={{
                  width: '100%',
                  height: `${h}%`,
                  minHeight: v > 0 ? 4 : 2,
                  background: v > 0 ? color : 'var(--line)',
                  opacity: isToday ? 1 : (v > 0 ? 0.8 : 0.4),
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 320ms var(--ease)',
                  position: 'relative',
                }}>
                  {v > 0 && (
                    <span style={{
                      position: 'absolute', bottom: '100%', left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 10, color: 'var(--ink-3)',
                      marginBottom: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{v}</span>
                  )}
                </div>
              </div>
              <span style={{
                fontSize: 10,
                color: isToday ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: isToday ? 600 : 400,
                letterSpacing: 0.3,
              }}>{days[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { WeeklyStats });
