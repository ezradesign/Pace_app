/* Banco 1 · un móvil normal: CPU 4× más lenta (CDP) y «Slow 4G» (562,5 ms y 180 KB/s, los números de
   DevTools) frenada en el servidor de banco, que así vale también para lo que pide el service worker.
   Uso: node movil.js [puerto] [carpeta-de-salida] */
'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
const fs = require('fs'), path = require('path');
const PUERTO = Number(process.argv[2] || 8910);
const BASE = 'http://localhost:' + PUERTO;
const SALIDA = process.argv[3] || path.join(__dirname, 'salida');
fs.mkdirSync(SALIDA, { recursive: true });
const get = (u) => fetch(BASE + u).then((r) => r.text());

const INSTRUMENTO = () => {
  const m = (window.__m = { lt: [], paint: {}, lcp: 0, app: 0 });
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => m.lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { m.paint[e.name] = Math.round(e.startTime); })).observe({ type: 'paint', buffered: true }); } catch (e) {}
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => { m.lcp = Math.round(e.startTime); m.lcpEl = (e.element && (e.element.tagName + '.' + [...e.element.attributes].map((a) => a.name).filter((n) => n.startsWith('data-')).join('.'))) || ''; })).observe({ type: 'largest-contentful-paint', buffered: true }); } catch (e) {}
  new MutationObserver(() => {
    if (!m.app && document.querySelector('[data-pace-dial-number], [data-pace-onb-comenzar]')) m.app = Math.round(performance.now());
  }).observe(document, { childList: true, subtree: true });
};

function resumen(m, nav) {
  const fcp = m.paint['first-contentful-paint'] || 0;
  // «Se puede tocar»: el final de la última tarea larga a la que siguen 5 s sin ninguna (como el TTI de Lighthouse).
  const lt = m.lt.filter((t) => t[0] + t[1] >= fcp).sort((a, b) => a[0] - b[0]);
  let tti = Math.max(fcp, m.app || 0);
  for (let i = 0; i < lt.length; i++) {
    const fin = lt[i][0] + lt[i][1];
    const sig = lt[i + 1];
    if (fin >= tti) tti = fin;
    if (!sig || sig[0] - fin >= 5000) { if (fin >= tti) tti = fin; if (fin >= (m.app || 0)) break; }
  }
  const tbt = lt.filter((t) => t[0] < tti).reduce((s, t) => s + Math.max(0, t[1] - 50), 0);
  return {
    htmlPrimerByte: Math.round(nav.responseStart), htmlEntero: Math.round(nav.responseEnd), domListo: Math.round(nav.domContentLoadedEventEnd),
    primeraPintura: fcp, mayorPintura: m.lcp, elementoMayor: m.lcpEl, appMontada: m.app, sePuedeTocar: Math.round(tti), bloqueoTotal: Math.round(tbt),
    tareasLargas: lt.length, tareaMasLarga: lt.reduce((x, t) => Math.max(x, t[1]), 0),
  };
}

async function abrir(context, conTraza, nombre) {
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await get('/__log');
  await get('/__red?lat=562&bps=180000');
  if (conTraza) await context.browser().startTracing(page, { categories: ['devtools.timeline', 'v8.execute', 'disabled-by-default-devtools.timeline', 'blink.user_timing', 'loading'] });
  const t0 = Date.now();
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__m && window.__m.app > 0, null, { timeout: 120000 });
  await page.waitForTimeout(9000);
  let traza = null;
  if (conTraza) { traza = await context.browser().stopTracing(); fs.writeFileSync(path.join(SALIDA, nombre + '.trace.json'), traza); }
  await get('/__red?lat=0&bps=0');
  const m = await page.evaluate(() => window.__m);
  const nav = await page.evaluate(() => performance.getEntriesByType('navigation')[0].toJSON());
  const log = JSON.parse(await get('/__log'));
  const r = resumen(m, nav);
  r.bytes = log.reduce((s, l) => s + (l[3] || 0), 0); r.peticiones = log.length;
  r.porRed = log.map((l) => l[1] + ' ' + l[2] + ' ' + (l[3] || '')).slice(0, 40);
  r.controlada = await page.evaluate(() => !!navigator.serviceWorker.controller);
  r.relojTotal = Date.now() - t0;
  return { page, cdp, r };
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  // 1 · primera vez, sin nada guardado: la bienvenida
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
    await context.addInitScript(INSTRUMENTO);
    const { page, r } = await abrir(context, true, 'primera');
    out.primeraVez = r;
    // ¿Se instala el service worker y cuánto baja el precache?
    await page.waitForFunction(() => navigator.serviceWorker.ready.then(() => true), null, { timeout: 120000 });
    await page.waitForTimeout(3000);
    out.precache = { peticiones: JSON.parse(await get('/__log')).length };
    await page.close();
    // 2 · vuelve con el service worker y con estado (la home)
    await context.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
    const v = await abrir(context, true, 'vuelta');
    out.vueltaConSW = v.r;
    // 3 · Respira y el aro, a CPU 4×: fotogramas
    const p = v.page;
    await p.evaluate(() => { localStorage.setItem('pace.state.v2', JSON.stringify(Object.assign(JSON.parse(localStorage.getItem('pace.state.v2')), {}))); });
    const fotogramas = async (ms) => p.evaluate((ms) => new Promise((res) => {
      const d = []; let ult = performance.now(); const fin = ult + ms;
      const lt0 = window.__m.lt.length;
      const f = (t) => { d.push(t - ult); ult = t; if (t < fin) requestAnimationFrame(f); else res({ fotogramas: d.length, media: Math.round(d.reduce((a, b) => a + b, 0) / d.length * 10) / 10, mas33: d.filter((x) => x > 33.4).length, mas50: d.filter((x) => x > 50).length, peor: Math.round(Math.max(...d)), tareasLargas: window.__m.lt.slice(lt0).map((t) => t[1]) }); };
      requestAnimationFrame(f);
    }), ms);
    out.homeQuieta = await fotogramas(5000);
    try {
      await p.getByRole('button', { name: /^Respira/ }).first().click();
      await p.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
      await p.waitForTimeout(1500);
      const empezar = p.locator('[data-pace-breathe-start], button:has-text("Empezar"), button:has-text("Comenzar")').filter({ visible: true }).first();
      if (await empezar.count()) await empezar.click().catch(() => {});
      await p.waitForTimeout(1500);
      out.respira = await fotogramas(10000);
      out.respira.fase = await p.locator('[data-pace-breathe-phase]').getAttribute('data-pace-breathe-phase').catch(() => null);
    } catch (e) { out.respira = { error: String(e).slice(0, 200) }; }
    await p.close();
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(SALIDA, 'movil.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, (k, v) => (k === 'porRed' ? v.length : v), 1));
})().catch((e) => { console.error(e); process.exit(1); });
