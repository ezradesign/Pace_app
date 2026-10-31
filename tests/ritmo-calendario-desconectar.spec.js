/* PACE · E2E · DESCONECTAR EL CALENDARIO QUE SE MANTIENE SOLO (auditoría del 22 oct. 2026)
 * =======================================================================================
 * Dos casos comprobados en el código; contra v0.174.2 fallan los dos.
 *
 *  C1 · UNA ESCRITURA QUE SIGUE DESPUÉS DE DESCONECTAR. «Desconectar» no pasaba por la cola
 *       ni por el cerrojo del motor, y una escritura ya en marcha solo miraba si seguía
 *       conectado al empezar: si respondía después, volvía a poner lo quitado («Quitarlo»)
 *       o cambiaba lo que se dejó («Dejarlo»), y guardaba `pace.calendario.escrito` después
 *       de que la desconexión lo vaciara. Ahora la desconexión cambia la generación al
 *       momento y la escritura la mira antes de cada paso y antes de guardar.
 *  C3 · EN ANDROID, DESCONECTADO, SEGUÍA LEYENDO LAS REUNIONES. «Desconectar» dejaba el
 *       destino y las reuniones, y al volver a la app se leían con el permiso del sistema
 *       (en la web no, porque se borra el pase). Ahora deja de leer en los dos, y una
 *       lectura que ya estaba en marcha no se guarda.
 *  (C2, que el estado diga un fallo de escritura, va en ritmo-calendario-solo.spec.js:
 *  aquí no puede fallar nada, porque el puente de Android se traga los errores.)
 *
 * Un calendario del móvil espía (como en ritmo-calendario-solo.spec.js) que, con `retener`,
 * deja la siguiente lectura sin contestar hasta `window.__soltar()`. Jueves a las 9:00.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores } = require('./helpers');

const FECHA = '2026-09-17';
const JORNADA = { fecha: FECHA, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const MINUTO = 61 * 1000;
const vis = (page, sel) => page.locator(sel).filter({ visible: true });

async function comoAndroid(context) {
  await context.addInitScript(() => {
    const nativo = window.__nativo = { llamadas: [], eventos: [], siguiente: 100, retener: false };
    const apunta = (metodo, contesta) => function (opts) {
      nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)), t: Date.now() });
      return Promise.resolve(contesta(opts));
    };
    const lista = (op) => ({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) });
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
          /* `retener`: la lista se calcula al soltarla, como si el móvil tardara en contestar */
          listEventsInRange: (op) => {
            nativo.llamadas.push({ metodo: 'listEventsInRange', opts: op, t: Date.now() });
            if (!nativo.retener) return Promise.resolve(lista(op));
            nativo.retener = false;
            return new Promise((ok) => { window.__soltar = () => { window.__soltar = null; ok(lista(op)); }; });
          },
          createEvent: apunta('createEvent', (op) => { const id = String(nativo.siguiente++); nativo.eventos.push(Object.assign({ id, isAllDay: false, status: 'confirmed' }, op)); return { id }; }),
          modifyEvent: apunta('modifyEvent', (op) => { const e = nativo.eventos.find((x) => x.id === op.id); if (e) Object.assign(e, op); }),
          deleteEvent: apunta('deleteEvent', (op) => { nativo.eventos = nativo.eventos.filter((e) => e.id !== op.id); }),
        },
      },
    };
  });
}
const llamadasDesde = (page, desde) => page.evaluate((t0) => window.__nativo.llamadas.filter((l) => l.t >= t0).map((l) => l.metodo), desde);
const dePace = (page) => page.evaluate(() => window.__nativo.eventos.filter((e) => (e.description || '').includes('pacegrass.app')).length);
const escrito = (page) => page.evaluate(() => localStorage.getItem('pace.calendario.escrito'));
const ajustes = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.calendario);

async function hoja(page) {
  await vis(page, '[data-pace-ritmo-ver]').click();
  await vis(page, '[data-pace-ritmo-lista]').waitFor();
  await vis(page, '[data-pace-ritmo-calendario]').click();
  return page.locator('[data-pace-cal]');
}
/* Conectado con «Mantenerlo al día solo», como lo deja «Añadir». */
async function conectado(page, context) {
  await comoAndroid(context);
  await sembrar(context, { sidebarCollapsed: true, ritmo: { dia: JORNADA } });
  await page.clock.install({ time: new Date(FECHA + 'T09:00:00+02:00') });
  await irAlArtefacto(page);
  const h = await hoja(page);
  await h.locator('[data-pace-cal-destino="android"] button').click();
  await expect(h.locator('[data-pace-cal-aviso="ok"]')).toContainText('se pone al día solo');
  expect(await dePace(page), 'GUARD: el día está en el calendario').toBe(10);
  await page.getByRole('button', { name: 'Listo', exact: true }).click();
}

test.describe('en Android', () => {
  test.use({ viewport: { width: 360, height: 730 }, isMobile: true, hasTouch: true });

  for (const [boton, nombre] of [['[data-pace-cal-dejar]', '«Dejarlo»'], ['[data-pace-cal-quitar]', '«Quitarlo»']]) {
    test('C1 · desconectar con ' + nombre + ' mientras una escritura espera respuesta: después no se escribe nada', async ({ page, context }) => {
      const errores = capturarErrores(page);
      await conectado(page, context);
      /* el día cambia y, al minuto, el motor pide la lista para ponerlo al día: se queda esperando */
      await page.evaluate(() => { window.__nativo.retener = true; ritmoHorario('comidaDur', 45); });
      await page.clock.runFor(MINUTO);
      await expect.poll(() => page.evaluate(() => typeof window.__soltar), 'GUARD: la escritura espera la lista').toBe('function');

      const h = await hoja(page);
      await h.locator('[data-pace-cal-desconectar]').click();
      const t0 = await page.evaluate(() => Date.now());
      await h.locator(boton).click();
      await page.evaluate(() => window.__soltar());
      await expect(h.locator('[data-pace-cal-aviso="ok"]')).toContainText('Desconectado.');
      await page.clock.runFor(MINUTO);
      const despues = await llamadasDesde(page, t0);
      expect(despues.filter((m) => m === 'createEvent' || m === 'modifyEvent'), 'la escritura de antes siguió').toEqual([]);
      expect(await escrito(page), 'lo escrito se guardó después de vaciarlo').toBeNull();
      expect(await dePace(page)).toBe(nombre === '«Quitarlo»' ? 0 : 10);
      expect((await ajustes(page)).mantener).toBe(false);
      expect(errores).toEqual([]);
    });
  }

  test('C3 · desconectado, PACE deja de leer las reuniones, y una lectura en marcha no se guarda', async ({ page, context }) => {
    await conectado(page, context);
    /* una lectura de reuniones que el móvil aún no ha contestado, y una reunión nueva */
    await page.evaluate(() => {
      window.__nativo.eventos.push({ id: 'r1', title: 'Equipo', startDate: Date.parse('2026-09-17T12:00:00+02:00'), endDate: Date.parse('2026-09-17T12:30:00+02:00'), isAllDay: false, availability: 0, status: 'confirmed', description: '' });
      window.__nativo.retener = true;
      calendarioRefrescarReuniones(true);
    });
    await expect.poll(() => page.evaluate(() => typeof window.__soltar)).toBe('function');
    const h = await hoja(page);
    await h.locator('[data-pace-cal-desconectar]').click();
    await h.locator('[data-pace-cal-dejar]').click();
    await expect(h.locator('[data-pace-cal-aviso="ok"]')).toContainText('Desconectado.');
    await page.evaluate(() => window.__soltar());
    await page.clock.runFor(2000);
    const ocupado = await page.evaluate(() => (JSON.parse(localStorage.getItem('pace.state.v2')).ritmo.ocupado || {}).tramos || []);
    expect(ocupado, 'la lectura de antes se guardó').toEqual([]);
    /* y al volver a la app (o cada minuto) no se vuelve a leer */
    const t0 = await page.evaluate(() => Date.now());
    await page.evaluate(() => { calendarioRefrescarReuniones(true); document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(6 * MINUTO);
    expect((await llamadasDesde(page, t0)).filter((m) => m === 'listEventsInRange'), 'sigue leyendo el calendario').toEqual([]);
  });
});
