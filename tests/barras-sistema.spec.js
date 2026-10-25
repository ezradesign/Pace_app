/* PACE · las franjas del sistema siguen la paleta que se ve
 * =========================================================
 * En el móvil, las franjas de arriba (la hora y la batería) y de abajo (Atrás o
 * la barra de inicio) no son de la web: las pinta el sistema. Salían del modo
 * del móvil y no de la paleta de PACE, así que con PACE en oscuro y el móvil en
 * claro salían claras (N2, el Android de Ez, 23 oct.).
 *
 * En Android las pinta el complemento PaceBarras con lo que le dice
 * app/ui/android.js; aquí se sustituye por un espía. En el iPhone las pinta
 * PaceViewController con el `theme-color` de la web. No se prueba el móvil: se
 * prueba que la web pida la paleta que se ve, en cada momento en que cambia.
 * Que el color de cada paleta sea su `--paper` lo mira `verify` y, aquí, la
 * primera prueba contra el papel que pinta la página. Cómo se VE se mira en un
 * móvil de verdad.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

/* Un Capacitor de Android falso. `conBarras: false` es un APK sin el complemento. */
async function comoAndroid(context, conBarras) {
  await context.addInitScript((barras) => {
    const nativo = window.__nativo = { barras: [] };
    const nada = () => Promise.resolve(null);
    const plugins = {
      App: { addListener: () => ({ remove() {} }), minimizeApp: nada },
      KeepAwake: { keepAwake: nada, allowSleep: nada },
    };
    if (barras) {
      plugins.PaceBarras = { pintar: (o) => { nativo.barras.push(JSON.parse(JSON.stringify(o))); return Promise.resolve(); } };
    }
    window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true, Plugins: plugins };
  }, conBarras !== false);
}

const ultima = (page) => page.evaluate(() => window.__nativo.barras[window.__nativo.barras.length - 1] || null);
const cuantas = (page) => page.evaluate(() => window.__nativo.barras.length);
const paletaVisible = (page) => page.evaluate(() => document.documentElement.getAttribute('data-palette'));

/* El papel con el que Android pinta cada paleta, leído del recurso. */
function papelAndroid(paleta) {
  const xml = fs.readFileSync(path.join(__dirname, '..', 'android/app/src/main/res/values/pace_colores.xml'), 'utf8');
  const m = new RegExp('<color name="pace_papel_' + paleta + '">(#[0-9a-fA-F]{6})</color>').exec(xml);
  const n = parseInt(m[1].slice(1), 16);
  return 'rgb(' + (n >> 16) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ')';
}

/* El papel que pinta la página, ya acabado el cruce entre paletas. */
const papelVisible = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

function filaPaleta(page) {
  return page.locator('[data-pace-tweaks-panel] [data-pace-aj-fila="palette"]');
}

async function abrirAjustes(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
}

test('barras-1 · Android: la paleta del arranque y la que se elige en Ajustes llegan a PaceBarras', async ({ page, context }) => {
  /* PACE en oscuro con el móvil en claro: el caso de Ez. */
  await comoAndroid(context);
  await sembrar(context, { palette: 'oscuro', paletteAuto: false });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await expect.poll(() => ultima(page)).toEqual({ paleta: 'oscuro', auto: false });
  expect(await paletaVisible(page)).toBe('oscuro');
  await expect.poll(() => papelVisible(page)).toBe(papelAndroid('oscuro'));

  await abrirAjustes(page);
  await filaPaleta(page).getByRole('button', { name: 'Crema', exact: true }).click();
  await expect.poll(() => ultima(page)).toEqual({ paleta: 'crema', auto: false });
  expect(await paletaVisible(page)).toBe('crema');
  await expect.poll(() => papelVisible(page)).toBe(papelAndroid('crema'));

  /* Lo que no mueve la paleta no vuelve a llamar. */
  const antes = await cuantas(page);
  await page.evaluate(() => setState({ font: getState().font === 'mono' ? 'cormorant' : 'mono' }));
  await page.waitForTimeout(300);
  expect(await cuantas(page)).toBe(antes);

  expect(errores).toEqual([]);
});

test('barras-2 · Android: con Auto siguen al móvil, y con un bloque vivo esperan a que acabe', async ({ page, context }) => {
  await comoAndroid(context);
  await sembrar(context, { palette: 'crema', paletteAuto: true });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await expect.poll(() => ultima(page)).toEqual({ paleta: 'crema', auto: true });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => ultima(page), { timeout: 5000 }).toEqual({ paleta: 'oscuro', auto: true });
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => ultima(page), { timeout: 5000 }).toEqual({ paleta: 'crema', auto: true });

  /* Con un Foco en marcha Auto deja el cambio en espera: las franjas siguen
     con la paleta que se ve, no con la del móvil. */
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.locator('[data-pace-dial-running], [data-pace-dial-paused]')).toHaveCount(1);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(1200);
  expect(await paletaVisible(page)).toBe('crema');
  expect(await ultima(page)).toEqual({ paleta: 'crema', auto: true });

  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.getByRole('button', { name: 'Reiniciar bloque', exact: true }).click();
  await expect(page.locator('[data-pace-dial-running], [data-pace-dial-paused]')).toHaveCount(0);
  await expect.poll(() => ultima(page), { timeout: 5000 }).toEqual({ paleta: 'oscuro', auto: true });
  expect(await paletaVisible(page)).toBe('oscuro');

  /* Salir de Auto eligiendo la misma paleta cambia solo lo que se guarda para
     el arranque siguiente. */
  await abrirAjustes(page);
  await filaPaleta(page).getByRole('button', { name: 'Oscuro', exact: true }).click();
  await expect.poll(() => ultima(page)).toEqual({ paleta: 'oscuro', auto: false });

  expect(errores).toEqual([]);
});

test('barras-3 · iPhone y navegador: todas las metas theme-color dicen el papel que se ve', async ({ page, context }) => {
  await sembrar(context, { palette: 'oscuro', paletteAuto: false });
  await irAlArtefacto(page);
  const metas = () => page.evaluate(() =>
    Array.from(document.querySelectorAll('meta[name="theme-color"]')).map((m) => m.getAttribute('content')));

  /* Dos metas: antes de que hable la app eligen por el modo del sistema. */
  await expect.poll(metas).toEqual(['#1d1a14', '#1d1a14']);
  await page.evaluate(() => setState({ palette: 'crema' }));
  await expect.poll(metas).toEqual(['#F2EDE0', '#F2EDE0']);

  const html = await (await page.request.get('/index.html')).text();
  const oscura = html.indexOf('<meta name="theme-color" content="#1d1a14" media="(prefers-color-scheme: dark)">');
  const crema = html.indexOf('<meta name="theme-color" content="#F2EDE0">');
  expect(oscura, 'la meta oscura, con su media, va delante').toBeGreaterThan(-1);
  expect(crema).toBeGreaterThan(oscura);
});

test('barras-4 · control: un APK sin el complemento no se rompe ni pide nada', async ({ page, context }) => {
  await comoAndroid(context, false);
  await sembrar(context, { palette: 'oscuro', paletteAuto: false });
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.evaluate(() => setState({ palette: 'crema' }));
  await expect.poll(() => paletaVisible(page)).toBe('crema');
  expect(await cuantas(page)).toBe(0);
  expect(errores).toEqual([]);
});
