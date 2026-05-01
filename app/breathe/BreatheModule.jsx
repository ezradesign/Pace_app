/* PACE · Módulo Respira
   Sesión guiada con círculo animado + teclado.
   Catálogo, biblioteca, seguridad y visual se extrajeron en sesión 33
   a archivos propios en app/breathe/. */

const { useState: useStateBR, useEffect: useEffectBR, useRef: useRefBR } = React;

/* =========================
   BREATHING SESSION
   NOTA: incluye fase de preparación (3s), retención explícita en rondas,
   countdown visible en fases largas, pantalla de completado, atajos de teclado.
   ========================= */
function BreatheSession({ routine, onExit }) {
  const [state] = usePace();
  const [stage, setStage] = useStateBR('prep'); // 'prep' | 'active' | 'hold' | 'done'
  const [prepCount, setPrepCount] = useStateBR(3);
  const [phase, setPhase] = useStateBR(0);
  const [phaseTime, setPhaseTime] = useStateBR(0);
  const [round, setRound] = useStateBR(1);
  const [breathCount, setBreathCount] = useStateBR(1);
  const [holdSeconds, setHoldSeconds] = useStateBR(0);
  const [paused, setPaused] = useStateBR(false);
  const startTime = useRefBR(Date.now());
  const sessionStart = useRefBR(Date.now());

  const sequence = window.getBreatheSequence(routine);
  const isRounds = routine.pattern === 'rounds';

  // Preparación: cuenta atrás 3 segundos
  useEffectBR(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) {
      setStage('active');
      startTime.current = Date.now();
      return;
    }
    const t = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [stage, prepCount, paused]);

  // Ticker principal (active)
  useEffectBR(() => {
    if (paused || stage !== 'active') return;
    const intv = setInterval(() => {
      setPhaseTime(t => {
        const cur = sequence[phase];
        if (t + 1 >= cur.duration) {
          handleCycleComplete();
          return 0;
        }
        setPhase(nextPhase => nextPhase);
        /* Marca de cambio de fase: tono senoidal muy suave (440 Hz,
           250 ms). Respeta state.soundOn. Sesión 28. */
        try { playSound('breath'); } catch (e) {}
        return 0;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [phase, paused, routine, stage]);

  // Ticker de retención (hold en rondas)
  useEffectBR(() => {
    if (stage !== 'hold' || paused) return;
    const intv = setInterval(() => {
      setHoldSeconds(s => {
        // Desbloqueo de logros por apnea
        if (s + 1 === 60) unlockAchievement('secret.breath.hold.60');
        if (s + 1 === 90) unlockAchievement('secret.breath.hold.90');
        if (s + 1 === 120) unlockAchievement('secret.breath.hold.120');
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [stage, paused]);

  // Atajos de teclado
  useEffectBR(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); }
      if (e.key === 'Escape') onExit('exit');
      if (e.key === 'Enter' && stage === 'hold') releaseHold();
      if (e.key === 'Enter' && stage === 'done') onExit('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage]);

  const handleCycleComplete = () => {
    if (isRounds) {
      if (breathCount < routine.breaths) {
        setBreathCount(b => b + 1);
        setPhase(0);
      } else {
        // Se completaron las N respiraciones → retención
        setStage('hold');
        setHoldSeconds(0);
      }
    } else {
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (elapsed >= routine.min * 60) {
        finish();
      } else {
        setPhase(0);
      }
    }
  };

  const releaseHold = () => {
    // Tras liberar el aire, siguiente ronda o fin
    if (round < routine.rounds) {
      setRound(r => r + 1);
      setBreathCount(1);
      setPhase(0);
      setStage('active');
    } else {
      finish();
    }
  };

  const finish = () => {
    completeBreathSession(routine.id, routine.min);
    setStage('done');
  };

  // ====== RENDER STAGES ======

  // PREPARACIÓN
  if (stage === 'prep') {
    return (
      <SessionPrep
        routine={routine}
        onExit={onExit}
        accent="var(--breathe)"
        prepCount={prepCount}
        copy="Siéntate cómodo. Respira natural."
        onSkip={() => { setPrepCount(0); setStage('active'); startTime.current = Date.now(); }}
      />
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const stats = [
      { label: 'Tiempo', value: `${mins}:${String(secs).padStart(2,'0')}` },
    ];
    if (isRounds) {
      stats.push({ label: 'Rondas', value: String(routine.rounds) });
      stats.push({ label: 'Respiraciones', value: String(routine.breaths * routine.rounds) });
    }
    return (
      <SessionDone
        routine={routine}
        onExit={onExit}
        accent="var(--breathe)"
        accentSoft="var(--breathe-soft)"
        doneMeta="Sesión completada"
        doneCopy="Bien hecho. Observa cómo te sientes antes de volver."
        stats={stats}
        buttonVariant="terracota"
      />
    );
  }

  // HOLD (retención en rondas)
  if (stage === 'hold') {
    const holdMins = Math.floor(holdSeconds / 60);
    const holdSecs = holdSeconds % 60;
    return (
      <SessionShell
        routine={routine}
        onExit={onExit}
        headerExtra={<div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--breathe)' }}>Ronda {round} / {routine.rounds}</div>}
        footer={<Button variant="terracota" onClick={releaseHold}>Respirar de nuevo</Button>}
      >
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--breathe)', marginBottom: 16, fontWeight: 500 }}>
            Retén sin aire
          </div>
          <div style={{
            ...displayItalic,
            fontSize: 160, fontWeight: 400, lineHeight: 0.9,
            color: 'var(--ink)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
          }}>
            {holdMins > 0 ? `${holdMins}:${String(holdSecs).padStart(2,'0')}` : holdSecs}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {holdMins > 0 ? 'minutos' : 'segundos'}
          </div>
          <p style={{
            ...displayItalic,
            fontSize: 18, color: 'var(--ink-2)',
            maxWidth: 360, margin: '30px auto 0', lineHeight: 1.5,
          }}>
            Pulsa cuando sientas la necesidad de respirar.
          </p>
        </div>
      </SessionShell>
    );
  }

  // ACTIVE (ciclo de respiración normal)
  const current = sequence[phase] || sequence[0];
  const progress = current.duration > 0 ? phaseTime / current.duration :0;
  const remaining = Math.max(0, current.duration - phaseTime);
  const showCountdown = current.duration >= 4;
  const totalDots = isRounds ? routine.breaths : 20;
  const activeDot = isRounds ? breathCount : Math.floor(phaseTime % totalDots);

  const footer = (
    <React.Fragment>
      <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn} title="Espacio">
        {paused ? '▶ Reanudar' : '❚❚ Pausar'}
      </button>
      <button onClick={finish} style={{ ...sessionShellStyles.ctrlBtn, borderColor: 'transparent' }} title="Esc">
        ▶| Terminar
      </button>
    </React.Fragment>
  );

  return (
    <SessionShell
      routine={routine}
      onExit={onExit}
      centerGap={true}
      footerGap={16}
      footer={footer}
      hint="Espacio pausar · Esc salir"
      headerExtra={isRounds ? (
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          Ronda {round} / {routine.rounds}
        </div>
      ) : null}
    >
      <BreathVisual
        style={state.breathStyle}
        phase={current.label}
        progress={progress}
        scale={current.scale}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          ...displayItalic,
          fontSize: 44, fontWeight: 500, color: 'var(--ink)',
          marginBottom: 8, lineHeight: 1,
        }}>{current.label}</div>
        {showCountdown && (
          <div style={{
            ...displayItalic,
            fontSize: 28, color: 'var(--breathe)',
            fontVariantNumeric: 'tabular-nums', marginTop: 4,
          }}>{remaining}</div>
        )}
        <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
          {isRounds ? `Respiración ${breathCount} de ${routine.breaths}` : `${phaseTime}s / ${current.duration}s`}
        </div>
      </div>
      <div style={{
        display: 'flex', gap: 5,
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: 400,
        margin: '0 auto',
      }}>
        {Array.from({ length: Math.min(totalDots, 30) }).map((_, i) => (
          <span key={i} style={{
            width: 4, height: 4, borderRadius: '50%',
            background: i < activeDot ? 'var(--breathe)' : 'var(--line)',
            transition: 'background 200ms',
          }} />
        ))}
      </div>
    </SessionShell>
  );
}

/* SessionHeader y Stat (antes locales aquí) se extrajeron en sesión 26
   a app/ui/SessionShell.jsx como componentes compartidos con Move.
   Ver docs/audits/audit-v0.12.7.md §3.1 (Top-1 duplicación). */

/* sessionStyles local eliminado en sesión 26. El layout de sesión vive ahora
   en app/ui/SessionShell.jsx (sessionShellStyles) y los componentes
   SessionShell / SessionPrep / SessionDone lo consumen. */

/* En sesión 33 se extrajeron:
   - BREATHE_ROUTINES → BreatheRoutines.jsx
   - BreatheLibrary + RoutineCard → BreatheLibrary.jsx
   - BreatheSafety → BreatheSafety.jsx
   - getBreatheSequence (antes getSequence) → breatheHelpers.jsx
   - BreathVisual + breathVisualStyles → BreathVisual.jsx */

Object.assign(window, { BreatheSession });
