/* PACE · E2E · EL ARO CON EL HORARIO ABIERTO (Ez, 11 nov. 2026: la A)
 * ==================================================================
 * Sobre docs/proposals/aro-horario-10nov/aro-horario.html. Con «¿Cuánto trabajas hoy?» y el
 * horario abierto, el panel cortaba el aro de más (se veía el 82 %; con las actividades y con
 * la rutina elegida, el 89-90 %) y el aro crecía al abrirlo. Ez: «queda raro». La A:
 *
 *  · el aro con el horario abierto mide lo mismo que con las actividades, también al recargar
 *    con el horario ya abierto (app/main/home-geometry.horario.js lo recuerda);
 *  · el panel lo corta a la misma altura que las actividades;
 *  · los otros dos estados no se mueven: siguen la regla de siempre del solape, y miden lo de
 *    la 0.197.0 (447 y 515 px a 1920×860; 372 y 426 a 1536×710);
 *  · nada de scroll, y el móvil no cambia.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const HOY = '2026-11-10';
const vis = (page, sel) => page.locator(sel).filter({ visible: true }).first();
/* Lo de la 0.197.0, medido en pantalla (la home crece con el lienzo a 1920×860). */
const HOY_MIDE = { 1920: { con: 447, rutina: 515 }, 1536: { con: 372, rutina: 426 } };

async function abrir(page, context, w, h, lang) {
  await page.setViewportSize({ width: w, height: h });
  await sembrar(context, { ritmo: {}, lang: lang || 'es' });
  await page.clock.install({ time: new Date(HOY + 'T10:00:00+01:00') });
  await irAlArtefacto(page);
  await page.waitForTimeout(500);
}
async function abrirHorario(page) {
  const b = vis(page, '[data-pace-ritmo-ajustar], [data-pace-ritmo-comienza]');
  /* En el móvil el cajón del menú puede quedar encima: entonces se pulsa por debajo. */
  try { await b.click({ timeout: 3000 }); } catch (e) { await b.dispatchEvent('click'); }
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]')).toBeVisible();
  await page.waitForTimeout(300);
}

/* El aro, dónde acaba su trazo y dónde empieza lo que lo tapa; y el solape que daría la regla de
   siempre (16 % de D con el techo de la fila del ciclo), calculado igual que el motor. */
function medir(page) {
  return page.evaluate(() => {
    const v = (s) => [...document.querySelectorAll(s)].find((x) => x.getClientRects().length && x.getBoundingClientRect().width > 0);
    const dial = v('[data-pace-dial-fit]');
    const r = dial.getBoundingClientRect();
    const cs = getComputedStyle(document.documentElement);
    const escala = (window.paceLienzo && window.paceLienzo.escala) || 1;
    const corte = parseFloat(cs.getPropertyValue('--pace-dial-corte')) * escala;
    const caja = v('[data-pace-ritmo-panel] .pace-rt-panel') || v('[data-pace-activitybar-chip]');
    let ciclo = null;
    for (const n of dial.querySelectorAll('span, div')) {
      if (/\b(ciclo|cycle)\b/i.test(n.textContent || '')) { const b = paceCaja(n).bottom; if (ciclo == null || b > ciclo) ciclo = b; }
    }
    const D = parseFloat(cs.getPropertyValue('--pace-timer-d'));
    const techo = ciclo == null ? Math.round(D * 0.16) : Math.max(0, Math.round(paceCaja(dial).bottom - ciclo - 4));
    const body = document.querySelector('[data-pace-home-body]');
    const se = document.scrollingElement;
    return {
      aro: Math.round(r.width),
      visto: (r.bottom - corte - r.top) / r.width,
      trazo: r.bottom - corte, cajaArriba: caja ? caja.getBoundingClientRect().top : null,
      solape: parseFloat(cs.getPropertyValue('--pace-activities-overlap')),
      solapeDeSiempre: Math.min(Math.round(D * 0.16), techo),
      scroll: Math.max(se.scrollHeight - se.clientHeight, body.scrollHeight - body.clientHeight),
    };
  });
}

for (const [w, h] of [[1920, 860], [1536, 710]]) {
  test(`a ${w}×${h}, abrir el horario no mueve el aro y lo corta como las actividades`, async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context, w, h);
    const con = await medir(page);
    expect(con.solape, 'con actividades, el solape de siempre').toBe(con.solapeDeSiempre);
    expect(Math.abs(con.aro - HOY_MIDE[w].con), `con actividades mide lo de la 0.197.0 (${HOY_MIDE[w].con})`).toBeLessThanOrEqual(2);

    await abrirHorario(page);
    const hor = await medir(page);
    expect(Math.abs(hor.aro - con.aro), `con el horario abierto, el aro de las actividades (${con.aro}), no ${hor.aro}`).toBeLessThanOrEqual(1);
    expect(hor.visto, 'se ve tanto aro como con las actividades (antes, el 82 %)').toBeGreaterThan(0.88);
    expect(Math.abs(hor.visto - con.visto), 'el corte, a la misma altura').toBeLessThan(0.015);
    expect(hor.cajaArriba, 'el trazo acaba antes del canto del panel').toBeGreaterThanOrEqual(hor.trazo);
    expect(hor.scroll, 'sin scroll').toBeLessThanOrEqual(0);

    await vis(page, '[data-pace-ritmo-estado="pregunta"] button:has-text("Una hora")').click();
    await page.waitForTimeout(400);
    const rut = await medir(page);
    expect(rut.solape, 'con la rutina elegida, el solape de siempre').toBe(rut.solapeDeSiempre);
    expect(Math.abs(rut.aro - HOY_MIDE[w].rutina), `con la rutina elegida mide lo de la 0.197.0 (${HOY_MIDE[w].rutina})`).toBeLessThanOrEqual(2);
    expect(rut.scroll).toBeLessThanOrEqual(0);
    expect(errores).toEqual([]);
  });
}

test('en inglés, lo mismo a 1536×710', async ({ page, context }) => {
  await abrir(page, context, 1536, 710, 'en');
  const con = await medir(page);
  await abrirHorario(page);
  const hor = await medir(page);
  expect(Math.abs(hor.aro - con.aro)).toBeLessThanOrEqual(1);
  expect(hor.visto).toBeGreaterThan(0.88);
  expect(hor.scroll).toBeLessThanOrEqual(0);
});

test('al recargar con el horario abierto, el aro recuerda su tamaño; sin recuerdo, cabe sin cortarse', async ({ page, context }) => {
  await abrir(page, context, 1920, 860);
  const con = await medir(page);
  await abrirHorario(page);
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await expect(vis(page, '[data-pace-ritmo-estado="pregunta"]'), 'GUARD: la pregunta abierta se guarda para hoy').toBeVisible();
  const recargada = await medir(page);
  expect(Math.abs(recargada.aro - con.aro), 'recargada, el aro de las actividades').toBeLessThanOrEqual(1);

  /* Una ventana que nunca vio las actividades: el mayor aro que cabe, con el mismo corte. */
  await page.evaluate(() => localStorage.removeItem('pace.aro.carta.v1'));
  await page.reload();
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  const sin = await medir(page);
  expect(sin.aro, 'sin recuerdo no pasa del de las actividades').toBeLessThanOrEqual(con.aro + 1);
  expect(sin.visto).toBeGreaterThan(0.88);
  expect(sin.scroll).toBeLessThanOrEqual(0);
});

test('en el móvil (360×740) abrir el horario no cambia el aro', async ({ page, context }) => {
  await abrir(page, context, 360, 740);
  const con = await medir(page);
  await abrirHorario(page);
  const hor = await medir(page);
  expect(hor.aro, 'el móvil no lleva la A').toBe(con.aro);
  expect(hor.scroll).toBeLessThanOrEqual(0);
});
