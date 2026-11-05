/* PACE · E2E · TOCAR UNA PAUSA DE MÁS TARDE ES MIRARLA (Ez, 5 nov. 2026: 1A)
 * ==========================================================================
 * Q2 de las revisiones de ChatGPT del 28 oct.: en la línea del día del escritorio, tocar una
 * parada que aún no toca la cambiaba por otra (`ritmoOtra`) sin preguntar ni dejar volver, y a
 * veces cambiaba también otra de más tarde, porque las series reparten el cuerpo en el día y no
 * repiten rutina. Ez eligió la 1A de la maqueta: tocar abre una ficha con lo que es, y cambiarla
 * es «Otra», dentro de la ficha, que dice qué otra parada se ha movido.
 *
 * QUÉ DEFIENDE: tocar no cambia nada; «Otra» cambia esa parada y la ficha enseña la nueva; si
 * se mueve otra parada, la ficha dice su hora (y si no se mueve ninguna, no dice nada); Escape,
 * «Cerrar» y tocar fuera la cierran sin cambiar nada; la ficha cabe en la ventana de Ez.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* El día de la maqueta: martes 3 nov., jornada de 9 a 17 con comida a las 14, empezada a las 10:20.
   Con este día, cambiar la de las 11:55 movía también la de las 16:20 (las fotos de la maqueta). */
const MARTES = new Date('2026-11-03T10:20:00+01:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const DIA = { fecha: '2026-11-03', opcion: 'jornada', desde: 620, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context, w, h) {
  await page.setViewportSize({ width: w || 1280, height: h || 879 });
  await sembrar(context, { ritmo: { horario: HORARIO, dia: DIA } });
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  await page.waitForTimeout(500);
}

/* Las paradas que aún no tocan, en el orden de la línea: hora y rutinas. */
const futuras = (page) => page.evaluate(() => {
  const p = ritmoPlan(getState());
  const i0 = ritmoIndiceAhora(p);
  return p.m.items.map((it, i) => ({ it, i })).filter(({ it, i }) => i > i0 && it.platos && it.platos.length && it.tipo !== 'comida')
    .map(({ it }) => ({ h: ritmoHora(it.desde), ids: it.platos.map((x) => x.id).join('+'), claves: it.platos.map((x) => x.clave), nombre: it.platos.map((x) => x.name).join(' + ') }));
});

/* Qué paradas movería «Otra» en cada una, sin tocar el estado: el mismo plan con un cambio más. */
const cascadas = (page) => page.evaluate(() => {
  const s = getState();
  const base = ritmoPlan(s);
  const i0 = ritmoIndiceAhora(base);
  const fut = (p) => p.m.items.map((it, i) => ({ it, i })).filter(({ it, i }) => i > i0 && it.platos && it.platos.length && it.tipo !== 'comida');
  const antes = fut(base);
  return antes.map(({ it }, k) => {
    const cambios = Object.assign({}, s.ritmo.dia.cambios);
    it.platos.forEach((x) => { cambios[x.clave] = (cambios[x.clave] || 0) + 1; });
    const otro = fut(ritmoPlan(Object.assign({}, s, { ritmo: Object.assign({}, s.ritmo, { dia: Object.assign({}, s.ritmo.dia, { cambios }) }) })));
    return otro.map(({ it: x }, j) => (j !== k && x.platos.map((y) => y.id).join('+') !== antes[j].it.platos.map((y) => y.id).join('+') ? ritmoHora(x.desde) : null)).filter(Boolean);
  });
});

test('tocar una pausa de más tarde abre su ficha y no cambia nada', async ({ page, context }) => {
  await abrir(page, context);
  const antes = await futuras(page);
  expect(antes.length, 'GUARD: el día no tiene paradas por delante').toBeGreaterThan(2);
  const parada = vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ hasNot: page.locator('.pace-rt-ahora-tag') }).nth(1);
  await expect(parada, 'la parada no dice que tocarla es verla').toHaveAttribute('title', /toca para ver qué es/);
  await parada.click();
  const ficha = vis(page, '[data-pace-ritmo-ficha]');
  await expect(ficha, 'tocar la parada no abre su ficha').toHaveCount(1);
  await expect(ficha).toContainText(antes[1].nombre);
  await expect(ficha).toContainText(antes[1].h);
  expect(await futuras(page), 'tocar la parada ha cambiado el plan').toEqual(antes);
  expect(await page.evaluate(() => getState().ritmo.dia.cambios), 'tocar la parada ha pedido otra').toEqual({});
});

test('«Otra» cambia esa pausa, la ficha enseña la nueva y dice qué otra se movió', async ({ page, context }) => {
  await abrir(page, context);
  const antes = await futuras(page);
  const mueve = await cascadas(page);
  const k = mueve.findIndex((x) => x.length > 0);
  expect(k, 'GUARD: en este día ninguna «Otra» mueve otra parada; la prueba no mide el aviso').toBeGreaterThanOrEqual(0);
  const quieta = mueve.findIndex((x) => x.length === 0);

  const paradas = vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ hasNot: page.locator('.pace-rt-ahora-tag') });
  await paradas.nth(k).click();
  await vis(page, '[data-pace-ritmo-ficha] [data-pace-ficha-otra]').click();
  const despues = await futuras(page);
  expect(despues[k].ids, '«Otra» no ha cambiado la parada').not.toBe(antes[k].ids);
  const ficha = vis(page, '[data-pace-ritmo-ficha]');
  await expect(ficha, 'la ficha no enseña la rutina nueva').toContainText(despues[k].nombre);
  for (const h of mueve[k]) await expect(ficha, 'la ficha no dice que también cambia la de las ' + h).toContainText('las ' + h);
  await expect(ficha).toContainText('para no repetir');

  /* Una que no mueve nada no dice nada. */
  if (quieta >= 0) {
    await page.keyboard.press('Escape');
    await paradas.nth(quieta).click();
    await vis(page, '[data-pace-ritmo-ficha] [data-pace-ficha-otra]').click();
    await expect(vis(page, '[data-pace-ritmo-ficha]')).not.toContainText('También');
  }
});

test('Escape, «Cerrar» y tocar fuera la cierran sin cambiar nada', async ({ page, context }) => {
  await abrir(page, context);
  const antes = await futuras(page);
  const parada = vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ hasNot: page.locator('.pace-rt-ahora-tag') }).nth(0);
  const ficha = page.locator('[data-pace-ritmo-ficha]');
  await parada.click();
  await expect(ficha).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(ficha, 'Escape no cierra la ficha').toHaveCount(0);
  await expect(parada, 'al cerrar, el foco no vuelve a la parada').toBeFocused();
  await parada.click();
  await ficha.locator('[data-pace-ficha-cerrar]').click();
  await expect(ficha, '«Cerrar» no cierra la ficha').toHaveCount(0);
  await parada.click();
  await vis(page, '.pace-rt-titulo').first().click({ position: { x: 6, y: 10 } });
  await expect(ficha, 'tocar fuera no cierra la ficha').toHaveCount(0);
  expect(await futuras(page), 'cerrar la ficha ha cambiado el plan').toEqual(antes);
});

test('la ficha cabe en la ventana, también en la de Ez', async ({ page, context }) => {
  await abrir(page, context, 1536, 708);
  const n = await vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ hasNot: page.locator('.pace-rt-ahora-tag') }).count();
  expect(n, 'GUARD: no hay paradas que tocar').toBeGreaterThan(2);
  for (const [w, h] of [[1536, 708], [1280, 600], [1280, 879]]) {
    await page.setViewportSize({ width: w, height: h });
    for (const i of [0, n - 1]) {
      await vis(page, '[data-pace-ritmo-linea] [data-pace-ritmo-parada]').filter({ hasNot: page.locator('.pace-rt-ahora-tag') }).nth(i).click();
      const c = await vis(page, '[data-pace-ritmo-ficha]').evaluate((e) => { const r = e.getBoundingClientRect(); return { t: r.top, b: r.bottom, l: r.left, r: r.right, vw: innerWidth, vh: innerHeight }; });
      expect(c.b, w + '×' + h + ', parada ' + i + ': la ficha se sale por abajo').toBeLessThanOrEqual(c.vh);
      expect(c.t, w + '×' + h + ', parada ' + i + ': la ficha se sale por arriba').toBeGreaterThanOrEqual(0);
      expect(c.r, w + '×' + h + ', parada ' + i + ': la ficha se sale por la derecha').toBeLessThanOrEqual(c.vw);
      expect(c.l, w + '×' + h + ', parada ' + i + ': la ficha se sale por la izquierda').toBeGreaterThanOrEqual(0);
      await page.keyboard.press('Escape');
    }
  }
});
