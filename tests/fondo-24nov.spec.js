/* PACE · E2E · LA AUDITORÍA A FONDO DEL 24 NOV. 2026
 * ==================================================
 * Las letras de Ez sobre la página «Auditoría a fondo»: «todo lo recomendado» (F1A F2A F3A F4A F5A F6A
 * F7A F8B G1A). F3 y F4 (los textos) los vigilan las pruebas que ya los leían (pausa-sin-repetir,
 * checklist-foco, ver-ejercicio, ritmo-ayer y textos-al-limite, que mide en Linux que caben); F5 (el
 * gris fino), contraste-rotulos.spec.js. Aquí:
 *
 *   F1A La pausa por libre propone solo lo que cabe junto a la mesa, como «A tu ritmo»: sin suelo, sin
 *       barra, sin aguantar el aire ni aviso de seguridad. Proponía «Movilidad en suelo».
 *   F2A «Empezar» de «Antes de empezar» se ve siempre, también con cinco pasos a 360 × 640.
 *   F6A En el ordenador, con ratón, los enlaces pequeños se pueden pulsar en 24 px de alto.
 *   F7A La landing, /premium y /beta llevan la vista previa al compartir, con su imagen de 1200 × 630.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirTusDatos, RUTA_ARTEFACTO } = require('./helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true }).first();

test('F1A · la pausa por libre propone solo lo que cabe junto a la mesa, en Estira, Mueve y Respira', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const malas = []; let propuestas = 0;
    const base = new Date('2026-11-02T12:00:00');
    for (let d = 0; d < 42; d++) {
      const f = new Date(base.getTime() + d * 86400000);
      const iso = f.getFullYear() + '-' + String(f.getMonth() + 1).padStart(2, '0') + '-' + String(f.getDate()).padStart(2, '0');
      for (const cat of ['EXTRA_ROUTINES', 'MOVE_ROUTINES', 'BREATHE_ROUTINES']) {
        for (let salto = 0; salto < 4; salto++) {
          const rut = window.breakElige(window[cat], iso, { salto });
          if (!rut) continue;
          propuestas++;
          if (!window.libraryJuntoALaMesa(rut) || rut.requiresFloor || (rut.equipment || []).indexOf('bar') !== -1) malas.push(cat + ' ' + iso + ' ' + rut.id);
        }
      }
    }
    /* Y la misma regla que «A tu ritmo»: sus pozos tampoco llevan nada que no quepa junto a la mesa. */
    const pozos = window.ritmoPozos(window.getState(), '2026-11-24');
    const fueraRitmo = Object.keys(pozos).flatMap((k) => pozos[k].filter((x) => !window.libraryJuntoALaMesa(x)).map((x) => k + ' ' + x.id));
    /* Guarda de cero: hay rutinas de suelo en Estira, o esta prueba no defendería nada. */
    const deSuelo = Object.values(window.EXTRA_ROUTINES).flatMap((g) => g.items || []).filter((x) => x && x.requiresFloor).length;
    return { malas, propuestas, fueraRitmo, deSuelo };
  });
  expect(r.deSuelo, 'Estira ya no tiene rutinas de suelo: la prueba no defiende nada').toBeGreaterThan(0);
  expect(r.propuestas).toBeGreaterThan(100);
  expect(r.malas, 'la pausa propone algo que no cabe junto a la mesa').toEqual([]);
  expect(r.fueraRitmo).toEqual([]);
});

test.describe('F2A · móvil 360 × 640', () => {
  test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });
  for (const [chip, cual] of [[1, 'Estira, cinco pasos'], [2, 'Mueve, un paso']]) {
    test('«Empezar» de «Antes de empezar» se ve y se puede pulsar sin deslizar (' + cual + ')', async ({ page, context }) => {
      await sembrar(context, { sidebarCollapsed: true });
      await irAlArtefacto(page);
      await page.locator('[data-pace-activitybar-chip]').filter({ visible: true }).nth(chip).click();
      await vis(page, '.pace-lib .pace-lib-hit').click();
      const cta = page.locator('[data-pace-modal-card] [data-pace-cta]').filter({ visible: true }).last();
      await expect(cta).toBeVisible();
      await page.waitForTimeout(500);
      const g = await cta.evaluate((b) => {
        const r = b.getBoundingClientRect();
        const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + 4);
        const centro = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { abajo: r.bottom, alto: innerHeight, arriba: b === arriba || b.contains(arriba), centro: b === centro || b.contains(centro) };
      });
      expect(g.abajo, '«Empezar» se sale por abajo').toBeLessThanOrEqual(g.alto);
      expect(g.centro, 'algo tapa «Empezar»').toBe(true);
      expect(g.arriba, 'algo tapa el borde de arriba de «Empezar»').toBe(true);
    });
  }
});

test('F6A · en el ordenador, los enlaces pequeños se pulsan en 24 px de alto', async ({ page, context }) => {
  await sembrar(context);
  await page.clock.install({ time: new Date('2026-09-22T10:00:00+02:00') });
  await irAlArtefacto(page);
  const alcance = (sel) => page.evaluate((s) => {
    const el = Array.from(document.querySelectorAll(s)).find((e) => e.getBoundingClientRect().width > 0);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = r.left + Math.min(r.width / 2, 6);
    const dentro = (y) => { const e = document.elementFromPoint(x, y); return !!e && (e === el || el.contains(e)); };
    let arriba = 0; while (arriba < 12 && dentro(r.top - arriba - 1)) arriba++;
    let abajo = 0; while (abajo < 12 && dentro(r.bottom + abajo)) abajo++;
    return Math.round(r.height + arriba + abajo);
  }, sel);
  const medidas = {};
  medidas.ajustar = await alcance('[data-pace-ritmo-ajustar]');
  medidas.agua = await alcance('[data-pace-hoy-celda]');
  await vis(page, '[data-pace-ritmo-ajustar]').click();
  await vis(page, '[data-pace-ritmo-estado="pregunta"]').waitFor();
  medidas.ahoraNo = await alcance('[data-pace-ritmo-ahorano]');
  medidas.comer = await alcance('.pace-rt-mini-int[data-pace-ritmo-comes]');
  for (const [k, v] of Object.entries(medidas)) {
    expect(v, k + ' no está').not.toBeNull();
    expect(v, k + ': ' + v + ' px de alto para apuntar').toBeGreaterThanOrEqual(24);
  }
});

test('F6A · el pie de «Tus datos» se pulsa en 24 px de alto en el ordenador', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const alto = await page.locator('.pace-aj-pie a').first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const dentro = (y) => { const e = document.elementFromPoint(r.left + r.width / 2, y); return !!e && (e === el || el.contains(e)); };
    let arriba = 0; while (arriba < 12 && dentro(r.top - arriba - 1)) arriba++;
    let abajo = 0; while (abajo < 12 && dentro(r.bottom + abajo)) abajo++;
    return Math.round(r.height + arriba + abajo);
  });
  expect(alto).toBeGreaterThanOrEqual(24);
});

test('F7A · la landing, /premium y /beta llevan la vista previa al compartir, con su imagen de 1200 × 630', async ({ page }) => {
  for (const ruta of [RUTA_ARTEFACTO, '/premium/', '/beta/']) {
    const html = await (await page.request.get(ruta)).text();
    for (const k of ['og:title', 'og:description', 'og:url', 'og:image:alt']) {
      expect(html, ruta + ' sin ' + k).toMatch(new RegExp('<meta property="' + k + '" content="[^"]{8,}">'));
    }
    expect(html, ruta).toContain('<meta property="og:image" content="https://pacegrass.app/og-pace.jpg">');
    expect(html, ruta).toContain('<meta name="twitter:card" content="summary_large_image">');
  }
  const resp = await page.request.get('/og-pace.jpg');
  expect(resp.status()).toBe(200);
  await page.goto('/premium/');
  const tam = await page.evaluate(() => new Promise((ok) => {
    const i = new Image(); i.onload = () => ok([i.naturalWidth, i.naturalHeight]); i.onerror = () => ok(null); i.src = '/og-pace.jpg';
  }));
  expect(tam).toEqual([1200, 630]);
});

/* F4 · «{zona}: yet to move»: con las seis zonas y la letra al 115 %, la fila de la pausa abierta de la home (el hueco
   más justo: «2 min · Shoulders: …») deja al menos 3 px (la ventana de la pausa, en ritmo-series). Con «not moved yet» dejaba
   1,2 px en Windows y se salía 3 en Linux; la prueba de textos-al-limite solo ve la zona que sale ese día. */
test('F4 · «yet to move» cabe con las seis zonas en la fila de la home, con la letra al 115 %', async ({ browser }) => {
  const HL = require('./textos-al-limite.helpers');
  const PAUSA = HL.MOMENTOS.find((m) => m.nombre === 'la pausa abierta');
  const { context, page } = await HL.abreHome(browser, test.info().project.use.baseURL, { lang: 'en', w: 360, h: 718, letra: 1.15, m: PAUSA });
  const r = await page.evaluate(() => {
    const S = window.PACE_STRINGS.en;
    const pat = S['ritmo.frase.zona'];
    const zonas = ['cuello', 'hombros', 'espalda', 'caderas', 'piernas', 'manos'].map((z) => S['ritmo.zona.' + z]);
    const frase = (z) => pat.replace('{zona}', z);
    const casa = (t) => zonas.some((z) => t.includes(frase(z)));
    const els = [...document.querySelectorAll('body *')].filter((e) => casa(e.textContent) && ![...e.children].some((c) => casa(c.textContent)) && e.getClientRects().length);
    return els.map((el) => {
      const ancho = (t) => { const c = el.cloneNode(false); c.style.cssText = 'position:absolute;visibility:hidden;width:max-content;white-space:nowrap'; c.textContent = t; el.parentElement.appendChild(c); const w = c.getBoundingClientRect().width; c.remove(); return w; };
      const ahora = zonas.find((z) => el.textContent.includes(frase(z)));
      return { texto: el.textContent, sobra: el.clientWidth - Math.max(...zonas.map((z) => ancho(el.textContent.replace(frase(ahora), frase(z))))) };
    });
  });
  await context.close();
  expect(r.length, 'GUARD: la frase de la zona sale en la home').toBeGreaterThan(0);
  for (const x of r) expect(x.sobra, '«' + x.texto + '» con la zona más larga').toBeGreaterThanOrEqual(3);
});
