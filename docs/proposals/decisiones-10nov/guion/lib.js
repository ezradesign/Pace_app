// Arnés para pintar las decisiones SOBRE la app de verdad: abre el index.html servido en un puerto
// libre (PUERTO, 8940 por defecto), con el reloj puesto, y cambia el DOM solo en la página. Nada en app/.
const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const FOTOS = path.join(__dirname, '..', 'fotos');
fs.mkdirSync(FOTOS, { recursive: true });
const PUERTO = process.env.PUERTO || '8940';
const URL = 'http://localhost:' + PUERTO + '/index.html';

const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' };

// movil: 360×740 a 2×; ordenador: 1536×710 (la ventana de Ez) a 1×.
async function abrir({ movil = true, hora = '2026-11-10T09:00:00', estado = SEMILLA, v1 = false } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: movil ? { width: 360, height: 740 } : { width: 1536, height: 710 }, isMobile: movil, hasTouch: movil,
    deviceScaleFactor: movil ? 2 : 1, locale: 'es-ES', colorScheme: 'light', serviceWorkers: 'block',
  });
  await context.addInitScript(([e]) => {
    localStorage.setItem('pace-cara', 'app');
    if (e && !localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [estado]);
  // Desde v1: lo cerrado se cierra (lo mismo que hace el interruptor el día de v1).
  if (v1) await context.addInitScript(() => { Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} }); });
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)));
  await page.clock.install({ time: new Date(hora) });
  await page.goto(URL);
  await page.waitForTimeout(700);
  await page.clock.runFor(1500);
  return { browser, context, page, errores, movil };
}

async function foto(page, nombre) {
  await page.clock.runFor(900).catch(() => {});
  await page.waitForTimeout(1300); // el fundido de entrada va con el reloj de verdad
  const f = path.join(FOTOS, nombre + '.jpg');
  await page.screenshot({ path: f, type: 'jpeg', quality: 72 });
  console.log('foto ' + nombre);
  return f;
}

async function botones(page, max = 40) {
  return page.evaluate((max) => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e); return b.width > 4 && b.height > 4 && s.visibility !== 'hidden' && b.bottom > 0 && b.top < innerHeight; };
    const out = [];
    document.querySelectorAll('button,a[href],[role=button]').forEach((e) => {
      if (!vis(e)) return;
      const t = (e.getAttribute('aria-label') || e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 44);
      if (t) out.push(t);
    });
    return out.slice(0, max).join(' | ');
  }, max);
}

async function toca(page, nombre, dentro) {
  const base = dentro ? page.locator(dentro).last() : page;
  const exact = typeof nombre === 'string';
  await base.getByRole('button', { name: nombre, exact }).filter({ visible: true }).first().click({ timeout: 4000 });
  await page.clock.runFor(800);
  await page.waitForTimeout(150);
}

async function finBloque(page) {
  const fin = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) throw new Error('no hay bloque en marcha');
  await page.clock.fastForward(Math.max(0, fin - await page.evaluate(() => Date.now())) + 1000);
  await page.waitForTimeout(300); await page.clock.runFor(1500);
}

async function hastaLas(page, iso) {
  const meta = new Date(iso).getTime();
  for (let i = 0; i < 300; i++) {
    const ahora = await page.evaluate(() => Date.now());
    if (ahora >= meta) break;
    await page.clock.fastForward(Math.min(5 * 60 * 1000, meta - ahora));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300); await page.clock.runFor(1200);
}

async function hastaElCierre(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.locator('[data-pace-session-done]').count()) return true;
    await page.clock.runFor(10000);
  }
  return false;
}

// Mide si algo queda fuera de la ventana o se pisa con otro: devuelve el fondo de cada selector y el alto.
const medir = (page, sels) => page.evaluate((sels) => {
  const r = { alto: innerHeight, ancho: innerWidth, scrollAlto: document.scrollingElement.scrollHeight };
  for (const [k, s] of Object.entries(sels)) {
    const e = typeof s === 'string' ? document.querySelector(s) : null;
    if (!e) { r[k] = 'no está'; continue; }
    const b = e.getBoundingClientRect();
    r[k] = { top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), right: Math.round(b.right) };
  }
  return r;
}, sels);

module.exports = { abrir, foto, botones, toca, finBloque, hastaLas, hastaElCierre, medir, SEMILLA, FOTOS };
