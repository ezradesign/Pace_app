/* PACE · E2E · EL ESTANTE DE VIAJES (s186)
 * ========================================
 * La Fase 5 del ROADMAP pide «separar Tecnicas de Viajes». Esto es esa
 * separacion, y lo que estos asertos defienden no es un estilo: es que **un
 * viaje no participa de las reglas del catalogo**.
 *
 * EL MECANISMO ES ESTRUCTURAL, no una lista de excepciones: los viajes llegan a
 * `LibraryShell` por su propia prop y nunca entran en `todas`, asi que el
 * filtro, el contador de los chips y «Para ahora» no los ven.
 *
 * Y AQUI HAY QUE SER EXACTO CON LO QUE PRUEBAN LOS ASERTOS 3 Y 4, porque su
 * mutante NO muerde y esta comprobado: meter los viajes en `todas` no cambia
 * NADA en pantalla, porque ese `useMemo` depende de `[groups]` y se calcula al
 * arrancar la app, cuando `window.BREATHE_VIAJES` todavia esta vacia. O sea que
 * la mezcla ni siquiera puede manifestarse durante la sesion.
 *
 * Asi que 3 y 4 son GUARDIAS, no pruebas: cazarian un refactor que recalculara
 * el pozo con los viajes dentro, y NO cazarian a alguien que escribiera un
 * viaje directamente en `BREATHE_ROUTINES` -- ese catalogo es un `const` y no se
 * alcanza desde la pagina. Lo que de verdad sostiene la regla es la ESTRUCTURA
 * (llegan por otra prop), no estos dos asertos.
 *
 * POR QUE SE SIEMBRA EL VIAJE EN LUGAR DE USAR UNO REAL: en produccion
 * `window.BREATHE_VIAJES` esta VACIA a proposito -- el contenido CTB esta fuera
 * de la v1 (decision del usuario, s180) y lo que entra es el sitio. Se siembra
 * en el mismo lugar del que saldra el dato de verdad, que es lo mas parecido a
 * probar el camino real sin inventarse contenido.
 *
 * LO QUE ESTE SPEC NO PRUEBA, y se dice: que un viaje SE EJECUTE. No hay runner
 * de viajes todavia; el guion y la pantalla estan en
 * `docs/proposals/ctb-marea-baja.html` y nada mas. Por eso el aserto de la
 * puerta llega hasta el modal de seguridad y ahi se cancela.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

test.beforeEach(async ({ context }) => { await sembrar(context); });

const VIAJE = {
  id: 'breathe.viaje.prueba', name: 'Marea baja',
  desc: 'Cinco tramos, tres rondas y dos retenciones.',
  min: 25, tramos: 5, safety: true,
};

const abrirRespira = (page) => page.getByRole('button', { name: /^Respira/ }).click();

async function sembrarViaje(page, viaje) {
  await page.evaluate((v) => { window.BREATHE_VIAJES = [v]; }, viaje || VIAJE);
}

/* ------------------------------------------------------------------ 1 */
test('sin viajes no se pinta NADA: ni estante ni cabecera', async ({ page }) => {
  await irAlArtefacto(page);
  await abrirRespira(page);
  await expect(page.locator('[data-pace-lib-card]').first()).toBeVisible();

  expect(await page.locator('[data-pace-lib-viajes]').count(),
    'se pinta el estante sin un solo viaje que poner dentro').toBe(0);
  await expect(page.getByRole('heading', { name: 'Viajes', exact: true }))
    .toHaveCount(0);
});

/* ------------------------------------------------------------------ 2 */
test('con un viaje, el estante va ARRIBA y con otra tarjeta', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarViaje(page);
  await abrirRespira(page);

  const estante = page.locator('[data-pace-lib-viajes]');
  await expect(estante, 'el estante no aparece con un viaje sembrado').toHaveCount(1);
  await expect(estante).toContainText('Marea baja');
  await expect(estante).toContainText('25');
  await expect(estante, 'no dice cuantos tramos tiene').toContainText('5 tramos');
  await expect(estante, 'no dice que lleva musica').toContainText('con música');

  const tarjeta = estante.locator('[data-pace-lib-card="breathe.viaje.prueba"]');
  await expect(tarjeta, 'la tarjeta de viaje no se distingue de una tecnica')
    .toHaveClass(/pace-lib-card-viaje/);

  /* ARRIBA no es una opinion: su borde superior esta por encima del primer
     rotulo de grupo del catalogo. */
  const yEstante = (await estante.boundingBox()).y;
  const yGrupo = (await page.locator('.pace-lib-grp').first().boundingBox()).y;
  expect(yEstante, 'el estante no esta por encima del catalogo').toBeLessThan(yGrupo);
});

/* ------------------------------------------------------------------ 3 */
test('los chips NO cuentan los viajes', async ({ page }) => {
  await irAlArtefacto(page);
  await abrirRespira(page);
  const chip = page.locator('.pace-lib-chip').first();
  const antes = (await chip.innerText()).trim();

  /* Se cierra, se siembra y se vuelve a abrir: el contador se recalcula en cada
     render, asi que si el viaje entrase en el catalogo la cifra cambiaria. */
  await page.keyboard.press('Escape');
  await sembrarViaje(page, Object.assign({}, VIAJE, { min: 2 }));   // corto A PROPOSITO
  await abrirRespira(page);
  await expect(page.locator('[data-pace-lib-viajes]')).toHaveCount(1);

  const despues = (await page.locator('.pace-lib-chip').first().innerText()).trim();
  expect(despues, 'el chip cuenta el viaje: ha entrado en el catalogo de tecnicas')
    .toBe(antes);
});

/* ------------------------------------------------------------------ 4 */
test('«Para ahora» nunca propone un viaje', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarViaje(page, Object.assign({}, VIAJE, { min: 2, safety: false }));
  await abrirRespira(page);
  await expect(page.locator('[data-pace-lib-viajes]')).toHaveCount(1);

  const ahora = page.locator('[data-pace-lib-now]');
  const n = await ahora.count();
  for (let i = 0; i < n; i++) {
    await expect(ahora.nth(i), '«Para ahora» propone un viaje: cabe donde estas es otra cosa')
      .not.toContainText('Marea baja');
  }
});

/* ------------------------------------------------------------------ 5 */
test('un viaje con retencion pasa por la MISMA puerta que una tecnica', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarViaje(page);
  await abrirRespira(page);

  await page.locator('[data-pace-lib-card="breathe.viaje.prueba"]')
    .getByRole('button', { name: 'Marea baja' }).click();

  const modal = overlaySuperior(page);
  await expect(modal.getByRole('button', { name: 'Empezar sesión' }),
    'un viaje con `safety` se salta el modal de seguridad').toBeVisible();
  /* Y aqui se para: no hay runner de viajes todavia. */
  await modal.getByRole('button', { name: 'Cancelar' }).click();
});

/* ------------------------------------------------------------------ 6 */
test('un viaje PREMIUM esta cerrado como cualquier otra rutina de pago', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarViaje(page, Object.assign({}, VIAJE, { access: 'premium', safety: false }));
  await abrirRespira(page);

  /* EL AGUJERO QUE ESTO CIERRA: `canAccessRoutine` resuelve el id preguntando
     al catalogo y es FAIL-OPEN con los ids que no conoce, asi que un viaje de
     pago se abriria gratis si el lookup no mirase tambien en su lista. */
  const abierto = await page.evaluate(() => window.canAccessRoutine('breathe.viaje.prueba'));
  expect(abierto, 'un viaje premium se abre sin premium: el guard no lo conoce').toBe(false);

  const tarjeta = page.locator('[data-pace-lib-card="breathe.viaje.prueba"]');
  await expect(tarjeta, 'la tarjeta no se marca como bloqueada').toHaveAttribute('data-locked', '1');
  await expect(tarjeta).toContainText('Pronto');
});

/* ------------------------------------------------------------------ 7 */
test('la tarjeta de viaje lleva los pulmones del modulo, detras y sin voz', async ({ page }) => {
  await irAlArtefacto(page);
  await sembrarViaje(page);
  await abrirRespira(page);

  const m = await page.evaluate(() => {
    const c = document.querySelector('[data-pace-lib-card="breathe.viaje.prueba"]');
    const marca = c && c.querySelector('.pace-lib-viaje-marca');
    if (!marca) return null;
    const txt = c.querySelector('.pace-lib-txt');
    return {
      svg: !!marca.querySelector('svg'),
      oculta: marca.getAttribute('aria-hidden') === 'true',
      zMarca: Number(getComputedStyle(marca).zIndex) || 0,
      zTexto: Number(getComputedStyle(txt).zIndex) || 0,
      recorta: getComputedStyle(c).overflow === 'hidden',
    };
  });

  expect(m, 'la tarjeta de viaje no lleva la marca del modulo').not.toBeNull();
  expect(m.svg, 'la marca no dibuja nada').toBe(true);
  /* DECORATIVA: el nombre y la duracion ya lo dicen todo, y un dibujo que se
     anuncia en el arbol de accesibilidad solo mete ruido. */
  expect(m.oculta, 'la marca no esta oculta para un lector de pantalla').toBe(true);
  expect(m.zMarca, 'la marca no queda DETRAS del texto').toBeLessThan(m.zTexto);
  /* Sangra por el borde: sin recorte, el dibujo se saldria de la tarjeta. */
  expect(m.recorta, 'la tarjeta no recorta: el dibujo sangraria fuera').toBe(true);
});

/* ------------------------------------------------------------------ 8 */
for (const paleta of ['crema', 'oscuro']) {
  test('el texto de la tarjeta de viaje se lee sobre su lavado · ' + paleta, async ({ page, context }) => {
    /* EL LAVADO SE ELIGIO MIRANDOLO (s187) y se compone con tokens
       -- `--breathe-soft` sobre `--paper-2`-, asi que un cambio de paleta o un
       token que alguien aclare puede dejar el cuerpo por debajo de AA sin que
       nadie lo note. Esto lo mide EN LA PAGINA, con los colores computados. */
    await context.addInitScript((p) => {
      const clave = 'pace.state.v2';
      const s = JSON.parse(localStorage.getItem(clave) || '{}');
      s.palette = p;
      localStorage.setItem(clave, JSON.stringify(s));
    }, paleta);
    await irAlArtefacto(page);
    await sembrarViaje(page);
    await abrirRespira(page);

    const r = await page.evaluate(() => {
      const canal = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      const lum = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
      const rgb = (s) => (s.match(/\d+/g) || []).map(Number).slice(0, 3);
      const ratio = (a, b) => {
        const x = lum(a), y = lum(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const c = document.querySelector('[data-pace-lib-card="breathe.viaje.prueba"]');
      const fondo = rgb(getComputedStyle(c).backgroundColor);
      const cuerpo = rgb(getComputedStyle(c.querySelector('.pace-lib-txt > p')).color);
      const meta = rgb(getComputedStyle(c.querySelector('.pace-lib-ctx')).color);
      return { paleta: document.documentElement.getAttribute('data-palette'),
               cuerpo: ratio(fondo, cuerpo), meta: ratio(fondo, meta) };
    });

    expect(r.paleta, 'GUARD: la paleta no se aplico').toBe(paleta);
    expect(r.cuerpo, 'el cuerpo de la tarjeta de viaje no llega a 4,5:1').toBeGreaterThanOrEqual(4.5);
    expect(r.meta, 'la linea de datos no llega a 4,5:1').toBeGreaterThanOrEqual(4.5);
  });
}
