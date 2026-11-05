/* Fotos de cada opción, con la app real (PACE.html de la rama) y la propuesta dentro.
   Uso: node opciones.js [q2,q4,r1]   →   %TEMP%/pace-sin-querer-4nov/fotos/*.jpg y medidas.json */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const RUTAS = require('./variantes');
const SALIDA = path.join(C.FOTOS, 'fotos');
const QUE = (process.argv[2] || 'q2,q4,r1').split(',');
const MEDIDAS = path.join(SALIDA, 'medidas.json');
const medidas = fs.existsSync(MEDIDAS) ? JSON.parse(fs.readFileSync(MEDIDAS, 'utf8')) : {};

const VISTAS = [[360, 730, 'm', 2], [1280, 879, 'e', 1.5]];
const TEMAS = [[false, ''], [true, '-osc']];
const MARTES = new Date('2026-11-03T10:20:00+01:00');

const foto = (page, n) => page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 84 });
const abrir = (browser, o) => C.abrir(browser, Object.assign({ pagina: 'PACE.html', rutas: RUTAS }, o));

async function q2(browser) {
  for (const [oscuro, t] of TEMAS) for (const op of ['A', 'B']) {
    const { context, page } = await abrir(browser, { ancho: 1280, alto: 879, dsf: 1.5, oscuro, hora: MARTES, maq: { q2: op } });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(900);
    await page.locator('[data-pace-ritmo-parada]:not([disabled]):not(.pace-rt-ahora)').nth(1).click();
    await page.waitForTimeout(700);
    await foto(page, 'q2-' + op + '-e' + t);
    if (op === 'A') {
      await page.locator('[data-maq-otra]').click();
      await page.waitForTimeout(800);
      await foto(page, 'q2-A-otra-e' + t);
    }
    medidas['q2-' + op + t] = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pace-ritmo-parada]')).filter((b) => !b.disabled).map((b) => b.innerText.replace(/\s+/g, ' ')));
    await context.close();
  }
}

async function q4(browser) {
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) for (const op of ['A', 'B']) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, oscuro, hora: MARTES, estado: { ritmo: { libre: true } }, maq: { q4: op } });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'breathe.physiological' } })));
    await page.waitForTimeout(500);
    for (let i = 0; i < 40; i++) {
      if (await page.locator('[data-pace-session-feedback]').count()) break;
      await page.clock.fastForward(10000);
      await page.waitForTimeout(60);
    }
    await page.waitForSelector('[data-pace-fb-question]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.locator('[data-pace-fb-chip]').nth(2).click();
    await page.waitForTimeout(400);
    await foto(page, 'q4-' + op + '-' + v + t);
    if (op === 'B') {
      await page.locator('[data-maq-aparta]').click();
      await page.waitForTimeout(300);
      await foto(page, 'q4-B-aparta-' + v + t);
    }
    await context.close();
  }
}

async function r1(browser) {
  const casos = [['A', {}], ['B', {}], ['C', {}]];
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) for (const [op, extra] of casos) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, oscuro, hora: MARTES, maq: Object.assign({ r1: op }, extra) });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'breathe' } })));
    await page.waitForSelector('.pace-lib-rejilla [data-pace-lib-card]', { state: 'visible' });
    await page.waitForTimeout(700);
    await foto(page, 'r1-' + op + '-' + v + t);
    medidas['r1-' + op + '-' + v + t] = await page.evaluate(() => {
      const c = document.querySelector('[data-pace-modal-card]');
      return { alto: c ? c.scrollHeight : 0, grupos: Array.from(document.querySelectorAll('.pace-lib-grp')).map((h) => h.textContent) };
    });
    if (v === 'm' && !oscuro) {
      await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); if (c) c.scrollTop = c.clientHeight * 0.85; });
      await page.waitForTimeout(300);
      await foto(page, 'r1-' + op + '-abajo-' + v + t);
    }
    await context.close();
  }
  /* A, con una respiración ya hecha: vuelve «Para ahora». */
  for (const [ancho, alto, v, dsf] of VISTAS) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, hora: MARTES, maq: { r1: 'A', yaRespiro: true } });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'breathe' } })));
    await page.waitForSelector('.pace-lib-rejilla [data-pace-lib-card]', { state: 'visible' });
    await page.waitForTimeout(700);
    await foto(page, 'r1-A-despues-' + v);
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  try {
    for (const q of QUE) { const t0 = Date.now(); await ({ q2, q4, r1 })[q](browser); console.log(q, Math.round((Date.now() - t0) / 1000) + ' s'); }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(MEDIDAS, JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas, null, 1));
  }
})().catch((e) => { console.error(e); process.exit(1); });
