/* PACE · LAS FOTOS DEL DESPUÉS (contraste, Ez 1B · 2B · 3B, 7 nov. 2026)
 * =======================================================================
 * Uso:
 *   node scripts/audit/contraste-7nov.fotos.js [puerto=8887]
 *
 * Abre el `index.html` compilado a 360 y a 1280 px, en crema y en oscuro, llega a cada caso
 * de la página de Ez y recorta alrededor de la pieza que cambió. Las guarda en
 * docs/audits/accesibilidad-7nov/fotos/<caso>-D-<tema>-<ancho>.webp, junto a las A y B que
 * Ez miró para elegir (la D es «después», lo montado).
 */
'use strict';
const { spawn } = require('child_process');
const path = require('path');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');

const PUERTO = Number(process.argv[2] || 8887);
const BASE = 'http://localhost:' + PUERTO;
const RAIZ = path.resolve(__dirname, '..', '..');
const DESTINO = path.join(RAIZ, 'docs', 'audits', 'accesibilidad-7nov', 'fotos');
const NUEVE = new Date('2026-09-17T09:00:00+02:00');

const vis = (page, sel) => page.locator(sel).filter({ visible: true });
async function boton(page, nombre) {
  await page.getByRole('button', { name: nombre }).filter({ visible: true }).first().click({ timeout: 5000 });
  await page.waitForTimeout(700);
}
async function quieto(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
  await page.waitForTimeout(250);
}

/* Cada caso: cómo se llega, el ancla y el recorte (alto; arriba = cuánto por encima del ancla). */
const CASOS = [
  { id: 'letra-respira', alto: 460, arriba: 40, ir: (p) => boton(p, /^Respira/), ancla: '.pace-lib [data-pace-lib-now]' },
  { id: 'letra-logros', alto: 300, arriba: 24, izquierda: 40, ir: (p) => boton(p, /^Ver logros/), ancla: 'h3:text-is("Maestría")' },
  { id: 'apagado-logros', alto: 400, arriba: 24, izquierda: 40, ir: (p) => boton(p, /^Ver logros/), ancla: 'h3:text-is("Primeros pasos")' },
  { id: 'letra-barra', solo: 1280, ancho: 320, alto: 300, arriba: 60, ancla: '[data-pace-sidebar] [data-pace-hoy-vaso]', barra: true },
  { id: 'apagado-fecha', solo: 1280, ancho: 320, alto: 300, arriba: 115, ancla: '[data-pace-sidebar] [data-pace-hoy-vaso]', barra: true },
  { id: 'boton-pausa', alto: 380, arriba: 120, ir: async (p) => {
    await boton(p, 'Empezar foco');
    const fin = await p.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
    await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
    await p.waitForTimeout(900);
  }, ancla: '.pace-break-plato' },
  { id: 'boton-mueve', alto: 380, abajo: 30, ir: async (p) => {
    await boton(p, /^Mueve/);
    await vis(p, '.pace-lib [data-pace-lib-card] h4 button').first().click();
    await p.waitForTimeout(800);
  }, ancla: '[data-pace-modal-backdrop] [data-pace-cta]' },
  { id: 'boton-agua', alto: 380, abajo: 40, ir: (p) => boton(p, /^Hidrátate/), ancla: '[data-pace-hidr-acciones]' },
];

async function servidor() {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) return srv; } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  srv.kill(); throw new Error('el servidor no arrancó');
}

async function foto(navegador, caso, ancho, tema) {
  const alto = ancho < 768 ? 760 : 800;
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
  await ctx.addInitScript((v) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(v)); },
    { firstSeen: 1, lang: 'es', langAuto: false, palette: tema, soundOn: false, ritmo: { libre: true }, novedadesVistas: '*' });
  const page = await ctx.newPage();
  try {
    await page.clock.install({ time: NUEVE });
    await page.goto(BASE + '/index.html');
    await page.locator('[data-pace-dial-number]').first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(900);
    if (caso.ir) await caso.ir(page);
    await quieto(page);
    const ancla = page.locator(caso.ancla).filter({ visible: true }).first();
    await ancla.scrollIntoViewIfNeeded();
    await quieto(page);
    const caja = await ancla.evaluate((e, barra) => {
      const r = e.getBoundingClientRect();
      const marco = (barra ? e.closest('[data-pace-sidebar]') : e.closest('[data-pace-modal-card], [data-pace-modal-backdrop] > div')) || e;
      const m = marco.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, cx: (m.left + m.right) / 2, left: m.left, aleft: r.left };
    }, !!caso.barra);
    const w = Math.min(caso.ancho || 760, ancho);
    const h = Math.min(caso.alto, alto);
    /* Logros se encuadra desde el título, como las fotos de antes: centrado en el panel cortaba «Maestría». */
    let x = caso.barra ? caja.left : caso.izquierda != null ? caja.aleft - caso.izquierda : Math.round(caja.cx - w / 2);
    x = Math.max(0, Math.min(ancho - w, Math.round(x)));
    let y = caso.abajo != null ? caja.bottom + caso.abajo - h : caja.top - caso.arriba;
    y = Math.max(0, Math.min(alto - h, Math.round(y)));
    const png = await page.screenshot({ clip: { x, y, width: w, height: h } });
    const archivo = path.join(DESTINO, `${caso.id}-D-${tema}-${ancho}.webp`);
    await sharp(png).webp({ quality: 82 }).toFile(archivo);
    return archivo;
  } finally { await ctx.close(); }
}

(async () => {
  const srv = await servidor();
  const navegador = await chromium.launch();
  try {
    for (const ancho of [360, 1280]) for (const tema of ['crema', 'oscuro']) for (const caso of CASOS) {
      if (caso.solo && caso.solo !== ancho) continue;
      if (process.env.SOLO && caso.id !== process.env.SOLO) continue;
      try { console.log(path.basename(await foto(navegador, caso, ancho, tema))); }
      catch (e) { console.log('FALLO', caso.id, ancho, tema, e.message.split('\n')[0]); }
    }
  } finally { await navegador.close(); srv.kill(); }
})().catch((e) => { console.error(e); process.exit(1); });
