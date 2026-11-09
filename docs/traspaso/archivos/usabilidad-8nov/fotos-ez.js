/* Usabilidad del 8 nov. 2026: las fotos de la página de Ez, con la app de verdad, a 360 y a 1280 px
   y en castellano. Cada mejora, como se ve hoy y, si una opción cambia lo que se ve, con esa opción
   pintada encima de la misma pantalla (solo cambia lo que cambiaría la opción: un texto, una fila).
   · cierre: la jornada de dos horas acabada; a las 17:30, el aro con «Jornada cerrada» y la fila del
     ciclo (S9).
   · barra: una pausa corta en marcha y la barra de arriba (solo escritorio).
   · libre: tres días con un Foco por libre hasta las 17:30, y la carta del lunes.
   · pausa: la ventana de la pausa del bloque 1 (Q5, «ya la hice por mi cuenta»).
   · hasta: «Bloque 1 de 9 · Hasta las 17:00» en el aro.
   · voz: Ajustes, «Oír» (R5).
   Uso: PACE_E2E_PORT=8887 RECORRIDO_FOTOS=<carpeta> [SOLO=cierre,barra,...] node fotos-ez.js */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const PERSONAS = require('../caza-semana-7nov/personas');

const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0).getTime();
const vis = (p, sel) => p.locator(sel).filter({ visible: true });
const SOLO = process.env.SOLO || '';
const salida = [];
const apunta = (k, v) => { salida.push([k, v]); console.log(k.padEnd(30), JSON.stringify(v).slice(0, 300)); };
const aro = (p) => p.evaluate(() => [...document.querySelectorAll('[data-pace-dial-label], [data-pace-dial-subtitle], [data-pace-dial-number], [data-pace-cta]')]
  .filter((e) => e.getBoundingClientRect().width).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | '));

async function irA(p, ms) { const a = await p.evaluate(() => Date.now()); if (ms > a) await p.clock.fastForward(ms - a); await p.waitForTimeout(400); }
async function finDelBloque(p) {
  const fin = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) return false;
  await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
  await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
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
/* Cambia el texto de la hoja visible cuyo texto casa con `rx`. */
const texto = (p, rx, nuevo) => p.evaluate(([src, n]) => {
  const r = new RegExp(src);
  const el = [...document.querySelectorAll('body *')].find((e) => e.getBoundingClientRect().width > 0 &&
    [...e.childNodes].some((x) => x.nodeType === 3 && r.test(x.textContent.trim())));
  if (!el) return false;
  el.textContent = n;
  return true;
}, [rx.source, nuevo]);

/* S9: la jornada de dos horas del jueves, empezada a las 12:15, bloque a bloque con «Ahora no» y
   el bloque siguiente a los 7 minutos; el último con su pausa de cierre dejada. A las 17:30, el aro. */
async function cierre(tam) {
  const tag = (s) => 'u-cierre-' + tam + '-' + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(12, 12, 15)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, '2h');
  await vis(page, '[data-pace-cta]').first().click();
  for (let k = 0; k < 6; k++) {
    if (!(await finDelBloque(page))) break;
    if (!(await page.evaluate(() => { const p = ritmoPlan(getState()); return !!(p && p.actual); }))) { await vis(page, '[data-pace-break-shortcut] button').first().click(); break; }
    if (!(await siguiente(page, 7))) break;
  }
  await irA(page, D(12, 17, 30));
  for (let i = 0; i < 4; i++) { await page.clock.fastForward(5000); await page.waitForTimeout(400); }   /* que pasen los sellos */
  apunta(tam + ' cierre', await aro(page));
  await L.foto(page, tag('hoy'));
  /* A: con el día cerrado, la fila del ciclo no se ve (como con un bloque del plan). */
  const fila = await page.evaluate(() => {
    const el = [...document.querySelectorAll('span')].find((e) => /Ciclo \d \/ 4/.test(e.textContent) && e.getBoundingClientRect().width > 0);
    if (!el) return false;
    el.parentElement.style.visibility = 'hidden';
    return true;
  });
  apunta(tam + ' cierre A', fila);
  await L.foto(page, tag('A'));
  await ctx.close();
}

/* La barra de arriba con una pausa corta en marcha: hoy cambia sin preguntar; la A, la pregunta
   de siempre con el texto de la pausa. Solo escritorio: en el móvil la barra no está. */
async function barra() {
  const tag = (s) => 'u-barra-' + s;
  const { ctx, page } = await L.abrir({ tam: 'escritorio', lang: 'es', reloj: new Date(D(12, 10, 0)), espera: 1500 });
  const tab = (rx) => vis(page, '[data-pace-tabs] button').filter({ hasText: rx }).first();
  await tab(/^Pausa$/).click(); await page.waitForTimeout(400);
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(2 * 60000 + 10000); await page.waitForTimeout(500);
  apunta('barra antes', await aro(page));
  await tab(/^Foco$/).hover(); await page.waitForTimeout(300);
  await L.foto(page, tag('hoy-antes'));
  await tab(/^Foco$/).click(); await page.waitForTimeout(700);
  apunta('barra despues', await aro(page));
  await L.foto(page, tag('hoy-despues'));
  /* A: otra vez la pausa en marcha, y la pregunta que ya existe para el Foco, con su texto. */
  await tab(/^Pausa$/).click(); await page.waitForTimeout(400);
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(2 * 60000 + 10000); await page.waitForTimeout(400);
  await page.evaluate(() => { window.paceFocoEmpezado = () => true; });
  await tab(/^Foco$/).click(); await page.waitForTimeout(700);
  await page.evaluate(() => {
    const m = document.querySelector('[data-pace-cambio-modo]');
    if (!m) return;
    const caja = m.closest('[role=dialog]') || m.parentElement;
    const h = caja.querySelector('h2, h3, [data-pace-modal-title]');
    if (h) h.textContent = '¿Dejar la pausa?';
    m.textContent = 'Llevas 2 minutos de pausa. Si vuelves al Foco ahora, la pausa se acaba aquí.';
    const bs = [...caja.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0 && b.textContent.trim());
    for (const b of bs) {
      if (/^Cambiar$/.test(b.textContent.trim())) b.textContent = 'Volver al Foco';
      if (/^Seguir con el Foco$/.test(b.textContent.trim())) b.textContent = 'Seguir con la pausa';
    }
  });
  await L.foto(page, tag('A'));
  await ctx.close();
}

/* Tres días (lunes a miércoles) de jornada de 9 a 17 con un Foco por libre de 17:05 a 17:30, y el
   lunes siguiente a las 8:50, la carta. */
async function libre(tam) {
  const tag = (s) => 'u-libre-' + tam + '-' + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(16, 8, 50)), espera: 1500 });
  await page.waitForFunction(() => window.paceEventsCanWrite && window.paceEventsCanWrite());
  const dias = [9, 10, 11].map((d) => ({ d, fecha: '2026-11-' + String(d).padStart(2, '0') }));
  await page.evaluate(async (ds) => {
    const p = (hora, tipo, modulo, id) => ({ hora, tipo, estado: 'hecha', reunion: 0, platos: [{ modulo, id, otras: 0, antes: [] }] });
    const foco = (d, h1, m1, h2, m2) => new Promise((ok) => {
      const fin = new Date(2026, 10, d, h2, m2), ini = new Date(2026, 10, d, h1, m1);
      const s = Math.round((fin - ini) / 1000);
      const ev = window.makeEvent({ type: 'session.completed', occurredAt: fin.toISOString(), runId: window.newEventId(),
        payload: { module: 'focus', routineId: paceFocusRoutineId(), completionReason: 'natural', elapsedSeconds: s, activeSeconds: s, plannedSeconds: s } });
      paceEmitirEvento(ev, ok, ok);
    });
    for (const x of ds) {
      await new Promise((ok) => emitRitmoDia({ fecha: x.fecha, opcion: 'jornada', habitual: 'jornada', inicio: 540, salida: 1020, paradas: [
        p(585, 'pausa', 'mueve', 'extra.legs.standing'), p(690, 'larga', 'estira', 'move.hips.standing'),
        p(1015, 'cierre', 'respira', 'breathe.diaphragm')] }, ok, ok));
      await foco(x.d, 9, 0, 9, 45);
      await foco(x.d, 16, 10, 16, 55);
      await foco(x.d, 17, 5, 17, 30);
    }
    setState((prev) => Object.assign({}, prev, { ritmo: Object.assign({}, prev.ritmo, { carta: null }) }));
    ritmoMotorRevisar();
  }, dias);
  await page.clock.fastForward(16000);
  await page.waitForTimeout(900);
  const carta = vis(page, '[data-pace-carta]');
  apunta(tam + ' libre carta', (await carta.count()) ? (await carta.first().textContent()).replace(/\s+/g, ' ') : 'no sale');
  await L.foto(page, tag('hoy'));
  await ctx.close();
}

/* La jornada entera del jueves preparada a las 8:50: el aro con «Hasta las 17:00»; empezada, al acabar
   el bloque 1, la ventana de la pausa (Q5). */
async function hastaYPausa(tam) {
  const tag = (s) => 'u-' + s + '-' + tam;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', estado: PERSONAS.oficina.estado('es'), reloj: new Date(D(12, 8, 50)), espera: 1500 });
  await page.clock.fastForward(16000);
  await preparar(page, 'jornada');
  await vis(page, '[data-pace-cta]').first().click();
  await page.clock.fastForward(5 * 60000); await page.waitForTimeout(500);
  apunta(tam + ' hasta', await aro(page));
  await L.foto(page, tag('hasta-hoy'));
  if (await texto(page, /^Hasta las 17:00$/, 'Tu jornada, hasta las 17:00')) await L.foto(page, tag('hasta-A'));
  const fin = await page.evaluate(() => { try { const e = JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt; const d = new Date(e); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); } catch (e) { return null; } });
  apunta(tam + ' fin del bloque', fin);
  if (await texto(page, /^Tu jornada, hasta las 17:00$/, 'Este bloque, hasta las ' + fin)) await L.foto(page, tag('hasta-B'));
  await finDelBloque(page);
  await L.foto(page, tag('pausa-hoy'));
  /* A: «Ya la hice por mi cuenta» a la izquierda de «Ahora no», con su mismo estilo. */
  await page.evaluate(() => {
    const ahora = [...document.querySelectorAll('[data-pace-break-shortcut] button')].find((b) => b.getBoundingClientRect().width > 0);
    if (!ahora) return;
    const fila = ahora.parentElement;
    const otro = ahora.cloneNode(true);
    otro.textContent = 'Ya la hice por mi cuenta';
    otro.setAttribute('data-maq', 'a');
    fila.style.display = 'flex'; fila.style.justifyContent = 'space-between'; fila.style.alignItems = 'center';
    fila.insertBefore(otro, ahora);
  });
  await L.foto(page, tag('pausa-A'));
  await page.evaluate(() => {
    const a = document.querySelector('[data-maq="a"]'); if (a) a.remove();
    const seguir = [...document.querySelectorAll('button')].find((b) => /^Seguir con el bloque/.test(b.textContent.trim()) && b.getBoundingClientRect().width > 0);
    if (!seguir) return;
    const otro = seguir.cloneNode(true);
    otro.textContent = 'Ya la hice por mi cuenta';
    seguir.parentElement.insertBefore(otro, seguir.nextSibling);
  });
  await L.foto(page, tag('pausa-B'));
  await ctx.close();
}

/* Ajustes, «Oír»: hoy; A, «Escuchar» junto a la voz y «Solo en Respira» bajo «Suena detrás»; B, solo
   la línea de Respira. La línea pequeña se calca de la de «Aviso al terminar». */
async function voz(tam) {
  const tag = (s) => 'u-voz-' + tam + '-' + s;
  const { ctx, page } = await L.abrir({ tam, lang: 'es', reloj: new Date(D(12, 10, 0)), espera: 1500 });
  await page.locator('[data-pace-topbar-ajustes]').filter({ visible: true }).first().click();
  await page.waitForTimeout(800);
  await L.foto(page, tag('hoy'));
  const pinta = (conEscuchar) => page.evaluate((esc) => {
    const hoja = (rx) => [...document.querySelectorAll('body *')].find((e) => e.getBoundingClientRect().width > 0 &&
      [...e.childNodes].some((x) => x.nodeType === 3 && rx.test(x.textContent.trim())));
    const pista = hoja(/^Foco · si la pestaña está detrás$/) || hoja(/^Foco/);
    const detras = hoja(/^Suena detrás$/);
    if (pista && detras) {
      const nueva = pista.cloneNode(true);
      nueva.textContent = 'La música suena solo en Respira';
      nueva.setAttribute('data-maq', 'r');
      detras.parentElement.appendChild(nueva);
    }
    if (esc) {
      const fase = hoja(/^Marca la fase$/);
      const enlace = hoja(/^Visita guiada/);
      if (fase && enlace) {
        const b = enlace.cloneNode(true);
        b.textContent = 'Escuchar ›';
        b.setAttribute('data-maq', 'e');
        b.style.display = 'block'; b.style.marginTop = '2px';
        fase.parentElement.appendChild(b);
      }
    }
  }, conEscuchar);
  await pinta(true);
  await L.foto(page, tag('A'));
  await page.evaluate(() => document.querySelectorAll('[data-maq="e"]').forEach((e) => e.remove()));
  await L.foto(page, tag('B'));
  await ctx.close();
}

(async () => {
  await L.lanzar();
  const toca = (k) => !SOLO || SOLO.split(',').includes(k);
  try {
    if (toca('barra')) try { await barra(); } catch (e) { apunta('barra ERROR', e.message.split('\n')[0]); }
    for (const tam of ['movil', 'escritorio']) {
      if (toca('cierre')) try { await cierre(tam); } catch (e) { apunta(tam + ' cierre ERROR', e.message.split('\n')[0]); }
      if (toca('libre')) try { await libre(tam); } catch (e) { apunta(tam + ' libre ERROR', e.message.split('\n')[0]); }
      if (toca('hasta')) try { await hastaYPausa(tam); } catch (e) { apunta(tam + ' hasta ERROR', e.message.split('\n')[0]); }
      if (toca('voz')) try { await voz(tam); } catch (e) { apunta(tam + ' voz ERROR', e.message.split('\n')[0]); }
    }
  } finally {
    fs.writeFileSync(path.join(L.FOTOS, 'fotos-ez' + (SOLO ? '-' + SOLO.replace(/,/g, '-') : '') + '.json'), JSON.stringify(salida, null, 1));
    await L.cerrar();
  }
})();
