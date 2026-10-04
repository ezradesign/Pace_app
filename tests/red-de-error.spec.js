/* PACE · E2E · SI UNA PARTE FALLA, SE CIERRA SOLO ESA PARTE (s198 · v0.132.0)
 * ===========================================================================
 * Decision del usuario mirando `docs/proposals/saneamiento-s198.html`: A2 (una
 * red por superficie, la global como ultimo recurso) y B2 (la copia de rescate,
 * en una fila de «Tus datos» que solo existe si hay rescate).
 *
 * El fallo se PROVOCA DE VERDAD, no se simula: un dato roto en caliente con
 * `setState`, como lo dejaria un fallo de codigo (el saneado de s198 solo actua
 * al CARGAR). Medido en v0.131.0: `weeklyStats: null` + abrir Estadisticas
 * desmontaba la app entera (0 nodos en la raiz); `water: null` tumbaba la home.
 *
 * Calibrado en ROJO contra el `index.html` de v0.131.0. Los errores de consola
 * aqui son ESPERADOS (React los registra al caer): no se asertan vacios.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

const SEMANA = { focusMinutes: [0, 0, 0, 0, 0, 0, 0], breathMinutes: [0, 0, 0, 0, 0, 0, 0], moveMinutes: [0, 0, 0, 0, 0, 0, 0], waterGlasses: [0, 0, 0, 0, 0, 0, 0] };

test('si Estadisticas falla, sale SU aviso y la app sigue: el aro, la barra lateral y un bloque en marcha', async ({ page }) => {
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();

  await page.evaluate(() => window.setState({ weeklyStats: null }));
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();

  const aviso = page.getByRole('dialog').filter({ hasText: 'Esta parte no ha podido abrirse' });
  await expect(aviso, 'Estadisticas cayo y no salio su aviso').toBeVisible();
  await expect(aviso).toContainText('Ritmo');
  await expect(page.locator('[data-pace-dial-number]'), 'la app entera se desmonto con Estadisticas').toBeVisible();
  await expect(page.locator('[data-pace-sidebar]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true }), 'el bloque en marcha se perdio').toBeVisible();

  /* Cerrar cierra Estadisticas; con el dato sano, la siguiente apertura funciona. */
  /* Dos botones se llaman «Cerrar» (la × del dialogo y el del aviso): los dos cierran. */
  await aviso.locator('[data-pace-red="parte"]').getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(page.locator('[data-pace-red]')).toHaveCount(0);
  await page.evaluate((s) => window.setState({ weeklyStats: s }), SEMANA);
  await page.getByRole('button', { name: 'Ver estadísticas' }).click();
  await expect(page.locator('[data-pace-red]'), 'la red no se reinicio: Estadisticas no vuelve a intentarlo').toHaveCount(0);
  await expect(page.locator('[data-pace-modal-card]')).toHaveCount(1);
});

test('una superficie CERRADA que falla calla; si el dato se arregla, abre normal; si no, avisa al abrirla', async ({ page }) => {
  await irAlArtefacto(page);
  const abrirAgua = () => page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'water' } })));
  const agua = { goal: 8, today: 0, lastReset: null };
  /* Hidratate lee `state.water` aunque este cerrado (medido en s198). */
  await page.evaluate(() => window.setState({ water: null }));
  await page.waitForTimeout(300);
  await expect(page.locator('[data-pace-red]'), 'salio un aviso de algo que nadie abrio').toHaveCount(0);
  await expect(page.locator('[data-pace-dial-number]'), 'la app entera cayo por Hidratate cerrado').toBeVisible();

  /* El dato se arregla con la superficie cerrada: al abrirla, la red se reinicia y abre normal. */
  await page.evaluate((w) => window.setState({ water: w }), agua);
  await abrirAgua();
  await expect(page.getByRole('dialog', { name: 'Hidrátate', exact: true }), 'la red no se reinicio al abrir').toBeVisible();
  await expect(page.locator('[data-pace-red]')).toHaveCount(0);
  await page.keyboard.press('Escape');

  /* Y con el dato roto, abrirla si avisa. */
  await page.evaluate(() => window.setState({ water: null }));
  await abrirAgua();
  await expect(page.getByRole('dialog').filter({ hasText: 'Esta parte no ha podido abrirse' })).toContainText('Hidrátate');
});

test('si cae la app entera, la pantalla global: volver a empezar la recupera, y la copia se descarga', async ({ page }) => {
  await irAlArtefacto(page);
  /* `plan` lo lee la propia home: aqui no hay red de superficie que valga. */
  await page.evaluate(() => window.setState({ plan: null }));

  const global = page.locator('[data-pace-red="global"]');
  await expect(global, 'la app cayo entera y no hay pantalla de error: papel en blanco').toBeVisible();
  await expect(global).toContainText('Algo se ha torcido');

  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    global.getByRole('button', { name: 'Descargar una copia de tus datos' }).click(),
  ]);
  const copia = JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
  expect(copia.app).toBe('PACE');
  expect(copia.state && copia.state.firstSeen, 'la copia no lleva el estado').toBe(1);

  /* El dato roto se guardo; al recargar, el saneado de s198 lo repara. */
  const recarga = page.waitForEvent('load');
  await global.getByRole('button', { name: 'Volver a empezar' }).click();
  await recarga;
  await expect(page.locator('[data-pace-dial-number]')).toBeVisible();
  await expect(page.locator('[data-pace-red]')).toHaveCount(0);
});

test('la fila de la copia de rescate solo existe si hay rescate, y lo descarga tal cual', async ({ page }) => {
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await expect(page.locator('[data-pace-aj-rescate]'), 'sin rescate no hay fila').toHaveCount(0);
  await page.keyboard.press('Escape');

  await page.evaluate(() => localStorage.setItem('pace.state.v2.rescate',
    JSON.stringify({ v: 1, savedAt: new Date(2026, 9, 4, 9, 0).getTime(), motivo: 'prueba', raw: '{"roto":' })));
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  const fila = page.locator('[data-pace-aj-rescate]');
  await expect(fila, 'hay rescate y no hay fila en «Tus datos»').toBeVisible();
  await expect(fila).toContainText('Descargar la copia de rescate');
  await expect(fila).toContainText('4 oct');

  const [descarga] = await Promise.all([page.waitForEvent('download'), fila.click()]);
  expect(descarga.suggestedFilename()).toMatch(/^pace-rescate-\d{8}\.json$/);
  const r = JSON.parse(require('fs').readFileSync(await descarga.path(), 'utf8'));
  expect(r.kind).toBe('rescate');
  expect(r.rescate.raw).toBe('{"roto":');
});
