/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   CSS responsive global del shell (sesion 82 / v0.33.2).
   Inyecta <style id="pace-main-responsive-css"> una sola vez al cargar.
   Extraido literal de main.jsx (lineas 20-112) en split mecanico s82.

   TROCEADO EN s163, cuando este archivo llego a 1132 lineas — mas del doble del
   limite de CLAUDE.md §1. Quedo repartido en tres, y el reparto es por dominio:

     · `_responsive.atmosfera.js`  el JS que compone los degradados de la luz.
                                   Carga ANTES: aqui se desestructura.
     · ESTE ARCHIVO               la hoja BASE (resolucion unica, el aro, el
                                   horizonte) y la ATMOSFERA del Pomodoro.
     · `_responsive.pieles.js`     las dos pieles: @media movil y @media
                                   escritorio. Carga DESPUES.

   EL ORDEN DE LOS TRES ES CONTRATO, no estilo. `--pace-skin: movil` se declara
   en la hoja de este archivo y `--pace-skin: escritorio` dentro del @media de
   las pieles: MISMA especificidad, asi que a >=769px gana el que se inyecta
   DESPUES. Si se cargan al reves, la home de escritorio se cree movil y
   `main.jsx` (s160) renderiza el orden equivocado. Se partio por UN punto y no
   sacando un bloque de en medio justamente para que esto siguiera siendo cierto:
   comprobado en navegador que las reglas y su orden no cambian ni un byte.

   Reglas de la parte que sigue aqui:
   - [data-pace-app-root]: alto 100vh con fallback dvh (iOS pre-15.4).
   - TopBar: reduce padding lateral y ancho de tabs en movil (las pieles).
   - RESOLUCION UNICA (s156): --pace-dial-d y --pace-horizon salen de UN sitio.
   - El aro y sus cuatro nodos interiores: `transition-property: none` (s160).
   - El horizonte desvanecido (s158) y las dos capas de luz del sol (s158/s159).

   OJO AL EDITAR: la hoja vive DENTRO de un template literal. Un solo backtick
   aborta el build — ha pasado en s139, s156, s157, s158 y s162.

   Carga ANTES de main.jsx en PACE.html (es config de layout, no componente).
   No expone nada a window: el side effect es la inyeccion del style block.
*/

(function injectPaceMainResponsiveCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-responsive-css')) return;

  /* Los degradados de la luz llegan compuestos de `_responsive.atmosfera.js`.
     Se desestructuran aqui para que el template literal de abajo siga escrito
     exactamente igual que cuando vivia en el mismo archivo: sus 22
     interpolaciones no se han tocado. */
  const {
    LUZ, NUCLEO, BORDE, horizonte, grano,
    LIMBO_R, limboCon, menosArriba,
    BLOOM_W, BLOOM_H, BLOOM_SUBE, bloomCon, direccion,
  } = window.paceAtmosfera || {};

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
    /* Y EL HORIZONTE TAMPOCO — PERO SOLO BAJO REDUCED-MOTION (s162).
       El mismo mecanismo de s160 un nodo más abajo, y era la causa del rojo
       INTERMITENTE de la suite: 1 de cada 2 pasadas, «el aro mide distinto con
       reduced-motion (420 vs 406)».

       applyD() publica --pace-activities-overlap, y el bloque que hace de
       horizonte lo consume como margin-top NEGATIVO: Actividades en escritorio,
       Actividades también en móvil cuando no hay tarjeta, y la tarjeta de Camino
       (SuggestedPathCard.jsx) cuando existe. Con el kill de reduced-motion ese
       cambio de margen pasa a ser una TRANSICIÓN, así que el alto del stack
       aterriza en otro frame mientras el motor lo mide en la MISMA tarea: el
       desbordamiento se queda clavado en 11, el guard «nunca encoger a ciegas»
       revierte D a 420
       y gasta su único reintento. Cuando el reintento corre la misma carrera, el
       motor SE RINDE EN 420 y ahí se queda: 11 px de desbordamiento permanentes
       para quien pide menos movimiento — y un resize a mano lo baja a 406, que es
       la prueba de que el motor podía medirlo y no lo volvió a medir.

       Medido a 1280×720 sobre el artefacto, con control: SIN reduce el margen
       aterriza en la misma tarea (-65 -> -51, stack 655 -> 669) y no hay ninguna
       transición viva; CON reduce el margen sigue en -65, el stack en 655,
       getAnimations() devuelve margin-top:running, y el valor llega dos frames
       después.

       Va ACOTADO a la media query a propósito, al contrario que la exención del
       aro: fuera de reduced-motion la medida ya responde en la misma tarea, y
       estos dos nodos sí tienen transiciones legítimas que no hay que tocar.
       Dentro, ninguna lo es — el kill las deja en 0,01 ms precisamente para
       matarlas; lo único que les sobrevive es la capacidad de aterrizar tarde. */
    @media (prefers-reduced-motion: reduce) {
      [data-pace-activitybar],
      [data-pace-spc] {
        transition-property: none !important;
      }
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
  `;
  document.head.appendChild(s);
})();
