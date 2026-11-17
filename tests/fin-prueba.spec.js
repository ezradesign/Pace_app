/* PACE · E2E · LA NOTA DEL FIN DE LA SEMANA DE PRUEBA, EN TRES SITIOS Y UNA VEZ (Ez, 2 A+B+C del 16 nov. 2026)
 * ======================================================================================================
 * Auditoría fable-9nov, fila 18: el día que acababa la semana de prueba de v1, lo de pago aparecía con
 * candado sin que nada lo dijera. Ez eligió las tres de la maqueta a la vez: una hoja al abrir PACE (B),
 * el sobre de arriba (A) y una línea en la biblioteca (C), sin repetirse (`pasoV1.finVisto`).
 *
 * QUÉ DEFIENDE:
 *  · al abrir PACE con la semana acabada, la hoja sale con lo que se queda, y una sola vez: al volver
 *    no sale, el sobre la guarda leída y la biblioteca no repite la línea;
 *  · si la biblioteca se abre antes de que salga la hoja, la línea sale allí y la hoja ya no;
 *  · si se lee primero en el sobre, ni la hoja ni la línea vuelven;
 *  · con la semana aún en marcha, nada de esto; y el sobre en inglés.
 * Contra la 0.207.0 caen las cuatro primeras: no hay nota en ningún sitio.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, MEDIODIA, CLAVE_ESTADO } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const DIA = 24 * 3600 * 1000;
const AHORA = MEDIODIA.getTime();
const HOJA = '[data-pace-premium-hoja="fin"]';
const SUYAS = ['breathe.rounds.full', 'extra.hang.bar'];
const USABA = {
  totalFocusMin: 300, moveSessionsTotal: 2,
  routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.breathe.rounds.full': 1 },
};
/* Su semana acabó ayer a esta hora (una sola lectura del reloj, por el tope de siete días). */
const ACABADA = Object.assign({}, USABA, { pasoV1: { at: AHORA - 8 * DIA, previo: true, hasta: AHORA - DIA, rutinas: SUYAS, avisado: true } });

async function abrirPace(page, context, estado, { parado } = {}) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
  await page.clock.install({ time: MEDIODIA });
  /* Parado, la hoja no se mira hasta que la prueba lo diga (runFor): así se puede llegar antes a la
     biblioteca o al sobre sin carreras. */
  if (parado) await page.clock.pauseAt(AHORA + 200);
  await sembrar(context, estado);
  await irAlArtefacto(page);
}

const paso = (page) => page.evaluate((c) => JSON.parse(localStorage.getItem(c)).pasoV1, CLAVE_ESTADO);
const sobre = (page) => page.locator('[data-pace-sobre]').filter({ visible: true }).first();

async function abrirEstira(page) {
  await page.locator('[data-pace-activitybar-chip]', { hasText: 'Estira' }).filter({ visible: true }).first().click();
  await expect(page.locator('.pace-lib-sub').filter({ visible: true })).toBeVisible();
}

test('B · la hoja sale al abrir, una vez; luego el sobre la guarda leída y la biblioteca no la repite', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrirPace(page, context, ACABADA);
  await page.clock.runFor(2500);
  const hoja = page.locator(HOJA);
  await expect(hoja).toBeVisible();
  await expect(hoja.locator('h2')).toHaveText('Acabó tu semana de prueba');
  await expect(hoja).toContainText('Desde hoy, lo que lleva candado es de PACE completo.');
  await expect(hoja.locator('[data-pace-fin-rutina]')).toHaveCount(2);
  await expect(hoja.locator('[data-pace-fin-rutina="extra.hang.bar"]')).toContainText('Mueve');
  expect(typeof (await paso(page)).finVisto, 'la hoja no apuntó que se vio').toBe('number');
  await hoja.getByRole('button', { name: 'Entendido' }).click();
  await expect(hoja).toHaveCount(0);

  /* El sobre la tiene, ya leída. */
  await expect(sobre(page)).toHaveAttribute('data-pace-sobre', 'abierto');
  await sobre(page).click();
  await expect(page.locator('[data-pace-sobre-item="finPrueba"]')).toHaveAttribute('data-pace-sobre-item-estado', 'leido');
  await page.keyboard.press('Escape');

  /* La biblioteca no la repite. */
  await abrirEstira(page);
  await expect(page.locator('[data-pace-fin-linea]')).toHaveCount(0);
  await page.keyboard.press('Escape');

  /* Y al volver a abrir PACE, la hoja no sale otra vez. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.clock.runFor(2500);
  await expect(page.locator(HOJA)).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('C · con la biblioteca abierta antes, la línea sale allí y la hoja ya no', async ({ page, context }) => {
  await abrirPace(page, context, ACABADA, { parado: true });
  await abrirEstira(page);
  const linea = page.locator('[data-pace-fin-linea]');
  await expect(linea).toBeVisible();
  await expect(linea).toContainText('Tu semana de prueba acabó el');
  await expect(linea).toContainText('lo que lleva candado ya es de PACE completo.');
  /* Se queda mientras la biblioteca sigue abierta, aunque ya esté apuntada como vista. */
  await page.clock.runFor(2500);
  await expect(linea).toBeVisible();
  await expect(page.locator(HOJA)).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.clock.runFor(61 * 1000);
  await expect(page.locator(HOJA), 'la hoja salió después de verla en la biblioteca').toHaveCount(0);
  await abrirEstira(page);
  await expect(page.locator('[data-pace-fin-linea]'), 'la línea se repite').toHaveCount(0);
});

test('A · leída primero en el sobre, ni la hoja ni la línea vuelven', async ({ page, context }) => {
  await abrirPace(page, context, ACABADA, { parado: true });
  await expect(sobre(page)).toHaveAttribute('data-pace-sobre', 'cerrado');
  await sobre(page).click();
  const item = page.locator('[data-pace-sobre-item="finPrueba"]');
  await expect(item).toContainText('Acabó tu semana de prueba');
  await expect(item).toContainText('Lo gratis sigue gratis.');
  await expect(item).toContainText('Se quedan tuyas para siempre «Respiración en rondas» y «Colgarse», porque ya las hiciste.');
  await expect(item.locator('[data-pace-sobre-abrir="finPrueba"]')).toContainText('Ver PACE completo');
  await page.keyboard.press('Escape');
  await page.clock.runFor(2500);
  await expect(page.locator(HOJA)).toHaveCount(0);
  await abrirEstira(page);
  await expect(page.locator('[data-pace-fin-linea]')).toHaveCount(0);
});

test('la línea de la biblioteca lleva a PACE completo', async ({ page, context }) => {
  await abrirPace(page, context, ACABADA, { parado: true });
  await abrirEstira(page);
  await page.locator('[data-pace-fin-ver]').click();
  await expect(page.locator('[data-pace-premium-hoja="invita"]')).toBeVisible();
});

test('con la semana aún en marcha, ni hoja ni sobre ni línea', async ({ page, context }) => {
  const enPrueba = Object.assign({}, USABA, { pasoV1: { at: AHORA - 2 * DIA, previo: true, hasta: AHORA + 5 * DIA, rutinas: SUYAS, avisado: true } });
  await abrirPace(page, context, enPrueba);
  await page.clock.runFor(2500);
  await expect(page.locator(HOJA)).toHaveCount(0);
  await expect(page.locator('[data-pace-sobre]')).toHaveCount(0);
  await abrirEstira(page);
  await expect(page.locator('[data-pace-fin-linea]')).toHaveCount(0);
});

test('en inglés, el sobre con sus comillas y su «and»', async ({ page, context }) => {
  await abrirPace(page, context, Object.assign({ lang: 'en' }, ACABADA), { parado: true });
  await sobre(page).click();
  const item = page.locator('[data-pace-sobre-item="finPrueba"]');
  await expect(item).toContainText('Your trial week has ended');
  await expect(item).toContainText('“Full Round Breathing” and “Hanging” stay yours for good, because you have already done them.');
});
