/* PACE · Caminos · Pantalla de Camino completado · sesion 80 (split de PathRunner.jsx)
   SenderoBar al 100% (todos los hitos como done), lista discreta del
   recorrido con numerales romanos (skipped tachado), logros desbloqueados
   DURANTE este Camino (filter unlockedAt >= snapshot.startedAt) y dos
   botones (Volver / Repetir camino).
   fadeIn=true: cross-fade 400ms al venir de OutroCard (mismo background
   var(--paper) que la card de salida).
   CS_ROMAN local: decision s79 (no extraer a helper compartido hasta
   tener 3 consumidores; aqui sigue siendo solo 1). */

const { useState: useStateCS, useEffect: useEffectCS } = React;

const CS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function CompletionScreen({ snapshot, onBack, fadeIn }) {
  const [state] = usePace();
  const { t } = useT();
  const [opacity, setOpacity] = useStateCS(fadeIn ? 0 : 1);
  useEffectCS(function () {
    if (!fadeIn) return;
    /* Doble rAF: asegura que el frame con opacity=0 se pinta antes de
       arrancar la transicion a opacity=1. Sin esto, React podria batch
       y nunca veriamos el fade-in. */
    var r1 = requestAnimationFrame(function () {
      var r2 = requestAnimationFrame(function () { setOpacity(1); });
      /* Limpieza de la segunda rAF en caso de unmount entre frames. */
      return function () { cancelAnimationFrame(r2); };
    });
    return function () { cancelAnimationFrame(r1); };
  }, [fadeIn]);
  const path = getPath(snapshot.pathId);
  const displayName = path ? (t(path.nameKey) || snapshot.pathId) : snapshot.pathId;
  const elapsed = snapshot.startedAt
    ? Math.round((Date.now() - snapshot.startedAt) / 60000)
    : 0;

  const steps = (path && path.steps) || [];
  const totalSteps = steps.length;
  const skippedSet = new Set(snapshot.skippedSteps || []);

  const senderoBlocks = steps.map(function(s, idx) {
    return {
      id: s.kind + '-' + idx,
      name: t('paths.kind.' + s.kind + '.name') || s.kind,
    };
  });

  /* Logros desbloqueados durante este Camino. */
  const startedAt = snapshot.startedAt || 0;
  const catalog = (typeof window !== 'undefined' && window.ACHIEVEMENT_CATALOG) || [];
  const achievementsDuring = Object.keys(state.achievements || {})
    .map(function(id) {
      const v = state.achievements[id];
      if (!v || !v.unlockedAt) return null;
      if (v.unlockedAt < startedAt) return null;
      const cat = catalog.find(function(x) { return x.id === id; });
      if (!cat) return null;
      return { id, title: cat.title, glyph: cat.glyph, glyphSvg: cat.glyphSvg };
    })
    .filter(Boolean);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 40px', textAlign: 'center',
      overflowY: 'auto',
      opacity: opacity,
      transition: fadeIn ? 'opacity 400ms ease-out' : 'none',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--breathe-soft)', color: 'var(--breathe)',
        display: 'grid', placeItems: 'center', fontSize: 28,
        marginBottom: 20,
      }}>
        &#x2714;
      </div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
        {t('path.runner.complete.title')}
      </p>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic', fontSize: 36, fontWeight: 500,
        color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.2,
      }}>
        {displayName}
      </h2>
      {elapsed > 0 && (
        <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 24px' }}>
          {elapsed} min
        </p>
      )}

      {/* SenderoBar 100% done: currentIndex = totalSteps -> ningun
          hito en estado 'current', todos en 'done'. */}
      {totalSteps > 0 && (
        <div style={{ width: '100%', maxWidth: 640, margin: '0 0 12px' }}>
          <SenderoBar blocks={senderoBlocks} currentIndex={totalSteps} />
        </div>
      )}

      {/* Lista discreta del recorrido */}
      {totalSteps > 0 && (
        <div style={{ margin: '4px 0 24px', maxWidth: 320, width: '100%' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 10,
          }}>
            {t('path.runner.complete.recorrido')}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {steps.map(function(s, idx) {
              const skipped = skippedSet.has(idx);
              return (
                <li key={s.kind + '-' + idx} style={{
                  display: 'flex', alignItems: 'baseline', gap: 12,
                  padding: '4px 0',
                  opacity: skipped ? 0.45 : 1,
                  textDecoration: skipped ? 'line-through' : 'none',
                  textDecorationColor: 'var(--ink-3)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 13, color: 'var(--ink-3)',
                    minWidth: 28, textAlign: 'right',
                  }}>{CS_ROMAN[idx] || (idx + 1)}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 16, color: skipped ? 'var(--ink-3)' : 'var(--ink-2)',
                  }}>
                    {t('paths.kind.' + s.kind + '.name') || s.kind}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Logros desbloqueados durante el Camino */}
      {achievementsDuring.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, margin: '0 0 24px',
          padding: '14px 18px',
          border: '1px solid var(--achievement)',
          borderRadius: 'var(--r-md)',
          background: 'var(--achievement-soft)',
        }}>
          {achievementsDuring.map(function(a) {
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%',
                  border: '1px solid var(--achievement)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--achievement)',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 12,
                }}>
                  {a.glyphSvg
                    ? <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: a.glyphSvg }} />
                    : <span>{a.glyph}</span>
                  }
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink)',
                }}>{a.title}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 32px', borderRadius: 'var(--r-pill)',
            background: 'var(--ink)', border: 'none',
            color: 'var(--paper)', cursor: 'pointer',
            fontSize: 13, letterSpacing: '0.1em',
          }}
        >
          {t('path.runner.complete.back')}
        </button>
        <button
          onClick={function() { onBack(); if (typeof startPath === 'function') startPath(snapshot.pathId); }}
          style={{
            padding: '8px 24px', borderRadius: 'var(--r-pill)',
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--ink-3)', cursor: 'pointer',
            fontSize: 12, letterSpacing: '0.1em',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
          }}
        >
          {t('paths.runner.repeat') || 'Repetir camino'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CompletionScreen });
