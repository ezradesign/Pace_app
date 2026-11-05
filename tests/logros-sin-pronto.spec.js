/* PACE · E2E · UN LOGRO SIN DETECTOR NO SE VE NI SE CUENTA (Ez, 5 nov. 2026)
 * ===========================================================================
 * La colección decía «2 / 83 Disponibles · 8 Próximamente», y esos ocho llevaban el sello
 * «Pronto»: una promesa sin fecha, lo que los textos de PACE ya no hacen (paquete T, 0.188.0).
 * Ez: «Esto de los logros imagino que puede sobrar». Ahora un logro sin detector no sale en
 * el panel ni en la cuenta de su familia, y aparece solo el día que su id entra en
 * `IMPLEMENTED_ACHIEVEMENTS`. Quien ya lo tenga lo sigue viendo, como los de ATG y Ancestral.
 *
 * Relacional: los ids sin detector se leen del catálogo vivo, no de una lista escrita aquí.
 * Contra el código de antes caen las tres.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto } = require('./helpers');

async function abrirLogros(page) {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop] [data-pace-ach]', { timeout: 10_000 });
}

function leerPanel(page) {
  return page.evaluate(() => {
    const panel = document.querySelector('[data-pace-modal-backdrop]');
    const cuenta = panel.querySelector('[data-pace-ach-cuenta]');
    return {
      sinDetector: window.ACHIEVEMENT_CATALOG.filter((a) => !window.achievementIsAvailable(a)).map((a) => a.id),
      disponibles: window.ACHIEVEMENTS_AVAILABLE,
      pintados: [...panel.querySelectorAll('[data-pace-ach]')].map((el) => el.getAttribute('data-pace-ach')),
      denominador: cuenta ? Number((cuenta.textContent.match(/\/\s*(\d+)/) || [])[1]) : null,
      familias: [...panel.querySelectorAll('[data-pace-ach-cat]')].map((c) => ({
        cat: c.getAttribute('data-pace-ach-cat'),
        total: Number((c.querySelector('h3').parentElement.textContent.match(/\/\s*(\d+)/) || [])[1]),
        tarjetas: c.querySelectorAll('[data-pace-ach]').length,
      })),
      texto: panel.textContent,
    };
  });
}

test('sin detector, un logro no sale en Logros, no cuenta y nada dice «Pronto»', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirLogros(page);
  const r = await leerPanel(page);

  expect(r.sinDetector.length, 'ya no queda ningún logro sin detector: esta prueba no mide nada').toBeGreaterThan(0);
  expect(r.pintados.filter((id) => r.sinDetector.includes(id)), 'se pinta un logro que nadie puede ganar').toEqual([]);
  expect(r.pintados.length, 'el panel enseña otra cosa que lo que cuenta').toBe(r.disponibles);
  expect(r.denominador, 'la cuenta de arriba').toBe(r.disponibles);
  for (const f of r.familias) expect(f.total, 'la cuenta de «' + f.cat + '» suma tarjetas que no se ven').toBe(f.tarjetas);
  expect(r.texto).not.toMatch(/Próximamente|Pronto/);
  expect(errores).toEqual([]);
});

test('en inglés tampoco queda «Coming soon» ni «Soon»', async ({ page, context }) => {
  await sembrar(context, { lang: 'en' });
  await irAlArtefacto(page);
  await abrirLogros(page);
  const r = await leerPanel(page);
  expect(r.texto).toContain('Stamps collected');
  expect(r.texto).not.toMatch(/Coming soon|\bSoon\b/);
});

test('quien ya tiene uno sin detector lo sigue viendo, ganado', async ({ page, context }) => {
  await sembrar(context, { achievements: { 'season.spring': { unlockedAt: 1760000000000 } } });
  await irAlArtefacto(page);
  await abrirLogros(page);
  const r = await leerPanel(page);
  expect(r.sinDetector).toContain('season.spring');
  expect(r.pintados).toContain('season.spring');
  expect(r.pintados.filter((id) => id !== 'season.spring' && r.sinDetector.includes(id))).toEqual([]);
  const estacionales = r.familias.find((f) => f.cat === 'estacionales');
  expect(estacionales.total).toBe(estacionales.tarjetas);
  await expect(page.locator('[data-pace-ach="season.spring"]')).toHaveCSS('opacity', '1');
});
