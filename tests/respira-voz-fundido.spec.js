/* PACE · tests/respira-voz-fundido.spec.js
   =========================================
   LA VOZ ENTRA Y SALE CON UN FUNDIDO DE 5 ms. Las palabras de bradford en
   castellano empiezan en el primer milisegundo del archivo y su «exhala» suena
   hasta el último: arrancarlas y cortarlas de golpe se oía como un clic entre
   palabra y palabra (Ez, 14 oct. 2026, en «Exhalación 4·6»).

   QUÉ DEFIENDE: que con el contexto de audio en marcha la palabra suene por Web
   Audio, con la ganancia de 0 a 1 en los primeros 5 ms y de 1 a 0 en los últimos,
   y no por el `<audio>`, que no tiene fundido. Y que sin Web Audio la voz siga
   sonando por el `<audio>`, como antes.

   NO CUBRE: si se oye el clic. Playwright no escucha; eso lo oye Ez.
*/
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context, { voice: 'bradford', voiceOn: true, soundOn: true }); });

/* Precarga bradford, espera a que cada palabra esté lista y descodificada, y
   espía las rampas de ganancia y el `play()` del `<audio>`. */
async function preparar(page) {
  await irAlArtefacto(page);
  await page.mouse.click(5, 5);   // el gesto que deja arrancar el contexto de audio
  return page.evaluate(async () => {
    const v = paceVozInit('bradford');
    const hasta = Date.now() + 8000;
    while (Date.now() < hasta && !Object.keys(v).every((k) => v[k].listo && v[k].buffer)) {
      await new Promise((res) => setTimeout(res, 100));
    }
    const ctx = window.paceAudioCtx();
    await ctx.resume();
    window.__rampas = [];
    window.__plays = 0;
    /* `paso` es lo que dura la rampa: desde el `setValueAtTime` que la precede en la
       misma ganancia. No se mide contra `ctx.currentTime`: el reloj de audio avanza
       solo, a bloques de ~2,9 ms, y en una máquina cargada se movió 4 bloques entre
       la lectura de la app y la de la prueba (−6,6 ms en el CI del 18 oct.). */
    const Ganancia = Object.getPrototypeOf(ctx.createGain().gain);
    const lineal = Ganancia.linearRampToValueAtTime;
    const fijar = Ganancia.setValueAtTime;
    const ultimoFijado = new WeakMap();
    Ganancia.setValueAtTime = function (valor, t) {
      ultimoFijado.set(this, t);
      return fijar.call(this, valor, t);
    };
    Ganancia.linearRampToValueAtTime = function (valor, t) {
      const desde = ultimoFijado.has(this) ? ultimoFijado.get(this) : ctx.currentTime;
      window.__rampas.push({ valor, paso: t - desde, dt: t - ctx.currentTime });
      return lineal.call(this, valor, t);
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__plays++; return play.call(this); };
    return { listos: Object.keys(v).every((k) => v[k].listo && v[k].buffer), estado: ctx.state };
  });
}

test('con el audio en marcha, cada palabra entra y sale con un fundido de 5 ms y no pasa por el <audio>', async ({ page }) => {
  const p = await preparar(page);
  expect(p.listos, 'GUARD: las tres palabras de bradford, listas y descodificadas').toBe(true);
  expect(p.estado, 'GUARD: el contexto de audio, en marcha').toBe('running');

  const r = await page.evaluate(() => {
    const out = {};
    for (const s of ['breathe.inhale', 'breathe.exhale']) {
      window.__rampas = [];
      const antes = window.__plays;
      out[s] = { sono: paceVozIntenta(s, 6), rampas: window.__rampas.slice(), plays: window.__plays - antes };
    }
    out.fundido = window.PACE_VOZ_FUNDIDO;
    return out;
  });
  expect(r.fundido).toBe(0.005);
  for (const s of ['breathe.inhale', 'breathe.exhale']) {
    const x = r[s];
    expect(x.sono, s + ' no sonó').toBe(true);
    expect(x.plays, s + ': sonó por el <audio>, sin fundido').toBe(0);
    /* la primera rampa sube a 1 en 5 ms; la última baja a 0 al final de la palabra */
    expect(x.rampas[0].valor, s + ': no entra con fundido').toBe(1);
    expect(x.rampas[0].paso, s + ': el fundido de entrada no dura 5 ms').toBeGreaterThan(0.003);
    expect(x.rampas[0].paso, s + ': el fundido de entrada no dura 5 ms').toBeLessThan(0.008);
    const ultima = x.rampas[x.rampas.length - 1];
    expect(ultima.valor, s + ': no sale con fundido').toBe(0);
    expect(ultima.dt, s + ': el fundido de salida tiene que llegar al final de la palabra').toBeGreaterThan(0.5);
  }
});

test('sin Web Audio la voz sigue sonando por el <audio>', async ({ page }) => {
  const p = await preparar(page);
  expect(p.listos, 'GUARD: las tres palabras de bradford, listas').toBe(true);
  const r = await page.evaluate(() => {
    window.paceAudioCtx = () => null;
    const antes = window.__plays;
    return { sono: paceVozIntenta('breathe.inhale', 6), plays: window.__plays - antes };
  });
  expect(r.sono).toBe(true);
  expect(r.plays, 'sin contexto de audio, la palabra tiene que sonar por el <audio>').toBe(1);
});
