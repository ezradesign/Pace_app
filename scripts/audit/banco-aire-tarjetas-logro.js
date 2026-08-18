/* BANCO s167 · CUANTO AIRE SOBRA DEBAJO DE CADA TARJETA DE LOGRO
 *
 * El usuario reporta que las tarjetas tienen mucho hueco abajo. La causa esta
 * escrita en el codigo: s147 anclo el contenido ARRIBA (`flex-start`) con un
 * alto FIJO (`aspectRatio: 1/1.15`) para que el sello dejara de flotar con el
 * largo de la descripcion. El sobrante cae al pie, y es lo que se mide aqui:
 * fondo de la ultima linea de texto -> borde interior de la tarjeta.
 */
'use strict';
const { chromium } = require('playwright');
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');

(async () => {
  const b = await chromium.launch();
  const ANCHO = Number(process.argv[2] || 1280);
  const ctx = await b.newContext({ viewport: { width: ANCHO, height: 900 }, locale: 'es-ES' });
  await ctx.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)),
    [CLAVE_ESTADO, Object.assign({}, SEMILLA, {
      _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
      _historyMigrated: true, lastActiveDay: new Date().toDateString(),
    })]);
  const page = await ctx.newPage();
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop]', { timeout: 10000 });
  await page.waitForTimeout(700);

  const datos = await page.evaluate(() => {
    const out = [];
    for (const card of document.querySelectorAll('[data-pace-ach]')) {
      const cr = card.getBoundingClientRect();
      const cs = getComputedStyle(card);
      const padB = parseFloat(cs.paddingBottom) || 0;
      /* El ultimo hijo con texto marca el final del contenido. */
      let fondo = cr.top;
      for (const h of card.children) {
        const r = h.getBoundingClientRect();
        if (r.height > 0 && (h.innerText || '').trim()) fondo = Math.max(fondo, r.bottom);
      }
      out.push({
        id: card.getAttribute('data-pace-ach'),
        alto: +cr.height.toFixed(1),
        ancho: +cr.width.toFixed(1),
        aire: +(cr.bottom - padB - fondo).toFixed(1),
        lineas: (card.innerText || '').split('\n').map(s => s.trim()).filter(Boolean).length,
      });
    }
    return out;
  });

  if (!datos.length) { console.error('BANCO ROTO: cero tarjetas'); process.exit(1); }

  const aires = datos.map(d => d.aire).sort((a, b) => a - b);
  const med = aires[aires.length >> 1];
  console.log('tarjetas medidas: ' + datos.length);
  console.log('tarjeta: ' + datos[0].ancho + ' x ' + datos[0].alto + ' px  (alto por CONTENIDO desde s167; antes aspectRatio 1/1.15)');
  console.log('');
  console.log('AIRE SOBRANTE bajo el ultimo texto (px):');
  console.log('  minimo ' + aires[0] + '  ·  mediana ' + med + '  ·  maximo ' + aires[aires.length - 1]);
  console.log('  como % del alto de la tarjeta: mediana ' +
    (med / datos[0].alto * 100).toFixed(1) + '%  ·  maximo ' +
    (aires[aires.length - 1] / datos[0].alto * 100).toFixed(1) + '%');
  console.log('');
  const porLineas = {};
  datos.forEach(d => { (porLineas[d.lineas] = porLineas[d.lineas] || []).push(d.aire); });
  console.log('POR NUMERO DE LINEAS de texto en la tarjeta:');
  Object.keys(porLineas).sort().forEach(n => {
    const v = porLineas[n];
    console.log('  ' + n + ' lineas -> ' + v.length + ' tarjetas · aire medio ' +
      (v.reduce((a, c) => a + c, 0) / v.length).toFixed(1) + ' px');
  });
  console.log('');
  console.log('LAS 3 MAS APRETADAS: ' + datos.slice().sort((a, b) => a.aire - b.aire).slice(0, 3)
    .map(d => d.id + ' (' + d.aire + ')').join(' · '));
  /* SI CADA FILA SE AJUSTARA A SU TARJETA MAS CARGADA (quitar aspectRatio y
     dejar que el grid iguale por fila), cuanto encogeria cada fila? Es la
     tercera salida, y la unica que no rompe ni el caso peor ni la regla de
     s147: la deriva que reporto el usuario entonces era DENTRO de una fila, y
     el estirado del grid la sigue impidiendo. */
  const filas = await page.evaluate(() => {
    const porFila = {};
    for (const card of document.querySelectorAll('[data-pace-ach]')) {
      const cr = card.getBoundingClientRect();
      const cs = getComputedStyle(card);
      const padB = parseFloat(cs.paddingBottom) || 0;
      let fondo = cr.top;
      for (const h of card.children) {
        const r = h.getBoundingClientRect();
        if (r.height > 0 && (h.innerText || '').trim()) fondo = Math.max(fondo, r.bottom);
      }
      const clave = Math.round(cr.top);
      porFila[clave] = porFila[clave] || { alto: cr.height, minAire: Infinity, n: 0 };
      porFila[clave].minAire = Math.min(porFila[clave].minAire, cr.bottom - padB - fondo);
      porFila[clave].n++;
    }
    return Object.values(porFila);
  });
  const ahorros = filas.map(f => f.minAire);
  const total = ahorros.reduce((a, c) => a + c, 0);
  console.log('');
  console.log('SI CADA FILA SE AJUSTARA A SU TARJETA MAS CARGADA:');
  console.log('  filas: ' + filas.length);
  console.log('  encogeria por fila: min ' + Math.min(...ahorros).toFixed(1) +
    ' px · mediana ' + ahorros.slice().sort((a,b)=>a-b)[ahorros.length>>1].toFixed(1) +
    ' px · max ' + Math.max(...ahorros).toFixed(1) + ' px');
  console.log('  el panel entero se acortaria ' + total.toFixed(0) + ' px');
  console.log('  filas que NO encogerian nada (<2 px): ' + ahorros.filter(a => a < 2).length);

  await b.close();
})();
