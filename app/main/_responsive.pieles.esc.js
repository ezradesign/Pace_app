/* PACE · LA PIEL DE ESCRITORIO (s197 · v0.130.0)
   =============================================
   CORTE POR UN PUNTO, no extracción: esto era el bloque final de
   `_responsive.pieles.js`, que al añadir la regla de la pill en tableta pasó de
   500 líneas (CLAUDE.md §1). Sale tal cual, byte a byte, en su propio <style>.

   QUÉ VIVE AQUÍ: el bloque `@media ${PACE_CORTE_ESC}` con la composición de la home
   de escritorio (s126). Ni una regla de la piel de móvil.

   VA DESPUÉS DE `_responsive.pieles.js` EN PACE.html, Y NO ES OPCIONAL: las dos
   hojas escriben sobre los mismos selectores con la misma especificidad, así que
   quien gana es quien se inyecta DESPUÉS. Ese era ya el orden dentro del archivo
   único y hay que conservarlo. */

(function injectPaceMainPielesEscCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-pieles-esc-css')) return;

  const s = document.createElement('style');
  s.id = 'pace-main-pieles-esc-css';
  s.textContent = `
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
    @media ${PACE_CORTE_ESC} {
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
        /* s185 · el numero sube para quedar a la MISMA distancia de tinta de
           «FOCO MANUAL» y de «Foco breve» (53/23 -> 43/36, medido en pixeles y
           no por caja: el lineHeight 0.9 deja 42 px de aire muerto arriba). Va
           aqui ademas de en linea porque estas reglas llevan !important. */
        margin-top: calc(var(--pace-timer-d, 360px) * -0.024) !important;
      }
      [data-pace-dial-fit] [data-pace-dial-subtitle] {
        font-size: clamp(11px, calc(var(--pace-timer-d, 360px) * 0.036), 19px) !important;
        /* s185 · +0,036 D para COMPENSAR el margen negativo del numero. Un
           margen negativo arriba del numero se lo lleva todo lo de abajo con el
           (flujo normal), asi que subirlo solo acercaba las dos cosas en bloque
           y la distancia de abajo no se movia: medido, 53/23 pasaba a 38/25 en
           vez de a 38/38. Sumando aqui lo mismo que se resto alli, el subtitulo
           se queda donde estaba, el numero sube de verdad, **y el alto del
           bloque no cambia** -- que importa porque el marco lo centra. */
        margin-top: clamp(10px, calc(var(--pace-timer-d, 360px) * 0.101), 56px) !important;
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
        container-type: inline-size;
      }
      /* s195: LOS CUATRO CHIPS CABEN SIEMPRE. En fila miden 756 y la home tiene 664
         a 1024 px y 460 en tableta vertical (820): «Hidratate» asomaba (auditoria
         s195). Por CONTENEDOR, porque plegar la barra cambia el ancho: hasta 760,
         chips compactos; hasta 560, la rejilla 2 x 2. Estilos en linea: !important. */
      @container (max-width: 760px) { [data-pace-activitybar-grid] { gap: 10px !important; }
        [data-pace-activitybar-chip] { min-width: 0 !important; flex: 1 1 0 !important; padding: 12px 14px !important; gap: 10px !important; } }
      @container (max-width: 560px) { [data-pace-activitybar-grid] { display: grid !important; grid-template-columns: 1fr 1fr; } }
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
