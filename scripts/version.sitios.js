/* PACE · LOS SITIOS DE LA VERSION (s198)
 * ======================================
 * Una sola lista para los dos que la usan: `scripts/verify.js` comprueba que los
 * siete digan lo mismo y `scripts/version.js` (`npm run bump -- X.Y.Z`) los
 * cambia a la vez. Antes la lista vivia dentro del verify y el cambio se hacia a
 * mano en siete sitios cada version; si alguien añade un sitio, lo añade AQUI y
 * los dos lo ven.
 *
 * s162 · LOS DOS README ESTAN EN LA LISTA, y no por pulcritud: se quedaron en
 * v0.84.0 mientras la app llegaba a v0.92.0 — ocho versiones de deriva en el
 * escaparate del repo. Cada uno declara la version en DOS sitios (la linea de
 * estado y el titulo de seccion) y van los dos, porque cambiar uno y no el otro
 * es el modo de fallo natural.
 *
 * Cada `re` captura la version con su «v» en el grupo 1.
 */
'use strict';

const PUNTOS = [
  { archivo: 'app/state-core.jsx', re: /const PACE_VERSION = '(v[\d.]+)'/ },
  { archivo: 'sw.js',              re: /const CACHE_NAME = 'pace-(v[\d.]+)'/ },
  { archivo: 'PACE.html',          re: /<title>[^<]*—\s*(v[\d.]+)\s*<\/title>/ },
  { archivo: 'README.md',          re: /\*\*Estado:\*\*\s*(v[\d.]+)/ },
  { archivo: 'README.md',          re: /Estado actual \((v[\d.]+)\)/ },
  { archivo: 'README_EN.md',       re: /\*\*Status:\*\*\s*(v[\d.]+)/ },
  { archivo: 'README_EN.md',       re: /Current state \((v[\d.]+)\)/ },
];

module.exports = { PUNTOS };
