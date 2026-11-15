/* PACE · E2E · EL AVISO A TU HORA DE ENTRADA (Ez, 1A y 2A del 15 nov. 2026)
 * ======================================================================
 * Un aviso por la mañana, a tu hora de entrada, para quien lo encienda en «Tu semana», en
 * Android y en el iPhone (ui/nativo.entrada.js). Apagado de fábrica; solo los días de jornada
 * o media de la semana guardada; con las palabras de la tarjeta de la mañana («Hoy, como cada
 * jueves» · «Jornada de 9:00 a 17:00. Tu día ya está preparado.»). Se ponen siempre los de los
 * siete días siguientes, desde mañana: si hoy abriste PACE antes de tu hora, el de hoy no sale.
 * Maqueta elegida: docs/proposals/maquetas-uso-15nov/.
 *
 * Aquí se mira lo que PACE le pide al complemento de avisos (un Android de mentira, como en
 * android-avisos.spec.js); que suene en un móvil de verdad, no: pasos en la página.
 * Mutantes: con el bucle empezando en hoy, cae «abierto antes de la hora»; sin mirar el tipo del
 * día, cae la primera (avisaría en sábado y domingo); sin mirar `avisoEntrada`, cae «apagado».
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'media', 'libre', 'libre'];
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const IDS = [10, 11, 12, 13, 14, 15, 16];

async function comoAndroid(context) {
  await context.addInitScript(() => {
    const nativo = window.__nativo = { llamadas: [] };
    const apunta = (metodo, opts) => nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
        LocalNotifications: {
          checkPermissions: () => Promise.resolve({ display: 'granted' }),
          requestPermissions: (op) => { apunta('requestPermissions', op); return Promise.resolve({ display: 'granted' }); },
          checkExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
          changeExactNotificationSetting: () => Promise.resolve({ exact_alarm: 'granted' }),
          createChannel: (op) => { apunta('createChannel', op); return Promise.resolve(); },
          schedule: (op) => { apunta('schedule', op); return Promise.resolve({ notifications: op.notifications.map((n) => ({ id: n.id })) }); },
          cancel: (op) => { apunta('cancel', op); return Promise.resolve(); },
        },
        PaceAvisoFijo: { poner: () => Promise.resolve(), quitar: () => Promise.resolve() },
      },
    };
  });
}

/* Los avisos de entrada que PACE pidió la última vez (ids del 10 al 16), o [] si no pidió ninguno. */
async function avisosPuestos(page) {
  await page.waitForTimeout(400);
  const llamadas = await page.evaluate(() => window.__nativo.llamadas);
  const puestos = llamadas.filter((l) => l.metodo === 'schedule')
    .map((l) => l.opts.notifications.filter((n) => IDS.indexOf(n.id) !== -1))
    .filter((lista) => lista.length);
  return puestos.length ? puestos[puestos.length - 1] : [];
}

async function abrir(page, context, ritmo, cuando) {
  await sembrar(context, { soundOn: false, ritmo });
  await comoAndroid(context);
  await page.clock.install({ time: cuando });
  await irAlArtefacto(page);
}

const local = (iso) => { const d = new Date(iso); return [d.getDate(), d.getHours(), d.getMinutes()]; };

test('encendido: los días de jornada y media de la semana que sigue, desde mañana, con las palabras de la mañana', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  const avisos = await avisosPuestos(page);
  /* Del jueves 19 al miércoles 25: jueves, viernes (media), lunes, martes y miércoles. */
  expect(avisos.map((a) => local(a.schedule.at)), 'no son los días y la hora de entrada').toEqual([
    [19, 9, 0], [20, 9, 0], [23, 9, 0], [24, 9, 0], [25, 9, 0],
  ]);
  expect(avisos[0].title).toBe('Hoy, como cada jueves');
  expect(avisos[0].body).toBe('Jornada de 9:00 a 17:00. Tu día ya está preparado.');
  expect(avisos[1].title).toBe('Hoy, como cada viernes');
  expect(avisos[1].body).toMatch(/^Media jornada de 9:00 a \d+:\d\d\. Tu día ya está preparado\.$/);
  expect(avisos[0].channelId).toBe('pace_entrada');
  expect(avisos[0].schedule.allowWhileIdle).toBe(true);
  for (const a of avisos) expect(a.body + a.title, 'el aviso no puede reprochar nada').not.toMatch(/echamos|racha|seguidos/i);
});

test('abierto antes de la hora, el de hoy no sale', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO, avisoEntrada: true }, new Date('2026-11-19T08:30:00+01:00'));
  const avisos = await avisosPuestos(page);
  expect(avisos.length, 'GUARD: no puso ninguno').toBeGreaterThan(0);
  expect(local(avisos[0].schedule.at), 'el primero tiene que ser el del viernes').toEqual([20, 9, 0]);
});

test('apagado de fábrica: no pone ninguno', async ({ page, context }) => {
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await avisosPuestos(page)).toEqual([]);
});

test('sin semana guardada, nada aunque esté encendido', async ({ page, context }) => {
  await abrir(page, context, { horario: HORARIO, avisoEntrada: true }, new Date('2026-11-18T20:00:00+01:00'));
  expect(await avisosPuestos(page)).toEqual([]);
});

test('en Android, «Tu semana» trae el interruptor, cabe a 360 × 640 y al guardarlo encendido pone los avisos', async ({ page, context }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await abrir(page, context, { semanaTipo: SEMANA, horario: HORARIO }, new Date('2026-11-18T20:00:00+01:00'));
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
  const hoja = page.locator('[data-pace-semana-hoja]');
  await expect(hoja).toBeVisible();
  const sw = hoja.locator('[data-pace-semana-aviso] [role="switch"]');
  await expect(sw, 'apagado de fábrica').toHaveAttribute('aria-checked', 'false');
  await expect(hoja.locator('[data-pace-semana-aviso]')).toContainText('Avísame a mi hora de entrada');
  await page.waitForTimeout(400);
  const cabe = await page.evaluate(() => {
    const m = document.querySelector('[data-pace-semana-hoja]').closest('[role="dialog"]');
    const r = m.getBoundingClientRect();
    return { scroll: m.scrollHeight - m.clientHeight, fuera: r.top < 0 || r.bottom > innerHeight };
  });
  expect(cabe.scroll, '«Tu semana» pide scroll con el interruptor').toBeLessThanOrEqual(0);
  expect(cabe.fuera, '«Tu semana» se sale de la pantalla').toBe(false);
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await hoja.locator('[data-pace-semana-guardar]').click();
  await expect(hoja).toHaveCount(0);
  expect(await page.evaluate(() => getState().ritmo.avisoEntrada)).toBe(true);
  const avisos = await avisosPuestos(page);
  expect(avisos.length, 'al encenderlo no puso los avisos').toBe(5);
});

test('en la web no hay interruptor: sin servidor no puede avisar con PACE cerrado', async ({ page, context }) => {
  await sembrar(context, { ritmo: { semanaTipo: SEMANA, horario: HORARIO } });
  await irAlArtefacto(page);
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:ritmo-semana')));
  await expect(page.locator('[data-pace-semana-hoja]')).toBeVisible();
  await expect(page.locator('[data-pace-semana-aviso]')).toHaveCount(0);
});
