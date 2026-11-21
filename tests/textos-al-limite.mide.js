/* PACE · tests/textos-al-limite.mide.js — LOS TEXTOS QUE CABEN POR MENOS DE 3 PX (20 nov. 2026)
   ============================================================================================
   NO ES UNA PRUEBA DE LA SUITE: solo mide y apunta, nunca falla por lo que mide. Va con su propia
   configuración, que la suite no recoge:

       npx playwright test -c playwright.mide.config.js

   y deja un JSON por pantalla en `test-results/textos-al-limite/` (o en PACE_TEXTOS_SALIDA). Los
   juntan docs/proposals/textos-al-limite-20nov/junta.js y compara.js. En Linux, con la rama de
   diagnóstico `claude/diag-textos-20nov` (su ci.yml solo mide) y sus artefactos `textos-linux-*`.
   Lo que vigila la suite, los textos acortados con la 7A de Ez, va en textos-al-limite.spec.js.

   POR QUÉ: la 0.212.0 salió roja en el CI de Linux, que pinta la letra como Android. Tres textos
   que en Windows cabían por 1 o 2 px pasaban de línea allí. Y Linux no pinta siempre más ancho: el
   mismo texto baila hasta 7 px entre los dos sistemas, en los dos sentidos.

   QUÉ RECORRE, en castellano y en inglés, con la letra normal y al 115 %:
     · la home del móvil a 360 × 640 y 360 × 718, en los siete momentos de home-sin-scroll.spec.js;
     · Ajustes a 360 × 640 (web y Android) y a 1280 × 720 (avisos sin decidir y bloqueados), con
       su hoja de «Tus datos»;
     · la pausa a 360 × 640 (el modal, que sale por libre);
     · el runner de cada rutina de Mueve y de Estira a 360 × 640, al colocarse y trabajando.
   Cómo se abre cada pantalla: textos-al-limite.helpers.js. Cada texto: textos-al-limite.sonda.js.
   Con menos de 3 px, además, lo que pasa en la pantalla si el texto pasa de línea (`efecto`). */
'use strict';

const fs = require('fs');
const path = require('path');
const { test } = require('@playwright/test');
const { sondaTextos, ponHueco, efectoPantalla } = require('./textos-al-limite.sonda');
const H = require('./textos-al-limite.helpers');
const { irAlArtefacto } = require('./helpers');

test.describe.configure({ timeout: 30 * 60 * 1000 });

const UMBRAL = 3;
const SALIDA = process.env.PACE_TEXTOS_SALIDA || path.join(__dirname, '..', 'test-results', 'textos-al-limite');
const LETRAS = [1, 1.15];

/* Al límite: le sobran menos de 3 px (en una línea, el hueco; en varias, la letra que aguanta). */
const alLimite = (t) => (t.lineas === 1 ? !t.margenMas : !t.porLetraMas) && H.sobra(t) < UMBRAL;
const relayout = () => { window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('pace:home-relayout')); };

/* Mide y, para lo que va al límite, deja puesto lo que lo rompe y apunta qué pasa en la pantalla. */
async function medir(page, opts, home) {
  const r = await page.evaluate(sondaTextos, opts);
  if (r.error) return { error: r.error };
  const justos = r.textos.filter(alLimite);
  for (const t of justos) {
    if (t.margen < 0 || (t.reserva && !opts.efectoReservas)) continue;
    const antes = await page.evaluate(efectoPantalla);
    const puesto = await page.evaluate(ponHueco, { texto: t.texto, px: t.margen + 1.5, letra: t.lineas > 1 ? t.porLetra + 0.02 : 0,
      raices: opts.raices && opts.raices.length ? opts.raices : ['body'] });
    if (!puesto) { t.efecto = { error: 'no encuentro el texto' }; continue; }
    await page.evaluate(relayout);
    await H.asentar(page, home);
    const despues = await page.evaluate(efectoPantalla);
    await page.evaluate(() => {
      if (window.__paceSondaQuita) window.__paceSondaQuita();
      window.__paceSondaQuita = null;
      window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('pace:home-relayout'));
    });
    await H.asentar(page, home);
    t.efecto = { antes, despues };
  }
  return { medidos: r.textos.length,
    todos: r.textos.map((t) => [t.texto.slice(0, 60), t.lineas, t.margenMas ? null : t.margen, t.porLetraMas ? null : t.porLetra, t.letras]),
    justos, cerca: r.textos.filter((t) => !alLimite(t) && t.lineas === 1 && !t.margenMas && t.margen < 6) };
}

function guarda(nombre, datos) {
  fs.mkdirSync(SALIDA, { recursive: true });
  fs.writeFileSync(path.join(SALIDA, nombre.replace(/[^\w.-]+/g, '_') + '.json'), JSON.stringify(datos, null, 1));
}

for (const lang of ['es', 'en']) for (const vp of [{ w: 360, h: 640 }, { w: 360, h: 718 }]) for (const letra of LETRAS) {
  test('home ' + lang + ' ' + vp.w + '×' + vp.h + ' letra ' + letra, async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const filas = [];
    for (const m of H.MOMENTOS) {
      const { context, page, opts } = await H.abreHome(browser, baseURL, Object.assign({ lang, letra, m }, vp));
      filas.push(Object.assign({ momento: m.nombre }, await medir(page, opts, true)));
      await context.close();
    }
    guarda('home-' + lang + '-' + vp.w + 'x' + vp.h + '-' + letra, { pantalla: 'home', lang, vp, letra, filas });
  });
}

const AJUSTES = [
  { w: 360, h: 640, caso: 'web' }, { w: 360, h: 640, caso: 'android' },
  { w: 1280, h: 720, caso: 'avisos sin decidir' }, { w: 1280, h: 720, caso: 'avisos bloqueados' },
];
for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('ajustes ' + lang + ' letra ' + letra, async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const filas = [];
    for (const a of AJUSTES) {
      const { context, page, opts } = await H.abreAjustes(browser, baseURL, Object.assign({ lang, letra }, a));
      filas.push(Object.assign({ momento: a.w + '×' + a.h + ' ' + a.caso }, await medir(page, opts, false)));
      const plegada = page.locator('[data-pace-tweaks-panel] [data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible()) {
        await plegada.click();
        await page.locator('[data-pace-tweaks-panel][data-pace-aj-vista="datos"]').waitFor();
        await H.asentar(page, false);
        filas.push(Object.assign({ momento: a.w + '×' + a.h + ' ' + a.caso + ' · Tus datos' }, await medir(page, opts, false)));
      }
      await context.close();
    }
    guarda('ajustes-' + lang + '-' + letra, { pantalla: 'ajustes', lang, letra, filas });
  });
}

for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('pausa ' + lang + ' letra ' + letra, async ({ browser }) => {
    const { context, page, opts } = await H.abrePausa(browser, test.info().project.use.baseURL, { lang, letra });
    const filas = [Object.assign({ momento: 'la pausa por libre' }, await medir(page, opts, false))];
    await context.close();
    guarda('pausa-' + lang + '-' + letra, { pantalla: 'pausa', lang, letra, filas });
  });
}

/* El runner: al colocarse (la pila lleva todos los textos de la rutina) y, para lo que cambia con la
   fase (el rótulo, la pastilla, «Siguiente»), trabajando. Una rutina que falle se apunta y se sigue. */
async function rutina(browser, baseURL, { lang, letra, id }, filas) {
  const { context, page, opts } = await H.abreRunner(browser, baseURL, { lang, letra, id });
  try {
    const colocarse = Object.assign({ momento: id + ' · al colocarse' }, await medir(page, opts, false));
    filas.push(colocarse);
    for (let k = 0; k < 40; k++) {
      const fase = await page.evaluate(() => {
        const r = [...document.querySelectorAll('[data-pace-v1-raiz]')].find((e) => e.getBoundingClientRect().width > 0);
        return r && r.getAttribute('data-pace-v1-fase');
      });
      if (fase === 'work') break;
      await page.clock.runFor(1000);
      await page.waitForTimeout(15);
    }
    await H.asentar(page, false);
    const trabajo = await medir(page, opts, false);
    const vistos = new Set((colocarse.justos || []).map((t) => t.texto));
    if (trabajo.justos) trabajo.justos = trabajo.justos.filter((t) => !vistos.has(t.texto));
    filas.push(Object.assign({ momento: id + ' · trabajando' }, trabajo));
  } finally {
    await context.close();
  }
}

for (const modulo of ['Mueve', 'Estira']) for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('runner ' + modulo + ' ' + lang + ' letra ' + letra, async ({ browser }) => {
    const baseURL = test.info().project.use.baseURL;
    const context = await H.contexto(browser, baseURL, { w: 360, h: 640, lang });
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-11-18T10:00:00+01:00') });
    await irAlArtefacto(page);
    /* Mueve pinta `extra.*` (MOVE_ROUTINES) y Estira `move.*` (EXTRA_ROUTINES): los ids van cruzados. */
    const ids = await page.evaluate((mod) => {
      const cat = mod === 'Mueve' ? window.MOVE_ROUTINES : window.EXTRA_ROUTINES;
      const out = [];
      for (const g of Object.values(cat || {})) for (const r of (g.items || [])) out.push(r.id);
      return out;
    }, modulo);
    await context.close();
    const filas = [];
    for (const id of ids) {
      try { await rutina(browser, baseURL, { lang, letra, id }, filas); }
      catch (e) { filas.push({ momento: id, error: String(e.message || e).split('\n')[0] }); }
    }
    guarda('runner-' + modulo + '-' + lang + '-' + letra, { pantalla: 'runner ' + modulo, lang, letra, filas });
  });
}
