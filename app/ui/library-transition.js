/* PACE · app/ui/library-transition.js (sesión 174)
   =================================================
   LA CAPITULAR DE LA TARJETA VUELA HASTA LA SESIÓN. Es el pago de haber
   decidido que la biblioteca NO lleva wash (§6 del rediseño): sin él, el
   momento de entrar se quedó sin su cambio de atmósfera, y esto se lo devuelve.

   POR QUÉ ATERRIZA EN LA CUENTA ATRÁS Y NO EN EL CÍRCULO DEL RUNNER, que es lo
   que el diseño decía. Medido en s174 sobre la app ya implementada: entre las
   dos cosas hay DOS pantallas —el Preview y la preparación— y el círculo tarda
   **3.114 ms** en existir desde que se pulsa «Empezar». Los dos elementos nunca
   están cerca en el tiempo, así que no hay movimiento continuo hasta allí. La
   cuenta atrás sí está a un frame, y desde s174 pinta el arte del primer paso
   EN EL SITIO Y AL TAMAÑO del círculo que vendrá después (misma fuente:
   `v1GlyphSizeAhora`), así que el relevo no salta.

   TRES COSAS QUE NO HACE, a propósito:
     · con `prefers-reduced-motion` no anima nada. La trampa de s160 aplica de
       lleno: `transition-property` vale `all` por defecto, así que el kill
       convierte cualquier cambio de geometría en transición. Aquí no se usa
       `transition` sino la Web Animations API sobre un CLON, que el kill no
       toca -- por eso se comprueba la preferencia a mano.
     · no toca el DOM de la sesión más que para ESCONDER un instante el arte de
       destino, y lo devuelve pase lo que pase (el `onfinish` y un plazo de
       seguridad hacen lo mismo).
     · si algo falta -- no hay capitular, no aparece el destino, el navegador no
       trae `animate()` -- se retira en silencio y la app se comporta como antes.
       Una transición no puede ser la razón de que no se entre en una sesión.

   `var`/`function` a propósito: un `const` top-level no cruza la IIFE del
   artefacto (trampa de s148). */

var PACE_VUELO_MS = 520;
var PACE_VUELO_FRAMES = 24;   /* ~400 ms buscando el destino, y se rinde */

function paceVueloReduce() {
  return typeof matchMedia === 'function'
    && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* El arte de destino: dentro del círculo de la preparación. Se busca el NIETO
   (el dibujo) y no el círculo, para que el vuelo sea dibujo -> dibujo y las dos
   cajas midan lo mismo que lo que se ve. */
function paceVueloDestino() {
  var caja = document.querySelector('[data-pace-session-prep-art]');
  if (!caja) return null;
  var circulo = caja.firstElementChild;
  var arte = circulo && circulo.firstElementChild;
  if (!arte) return null;
  var r = arte.getBoundingClientRect();
  return (r.width > 0 && r.height > 0) ? arte : null;
}

/* Captura la capitular ANTES de que la biblioteca se desmonte. Devuelve null
   —y el que llama no hace nada— si no hay nada que volar. */
function paceVueloCapitular(routineId) {
  if (paceVueloReduce()) return null;
  if (!routineId || typeof document === 'undefined') return null;
  /* LA TARJETA PUEDE ESTAR DOS VECES EN EL DOM, y hay que quedarse con la que
     SE VE. «Para ahora» se pinta en el lateral (escritorio) y bajo la cabecera
     (móvil): las dos copias existen siempre y la hoja apaga la que sobra, que
     es lo que s166 dejó decidido al quitar el lector de piel en JS.
     Con un `querySelector` a secas, en MÓVIL salía primero la copia del lateral
     —oculta, de ancho 0—, la función devolvía null y la transición no ocurría:
     medido, el clon no llegaba a crearse. Es el mismo tropiezo que ya había
     mentido cinco veces a las sondas de esta sesión; la sexta fue aquí, en el
     código que se publica. */
  var arte = null, r = null;
  var caps = document.querySelectorAll('[data-pace-lib-card="' + routineId + '"] .pace-lib-cap');
  for (var i = 0; i < caps.length; i++) {
    var cand = caps[i].firstElementChild;
    if (!cand) continue;
    var caja = cand.getBoundingClientRect();
    if (caja.width > 0 && caja.height > 0) { arte = cand; r = caja; break; }
  }
  if (!arte || !r || typeof arte.animate !== 'function') return null;

  var clon = arte.cloneNode(true);
  clon.setAttribute('data-pace-vuelo', '');
  clon.setAttribute('aria-hidden', 'true');
  clon.style.position = 'fixed';
  clon.style.left = r.left + 'px';
  clon.style.top = r.top + 'px';
  clon.style.width = r.width + 'px';
  clon.style.height = r.height + 'px';
  clon.style.margin = '0';
  clon.style.zIndex = '95';        /* sobre la sesión (90), bajo los modales (100) */
  clon.style.pointerEvents = 'none';
  clon.style.transformOrigin = 'top left';
  /* El color se HEREDA por `currentColor` en la máscara, y el clon sale del
     árbol de la tarjeta: sin fijarlo aquí, al colgarlo del <body> perdería el
     tono del módulo y volaría con el color del texto. */
  clon.style.color = getComputedStyle(arte).color;

  return { rect: r, clon: clon, aterrizar: function () { paceVueloAterrizar(r, clon); } };
}

/* Espera a que el destino exista (la sesión se monta un tick después de que la
   biblioteca se cierre) y anima. Si no aparece en PACE_VUELO_FRAMES, se rinde
   sin dejar rastro. */
function paceVueloAterrizar(origen, clon) {
  var frames = 0;
  var buscar = function () {
    var destino = paceVueloDestino();
    if (!destino) {
      if (++frames > PACE_VUELO_FRAMES) return;
      requestAnimationFrame(buscar);
      return;
    }
    var d = destino.getBoundingClientRect();
    document.body.appendChild(clon);
    var previa = destino.style.visibility;
    destino.style.visibility = 'hidden';
    var limpiar = function () {
      destino.style.visibility = previa || '';
      if (clon.parentNode) clon.parentNode.removeChild(clon);
    };
    var k = d.width / origen.width;
    var anim;
    try {
      anim = clon.animate([
        { transform: 'translate(0px, 0px) scale(1)' },
        { transform: 'translate(' + (d.left - origen.left) + 'px, ' + (d.top - origen.top) + 'px) scale(' + k + ')' },
      ], { duration: PACE_VUELO_MS, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
    } catch (e) { limpiar(); return; }
    anim.onfinish = limpiar;
    anim.oncancel = limpiar;
    /* Red de seguridad: si la animación nunca termina (pestaña oculta, motor
       que descarta la animación) el arte de destino NO puede quedarse invisible
       para siempre. */
    setTimeout(limpiar, PACE_VUELO_MS + 400);
  };
  requestAnimationFrame(buscar);
}

Object.assign(window, {
  paceVueloCapitular: paceVueloCapitular,
  paceVueloDestino: paceVueloDestino,
  paceVueloReduce: paceVueloReduce,
  PACE_VUELO_MS: PACE_VUELO_MS,
});
