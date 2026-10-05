/* PACE · la carpeta web que empaqueta Android
 * ===========================================
 * Capacitor copia a la app de Android una carpeta con la web ya hecha
 * (`webDir` en capacitor.config.json). Esa carpeta es `www/`, no la raiz del
 * repo: la raiz lleva node_modules, docs y las fuentes, y nada de eso debe
 * acabar dentro del APK.
 *
 * Lo que entra: el artefacto ya compilado (`index.html`, que el CI comprueba
 * que esta al dia), las paginas legales, el manifest, los iconos, las fuentes
 * y los medios de `app/` (imagenes y audio que la app pide por ruta). Las
 * fuentes JS y CSS de `app/` no entran porque `index.html` ya las lleva dentro.
 *
 * Uso: `npm run android:www` (lo llama `npm run android:sync`).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'www');

const ARCHIVOS = ['index.html', 'privacy.html', 'safety.html', 'manifest.webmanifest'];
const CARPETAS = ['icons', 'fonts'];
const MEDIOS = /\.(webp|png|jpe?g|svg|mp3|m4a|ogg|wav)$/i;

function copiar(rel) {
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(path.join(ROOT, rel), dst);
}

function recorrer(rel, filtro, fuera) {
  for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const hijo = path.posix.join(rel, e.name);
    if (e.isDirectory()) recorrer(hijo, filtro, fuera);
    else if (!filtro || filtro.test(e.name)) fuera.push(hijo);
  }
  return fuera;
}

fs.rmSync(OUT, { recursive: true, force: true });

const lista = ARCHIVOS.slice();
for (const d of CARPETAS) recorrer(d, null, lista);
recorrer('app', MEDIOS, lista);

let bytes = 0;
for (const rel of lista) {
  copiar(rel);
  bytes += fs.statSync(path.join(OUT, rel)).size;
}

console.log('www/: ' + lista.length + ' archivos, ' + (bytes / 1048576).toFixed(1) + ' MB');
