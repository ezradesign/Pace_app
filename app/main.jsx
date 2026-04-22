/* PACE · Main orchestrator
   Monta todo: Sidebar + FocusTimer + modales de librerías + sesiones
*/

const { useState: useStateMain, useEffect: useEffectMain } = React;

function PaceApp() {
  const [state, set] = usePace();
  const [view, setView] = useStateMain({ type: 'home' });

  // Modales
  const [openLibrary, setOpenLibrary] = useStateMain(null); // 'breathe' | 'move' | 'extra' | null
  const [openHydrate, setOpenHydrate] = useStateMain(false);
  const [openAchievements, setOpenAchievements] = useStateMain(false);
  const [openStats, setOpenStats] = useStateMain(false);
  const [openTweaks, setOpenTweaks] = useStateMain(false);
  const [openBreakMenu, setOpenBreakMenu] = useStateMain(false);

  // Flujo de seguridad para respiración
  const [safetyRoutine, setSafetyRoutine] = useStateMain(null);

  // Logro secreto: clicks en la vaca
  const [cowClicks, setCowClicks] = useStateMain(0);
  useEffectMain(() => {
    if (cowClicks >= 10) unlockAchievement('secret.cow.click');
  }, [cowClicks]);

  // Abrir colección desde sidebar
  useEffectMain(() => {
    const h = () => setOpenAchievements(true);
    window.addEventListener('pace:open-achievements', h);
    return () => window.removeEventListener('pace:open-achievements', h);
  }, []);

  // Atajo logros
  useEffectMain(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') setOpenTweaks(o => !o);
      if (e.key === 's' || e.key === 'S') setOpenStats(o => !o);
      if (e.key === 'l' || e.key === 'L') setOpenAchievements(o => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Handle start de una rutina
  const handleStartBreathe = (routine) => {
    if (routine.safety) {
      setSafetyRoutine(routine);
      setOpenLibrary(null);
    } else {
      setOpenLibrary(null);
      setView({ type: 'breathe-session', routine });
    }
  };

  const handleStartMove = (routine) => {
    setOpenLibrary(null);
    setView({ type: 'move-session', routine });
  };
  const handleStartExtra = (routine) => {
    setOpenLibrary(null);
    setView({ type: 'move-session', routine }); // reutiliza MoveSession
  };

  const handleFocusFinish = () => {
    // Al acabar un Pomodoro → menú pausa
    setOpenBreakMenu(true);
  };

  const handleBreakChoice = (choice) => {
    setOpenBreakMenu(false);
    if (choice === 'breathe') setOpenLibrary('breathe');
    else if (choice === 'move') setOpenLibrary('move');
    else if (choice === 'water') setOpenHydrate(true);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      background: 'var(--paper)',
      position: 'relative',
    }}>
      {/* SIDEBAR */}
      {state.layout !== 'minimal' && <Sidebar />}

      {/* MAIN AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        {/* Top bar */}
        <TopBar
          onOpenLibrary={(kind) => setOpenLibrary(kind)}
          onOpenHydrate={() => setOpenHydrate(true)}
          onOpenStats={() => setOpenStats(true)}
          onOpenTweaks={() => setOpenTweaks(true)}
          onCowClick={() => setCowClicks(c => c + 1)}
        />

        {/* Content */}
        <div style={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          padding: '10px 40px',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          <FocusTimer onFinish={handleFocusFinish} />
        </div>

        {/* Actividades footer */}
        <ActivityBar
          onOpenLibrary={(kind) => setOpenLibrary(kind)}
          onOpenHydrate={() => setOpenHydrate(true)}
        />
      </main>

      {/* ========== MODALS ========== */}
      <BreatheLibrary
        open={openLibrary === 'breathe'}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartBreathe}
      />
      <MoveLibrary
        open={openLibrary === 'move'}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartMove}
      />
      <ExtraLibrary
        open={openLibrary === 'extra'}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartExtra}
      />
      <HydrateTracker open={openHydrate} onClose={() => setOpenHydrate(false)} />
      <Achievements open={openAchievements} onClose={() => setOpenAchievements(false)} />
      <WeeklyStats open={openStats} onClose={() => setOpenStats(false)} />
      <TweaksPanel open={openTweaks} onClose={() => setOpenTweaks(false)} />
      <BreakMenu
        open={openBreakMenu}
        onClose={() => setOpenBreakMenu(false)}
        onChoose={handleBreakChoice}
      />

      {safetyRoutine && (
        <BreatheSafety
          routine={safetyRoutine}
          onAccept={(r) => { setSafetyRoutine(null); setView({ type: 'breathe-session', routine: r }); }}
          onCancel={() => setSafetyRoutine(null)}
        />
      )}

      {/* ========== SESSION FULLSCREEN ========== */}
      {view.type === 'breathe-session' && (
        <BreatheSession routine={view.routine} onExit={() => setView({ type: 'home' })} />
      )}
      {view.type === 'move-session' && (
        <MoveSession routine={view.routine} onExit={() => setView({ type: 'home' })} />
      )}

      {/* ========== TOASTS ========== */}
      <ToastHost />
    </div>
  );
}

/* ================
   TOP BAR
   ================ */
function TopBar({ onOpenLibrary, onOpenHydrate, onOpenStats, onOpenTweaks, onCowClick }) {
  const [state] = usePace();
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      padding: '14px 24px',
      gap: 8,
      flexShrink: 0,
    }}>
      <button onClick={onOpenStats} style={topBarStyles.iconBtn} title="Ritmo semanal (S)" aria-label="Ver estadísticas">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" />
        </svg>
      </button>
      <button onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} style={topBarStyles.iconBtn} title="Logros (L)" aria-label="Ver logros">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" /><path d="M8 14l-1 7 5-3 5 3-1-7" />
        </svg>
      </button>
      {/* Tweaks · a la derecha de Logros (última posición del topbar) */}
      <button onClick={onOpenTweaks} style={topBarStyles.iconBtn} title="Tweaks (T)" aria-label="Abrir tweaks">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}

const topBarStyles = {
  iconBtn: {
    width: 36, height: 36,
    display: 'grid', placeItems: 'center',
    borderRadius: 'var(--r-sm)',
    color: 'var(--ink-2)',
    background: 'transparent',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 180ms',
  }
};



/* ================
   ACTIVITY BAR (bottom)
   ================ */
function ActivityBar({ onOpenLibrary, onOpenHydrate }) {
  const [state] = usePace();
  const plan = state.plan;
  /* NOTA: estilo "tarjeta editorial" — fondo paper claro, icono terracota fino,
     label serif italic coloreado. Estado activo: punto en esquina + fondo cálido. */
  const activities = [
    { key: 'respira', label: 'Respira', sub: 'ritmo, calma', color: 'var(--breathe)', action: () => onOpenLibrary('breathe'), icon: <ABBreathe /> },
    { key: 'extra', label: 'Estira', sub: 'afloja tensión', color: 'var(--extra)', action: () => onOpenLibrary('extra'), icon: <ABStretch /> },
    { key: 'muevete', label: 'Mueve', sub: 'cuerpo activo', color: 'var(--move)', action: () => onOpenLibrary('move'), icon: <ABMove /> },
    { key: 'hidratate', label: 'Hidrátate', sub: 'agua ahora', color: 'var(--hydrate)', action: onOpenHydrate, icon: <ABDrop /> },
  ];
  return (
    <div style={{ padding: '6px 40px 20px', flexShrink: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <Meta>Actividades</Meta>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {activities.map(a => {
          const active = plan[a.key];
          return (
            <button key={a.key} onClick={a.action} style={{
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
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  lineHeight: 1.05,
                }}>{a.label}</span>
                <span style={{
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

Object.assign(window, { PaceApp, TopBar, ActivityBar });

/* ARRANQUE DIRECTO (sólo si existe #pace-root en DOM — entry point standalone).
   En el entry point modular PACE.html el montaje lo hace el script de abajo en #root. */
if (typeof document !== 'undefined' && document.getElementById('pace-root')) {
  const root = ReactDOM.createRoot(document.getElementById('pace-root'));
  root.render(<PaceApp />);
}
