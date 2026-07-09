/* PACE · Caminos · Step de Respira · sesion 80 (split de PathRunner.jsx)
   Envoltura sobre BreatheSession con resolucion de rutina y gate de
   seguridad para rutinas marcadas safety:true (wim-hof, kapalabhati).
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'. */

const { useState: useStateBS } = React;

function PathBreatheStep({ step, onExit }) {
  const routine = getBreatheRoutine && getBreatheRoutine(step.routineId);
  if (!routine) return <StepError routineId={step.routineId} onSkip={() => onExit('skip')} />;

  // Guard central de acceso (s95). Con degustacion (step.tasting) una rutina
  // premium se lanza aunque premiumUnlocked sea false; sin ella, PathStepLocked
  // salta el step en silencio. En s95 nunca se alcanza (weekend es tasting).
  if (window.canAccessRoutine && !window.canAccessRoutine(step.routineId, { tasting: step.tasting })) {
    return <PathStepLocked onSkip={() => onExit('skip')} />;
  }

  if (routine.safety) {
    return <PathBreatheSafetyGate routine={routine} onExit={onExit} />;
  }
  return <BreatheSession routine={routine} onExit={onExit} inPath />;
}

function PathBreatheSafetyGate({ routine, onExit }) {
  const [accepted, setAccepted] = useStateBS(false);
  if (!accepted) {
    return (
      <BreatheSafety
        routine={routine}
        onAccept={() => setAccepted(true)}
        onCancel={() => onExit('skip')}
      />
    );
  }
  return <BreatheSession routine={routine} onExit={onExit} inPath />;
}

Object.assign(window, { PathBreatheStep, PathBreatheSafetyGate });
