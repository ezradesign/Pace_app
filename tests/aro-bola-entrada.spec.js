/* PACE · E2E · LA BOLA DEL ARO NACE ENTERA
 * ===================================================
 * Ez, 8 oct. 2026: «cuando empieza el pomodoro la bola y el halo que marcan el
 * tiempo recorrido empiezan como por debajo, como si el fondo se superpusiera».
 *
 * La causa: el punto guia vivia dentro de [data-pace-dial-ring], la capa que
 * lleva la niebla del horizonte, y al empezar se para justo en la linea donde
 * esa mascara llega a cero. Salia partido por la mitad (la de abajo no se
 * pintaba) y a medio tono. Ahora va en su propia capa, por encima, y entra con
 * un fundido solo al empezar el bloque (opcion A, elegida por Ez).
 *
 * COMO SE MIDE: dos capturas del MISMO momento, con la bola y sin ella, y se
 * cuentan los pixeles que cambian por encima y por debajo de su centro. Una bola
 * entera cambia casi lo mismo arriba que abajo (el papel no es liso: 0,67 en
 * el peor caso medido); la de antes, nada abajo. Se mira con
 * «A tu ritmo» a 1920 (lo que vio Ez), por libre a 1280 y en el movil.
 *
 * Contra v0.147.0 falla en las tres pantallas (abajo cambiaban 0 pixeles).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const sharp = require('sharp');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const UNA_HORA = { dia: { fecha: FECHA, opcion: '1h', desde: 882, cicloBase: 0, cambios: {} } };

const PANTALLAS = [
  { nombre: '1920×1080 con «Una hora»', w: 1920, h: 1080, ritmo: UNA_HORA },
  { nombre: '1280×800 por libre', w: 1280, h: 800, ritmo: { libre: true } },
  { nombre: '360×718 móvil con «Una hora»', w: 360, h: 718, movil: true, ritmo: UNA_HORA },
];

/* Pixeles que cambian entre dos capturas, por encima y por debajo de la fila
   del centro. Umbral bajo a proposito: el halo va al 22 % sobre el papel. */
async function cambios(a, b, centroY) {
  const [ra, rb] = await Promise.all([a, b].map((png) => sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  const { width, height, channels } = ra.info;
  let arriba = 0;
  let abajo = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const d = Math.abs(ra.data[i] - rb.data[i]) + Math.abs(ra.data[i + 1] - rb.data[i + 1]) + Math.abs(ra.data[i + 2] - rb.data[i + 2]);
      if (d <= 6) continue;
      if (y < centroY) arriba++; else if (y > centroY) abajo++;
    }
  }
  return { arriba, abajo };
}

for (const p of PANTALLAS) {
  test('al empezar, la bola y su halo salen enteros · ' + p.nombre, async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const context = await browser.newContext({ baseURL, viewport: { width: p.w, height: p.h },
      isMobile: !!p.movil, hasTouch: !!p.movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    await sembrar(context, { sidebarCollapsed: !!p.movil, ritmo: p.ritmo });
    const page = await context.newPage();
    const errores = capturarErrores(page);
    await page.clock.install({ time: new Date(FECHA + 'T14:42:00+02:00') });
    await irAlArtefacto(page);
    await page.mouse.move(1, 1);
    await asentarGeometria(page);
    await page.locator('[data-pace-cta]').filter({ visible: true }).first().click();
    /* El fundido (1,6 s, y el halo 2,2 s tras 0,2) corre en tiempo real, no en
       el reloj de la prueba. */
    await page.waitForTimeout(2800);

    const halo = page.locator('[data-pace-dial-fit] circle[r="1.7"]');
    await expect(halo, 'no hay bola con el Foco en marcha').toHaveCount(1);
    const caja = await halo.boundingBox();
    const m = 3;
    const clip = { x: Math.floor(caja.x - m), y: Math.floor(caja.y - m),
      width: Math.ceil(caja.width + 2 * m), height: Math.ceil(caja.height + 2 * m) };
    const centroY = Math.round(caja.y + caja.height / 2 - clip.y);

    const con = await page.screenshot({ clip });
    await page.evaluate(() => document.querySelectorAll('[data-pace-dial-fit] circle[r="1.7"], [data-pace-dial-fit] circle[r="0.85"]')
      .forEach((c) => { c.style.visibility = 'hidden'; }));
    const sin = await page.screenshot({ clip });
    const c = await cambios(con, sin, centroY);

    expect(c.arriba, 'la bola no se ve').toBeGreaterThan(10);
    expect(c.abajo / c.arriba,
      `la bola sale cortada: cambian ${c.arriba} px arriba y ${c.abajo} abajo`).toBeGreaterThan(0.5);
    /* La bola no puede ir dentro de la capa que lleva la niebla. */
    const enLaNiebla = await halo.evaluate((c) => !!c.closest('[data-pace-dial-ring]'));
    expect(enLaNiebla, 'la bola sigue dentro de la capa con la niebla del horizonte').toBe(false);

    /* Y llega con su fundido. */
    const fundido = await page.locator('[data-pace-dial-punto]').evaluate((el) => getComputedStyle(el).animationName);
    expect(fundido, 'la bola no entra con el fundido').toBe('pace-punto-nace');

    expect(errores).toEqual([]);
    await context.close();
  });
}

/* El fundido es del COMIENZO del bloque. A mitad de bloque (al recargar o al
   volver a la home) la bola ya existia y aparece en su sitio sin fundido. */
test('a mitad de bloque, al recargar, la bola no repite el fundido', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await sembrar(context);
  await page.clock.install({ time: new Date(FECHA + 'T14:42:00+02:00') });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(page.locator('[data-pace-dial-punto-nace]')).toHaveCount(1);
  await page.clock.fastForward(2 * 60 * 1000);
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await expect(page.locator('[data-pace-dial-punto]'), 'tras recargar no hay bola').toHaveCount(1);
  await expect(page.locator('[data-pace-dial-punto-nace]'), 'la bola repite el fundido a mitad de bloque').toHaveCount(0);
  expect(errores).toEqual([]);
});
