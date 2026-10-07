/* PACE · Runner del contrato de pasos v1 (B2.2 · s110)
   =====================================================
   Runner por MODO para las rutinas que estrenan el contrato. Comparte cáscara
   (SessionShell/SessionPrep/SessionDone), glifo (StepGlyph) y acento por kind
   con el runner legacy; lo que cambia es la máquina de fases.

   Resuelve los hallazgos R1-R5 de la auditoría B2.1, activados por `mode`.
   Principio rector: «el usuario toca para empezar, pausar o adaptar; NO para
   empujar la rutina hacia delante». Con la opción A del runner guiado (elegida
   por Ez) NADA espera a un toque: el mando de tres (MoveSessionV1.mando.jsx)
   solo adelanta, retrocede o pausa.
     R1  colocación POR PASO — el timer no arranca mientras se lee. Toda
         colocación cuenta sola; la `ready` del dato (suelo, pared, material)
         solo la alarga a 20 s como mínimo (v1StepSetup).
     R2  `reps` = GUIADAS con cadencia (~4 s/rep de fuerza, `repSeconds` por
         paso): pulso visual + madera suave + contador «n de N», avance AUTO al
         objetivo. «Terminar antes» siempre a mano y solo se acreditan las reps
         realmente guiadas (repsGuidedRef), nunca el objetivo.
     R3  `perSide` = lado 1 → dos cuencos → transición AUTO (10 s, con el lado
         siguiente visible) → lado 2 empieza solo.
     R4  la completion acredita minutos REALES (dispatchComplete), no
         `routine.min` declarado.
     R5  `rest` es un tipo propio, apagado; termina solo, «Saltar» opcional.

   Modos: 'timed' | 'reps' | 'perSide' | 'rest'. Las rutinas propias, que se
   guardan sin `mode`, llegan aquí con forma ya dada por el dispatcher de
   MoveModule (cada paso con tiempo, «Descanso» como descanso).

   Consume globales (StepGlyph, SessionShell*, complete*Session, playSound,
   useT) por window/scope global — carga tras MoveModule. Las constantes del
   método (V1_*_SECONDS) y los helpers de cadencia/progreso/tamaño viven en
   MoveSessionV1.support.jsx (s113, patrón FocusTimer.support). */

const { useState: useStateV1, useEffect: useEffectV1, useRef: useRefV1 } = React;

function MoveSessionV1({ routine, onExit, kind = 'move', inPath }) {
  const { t, tn, lang } = useT();
  // s138: atmosfera tambien fuera de Caminos (revisa s99); el color sigue
  // saliendo del kind, como en el runner legacy.
  const atmo = kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)';
  const accent = kind === 'extra' ? 'var(--extra)' : 'var(--move)';
  const accentSoft = kind === 'extra' ? 'var(--extra-soft)' : 'var(--move-soft)';
  const tR = (key, fb) => { if (lang !== 'en') return fb; const v = t(key); return v === key ? fb : v; };
  const tStep = (idx, field) => tR(v1Clave(routine, idx, field), routine.steps[idx][field]);
  // s115 (B2.2b-1): instruction {setup,action,care} — key i18n
  // `id.sN.instruction.<k>`, fallback al dato anidado. Reemplaza los campos
  // sueltos placeCue/cue/careCue de s114 (migración atómica; sin doble fuente).
  const tInstr = (idx, key) => v1Instr(tR, routine, idx, key);
  /* El nombre de una rutina propia lo escribió quien la creó: no se traduce. */
  const displayRoutine = lang === 'en' && routine.id.indexOf('custom.') !== 0
    ? { ...routine, name: tR(`${routine.id}.name`, routine.name), code: tR(`${routine.id}.code`, routine.code) }
    : routine;

  const [stage, setStage] = useStateV1('prep');    // 'prep' | 'run' | 'done'
  const [prepCount, setPrepCount] = useStateV1(V1_PREP_SECONDS); // s113: prep 5 s (antes 3)
  const [stepIdx, setStepIdx] = useStateV1(0);
  const [phase, setPhase] = useStateV1('place');   // 'place' | 'work' | 'change'
  const [side, setSide] = useStateV1(0);           // 0 = 1er lado, 1 = 2º lado
  const [elapsed, setElapsed] = useStateV1(0);
  const [paused, setPaused] = useStateV1(false);
  const [placeLeft, setPlaceLeft] = useStateV1(0);  // cuenta-atrás de colocación
  const [changeLeft, setChangeLeft] = useStateV1(0); // transición auto de lado (s113)
  const [faseTotal, setFaseTotal] = useStateV1(0);   // segundos de la colocación o del cambio de lado, para el aro
  const sessionStart = useRefV1(Date.now());   // wall-clock: incluye pausas y colocaciones
  // Reps realmente guiadas en la sesión (enmienda R2): registro honesto que
  // consumirá la pantalla final de s114 — nunca se acredita el objetivo.
  const repsGuidedRef = useRefV1(0);
  const activeSecRef = useRefV1(0);   // congelado al completar, no al renderizar
  const step = routine.steps[stepIdx];
  /* Reloj de TIEMPO ACTIVO (s170) — lo que Respira tiene desde s98 y esta
     familia no tenía: hasta ahora su único tiempo era `sessionStart`, o sea
     reloj de pared CON LAS PAUSAS DENTRO. La política de qué cuenta vive en
     `v1TrabajoActivo` (support), que es donde puede probarse sola. */
  const relojActivo = useV1ActiveClock(stage, phase, step, paused);

  const dispatchComplete = (early) => {
    const realMin = Math.max(1, Math.round((Date.now() - sessionStart.current) / 60000));
    /* Se LEE sin cerrar el reloj: `segundos()` ya cuenta el segmento abierto, y
       tener las dos cosas hace que se tapen entre sí (banco de mutaciones de
       s166); el efecto lo cierra al pasar a 'done'. Y se congela en un ref
       porque el 'done' se re-renderiza y `Date.now()` seguiría corriendo — el
       defecto que ya tiene el `totalSec` de esa pantalla y que aquí no se hereda. */
    activeSecRef.current = Math.round(relojActivo.segundos());
    /* s172 · los datos del evento (dual-write) se arman en el support: el plan
       sale de `estimateDuration`, que vive alli — y aqui no cabe una linea. */
    const ev = v1EventoSesion(routine, sessionStart.current, activeSecRef.current, early, inPath);
    if (kind === 'extra') completeExtraSession(routine.id, realMin, ev);
    else completeMoveSession(routine.id, realMin, ev);
  };

  const startStep = (idx) => {
    setStepIdx(idx); setElapsed(0); setSide(0);
    // Colocación: la derivación vive en v1StepSetup (support), ÚNICA fuente
    //   compartida con la duración estimada:
    //   auto → cuenta que fluye sola (efecto abajo), estimatedSeconds s; la
    //          `ready` del dato llega aquí como auto de 20 s como mínimo.
    //   none → directo a work. La cuenta nunca es el timer del ejercicio (R1).
    const su = v1StepSetup(routine, idx);
    if (su.mode === 'auto') { setPhase('place'); setPlaceLeft(su.estimatedSeconds); setFaseTotal(su.estimatedSeconds); }
    else setPhase('work');
  };
  const advanceStep = (early) => {
    if (stepIdx + 1 >= routine.steps.length) { dispatchComplete(early); setStage('done'); }
    else startStep(stepIdx + 1);
  };
  const beginWork = () => { setPhase('work'); setElapsed(0); };
  const addPlaceTime = () => { setPlaceLeft(c => c + V1_MAS_TIEMPO); setFaseTotal(c => c + V1_MAS_TIEMPO); };
  const addChangeTime = () => { setChangeLeft(c => c + V1_MAS_TIEMPO); setFaseTotal(c => c + V1_MAS_TIEMPO); };
  const onSideReady = () => { setSide(1); setPhase('work'); setElapsed(0); };
  // Entrada a la transición de lado (s113, enmienda R3): señal suave de la
  // familia actual + cuenta que fluye sola (efecto abajo).
  const enterChange = () => {
    // s115: la duración de la transición sale del contrato (transition.seconds),
    // con el default s113 (10 s) si el paso no la declara.
    setPhase('change'); setElapsed(0); setChangeLeft(v1TransitionSeconds(step)); setFaseTotal(v1TransitionSeconds(step));
    // Dos cuencos, agudo y grave: el gesto de «giro». Silencio si soundOn está apagado.
    try { playSound('move.side'); } catch (e) {}
  };
  // Salida anticipada de reps guiadas: acredita solo las reps ya guiadas.
  const finishRepsEarly = () => {
    repsGuidedRef.current += Math.min(v1RepTarget(step), Math.floor(elapsed / v1RepSeconds(step)));
    advanceStep(true);   // s172: «Terminar antes» ES el `early` de §6.3
  };

  // Preparación 3-2-1 → primer paso (fase 'place', sin timer aún).
  useEffectV1(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) { sessionStart.current = Date.now(); setStage('run'); startStep(0); return; }
    const to = setTimeout(() => setPrepCount(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(to);
  }, [stage, prepCount, paused]);
  // La cuenta de la preparación también suena a madera en sus 3 últimos segundos. Va aparte, con
  // [prepCount] solo: con [paused] en las dependencias sonaría otra vez al pausar y reanudar.
  useEffectV1(() => {
    if (stage === 'prep' && prepCount > 0 && prepCount <= 3) { try { playSound('move.warn'); } catch (e) {} }
  }, [prepCount]);

  // Relojes por fase — patrón s113: los intervalos SOLO decrementan/incrementan
  // su contador; los umbrales y side-effects (sonidos, avance, completion)
  // viven en efectos aparte. Un updater de setState corre DURANTE el render:
  // disparar ahí la completion (estado global → Sidebar) provocaba el warning
  // «Cannot update a component while rendering» (pre-existía desde s110; el
  // motor guiado lo hacía constante al auto-avanzar).

  // Colocación (s111): aire para colocarse, no es el timer (R1). Siempre cuenta sola y se
  // para con la pausa; «siguiente» salta y «+15 s» suma tiempo.
  // s200: los tres relojes van por MARCA de tiempo (`useRelojSesion`, support).
  useRelojSesion(stage === 'run' && phase === 'place' && !paused,
    n => setPlaceLeft(c => Math.max(0, c - n)), [stepIdx]);
  useSesionAlOcultar(stage === 'run', () => setPaused(true)); // s200: politica en SESION_AL_OCULTAR
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'place') return;
    if (placeLeft <= 0) { beginWork(); return; }
    if (placeLeft <= 3) { try { playSound('move.warn'); } catch (e) {} }
  }, [placeLeft]);

  // Ticker de trabajo (fase 'work', pausable). s113: las reps GUIADAS también
  // corren — el tiempo marca la cadencia (enmienda R2).
  useRelojSesion(stage === 'run' && phase === 'work' && !paused, n => setElapsed(e => e + n), [stepIdx, side]);
  // Umbrales del trabajo: madera suave por rep + avance AUTO al objetivo (reps,
  // acreditando solo las guiadas reales) · fin de segmento → cambio de lado
  // (perSide lado 0) o siguiente paso. Deps [elapsed]: exactamente una
  // evaluación por segundo de trabajo; las transiciones resetean elapsed a 0
  // (guardado) así que no re-disparan.
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'work' || elapsed === 0) return;
    if (step.mode === 'reps') {
      const repSec = v1RepSeconds(step);
      // s115: se respeta completion.mode — sólo 'guided' auto-avanza al objetivo
      // ('manual' reservado, sin piloto: quedaría en «Terminar antes»). El pulso
      // y la madera corren igual; los 5 pilotos son guided → comportamiento intacto.
      const guided = v1CompletionMode(step) !== 'manual';
      if (guided && elapsed >= v1RepTarget(step) * repSec) {
        repsGuidedRef.current += v1RepTarget(step);
        advanceStep();
      } else if (elapsed % repSec === 0) {
        try { playSound('move.rep'); } catch (e) {}
      }
      return;
    }
    const effDur = v1StepDur(step);
    // Los últimos 3 segundos de cada paso con reloj y de cada descanso suenan a madera, uno
    // por segundo, para seguir la rutina sin mirar (opción A). Silencio si soundOn está apagado.
    if (effDur > 6 && elapsed >= effDur - 3 && elapsed < effDur) { try { playSound('move.warn'); } catch (e) {} }
    if (elapsed >= effDur) {
      if (step.mode === 'perSide' && side === 0) enterChange();
      else advanceStep();
    }
  }, [elapsed]);

  // Transición AUTO de lado (s113, enmienda R3): cuenta que fluye sola con el
  // lado siguiente visible. Al llegar a 0 → el lado 2 empieza solo.
  // «siguiente» salta, «+15 s» suma y la pausa la para — opcionales.
  useRelojSesion(stage === 'run' && phase === 'change' && !paused, n => setChangeLeft(c => Math.max(0, c - n)), [stepIdx]);
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'change') return;
    if (changeLeft <= 0) { onSideReady(); return; }
    if (changeLeft <= 3) { try { playSound('move.warn'); } catch (e) {} }
  }, [changeLeft]);

  // Sonidos, para seguir la rutina sin mirar (opción A):
  //   · ejercicio nuevo → un cuenco al entrar en el paso, se coloque o no (grave si es descanso);
  //   · fin de la cuenta de colocarse o de cambiar de lado → «move.go», el «¡ya!»;
  //   · cambio de lado → dos cuencos, en enterChange;
  //   · las maderas de «3, 2, 1» van en cada cuenta (arriba) y la rutina acaba con tres cuencos.
  // El «¡ya!» solo suena si la fase anterior era del MISMO paso: «Anterior» desde una colocación
  // también pasa de 'place' a 'work', y ahí ya suena el cuenco del paso.
  useEffectV1(() => { if (stage === 'done') { try { playSound('move.end'); } catch(e) {} } }, [stage]);
  useEffectV1(() => {
    if (stage !== 'run' || !step) return;
    try { playSound(step.mode === 'rest' ? 'move.rest' : 'move.start'); } catch (e) {}
  }, [stage, stepIdx]);
  const faseAntes = useRefV1({ phase, stepIdx });
  useEffectV1(() => {
    const antes = faseAntes.current;
    faseAntes.current = { phase, stepIdx };
    if (stage !== 'run' || phase !== 'work' || antes.stepIdx !== stepIdx) return;
    if (antes.phase === 'place' || antes.phase === 'change') { try { playSound('move.go'); } catch (e) {} }
  }, [phase, stepIdx]);

  // Toasts de logro APLAZADOS durante la sesión (s112, regla s105): la
  // completion dispara logros que se apilaban sobre la ceremonia de cierre.
  // Reutiliza el flag de Camino; dentro de un Camino lo gobierna PathRunner.
  useEffectV1(() => {
    if (inPath || typeof setCaminoUiActive !== 'function') return;
    setCaminoUiActive(true);
    return () => setCaminoUiActive(false);
  }, []);
  // s115 · dev-check: duración declarada vs calculada (sólo dev; una vez por
  // sesión, con el preset de descanso actual) — para comparar con la ejecución
  // real medida. Invisible en prod; la promesa visible sale del helper puro.
  useEffectV1(() => { try { v1DevCheckDuration(routine, v1RestSeconds()); } catch (e) {} }, []);

  // Atajos: Espacio pausa y reanuda cualquier fase en marcha (opción A: la pausa está siempre).
  useEffectV1(() => {
    const onKey = (e) => {
      if (e.key === ' ') {
        // No robar Espacio a un control con foco (chips de feedback / CTA en
        // 'done'): que lo active nativamente en vez de hacer preventDefault (s116).
        if (sessionKeyOnControl(e)) return;
        e.preventDefault();
        if (stage === 'run') setPaused(p => !p);
      }
      if (e.key === 'Escape') onExit('exit');
      // Enter cierra el DONE, salvo que el foco esté en un control (feedback o
      // el propio CTA se activan por su onClick) o haya modificadores/IME —
      // guard P0 s116 (evita una SEGUNDA salida desde el listener global).
      if (e.key === 'Enter' && stage === 'done' && !sessionDoneKeyBlocked(e)) onExit('done');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, stepIdx, phase, step, paused]);

  // PREPARACIÓN
  if (stage === 'prep') {
    return (
      <SessionPrep
        routine={displayRoutine} onExit={onExit} accent={accent} accentSoft={accentSoft} prepCount={prepCount}
        copy={sessionPrepCopy(routine, tn)}
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
    // Stats HONESTAS (s114) — el reparto por tipo de rutina vive en el support
    // desde s170 (regla §1); el criterio no cambió.
    const stats = v1DoneStats(routine, repsGuidedRef.current,
                              `${mins}:${String(secs).padStart(2, '0')}`, t);
    const doneMeta = kind === 'extra' ? t('session.stretchDone') : t('session.moveDone');
    return (
      <SessionDone
        routine={displayRoutine} onExit={onExit} accent={accent} accentSoft={accentSoft}
        doneMeta={doneMeta} doneCopy={t('move.doneCopy')}
        stats={stats}
        rootData={{ 'data-pace-active-sec': activeSecRef.current }}
        buttonStyle={{ background: accent, borderColor: accent }}
        doneButtonLabel={inPath ? t('session.next') : undefined}
        atmosphere={atmo}
        feedback={inPath ? undefined : <SessionFeedback routineId={routine.id} kind={kind} accent={accent} />}
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
  let bigNumber, bigLabel, kicker, primary, support, supportStrong;
  let gateNumber = false;   // place/change: número pequeño, no es el timer
  let repPulseSec = 0;      // reps guiadas: duración del pulso de cadencia
  if (phase === 'place') {
    kicker = t('session.place');
    bigNumber = String(placeLeft); bigLabel = t('session.placeCountdown'); gateNumber = true;
    if (step.mode === 'perSide') supportStrong = tn('session.sideFirst', { side: t('session.sideLeft') });
    support = t('move.placeHint');
    primary = { label: t('session.beginNow'), onClick: beginWork };
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
    // (instruction.care, específica del ejercicio y siempre visible, abajo).
    primary = { label: t('move.finishEarly'), onClick: finishRepsEarly };
  } else {
    // timed / perSide / rest — cronometrado
    bigNumber = String(remaining).padStart(2, '0'); bigLabel = t('session.seconds');
    // s114: el lado ya NO es un kicker suelto — se INTEGRA en el cue de
    // trabajo (abajo). El kicker del cuerpo queda solo para place/change.
    kicker = null;
    if (isRest && routine.steps[stepIdx + 1]) {
      // El descanso GUÍA: anuncia la serie que viene y avisa en los últimos 3 s, los mismos de
      // las maderas, para que lo que se lee y lo que se oye digan lo mismo a la vez. El cierre
      // respiratorio (sin paso siguiente) no muestra nada de esto.
      supportStrong = tn('move.restNext', { name: tStep(stepIdx + 1, 'name') });
      if (remaining > 0 && remaining <= 3) support = t('move.restReady');
    }
    primary = isRest
      ? { label: t('session.skip'), onClick: advanceStep }
      : { label: stepIdx + 1 >= routine.steps.length && !(step.mode === 'perSide' && side === 0) ? t('move.finish') : t('move.next'), onClick: () => {
          if (step.mode === 'perSide' && side === 0) { enterChange(); } else advanceStep();
        } };
  }

  // s114 · capa editorial — la instrucción es POR FASE (s115: `instruction.*`):
  //   colocación → instruction.setup · ejecución → instruction.action (shortCue).
  // El lado (perSide) se INTEGRA en el texto de trabajo (palabra del lado como
  // apertura, no un kicker suelto). «Cuídate» (instruction.care) va como línea
  // secundaria SIEMPRE visible bajo el cue de trabajo (decisión s114-A: en
  // altura baja se oculta el rótulo, nunca el contenido).
  const inWork = phase === 'work';
  const stepSetupCue = tInstr(stepIdx, 'setup');
  const cueText = (phase === 'place' && stepSetupCue) ? stepSetupCue : tInstr(stepIdx, 'action');
  const careText = (inWork && !isRest) ? tInstr(stepIdx, 'care') : undefined;
  const sideLead = (inWork && step.mode === 'perSide')
    ? t(side === 0 ? 'session.sideLeft' : 'session.sideRight')
    : null;

  /* Lo que va del paso o de la fase en curso, para el aro del dibujo. */
  const fraccion = phase === 'place' || phase === 'change'
    ? (faseTotal ? 1 - (phase === 'place' ? placeLeft : changeLeft) / faseTotal : 0)
    : step.mode === 'reps' ? Math.min(1, elapsed / (v1RepTarget(step) * v1RepSeconds(step)))
    : (v1StepDur(step) ? elapsed / v1StepDur(step) : 0);

  return (
    <SessionShell
      routine={displayRoutine} onExit={onExit} atmosphere={atmo}
      headerExtra={<Meta>{tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}</Meta>}
      footer={<MandoV1 accent={stepAccent} paused={paused} onPause={() => setPaused(x => !x)}
        prev={{ onClick: () => { if (stepIdx > 0) { setPaused(false); startStep(stepIdx - 1); } }, disabled: stepIdx === 0 }}
        next={{ label: primary.label, onClick: () => { setPaused(false); primary.onClick(); } }}
        textos={{ prev: t('move.prev'), pause: t('session.pause'), resume: t('session.resume') }} />}
      hint={t('session.hint')}
    >
      <CuerpoV1 routine={routine} stepIdx={stepIdx} step={step} side={side} phase={phase} elapsed={elapsed} paused={paused}
        accent={accent} stepAccent={stepAccent} stepAccentSoft={stepAccentSoft} lang={lang}
        t={t} tn={tn} tStep={tStep} tInstr={tInstr}
        kicker={kicker} cueText={cueText} sideLead={sideLead} careText={careText}
        bigNumber={bigNumber} bigLabel={bigLabel} gateNumber={gateNumber} repPulseSec={repPulseSec}
        support={support} supportStrong={supportStrong} fraccion={fraccion}
        onMas={phase === 'place' ? addPlaceTime : phase === 'change' ? addChangeTime : null} />
    </SessionShell>
  );
}

Object.assign(window, { MoveSessionV1 });
