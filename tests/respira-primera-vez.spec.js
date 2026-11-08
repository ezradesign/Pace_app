/* PACE · E2E · RESPIRA, LA PRIMERA VEZ (Ez, 5 nov. 2026: 3A)
 * ===========================================================
 * R1 de las revisiones de ChatGPT del 28 oct.: Respira abría con «Energía», cuyas tres rutinas
 * llevan aviso de seguridad; «Equilibrio» y «Balance» eran grupos distintos con nombres que dicen
 * lo mismo, y ninguna tarjeta decía si se aguanta el aire. Ez eligió la 3A de la maqueta:
 *  · hasta la primera respiración terminada, «¿Es tu primera vez? Empieza aquí» con Coherente 5·5
 *    ocupa el sitio de «Para ahora» (en las dos pieles); después vuelve «Para ahora»;
 *  · cada tarjeta dice «sin aguantar el aire» o «aguantando el aire»;
 *  · los grupos van de lo suave a lo intenso, con Energía al final, y «Balance» se lee «Coherencia».
 * El orden del CATÁLOGO no cambia: «A tu ritmo» sirve las mismas respiraciones que antes.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

async function abrirRespira(page, context, extra, w, h) {
  await page.setViewportSize({ width: w || 1280, height: h || 879 });
  await sembrar(context, extra || {});
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:sidebar-action', { detail: { kind: 'module', target: 'breathe' } })));
  await page.locator('.pace-lib-rejilla [data-pace-lib-card]').first().waitFor({ state: 'visible' });
}
const visibles = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0)
  .map((e) => ({ id: e.getAttribute('data-pace-lib-card'), txt: e.textContent })), sel);

for (const [piel, w, h, sitio] of [['escritorio', 1280, 879, '.pace-lib-lateral'], ['móvil', 360, 730, '.pace-lib-solo-movil']]) {
  test('sin ninguna respiración, «Empieza aquí» con Coherente 5·5 ocupa el sitio de «Para ahora» · ' + piel, async ({ page, context }) => {
    await abrirRespira(page, context, {}, w, h);
    const bloque = page.locator(sitio + ' [data-pace-lib-now]').filter({ visible: true });
    await expect(bloque, 'no hay bloque arriba').toHaveCount(1);
    const tarjetas = await visibles(page, sitio + ' [data-pace-lib-now] [data-pace-lib-card]');
    expect(tarjetas.map((x) => x.id), 'arriba no está Coherente 5·5').toEqual(['breathe.coherent.55']);
    const titulo = await page.evaluate((s) => {
      const b = [...document.querySelectorAll(s + ' [data-pace-lib-now]')].find((e) => e.getBoundingClientRect().width > 0);
      const t = (b.closest('.pace-lib-lateral') ? b.previousElementSibling : b.querySelector('h3'));
      return t ? t.textContent : null;
    }, sitio);
    expect(titulo, 'el bloque no dice que es para la primera vez').toBe('¿Es tu primera vez? Empieza aquí');
    const enGrupo = (await visibles(page, '.pace-lib-rejilla [data-pace-lib-card]')).filter((x) => x.id === 'breathe.coherent.55');
    expect(enGrupo.length, 'Coherente 5·5 sale arriba y también en su grupo').toBe(0);
  });
}

test('con una respiración hecha, vuelve «Para ahora»', async ({ page, context }) => {
  await abrirRespira(page, context, { breatheSessionsTotal: 1 });
  await expect(page.locator('.pace-lib-lateral .pace-lib-lateral-tit').filter({ hasText: 'Para ahora' })).toHaveCount(1);
  await expect(page.getByText('¿Es tu primera vez? Empieza aquí')).toHaveCount(0);
});

test('los grupos van de lo suave a lo intenso, y «Balance» se lee «Coherencia»', async ({ page, context }) => {
  await abrirRespira(page, context, { breatheSessionsTotal: 1 });
  const grupos = await page.evaluate(() => [...document.querySelectorAll('.pace-lib-rejilla .pace-lib-grp')].map((e) => e.textContent));
  expect(grupos).toEqual(['Relajación', 'Coherencia', 'Equilibrio', 'Pranayama', 'Energía']);
  /* «Coherencia» se lee también en la sesión, arriba: es el `code` de sus tres rutinas. */
  const codigos = await page.evaluate(() => window.BREATHE_ROUTINES.balance.items.map((r) => r.code));
  expect(codigos).toEqual(['Coherencia', 'Coherencia', 'Coherencia']);
  /* Y el catálogo sigue en su orden: «A tu ritmo» recorre sus pozos por él. */
  expect(await page.evaluate(() => Object.keys(window.BREATHE_ROUTINES)), 'el catálogo ha cambiado de orden: cambia lo que sirve «A tu ritmo»')
    .toEqual(['energia', 'equilibrio', 'balance', 'relajacion', 'pranayama']);
});

test('en inglés, «Coherence» y «First time? Start here»', async ({ page, context }) => {
  await abrirRespira(page, context, { lang: 'en', langAuto: false });
  await expect(page.getByText('First time? Start here').filter({ visible: true })).toHaveCount(1);
  const grupos = await page.evaluate(() => [...document.querySelectorAll('.pace-lib-rejilla .pace-lib-grp')].map((e) => e.textContent));
  expect(grupos).toEqual(['Relaxation', 'Coherence', 'Balance', 'Pranayama', 'Energy']);
  await expect(page.locator('.pace-lib-rejilla [data-pace-lib-card="breathe.coherent.66"] .pace-lib-ctx')).toContainText('no breath holds');
});

test('cada tarjeta dice si se aguanta el aire, con lo que hace su sesión', async ({ page, context }) => {
  await abrirRespira(page, context, { breatheSessionsTotal: 1 });
  const r = await page.evaluate(() => [...document.querySelectorAll('.pace-lib-rejilla [data-pace-lib-card]')].map((e) => {
    const id = e.getAttribute('data-pace-lib-card');
    const rut = window.getBreatheRoutine(id);
    return { id, ctx: e.querySelector('.pace-lib-ctx').textContent, aire: window.libraryAire(rut), retiene: window.libraryConRetencion(rut) };
  }));
  expect(r.length, 'GUARD: la biblioteca no tiene tarjetas').toBeGreaterThan(10);
  expect(r.filter((x) => x.aire === 'sin').length, 'GUARD: ninguna dice «sin aguantar el aire»').toBeGreaterThan(3);
  expect(r.filter((x) => x.aire === 'con').length, 'GUARD: ninguna dice «aguantando el aire»').toBeGreaterThan(3);
  const mal = r.filter((x) => (x.aire === 'sin') !== x.ctx.includes('sin aguantar el aire')
    || (x.aire === 'con') !== x.ctx.includes('aguantando el aire')
    || (x.aire === 'sin' && x.retiene) || (x.aire === 'con' && !x.retiene)).map((x) => x.id);
  expect(mal, 'la tarjeta y la sesión no dicen lo mismo del aire').toEqual([]);
  /* Lo que ya lo dice o no aguanta: «sostén en vacío» y el fuelle, sin frase. */
  expect(r.filter((x) => ['breathe.co2', 'breathe.bellows', 'breathe.kapalabhati'].includes(x.id)).map((x) => x.aire)).toEqual([null, null, null]);
});
