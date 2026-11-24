/* PACE · la preparación de Mueve y Estira no manda de pie a quien está en la silla
 * ==============================================================================
 * La frase bajo la cuenta atrás decía «De pie. Sin prisa. N pasos.» en las 31
 * rutinas de los dos módulos, y 8 son de silla (su tarjeta dice «sentado»:
 * Tronco sentado, Glúteos en la silla, Cuello suave…) y 2 de suelo. Ahora nombra la
 * postura solo cuando la rutina tiene una única; con varias no nombra ninguna,
 * porque `position` lista las que usa y no por cuál empieza.
 *
 * La primera prueba recorre el catálogo entero en los dos idiomas; las otras dos
 * miran la pantalla de verdad, una de silla y otra de pie como control.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

async function abrirPreparacion(page, modulo, rutina) {
  await page.getByRole('button', { name: modulo }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  await page.getByRole('heading', { name: rutina }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  return page.locator('[data-pace-session-prep-copy]');
}

test('ninguna rutina nombra en su preparación una postura que no tiene', async ({ page }) => {
  await irAlArtefacto(page);
  const malas = await page.evaluate(() => {
    const out = [];
    const rutinas = []
      .concat(...Object.values(window.MOVE_ROUTINES).map(g => g.items))
      .concat(...Object.values(window.EXTRA_ROUTINES).map(g => g.items));
    const suelo = ['floor', 'supine', 'halfKneeling'];
    ['es', 'en'].forEach(lang => {
      const tabla = window.PACE_STRINGS[lang];
      const tn = (k, v) => String(tabla[k]).replace(/\{(\w+)\}/g, (m, x) => (v && x in v ? String(v[x]) : m));
      const dice = {
        standing: tabla['move.prepCopy.standing'].split('.')[0],
        seated: tabla['move.prepCopy.seated'].split('.')[0],
        floor: tabla['move.prepCopy.floor'].split('.')[0],
      };
      rutinas.forEach(r => {
        const frase = window.sessionPrepCopy(r, tn);
        if (/\{|undefined|move\./.test(frase)) out.push(lang + ' ' + r.id + ': ' + frase);
        Object.keys(dice).forEach(p => {
          const tiene = p === 'floor' ? r.position.some(x => suelo.indexOf(x) !== -1) : r.position.indexOf(p) !== -1;
          if (frase.indexOf(dice[p]) === 0 && !tiene) out.push(lang + ' ' + r.id + ' ' + JSON.stringify(r.position) + ': ' + frase);
        });
      });
    });
    return { out, total: rutinas.length };
  });
  expect(malas.total, 'el catálogo no cargó: la prueba no mide nada').toBeGreaterThan(25);
  expect(malas.out).toEqual([]);
});

/* Desde la V3A de Ez (24 nov. 2026), si el primer paso se coloca, la colocación hace de «Prepárate» y
   la pantalla de preparación no sale: se mira que no salga y que la frase, donde sale, diga la postura. */
async function frasePara(page, nombre) {
  return page.evaluate((n) => {
    const tabla = window.PACE_STRINGS.es;
    const tn = (k, v) => String(tabla[k]).replace(/\{(\w+)\}/g, (m, x) => (v && x in v ? String(v[x]) : m));
    const r = [].concat(...Object.values(window.MOVE_ROUTINES).map(g => g.items), ...Object.values(window.EXTRA_ROUTINES).map(g => g.items))
      .find((x) => x.name === n);
    return window.sessionPrepCopy(r, tn);
  }, nombre);
}

test('Estira · «Tronco sentado» se prepara en la silla, como dice su tarjeta', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirPreparacion(page, 'Estira', 'Tronco sentado');
  await expect(page.locator('[data-pace-v1-body]').filter({ visible: true }), 'empieza por colocarse (V3A)').toBeVisible();
  await expect(page.locator('[data-pace-session-prep]')).toHaveCount(0);
  expect(await frasePara(page, 'Tronco sentado')).toBe('En la silla. Sin prisa. 3 ejercicios, 4 series.');
  expect(errores).toEqual([]);
});

test('Mueve · «Levántate y sube», que es de pie, sigue diciendo «De pie»', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirPreparacion(page, 'Mueve', 'Levántate y sube');
  await expect(page.locator('[data-pace-v1-body]').filter({ visible: true }), 'empieza por colocarse (V3A)').toBeVisible();
  /* 4 ejercicios y 3 descansos: se cuentan los ejercicios, como en el cierre (recorrido de tester, 18 nov.). */
  expect(await frasePara(page, 'Levántate y sube')).toMatch(/^De pie\. Sin prisa\. /);
  expect(errores).toEqual([]);
});
