/* Fotos de la app tal como está hoy (0.189.0): de dónde parte cada pregunta (Q2, Q4, R1).
   Uso: node hoy.js [q2,q4,r1]   →   %TEMP%/pace-sin-querer-4nov/fotos-hoy/*.png */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const SALIDA = path.join(C.FOTOS, 'fotos-hoy');
const QUE = (process.argv[2] || 'q2,q4,r1').split(',');
const VISTAS = [[360, 730, 'm'], [1280, 879, 'e']];
const MARTES = new Date('2026-11-03T10:20:00+01:00');
const medidas = {};

const foto = (page, n) => page.screenshot({ path: path.join(SALIDA, n + '.png') });

async function r1(browser) {
  for (const [ancho, alto, s] of VISTAS) for (const oscuro of [false, true]) {
    const t = s + (oscuro ? '-osc' : '');
    const { context, page } = await C.abrir(browser, { ancho, alto, oscuro, hora: MARTES });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'breathe' } })));
    await page.waitForSelector('.pace-lib-rejilla [data-pace-lib-card]', { state: 'visible' });
    await page.waitForTimeout(700);
    await foto(page, 'respira-' + t);
    /* Lo que se ve al bajar: los grupos, uno detrás de otro. */
    const alto2 = await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); return c ? c.scrollHeight : 0; });
    medidas['respira-alto-' + t] = alto2;
    await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); if (c) c.scrollTop = c.clientHeight * 0.8; });
    await page.waitForTimeout(300);
    await foto(page, 'respira-abajo-' + t);
    await context.close();
  }
}

async function q2(browser) {
  for (const oscuro of [false, true]) {
    const t = oscuro ? '-osc' : '';
    const { context, page } = await C.abrir(browser, { ancho: 1280, alto: 879, oscuro, hora: MARTES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(900);
    await foto(page, 'linea-e' + t);
    const antes = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pace-ritmo-parada]')).filter((b) => !b.disabled).map((b) => b.innerText.replace(/\s+/g, ' ')));
    /* Tocar la siguiente pausa que aún no toca: hoy la cambia. */
    const futura = page.locator('[data-pace-ritmo-parada]:not([disabled]):not(.pace-rt-ahora)').nth(1);
    await futura.click();
    await page.waitForTimeout(700);
    const despues = await page.evaluate(() => Array.from(document.querySelectorAll('[data-pace-ritmo-parada]')).filter((b) => !b.disabled).map((b) => b.innerText.replace(/\s+/g, ' ')));
    medidas['q2-antes' + t] = antes; medidas['q2-despues' + t] = despues;
    await foto(page, 'linea-tocada-e' + t);
    await context.close();
  }
  /* El móvil: la jornada entera, con su «Otra» aparte. */
  for (const oscuro of [false, true]) {
    const { context, page } = await C.abrir(browser, { ancho: 360, alto: 730, oscuro, hora: MARTES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(700);
    await foto(page, 'home-m' + (oscuro ? '-osc' : ''));
    await page.locator('[data-pace-ritmo-ver]').first().click().catch(() => {});
    await page.waitForTimeout(700);
    await foto(page, 'jornada-m' + (oscuro ? '-osc' : ''));
    await context.close();
  }
}

/* La pantalla final con «¿Te ayudó esta pausa?»: el suspiro (2 min) corrido con el reloj. */
async function q4(browser) {
  for (const [ancho, alto, s] of VISTAS) for (const oscuro of [false, true]) {
    const t = s + (oscuro ? '-osc' : '');
    const { context, page } = await C.abrir(browser, { ancho, alto, oscuro, hora: MARTES, estado: { ritmo: { libre: true } } });
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'breathe.physiological' } })));
    await page.waitForTimeout(500);
    for (let i = 0; i < 40; i++) {
      if (await page.locator('[data-pace-session-feedback]').count()) break;
      await page.clock.fastForward(10000);
      await page.waitForTimeout(60);
    }
    await page.waitForSelector('[data-pace-fb-question]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(600);
    await foto(page, 'final-' + t);
    await page.locator('[data-pace-fb-chip]').nth(2).click();
    await page.waitForTimeout(400);
    await foto(page, 'final-no-' + t);
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
    fs.writeFileSync(path.join(SALIDA, 'medidas.json'), JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas, null, 1));
  }
})().catch((e) => { console.error(e); process.exit(1); });
