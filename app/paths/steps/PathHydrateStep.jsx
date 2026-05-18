/* PACE · Caminos · Step de Hidratacion · sesion 80 (split de PathRunner.jsx)
   Mismo lenguaje visual que HydrateModule del home: contador Garamond
   grande + grid visual de `goal` vasos (no clicables: es step de Camino,
   no tracker) + 2 botones del mismo peso visual (Saltar outline / Beber
   relleno). addWaterGlass(1) solo se llama en handleDrink, no en skip.
   Estilos comunes desde window.pathStepStyles (steps/_shared.js).
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'.
   `step` se acepta para uniformidad de firma aunque no se consume. */

function PathHydrateStep({ step, onExit }) {
  const [state] = usePace();
  const { t } = useT();
  const today = (state.water && state.water.today) || 0;
  const goal  = (state.water && state.water.goal)  || 8;
  const handleDrink = () => {
    if (typeof addWaterGlass === 'function') {
      try { addWaterGlass(1); } catch (e) {}
    }
    onExit('done');
  };
  /* Tipografia comun desde _shared; el padding (10px 28px) es propio de
     este step por densidad de su layout (2 botones, no 3). */
  const { btnTypography } = window.pathStepStyles;
  const btnBase = Object.assign({}, btnTypography, { padding: '10px 28px' });
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 40px', textAlign: 'center',
    }}>
      {/* Contador grande, mismo lenguaje que HydrateTracker */}
      <div style={{
        fontFamily: "'EB Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 'clamp(72px, 12vw, 112px)', fontWeight: 400, lineHeight: 1,
        color: 'var(--hydrate)',
      }}>
        {today}<span style={{ color: 'var(--ink-3)', fontSize: '0.42em' }}> / {goal}</span>
      </div>
      <div style={{
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginTop: 8, marginBottom: 22,
      }}>
        {t('path.hydrate.glasses.today') || 'Vasos hoy'}
      </div>

      {/* Vasos visuales (no interactivos: es Camino, no tracker) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(' + goal + ', 1fr)',
        gap: 6,
        maxWidth: 360, width: '100%',
        marginBottom: 26,
      }}>
        {Array.from({ length: goal }).map(function (_, i) {
          const filled = i < today;
          return (
            <div key={i} style={{
              aspectRatio: '1/1.3',
              background: filled ? 'var(--hydrate-soft)' : 'transparent',
              border: '1.5px solid ' + (filled ? 'var(--hydrate)' : 'var(--line)'),
              borderRadius: 'var(--r-sm)',
              position: 'relative', overflow: 'hidden',
            }}>
              {filled && (
                <div style={{
                  position: 'absolute', inset: 0, top: '40%',
                  background: 'var(--hydrate-soft)',
                  borderTop: '1px solid var(--hydrate)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <p style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic', fontSize: 18, fontWeight: 400,
        color: 'var(--ink-2)', margin: '0 0 26px', lineHeight: 1.4,
        maxWidth: 360,
      }}>
        {t('path.hydrate.copy')}
      </p>

      {/* Dos botones del mismo peso visual: diferencia de color, no de jerarquia */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => onExit('skip')}
          style={Object.assign({}, btnBase, {
            background: 'transparent',
            border: '1px solid var(--line-2)',
            color: 'var(--ink-2)',
          })}
        >
          {t('path.hydrate.skip') || t('path.runner.skip')}
        </button>
        <button
          onClick={handleDrink}
          style={Object.assign({}, btnBase, {
            background: 'var(--hydrate)',
            border: '1px solid var(--hydrate)',
            color: 'var(--paper)',
          })}
        >
          {t('path.hydrate.drank')}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PathHydrateStep });
