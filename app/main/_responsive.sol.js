/* PACE · _responsive.sol.js — EL SOL DE LA HOME, EN CSS
   ===================================================
   La segunda mitad de la hoja de `_responsive.js` (el sol de la home: la luz en la home, el limbo,
   el bloom y por qué no se recorta), movida tal cual al tocar aquel las 500 líneas de §1 (auditoría
   del 24 nov. 2026, H8A de Ez). El texto es el mismo, byte a byte: `_responsive.js` lo pega al final
   de su hoja, así que el orden de las reglas no cambia. Los degradados llegan compuestos de
   `_responsive.atmosfera.js`, que carga antes; este archivo, antes que `_responsive.js`. */

(function paceResponsiveSolCss() {
  if (typeof document === 'undefined') return;
  const { LUZ, NUCLEO, BORDE, grano, LIMBO_R, limboCon, menosArriba, colaLimbo, BLOOM_W, BLOOM_CENTRO, BLOOM_COLA, bloomCon, direccion, colaBloom } = window.paceAtmosfera || {};
  window.paceResponsiveSolCss = `
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
      /* AQUI VIVIA --pace-abre (s158-s183): se retiro en s184 al recortar el
         arco, porque era el mando de un desvanecido sin nada que desvanecer. El
         porque, en la constante «horizonte» de _responsive.atmosfera.js. */
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
      /* TRES máscaras intersecadas desde s184, y cada una tiene su borde: la
         radial le da forma a la corona, «menosArriba» la mata antes de la fila
         de minutos y «colaLimbo» la apaga por debajo del horizonte. Las tres
         salen de _responsive.atmosfera.js, donde estan sus numeros medidos. */
      -webkit-mask-image: ${limboCon(2)}, ${menosArriba}, ${colaLimbo};
      mask-image: ${limboCon(2)}, ${menosArriba}, ${colaLimbo};
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
      /* s195: caja desde el centro del aro y alto que resta el horizonte, para que
         acabe donde acaba la luz y no haga scroll (nota de BLOOM_COLA, atmosfera). */
      top: calc(50% - var(--pace-dial-d) * ${BLOOM_CENTRO});
      width: calc(var(--pace-dial-d) * ${BLOOM_W});
      height: calc(var(--pace-dial-d) * ${(BLOOM_CENTRO + BLOOM_COLA).toFixed(3)} - var(--pace-corte, 0px));
      transform: translateX(-50%);
      pointer-events: none;
      background-image: ${grano}, ${bloomCon(1)};
      /* s184: se le anade «colaBloom» por el mismo motivo que al limbo. Por
         ARRIBA no necesita nada: «direccion» ya vale cero por encima de 0,5 D
         del centro, que es mas alto que el techo que se le puso a la corona. */
      -webkit-mask-image: ${bloomCon(2)}, ${direccion}, ${colaBloom};
      mask-image: ${bloomCon(2)}, ${direccion}, ${colaBloom};
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
})();
