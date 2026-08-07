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

  // Onboarding de primera vez (s106, sustituye al WelcomeModal s17): el
  // componente se auto-gestiona (se muestra si state.firstSeen == null y
  // escucha `pace:open-onboarding` para re-abrirse) — aquí solo se monta,
  // ver el bloque de overlays del return.

  // Deep links de shortcuts PWA (s102): /?go=focus|breathe|move|hydrate abre
  // el módulo al arrancar (manifest.webmanifest → shortcuts). Se consume una
  // sola vez y se limpia la URL (replaceState) para que recargar no
  // re-dispare. 'focus' solo asegura el modo foco: el home YA es el Pomodoro
  // y auto-arrancar un timer sin gesto sería una sorpresa, no una ayuda.
  useEffectMain(() => {
    let go = null;
    try { go = new URLSearchParams(window.location.search).get('go'); } catch (e) {}
    if (!go) return;
    if (go === 'breathe' || go === 'move') setOpenLibrary(go);
    else if (go === 'hydrate') setOpenHydrate(true);
    else if (go === 'focus') set({ focusMode: 'foco' });
    try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}
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

  /* Preview antes de empezar (§18.3 · s144). Estos dos handlers son la puerta
     de la BIBLIOTECA — los Caminos montan el runner por su cuenta en
     `PathBodyStep` —, así que interceptar aquí deja el preview fuera del Camino
     POR CONSTRUCCIÓN, que es lo que se decidió: dentro de un Camino la rutina
     ya viene elegida y el ritmo manda. La biblioteca se queda ABIERTA detrás:
     cerrar el preview te devuelve a ella, no a la home. */
  const [previewRoutine, setPreviewRoutine] = useStateMain(null);

  /* QUÉ PIEL ESTÁ PUESTA (s160), para que el DOM lleve el orden CANÓNICO.
     La piel la declara la hoja de _responsive.js en --pace-skin, que es donde
     ya vive el breakpoint de 769px: aquí no se escribe una tercera copia de ese
     número. Se lee del estilo computado en vez de con matchMedia justamente por
     eso — si mañana el breakpoint cambia, cambia en un sitio y esto lo sigue.
     Un resize la revisa, coalescido a un frame: solo re-renderiza cuando el
     valor CAMBIA de verdad, o sea al cruzar el breakpoint. */
  const leerPiel = () => {
    if (typeof window === 'undefined' || !window.getComputedStyle) return 'movil';
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--pace-skin').trim() || 'movil';
  };
  const [piel, setPiel] = useStateMain(leerPiel);
  useEffectMain(() => {
    let raf = 0;
    const revisar = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; setPiel(leerPiel()); });
    };
    window.addEventListener('resize', revisar);
    revisar(); // primera lectura ya con la hoja aplicada
    return () => {
      window.removeEventListener('resize', revisar);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const lanzarDesdePreview = () => {
    const p = previewRoutine;
    setPreviewRoutine(null);
    if (!p) return;
    setOpenLibrary(null);
    setView({ type: 'move-session', routine: p.routine, kind: p.kind });
  };

  const handleStartMove = (routine) => {
    setPreviewRoutine({ routine, kind: 'move' });
  };
  const handleStartExtra = (routine) => {
    /* Reutiliza MoveSession pero marca kind='extra' para que la completion
       dispare completeExtraSession (logros correctos, plan.extra, no plan.muevete).
       EXCEPCION s138 — las rutinas propias: desde que la seccion "Tus rutinas"
       aparece TAMBIEN en Estira, la misma rutina se puede lanzar por dos
       puertas, y las dos completions NO son equivalentes: `completeExtraSession`
       no incrementa `moveSessionsTotal` (state-achievements.jsx:214), asi que
       quien hiciera sus rutinas propias desde Estira nunca progresaria hacia
       `move.sessions.25`, y ademas desbloquearia `first.extra` en vez de
       `first.stretch`. Una rutina propia es UNA cosa y no pertenece a un modulo
       (por eso no lleva campo de modulo), asi que acredita igual entre a la
       puerta que entre: se conserva el credito via completeMoveSession que fijo
       la decision s93. Consecuencia visible y aceptada: la sesion se pinta con
       el acento de Mueve aunque hayas entrado por Estira. */
    const esPropia = typeof routine.id === 'string' && routine.id.indexOf('custom.') === 0;
    setPreviewRoutine({ routine, kind: esPropia ? 'move' : 'extra' });
  };

  const handleFocusFinish = () => {
    // Al acabar un Pomodoro → menú pausa
    setOpenBreakMenu(true);
  };

  const handleBreakChoice = (choice) => {
    setOpenBreakMenu(false);
    if (choice === 'breathe') setOpenLibrary('breathe');
    else if (choice === 'extra') setOpenLibrary('extra'); // s105: Estira
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

        {/* Región scrollable de la home (s123). Contiene los TRES bloques de la
            jerarquía §1 (s122): Foco (timer) → Camino sugerido → Actividades.
            s160: el aro va SIEMPRE primero, y los otros dos van en el orden
            VISUAL de cada piel — que es el mismo orden en que se leen y se
            tabulan. Lo que se eliminó no es el orden del DOM sino el swap por
            `order` del CSS, que hacía que en escritorio no coincidieran. En pantallas bajas
            el aro se encoge por altura útil (data-pace-dial-fit) y, si aun así
            el conjunto no cabe, ESTA región hace scroll vertical natural en vez
            de recortar contenido (regla del caso short-viewport). overflow-x
            oculto para que nunca aparezca scroll horizontal. */}
        <div data-pace-home-body style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          {/* Bloque "atardecer" (s123): Timer + Camino + Actividades como una
              composición. margin-top/bottom:auto lo CENTRA verticalmente cuando
              hay espacio y, cuando desborda, los márgenes colapsan a 0 y la
              región (home-body) SCROLLEA sin recortar (patrón centrar-o-scrollear
              fiable en flex). El orden del DOM lo pone la piel (s160, abajo). */}
          <div data-pace-home-stack style={{
            marginTop: 'auto',
            marginBottom: 'auto',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flexShrink: 0,
          }}>
            {/* Content — el aro. Altura de CONTENIDO (no crece): su base queda
                adyacente a la tarjeta, sin espacio de centrado variable, para que
                el solapamiento del "atardecer" (margin-top negativo de la tarjeta)
                sea estable. Sin padding inferior por el mismo motivo. */}
            <div data-pace-main-content style={{
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              padding: '10px 40px 0',
            }}>
              <FocusTimer onFinish={handleFocusFinish} />
            </div>

            {/* EL ORDEN DE ESTOS DOS LO PONE LA PIEL (s160), y por eso ya no hay
                ningún "order" en la hoja de escritorio.

                Las dos pieles tienen órdenes visuales genuinamente distintos:
                en móvil la tarjeta de Camino cruza el horizonte del aro y
                Actividades cierra abajo; en escritorio Actividades sube a
                solapar el aro y la tarjeta se va al fondo. Hasta v0.90.0 eso lo
                hacía "order: 1 / 2" con el DOM quieto, así que en escritorio el
                foco de teclado bajaba a la tarjeta del fondo y después SUBÍA a
                los chips (WCAG 2.4.3, medido con Tab: 622 → 698 → 496). Con el
                DOM en el orden canónico de cada piel, orden visual y orden de
                lectura son el mismo por construcción.

                LAS KEYS NO SON DECORACIÓN: sin ellas React reconcilia por
                posición y al cruzar 769px REMONTA los dos bloques en vez de
                moverlos. Con key estable mueve los nodos, que además es lo que
                el observador de home-geometry.js espera ver (vigila el
                childList DIRECTO del stack y re-suscribe su ResizeObserver). */}
            {(() => {
              const camino = <SuggestedPathCard key="spc" />;
              const actividades = (
                <ActivityBar
                  key="act"
                  onOpenLibrary={(kind) => setOpenLibrary(kind)}
                  onOpenHydrate={() => setOpenHydrate(true)}
                />
              );
              return piel === 'escritorio'
                ? [actividades, camino]
                : [camino, actividades];
            })()}
          </div>
        </div>
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

      {/* Onboarding de primera vez (s106) — full-screen sobre las láminas
          de Caminos; retorna null en cuanto firstSeen queda fijado. */}
      <Onboarding />

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

      {/* Preview §18.3 (s144). Va DESPUÉS de la biblioteca en el árbol para
          quedar por encima, igual que el modal de seguridad de Respira. */}
      {previewRoutine && typeof RoutinePreview === 'function' && (
        <RoutinePreview
          routine={previewRoutine.routine}
          kind={previewRoutine.kind}
          onStart={lanzarDesdePreview}
          onClose={() => setPreviewRoutine(null)}
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

      {/* Aviso de versión nueva del SW (s102 · PWA). Solo aparece cuando el
          registro en PACE.html anuncia un worker en waiting; en file:// no
          hay SW y retorna null siempre. */}
      <UpdatePrompt />
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
