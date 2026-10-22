/* PACE · la página para los testers de Android (/beta) y la letra de /beta y /premium (22 oct. 2026)
 * ===========================================================================================
 * Lo que vigila:
 *   · que /beta no pide nada a otro dominio, no tiene scroll lateral a 360 px, va en castellano
 *     y en inglés (también las capturas) y no guarda correos: ni formulario ni /api/;
 *   · que un enlace pendiente no enseña un botón que no lleva a ningún sitio, y que al ponerlo en
 *     el bloque de datos sale su botón;
 *   · que el enlace de la prueba de Play lleva el id del paquete de Android;
 *   · que /beta y /premium usan la letra y el botón de la app (Cormorant itálica y el «Empezar» del
 *     Foco, opción A de Ez) y los colores de app/tokens.css, en claro y en oscuro.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { capturarErrores } = require('./helpers');

const RAIZ = path.join(__dirname, '..');
const PAGINA = '/beta/';
const BLOQUE = /(<script type="application\/json" data-enlaces>)([\s\S]*?)(<\/script>)/;

/* Se lee en cada prueba: sin la página, cae cada una por su lado y no la suite al cargar. */
function enlaces() { return JSON.parse(fs.readFileSync(path.join(RAIZ, 'beta', 'index.html'), 'utf8').match(BLOQUE)[2]); }

/* Los valores de un bloque de app/tokens.css, sin comentarios. */
function tokensDe(selector) {
  const css = fs.readFileSync(path.join(RAIZ, 'app', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const i = css.indexOf('\n' + selector + ' {');
  const cuerpo = css.slice(i, css.indexOf('}', i));
  const out = {};
  for (const m of cuerpo.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim().toUpperCase();
  return out;
}
const CLARO = tokensDe(':root');
const OSCURO = Object.assign({}, CLARO, tokensDe('[data-palette="oscuro"]'));
/* Nombre en la página → nombre en la app. */
const ACENTOS = { '--focus': '--focus', '--cta': '--focus-cta', '--breathe': '--breathe', '--move': '--move', '--extra': '--extra', '--hydrate': '--hydrate' };

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 'rgb(' + (n >> 16) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')';
}

test.describe('a 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('/beta no pide nada fuera, cabe a lo ancho, no guarda correos y los pasos pendientes dicen que llegan pronto', async ({ page, baseURL }) => {
    const errores = capturarErrores(page);
    const fuera = [];
    const api = [];
    page.on('request', (r) => {
      if (!r.url().startsWith(baseURL) && !r.url().startsWith('data:')) fuera.push(r.url());
      if (new URL(r.url()).pathname.startsWith('/api/')) api.push(r.url());
    });
    await page.goto(PAGINA);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Prueba PACE en Android antes que nadie.' })).toBeVisible();
    expect(fuera).toEqual([]);
    expect(api).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
    await expect(page.locator('form, input')).toHaveCount(0);

    for (const [clave, frase] of [['grupo', 'El grupo abre muy pronto.'], ['play', 'El enlace llega cuando Google apruebe la prueba.']]) {
      await expect(page.locator('[data-enlace=' + clave + ']')).toBeHidden();
      await expect(page.locator('[data-pronto=' + clave + ']')).toHaveText(frase);
    }
    /* La primera captura, la que se ve sin deslizar, ha cargado. */
    await expect.poll(() => page.locator('.tira img').first().evaluate((i) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    expect(errores).toEqual([]);
  });
});

test('/beta en inglés cambia los textos y las capturas, y el botón vuelve al castellano y lo recuerda', async ({ page }) => {
  await page.goto(PAGINA + '?lang=en');
  await expect(page.getByRole('heading', { name: 'Try PACE on Android before anyone else.' })).toBeVisible();
  await expect(page).toHaveTitle('Try PACE on Android · PACE');
  const capturas = page.locator('.tira img');
  await expect(capturas).toHaveCount(3);
  for (const src of await capturas.evaluateAll((l) => l.map((i) => i.getAttribute('src')))) expect(src).toMatch(/-en\.webp$/);
  await expect.poll(() => capturas.evaluateAll((l) => l.every((i) => i.complete && i.naturalWidth > 0))).toBe(true);

  await page.locator('[data-idioma]').click();
  await expect(page.getByRole('heading', { name: 'Tres pasos' })).toBeVisible();
  for (const src of await capturas.evaluateAll((l) => l.map((i) => i.getAttribute('src')))) expect(src).toMatch(/-es\.webp$/);
  await page.goto(PAGINA);
  await expect(page.getByRole('heading', { name: 'Tres pasos' })).toBeVisible();
});

test('con los enlaces puestos en el bloque de datos, cada paso enseña su botón y abre aparte', async ({ page }) => {
  const puestos = {
    grupo: { url: 'https://groups.google.com/g/pace-testers', pendiente: false },
    play: Object.assign({}, enlaces().play, { pendiente: false }),
  };
  await page.route((url) => url.pathname === PAGINA, async (route) => {
    const r = await route.fetch();
    const cuerpo = (await r.text()).replace(BLOQUE, (_, a, __, c) => a + JSON.stringify(puestos) + c);
    await route.fulfill({ response: r, body: cuerpo });
  });
  await page.goto(PAGINA);
  for (const clave of ['grupo', 'play']) {
    const boton = page.locator('[data-enlace=' + clave + ']');
    await expect(boton).toBeVisible();
    await expect(boton).toHaveAttribute('href', puestos[clave].url);
    await expect(boton).toHaveAttribute('target', '_blank');
    await expect(page.locator('[data-pronto=' + clave + ']')).toBeHidden();
  }
  await expect(page.getByRole('link', { name: 'Unirme al grupo' })).toBeVisible();
});

test('los dos enlaces están en el bloque de datos y el de Play lleva el id del paquete de Android', async () => {
  const datos = enlaces();
  expect(Object.keys(datos).sort()).toEqual(['grupo', 'play']);
  for (const e of Object.values(datos)) expect(typeof e.pendiente).toBe('boolean');
  const gradle = fs.readFileSync(path.join(RAIZ, 'android', 'app', 'build.gradle'), 'utf8').match(/applicationId\s+"([^"]+)"/)[1];
  const capacitor = JSON.parse(fs.readFileSync(path.join(RAIZ, 'capacitor.config.json'), 'utf8')).appId;
  expect(capacitor).toBe(gradle);
  expect(datos.play.url).toBe('https://play.google.com/apps/testing/' + gradle);
  /* /beta es de la web: no va dentro del APK. */
  expect(fs.readFileSync(path.join(RAIZ, 'scripts', 'android-www.js'), 'utf8')).not.toMatch(/['"/]beta\b/);
});

for (const ruta of ['/beta/', '/premium/']) {
  test(ruta + ' usa la letra y el botón de la app y sus colores, en claro y en oscuro', async ({ page }) => {
    const fuentes = [];
    page.on('request', (r) => { if (r.url().includes('/fonts/')) fuentes.push(r.url()); });
    await page.goto(ruta);
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const leido = await page.evaluate(() => {
      const h1 = getComputedStyle(document.querySelector('h1'));
      const b = getComputedStyle(document.querySelector('.boton.lleno'));
      return { h1: [h1.fontFamily.split(',')[0], h1.fontStyle], boton: [b.fontFamily.split(',')[0], b.fontStyle, b.backgroundColor] };
    });
    expect(leido.h1).toEqual(['"Cormorant Garamond"', 'italic']);
    expect(leido.boton).toEqual(['"Cormorant Garamond"', 'italic', rgb(CLARO['--focus-cta'])]);
    expect(fuentes.some((u) => /cormorantgaramond-500-italic/.test(u))).toBe(true);
    /* En el ordenador tampoco hay scroll lateral: las capturas de /beta ensanchaban su columna. */
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
    expect(fuentes.filter((u) => /ebgaramond/.test(u))).toEqual([]);

    for (const [esquema, app] of [['light', CLARO], ['dark', OSCURO]]) {
      await page.emulateMedia({ colorScheme: esquema });
      const pagina = await page.evaluate((nombres) => {
        const s = getComputedStyle(document.documentElement);
        return nombres.map((n) => [n, s.getPropertyValue(n).trim().toUpperCase()]).filter((p) => p[1]);
      }, Object.keys(ACENTOS));
      expect(pagina.length, ruta + ' sin los colores de la app').toBeGreaterThanOrEqual(5);
      for (const [n, valor] of pagina) expect(valor, ruta + ' ' + n + ' en ' + esquema).toBe(app[ACENTOS[n]]);
    }
  });
}
