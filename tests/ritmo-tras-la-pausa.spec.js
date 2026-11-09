/* PACE · E2E · AL VOLVER TRAS LA PAUSA, EL DÍA SE LEE DESDE AHORA (Ez, S11 A del 8 nov. 2026)
 * ======================================================================================
 * Caza de la semana: jornada de 8:00 a 18:00 empezada a las 8:00 y PACE de fondo de 8:10 a 12:10. A las
 * 12:10 el aro decía bien «Pausa terminada · Empezar bloque 2», pero la tarjeta del móvil decía «Ahora ·
 * 8:45 …» y «Luego · 8:50 Foco · bloque 2 de 11», y la línea marcaba «Ahora» en las 8:45 con todo el día
 * en horas pasadas. Solo al pulsar «Empezar bloque 2» se recolocaba («bloque 2 de 7», luego a las 12:55).
 * Ahora, en cuanto la pausa acabó, el día se lee desde ahora, como con el día sin empezar (E1):
 *  · la tarjeta, la línea y la barra lateral dicen lo que saldría al pulsar, y no se escribe nada;
 *  · al pulsar queda eso mismo, y la pausa que no se hizo, saltada;
 *  · mientras dura la pausa, todo sigue como siempre (CONTROL).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior, terminarBloque } = require('./helpers');

const HOY = '2026-11-12';
const HORARIO = { inicio: 480, comida: 840, comidaDur: 60, salida: 1080 };
const a = (hhmm) => new Date(HOY + 'T' + hhmm + ':00+01:00');
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function enLaPausa(page, context, movil) {
  if (movil) await page.setViewportSize({ width: 360, height: 800 });
  await sembrar(context, Object.assign({ ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion: 'jornada', desde: 480, cicloBase: 0, cambios: {} } } },
    movil ? { sidebarCollapsed: true } : {}));
  await page.clock.install({ time: a('08:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(300);
  await vis(page, '[data-pace-cta]').first().click();
  await terminarBloque(page);
  await overlaySuperior(page).getByRole('button', { name: 'Ahora no', exact: true }).click();
  await page.waitForTimeout(200);
}
/* PACE de fondo: el reloj salta de golpe y la página se entera al volver. */
async function volverA(page, hhmm) {
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.fastForward(a(hhmm).getTime() - await page.evaluate(() => Date.now()));
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(600);
}
const lectura = (page) => page.evaluate(() => {
  const p = ritmoPlan(getState()), d = getState().ritmo.dia;
  const ahora = p.m.items[ritmoIndiceAhora(p)];
  return { ahora: ahora.tipo + ' ' + ritmoHora(ahora.desde), total: p.total, actual: ritmoHora(p.actual.desde),
           luego: ritmoHora(ritmoDetras(p.m, p.actual).desde), desde: d.desde, pasado: d.pasado || null, estado: (d.estados || {})[1] || null };
});

test('en el móvil, a las 12:10 la tarjeta dice «Ahora» el bloque 2 desde ahora, sin escribir nada', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await enLaPausa(page, context, true);
  await volverA(page, '12:10');
  await expect(vis(page, '[data-pace-dial-label]')).toHaveText(/^Bloque 2 de \d+$/);
  const l = await lectura(page);
  expect(l.ahora, 'la tarjeta y la línea seguían en la pausa de las 8:45').toBe('foco 12:10');
  expect(l.desde, 'leer no escribe').toBe(480);
  expect(l.pasado).toBe(null);
  const tarjeta = vis(page, '[data-pace-ritmo-estado="menu"]');
  await expect(tarjeta).toContainText('12:10');
  await expect(tarjeta).toContainText('bloque 2 de ' + l.total);
  await expect(tarjeta).not.toContainText('8:45');
  /* Al pulsar queda lo mismo que se leía, y la pausa que no se hizo, saltada. */
  await vis(page, '[data-pace-cta]').click();
  await page.waitForTimeout(400);
  const tras = await lectura(page);
  expect([tras.total, tras.actual, tras.luego]).toEqual([l.total, l.actual, l.luego]);
  expect(tras.estado).toBe('saltada');
  expect(tras.pasado.map((it) => it.tipo)).toEqual(['foco', 'pausa']);
  expect(errores).toEqual([]);
});

test('en el ordenador, la línea marca «Ahora» en el bloque y la barra lateral ya no dice «Tu pausa»', async ({ page, context }) => {
  await enLaPausa(page, context);
  await volverA(page, '12:10');
  const l = await lectura(page);
  expect(l.ahora).toBe('foco 12:10');
  const linea = vis(page, '[data-pace-ritmo-linea]');
  await expect(linea.locator('[data-pace-ritmo-parada] .pace-rt-ahora-tag'), 'la parada de las 8:45 seguía siendo «Ahora»').toHaveCount(0);
  await expect(linea.locator('.pace-rt-ahora-tag'), '«Ahora» va en el bloque').toHaveCount(1);
  await expect(linea.locator('[data-pace-ritmo-parada]').first()).toHaveClass(/pace-rt-pasado/);
  await expect(page.locator('[data-pace-sidebar]')).not.toContainText('Tu pausa');
});

test('CONTROL · mientras dura la pausa, «Ahora» es la pausa, como siempre', async ({ page, context }) => {
  await enLaPausa(page, context, true);
  const l = await lectura(page);
  expect(l.ahora).toBe('pausa 8:45');
  await expect(vis(page, '[data-pace-ritmo-estado="menu"]')).toContainText('8:45');
});
