/* PACE · E2E · ESTADÍSTICAS «QUÉ TE AYUDA» (v0.183.0)
 * ===================================================
 * Ez, 1A 2A 3A del 27 oct. 2026 sobre docs/proposals/que-te-ayuda-27oct.html: tres ideas (lo que
 * te sienta bien según «¿Te ayudó?», a qué hora terminas tus Focos y si después de un Foco haces
 * la pausa), «Todavía es pronto» sin contadores mientras no llegue ninguna, y una pestaña más en
 * Estadísticas, con candado sin PACE completo, como Mes y Año.
 *
 * QUE DEFIENDE:
 *  · Cada idea sale con datos suficientes y nunca antes: cada umbral por los dos lados (el que
 *    llega sale, el que se queda a uno no), con el cálculo puro (`statsAyuda`).
 *  · Los Focos a medias no cuentan: salir antes no deja evento, y un `early` tampoco suma.
 *  · La pestaña con datos de seis semanas sembrados por el contrato del registro: las cifras
 *    como «5 de 6», sin «%», y el pie «No es un consejo médico». Sin datos, «Todavía es pronto»
 *    y ni una cifra; con una sola idea, esa y «Lo demás saldrá…».
 *  · Sin PACE completo, candado en la pestaña y la invitación sin cambiar de pestaña.
 *  · Sin scroll y a la altura de las otras pestañas a 360 × 718 y a 1280 × 720, en los dos idiomas.
 *
 * Contra v0.181.1 caen todas: no hay `statsAyuda` ni pestaña «Qué te ayuda».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarModalAsentado } = require('./helpers');

/* Martes 27 de octubre a las 12:00 en Madrid (ya en horario de invierno). */
const MARTES = new Date('2026-10-27T12:00:00+01:00');
const HOY = '2026-10-27';
const BASE = { lastActiveDay: 'Tue Oct 27 2026', _historyMigrated: true, _weeklyStatsReindexed_v0_28_8: true };

/* Los días laborables del 16 de septiembre al 26 de octubre: seis semanas. */
function laborables() {
  const out = [];
  for (let t = Date.UTC(2026, 8, 16); t <= Date.UTC(2026, 9, 26); t += 86400000) {
    const d = new Date(t);
    if (d.getUTCDay() % 6) out.push([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]);
  }
  return out;
}

/* Seis semanas como las de la maqueta. 35 Focos (25 de mañana y 10 de tarde; 28 de 25 min y 7 de
   45), con una pausa 5 min después en 17 de los de mañana y 4 de los de tarde; y 17 «¿Te ayudó?»:
   Cuello suave 5 de 6, Coherente 5·5 4 de 5, Levántate y sube 3 de 4 y Brazos libres, «No» dos veces. */
function seisSemanas() {
  const dias = laborables();
  const horas = [8, 8, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 12, 12,
    15, 15, 15, 16, 16, 16, 16, 17, 17, 17];
  const ev = [];
  horas.forEach((h, k) => {
    const [y, m, d] = dias[k % dias.length];
    const s = k >= 28 ? 2700 : 1500;
    ev.push({ tipo: 'sesion', mod: 'focus', y, m, d, h, mi: 0, s });
    const sigue = k < 25 ? k < 17 : k < 29;
    if (sigue) ev.push({ tipo: 'sesion', mod: 'stretch', id: 'move.neck.3', y, m, d, h, mi: s / 60 + 5, s: 180 });
  });
  const respuestas = [['move.neck.3', 'stretch', ['yes', 'yes', 'yes', 'yes', 'some', 'no']],
    ['breathe.coherent.55', 'breathe', ['yes', 'yes', 'yes', 'some', 'no']],
    ['extra.chair.squats', 'move', ['yes', 'yes', 'some', 'no']],
    ['move.shoulder.circles', 'stretch', ['no', 'no']]];
  let n = 0;
  for (const [id, mod, rs] of respuestas) for (const r of rs) {
    const [y, m, d] = dias[(n++ * 2) % dias.length];
    ev.push({ tipo: 'fb', id, mod, r, y, m, d, h: 13, mi: n });
  }
  return ev;
}

/* En la página: cada especificación como el evento que guarda el registro, por `makeEvent`. La
   hora es la de EMPEZAR y es la de aquí (el navegador va en Madrid); el evento lleva la de acabar. */
function construir(specs) {
  return specs.map((s, i) => {
    const inicio = new Date(s.y, s.m - 1, s.d, s.h, s.mi || 0);
    if (s.tipo === 'fb') {
      return window.makeEvent({ type: 'feedback.answered', runId: 'fb-' + i, occurredAt: inicio.toISOString(),
        payload: { routineId: s.id, module: s.mod, response: s.r } });
    }
    return window.makeEvent({ type: 'session.completed', runId: 'run-' + i,
      occurredAt: new Date(inicio.getTime() + s.s * 1000).toISOString(),
      payload: { module: s.mod, routineId: s.id || 'focus', completionReason: s.early ? 'early' : 'natural',
        elapsedSeconds: s.s, activeSeconds: s.s, plannedSeconds: s.s, plannedSecondsSource: 'preset' } });
  });
}

async function cargar(page, context, extra, viewport) {
  if (viewport) await page.setViewportSize(viewport);
  await sembrar(context, Object.assign({}, BASE, extra || {}));
  await page.clock.install({ time: MARTES });
  await irAlArtefacto(page);
  await page.waitForFunction(() => typeof window.eventsWebAppend === 'function' && typeof window.makeEvent === 'function');
}

/* El cálculo, con una lista de especificaciones. */
const calcular = (page, specs) => page.evaluate(([fn, s, hoy]) => {
  const ev = (new Function('return ' + fn))().call(null, s);
  if (ev.some((e) => !e)) throw new Error('makeEvent devolvió null');
  return window.statsAyuda(ev, hoy);
}, [construir.toString(), specs, HOY]);

async function sembrarEventos(page, specs) {
  await page.evaluate(async ([fn, s]) => {
    const ev = (new Function('return ' + fn))().call(null, s);
    for (const e of ev) {
      if (!e) throw new Error('makeEvent devolvió null');
      await window.eventsWebAppend(e);
    }
  }, [construir.toString(), specs]);
}

async function abrirAyuda(page, nombre) {
  await page.getByRole('button', { name: nombre || 'Ver estadísticas' }).click();
  await page.locator('[data-pace-stats-vistas]').waitFor({ state: 'visible' });
  await esperarModalAsentado(page);
  await page.locator('[data-pace-stats-tab="ayuda"]').click();
  await page.locator('[data-pace-ayuda-view]').waitFor({ state: 'visible' });
}

/* Días y horas para las pruebas de umbral: Focos de 25 min a las 10:00, uno por día y hora. */
const DIAS = laborables().slice(-10);
const focos = (n, nDias, extra) => Array.from({ length: n }, (_, k) => {
  const [y, m, d] = DIAS[k % nDias];
  return Object.assign({ tipo: 'sesion', mod: 'focus', y, m, d, h: 9 + Math.floor(k / nDias), mi: 0, s: 1500 }, extra || {});
});
const fb = (id, mod, rs, nDias) => rs.map((r, k) => {
  const [y, m, d] = DIAS[k % nDias];
  return { tipo: 'fb', id, mod, r, y, m, d, h: 13, mi: k };
});

test.describe('los umbrales, por los dos lados', () => {
  test.beforeEach(async ({ page, context }) => { await cargar(page, context); });

  test('lo que te sienta bien: 3 respuestas en 2 días, más de la mitad, y dos rutinas así', async ({ page }) => {
    const a = fb('move.neck.3', 'stretch', ['yes', 'yes', 'no'], 2);
    const b = fb('breathe.box.4', 'breathe', ['yes', 'some', 'yes'], 2);
    const r = await calcular(page, a.concat(b));
    expect(r.bien, 'con dos rutinas que llegan, sale').not.toBeNull();
    expect(r.bien.rutinas.map((x) => [x.id, x.a, x.b])).toEqual([['breathe.box.4', 3, 3], ['move.neck.3', 2, 3]]);
    expect(r.bien.respuestas).toBe(6);

    expect((await calcular(page, a.concat(b.slice(0, 2)))).bien, 'una rutina con 2 respuestas no entra').toBeNull();
    expect((await calcular(page, a.concat(fb('breathe.box.4', 'breathe', ['yes', 'some', 'yes'], 1)))).bien,
      'tres respuestas el mismo día no entran').toBeNull();
    expect((await calcular(page, fb('move.neck.3', 'stretch', ['yes', 'no', 'no'], 2).concat(b))).bien,
      'una rutina que ayudó 1 de 3 no es «te sienta bien»').toBeNull();
    expect((await calcular(page, fb('move.neck.3', 'stretch', ['yes', 'some', 'no', 'no'], 2).concat(b))).bien,
      'la mitad justa (2 de 4) tampoco').toBeNull();
    expect((await calcular(page, b)).bien, 'con una sola rutina no sale').toBeNull();
  });

  test('tu hora de Foco: 12 Focos en 5 días; uno menos, o en 4 días, no', async ({ page }) => {
    const r = await calcular(page, focos(12, 5));
    expect(r.hora, '12 Focos en 5 días').not.toBeNull();
    expect([r.hora.focos, r.hora.franja, r.hora.minutos, r.hora.duracion]).toEqual([12, 'manana', 25, 'todos']);
    expect((await calcular(page, focos(11, 5))).hora, '11 Focos no').toBeNull();
    expect((await calcular(page, focos(12, 4))).hora, '12 Focos en 4 días no').toBeNull();
  });

  test('los Focos a medias no cuentan: un `early` no suma', async ({ page }) => {
    const once = focos(11, 5);
    const r = await calcular(page, once.concat(focos(1, 1, { early: true, h: 18 })));
    expect(r.hora, '11 terminados y 1 cortado no son 12').toBeNull();
    expect(r.tras.b, '«después del Foco» cuenta 11, sin el cortado').toBe(11);
    expect((await calcular(page, once.concat(focos(1, 1, { h: 18 })))).hora, 'GUARD: con el duodécimo terminado sí').not.toBeNull();
  });

  test('la franja y sus horas, o «repartidos» si ninguna tiene la mitad', async ({ page }) => {
    const r = (await calcular(page, focos(15, 5))).hora;
    expect([r.franja, r.ventana.desde, r.ventana.hasta]).toEqual(['manana', 9, 11]);
    const repartidos = Array.from({ length: 12 }, (_, k) => {
      const [y, m, d] = DIAS[k % 6];
      return { tipo: 'sesion', mod: 'focus', y, m, d, h: [10, 16, 22][k % 3], mi: 0, s: 1500 };
    });
    const x = await calcular(page, repartidos);
    expect(x.hora.franja, 'cuatro por franja: ninguna tiene la mitad').toBeNull();
  });

  test('después del Foco: 10 Focos en 4 días, y la pausa cuenta si empieza en los 15 minutos siguientes', async ({ page }) => {
    const diez = focos(10, 4);
    const pausa = (k, tras) => Object.assign({}, diez[k], { mod: 'breathe', id: 'breathe.box.4', mi: 25 + tras, s: 240 });
    const r = await calcular(page, diez.concat([pausa(0, 2), pausa(1, 10), pausa(2, 15), pausa(3, 20)]));
    expect([r.tras.a, r.tras.b], 'a los 2, 10 y 15 minutos sí; a los 20 no').toEqual([3, 10]);
    expect(r.tras.manana, 'sin 10 de mañana y 10 de tarde no se separan').toBeNull();
    expect((await calcular(page, focos(9, 4))).tras, '9 Focos no').toBeNull();
    expect((await calcular(page, focos(10, 3))).tras, '10 Focos en 3 días no').toBeNull();
    const tarde = focos(10, 5, { h: 16 }).map((s, k) => Object.assign({}, s, { h: 15 + Math.floor(k / 5) }));
    const s = (await calcular(page, focos(10, 5).concat(tarde))).tras;
    expect([s.manana, s.tarde], 'con 10 y 10, por separado').toEqual([[0, 10], [0, 10]]);
  });
});

test('la pestaña con seis semanas: las tres ideas, con «de» y sin «%», y el pie', async ({ page, context }) => {
  await cargar(page, context);
  await sembrarEventos(page, seisSemanas());
  await abrirAyuda(page);
  const vista = page.locator('[data-pace-ayuda-view="ideas"]');
  await expect(vista).toBeVisible();
  await expect(vista.locator('[data-pace-ayuda-cab]')).toHaveText('Tus últimas 6 semanas');
  const bien = vista.locator('[data-pace-ayuda-idea="bien"]');
  await expect(bien.locator('[data-pace-ayuda-rutina]')).toHaveText([/Cuello suave\s*5 de 6/, /Coherente 5·5\s*4 de 5/, /Levántate y sube\s*3 de 4/]);
  await expect(bien).toContainText('17 respuestas a «¿Te ayudó esta pausa?» · 6 semanas');
  await expect(bien, 'Brazos libres solo tiene dos «No»').not.toContainText('Brazos libres');
  const hora = vista.locator('[data-pace-ayuda-idea="hora"]');
  await expect(hora).toContainText('Sobre todo por la mañana, de 9 a 12.');
  await expect(hora).toContainText('Casi todos, de 25 minutos.');
  await expect(hora).toContainText('35 Focos terminados · 6 semanas');
  const tras = vista.locator('[data-pace-ayuda-idea="tras"]');
  await expect(tras).toContainText('Tras 21 de tus 35 Focos, una pausa.');
  await expect(tras).toContainText('Por la mañana, 17 de 25. Por la tarde, 4 de 10.');
  expect(await vista.innerText(), 'una cifra con «%»').not.toMatch(/%/);
  await expect(page.locator('[data-pace-ayuda-pie]')).toContainText('No es un consejo médico.');
  await expect(page.locator('[data-pace-ayuda-resto]')).toHaveCount(0);
});

test('sin datos, «Todavía es pronto» y ni una cifra; con una sola idea, esa y «Lo demás saldrá…»', async ({ page, context }) => {
  await cargar(page, context);
  await abrirAyuda(page);
  const pronto = page.locator('[data-pace-ayuda-view="pronto"]');
  await expect(pronto).toContainText('Todavía es pronto.');
  expect(await pronto.innerText(), 'el estado de antes no cuenta nada').not.toMatch(/\d/);
  await expect(page.locator('[data-pace-ayuda-idea]')).toHaveCount(0);
  await page.keyboard.press('Escape');

  await sembrarEventos(page, seisSemanas().filter((s) => s.tipo === 'fb'));
  await abrirAyuda(page);
  await expect(page.locator('[data-pace-ayuda-idea]')).toHaveCount(1);
  await expect(page.locator('[data-pace-ayuda-idea="bien"]')).toBeVisible();
  await expect(page.locator('[data-pace-ayuda-resto]')).toHaveText('Lo demás saldrá cuando haya bastante para decirlo.');
});

for (const [ancho, alto] of [[1280, 720], [360, 718]]) {
  test(`sin PACE completo, «Qué te ayuda» lleva candado y abre la invitación sin cambiar de pestaña (${ancho} px)`, async ({ page, context }) => {
    await cargar(page, context, null, { width: ancho, height: alto });
    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    await page.getByRole('button', { name: 'Ver estadísticas' }).click();
    const tab = page.locator('[data-pace-stats-tab="ayuda"]');
    await expect(tab).toHaveAttribute('data-pace-stats-cerrada', '');
    await expect(tab.locator('[data-pace-candado]')).toHaveCount(1);
    await esperarModalAsentado(page);
    expect((await medir(page)).fuera, 'con los tres candados, una pestaña se sale de la barra').toBe(false);
    await tab.click();
    const hoja = page.locator('[data-pace-premium-hoja]');
    await expect(hoja, 'tocar «Qué te ayuda» no abre la invitación').toBeVisible();
    await expect(hoja).toContainText('Qué te ayuda');
    await expect(hoja).toContainText('Tu mes, tu año y qué te ayuda');
    await expect(page.locator('[data-pace-hoy-view]'), 'tocar «Qué te ayuda» cambió de pestaña').toHaveCount(1);
    await expect(page.locator('[data-pace-ayuda-view]')).toHaveCount(0);
  });
}

/* Lo que mide la ventana y si pide scroll, en la pestaña que esté abierta. */
const medir = (page) => page.evaluate(() => {
  const el = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0).pop();
  const tabs = [...document.querySelectorAll('[data-pace-stats-tabs] > button')];
  const barra = document.querySelector('[data-pace-stats-tabs]').getBoundingClientRect();
  return { alto: Math.round(el.getBoundingClientRect().height), corta: Math.max(0, el.scrollHeight - el.clientHeight),
    fuera: tabs.some((b) => b.getBoundingClientRect().right > barra.right + 0.5 || b.scrollWidth > b.clientWidth + 1) };
});

for (const [ancho, alto] of [[360, 718], [1280, 720]]) {
  for (const lang of ['es', 'en']) {
    test(`sin scroll y a la altura de las demás a ${ancho} × ${alto}, en ${lang}`, async ({ page, context }) => {
      await cargar(page, context, { lang, langAuto: false }, { width: ancho, height: alto });
      await sembrarEventos(page, seisSemanas());
      await abrirAyuda(page, lang === 'en' ? 'View stats' : 'Ver estadísticas');
      await expect(page.locator('[data-pace-ayuda-idea]')).toHaveCount(3);
      const m = { ayuda: await medir(page) };
      for (const k of ['today', 'week', 'month', 'year']) {
        await page.locator(`[data-pace-stats-tab="${k}"]`).click();
        await page.waitForTimeout(300);
        m[k] = await medir(page);
      }
      const altos = Object.values(m).map((x) => x.alto);
      expect(Math.max(...altos) - Math.min(...altos), '«Qué te ayuda» no mide lo que las demás · ' + JSON.stringify(m)).toBeLessThanOrEqual(2);
      for (const k of Object.keys(m)) expect(m[k].corta, k + ' pide scroll · ' + JSON.stringify(m)).toBeLessThanOrEqual(1);
      expect(m.ayuda.fuera, 'una pestaña se sale de la barra o se corta').toBe(false);
    });
  }
}
