/* PACE · scripts/audit/maqueta-s175.pagina.js (sesión 175)
   =========================================================
   La COMPOSICIÓN de `_maqueta-s175.html`. Vive aparte de `maqueta-s175.js`
   —que es el motor: carga la app, extrae el CSS de producción y renderiza las
   tarjetas reales— por la regla §1.

   Cada variante se escribe como un ARCHIVO propio dentro de `_maqueta-s175/` y
   entra en la página con `<iframe src>`. No con `srcdoc`: así cada marco se
   puede abrir SOLO, a tamaño real, que es como se decide de verdad. Los marcos
   se ven escalados para poder compararlos de un vistazo, pero **cada uno mide
   dentro de sí mismo, a 1536x714 reales**, y su etiqueta negra dice el número
   sin escalar. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const M = require('./maqueta-s175.js');
const { VARIANTES_RAIL, VARIANTES_PREP } = require('./maqueta-s175.piezas.js');

/* TU viewport, medido a partir de lo que dijiste: 1920x1080 al 125 % de escala
   son 1536 CSS px de ancho, y con el chrome de Brave (pestañas + barra +
   marcadores) el alto útil cae a ~714. A esa altura el rail SE CORTA; el
   umbral medido en la app real está en ~723. */
const VP = { w: 1536, h: 714 };
const ESCALA = 0.47;

function escribir() {
  const dir = path.join(ROOT, '_maqueta-s175');
  fs.mkdirSync(dir, { recursive: true });
  const escritos = [];
  const poner = (nombre, html) => {
    fs.writeFileSync(path.join(dir, nombre), html, 'utf8');
    escritos.push(nombre);
    return '_maqueta-s175/' + nombre;
  };

  const rail = Object.keys(VARIANTES_RAIL).map(k => ({
    k, v: VARIANTES_RAIL[k], src: poner('rail-' + k + '.html', M.docRail(k)) }));
  const prep = Object.keys(VARIANTES_PREP).map(k => ({
    k, v: VARIANTES_PREP[k], src: poner('prep-' + k + '.html', M.docPrep(k)) }));
  const rana = [
    { k: 'hoy', tit: 'Hoy · sin dibujo', nota: 'Cae al glifo por defecto: tres arcos que no son ningún ejercicio. Es la única capitular vacía de las 28.' },
    { k: 'a', tit: '(a) Frontal en cuadrupedia', nota: 'Mantiene la convención del set. Las rodillas abiertas se leen; la cadera hacia atrás sólo la puede decir la flecha.' },
    { k: 'b', tit: '(b) 3/4 desde atrás', nota: 'El gesto se lee entero —cadera atrás incluida— pero sería la única pieza del set en esta vista.' },
  ].map(o => Object.assign(o, { src: poner('rana-' + o.k + '.html', M.docRana(o.k, 412)) }));

  /* MÓVIL · la pregunta que la maqueta de escritorio no podía hacer.
     El círculo NO es de tamaño fijo (`v1GlyphSizeAhora` lo escala con la
     altura), así que cada viewport lleva el suyo, MEDIDO en la app real:
     161 px a 360x730 y 186 a 412x844. */
  const MOVIL = [
    { w: 360, h: 730, circulo: 161 },
    { w: 412, h: 844, circulo: 186 },
  ].map(v => Object.assign(v, {
    b0: poner('prep-movil-' + v.w + '-b0.html', M.docPrep('b0', v.circulo)),
    b2: poner('prep-movil-' + v.w + '-b2.html', M.docPrep('b2', v.circulo)),
  }));

  if (escritos.length !== 15) { console.error('GUARD: esperaba 15 marcos, escribi ' + escritos.length); process.exit(2); }

  const marco = (src, w, h, e) =>
    '<div class="marco" style="width:' + Math.round(w * e) + 'px;height:' + Math.round(h * e) + 'px">' +
    '<iframe src="' + src + '" width="' + w + '" height="' + h + '" loading="lazy" ' +
    'style="transform:scale(' + e + ')"></iframe></div>';

  const bloque = (o, w, h, e) => [
    '<figure class="op">',
    marco(o.src, w, h, e),
    '<figcaption><h3>' + o.v.titulo + '</h3><p>' + o.v.nota + '</p>',
    '<a href="' + o.src + '" target="_blank">abrir a tamaño real &rarr;</a></figcaption>',
    '</figure>',
  ].join('\n');

  /* la escalera de tamaños de `Rana`, con los cuadrúpedos que YA existen */
  const VECINOS = ['gateo', 'gato-camello', '90-90', 'paloma'];
  const escalera = cual => [183, 62, 30, 20].map(px => {
    const dib = cual === 'hoy'
      ? '<span class="def" style="--px:' + px + 'px"></span>'
      : M.bocetoRana(cual, px);
    return '<figure class="pz"><div class="cj"' + (px === 183 ? ' data-anillo' : '') +
      ' style="--d:' + (px === 183 ? 200 : px) + 'px">' + dib + '</div>' +
      '<figcaption>' + px + ' px</figcaption></figure>';
  }).join('');
  const vecinos = VECINOS.map(s =>
    '<figure class="pz"><div class="cj" style="--d:62px"><span class="g" style="--px:62px;' +
    '--u:url(\'app/glyphs/assets/ejercicios/' + s + '.webp\')"></span></div>' +
    '<figcaption>' + s + '</figcaption></figure>').join('');

  const CSS = [
    ':root{--paper:#F2EDE0;--paper-2:#EAE4D4;--paper-3:#DFD8C4;--ink:#1F1C17;--ink-2:#4A453C;',
    ' --ink-3:#8A8372;--line:#C9C0A8;--line-2:#B8AD8E;--extra:#6B7A8F;--extra-soft:rgba(107,122,143,.12);',
    " --move:#9A7B4F;--fd:'EB Garamond','Cormorant Garamond',Georgia,serif;",
    " --fu:'Inter Tight',system-ui,-apple-system,sans-serif}",
    '*{box-sizing:border-box}',
    'body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fu);font-size:15px;line-height:1.6}',
    'header,section{max-width:1400px;margin:0 auto;padding:0 32px}',
    'header{padding-top:44px;padding-bottom:28px}',
    'h1{font-family:var(--fd);font-style:italic;font-weight:400;font-size:40px;margin:0 0 14px;line-height:1.15}',
    'h2{font-family:var(--fd);font-style:italic;font-weight:400;font-size:30px;margin:56px 0 4px}',
    'h3{font-size:15px;margin:0 0 4px}',
    '.sub{color:var(--ink-2);max-width:78ch;margin:0 0 10px}',
    '.med{background:var(--paper-3);border-left:3px solid var(--extra);padding:12px 16px;margin:16px 0;max-width:88ch}',
    '.med b{font-variant-numeric:tabular-nums}',
    '.ops{display:flex;flex-wrap:wrap;gap:34px 26px;margin-top:26px}',
    '.op{margin:0;width:' + Math.round(VP.w * ESCALA) + 'px}',
    '.marco{overflow:hidden;border:1px solid var(--line-2);background:var(--paper-2);box-shadow:0 1px 0 rgba(0,0,0,.05)}',
    '.marco iframe{border:0;transform-origin:top left;display:block}',
    '.op figcaption{padding-top:10px}',
    '.op p{margin:0 0 6px;font-size:13px;color:var(--ink-2)}',
    '.op a{font-size:12px;color:var(--ink-3)}',
    '.tres{display:flex;flex-wrap:wrap;gap:30px;margin-top:24px;align-items:flex-start}',
    '.col{width:412px}',
    '.col .marco{height:300px}',
    '.col h3{font-family:var(--fd);font-style:italic;font-size:21px;margin:0 0 2px}',
    '.esc{display:flex;align-items:flex-end;gap:22px;margin:14px 0 4px;color:var(--extra)}',
    '.pz{margin:0;text-align:center}',
    '.pz .cj{display:grid;place-items:center;width:var(--d);height:var(--d);border:1px dashed var(--line);margin-bottom:6px}',
    '.pz .cj[data-anillo]{border:none;border-radius:50%;background:var(--extra-soft)}',
    '.pz figcaption{font-size:10px;color:var(--ink-3)}',
    '.g{display:block;width:var(--px);height:var(--px);background-color:currentColor;',
    ' -webkit-mask-image:var(--u);mask-image:var(--u);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;',
    ' -webkit-mask-position:center;mask-position:center;-webkit-mask-size:contain;mask-size:contain}',
    '.def{display:block;width:var(--px);height:var(--px);border-radius:50%;border:1px dashed var(--line-2);opacity:.5}',
    'footer{max-width:1400px;margin:60px auto 80px;padding:0 32px;color:var(--ink-3);font-size:13px}',
  ].join('\n');

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>PACE · s175 · las decisiones, pintadas</title>',
    '<style>' + CSS + '</style></head><body>',
    '<header>',
    '<h1>Lo que reportaste, pintado</h1>',
    '<p class="sub">Las tarjetas de estos marcos son <b>las de producción</b>: <code>RoutineCard.jsx</code>',
    ' renderizado de verdad, con el CSS extraído de <code>library.css.jsx</code>. Cada marco es un',
    ' <b>viewport real de ' + VP.w + '×' + VP.h + '</b> —tu resolución: 1920×1080 al 125 % son 1536 CSS px—,',
    ' se ve al ' + Math.round(ESCALA * 100) + ' % para poder compararlos, y <b>mide dentro de sí mismo a tamaño real</b>:',
    ' la banda negra de cada uno dice su número sin escalar.</p>',
    '<div class="med"><b>Lo medido en la app antes de tocar nada:</b> el hueco entre «Tus rutinas» y',
    ' «Para ahora» es <b>0 px</b> —la regla es <code>.pace-lib-lateral-tit + * { margin-bottom: 26px }</code>,',
    ' y «Tus rutinas» es el único bloque que <i>no</i> va detrás de un rótulo, así que el selector lo salta—.',
    ' El rail es <code>position: static</code>: su caja se estira a <b>1250 px</b> con <b>566 px</b> de contenido,',
    ' y con el scroll al fondo quedan <b>144 px</b> de rail y <b>697 px</b> de columna vacía. A tu altura la',
    ' segunda sugerencia <b>se corta 9 px</b>; el umbral está en <b>~723 px</b> de viewport.</div>',
    '</header>',

    '<section><h2>A · La columna de la izquierda</h2>',
    '<p class="sub">Cuatro direcciones. Las tres últimas dejan el rail <b>quieto</b> al bajar, que es lo que pediste;',
    ' se diferencian en el aire y en cuántas sugerencias caben.</p>',
    '<div class="ops">' + rail.map(o => bloque(o, VP.w, VP.h, ESCALA)).join('') + '</div></section>',

    '<section><h2>B · La pantalla de «Prepárate»</h2>',
    '<p class="sub">Aquí es donde aterriza la miniatura. El círculo <b>no puede moverse</b> sin devolver el brinco',
    ' que s174 midió (171 px en escritorio, 221 en móvil), así que B1 se pinta para que veas lo que cuesta,',
    ' y B2/B3 dejan el círculo donde está y arreglan sólo el hueco.</p>',
    '<div class="ops">' + prep.map(o => bloque(o, VP.w, VP.h, ESCALA)).join('') + '</div></section>',

    '<section><h2>C · «Caderas · suelo» — la capitular vacía</h2>',
    '<p class="sub">Es la única de las 28 sin dibujo, y la viste. Su primer paso es <b>Rana</b>, y lo que falta',
    ' por decidir es la <b>vista</b>. Los dos bocetos de abajo <b>no son el arte final</b> —son de trazo, no',
    ' grabado—: lo que tienen que dejar decidir es qué silueta queda a 62 px.</p>',
    '<div class="tres">' + rana.map(o => [
      '<div class="col"><h3>' + o.tit + '</h3><p style="font-size:13px;color:var(--ink-2);margin:0 0 10px">' + o.nota + '</p>',
      '<div class="esc">' + escalera(o.k) + '</div>',
      '<div class="marco"><iframe src="' + o.src + '" width="412" height="638" loading="lazy" style="transform:scale(1)"></iframe></div>',
      '<a href="' + o.src + '" target="_blank" style="font-size:12px;color:var(--ink-3)">abrir solo &rarr;</a></div>',
    ].join('\n')).join('') + '</div>',
    '<h3 style="margin-top:42px">Los cuadrúpedos que YA existen en el set, a 62 px</h3>',
    '<p class="sub">La referencia real de la convención: si <b>(b)</b> entra, sería la única pieza vista desde atrás.</p>',
    '<div class="esc" style="color:var(--extra)">' + vecinos + '</div>',
    '</section>',
    '<section><h2>D · Y en el móvil, ¿el botón dónde?</h2>',
    '<p class="sub">B2 ya está implementado y en escritorio hace lo que pediste. Pero <b>el móvil no',
    ' entraba en esa maqueta</b>, y ahí el mismo cambio se ve distinto: medido en la app real,',
    ' el botón queda al <b>46 % de la pantalla a 360×730</b> y al <b>43 % a 412×844</b>, con',
    ' <b>354</b> y <b>443 px</b> de vacío debajo — más de media pantalla, y justo donde llega el pulgar.',
    ' Los cuatro marcos son de tamaño REAL, con el círculo que la app usa en cada uno (161 y 186 px,',
    ' no el 198 de escritorio).</p>',
    MOVIL.map(v => [
      '<h3 style="font-family:var(--fd);font-style:italic;font-size:21px;margin:34px 0 10px">'
        + v.w + ' × ' + v.h + '</h3>',
      '<div class="tres">',
      ['b0', 'b2'].map(k => [
        '<div style="width:' + v.w + 'px">',
        '<p style="font-size:13px;color:var(--ink-2);margin:0 0 8px">',
        k === 'b0' ? '<b>Hoy en móvil</b> — botón abajo, vacío en medio' : '<b>B2 tal cual está</b> — botón recogido, vacío debajo',
        '</p>',
        '<div class="marco" style="width:' + v.w + 'px;height:' + v.h + 'px">',
        '<iframe src="' + v[k] + '" width="' + v.w + '" height="' + v.h + '" loading="lazy"></iframe></div>',
        '<a href="' + v[k] + '" target="_blank" style="font-size:12px;color:var(--ink-3)">abrir solo &rarr;</a>',
        '</div>',
      ].join('\n')).join(''),
      '</div>',
    ].join('\n')).join(''),
    '</section>',
    '<footer>Generado por <code>node scripts/audit/maqueta-s175.js</code>. Los marcos viven en',
    ' <code>_maqueta-s175/</code> y cada uno se puede abrir solo, a tamaño real.</footer>',
    '</body></html>',
  ].join('\n');

  const salida = path.join(ROOT, '_maqueta-s175.html');
  fs.writeFileSync(salida, html, 'utf8');
  console.log('Escrito: ' + salida);
  console.log('Marcos: ' + escritos.length + ' en _maqueta-s175/ -> ' + escritos.join(', '));
}

module.exports = { escribir };
