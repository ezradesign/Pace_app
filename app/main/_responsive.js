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

  /* ATMÓSFERA DE AMANECER (s156) — se REUTILIZA el mecanismo de s140, no se
     copia. `paceGlowRamp` y `paceGrainUrl` viven en app/ui/SessionShell.jsx y
     son la fuente canónica de la caída de luz y del grano antibanding de este
     producto; SessionShell.jsx carga ANTES que este archivo (PACE.html), así
     que aquí ya están en window y su resultado se hornea en la hoja. Duplicar
     las paradas del degradado en CSS habría creado una segunda curva que
     divergiría de la de las sesiones a la primera corrección.

     POR QUÉ EL GRANO: sobre papel plano un degradado suave de esta amplitud
     BANDEA. Es el hallazgo de s140 — el grano no tapa el escalón, lo ditherea,
     y va enmascarado con la MISMA caída que la luz para no dejar un disco de
     ruido con borde duro contra el papel.

     FALLBACK: `paceGlowRamp` usa color-mix(). Donde no exista, se cae a un
     radial de dos paradas con el mismo token y el mismo borde: menos fino, pero
     el amanecer sigue ahí y nada queda sin pintar. */
  const HALO_BORDE = 74;
  const DAWN = 'var(--dawn-soft)';
  const puedeMezclar = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('background-image', 'radial-gradient(circle, color-mix(in srgb, red 50%, transparent) 0%, transparent 100%)');
  const halo = (puedeMezclar && typeof window.paceGlowRamp === 'function')
    ? window.paceGlowRamp(DAWN, HALO_BORDE)
    : 'radial-gradient(circle, ' + DAWN + ' 0%, transparent ' + HALO_BORDE + '%)';
  const grano = (typeof window.paceGrainUrl === 'function') ? window.paceGrainUrl() : '';
  const capas = (grano ? grano + ', ' : '') + halo;
  /* Misma máscara que PaceDither (s140): opaca hasta la mitad del borde y
     desvanecida hasta él. */
  const caida = 'radial-gradient(#000 0%, #000 ' + (HALO_BORDE * 0.5).toFixed(1) + '%, transparent ' + HALO_BORDE + '%)';

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
         que sube el bloque de abajo — no hay dos fallbacks que puedan divergir. */
      -webkit-clip-path: inset(0 0 var(--pace-horizon) 0);
      clip-path: inset(0 0 var(--pace-horizon) 0);
    }
    /* ===================================================================
       AMANECER (s156) · las dos piezas visuales, comunes a las dos pieles.

       1. HALO detrás del aro. Vive en el ::before del marco, así que lo recorta
          el MISMO clip-path que corta el aro: la luz emerge de detrás del
          horizonte en vez de flotar sobre él. z-index 0 y el interior del dial
          en 1 (TimerDial) => nunca pasa por delante del número ni del CTA.
       2. LÍNEA DE ALBA en el horizonte, anclada a --pace-horizon, o sea al
          mismo sitio exacto por donde se corta el aro. Se desvanece por los dos
          extremos: es luz en el horizonte, no una regla de separación.

       INTENSIDAD POR ESTADO. --pace-dawn y --pace-alba son lo ÚNICO que cambia
       entre reposo, activo y pausado; el estado nunca se comunica solo con
       esto (el número, el texto del CTA y «Reiniciar bloque» ya lo dicen).
       Las transiciones son decorativas y no cuelgan de data-pace-essential, así
       que el kill de prefers-reduced-motion (tokens.css) las neutraliza.
       =================================================================== */
    [data-pace-dial-fit] {
      --pace-dawn: 0.72;
    }
    [data-pace-dial-fit][data-pace-dial-running] {
      --pace-dawn: 1;
    }
    [data-pace-dial-fit][data-pace-dial-paused] {
      --pace-dawn: 0.42;
    }
    [data-pace-dial-fit]::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      background-image: ${capas};
      -webkit-mask-image: ${caida};
      mask-image: ${caida};
      opacity: var(--pace-dawn, 0.72);
      transition: opacity var(--dur-slow) var(--ease);
    }
    [data-pace-home-body] [data-pace-main-content] {
      position: relative;
      --pace-alba: 0.8;
    }
    [data-pace-home-body] [data-pace-main-content]:has([data-pace-dial-running]) {
      --pace-alba: 1;
    }
    [data-pace-home-body] [data-pace-main-content]:has([data-pace-dial-paused]) {
      --pace-alba: 0.45;
    }
    [data-pace-home-body] [data-pace-main-content]::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: var(--pace-horizon);
      height: 1px;
      pointer-events: none;
      z-index: 0;
      background-image: linear-gradient(90deg, transparent 0%, var(--dawn-line) 30%, var(--dawn-line) 70%, transparent 100%);
      opacity: var(--pace-alba, 0.8);
      transition: opacity var(--dur-slow) var(--ease);
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

           Se recorta el MARCO, no el svg: ese svg lleva rotate(-90deg)
           inline y clip-path rota con el elemento (un inset inferior le
           cortaría el lado izquierdo en pantalla). Recortar el marco además
           cubre el halo [data-pace-dial-running]::after (círculo inset:6% de
           tokens.css), que si no asomaría bajo el horizonte.

           El CONTENIDO nunca se corta por construcción: la línea se define
           desde el bottom del CICLO, que es el último hijo del interior del
           aro, así que se mueve con él (idioma, alto del CTA, descriptor).

           Efecto asumido (decisión del usuario, = v0.64): con el timer en
           marcha el arco de progreso y el punto guía quedan ocultos bajo el
           horizonte (~94° de aro). El corte DURO es deliberado: un
           desvanecido dejaría arco y punto atenuados flotando en la banda
           transparente, a los lados de «ACTIVIDADES». */
        -webkit-clip-path: inset(0 0 var(--pace-horizon) 0);
        clip-path: inset(0 0 var(--pace-horizon) 0);
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
      /* Reorden VISUAL (DOM intacto: main-content → Camino → Actividades):
         Actividades tras el aro, Camino al fondo. */
      [data-pace-activitybar] {
        order: 1 !important;
        position: relative;
        z-index: 1;                 /* Actividades pintan SOBRE el arco del aro */
        margin-top: calc(var(--pace-horizon) * -1) !important;
      }
      [data-pace-spc] {
        order: 2 !important;
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
