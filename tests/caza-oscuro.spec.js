/* PACE · el modo oscuro, tras la caza de bugs del 7 de octubre
 * ============================================================
 * Una prueba por arreglo (oscuro-2, 3, 5 y 6 de `docs/traspaso/CAZA_BUGS_7OCT.md`).
 * Los colores se leen pintados y se componen sobre lo que tienen detrás, como el
 * escáner de contraste de la caza: el número del filtro activo era crema sobre
 * crema (1,05:1) y el sello «Premium» bronce sobre marrón (2,7:1).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const OSCURO = { palette: 'oscuro' };

/* Contraste WCAG del texto de `el` sobre el fondo que se ve detrás: se suben los
   ancestros hasta un fondo opaco y se componen las capas. Va al navegador entera
   (Playwright serializa la función), así que no usa nada de fuera. */
function contrasteDe(el) {
  const leer = (s) => {
    let m = /^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/.exec(s);
    if (m) return [m[1] * 255, m[2] * 255, m[3] * 255, m[4] === undefined ? 1 : +m[4]];
    m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : [0, 0, 0, 0];
  };
  const sobre = (a, b) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
  const capas = [];
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const c = leer(getComputedStyle(n).backgroundColor);
    if (c[3] > 0) capas.push(c);
    if (c[3] >= 1) break;
  }
  let fondo = [255, 255, 255, 1];
  for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
  const tinta = sobre(leer(getComputedStyle(el).color), fondo);
  const lum = (c) => { const v = c.slice(0, 3).map((k) => { k /= 255; return k <= 0.03928 ? k / 12.92 : Math.pow((k + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const a = lum(tinta), b = lum(fondo);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/* oscuro-2 */
test('oscuro-2 · el número del filtro activo se lee en oscuro', async ({ page, context }) => {
  await sembrar(context, OSCURO);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  const chip = page.locator('.pace-lib-chip').filter({ hasText: '≤ 5 min' }).first();
  await chip.click();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(300);
  const c = await chip.locator('b').evaluate(contrasteDe);
  expect(c, 'el número desaparece (crema sobre crema)').toBeGreaterThanOrEqual(4.5);
});

/* oscuro-3 */
test('oscuro-3 · la barra del navegador toma el papel de la paleta', async ({ page, context }) => {
  await sembrar(context, OSCURO);
  await irAlArtefacto(page);
  const meta = page.locator('meta[name="theme-color"]');
  await expect(meta).toHaveAttribute('content', '#1d1a14');
  await page.evaluate(() => setState({ palette: 'crema' }));
  await expect(meta).toHaveAttribute('content', '#F2EDE0');
});

/* oscuro-5 */
test('oscuro-5 · el sello «Premium» y el bronce se leen en oscuro', async ({ page, context }) => {
  await sembrar(context, OSCURO);
  await irAlArtefacto(page);
  const sello = page.locator('span', { hasText: /^Premium$/ }).filter({ visible: true }).first();
  await expect(sello).toBeVisible();
  expect(await sello.evaluate(contrasteDe), 'sello de la barra lateral').toBeGreaterThanOrEqual(4.5);
  /* Y el «· Premium» de las tarjetas de Respira, sobre su papel. */
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
  /* Los textos pintados en el bronce de --premium, sea cual sea su forma. */
  const medidos = await page.locator('.pace-lib').first().evaluate((lib, fn) => {
    const f = new Function('return (' + fn + ')')();
    const sonda = document.createElement('i');
    sonda.style.color = 'var(--premium)'; lib.appendChild(sonda);
    const bronce = getComputedStyle(sonda).color; sonda.remove();
    return [...lib.querySelectorAll('*')]
      .filter((e) => e.getBoundingClientRect().width > 0 && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
      .filter((e) => getComputedStyle(e).color === bronce).map(f);
  }, contrasteDe.toString());
  expect(medidos.length, 'GUARD: no se encontró ningún texto en bronce').toBeGreaterThan(0);
  medidos.forEach((c) => expect(c, 'un «Premium» en bronce por debajo de 4,5:1').toBeGreaterThanOrEqual(4.5));
});

/* oscuro-6 */
test('oscuro-6 · el mes de Estadísticas dice «Octubre de 2026», no «Octubre De 2026»', async ({ page, context }) => {
  await sembrar(context, OSCURO);
  await irAlArtefacto(page);
  await page.keyboard.press('s');
  await page.getByRole('button', { name: 'Mes', exact: true }).click();
  const titulo = page.getByRole('button', { name: 'Mes anterior' }).locator('xpath=following-sibling::span[1]');
  const visto = await titulo.evaluate((el) => el.innerText);
  expect(visto, 'cada palabra en mayúscula').toMatch(/^\p{Lu}\p{Ll}+ de \d{4}$/u);
});
