/* PACE · E2E · LA LETRA DE LAS EXPLICACIONES DEL RUNNER (opción A, Ez, 8 oct. 2026)
 * =================================================================================
 * El círculo del dibujo lo encogía la explicación más larga de cada rutina: cada texto tiene
 * su hueco fijo durante toda la rutina y el hueco mide lo que la frase más larga. Flexiones de
 * escritorio decía 143 letras en cuatro líneas y su círculo bajaba a 125 px a 360×640, cuando
 * en Estira medía 170 (docs/traspaso/archivos/runner-letra-8oct, rama runner-circulo-letra).
 * Ez eligió la A: la explicación en la serif itálica de la app y ninguna frase de más de 95
 * letras. Aquí se vigilan las tres cosas: el tope (en los dos idiomas, sacando cada frase con la
 * misma función que el runner), la letra y lo que de verdad importaba, el círculo.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const TOPE = 95;

test('ninguna explicación de Mueve ni de Estira pasa de 95 letras, en castellano ni en inglés', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const frases = await page.evaluate(() => {
    const S = window.PACE_STRINGS;
    const tEn = (k, fb) => (S.en && S.en[k] !== undefined ? S.en[k] : fb);
    const tEs = (k, fb) => fb;
    const out = [];
    for (const cat of [window.MOVE_ROUTINES, window.EXTRA_ROUTINES]) {
      for (const g of Object.values(cat || {})) for (const r of (g.items || [])) {
        (r.steps || []).forEach((st, i) => ['setup', 'action'].forEach((k) => {
          const es = window.v1Instr(tEs, r, i, k), en = window.v1Instr(tEn, r, i, k);
          if (es) out.push({ donde: r.id + ' paso ' + i + ' ' + k + ' (es)', texto: es });
          if (en) out.push({ donde: r.id + ' paso ' + i + ' ' + k + ' (en)', texto: en });
        }));
      }
    }
    return out;
  });
  /* GUARD: si el catálogo o la función no se leyeran, la lista saldría vacía y el aserto pasaría sin mirar. */
  expect(frases.length).toBeGreaterThan(300);
  expect(frases.filter((f) => f.texto.length > TOPE).map((f) => f.donde + ': ' + f.texto.length)).toEqual([]);
});

/* Abre una rutina por su id y espera al runner, en la pantalla de colocarse. */
async function abrirPorId(page, modulo, id) {
  await page.getByRole('button', { name: new RegExp('^' + modulo) }).first().click();
  await page.locator('.pace-lib').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
  await page.evaluate((rid) => {
    const t = [...document.querySelectorAll('[data-pace-lib-card="' + rid + '"]')].find((e) => e.getBoundingClientRect().width > 0);
    if (!t) throw new Error('no encuentro la rutina ' + rid);
    (t.querySelector('.pace-lib-hit') || t).click();
  }, id);
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  await page.getByRole('button', { name: 'Empezar ahora' }).click();
  await page.locator('[data-pace-v1-body]').first().waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
}

/* El círculo, la letra de la explicación y cuántas líneas ocupa su hueco (el de la más larga). */
function medir(page) {
  return page.evaluate(() => {
    const pila = document.querySelector('[data-pace-v1-pila="cue"]');
    const vivo = pila.lastElementChild;
    const cs = getComputedStyle(vivo);
    const lh = parseFloat(cs.lineHeight);
    const alto = Math.max(...[...pila.children].map((c) => c.getBoundingClientRect().height));
    return {
      aro: Math.round(document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect().width),
      familia: cs.fontFamily, estilo: cs.fontStyle, tam: parseFloat(cs.fontSize),
      lineas: Math.round(alto / lh),
    };
  });
}

async function runner(browser, ancho, alto, modulo, id) {
  const baseURL = test.info().project.use.baseURL;
  const movil = ancho < 768;
  const context = await browser.newContext({ baseURL, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const page = await context.newPage();
  await sembrar(context, movil ? { sidebarCollapsed: true } : {});
  await irAlArtefacto(page);
  await abrirPorId(page, modulo, id);
  const m = await medir(page);
  await context.close();
  return m;
}

test('la explicación va en la serif itálica de la app: 17 px en el móvil y 18 en escritorio', async ({ browser }) => {
  const movil = await runner(browser, 360, 640, 'Mueve', 'extra.desk.pushups');
  expect(movil.familia).toMatch(/Cormorant/);
  expect(movil.estilo).toBe('italic');
  expect(movil.tam).toBe(17);
  const esc = await runner(browser, 1280, 720, 'Mueve', 'extra.desk.pushups');
  expect(esc.familia).toMatch(/Cormorant/);
  expect(esc.tam).toBe(18);
});

/* «Cuídate» va con la misma voz que la explicación (Ez, 8 oct. 2026): su frase en la serif
   itálica, a 15 px en el móvil y 16 en escritorio; su rótulo sigue en versalitas de interfaz.
   Sale mientras se trabaja, así que se espera a que acabe la cuenta de colocarse. */
async function leerCuidate(browser, ancho, alto) {
  const baseURL = test.info().project.use.baseURL;
  const movil = ancho < 768;
  const context = await browser.newContext({ baseURL, viewport: { width: ancho, height: alto }, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  const page = await context.newPage();
  await sembrar(context, movil ? { sidebarCollapsed: true } : {});
  await irAlArtefacto(page);
  await abrirPorId(page, 'Mueve', 'extra.desk.pushups');
  await page.locator('[data-pace-v1-care]').first().waitFor({ state: 'visible', timeout: 20000 });
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-pace-v1-care]');
    const rot = c.querySelector('[data-pace-v1-care-label]');
    const cs = getComputedStyle(c), cr = getComputedStyle(rot);
    return { familia: cs.fontFamily, estilo: cs.fontStyle, tam: parseFloat(cs.fontSize), rotulo: cr.fontFamily, rotuloEstilo: cr.fontStyle };
  });
  await context.close();
  return r;
}

test('«Cuídate» va en la serif itálica (15 px en el móvil, 16 en escritorio) y su rótulo en interfaz', async ({ browser }) => {
  for (const [w, h, tam] of [[360, 640, 15], [1280, 720, 16]]) {
    const c = await leerCuidate(browser, w, h);
    expect(c.familia, w + ' px').toMatch(/Garamond/);
    expect(c.estilo).toBe('italic');
    expect(c.tam).toBe(tam);
    expect(c.rotulo).toMatch(/Inter Tight/);
    expect(c.rotuloEstilo).toBe('normal');
  }
});

/* Lo que de verdad importaba: en el móvil pequeño las dos rutinas de Mueve de frase más larga
   caben en dos líneas y su dibujo no es más pequeño que el de una rutina de Estira de frases
   cortas. Cadena posterior es la que la página de Ez usó como referencia. */
test('a 360×640 las explicaciones más largas de Mueve caben en dos líneas y su dibujo iguala al de Estira', async ({ browser }) => {
  const estira = await runner(browser, 360, 640, 'Estira', 'move.hamstrings.standing');
  for (const id of ['extra.desk.pushups', 'extra.chair.dips']) {
    const m = await runner(browser, 360, 640, 'Mueve', id);
    expect(m.lineas, id + ': su explicación más larga no cabe en dos líneas').toBeLessThanOrEqual(2);
    expect(m.aro, id + ': su dibujo queda más pequeño que el de Estira').toBeGreaterThanOrEqual(estira.aro - 1);
  }
});
