/* PACE · tests/lienzo.spec.js
   ==========================
   EL LIENZO QUE CRECE (app/main/_lienzo.js, opción 2 de la escala con el zoom, elegida por
   Ez). Con el zoom del navegador al 33 % la ventana mide para la app tres veces más y PACE
   se quedaba diminuta en una esquina. Ahora, por encima de 1536 × 704, la app crece en
   proporción y se ve como en el portátil de Ez al 100 %.

   Lo que defiende:
     · por debajo del lienzo no cambia nada (ni zoom ni variables): el portátil de Ez al
       100 %, y quien amplía para leer;
     · por encima, la app llena la ventana justa, sin scroll, y la home queda en el mismo
       sitio que en la ventana efectiva: el aro, las actividades y el panel del día;
     · el runner abre sin errores y su mando cabe en la pantalla.
   La prueba ingenua (un `zoom` sin más) hacía la home tres veces más alta que la ventana:
   el primer aserto de altura es el que lo caza.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

async function abrirEn(browser, ancho, alto) {
  const u = test.info().project.use;
  const context = await browser.newContext({
    viewport: { width: ancho, height: alto },
    baseURL: u.baseURL, locale: u.locale, timezoneId: u.timezoneId, colorScheme: u.colorScheme,
  });
  await sembrar(context);
  const page = await context.newPage();
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await page.waitForTimeout(900);
  return { context, page, errores };
}

/* La caja de una pieza en px de la ventana efectiva (la de pantalla dividida por la escala). */
const caja = (page, sel) => page.evaluate((s) => {
  const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  const k = (window.paceLienzo && window.paceLienzo.escala) || 1;
  return { top: r.top / k, left: r.left / k, width: r.width / k, height: r.height / k };
}, sel);

for (const [ancho, alto] of [[1530, 702], [1024, 600], [1536, 704]]) {
  test(`sin lienzo por debajo de 1536 × 704 (${ancho}x${alto})`, async ({ browser }) => {
    const { context, page, errores } = await abrirEn(browser, ancho, alto);
    const m = await page.evaluate(() => ({
      escala: window.paceLienzo && window.paceLienzo.escala,
      zoom: document.documentElement.style.zoom,
      attr: document.documentElement.hasAttribute('data-pace-lienzo'),
      vh: document.documentElement.style.getPropertyValue('--pace-vh'),
    }));
    expect(m).toEqual({ escala: 1, zoom: '', attr: false, vh: '' });
    expect(errores).toEqual([]);
    await context.close();
  });
}

for (const [ancho, alto, nombre] of [[3060, 1404, 'zoom al 50 %'], [4636, 2127, 'zoom al 33 %'], [1920, 969, 'monitor de 1080p']]) {
  test(`la home llena la ventana y queda como en la efectiva · ${nombre}`, async ({ browser }) => {
    const grande = await abrirEn(browser, ancho, alto);
    const escala = await grande.page.evaluate(() => window.paceLienzo.escala);
    expect(escala, 'el lienzo no se puso').toBeGreaterThan(1);

    /* LA APP MIDE LA VENTANA, NI MÁS NI MENOS. Con el zoom ingenuo medía escala veces más. */
    const raiz = await grande.page.evaluate(() => {
      const r = document.querySelector('[data-pace-app-root]').getBoundingClientRect();
      const s = document.scrollingElement;
      return { alto: r.height, ancho: r.width, scroll: s.scrollHeight - s.clientHeight, ventana: innerHeight };
    });
    expect(Math.abs(raiz.alto - raiz.ventana), 'la raíz no mide lo que la ventana').toBeLessThanOrEqual(2);
    expect(raiz.scroll, 'la página hace scroll').toBeLessThanOrEqual(0);

    /* Y LA HOME EN SU SITIO: lo mismo que en una ventana del tamaño efectivo, con la
       tolerancia del redondeo de las letras al dibujarse más grandes (medido: ≤ 8 px). */
    const efectiva = await abrirEn(browser, Math.round(ancho / escala), Math.round(alto / escala));
    for (const sel of ['[data-pace-dial-fit]', '[data-pace-activitybar]', '[data-pace-sidebar]', '[data-pace-tabs]']) {
      const a = await caja(grande.page, sel), b = await caja(efectiva.page, sel);
      expect(a, 'no encuentro ' + sel + ' con el lienzo').not.toBeNull();
      expect(b, 'no encuentro ' + sel + ' en la ventana efectiva').not.toBeNull();
      for (const k of ['top', 'left', 'width', 'height']) {
        expect(Math.abs(a[k] - b[k]), sel + ' · ' + k + ' se desplaza con el lienzo').toBeLessThanOrEqual(10);
      }
    }
    expect(grande.errores).toEqual([]);
    await grande.context.close();
    await efectiva.context.close();
  });
}

test('el runner abre con el lienzo y su mando cabe en la pantalla', async ({ browser }) => {
  const { context, page, errores } = await abrirEn(browser, 4636, 2127);
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.getByRole('heading', { name: 'Flexiones de escritorio', exact: true }).first().click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await expect(page.locator('[data-pace-v1-mando]')).toBeVisible();
  const m = await page.evaluate(() => {
    const r = document.querySelector('[data-pace-v1-mando]').getBoundingClientRect();
    return { abajo: r.bottom, ventana: innerHeight };
  });
  expect(m.abajo, 'el mando se sale de la pantalla').toBeLessThanOrEqual(m.ventana);
  expect(errores).toEqual([]);
  await context.close();
});
