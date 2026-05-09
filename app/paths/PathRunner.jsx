/* PACE - Caminos - PathRunner overlay (sesion 50 / v0.26.0-beta)
   Monta un overlay full-screen cuando state.paths.current != null.
   Con paths.current === null y justCompleted === null devuelve null
   -> cero impacto visual en home.
*/

const { useState: useStatePR, useEffect: useEffectPR, useRef: useRefPR } = React;

/* PathTopBar - barra superior con dots y boton de salida */
function PathTopBar({ pathName, stepIndex, totalSteps, onRequestExit }) {
  const { t } = useT();
  return (
    <div className="path-topbar">
      <div style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 500 }}>
        {pathName}
      </div>
      <div className="path-dots">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={
              'path-dot' +
              (i < stepIndex ? ' done' : '') +
              (i === stepIndex ? ' active' : '')
            }
          />
        ))}
      </div>
      <button
        onClick={onRequestExit}
        aria-label={t('path.runner.exit')}
        style={{
          background: 'transparent', border: 'none',
          color: 'var(--ink-3)', cursor: 'pointer',
          padding: 8, fontSize: 20, lineHeight: 1,
        }}
      >
        &#x2715;
      </button>
    </div>
  );
}

/* ExitConfirmModal - confirmacion in-app (sin llamada al dialog nativo) */
function ExitConfirmModal({ open, onCancel, onConfirm }) {
  const { t } = useT();
  const cancelBtnRef = useRefPR(null);

  useEffectPR(() => {
    if (!open) return;
    // Focus en boton Seguir al abrir
    if (cancelBtnRef.current) cancelBtnRef.current.focus();
    // Cerrar con Escape
    function handleKey(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="path-modal-back"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)', borderRadius: 'var(--r-md)',
          padding: 32, maxWidth: 380, width: '90%',
          border: '1px solid var(--line)',
        }}
      >
        <h3 id="exit-confirm-title" style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 500 }}>
          {t('path.runner.exitConfirmTitle')}
        </h3>
        <p style={{ margin: '0 0 24px', color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
          {t('path.runner.exitConfirmBody')}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r-sm)',
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
            }}
          >
            {t('path.runner.exitConfirmNo')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', borderRadius: 'var(--r-sm)',
              background: 'var(--terracota)', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: 13,
            }}
          >
            {t('path.runner.exitConfirmYes')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* CompletionScreen - pantalla de camino completado */
function CompletionScreen({ snapshot, onBack }) {
  const { t, tn } = useT();
  const path = getPath(snapshot.pathId);
  const name = path ? snapshot.pathId : snapshot.pathId;
  const elapsed = snapshot.startedAt
    ? Math.round((Date.now() - snapshot.startedAt) / 60000)
    : 0;
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--breathe-soft)', color: 'var(--breathe)',
        display: 'grid', placeItems: 'center', fontSize: 28,
        marginBottom: 24,
      }}>
        &#x2714;
      </div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
        {t('path.runner.complete.title')}
      </p>
      <h2 style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic', fontSize: 36, fontWeight: 500,
        color: 'var(--ink)', margin: '0 0 12px', lineHeight: 1.2,
      }}>
        {snapshot.pathId.replace('path.', '')}
      </h2>
      {elapsed > 0 && (
        <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 32px' }}>
          {elapsed} min
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '12px 32px', borderRadius: 'var(--r-pill)',
            background: 'var(--ink)', border: 'none',
            color: 'var(--paper)', cursor: 'pointer',
            fontSize: 13, letterSpacing: '0.1em',
          }}
        >
          {t('path.runner.complete.back')}
        </button>
        <button
          onClick={function() { onBack(); if (typeof startPath === 'function') startPath(snapshot.pathId); }}
          style={{
            padding: '8px 24px', borderRadius: 'var(--r-pill)',
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--ink-3)', cursor: 'pointer',
            fontSize: 12, letterSpacing: '0.1em',
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
          }}
        >
          {t('paths.runner.repeat') || 'Repetir camino'}
        </button>
      </div>
    </div>
  );
}

/* StepError - fallback si routineId no resuelve */
function StepError({ routineId, onSkip }) {
  const { t } = useT();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      <p style={{ color: 'var(--ink-2)', marginBottom: 20, fontSize: 14 }}>
        {t('path.error.routineNotFound').replace('{id}', routineId)}
      </p>
      <button
        onClick={onSkip}
        style={{
          padding: '10px 24px', borderRadius: 'var(--r-sm)',
          background: 'var(--paper-2)', border: '1px solid var(--line)',
          color: 'var(--ink)', cursor: 'pointer', fontSize: 13,
        }}
      >
        {t('path.runner.skip')}
      </button>
    </div>
  );
}

/* PathHydrateStep - vaso de agua opcional */
function PathHydrateStep({ onDone, onSkip }) {
  const { t } = useT();
  const handleDrank = () => {
    if (typeof addWaterGlass === 'function') {
      try { addWaterGlass(1); } catch (e) {}
    }
    onDone();
  };
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--hydrate-soft, rgba(100,180,220,0.12))',
        display: 'grid', placeItems: 'center',
        fontSize: 28, marginBottom: 24,
      }}>
        &#x1F4A7;
      </div>
      <p style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic', fontSize: 28, fontWeight: 500,
        color: 'var(--ink)', margin: '0 0 32px', lineHeight: 1.3,
      }}>
        {t('path.hydrate.copy')}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onSkip}
          style={{
            padding: '10px 24px', borderRadius: 'var(--r-sm)',
            background: 'var(--paper-2)', border: '1px solid var(--line)',
            color: 'var(--ink-2)', cursor: 'pointer', fontSize: 13,
          }}
        >
          {t('path.runner.skip')}
        </button>
        <button
          onClick={handleDrank}
          style={{
            padding: '10px 24px', borderRadius: 'var(--r-sm)',
            background: 'var(--ink)', border: 'none',
            color: 'var(--paper)', cursor: 'pointer', fontSize: 13,
          }}
        >
          {t('path.hydrate.drank')}
        </button>
      </div>
    </div>
  );
}

/* PathFocusStep - timer simple para paso de foco */
function PathFocusStep({ step, onExit }) {
  const { t } = useT();
  const totalSec = (step.min || 25) * 60;
  const [remaining, setRemaining] = useStatePR(totalSec);
  const [running, setRunning] = useStatePR(false);
  const [done, setDone] = useStatePR(false);
  const intervalRef = useRefPR(null);

  useEffectPR(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 16px' }}>
        {t('topbar.mode.focus')}
      </p>
      <div style={{
        fontFamily: "'EB Garamond', Georgia, serif",
        fontSize: 96, fontWeight: 400,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--ink)', lineHeight: 1, marginBottom: 32,
      }}>
        {mins}:{secs}
      </div>
      {!done ? (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              padding: '10px 28px', borderRadius: 'var(--r-sm)',
              background: 'var(--ink)', border: 'none',
              color: 'var(--paper)', cursor: 'pointer', fontSize: 13,
            }}
          >
            {running ? t('session.pause') : (remaining < totalSec ? t('session.resume') : t('topbar.mode.focus'))}
          </button>
          <button
            onClick={() => onExit('skip')}
            style={{
              padding: '10px 20px', borderRadius: 'var(--r-sm)',
              background: 'var(--paper-2)', border: '1px solid var(--line)',
              color: 'var(--ink-2)', cursor: 'pointer', fontSize: 13,
            }}
          >
            {t('path.runner.skip')}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onExit('done')}
          style={{
            padding: '10px 28px', borderRadius: 'var(--r-sm)',
            background: 'var(--ink)', border: 'none',
            color: 'var(--paper)', cursor: 'pointer', fontSize: 13,
          }}
        >
          {t('path.runner.done')}
        </button>
      )}
    </div>
  );
}

/* PathBreatheStep - envoltura sobre BreatheSession */
function PathBreatheStep({ step, onExit }) {
  const routine = getBreatheRoutine && getBreatheRoutine(step.routineId);
  if (!routine) return <StepError routineId={step.routineId} onSkip={() => onExit('skip')} />;

  if (routine.safety) {
    return <PathBreatheSafetyGate routine={routine} onExit={onExit} />;
  }
  return <BreatheSession routine={routine} onExit={onExit} />;
}

function PathBreatheSafetyGate({ routine, onExit }) {
  const [accepted, setAccepted] = useStatePR(false);
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

/* PathBodyStep - envoltura sobre MoveSession / ExtraSession */
function PathBodyStep({ step, onExit }) {
  const resolved = resolveBodyRoutine && resolveBodyRoutine(step.routineId);
  if (!resolved) return <StepError routineId={step.routineId} onSkip={() => onExit('skip')} />;
  const kind = resolved.source === 'extra' ? 'extra' : 'move';
  return <MoveSession routine={resolved.routine} kind={kind} onExit={onExit} />;
}

/* PathRunner - orquestador principal */
function PathRunner() {
  const [state] = usePace();
  const { t } = useT();
  const cur = state.paths.current;
  const [justCompleted, setJustCompleted] = useStatePR(null);
  const [confirmExit, setConfirmExit] = useStatePR(false);

  /* Limpiar justCompleted cuando arranca un nuevo camino */
  useEffectPR(() => {
    if (cur) setJustCompleted(null);
  }, [cur ? cur.id : null]);

  /* Escape: si hay modal de confirmacion abierto -> lo cierra; si no -> solicita salida.
     NOTA: hook movido antes del early return para cumplir Rules of Hooks.
     El guard "if (!cur) return" esta dentro del callback, no fuera. */
  useEffectPR(() => {
    if (!cur) return; // guard dentro del callback: no actuar si no hay camino activo
    function handleKey(e) {
      if (e.key !== 'Escape') return;
      var active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
      if (confirmExit) { setConfirmExit(false); return; }
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
  }, [confirmExit, cur ? cur.stepIndex : null]);

  /* Nada que mostrar: home visible */
  if (!cur && !justCompleted) return null;

  /* Pantalla de completado */
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
        />
      </div>
    );
  }

  const path = getPath(cur.id);
  if (!path) return null;

  const step = path.steps[cur.stepIndex];
  const totalSteps = path.steps.length;

  /* Callback que reciben los subcomponentes de paso */
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
    }
    advancePathStep(reason);
  };

  /* Boton de salida: si el paso es opcional, salir directo; si no, confirmar */
  const handleRequestExit = () => {
    if (step.optional) {
      abandonPath();
    } else {
      setConfirmExit(true);
    }
  };

  return (
    <div
      className="path-runner-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={cur ? cur.id.replace('path.', '') : ''}
    >
      <PathTopBar
        pathName={cur.id.replace('path.', '')}
        stepIndex={cur.stepIndex}
        totalSteps={totalSteps}
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
          <PathHydrateStep
            onDone={() => handleStepExit('done')}
            onSkip={() => handleStepExit('skip')}
          />
        )}
      </div>

      <ExitConfirmModal
        open={confirmExit}
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => { abandonPath(); setConfirmExit(false); }}
      />
    </div>
  );
}

Object.assign(window, { PathRunner });
