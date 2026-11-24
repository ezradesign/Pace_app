/* PACE · E2E · LAS LETRAS DE LA AUDITORÍA V (Ez, 24 nov. 2026)
 * =============================================================
 * «V1 como en tu captura del móvil, para todos los tamaños de móvil: el aro entero, «Empezar jornada»
 * y la tarjeta debajo con aire (unos 38 px) · V2A · V3A · V4C · V5A · V6A · V7B · V8A · V9A · V10A ·
 * V11A». La V4C es dejarlo como está.
 *
 *  · V1  en el móvil, con la jornada, la tarjeta del día empieza bajo el aro: no lo corta ni pisa el botón.
 *  · V2A en la pausa del Foco a mano, «Mueve» abre la ficha de su «Para ahora», con «Ver otras de Mueve».
 *  · V3A si el primer ejercicio trae su colocación, no sale «Prepárate»: una sola cuenta.
 *  · V5A «1 ejercicio, 2 series», «Serie 1 de 2» y, al acabar, «Serie»/«Repetición» en singular.
 *  · V6A al acabar, lo que sigue va relleno.
 *  · V7B, V9A y V10A son textos: se miran en los dos idiomas.
 *  · V8A la fila de puntos de la home dice qué es, al lado del título.
 *  · V11A en la tableta el menú es un cajón de 360 px con la home detrás, y tocar fuera lo cierra.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, terminarBloque, MEDIODIA } = require('./helpers');

const HOY = '2026-10-14';
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

for (const [w, h] of [[360, 640], [360, 740], [375, 812], [412, 915]]) {
  test(`V1 · ${w}×${h}: con la jornada, la tarjeta del día no corta el aro ni pisa «Empezar jornada», y no hay scroll`, async ({ page, context }) => {
    const errores = capturarErrores(page);
    await page.setViewportSize({ width: w, height: h });
    await sembrar(context, { ritmo: { dia: JORNADA } });
    await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
    await irAlArtefacto(page);
    /* El motor encoge el aro en varias vueltas: con la máquina cargada, 300 ms no bastan. */
    await expect.poll(() => page.evaluate(() => {
      const t = document.querySelector('[data-pace-activitybar][data-pace-ritmo]');
      const a = document.querySelector('[data-pace-dial-fit]');
      return t && a ? t.getBoundingClientRect().top - a.getBoundingClientRect().bottom : -99;
    }), { message: 'GUARD: la geometría se asienta', timeout: 5000 }).toBeGreaterThanOrEqual(-2);
    const m = await page.evaluate(() => {
      const boton = [...document.querySelectorAll('[data-pace-dial-fit] button')].find((b) => /Empezar jornada/.test(b.textContent) && b.getClientRects().length);
      const tarjeta = document.querySelector('[data-pace-activitybar][data-pace-ritmo]');
      const aro = document.querySelector('[data-pace-dial-fit]');
      const cs = getComputedStyle(document.documentElement);
      return {
        boton: boton ? boton.getBoundingClientRect().bottom : null,
        tarjeta: tarjeta ? tarjeta.getBoundingClientRect().top : null,
        aro: aro.getBoundingClientRect().bottom,
        corte: cs.getPropertyValue('--pace-dial-corte').trim(),
        scroll: document.scrollingElement.scrollHeight - innerHeight,
      };
    });
    expect(m.boton, 'GUARD: «Empezar jornada» en el aro').not.toBeNull();
    expect(m.tarjeta, 'GUARD: la tarjeta del día').not.toBeNull();
    expect(m.corte, 'el aro entero, sin corte').toBe('0px');
    expect(m.tarjeta, 'la tarjeta empieza donde acaba el aro').toBeGreaterThanOrEqual(m.aro - 2);
    expect(m.tarjeta - m.boton, 'aire entre «Empezar jornada» y la tarjeta').toBeGreaterThanOrEqual(30);
    expect(m.scroll, 'la home del móvil sin scroll').toBeLessThanOrEqual(0);
    expect(errores).toEqual([]);
  });
}

test('V2A · en la pausa del Foco a mano, «Mueve» abre la ficha de su «Para ahora» y «Ver otras de Mueve» la biblioteca', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { soundOn: false, focusMinutes: 25, ritmo: { libre: MEDIODIA.toISOString().slice(0, 10) } });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await terminarBloque(page);
  const esperada = await page.evaluate(() => window.breakAhoraDe('move', JSON.parse(localStorage.getItem('pace.state.v2'))));
  expect(esperada && esperada.id, 'GUARD: Mueve tiene una «Para ahora»').toBeTruthy();
  await page.locator('[role="dialog"] button').filter({ hasText: /^Mueve/ }).filter({ visible: true }).first().click();
  const otras = vis(page, '[data-pace-preview-otras]');
  await expect(otras).toHaveText('Ver otras de Mueve');
  await expect(page.getByRole('button', { name: 'Empezar', exact: true }).filter({ visible: true }), 'la ficha, con «Empezar»').toHaveCount(1);
  await otras.click();
  await expect(vis(page, '[data-pace-lib-now]'), 'la biblioteca de Mueve').toHaveCount(1);
  expect(errores).toEqual([]);
});

test('V3A y V5A · «Empuje sencillo» empieza por «Colócate», sin «Prepárate», y cuenta en series', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  const copia = await page.evaluate(() => {
    const r = window.resolveBodyRoutine('extra.desk.pushups').routine;
    const tn = (k, p) => { let s = window.PACE_STRINGS.es[k]; Object.keys(p || {}).forEach((x) => { s = s.replace('{' + x + '}', p[x]); }); return s; };
    return window.sessionPrepCopy(r, tn);
  });
  expect(copia, 'V5A: la cuenta de «Prepárate», en ejercicios y series').toBe('De pie. Sin prisa. 1 ejercicio, 2 series.');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'extra.desk.pushups' } })));
  await page.getByRole('button', { name: 'Empezar', exact: true }).filter({ visible: true }).click();
  await expect(page.locator('[data-pace-session-prep]'), 'V3A: sin «Prepárate»').toHaveCount(0);
  await expect(page.getByText('Colócate', { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('Serie 1 de 2', { exact: true }).filter({ visible: true }).first(), 'V5A: la serie, no el paso').toBeVisible();
  expect(errores).toEqual([]);
});

test('V3A · Respira sigue con «Prepárate»', async ({ page, context }) => {
  await sembrar(context, { soundOn: false });
  await page.clock.install({ time: MEDIODIA });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'suggest', targetId: 'breathe.coherent.55' } })));
  await expect(page.locator('[data-pace-session-prep]')).toHaveCount(1);
});

test('V5A · al acabar, los rótulos en singular o plural y con palabras enteras', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const r = await page.evaluate(() => {
    const t = (k) => window.PACE_STRINGS.es[k] || k;
    const ruta = window.resolveBodyRoutine('extra.desk.pushups').routine;
    return window.v1DoneStats(ruta, 1, '0:31', t, null, 1).map((s) => s.value + ' ' + s.label);
  });
  expect(r).toEqual(['0:31 Tiempo', '1 Serie', '1 Repetición']);
});

test('V6A · al acabar con lo que sigue, ese botón va relleno', async ({ page, context }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await sembrar(context, { soundOn: false, ritmo: { dia: JORNADA } });
  await page.clock.install({ time: new Date(HOY + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  const sigue = await page.evaluate(() => {
    const m = document.createElement('i'); m.style.background = 'var(--focus-cta)'; document.body.appendChild(m);
    const verde = getComputedStyle(m).backgroundColor; m.remove();
    return verde;
  });
  /* El estilo vive en SessionShell.responsive.js: se mira la regla, que es lo que decide el relleno. */
  const regla = await page.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => /data-pace-cierre-sigue-cta/.test(r.cssText) && /focus-cta/.test(r.cssText)); } catch (e) { return false; } }));
  expect(sigue, 'GUARD: el verde de los botones principales').toBeTruthy();
  expect(regla, 'la regla que rellena lo que sigue').toBe(true);
});

test('V7B, V9A y V10A · los textos elegidos, en los dos idiomas', async ({ page, context }) => {
  await sembrar(context);
  await irAlArtefacto(page);
  const s = await page.evaluate(() => window.PACE_STRINGS);
  expect(s.es['visita.dia.texto']).toBe('Elige cuánto trabajas hoy y PACE reparte tus pausas por la jornada.');
  expect([s.es['stats.tag'], s.es['stats.title'], s.es['stats.subtitle']]).toEqual(['Tu actividad', 'Estadísticas', 'Lo que has hecho, sin compararte con nadie.']);
  expect([s.en['stats.tag'], s.en['stats.title'], s.en['stats.subtitle']]).toEqual(['Your activity', 'Stats', 'What you’ve done, no comparisons.']);
  expect([s.es['onboarding.semana.rotulo'], s.es['onboarding.completo.cta']]).toEqual(['Tu semana', 'Entrar en PACE']);
  expect([s.en['onboarding.semana.rotulo'], s.en['onboarding.completo.cta']]).toEqual(['Your week', 'Open PACE']);
});

const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
for (const [lang, semana, esperado] of [['es', null, 'Un día tipo'], ['es', LV, /^\d+ pausas · 9:00–17:00$/], ['en', LV, /^\d+ breaks · 9:00–17:00$/]]) {
  test(`V8A · ${lang}${semana ? ', con tu semana' : ''}: la fila de puntos dice qué es, en la fila del título y sin cortarse`, async ({ page, context }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await sembrar(context, { lang, sidebarCollapsed: true, ritmo: semana ? { semanaTipo: semana } : {} });
    await page.clock.install({ time: new Date('2026-10-07T08:30:00+02:00') });
    await irAlArtefacto(page);
    const dice = vis(page, '[data-pace-ritmo-esquema-dice]');
    await expect(dice).toHaveText(esperado);
    const m = await dice.evaluate((e) => {
      const t = e.parentElement.querySelector('[data-pace-ritmo-tarjeta-titulo]').getBoundingClientRect();
      const d = e.getBoundingClientRect();
      return { misma: Math.abs(t.bottom - d.bottom) < 8, cortado: e.scrollWidth > e.clientWidth + 1, alto: t.height,
        puntos: document.querySelectorAll('[data-pace-ritmo-tarjeta-movil] .pace-rt-esq-punto').length,
        scroll: document.scrollingElement.scrollHeight - innerHeight };
    });
    expect(m.misma, 'en la fila del título').toBe(true);
    expect(m.cortado, 'entero a 360 px').toBe(false);
    expect(m.alto, 'el título en una línea').toBeLessThan(30);
    expect(m.scroll, 'la home sin scroll').toBeLessThanOrEqual(0);
    if (semana) expect(String(m.puntos), 'tantos puntos como pausas dice').toBe((await dice.textContent()).split(' ')[0]);
  });
}

test('V11A · en la tableta, el menú es un cajón de 360 px con la home detrás, y tocar fuera lo cierra', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await page.setViewportSize({ width: 768, height: 1024 });
  await sembrar(context, { sidebarCollapsed: true });
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-open]').first().click();
  const aside = page.locator('[data-pace-sidebar]');
  await expect(aside).toBeVisible();
  const caja = await aside.boundingBox();
  expect(Math.round(caja.width)).toBe(360);
  expect(Math.round(caja.x)).toBe(0);
  const logo = await page.locator('[data-pace-sidebar-logo]').boundingBox();
  expect(logo.width, 'el logo a la medida del móvil').toBeLessThanOrEqual(201);
  await page.mouse.click(600, 500);
  await expect(aside).toHaveCount(0);
  expect(errores).toEqual([]);
});

test('V11A · en el móvil, el menú sigue a pantalla entera', async ({ page, context }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await sembrar(context, { sidebarCollapsed: true });
  await irAlArtefacto(page);
  await page.locator('[data-pace-sidebar-open]').first().click();
  const caja = await page.locator('[data-pace-sidebar]').boundingBox();
  expect(Math.round(caja.width)).toBe(375);
});
