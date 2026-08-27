/* PACE · scripts/audit/maqueta-s176.pagina.js (sesión 176)
   =========================================================
   La COMPOSICIÓN de `_maqueta-s176.html`: junta los marcos de Respira
   (`maqueta-s176.js`) y los del bloque de sonido (`maqueta-s176.audio.js`) en
   una sola página para decidir MIRÁNDOLOS. Vive aparte de los motores por §1.

   Cada variante es un ARCHIVO propio dentro de `_maqueta-s176/` y entra con
   `<iframe src>`, no con `srcdoc`: así cada marco se puede abrir SOLO, a
   tamaño real, que es como se decide de verdad. Aquí se ven escalados para
   poder compararlos de un vistazo, pero **cada uno se mide dentro de sí mismo,
   a 1536x714 reales**, y su etiqueta negra dice el número sin escalar.

   Uso: node scripts/audit/maqueta-s176.pagina.js   ->  _maqueta-s176.html
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const R = require('./maqueta-s176.js');
const A = require('./maqueta-s176.audio.js');

/* La pantalla del usuario, medida en s175: 1920x1080 al 125 % son 1536 CSS px,
   y con el chrome de Brave el alto útil cae a ~714. */
const VP = { w: 1536, h: 714 };
const E = 0.46;          /* escala de los marcos de biblioteca */
const E_PANEL = 0.62;    /* los de Ajustes: el panel es pequeño y hay que leerlo */

const DIR = path.join(ROOT, '_maqueta-s176');

function marco(src, w, h, e) {
  return '<div class="marco" style="width:' + Math.round(w * e) + 'px;height:' + Math.round(h * e) + 'px">' +
    '<iframe src="' + src + '" width="' + w + '" height="' + h + '" loading="lazy" ' +
    'style="transform:scale(' + e + ')"></iframe></div>';
}

function bloque(src, titulo, nota, w, h, e) {
  return ['<figure class="op">', marco(src, w, h, e),
    '<figcaption><h3>' + titulo + '</h3><p>' + nota + '</p>',
    '<a href="' + src + '" target="_blank">abrir a tamaño real &rarr;</a></figcaption>',
    '</figure>'].join('\n');
}

function escribir() {
  if (!fs.existsSync(DIR)) { console.error('GUARD: falta _maqueta-s176/ -- corre antes los dos motores'); process.exit(2); }
  const hay = f => fs.existsSync(path.join(DIR, f));
  const faltan = []
    .concat(Object.keys(R.VARIANTES).map(k => 'respira-' + k + '.html'))
    .concat(Object.keys(A.VAR_AUDIO).map(k => 'audio-' + k + '.html'))
    .concat(['A0-respira-ANTES-1536.png', 'RAIL-antes.png', 'RAIL-despues.png'])
    .filter(f => !hay(f));
  if (faltan.length) { console.error('GUARD: faltan marcos -> ' + faltan.join(' · ')); process.exit(2); }

  const resp = Object.keys(R.VARIANTES).map(k =>
    bloque('_maqueta-s176/respira-' + k + '.html', R.VARIANTES[k].titulo, R.VARIANTES[k].nota, VP.w, VP.h, E));
  const aud = Object.keys(A.VAR_AUDIO).map(k =>
    bloque('_maqueta-s176/audio-' + k + '.html', A.VAR_AUDIO[k].titulo, A.VAR_AUDIO[k].nota, VP.w, VP.h, E_PANEL));

  const CSS = [
    ':root{--paper:#F2EDE0;--paper-2:#EAE4D4;--paper-3:#DFD8C4;--ink:#1F1C17;--ink-2:#4A453C;',
    '  --ink-3:#8A8272;--line:#D8D0BC;--tone:#6E7A5A;--pre:#B06A3B}',
    '*{box-sizing:border-box}',
    'body{margin:0;background:var(--paper-3);color:var(--ink);',
    '  font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;padding:28px 30px 60px}',
    'h1{font-family:Georgia,serif;font-style:italic;font-weight:500;font-size:30px;margin:0 0 6px}',
    'h2{font-family:Georgia,serif;font-style:italic;font-weight:500;font-size:23px;',
    '  margin:44px 0 4px;padding-top:22px;border-top:1px solid var(--line)}',
    'h3{font-size:14px;margin:0 0 5px;letter-spacing:.01em}',
    '.lead{color:var(--ink-2);font-size:13.5px;line-height:1.6;max-width:78ch;margin:0 0 8px}',
    '.tabla{border-collapse:collapse;font-size:12.5px;margin:14px 0 6px;background:var(--paper);',
    '  border:1px solid var(--line)}',
    '.tabla th,.tabla td{padding:6px 11px;border-bottom:1px solid var(--line);text-align:left}',
    '.tabla th{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:500}',
    '.tabla td b{font-variant-numeric:tabular-nums}',
    '.tabla tr.hoy td{color:var(--pre)}',
    '.rej{display:flex;flex-wrap:wrap;gap:26px;margin-top:18px}',
    '.op{margin:0;width:' + Math.round(VP.w * E) + 'px}',
    '.op.chico{width:' + Math.round(VP.w * E_PANEL * 0.62) + 'px}',
    '.marco{overflow:hidden;border:1px solid var(--line);border-radius:6px;background:var(--paper-2);',
    '  box-shadow:0 1px 8px rgba(0,0,0,.07)}',
    '.marco iframe{border:0;transform-origin:0 0;display:block}',
    'figcaption{padding:9px 2px 0}',
    'figcaption p{margin:0 0 6px;font-size:12.5px;color:var(--ink-2);line-height:1.5}',
    'figcaption a{font-size:11.5px;color:var(--tone)}',
    '.cap{display:block;max-width:100%;border:1px solid var(--line);border-radius:6px}',
    '.par{display:flex;gap:22px;flex-wrap:wrap;margin-top:16px}',
    '.par figure{margin:0;width:520px}',
    '.par img{width:100%;border:1px solid var(--line);border-radius:6px}',
    '.par figcaption{font-size:12px;color:var(--ink-2);padding-top:7px}',
    '.nota{background:var(--paper);border-left:3px solid var(--tone);padding:11px 14px;',
    '  font-size:12.5px;line-height:1.55;margin:16px 0;max-width:82ch;color:var(--ink-2)}',
    '.nota b{color:var(--ink)}',
  ].join('\n');

  /* LA TABLA NO SE ESCRIBE A MANO. Sale de correr los marcos y leer sus
     etiquetas -- el mismo número que enseña cada uno. Si no hay medidas
     guardadas, la tabla se omite antes que inventarla. */
  const medidasPath = path.join(DIR, 'medidas.json');
  let tabla = '<p class="lead"><em>(sin medidas guardadas: corre el capturador para poblarlas)</em></p>';
  if (fs.existsSync(medidasPath)) {
    const m = JSON.parse(fs.readFileSync(medidasPath, 'utf8'));
    const filas = Object.keys(m).filter(k => k.indexOf('respira-') === 0).sort().map(k => {
      const d = m[k];
      const nom = k === 'respira-hoy' ? 'HOY · publicado' : (R.VARIANTES[k.slice(8)] || {}).titulo || k;
      return '<tr' + (k === 'respira-hoy' ? ' class="hoy"' : '') + '><td>' + nom + '</td>' +
        '<td><b>' + d.tarjeta + '</b> px</td><td><b>' + d.ven + '</b></td>' +
        '<td><b>' + d.pantallas + '</b></td></tr>';
    }).join('');
    tabla = ['<table class="tabla"><tr><th>variante</th><th>ancho de tarjeta</th>',
      '<th>se ven de un vistazo</th><th>pantallas de scroll</th></tr>', filas, '</table>'].join('');
  }

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<title>PACE · maqueta s176</title><style>', CSS, '</style></head><body>',

    '<h1>s176 · lo que probaste, medido y dibujado</h1>',
    '<p class="lead">Todo esto está a <b>1536&times;714</b>, tu pantalla (1920&times;1080 al 125 %). ',
    'Las tarjetas son las de producción y el CSS sale de <code>library.css.jsx</code>: si la hoja ',
    'cambia, esto cambia con ella. Cada marco <b>se mide a sí mismo</b> y su etiqueta negra dice ',
    'el número sin escalar — los marcos se ven reducidos para poder compararlos, pero por dentro ',
    'son viewports de verdad.</p>',

    '<h2>1 · La biblioteca de Respira</h2>',
    '<p class="lead">Dijiste que la de antes estaba mejor. Lo está, y se puede decir con un número: ',
    'la de antes gastaba <b>3,82</b> pantallas de scroll y la de hoy gasta <b>3,90</b> — el rediseño ',
    'se llevó el ancho <em>y no cobró nada</em>. Hoy cada tarjeta mide <b>810 px</b> para llevar unos ',
    '380 de contenido, y el sello ⚠ acaba a 700 px del nombre al que pertenece.</p>',
    '<div class="nota">La causa no es la tarjeta, es la <b>pantalla</b>. La rejilla de tres columnas y ',
    'el rail son de <code>LibraryShell</code>, que es de Mueve y Estira; Respira comparte la tarjeta ',
    'y no la pantalla (decisión de s174), así que sus 20 tarjetas caen en el flujo del modal, una ',
    'debajo de otra, a todo el ancho.</div>',
    tabla,
    '<div class="par">',
    '<figure><img src="_maqueta-s176/A0-respira-ANTES-1536.png" alt="Respira antes">',
    '<figcaption><b>ANTES</b> · la que echas de menos (v0.70.0, capturada de la app real): ',
    'dos columnas de 392 px, con la etiqueta de familia y el pie «ENERGÍA · 4 min».</figcaption></figure>',
    '</div>',
    '<div class="rej">', resp.join('\n'), '</div>',

    '<h2>2 · El bloque de sonido de Ajustes</h2>',
    '<p class="lead">Pediste interruptor propio para la voz y poder elegir <code>bradford</code>, y en ',
    'la misma frase dijiste el problema de fondo: <em>«es demasiado menús»</em>. Así que la pregunta ',
    'no es dónde meter un interruptor más, sino cómo no acabar con cinco. El panel mide <b>320 px</b> ',
    'con 20 de padding: <b>280 px</b> de contenido, no es un diálogo ancho.</p>',
    '<div class="nota"><b>Medido abriendo los archivos</b> (decodificando la onda, umbral −50 dBFS, ',
    'con <code>sulafat</code> reproduciendo sus cifras exactas como control): la palabra de ',
    '<code>bradford</code> dura <b>0,911</b> · <b>1,218</b> · <b>3,572</b> s (inhala · mantén · exhala) ',
    'y su tono va por <b>~121 Hz</b> frente a los <b>~193</b> de <code>sulafat</code>. Su «exhala» es ',
    'largo: con margen pide fases de <b>3,72 s</b>, así que <code>bradford</code> entra en ',
    '<b>14 de 20</b> rutinas donde <code>sulafat</code> entra en <b>17</b>. Se cae de las tres de rondas.</div>',
    '<div class="rej">', aud.join('\n'), '</div>',

    '<h2>3 · «Tus rutinas», que se salía por la derecha</h2>',
    '<p class="lead">Esto no era una decisión de diseño sino una caja mal puesta, así que ya está ',
    'arreglado. El rail deja <b>242 px</b> de contenido y la rejilla de «Tus rutinas» pedía un mínimo ',
    'de <b>260</b> — y un mínimo <em>no encoge</em>. La tarjeta se pintaba <b>18 px</b> más ancha que ',
    'el rail: los chips acababan en 428,93 y ella en 446,21.</p>',
    '<div class="par">',
    '<figure><img src="_maqueta-s176/RAIL-antes.png" alt="antes">',
    '<figcaption><b>ANTES</b> — la tarjeta sobresale por la derecha.</figcaption></figure>',
    '<figure><img src="_maqueta-s176/RAIL-despues.png" alt="despues">',
    '<figcaption><b>DESPUÉS</b> — alineada con los chips y con «Para ahora».</figcaption></figure>',
    '</div>',
    '</body></html>',
  ].join('\n');

  fs.writeFileSync(path.join(ROOT, '_maqueta-s176.html'), html, 'utf8');
  console.log('escrito _maqueta-s176.html');
}

if (require.main === module) escribir();
module.exports = { escribir };
