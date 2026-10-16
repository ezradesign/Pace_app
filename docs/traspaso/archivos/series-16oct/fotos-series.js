/* PACE · fotos de la app real: las series de «A tu ritmo» (16 oct. 2026)
   ====================================================================
   Uso, desde la raíz del repo y con index.html construido:
     node docs/traspaso/archivos/series-16oct/fotos-series.js [puerto]

   Su propio servidor (8795 por defecto, comprobado con X-Pace-Raiz) y el service worker
   bloqueado, para medir esta versión. Miércoles 14 de octubre, horario de fábrica:
     · pausa: «Dos horas» desde las 9:00; el martes la primera pausa fue Piernas de pie
       (lo servido se guarda en `ritmo.servidos`), así que el miércoles es otra cosa. La
       ventana de las 9:35 con la frase encima del nombre, en castellano y en inglés;
     · linea: la jornada entera antes de empezar: la hoja de «Ver todo» en el móvil y la
       línea del panel en el escritorio. */
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
const HOY = '2026-10-14';
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const estado = (opcion, lang) => ({
  firstSeen: 1, lang, langAuto: false, palette: 'crema', achievements: { 'first.step': 1 },
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  ritmo: { horario: HORARIO, servidos: { '2026-10-13': { 1: ['extra.legs.standing'] } },
    dia: { fecha: HOY, opcion, desde: 540, cicloBase: 0, cambios: {} } },
});
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

async function abrir(browser, v, e) {
  const context = await browser.newContext({ baseURL: BASE, viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dpr,
    isMobile: v.movil, hasTouch: v.movil, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  await context.addInitScript((x) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(x)); }, e);
  const page = await context.newPage();
  await page.clock.install({ time: NUEVE });
  await page.goto('/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return { context, page };
}
async function pausa(page) {
  await page.locator('[data-pace-ritmo-hasta]').filter({ visible: true }).first().waitFor();
  const boton = page.getByRole('button', { name: /^(Empezar jornada|Start the day)$/ }).filter({ visible: true }).first();
  await boton.click();
  for (let i = 0; i < 60 && !(await page.locator('[data-pace-break-shortcut]').count()); i++) {
    await page.clock.fastForward(60 * 1000);
    await page.waitForTimeout(60);
  }
  await page.locator('[data-pace-break-ritmo]').waitFor();
}
async function ventana(page) {
  return page.evaluate(() => {
    let el = document.querySelector('[data-pace-break-ritmo]');
    while (el.parentElement && !el.parentElement.hasAttribute('data-pace-modal-backdrop')) el = el.parentElement;
    const r = el.getBoundingClientRect();
    return { x: Math.max(0, r.x - 40), y: Math.max(0, r.y - 40), width: Math.min(1280, r.width + 80), height: Math.min(800, r.height + 80) };
  });
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  try {
    for (const v of VISTAS) {
      for (const lang of v.movil ? ['es', 'en'] : ['es']) {
        const { context, page } = await abrir(browser, v, estado('2h', lang));
        await pausa(page);
        const texto = await page.locator('[data-pace-break-ritmo]').innerText();
        console.log(v.n, lang, JSON.stringify(texto));
        await foto(page, v, 'pausa-' + lang, v.movil ? undefined : await ventana(page));
        await context.close();
      }
      const { context, page } = await abrir(browser, v, estado('jornada', 'es'));
      if (v.movil) {
        await page.locator('[data-pace-ritmo-ver]').filter({ visible: true }).first().click();
        await page.waitForTimeout(600);
        await foto(page, v, 'dia');
      } else {
        const caja = await page.locator('[data-pace-ritmo-panel]').filter({ visible: true }).first().boundingBox();
        const y = Math.max(0, caja.y - 40);
        await foto(page, v, 'dia', { x: 280, y, width: 1000, height: Math.min(800 - y, caja.height + 70) });
      }
      await context.close();
    }
  } finally {
    await browser.close();
    srv.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
