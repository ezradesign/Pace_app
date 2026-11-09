/* PACE · E2E · EL SOBRE CON VARIAS COSAS (Ez, 5 nov. 2026: 1C y 3A)
 * ==================================================================
 * Ez eligió en la página `docs/proposals/sobre-5nov.html` la C: el sobre abre UNA HOJA con todo, lo más
 * nuevo arriba. La carta del lunes se queda en dos líneas con «Abrir la carta» y las novedades de la
 * última versión (3A, escritas a mano en shell/novedades.data.js) se leen en la hoja. Un solo icono, sin
 * contador, y la home no se mueve. Abrir la hoja da por leídas las novedades; la carta, cuando se abre.
 *
 * Contra la 0.190.0 cae entera: el sobre solo sabía abrir la primera cosa sin leer y no había novedades.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const LUNES = new Date(2026, 9, 19, 8, 30);
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const visible = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context, extra, hora) {
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, libre: true }, novedadesVistas: null }, extra || {}));
  await page.clock.install({ time: hora || LUNES });
  await irAlArtefacto(page);
}

function ponerCarta(page) {
  return page.evaluate(() => {
    const barras = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ d, hechas: d < 6 ? 5 : 0, total: d < 6 ? 7 : 0 }));
    const res = { semana: { lunes: '2026-10-19', desde: '2026-10-12', hasta: '2026-10-18' }, dias: 5, carta: true,
                  ayudo: ['move.shoulder.circles'], hechas: 25, total: 35, barras, cambios: [] };
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, {
      carta: { lunes: '2026-10-19', res, vista: null, respuesta: null, hora: null, luego: '2026-10-19' } }) }));
  });
}

const sobreDe = (page) => visible(page, '[data-pace-sobre]');
const filas = (page) => page.locator('[data-pace-sobre-item]');

test('con la carta y las novedades, un icono abre una hoja con las dos, lo más nuevo arriba, y entrar no obliga a nada', async ({ page, context }) => {
  await abrir(page, context);
  await ponerCarta(page);
  const sobre = sobreDe(page);
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'cerrado');
  await expect(sobre).toHaveAccessibleName('El sobre, con cosas sin leer');
  await expect(visible(page, '[data-pace-topbar-icon][data-pace-sobre]')).toHaveCount(1);

  await sobre.click();
  await expect(page.locator('[data-pace-sobre-hoja]')).toBeVisible();
  await expect(filas(page)).toHaveCount(2);
  await expect(filas(page).nth(0)).toHaveAttribute('data-pace-sobre-item', 'novedades');
  await expect(filas(page).nth(0)).toHaveAttribute('data-pace-sobre-item-estado', 'sin-leer');
  await expect(filas(page).nth(0)).toContainText('Si haces la pausa a tu manera, dilo');
  await expect(filas(page).nth(1)).toHaveAttribute('data-pace-sobre-item', 'carta');
  await expect(filas(page).nth(1)).toContainText('25 de 35 pausas hechas');
  /* Sin contador de ninguna clase: ni número ni rojo. */
  await expect(page.locator('[data-pace-sobre-hoja]')).not.toContainText(/\b[0-9]+ (cosas|sin leer)/);

  /* Las novedades quedan leídas; la carta sigue sin leer ni contestar. */
  expect(await page.evaluate(() => getState().novedadesVistas)).toBe('pausa-a-tu-manera');
  expect(await page.evaluate(() => [getState().ritmo.carta.vista, getState().ritmo.carta.respuesta])).toEqual([null, null]);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pace-sobre-hoja]')).toHaveCount(0);
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'cerrado');

  /* Reabierta, las novedades salen leídas y la carta, con su enlace, abre su ventana. */
  await sobre.click();
  await expect(filas(page).nth(0)).toHaveAttribute('data-pace-sobre-item-estado', 'leido');
  await expect(filas(page).nth(1)).toHaveAttribute('data-pace-sobre-item-estado', 'sin-leer');
  await page.locator('[data-pace-sobre-abrir="carta"]').click();
  await expect(page.locator('[data-pace-sobre-hoja]')).toHaveCount(0);
  await expect(page.locator('[data-pace-carta]')).toBeVisible();
});

test('con solo las novedades el icono abre la hoja, y leídas queda abierto', async ({ page, context }) => {
  await abrir(page, context);
  const sobre = sobreDe(page);
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'cerrado');
  await expect(sobre).toHaveAccessibleName('Novedades de PACE, sin leer');
  await sobre.click();
  await expect(filas(page)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(sobre).toHaveAttribute('data-pace-sobre', 'abierto');
  await expect(sobre).toHaveAccessibleName('Novedades de PACE');
});

test('quien empezó con PACE después de la versión no ve novedades de algo que nunca vio; en inglés, las líneas en inglés', async ({ page, context }) => {
  const despues = new Date(2026, 10, 10, 9, 0);
  await abrir(page, context, { firstSeen: new Date(2026, 10, 9).getTime() }, despues);
  await expect(sobreDe(page)).toHaveCount(0);

  await page.evaluate(() => setState({ firstSeen: 1, lang: 'en' }));
  await sobreDe(page).click();
  await expect(filas(page).nth(0)).toContainText('Took your break your own way?');
});

test('abrir la hoja no mueve la home ni pide scroll a 360 px', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 730 });
  await abrir(page, context);
  await ponerCarta(page);
  const medir = () => page.evaluate(() => {
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
    return body ? body.scrollHeight - body.clientHeight : null;
  });
  const antes = await medir();
  await sobreDe(page).click();
  await expect(page.locator('[data-pace-sobre-hoja]')).toBeVisible();
  expect(await medir()).toBe(antes);
  expect(antes, 'la home no pide scroll').toBeLessThanOrEqual(0);
  const hoja = await page.locator('[data-pace-modal-card]').last().evaluate((e) => ({ sobra: e.scrollHeight - e.clientHeight, alto: e.getBoundingClientRect().height }));
  expect(hoja.sobra, 'la hoja cabe sin scroll').toBeLessThanOrEqual(0);
});
