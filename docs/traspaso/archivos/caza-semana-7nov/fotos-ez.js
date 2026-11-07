/* Caza de la semana (7 nov. 2026): las fotos de la página de Ez, con la app de verdad, a 360 y a
   1280 px y en castellano. Cada caso, como se ve hoy y, si una opción cambia lo que se ve, con esa
   opción pintada en la misma pantalla (solo el número del aro, que es lo que cambiaría).
   · S3: la jornada de dos horas, con los bloques empezados tarde; pasada su hora, y a la mañana
     siguiente, el «Foco manual» con los minutos del último bloque.
   · La comida: la jornada entera hasta la pausa de antes de comer; «Ahora no» y «Empezar ya el
     bloque» cuando falta un cuarto de hora para comer.
   Uso: PACE_E2E_PORT=8892 RECORRIDO_FOTOS=<carpeta> node fotos-ez.js */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../recorrido-6nov/lib');
const PERSONAS = require('./personas');

const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0).getTime();
const vis = (p, sel) => p.locator(sel).filter({ visible: true });
const hm = (ms) => { const x = new Date(ms); return x.getHours() + ':' + String(x.getMinutes()).padStart(2, '0'); };
const salida = [];
const apunta = (k, v) => { salida.push([k, v]); console.log(k.padEnd(30), JSON.stringify(v).slice(0, 260)); };
const aro = (p) => p.evaluate(() => [...document.querySelectorAll('[data-pace-dial-label], [data-pace-dial-subtitle], [data-pace-dial-number], [data-pace-cta]')]
  .filter((e) => e.getBoundingClientRect().width).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ') + ' @ ' + new Date(Date.now()).toTimeString().slice(0, 5));

async function irA(p, ms) { const a = await p.evaluate(() => Date.now()); if (ms > a) await p.clock.fastForward(ms - a); await p.waitForTimeout(400); }
async function finDelBloque(p) {
  const fin = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) return false;
  await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
  await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  return true;
}
async function preparar(p, op) {
  const comienza = vis(p, '[data-pace-ritmo-comienza]');
  if (await comienza.count()) { await comienza.first().click(); await p.waitForTimeout(500); }
  const habitual = vis(p, '[data-pace-ritmo-distinto]');
  if (op !== 'jornada' && await habitual.count()) { await habitual.first().click(); await p.waitForTimeout(500); }
  await vis(p, op === 'jornada' ? '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]' : 'button[data-pace-ritmo-opcion="' + op + '"], [data-pace-ritmo-loseta="' + op + '"]').first().click();
  await p.waitForTimeout(600);
}
/* «Ahora no» y, pasados unos minutos, el bloque siguiente. */
async function siguiente(p, tarde) {
  await vis(p, '[data-pace-break-shortcut] button').first().click();
  await p.clock.fastForward(tarde * 60000);
  await p.waitForTimeout(400);
  const ya = vis(p, 'button').filter({ hasText: /^Empezar ya el bloque/ });
  if (await ya.count()) { await ya.first().click(); return true; }
  const cta = vis(p, '[data-pace-cta]');
  if (await cta.count() && /Empezar|Seguir/.test(await cta.first().textContent())) { await cta.first().click(); return true; }
  return false;
}
const pintaMinutos = (p, n) => p.evaluate((x) => setState({ focusMinutes: x }), n);

async function s3(tam) {
  const tag = (s) => 'ez-s3-' + tam + '-' + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(12, 15, 0)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, '2h');
  apunta(tam + ' s3 preparado', await aro(page));
  await vis(page, '[data-pace-cta]').first().click();
  for (let k = 0; k < 6; k++) {
    if (!(await finDelBloque(page))) break;
    apunta(tam + ' s3 fin ' + (k + 1), await aro(page));
    /* El último bloque: la pausa de cierre con «Ahora no», y a casa (sin otro ciclo). */
    if (!(await page.evaluate(() => { const p = ritmoPlan(getState()); return !!(p && p.actual); }))) { await vis(page, '[data-pace-break-shortcut] button').first().click(); break; }
    if (!(await siguiente(page, 7))) break;
  }
  await irA(page, D(12, 17, 30));
  apunta(tam + ' s3 pasada la hora', await aro(page));
  await L.foto(page, tag('hoy-tarde'));
  await irA(page, D(13, 8, 55));
  await page.reload(); await page.waitForTimeout(1500);
  const hoy = await aro(page);
  apunta(tam + ' s3 a la mañana', hoy);
  await L.foto(page, tag('hoy-manana'));
  const antes = await page.evaluate(() => getState().focusMinutes);
  await pintaMinutos(page, 25); await page.waitForTimeout(300);
  await L.foto(page, tag('A-manana'));
  await pintaMinutos(page, antes);
  await ctx.close();
}

/* `pintaA`: la opción A pintada con la app de verdad: el bloque se empieza con lo que cabe hasta
   comer (los minutos del aro puestos a mano antes de pulsar), que es lo que haría la A. */
async function comida(tam, pintaA) {
  const tag = (s) => 'ez-comida-' + tam + '-' + (pintaA ? 'A-' : 'hoy-') + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(13, 9, 5)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, 'jornada');
  await vis(page, '[data-pace-cta]').first().click();
  for (let k = 0; k < 10; k++) {
    if (!(await finDelBloque(page))) break;
    /* La pausa de antes de comer: lo que va detrás es la comida. */
    const antesDeComer = await page.evaluate(() => {
      const p = ritmoPlan(getState()), it = p.m.items, i = it.findIndex((x) => x === p.pausa || (p.pausa && x.desde === p.pausa.desde && x.tipo === p.pausa.tipo));
      return i >= 0 && it[i + 1] && it[i + 1].tipo === 'comida' ? { pausa: ritmoHora(it[i].desde), comida: ritmoHora(it[i + 1].desde) } : null;
    });
    apunta(tam + ' comida fin ' + (k + 1), [await aro(page), antesDeComer]);
    if (antesDeComer) {
      await vis(page, '[data-pace-break-shortcut] button').first().click();
      await page.clock.fastForward(60000); await page.waitForTimeout(500);
      apunta(tam + ' comida tras «Ahora no»', await aro(page));
      if (!pintaA) await L.foto(page, tag('antes'));
      if (pintaA) await page.evaluate((c) => { const [h, m] = c.split(':').map(Number); setState({ focusMinutes: h * 60 + m - (new Date(Date.now()).getHours() * 60 + new Date(Date.now()).getMinutes()) }); }, antesDeComer.comida);
      const ya = vis(page, 'button').filter({ hasText: /^Empezar ya el bloque/ });
      if (await ya.count()) await ya.first().click(); else await vis(page, '[data-pace-cta]').first().click();
      await page.waitForTimeout(600);
      const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
      apunta(tam + (pintaA ? ' comida A' : ' comida') + ' empezado', [await aro(page), 'acaba a las ' + hm(fin)]);
      await L.foto(page, tag('empezado'));
      break;
    }
    if (!(await siguiente(page, 2))) break;
  }
  await ctx.close();
}

/* La carta que propone «pasa a ser de 2 minutos» para una pausa que ya servía rutinas de 2: la de
   las 12:15 saltada tres días con «Escritorio express» y «Tronco sentado» (lo que vio la persona media). */
async function cartaCorta(tam) {
  const tag = (s) => 'ez-corta-' + tam + '-' + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.media.estado('es'), reloj: new Date(D(16, 8, 50)), espera: 1500 });
  await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
  const dias = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12'].map((fecha, i) => {
    const p = (hora, tipo, modulo, id, estado) => ({ hora, tipo, estado: estado || 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
    return { fecha, opcion: 'media', habitual: 'media', inicio: 540, salida: 780, paradas: [
      p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(635, 'pausa', 'mueve', 'extra.calves'),
      p(685, 'larga', 'estira', 'move.hips.standing'),
      p(735, 'pausa', 'estira', i % 2 ? 'move.desk.quick' : 'move.spine.chair', i === 1 ? 'hecha' : 'saltada'),
      p(775, 'cierre', 'respira', 'breathe.diaphragm')] };
  });
  apunta(tam + ' corta rutinas', await page.evaluate(() => ['move.desk.quick', 'move.spine.chair'].map((id) => { const r = ritmoRutinaPorId(id); return id + ' ' + (r && r.min) + ' min'; })));
  await page.evaluate(async (ds) => {
    for (const d of ds) await new Promise((ok) => emitRitmoDia(d, ok, ok));
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) }));
    ritmoMotorRevisar();
  }, dias);
  await page.clock.fastForward(16000);
  await page.waitForTimeout(800);
  const carta = vis(page, '[data-pace-carta]');
  apunta(tam + ' corta carta', (await carta.count()) ? (await carta.first().textContent()).replace(/\s+/g, ' ') : 'no sale');
  await L.foto(page, tag('carta'));
  await ctx.close();
}

(async () => {
  await L.lanzar();
  try {
    for (const tam of ['movil', 'escritorio']) {
      try { await s3(tam); } catch (e) { apunta(tam + ' s3 ERROR', e.message.split('\n')[0]); }
      try { await comida(tam); } catch (e) { apunta(tam + ' comida ERROR', e.message.split('\n')[0]); }
      try { await comida(tam, true); } catch (e) { apunta(tam + ' comida A ERROR', e.message.split('\n')[0]); }
      try { await cartaCorta(tam); } catch (e) { apunta(tam + ' corta ERROR', e.message.split('\n')[0]); }
    }
  } finally {
    fs.writeFileSync(path.join(L.FOTOS, 'fotos-ez.json'), JSON.stringify(salida, null, 1));
    await L.cerrar();
  }
})();
