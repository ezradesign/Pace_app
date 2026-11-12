/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   MEDIDAS DEL MOTOR DE LA HOME (home-geometry.js), aparte para que el motor quepa en 500 líneas.
   Solo leen la página: no publican nada ni saben del estado de la app.

   CON LA LETRA GRANDE, LA TARJETA DEL DÍA ENSEÑA SOLO «AHORA» (Ez, 1 A2, 12 nov. 2026).
   Con la letra del sistema al 115 % (el zoom de texto que el WebView de Android toma de la
   letra del móvil), el día servido pedía 36 px de scroll a 360×640 y 38 con la pausa abierta:
   el aro ya estaba en su suelo y no había más que encoger. La fila de «Luego» (la que lleva
   `data-pace-ritmo-luego`) se esconde entonces, y sigue a un toque en «Ver todo».
   Cómo se decide: se MIDE, no se adivina la escala del sistema. El motor ajusta el aro con
   «Luego» a la vista; si aun en su suelo la home desborda, prueba sin «Luego», y solo lo
   deja escondido si así cabe (si tampoco cabe, como a 320×568 con la letra normal, nada
   cambia). Todo en la misma pasada síncrona, sin pintar entre medias: no parpadea. Y como la
   respuesta depende solo de lo que hay en pantalla, cada pasada da la misma: no baila.
   Escondida con `display: none` (_responsive.pieles.js), la fila no recibe el foco ni la lee el lector. */

var PACE_HOME_JUSTA = 'data-pace-home-justa';   // en [data-pace-home-body]: «Luego» no cabe

/* Y SIN «LUEGO», LAS ACTIVIDADES EN UNA FILA, SOLO CON SU DIBUJO (Ez, B, 12 nov. 2026).
   La tarjeta corta («¿Cuánto trabajas hoy?») y el día ya contestado no tienen «Luego»: al 115 %
   pedían 21 px en castellano y 49 en inglés a 360×640. Lo que se recoge ahí es la rejilla de dos
   por dos de Actividades: las cuatro pasan a una fila y el nombre deja de verse. Se decide igual
   que «Luego»: midiendo, en la misma pasada y solo si así cabe. El nombre sigue en el lector de
   pantalla (`aria-label`) y en el tooltip (`title`); los pone el motor y no ActivityBar porque con
   la letra normal la barra no cambia en nada, tampoco al pasar el ratón. */
var PACE_HOME_FILA = 'data-pace-home-fila';     // en [data-pace-home-body]: Actividades en una fila

/* La fila de «Luego» de la tarjeta del día en el móvil, si la hay. */
function paceHomeLuego(body) {
  return body ? body.querySelector('.pace-rt-mov [data-pace-ritmo-luego]') : null;
}

/* Los cuatro botones de Actividades (solo existen en la tarjeta corta y el día contestado). */
function paceHomeChips(body) {
  return body ? body.querySelectorAll('[data-pace-activitybar-chip]') : [];
}

function paceHomeMarca(body, marca, si) {
  if (si) { if (!body.hasAttribute(marca)) body.setAttribute(marca, ''); }
  else if (body.hasAttribute(marca)) body.removeAttribute(marca);
}

function paceHomeRecoger(body, si) { paceHomeMarca(body, PACE_HOME_JUSTA, si); }
function paceHomeFila(body, si) { paceHomeMarca(body, PACE_HOME_FILA, si); }

/* Al acabar la pasada, no en cada intento: el nombre de cada actividad en `aria-label` y `title`
   mientras va en fila, y nada cuando no. Se lee del rótulo, así que sigue el idioma. */
function paceHomeFilaNombres(body) {
  if (!body) return;
  var fila = body.hasAttribute(PACE_HOME_FILA);
  var chips = paceHomeChips(body);
  for (var i = 0; i < chips.length; i++) {
    var rotulo = chips[i].querySelector('[data-pace-chip-label]');
    var nombre = fila && rotulo ? rotulo.textContent : '';
    ['aria-label', 'title'].forEach(function (a) {
      if (!nombre) { if (chips[i].hasAttribute(a)) chips[i].removeAttribute(a); }
      else if (chips[i].getAttribute(a) !== nombre) chips[i].setAttribute(a, nombre);
    });
  }
}

/* Localiza los puntos CICLO por texto (i18n: «Ciclo N/4» / «Cycle N/4») y toma el borde
   inferior más bajo entre las coincidencias. Sin hook JSX. */
function paceAroCicloAbajo(dial, re) {
  var best = null;
  var nodes = dial.querySelectorAll('span, div');
  for (var i = 0; i < nodes.length; i++) {
    if (re.test(nodes[i].textContent || '')) {
      var b = paceCaja(nodes[i]).bottom;
      if (best == null || b > best) best = b;
    }
  }
  return best;
}

/* El diametro que pide el interior con el D aplicado ahora: la esquina mas lejana del centro
   de todo lo que se pinta dentro, partida por `radio` (RADIO_INTERIOR del motor). Solo cuentan
   las HOJAS: el bloque que las envuelve mide el 70 % del aro y sus esquinas quedan fuera del
   circulo por construccion. Lo que esta oculto con visibility (la fila del ciclo cuando el
   panel de A tu ritmo ocupa su hueco) no se pinta y no cuenta. */
function paceAroPisoInterior(dial, radio) {
  var numero = dial.querySelector('[data-pace-dial-number]');
  var bloque = numero && numero.parentElement;
  if (!bloque) return 0;
  var f = paceCaja(dial);
  var cx = f.left + f.width / 2;
  var cy = f.top + f.height / 2;
  var peor = 0;
  var nodos = bloque.querySelectorAll('*');
  for (var i = 0; i < nodos.length; i++) {
    if (nodos[i].children.length) continue;
    var r = paceCaja(nodos[i]);
    if (!r.width || !r.height) continue;
    if (getComputedStyle(nodos[i]).visibility === 'hidden') continue;
    var dx = Math.max(Math.abs(r.left - cx), Math.abs(r.right - cx));
    var dy = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy));
    peor = Math.max(peor, Math.sqrt(dx * dx + dy * dy));
  }
  return Math.ceil(peor / radio);
}
