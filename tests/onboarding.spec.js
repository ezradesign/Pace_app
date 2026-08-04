/* PACE · el onboarding de primera vez (s154)
 * ==========================================
 * No es un item del checklist de cierre, pero es la PUERTA de todos los demas:
 * con estado limpio la app arranca AQUI, no en la home. Si esto se rompe, el
 * resto de la suite falla por una razon que no es la suya.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, RUTA_ARTEFACTO } = require('./helpers');

test('con estado limpio la app abre EN el onboarding, montado sobre la home', async ({ page }) => {
  const errores = capturarErrores(page);

  /* Sin sembrar: `firstSeen` nace `null` (state-core.jsx:125) y eso es lo que
     abre el flujo (Onboarding.jsx:36). */
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  expect(await page.evaluate(() => localStorage.getItem('pace.state.v2'))).toBeNull();

  /* La bienvenida, por sus piezas y no por un recorte de texto. */
  await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'prefiero saltarlo' })).toBeVisible();

  /* La placa de tres valores de s151, con el copy que NO promete absolutos. */
  await expect(page.getByText('Todo local', { exact: true })).toBeVisible();
  await expect(page.getByText('Sin cuentas', { exact: true })).toBeVisible();
  await expect(page.getByText('Núcleo gratuito', { exact: true })).toBeVisible();

  /* LA TRAMPA DE s153, convertida en aserto: el onboarding se monta AL FINAL
     del DOM (main.jsx:318), DETRAS en el arbol y DELANTE en pantalla. Leer un
     `innerText` recortado hizo reportar que no aparecia, y era falso. Aqui se
     comprueba que las dos cosas coexisten y en que orden. */
  const detrasDeLaHome = await page.evaluate(() => {
    const home = document.querySelector('[data-pace-home-body]');
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => (b.innerText || '').trim() === 'Comenzar');
    if (!home || !btn) return null;
    return !!(home.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(detrasDeLaHome).toBe(true);

  expect(errores).toEqual([]);
});

test('con firstSeen sembrado la app abre en la HOME y el onboarding no aparece', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);

  await expect(page.getByRole('button', { name: 'Empezar foco' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Comenzar' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'prefiero saltarlo' })).toHaveCount(0);
});
