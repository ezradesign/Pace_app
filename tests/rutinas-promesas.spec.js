/* PACE · lo que prometen las rutinas lo dan sus datos (16 oct. 2026)
 * ====================================================================
 * Ez encontró que la 2.ª ronda de «Gemelos subrepticios» decía «Más lentas
 * ahora» con el mismo ritmo que la 1.ª y menos repeticiones: duraba 40 s frente a
 * 50 y no era más lenta. El censo (`scripts/audit/censo-promesas.js`) encontró lo
 * mismo en «Sentadillas de silla» y bajadas «despacio» de 1 s en «Piernas de pie».
 * Ez eligió que sean de verdad más lentas. Esta prueba no abre el navegador: lee
 * los datos de Mueve y Estira y sus textos en los dos idiomas, y cae si un paso
 * vuelve a prometer un ritmo que no tiene.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { censo, PROHIBIDO } = require('../scripts/audit/censo-promesas.js');

test('ningún paso de Mueve ni de Estira promete un ritmo que sus datos no dan', () => {
  const { rutinas, pasos, hallazgos } = censo();
  expect(rutinas, 'el censo lee las rutinas de Mueve y Estira').toBeGreaterThan(30);
  expect(pasos, "GUARD: el censo lee los pasos (147 con las capas, Ez, 23 oct.: 2A)").toBeGreaterThan(130);
  const malos = hallazgos.filter(h => PROHIBIDO.includes(h.que))
    .map(h => h.id + ' · paso ' + h.paso + ': ' + h.que + ' (' + h.detalle + ')');
  expect(malos).toEqual([]);
});

test('la 2.ª ronda de Gemelos y la 2.ª serie de Sentadillas bajan en 3 s', () => {
  const { hallazgos } = censo();
  expect(hallazgos.filter(h => /extra\.(calves|chair\.squats)/.test(h.id))).toEqual([]);
});
