/* PACE · tests/respira-voz-suspiro.spec.js
   =========================================
   «MÁS» Y «MORE», EL SEGUNDO TRAMO DEL SUSPIRO FISIOLÓGICO (9 nov. 2026). Hasta ahora «Inhala más» (1 s)
   sonaba con el tono, porque ninguna voz suena en una fase de 1 s (Ez, 14 oct.): así Bhastrika y
   Kapalabhati no dicen «Inhala» noventa veces. Ez grabó una palabra propia para ese segundo.

   QUÉ DEFIENDE:
   - «Inhala más» pide su propia señal (`breathe.inhale.more`), y «Inhala» sigue pidiendo la suya;
   - la palabra cabe en su fase de 1 s con las dos voces en los dos idiomas; el «More» de sulafat, cortado
     en 1,08 s (la cola de la «r», a −40 dB o menos, sigue sonando detrás con `PACE_VOZ_COLA`);
   - «Inhala» en una fase de 1 s (Bhastrika, Kapalabhati) sigue sin voz, con cualquier voz e idioma;
   - estas tomas vienen más fuertes que las demás y suenan con su volumen bajado (`vol`).
   Quitar la excepción de la fase corta, devolver «Inhala más» a `breathe.inhale` o subir el volumen a 1
   la tiran.

   NO CUBRE: cómo suena. Playwright no escucha; eso lo oye Ez.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const CASOS = [
  { lang: 'es', voice: 'sulafat', cabe: true, vol: 0.56 },
  { lang: 'es', voice: 'bradford', cabe: true, vol: 0.47 },
  { lang: 'en', voice: 'sulafat', cabe: true, vol: 0.75 },
  { lang: 'en', voice: 'bradford', cabe: true, vol: 1 },
];

async function listos(page) {
  return page.evaluate(async () => {
    const v = paceVozInit(paceVozActiva());
    const hasta = Date.now() + 8000;
    while (Date.now() < hasta && !Object.keys(v).every((k) => v[k].listo)) await new Promise((res) => setTimeout(res, 100));
    return Object.keys(v).every((k) => v[k].listo);
  });
}

for (const c of CASOS) {
  test(`${c.lang} ${c.voice}: «Más» ${c.cabe ? 'suena' : 'no cabe y suena el tono'} en su segundo, y «Inhala» de 1 s sigue sin voz`, async ({ page, context }) => {
    await sembrar(context, { lang: c.lang, voice: c.voice, voiceOn: true, soundOn: true });
    await irAlArtefacto(page);
    expect(await listos(page)).toBe(true);
    const r = await page.evaluate(() => ({
      mas: paceVozCabe('breathe.inhale.more', 1),
      inhalaCorta: paceVozCabe('breathe.inhale', 1),
      vol: paceVozInit(paceVozActiva())['breathe.inhale.more'].vol,
    }));
    expect(r.mas).toBe(c.cabe);
    expect(r.inhalaCorta, 'Bhastrika y Kapalabhati siguen con el tono').toBe(false);
    expect(r.vol).toBe(c.vol);
  });
}

test('«Inhala más» pide su señal y «Inhala» la suya; las dos llevan la música al inhalar', async ({ page, context }) => {
  await sembrar(context, { lang: 'es', voice: 'sulafat', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  const pedidas = await page.evaluate(() => {
    const vistas = [];
    const original = window.playSound;
    window.playSound = function (nombre, dur) { vistas.push(nombre + '@' + dur); };
    try { playPhaseSound('Inhala', 2); playPhaseSound('Inhala más', 1); playPhaseSound('Exhala', 5); } finally { window.playSound = original; }
    return vistas;
  });
  expect(pedidas).toEqual(['breathe.inhale@2', 'breathe.inhale.more@1', 'breathe.exhale@5']);
});

test('el «Más» de bradford suena por Web Audio con su volumen bajado, no a 1', async ({ page, context }) => {
  await sembrar(context, { lang: 'es', voice: 'bradford', voiceOn: true, soundOn: true });
  await irAlArtefacto(page);
  await page.mouse.click(5, 5);   // el gesto que deja arrancar el contexto de audio
  const r = await page.evaluate(async () => {
    const v = paceVozInit('bradford');
    const hasta = Date.now() + 8000;
    while (Date.now() < hasta && !(v['breathe.inhale.more'].listo && v['breathe.inhale.more'].buffer)) await new Promise((res) => setTimeout(res, 100));
    await window.paceAudioCtx().resume();
    const subidas = [];
    const rampa = AudioParam.prototype.linearRampToValueAtTime;
    AudioParam.prototype.linearRampToValueAtTime = function (valor, t) { subidas.push(valor); return rampa.call(this, valor, t); };
    let suena;
    try { suena = paceVozIntenta('breathe.inhale.more', 1); } finally { AudioParam.prototype.linearRampToValueAtTime = rampa; }
    return { suena, techo: Math.max.apply(null, subidas) };
  });
  expect(r.suena).toBe(true);
  expect(r.techo).toBeCloseTo(0.47, 5);
});
