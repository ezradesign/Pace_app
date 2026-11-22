/* PACE · E2E · EN PLENA COMIDA, EL ARO ES LA COMIDA (Ez, 1A del 22 nov. 2026)
 * ==========================================================================
 * Caza web del 22 nov. (docs/audits/caza-completa-22nov/web/comida/). Con la comida de 14:00 a 15:00, a las
 * 14:20 la jornada sirve la comida hasta las 15:00 (la B de Ez del 22 oct.), pero el aro decía «Bloque 1 de 3 ·
 * 45:00 · Empezar jornada», el botón empezaba un bloque que se comía la comida (`c14:20+0`) y «AHORA» caía en
 * el bloque de las 15:00. Ahora el aro dice «Comida · Hasta las 15:00», cuenta lo que queda, no tiene botón
 * verde («Empezar ya el bloque 1», como enlace) y «AHORA» va en la comida; llegues como llegues: eligiendo la
 * jornada a las 14:20, volviendo con el día servido o tras «Ahora no» en la ventana de la comida.
 * Contra main cae (era la H1 de docs/audits/caza-completa-22nov/web/caen-en-main.spec.js).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { HOY, HORARIO, a, vis, hasta, enLaComida } = require('./comida.helpers');

const TXT = {
  es: { comida: 'Comida', hasta: 'Hasta las 15:00', lejos: 'Lejos de la pantalla', ya: 'Empezar ya el bloque 1', despues: 'Después: bloque 1 · 45 min', ahora: 'AHORA', linea: 'Comida' },
  en: { comida: 'Lunch', hasta: 'Until 15:00', lejos: 'Away from the screen', ya: 'Start block 1 now', despues: 'Next: block 1 · 45 min', ahora: 'NOW', linea: 'Lunch' },
};
const diaDesde = (desde, extra) => ({ ritmo: { horario: Object.assign({}, HORARIO, extra || {}), dia: { fecha: HOY, opcion: 'jornada', desde, cicloBase: 0, cambios: {} } } });

/* El aro y la línea, tal como se ven. */
async function leer(page) {
  return page.evaluate(() => {
    const v = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
    const txt = (s) => { const e = v(s); return e ? e.textContent.trim() : null; };
    const linea = v('[data-pace-ritmo-linea]');
    const lt = linea ? linea.innerText.replace(/\s+/g, ' ') : '';
    const cta = v('[data-pace-cta]');
    return {
      label: txt('[data-pace-dial-label]'), hasta: txt('[data-pace-dial-hasta]'), sub: txt('[data-pace-dial-subtitle]'),
      numero: txt('[data-pace-dial-number]'), cta: cta && cta.textContent.trim(), ctaFondo: cta && getComputedStyle(cta).backgroundColor,
      despues: txt('[data-pace-aro-despues]'), linea: lt,
    };
  });
}
function comprobarComida(r, T, donde, n) {
  expect(r.label, donde + ': el rótulo del aro').toBe(T.comida);
  expect(r.hasta, donde + ': hasta cuándo').toBe(T.hasta);
  expect(r.sub, donde).toBe(T.lejos);
  expect(r.cta, donde + ': el botón del aro').toBe(T.ya.replace(/1$/, String(n || 1)));
  expect(r.ctaFondo, donde + ': el botón sigue siendo verde').toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(r.linea.indexOf(T.ahora), donde + ': «' + T.ahora + '» no va en la comida: ' + r.linea.slice(0, 90))
    .toBeLessThan(r.linea.indexOf(T.linea));
}

for (const lang of ['es', 'en']) {
  test(lang + ' · elegida la jornada a las 14:20: el aro es la comida, cuenta lo que queda y no se la come', async ({ page, context }) => {
    const errores = capturarErrores(page);
    const T = TXT[lang];
    await sembrar(context, Object.assign({ lang }, diaDesde(860)));
    await page.clock.install({ time: a('14:20') });
    await irAlArtefacto(page);
    await page.waitForTimeout(400);
    const r = await leer(page);
    comprobarComida(r, T, '14:20');
    expect(r.numero, 'la cuenta de la comida').toMatch(/^(40|39):\d\d$/);
    expect(r.despues).toBe(T.despues);
    await page.clock.runFor(65000);
    expect((await leer(page)).numero, 'la cuenta no corre').toMatch(/^(39|38):\d\d$/);
    /* «Empezar ya» sigue empezando el bloque, por si ya has comido: la comida de hoy se acaba ahí. */
    await vis(page, '[data-pace-cta]').first().click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).minutes; } catch (e) { return null; } }), 'el enlace no empezó el bloque').toBeGreaterThan(0);
    expect(await vis(page, '[data-pace-dial-label]').first().textContent(), 'con el bloque en marcha el aro vuelve a ser el bloque').not.toBe(T.comida);
    expect(errores).toEqual([]);
  });
}

test('volviendo a las 14:20 con el día servido desde las 9:00, el aro también es la comida', async ({ page, context }) => {
  await sembrar(context, diaDesde(540));
  await page.clock.install({ time: a('14:20') });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
  comprobarComida(await leer(page), TXT.es, 'de vuelta');
});

test('tras «Ahora no» en la ventana de la comida, a las 14:20 el aro es la comida', async ({ page, context }) => {
  await enLaComida(page, context);
  await hasta(page, '14:20');
  comprobarComida(await leer(page), TXT.es, 'tras «Ahora no»', 2);   // el bloque de antes de comer ya está hecho
});

test('CONTROL · con «no comes», a las 14:20 el aro es el bloque, como siempre', async ({ page, context }) => {
  await sembrar(context, diaDesde(860, { sinComida: true }));
  await page.clock.install({ time: a('14:20') });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
  const r = await leer(page);
  expect(r.label).toBe('Bloque 1 de 3');
  expect(r.cta).toBe('Empezar jornada');
});

test('CONTROL · a las 15:00 la comida se acaba y el aro vuelve al bloque', async ({ page, context }) => {
  await sembrar(context, diaDesde(860));
  await page.clock.install({ time: a('14:58') });
  await irAlArtefacto(page);
  await page.waitForTimeout(400);
  expect((await leer(page)).label).toBe('Comida');
  await page.clock.runFor(3 * 60000);
  await page.waitForTimeout(300);
  expect((await leer(page)).label).toMatch(/^Bloque 1 de \d+$/);
});

for (const [w, h] of [[1280, 720], [360, 640]]) {
  for (const lang of ['es', 'en']) {
    test(lang + ' · ' + w + '×' + h + ': en plena comida la home no pide scroll', async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      await sembrar(context, Object.assign({ lang }, diaDesde(860)));
      await page.clock.install({ time: a('14:20') });
      await irAlArtefacto(page);
      await page.waitForTimeout(500);
      expect(await vis(page, '[data-pace-dial-label]').first().textContent(), 'GUARD: el aro de la comida').toBe(TXT[lang].comida);
      const sobra = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-pace-home-body]')].find((e) => e.getBoundingClientRect().width > 0); return b.scrollHeight - b.clientHeight; });
      expect(sobra, 'la home pide scroll').toBeLessThanOrEqual(1);
    });
  }
}
