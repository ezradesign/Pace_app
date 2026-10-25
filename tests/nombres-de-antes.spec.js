/* PACE · E2E · LOS SEIS NOMBRES NUEVOS Y LO GUARDADO CON LOS DE ANTES (Ez, 23 oct. 2026: 1A)
 * ========================================================================================
 * Seis ejercicios se llamaban de una forma y enseñaban otra («Círculos de hombro» eran círculos
 * de brazos, «Hueco en silla» era levantar las piernas sentado…). Se renombran sin cambiar el
 * dibujo. «Tus rutinas» guarda el nombre copiado en `localStorage`, así que una rutina hecha
 * antes sigue pidiendo el nombre viejo: tiene que verse con el de hoy, con su dibujo, su inglés
 * y lo que pide en «Antes de empezar».
 *
 * Contra v0.175.1 cae: el catálogo aún usa los nombres viejos y ninguno de los nuevos tiene dibujo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, overlaySuperior } = require('./helpers');

const RENOMBRADOS = {
  'Círculos de hombro': ['Círculos de brazos', 'Arm circles'],
  'Inclinación lateral': ['Inclinación de cuello', 'Neck tilt'],
  'Hueco en silla': ['Piernas elevadas sentado', 'Seated leg raises'],
  'Puente isquio a una pierna': ['Puente a una pierna', 'Single-leg bridge'],
  'Palmas al suelo': ['Palmas en la mesa', 'Palms on the desk'],
  'Apertura de costillas + respiración': ['Respirar a cuatro apoyos', 'Breathing on all fours'],
};

test('el catálogo usa los seis nombres nuevos, cada uno con su dibujo de siempre, y ninguno viejo', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate((R) => {
    const nombres = new Set();
    for (const cat of [window.MOVE_ROUTINES, window.EXTRA_ROUTINES]) {
      for (const g of Object.values(cat)) for (const rt of g.items) for (const s of rt.steps) nombres.add(s.name);
    }
    /* y las que ya no salen en la lista (ATG lleva el puente a una pierna) */
    for (const rt of window.EXTRA_ROUTINES_FUERA || []) for (const s of rt.steps) nombres.add(s.name);
    return Object.entries(R).map(([viejo, [nuevo]]) => ({
      viejo, nuevo,
      viejoEnCatalogo: nombres.has(viejo),
      nuevoEnCatalogo: nombres.has(nuevo),
      dibujo: window.exerciseMaskUrl(nuevo, 88),
      dibujoViejo: window.exerciseMaskUrl(viejo, 88),
      alias: window.resolveVisualId(viejo),
    }));
  }, RENOMBRADOS);
  for (const e of r) {
    expect(e.viejoEnCatalogo, e.viejo + ' sigue en el catálogo').toBe(false);
    /* «Puente a una pierna» vive en ATG, que ya no sale en la lista pero sigue existiendo. */
    expect(e.nuevoEnCatalogo, e.nuevo + ' no está en el catálogo').toBe(true);
    expect(e.dibujo, e.nuevo + ' se queda sin dibujo').toBeTruthy();
    expect(e.dibujoViejo, 'el nombre viejo ' + e.viejo + ' no lleva al mismo dibujo').toBe(e.dibujo);
    expect(e.alias).toBe(e.nuevo);
  }
});

test('una rutina propia guardada con los nombres de antes se ve con los de hoy, su dibujo y lo que pide', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const viejos = ['Círculos de hombro', 'Inclinación lateral', 'Hueco en silla', 'Palmas al suelo', 'Apertura de costillas + respiración'];
  await sembrar(context, { premiumUnlocked: true, customRoutines: [{ id: 'custom.1', name: 'De antes',
    steps: viejos.map((name) => ({ name, dur: 30, cue: 'Despacio.' })), min: 3,
    createdAt: 1760000000000, updatedAt: 1760000000000 }] });
  await irAlArtefacto(page);

  const r = await page.evaluate(() => {
    const rt = window.getCustomRoutine('custom.1');
    const g = window.moveRutinaGuiada(rt);
    return { pasos: g.steps.map((s) => s.name), pide: window.rutinaPropiaPide(rt.steps),
      guardado: rt.steps.map((s) => s.name) };
  });
  expect(r.pasos).toEqual(viejos.map((v) => RENOMBRADOS[v][0]));
  expect(r.guardado, 'abrirla no reescribe lo guardado').toEqual(viejos);
  expect(r.pide.pideIncompleto, 'algún nombre de antes se queda sin saber qué pide').toBe(false);
  expect(r.pide.requiresFloor, '«Respirar a cuatro apoyos» pide suelo').toBe(true);

  /* La vista previa, como la ve la persona. */
  await page.getByRole('button', { name: 'Mueve' }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.locator('h4:visible', { hasText: 'De antes' }).first().click();
  const preview = overlaySuperior(page);
  for (const v of viejos) {
    await expect(preview.getByText(RENOMBRADOS[v][0], { exact: true }).first()).toBeVisible();
    await expect(preview.getByText(v, { exact: true })).toHaveCount(0);
  }
  await expect(preview).toContainText('Sitio para tumbarte en el suelo');
  expect(errores).toEqual([]);
});

test('en inglés, los nombres de antes y los de hoy dicen lo mismo', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  const r = await page.evaluate((R) => Object.entries(R).filter(([v]) => v !== 'Puente isquio a una pierna')
    .map(([viejo, [nuevo]]) => [window.PACE_STRINGS.en['custom.ex.' + viejo + '.name'], window.PACE_STRINGS.en['custom.ex.' + nuevo + '.name']]), RENOMBRADOS);
  const esperado = Object.entries(RENOMBRADOS).filter(([v]) => v !== 'Puente isquio a una pierna').map(([, [, en]]) => [en, en]);
  expect(r).toEqual(esperado);
});
