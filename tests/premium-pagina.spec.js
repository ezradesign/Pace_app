/* PACE · la página de PACE completo (/premium) y su lista «Avísame» (Fase 6, 16 oct. 2026)
 * ==========================================
 * Lo que vigila:
 *   · que /premium no pide nada a otro dominio, no tiene scroll lateral a 360 px y va en
 *     castellano y en inglés (opción B de Ez, «Escaparate»);
 *   · que la lista está APAGADA mientras la función no tenga almacén (Ez la enciende al
 *     conectar el KV), y que encendida apunta el correo;
 *   · que los precios de la página son los de la tienda de la web de la app;
 *   · que la app no lleva analítica ni enlaza a /premium (nunca dentro de la app), y que
 *     /premium no entra en el APK;
 *   · la función de Cloudflare (`functions/api/avisame.js`) con un almacén de mentira.
 * El servidor de la suite no ejecuta funciones: GET /api/avisame da 404, como una web sin
 * almacén. Para «encendida» se responde con `page.route`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');
const { capturarErrores, RUTA_ARTEFACTO } = require('./helpers');

const RAIZ = path.join(__dirname, '..');
const PAGINA = '/premium/';

test.describe('a 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('/premium no pide nada fuera, cabe a lo ancho y la lista dice que abre pronto', async ({ page, baseURL }) => {
    const errores = capturarErrores(page);
    const fuera = [];
    page.on('request', (r) => { if (!r.url().startsWith(baseURL) && !r.url().startsWith('data:')) fuera.push(r.url()); });
    await page.goto(PAGINA);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pausas activas para quien trabaja sentado.' })).toBeVisible();
    expect(fuera).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);

    await expect(page.locator('[data-avisame-pronto]')).toHaveText('La lista abre muy pronto.');
    await expect(page.locator('[data-avisame]')).toBeHidden();
    /* El 404 de la función apagada sale en la consola del navegador: es lo esperado. */
    expect(errores.filter((e) => !/404|Not Found/.test(e))).toEqual([]);
  });
});

test('con la lista encendida, el correo se apunta con el idioma de la página', async ({ page }) => {
  let enviado = null;
  await page.route('**/api/avisame', async (route) => {
    const r = route.request();
    if (r.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"abierta":true}' });
    enviado = r.postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto(PAGINA + '?lang=en');
  await expect(page.getByRole('heading', { name: 'Active breaks for people who work sitting down.' })).toBeVisible();
  await expect(page.locator('[data-avisame-pronto]')).toBeHidden();

  await page.locator('#avisame-correo').fill('Alguien@Ejemplo.com');
  await page.locator('[data-avisame] button').click();
  await expect(page.locator('[data-avisame-estado]')).toHaveText('You are on the list. We will let you know.');
  expect(enviado).toEqual({ correo: 'Alguien@Ejemplo.com', idioma: 'en', web: '' });

  /* El botón de idioma vuelve al castellano y lo recuerda. */
  await page.locator('[data-idioma]').click();
  await expect(page.getByRole('heading', { name: 'Avísame cuando salga' })).toBeVisible();
  await page.goto(PAGINA);
  await expect(page.getByRole('heading', { name: 'Avísame cuando salga' })).toBeVisible();
});

test('los precios de /premium son los de la tienda de la web, en los dos idiomas', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await page.waitForFunction(() => typeof window.paceTiendaPrecioTexto === 'function');
  const tienda = await page.evaluate(() => {
    const pr = window.PACE_TIENDA_WEB.precios;
    const f = (p, l) => window.paceTiendaPrecioTexto(p, l);
    return { es: { vida: f(pr.vida, 'es'), mes: f(pr.mes, 'es') }, en: { vida: f(pr.vida, 'en'), mes: f(pr.mes, 'en') }, dias: pr.mes.pruebaDias };
  });
  for (const lang of ['es', 'en']) {
    await page.goto(PAGINA + '?lang=' + lang);
    await expect(page.locator('[data-precio=vida]')).toHaveText(tienda[lang].vida);
    await expect(page.locator('[data-precio=mes]')).toHaveText(tienda[lang].mes);
  }
  expect(tienda.dias).toBe(7);
});

test('la app no lleva analítica ni enlaza a /premium, y /premium no entra en el APK', async () => {
  const fuentes = ['index.html', 'PACE.html'].map((f) => fs.readFileSync(path.join(RAIZ, f), 'utf8'));
  for (const html of fuentes) {
    expect(html).not.toMatch(/cloudflareinsights|data-cf-beacon/);
    expect(html).not.toMatch(/["'(]\/premium\b/);
  }
  const apk = fs.readFileSync(path.join(RAIZ, 'scripts', 'android-www.js'), 'utf8');
  expect(apk).not.toMatch(/premium/);
  /* Lo que sirven las funciones es vivo: el service worker no lo guarda. */
  expect(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8')).toMatch(/pathname\.indexOf\('\/api\/'\) === 0\) return;/);
});

test.describe('la función /api/avisame', () => {
  let fn;
  test.beforeAll(async () => { fn = await import(pathToFileURL(path.join(RAIZ, 'functions', 'api', 'avisame.js')).href); });

  function almacen() {
    const datos = new Map();
    return { datos, put: async (k, v) => { datos.set(k, v); } };
  }
  function post(cuerpo, origen) {
    const headers = { 'Content-Type': 'application/json' };
    if (origen) headers.Origin = origen;
    return new Request('https://pacegrass.app/api/avisame', { method: 'POST', headers, body: JSON.stringify(cuerpo) });
  }

  test('sin almacén está cerrada; con él, abierta', async () => {
    const sin = await fn.onRequestGet({ env: {} });
    expect(sin.status).toBe(503);
    const con = await fn.onRequestGet({ env: { AVISAME: almacen() } });
    expect(con.status).toBe(200);
    expect(await con.json()).toEqual({ abierta: true });
    expect(con.headers.get('Cache-Control')).toBe('no-store');
    expect((await fn.onRequestPost({ request: post({ correo: 'a@b.es' }), env: {} })).status).toBe(503);
  });

  test('guarda el correo en minúsculas con el día y el idioma, y nada más', async () => {
    const kv = almacen();
    const r = await fn.onRequestPost({ request: post({ correo: '  Alguien@Ejemplo.COM ', idioma: 'en', web: '' }, 'https://pacegrass.app'), env: { AVISAME: kv } });
    expect(await r.json()).toEqual({ ok: true });
    expect([...kv.datos.keys()]).toEqual(['alguien@ejemplo.com']);
    const guardado = JSON.parse(kv.datos.get('alguien@ejemplo.com'));
    expect(Object.keys(guardado).sort()).toEqual(['fecha', 'idioma']);
    expect(guardado.idioma).toBe('en');
    expect(guardado.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('un correo a medias no entra, el robot no se guarda y otra web no puede apuntar a nadie', async () => {
    const kv = almacen();
    const malo = await fn.onRequestPost({ request: post({ correo: 'alguien@' }), env: { AVISAME: kv } });
    expect(malo.status).toBe(400);
    expect(await malo.json()).toEqual({ ok: false, motivo: 'correo' });
    const robot = await fn.onRequestPost({ request: post({ correo: 'robot@spam.com', web: 'http://x' }), env: { AVISAME: kv } });
    expect(await robot.json()).toEqual({ ok: true });
    const otra = await fn.onRequestPost({ request: post({ correo: 'a@b.es' }, 'https://otra.web'), env: { AVISAME: kv } });
    expect(otra.status).toBe(403);
    expect(kv.datos.size).toBe(0);
  });
});
