/* PACE · main · EL ASA DE LA SIDEBAR — sacada de main.jsx en s193
   ================================================================
   El botón flotante que reabre la barra lateral cuando está colapsada. Aparece
   sólo en layout con sidebar; en móvil (≤768px) el CSS lo amplía a 44×44 (hit
   target accesible) — ver app/main/_responsive.js, que lo selecciona por
   `data-pace-sidebar-open`. Es JSX puro: PaceApp decide CUÁNDO se pinta y qué
   hace `onOpen`; aquí sólo está el dibujo. Salió al tocar main.jsx las 500
   líneas de §1. */

function SidebarHandle({ onOpen }) {
  const { t } = useT();
  return (
    <button
      data-pace-sidebar-open
      onClick={onOpen}
      title={t('sidebar.open.title')}
      aria-label={t('sidebar.open.aria')}
      style={{
        position: 'fixed', top: 16, left: 14, zIndex: 50,
        width: 30, height: 30, borderRadius: 6,
        display: 'grid', placeItems: 'center',
        background: 'transparent', border: '1px solid transparent',
        color: 'var(--ink-3)', transition: 'all 180ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-2)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="14" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    </button>
  );
}

Object.assign(window, { SidebarHandle });
