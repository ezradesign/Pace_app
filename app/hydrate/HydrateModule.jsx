/* PACE · Módulo Hidrátate */

function HydrateTracker({ open, onClose }) {
  const [state] = usePace();
  const { t } = useT();
  const { today, goal } = state.water;
  const pct = Math.min(100, (today / goal) * 100);

  return (
    <Modal open={open} onClose={onClose} tagLabel={t('hydrate.tag')} title={t('hydrate.title')} subtitle={t('hydrate.subtitle')} maxWidth={580}>
      {/* Progreso gigante */}
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 96, fontWeight: 400, lineHeight: 1,
          paddingBottom: '0.12em',
          color: 'var(--hydrate)',
        }}>
          {today}<span style={{ color: 'var(--ink-3)', fontSize: 40 }}> / {goal}</span>
        </div>
        <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 8 }}>{t('hydrate.glasses.today')}</div>
      </div>

      {/* Vasos visuales */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${goal > 8 ? Math.ceil(goal / 2) : goal}, 1fr)`, gap: 8, marginBottom: 24 }}>
        {Array.from({ length: goal }).map((_, i) => (
          <button key={i}
            onClick={() => { if (i < today) { addWaterGlass(-1); } else { addWaterGlass(1); try { playSound(today < goal && today + 1 >= goal ? 'hydrate.goal' : 'hydrate.sip'); } catch (e) {} } }}
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

      {/* Un botón nunca parte su texto: si los dos no caben en una fila, el segundo baja entero. */}
      <div data-pace-hidr-acciones style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        <Button variant="secondary" onClick={() => addWaterGlass(-1)} icon="−" size="md" style={{ whiteSpace: 'nowrap' }}>{t('hydrate.less')}</Button>
        <Button onClick={() => { addWaterGlass(1); try { playSound(today < goal && today + 1 >= goal ? 'hydrate.goal' : 'hydrate.sip'); } catch (e) {} }} icon="+" size="md"
          style={{ background: 'var(--hydrate)', borderColor: 'var(--hydrate)', whiteSpace: 'nowrap' }}>{t('hydrate.more')}</Button>
      </div>

      <Divider style={{ margin: '24px 0 16px' }} />

      <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--ink-2)' }}>{t('hydrate.tip.label')}</strong>{' '}{t('hydrate.tip')}
      </div>
    </Modal>
  );
}

/* En el móvil el relleno de `Button` md (22 px por lado) hacía que «Un vaso menos» y «Un vaso más»
   sumaran 308 px en una fila de 286 a 360 px de ancho, y los dos textos se partían en dos líneas.
   Con 12 px caben en una fila desde 360 px en los dos idiomas; más estrecho, el segundo baja. */
if (!document.getElementById('pace-hidr-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-hidr-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-hidr-acciones] > button {
        padding-left: 12px !important;
        padding-right: 12px !important;
      }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { HydrateTracker });