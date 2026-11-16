/* PACE · E2E · LO QUE NO EXISTE DA SU PÁGINA CON UN 404, Y /BETA SE LEE SIN JAVASCRIPT
 * ===================================================================================
 * Auditoría externa del 16 nov. 2026, comprobada en pacegrass.app:
 *  1 · `/esta-ruta-no-existe-xyz` o `/legal/condiciones/` devolvían la app entera (2,2 MB) con un 200:
 *      sin un 404.html arriba del todo, Cloudflare Pages toma la web por una app de una página. Ahora
 *      `404.html` se publica (scripts/web-dist.js) y el servidor de las pruebas hace lo mismo que
 *      Cloudflare con él. Lo que existe sigue igual: la app, las páginas sueltas y todo lo que precarga
 *      `sw.js` (una sola 404 tira su instalación).
 *  2 · /beta decía «El grupo abre muy pronto» en el HTML de partida y solo su script enseñaba el botón:
 *      sin JavaScript (buscadores, vistas previas de enlaces) no se podía apuntar nadie. Ahora el HTML
 *      que se publica sale con los enlaces que ya funcionan encendidos (`encenderEnlacesBeta`), y con
 *      JavaScript se ve igual que antes.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { encenderEnlacesBeta } = require('../scripts/web-dist.js');

const ROOT = path.join(__dirname, '..');

test.describe('en castellano', () => {
  test.use({ locale: 'es-ES' });
  test('web-404-1 · una ruta que no existe recibe su página con un 404, en el idioma del navegador', async ({ page }) => {
    /* `/legal/condiciones/` (un borrador) existe en el repo, que es lo que sirve este servidor, pero no se
       publica: en pacegrass.app también cae en el 404. */
    expect(require('../scripts/web-dist.js').listaWeb().filter((r) => r.indexOf('legal/') === 0), 'se publica lo legal en borrador').toEqual([]);
    for (const ruta of ['/esta-ruta-no-existe-xyz', '/premium/no-existe/']) {
      const r = await page.goto(ruta);
      expect(r.status(), ruta + ' no da 404').toBe(404);
      await expect(page.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeHidden();
      await expect(page.getByRole('link', { name: 'Ir a PACE' })).toHaveAttribute('href', '/');
      expect(await page.evaluate(() => !!(window.React || document.querySelector('[data-pace-dial-number]'))), ruta + ' sirvió la app').toBe(false);
    }
  });
});

test('web-404-2 · en inglés, y sin JavaScript se leen los dos idiomas', async ({ browser }) => {
  const en = await browser.newContext({ locale: 'en-US' });
  const p1 = await en.newPage();
  expect((await p1.goto('/no-existe')).status()).toBe(404);
  await expect(p1).toHaveTitle('Not found · PACE');
  await expect(p1.getByRole('link', { name: 'Go to PACE' })).toBeVisible();
  await en.close();
  const sinJs = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await sinJs.newPage();
  expect((await p2.goto('/no-existe')).status()).toBe(404);
  await expect(p2.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
  await expect(p2.getByRole('heading', { name: 'This page doesn’t exist.' })).toBeVisible();
  await sinJs.close();
});

test('web-404-3 · lo que existe sigue con su 200: la app, las páginas sueltas y todo lo que precarga sw.js', async ({ page }) => {
  await page.goto('/index.html');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const filas = [];
  const bloque = sw.match(/const PRECACHE = \[([\s\S]*?)\n\];/)[1].replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  for (const m of bloque.matchAll(/'([^']+)'/g)) filas.push(m[1]);
  expect(filas.length, 'GUARD: no se leyó el precache').toBeGreaterThan(100);
  const paginas = ['/index.html', '/?go=inicio', '/premium/', '/beta/', '/gracias/', '/recuperar/', '/desistir/', '/privacy', '/safety', '/calendario.html'];
  const malas = await page.evaluate(async (rutas) => {
    const r = await Promise.all(rutas.map((u) => fetch(u, { cache: 'no-store' }).then((x) => [u, x.status], () => [u, 0])));
    return r.filter(([, s]) => s !== 200).map(([u, s]) => u + ' → ' + s);
  }, paginas.concat(filas));
  expect(malas, 'rutas que existen y ya no dan 200').toEqual([]);
});

test('web-beta · sin JavaScript, /beta enseña los enlaces que ya funcionan, y con él se ve igual que antes', async ({ browser, page }) => {
  const fuente = fs.readFileSync(path.join(ROOT, 'beta', 'index.html'), 'utf8');
  const publicada = encenderEnlacesBeta(fuente);
  const enlaces = JSON.parse(fuente.match(/<script type="application\/json" data-enlaces>([\s\S]*?)<\/script>/)[1]);
  const vivos = Object.keys(enlaces).filter((k) => !enlaces[k].pendiente && /^https:\/\//.test(enlaces[k].url));
  expect(vivos.length, 'GUARD: ningún enlace funciona todavía; la prueba no mide nada').toBeGreaterThan(0);

  const estado = (p) => p.evaluate(() => Array.from(document.querySelectorAll('[data-enlace], [data-pronto]')).map((el) =>
    (el.getAttribute('data-enlace') ? 'boton ' + el.getAttribute('data-enlace') + ' ' + el.getAttribute('href') : 'pronto ' + el.getAttribute('data-pronto'))
    + (el.hidden ? ' oculto' : ' visible')));

  const sinJs = await browser.newContext({ javaScriptEnabled: false });
  const p = await sinJs.newPage();
  await p.goto('/beta/');
  /* CONTROL: la fuente, sin JavaScript, dice «muy pronto» (es lo que veía un buscador). */
  await expect(p.getByText('El grupo abre muy pronto.')).toBeVisible();
  await p.setContent(publicada);
  for (const k of vivos) {
    await expect(p.locator('[data-enlace="' + k + '"]'), k + ': el botón sigue oculto sin JavaScript').toBeVisible();
    await expect(p.locator('[data-enlace="' + k + '"]')).toHaveAttribute('href', enlaces[k].url);
    await expect(p.locator('[data-pronto="' + k + '"]'), k + ': sigue diciendo que llega pronto').toBeHidden();
  }
  await expect(p.getByText('El grupo abre muy pronto.')).toBeHidden();
  await sinJs.close();

  /* Con JavaScript, la publicada y la fuente acaban igual. */
  await page.goto('/beta/');
  const antes = await estado(page);
  await page.setContent(publicada);
  await page.waitForTimeout(200);
  expect(await estado(page), 'con JavaScript, /beta se ve distinta').toEqual(antes);
});
