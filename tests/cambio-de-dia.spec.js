/* PACE · E2E · EL DÍA CAMBIA AUNQUE NO TOQUES NADA (respira-3 · v0.146.x)
 * ======================================================================
 * El cambio de día (`rolloverIfNeeded`) solo corría al arrancar y dentro de las
 * acciones que suman (un vaso, una sesión, el Foco). Con la pestaña o la PWA
 * abiertas toda la noche, o el portátil cerrado y abierto por la mañana, la
 * barra lateral decía «Agua 5 de 8» y Hidrátate enseñaba los cinco vasos de
 * ayer hasta que se sumaba algo, y entonces saltaba de 5/8 a 1/8.
 *
 * Los cuatro caminos por los que llega la mañana, cada uno con su prueba:
 *  · el portátil se cierra y se abre: el reloj salta y los temporizadores
 *    vencidos corren UNA vez (`fastForward`);
 *  · la pestaña pasa la noche de fondo: oculta no escribe nada (llevaría una
 *    copia vieja del estado) y al volver al frente cambia el día enseguida;
 *  · la medianoche pasa con un Foco en marcha: el bloque sigue y sus minutos
 *    van al día en que termina, como antes;
 *  · y el CONTROL: un día que no cambia no escribe nada.
 * El huso es el de playwright.config.js (Europe/Madrid). Calibrado en ROJO
 * contra el `index.html` de v0.145.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NOCHE = new Date('2026-10-07T23:50:00+02:00');   // miércoles
const MANANA = new Date('2026-10-08T08:20:00+02:00');  // jueves

/* `lastActiveDay` y las guardas de migración no son opcionales al sembrar agua:
   sin ellos `loadState` archiva o recalcula la semana (fila de s180 en
   DECISIONES_TECNICAS_VIGENTES.md). El formato es el que escribe la app. */
const AYER_ABIERTA = {
  sidebarCollapsed: false,
  lastActiveDay: 'Wed Oct 07 2026',
  water: { goal: 8, today: 0, lastReset: 'Wed Oct 07 2026' },
  _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true,
  _historyRecalculated_v0_28_8: true,
};

function celdaAgua(page) {
  return page.locator('[data-pace-sidebar] [data-pace-hoy-celda][data-modulo="water"]');
}

/* A las 23:50 del miércoles se beben cinco vasos desde la barra lateral. */
async function cincoVasosDeNoche(page, context) {
  await sembrar(context, AYER_ABIERTA);
  await page.clock.install({ time: NOCHE });
  await irAlArtefacto(page);
  for (let i = 0; i < 5; i++) await celdaAgua(page).click();
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(5);
  await expect(celdaAgua(page)).toHaveAttribute('data-cero', '0');
}

/* Lo que tiene que verse el jueves sin haber tocado nada. */
async function esJuevesSinVasos(page, plazo) {
  const opciones = plazo ? { timeout: plazo } : undefined;
  await expect(celdaAgua(page), 'la barra lateral sigue con los vasos de ayer').toHaveAttribute('data-cero', '1', opciones);
  await expect(page.locator('[data-pace-sidebar]').getByText('jue 8 oct', { exact: true })).toBeVisible();
  const s = await page.evaluate(() => {
    const st = getState();
    return { hoy: st.water.today, dia: st.lastActiveDay, ayer: (st.history.days['2026-10-07'] || {}).waterGlasses };
  });
  expect(s).toEqual({ hoy: 0, dia: 'Thu Oct 08 2026', ayer: 5 });
}

/* Cuenta las escrituras de `pace.state.v2` a partir de ahora. */
async function contarEscrituras(page) {
  await page.evaluate(() => {
    window.__escriturasEstado = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'pace.state.v2') window.__escriturasEstado++;
      return original.call(this, k, v);
    };
  });
}

/* La pestaña se oculta o vuelve al frente: cambia lo que lee la página y avisa como el navegador. */
async function ponerVisibilidad(page, valor) {
  await page.evaluate((v) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, valor);
}

/* El número grande de Hidrátate, «N / 8». */
async function contadorHidratate(page) {
  await page.getByRole('button', { name: /Hidrátate/ }).first().click();
  const modal = page.locator('[data-pace-modal-backdrop]').last();
  await expect(modal.getByRole('button', { name: /Un vaso más/ })).toBeVisible();
  return modal.evaluate(m => {
    const el = [...m.querySelectorAll('div')].find(d => /^\d+ \/ \d+$/.test(d.textContent.trim()));
    return el ? el.textContent.trim() : null;
  });
}

test('el portátil se cierra a las 23:50 y se abre a las 08:20: el agua de hoy está a cero sin tocar nada', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await cincoVasosDeNoche(page, context);

  await page.clock.fastForward(MANANA.getTime() - NOCHE.getTime());

  await esJuevesSinVasos(page);
  expect(await contadorHidratate(page)).toBe('0 / 8');
  /* Y el primer vaso del día es el primero, no el sexto ni un salto de 5 a 1. */
  await page.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: /Un vaso más/ }).click();
  await expect.poll(() => page.evaluate(() => getState().water.today)).toBe(1);
  expect(errores).toEqual([]);
});

test('la pestaña pasa la noche de fondo: oculta no escribe nada, y al volver al frente cambia el día', async ({ page, context }) => {
  await cincoVasosDeNoche(page, context);
  await contarEscrituras(page);

  /* Oculta, una pestaña de fondo lleva la copia del estado de cuando se abrió: si relevara el
     día ella sola escribiría esa copia encima de lo que se hizo en otra. El temporizador corre
     (lo dispara el salto) y no debe tocar nada. */
  await ponerVisibilidad(page, 'hidden');
  await page.clock.fastForward(MANANA.getTime() - NOCHE.getTime());
  expect(await page.evaluate(() => ({ escrituras: window.__escriturasEstado, dia: getState().lastActiveDay })))
    .toEqual({ escrituras: 0, dia: 'Wed Oct 07 2026' });

  /* Plazo corto a propósito: si esto lo arreglara el temporizador y no la vuelta de la
     pestaña, tardaría un minuto. */
  await ponerVisibilidad(page, 'visible');
  await esJuevesSinVasos(page, 2000);
});

test('la medianoche pasa con un Foco en marcha: el bloque sigue y sus minutos van al jueves', async ({ page, context }) => {
  await cincoVasosDeNoche(page, context);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();

  /* 00:05: ya es jueves y el bloque sigue contando. */
  await page.clock.fastForward(15 * 60 * 1000);
  await expect(celdaAgua(page)).toHaveAttribute('data-cero', '1');
  await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();

  /* 00:15: termina, abre la pausa y cuenta en el jueves, como contaba antes. */
  await page.clock.fastForward(10 * 60 * 1000);
  await expect(page.locator('[data-pace-modal-backdrop]').last().getByText('Pausa bien hecha', { exact: true })).toBeVisible();
  const s = await page.evaluate(() => {
    const st = getState();
    return { jueves: st.weeklyStats.focusMinutes[3], miercoles: st.weeklyStats.focusMinutes[2], ciclo: st.cycle, agua: st.water.today };
  });
  expect(s).toEqual({ jueves: 25, miercoles: 0, ciclo: 1, agua: 0 });
});

test('CONTROL: si el día no cambia, volver a la pestaña o dejar pasar los minutos no escribe nada', async ({ page, context }) => {
  await sembrar(context, Object.assign({}, AYER_ABIERTA, { water: { goal: 8, today: 3, lastReset: 'Wed Oct 07 2026' } }));
  await page.clock.install({ time: new Date('2026-10-07T10:00:00+02:00') });
  await irAlArtefacto(page);
  await contarEscrituras(page);

  await page.clock.fastForward(10 * 60 * 1000);
  await ponerVisibilidad(page, 'hidden');
  await ponerVisibilidad(page, 'visible');
  await page.clock.fastForward(10 * 60 * 1000);

  expect(await page.evaluate(() => window.__escriturasEstado), 'el estado se reescribió sin haber cambiado el día').toBe(0);
  await expect(celdaAgua(page)).toHaveAttribute('data-cero', '0');
});
