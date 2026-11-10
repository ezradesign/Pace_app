/* PACE · E2E · LA FRASE DEL DÍA, REPARTIDA (Ez, 1A de la caza de los seis anchos, 9 nov. 2026)
 * ======================================================================================
 * En el móvil, a 360 px y en castellano, «De 9:00 a 17:00 · comida 14:00 · 1 h» partía justo antes
 * de la duración de la comida y dejaba «1 h» sola en la segunda línea. Ez eligió repartirla en dos
 * líneas parecidas sin cambiar el texto (text-wrap: balance en .pace-rt-frase).
 *
 * LO QUE DEFIENDE: a 360 px en castellano la última línea mide al menos el 40 % de la primera. Sin el
 * arreglo cae: la última línea, «1 h», mide un 13 % de la primera. Las de 320, 390 y 768 px, en los dos
 * idiomas, son de cobertura (pasan con y sin el arreglo): la frase no gana líneas (tres a 320, dos
 * desde 360) y, desde 360, la home no pide scroll.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const NUEVE = new Date(2026, 10, 5, 9, 0);
const DIA = { fecha: '2026-11-05', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

async function abrir(page, context, lang, ancho, alto) {
  await page.setViewportSize({ width: ancho, height: alto });
  await sembrar(context, { lang, sidebarCollapsed: true, ritmo: { dia: DIA, horario: HORARIO } });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

/* Las líneas de la frase visible: ancho de cada una, y el scroll de la página. */
const lineas = (page) => page.evaluate(() => {
  const el = [...document.querySelectorAll('.pace-rt-frase')].find((x) => x.getClientRects().length && x.textContent.trim());
  const rg = document.createRange();
  rg.selectNodeContents(el);
  const filas = new Map();
  for (const r of rg.getClientRects()) {
    if (r.width < 1) continue;
    const k = Math.round((r.top + r.bottom) / 2 / 6);
    const f = filas.get(k) || { l: Infinity, r: -Infinity };
    f.l = Math.min(f.l, r.left); f.r = Math.max(f.r, r.right);
    filas.set(k, f);
  }
  const anchos = [...filas.keys()].sort((a, b) => a - b).map((k) => Math.round(filas.get(k).r - filas.get(k).l));
  const d = document.scrollingElement;
  return { texto: el.textContent.replace(/\s+/g, ' ').trim(), anchos, scroll: d.scrollHeight - d.clientHeight };
});

test('360×640 en castellano: «1 h» ya no se queda sola en la segunda línea', async ({ page, context }) => {
  await abrir(page, context, 'es', 360, 640);
  const m = await lineas(page);
  expect(m.texto, 'GUARD: es la frase de la jornada con su comida').toMatch(/comida.*1 h/);
  expect(m.anchos.length, 'GUARD: a 360 px la frase va en dos líneas').toBe(2);
  expect(m.anchos[1] / m.anchos[0]).toBeGreaterThan(0.4);
  expect(m.scroll).toBe(0);
});

for (const lang of ['es', 'en']) for (const [ancho, alto] of [[320, 568], [360, 640], [390, 844], [768, 1024]]) {
  test(`${ancho}×${alto} en ${lang}: la frase no gana líneas y, desde 360, la home no pide scroll`, async ({ page, context }) => {
    await abrir(page, context, lang, ancho, alto);
    const m = await lineas(page);
    /* A 320 px ya iba en tres líneas antes del arreglo; desde 360, en dos. */
    expect(m.anchos.length).toBeLessThanOrEqual(ancho < 360 ? 3 : 2);
    for (const w of m.anchos) expect(w).toBeGreaterThan(20);
    if (ancho >= 360) expect(m.scroll).toBe(0);
  });
}
