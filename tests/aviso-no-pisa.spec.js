/* PACE · E2E · EL AVISO DE FIN DEL BLOQUE SIGUIENTE NO PISA AL ANTERIOR
 * =====================================================================
 * Fila 17 de la cola de las auditorías de Fable (externa T4). Quien no cierra el aviso de un bloque
 * perdía el del siguiente:
 *  · En la web, todos llevaban la misma etiqueta y `silent`: el nuevo sustituía al viejo sin asomar.
 *    Ahora la etiqueta es del bloque (`pace-focus-end-<bloque>`) y el aviso nuevo cierra los de
 *    bloques anteriores. Sigue `silent`: la campana es la de PACE.
 *  · En Android, el complemento avisa con `setOnlyAlertOnce(true)` y el mismo id (1, y 3 la pausa):
 *    con el viejo aún en la bandeja, el nuevo lo sustituía sin sonar, y como la campana de ese bloque
 *    es de Android, no sonaba nada. En el iPhone, `cancel` no quita lo entregado. Ahora, antes de
 *    pedir el aviso de otro bloque u otra pausa, se quita de la bandeja el que ya llegó
 *    (`removeDeliveredNotifications`), y el nuevo llega como nuevo.
 * NO CUBRE: cómo lo enseña de verdad el sistema (en un móvil y en un navegador con avisos).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const BLOQUE = 25 * 60 * 1000;
const cta = (p) => p.locator('[data-pace-cta]');

/* Un Android o un iPhone falso, como el de pausa-aviso.spec.js, que además quita lo entregado. */
async function comoMovil(context, plataforma) {
  await context.addInitScript((p) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {}, puestos: {} };
    const apunta = (metodo, opts) => nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
    const LocalNotifications = {
      checkPermissions: () => Promise.resolve({ display: 'granted' }),
      requestPermissions: () => Promise.resolve({ display: 'granted' }),
      checkExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
      createChannel: (op) => { apunta('createChannel', op); return Promise.resolve(); },
      schedule: (op) => {
        apunta('schedule', op);
        op.notifications.forEach((n) => { nativo.puestos[n.id] = new Date(n.schedule.at).getTime(); });
        return Promise.resolve({ notifications: op.notifications.map((n) => ({ id: n.id })) });
      },
      cancel: (op) => { apunta('cancel', op); op.notifications.forEach((n) => { delete nativo.puestos[n.id]; }); return Promise.resolve(); },
      removeDeliveredNotifications: (op) => { apunta('removeDelivered', op); return Promise.resolve(); },
    };
    window.Capacitor = {
      getPlatform: () => p,
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; },
          minimizeApp: () => Promise.resolve(),
        },
        LocalNotifications,
      },
    };
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach((cb) => cb(datos));
  }, plataforma);
}

const llamadas = (page) => page.evaluate(() => window.__nativo.llamadas);
const alFondo = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: false }));
const alVolver = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: true }));

/* Lo que se pidió con el id dado, en orden: 'quitar' (lo entregado) o la hora de un `schedule`. */
async function pasos(page, id) {
  return (await llamadas(page)).map((l) => {
    if (l.metodo === 'removeDelivered' && l.opts.notifications[0].id === id) return 'quitar';
    if (l.metodo === 'schedule' && l.opts.notifications[0].id === id) return new Date(l.opts.notifications[0].schedule.at).getTime();
    return null;
  }).filter((x) => x !== null);
}

for (const plataforma of ['android', 'ios']) {
  test(`aviso-no-pisa · ${plataforma} · antes del aviso del bloque 2 se quita de la bandeja el del bloque 1`, async ({ page, context }) => {
    await sembrar(context, { soundOn: true });
    await comoMovil(context, plataforma);
    await context.clock.install({ time: ARRANQUE });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(cta(page)).toHaveText('Pausar');
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    const fin1 = await page.evaluate(() => window.__nativo.puestos[1]);
    expect(await pasos(page, 1), 'con nada entregado antes, no hay nada que quitar').toEqual([fin1]);

    /* El bloque 1 acaba en el fondo: el sistema lo entrega y se queda en la bandeja. */
    await context.clock.fastForward(BLOQUE + 2000);
    await context.clock.runFor(1500);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    await alVolver(page);
    /* Al volver se abre la ventana de la pausa: «Ahora no», y otro bloque. */
    await page.getByRole('button', { name: 'Ahora no', exact: true }).click();
    await cta(page).click();
    await expect(cta(page)).toHaveText('Pausar');
    await alFondo(page);
    await esperarEnPagina(page, (f) => window.__nativo.puestos[1] && window.__nativo.puestos[1] !== f, fin1);
    const fin2 = await page.evaluate(() => window.__nativo.puestos[1]);
    expect(await pasos(page, 1), 'el aviso del bloque 2 se pidió con el del bloque 1 aún en la bandeja').toEqual([fin1, 'quitar', fin2]);
  });
}

test('aviso-no-pisa · android · la pausa siguiente quita también el aviso de la pausa anterior (id 3)', async ({ page, context }) => {
  await sembrar(context, { soundOn: true });
  await comoMovil(context, 'android');
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  const pausa = page.locator('[data-pace-tabs] button').filter({ hasText: 'Pausa' }).first();
  await pausa.click();
  await expect(cta(page)).toHaveText('Empezar pausa');
  await cta(page).click();
  await alFondo(page);
  await esperarEnPagina(page, () => !!window.__nativo.puestos[3]);
  const fin1 = await page.evaluate(() => window.__nativo.puestos[3]);
  await context.clock.fastForward(5 * 60 * 1000 + 2000);
  await context.clock.runFor(1500);
  await alVolver(page);
  await expect(cta(page)).not.toHaveText('Pausar');
  await cta(page).click();
  await expect(cta(page)).toHaveText('Pausar');
  await alFondo(page);
  await esperarEnPagina(page, (f) => window.__nativo.puestos[3] && window.__nativo.puestos[3] !== f, fin1);
  const fin2 = await page.evaluate(() => window.__nativo.puestos[3]);
  expect(await pasos(page, 3)).toEqual([fin1, 'quitar', fin2]);
});

test('aviso-no-pisa · web · cada bloque avisa con su etiqueta y el aviso nuevo cierra el del bloque anterior', async ({ page, context }) => {
  await sembrar(context, { soundOn: false, notifyFocusEnd: true, focusMinutes: 5 });
  /* Un navegador con el permiso dado, la pestaña de PACE detrás y un service worker que apunta. */
  await context.addInitScript(() => {
    const avisos = window.__avisos = [];
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    try { Object.defineProperty(Notification, 'permission', { configurable: true, get: () => 'granted' }); } catch (e) {}
    const reg = {
      showNotification: (title, o) => {
        avisos.push({ title, tag: o.tag, silent: o.silent, cerrado: false });
        return Promise.resolve();
      },
      getNotifications: () => Promise.resolve(avisos.filter((a) => !a.cerrado).map((a) => ({ tag: a.tag, close: () => { a.cerrado = true; } }))),
    };
    if (navigator.serviceWorker) navigator.serviceWorker.getRegistration = () => Promise.resolve(reg);
  });
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
  for (let n = 1; n <= 2; n++) {
    await cta(page).click();
    await expect(cta(page)).toHaveText('Pausar');
    await context.clock.fastForward(5 * 60 * 1000 + 2000);
    await context.clock.runFor(1500);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    await esperarEnPagina(page, (k) => window.__avisos.length === k, n);
  }
  const avisos = await page.evaluate(() => window.__avisos);
  expect(avisos.every((a) => a.silent), 'el aviso de la web sonó: la campana es la de PACE').toBe(true);
  expect(avisos[0].tag).toMatch(/^pace-focus-end-.+/);
  expect(avisos[1].tag, 'los dos bloques avisaron con la misma etiqueta: el segundo pisa al primero sin asomar').not.toBe(avisos[0].tag);
  expect(avisos[0].cerrado, 'el aviso del bloque 1 seguía abierto junto al del bloque 2').toBe(true);
  expect(avisos[1].cerrado).toBe(false);
});
