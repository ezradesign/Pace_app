/* PACE · Caminos · Índice de láminas (sesión 104 / v0.49.0)
   Mapa pathId -> escena editorial (arte D-4 entregado por el usuario,
   se porta literal). Despliegue INCREMENTAL: los caminos sin entrada
   aquí caen al SenderoBar clásico (el fallback vive en los padres:
   TransitionCardBase y CompletionScreen).

   Metadatos por lámina (espacio de imagen, px sobre w x h):
     dots  — centro {x,y}, radio r y color de las bolas PINTADAS en el
             arte, en orden de paso (medidos por escaneo de canvas, no
             a ojo). Cada arte debe traer EXACTAMENTE tantas bolas como
             pasos. El color pintado queda siempre CUBIERTO por el
             casquete (s104c) — solo posiciones/radios importan.
     paper — color del papel del arte (muestreado del cielo).
     focusY— altura focal del encuadre cover (franja del sendero).
     finish— x del encuadre de la Completion (el FINAL del camino).

   Pipeline decidido en s104: la web (PACE.html / index.html) sirve los
   .webp como archivos (+ PRECACHE en sw.js); el build los inlinea como
   data URIs SOLO en el standalone (file://, autocontenido). OJO build:
   el replace busca el literal del campo src -- no escribir esa ruta
   completa en comentarios. */

const PATH_ILLUSTRATIONS = {
  'path.dawn': {
    src: 'app/paths/illustrations/assets/dawn.webp',
    w: 1365, h: 768,
    paper: '#f2e9d5',
    focusY: 0.64,
    /* Encuadre de la Completion: el FINAL del camino (tramo punteado
       hacia el sol y el cartel), no el último hito. Bien a la derecha:
       las bolas completadas quedan a la izquierda/atrás (s104c bis). */
    finish: { x: 1230 },
    /* Bolas pintadas: centro/radio/color EXACTOS (bbox por distancia de
       color + crecimiento radial, no a ojo). El velo y el latido se
       calculan de estos valores. */
    dots: [
      { x: 303, y: 511, r: 14, color: '#c0714e' },
      { x: 617, y: 506, r: 14, color: '#d0a152' },
      { x: 892, y: 489, r: 13, color: '#a4a67d' },
    ],
  },
  'path.midday': {
    src: 'app/paths/illustrations/assets/midday.webp',
    w: 1365, h: 768,
    paper: '#ece4cc',
    focusY: 0.72,
    finish: { x: 1240 }, /* el camino serpentea al horizonte junto al monolito */
    dots: [
      { x: 347, y: 587, r: 9, color: '#be754b' },
      { x: 707, y: 543, r: 9, color: '#c69c46' },
      { x: 943, y: 525, r: 9, color: '#798587' },
    ],
  },
  'path.afternoon': {
    src: 'app/paths/illustrations/assets/afternoon.webp',
    w: 1365, h: 768,
    paper: '#ece4cc',
    focusY: 0.68,
    finish: { x: 1220 }, /* el sol bajo tras el banco */
    dots: [
      { x: 390, y: 533, r: 13, color: '#cb865e' },
      { x: 644, y: 513, r: 12, color: '#cea767' },
      { x: 866, y: 512, r: 12, color: '#a6a176' },
    ],
  },
  'path.tea': {
    src: 'app/paths/illustrations/assets/tea.webp',
    w: 1365, h: 768,
    paper: '#f4ecd4',
    focusY: 0.64,
    finish: { x: 1240 }, /* la tetera humeante */
    dots: [
      { x: 344, y: 515, r: 11, color: '#bd6a44' },
      { x: 648, y: 450, r: 11, color: '#c3964a' },
      { x: 897, y: 501, r: 11, color: '#849063' },
    ],
  },
  'path.dusk': {
    src: 'app/paths/illustrations/assets/dusk.webp',
    w: 1365, h: 768,
    paper: '#ecdcc4',
    focusY: 0.67,
    finish: { x: 1240 }, /* el farol encendido bajo la luna */
    dots: [
      { x: 289, y: 471, r: 14, color: '#c24c28' },
      { x: 611, y: 516, r: 14, color: '#da8e41' },
      { x: 839, y: 566, r: 14, color: '#525f38' },
    ],
  },
  'path.weekend': {
    src: 'app/paths/illustrations/assets/weekend.webp',
    w: 1365, h: 768,
    paper: '#ece4cc',
    focusY: 0.64,
    finish: { x: 1230 }, /* la cabaña con humo en la colina */
    dots: [
      { x: 275, y: 473, r: 13, color: '#c07951' },
      { x: 621, y: 510, r: 13, color: '#d0a14d' },
      { x: 989, y: 489, r: 13, color: '#909773' },
    ],
  },
  'path.breath': {
    src: 'app/paths/illustrations/assets/breath.webp',
    w: 1365, h: 768,
    paper: '#f4ecd4',
    focusY: 0.59,
    finish: { x: 1210 }, /* la flor de loto */
    dots: [
      { x: 458, y: 452, r: 16, color: '#c27e5d' },
      { x: 751, y: 452, r: 16, color: '#bf7c5c' },
    ],
  },
};

function getPathIllustration(pathId) {
  return PATH_ILLUSTRATIONS[pathId] || null;
}

window.PATH_ILLUSTRATIONS = PATH_ILLUSTRATIONS;
window.getPathIllustration = getPathIllustration;
