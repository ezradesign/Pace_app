/* PACE · el fin de la pausa avisa en el móvil, con un sonido distinto del fin del Foco
 * =================================================================================
 * Auditoría externa del 10 nov., 4.F2 y 4.F3 (montado el 12 nov. 2026, antes de dar la prueba a los
 * testers): con PACE en el fondo, el fin de la pausa no avisaba (el aviso del sistema solo se pedía
 * en el Foco), y con PACE delante sonaba la misma campana que el fin del Foco. Sin mirar, no se sabía
 * si tocaba parar o volver.
 *
 * QUE DEFIENDE, en Android y en el iPhone:
 *  · Una pausa en marcha con PACE en el fondo pide su aviso (id 3), con el sonido de la pausa:
 *    en Android, su canal (`pace_pausa`, o `pace_pausa_mudo` con el sonido apagado); en el iPhone,
 *    `pausa-aviso.wav` (nada con el sonido apagado). Al volver antes de la hora, se quita.
 *  · Una sola vez: si el sistema tenía el aviso de esa pausa, PACE no toca su sonido, ni con la pausa
 *    acabando en el fondo ni al volver (la regla de la 0.198.1, con la hora exacta).
 *  · Con «A tu ritmo», el aviso de la pausa se pide ya con el bloque en marcha, a la hora exacta a la
 *    que el aro la cerrará (`pausaHasta`), porque la pausa empieza sola aunque nadie abra PACE.
 *  · Si el sistema cerró PACE con el aviso puesto y se abre durante la pausa, se quita: suena PACE.
 *  · CONTROL: con PACE delante, la pausa acaba con su propio sonido (`pausa.end`), no con la campana.
 *  · En Android, los dos canales se crean al arrancar, el de sonido con `pausa_aviso.wav`.
 * NO CUBRE: que el sistema entregue el aviso a su hora ni cómo suena de verdad (en un móvil).
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, RUTA_ARTEFACTO } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const PAUSA = 5 * 60 * 1000;
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };

/* Un Android o un iPhone falso: LocalNotifications lleva lo que el sistema tiene puesto (`puestos`),
   como el de verdad; `playSound` se envuelve para contar lo que PACE pide sonar. */
async function comoMovil(context, plataforma) {
  await context.addInitScript((p) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {}, puestos: {}, sonidos: [] };
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
    let real = null;
    Object.defineProperty(window, 'playSound', {
      configurable: true,
      get: () => function (nombre) { nativo.sonidos.push(nombre); return real ? real.apply(this, arguments) : undefined; },
      set: (f) => { real = f; },
    });
  }, plataforma);
}

const nativo = (page, campo) => page.evaluate((c) => window.__nativo[c], campo);
const sonidos = async (page, nombre) => (await nativo(page, 'sonidos')).filter((n) => n === nombre).length;
const programados = async (page, id) => (await nativo(page, 'llamadas')).filter((l) => l.metodo === 'schedule').map((l) => l.opts.notifications[0]).filter((n) => n.id === id);
const alFondo = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: false }));
const alVolver = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: true }));
const estado = (page, plataforma) => page.evaluate((p) => (p === 'ios' ? paceIosEstado() : paceAndroidEstado()), plataforma);
const cta = (page) => page.locator('[data-pace-cta]');
const modo = (page, nombre) => page.locator('[data-pace-tabs] button').filter({ hasText: nombre });

async function abrir(page, context, plataforma, estadoExtra, cuando) {
  await sembrar(context, Object.assign({ soundOn: true }, estadoExtra || {}));
  await comoMovil(context, plataforma);
  await context.clock.install({ time: cuando || ARRANQUE });
  await irAlArtefacto(page);
}

async function empezarPausa(page, plataforma) {
  await modo(page, 'Pausa').click();
  await expect(cta(page)).toHaveText('Empezar pausa');
  await cta(page).click();
  await esperarEnPagina(page, (p) => (p === 'ios' ? paceIosEstado() : paceAndroidEstado()).pausa !== null, plataforma);
}

for (const plataforma of ['android', 'ios']) {
  test.describe(`${plataforma} · el fin de la pausa`, () => {
    test('con PACE en el fondo, la pausa pide su aviso con su sonido; al acabar no suena otra vez PACE, ni al volver', async ({ page, context }) => {
      await abrir(page, context, plataforma);
      await empezarPausa(page, plataforma);
      const fin = (await estado(page, plataforma)).pausa;
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[3]);
      const [aviso] = await programados(page, 3);
      expect(aviso.title).toBe('Pausa terminada');
      expect(aviso.body).toBe('Cuando quieras, vuelve al Foco.');
      expect(new Date(aviso.schedule.at).getTime(), 'el aviso no va a la hora a la que acaba la pausa').toBe(fin);
      if (plataforma === 'android') expect(aviso.channelId, 'el aviso de la pausa no va por su canal').toBe('pace_pausa');
      else expect(aviso.sound, 'el aviso de la pausa no lleva su sonido').toBe('pausa-aviso.wav');
      expect(await programados(page, 1), 'una pausa no pide el aviso de fin de Foco').toHaveLength(0);

      await context.clock.fastForward(PAUSA + 2000);
      await context.clock.runFor(1500);
      await expect(cta(page)).not.toHaveText('Pausar');
      expect(await sonidos(page, 'pausa.end'), 'con el aviso del sistema puesto, PACE también sonó').toBe(0);
      await alVolver(page);
      await context.clock.runFor(1500);
      expect(await sonidos(page, 'pausa.end'), 'al volver, PACE sonó una pausa de la que ya avisó el sistema').toBe(0);
      expect(await sonidos(page, 'pomodoro.end')).toBe(0);
    });

    test('CONTROL · con PACE delante, la pausa acaba con su propio sonido, no con la campana del Foco', async ({ page, context }) => {
      await abrir(page, context, plataforma);
      await empezarPausa(page, plataforma);
      await context.clock.fastForward(PAUSA + 2000);
      await context.clock.runFor(1500);
      await esperarEnPagina(page, () => window.__nativo.sonidos.includes('pausa.end'));
      expect(await sonidos(page, 'pomodoro.end'), 'el fin de la pausa sonó como el fin del Foco').toBe(0);
      expect(await nativo(page, 'puestos')).toEqual({});
    });

    test('al volver antes de que acabe, el aviso se quita', async ({ page, context }) => {
      await abrir(page, context, plataforma);
      await empezarPausa(page, plataforma);
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[3]);
      await context.clock.runFor(60 * 1000);
      await alVolver(page);
      await esperarEnPagina(page, () => !window.__nativo.puestos[3]);
      expect((await estado(page, plataforma)).pausaPuesto).toBeNull();
    });

    test('con el sonido apagado en Ajustes, el aviso sale sin sonido', async ({ page, context }) => {
      await abrir(page, context, plataforma, { soundOn: false });
      await empezarPausa(page, plataforma);
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[3]);
      const [aviso] = await programados(page, 3);
      if (plataforma === 'android') expect(aviso.channelId).toBe('pace_pausa_mudo');
      else expect(aviso.sound).toBeUndefined();
    });

    test('con «Aviso al terminar» apagado, no sale', async ({ page, context }) => {
      await abrir(page, context, plataforma, { notifyFocusEnd: false });
      await modo(page, 'Pausa').click();
      await cta(page).click();
      await expect(cta(page)).not.toHaveText('Empezar pausa');
      await alFondo(page);
      await context.clock.runFor(1000);
      expect(await programados(page, 3)).toHaveLength(0);
    });

    test('con «A tu ritmo», el aviso de la pausa se pide con el bloque en marcha, a la hora exacta a la que el aro la cerrará', async ({ page, context }) => {
      await abrir(page, context, plataforma, { ritmo: { dia: JORNADA } }, new Date('2026-09-17T09:00:00+02:00'));
      await cta(page).click();
      await esperarEnPagina(page, (p) => (p === 'ios' ? paceIosEstado() : paceAndroidEstado()).foco !== null, plataforma);
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[1] && !!window.__nativo.puestos[3]);
      const puestos = await nativo(page, 'puestos');
      expect(puestos[3], 'la pausa no va detrás del bloque').toBeGreaterThan(puestos[1]);
      const [aviso] = await programados(page, 3);
      expect(aviso.title).toBe('Pausa terminada');
      expect(aviso.body).toMatch(/^Ahora, el bloque 2 de \d+\.$/);

      /* El bloque acaba en el fondo y la pausa empieza sola: el aro la cierra a la hora del aviso. */
      await context.clock.fastForward(puestos[1] - await page.evaluate(() => Date.now()) + 2000);
      await context.clock.runFor(1500);
      await esperarEnPagina(page, () => !!(getState().ritmo.dia || {}).pausaHasta);
      expect(await page.evaluate(() => getState().ritmo.dia.pausaHasta), 'el aviso y el aro no cierran la pausa a la misma hora').toBe(puestos[3]);
      expect((await programados(page, 3)).length, 'la pausa que empezó se volvió a programar').toBe(1);

      await context.clock.fastForward(puestos[3] - await page.evaluate(() => Date.now()) + 2000);
      await context.clock.runFor(1500);
      await alVolver(page);
      await context.clock.runFor(1500);
      expect(await sonidos(page, 'pausa.end'), 'el fin de la pausa sonó dos veces: el aviso y PACE').toBe(0);
      expect(await sonidos(page, 'pomodoro.end'), 'el fin del bloque sonó dos veces: el aviso y PACE').toBe(0);
    });

    test('si el sistema cerró PACE con el aviso de la pausa puesto y se abre durante la pausa, se quita y suena PACE', async ({ page, context }) => {
      await abrir(page, context, plataforma, { ritmo: { dia: JORNADA } }, new Date('2026-09-17T09:00:00+02:00'));
      await cta(page).click();
      await esperarEnPagina(page, (p) => (p === 'ios' ? paceIosEstado() : paceAndroidEstado()).foco !== null, plataforma);
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[3]);
      const puestos = await nativo(page, 'puestos');
      /* El sistema cierra PACE; los dos avisos siguen puestos. Se abre un minuto después del bloque. */
      await page.close();
      await context.clock.fastForward(puestos[1] - Date.parse('2026-09-17T09:00:00+02:00') + 60 * 1000);
      const otra = await context.newPage();
      await otra.goto(RUTA_ARTEFACTO);
      await otra.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
      await esperarEnPagina(otra, () => (getState().ritmo.dia || {}).pausaHasta > 0);
      await esperarEnPagina(otra, () => !window.__nativo.puestos[3]);
      expect(await otra.evaluate(() => window.__nativo.llamadas.filter((l) => l.metodo === 'cancel' && l.opts.notifications[0].id === 3).length),
        'la pausa con PACE delante la cuenta PACE: el aviso del proceso anterior se quita').toBe(1);
      await context.clock.fastForward(puestos[3] - await otra.evaluate(() => Date.now()) + 2000);
      await context.clock.runFor(1500);
      await esperarEnPagina(otra, () => window.__nativo.sonidos.includes('pausa.end'));
    });
  });
}

test('android · los dos canales del fin de la pausa se crean al arrancar, el de sonido con su archivo', async ({ page, context }) => {
  await abrir(page, context, 'android');
  await esperarEnPagina(page, () => window.__nativo.llamadas.filter((l) => l.metodo === 'createChannel').length === 2);
  const canales = (await nativo(page, 'llamadas')).filter((l) => l.metodo === 'createChannel').map((l) => l.opts);
  expect(canales[0]).toMatchObject({ id: 'pace_pausa', name: 'Fin de la pausa', importance: 3, sound: 'pausa_aviso.wav' });
  expect(canales[1]).toMatchObject({ id: 'pace_pausa_mudo', name: 'Fin de la pausa, sin sonido', importance: 2 });
  expect(canales[1].sound).toBeUndefined();
});
