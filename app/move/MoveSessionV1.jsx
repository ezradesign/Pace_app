/* PACE · Runner del contrato de pasos v1 (B2.2 · s110)
   =====================================================
   Runner por MODO para las rutinas que estrenan el contrato. Comparte cáscara
   (SessionShell/SessionPrep/SessionDone), glifo (StepGlyph) y acento por kind
   con el runner legacy; lo que cambia es la máquina de fases.

   Resuelve los hallazgos R1-R5 de la auditoría B2.1, activados por `mode`.
   Principio rector: «el usuario toca para empezar, pausar o adaptar; NO para
   empujar la rutina hacia delante». Con la opción A del runner guiado (elegida
   por Ez) NADA espera a un toque: el mando de tres (MoveSessionV1.mando.jsx)
   solo adelanta, retrocede o pausa. Con «Auto» apagado (Ez, 1A del 25 oct.)
   cada cuenta espera a «›» y las reps van a tu ritmo, sin cadencia.
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

function MoveSessionV1({ routine, onExit, kind = 'move', inPath, reanudar }) {
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
  /* El nombre de una rutina propia lo escribió quien la creó: no se traduce. Un ejercicio
     suelto («Ver ejercicio», state-ritmo.hacerla.jsx) se llama como su paso. */
  const displayRoutine = routine.hacerla
    ? { ...routine, name: tStep(0, 'name'), code: tR(`${routine.hacerla.rutina}.code`, routine.code) }
    : lang === 'en' && routine.id.indexOf('custom.') !== 0
    ? { ...routine, name: tR(`${routine.id}.name`, routine.name), code: tR(`${routine.id}.code`, routine.code) }
    : routine;

  /* Una rutina a medias sigue por su paso, con lo hecho (MoveSessionV1.reanudar.jsx). */
  const [rein] = useStateV1(() => cuerpoReanudacion(routine, reanudar));
  const [stage, setStage] = useStateV1('prep');    // 'prep' | 'run' | 'done'
  const [prepCount, setPrepCount] = useStateV1(V1_PREP_SECONDS); // s113: prep 5 s (antes 3)
  const [stepIdx, setStepIdx] = useStateV1(rein.step);
  const [phase, setPhase] = useStateV1('place');   // 'place' | 'work' | 'change'
  const [side, setSide] = useStateV1(0);           // 0 = 1er lado, 1 = 2º lado
  const [elapsed, setElapsed] = useStateV1(0);
  const [paused, setPaused] = useStateV1(false);
  const [placeLeft, setPlaceLeft] = useStateV1(0);  // cuenta-atrás de colocación
  const [changeLeft, setChangeLeft] = useStateV1(0); // transición auto de lado (s113)
  const sessionStart = useRefV1(rein.startedAt);   // wall-clock: incluye pausas y colocaciones
  // Reps realmente guiadas en la sesión (enmienda R2): registro honesto que
  // consumirá la pantalla final de s114 — nunca se acredita el objetivo.
  const repsGuidedRef = useRefV1(rein.reps);
  /* «Terminar antes» (§6.3 del esquema de eventos: acortar trabajo planificado) se apunta al
     cortar un paso y vale para TODA la sesión: antes solo contaba si se cortaba el último. */
  const earlyRef = useRefV1(rein.early);
  /* Los pasos de trabajo que se hicieron de verdad, para el cierre: una serie saltada no es
     una serie (auditoría del 21 oct.: una hecha y dos saltadas decía «3 series»). */
  const hechosRef = useRefV1(rein.hechos);
  const activeSecRef = useRefV1(0);   // congelado al completar, no al renderizar
  const step = routine.steps[stepIdx];
  /* «Auto» (Ez, 1A del 25 oct.): encendido, todo sigue solo, como siempre; apagado, cada cuenta
     espera a «›» al acabar y las repeticiones van a tu ritmo. `totales` es lo que dura la cuenta
     de colocarse o de cambiar de lado (con sus +15 s), para el aro del «›». */
  const [pace, setPace] = usePace();
  const auto = pace.cuerpoAuto !== false;
  const totalesRef = useRefV1({ place: 1, change: 1 });
  const esperaRef = useRefV1('');
  /* Reloj de TIEMPO ACTIVO (s170) — lo que Respira tiene desde s98 y esta
     familia no tenía: hasta ahora su único tiempo era `sessionStart`, o sea
     reloj de pared CON LAS PAUSAS DENTRO. La política de qué cuenta vive en
     `v1TrabajoActivo` (support), que es donde puede probarse sola. */
  const relojActivo = useV1ActiveClock(stage, phase, step, paused, rein.activoMs);
  /* Lo que se acredita a la semana: la sesión en marcha con sus colocaciones y
     descansos (R4), pero sin las pausas ni el rato con la página congelada. Con
     el reloj de pared, una pausa de 20 minutos eran 20 minutos de Mueve. */
  const relojSesion = useV1SessionClock(stage, paused, undefined, rein.sesionMs);
  const tiempoSecRef = useRefV1(0);    // el «Tiempo» del cierre, congelado al completar
  /* No se acredita: con menos de PACE_MINIMO_CUENTA_S (sesiones-7), `true`; sin ningún segundo
     de ejercicio (solo descansos o todo saltado), 'sinTrabajo', que el cierre explica aparte. */
  const sinContarRef = useRefV1(false);
  useCuerpoPersistencia({ routine, kind, inPath, stage, stepIdx, paused, relojSesion, relojActivo,
    reps: () => repsGuidedRef.current, startedAt: () => sessionStart.current,
    early: () => earlyRef.current, hechos: () => hechosRef.current });

  const dispatchComplete = () => {
    /* El «Tiempo» del cierre es el de la sesión sin pausas, el mismo que va a la
       semana (Ez, sesiones-8); con la pared, 20 min de pausa eran «21:35». */
    const sesionSec = relojSesion.segundos();
    const realMin = Math.max(1, Math.round(sesionSec / 60));
    tiempoSecRef.current = Math.round(sesionSec);
    /* Se LEE sin cerrar el reloj: `segundos()` ya cuenta el segmento abierto, y
       tener las dos cosas hace que se tapen entre sí (banco de mutaciones de
       s166); el efecto lo cierra al pasar a 'done'. Y se congela en un ref
       porque el 'done' se re-renderiza y `Date.now()` seguiría corriendo, como
       le pasaba al «Tiempo» del cierre: contestar «¿te ayudó?» lo movía. */
    activeSecRef.current = Math.round(relojActivo.segundos());
    sinContarRef.current = sesionSec < PACE_MINIMO_CUENTA_S || (activeSecRef.current < 1 && 'sinTrabajo');
    if (sinContarRef.current) return;   // saltar todos los pasos no es haberla hecho
    /* Un ejercicio suelto solo suma sus minutos: ni logros ni rutina hecha (Ez, 22 oct.). */
    if (routine.hacerla) { hacerlaSumarMinutos(realMin); return; }
    /* s172 · los datos del evento (dual-write) se arman en el support: el plan
       sale de `estimateDuration`, que vive alli — y aqui no cabe una linea. */
    const ev = v1EventoSesion(routine, sessionStart.current, activeSecRef.current, earlyRef.current, inPath);
    /* Solo la sesión entera gana logros (Ez): sin nada cortado y con cada paso de trabajo hecho;
       saltar un descanso no cuenta como cortar, ni un paso `opcional` (la banda, Ez, 23 oct.: 2A). */
    const entera = !earlyRef.current && routine.steps.every((paso, n) => paso.mode === 'rest' || paso.opcional || hechosRef.current[n]);
    if (kind === 'extra') completeExtraSession(routine.id, realMin, ev, entera);
    else completeMoveSession(routine.id, realMin, ev, entera);
  };

  const startStep = (idx) => {
    setStepIdx(idx); setElapsed(0); setSide(0); esperaRef.current = '';
    // Colocación: la derivación vive en v1StepSetup (support), ÚNICA fuente
    //   compartida con la duración estimada:
    //   auto → cuenta que fluye sola (efecto abajo), estimatedSeconds s; la
    //          `ready` del dato llega aquí como auto de 20 s como mínimo.
    //   none → directo a work. La cuenta nunca es el timer del ejercicio (R1).
    const su = v1StepSetup(routine, idx);
    if (su.mode === 'auto') { setPhase('place'); setPlaceLeft(su.estimatedSeconds); totalesRef.current.place = su.estimatedSeconds; }
    else setPhase('work');
  };
  const advanceStep = () => {
    if (stepIdx + 1 >= routine.steps.length) { dispatchComplete(); setStage('done'); }
    else startStep(stepIdx + 1);
  };
  const beginWork = () => { setPhase('work'); setElapsed(0); };
  const addPlaceTime = () => { totalesRef.current.place = Math.max(totalesRef.current.place, placeLeft) + V1_MAS_TIEMPO; setPlaceLeft(c => c + V1_MAS_TIEMPO); };
  const addChangeTime = () => { totalesRef.current.change = Math.max(totalesRef.current.change, changeLeft) + V1_MAS_TIEMPO; setChangeLeft(c => c + V1_MAS_TIEMPO); };
  const onSideReady = () => { setSide(1); setPhase('work'); setElapsed(0); };
  // Entrada a la transición de lado (s113, enmienda R3): señal suave de la
  // familia actual + cuenta que fluye sola (efecto abajo).
  const enterChange = () => {
    // s115: la duración de la transición sale del contrato (transition.seconds),
    // con el default s113 (10 s) si el paso no la declara.
    setPhase('change'); setElapsed(0); setChangeLeft(v1TransitionSeconds(step)); totalesRef.current.change = v1TransitionSeconds(step);
    // Dos cuencos, agudo y grave: el gesto de «giro». Silencio si soundOn está apagado.
    try { playSound('move.side'); } catch (e) {}
  };
  // Salida anticipada de reps guiadas: acredita solo las reps ya guiadas.
  const finishRepsEarly = () => {
    const hechas = Math.min(v1RepTarget(step), Math.floor(elapsed / v1RepSeconds(step)));
    repsGuidedRef.current += hechas;
    if (hechas > 0) hechosRef.current[stepIdx] = true;
    earlyRef.current = true;   // s172: «Terminar antes» ES el `early` de §6.3
    advanceStep();
  };
  // A tu ritmo (Auto apagado): «›» da las repeticiones por hechas, como el objetivo guiado.
  const terminarReps = () => {
    repsGuidedRef.current += v1RepTarget(step);
    hechosRef.current[stepIdx] = true;
    advanceStep();
  };

  // Preparación 3-2-1 → primer paso (fase 'place', sin timer aún); el de la rutina a medias, si la hay.
  const arrancar = () => { if (!rein.reanudada) sessionStart.current = Date.now(); setStage('run'); startStep(rein.step); };
  useEffectV1(() => {
    if (stage !== 'prep' || paused) return;
    if (prepCount <= 0) { arrancar(); return; }
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
    if (placeLeft > 0 && placeLeft <= 3) { try { playSound('move.warn'); } catch (e) {} }
  }, [placeLeft]);
  // Al llegar a 0 empieza solo; sin Auto, espera a «›», y si se enciende Auto ahí, sigue.
  useEffectV1(() => {
    if (stage === 'run' && phase === 'place' && placeLeft <= 0 && auto) beginWork();
  }, [placeLeft, auto]);

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
      if (!auto) return;   // a tu ritmo: ni cadencia ni madera; «›» las da por hechas
      const repSec = v1RepSeconds(step);
      // s115: se respeta completion.mode — sólo 'guided' auto-avanza al objetivo
      // ('manual' reservado, sin piloto: quedaría en «Terminar antes»). El pulso
      // y la madera corren igual; los 5 pilotos son guided → comportamiento intacto.
      const guided = v1CompletionMode(step) !== 'manual';
      if (guided && elapsed >= v1RepTarget(step) * repSec) {
        repsGuidedRef.current += v1RepTarget(step);
        hechosRef.current[stepIdx] = true;
        advanceStep();
      } else if (elapsed % repSec === 0) {
        try { playSound('move.rep'); } catch (e) {}
      }
      return;
    }
    if (step.mode !== 'rest') hechosRef.current[stepIdx] = true;   // un segundo de trabajo ya es hacerlo
    const effDur = v1StepDur(step);
    // Los últimos 3 segundos de cada paso con reloj y de cada descanso suenan a madera, uno
    // por segundo, para seguir la rutina sin mirar (opción A). Silencio si soundOn está apagado.
    if (effDur > 6 && elapsed >= effDur - 3 && elapsed < effDur) { try { playSound('move.warn'); } catch (e) {} }
    if (elapsed >= effDur) {
      if (!auto) {
        // Sin Auto la cuenta se queda en 0 y suena una vez: lo que sigue lo decide «›».
        const clave = stepIdx + ':' + side;
        if (esperaRef.current !== clave) { esperaRef.current = clave; try { playSound('move.go'); } catch (e) {} }
        return;
      }
      if (step.mode === 'perSide' && side === 0) enterChange();
      else advanceStep();
    }
  }, [elapsed, auto]);

  // Transición AUTO de lado (s113, enmienda R3): cuenta que fluye sola con el
  // lado siguiente visible. Al llegar a 0 → el lado 2 empieza solo.
  // «siguiente» salta, «+15 s» suma y la pausa la para — opcionales.
  useRelojSesion(stage === 'run' && phase === 'change' && !paused, n => setChangeLeft(c => Math.max(0, c - n)), [stepIdx]);
  useEffectV1(() => {
    if (stage !== 'run' || phase !== 'change') return;
    if (changeLeft > 0 && changeLeft <= 3) { try { playSound('move.warn'); } catch (e) {} }
  }, [changeLeft]);
  useEffectV1(() => {
    if (stage === 'run' && phase === 'change' && changeLeft <= 0 && auto) onSideReady();
  }, [changeLeft, auto]);

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
      if (e.key === 'Enter' && stage === 'done' && !sessionDoneKeyBlocked(e)) onExit(sinContarRef.current ? 'skip' : 'done');
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
        onSkip={() => { setPrepCount(0); arrancar(); }}
        atmosphere={atmo}
      />
    );
  }

  // COMPLETADO
  if (stage === 'done') {
    const totalSec = tiempoSecRef.current;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    // s114 · pantalla final por MÓDULO (resuelve el P3 antidoteDone universal):
    // Mueve → «Movimiento completado» · Estira → «Estiramiento completado».
    // Stats HONESTAS (s114) — el reparto por tipo de rutina vive en el support
    // desde s170 (regla §1); el criterio no cambió.
    const stats = v1DoneStats(routine, repsGuidedRef.current,
                              `${mins}:${String(secs).padStart(2, '0')}`, t, hechosRef.current);
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
        feedback={inPath || routine.hacerla ? undefined : <SessionFeedback routineId={routine.id} kind={kind} accent={accent} />}
        sinContar={sinContarRef.current}
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
  /* Reps guiadas: lo que va de ellas (0 en la primera, 1 en la última). El número no late
     (Ez, 2A del 25 oct.): cambia de color del terracota al oliva, en CuerpoV1. */
  let repsProgreso = null;
  const repsDe = (s) => {
    const n = Math.min(v1RepTarget(s), Math.floor(elapsed / v1RepSeconds(s)) + 1);
    repsProgreso = v1RepTarget(s) > 1 ? (n - 1) / (v1RepTarget(s) - 1) : 1;
    return String(n);
  };
  if (phase === 'place') {
    kicker = t('session.place');
    bigNumber = String(placeLeft); bigLabel = t('session.placeCountdown'); gateNumber = true;
    if (step.mode === 'perSide') supportStrong = tn('session.sideFirst', { side: t('session.sideLeft') });
    support = t(auto ? 'move.placeHint' : 'move.placeHintMano');
    primary = { label: t('session.beginNow'), onClick: beginWork };
  } else if (phase === 'change') {
    // s113: la transición fluye sola — el número es de recolocación (gate),
    // el lado siguiente queda VISIBLE y «Empezar ya» pasa a opcional.
    kicker = t('session.sideChange');
    bigNumber = String(changeLeft); bigLabel = t('session.placeCountdown'); gateNumber = true;
    supportStrong = tn('session.sideNext', { side: t('session.sideRight') });
    support = t('move.sideAutoHint');
    primary = { label: t('session.beginNow'), onClick: onSideReady };
  } else if (step.opcional) {
    // Un paso con material que no tienes se salta sin cortar la sesión (Ez, 23 oct.: 2A).
    if (step.mode === 'reps' && auto) { bigNumber = repsDe(step); bigLabel = tn('move.repsOf', { n: v1RepTarget(step) }); }
    else if (step.mode === 'reps') { bigNumber = String(v1RepTarget(step)); bigLabel = t('move.repsPace'); }
    else { bigNumber = String(remaining).padStart(2, '0'); bigLabel = t('session.seconds'); }
    primary = { label: t('move.skipOptional'), onClick: advanceStep };
  } else if (step.mode === 'reps' && !auto) {
    // A tu ritmo: el número es el objetivo y «›» las da por hechas.
    bigNumber = String(v1RepTarget(step)); bigLabel = t('move.repsPace');
    primary = { label: t('move.next'), onClick: terminarReps };
  } else if (step.mode === 'reps') {
    // s113: reps guiadas — contador «n de N» a su cadencia; avance auto al objetivo;
    // «Terminar antes» siempre visible (enmienda R2). El «Cuídate» va abajo (s114).
    bigNumber = repsDe(step);
    bigLabel = tn('move.repsOf', { n: v1RepTarget(step) });
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
          // Cortar un paso con reloj también acorta el trabajo (§6.3); sin Auto y ya en 0, no.
          if (auto || remaining > 0) earlyRef.current = true;
          // Sin Auto el otro lado empieza con «›», sin la cuenta de cambio.
          if (step.mode === 'perSide' && side === 0) { if (auto) enterChange(); else onSideReady(); } else advanceStep();
        } };
  }
  /* Sin Auto, lo que está esperando a «›»: el botón se marca y la línea de abajo lo dice. */
  const espera = !auto && (phase === 'place' ? placeLeft <= 0 : phase === 'change' ? changeLeft <= 0
    : step.mode === 'reps' || remaining <= 0);
  const siguienteTexto = !espera ? null : t(phase === 'work' && step.mode === 'reps' ? 'move.tapDone' : 'move.tapGo');

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

  /* Lo que va del ejercicio, para el aro del dibujo. Colocarse y cambiar de lado no son el
     ejercicio: el aro se queda vacío y empieza a dibujarse cuando empieza el trabajo (Ez). */
  const fraccion = phase === 'place' || phase === 'change' ? 0
    : step.mode === 'reps' ? Math.min(1, elapsed / (v1RepTarget(step) * v1RepSeconds(step)))
    : (v1StepDur(step) ? elapsed / v1StepDur(step) : 0);
  /* Con Auto, el aro del «›» se llena hasta que la pantalla pasa sola. */
  const anillo = !auto ? null
    : phase === 'place' ? 1 - placeLeft / Math.max(1, totalesRef.current.place)
    : phase === 'change' ? 1 - changeLeft / Math.max(1, totalesRef.current.change)
    : fraccion;

  return (
    <SessionShell
      routine={displayRoutine} onExit={onExit} atmosphere={atmo}
      headerExtra={<Meta>{tn('move.stepCount', { current: stepIdx + 1, total: routine.steps.length })}</Meta>}
      footer={<MandoV1 accent={stepAccent} paused={paused} onPause={() => setPaused(x => !x)} anillo={anillo} espera={espera} acentoModulo={accent}
        prev={{ onClick: () => { if (stepIdx > 0) { setPaused(false); startStep(stepIdx - 1); } }, disabled: stepIdx === 0 }}
        next={{ label: primary.label, onClick: () => { setPaused(false); primary.onClick(); } }}
        textos={{ prev: t('move.prev'), pause: t('session.pause'), resume: t('session.resume') }} />}
      hint={t('session.hint')}
    >
      <CuerpoV1 routine={routine} stepIdx={stepIdx} step={step} side={side} phase={phase} elapsed={elapsed} paused={paused}
        accent={accent} stepAccent={stepAccent} stepAccentSoft={stepAccentSoft} lang={lang}
        t={t} tn={tn} tStep={tStep} tInstr={tInstr}
        kicker={kicker} cueText={cueText} sideLead={sideLead} careText={careText}
        bigNumber={bigNumber} bigLabel={bigLabel} gateNumber={gateNumber} repsProgreso={repsProgreso}
        support={support} supportStrong={supportStrong} fraccion={fraccion}
        auto={auto} onAuto={() => setPace({ cuerpoAuto: !auto })} siguienteTexto={siguienteTexto}
        onMas={phase === 'place' ? addPlaceTime : phase === 'change' ? addChangeTime : null} />
    </SessionShell>
  );
}

Object.assign(window, { MoveSessionV1 });
