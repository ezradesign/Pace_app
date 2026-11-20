/* PACE · tests/textos-al-limite.mide.js — LOS TEXTOS QUE CABEN POR MENOS DE 3 PX (20 nov. 2026)
   ============================================================================================
   NO ES UNA PRUEBA DE LA SUITE: solo mide y apunta, nunca falla por lo que mide. Va con su propia
   configuración, que la suite no recoge:

       npx playwright test -c playwright.mide.config.js

   y deja un JSON por pantalla en `test-results/textos-al-limite/` (o en PACE_TEXTOS_SALIDA). Los
   junta docs/proposals/textos-al-limite-20nov/junta.js.

   POR QUÉ: la 0.212.0 salió roja en el CI de Linux, que pinta la letra igual que Android y un pelo
   más ancha que Windows. Tres textos que en Windows cabían por 1 o 2 px pasaban de línea allí. Las
   pruebas de medidas se escribían midiendo en Windows, así que puede haber más al límite.

   QUÉ RECORRE, en castellano y en inglés, con la letra normal y al 115 % (el WebView de Android
   escala la letra con la del sistema; aquí, ×1,15 el tamaño calculado de cada elemento):
     · la home del móvil a 360 × 640 y 360 × 718, en los siete momentos de home-sin-scroll.spec.js;
     · Ajustes a 360 × 640 (web y Android) y a 1280 × 720 (avisos sin decidir y bloqueados), con
       su hoja de «Tus datos»;
     · la pausa a 360 × 640 (el modal, que sale por libre);
     · el runner de cada rutina de Mueve y de Estira a 360 × 640, al colocarse y trabajando. La pila
       del runner lleva, invisibles, todos los textos de la rutina, así que una vez por rutina basta.
   Para cada texto, tests/textos-al-limite.sonda.js. Con menos de 3 px, además, lo que pasa en la
   pantalla si el texto pasa de línea (`efecto`). */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { asentarGeometria } = require('./home.helpers');
const { sondaTextos, ponHueco, efectoPantalla } = require('./textos-al-limite.sonda');

test.describe.configure({ timeout: 30 * 60 * 1000 });

const UMBRAL = 3;
const SALIDA = process.env.PACE_TEXTOS_SALIDA || path.join(__dirname, '..', 'test-results', 'textos-al-limite');
const FECHA = '2026-10-08';
const hora = (hhmm) => new Date(FECHA + 'T' + hhmm + ':00+02:00');
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const MOMENTOS = [
  { nombre: 'la tarjeta corta', semilla: { ritmo: { libre: true } }, hora: '10:00' },
  { nombre: 'la pregunta', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true },
  { nombre: 'el día servido llegando a las 10:00', semilla: { ritmo: { libre: true } }, hora: '10:00', comienza: true, elige: 'jornada' },
  { nombre: 'el día servido al empezar', semilla: { ritmo: { dia: JORNADA } }, hora: '09:00' },
  { nombre: 'el día ya contestado', semilla: { ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'] } }, hora: '08:30' },
  { nombre: 'la pausa abierta', semilla: { ritmo: { dia: Object.assign({}, JORNADA, { pausa: 1 }) }, cycle: 1,
    lastActiveDay: 'Thu Oct 08 2026', _historyMigrated: true }, hora: '09:50' },
  { nombre: 'el bloque terminado al volver', semilla: { ritmo: { libre: true } }, hora: '10:40', terminoA: '10:35' },
];
const LETRAS = [1, 1.15];
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Un texto está al límite si en una línea le sobran menos de 3 px, o si en varias la separación de
   letra que aguanta, por las letras de una línea, da menos de 3 px. */
function alLimite(t) {
  if (t.lineas === 1) return !t.margenMas && t.margen < UMBRAL;
  return !t.porLetraMas && t.porLetra * (t.letras / t.lineas) < UMBRAL;
}

async function contexto(browser, { w, h, lang, semilla }) {
  const baseURL = test.info().project.use.baseURL;
  const movil = w < 768;
  const context = await browser.newContext({ baseURL, viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil,
    locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid' });
  await sembrar(context, Object.assign({ lang, soundOn: false }, movil ? { sidebarCollapsed: true } : {}, semilla || {}));
  return context;
}

async function agrandar(page, f) {
  if (f === 1) return;
  await page.evaluate((k) => {
    const els = Array.from(document.querySelectorAll('body *'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * k) + 'px', 'important'));
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('pace:home-relayout'));
  }, f);
}

async function asentar(page, home) {
  await page.evaluate(() => document.fonts.ready);
  if (home) await asentarGeometria(page);
  else await page.waitForTimeout(600);
}

/* Mide y, para lo que va al límite, deja puesto el hueco que lo rompe y apunta qué pasa. */
async function medir(page, opts, cfg) {
  const r = await page.evaluate(sondaTextos, opts);
  if (r.error) return { error: r.error };
  const justos = r.textos.filter(alLimite);
  for (const t of justos) {
    if (t.reserva && !opts.efectoReservas) continue;
    const antes = await page.evaluate(efectoPantalla);
    const puesto = await page.evaluate(ponHueco, { texto: t.texto, px: t.margen + 1.5, letra: t.lineas > 1 ? t.porLetra + 0.02 : 0, raices: opts.raices && opts.raices.length ? opts.raices : ['body'] });
    if (!puesto) { t.efecto = { error: 'no encuentro el texto para ponerle el hueco' }; continue; }
    await page.evaluate(() => { window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('pace:home-relayout')); });
    await asentar(page, cfg.home);
    const despues = await page.evaluate(efectoPantalla);
    await page.evaluate(() => {
      if (window.__paceSondaQuita) window.__paceSondaQuita();
      window.__paceSondaQuita = null;
      window.dispatchEvent(new Event('resize')); window.dispatchEvent(new Event('pace:home-relayout'));
    });
    await asentar(page, cfg.home);
    t.efecto = { antes, despues };
  }
  return { medidos: r.textos.length,
    todos: r.textos.map((t) => [t.texto.slice(0, 60), t.lineas, t.margenMas ? null : t.margen, t.porLetraMas ? null : t.porLetra]), justos, cerca: r.textos.filter((t) => !alLimite(t) && t.lineas === 1 && !t.margenMas && t.margen < 6) };
}

function guarda(nombre, datos) {
  fs.mkdirSync(SALIDA, { recursive: true });
  fs.writeFileSync(path.join(SALIDA, nombre.replace(/[^\w.-]+/g, '_') + '.json'), JSON.stringify(datos, null, 1));
}

/* ── La home del móvil ─────────────────────────────────────────────────────────────────────── */
for (const lang of ['es', 'en']) for (const vp of [{ w: 360, h: 640 }, { w: 360, h: 718 }]) for (const letra of LETRAS) {
  test('home ' + lang + ' ' + vp.w + '×' + vp.h + ' letra ' + letra, async ({ browser }) => {
    const filas = [];
    for (const m of MOMENTOS) {
      const context = await contexto(browser, Object.assign({ lang, semilla: m.semilla }, vp));
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
        await expect(async () => {
          await page.keyboard.press('Escape');
          await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(0, { timeout: 1000 });
        }).toPass();
      }
      await page.mouse.move(1, 1);
      await agrandar(page, letra);
      await asentar(page, true);
      filas.push(Object.assign({ momento: m.nombre }, await medir(page, { raices: ['body'], soloPantalla: true }, { home: true })));
      await context.close();
    }
    guarda('home-' + lang + '-' + vp.w + 'x' + vp.h + '-' + letra, { pantalla: 'home', lang, vp, letra, filas });
  });
}

/* ── Ajustes ───────────────────────────────────────────────────────────────────────────────── */
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };
const AJUSTES = [
  { w: 360, h: 640, caso: 'web' }, { w: 360, h: 640, caso: 'android' },
  { w: 1280, h: 720, caso: 'avisos sin decidir' }, { w: 1280, h: 720, caso: 'avisos bloqueados' },
];
for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('ajustes ' + lang + ' letra ' + letra, async ({ browser }) => {
    const filas = [];
    for (const a of AJUSTES) {
      const context = await contexto(browser, { w: a.w, h: a.h, lang, semilla: { notifyFocusEnd: true } });
      if (a.caso === 'avisos sin decidir') await context.addInitScript(() => {
        try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
      });
      const page = await context.newPage();
      await page.clock.install({ time: hora('12:00') });
      await irAlArtefacto(page);
      if (a.caso === 'android') await page.evaluate(() => {
        window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
        window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
        window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
      });
      await vis(page, 'button[aria-label="' + ABRIR[lang] + '"]').first().click();
      await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
      await page.waitForTimeout(450);
      await agrandar(page, letra);
      await asentar(page, false);
      const opts = { raices: ['[data-pace-tweaks-panel]'] };
      filas.push(Object.assign({ momento: a.w + '×' + a.h + ' ' + a.caso }, await medir(page, opts, {})));
      const plegada = page.locator('[data-pace-tweaks-panel] [data-pace-aj-plegada] .pace-aj-sec-accion');
      if (await plegada.isVisible()) {
        await plegada.click();
        await page.locator('[data-pace-tweaks-panel][data-pace-aj-vista="datos"]').waitFor();
        await asentar(page, false);
        filas.push(Object.assign({ momento: a.w + '×' + a.h + ' ' + a.caso + ' · Tus datos' }, await medir(page, opts, {})));
      }
      await context.close();
    }
    guarda('ajustes-' + lang + '-' + letra, { pantalla: 'ajustes', lang, letra, filas });
  });
}

/* ── La pausa ──────────────────────────────────────────────────────────────────────────────── */
for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('pausa ' + lang + ' letra ' + letra, async ({ browser }) => {
    const filas = [];
    /* En un día servido, el bloque que termina con PACE cerrado no abre el modal: la pausa se queda en
       la tarjeta de la home («la pausa abierta», arriba). */
    for (const p of [{ nombre: 'por libre', semilla: { ritmo: { libre: true } } }]) {
      const context = await contexto(browser, { w: 360, h: 640, lang, semilla: p.semilla });
      await context.addInitScript((fin) => {
        if (!localStorage.getItem('pace.timer.v1')) localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: fin, mode: 'foco', minutes: 25, id: 'vuelta' }));
      }, hora('10:35').getTime());
      const page = await context.newPage();
      await page.clock.install({ time: hora('10:40') });
      await irAlArtefacto(page);
      await expect(page.locator('[data-pace-break-shortcut]')).toHaveCount(1);
      await page.waitForTimeout(700);
      await agrandar(page, letra);
      await asentar(page, false);
      filas.push(Object.assign({ momento: 'la pausa ' + p.nombre }, await medir(page, { subeDesde: '[data-pace-break-shortcut]', raices: [] }, {})));
      await context.close();
    }
    guarda('pausa-' + lang + '-' + letra, { pantalla: 'pausa', lang, letra, filas });
  });
}

/* ── El runner de Mueve y de Estira ────────────────────────────────────────────────────────── */
for (const modulo of ['Mueve', 'Estira']) for (const lang of ['es', 'en']) for (const letra of LETRAS) {
  test('runner ' + modulo + ' ' + lang + ' letra ' + letra, async ({ browser }) => {
    const context = await contexto(browser, { w: 360, h: 640, lang });
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
    await page.close();
    const filas = [];
    const raiz = { raices: ['[data-pace-session-root]'], efectoReservas: true };
    for (const id of ids) {
      /* Un contexto limpio por rutina: con el de la anterior, la sesión a medias que guarda el runner
         (MoveSessionV1.reanudar.jsx) no dejaba abrir la siguiente. Una rutina que falle se apunta y se sigue. */
      const ctx = await contexto(browser, { w: 360, h: 640, lang });
      const pg = await ctx.newPage();
      try {
        await pg.clock.install({ time: new Date('2026-11-18T10:00:00+01:00') });
        await irAlArtefacto(pg);
        await rutina(pg, id, filas, raiz);
      } catch (e) {
        filas.push({ momento: id, error: String(e.message || e).split('\n')[0] });
      }
      await ctx.close();
    }
    guarda('runner-' + modulo + '-' + lang + '-' + letra, { pantalla: 'runner ' + modulo, lang, letra, filas });
    await context.close();
  });

  async function rutina(page, id, filas, raiz) {
    await page.evaluate((x) => {
      const r = window.resolveBodyRoutine(x);
      window.dispatchEvent(new CustomEvent('pace:hacerla', { detail: { routine: r.routine, kind: r.source } }));
    }, id);
    await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
    const ahora = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(ahora + 1000);
    await agrandar(page, letra);
    await asentar(page, false);
    filas.push(Object.assign({ momento: id + ' · al colocarse' }, await medir(page, raiz, {})));
    for (let k = 0; k < 40; k++) {
      const fase = await page.evaluate(() => {
        const r = [...document.querySelectorAll('[data-pace-v1-raiz]')].find((e) => e.getBoundingClientRect().width > 0);
        return r && r.getAttribute('data-pace-v1-fase');
      });
      if (fase === 'work') break;
      await page.clock.runFor(1000);
      await page.waitForTimeout(15);
    }
    await asentar(page, false);
    const trabajo = await medir(page, raiz, {});
    /* Trabajando, solo lo que no estaba ya al colocarse (la pila no cambia). */
    const vistos = new Set(filas[filas.length - 1].justos ? filas[filas.length - 1].justos.map((t) => t.texto) : []);
    if (trabajo.justos) trabajo.justos = trabajo.justos.filter((t) => !vistos.has(t.texto));
    filas.push(Object.assign({ momento: id + ' · trabajando' }, trabajo));
  }
}
