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
 * La web publica esto mismo y lo que solo tiene ella (`scripts/web-dist.js`),
 * por eso la lista se exporta: lo que se anada aqui llega a los dos sitios.
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

function recorrer(rel, filtro, fuera) {
  for (const e of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
    const hijo = path.posix.join(rel, e.name);
    if (e.isDirectory()) recorrer(hijo, filtro, fuera);
    else if (!filtro || filtro.test(e.name)) fuera.push(hijo);
  }
  return fuera;
}

/* Lo que va en `www/`, en rutas relativas a la raiz. */
function listaWww() {
  const lista = ARCHIVOS.slice();
  for (const d of CARPETAS) recorrer(d, null, lista);
  recorrer('app', MEDIOS, lista);
  return lista;
}

/* LA LANDING NO VA EN LAS APPS (opcion C, Ez, 9 nov. 2026): el index.html de la web lleva
   la raiz con dos caras entre las marcas `pace-landing` (build-standalone.js), y en Android y en
   iPhone se abre siempre la app. Se quita el bloque entero: sin la decision, la app monta como
   siempre. Lanza si las marcas no casan, para no copiar media landing. */
function quitarLanding(html) {
  const partes = html.split('<!--pace-landing-->');
  let limpio = partes[0];
  for (let i = 1; i < partes.length; i++) {
    const fin = partes[i].indexOf('<!--/pace-landing-->');
    if (fin < 0) throw new Error('quitarLanding: una marca de inicio sin su fin');
    limpio += partes[i].slice(fin + '<!--/pace-landing-->'.length);
  }
  if (limpio.indexOf('<!--/pace-landing-->') >= 0) throw new Error('quitarLanding: una marca de fin sin su inicio');
  return limpio;
}

/* Lo que cambia al copiar a las apps: solo index.html, sin la landing. */
function paraApps(rel, bytes) {
  return rel === 'index.html' ? Buffer.from(quitarLanding(bytes.toString('utf8')), 'utf8') : bytes;
}

/* Vacia `out` y copia ahi la lista: { archivos, bytes }. Nunca sobre la raiz
   ni una carpeta que la contenga, que el vaciado se llevaria el repo. `transformar(rel, bytes)`,
   si lo hay, cambia lo que se escribe (las apps quitan la landing; la web copia tal cual). */
function copiarTodo(lista, out, transformar) {
  const destino = path.resolve(out);
  if ((path.resolve(ROOT) + path.sep).startsWith(destino + path.sep)) throw new Error('copiarTodo: ' + destino + ' contiene el repo');
  fs.rmSync(destino, { recursive: true, force: true });
  let bytes = 0;
  for (const rel of lista) {
    const dst = path.join(destino, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (transformar) fs.writeFileSync(dst, transformar(rel, fs.readFileSync(path.join(ROOT, rel))));
    else fs.copyFileSync(path.join(ROOT, rel), dst);
    bytes += fs.statSync(dst).size;
  }
  return { archivos: lista.length, bytes };
}

if (require.main === module) {
  const r = copiarTodo(listaWww(), OUT, paraApps);
  console.log('www/: ' + r.archivos + ' archivos, ' + (r.bytes / 1048576).toFixed(1) + ' MB');
}

module.exports = { listaWww, recorrer, copiarTodo, quitarLanding, paraApps };
