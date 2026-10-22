/* PACE · tests/voz-grave-exhala.spec.js
   =====================================
   EL «EXHALA» DE LA VOZ GRAVE CABE EN RONDAS Y CALLA AL ACABAR LA PALABRA (Ez, 3A del
   22 oct. 2026, oyéndolo en docs/proposals/maqueta-inicio-22oct.html).

   La palabra va de 0,108 a 1,309 s. Detrás hay 2,3 s de silencio y un chasquido en los
   últimos ~15 ms del MP3, que la medida tomó por el final de la palabra (fin 3,68): la
   voz no cabía en las fases de 2 s de las tres de rondas y allí sonaba el tono, y en las
   rutinas lentas el chasquido sonaba unos 3,6 s después de cada «exhala».

   QUÉ DEFIENDE: que el «exhala» grave quepa en la exhalación de las tres de rondas, y que
   la voz se pare en `fin` + PACE_VOZ_COLA, por Web Audio y por el `<audio>` de reserva.
   Contra v0.174.4 cae entera: no cabía, y la voz sonaba hasta el final del archivo.

   NO CUBRE: si el chasquido se oye. Playwright no escucha; se mide lo que se programó.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { fasesPorRutina } = require('./respira-fases');

const RONDAS = ['breathe.rounds.express', 'breathe.rounds.full', 'breathe.rounds.long'];

test.beforeEach(async ({ context }) => { await sembrar(context, { voice: 'bradford', voiceOn: true, soundOn: true }); });

/* Precarga la voz grave y espera a que sus tres palabras estén listas y descodificadas. */
async function preparar(page) {
  await irAlArtefacto(page);
  await page.mouse.click(5, 5);   // el gesto que deja arrancar el contexto de audio
  return page.evaluate(async () => {
    const v = paceVozInit('bradford');
    const hasta = Date.now() + 8000;
    while (Date.now() < hasta && !Object.keys(v).every((k) => v[k].listo && v[k].buffer)) {
      await new Promise((res) => setTimeout(res, 100));
    }
    return Object.keys(v).every((k) => v[k].listo && v[k].buffer);
  });
}

test('el «exhala» grave cabe en la exhalación de 2 s de las tres de rondas', async ({ page }) => {
  expect(await preparar(page), 'GUARD: las tres palabras de bradford, listas').toBe(true);
  const rutinas = fasesPorRutina().filter((r) => RONDAS.includes(r.id));
  expect(rutinas.map((r) => r.id).sort(), 'GUARD: las tres de rondas, en el catálogo').toEqual(RONDAS.slice().sort());
  const r = await page.evaluate((lista) => lista.map((x) => ({
    id: x.id, fase: x.porSenal['breathe.exhale'], cabe: paceVozCabe('breathe.exhale', x.porSenal['breathe.exhale']),
  })), rutinas);
  for (const x of r) {
    expect(x.fase, x.id + ': GUARD, la exhalación de rondas dura 2 s').toBe(2);
    expect(x.cabe, x.id + ': el «exhala» grave tiene que caber en su exhalación').toBe(true);
  }
});

test('por Web Audio, la voz calla 100 ms después de la palabra y no llega al chasquido del final', async ({ page }) => {
  expect(await preparar(page), 'GUARD: las tres palabras de bradford, listas').toBe(true);
  const r = await page.evaluate(async () => {
    const ctx = window.paceAudioCtx();
    await ctx.resume();
    /* lo que se programa: el punto de entrada y el de parada de cada fuente */
    const Fuente = Object.getPrototypeOf(ctx.createBufferSource());
    const empezar = Fuente.start, parar = Fuente.stop;
    const fuentes = [];
    Fuente.start = function (cuando, desde) { fuentes.push({ f: this, cuando, desde }); return empezar.apply(this, arguments); };
    Fuente.stop = function (cuando) { const x = fuentes.find((y) => y.f === this); if (x && x.para == null) x.para = cuando; return parar.apply(this, arguments); };
    const sono = paceVozIntenta('breathe.exhale', 6);
    const x = fuentes[fuentes.length - 1];
    const ficha = window.PACE_VOZ_CLIPS.es.bradford['breathe.exhale'];
    return { sono, desde: x.desde, suena: x.para - x.cuando, fin: ficha.fin, ini: ficha.ini, cola: window.PACE_VOZ_COLA,
      archivo: x.f.buffer.duration };
  });
  expect(r.sono).toBe(true);
  expect(r.fin, 'la palabra acaba a los 1,309 s').toBe(1.309);
  expect(r.cola).toBe(0.1);
  /* suena la palabra entera, desde su entrada hasta `fin`... */
  expect(r.desde + r.suena, 'la palabra tiene que sonar entera').toBeGreaterThan(r.fin);
  /* ...y para en fin + cola (+ los 10 ms que deja `stop` tras el fundido), lejos del final del archivo */
  expect(r.desde + r.suena, 'la voz sigue sonando detrás de la palabra').toBeLessThanOrEqual(r.fin + r.cola + 0.011);
  expect(r.archivo - (r.desde + r.suena), 'GUARD: el chasquido está en el último cuarto de segundo del archivo').toBeGreaterThan(2);
});

test('por el <audio>, sin Web Audio, la voz también se para detrás de la palabra', async ({ page }) => {
  expect(await preparar(page), 'GUARD: las tres palabras de bradford, listas').toBe(true);
  const r = await page.evaluate(() => {
    window.paceAudioCtx = () => null;
    const esperas = [];
    const poner = window.setTimeout;
    window.setTimeout = function (fn, ms) { esperas.push(ms); return poner.apply(window, arguments); };
    let sono;
    try { sono = paceVozIntenta('breathe.exhale', 6); } finally { window.setTimeout = poner; }
    return { sono, esperas, desde: Math.max(0, 0.108 - 0.04) };
  });
  expect(r.sono).toBe(true);
  /* una sola espera programada: la que pausa el <audio> en fin + cola */
  const corte = (1.309 + 0.1 - r.desde) * 1000;
  expect(r.esperas.some((ms) => Math.abs(ms - corte) < 5), 'nadie pausa el <audio> al acabar la palabra: ' + JSON.stringify(r.esperas)).toBe(true);
});
