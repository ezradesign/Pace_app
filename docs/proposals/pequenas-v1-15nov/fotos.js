/* Las fotos de la copia recordada (Ez, «A+B», 16 nov. 2026) para la página «Montado».
   Uso: node docs/proposals/pequenas-v1-15nov/fotos.js   (después de `node build-standalone.js`)
   Abre el index.html compilado a 360 × 640, con el estado sembrado y la hora fija, y deja en fotos/:
   la línea de «Tus datos» sin copia y con una de hace 40 días (A), y el sobre con «Guarda una copia» (B). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const { chromium } = require('@playwright/test');

const ROOT = path.join(__dirname, '..', '..', '..');
const PUERTO = 8847;
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const AHORA = new Date('2026-11-16T12:00:00+01:00');
const DIA = 86400000;

function esperar(n) {
  return new Promise((ok, mal) => {
    const probar = (k) => http.get(BASE + '/index.html', (r) => { r.resume(); ok(); })
      .on('error', () => (k > 0 ? setTimeout(() => probar(k - 1), 250) : mal(new Error('el servidor no arranca'))));
    probar(n);
  });
}

async function foto(navegador, nombre, estado, hacer) {
  const ctx = await navegador.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, locale: 'es-ES',
    timezoneId: 'Europe/Madrid', serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  await ctx.addInitScript((e) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); },
    Object.assign({ lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' }, estado));
  const page = await ctx.newPage();
  await page.clock.install({ time: AHORA });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.waitForTimeout(800);
  await hacer(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SALIDA, nombre) });
  await ctx.close();
  console.log(nombre);
}

async function datos(page) {
  await page.locator('button[aria-label="Abrir ajustes"]').filter({ visible: true }).first().click();
  await page.locator('[data-pace-tweaks-panel]').getByRole('button', { name: 'Copias, borrar y PACE completo' }).click();
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const servidor = spawn(process.execPath, [path.join(ROOT, '.claude', 'static-server.js')],
    { cwd: ROOT, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  try {
    await esperar(40);
    const navegador = await chromium.launch();
    const empezo = AHORA.getTime() - 60 * DIA;
    await foto(navegador, 'a-sin-copia.png', { firstSeen: empezo, copiaAvisoVisto: '*' }, datos);
    await foto(navegador, 'a-hace-40.png', { firstSeen: empezo, copiaAvisoVisto: '*', ultimaCopia: AHORA.getTime() - 40 * DIA }, datos);
    await foto(navegador, 'b-barra.png', { firstSeen: empezo, copiaAvisoVisto: null }, async () => {});
    await foto(navegador, 'b-hoja.png', { firstSeen: empezo, copiaAvisoVisto: null }, async (page) => {
      await page.locator('[data-pace-sobre-de="copia"]').click();
    });
    /* La página de lo que no existe (auditoría externa del 16 nov.), tal como la sirve el 404. */
    const ctx = await navegador.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, locale: 'es-ES' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/esta-ruta-no-existe-xyz');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SALIDA, 'c-404.png') });
    await ctx.close();
    console.log('c-404.png');
    await navegador.close();
  } finally {
    servidor.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
