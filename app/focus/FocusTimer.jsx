/* PACE · Módulo Foco (Pomodoro)
   Temporizador funcional real. 4 estilos visuales de tweaks.
*/

const { useEffect: useEffectFT, useRef: useRefFT } = React;

function FocusTimer({ onFinish }) {
  const [state, set] = usePace();
  const { t, tn } = useT();

  /* Motor de cuenta atras basado en timestamps (s96 · app/focus/useCountdown).
     `remaining` se deriva del reloj real, no de un contador que se decrementa:
     la pestana oculta ya no subcuenta. `durationSec` cambia con el modo/minutos
     y el hook resetea a idle (reemplaza el antiguo efecto de reset). Sin
     persistencia: recargar resetea el Pomodoro como antes. */
  const durationSec = (state.focusMode === 'foco' ? state.focusMinutes
                     : state.focusMode === 'pausa' ? 5
                     : 15) * 60;

  const { remaining, running, status, endsAt, start, toggle, reset, restore } = useCountdown(durationSec, () => {
    /* Sonido de cierre — campana suave (do+sol+do6) que marca el fin del
       bloque, sea foco, pausa o larga. Respeta soundOn (noop si apagado). */
    try { playSound('pomodoro.end'); } catch (e) {}
    /* Solo el modo foco acredita: cycle + logros de pomodoro via
       completeFocusSession('home') -> completePomodoro. Pausa(5)/larga(15)
       tickan y suenan pero NO acreditan (decision historica). El hook fija la
       ultima onComplete en un ref, asi que este cierre lee el focusMode
       vigente; un cambio de modo resetea el timer antes de poder completar. */
    if (state.focusMode === 'foco') {
      /* Aviso PWA (s102): solo si el usuario lo activó en Ajustes Y la
         pestaña está en segundo plano. Nunca rompe (patrón playSound). */
      try {
        maybeNotifyFocusEnd({
          enabled: state.notifyFocusEnd,
          title: t('notify.focus.title'),
          body: t('notify.focus.body'),
        });
      } catch (e) {}
      completeFocusSession('home');
      onFinish && onFinish();
    }
  });

  /* Persistencia del Pomodoro en recarga (s102, resuelve el fork s96).
     Clave pace.timer.v1 FUERA de pace.state.v2 (el timer sigue siendo
     local, decisión s96). Al montar: reanuda solo si el foco guardado
     sigue VIVO y modo/minutos coinciden; expirado estando fuera se
     descarta sin acreditar (helpers en FocusTimer.support.jsx). */
  const restoredRef = useRefFT(false);
  useEffectFT(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const endsAtSaved = loadPersistedFocusTimer(state.focusMode, state.focusMinutes);
    if (endsAtSaved) restore(endsAtSaved);
  }, []);

  // Escribe mientras hay un foco running; pausa/reset/fin/otros modos limpian.
  useEffectFT(() => {
    persistFocusTimer(running && state.focusMode === 'foco', endsAt, state.focusMinutes);
  }, [running, endsAt, state.focusMode, state.focusMinutes]);

  // Drone ambiente — efecto paralelo (no toca el ticker ni la lógica de logros)
  useEffectFT(() => {
    if (!window.ambientDrone) return;
    const drone = window.ambientDrone;

    if (state.focusMode !== 'foco') { drone.stop(800); return; }
    if (remaining === 0)            { drone.stop(800); return; }

    if (running) {
      if (drone.isActive()) {
        drone.resume();
      } else {
        // activar ambientOn mid-sesión no arranca el drone retroactivamente
        // — solo arranca al inicio de una sesión nueva
        drone.start();
      }
    } else {
      if (drone.isActive()) drone.pause();
    }
  }, [running, state.focusMode, remaining]);

  // Apagar soundOn durante sesión → fadeout inmediato
  useEffectFT(() => {
    if (!state.soundOn && window.ambientDrone && window.ambientDrone.isActive()) {
      window.ambientDrone.stop(400);
    }
  }, [state.soundOn]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const totalSec = durationSec;
  const progress = 1 - (remaining / totalSec);

  /* Rótulo DENTRO del círculo. En modo foco es "Foco manual" (s122): etiqueta
     el temporizador como el flujo MANUAL, distinto del Camino guiado, sin
     ocupar una línea extra fuera del aro (decisión del usuario: la etiqueta
     vive dentro del círculo, no como kicker suelto). Pausa/Larga sin cambio. */
  const modeLabel = state.focusMode === 'foco' ? t('focus.manual.label')
                  : state.focusMode === 'pausa' ? t('focus.mode.pause')
                  : t('focus.mode.long');

  const isFocoMode = state.focusMode === 'foco';
  const isCompleted = status === 'completed';

  /* Subtítulo del aro/barra/analógico (s124):
     - modo foco: DESCRIPTOR editorial por DURACIÓN (getFocusDescriptorKey);
       en 'completed' el feedback «Ciclo completado» REEMPLAZA temporalmente al
       descriptor en el MISMO slot (no añade altura estructural → no toca el
       atardecer de s123).
     - pausa/larga: conservan su copy propio (invariante: copys de pausa). */
  const subtitle = isFocoMode
    ? (isCompleted ? t('focus.cycleComplete') : t(getFocusDescriptorKey(state.focusMinutes)))
    : state.focusMode === 'pausa' ? t('focus.subtitle.pause')
    : t('focus.subtitle.long');

  const isAro = state.timerStyle === 'aro';

  /* Inicio VISUAL centralizado (s124): sonido de arranque + petición de
     permiso de notificación. Lo comparten un arranque/reanudación normal y
     «Empezar otro ciclo», para idéntica semántica sin tocar el motor. */
  const startFocusVisual = () => {
    try { playSound('pomodoro.start'); } catch (e) {}
    if (state.focusMode === 'foco') maybeRequestNotifyPermission(state, set);
  };
  // Arranque/reanudación normal (idle|paused -> running). Pausar no pasa por aquí.
  const handleNormalStart = () => { startFocusVisual(); toggle(); };
  /* Fix del 'completed' inerte (s124): handler DEDICADO — reset + start. El
     motor sigue con 'completed' TERMINAL (toggle() ahí es no-op). reset NO
     acredita, start NO acredita: el 2º bloque empieza en durationSec completo
     sin tocar state.cycle. */
  const handleStartAnotherCycle = () => { startFocusVisual(); reset(); start(); };

  /* Etiqueta + acción del botón principal por ESTADO del motor (s124, SIN
     glifos). Basado en `status` (no en remaining===totalSec) para que pausar
     dentro del primer segundo muestre «Continuar» y no «Empezar foco»:
       running   -> «Pausar» (contorno)
       completed -> arranca otro bloque (fix del inerte)
       paused    -> «Continuar»
       idle      -> «Empezar foco». */
  let ctaLabel, ctaAction;
  if (running) {
    ctaLabel = t('focus.pause');
    ctaAction = toggle;
  } else if (isCompleted) {
    ctaLabel = isFocoMode ? t('focus.startAnother') : t('focus.start');
    ctaAction = handleStartAnotherCycle;
  } else if (status === 'paused') {
    ctaLabel = t('focus.continue');
    ctaAction = handleNormalStart;
  } else {
    ctaLabel = t('focus.start');
    ctaAction = handleNormalStart;
  }

  /* Dots de ciclo (4 puntitos + etiqueta «CICLO N / 4»).
     En estilo 'aro' viven DENTRO del aro, debajo del botón de comenzar.
     En otros estilos se renderizan en su bloque propio fuera del timer.
     N = (state.cycle % 4) + 1 (SOLO presentación; no toca la lógica Pomodoro).
     completed en foco muestra «SIGUIENTE · CICLO N / 4». Los puntos marcan los
     ciclos completados del cuarteto actual (delta cero). */
  const cycleN = (state.cycle % 4) + 1;
  const cycleLabel = (isFocoMode && isCompleted)
    ? tn('focus.cycleNext', { n: cycleN })
    : tn('focus.cycleOf', { n: cycleN });
  const cycleDotsEl = (
    <div style={focusStyles.cycleDots}>
      {[0,1,2,3].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: (state.cycle % 4) > i ? 'var(--focus)' : 'var(--line-2)',
        }} />
      ))}
      <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginLeft: 10 }}>{cycleLabel}</span>
    </div>
  );

  /* Bloque de controles + ciclo inyectado DENTRO del aro (layout ref. usuario).
     Para otros estilos se renderiza debajo en un bloque aparte. */
  const controls = (
    <div style={focusStyles.controlsTight}>
      <button
        data-pace-cta
        onClick={ctaAction}
        style={running ? focusStyles.startBtnSecondary : focusStyles.startBtnPrimary}
      >
        {ctaLabel}
      </button>
      {/* Reset RE-JERARQUIZADO (s124): oculto en idle/running/completed; en
          paused es una acción TEXTUAL secundaria «Reiniciar bloque» (no botón
          circular). Va EN FILA junto al CTA para NO añadir altura al interior
          del aro (la fila mide lo que el CTA = 44px) → el atardecer/CICLO de
          s123 no se desplazan. focus.restart queda intacta (PathFocusStep). */}
      {status === 'paused' && (
        <button
          onClick={reset}
          style={focusStyles.resetTextBtn}
          title={t('focus.restartBlock')}
          aria-label={t('focus.restartBlock')}
        >
          {t('focus.restartBlock')}
        </button>
      )}
    </div>
  );

  /* Para estilo aro: unimos controles + ciclo en un mismo bloque interior. */
  const innerForAro = (
    <>
      {controls}
      <div style={{ marginTop: 10 }}>{cycleDotsEl}</div>
    </>
  );

  return (
    <div style={focusStyles.root}>
      {/* NOTA: el ModeToggle Foco/Pausa/Larga vive ahora en TopBar
         (centrado arriba), por referencia del usuario (sesión 9). */}

      {/* Selector minutos. En Pausa/Larga no hay presets, pero se RESERVA su
         alto (s105): sin el spacer, el aro subia ~30px al desaparecer la fila
         (timerWrap es flex:1 y recentra el aro). El spacer = 26px (height de
         las pills de MinutesPicker); el gap:14 del root aplica igual a ambos,
         asi el aro queda en la MISMA posicion en los tres modos. */}
      {state.focusMode === 'foco' ? (
        <MinutesPicker value={state.focusMinutes} onChange={(v) => set({ focusMinutes: v })} />
      ) : (
        <div aria-hidden="true" style={{ height: 26 }} />
      )}

      {/* Visualización */}
      <div style={focusStyles.timerWrap}>
        <TimerVisualization
          style={state.timerStyle}
          mins={mins}
          secs={secs}
          progress={progress}
          mode={state.focusMode}
          modeLabel={modeLabel}
          subtitle={subtitle}
          inner={isAro ? innerForAro : null}
          running={running}
          fitHeight={isAro}
          paused={status === 'paused'}
        />
      </div>

      {/* Controles + ciclo fuera del aro — solo para estilos no-aro */}
      {!isAro && (
        <>
          <div style={focusStyles.controls}>{controls}</div>
          {cycleDotsEl}
        </>
      )}
    </div>
  );
}

/* NOTA: el antiguo ModeToggle interno (Foco/Pausa/Larga) se eliminó en v0.11.6.
   Los tabs viven ahora en TopBar (app/main.jsx), centrados arriba (v0.11.4). */

/* NOTA s124: MinutesPicker y su CSS de input se extrajeron a
   app/focus/FocusTimer.parts.jsx (split mecánico para bajar del tope de
   500 ln). Se consume aquí como global (window.MinutesPicker). */

/* ===================== */
/* TIMER VISUALIZATIONS */
/* ===================== */
/* TimerVisualization — sesión 37: circle y numero eliminados (rotos).
   Opciones válidas: aro (default), barra, analogico.
   Sesion 76: el aro se renderiza via TimerDial compartido (ui/TimerDial.jsx)
   para alinear pixel-a-pixel con PathFocusStep. interpolateRingColor vive
   ahora en TimerDial.jsx. */
function TimerVisualization({ style, mins, secs, progress, mode, modeLabel, subtitle, inner, running, fitHeight, paused }) {
  if (style === 'barra') return <TimerBar mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  if (style === 'analogico') return <TimerAnalog mins={mins} secs={secs} progress={progress} modeLabel={modeLabel} subtitle={subtitle} />;
  return <TimerDial mins={mins} secs={secs} progress={progress} mode={mode} modeLabel={modeLabel} subtitle={subtitle} inner={inner} running={running} fitHeight={fitHeight} paused={paused} />;
}

function TimerBar({ mins, secs, progress, modeLabel, subtitle }) {
  return (
    <div style={{ width: 520, textAlign: 'center' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 24 }}>{modeLabel}</div>
      <div style={{
        ...displayItalic,
        fontSize: 140, fontWeight: 400, lineHeight: 0.9,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em',
        marginBottom: 30,
      }}>{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</div>
      <div style={{ height: 2, background: 'var(--line)', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          width: `${progress * 100}%`,
          background: 'var(--focus)',
          transition: 'width 1s linear',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        <span>0:00</span>
        <span style={{ fontStyle: 'italic', textTransform: 'none', fontFamily: 'var(--font-display)' }}>{subtitle}</span>
        <span>{Math.floor(progress * 100)}%</span>
      </div>
    </div>
  );
}

function TimerAnalog({ mins, secs, progress, modeLabel, subtitle }) {
  // Reloj analógico con aguja de minutos en base a progress
  const angle = progress * 360;
  return (
    <div style={{ position: 'relative', width: 380, height: 380, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="48" fill="var(--paper)" stroke="var(--ink-2)" strokeWidth="0.4" />
        {/* Marcas horarias */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? 42 : 44;
          const r2 = 46;
          return <line key={i}
            x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)}
            x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)}
            stroke="var(--ink-2)" strokeWidth={isMajor ? 0.6 : 0.2} />;
        })}
        {/* Aguja */}
        <line x1="50" y1="50"
          x2={50 + 38 * Math.cos((angle - 90) * Math.PI / 180)}
          y2={50 + 38 * Math.sin((angle - 90) * Math.PI / 180)}
          stroke="var(--focus)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="50" cy="50" r="1.2" fill="var(--focus)" />
        {/* Texto */}
        <text x="50" y="32" textAnchor="middle" fontSize="3.5" letterSpacing="0.5" fill="var(--ink-3)" style={{ textTransform: 'uppercase' }}>{modeLabel}</text>
        <text x="50" y="70" textAnchor="middle" fontSize="10" fontFamily="EB Garamond" fontStyle="italic" fill="var(--ink)">
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </text>
        {/* Descriptor por duración (s124): discreto bajo la cifra, sin tocar la
            geometría del reloj (círculo/marcas/aguja). También muestra «Ciclo
            completado» cuando llega vía subtitle. */}
        {subtitle ? (
          <text x="50" y="80" textAnchor="middle" fontSize="3.6" fontFamily="EB Garamond" fontStyle="italic" fill="var(--ink-3)">{subtitle}</text>
        ) : null}
      </svg>
    </div>
  );
}

const focusStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    /* Padding lateral 40 en desktop; en móvil el <div data-pace-main-content>
       ya reduce a 12 su propio padding, y éste se relaja con un clamp
       para no ahogar el aro en 375×812. (Sesión 22.) */
    padding: '8px clamp(0px, 4vw, 40px) 0',
    width: '100%',
    height: 'auto', // s123: a su contenido; lo centra data-pace-home-stack (margin:auto)
    minHeight: 0,
  },
  timerWrap: {
    display: 'grid', placeItems: 'center',
    flex: '0 0 auto', // s123: aro a su tamaño propio (var); flex:1 lo colapsaría (basis 0%)
    minHeight: 0,
    width: '100%',
  },

  /* NOTA s76: los estilos aroFrame/aroInner/modeLabel/numberHuge/
     subtitleItalic/innerDivider vivian aqui y ahora viven en
     app/ui/TimerDial.jsx (timerDialStyles), compartidos con
     PathFocusStep. */

  /* ===== Controles (s124) =====
     Bloque en FILA (una sola línea, nowrap): CTA principal + (solo en paused)
     el reset textual A SU LADO. La fila mide lo que el CTA (44px) → mostrar el
     reset NO añade altura al interior del aro y no desplaza el CICLO/atardecer
     de s123. flexShrink:0 permite que la fila DESBORDE el maxWidth:70% del
     interior del dial, centrada, sin partir (cabe holgada dentro del aro). */
  controls: {
    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 10, flexWrap: 'nowrap', flexShrink: 0,
  },
  controlsTight: {
    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, flexWrap: 'nowrap', flexShrink: 0,
  },
  /* CTA cápsula RELLENA serif itálica, sin glifos (s124). minHeight 44 = piso
     de hit-area a11y (el padding visual queda holgado dentro). */
  startBtnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 44,
    padding: '8px 24px',
    whiteSpace: 'nowrap',
    background: 'var(--focus-cta)',
    color: 'var(--paper)',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 16,
    letterSpacing: '0.01em',
    fontWeight: 400,
    border: '1px solid var(--focus-cta)',
    boxShadow: '0 1px 2px rgba(31,28,23,0.08)',
    transition: 'all 180ms',
    cursor: 'pointer',
  },
  /* Contorno para «Pausar» (running): estado menos primario. */
  startBtnSecondary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 44,
    padding: '8px 24px',
    whiteSpace: 'nowrap',
    background: 'var(--paper)',
    color: 'var(--ink)',
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 16,
    letterSpacing: '0.01em',
    fontWeight: 400,
    border: '1px solid var(--line-2)',
    transition: 'all 180ms',
    cursor: 'pointer',
  },
  /* Reset como acción TEXTUAL secundaria (solo paused, s124). minHeight 44
     asegura la hit-area aunque el texto sea pequeño. */
  resetTextBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 44,
    padding: '0 10px',
    whiteSpace: 'nowrap',
    background: 'transparent',
    border: 'none',
    color: 'var(--ink-3)',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 13,
    letterSpacing: '0.02em',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    transition: 'color 180ms',
  },

  cycleDots: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginTop: 4,
  },
};

Object.assign(window, { FocusTimer });