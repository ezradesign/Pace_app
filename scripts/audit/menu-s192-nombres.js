/* PACE · textos fijos y glifos propios de «A tu ritmo» (s192 · ronda 4)
 * =====================================================================
 * DECIDIDO por el usuario en la ronda 3: el nombre es «A tu ritmo» y la comida
 * lleva tenedor y cuchillo (sin plato). Lo que quedó fuera, y por qué, está en las
 * maquetas de las rondas 2 y 3 (docs/proposals).
 *
 * «Ritmo» YA titula el panel de estadísticas (stats.title, topbar.stats.title) y la
 * bienvenida dice «Un ritmo para tu día» y «A tu ritmo.»: por eso la cejilla de la
 * barra lateral no lleva el nombre, dice «Siguiente pausa».
 *
 * Los glifos de actividad NO viven aquí: se calcan del DOM de la app (los chips de
 * la ActivityBar). Foco se copia de `app/main/ActivityBar.jsx` (ABFocus, s180) porque
 * en la home no se pinta en ningún chip. COMIDA es nuevo y sigue las reglas de la
 * familia AB*: lienzo 28×28, trazo 1,2, remates y uniones redondos, `currentColor`,
 * y un detalle secundario a opacidad baja (el mantel, como el suelo de Estira).
 */
'use strict';

function pmRecursos() {
  var abre = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">';
  return {
    NOMBRE: 'A tu ritmo',
    EN: 'At your pace',
    ENLACE: 'Ponle ritmo al día',
    SUB: 'Te preparo la jornada: cuándo parar, qué hacer y cuánto dura.',
    FOCO: abre + '<circle cx="14" cy="14" r="9.5" opacity="0.3"></circle><path d="M14 4.5a9.5 9.5 0 0 1 8.23 4.75"></path>'
      + '<circle cx="22.23" cy="9.25" r="1.5" fill="currentColor" stroke="none"></circle></svg>',
    /* Tenedor de tres púas unidas en U y cuchillo con el filo curvo a la derecha. */
    COMIDA: abre
      + '<path d="M8.5 4.5v5M11 4.5v5M13.5 4.5v5"></path>'
      + '<path d="M8.5 9.5c0 2.1 1.1 3.2 2.5 3.2s2.5-1.1 2.5-3.2"></path>'
      + '<path d="M11 12.7v10.8"></path>'
      + '<path d="M19 23.5V4.5c2.5 1.5 3.4 4.8 3.3 8.7 0 .8-.5 1.3-1.3 1.3H19"></path>'
      + '<path d="M5 25.5h18" opacity="0.35" stroke-dasharray="1.5 2.5"></path></svg>',
  };
}

module.exports = { pmRecursos };
