// Fotos de lo que eligió Ez (1A 2A 3A), YA MONTADO: el index.html de esta rama tal cual, sin nada metido
// por dentro. Lo único que se finge es el día: «PACE completo abierto hasta v1» apagado y, para la compra,
// los dos enlaces de pago de Stripe puestos (de mentira), como hacen las pruebas. Uso: node fotos-montado.js
// <carpeta-de-fotos> [solo-esta-escena], con la app servida en el 8805 (PORT=8805 node .claude/static-server.js,
// desde la raíz del worktree). Las fotos no se suben. Cada escena sale a 360 y a 1280 px, en claro.
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos-montado');
const SOLO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:' + (process.env.PACE_E2E_PORT || '8805');

/* El día de v1, de ejemplo: el jueves 26 de noviembre; la semana acaba el jueves 3 de diciembre. */
const V1 = '2026-11-26T10:00:00+01:00';

/* Alguien que usaba PACE antes de v1: unas semanas de historia y tres rutinas de pago hechas, una de cada módulo. */
function historial() {
  const dias = {};
  const d0 = new Date(2026, 9, 12);
  for (let i = 0; i < 44; i++) {
    const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + i);
    if ((d.getDay() + 6) % 7 >= 5 || i % 5 === 3) continue;
    const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    dias[iso] = { focusMinutes: 50 + (i * 7) % 60, breathMinutes: 3 + (i % 5), moveMinutes: 4 + (i % 7), waterGlasses: 4 + (i % 3), holdSeconds: 0 };
  }
  return { days: dias, months: {}, years: {} };
}
const SEMILLA = {
  firstSeen: 1, langAuto: false, paletteAuto: false, ritmo: { libre: true },
  lastActiveDay: 'Thu Nov 26 2026', _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: false,
  history: historial(), totalFocusMin: 1900, breatheSessionsTotal: 14, moveSessionsTotal: 9,
  routineCounts: { 'rutina.breathe.rounds.full': 3, 'rutina.extra.hang.bar': 2, 'rutina.move.couch.stretch': 1 },
  profile: { need: 'focus', time: 'pause', environment: 'home', completedAt: 1 },
};

async function abrirApp(browser, w, cfg) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: cfg.lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { lang: cfg.lang || 'es', palette: 'crema', sidebarCollapsed: movil }));
  /* El día de v1 es el primer arranque con el interruptor apagado (state-paso-v1.js). */
  if (cfg.v1) {
    await ctx.addInitScript(() => {
      Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
    });
  }
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(V1) });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { ctx, page };
}

async function hojaV1(page) {
  await page.locator('[data-pace-premium-hoja="pasov1"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(700);
}

async function ajustesDatos(page) {
  await hojaV1(page);
  await page.locator('[data-pace-premium-hoja="pasov1"]').getByRole('button').click();
  await page.locator('[data-pace-premium-hoja]').waitFor({ state: 'detached' });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0)
      .find((x) => /ajustes|settings/i.test((x.getAttribute('aria-label') || '') + ' ' + (x.title || '')));
    if (!b) throw new Error('no encuentro Ajustes');
    b.click();
  });
  const panel = page.locator('[data-pace-tweaks-panel]');
  await panel.waitFor({ state: 'visible' });
  const plegada = panel.locator('[data-pace-aj-plegada] .pace-aj-sec-accion');
  if (await plegada.isVisible()) { await plegada.click(); await page.waitForTimeout(400); }
  await page.locator('[data-pace-licencia-prueba]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

/* Lo de pago cerrado y la tienda de la web lista, después de arrancar: así no sale la hoja del día de v1. */
async function conTienda(page) {
  await page.evaluate(() => {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    window.PACE_TIENDA_WEB.enlaces = { vida: 'https://buy.stripe.com/prueba-vida', mes: 'https://buy.stripe.com/prueba-mes' };
  });
}

async function invitar(page, detalle) {
  await page.evaluate((d) => window.paceAbrirPremium(d), detalle);
  await page.locator('[data-pace-premium-hoja]').waitFor({ state: 'visible' });
  await page.waitForTimeout(700);
}

/* Lo que mide la vista: si algo pide scroll, cuánto, y el alto de la hoja. */
async function medir(page) {
  return page.evaluate(() => {
    const sobra = [...document.querySelectorAll('*')]
      .filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 0)
      .map((e) => e.scrollHeight - e.clientHeight);
    const hoja = document.querySelector('[data-pace-modal-card]');
    return { scroll: sobra.length ? Math.max.apply(null, sobra) : 0, hoja: hoja ? Math.round(hoja.getBoundingClientRect().height) : null,
      ancho: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
  });
}

const ESCENAS = {
  'v1-hoja': { v1: true, luego: hojaV1 },
  'v1-hoja-en': { v1: true, lang: 'en', luego: hojaV1 },
  'v1-ajustes': { v1: true, luego: ajustesDatos },
  'compra': { luego: async (p) => { await conTienda(p); await invitar(p, { nombre: 'Colgarse' }); } },
  'codigo': { luego: (p) => invitar(p, { modo: 'codigo' }) },
};

const CODIGO = 'PACE1.eyJ0eXBlIjoibGlmZXRpbWUiLCJrZXlJZCI6ImsyIiwiaXNzdWVkQXQiOiIyMDI2LTExLTI2Iiwib3JkZXIiOiJjc19saXZlX2ExQjJjM0Q0ZTVGNmc3SDgifQ.Q2xhdWRlIGVzY3JpYmUgYXF1aSB1bmEgZmlybWEgZGUgZWplbXBsbyBkZSA2NCBieXRlcyBwYXJhIGxhIGZvdG8uLi4';
const PAGINA = {
  'rec-vacio': null,
  'rec-listo': { status: 200, body: { ok: true, codigo: CODIGO } },
  'rec-no': { status: 404, body: { ok: false, motivo: 'no' } },
};

(async () => {
  const browser = await chromium.launch();
  const medidas = {};
  for (const w of [360, 1280]) {
    for (const [nombre, cfg] of Object.entries(ESCENAS)) {
      if (SOLO && SOLO !== nombre) continue;
      const n = nombre + '_' + w;
      try {
        const { ctx, page } = await abrirApp(browser, w, cfg);
        if (cfg.luego) await cfg.luego(page);
        medidas[n] = await medir(page);
        await page.screenshot({ path: OUT + '/' + n + '.png' });
        console.log(n, JSON.stringify(medidas[n]));
        await ctx.close();
      } catch (e) { console.log('FALLO', n, e.message.split('\n')[0]); }
    }
    for (const [nombre, resp] of Object.entries(PAGINA)) {
      if (SOLO && SOLO !== nombre) continue;
      const n = nombre + '_' + w;
      try {
        const movil = w < 700;
        const ctx = await browser.newContext({ viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil,
          hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
        const page = await ctx.newPage();
        if (resp) await page.route('**/api/recuperar', (r) => r.fulfill({ status: resp.status, contentType: 'application/json', body: JSON.stringify(resp.body) }));
        await page.goto(BASE + '/recuperar/');
        await page.waitForTimeout(400);
        await page.fill('[data-recuperar-correo]', 'quien@correo.com');
        await page.fill('[data-recuperar-recibo]', '2931-4470');
        if (resp) { await page.click('[data-recuperar-boton]'); await page.waitForTimeout(600); }
        else await page.locator('[data-recuperar-correo]').blur();
        medidas[n] = await medir(page);
        await page.screenshot({ path: OUT + '/' + n + '.png', fullPage: true });
        console.log(n, JSON.stringify(medidas[n]));
        await ctx.close();
      } catch (e) { console.log('FALLO', n, e.message.split('\n')[0]); }
    }
  }
  const previo = fs.existsSync(OUT + '/medidas.json') ? JSON.parse(fs.readFileSync(OUT + '/medidas.json', 'utf8')) : {};
  fs.writeFileSync(OUT + '/medidas.json', JSON.stringify(Object.assign(previo, medidas), null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
