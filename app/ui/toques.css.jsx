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

   SOLO EN EL MÓVIL Y CON DEDO: con ratón, la zona de siempre.
   Lo vigila tests/toques-movil.spec.js. */
(function () {
  if (document.getElementById('pace-toques-css')) return;
  var s = document.createElement('style');
  s.id = 'pace-toques-css';
  s.textContent = `
    @media (max-width: 640px), (pointer: coarse) {
      [data-pace-toque], .pace-aj-pild, .pace-aj-cerrar, .pace-aj-paso > button, .pace-aj-sw,
      .pace-lib-link, [data-pace-hoy-celda], [data-pace-semana-saltar], [data-pace-stats-tabs] > button,
      .pace-aj-pie a {
        position: relative;
      }
      [data-pace-toque]::before, .pace-aj-pild::before, .pace-aj-cerrar::before, .pace-aj-paso > button::before,
      .pace-aj-sw::before, .pace-lib-link::before, [data-pace-hoy-celda]::before,
      [data-pace-semana-saltar]::before, [data-pace-stats-tabs] > button::before, .pace-aj-pie a::before {
        content: ''; position: absolute; inset: -9px 0;
      }
      /* Píldoras de Ajustes: 14 px entre filas, 7 cada una. */
      .pace-aj-pild::before { inset: -7px 0; }
      /* Interruptor: 11 px libres encima en la fila más justa. */
      .pace-aj-sw::before { inset: -5px -8px; }
      .pace-aj-cerrar::before { inset: -9px; }
      .pace-aj-paso > button::before { inset: -7px -4px; }
      /* «Tus rutinas»: 8 px encima y 12 debajo hasta los filtros. */
      .pace-lib-link::before { inset: -4px -6px -6px; }
      /* «Cada semana es distinta»: 17 px encima, 5 debajo. */
      [data-pace-semana-saltar]::before { inset: -10px 0 -2px; }
      [data-pace-hoy-celda]::before { inset: -11px 0; }
      [data-pace-stats-tabs] > button::before { inset: -7px 0; }
      /* «Seguridad» y «Privacidad», al pie de Ajustes: 15 px de alto y nada debajo. */
      .pace-aj-pie a::before { inset: -6px -2px; }
    }
  `;
  document.head.appendChild(s);
})();
