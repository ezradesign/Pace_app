/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   CSS responsive global del shell (sesion 82 / v0.33.2).
   Inyecta <style id="pace-main-responsive-css"> una sola vez al cargar.
   Extraido literal de main.jsx (lineas 20-112) en split mecanico s82.

   Reglas:
   - [data-pace-app-root]: alto 100vh con fallback dvh (iOS pre-15.4).
   - TopBar: reduce padding lateral y ancho de tabs en movil; oculta tabs <=768px.
   - Main content: padding reducido en movil.
   - ActivityBar: pasa de fila flex a grid 2x2 en movil; chips compactos.
   - Handle flotante ≡ del sidebar: hit target 44x44 en movil.
   - @media max-height:720: oculta sub-labels de ActivityBar.

   Carga ANTES de main.jsx en PACE.html (es config de layout, no componente).
   No expone nada a window: el side effect es la inyeccion del style block.
*/

(function injectPaceMainResponsiveCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-responsive-css')) return;

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

  /* MENOS LUZ ARRIBA, SIN DEJAR DE SER UN CÍRCULO. Por encima del aro solo hay
     ~59 px hasta la fila de minutos, y ahí la corona competía con los chips. La
     caída es una rampa vertical que cruza la caja ENTERA del limbo (1,32 D, o
     sea 536 px con el aro de 406): un 0,05 % por píxel, demasiado lenta para
     que el ojo encuentre un borde. Por eso atenúa sin cortar — el círculo sigue
     completo, solo que su mitad de arriba pesa --sun-top.
     Se INTERSECA con la máscara del anillo, igual que hace el bloom: la
     vertical sola dejaría el grano fuera de la corona. */
  const menosArriba = 'linear-gradient(180deg, rgb(0 0 0 / var(--sun-top, 1)) 0%, #000 68%)';

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
  const dd = (f) => 'calc(var(--pace-dial-d) * ' + f + ')';
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
    + (BLOOM_H * BLOOM_SUBE + extra).toFixed(3) + (conHorizonte ? ' - var(--pace-horizon))' : ')');
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
    + ' - var(--pace-horizon) * 0.5), '
    + '#000 ' + DESDE_ARRIBA(0.5, true) + ')';

  /* EL HORIZONTE del anillo, y AHORA ES EL SOL EL QUE LO ABRE.

     Con el Pomodoro parado el aro vuelve a cortarse EN SECO en el horizonte,
     como hasta v0.89.0: sin sesión no hay luz, así que tampoco hay motivo para
     que el aro se abra. Con la sesión viva el corte se desvanece y el arco
     completa los 360 grados. Todo cuelga de --pace-on, así que la apertura viaja
     con la luz en los mismos 1,6 s y no hay un solo frame de salto.

     --pace-abre es --pace-on tal cual: a media pausa el aro sigue abierto del
     todo, porque pausar no termina la sesión. Y la RAMPA también se
     multiplica por él: con la luz apagada mide 0 px, o sea las tres paradas
     caen en el mismo sitio y el degradado ES un corte seco. Sin eso quedaría un
     desvanecido de 20 px en reposo, que no es lo que se pidió. */
  const RAMPA = 'calc(' + dd(0.05) + ' * var(--pace-abre))';
  const horizonte = 'linear-gradient(180deg, #000 0px, '
    + '#000 calc(100% - var(--pace-horizon) - ' + RAMPA + '), '
    + 'rgb(0 0 0 / calc(0.62 * var(--pace-abre))) calc(100% - var(--pace-horizon)), '
    + 'rgb(0 0 0 / calc(0.34 * var(--pace-abre))) calc(100% - var(--pace-horizon) + ' + RAMPA + '), '
    + 'rgb(0 0 0 / calc(0.30 * var(--pace-abre))) 100%)';

  const s = document.createElement('style');
  s.id = 'pace-main-responsive-css';
  s.textContent = `
    /* Alto del contenedor raíz: 100vh de fallback + 100dvh en navegadores
       modernos. 100dvh (dynamic viewport height) se recalcula cuando la
       barra de URL móvil aparece/desaparece, así que la app siempre
       encaja en el espacio real visible en vez de quedarse atada al
       alto máximo (con URL oculta) como hace 100vh. En desktop 1920×1080
       100dvh === 100vh — cero impacto. Fallback garantiza que navegadores
       antiguos (pre-iOS 15.4 / Chrome 107 / Firefox 100) siguen usando vh.
       Sesión 23 · v0.12.6. */
    [data-pace-app-root] {
      height: 100vh;
      height: 100dvh;
      max-height: 100vh;
      max-height: 100dvh;
    }
    /* QUÉ PIEL ESTÁ PUESTA (s160). La declara la hoja que YA tiene el
       breakpoint, y main.jsx la lee para renderizar cada piel en su orden
       canónico del DOM. Se publica aquí y no como una tercera copia del
       "769px" en JavaScript por la razón de siempre en este archivo: dos
       fuentes de verdad divergen a la primera corrección. Leyéndola de la
       hoja, el orden del DOM y el orden visual no pueden desincronizarse
       aunque alguien mueva el breakpoint, porque los mueve a la vez.
       Móvil es el valor por defecto: si esta hoja no llegara a aplicarse,
       el DOM se queda en el orden que tenía antes de s160. */
    :root { --pace-skin: movil; }
    /* Modelo "atardecer" de la HOME (s123). El tamaño del aro y la profundidad
       del solapamiento derivan de UNA sola variable, para que la tarjeta de
       Camino cruce SIEMPRE el tramo inferior del aro (nunca un gate binario que
       lo apague en pantallas bajas).

       Tamaño del aro: por ANCHO y ALTURA, con un MÍNIMO legible GENEROSO. NO se
       encoge agresivamente para que toda la home entre en pantalla — en alturas
       bajas se prefiere SCROLL vertical (data-pace-home-body). 58vh mantiene el
       aro grande (identidad "sol") sin que domine; el suelo de 300px evita que se
       vuelva diminuto; 86vw/520px son los topes de ancho y absoluto de siempre.

       Solapamiento "atardecer": ADAPTATIVO, aplicado como margin-top NEGATIVO a
       la tarjeta (ver SuggestedPathCard). Llega hasta el 19% del diámetro donde
       hay holgura (aros grandes), pero se LIMITA por el arco decorativo real bajo
       las bolas en aros pequeños para no tapar nunca el CICLO. El contenido del
       aro (modeLabel+número+subtítulo+CTA+bolas) mide ~224-250px casi fijo, así
       que el arco bajo las bolas = (diámetro - ~244)/2; el solapamiento = ese
       arco menos 6px de holgura, o el 19% si es menor. Progresivo por
       construcción: más aro => más atardecer (amplio arriba, mínimo pero visible
       abajo), garantizando >=8px de holgura bajo las bolas en todo el rango. El
       suelo de 6px evita hueco en anchos extremos (<~270px).

       Fallback vh -> dvh vía @supports: los custom properties NO admiten el
       patrón de doble declaración (una var inválida por dvh no cae a la anterior,
       queda "invalid at computed value time"), así que se re-declara bajo
       @supports (height:1dvh). Solo la home lleva estas variables y
       [data-pace-dial-fit]; Caminos conserva el marco clásico. */
    [data-pace-home-body] {
      --pace-home-timer-size: min(86vw, 520px, max(300px, 58vh));
      --pace-home-sunset-overlap: max(6px, min(calc(var(--pace-home-timer-size) * 0.19), calc((var(--pace-home-timer-size) - 244px) / 2 - 6px)));

      /* ==== RESOLUCIÓN ÚNICA (s156) ====================================
         Estas dos son las que consume TODO el mundo. Aquí, y solo aquí, se
         decide quién manda: el motor (app/main/home-geometry.js) si ya ha
         publicado, y el fallback CSS si no.

         Antes cada consumidor traía su propio fallback y no coincidían: el
         Desktop caía a un 360px escrito a mano, el móvil al clamp de arriba,
         la tarjeta a la estimación «atardecer» y el recorte del aro a 0px.
         Con el motor apagado eso producía dos geometrías distintas por piel y,
         peor, ROMPÍA el invariante que este archivo declaraba: a 390×844 la
         tarjeta subía 39,7 px sobre un aro SIN recortar. Medido en s156.

         Ahora recorte y solapamiento salen del MISMO token, así que la frase
         «no pueden desincronizarse» pasa a ser cierta por construcción. */
      --pace-dial-d: var(--pace-timer-d, var(--pace-home-timer-size));
      --pace-horizon: var(--pace-activities-overlap, var(--pace-home-sunset-overlap));
    }
    @supports (height: 1dvh) {
      [data-pace-home-body] {
        --pace-home-timer-size: min(86vw, 520px, max(300px, 58dvh));
      }
    }
    [data-pace-dial-fit] {
      width: auto;
      /* EL TAMAÑO DEL ARO NO SE TRANSICIONA JAMÁS (s160). No es estética: es la
         condición para que el motor pueda MEDIRLO.

         El kill de prefers-reduced-motion (tokens.css) pone transition-duration
         en 0,01 ms sobre todo lo que no sea esencial, y como el valor inicial de
         transition-property es "all", eso convierte CUALQUIER cambio de
         geometría en una transición. El valor de una transición aterriza en un
         frame POSTERIOR, y home-geometry.js aplica D y mide en la MISMA tarea:
         bajo reduced-motion medía siempre el tamaño anterior, el bucle encogía a
         ciegas, disparaba su propio guard de s156 y salía con el techo por ancho
         — el aro de 420 px y los 11 px de scroll a 1280x720, deuda desde s156.

         Medido: con el bucle síncrono el desbordamiento se quedaba clavado en 11
         mientras D bajaba de 420 a 322 (los números exactos que s156 anotó sin
         explicar); con esta línea converge en dos pasadas a 406, igual que sin
         reduced-motion. Y la prueba de que era una transición y no otra cosa:
         dial.getAnimations() devolvía "height:running" y un height en línea con
         !important NO ganaba — en la cascada solo una transición viva puede.

         Sin reduced-motion no cambia nada: ahí la duración ya era 0 s. No toca
         los pseudoelementos (::before lleva el halo del amanecer y
         transition-property no se hereda), ni las animaciones, ni el fundido de
         la luz, que viaja por --pace-on sobre [data-pace-home-body]. */
      transition-property: none;
      /* s128: el aro lo dimensiona el motor (home-geometry.js) también en móvil.
         s156: por --pace-dial-d, que ya resuelve motor-o-fallback arriba. En
         Desktop este height lo pisa el bloque min-width:769px con !important
         (mismo valor, distinta especificidad). */
      height: var(--pace-dial-d);
      /* HORIZONTE en móvil/tablet (s128): el aro se RECORTA por abajo en la línea
         donde sube la tarjeta de Camino — el "amanecer" del Desktop (s126) pero con
         Caminos. Reutiliza --pace-activities-overlap (que el motor mide desde el
         CICLO real) → recorte y solapamiento nunca se desincronizan. Recorta el
         MARCO (no el <svg>, que va rotado) y cubre el halo ::after. Con la var sin
         definir (pre-JS) el inset es 0 → aro entero, sin recorte. En Desktop lo
         pisa el bloque min-width:769px (mismo valor). Caminos NO lleva
         [data-pace-dial-fit] → intacto. s156: por --pace-horizon, el MISMO token
         que sube el bloque de abajo — no hay dos fallbacks que puedan divergir.
         s158: el horizonte pasa del clip-path a la máscara de abajo. */
    }
    /* Y LOS CUATRO DE DENTRO, POR LA MISMA RAZÓN Y UN NIVEL MÁS ABAJO (s160).
       applyD() no mide solo el aro: mide dónde acaba el CICLO DENTRO del aro
       para anclar ahí las Actividades. Esos cuatro nodos llevan márgenes y
       tamaños derivados de --pace-timer-d, así que bajo reduced-motion también
       se volvían transiciones y el CICLO se medía en su sitio ANTERIOR: con el
       aro ya corregido a 406 px, el solapamiento salía en 61 px en vez de 65 y
       la home se quedaba con 3 px de scroll en lugar de encajar. Se nombran uno
       a uno y NO se usa un selector de descendencia: dentro del aro vive el CTA,
       cuya transición de hover es legítima y no se toca. */
    [data-pace-dial-fit] [data-pace-dial-label],
    [data-pace-dial-fit] [data-pace-dial-number],
    [data-pace-dial-fit] [data-pace-dial-subtitle],
    [data-pace-dial-fit] [data-pace-dial-divider] {
      transition-property: none;
    }
    /* ===================================================================
       EL HORIZONTE (s158) — de corte seco a desvanecido.

       OJO AL EDITAR: esto vive DENTRO del template literal de la hoja. Un solo
       backtick aqui aborta el build — paso tres veces en s157 y una mas en
       s158, escribiendo justo este comentario.

       Hasta v0.89.0 esto era un clip-path con inset inferior --pace-horizon
       sobre el MARCO, y el comentario del bloque Desktop registraba que el
       corte duro era deliberado (= v0.64): un desvanecido dejaría «arco y punto
       atenuados flotando en la banda transparente, a los lados de
       ACTIVIDADES». El usuario ha pedido probar justamente eso, ahora que hay
       luz: que el arco de recorrido se COMPLETE los 360 grados aunque pase por
       detrás de los chips, hundiéndose en la luz en vez de desaparecer. Si al
       verlo no convence, la vuelta atrás es una sola parada: llevar el último
       tramo a transparente y el arco vuelve a cortarse.

       LA MISMA MÁSCARA RESUELVE LAS DOS COSAS QUE PIDIÓ. Por debajo del
       horizonte queda el 30 %: el arco es una línea saturada de 1,3 de grosor y
       a ese 30 % se sigue leyendo; el track es --line al 0,85 de opacidad y a
       ese 30 % desaparece. No hacen falta dos mecanismos.

       POR QUÉ EN [data-pace-dial-ring] Y NO DONDE ESTABA. En el <svg> no puede
       ir: uno de los dos va rotado -90deg y la máscara rotaría con él (un
       degradado vertical se volvería horizontal). En el MARCO tampoco: contiene
       el número, el CTA y el CICLO, y los desvanecería con el anillo.

       --pace-horizon es el MISMO token que sube el bloque de abajo, así que
       horizonte y solapamiento siguen sin poder desincronizarse.
       =================================================================== */
    [data-pace-dial-fit] [data-pace-dial-ring] {
      -webkit-mask-image: ${horizonte};
      mask-image: ${horizonte};
    }
    /* ===================================================================
       EL SOL DE LA HOME (s158) — REEMPLAZA la atmósfera de s156 y la de s157.

       EL MODELO: el aro no TIENE una atmósfera, el aro ES una fuente de luz.
       La home no lleva decoración permanente; lleva superficies que reflejan
       esa luz. La hora del día la marcan los segundos del Pomodoro.

       POMODORO PARADO = CERO ATMÓSFERA. No es «frío y tenue»: es NADA. La home
       en reposo queda limpia, sin halo de ningún color, porque --pace-on vale 0
       y las dos capas se apagan enteras. Por eso desaparece el apagado por
       animación a los 5 minutos de s157, que se diseñó para un reposo CON luz.

       QUÉ FALLABA ANTES.
       · s156 metía la luz DENTRO del marco del aro: un radial cuyo máximo caía
         detrás del número (28,6 de desviación en el centro, 0 en el borde: una
         MANCHA), y como el marco lleva clip-path moría en una arista recta.
       · s157 sacó la luz del recorte pero dejó el ámbar ESCRITO A FUEGO en la
         capa de suelo, la de mayor superficie: de ahí «se ve halo con el
         Pomodoro parado» y «el color siempre parece el mismo». Y su corona
         única tenía que morir por arriba para no chocar con el borde que
         recorta, de ahí «es un sol raro, no da luz por todas sus partes».

       QUÉ HACE AHORA: dos capas, y las DOS beben del mismo par de tokens.
       1. LIMBO — corona corta y simétrica en los 360 grados, que abraza el aro.
       2. BLOOM — derrame amplio y direccional, solo hacia abajo, naciendo en el
          horizonte y llegando al Camino sugerido.
       Alcance largo solo donde hay sitio; ver la nota de los 59 px arriba.

       SOLO PINTAN FONDOS. Las dos viven en z-index 0 dentro de
       [data-pace-timer-wrap]; las pills, la tarjeta, los chips y el texto van
       por encima y no se tiñen. El interior del aro tampoco: el limbo muere
       hacia dentro muy antes del número y la máscara del bloom es cero por
       encima del centro del aro.

       EL ESTADO NUNCA SE COMUNICA SOLO CON ESTO — el número, el texto del CTA y
       «Reiniciar bloque» ya lo dicen. La luz solo lo acompaña.
       =================================================================== */
    /* LA LUZ SE DECLARA EN LA HOME ENTERA, no en el contenedor del aro: desde
       s158 también la consumen los chips de Actividades y la tarjeta de Camino,
       que son HERMANOS del bloque del temporizador. Los dos numeros de los que
       depende los publica FocusTimer en ESTE MISMO nodo,
       por el mismo motivo. Una sola fuente para toda la home. */
    [data-pace-home-body] {
      --pace-luz: ${LUZ};
      --pace-nucleo: ${NUCLEO};
      --pace-borde: ${BORDE};
      /* Cuanto esta ABIERTO el horizonte. Satura en cuanto arranca la sesion,
         asi que pausar no vuelve a cerrar el aro. */
      --pace-abre: var(--pace-on, 0);
      /* La recogida de la pausa, resuelta en UN solo sitio: el interruptor lo
         publica FocusTimer y lo interpola la transicion de abajo; la
         profundidad la pone el papel. Con pausado=0 vale 1 (luz entera) y con
         pausado=1 vale --sun-pausa. */
      --pace-pausa: calc(1 - var(--pace-pausado, 0) * (1 - var(--sun-pausa, 0.45)));
      /* La transicion va donde CAMBIA el valor, y FocusTimer lo escribe justo
         aqui: es este nodo el que interpola y los descendientes heredan el valor
         ya animado. Solo se nombra --pace-on — transicionar tambien --pace-k
         obligaria a re-resolver la cadena de color en cada frame de cada uno de
         los 24 escalones de la hora, que es exactamente el coste que hundio a
         s157. El escalon de color salta, y no se ve. */
      transition: --pace-on 1600ms var(--ease), --pace-pausado 500ms var(--ease);
    }
    /* EL FUNDIDO DE 1,6 s no vive aquí: lo lleva --pace-on, que se interpola en
       la home. Terminar una sesión es el único momento en que la atmósfera pasa
       de existir a no existir, y un corte en el mismo frame en que el número
       llega a 00:00 se lee como un interruptor; 1,6 s se lee como la última luz
       yéndose. No son los 640 ms de --dur-slow a propósito: eso es la velocidad
       de un cambio de estado de la UI, y esto es el anochecer.

       EL CONTENEDOR NO LLEVA OPACITY, y eso NO es un descuido: una opacidad
       menor que 1 crea un grupo de AISLAMIENTO, y sus hijos dejarían de poder
       fundirse con el papel. Con mix-blend-mode debajo, eso habría convertido
       soft-light en un no-op silencioso — la capa mezclándose contra el vacío
       en vez de contra la home. La opacidad baja a cada pseudo, donde afecta a
       la capa pero no la aísla de su propio fondo. */
    /* EL CONTENEDOR ES SOLO UN ANCLA y mide lo que el aro, ni un pixel mas.
       Media 2 D y era EL QUE DESBORDABA: su borde inferior caia en cy + D, o sea
       12 px por debajo del contenedor de scroll, y eso eran 12 px de arrastre
       que HEAD no tiene. Sus dos capas se dimensionan solas y ninguna necesita
       que el padre sea grande: el limbo mide 1,32 D y el bloom 2,2 x 1,42 D,
       los dos posicionados desde este centro. */
    [data-pace-sun] {
      position: absolute;
      left: 50%;
      top: 50%;
      width: var(--pace-dial-d);
      height: var(--pace-dial-d);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }
    /* La luz se compone en NORMAL, sin modo de mezcla, y esto se decidió
       midiendo: entre el sol y el papel hay dos grupos de aislamiento —el propio
       [data-pace-sun] (lleva transform) y [data-pace-main-content] (contexto de
       apilado permanente por pace-module-in con fill:both)—, así que cualquier
       mix-blend-mode se funde contra el vacío. Medido: normal, soft-light y
       screen daban el mismo pico. Romper ese aislamiento exigiría tocar la
       entrada compartida de la home, que no tiene nada que ver con la luz, y el
       resultado se consigue igual en los tokens. Anotado para que nadie lo
       reintente a ciegas.

       Los DOS mandos multiplicados: --pace-on lleva el fundido de entrada y de
       salida (0 o 1, transicionado) y --pace-i la forma de la intensidad dentro
       de la sesión (30 escalones, SIN transición). Separarlos no es elegancia:
       es lo que mantiene la máscara del aro y los drop-shadows fuera del bucle
       por segundo. Ver la nota de coste en FocusTimer. */
    [data-pace-sun]::before,
    [data-pace-sun]::after {
      opacity: calc(var(--pace-on, 0) * var(--pace-i, 0) * var(--pace-pausa, 1));
    }
    /* LIMBO. Caja de 1,32 D centrada en el aro — no la de 2 D del contenedor:
       la corona ocupa una banda estrecha y pintar el cuádruple de área para
       nada es justo lo que el presupuesto de s157 prohíbe. */
    [data-pace-sun]::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: calc(var(--pace-dial-d) * ${(LIMBO_R * 2).toFixed(2)});
      height: calc(var(--pace-dial-d) * ${(LIMBO_R * 2).toFixed(2)});
      transform: translate(-50%, -50%);
      border-radius: 50%;
      pointer-events: none;
      background-image: ${grano}, ${limboCon(1)};
      -webkit-mask-image: ${limboCon(2)}, ${menosArriba};
      mask-image: ${limboCon(2)}, ${menosArriba};
      -webkit-mask-composite: source-in;
      mask-composite: intersect;
    }
    /* BLOOM. Ocupa la caja entera del contenedor. Dos máscaras INTERSECADAS: la
       radial le da su forma al grano y la lineal la direccionalidad. Con la
       lineal sola quedaría un rectángulo de ruido en toda la mitad baja. */
    [data-pace-sun]::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: calc(var(--pace-dial-d) * ${BLOOM_W});
      height: calc(var(--pace-dial-d) * ${BLOOM_H});
      transform: translate(-50%, -${(BLOOM_SUBE * 100).toFixed(0)}%);
      pointer-events: none;
      background-image: ${grano}, ${bloomCon(1)};
      -webkit-mask-image: ${bloomCon(2)}, ${direccion};
      mask-image: ${bloomCon(2)}, ${direccion};
      -webkit-mask-composite: source-in;
      mask-composite: intersect;
    }
    [data-pace-home-body] [data-pace-main-content] {
      position: relative;
    }
    /* AQUÍ NO SE RECORTA NADA, Y ESO ES EL ARREGLO — no la falta de él.

       El problema real: las dos capas del sol son cajas ABSOLUTAS y
       [data-pace-home-body] es un contenedor de scroll, así que lo que se
       salga por abajo se vuelve DESPLAZABLE. Medido contra el artefacto de HEAD
       servido en paralelo: 0 px de scroll en v0.89.0 y 125 px con la luz.

       El primer intento fue overflow:clip con overflow-clip-margin, y falló DOS
       veces seguidas, las dos medidas:
         1. El margen se caía en silencio. Chromium descarta un calc() PELADO en
            esta propiedad —calc(345px) computa 0px— y solo lo acepta precedido
            del <visual-box>. Con el margen a 0, el recorte guillotinaba el bloom
            en el borde de la caja: la línea horizontal de lado a lado que el
            usuario vio, y que la suite no vio porque el scroll seguía en 0.
            De paso, el @supports probaba «1px» mientras se aplicaba un calc:
            un feature test que no prueba lo que vas a escribir no vale nada.
         2. Con el margen ya válido (345 px), el scroll VOLVIÓ: Chromium cuenta
            la región del clip-margin como desbordamiento desplazable del
            ancestro. O sea que la técnica no permite separar las dos cosas.

       La solución es no necesitar recorte: las cajas se dimensionan para caber.
       El hueco entre el CENTRO del aro y el borde inferior del contenedor es de
       0,96 D en el peor breakpoint, y la caja del bloom acaba en 0,909 D con la
       luz muriendo en 0,84 D. Nada desborda, nada se recorta y quien decide
       dónde acaba la luz es EL DEGRADADO, que es justo como debe ser. */
    /* ===================================================================
       LO QUE LA LUZ HACE A LOS ELEMENTOS (s158) · sombra proyectada y filo.

       ESTO MODIFICA EL §1.5 DEL MODELO, y se hace con el usuario delante: la
       regla decía que la luz SOLO pinta fondos y que chips, tarjetas y texto
       van por encima sin teñir. Sigue sin teñirlos —ni un píxel de su relleno
       ni de su texto cambia de color— pero ahora sí los APOYA en la escena:
       proyectan sombra lejos del aro y su borde de arriba, el que mira al sol,
       recibe un filo de luz. Es lo que convierte la atmósfera en una FUENTE que
       existe en la habitación, en vez de un adorno detrás del reloj.

       POR QUÉ drop-shadow Y NO box-shadow: chips y tarjeta llevan su box-shadow
       INLINE y sus manejadores de hover lo reescriben inline también. Una regla
       de hoja no puede ganar a eso sin !important, y con !important el hover se
       quedaría sin efecto. La propiedad filter es distinta: se suma sin
       tocar nada de lo que ya hay.

       LA SOMBRA ES FRÍA a propósito. Una sombra es ausencia de luz cálida, no
       luz de otro color; teñirla con --pace-luz la habría vuelto un halo. Y es
       DELIBERADAMENTE corta: PACE prohibe las sombras exageradas y el listón
       acordado es «que se note si comparas con y sin sesión, no si miras una
       sola pantalla». En oscuro --sun-cast vale transparente: sobre papel
       oscuro un chip no puede proyectar más oscuridad de la que ya hay.
       =================================================================== */
    /* LA SOMBRA PROYECTADA, SOLO EN LOS CHIPS. La tarjeta de Camino queda
       pegada al borde inferior del contenedor en escritorio (su fondo cae en
       719 con el viewport en 720), y una sombra desborda por definicion: medido,
       su drop-shadow anadia 12 px de scroll. La tarjeta se apoya con el FILO,
       que no desborda ni un pixel. */
    [data-pace-home-body] [data-pace-spc-card] { position: relative; }
    [data-pace-home-body] [data-pace-activitybar-chip] { position: relative; }
    /* LA SOMBRA VA EN EL GRID, NO EN EL CHIP (s159), y el motivo es una medida.
       En el chip la sombra ENTRABA A GOLPE: el chip lleva transition de 0,22 s
       INLINE sobre todas las propiedades (es su transición de hover), así que su
       filter perseguía con 220 ms de retraso un --pace-on que estaba viajando
       durante 1,6 s. Muestreado cada 100 ms desde el click: con la luz ya al
       60 % la sombra iba por 0,01 de alfa, y al pararse --pace-on daba un tirón
       de 0,09 a 0,17 en 300 ms. Nada de eso se ve como un amanecer; se ve como
       un interruptor.

       No se puede ganar a un transition inline desde una hoja sin !important, y
       con !important el hover del chip se quedaría sin
       transición. El grid es el padre inmediato de los cuatro chips, no lleva
       transición ninguna, y drop-shadow sobre él proyecta la sombra del
       CONTENIDO renderizado — o sea de los chips, uno a uno y con su forma
       exacta, que es justo lo que hacía antes. Una sola declaración en vez de
       cuatro, y ahora la sombra sube y baja con la luz. */
    /* La PAUSA entra solo en el color, no en el desplazamiento ni en el
       desenfoque: al recogerse la luz la sombra se aclara, pero la fuente sigue
       donde estaba y no tendria sentido que la sombra se moviera. */
    [data-pace-home-body] [data-pace-activitybar-grid] {
      filter: drop-shadow(0 calc(3.6px * var(--pace-on, 0)) calc(9px * var(--pace-on, 0))
        color-mix(in srgb, var(--sun-cast) calc(var(--pace-on, 0) * var(--pace-pausa, 1) * 100%), transparent));
    }
    /* EL FILO. Un pelo de luz en el borde que mira al aro, desvanecido por los
       dos extremos para que sea luz y no una regla. Consume --pace-nucleo, o
       sea la MISMA fuente que la corona: al mediodía es dorado y de noche
       plata, sin que nadie lo repita en ningún sitio. */
    [data-pace-home-body] [data-pace-activitybar-chip]::after,
    [data-pace-home-body] [data-pace-spc-card]::after {
      content: '';
      position: absolute;
      left: 10%;
      right: 10%;
      top: 0;
      height: 1px;
      pointer-events: none;
      background-image: linear-gradient(90deg, transparent 0%, var(--pace-nucleo) 26%, var(--pace-nucleo) 74%, transparent 100%);
      opacity: calc(var(--pace-on, 0) * var(--pace-pausa, 1));
    }
    /* Barra de scroll OCULTA en el contenedor vertical de la home (s123), sin
       tocar el desplazamiento: overflow-y sigue en 'auto' (rueda/trackpad/gesto
       táctil/teclado funcionan, y el foco de teclado autodesplaza el viewport).
       Solo se oculta la BARRA visual: scrollbar-width:none (Firefox),
       -ms-overflow-style:none (Edge/IE antiguos) y ::-webkit-scrollbar
       display:none (Chromium/WebKit). NO se usa overflow:hidden — el contenido
       siempre es alcanzable. Solo este contenedor; no hay scrolls internos. */
    [data-pace-home-body] {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    [data-pace-home-body]::-webkit-scrollbar {
      width: 0;
      height: 0;
      display: none;
    }
    @media (max-width: 768px) {
      /* s128: en móvil el motor (home-geometry.js) también publica --pace-home-squeeze
         (0→1, progresivo bajo 700px de alto). El AIRE exterior se comprime con él
         ANTES de que el bucle encoja el aro, para que el aro siga grande. Solo se
         toca padding/hueco/min-height; ningún texto ni tamaño de fuente. Con
         squeeze=0 los valores son los base de siempre. */
      [data-pace-topbar] {
        padding: calc(10px - 4px * var(--pace-home-squeeze, 0)) 12px !important;
        min-height: calc(48px - 8px * var(--pace-home-squeeze, 0)) !important;
        gap: 4px !important;
      }
      /* Tabs Foco/Pausa/Larga: ocultos en móvil (s46 · v0.25.0)
         BreakMenu maneja la selección post-Pomodoro en móvil. */
      [data-pace-topbar] [data-pace-tabs] {
        display: none !important;
      }
      /* Iconos top-right: hit target 40x40 */
      [data-pace-topbar] [data-pace-topbar-icon] {
        width: 40px !important;
        height: 40px !important;
      }
      /* Main content: menos padding para ganar ancho del aro. Sin padding
         INFERIOR (s123): la base del aro debe quedar adyacente a la tarjeta de
         Camino para que el margin-top negativo del "atardecer" mida desde el
         borde del aro, no desde un padding intermedio. */
      [data-pace-main-content] {
        padding: 4px 12px 0 !important;
      }
      /* s128: la raíz de FocusTimer (único hijo de main-content) — sus dos huecos
         alrededor del selector de minutos (padding-top:8 y gap:14) son el mayor aire
         comprimible en móvil. Se comprimen con squeeze; el aro (que el motor encoge
         solo si aún no cabe) se mantiene grande. */
      [data-pace-home-body] [data-pace-main-content] > div {
        padding-top: calc(8px - 4px * var(--pace-home-squeeze, 0)) !important;
        gap: calc(14px - 8px * var(--pace-home-squeeze, 0)) !important;
        /* EL CENTRO (s159) · el bloque del Pomodoro salía 12 px a la derecha, y
           el defecto es PREVIO: HEAD v0.89.0 lo tenía igual, medido sirviendo
           los dos artefactos en paralelo (+11,80 a 320 · +11,89 a 360 · +12,00
           a 375 · +12,09 a 390). La atmósfera de s158 no lo introdujo: lo hizo
           VISIBLE, porque el halo cuelga del aro y arrastra ese error a un campo
           de luz de 790 px de ancho.

           LA CAUSA es que dos capas descuentan padding y una no sabe de la otra.
           El motor fija --pace-dial-d en 0,92 · W del VIEWPORT (techo móvil de
           s156, home-geometry.js) y esta raíz añade ENCIMA clamp(0px, 4vw, 40px)
           por lado —15,6 px a 390— que aquel techo no descuenta. Su max-content
           queda en D + 2·4vw = 390,19 px contra los 366 de ancho útil de
           [data-pace-main-content]. Y ese contenedor es un grid de UNA sola
           pista auto: la pista crece hasta 390,19, DESBORDA y se coloca desde el
           START en vez de centrarse. La mitad de ese desborde es exactamente la
           desviación medida.

           Se anula AQUÍ y no en focusStyles.root (FocusTimer.jsx) a propósito:
           en escritorio ese padding sigue haciendo falta. Su comentario de la
           sesión 22 —«para no ahogar el aro en 375×812»— era cierto cuando el
           aro se dimensionaba solo; desde s156 lo dimensiona el motor y este
           padding hace justo lo contrario de lo que dice. Sin él, la raíz mide
           366 y no desborda nada. */
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      /* EL GUARD DEL CENTRO (s159). Anular el padding quita la CAUSA, pero a
         320 px deja solo 2 px de holgura (D=294 contra 296 de ancho útil): si
         mañana sube el techo del motor, la pista volvería a desbordar y el
         bloque a irse al inicio, en silencio y sin que nada avise. Esto lo
         impide sin depender de esa holgura — una pista que no cabe se centra en
         lugar de alinearse al start, que es lo que debería haber pasado desde
         el principio. NO cambia ningún tamaño: solo dónde se coloca lo que
         sobra. */
      [data-pace-home-body] [data-pace-main-content] {
        justify-content: center !important;
      }
      /* HORIZONTE EN MÓVIL CUANDO NO HAY TARJETA (s156). El bloque que hace de
         horizonte es «el primero después del aro»: normalmente la tarjeta de
         Camino, pero con un Camino EN CURSO la tarjeta no existe y ese papel
         pasa a Actividades. El selector de hermano adyacente lo dice sin que
         nadie tenga que saber por qué falta la tarjeta; con tarjeta, no casa. */
      [data-pace-home-stack] > [data-pace-main-content] + [data-pace-activitybar] {
        margin-top: calc(var(--pace-horizon) * -1) !important;
      }
      /* REPARTO DEL SOBRANTE (s156). En móvil el aro topa por ANCHO, así que
         sobra alto por construcción y el margin:auto lo repartía a partes
         iguales: la composición flotaba en medio con ~90 px muertos arriba y
         otros ~90 abajo (medido a 390×844). Se le da MENOS aire arriba que
         abajo — masa alta y suelo bajo, que es la lectura de un amanecer. El
         motor publica el sobrante REAL; con 0 esto degrada al comportamiento
         anterior. Solo mueve el bloque: no cambia ni un tamaño. */
      [data-pace-home-body] > [data-pace-home-stack] {
        margin-top: calc(var(--pace-home-slack, 0px) * 0.38) !important;
        margin-bottom: auto !important;
      }
      /* ActivityBar en móvil: grid 2×2, chips compactos verticales */
      [data-pace-activitybar] {
        padding: calc(4px - 2px * var(--pace-home-squeeze, 0)) 12px calc(14px - 8px * var(--pace-home-squeeze, 0)) !important;
      }
      [data-pace-activitybar-grid] {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
      }
      [data-pace-activitybar-chip] {
        min-width: 0 !important;
        flex: 1 1 auto !important;
        padding: 10px 12px !important;
        gap: 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 15px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        font-size: 11px !important;
      }
      /* Handle flotante ≡ para abrir sidebar: hit target ≥44px */
      [data-pace-sidebar-open] {
        width: 44px !important;
        height: 44px !important;
        top: 8px !important;
        left: 8px !important;
      }
    }
    /* Viewports muy bajos (≤700 de alto): reducir aún más la ActivityBar
       para dejar que el aro respire. Sólo afecta móvil vertical pequeño. */
    @media (max-width: 768px) and (max-height: 720px) {
      [data-pace-activitybar-chip] {
        padding: 8px 10px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-label] {
        font-size: 14px !important;
      }
      [data-pace-activitybar-chip] [data-pace-chip-sub] {
        display: none !important;
      }
    }

    /* ===================================================================
       HOME DESKTOP — sistema proporcional único (s126). Solo lo de ESTE
       bloque es exclusivo de ≥769px; las variables y el modelo «atardecer»
       de arriba los comparten las dos pieles.

       CORREGIDO EN s156. Esta cabecera decía «mobile/tablet (≤768) no recibe
       nada» y que el ayudante publica «SOLO en Desktop (y las borra fuera)»:
       las dos frases son FALSAS desde s128 —el motor corre en todo viewport y
       clearVars() se retiró—, y era el tercer sitio del repo que describía
       una arquitectura que ya no existía. Reproduce la composición de la
       captura v0.64 (Timer → Actividades solapando el aro bajo el CICLO →
       Camino ancho al fondo) y la mantiene constante en toda resolución de
       escritorio.
       =================================================================== */
    @media (min-width: 769px) {
      /* La piel de escritorio, para el orden del DOM (s160). Ver la nota de
         --pace-skin arriba: este es el ÚNICO sitio donde vive el breakpoint. */
      :root { --pace-skin: escritorio; }
      /* Aro por D (el ayudante lo dimensiona para llenar sin scroll). El
         aspect-ratio 1/1 del marco da el ancho. s156: el fallback ya no se
         escribe aquí — venía como 360px a mano y no coincidía con el del
         móvil, de modo que un mismo fallo daba dos aros distintos según la
         piel. Ahora los dos caen en --pace-dial-d. */
      [data-pace-dial-fit] {
        height: var(--pace-dial-d) !important;
        /* HORIZONTE (s126): el aro se CORTA por abajo en la línea donde
           empiezan las Actividades — el «sol saliendo» de la referencia v0.64.
           Sin esto el arco se veía entero: [data-pace-activitybar] no tiene
           fondo, así que sube sobre el aro pero el SVG se pinta detrás y
           atraviesa la banda transparente (padding + rótulo ACTIVIDADES).

           Se REUTILIZA --pace-activities-overlap, que ya vale exactamente
           dialBottom − cicloBottom − 4px = distancia del horizonte al fondo
           del aro. Una sola fuente → recorte y solapamiento no pueden
           desincronizarse nunca.

           El CONTENIDO nunca se corta por construcción: la línea se define
           desde el bottom del CICLO, que es el último hijo del interior del
           aro, así que se mueve con él (idioma, alto del CTA, descriptor).

           s158: el horizonte ya no se pinta aquí. Era un clip-path sobre el
           marco y ahora es una máscara sobre [data-pace-dial-ring], declarada
           UNA vez arriba para las dos pieles — el valor era idéntico en ambas,
           así que duplicarlo solo daba dos sitios donde divergir. La decisión
           de v0.64 (corte duro para que no floten arco y punto a los lados de
           ACTIVIDADES) queda revisada en s158 con el usuario: ahora hay luz ahí
           debajo, y el arco atenuado se hunde en ella en vez de flotar. */
      }
      /* Interior PROPORCIONAL a D (ratios medidos en la referencia). !important
         para ganar a los estilos inline de TimerDial. El botón conserva 44px
         (a11y); las Actividades se anclan al CICLO MEDIDO, así que estos
         tamaños son cosméticos (aspecto «escalado»), no críticos. */
      [data-pace-dial-fit] [data-pace-dial-label] {
        font-size: clamp(9px, calc(var(--pace-timer-d, 360px) * 0.028), 15px) !important;
        margin-bottom: clamp(4px, calc(var(--pace-timer-d, 360px) * 0.026), 15px) !important;
      }
      [data-pace-dial-fit] [data-pace-dial-number] {
        font-size: clamp(40px, calc(var(--pace-timer-d, 360px) * 0.255), 135px) !important;
      }
      [data-pace-dial-fit] [data-pace-dial-subtitle] {
        font-size: clamp(11px, calc(var(--pace-timer-d, 360px) * 0.036), 19px) !important;
        margin-top: clamp(10px, calc(var(--pace-timer-d, 360px) * 0.077), 42px) !important;
      }
      [data-pace-dial-fit] [data-pace-dial-divider] {
        width: clamp(80px, calc(var(--pace-timer-d, 360px) * 0.28), 150px) !important;
        margin-top: clamp(6px, calc(var(--pace-timer-d, 360px) * 0.03), 16px) !important;
        margin-bottom: clamp(6px, calc(var(--pace-timer-d, 360px) * 0.026), 14px) !important;
      }
      /* EL ORDEN LO TRAE EL DOM (s160). Hasta v0.90.0 estas dos reglas hacían el
         reorden con "order: 1 / 2" y el DOM se quedaba en el orden de móvil, así
         que en escritorio el orden visual y el del DOM no coincidían: el foco de
         teclado bajaba del aro a la tarjeta del fondo (top 622 y 698) y luego
         SUBÍA a los chips (top 496). Eso es WCAG 2.4.3, medido recorriendo con
         Tab, y era previo. Ahora main.jsx renderiza cada piel en su orden
         canónico —lo elige por --pace-skin, que publica ESTA hoja, así que el
         breakpoint sigue viviendo en un solo sitio— y aquí no queda ningún
         "order": el orden visual y el del DOM no PUEDEN divergir.
         Lo demás de estas dos reglas no cambia. */
      [data-pace-activitybar] {
        position: relative;
        z-index: 1;                 /* Actividades pintan SOBRE el arco del aro */
        margin-top: calc(var(--pace-horizon) * -1) !important;
      }
      [data-pace-spc] {
        margin-top: 0 !important;   /* anula el solapamiento «atardecer» de s123 */
        /* recupera alto vertical → aro un poco mayor (sin tocar contenido ni
           botón). En alturas cortas se va a 0 vía --pace-home-squeeze. */
        padding-bottom: calc(4px - 4px * var(--pace-home-squeeze, 0)) !important;
      }
      /* Enlace «Ver caminos» (último hijo de [data-pace-spc]): más pegado a la
         tarjeta para recuperar unos px sin quitar el enlace. */
      [data-pace-spc] > div:last-child {
        margin-top: calc(2px - 2px * var(--pace-home-squeeze, 0)) !important;
      }

      /* -----------------------------------------------------------------
         COMPACTACIÓN EN ALTURAS CORTAS (s126b). --pace-home-squeeze (0→1) lo
         publica home-geometry.js: 0 por encima de 700px de alto (la altura de
         la captura de referencia queda BYTE-IDÉNTICA) y 1 a 610px, progresivo
         en medio — no es un breakpoint.

         Solo se toca AIRE exterior: ningún texto, ningún tamaño de fuente,
         ningún glifo, y el CTA conserva su suelo de 44px. Libera ~62px que
         van íntegros al diámetro del aro, que es lo que devuelve la
         estructura del diseño («el aro se veía reducido a 1366×768, donde el
         viewport real es ~610px por el chrome del navegador»).

         Ámbito: [data-pace-main-content] y los bloques de Actividades/Camino
         viven dentro de [data-pace-home-body] → confinados por selector.

         El TopBar NO cuelga de la home y NO se puede confinar por selector:
         [data-pace-home-body] se renderiza SIEMPRE (los módulos abren como
         overlay ENCIMA, no lo desmontan), así que un :has([data-pace-home-body])
         daría una falsa sensación de confinamiento — matchea siempre. Se deja
         el selector plano y el confinamiento es DE FACTO: los overlays tapan el
         TopBar con [data-pace-modal-backdrop] (verificado), así que solo se ve
         en la home. Y aunque se viera, 48px siguen conteniendo sus ~45px de
         contenido sin apretar nada.
         ----------------------------------------------------------------- */
      [data-pace-topbar] {
        padding-top: calc(14px - 8px * var(--pace-home-squeeze, 0)) !important;
        padding-bottom: calc(14px - 8px * var(--pace-home-squeeze, 0)) !important;
        /* El min-height es el que manda de verdad: sin bajarlo, recortar el
           padding no gana nada. 48px es el mismo suelo que ya usa el tier
           móvil y el contenido real del TopBar mide ~45px, así que no aprieta
           nada (tabs e iconos conservan su tamaño). */
        min-height: calc(56px - 8px * var(--pace-home-squeeze, 0)) !important;
      }
      [data-pace-home-body] [data-pace-main-content] {
        padding-top: calc(10px - 8px * var(--pace-home-squeeze, 0)) !important;
      }
      /* Único hijo de main-content en la home = la raíz de FocusTimer. Su
         padding-top y su gap:14 son los dos huecos que rodean al selector de
         minutos (TopBar↔selector y selector↔aro). */
      [data-pace-home-body] [data-pace-main-content] > div {
        padding-top: calc(8px - 4px * var(--pace-home-squeeze, 0)) !important;
        gap: calc(14px - 8px * var(--pace-home-squeeze, 0)) !important;
      }
      [data-pace-activitybar] {
        padding-top: calc(6px - 2px * var(--pace-home-squeeze, 0)) !important;
        padding-bottom: calc(20px - 14px * var(--pace-home-squeeze, 0)) !important;
      }
      [data-pace-spc-card] {
        padding-top: calc(14px - 4px * var(--pace-home-squeeze, 0)) !important;
        padding-bottom: calc(14px - 4px * var(--pace-home-squeeze, 0)) !important;
      }
    }
  `;
  document.head.appendChild(s);
})();
