/* PACE · scripts/audit/maqueta-s175.movil.js (sesión 175)
   ========================================================
   EL MÓVIL, EN OCHO RESOLUCIONES REALES. Genera `_maqueta-s175-movil.html`.

   Reutiliza el motor de `maqueta-s175.js` —tarjetas de producción, CSS de
   producción, cada marco un viewport de verdad— y no duplica ni una regla.

   TRES COSAS QUE HACEN QUE ESTO NO MIENTA, y las tres costaron una corrección:

   1. UN SOLO DOCUMENTO POR VISTA, instanciado a ocho tamaños. Las media queries
      se evalúan contra el viewport del `<iframe>`, así que el mismo archivo se
      comporta como escritorio o como teléfono según la caja que le des -- igual
      que la app. Hornear un archivo por teléfono habría congelado el breakpoint.
   2. LA PREPARACIÓN YA NO LLEVA CÍRCULO (s175, decisión del usuario), así que
      lo que se enseña es la pantalla que queda: rótulo, contador y copy
      centrados. El numeral es el de la hoja responsive de sesión —128 px en
      móvil—, MEDIDO en la app, no supuesto.
   3. EL CHROME DEL MODAL EN MÓVIL ESTÁ MEDIDO EN LA APP, no supuesto: a 360x730
      el scroller arranca a 16 px, mide 706 de alto con padding 16/16/20 y deja
      310 px de ancho útil. Es la lección de s174 -- la maqueta de entonces se
      dibujó sobre un marco a pelo y prometió 42 px que no existían.

   A TAMAÑO REAL y sin escalar: una fila de ocho teléfonos no cabe en pantalla,
   así que cada fila se desliza en horizontal. Escalar habría hecho ilegible lo
   único que se viene a juzgar aquí, que es si el texto se lee y si el hueco
   molesta. Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const M = require('./maqueta-s175.js');

/* Los ocho, con su nombre. Ordenados de menor a mayor ALTURA, que es la
   dimensión que decide en las dos pantallas: el recorte del catálogo y el
   tamaño del círculo. */
const TELEFONOS = [
  { w: 320, h: 568, nombre: 'iPhone SE (1ª) · 4"', nota: 'el suelo del proyecto' },
  { w: 360, h: 640, nombre: 'Android común · 5"' },
  { w: 375, h: 667, nombre: 'iPhone SE 2/3 · 8' },
  { w: 360, h: 730, nombre: 'Android alto', nota: 'viewport de referencia del proyecto' },
  { w: 390, h: 844, nombre: 'iPhone 12/13/14' },
  { w: 412, h: 844, nombre: 'Pixel', nota: 'el otro viewport de referencia' },
  { w: 414, h: 896, nombre: 'iPhone 11 · XR' },
  { w: 430, h: 932, nombre: 'iPhone 15 Pro Max' },
];

/* El círculo que la app pintará en cada uno, con la fórmula de producción.
   Se calcula aquí SOLO para escribirlo en la ficha; el marco lo recalcula por
   su cuenta, así que si los dos no coincidieran se vería. */
const circuloDe = h => Math.round(Math.max(72, Math.min(210, Math.round(h * 0.22))));

function escribir() {
  const dir = path.join(ROOT, '_maqueta-s175-movil');
  fs.mkdirSync(dir, { recursive: true });
  const escritos = [];
  const poner = (nombre, html) => {
    fs.writeFileSync(path.join(dir, nombre), html, 'utf8');
    escritos.push(nombre);
    return '_maqueta-s175-movil/' + nombre;
  };

  const VISTAS = [
    { k: 'lib', titulo: 'La biblioteca',
      sub: 'Estira, piel móvil: sin lateral, los filtros bajo la cabecera y «Para ahora» con <b>una</b> sugerencia (A2). El lateral no existe por debajo de 769 px, así que aquí lo único que cambió es el número de sugerencias.',
      src: poner('lib.html', M.docRail('a2')) },
    { k: 'sin', titulo: 'Prepárate · sólo el contador',
      sub: 'Sin glifo, por decisión tuya: rótulo, contador y copy centrados, y el botón en el pie. Es la misma pantalla que ya usaba Respira, así que las tres bibliotecas comparten preparación. Medido en la app a 360×730: numeral de <b>128 px</b>, ~190 px de aire arriba y 209 abajo.',
      src: poner('prep-sin-glifo.html', M.docPrepSinGlifo('movil')) },
  ];
  if (escritos.length !== 2) { console.error('GUARD: esperaba 2 documentos, escribi ' + escritos.length); process.exit(2); }
  /* GUARD de contenido: si el motor devolviera un documento vacío o sin
     tarjetas, la página saldría llena de marcos en blanco y parecería un
     problema de CSS. Mejor no salir. */
  for (const v of VISTAS) {
    const txt = fs.readFileSync(path.join(ROOT, v.src), 'utf8');
    const marca = v.k === 'lib' ? 'pace-lib-card' : 'mq-num';
    if (txt.indexOf(marca) === -1) { console.error('GUARD: ' + v.src + ' no contiene ' + marca); process.exit(2); }
  }

  const fila = v => TELEFONOS.map(t => [
    '<figure class="tel">',
    '  <figcaption>',
    '    <b>' + t.w + ' × ' + t.h + '</b><span>' + t.nombre + '</span>',
    (t.nota ? '<i>' + t.nota + '</i>' : ''),
    (v.k === 'lib' ? '' : '<u>numeral 128 px</u>'),
    '  </figcaption>',
    '  <div class="marco" style="width:' + t.w + 'px;height:' + t.h + 'px">',
    '    <iframe src="' + v.src + '" width="' + t.w + '" height="' + t.h + '" loading="lazy"></iframe>',
    '  </div>',
    '</figure>',
  ].join('\n')).join('');

  const CSS = [
    ':root{--paper:#F2EDE0;--paper-2:#EAE4D4;--paper-3:#DFD8C4;--ink:#1F1C17;--ink-2:#4A453C;',
    ' --ink-3:#8A8372;--line:#C9C0A8;--line-2:#B8AD8E;--extra:#6B7A8F;',
    " --fd:'EB Garamond','Cormorant Garamond',Georgia,serif;",
    " --fu:'Inter Tight',system-ui,-apple-system,sans-serif}",
    '*{box-sizing:border-box}',
    'body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--fu);font-size:15px;line-height:1.6}',
    'header{padding:44px 32px 26px;max-width:1100px}',
    'h1{font-family:var(--fd);font-style:italic;font-weight:400;font-size:40px;margin:0 0 14px;line-height:1.15}',
    'h2{font-family:var(--fd);font-style:italic;font-weight:400;font-size:28px;margin:0 0 4px}',
    '.sub{color:var(--ink-2);max-width:80ch;margin:0 0 10px}',
    '.med{background:var(--paper-3);border-left:3px solid var(--extra);padding:12px 16px;margin:16px 0;max-width:88ch}',
    'section{padding:34px 0 8px;border-top:1px solid var(--line);margin-top:26px}',
    'section > h2, section > .sub{padding:0 32px}',
    '.tira{display:flex;gap:26px;align-items:flex-start;overflow-x:auto;padding:22px 32px 30px}',
    '.tira::-webkit-scrollbar{height:9px}',
    '.tira::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:9px}',
    '.tel{margin:0;flex:0 0 auto}',
    '.tel figcaption{display:flex;flex-direction:column;margin-bottom:9px;line-height:1.35}',
    '.tel figcaption b{font-size:14px;font-variant-numeric:tabular-nums}',
    '.tel figcaption span{font-size:12px;color:var(--ink-2)}',
    '.tel figcaption i{font-size:11px;color:var(--extra)}',
    '.tel figcaption u{font-size:11px;color:var(--ink-3);text-decoration:none}',
    '.marco{overflow:hidden;border:1px solid var(--line-2);border-radius:14px;background:var(--paper-2);',
    ' box-shadow:0 2px 10px rgba(0,0,0,.09)}',
    '.marco iframe{border:0;display:block}',
    'footer{padding:26px 32px 70px;color:var(--ink-3);font-size:13px}',
  ].join('\n');

  const html = [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>PACE · s175 · el móvil en ocho resoluciones</title>',
    '<style>' + CSS + '</style></head><body>',
    '<header>',
    '<h1>El móvil, en ocho resoluciones</h1>',
    '<p class="sub">Cada teléfono es un <b>viewport de verdad</b> a <b>tamaño real</b>, sin escalar:',
    ' las filas se deslizan en horizontal. Las tarjetas son <code>RoutineCard.jsx</code> de producción',
    ' y el CSS sale de <code>library.css.jsx</code>, así que lo que ves es lo que hay.</p>',
    '<div class="med"><b>La preparación ya no lleva glifo</b> (decisión de esta sesión): las tres',
    ' bibliotecas comparten ahora la misma pantalla —rótulo, contador y copy centrados, botón en el',
    ' pie—, que es la que Respira ya usaba. Con ella se fue el círculo de arte, y con el círculo el',
    ' anclaje arriba y el hueco de 280 px que habías reportado: <b>ya no hay nada que recoger</b>.</div>',
    '<div class="med"><b>Y el chrome del modal está medido en la app, no supuesto:</b> a 360×730 el',
    ' scroller arranca a <b>16 px</b> del borde, mide <b>706</b> de alto con padding 16/16/20 y deja',
    ' <b>310 px</b> de ancho útil. Es la lección que s174 pagó cara.</div>',
    '<div class="med"><b>Qué tan cerca está de la app, dicho con el número:</b> a 360×730 el marco da',
    ' <b>312 px</b> de ancho útil contra los <b>310</b> medidos, y <b>3,87</b> pantallas de scroll',
    ' contra <b>3,94</b> — dentro del 2 % en las dos. Llegar aquí costó dos correcciones que el propio',
    ' badge destapó: la rejilla no quitaba la rutina promovida (salía dos veces) y el alto del modal',
    ' estaba clavado en 706 px, así que en un teléfono de 568 no cabía y aparecía una barra que se',
    ' comía 15 px de ancho.</div>',
    '</header>',
    VISTAS.map(v => [
      '<section>',
      '<h2>' + v.titulo + '</h2>',
      '<p class="sub">' + v.sub + '</p>',
      '<div class="tira">' + fila(v) + '</div>',
      '</section>',
    ].join('\n')).join(''),
    '<footer>Generado por <code>node scripts/audit/maqueta-s175.movil.js</code>.',
    ' Tres documentos en <code>_maqueta-s175-movil/</code>, instanciados a ' + TELEFONOS.length + ' tamaños cada uno.</footer>',
    '</body></html>',
  ].join('\n');

  const salida = path.join(ROOT, '_maqueta-s175-movil.html');
  fs.writeFileSync(salida, html, 'utf8');
  console.log('Escrito: ' + salida);
  console.log('Vistas: ' + escritos.join(', ') + ' · teléfonos: ' + TELEFONOS.length +
    ' · marcos totales: ' + (escritos.length * TELEFONOS.length));
}

if (require.main === module) escribir();
module.exports = { escribir, TELEFONOS };
