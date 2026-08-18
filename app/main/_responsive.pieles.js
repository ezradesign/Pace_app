/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   _responsive.pieles.js — LAS DOS PIELES DE LA APP.
   Cortado de `_responsive.js` en s163 (ver su cabecera para el reparto entero).
   Inyecta <style id="pace-main-pieles-css"> una sola vez al cargar.

   QUÉ VIVE AQUÍ: el bloque `@media (max-width: 768px)` con todo lo que hace la
   piel de móvil, el `@media (max-width: 768px) and (max-height: 720px)` de las
   pantallas cortas, y el `@media (min-width: 769px)` de escritorio. Ni una
   interpolación: estas reglas no dependen del JS de la atmósfera, y por eso este
   archivo no tiene una sola línea de lógica.

   SE INYECTA DESPUÉS QUE `_responsive.js`, Y ESO ES CONTRATO. `--pace-skin`
   vale `movil` en la hoja base y `escritorio` en el @media de aquí abajo, las
   dos veces sobre `:root`: misma especificidad, así que a >=769px gana la que se
   inyecta DESPUÉS. Si este archivo cargara antes, la home de escritorio se
   creería móvil y `main.jsx` (s160) renderizaría el orden de lectura de la otra
   piel. Fue un CORTE por un punto —no una extracción— para que el orden de las
   reglas siguiera siendo exactamente el de antes; comprobado en navegador.

   OJO AL EDITAR: la hoja vive DENTRO de un template literal. Un solo backtick
   aborta el build — ha pasado en s139, s156, s157, s158 y s162.
*/

(function injectPaceMainPielesCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-pieles-css')) return;

  const s = document.createElement('style');
  s.id = 'pace-main-pieles-css';
  s.textContent = `
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
         BreakMenu maneja la selección post-Pomodoro en móvil.

         s169 los devuelve, pero SOLO donde caben sin costarle un píxel al aro.
         Ver el bloque de dos bandas justo debajo. La regla de s46 sigue siendo
         el DEFECTO: si no hay sitio, la pill no aparece, y el BreakMenu sigue
         proponiendo modo al terminar el Pomodoro (las dos cosas CONVIVEN). */
      [data-pace-topbar] [data-pace-tabs] {
        display: none !important;
      }

      /* LA PILL EN SU PROPIA FILA · s169.
         ---------------------------------------------------------------
         Por qué no cabe en la misma fila, y por qué la altura no era la
         pregunta: [data-pace-tabs] es position:absolute centrada
         (TopBar.jsx:46-48), o sea FUERA DE FLUJO. No empuja, no encoge y no
         cambia el alto de la fila — lo único que puede hacer es SOLAPARSE con
         los tres iconos, y lo hace idéntico de 568 a 932 px de alto (s168).
         Sólo se limpiaría por encima de ~560 px de ANCHO, que ningún teléfono
         alcanza en vertical.

         EL GATE TIENE UN SUELO DE ANCHO Y OTRO DE ALTO, y cada uno sale de una
         medida distinta:

         · ALTO >= 760. Darle su propia línea cuesta +42 px de topbar (34 de
           pill + 8 de hueco) y esos 42 px salen del aro. Barrido de 9 anchos
           (320 a 768) x 8 alturas (s169): a 736 el aro paga 4 px a 412, 20 a
           428 y 30 a 440; a 760 ya es GRATIS en todos los anchos, medido A/B
           en el mismo viewport. Aviso para quien venga a tocarlo: NO es
           «alto >= 844» —ese número era la siguiente altura que s168 había
           medido, no el umbral— y NO se puede gatear con
           --pace-home-squeeze == 0, primero porque es una custom property que
           fija el JS y una media query no la lee, y segundo porque vale 0
           EXACTAMENTE desde 736, o sea justo por debajo del umbral real.

         · ANCHO >= 390. Este suelo NO es por el aro: es por el botón de menú
           («Abrir panel»), que vive FUERA de la topbar y por eso ni el banco de
           s168 ni la primera versión de este gate lo miraban. La pill mide 244
           px fijos y va centrada, así que su hueco con el menú es
           ancho / 2 - 175,5: a 320 lo PISA 15 px, a 360 deja 5, a 375 deja 12
           y a 390 deja 20. El usuario descartó los 12 px de 375 por justos, así
           que el suelo es 390 y por debajo la pill sencillamente no aparece.

         La pill va ARRIBA y los iconos debajo, y eso no es estético: el DOM la
         tiene ANTES que los iconos (TopBar.jsx), así que ponerla debajo haría
         que el foco recorriera la topbar de abajo arriba (WCAG 2.4.3) — el
         defecto exacto que s160 arregló en la home. Con la pill arriba, orden
         visual y orden del DOM coinciden sin tocar el JSX.
         Lo aserta tests/topbar-pill-movil.spec.js. */
      @media (min-width: 390px) and (max-width: 768px) and (min-height: 760px) {
        [data-pace-topbar] {
          /* Los 42 px se añaden ARRIBA y los iconos bajan con align-items.
             El min-height de la piel (48 px) no interviene: 102 lo supera. */
          align-items: flex-end !important;
          padding-top: calc(10px - 4px * var(--pace-home-squeeze, 0) + 42px) !important;
        }
        [data-pace-topbar] [data-pace-tabs] {
          display: inline-flex !important;
          /* Sólo se recentra en X: la Y la fija el padding de arriba, no el 50%
             de la fila, que ahora mide 102 px y la dejaría sobre los iconos. */
          top: calc(10px - 4px * var(--pace-home-squeeze, 0)) !important;
          transform: translateX(-50%) !important;
        }
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
      /* EL HORIZONTE EN MÓVIL ES ACTIVIDADES (s166) — antes lo era la tarjeta
         de Camino, y solo pasaba a Actividades cuando la tarjeta no existía
         (Camino EN CURSO, s156). Con el orden único de s166 —aro, Actividades,
         Camino en las dos pieles— Actividades es SIEMPRE el primero después del
         aro, así que este selector de hermano adyacente ya casa siempre y dice
         exactamente lo mismo que antes: «el horizonte es el primero de abajo».
         Se conserva el selector adyacente y no un [data-pace-activitybar] a
         secas porque es lo que impide que el día que algo se cuele entre el aro
         y Actividades el solapamiento siga aplicándose al bloque equivocado.
         MISMA REGLA QUE ESCRITORIO, y el z-index también: Actividades pinta
         SOBRE el arco del aro, que es lo que la tarjeta hacía con su z-index:2. */
      [data-pace-home-stack] > [data-pace-main-content] + [data-pace-activitybar] {
        position: relative;
        z-index: 1;
        margin-top: calc(var(--pace-horizon) * -1) !important;
      }
      /* Y LA TARJETA DEJA DE SER EL HORIZONTE. Su margin-top negativo vive en
         SuggestedPathCard.jsx y era correcto mientras la tarjeta iba pegada al
         aro; ahora va debajo de Actividades y ese margen la subiría encima de
         los chips. Escritorio ya lo anulaba por esta misma razón desde s126 —
         es la misma línea, palabra por palabra. */
      [data-pace-spc] {
        margin-top: 0 !important;
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
