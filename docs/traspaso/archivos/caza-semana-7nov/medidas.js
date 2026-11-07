/* Caza de la semana (7 nov. 2026): las pantallas de la semana en castellano y en inglés, a 360 y a
   1280 px, medidas igual que en el recorrido (scroll, cortados, solapes y, en inglés, lo que queda sin
   traducir). El lunes 16: la carta (con una rutina que descansa), Estadísticas (Semana y «Qué te
   ayuda») y Logros. El martes 17: la home con el día preparado, la ventana de la primera pausa y la
   home pasada la jornada. Las fotos y `medidas.json` salen a <FOTOS>.
   Uso: PACE_E2E_PORT=8892 RECORRIDO_FOTOS=<carpeta> node medidas.js */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../recorrido-6nov/lib');
const { stats, logros } = require('./final');
const PERSONAS = require('./personas');

const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0);
const vis = (p, sel) => p.locator(sel).filter({ visible: true });
const SEMANA = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'];
function resumen(fecha, i) {
  const p = (hora, tipo, modulo, id) => ({ hora, tipo, estado: 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
  const d = { fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
    p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(745, 'pausa', 'estira', 'move.neck.3'),
    p(795, 'pausa', 'mueve', 'extra.glutes.stealth'), p(945, 'pausa', 'estira', 'move.shoulder.circles'),
    p(1015, 'cierre', 'respira', 'breathe.physiological')] };
  if (i < 3) { d.paradas[0].platos[0].otras = 1; d.paradas[0].platos[0].antes = ['extra.desk.pushups']; }
  if (i % 2) d.paradas[3].estado = 'saltada';
  return d;
}

const salida = [];
const medida = (m) => ({ scroll: m.scroll.doc, cajas: (m.scroll.cajas || []).length, cortados: m.cortados.slice(0, 5), solapes: m.solapes.slice(0, 5), sinTraducir: (m.sinTraducir || []).slice(0, 8) });

async function una(lang, tam) {
  const EN = lang === 'en';
  const tag = (s) => 'med-' + lang + '-' + tam + '-' + s;
  const apunta = (k, v) => { salida.push([lang + ' ' + tam + ' ' + k, v]); console.log((lang + ' ' + tam + ' ' + k).padEnd(34), JSON.stringify(v).slice(0, 300)); };
  const o = { vis, apunta, L, tag, lang, EN };
  const { ctx, page } = await L.abrir({ tam, lang, estado: PERSONAS.oficina.estado(lang), reloj: D(16, 8, 50), espera: 1500 });
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  try {
    await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
    await page.evaluate(async (dias) => {
      for (const d of dias) await new Promise((ok) => emitRitmoDia(d, ok, ok));
      setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) }));
      ritmoMotorRevisar();
    }, SEMANA.map(resumen));
    await page.clock.fastForward(16000);
    await page.waitForTimeout(800);
    const carta = vis(page, '[data-pace-carta]');
    apunta('carta', (await carta.count()) ? (await carta.first().textContent()).replace(/\s+/g, ' ').slice(0, 300) : 'no sale');
    if (await carta.count()) {
      apunta('carta medida', medida(await L.medir(page, tag('carta'), { lang })));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }
    await stats(page, o, 'lun16');
    await logros(page, o, 'lun16');

    /* El martes: el día preparado, la ventana de la primera pausa y pasada la jornada. */
    await page.clock.fastForward(D(17, 8, 55).getTime() - await page.evaluate(() => Date.now()));
    await page.reload();
    await page.waitForTimeout(1200);
    const comienza = vis(page, '[data-pace-ritmo-comienza]');
    if (await comienza.count()) { await comienza.first().click(); await page.waitForTimeout(500); }
    await vis(page, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]').first().click();
    await page.waitForTimeout(600);
    apunta('home preparada', medida(await L.medir(page, tag('home-preparada'), { lang })));
    await vis(page, '[data-pace-cta]').first().click();
    const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await page.clock.fastForward(fin - await page.evaluate(() => Date.now()) + 1000);
    await page.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 });
    await page.waitForTimeout(600);
    apunta('ventana pausa', medida(await L.medir(page, tag('ventana-pausa'), { lang })));
    await vis(page, '[data-pace-break-shortcut] button').first().click();
    await page.clock.fastForward(D(17, 17, 40).getTime() - await page.evaluate(() => Date.now()));
    await page.waitForTimeout(800);
    apunta('tras la jornada', Object.assign(medida(await L.medir(page, tag('tras-la-jornada'), { lang })),
      { aro: await page.evaluate(() => [...document.querySelectorAll('[data-pace-dial-label], [data-pace-dial-number], [data-pace-cta]')].filter((e) => e.getBoundingClientRect().width).map((e) => e.textContent.trim()).join(' | ')) }));
  } catch (e) {
    apunta('ERROR', e.message.split('\n')[0]);
    await L.foto(page, tag('ERROR'));
  }
  apunta('errores', errores);
  await ctx.close();
}

(async () => {
  await L.lanzar();
  try {
    for (const lang of ['es', 'en']) for (const tam of ['movil', 'escritorio']) await una(lang, tam);
  } finally {
    fs.writeFileSync(path.join(L.FOTOS, 'medidas.json'), JSON.stringify(salida, null, 1));
    await L.cerrar();
  }
})();
