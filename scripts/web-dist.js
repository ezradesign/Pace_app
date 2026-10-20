/* PACE · la carpeta que publica la web
 * ====================================
 * pacegrass.app publica `dist/`, no la raiz del repo (Ez, 18 oct. 2026): la
 * raiz lleva los documentos, las pruebas y las fotos de trabajo, y en el
 * dominio del producto solo se sirve la app. El repo sigue publico en GitHub.
 *
 * Lo que entra: lo mismo que `www/` (`android-www.js`: la app compilada, la
 * privacidad, la seguridad, el manifiesto, los iconos, las fuentes y los medios
 * de `app/`) y lo que solo tiene la web: el service worker, las cabeceras
 * (Cloudflare lee `_headers` de la carpeta publicada), la vuelta del permiso del
 * calendario y /premium. `functions/` no entra: Cloudflare la lee de la raiz.
 *
 * Una pagina nueva de la web entra en WEB_ARCHIVOS o WEB_CARPETAS, o no se
 * publica: `verify` falla si en la raiz hay una pagina que no esta aqui ni en
 * su lista de lo que no se publica (`scripts/verify.web.js`).
 *
 * Uso: `npm run web:dist`. En Cloudflare Pages, el comando de build es
 * `node scripts/web-dist.js` y la carpeta de salida, `dist`.
 */
'use strict';

const path = require('path');
const www = require('./android-www.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

const WEB_ARCHIVOS = ['sw.js', '_headers', 'calendario.html'];
const WEB_CARPETAS = ['premium'];

/* Lo que va en `dist/`, en rutas relativas a la raiz. */
function listaWeb() {
  const lista = www.listaWww().concat(WEB_ARCHIVOS);
  for (const d of WEB_CARPETAS) www.recorrer(d, null, lista);
  return lista;
}

function montarWeb(out) {
  return www.copiarTodo(listaWeb(), out || OUT);
}

if (require.main === module) {
  const r = montarWeb(OUT);
  console.log('dist/: ' + r.archivos + ' archivos, ' + (r.bytes / 1048576).toFixed(1) + ' MB');
}

module.exports = { listaWeb, montarWeb };
