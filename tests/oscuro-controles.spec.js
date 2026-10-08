/* PACE · E2E · LO QUE PINTA EL NAVEGADOR SE LEE EN LAS DOS PALETAS (oscuro-1 y oscuro-4)
 * ======================================================================================
 * La lista de horas de «A tu ritmo» salía blanca con las horas en crema en oscuro
 * (1,25:1, solo se leía la elegida). Ez eligió que la dibuje PACE (opción C) en las dos
 * paletas: `appearance: base-select` en `.pace-rt-sel`, con papel, línea y la serif.
 * Aquí se abre de verdad en la pregunta y en el día servido, en móvil y escritorio, y
 * se pide que la lista salga dentro de la página y que sus horas, la elegida también,
 * se lean sobre el papel de la lista (4,5:1).
 *
 * La casilla «Lo he leído» del aviso de apnea era un cuadrado blanco en oscuro y azul
 * de Chrome al marcarla: ahora va en oscuro y con el verde de la casa.
 *
 * Contra v0.146.0 fallan las nueve pruebas.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, overlaySuperior } = require('./helpers');

const FECHA = '2026-10-08';
const DIA = { dia: { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } };

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Contraste WCAG de dos colores CSS; el de delante se compone sobre el de detrás. */
function contraste(delante, detras) {
  const rgba = (s) => { const n = s.match(/[\d.]+/g).map(Number); return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }; };
  const f = rgba(delante), b = rgba(detras);
  const c = { r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a) };
  const lum = (x) => { const v = [x.r, x.g, x.b].map((k) => { k /= 255; return k <= 0.03928 ? k / 12.92 : Math.pow((k + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const l1 = lum(c), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const PANTALLAS = [
  { nombre: 'escritorio', viewport: { width: 1280, height: 720 } },
  { nombre: 'móvil', viewport: { width: 360, height: 718 }, isMobile: true, hasTouch: true },
];

for (const palette of ['oscuro', 'crema']) {
  for (const pantalla of PANTALLAS) {
    for (const sitio of ['la pregunta', 'el día servido']) {
      test(palette + ' · ' + pantalla.nombre + ' · ' + sitio + ': la lista de horas abierta se lee', async ({ browser }) => {
        const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, viewport: pantalla.viewport,
          isMobile: !!pantalla.isMobile, hasTouch: !!pantalla.hasTouch, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
        await sembrar(context, Object.assign({ palette, sidebarCollapsed: !!pantalla.isMobile }, sitio === 'el día servido' ? { ritmo: DIA } : {}));
        const page = await context.newPage();
        await page.clock.install({ time: new Date(FECHA + 'T10:00:00+02:00') });
        await irAlArtefacto(page);
        if (sitio === 'la pregunta') {
          if (pantalla.isMobile) await vis(page, '[data-pace-ritmo-comienza]').first().click();
          else await vis(page, 'button').filter({ hasText: 'Ajustar el horario' }).first().click();
        }
        const sel = vis(page, 'select.pace-rt-sel[data-pace-ritmo-horario="inicio"]').first();
        await sel.click();
        const m = await sel.evaluate((e) => {
          const fondo = getComputedStyle(e, '::picker(select)').backgroundColor;
          const elegida = e.selectedOptions[0];
          const otra = Array.from(e.options).find((o) => o !== elegida);
          const caja = elegida.getBoundingClientRect();
          return { abierta: e.matches(':open'), fondo, caja: { w: caja.width, h: caja.height, top: caja.top, bottom: caja.bottom },
            alto: innerHeight, elegida: [getComputedStyle(elegida).color, getComputedStyle(elegida).backgroundColor],
            otra: [getComputedStyle(otra).color, getComputedStyle(otra).backgroundColor] };
        });
        expect(m.abierta).toBe(true);
        /* La lista va dentro de la página: la hora elegida tiene caja y se ve entera. */
        expect(m.caja.h).toBeGreaterThan(20);
        expect(m.caja.top).toBeGreaterThanOrEqual(0);
        expect(m.caja.bottom).toBeLessThanOrEqual(m.alto);
        /* Una hora cualquiera y la elegida (con su lavado encima del papel de la lista). */
        expect(contraste(m.otra[0], m.fondo)).toBeGreaterThanOrEqual(4.5);
        const papelElegida = m.elegida[1];
        const sobre = (fr, bk) => { const a = fr.match(/[\d.]+/g).map(Number), b = bk.match(/[\d.]+/g).map(Number), al = a.length > 3 ? a[3] : 1;
          return 'rgb(' + [0, 1, 2].map((i) => a[i] * al + b[i] * (1 - al)).join(',') + ')'; };
        expect(contraste(m.elegida[0], sobre(papelElegida, m.fondo))).toBeGreaterThanOrEqual(4.5);
        await context.close();
      });
    }
  }
}

test('oscuro: la casilla del aviso de apnea va en oscuro y con el verde de la casa', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, locale: 'es-ES', timezoneId: 'Europe/Madrid' });
  await sembrar(context, { palette: 'oscuro' });
  const page = await context.newPage();
  await irAlArtefacto(page);
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: 'Rondas express' }).click();
  const casilla = overlaySuperior(page).getByRole('checkbox', { name: 'Lo he leído y asumo mi responsabilidad' });
  await expect(casilla).toBeVisible();
  const m = await casilla.evaluate((e) => {
    const verde = document.createElement('i');
    verde.style.color = 'var(--focus-cta)';
    document.body.appendChild(verde);
    const r = { esquema: getComputedStyle(e).colorScheme, acento: getComputedStyle(e).accentColor, verde: getComputedStyle(verde).color };
    verde.remove();
    return r;
  });
  expect(m.esquema).toBe('dark');
  expect(m.acento).toBe(m.verde);
  await context.close();
});
