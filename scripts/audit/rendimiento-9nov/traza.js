/* Lee una traza de Chromium y dice en qué se va el hilo principal de la página.
   Uso: node traza.js archivo.trace.json [desde_ms] [hasta_ms]  (ms relativos al primer evento del hilo) */
'use strict';
const fs = require('fs');
const t = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ev = t.traceEvents || t;
const hilos = {};
for (const e of ev) if (e.ph === 'M' && e.name === 'thread_name' && e.args.name === 'CrRendererMain') hilos[e.pid + ':' + e.tid] = 0;
for (const e of ev) { const k = e.pid + ':' + e.tid; if (k in hilos && e.ph === 'X') hilos[k] += e.dur || 0; }
const principal = Object.entries(hilos).sort((a, b) => b[1] - a[1])[0][0];
let xs = ev.filter((e) => e.pid + ':' + e.tid === principal && e.ph === 'X' && e.dur > 0).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
const t0 = xs[0].ts;
const desde = Number(process.argv[3] || 0) * 1000, hasta = Number(process.argv[4] || 1e12) * 1000;
xs = xs.filter((e) => e.ts - t0 >= desde && e.ts - t0 <= hasta);
// tiempo propio por nombre (con pila)
const propio = {}, pila = [];
const nombre = (e) => e.name === 'EvaluateScript' ? 'EvaluateScript' : e.name;
for (const e of xs) {
  while (pila.length && pila[pila.length - 1].ts + pila[pila.length - 1].dur <= e.ts) pila.pop();
  if (pila.length) { const p = pila[pila.length - 1]; propio[nombre(p)] = (propio[nombre(p)] || 0) - Math.min(e.dur, p.ts + p.dur - e.ts); }
  propio[nombre(e)] = (propio[nombre(e)] || 0) + e.dur;
  pila.push(e);
}
const top = Object.entries(propio).filter(([k]) => k !== 'RunTask' && k !== 'ThreadControllerImpl::RunTask').sort((a, b) => b[1] - a[1]).slice(0, 18);
const tareas = xs.filter((e) => e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask');
const largas = tareas.filter((e) => e.dur > 50000);
console.log('hilo', principal, 'tramo', Math.round((xs[xs.length - 1].ts - xs[0].ts) / 1000), 'ms; ocupado', Math.round(tareas.reduce((s, e) => s + e.dur, 0) / 1000), 'ms; tareas >50 ms:', largas.length);
for (const [k, v] of top) console.log(String(Math.round(v / 1000)).padStart(7), 'ms ', k);
// qué hay dentro de cada tarea larga (los hijos de más peso)
for (const l of largas.slice(0, 6)) {
  const hijos = {};
  for (const e of xs) if (e.ts >= l.ts && e.ts + e.dur <= l.ts + l.dur && e !== l && e.name !== 'RunTask') hijos[e.name] = (hijos[e.name] || 0) + e.dur;
  console.log('  larga @' + Math.round((l.ts - t0) / 1000) + ' ms, ' + Math.round(l.dur / 1000) + ' ms:', Object.entries(hijos).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => k + ' ' + Math.round(v / 1000)).join(' · '));
}
if (process.argv[5] === 'scripts') {
  // EvaluateScript por línea: qué bloque de <script> pesa más al arrancar
  const html = fs.readFileSync(process.argv[6], 'utf8');
  const re = /<script([^>]*)>/g; const inicios = []; let m;
  while ((m = re.exec(html))) { const linea = html.slice(0, m.index).split('\n').length; const cuerpo = html.slice(m.index, m.index + 400); inicios.push({ linea, txt: cuerpo.replace(/\s+/g, ' ').slice(8, 140) }); }
  const porBloque = {};
  for (const e of xs) if (e.name === 'EvaluateScript' && e.args && e.args.data && e.args.data.lineNumber) {
    const ln = e.args.data.lineNumber; let b = inicios[0]; for (const i of inicios) if (i.linea <= ln) b = i;
    porBloque[b.linea] = porBloque[b.linea] || { ms: 0, txt: b.txt }; porBloque[b.linea].ms += e.dur / 1000;
  }
  const lista = Object.values(porBloque).sort((a, b) => b.ms - a.ms);
  console.log('scripts:', lista.length, 'total', Math.round(lista.reduce((s, x) => s + x.ms, 0)), 'ms');
  for (const x of lista.slice(0, 12)) console.log(String(Math.round(x.ms)).padStart(6), 'ms ', x.txt);
}
