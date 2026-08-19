/* PACE · EL CÍRCULO DEL GLIFO · s171
 * ==================================
 * Tres defectos que el usuario vio en su teléfono y en su portátil, y que la
 * suite no podía cazar porque nadie miraba el círculo:
 *
 *   1. las miniaturas del preview se PISABAN entre filas (5 px, medido);
 *   2. el círculo medía 72 px en 6 rutinas y 179 en las otras 22, en el mismo
 *      viewport, porque unas corren en el runner legacy y otras en el v1;
 *   3. dentro de una misma sesión el círculo se MOVÍA entre pasos (43 px).
 *
 * TODO LO DE AQUÍ ES RELACIONAL Y NO LLEVA UN SOLO NÚMERO DE PÍXELES. Un
 * aserto tipo «el círculo mide 179» caducaría en cuanto se recalibre la curva
 * —que es una decisión de diseño viva— y además no dice nada: el defecto no era
 * un tamaño equivocado, era que DOS superficies no coincidían. Lo que se
 * defiende es la igualdad y el orden, no la cifra.
 *
 * GUARD DE CERO EN CADA BUCLE. Recorrer una sesión y no encontrar ni un paso de
 * trabajo, o abrir un preview sin miniaturas, deja los `expect` sin ejecutar y
 * el test pasa en verde diciendo nada — que es el modo de fallo que s155 y s161
 * ya pagaron. Por eso cada recorrido aserta primero CUÁNTAS cosas miró.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, capturarErrores, irAlArtefacto, overlaySuperior } = require('./helpers');

/* Una v1 y una LEGACY, que es justo el par que no coincidía. Si alguna se
   migrara al contrato v1, el test de «los dos runners coinciden» dejaría de
   comparar dos runners — por eso comprueba también que sigan siendo distintas
   (abajo, con el hook `[data-pace-v1-timer]`, que solo pinta el v1). */
const RUTINA_V1 = 'Antídoto silla';
const RUTINA_LEGACY = 'Escritorio express';

test.beforeEach(async ({ context }) => { await sembrar(context); });

/* El círculo es el ANCESTRO redondo del arte (máscara o SVG). Buscarlo por su
   caja y no por un selector de clase es lo que hace que valga para los dos
   runners, que no comparten marcado más allá de `StepGlyph`. */
async function medirCirculo(page) {
  return page.evaluate(() => {
    const artes = Array.from(document.querySelectorAll('span[style*="mask"], svg'));
    for (const a of artes) {
      const p = a.parentElement;
      if (!p) continue;
      if (getComputedStyle(p).borderRadius === '50%') {
        const rc = p.getBoundingClientRect();
        return { w: Math.round(rc.width), top: Math.round(rc.top) };
      }
    }
    return null;
  });
}

async function abrirBiblioteca(page, rutina) {
  await page.getByRole('button', { name: /^Estira/ }).click();
  await page.getByRole('heading', { name: rutina, exact: true }).click();
  const preview = overlaySuperior(page);
  await expect(preview.getByText('LOS PASOS')).toBeVisible();
  return preview;
}

async function entrarEnSesion(page, rutina) {
  const preview = await abrirBiblioteca(page, rutina);
  await preview.getByRole('button', { name: 'Empezar', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  const saltar = sesion.getByRole('button', { name: 'Empezar ahora' });
  if (await saltar.isVisible().catch(() => false)) await saltar.click();
  return sesion;
}

/* Recorre la sesión y mide TODAS las pantallas que pintan glifo — trabajo y
   colocación—, no solo las de trabajo.
   La primera versión medía solo las de trabajo, y por eso daba verde mientras el
   usuario seguía viendo el salto: lo que se mueve al CAMBIAR de ejercicio es la
   pantalla de colocarse, que es justo la que aquella se saltaba. Medido antes
   del arreglo: 65 px el círculo y 94 px el nombre entre pantallas de la misma
   rutina, con tres causas distintas —cue de 3 líneas, nombre de 2 y el gate de
   tipo «ready», que no pinta contador y dejaba el bloque 130 px más corto.
   Se mide también el NOMBRE, que es la otra mitad de lo que el usuario reportó
   y lo que obligó a reservar el rótulo de fase. */
async function recorrerPantallas(page, maxPasos = 6) {
  const medidas = [];
  for (let i = 0; i < maxPasos * 3; i++) {
    const c = await medirCirculo(page);
    if (c) {
      const nombre = page.locator('[data-pace-v1-name]');
      const y = await nombre.evaluate(el => Math.round(el.getBoundingClientRect().top)).catch(() => null);
      const enTrabajo = await page.locator('[data-pace-v1-timer]').isVisible().catch(() => false);
      medidas.push({ ...c, nombreTop: y, fase: enTrabajo ? 'trabajo' : 'colocarse', paso: await nombre.innerText().catch(() => '?') });
    }
    const empezarYa = page.getByRole('button', { name: 'Empezar ya' });
    const siguiente = page.getByRole('button', { name: /^Siguiente/ });
    if (await empezarYa.isVisible().catch(() => false)) await empezarYa.click();
    else if (await siguiente.isVisible().catch(() => false)) await siguiente.click();
    else break;
    await page.waitForTimeout(140);
  }
  return medidas;
}

/* LAS DOS PIELES, y la de MÓVIL no es decorativa: es la única que estaba rota.
   Las reservas de altura que anclan el círculo existían desde s119 SOLO para
   ≥641 px, así que una versión de este test corriendo únicamente en el viewport
   del config (1280×720) habría pasado en verde ANTES del arreglo — defendiendo
   un terreno que nadie había perdido. El guard de piel (`--pace-skin`) impide
   que las dos filas midan la misma. */
for (const piel of [
  { nombre: 'móvil', w: 375, h: 812, skin: 'movil' },
  { nombre: 'escritorio', w: 1280, h: 900, skin: 'escritorio' },
]) {
  test(`el círculo no cambia de tamaño ni de sitio entre los pasos de una sesión · ${piel.nombre}`, async ({ page }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: piel.w, height: piel.h });
    await irAlArtefacto(page);

    const skinReal = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--pace-skin').trim());
    expect(skinReal, `este viewport no está pintando la piel «${piel.skin}»`).toBe(piel.skin);

    await entrarEnSesion(page, RUTINA_V1);
    const medidas = await recorrerPantallas(page);
    /* GUARD DE CERO: sin esto, un recorrido que no encuentra ni un paso deja los
       `expect` de abajo sobre listas vacías y el test pasa sin mirar nada. */
    expect(medidas.length, 'no se midió ni una pantalla — el recorrido no llegó a la sesión').toBeGreaterThan(2);
    /* Y que el recorrido haya pasado por las DOS fases: si solo viera pantallas
       de trabajo volvería a ser el test que daba verde mientras el usuario veía
       el salto. Se reconoce por el contador, que solo existe en trabajo. */
    expect([...new Set(medidas.map(m => m.fase))].sort(),
      'el recorrido no vio las dos fases: vuelve a medir solo una parte de la sesión')
      .toEqual(['colocarse', 'trabajo']);

    const anchos = [...new Set(medidas.map(m => m.w))];
    expect(anchos, `el círculo cambia de tamaño entre pantallas: ${JSON.stringify(medidas)}`).toHaveLength(1);

    /* ENTRE PANTALLAS DE TRABAJO: CERO. Es el estado durante el ejercicio y es
       donde el usuario pasa el tiempo, así que aquí no hay tolerancia. */
    const trabajo = medidas.filter(m => m.fase === 'trabajo');
    expect(trabajo.length, 'no se midió ni una pantalla de trabajo').toBeGreaterThan(1);
    expect([...new Set(trabajo.map(m => m.top))],
      `el círculo se mueve entre pasos de trabajo: ${JSON.stringify(trabajo)}`).toHaveLength(1);
    expect([...new Set(trabajo.map(m => m.nombreTop))],
      `el nombre se mueve entre pasos de trabajo: ${JSON.stringify(trabajo)}`).toHaveLength(1);

    /* CRUZANDO FASES QUEDA DEUDA, Y SE ASERTA COMO TAL EN VEZ DE ANOTARSE. Al
       entrar aquí eran 65 px de círculo y 94 de nombre; hoy son ~25 y ~29, y lo
       que queda tiene UN nombre: el gate de tipo «ready» —el que espera al
       usuario porque el paso pide suelo, cojín o pared— no pinta contador, y el
       bloque se queda por debajo del suelo que lo ancla. El techo de 30 px es un
       TRINQUETE: si alguien lo empeora, salta; si alguien lo arregla del todo,
       hay que bajarlo a 0 y borrar este párrafo. */
    const TOPE_DEUDA = 30;
    const tops = medidas.map(m => m.top);
    const nombres = medidas.map(m => m.nombreTop).filter(v => v != null);
    expect(Math.max(...tops) - Math.min(...tops),
      `el círculo se mueve más que la deuda conocida: ${JSON.stringify(medidas)}`).toBeLessThanOrEqual(TOPE_DEUDA);
    expect(Math.max(...nombres) - Math.min(...nombres),
      `el nombre se mueve más que la deuda conocida: ${JSON.stringify(medidas)}`).toBeLessThanOrEqual(TOPE_DEUDA);

    expect(errores).toEqual([]);
  });
}

test('las dos rutinas dan el mismo círculo aunque corran en runners distintos', async ({ page }) => {
  const errores = capturarErrores(page);

  await irAlArtefacto(page);
  const sesionV1 = await entrarEnSesion(page, RUTINA_V1);
  await expect(sesionV1.locator('[data-pace-v1-timer]').or(sesionV1.locator('[data-pace-v1-name]')).first()).toBeVisible();
  const v1 = await medirCirculo(page);

  await irAlArtefacto(page);
  await entrarEnSesion(page, RUTINA_LEGACY);
  const legacy = await medirCirculo(page);

  expect(v1, 'no se encontró el círculo en la rutina v1').not.toBeNull();
  expect(legacy, 'no se encontró el círculo en la rutina legacy').not.toBeNull();
  /* CONTROL POSITIVO de que siguen siendo dos runners distintos: si la legacy
     se migrara al contrato v1, este test compararía v1 consigo mismo y pasaría
     sin demostrar nada. El hook del contador v1 solo existe en aquel. */
  expect(await page.locator('[data-pace-v1-timer]').count(),
    'la rutina legacy pinta el contador del v1 — ya no son dos runners y este test dejó de comparar nada').toBe(0);

  expect(legacy.w, `el círculo del runner legacy (${legacy.w}) no coincide con el del v1 (${v1.w})`).toBe(v1.w);

  expect(errores).toEqual([]);
});

test('en escritorio el círculo es mayor que en móvil a igual altura de viewport', async ({ page }) => {
  const errores = capturarErrores(page);
  const ALTO = 812;

  await page.setViewportSize({ width: 375, height: ALTO });
  await irAlArtefacto(page);
  await entrarEnSesion(page, RUTINA_V1);
  const movil = await medirCirculo(page);

  await page.setViewportSize({ width: 1280, height: ALTO });
  await irAlArtefacto(page);
  await entrarEnSesion(page, RUTINA_V1);
  const escritorio = await medirCirculo(page);

  expect(movil, 'no se encontró el círculo en móvil').not.toBeNull();
  expect(escritorio, 'no se encontró el círculo en escritorio').not.toBeNull();
  /* La MISMA altura de viewport en las dos: así lo único que puede explicar la
     diferencia es la piel, que es la decisión que se está defendiendo, y no la
     curva por altura, que es la que ya existía. */
  expect(escritorio.w, `escritorio (${escritorio.w}) debería ser mayor que móvil (${movil.w}) a igual altura`).toBeGreaterThan(movil.w);

  expect(errores).toEqual([]);
});

/* EL PRECIO DE LA RESERVA MÓVIL, VIGILADO. s119 no aplicó las reservas en móvil
   por una razón medida: el bloque crecía y rebasaba el retrato. s171 las aplica
   igualmente —sin ellas el círculo se mueve, que es lo que el usuario reportó—
   así que el desborde que aquella sesión temía pasa a ser un aserto en vez de
   una nota. Los tres viewports son los que s119 cita por su nombre. */
for (const vp of [
  { nombre: '360x640 (el más corto que s119 midió)', w: 360, h: 640 },
  { nombre: '375x812', w: 375, h: 812 },
  { nombre: '390x844', w: 390, h: 844 },
]) {
  test(`el centro de la sesión no desborda en ${vp.nombre}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await irAlArtefacto(page);
    await entrarEnSesion(page, RUTINA_V1);
    await expect(page.locator('[data-pace-v1-timer]').first()).toBeVisible();

    const medida = await page.evaluate(() => {
      const c = document.querySelector('[data-pace-session-center]');
      if (!c) return null;
      const alto = Math.round(c.getBoundingClientRect().height);
      return { alto, scrollH: c.scrollHeight, desborde: c.scrollHeight - alto };
    });
    expect(medida, 'no se encontró el centro de la sesión').not.toBeNull();
    expect(medida.desborde, `el bloque rebasa el centro por ${medida.desborde} px`).toBeLessThanOrEqual(0);
  });
}

test('las miniaturas del preview no se pisan entre filas', async ({ page }) => {
  const errores = capturarErrores(page);
  await irAlArtefacto(page);
  await abrirBiblioteca(page, RUTINA_V1);

  const filas = await page.evaluate(() => {
    const bds = document.querySelectorAll('[data-pace-modal-backdrop]');
    const m = bds[bds.length - 1];
    const cajas = Array.from(m.querySelectorAll('span'))
      .filter(s => s.style.width === '30px' && s.style.height === '30px' && s.firstElementChild);
    return cajas.map(c => {
      const arte = c.firstElementChild.getBoundingClientRect();
      const fila = c.parentElement;
      return {
        paso: (fila.children[1] ? fila.children[1].textContent.trim() : '?'),
        arriba: +arte.top.toFixed(1), abajo: +arte.bottom.toFixed(1),
        tipo: c.firstElementChild.tagName.toLowerCase() === 'svg' ? 'SVG' : 'MASCARA',
      };
    });
  });

  /* GUARD DE CERO: una lista vacía no tiene solapes y pasaría en verde. */
  expect(filas.length, 'el preview no enseñó ni una miniatura').toBeGreaterThan(1);
  /* Y que al menos una sea MÁSCARA, o el test podría estar mirando solo glifos
     SVG —que nunca tuvieron el defecto— y dar verde mientras las máscaras se
     pisan.
     La primera versión exigía que la rutina mezclara los DOS sistemas, y esa
     premisa caducó el mismo día: al ingestar la segunda tanda, «Zancada con
     apertura» —el único paso SVG que le quedaba a esta rutina— recibió arte y
     el guard saltó. Hizo su trabajo, pero pedía algo que el proyecto está
     eliminando a propósito: cuando las 61 identidades tengan máscara no habrá
     ni una rutina mezclada. Lo que hay que exigir es lo que el defecto necesita
     para reproducirse, que es una máscara; no un SVG al lado. */
  expect(filas.filter(f => f.tipo === 'MASCARA').length,
    'ninguna miniatura es máscara: el test dejó de cubrir el caso que falló').toBeGreaterThan(0);

  for (let i = 1; i < filas.length; i++) {
    const solape = +(filas[i - 1].abajo - filas[i].arriba).toFixed(1);
    expect(solape, `«${filas[i - 1].paso}» pisa a «${filas[i].paso}» por ${solape} px`).toBeLessThanOrEqual(0);
  }

  expect(errores).toEqual([]);
});
