/* PACE · E2E · el Foco que no se pierde (caza del 10 oct., foco-1, -2 y -3; Ez eligió el 12 oct.)
 * ==============================================================================================
 * Medido en v0.155.0:
 *   foco-1  tocar «35» con un bloque de 25 a medias lo tiraba sin preguntar (35:00, «Empezar foco»).
 *   foco-2  un bloque en pausa volvía a 25:00 al recargar (y con «Hay una versión nueva», y cuando
 *           Android cierra la app en el fondo).
 *   foco-3  un bloque que terminaba con la página cerrada no contaba, aunque con la pestaña abierta
 *           sí contaba y Android avisaba «Foco completado».
 * Ez eligió la opción A en las tres (página `docs/traspaso/archivos/caza-foco-10oct/`): preguntar
 * antes, volver en pausa el mismo día y contar si terminó hoy. Los CONTROL pasan también en v0.155.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');
const { leerContenedor } = require('./eventos.helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const numero = (p) => p.locator('[data-pace-dial-number]');
const cta = (p) => p.locator('[data-pace-cta]');
const pregunta = (p) => p.locator('[data-pace-modal-backdrop]').filter({ has: p.locator('[data-pace-cambio-minutos]') });
const focosContados = async (page) => {
  const c = await leerContenedor(page);
  return ((c && c.events) || []).filter(e => e.type === 'session.completed' && e.payload && e.payload.module === 'focus').length;
};

async function abrirConReloj(page, context, hora) {
  await sembrar(context, { soundOn: false });
  await context.clock.install({ time: hora || ARRANQUE });
  await irAlArtefacto(page);
  await context.clock.pauseAt(new Date((hora || ARRANQUE).getTime() + 60 * 1000));
}

test('foco-1 · otros minutos con un bloque empezado preguntan antes, y «Seguir con el Foco» no toca nada', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await cta(page).click();
  await context.clock.fastForward(20 * 60 * 1000);
  await context.clock.runFor(1000);
  const antes = await numero(page).textContent();

  await page.getByRole('button', { name: '35', exact: true }).click();
  await expect(pregunta(page)).toBeVisible();
  await expect(pregunta(page)).toContainText('¿Cambiar a un bloque de 35 min?');
  /* Tapa toda la home, como las demás ventanas: dentro del aro, recortado al horizonte, su fondo
     se quedaba arriba y las actividades salían por encima. */
  const respira = await page.getByRole('button', { name: /Respira/ }).filter({ visible: true }).first().boundingBox();
  expect(await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest('[data-pace-modal-backdrop]'),
    [respira.x + respira.width / 2, respira.y + respira.height / 2]), 'las actividades salen por encima de la pregunta').toBe(true);
  await pregunta(page).getByRole('button', { name: 'Seguir con el Foco' }).click();
  await expect(cta(page)).toHaveText('Pausar');
  expect(await numero(page).textContent(), 'seguir cambió el bloque').toBe(antes);

  /* En pausa también pregunta; y «Cambiar» hace lo de siempre. */
  await cta(page).click();
  await expect(cta(page)).toHaveText('Continuar');
  await page.getByRole('button', { name: '35', exact: true }).click();
  await pregunta(page).getByRole('button', { name: 'Cambiar', exact: true }).click();
  await expect(numero(page)).toHaveText('35:00');
  await expect(cta(page)).toHaveText('Empezar foco');
});

test('CONTROL · sin un bloque empezado, los minutos cambian sin preguntar', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await page.getByRole('button', { name: '35', exact: true }).click();
  await expect(numero(page)).toHaveText('35:00');
  await expect(pregunta(page)).toHaveCount(0);
});

test('foco-2 · el bloque en pausa vuelve en pausa al recargar, y al seguir termina a su hora y cuenta', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await cta(page).click();
  await context.clock.fastForward(12 * 60 * 1000);
  await context.clock.runFor(1000);
  await cta(page).click();
  await expect(cta(page)).toHaveText('Continuar');
  const enPausa = await numero(page).textContent();

  await page.reload();
  await numero(page).waitFor({ state: 'visible' });
  await expect(cta(page)).toHaveText('Continuar');
  await expect(numero(page)).toHaveText(enPausa);
  await expect(page.getByRole('button', { name: 'Reiniciar bloque' })).toBeVisible();

  /* Media hora en pausa no la termina; seguir la termina cuando toca, ni antes ni dos veces. */
  await context.clock.fastForward(30 * 60 * 1000);
  await expect(numero(page)).toHaveText(enPausa);
  await cta(page).click();
  const [m, s] = enPausa.split(':').map(Number);
  await context.clock.fastForward((m * 60 + s - 3) * 1000);
  expect(await page.evaluate(() => getState().cycle || 0), 'terminó antes de tiempo').toBe(0);
  await context.clock.fastForward(5000);
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  expect(await page.evaluate(() => getState().totalFocusMin)).toBe(25);
});

test('CONTROL · un bloque que se quedó en pausa ayer no vuelve', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await page.evaluate(() => {
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    localStorage.setItem('pace.timer.v1', JSON.stringify({ mode: 'foco', minutes: 25, id: 'ayer', pausaMs: 600000, dia: ayer.toDateString() }));
  });
  await page.reload();
  await numero(page).waitFor({ state: 'visible' });
  await expect(numero(page)).toHaveText('25:00');
  await expect(cta(page)).toHaveText('Empezar foco');
});

test('foco-3 · un bloque que terminó hoy con PACE cerrado cuenta al volver, y se abre la pausa', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await cta(page).click();
  await context.clock.fastForward(5 * 60 * 1000);
  await page.goto('about:blank');
  await context.clock.fastForward(30 * 60 * 1000);
  await page.goto(RUTA_ARTEFACTO);
  await numero(page).waitFor({ state: 'visible' });
  await context.clock.runFor(2000);

  await expect(page.locator('[data-pace-modal-backdrop]').getByText('Pausa bien hecha', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  expect(await page.evaluate(() => getState().totalFocusMin)).toBe(25);
  await expect.poll(() => focosContados(page)).toBe(1);

  /* Y una recarga después no lo cuenta otra vez. */
  await page.reload();
  await numero(page).waitFor({ state: 'visible' });
  await context.clock.runFor(2000);
  expect(await page.evaluate(() => getState().cycle)).toBe(1);
});

/* El bloque de arriba se cuenta al montar la home, antes de que el arranque termine de abrir el
   registro de eventos, y su `session.completed` se perdía sin aviso: con la suite cargada caía uno
   de cada pocos pases, y en un móvil lento pasaría igual. Aquí el registro se abre a propósito
   DESPUÉS de contar (su candado espera a la prueba), así que cae siempre sin el arreglo de
   `paceEmitirEvento`, que espera a esa apertura. */
test('foco-3 · aunque el registro de eventos tarde en abrirse, el bloque contado al volver queda apuntado', async ({ page, context }) => {
  await abrirConReloj(page, context);
  await cta(page).click();
  await context.clock.fastForward(5 * 60 * 1000);
  await page.goto('about:blank');
  await context.clock.fastForward(30 * 60 * 1000);
  await context.addInitScript(() => {
    if (!navigator.locks) return;
    const pedir = navigator.locks.request.bind(navigator.locks);
    let soltar;
    const suelto = new Promise((r) => { soltar = r; });
    window.__paceSoltarRegistro = soltar;
    navigator.locks.request = function (nombre) {
      const args = arguments;
      return nombre === 'pace.events.writer.v1' ? suelto.then(() => pedir.apply(null, args)) : pedir.apply(null, args);
    };
  });
  await page.goto(RUTA_ARTEFACTO);
  await numero(page).waitFor({ state: 'visible' });
  await context.clock.runFor(2000);
  await expect.poll(() => page.evaluate(() => getState().cycle)).toBe(1);
  expect(await page.evaluate(() => window.paceEventsCanWrite()), 'el registro ya estaba abierto: la prueba no mide nada').toBe(false);

  await page.evaluate(() => window.__paceSoltarRegistro());
  await expect.poll(() => focosContados(page)).toBe(1);
});

test('CONTROL · un bloque que terminó ayer con PACE cerrado no cuenta hoy', async ({ page, context }) => {
  const NOCHE = new Date('2026-10-06T23:00:00+02:00');   // termina a las 23:26, ayer
  await abrirConReloj(page, context, NOCHE);
  await cta(page).click();
  await context.clock.fastForward(60 * 1000);
  await page.goto('about:blank');
  await context.clock.fastForward(8 * 60 * 60 * 1000);
  await page.goto(RUTA_ARTEFACTO);
  await numero(page).waitFor({ state: 'visible' });
  await context.clock.runFor(2000);
  await expect(numero(page)).toHaveText('25:00');
  expect(await page.evaluate(() => getState().cycle || 0)).toBe(0);
});
