/* PACE · app/ui/toques.css.jsx — la zona que el dedo puede tocar, más grande que el botón
   ==========================================================================================
   En el recorrido del 13 oct. salieron una treintena de botones del móvil por debajo de los
   32 px de alto: los minutos (26), las píldoras de Ajustes (24), los interruptores (18), el
   «+ vaso» de la barra (21), «Tus rutinas» (18), «ES · EN» y «← Atrás» (24)… Ez pidió
   agrandar lo que se puede tocar SIN cambiar cómo se ve.

   CÓMO: un `::before` transparente y absoluto alrededor del botón. No ocupa sitio ni se pinta,
   pero recibe el toque. Crece SOLO hasta el hueco libre que hay con el control de al lado
   (medido a 360 x 718): dos píldoras de Ajustes tienen 14 px entre filas, así que cada una
   crece 7 y no pisa a la otra. Ningún botón de la lista usaba ya `::before`; los que llevan
   `::after` (el pomo del interruptor, la flecha de «Tus rutinas») lo conservan.

   EN EL MÓVIL Y CON DEDO, todo esto; con ratón, solo lo que no llegaba a 24 px (el bloque de abajo).
   Lo vigilan tests/toques-movil.spec.js y tests/fondo-24nov.spec.js. */
(function () {
  if (document.getElementById('pace-toques-css')) return;
  var s = document.createElement('style');
  s.id = 'pace-toques-css';
  s.textContent = `
    @media (max-width: 640px), (pointer: coarse) {
      [data-pace-toque], .pace-aj-pild, .pace-aj-cerrar, .pace-aj-paso > button, .pace-aj-sw,
      .pace-lib-link, [data-pace-hoy-celda], [data-pace-semana-saltar], [data-pace-stats-tabs] > button,
      .pace-aj-pie a, .pace-aj-sec-accion, .pace-aj-volver, [data-pace-hoy-volver], [data-pace-tabs] > button {
        position: relative;
      }
      [data-pace-toque]::before, .pace-aj-pild::before, .pace-aj-cerrar::before, .pace-aj-paso > button::before,
      .pace-aj-sw::before, .pace-lib-link::before, [data-pace-hoy-celda]::before,
      [data-pace-semana-saltar]::before, [data-pace-stats-tabs] > button::before, .pace-aj-pie a::before,
      .pace-aj-sec-accion::before, .pace-aj-volver::before, [data-pace-hoy-volver]::before, [data-pace-tabs] > button::before {
        content: ''; position: absolute; inset: -9px 0;
      }
      /* Píldoras de Ajustes: 14 px entre filas, 7 cada una. */
      .pace-aj-pild::before { inset: -7px 0; }
      /* Interruptor: 11 px libres encima en la fila más justa. */
      .pace-aj-sw::before { inset: -5px -8px; }
      /* La × de Ajustes crece hacia arriba (17 px libres hasta el borde del panel) y nada hacia
         abajo: a 6 px está «Visita guiada ›», en la línea de «Ver», que se queda ese hueco. */
      .pace-aj-cerrar::before { inset: -15px -9px 0; }
      .pace-aj-paso > button::before { inset: -7px -4px; }
      /* «Tus rutinas»: 8 px encima y 12 debajo hasta los filtros. */
      .pace-lib-link::before { inset: -4px -6px -6px; }
      /* «Cada semana es distinta»: 17 px encima, 5 debajo. */
      [data-pace-semana-saltar]::before { inset: -10px 0 -2px; }
      [data-pace-hoy-celda]::before { inset: -11px 0; }
      [data-pace-stats-tabs] > button::before { inset: -7px 0; }
      /* «Seguridad» y «Privacidad», al pie de Ajustes: 15 px de alto y nada debajo. */
      .pace-aj-pie a::before { inset: -6px -2px; }
      /* En el móvil, «Copias, borrar y PACE completo ›» (30 px de caja, 8 libres encima) y la «‹»
         que vuelve de «Tus datos» (28 px). */
      .pace-aj-sec-accion::before { inset: -5px -4px; }
      .pace-aj-volver::before { inset: -6px; }
      /* «Visita guiada ›», en la primera sección, sube los 6 px libres hasta la ×. Debajo, a 4 px,
         las píldoras del idioma suben sus 7 de siempre y se quedan el borde de su caja: entre la
         × y esas píldoras hay 40 px, y lo que se le diera de más a una se le quitaría a la otra. */
      .pace-aj-cab + .pace-aj-sec .pace-aj-sec-accion::before { top: -6px; }
      /* «Ponle ritmo al día», en Estadísticas › Hoy: 14 px de caja, 31 libres encima y 16 debajo
         (a 360 x 640), así que crece 14 hacia arriba y 8 hacia abajo (caza del móvil, 22 nov.). */
      [data-pace-hoy-volver]::before { inset: -14px -6px -8px; }
      /* Foco, Pausa y Larga, arriba en los móviles altos (390 x 844 y más): 26 px de caja y 12 libres
         hasta la tarjeta de debajo en la más justa; crecen 7 arriba y 6 abajo. */
      [data-pace-tabs] > button::before { inset: -7px 0 -6px; }
    }
    /* EN EL ORDENADOR, CON RATÓN (Ez, F6A del 24 nov. 2026): la auditoría a fondo midió enlaces de 14 a
       17 px de alto («Ajustar el horario», «Cambiar», «Al calendario», «Ahora no», «Ponle ritmo al día»,
       el pie de Ajustes), la fila del agua de la barra (21) y el interruptor «Comer hoy» (22 x 12). Crecen
       hasta 24 px, el mínimo para apuntar, con la misma zona invisible del móvil y sin cambiar cómo se
       ven. Los enlaces de la cabecera estrecha llevan la píldora «Hoy voy por libre» 4 px encima: crecen
       5, y la píldora, que va después en el DOM, se queda entera su caja. */
    @media (min-width: 641px) and (pointer: fine) {
      .pace-rt-enlace, .pace-aj-pie a, [data-pace-hoy-celda] { position: relative; }
      .pace-rt-enlace::before, .pace-aj-pie a::before, [data-pace-hoy-celda]::before,
      .pace-rt-mini-int[data-pace-ritmo-comes]::before { content: ''; position: absolute; }
      .pace-rt-enlace::before, .pace-aj-pie a::before { inset: -5px -2px; }
      [data-pace-hoy-celda]::before { inset: -2px 0; }
      /* «Comer hoy» va en la primera línea de la frase del horario: 5 px debajo está el selector de la hora
         de la siguiente, que se queda su caja; encima solo hay texto, así que crece hacia arriba. */
      .pace-rt-mini-int[data-pace-ritmo-comes]::before { inset: -9px -1px -6px; }
    }
  `;
  document.head.appendChild(s);
})();
