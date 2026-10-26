// Fotos y medidas de cómo están HOY la bienvenida, la home de después y los Ajustes.
'use strict';
const { R, TAMANOS, tag, abrir, foto, guardar } = require('./comun');
const { test } = require(R + '/node_modules/@playwright/test');

const CASOS = [
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.m),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.d),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.d),
];

for (const o of CASOS) {
  test('bienvenida de hoy ' + tag(o), async ({ browser }) => {
    const { context, page } = await abrir(browser, Object.assign({ fresco: true }, o));
    await foto(page, 'ob0-' + tag(o));
    await page.locator('[role=dialog] [data-pace-cta]').click();
    await page.locator('[data-pace-semana-editor]').waitFor();
    await page.waitForTimeout(700);
    await foto(page, 'obsemana-' + tag(o));
    const sobra = await page.evaluate(() => { const s = document.querySelector('[role=dialog][data-pace-scene-card] > div:nth-of-type(2)'); return s ? s.scrollHeight - s.clientHeight : null; });
    await page.locator('[data-pace-semana-guardar]').click();
    await page.locator('[role=dialog][data-pace-scene-card]').waitFor({ state: 'detached' });
    await page.waitForTimeout(900);
    await foto(page, 'home-' + tag(o));
    /* Lo que hay en la home para anclar las propuestas: el aro y las tarjetas de módulo. */
    const anclas = await page.evaluate(() => {
      const caja = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
      const visibles = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0);
      return {
        dial: caja(visibles('[data-pace-dial-number]')[0]),
        dialRing: caja(visibles('[data-pace-dial]')[0] || visibles('[data-pace-timer]')[0]),
        botones: visibles('button').map((b) => ({ t: (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 40), c: caja(b) })).slice(0, 60),
      };
    });
    guardar('anclas-' + tag(o), { sobraSemana: sobra, anclas });
    await context.close();
  });
}

const AJ = [
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.m),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.m640),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.d),
  Object.assign({ pal: 'oscuro', lang: 'en' }, TAMANOS.d),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.ez),
  Object.assign({ pal: 'crema', lang: 'en' }, TAMANOS.ez),
  Object.assign({ pal: 'crema', lang: 'es' }, TAMANOS.d768),
  Object.assign({ pal: 'crema', lang: 'en' }, TAMANOS.d768),
];
for (const o of AJ) {
  test('ajustes de hoy ' + tag(o) + 'x' + o.h, async ({ browser }) => {
    const { context, page } = await abrir(browser, o);
    await page.getByRole('button', { name: o.lang === 'en' ? 'Open settings' : 'Abrir ajustes' }).click();
    const panel = page.locator('[data-pace-tweaks-panel]');
    await panel.waitFor();
    await page.waitForTimeout(500);
    const medir = () => panel.evaluate((p) => ({ alto: p.clientHeight, contenido: p.scrollHeight, sobra: p.scrollHeight - p.clientHeight, ventana: innerHeight }));
    const m = await medir();
    const filas = await panel.evaluate((p) => [...p.querySelectorAll('.pace-aj-fila, .pace-aj-accion')].map((f) => {
      const r = f.getBoundingClientRect(); const c = f.querySelector('.pace-aj-sw, .pace-aj-pild'); const rc = c ? c.getBoundingClientRect() : null;
      return { id: f.getAttribute('data-pace-aj-fila') || (f.innerText || '').trim().slice(0, 30), alto: Math.round(r.height), control: rc ? Math.round(rc.width) + 'x' + Math.round(rc.height) : null };
    }));
    const n = 'aj-' + tag(o) + 'x' + o.h;
    await foto(page, n);
    let datos = null;
    if (o.w < 700) {
      await panel.locator('[data-pace-aj-plegada] .pace-aj-sec-accion').click();
      await page.waitForTimeout(400);
      datos = await medir();
      await foto(page, n + '-datos');
    }
    guardar(n, { m, datos, filas });
    await context.close();
  });
}
