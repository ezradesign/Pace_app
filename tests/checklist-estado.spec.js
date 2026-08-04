/* PACE · checklist de cierre · items 4, 5, 6 y 7 — ESTADO (s154)
 * ==============================================================
 * «Hidratate: +/- funciona · persiste al recargar»
 * «Logros: primer logro desbloquea y muestra toast»   <- crash conocido si
 *                                                        falla Toast.jsx
 * «Tweaks: cambiar paleta cambia colores»
 * «Recargar -> estado persiste (localStorage)»
 */
'use strict';

const { test, expect } = require('@playwright/test');
const {
  sembrar, capturarErrores, irAlArtefacto, leerLogros, contarSellos, overlaySuperior,
} = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

const aguaDelEstado = page => page.evaluate(() =>
  (JSON.parse(localStorage.getItem('pace.state.v2') || '{}').water || {}).today);

test('Hidratate: + y - mueven el contador, y el vaso sobrevive a la recarga', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  await page.getByRole('button', { name: /^Hidrátate/ }).click();
  const agua = overlaySuperior(page);
  await expect(agua.getByText('VASOS HOY')).toBeVisible();
  await expect(agua.getByText(/0\s*\/\s*8/)).toBeVisible();

  await agua.getByRole('button', { name: 'Un vaso más' }).click();
  await agua.getByRole('button', { name: 'Un vaso más' }).click();
  await expect(agua.getByText(/2\s*\/\s*8/)).toBeVisible();
  expect(await aguaDelEstado(page)).toBe(2);

  /* El menos tambien: sin esto, «+/- funciona» solo prueba la mitad. */
  await agua.getByRole('button', { name: 'Un vaso menos' }).click();
  await expect(agua.getByText(/1\s*\/\s*8/)).toBeVisible();
  expect(await aguaDelEstado(page)).toBe(1);

  /* ITEM 7 · RECARGAR -> EL ESTADO PERSISTE. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(await aguaDelEstado(page)).toBe(1);
  await page.getByRole('button', { name: /^Hidrátate/ }).click();
  await expect(overlaySuperior(page).getByText(/1\s*\/\s*8/)).toBeVisible();

  expect(errores).toEqual([]);
});

test('Logros: el primer sello se gana al instante, se anuncia y sobrevive a la recarga', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  expect(await leerLogros(page)).toBe('0/88');

  await page.getByRole('button', { name: /^Hidrátate/ }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Un vaso más' }).click();

  /* EL AVISO. Desde s145 `unlockAchievement` ENCOLA y el aviso se escalona: lo
     drena un cierre de sesion. El vaso de agua es la unica accion que acredita
     sin pasarlo, y por eso drena su propia cola (state-hydrate.jsx:70). El
     toast vive 3 s, asi que se aserta aqui y no despues. */
  const toast = page.locator('div[aria-live="polite"][aria-atomic="true"]');
  await expect(toast).toContainText('Nuevo sello');
  await expect(toast).toContainText('Primer sorbo');

  /* SE GANA AL INSTANTE (§2.5 «progreso sin culpa»): el contador ya subio. */
  await expect.poll(() => leerLogros(page)).toBe('1/88');
  expect(await page.evaluate(() =>
    !!(JSON.parse(localStorage.getItem('pace.state.v2') || '{}').achievements || {})['first.sip']
  )).toBe(true);

  /* Y sobrevive a la recarga. */
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  expect(await leerLogros(page)).toBe('1/88');

  expect(errores).toEqual([]);
});

test('Logros: el modal pinta las mascaras que el catalogo implica, ni una mas', async ({ page }) => {
  await irAlArtefacto(page);
  /* Se desbloquea algo primero para que la miniatura del sidebar pinte y la
     diferencia con la pagina exista de verdad. */
  await page.getByRole('button', { name: /^Hidrátate/ }).click();
  await overlaySuperior(page).getByRole('button', { name: 'Un vaso más' }).click();
  await expect.poll(() => leerLogros(page)).toBe('1/88');
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  await page.getByRole('button', { name: 'Ver logros' }).click();
  await expect(page.locator('[data-pace-modal-title]')).toHaveText('Logros');

  /* RELACIONAL, no censo: el numero se DERIVA del catalogo vivo con la regla de
     s152 —«58 mascaras menos los secretos con mascara aun bloqueados»—, asi que
     anadir arte no pone esto rojo, pero que `renderGlyph` deje de resolver
     mascaras, si. */
  const esperado = await page.evaluate(() => {
    const cat = window.ACHIEVEMENT_CATALOG || [];
    const ganados = JSON.parse(localStorage.getItem('pace.state.v2') || '{}').achievements || {};
    return cat
      .filter(a => window.achievementMaskUrl && window.achievementMaskUrl(a.id))
      .filter(a => !(a.secret && !ganados[a.id]))
      .length;
  });
  expect(esperado, 'el catalogo no declaro ni una mascara: banco roto').toBeGreaterThan(0);

  const enModal = await contarSellos(page, true);
  expect(enModal).toBe(esperado);

  /* LA TRAMPA DE s152, asertada en vez de sorteada: contar sobre la pagina da
     de mas, porque la miniatura del sidebar pinta por el MISMO `renderGlyph`.
     Quien cuente sin acotar al modal medira otra cosa. */
  const enPagina = await contarSellos(page, false);
  expect(enPagina).toBeGreaterThan(enModal);
});

test('Tweaks: cambiar de paleta cambia los colores de verdad', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);

  const colores = () => page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return {
      paleta: document.documentElement.getAttribute('data-palette'),
      fondo: cs.backgroundColor,
      tinta: cs.color,
    };
  });

  /* Crema dia — los tokens `--paper` / `--ink` de DESIGN_SYSTEM. */
  expect(await colores()).toEqual({
    paleta: 'crema', fondo: 'rgb(242, 237, 224)', tinta: 'rgb(31, 28, 23)',
  });

  await page.getByRole('button', { name: 'Abrir tweaks' }).click();
  await page.getByRole('button', { name: 'Oscuro noche' }).click();

  /* Oscuro noche. No basta con que cambie el atributo: se comprueba el color
     COMPUTADO, que es lo unico que prueba que la hoja de tokens se aplico. */
  await expect.poll(colores).toEqual({
    paleta: 'oscuro', fondo: 'rgb(29, 26, 20)', tinta: 'rgb(237, 229, 211)',
  });

  expect(errores).toEqual([]);
});
