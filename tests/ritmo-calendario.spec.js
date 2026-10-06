/* PACE · E2E · EL DÍA EN EL CALENDARIO
 * =====================================
 * «Al calendario» lleva el día de «A tu ritmo» a un calendario y trae de vuelta
 * las reuniones, que el día esquiva como esquiva la comida.
 *
 * QUE DEFIENDE, de dentro a fuera:
 *  · la REGLA con lo ocupado, en puro: sin reuniones es la de siempre; con
 *    ellas, ningún bloque ni pausa las pisa, cada una sale como su tramo, la
 *    comida manda en su hueco y «Una hora» sigue sirviendo sus 50 min;
 *  · los EVENTOS y el .ics: uno por bloque con su pausa dentro, solo lo que queda
 *    de hoy, en UTC, sin alarmas y con líneas de 75 octetos como mucho;
 *  · la WEB sin ids: solo «Otro calendario», que descarga el .ics;
 *  · ANDROID con un CapacitorCalendar espía: pide permiso, lee las reuniones,
 *    borra lo de PACE que queda de hoy (y nada más) y escribe el día ya
 *    recompuesto; sin permiso no escribe nada;
 *  · GOOGLE y MICROSOFT con su red interceptada: la ventana del permiso vuelve
 *    por /calendario.html y localStorage, y se escribe lo mismo que en Android.
 *
 * NO CUBRE: Android de verdad (que el complemento compile lo dice el workflow
 * Android; que escriba en el calendario del móvil, un móvil), ni Google ni
 * Microsoft de verdad (sus altas las hace Ez: docs/CALENDARIO_ALTAS.md).
 *
 * El reloj va a las 9:00 de un jueves en Madrid, como en ritmo.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const ms = (hhmm) => Date.parse(FECHA + 'T' + hhmm + ':00+02:00');

async function abrir(page, context, extra) {
  await sembrar(context, Object.assign({ ritmo: { dia: JORNADA } }, extra || {}));
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Los textos de la app, sin el hook: lo que reciben las funciones puras. */
const TEXTOS = `(() => {
  const t = (k) => PACE_STRINGS.es[k] || k;
  const tn = (k, v) => t(k).replace(/\\{(\\w+)\\}/g, (_, x) => v[x]);
  return { t, tn };
})()`;

/* ------------------------------------------------------------------ regla */
test('la regla esquiva lo ocupado: nada lo pisa, cada reunión es su tramo y la comida manda', async ({ page, context }) => {
  await abrir(page, context);
  const fallos = await page.evaluate(() => {
    const out = [];
    const pozos = ritmoPozos(getState(), '2026-09-17');
    const H = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 540 };
    const sin = ritmoComponer('jornada', H, pozos, {}, 8);
    const vacio = ritmoComponer('jornada', Object.assign({}, H, { ocupado: [] }), pozos, {}, 8);
    if (JSON.stringify(sin) !== JSON.stringify(vacio)) out.push('sin reuniones no es la regla de siempre');
    const casos = [
      [[600, 60], [720, 30]],
      [[810, 90]],
      [[545, 20], [990, 60]],
      [[700, 10], [705, 30], [760, 20]],
    ];
    casos.forEach((ocupado) => ['1h', '2h', 'media', 'jornada'].forEach((op) => {
      const m = ritmoComponer(op, Object.assign({}, H, { ocupado }), pozos, {}, 8);
      const tag = op + ' ' + JSON.stringify(ocupado);
      let t = m.desde;
      m.items.forEach((it) => { if (it.desde !== t) out.push(tag + ': hueco en ' + it.desde); t = it.desde + it.dur; });
      const tramos = m.items.filter((it) => it.tipo === 'ocupado');
      m.items.filter((it) => it.tipo === 'foco' || it.tipo === 'pausa' || it.tipo === 'comida').forEach((it) => {
        tramos.forEach((o) => { if (it.desde < o.desde + o.dur && o.desde < it.desde + it.dur) out.push(tag + ': ' + it.tipo + ' de las ' + it.desde + ' pisa la reunión de las ' + o.desde); });
      });
      m.focos.forEach((f) => { if (f.dur < 15) out.push(tag + ': bloque de ' + f.dur + ' min'); });
      const comida = m.items.find((it) => it.tipo === 'comida');
      if (comida && comida.desde !== 840) out.push(tag + ': la comida no empieza a su hora');
      if (op === '1h' && m.focoMin !== 50) out.push(tag + ': «Una hora» sirve ' + m.focoMin + ' min');
    }));
    /* Un bloque que llegaría tarde a la reunión deja sitio a su pausa: llegas con ella hecha. */
    const m = ritmoComponer('1h', Object.assign({}, H, { ocupado: [[570, 30]] }), pozos, {}, 8);
    const tipos = m.items.map((it) => it.tipo + '@' + it.desde + '+' + it.dur).join(' ');
    if (tipos !== 'foco@540+25 pausa@565+5 ocupado@570+30 foco@600+25 cierre@625+5') out.push('1h con reunión a las 9:30: ' + tipos);
    /* La reunión que cruza la comida pierde el trozo de la comida. */
    const c = ritmoOcupadoLimpio([[810, 90]], 540, 840, 60);
    if (JSON.stringify(c) !== JSON.stringify([{ desde: 810, hasta: 840 }])) out.push('reunión en la comida: ' + JSON.stringify(c));
    return out;
  });
  expect(fallos).toEqual([]);
});

/* ------------------------------------------------------------------ eventos y .ics */
test('un evento por bloque con su pausa, solo lo que queda de hoy, y un .ics que se lee', async ({ page, context }) => {
  await abrir(page, context);
  const r = await page.evaluate((TEXTOS) => {
    const { t, tn } = eval(TEXTOS);
    const plan = ritmoPlan(getState());
    const evs = calendarioEventos(plan.m, 540, t, tn, 'es');
    const ics = calendarioIcs(evs, '2026-09-17', Date.parse('2026-09-17T07:00:00Z'));
    const lineas = ics.split('\r\n');
    const largas = lineas.filter((l) => new TextEncoder().encode(l).length > 75);
    const desplegado = ics.replace(/\r\n /g, '');
    return {
      n: evs.length, titulos: evs.map((e) => e.titulo), tramos: evs.map((e) => [e.desde, e.hasta]),
      tras10: calendarioEventos(plan.m, 600, t, tn, 'es').length,
      texto: evs[0].texto, largas: largas.length, sinCR: /[^\r]\n/.test(ics),
      vevents: (ics.match(/BEGIN:VEVENT/g) || []).length, alarmas: /VALARM/.test(ics),
      inicio: (desplegado.match(/DTSTART:(\S+)/) || [])[1], uid: (desplegado.match(/UID:(\S+)/) || [])[1],
      resumen: (desplegado.match(/SUMMARY:(.*)/) || [])[1],
      tramosMs: calendarioTramos([
        { inicio: Date.parse('2026-09-17T12:00:00+02:00'), fin: Date.parse('2026-09-17T12:30:00+02:00') },
        { inicio: Date.parse('2026-09-16T22:00:00+02:00'), fin: Date.parse('2026-09-17T09:30:00+02:00') },
        { inicio: Date.parse('2026-09-18T10:00:00+02:00'), fin: Date.parse('2026-09-18T11:00:00+02:00') },
      ], '2026-09-17'),
    };
  }, TEXTOS);
  expect(r.n).toBe(9);
  expect(r.titulos[0]).toMatch(/^Foco 1 de 9 · luego Estira: .+/);
  expect(r.titulos[1]).toMatch(/^Foco 2 de 9 · luego Mueve: .+/);
  expect(r.titulos[2]).toBe('Foco 3 de 9 · luego pausa larga');
  expect(r.titulos[8]).toBe('Foco 9 de 9 · luego cierre del día');
  /* El bloque de antes de comer acaba al empezar la comida: la comida no se lleva. */
  expect(r.tramos).toContainEqual([800, 840]);
  expect(r.tramos[0]).toEqual([540, 590]);
  expect(r.tramos[8]).toEqual([985, 1020]);
  expect(r.tras10).toBe(8);
  expect(r.texto).toContain('Foco de 45 min.');
  expect(r.texto).toContain('pacegrass.app');
  expect(r.vevents).toBe(9);
  expect(r.alarmas).toBe(false);
  expect(r.largas).toBe(0);
  expect(r.sinCR).toBe(false);
  expect(r.inicio).toBe('20260917T070000Z');
  expect(r.uid).toBe('pace-20260917-foco-1@pacegrass.app');
  expect(r.resumen).toMatch(/^Foco 1 de 9 · luego Estira: /);
  expect(r.tramosMs).toEqual([[0, 570], [720, 30]]);
});

/* ------------------------------------------------------------------ web sin ids */
test('en la web sin ids, «Al calendario» ofrece solo el archivo y lo descarga', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  const enlace = vis(page, '[data-pace-ritmo-calendario]');
  await expect(enlace).toHaveText('Al calendario');
  await enlace.click();
  const hoja = page.locator('[data-pace-cal]');
  await expect(page.getByRole('dialog', { name: 'Tu día en el calendario' })).toBeVisible();
  await expect(hoja.locator('[data-pace-cal-resumen]')).toHaveText('Se añade lo que queda de hoy: 9 bloques de foco con sus pausas, de 9:00 a 17:00.');
  await expect(hoja.locator('[data-pace-cal-destino]')).toHaveCount(1);
  await expect(hoja.locator('[data-pace-cal-reuniones]')).toHaveCount(0);
  const [descarga] = await Promise.all([
    page.waitForEvent('download'),
    hoja.locator('[data-pace-cal-destino="archivo"] button').click(),
  ]);
  expect(descarga.suggestedFilename()).toBe('pace-2026-09-17.ics');
  const ruta = await descarga.path();
  const texto = require('fs').readFileSync(ruta, 'utf8');
  expect((texto.match(/BEGIN:VEVENT/g) || []).length).toBe(9);
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toHaveText('Archivo listo: ábrelo con tu calendario.');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
  await expect(hoja).toHaveCount(0);
  expect(errores).toEqual([]);
});

test.describe('móvil', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });
  for (const lang of ['es', 'en']) {
    test('el enlace va bajo «Cambiar», dentro del panel y sin pisar el título (' + lang + ')', async ({ page, context }) => {
      await abrir(page, context, { sidebarCollapsed: true, lang });
      const panel = vis(page, '[data-pace-ritmo-estado="menu"]');
      const r = await panel.evaluate((el) => {
        const caja = (x) => { const b = x.getBoundingClientRect(); return [b.left, b.right, b.top, b.bottom]; };
        return { panel: caja(el), titulo: caja(el.querySelector('.pace-rt-titulo')), cambiar: caja(el.querySelector('.pace-rt-cab-der > button')),
                 enlace: caja(el.querySelector('[data-pace-ritmo-calendario]')),
                 pie: Array.from(el.querySelectorAll('.pace-rt-pie button')).map(caja) };
      });
      const dentro = (c) => c[0] >= r.panel[0] && c[1] <= r.panel[1];
      const pisa = (a, b) => a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3];
      [r.titulo, r.cambiar, r.enlace].concat(r.pie).forEach((c) => expect(dentro(c)).toBe(true));
      expect(r.enlace[2]).toBeGreaterThanOrEqual(r.cambiar[3]);
      expect(pisa(r.enlace, r.titulo)).toBe(false);
      expect(pisa(r.pie[0], r.pie[1])).toBe(false);
    });
  }
});

/* ------------------------------------------------------------------ Android */
/* Un CapacitorCalendar espía con un calendario de verdad dentro: los eventos se
   guardan, se filtran por rango y se borran. */
async function comoAndroid(context, opciones) {
  const o = Object.assign({ permiso: 'granted', eventos: [] }, opciones || {});
  await context.addInitScript(([permiso, eventos]) => {
    const nativo = window.__nativo = { llamadas: [], eventos: eventos.slice(), siguiente: 100 };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      return Promise.resolve(contesta(opts));
    };
    window.Capacitor = {
      getPlatform: () => 'android', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
        Filesystem: { writeFile: (op) => Promise.resolve({ uri: 'file:///cache/' + op.path }) },
        Share: { share: () => Promise.resolve({}) },
        CapacitorCalendar: {
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => ({ result: permiso })),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: permiso, writeCalendar: permiso } })),
          listCalendars: apunta('listCalendars', () => ({ result: [
            { id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true },
            { id: '2', title: 'Festivos', accountName: 'e@gmail.com', allowsContentModifications: false, visible: true },
          ] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: '1' } })),
          listEventsInRange: apunta('listEventsInRange', (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) })),
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
      },
    };
  }, [o.permiso, o.eventos]);
}
const llamadas = (page, metodo) => page.evaluate((m) => window.__nativo.llamadas.filter((l) => l.metodo === m), metodo);

const MARCA = 'PACE · A tu ritmo · pacegrass.app';
/* p1 lo puso PACE cuando vivía en paceweb.pages.dev: sigue siendo suyo, así que
   se borra al volver a pulsar y no cuenta como reunión. */
const MARCA_VIEJA = 'PACE · A tu ritmo · paceweb.pages.dev';
const EVENTOS_MOVIL = [
  { id: 'r1', title: 'Equipo', startDate: ms('12:00'), endDate: ms('12:30'), isAllDay: false, availability: 0, status: 'confirmed', description: '' },
  { id: 'r2', title: 'Santo', startDate: ms('00:00'), endDate: ms('23:59'), isAllDay: true, availability: 0, status: 'confirmed', description: '' },
  { id: 'r3', title: 'Libre', startDate: ms('15:00'), endDate: ms('16:00'), isAllDay: false, availability: 1, status: 'confirmed', description: '' },
  { id: 'p1', title: 'Foco 4 de 9', startDate: ms('11:40'), endDate: ms('12:30'), isAllDay: false, availability: 0, status: 'confirmed', description: 'Foco de 45 min.\n\n' + MARCA_VIEJA },
];

test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('lee las reuniones, borra lo de PACE que queda de hoy y escribe el día recompuesto', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await comoAndroid(context, { eventos: EVENTOS_MOVIL });
    await abrir(page, context, { sidebarCollapsed: true });
    await vis(page, '[data-pace-ritmo-calendario]').click();
    const hoja = page.locator('[data-pace-cal]');
    await expect(hoja.locator('[data-pace-cal-destino]')).toHaveCount(2);
    await expect(hoja.locator('[data-pace-cal-destino="android"]')).toContainText('Calendario del móvil');
    await expect(hoja.locator('[data-pace-cal-reuniones]')).toBeChecked();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hoy tienes 1 reunión y el día la rodea.');

    expect(await llamadas(page, 'requestFullCalendarAccess')).toHaveLength(1);
    const borrados = (await llamadas(page, 'deleteEvent')).map((l) => l.opts.id);
    expect(borrados).toEqual(['p1']);
    const creados = (await llamadas(page, 'createEvent')).map((l) => l.opts);
    expect(creados.length).toBeGreaterThan(5);
    creados.forEach((c) => {
      expect(c.availability).toBe(0);
      expect(c.alerts).toEqual([]);
      expect(c.description).toContain(MARCA);
      expect(c.startDate < ms('12:30') && c.endDate > ms('12:00')).toBe(false);
    });
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hecho: ' + creados.length + ' bloques en tu calendario.');
    /* Las reuniones se guardan como horas y nada más, y la línea las pinta. */
    const estado = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);
    expect(estado.ocupado).toEqual({ fecha: FECHA, tramos: [[720, 30]], fuente: 'android' });
    expect(estado.calendario).toMatchObject({ destino: 'android', reuniones: true });
    /* Con el permiso dado, la hoja ofrece el calendario donde escribir (solo los que se pueden). */
    await expect(hoja.locator('[data-pace-cal-calendario] option')).toHaveCount(0);
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await vis(page, '[data-pace-ritmo-ver]').click();
    await expect(page.locator('[data-pace-ritmo-lista] [data-pace-ritmo-fila="ocupado"]')).toHaveText(/12:00\s*Ocupado · 30 min/);
    /* Volver a pulsar no duplica: borra los suyos que quedan y vuelve a escribir. */
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await vis(page, '[data-pace-ritmo-calendario]').click();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toBeVisible();
    const dePace = await page.evaluate(() => window.__nativo.eventos.filter((e) => (e.description || '').includes('pacegrass.app')).length);
    expect(dePace).toBe(creados.length);
    expect(errores).toEqual([]);
  });

  test('sin permiso no escribe nada y lo dice', async ({ page, context }) => {
    await comoAndroid(context, { permiso: 'denied', eventos: EVENTOS_MOVIL });
    await abrir(page, context, { sidebarCollapsed: true });
    await vis(page, '[data-pace-ritmo-calendario]').click();
    const hoja = page.locator('[data-pace-cal]');
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="error"]')).toContainText('PACE no tiene permiso para el calendario');
    expect(await llamadas(page, 'createEvent')).toHaveLength(0);
    expect(await llamadas(page, 'deleteEvent')).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ Google y Microsoft */
/* La ventana del permiso: el proveedor «contesta» volviendo a /calendario.html
   con lo que mandaría, y su `state`. */
async function proveedorFalso(context, host, vuelta) {
  await context.route('https://' + host + '/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/token')) {
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ access_token: 'pase-ms', expires_in: 3600 }) });
    }
    const destino = url.searchParams.get('redirect_uri') + '#' + vuelta + '&state=' + url.searchParams.get('state');
    return route.fulfill({ status: 302, headers: { location: destino } });
  });
}

function apiFalsa(context, host, responde) {
  const vistas = [];
  return context.route('https://' + host + '/**', async (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    }
    vistas.push({ metodo: req.method(), url: req.url(), cuerpo: req.postDataJSON ? (() => { try { return req.postDataJSON(); } catch (e) { return null; } })() : null, auth: req.headers().authorization });
    const r = responde(req, vistas);
    return route.fulfill(Object.assign({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' } }, r));
  }).then(() => vistas);
}

for (const prov of ['google', 'microsoft']) {
  test('con ' + prov + ': la ventana del permiso vuelve por localStorage, lee las reuniones y escribe el día', async ({ page, context }) => {
    const errores = capturarErrores(page);
    const google = prov === 'google';
    await proveedorFalso(context, google ? 'accounts.google.com' : 'login.microsoftonline.com',
      google ? 'access_token=pase-g&expires_in=3600&token_type=Bearer' : 'code=codigo-ms');
    const reunion = google
      ? { id: 'r1', start: { dateTime: '2026-09-17T12:00:00+02:00' }, end: { dateTime: '2026-09-17T12:30:00+02:00' } }
      : { start: { dateTime: '2026-09-17T10:00:00.0000000' }, end: { dateTime: '2026-09-17T10:30:00.0000000' }, showAs: 'busy' };
    const rechazada = google
      ? { id: 'r2', start: { dateTime: '2026-09-17T15:00:00+02:00' }, end: { dateTime: '2026-09-17T16:00:00+02:00' }, attendees: [{ self: true, responseStatus: 'declined' }] }
      : { start: { dateTime: '2026-09-17T13:00:00.0000000' }, end: { dateTime: '2026-09-17T14:00:00.0000000' }, showAs: 'free' };
    const vistas = await apiFalsa(context, google ? 'www.googleapis.com' : 'graph.microsoft.com', (req) => {
      const u = req.url();
      if (req.method() === 'POST') return { body: JSON.stringify({ id: 'nuevo' }) };
      if (req.method() === 'DELETE') return { status: 204, body: '' };
      if (google) {
        return u.includes('privateExtendedProperty')
          ? { body: JSON.stringify({ items: [{ id: 'viejo', end: { dateTime: '2026-09-17T12:30:00+02:00' } }] }) }
          : { body: JSON.stringify({ items: [reunion, rechazada] }) };
      }
      return u.includes('/calendarView')
        ? { body: JSON.stringify({ value: [reunion, rechazada] }) }
        : { body: JSON.stringify({ value: [{ id: 'viejo', end: { dateTime: '2026-09-17T10:30:00.0000000' } }] }) };
    });
    await abrir(page, context);
    await page.evaluate((p) => { CALENDARIO_IDS[p] = 'id-de-prueba'; }, prov);
    await vis(page, '[data-pace-ritmo-calendario]').click();
    const hoja = page.locator('[data-pace-cal]');
    const fila = hoja.locator('[data-pace-cal-destino="' + prov + '"]');
    await expect(fila.locator('button')).toHaveText('Conectar');
    await fila.locator('button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hoy tienes 1 reunión y el día la rodea.', { timeout: 15_000 });

    const escritos = vistas.filter((v) => v.metodo === 'POST');
    const borrados = vistas.filter((v) => v.metodo === 'DELETE');
    expect(borrados).toHaveLength(1);
    expect(borrados[0].url).toContain('viejo');
    expect(escritos.length).toBeGreaterThan(5);
    vistas.forEach((v) => expect(v.auth).toBe('Bearer ' + (google ? 'pase-g' : 'pase-ms')));
    /* La reunión es a las 12:00 de Madrid en los dos (Microsoft la da en UTC). */
    escritos.forEach((v) => {
      const c = v.cuerpo;
      const ini = google ? Date.parse(c.start.dateTime) : Date.parse(c.start.dateTime + 'Z');
      const fin = google ? Date.parse(c.end.dateTime) : Date.parse(c.end.dateTime + 'Z');
      expect(ini < ms('12:30') && fin > ms('12:00')).toBe(false);
      if (google) {
        expect(c.reminders).toEqual({ useDefault: false, overrides: [] });
        expect(c.transparency).toBe('opaque');
        expect(c.extendedProperties.private).toEqual({ pace: 'ritmo', paceDia: FECHA });
      } else {
        expect(c.isReminderOn).toBe(false);
        expect(c.showAs).toBe('busy');
        expect(c.singleValueExtendedProperties[0].value).toBe(FECHA);
      }
    });
    const estado = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.ocupado);
    expect(estado.tramos).toEqual([[720, 30]]);
    /* La vuelta no se queda en el navegador, y el pase vive solo en la pestaña. */
    expect(await page.evaluate(() => localStorage.getItem('pace.calendario.vuelta'))).toBeNull();
    expect(await page.evaluate(() => Object.keys(JSON.parse(sessionStorage.getItem('pace.calendario.pase'))))).toEqual([prov]);
    await expect(fila.locator('button')).toHaveText('Añadir');
    expect(errores).toEqual([]);
  });
}
