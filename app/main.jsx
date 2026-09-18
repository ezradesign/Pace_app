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
   Split en s193 (500 -> 414 ln, al tocar el limite de §1):
   - app/main/main.eventos.jsx -- usePaceEventos: los listeners de `pace:*`
                                  (sidebar-action, open-*, cow-click).
   - app/main/SidebarHandle.jsx -- el asa flotante que reabre la sidebar.
   PaceApp queda como orquestador puro: state local de overlays + handlers
   + composicion de JSX. Lo siguiente que crezca va a un hermano, no aqui.
*/

const { useState: useStateMain, useEffect: useEffectMain } = React;

function PaceApp() {
  const [state, set] = usePace();
  const { t } = useT();
  const [view, setView] = useStateMain({ type: 'home' });

  // Modales
  const [openLibrary, setOpenLibrary] = useStateMain(null); // 'breathe' | 'move' | 'extra' | null
  /* s194 · LA PUERTA de la sesión que venga (state-events.jsx): abrir una biblioteca
     es una puerta, y lo que se empiece desde ella lleva `origin: 'biblioteca'`. Las
     demás puertas anotan la suya en su gesto (la pausa, la barra lateral, la parada,
     el aro); dentro de un Camino manda 'camino' sin preguntar. */
  const anotarPuerta = (puerta, desdeMenu) => { if (typeof paceOrigenSesion === 'function') paceOrigenSesion(puerta, desdeMenu); };
  const abrirBiblioteca = (kind) => { anotarPuerta('biblioteca', false); setOpenLibrary(kind); };
  const [openHydrate, setOpenHydrate] = useStateMain(false);
  const [openAchievements, setOpenAchievements] = useStateMain(false);
  const [openStats, setOpenStats] = useStateMain(false);
  const [openTweaks, setOpenTweaks] = useStateMain(false);
  const [openBreakMenu, setOpenBreakMenu] = useStateMain(false);
  const [openSupport, setOpenSupport] = useStateMain(false);

  // Flujo de seguridad para respiración
  const [safetyRoutine, setSafetyRoutine] = useStateMain(null);
  /* s186 · LA SESION DE RESPIRA QUE SE QUEDO A MEDIAS. Se lee al montar y se
     RE-LEE al volver a la home, que es cuando puede haber cambiado (acabas de
     salir de una sesion, o de terminarla). Vive aqui y no en el estado global
     porque no es estado de la app: es una nota de `pace.breathe.v1`, la clave
     aparte que sigue el patron del Pomodoro (s102). `pendienteReanudar` guarda
     el registro mientras el modal de seguridad esta delante -- reanudar pasa
     por la MISMA puerta que empezar, asi que una rutina con apnea vuelve a
     pedir su confirmacion. */
  const [reanudable, setReanudable] = useStateMain(
    () => (window.leerRespiraGuardada && window.leerRespiraGuardada()) || null);
  const [pendienteReanudar, setPendienteReanudar] = useStateMain(null);

  // Constructor de rutinas premium (F7 · s93). Overlay singleton abierto vía
  // CustomEvent `pace:open-custom-builder` (detail.id: rutina a editar o
  // null para crear). Mientras está abierto se oculta MoveLibrary para que
  // solo un Modal escuche Escape; al cerrar, la biblioteca reaparece
  // (openLibrary conserva 'move').
  const [customBuilder, setCustomBuilder] = useStateMain(null); // null | { id }

  /* LOS LISTENERS DE `pace:*` (open-custom-builder, cow-click, open-achievements,
     open-support, sidebar-action) viven en usePaceEventos (main/main.eventos.jsx,
     s193) y se enganchan más abajo, después de los handlers que usan. */

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
    if (go === 'breathe' || go === 'move') abrirBiblioteca(go);
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

  useEffectMain(() => {
    if (view.type !== 'home') return;
    setReanudable((window.leerRespiraGuardada && window.leerRespiraGuardada()) || null);
  }, [view.type]);

  // Handle start de una rutina
  const handleStartBreathe = (routine, reanudar) => {
    if (routine.safety) {
      setSafetyRoutine(routine);
      setPendienteReanudar(reanudar || null);
      setOpenLibrary(null);
    } else {
      setOpenLibrary(null);
      setView({ type: 'breathe-session', routine, reanudar: reanudar || null });
    }
  };

  /* Preview antes de empezar (§18.3 · s144). Estos dos handlers son la puerta
     de la BIBLIOTECA — los Caminos montan el runner por su cuenta en
     `PathBodyStep` —, así que interceptar aquí deja el preview fuera del Camino
     POR CONSTRUCCIÓN, que es lo que se decidió: dentro de un Camino la rutina
     ya viene elegida y el ritmo manda. La biblioteca se queda ABIERTA detrás:
     cerrar el preview te devuelve a ella, no a la home. */
  const [previewRoutine, setPreviewRoutine] = useStateMain(null);

  /* s166: aquí vivía el lector de --pace-skin de s160, que existía SOLO para
     elegir el orden del DOM. Con un orden único (abajo) se quedó sin consumidor
     y se ha ido entero, con su listener de resize y su rAF: era un re-render de
     la home entera cada vez que se cruzaba el breakpoint, a cambio de nada.
     --pace-skin NO desaparece — lo sigue publicando _responsive.pieles.js y lo
     siguen leyendo las hojas; lo que se va es la copia en JS. */
  const lanzarDesdePreview = () => {
    const p = previewRoutine;
    setPreviewRoutine(null);
    if (!p) return;
    /* s178: aquí se capturaba la capitular para el VUELO de s174, que aterrizaba
       en el círculo de arte de la preparación. s175 quitó ese arte por decisión
       del usuario y con él el único destino posible, así que desde entonces el
       vuelo clonaba un nodo y gastaba 24 frames buscando dónde posarse antes de
       rendirse. La auditoría de s178 lo midió y se ha ido entero: el módulo, su
       <script> y esta llamada. Si algún día vuelve un destino, vuelve con él.
       `tests/transicion-biblioteca.spec.js` sigue vigilando que no aparezca un
       clon suelto. */
    setOpenLibrary(null);
    setView({ type: 'move-session', routine: p.routine, kind: p.kind });
  };

  const handleStartMove = (routine) => {
    setPreviewRoutine({ routine, kind: 'move' });
  };

  /* LO QUE EL ROOT ESCUCHA (main/main.eventos.jsx, s193): los CustomEvent con
     los que la shell pide abrir cosas. VA AQUÍ, y no arriba con el estado de
     los modales, porque usa `handleStartBreathe` y `setPreviewRoutine`, que se
     declaran más arriba pero DESPUÉS de aquel bloque. Con `[]` de dependencias
     el hook captura el binding del primer render —que ya está inicializado
     cuando el handler corre—, pero declararlo antes de lo que usa se lee como
     un error aunque no lo sea. */
  usePaceEventos({
    abrirConstructor: (id) => setCustomBuilder({ id }),
    abrirLogros: () => setOpenAchievements(true),
    abrirApoyo: () => setOpenSupport(true),
    abrirStats: () => setOpenStats(true),
    abrirBiblioteca: abrirBiblioteca,
    abrirAgua: () => setOpenHydrate(true),
    empezarRespira: handleStartBreathe,
    previsualizar: setPreviewRoutine,
  });

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
    /* Al acabar un Pomodoro → menú pausa. s193: y con «A tu ritmo», la pausa del
       día queda ABIERTA (la línea pone «Ahora» en la parada) hasta que empiece el
       bloque siguiente. `completePomodoro` ya subió `cycle` antes de llegar aquí. */
    if (typeof ritmoBloqueTerminado === 'function') ritmoBloqueTerminado();
    setOpenBreakMenu(true);
  };

  const handleBreakChoice = (choice, rutina, desdeMenu) => {
    setOpenBreakMenu(false);
    /* s194 · la pausa es una puerta; `desdeMenu` dice si lo elegido era el plato que
       «A tu ritmo» sirvió (BreakMenu lo sabe por el motivo de la propuesta). */
    if (choice === 'breathe' || choice === 'extra' || choice === 'move') anotarPuerta('pausa', !!desdeMenu);
    /* s187 · CON RUTINA CONCRETA se entra en ELLA y no en su biblioteca -- es la
       diferencia entre proponer y volver a preguntar-, y por las MISMAS puertas:
       `handleStartBreathe` con su modal, y el preview de cuerpo (§18.3). Sin
       rutina, todo sigue igual. */
    if (rutina && rutina.id) {
      if (choice === 'breathe') { handleStartBreathe(rutina); return; }
      if (choice === 'extra' || choice === 'move') {
        setPreviewRoutine({ routine: rutina, kind: choice === 'extra' ? 'extra' : 'move' });
        return;
      }
    }
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

      {/* Asa flotante para re-abrir la sidebar cuando está oculta (sólo en
          layout con sidebar y colapsada). El dibujo vive en
          app/main/SidebarHandle.jsx (s193); el CSS lo amplía en móvil por
          `data-pace-sidebar-open` — ver app/main/_responsive.js. */}
      {state.layout !== 'minimal' && state.sidebarCollapsed && (
        <SidebarHandle onOpen={() => set({ sidebarCollapsed: false })} />
      )}
      {/* MAIN AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflow: 'hidden' }}>
        {/* Top bar */}
        <TopBar
          onOpenLibrary={abrirBiblioteca}
          onOpenHydrate={() => setOpenHydrate(true)}
          onOpenStats={() => setOpenStats(true)}
          onOpenTweaks={() => setOpenTweaks(true)}
        />

        {/* Región scrollable de la home (s123). Contiene los TRES bloques de la
            jerarquía §1 (s122). s166: el orden es UNO SOLO en todo el viewport
            — Foco (timer) → Actividades → Camino sugerido —, que es también el
            orden en que se lee y se tabula. Ni el DOM ni el CSS reordenan nada:
            no queda un solo `order` ni un reparto por piel. En pantallas bajas
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
              fiable en flex). El orden del DOM es FIJO (s166, abajo). */}
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

            {/* UN SOLO ORDEN PARA LAS DOS PIELES (s166): aro → Actividades →
                Camino. Lo pidió el usuario mirando las dos pantallas al lado:
                en móvil la tarjeta se colaba entre el aro y Actividades y la
                home no se parecía a la de escritorio.

                ESTO SUSTITUYE AL REPARTO POR PIEL DE s160, y de paso lo que
                aquella sesión arregló ya no puede volver: s160 quitó el swap por
                "order" del CSS porque en escritorio el foco de teclado bajaba a
                la tarjeta y luego SUBÍA a los chips (WCAG 2.4.3, medido con Tab:
                622 → 698 → 496). La lección era que orden visual y orden de DOM
                no deben poder divergir; con UN orden para todo el viewport no
                hay ni dos órdenes que sincronizar. La piel sigue decidiendo el
                aspecto —quién hace de horizonte, cuánto solapa— pero ya no
                decide la SECUENCIA.

                LAS KEYS SE QUEDAN: el observador de home-geometry.js vigila el
                childList DIRECTO del stack y re-suscribe su ResizeObserver, así
                que sigue interesando que React mueva nodos y no los remonte.
                s192: los dos bloques los pinta RitmoHome («A tu ritmo»): el panel del
                día o, por libre, Actividades y Camino con sus keys (ritmo/RitmoHome.jsx). */}
            <RitmoHome
              onOpenLibrary={abrirBiblioteca}
              onOpenHydrate={() => setOpenHydrate(true)}
            />
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
          onAccept={(r) => {
            setSafetyRoutine(null);
            setView({ type: 'breathe-session', routine: r, reanudar: pendienteReanudar });
            setPendienteReanudar(null);
          }}
          onCancel={() => { setSafetyRoutine(null); setPendienteReanudar(null); }}
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
        <BreatheSession routine={view.routine} reanudar={view.reanudar} onExit={(_reason) => setView({ type: 'home' })} />
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
