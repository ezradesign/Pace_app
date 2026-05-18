/* PACE · Caminos · Step de Respira · sesion 80 (split de PathRunner.jsx)
   Envoltura sobre BreatheSession con resolucion de rutina y gate de
   seguridad para rutinas marcadas safety:true (wim-hof, kapalabhati).
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'. */

const { useState: useStateBS } = React;

function PathBreatheStep({ step, onExit }) {
  const routine = getBreatheRoutine && getBreatheRoutine(step.routineId);
  if (!routine) return <StepError routineId={step.routineId} onSkip={() => onExit('skip')} />;

  if (routine.safety) {
    return <PathBreatheSafetyGate routine={routine} onExit={onExit} />;
  }
  return <BreatheSession routine={routine} onExit={onExit} />;
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
  return <BreatheSession routine={routine} onExit={onExit} />;
}

Object.assign(window, { PathBreatheStep, PathBreatheSafetyGate });
