/* Mide y fotografía los Ajustes del móvil con cada index (sin 6A, 6A pintada, opciones).
   W=<worktree para servir> INDEX='{"nombre":"ruta"}' [PORT=8894] [FOTOS=1] node medir6a.js
   Sale JSON con las medidas en SALIDA (scratchpad) y las fotos webp en base64. */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const W = process.env.W;
const req = require('module').createRequire(path.join(W, 'package.json'));
const { chromium } = req('@playwright/test');
const sharp = req('sharp');

const PUERTO = Number(process.env.PORT || 8894);
const BASE = 'http://localhost:' + PUERTO;
const INDEX = JSON.parse(process.env.INDEX);
const SALIDA = process.env.SALIDA || path.join(__dirname, 'medidas6a.json');
const SEMILLA = { firstSeen: 1, langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*', notifyFocusEnd: true, soundOn: true, voiceOn: true, voice: 'sulafat' };
const ABRIR = { es: 'Abrir ajustes', en: 'Open settings' };

async function caso(nav, html, lang, alto, android, foto) {
  const ctx = await nav.newContext({ viewport: { width: 360, height: alto }, locale: lang === 'es' ? 'es-ES' : 'en-US',
    timezoneId: 'Europe/Madrid', colorScheme: 'light', hasTouch: true, serviceWorkers: 'block' });
  await ctx.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
  await ctx.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [Object.assign({}, SEMILLA, { lang })]);
  const page = await ctx.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  if (android) await page.evaluate(() => {
    window.paceNativoAvisos = () => true; window.pacePlataformaNativa = () => 'android';
    window.paceNativoAvisoPermiso = () => 'granted'; window.paceEsNativo = () => true;
    window.paceAndroidAvisoExacto = () => 'denied'; window.paceAndroidAvisoExactoMirar = () => Promise.resolve('denied');
  });
  await page.locator('button[aria-label="' + ABRIR[lang] + '"]').filter({ visible: true }).first().click();
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  if (process.env.TOCAR_MUSICA === '1') {
    await page.locator('[data-pace-aj-fila="bg"] .pace-aj-pild').nth(2).click();
    await page.waitForTimeout(350);
  }
  const m = await page.evaluate(() => {
    const p = document.querySelector('[data-pace-tweaks-panel]');
    const r = p.getBoundingClientRect();
    const max = parseFloat(getComputedStyle(p).maxHeight) || innerHeight - 56;
    const vis = (sel) => { const e = p.querySelector(sel); return !!(e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'); };
    const fila = (id) => { const e = p.querySelector('[data-pace-aj-fila="' + id + '"]'); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    return { scroll: p.scrollHeight - p.clientHeight, arriba: Math.round(r.top), alto: Math.round(r.height), pantalla: innerHeight,
      sobra: Math.round(max - p.scrollHeight), pct: Math.round(100 * r.height / innerHeight),
      escuchar: vis('[data-pace-aj-escuchar]'), nota: vis('[data-pace-aj-musica-nota]'),
      filaSenal: fila('signal'), filaFondo: fila('bg') };
  });
  m.errores = errores;
  if (foto) {
    const png = await page.screenshot();
    if (process.env.PNGDIR) fs.writeFileSync(path.join(process.env.PNGDIR, foto + '.png'), png);
    m.foto = 'data:image/webp;base64,' + (await sharp(png).resize({ width: 300 }).webp({ quality: 66 }).toBuffer()).toString('base64');
  }
  await ctx.close();
  return m;
}

(async () => {
  const servidor = spawn(process.execPath, [path.join(W, '.claude/static-server.js')], { cwd: W, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const nav = await chromium.launch();
  const out = {};
  try {
    for (const [nombre, ruta] of Object.entries(INDEX)) {
      const html = fs.readFileSync(ruta, 'utf8');
      out[nombre] = {};
      for (const lang of ['es', 'en']) for (const alto of [640, 730, 800]) for (const android of [false, true]) {
        const clave = `${lang}-${alto}-${android ? 'and' : 'web'}`;
        const foto = process.env.FOTOS === '1' && android && alto !== 730 ? nombre + '-' + clave : null;
        out[nombre][clave] = await caso(nav, html, lang, alto, android, foto);
        const m = out[nombre][clave];
        console.log(nombre.padEnd(9), clave.padEnd(12), 'scroll', String(m.scroll).padStart(4), 'sobra', String(m.sobra).padStart(4), 'arriba', m.arriba, m.pct + '%', 'esc', m.escuchar ? 1 : 0, 'nota', m.nota ? 1 : 0, 'filas', m.filaSenal, m.filaFondo, m.errores.length ? 'ERR ' + m.errores.join(' | ') : '');
      }
    }
  } finally {
    await nav.close();
    servidor.kill();
    fs.writeFileSync(SALIDA, JSON.stringify(out));
  }
})();
