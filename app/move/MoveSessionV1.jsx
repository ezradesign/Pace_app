/* PACE · Runner del contrato de pasos v1 (B2.2 · s110)
   =====================================================
   Runner por MODO para las rutinas que estrenan el contrato. Comparte cáscara
   (SessionShell/SessionPrep/SessionDone), glifo (StepGlyph) y acento por kind
   con el runner legacy; lo que cambia es la máquina de fases.

   Resuelve los hallazgos R1-R5 de la auditoría B2.1, activados por `mode`:
     R1  placement gate POR PASO — el timer no arranca mientras se lee la
         colocación (fase 'place' → «Empezar»). También absorbe el cambio de
         posición (§6): recolocarse es tiempo del usuario, sin cronómetro.
     R2  `reps` termina en «Terminé», nunca auto-avanza.
     R3  `perSide` = lado 1 → aviso de cambio (gate manual «Listo») → lado 2,
         cada lado con su propio contador.
     R4  la completion acredita minutos REALES (dispatchComplete), no
         `routine.min` declarado.
     R5  `rest` es un tipo propio, visualmente distinto del trabajo.

   Modos: 'timed' | 'reps' | 'perSide' | 'rest'. Un step sin `mode` no llega
   aquí (el dispatcher de MoveModule lo manda al runner legacy).

   Consume globales (StepGlyph, SessionShell*, complete*Session, playSound,
   useT) por window/scope global — carga tras MoveModule. */

const { useState: useStateV1, useEffect: useEffectV1, useRef: useRefV1 } = React;

/* Segundos de un segmento activo (timed/rest = dur; perSide = dur por lado). */
function v1StepProgress(step, side, elapsed) {
  if (step.mode === 'reps') return 0;                 // reps no tiene barra de tiempo
  if (step.mode === 'perSide') return (side * step.dur + elapsed) / (2 * step.dur);
  return step.dur ? elapsed / step.dur : 0;
}
/* Peso del step para la barra segmentada (estimación honesta por tipo). */
function v1StepWeight(step) {
  if (step.mode === 'reps') return (typeof step.reps === 'object' ? step.reps.target : step.reps || 8) * 4;
  if (step.mode === 'perSide') return (step.dur || 20) * 2;
  return step.dur || 20;
}

function MoveSessionV1({ routine, onExit, kind = 'move', inPath }) {
  const { t, tn, lang } = useT();
  const atmo = inPath ? (kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)') : undefined;
  const accent = kind === 'extra' ? 'var(--extra)' : 'var(--move)';
  const accentSoft = kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)';
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const tStep = (idx, field) => tR(`${routine.id}.s${idx}.${field}`, routine.steps[idx][field]);
  const displayRoutine = lang === 'en'
    ? { ...routine, name: tR(`${routine.id}.name`, routine.name), code: tR(`${routine.id}.code`, routine.code) }
    : routine;

  const [stage, setStage] = useStateV1('prep');    // 'prep' | 'run' | 'done'
  const [prepCount, setPrepCount] = useStateV1(3);
  const [stepIdx, setStepIdx] = useStateV1(0);
  const [phase, setPhase] = useStateV1('place');   // 'place' | 'work' | 'change'
  const [side, setSide] = useStateV1(0);           // 0 = 1er lado, 1 = 2º lado
  const [elapsed, setElapsed] = useStateV1(0);
  const [paused, setPaused] = useStateV1(false);
  const sessionStart = useRefV1(Date.now());
  const step = routine.steps[stepIdx];

  const dispatchComplete = () => {
    const realMin = Math.max(1, Math.round((Date.now() - sessionStart.current) / 60000));
    if (kind === 'extra') completeExtraSession(routine.id, realMin);
    else completeMoveSession(routine.id, realMin);
  };

  const startStep = (idx) => {
    const st = routine.steps[idx];
    setStepIdx(idx); setElapsed(0); setSide(0);
    setPhase(st.mode === 'rest' ? 'work' : 'place'); // rest arranca ya; el resto tras colocarse
  };
  const advanceStep = () => {
    if (stepIdx + 1 >= routine.steps.length) { dispatchComplete(); setStage('done'); }
    else startStep(stepIdx + 1);
  };
  const beginWork = () => { setPhase('work'); setElapsed(0); };
  const onSideReady = () => { setSide(1); setPhase('work'); setElapsed(0); };

  // Preparación 3-2-1 → primer paso (fase 'place', sin timer aún).
  useEffectV1(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) { sessionStart.current = Date.now(); setStage('run'); startStep(0); return; }
    const to = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(to);
  }, [stage, prepCount, paused]);

  // Ticker: solo corre en fase 'work' de un segmento cronometrado
  // (timed/perSide/rest). 'reps' no corre (R2); 'place'/'change' tampoco (R1/R3).
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'work' || paused) return;
    if (step.mode === 'reps') return;
    const segDur = step.dur;
    const intv = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= segDur) {
          if (step.mode === 'perSide' && side === 0) { setPhase('change'); return 0; }
          advanceStep();
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(intv);
  }, [stage, phase, paused, stepIdx, side, step]);

  // Sonidos
  useEffectV1(() => { if (stage === 'run') { try { playSound('move.start'); } catch(e) {} }
                      if (stage === 'done') { try { playSound('move.end'); } catch(e) {} } }, [stage]);
  useEffectV1(() => { if (stage === 'run') { try { playSound('move.step'); } catch(e) {} } }, [stepIdx]);

  // Atajos
  useEffectV1(() => {
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); if (step && step.mode !== 'reps' && phase === 'work') setPaused(p => !p); }
      if (e.key === 'Escape') onExit('exit');
      if (e.key === 'Enter' && stage === 'done') onExit('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, stepIdx, phase, step]);

  // PREPARACIÓN
  if (stage === 'prep') {
    return (
      <SessionPrep
        routine={displayRoutine} onExit={onExit} accent={accent} prepCount={prepCount}
        copy={tn('move.prepCopy', { n: routine.steps.length })}
        onSkip={() => { sessionStart.current = Date.now(); setPrepCount(0); setStage('run'); startStep(0); }}
        atmosphere={atmo}
      />
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = Math.round((Date.now() - sessionStart.current) / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return (
      <SessionDone
        routine={displayRoutine} onExit={onExit} accent={accent} accentSoft={accentSoft}
        doneMeta={t('session.antidoteDone')} doneCopy={t('move.doneCopy')}
        stats={[
          { label: t('common.time'), value: `${mins}:${String(secs).padStart(2,'0')}` },
          { label: t('move.steps'),  value: String(routine.steps.length) },
        ]}
        buttonStyle={{ background: accent, borderColor: accent }}
        doneButtonLabel={inPath ? t('session.next') : undefined}
        atmosphere={atmo}
      />
    );
  }

  // ---- RUN: contenido central por fase/modo ----
  const isRest = step.mode === 'rest';
  const stepAccent = isRest ? 'var(--ink-3)' : accent;         // R5: descanso apagado
  const stepAccentSoft = isRest ? 'var(--paper-3)' : accentSoft;
  const remaining = Math.max(0, (step.dur || 0) - elapsed);
  const repsTarget = typeof step.reps === 'object' ? step.reps.target : step.reps;

  let bigNumber, bigLabel, kicker, primary, hint;
  if (phase === 'place') {
    kicker = t('session.place');
    hint = t('move.placeHint');
    primary = { label: t('session.beginStep'), onClick: beginWork };
  } else if (phase === 'change') {
    kicker = t('session.sideChange');
    hint = tn('session.sideNext', { side: t('session.sideRight') });
    primary = { label: t('session.sideReady'), onClick: onSideReady };
  } else if (step.mode === 'reps') {
    bigNumber = String(repsTarget); bigLabel = t('move.reps');
    kicker = tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length });
    hint = t('move.repsHint');
    primary = { label: stepIdx + 1 >= routine.steps.length ? t('move.finish') : t('move.repsDone'), onClick: advanceStep };
  } else {
    // timed / perSide / rest — cronometrado
    bigNumber = String(remaining).padStart(2, '0'); bigLabel = t('session.seconds');
    kicker = isRest ? t('session.restLabel')
      : step.mode === 'perSide' ? t(side === 0 ? 'session.sideLeft' : 'session.sideRight')
      : tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length });
    primary = isRest
      ? { label: t('session.skip'), onClick: advanceStep }
      : { label: stepIdx + 1 >= routine.steps.length && !(step.mode === 'perSide' && side === 0) ? t('move.finish') : t('move.next'), onClick: () => {
          if (step.mode === 'perSide' && side === 0) { setPhase('change'); setElapsed(0); } else advanceStep();
        } };
  }

  const canPause = phase === 'work' && step.mode !== 'reps' && !isRest;
  const footer = (
    <React.Fragment>
      <button onClick={() => { if (stepIdx > 0) startStep(stepIdx - 1); }} disabled={stepIdx === 0} style={sessionShellStyles.ctrlBtn}>
        {t('move.prev')}
      </button>
      {canPause && (
        <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn}>
          {paused ? t('session.resume') : t('session.pause')}
        </button>
      )}
      <button onClick={primary.onClick} style={{ ...sessionShellStyles.ctrlBtn, borderColor: stepAccent, color: 'var(--ink)' }}>
        {primary.label}
      </button>
    </React.Fragment>
  );

  return (
    <SessionShell
      routine={displayRoutine} onExit={onExit} atmosphere={atmo}
      headerExtra={<Meta>{tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}</Meta>}
      footer={footer} hint={hint || t('session.hint')}
    >
      <div style={{ textAlign: 'center', maxWidth: 620 }}>
        {!isRest && <StepGlyph stepName={step.name} accent={stepAccent} accentSoft={stepAccentSoft} />}
        <div style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: stepAccent, marginBottom: 14, fontWeight: 500 }}>
          {kicker}
        </div>
        <h1 style={{ ...displayItalic, fontSize: 56, fontWeight: 500, lineHeight: 1.05, margin: '0 0 20px' }}>
          {tStep(stepIdx, 'name')}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 460, margin: '0 auto 22px' }}>
          {tStep(stepIdx, 'cue')}
        </p>

        {bigNumber != null && (
          <React.Fragment>
            <div data-pace-move-timer style={{ ...displayItalic, fontSize: 128, fontWeight: 400, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)', lineHeight: 1.08 }}>
              {bigNumber}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 22 }}>{bigLabel}</div>
          </React.Fragment>
        )}
      </div>

      <div style={{ margin: '28px auto 0', width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 10 }}>
          {routine.steps.map((s, i) => (
            <div key={i} style={{
              flex: v1StepWeight(s),
              height: i === stepIdx ? 6 : 2,
              background: i < stepIdx ? accent : i === stepIdx ? 'var(--line)' : 'var(--paper-3)',
              borderRadius: 2, position: 'relative', overflow: 'hidden', transition: 'height 220ms',
            }}>
              {i === stepIdx && (
                <div style={{ position: 'absolute', inset: 0, width: `${v1StepProgress(step, side, elapsed) * 100}%`, background: accent, transition: 'width 1s linear' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
          {routine.steps[stepIdx + 1] ? `${t('move.next.prefix')} ${tStep(stepIdx + 1, 'name')}` : t('move.lastStep')}
        </div>
      </div>
    </SessionShell>
  );
}

Object.assign(window, { MoveSessionV1 });
