'use strict';
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = process.env.PACE_RAIZ || 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/maqueta-jornada-40d7ea';
const NM = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/node_modules';
const { chromium } = require(path.join(NM, '@playwright', 'test'));
const BASE = 'http://localhost:8852';
const FOTOS = path.join(__dirname, 'fotos');

async function servidor() {
  const ok = async () => { try { return (await fetch(BASE + '/PACE.html', { method: 'HEAD' })).ok; } catch (e) { return false; } };
  if (await ok()) return null;
  const p = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: '8852' }), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { if (await ok()) return p; await new Promise((r) => setTimeout(r, 200)); }
  throw new Error('sin servidor');
}
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const semilla = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { horario: HORARIO }, sidebarCollapsed: false };

async function abrir(browser, o) {
  const context = await browser.newContext({ viewport: { width: o.ancho, height: o.alto }, locale: 'es-ES', timezoneId: 'Europe/Madrid',
    colorScheme: 'light', deviceScaleFactor: o.dsf || 2, serviceWorkers: 'block' });
  await context.addInitScript((e) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (x) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    window.__MAQ = window.__MAQ || {};
  }, Object.assign({}, semilla, o.estado || {}, { sidebarCollapsed: o.ancho < 769 }));
  if (o.maq) await context.addInitScript((m) => { window.__MAQ = m; }, o.maq);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  if (o.rutas) for (const [ruta, texto] of Object.entries(o.rutas)) {
    await page.route('**/' + ruta + '*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: texto }));
  }
  await page.clock.install({ time: new Date('2026-11-03T09:05:00+01:00') });
  await page.goto(BASE + '/' + (o.pagina || 'index.html'));
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'attached', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return { context, page };
}
/* Lo que manda: si la home pide scroll, y si lo de dentro del aro se sale de él. */
function medir(page) {
  return page.evaluate(() => {
    const vis = (s) => Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    const body = vis('[data-pace-home-body]');
    const raiz = getComputedStyle(document.documentElement);
    const dial = vis('[data-pace-dial-fit]');
    return { scroll: body ? body.scrollHeight - body.clientHeight : null, h: innerHeight, w: innerWidth, aro: raiz.getPropertyValue('--pace-timer-d').trim(),
      dial: dial ? Math.round(dial.getBoundingClientRect().width) : null };
  });
}
module.exports = { RAIZ, FOTOS, chromium, servidor, abrir, medir, BASE, fs, path };
