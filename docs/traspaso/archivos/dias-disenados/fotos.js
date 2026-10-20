/* PACE · fotos de la app real: los días diseñados (17 oct. 2026)
   ==============================================================
   Uso, con index.html construido en la carpeta que se sirve:
     node docs/traspaso/archivos/dias-disenados/fotos.js <carpeta> <puerto> <etiqueta> [cabecera]

   <carpeta> es la raíz que se sirve (la de main, sacada con `git archive`, o este worktree)
   y se comprueba con X-Pace-Raiz; el service worker va bloqueado para medir esa versión.
   Miércoles 14 de octubre, horario de fábrica (9:00 a 17:00, comida a las 14:00):
     · pausa: «Dos horas» desde las 9:00 con el aro a 25: la ventana de la primera pausa;
     · dia: la jornada con el aro a 25, antes de empezar: «Ver todo» en el móvil y la línea
       del panel en el escritorio;
     · dia10: la jornada con el aro a 10, en el móvil.
   `cabecera`: la opción C, maquetada sobre la app real: la intención del día bajo el título
   del día (no existe en el código; se escribe en la página antes de la foto). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const AQUI = path.resolve(__dirname, '../../../..');
const MODS = [path.join(AQUI, 'node_modules'), path.resolve(AQUI, '../../../node_modules')].find((p) => fs.existsSync(path.join(p, '@playwright')));
const { chromium } = require(path.join(MODS, '@playwright', 'test'));

const RAIZ = path.resolve(process.argv[2] || AQUI);
const PUERTO = Number(process.argv[3] || 8798);
const ETIQUETA = process.argv[4] || 'ahora';
const CABECERA = process.argv[5] === 'cabecera';
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = path.join(__dirname, 'fotos');
const HOY = '2026-10-14';
const NUEVE = new Date(HOY + 'T09:00:00+02:00');
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const estado = (opcion, lang, aro) => ({
  firstSeen: 1, lang, langAuto: false, palette: 'crema', focusMinutes: aro,
  achievements: { 'first.step': 1 },
  profile: { need: 'body', time: 'block', environment: 'home', completedAt: 1 },
  /* el aro a mano: lo que la app guarda al cambiarlo con el día elegido (state-ritmo.jsx) */
  ritmo: { horario: HORARIO, dia: { fecha: HOY, opcion, desde: 540, cicloBase: 0, cambios: {}, pasado: [], primerBloque: aro, bloque: aro } },
});
const VISTAS = [{ n: 'mov', w: 360, h: 718, dpr: 2, movil: true }, { n: 'esc', w: 1280, h: 800, dpr: 1, movil: false }];

async function servidor() {
  const p = spawn(process.execPath, [path.join(RAIZ, '.claude/static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
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
  const archivo = path.join(SALIDA, ETIQUETA + '-' + v.n + '-' + nombre + '.jpg');
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
  await page.getByRole('button', { name: /^(Empezar|Start)/ }).filter({ visible: true }).first().click();
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
/* La opción C: «Miércoles: la espalda» bajo el título del día, con la letra de la línea. */
async function cabecera(page, movil) {
  await page.evaluate((m) => {
    const raiz = m ? document.querySelector('[role="dialog"]') : [...document.querySelectorAll('[data-pace-ritmo-panel]')].find((x) => x.offsetParent);
    const titulo = raiz && [...raiz.querySelectorAll('.pace-rt-titulo, h2, h3')].find((x) => x.offsetParent);
    if (!titulo) return;
    const linea = document.createElement('div');
    linea.textContent = 'Miércoles: la espalda';
    linea.style.cssText = 'font-family:var(--font-serif, serif);font-style:italic;font-size:15px;color:var(--ink-2, #555);margin-top:2px';
    titulo.insertAdjacentElement('afterend', linea);
  }, movil);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = await servidor();
  const browser = await chromium.launch();
  const textos = {};
  try {
    for (const v of VISTAS) {
      for (const lang of v.movil ? ['es', 'en'] : ['es']) {
        const { context, page } = await abrir(browser, v, estado('2h', lang, 25));
        await pausa(page);
        textos[v.n + '-pausa-' + lang] = await page.locator('[data-pace-break-ritmo]').innerText();
        await foto(page, v, 'pausa-' + lang, v.movil ? undefined : await ventana(page));
        await context.close();
      }
      for (const aro of v.movil ? [25, 10] : [25]) {
        const { context, page } = await abrir(browser, v, estado('jornada', 'es', aro));
        const nombre = aro === 25 ? 'dia' : 'dia10';
        if (v.movil) {
          await page.locator('[data-pace-ritmo-ver]').filter({ visible: true }).first().click();
          await page.waitForTimeout(600);
          if (CABECERA) await cabecera(page, true);
          textos[v.n + '-' + nombre] = await page.locator('[role="dialog"]').last().innerText();
          await foto(page, v, nombre);
          /* la tarde: la hoja hace scroll por dentro */
          await page.evaluate(() => {
            const d = [...document.querySelectorAll('[role="dialog"]')].pop();
            [d, ...d.querySelectorAll('*')].filter((x) => x.scrollHeight > x.clientHeight + 10 && getComputedStyle(x).overflowY !== 'visible')
              .forEach((x) => { x.scrollTop = x.scrollHeight; });
          });
          await foto(page, v, nombre + '-tarde');
        } else {
          if (CABECERA) await cabecera(page, false);
          const panel = page.locator('[data-pace-ritmo-panel]').filter({ visible: true }).first();
          textos[v.n + '-' + nombre] = await panel.innerText();
          const caja = await panel.boundingBox();
          const y = Math.max(0, caja.y - 40);
          await foto(page, v, nombre, { x: 280, y, width: 1000, height: Math.min(800 - y, caja.height + 70) });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    srv.kill();
  }
  fs.writeFileSync(path.join(SALIDA, ETIQUETA + '-textos.json'), JSON.stringify(textos, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
