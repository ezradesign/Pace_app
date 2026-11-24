/* RAMA DE DIAGNÓSTICO (no se junta): cuánto ocupan en Linux el título de la pregunta y sus dos enlaces
   («Ahora no» y «Hoy voy por libre») frente al hueco de la fila, para elegir un arreglo que quepa también
   allí (y en Android, que pinta la letra igual). Solo mide e imprime: no falla. */
'use strict';

const { test } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });

for (const lang of ['es', 'en']) {
  for (const vp of [{ w: 360, h: 640 }, { w: 375, h: 667 }, { w: 390, h: 844 }]) {
    test.describe(lang + ' ' + vp.w + '×' + vp.h, () => {
      test.use({ viewport: { width: vp.w, height: vp.h }, isMobile: true, hasTouch: true });
      test('mide', async ({ page, context }) => {
        await sembrar(context, { sidebarCollapsed: true, lang });
        await page.clock.install({ time: new Date('2026-09-22T10:00:00+02:00') });
        await irAlArtefacto(page);
        await vis(page, '[data-pace-ritmo-comienza]').click();
        await vis(page, '[data-pace-ritmo-estado="pregunta"]').waitFor();
        await page.evaluate(() => document.fonts.ready);
        const m = await page.evaluate(() => {
          const p = Array.from(document.querySelectorAll('[data-pace-ritmo-estado="pregunta"]')).find((e) => e.getBoundingClientRect().width > 0);
          const cab = p.querySelector('.pace-rt-mov-cab');
          const natural = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; };
          const t = p.querySelector('.pace-rt-titulo');
          const a = p.querySelector('[data-pace-ritmo-ahorano]');
          const l = p.querySelector('[data-pace-ritmo-libre]');
          const cs = getComputedStyle(cab);
          const util = cab.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
          const fuentes = Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.style).join(', ');
          return {
            util: +util.toFixed(2), titulo: +natural(t).toFixed(2), ahora: +natural(a).toFixed(2), libre: +natural(l).toFixed(2),
            letrasTitulo: t.textContent.length, letrasEnlaces: a.textContent.length + l.textContent.length,
            tituloPx: getComputedStyle(t).fontSize, enlacePx: getComputedStyle(a).fontSize, enlaceLs: getComputedStyle(a).letterSpacing,
            gapCab: cs.columnGap, gapGrupo: getComputedStyle(a.parentElement).columnGap, fuentes,
          };
        });
        console.log('DIAG ' + JSON.stringify({ lang, w: vp.w, ...m }));
      });
    });
  }
}
