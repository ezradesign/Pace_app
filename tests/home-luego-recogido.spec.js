/* PACE · E2E · «LUEGO» SE RECOGE SIN VERSE, SIN BAILAR Y SIN FOCO (Ez, 1 A2 de la octava, 12 nov. 2026)
 * ==========================================================================
 * Cuando la home del móvil no cabe ni con el aro en su suelo, la tarjeta del día enseña solo
 * «Ahora» y «Luego» queda en «Ver todo» (home-geometry.medidas.js). Aquí se prueba en una
 * pantalla más baja que las de home-sin-scroll (360×580), donde no cabe con la letra normal, y
 * así las filas que React monta al elegir el día son de tamaño real:
 *   · al elegir la jornada, ningún fotograma pinta «Luego» (un sondeo por requestAnimationFrame,
 *     puesto antes del clic, mira cada fotograma antes de pintarse). Mutante: sin el
 *     `useLayoutEffect` de RitmoMovil, el motor decide un fotograma tarde y el sondeo lo ve;
 *   · recogida, la home no pide scroll, «Luego» no recibe el foco ni sale en el árbol de
 *     accesibilidad, y sigue en «Ver todo»;
 *   · no baila: en 40 fotogramas seguidos, ninguno llega a pintar «Luego».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const LUEGO = '.pace-rt-mov [data-pace-ritmo-luego]';

for (const lang of ['es', 'en']) {
  test(lang + ' · 360×580: al elegir el día, «Luego» se recoge antes de pintarse y no baila', async ({ browser }) => {
    const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, viewport: { width: 360, height: 580 },
      isMobile: true, hasTouch: true, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
    await sembrar(context, { lang, sidebarCollapsed: true, ritmo: { libre: true } });
    const page = await context.newPage();
    await page.clock.install({ time: hora('10:00') });
    await irAlArtefacto(page);
    await vis(page, '[data-pace-ritmo-comienza]').click();
    await expect(vis(page, 'button[data-pace-ritmo-opcion="jornada"]')).toBeVisible();
    await page.evaluate((sel) => {
      window.__visto = 0;
      const mirar = () => {
        if (Array.from(document.querySelectorAll(sel)).some((e) => getComputedStyle(e).display !== 'none')) window.__visto++;
        requestAnimationFrame(mirar);
      };
      requestAnimationFrame(mirar);
    }, LUEGO);
    await vis(page, 'button[data-pace-ritmo-opcion="jornada"]').click();
    await expect(page.locator(LUEGO)).toHaveCount(1);
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    expect(await page.locator('[data-pace-home-justa]').count(), 'a 360×580 «Luego» no cabe y se recoge').toBe(1);
    expect(await page.evaluate(() => window.__visto), 'fotogramas que pintaron «Luego»').toBe(0);

    const sobra = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
      return b.scrollHeight - b.clientHeight;
    });
    expect(sobra, 'recogido, la home cabe').toBeLessThanOrEqual(1);

    /* Ni foco ni lector: no está en el árbol de accesibilidad y el tabulador no llega. */
    await expect(page.locator(LUEGO)).toBeHidden();
    const enfocables = await page.locator(LUEGO + ' button, ' + LUEGO + ' [tabindex]').evaluateAll((els) => els.filter((e) => e.offsetParent !== null).length);
    expect(enfocables).toBe(0);
    const arbol = await page.locator('.pace-rt-mov').first().ariaSnapshot();
    expect(arbol).not.toMatch(lang === 'es' ? /Luego/ : /Later/);

    /* No baila: en cada uno de 40 fotogramas, antes de pintar, «Luego» sigue recogido. Dentro de
       una pasada del motor la marca se quita y se vuelve a poner (prueba con «Luego» y sin él),
       pero sin pintar entre medias: lo que cuenta es lo que llega a cada fotograma. */
    const fotogramas = await page.evaluate(async () => {
      const vistos = [];
      window.dispatchEvent(new Event('pace:home-relayout'));
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        vistos.push(!!document.querySelector('[data-pace-home-justa]'));
      }
      return vistos.filter((v) => !v).length;
    });
    expect(fotogramas, 'fotogramas con «Luego» a la vista tras recogerse').toBe(0);

    /* «Luego» sigue en «Ver todo». */
    await vis(page, '[data-pace-ritmo-ver]').click();
    await expect(vis(page, '[data-pace-ritmo-lista]').first()).toBeVisible();
    expect(await vis(page, '[data-pace-ritmo-lista] [data-pace-ritmo-fila]').count(), 'la hoja enseña las paradas del día').toBeGreaterThan(1);
    await context.close();
  });
}
