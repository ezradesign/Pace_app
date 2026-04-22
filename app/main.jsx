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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      {/* SIDEBAR */}
      {state.layout !== 'minimal' && <Sidebar />}

      {/* MAIN AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <TopBar
          onOpenLibrary={(kind) => setOpenLibrary(kind)}
          onOpenHydrate={() => setOpenHydrate(true)}
          onOpenTweaks={() => setOpenTweaks(true)}
          onOpenStats={() => setOpenStats(true)}
          onCowClick={() => setCowClicks(c => c + 1)}
        />

        {/* Content */}
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '20px 40px' }}>
          <FocusTimer onFinish={handleFocusFinish} />
        </div>

        {/* Actividades footer */}
        <ActivityBar
          onOpenLibrary={(kind) => setOpenLibrary(kind)}
          onOpenHydrate={() => setOpenHydrate(true)}
        />
      </main>

      {/* FAB Tweaks */}
      <button onClick={() => setOpenTweaks(true)} style={fabStyles.tweaks} title="Tweaks (T)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

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
function TopBar({ onOpenLibrary, onOpenHydrate, onOpenTweaks, onOpenStats, onCowClick }) {
  const [state] = usePace();
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
      padding: '16px 24px',
      gap: 8,
    }}>
      <button onClick={onOpenStats} style={topBarStyles.iconBtn} title="Ritmo semanal (S)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" />
        </svg>
      </button>
      <button onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} style={topBarStyles.iconBtn} title="Logros (L)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" /><path d="M8 14l-1 7 5-3 5 3-1-7" />
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
    { key: 'respira', label: 'Respira', color: 'var(--breathe)', action: () => onOpenLibrary('breathe'), icon: <ABBreathe /> },
    { key: 'extra', label: 'Estira', color: 'var(--extra)', action: () => onOpenLibrary('extra'), icon: <ABStretch /> },
    { key: 'muevete', label: 'Mueve', color: 'var(--move)', action: () => onOpenLibrary('move'), icon: <ABMove /> },
    { key: 'hidratate', label: 'Hidrátate', color: 'var(--hydrate)', action: onOpenHydrate, icon: <ABDrop /> },
  ];
  return (
    <div style={{ padding: '8px 40px 28px' }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <Meta>Actividades</Meta>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {activities.map(a => {
          const active = plan[a.key];
          return (
            <button key={a.key} onClick={a.action} style={{
              position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10,
              padding: '18px 28px',
              minWidth: 124,
              background: active ? 'var(--paper-2)' : 'var(--paper)',
              border: `1px solid ${active ? 'var(--line-2)' : 'var(--line)'}`,
              borderRadius: 'var(--r-md)',
              boxShadow: active ? 'inset 0 0 0 1px var(--line)' : 'var(--sh-soft)',
              transition: 'all 220ms var(--ease)',
              cursor: 'pointer',
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
              <span style={{ color: a.color, display: 'grid', placeItems: 'center', height: 24 }}>
                {a.icon}
              </span>
              {/* Label serif italic */}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--ink)',
                letterSpacing: 0,
                lineHeight: 1,
              }}>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Iconos ActivityBar — stroke fino en currentColor (heredan color terracota del módulo) */
function ABBreathe() {
  // Círculo con cruz — "Respira" (el que ya teníamos, que te gusta más)
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18 M3 12h18" />
    </svg>
  );
}
function ABStretch() {
  // Figura zen con brazos abiertos — "Estira"
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v6" />
      <path d="M5 10c3 0 4 1.5 7 1.5S16 10 19 10" />
      <path d="M12 13l-3 8 M12 13l3 8" />
    </svg>
  );
}
function ABMove() {
  // Flecha doble lateral (izq-dcha) — "Mueve"
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8l-4 4 4 4" />
      <path d="M17 8l4 4-4 4" />
      <path d="M3 12h18" />
    </svg>
  );
}
function ABDrop() {
  // Gota simple
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5c-3 4.5-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-6.5-6-11z" />
    </svg>
  );
}

const fabStyles = {
  tweaks: {
    position: 'fixed',
    right: 24, bottom: 24,
    width: 44, height: 44,
    borderRadius: '50%',
    background: 'var(--paper)',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-2)',
    display: 'grid', placeItems: 'center',
    boxShadow: 'var(--sh-soft)',
    zIndex: 70,
    transition: 'all 200ms',
  }
};

Object.assign(window, { PaceApp });

/* ARRANQUE */
const root = ReactDOM.createRoot(document.getElementById('pace-root'));
root.render(<PaceApp />);
