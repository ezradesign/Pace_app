/* PACE · E2E · UNA CIFRA DE 1 VA EN SINGULAR
 * ==========================================
 * `tn` solo rellena huecos: el singular es una clave hermana que el código elige con la cifra
 * (`verify.plurales.js` barre todas las claves con cifra y exige el singular o su motivo).
 * El barrido destapó dos sitios donde podía salir un 1 en plural:
 *  · importar una copia con un solo logro decía «La copia trae 1 logros» («1 achievements»);
 *  · la carta del lunes de una semana con una sola pausa decía «1 de 1 pausas hechas».
 * Calibradas en rojo: sin las claves .uno / .una (o sin elegirlas), caen las dos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const AVISO = '[data-pace-aj-aviso]';
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };

for (const lang of ['es', 'en']) {
  test('importar una copia con un solo logro lo dice en singular, con y sin su día (' + lang + ')', async ({ page, context }) => {
    await page.clock.install({ time: new Date(2026, 10, 16, 12, 0) });
    await sembrar(context, { lang, langAuto: false, totalFocusMin: 500 });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: ABRIR[lang] }).click();
    const aviso = page.locator(AVISO);
    const entregar = (extra, logros) => page.locator('input[type="file"][data-pace-traer-copia]').setInputFiles({
      name: 'pace-backup.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(Object.assign({ app: 'PACE', state: { firstSeen: 1, lang, langAuto: false, palette: 'crema',
        ritmo: { libre: true }, totalFocusMin: 42, achievements: logros } }, extra))),
    });
    const cancelar = async () => {
      await aviso.getByRole('button', { name: lang === 'es' ? 'Cancelar' : 'Cancel' }).click();
      await expect(aviso).toHaveCount(0);
    };
    const UNO = lang === 'es'
      ? ['La copia trae 1 logro y 42 min de foco.', 'La copia es del 3 de noviembre y trae 1 logro y 42 min de foco.']
      : ['This copy contains 1 achievement and 42 min of Focus.', /This copy is from .+ and contains 1 achievement and 42 min of Focus\./];

    await entregar({}, { 'first.focus': 1 });
    await expect(aviso).toContainText(UNO[0]);
    await cancelar();

    await entregar({ version: 'v0.100.0', exportedAt: '2026-11-03T18:30:00.000Z' }, { 'first.focus': 1 });
    await expect(aviso).toContainText(UNO[1]);
    await cancelar();

    /* El CONTROL: con dos, el plural de siempre, sin tocar. */
    await entregar({}, { 'first.focus': 1, 'explore.tweaks': 1 });
    await expect(aviso).toContainText(lang === 'es' ? 'La copia trae 2 logros y 42 min de foco.' : 'This copy contains 2 achievements and 42 min of Focus.');
    await cancelar();
  });
}

test('la carta de una semana con una sola pausa dice «1 de 1 pausa hecha»', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }, libre: true } });
  await page.clock.install({ time: new Date(2026, 9, 19, 8, 30) });
  await irAlArtefacto(page);
  await page.evaluate(() => {
    const barras = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ d, hechas: d === 1 ? 1 : 0, total: d === 1 ? 1 : 0 }));
    const res = { semana: { lunes: '2026-10-19', desde: '2026-10-12', hasta: '2026-10-18' }, dias: 3, carta: true,
                  ayudo: [], hechas: 1, total: 1, barras, cambios: [] };
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: { lunes: '2026-10-19', res, vista: null, respuesta: null, hora: null } }) }));
  });
  const carta = page.locator('[data-pace-carta]');
  await expect(carta).toBeVisible();
  await expect(carta).toContainText('1 de 1 pausa hecha');
  await expect(carta).not.toContainText('pausas hechas');
});
