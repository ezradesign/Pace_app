/* PACE · E2E · LA PAUSA ENTERA (14 oct. 2026)
 * ===========================================
 * Ez hizo la pausa larga de las 16:02, «Exhalación 4·6 + Cuello · 15 min», desde la
 * ventana «Tu pausa», y solo le salió Respira. Medido en el index.html de v0.164.0: la
 * ventana, la parada y la barra abrían el PRIMER plato; al acabar Respira volvías a la
 * home, la parada ya contaba como hecha y volver a tocarla abría Respira otra vez: al
 * cuello no se llegaba nunca. Y el aro no contaba la pausa: esperaba el bloque.
 * Ez eligió mirando la app real (A · 2A · 3A, docs/traspaso/archivos/pausa-cuello-14oct/):
 *
 *  · A · seguidos: la ventana nombra los dos; el cierre de Respira dice «Pausa larga ·
 *    1 de 2» y «Seguir con Estira» entra directo en el cuello (sin la ficha previa). La
 *    X vuelve a la home, y la barra y la parada ofrecen el cuello, no Respira.
 *  · 2A · 3A · el aro cuenta la pausa (la corta y la larga) desde que acaba el bloque,
 *    con «Luego, el bloque N de M» y «Empezar ya el bloque N»; a cero vuelve al bloque
 *    sin arrancarlo. La comida no se cuenta.
 *
 * El 14 oct. de 2026 (miércoles) la segunda pausa de la jornada es la larga. Era la del
 * día de Ez, «Exhalación 4·6 + Cuello»; desde las series (Ez, 15 oct.) la Estira de la
 * larga es de pie, «Espalda de pie»: lo comprueba un GUARD antes de nada.
 * TRAMPAS: el bloque se acaba justo a su hora y se espera a la ventana (`terminarBloque`,
 * helpers.js), y las sesiones segundo a segundo (eventos-origen.spec.js); cada pieza del
 * panel existe dos veces: se toma la visible.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, esperarEnPagina, terminarBloque } = require('./helpers');
const { leerContenedor, esperarInit } = require('./eventos.helpers');

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const PERFIL = { profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 } };
const LARGA = ['breathe.exhale.46', 'move.back.standing'];
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context, extra, hora) {
  await sembrar(context, Object.assign({}, PERFIL, extra || {}));
  await page.clock.install({ time: hora });
  await irAlArtefacto(page);
  await esperarInit(page);
  await page.waitForTimeout(300);
}
async function segundos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(1000); await page.waitForTimeout(10); }
}
async function minutos(page, n) {
  for (let i = 0; i < n; i++) { await page.clock.fastForward(60 * 1000); await page.waitForTimeout(40); }
}
async function hastaElCierre(page) {
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && (await done.count()) === 0; s++) await segundos(page, 1);
  expect(await done.count(), 'GUARD: la sesión no llegó al cierre').toBeGreaterThan(0);
}
const sesion = (page) => page.locator('[data-pace-session-root]');
const cta = (page) => vis(page, '[data-pace-cta]');
const corriendo = (page) => page.locator('[data-pace-dial-fit][data-pace-dial-running]');

/* El bloque 2 empieza a su hora y, al acabar, sale la ventana de la pausa larga. */
async function hastaLaLarga(page, context) {
  await abrir(page, context, { ritmo: { dia: JORNADA }, cycle: 1, lastActiveDay: 'Wed Oct 14 2026' }, a('09:50'));
  const guard = await page.evaluate((ids) => {
    const p = ritmoPlan(getState());
    const it = ritmoDetras(p.m, p.m.focos[1]);
    return { larga: !!it.larga, ids: it.platos.map((x) => x.id), desde: p.m.focos[1].desde };
  }, LARGA);
  expect(guard, 'GUARD: la larga del 14 oct. va detrás del bloque 2, que empieza a las 9:50').toEqual({ larga: true, ids: LARGA, desde: 590 });
  await page.getByRole('button', { name: 'Empezar bloque 2', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
}

async function sesionesCompletadas(page, n) {
  await esperarEnPagina(page, async (k) => {
    if (typeof window.eventsWebReadRaw !== 'function') return false;
    const raw = await window.eventsWebReadRaw();
    return !!raw && (JSON.parse(raw).events || []).filter((e) => e.type === 'session.completed').length >= k;
  }, n, { timeout: 5000 });
  return ((await leerContenedor(page)).events || []).filter((e) => e.type === 'session.completed');
}

/* ------------------------------------------------------------------ A · seguidos */
test('la pausa larga nombra sus dos platos y los hace seguidos: Respira, «Seguir con Estira» y la Estira de pie', async ({ page, context }) => {
  /* dos sesiones enteras (6 + 4 min de reloj) segundo a segundo: con dos navegadores
     a la vez no caben en los 60 s de siempre */
  test.setTimeout(180_000);
  const errores = capturarErrores(page);
  await hastaLaLarga(page, context);
  const ventana = overlaySuperior(page).locator('[data-pace-break-ritmo]');
  await expect(ventana, 'la ventana nombra los dos platos').toContainText('Exhalación 4·6 + Espalda de pie');
  await expect(ventana).toContainText('Respira y Estira');
  await expect(ventana.locator('.pace-lib-ctx b'), 'con los minutos de la parada, no los de Respira').toHaveText('15');

  await page.getByRole('button', { name: 'Hacer la pausa', exact: true }).click();
  await expect(sesion(page)).toHaveCount(1);
  await hastaElCierre(page);
  await expect(sesion(page)).toContainText('Exhalación 4·6');
  await expect(sesion(page), 'el cierre dice que la pausa sigue').toContainText('Pausa larga · 1 de 2');
  await sesion(page).getByRole('button', { name: 'Seguir con Estira', exact: true }).click();

  /* directo a la Estira: sin volver a la home y sin la ficha de antes de empezar */
  await expect(sesion(page)).toHaveCount(1);
  await expect(sesion(page)).toContainText('Espalda de pie');
  await expect(page.locator('[data-pace-modal-backdrop]')).toHaveCount(0);
  await hastaElCierre(page);
  await expect(sesion(page)).not.toContainText('Pausa larga');
  await sesion(page).getByRole('button', { name: 'Volver al inicio', exact: true }).click();
  await expect(sesion(page)).toHaveCount(0);

  const dia = await page.evaluate(() => getState().ritmo.dia);
  expect(dia.platos, 'los dos platos de la parada 2, hechos').toEqual({ 2: LARGA });
  expect(dia.estados).toEqual({ 2: 'hecha' });
  /* la Estira sale por la misma puerta que Respira: la pausa, servida por el menú */
  const ses = await sesionesCompletadas(page, 3);
  expect(ses.slice(1).map((e) => [e.payload.routineId, e.payload.origin, e.payload.fromMenu]))
    .toEqual([[LARGA[0], 'pausa', true], [LARGA[1], 'pausa', true]]);
  expect(errores).toEqual([]);
});

test('salir con la X tras Respira: la barra y la parada ofrecen la Estira, no Respira otra vez', async ({ page, context }) => {
  test.setTimeout(120_000);   /* Respira entera, segundo a segundo */
  /* la pausa larga ABIERTA (dos bloques hechos), a su hora */
  await abrir(page, context, { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 2 }) }, cycle: 2,
    lastActiveDay: 'Wed Oct 14 2026', _historyMigrated: true }, a('10:31'));
  const parada = vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada].pace-rt-ahora');
  await expect(parada, 'GUARD: la parada de ahora es la larga').toContainText('+ Espalda de pie');
  await parada.click();
  await expect(sesion(page)).toContainText('Exhalación 4·6');
  await hastaElCierre(page);
  await expect(sesion(page).getByRole('button', { name: 'Seguir con Estira', exact: true })).toBeVisible();
  await sesion(page).getByRole('button', { name: '× Salir', exact: true }).click();
  await expect(sesion(page), 'la X vuelve a la home').toHaveCount(0);

  await expect(vis(page, '[data-pace-sidebar]'), 'la barra ofrece ya la Estira').toContainText('Espalda de pie');
  await parada.click();
  const ficha = overlaySuperior(page);
  await expect(ficha, 'la parada abre la Estira, no Respira otra vez').toContainText('Espalda de pie');
  await expect(sesion(page)).toHaveCount(0);
});

/* ------------------------------------------------------------------ 2A · 3A · el aro cuenta la pausa */
test('el aro cuenta la pausa desde que acaba el bloque y, a cero, espera el bloque siguiente sin arrancarlo', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await page.setViewportSize({ width: 360, height: 718 });
  await abrir(page, context, { ritmo: { dia: JORNADA } }, a('09:00'));
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  expect(await page.evaluate(() => getState().focusMode), 'la pausa corta, en su modo').toBe('pausa');
  await overlaySuperior(page).getByRole('button', { name: 'Saltar esta pausa', exact: true }).click();
  await expect(corriendo(page), 'el aro cuenta la pausa').toHaveCount(1);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Pausa corta');
  await expect(vis(page, '[data-pace-dial-subtitle]')).toHaveText('Luego, el bloque 2 de 9');
  await expect(cta(page)).toHaveText('Empezar ya el bloque 2');
  await expect(vis(page, '[data-pace-dial-number]')).toHaveText(/^0[45]:\d\d$/);

  await minutos(page, 5);
  await segundos(page, 2);
  expect(await page.evaluate(() => getState().focusMode), 'a cero vuelve al foco').toBe('foco');
  await expect(cta(page)).toHaveText('Empezar bloque 2');
  await expect(corriendo(page), 'sin arrancar el bloque').toHaveCount(0);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  expect(await page.evaluate(() => getState().ritmo.dia.pausa), 'la parada sigue abierta hasta empezar el bloque').toBe(1);
  expect(errores).toEqual([]);
});

test('la pausa sigue al recargar, y «Empezar ya el bloque 2» la corta y arranca el bloque', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { dia: JORNADA } }, a('09:00'));
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  await minutos(page, 2);
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => getState().focusMode)).toBe('pausa');
  await expect(corriendo(page), 'recargar no pierde la pausa').toHaveCount(1);
  await expect(vis(page, '[data-pace-dial-number]'), 'ni lo que lleva').toHaveText(/^0[23]:\d\d$/);

  await cta(page).click();
  await expect(corriendo(page)).toHaveCount(1);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  expect(await page.evaluate(() => [getState().focusMode, getState().ritmo.dia.pausa, getState().ritmo.dia.estados]))
    .toEqual(['foco', null, { 1: 'saltada' }]);
});

test('«Seguir con el bloque 2» de la ventana arranca el bloque aunque el aro cuente la pausa', async ({ page, context }) => {
  await abrir(page, context, { ritmo: { dia: JORNADA } }, a('09:00'));
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  expect(await page.evaluate(() => getState().focusMode)).toBe('pausa');
  await overlaySuperior(page).getByRole('button', { name: 'Seguir con el bloque 2', exact: true }).click();
  await expect(corriendo(page)).toHaveCount(1);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  expect(await page.evaluate(() => getState().focusMode)).toBe('foco');
});

test('la hora de comer no se cuenta: el aro espera el bloque como siempre', async ({ page, context }) => {
  /* el jueves 8 de octubre la comida va detrás del bloque 6 (ritmo-pausa.spec.js) */
  const JUEVES = Object.assign({}, JORNADA, { fecha: '2026-10-08' });
  await abrir(page, context, { cycle: 5, lastActiveDay: 'Thu Oct 08 2026', ritmo: { dia: JUEVES } }, new Date('2026-10-08T13:20:00+02:00'));
  await page.getByRole('button', { name: 'Empezar bloque 6', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
  await terminarBloque(page);
  await expect(overlaySuperior(page)).toContainText('Hora de comer');
  expect(await page.evaluate(() => getState().focusMode)).toBe('foco');
  await expect(corriendo(page)).toHaveCount(0);
});
