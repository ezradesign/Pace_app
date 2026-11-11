/* Banco 2 · un día entero con PACE abierto (page.clock, 8:55 → 18:05), a 1280×720.
   A ratos a la vista y a ratos de fondo, y el portátil cerrado de 14:00 a 15:00 (salto del reloj).
   Cada media hora: memoria tras recoger basura, nodos, escuchas, temporizadores vivos, escrituras en
   localStorage e IndexedDB, y cambios del DOM con la pestaña de fondo.
   Uso: node dia.js [puerto] [salida.json] */
'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
const fs = require('fs');
const PUERTO = Number(process.argv[2] || 8910);
const SALIDA = process.argv[3] || 'salida/dia.json';

const CONTADORES = () => {
  const c = (window.__c = { iv: new Map(), to: new Map(), raf: 0, rafVivos: new Set(), cb: {}, ls: {}, idb: 0, mut: 0, mutOculta: 0, esc: 0 });
  let oculta = false;
  window.__ponOculta = (v) => {
    oculta = v;
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'hidden' : 'visible') });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => v });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event(v ? 'blur' : 'focus'));
  };
  const origen = (fn) => { try { return String(fn).replace(/\s+/g, ' ').slice(0, 70); } catch (e) { return '?'; } };
  const sI = window.setInterval, cI = window.clearInterval, sT = window.setTimeout, cT = window.clearTimeout, rAF = window.requestAnimationFrame, cAF = window.cancelAnimationFrame;
  const cuenta = (k) => { c.cb[k] = (c.cb[k] || 0) + 1; };
  window.setInterval = function (fn, ms, ...a) {
    const k = 'iv' + ms + ' ' + origen(fn);
    const id = sI.call(this, function () { cuenta(k); if (oculta) cuenta('(oculta) ' + k); return typeof fn === 'function' ? fn.apply(this, arguments) : undefined; }, ms, ...a);
    c.iv.set(id, k); return id;
  };
  window.clearInterval = function (id) { c.iv.delete(id); return cI.call(this, id); };
  window.setTimeout = function (fn, ms, ...a) {
    const k = 'to' + (ms | 0);
    const id = sT.call(this, function () { c.to.delete(id); if (oculta) cuenta('(oculta) ' + k + ' ' + origen(fn)); return typeof fn === 'function' ? fn.apply(this, arguments) : undefined; }, ms, ...a);
    c.to.set(id, k + ' ' + origen(fn)); return id;
  };
  window.clearTimeout = function (id) { c.to.delete(id); return cT.call(this, id); };
  window.requestAnimationFrame = function (fn) { c.raf++; if (oculta) cuenta('(oculta) raf ' + origen(fn)); const id = rAF.call(this, (t) => { c.rafVivos.delete(id); fn(t); }); c.rafVivos.add(id); return id; };
  window.cancelAnimationFrame = function (id) { c.rafVivos.delete(id); return cAF.call(this, id); };
  const sIt = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { const kk = (oculta ? '(oculta) ' : '') + k; c.ls[kk] = (c.ls[kk] || 0) + 1; return sIt.call(this, k, v); };
  for (const m of ['put', 'add']) { const o = IDBObjectStore.prototype[m]; IDBObjectStore.prototype[m] = function () { c.idb++; return o.apply(this, arguments); }; }
  const aEL = EventTarget.prototype.addEventListener, rEL = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (t) { if (this === window || this === document) c.esc++; return aEL.apply(this, arguments); };
  EventTarget.prototype.removeEventListener = function (t) { if (this === window || this === document) c.esc--; return rEL.apply(this, arguments); };
  const arranca = () => new MutationObserver((l) => { c.mut += l.length; if (oculta) c.mutOculta += l.length; }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
  if (document.documentElement) arranca(); else document.addEventListener('DOMContentLoaded', arranca);
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errores = []; page.on('pageerror', (e) => errores.push(e.message));
  await page.clock.install({ time: new Date('2026-11-10T08:55:00+01:00') });
  await context.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
  await context.addInitScript(CONTADORES);
  await page.goto('http://localhost:' + PUERTO + '/');
  await page.locator('[data-pace-dial-number]').waitFor();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const filas = [];
  let prev = null;
  const medir = async (etiqueta) => {
    await cdp.send('HeapProfiler.collectGarbage');
    const heap = await cdp.send('Runtime.getHeapUsage');
    const met = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
    const c = await page.evaluate(() => { const c = window.__c; return { iv: [...c.iv.values()], to: c.to.size, toLista: [...c.to.values()], raf: c.raf, rafVivos: c.rafVivos.size, cb: c.cb, ls: c.ls, idb: c.idb, mut: c.mut, mutOculta: c.mutOculta, esc: c.esc, hora: new Date().toTimeString().slice(0, 5), oculta: document.hidden }; });
    const d = (k, x) => (prev ? x - prev[k] : 0);
    const lsTot = Object.values(c.ls).reduce((a, b) => a + b, 0);
    const fila = { etiqueta, hora: c.hora, oculta: c.oculta, heapMB: +(heap.usedSize / 1048576).toFixed(2), nodos: met.Nodes, escuchasJS: met.JSEventListeners, escuchasVentana: c.esc,
      intervalos: c.iv.length, timeouts: c.to, rafVivos: c.rafVivos, rafPedidos: d('raf', c.raf), escriturasLS: d('lsTot', lsTot), escriturasIDB: d('idb', c.idb), mutaciones: d('mut', c.mut), mutacionesOculta: d('mutOculta', c.mutOculta),
      layouts: d('layouts', met.LayoutCount), estilos: d('estilos', met.RecalcStyleCount) };
    filas.push(fila);
    prev = { raf: c.raf, lsTot, idb: c.idb, mut: c.mut, mutOculta: c.mutOculta, layouts: met.LayoutCount, estilos: met.RecalcStyleCount };
    prev.c = c;
    console.log(JSON.stringify(fila));
  };
  const empezarFoco = async () => {
    const b = page.getByRole('button', { name: 'Empezar foco', exact: true });
    if (await b.count() && await b.first().isVisible()) { await b.first().click(); return true; }
    return false;
  };
  const correr = async (min) => { for (let i = 0; i < min; i += 5) await page.clock.runFor(5 * 60 * 1000); };
  await correr(5); // 9:00
  await medir('9:00 inicio');
  // El plan del día: [hora, a la vista?, ¿empieza un Foco?]
  const plan = [];
  for (let h = 9; h < 18; h++) for (const m of [0, 30]) plan.push({ h, m, oculta: (h === 11 || h === 16 || (h === 12 && m === 30)), foco: m === 0 && h !== 14 });
  for (const paso of plan) {
    if (paso.h === 14 && paso.m === 0) {
      // Portátil cerrado una hora: nada corre y luego todo salta de golpe.
      await page.evaluate(() => window.__ponOculta(true));
      await page.clock.fastForward('01:00:00');
      await page.evaluate(() => window.__ponOculta(false));
      await page.clock.runFor(1000);
      await medir('15:00 al abrir el portátil');
      continue;
    }
    if (paso.h === 14) continue;
    await page.evaluate((o) => window.__ponOculta(o), paso.oculta);
    if (paso.foco && !paso.oculta) await empezarFoco();
    await correr(30);
    await medir(paso.h + ':' + String(paso.m + 30).padStart(2, '0').replace('60', '00') + (paso.oculta ? ' (de fondo)' : ''));
  }
  await page.evaluate(() => window.__ponOculta(false));
  const fin = prev.c;
  fs.writeFileSync(SALIDA, JSON.stringify({ filas, intervalosVivos: fin.iv, timeoutsVivos: fin.toLista, callbacks: Object.entries(fin.cb).sort((a, b) => b[1] - a[1]).slice(0, 40), escriturasLS: fin.ls, errores }, null, 1));
  console.log('callbacks:', JSON.stringify(Object.entries(fin.cb).sort((a, b) => b[1] - a[1]).slice(0, 25), null, 0));
  console.log('ls:', JSON.stringify(fin.ls));
  console.log('intervalos vivos:', JSON.stringify(fin.iv));
  console.log('errores:', errores.slice(0, 5));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
