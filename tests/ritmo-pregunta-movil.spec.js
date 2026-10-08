/* PACE · E2E · LA PREGUNTA DEL DÍA EN EL MÓVIL
 * ============================================
 * Con «Comienza» se abre «¿Cuánto trabajas hoy?». Con su pie y sus dos frases la
 * home pedía 28 px de scroll a 375×667 y 46 a 360×640. Ez eligió la opción 2
 * («Hoy voy por libre» como enlace junto a la pregunta, un solo horario y las horas
 * de la media jornada al elegirla) y, de sus tres maquetaciones, la B: el horario
 * dibujado como una línea del día, con las horas encima y los rótulos debajo.
 * En escritorio no cambia nada (lo cubren ritmo.spec.js y ritmo-media.spec.js).
 *
 * Sin la frase de la media jornada, pasada su hora su chip se apagaba y en el
 * móvil no había dónde moverla a la tarde: ahora el chip enseña sus dos horas.
 *
 * Contra la versión anterior fallan todas: no había línea del día y la home
 * pedía scroll.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* A media mañana, para que las cuatro opciones estén vivas. */
async function abrirPregunta(page, context, extra) {
  await sembrar(context, Object.assign({ sidebarCollapsed: true }, extra || {}));
  await page.clock.install({ time: new Date('2026-09-22T10:00:00+02:00') });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-ritmo-comienza]').click();
  const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
  await expect(pregunta).toBeVisible();
  return pregunta;
}

function scrollDeLaHome(page) {
  return page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    return body.scrollHeight - body.clientHeight;
  });
}

for (const vp of [{ w: 375, h: 667 }, { w: 360, h: 640 }]) {
  test.describe(vp.w + '×' + vp.h, () => {
    test.use({ viewport: { width: vp.w, height: vp.h }, isMobile: true, hasTouch: true });

    test('el horario es una línea del día, el enlace va junto a la pregunta y la home no pide scroll', async ({ page, context }) => {
      const errores = capturarErrores(page);
      const pregunta = await abrirPregunta(page, context);
      const dia = pregunta.locator('[data-pace-ritmo-dia]');
      await expect(dia).toBeVisible();
      for (const campo of ['inicio', 'comida', 'comidaDur', 'salida']) {
        await expect(dia.locator('select[data-pace-ritmo-horario="' + campo + '"]')).toHaveCount(1);
      }
      await expect(dia).toContainText('Empiezas');
      await expect(dia).toContainText('Terminas');
      /* Un solo horario: ni la frase ni las horas de la media jornada. */
      await expect(pregunta.locator('.pace-rt-frase')).toHaveCount(0);
      await expect(pregunta.locator('select[data-pace-ritmo-horario^="media."]')).toHaveCount(0);
      /* «Hoy voy por libre» en la fila del título, a su derecha. */
      const g = await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
        const caja = (e) => e.getBoundingClientRect();
        const titulo = caja(p.querySelector('.pace-rt-titulo'));
        const enlace = p.querySelector('[data-pace-ritmo-libre]');
        const texto = document.createRange(); texto.selectNodeContents(enlace);
        const t = texto.getBoundingClientRect();
        return { mismaFila: t.top < titulo.bottom && t.bottom > titulo.top, aLaDerecha: t.left > titulo.right, enlaceAlto: caja(enlace).height };
      });
      expect(g.mismaFila, 'el enlace no está en la fila del título').toBe(true);
      expect(g.aLaDerecha).toBe(true);
      expect(g.enlaceAlto, 'la zona de toque del enlace').toBeGreaterThanOrEqual(40);
      await asentarGeometria(page);
      expect(await scrollDeLaHome(page), 'la home pide scroll').toBeLessThanOrEqual(1);
      expect(errores).toEqual([]);
    });
  });
}

test.describe('360×718, el móvil de Ez', () => {
  test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

  test('tocar «Empiezas» o «Terminas» abre su hora, y la línea es un dibujo', async ({ page, context }) => {
    const pregunta = await abrirPregunta(page, context);
    const golpe = await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll('[data-pace-ritmo-dia]')).find((e) => e.getBoundingClientRect().width > 0);
      const rotulos = p.querySelectorAll('.pace-rt-dia-r');
      const en = (e) => { const r = e.getBoundingClientRect(); const x = e === rotulos[2] ? r.right - 10 : r.left + 10; const h = document.elementFromPoint(x, r.top + r.height / 2); return h && h.getAttribute('data-pace-ritmo-horario'); };
      return { empiezas: en(rotulos[0]), terminas: en(rotulos[2]) };
    });
    expect(golpe).toEqual({ empiezas: 'inicio', terminas: 'salida' });
    await expect(pregunta.locator('.pace-rt-dia-via')).toHaveCount(3);
    for (const via of await pregunta.locator('.pace-rt-dia-via').all()) await expect(via).toHaveAttribute('aria-hidden', 'true');
  });

  test('«Comes» y su interruptor son un botón: apagado, la línea pierde la comida', async ({ page, context }) => {
    const pregunta = await abrirPregunta(page, context);
    const sw = pregunta.locator('[data-pace-ritmo-comes]');
    await expect(sw).toHaveAttribute('aria-checked', 'true');
    /* Su nombre es la palabra que se ve, para quien lo maneja con la voz (WCAG 2.5.3). */
    await expect(sw).toHaveAccessibleName('comes');
    const caja = await sw.boundingBox();
    expect(caja.height, 'la zona de toque de «Comes»').toBeGreaterThanOrEqual(32);
    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', 'false');
    await expect(sw).toContainText('no comes');
    await expect(sw).toHaveAccessibleName('no comes');
    await expect(pregunta.locator('select[data-pace-ritmo-horario="comida"]')).toHaveCount(0);
    await expect(pregunta.locator('.pace-rt-dia-comida')).toHaveCount(0);
    expect(await page.evaluate(() => getState().ritmo.horario.sinComida)).toBe(true);
    await sw.click();
    await expect(pregunta.locator('select[data-pace-ritmo-horario="comida"]')).toHaveCount(1);
  });

  test('en inglés nada se sale del panel', async ({ page, context }) => {
    const pregunta = await abrirPregunta(page, context, { lang: 'en' });
    await expect(pregunta.locator('[data-pace-ritmo-dia]')).toContainText('Start');
    await expect(pregunta.locator('[data-pace-ritmo-dia]')).toContainText('Finish');
    const fuera = await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
      const pr = p.getBoundingClientRect();
      return Array.from(p.querySelectorAll('*')).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > pr.right + 0.5 || r.left < pr.left - 0.5); }).length;
    });
    expect(fuera).toBe(0);
  });
});

test.describe('por la tarde, a 360×718', () => {
  test.use({ viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true });

  test('pasada su hora, «Media jornada» enseña sus horas y se mueve a la tarde', async ({ page, context }) => {
    const errores = capturarErrores(page);
    /* Una media jornada de mañana guardada, y son las 15:30: la pregunta sale sola. */
    await sembrar(context, { sidebarCollapsed: true,
      ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, media: { inicio: 540, salida: 780 } } } });
    await page.clock.install({ time: new Date('2026-09-22T15:30:00+02:00') });
    await irAlArtefacto(page);
    const pregunta = vis(page, '[data-pace-ritmo-estado="pregunta"]');
    const horas = pregunta.locator('[data-pace-ritmo-media-horas]');
    await expect(horas).toContainText('Media jornada');
    await expect(horas.locator('select')).toHaveCount(2);
    await asentarGeometria(page);
    expect(await scrollDeLaHome(page), 'enseñar las horas no estira el chip').toBeLessThanOrEqual(1);
    await horas.locator('select[data-pace-ritmo-horario="media.inicio"]').selectOption('900');
    await horas.locator('select[data-pace-ritmo-horario="media.salida"]').selectOption('1140');
    const chip = pregunta.locator('button[data-pace-ritmo-opcion="media"]');
    await expect(chip, 'con el tramo en la tarde vuelve a ser un chip').toBeEnabled();
    await expect(chip, 'que empieza ahora y acaba a su hora').toContainText('De 15:30 a 19:00');
    await chip.click();
    await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toContainText('Media jornada');
    expect(await page.evaluate(() => { const m = ritmoPlan(getState()).m; return [m.opcion, m.hasta]; })).toEqual(['media', 1140]);
    expect(errores).toEqual([]);
  });
});
