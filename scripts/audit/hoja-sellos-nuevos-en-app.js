/* HOJA DE REVISION s167 · los 19 sellos NUEVOS tal y como los pinta la app.
 *
 * No es la hoja de contactos de los PNG: esto sale del `index.html` construido,
 * con la mascara CSS aplicada, el token de color de su categoria y el tamaño
 * real de la tarjeta. La leccion de s147 es que ESTA revision es el detector
 * -- alli salieron el sello flotando 11 px y el moteado del tramado, y ninguna
 * red automatica los vio.
 */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');
const sharp = require('sharp');

const SALIDA = process.argv[2] || path.resolve(__dirname, '..', '..', '_sellos-nuevos.png');
const NUEVOS = ['explore.atg','master.atg.20','hydrate.week.perfect','master.long.focus',
  'explore.neck','explore.desk','explore.all.move','master.rounds.15','secret.dark.mode',
  'master.hips.20','master.extra.all.week','explore.ancestral','master.hydrate.90',
  'master.ancestral.10','season.equinox.autumn','master.midnight.never','secret.lunch',
  'master.hydrate.30','season.autumn'];
const COLS = 5;
const PAPEL = { r: 242, g: 237, b: 224 };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2, locale: 'es-ES' });
  const ach = {}; NUEVOS.forEach(id => { ach[id] = Date.now(); });
  await ctx.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)),
    [CLAVE_ESTADO, Object.assign({}, SEMILLA, {
      achievements: ach,
      _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
      _historyMigrated: true, lastActiveDay: new Date().toDateString(),
    })]);
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await page.goto('http://localhost:8765/index.html');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop]', { timeout: 10000 });
  await page.waitForTimeout(800);

  const cab = await page.locator('[data-pace-modal-backdrop]').last().innerText();
  if (!/Logros/i.test(cab)) { console.error('ROTO: el overlay no es el panel de Logros'); process.exit(1); }

  /* Marca la TARJETA de cada sello nuevo, subiendo desde el span de la mascara.
     Se identifica por la url de la mascara, que lleva el id del logro -- nunca
     por posicion en la rejilla (s146). */
  const encontrados = await page.evaluate(ids => {
    const hit = [];
    /* SOLO DENTRO DEL MODAL. La sidebar pinta ademas una previsualizacion de los
       ultimos sellos, asi que buscar en `document` devolvia 20 tarjetas para 19
       logros y el locator reventaba por strict mode. */
    const raiz = document.querySelector('[data-pace-modal-backdrop]');
    if (!raiz) return hit;
    for (const s of raiz.querySelectorAll('span')) {
      const m = s.style.maskImage || s.style.webkitMaskImage || '';
      const g = m.match(/logros\/(.+?)\.webp/);
      if (!g) continue;
      const id = g[1];
      if (!ids.includes(id)) continue;
      let card = s;
      for (let i = 0; i < 8 && card; i++) {
        card = card.parentElement;
        if (card && card.getBoundingClientRect().width > 120) break;
      }
      if (!card || card.dataset.paceRev) continue;
      card.dataset.paceRev = id;
      hit.push(id);
    }
    return hit;
  }, NUEVOS);

  /* GUARD DE CERO Y DE COMPLETITUD: no vale «alguno». Se exigen los 19. */
  /* GUARD EXACTO, en las DOS direcciones. La primera version solo miraba que no
     faltara ninguna, asi que las 20 tarjetas para 19 logros pasaron el guard y
     el fallo salio despues, disfrazado de error de locator. Un censo que solo
     sabe decir «no falta» no esta midiendo. */
  const faltan = NUEVOS.filter(i => !encontrados.includes(i));
  const dup = encontrados.filter((x, i) => encontrados.indexOf(x) !== i);
  console.log('tarjetas localizadas: ' + encontrados.length + ' de ' + NUEVOS.length);
  if (faltan.length || dup.length || encontrados.length !== NUEVOS.length) {
    console.error('ROTO: faltan [' + faltan.join(', ') + '] · duplicadas [' + dup.join(', ') + ']');
    process.exit(1);
  }

  const trozos = [];
  for (const id of NUEVOS) {
    const el = page.locator('[data-pace-rev="' + id + '"]');
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    trozos.push({ id, buf: await el.screenshot() });
  }

  const metas = await Promise.all(trozos.map(t => sharp(t.buf).metadata()));
  const W = Math.max(...metas.map(m => m.width));
  const H = Math.max(...metas.map(m => m.height));
  const filas = Math.ceil(trozos.length / COLS);
  const capas = [];
  for (let i = 0; i < trozos.length; i++) {
    const buf = await sharp(trozos[i].buf)
      .extend({ top: 0, left: 0, bottom: H - metas[i].height, right: W - metas[i].width,
                background: { ...PAPEL, alpha: 1 } }).png().toBuffer();
    capas.push({ input: buf, left: (i % COLS) * W, top: Math.floor(i / COLS) * (H + 26) });
    const etq = Buffer.from('<svg width="' + W + '" height="26">' +
      '<rect width="100%" height="100%" fill="rgb(242,237,224)"/>' +
      '<text x="' + (W / 2) + '" y="18" font-family="monospace" font-size="15" fill="#3a3a3a" ' +
      'text-anchor="middle">' + (i + 1) + ' · ' + trozos[i].id + '</text></svg>');
    capas.push({ input: etq, left: (i % COLS) * W, top: Math.floor(i / COLS) * (H + 26) + H });
  }
  await sharp({ create: { width: COLS * W, height: filas * (H + 26), channels: 3, background: PAPEL } })
    .composite(capas).png().toFile(SALIDA);

  console.log('tarjeta real: ' + (W / 2) + 'x' + (H / 2) + ' px CSS (captura a DPR 2)');
  console.log('errores de consola: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  await b.close();
})();
