/* PACE · E2E · EL ARO COMO PASO ACTUAL DE LA JORNADA (Ez, 5 nov. 2026: 1A y 2B)
 * ============================================================================
 * Sobre docs/proposals/jornada-paso-actual.html. Una jornada, un botón principal y un
 * siguiente paso a la vista:
 *
 *  · En la pausa, «Hacer la pausa» es el botón relleno y «Empezar ya el bloque 2» baja a
 *    enlace. Con el plato hecho no hay nada que proponer y vuelve a lo de antes.
 *  · «Pausar foco» y «Reanudar foco» dentro de la jornada; por libre, lo de siempre.
 *  · «Después: …» en el escritorio; en el móvil lo dice la fila «Luego».
 *  · «Pausa terminada» solo cuando acabó el tiempo de una pausa, nunca con la comida.
 *  · La tarjeta sin jornada, sin subtítulo: el aro crece hasta su tamaño con el día en marcha.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+02:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const cta = (page) => vis(page, '[data-pace-cta]');
/* Relleno es el verde de los botones principales; el contorno también lleva fondo, de papel. */
const relleno = (loc) => loc.evaluate((e) => {
  const m = document.createElement('i');
  m.style.background = 'var(--focus-cta)';
  document.body.appendChild(m);
  const verde = getComputedStyle(m).backgroundColor;
  m.remove();
  return getComputedStyle(e).backgroundColor === verde;
});

async function abrir(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { dia: JORNADA } }, extra || {}));
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
}
async function empezar(page) {
  await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(250);
}
async function hastaLaPausa(page, context) {
  await abrir(page, context);
  await empezar(page);
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Pausa corta');
}

test('en la pausa, el botón principal es hacerla y el bloque siguiente baja a enlace', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await hastaLaPausa(page, context);
  await expect(cta(page)).toHaveText('Hacer la pausa');
  expect(await relleno(cta(page)), 'el botón va relleno aunque el reloj corra').toBe(true);
  await expect(vis(page, '[data-pace-aro-seguir]')).toHaveText('Empezar ya el bloque 2');

  await cta(page).click();
  await expect(overlaySuperior(page), 'entra en el plato que toca, por su vista previa').toContainText('Antes de empezar');
  expect(errores).toEqual([]);
});

test('el enlace corta la pausa y arranca el bloque siguiente', async ({ page, context }) => {
  await hastaLaPausa(page, context);
  await vis(page, '[data-pace-aro-seguir]').click();
  await page.waitForTimeout(300);
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  await expect(cta(page)).toHaveText('Pausar foco');
});

test('con el plato hecho no propone repetirlo: el botón vuelve a empezar el bloque', async ({ page, context }) => {
  await hastaLaPausa(page, context);
  await page.evaluate(() => ritmoPausaHecha(ritmoPausaAbierta().platos[0].id));
  await expect(cta(page)).toHaveText('Empezar ya el bloque 2');
  expect(await relleno(cta(page)), 'contorno, como todo botón con el reloj en marcha').toBe(false);
  await expect(vis(page, '[data-pace-aro-seguir]')).toHaveCount(0);
});

test('«Pausa terminada» cuando acaba el tiempo, y no con la comida ni pasando a Foco a mano', async ({ page, context }) => {
  await hastaLaPausa(page, context);
  const terminada = () => page.evaluate(() => aroPausaTerminada(getState()));
  expect(await terminada(), 'con la pausa corriendo').toBe(false);
  await page.evaluate(() => setState({ focusMode: 'foco' }));
  expect(await terminada(), 'en Foco a mano, la pausa sigue corriendo').toBe(false);
  await page.evaluate(() => setState({ focusMode: 'pausa' }));
  for (let i = 0; i < 6; i++) { await page.clock.fastForward(60 * 1000); await page.waitForTimeout(40); }
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Bloque 2 de 9');
  await expect(vis(page, '[data-pace-dial-subtitle]')).toHaveText('Pausa terminada');
  await expect(cta(page)).toHaveText('Empezar bloque 2');
  await expect(cta(page).page().locator('[data-pace-dial-fit][data-pace-dial-running]'), 'sin arrancar el bloque').toHaveCount(0);

  const comida = await page.evaluate(() => {
    const original = window.ritmoPausaAbierta;
    window.ritmoPausaAbierta = () => ({ it: { tipo: 'comida' }, platos: [], hechos: [] });
    const r = aroPausaTerminada(getState());
    window.ritmoPausaAbierta = original;
    return r;
  });
  expect(comida, 'la comida no cuenta tiempo').toBe(false);
});

test('dentro de la jornada el botón nombra el foco; por libre sigue como estaba', async ({ page, context }) => {
  await abrir(page, context);
  await empezar(page);
  await expect(cta(page)).toHaveText('Pausar foco');
  await cta(page).click();
  await page.waitForTimeout(150);
  await expect(cta(page)).toHaveText('Reanudar foco');
});

test('por libre, «Pausar» y «Continuar» siguen como estaban', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await cta(page).click();
  await page.waitForTimeout(150);
  await expect(cta(page)).toHaveText('Pausar');
  await cta(page).click();
  await page.waitForTimeout(150);
  await expect(cta(page)).toHaveText('Continuar');
});

test('«Después» sale en el escritorio y no en el móvil, donde ya está la fila «Luego»', async ({ page, context }) => {
  await abrir(page, context);
  const plan = await page.evaluate(() => aroDespues(getState(), (k) => k, (k) => k));
  expect(plan, 'GUARD: el plan tiene algo detrás del bloque').toBeTruthy();
  await expect(vis(page, '[data-pace-aro-despues]')).toHaveText(/^Después: (Mueve|Estira|Respira) · \d+ min$/);
  await empezar(page);
  await expect(vis(page, '[data-pace-aro-despues]'), 'sigue con el foco en marcha').toHaveCount(1);
  await page.setViewportSize({ width: 360, height: 730 });
  await page.waitForTimeout(250);
  await expect(vis(page, '[data-pace-aro-despues]')).toHaveCount(0);
});

test('la tarjeta sin jornada no lleva subtítulo y le deja alto al aro', async ({ page, context }) => {
  await page.setViewportSize({ width: 1917, height: 857 });
  await sembrar(context, { ritmo: {} });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(500);
  await expect(page.locator('[data-pace-ritmo-tarjeta]').filter({ visible: true })).not.toContainText('El tiempo incluye las pausas');
  const aro = await page.evaluate(() => Math.round(document.querySelector('[data-pace-dial-fit]').getBoundingClientRect().width));
  expect(aro, 'a 1917×857 medía 391').toBeGreaterThan(440);
  expect(await page.evaluate(() => { const b = document.querySelector('[data-pace-home-body]'); return b.scrollHeight - b.clientHeight; })).toBeLessThanOrEqual(1);
});

test('con la jornada preparada, sin la frase de ayuda, el aro también crece', async ({ page, context }) => {
  await page.setViewportSize({ width: 1917, height: 857 });
  await abrir(page, context);
  await page.waitForTimeout(500);
  await expect(vis(page, '[data-pace-ritmo-panel]')).not.toContainText('Cada bloque es un pomodoro');
  const aro = await page.evaluate(() => Math.round(document.querySelector('[data-pace-dial-fit]').getBoundingClientRect().width));
  expect(aro, 'con la frase medía 392').toBeGreaterThan(410);
});

test('ni un píxel de scroll con la jornada preparada a 1280×800: en Windows 1 px ya saca la barra', async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await abrir(page, context);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => { const b = document.querySelector('[data-pace-home-body]'); return b.scrollHeight - b.clientHeight; })).toBe(0);
});

test('la tarjeta del móvil dice qué hace el botón, en los dos idiomas', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await sembrar(context, { ritmo: {}, sidebarCollapsed: true });
  await page.clock.install({ time: a('09:00') });
  await irAlArtefacto(page);
  const boton = vis(page, '[data-pace-ritmo-comienza]');
  await expect(boton).toHaveText('Preparar jornada');
  await page.evaluate(() => setState({ lang: 'en' }));
  await expect(boton).toHaveText('Plan my day');
  await page.waitForTimeout(300);
  const fuera = await boton.evaluate((b) => {
    const c = b.closest('[data-pace-spc-card]').getBoundingClientRect();
    return b.getBoundingClientRect().right > c.right;
  });
  expect(fuera, 'el botón cabe en la tarjeta').toBe(false);
});

/* PASADA LA SALIDA, EL DÍA SE CIERRA (Ez, 1A del 7 nov. 2026, del recorrido del 6 nov.). Quien
   dejaba la jornada en la pausa de las 9:45 y volvía a las 17:40 (salida a las 17:00) leía
   «Bloque 2 de 9 · Hasta las 17:00» y «Tu pausa · Ahora…», y al pulsar empezaba un bloque hasta las
   18:30. Ahora el aro dice «Tu jornada ya terminó» con lo hecho, la tarjeta «Jornada cerrada», y
   quien quiera sigue por libre: con la página abierta (a pasos de 5 min, sin gesto) y al recargar. */
const hastaLas = async (page, hhmm) => {
  for (let i = 0; i < 200 && await page.evaluate(() => Date.now()) < a(hhmm).getTime(); i++) {
    await page.clock.fastForward(Math.min(5 * 60 * 1000, a(hhmm).getTime() - await page.evaluate(() => Date.now())));
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(300);
};
async function cerrada(page, porque) {
  await expect(vis(page, '[data-pace-dial-label]'), porque).toHaveText('Tu jornada ya terminó');
  await expect(vis(page, '[data-pace-dial-hasta]')).toHaveText('45 min de foco');
  await expect(cta(page)).toHaveText('Empezar foco');
  await expect(vis(page, '[data-pace-ritmo-estado="hecho"]')).toContainText('Jornada cerrada');
  await expect(page.locator('[data-pace-sidebar]')).not.toContainText('Tu pausa');
}

test('pasada la salida el día se cierra, con la página abierta y al recargar, y se sigue por libre', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await hastaLaPausa(page, context);
  await hastaLas(page, '16:55');
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: antes de la salida el día sigue').toHaveText('Bloque 2 de 9');
  await hastaLas(page, '17:40');
  await cerrada(page, 'con la página abierta, el día no se cierra');
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor();
  await cerrada(page, 'al recargar, el día no se cierra');
  /* Por libre: el Foco es el de siempre y su ventana también, sin la pausa de cierre. */
  await cta(page).click();
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Foco manual');
  await terminarBloque(page);
  const ventana = overlaySuperior(page);
  await expect(ventana).toContainText('Ciclo completado');
  await expect(ventana).not.toContainText('Bloque');
  expect(errores).toEqual([]);
});

test('el bloque que empezó antes de la salida acaba con su pausa de cierre, y luego el día se cierra', async ({ page, context }) => {
  await hastaLaPausa(page, context);
  await hastaLas(page, '16:50');
  await cta(page).click();
  await expect(vis(page, '[data-pace-dial-label]'), 'GUARD: el bloque 2 no es el último').toHaveText('Bloque 2 de 2');
  await terminarBloque(page);
  await expect(overlaySuperior(page), 'el bloque que cruza la salida no abre su cierre').toContainText('Bloque 2 de 2 · hecho');
  await expect(overlaySuperior(page)).toContainText('Para cerrar');
  await page.keyboard.press('Escape');
  await hastaLas(page, '17:50');
  /* Hechos los dos bloques, el aro dice «Jornada cerrada» también pasada la salida (Ez, V2 A del 7 nov.). */
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText('Jornada cerrada');
  await expect(vis(page, '[data-pace-dial-hasta]')).toHaveText('1 h 30 min de foco');
});
