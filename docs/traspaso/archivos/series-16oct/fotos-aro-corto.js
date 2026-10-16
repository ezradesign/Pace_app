/* PACE · fotos de la app real: la pausa corta con el aro corto (16 oct. 2026)
   =========================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/series-16oct/fotos-aro-corto.js [puerto]

   Levanta su propio servidor (8795 por defecto), comprueba con X-Pace-Raiz que sirve
   ESTA carpeta y bloquea el service worker, para que no mida una versión caducada.
   El caso es el de Ez: martes 13 de octubre, «Una hora» desde las 9:00 con el aro a 10.
   Fotos a 360 × 718 (su móvil) y 1280 × 800:
     · aro: el primer bloque de 10 acaba a las 9:10 y no se abre la ventana de la pausa;
       el aro deja listo el bloque 2;
     · linea: la línea del día con tres bloques seguidos antes de la pausa (en el móvil,
       la hoja de «Ver todo»).
   El aviso es del sistema (lo dibuja el móvil o Windows): se guarda su texto en
   aviso.json, sacado de la Notification que la app crea con la pestaña oculta. */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const MODS = [path.join(RAIZ, 'node_modules'), path.resolve(RAIZ, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@playwright')));
const { chromium } = require(path.join(MODS, '@playwright', 'test'));

const PUERTO = Number(process.argv[2] || 8795);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const HOY = '2026-10-13';
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const ESTADO = {
  firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', notifyFocusEnd: true,
  /* «Primer paso» ya ganado: su sello saldría dentro del aro y taparía lo que se mira */
  achievements: { 'first.step': 1 },
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    dia: { fecha: HOY, opcion: '1h', desde: 540, cicloBase: 0, cambios: {} } },
};
const VISTAS = [{ n: 'mov', w: 360, h: 718, dpr: 2, movil: true }, { n: 'esc', w: 1280, h: 800, dpr: 1, movil: false }];

async function servidor() {
  const p = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE + '/index.html', { method: 'HEAD' });
      const marca = decodeURIComponent(r.headers.get('x-pace-raiz') || '');
      if (path.resolve(marca).toLowerCase() !== RAIZ.toLowerCase()) throw new Error('El puerto ' + PUERTO + ' lo sirve otra carpeta: ' + marca);
      return p;
    } catch (e) {
      if (/otra carpeta/.test(e.message)) { p.kill(); throw e; }
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  p.kill();
  throw new Error('El servidor no arrancó en ' + BASE);
}

async function foto(page, v, nombre, clip) {
  await page.waitForTimeout(400);
  const archivo = path.join(SALIDA, v.n + '-' + nombre + '.jpg');
  await page.screenshot({ path: archivo, type: 'jpeg', quality: 74, clip });
  console.log('foto', path.basename(archivo), Math.round(fs.statSync(archivo).size / 1024) + ' KB');
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  const avisos = {};
  try {
    for (const v of VISTAS) {
      const context = await browser.newContext({ baseURL: BASE, viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr,
        isMobile: v.movil, hasTouch: v.movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
      await context.addInitScript((e) => {
        if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
        /* El aviso: una Notification de mentira que guarda lo que la app le pide, y la
           pestaña «oculta» solo cuando la foto lo pide (`__oculta`). */
        window.__avisos = [];
        window.Notification = function (title, o) { window.__avisos.push({ title, body: (o || {}).body }); };
        window.Notification.permission = 'granted';
        window.Notification.requestPermission = () => Promise.resolve('granted');
        Object.defineProperty(document, 'visibilityState', { get: () => (window.__oculta ? 'hidden' : 'visible') });
      }, ESTADO);
      const page = await context.newPage();
      await page.clock.install({ time: NUEVE });
      await page.goto('/index.html');
      await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      /* Ez pone el aro a 10 antes de empezar (como cambiarlo en el dial) */
      await page.evaluate(() => setState({ focusMinutes: 10 }));
      await page.waitForTimeout(250);
      await page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(250);
      for (let i = 0; i < 12; i++) {
        if (i === 9) await page.evaluate(() => { window.__oculta = true; });
        await page.clock.fastForward(60 * 1000);
        await page.waitForTimeout(80);
        if (await page.evaluate(() => (Number(getState().cycle) || 0) >= 1)) break;
      }
      await page.evaluate(() => { window.__oculta = false; });
      await page.waitForTimeout(600);
      const r = await page.evaluate(() => ({ ventana: document.querySelectorAll('[data-pace-break-shortcut]').length,
        aro: getState().focusMinutes, avisos: window.__avisos, plan: ritmoPlan(getState()).m.items.map((it) => it.tipo + ' ' + ritmoHora(it.desde) + ' ' + it.dur) }));
      console.log(v.n, JSON.stringify(r));
      if (r.ventana) throw new Error('se abrió la ventana de la pausa');
      avisos[v.n] = r.avisos;
      await foto(page, v, 'aro');
      /* La otra forma de decirlo: en el aro, en vez de «Ciclo completado», cuándo es la
         pausa (como el aviso). Va puesta encima del DOM: no hay código nuevo en la app. */
      await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) if (n.nodeValue.trim() === 'Ciclo completado') n.nodeValue = 'La pausa, a las 9:30';
      });
      await foto(page, v, 'aro-b');
      await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) if (n.nodeValue.trim() === 'La pausa, a las 9:30') n.nodeValue = 'Ciclo completado';
      });
      if (v.movil) {
        await page.locator('[data-pace-ritmo-ver]').filter({ visible: true }).first().click();
        await page.waitForTimeout(600);
        await foto(page, v, 'linea');
      } else {
        const caja = await page.locator('[data-pace-ritmo-linea]').filter({ visible: true }).first().boundingBox();
        await foto(page, v, 'linea', { x: 0, y: Math.max(0, caja.y - 150), width: v.w, height: Math.min(v.h - Math.max(0, caja.y - 150), caja.height + 300) });
      }
      await context.close();
    }
    fs.writeFileSync(path.join(SALIDA, 'aviso.json'), JSON.stringify(avisos, null, 1));
  } finally {
    await browser.close();
    srv.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
