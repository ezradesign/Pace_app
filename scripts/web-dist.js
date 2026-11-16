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
 * calendario, /premium, /beta, /gracias, /recuperar y /desistir. `functions/` no entra:
 * Cloudflare la lee de la raiz.
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

/* `robots.txt` y `sitemap.xml`: sin ellos Cloudflare servía la app con un 200 en esas dos
   direcciones y los buscadores leían una página en vez de las reglas (auditoría del 10 nov., X2b). */
/* `manifest.en.webmanifest`: el manifiesto en inglés, que pone la app cuando su idioma es el inglés
   (applyLang). Solo en la web: en Android y en el iPhone no hay instalación desde el navegador. */
/* `404.html`, ARRIBA DEL TODO Y CON ESE NOMBRE: sin él, Cloudflare Pages toma la web por una app de
   una página y sirve `index.html` (la app entera, más de 2 MB) con un 200 en cualquier ruta que no
   existe; con él, sirve esa página con su 404 (auditoría externa del 16 nov. 2026). */
const WEB_ARCHIVOS = ['sw.js', '_headers', 'calendario.html', 'robots.txt', 'sitemap.xml', 'manifest.en.webmanifest', '404.html'];
const WEB_CARPETAS = ['premium', 'beta', 'gracias', 'recuperar', 'desistir'];

/* Lo que va en `dist/`, en rutas relativas a la raiz. */
function listaWeb() {
  const lista = www.listaWww().concat(WEB_ARCHIVOS);
  for (const d of WEB_CARPETAS) www.recorrer(d, null, lista);
  return lista;
}

/* /BETA, CON LOS ENLACES YA ENCENDIDOS EN EL HTML (auditoría externa del 16 nov. 2026). Los enlaces viven
   solo en su bloque `data-enlaces`, y el script de la página enseña el botón de cada uno que ya funciona
   y esconde su «pronto». Sin JavaScript (un buscador, la vista previa de un enlace, algún navegador
   dentro de una app) se leía «El grupo abre muy pronto» aunque el grupo estuviera abierto. Aquí se hace
   lo mismo que el script, al publicar: el botón con su dirección y sin `hidden`, y su «pronto» con
   `hidden`. Con JavaScript se ve igual que antes (el script lo vuelve a hacer y no cambia nada). Si el
   bloque falta o no se lee, lanza: mejor un build rojo que una /beta que dice lo que no es. */
function encenderEnlacesBeta(html) {
  const m = html.match(/<script type="application\/json" data-enlaces>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('beta/index.html sin su bloque data-enlaces');
  const enlaces = JSON.parse(m[1]);
  const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  for (const clave of Object.keys(enlaces)) {
    const e = enlaces[clave];
    if (!e || e.pendiente || !/^https:\/\//.test(e.url || '')) continue;
    const boton = new RegExp('<a [^>]*data-enlace="' + clave + '"[^>]*>');
    const pronto = new RegExp('<p [^>]*data-pronto="' + clave + '"[^>]*>');
    if (!boton.test(html) || !pronto.test(html)) throw new Error('beta/index.html: el enlace «' + clave + '» no tiene su botón y su «pronto»');
    html = html.replace(boton, (tag) => tag.replace(/ href="[^"]*"/, ' href="' + attr(e.url) + '"').replace(/ hidden(?=[\s>])/, ''));
    html = html.replace(pronto, (tag) => (/ hidden(?=[\s>])/.test(tag) ? tag : tag.replace(/>$/, ' hidden>')));
  }
  return html;
}

function montarWeb(out) {
  return www.copiarTodo(listaWeb(), out || OUT, (rel, contenido) =>
    (rel === 'beta/index.html' ? Buffer.from(encenderEnlacesBeta(contenido.toString('utf8')), 'utf8') : contenido));
}

if (require.main === module) {
  const r = montarWeb(OUT);
  console.log('dist/: ' + r.archivos + ' archivos, ' + (r.bytes / 1048576).toFixed(1) + ' MB');
}

module.exports = { listaWeb, montarWeb, encenderEnlacesBeta };
