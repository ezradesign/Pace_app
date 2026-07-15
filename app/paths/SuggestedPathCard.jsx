/* PACE - Caminos - SuggestedPathCard - sesion 53 / v0.27.0
   Sugiere el camino del momento o el favorito del usuario (prioritario).
   Boton "Ver todos" abre PathsLibrary via CustomEvent.

   Sesion 61 (v0.28.2): compactado en movil. El bug previo era que la regla
   CSS `[data-pace-spc] > div { flex-direction: column !important }` aplicaba
   tambien al PathMiniCard suelto (no solo al contenedor dual), forzando una
   tarjeta apilada de ~250px de alto que aplastaba al timer. Ahora:
     - El contenedor dual lleva data-pace-spc-dual y solo ese se apila.
     - PathMiniCard se identifica con data-pace-spc-card y reduce padding,
       tipos y oculta el tagline en movil para acercarse al layout web
       horizontal (nombre + iconos + boton en una fila).
*/

const { useState: useStateSPC } = React;

/* Reglas responsive del modulo Caminos sugeridos. Inyectadas una vez.
   Movil: padding lateral mas estrecho, card en fila pero compacta. */
if (typeof document !== 'undefined' && !document.getElementById('pace-spc-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-spc-responsive-css';
  s.textContent = `
    @media (max-width: 640px) {
      [data-pace-spc] { padding: 0 14px 10px !important; }
      /* Solo el contenedor dual se apila; la card unica queda en row */
      [data-pace-spc-dual] { flex-direction: column !important; gap: 8px !important; }
      [data-pace-spc-card] { padding: 10px 12px !important; gap: 10px !important; }
      [data-pace-spc-card] [data-pace-spc-bar] { display: none !important; }
      [data-pace-spc-card] [data-pace-spc-label] { font-size: 8px !important; margin-bottom: 2px !important; }
      [data-pace-spc-card] [data-pace-spc-name] { font-size: 15px !important; }
      [data-pace-spc-card] [data-pace-spc-tagline] { display: none !important; }
      [data-pace-spc-card] [data-pace-spc-steps] { margin-top: 4px !important; gap: 4px !important; }
      [data-pace-spc-card] [data-pace-spc-step] { width: 16px !important; height: 16px !important; }
      [data-pace-spc-card] [data-pace-spc-cta] { padding: 7px 12px !important; font-size: 11px !important; }
    }
  `;
  document.head.appendChild(s);
}

/* Iconos de paso: stroke fino 14x14 */
function SPCIconBreathe() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 2.5v7" /><path d="M5 7.5C3.6 7.8 2.5 8.8 2.2 10.2c-.4 1.7.2 3.4 1.8 3.5.9.1 1.4-.5 1.6-1.3.3-1.3.4-2.9.4-4.5z" /><path d="M11 7.5c1.4.3 2.5 1.3 2.8 2.7.4 1.7-.2 3.4-1.8 3.5-.9.1-1.4-.5-1.6-1.3-.3-1.3-.4-2.9-.4-4.5z" /></svg>;
}
function SPCIconFocus() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></svg>;
}
function SPCIconBody() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M2.5 12c1.8-4.5 4-7 5.5-7s3.7 2.5 5.5 7" /><circle cx="8" cy="4" r="1.2" /></svg>;
}
function SPCIconHydrate() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 1.5c-2 3-4.5 4.8-4.5 7.5a4.5 4.5 0 0 0 9 0c0-2.7-2.5-4.5-4.5-7.5z" /></svg>;
}

const SPC_STEP_ICONS = { breathe: SPCIconBreathe, focus: SPCIconFocus, body: SPCIconBody, hydrate: SPCIconHydrate };

/* PathMiniCard — reutilizable para sugerido y favorito */
function PathMiniCard({ pathObj, label, doneToday, onStart }) {
  const { t } = useT();
  const name = t(pathObj.nameKey) || pathObj.id;
  const tagline = t(pathObj.taglineKey) || '';

  return (
    <div data-pace-spc-card style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 20px',
      background: doneToday ? 'var(--paper-2)' : 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      boxShadow: 'var(--sh-soft)',
      cursor: doneToday ? 'default' : 'pointer',
      transition: 'all var(--dur-quick) var(--ease)',
      flex: 1, minWidth: 0,
    }}
    onClick={!doneToday ? onStart : undefined}
    onMouseEnter={!doneToday ? function(e) { e.currentTarget.style.boxShadow = 'var(--sh-card), 0 2px 18px var(--focus-soft)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
    onMouseLeave={!doneToday ? function(e) { e.currentTarget.style.boxShadow = 'var(--sh-soft)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
    >
      {/* Acento gradiente --focus -> --focus-cta (s99 · Sesion B) */}
      <div data-pace-spc-bar style={{ width: 3, height: 40, background: 'linear-gradient(180deg, var(--focus), var(--focus-cta))', borderRadius: 2, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <div data-pace-spc-label style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span data-pace-spc-name style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.1 }}>{name}</span>
          {doneToday && (
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)' }}>
              {t('path.card.done') || 'Hecho hoy'}
            </span>
          )}
        </div>
        <div data-pace-spc-tagline style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.2 }}>{tagline}</div>
        <div data-pace-spc-steps style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
          {pathObj.steps.map(function(step, i) {
            const Icon = SPC_STEP_ICONS[step.kind] || null;
            return <span key={i} data-pace-spc-step style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, color: 'var(--ink-3)' }}>{Icon ? <Icon /> : null}</span>;
          })}
        </div>
      </div>

      {!doneToday && (
        <button data-pace-spc-cta
          onClick={function(e) { e.stopPropagation(); onStart(); }}
          style={{ padding: '8px 16px', fontSize: 12, letterSpacing: '0.1em', fontFamily: 'var(--font-display)', fontStyle: 'italic', background: 'var(--focus-cta)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', flexShrink: 0, transition: 'opacity var(--dur-quick) var(--ease)' }}
        >
          {t('path.card.start') || 'Comenzar'}
        </button>
      )}
      {doneToday && (
        <span style={{ fontSize: 18, color: 'var(--focus)', flexShrink: 0, lineHeight: 1, fontFamily: 'var(--font-display)' }}>*</span>
      )}
    </div>
  );
}

function SuggestedPathCard() {
  const [state] = usePace();
  const { t } = useT();

  // Si ya hay camino activo, PathRunner lo gestiona
  if (state.paths && state.paths.current) return null;

  const todayISO = (typeof window.todayISO === 'function')
    ? window.todayISO() // local, no UTC (s105)
    : new Date().toISOString().slice(0, 10);

  // Camino sugerido por hora del dia
  const suggestedId = (typeof getSuggestedPath === 'function') ? getSuggestedPath() : null;
  const suggested = (suggestedId && typeof getPath === 'function') ? getPath(suggestedId) : null;

  // Favorito del usuario
  const favoriteId = state.paths && state.paths.favorite;
  const favorite = (favoriteId && typeof getPath === 'function') ? getPath(favoriteId) : null;

  // Si no hay ninguno, no renderizar
  if (!suggested && !favorite) return null;

  // Mostrar dual solo si el favorito es diferente del sugerido
  const showDual = favorite && suggested && favoriteId !== suggestedId;

  function isDoneToday(pathId) {
    const compl = state.paths && state.paths.completed && state.paths.completed[pathId];
    return !!(compl && compl.lastDoneAt === todayISO);
  }

  function handleStart(pathId) {
    if (typeof startPath === 'function') startPath(pathId);
  }

  function handleOpenLibrary() {
    window.dispatchEvent(new CustomEvent('pace:open-paths-library'));
  }

  return (
    <div data-pace-spc style={{ padding: '0 40px 12px', flexShrink: 0 }}>
      {/* Fila superior: cards (una o dos) */}
      {showDual ? (
        <div data-pace-spc-dual style={{ display: 'flex', gap: 10 }}>
          <PathMiniCard
            pathObj={favorite}
            label={t('paths.suggested.favorite') || 'Tu favorito'}
            doneToday={isDoneToday(favoriteId)}
            onStart={function() { handleStart(favoriteId); }}
          />
          <PathMiniCard
            pathObj={suggested}
            label={t('paths.suggested.label') || 'Sugerido ahora'}
            doneToday={isDoneToday(suggestedId)}
            onStart={function() { handleStart(suggestedId); }}
          />
        </div>
      ) : (
        <PathMiniCard
          pathObj={favorite || suggested}
          label={favorite ? (t('paths.suggested.favorite') || 'Tu favorito') : null}
          doneToday={isDoneToday(favorite ? favoriteId : suggestedId)}
          onStart={function() { handleStart(favorite ? favoriteId : suggestedId); }}
        />
      )}

      {/* Enlace Ver todos */}
      <div style={{ textAlign: 'right', marginTop: 6 }}>
        <button
          onClick={handleOpenLibrary}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '0.1em', color: 'var(--ink-3)', fontFamily: 'var(--font-display)', fontStyle: 'italic', padding: '2px 0', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          {t('paths.library.viewAll') || 'Ver todos'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SuggestedPathCard });
