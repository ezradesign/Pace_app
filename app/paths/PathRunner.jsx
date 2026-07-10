/* PACE · Caminos · PathRunner orquestador · sesion 50 (split s80)
   Monta un overlay full-screen cuando state.paths.current != null.
   Con paths.current === null y justCompleted === null devuelve null
   -> cero impacto visual en home.

   Tras el split de s80 este archivo contiene SOLO la maquina de fases
   + el dispatcher por step.kind. Los demas componentes viven en:
     - app/paths/steps/_shared.js         (estilos comunes)
     - app/paths/steps/PathBreatheStep.jsx
     - app/paths/steps/PathFocusStep.jsx
     - app/paths/steps/PathHydrateStep.jsx
     - app/paths/steps/PathBodyStep.jsx
     - app/paths/PathRunner.parts.jsx     (PathTopBar, ExitConfirmModal, StepError)
     - app/paths/CompletionScreen.jsx     (pantalla terminal)
   Todos deben estar cargados antes que este archivo (ver PACE.html). */

const { useState: useStatePR, useEffect: useEffectPR } = React;

/* PathRunner - orquestador principal.

   s77: maquina de fases para las transiciones intra-overlay.
     'intro'      -> IntroCard al abrir el Camino (solo si recien iniciado).
     'step'       -> render del paso real (Focus/Breathe/Body/Hydrate).
     'transition' -> StepIntro entre dos pasos (cur.stepIndex ya avanzado).
   s100: la fase 'outro' (OutroCard antes de CompletionScreen) se elimino:
   duplicaba la CompletionScreen (nombre + sendero N/N) sin aportar nada.

   Reglas clave (volatiles, no se persisten en paths.current):
   - Recarga durante intro/transition -> phase='step' al rehidratar.
   - Step intermedio: advancePathStep AHORA, asi recarga aterriza en destino.
   - Ultimo step: snapshot local a justCompleted + advance inmediato
     (CompletionScreen renderiza desde el snapshot, no desde paths.current). */
function PathRunner() {
  const [state] = usePace();
  const { t } = useT();
  const cur = state.paths.current;
  const [justCompleted, setJustCompleted] = useStatePR(null);
  const [confirmExit, setConfirmExit] = useStatePR(false);
  const [phase, setPhase] = useStatePR('step');

  /* Limpiar justCompleted cuando arranca un nuevo camino */
  useEffectPR(() => {
    if (cur) setJustCompleted(null);
  }, [cur ? cur.id : null]);

  /* s76: marca body cuando hay un Camino activo (no en CompletionScreen).
     CSS en tokens.css empuja el padding-top del overlay y de SessionShell
     para dejar sitio a la SenderoBar sticky superior. */
  /* s77: phase = 'intro' al iniciar un Camino (volatil). Detecta "recien
     iniciado" como (Date.now() - startedAt < 1500ms) sobre stepIndex 0.
     Al recargar, este margen ya habra expirado y aterrizamos en 'step'. */
  useEffectPR(() => {
    if (!cur) { setPhase('step'); return; }
    if (cur.stepIndex === 0 && (Date.now() - cur.startedAt) < 1500) {
      setPhase('intro');
    } else {
      setPhase('step');
    }
  }, [cur ? cur.id : null]);

  /* Escape:
       - Modal de confirmacion abierto -> cierra modal.
       - phase != 'step' -> ignorar (la card es tappable de por si).
       - phase === 'step' -> solicita salida (con confirmacion si no opcional).
     NOTA: hook movido antes del early return para cumplir Rules of Hooks. */
  useEffectPR(() => {
    if (!cur) return;
    function handleKey(e) {
      if (e.key !== 'Escape') return;
      var active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
      if (confirmExit) { setConfirmExit(false); return; }
      if (phase !== 'step') return;
      var path = getPath(cur.id);
      var step = path && path.steps[cur.stepIndex];
      if (step && step.optional) {
        abandonPath();
      } else {
        setConfirmExit(true);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [confirmExit, cur ? cur.stepIndex : null, phase]);

  /* Nada que mostrar: home visible */
  if (!cur && !justCompleted) return null;

  /* Pantalla de completado. fadeIn=true: cross-fade 400ms al aterrizar
     directo desde el ultimo paso (s100: sin OutroCard intermedia). */
  if (justCompleted) {
    return (
      <div
        className="path-runner-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={t('path.runner.complete.title')}
      >
        <CompletionScreen
          snapshot={justCompleted}
          onBack={() => setJustCompleted(null)}
          fadeIn
        />
      </div>
    );
  }

  const path = getPath(cur.id);
  if (!path) return null;

  const step = path.steps[cur.stepIndex];
  const totalSteps = path.steps.length;

  /* Callback de paso: dispara transition o completa el Camino.
     - Intermedio: avanza AHORA (decision 3) + phase='transition'.
     - Ultimo (s100, sin OutroCard): snapshot local a justCompleted +
       advance INMEDIATO -> CompletionScreen entra con su fade-in.
       (El snapshot sigue siendo necesario: tras el advance,
       paths.current es null y la pantalla renderiza desde el.) */
  const handleStepExit = (reason) => {
    const isLast = cur.stepIndex >= path.steps.length - 1;
    if (isLast) {
      const skipped = reason === 'skip'
        ? [...cur.skippedSteps, cur.stepIndex]
        : cur.skippedSteps;
      setJustCompleted({
        pathId: cur.id,
        startedAt: cur.startedAt,
        skippedSteps: skipped,
      });
      advancePathStep(reason);
    } else {
      advancePathStep(reason);
      setPhase('transition');
    }
  };

  const handleIntroDone = () => { setPhase('step'); };
  const handleTransitionDone = () => { setPhase('step'); };

  /* Boton de salida: si el paso es opcional, salir directo; si no, confirmar */
  const handleRequestExit = () => {
    if (step.optional) {
      abandonPath();
    } else {
      setConfirmExit(true);
    }
  };

  const displayPathName = t(path.nameKey) || cur.id;
  const senderoBlocks = path.steps.map(function(s, idx) {
    return {
      id: s.kind + '-' + idx,
      name: t('paths.kind.' + s.kind + '.name') || s.kind,
    };
  });

  /* Para StepIntro: durante phase='transition', cur.stepIndex YA refleja
     el destino (advancePathStep ya se llamo). El kind del titulo y el
     hito current son ambos del step actual. */
  const transitionKindName = t('paths.kind.' + step.kind + '.name') || step.kind;

  return (
    <div
      className="path-runner-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={displayPathName}
    >
      {/* Step activo: TopBar + body del paso.
          Solo renderizamos esta capa cuando phase==='step' para evitar
          montar el step mientras hay una card encima (decision 9:
          StepIntro es bloqueante). La SenderoBar sticky se elimino en
          s77b -- la lectura del progreso vive ahora en las
          TransitionCards entre pantallas, no superpuesta al ejercicio. */}
      {phase === 'step' && (
        <>
          <PathTopBar
            pathName={displayPathName}
            onRequestExit={handleRequestExit}
          />
          <div className="path-step-body">
            {step.kind === 'breathe' && (
              <PathBreatheStep step={step} onExit={handleStepExit} />
            )}
            {step.kind === 'focus' && (
              <PathFocusStep step={step} onExit={handleStepExit} />
            )}
            {step.kind === 'body' && (
              <PathBodyStep step={step} onExit={handleStepExit} />
            )}
            {step.kind === 'hydrate' && (
              <PathHydrateStep step={step} onExit={handleStepExit} />
            )}
          </div>
        </>
      )}

      {/* Cards de transicion (s77). Posicionadas absolutas dentro del overlay.
          Guard "typeof X === 'function'" cubre el caso de carga lenta (mismo
          patron defensivo que SenderoBar/TimerDial). */}
      {phase === 'intro' && typeof IntroCard === 'function' && (
        <IntroCard
          pathName={displayPathName}
          blocks={senderoBlocks}
          onContinue={handleIntroDone}
        />
      )}
      {phase === 'transition' && typeof StepIntro === 'function' && (
        <StepIntro
          kindName={transitionKindName}
          kind={step.kind}
          blocks={senderoBlocks}
          currentIndex={cur.stepIndex}
          onContinue={handleTransitionDone}
        />
      )}

      <ExitConfirmModal
        open={confirmExit}
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => { abandonPath(); setConfirmExit(false); }}
      />
    </div>
  );
}

Object.assign(window, { PathRunner });
