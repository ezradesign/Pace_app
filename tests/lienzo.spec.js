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
     · el runner abre sin errores y su mando cabe en la pantalla;
     · `fijarViewport` (tests/helpers.js) no devuelve hasta que el lienzo ha recogido el tamaño nuevo.
   La prueba ingenua (un `zoom` sin más) hacía la home tres veces más alta que la ventana:
   el primer aserto de altura es el que lo caza.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, fijarViewport } = require('./helpers');

/* `exterior`: el ancho de la ventana de verdad cuando el zoom del navegador está alejado. Al
   alejarlo, la ventana mide más para la app pero `outerWidth` no cambia, y así lo distingue el
   aro fijo de un monitor grande (Playwright da siempre `outerWidth` = `innerWidth`). */
async function abrirEn(browser, ancho, alto, exterior) {
  const u = test.info().project.use;
  const context = await browser.newContext({
    viewport: { width: ancho, height: alto },
    baseURL: u.baseURL, locale: u.locale, timezoneId: u.timezoneId, colorScheme: u.colorScheme,
  });
  if (exterior) await context.addInitScript((x) => { Object.defineProperty(window, 'outerWidth', { get: () => x }); }, exterior);
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

/* El monitor de 1080p (sin zoom) ya no compara el aro ni lo que va pegado a él: allí el aro
   no crece con el lienzo (Ez, 10 nov. 2026, «siempre debería ser fijo»; tests/aro-fijo.spec.js). */
for (const [ancho, alto, nombre, exterior] of [[3060, 1404, 'zoom al 50 %', 1530], [4636, 2127, 'zoom al 33 %', 1536], [1920, 969, 'monitor de 1080p']]) {
  test(`la home llena la ventana y queda como en la efectiva · ${nombre}`, async ({ browser }) => {
    const grande = await abrirEn(browser, ancho, alto, exterior);
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
    const piezas = exterior ? ['[data-pace-dial-fit]', '[data-pace-activitybar]', '[data-pace-sidebar]', '[data-pace-tabs]'] : ['[data-pace-sidebar]', '[data-pace-tabs]'];
    for (const sel of piezas) {
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
  await page.getByRole('heading', { name: 'Fondos en silla', exact: true }).first().click();
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

/* EL CIERRE SE MIDIÓ CON EL ZOOM DE LA VENTANA ANTERIOR (CI de c9b50e50). Al bajar de 1920×1080 a
   1536×708 el lienzo quita su zoom 1,25 en el `resize`, y con el reloj falso de `page.clock` dos rAF
   no esperan a ese `resize`: cierre-sin-pisar medía con zoom y daba todo al 0 %. Aquí el lienzo tarda
   1,5 s a propósito (el index.html servido lleva su `resize` y su observador con retraso, como un PC
   cargado); sin esperar, la ventana sigue con 1,25, y `fijarViewport` solo vuelve cuando ya no. */
test('fijarViewport espera a que el lienzo recoja el tamaño nuevo, aunque tarde', async ({ browser }) => {
  const u = test.info().project.use;
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    baseURL: u.baseURL, locale: u.locale, timezoneId: u.timezoneId, colorScheme: u.colorScheme,
  });
  await sembrar(context);
  const page = await context.newPage();
  const tarde = (llamada) => 'function () { setTimeout(' + llamada + ', 1500); }';
  let retrasos = 0;
  await page.route('**/index.html', async (route) => {
    const respuesta = await route.fetch();
    const html = (await respuesta.text())
      .replace("window.addEventListener('resize', aplicar);", () => { retrasos++; return "window.addEventListener('resize', " + tarde('aplicar') + ');'; })
      .replace('new window.ResizeObserver(aplicar)', () => { retrasos++; return 'new window.ResizeObserver(' + tarde('aplicar') + ')'; });
    await route.fulfill({ response: respuesta, body: html });
  });
  await irAlArtefacto(page);
  expect(retrasos, 'GUARD: no encuentro el resize y el observador del lienzo en index.html').toBe(2);
  const lienzo = () => page.evaluate(() => ({ escala: window.paceLienzo.escala, zoom: document.documentElement.style.zoom, attr: document.documentElement.hasAttribute('data-pace-lienzo') }));
  expect((await lienzo()).escala, 'GUARD: a 1920×1080 no hay lienzo').toBe(1.25);

  await page.setViewportSize({ width: 1536, height: 708 });
  expect((await lienzo()).escala, 'GUARD: sin esperar, la ventana nueva aún lleva el zoom de la anterior').toBe(1.25);
  await fijarViewport(page, 1536, 708);
  expect(await lienzo(), 'fijarViewport volvió con el zoom de la ventana anterior').toEqual({ escala: 1, zoom: '', attr: false });
  await context.close();
});
