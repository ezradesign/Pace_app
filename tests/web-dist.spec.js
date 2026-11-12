/* PACE · E2E · LO QUE PUBLICA pacegrass.app, ABIERTO EN UN NAVEGADOR (la octava, prueba 6, 12 nov. 2026)
 * ==========================================================================
 * La suite sirve la raíz del repo, y la web publica `dist/` (scripts/web-dist.js): lo que falte en
 * sus listas funciona en las pruebas y da 404 en pacegrass.app. `verify` (verify.web.js) ya cruza
 * las listas con el precache y con lo que piden las páginas pequeñas, pero no abre nada. Aquí se
 * monta `dist/` en una carpeta temporal, como Cloudflare, se sirve con sus rutas ('/' es
 * index.html, '/privacy' es privacy.html y '/premium/' es premium/index.html) y:
 *   1. la landing carga sin ninguna petición fallida, con todas sus imágenes dibujadas;
 *   2. «Abrir PACE» abre la app sin peticiones fallidas ni errores;
 *   3. con el service worker puesto, la app vuelve a abrir sin red;
 *   4. las páginas sueltas cargan sin peticiones fallidas y con sus imágenes.
 * Mutante: con `beta` fuera de WEB_CARPETAS, la landing pide sus capturas y da 404 (la 1 cae).
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { test, expect } = require('@playwright/test');
const { capturarErrores, MEDIODIA } = require('./helpers');
const web = require('../scripts/web-dist.js');

/* Navegador vacío (la landing) y el service worker de verdad. */
test.use({ storageState: { cookies: [], origins: [] }, serviceWorkers: 'allow', locale: 'es-ES' });

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.txt': 'text/plain; charset=utf-8' };

let carpeta, servidor, base;

test.beforeAll(async () => {
  carpeta = fs.mkdtempSync(path.join(os.tmpdir(), 'pace-dist-e2e-'));
  web.montarWeb(carpeta);
  servidor = http.createServer((req, res) => {
    const r = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    for (const o of [r, r + '.html', (r ? r.replace(/\/$/, '') + '/' : '') + 'index.html']) {
      const p = path.join(carpeta, o);
      if (p.startsWith(carpeta) && fs.existsSync(p) && fs.statSync(p).isFile()) {
        res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        fs.createReadStream(p).pipe(res);
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  base = 'http://127.0.0.1:' + servidor.address().port;
});

test.afterAll(async () => {
  if (servidor) await new Promise((ok) => servidor.close(ok));
  if (carpeta) fs.rmSync(carpeta, { recursive: true, force: true });
});

/* Toda respuesta de 400 o más, y toda petición que no llega, con su dirección. `/api/` no: son las
   funciones de Cloudflare (`functions/`, que lee de la raíz y no van en dist/), y aquí no hay. */
function vigilarRed(page) {
  const fallos = [];
  page.on('response', (r) => {
    if (r.status() >= 400 && !/^\/api\//.test(new URL(r.url()).pathname)) fallos.push(r.status() + ' ' + r.url().replace(base, ''));
  });
  page.on('requestfailed', (r) => fallos.push('sin respuesta ' + r.url().replace(base, '') + ' (' + ((r.failure() || {}).errorText || '') + ')'));
  return fallos;
}

/* Las imágenes que se ven, y las que no se dibujaron. */
const imagenesRotas = (page) => page.evaluate(async () => {
  const imgs = Array.from(document.images).filter((i) => i.getClientRects().length && getComputedStyle(i).visibility !== 'hidden');
  await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((ok) => { i.onload = ok; i.onerror = ok; }))));
  return { vistas: imgs.length, rotas: imgs.filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')) };
});

async function abrir(browser) {
  const context = await browser.newContext({ baseURL: base });
  const page = await context.newPage();
  await page.clock.install({ time: MEDIODIA });
  return { context, page, red: vigilarRed(page), errores: capturarErrores(page) };
}

test('1 y 2 · la landing de dist/ carga entera y «Abrir PACE» abre la app, sin una sola petición fallida', async ({ browser }) => {
  const { context, page, red, errores } = await abrir(browser);
  await page.goto('/');
  await expect(page.locator('#pace-landing h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-pace-cara'))).toBe('landing');
  for (let y = 0; y < 12000; y += 600) await page.evaluate((v) => window.scrollTo(0, v), y);   // las de abajo, con loading=lazy
  await page.waitForLoadState('networkidle');
  const imgs = await imagenesRotas(page);
  expect(imgs.vistas, 'la landing enseña sus capturas').toBeGreaterThan(2);
  expect(imgs.rotas, 'imágenes de la landing sin dibujar').toEqual([]);
  expect(red, 'peticiones fallidas en la landing').toEqual([]);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.pl-portada [data-pace-abrir]').click();
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(red, 'peticiones fallidas al abrir la app').toEqual([]);
  expect(errores, 'errores al abrir la app desde dist/').toEqual([]);
  await context.close();
});

test('3 · con el service worker de dist/ puesto, la app vuelve a abrir sin red', async ({ browser }) => {
  const { context, page, red } = await abrir(browser);
  await page.goto('/?go=inicio');
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15000 }).toBe(true);
  expect(red, 'peticiones fallidas con red').toEqual([]);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
  await context.close();
});

test('4 · las páginas sueltas de dist/ cargan enteras', async ({ browser }) => {
  const { context, page, red } = await abrir(browser);
  for (const ruta of ['/premium/', '/beta/', '/gracias/', '/recuperar/', '/desistir/', '/privacy', '/safety', '/calendario']) {
    const r = await page.goto(ruta);
    expect(r.status(), ruta).toBe(200);
    await page.waitForLoadState('networkidle');
    const imgs = await imagenesRotas(page);
    expect(imgs.rotas, ruta + ': imágenes sin dibujar').toEqual([]);
  }
  expect(red, 'peticiones fallidas en las páginas sueltas').toEqual([]);
  await context.close();
});
