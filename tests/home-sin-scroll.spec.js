/* PACE · E2E · LA HOME DEL MÓVIL NO PIDE SCROLL EN NINGÚN MOMENTO (v0.146.0)
 * ==========================================================================
 * Regla de Ez (8 oct. 2026): «no quiero scroll de ninguna forma», tampoco en
 * inglés. Antes cada prueba miraba su estado en su pantalla y nadie la home
 * entera: con la pregunta ya arreglada, el día servido seguía pidiendo 4 px en
 * su móvil (20 en inglés) y hasta 78 a 360×640, y la tarjeta corta 17.
 *
 * Aquí se recorren los cinco momentos de la home —la tarjeta corta (por libre),
 * la pregunta, el día servido eligiéndolo a las 10:00 (llegar tarde añade una
 * línea a la frase), el día servido al empezar y con la pausa abierta— en los dos
 * idiomas y en las pantallas que importan, de 360×640 (el Android pequeño) a
 * 412×844. A 320×568 se acepta scroll (decisión de Ez): para caber habría que
 * encoger el aro y lo de dentro.
 *
 * Contra v0.145.0 falla en 360×640, 375×667 y 360×718. La segunda medida, con
 * la letra más ancha (MARGEN_LETRA), falla contra v0.146.0 en inglés a 360×640.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');

const FECHA = '2026-10-08';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');

/* `lastActiveDay` en el formato del relevo de día (toDateString) para que no ponga
   `cycle` a cero (TRAMPA de ritmo-llevas.spec.js). */
const MOMENTOS = [
  { nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00' },
  { nombre: 'la pregunta', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true },
  { nombre: 'el día servido llegando a las 10:00', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, elige: 'jornada' },
  { nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }, hora: '09:50' },
];

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Cada navegador dibuja la letra a su ancho: el Chromium de la CI, unas décimas más ancho que el
   de los contenedores, partía en tres líneas la frase del horario en inglés (7 px de scroll a
   360×640) y aquí cabía con 0,3 px. Así que cada momento se mide otra vez con la letra un poco más
   ancha: un texto que va al límite sale en rojo en cualquier máquina, antes de llegar a un móvil. */
const MARGEN_LETRA = 0.3;

for (const lang of ['es', 'en']) {
  for (const vp of [{ w: 360, h: 640 }, { w: 375, h: 667 }, { w: 360, h: 718 }, { w: 412, h: 844 }]) {
    test(lang + ' · ' + vp.w + '×' + vp.h + ': ningún momento de la home pide scroll', async ({ browser }) => {
      const baseURL = test.info().project.use.baseURL;
      const fallos = [];
      for (const m of MOMENTOS) {
        const context = await browser.newContext({ baseURL, viewport: { width: vp.w, height: vp.h }, isMobile: true, hasTouch: true,
          locale: 'es-ES', timezoneId: 'Europe/Madrid' });
        await sembrar(context, Object.assign({ lang, sidebarCollapsed: true }, m.semilla));
        const page = await context.newPage();
        await page.clock.install({ time: hora(m.hora) });
        await irAlArtefacto(page);
        if (m.comienza) await vis(page, '[data-pace-ritmo-comienza]').click();
        if (m.elige) await vis(page, 'button[data-pace-ritmo-opcion="' + m.elige + '"]').click();
        await expect(vis(page, '[data-pace-ritmo-estado], [data-pace-ritmo-tarjeta-movil]').first()).toBeVisible();
        await page.mouse.move(1, 1);
        await asentarGeometria(page);
        const medir = () => page.evaluate(() => {
          const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
          return body.scrollHeight - body.clientHeight;
        });
        const sobra = await medir();
        if (sobra > 1) fallos.push(m.nombre + ': ' + sobra + ' px');
        await page.addStyleTag({ content: '[data-pace-home-body] * { letter-spacing: ' + MARGEN_LETRA + 'px !important }' });
        await asentarGeometria(page);
        const sobraAncha = await medir();
        if (sobraAncha > 1) fallos.push(m.nombre + ' con la letra ' + MARGEN_LETRA + ' px más ancha: ' + sobraAncha + ' px');
        await context.close();
      }
      expect(fallos, 'la home pide scroll').toEqual([]);
    });
  }
}
