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
     por unlockedAt >= snapshot.startedAt. Glifo del catalogo.

   s77: prop `fadeIn` opacity 0 -> 1 en 400ms al montar. PathRunner lo
   activa tras OutroCard para que el cierre simbolico no aparezca de
   golpe. Aprovecha que ambos comparten background: var(--paper). */
function CompletionScreen({ snapshot, onBack, fadeIn }) {
  const [state] = usePace();
  const { t } = useT();
  const [opacity, setOpacity] = useStatePR(fadeIn ? 0 : 1);
  useEffectPR(function () {
    if (!fadeIn) return;
    /* Doble rAF: asegura que el frame con opacity=0 se pinta antes de
       arrancar la transicion a opacity=1. Sin esto, React podria batch
       y nunca veriamos el fade-in. */
    var r1 = requestAnimationFrame(function () {
      var r2 = requestAnimationFrame(function () { setOpacity(1); });
      /* Limpieza de la segunda rAF en caso de unmount entre frames. */
      return function () { cancelAnimationFrame(r2); };
    });
    return function () { cancelAnimationFrame(r1); };
  }, [fadeIn]);
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
      opacity: opacity,
      transition: fadeIn ? 'opacity 400ms ease-out' : 'none',
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
      {totalSteps > 0 && (
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

/* PathHydrateStep - vaso de agua opcional.
   s78: redisenado para coherencia con HydrateModule del home.
     - Contador Garamond italic grande (today / goal) en color --hydrate.
     - Grid visual de `goal` vasos (no clicables; es step de Camino,
       no tracker). Refleja el estado actual de state.water.
     - Copy artesanal en italic reforzando opcionalidad.
     - Dos botones del MISMO peso visual (Saltar outline / Beber relleno);
       diferencia solo de color, no de jerarquia. Refuerza que la accion
       es de verdad opcional, no un CTA disfrazado. */
function PathHydrateStep({ onDone, onSkip }) {
  const [state] = usePace();
  const { t } = useT();
  const today = (state.water && state.water.today) || 0;
  const goal  = (state.water && state.water.goal)  || 8;
  const handleDrink = () => {
    if (typeof addWaterGlass === 'function') {
      try { addWaterGlass(1); } catch (e) {}
    }
    onDone();
  };
  const btnBase = {
    padding: '10px 28px', borderRadius: 'var(--r-sm)',
    cursor: 'pointer', fontSize: 13, letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)', fontStyle: 'italic',
  };
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 40px', textAlign: 'center',
    }}>
      {/* Contador grande, mismo lenguaje que HydrateTracker */}
      <div style={{
        fontFamily: "'EB Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 'clamp(72px, 12vw, 112px)', fontWeight: 400, lineHeight: 1,
        color: 'var(--hydrate)',
      }}>
        {today}<span style={{ color: 'var(--ink-3)', fontSize: '0.42em' }}> / {goal}</span>
      </div>
      <div style={{
        fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'var(--ink-3)', marginTop: 8, marginBottom: 22,
      }}>
        {t('path.hydrate.glasses.today') || 'Vasos hoy'}
      </div>

      {/* Vasos visuales (no interactivos: es Camino, no tracker) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(' + goal + ', 1fr)',
        gap: 6,
        maxWidth: 360, width: '100%',
        marginBottom: 26,
      }}>
        {Array.from({ length: goal }).map(function (_, i) {
          const filled = i < today;
          return (
            <div key={i} style={{
              aspectRatio: '1/1.3',
              background: filled ? 'var(--hydrate-soft)' : 'transparent',
              border: '1.5px solid ' + (filled ? 'var(--hydrate)' : 'var(--line)'),
              borderRadius: 'var(--r-sm)',
              position: 'relative', overflow: 'hidden',
            }}>
              {filled && (
                <div style={{
                  position: 'absolute', inset: 0, top: '40%',
                  background: 'var(--hydrate-soft)',
                  borderTop: '1px solid var(--hydrate)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <p style={{
        fontFamily: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic', fontSize: 18, fontWeight: 400,
        color: 'var(--ink-2)', margin: '0 0 26px', lineHeight: 1.4,
        maxWidth: 360,
      }}>
        {t('path.hydrate.copy')}
      </p>

      {/* Dos botones del mismo peso visual: diferencia de color, no de jerarquia */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onSkip}
          style={Object.assign({}, btnBase, {
            background: 'transparent',
            border: '1px solid var(--line-2)',
            color: 'var(--ink-2)',
          })}
        >
          {t('path.hydrate.skip') || t('path.runner.skip')}
        </button>
        <button
          onClick={handleDrink}
          style={Object.assign({}, btnBase, {
            background: 'var(--hydrate)',
            border: '1px solid var(--hydrate)',
            color: 'var(--paper)',
          })}
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

/* PathRunner - orquestador principal.

   s77: maquina de fases para las transiciones intra-overlay.
     'intro'      -> IntroCard al abrir el Camino (solo si recien iniciado).
     'step'       -> render del paso real (Focus/Breathe/Body/Hydrate).
     'transition' -> StepIntro entre dos pasos (cur.stepIndex ya avanzado).
     'outro'      -> OutroCard antes de CompletionScreen.

   Reglas clave (volatiles, no se persisten en paths.current):
   - Recarga durante intro/transition/outro -> phase='step' al rehidratar.
   - Step intermedio: advancePathStep AHORA, asi recarga aterriza en destino.
   - Ultimo step: NO se avanza hasta tras OutroCard (cur queda intacto). */
function PathRunner() {
  const [state] = usePace();
  const { t } = useT();
  const cur = state.paths.current;
  const [justCompleted, setJustCompleted] = useStatePR(null);
  const [confirmExit, setConfirmExit] = useStatePR(false);
  const [phase, setPhase] = useStatePR('step');
  /* pendingComplete = snapshot + reason capturados al iniciar OutroCard.
     Se aplica en handleOutroDone -> setJustCompleted + advancePathStep. */
  const [pendingComplete, setPendingComplete] = useStatePR(null);

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

  /* Pantalla de completado. fadeIn=true cuando viene tras OutroCard
     (cross-fade simbolico 400ms). Si el usuario llega aqui por otra
     via, fadeIn queda false. */
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

  /* Callback de paso: dispara intro/transition/outro segun caso.
     - Intermedio: avanza AHORA (decision 3) + phase='transition'.
     - Ultimo:     captura snapshot + phase='outro'. El advance final lo
       hace handleOutroDone tras el hold de OutroCard. */
  const handleStepExit = (reason) => {
    const isLast = cur.stepIndex >= path.steps.length - 1;
    if (isLast) {
      const skipped = reason === 'skip'
        ? [...cur.skippedSteps, cur.stepIndex]
        : cur.skippedSteps;
      setPendingComplete({
        reason: reason,
        snapshot: {
          pathId: cur.id,
          startedAt: cur.startedAt,
          skippedSteps: skipped,
        },
      });
      setPhase('outro');
    } else {
      advancePathStep(reason);
      setPhase('transition');
    }
  };

  const handleIntroDone = () => { setPhase('step'); };
  const handleTransitionDone = () => { setPhase('step'); };
  const handleOutroDone = () => {
    if (pendingComplete) {
      setJustCompleted(pendingComplete.snapshot);
      advancePathStep(pendingComplete.reason);
      setPendingComplete(null);
    }
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
              <PathHydrateStep
                onDone={() => handleStepExit('done')}
                onSkip={() => handleStepExit('skip')}
              />
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
          blocks={senderoBlocks}
          currentIndex={cur.stepIndex}
          onContinue={handleTransitionDone}
        />
      )}
      {phase === 'outro' && typeof OutroCard === 'function' && (
        <OutroCard
          pathName={displayPathName}
          blocks={senderoBlocks}
          onContinue={handleOutroDone}
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
