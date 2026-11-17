/* PACE · el calendario a la vista, antes de elegir el día
 * ======================================================
 * Ez, 16 nov. 2026 (1A y 2A, docs/proposals/calendario-vista-16nov/): «Al calendario» sale ya en
 * la tarjeta «¿Cuánto trabajas hoy?», en el ordenador junto a «Ajustar el horario» y en el móvil al
 * final del esquema, y abre la hoja de siempre sin día. Allí «Conectar» da el permiso, lee las
 * reuniones de hoy (para que las opciones ya las rodeen) y deja «Mantenerlo al día solo» encendido:
 * al elegir, el día llega solo.
 *
 * Lo que se mira: que el enlace esté y no añada alto (la home sin scroll, regla de Ez; con la letra
 * al 115 % lo mide tests/home-sin-scroll.spec.js), que la hoja se abra sin día, y en un Android
 * fingido como en tests/android-calendario.spec.js, el recorrido entero hasta que el día está en
 * el calendario, esquivando la reunión.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const DIEZ = new Date('2026-11-16T10:00:00+01:00');
const MINUTO = 61 * 1000;
const enMs = (hhmm) => new Date('2026-11-16T' + hhmm + ':00+01:00').getTime();
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* Un Android con el calendario del móvil SIN permiso todavía y una reunión de 12:00 a 13:00. */
async function comoAndroid(context) {
  await context.addInitScript((reunion) => {
    const nativo = window.__nativo = { llamadas: [], eventos: [reunion], siguiente: 100, permiso: 'prompt' };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      try { return Promise.resolve(contesta(opts)); } catch (e) { return Promise.reject(e); }
    };
    window.Capacitor = {
      getPlatform: () => 'android', isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }) },
        CapacitorCalendar: {
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => { nativo.permiso = 'granted'; return { result: 'granted' }; }),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: nativo.permiso, writeCalendar: nativo.permiso } })),
          listCalendars: apunta('listCalendars', () => ({ result: [{ id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true }] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: '1' } })),
          listEventsInRange: apunta('listEventsInRange', (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) })),
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: apunta('modifyEvent', (op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (e) Object.assign(e, op); }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
        PaceCalendario: {
          privado: apunta('privado', () => {}),
          instalado: apunta('instalado', () => ({ instalado: 1760000000000 })),
        },
      },
    };
  }, { id: '7', title: 'Reunión', startDate: enMs('12:00'), endDate: enMs('13:00'), isAllDay: false, availability: 0, status: 'confirmed' });
}
const llamadas = (page, metodo) => page.evaluate((m) => window.__nativo.llamadas.filter((l) => l.metodo === m).map((l) => l.opts), metodo);
const ritmo = (page) => page.evaluate(() => getState().ritmo || {});

async function abrir(page, context, android) {
  if (android) await comoAndroid(context);
  await sembrar(context, { ritmo: { libre: true }, sidebarCollapsed: true });
  await page.clock.install({ time: DIEZ });
  await irAlArtefacto(page);
}

/* La tarjeta mide lo mismo con el enlace que sin él: el enlace no añade alto. */
async function altoConYSin(page) {
  return page.evaluate(() => {
    const vista = (e) => e && e.getBoundingClientRect().width > 0;
    const tarjeta = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta]')).find(vista);
    const enlace = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta-calendario]')).find(vista);
    const con = tarjeta.getBoundingClientRect().height;
    enlace.style.display = 'none';
    const sin = tarjeta.getBoundingClientRect().height;
    enlace.style.display = '';
    return { con, sin };
  });
}

/* Lo que se ve del enlace (el texto y el dibujo) no pisa nada de la tarjeta y no se sale de ella. */
async function pisa(page) {
  return page.evaluate(() => {
    const vista = (e) => e && e.getBoundingClientRect().width > 0;
    const tarjeta = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta]')).find(vista);
    const enlace = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta-calendario]')).find(vista);
    const caja = Array.from(enlace.querySelectorAll('span, svg')).map((e) => e.getBoundingClientRect())
      .reduce((a, b) => ({ left: Math.min(a.left, b.left), right: Math.max(a.right, b.right), top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) }));
    const corta = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const otros = Array.from(tarjeta.querySelectorAll('button, [data-pace-ritmo-tarjeta-titulo], .pace-rt-esq-punto, .pace-rt-tm-nota, .pace-rt-tm-pildora'))
      .filter((e) => vista(e) && !enlace.contains(e) && !e.contains(enlace));
    const rt = tarjeta.getBoundingClientRect();
    const fuera = caja.left < rt.left || caja.right > rt.right || caja.top < rt.top || caja.bottom > rt.bottom;
    return otros.filter((e) => corta(caja, e.getBoundingClientRect())).map((e) => e.textContent.trim().slice(0, 20) || e.className)
      .concat(fuera ? ['se sale de la tarjeta'] : []);
  });
}

test.describe('en el ordenador', () => {
  test('«Al calendario» está en la tarjeta antes de elegir, sin añadir alto, y abre la hoja sin día', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    const enlace = vis(page, '[data-pace-ritmo-tarjeta-calendario]');
    await expect(enlace).toHaveText('Al calendario');
    /* En la cabecera, delante de «Ajustar el horario». */
    const [a, b] = [await enlace.boundingBox(), await vis(page, '[data-pace-ritmo-ajustar]').boundingBox()];
    expect(a.x + a.width).toBeLessThan(b.x);
    const altos = await altoConYSin(page);
    expect(altos.con, 'el enlace hace crecer la tarjeta').toBe(altos.sin);
    expect(await pisa(page)).toEqual([]);

    await enlace.click();
    const hoja = page.locator('[data-pace-cal]');
    await expect(hoja.locator('[data-pace-cal-resumen]')).toHaveText('Cuando elijas cuánto trabajas, tu día irá a tu calendario: cada bloque con su pausa.');
    await expect(hoja.locator('[data-pace-cal-destino="archivo"]')).toBeVisible();
    expect((await ritmo(page)).dia || null, 'abrir la hoja no elige el día').toBe(null);
    expect(errores).toEqual([]);
  });
});

test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('al final del esquema, sin alto; «Conectar» da el permiso y lee la reunión, y al elegir el día va solo y la rodea', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context, true);
    const enlace = vis(page, '[data-pace-ritmo-tarjeta-calendario]');
    await expect(enlace).toHaveText('Al calendario');
    const altos = await altoConYSin(page);
    expect(altos.con, 'el enlace hace crecer la tarjeta').toBe(altos.sin);
    expect(await pisa(page)).toEqual([]);
    expect(await llamadas(page, 'listEventsInRange'), 'sin conectar, PACE no lee el calendario').toEqual([]);

    await enlace.click();
    const hoja = page.locator('[data-pace-cal]');
    const movil = hoja.locator('[data-pace-cal-destino="android"]');
    await expect(movil.locator('button')).toHaveText('Conectar');
    await expect(hoja.locator('[data-pace-cal-mantener]')).toBeChecked();
    await expect(hoja.locator('[data-pace-cal-reuniones]')).toBeChecked();
    await movil.locator('button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toHaveText(
      'Conectado: cuando elijas cuánto trabajas, tu día irá solo a tu calendario. Hoy tienes 1 reunión: las opciones ya la rodean.');
    expect((await llamadas(page, 'requestFullCalendarAccess')).length).toBe(1);
    const r = await ritmo(page);
    expect(r.calendario).toMatchObject({ destino: 'android', mantener: true, reuniones: true });
    expect(r.ocupado.tramos.length, 'la reunión no se guardó').toBe(1);
    expect(await llamadas(page, 'createEvent'), 'sin día no se escribe nada').toEqual([]);
    await expect(movil.locator('.pace-rt-cal-s')).toHaveText('Conectado · tu día irá aquí al elegirlo');
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await expect(enlace).toHaveText('Conectado');

    /* Al elegir, el motor escribe el día al minuto, como libre y sin pisar la reunión. */
    await vis(page, '[data-pace-ritmo-comienza]').click();
    await vis(page, 'button[data-pace-ritmo-opcion="jornada"]').click();
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'createEvent')).length, { message: 'el día no llegó al calendario' }).toBeGreaterThan(3);
    const creados = await llamadas(page, 'createEvent');
    expect(creados.every((e) => e.availability === 1), 'lo de PACE va como libre').toBe(true);
    const pisan = creados.filter((e) => e.startDate < enMs('13:00') && e.endDate > enMs('12:00'));
    expect(pisan.map((e) => e.title), 'el día pisa la reunión').toEqual([]);
    expect(errores).toEqual([]);
  });
});
