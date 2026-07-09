/* PACE · Caminos · Step de Cuerpo · sesion 80 (split de PathRunner.jsx)
   Dispatcher: resuelve routineId via resolveBodyRoutine (busca primero en
   MoveModule, luego en ExtraModule) y renderiza MoveSession con
   kind='move' o kind='extra'. El catalogo usa kind:'body' como entrada
   unica; la separacion move/extra (stretch) ocurre aqui por procedencia
   de la rutina.
   Contrato uniforme: (step, onExit(reason)) con reason 'done' | 'skip'. */

function PathBodyStep({ step, onExit }) {
  const resolved = resolveBodyRoutine && resolveBodyRoutine(step.routineId);
  if (!resolved) return <StepError routineId={step.routineId} onSkip={() => onExit('skip')} />;
  // Guard central de acceso (s95). Ver nota en PathBreatheStep: degustacion via
  // step.tasting; rama false = PathStepLocked (auto-skip, dead code en s95).
  if (window.canAccessRoutine && !window.canAccessRoutine(step.routineId, { tasting: step.tasting })) {
    return <PathStepLocked onSkip={() => onExit('skip')} />;
  }
  const kind = resolved.source === 'extra' ? 'extra' : 'move';
  return <MoveSession routine={resolved.routine} kind={kind} onExit={onExit} inPath />;
}

Object.assign(window, { PathBodyStep });
