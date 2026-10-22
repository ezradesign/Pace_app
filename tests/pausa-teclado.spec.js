/* PACE · E2E · INTRO Y ESPACIO EN EL MENÚ DE PAUSA (A8, auditoría del 22 oct. 2026)
 * ===============================================================================
 * El atajo global de `BreakMenu.jsx` cogía Intro aunque el foco estuviera en un botón: con Tab
 * en «Saltar» o en Estira, Intro elegía la propuesta, y con la del agua sumaba un vaso. Ahora
 * Intro y Espacio hacen lo del botón que tiene el foco, y la propuesta solo va con Intro cuando
 * el foco no está en ningún control; ningún atajo responde con Ctrl, Cmd o Alt ni a mitad de una
 * composición. Contra v0.174.4 cae la primera.
 *
 * El menú se abre como lo abre un bloque de foco al acabar (`focoPausa`, FocusTimer.pestanas.jsx),
 * a las 13:00 y sin vasos: la propuesta es el agua, la que suma un vaso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

const alaUna = () => { const d = new Date(); d.setHours(13, 0, 0, 0); return d.getTime(); };
const pausa = (page) => page.locator('[data-pace-break-shortcut]');
const botones = (page) => page.locator('[role="dialog"]').filter({ has: pausa(page) }).locator('button');

let veces = 0;
async function abrirPausa(page) {
  await page.evaluate(() => localStorage.removeItem('pace.state.v2'));
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate((id) => setState(prev => ({ ...prev, focoPausa: { id: id, dia: new Date().toDateString() } })), 'a8-' + (++veces));
  await expect(pausa(page)).toHaveCount(1);
}
/* Lo que se ve después: los vasos de hoy, si sigue la pausa, si hay sesión y qué diálogos hay. */
const huella = (page) => page.evaluate(() => ({
  vasos: getState().water.today,
  pausa: !!document.querySelector('[data-pace-break-shortcut]'),
  sesion: !!document.querySelector('[data-pace-session-root]'),
  dialogos: [...document.querySelectorAll('[role="dialog"]')].map(d => d.textContent.trim().slice(0, 30)),
}));
async function tabulaHasta(page, boton) {
  for (let k = 0; k < 20 && !(await boton.evaluate(b => b === document.activeElement)); k++) await page.keyboard.press('Tab');
  expect(await boton.evaluate(b => b === document.activeElement), 'GUARD: Tab no llega al botón').toBe(true);
}

test('Intro y Espacio hacen lo del botón con el foco; la propuesta, solo con el foco fuera', async ({ page }) => {
  test.setTimeout(150_000);
  await page.clock.install({ time: alaUna() });
  await irAlArtefacto(page);
  await abrirPausa(page);
  await expect(page.locator('[data-pace-break-prop]'), 'GUARD: la propuesta no es el agua').toContainText('Hidrátate');
  const total = await botones(page).count();
  expect(total, 'GUARD: el menú no tiene botones').toBeGreaterThan(3);

  for (let i = 0; i < total; i++) {
    await abrirPausa(page);
    const nombre = (await botones(page).nth(i).innerText()).trim().replace(/\s+/g, ' ');
    await botones(page).nth(i).click();
    await page.waitForTimeout(300);
    const esperado = await huella(page);
    for (const tecla of ['Enter', 'Space']) {
      await abrirPausa(page);
      await tabulaHasta(page, botones(page).nth(i));
      await page.keyboard.press(tecla);
      await expect.poll(() => huella(page), `${tecla} sobre «${nombre}» no hace lo del botón`).toEqual(esperado);
    }
  }

  /* Con el foco en el diálogo y no en un botón, Intro es la propuesta: un vaso. */
  await abrirPausa(page);
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await huella(page)).vasos, 'Intro fuera de los botones ya no elige la propuesta').toBe(1);
});

test('ningún atajo del menú de pausa responde con Ctrl, Cmd o Alt, ni a mitad de una composición', async ({ page }) => {
  await page.clock.install({ time: alaUna() });
  await irAlArtefacto(page);
  await abrirPausa(page);
  for (const tecla of ['Control+Enter', 'Meta+Enter', 'Alt+Enter', 'Control+b', 'Alt+h', 'Meta+m']) await page.keyboard.press(tecla);
  await page.evaluate(() => {
    for (const key of ['Enter', 'b', 'e', 'm', 'h', 'Escape']) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: key, isComposing: true, bubbles: true }));
    }
    const atendida = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    atendida.preventDefault();
    window.dispatchEvent(atendida);
  });
  await page.waitForTimeout(300);
  expect(await huella(page), 'un atajo respondió con una tecla modificadora o una composición')
    .toEqual(expect.objectContaining({ vasos: 0, pausa: true, sesion: false }));
});
