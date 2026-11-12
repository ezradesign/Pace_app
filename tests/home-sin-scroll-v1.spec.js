/* PACE · E2E · LA HOME DEL MÓVIL SIN SCROLL TAMBIÉN EN v1, UN LUNES Y CON LAS BARRAS (la octava, prueba 8, 12 nov. 2026)
 * ==========================================================================
 * home-sin-scroll.spec.js recorre los momentos de la home antes de v1, un jueves, sin barras, y
 * mide solo el cuerpo de la home (nº 16). Aquí, los mismos momentos de la tarjeta (la corta, el día
 * servido, la pausa abierta y el día contestado):
 *   · en v1 (`PREMIUM_ABIERTO_HASTA_V1` apagada, sin semana de prueba ni código) y un lunes, que es
 *     cuando el móvil lleva arriba el sobre de la carta del lunes (ritmo.lunes.jsx);
 *   · sin barra, con la de «Hay una versión nueva» y con la de «no deja guardar»;
 *   · en castellano y en inglés, cada uno con el idioma del navegador a juego;
 * y se mide el cuerpo de la home, el documento (vertical y horizontal) y cualquier caja de la página
 * que se pueda desplazar. Mutante: con las barras en el flujo de la página (`position: relative` en
 * vez de `fixed`, UpdatePrompt.jsx), el documento pide scroll; home-sin-scroll no lo ve, porque solo
 * mide el cuerpo de la home.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

test.use({ serviceWorkers: 'block' });

const FECHA = '2026-11-23';   // lunes
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+01:00');
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const EN_V1 = { pasoV1: { at: 1, previo: false } };

const MOMENTOS = [
  { nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00' },
  { nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Mon Nov 23 2026', _historyMigrated: true }, hora: '09:50' },
  { nombre: 'el día ya contestado', semilla: { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } }, hora: '08:30' },
];
const BARRAS = [
  { nombre: 'sin barra', antes: null },
  { nombre: 'con «versión nueva»', antes: () => { window.__paceSwWaitingReg = {}; }, sel: '[data-pace-update-prompt]' },
  { nombre: 'con «no deja guardar»', antes: () => { window.__paceNoGuarda = true; }, sel: '[data-pace-no-guarda]' },
];

/* Lo que se desplaza: el cuerpo de la home, el documento en los dos sentidos y cualquier caja visible
   con scroll propio que tenga de verdad algo que desplazar. */
const medir = (page) => page.evaluate(() => {
  const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
  const doc = document.scrollingElement;
  const cajas = Array.from(document.querySelectorAll('body *')).filter((e) => {
    if (e === body || !e.getClientRects().length) return false;
    const cs = getComputedStyle(e);
    const v = /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 1;
    const h = /(auto|scroll)/.test(cs.overflowX) && e.scrollWidth > e.clientWidth + 1;
    return v || h;
  }).map((e) => e.tagName.toLowerCase() + Array.from(e.attributes).filter((a) => a.name.startsWith('data-pace')).map((a) => '[' + a.name + ']').join('')
    + ' ' + (e.scrollHeight - e.clientHeight) + '×' + (e.scrollWidth - e.clientWidth));
  return { home: body.scrollHeight - body.clientHeight, alto: doc.scrollHeight - innerHeight, ancho: doc.scrollWidth - innerWidth, cajas };
});

for (const lang of ['es', 'en']) {
  for (const vp of [{ w: 360, h: 640 }, { w: 375, h: 667 }]) {
    test(lang + ' · ' + vp.w + '×' + vp.h + ' · en v1 y en lunes, con o sin barra: nada pide scroll', async ({ browser }) => {
      const fallos = [];
      for (const m of MOMENTOS) {
        for (const b of BARRAS) {
          const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, viewport: { width: vp.w, height: vp.h },
            isMobile: true, hasTouch: true, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
          await context.addInitScript(() => {
            Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
          });
          if (b.antes) await context.addInitScript(b.antes);
          await sembrar(context, Object.assign({ lang, sidebarCollapsed: true }, EN_V1, m.semilla));
          const page = await context.newPage();
          await page.clock.install({ time: hora(m.hora) });
          await irAlArtefacto(page);
          await expect(page.locator('button[aria-label="La carta del lunes"], button[title="La carta del lunes"], button[aria-label="The Monday letter"], button[title="The Monday letter"]').first(),
            'GUARD: un lunes en v1, el sobre de la carta del lunes').toBeVisible();
          if (b.sel) await expect(page.locator(b.sel), 'GUARD: la barra').toBeVisible();
          await page.mouse.move(1, 1);
          if (!(await asentarGeometria(page))) fallos.push(m.nombre + ' ' + b.nombre + ': el aro no se asentó en 90 fotogramas');
          const r = await medir(page);
          const donde = m.nombre + ' ' + b.nombre;
          if (r.home > 1) fallos.push(donde + ': la home pide ' + r.home + ' px');
          if (r.alto > 0) fallos.push(donde + ': el documento pide ' + r.alto + ' px');
          if (r.ancho > 0) fallos.push(donde + ': el documento pide ' + r.ancho + ' px de lado');
          if (r.cajas.length) fallos.push(donde + ': cajas con scroll: ' + r.cajas.join(', '));
          await context.close();
        }
      }
      expect(fallos, 'en v1, en lunes y con barras').toEqual([]);
    });
  }
}
