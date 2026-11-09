/* PACE · E2E · EL LATERAL DE LA BIBLIOTECA, MÁS ALTO QUE LA VENTANA (caza de los seis anchos, 9 nov. 2026)
 * ==================================================================================================
 * En el ordenador, la columna de la izquierda de Mueve y Estira (filtros, «Tus rutinas» y «Para
 * ahora») va pegada arriba al bajar por el catálogo. Con rutinas propias mide más que la ventana de
 * Ez (865 px de columna en 612 de hueco a 1280×720 con dos rutinas) y lo de abajo no se veía hasta el
 * final del catálogo: «+ Crear rutina» se quedaba a un tercio, también al llegar con el Tab.
 *
 * LO QUE DEFIENDE: con el Tab en «+ Crear rutina» el botón se ve entero y es lo que hay encima en su
 * centro, con dos rutinas y con cinco; y sin rutinas, la columna sigue pegada arriba como siempre
 * (`top` vacío). Sin el arreglo (`usePaceLateralPegado`) caen las dos de dos rutinas: el botón se
 * queda al 36 % (1280×720) y al 29 % (1536×710). La de cinco pasa también sin él (el Tab recorre las
 * cinco y el catálogo baja hasta el final, donde la columna ya se ve): está por cobertura, no por defensa.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, fijarViewport } = require('./helpers');

const rutinas = (n) => Array.from({ length: n }, (_, i) => ({
  id: 'custom.17600000000' + i, name: 'Rutina ' + (i + 1),
  steps: [{ name: 'Encogimiento de hombros', dur: 20, cue: '' }, { name: 'Giro sentado', dur: 20, cue: '' }],
  createdAt: 1760000000000 + i, updatedAt: 1760000000000 + i,
}));

async function abrirMueve(page, context, n, ancho, alto) {
  await sembrar(context, { customRoutines: rutinas(n) });
  await irAlArtefacto(page);
  await fijarViewport(page, ancho, alto);
  await page.getByRole('button', { name: /^Mueve/ }).filter({ visible: true }).first().click();
  await page.locator('aside.pace-lib-lateral').filter({ visible: true }).waitFor();
  await page.waitForTimeout(400);
}

/* El botón en la caja que se ve del catálogo, y lo que hay en su centro. */
const comoSeVe = (page) => page.evaluate(() => {
  const b = [...document.querySelectorAll('aside.pace-lib-lateral [data-pace-custom-crear]')].find((x) => x.getClientRects().length);
  let sc = b.parentElement;
  while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
  const r = b.getBoundingClientRect(), s = sc.getBoundingClientRect();
  const visto = Math.max(0, Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top)) / r.height;
  const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { foco: document.activeElement === b, visto: Math.round(visto * 100), encima: !!e && (e === b || b.contains(e)) };
});

for (const [ancho, alto, n] of [[1280, 720, 2], [1536, 710, 2], [1280, 720, 5]]) {
  test(`${ancho}×${alto} con ${n} rutinas: «+ Crear rutina» se ve entero al llegar con el Tab`, async ({ page, context }) => {
    await abrirMueve(page, context, n, ancho, alto);
    let f = null;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      f = await comoSeVe(page);
      if (f.foco) break;
    }
    expect(f.foco, 'GUARD: el Tab llega a «+ Crear rutina»').toBe(true);
    await page.waitForTimeout(200);
    f = await comoSeVe(page);
    expect(f.visto).toBe(100);
    expect(f.encima).toBe(true);
  });
}

test('1280×720 sin rutinas: el lateral cabe y sigue pegado arriba como siempre', async ({ page, context }) => {
  await abrirMueve(page, context, 0, 1280, 720);
  const top = await page.locator('aside.pace-lib-lateral').filter({ visible: true }).evaluate((e) => e.style.top);
  expect(top).toBe('');
});
