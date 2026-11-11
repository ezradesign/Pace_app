/* PACE · E2E · EL ARO SOLO SE DESLIZA SI EL PASO SE NOTA (Ez, aro B, 11 nov. 2026)
 * =================================================================================
 * Con un Foco en marcha, el arco y el punto del aro (`TimerDial.jsx`) avanzaban cada segundo con
 * una transición de 1 s: en un bloque de 25 min a 360 px eso es medio píxel, y costaba 60
 * fotogramas por segundo. Ahora la transición solo se pone si el paso de un segundo mide 1 px o
 * más sobre lo que se pinta del aro; si no, el aro avanza sin ella (igual a la vista).
 *
 * Se lee la transición que lleva el arco tras varios segundos normales (sin saltos), y además
 * que el arco SÍ avanza: sin eso, un aro parado pasaría la prueba.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.runFor(1000); await page.waitForTimeout(8); }
}
const leer = (page) => page.evaluate(() => {
  const arco = document.querySelector('circle[stroke-dashoffset]');
  const punto = document.querySelector('[data-pace-dial-punto] svg > g > g');
  const dura = (el) => (el ? getComputedStyle(el).transitionDuration.split(',')[0].trim() : null);
  return { arco: dura(arco), punto: dura(punto), desfase: arco ? parseFloat(arco.getAttribute('stroke-dashoffset')) : null };
});

async function arrancar(page, context, minutos, vista) {
  await sembrar(context, { focusMinutes: minutos });
  await page.setViewportSize(vista);
  await page.clock.install();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await segundos(page, 3);
  const antes = await leer(page);
  await segundos(page, 4);
  const despues = await leer(page);
  expect(despues.desfase, 'GUARD: el arco no avanzó en 4 s').toBeLessThan(antes.desfase);
  return despues;
}

test('un Foco de 25 min en el móvil: el paso es menor de 1 px y el aro avanza sin transición', async ({ page, context }) => {
  const r = await arrancar(page, context, 25, { width: 360, height: 640 });
  expect({ arco: r.arco, punto: r.punto }, 'el aro desliza medio píxel cada segundo').toEqual({ arco: '0s', punto: '0s' });
});

test('un Foco de 5 min en el ordenador: el paso pasa de 1 px y el aro se desliza', async ({ page, context }) => {
  const r = await arrancar(page, context, 5, { width: 1280, height: 720 });
  expect({ arco: r.arco, punto: r.punto }, 'un paso que se nota debe deslizarse').toEqual({ arco: '1s', punto: '1s' });
});

test('la cuenta del paso: radio pintado, lo que se ve del aro y lo que dura el bloque', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => ({
    largo25: pasoDelAroPx(300, 360, 0, 1500),     // 2π·142,5/1500 ≈ 0,60 px
    corto5: pasoDelAroPx(300, 360, 0.5, 150),     // mitad de un bloque de 5 min ≈ 2,98 px
    sinMedida: pasoDelAroPx(0, 360, 0.2, 100),
  }));
  expect(r.largo25).toBeCloseTo(0.597, 2);
  expect(r.corto5).toBeCloseTo(2.985, 2);
  expect(r.sinMedida).toBe(Infinity);
});
