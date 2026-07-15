/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   ActivityBar (sesion 82 / v0.33.2).
   Barra inferior del shell: 4 chips Respira/Estira/Mueve/Hidratate.
   Estilo "tarjeta editorial" -- fondo paper claro, icono terracota fino,
   label serif italic coloreado. Estado activo: punto en esquina + fondo
   calido.

   Extraido literal de main.jsx (lineas 448-591) en split mecanico s82.

   Notas de comportamiento (preservadas):
   - Respira / Estira / Mueve abren librerias via onOpenLibrary(kind).
   - Hidratate abre tracker via onOpenHydrate.
   - 4 iconos SVG inline (ABBreathe, ABStretch, ABMove, ABDrop) viven
     en este archivo porque solo los consume ActivityBar.
   - Estado "activo" (plan[key] === true): punto indicador + fondo paper-2.
   - data-pace-* selectors usados por _responsive.js:
     data-pace-activitybar, data-pace-activitybar-grid,
     data-pace-activitybar-chip, data-pace-chip-label, data-pace-chip-sub.

   Props:
     onOpenLibrary -- (kind: 'breathe'|'move'|'extra') => void
     onOpenHydrate -- () => void
*/

function ActivityBar({ onOpenLibrary, onOpenHydrate }) {
  const [state] = usePace();
  const { t } = useT();
  const plan = state.plan;
  /* NOTA: estilo "tarjeta editorial" — fondo paper claro, icono terracota fino,
     label serif italic coloreado. Estado activo: punto en esquina + fondo cálido. */
  const activities = [
    { key: 'respira', label: t('activity.breathe.label'), sub: t('activity.breathe.sub'), color: 'var(--breathe)', action: () => onOpenLibrary('breathe'), icon: <ABBreathe /> },
    { key: 'extra', label: t('activity.stretch.label'), sub: t('activity.stretch.sub'), color: 'var(--extra)', action: () => onOpenLibrary('extra'), icon: <ABStretch /> },
    { key: 'muevete', label: t('activity.move.label'), sub: t('activity.move.sub'), color: 'var(--move)', action: () => onOpenLibrary('move'), icon: <ABMove /> },
    { key: 'hidratate', label: t('activity.hydrate.label'), sub: t('activity.hydrate.sub'), color: 'var(--hydrate)', action: onOpenHydrate, icon: <ABDrop /> },
  ];
  return (
    <div data-pace-activitybar style={{ padding: '6px 40px 20px', flexShrink: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <Meta>{t('activity.meta')}</Meta>
      </div>
      <div data-pace-activitybar-grid style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {activities.map(a => {
          const active = plan[a.key];
          return (
            <button key={a.key} data-pace-activitybar-chip onClick={a.action} style={{
              position: 'relative',
              display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
              gap: 16,
              padding: '16px 22px',
              minWidth: 180,
              flex: '0 1 200px',
              background: active ? 'var(--paper-2)' : 'var(--paper)',
              border: `1px solid ${active ? 'var(--line-2)' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)',
              boxShadow: active ? 'inset 0 0 0 1px var(--line)' : 'var(--sh-soft)',
              transition: 'all 220ms var(--ease)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--sh-card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = active ? 'inset 0 0 0 1px var(--line)' : 'var(--sh-soft)';
            }}
            >
              {/* Punto indicador de estado activo */}
              {active && (
                <span style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 6, height: 6, borderRadius: '50%',
                  background: a.color,
                }} />
              )}
              {/* Icono en terracota */}
              <span style={{ color: a.color, display: 'grid', placeItems: 'center', width: 28, height: 28, flexShrink: 0 }}>
                {a.icon}
              </span>
              {/* Bloque de texto: label + sublabel */}
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span data-pace-chip-label style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  lineHeight: 1.05,
                }}>{a.label}</span>
                <span data-pace-chip-sub style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--ink-3)',
                  lineHeight: 1.1,
                  letterSpacing: 0.1,
                }}>{a.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Iconos ActivityBar — stroke fino en currentColor (heredan color del módulo).
   Dibujados para la referencia del usuario: pulmones / postura puente / mancuerna / gota. */
function ABBreathe() {
  // Pulmones anatómicos con tráquea — "Respira"
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Tráquea */}
      <path d="M14 4.5v9" />
      {/* Bronquios */}
      <path d="M14 10.5c-1.2 0-2.2-.4-3-1.2 M14 10.5c1.2 0 2.2-.4 3-1.2" />
      {/* Pulmón izquierdo */}
      <path d="M11 10.2c-2.2.3-4.2 1.4-5.3 3.3-1.3 2.2-1.4 5-.6 7.6.5 1.6 1.6 2.7 3.1 2.8 1.4.1 2.4-.8 2.8-2.2.6-2.1.8-4.6.8-7.1 0-1.7-.1-3.2-.8-4.4z" />
      {/* Pulmón derecho */}
      <path d="M17 10.2c2.2.3 4.2 1.4 5.3 3.3 1.3 2.2 1.4 5 .6 7.6-.5 1.6-1.6 2.7-3.1 2.8-1.4.1-2.4-.8-2.8-2.2-.6-2.1-.8-4.6-.8-7.1 0-1.7.1-3.2.8-4.4z" />
    </svg>
  );
}
function ABStretch() {
  // Figura en postura de puente/arco — "Estira"
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Arco del cuerpo (puente boca abajo / downward dog) */}
      <path d="M4 21c3-8 7-12 10-12s7 4 10 12" />
      {/* Cabeza en el vértice superior */}
      <circle cx="14" cy="7.5" r="1.6" />
      {/* Suelo sutil */}
      <path d="M4 22h20" opacity="0.35" strokeDasharray="1.5 2.5" />
    </svg>
  );
}
function ABMove() {
  // Mancuerna horizontal — "Mueve"
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Pesa izquierda (dos discos) */}
      <rect x="3" y="10" width="2.2" height="8" rx="0.6" />
      <rect x="5.6" y="8" width="2.4" height="12" rx="0.6" />
      {/* Barra */}
      <path d="M8 14h12" />
      {/* Pesa derecha (dos discos) */}
      <rect x="20" y="8" width="2.4" height="12" rx="0.6" />
      <rect x="22.8" y="10" width="2.2" height="8" rx="0.6" />
    </svg>
  );
}
function ABDrop() {
  // Gota con highlight interior — "Hidrátate"
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Silueta de la gota */}
      <path d="M14 3.5c-3.6 5.2-7 8.6-7 12.6a7 7 0 0 0 14 0c0-4-3.4-7.4-7-12.6z" />
      {/* Highlight interior (reflejo) */}
      <path d="M10.5 15.5c0 2 1.3 3.6 3 3.9" opacity="0.55" />
    </svg>
  );
}

/* s105: los glifos AB* se exponen para que el BreakMenu (menu post-Pomodoro)
   use EXACTAMENTE los mismos iconos que la ActivityBar de la home -- antes
   llevaba dibujos genericos propios (BM*), rompiendo la coherencia visual. */
Object.assign(window, { ActivityBar, ABBreathe, ABStretch, ABMove, ABDrop });
