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

/* EL DÍA EN UNA FILA (Ez, A del 22 nov. 2026). Con el día servido, la tarjeta de la jornada es lo más
 * alto de la home: al 175 % en 1911×868 (1092×496) pedía 35 px de scroll en castellano y 79 en inglés,
 * y al 150 % en 1536×864 (1024×489), 87 y 42. Ahora, si con el aro en su suelo no cabe, la línea del
 * día enseña solo la hora de cada parada (home-geometry.medidas.js); el nombre sigue en el
 * `aria-label` y el `title` de su botón. CONTROL: a 100 % (1536×734) la línea va entera.
 * Por debajo de ~470 px de alto ni así cabe: la línea se queda entera y se admite el scroll, con su
 * tope en px, como `pendiente115` en home-sin-scroll.spec.js: se apunta, y si crece, rojo.
 * Mutante: con `paceHomeDiaLinea` devolviendo null, las cuatro primeras vuelven a pedir scroll. */
const DIA = [
  { w: 1092, h: 496, nombre: 'el 175 % en 1911×868', fila: true },
  { w: 1024, h: 489, nombre: 'el 150 % en 1536×864', fila: true },
  { w: 1536, h: 734, nombre: 'CONTROL, 1536×864 al 100 %', fila: false },
  /* Ancha y muy baja: con menos de ~1000 px de ancho la tarjeta del día ya va en su versión estrecha
     («Ahora» y «Luego»), sin línea; el 150 % en 1366×768 (910×425) es así. */
  { w: 1280, h: 440, nombre: 'una ventana ancha y muy baja', fila: false, tope: 105 },   // 92 px aquí
];

for (const lang of ['es', 'en']) {
  for (const v of DIA) {
    test(lang + ' · ' + v.w + '×' + v.h + ' (' + v.nombre + '), con el día servido: ' + (v.tope ? 'scroll admitido, con tope' : v.fila ? 'la línea solo con horas, sin scroll' : 'la línea entera'), async ({ browser }) => {
      const baseURL = test.info().project.use.baseURL;
      const context = await browser.newContext({ baseURL, viewport: { width: v.w, height: v.h },
        locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
      await sembrar(context, { lang, ritmo: { dia: JORNADA } });
      const page = await context.newPage();
      await page.clock.install({ time: hora('09:00') });
      await irAlArtefacto(page);
      await expect(page.locator('[data-pace-ritmo-linea]')).toBeVisible();
      await page.mouse.move(1, 1);
      expect(await asentarGeometria(page), 'el aro no se asentó').toBe(true);
      const r = await page.evaluate(() => {
        const body = document.querySelector('[data-pace-home-body]');
        const nombres = Array.from(document.querySelectorAll('[data-pace-ritmo-linea] .pace-rt-n'));
        const botones = Array.from(document.querySelectorAll('[data-pace-ritmo-parada]'));
        return {
          fila: body.hasAttribute('data-pace-home-dia-fila'),
          sobra: body.scrollHeight - body.clientHeight,
          nombresVisibles: nombres.filter((n) => getComputedStyle(n).display !== 'none').length,
          nombres: nombres.length,
          horas: Array.from(document.querySelectorAll('[data-pace-ritmo-linea] .pace-rt-h')).filter((n) => n.getBoundingClientRect().height > 0).length,
          /* Cada parada sigue diciendo qué es: hora y rutina en su nombre accesible, rutina en el title. */
          sinNombre: botones.filter((b) => !(b.getAttribute('aria-label') || '').includes(' · ') || !b.title).length,
        };
      });
      expect(r.nombres, 'GUARD: la línea del día no tiene etiquetas').toBeGreaterThan(3);
      expect(r.sinNombre, 'paradas sin nombre accesible o sin title').toBe(0);
      if (v.tope) {
        if (r.sobra > 1) test.info().annotations.push({ type: 'scroll admitido (Ez, A del 22 nov.)', description: v.w + '×' + v.h + ': ' + r.sobra + ' px' });
        expect(r.sobra, 'más scroll que su tope').toBeLessThanOrEqual(v.tope);
        expect(r.fila, 'sin caber ni recogida, la línea se queda entera').toBe(false);
      } else if (v.fila) {
        expect(r.sobra, 'la home pide scroll con el día servido').toBeLessThanOrEqual(1);
        expect(r.fila, 'la línea del día no se recogió').toBe(true);
        expect(r.nombresVisibles, 'recogida, la línea aún enseña nombres').toBe(0);
        expect(r.horas, 'recogida, cada parada sigue con su hora').toBe(r.nombres);
      } else {
        expect(r.sobra).toBeLessThanOrEqual(1);
        expect(r.fila, 'con sitio, la línea del día se recogió').toBe(false);
        expect(r.nombresVisibles, 'con sitio, faltan nombres en la línea').toBe(r.nombres);
      }
      await context.close();
    });
  }
}
