/* Alguien que lleva seis semanas usando PACE: la semana guardada (L-V jornada, sábado media,
   domingo libre), el historial día a día, la semana en curso, unos logros con fecha, agua y
   «¿Te ayudó?», y los eventos del registro por `makeEvent`, como tests/stats-ayuda.spec.js. */
'use strict';

const pad = (n) => String(n).padStart(2, '0');
const clave = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

/* `hoy` es un Date local (el reloj de la página). Devuelve { estado, eventos }. */
function veterana(hoy, extra) {
  const dias = {};
  const ev = [];
  const inicio = new Date(hoy); inicio.setDate(inicio.getDate() - 42); inicio.setHours(0, 0, 0, 0);
  let n = 0;
  for (let d = new Date(inicio); d < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()); d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0) continue;                       // domingo libre
    const media = dow === 6;
    const focos = media ? 2 : 3 + (n % 3);
    const breath = (n % 2) ? 6 : 4, move = (n % 3) ? 8 : 12, water = media ? 4 : 5 + (n % 4);
    dias[clave(d)] = { focusMinutes: focos * 25, breathMinutes: breath, moveMinutes: move, waterGlasses: water };
    for (let k = 0; k < focos; k++) {
      const h = 9 + k * (media ? 1 : 2);
      ev.push({ tipo: 'sesion', mod: 'focus', y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h, mi: 0, s: 1500 });
      if (k % 2 === 0) ev.push({ tipo: 'sesion', mod: k ? 'stretch' : 'breathe', id: k ? 'move.neck.3' : 'breathe.coherent.55', y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h, mi: 30, s: 240 });
    }
    if (n % 4 === 0) ev.push({ tipo: 'fb', id: 'move.neck.3', mod: 'stretch', r: n % 8 ? 'yes' : 'some', y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: 13, mi: 1 });
    if (n % 5 === 0) ev.push({ tipo: 'fb', id: 'breathe.coherent.55', mod: 'breathe', r: 'yes', y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(), h: 13, mi: 2 });
    n++;
  }
  /* La semana en curso, lunes primero, hasta ayer. */
  const ws = { focusMinutes: [0, 0, 0, 0, 0, 0, 0], breathMinutes: [0, 0, 0, 0, 0, 0, 0], moveMinutes: [0, 0, 0, 0, 0, 0, 0], waterGlasses: [0, 0, 0, 0, 0, 0, 0], holdSeconds: [0, 0, 0, 0, 0, 0, 0] };
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7)); lunes.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes); d.setDate(lunes.getDate() + i);
    const x = dias[clave(d)];
    if (!x) continue;
    ws.focusMinutes[i] = x.focusMinutes; ws.breathMinutes[i] = x.breathMinutes; ws.moveMinutes[i] = x.moveMinutes; ws.waterGlasses[i] = x.waterGlasses;
  }
  const t0 = inicio.getTime();
  const logro = (dd) => ({ unlockedAt: t0 + dd * 86400000 });
  const achievements = {
    'first.step': logro(0), 'first.breath': logro(0), 'first.stretch': logro(1), 'first.sip': logro(0), 'first.extra': logro(2),
    'first.cycle': logro(1), 'first.day': logro(3), 'first.plan': logro(4), 'streak.3': logro(3), 'streak.7': logro(8),
    'streak.14': logro(16), 'focus.hours.10': logro(9), 'explore.box': logro(5), 'explore.coherent': logro(6), 'explore.neck': logro(7),
    'explore.desk': logro(10), 'morning.5': logro(12), 'stats.month.first': logro(30), 'secret.dark.mode': logro(20), 'explore.tweaks': logro(2),
  };
  const estado = Object.assign({
    firstSeen: t0, lastActiveDay: new Date(hoy.getTime() - 86400000).toDateString(), _historyMigrated: true,
    _weeklyStatsReindexed_v0_28_8: true, history: { days: dias, months: {}, years: {} }, weeklyStats: ws,
    achievements, cycle: 0, totalFocusMin: Object.values(dias).reduce((a, x) => a + x.focusMinutes, 0),
    breatheSessionsTotal: 21, moveSessionsTotal: 30, streak: { current: 5, longest: 12, lastActiveDate: new Date(hoy.getTime() - 86400000).toDateString() },
    routineCounts: { coherent: 21, neck: 14 },
    routineFeedback: { 'move.neck.3': { yes: 8, some: 3, no: 0 }, 'breathe.coherent.55': { yes: 7, some: 0, no: 0 } },
    water: { goal: 8, today: 0, lastReset: new Date(hoy.getTime() - 86400000).toDateString() },
    ritmo: { semanaTipo: ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'media', 'libre'] },
    profile: { need: 'focus', time: 'pause', environment: 'office', completedAt: t0 },
  }, extra || {});
  return { estado, eventos: ev };
}

/* En la página: cada especificación como el evento que guarda el registro (copiado de
   tests/stats-ayuda.spec.js). */
function construir(specs) {
  return specs.map((s, i) => {
    const inicio = new Date(s.y, s.m - 1, s.d, s.h, s.mi || 0);
    if (s.tipo === 'fb') {
      return window.makeEvent({ type: 'feedback.answered', runId: 'fb-' + i, occurredAt: inicio.toISOString(),
        payload: { routineId: s.id, module: s.mod, response: s.r } });
    }
    return window.makeEvent({ type: 'session.completed', runId: 'run-' + i,
      occurredAt: new Date(inicio.getTime() + s.s * 1000).toISOString(),
      payload: { module: s.mod, routineId: s.id || 'focus', completionReason: 'natural',
        elapsedSeconds: s.s, activeSeconds: s.s, plannedSeconds: s.s, plannedSecondsSource: 'preset' } });
  });
}

async function sembrarEventos(page, specs) {
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
  return page.evaluate(async ([fn, s]) => {
    const ev = (new Function('return ' + fn))().call(null, s);
    let mal = 0;
    for (const e of ev) { if (!e) { mal++; continue; } await window.eventsWebAppend(e); }
    return { n: ev.length, mal };
  }, [construir.toString(), specs]);
}

module.exports = { veterana, sembrarEventos, clave };
