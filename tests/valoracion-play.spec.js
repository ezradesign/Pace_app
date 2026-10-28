/* PACE · E2E · LA VENTANA PARA VALORAR PACE EN GOOGLE PLAY (punto 12 del ROADMAP)
 * ===============================================================================
 * Ez, 15 oct. 2026 («Cómo se vende PACE completo», punto 6): la valoración se pide una sola vez,
 * con la ventana de Google (In-App Review), al terminar la quinta pausa entera; Google no dice si
 * la persona valoró o la cerró, así que no se vuelve a lanzar nunca. Nunca en la bienvenida ni en
 * la web.
 *
 * El PaceValoracion falso apunta cada vez que se le pide la ventana (`__valoraciones`). Las pausas
 * se cierran con las mismas `complete*Session` que usan los runners, y su pantalla final es un
 * `[data-pace-session-root]` puesto a mano: lo que importa es que la ventana espere a que se vaya.
 *
 * QUE DEFIENDE:
 *  · Cuatro pausas enteras no la piden; la quinta, sí, y solo cuando su pantalla se ha cerrado.
 *  · Una vez en la vida: ni la sexta ni tras recargar.
 *  · Las que se terminan antes no cuentan.
 *  · En la web no se apunta nada ni se pide nada.
 * NO CUBRE: que Google enseñe la ventana (tiene su tope y no lo dice); eso, en un móvil con la
 * versión de la prueba cerrada.
 *
 * Contra v0.184.0 caen las tres de Android: no hay PaceValoracion ni cuenta.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

test.use({ serviceWorkers: 'block' });

/* Un Android falso con lo justo para arrancar y la pieza de la valoración. */
async function comoAndroid(context) {
  await context.addInitScript(() => {
    window.__valoraciones = [];
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        PaceValoracion: { pedir: () => { window.__valoraciones.push(Date.now()); return Promise.resolve(); } },
      },
    };
  });
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

test.describe('la valoración en Google Play', () => {
  test('la quinta pausa entera la pide al cerrar su pantalla, una sola vez en la vida', async ({ page, context }) => {
    await comoAndroid(context);
    await sembrar(context);
    await irAlArtefacto(page);

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
    await page.waitForTimeout(1500);
    expect(await pedidas(page), 'no sale al abrir PACE').toBe(0);
    await pausa(page, 'estira', true);
    await cerrarPantalla(page);
    await esperarEnPagina(page, () => window.__valoraciones.length === 1, null, { timeout: 12000 });
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
