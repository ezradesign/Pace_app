/* PACE · Módulo Foco (Pomodoro)
   Temporizador funcional real. 4 estilos visuales de tweaks.
*/

const { useEffect: useEffectFT, useRef: useRefFT } = React;

/* LAS CURVAS DE LA LUZ -> FocusTimer.support.jsx (s163). `curvaSuave` y `curvaCaida` salieron al
   trocear este archivo; su porque medido (meseta 45-55 %, enfriamiento sin repunte, s159) va con ellas. */

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
      /* s172 · `activeSeconds` ES el preset: la cuenta solo corre en 'running',
         asi que llegar a 0 es haber contado eso; lo pausado va en elapsed. */
      completeFocusSession('home', { minutes: state.focusMinutes,
        elapsedSeconds: focoElapsedSec(inicioBloqueRef.current, durationSec),
        activeSeconds: durationSec });
      onFinish && onFinish();
    }
  });

  /* Persistencia del Pomodoro en recarga (s102, resuelve el fork s96).
     Clave pace.timer.v1 FUERA de pace.state.v2 (el timer sigue siendo
     local, decisión s96). Al montar: reanuda solo si el foco guardado
     sigue VIVO y modo/minutos coinciden; expirado estando fuera se
     descarta sin acreditar (helpers en FocusTimer.support.jsx). */
  /* s172 · reloj de PARED del bloque, solo para el evento (§6.4 lo quiere CON
     las pausas dentro y `useCountdown` no guarda el inicio). Se fija al empezar
     un bloque, NUNCA al reanudar: eso borraria la pausa que esto va a contar. */
  const inicioBloqueRef = useRefFT(null);
  const restoredRef = useRefFT(false);
  useEffectFT(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const endsAtSaved = loadPersistedFocusTimer(state.focusMode, state.focusMinutes);
    /* Reanudado tras recargar: el inicio real se fue con la pestaña y se DERIVA
       del final guardado — estimacion que ignora las pausas previas, por eso no
       toca `activeSeconds`, que sigue siendo exacto. */
    if (endsAtSaved) { inicioBloqueRef.current = endsAtSaved - durationSec * 1000; restore(endsAtSaved); }
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
  const aro = state.focusMode === 'foco' && typeof ritmoAro === 'function' ? ritmoAro(state, t, tn) : null;   // s192 «A tu ritmo»: «Bloque 2 de 8» (state-ritmo.jsx)
  const modeLabel = aro ? aro.label : state.focusMode === 'foco' ? t('focus.manual.label')
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
    if (status !== 'paused') {
      inicioBloqueRef.current = Date.now();   // s172: bloque nuevo, no reanudacion
      /* s193 · empezar un bloque de foco CIERRA la pausa de «A tu ritmo» (state-ritmo.jsx):
         reanudar no es empezar, y Pausa/Larga no son bloques del menú. */
      if (state.focusMode === 'foco' && typeof ritmoBloqueEmpezado === 'function') ritmoBloqueEmpezado(state.focusMinutes);   // s194: y recoloca el dia si la hora no es la del plan
      /* s194 · y es una PUERTA para el evento de la sesión: 'aro', servido por el menú
         si hay plan (`aro` no es null). Se anota al empezar, no al reanudar. */
      if (state.focusMode === 'foco' && typeof paceOrigenSesion === 'function') paceOrigenSesion('aro', !!aro);
    }
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
  /* s166: la etiqueta de ARRANQUE depende del MODO, no solo del motor. En
     Pausa y Larga el boton decia 'Empezar foco' sobre un reloj que no es de
     foco (lo vio el usuario en la web). Una sola constante para los dos sitios
     donde se arranca -- idle y completed -- porque separarlas fue justo como
     nacio el desajuste. */
  const startLabel = aro ? aro.empezar : isFocoMode ? t('focus.start') : t('focus.startPause');

  let ctaLabel, ctaAction;
  if (running) {
    ctaLabel = t('focus.pause');
    ctaAction = toggle;
  } else if (isCompleted) {
    ctaLabel = aro ? aro.empezar : isFocoMode ? t('focus.startAnother') : startLabel;
    ctaAction = handleStartAnotherCycle;
  } else if (status === 'paused') {
    ctaLabel = t('focus.continue');
    ctaAction = handleNormalStart;
  } else {
    ctaLabel = startLabel;
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
    <div style={aro ? { ...focusStyles.cycleDots, visibility: 'hidden' } : focusStyles.cycleDots}>
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

  /* LA LUZ DE LA HOME (s158 · s159) -> FocusTimer.luz.jsx (s193). Publica --pace-k,
     --pace-i, --pace-on, --pace-pausado, --pace-arco y --pace-bloque (el avance del
     bloque, para la línea de A tu ritmo) en [data-pace-home-body] a partir de
     `progress` y `status`. Va AQUÍ, donde estaban sus dos efectos, para
     que el orden de hooks no cambie. Sus porqués medidos viajan con ella. */
  useLuzHome({ progress, status, running, focusMode: state.focusMode });

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

      {/* Visualización. Las dos magnitudes de la luz se publican AQUÍ, en el
          ancestro común de las dos capas: así hay UNA sola fuente de color y de
          intensidad para todas ellas. En s157 la luz de suelo llevaba su tono
          escrito a fuego mientras la corona sí viajaba, y como el suelo era la
          capa de mayor superficie el resultado era que «el color siempre parece
          el mismo» — con el Pomodoro parado incluido. */}
      <div style={focusStyles.timerWrap} data-pace-timer-wrap>
        {/* EL SOL (s157, rehecho en s158). Nodo puramente decorativo anclado al
            centro del aro que NO lleva el clip-path del marco: por eso la luz
            puede irradiar hacia fuera sin que nadie la corte en recto. Sus dos
            pseudos son las dos capas —limbo y bloom—; el nodo solo aporta el
            ancla y el fundido de 1,6 s. Va ANTES del aro para pintar detrás, y
            solo en el estilo aro de la home: Caminos usa PathFocusStep, que ni
            pasa por aquí. */}
        {isAro && <div data-pace-sun aria-hidden="true" />}
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

/* ============================
   LO QUE SALIO DE AQUI
   ============================
   s163 (686 -> 485 ln):
   · barra, analogico y su dispatcher -> FocusTimer.parts.jsx
   · la tabla `focusStyles`           -> FocusTimer.support.jsx
   s193 (499 -> 320 ln, al tocar el limite de §1):
   · la luz de la home (`useLuzHome`)  -> FocusTimer.luz.jsx

   Los tres archivos cargan ANTES que este. `focusStyles` llega por `window`
   porque un `const` no cruza la IIFE del build; se referencia pelada. Lo
   siguiente que crezca va a uno de los hermanos, no aqui. */

Object.assign(window, { FocusTimer });