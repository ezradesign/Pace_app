/* PACE · scripts/audit/maqueta-s176.autonoma.js (sesión 176)
   ===========================================================
   LA MAQUETA DE RESPIRA EN **UN SOLO ARCHIVO**, que se abre desde cualquier
   sitio: fuentes, imágenes y variantes van dentro. Lo pidió el usuario así
   («¿me das un html para decidir?»), y un archivo suelto no puede depender de
   `_maqueta-s176/` ni de `fonts/`.

   LO QUE NO SE SACRIFICA POR SER AUTÓNOMO: cada variante sigue viviendo en un
   IFRAME de 1536x714 reales. Es la regla que hizo falla la maqueta de s174 —en
   un `<div>` estrecho las media queries leen el ancho de la PÁGINA y la
   maqueta miente— y aquí se conserva usando `srcdoc`.

   EL TRUCO DE TAMAÑO, porque si no el archivo no baja de 4 MB: las fuentes
   pesan 506 KB y un iframe NO hereda nada de su padre, así que meterlas en los
   seis marcos serían seis copias. Van UNA vez, en una constante de JS, y cada
   `srcdoc` se compone al cargar la página concatenando esa constante con el
   cuerpo de su variante. El navegador decodifica seis veces; el archivo las
   guarda una.

   Uso: node scripts/audit/maqueta-s176.autonoma.js  ->  _maqueta-s176-respira.html
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const R = require('./maqueta-s176.js');

const DIR = path.join(ROOT, '_maqueta-s176');
const SALIDA = path.join(ROOT, '_maqueta-s176-respira.html');

/* ── 1 · las fuentes, una sola vez y en data: URI ────────────────────────── */
/* Se leen las @font-face de `tokens.css` y se sustituye cada `url('/fonts/x')`
   por el archivo en base64. Si alguna falta, se AVISA y se sigue sin ella:
   quedarse sin una itálica afea la maqueta, pero inventar la ruta la rompería
   en silencio, que es peor. */
function fuentesInline() {
  const css = fs.readFileSync(path.join(ROOT, 'app/tokens.css'), 'utf8');
  const caras = css.split('\n').filter(l => /@font-face/.test(l));
  if (!caras.length) { console.error('GUARD: tokens.css sin @font-face'); process.exit(2); }
  let faltan = 0;
  const out = caras.map(linea => linea.replace(/url\('\/fonts\/([a-z0-9-]+\.woff2)'\)/g, (m, f) => {
    const p = path.join(ROOT, 'fonts', f);
    if (!fs.existsSync(p)) { faltan++; console.error('  AVISO: falta fonts/' + f); return m; }
    return "url('data:font/woff2;base64," + fs.readFileSync(p).toString('base64') + "')";
  })).join('\n');
  if (faltan === caras.length) { console.error('GUARD: no se pudo empotrar NINGUNA fuente'); process.exit(2); }
  return out;
}

/* ── 2 · el cuerpo de cada variante, SIN las @font-face ──────────────────── */
/* `R.doc()` mete `tokens.css` entero. Aquí se le quitan las caras -que van por
   la constante compartida- y el `<base href="../">`, que en un archivo suelto
   apuntaría a una carpeta que puede no existir. */
function cuerpo(clave) {
  const d = R.doc(clave);
  const sinCaras = d.split('\n').filter(l => !/@font-face/.test(l)).join('\n');
  const limpio = sinCaras.split('<base href="../">').join('');
  if (/@font-face/.test(limpio)) { console.error('GUARD: quedan @font-face en el marco ' + clave); process.exit(2); }
  if (!/pace-lib-card/.test(limpio)) { console.error('GUARD: el marco ' + clave + ' no lleva tarjetas'); process.exit(2); }
  return limpio;
}

/* ── 3 · la captura de la versión anterior, empotrada ────────────────────── */
function pngInline(nombre) {
  const p = path.join(DIR, nombre);
  if (!fs.existsSync(p)) { console.error('GUARD: falta ' + nombre + ' en _maqueta-s176/'); process.exit(2); }
  return 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
}

/* ── 4 · la tabla, con las cifras que midieron los propios marcos ────────── */
function tabla() {
  const p = path.join(DIR, 'medidas.json');
  if (!fs.existsSync(p)) { console.error('GUARD: falta medidas.json -- corre maqueta-s176.medir.js'); process.exit(2); }
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  const orden = ['respira-hoy', 'respira-a', 'respira-d', 'respira-b', 'respira-e', 'respira-c'];
  const filas = orden.map(k => {
    const d = m[k];
    if (!d || !d.tarjeta) { console.error('GUARD: sin medida para ' + k); process.exit(2); }
    const nom = k === 'respira-hoy' ? 'HOY · publicado' : R.VARIANTES[k.slice(8)].titulo;
    return '<tr' + (k === 'respira-hoy' ? ' class="hoy"' : '') + '><td>' + nom + '</td><td><b>' +
      d.tarjeta + '</b> px</td><td><b>' + d.ven + '</b></td><td><b>' + d.pantallas + '</b></td></tr>';
  }).join('');
  return '<table class="tabla"><tr><th>variante</th><th>ancho de tarjeta</th>' +
    '<th>se ven de un vistazo</th><th>pantallas de scroll</th></tr>' + filas + '</table>';
}

const CSS = [
  ':root{--paper:#F2EDE0;--paper-2:#EAE4D4;--paper-3:#DFD8C4;--ink:#1F1C17;--ink-2:#4A453C;',
  '  --ink-3:#8A8272;--line:#D8D0BC;--tone:#6E7A5A;--pre:#B06A3B}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--paper-3);color:var(--ink);padding:30px 34px 70px;',
  "  font-family:'Inter Tight',ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}",
  "h1{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;",
  '  font-size:32px;margin:0 0 8px}',
  "h2{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:500;",
  '  font-size:24px;margin:46px 0 6px;padding-top:24px;border-top:1px solid var(--line)}',
  'h3{font-size:14.5px;margin:0 0 5px}',
  '.lead{color:var(--ink-2);font-size:13.5px;line-height:1.65;max-width:80ch;margin:0 0 10px}',
  '.tabla{border-collapse:collapse;font-size:12.5px;margin:16px 0 8px;background:var(--paper);',
  '  border:1px solid var(--line)}',
  '.tabla th,.tabla td{padding:7px 13px;border-bottom:1px solid var(--line);text-align:left}',
  '.tabla th{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:500}',
  '.tabla td b{font-variant-numeric:tabular-nums}',
  '.tabla tr.hoy td{color:var(--pre)}',
  '.rej{display:flex;flex-wrap:wrap;gap:30px;margin-top:20px}',
  '.op{margin:0;width:CAJAWpx}',
  '.marco{overflow:hidden;border:1px solid var(--line);border-radius:7px;background:var(--paper-2);',
  '  box-shadow:0 1px 10px rgba(0,0,0,.08);width:CAJAWpx;height:CAJAHpx}',
  '.marco iframe{border:0;transform-origin:0 0;display:block;transform:scale(ESCALA)}',
  'figcaption{padding:10px 2px 0}',
  'figcaption p{margin:0 0 4px;font-size:12.5px;color:var(--ink-2);line-height:1.55}',
  '.antes{max-width:760px;width:100%;border:1px solid var(--line);border-radius:7px;display:block}',
  '.nota{background:var(--paper);border-left:3px solid var(--tone);padding:12px 15px;',
  '  font-size:12.5px;line-height:1.6;margin:18px 0;max-width:84ch;color:var(--ink-2)}',
  '.nota b{color:var(--ink)}',
  '.pie{margin-top:34px;font-size:11.5px;color:var(--ink-3);line-height:1.6;max-width:84ch}',
].join('\n');

function escribir() {
  const VP = { w: 1536, h: 714 };
  const E = 0.47;
  const claves = ['hoy', 'a', 'd', 'b', 'e', 'c'];
  const marcos = claves.map(k => ({
    k, titulo: R.VARIANTES[k].titulo, nota: R.VARIANTES[k].nota, html: cuerpo(k),
  }));

  const figuras = marcos.map(m => [
    '<figure class="op">',
    '<div class="marco"><iframe data-marco="' + m.k + '" width="' + VP.w + '" height="' + VP.h + '"></iframe></div>',
    '<figcaption><h3>' + R.esc(m.titulo) + '</h3><p>' + R.esc(m.nota) + '</p></figcaption>',
    '</figure>',
  ].join('\n')).join('\n');

  /* EL `</script>` DE DENTRO CIERRA EL `<script>` DE FUERA, y lo hace en
     silencio: el navegador no da error, simplemente trata el resto como texto
     y los seis marcos salen VACIOS. `JSON.stringify` no escapa la barra, asi
     que hay que romper la secuencia a mano. Cada marco lleva su propio script
     de medida, o sea que esto pasaba SIEMPRE. */
  const datos = 'window.__MARCOS=' + JSON.stringify(
    marcos.reduce((a, m) => { a[m.k] = m.html; return a; }, {}))
    .split('</').join('<' + String.fromCharCode(92) + '/') + ';';

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<title>PACE · Respira, para decidir</title>',
    '<style>', fuentesInline(), '</style>',
    '<style>', CSS.split('CAJAW').join(String(Math.round(VP.w * E)))
      .split('CAJAH').join(String(Math.round(VP.h * E)))
      .split('ESCALA').join(String(E)), '</style>',
    '</head><body>',

    '<h1>La biblioteca de Respira, para decidir</h1>',
    '<p class="lead">Todo a <b>1536&times;714</b> — tu pantalla. Las tarjetas son las de producción ',
    'y el CSS sale de <code>library.css.jsx</code>. Cada marco es un <b>viewport de verdad</b> de ',
    '1536 px de ancho, reducido al 47&nbsp;% para poder comparar; la etiqueta negra de cada uno ',
    'dice su medida <b>sin escalar</b>.</p>',

    '<p class="lead">Tenías razón, y se puede decir con un número: la de antes gastaba <b>3,82</b> ',
    'pantallas de scroll y la de hoy gasta <b>3,88</b>. <b>El rediseño se llevó el ancho y no cobró ',
    'nada.</b> Hoy cada tarjeta mide <b>810 px</b> para llevar unos 380 de contenido, y el sello ⚠ ',
    'acaba a 700 px del nombre al que pertenece.</p>',

    '<div class="nota">La causa no es la tarjeta, es la <b>pantalla</b>. La rejilla de tres columnas ',
    'y el rail viven en <code>LibraryShell</code>, que es de Mueve y Estira; Respira comparte la ',
    'tarjeta y <em>no</em> la pantalla (decisión de s174), así que sus 20 tarjetas caen en el flujo ',
    'del modal, una debajo de otra, a todo el ancho. <b>En móvil no cambia nada</b>: las seis ',
    'variantes dan 310 px de tarjeta y 3,66 pantallas, porque la rejilla sólo existe de 769 px ',
    'para arriba.</div>',

    tabla(),

    '<h2>La que echas de menos</h2>',
    '<p class="lead">v0.70.0, capturada de la app real a 1536: dos columnas de 392 px, etiqueta de ',
    'familia en la tarjeta y pie «ENERGÍA · 4 min».</p>',
    '<img class="antes" alt="Respira en v0.70.0" src="' + pngInline('A0-respira-ANTES-1536.png') + '">',

    '<h2>Las variantes</h2>',
    '<div class="rej">', figuras, '</div>',

    '<p class="pie">Generado por <code>scripts/audit/maqueta-s176.autonoma.js</code>. Las fuentes y ',
    'la captura van dentro del archivo, así que se puede mover de carpeta o mandar por donde sea.</p>',

    '<script>', datos, '</script>',
    '<script>',
    /* SE COMPONE AL CARGAR: la constante de fuentes existe UNA vez en el
       archivo y se le pega a cada marco al montarlo. Sin esto habría seis
       copias de 506 KB. */
    'var caras=document.querySelector("style").textContent;',
    'Array.prototype.forEach.call(document.querySelectorAll("iframe[data-marco]"),function(f){',
    '  var d=window.__MARCOS[f.getAttribute("data-marco")];',
    '  f.srcdoc=d.replace("<style>","<style>"+caras+"\\n");',
    '});',
    '</script>',
    '</body></html>',
  ].join('\n');

  /* GUARD, y el primero que escribi NO SERVIA: comparaba contra la PRIMERA
     aparicion de la etiqueta de cierre, asi que su rebanada nunca podia
     contenerla -- un aserto que no puede fallar. Este mira el DATO: si dentro
     del bloque queda una etiqueta de cierre sin romper, el navegador cierra el
     script antes de tiempo, no da error y los seis marcos salen VACIOS.
     Calibrado en rojo quitando el escape: 8 apariciones. */
  const CIERRE = '<' + '/script';
  if (datos.toLowerCase().indexOf(CIERRE) !== -1) {
    console.error('GUARD: el bloque de datos lleva una etiqueta de cierre sin escapar');
    process.exit(2);
  }
  fs.writeFileSync(SALIDA, html, 'utf8');
  const kb = Math.round(fs.statSync(SALIDA).size / 1024);
  console.log('escrito _maqueta-s176-respira.html (' + kb + ' KB, autonomo)');
}

if (require.main === module) escribir();
module.exports = { escribir };
