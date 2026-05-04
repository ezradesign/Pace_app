/* PACE · Módulo Hidrátate */

function HydrateTracker({ open, onClose }) {
  const [state] = usePace();
  const { today, goal } = state.water;
  const pct = Math.min(100, (today / goal) * 100);

  return (
    <Modal open={open} onClose={onClose} tagLabel="Hidratación" title="Hidrátate" subtitle="Un sorbo ahora, un regalo a tu yo de las 5." maxWidth={580}>
      {/* Progreso gigante */}
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 96, fontWeight: 400, lineHeight: 1,
          color: 'var(--hydrate)',
        }}>
          {today}<span style={{ color: 'var(--ink-3)', fontSize: 40 }}> / {goal}</span>
        </div>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>Vasos hoy</div>
      </div>

      {/* Vasos visuales */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${goal}, 1fr)`, gap: 8, marginBottom: 24 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <button key={i}
            onClick={() => { if (i < today) { addWaterGlass(-1); } else { addWaterGlass(1); try { playSound('sip'); } catch (e) {} } }}
            style={{
              aspectRatio: '1/1.3',
              background: i < today ? 'var(--hydrate-soft)' : 'transparent',
              border: `1.5px solid ${i < today ? 'var(--hydrate)' : 'var(--line)'}`,
              borderRadius: 'var(--r-sm)',
              display: 'grid', placeItems: 'end center',
              padding: '0 0 8px',
              fontSize: 10,
              color: i < today ? 'var(--hydrate)' : 'var(--ink-3)',
              letterSpacing: '0.1em',
              fontWeight: 500,
              transition: 'all 200ms',
              position: 'relative',
              overflow: 'hidden',
            }}>
            {i < today && (
              <div style={{
                position: 'absolute', inset: 0, top: '40%',
                background: 'var(--hydrate-soft)',
                borderTop: '1px solid var(--hydrate)',
              }} />
            )}
            <span style={{ zIndex: 1 }}>{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Barra */}
      <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--hydrate)',
          transition: 'width 320ms var(--ease)',
        }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Button variant="secondary" onClick={() => addWaterGlass(-1)} icon="−" size="md">Un vaso menos</Button>
        <Button onClick={() => { addWaterGlass(1); try { playSound('sip'); } catch (e) {} }} icon="+" size="md"
          style={{ background: 'var(--hydrate)', borderColor: 'var(--hydrate)' }}>Un vaso más</Button>
      </div>

      <Divider style={{ margin: '24px 0 16px' }} />

      <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--ink-2)' }}>Tip:</strong> llena una botella de 500ml por la mañana y otra después de comer. Dos botellas = 4 vasos. Hecho.
      </div>
    </Modal>
  );
}

Object.assign(window, { HydrateTracker });
