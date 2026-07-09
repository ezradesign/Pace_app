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

/* Punto de color por tipo de paso en el recorrido (s99): ata cada paso a
   su acento de modulo (Respira/Foco/Cuerpo/Agua). */
const CS_KIND_COLOR = {
  breathe: 'var(--breathe)',
  focus: 'var(--focus)',
  body: 'var(--move)',
  hydrate: 'var(--hydrate)',
};

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
    <div data-pace-reveal style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 40px 48px', textAlign: 'center',
      overflowY: 'auto', gap: 6,
      background: (typeof window !== 'undefined' && window.sessionAtmosphere)
        ? window.sessionAtmosphere('var(--focus-soft)') : undefined,
      opacity: opacity,
      transition: fadeIn ? 'opacity 400ms ease-out' : 'none',
    }}>
      {/* Hero: check en circulo con doble aro suave (--focus, acento del
          modulo Caminos). El box-shadow de anillo da profundidad premium. */}
      <div style={{
        width: 78, height: 78, borderRadius: '50%',
        background: 'var(--focus-soft)',
        border: '1.5px solid var(--focus)',
        boxShadow: '0 0 0 7px var(--focus-soft)',
        display: 'grid', placeItems: 'center',
        margin: '0 auto 6px',
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
             stroke="var(--focus)" strokeWidth="1.5"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      {/* Encabezado: kicker + titulo + meta (un solo bloque -> reveal juntos) */}
      <div>
        <p style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '10px 0 12px' }}>
          {t('path.runner.complete.title')}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic', fontSize: 46, fontWeight: 500,
          color: 'var(--ink)', margin: 0, lineHeight: 1.08,
        }}>
          {displayName}
        </h2>
        {elapsed > 0 && (
          <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '14px 0 0', letterSpacing: '0.02em' }}>
            {elapsed} min
          </p>
        )}
      </div>

      {/* SenderoBar 100% done: currentIndex = totalSteps -> ningun
          hito en estado 'current', todos en 'done'. */}
      {totalSteps > 0 && (
        <div style={{ width: '100%', maxWidth: 620, margin: '10px 0 4px' }}>
          <SenderoBar blocks={senderoBlocks} currentIndex={totalSteps} />
        </div>
      )}

      {/* Recorrido: panel contenido con punto de color por tipo de paso. */}
      {totalSteps > 0 && (
        <div style={{ maxWidth: 320, width: '100%', margin: '4px 0 6px' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 12,
          }}>
            {t('path.runner.complete.recorrido')}
          </div>
          <ul style={{
            listStyle: 'none', padding: '6px 18px', margin: 0,
            display: 'flex', flexDirection: 'column',
            background: 'var(--paper-2)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
          }}>
            {steps.map(function(s, idx) {
              const skipped = skippedSet.has(idx);
              const kindColor = CS_KIND_COLOR[s.kind] || 'var(--ink-3)';
              return (
                <li key={s.kind + '-' + idx} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 2px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--line)',
                  opacity: skipped ? 0.5 : 1,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 12, color: 'var(--ink-3)',
                    minWidth: 22, textAlign: 'right',
                  }}>{CS_ROMAN[idx] || (idx + 1)}</span>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: skipped ? 'var(--line-2)' : kindColor,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 16, color: skipped ? 'var(--ink-3)' : 'var(--ink)',
                    textDecoration: skipped ? 'line-through' : 'none',
                    textDecorationColor: 'var(--ink-3)',
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
          gap: 10, margin: '6px 0 4px',
          padding: '14px 20px',
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

      <div style={{ display: 'flex', gap: 12, flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
        <button
          data-pace-cta
          onClick={onBack}
          style={{
            padding: '13px 40px', borderRadius: 'var(--r-pill)',
            background: 'var(--ink)', border: '1px solid var(--ink)',
            color: 'var(--paper)', cursor: 'pointer',
            fontSize: 13, letterSpacing: '0.12em',
          }}
        >
          {t('path.runner.complete.back')}
        </button>
        <button
          onClick={function() { onBack(); if (typeof startPath === 'function') startPath(snapshot.pathId); }}
          style={{
            padding: '8px 24px', borderRadius: 'var(--r-pill)',
            background: 'transparent', border: 'none',
            color: 'var(--ink-3)', cursor: 'pointer',
            fontSize: 12, letterSpacing: '0.08em',
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
