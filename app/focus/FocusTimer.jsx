/* PACE · Módulo Foco (Pomodoro)
   Temporizador funcional real. 4 estilos visuales de tweaks.
*/

const { useEffect: useEffectFT, useRef: useRefFT } = React;

/* LAS CURVAS DE LA LUZ -> FocusTimer.support.jsx (s163). `curvaSuave` y
   `curvaCaida` salieron al trocear este archivo; su porque medido (la meseta
   de 45-55 % y el enfriamiento sin repunte, s159) viaja con ellas. */

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

  /* ===================================================================
     LA LUZ DE LA HOME (s158) · dos números, y ninguna decisión de producto.

     El aro ES el sol. Aquí no se dibuja nada: se publican las dos magnitudes
     que el CSS necesita para saber QUÉ HORA ES y CUÁNTA luz hay. Son derivadas
     presentacionales de `progress` y `status`; no se toca una línea de la
     lógica del temporizador.

     --pace-k  la HORA, 0 -> 1. Elige el color (tokens --sun-*).
     --pace-i  la INTENSIDAD, 0 -> 1. Elige cuánta luz. **0 = no hay sesión**.
     =================================================================== */

  /* ¿Hay un bloque VIVO? Corriendo o pausado. `completed` e `idle` no lo son.

     ESTO ES EL MODELO ENTERO: Pomodoro parado ⇒ CERO atmósfera. La home queda
     limpia, sin halo de ningún color; no es «fría y tenue», es NADA. Publicar
     la luz siempre dejaba además la atmósfera PEGADA: al completar un bloque
     `progress` se queda en 1 y nadie lo baja, así que la home se quedaba con la
     luz del final de sesión y el Pomodoro parado (medido en s157: prog=1.000 y
     capa fría al 100 % con 00:00 en pantalla, y seguía así tras elegir en el
     BreakMenu). */
  const haySesion = running || status === 'paused';

  /* LA HORA, RETIMADA EN s159 PARA QUE EL MEDIODÍA CAIGA EN LA MITAD.

     Las cuatro paradas de color no se tocan —amanecer 0, mediodía 0.38,
     atardecer 0.72, noche 1, en tokens.css— pero el RECORRIDO por ellas deja de
     ser lineal: la primera mitad del bloque consume el tramo amanecer→mediodía
     y la segunda el resto. Medido en s158, con el recorrido lineal el máximo
     perceptual compuesto caía en p=0,375 y en la mitad ya había bajado un 20 %:
     el encargo pide justo lo contrario, «máximo cálido en la mitad».

     El atardecer pasa a caer en p=0,774 por construcción. Pausa y Larga siguen
     siendo NOCHE, y sus «ligeras variaciones en el azul» las mueve el avance
     del PROPIO descanso dentro de una banda estrecha al final de la escala: el
     descanso se ahonda, no amanece. En reposo vale 1 —noche— y eso importa
     aunque no se vea: es el valor al que la luz viaja mientras se apaga. */
  const horaCruda = state.focusMode !== 'foco' ? (0.93 + progress * 0.07)
    : (progress <= 0.5 ? 0.38 * (progress / 0.5)
                       : 0.38 + 0.62 * ((progress - 0.5) / 0.5));

  /* LA INTENSIDAD. Dos medias envolventes que comparten el pico en la MITAD del
     bloque. Nunca llega a 0 con sesión viva —a las 0:00 ya hay amanecer— y
     pausar la recoge sin apagarla.

     LA MESETA SALE DE LA CURVA, no de un tramo plano escrito aparte, y eso es
     lo que la hace suave de verdad: `curvaSuave` tiene pendiente CERO en sus dos
     extremos, así que al llegar al pico la subida se posa en vez de doblar. En
     45-55 % la intensidad varía ~1,2 % —una cúspide sutil sobre una meseta muy
     tendida, que es lo que se pidió— y el máximo está exactamente en 0,50. La
     versión anterior era lineal a trozos y hacía ESQUINA en el pico.

     LAS AMPLITUDES DE s158 SE CONSERVAN, con UNA excepción decidida con el
     usuario: 0,52 al empezar, 0,92 en el pico y 0,44 en descanso siguen igual, y
     la cola final baja de 0,46 a **0,42** (M2). Ese recorte es lo único que
     permite que el residuo frío sea de verdad un residuo: con 0,46 y la
     envolvente plana en el minuto 25, la luz REPUNTABA al llegar a 00:00. Sigue
     siendo presencia ambiental —no se apaga de golpe—, solo que por debajo de
     los instantes anteriores, que es lo que pedía el encargo. */
  const intensidadCruda = state.focusMode !== 'foco' ? 0.44
      : (progress <= 0.5 ? 0.92 - 0.40 * curvaSuave((0.5 - progress) / 0.5)
                         : 0.92 - 0.50 * curvaCaida((progress - 0.5) / 0.5));

  /* PAUSAR ES SU PROPIO MANDO (s159), y sale de un defecto medido: el 0,45 de
     la pausa vivía multiplicado DENTRO de la intensidad, y como `i` no se
     transiciona, pausar bajaba la luz de 0,517 a 0,233 EN UN FRAME. Continuar,
     al revés. Es el mismo corte que tenía la sombra de los chips, en otra
     propiedad — y la sombra enseñó también cómo NO arreglarlo: encadenando una
     transición que persigue a otra.

     Por eso no se transiciona `i`. La pausa sale a un tercer factor, registrado
     con @property e interpolado por su cuenta en 500 ms, que se MULTIPLICA con
     los otros dos. Cada mando responde de lo suyo y ninguno persigue a nadie:
       --pace-on     hay sesión (0/1), fundido de 1,6 s
       --pace-i      la forma de la curva dentro del bloque, sin transición
       --pace-pausa  recogida al pausar (1 / 0,45), fundido de 500 ms
     500 ms y no 1,6 s a propósito: pausar es una acción TUYA y la luz tiene que
     acusar recibo; 1,6 s se leería como que la app no ha reaccionado.

     LO QUE SE PUBLICA ES UN INTERRUPTOR, NO UNA PROFUNDIDAD. Cuánto se recoge
     la luz es un valor POR PALETA (--sun-pausa: 0,45 en oscuro, 0,35 en claro,
     porque sobre papel claro la misma recogida se percibe menos) y las paletas
     viven en CSS. Si este componente publicara el número, la profundidad
     dejaría de poder depender del papel — y sería un valor de diseño escrito en
     un módulo de lógica. */
  const pacePausado = status === 'paused' ? '1' : '0';

  /* CUANTIZADOS LOS DOS, y la resolución es una decisión de PERCEPCIÓN con un
     presupuesto detrás, no un número redondo.

     Publicar cada segundo está descartado: `k` re-resuelve la cadena de
     color-mix (cuatro paradas anidadas sobre dos capas del tamaño del aro) y en
     s157 una sesión de 25 min pasó de 7,5 s a 21,5 s de trabajo del navegador
     con 1500 publicaciones. Pero 24 pasos era pasarse de frenada por el otro
     lado: medido en s158, el bloque daba **50 saltos, uno cada 30 s**, 47 de
     ellos por encima del 2 % del máximo y el mayor del 4,47 %. Eso es el
     parpadeo que se ve — un campo grande cambiando de golpe, dos veces por
     minuto.

     s159 sube k a 96 e i a 120. El escalón cae por debajo del 2 % en los dos
     (el de color a ~1,2 %) y el ritmo deja de tener periodo reconocible. NO se
     añade transición de opacidad, y no por pereza: una transición sobre
     `opacity` NO suaviza el escalón de COLOR —ese vive dentro del degradado, no
     en la opacidad—, así que resolvería la mitad del problema y a cambio se
     mezclaría con el fundido de --pace-on, alargando el apagado. Subir la
     resolución arregla las dos mitades con el mismo mecanismo.

     El coste está medido, no supuesto: ver el banco de atribución de s159. */
  const paceK = haySesion ? (Math.round(horaCruda * 96) / 96).toFixed(4) : '1';
  const paceI = (Math.round(intensidadCruda * 120) / 120).toFixed(4);

  /* `on` ES EL INTERRUPTOR, y existe SEPARADO de `i` por coste, no por gusto.

     El fundido de 1,6 s obliga a interpolar algo, y de ese algo cuelgan cosas
     CARAS: la máscara del horizonte del aro y el `filter` de chips y tarjeta se
     re-resuelven en CADA frame de la transición. Colgándolas de `i` —que cambia
     30 veces por sesión— eso son 30 transiciones de 1,6 s reconstruyendo una
     máscara sobre un elemento de 406x406 y cinco drop-shadows. Medido: la prueba
     del Pomodoro se quedó sin tiempo y la suite se fue a 1,2 min. Es el mismo
     agujero de s157 por otra puerta.

     `on` vale 0 o 1 y cambia EXACTAMENTE DOS VECES por sesión. Todo lo caro
     cuelga de él; `i` se queda con la opacidad, que es del compositor y no
     transiciona. Y como `i` ya no lleva la puerta de «hay sesión», al terminar
     conserva su último valor: el producto se apaga por `on`, con lo que la luz
     se va con la forma que tenía en vez de dar un salto de intensidad antes de
     desvanecerse. */
  const paceOn = haySesion ? '1' : '0';

  /* SE PUBLICAN EN [data-pace-home-body], no en el contenedor del aro y NO en la
     raíz. Las tres decisiones tienen motivo:

     · NO en el aro, porque desde s158 la luz también apoya a los chips de
       Actividades y a la tarjeta de Camino —sombra proyectada y filo de luz— y
       esos son HERMANOS del bloque del temporizador, no descendientes. Una
       variable declarada en el aro no les llega, y duplicar el color en otro
       sitio sería reabrir el defecto de s157 («el color siempre parece el
       mismo»): dos fuentes que divergen a la primera corrección.

     · NO en la raíz, aunque fue lo primero que escribí. Un custom property en
       documentElement invalida el estilo del DOCUMENTO ENTERO, y esto cambia
       ~30 veces por sesión. La suite lo cazó a la primera: s156 dejó asertado
       que nadie reescribe las variables de :root mientras corre el Pomodoro, y
       ese aserto se puso rojo. La preocupación es legítima aunque el motor de
       geometría no llegue a despertarse.

     · SÍ en [data-pace-home-body], que es el ancestro común más CERCANO de las
       dos ramas y donde el CSS ya declara --pace-dial-d y --pace-horizon. La
       invalidación se queda dentro de la home y no hay patrón nuevo.

     Se limpia al desmontar: dentro de un Camino este componente no existe y la
     home no debe quedarse con la luz de una sesión que ya no corre. */
  /* SE ESCRIBE SOLO LO QUE CAMBIA (s159). Con la resolución de s158 esto daba
     igual, pero ahora hay ~216 publicaciones por bloque y las tres propiedades
     se escribían en todas: dos de cada tres escrituras eran del mismo valor.
     Importa sobre todo por --pace-on, que es el único que TRANSICIONA (1,6 s,
     registrado con @property): reescribirlo constantemente es pedirle al motor
     que reevalúe una transición hacia el valor en el que ya está. */
  /* EL TONO DEL ARCO, para que la cola lo herede (s159). Bajo el horizonte no
     hay tiempo: hay luz. El tramo de recorrido que queda enterrado deja de ser
     un recorte mudo y tiñe la cola con su propio color, que es lo que cierra la
     idea de que el aro ES la fuente.

     Se publica desde AQUI y no desde TimerDial a proposito: ese componente lo
     comparte Caminos, que no tiene horizonte ni sol, y no debe saber que existe
     la home. `interpolateRingColor` es su funcion y viaja por window.

     Cuantizado a los MISMOS 96 pasos que la hora: es un color mas dentro de los
     degradados, asi que cada cambio repinta las dos capas igual que --pace-k, y
     publicarlo por segundo seria pagar 1500 repintados por un tono que se mueve
     despacio. */
  const paceArco = (typeof interpolateRingColor === 'function')
    ? interpolateRingColor(Math.round(progress * 96) / 96, state.focusMode)
    : null;

  const publicarLuz = (k, i, on, pausado, arco) => {
    const home = document.querySelector('[data-pace-home-body]');
    if (!home) return;
    for (const [nombre, valor] of [['--pace-k', k], ['--pace-i', i], ['--pace-on', on],
                                   ['--pace-pausado', pausado], ['--pace-arco', arco]]) {
      if (valor === null) home.style.removeProperty(nombre);
      else if (home.style.getPropertyValue(nombre) !== valor) home.style.setProperty(nombre, valor);
    }
  };
  useEffectFT(() => { publicarLuz(paceK, paceI, paceOn, pacePausado, paceArco); },
    [paceK, paceI, paceOn, pacePausado, paceArco]);
  useEffectFT(() => () => { publicarLuz(null, null, null, null, null); }, []);

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
   LO QUE SALIO EN s163 (686 -> 485 ln)
   ============================
   · barra, analogico y su dispatcher -> FocusTimer.parts.jsx
   · la tabla `focusStyles`           -> FocusTimer.support.jsx

   Los dos archivos cargan ANTES que este. `focusStyles` llega por `window`
   porque un `const` no cruza la IIFE del build; se referencia pelada. Lo
   siguiente que crezca va a uno de los dos hermanos, no aqui. */

Object.assign(window, { FocusTimer });