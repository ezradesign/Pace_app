/* PACE · Caminos · Step de Hidratacion · sesion 80 (split de PathRunner.jsx)
   s99: adopta el SessionShell compartido (mismo chrome que Respira / Mueve /
   Foco) para coherencia total del Camino -- antes iba pelado. El centro
   conserva el lenguaje del HydrateModule del home: contador Garamond grande
   + grid visual de `goal` vasos (no clicables: es step de Camino, no tracker).
   addWaterGlass(1) solo en handleDrink, no en skip.
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

  /* routine sintetica para el header del SessionShell (identidad: Agua /
     Hidratate), mismo lenguaje que Respira/Mueve/Foco. */
  const routine = {
    code: t('paths.kind.hydrate.name'),
    name: t('activity.hydrate.label'),
  };

  const { btnTypography } = window.pathStepStyles;
  const btnBase = Object.assign({}, btnTypography, { padding: '10px 22px' });

  /* Footer: Saltar en gris (de-enfatizado), Beber como CTA de hidratacion.
     data-pace-path-btn -> hover que rellena con --pfbtn (gris); data-pace-cta
     -> brillo/press del CTA relleno (pack de pulido A). */
  const footer = (
    <React.Fragment>
      <button
        data-pace-path-btn
        onClick={() => onExit('skip')}
        style={Object.assign({}, btnBase, {
          background: 'transparent',
          border: '1px solid var(--ink-3)',
          color: 'var(--ink-3)',
          '--pfbtn': 'var(--ink-3)',
        })}
      >
        {t('path.hydrate.skip') || t('path.runner.skip')}
      </button>
      <button
        data-pace-cta
        onClick={handleDrink}
        style={Object.assign({}, btnBase, {
          background: 'var(--hydrate)',
          border: '1px solid var(--hydrate)',
          color: 'var(--paper)',
        })}
      >
        {t('path.hydrate.drank')}
      </button>
    </React.Fragment>
  );

  return (
    <SessionShell routine={routine} onExit={onExit} atmosphere="var(--hydrate-soft)" footer={footer} footerGap={12}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
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
          margin: '0 auto 26px',
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
          color: 'var(--ink-2)', margin: '0 auto', lineHeight: 1.4,
          maxWidth: 360,
        }}>
          {t('path.hydrate.copy')}
        </p>
      </div>
    </SessionShell>
  );
}

Object.assign(window, { PathHydrateStep });
