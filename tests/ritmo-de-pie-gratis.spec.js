/* PACE · E2E · SIN PAGAR, NUNCA DOS PAUSAS SENTADAS SEGUIDAS (Ez, 2.3 A del 16 nov. 2026)
 *
 * docs/proposals/menores-16nov/. Con PACE abierto entero nunca hay dos pausas sentadas
 * seguidas, pero sin pagar «A tu ritmo» solo elige de «Para empezar» (cinco rutinas de pie) y
 * no repite nada en el día: con el aro corto se acababan a media mañana. Medido contra la
 * 0.207.0: dos sentadas seguidas 16 días de 20 con cualquier aro, tres seguidas 4 de 20 con el
 * aro a 10, 15 o 25, y la segunda pausa larga con un Estira sentado. Ahora, antes de servir otra
 * sentada, se repite una de pie:
 *   · en 20 laborables sin pagar, con el aro a 10, 15, 25 y 45, nunca dos sentadas seguidas (la
 *     comida corta la cuenta, como en ritmo-series.spec.js) y la larga lleva un Estira de pie;
 *   · para eso repite algo de pie (con 11 pausas y diez rutinas gratis, algo se repite siempre).
 * Contra la 0.207.0 cae en las tres.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

test('sin pagar y con cualquier aro: nunca dos sentadas seguidas y la larga de pie, aunque haya que repetir algo de pie', async ({ page, context }) => {
  await sembrar(context, { ritmo: { libre: true } });
  await irAlArtefacto(page);
  const r = await page.evaluate((H) => {
    const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const dias = []; for (const d = new Date(2026, 10, 16); dias.length < 20; d.setDate(d.getDate() + 1)) if (d.getDay() >= 1 && d.getDay() <= 5) dias.push(iso(d));
    /* Sin pagar, como desde v1 (lo mismo que ritmo-series.spec.js para «Para empezar»). */
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    window.canAccessRoutine = (id) => { const b = window.resolveBodyRoutine && window.resolveBodyRoutine(id); const br = window.getBreatheRoutine && window.getBreatheRoutine(id); return ((b && b.routine) || br || {}).access !== 'premium'; };
    const fallos = []; let repetidas = 0;
    for (const aro of [10, 15, 25, 45]) {
      const serv = {};
      for (const d of dias) {
        const mem = ritmoMemoria({ ritmo: { servidos: serv } }, d, null, null);
        const m = semanaComponer('jornada', Object.assign({}, H, { ahora: 540 }), ritmoPozos(getState(), d), {}, 8, semanaDe(d), ritmoPrevios([], null, false, aro), mem);
        serv[d] = ritmoSeriesClaves(m.items); const fs = Object.keys(serv).sort(); while (fs.length > 7) delete serv[fs.shift()];
        const mal = (q) => fallos.push('aro ' + aro + ', ' + d + ': ' + q);
        let seguidas = 0; const vistos = {};
        m.items.forEach((it) => {
          if (it.tipo === 'comida') seguidas = 0;
          if (it.tipo !== 'pausa') return;
          const pie = (it.platos || []).some((p) => ritmoSeriesDePie(p.id));
          if (pie) seguidas = 0; else if (++seguidas > 1) mal('dos sentadas seguidas a las ' + ritmoHora(it.desde));
          if (it.larga && !(it.platos[1] && ritmoSeriesDePie(it.platos[1].id))) mal('la larga de las ' + ritmoHora(it.desde) + ' lleva un Estira sentado');
          (it.platos || []).forEach((p) => {
            if (vistos[p.id] && ritmoSeriesDePie(p.id)) repetidas++;
            vistos[p.id] = true;
          });
        });
      }
    }
    return { fallos, repetidas };
  }, H);
  expect(r.fallos).toEqual([]);
  expect(r.repetidas, 'con 11 pausas al día sin pagar, la regla repite algo de pie').toBeGreaterThan(0);
});
