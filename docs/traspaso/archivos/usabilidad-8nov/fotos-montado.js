/* Usabilidad del 8 nov. 2026, «Montado»: las mismas escenas en la versión de antes y en la de después,
   a 360 y a 1280 px y en castellano, para la página de Ez. Se corre dos veces, una contra cada copia:
   la 0.194.0 (`origin/main`, sacada con `git archive` a una carpeta aparte con este script dentro) y la
   rama. ETIQUETA dice cuál es ('antes' o 'despues') y va en el nombre de cada foto.
   · cierre (1A y S3): la jornada de dos horas acabada; a las 17:30, el aro.
   · barra (2A, solo escritorio): una pausa corta con 2 min hechos y un clic en «Foco».
   · libre (3A): tres días con un Foco por libre de 17:05 a 17:30; el lunes, la carta.
   · pausa (4A): la ventana de la pausa al acabar el bloque 1.
   · hasta (5A): el aro cinco minutos dentro del bloque 1.
   · comida (S7): «Ahora no» en la pausa de las 13:45 y «Empezar ya el bloque 2» a las 13:46.
   · tras (S11): la jornada de 8:00 a 18:00, PACE de fondo de 8:46 a 12:10.
   Uso: ETIQUETA=antes PACE_E2E_PORT=8887 RECORRIDO_FOTOS=<carpeta> [SOLO=cierre,...] node fotos-montado.js
   (con NODE_PATH apuntando a los node_modules de la rama si se corre desde la copia de antes). */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const PERSONAS = require('../caza-semana-7nov/personas');

const ET = process.env.ETIQUETA || 'despues';
const SOLO = process.env.SOLO || '';
const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0).getTime();
const vis = (p, sel) => p.locator(sel).filter({ visible: true });
const salida = [];
const apunta = (k, v) => { salida.push([k, v]); console.log((ET + ' ' + k).padEnd(34), JSON.stringify(v).slice(0, 240)); };
const aro = (p) => p.evaluate(() => [...document.querySelectorAll('[data-pace-dial-label], [data-pace-dial-hasta], [data-pace-dial-number], [data-pace-cta], [data-pace-ciclo]')]
  .filter((e) => e.getBoundingClientRect().width && getComputedStyle(e).visibility !== 'hidden').map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '));
const foto = (p, n) => L.foto(p, n + '-' + ET);
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };

async function irA(p, ms) {
  for (let i = 0; i < 300 && await p.evaluate(() => Date.now()) < ms; i++) {
    await p.clock.fastForward(Math.min(5 * 60000, ms - await p.evaluate(() => Date.now())));
    await p.waitForTimeout(25);
  }
  await p.waitForTimeout(400);
}
async function finDelBloque(p) {
  const fin = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) return false;
  await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
  await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
  return true;
}
const ahoraNo = (p) => vis(p, '[data-pace-break-shortcut] button').filter({ hasText: /^Ahora no$/ }).first().click();
async function empezarYa(p) {
  const ya = vis(p, '[data-pace-aro-seguir]');
  if (await ya.count()) { await ya.first().click(); return true; }
  const cta = vis(p, '[data-pace-cta]');
  if (await cta.count() && /Empezar|Seguir/.test(await cta.first().textContent())) { await cta.first().click(); return true; }
  return false;
}
async function preparar(p, op) {
  const comienza = vis(p, '[data-pace-ritmo-comienza]');
  if (await comienza.count()) { await comienza.first().click(); await p.waitForTimeout(500); }
  const habitual = vis(p, '[data-pace-ritmo-distinto]');
  if (op !== 'jornada' && await habitual.count()) { await habitual.first().click(); await p.waitForTimeout(500); }
  await vis(p, op === 'jornada' ? '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="jornada"]' : 'button[data-pace-ritmo-opcion="' + op + '"], [data-pace-ritmo-loseta="' + op + '"]').first().click();
  await p.waitForTimeout(600);
}

/* 1A y S3: la jornada de dos horas del jueves, empezada a las 12:15, bloque a bloque con «Ahora no» y
   el siguiente a los 7 minutos; a las 17:30, el aro con el día cerrado. */
async function cierre(tam) {
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(12, 12, 15)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, '2h');
  await vis(page, '[data-pace-cta]').first().click();
  for (let k = 0; k < 6; k++) {
    if (!(await finDelBloque(page))) break;
    if (!(await page.evaluate(() => { const p = ritmoPlan(getState()); return !!(p && p.actual); }))) { await ahoraNo(page); break; }
    await ahoraNo(page);
    await page.clock.fastForward(7 * 60000); await page.waitForTimeout(400);
    if (!(await empezarYa(page))) break;
  }
  await irA(page, D(12, 17, 30));
  for (let i = 0; i < 4; i++) { await page.clock.fastForward(5000); await page.waitForTimeout(400); }
  apunta(tam + ' cierre', await aro(page));
  await foto(page, 'm-cierre-' + tam);
  await ctx.close();
}

/* 2A: una pausa corta en marcha con 2 min hechos y un clic en «Foco». */
async function barra() {
  const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', reloj: new Date(D(12, 10, 0)), espera: 1500 });
  const tab = (rx) => vis(page, '[data-pace-tabs] button').filter({ hasText: rx }).first();
  await tab(/^Pausa$/).click(); await page.waitForTimeout(400);
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(2 * 60000 + 10000); await page.waitForTimeout(500);
  await tab(/^Foco$/).click(); await page.waitForTimeout(700);
  apunta('barra', await aro(page));
  await foto(page, 'm-barra-escritorio');
  await ctx.close();
}

/* 3A: tres días de jornada de 9 a 17 con un Foco por libre de 17:05 a 17:30, y el lunes 16, la carta. */
async function libre(tam) {
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(16, 8, 50)), espera: 1500 });
  await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
  await page.evaluate(async (ds) => {
    const p = (hora, tipo, modulo, id) => ({ hora, tipo, estado: 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
    const foco = (d, h1, m1, h2, m2) => new Promise((ok) => {
      const fin = new Date(2026, 10, d, h2, m2), ini = new Date(2026, 10, d, h1, m1), s = Math.round((fin - ini) / 1000);
      paceEmitirEvento(window.makeEvent({ type: 'session.completed', occurredAt: fin.toISOString(), runId: window.newEventId(),
        payload: { module: 'focus', routineId: paceFocusRoutineId(), completionReason: 'natural', elapsedSeconds: s, activeSeconds: s, plannedSeconds: s } }), ok, ok);
    });
    for (const d of ds) {
      const fecha = '2026-11-' + String(d).padStart(2, '0');
      await new Promise((ok) => emitRitmoDia({ fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
        p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(690, 'larga', 'estira', 'move.hips.standing'), p(1015, 'cierre', 'respira', 'breathe.diaphragm')] }, ok, ok));
      await foco(d, 9, 0, 9, 45); await foco(d, 16, 10, 16, 55); await foco(d, 17, 5, 17, 30);
    }
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) }));
    ritmoMotorRevisar();
  }, [9, 10, 11]);
  await page.clock.fastForward(16000); await page.waitForTimeout(900);
  const carta = vis(page, '[data-pace-carta]');
  apunta(tam + ' libre', (await carta.count()) ? (await carta.first().textContent()).replace(/\s+/g, ' ').slice(0, 200) : 'no sale');
  await foto(page, 'm-libre-' + tam);
  await ctx.close();
}

/* 5A y 4A: la jornada entera del jueves preparada a las 8:50; empezada, el aro a los 5 min y, al acabar
   el bloque 1, la ventana de la pausa. */
async function hastaYPausa(tam) {
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(12, 8, 50)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, 'jornada');
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(5 * 60000); await page.waitForTimeout(500);
  apunta(tam + ' hasta', await aro(page));
  await foto(page, 'm-hasta-' + tam);
  await finDelBloque(page);
  apunta(tam + ' pausa', await page.evaluate(() => [...document.querySelectorAll('[data-pace-break-shortcut] button')].filter((b) => b.getBoundingClientRect().width).map((b) => b.textContent.trim())));
  await foto(page, 'm-pausa-' + tam);
  await ctx.close();
}

/* S7: el día elegido a las 13:00 (bloque hasta las 13:45, pausa, comida a las 14:00); «Ahora no» y, a las
   13:46, «Empezar ya el bloque 2». */
async function comida(tam) {
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: { ritmo: { horario: HORARIO, dia: { fecha: '2026-11-12', opcion: 'jornada', desde: 780, cicloBase: 0, cambios: {} } } },
    reloj: new Date(D(12, 13, 0)), espera: 1500 });
  await vis(page, '[data-pace-cta]').first().click();
  await finDelBloque(page);
  await ahoraNo(page);
  await page.clock.fastForward(60000); await page.waitForTimeout(300);
  await empezarYa(page);
  await page.clock.fastForward(30000); await page.waitForTimeout(600);
  apunta(tam + ' comida', await aro(page) + ' || ' + await page.evaluate(() => ritmoPlan(getState()).m.items.map((it) => it.tipo[0] + ritmoHora(it.desde) + '+' + it.dur).join(' ')));
  await foto(page, 'm-comida-' + tam);
  await ctx.close();
}

/* S11: jornada de 8:00 a 18:00 empezada a las 8:00; «Ahora no» a las 8:46 y PACE de fondo hasta las 12:10. */
async function tras(tam) {
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: { ritmo: { horario: { inicio: 480, comida: 840, comidaDur: 60, salida: 1080 },
    dia: { fecha: '2026-11-12', opcion: 'jornada', desde: 480, cicloBase: 0, cambios: {} } } }, reloj: new Date(D(12, 8, 0)), espera: 1500 });
  await vis(page, '[data-pace-cta]').first().click();
  await finDelBloque(page);
  await ahoraNo(page);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.clock.fastForward(D(12, 12, 10) - await page.evaluate(() => Date.now()));
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(900);
  apunta(tam + ' tras', await aro(page) + ' || ' + await page.evaluate(() => { const p = ritmoPlan(getState()); const it = p.m.items[ritmoIndiceAhora(p)]; return 'ahora ' + it.tipo + ' ' + ritmoHora(it.desde) + ' · ' + p.total + ' bloques'; }));
  await foto(page, 'm-tras-' + tam);
  await ctx.close();
}

(async () => {
  await L.lanzar();
  const toca = (k) => !SOLO || SOLO.split(',').includes(k);
  try {
    if (toca('barra')) try { await barra(); } catch (e) { apunta('barra ERROR', e.message.split('\n')[0]); }
    for (const tam of ['movil', 'escritorio']) {
      for (const [k, f] of [['cierre', cierre], ['libre', libre], ['hasta', hastaYPausa], ['comida', comida], ['tras', tras]]) {
        if (toca(k)) try { await f(tam); } catch (e) { apunta(tam + ' ' + k + ' ERROR', e.message.split('\n')[0]); }
      }
    }
  } finally {
    fs.writeFileSync(path.join(L.FOTOS, 'fotos-montado-' + ET + '.json'), JSON.stringify(salida, null, 1));
    await L.cerrar();
  }
})();
