// Fotos del punto 12 para que Ez elija: el index.html de hoy con la propuesta metida antes de montar la
// app, y el borrador de /recuperar. Uso: node fotos.js <carpeta-de-fotos> [solo-esta-escena], con la app
// servida en el 8805 (PORT=8805 node .claude/static-server.js, desde la raíz del worktree). Las fotos no
// se suben. Cada escena sale a 360 y a 1280 px, en claro y en español, y deja al lado lo que mide.
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const aplicar = require('./propuesta.js');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos');
const SOLO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = process.env.PACE_E2E_PORT || '8805';
const BASE = 'http://localhost:' + PUERTO;

/* El día de v1, de ejemplo: el jueves 26 de noviembre. La semana de prueba acaba el jueves 3 de diciembre. */
const V1 = '2026-11-26T10:00:00+01:00';
const DOS_DIAS_ANTES = '2026-12-01T10:00:00+01:00';
const FIN = new Date('2026-12-03T10:00:00+01:00').getTime();

/* Alguien que usaba PACE antes de v1: unas semanas de historia y tres rutinas de pago hechas. */
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
  routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.move.couch.stretch': 1 },
  profile: { need: 'focus', time: 'pause', environment: 'home', completedAt: 1 },
};

async function abrirApp(browser, w, cfg) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { lang: cfg.lang || 'es', palette: 'crema', sidebarCollapsed: movil }));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(cfg.hora || V1) });
  await page.route('**/index.html', async (route) => {
    const res = await route.fetch();
    const html = await res.text();
    const ancla = "if (typeof document !== 'undefined' && document.getElementById('pace-root')) {";
    if (html.indexOf(ancla) === -1) throw new Error('sin ancla en index.html');
    const c = Object.assign({ lang: 'es', fin: FIN }, cfg);
    await route.fulfill({ response: res, body: html.replace(ancla, () => 'window.__propuesta = (' + aplicar.toString() + ')(' + JSON.stringify(c) + ');\n' + ancla) });
  });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  await page.waitForTimeout(500);
  return { ctx, page };
}

async function abrirAjustesDatos(page) {
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
  await page.locator('[data-pace-licencia-estado]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

async function abrirRespira(page) {
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('[data-pace-lib-card="breathe.rounds.full"]').first().waitFor({ state: 'visible' });
  await page.locator('[data-pace-lib-card="breathe.rounds.full"]').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
}

/* Lo que mide la vista: si algo pide scroll, y cuánto. */
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
  'v1-hoja': { escena: 'v1-hoja' },
  'v1-linea': { escena: 'v1-linea' },
  'v1-final': { escena: 'v1-final', hora: DOS_DIAS_ANTES },
  'v1-ajustes': { escena: 'v1-ajustes', luego: abrirAjustesDatos },
  'v1-despues': { escena: 'v1-despues', hora: '2026-12-04T10:00:00+01:00', luego: abrirRespira },
  'compra-a': { escena: 'compra-a', invitar: { nombre: 'Colgarse' } },
  'compra-b': { escena: 'compra-b', invitar: { nombre: 'Colgarse' } },
  'codigo-a': { escena: 'codigo-a', invitar: { modo: 'codigo' } },
  'codigo-c': { escena: 'codigo-c', invitar: { modo: 'codigo' } },
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
        if (cfg.invitar) {
          await page.evaluate((d) => window.paceAbrirPremium(d), cfg.invitar);
          await page.locator('[data-pace-premium-hoja]').waitFor({ state: 'visible' });
          await page.waitForTimeout(700);
        }
        if (/^v1-(hoja|final)/.test(nombre)) { await page.locator('[data-pace-premium-hoja]').waitFor({ state: 'visible' }); await page.waitForTimeout(700); }
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
        await page.goto(BASE + '/recuperar/'); // el borrador ya es la página
        await page.waitForTimeout(400);
        if (resp) {
          await page.fill('[data-recuperar-correo]', 'quien@correo.com');
          await page.fill('[data-recuperar-recibo]', '2931-4470');
          await page.click('[data-recuperar-boton]');
          await page.waitForTimeout(600);
        } else {
          await page.fill('[data-recuperar-correo]', 'quien@correo.com');
          await page.fill('[data-recuperar-recibo]', '2931-4470');
          await page.locator('[data-recuperar-correo]').blur();
        }
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
