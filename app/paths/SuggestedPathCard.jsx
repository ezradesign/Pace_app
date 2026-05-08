/* PACE - Caminos - SuggestedPathCard - sesion 51 / v0.26.0 */

const { useState: useStateSPC } = React;

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

function SuggestedPathCard() {
  const [state] = usePace();
  const { t } = useT();

  // Si ya hay camino activo, PathRunner lo gestiona
  if (state.paths && state.paths.current) return null;

  const suggestedId = (typeof getSuggestedPath === 'function') ? getSuggestedPath() : null;
  const suggested = (suggestedId && typeof getPath === 'function') ? getPath(suggestedId) : null;
  if (!suggested) return null;

  const todayISO = new Date().toISOString().slice(0, 10);
  const compl = state.paths && state.paths.completed && state.paths.completed[suggested.id];
  const doneToday = !!(compl && compl.lastDoneAt === todayISO);

  const name = t(suggested.nameKey) || suggested.id;
  const tagline = t(suggested.taglineKey) || '';

  const handleStart = () => { if (typeof startPath === 'function') startPath(suggested.id); };

  return (
    <div data-pace-spc style={{ padding: '0 40px 12px', flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 20px',
        background: doneToday ? 'var(--paper-2)' : 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-soft)',
        cursor: doneToday ? 'default' : 'pointer',
        transition: 'all 200ms var(--ease)',
      }}
      onClick={!doneToday ? handleStart : undefined}
      onMouseEnter={!doneToday ? (e) => { e.currentTarget.style.boxShadow = 'var(--sh-card)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
      onMouseLeave={!doneToday ? (e) => { e.currentTarget.style.boxShadow = 'var(--sh-soft)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
      >
        {/* Acento vertical */}
        <div style={{ width: 3, height: 40, background: 'var(--olive)', borderRadius: 2, flexShrink: 0 }} />

        {/* Bloque de texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.1 }}>{name}</span>
            {doneToday && (
              <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 'var(--r-pill)' }}>
                {t('path.card.done') || 'Hecho hoy'}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.2 }}>{tagline}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
            {suggested.steps.map((step, i) => {
              const Icon = SPC_STEP_ICONS[step.kind] || null;
              return <span key={i} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, color: 'var(--ink-3)' }}>{Icon ? <Icon /> : null}</span>;
            })}
          </div>
        </div>

        {/* Accion */}
        {!doneToday && (
          <button onClick={(e) => { e.stopPropagation(); handleStart(); }} style={{ padding: '8px 16px', fontSize: 12, letterSpacing: '0.1em', fontFamily: 'var(--font-display)', fontStyle: 'italic', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', flexShrink: 0, transition: 'opacity 150ms' }}>
            {t('path.card.start') || 'Comenzar'}
          </button>
        )}
        {doneToday && (
          <span style={{ fontSize: 18, color: 'var(--olive)', flexShrink: 0, lineHeight: 1, fontFamily: 'Georgia, serif' }}>*</span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { SuggestedPathCard });
