/* PACE - Caminos - PathRunner overlay (sesion 50 / v0.26.0-beta)
   Monta un overlay full-screen cuando state.paths.current != null.
   Con paths.current === null y justCompleted === null devuelve null
   -> cero impacto visual en home.
*/

const { useState: useStatePR, useEffect: useEffectPR, useRef: useRefPR } = React;

/* PathTopBar - nombre del Camino + boton de salida.
   Sesion 75: dots eliminados (los reemplaza SenderoBar). */
function PathTopBar({ pathName, onRequestExit }) {
  const { t } = useT();
  return (
    <div className="path-topbar">
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 22, fontWeight: 400, color: 'var(--ink)',
        letterSpacing: '0.005em',
      }}>
        {pathName}
      </div>
      <div style={{ flex: 1 }} />
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

/* Numerales romanos (I-VII) para listar hitos en CompletionScreen.
   SenderoBar tiene su propio set local; lo duplicamos aqui para no
   exponer un helper compartido en window que aun no se reutiliza. */
const CS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/* CompletionScreen - pantalla de camino completado (s76: rica).
   - SenderoBar al 100% (todos los hitos como done).
   - Lista "Recorrido": numeral romano + nombre del kind en Garamond
     italic. Skipped en tono mas tenue.
   - Tiempo elapsed (ya calculado).
   - Logros desbloqueados DURANTE el Camino: filtra state.achievements
     por unlockedAt >= snapshot.startedAt. Glifo del catalogo. */
function CompletionScreen({ snapshot, onBack }) {
  const [state] = usePace();
  const { t } = useT();
  const path = getPath(snapshot.pathId);
  const displayName = path ? (t(path.nameKey) || snapshot.pathId) : snapshot.pathId;
  const elapsed = snapshot.startedAt
    ? Math.round((Date.now() - snapshot.startedAt) / 60000)
    : 0;

  const steps = (path && path.steps) || [];
  const totalSteps = steps.length;
  const skippedSet = new Set(snapshot.skippedSteps || []);

  const senderoBlocks = steps.map(function(s, idx) {
    return {
      id: s.kind + '-' + idx,
      name: t('paths.kind.' + s.kind + '.name') || s.kind,
    };
  });

  /* Logros desbloqueados durante este Camino. */
  const startedAt = snapshot.startedAt || 0;
  const catalog = (typeof window !== 'undefined' && window.ACHIEVEMENT_CATALOG) || [];
  const achievementsDuring = Object.keys(state.achievements || {})
    .map(function(id) {
      const v = state.achievements[id];
      if (!v || !v.unlockedAt) return null;
      if (v.unlockedAt < startedAt) return null;
      const cat = catalog.find(function(x) { return x.id === id; });
      if (!cat) return null;
      return { id, title: cat.title, glyph: cat.glyph, glyphSvg: cat.glyphSvg };
    })
    .filter(Boolean);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 40px', textAlign: 'center',
      overflowY: 'auto',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'var(--breathe-soft)', color: 'var(--breathe)',
        display: 'grid', placeItems: 'center', fontSize: 28,
        marginBottom: 20,
      }}>
        &#x2714;
      </div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 10px' }}>
        {t('path.runner.complete.title')}
      </p>
      <h2 style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic', fontSize: 36, fontWeight: 500,
        color: 'var(--ink)', margin: '0 0 8px', lineHeight: 1.2,
      }}>
        {displayName}
      </h2>
      {elapsed > 0 && (
        <p style={{ color: 'var(--ink-3)', fontSize: 13, margin: '0 0 24px' }}>
          {elapsed} min
        </p>
      )}

      {/* SenderoBar 100% done: currentIndex = totalSteps -> ningun
          hito en estado 'current', todos en 'done'. */}
      {totalSteps > 0 && typeof SenderoBar === 'function' && (
        <div style={{ width: '100%', maxWidth: 640, margin: '0 0 12px' }}>
          <SenderoBar blocks={senderoBlocks} currentIndex={totalSteps} />
        </div>
      )}

      {/* Lista discreta del recorrido */}
      {totalSteps > 0 && (
        <div style={{ margin: '4px 0 24px', maxWidth: 320, width: '100%' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginBottom: 10,
          }}>
            {t('path.runner.complete.recorrido')}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {steps.map(function(s, idx) {
              const skipped = skippedSet.has(idx);
              return (
                <li key={s.kind + '-' + idx} style={{
                  display: 'flex', alignItems: 'baseline', gap: 12,
                  padding: '4px 0',
                  opacity: skipped ? 0.45 : 1,
                  textDecoration: skipped ? 'line-through' : 'none',
                  textDecorationColor: 'var(--ink-3)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 13, color: 'var(--ink-3)',
                    minWidth: 28, textAlign: 'right',
                  }}>{CS_ROMAN[idx] || (idx + 1)}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 16, color: skipped ? 'var(--ink-3)' : 'var(--ink-2)',
                  }}>
                    {t('paths.kind.' + s.kind + '.name') || s.kind}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Logros desbloqueados durante el Camino */}
      {achievementsDuring.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, margin: '0 0 24px',
          padding: '14px 18px',
          border: '1px solid var(--achievement)',
          borderRadius: 'var(--r-md)',
          background: 'var(--achievement-soft)',
        }}>
          {achievementsDuring.map(function(a) {
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%',
                  border: '1px solid var(--achievement)',
                  display: 'grid', placeItems: 'center',
                  color: 'var(--achievement)',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 12,
                }}>
                  {a.glyphSvg
                    ? <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: a.glyphSvg }} />
                    : <span>{a.glyph}</span>
                  }
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--ink)',
                }}>{a.title}</span>
              </div>
            );
          })}
        </div>
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

/* PathFocusStep - timer simple para paso de foco.
   Sesion 75: cuando el timer llega a 0 (no por skip), suma los minutos
   completos a las estadisticas globales via addFocusMinutes, alineado
   con el flujo del Pomodoro estandar. Skip o salida no acreditan. */
function PathFocusStep({ step, onExit }) {
  const { t } = useT();
  const totalSec = (step.min || 25) * 60;
  const [remaining, setRemaining] = useStatePR(totalSec);
  const [running, setRunning] = useStatePR(false);
  const [done, setDone] = useStatePR(false);
  const intervalRef = useRefPR(null);
  const creditedRef = useRefPR(false);

  useEffectPR(() => {
    if (!running) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (!creditedRef.current && typeof addFocusMinutes === 'function') {
            try { addFocusMinutes(step.min || 25); creditedRef.current = true; } catch (e) {}
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSec > 0 ? 1 - (remaining / totalSec) : 0;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center',
    }}>
      {/* s76: TimerDial compartido con FocusTimer home. Controles del Camino
          (Iniciar/Pausar + Skip) viven fuera del dial para preservar el
          patron de salida del PathRunner. */}
      {typeof TimerDial === 'function' ? (
        <div style={{ marginBottom: 24 }}>
          <TimerDial
            mins={mins}
            secs={secs}
            progress={progress}
            mode="foco"
            modeLabel={t('topbar.mode.focus')}
            subtitle={null}
            inner={null}
          />
        </div>
      ) : (
        <div style={{
          fontFamily: "'EB Garamond', Georgia, serif",
          fontSize: 96, fontWeight: 400,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--ink)', lineHeight: 1, marginBottom: 32,
        }}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
      )}
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

  /* s76: marca body cuando hay un Camino activo (no en CompletionScreen).
     CSS en tokens.css empuja el padding-top del overlay y de SessionShell
     para dejar sitio a la SenderoBar sticky superior. */
  useEffectPR(() => {
    if (cur) {
      document.body.setAttribute('data-pace-path-active', '1');
      return () => { document.body.removeAttribute('data-pace-path-active'); };
    }
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

  const displayPathName = t(path.nameKey) || cur.id;
  const senderoBlocks = path.steps.map(function(s, idx) {
    return {
      id: s.kind + '-' + idx,
      name: t('paths.kind.' + s.kind + '.name') || s.kind,
    };
  });

  return (
    <div
      className="path-runner-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={displayPathName}
    >
      {/* s76: SenderoBar sticky fixed (z=95) -> persiste sobre
          BreatheSession/MoveSession (SessionShell z=90). */}
      {typeof SenderoBar === 'function' && (
        <SenderoBar blocks={senderoBlocks} currentIndex={cur.stepIndex} sticky />
      )}

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
