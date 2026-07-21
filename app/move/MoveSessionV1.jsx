/* PACE · Runner del contrato de pasos v1 (B2.2 · s110)
   =====================================================
   Runner por MODO para las rutinas que estrenan el contrato. Comparte cáscara
   (SessionShell/SessionPrep/SessionDone), glifo (StepGlyph) y acento por kind
   con el runner legacy; lo que cambia es la máquina de fases.

   Resuelve los hallazgos R1-R5 de la auditoría B2.1, activados por `mode`.
   s113 (runner guiado) aplica las ENMIENDAS de DECISIONES_PRODUCTO §B2 a
   R2/R3 — principio rector: «el usuario toca para empezar, pausar o adaptar;
   NO para empujar la rutina hacia delante»:
     R1  placement gate POR PASO — el timer no arranca mientras se lee la
         colocación. `setup:'ready'` (s112) sigue siendo el ÚNICO gate manual
         (colocación compleja suelo/pared/material).
     R2  (enmendado s113) `reps` = GUIADAS con cadencia (~4 s/rep de fuerza,
         `repSeconds` por paso): pulso visual + tick suave + contador
         «n de N», avance AUTO al objetivo. No es cuenta atrás competitiva:
         «Terminar antes» siempre visible y solo se acreditan las reps
         realmente guiadas (repsGuidedRef), nunca el objetivo.
     R3  (enmendado s113) `perSide` = lado 1 → señal suave → transición AUTO
         (10 s, con el lado siguiente visible) → lado 2 empieza solo.
         «Empezar ya» / «Más tiempo» / «Pausar» quedan opcionales.
     R4  la completion acredita minutos REALES (dispatchComplete), no
         `routine.min` declarado.
     R5  `rest` es un tipo propio, apagado; termina solo, «Saltar» opcional.

   Modos: 'timed' | 'reps' | 'perSide' | 'rest'. Un step sin `mode` no llega
   aquí (el dispatcher de MoveModule lo manda al runner legacy).

   Consume globales (StepGlyph, SessionShell*, complete*Session, playSound,
   useT) por window/scope global — carga tras MoveModule. Las constantes del
   método (V1_*_SECONDS) y los helpers de cadencia/progreso/tamaño viven en
   MoveSessionV1.support.jsx (s113, patrón FocusTimer.support). */

const { useState: useStateV1, useEffect: useEffectV1, useRef: useRefV1 } = React;

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
  const [prepCount, setPrepCount] = useStateV1(5); // s113: prep 5 s (antes 3)
  const [stepIdx, setStepIdx] = useStateV1(0);
  const [phase, setPhase] = useStateV1('place');   // 'place' | 'work' | 'change'
  const [side, setSide] = useStateV1(0);           // 0 = 1er lado, 1 = 2º lado
  const [elapsed, setElapsed] = useStateV1(0);
  const [paused, setPaused] = useStateV1(false);
  const [placeLeft, setPlaceLeft] = useStateV1(0);  // cuenta-atrás de colocación
  const [changeLeft, setChangeLeft] = useStateV1(0); // transición auto de lado (s113)
  const sessionStart = useRefV1(Date.now());
  // Reps realmente guiadas en la sesión (enmienda R2): registro honesto que
  // consumirá la pantalla final de s114 — nunca se acredita el objetivo.
  const repsGuidedRef = useRefV1(0);
  const step = routine.steps[stepIdx];

  const dispatchComplete = () => {
    const realMin = Math.max(1, Math.round((Date.now() - sessionStart.current) / 60000));
    if (kind === 'extra') completeExtraSession(routine.id, realMin);
    else completeMoveSession(routine.id, realMin);
  };

  const startStep = (idx) => {
    const st = routine.steps[idx];
    setStepIdx(idx); setElapsed(0); setSide(0);
    // Gate de colocación (s111/s112), cuatro entradas:
    //   ready — declarado por paso (`setup:'ready'`, suelo/pared): espera al
    //           usuario SIN cuenta, en cualquier mode e incluso en el paso 0.
    //   auto  — derivado del mode (s111): pasos CON reloj (timed/perSide) e
    //           idx>0 → cuenta-atrás que fluye sola (efecto abajo).
    //   reps  — (s114) el primer set de fuerza (reps con `placeCue` y NO
    //           precedido por un rest) gana una colocación AUTO: ventana para
    //           leer el setup y ponerse en posición antes de que arranque el
    //           pacer. Los sets 2/3 vienen tras un rest (que ya recoloca y
    //           guía qué viene) → directo a work, sin doble espera.
    //   none  — resto de reps/rest y paso 0 sin placeCue → directo a work.
    // El gate nunca es el timer del ejercicio: R1 intacto.
    const clocked = st.mode === 'timed' || st.mode === 'perSide';
    const prev = idx > 0 ? routine.steps[idx - 1] : null;
    const afterRest = !!(prev && prev.mode === 'rest');
    if (st.setup === 'ready') { setPhase('place'); setPlaceLeft(0); }
    else if (clocked && idx > 0) { setPhase('place'); setPlaceLeft(typeof st.setup === 'number' ? st.setup : V1_PLACE_SECONDS); }
    else if (st.mode === 'reps' && st.placeCue && !afterRest) { setPhase('place'); setPlaceLeft(V1_PLACE_SECONDS); }
    else setPhase('work');
  };
  const advanceStep = () => {
    if (stepIdx + 1 >= routine.steps.length) { dispatchComplete(); setStage('done'); }
    else startStep(stepIdx + 1);
  };
  const beginWork = () => { setPhase('work'); setElapsed(0); };
  const addPlaceTime = () => setPlaceLeft(c => c + 5);   // «Más tiempo» en colocación
  const addChangeTime = () => setChangeLeft(c => c + 5); // «Más tiempo» en transición
  const onSideReady = () => { setSide(1); setPhase('work'); setElapsed(0); };
  // Entrada a la transición de lado (s113, enmienda R3): señal suave de la
  // familia actual + cuenta que fluye sola (efecto abajo).
  const enterChange = () => {
    setPhase('change'); setElapsed(0); setChangeLeft(V1_CHANGE_SECONDS);
    // s114: señal propia de «cambio de lado» (familia move, distinguible del
    // avance de paso `move.step`). Silencio si soundOn está apagado.
    try { playSound('move.side'); } catch (e) {}
  };
  // Salida anticipada de reps guiadas: acredita solo las reps ya guiadas.
  const finishRepsEarly = () => {
    repsGuidedRef.current += Math.min(v1RepTarget(step), Math.floor(elapsed / v1RepSeconds(step)));
    advanceStep();
  };

  // Preparación 3-2-1 → primer paso (fase 'place', sin timer aún).
  useEffectV1(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) { sessionStart.current = Date.now(); setStage('run'); startStep(0); return; }
    const to = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(to);
  }, [stage, prepCount, paused]);

  // Relojes por fase — patrón s113: los intervalos SOLO decrementan/incrementan
  // su contador; los umbrales y side-effects (sonidos, avance, completion)
  // viven en efectos aparte. Un updater de setState corre DURANTE el render:
  // disparar ahí la completion (estado global → Sidebar) provocaba el warning
  // «Cannot update a component while rendering» (pre-existía desde s110; el
  // motor guiado lo hacía constante al auto-avanzar).

  // Colocación AUTO (s111): aire para colocarse, no es el timer (R1).
  // «Empezar ya» salta; «Más tiempo» suma 5 s. En 'ready' NO corre (s112).
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'place') return;
    if (step && step.setup === 'ready') return;
    const intv = setInterval(() => setPlaceLeft(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(intv);
  }, [stage, phase, stepIdx]);
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'place' || placeLeft > 0) return;
    if (step && step.setup === 'ready') return;
    beginWork();
  }, [placeLeft]);

  // Ticker de trabajo (fase 'work', pausable). s113: las reps GUIADAS también
  // corren — el tiempo marca la cadencia (enmienda R2).
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'work' || paused) return;
    const intv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(intv);
  }, [stage, phase, paused, stepIdx, side]);
  // Umbrales del trabajo: tick suave por rep + avance AUTO al objetivo (reps,
  // acreditando solo las guiadas reales) · fin de segmento → cambio de lado
  // (perSide lado 0) o siguiente paso. Deps [elapsed]: exactamente una
  // evaluación por segundo de trabajo; las transiciones resetean elapsed a 0
  // (guardado) así que no re-disparan.
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'work' || elapsed === 0) return;
    if (step.mode === 'reps') {
      const repSec = v1RepSeconds(step);
      if (elapsed >= v1RepTarget(step) * repSec) {
        repsGuidedRef.current += v1RepTarget(step);
        advanceStep();
      } else if (elapsed % repSec === 0) {
        try { playSound('tick'); } catch (e) {}
      }
      return;
    }
    const effDur = v1StepDur(step);
    // s114 · aviso sonoro ÚNICO al cruzar los últimos ~5 s (decisión 2A):
    // descansos + pasos con reloj (timed/perSide). Una sola señal en el
    // umbral, NO una cuenta atrás sonora; el tick de reps es aparte y más
    // suave. Silencio total si soundOn está apagado (playSound lo respeta).
    if (effDur > 6 && elapsed === effDur - 5) { try { playSound('move.warn'); } catch (e) {} }
    if (elapsed >= effDur) {
      if (step.mode === 'perSide' && side === 0) enterChange();
      else advanceStep();
    }
  }, [elapsed]);

  // Transición AUTO de lado (s113, enmienda R3): cuenta que fluye sola con el
  // lado siguiente visible. Al llegar a 0 → el lado 2 empieza solo.
  // «Empezar ya» salta, «Más tiempo» +5 s, «Pausar» disponible — opcionales.
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'change' || paused) return;
    const intv = setInterval(() => setChangeLeft(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(intv);
  }, [stage, phase, paused, stepIdx]);
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'change' || changeLeft > 0) return;
    onSideReady();
  }, [changeLeft]);

  // Sonidos
  useEffectV1(() => { if (stage === 'run') { try { playSound('move.start'); } catch(e) {} }
                      if (stage === 'done') { try { playSound('move.end'); } catch(e) {} } }, [stage]);

  // Toasts de logro APLAZADOS durante la sesión (s112, regla s105): la
  // completion dispara logros que se apilaban sobre la ceremonia de cierre.
  // Reutiliza el flag de Camino; dentro de un Camino lo gobierna PathRunner.
  useEffectV1(() => {
    if (inPath || typeof setCaminoUiActive !== 'function') return;
    setCaminoUiActive(true);
    return () => setCaminoUiActive(false);
  }, []);
  useEffectV1(() => { if (stage === 'run') { try { playSound('move.step'); } catch(e) {} } }, [stepIdx]);

  // Atajos. s113: Espacio pausa también reps guiadas y la transición de lado
  // (el descanso sigue sin pausa: termina solo, «Saltar» opcional).
  useEffectV1(() => {
    const onKey = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        if ((phase === 'work' && step && step.mode !== 'rest') || phase === 'change') setPaused(p => !p);
      }
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
    // s114 · pantalla final por MÓDULO (resuelve el P3 antidoteDone universal):
    // Mueve → «Movimiento completado» · Estira → «Estiramiento completado».
    // Stats HONESTAS: tiempo siempre; en rutinas de fuerza, series (nº de sets
    // de reps) + reps GUIADAS reales (repsGuidedRef — jamás el objetivo); en
    // mixtas, pasos (ejercicios sin descansos) + reps; en movilidad, pasos.
    // Sin calorías, récords ni comparaciones.
    const exerciseSteps = routine.steps.filter(s => s.mode !== 'rest').length;
    const repsSteps = routine.steps.filter(s => s.mode === 'reps').length;
    const guided = repsGuidedRef.current;
    const stats = [{ label: t('common.time'), value: `${mins}:${String(secs).padStart(2, '0')}` }];
    if (repsSteps > 0 && repsSteps === exerciseSteps) {
      stats.push({ label: t('move.series'), value: String(repsSteps) });
      stats.push({ label: t('move.repsCount'), value: String(guided) });
    } else if (repsSteps > 0) {
      stats.push({ label: t('move.steps'), value: String(exerciseSteps) });
      stats.push({ label: t('move.repsCount'), value: String(guided) });
    } else {
      stats.push({ label: t('move.steps'), value: String(exerciseSteps) });
    }
    const doneMeta = kind === 'extra' ? t('session.stretchDone') : t('session.moveDone');
    return (
      <SessionDone
        routine={displayRoutine} onExit={onExit} accent={accent} accentSoft={accentSoft}
        doneMeta={doneMeta} doneCopy={t('move.doneCopy')}
        stats={stats}
        buttonStyle={{ background: accent, borderColor: accent }}
        doneButtonLabel={inPath ? t('session.next') : undefined}
        atmosphere={atmo}
      />
    );
  }

  // ---- RUN: contenido central por fase/modo ----
  // s112 · jerarquía B: contexto secundario SOLO en el header (Meta) — el
  // kicker del cuerpo se reserva a información propia del momento (colócate /
  // lado / cambio). El copy funcional del método (objetivo suave, lado
  // siguiente, colocación) vive VISIBLE en el contenido (support), nunca en el
  // hint del shell (oculto en móvil ≤640px, solo atajos de teclado).
  const isRest = step.mode === 'rest';
  const stepAccent = isRest ? 'var(--ink-3)' : accent;         // R5: descanso apagado
  const stepAccentSoft = isRest ? 'var(--paper-3)' : accentSoft;
  // s114: el descanso entre series toma su duración del preset de Ajustes
  // (v1StepDur → restBetweenSets); el resto de pasos usan su `dur`.
  const remaining = Math.max(0, v1StepDur(step) - elapsed);
  const placeReady = step.setup === 'ready';

  // Visual instructivo: escala por ALTURA de viewport — el glifo deja de ser
  // insignia; en poca altura cede antes que instrucciones/controles (s113).
  // El default 72 del legacy no cambia.
  const vpH = (typeof window !== 'undefined' && window.innerHeight) || 800;
  const glyphSize = v1GlyphSize(vpH);

  let bigNumber, bigLabel, kicker, primary, support, supportStrong;
  let gateNumber = false;   // place/change: número pequeño, no es el timer
  let repPulseSec = 0;      // reps guiadas: duración del pulso de cadencia
  if (phase === 'place') {
    kicker = t('session.place');
    if (!placeReady) { bigNumber = String(placeLeft); bigLabel = t('session.placeCountdown'); gateNumber = true; }
    if (step.mode === 'perSide') supportStrong = tn('session.sideFirst', { side: t('session.sideLeft') });
    support = placeReady ? t('move.placeReadyHint') : t('move.placeHint');
    primary = placeReady
      ? { label: t('session.imReady'), onClick: beginWork }
      : { label: t('session.beginNow'), onClick: beginWork };
  } else if (phase === 'change') {
    // s113: la transición fluye sola — el número es de recolocación (gate),
    // el lado siguiente queda VISIBLE y «Empezar ya» pasa a opcional.
    kicker = t('session.sideChange');
    bigNumber = String(changeLeft); bigLabel = t('session.placeCountdown'); gateNumber = true;
    supportStrong = tn('session.sideNext', { side: t('session.sideRight') });
    support = t('move.sideAutoHint');
    primary = { label: t('session.beginNow'), onClick: onSideReady };
  } else if (step.mode === 'reps') {
    // s113: reps guiadas — contador «n de N» con pulso de cadencia; avance
    // auto al objetivo; «Terminar antes» siempre visible (enmienda R2).
    const repSec = v1RepSeconds(step);
    repPulseSec = repSec;
    bigNumber = String(Math.min(v1RepTarget(step), Math.floor(elapsed / repSec) + 1));
    bigLabel = tn('move.repsOf', { n: v1RepTarget(step) });
    // s114: el hint genérico del pulso cede el sitio a la capa «Cuídate»
    // (careCue, específica del ejercicio y siempre visible, abajo).
    primary = { label: t('move.finishEarly'), onClick: finishRepsEarly };
  } else {
    // timed / perSide / rest — cronometrado
    bigNumber = String(remaining).padStart(2, '0'); bigLabel = t('session.seconds');
    // s114: el lado ya NO es un kicker suelto — se INTEGRA en el cue de
    // trabajo (abajo). El kicker del cuerpo queda solo para place/change.
    kicker = null;
    if (isRest && routine.steps[stepIdx + 1]) {
      // s114: el descanso GUÍA — anuncia la serie que viene y avisa en los
      // últimos ~5 s (el aviso sonoro corre en paralelo, decisión 2A). El
      // cierre respiratorio (sin paso siguiente) no muestra nada de esto.
      supportStrong = tn('move.restNext', { name: tStep(stepIdx + 1, 'name') });
      if (remaining > 0 && remaining <= 5) support = t('move.restReady');
    }
    primary = isRest
      ? { label: t('session.skip'), onClick: advanceStep }
      : { label: stepIdx + 1 >= routine.steps.length && !(step.mode === 'perSide' && side === 0) ? t('move.finish') : t('move.next'), onClick: () => {
          if (step.mode === 'perSide' && side === 0) { enterChange(); } else advanceStep();
        } };
  }

  // s114 · capa editorial — la instrucción es POR FASE:
  //   colocación → placeCue (setup completo) · ejecución → cue (shortCue).
  // El lado (perSide) se INTEGRA en el texto de trabajo (palabra del lado como
  // apertura, no un kicker suelto). «Cuídate» (careCue) va como línea
  // secundaria SIEMPRE visible bajo el cue de trabajo (decisión s114-A: en
  // altura baja se oculta el rótulo, nunca el contenido).
  const inWork = phase === 'work';
  const stepPlaceCue = tStep(stepIdx, 'placeCue');
  const cueText = (phase === 'place' && stepPlaceCue) ? stepPlaceCue : tStep(stepIdx, 'cue');
  const careText = (inWork && !isRest) ? tStep(stepIdx, 'careCue') : undefined;
  const sideLead = (inWork && step.mode === 'perSide')
    ? t(side === 0 ? 'session.sideLeft' : 'session.sideRight')
    : null;

  // s113: pausable todo lo que corre solo salvo el descanso (termina solo).
  const canPause = (phase === 'work' && !isRest) || phase === 'change';
  const footer = (
    <React.Fragment>
      {phase !== 'change' && (
        <button onClick={() => { if (stepIdx > 0) startStep(stepIdx - 1); }} disabled={stepIdx === 0} style={sessionShellStyles.ctrlBtn}>
          {t('move.prev')}
        </button>
      )}
      {((phase === 'place' && !placeReady) || phase === 'change') && (
        <button onClick={phase === 'change' ? addChangeTime : addPlaceTime} style={sessionShellStyles.ctrlBtn}>
          {t('session.moreTime')}
        </button>
      )}
      {canPause && (
        <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn}>
          {paused ? t('session.resume') : t('session.pause')}
        </button>
      )}
      {/* s112: UNA acción primaria con peso real (rellena); las secundarias
          quedan outline — «Saltar»/«Anterior» no compiten con «Terminé». */}
      <button onClick={primary.onClick} style={{
        ...sessionShellStyles.ctrlBtn,
        background: stepAccent, borderColor: stepAccent,
        color: 'var(--paper)', fontWeight: 500,
      }}>
        {primary.label}
      </button>
    </React.Fragment>
  );

  return (
    <SessionShell
      routine={displayRoutine} onExit={onExit} atmosphere={atmo}
      headerExtra={<Meta>{tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}</Meta>}
      footer={footer} hint={t('session.hint')}
    >
      <div style={{ textAlign: 'center', maxWidth: 620 }}>
        {!isRest && (
          <div data-pace-v1-glyph>
            <StepGlyph stepName={step.name} accent={stepAccent} accentSoft={stepAccentSoft} size={glyphSize} />
          </div>
        )}
        {kicker && (
          <div data-pace-v1-kicker style={{ fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: stepAccent, marginBottom: 12, fontWeight: 500 }}>
            {kicker}
          </div>
        )}
        <h1 data-pace-v1-name style={{ ...displayItalic, fontSize: 'clamp(30px, 6.5vh, 52px)', fontWeight: 500, lineHeight: 1.05, margin: '0 0 14px' }}>
          {tStep(stepIdx, 'name')}
        </h1>
        <p data-pace-v1-cue style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 460, margin: '0 auto 18px' }}>
          {sideLead && (
            <strong style={{ color: stepAccent, fontWeight: 600 }}>{sideLead}. </strong>
          )}
          {cueText}
        </p>

        {/* s112: el número del GATE no es el timer — más pequeño y en tinta
            secundaria. s113: la transición de lado usa el mismo trato. */}
        {bigNumber != null && gateNumber && (
          <React.Fragment>
            <div style={{ ...displayItalic, fontSize: 56, fontWeight: 400, fontVariantNumeric: 'tabular-nums', color: 'var(--ink-2)', lineHeight: 1.08 }}>
              {bigNumber}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>{bigLabel}</div>
          </React.Fragment>
        )}
        {/* s113: en reps guiadas el número lleva el pulso de cadencia
            (decorativo: reduced-motion lo congela y queda el contador). */}
        {bigNumber != null && !gateNumber && (
          <React.Fragment>
            <div data-pace-move-timer style={{
              ...displayItalic, fontSize: 128, fontWeight: 400, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)', lineHeight: 1.08,
              ...(repPulseSec ? { animation: `pace-rep-pulse ${repPulseSec}s ease-in-out infinite`, animationPlayState: paused ? 'paused' : 'running' } : {}),
            }}>
              {bigNumber}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 14 }}>{bigLabel}</div>
          </React.Fragment>
        )}

        {/* s112: copy funcional VISIBLE (antes viajaba en el hint del shell,
            oculto en móvil): lado siguiente/inicial y matices del método. */}
        {supportStrong && (
          <div data-pace-v1-support-strong style={{ ...displayItalic, fontSize: 21, color: stepAccent, marginTop: 16 }}>
            {supportStrong}
          </div>
        )}
        {support && (
          <div data-pace-v1-support style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: supportStrong ? 6 : 14 }}>
            {support}
          </div>
        )}
        {/* s114 · capa «Cuídate» (adaptación): siempre visible en ejecución
            (decisión A). El rótulo puede ocultarse en altura baja
            (data-pace-v1-care-label), el contenido NUNCA. */}
        {careText && (
          <div data-pace-v1-care style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-3)', maxWidth: 440, margin: '16px auto 0' }}>
            <span data-pace-v1-care-label style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: stepAccent, fontWeight: 600 }}>{t('move.careLabel')} · </span>
            {careText}
          </div>
        )}
      </div>

      <div data-pace-v1-progress style={{ margin: '28px auto 0', width: '100%', maxWidth: 640 }}>
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
