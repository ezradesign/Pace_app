/* PACE · E2E · LAS DOS SUAVES DE PIE DESCANSAN 15 S, NO TANTO COMO TRABAJAN
 * ===========================================================================
 * Fila 16 de la cola de las auditorías de Fable (externa 3.3): «Levántate y sube» (88 s de ejercicio)
 * y «Piernas sin pasos» (94 s) descansaban 90 s cada una, tres descansos de 30. Son actividad suave y
 * la base de Mueve y Estira da 10-30 s ahí (`docs/product/BASE_MUEVE_ESTIRA.md` §6). Sus descansos
 * duran 15 s y no siguen el ajuste «Descanso entre series» (20/30/45), que es para la fuerza.
 * CONTROL: el resto de Mueve sigue con el ajuste, y «Con una basta» sigue saliendo en «Levántate y sube».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test('descanso-suave · con el ajuste en 45 s, las dos suaves descansan 15 s y lo demás sigue el ajuste', async ({ page, context }) => {
  await sembrar(context, { restBetweenSets: 45 });
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const cuenta = (id) => {
      const rut = getMoveRoutine(id);
      const descansos = rut.steps.filter((p) => p.mode === 'rest').map((p) => v1StepDur(p));
      const trabajo = rut.steps.filter((p) => p.mode !== 'rest').reduce((s, p) => s + (p.dur || 0), 0);
      return { descansos, trabajo };
    };
    return {
      sube: cuenta('extra.chair.squats'),
      piernas: cuenta('extra.legs.standing'),
      empuje: cuenta('extra.desk.pushups'),
      basta: v1BastaDestino(getMoveRoutine('extra.chair.squats'), 1),
    };
  });
  for (const k of ['sube', 'piernas']) {
    expect(r[k].descansos, k + ': sus descansos no son de 15 s').toEqual([15, 15, 15]);
    const descanso = r[k].descansos.reduce((s, x) => s + x, 0);
    /* Antes, 90 s de descanso para 88 y 94 de trabajo; ahora, 45: la mitad, más o menos. */
    expect(descanso, k + ': descansa casi tanto como trabaja').toBeLessThan(r[k].trabajo * 0.6);
  }
  expect(r.empuje.descansos, 'CONTROL: «Empuje sencillo» dejó de seguir el ajuste').toEqual([45]);
  /* «Con una basta», desde el primer descanso, salta la otra serie y su descanso: a los talones (paso 4). */
  expect(r.basta, '«Con una basta» ya no sale en «Levántate y sube»').toBe(4);
});
