/* PACE · el punto de compra y el último paso de la bienvenida (Fase 6, 16 oct. 2026)
 * ==========================================
 * Toda compra pasa por `app/state-entitlement.jsx` (paceTiendaAbierta, paceTiendaPlanes,
 * paceComprar), con una tienda por canal (`app/state-compra.js`). Hoy las dos están
 * vacías y nada enseña un botón de compra: mientras PACE completo está abierto hasta v1, su
 * pantalla dice lo que costará después, con un solo botón (Ez, 2A del 27 oct.;
 * `paceBienvenidaCompleto`). Con la tienda abierta, los dos precios de la tienda y «Ahora no» igual
 * de grande que «Probar 7 días gratis» (opción A de Ez, https://claude.ai/artifact/AvME9EqcMHXhywx43vEdKG).
 * Desde el 26 nov. 2026 esa pantalla no cierra la bienvenida: sale una vez, tras la primera pausa
 * entera, desde «Ver qué incluye» (PremiumTrasPausa.jsx).
 *
 * Para abrir la tienda de la web basta con poner sus dos enlaces de pago: la prueba lo
 * hace en el objeto que lee la app (`PACE_TIENDA_WEB.enlaces`), antes de pasar de la
 * primera pantalla, porque la lista de pantallas se recalcula en cada paso.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { capturarErrores, RUTA_ARTEFACTO, CLAVE_ESTADO, abrirTusDatos, sembrar, irAlArtefacto, overlaySuperior, acabarBienvenida } = require('./helpers');

const HOJA_COMPLETO = '[data-pace-completo-hoja]';

async function abrirTiendaWeb(page, mes) {
  await page.evaluate((enlaceMes) => {
    window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#tienda-vida', mes: enlaceMes || '/index.html#tienda-mes' };
    window.PACE_TIENDA_WEB.gestionar = 'https://billing.stripe.com/p/login/prueba';   // sin portal, el mensual no se vende
  }, mes);
}

async function hastaLaSemana(page) {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[role=dialog] [data-pace-cta]').waitFor({ state: 'visible' });
}

/* La pantalla de PACE completo, como la abre «Ver qué incluye» de la tarjeta tras la primera pausa
   (el camino entero, en la primera prueba de abajo). */
async function abrirCompleto(page) {
  await page.evaluate(() => window.paceAbrirCompleto());
  await page.locator(HOJA_COMPLETO).waitFor({ state: 'visible' });
}

/* La primera pausa entera, como la hace quien acaba de llegar: Escritorio express desde Estira. */
async function primeraPausa(page) {
  await page.getByRole('button', { name: /^Estira/ }).first().click();
  await overlaySuperior(page).getByRole('heading', { name: 'Escritorio express', exact: true }).filter({ visible: true }).first().click();
  const empezar = overlaySuperior(page).getByRole('button', { name: /^Empezar$/ });
  if (await empezar.count()) await empezar.first().click();
  const done = page.locator('[data-pace-session-done]');
  for (let s = 0; s < 500 && !(await done.count()); s++) { await page.clock.fastForward(1000); await page.waitForTimeout(8); }
  await expect(done, 'GUARD: la sesión no llegó al cierre').toHaveCount(1);
}

test('con la tienda cerrada no hay nada que comprar: la bienvenida no habla de PACE completo, y tras la primera pausa sale una vez, abierto hasta v1', async ({ page }) => {
  test.setTimeout(90_000);
  const errores = capturarErrores(page);
  await page.clock.install({ time: new Date('2026-11-28T12:00:00+01:00') });
  await hastaLaSemana(page);

  const tienda = await page.evaluate(async () => ({
    canal: window.paceTiendaCanal(),
    abierta: window.paceTiendaAbierta(),
    planes: window.paceTiendaPlanes('es'),
    compra: await window.paceComprar('vida'),
    bienvenida: window.paceBienvenidaCompleto(),
  }));
  expect(tienda).toEqual({ canal: 'web', abierta: false, planes: [], compra: { ok: false, motivo: 'cerrada' }, bienvenida: 'abierto' });

  /* Ez, 26 nov. 2026: los precios, después de probar. La semana vuelve a ser la última. */
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await expect(page.locator('[data-pace-semana-guardar]')).toHaveText('Comenzar');
  await page.locator('[data-pace-semana-guardar]').click();
  await expect(page.locator('[role=dialog][data-pace-scene-card]')).toHaveCount(0);
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-onb-precios]')).toHaveCount(0);
  await acabarBienvenida(page);

  /* La primera pausa entera: debajo de «¿Te ayudó?», la tarjeta, sin precios. */
  await primeraPausa(page);
  const tarjeta = page.locator('[data-pace-premium-tras-pausa]');
  await expect(tarjeta).toContainText('Esto es PACE gratis');
  await expect(tarjeta).toContainText('PACE completo añade las rutinas más profundas, las tuyas propias y una semana a tu medida.');
  expect(await page.evaluate(() => /19,99|2,99/.test(document.body.innerText)), 'un precio en el cierre').toBe(false);
  await tarjeta.getByRole('button', { name: 'Ver qué incluye' }).click();

  /* Lo que es verdad hoy: abierto para todos, lo que costará y lo que se queda al llegar v1. */
  const hoja = page.locator(HOJA_COMPLETO);
  await expect(hoja.getByRole('heading', { name: 'PACE es gratis.' })).toBeVisible();
  await expect(hoja).toContainText('Y mientras está en pruebas, PACE completo también está abierto para todos:');
  await expect(hoja.locator('[data-pace-onb-precios]')).toHaveText('Después, 2,99 € al mes con 7 días gratis, o 19,99 € una vez.');
  await expect(hoja.locator('[data-pace-onb-v1]')).toHaveText('Cuando salga a la venta tendrás tu semana de prueba, y las rutinas que ya hayas hecho se te quedan.');
  /* Un solo botón: no hay nada que comprar, y no empieza nada. */
  await expect(hoja.locator('[data-pace-onb-comenzar]')).toHaveText('Entendido');
  await expect(hoja.locator('[data-pace-onb-probar], [data-pace-onb-ahora], [data-pace-onb-vida]')).toHaveCount(0);
  await hoja.locator('[data-pace-onb-comenzar]').click();
  await expect(hoja).toHaveCount(0);

  /* Una vez: la segunda pausa ya no la enseña. */
  expect(await page.evaluate(() => window.getState().premiumTrasPausa)).toBe('vista');
  expect(errores).toEqual([]);
});

test('quien ya usaba PACE (sin la marca de esta versión) no ve la tarjeta; Escape cierra la pantalla', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  expect(await page.evaluate(() => window.premiumTrasPausaToca(window.getState())), 'la vio quien ya pasó por los precios en su bienvenida').toBe(false);
  expect(await page.evaluate(() => window.premiumTrasPausaToca(Object.assign({}, window.getState(), { premiumTrasPausa: 'pendiente' })))).toBe(true);
  /* Con PACE completo ya suyo, tampoco. */
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  expect(await page.evaluate(() => window.premiumTrasPausaToca(Object.assign({}, window.getState(), { premiumTrasPausa: 'pendiente' }))), 'CONTROL: sin tienda ni abierto, nada que enseñar').toBe(false);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = true; });
  await abrirCompleto(page);
  await page.keyboard.press('Escape');
  await expect(page.locator(HOJA_COMPLETO)).toHaveCount(0);
});

test('sin precios en la tienda del canal no se dice ningún importe', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  /* Como en Android antes de Play Billing: la tienda aún no tiene sus precios. */
  await page.evaluate(() => { window.PACE_TIENDA_WEB.precios = {}; });
  await abrirCompleto(page);
  await expect(page.locator('[data-pace-onb-comenzar]')).toBeVisible();
  await expect(page.locator('[data-pace-onb-precios]')).toHaveCount(0);
  await expect(page.locator('[data-pace-onb-v1]')).toBeVisible();
});

test('con la tienda abierta, la pantalla enseña los dos precios y «Ahora no» la cierra', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirTiendaWeb(page);
  await abrirCompleto(page);

  await expect(page.getByRole('heading', { name: 'PACE es gratis.' })).toBeVisible();
  /* Los precios, los de la tienda y escritos en el idioma de la app. */
  await expect(page.locator('[data-pace-onb-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
  const probar = page.locator('[data-pace-onb-probar]');
  const ahora = page.locator('[data-pace-onb-ahora]');
  await expect(probar).toHaveText('Probar 7 días gratis');
  await expect(ahora).toHaveText('Ahora no');
  await expect(page.locator('[data-pace-onb-vida]')).toHaveText('Prefiero pagarlo una vez, 19,99 €');

  /* «Ahora no» igual de grande que «Probar 7 días gratis». */
  const [a, b] = [await probar.boundingBox(), await ahora.boundingBox()];
  expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  expect(Math.abs(a.height - b.height)).toBeLessThan(1);

  await ahora.click();
  await expect(page.locator(HOJA_COMPLETO)).toHaveCount(0);
  expect(errores).toEqual([]);
});

test.describe('en un móvil en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('a 360 px los dos botones van uno sobre otro, igual de anchos, con el precio en inglés', async ({ page, context }) => {
    await sembrar(context, { lang: 'en' });
    await irAlArtefacto(page);
    await abrirTiendaWeb(page);
    await abrirCompleto(page);

    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('€19.99 once, or €2.99 a month with 7 days free.');
    const [a, b] = [await page.locator('[data-pace-onb-probar]').boundingBox(), await page.locator('[data-pace-onb-ahora]').boundingBox()];
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    expect(a.x + a.width).toBeLessThanOrEqual(360);
  });
});

test('«Probar 7 días gratis» cierra la pantalla y lleva a la página de pago del plan al mes', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await abrirTiendaWeb(page);
  await abrirCompleto(page);
  await page.locator('[data-pace-onb-probar]').click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-mes');
  await expect(page.locator(HOJA_COMPLETO)).toHaveCount(0);
});

/* Y NINGUNA PANTALLA SE LO OFRECE (la octava, nº 11 y prueba 10, 12 nov. 2026): antes esto solo
   comparaba lo que devuelven las funciones, y un botón de compra que no las consultara seguía saliendo a
   quien ya pagó. Ahora, con la compra vigente, se recorren las tres puertas de la compra (el final de la
   bienvenida, Ajustes › Tus datos y la invitación) y se cuentan cero botones de compra y cero precios.
   Mutante: con la fila de Ajustes sin mirar `paceTiendaAbierta` (PremiumSection.jsx), sale «Tenerlo para
   siempre · 19,99 €» y la prueba cae. */
const COMPRA = '[data-pace-onb-probar], [data-pace-onb-vida], [data-pace-aj-comprar], [data-pace-premium-vida], [data-pace-premium-precios]';
const precioALaVista = (page) => page.evaluate(() => /19,99|2,99/.test(document.body.innerText));

test('quien ya tiene PACE completo no ve la tienda, y lo que la tienda dice que tienes abre PACE completo', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-08T12:00:00+02:00') });
  await hastaLaSemana(page);
  await abrirTiendaWeb(page);
  expect(await page.evaluate(() => window.paceTiendaAbierta())).toBe(true);

  /* La tercera fuente del guard: lo que la tienda sabe (Play, cuando llegue). */
  const conCompra = await page.evaluate(() => {
    const antes = window.hasPremiumEntitlement();
    window.paceTiendaWeb.vigente = () => true;
    return { antes, despues: window.hasPremiumEntitlement(), abierta: window.paceTiendaAbierta() };
  });
  expect(conCompra).toEqual({ antes: false, despues: true, abierta: false });

  /* El final de la bienvenida: sin PACE completo que vender, la semana es lo último. */
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await expect(page.locator('[data-pace-semana-guardar]')).toHaveText('Comenzar');
  expect(await page.locator(COMPRA).count(), 'botones de compra en la bienvenida').toBe(0);
  await page.locator('[data-pace-semana-guardar]').click();
  await page.locator('[data-pace-visita-saltar]').click().catch(() => {});
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

  /* Ajustes › Tus datos. */
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  await expect(page.locator('[data-pace-tweaks-panel]')).toBeVisible();
  expect(await page.locator(COMPRA).count(), 'botones de compra en Ajustes').toBe(0);
  expect(await precioALaVista(page), 'un precio a la vista en Ajustes').toBe(false);
  await page.keyboard.press('Escape');

  /* La invitación, la que abre una rutina de pago. */
  await page.evaluate(() => window.paceAbrirPremium({ nombre: 'Colgarse' }));
  await page.clock.runFor(1000);
  expect(await page.locator(COMPRA).count(), 'botones de compra en la invitación').toBe(0);
  expect(await precioALaVista(page), 'un precio a la vista en la invitación').toBe(false);
});
