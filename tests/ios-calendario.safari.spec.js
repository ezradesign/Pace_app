/* PACE · el calendario del iPhone
 * ===============================
 * Ez, 4A del 16 nov. 2026: en el iPhone, el calendario del móvil como en Android, con el permiso
 * completo de EventKit. La app usa el mismo complemento (CapacitorCalendar) y una pieza propia,
 * PaceCalendario.swift, para la marca de este iPhone (`instalado`, la regla D-8) y para contestar
 * que EventKit no sabe de privado. Aquí no hay iPhone: el Capacitor es falso, como en
 * tests/ios-nativo.safari.spec.js, y se prueba que la app pida lo correcto. Que iOS enseñe la
 * pregunta con la frase de PACE y que el día salga en Calendario se mira en un iPhone (TestFlight).
 *
 * Corre en los dos motores (`*.safari.spec.js`): el de Safari es el del iPhone.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const DIEZ = new Date('2026-11-16T10:00:00+01:00');
const MINUTO = 61 * 1000;
const enMs = (hhmm) => new Date('2026-11-16T' + hhmm + ':00+01:00').getTime();
const vis = (page, sel) => page.locator(sel).filter({ visible: true });
const REUNION = { id: 'EK-7', title: 'Reunión', startDate: enMs('12:00'), endDate: enMs('13:00'), isAllDay: false, availability: 0, status: 'confirmed' };

/* Un iPhone con el calendario sin permiso todavía, una reunión de 12:00 a 13:00 y la marca de
   este iPhone (`marca`; null = sin llavero). */
async function comoIphone(context, o) {
  await context.addInitScript(([reunion, marca, guardado]) => {
    Object.keys(guardado || {}).forEach((k) => { if (localStorage.getItem(k) === null) localStorage.setItem(k, guardado[k]); });
    const nativo = window.__nativo = { llamadas: [], eventos: [reunion], siguiente: 100, permiso: 'prompt' };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      try { return Promise.resolve(contesta(opts)); } catch (e) { return Promise.reject(e); }
    };
    window.Capacitor = {
      getPlatform: () => 'ios', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }) },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }), addListener: () => ({ remove() {} }) },
        CapacitorCalendar: {
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => { nativo.permiso = 'granted'; return { result: 'granted' }; }),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: nativo.permiso, writeCalendar: nativo.permiso } })),
          listCalendars: apunta('listCalendars', () => ({ result: [{ id: 'C1', title: 'Casa', allowsContentModifications: true, isSubscribed: false }] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: 'C1' } })),
          listEventsInRange: apunta('listEventsInRange', (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) })),
          createEvent: apunta('createEvent', (op) => { const id = 'EK-' + (nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: apunta('modifyEvent', (op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (!e) throw new Error('eventNotFound'); Object.assign(e, op); }),
          deleteEvent: apunta('deleteEvent', (op) => {
            if (!nativo.eventos.some((e) => e.id === op.id)) throw new Error('eventNotFound');
            nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id);
          }),
        },
        PaceCalendario: {
          instalado: apunta('instalado', () => ({ instalado: marca })),
          privado: apunta('privado', () => ({ privado: false })),
        },
      },
    };
  }, [REUNION, o && 'marca' in o ? o.marca : 1763280000000, (o && o.guardado) || null]);
}
const llamadas = (page, metodo) => page.evaluate((m) => window.__nativo.llamadas.filter((l) => l.metodo === m).map((l) => l.opts), metodo);

async function abrir(page, context, o) {
  await comoIphone(context, o);
  await sembrar(context, Object.assign({ ritmo: { libre: true }, sidebarCollapsed: true }, (o && o.semilla) || {}));
  await page.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
}

async function conectar(page) {
  await vis(page, '[data-pace-ritmo-tarjeta-calendario]').click();
  const hoja = page.locator('[data-pace-cal]');
  const fila = hoja.locator('[data-pace-cal-destino="android"]');
  await fila.locator('button').click();
  await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('irá solo a tu calendario');
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
  return fila;
}

test.describe('en el iPhone', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true });

  test('el calendario del iPhone sale en la hoja, pide el permiso completo, lee la reunión y escribe el día libre, con aviso y rodeándola', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    await vis(page, '[data-pace-ritmo-tarjeta-calendario]').click();
    const hoja = page.locator('[data-pace-cal]');
    const fila = hoja.locator('[data-pace-cal-destino="android"]');
    await expect(fila.locator('.pace-rt-cal-n')).toHaveText('Calendario del iPhone');
    await expect(fila.locator('.pace-rt-cal-s')).toHaveText('El de Calendario, con tus cuentas de iCloud, Google u Outlook');
    await expect(fila.locator('button')).toHaveText('Conectar');
    expect(await llamadas(page, 'requestFullCalendarAccess'), 'el permiso se pide al tocar, no al abrir').toEqual([]);
    await fila.locator('button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toHaveText(
      'Conectado: cuando elijas cuánto trabajas, tu día irá solo a tu calendario. Hoy tienes 1 reunión: las opciones ya la rodean.');
    expect((await llamadas(page, 'requestFullCalendarAccess')).length).toBe(1);
    expect((await llamadas(page, 'instalado')).length, 'antes de leer el calendario se mira la marca de este iPhone').toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await expect(vis(page, '[data-pace-ritmo-tarjeta-calendario]')).toHaveText('Conectado');

    await vis(page, '[data-pace-ritmo-comienza]').click();
    await vis(page, 'button[data-pace-ritmo-opcion="jornada"]').click();
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'createEvent')).length, { message: 'el día no llegó al calendario del iPhone' }).toBeGreaterThan(3);
    const creados = await llamadas(page, 'createEvent');
    expect(creados.every((e) => e.availability === 1), 'lo de PACE va como libre').toBe(true);
    expect(creados.some((e) => (e.alerts || []).length === 1 && e.alerts[0] === 0), 'las pausas avisan al empezar').toBe(true);
    expect(creados.filter((e) => e.startDate < enMs('13:00') && e.endDate > enMs('12:00')).map((e) => e.title), 'el día pisa la reunión').toEqual([]);
    expect(errores).toEqual([]);
  });

  test('D-8 en el iPhone · la lista de otro iPhone (sin la marca de este) se olvida: la reunión no se toca', async ({ page, context }) => {
    /* La copia del iPhone viejo trae la lista con el id de la reunión, apuntado como de PACE. */
    const guardado = {
      'pace.calendario.android': JSON.stringify({ 'EK-7': { fin: enMs('13:00') } }),
      'pace.calendario.android.instalado': '1700000000000',
    };
    await abrir(page, context, { guardado, marca: 1763280000000 });
    await conectar(page);
    await vis(page, '[data-pace-ritmo-comienza]').click();
    await vis(page, 'button[data-pace-ritmo-opcion="jornada"]').click();
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'createEvent')).length).toBeGreaterThan(3);
    expect((await llamadas(page, 'deleteEvent')).map((o) => o.id), 'PACE borró la reunión').not.toContain('EK-7');
    expect((await llamadas(page, 'modifyEvent')).map((o) => o.id), 'PACE cambió la reunión').not.toContain('EK-7');
    expect(await page.evaluate(() => window.__nativo.eventos.some((e) => e.id === 'EK-7'))).toBe(true);
  });

  test('D-8 en el iPhone · CONTROL: con la marca de este iPhone la lista vale, y lo apuntado como de PACE se quita', async ({ page, context }) => {
    /* El mismo almacén, pero la marca casa: lo apuntado es de este iPhone y PACE lo gobierna. Sin
       este control, la prueba de arriba saldría verde aunque la marca no llegara nunca. */
    const guardado = {
      'pace.calendario.android': JSON.stringify({ 'EK-7': { fin: enMs('13:00') } }),
      'pace.calendario.android.instalado': '1763280000000',
    };
    await abrir(page, context, { guardado, marca: 1763280000000 });
    await conectar(page);
    await vis(page, '[data-pace-ritmo-comienza]').click();
    await vis(page, 'button[data-pace-ritmo-opcion="jornada"]').click();
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'createEvent')).length).toBeGreaterThan(3);
    await expect.poll(() => page.evaluate(() => window.__nativo.eventos.some((e) => e.id === 'EK-7')),
      { message: 'con la marca de este iPhone, lo apuntado como de PACE se gobierna' }).toBe(false);
  });
});

test('en la web, sin Capacitor, no sale el calendario del iPhone', async ({ page, context }) => {
  await sembrar(context, { ritmo: { libre: true } });
  await page.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
  await vis(page, '[data-pace-ritmo-tarjeta-calendario]').click();
  await expect(page.locator('[data-pace-cal-resumen]')).toBeVisible();
  await expect(page.locator('[data-pace-cal-destino="android"]')).toHaveCount(0);
  expect(await page.evaluate(() => [paceIosCalendario(), paceMovilCalendario()])).toEqual([false, false]);
});
