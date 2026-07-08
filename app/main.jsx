/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   Main orchestrator (post split s82 / v0.33.2).
   Monta el shell completo: Sidebar + main area (TopBar + FocusTimer +
   ActivityBar + SuggestedPathCard) + modales + sesiones fullscreen +
   overlays de Caminos + Toast.

   Split en s82 (variante B):
   - app/main/_responsive.js  -- bloque <style> con reglas @media globales.
   - app/main/TopBar.jsx      -- tabs Foco/Pausa/Larga + 3 iconos top-right.
   - app/main/ActivityBar.jsx -- 4 chips Respira/Estira/Mueve/Hidratate.
   PaceApp queda como orquestador puro: state local de overlays + handlers
   + composicion de JSX.
*/

const { useState: useStateMain, useEffect: useEffectMain } = React;

function PaceApp() {
  const [state, set] = usePace();
  const { t } = useT();
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

  // Constructor de rutinas premium (F7 · s93). Overlay singleton abierto vía
  // CustomEvent `pace:open-custom-builder` (detail.id: rutina a editar o
  // null para crear). Mientras está abierto se oculta MoveLibrary para que
  // solo un Modal escuche Escape; al cerrar, la biblioteca reaparece
  // (openLibrary conserva 'move').
  const [customBuilder, setCustomBuilder] = useStateMain(null); // null | { id }
  useEffectMain(() => {
    const h = (e) => setCustomBuilder({ id: (e.detail && e.detail.id) || null });
    window.addEventListener('pace:open-custom-builder', h);
    return () => window.removeEventListener('pace:open-custom-builder', h);
  }, []);

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

  // Atajos de teclado: T toggle Tweaks, S toggle Stats, L toggle Logros.
  // Ignora cuando focus esta en INPUT/TEXTAREA para no interferir con campos.
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
       inyectado [data-pace-app-root] (ahora en app/main/_responsive.js).
       Permite fallback vh → override dvh que los objetos de estilos
       inline no pueden expresar (una sola key por propiedad). El resto
       de estilos (display, overflow, background, position) se quedan
       inline porque no necesitan fallback cascada. */
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
          accesible) — ver app/main/_responsive.js. */}
      {state.layout !== 'minimal' && state.sidebarCollapsed && (
        <button
          data-pace-sidebar-open
          onClick={() => set({ sidebarCollapsed: false })}
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

        {/* Camino sugerido del momento (sesion 51) */}
        <SuggestedPathCard />
      </main>

      {/* ========== MODALS ========== */}
      <BreatheLibrary
        open={openLibrary === 'breathe'}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartBreathe}
      />
      <MoveLibrary
        open={openLibrary === 'move' && !customBuilder}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartMove}
      />
      {customBuilder && (
        <CustomBuilder editId={customBuilder.id} onClose={() => setCustomBuilder(null)} />
      )}
      <ExtraLibrary
        open={openLibrary === 'extra'}
        onClose={() => setOpenLibrary(null)}
        onStart={handleStartExtra}
      />
      <HydrateTracker open={openHydrate} onClose={() => setOpenHydrate(false)} />
      <Achievements open={openAchievements} onClose={() => setOpenAchievements(false)} />
      <StatsPanel open={openStats} onClose={() => setOpenStats(false)} />
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

      {/* ========== CAMINOS ========== */}
      <PathRunner />
      <PathsLibrary />

      {/* ========== TOASTS ========== */}
      <ToastHost />
    </div>
  );
}

Object.assign(window, { PaceApp });

/* ARRANQUE DIRECTO (sólo si existe #pace-root en DOM — entry point standalone).
   En el entry point modular PACE.html el montaje lo hace el script de abajo en #root. */
if (typeof document !== 'undefined' && document.getElementById('pace-root')) {
  const root = ReactDOM.createRoot(document.getElementById('pace-root'));
  root.render(<PaceApp />);
}
