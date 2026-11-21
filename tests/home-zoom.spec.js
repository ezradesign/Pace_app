/* PACE · E2E · LA HOME DEL ORDENADOR CON EL NAVEGADOR AMPLIADO (Ez, 21 nov. 2026)
 * ===============================================================================
 * Ez: con Ctrl + «se descuadran todos los elementos». Ampliar no cambia la pantalla: deja
 * menos px CSS. En su pantalla (1911 × 868 útiles) el 150 % deja 1274 × 579 y el 175 %,
 * 1092 × 496. El motor de la home baja el aro hasta su suelo (205), y lo de dentro no bajaba
 * con él: sus mínimos (rótulo de 9 px, descriptor de 11, márgenes, el botón de 44 y la fila
 * del ciclo) son fijos. A 1092 × 496 «Foco manual» y «Bloque 1 de 9» cruzaban el trazo
 * (0,52 D), «Empezar jornada» llegaba a 0,53 y la fila del ciclo se salía por abajo; con la
 * tarjeta corta la home pedía 2 px de scroll. Ahora, por debajo de D_INTERIOR
 * (home-geometry.js) lo de dentro se compone como a ese D y escala entero con el aro.
 *
 * Se mide lo que mide banco-zoom-home.js: la esquina más lejana de la TINTA de cada pieza
 * (un div de texto mide el ancho del bloque; se toma su texto con un Range), contra el centro
 * del aro, en fracción de D. El número no cuenta: su caja de línea lleva el aire de la fuente.
 * Rótulo, «Hasta las», descriptor y botón, dentro de 0,45 (el halo de la bola empieza en
 * 0,458); la fila de abajo («Ciclo 1 / 4», «Después: …»), que va en el horizonte, dentro de
 * 0,50 (a 100 % llega a 0,48 en 1920 × 950). Contra main: 0,52-0,60 en los tres momentos.
 * Y a 100 % no cambia nada: el aro de 1536 × 734 sigue en 400 y su interior sin escalar.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');

const MOMENTOS = [
  { nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00', sinScroll: true },
  { nombre: 'el día servido', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'el bloque terminado al volver', semilla: { ritmo: { libre: true } }, hora: '10:40', terminoA: '10:35', sinScroll: true },
];
const VENTANAS = [{ w: 1274, h: 579, zoom: '150 %' }, { w: 1092, h: 496, zoom: '175 %' }];

function medirInterior(page) {
  return page.evaluate(() => {
    const dial = document.querySelector('[data-pace-dial-fit]');
    /* Como el motor: el bloque que lleva el número (sin el atributo nuevo, para que muerda en main). */
    const numero = dial && dial.querySelector('[data-pace-dial-number]');
    const interior = numero && numero.parentElement;
    if (!interior) return null;
    const f = dial.getBoundingClientRect();
    const cx = f.left + f.width / 2, cy = f.top + f.height / 2, D = f.height;
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const tinta = (el) => {
      if (el.matches('button, a') || !el.textContent.trim()) return el.getBoundingClientRect();
      const rg = document.createRange(); rg.selectNodeContents(el); return rg.getBoundingClientRect();
    };
    const radio = (el) => {
      const r = tinta(el);
      const dx = Math.max(Math.abs(r.left - cx), Math.abs(r.right - cx));
      const dy = Math.max(Math.abs(r.top - cy), Math.abs(r.bottom - cy));
      return Math.hypot(dx, dy) / D;
    };
    const arriba = Array.from(interior.querySelectorAll('[data-pace-dial-label], [data-pace-dial-hasta], [data-pace-dial-subtitle], [data-pace-cta]')).filter(vis);
    const fila = Array.from(interior.querySelectorAll('[data-pace-ciclo], [data-pace-aro-fila]')).filter(vis);
    const peor = (els) => els.reduce((p, el) => { const d = radio(el); return d > p.d ? { d: +d.toFixed(3), quien: el.textContent.trim() } : p; }, { d: 0, quien: '' });
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(vis);
    return {
      D: Math.round(D), arriba: peor(arriba), fila: peor(fila), piezas: arriba.length,
      escala: getComputedStyle(interior).scale, sobra: body.scrollHeight - body.clientHeight,
    };
  });
}

for (const lang of ['es', 'en']) {
  for (const v of VENTANAS) {
    test(lang + ' · ' + v.w + '×' + v.h + ' (el ' + v.zoom + ' en 1911×868): lo de dentro del aro cabe en el aro', async ({ browser }) => {
      const baseURL = test.info().project.use.baseURL;
      const fallos = [];
      for (const m of MOMENTOS) {
        const context = await browser.newContext({ baseURL, viewport: { width: v.w, height: v.h },
          locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
        await sembrar(context, Object.assign({ lang }, m.semilla));
        if (m.terminoA) await context.addInitScript((fin) => {
          if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
        }, hora(m.terminoA).getTime());
        const page = await context.newPage();
        await page.clock.install({ time: hora(m.hora) });
        await irAlArtefacto(page);
        if (m.terminoA) {
          await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(1);
          await expect(async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
          }).toPass();
        }
        await page.mouse.move(1, 1);
        if (!(await asentarGeometria(page))) fallos.push(m.nombre + ': el aro no se asentó');
        const r = await medirInterior(page);
        if (!r || r.piezas < 2) { fallos.push(m.nombre + ': GUARD, no hay interior que medir'); await context.close(); continue; }
        if (r.arriba.d > 0.45) fallos.push(m.nombre + ': «' + r.arriba.quien + '» llega a ' + r.arriba.d + ' D (D = ' + r.D + ', escala ' + r.escala + ')');
        if (r.fila.d > 0.5) fallos.push(m.nombre + ': «' + r.fila.quien + '» llega a ' + r.fila.d + ' D (D = ' + r.D + ')');
        if (m.sinScroll && r.sobra > 1) fallos.push(m.nombre + ': la home pide ' + r.sobra + ' px de scroll');
        await context.close();
      }
      expect(fallos, 'lo de dentro del aro se sale con el navegador ampliado').toEqual([]);
    });
  }
}

test('a 100 % no cambia nada: 1536×734, el aro de 400 y su interior sin escalar', async ({ browser }) => {
  const baseURL = test.info().project.use.baseURL;
  const context = await browser.newContext({ baseURL, viewport: { width: 1536, height: 734 }, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, { ritmo: { libre: true } });
  const page = await context.newPage();
  await page.clock.install({ time: hora('10:00') });
  await irAlArtefacto(page);
  await asentarGeometria(page);
  const r = await medirInterior(page);
  expect(r, 'GUARD: no hay aro con interior').not.toBeNull();
  expect(r.D).toBe(400);
  expect(r.escala === 'none' || r.escala === '1', 'el interior escala a 100 %: ' + r.escala).toBe(true);
  await context.close();
});
