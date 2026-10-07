/* PACE · la preparación de Mueve y Estira no manda de pie a quien está en la silla
 * ==============================================================================
 * La frase bajo la cuenta atrás decía «De pie. Sin prisa. N pasos.» en las 31
 * rutinas de los dos módulos, y 8 son de silla (su tarjeta dice «sentado»:
 * Columna en la silla, Glúteos invisibles, Cuello…) y 2 de suelo. Ahora nombra la
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
      const tn = (k, v) => String(tabla[k]).split('{n}').join(String(v.n));
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

test('Estira · «Columna en la silla» se prepara en la silla, como dice su tarjeta', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const frase = await abrirPreparacion(page, 'Estira', 'Columna en la silla');
  await expect(frase).toHaveText('En la silla. Sin prisa. 5 pasos.');
  expect(errores).toEqual([]);
});

test('Mueve · «Sentadillas de silla», que es de pie, sigue diciendo «De pie»', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  const frase = await abrirPreparacion(page, 'Mueve', 'Sentadillas de silla');
  await expect(frase).toHaveText('De pie. Sin prisa. 5 pasos.');
  expect(errores).toEqual([]);
});
