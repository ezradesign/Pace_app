/* PACE · LA COMPRA EN LAS APPS, CON UNA TIENDA DE MENTIRA (Ez, 18 nov. 2026: 1 código propio, 2A 3A 4A)
 * ==========================================
 * Las tiendas de Google Play y Apple (app/state-compra.apps.js) hablan con `PaceCompras`, la pieza
 * nativa. Aquí la pieza es de mentira y contesta como contestarían Google y Apple: con o sin prueba
 * de 7 días, lenta, que falla, con un pago pendiente, sin conexión, con una compra hecha fuera de la
 * app. Lo de verdad (la firma de Google, lo verificado por Apple) solo se prueba con las altas de Ez;
 * lo que se mira aquí es que PACE diga lo que la tienda da y nada más (sexta pasada, nº 8 a 13).
 * Las tiendas están apagadas de fábrica: cada prueba las enciende en la página, como en v1.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, abrirTusDatos } = require('./helpers');

test.use({ serviceWorkers: 'block' });

const HOJA = '[data-pace-premium-hoja]';
const DIA = 86400000;
const PRECIOS = [
  { plan: 'vida', texto: '19,99 €', importe: 19.99, moneda: 'EUR' },
  { plan: 'mes', texto: '2,99 €', importe: 2.99, moneda: 'EUR', pruebaDias: 7 },
];

/* Un Capacitor de mentira con su `PaceCompras`. `escena` cambia lo que contesta; con la marca
   `__tiendaSinRed` en localStorage, la pieza no da las compras (sin conexión y sin su memoria). */
async function comoAppConTienda(context, plataforma, escena) {
  await context.addInitScript(([p, e, precios]) => {
    const t = window.__tienda = Object.assign({ llamadas: [], productos: precios, compras: [], comprar: 'comprado', fallaProductos: 0, oyentes: [] }, e);
    if (localStorage.getItem('__tiendaSinRed')) t.sinRed = true;
    const apunta = (m, f) => (o) => { t.llamadas.push({ m, o: o === undefined ? null : JSON.parse(JSON.stringify(o)) }); return f(o || {}); };
    window.Capacitor = {
      getPlatform: () => p, isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        PaceCompras: {
          productos: apunta('productos', () => (t.fallaProductos-- > 0 ? Promise.reject(new Error('sin red')) : Promise.resolve({ productos: t.productos }))),
          compras: apunta('compras', () => (t.sinRed ? Promise.reject(new Error('sin red')) : Promise.resolve({ compras: t.compras }))),
          restaurar: apunta('restaurar', () => Promise.resolve({ compras: t.compras })),
          comprar: apunta('comprar', (o) => {
            if (t.comprar !== 'comprado') return Promise.resolve({ estado: t.comprar });
            const c = { plan: o.plan, desde: Date.now() };
            if (o.plan === 'mes') { c.renueva = true; if (o.oferta) { c.prueba = true; c.hasta = Date.now() + 7 * 86400000; } }
            t.compras = t.compras.filter((x) => x.plan !== o.plan).concat([c]);
            return Promise.resolve({ estado: 'comprado', compra: c });
          }),
          gestionar: apunta('gestionar', () => Promise.resolve()),
          canjear: apunta('canjear', () => Promise.resolve()),
          addListener: (ev, cb) => { t.oyentes.push(cb); return { remove() {} }; },
        },
      },
    };
    t.emitir = (compras) => { t.compras = compras; t.oyentes.forEach((cb) => cb({ compras })); };
  }, [plataforma, escena || {}, PRECIOS]);
}

/* Lo que pasará en v1 con las altas de Ez: PACE completo deja de estar abierto y la tienda se enciende. */
async function encender(page) {
  await page.evaluate(() => {
    window.PREMIUM_ABIERTO_HASTA_V1 = false;
    window.PACE_TIENDA_APPS.play.encendida = true;
    window.PACE_TIENDA_APPS.apple.encendida = true;
    return window.paceTiendaAppCargar(window.paceTiendaCanal());
  });
}

async function invitar(page) {
  await page.evaluate(() => window.paceAbrirPremium({ nombre: 'Colgarse' }));
  await page.locator(HOJA).waitFor({ state: 'visible' });
}

const llamadas = (page, m) => page.evaluate((metodo) => window.__tienda.llamadas.filter((l) => l.m === metodo).map((l) => l.o), m);

async function filaPremium(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  return page.locator('[data-pace-tweaks-panel]');
}

test('apagadas de fábrica: la pieza nativa ni se llama, y la hoja no ofrece nada', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
  await invitar(page);
  await expect(page.locator(HOJA)).toContainText('Pronto podrás tenerlo aquí.');
  await expect(page.locator('[data-pace-premium-mes], [data-pace-premium-restaurar], [data-pace-premium-canjear]')).toHaveCount(0);
  expect(await page.evaluate(() => ({ canal: window.paceTiendaCanal(), estado: window.paceTiendaEstado(), llamadas: window.__tienda.llamadas.length })))
    .toEqual({ canal: 'play', estado: 'cerrada', llamadas: 0 });
  expect(errores).toEqual([]);
});

test('Android: la mensual con su prueba dice lo que da Google, cómo se renueva y dónde se cancela, sin el aviso de dos días', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  const hoja = page.locator(HOJA);
  await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes con 7 días gratis.');
  await expect(hoja.locator('[data-pace-premium-mes]')).toHaveText('Probar 7 días gratis');
  await expect(hoja.locator('[data-pace-premium-renueva]')).toHaveText('Después, 2,99 € al mes. Se renueva cada mes hasta que canceles en Google Play.');
  await expect(hoja.locator('[data-pace-premium-aviso]')).toHaveCount(0);
  await expect(hoja.locator('[data-pace-premium-condiciones]')).toHaveAttribute('href', 'https://play.google.com/about/play-terms/');
  await expect(hoja.locator('[data-pace-premium-privacidad]')).toHaveAttribute('href', 'https://pacegrass.app/privacy');

  await hoja.locator('[data-pace-premium-mes]').click();
  await expect(hoja.locator('[data-pace-premium-resultado]')).toContainText('Tu prueba gratis acaba el');
  const pedido = (await llamadas(page, 'comprar'))[0];
  expect(pedido).toMatchObject({ plan: 'mes', oferta: 'prueba-7-dias', planBase: 'mensual', ids: { vida: 'pace_completo_vida', mes: 'pace_completo_mes' } });
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
  await hoja.getByRole('button', { name: 'Seguir' }).click();

  const panel = await filaPremium(page);
  await expect(panel.locator('[data-pace-compra-estado="mes"]')).toContainText('Prueba gratis · hasta el');
  await panel.getByRole('button', { name: /Gestionar la suscripción/ }).click();
  expect(await llamadas(page, 'gestionar')).toHaveLength(1);
  await expect(panel.locator('[data-pace-aj-restaurar]')).toBeVisible();
  expect(errores).toEqual([]);
});

test('sin prueba (ya la usó): ni «gratis» ni la oferta, y tras comprar dice que se renueva', async ({ page, context }) => {
  await comoAppConTienda(context, 'android', { productos: [{ plan: 'vida', texto: '19,99 €', importe: 19.99, moneda: 'EUR' }, { plan: 'mes', texto: '2,99 €', importe: 2.99, moneda: 'EUR' }] });
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  const hoja = page.locator(HOJA);
  await expect(hoja.locator('[data-pace-premium-precios]')).toHaveText('19,99 € una vez, o 2,99 € al mes.');
  await expect(hoja.locator('[data-pace-premium-mes]')).toHaveText('2,99 € al mes');
  await expect(hoja.locator('[data-pace-premium-renueva]')).toHaveText('Se renueva cada mes hasta que canceles en Google Play.');
  await expect(hoja).not.toContainText('gratis');
  await hoja.locator('[data-pace-premium-mes]').click();
  await expect(hoja.locator('[data-pace-premium-resultado]')).toHaveText('Se renueva cada mes; lo cancelas cuando quieras en Ajustes.');
  await expect(hoja.getByRole('heading')).toHaveText('PACE completo ya es tuyo.');
  expect((await llamadas(page, 'comprar'))[0].oferta).toBe(null);
});

test('el de por vida dice «para siempre», y Ajustes, sin «Gestionar»', async ({ page, context }) => {
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  await page.locator(HOJA).locator('[data-pace-premium-vida]').click();
  await expect(page.locator(HOJA).getByRole('heading')).toHaveText('PACE completo es tuyo, para siempre.');
  await page.locator(HOJA).getByRole('button', { name: 'Seguir' }).click();
  const panel = await filaPremium(page);
  await expect(panel.locator('[data-pace-compra-estado="vida"]')).toHaveText('Para siempre');
  await expect(panel.getByRole('button', { name: /Gestionar la suscripción/ })).toHaveCount(0);
});

test('un pago pendiente no abre nada hasta que Google lo confirma, aunque llegue con la app abierta', async ({ page, context }) => {
  await comoAppConTienda(context, 'android', { comprar: 'pendiente' });
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  await page.locator(HOJA).locator('[data-pace-premium-vida]').click();
  await expect(page.locator('[data-pace-premium-hoja="pendiente"]')).toContainText('PACE completo se abrirá cuando Google lo confirme.');
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(false);
  await page.evaluate(() => window.__tienda.emitir([{ plan: 'vida', desde: Date.now() }]));
  await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
});

test('si los precios no cargan, lo dice y deja reintentar (nunca «Pronto podrás tenerlo aquí»)', async ({ page, context }) => {
  await comoAppConTienda(context, 'android', { fallaProductos: 1 });
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  const hoja = page.locator(HOJA);
  await expect(hoja.locator('[data-pace-premium-tienda="error"]')).toContainText('No se pudieron cargar los precios.');
  await expect(hoja).not.toContainText('Pronto podrás tenerlo aquí.');
  await hoja.locator('[data-pace-premium-reintentar]').click();
  await expect(hoja.locator('[data-pace-premium-mes]')).toHaveText('Probar 7 días gratis');
});

test('restaurar: sin compras lo dice; con la compra en la cuenta, la encuentra', async ({ page, context }) => {
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  const hoja = page.locator(HOJA);
  await hoja.locator('[data-pace-premium-restaurar]').click();
  await expect(hoja.locator('[data-pace-premium-restaurado="no"]')).toHaveText('No hay compras de PACE en esta cuenta de Google.');
  await page.evaluate(() => { window.__tienda.compras = [{ plan: 'vida', desde: Date.now() - 30 * 86400000 }]; });
  await hoja.locator('[data-pace-premium-restaurar]').click();
  await expect(hoja.locator('[data-pace-premium-resultado]')).toHaveText('Hemos encontrado tu compra: PACE completo, para siempre.');
  expect(await page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
});

test('«Tengo un código» abre el canje de la tienda, y lo canjeado fuera llega solo (3A)', async ({ page, context }) => {
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await invitar(page);
  await page.locator(HOJA).locator('[data-pace-premium-canjear]').click();
  expect(await llamadas(page, 'canjear')).toHaveLength(1);
  await page.locator(HOJA).getByRole('button', { name: 'Ahora no' }).click();
  await page.evaluate(() => window.__tienda.emitir([{ plan: 'vida', desde: Date.now() }]));
  const panel = await filaPremium(page);
  await expect(panel.locator('[data-pace-compra-estado="vida"]')).toHaveText('Para siempre');
});

test('sin conexión vale lo último que dijo la tienda: el de por vida sigue, la mensual hasta su fin y unos días', async ({ page, context }) => {
  await comoAppConTienda(context, 'android', { compras: [{ plan: 'vida', desde: Date.now() - 90 * 86400000 }] });
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
  await page.evaluate(() => localStorage.setItem('__tiendaSinRed', '1'));
  await page.reload();
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await encender(page);
  expect(await page.evaluate(() => ({ red: window.__tienda.sinRed, tiene: window.hasPremiumEntitlement() }))).toEqual({ red: true, tiene: true });
  /* La mensual guardada: hasta su fin y `margenMes` (3 días) más; sin fin, un mes desde la respuesta. */
  expect(await page.evaluate((dia) => {
    const vale = window.paceTiendaAppVale, ahora = Date.now();
    return [vale({ plan: 'mes', hasta: ahora - 2 * dia }, true), vale({ plan: 'mes', hasta: ahora - 4 * dia }, true),
      vale({ plan: 'mes', hasta: null, at: ahora - 20 * dia }, true), vale({ plan: 'mes', hasta: null, at: ahora - 40 * dia }, true),
      vale({ plan: 'mes', hasta: ahora - dia }, false), vale({ plan: 'vida', pendiente: true }, false)];
  }, DIA)).toEqual([true, false, true, false, false, false]);
});

test('una copia de otro móvil no trae su compra', async ({ page, context }) => {
  await comoAppConTienda(context, 'android');
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(async () => {
    const entrante = { tiendaUltima: { canal: 'play', at: Date.now(), compras: [{ plan: 'vida' }] } };
    const e = await window.paceConservarAlImportar({}, entrante);
    return 'tiendaUltima' in e ? e.tiendaUltima : 'sin clave';
  });
  /* Sin compra en este móvil, la clave ni se escribe: así una copia que va y vuelve deja el estado igual. */
  expect(r).toBe('sin clave');
});

test('iPhone: la tienda de Apple, sus condiciones estándar (4A) y «App Store» para gestionar', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await comoAppConTienda(context, 'ios');
  await sembrar(context);
  await irAlArtefacto(page);
  await encender(page);
  expect(await page.evaluate(() => window.paceTiendaCanal())).toBe('apple');
  await invitar(page);
  const hoja = page.locator(HOJA);
  await expect(hoja.locator('[data-pace-premium-renueva]')).toHaveText('Después, 2,99 € al mes. Se renueva cada mes hasta que canceles en tu cuenta de Apple.');
  await expect(hoja.locator('[data-pace-premium-condiciones]')).toHaveAttribute('href', 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
  await hoja.locator('[data-pace-premium-mes]').click();
  await expect(hoja.locator('[data-pace-premium-resultado]')).toContainText('Tu prueba gratis acaba el');
  await hoja.getByRole('button', { name: 'Seguir' }).click();
  const panel = await filaPremium(page);
  await expect(panel.getByRole('button', { name: /Gestionar la suscripción/ })).toContainText('App Store');
  expect(errores).toEqual([]);
});
