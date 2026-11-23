/* PACE · banco de fotos de la barra lateral y del cajón (23 nov. 2026)
   ====================================================================
   No es una prueba: fotografía la barra como la usa alguien y apunta sus medidas,
   para la página de propuestas de `docs/proposals/sidebar-23nov/`. Se corre con
   su propia configuración (fuera de la suite):

     PACE_E2E_PORT=9001 npx playwright test -c docs/proposals/sidebar-23nov/banco/fotos.config.js

   Con `FOTOS_CSS=archivo.css` pinta encima una maqueta (las opciones de la página)
   y con `FOTOS_SOLO=jornada,libre` reduce los momentos. Las fotos van a
   `banco/salida/` (no se suben) y las medidas, a `banco/salida/medidas.json`. */
'use strict';
const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirCajon, fijarViewport } = require('../../../../tests/helpers');

const SALIDA = path.join(__dirname, 'salida', process.env.FOTOS_NOMBRE || 'hoy');
fs.mkdirSync(SALIDA, { recursive: true });
const CSS = process.env.FOTOS_CSS ? fs.readFileSync(path.resolve(process.env.FOTOS_CSS), 'utf8') : '';
const JS = process.env.FOTOS_JS ? fs.readFileSync(path.resolve(process.env.FOTOS_JS), 'utf8') : '';

/* Jueves 26 de noviembre de 2026 a las 12:20: la semana va a medias. */
const DIA = '2026-11-26';
const RELOJ = new Date(DIA + 'T12:20:00+01:00');
const BASE = {
  sidebarCollapsed: false, lastActiveDay: RELOJ.toDateString(), _historyMigrated: true,
  _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
};
const SEMANA = {
  focusMinutes: [150, 100, 0, 75, 0, 0, 0], breathMinutes: [6, 0, 0, 5, 0, 0, 0],
  moveMinutes: [8, 12, 0, 7, 0, 0, 0], waterGlasses: [6, 5, 0, 4, 0, 0, 0],
};
const LOGROS = { 'first.step': { unlockedAt: RELOJ.getTime() - 86400000 }, 'explore.all.extra': { unlockedAt: RELOJ.getTime() - 3600000 } };
const LV = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];

const MOMENTOS = {
  /* El primer día: nada hecho, sin logros, y la home pregunta cómo es tu día. */
  primer: () => Object.assign({}, BASE, { ritmo: undefined, water: { goal: 8, today: 0, lastReset: null } }),
  /* Por libre, semana a medias, con logros. */
  libre: () => Object.assign({}, BASE, { ritmo: { libre: true }, weeklyStats: SEMANA, cycle: 2,
    water: { goal: 8, today: 4, lastReset: null }, streak: { current: 2, longest: 9, lastDay: RELOJ.toDateString() }, achievements: LOGROS }),
  /* El día de jornada servido desde las 9:00, dos pausas hechas. */
  jornada: () => Object.assign({}, BASE, { cycle: 3, weeklyStats: SEMANA,
    ritmo: { semanaTipo: LV, dia: { fecha: DIA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {}, pausa: null, estados: { 1: 'hecha', 2: 'hecha' } } },
    water: { goal: 8, today: 4, lastReset: null }, streak: { current: 2, longest: 9, lastDay: RELOJ.toDateString() }, achievements: LOGROS }),
  /* PACE cerrado (v1), por libre y sin logros. */
  cerrado: () => Object.assign({}, BASE, { ritmo: { libre: true }, weeklyStats: SEMANA,
    water: { goal: 8, today: 2, lastReset: null }, streak: { current: 2, longest: 2, lastDay: RELOJ.toDateString() } }),
};

const PANTALLAS = [
  ['1280x720', 1280, 720], ['1366x768', 1366, 768], ['1536x864', 1536, 864], ['1920x1080', 1920, 1080],
  /* El navegador ampliado: 150 % y 175 % de una pantalla de 1920 × 1080 con su barra. */
  ['1274x579', 1274, 579], ['1092x496', 1092, 496],
  ['360x640', 360, 640],
];

const solo = (process.env.FOTOS_SOLO || '').split(',').filter(Boolean);
const langs = (process.env.FOTOS_LANGS || 'es,en').split(',');
const pals = (process.env.FOTOS_PALS || 'crema,oscuro').split(',');
const vps = (process.env.FOTOS_VPS || '').split(',').filter(Boolean);
const medidas = {};

for (const momento of Object.keys(MOMENTOS)) {
  if (solo.length && !solo.includes(momento)) continue;
  for (const lang of langs) for (const pal of pals) {
    test(momento + ' ' + lang + ' ' + pal, async ({ page, context }) => {
      test.setTimeout(180000);
      if (momento === 'cerrado') {
        await context.addInitScript(() => {
          Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
        });
      }
      await sembrar(context, Object.assign(MOMENTOS[momento](), { lang, palette: pal }));
      await page.clock.install({ time: RELOJ });
      if (CSS) await context.addInitScript((css) => {
        document.addEventListener('DOMContentLoaded', () => {
          const s = document.createElement('style'); s.setAttribute('data-maqueta', ''); s.textContent = css; document.head.appendChild(s);
        });
      }, CSS);
      for (const [nombre, w, h] of PANTALLAS) {
        if (vps.length && !vps.includes(nombre)) continue;
        await page.setViewportSize({ width: w, height: h });
        await irAlArtefacto(page);
        await fijarViewport(page, w, h).catch(() => {});
        if (w <= 640) await abrirCajon(page);
        await page.locator('[data-pace-sidebar]').waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        /* La maqueta que no se puede pintar solo con CSS (un texto nuevo, un botón más):
           se aplica al DOM ya montado y se repite tras un instante por si React repinta. */
        /* Entre las dos pasadas, un `resize`: la escala vuelve a medir con la maqueta puesta. */
        if (JS) {
          await page.evaluate(JS);
          await page.evaluate(() => window.dispatchEvent(new Event('resize')));
          await page.waitForTimeout(300);
          await page.evaluate(JS);
        }
        await page.waitForTimeout(900);
        const m = await page.evaluate(() => {
          const sb = document.querySelector('[data-pace-sidebar]');
          const esc = sb.querySelector('[data-pace-sidebar-escala]');
          const r = sb.getBoundingClientRect();
          const escala = parseFloat(getComputedStyle(esc).getPropertyValue('--sb-escala')) || 1;
          const spacer = sb.querySelector('[data-pace-sidebar-spacer]');
          const desbordan = [...sb.querySelectorAll('span,b,p,button')].filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible').map((el) => el.textContent.trim().slice(0, 40));
          const lineas = {};
          for (const [k, sel] of [['racha', '[data-pace-semana] > span:last-child'], ['accion', '[data-pace-sidebar-accion-boton]'], ['logro', '[data-pace-sidebar-ultimo]'], ['hoy', '[data-pace-hoy]']]) {
            const el = sb.querySelector(sel); if (el) lineas[k] = { alto: Math.round(el.getBoundingClientRect().height), texto: el.innerText.replace(/\s+/g, ' ').slice(0, 90) };
          }
          return {
            ancho: Math.round(r.width), alto: Math.round(r.height), escala,
            escalado: sb.getAttribute('data-escalado'), hueco: spacer ? Math.round(spacer.getBoundingClientRect().height) : null,
            scroll: sb.scrollHeight > sb.clientHeight + 1, desbordan, lineas,
            letraMin: Math.round(9 * escala * 10) / 10,
          };
        });
        medidas[momento + '|' + lang + '|' + pal + '|' + nombre] = m;
        await page.screenshot({ path: path.join(SALIDA, [momento, lang, pal, nombre].join('-') + '.jpg'), type: 'jpeg', quality: 82 });
      }
      const f = path.join(SALIDA, 'medidas-' + [momento, lang, pal].join('-') + '.json');
      fs.writeFileSync(f, JSON.stringify(medidas, null, 1));
    });
  }
}
