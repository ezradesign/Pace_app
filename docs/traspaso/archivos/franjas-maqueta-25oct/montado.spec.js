// Fotos de lo montado (0.176.2) contra lo de antes (0.176.0, index-antes.html), y la medida de las cifras.
'use strict';
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/beautiful-perlman-2b642c';
const { test } = require(R + '/node_modules/@playwright/test');
const { sembrar } = require(R + '/tests/helpers');
const { asentarGeometria } = require(R + '/tests/home.helpers');
const fs = require('fs');
const sharp = require(R + '/node_modules/sharp');
const OUT = 'C:/Users/ezrav/AppData/Local/Temp/claude/C--Users-ezrav-Desktop-Proyectos-Desarrollo-de-aplicaciones-Pace-app--claude-worktrees-beautiful-perlman-2b642c/b51ebda3-702e-4c12-9bc5-90c05d26c986/scratchpad/fa/';
fs.mkdirSync(OUT, { recursive: true });
const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const VERS = [['antes', 'index-antes.html'], ['despues', 'index.html']];
const VPS = [{ w: 360, h: 730, pal: 'crema', lang: 'es' }, { w: 360, h: 730, pal: 'oscuro', lang: 'en' },
  { w: 1280, h: 879, pal: 'crema', lang: 'es' }, { w: 1280, h: 879, pal: 'oscuro', lang: 'en' }];

async function abrir(browser, archivo, o) {
  const movil = o.w < 769;
  const context = await browser.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: movil ? 2 : 1,
    isMobile: movil, hasTouch: movil, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, Object.assign({ lang: o.lang, palette: o.pal, paletteAuto: false, sidebarCollapsed: movil }, o.extra || {}));
  const page = await context.newPage();
  await page.clock.install({ time: new Date(FECHA + 'T' + (o.hora || '10:00') + ':00+02:00') });
  await page.goto('/' + archivo);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { context, page };
}
const foto = (page, n, clip) => page.screenshot({ path: OUT + n + '.png', clip });

async function alRunner(page, lang) {
  await page.getByRole('button', { name: new RegExp('^' + (lang === 'en' ? 'Move' : 'Mueve')) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(600);
  await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card="extra.desk.pushups"] .pace-lib-hit')].find((e) => e.getBoundingClientRect().width > 0).click());
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|Start/i.test(x.textContent || '')).click();
  });
  const fase = () => page.evaluate(() => { const r = document.querySelector('[data-pace-v1-raiz]'); return r ? r.getAttribute('data-pace-v1-fase') : null; });
  for (let i = 0; i < 40 && (await fase()) !== 'work'; i++) await page.clock.runFor(1000);
}
const numero = (page) => page.evaluate(() => +[...document.querySelectorAll('[data-pace-v1-num]')].find((n) => n.getBoundingClientRect().width > 0).textContent.trim());
async function aRep(page, n) { for (let i = 0; i < 60 && (await numero(page)) < n; i++) await page.clock.runFor(500); }
async function congelar(page) {
  const ahora = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(new Date(ahora + 100));
  /* el «antes» latía: para la foto se para el pulso, como en runner-congelado */
  await page.addStyleTag({ content: '[data-pace-v1-timer]{animation:none !important;transform:none !important}' });
  await page.waitForTimeout(80);
}
const cajaNum = (page, ancho) => page.evaluate((ancho) => {
  const e = [...document.querySelectorAll('[data-pace-v1-num]')].find((x) => x.getBoundingClientRect().width > 0);
  const l = [...document.querySelectorAll('[data-pace-v1-numlabel]')].find((x) => x.getBoundingClientRect().width > 0);
  const a = e.getBoundingClientRect(), b = l.getBoundingClientRect();
  return { x: Math.round(a.x + a.width / 2 - ancho / 2), y: Math.round(a.y - 14), width: ancho, height: Math.round(b.bottom - a.y + 24) };
}, ancho);

/* La tinta de una foto: primera y última fila con píxeles que no son el fondo. */
async function tinta(png) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * info.channels; return [data[i], data[i + 1], data[i + 2]]; };
  const fondo = px(0, 0);
  let arriba = -1, abajo = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const p = px(x, y);
      if (Math.abs(p[0] - fondo[0]) + Math.abs(p[1] - fondo[1]) + Math.abs(p[2] - fondo[2]) > 90) { if (arriba < 0) arriba = y; abajo = y; break; }
    }
  }
  return { arriba, abajo, alto: info.height };
}

for (const v of VPS) for (const [ver, archivo] of VERS) {
  const tag = `${ver}-${v.w}-${v.pal}-${v.lang}`;
  test(`runner ${tag}`, async ({ browser }) => {
    test.setTimeout(180000);
    const { context, page } = await abrir(browser, archivo, v);
    await alRunner(page, v.lang);
    await aRep(page, 3);
    await congelar(page);
    await foto(page, `run-${tag}`);
    const caja = await cajaNum(page, v.w < 769 ? 200 : 240);
    await foto(page, `num-3-${tag}`, caja);
    if (ver === 'despues' && v.pal === 'crema') {
      await page.locator('[data-pace-v1-auto]').click();
      await page.waitForTimeout(150);
      await foto(page, `run-mano-${tag}`);
    }
    await context.close();
  });
}

/* Las cifras del 0 al 9, antes y después, en el número del runner (360, claro). */
for (const [ver, archivo] of VERS) {
  test(`cifras ${ver}`, async ({ browser }) => {
    test.setTimeout(180000);
    const { context, page } = await abrir(browser, archivo, { w: 360, h: 730, pal: 'crema', lang: 'es' });
    await alRunner(page, 'es');
    await congelar(page);
    const caja = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-pace-v1-num]')].find((x) => x.getBoundingClientRect().width > 0); const a = e.getBoundingClientRect(); return { x: Math.round(a.x + a.width / 2 - 30), y: Math.round(a.y - 10), width: 60, height: Math.round(a.height + 20) }; });
    const filas = [];
    for (let d = 0; d <= 9; d++) {
      await page.evaluate((d) => { [...document.querySelectorAll('[data-pace-v1-num]')].find((x) => x.getBoundingClientRect().width > 0).textContent = String(d); }, d);
      await page.waitForTimeout(40);
      const f = OUT + `cifra-${ver}-${d}.png`;
      await page.screenshot({ path: f, clip: caja });
      filas.push(Object.assign({ d }, await tinta(f)));
    }
    /* Y el centrado: de la tinta del número a lo de encima (la instrucción) y a la etiqueta de debajo. */
    const huecos = await page.evaluate(() => {
      const v = (s) => [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0);
      return { num: v('[data-pace-v1-num]').getBoundingClientRect().top, cue: v('[data-pace-v1-cue]').getBoundingClientRect().bottom, label: v('[data-pace-v1-numlabel]').getBoundingClientRect().top };
    });
    fs.writeFileSync(OUT + `cifras-${ver}.json`, JSON.stringify({ filas, caja, huecos }));
    await context.close();
  });
}

/* La home con el día de «A tu ritmo» (N7). */
for (const v of VPS.concat([{ w: 360, h: 640, pal: 'crema', lang: 'en' }])) for (const [ver, archivo] of VERS) {
  const tag = `${ver}-${v.w}x${v.h}-${v.pal}-${v.lang}`;
  test(`home ${tag}`, async ({ browser }) => {
    const { context, page } = await abrir(browser, archivo, Object.assign({ hora: '09:00', extra: { ritmo: { dia: JORNADA } } }, v));
    await asentarGeometria(page);
    await page.waitForTimeout(300);
    await foto(page, `home-${tag}`);
    await context.close();
  });
}

/* La semana de la barra lateral (N8). */
const SEMANA = { focusMinutes: [50, 25, 75, 25, 0, 0, 0], breathMinutes: [10, 5, 20, 10, 0, 0, 0], moveMinutes: [15, 0, 25, 15, 0, 0, 0] };
for (const v of VPS) for (const [ver, archivo] of VERS) {
  const tag = `${ver}-${v.w}-${v.pal}-${v.lang}`;
  test(`semana ${tag}`, async ({ browser }) => {
    const { context, page } = await abrir(browser, archivo, Object.assign({ hora: '11:00' }, v, { extra: { sidebarCollapsed: false } }));
    await page.evaluate((s) => setState({ weeklyStats: Object.assign({}, getState().weeklyStats, s) }), SEMANA);
    await page.waitForTimeout(500);
    const caja = await page.evaluate(() => { const s = [...document.querySelectorAll('[data-pace-semana]')].find((e) => e.getBoundingClientRect().width > 0); const r = s.getBoundingClientRect(); return { x: Math.max(0, Math.round(r.x - 16)), y: Math.max(0, Math.round(r.y - 14)), width: Math.round(r.width + 32), height: Math.round(r.height + 28) }; });
    await foto(page, `semana-cerca-${tag}`, caja);
    await foto(page, `semana-${tag}`, v.w > 769 ? { x: 0, y: 0, width: 300, height: v.h } : undefined);
    await context.close();
  });
}
