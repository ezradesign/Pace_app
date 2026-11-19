/* PACE · tests/caza-19nov-noche.spec.js
   =====================================
   6 · DE NOCHE, LA LOSETA QUE YA NO CABE SE APAGA (6B de Ez, caza del 19 nov. 2026). A las 23:30
   «Una hora» y «Dos horas» decían las dos «Hasta las 0:00», y «Dos horas» daba 30 min; a las 22:45,
   «Dos horas · Hasta las 0:00» era 1 h 15. Ahora la que la medianoche cortaría se apaga, como ya se
   apaga «Jornada entera · Tu jornada ya terminó», y dice «Ya no cabe hoy».
*/
'use strict';
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function preparar(page, context, hora, vp) {
  await page.setViewportSize(vp);
  await sembrar(context, { ritmo: undefined });
  await page.clock.install({ time: hora });
  await irAlArtefacto(page);
  const vis = (sel) => page.locator(sel).filter({ visible: true });
  const comienza = vis('[data-pace-ritmo-comienza]');
  if (await comienza.count()) await comienza.first().click();
  /* En el móvil, las losetas de la pregunta; en el ordenador, las de la tarjeta de la home. */
  const loseta = (op) => vis('[data-pace-ritmo-opcion="' + op + '"], [data-pace-ritmo-loseta="' + op + '"]').first();
  await expect(loseta('1h')).toBeVisible();
  return loseta;
}

for (const [nombre, vp] of [['360', { width: 360, height: 640 }], ['1280', { width: 1280, height: 720 }]]) {
  test(nombre + ' · a las 23:30 «Una hora» y «Dos horas» ya no caben: apagadas y lo dicen', async ({ page, context }) => {
    const loseta = await preparar(page, context, new Date(2026, 10, 19, 23, 30), vp);
    for (const op of ['1h', '2h']) {
      await expect(loseta(op)).toBeDisabled();
      await expect(loseta(op)).toContainText('Ya no cabe hoy');
      await expect(loseta(op)).not.toContainText('Hasta las');
    }
  });

  test(nombre + ' · a las 22:45, «Una hora» sigue y «Dos horas» se apaga', async ({ page, context }) => {
    const loseta = await preparar(page, context, new Date(2026, 10, 19, 22, 45), vp);
    await expect(loseta('1h')).toBeEnabled();
    await expect(loseta('1h')).toContainText('Hasta las 23:45');
    await expect(loseta('2h')).toBeDisabled();
    await expect(loseta('2h')).toContainText('Ya no cabe hoy');
  });

  test(nombre + ' · por la tarde, las dos caben como siempre', async ({ page, context }) => {
    const loseta = await preparar(page, context, new Date(2026, 10, 19, 16, 40), vp);
    await expect(loseta('1h')).toBeEnabled();
    await expect(loseta('2h')).toBeEnabled();
    await expect(loseta('2h')).toContainText('Hasta las 18:40');
  });
}

test('en inglés, «No longer fits today»', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { ritmo: undefined, lang: 'en' });
  await page.clock.install({ time: new Date(2026, 10, 19, 23, 30) });
  await irAlArtefacto(page);
  const comienza = page.locator('[data-pace-ritmo-comienza]').filter({ visible: true });
  if (await comienza.count()) await comienza.first().click();
  const dos = page.locator('[data-pace-ritmo-opcion="2h"]').filter({ visible: true }).first();
  await expect(dos).toBeDisabled();
  await expect(dos).toContainText('No longer fits today');
});
