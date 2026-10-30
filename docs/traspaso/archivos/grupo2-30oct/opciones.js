/* Fotos de cada opción, con la app real (PACE.html de la rama) y la propuesta dentro.
   Uso: node opciones.js [q1,q2,q3,q4]   →   ./fotos/*.jpg y ./fotos/medidas.json */
'use strict';
const path = require('path');
const fs = require('fs');
const C = require('./comun');
const RUTAS = require('./variantes');
const SALIDA = path.join(C.FOTOS, 'fotos');
const QUE = (process.argv[2] || 'q1,q2,q3,q4').split(',');
const MEDIDAS = path.join(SALIDA, 'medidas.json');
const medidas = fs.existsSync(MEDIDAS) ? JSON.parse(fs.readFileSync(MEDIDAS, 'utf8')) : {};

const VISTAS = [[360, 730, 'm', 2], [1280, 879, 'e', 1.5]];
const TEMAS = [[false, ''], [true, '-osc']];
const LUNES = new Date('2026-11-02T09:00:00+01:00');
const MARTES = new Date('2026-11-03T09:05:00+01:00');

async function foto(page, n) {
  medidas[n] = await C.scrollHome(page);
  await page.screenshot({ path: path.join(SALIDA, n + '.jpg'), type: 'jpeg', quality: 84 });
}
const abrir = (browser, o) => C.abrir(browser, Object.assign({ pagina: 'PACE.html', rutas: RUTAS }, o));
const repintar = (page, maq) => page.evaluate((m) => { Object.assign(window.__MAQ, m); setState({}); }, maq).then(() => page.waitForTimeout(500));

async function q1(browser) {
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, oscuro, hora: LUNES, maq: { cartaX: true, sobre: false } });
    await page.evaluate(() => ritmoElegir('jornada'));
    await C.ponerCarta(page, '2026-11-02', '2026-10-26', '2026-11-01');
    await page.waitForSelector('[data-pace-carta]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await foto(page, 'q1-carta-' + v + t);
    /* La × la guarda: el sobre aparece arriba. */
    await page.evaluate(() => { window.__MAQ.sobre = true; });
    await page.locator('[data-pace-modal-close]').click();
    await page.waitForSelector('[data-pace-carta]', { state: 'detached' });
    await page.waitForTimeout(500);
    await foto(page, 'q1-sobre-' + v + t);
    await context.close();
  }
}

async function q2(browser) {
  const casos = [[360, 730, 'm', false, 'es'], [360, 730, 'm-osc', true, 'es'], [360, 640, '640', false, 'es'], [360, 640, '640-en', false, 'en'],
    [375, 667, '375', false, 'es'], [375, 667, '375-en', false, 'en'], [412, 844, '412-en', false, 'en']];
  for (const [ancho, alto, v, oscuro, lang] of casos) {
    const { context, page } = await abrir(browser, { ancho, alto, oscuro, lang, hora: MARTES, maq: {} });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.waitForTimeout(700);
    for (const op of ['hoy', 'A', 'B', 'C']) {
      await repintar(page, { u5: op });
      await foto(page, 'q2-' + op + '-' + v);
    }
    await context.close();
  }
}

async function q3(browser) {
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, oscuro, hora: new Date('2026-11-03T09:00:00+01:00'), maq: { primera: true } });
    await page.evaluate(() => ritmoElegir('jornada'));
    await page.evaluate(() => {
      const b = (d, h, tot) => ({ d, hechas: h, total: tot });
      const res = { semana: { lunes: '2026-11-02', desde: '2026-10-29', hasta: '2026-11-02' }, dias: 3, carta: true, ayudo: ['move.neck.3'],
        hechas: 15, total: 21, barras: [b(4, 5, 7), b(5, 6, 7), b(1, 4, 7)],
        cambios: [{ tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', min: 2, veces: 3, semanas: 1, paradas: 3 }] };
      setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: { lunes: '2026-11-02', res, vista: null, respuesta: null, hora: null } }) }));
    });
    await page.waitForSelector('[data-pace-carta]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(500);
    await foto(page, 'q3-B-' + v + t);
    await context.close();
  }
}

async function q4(browser) {
  const abrirPreview = async (page, maq) => {
    await page.evaluate((m) => { window.__MAQ = m; window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'extra.legs.standing' } })); }, maq);
    await page.waitForSelector('[data-pace-modal-card]', { state: 'visible' });
    await page.waitForTimeout(600);
  };
  const cerrar = async (page) => { await page.keyboard.press('Escape'); await page.waitForSelector('[data-pace-modal-card]', { state: 'detached' }); };
  for (const [ancho, alto, v, dsf] of VISTAS) for (const [oscuro, t] of TEMAS) {
    const { context, page } = await abrir(browser, { ancho, alto, dsf, oscuro, hora: MARTES, estado: { ritmo: { libre: true } }, maq: {} });
    await abrirPreview(page, { p4: 'A', p4abierto: 0 });
    await foto(page, 'q4-A-' + v + t);
    /* Con el paso abierto, la ventana pide scroll: también la foto de abajo. */
    await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); medidasScroll = c.scrollHeight - c.clientHeight; c.scrollTop = c.scrollHeight; }).catch(() => {});
    medidas['q4-A-scroll-' + v + t] = await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); return c.scrollHeight - c.clientHeight; });
    await page.waitForTimeout(200);
    await foto(page, 'q4-A-abajo-' + v + t);
    await cerrar(page);
    await abrirPreview(page, { p4: 'B' });
    await foto(page, 'q4-B-lista-' + v + t);
    await page.locator('[data-maq-paso="0"]').click();
    await page.waitForSelector('[data-maq-detalle]', { state: 'visible' });
    await page.waitForTimeout(400);
    medidas['q4-B-scroll-' + v + t] = await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); return c.scrollHeight - c.clientHeight; });
    await foto(page, 'q4-B-' + v + t);
    await context.close();
  }
  /* El móvil pequeño: ¿la ventana del ejercicio pide scroll? */
  for (const [ancho, alto, v] of [[360, 640, '640'], [360, 640, '640-en']]) {
    const { context, page } = await abrir(browser, { ancho, alto, lang: v.endsWith('en') ? 'en' : 'es', hora: MARTES, estado: { ritmo: { libre: true } }, maq: {} });
    await abrirPreview(page, { p4: 'B' });
    await page.locator('[data-maq-paso="0"]').click();
    await page.waitForSelector('[data-maq-detalle]', { state: 'visible' });
    await page.waitForTimeout(400);
    medidas['q4-B-scroll-' + v] = await page.evaluate(() => { const c = document.querySelector('[data-pace-modal-card]'); return c.scrollHeight - c.clientHeight; });
    await foto(page, 'q4-B-' + v);
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await C.servidor();
  const browser = await C.chromium.launch();
  try {
    for (const q of QUE) { const t0 = Date.now(); await ({ q1, q2, q3, q4 })[q](browser); console.log(q, Math.round((Date.now() - t0) / 1000) + ' s'); }
  } finally {
    await browser.close();
    if (srv) srv.kill();
    fs.writeFileSync(MEDIDAS, JSON.stringify(medidas, null, 1));
    console.log(JSON.stringify(medidas));
  }
})().catch((e) => { console.error(e); process.exit(1); });
