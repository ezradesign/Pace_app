/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   _responsive.atmosfera.js — EL JS QUE COMPONE LA LUZ DE LA HOME.
   Cortado de `_responsive.js` en s163, al llegar aquel a 1132 líneas: más del
   doble del límite de la regla nº 1 de CLAUDE.md, y el archivo donde más caro
   sale equivocarse (la trampa del backtick ha abortado el build en s139, s156,
   s157, s158 y s162).

   QUÉ HACE: construir, como CADENAS, los degradados y las máscaras que la hoja
   de `_responsive.js` interpola — el halo, el limbo, el bloom, el horizonte y
   las cuatro paradas de color de la hora. Aquí no hay ni una regla CSS: hay
   composición de valores. Se separó por eso, no por tamaño.

   QUÉ PUBLICA: `window.paceAtmosfera`, con los TRECE nombres que la hoja
   interpola y ni uno más (la lista se comprobó contra las 22 interpolaciones
   reales del template literal). Todo lo demás —`puedeMezclar`, `mezcla`,
   `conArco`, `dd`, `HORAS`, `LIMBO`, `BLOOM`, `RAMPA`…— es andamio interno y se
   queda dentro: si algún día la hoja necesita uno, se añade aquí a la vista.

   UN OBJETO Y NO TRECE GLOBALES a propósito: son piezas de UN mecanismo, y
   trece nombres sueltos en `window` compiten con el resto de la app por un
   espacio que ya tiene 445 inquilinos.

   ORDEN DE CARGA: ANTES de `_responsive.js`, que las desestructura EN EL CUERPO
   del módulo para armar su hoja. Si se invierte, la hoja se inyecta con
   `undefined` dentro de los degradados. */

(function paceAtmosferaCss() {
  if (typeof document === 'undefined') return;
  if (window.paceAtmosfera) return;

  /* ===================================================================
     EL SOL DE LA HOME (s158) · construcción de las dos capas de luz.

     El aro ES una fuente de luz y la home no lleva decoración permanente:
     lleva superficies que reflejan esa luz mientras hay sesión. Aquí se
     hornea el CSS de las dos capas; los dos números que las gobiernan
     (--pace-k la hora, --pace-i la intensidad, --pace-on el interruptor) los
     publica FocusTimer.

     UNA SOLA FUENTE DE COLOR PARA TODAS LAS CAPAS. Es la regla que sale del
     defecto de s157: allí la corona viajaba en color pero la luz de suelo
     llevaba el ámbar ESCRITO A FUEGO, y como el suelo era la capa de mayor
     superficie el resultado era que «el color siempre parece el mismo» —con el
     Pomodoro parado incluido—. Ninguna capa puede volver a llevar un tono
     propio: las dos consumen --pace-luz y --pace-nucleo y nada más.

     SE REUTILIZA EL MECANISMO DE s140, no se copia. `paceGrainUrl` vive en
     app/ui/SessionShell.jsx y es la fuente canónica del grano antibanding de
     este producto; carga ANTES que este archivo (PACE.html), así que aquí ya
     está en window y su resultado se hornea en la hoja. Y las proporciones de
     caída de `paceGlowRamp` (0,214 · 0,464 · 0,679 · 0,839 del recorrido) se
     respetan en las dos capas para no inventar una curva nueva que diverja de
     la de las sesiones a la primera corrección.

     POR QUÉ EL GRANO: sobre papel plano un degradado suave de esta amplitud
     BANDEA. El grano no tapa el escalón, lo ditherea. Va SIEMPRE multiplicado
     por la caída de su propia capa (mask-composite: intersect), o quedaría un
     rectángulo de ruido con borde duro donde la luz ya se ha apagado.
     =================================================================== */
  const puedeMezclar = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('background-image', 'radial-gradient(circle, color-mix(in srgb, red 50%, transparent) 0%, transparent 100%)');
  const grano = (typeof window.paceGrainUrl === 'function') ? window.paceGrainUrl() : 'none';

  /* LAS CUATRO HORAS. --pace-k viaja 0 -> 1 con el avance de la sesión y el
     tono se interpola en OKLAB, que es donde una mezcla azul->ámbar pasa por
     tonos creíbles en vez de por el gris muerto de sRGB.

       k = 0.00  amanecer    k = 0.38  mediodía
       k = 0.72  atardecer   k = 1.00  noche

     Los extremos son los DOS fríos del día y son tokens distintos: el frío del
     amanecer es azul con un punto rosa, el de la noche azul profundo. */
  const HORAS = [
    { core: 'var(--sun-dawn-core)', body: 'var(--sun-dawn-body)' },
    { core: 'var(--sun-noon-core)', body: 'var(--sun-noon-body)' },
    { core: 'var(--sun-dusk-core)', body: 'var(--sun-dusk-body)' },
    { core: 'var(--sun-night-core)', body: 'var(--sun-night-body)' },
  ];
  /* Recíprocos de la anchura de cada tramo (1/0.38, 1/0.34, 1/0.28) ya en
     porcentaje: el tramo consume su 100 % justo al llegar a la parada siguiente. */
  const TRAMOS = [[0, 263.16], [0.38, 294.12], [0.72, 357.14]];

  /* CLAMPEADO POR LOS DOS LADOS, y no es cinturón y tirantes. Un porcentaje
     NEGATIVO invalida el color-mix entero, y con él el degradado entero, y la
     capa simplemente no se pinta sin un solo aviso. Pasó en s157: con --pace-k
     por encima de 0,5 el primer tramo daba negativo y el aro se quedaba sin luz
     durante toda la sesión (medido: pico 0). */
  const peso = (desde, pendiente) => 'clamp(0%, calc(100% - (var(--pace-k, 1) - '
    + desde + ') * ' + pendiente + '%), 100%)';
  const puedeK = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('color', 'color-mix(in oklab, red ' + peso(0, 100) + ', blue)');
  /* La cadena se lee de dentro afuera: la mezcla del tramo 1 entra como primer
     término de la del tramo 2, y así. Con el peso a 100 % gana la parada de
     entrada; con 0 %, la de salida. */
  const cadena = (papel) => {
    let acc = HORAS[0][papel];
    for (let i = 0; i < TRAMOS.length; i++) {
      acc = 'color-mix(in oklab, ' + acc + ' ' + peso(TRAMOS[i][0], TRAMOS[i][1])
          + ', ' + HORAS[i + 1][papel] + ')';
    }
    return acc;
  };
  /* Sin oklab con calc, una hora fija y contenida: la app no se queda a oscuras
     ni pinta un color imposible. Atardecer, que es el más cercano a la paleta. */
  const LUZ = puedeK ? cadena('body') : HORAS[2].body;
  const NUCLEO = puedeK ? cadena('core') : HORAS[2].core;
  /* EL BORDE FRÍO. El aire dispersa el azul, así que el último tramo de la luz
     se enfría antes de morir: es lo que separa un degradado de un fenómeno
     atmosférico. NO son cuatro tokens más — el cuerpo se mezcla hacia un único
     tono frío, así que el borde sigue la hora por construcción y al anochecer,
     con la luz ya azul, la mezcla no hace nada. Que es justo lo correcto. */
  const BORDE = puedeMezclar
    ? 'color-mix(in oklab, ' + LUZ + ' 58%, var(--sun-rim))'
    : LUZ;

  /* Las paradas consumen --pace-luz y --pace-nucleo, REGISTRADOS con @property
     como <color>. Sin registrar, un custom property se sustituye como TEXTO y
     la cadena anidada de color-mix se vuelve a resolver en CADA parada de CADA
     degradado. Registrado, se computa una vez por elemento: solo eso bajó la
     suite de s157 de 1,3 min a 42 s. @property va en su propia hoja — dentro
     del bloque de reglas no se aplica. */
  if (puedeK && typeof CSS !== 'undefined' && CSS.registerProperty) {
    try {
      CSS.registerProperty({ name: '--pace-luz', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      CSS.registerProperty({ name: '--pace-nucleo', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      CSS.registerProperty({ name: '--pace-borde', syntax: '<color>', inherits: true, initialValue: 'transparent' });
      /* --pace-on se registra como <number> para poder TRANSICIONARLO: un custom
         property sin registrar salta de golpe, y con el salto el horizonte del
         aro se abriría en un frame. Registrado, la apertura viaja con la luz en
         los mismos 1,6 s. Se registra ESTE y no --pace-i, que cambia 30 veces
         por sesión: ver la nota de coste en FocusTimer. */
      CSS.registerProperty({ name: '--pace-on', syntax: '<number>', inherits: true, initialValue: 0 });
      /* --pace-pausado: el INTERRUPTOR de la pausa (0/1) con su PROPIA
         transicion de 500 ms. Lo que se interpola es esto; la PROFUNDIDAD sale
         del token --sun-pausa, que es distinto por paleta. Se registra para
         poder transicionarlo, y su initialValue 0 significa «no hay pausa».
         --pace-pausa es el factor ya resuelto que consumen las tres capas; se
         registra tambien para que compute a NUMERO —sin registrar, su valor
         computado seria el texto del calc y cualquier lectura tendria que
         reimplementar la formula. */
      CSS.registerProperty({ name: '--pace-pausado', syntax: '<number>', inherits: true, initialValue: 0 });
      CSS.registerProperty({ name: '--pace-pausa', syntax: '<number>', inherits: true, initialValue: 1 });
    } catch (e) { /* ya registrados */ }
  }

  const NUC = 'var(--pace-nucleo)';
  const CUE = 'var(--pace-luz)';
  const BOR = 'var(--pace-borde)';
  /* LA SOMBRA (s158) · lo que faltaba para que el modo CLARO alcance al oscuro.
     En oscuro el sol funciona porque la luz cae sobre un fondo oscuro y hay
     contraste a los DOS lados de la corona. En claro el papel ya es luminoso y
     sumar luz da poco: medido, al mediodía el pico se queda en 86 sobre 255
     aunque los tokens estén a 0,62 de alfa. La respuesta no es subir el alfa
     —eso satura y ensucia— sino RESTAR donde no hay sol, que es como se pinta
     la luz desde siempre.

     NO ES UNA CAPA APARTE, y el intento de que lo fuera es justo lo que lo
     enseñó: una sombra propia sobre el contenedor llegaba VIVA al borde que
     recorta (medido: 4 unidades a 2 px del borde), o sea la arista de s157 por
     tercera puerta. Aquí la sombra vive DENTRO de la caída de la luz, un poco
     por dentro del aro y un poco por fuera, así que muere exactamente donde
     muere la luz y no puede tocar ningún borde. Y de paso queda donde más
     rinde: pegada al brillo, que es donde el contraste local se percibe.

     En OSCURO el token vale transparente y todas estas paradas se apagan solas:
     ahí no hay nada que arreglar. */
  const SOMBRA = 'var(--sun-shade)';
  const mezcla = (p, tono) => puedeMezclar
    ? 'color-mix(in srgb, ' + tono + ' ' + p + '%, transparent)'
    : (p >= 45 ? tono : 'transparent');

  /* EL ARCO ENTERRADO TIÑE LA COLA (s159) · bajo el horizonte no hay tiempo,
     hay luz. El tramo de recorrido que queda tapado deja de ser un recorte mudo
     y cede su tono a la cola, que es lo que cierra la idea de que el aro no
     tiene una atmósfera sino que ES la fuente.

     SOLO EN LA COLA, y esto no es tibieza: s158 bajó la saturación de los
     tokens ~10 % justo porque el halo llegaba a leerse como una AMPLIACIÓN del
     arco. Teñir también el limbo reabriría ese defecto. El halo sigue siendo
     ambiente y el arco sigue siendo información; lo que se toca es el derrame
     de abajo, que es donde el arco está literalmente enterrado.

     El tono del arco entra a un peso MENOR que el de la parada base (el 0.55 de
     abajo) porque es un color OPACO y las paradas de la cola llevan alfa: a
     igual porcentaje subiría la presencia de la cola en vez de solo girarle el
     tono. El número sale de medir, no de estimar — ver la nota de calibración
     en la lista BLOOM. Fallback anidado: sin --pace-arco publicado (Caminos, o
     antes de la primera sesión) la mezcla es un no-op. */
  const ARCO = 'var(--pace-arco, ' + BOR + ')';
  const conArco = (p, base) => puedeMezclar
    ? 'color-mix(in oklab, ' + mezcla(p, base) + ' 75%, ' + mezcla(Math.round(p * 0.55), ARCO) + ')'
    : mezcla(p, base);

  /* ------------------------------------------------------------------
     CAPA 1 · LIMBO — la corona corta que abraza el aro por los 360°.

     De esto se quejó el usuario en s157: «es un sol raro, no da luz por todas
     sus partes». La causa era que había UNA sola capa, larga y direccional, y
     su máscara tenía que arrancar en cero por arriba para no chocar con el
     borde de [data-pace-home-body], que lleva overflow-y:auto y RECORTA. Medido
     en s158: entre el borde superior del aro y ese borde hay 59 px a 1280x720 y
     54 px a 320x640 (114-125 px en el resto). Una corona con el mismo alcance
     hacia arriba que hacia abajo NO CABE.

     La solución es partir la luz en dos: alcance CORTO donde hay poco sitio y
     simétrico en los 360°, y alcance largo solo hacia abajo, que es donde sobra
     espacio. El limbo muere a 0,615 D del centro, o sea a 0,115 D del borde del
     aro: 47 px con el aro de 406 px, por debajo de los 59 disponibles, y la
     proporción se mantiene en todos los breakpoints porque D y el hueco escalan
     juntos. Hacia dentro muere a 0,37 D, muy antes del número.

     Caja de 1,32 D (y no de 2 D como en s157): la corona ocupa una banda
     estrecha, y una caja del doble era un 58 % de área pintada de más para
     nada. EL ÁREA IMPORTA — §4 del plan. */
  const LIMBO_R = 0.66;   /* semilado de la caja, en unidades de D */

  /* Longitudes en unidades de D. Sube aquí desde más abajo (s184): las tres
     constantes de bordes que vienen a continuación la necesitan, y un `const`
     no se puede usar antes de declararlo. */
  const dd = (f) => 'calc(var(--pace-dial-d) * ' + f + ')';

  /* ==================================================================
     LOS CUATRO BORDES DE LA LUZ Y DEL ANILLO (s184). El usuario pidió que
     ninguno se leyera como un CORTE, y son el mismo problema en cuatro sitios:
     la luz no llega a la fila de minutos, pasa el horizonte y se apaga, la
     pista se disuelve y el arco solo se remata. Los números salen del banco
     (restar el mismo fotograma con el sol encendido y apagado), no de gusto, y
     viven juntos para poder moverse a la vez. El porqué completo, en
     `DECISIONES_TECNICAS_VIGENTES.md`.
     ================================================================== */
  const LUZ_TECHO = 0.52;   /* la luz muere a esta distancia del centro, hacia arriba */
  const LUZ_PLENO = 0.24;   /* y desde aquí ya está a pleno */
  const LUZ_COLA  = 0.22;   /* cuánto sigue la luz por debajo del horizonte */
  /* DOS NIEBLAS, Y LA DIFERENCIA ENTRE ELLAS ES UN ARREGLO. Hubo una sola,
     larga, sobre la capa del anillo entero — y como el arco NACE en el
     horizonte, justo donde esa máscara vale cero, tardaba **~2,2 min** en llegar
     a plena opacidad en un bloque de 25 (medido a 1280×800): los primeros
     minutos no tenían señal. El reparto sale de una frase que ya estaba en
     `tokens.css`, **arco = información, halo = ambiente**: la escala puede
     disolverse todo lo que haga falta; el recorrido no puede desaparecer. */
  const NIEBLA_PISTA = 0.14;   /* la escala se disuelve */
  const NIEBLA_ARCO  = 0.035;  /* el recorrido solo se remata */
  /* CON CURVA, NO LINEAL: la recta cae uniforme y pierde el tramo útil antes.
     Así se mantiene el 94 % de presencia en tres cuartas partes del recorrido.
     Pares [fracción del recorrido desde el horizonte hacia arriba, alfa]. */
  const CURVA_NIEBLA = [[1, 1], [0.72, 0.94], [0.46, 0.74], [0.26, 0.44], [0.12, 0.18], [0, 0]];
  /* EL TECHO, TAMBIÉN CON CURVA, y esto es un defecto que el usuario vio: «la
     parte de arriba queda demasiado difusa y con una línea de corte». La rampa
     recta de tres paradas metía un CODO en 0,24 D donde la pendiente cambia unas
     cuatro veces, y el ojo encuentra un quiebre de pendiente igual que encuentra
     un borde — la misma razón por la que el limbo lleva ONCE paradas y no cinco.
     Esta S entra despacio desde el cero y se posa en `--sun-top` sin esquina, y
     en el tramo medio pesa MÁS que la recta (0,66 contra 0,51 a 0,32 D): eso es
     lo que quita lo difuso sin devolver luz a la fila de minutos.
     Pares [distancia al centro en D, alfa]. */
  const CURVA_TECHO = [[0.520, 0], [0.505, 0.06], [0.488, 0.16], [0.455, 0.36],
                       [0.400, 0.56], [0.330, 0.68]];
  /* Paradas en % del radio de la caja, con su color y su valor de máscara. La
     máscara sale de la MISMA lista que el color: no pueden desincronizarse, que
     es como s157 acabó con un grano cuadrado sobre una luz redonda.

     ONCE PARADAS Y NO CINCO, y el motivo es que con pocas la corona se leía
     como un TRAZO de rotulador alrededor del aro en vez de como luz: el ojo
     encuentra el borde exterior en cuanto la caída es corta. Las de dentro
     entran muy bajas para que haya un lavado suave a través del aro sin que el
     número deje de estar sobre papel (lo mide el banco, no se estima). */
  /* Los porcentajes son del RADIO de la caja (semilado 0,66 D), y la columna de
     la derecha traduce cada uno a radios del aro para poder razonar. Dos datos
     medidos gobiernan el reparto y no se pueden mover de memoria:
       · la caja del NÚMERO llega a 0,325 D del centro (esquina incluida);
       · el trazo del anillo cae en 0,475 D (R=47.5 en un viewBox de 100).
     La sombra interior vive ENTRE los dos, y la luz nace justo sobre el trazo:
     su borde interior queda escondido bajo la propia línea del aro. La primera
     versión metía la sombra hasta 0,31 D y la desviación sobre el número se fue
     a 24 sobre 255 — el número dejaba de estar sobre papel. */
  const LIMBO = [
    ['30.3%', 'transparent', 'rgba(0,0,0,0)'],            /* 0,200 D */
    ['66.0%', 'transparent', 'rgba(0,0,0,0)'],            /* 0,436 D */
    ['71.0%', mezcla(30, NUC), 'rgba(0,0,0,0.30)'],       /* 0,469 D · bajo el trazo del aro */
    ['76.5%', NUC, '#000'],                               /* 0,505 D */
    ['80.0%', CUE, '#000'],                               /* 0,528 D */
    ['85.0%', mezcla(62, CUE), 'rgba(0,0,0,0.62)'],       /* 0,561 D */
    ['88.8%', mezcla(32, BOR), 'rgba(0,0,0,0.32)'],       /* 0,586 D · empieza a enfriarse */
    ['92.0%', mezcla(14, BOR), 'rgba(0,0,0,0.14)'],       /* 0,607 D */
    ['95.2%', 'transparent', 'rgba(0,0,0,0)'],            /* 0,628 D · 47 px pasado el aro */
  ];
  /* EL LIMBO NO LLEVA SOMBRA, y las dos veces que lo intenté lo dijeron los
     números y la vista:
       · por DENTRO no cabe. Entre el número (0,325 D) y el trazo (0,475 D) hay
         57 px, y una sombra ahí sale forzosamente como una banda estrecha: se
         leía como un SEGUNDO ARO GRIS, el mismo defecto que veníamos de quitar.
         Metida un poco más adentro, la desviación sobre el número se fue a 24.
       · por FUERA tampoco. Ensanchar la cola hasta que la sombra se note son
         ~77 px pasado el aro, y arriba solo hay 59 hasta el borde que recorta.
     Donde SÍ hay sitio es a los lados y abajo, que es justo el campo del bloom
     y justo donde la home tiene papel vacío. Por eso la sombra vive allí. */
  /* farthest-side, NO el farthest-corner por defecto: en una caja cuadrada el
     100 % cae en la DIAGONAL y todas las paradas se van a 1,41x de su sitio —la
     corona rellenaba el disco, medido en s157 como un perfil radial plano. */
  const limboCon = (i) => 'radial-gradient(circle farthest-side, '
    + LIMBO.map(p => p[i] + ' ' + p[0]).join(', ') + ')';

  /* LA LUZ MUERE ANTES DE LA FILA DE MINUTOS (s184), y esto ATENÚA ya no basta.

     Aquí había una rampa que bajaba la mitad superior de la corona a --sun-top
     (0,72) «sin cortar, el círculo sigue completo», con esta premisa escrita al
     lado: por encima del aro hay ~59 px hasta la fila de minutos. ESA PREMISA
     YA NO SE CUMPLE. Medido hoy a 1280x800: el borde superior del aro cae en
     y=167,1 y la píldora «45» acaba en y=142,6 — quedan 24,5 px, no 59. Y el
     limbo muere a 0,628 D del centro, o sea 64 px pasado el aro. Fotografiando
     el mismo fotograma con el sol encendido y apagado, la fila de minutos
     recibía una desviación de 57 sobre 255: la corona la estaba pintando.

     Atenuar al 72 % no arregla eso, porque 0,72 nunca es 0. Así que la rampa
     pasa a MORIR: transparente por encima de 0,52 D del centro, y de ahí hacia
     abajo sube hasta el hombro de --sun-top en 0,24 D. Son 0,28 D de recorrido
     —118 px con el aro de 420—, tan gradual que no hay borde que encontrar.

     LO QUE CUESTA ES CASI NADA, Y ESTÁ MEDIDO: el brillo justo por encima del
     trazo del aro baja de 64 a 58 sobre 255, porque el NÚCLEO de la corona vive
     entre 0,505 y 0,528 D —pegado al aro— y lo que se recorta es la COLA, que
     es la que llegaba a los chips. El halo sigue rodeando el recorrido entero,
     las 12 incluidas; lo que desaparece es el lavado ancho hacia arriba.
     Fila de minutos: 57 -> 1. Uno sobre 255 no se ve.

     El BLOOM no necesita nada de esto: su máscara direccional ya vale cero por
     encima de 0,5 D del centro. Esta rampa es solo del limbo. */
  const menosArriba = 'linear-gradient(180deg, transparent 0px, '
    + CURVA_TECHO.map(function (p) {
        return 'rgb(0 0 0 / ' + p[1] + ') ' + dd((LIMBO_R - p[0]).toFixed(4));
      }).join(', ')
    + ', rgb(0 0 0 / var(--sun-top, 1)) ' + dd((LIMBO_R - LUZ_PLENO).toFixed(4))
    + ', #000 68%)';

  /* ------------------------------------------------------------------
     CAPA 2 · BLOOM — el derrame amplio, solo hacia abajo.

     Nace EN EL HORIZONTE (la misma línea por la que --pace-horizon recorta el
     aro) y se derrama hasta el Camino sugerido, por detrás de Actividades y de
     la tarjeta. Es la capa que convierte la corona en «una hora del día».

     Radios EXPLÍCITOS en unidades de D en vez de un keyword: así no hay que
     razonar sobre farthest-side ni farthest-corner, y sobre todo la luz llega a
     transparente DENTRO de su caja. Comprobado a mano en los seis breakpoints:
     0,60 D hacia abajo desde el horizonte contra 0,5 D + el propio horizonte de
     margen disponible. Una luz no puede acabar donde acaba su caja — las dos
     aristas rectas de s157 fueron exactamente eso. */
  /* `dd` se declaraba aquí; subió junto a LIMBO_R en s184 porque las constantes
     de bordes la necesitan antes. */
  /* EL BLOOM COMPARTE EL CENTRO DEL ARO. No es un detalle de implementación: es
     el defecto que el usuario vio como «una especie de círculo en la zona de
     pausar, ciclo, actividades, que no corresponde al sol». Con el centro en el
     HORIZONTE, el bloom tenía SILUETA PROPIA —una cúpula— y su canto superior
     cruzaba justo por ahí. Bisecado apagando cada capa por separado: el limbo
     salía limpio y la cúpula era del bloom.

     Compartiendo centro, el bloom deja de ser una forma y pasa a ser la
     CONTINUACIÓN del limbo hacia fuera: empieza transparente por dentro del
     aro, donde el limbo aún manda, y solo la máscara direccional decide cuánta
     de esa continuación se ve en cada altura. Un solo campo de luz, sin
     segundo contorno posible. */
  const BLOOM_W = 2.2;      /* ancho de la caja, en unidades de D */
  const BLOOM_H = 1.42;     /* alto de la caja */
  const BLOOM_SUBE = 0.36;  /* fracción de su propio alto que se sube */
  const BLOOM_R = 0.84;     /* radio de la luz, desde el centro del aro */
  /* EL ALTO Y EL RADIO SALEN DE UNA MEDIDA, no de gusto: el hueco entre el
     CENTRO del aro y el borde inferior de [data-pace-home-body] es de 0,96 D en
     el peor breakpoint (1280x720 y 1440x900; en el resto va de 1,13 a 1,38 D).
     La caja acaba en cy + 0,909 D y la luz muere en cy + 0,84 D, así que ni la
     una ni la otra desbordan NUNCA el contenedor de scroll — y por eso no hace
     falta recortar nada. Con 2,0 y 1,05 la caja acababa 126 px por debajo del
     borde y eso era scroll: la home se podía arrastrar hacia la nada.
  /* Desde el borde SUPERIOR de la caja: el centro del aro cae en BLOOM_H*SUBE,
     su borde superior media D antes y el horizonte media D después menos el
     propio horizonte. Todo sale de los mismos dos tokens que gobiernan el aro. */
  const DESDE_ARRIBA = (extra, conHorizonte) => 'calc(var(--pace-dial-d) * '
    + (BLOOM_H * BLOOM_SUBE + extra).toFixed(3) + (conHorizonte ? ' - var(--pace-corte))' : ')');
  /* Radios del aro entre paréntesis (el radio de la luz es 1,05 D). La sombra
     ocupa los 81 px finales: ancha de sobra para no leerse como un aro, y
     colocada donde la máscara direccional la deja caer — a los lados del aro y
     por debajo, nunca por encima. En OSCURO estas tres paradas se apagan solas
     porque --sun-shade vale transparente. */
  /* LA COLA ES LARGA A PROPOSITO, y esto es el arreglo del defecto que el
     usuario vio: la luz llegaba VIVA al borde superior de la tarjeta de Camino
     y debajo no habia nada, asi que el canto de la tarjeta se leia como una
     frontera horizontal de lado a lado — brutal en movil, donde la tarjeta sube
     por encima del aro y ocupa el ancho entero. Medido: 25,7 de desviacion en
     la fila de encima y 0,1 en la de debajo.
     Ahora la luz sigue teniendo presencia a 0,71 D y no muere hasta 0,84 D, o
     sea que REAPARECE por debajo de la tarjeta antes de extinguirse. El canto
     deja de existir porque a los dos lados de la tarjeta hay luz. */
  const BLOOM = [
    ['0%', 'transparent', 'rgba(0,0,0,0)'],
    ['44%', 'transparent', 'rgba(0,0,0,0)'],              /* 0,370 D */
    ['50%', mezcla(45, CUE), 'rgba(0,0,0,0.45)'],         /* 0,420 D */
    ['58%', CUE, '#000'],                                 /* 0,487 D */
    ['74%', mezcla(60, CUE), 'rgba(0,0,0,0.60)'],         /* 0,622 D */
    /* LA COLA, ALARGADA EN s159 (M4) · 0,30 -> 0,50 y 0,12 -> 0,28.
       No se toca el RADIO ni la CAJA: sube el peso de las dos paradas finales y
       nada más. Esa distinción es lo que garantiza que no vuelva el scroll —la
       geometría que lo causaba sigue exactamente igual— y a la vez recupera la
       integración que la contención de s158 se había llevado por delante: en
       escritorio la luz llegaba a la banda de Actividades con 0,75 de desviación
       y la cola moría justo en el canto de la tarjeta de Camino.
       Nivel elegido MIRANDO las tres variantes a tamaño real: de la primera
       versión de la atmósfera el usuario echaba de menos «el reflejo que dejaba
       debajo de los chips de Mueve y Estira, aunque mucho más suave». Este es
       ese reflejo recortado — la variante intermedia, no la de aquella versión,
       que se comparó al lado y quedó descartada por dominante.
       El encargo es recuperar INTEGRACIÓN, no protagonismo. */
    ['85%', conArco(50, BOR), 'rgba(0,0,0,0.50)'],        /* 0,714 D · se enfría */
    ['92%', conArco(28, BOR), 'rgba(0,0,0,0.28)'],        /* 0,773 D */
    ['96%', mezcla(16, SOMBRA), 'rgba(0,0,0,0.16)'],      /* 0,806 D */
    ['100%', 'transparent', 'rgba(0,0,0,0)'],             /* 0,840 D */
  ];
  const bloomCon = (i) => 'radial-gradient(circle ' + dd(BLOOM_R)
    + ' at 50% ' + (BLOOM_SUBE * 100).toFixed(0) + '%, '
    + BLOOM.map(p => p[i] + ' ' + p[0]).join(', ') + ')';

  /* LA DIRECCIONALIDAD, en una máscara lineal LARGA. Vale cero justo en el
     BORDE SUPERIOR DEL ARO y uno en el horizonte: media vuelta de aro para
     subir, ~340 px, tan gradual que no hay canto que ver. Que valga cero
     exactamente arriba es lo que mantiene el techo donde estaba — por arriba
     solo llega el limbo, y son 59 px los que hay hasta el borde que recorta.
     Las dos máscaras se INTERSECAN: la lineal sola dejaría un rectángulo de
     grano en toda la mitad baja de la caja. */
  const direccion = 'linear-gradient(180deg, transparent 0px, '
    + 'transparent ' + DESDE_ARRIBA(-0.5, false) + ', '
    + 'rgba(0,0,0,0.34) calc(var(--pace-dial-d) * ' + (BLOOM_H * BLOOM_SUBE).toFixed(3)
    + ' - var(--pace-corte) * 0.5), '
    + '#000 ' + DESDE_ARRIBA(0.5, true) + ')';

  /* EL HORIZONTE del anillo: UN CORTE SECO, y ya no hay nada que abrir (s184).

     HISTORIA CORTA, porque este bloque ha ido y vuelto. Hasta v0.89.0 cortaba
     en seco. s158 lo convirtió en un desvanecido que la sesión ABRÍA
     (--pace-abre), para que el arco COMPLETASE los 360 hundiéndose en la luz.
     Ese encargo ya no existe: en s184 el arco dejó de bajar, así que la apertura
     se quedó sin nada que atenuar y --pace-abre se retiró (no tenía otro
     consumidor). Lo que NO se toca es --pace-arco: el tono sigue tiñendo la cola
     del bloom (s159), y eso depende de qué hora es, no de que haya arco
     enterrado.

     Y NO ES UN FILO, ES NIEBLA. El corte seco duró lo que tardó en verse: los
     cabos se leían amputados. El degradado no salta de opaco a transparente,
     recorre la niebla de arriba y llega a cero JUSTO en el horizonte. Sigue sin
     haber luz por debajo y sigue sin depender de la sesión: lo único que cambia
     respecto del corte es que el anillo ENTRA en ella en vez de chocar. */
  const nieblaCon = (largo) => 'linear-gradient(180deg, #000 0px, '
    + CURVA_NIEBLA.map(function (p) {
        return 'rgb(0 0 0 / ' + p[1] + ') calc(100% - var(--pace-corte) - '
          + dd((largo * p[0]).toFixed(4)) + ')';
      }).join(', ') + ')';
  /* La del ANILLO es la del arco: es la capa que envuelve arco y punto guia.
     La de la PISTA se aplica ADEMAS a su propia capa, anidada dentro, asi que
     las mascaras se multiplican -- y como la corta ya vale 1 muy pronto, lo que
     la pista experimenta es practicamente la larga. */
  const horizonte = nieblaCon(NIEBLA_ARCO);
  const horizontePista = nieblaCon(NIEBLA_PISTA);

  /* LA COLA DE LA LUZ — el tercero de los bordes de s184.

     El halo no puede acabar en el horizonte con un filo: sería la arista recta
     que s157 persiguió media sesión. Pero tampoco puede seguir como si no
     hubiera horizonte, porque entonces el anillo ocupa 271 grados y su luz da la
     vuelta entera, que es justo lo que el usuario no quiere. La salida es que la
     luz PASE del horizonte y se apague: a pleno hasta él, muerta 0,22 D más
     abajo (92 px con el aro de 420).

     Cada capa lo mide desde SU borde superior, porque sus cajas no coinciden: el
     limbo está centrado en el aro y el bloom sube un 36 % de su propio alto. De
     ahí el parámetro, que es la distancia de ese borde al CENTRO del aro, en D.
     Medido tras aplicarlo: 30 sobre 255 a 60 px por debajo del horizonte (era
     79) y 0 al pie de Actividades (era 31). */
  const colaEn = (centro) => 'linear-gradient(180deg, #000 0px, '
    + '#000 calc(' + dd((centro + 0.5).toFixed(4)) + ' - var(--pace-corte)), '
    + 'transparent calc(' + dd((centro + 0.5 + LUZ_COLA).toFixed(4)) + ' - var(--pace-corte)))';
  const colaLimbo = colaEn(LIMBO_R);
  const colaBloom = colaEn(BLOOM_H * BLOOM_SUBE);

  /* Los DIECISEIS que cruzan. El resto es andamio y no sale de esta IIFE. */
  window.paceAtmosfera = {
    LUZ, NUCLEO, BORDE, horizonte, grano,
    horizontePista,
    LIMBO_R, limboCon, menosArriba, colaLimbo,
    BLOOM_W, BLOOM_H, BLOOM_SUBE, bloomCon, direccion, colaBloom,
  };
})();
