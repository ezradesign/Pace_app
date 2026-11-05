/* Fotos de lo montado (1A, 2A de una semana con «Ahora no» debajo, 3A), con el index.html
   compilado de la rama y sin nada inyectado.
   Uso: node montado.js [q2,q4,r1]   →   %TEMP%/pace-sin-querer-4nov/fotos-montado/*.jpg y medidas.json */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const SALIDA = path.join(C.FOTOS, 'fotos-montado');
const QUE = (process.argv[2] || 'q2,q4,r1').split(',');
const MEDIDAS = path.join(SALIDA, 'medidas.json');
const medidas = fs.existsSync(MEDIDAS) ? JSON.parse(fs.readFileSync(MEDIDAS, 'utf8')) : {};
const VISTAS = [[360, 730, 'm', 2], [1280, 879, 'e', 1.5]];
const TEMAS = [[false, ''], [true, '-osc']];
const MARTES = new Date('2026-11-03T10:20:00+01:00');

const foto = (page, n) => page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 84 });
const scrollHome = (page) => page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  if (!b) return null;
  const antes = b.scrollTop; b.scrollTop = 9999; const real = b.scrollTop; b.scrollTop = antes; return real;
});
const paradas = (page) => page.locator('[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ visible: true });

async function q2(browser) {
  for (const [oscuro, t] of TEMAS) {
    const { context, page } = await C.abrir(browser, { ancho: 1280, alto: 879, dsf: 1.5, oscuro, hora: MARTES });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(900);
    await paradas(page).nth(1).click();
    await page.waitForTimeout(500);
    medidas['q2-ficha-scroll' + t] = await scrollHome(page);
    await foto(page, 'q2-ficha-e' + t);
    await page.locator('[data-pace-ficha-otra]').click();
    await page.waitForTimeout(700);
    medidas['q2-otra-texto' + t] = await page.locator('[data-pace-ritmo-ficha]').innerText();
    await foto(page, 'q2-otra-e' + t);
    await context.close();
  }
  /* La ventana de Ez (1536×708): la última parada, donde la ficha sube encima si abajo no cabe. */
  const { context, page } = await C.abrir(browser, { ancho: 1536, alto: 708, dsf: 1.25, hora: MARTES });
  await page.evaluate(() => ritmoElegir('jornada'));
  await page.waitForTimeout(900);
  const n = await paradas(page).count();
  await paradas(page).nth(n - 1).click();
  await page.waitForTimeout(500);
  medidas['q2-ez-scroll'] = await scrollHome(page);
  await foto(page, 'q2-ez-ultima');
  await context.close();
  /* El móvil, que no cambia: la home sin scroll con el día servido. */
  for (const [oscuro, t] of TEMAS) {
    const m = await C.abrir(browser, { ancho: 360, alto: 730, dsf: 2, oscuro, hora: MARTES });
    await m.page.evaluate(() => ritmoElegir('jornada'));
    await m.page.waitForTimeout(800);
    medidas['q2-home-m-scroll' + t] = await scrollHome(m.page);
    await foto(m.page, 'q2-home-m' + t);
    await m.context.close();
  }
}

async function hastaElCierre(page) {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'breathe.physiological' } })));
  await page.waitForTimeout(500);
  for (let i = 0; i < 40; i++) {
    if (await page.locator('[data-pace-session-feedback]').count()) break;
    await page.clock.fastForward(10000);
    await page.waitForTimeout(60);
  }
  await page.waitForSelector('[data-pace-fb-question]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(600);
}

async function q4(browser) {
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf, oscuro, hora: MARTES, estado: { ritmo: { libre: true } } });
    await hastaElCierre(page);
    await foto(page, 'q4-pregunta-' + v + t);
    await page.locator('[data-pace-fb-chip]').nth(2).click();
    await page.waitForTimeout(400);
    await foto(page, 'q4-no-' + v + t);
    await context.close();
  }
  /* Inglés, y una ventana baja (1280×600) para ver que nada se pisa. */
  for (const [ancho, alto, n, lang] of [[360, 730, 'q4-pregunta-m-en', 'en'], [1280, 600, 'q4-pregunta-bajo', 'es']]) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf: ancho < 768 ? 2 : 1.5, lang, hora: MARTES, estado: { ritmo: { libre: true } } });
    await hastaElCierre(page);
    await foto(page, n);
    if (lang === 'en') {
      await page.locator('[data-pace-fb-chip]').nth(2).click();
      await page.waitForTimeout(400);
      await foto(page, 'q4-no-m-en');
    }
    await context.close();
  }
}

async function r1(browser) {
  const abrirRespira = async (page) => {
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'breathe' } })));
    await page.waitForSelector('.pace-lib-rejilla [data-pace-lib-card]', { state: 'visible' });
    await page.waitForTimeout(700);
  };
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf, oscuro, hora: MARTES });
    await abrirRespira(page);
    await foto(page, 'r1-primera-' + v + t);
    if (v === 'm' && !oscuro) {
      await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); if (c) c.scrollTop = c.clientHeight * 0.85; });
      await page.waitForTimeout(300);
      await foto(page, 'r1-abajo-m');
    }
    await context.close();
  }
  for (const [ancho, alto, v, dsf] of VISTAS) {
    const { context, page } = await C.abrir(browser, { ancho, alto, dsf, hora: MARTES, estado: { breatheSessionsTotal: 1 } });
    await abrirRespira(page);
    await foto(page, 'r1-despues-' + v);
    await context.close();
  }
  const { context, page } = await C.abrir(browser, { ancho: 360, alto: 730, dsf: 2, lang: 'en', hora: MARTES });
  await abrirRespira(page);
  await foto(page, 'r1-primera-m-en');
  await context.close();
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
