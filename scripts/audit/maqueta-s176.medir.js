/* PACE · scripts/audit/maqueta-s176.medir.js (sesión 176)
   ========================================================
   ABRE CADA MARCO DE LA MAQUETA A VIEWPORT REAL Y LEE SU ETIQUETA. La tabla de
   `_maqueta-s176.html` sale de aquí y no de escribir números a mano: cada cifra
   es la que el propio marco calcula dentro de sí mismo.

   POR QUÉ HACE FALTA UN PASO APARTE: con `file://` la página de fuera no puede
   leer el DOM de sus iframes, así que la tabla no se puede componer desde ella.
   Se mide antes, se guarda en `_maqueta-s176/medidas.json` y la página lo lee.

   Uso: node scripts/audit/maqueta-s176.medir.js [ancho] [alto]
        (por defecto 1536x714, la pantalla del usuario)
*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const W = parseInt(process.argv[2] || '1536', 10);
const H = parseInt(process.argv[3] || '714', 10);
const DIR = path.join(ROOT, '_maqueta-s176');

(async () => {
  if (!fs.existsSync(DIR)) { console.error('GUARD: falta _maqueta-s176/ -- corre antes los motores'); process.exit(2); }
  const marcos = fs.readdirSync(DIR).filter(f => /\.html$/.test(f)).sort();
  if (!marcos.length) { console.error('GUARD: sin marcos que medir'); process.exit(2); }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const medidas = {};
  let guards = 0;

  for (const m of marcos) {
    await page.goto('file:///' + path.join(DIR, m).split('\\').join('/'), { waitUntil: 'load' });
    /* SE ESPERA A QUE LA ETIQUETA TENGA TEXTO. Sin esto se lee el div vacío y
       todas las filas salen en blanco -- que es el fallo por omisión que no se
       ve leyendo (s169). */
    await page.waitForFunction(() => {
      const b = document.getElementById('mqb');
      return b && b.textContent.trim().length > 0;
    }, null, { timeout: 15000 }).catch(() => {});
    const badge = await page.evaluate(() => {
      const b = document.getElementById('mqb');
      return b ? b.textContent.trim() : '';
    });
    const clave = m.replace('.html', '');
    if (!badge || /^GUARD/.test(badge)) { guards++; console.log(clave.padEnd(16) + (badge || '(etiqueta vacia)')); continue; }
    console.log(clave.padEnd(16) + badge);

    const num = (re) => { const x = badge.match(re); return x ? x[1] : null; };
    medidas[clave] = {
      badge,
      tarjeta: num(/tarjeta (\d+) px/),
      ven: num(/se ven (\d+ de \d+)/),
      pantallas: num(/([\d.]+) pantallas/),
      alto: num(/mide (\d+) px de alto/),
      controles: num(/(\d+)<?\/?b?> ?controles/) || num(/· (\d+) controles/),
    };
  }
  await browser.close();

  if (guards) { console.error('\nGUARD: ' + guards + ' marco(s) sin medida -- la tabla mentiria por omision'); process.exit(1); }
  fs.writeFileSync(path.join(DIR, 'medidas.json'), JSON.stringify(medidas, null, 1), 'utf8');
  console.log('\nescrito _maqueta-s176/medidas.json con ' + Object.keys(medidas).length + ' marcos a ' + W + 'x' + H);
})().catch(e => { console.error('FALLO:', e.message); process.exit(1); });
