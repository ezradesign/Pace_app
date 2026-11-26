/* PACE · E2E · LA AUDITORÍA DE LA EXPERIENCIA DEL 24 NOV. 2026
 * ==============================================================
 * Las letras de Ez sobre la página «Auditoría de la experiencia»: «todo lo recomendado» (U1A U2A U3B U4A
 * U5B U6A). U3B y U5B dejan las cosas como están. U2A (la frase de la bienvenida) la lee
 * textos-caza-22nov.spec.js; U6A (ningún texto sin pantalla) la vigila verify.sinpantalla.js. Aquí:
 *
 *   U1A El Foco a mano cuenta en bloques, como la jornada: «Bloque 1 de 4», y al acabar «Bloque terminado».
 *       Decía «Ciclo 1 / 4» y «Ciclo completado»: la misma cosa con dos nombres según el modo.
 *   U4A En la bienvenida, a 375 px, «19,99 € una vez.» no se parte: dejaba «vez.» sola en la última línea.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

test.use({ serviceWorkers: 'block' });

for (const [lang, aro, fin] of [['es', 'Bloque 1 de 4', 'Bloque terminado'], ['en', 'Block 1 of 4', 'Block done']]) {
  test(`U1A · ${lang}: el Foco a mano dice «${aro}» y, al acabar, «${fin}»`, async ({ page, context }) => {
    await sembrar(context, { lang, ritmo: { libre: true } });
    await page.clock.install({ time: new Date('2026-11-24T10:00:00+01:00') });
    await irAlArtefacto(page);
    const ciclo = page.locator('[data-pace-ciclo]').filter({ visible: true }).first();
    await expect(ciclo).toHaveText(aro);
    expect(await page.evaluate(() => document.body.innerText), 'aún dice «ciclo» en algún sitio que se ve').not.toMatch(/Ciclo|Cycle/i);
    /* Al acabar el bloque, lo que dice el aro (la ventana de la pausa ya decía «Bloque terminado»). */
    expect(await page.evaluate(() => window.PACE_STRINGS[window.getState().lang]['focus.cycleComplete'])).toBe(fin);
  });
}

test('U4A · a 375 px, «19,99 € una vez.» va en la misma línea que el precio', async ({ page, context }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await sembrar(context);
  await irAlArtefacto(page);
  /* La pantalla de PACE completo, que desde el 26 nov. 2026 sale tras la primera pausa. */
  await page.evaluate(() => window.paceAbrirCompleto());
  const precios = page.locator('[data-pace-onb-precios]');
  await expect(precios).toContainText('una vez');
  const r = await precios.evaluate((el) => {
    /* La línea de cada palabra: el top del rectángulo de su primer carácter. */
    const tn = [...el.childNodes].map((n) => n.textContent).join('');
    const linea = (palabra) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n, base = 0;
      while ((n = walker.nextNode())) {
        const i = n.textContent.indexOf(palabra);
        if (i !== -1) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1); return Math.round(rg.getBoundingClientRect().top); }
        base += n.textContent.length;
      }
      return null;
    };
    return { texto: tn, precio: linea('19,99'), una: linea('una'), vez: linea('vez') };
  });
  expect(r.precio, 'GUARD: sale el precio de por vida ' + r.texto).not.toBeNull();
  expect(r.vez, '«vez.» sola en otra línea: ' + r.texto).toBe(r.una);
  expect(r.una, '«una vez» separado del precio: ' + r.texto).toBe(r.precio);
});
