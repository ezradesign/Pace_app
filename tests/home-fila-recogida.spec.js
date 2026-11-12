/* PACE · E2E · LAS ACTIVIDADES EN UNA FILA SIN VERSE A DESTIEMPO, SIN BAILAR Y SIN PERDER EL NOMBRE (Ez, B de la octava, 12 nov. 2026)
 * ==========================================================================
 * Donde la tarjeta del día no tiene «Luego» (la tarjeta corta y el día ya contestado), si la home
 * del móvil no cabe ni con el aro en su suelo, las cuatro actividades van en una fila, solo con su
 * dibujo (home-geometry.medidas.js). Aquí se prueba en una pantalla más baja que las de
 * home-sin-scroll (360×600), donde la tarjeta corta no cabe con la letra normal:
 *   · al volver de la pregunta con «Hoy por libre», ningún fotograma pinta la rejilla de dos por
 *     dos (un sondeo por requestAnimationFrame, puesto antes del clic, mira cada fotograma antes de
 *     pintarse). Mutante: sin el `useLayoutEffect` de ActivityBar, el motor decide un fotograma
 *     tarde y el sondeo lo ve;
 *   · en fila, la home no pide scroll, las cuatro van en la misma línea y cada una dice su nombre
 *     al lector (aria-label) y en el tooltip (title), y el tabulador pasa por las cuatro con su
 *     nombre. Mutante: con el bloque de texto en `display: none` y sin `paceHomeFilaNombres`, los
 *     botones se quedan sin nombre;
 *   · no baila: en 40 fotogramas seguidos tras pedir otra pasada, ninguno deshace la fila, el aro
 *     no cambia y el foco sigue en la actividad que lo tenía. Mutante: si el motor decide con la
 *     fila ya puesta (y la quita al acabar en vez de al empezar), la fila va y viene y la prueba
 *     cae. El relleno que se anima (el botón lleva `transition: all 220ms`) solo se ve en WebKit, y
 *     ahí lo caza home-sin-scroll: la fila salía con la letra normal;
 *   · control: a 360×640 con la letra normal, nada cambia: rejilla de dos por dos, rótulos a la
 *     vista y sin tooltip.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const FILA = '[data-pace-home-fila]';
const CHIP = '[data-pace-activitybar-chip]';
const NOMBRES = { es: ['Respira', 'Estira', 'Mueve', 'Hidrátate'], en: ['Breathe', 'Stretch', 'Move', 'Hydrate'] };

async function abrir(browser, lang, alto) {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, viewport: { width: 360, height: alto },
    isMobile: true, hasTouch: true, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  await sembrar(context, { lang, sidebarCollapsed: true, ritmo: { libre: true } });
  const page = await context.newPage();
  await page.clock.install({ time: hora('10:00') });
  await irAlArtefacto(page);
  return { context, page };
}

const scrollHome = (page) => page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  return b.scrollHeight - b.clientHeight;
});

for (const lang of ['es', 'en']) {
  test(lang + ' · 360×600: al volver por libre, las actividades salen ya en fila, con su nombre, y no bailan', async ({ browser }) => {
    const { context, page } = await abrir(browser, lang, 600);
    await vis(page, '[data-pace-ritmo-comienza]').click();
    await expect(vis(page, '[data-pace-ritmo-libre]')).toBeVisible();
    await expect(page.locator(CHIP)).toHaveCount(0);
    await page.evaluate(({ chip, fila }) => {
      window.__visto = 0;
      const mirar = () => {
        if (document.querySelector(chip) && !document.querySelector(fila)) window.__visto++;
        requestAnimationFrame(mirar);
      };
      requestAnimationFrame(mirar);
    }, { chip: CHIP, fila: FILA });
    await vis(page, '[data-pace-ritmo-libre]').click();
    await expect(page.locator(CHIP)).toHaveCount(4);
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    expect(await page.locator(FILA).count(), 'a 360×600 la tarjeta corta no cabe y las actividades van en fila').toBe(1);
    expect(await page.evaluate(() => window.__visto), 'fotogramas con la rejilla de dos por dos').toBe(0);
    expect(await scrollHome(page), 'en fila, la home cabe').toBeLessThanOrEqual(1);

    /* Las cuatro en la misma línea, cada una con su nombre para el lector y en el tooltip. */
    const cajas = await page.locator(CHIP).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(cajas).size, 'las cuatro en una fila').toBe(1);
    for (const nombre of NOMBRES[lang]) {
      const boton = page.getByRole('button', { name: nombre, exact: true });
      await expect(boton).toBeVisible();
      await expect(boton).toHaveAttribute('title', nombre);
    }

    /* El tabulador pasa por las cuatro, en orden y con su nombre. */
    await page.locator(CHIP).first().focus();
    const enfocados = [];
    for (let i = 0; i < 4; i++) {
      enfocados.push(await page.evaluate(() => document.activeElement.getAttribute('aria-label')));
      await page.keyboard.press('Tab');
    }
    expect(enfocados, 'el tabulador, por las cuatro').toEqual(NOMBRES[lang]);

    /* No baila: otra pasada del motor (la marca se quita y se pone dentro de ella, sin pintar) y
       40 fotogramas; ninguno llega sin la fila, el aro no cambia y el foco no se pierde. */
    await page.locator(CHIP).nth(1).focus();
    const tras = await page.evaluate(async ({ fila, chip }) => {
      const d = () => getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d').trim();
      const antes = d();
      const foco = document.activeElement;
      let sinFila = 0, otroAro = 0, sinFoco = 0;
      window.dispatchEvent(new Event('pace:home-relayout'));
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => requestAnimationFrame(r));
        if (!document.querySelector(fila)) sinFila++;
        if (d() !== antes) otroAro++;
        if (document.activeElement !== foco || !foco.matches(chip)) sinFoco++;
      }
      return { sinFila, otroAro, sinFoco };
    }, { fila: FILA, chip: CHIP });
    expect(tras, 'fotogramas que deshacen la fila, mueven el aro o pierden el foco').toEqual({ sinFila: 0, otroAro: 0, sinFoco: 0 });

    /* Y sigue sirviendo: el dibujo de Respira abre su biblioteca. */
    await page.getByRole('button', { name: NOMBRES[lang][0], exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await context.close();
  });

  test(lang + ' · 360×640 con la letra normal: las actividades no cambian', async ({ browser }) => {
    const { context, page } = await abrir(browser, lang, 640);
    await expect(page.locator(CHIP)).toHaveCount(4);
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    expect(await page.locator(FILA).count(), 'con la letra normal cabe: sin fila').toBe(0);
    expect(await scrollHome(page)).toBeLessThanOrEqual(1);
    const tops = await page.locator(CHIP).evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(tops).size, 'rejilla de dos por dos').toBe(2);
    for (const nombre of NOMBRES[lang]) await expect(vis(page, CHIP + ' [data-pace-chip-label]').filter({ hasText: nombre })).toHaveCount(1);
    expect(await page.locator(CHIP + '[title], ' + CHIP + '[aria-label]').count(), 'sin tooltip ni aria-label').toBe(0);
    await context.close();
  });
}
