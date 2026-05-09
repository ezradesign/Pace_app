/* PACE - Caminos - PathsLibrary - sesion 53 / v0.27.0
   Overlay con los 5 caminos. Apertura via CustomEvent pace:open-paths-library.
   Patron identico a Achievements: event listener en montaje, modal over app.
*/

const { useState: useStatePL, useEffect: useEffectPL, useRef: useRefPL } = React;

/* Iconos de paso reutilizados de SuggestedPathCard */
function PLIconBreathe() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 2.5v7" /><path d="M5 7.5C3.6 7.8 2.5 8.8 2.2 10.2c-.4 1.7.2 3.4 1.8 3.5.9.1 1.4-.5 1.6-1.3.3-1.3.4-2.9.4-4.5z" /><path d="M11 7.5c1.4.3 2.5 1.3 2.8 2.7.4 1.7-.2 3.4-1.8 3.5-.9.1-1.4-.5-1.6-1.3-.3-1.3-.4-2.9-.4-4.5z" /></svg>;
}
function PLIconFocus() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></svg>;
}
function PLIconBody() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M2.5 12c1.8-4.5 4-7 5.5-7s3.7 2.5 5.5 7" /><circle cx="8" cy="4" r="1.2" /></svg>;
}
function PLIconHydrate() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"><path d="M8 1.5c-2 3-4.5 4.8-4.5 7.5a4.5 4.5 0 0 0 9 0c0-2.7-2.5-4.5-4.5-7.5z" /></svg>;
}
const PL_STEP_ICONS = { breathe: PLIconBreathe, focus: PLIconFocus, body: PLIconBody, hydrate: PLIconHydrate };

function PLPathCard({ pathObj, isFavorite, doneToday, onStart, onToggleFavorite }) {
  const { t } = useT();
  const name = t(pathObj.nameKey) || pathObj.id;
  const tagline = t(pathObj.taglineKey) || '';

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px',
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-md)',
      marginBottom: 10,
    }}>
      {/* Acento */}
      <div style={{ width: 3, minHeight: 40, background: 'var(--olive)', borderRadius: 2, flexShrink: 0, marginTop: 2 }} />

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 17, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.1 }}>{name}</span>
          {doneToday && (
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)' }}>
              {t('paths.library.doneToday') || 'Hecho hoy'}
            </span>
          )}
          {isFavorite && (
            <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--olive)', padding: '2px 6px', border: '1px solid var(--olive)', borderRadius: 'var(--r-pill)' }}>
              {t('paths.library.favorite') || 'Favorito'}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)', marginTop: 3, lineHeight: 1.3 }}>{tagline}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
          {pathObj.steps.map(function(step, i) {
            const Icon = PL_STEP_ICONS[step.kind] || null;
            return <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, color: 'var(--ink-3)' }}>{Icon ? <Icon /> : null}</span>;
          })}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
        {!doneToday && (
          <button
            onClick={onStart}
            style={{ padding: '7px 14px', fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--font-display)', fontStyle: 'italic', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
          >
            {t('paths.library.start') || 'Comenzar'}
          </button>
        )}
        <button
          onClick={onToggleFavorite}
          title={isFavorite ? (t('paths.library.unfavorite') || 'Quitar favorito') : (t('paths.library.favorite') || 'Favorito')}
          style={{ padding: '5px 10px', fontSize: 10, letterSpacing: '0.08em', fontFamily: 'var(--font-display)', fontStyle: 'italic', background: 'transparent', color: isFavorite ? 'var(--olive)' : 'var(--ink-3)', border: '1px solid ' + (isFavorite ? 'var(--olive)' : 'var(--line)'), borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all 150ms' }}
        >
          {isFavorite ? (t('paths.library.unfavorite') || 'Quitar') : (t('paths.library.favorite') || 'Fav')}
        </button>
      </div>
    </div>
  );
}

function PathsLibrary() {
  const [open, setOpenPL] = useStatePL(false);
  const [state] = usePace();
  const { t } = useT();
  const closeBtnRef = useRefPL(null);

  useEffectPL(function() {
    function handleOpen() { setOpenPL(true); }
    window.addEventListener('pace:open-paths-library', handleOpen);
    return function() { window.removeEventListener('pace:open-paths-library', handleOpen); };
  }, []);

  // Focus en boton cerrar al abrir + Escape para cerrar
  useEffectPL(function() {
    if (!open) return;
    if (closeBtnRef.current) closeBtnRef.current.focus();
    function handleKey(e) { if (e.key === 'Escape') setOpenPL(false); }
    document.addEventListener('keydown', handleKey);
    return function() { document.removeEventListener('keydown', handleKey); };
  }, [open]);

  if (!open) return null;

  const catalog = (typeof window.PATH_CATALOG !== 'undefined') ? window.PATH_CATALOG : [];
  const todayISO = new Date().toISOString().slice(0, 10);
  const favId = state.paths && state.paths.favorite;

  function handleStart(pathId) {
    setOpenPL(false);
    if (typeof startPath === 'function') startPath(pathId);
  }

  function handleToggleFavorite(pathId) {
    if (typeof toggleFavoritePath === 'function') toggleFavoritePath(pathId);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="paths-library-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={function(e) { if (e.target === e.currentTarget) setOpenPL(false); }}
    >
      <div style={{
        background: 'var(--paper-2)',
        borderRadius: 'var(--r-lg)',
        width: '100%', maxWidth: 480,
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--sh-card)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <span id="paths-library-title" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: 'var(--ink)' }}>
            {t('paths.library.title') || 'Todos los caminos'}
          </span>
          <button
            ref={closeBtnRef}
            onClick={function() { setOpenPL(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 20, lineHeight: 1, padding: '2px 6px', borderRadius: 'var(--r-sm)' }}
            aria-label={t('common.close')}
          >&#x2715;</button>
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px' }}>
          {catalog.map(function(pathObj) {
            const compl = state.paths && state.paths.completed && state.paths.completed[pathObj.id];
            const doneToday = !!(compl && compl.lastDoneAt === todayISO);
            const isFav = favId === pathObj.id;
            return (
              <PLPathCard
                key={pathObj.id}
                pathObj={pathObj}
                isFavorite={isFav}
                doneToday={doneToday}
                onStart={function() { handleStart(pathObj.id); }}
                onToggleFavorite={function() { handleToggleFavorite(pathObj.id); }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PathsLibrary });
