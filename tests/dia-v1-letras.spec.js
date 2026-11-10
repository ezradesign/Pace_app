/* PACE · E2E · LAS LETRAS DEL DÍA DE v1 (Ez, 7 nov. 2026: 1B 2A 3B 4A)
 * ==============================================================================
 * Lo que eligió Ez sobre la caza del día de v1 (docs/audits/caza-v1-compra-7nov.md):
 *  1B · «Borrar todo» no quita el código de PACE completo (`paceLicenciaQuedaAlBorrar`); su aviso
 *       dice «tus días, tus rutinas y tus logros», que es lo que se borra, y que el código se queda (Ez, 8 nov.).
 *  2A · a quien tiene rutinas propias, la hoja del día de v1 le dice que se quedan guardadas y
 *       desde qué día se abren con PACE completo.
 *  3B · la hoja de PACE completo sin tienda dice «Llega con la versión 1» hasta v1 y «Pronto
 *       podrás tenerlo aquí» desde v1 (en Android, el día de v1, sin la compra de Play).
 *  4A · la lista del día de v1 (`PACE_TEXTOS_V1` y `data-v1`): con el interruptor apagado, nada
 *       de la lista habla de v1 en la app, y /premium y /beta con su DIA_V1 encendido tampoco.
 * Mutantes, sobre el index.html compilado: sin `paceLicenciaQuedaAlBorrar` cae 1B; sin la línea
 * de las propias cae 2A; con `paceTextoV1` devolviendo la clave caen 3B y 4A (app); sin el bloque
 * de DIA_V1 en /premium cae 4A (web).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { irAlArtefacto, aceptarAvisosPace, abrirTusDatos, capturarErrores, CLAVE_ESTADO } = require('./helpers');
const { firmar, conLlaveDePrueba } = require('./licencia.helpers');

test.use({ serviceWorkers: 'block' });

const HOJA = '[data-pace-premium-hoja]';
const HABLA_V1 = /\bv1\b|\bversi[oó]n 1\b/i;
const { HABLA_V1_SIN_NOMBRE } = require('../scripts/verify.dia-v1.js');
const BASE = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' };
const USABA = {
  history: { days: { '2026-10-20': { focusMinutes: 50, breathMinutes: 5, moveMinutes: 6, waterGlasses: 4, holdSeconds: 0 } }, months: {}, years: {} },
  routineCounts: { 'rutina.extra.hang.bar': 2 }, moveSessionsTotal: 2, totalFocusMin: 300,
};
const PROPIA = { id: 'custom.mia', name: 'Mi pausa', steps: [{ name: 'Cuello', cue: 'Despacio', duration: 30 }] };

/* Una semilla que se escribe UNA vez: tras «Borrar todo» falta la clave y otra la volvería a poner. */
async function sembrarUnaVez(context, estado) {
  await context.addInitScript(([clave, e]) => {
    if (localStorage.getItem('__sembrado')) return;
    localStorage.setItem('__sembrado', '1');
    localStorage.setItem(clave, JSON.stringify(e));
  }, [CLAVE_ESTADO, Object.assign({}, BASE, estado)]);
}

async function enV1(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
  });
}

const guardado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || 'null'), CLAVE_ESTADO);

test.describe('1B · «Borrar todo» no quita el código', () => {
  test('tras borrar, el código y su aviso de la prueba siguen; lo demás es una instalación nueva', async ({ page, context }) => {
    const codigo = firmar({ order: 'cs_vida_1' });
    await conLlaveDePrueba(context);
    await sembrarUnaVez(context, Object.assign({}, USABA, { licencia: codigo, premiumAvisoPrueba: 'sub_1', customRoutines: [PROPIA] }));
    const errores = capturarErrores(page);
    const avisos = await aceptarAvisosPace(page);
    await irAlArtefacto(page);
    await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);

    const recarga = page.waitForEvent('load');
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await abrirTusDatos(page);
    await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
    await recarga;
    /* El aviso dice lo que se borra y que el código se queda (Ez, 8 nov.: sin el «todo»). */
    expect([...avisos]).toEqual(['Se borra lo que PACE guarda en este navegador: tus días, tus rutinas y tus logros. Tu código de PACE completo, si lo tienes, se queda. No se puede deshacer. Si quieres, exporta antes una copia.']);

    const e = await guardado(page);
    expect(e && e.licencia, 'el código se quedó').toBe(codigo);
    expect(e.premiumAvisoPrueba).toBe('sub_1');
    expect(e.firstSeen == null, 'la bienvenida vuelve a salir').toBe(true);
    expect(e.customRoutines).toEqual([]);
    expect(Object.keys((e.history && e.history.days) || {})).toEqual([]);
    expect(e.routineCounts || {}).toEqual({});
    await expect(page.locator('[role=dialog][data-pace-scene-card]')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.hasPremiumEntitlement())).toBe(true);
    expect(errores).toEqual([]);
  });

  test('CONTROL · sin código, «Borrar todo» lo borra todo, como siempre', async ({ page, context }) => {
    await sembrarUnaVez(context, USABA);
    await aceptarAvisosPace(page);
    await irAlArtefacto(page);
    const recarga = page.waitForEvent('load');
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await abrirTusDatos(page);
    await page.getByRole('button', { name: 'Borrar todos mis datos' }).click();
    await recarga;
    await expect(page.locator('[role=dialog][data-pace-scene-card]')).toBeVisible();
    const e = await guardado(page);
    expect(e === null || (e.licencia == null && e.firstSeen == null)).toBe(true);
  });
});

test.describe('2A · la hoja del día de v1 cuenta las rutinas propias', () => {
  for (const [lang, linea] of [
    ['es', (f) => 'Tus rutinas propias se quedan guardadas; desde el ' + f + ' se abren con PACE completo.'],
    ['en', (f) => 'Your own routines stay saved; from ' + f + ', they open with PACE Complete.'],
  ]) {
    test('con rutinas propias sale la línea, con su fecha (' + lang + ')', async ({ page, context }) => {
      await enV1(context);
      await sembrarUnaVez(context, Object.assign({}, USABA, { lang, customRoutines: [PROPIA] }));
      await irAlArtefacto(page);
      const hoja = page.locator('[data-pace-premium-hoja="pasov1"]');
      await expect(hoja).toBeVisible({ timeout: 10000 });
      const fecha = await page.evaluate((l) => new Date(window.getState().pasoV1.hasta)
        .toLocaleDateString(l === 'en' ? 'en-GB' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' }), lang);
      await expect(hoja.locator('[data-pace-pasov1-propias]')).toHaveText(linea(fecha));
    });
  }

  test('CONTROL · sin rutinas propias, la hoja no la dice', async ({ page, context }) => {
    await enV1(context);
    await sembrarUnaVez(context, USABA);
    await irAlArtefacto(page);
    const hoja = page.locator('[data-pace-premium-hoja="pasov1"]');
    await expect(hoja).toBeVisible({ timeout: 10000 });
    await expect(hoja.locator('[data-pace-pasov1-propias]')).toHaveCount(0);
    await expect(hoja).not.toContainText('rutinas propias');
  });
});

test.describe('3B · la hoja de PACE completo sin tienda, el día de v1', () => {
  test('en Android sin la compra de Play: «Llega cuando salga a la venta» hasta v1 y «Pronto podrás tenerlo aquí» desde v1', async ({ page, context }) => {
    await context.addInitScript(() => { window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true }; });
    await sembrarUnaVez(context, {});
    await irAlArtefacto(page);
    const invitar = async () => {
      await page.evaluate(() => window.paceAbrirPremium({ nombre: 'Colgarse' }));
      await page.locator(HOJA).waitFor({ state: 'visible' });
    };
    const cerrar = async () => {
      await page.locator(HOJA).getByRole('button', { name: /Ahora no|Not now/ }).click();
      await expect(page.locator(HOJA)).toHaveCount(0);
    };
    await invitar();
    await expect(page.locator('[data-pace-premium-v1]')).toHaveText('Llega cuando salga a la venta.');
    await cerrar();

    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    await invitar();
    await expect(page.locator('[data-pace-premium-v1]')).toHaveText('Pronto podrás tenerlo aquí.');
    await expect(page.locator('[data-pace-premium-tengo]')).toHaveCount(0);
    await cerrar();

    await page.evaluate(() => window.setState({ lang: 'en' }));
    await invitar();
    await expect(page.locator('[data-pace-premium-v1]')).toHaveText('You’ll be able to get it here soon.');
    await expect(page.locator(HOJA)).not.toContainText(HABLA_V1);
  });
});

test.describe('4A · la lista del día de v1', () => {
  test('en la app: con el interruptor encendido dice lo de hoy; apagado, nada de la lista habla de v1, en es ni en en', async ({ page, context }) => {
    await sembrarUnaVez(context, {});
    await irAlArtefacto(page);
    const leer = () => page.evaluate(() => Object.keys(window.PACE_TEXTOS_V1).map((k) => {
      const d = window.paceTextoV1(k);
      return { k, d, es: d && window.PACE_STRINGS.es[d], en: d && window.PACE_STRINGS.en[d] };
    }));
    const hoy = await leer();
    expect(hoy.map((x) => x.d)).toEqual(hoy.map((x) => x.k));
    /* Desde la 4A de Ez (10 nov.) ninguno dice «v1»: dicen «mientras está en pruebas» y «cuando salga a la venta». */
    expect(hoy.some((x) => HABLA_V1.test(x.es) || HABLA_V1.test(x.en)), 'hoy alguno dice «v1»').toBe(false);
    expect(hoy.some((x) => HABLA_V1_SIN_NOMBRE.test(x.es) || HABLA_V1_SIN_NOMBRE.test(x.en)), 'hoy alguno habla de v1 sin nombrarlo').toBe(true);

    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    const despues = await leer();
    expect(despues.map((x) => x.k)).toEqual(['premium.v1', 'premium.onb.abierto.lede', 'premium.onb.abierto.precios', 'premium.onb.abierto.aviso']);
    despues.forEach((x) => {
      if (x.d === null) return;
      expect(x.d, x.k + ' cambia').not.toBe(x.k);
      expect(typeof x.es === 'string' && typeof x.en === 'string', x.d + ' existe').toBe(true);
      expect(x.es + ' · ' + x.en).not.toMatch(HABLA_V1);
      expect(x.es + ' · ' + x.en).not.toMatch(HABLA_V1_SIN_NOMBRE);
    });
  });

  /* El día de v1 se pone `var DIA_V1 = true;` en las dos páginas: aquí, con page.route. */
  for (const [ruta, mira] of [['/premium/', '#precio'], ['/beta/', '#pasos']]) {
    test(ruta + ' con DIA_V1 encendido no dice v1 en ningún idioma; apagado, dice lo de hoy', async ({ page }) => {
      const errores = capturarErrores(page);
      await page.goto(ruta);
      expect(await page.locator('body').innerText(), 'hoy sí lo dice').toMatch(HABLA_V1);

      await page.route((url) => url.pathname === ruta, async (route) => {
        const r = await route.fetch();
        const body = await r.text();
        if (body.indexOf('var DIA_V1 = false;') === -1) throw new Error('no encuentro DIA_V1 en ' + ruta);
        await route.fulfill({ response: r, body: body.replace('var DIA_V1 = false;', 'var DIA_V1 = true;') });
      });
      await page.goto(ruta + '?lang=es');
      expect(await page.locator('body').innerText()).not.toMatch(HABLA_V1);
      if (ruta === '/premium/') {
        await expect(page.locator('.plato[data-plan="mes"] .pronto')).toHaveText('Pronto podrás tenerlo aquí');
        await expect(page.locator('[data-venta="apagada"]')).toHaveText('IVA incluido.');
      }
      await expect(page.locator(mira).first()).toBeVisible();
      await page.locator('[data-idioma]').click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(await page.locator('body').innerText()).not.toMatch(HABLA_V1);
      if (ruta === '/premium/') await expect(page.locator('.plato[data-plan="mes"] .pronto')).toHaveText('You’ll be able to get it here soon');
      expect(errores.filter((x) => !/Failed to load resource/.test(x))).toEqual([]);
    });
  }
});
