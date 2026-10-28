// Fotos de «Qué te ayuda» ya montado (v0.183.0), para el sí de Ez: la app tal cual, sin nada metido.
// Uso: node fotos-montaje.js <carpeta-de-fotos>, con la app servida en el 8806
// (PORT=8806 node .claude/static-server.js, desde la raíz del repo). Las fotos no se suben.
// Los datos de ejemplo entran por el contrato del registro (makeEvent + eventsWebAppend), como en
// tests/stats-ayuda.spec.js: seis semanas con 35 Focos y 17 «¿Te ayudó?».
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos-montaje');
fs.mkdirSync(OUT, { recursive: true });
const PUERTO = process.env.PACE_E2E_PORT || '8806';
const HORA = '2026-10-27T12:00:00+01:00';
const BASE = { firstSeen: 1, langAuto: false, paletteAuto: false, ritmo: { libre: true },
  lastActiveDay: 'Tue Oct 27 2026', _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true };

function laborables() {
  const out = [];
  for (let t = Date.UTC(2026, 8, 16); t <= Date.UTC(2026, 9, 26); t += 86400000) {
    const d = new Date(t);
    if (d.getUTCDay() % 6) out.push([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]);
  }
  return out;
}
/* Las seis semanas de la prueba (y de la maqueta). */
function seisSemanas() {
  const dias = laborables();
  const horas = [8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12,
    15, 15, 15, 16, 16, 16, 16, 17, 17, 17];
  const ev = [];
  horas.forEach((h, k) => {
    const [y, m, d] = dias[k % dias.length];
    const s = k >= 28 ? 2700 : 1500;
    ev.push({ tipo: 'sesion', mod: 'focus', y, m, d, h, mi: 0, s });
    if (k < 25 ? k < 17 : k < 29) ev.push({ tipo: 'sesion', mod: 'stretch', id: 'move.neck.3', y, m, d, h, mi: s / 60 + 5, s: 180 });
  });
  const respuestas = [['move.neck.3', 'stretch', ['yes', 'yes', 'yes', 'yes', 'some', 'no']],
    ['breathe.coherent.55', 'breathe', ['yes', 'yes', 'yes', 'some', 'no']],
    ['extra.chair.squats', 'move', ['yes', 'yes', 'some', 'no']],
    ['move.shoulder.circles', 'stretch', ['no', 'no']]];
  let n = 0;
  for (const [id, mod, rs] of respuestas) for (const r of rs) {
    const [y, m, d] = dias[(n++ * 2) % dias.length];
    ev.push({ tipo: 'fb', id, mod, r, y, m, d, h: 13, mi: n });
  }
  return ev;
}
async function sembrarEventos(page, specs) {
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
  await page.evaluate(async (lista) => {
    for (const [i, s] of lista.entries()) {
      const inicio = new Date(s.y, s.m - 1, s.d, s.h, s.mi || 0);
      const e = s.tipo === 'fb'
        ? window.makeEvent({ type: 'feedback.answered', runId: 'fb-' + i, occurredAt: inicio.toISOString(),
          payload: { routineId: s.id, module: s.mod, response: s.r } })
        : window.makeEvent({ type: 'session.completed', runId: 'run-' + i, occurredAt: new Date(inicio.getTime() + s.s * 1000).toISOString(),
          payload: { module: s.mod, routineId: s.id || 'focus', completionReason: 'natural', elapsedSeconds: s.s, activeSeconds: s.s,
            plannedSeconds: s.s, plannedSecondsSource: 'preset' } });
      await window.eventsWebAppend(e);
    }
  }, specs);
}

async function foto(browser, nombre, v, o) {
  const movil = v.w < 700;
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: v.lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: v.pal === 'oscuro' ? 'dark' : 'light',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, BASE, { lang: v.lang, palette: v.pal, sidebarCollapsed: movil }));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date(HORA) });
  await page.goto('http://localhost:' + PUERTO + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  if (o.datos) await sembrarEventos(page, seisSemanas());
  if (o.cerrado) await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await page.mouse.move(1, 1);
  await page.getByRole('button', { name: v.lang === 'en' ? 'View stats' : 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await page.waitForTimeout(900);
  const tag = nombre + '_' + v.w + '-' + v.pal + '-' + v.lang;
  if (o.cerrado) {
    await page.screenshot({ path: OUT + '/' + tag + '.png' });
    await page.locator('[data-pace-stats-tab="ayuda"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: OUT + '/' + nombre + '-invitacion_' + v.w + '-' + v.pal + '-' + v.lang + '.png' });
  } else {
    await page.locator('[data-pace-stats-tab="ayuda"]').click();
    await page.locator('[data-pace-ayuda-view]').waitFor({ state: 'visible' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: OUT + '/' + tag + '.png' });
  }
  const m = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0).pop();
    return { scroll: Math.max(0, el.scrollHeight - el.clientHeight), ideas: document.querySelectorAll('[data-pace-ayuda-idea]').length };
  });
  console.log(tag, JSON.stringify(m));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const w of [360, 1280]) for (const pal of ['crema', 'oscuro']) {
    for (const lang of ['es', 'en']) await foto(browser, 'ideas', { w, pal, lang }, { datos: true });
    await foto(browser, 'pronto', { w, pal, lang: 'es' }, {});
    await foto(browser, 'cerrada', { w, pal, lang: 'es' }, { cerrado: true });
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
