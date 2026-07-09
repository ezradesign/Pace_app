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

function BreatheSession({ routine, onExit, inPath }) {
  const [state] = usePace();
  const { t, lang } = useT();
  // Atmosfera del step (s99): tinte terracota muy sutil SOLO en Camino.
  const atmo = inPath ? 'var(--breathe-soft)' : undefined;
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
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const sessionStart = useRef(Date.now());   // totalTime: wall-clock, incluye pausas (retenido para la distincion; no se muestra hoy)
  // Reloj de TIEMPO ACTIVO (s98): acumulador timestamp-based, local al modulo.
  // Suma solo el tiempo en 'active'/'hold' SIN pausar (excluye pausas manuales;
  // el tiempo con pestana oculta cuenta, igual que useCountdown de Focus).
  // Verdad unica para: fin de sesion no-rounds, barra de progreso no-rounds y
  // el credito a stats/logros. Honra la decision s96 (timers nuevos = timestamp).
  const activeMsRef = useRef(0);      // ms activos acumulados entre pausas
  const segStartRef = useRef(null);   // inicio del segmento activo en curso, o null
  const getActiveSec = () => {
    const open = segStartRef.current != null ? Date.now() - segStartRef.current : 0;
    return (activeMsRef.current + open) / 1000;
  };

  const sequence = getSequence(routine);
  const isRounds = routine.pattern === 'rounds';

  // Segmentador del reloj de tiempo activo (s98): abre segmento cuando la
  // sesion corre ('active'|'hold' sin pausa) y lo cierra (acumulando en
  // activeMsRef) al pausar o salir de esos stages.
  useEffect(() => {
    const running = (stage === 'active' || stage === 'hold') && !paused;
    if (running) {
      if (segStartRef.current == null) segStartRef.current = Date.now();
    } else if (segStartRef.current != null) {
      activeMsRef.current += Date.now() - segStartRef.current;
      segStartRef.current = null;
    }
  }, [stage, paused]);

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
      // Fin no-rounds por TIEMPO ACTIVO (s98), no wall-clock: las pausas no
      // acercan el final; la sesion entrega los routine.min de practica real.
      if (getActiveSec() >= routine.min * 60) {
        finish();
      } else {
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
    // Credito = TIEMPO ACTIVO real (s98), no el nominal routine.min. Excluye
    // pausas y no sobre-acredita al pulsar "Finalizar" pronto. Aplica igual a
    // rounds (retenciones incluidas -> mas honesto) que a no-rounds. Minimo 1
    // min si hubo practica (las sesiones muy cortas cuentan en stats/plan).
    const activeMin = Math.max(1, Math.round(getActiveSec() / 60));
    completeBreathSession(routine.id, activeMin);
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
        onSkip={() => { setPrepCount(0); setStage('active'); playPhaseSound(sequence[0].label, sequence[0].duration); }}
        atmosphere={atmo}
      />
    );
  }

  if (stage === 'done') {
    // Tiempo mostrado = TIEMPO ACTIVO real (s98). Al entrar en 'done' el reloj
    // ya cerro su ultimo segmento, asi que getActiveSec() es el total definitivo.
    const activeSec = Math.round(getActiveSec());
    const mins = Math.floor(activeSec / 60);
    const secs = activeSec % 60;
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
        doneButtonLabel={inPath ? t('session.next') : undefined}
        atmosphere={atmo}
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
        atmosphere={atmo}
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
  // Progreso continuo 0..1. Rounds: por ronda/respiracion (ya inmune a pausas).
  // No-rounds (s98): TIEMPO ACTIVO / duracion objetivo -> mismo reloj que decide
  // el fin y el credito; las pausas no avanzan la barra. Al terminar (activo =
  // routine.min*60) llega a 1 y los segTotal segmentos quedan llenos.
  const sessionProgress = isRounds
    ? Math.min(1, ((round - 1) + Math.min(1, breathCount / routine.breaths)) / routine.rounds)
    : Math.min(1, getActiveSec() / (routine.min * 60));
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
      atmosphere={atmo}
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