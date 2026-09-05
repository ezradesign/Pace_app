/* PACE - TimerDial (sesion 76 / v0.30.0)
   Anillo circular compartido entre FocusTimer (Pomodoro home) y
   PathFocusStep (Pomodoro dentro de un Camino). Extraido de
   FocusTimer.TimerAro para eliminar la divergencia visual entre
   ambos sitios (auditoria s75, captura 3).

   Puramente presentacional. El padre controla running/setRunning y
   provee los controles via el slot `inner` (FocusTimer los inyecta
   dentro del aro; PathFocusStep los deja fuera y pasa inner=null).

   Pixel-equivalente al TimerAro previo:
     viewBox 100 / radio 47.5 / strokeWidth base 0.35 / arco 0.7
     strokeOpacity 0.7 / strokeLinecap round
*/

/* interpolateRingColor - gradiente terracota -> ocre -> oliva en modo
   foco. Estable en pausas (breathe) y larga (focus). Extraido de
   FocusTimer en s76.

   s161 · LEE TOKENS, ASI QUE NO PUEDE SUPONER QUE VALEN HEXADECIMAL.
   Aqui habia un `hexToRgb` que hacia `slice()` sobre dos digitos por canal, y
   eso solo funciona si el token se declara con `#rrggbb`. En cuanto un token de
   color se registra con `@property` —lo que hace falta para que se FUNDA al
   cambiar de paleta— su valor computado pasa a la forma CANONICA,
   `rgb(201, 122, 93)`, y aquel parser devolvia **NaN**: el arco salia
   `rgb(NaN, NaN, NaN)`, `--pace-arco` quedaba invalido y **el degradado entero
   del bloom del sol caia a `background-image: none`**. Registrar un color de
   modulo apagaba la atmosfera del Pomodoro. Se publico y lo cazo la suite.

   `aRgb` acepta las dos formas y, si no reconoce ninguna, **devuelve el
   respaldo en vez de NaN**: el modo de fallo pasa de «se apaga media home en
   silencio» a «el arco usa su color por defecto». La misma cautela vale para
   cualquier token que alguien decida escribir en `rgb()` o `oklch()` manana. */
function interpolateRingColor(progress, mode) {
  if (mode === 'pausa') return 'var(--breathe)';
  if (mode === 'larga') return 'var(--focus)';
  const styles = getComputedStyle(document.documentElement);
  const read = (name, fb) => (styles.getPropertyValue(name).trim() || fb);
  const c1 = read('--breathe', '#C97A5D');
  const c2 = read('--move',    '#9A7B4F');
  const c3 = read('--focus',   '#6e7a4e');
  const aRgb = (valor, respaldo) => {
    const s = String(valor || '').trim();
    /* forma canonica de un token registrado: rgb(r, g, b) o rgba(r g b / a) */
    const m = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (m) return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])];
    const h = s.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(h)) {
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    }
    if (/^[0-9a-f]{3}$/i.test(h)) {
      return [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)];
    }
    return respaldo;
  };
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const blend = (r1, r2, t) => [lerp(r1[0],r2[0],t), lerp(r1[1],r2[1],t), lerp(r1[2],r2[2],t)];
  /* Los respaldos son los MISMOS literales que los fallbacks de arriba, ya en
     RGB: si el token no se reconoce, el arco sigue siendo el arco. */
  const r1 = aRgb(c1, [201, 122, 93]), r2 = aRgb(c2, [154, 123, 79]), r3 = aRgb(c3, [110, 122, 78]);
  const t = Math.max(0, Math.min(1, progress));
  const rgb = t < 0.5 ? blend(r1, r2, t * 2) : blend(r2, r3, (t - 0.5) * 2);
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/* TimerTicks - aro de marcas de minuto (s99, variante "ticks" del timer,
   peticion del usuario). 60 marcas radiales tipo reloj; cada 5 es mayor.
   Las que ya pasaron (i < progress*60) se pintan en el color del arco; las
   que faltan quedan tenues -> textura de reloj + progreso legible. El svg
   NO se rota (las marcas ya nacen arriba via -PI/2). */
function TimerTicks({ progress, color }) {
  const N = 60;
  const passed = progress * N;
  const marks = [];
  for (let i = 0; i < N; i++) {
    const major = i % 5 === 0;
    const a = (i / N) * 2 * Math.PI - Math.PI / 2;
    const rOut = 48.5;
    const rIn = major ? 42.5 : 45;
    const isPast = i < passed;
    marks.push(
      <line key={i}
        x1={(50 + rIn * Math.cos(a)).toFixed(2)} y1={(50 + rIn * Math.sin(a)).toFixed(2)}
        x2={(50 + rOut * Math.cos(a)).toFixed(2)} y2={(50 + rOut * Math.sin(a)).toFixed(2)}
        stroke={isPast ? color : 'var(--line)'}
        strokeWidth={major ? 0.9 : 0.5}
        strokeOpacity={isPast ? 0.95 : 0.4}
        strokeLinecap="round"
        style={{ transition: 'stroke 0.5s linear, stroke-opacity 0.5s linear' }} />
    );
  }
  return <React.Fragment>{marks}</React.Fragment>;
}

/* ============================================================
   EL RECORRIDO SOLO PISA LO QUE SE VE (s184).

   Hasta v0.114.1 el arco daba los 360 grados: nacia en las 12, se hundia bajo
   el horizonte —donde la mascara de s158 lo dejaba al 30 %, por detras de
   Actividades— y volvia a salir por el otro lado. El usuario pidio que el
   tiempo recorra EXACTAMENTE el tramo visible: que empiece en el extremo
   izquierdo, suba por las 12 y muera en el derecho.

   Y ESE ANGULO NO SE ESCRIBE, SE MIDE. El corte es --pace-corte, que el CSS
   deriva del horizonte del motor restandole la banda del rotulo ACTIVIDADES
   (medida, no escrita). Y el horizonte es el 16 % de D con un TECHO por el
   CICLO, asi que su ratio ya oscila entre 0,147 y 0,176 segun el breakpoint
   (contrato §0) — y la banda del rotulo tampoco es constante. Un angulo fijo
   dejaria los dos cabos por debajo del corte en unos tamanos y flotando en
   otros; con la separacion de s184 (el aro baja hasta el canto de las
   tarjetas) el barrido pasa de 271,6 a 295,8 grados a 1280x800, asi que el
   numero es aun menos escribible que antes.

   LA ARITMETICA. El anillo tiene radio 0,475 D: r=47,5 en un viewBox de 100
   que cubre el marco, y el marco es cuadrado (aspect-ratio 1/1 + meet), asi
   que una unidad de viewBox es exactamente D/100 px. El corte cae D/2 − H
   por debajo del centro, luego los dos cruces estan a
   asin((D/2 − H) / 0,475 D) bajo la horizontal y el tramo visible mide
   2 × (90° + ese angulo). Con H >= D/2 (corte por encima del centro, que hoy
   no ocurre) el asin saldria de rango: ahi se devuelve el circulo entero en
   vez de un NaN que borraria el arco.
   ============================================================ */
const { useState: useStateTD, useRef: useRefTD, useLayoutEffect: useLayoutEffectTD } = React;

const DIAL_R = 47.5;                        /* radio del anillo, en viewBox */
const DIAL_VUELTA = 360;

/* Devuelve el barrido en grados, o `null` cuando AUN NO SE PUEDE DECIDIR.
   Esa tercera respuesta no es defensa de manual: es el caso del arranque, y
   costo la primera version de esta sesion. Sin layout todavia, o con
   --pace-corte aun sin resolver, «no lo se» y «da la vuelta entera» son
   respuestas distintas, y devolver la segunda CONGELA el circulo completo — el
   observer que deberia corregirlo no vuelve a disparar porque D no cambia. */
function medirBarridoVisible(marco) {
  const D = marco.getBoundingClientRect().height;
  if (!(D > 0)) return null;
  const H = parseFloat(getComputedStyle(marco).getPropertyValue('--pace-corte'));
  if (!isFinite(H)) return null;           /* el token aun no existe */
  if (H <= 0) return DIAL_VUELTA;          /* sin horizonte: vuelta entera */
  const sen = (D / 2 - H) / ((DIAL_R / 100) * D);
  if (!(sen > -1 && sen < 1)) return DIAL_VUELTA;
  return 2 * (90 + Math.asin(sen) * 180 / Math.PI);
}

/* QUE DISPARA LA MEDIDA, Y POR QUE NO BASTA EL TAMANO DEL MARCO.

   La primera version observaba solo el marco con un ResizeObserver, razonando
   que el horizonte no puede moverse sin que se mueva D. Es cierto EN REGIMEN y
   FALSO EN EL ARRANQUE, que es justo cuando importa: medido en el artefacto,
   la unica lectura que llego a ocurrir devolvio 360 porque --pace-horizon aun
   no resolvia, y como el marco ya tenia sus 420 px definitivos el observer no
   volvio a disparar nunca. El aro se quedaba redondo con el motor funcionando.

   El disparo bueno es el que ve al MOTOR publicar. home-geometry.js escribe
   --pace-timer-d y --pace-activities-overlap —los dos insumos de este
   calculo— en el `style` de <html> (su `setVar`, home-geometry.js:136), y solo
   cuando cambian. Un MutationObserver sobre ese atributo es por tanto el
   evento exacto, sin sondeo y sin frames de mas.

   El ResizeObserver se queda ADEMAS, y no por simetria: cubre el caso del
   motor apagado, donde D y el horizonte salen de los fallbacks CSS y lo unico
   que se mueve es el marco.

   NINGUNO DE LOS DOS PUEDE REALIMENTARSE: lo que este hook cambia es el
   dasharray de dos <circle> en position:absolute, que no altera ni el tamano
   del marco ni el style de <html>. El umbral de 0,02° remata la garantia. */
function useBarridoVisible(marcoRef, activo) {
  const [barrido, setBarrido] = useStateTD(DIAL_VUELTA);
  useLayoutEffectTD(() => {
    if (!activo) { setBarrido(DIAL_VUELTA); return; }
    const marco = marcoRef.current;
    if (!marco) return;
    const leer = () => {
      const v = medirBarridoVisible(marco);
      if (v == null) return;
      setBarrido((prev) => (Math.abs(prev - v) > 0.02 ? v : prev));
    };
    leer();
    let ro = null, mo = null;
    if (typeof ResizeObserver === 'function') {
      ro = new ResizeObserver(leer);
      ro.observe(marco);
    }
    if (typeof MutationObserver === 'function') {
      mo = new MutationObserver(leer);
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    }
    return () => { if (ro) ro.disconnect(); if (mo) mo.disconnect(); };
  }, [activo]);
  return barrido;
}

function TimerDial({ mins, secs, progress, mode, modeLabel, subtitle, inner, running, ticks, fitHeight, paused }) {
  const R = DIAL_R;
  // Color del arco/marcas una sola vez (lo comparten arco, punto guia y ticks).
  const ringColor = interpolateRingColor(progress, mode);

  /* El recorte SOLO donde hay horizonte: la home (fitHeight) y solo en la
     variante de arco. Caminos no pasa fitHeight y ademas va por `ticks`, asi
     que su anillo sigue siendo la vuelta entera, byte-identico. */
  const marcoRef = useRefTD(null);
  const barrido = useBarridoVisible(marcoRef, !!fitHeight && !ticks);
  const recortado = barrido < DIAL_VUELTA - 0.01;
  /* EL TRAZO SE MIDE EN GRADOS, Y ESO ARREGLA UNA ASIMETRIA MEDIDA (s184).
     `pathLength={360}` le dice al motor que trate el trazado como si midiera
     360 unidades, asi que guion y desfase se escriben directamente en grados y
     el barrido entra tal cual. No es azucar: sin el, las cuentas van contra la
     circunferencia EXACTA (2πr = 298,451) mientras Chrome dibuja el circulo
     con cuatro beziers cuya longitud real es 297,97 — un 0,16 % de sobra que
     alarga el arco 0,44° y dejaba el cabo derecho 0,78 px POR DEBAJO del
     izquierdo, medido sobre la pagina a 390x844. Con pathLength los dos cabos
     caen en la misma linea porque el motor normaliza por su propio trazado.
     El giro lleva el ORIGEN al extremo izquierdo; sin recorte vale 0 y
     `360 360` pinta el circulo entero, o sea la rama de siempre. */
  const giroInicio = recortado ? -barrido / 2 : 0;
  const trazo = barrido.toFixed(3) + ' ' + DIAL_VUELTA;

  /* fitHeight (s123, SOLO home): el aro se dimensiona por la ALTURA ÚTIL de su
     contenedor (no por 56vh del viewport), encogiéndose en pantallas bajas hasta
     un mínimo legible, para no desbordar main-content y recortar bolas/CICLO. La
     geometría del anillo (viewBox/R/C/SVG) NO cambia: solo cambia el tamaño del
     marco, que el SVG ya escala a 100%. El clamp real (con fallback vh→dvh) vive
     en _responsive.js sobre [data-pace-dial-fit]. Caminos NO pasa la prop → usa
     el marco clásico min(56vh,86vw,520px), byte-idéntico. */

  return (
    /* data-pace-dial-running: gancho para el halo "respirando" del aro
       cuando el Pomodoro corre (CSS en tokens.css, pack de pulido A).
       Solo presente cuando running -> el selector [data-...] no matchea
       en reposo. Puramente presentacional; el padre decide `running`.
       `ticks`: variante aro de marcas de minuto (Caminos Foco); sin ticks
       es el aro clasico con arco + punto guia (FocusTimer home).
       data-pace-dial-paused (s156): gancho DECLARATIVO para que la atmosfera de
       amanecer distinga «pausado» de «reposo» — dos estados que hasta ahora se
       veian igual porque `running` es false en los dos. El padre decide; aqui no
       hay ni una linea de logica de temporizador. */
    <div ref={marcoRef}
         data-pace-dial-running={running ? '' : undefined}
         data-pace-dial-paused={paused ? '' : undefined}
         data-pace-dial-fit={fitHeight ? '' : undefined}
         style={fitHeight ? timerDialStyles.frameFit : timerDialStyles.frame}>
      {/* ENVOLTORIO DEL ANILLO (s158). Existe por una razon concreta: hasta
          ahora el horizonte se hacia con `clip-path` sobre el MARCO, o sea con
          un corte seco que se llevaba por delante el arco de recorrido. El
          usuario pidio que el arco se COMPLETE los 360 grados aunque pase por
          detras de los chips, atenuandose al cruzar el horizonte en vez de
          desaparecer. Eso es una mascara con degradado, y no puede ir en el
          <svg>: uno de los dos va ROTADO -90deg y la mascara rotaria con el.
          Tampoco puede ir en el marco, que contiene el numero y el CTA. Va
          aqui, en una capa que solo envuelve al anillo.
          La regla la pone _responsive.js y SOLO bajo [data-pace-dial-fit]:
          Caminos no lo lleva y su anillo queda intacto. */}
      <div data-pace-dial-ring style={timerDialStyles.ringLayer}>
      {ticks ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <TimerTicks progress={progress} color={ringColor} />
        </svg>
      ) : (
        <React.Fragment>
        {/* LA PISTA VIVE EN SU PROPIA CAPA (s184, enmienda), y esto no es
            organizacion: es que la pista y el recorrido NO PUEDEN llevar la
            misma niebla.

            La primera version les puso una sola, larga (0,14 D), sobre
            [data-pace-dial-ring]. Como el arco NACE en el horizonte —justo
            donde esa mascara vale cero—, el recorrido salia de la niebla
            despacio: el usuario lo reporto como «tarda en aparecer el contador
            de la parte izquierda» y como que «no parece que empiece en el lugar
            adecuado», que son el mismo defecto visto dos veces. Los primeros
            minutos del bloque no tenian senal.

            EL REPARTO SALE DE UNA FRASE QUE YA ESTABA ESCRITA EN tokens.css:
            «Arco = informacion; halo = ambiente». La pista es ambiente —es la
            ESCALA— y puede disolverse todo lo que haga falta para que el anillo
            no termine en filo. El arco es informacion y **no puede
            desaparecer**: lleva su propia niebla, corta, la justa para que el
            remate no se lea cortado.

            Dos <svg> con el MISMO viewBox y la MISMA rotacion, asi que se
            superponen exactos; la pista va primera para quedar detras. La
            mascara sigue sin poder ir en el <svg> —va rotado y el degradado
            rotaria con el—, por eso cada una envuelve al suyo en un div. */}
        <div data-pace-dial-pista style={timerDialStyles.ringLayer}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <g transform={`rotate(${giroInicio.toFixed(3)} 50 50)`}>
              {/* Track suave. Se recorta CON el arco, y no por simetria: la
                  pista es la ESCALA del recorrido, y una escala que siguiera
                  dando la vuelta entera prometeria tiempo donde ya no lo hay. */}
              <circle cx="50" cy="50" r={R} pathLength={DIAL_VUELTA} fill="none"
                stroke="var(--line)" strokeWidth="0.7" strokeOpacity="0.85"
                strokeDasharray={trazo} />
            </g>
          </svg>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* EL GRUPO QUE LLEVA EL ORIGEN AL EXTREMO IZQUIERDO (s184). Gira
              medio barrido en sentido antihorario, asi que el punto 0 de los
              tres trazados —pista, arco y punto guia— cae en el cruce
              izquierdo y las 12 quedan justo en la mitad del recorrido. Sin
              recorte vale 0 y el anillo es el de siempre. */}
          <g transform={`rotate(${giroInicio.toFixed(3)} 50 50)`}>
          {/* Arco de progreso: mas presente (s99) con cap redondo.

              EL `key` NO ES DECORACION (s184). `stroke-dashoffset` lleva una
              transicion de 1 s, y eso es correcto mientras lo que se mueve es
              el PROGRESO. Cuando lo que cambia es el BARRIDO —un resize, y el
              motor da hasta ocho pasadas de «encoger hasta caber»— el offset
              salta a otro valor y la transicion lo recorre pintando arco por el
              camino: con el Pomodoro parado aparecia un tramo de color en el
              extremo izquierdo, visto en captura a 800x500. Es el mismo
              principio que s160 dejo escrito para el alto del aro: la geometria
              no se transiciona. Al colgar el `key` del barrido, React monta un
              <circle> nuevo cuando la geometria cambia y el valor nuevo no
              tiene desde donde viajar; entre resizes el key es constante y la
              transicion del progreso queda intacta. */}
          <circle key={'arco-' + barrido.toFixed(3)}
            cx="50" cy="50" r={R} pathLength={DIAL_VUELTA} fill="none"
            stroke={ringColor} strokeWidth="1.3"
            strokeOpacity="0.92"
            strokeLinecap="round"
            strokeDasharray={trazo} strokeDashoffset={(barrido * (1 - progress)).toFixed(3)}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear' }} />
          {/* Punto guia en la punta del progreso (halo + nucleo).
              s138 — el gate era `progress > 0.001` y hacia que el punto
              montara MAS TARDE que el primer avance del arco. Medido con
              MutationObserver sobre el SVG: el umbral se traduce en segundos
              distintos segun la duracion (0.001 x 1500 s = 1,5 s -> el punto
              espera al segundo 2; 0.001 x 2700 s = 2,7 s -> al segundo 3),
              mientras el arco avanza SIEMPRE en el segundo 1. Desfase real
              1003 ms a 25 min y 1999 ms a 45 min (0 s a 15, 2 s a 35).
              `progress` es `1 - remaining/totalSec` (FocusTimer.jsx:93):
              aritmetica exacta que vale 0 clavado en reposo, asi que el
              umbral no protegia de ruido de coma flotante. Comparar contra 0
              monta el punto en el MISMO tick en que el arco arranca, con
              cualquier duracion (incluida la de "Otro"). */}
          {/* s139 — ENMIENDA al gate de s138. Comparar contra 0 alineó el punto
              con el arco, pero `progress` vale 0 exacto durante todo el primer
              segundo, así que el punto seguía sin EXISTIR ahí: montaba en el
              primer tick ya rotado. Medido con MutationObserver a 25 min:
              aparece a t=1039 ms directamente en **0,24°** = 360/1500 clavado,
              o sea nunca pasa por las 12 (reportado por el usuario como «no
              empieza exactamente en 0, sino un poco más adelantado»); no es que
              se adelante al avanzar, es que nace desplazado y sin transición
              desde el origen.
              Con `running` el punto existe desde el instante del arranque, donde
              `progress` es 0 y el ángulo por tanto 0: sale de las 12 y avanza
              con su transición. Lo que s138 protegía —que no haya punto en
              reposo— lo sigue cubriendo `progress > 0`: en idle a cero no corre
              nada. Pausado a mitad y completado conservan el punto por esa misma
              rama. */}
          {/* s184 — el punto guia recorre el MISMO barrido que el arco, no los
              360: va dentro del grupo girado, asi que su rotacion 0 ya es el
              extremo izquierdo y su maximo es la punta del arco. Lo que s138 y
              s139 dejaron atado —que monte en el mismo tick que el arco y que
              nazca en el origen, no desplazado— se conserva intacto: el gate
              es el mismo y con progress 0 el angulo sigue siendo 0. */}
          {(running || progress > 0) && (
            <g transform={`rotate(${(progress * barrido).toFixed(3)} 50 50)`}
               style={{ transition: 'transform 1s linear' }}>
              <circle cx={50 + R} cy="50" r="1.7" fill={ringColor} opacity="0.22" />
              <circle cx={50 + R} cy="50" r="0.85" fill={ringColor}
                style={{ transition: 'fill 1s linear' }} />
            </g>
          )}
          </g>
        </svg>
        </React.Fragment>
      )}
      </div>

      <div style={timerDialStyles.inner}>
        {/* data-pace-dial-* (s126): hooks PRESENTACIONALES para el escalado
            proporcional del interior en Desktop (app/main/_responsive.js los
            usa SOLO bajo min-width:769px). No cambian estructura ni lógica y
            son inertes en mobile/tablet y en Caminos (marco clásico). */}
        {modeLabel ? <div data-pace-dial-label style={timerDialStyles.modeLabel}>{modeLabel}</div> : null}
        <div data-pace-dial-number style={ticks ? timerDialStyles.numberHugeTicks : timerDialStyles.numberHuge}>
          {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
        </div>
        {/* aria-live: anuncia el cambio del subtítulo (descriptor por duración
            y, en el home, «Ciclo completado») de forma cortés. El número del
            contador vive en otro div sin live → no se lee cada segundo. En
            Caminos subtitle=null, así que este nodo ni existe. */}
        {subtitle ? <div data-pace-dial-subtitle style={timerDialStyles.subtitleItalic} aria-live="polite">{subtitle}</div> : null}
        {inner ? <div data-pace-dial-divider style={timerDialStyles.innerDivider} /> : null}
        {inner}
      </div>
    </div>
  );
}

const timerDialStyles = {
  frame: {
    position: 'relative',
    height: 'min(56vh, 86vw, 520px)',
    width: 'min(56vh, 86vw, 520px)',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
  },
  /* Variante fitHeight (s123, home). height/width los fija _responsive.js con
     [data-pace-dial-fit] (clamp por altura útil + fallback vh→dvh); aquí solo el
     resto del marco. aspect-ratio 1/1 + height del CSS → width cuadrado; el
     maxWidth:100% blinda contra desbordes horizontales en ancho+corto. */
  frameFit: {
    position: 'relative',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    maxWidth: '100%',
  },
  /* s158: capa del anillo. Solo posiciona; el horizonte lo pinta
     _responsive.js con una mascara, y solo en la home. */
  ringLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },

  inner: {
    position: 'relative',
    textAlign: 'center',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '70%',
  },
  modeLabel: {
    fontSize: 11,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
    marginBottom: 10,
    fontWeight: 500,
  },
  numberHuge: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    fontSize: 'clamp(64px, 7vw, 104px)',
  },
  /* Variante ticks (Caminos Foco): numero PROTAGONISTA, mayor que el clasico
     (el usuario lo queria mas grande). nowrap para que no parta el MM:SS. */
  numberHugeTicks: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontWeight: 400,
    lineHeight: 0.9,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.03em',
    color: 'var(--ink)',
    fontSize: 'clamp(78px, 9vw, 128px)',
    whiteSpace: 'nowrap',
  },
  subtitleItalic: {
    fontStyle: 'italic',
    fontFamily: 'var(--font-display)',
    fontSize: 14,
    color: 'var(--ink-3)',
    marginTop: 30,
    letterSpacing: 0.2,
  },
  innerDivider: {
    width: 110,
    height: 1,
    background: 'var(--line-2)',
    opacity: 0.55,
    margin: '12px 0 10px',
  },
};

Object.assign(window, { TimerDial, interpolateRingColor });
