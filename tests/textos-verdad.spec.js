/* PACE · E2E · LOS TEXTOS DICEN LA VERDAD (recorrido de tester, 18 nov. 2026)
 * ==========================================================================
 * Lo que un tester nuevo leyó y no era cierto:
 *   · «Larga sesión: cinco bloques de 45 min sin pausa», y se gana con cinco bloques cualesquiera, con
 *     sus pausas (state-timer.jsx). En inglés, «without a break».
 *   · Escritorio express: «6 movimientos en la silla», y son 5. Se mira en toda rutina de cuerpo que diga
 *     cuántos pasos o movimientos tiene, en los dos idiomas.
 *   · «Prepárate · 5 pasos» contaba el descanso, y el cierre dice «4 PASOS» (ejercicios sin descansos).
 *   · La pausa larga dice «Dos horas: sal de la silla» y Respira empezaba con «Siéntate cómodo».
 *   · Los logros hablaban de «Pomodoro» (la app dice Foco), «antes de las 9am», «sesiones SIT» (una
 *     etiqueta interna) y «con pace» en minúscula.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, MEDIODIA } = require('./helpers');

async function abrir(page, context, extra) {
  await sembrar(context, extra || {});
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
}

test('los logros no dicen «Pomodoro», «9am», «SIT», «sin pausa» ni «pace» en minúscula (es y en)', async ({ page, context }) => {
  await abrir(page, context);
  const malas = await page.evaluate(() => {
    const en = window.PACE_STRINGS.en;
    const out = [];
    for (const a of window.ACHIEVEMENT_CATALOG) {
      if (a.secret) continue;
      for (const [lang, d] of [['es', a.desc], ['en', en['ach.item.' + a.id + '.desc']]]) {
        if (/Pomodoro|\d(am|pm)\b|\bSIT\b|sin pausa|without a break|\bpace\b/.test(d || '')) out.push(a.id + ' (' + lang + '): ' + d);
      }
    }
    return out;
  });
  expect(malas).toEqual([]);
});
test('cada rutina de cuerpo que dice cuántos pasos o movimientos tiene, dice los que tiene (es y en)', async ({ page, context }) => {
  await abrir(page, context);
  const malas = await page.evaluate(() => {
    const out = [];
    const grupos = [window.MOVE_ROUTINES, window.EXTRA_ROUTINES];
    const en = (window.PACE_STRINGS && window.PACE_STRINGS.en) || {};
    for (const lib of grupos) for (const g of Object.values(lib || {})) for (const r of (g.items || [])) {
      const n = (r.steps || []).filter((s) => s.mode !== 'rest').length;
      for (const [lang, d] of [['es', r.desc], ['en', en[r.id + '.desc']]]) {
        const m = /(\d+) (?:pasos|movimientos|ejercicios|movements|steps|exercises|hip movements)\b/.exec(d || '');
        if (m && Number(m[1]) !== n) out.push(r.id + ' (' + lang + '): «' + d + '» y tiene ' + n);
      }
    }
    return out;
  });
  expect(malas).toEqual([]);
});
test('«Prepárate» cuenta los pasos como el cierre: sin el descanso', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate(() => {
    const t = (k, v) => String(window.PACE_STRINGS.es[k]).replace(/\{(\w+)\}/g, (m, x) => (v && x in v ? v[x] : m));
    const espalda = Object.values(window.EXTRA_ROUTINES).flatMap((g) => g.items).find((x) => x.name === 'Espalda de pie');
    return { copia: sessionPrepCopy(espalda, t), ejercicios: espalda.steps.filter((s) => s.mode !== 'rest').length,
             todos: espalda.steps.length };
  });
  expect(r.todos, 'GUARD: Espalda de pie lleva un descanso entre sus pasos').toBeGreaterThan(r.ejercicios);
  /* «4 ejercicios» desde la V5A (24 nov.): ejercicio y series donde las hay. */
  expect(r.copia).toContain(r.ejercicios + ' ejercicios');
});
test('en la pausa larga de «Dos horas: sal de la silla», Respira no empieza con «Siéntate cómodo»', async ({ page, context }) => {
  /* Martes 24 nov. a las 11:17: tres bloques hechos y la pausa larga abierta. */
  const MARTES = new Date('2026-11-24T11:17:00+01:00');
  await sembrar(context, { cycle: 3, lastActiveDay: 'Tue Nov 24 2026', soundOn: false,
    ritmo: { dia: { fecha: '2026-11-24', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: 3,
      estados: { 1: 'hecha', 2: 'saltada' } } } });
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  const pausa = await page.evaluate(() => { const a = ritmoPausaAbierta(); return a && { k: a.it.frase && a.it.frase.k, platos: a.platos.map((p) => p.modulo) }; });
  expect(pausa, 'GUARD: la pausa abierta es la larga de las dos horas, con Respira').toEqual(expect.objectContaining({ k: 'larga' }));
  expect(pausa.platos, 'GUARD: lleva Respira').toContain('respira');
  /* la pausa de la barra, «Ahora, Exhalación 4·6…», abre su primer plato */
  await page.getByRole('button', { name: /^Ahora, / }).click();
  await expect(page.locator('[data-pace-session-root]'), 'GUARD: empieza Respira').toHaveCount(1);
  const texto = await page.locator('[data-pace-session-root]').innerText();
  expect(texto).not.toContain('Siéntate cómodo');
  expect(texto).toContain('De pie o sentado');
});
