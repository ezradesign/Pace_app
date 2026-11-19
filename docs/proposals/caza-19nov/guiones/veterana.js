'use strict';
// Una persona que lleva cuatro semanas: eventos en IndexedDB, history, semana, racha, logros y su semana de jornada.
const { WT } = require('./lib');
const viejo = require(WT + '/tests/fixtures/estado-viejo/v0.191.1.json');

function iso(d) { const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
let n = 0;
const uid = () => '00000000-0000-4000-8000-' + String(++n).padStart(12, '0');

function construir(hoy) { // hoy: Date (el día en que abre; no se siembra nada de hoy)
  const ev = [];
  const days = {}, months = {}, years = {};
  const sumar = (k, campo, v) => { [days, months, years].forEach((o, i) => { const key = i === 0 ? k : i === 1 ? k.slice(0, 7) : k.slice(0, 4); o[key] = o[key] || { focusMinutes: 0, breathMinutes: 0, moveMinutes: 0, waterGlasses: 0, holdSeconds: 0 }; o[key][campo] += v; }); };
  const ses = (d, h, m, module, routineId, min) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
    ev.push({ id: uid(), v: 2, type: 'session.completed', occurredAt: t.toISOString(), localDay: iso(d), timezoneOffsetMin: t.getTimezoneOffset(), context: 'standalone', runId: uid(), pathRunId: null,
      payload: { module, routineId, completionReason: 'natural', elapsedSeconds: min * 60 + 2, activeSeconds: min * 60, plannedSeconds: min * 60, plannedSecondsSource: 'preset', variant: null, origin: 'aro', fromMenu: false, creditedMinutes: min } });
    sumar(iso(d), module === 'focus' ? 'focusMinutes' : module === 'breathe' ? 'breathMinutes' : 'moveMinutes', min);
  };
  const weekly = { focusMinutes: [0,0,0,0,0,0,0], breathMinutes: [0,0,0,0,0,0,0], moveMinutes: [0,0,0,0,0,0,0], waterGlasses: [0,0,0,0,0,0,0], holdSeconds: [0,0,0,0,0,0,0] };
  const lunesHoy = new Date(hoy); lunesHoy.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); lunesHoy.setHours(0, 0, 0, 0);
  const fechas = [];
  for (let i = 30; i >= 1; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
    const dow = (d.getDay() + 6) % 7;
    if (dow >= 5) continue;
    fechas.push(d);
    ses(d, 9, 30, 'focus', 'focus', 25); ses(d, 10, 30, 'focus', 'focus', 25);
    ses(d, 11, 0, i % 2 ? 'move' : 'stretch', i % 2 ? 'extra.legs.standing' : 'move.neck.3', 5);
    ses(d, 12, 0, 'focus', 'focus', 45);
    if (i % 3) ses(d, 16, 45, 'breathe', 'breathe.physiological', 3);
    sumar(iso(d), 'waterGlasses', 6);
    if (d >= lunesHoy) { weekly.focusMinutes[dow] += 95; weekly.moveMinutes[dow] += 5; weekly.breathMinutes[dow] += (i % 3 ? 3 : 0); weekly.waterGlasses[dow] += 6; }
  }
  const ayer = fechas[fechas.length - 1];
  const est = JSON.parse(viejo.localStorage['pace.state.v2']);
  Object.assign(est, {
    lang: 'es', novedadesVistas: '*', copiaAvisoVisto: '*', firstSeen: hoy.getTime() - 31 * 864e5,
    history: { days, months, years }, weeklyStats: weekly,
    streak: { current: 4, longest: 12, lastActiveDate: ayer.toDateString() }, lastActiveDay: ayer.toDateString(),
    water: { goal: 8, today: 0, lastReset: ayer.toDateString() },
    totalFocusMin: 2000, breatheSessionsTotal: 14, moveSessionsTotal: 20, cycle: 0,
    achievements: Object.assign({}, est.achievements, { 'first.breath': { unlockedAt: hoy.getTime() - 20 * 864e5 }, 'streak.3': { unlockedAt: hoy.getTime() - 9 * 864e5 } }),
    ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }, libre: null, dia: null, semanaTipo: ['jornada','jornada','jornada','jornada','jornada','libre','libre'], hechas: null },
    routineFeedback: { 'move.neck.3': { yes: 4, some: 1, no: 0, lastPromptDay: iso(ayer) }, 'extra.legs.standing': { yes: 2, some: 2, no: 1, lastPromptDay: iso(ayer) } },
    ultimaCopia: null,
  });
  const cont = JSON.parse(viejo.eventos.valor);
  cont.events = ev; cont.activatedAt = new Date(hoy.getTime() - 31 * 864e5).toISOString();
  return { ls: { 'pace.state.v2': JSON.stringify(est), 'pace-cara': 'app' }, eventos: { version: viejo.eventos.version, valor: JSON.stringify(cont) } };
}

async function sembrarVeterana(page, BASE, hoy) {
  const s = construir(hoy);
  await page.route('**/siembra.html', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>s</title>' }));
  await page.goto(BASE + '/siembra.html');
  await page.evaluate(async ([ls, eventos]) => {
    Object.keys(ls).forEach(k => localStorage.setItem(k, ls[k]));
    await new Promise((ok, mal) => { const req = indexedDB.open('pace.events', eventos.version); req.onupgradeneeded = () => req.result.createObjectStore('contenedor'); req.onerror = () => mal(req.error);
      req.onsuccess = () => { const tx = req.result.transaction('contenedor', 'readwrite'); tx.objectStore('contenedor').put(eventos.valor, 'pace.events.v1'); tx.oncomplete = () => { req.result.close(); ok(); }; tx.onerror = () => mal(tx.error); }; });
  }, [s.ls, s.eventos]);
}
module.exports = { sembrarVeterana };
