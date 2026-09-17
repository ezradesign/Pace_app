/* PACE · Foco · LA LUZ DE LA HOME (s158 · s159) — sacada de FocusTimer.jsx en s193
   =================================================================================
   `useLuzHome` deriva de `progress` y `status` las magnitudes que el CSS necesita
   para saber QUÉ HORA ES y CUÁNTA luz hay, y las publica en [data-pace-home-body].
   No dibuja nada ni toca el temporizador: es la misma cadena de decisiones que
   vivía dentro de FocusTimer, con sus porqués medidos, movida entera porque aquel
   archivo llegó a 500 líneas (§1) y esto era el bloque más largo y más aislado.

   Se llama en el MISMO punto del render en que estaban sus dos efectos, así que
   el orden de hooks de FocusTimer no cambia. Las curvas (`curvaSuave`,
   `curvaCaida`) siguen en FocusTimer.support.jsx y llegan por ámbito global;
   `interpolateRingColor` viaja por window desde TimerDial. */

const { useEffect: useEffectLuz } = React;

function useLuzHome({ progress, status, running, focusMode }) {
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
  const horaCruda = focusMode !== 'foco' ? (0.93 + progress * 0.07)
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
  const intensidadCruda = focusMode !== 'foco' ? 0.44
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
    ? interpolateRingColor(Math.round(progress * 96) / 96, focusMode)
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
  useEffectLuz(() => { publicarLuz(paceK, paceI, paceOn, pacePausado, paceArco); },
    [paceK, paceI, paceOn, pacePausado, paceArco]);
  useEffectLuz(() => () => { publicarLuz(null, null, null, null, null); }, []);
}

Object.assign(window, { useLuzHome });
