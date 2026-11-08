/* PACE · SOLO EL DE POR VIDA, SOLO EN LA WEB (Ez, 5 nov. 2026)
 * ==============================================================
 * «Solo el de por vida hasta v1 y en web (no android e ios) ya podríamos cerrar la parte premium.»
 * Lo que vigila:
 *   · la tienda de la web ofrece SOLO los planes que tienen enlace: con `enlaces.vida` puesto y
 *     `enlaces.mes` en null está lista y vende un plan, y el mensual vuelve solo al ponerle enlace;
 *   · lo que enseña planes (la bienvenida y la invitación) dice un solo pago y compra ese plan, sin
 *     prueba, sin aviso de dos días y sin un botón del mensual que no llevaría a ningún sitio;
 *   · lo que costará después (`paceTiendaPrecios`, la bienvenida de «abierto hasta v1») sigue diciendo
 *     los dos, porque el mensual llega con v1;
 *   · en Android y en el iPhone no hay compra aunque la tienda de la web esté abierta: ni botón, ni
 *     enlace de pago, ni enlace a /premium;
 *   · quien ya tiene un código lo sigue usando, y no ve la tienda;
 *   · /premium no lleva a ningún pago mientras la tienda no tenga el enlace de ese plan.
 * Los enlaces de pago se ponen aquí, en la página, y nunca en el código: `enlaces.vida` sigue en null
 * hasta que Ez encienda el suyo. Un pago de mentira se sirve con `page.route`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, RUTA_ARTEFACTO, CLAVE_ESTADO } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const RAIZ = path.join(__dirname, '..');
const HOJA = '[data-pace-premium-hoja]';
const SOLO_VIDA = { vida: '/index.html#tienda-vida', mes: null };
const LOS_DOS = { vida: '/index.html#tienda-vida', mes: '/index.html#tienda-mes' };

async function ponerEnlaces(page, enlaces) {
  await page.evaluate((e) => { window.PACE_TIENDA_WEB.enlaces = e; }, enlaces);
}

async function hastaLaSemana(page) {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('[role=dialog] [data-pace-cta]').waitFor({ state: 'visible' });
}

async function alUltimoPaso(page) {
  await page.locator('[role=dialog] [data-pace-cta]').click();
  await page.locator('[data-pace-semana-guardar]').click();
  await expect(page.getByRole('heading', { name: /^(PACE es gratis\.|PACE is free\.)$/ })).toBeVisible();
}

async function invitar(page) {
  await page.evaluate(() => window.paceAbrirPremium({ nombre: 'Colgarse' }));
  await page.locator(HOJA).waitFor({ state: 'visible' });
}

async function comoEnV1(page, enlaces) {
  await page.evaluate((e) => { window.PREMIUM_ABIERTO_HASTA_V1 = false; window.PACE_TIENDA_WEB.enlaces = e; }, enlaces);
}

/* La hoja entra animada: se mide cuando está quieta. */
async function quieta(page) {
  await page.waitForFunction(() => {
    const c = document.querySelector('[data-pace-modal-card]');
    if (!c) return false;
    const animaciones = c.getAnimations({ subtree: true });
    for (let e = c.parentElement; e; e = e.parentElement) animaciones.push(...e.getAnimations());
    return animaciones.every((a) => a.playState !== 'running');
  });
}

/* Un Capacitor falso de una tienda: lo mínimo para que la app se sepa dentro de ella. */
async function comoApp(context, plataforma) {
  await context.addInitScript((p) => {
    window.Capacitor = { getPlatform: () => p, isNativePlatform: () => true,
      Plugins: { App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() } } };
  }, plataforma);
}

test.describe('la tienda de la web ofrece solo lo que tiene enlace', () => {
  test('con solo el de por vida está lista, vende ese plan y el mensual no se puede comprar aunque se pida', async ({ page }) => {
    await hastaLaSemana(page);
    expect(await page.evaluate(() => window.paceTiendaAbierta()), 'sin enlaces la venta sigue apagada').toBe(false);

    await ponerEnlaces(page, SOLO_VIDA);
    const tienda = await page.evaluate(async () => ({
      lista: window.paceTiendaDelCanal().listo(),
      abierta: window.paceTiendaAbierta(),
      planes: window.paceTiendaPlanes('es').map((p) => [p.plan, p.precio.replace(/\s/g, ' ')]),
      mes: await window.paceComprar('mes'),
      raro: await window.paceComprar('toString'),
      hash: location.hash,
      bienvenida: window.paceBienvenidaCompleto(),
    }));
    expect(tienda).toEqual({
      lista: true, abierta: true, planes: [['vida', '19,99 €']],
      mes: { ok: false, motivo: 'cerrada' }, raro: { ok: false, motivo: 'cerrada' }, hash: '', bienvenida: 'compra',
    });
  });

  test('lo que costará después sigue diciendo los dos, y el mensual vuelve solo al ponerle enlace', async ({ page }) => {
    await hastaLaSemana(page);
    await ponerEnlaces(page, SOLO_VIDA);
    expect(await page.evaluate(() => window.paceTiendaPrecios('es').map((p) => p.plan))).toEqual(['vida', 'mes']);
    expect(await page.evaluate(() => window.paceTiendaPlanes('es').map((p) => p.plan))).toEqual(['vida']);

    await ponerEnlaces(page, LOS_DOS);
    expect(await page.evaluate(() => window.paceTiendaPlanes('es').map((p) => p.plan))).toEqual(['vida', 'mes']);

    /* Solo el mensual, o un plan sin precio, tampoco abre nada que no se pueda cobrar. */
    await ponerEnlaces(page, { vida: null, mes: null });
    expect(await page.evaluate(() => window.paceTiendaDelCanal().listo())).toBe(false);
    await page.evaluate(() => { window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#tienda-vida', mes: null }; window.PACE_TIENDA_WEB.precios = { mes: window.PACE_TIENDA_WEB.precios.mes }; });
    expect(await page.evaluate(() => window.paceTiendaDelCanal().listo()), 'un enlace sin precio no se vende').toBe(false);
  });
});

test.describe('la bienvenida con solo el de por vida', () => {
  test('un solo pago, «Comprar» y «Ahora no» iguales, sin prueba ni aviso, y el arranque dice que todo está abierto', async ({ page }) => {
    const errores = capturarErrores(page);
    await hastaLaSemana(page);
    await ponerEnlaces(page, SOLO_VIDA);
    await alUltimoPaso(page);

    const tarjeta = page.locator('[role=dialog][data-pace-scene-card]');
    /* Hasta v1 todo sigue abierto para todos, y la bienvenida lo dice antes de pedir nada. */
    await expect(tarjeta).toContainText('Y hasta v1, PACE completo también está abierto para todos:');
    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('Un solo pago de 19,99 €, para siempre.');
    const comprar = page.locator('[data-pace-onb-vida]');
    const ahora = page.locator('[data-pace-onb-ahora]');
    await expect(comprar).toHaveText('Comprar, 19,99 €');
    await expect(ahora).toHaveText('Ahora no');
    await expect(page.locator('[data-pace-onb-probar], [data-pace-onb-comenzar]')).toHaveCount(0);
    /* Nada del mensual: ni la prueba, ni el aviso de dos días, ni «al mes». */
    await expect(tarjeta).not.toContainText(/días gratis|al mes|prueba|Te avisamos|Prefiero/i);

    const [a, b] = [await comprar.boundingBox(), await ahora.boundingBox()];
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
    expect(Math.abs(a.height - b.height)).toBeLessThan(1);

    await ahora.click();
    await expect(tarjeta).toHaveCount(0);
    const visto = await page.evaluate((clave) => JSON.parse(localStorage.getItem(clave)).firstSeen, CLAVE_ESTADO);
    expect(typeof visto).toBe('number');
    await expect(page.locator('[data-pace-visita]')).toBeVisible();
    expect(errores).toEqual([]);
  });

  test('«Comprar» cierra la bienvenida y lleva al pago de por vida, y solo al de por vida', async ({ page }) => {
    await hastaLaSemana(page);
    await ponerEnlaces(page, SOLO_VIDA);
    await alUltimoPaso(page);
    await page.locator('[data-pace-onb-vida]').click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-vida');
    /* La compra sigue en la página de Stripe: no se abre la visita encima. */
    await page.waitForTimeout(700);
    await expect(page.locator('[data-pace-visita]')).toHaveCount(0);
  });

  test('cuando todo deja de estar abierto, el arranque es el de siempre', async ({ page }) => {
    await hastaLaSemana(page);
    await ponerEnlaces(page, SOLO_VIDA);
    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    await alUltimoPaso(page);
    await expect(page.locator('[role=dialog][data-pace-scene-card]')).toContainText('Si un día quieres más, PACE completo añade:');
    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('Un solo pago de 19,99 €, para siempre.');
  });

  test('con el mensual vuelto a abrir, la bienvenida es la de los dos planes', async ({ page }) => {
    await hastaLaSemana(page);
    await ponerEnlaces(page, LOS_DOS);
    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    await alUltimoPaso(page);
    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
    await expect(page.locator('[data-pace-onb-probar]')).toHaveText('Probar 7 días gratis');
    await expect(page.locator('[data-pace-onb-vida]')).toHaveText('Prefiero pagarlo una vez, 19,99 €');
  });

  test('el enlace de pago es el de la tienda: un pago de mentira servido por page.route recibe a quien compra', async ({ page }) => {
    await page.route('https://buy.stripe.example/**', (r) => r.fulfill({ contentType: 'text/html', body: '<title>Pago de prueba</title><p>pago</p>' }));
    await hastaLaSemana(page);
    await ponerEnlaces(page, { vida: 'https://buy.stripe.example/test_vida', mes: null });
    await alUltimoPaso(page);
    await page.locator('[data-pace-onb-vida]').click();
    await page.waitForURL('https://buy.stripe.example/test_vida');
    await expect(page).toHaveTitle('Pago de prueba');
  });
});

test.describe('la bienvenida con solo el de por vida, en un móvil en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('a 360 px los dos botones van uno sobre otro, igual de anchos, con el precio en inglés', async ({ page }) => {
    await hastaLaSemana(page);
    await ponerEnlaces(page, SOLO_VIDA);
    await alUltimoPaso(page);
    await expect(page.locator('[data-pace-onb-precios]')).toHaveText('One payment of €19.99 for lifetime access.');
    await expect(page.locator('[data-pace-onb-vida]')).toHaveText('Buy for €19.99');
    const [a, b] = [await page.locator('[data-pace-onb-vida]').boundingBox(), await page.locator('[data-pace-onb-ahora]').boundingBox()];
    expect(Math.abs(a.width - b.width)).toBeLessThan(1);
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    expect(a.x + a.width).toBeLessThanOrEqual(360);
  });
});

test.describe('la invitación con solo el de por vida', () => {
  test('un solo pago y su botón; «Ahora no» igual de grande; sin prueba ni aviso; «Tengo un código» se queda', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, SOLO_VIDA);
    await invitar(page);

    const hoja = page.locator(HOJA);
    await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'invita');
    await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('Un solo pago de 19,99 €, para siempre.');
    await expect(hoja).not.toContainText('Llega con la versión 1.');
    await expect(hoja).not.toContainText(/días gratis|al mes|prueba|Te avisamos|Prefiero/i);
    await expect(hoja.locator('[data-pace-premium-vida]')).toHaveCount(1);
    await expect(hoja.locator('[data-pace-premium-vida]')).toHaveText('Comprar, 19,99 €');
    await expect(hoja.getByRole('button', { name: /Probar/ })).toHaveCount(0);
    await expect(hoja.locator('[data-pace-premium-tengo]')).toHaveText('Tengo un código');

    await quieta(page);
    const [a, b] = await hoja.evaluate((h) => ['Comprar, 19,99 €', 'Ahora no'].map((n) => {
      const x = [...h.querySelectorAll('button')].find((e) => e.textContent.replace(/\s/g, ' ').trim() === n);
      return { ancho: x.offsetWidth, alto: x.offsetHeight, arriba: x.offsetTop };
    }));
    expect(Math.abs(a.ancho - b.ancho)).toBeLessThan(1);
    expect(Math.abs(a.alto - b.alto)).toBeLessThan(1);
    expect(a.arriba, 'lado a lado en el ordenador').toBe(b.arriba);

    await hoja.getByRole('button', { name: 'Ahora no' }).click();
    await expect(page.locator(HOJA)).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test('«Comprar» lleva al pago de por vida y la hoja se cierra; si la compra falla, lo dice y la hoja sigue', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, SOLO_VIDA);
    await page.evaluate(() => { const comprar = window.paceTiendaWeb.comprar; window.paceTiendaWeb.comprar = () => Promise.resolve({ ok: false, motivo: 'error' }); window.__comprar = comprar; });
    await invitar(page);
    const hoja = page.locator(HOJA);
    await hoja.locator('[data-pace-premium-vida]').click();
    await expect(hoja.locator('[data-pace-premium-error="compra"]')).toHaveText('No se ha podido abrir la compra. Prueba otra vez.');
    await expect(hoja).toHaveAttribute('data-pace-premium-hoja', 'invita');

    await page.evaluate(() => { window.paceTiendaWeb.comprar = window.__comprar; });
    await hoja.locator('[data-pace-premium-vida]').click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#tienda-vida');
    await expect(page.locator(HOJA)).toHaveCount(0);
  });

  test('con el mensual vuelto a abrir, la hoja es la de los dos planes', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, LOS_DOS);
    await invitar(page);
    const hoja = page.locator(HOJA);
    await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
    await expect(hoja.getByRole('button', { name: 'Probar 7 días gratis' })).toBeVisible();
    await expect(hoja.locator('[data-pace-premium-vida]')).toHaveText('Prefiero pagarlo una vez, 19,99 €');
  });
});

test.describe('la invitación con solo el de por vida, en un móvil en inglés', () => {
  test.use({ locale: 'en-GB', viewport: { width: 360, height: 740 } });

  test('a 360 px los dos botones van uno sobre otro y la hoja cabe', async ({ page, context }) => {
    await sembrar(context, { lang: 'en', sidebarCollapsed: true });
    await irAlArtefacto(page);
    await comoEnV1(page, SOLO_VIDA);
    await invitar(page);
    const hoja = page.locator(HOJA);
    await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('One payment of €19.99 for lifetime access.');
    await quieta(page);
    const [a, b] = await hoja.evaluate((h) => ['Buy for €19.99', 'Not now'].map((n) => {
      const x = [...h.querySelectorAll('button')].find((e) => e.textContent.replace(/\s/g, ' ').trim() === n);
      return { ancho: x.offsetWidth, alto: x.offsetHeight, arriba: x.offsetTop };
    }));
    expect(Math.abs(a.ancho - b.ancho)).toBeLessThan(1);
    expect(b.arriba, 'uno sobre otro en el móvil').toBeGreaterThan(a.arriba + a.alto - 1);
    const caja = await page.locator('[data-pace-modal-card]').boundingBox();
    expect(caja.y).toBeGreaterThanOrEqual(0);
    expect(caja.y + caja.height).toBeLessThanOrEqual(740);
  });
});

for (const plataforma of ['android', 'ios']) {
  test.describe('en ' + (plataforma === 'android' ? 'Android' : 'el iPhone') + ' no hay compra, aunque la tienda de la web esté abierta', () => {
    test('ni plan, ni botón, ni enlace de pago; la bienvenida acaba sin ofrecer nada y la invitación solo informa', async ({ page, context }) => {
      await comoApp(context, plataforma);
      await sembrar(context);
      await irAlArtefacto(page);
      await comoEnV1(page, LOS_DOS);

      const canal = await page.evaluate(async () => ({
        canal: window.paceTiendaCanal(),
        esWeb: window.paceTiendaDelCanal() === window.paceTiendaWeb,
        lista: window.paceTiendaDelCanal().listo(),
        abierta: window.paceTiendaAbierta(),
        planes: window.paceTiendaPlanes('es'),
        precios: window.paceTiendaPrecios('es'),
        vida: await window.paceComprar('vida'),
        mes: await window.paceComprar('mes'),
        bienvenida: window.paceBienvenidaCompleto(),
        gestionar: window.paceTiendaPuedeGestionar(),
        hash: location.hash,
      }));
      expect(canal).toEqual({
        canal: plataforma === 'android' ? 'play' : 'ninguno', esWeb: false, lista: false, abierta: false, planes: [], precios: [],
        vida: { ok: false, motivo: 'cerrada' }, mes: { ok: false, motivo: 'cerrada' }, bienvenida: null, gestionar: false, hash: '',
      });

      await invitar(page);
      const hoja = page.locator(HOJA);
      /* Desde v1 y sin la compra de su tienda (Ez, 3B del 7 nov.). */
      await expect(hoja).toContainText('Pronto podrás tenerlo aquí.');
      await expect(hoja.locator('[data-pace-premium-precios], [data-pace-premium-vida], [data-pace-premium-tengo], a[href]')).toHaveCount(0);
      await expect(hoja.getByRole('button', { name: /Probar|Comprar|pagarlo/ })).toHaveCount(0);
      await hoja.getByRole('button', { name: 'Ahora no' }).click();
      await expect(page.locator(HOJA)).toHaveCount(0);

      /* En toda la app, ningún enlace lleva a pagar ni a /premium. */
      const enlaces = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'))
        .filter((h) => /premium|stripe|buy\./i.test(h)));
      expect(enlaces).toEqual([]);
    });

    test('la bienvenida acaba en «Comenzar», sin ningún botón de compra', async ({ page, context }) => {
      await comoApp(context, plataforma);
      await page.goto(RUTA_ARTEFACTO);
      await page.locator('[role=dialog] [data-pace-cta]').waitFor({ state: 'visible' });
      await ponerEnlaces(page, LOS_DOS);
      await page.locator('[role=dialog] [data-pace-cta]').click();
      await page.locator('[data-pace-semana-guardar]').click();
      await expect(page.locator('[data-pace-onb-comenzar]')).toBeVisible();
      await expect(page.locator('[data-pace-onb-vida], [data-pace-onb-probar], [data-pace-onb-ahora], [data-pace-onb-precios]')).toHaveCount(0);
    });
  });
}

test.describe('quien ya tiene un código lo sigue usando', () => {
  test('con la tienda de por vida abierta y el código puesto, no hay tienda y PACE completo es suyo', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    const codigo = firmar({ order: 'cs_test_solo_vida' });
    await sembrar(context, { licencia: codigo });
    await irAlArtefacto(page);
    await comoEnV1(page, SOLO_VIDA);
    await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
    expect(await page.evaluate(() => [window.paceTiendaAbierta(), window.paceBienvenidaCompleto()])).toEqual([false, null]);
  });

  test('y quien no lo tiene puede ponerlo desde la invitación con la tienda abierta', async ({ page, context }) => {
    await conLlaveDePrueba(context);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoEnV1(page, SOLO_VIDA);
    await invitar(page);
    await page.locator('[data-pace-premium-tengo]').click();
    await page.locator('[data-pace-premium-codigo]').fill(firmar({ order: 'cs_test_codigo' }));
    await page.getByRole('button', { name: 'Canjear' }).click();
    await expect(page.locator(HOJA)).toHaveAttribute('data-pace-premium-hoja', 'ok');
    await expect(page.locator(HOJA)).toContainText('PACE completo es tuyo, para siempre.');
  });
});

test.describe('/premium y la tienda cuentan lo mismo', () => {
  test('cada plan de /premium lleva a la lista mientras su enlace es null, y al pago cuando la tienda lo tiene', async ({ page }) => {
    await page.goto(RUTA_ARTEFACTO);
    await page.waitForFunction(() => typeof window.paceTiendaPlanes === 'function');
    const enlaces = await page.evaluate(() => window.PACE_TIENDA_WEB.enlaces);
    await page.goto('/premium/');
    const platos = page.locator('.plato[data-plan]');
    expect(await platos.evaluateAll((l) => l.map((p) => p.dataset.plan))).toEqual(['vida', 'mes']);
    for (const plan of ['vida', 'mes']) {
      const boton = page.locator('.plato[data-plan=' + plan + '] a.boton');
      await expect(boton, 'el botón del plan ' + plan + ' de /premium: el pago si la tienda tiene su enlace, la lista si no')
        .toHaveAttribute('href', enlaces[plan] || '#avisame');
    }
  });

  test('apagada, /premium dice «Avísame» y que el de por vida se abre pronto; el mensual llega con la versión 1, y «dónde funciona tu compra» va antes de pagar', async ({ page }) => {
    await page.goto('/premium/');
    const vida = page.locator('.plato[data-plan=vida]');
    const mes = page.locator('.plato[data-plan=mes]');
    await expect(vida.locator('a.boton')).toHaveText('Avísame');
    await expect(mes.locator('.pronto')).toHaveText('Llega con la versión 1');
    await expect(mes.locator('a.boton')).toHaveText('Avísame');
    await expect(page.locator('[data-venta=apagada]')).toHaveText('IVA incluido. El de por vida se abre pronto; el mensual y las apps, con la versión 1.');
    await expect(page.locator('[data-venta=encendida]')).toBeHidden();
    const donde = page.locator('.donde');
    await expect(donde).toContainText('En las apps de Android y de iPhone no vale');
    await expect(donde).toContainText('no se sincronizan');
    await expect(donde).toContainText('vuelve el acceso, no el historial');
    /* Antes de pagar: «Dónde funciona tu compra» va después de los platos y antes de la lista de avisos. */
    const [a, b, c] = await Promise.all(['.platos', '.donde', '#avisame'].map((q) => page.locator(q).evaluate((e) => e.getBoundingClientRect().top + scrollY)));
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    await expect(page.getByRole('heading', { name: 'La prueba, sin sorpresas' })).toBeVisible();
    await expect(page.getByText('Cuando llegue el plan al mes:')).toBeVisible();

    await page.goto('/premium/?lang=en');
    await expect(page.locator('.donde .kicker')).toHaveText('Where your purchase works');
    await expect(mes.locator('.pronto')).toHaveText('Coming with version 1');
    await expect(page.locator('[data-venta=apagada]')).toHaveText('VAT included. Lifetime opens soon; monthly and the apps arrive with version 1.');
  });

  test('el enlace de /premium (ENLACE_VIDA) es el de la tienda de la web', async ({ page }) => {
    await page.goto(RUTA_ARTEFACTO);
    await page.waitForFunction(() => typeof window.paceTiendaPlanes === 'function');
    const tienda = await page.evaluate(() => window.PACE_TIENDA_WEB.enlaces.vida);
    const m = fs.readFileSync(path.join(RAIZ, 'premium/index.html'), 'utf8').match(/var ENLACE_VIDA = (null|'[^']+');/);
    expect(m, 'premium/index.html tiene su ENLACE_VIDA').not.toBeNull();
    expect(m[1] === 'null' ? null : m[1].slice(1, -1)).toBe(tienda);
  });

  test('encendida (con un pago de mentira), el plato de por vida compra y la nota dice que hasta v1 todo está abierto; el mensual sigue en la lista', async ({ page }) => {
    await page.route(/\/premium\/(\?.*)?$/, async (route) => {
      const r = await route.fetch();
      const cuerpo = (await r.text()).replace('var ENLACE_VIDA = null;', "var ENLACE_VIDA = 'https://buy.stripe.example/test_vida';");
      await route.fulfill({ response: r, body: cuerpo });
    });
    await page.goto('/premium/');
    const compra = page.locator('.plato[data-plan=vida] a.boton');
    await expect(compra).toHaveText('Comprar');
    await expect(compra).toHaveAttribute('href', 'https://buy.stripe.example/test_vida');
    await expect(page.locator('[data-venta=apagada]')).toBeHidden();
    await expect(page.locator('[data-venta=encendida]')).toContainText('Hasta la versión 1, PACE completo está abierto para todos');
    await expect(page.locator('.plato[data-plan=mes] a.boton')).toHaveAttribute('href', '#avisame');

    await page.goto('/premium/?lang=en');
    await expect(compra).toHaveText('Buy');
    await expect(page.locator('[data-venta=encendida]')).toContainText('Until version 1, PACE Complete is open to everyone');
    await page.locator('[data-idioma]').click();
    await expect(compra).toHaveText('Comprar');
  });

  test.describe('a 360 px', () => {
    test.use({ viewport: { width: 360, height: 740 } });
    test('los dos platos y «dónde funciona tu compra» caben a lo ancho', async ({ page }) => {
      await page.goto('/premium/');
      await page.locator('#precio').scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      for (const q of ['.plato[data-plan=vida]', '.plato[data-plan=mes]', '.donde']) {
        const c = await page.locator(q).boundingBox();
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.x + c.width).toBeLessThanOrEqual(360);
      }
    });
  });

  test('ningún archivo de la app lleva un enlace de pago fuera de la tienda de la web', async () => {
    const sospechosos = [];
    const recorrer = (d) => {
      for (const f of fs.readdirSync(path.join(RAIZ, d), { withFileTypes: true })) {
        const rel = d + '/' + f.name;
        if (f.isDirectory()) recorrer(rel);
        else if (/\.(js|jsx|css)$/.test(f.name) && rel !== 'app/state-compra.js'
          && /(buy|checkout)\.stripe\.com|stripe\.com\/pay/i.test(fs.readFileSync(path.join(RAIZ, rel), 'utf8'))) sospechosos.push(rel);
      }
    };
    recorrer('app');
    expect(sospechosos).toEqual([]);
  });
});
