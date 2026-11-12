/* PACE · E2E · LA HOME DEL MÓVIL NO PIDE SCROLL EN NINGÚN MOMENTO (v0.146.0)
 * ==========================================================================
 * Regla de Ez (8 oct. 2026): «no quiero scroll de ninguna forma», tampoco en
 * inglés. Antes cada prueba miraba su estado en su pantalla y nadie la home
 * entera: con la pregunta ya arreglada, el día servido seguía pidiendo 4 px en
 * su móvil (20 en inglés) y hasta 78 a 360×640, y la tarjeta corta 17.
 *
 * Aquí se recorren los momentos de la home —la tarjeta corta (por libre),
 * la pregunta, el día servido eligiéndolo a las 10:00 (llegar tarde añade una
 * línea a la frase), el día servido al empezar, con la pausa abierta y el día ya
 * contestado de tu semana, y el bloque que terminó con PACE cerrado— en los dos
 * idiomas y en las pantallas que importan, de 360×640 (el Android pequeño) a
 * 412×844. A 320×568 se acepta scroll (decisión de Ez): para caber habría que
 * encoger el aro y lo de dentro.
 *
 * Contra v0.145.0 falla en 360×640, 375×667 y 360×718. La segunda medida, con
 * la letra más ancha (MARGEN_LETRA), falla contra v0.146.0 en inglés a 360×640.
 * El bloque terminado (al volver se cuenta, foco-3) pedía 8 px a 360×640 en
 * castellano: «Siguiente · Ciclo 2 / 4» agrandaba el aro.
 *
 * LA TERCERA MEDIDA, CON LA LETRA AL 115 % (Ez, 1 A2 de la octava, 12 nov. 2026): el WebView
 * de Android escala la letra con la del sistema, y al 115 % el día servido pedía 36 px a
 * 360×640 y 38 con la pausa abierta. Ahora la tarjeta enseña solo «Ahora» y «Luego» queda
 * en «Ver todo» (home-geometry.medidas.js). Aquí se emula agrandando ×1,15 el tamaño de letra
 * calculado de cada elemento de la home. Con la letra normal, la home no se recoge nunca.
 * Mutante: con `paceHomeLuego` devolviendo null, el día servido vuelve a pedir 36 px.
 * Donde no hay «Luego» (la tarjeta corta, el día ya contestado y el bloque terminado al
 * volver), lo que se recoge son las Actividades: las cuatro en una fila, solo con su dibujo
 * (Ez, B, 12 nov. 2026); el nombre sigue en `aria-label` y `title`. Mutante: con `paceHomeChips`
 * devolviendo [], la tarjeta corta vuelve a pedir 13 px en castellano y 41 en inglés a 360×640.
 * La pregunta del día no tiene ni «Luego» ni Actividades: en inglés a 360×640 pide 17 px y va
 * con `pendiente115`, su tope en px (20 en la CI): se mide y se apunta, y si crece, rojo.
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
  { nombre: 'la pregunta', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, pendiente115: 20 },
  { nombre: 'el día servido llegando a las 10:00', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, elige: 'jornada' },
  { nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'el día ya contestado', semilla: { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } }, hora: '08:30' },
  { nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }, hora: '09:50' },
  { nombre: 'el bloque terminado al volver', semilla: { ritmo: { libre: true } }, hora: '10:40', terminoA: '10:35' },
];

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Cada navegador dibuja la letra a su ancho: el Chromium de la CI, unas décimas más ancho que el
   de los contenedores, partía en tres líneas la frase del horario en inglés (7 px de scroll a
   360×640) y aquí cabía con 0,3 px. Así que cada momento se mide otra vez con la letra un poco más
   ancha: un texto que va al límite sale en rojo en cualquier máquina, antes de llegar a un móvil. */
const MARGEN_LETRA = 0.3;
const LETRA_GRANDE = 1.15;
const JUSTA = '[data-pace-home-justa]';
const FILA = '[data-pace-home-fila]';

for (const lang of ['es', 'en']) {
  for (const vp of [{ w: 360, h: 640 }, { w: 375, h: 667 }, { w: 360, h: 718 }, { w: 412, h: 844 }]) {
    test(lang + ' · ' + vp.w + '×' + vp.h + ': ningún momento de la home pide scroll', async ({ browser }) => {
      const baseURL = test.info().project.use.baseURL;
      const fallos = [];
      for (const m of MOMENTOS) {
        const context = await browser.newContext({ baseURL, viewport: { width: vp.w, height: vp.h }, isMobile: true, hasTouch: true,
          locale: 'es-ES', timezoneId: 'Europe/Madrid' });
        await sembrar(context, Object.assign({ lang, sidebarCollapsed: true }, m.semilla));
        /* Un bloque de 25 que terminó con PACE cerrado: al abrir cuenta y abre la pausa (foco-3). */
        if (m.terminoA) await context.addInitScript((fin) => {
          if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
        }, hora(m.terminoA).getTime());
        const page = await context.newPage();
        await page.clock.install({ time: hora(m.hora) });
        await irAlArtefacto(page);
        if (m.comienza) await vis(page, '[data-pace-ritmo-comienza]').click();
        if (m.elige) await vis(page, 'button[data-pace-ritmo-opcion="' + m.elige + '"]').click();
        if (m.terminoA) {
          await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(1);
          /* En WebKit el Escape puede llegar antes de que la pausa lo escuche: se repite hasta que cierra. */
          await expect(async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
          }).toPass();
        }
        await expect(vis(page, '[data-pace-ritmo-estado], [data-pace-ritmo-tarjeta-movil]').first()).toBeVisible();
        await page.mouse.move(1, 1);
        await asentarGeometria(page);
        const medir = () => page.evaluate(() => {
          const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find((e) => e.getBoundingClientRect().width > 0);
          return body.scrollHeight - body.clientHeight;
        });
        const sobra = await medir();
        if (sobra > 1) fallos.push(m.nombre + ': ' + sobra + ' px');
        if (await page.locator(JUSTA).count()) fallos.push(m.nombre + ': con la letra normal la tarjeta escondió «Luego»');
        if (await page.locator(FILA).count()) fallos.push(m.nombre + ': con la letra normal las actividades se pusieron en fila');
        if (await page.locator('[data-pace-activitybar-chip][title], [data-pace-activitybar-chip][aria-label]').count()) fallos.push(m.nombre + ': con la letra normal las actividades llevan tooltip');
        await page.addStyleTag({ content: '[data-pace-home-body] * { letter-spacing: ' + MARGEN_LETRA + 'px !important }' });
        await asentarGeometria(page);
        const sobraAncha = await medir();
        if (sobraAncha > 1) fallos.push(m.nombre + ' con la letra ' + MARGEN_LETRA + ' px más ancha: ' + sobraAncha + ' px');
        const conLuego = await vis(page, '.pace-rt-mov [data-pace-ritmo-luego]').count();
        await page.evaluate((f) => {
          const els = Array.from(document.querySelectorAll('[data-pace-home-body], [data-pace-home-body] *'));
          const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
          els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * f) + 'px', 'important'));
          window.dispatchEvent(new Event('pace:home-relayout'));
        }, LETRA_GRANDE);
        await asentarGeometria(page);
        const sobraGrande = await medir();
        const nombre115 = m.nombre + ' con la letra al ' + Math.round(LETRA_GRANDE * 100) + ' %';
        if (m.pendiente115) {
          if (sobraGrande > 1) test.info().annotations.push({ type: 'espera a Ez', description: nombre115 + ': ' + sobraGrande + ' px' });
          if (sobraGrande > m.pendiente115) fallos.push(nombre115 + ': ' + sobraGrande + ' px, más que su tope de ' + m.pendiente115);
        } else if (sobraGrande > 1) fallos.push(nombre115 + ': ' + sobraGrande + ' px');
        /* En fila, cada actividad dice su nombre al lector y en el tooltip. */
        if (await page.locator(FILA).count()) {
          const nombres = await page.locator('[data-pace-activitybar-chip]').evaluateAll((els) => els.map((e) =>
            [e.getAttribute('aria-label'), e.getAttribute('title'), e.querySelector('[data-pace-chip-label]').textContent]));
          if (nombres.length !== 4 || nombres.some(([a, t, r]) => !r || a !== r || t !== r)) fallos.push(nombre115 + ': actividades en fila sin su nombre: ' + JSON.stringify(nombres));
        }
        /* Escondida, la fila no se pinta: ni foco ni lector de pantalla (display: none). */
        if (conLuego && await page.locator(JUSTA).count()) {
          const ve = await page.locator('.pace-rt-mov [data-pace-ritmo-luego]').evaluateAll((els) => els.map((e) => getComputedStyle(e).display));
          if (ve.some((d) => d !== 'none')) fallos.push(nombre115 + ': «Luego» recogido pero aún se pinta');
        }
        await context.close();
      }
      expect(fallos, 'la home pide scroll').toEqual([]);
    });
  }
}
