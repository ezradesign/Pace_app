/* PACE · el puente del calendario del móvil: los errores llegan y lo de PACE va privado
 * =====================================================================================
 * C2 (auditoría del 22 oct.) y la 1A de Ez del 26 oct. Lo que caía contra v0.181.1:
 *   · `paceAndroidLlamar` daba null ante cualquier error, así que una lista que fallaba se leía
 *     como un calendario vacío: el calendario que se mantiene solo volvía a crear todo lo que
 *     ya estaba, y «Añadir» escribía el día otra vez encima, sin quitar el anterior. En el móvil
 *     nunca salía «No se pudo».
 *   · lo que PACE escribe en el calendario del móvil no iba privado: el complemento no tiene
 *     `ACCESS_LEVEL`, y la pieza propia (PaceCalendario) no existía.
 *
 * El calendario del móvil es un espía que recuerda lo escrito (como en ritmo-calendario-solo):
 * se le puede pedir que falle al dar la lista o al marcar privado. PaceCalendario.privado
 * apunta qué eventos marca.
 *
 * NO CUBRE: Android de verdad. Que Google suba el evento como privado lo dice Google al
 * sincronizar; eso se mira en el móvil de Ez.
 *
 * El reloj va a las 9:00 de un jueves en Madrid, como en ritmo-calendario-solo.spec.js.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const NUEVE = new Date('2026-09-17T09:00:00+02:00');
const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const MINUTO = 61 * 1000;
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

/* `o.eventos`: lo que ya hay en el calendario del móvil; `o.instalado`: la hora de instalación
   que da Android (PaceCalendario.instalado); `o.guardado`: lo que trae el almacén de PACE. */
async function comoAndroid(context, opciones) {
  await context.addInitScript((o) => {
    Object.keys(o.guardado || {}).forEach((k) => { if (localStorage.getItem(k) === null) localStorage.setItem(k, o.guardado[k]); });
    const nativo = window.__nativo = { llamadas: [], eventos: (o.eventos || []).slice(), siguiente: 100, fallaLista: false, fallaPrivado: false,
      instalado: o.instalado === undefined ? 1760000000000 : o.instalado };
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
          requestFullCalendarAccess: apunta('requestFullCalendarAccess', () => ({ result: 'granted' })),
          checkAllPermissions: apunta('checkAllPermissions', () => ({ result: { readCalendar: 'granted', writeCalendar: 'granted' } })),
          listCalendars: apunta('listCalendars', () => ({ result: [{ id: '1', title: 'Personal', accountName: 'e@gmail.com', allowsContentModifications: true, visible: true }] })),
          getDefaultCalendar: apunta('getDefaultCalendar', () => ({ result: { id: '1' } })),
          listEventsInRange: apunta('listEventsInRange', (op) => {
            if (nativo.fallaLista) throw new Error('Failed to fetch events');
            return { result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) };
          }),
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: apunta('modifyEvent', (op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (e) Object.assign(e, op); }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
        /* La pieza propia: Events.ACCESS_LEVEL = ACCESS_PRIVATE (3) sobre un evento que existe. */
        PaceCalendario: {
          privado: apunta('privado', (op) => {
            if (nativo.fallaPrivado) throw new Error('No se pudo marcar privado');
            const e = nativo.eventos.find((x) => x.id === op.id);
            if (!e) throw new Error('El evento no está en el calendario: ' + op.id);
            e.accessLevel = 3;
          }),
          instalado: apunta('instalado', () => ({ instalado: nativo.instalado })),
        },
      },
    };
  }, opciones || {});
}
const llamadas = (page, metodo) => page.evaluate((m) => window.__nativo.llamadas.filter((l) => l.metodo === m).map((l) => l.opts), metodo);
const dePace = (page) => page.evaluate(() => window.__nativo.eventos.filter((e) => (e.description || '').includes('pacegrass.app')));

async function abrir(page, context, opciones) {
  await comoAndroid(context, opciones);
  await sembrar(context, { ritmo: { dia: JORNADA }, sidebarCollapsed: true });
  await page.clock.install({ time: NUEVE });
  await irAlArtefacto(page);
}

async function hojaMovil(page) {
  await vis(page, '[data-pace-ritmo-ver]').click();
  await vis(page, '[data-pace-ritmo-lista]').waitFor();
  await vis(page, '[data-pace-ritmo-calendario]').click();
  return page.locator('[data-pace-cal]');
}

test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  test('C2 · si la lista falla, el calendario que se mantiene solo no vuelve a crear lo que ya estaba, y dice «No se pudo»', async ({ page, context }) => {
    const errores = capturarErrores(page);
    await abrir(page, context);
    const hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-reuniones]').uncheck();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se pone al día solo');
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    const creados = (await llamadas(page, 'createEvent')).length;
    expect(creados).toBe(10);

    /* El día cambia y Android no da la lista. */
    await page.evaluate(() => { window.__nativo.fallaLista = true; });
    await page.evaluate(() => ritmoHorario('comidaDur', 45));
    await page.clock.runFor(MINUTO);
    await expect.poll(() => page.evaluate(() => calendarioSoloEstado().fallo), { message: 'una lista que falla no es un fallo' }).toBe(true);
    expect((await llamadas(page, 'createEvent')).length, 'volvió a crear lo que ya estaba en el calendario').toBe(creados);
    await vis(page, '[data-pace-ritmo-ver]').click();
    await expect(vis(page, '[data-pace-ritmo-calendario]')).toHaveText('No se pudo poner al día');

    /* Android vuelve a dar la lista: al reintento se pone al día, sin duplicar. */
    await page.evaluate(() => { window.__nativo.fallaLista = false; });
    await page.clock.runFor(5 * MINUTO);
    await expect.poll(() => page.evaluate(() => calendarioSoloEstado().fallo)).toBe(false);
    const mios = await dePace(page);
    expect(new Set(mios.map((e) => e.title + e.startDate)).size, 'hay eventos de PACE repetidos').toBe(mios.length);
    expect(mios.length).toBeGreaterThanOrEqual(10);
    expect(errores).toEqual([]);
  });

  test('C2 · «Añadir» de una vez: si no se puede leer el calendario, no escribe encima y dice «No se pudo»', async ({ page, context }) => {
    await abrir(page, context);
    let hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-mantener]').uncheck();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('bloques en tu calendario');
    const creados = (await llamadas(page, 'createEvent')).length;

    await page.evaluate(() => { window.__nativo.fallaLista = true; });
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="error"]'), 'leyó un calendario vacío y lo dio por hecho')
      .toHaveText('No se pudo hablar con el calendario. Prueba otra vez en un momento.');
    expect((await llamadas(page, 'createEvent')).length, 'escribió el día otra vez encima del que ya estaba').toBe(creados);
    expect(await llamadas(page, 'deleteEvent')).toEqual([]);
  });

  test('lo que PACE escribe en el calendario del móvil va privado, al crear y al cambiar', async ({ page, context }) => {
    await abrir(page, context);
    const hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-reuniones]').uncheck();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('se pone al día solo');
    const creados = (await llamadas(page, 'createEvent')).length;
    expect(creados).toBe(10);
    expect((await dePace(page)).filter((e) => e.accessLevel === 3), 'lo creado no va privado').toHaveLength(10);

    /* Un cambio en el día: lo cambiado también se marca. */
    await page.getByRole('button', { name: 'Listo', exact: true }).click();
    await page.evaluate(() => { window.__nativo.eventos.forEach((e) => { delete e.accessLevel; }); });
    await page.evaluate(() => ritmoHorario('comidaDur', 45));
    await page.clock.runFor(MINUTO);
    await expect.poll(async () => (await llamadas(page, 'modifyEvent')).length).toBeGreaterThan(0);
    const cambiados = (await llamadas(page, 'modifyEvent')).map((o) => o.id);
    await expect.poll(async () => (await llamadas(page, 'privado')).length).toBeGreaterThanOrEqual(creados + cambiados.length);
    const privados = (await dePace(page)).filter((e) => e.accessLevel === 3).map((e) => e.id);
    cambiados.forEach((id) => expect(privados, 'lo cambiado no va privado: ' + id).toContain(id));
  });

  test('si no se puede marcar privado, lo dice, y al reintentar no deja eventos sueltos ni repetidos', async ({ page, context }) => {
    await abrir(page, context);
    const hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-reuniones]').uncheck();
    await page.evaluate(() => { window.__nativo.fallaPrivado = true; });
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="error"]')).toHaveText('No se pudo hablar con el calendario. Prueba otra vez en un momento.');
    /* Lo que llegó a crearse es de PACE: no se queda suelto como si fuera de otro. */
    const sueltos = await page.evaluate(() => window.__nativo.eventos.filter((e) => !calendarioAndroidEsDePace(e)).map((e) => e.id));
    expect(sueltos, 'un evento creado quedó sin apuntar como de PACE').toEqual([]);

    await page.evaluate(() => { window.__nativo.fallaPrivado = false; });
    await page.clock.runFor(5 * MINUTO);
    await expect.poll(() => page.evaluate(() => calendarioSoloEstado().fallo)).toBe(false);
    const mios = await dePace(page);
    expect(new Set(mios.map((e) => e.title + e.startDate)).size, 'hay eventos de PACE repetidos').toBe(mios.length);
    expect(mios.every((e) => e.accessLevel === 3), 'tras el reintento queda alguno sin marcar').toBe(true);
  });
});

/* D-8 A (Ez, 11 nov. 2026; sexta revisión externa, n.º 4). La copia automática de Google se
   lleva a un Android restaurado el almacén entero de PACE, y con él `pace.calendario.android`:
   los ids de los eventos que PACE puso en el calendario del OTRO móvil. En el nuevo, el id 7
   puede ser una reunión de verdad, y PACE la borraba al llevar el día (o al ponerlo al día
   solo) y dejaba de contarla como reunión. Ahora la lista va con la hora de instalación de
   Android y se olvida si no casa. Rojo sin `calendarioAndroidListo` (que no mire la hora). */
const HORA = (h) => new Date(FECHA + 'T' + h + ':00+02:00').getTime();
const REUNION = { id: '7', title: 'Revisión con Ana', startDate: HORA('12:00'), endDate: HORA('12:30'),
  isAllDay: false, availability: 0, status: 'confirmed' };
const DEL_OTRO_MOVIL = { 'pace.calendario.android': JSON.stringify({ 7: { fin: HORA('12:30') } }),
  'pace.calendario.android.instalado': '1700000000000' };

test.describe('D-8 · en un Android restaurado de la copia de Google', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  for (const modo of ['de una vez', 'solo']) {
    test(`PACE no borra la reunión cuyo id venía en la lista del otro móvil (${modo})`, async ({ page, context }) => {
      await abrir(page, context, { eventos: [REUNION], guardado: DEL_OTRO_MOVIL, instalado: 1762000000000 });
      const hoja = await hojaMovil(page);
      if (modo === 'de una vez') await hoja.locator('[data-pace-cal-mantener]').uncheck();
      await hoja.locator('[data-pace-cal-destino="android"] button').click();
      await expect(hoja.locator('[data-pace-cal-aviso="ok"]'))
        .toContainText(modo === 'solo' ? 'se pone al día solo' : 'bloques en tu calendario');
      expect((await llamadas(page, 'deleteEvent')).map((o) => o.id), 'PACE borró la reunión de otra persona').not.toContain('7');
      expect((await llamadas(page, 'modifyEvent')).map((o) => o.id), 'PACE cambió la reunión de otra persona').not.toContain('7');
      expect(await page.evaluate(() => window.__nativo.eventos.some((e) => e.id === '7'))).toBe(true);
      expect(await page.evaluate(() => getState().ritmo.ocupado.tramos.length), 'la reunión no cuenta como reunión').toBe(1);
      const guardado = await page.evaluate(() => [JSON.parse(localStorage.getItem('pace.calendario.android')),
        localStorage.getItem('pace.calendario.android.instalado')]);
      expect(Object.keys(guardado[0])).not.toContain('7');
      expect(guardado[1], 'no guardó la hora de instalación de este móvil').toBe('1762000000000');
    });
  }

  test('una versión de antes (la lista sin hora) también se olvida', async ({ page, context }) => {
    await abrir(page, context, { eventos: [REUNION], guardado: { 'pace.calendario.android': DEL_OTRO_MOVIL['pace.calendario.android'] } });
    const hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-mantener]').uncheck();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('bloques en tu calendario');
    expect((await llamadas(page, 'deleteEvent')).map((o) => o.id)).not.toContain('7');
  });

  test('CONTROL · en el mismo móvil, lo que puso PACE se sigue quitando y cambiando', async ({ page, context }) => {
    const mio = { id: '7', title: 'Foco 1 de 9', description: 'pacegrass.app', startDate: HORA('12:00'), endDate: HORA('12:30'),
      isAllDay: false, availability: 1, status: 'confirmed' };
    await abrir(page, context, { eventos: [mio], guardado: DEL_OTRO_MOVIL, instalado: 1700000000000 });
    const hoja = await hojaMovil(page);
    await hoja.locator('[data-pace-cal-mantener]').uncheck();
    await hoja.locator('[data-pace-cal-destino="android"] button').click();
    await expect(hoja.locator('[data-pace-cal-aviso="ok"]')).toContainText('bloques en tu calendario');
    expect((await llamadas(page, 'deleteEvent')).map((o) => o.id), 'olvidó la lista en el mismo móvil').toContain('7');
  });
});
