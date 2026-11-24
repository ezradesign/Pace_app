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
    LUZ, NUCLEO, BORDE, horizonte, horizontePista, grano,
    LIMBO_R, limboCon, menosArriba, colaLimbo,
    BLOOM_W, BLOOM_CENTRO, BLOOM_COLA, bloomCon, direccion, colaBloom,
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
      overflow-anchor: none; /* v0.155.0; lo que la corría de lado era el bloom (data-pace-home-stack en main.jsx, DECISIONES) */
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
      /* EL SOLAPAMIENTO Y EL HORIZONTE SIGUEN SIENDO EL MISMO TOKEN (s156): es
         lo que sube Actividades y la tarjeta de Camino sobre el aro, y lo
         consumen las dos pieles como margin-top negativo. No se toca. */
      --pace-horizon: var(--pace-activities-overlap, var(--pace-home-sunset-overlap));
      /* EL CORTE DEL ARO, QUE DESDE s184 YA NO ES EL HORIZONTE.

         Hasta aqui el aro se cortaba EN el horizonte, o sea en el borde superior
         de Actividades -- por encima del rotulo--, y sus dos cabos morian en el
         aire. Decision del usuario en s184, viendo las dos variantes pintadas:
         que baje hasta el canto de las TARJETAS, porque asi lo que lo termina es
         una OCLUSION (las tarjetas son opacas) y una oclusion no se lee nunca
         como amputacion. El rotulo ACTIVIDADES queda dentro de su abertura.

         SE SEPARA DEL HORIZONTE, PERO NO DE SU FUENTE, y esa distincion es la que
         mantiene viva la garantia de s156: el motor calcula el corte restandole
         al MISMO solapamiento la banda del rotulo, que MIDE. No se escribe un
         32: depende del padding de la piel y del idioma. Aqui solo se elige
         motor-o-fallback, igual que con --pace-dial-d y --pace-horizon.

         POR QUE NO BASTABA CON BAJAR --pace-horizon: ese token TAMBIEN mueve el
         layout: «_responsive.pieles.js» lo usa como margin-top negativo en las
         dos pieles, y «SuggestedPathCard» igual. Bajarlo habria bajado las
         tarjetas con el aro y la composicion entera se habria descolocado. Son
         dos preguntas distintas y ahora tienen dos nombres.

         Sin motor la banda vale 0 y el corte vuelve a ser el horizonte: el
         comportamiento anterior, que es el fallback correcto y no una
         aproximacion. Los 6 px son el aire entre el cabo y el canto de la
         tarjeta; el suelo de 4 px impide que un rotulo desproporcionado deje el
         aro sin recortar. Barrido: 271,6 -> 295,8 grados a 1280x800. */
      --pace-corte: var(--pace-dial-corte, var(--pace-horizon));
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
    /* Y EL ENVOLTORIO DEL ARO DESDE s185, un nodo mas afuera y por lo mismo: su
       margin-top (el aire del halo) es proporcional a D, asi que depende de lo
       que el motor escribe y con el kill de reduced-motion se volvia TRANSICION.
       Medido: 381 con reduced-motion contra 379 sin el, cazado por la tolerancia
       de 1 px que dejo s162. Misma familia que sus 14 px y los 11 de s156. */
    [data-pace-timer-wrap],
    [data-pace-dial-fit] [data-pace-dial-label],
    [data-pace-dial-fit] [data-pace-dial-number],
    [data-pace-dial-fit] [data-pace-dial-subtitle], [data-pace-dial-fit] [data-pace-dial-hasta],
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
       EL HORIZONTE (s158, y de vuelta al corte seco en s184).

       OJO AL EDITAR: esto vive DENTRO del template literal de la hoja. Un solo
       backtick aqui aborta el build — paso tres veces en s157 y una mas en
       s158, escribiendo justo este comentario.

       Hasta v0.89.0 esto era un clip-path con inset inferior --pace-horizon
       sobre el MARCO, y el comentario del bloque Desktop registraba que el
       corte duro era deliberado (= v0.64): un desvanecido dejaría «arco y punto
       atenuados flotando en la banda transparente, a los lados de
       ACTIVIDADES». s158 probó justamente eso, a petición del usuario y ahora
       que hay luz: que el arco de recorrido COMPLETASE los 360 grados aunque
       pasara por detrás de los chips, hundiéndose en la luz.

       s184 CIERRA ESE PARÉNTESIS, y no porque el desvanecido no convenciera:
       porque se le acabó el trabajo. El arco ya no da los 360 — recorre solo el
       tramo VISIBLE, del cruce izquierdo al derecho—, así que no queda nada
       debajo del horizonte que atenuar. Lo único que la apertura seguía haciendo
       era fundir los cabos, y el usuario pidió cabos limpios. La máscara vuelve
       a ser un corte: opaco arriba, transparente abajo, igual con sesión y sin
       ella. Es la vuelta atrás que este mismo comentario dejó escrita en s158
       («llevar el último tramo a transparente»), ejecutada por otro motivo.

       SIGUE SIENDO UNA MÁSCARA Y NO UN clip-path, y esa parte no es histórica:
       la máscara cubre el halo ::after del marco, que el clip-path de v0.89.0
       tenía que recortar aparte.

       POR QUÉ EN [data-pace-dial-ring] Y NO DONDE ESTABA. En el <svg> no puede
       ir: uno de los dos va rotado -90deg y la máscara rotaría con él (un
       degradado vertical se volvería horizontal). En el MARCO tampoco: contiene
       el número, el CTA y el CICLO, y los recortaría con el anillo.

       --pace-horizon es el MISMO token que sube el bloque de abajo, así que
       horizonte y solapamiento siguen sin poder desincronizarse.
       =================================================================== */
    [data-pace-dial-fit] [data-pace-dial-ring] {
      -webkit-mask-image: ${horizonte};
      mask-image: ${horizonte};
    }
    /* Y LA PISTA, ADEMAS, SE DISUELVE MUCHO ANTES (s184). Va en su propia capa
       ANIDADA dentro del anillo, asi que las dos mascaras se MULTIPLICAN: la del
       anillo vale 1 muy pronto, de modo que lo que la pista experimenta es en la
       practica solo esta. El reparto —el arco es informacion y no puede
       desaparecer; la escala es ambiente y si— esta en la cabecera de las dos
       nieblas de _responsive.atmosfera.js. */
    [data-pace-dial-fit] [data-pace-dial-pista] {
      -webkit-mask-image: ${horizontePista};
      mask-image: ${horizontePista};
    }` + (window.paceResponsiveSolCss || '');
  document.head.appendChild(s);
})();
