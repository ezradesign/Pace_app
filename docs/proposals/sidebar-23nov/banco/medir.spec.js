/* Medida de lo que va al límite en la barra (23 nov., lo montado de 1C 2A 3B 4B 5A): cada título de logro en
   su fila de una línea, y la frase del agua con «+ vaso», en es y en en, en la barra (280 px) y en el cajón a
   360. Imprime lo que no cabe. Se corre también en Linux: la letra de Linux es la de Android. */
'use strict';
const { test } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirCajon } = require('../../../../tests/helpers');

for (const [nombre, w, h] of [['barra', 1280, 720], ['cajon', 360, 640]]) {
  for (const lang of ['es', 'en']) {
    test('al límite · ' + nombre + ' · ' + lang, async ({ page, context }) => {
      await page.setViewportSize({ width: w, height: h });
      await sembrar(context, { sidebarCollapsed: false, lang, lastActiveDay: new Date().toDateString(),
        achievements: { 'first.sip': { unlockedAt: 1 } }, water: { goal: 12, today: 0, lastReset: null } });
      await irAlArtefacto(page);
      if (w <= 640) await abrirCajon(page);
      const r = await page.evaluate(async (en) => {
        const fila = document.querySelector('[data-pace-sidebar-ultimo-titulo]');
        const no = [];
        let peor = 0, cual = '';
        const filaEntera = fila.parentElement, chev = filaEntera.lastElementChild;
        const libre = () => filaEntera.clientWidth - fila.previousElementSibling.offsetWidth - chev.offsetWidth - 24;
        for (const a of window.ACHIEVEMENT_CATALOG) {
          const tit = en ? (window.PACE_STRINGS.en['ach.item.' + a.id + '.title'] || a.title) : a.title;
          fila.textContent = tit;
          const sobra = fila.scrollWidth - fila.clientWidth;
          if (fila.scrollWidth > peor) { peor = fila.scrollWidth; cual = tit; }
          if (sobra > 0) no.push(tit + ' (+' + sobra + ' px)');
        }
        return { no, mas_largo: cual, ocupa: Math.round(peor / libre() * 100) + ' %', libre: libre() };
      }, lang === 'en');
      console.log(nombre, lang, 'logros:', JSON.stringify(r));
    });
  }
}
