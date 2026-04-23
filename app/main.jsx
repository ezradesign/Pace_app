/* PACE · Main orchestrator
   Monta todo: Sidebar + FocusTimer + modales de librerías + sesiones

   RESPONSIVE (sesión 22 · v0.12.5):
     El layout desktop es flex horizontal [Sidebar 280 | Main 1fr].
     En ≤768px el sidebar se absolutamente desacopla (pasa a
     position:fixed y ocupa el viewport entero — ver Sidebar.jsx),
     así que en móvil el main toma 100vw por sí solo sin cambios.
     Los ajustes aquí son sobre TopBar y ActivityBar para que
     quepan en 375px de ancho, y sobre el handle flotante `≡` para
     aumentar su hit target a 44px (accesibilidad móvil).
*/

const { useState: useStateMain, useEffect: useEffectMain } = React;

/* Reglas responsive globales del layout. Inyectadas una sola vez.
   - TopBar: reduce padding lateral y el ancho de los tabs en móvil
     para dejar sitio a los 3 iconos de la derecha sin que choquen.
   - Main content: en móvil sigue centrando el timer pero con menos
     padding horizontal para ganar ancho para el aro.
   - ActivityBar: en móvil, los 4 accesos pasan de fila horizontal
     de pills anchos (min-width 180) a grid 2×2 de tarjetas
     compactas (chip vertical: icono arriba, label abajo).
     Así el bloque completo mide ~220px de alto en 375×812 y deja
     que el timer ocupe unos ~420 px centrales. */
if (typeof document !== 'undefined' && !document.getElementById('pace-main-responsive-css')) {
  const s = document.createElement('style');
  s.id = 'pace-main-responsive-css';
  s.textContent = `
    /* Alto del contenedor raíz: 100vh de fallback + 100dvh en navegadores
       modernos. 100dvh (dynamic viewport height) se recalcula cuando la
       barra de URL móvil aparece/desaparece, así que la app siempre
       encaja en el espacio real visible en vez de quedarse atada al
       alto máximo (con URL oculta) como hace 100vh. En desktop 1920×1080
       100dvh === 100vh — cero impacto. Fallback garantiza que navegadores
       antiguos (pre-iOS 15.4 / Chrome 107 / Firefox 100) siguen usando vh.
       Sesión 23 · v0.12.6. */
    [data-pace-app-root] {
      height: 100vh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100dvh;
    }
    @media (max-width: 768px) {
      [data-pace-topbar] {
        padding: 10px 12px !important;
        min-height: 48px !important;
        gap: 4px !important;
      }
      /* Tabs Foco/Pausa/Larga: más compactos */
      [data-pace-topbar] [data-pace-tabs] button {
        padding: 5px 12px !important;
        font-size: 10px !important;
        letter-spacing: 0.14em !important;
      }
      /* Iconos top-right: hit target 40x40 */
      [data-pace-topbar] [data-pace-topbar-icon] {
        width: 40px !important;
        height: 40px !important;
      }
      /* Main content: menos padding para ganar ancho del aro */
      [data-pace-main-content] {
        padding: 4px 12px !important;
      }
      /* ActivityBar en móvil: grid 2×2, chips compactos verticales */
      [data-pace-activitybar] {
        padding: 4px 12px 14px !important;
      }
      [data-pace-activitybar-grid] {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
      [data-pace-activitybar-chip] {
        min-width: 0 !important;
        flex: 1 1 auto !important;
        padding: 10px 12px !important;
        gap: 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 15px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        font-size: 11px !important;
      }
      /* Handle flotante ≡ para abrir sidebar: hit target ≥44px */
      [data-pace-sidebar-open] {
        width: 44px !important;
        height: 44px !important;
        top: 8px !important;
        left: 8px !important;
      }
    }
    /* Viewports muy bajos (≤700 de alto): reducir aún más la ActivityBar
       para dejar que el aro respire. Sólo afecta móvil vertical pequeño. */
    @media (max-width: 768px) and (max-height: 720px) {
      [data-pace-activitybar-chip] {
        padding: 8px 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 14px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(s);
}

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
  const [openSupport, setOpenSupport] = useStateMain(false);
  const [openWelcome, setOpenWelcome] = useStateMain(false);

  // Flujo de seguridad para respiración
  const [safetyRoutine, setSafetyRoutine] = useStateMain(null);

  // Logro secreto: clicks en la vaca del logo (sidebar o topbar).
  // Se escucha como evento global para que el Sidebar pueda disparar clicks
  // sobre el logo sin acoplarse a props del root.
  const [cowClicks, setCowClicks] = useStateMain(0);
  useEffectMain(() => {
    if (cowClicks >= 10) unlockAchievement('secret.cow.click');
  }, [cowClicks]);
  useEffectMain(() => {
    const h = () => setCowClicks(c => c + 1);
    window.addEventListener('pace:cow-click', h);
    return () => window.removeEventListener('pace:cow-click', h);
  }, []);

  // Abrir colección desde sidebar
  useEffectMain(() => {
    const h = () => setOpenAchievements(true);
    window.addEventListener('pace:open-achievements', h);
    return () => window.removeEventListener('pace:open-achievements', h);
  }, []);

  // Abrir modal de apoyo desde sidebar (sesión 16 / v0.11.11).
  // Mismo patrón que `pace:open-achievements`: el Sidebar despacha el
  // evento y aquí lo escuchamos para abrir. Desacopla el botón del root.
  useEffectMain(() => {
    const h = () => setOpenSupport(true);
    window.addEventListener('pace:open-support', h);
    return () => window.removeEventListener('pace:open-support', h);
  }, []);

  // Auto-trigger único del SupportModal a los 7 días de racha.
  // Consumidor del helper expuesto en SupportModule.jsx; la lógica
  // ('condición + flag de una sola vez') vive allí para mantenerla
  // junto a la filosofía del módulo.
  useSupportAutoTrigger(setOpenSupport);

  // Auto-trigger del WelcomeModal la primera vez que se abre la app
  // (state.firstSeen == null). Mismo patrón que el anterior.
  useFirstTimeWelcome(setOpenWelcome);

  // Re-abrir welcome a mano (dev / curiosidad): evento global
  // `pace:open-welcome`. Mismo patrón que `pace:open-support`.
  useEffectMain(() => {
    const h = () => setOpenWelcome(true);
    window.addEventListener('pace:open-welcome', h);
    return () => window.removeEventListener('pace:open-welcome', h);
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
    // Reutiliza MoveSession pero marca kind='extra' para que la completion
    // dispare completeExtraSession (logros correctos, plan.extra, no plan.muevete).
    setView({ type: 'move-session', routine, kind: 'extra' });
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
    /* NOTA sesión 23: `height` y `maxHeight` se delegan al bloque CSS
       inyectado [data-pace-app-root] arriba. Permite fallback vh →
       override dvh que los objetos de estilos inline no pueden
       expresar (una sola key por propiedad). El resto de estilos
       (display, overflow, background, position) se quedan inline
       porque no necesitan fallback cascada. */
    <div data-pace-app-root style={{
      display: 'flex',
      overflow: 'hidden',
      background: 'var(--paper)',
      position: 'relative',
    }}>
      {/* SIDEBAR */}
      {state.layout !== 'minimal' && <Sidebar />}

      {/* Handle flotante para re-abrir sidebar cuando está oculto
          (aparece sólo en layout con sidebar y cuando está colapsado).
          En móvil (≤768px) el CSS lo amplía a 44×44 (hit target
          accesible) — ver bloque pace-main-responsive-css arriba. */}
      {state.layout !== 'minimal' && state.sidebarCollapsed && (
        <button
          data-pace-sidebar-open
          onClick={() => set({ sidebarCollapsed: false })}
          title="Abrir panel"
          aria-label="Abrir panel"
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
      )}

      {/* MAIN AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        {/* Top bar */}
        <TopBar
          onOpenLibrary={(kind) => setOpenLibrary(kind)}
          onOpenHydrate={() => setOpenHydrate(true)}
          onOpenStats={() => setOpenStats(true)}
          onOpenTweaks={() => setOpenTweaks(true)}
        />

        {/* Content */}
        <div data-pace-main-content style={{
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
      <SupportModal open={openSupport} onClose={() => setOpenSupport(false)} />
      <WelcomeModal open={openWelcome} onClose={() => setOpenWelcome(false)} />

      {/* Observador de tweak-secrets — monta siempre, retorna null.
          Desbloquea secret.aged / dark.mode / mono / seal / illustrated
          en función del state actual. Ver TweaksPanel.jsx. */}
      <TweakSecretsWatcher />

      {safetyRoutine && (
        <BreatheSafety
          routine={safetyRoutine}
          onAccept={(r) => { setSafetyRoutine(null); setView({ type: 'breathe-session', routine: r }); }}
          onCancel={() => setSafetyRoutine(null)}
        />
      )}

      {/* ========== SESSION FULLSCREEN ==========
          NOTA (#29): los <Session/> llaman `onExit('exit')` vs `onExit('done')`
          para diferenciar salida voluntaria de finalización completa. Hoy
          ambos caminos van a home y el argumento se descarta intencionalmente;
          se conserva la señal en la API para un futuro consumidor (p.ej.
          micro-animación de despedida distinta, o métrica de abandono). */}
      {view.type === 'breathe-session' && (
        <BreatheSession routine={view.routine} onExit={(_reason) => setView({ type: 'home' })} />
      )}
      {view.type === 'move-session' && (
        <MoveSession routine={view.routine} kind={view.kind || 'move'} onExit={(_reason) => setView({ type: 'home' })} />
      )}

      {/* ========== TOASTS ========== */}
      <ToastHost />
    </div>
  );
}

/* ================
   TOP BAR
   ================ */
function TopBar({ onOpenLibrary, onOpenHydrate, onOpenStats, onOpenTweaks }) {
  const [state, set] = usePace();
  const modes = [
    { v: 'foco', label: 'Foco' },
    { v: 'pausa', label: 'Pausa' },
    { v: 'larga', label: 'Larga' },
  ];
  return (
    <div data-pace-topbar style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      padding: '14px 24px',
      gap: 8,
      flexShrink: 0,
      minHeight: 56,
    }}>
      {/* Tabs centrados (según referencia) */}
      <div data-pace-tabs style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'inline-flex',
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-pill)',
        padding: 3,
        gap: 2,
      }}>
        {modes.map(m => (
          <button key={m.v} onClick={() => set({ focusMode: m.v })}
            style={{
              padding: '6px 18px',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 500,
              borderRadius: 'var(--r-pill)',
              background: state.focusMode === m.v ? 'var(--ink)' : 'transparent',
              color: state.focusMode === m.v ? 'var(--paper)' : 'var(--ink-2)',
              transition: 'all 200ms',
            }}>{m.label}</button>
        ))}
      </div>

      {/* Iconos top-right */}
      <button data-pace-topbar-icon onClick={onOpenStats} style={topBarStyles.iconBtn} title="Ritmo semanal (S)" aria-label="Ver estadísticas">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" />
        </svg>
      </button>
      <button data-pace-topbar-icon onClick={() => window.dispatchEvent(new CustomEvent('pace:open-achievements'))} style={topBarStyles.iconBtn} title="Logros (L)" aria-label="Ver logros">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6" /><path d="M8 14l-1 7 5-3 5 3-1-7" />
        </svg>
      </button>
      <button data-pace-topbar-icon onClick={onOpenTweaks} style={topBarStyles.iconBtn} title="Tweaks (T)" aria-label="Abrir tweaks">
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
    <div data-pace-activitybar style={{ padding: '6px 40px 20px', flexShrink: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <Meta>Actividades</Meta>
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

Object.assign(window, { PaceApp, TopBar, ActivityBar });

/* ARRANQUE DIRECTO (sólo si existe #pace-root en DOM — entry point standalone).
   En el entry point modular PACE.html el montaje lo hace el script de abajo en #root. */
if (typeof document !== 'undefined' && document.getElementById('pace-root')) {
  const root = ReactDOM.createRoot(document.getElementById('pace-root'));
  root.render(<PaceApp />);
}
