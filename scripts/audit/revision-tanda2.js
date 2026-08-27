/* PACE · scripts/audit/revision-tanda2.js (sesión 175)
   ======================================================
   LA HOJA DE REVISIÓN A TAMAÑO REAL de las 18 piezas de la 2ª tanda (s171),
   que entraron asignadas y que NADIE HA MIRADO. Genera `_revision-tanda2.html`
   en la raíz, como el resto de hojas `_revision-*.html`.

   POR QUÉ ESTA HOJA Y NO UN CONTACTO DE MINIATURAS. s147 dejó dicho cuál es el
   detector que funciona: la pieza **a 700 px con su encargo al lado**. A 56 px
   casi cualquier dibujo parece plausible, y el fallo que importa —el dibujo
   correcto del *ejercicio equivocado*— sólo se ve grande. Ya pasó: «Fondos en
   silla» sin silla estuvo DOS versiones publicado pareciendo otro ejercicio.

   LAS 18 NO SON 18 IDENTIDADES: son 10 altas y 8 que SUSTITUYEN a un dibujo
   anterior (medido con `git diff 8c347d0 b9fb7b3` sobre el commit de s171). Por
   eso la hoja marca cada fila con su letra: una «M» hay que juzgarla contra la
   que reemplazó —entró para arreglar algo—, no en el vacío.

   Renderiza EXACTAMENTE como la app: máscara CSS con `background-color:
   currentColor` y `mask-size: contain` (ExerciseGlyph, s166), y la variante
   `.min` por debajo de `MASK_MIN_HASTA = 40` px elegida por los PÍXELES QUE SE
   PINTAN y no por los que se piden (la corrección de s171). Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

/* Las 18, con su letra. A = identidad nueva · M = sustituye a un dibujo previo. */
const TANDA2 = [
  ['barbilla-atras', 'A'], ['circulos-de-tobillo', 'M'], ['cuadriceps-en-pared', 'A'],
  ['extension-toracica', 'M'], ['flexiones-inclinadas', 'M'], ['giro-sentado', 'M'],
  ['hueco-en-silla', 'M'], ['inclinacion-lateral', 'A'], ['isquio-a-una-pierna', 'A'],
  ['puente-toracico', 'M'], ['rotacion-lenta', 'A'], ['rotacion-toracica', 'M'],
  ['sentadilla-a-silla', 'M'], ['sentadilla-bulgara', 'A'], ['sentadilla-lateral', 'A'],
  ['sentadilla-profunda', 'A'], ['sentarse-y-levantarse-del-suelo', 'A'],
  ['zancada-con-apertura', 'A'],
];

/* --- el encargo: se lee del generado, no se copia a mano ------------------ */
function fichas() {
  const txt = fs.readFileSync(path.join(ROOT, 'docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md'), 'utf8');
  const out = {};
  for (const ln of txt.split('\n')) {
    if (!ln.startsWith('|')) continue;
    const c = ln.split('|').map(s => s.trim());
    if (c.length < 7) continue;
    const m = /`([a-z0-9-]+)\.png`/.exec(c[3]);
    if (!m) continue;
    out[m[1]] = { nombre: c[2].replace(/\*\*/g, ''), hoy: c[4], debe: c[5] };
  }
  return out;
}

/* --- dónde sale cada identidad, del catálogo real ------------------------- */
function apariciones() {
  const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
  const win = {};
  const cargar = (rel, extra) => {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const code = babel.transformSync(src, {
      configFile: false, babelrc: false, sourceType: 'script', filename: rel,
      presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
    }).code;
    new Function('window', 'React', '"use strict";(function(){' + code + (extra || '') + '})();')(
      win, { createElement: () => null, Fragment: 'F' });
  };
  cargar('app/custom/exercise-aliases.js');
  cargar('app/glyphs/exercise-masks.js');
  cargar('app/move/move.data.js', '\nwindow.__MOVE = MOVE_ROUTINES;');
  cargar('app/extra/ExtraModule.jsx', '\nwindow.__EXTRA = EXTRA_ROUTINES;');
  const resolver = win.resolveVisualId || (n => n);
  const donde = {};
  const recorrer = (grupos, lib) => {
    for (const g of Object.keys(grupos)) for (const r of (grupos[g].items || []))
      for (const s of (r.steps || [])) {
        if (!s || !s.name) continue;
        const v = resolver(s.name);
        (donde[v] = donde[v] || new Set()).add(lib + ' · ' + r.id);
      }
  };
  recorrer(win.__MOVE, 'Mueve'); recorrer(win.__EXTRA, 'Estira');
  return { donde, masks: win.EXERCISE_MASKS || {} };
}

const F = fichas();
const { donde, masks } = apariciones();
if (!Object.keys(F).length) { console.error('GUARD: 0 fichas leidas del encargo'); process.exit(2); }
if (!Object.keys(masks).length) { console.error('GUARD: EXERCISE_MASKS vacio'); process.exit(2); }

/* GUARD: las 18 tienen que existir en disco Y tener ficha. Si el catálogo se
   movió, la hoja no debe salir a medias mintiendo por omisión (la lección de
   s169: un censo que mira el sitio equivocado dice «limpio» igual que uno bueno). */
const faltan = [];
for (const [slug] of TANDA2) {
  if (!fs.existsSync(path.join(ROOT, 'app/glyphs/assets/ejercicios', slug + '.webp'))) faltan.push(slug + ' (webp)');
  if (!fs.existsSync(path.join(ROOT, 'app/glyphs/assets/ejercicios', slug + '.min.webp'))) faltan.push(slug + ' (min)');
  if (!F[slug]) faltan.push(slug + ' (ficha)');
}
if (faltan.length) { console.error('GUARD: faltan -> ' + faltan.join(', ')); process.exit(2); }

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = (slug, min) => 'app/glyphs/assets/ejercicios/' + slug + (min ? '.min' : '') + '.webp';

/* La escalera de tamaños REALES en los que la app pinta esta pieza. `px` son
   los píxeles PINTADOS: el círculo del runner pide 44/72 del diámetro y luego
   `maskScale: 1.5`, o sea que a 200 px de círculo se pintan 183. */
const ESCALERA = [
  { px: 183, cap: 'círculo del runner (200 px)', anillo: true },
  { px: 62, cap: 'capitular de la tarjeta' },
  { px: 30, cap: 'lista del preview' },
  { px: 20, cap: 'tira de la tarjeta' },
];
const glifo = (slug, px, color) =>
  '<span class="g" style="--px:' + px + 'px;--u:url(\'' + url(slug, px <= 40) + '\');color:' + color + '"></span>';

const filas = TANDA2.map(function (par, i) {
  const slug = par[0], letra = par[1];
  const f = F[slug];
  const sitios = Array.from(donde[f.nombre] || []).sort();
  return [
    '  <article class="pieza" id="p' + (i + 1) + '">',
    '    <div class="grande">',
    '      <span class="g" style="--px:700px;--u:url(\'' + url(slug, false) + '\');color:var(--ink)"></span>',
    '    </div>',
    '    <div class="ficha">',
    '      <div class="cab">',
    '        <span class="num">' + String(i + 1).padStart(2, '0') + ' / 18</span>',
    '        <span class="letra l-' + letra + '">' +
      (letra === 'A' ? 'IDENTIDAD NUEVA' : 'SUSTITUYE AL DIBUJO ANTERIOR') + '</span>',
    '      </div>',
    '      <h2>' + esc(f.nombre) + '</h2>',
    '      <code>' + slug + '.webp</code>',
    '      <h3>Qué debe mostrar</h3>',
    '      <p class="debe">' + esc(f.debe) + '</p>',
    '      <h3>Dónde sale · ' + sitios.length + (sitios.length === 1 ? ' rutina' : ' rutinas') + '</h3>',
    '      <p class="sitios">' + (sitios.length ? sitios.map(esc).join(' · ') : '<em>en ninguna rutina fija</em>') + '</p>',
    '      <h3>A los tamaños en que la app lo pinta</h3>',
    '      <div class="escalera">',
    ESCALERA.map(function (e) {
      return '        <figure' + (e.anillo ? ' class="anillo"' : '') + '>' +
        '<div class="caja" style="--d:' + (e.anillo ? 200 : e.px) + 'px">' +
        glifo(slug, e.px, e.anillo ? 'var(--move)' : 'var(--ink)') + '</div>' +
        '<figcaption>' + e.cap + (e.px <= 40 ? '<br><b>variante .min</b>' : '') + '</figcaption></figure>';
    }).join('\n'),
    '      </div>',
    '    </div>',
    '  </article>',
  ].join('\n');
}).join('\n');

const CSS = [
  ':root{',
  '  --paper:#F2EDE0; --paper-2:#EAE4D4; --paper-3:#DFD8C4;',
  '  --ink:#1F1C17; --ink-2:#4A453C; --ink-3:#8A8372;',
  '  --line:#C9C0A8; --line-2:#B8AD8E;',
  '  --move:#9A7B4F; --move-soft:rgba(154,123,79,0.12);',
  "  --font-display:'EB Garamond','Cormorant Garamond',Georgia,serif;",
  "  --font-ui:'Inter Tight',system-ui,-apple-system,sans-serif;",
  '}',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-ui);',
  '     font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}',
  'header{padding:48px 40px 32px;border-bottom:1px solid var(--line);max-width:1240px;margin:0 auto}',
  'header h1{font-family:var(--font-display);font-style:italic;font-weight:400;',
  '          font-size:40px;margin:0 0 12px;line-height:1.15}',
  'header p{margin:0 0 8px;color:var(--ink-2);max-width:74ch}',
  'header .aviso{background:var(--paper-3);border-left:3px solid var(--move);',
  '              padding:14px 18px;margin-top:20px;max-width:84ch}',
  '.indice{display:flex;flex-wrap:wrap;gap:6px;margin-top:24px}',
  '.indice a{font-size:12px;text-decoration:none;color:var(--ink-2);',
  '          border:1px solid var(--line);border-radius:999px;padding:4px 11px;background:var(--paper-2)}',
  '.indice a:hover{border-color:var(--line-2);color:var(--ink)}',
  'main{max-width:1240px;margin:0 auto;padding:0 40px 80px}',
  '.pieza{display:grid;grid-template-columns:700px 1fr;gap:44px;align-items:start;',
  '       padding:56px 0;border-bottom:1px solid var(--line)}',
  '.grande{background:var(--paper-2);border:1px solid var(--line);display:grid;place-items:center;padding:16px}',
  '.g{display:block;width:var(--px);height:var(--px);background-color:currentColor;',
  '   -webkit-mask-image:var(--u);mask-image:var(--u);',
  '   -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;',
  '   -webkit-mask-position:center;mask-position:center;',
  '   -webkit-mask-size:contain;mask-size:contain}',
  '.cab{display:flex;align-items:center;gap:12px;margin-bottom:6px;flex-wrap:wrap}',
  '.num{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}',
  '.letra{font-size:10px;letter-spacing:.12em;text-transform:uppercase;',
  '       border:1px solid var(--line-2);border-radius:999px;padding:3px 10px;color:var(--ink-2)}',
  '.l-M{background:var(--move-soft);border-color:var(--move);color:var(--move)}',
  '.ficha h2{font-family:var(--font-display);font-style:italic;font-weight:400;',
  '          font-size:32px;margin:0 0 4px;line-height:1.15}',
  '.ficha code{font-size:12px;color:var(--ink-3);font-family:ui-monospace,monospace}',
  '.ficha h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;',
  '          color:var(--ink-3);margin:28px 0 8px;font-weight:600}',
  '.debe{margin:0;font-size:16px;color:var(--ink)}',
  '.sitios{margin:0;font-size:13px;color:var(--ink-2)}',
  '.escalera{display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap}',
  '.escalera figure{margin:0;text-align:center}',
  '.escalera .caja{width:var(--d);height:var(--d);display:grid;place-items:center;',
  '                border:1px dashed var(--line);margin-bottom:8px}',
  '.escalera .anillo .caja{border:none;border-radius:50%;background:var(--move-soft)}',
  '.escalera figcaption{font-size:11px;color:var(--ink-3);line-height:1.4;max-width:124px}',
  '@media (max-width:1180px){',
  '  .pieza{grid-template-columns:1fr}',
  '  .grande .g{width:min(var(--px),82vw);height:min(var(--px),82vw)}',
  '}',
].join('\n');

const html = [
  '<!doctype html>',
  '<html lang="es"><head><meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>PACE · Revisión a tamaño real · 2ª tanda (18 piezas)</title>',
  '<style>', CSS, '</style></head><body>',
  '<header>',
  '  <h1>Las 18 piezas de la 2ª tanda, a tamaño real</h1>',
  '  <p>Entraron en <b>s171</b> asignadas desde su hoja de contactos y <b>nadie las ha mirado</b>',
  '     desde entonces. El detector que funciona (s147) es la pieza a <b>700 px con su encargo al',
  '     lado</b>: a 56 px casi cualquier dibujo parece plausible, y el fallo que importa —el dibujo',
  '     correcto del <em>ejercicio equivocado</em>— sólo se ve grande. Ya pasó una vez: «Fondos en',
  '     silla» sin silla estuvo dos versiones publicado.</p>',
  '  <p>Cada pieza trae debajo la <b>escalera de tamaños en los que la app la pinta de verdad</b>,',
  '     con la variante <code>.min</code> de trazo engordado por debajo de 40 px, igual que',
  '     <code>ExerciseGlyph</code>. Si una pieza sólo se lee en la columna grande, no está.</p>',
  '  <div class="aviso">',
  '    <b>Las 18 no son 18 identidades nuevas.</b> Medido sobre el commit de s171',
  '    (<code>git diff 8c347d0 b9fb7b3</code>): <b>10 altas</b> y <b>8 que sustituyen</b> a un',
  '    dibujo anterior. Las 8 marcadas <b>SUSTITUYE</b> hay que juzgarlas contra lo que',
  '    reemplazaron —entraron para arreglar algo—, no en el vacío.',
  '    <b>Entre ellas está <code>puente-toracico</code></b> (nº 10), que llevas dos sesiones',
  '    pidiendo ver a tamaño real.',
  '  </div>',
  '  <div class="indice">' + TANDA2.map(function (par, i) {
    return '<a href="#p' + (i + 1) + '">' + String(i + 1).padStart(2, '0') + ' ' + esc(F[par[0]].nombre) + '</a>';
  }).join('') + '</div>',
  '</header>',
  '<main>', filas, '</main>',
  '</body></html>',
].join('\n');

const salida = path.join(ROOT, '_revision-tanda2.html');
fs.writeFileSync(salida, html, 'utf8');
console.log('Escrito: ' + salida);
console.log('Piezas: ' + TANDA2.length +
  ' (A=' + TANDA2.filter(function (x) { return x[1] === 'A'; }).length +
  ', M=' + TANDA2.filter(function (x) { return x[1] === 'M'; }).length + ')');
