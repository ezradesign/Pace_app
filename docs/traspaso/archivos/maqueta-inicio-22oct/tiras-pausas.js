// Las tiras de la pregunta 4 («cómo queda el día») y la tabla de qué parte del tiempo es pausa,
// con el motor real del día (ritmoComponer). «A mi ritmo» es el motor tal cual; «Después de cada
// bloque», el mismo con su tope de 30 min seguidos a 0. Escribe el HTML de las tiras en la salida.
// Uso: node tiras-pausas.js <worktree> <archivo-html-de-salida>   (con la app servida en 8803)
'use strict';
const path = require('path');
const fs = require('fs');
const WT = process.argv[2];
const { chromium } = require(path.join(WT, 'node_modules', 'playwright'));
const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const VENTANA = 120;   /* las dos primeras horas de la jornada */

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext();
  await ctx.addInitScript((st) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(st)); },
    { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { horario: H, libre: true } });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-22T09:00:00+02:00') });
  await page.goto('http://localhost:8803/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  const filas = await page.evaluate((H) => {
    const src = ritmoComponer.toString();
    if (!/JUNTOS = 30/.test(src)) throw new Error('el motor ya no tiene JUNTOS = 30');
    const cadaBloque = (0, eval)('(' + src.replace('JUNTOS = 30', 'JUNTOS = 0') + ')');
    const pozos = ritmoPozos(getState(), '2026-10-22');
    const out = [];
    for (const aro of [5, 10, 15, 25, 45]) for (const modo of ['ritmo', 'cada']) {
      if (aro > 15 && modo === 'cada') continue;
      const prev = { bloques: 0, pausas: 0, foco: 0, usados: [], vasos: 0, claves: 0, primerBloque: aro, bloque: aro };
      const m = (modo === 'ritmo' ? ritmoComponer : cadaBloque)('jornada', Object.assign({}, H, { ahora: 540 }), pozos, {}, 8, prev);
      let foco = 0, pausa = 0, guiadas = 0, inv = 0, seguido = 0, invYa = false;
      const tramos = [];
      m.items.forEach((it, i) => {
        if (it.tipo === 'foco') {
          foco += it.dur; seguido += it.dur; tramos.push({ t: 'f', d: it.dur });
          const sig = m.items[i + 1];
          /* la invitación: al acabar el bloque que llega a 15-20 min seguidos, si detrás va otro bloque */
          if (modo === 'ritmo' && !invYa && seguido >= 15 && sig && sig.tipo === 'foco') { inv++; invYa = true; tramos.push({ t: 'i', d: 2 }); }
        } else if (it.tipo === 'pausa') {
          pausa += it.dur; guiadas++; seguido = 0; invYa = false; tramos.push({ t: it.larga ? 'L' : 'p', d: it.dur });
        } else { seguido = 0; invYa = false; tramos.push({ t: it.tipo, d: it.dur }); }
      });
      out.push({ aro, modo, foco, pausa, guiadas, inv, tramos });
    }
    return out;
  }, H);
  await b.close();

  const hm = (min) => Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) : '');
  const pct = (a, b2) => Math.round(100 * a / b2) + ' %';
  /* la tabla, por consola */
  for (const f of filas) {
    console.log(JSON.stringify({ aro: f.aro, modo: f.modo, foco: hm(f.foco), pausa: pct(f.pausa, f.foco + f.pausa),
      conInv: pct(f.pausa + 2 * f.inv, f.foco + f.pausa + 2 * f.inv), guiadas: f.guiadas, inv: f.inv }));
  }
  /* las tiras: las dos primeras horas, con la invitación hecha (2 min) */
  const tira = (f) => {
    let t = 0; const seg = [];
    for (const x of f.tramos) {
      if (t >= VENTANA) break;
      const d = Math.min(x.d, VENTANA - t);
      const clase = { f: 'tf', i: 'ti', p: 'tp', L: 'tl' }[x.t] || 'to';
      const txt = x.t === 'f' && d >= 10 ? d : x.t === 'L' ? '15' : x.t === 'p' && f.aro >= 10 ? '5' : '';
      seg.push('<i class="' + clase + '" style="flex:' + d + '">' + txt + '</i>');
      t += d;
    }
    return '<div class="tira">' + seg.join('') + '</div>';
  };
  const html = [];
  for (const aro of [5, 10, 15]) {
    const r = filas.find((f) => f.aro === aro && f.modo === 'ritmo'), c = filas.find((f) => f.aro === aro && f.modo === 'cada');
    html.push('<div class="tiras-aro"><div class="meta">Bloques de ' + aro + ' min</div>'
      + '<div class="tira-fila"><span>A mi ritmo</span>' + tira(r) + '</div>'
      + '<div class="tira-fila"><span>Después de cada bloque</span>' + tira(c) + '</div></div>');
  }
  fs.writeFileSync(process.argv[3], html.join('\n') + '\n');
})();
