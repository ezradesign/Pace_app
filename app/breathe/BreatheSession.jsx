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
  /* s138: la atmosfera deja de estar confinada a Caminos (revisa s99). El wash
     del modulo se ve tambien en la sesion suelta -- misma cascara, mismo color,
     la identidad del modulo no depende de por donde entraste. */
  const atmo = 'var(--breathe-soft)';
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
  const [paused, setPaused] = useState(false);
  const sessionStart = useRef(Date.now());   // totalTime: wall-clock, incluye pausas (retenido para la distincion; no se muestra hoy)
  // Reloj de TIEMPO ACTIVO (s98): acumulador timestamp-based, local al modulo.
  // Suma solo el tiempo en 'active'/'hold' SIN pausar (excluye pausas manuales;
  // el tiempo con pestana oculta cuenta, igual que useCountdown de Focus).
  // Verdad unica para: fin de sesion no-rounds, barra de progreso no-rounds y
  // el credito a stats/logros. Honra la decision s96 (timers nuevos = timestamp).
  const activeMsRef = useRef(0);      // ms activos acumulados entre pausas
  const segStartRef = useRef(null);   // inicio del segmento activo en curso, o null
  /* s166 · el mismo tiempo, contado APARTE cuando es retencion. No cambia lo
     que se acredita (activeMsRef ya sumaba 'hold' desde s98): saca un numero
     que ya estaba dentro de otro. Vive en BreatheSession.support.jsx por §1. */
  const relojHold = useHoldClock();
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
    /* s166: en el MISMO efecto y no en uno propio, para que los dos relojes
       abran y cierren en la misma tarea. Con dos efectos, pausar durante la
       retencion los cerraria en ordenes distintos segun el orden de montaje
       y los totales se separarian unos milisegundos por sesion. */
    relojHold.marcar(stage === 'hold' && !paused);
  }, [stage, paused]);

  /* El mapeo de etiqueta a sonido vive en `BreatheSession.support.jsx`. */

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

  /* B1 (decisión apnea): fuera el ticker de retención — sin cronómetro ni
     logros por aguantar. La retención es guía calmada con salida siempre
     visible; el tiempo activo real lo sigue sumando activeMsRef. */

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

  /* s177 · la musica de fondo, en BreatheSession.support.jsx (regla 500). */
  useMusicaFondo(stage, paused, routine);

  // Stop drone si soundOn se apaga durante sesión
  useEffect(() => {
    if (!state.soundOn && window.ambientDrone && window.ambientDrone.isActive()) {
      window.ambientDrone.stop(400);
    }
    if (!state.soundOn && window.paceMusica && window.paceMusica.isActive()) {
      window.paceMusica.stop(400);
    }
  }, [state.soundOn]);

  // Cleanup: para el drone en todos los caminos de onExit (unmount)
  useEffect(() => {
    return () => {
      if (window.ambientDrone) window.ambientDrone.stop(800);
      if (window.paceMusica) window.paceMusica.stop(800);
    };
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ') {
        // No robar Espacio a un control con foco (chips de feedback / CTA en
        // 'done'): activación nativa en vez de preventDefault (guard s116).
        if (sessionKeyOnControl(e)) return;
        e.preventDefault(); setPaused(p => !p);
      }
      if (e.key === 'Escape') onExit('exit');
      if (e.key === 'Enter' && stage === 'hold') releaseHold();
      // Enter cierra el DONE salvo foco en un control / modificadores / IME —
      // guard P0 s116 (evita una SEGUNDA salida desde el listener global).
      if (e.key === 'Enter' && stage === 'done' && !sessionDoneKeyBlocked(e)) onExit('done');
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

  const finish = (motivo) => {
    // Credito = TIEMPO ACTIVO real (s98), no el nominal routine.min. Excluye
    // pausas y no sobre-acredita al pulsar "Finalizar" pronto. Aplica igual a
    // rounds (retenciones incluidas -> mas honesto) que a no-rounds. Minimo 1
    // min si hubo practica (las sesiones muy cortas cuentan en stats/plan).
    const activeMin = Math.max(1, Math.round(getActiveSec() / 60));
    /* NO se cierra el reloj aqui, y es deliberado: `segundos()` ya cuenta el
       segmento abierto —igual que `getActiveSec()` justo arriba—, asi que
       cerrarlo antes de leer era una SEGUNDA forma de hacer lo mismo. El banco
       de mutaciones de s166 lo destapo: con las dos puestas, romper cualquiera
       de ellas dejaba los cuatro asertos en verde, o sea que no habia forma de
       saber si alguna funcionaba. Con una sola, la mutacion muerde. El efecto
       cierra el segmento al pasar a 'done', que es donde toca. */
    /* s172 · el 4o argumento son los datos del evento (dual-write); `motivo`
       separa el plan agotado ('natural') de «Finalizar» ('early', §6.3). */
    completeBreathSession(routine.id, activeMin, relojHold.segundos(),
      respiraEventoSesion(routine, sessionStart.current, getActiveSec(), motivo === 'early', inPath));
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
        feedback={inPath ? undefined : <SessionFeedback routineId={routine.id} kind="breathe" accent="var(--breathe)" />}
      />
    );
  }

  if (stage === 'hold') {
    /* B1 (decisión apnea): fuera la cifra-récord de 160 px — invitaba a
       competir contra el reloj. La retención es guía calmada: pulso visual
       suave, el cue de salida y el botón siempre visible. */
    return (
      <SessionShell
        routine={displayRoutine}
        onExit={onExit}
        atmosphere={atmo}
        headerExtra={<div data-pace-breathe-round-label style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--breathe)' }}>{t('session.round')} {round} / {routine.rounds}</div>}
        footer={<Button variant="terracota" onClick={releaseHold}>{t('session.breatheAgain')}</Button>}
      >
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <style>{`@keyframes pace-hold-pulse { from { transform: scale(0.96); opacity: 0.85; } to { transform: scale(1.05); opacity: 1; } }`}</style>
          <div style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--breathe)', marginBottom: 30, fontWeight: 500 }}>
            {t('session.hold')}
          </div>
          {/* s139 — banding: esta es LA pantalla de la captura del usuario
              («Retén sin aire», Rondas express, paleta clara, PC). Era un radial
              de DOS paradas y sin dither ⇒ ~3,5 px por banda con los 15,72
              niveles que recorre `--breathe-soft` sobre `--paper`. Rampa
              compartida de cinco paradas + capa de grano, la receta de s138.
              `position:relative` es NECESARIO: el dither va absoluto dentro. */}
          <div style={{
            position: 'relative',
            width: 140, height: 140, margin: '0 auto',
            borderRadius: '50%',
            background: paceGlowRamp('var(--breathe-soft)', 78),
            border: '1.5px solid var(--breathe)',
            animation: 'pace-hold-pulse 4s ease-in-out infinite alternate',
          }}>
            <PaceDither edge={78} />
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
  /* 5A (s165) · el hueco de la cuenta atras se reserva POR RUTINA, no por fase.
     s138 lo hizo permanente por una razon buena: en Suspiro fisiologico —2 s,
     1 s, 5 s— montarlo y desmontarlo movia TODO el texto 21 px entre fases. Esa
     razon vale DENTRO de una rutina que mezcla fases largas y cortas; en las 3
     rutinas de rondas NINGUNA fase llega a 4 s, asi que ahi el hueco reservaba
     28 px + 4 de margen para un numero que no aparece nunca (medido, s164). */
  const anyLongPhase = sequence.some(p => p.duration >= 4);
  /* 4B (s165) · BARRA CONTINUA, solo en las 17 rutinas por tiempo. La segmentada
     de s97 hablaba tres idiomas: 2 segmentos en Rondas express, 19 en Box
     (trazos de 11 px que se leen como linea de puntos) y 24 en Coherente, donde
     el tope agrupaba ~2 ciclos por segmento; y su «1 segmento por ciclo exacto»
     era aproximado (300/16 = 18,75 -> 19 de 15,79 s contra ciclos de 16 s). Aqui
     lo que corre es TIEMPO, asi que se dibuja como tiempo; los bloques de verdad
     —las rondas— los llevan los puntos. Relleno = TIEMPO ACTIVO / objetivo
     (s98): mismo reloj que decide el fin y el credito, asi que las pausas no la
     mueven. El desfase de una respiracion (D1, s164) vivia en la rama de rondas,
     que ya no usa barra. */
  const sessionProgress = Math.min(1, getActiveSec() / (routine.min * 60));

  const footer = (
    <React.Fragment>
      <button onClick={() => setPaused(p => !p)} style={sessionShellStyles.ctrlBtn} title={t('session.pause')}>
        {paused ? t('session.resume') : t('session.pause')}
      </button>
      <button onClick={() => finish('early')} style={{ ...sessionShellStyles.ctrlBtn, borderColor: 'transparent' }} title={t('session.finish')}>
        {t('session.finish')}
      </button>
    </React.Fragment>
  );

  /* s165: la cabecera de la pantalla ACTIVA ya no lleva «RONDA n / N» — no se le
     pasa `headerExtra`. Lo cuenta la barra segmentada de abajo, y decirlo dos
     veces en la misma pantalla era media redundancia de las que arrastraba s164.
     En la RETENCION si se conserva, porque alli no hay barra (decision del
     usuario) y es la unica referencia de ronda que queda. */
  return (
    <SessionShell
      routine={displayRoutine}
      onExit={onExit}
      atmosphere={atmo}
      centerGap={true}
      footerGap={16}
      footer={footer}
      hint={t('session.hint')}
    >
      <BreathVisual
        style={state.breathStyle}
        phase={current.label}
        progress={progress}
        scale={current.scale}
        phaseDuration={current.duration}
      />
      {/* s139 — `flexShrink:0` en el texto y en la barra: cuando el centro va
          justo, el déficit debe absorberlo el VISUAL (elástico por diseño) y no
          repartirse. Sin esto el reparto depende del tamaño base de cada ítem y
          del mínimo automático de contenido — funciona, pero por accidente. */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div data-pace-breathe-phase={current.label} style={{
          ...displayItalic,
          fontSize: 44, fontWeight: 500, color: 'var(--ink)',
          marginBottom: 8, lineHeight: 1,
        }}>{displayLabel}</div>
        {/* s138 — ALTURA RESERVADA (decision s119). Antes este nodo se montaba y
            desmontaba segun `showCountdown` (duracion >= 4 s), asi que en
            Suspiro fisiologico —«Inhala» 2 s, «Inhala mas» 1 s, «Exhala» 5 s—
            aparecia solo en la exhalacion. Como el bloque central va centrado
            con `margin:auto`, montarlo y desmontarlo movia TODO el texto:
            medido, 21 px de salto entre fases. Ahora el hueco existe siempre y
            solo se oculta el numero; `visibility:hidden` ademas lo saca del
            arbol de accesibilidad, asi que no se anuncia cuando no aplica.
            s165 (5A): «siempre» pasa a ser «siempre EN ESTA RUTINA» — ver
            `anyLongPhase` arriba. La razon de s138 queda intacta donde aplica. */}
        {anyLongPhase && (
          <div data-pace-breathe-countdown={showCountdown ? String(remaining) : ''} style={{
            ...displayItalic,
            fontSize: 28, color: 'var(--breathe)',
            fontVariantNumeric: 'tabular-nums', marginTop: 4,
            visibility: showCountdown ? 'visible' : 'hidden',
          }}>{showCountdown ? remaining : '0'}</div>
        )}
        {/* En rounds el contador de respiraciones ES el progreso de la ronda
            (util, Wim Hof). En no-rounds se retira el "Ns/Ns": era redundante
            con el numeral grande de arriba (mismo dato de fase) -> menos ruido,
            la sesion la marca la barra (s97, feedback usuario).
            s165: la ronda ya no se dice aqui ni en la cabecera — la cuenta la
            barra. Cada indicador con UN trabajo: la barra cuenta rondas y este
            texto cuenta respiraciones. */}
        {isRounds && (
          <div data-pace-breathe-breath={breathCount} style={{
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--ink-3)', marginTop: 14,
          }}>
            {`${t('common.breath')} ${breathCount} ${t('common.of')} ${routine.breaths}`}
          </div>
        )}
      </div>
      {/* PROGRESO DE SESION — la MISMA barra, en el mismo sitio y con la misma
          altura para las dos familias. Lo unico que cambia es si va partida, y
          eso no es decoracion: es lo que la app SABE.
          · Por TIEMPO (17 rutinas): continua. Terminan por reloj, asi que hay
            una fraccion de sesion que existe de verdad (4B).
          · Por BLOQUES (3 de rondas): un segmento por ronda. Estas NO terminan
            por reloj — la retencion no tiene duracion fijada (B1), asi que sus
            4/12/20 min son NOMINALES y una barra de tiempo aqui dibujaria una
            duracion que nadie conoce. Medido en el censo de s165.
          El segmento en curso se marca con CARRIL, no rellenandose por
          respiraciones: ese detalle lo lleva el texto de arriba. Vocabulario
          tomado de Mueve (MoveSessionV1.jsx:482), que ya marca asi su paso. */}
      <div
        data-pace-breathe-progress={isRounds
          ? ((round - 1) / routine.rounds).toFixed(4)
          : sessionProgress.toFixed(4)}
        {...(isRounds ? { 'data-pace-breathe-round': round, 'data-pace-breathe-rounds': routine.rounds } : {})}
        style={{
          flexShrink: 0, display: 'flex', gap: 4, alignItems: 'center',
          width: '100%', maxWidth: 260, height: 5, margin: '0 auto',
        }}
      >
        {isRounds ? (
          Array.from({ length: routine.rounds }).map((_, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 'var(--r-pill)',
              height: i <= round - 1 ? 5 : 2,
              background: i < round - 1 ? 'var(--breathe)'
                : (i === round - 1 ? 'var(--line)' : 'var(--paper-3)'),
              transition: 'height 220ms',
            }} />
          ))
        ) : (
          <div style={{
            flex: 1, height: '100%', position: 'relative', overflow: 'hidden',
            borderRadius: 'var(--r-pill)', background: 'var(--line)',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              width: `${sessionProgress * 100}%`,
              background: 'var(--breathe)',
              borderRadius: 'var(--r-pill)',
              transition: 'width 1s linear',
            }} />
          </div>
        )}
      </div>
    </SessionShell>
  );
}

Object.assign(window, { BreatheSession });