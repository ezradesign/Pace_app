/* Caza de la semana (7 nov. 2026): una persona vive con PACE del lunes 9 al martes 17 de noviembre,
   con el reloj de la página (`page.clock`), clics de verdad y la página abierta o cerrada como
   haría ella. Cada día: prepara el día, hace los bloques y, en cada pausa, lo que diga su plan
   (hacerla, «Ahora no», saltarla, «Otra»), cierra el portátil a mediodía y pasa la noche con la
   página abierta o cerrada. El lunes siguiente, la carta; el martes, si se nota lo aceptado.
   Lo que mide sale a <FOTOS>/<persona>.json y las fotos a <FOTOS>.
   Uso: PACE_E2E_PORT=8892 node semana.js <oficina|media|salta> [es|en] [movil|escritorio] */
'use strict';
const fs = require('fs');
const path = require('path');
const L = require('../recorrido-6nov/lib');

const [quien = 'oficina', lang = 'es', tam = quien === 'oficina' ? 'escritorio' : 'movil'] = process.argv.slice(2);
const EN = lang === 'en';
const D = (d, h, mi) => new Date(2026, 10, d, h, mi || 0);
const hm = (ms) => { const x = new Date(ms); return x.getHours() + ':' + String(x.getMinutes()).padStart(2, '0'); };
const PERSONAS = require('./personas');
const P = PERSONAS[quien];
if (!P) throw new Error('persona: ' + Object.keys(PERSONAS).join(' | '));

const log = [];
const apunta = (k, v) => { log.push([k, v]); console.log(k.padEnd(28), typeof v === 'string' ? v : JSON.stringify(v)); };
const tag = (s) => quien + '-' + lang + '-' + s;

const leer = (p) => p.evaluate(() => {
  const v = (s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).join(' | ');
  const s = getState(), r = s.ritmo || {};
  const h = new Date(Date.now());
  return {
    hora: h.toDateString().slice(0, 3) + ' ' + h.getHours() + ':' + String(h.getMinutes()).padStart(2, '0'),
    label: v('[data-pace-dial-label]'), sub: v('[data-pace-dial-subtitle]'), cta: v('[data-pace-cta]').slice(0, 60),
    num: v('[data-pace-dial-number]'), ventana: v('[data-pace-modal-card]').slice(0, 140),
    dia: r.dia ? { f: r.dia.fecha, op: r.dia.opcion, est: r.dia.estados || {}, pausa: r.dia.pausa, base: r.dia.cicloBase } : null,
    cycle: s.cycle, resumido: r.resumido || null, cola: (r.resumenes || []).map((x) => x.fecha),
  };
});

const estadoEntero = (p) => p.evaluate(async () => {
  const s = getState(), r = s.ritmo || {};
  let ev = [];
  try { const snap = window.paceEventsSnapshot && window.paceEventsSnapshot(); ev = (snap && snap.events) || []; } catch (e) {}
  const dias = ev.filter((x) => x.type === 'ritmo.day.closed').map((x) => ({ f: x.payload.fecha, op: x.payload.opcion, ini: x.payload.inicio, sal: x.payload.salida,
    paradas: x.payload.paradas.map((q) => Math.floor(q.hora / 60) + ':' + String(q.hora % 60).padStart(2, '0') + ' ' + q.tipo[0] + ' ' + (q.estado || '-') + (q.reunion ? ' R' + q.reunion : '') + ' ' + q.platos.map((pl) => pl.id + (pl.otras ? '×' + pl.otras + '[' + pl.antes.join(',') + ']' : '')).join('+')) }));
  const ses = ev.filter((x) => x.type === 'session.completed').map((x) => x.localDay + ' ' + x.payload.module + ' ' + (x.payload.routineId || '') + ' ' + Math.round((x.payload.elapsedSeconds || 0) / 60) + 'm');
  return {
    dias, sesiones: ses.length, sesPorDia: ses.reduce((a, x) => { const k = x.slice(0, 10); a[k] = (a[k] || 0) + 1; return a; }, {}),
    fb: ev.filter((x) => x.type === 'feedback.answered').length,
    historia: s.history && s.history.days, semana: s.weeklyStats, streak: s.streak, total: s.totalFocusMin,
    logros: Object.keys(s.achievements || {}).filter((k) => s.achievements[k] && s.achievements[k].unlockedAt).map((k) => k + '@' + new Date(s.achievements[k].unlockedAt).toDateString().slice(0, 10)),
    carta: r.carta ? { lunes: r.carta.lunes, cambios: (r.carta.res.cambios || []), resp: r.carta.respuesta, hora: r.carta.hora, vista: r.carta.vista, luego: r.carta.luego, dias: r.carta.res.dias, hechas: r.carta.res.hechas, total: r.carta.res.total, ayudo: r.carta.res.ayudo } : null,
    aprendido: r.aprendido || null, horario: r.horario || null, cola: (r.resumenes || []).map((x) => x.fecha), resumido: r.resumido,
    sellos: JSON.parse(localStorage.getItem('caza.sellos') || '[]'),
  };
});

async function irA(p, fecha) {
  const ahora = await p.evaluate(() => Date.now());
  if (fecha.getTime() > ahora) await p.clock.fastForward(fecha.getTime() - ahora);
  await p.waitForTimeout(400);
}

let ctx = null, page = null, errores = [];
/* Cada sello que se enseña, con su hora y su texto, en una clave aparte (`caza.sellos`): un logro que
   llega dos veces sale dos veces aquí. */
const SELLOS = () => {
  const visto = new WeakSet();
  const mira = () => {
    document.querySelectorAll('[data-pace-toast]').forEach((el) => {
      if (visto.has(el) || !el.textContent.trim()) return;
      visto.add(el);
      try {
        const l = JSON.parse(localStorage.getItem('caza.sellos') || '[]');
        const d = new Date(Date.now());
        l.push(d.toDateString().slice(0, 10) + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + el.textContent.trim().replace(/\s+/g, ' ').slice(0, 80));
        localStorage.setItem('caza.sellos', JSON.stringify(l));
      } catch (e) {}
    });
  };
  new MutationObserver(mira).observe(document, { childList: true, subtree: true });
};
async function abrirPagina(fecha) {
  if (!ctx) {
    const o = await L.abrir({ tam, lang, estado: P.estado(lang), reloj: fecha, espera: 1500, extraInit: SELLOS });
    ctx = o.ctx; page = o.page; errores = o.errores;
    if (P.rutas) await P.rutas(ctx);
  } else {
    page = await ctx.newPage();
    page.on('pageerror', (e) => errores.push(hm(Date.now()) + ' pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errores.push(m.type() + ': ' + m.text()); });
    await page.clock.install({ time: fecha });
    await page.goto(L.BASE + '/index.html');
    await page.waitForSelector('[data-pace-app-root], [data-pace-dial-number]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
  }
  /* El registro abre tarde: los primeros intentos del resumen y de la carta van a los 1,5, 5 y 15 s. */
  await page.clock.fastForward(16000);
  await page.waitForTimeout(800);
  return page;
}
async function cerrarPagina() { if (page) { await page.close(); page = null; } }

const vis = (p, sel) => p.locator(sel).filter({ visible: true });

/* Lo que haya encima al llegar (la carta, un sello, un aviso): se apunta y se cierra o contesta. */
async function loQueHayEncima(p, dia) {
  const carta = vis(p, '[data-pace-carta]');
  if (await carta.count()) {
    apunta(dia + ' carta', (await carta.first().textContent()).replace(/\s+/g, ' ').slice(0, 400));
    await L.foto(p, tag(dia + '-carta'));
    if (P.carta) await P.carta(p, dia, apunta, L, tag);
  }
}

async function prepararDia(p, como) {
  if (como === 'distinto:jornada' || como === 'distinto:media') {
    const op = como.split(':')[1];
    const d = vis(p, '[data-pace-ritmo-distinto]');
    if (await d.count()) { await d.first().click(); await p.waitForTimeout(500); }
    await vis(p, 'button[data-pace-ritmo-opcion="' + op + '"], [data-pace-ritmo-loseta="' + op + '"]').first().click();
  } else {
    const comienza = vis(p, '[data-pace-ritmo-comienza]');
    if (await comienza.count()) { await comienza.first().click(); await p.waitForTimeout(500); }
    await vis(p, '[data-pace-ritmo-habitual-comienza], [data-pace-ritmo-loseta="' + como + '"], button[data-pace-ritmo-opcion="' + como + '"]').first().click();
  }
  await p.waitForTimeout(600);
}

async function finDelBloque(p) {
  const fin = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt || null; } catch (e) { return null; } });
  if (!fin) return false;
  await p.clock.fastForward(Math.max(0, fin - await p.evaluate(() => Date.now())) + 1000);
  await p.locator('[data-pace-break-shortcut]').first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  return true;
}

/* «Hacer la pausa»: la sesión hasta su cierre, «¿Te ayudó?» y vuelta a la home. */
async function hacerPausa(p, respuesta) {
  await vis(p, '[data-pace-break-acciones] button').first().click();
  await p.waitForTimeout(600);
  const done = p.locator('[data-pace-session-done]');
  for (let i = 0; i < 400 && !(await done.count()); i++) {
    const empezar = vis(p, '[data-pace-session-root] button, [data-pace-modal-card] button').filter({ hasText: EN ? /^(Start|Begin)$/ : /^(Empezar|Comenzar)$/ });
    if (await empezar.count()) await empezar.first().click().catch(() => {});
    await p.clock.fastForward(8000);
    await p.waitForTimeout(40);
  }
  if (!(await done.count())) return 'sin cierre';
  await p.waitForTimeout(400);
  const chips = vis(p, '[data-pace-fb-chip]');
  if (respuesta && await chips.count()) await chips.nth({ yes: 0, some: 1, no: 2 }[respuesta]).click();
  await p.waitForTimeout(300);
  /* La pausa larga sigue con su segundo plato: también se hace. */
  const seguir = vis(p, '[data-pace-session-root] button').filter({ hasText: EN ? /^Continue with/ : /^Seguir con/ });
  if (await seguir.count()) {
    await seguir.first().click();
    for (let i = 0; i < 400 && !(await vis(p, '[data-pace-fb-chip], [data-pace-session-root] button').filter({ hasText: EN ? /Back to home/ : /Volver al inicio/ }).count()); i++) {
      await p.clock.fastForward(8000);
      await p.waitForTimeout(40);
    }
  }
  const volver = vis(p, '[data-pace-session-root] button').filter({ hasText: EN ? /Back to home/ : /Volver al inicio/ });
  if (await volver.count()) await volver.first().click();
  else await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  return 'hecha';
}

async function ahoraNo(p) {
  await vis(p, '[data-pace-break-shortcut] button').first().click();
  await p.waitForTimeout(400);
}

/* Un día de trabajo entero, o hasta donde diga su plan. */
async function dia(d, plan) {
  const nombre = plan.nombre;
  if (plan.noAbre) { apunta(nombre, 'no abre PACE'); return; }
  const p = page && plan.desdeAbierta ? page : await abrirPagina(D(d, ...plan.llega));
  if (plan.desdeAbierta) await irA(p, D(d, ...plan.llega));
  apunta(nombre + ' llega', await leer(p));
  await L.foto(p, tag(nombre + '-llega'));
  await loQueHayEncima(p, nombre);
  if (plan.antes) await plan.antes(p, { apunta, L, tag, vis, irA, D, d, ctx });
  await prepararDia(p, plan.prepara || 'jornada');
  apunta(nombre + ' preparado', await leer(p));
  await L.foto(p, tag(nombre + '-preparado'));
  if (plan.trasPreparar) await plan.trasPreparar(p, { apunta, L, tag, vis, irA, D, d, ctx });
  await vis(p, '[data-pace-cta]').first().click();
  await p.waitForTimeout(400);
  for (let k = 1; k <= 14; k++) {
    if (plan.portatil && (await p.evaluate(() => new Date(Date.now()).getHours())) >= plan.portatil[0]) {
      /* Cierra el portátil: el reloj salta sin que corra nada (como al despertar). */
      const antes = await p.evaluate(() => Date.now());
      await p.clock.fastForward(plan.portatil[1] * 60000);
      await p.waitForTimeout(800);
      apunta(nombre + ' portátil ' + hm(antes) + '→' + hm(antes + plan.portatil[1] * 60000), await leer(p));
      await L.foto(p, tag(nombre + '-portatil'));
      plan.portatil = null;
    }
    if (!(await finDelBloque(p))) { apunta(nombre + ' sin bloque ' + k, await leer(p)); break; }
    const r = await leer(p);
    apunta(nombre + ' fin ' + k, r);
    if (k === 1 || k === 3) await L.foto(p, tag(nombre + '-ventana-' + k));
    const comer = vis(p, '[data-pace-break-acciones] button').filter({ hasText: EN ? /eat|lunch/i : /comer/i });
    let hecho = '';
    if (await comer.count()) {
      await comer.first().click(); hecho = 'come';
      await p.waitForTimeout(400);
    } else if (!(await vis(p, '[data-pace-break-shortcut]').count())) {
      hecho = 'sin ventana';
    } else {
      const q = (plan.pausa && plan.pausa(k, r)) || 'ahoraNo';
      if (q === 'hacer' || q === 'hacer:no' || q === 'hacer:some') hecho = await hacerPausa(p, q === 'hacer' ? 'yes' : q.split(':')[1]);
      else if (q === 'otra') {
        await ahoraNo(p);
        const otra = vis(p, '[data-pace-ritmo-otra]');
        hecho = (await otra.count()) ? 'otra' : 'sin «Otra»';
        if (await otra.count()) { await otra.first().click(); await p.waitForTimeout(300); hecho = await hacerPausaDesdeLaHome(p) || hecho; }
      } else { await ahoraNo(p); hecho = q; }
    }
    apunta(nombre + ' pausa ' + k, hecho);
    if (plan.trasBloque) await plan.trasBloque(k, p, { apunta, L, tag, vis, irA, D, d, ctx });
    /* Lo que tarda en volver: lo de la pausa, o lo que diga su plan. */
    const espera = (plan.vuelve && plan.vuelve(k)) || (hecho === 'come' ? 0 : 4);
    if (hecho === 'come') {
      const hasta = await p.evaluate(() => { const pl = ritmoPlan(getState()); return pl && pl.actual ? pl.actual.desde : null; });
      if (hasta != null) await irA(p, D(d, Math.floor(hasta / 60), hasta % 60));
    } else if (espera) await p.clock.fastForward(espera * 60000);
    await p.waitForTimeout(400);
    if (plan.salirA && (await p.evaluate(() => new Date(Date.now()).getHours() * 60 + new Date(Date.now()).getMinutes())) >= plan.salirA) { apunta(nombre + ' se va', await leer(p)); break; }
    const ahora = await leer(p);
    const seguir = vis(p, '[data-pace-aro-seguir]');
    if (await seguir.count()) await seguir.first().click();
    else if (/Empezar|Start|Seguir|Continue/.test(ahora.cta) && !/pausa|break/i.test(ahora.cta)) await vis(p, '[data-pace-cta]').first().click();
    else if (/Hacer la pausa|Take the break/i.test(ahora.cta)) {
      /* El aro aún cuenta la pausa: «Empezar ya el bloque». */
      const ya = vis(p, 'button').filter({ hasText: EN ? /^Start block/ : /^Empezar ya el bloque/ });
      if (await ya.count()) await ya.first().click(); else { apunta(nombre + ' atascado', ahora); break; }
    } else { apunta(nombre + ' no hay bloque', ahora); break; }
    await p.waitForTimeout(400);
    const ya = await leer(p);
    if (!/Bloque|Block/.test(ya.label)) { apunta(nombre + ' ya no es un bloque', ya); break; }
  }
  apunta(nombre + ' final', await leer(p));
  await irA(p, D(d, 19, 0));
  apunta(nombre + ' 19:00', await leer(p));
  await L.foto(p, tag(nombre + '-1900'));
  if (plan.tarde) await plan.tarde(p, { apunta, L, tag, vis, irA, D, d, ctx });
  if (plan.noche === 'cerrada') await cerrarPagina();
}

/* «Otra» desde la home y la pausa hecha con lo nuevo (lo que haría quien cambia la rutina). */
async function hacerPausaDesdeLaHome(p) {
  const cta = vis(p, '[data-pace-cta]');
  if (!/pausa|break/i.test(await cta.first().textContent())) return null;
  await cta.first().click();
  await p.waitForTimeout(500);
  const done = p.locator('[data-pace-session-done]');
  for (let i = 0; i < 400 && !(await done.count()); i++) {
    const empezar = vis(p, '[data-pace-session-root] button, [data-pace-modal-card] button').filter({ hasText: EN ? /^(Start|Begin)$/ : /^(Empezar|Comenzar)$/ });
    if (await empezar.count()) await empezar.first().click().catch(() => {});
    await p.clock.fastForward(8000); await p.waitForTimeout(40);
  }
  if (!(await done.count())) return 'otra sin cierre';
  const volver = vis(p, '[data-pace-session-root] button').filter({ hasText: EN ? /Back to home/ : /Volver al inicio/ });
  if (await volver.count()) await volver.first().click(); else await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  return 'otra y hecha';
}

(async () => {
  await L.lanzar();
  try {
    for (const plan of P.dias) {
      try { await dia(plan.d, plan); }
      catch (e) { apunta('ERROR ' + plan.nombre, e.message.split('\n')[0]); if (page) await L.foto(page, tag(plan.nombre + '-ERROR')); }
      if (page) apunta(plan.nombre + ' estado', await estadoEntero(page).then((x) => ({ cola: x.cola, resumido: x.resumido, dias: x.dias.map((y) => y.f), streak: x.streak })));
    }
    /* El lunes siguiente y el martes: la carta y lo aplicado. */
    for (const fin of P.final || []) {
      try { await fin({ abrirPagina, cerrarPagina, getPage: () => page, leer, estadoEntero, apunta, L, tag, vis, irA, D, prepararDia, dia, hacerPausa, finDelBloque, ahoraNo, lang, EN, ctx: () => ctx }); }
      catch (e) { apunta('ERROR final', e.message.split('\n')[0]); if (page) await L.foto(page, tag('final-ERROR')); }
    }
    if (page) {
      const todo = await estadoEntero(page);
      apunta('estado final', todo);
    }
  } finally {
    apunta('errores', errores.filter((e) => !/Service Worker|serviceWorker/.test(e)));
    fs.writeFileSync(path.join(L.FOTOS, quien + '-' + lang + '.json'), JSON.stringify(log, null, 1));
    if (ctx) await ctx.close();
    await L.cerrar();
  }
})();
