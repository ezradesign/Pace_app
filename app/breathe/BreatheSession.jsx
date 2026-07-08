/* PACE · Respiración — Sesión guiada
   Extraído de BreatheModule.jsx en sesión 34 (v0.16.0).
   Depende de BreatheVisual.jsx (BreathVisual, getSequence) que carga antes.
*/

const { useState, useEffect, useRef } = React;

const PHASE_KEYS = {
  'Inhala':           'breathe.phase.inhala',
  'Exhala':           'breathe.phase.exhala',
  'Sostén':           'breathe.phase.sosten',
  'Inhala más':       'breathe.phase.inhala.mas',
  'Inhala oceánica':  'breathe.phase.inhala.oceanica',
  'Exhala oceánica':  'breathe.phase.exhala.oceanica',
  'Inhala izq.':      'breathe.phase.inhala.izq',
  'Inhala dcha.':     'breathe.phase.inhala.dcha',
  'Exhala dcha.':     'breathe.phase.exhala.dcha',
  'Exhala izq.':      'breathe.phase.exhala.izq',
  'Respira':          'breathe.phase.respira',
  'Inhala al vientre': 'breathe.phase.inhala.vientre',
  'Exhala zumbando':  'breathe.phase.exhala.zumbando',
  'Sostén en vacío':  'breathe.phase.sosten.vacio',
};

function BreatheSession({ routine, onExit }) {
  const [state] = usePace();
  const { t, lang } = useT();
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const displayRoutine = lang === 'en'
    ? { ...routine, name: tR(`${routine.id}.name`, routine.name), code: tR(`${routine.id}.code`, routine.code) }
    : routine;
  const [stage, setStage] = useState('prep'); // 'prep' | 'active' | 'hold' | 'done'
  const [prepCount, setPrepCount] = useState(3);
  const [phase, setPhase] = useState(0);
  const [phaseTime, setPhaseTime] = useState(0);
  const [round, setRound] = useState(1);
  const [breathCount, setBreathCount] = useState(1);
  // Ciclos completados en rutinas NO-rounds (patron por fases que se repite
  // hasta agotar routine.min). Es la unidad de progreso real de estas
  // sesiones -> alimenta las bolas inferiores (s97). En rounds no se usa.
  const [cycle, setCycle] = useState(0);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const startTime = useRef(Date.now());
  const sessionStart = useRef(Date.now());

  const sequence = getSequence(routine);
  const isRounds = routine.pattern === 'rounds';

  // Helper: reproduce el sonido de una fase por su label.
  // 'Sostén' / 'Sostén en vacío' → silencio intencional.
  const playPhaseSound = (phaseLabel, phaseDur) => {
    if (phaseLabel === 'Inhala' || phaseLabel === 'Inhala más' ||
        phaseLabel === 'Inhala oceánica' || phaseLabel === 'Inhala izq.' ||
        phaseLabel === 'Inhala dcha.' || phaseLabel === 'Respira' ||
        phaseLabel === 'Inhala al vientre') {
      try { playSound('breathe.inhale', phaseDur); } catch (e) {}
    } else if (phaseLabel === 'Exhala' || phaseLabel === 'Exhala oceánica' ||
               phaseLabel === 'Exhala dcha.' || phaseLabel === 'Exhala izq.' ||
               phaseLabel === 'Exhala zumbando') {
      try { playSound('breathe.exhale', phaseDur); } catch (e) {}
    }
  };

  // Preparación: cuenta atrás 3 segundos
  useEffect(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) {
      try { playSound('breathe.session.start'); } catch (e) {}
      setStage('active');
      startTime.current = Date.now();
      // Hueco A: la fase 0 nunca tenía transición previa → su sonido nunca se disparaba.
      playPhaseSound(sequence[0].label, sequence[0].duration);
      return;
    }
    const timer = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [stage, prepCount, paused]);

  // Ticker principal (active)
  useEffect(() => {
    if (paused || stage !== 'active') return;
    const intv = setInterval(() => {
      setPhaseTime(t => {
        const cur = sequence[phase];
        if (t + 1 >= cur.duration) {
          const nextPhase = phase + 1;
          if (nextPhase >= sequence.length) {
            handleCycleComplete();
            return 0;
          }
          setPhase(nextPhase);
          const newCur = sequence[nextPhase];
          playPhaseSound(newCur.label, newCur.duration);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [phase, paused, routine, stage]);

  // Ticker de retención (hold en rondas)
  useEffect(() => {
    if (stage !== 'hold' || paused) return;
    const intv = setInterval(() => {
      setHoldSeconds(s => {
        const next = s + 1;
        if (next === 60) unlockAchievement('secret.breath.hold.60');
        if (next === 90) unlockAchievement('secret.breath.hold.90');
        if (next === 120) unlockAchievement('secret.breath.hold.120');
        return next;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [stage, paused]);

  // Drone ambiente — efecto paralelo sobre stage y paused
  useEffect(() => {
    if (!window.ambientDrone) return;
    const drone = window.ambientDrone;

    if (stage === 'done') { drone.stop(800); return; }
    if (stage === 'prep') return; // no arranca en preparación

    if (stage === 'hold') {
      // Drone sigue sonando durante hold (retención) — sin tocar
      return;
    }

    // stage === 'active'
    if (paused) {
      drone.pause();
    } else {
      if (drone.isActive()) {
        drone.resume();
      } else {
        // activar ambientOn mid-sesión no arranca el drone retroactivamente
        // — solo arranca al inicio de una sesión nueva.
        // routine.drone (Coherente 432, F4/s90): fuerza el drone aunque
        // ambientOn esté apagado; soundOn manda siempre.
        drone.start(routine.drone === true);
      }
    }
  }, [stage, paused]);

  // Stop drone si soundOn se apaga durante sesión
  useEffect(() => {
    if (!state.soundOn && window.ambientDrone && window.ambientDrone.isActive()) {
      window.ambientDrone.stop(400);
    }
  }, [state.soundOn]);

  // Cleanup: para el drone en todos los caminos de onExit (unmount)
  useEffect(() => {
    return () => { if (window.ambientDrone) window.ambientDrone.stop(800); };
  }, []);

  // Atajos de teclado
  useEffect(() => {
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
        // Hueco B: reinicio de ciclo en rondas → fase 0 nunca sonaba.
        playPhaseSound(sequence[0].label, sequence[0].duration);
      } else {
        try { playSound('breathe.session.end'); } catch (e) {}
        setStage('hold');
        setHoldSeconds(0);
      }
    } else {
      const elapsed = (Date.now() - startTime.current) / 1000;
      if (elapsed >= routine.min * 60) {
        finish();
      } else {
        setCycle(c => c + 1);   // un ciclo del patron completado (bolas s97)
        setPhase(0);
        // Hueco B: reinicio de ciclo no-rondas → fase 0 nunca sonaba.
        playPhaseSound(sequence[0].label, sequence[0].duration);
      }
    }
  };

  const releaseHold = () => {
    if (round < routine.rounds) {
      setRound(r => r + 1);
      setBreathCount(1);
      setPhase(0);
      setStage('active');
      // Nueva ronda tras hold: reproducir sonido de la fase 0 (Inhala*).
      playPhaseSound(sequence[0].label, sequence[0].duration);
    } else {
      finish();
    }
  };

  const finish = () => {
    completeBreathSession(routine.id, routine.min);
    try { playSound('breathe.session.end'); } catch (e) {}
    setStage('done');
  };

  // ====== RENDER STAGES ======

  if (stage === 'prep') {
    return (
      <SessionPrep
        routine={displayRoutine}
        onExit={onExit}
        accent="var(--breathe)"
        prepCount={prepCount}
        copy={t('breathe.prepCopy')}
        onSkip={() => { setPrepCount(0); setStage('active'); startTime.current = Date.now(); playPhaseSound(sequence[0].label, sequence[0].duration); }}
      />
    );
  }

  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const stats = [
      { label: t('common.time'), value: `${mins}:${String(secs).padStart(2,'0')}` },
    ];
    if (isRounds) {
      stats.push({ label: t('common.rounds'), value: String(routine.rounds) });
      stats.push({ label: t('common.breaths'), value: String(routine.breaths * routine.rounds) });
    }
    return (
      <SessionDone
        routine={displayRoutine}
        onExit={onExit}
        accent="var(--breathe)"
        accentSoft="var(--breathe-soft)"
        doneMeta={t('session.doneMeta')}
        doneCopy={t('breathe.doneCopy')}
        stats={stats}
        buttonVariant="terracota"
      />
    );
  }

  if (stage === 'hold') {
    const holdMins = Math.floor(holdSeconds / 60);
    const holdSecs = holdSeconds % 60;
    return (
      <SessionShell
        routine={displayRoutine}
        onExit={onExit}
        headerExtra={<div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--breathe)' }}>{t('session.round')} {round} / {routine.rounds}</div>}
        footer={<Button variant="terracota" onClick={releaseHold}>{t('session.breatheAgain')}</Button>}
      >
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--breathe)', marginBottom: 16, fontWeight: 500 }}>
            {t('session.hold')}
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
            {holdMins > 0 ? t('session.minutes') : t('session.seconds')}
          </div>
          <p style={{
            ...displayItalic,
            fontSize: 18, color: 'var(--ink-2)',
            maxWidth: 360, margin: '30px auto 0', lineHeight: 1.5,
          }}>
            {t('session.holdCue')}
          </p>
        </div>
      </SessionShell>
    );
  }

  // ACTIVE
  const current = sequence[phase] || sequence[0];
  const displayLabel = tR(PHASE_KEYS[current.label] || current.label, current.label);
  const progress = current.duration > 0 ? phaseTime / current.duration : 0;
  const remaining = Math.max(0, current.duration - phaseTime);
  const showCountdown = current.duration >= 4;
  // Progreso de la sesion (s97): BARRA SEGMENTADA por bloques de respiracion.
  // Un segmento por bloque -- rounds: una por ronda; no-rounds: una por CICLO
  // del patron (el "grupo 4·4·4·4"). El segmento activo se rellena con el
  // progreso DENTRO del bloque; los completados quedan llenos. Sintetiza "la
  // barra" + "agrupar por bloques" (feedback usuario) y usa el mismo lenguaje
  // que la barra segmentada de Mueve. Tope de 24 segmentos: en rutinas largas
  // (Coherente 6·6 = ~50 ciclos) cada segmento agrupa varios y la barra no se
  // astilla; en las cortas (Box 5min = ~19) es 1 segmento por ciclo exacto.
  const cycleSec = sequence.reduce((sum, p) => sum + p.duration, 0) || 1;
  const doneInCycle = sequence.slice(0, phase).reduce((sum, p) => sum + p.duration, 0) + phaseTime;
  // progreso continuo 0..1 de la sesion
  const sessionProgress = isRounds
    ? Math.min(1, ((round - 1) + Math.min(1, breathCount / routine.breaths)) / routine.rounds)
    : Math.min(1, (cycle + doneInCycle / cycleSec) / Math.max(1, (routine.min * 60) / cycleSec));
  const rawSegments = isRounds ? routine.rounds : Math.max(1, Math.round((routine.min * 60) / cycleSec));
  const segTotal = Math.min(rawSegments, 24);
  const filledExact = sessionProgress * segTotal;
  const segFilled = Math.floor(filledExact);
  const segActiveProgress = filledExact - segFilled;

  const footer = (
    <React.Fragment>
      <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn} title={t('session.pause')}>
        {paused ? t('session.resume') : t('session.pause')}
      </button>
      <button onClick={finish} style={{ ...sessionShellStyles.ctrlBtn, borderColor: 'transparent' }} title={t('session.finish')}>
        {t('session.finish')}
      </button>
    </React.Fragment>
  );

  return (
    <SessionShell
      routine={displayRoutine}
      onExit={onExit}
      centerGap={true}
      footerGap={16}
      footer={footer}
      hint={t('session.hint')}
      headerExtra={isRounds ? (
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {t('session.round')} {round} / {routine.rounds}
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
        }}>{displayLabel}</div>
        {showCountdown && (
          <div style={{
            ...displayItalic,
            fontSize: 28, color: 'var(--breathe)',
            fontVariantNumeric: 'tabular-nums', marginTop: 4,
          }}>{remaining}</div>
        )}
        {/* En rounds el contador de respiraciones ES el progreso de la ronda
            (util, Wim Hof). En no-rounds se retira el "Ns/Ns": era redundante
            con el numeral grande de arriba (mismo dato de fase) -> menos ruido,
            la sesion la marca la barra (s97, feedback usuario). */}
        {isRounds && (
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
            {`${t('common.breath')} ${breathCount} ${t('common.of')} ${routine.breaths}`}
          </div>
        )}
      </div>
      {/* Progreso de la SESION: barra SEGMENTADA por bloques de respiracion
          (un segmento por ciclo/ronda; el activo se llena por dentro). Ver
          calculo arriba: segTotal / segFilled / segActiveProgress. */}
      <div style={{
        display: 'flex', gap: 3, alignItems: 'center',
        width: '100%', maxWidth: 260, height: 5, margin: '0 auto',
      }}>
        {Array.from({ length: segTotal }).map((_, i) => {
          const fill = i < segFilled ? 1 : (i === segFilled ? segActiveProgress : 0);
          return (
            <div key={i} style={{
              flex: 1, height: '100%',
              borderRadius: 'var(--r-pill)',
              background: 'var(--line)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                width: `${fill * 100}%`,
                background: 'var(--breathe)',
                borderRadius: 'var(--r-pill)',
                transition: 'width 1s linear',
              }} />
            </div>
          );
        })}
      </div>
    </SessionShell>
  );
}

Object.assign(window, { BreatheSession });