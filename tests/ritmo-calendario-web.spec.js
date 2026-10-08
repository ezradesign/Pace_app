/* PACE · E2E · EL DÍA EN GOOGLE CALENDAR Y EN OUTLOOK, AL DÍA SOLO
 * ================================================================
 * La web lleva el día de «A tu ritmo» a un calendario propio «PACE» en Google o
 * en Outlook y, tras conectar, lo mantiene al día sin pulsar nada mientras la
 * app está abierta (opción B de la propuesta de calendario, elegida por Ez).
 *
 * QUE DEFIENDE, con una nube falsa que guarda calendarios y eventos como la de
 * verdad:
 *  · CONECTAR: la ventana del permiso vuelve por /calendario.html y
 *    localStorage, PACE encuentra o crea su calendario «PACE», lee las
 *    reuniones del principal (en Google, solo libre/ocupado) y escribe ahí, sin
 *    tocar el principal; la fila queda «Al día» con «Desconectar».
 *  · AL DÍA SOLO: cambiar el día reescribe los bloques que quedan; «Hoy voy por
 *    libre» los quita; nada se duplica.
 *  · MICROSOFT 24 H: con la pestaña nueva (sin pase), la llave pide uno sin
 *    preguntar; DESCONECTAR la borra y deja de escribir.
 *  · GOOGLE 1 H: con el pase caducado, la fila pide «Renovar» y no se escribe.
 *  · Si la persona borra el calendario «PACE», se crea otro.
 *
 * NO CUBRE: Google ni Microsoft de verdad (sus altas las hace Ez,
 * docs/CALENDARIO_ALTAS.md), ni que fuera de pacegrass.app el destino no salga
 * (la prueba vive en localhost; lo dice `CALENDARIO_WEB_DOMINIOS`).
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
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function abrir(page, context) {
  await sembrar(context, { ritmo: { dia: JORNADA } });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}

/* La nube falsa. `o.listar`: si Google deja listar calendarios con este permiso
   (si no, 403 y PACE crea el suyo). `o.paceYa`: Outlook ya tiene un «PACE». */
async function nubeFalsa(context, prov, o) {
  const google = prov === 'google';
  const opc = Object.assign({ listar: true, paceYa: false }, o || {});
  const nube = { calendarios: [], eventos: [], tokens: [], llamadas: [], siguiente: 1 };
  if (!google && opc.paceYa) nube.calendarios.push({ id: 'cal-ms', name: 'PACE' });
  const json = (cuerpo, status) => ({ status: status || 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' },
    body: cuerpo == null ? '' : JSON.stringify(cuerpo) });
  const hay = (cal) => nube.calendarios.some((c) => c.id === cal);
  /* Las reuniones del principal: una a las 12:00 y otra rechazada o libre, que no cuenta. */
  const REUNION = [ms('12:00'), ms('12:30')];

  /* La ventana del permiso y el canje del código o de la llave. */
  await context.route(google ? 'https://accounts.google.com/**' : 'https://login.microsoftonline.com/**', (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
    const url = new URL(req.url());
    if (url.pathname.endsWith('/token')) {
      const cuerpo = new URLSearchParams(req.postData() || '');
      nube.tokens.push(cuerpo.get('grant_type'));
      return route.fulfill(json({ access_token: 'pase-ms-' + nube.tokens.length, expires_in: 3600, refresh_token: 'llave-' + nube.tokens.length }));
    }
    nube.scope = url.searchParams.get('scope');
    const vuelta = google ? 'access_token=pase-g&expires_in=3600&token_type=Bearer' : 'code=codigo-ms';
    return route.fulfill({ status: 302, headers: { location: url.searchParams.get('redirect_uri') + '#' + vuelta + '&state=' + url.searchParams.get('state') } });
  });
  await context.route('https://oauth2.googleapis.com/**', (route) => { nube.revocado = true; return route.fulfill(json({})); });

  await context.route(google ? 'https://www.googleapis.com/**' : 'https://graph.microsoft.com/**', (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' } });
    }
    const url = new URL(req.url());
    const camino = decodeURIComponent(url.pathname);
    const metodo = req.method();
    let cuerpo = null;
    try { cuerpo = req.postDataJSON(); } catch (e) {}
    nube.llamadas.push({ metodo, camino, auth: req.headers().authorization });
    let m;
    if (google) {
      if (camino.endsWith('/users/me/calendarList')) {
        return route.fulfill(opc.listar ? json({ items: nube.calendarios.map((c) => ({ id: c.id, summary: c.summary, description: c.description })) }) : json({ error: {} }, 403));
      }
      if (camino.endsWith('/calendars') && metodo === 'POST') {
        const c = { id: 'cal-g-' + nube.siguiente++, summary: cuerpo.summary, description: cuerpo.description };
        nube.calendarios.push(c);
        return route.fulfill(json(c));
      }
      if (camino.endsWith('/freeBusy')) return route.fulfill(json({ calendars: { primary: { busy: [{ start: new Date(REUNION[0]).toISOString(), end: new Date(REUNION[1]).toISOString() }] } } }));
      if ((m = camino.match(/\/calendars\/([^/]+)\/events(?:\/([^/]+))?$/))) {
        const cal = m[1];
        if (!hay(cal)) return route.fulfill(json({ error: {} }, 404));
        if (metodo === 'GET') {
          const dia = (url.searchParams.get('privateExtendedProperty') || '').split('=')[1];
          return route.fulfill(json({ items: nube.eventos.filter((e) => e.cal === cal && e.dia === dia).map((e) => ({ id: e.id, end: { dateTime: new Date(e.fin).toISOString() } })) }));
        }
        if (metodo === 'POST') {
          const e = { id: 'e' + nube.siguiente++, cal, dia: cuerpo.extendedProperties.private.paceDia, ini: Date.parse(cuerpo.start.dateTime), fin: Date.parse(cuerpo.end.dateTime), cuerpo };
          nube.eventos.push(e);
          return route.fulfill(json({ id: e.id }));
        }
        if (metodo === 'DELETE') { nube.eventos = nube.eventos.filter((e) => e.id !== m[2]); return route.fulfill(json(null, 204)); }
      }
    } else {
      const utc = (x) => Date.parse(x.dateTime + 'Z');
      if (camino.endsWith('/me/calendars')) {
        if (metodo === 'GET') return route.fulfill(json({ value: nube.calendarios }));
        const c = { id: 'cal-ms-' + nube.siguiente++, name: cuerpo.name };
        nube.calendarios.push(c);
        return route.fulfill(json(c));
      }
      if (camino.endsWith('/me/calendarView')) {
        const sin = (x) => new Date(x).toISOString().replace('Z', '0000');
        return route.fulfill(json({ value: [
          { start: { dateTime: sin(REUNION[0]) }, end: { dateTime: sin(REUNION[1]) }, showAs: 'busy' },
          { start: { dateTime: sin(ms('15:00')) }, end: { dateTime: sin(ms('16:00')) }, showAs: 'free' },
        ] }));
      }
      if ((m = camino.match(/\/me\/calendars\/([^/]+)\/events$/))) {
        const cal = m[1];
        if (!hay(cal)) return route.fulfill(json({ error: {} }, 404));
        if (metodo === 'GET') {
          const dia = ((url.searchParams.get('$filter') || '').match(/ep\/value eq '([^']+)'/) || [])[1];
          return route.fulfill(json({ value: nube.eventos.filter((e) => e.cal === cal && e.dia === dia).map((e) => ({ id: e.id, end: { dateTime: new Date(e.fin).toISOString().replace('Z', '') } })) }));
        }
        const e = { id: 'e' + nube.siguiente++, cal, dia: cuerpo.singleValueExtendedProperties[0].value, ini: utc(cuerpo.start), fin: utc(cuerpo.end), cuerpo };
        nube.eventos.push(e);
        return route.fulfill(json({ id: e.id }));
      }
      if ((m = camino.match(/\/me\/events\/([^/]+)$/)) && metodo === 'DELETE') {
        nube.eventos = nube.eventos.filter((e) => e.id !== m[1]);
        return route.fulfill(json(null, 204));
      }
    }
    return route.fulfill(json({ error: { message: 'la nube falsa no sabe ' + metodo + ' ' + camino } }, 500));
  });
  return nube;
}

/* Los bloques que quedan de hoy en el calendario «PACE», en minutos, ordenados. */
const quedan = (nube, ahora) => nube.eventos.filter((e) => e.dia === FECHA && e.fin > ahora)
  .map((e) => [Math.round((e.ini - ms('00:00')) / 60000), Math.round((e.fin - ms('00:00')) / 60000)]).sort((a, b) => a[0] - b[0]);

/* Lo que el plan de ahora llevaría al calendario, en minutos. */
const plan = (page) => page.evaluate(() => {
  const t = (k) => PACE_STRINGS.es[k] || k;
  const tn = (k, v) => t(k).replace(/\{(\w+)\}/g, (_, x) => v[x]);
  const p = ritmoPlan(getState());
  return p ? calendarioEventos(p.m, ritmoAhoraExacto(), t, tn, 'es').map((e) => [e.desde, e.hasta]) : [];
});

async function conectar(page, prov) {
  await page.evaluate((p) => { CALENDARIO_IDS[p] = 'id-de-prueba'; }, prov);
  await vis(page, '[data-pace-ritmo-calendario]').click();
  const hoja = page.locator('[data-pace-cal]');
  const fila = hoja.locator('[data-pace-cal-destino="' + prov + '"]');
  await expect(fila.locator('button')).toHaveText('Conectar');
  await fila.locator('button').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se pone al día solo', { timeout: 15_000 });
  return { hoja, fila };
}

const cambiarDia = (page, opcion) => page.evaluate((op) => ritmoGuardar((r) => ({ dia: Object.assign({}, r.dia, { opcion: op }) })), opcion);
const esperarAlDia = (page) => page.clock.runFor(6000);

for (const prov of ['google', 'microsoft']) {
  const google = prov === 'google';
  test('con ' + prov + ': crea o encuentra su calendario «PACE», lee lo ocupado sin títulos y escribe solo ahí', async ({ page, context }) => {
    const errores = capturarErrores(page);
    const nube = await nubeFalsa(context, prov, google ? { listar: false } : { paceYa: true });
    await abrir(page, context);
    const { hoja, fila } = await conectar(page, prov);
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('Hoy tienes 1 reunión y el día la rodea.');

    expect(nube.scope).toBe(google
      ? 'https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar.freebusy'
      : 'https://graph.microsoft.com/Calendars.ReadWrite offline_access');
    /* Google no dejó listar: lo creó. Outlook ya tenía uno: no crea otro. */
    expect(nube.calendarios.map((c) => c.id)).toEqual([google ? 'cal-g-1' : 'cal-ms']);
    if (google) expect(nube.calendarios[0].description).toContain('pacegrass.app');
    /* Con Google solo se pregunta libre/ocupado: ningún listado del principal. */
    if (google) expect(nube.llamadas.filter((l) => /\/calendars\/primary\//.test(l.camino))).toEqual([]);
    expect(nube.eventos.length).toBeGreaterThan(5);
    nube.eventos.forEach((e) => {
      expect(e.cal).toBe(nube.calendarios[0].id);
      expect(e.ini < ms('12:30') && e.fin > ms('12:00')).toBe(false);
      if (google) expect(e.cuerpo.reminders).toEqual({ useDefault: false, overrides: [] });
      else expect(e.cuerpo.isReminderOn).toBe(false);
    });
    expect(quedan(nube, ms('09:00'))).toEqual(await plan(page));

    const R = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo);
    expect(R.ocupado.tramos).toEqual([[720, 30]]);
    expect(R.calendario).toMatchObject({ destino: prov, auto: true, reuniones: true, fecha: FECHA });
    expect(R.calendario.cal[prov]).toBe(nube.calendarios[0].id);
    expect(R.calendario.firma).toContain(FECHA + '|');
    /* La fila dice que está al día y ofrece desconectar. */
    await expect(fila.locator('[data-pace-cal-estado="al-dia"]')).toHaveText('Al día · se pone al día solo');
    await expect(fila).toContainText('En tu calendario «PACE»');
    await expect(fila.locator('button')).toHaveText('Desconectar');
    /* La vuelta no se queda; el pase vive en la pestaña y la llave de Microsoft, 24 h. */
    expect(await page.evaluate(() => localStorage.getItem('pace.calendario.vuelta'))).toBeNull();
    const llave = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.calendario.llave')));
    if (google) expect(llave).toBeNull();
    else {
      expect(llave.llave).toBe('llave-1');
      expect(Math.round((llave.caduca - ms('09:00')) / 3600000)).toBe(24);
    }
    /* El 403 de listar calendarios es el que la prueba de Google provoca a propósito. */
    expect(errores.filter((e) => !(google && /status of 403/.test(e)))).toEqual([]);
  });
}

test('al día solo: cambiar el día reescribe lo que queda, y «por libre» lo quita, sin duplicar', async ({ page, context }) => {
  const errores = capturarErrores(page);
  const nube = await nubeFalsa(context, 'google');
  await abrir(page, context);
  await conectar(page, 'google');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
  const antes = quedan(nube, Date.now());

  await cambiarDia(page, 'media');
  await esperarAlDia(page);
  await expect.poll(() => JSON.stringify(quedan(nube, ms('09:00')))).not.toBe(JSON.stringify(antes));
  const ahora = await page.evaluate(() => Date.now());
  await expect.poll(() => JSON.stringify(quedan(nube, ahora))).toBe(JSON.stringify(await plan(page)));
  expect(nube.calendarios).toHaveLength(1);

  /* Sin cambios no se escribe nada. */
  const llamadas = nube.llamadas.length;
  await esperarAlDia(page);
  expect(nube.llamadas.length).toBe(llamadas);

  await page.evaluate(() => ritmoGuardar(() => ({ libre: ritmoHoy() })));
  await esperarAlDia(page);
  await expect.poll(() => quedan(nube, ahora).length).toBe(0);
  expect(errores).toEqual([]);
});

test('Microsoft en una pestaña nueva pide el pase con su llave, y «Desconectar» deja de escribir', async ({ page, context }) => {
  const nube = await nubeFalsa(context, 'microsoft');
  await abrir(page, context);
  const { fila } = await conectar(page, 'microsoft');
  expect(nube.tokens).toEqual(['authorization_code']);
  await page.getByRole('button', { name: 'Listo', exact: true }).click();

  /* Una pestaña nueva no tiene pase, pero la llave sigue en el navegador. */
  await page.evaluate(() => sessionStorage.clear());
  await cambiarDia(page, '2h');
  await esperarAlDia(page);
  await expect.poll(() => nube.tokens).toEqual(['authorization_code', 'refresh_token']);
  const ahora = await page.evaluate(() => Date.now());
  await expect.poll(async () => JSON.stringify(quedan(nube, ahora))).toBe(JSON.stringify(await plan(page)));
  /* Renovar no alarga las 24 h. */
  const llave = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.calendario.llave')));
  expect(llave.llave).toBe('llave-2');
  expect(Math.round((llave.caduca - ms('09:00')) / 3600000)).toBe(24);

  await vis(page, '[data-pace-ritmo-calendario]').click();
  await expect(fila.locator('[data-pace-cal-estado="al-dia"]')).toBeVisible();
  await fila.locator('button').click();
  await expect(page.locator('[data-pace-cal-aviso="ok"]')).toHaveText('Desconectado. Lo que ya estaba en tu calendario se queda.');
  await expect(fila.locator('button')).toHaveText('Conectar');
  expect(await page.evaluate(() => localStorage.getItem('pace.calendario.llave'))).toBeNull();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.calendario)).toMatchObject({ destino: null, auto: false });

  const llamadas = nube.llamadas.length;
  await cambiarDia(page, 'jornada');
  await esperarAlDia(page);
  expect(nube.llamadas.length).toBe(llamadas);
});

test('Google con el pase caducado pide «Renovar» y no escribe; si borraste el calendario «PACE», crea otro', async ({ page, context }) => {
  const nube = await nubeFalsa(context, 'google');
  await abrir(page, context);
  await conectar(page, 'google');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();

  await page.evaluate(() => sessionStorage.clear());
  const llamadas = nube.llamadas.length;
  await cambiarDia(page, 'media');
  await esperarAlDia(page);
  expect(nube.llamadas.length).toBe(llamadas);
  await vis(page, '[data-pace-ritmo-calendario]').click();
  const fila = page.locator('[data-pace-cal-destino="google"]');
  await expect(fila.locator('[data-pace-cal-estado="caducada"]')).toHaveText('La conexión ha caducado: un toque la renueva');
  await expect(fila.locator('button')).toHaveText('Renovar');

  /* La persona borró el calendario «PACE» en Google: al renovar se crea otro. */
  nube.calendarios = [];
  nube.eventos = [];
  await fila.locator('button').click();
  await expect(page.locator('[data-pace-cal-aviso="ok"]')).toContainText('se pone al día solo', { timeout: 15_000 });
  expect(nube.calendarios).toHaveLength(1);
  expect(nube.eventos.length).toBeGreaterThan(0);
  nube.eventos.forEach((e) => expect(e.cal).toBe(nube.calendarios[0].id));
  await expect(fila.locator('button')).toHaveText('Desconectar');
});
