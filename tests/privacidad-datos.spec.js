/* PACE · E2E · LO QUE PROMETEMOS SOBRE LOS DATOS
 * ===============================================
 * `privacy.html` y la hoja del calendario prometen cosas que solo el código puede
 * cumplir. Aquí se defiende lo que se pide y lo que se guarda, no las frases:
 *
 *  · P2, el calendario: de una reunión, PACE solo pide y se queda con las horas.
 *    Google se lo pide con `fields` (sin él daba el título, el lugar y quién va);
 *    Outlook ya lo pedía con `$select`; y el puente de Android no deja salir el
 *    título ni el texto de lo que no puso PACE desde ese móvil.
 *  · P3, lo que PACE escribe en Google, en Outlook y en el archivo va libre y privado (en el
 *    calendario del móvil lo marca PaceCalendario: tests/android-calendario.spec.js);
 *  · P5, «Avísame»: cada correo se borra solo al año de apuntarse;
 *  · y que privacy.html no diga que /premium cuenta visitas mientras no las cuente
 *    (eso lo mira `verify`, en scripts/verify.privacidad.js).
 *
 * Contra v0.178.0 caen la de Google, la de Android, la de P3 y la de «Avísame»; la de
 * Outlook ya pasaba y se queda de guarda.
 *
 * NO CUBRE: que Google haga caso a `fields` de verdad (eso, con el alta de Ez:
 * docs/CALENDARIO_ALTAS.md), ni lo que el complemento de Android lee dentro del
 * móvil antes de llegar a la app.
 */
'use strict';

const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const RAIZ = path.join(__dirname, '..');
const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const ms = (hhmm) => Date.parse(FECHA + 'T' + hhmm + ':00+02:00');

/* Lo que de una reunión nunca se pide ni sale del puente. */
const AJENO = ['summary', 'description', 'location', 'organizer', 'creator', 'email', 'displayName', 'subject', 'body', 'attendees/emailAddress'];
const SECRETO = { titulo: 'Cena con Ana', texto: 'Llevar el regalo', lugar: 'Casa de Ana', quien: 'ana@ejemplo.com' };

async function abrir(page, context) {
  await sembrar(context, { ritmo: { dia: { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}

/* Llama a la lectura de reuniones con un `fetch` de mentira que contesta con el
   evento entero, como haría el proveedor sin filtro. Devuelve la URL pedida y lo leído. */
function leerReuniones(page, prov, items) {
  return page.evaluate(async ([prov, items, desde, hasta]) => {
    const urls = [];
    const original = window.fetch;
    window.fetch = (url) => {
      urls.push(String(url));
      return Promise.resolve(new Response(JSON.stringify(prov === 'google' ? { items } : { value: items }), { status: 200 }));
    };
    try {
      const reuniones = await calendarioWebReuniones(prov, 'pase', desde, hasta);
      return { urls, reuniones };
    } finally { window.fetch = original; }
  }, [prov, items, ms('00:00'), ms('23:59')]);
}

test.describe('P2 · de una reunión, solo las horas', () => {
  test('Google: la lista de reuniones lleva `fields`, sin título, lugar ni quién va', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    const reunion = { id: 'r1', summary: SECRETO.titulo, description: SECRETO.texto, location: SECRETO.lugar,
      start: { dateTime: '2026-09-17T12:00:00+02:00' }, end: { dateTime: '2026-09-17T12:30:00+02:00' },
      attendees: [{ email: SECRETO.quien, responseStatus: 'accepted' }, { email: 'yo@ejemplo.com', self: true, responseStatus: 'accepted' }] };
    const { urls, reuniones } = await leerReuniones(page, 'google', [reunion]);
    expect(urls).toHaveLength(1);
    const campos = new URL(urls[0]).searchParams.get('fields');
    expect(campos, 'Google da el evento entero si no se le dice qué campos').toBeTruthy();
    for (const k of AJENO) expect(campos, 'pide ' + k).not.toContain(k);
    /* Lo que necesita para decidir sigue dentro. */
    for (const k of ['start', 'end', 'status', 'transparency', 'attendees(self,responseStatus)']) expect(campos).toContain(k);
    expect(reuniones).toEqual([{ inicio: ms('12:00'), fin: ms('12:30') }]);
    expect(errores).toEqual([]);
  });

  test('Outlook: `$select` solo con las horas y lo que decide si ocupan', async ({ page, context }) => {
    await abrir(page, context);
    const { urls } = await leerReuniones(page, 'microsoft', []);
    const campos = new URL(urls[0]).searchParams.get('$select').split(',');
    expect(campos.sort()).toEqual(['end', 'isAllDay', 'isCancelled', 'responseStatus', 'showAs', 'start']);
  });

  test('Android: el puente no deja salir el título ni el texto de lo que no puso PACE', async ({ page, context }) => {
    const errores = capturarErrores(page);
    const reunion = { id: 'r1', title: SECRETO.titulo, description: SECRETO.texto, location: SECRETO.lugar,
      attendees: [{ email: SECRETO.quien }], organizer: SECRETO.quien, startDate: ms('12:00'), endDate: ms('12:30'),
      isAllDay: false, availability: 0, status: 'confirmed', alerts: [-10] };
    const dePace = { id: 'p1', title: 'Foco 1 de 9', description: 'Foco de 45 min.', startDate: ms('09:00'), endDate: ms('09:45'),
      isAllDay: false, availability: 1, status: 'confirmed', alerts: [0] };
    await context.addInitScript(([eventos, fin]) => {
      /* p1 lo puso PACE desde este móvil: su id está apuntado. */
      localStorage.setItem('pace.calendario.android', JSON.stringify({ p1: { fin } }));
      window.Capacitor = {
        getPlatform: () => 'android', isNativePlatform: () => true,
        Plugins: {
          App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
          LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
          CapacitorCalendar: { listEventsInRange: () => Promise.resolve({ result: eventos }) },
        },
      };
    }, [[reunion, dePace], dePace.endDate]);
    await abrir(page, context);
    const [sinPropio, conPropio] = await page.evaluate(([a, b]) => Promise.all([
      paceAndroidCalendarioEventos(a, b),
      paceAndroidCalendarioEventos(a, b, calendarioAndroidEsDePace),
    ]), [ms('00:00'), ms('23:59')]);
    /* De la reunión, solo lo que decide si ocupa. */
    for (const lista of [sinPropio, conPropio]) {
      const r1 = lista.find((e) => e.id === 'r1');
      expect(Object.keys(r1).sort()).toEqual(['calendario', 'cancelado', 'fin', 'id', 'inicio', 'libre', 'todoElDia']);
      for (const v of Object.values(SECRETO)) expect(JSON.stringify(lista), 'sale ' + v).not.toContain(v);
    }
    /* Lo de PACE lleva lo que el calendario que se mantiene solo compara. */
    expect(sinPropio.find((e) => e.id === 'p1').titulo).toBeUndefined();
    expect(conPropio.find((e) => e.id === 'p1')).toMatchObject({ titulo: 'Foco 1 de 9', texto: 'Foco de 45 min.', aviso: true });
    expect(errores).toEqual([]);
  });
});

/* P3 (Ez, 1A del 26 oct.): libre ya lo eran; privado, para que quien solo puede ver tu
   calendario no lea qué pausa haces. En el calendario del móvil lo pone una pieza propia,
   PaceCalendario, porque el complemento no sabe: lo prueba tests/android-calendario.spec.js y
   verify.privacidad.js cruza esa pieza con lo que dice privacy.html. */
test('P3 · lo que PACE escribe va libre y privado en Google, en Outlook y en el archivo', async ({ page, context }) => {
  const errores = capturarErrores(page);
  await abrir(page, context);
  const r = await page.evaluate(async (FECHA) => {
    const cuerpos = [];
    const original = window.fetch;
    window.fetch = (url, o) => {
      if (o && o.body) cuerpos.push({ metodo: o.method, cuerpo: JSON.parse(o.body) });
      return Promise.resolve(new Response(JSON.stringify({ id: 'nuevo' }), { status: 200 }));
    };
    const ev = { clave: 'b1', inicio: Date.parse(FECHA + 'T09:00:00+02:00'), fin: Date.parse(FECHA + 'T09:45:00+02:00'),
      titulo: 'Foco 1 de 9 · luego Respira', texto: 'Foco de 45 min.', aviso: true };
    try {
      for (const prov of ['google', 'microsoft']) {
        await calendarioWebCrear(prov, 'pase', FECHA, ev, false);
        await calendarioWebCambiar(prov, 'pase', 'id-1', ev);
      }
    } finally { window.fetch = original; }
    const ics = calendarioIcs([{ clave: 'b1', desde: 540, hasta: 585, titulo: ev.titulo, texto: ev.texto }], FECHA, Date.now());
    return { cuerpos, clases: ics.match(/^CLASS:.*$/gm) || [], vevents: (ics.match(/BEGIN:VEVENT/g) || []).length };
  }, FECHA);
  expect(r.cuerpos.map((c) => c.metodo)).toEqual(['POST', 'PATCH', 'POST', 'PATCH']);
  r.cuerpos.slice(0, 2).forEach((c) => expect(c.cuerpo).toMatchObject({ transparency: 'transparent', visibility: 'private' }));
  r.cuerpos.slice(2).forEach((c) => expect(c.cuerpo).toMatchObject({ showAs: 'free', sensitivity: 'private' }));
  expect(r.clases, 'cada evento del archivo, privado').toEqual(Array(r.vevents).fill('CLASS:PRIVATE'));
  expect(errores).toEqual([]);
});

test.describe('P5 · «Avísame» no guarda para siempre', () => {
  test('cada correo se guarda con caducidad de un año', async () => {
    const fn = await import(pathToFileURL(path.join(RAIZ, 'functions', 'api', 'avisame.js')).href);
    const puestos = [];
    const kv = { get: async () => null, put: async (k, v, opciones) => { puestos.push({ k, opciones: opciones || null }); } };
    const request = new Request('https://pacegrass.app/api/avisame', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'a@b.es', idioma: 'es' }) });
    const r = await fn.onRequestPost({ request, env: { AVISAME: kv } });
    expect(r.status).toBe(200);
    expect(puestos).toHaveLength(1);
    expect(puestos[0].opciones, 'sin caducidad, el correo se queda para siempre').toEqual({ expirationTtl: 365 * 24 * 60 * 60 });
  });
});
