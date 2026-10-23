/* PACE · la página de PACE completo (/premium) y su lista «Avísame» (Fase 6, 16 oct. 2026)
 * ==========================================
 * Lo que vigila:
 *   · que /premium no pide nada a otro dominio, no tiene scroll lateral a 360 px y va en
 *     castellano y en inglés (opción B de Ez, «Escaparate»);
 *   · que las capturas de PACE completo cargan, van en mosaico también en el móvil sin pasar
 *     de unos 700 px y cambian de idioma con la página;
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

/* LAS CAPTURAS DE PACE COMPLETO, en mosaico (Ez, 23 oct., B «optimizando para móvil»): la carta
   del lunes grande; a su lado, tu mes y tu año; debajo, la rutina propia y la de Respira. */
async function mosaico(page) {
  await page.locator('#capturas').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('#capturas img')].every((i) => i.complete && i.naturalWidth > 0));
  return page.evaluate(() => {
    const caja = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
    const imgs = {};
    document.querySelectorAll('#capturas img').forEach((i) => {
      imgs[i.getAttribute('src').split('/').pop().replace(/-(es|en)\.webp$/, '')] = Object.assign(caja(i), { src: i.getAttribute('src'), alt: i.alt });
    });
    return { mosaico: caja(document.querySelector('.mosaico')), imgs };
  });
}
const solapan = (a, b) => a.x + a.w > b.x + 1 && b.x + b.w > a.x + 1 && a.y + a.h > b.y + 1 && b.y + b.h > a.y + 1;

test.describe('las capturas a 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('el mosaico cabe en unos 700 px, con la carta grande y nada montado', async ({ page }) => {
    await page.goto(PAGINA);
    const m = await mosaico(page);
    expect(Object.keys(m.imgs).sort()).toEqual(['ano', 'carta', 'mes', 'respira-honda', 'rutina-propia']);
    /* Con la carta a todo lo ancho medía unos 1300 px. */
    expect(m.mosaico.h).toBeLessThanOrEqual(700);
    const { carta, mes, ano, ...bajo } = m.imgs;
    for (const otra of [mes, ano, ...Object.values(bajo)]) expect(carta.w).toBeGreaterThan(otra.w);
    /* Tu mes y tu año, uno encima del otro al lado de la carta, de su alto. */
    expect(Math.abs(mes.x - ano.x)).toBeLessThan(1);
    expect(mes.x).toBeGreaterThan(carta.x + carta.w);
    expect(Math.abs((ano.y + ano.h) - (carta.y + carta.h))).toBeLessThan(10);
    /* Las otras dos, debajo y del mismo ancho. */
    for (const b of Object.values(bajo)) expect(b.y).toBeGreaterThan(carta.y + carta.h);
    expect(Math.abs(bajo['rutina-propia'].w - bajo['respira-honda'].w)).toBeLessThan(1);
    const todas = Object.values(m.imgs);
    for (let i = 0; i < todas.length; i++) for (let j = i + 1; j < todas.length; j++) expect(solapan(todas[i], todas[j])).toBe(false);
    for (const i of todas) expect(i.x + i.w).toBeLessThanOrEqual(360 - 16 + 1);
  });
});

test('en el ordenador, la carta ocupa las dos filas; en inglés, las capturas en inglés', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(PAGINA + '?lang=en');
  const m = await mosaico(page);
  for (const [id, i] of Object.entries(m.imgs)) expect(i.src).toBe('/premium/' + id + '-en.webp');
  expect(m.imgs.carta.alt).toMatch(/^The Monday letter/);
  const { carta, mes, ano } = m.imgs;
  expect(Math.abs(mes.y - ano.y)).toBeLessThan(1);
  expect(carta.h).toBeGreaterThan(mes.h * 1.8);
  expect(carta.w).toBeGreaterThan(mes.w * 1.8);
  /* De vuelta al castellano, las capturas también. */
  await page.locator('[data-idioma]').click();
  await expect(page.locator('#capturas img.grande')).toHaveAttribute('src', '/premium/carta-es.webp');
  await expect(page.locator('#capturas img.grande')).toHaveAttribute('alt', /^La carta del lunes/);
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
