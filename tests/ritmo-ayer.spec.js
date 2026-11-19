/* PACE · E2E · LO DE AYER, DICHO (Ez, 8A del 18 nov. 2026)
 * =========================================================
 * Las zonas que el último día no movió pesan más al día siguiente (ritmo.series.js, `pesos`): el
 * martes del tester empezó por las piernas porque el lunes no salieron, pero nada lo decía; la pausa
 * decía la línea de siempre. Ez eligió la A: «Piernas: ayer no las moviste»; en la app, «Piernas: ayer sin
 * mover», que cabe en una línea en la ventana a 360 px. Solo cuando la pausa viene de lo de ayer. «Ayer» es ayer: si lo último fue hace tres días,
 * no se dice. El ancho de las frases a 360 px lo mide ritmo-series.spec.js, con estas dentro.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

/* Compone el martes 20 oct. 2026 con lo servido `antes` (sin nada de piernas) y devuelve las frases. */
const martes = (page, antes, lang) => page.evaluate(({ H, antes, lang }) => {
  const sinPiernas = (m) => {
    const c = ritmoSeriesClaves(m.items), out = {};
    Object.keys(c).forEach((k) => { out[k] = c[k].filter((id) => ritmoSeriesZonas(id).indexOf('piernas') === -1); });
    return out;
  };
  const memA = ritmoMemoria({ ritmo: {} }, antes, null, null);
  const previo = semanaComponer('jornada', H, ritmoPozos(getState(), antes), {}, 8, semanaDe(antes), null, memA);
  const serv = { [antes]: sinPiernas(previo) };
  const hoy = '2026-10-20';
  const mem = ritmoMemoria({ ritmo: { servidos: serv } }, hoy, null, null);
  const m = semanaComponer('jornada', H, ritmoPozos(getState(), hoy), {}, 8, semanaDe(hoy), null, mem);
  const S = window.PACE_STRINGS[lang];
  const t = (k) => S[k] || k;
  const tn = (k, v) => Object.keys(v || {}).reduce((s, x) => s.split('{' + x + '}').join(String(v[x])), t(k));
  return m.items.filter((it) => it.tipo === 'pausa').map((it) => ({
    k: it.frase && it.frase.k, zona: it.frase && it.frase.zona, texto: ritmoFrase(it, t, tn),
    zonas: (it.platos || []).flatMap((p) => ritmoSeriesZonas(p.id)),
  }));
}, { H, antes, lang: lang || 'es' });

test('la pausa que mueve lo que ayer no se movió lo dice: «Piernas: ayer sin mover»', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const pausas = await martes(page, '2026-10-19');
  const deAyer = pausas.filter((p) => p.k === 'ayer');
  expect(deAyer.length, 'ninguna pausa dice lo de ayer').toBeGreaterThan(0);
  expect(deAyer.map((p) => p.texto)).toContain('Piernas: ayer sin mover');
  /* Solo de lo de ayer: la zona que nombra es de su rutina y ayer no salió. */
  for (const p of deAyer) {
    expect(p.zonas).toContain(p.zona);
    expect(p.zona).toBe('piernas');
  }
  const en = await martes(page, '2026-10-19', 'en');
  expect(en.filter((p) => p.k === 'ayer').map((p) => p.texto)).toContain('Legs: idle yesterday');
});

test('si lo último fue hace tres días, no se dice «ayer»: la línea de siempre', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const pausas = await martes(page, '2026-10-16');
  expect(pausas.filter((p) => p.k === 'ayer')).toEqual([]);
  expect(pausas.some((p) => p.texto === 'Piernas: aún sin mover'), 'GUARD: las piernas siguen saliendo con su línea').toBe(true);
});
