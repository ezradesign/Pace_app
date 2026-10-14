/* PACE · E2E · LAS VOCES DE RESPIRA EN INGLÉS (14 oct. 2026)
 * ==========================================================
 * Hasta aquí, con la app en inglés sonaba el tono: las locuciones decían
 * «inhala / mantén / exhala». Ahora las dos voces dicen «Inhale / Hold / Exhale»
 * y la palabra sale en el idioma de la app. Lo que Ez decidió y se defiende:
 *
 *  · En inglés se piden los archivos ingleses de la voz elegida, no los
 *    castellanos (`paceVozIdioma`).
 *  · Se decide POR FASE, como en castellano, con las medidas inglesas: el
 *    «Inhale» de sulafat dura 1,97 s y en las inhalaciones de 2 s de las tres de
 *    rondas suena el tono; su «Exhale», 1,82 s, cabe en las 17.
 *  · Ninguna voz en una fase de 1 s (`PACE_VOZ_FASE_MIN`): las palabras de
 *    bradford en inglés cabrían, y Bhastrika y Kapalabhati dirían «Inhale» cada
 *    segundo. Ez eligió que sigan con el tono, como en castellano.
 *
 * Contra v0.163.0 caen las tres: en inglés la voz estaba apagada.
 * NO CUBRE si la voz SUENA ni a qué volumen: eso lo oye Ez en el portátil y en
 * el móvil antes de subirlo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrarPisando, irAlArtefacto, sembrar } = require('./helpers');
const { fasesPorRutina } = require('./respira-fases');

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* Precarga la voz activa en el idioma activo y espera a `canplaythrough`, que es
   lo único que deja contestar de forma síncrona. Devuelve los archivos pedidos. */
const preparar = (page) => page.evaluate(async () => {
  const v = paceVozInit(paceVozActiva());
  const hasta = Date.now() + 6000;
  while (Date.now() < hasta && !Object.keys(v).every(k => v[k].listo)) {
    await new Promise(res => setTimeout(res, 100));
  }
  return {
    listo: Object.keys(v).length === 3 && Object.keys(v).every(k => v[k].listo),
    fuentes: Object.keys(v).map(k => ((v[k].audio && v[k].audio.src) || '').split('/').pop()).sort(),
  };
});

/* Cada rutina contra el producto, señal por señal con su fase más corta. */
const veredicto = (page) => page.evaluate((lista) => lista.map(r => ({
  id: r.id,
  cabe: Object.keys(r.porSenal).every(s => paceVozCabe(s, r.porSenal[s])),
})), fasesPorRutina());

const BOMBEO = ['breathe.bellows', 'breathe.kapalabhati', 'breathe.physiological'];
const RONDAS = ['breathe.rounds.express', 'breathe.rounds.full', 'breathe.rounds.long'];

test('en inglés, la voz clara pide «Inhale / Hold / Exhale» y calla al inhalar en las rondas', async ({ page, context }) => {
  await sembrarPisando(context, { lang: 'en', voice: 'sulafat', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  const r = await preparar(page);
  expect(r.listo, 'GUARD: los clips ingleses no llegaron a listo').toBe(true);
  expect(r.fuentes).toEqual(['sulafat-exhale.mp3', 'sulafat-hold.mp3', 'sulafat-inhale.mp3']);
  expect(await page.evaluate(() => paceVozEncendida()), 'en inglés la voz sigue apagada').toBe(true);

  /* El «Inhale» (1,97 s + 0,15 de margen) no entra en 2 s y sí en 3. */
  const cabe = await page.evaluate(() => ({
    inhale2: paceVozCabe('breathe.inhale', 2), inhale3: paceVozCabe('breathe.inhale', 3),
    exhale2: paceVozCabe('breathe.exhale', 2), hold2: paceVozCabe('breathe.hold', 2),
  }));
  expect(cabe).toEqual({ inhale2: false, inhale3: true, exhale2: true, hold2: true });

  /* RELACIONAL contra el catálogo: fuera quedan las tres de bombeo y las tres de
     rondas, y ninguna más. */
  const v = await veredicto(page);
  expect(v.length).toBe(20);
  expect(v.filter(x => !x.cabe).map(x => x.id).sort()).toEqual(BOMBEO.concat(RONDAS).sort());
});

test('en inglés, la voz grave cabe en las 17 con voz, y en una fase de 1 s suena el tono', async ({ page, context }) => {
  await sembrarPisando(context, { lang: 'en', voice: 'bradford', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  const r = await preparar(page);
  expect(r.listo, 'GUARD: los clips ingleses no llegaron a listo').toBe(true);
  expect(r.fuentes).toEqual(['bradford-exhale.mp3', 'bradford-hold.mp3', 'bradford-inhale.mp3']);

  /* «Inhale» (0,74 s) y «Hold» (0,58 s) cabrían en 1 s con su margen: callan por
     la regla de la fase mínima, no por la medida. En 2 s suenan las tres. */
  const cabe = await page.evaluate(() => ({
    uno: ['breathe.inhale', 'breathe.hold', 'breathe.exhale'].map(s => paceVozCabe(s, 1)),
    dos: ['breathe.inhale', 'breathe.hold', 'breathe.exhale'].map(s => paceVozCabe(s, 2)),
  }));
  expect(cabe.uno, 'una palabra en una fase de 1 s').toEqual([false, false, false]);
  expect(cabe.dos).toEqual([true, true, true]);

  const v = await veredicto(page);
  expect(v.filter(x => !x.cabe).map(x => x.id).sort()).toEqual(BOMBEO.slice().sort());
});

test('cambiar el idioma cambia las palabras: de vuelta al castellano se piden las castellanas', async ({ page, context }) => {
  await sembrarPisando(context, { lang: 'en', voice: 'sulafat', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  expect((await preparar(page)).fuentes[0]).toBe('sulafat-exhale.mp3');
  await page.evaluate(() => setState({ lang: 'es' }));
  const r = await preparar(page);
  expect(r.listo).toBe(true);
  expect(r.fuentes).toEqual(['sulafat-exhala.mp3', 'sulafat-inhala.mp3', 'sulafat-manten.mp3']);
});
