/* PACE · el reparto del runner de Mueve y Estira que dibujó Ez (tercera vuelta, 29 oct. 2026)
 * ==========================================================================================
 * Lo que Ez contestó en la maqueta (docs/proposals/runner-saltar-debajo-29oct.html):
 *   · cada pastilla («+15 s», «Saltar este paso», «Con una basta») centrada bajo su etiqueta, en
 *     una sola fila y con su hueco siempre;
 *   · «Auto» debajo de las palabras de los botones, en el móvil y en el ordenador; por debajo de
 *     700 px de alto, junto a «Siguiente», porque debajo no cabe;
 *   · el círculo crece donde sobra aire, con tope, y nunca encoge; el bloque, junto y centrado;
 *   · «Colócate sin prisa · pulsa «Empezar ya»», que nombra el botón por su palabra;
 *   · durante el 3, 2, 1 de la pausa, «Al reanudar, 3, 2, 1…» ya sobra.
 *
 * Los tamaños del círculo de «hoy» son los de la rama antes del cambio (la tabla de la maqueta):
 * es un trinquete, el círculo no puede volver a encoger. El reloj va instalado (`runFor`).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

async function abrirRutina(page, biblioteca, id) {
  await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|^\s*Start/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
/* Un contexto del tamaño pedido (móvil por debajo de 700 de ancho), con la rutina abierta. */
async function abrir(browser, baseURL, w, h, id, extra) {
  const movil = w < 700;
  const context = await browser.newContext({ baseURL, viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
  const page = await context.newPage();
  await sembrar(context, Object.assign({ cuerpoAuto: false, sidebarCollapsed: w < 1000 }, extra || {}));
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await irAlArtefacto(page);
  await abrirRutina(page, extra && extra.lang === 'en' ? 'Move' : 'Mueve', id);
  await page.clock.runFor(300);
  return { context, page };
}
const flecha = (page) => page.locator('[data-pace-v1-btn="next"]');
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');
const nombre = async (page) => (await page.locator('[data-pace-v1-name]').textContent()).trim();
const caja = (page, sel) => page.locator(sel).first().boundingBox();
const circulo = async (page) => Math.round((await caja(page, '[data-pace-v1-glyph]')).height);

/* La pastilla que se ve, centrada bajo la etiqueta del número y no a su lado; con `alLado` (el
   móvil más pequeño, donde debajo no cabe), a su derecha y en su fila. */
async function bajoSuEtiqueta(page, sel, cuando, alLado) {
  const [p, l] = await Promise.all([caja(page, sel), caja(page, '[data-pace-v1-numlabel]')]);
  expect(p, cuando + ': no se ve la pastilla').not.toBeNull();
  if (alLado) {
    expect(Math.abs((p.y + p.height / 2) - (l.y + l.height / 2)), cuando + ': la pastilla no va en la fila de su etiqueta').toBeLessThanOrEqual(2);
    expect(p.x, cuando + ': la pastilla pisa su etiqueta').toBeGreaterThanOrEqual(l.x + l.width);
    return;
  }
  expect(Math.abs((p.x + p.width / 2) - (l.x + l.width / 2)), cuando + ': la pastilla no va centrada bajo su etiqueta').toBeLessThanOrEqual(2);
  expect(p.y, cuando + ': la pastilla va junto a la etiqueta, no debajo').toBeGreaterThanOrEqual(l.y + l.height);
}
const grupo = async (page) => { const b = await caja(page, '.pace-v1-numgrupo'); return [b.y, b.height].map(Math.round); };

test.describe('El reparto del runner (Ez, 29 oct.)', () => {
  test('r-1 · cada pastilla, centrada bajo su etiqueta en su hueco de siempre; «Con una basta» no añade otra fila', async ({ browser, baseURL }) => {
    test.setTimeout(120000);
    const { context, page } = await abrir(browser, baseURL, 360, 740, 'extra.banda.espalda');
    const errores = capturarErrores(page);
    expect(await fase(page)).toBe('place');
    await bajoSuEtiqueta(page, '[data-pace-v1-mas]', 'al colocarse');
    const colocarse = await grupo(page);
    await flecha(page).click(); await page.clock.runFor(300);
    await bajoSuEtiqueta(page, '[data-pace-v1-saltar]', 'en la apertura con banda');
    expect(await grupo(page), 'el número se movió al cambiar de pastilla').toEqual(colocarse);
    await flecha(page).click(); await page.clock.runFor(300);
    expect(await nombre(page)).toBe('Descanso');
    /* Sin pastilla, su hueco sigue: nada sube ni baja. */
    await expect(page.locator('.pace-v1-numgrupo .pace-v1-mas')).toHaveCount(0);
    expect(await grupo(page), 'sin pastilla, el número se movió').toEqual(colocarse);
    /* «Levántate y sube» lleva «Con una basta» en sus descansos, en el mismo hueco: el grupo del
       número mide lo mismo que en una rutina sin ella (antes llevaba una fila más, 30 px). */
    await page.locator('[data-pace-session-header] button').last().click();
    await abrirRutina(page, 'Mueve', 'extra.chair.squats');
    await page.clock.runFor(300);
    expect((await grupo(page))[1], '«Con una basta» suma una fila al número').toBe(colocarse[1]);
    /* Sin Auto: colocarse y la primera serie, a tu ritmo, se pasan con la flecha. */
    for (let i = 0; i < 4 && !(await page.locator('[data-pace-v1-basta]').count()); i++) { await flecha(page).click(); await page.clock.runFor(300); }
    await bajoSuEtiqueta(page, '[data-pace-v1-basta]', 'en el descanso entre dos series');
    expect((await grupo(page))[1]).toBe(colocarse[1]);
    expect(errores).toEqual([]);
    await context.close();
  });

  /* «Auto», bajo las palabras de los tres botones y centrado con el del medio; bajo la barra queda
     solo «Siguiente: …». En el ordenador, por encima de la línea de los atajos. */
  for (const [w, h] of [[360, 740], [1280, 720]]) {
    test(`r-2 · «Auto», debajo de las palabras de los botones · ${w}x${h}`, async ({ browser, baseURL }) => {
      const { context, page } = await abrir(browser, baseURL, w, h, 'extra.banda.espalda');
      const errores = capturarErrores(page);
      const auto = page.locator('[data-pace-v1-auto]');
      await expect(page.locator('[data-pace-v1-mando] [data-pace-v1-auto]'), '«Auto» no está en el mando').toBeVisible();
      await expect(page.locator('.pace-v1-siguiente [data-pace-v1-auto]')).toHaveCount(0);
      await expect(page.locator('.pace-v1-siguiente')).toHaveText('Siguiente: Descanso');
      const g = await page.evaluate(() => {
        const r = (e) => e && e.getBoundingClientRect();
        const a = r(document.querySelector('[data-pace-v1-auto]'));
        const pausa = r(document.querySelector('[data-pace-v1-btn="pausa"]'));
        const palabras = Math.max(...[...document.querySelectorAll('.pace-v1-rotulo')].map((e) => r(e).bottom));
        const atajos = document.querySelector('[data-pace-session-hint]');
        const at = atajos && getComputedStyle(atajos).display !== 'none' && r(atajos).height > 0 ? r(atajos) : null;
        return { top: a.top, bottom: a.bottom, centro: a.left + a.width / 2, centroPausa: pausa.left + pausa.width / 2, palabras,
          atajos: at && at.top, alto: innerHeight };
      });
      expect(g.top, '«Auto» pisa las palabras de los botones').toBeGreaterThanOrEqual(g.palabras + 4);
      expect(Math.abs(g.centro - g.centroPausa), '«Auto» no va centrado bajo el mando').toBeLessThanOrEqual(2);
      expect(g.bottom, '«Auto» se sale por abajo').toBeLessThanOrEqual(g.alto);
      if (g.atajos != null) expect(g.bottom, '«Auto» pisa la línea de los atajos').toBeLessThanOrEqual(g.atajos);
      /* Encenderlo no mueve nada. */
      const antes = await caja(page, '[data-pace-v1-glyph]');
      await auto.click();
      await expect(auto).toHaveAttribute('aria-pressed', 'true');
      expect(await caja(page, '[data-pace-v1-glyph]')).toEqual(antes);
      expect(errores).toEqual([]);
      await context.close();
    });
  }

  test('r-3 · por debajo de 700 px de alto «Auto» va junto a «Siguiente», y vuelve al mando si la ventana crece', async ({ browser, baseURL }) => {
    const { context, page } = await abrir(browser, baseURL, 360, 640, 'extra.banda.espalda');
    const errores = capturarErrores(page);
    await expect(page.locator('.pace-v1-siguiente [data-pace-v1-auto]'), 'a 640 de alto «Auto» no está junto a «Siguiente»').toBeVisible();
    await expect(page.locator('[data-pace-v1-mando] [data-pace-v1-auto]')).toHaveCount(0);
    const [s, a] = await Promise.all([caja(page, '[data-pace-v1-siguiente]'), caja(page, '[data-pace-v1-auto]')]);
    expect(Math.abs((s.y + s.height / 2) - (a.y + a.height / 2)), '«Auto» no va en la fila de «Siguiente»').toBeLessThanOrEqual(4);
    await page.locator('[data-pace-v1-auto]').click();
    await page.setViewportSize({ width: 360, height: 760 });
    await page.clock.runFor(300);
    await expect(page.locator('[data-pace-v1-mando] [data-pace-v1-auto]'), 'al crecer la ventana, «Auto» no bajó al mando').toBeVisible();
    await expect(page.locator('[data-pace-v1-auto]'), 'al cambiar de sitio, «Auto» perdió su estado').toHaveAttribute('aria-pressed', 'true');
    await page.setViewportSize({ width: 360, height: 640 });
    await page.clock.runFor(300);
    await expect(page.locator('.pace-v1-siguiente [data-pace-v1-auto]')).toBeVisible();
    expect(errores).toEqual([]);
    await context.close();
  });

  /* El círculo de hoy (la rama antes del cambio, tabla de la maqueta), en la colocación de la
     apertura con banda y en el descanso de «Levántate y sube». Donde sobra aire, crece; nunca encoge. */
  const CIRCULOS = [
    { w: 360, h: 740, id: 'extra.banda.espalda', hoy: 218, crece: false },
    { w: 360, h: 640, id: 'extra.banda.espalda', hoy: 138, crece: true },
    { w: 412, h: 915, id: 'extra.banda.espalda', hoy: 224, crece: true },
    { w: 1280, h: 720, id: 'extra.banda.espalda', hoy: 160, crece: true },
    { w: 1536, h: 710, id: 'extra.banda.espalda', hoy: 154, crece: true },
    { w: 1536, h: 710, id: 'extra.chair.squats', hoy: 124, crece: true },
  ];
  test('r-4 · el círculo crece donde sobra aire y nunca encoge; lo que sobra, arriba y abajo del bloque', async ({ browser, baseURL }) => {
    test.setTimeout(150000);
    for (const c of CIRCULOS) {
      const { context, page } = await abrir(browser, baseURL, c.w, c.h, c.id);
      if (c.id === 'extra.chair.squats') {
        for (let i = 0; i < 4 && !(await page.locator('[data-pace-v1-basta]').count()); i++) { await flecha(page).click(); await page.clock.runFor(300); }
        await expect(page.locator('[data-pace-v1-basta]')).toBeVisible();
      }
      const px = await circulo(page);
      const donde = c.w + 'x' + c.h + ' ' + c.id;
      expect(px, donde + ': el círculo encoge (hoy ' + c.hoy + ')').toBeGreaterThanOrEqual(c.hoy);
      if (c.crece) expect(px, donde + ': sobra aire y el círculo no crece').toBeGreaterThan(c.hoy);
      /* El bloque, junto y centrado: lo que el círculo no se lleva va arriba y abajo, no entre piezas. */
      const aire = await page.evaluate(() => {
        const cuerpo = document.querySelector('[data-pace-v1-body]');
        const b = cuerpo.getBoundingClientRect();
        const g = document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect();
        const cola = document.querySelector('[data-pace-v1-pila="cola"]').getBoundingClientRect();
        return { arriba: g.top - b.top, abajo: b.bottom - cola.bottom - parseFloat(getComputedStyle(cuerpo).paddingBottom) };
      });
      expect(Math.abs(aire.arriba - aire.abajo), donde + ': el bloque no va centrado ' + JSON.stringify(aire)).toBeLessThanOrEqual(2);
      await context.close();
    }
  });

  /* En el móvil más pequeño no cabe todo ni con el círculo en su suelo («justo»): el bloque no se
     sale por arriba (centrado, el círculo quedaba bajo la cabecera) y la línea de abajo que se ve no
     pisa la barra de pasos (hoy, 17 px en la banda y 47 en «Levántate y sube»). La pastilla va ahí
     junto a su etiqueta, porque debajo no cabe. Se mide el texto vivo y no su hueco: a 320 px de
     ancho «Siguiente: Sentadilla a silla» con «Auto» parte en dos líneas y sube la barra en ese paso
     (como hoy), y la reserva vacía de las frases largas de la rutina queda debajo. */
  test('r-7 · a 320x568 nada se pisa: ni el círculo con la cabecera ni la línea de abajo con la barra', async ({ browser, baseURL }) => {
    test.setTimeout(120000);
    const mira = async (page, cuando) => {
      const m = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        return { cabecera: r('[data-pace-session-header]').bottom, circulo: r('[data-pace-v1-glyph]').top,
          cola: r('[data-pace-v1-cola] > div').bottom, barra: r('[data-pace-v1-progress]').top,
          justo: !!document.querySelector('[data-pace-v1-justo]') };
      });
      expect(m.justo, cuando + ': a 320x568 ya cabe sin «justo»: esta prueba no mira lo que debe').toBe(true);
      expect(m.circulo, cuando + ': el círculo queda bajo la cabecera').toBeGreaterThanOrEqual(m.cabecera);
      expect(m.cola, cuando + ': la línea de abajo pisa la barra de pasos').toBeLessThanOrEqual(m.barra - 2);
    };
    const { context, page } = await abrir(browser, baseURL, 320, 568, 'extra.banda.espalda');
    await mira(page, 'al colocarse');
    await flecha(page).click(); await page.clock.runFor(300);
    await mira(page, 'en la apertura con banda');
    await bajoSuEtiqueta(page, '[data-pace-v1-saltar]', 'a 320', true);
    await page.locator('[data-pace-session-header] button').last().click();
    await abrirRutina(page, 'Mueve', 'extra.chair.squats');
    await page.clock.runFor(300);
    for (let i = 0; i < 4 && !(await page.locator('[data-pace-v1-basta]').count()); i++) { await flecha(page).click(); await page.clock.runFor(300); }
    await mira(page, 'en el descanso con «Con una basta»');
    await bajoSuEtiqueta(page, '[data-pace-v1-basta]', 'a 320', true);
    await context.close();
  });

  test('r-5 · sin Auto, colocarse nombra el botón por su palabra, en castellano y en inglés', async ({ browser, baseURL }) => {
    for (const [lang, frase] of [['es', 'Colócate sin prisa · pulsa «Empezar ya»'], ['en', 'Get set, no rush · press Begin now']]) {
      const { context, page } = await abrir(browser, baseURL, 360, 740, 'extra.banda.espalda', { lang, langAuto: false });
      expect(await fase(page)).toBe('place');
      await expect(page.locator('[data-pace-v1-support]')).toHaveText(frase);
      const palabra = (await flecha(page).locator('.pace-v1-rotulo').textContent()).trim();
      expect(frase, 'la frase no dice la palabra que lleva el botón (' + palabra + ')').toContain(palabra);
      await context.close();
    }
  });

  test('r-6 · en la pausa el velo empieza bajo el círculo, y durante el 3, 2, 1 «Al reanudar…» se apaga sin mover nada', async ({ browser, baseURL }) => {
    test.setTimeout(90000);
    /* En un móvil alto el bloque va centrado: el círculo ya no empieza arriba del todo. */
    const { context, page } = await abrir(browser, baseURL, 412, 915, 'extra.core.stealth', { cuerpoAuto: true });
    const errores = capturarErrores(page);
    if ((await fase(page)) === 'place') await flecha(page).click();
    await page.clock.runFor(6000);
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await page.clock.runFor(300);
    const velo = page.locator('[data-pace-v1-velo]');
    await expect(velo).toBeVisible();
    const [v, g] = await Promise.all([caja(page, '[data-pace-v1-velo]'), caja(page, '[data-pace-v1-glyph]')]);
    expect(v.y, 'el velo tapa el círculo').toBeGreaterThanOrEqual(g.y + g.height);
    /* Las dos frases del velo, de una vez: el reloj instalado sigue corriendo, y un aserto que
       espera («toBeHidden») daba por apagada la línea cuando acababa la cuenta y se iba el velo. */
    const frases = () => page.evaluate(() => {
      const v = document.querySelector('[data-pace-v1-velo]');
      if (!v) return null;
      /* ¿Se ve la frase? Lo dice el elemento que lleva su texto. */
      const linea = (t) => {
        const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
          if (n.textContent.includes(t)) return getComputedStyle(n.parentElement).visibility !== 'hidden';
        }
        return null;
      };
      const caja = v.querySelector('.pace-v1-velo-texto').getBoundingClientRect();
      return { cuenta: v.querySelector('[data-pace-v1-vuelta]').textContent.trim(), sigues: linea('Sigues desde este punto.'),
        alVolver: linea('Al reanudar, 3, 2, 1 y vuelve la cuenta.'), texto: [caja.top, caja.height] };
    });
    const enPausa = await frases();
    expect(enPausa.alVolver, 'en pausa no se lee «Al reanudar…»').toBe(true);
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await page.clock.runFor(100);
    const enCuenta = await frases();
    expect(enCuenta && enCuenta.cuenta, 'no empezó el 3, 2, 1').toBe('3');
    expect(enCuenta.alVolver, 'durante el 3, 2, 1 sigue «Al reanudar…»').toBe(false);
    expect(enCuenta.sigues, 'durante el 3, 2, 1 se apagó también «Sigues desde este punto.»').toBe(true);
    expect(enCuenta.texto, 'al apagarse la línea, el texto del velo se movió').toEqual(enPausa.texto);
    await page.clock.runFor(3200);
    await expect(velo).toHaveCount(0);
    expect(errores).toEqual([]);
    await context.close();
  });
});
