/* Lo común de las fotos de la maqueta: servidor propio, contexto, estado sembrado y la carta. */
'use strict';
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
/* La raíz del repo (este archivo vive en docs/traspaso/archivos/grupo2-30oct/) y dónde caen las fotos: fuera del repo. */
const RAIZ = process.env.PACE_RAIZ || path.resolve(__dirname, '../../../..');
const FOTOS = process.env.PACE_FOTOS || path.join(os.tmpdir(), 'pace-grupo2-30oct');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));
const PUERTO = Number(process.env.MAQ_PORT || 8815);
const BASE = 'http://localhost:' + PUERTO;

async function servidor() {
  try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) return null; } catch (e) {}
  const p = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) return p; } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }
  p.kill();
  throw new Error('sin servidor en ' + BASE);
}

const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
function semilla(extra) {
  return Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { horario: HORARIO } }, extra || {});
}

/* `rutas`: { 'app/ritmo/RitmoCarta.jsx': '<texto>' } para servir la propuesta sobre PACE.html. */
async function abrir(browser, o) {
  const movil = o.ancho < 768;
  const context = await browser.newContext({ viewport: { width: o.ancho, height: o.alto }, isMobile: movil, hasTouch: movil,
    locale: o.lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: o.oscuro ? 'dark' : 'light', deviceScaleFactor: o.dsf || 2 });
  await context.addInitScript((e) => {
    try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (x) {}
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
    if (window.__MAQ === undefined) window.__MAQ = {};
  }, semilla(Object.assign({ palette: o.oscuro ? 'oscuro' : 'crema', lang: o.lang || 'es', sidebarCollapsed: movil }, o.estado || {})));
  if (o.maq) await context.addInitScript((m) => { window.__MAQ = m; }, o.maq);
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  if (o.rutas) {
    for (const [ruta, texto] of Object.entries(o.rutas)) {
      await page.route('**/' + ruta, (r) => r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: texto }));
    }
  }
  await page.clock.install({ time: o.hora });
  await page.goto(BASE + '/' + (o.pagina || 'index.html'));
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'attached', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return { context, page };
}

function scrollHome(page) {
  return page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    const d = getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d').trim();
    return { scroll: body ? body.scrollHeight - body.clientHeight : null, aro: d };
  });
}

const barras = (xs) => [1, 2, 3, 4, 5, 6, 7].map((d, i) => ({ d, hechas: (xs[i] || [0, 0])[0], total: (xs[i] || [0, 0])[1] }));
const GEMELOS = { tipo: 'descansa', clase: 'rutinas', id: 'extra.calves', modulo: 'mueve', veces: 4, semanas: 1, paradas: 4 };
const CORTA = { tipo: 'corta', clase: 'forma', hora: 945, modulo: 'estira', min: 2, veces: 3, semanas: 1, paradas: 5 };
function cartaRes(lunes, desde, hasta) {
  return { semana: { lunes, desde, hasta }, dias: 5, carta: true, ayudo: ['move.neck.3', 'breathe.exhale.46'], hechas: 26, total: 35,
    barras: barras([[6, 7], [7, 7], [3, 7], [6, 7], [4, 7]]), cambios: [GEMELOS, CORTA] };
}
async function ponerCarta(page, lunes, desde, hasta, extra) {
  await page.evaluate(([res, lunes, extra]) => {
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: Object.assign({ lunes, res, vista: null, respuesta: null, hora: null }, extra || {}) }) }));
  }, [cartaRes(lunes, desde, hasta), lunes, extra || null]);
}

module.exports = { RAIZ, FOTOS, chromium, servidor, abrir, scrollHome, ponerCarta, cartaRes, semilla, HORARIO };
