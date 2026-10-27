/* PACE · E2E · SI LA VOZ NO ARRANCA, SUENA EL TONO (auditoría externa del 21 oct. 2026 · v0.181.0)
 * ================================================================================================
 * La voz de Respira suena por Web Audio y, si no puede (sin el archivo descodificado o con el
 * contexto parado), por un `<audio>`. `paceVozIntenta` contestaba «sí» en cuanto llamaba a
 * `play()`, que es asíncrono: si `play()` fallaba después, ni sonaba la voz ni `playSound` tocaba
 * el tono de respaldo, porque ya le habían dicho que la voz sonaba. Ahora el rechazo de `play()`
 * toca el tono. NO CUBRE si suena de verdad: Playwright no escucha; se cuentan las fuentes
 * de sonido que crea el sintetizador. Calibrado en ROJO contra el `index.html` de v0.179.0.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

/* Los clips listos y sin Web Audio (el camino del `<audio>`), `play()` como diga `falla`, y
   las fuentes de sonido contadas desde aquí (el tono de inhalar es ruido filtrado). */
async function vozPorAudio(page, falla) {
  await page.evaluate(async (fallar) => {
    const v = paceVozInit();
    const hasta = Date.now() + 6000;
    while (Date.now() < hasta && !Object.keys(v).every((k) => v[k].listo)) await new Promise((r) => setTimeout(r, 100));
    Object.keys(v).forEach((k) => { v[k].buffer = null; });
    HTMLMediaElement.prototype.play = fallar
      ? function () { return Promise.reject(new DOMException('sin permiso', 'NotAllowedError')); }
      : function () { return Promise.resolve(); };
    window.__fuentes = 0;
    ['createOscillator', 'createBufferSource'].forEach((m) => {
      const crear = BaseAudioContext.prototype[m];
      BaseAudioContext.prototype[m] = function () { window.__fuentes++; return crear.apply(this, arguments); };
    });
  }, falla);
}

async function inhalaYCuenta(page) {
  return page.evaluate(async () => {
    playSound('breathe.inhale', 4);
    await new Promise((r) => setTimeout(r, 200));
    return window.__fuentes;
  });
}

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: true, voiceOn: true }); });

test('si el <audio> de la voz no arranca, suena el tono de la fase', async ({ page }) => {
  await irAlArtefacto(page);
  await vozPorAudio(page, true);
  expect(await inhalaYCuenta(page), 'ni voz ni tono: la fase se quedó muda').toBeGreaterThan(0);
});

test('CONTROL: si el <audio> arranca, suena la voz y no el tono', async ({ page }) => {
  await irAlArtefacto(page);
  await vozPorAudio(page, false);
  expect(await inhalaYCuenta(page)).toBe(0);
});
