/* PACE · E2E · EL CALENDARIO QUE SE MANTIENE SOLO
 * ===============================================
 * Con «Mantenerlo al día solo» (Ez, 14 oct. 2026, A en las cuatro preguntas de
 * docs/traspaso/archivos/calendario-solo-14oct/), el día de «A tu ritmo» se
 * corrige solo en el calendario mientras PACE está abierto.
 *
 * QUE DEFIENDE:
 *  · LA FORMA (2A): la pausa abre el evento y avisa; el primer bloque y el de
 *    después de comer van solos y sin aviso; el cierre, solo y con aviso. Con el
 *    Foco en marcha, la pausa de detrás no avisa (3A).
 *  · QUÉ TOCAR, en una tabla de casos: se cambia el que está, se crea lo que
 *    falta, se quita lo que sobra; lo que ya pasó no se reescribe y un evento
 *    empezado no cambia de aviso. Que pase el tiempo no deja nada pendiente.
 *  · ANDROID con un calendario espía que recuerda lo escrito: conectar, una
 *    reunión nueva que recoloca el día (se cambian los eventos, sin duplicar), el
 *    Foco en marcha, «por libre», y desconectar quitando lo de hoy.
 *  · GOOGLE: dentro de la hora se cambia con PATCH; pasada, el enlace dice «Poner
 *    al día» y ese clic vuelve a pedir permiso.
 *  · MICROSOFT: pasada la hora, se renueva sin ventana con el pase de un día.
 *  · Que lo de PACE va como LIBRE también al CAMBIARLO (Ez, 18 oct. 2026): así
 *    lo que se escribió ocupado antes pasa a libre en el primer cambio.
 *  · Sin PACE completo (después de v1), la casilla lleva candado y abre la invitación.
 *
 * NO CUBRE: un móvil, Google ni Microsoft de verdad (los ids los da Ez:
 * docs/CALENDARIO_ALTAS.md), ni lo que suena: que el calendario avise lo dice el
 * calendario de cada uno.
 *
 * El reloj va a las 9:00 de un jueves en Madrid, como en ritmo-calendario.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const ms = (hhmm) => Date.parse(FECHA + 'T' + hhmm + ':00+02:00');
const MINUTO = 61 * 1000;

async function abrir(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { dia: JORNADA } }, extra || {}));
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const TEXTOS = `(() => {
  const t = (k) => PACE_STRINGS.es[k] || k;
  const tn = (k, v) => t(k).replace(/\\{(\\w+)\\}/g, (_, x) => v[x]);
  return { t, tn, lang: 'es' };
})()`;

/* ------------------------------------------------------------------ la forma */
test('la pausa abre el evento: 10 eventos y 8 avisos, y con el Foco en marcha la pausa de detrás calla', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((TEXTOS) => {
    const { t, tn } = eval(TEXTOS);
    const m = ritmoPlan(getState()).m;
    const evs = calendarioEventosConAviso(m, t, tn, 'es', null);
    const callados = calendarioEventosConAviso(m, t, tn, 'es', evs[1].desde);
    return { evs, callados: callados.map((e) => e.aviso), comida: m.items.find((it) => it.tipo === 'comida') };
  }, TEXTOS);
  const evs = r.evs;
  expect(evs).toHaveLength(10);
  expect(evs.filter((e) => e.aviso)).toHaveLength(8);
  expect(new Set(evs.map((e) => e.clave)).size).toBe(10);
  expect(evs[0]).toMatchObject({ clave: 'b1', titulo: 'Foco 1 de 9', desde: 540, hasta: 585, aviso: false });
  expect(evs[1].titulo).toMatch(/^(Estira|Mueve|Respira): .+ · luego foco 2 de 9$/);
  expect(evs[1]).toMatchObject({ clave: 'b2', desde: 585, aviso: true });
  expect(evs[1].texto).toContain('Después, 45 min de foco.');
  expect(evs[1].texto).toContain('pacegrass.app');
  expect(evs.find((e) => /^Pausa larga · luego foco 4 de 9$/.test(e.titulo))).toBeTruthy();
  /* El bloque de después de comer va solo y sin aviso; el cierre, solo y con aviso. */
  const tras = evs.find((e) => e.desde === r.comida.desde + r.comida.dur);
  expect(tras).toMatchObject({ titulo: 'Foco 7 de 9', aviso: false });
  expect(evs[9]).toMatchObject({ clave: 'cierre', titulo: 'Cierre del día', hasta: 1020, aviso: true });
  /* Seguidos, sin huecos ni solapes, salvo la comida. */
  evs.slice(1).forEach((e, i) => {
    const antes = evs[i];
    expect(e.desde === antes.hasta || (antes.hasta === r.comida.desde && e.desde === r.comida.desde + r.comida.dur)).toBe(true);
  });
  expect(r.callados[1]).toBe(false);
  expect(r.callados.filter((a, i) => a !== evs[i].aviso)).toHaveLength(1);
});

/* ------------------------------------------------------------------ qué tocar */
test('qué tocar: una tabla de casos', async ({ page, context }) => {
  await abrir(page, context);
  const fallos = await page.evaluate((h) => {
    const at = (x) => h[x];
    const ev = (clave, a, b, aviso, titulo) => ({ clave, inicio: at(a), fin: at(b), titulo: titulo || clave, texto: 't', aviso: !!aviso });
    const ex = (id, e) => Object.assign({ id }, e);
    const D = [ev('b1', '09:00', '09:45'), ev('b2', '09:45', '10:35', true), ev('b3', '10:35', '11:25', true)];
    const E = D.map((d, i) => ex('id' + i, d));
    const diez = at('10:00');
    const resumen = (c) => ({ crear: c.crear.map((x) => x.clave + (x.aviso ? '!' : '')), cambiar: c.cambiar.map((x) => x.id + ':' + x.ev.clave + (x.ev.aviso ? '!' : '')), borrar: c.borrar });
    const casos = [
      ['igual, nada', D, E, diez, { crear: [], cambiar: [], borrar: [] }],
      ['b3 se mueve 10 min: se cambia el mismo', [D[0], D[1], ev('b3', '10:45', '11:35', true)], E, diez, { crear: [], cambiar: ['id2:b3!'], borrar: [] }],
      ['por libre: se quita lo que no ha acabado', [], E, diez, { crear: [], cambiar: [], borrar: ['id1', 'id2'] }],
      ['falta b3: se crea', D, E.slice(0, 2), diez, { crear: ['b3!'], cambiar: [], borrar: [] }],
      ['uno empezado se crea sin aviso', D, [E[0], E[2]], diez, { crear: ['b2'], cambiar: [], borrar: [] }],
      ['sin clave o repetido, se quita si no ha acabado', D, E.concat([ex('viejo', Object.assign({}, D[2], { clave: null })), ex('pasado', Object.assign({}, D[0], { clave: null })), ex('doble', D[2])]), diez,
        { crear: [], cambiar: [], borrar: ['viejo', 'doble'] }],
      ['empezado: el aviso no cuenta', [D[0], ev('b2', '09:45', '10:35', false), D[2]], E, diez, { crear: [], cambiar: [], borrar: [] }],
      ['empezado y cambiado: conserva su aviso', [D[0], ev('b2', '09:45', '10:40', false), D[2]], E, diez, { crear: [], cambiar: ['id1:b2!'], borrar: [] }],
      ['acabó antes de tiempo: corrige su fin', [ev('b1', '09:00', '09:45'), ev('b2', '09:45', '09:58', true), D[2]], E, diez, { crear: [], cambiar: ['id1:b2!'], borrar: [] }],
      ['lo que ya pasó no se reescribe', [ev('b1', '09:00', '09:40', false, 'otro'), D[1], D[2]], E, diez, { crear: [], cambiar: [], borrar: [] }],
    ];
    const out = [];
    casos.forEach(([nombre, d, e, ahora, quiero]) => {
      const r = resumen(calendarioCambios(d, e, ahora));
      if (JSON.stringify(r) !== JSON.stringify(quiero)) out.push(nombre + ': ' + JSON.stringify(r));
    });
    const escrito = { fecha: '2026-09-17', destino: 'android', eventos: Object.fromEntries(E.map((e) => [e.clave, e])) };
    const des = { fecha: '2026-09-17', eventos: D };
    if (calendarioPendiente(des, escrito, 'android', diez)) out.push('igual sale pendiente');
    if (calendarioPendiente(des, escrito, 'android', at('11:30'))) out.push('que pase el tiempo lo pone pendiente');
    if (!calendarioPendiente(des, Object.assign({}, escrito, { fecha: '2026-09-16' }), 'android', diez)) out.push('lo de ayer no cuenta como escrito');
    if (!calendarioPendiente(des, escrito, 'google', diez)) out.push('lo de otro calendario no cuenta como escrito');
    if (calendarioPendiente(null, null, 'android', diez)) out.push('eligiendo el día no hay nada pendiente');
    return out;
  }, Object.fromEntries(['09:00', '09:40', '09:45', '09:58', '10:00', '10:35', '10:40', '10:45', '11:25', '11:30', '11:35'].map((x) => [x, ms(x)])));
  expect(fallos).toEqual([]);
});

/* ------------------------------------------------------------------ Android */
/* Un calendario del móvil espía que recuerda lo escrito (y lo cambia con modifyEvent). */
async function comoAndroid(context, eventos) {
  await context.addInitScript((iniciales) => {
    const nativo = window.__nativo = { llamadas: [], eventos: iniciales.slice(), siguiente: 100 };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      return Promise.resolve(contesta(opts));
    };
    window.Capacitor = {
      getPlatform: () => 'android', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
        CapacitorCalendar: {
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => ({ result: 'granted' })),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: 'granted', writeCalendar: 'granted' } })),
          listCalendars: apunta('listCalendars', () => ({ result: [{ id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true }] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: '1' } })),
          listEventsInRange: apunta('listEventsInRange', (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) })),
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: apunta('modifyEvent', (op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (e) Object.assign(e, op); }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
      },
    };
  }, eventos || []);
}
const llamadas = (page, metodo) => page.evaluate((m) => window.__nativo.llamadas.filter((l) => l.metodo === m).map((l) => l.opts), metodo);
const dePace = (page) => page.evaluate(() => window.__nativo.eventos.filter((e) => (e.description || '').includes('pacegrass.app')));

async function hojaMovil(page) {
  await vis(page, '[data-pace-ritmo-ver]').click();
  await vis(page, '[data-pace-ritmo-lista]').waitFor();
  await vis(page, '[data-pace-ritmo-calendario]').click();
  return page.locator('[data-pace-cal]');
}

test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('conectar, una reunión que recoloca, el Foco en marcha y por libre: siempre los mismos eventos, cambiados', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await comoAndroid(context);
    await abrir(page, context, { sidebarCollapsed: true });
    let hoja = await hojaMovil(page);
    await expect(hoja.locator('[data-pace-cal-mantener]')).toBeChecked();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hecho: desde ahora tu calendario se mantiene solo.');
    const creados = await llamadas(page, 'createEvent');
    expect(creados).toHaveLength(10);
    expect(creados.filter((c) => c.alerts.length === 1 && c.alerts[0] === 0)).toHaveLength(8);
    expect(creados.filter((c) => c.alerts.length === 0)).toHaveLength(2);
    expect(creados[0].title).toBe('Foco 1 de 9');
    /* Ya conectado: cómo va, «Desconectar», y la casilla ya no sale. */
    await expect(hoja.locator('[data-pace-cal-resumen]')).toHaveText('Tu calendario se mantiene solo: lo que queda de hoy, de 9:00 a 17:00, con aviso en cada pausa.');
    await expect(hoja.locator('[data-pace-cal-solo="si"] .pace-rt-cal-s')).toHaveText('Al día · lo último, a las 9:00');
    await expect(hoja.locator('[data-pace-cal-desconectar]')).toHaveText('Desconectar');
    await expect(hoja.locator('[data-pace-cal-mantener]')).toHaveCount(0);
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.calendario)).mantener).toBe(true);
    await page.getByRole('button', { name: 'Listo', exact: true }).click();

    /* Una reunión nueva a las 12:00: el día se recoloca y el calendario le sigue al minuto. */
    await page.evaluate((r) => { window.__nativo.eventos.push(r); }, { id: 'r1', title: 'Equipo', startDate: ms('12:00'), endDate: ms('12:30'), isAllDay: false, availability: 0, status: 'confirmed', description: '' });
    await page.evaluate(() => calendarioRefrescarReuniones(true));
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'modifyEvent')).length).toBeGreaterThan(0);
    let mios = await dePace(page);
    expect(mios.length).toBeGreaterThanOrEqual(10);
    mios.forEach((e) => expect(e.startDate < ms('12:30') && e.endDate > ms('12:00'), e.title).toBe(false));
    expect(new Set(mios.map((e) => e.id)).size).toBe(mios.length);
    const escrito = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.calendario.escrito')));
    expect(Object.keys(escrito.eventos)).toHaveLength(mios.length);
    expect(await page.evaluate(() => window.__nativo.eventos.some((e) => e.id === 'r1'))).toBe(true);

    /* El Foco en marcha: la pausa que viene detrás se queda sin aviso; avisa PACE. */
    const antes = (await llamadas(page, 'modifyEvent')).length;
    await page.evaluate(() => {
      localStorage.setItem('pace.timer.v1', JSON.stringify({ endsAt: Date.now() + 45 * 60000 }));
      calendarioSoloRevisar();
    });
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'modifyEvent')).length).toBe(antes + 1);
    const callado = (await llamadas(page, 'modifyEvent')).pop();
    expect(callado.startDate).toBe(ms('09:45'));
    expect(callado.alerts).toEqual([]);
    (await llamadas(page, 'modifyEvent')).concat(await llamadas(page, 'createEvent'))
      .forEach((l) => expect(l.availability, 'libre (EventAvailability.FREE)').toBe(1));

    /* Por libre: se quita lo que no ha acabado. */
    await page.evaluate(() => { localStorage.removeItem('pace.timer.v1'); ritmoGuardar(() => ({ libre: ritmoHoy() })); });
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await dePace(page)).length).toBe(0);
    expect(await page.evaluate(() => window.__nativo.eventos.map((e) => e.id))).toEqual(['r1']);
    expect(errores).toEqual([]);
  });

  test('desconectar con «Quitarlo» quita lo de hoy, y el enlace vuelve a «Al calendario»', async ({ page, context }) => {
    await comoAndroid(context);
    await abrir(page, context, { sidebarCollapsed: true });
    let hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-desconectar]')).toBeVisible();
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await vis(page, '[data-pace-ritmo-ver]').click();
    await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('Calendario al día');
    await vis(page, '[data-pace-ritmo-calendario]').click();
    hoja = page.locator('[data-pace-cal]');
    await hoja.locator('[data-pace-cal-desconectar]').click();
    await expect(hoja.locator('[data-pace-cal-aviso="pregunta"]')).toContainText('PACE deja de tocar tu calendario. ¿Y lo que queda de hoy?');
    await hoja.locator('[data-pace-cal-quitar]').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toHaveText('Desconectado. Lo que quedaba de hoy ya no está en tu calendario.');
    expect(await dePace(page)).toHaveLength(0);
    expect(await page.evaluate(() => localStorage.getItem('pace.calendario.escrito'))).toBeNull();
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.calendario)).mantener).toBe(false);
    await expect(hoja.locator('[data-pace-cal-mantener]')).toBeVisible();
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await vis(page, '[data-pace-ritmo-ver]').click();
    await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('Al calendario');
  });

  test('sin PACE completo, la casilla lleva candado, abre la invitación y «Añadir» sigue como siempre', async ({ page, context }) => {
    await comoAndroid(context);
    await abrir(page, context, { sidebarCollapsed: true });
    await page.evaluate(() => { window.PREMIUM_ABIERTO_HASTA_V1 = false; });
    const hoja = await hojaMovil(page);
    const cerrada = hoja.locator('[data-pace-cal-mantener-cerrado]');
    await expect(cerrada).toContainText('Con PACE completo.');
    await expect(cerrada.locator('[data-pace-candado]')).toHaveCount(1);
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('bloques en tu calendario');
    (await llamadas(page, 'createEvent')).forEach((c) => expect(c.alerts).toEqual([]));
    await cerrada.click();
    await expect(page.locator('[data-pace-premium-hoja]')).toBeVisible();
  });
});

/* ------------------------------------------------------------------ Google y Microsoft */
/* Un Google o un Microsoft de mentira que recuerda los eventos (POST, PATCH,
   DELETE y la lista por la marca del día). */
async function calendarioWebFalso(context, prov) {
  const google = prov === 'google';
  const vistas = [];
  const eventos = [];
  const falso = { vistas, eventos, romper: false };
  let siguiente = 1;
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
  await context.route('https://' + (google ? 'accounts.google.com' : 'login.microsoftonline.com') + '/**', (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const url = new URL(req.url());
    if (url.pathname.endsWith('/token')) {
      const cuerpo = req.postData() || '';
      vistas.push({ metodo: 'TOKEN', url: req.url(), cuerpo });
      const renovar = /grant_type=refresh_token/.test(cuerpo);
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors,
        body: JSON.stringify({ access_token: renovar ? 'pase-renovado' : 'pase-ms', expires_in: 3600, refresh_token: 'renovar-ms', refresh_token_expires_in: 86400 }) });
    }
    vistas.push({ metodo: 'VENTANA', url: req.url() });
    const vuelta = google ? 'access_token=pase-g&expires_in=3600&token_type=Bearer' : 'code=codigo-ms';
    return route.fulfill({ status: 302, headers: { location: url.searchParams.get('redirect_uri') + '#' + vuelta + '&state=' + url.searchParams.get('state') } });
  });
  await context.route('https://' + (google ? 'www.googleapis.com' : 'graph.microsoft.com') + '/**', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const url = new URL(req.url());
    let cuerpo = null;
    try { cuerpo = req.postDataJSON(); } catch (e) {}
    vistas.push({ metodo: req.method(), url: req.url(), cuerpo, auth: req.headers().authorization });
    /* `romper`: el calendario no contesta bien (un 500, que PACE lee como un fallo de red) */
    if (falso.romper) return route.fulfill({ status: 500, headers: cors, body: '' });
    const json = (o, status) => route.fulfill({ status: status || 200, contentType: 'application/json', headers: cors, body: JSON.stringify(o) });
    const id = decodeURIComponent(url.pathname.split('/').pop());
    if (req.method() === 'POST') { const e = Object.assign({ id: 'e' + siguiente++ }, cuerpo); eventos.push(e); return json({ id: e.id }); }
    if (req.method() === 'PATCH') { Object.assign(eventos.find((e) => e.id === id) || {}, cuerpo); return json({}); }
    if (req.method() === 'DELETE') { eventos.splice(eventos.findIndex((e) => e.id === id), 1); return route.fulfill({ status: 204, headers: cors, body: '' }); }
    if (google) {
      if (url.searchParams.get('privateExtendedProperty')) return json({ items: eventos });
      return json({ items: [] });
    }
    if (url.pathname.endsWith('/calendarView')) return json({ value: [] });
    return json({ value: eventos.map((e) => Object.assign({}, e, {
      start: { dateTime: e.start.dateTime }, end: { dateTime: e.end.dateTime },
      singleValueExtendedProperties: (e.singleValueExtendedProperties || []).filter((p) => /paceClave$/.test(p.id)),
    })) });
  });
  return falso;
}

test('con Google: dentro de la hora se cambia lo que está; pasada, «Poner al día» vuelve a pedir permiso', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const g = await calendarioWebFalso(context, 'google');
  await abrir(page, context);
  await page.evaluate(() => { CALENDARIO_IDS.google = 'id-de-prueba'; });
  await vis(page, '[data-pace-ritmo-calendario]').click();
  const hoja = page.locator('[data-pace-cal]');
  /* Sin leer reuniones, para que releerlas cada 5 min no mueva el día por su cuenta: aquí lo
     cambia la comida. Con la casilla desmarcada, unas reuniones puestas a mano ya no cuentan
     (tests/ritmo-reuniones-bordes.spec.js). */
  await hoja.locator('[data-pace-cal-reuniones]').uncheck();
  await hoja.locator('[data-pace-cal-destino="google"] button').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se mantiene solo', { timeout: 15_000 });
  const posts = g.vistas.filter((v) => v.metodo === 'POST');
  expect(posts).toHaveLength(10);
  expect(posts.filter((p) => p.cuerpo.reminders.overrides.length === 1 && p.cuerpo.reminders.overrides[0].minutes === 0)).toHaveLength(8);
  posts.forEach((p) => expect(p.cuerpo.extendedProperties.private).toMatchObject({ pace: 'ritmo', paceDia: FECHA, paceClave: expect.stringMatching(/^(b\d+|cierre)$/) }));
  await expect(hoja.locator('[data-pace-cal-solo="si"] .pace-rt-cal-s')).toHaveText('Al día · conectado hasta las 10:00');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
  await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('Calendario al día');

  /* Dentro de la hora, la comida más corta mueve la tarde: PATCH a los mismos eventos. */
  await page.evaluate(() => ritmoHorario('comidaDur', 45));
  await page.clock.runFor(MINUTO);
  await expect.poll(() => g.vistas.filter((v) => v.metodo === 'PATCH').length).toBeGreaterThan(0);
  const quiero = await page.evaluate((TEXTOS) => calendarioDeseados(getState(), eval(TEXTOS)).eventos.length, TEXTOS);
  expect(g.eventos).toHaveLength(quiero);
  expect(new Set(g.eventos.map((e) => e.extendedProperties.private.paceClave)).size).toBe(quiero);

  /* Pasada la hora y con otro cambio: el enlace dice «Poner al día» y no se escribe nada. */
  await page.clock.runFor(60 * 60 * 1000);
  const hechos = g.vistas.length;
  await page.evaluate(() => ritmoHorario('comidaDur', 30));
  await page.clock.runFor(MINUTO);
  await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('Poner al día');
  expect(g.vistas.slice(hechos).filter((v) => v.metodo !== 'GET')).toEqual([]);
  await vis(page, '[data-pace-ritmo-calendario]').click();
  await expect(hoja.locator('[data-pace-cal-resumen]')).toContainText('y tu calendario aún no lo sabe.');
  await expect(hoja.locator('[data-pace-cal-aviso="nota"]')).toContainText('Google deja escribir a PACE una hora cada vez.');
  await hoja.locator('[data-pace-cal-poner]').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toHaveText('Tu calendario ya está al día.', { timeout: 15_000 });
  expect(g.vistas.slice(hechos).filter((v) => v.metodo === 'VENTANA')).toHaveLength(1);
  expect(g.vistas.slice(hechos).filter((v) => v.metodo === 'PATCH').length).toBeGreaterThan(0);
  g.vistas.filter((v) => v.metodo === 'POST' || v.metodo === 'PATCH').forEach((v) => expect(v.cuerpo.transparency, v.metodo).toBe('transparent'));
  expect(errores).toEqual([]);
});

test('con Microsoft: pasada la hora, se renueva sin ventana y sigue cambiando lo que está', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const m = await calendarioWebFalso(context, 'microsoft');
  await abrir(page, context);
  await page.evaluate(() => { CALENDARIO_IDS.microsoft = 'id-de-prueba'; });
  await vis(page, '[data-pace-ritmo-calendario]').click();
  const hoja = page.locator('[data-pace-cal]');
  /* Sin leer reuniones, como con Google: el día lo cambia la comida. */
  await hoja.locator('[data-pace-cal-reuniones]').uncheck();
  await hoja.locator('[data-pace-cal-destino="microsoft"] button').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se mantiene solo', { timeout: 15_000 });
  const ventana = m.vistas.find((v) => v.metodo === 'VENTANA');
  expect(decodeURIComponent(ventana.url)).toContain('scope=offline_access https://graph.microsoft.com/Calendars.ReadWrite');
  const posts = m.vistas.filter((v) => v.metodo === 'POST');
  expect(posts).toHaveLength(10);
  expect(posts.filter((p) => p.cuerpo.isReminderOn && p.cuerpo.reminderMinutesBeforeStart === 0)).toHaveLength(8);
  posts.forEach((p) => expect(p.cuerpo.singleValueExtendedProperties.map((x) => x.value)).toEqual([FECHA, expect.stringMatching(/^(b\d+|cierre)$/)]));
  await expect(hoja.locator('[data-pace-cal-solo="si"] .pace-rt-cal-s')).toHaveText('Al día · conectado hasta mañana a las 9:00');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();

  await page.clock.runFor(70 * 60 * 1000);
  const hechos = m.vistas.length;
  await page.evaluate(() => ritmoHorario('comidaDur', 45));
  await page.clock.runFor(MINUTO);
  await expect.poll(() => m.vistas.slice(hechos).filter((v) => v.metodo === 'PATCH').length).toBeGreaterThan(0);
  const nuevas = m.vistas.slice(hechos);
  expect(nuevas.filter((v) => v.metodo === 'VENTANA')).toHaveLength(0);
  expect(nuevas.filter((v) => v.metodo === 'TOKEN').map((v) => v.cuerpo)).toEqual([expect.stringContaining('grant_type=refresh_token')]);
  nuevas.filter((v) => v.metodo === 'PATCH').forEach((v) => expect(v.auth).toBe('Bearer pase-renovado'));
  m.vistas.filter((v) => v.metodo === 'POST' || v.metodo === 'PATCH').forEach((v) => expect(v.cuerpo.showAs, v.metodo).toBe('free'));
  await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('Calendario al día');
  expect(errores).toEqual([]);
});

/* C2 (auditoría del 22 oct. 2026): tras un fallo de escritura que no es de permiso, el estado
   no lo decía y la hoja seguía en «al día» mientras reintentaba cada 5 min. Ahora lo dice
   (`fallo`); qué enseña la hoja con él espera a Ez. */
test('C2 · un fallo de escritura que no es de permiso sale en el estado, y se va al salir bien', async ({ page, context }) => {
  const g = await calendarioWebFalso(context, 'google');
  await abrir(page, context);
  await page.evaluate(() => { CALENDARIO_IDS.google = 'id-de-prueba'; });
  await vis(page, '[data-pace-ritmo-calendario]').click();
  const hoja = page.locator('[data-pace-cal]');
  await hoja.locator('[data-pace-cal-reuniones]').uncheck();
  await hoja.locator('[data-pace-cal-destino="google"] button').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se mantiene solo', { timeout: 15_000 });
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
  expect(await page.evaluate(() => calendarioSoloEstado().fallo)).toBe(false);

  g.romper = true;
  await page.evaluate(() => ritmoHorario('comidaDur', 45));
  await page.clock.runFor(MINUTO);
  await expect.poll(() => page.evaluate(() => calendarioSoloEstado().fallo)).toBe(true);
  const e = await page.evaluate(() => calendarioSoloEstado());
  expect([e.conAcceso, e.pendiente], 'con permiso y por detrás').toEqual([true, true]);
  g.romper = false;
  await page.clock.runFor(5 * MINUTO);
  await expect.poll(() => page.evaluate(() => calendarioSoloEstado().fallo)).toBe(false);
});
