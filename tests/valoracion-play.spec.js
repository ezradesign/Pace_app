/* PACE · E2E · LA VENTANA PARA VALORAR PACE EN GOOGLE PLAY Y EN LA APP STORE (punto 12 del ROADMAP)
 * ================================================================================================
 * Ez, 15 oct. 2026 («Cómo se vende PACE completo», punto 6): la valoración se pide una sola vez,
 * con la ventana de Google (In-App Review), al terminar la quinta pausa entera; Google no dice si
 * la persona valoró o la cerró, así que no se vuelve a lanzar nunca. Nunca en la bienvenida ni en
 * la web. En el iPhone, la de Apple con las mismas reglas (Ez, 4A del 28 oct.).
 *
 * El PaceValoracion falso apunta cada vez que se le pide la ventana (`__valoraciones`). Las pausas
 * se cierran con las mismas `complete*Session` que usan los runners, y su pantalla final es un
 * `[data-pace-session-root]` puesto a mano: lo que importa es que la ventana espere a que se vaya.
 *
 * QUE DEFIENDE:
 *  · Cuatro pausas enteras no la piden; la quinta, sí, y solo cuando su pantalla se ha cerrado.
 *  · Una vez en la vida: ni la sexta ni tras recargar.
 *  · Las que se terminan antes no cuentan.
 *  · En el iPhone, lo mismo: la quinta, una vez.
 *  · En la web no se apunta nada ni se pide nada.
 *  · Hasta v1 (auditoría externa 2.2, 12 nov. 2026) la quinta pausa de un tester ni la pide ni la
 *    gasta: se sigue contando, y con v1 sale al terminar la primera pausa entera. Las de antes de
 *    esa fecha simulan v1 con `PREMIUM_ABIERTO_HASTA_V1` en false tras cargar (`comoV1`).
 * NO CUBRE: que Google o Apple enseñen la ventana (tienen su tope y no lo dicen); eso, en un móvil
 * con la versión de la prueba cerrada o de TestFlight.
 *
 * Contra v0.184.0 caen las tres de Android: no hay PaceValoracion ni cuenta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

test.use({ serviceWorkers: 'block' });

/* Un Android (o un iPhone) falso con lo justo para arrancar y la pieza de la valoración. */
async function comoAndroid(context, plataforma) {
  await context.addInitScript((p) => {
    window.__valoraciones = [];
    window.Capacitor = {
      getPlatform: () => p,
      isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        PaceValoracion: { pedir: () => { window.__valoraciones.push(Date.now()); return Promise.resolve(); } },
      },
    };
  }, plataforma || 'android');
}

/* Una pausa que acaba con su pantalla final delante; `entera` como la pasa el runner. */
async function pausa(page, modo, entera) {
  await page.evaluate(([modo, entera]) => {
    if (!document.querySelector('[data-pace-prueba-fin]')) {
      const fin = document.createElement('div');
      fin.setAttribute('data-pace-session-root', '');
      fin.setAttribute('data-pace-prueba-fin', '');
      fin.setAttribute('role', 'dialog');
      document.body.appendChild(fin);
    }
    if (modo === 'respira') window.completeBreathSession('breathe.box.4', 4, 0, null, entera);
    else if (modo === 'mueve') window.completeMoveSession('extra.desk.pushups', 3, null, entera);
    else window.completeExtraSession('move.neck.3', 3, null, entera);
  }, [modo, entera]);
}

async function cerrarPantalla(page) {
  await page.evaluate(() => { const f = document.querySelector('[data-pace-prueba-fin]'); if (f) f.remove(); });
}

const pedidas = (page) => page.evaluate(() => window.__valoraciones.length);

/* El día de v1 se apaga la constante; aquí, tras cargar, como en las pruebas del cobro. */
const comoV1 = (page) => page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });

test.describe('la valoración en Google Play', () => {
  test('la quinta pausa entera la pide al cerrar su pantalla, una sola vez en la vida', async ({ page, context }) => {
    await comoAndroid(context);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoV1(page);

    for (const modo of ['respira', 'mueve', 'estira', 'respira']) { await pausa(page, modo, true); await cerrarPantalla(page); }
    await page.waitForTimeout(1500);
    expect(await pedidas(page), 'cuatro pausas no bastan').toBe(0);
    expect(await page.evaluate(() => window.getState().valoracion)).toEqual({ pausas: 4, pedida: null });

    /* La quinta: mientras su pantalla está delante, nada. */
    await pausa(page, 'mueve', true);
    await page.waitForTimeout(1500);
    expect(await pedidas(page), 'no tapa la pantalla final ni su «¿Te ayudó?»').toBe(0);
    await cerrarPantalla(page);
    await esperarEnPagina(page, () => window.__valoraciones.length === 1, null, { timeout: 12000 });
    const v = await page.evaluate(() => window.getState().valoracion);
    expect(v.pausas).toBe(5);
    expect(typeof v.pedida).toBe('number');

    /* La sexta no la vuelve a pedir, ni tras recargar. */
    await pausa(page, 'estira', true);
    await cerrarPantalla(page);
    await page.waitForTimeout(2000);
    expect(await pedidas(page)).toBe(1);
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await comoV1(page);
    await pausa(page, 'respira', true);
    await cerrarPantalla(page);
    await page.waitForTimeout(2000);
    expect(await pedidas(page), 'tras recargar, el contador de la página empieza en cero: no se pidió otra').toBe(0);
    expect((await page.evaluate(() => window.getState().valoracion)).pedida).toBe(v.pedida);
  });

  test('las pausas terminadas antes no cuentan', async ({ page, context }) => {
    await comoAndroid(context);
    await sembrar(context);
    await irAlArtefacto(page);
    await comoV1(page);
    for (let i = 0; i < 6; i++) { await pausa(page, ['respira', 'mueve', 'estira'][i % 3], false); await cerrarPantalla(page); }
    await page.waitForTimeout(1500);
    expect(await pedidas(page)).toBe(0);
    expect(await page.evaluate(() => window.getState().valoracion)).toBeUndefined();
    /* Y la entera sigue contando desde cero. */
    await pausa(page, 'respira', true);
    expect(await page.evaluate(() => window.getState().valoracion)).toEqual({ pausas: 1, pedida: null });
  });

  test('si PACE se cerró con la quinta delante, sale tras la siguiente pausa entera', async ({ page, context }) => {
    await comoAndroid(context);
    await sembrar(context, { valoracion: { pausas: 5, pedida: null } });
    await irAlArtefacto(page);
    await comoV1(page);
    await page.waitForTimeout(1500);
    expect(await pedidas(page), 'no sale al abrir PACE').toBe(0);
    await pausa(page, 'estira', true);
    await cerrarPantalla(page);
    await esperarEnPagina(page, () => window.__valoraciones.length === 1, null, { timeout: 12000 });
  });

  test('en el iPhone, la ventana de Apple con las mismas reglas: la quinta pausa entera, una vez', async ({ page, context }) => {
    await comoAndroid(context, 'ios');
    await sembrar(context);
    await irAlArtefacto(page);
    await comoV1(page);
    expect(await page.evaluate(() => window.pacePlataformaNativa())).toBe('ios');
    for (const modo of ['respira', 'mueve', 'estira', 'respira', 'mueve']) { await pausa(page, modo, true); await cerrarPantalla(page); }
    await esperarEnPagina(page, () => window.__valoraciones.length === 1, null, { timeout: 12000 });
    await pausa(page, 'estira', true);
    await cerrarPantalla(page);
    await page.waitForTimeout(2000);
    expect(await pedidas(page)).toBe(1);
    expect((await page.evaluate(() => window.getState().valoracion)).pausas).toBe(5);
  });

  test('en la web no se apunta nada ni se pide nada', async ({ page, context }) => {
    await sembrar(context);
    await irAlArtefacto(page);
    for (let i = 0; i < 6; i++) { await pausa(page, ['respira', 'mueve', 'estira'][i % 3], true); await cerrarPantalla(page); }
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => window.getState().valoracion)).toBeUndefined();
    expect(await page.evaluate(() => typeof window.Capacitor)).toBe('undefined');
  });
});

test.describe('hasta v1, la petición de un tester no se gasta (auditoría externa 2.2)', () => {
  for (const plataforma of ['android', 'ios']) {
    test(`${plataforma}: la quinta pausa entera ni pide la ventana ni la gasta; con v1, la siguiente la pide`, async ({ page, context }) => {
      await comoAndroid(context, plataforma);
      await sembrar(context);
      await context.clock.install({ time: new Date('2026-11-12T10:00:00+01:00') });
      await irAlArtefacto(page);
      expect(await page.evaluate(() => window.PREMIUM_ABIERTO_HASTA_V1), 'esta prueba es la de antes de v1').toBe(true);
      for (const modo of ['respira', 'mueve', 'estira', 'respira', 'mueve']) { await pausa(page, modo, true); await cerrarPantalla(page); }
      /* La espera mira cada medio segundo: se mueve el reloj de la página, sin esperas fijas. */
      await page.clock.runFor(5000);
      expect(await pedidas(page), 'un tester gastó la única petición antes de v1').toBe(0);
      expect(await page.evaluate(() => window.getState().valoracion), 'las pausas de antes de v1 se cuentan, y nada queda pedido').toEqual({ pausas: 5, pedida: null });

      /* Llega v1: la primera pausa entera la pide, una vez. */
      await comoV1(page);
      await pausa(page, 'estira', true);
      await cerrarPantalla(page);
      await page.clock.runFor(5000);
      expect(await pedidas(page), 'con v1 y cinco pausas hechas, la siguiente pausa entera la pide').toBe(1);
      const v = await page.evaluate(() => window.getState().valoracion);
      expect(v.pausas).toBe(6);
      expect(typeof v.pedida).toBe('number');
      await pausa(page, 'respira', true);
      await cerrarPantalla(page);
      await page.clock.runFor(5000);
      expect(await pedidas(page), 'una vez en la vida, también desde v1').toBe(1);
    });
  }
});
