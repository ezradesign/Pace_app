/* PACE · tests/transicion-biblioteca.spec.js (sesión 174)
   ========================================================
   LA CAPITULAR VUELA DE LA TARJETA A LA SESIÓN. Lo que se defiende:

   · QUE EL RELEVO NO SALTE. El arte de la cuenta atrás y el círculo del paso
     tienen que medir LO MISMO y estar EN EL MISMO SITIO: si se desviaran, al
     acabar la cuenta el dibujo daría un brinco, que es justo lo que la
     transición existe para evitar. Se comparan los dos, no se escribe ninguna
     cifra aquí -- el tamaño es una decisión viva (`v1GlyphSizeAhora`).
   · QUE VUELE EN LAS DOS PIELES. En móvil no volaba: la tarjeta de «Para
     ahora» está DOS veces en el DOM y el código cogía la copia oculta. El
     defecto no se veía leyendo y no lo habría cazado ningún aserto de la
     biblioteca.
   · QUE REDUCED-MOTION NO ANIME NADA, y que aun así se entre en la sesión. Una
     transición no puede ser la razón de que alguien no pueda empezar.
   · QUE RESPIRA NO SE ENTERE. Sus rutinas no tienen `steps`, así que su
     preparación tiene que seguir siendo la de siempre.
*/
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

/* Abre la biblioteca y lanza la PRIMERA tarjeta que se ve. «La que se ve» y no
   «la primera»: ver la cabecera de este archivo. */
async function lanzarPrimera(page, boton) {
  await page.getByRole('button', { name: boton }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  const id = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.pace-lib .pace-lib-hit'))
      .find(e => e.getBoundingClientRect().width > 0);
    if (!b) return null;
    b.click();
    return b.closest('[data-pace-lib-card]').getAttribute('data-pace-lib-card');
  });
  expect(id).toBeTruthy();
  await overlaySuperior(page).getByRole('button', { name: 'Empezar', exact: true }).click();
  return id;
}

/* El círculo del arte: ancho y centro, para poder comparar dos pantallas. */
function medirArte(page, selector) {
  return page.evaluate((sel) => {
    const caja = document.querySelector(sel);
    const circulo = caja && caja.firstElementChild;
    if (!circulo) return null;
    const r = circulo.getBoundingClientRect();
    return { w: Math.round(r.width), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) };
  }, selector);
}

test.beforeEach(async ({ context }) => { await sembrar(context); });

test('la cuenta atrás y el paso pintan el MISMO círculo, en el mismo sitio', async ({ page }) => {
  await irAlArtefacto(page);
  await lanzarPrimera(page, /^Estira/);
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
  const enPrep = await medirArte(page, '[data-pace-session-prep-art]');
  expect(enPrep).not.toBeNull();
  expect(enPrep.w).toBeGreaterThan(0);          // guard de cero

  await sesion.getByRole('button', { name: 'Empezar ahora' }).click();
  /* el círculo del paso: el ancestro redondo del arte, igual que lo busca
     `runner-circulo.spec.js` -- así este aserto no depende de una clase */
  const enPaso = await page.evaluate(() => {
    const artes = Array.from(document.querySelectorAll('span[style*="mask"], svg'));
    for (const a of artes) {
      const p = a.parentElement;
      if (p && getComputedStyle(p).borderRadius === '50%') {
        const r = p.getBoundingClientRect();
        return { w: Math.round(r.width), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2) };
      }
    }
    return null;
  });
  expect(enPaso).not.toBeNull();
  expect(enPaso.w).toBe(enPrep.w);
  /* EL RELEVO ES EXACTO, y esta cifra no es una tolerancia elegida a ojo:
     medido en s174, con la preparación centrada (como estaba) el círculo
     saltaba 171 px en escritorio y 221 en móvil. Anclando la pantalla como el
     runner y poniendo el círculo el primero, el salto es CERO en las dos
     pieles. Se deja 1 px de holgura por el redondeo del centro, no por el
     layout: si vuelve a moverse, es que alguien tocó el anclaje. */
  expect(Math.abs(enPaso.cx - enPrep.cx)).toBeLessThanOrEqual(1);
  expect(Math.abs(enPaso.cy - enPrep.cy)).toBeLessThanOrEqual(1);
});

for (const [piel, w, h] of [['escritorio', 1280, 720], ['móvil', 360, 730]]) {
  test('la capitular vuela de verdad · ' + piel, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await irAlArtefacto(page);
    const id = await lanzarPrimera(page, /^Estira/);
    /* SE ESPERA AL CLON, no se mira y ya. El vuelo no empieza en el click:
       arranca en el primer rAF DESPUÉS de que la preparación se monte, así que
       mirar inmediatamente da «no hay clon» -- y así pasó, en verde para móvil
       y en rojo para escritorio, por puro azar de milisegundos. Un aserto que
       depende de qué tan rápido va la máquina no defiende nada (s162). */
    await expect.poll(() => page.locator('[data-pace-vuelo]').count(), { timeout: 2000 })
      .toBeGreaterThan(0);
    const vuelo = await page.evaluate(() => {
      const c = document.querySelector('[data-pace-vuelo]');
      const caja = document.querySelector('[data-pace-session-prep-art]');
      const arte = caja && caja.firstElementChild && caja.firstElementChild.firstElementChild;
      return {
        hayClon: !!c,
        anchoClon: c ? Math.round(c.getBoundingClientRect().width) : null,
        destino: arte ? getComputedStyle(arte).visibility : null,
      };
    });
    expect(vuelo.hayClon).toBe(true);
    expect(vuelo.destino).toBe('hidden');
    /* control positivo de que SE MUEVE: a mitad de camino el clon no mide ni lo
       que la capitular (62) ni lo que el círculo de destino */
    const enPrep = await medirArte(page, '[data-pace-session-prep-art]');
    expect(vuelo.anchoClon).toBeGreaterThan(60);
    expect(vuelo.anchoClon).toBeLessThan(enPrep.w);

    /* Y AL TERMINAR NO QUEDA RASTRO, ni el destino se queda invisible. Esto
       cubre los DOS caminos de limpieza —el final de la animación y la red de
       seguridad por si nunca llega—, que es lo que se quiere: la promesa es que
       el arte vuelva, no por cuál de los dos. Calibrado en rojo matando los dos
       a la vez; matando uno solo sigue verde, con razón. */
    await expect.poll(() => page.locator('[data-pace-vuelo]').count(), { timeout: 3000 }).toBe(0);
    const tras = await page.evaluate(() => {
      const caja = document.querySelector('[data-pace-session-prep-art]');
      const arte = caja && caja.firstElementChild && caja.firstElementChild.firstElementChild;
      return arte ? getComputedStyle(arte).visibility : null;
    });
    expect(tras).toBe('visible');
    expect(id).toBeTruthy();
  });
}

test('con reduced-motion no vuela nada, y la sesión entra igual', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await irAlArtefacto(page);
  await lanzarPrimera(page, /^Estira/);
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
  expect(await page.locator('[data-pace-vuelo]').count()).toBe(0);
  /* Y SE ESPERA A QUE PUDIERA HABER VOLADO. Mirar sólo en este instante hacía
     que el aserto pasara aunque la preferencia se ignorase: el vuelo no empieza
     en el click sino en el primer rAF tras montarse la preparación. Con el
     guard quitado, el clon aparecía unos frames después y nadie lo veía --
     medido calibrando en rojo. 700 ms cubre de sobra el arranque del vuelo
     (520 ms de animación) sin depender de lo rápida que sea la máquina. */
  await page.waitForTimeout(700);
  expect(await page.locator('[data-pace-vuelo]').count()).toBe(0);
  /* lo que NO puede pasar es que el arte se quede escondido porque nadie lo
     destapó: sin vuelo, nadie lo esconde */
  const arte = await page.evaluate(() => {
    const caja = document.querySelector('[data-pace-session-prep-art]');
    const a = caja && caja.firstElementChild && caja.firstElementChild.firstElementChild;
    return a ? getComputedStyle(a).visibility : null;
  });
  expect(arte).toBe('visible');
});

test('Respira conserva su cuenta atrás de siempre, sin arte', async ({ page }) => {
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
  /* una SIN modal de seguridad (las 6 con `safety` abren guía antes) */
  await page.getByRole('heading', { name: 'Diafragmática', exact: true }).click();
  const sesion = page.locator('[data-pace-session-root]');
  await expect(sesion.getByText('PREPÁRATE')).toBeVisible();
  expect(await page.locator('[data-pace-session-prep-art]').count()).toBe(0);
  /* y su numeral sigue siendo el grande de siempre, no el del círculo */
  const num = page.locator('[data-pace-session-prep-num]');
  await expect(num).toBeVisible();
  expect(await num.getAttribute('data-pace-prep-en-arte')).toBeNull();
});
