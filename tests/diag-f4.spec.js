/* RAMA DE DIAGNÓSTICO (no se junta): cuánto le sobra a cada alternativa de la F4 (la frase de la zona en
   inglés) en el hueco más estrecho, el motivo de la ventana de la pausa a 360 px. Solo mide e imprime. */
'use strict';

const { test } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const CANDIDATAS = [
  ['ahora: idle today / idle yesterday', '{zona}: idle today', '{zona}: idle yesterday'],
  ['elegida: not moved yet / not moved yesterday', '{zona}: not moved yet', '{zona}: not moved yesterday'],
  ['not moved yet / unmoved yesterday', '{zona}: not moved yet', '{zona}: unmoved yesterday'],
  ['unmoved / unmoved yesterday', '{zona}: unmoved', '{zona}: unmoved yesterday'],
  ['not moved yet / still yesterday', '{zona}: not moved yet', '{zona}: still yesterday'],
];

test.use({ viewport: { width: 360, height: 718 } });
test('mide la F4 en la ventana de la pausa', async ({ page, context }) => {
  await sembrar(context, { ritmo: { horario: H, dia: { fecha: '2026-10-14', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: new Date('2026-10-14T09:00:00+02:00') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  for (let i = 0; i < 60 && !(await page.locator('[data-pace-break-shortcut]').count()); i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
  }
  await page.locator('[data-pace-break-ritmo] .pace-break-motivo').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate((cands) => {
    const el = document.querySelector('[data-pace-break-ritmo] .pace-break-motivo');
    const util = el.clientWidth;
    const ancho = (t) => { const c = el.cloneNode(false); c.style.cssText = 'position:absolute;visibility:hidden;width:max-content;white-space:nowrap'; c.textContent = t; el.parentElement.appendChild(c); const w = c.getBoundingClientRect().width; c.remove(); return w; };
    const S = window.PACE_STRINGS.en;
    const zonas = ['cuello', 'hombros', 'espalda', 'caderas', 'piernas', 'manos'].map((z) => S['ritmo.zona.' + z]);
    return cands.map(([nombre, hoy, ayer]) => {
      const peor = (pat) => Math.max(...zonas.map((z) => ancho(pat.replace('{zona}', z))));
      return { nombre, util, hoy: +(util - peor(hoy)).toFixed(2), ayer: +(util - peor(ayer)).toFixed(2) };
    });
  }, CANDIDATAS);
  for (const x of r) console.log('DIAG ' + JSON.stringify(x));
});
