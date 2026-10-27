/* PACE · el aviso de fin de Foco en Android, tras la prueba en el móvil de Ez (A1-A4)
 * ===================================================================================
 * Lo que caía contra v0.181.1:
 *   A1  el bloque que acababa con PACE en el fondo sonaba dos veces: el aviso de Android y, al
 *       volver (o al abrir PACE después de que Android la cerrara), la campana de PACE.
 *   A2  un aviso que no se llegaba a quitar seguía puesto: si Android tardaba en contestar al
 *       programarlo, el «quitar» de la vuelta llegaba antes; y si quitarlo fallaba, ya no se
 *       volvía a intentar al pausar o al reiniciar.
 *   A3  PACE daba el aviso por puesto antes de que Android contestara, y si fallaba no lo decía.
 *   A4  al volver de los ajustes de Android con los avisos cambiados, Ajustes seguía igual.
 * Y N4 (Ez, la A del 27 oct.): el aviso fijo con el móvil bloqueado, que no existía. PaceAvisoFijo
 * falso apunta lo que se le pide poner (`fijo`) y cuándo se quita.
 *
 * El LocalNotifications falso lleva la cuenta de lo que Android tiene puesto (`puestos`), como
 * el de verdad: `schedule` lo pone cuando contesta y `cancel` lo quita cuando contesta. Se le
 * puede pedir que retenga las respuestas de `schedule`, que falle al programar o al quitar, y
 * cambiarle el permiso como si se tocara en los ajustes de Android.
 *
 * La campana se cuenta envolviendo `playSound` desde antes de cargar: los bloques acaban con el
 * sonido apagado, y lo que importa es si PACE la pide.
 *
 * NO CUBRE: que Android entregue el aviso a su hora, ni el sonido de verdad (en el móvil). Los
 * CONTROL, sin aviso de Android y con PACE delante, piden una campana: un arreglo que callara
 * siempre saldría verde sin ellos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, RUTA_ARTEFACTO } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const BLOQUE = 25 * 60 * 1000;

async function comoAndroid(context, opciones) {
  const o = Object.assign({ permiso: 'granted', exacta: 'granted' }, opciones || {});
  await context.addInitScript((o) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {}, puestos: {}, campanas: [],
      permiso: o.permiso, exacta: o.exacta, retener: false, retenerPermiso: false, fijo: null, retenidas: [], fallaProgramar: null, fallaQuitar: 0 };
    const apunta = (metodo, opts) => nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
    const LocalNotifications = {
      checkPermissions: (op) => { apunta('checkPermissions', op); return Promise.resolve({ display: nativo.permiso }); },
      requestPermissions: (op) => {
        apunta('requestPermissions', op);
        if (!nativo.retenerPermiso) return Promise.resolve({ display: nativo.permiso });
        return new Promise((ok) => nativo.retenidas.push(() => ok({ display: nativo.permiso })));
      },
      checkExactNotificationSetting: (op) => { apunta('checkExactNotificationSetting', op); return Promise.resolve({ exact_alarm: nativo.exacta }); },
      changeExactNotificationSetting: (op) => { apunta('changeExactNotificationSetting', op); return Promise.resolve({ exact_alarm: nativo.exacta }); },
      schedule: (op) => {
        apunta('schedule', op);
        if (nativo.fallaProgramar) return Promise.reject(new Error(nativo.fallaProgramar));
        const poner = () => { op.notifications.forEach((n) => { nativo.puestos[n.id] = n.schedule.at; }); return { notifications: op.notifications.map((n) => ({ id: n.id })) }; };
        if (!nativo.retener) return Promise.resolve(poner());
        return new Promise((ok) => nativo.retenidas.push(() => ok(poner())));
      },
      cancel: (op) => {
        apunta('cancel', op);
        if (nativo.fallaQuitar > 0) { nativo.fallaQuitar--; return Promise.reject(new Error('no se pudo')); }
        op.notifications.forEach((n) => { delete nativo.puestos[n.id]; });
        return Promise.resolve();
      },
    };
    nativo.soltar = () => { const r = nativo.retenidas.splice(0); r.forEach((f) => f()); };
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; },
          minimizeApp: () => Promise.resolve(),
        },
        LocalNotifications,
        PaceAvisoFijo: {
          poner: (op) => { apunta('poner', op); nativo.fijo = op; return Promise.resolve(); },
          quitar: (op) => { apunta('quitar', op); nativo.fijo = null; return Promise.resolve(); },
        },
      },
    };
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach((cb) => cb(datos));
    /* La campana: se apunta lo que PACE pide a `playSound`, que se exporta a window al cargar. */
    let real = null;
    Object.defineProperty(window, 'playSound', {
      configurable: true,
      get: () => function (nombre) { nativo.campanas.push(nombre); return real ? real.apply(this, arguments) : undefined; },
      set: (f) => { real = f; },
    });
  }, o);
}

const nativo = (page, campo) => page.evaluate((c) => window.__nativo[c], campo);
const cuantas = async (page, metodo) => (await nativo(page, 'llamadas')).filter((l) => l.metodo === metodo).length;
const campanasDeFin = async (page) => (await nativo(page, 'campanas')).filter((n) => n === 'pomodoro.end').length;
const alFondo = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: false }));
const alVolver = (page) => page.evaluate(() => window.__nativo.emitir('appStateChange', { isActive: true }));
const estadoAviso = (page) => page.evaluate(() => paceAndroidEstado());
const cta = (page) => page.locator('[data-pace-cta]');

async function abrir(page, context, opciones, estado) {
  await sembrar(context, Object.assign({ soundOn: false }, estado || {}));
  await comoAndroid(context, opciones);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
}

async function empezarFoco(page) {
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(cta(page)).toHaveText('Pausar');
}

/* Que pase el bloque entero con el reloj falso. */
async function acabarBloque(context) {
  await context.clock.fastForward(BLOQUE + 2000);
  await context.clock.runFor(1500);
}

test.describe('A1 · una sola campana al acabar el bloque', () => {
  test('si el bloque acaba con PACE en el fondo, suena el aviso de Android y no la campana de PACE', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page), 'con el aviso de Android puesto, PACE también tocó la campana').toBe(0);
    await alVolver(page);
    await context.clock.runFor(1500);
    expect(await campanasDeFin(page), 'al volver, PACE tocó la campana de un bloque que ya avisó Android').toBe(0);
  });

  test('si Android cerró PACE con el aviso puesto, al abrirla después del final no vuelve a sonar', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    /* Android cierra PACE; el aviso sigue puesto y suena a su hora. */
    await page.close();
    await context.clock.fastForward(BLOQUE + 60 * 1000);
    const otra = await context.newPage();
    await otra.goto(RUTA_ARTEFACTO);
    await otra.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await expect(otra.locator('[data-pace-cta]')).toHaveText('Empezar otro ciclo');
    await otra.waitForTimeout(300);
    expect(await campanasDeFin(otra), 'al abrir PACE, el bloque que ya avisó Android volvió a sonar').toBe(0);
  });

  test('CONTROL · sin aviso de Android (permiso denegado), la campana es de PACE aunque acabe en el fondo', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'denied' });
    await empezarFoco(page);
    await alFondo(page);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await cuantas(page, 'schedule'), 'programó un aviso sin permiso').toBe(0);
    expect(await campanasDeFin(page), 'sin aviso de Android no sonó nadie').toBe(1);
  });

  test('CONTROL · con PACE delante, una campana y ningún aviso de Android', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page)).toBe(1);
    expect(await nativo(page, 'puestos')).toEqual({});
  });
});

test.describe('A2 · el aviso se quita antes de que llegue', () => {
  test('al volver antes de la hora y pausar, no queda puesto aunque Android tarde en contestar al programarlo', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.retener = true; });
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => window.__nativo.retenidas.length === 1);
    await alVolver(page);
    await page.evaluate(() => window.__nativo.soltar());
    await cta(page).click();
    await expect(cta(page)).toHaveText('Continuar');
    await esperarEnPagina(page, () => Object.keys(window.__nativo.puestos).length === 0, null, { timeout: 2000 })
      .catch(() => {});
    expect(await nativo(page, 'puestos'), 'el aviso quedó puesto con el Foco en pausa').toEqual({});
  });

  for (const accion of ['Pausar', 'Reiniciar bloque']) {
    test(`si quitarlo falla al volver, «${accion}» lo vuelve a intentar`, async ({ page, context }) => {
      await abrir(page, context);
      await empezarFoco(page);
      await alFondo(page);
      await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
      await page.evaluate(() => { window.__nativo.fallaQuitar = 1; });
      await alVolver(page);
      await esperarEnPagina(page, () => window.__nativo.fallaQuitar === 0);
      await cta(page).click();
      if (accion === 'Reiniciar bloque') await page.getByRole('button', { name: 'Reiniciar bloque' }).click();
      await esperarEnPagina(page, () => Object.keys(window.__nativo.puestos).length === 0, null, { timeout: 2000 })
        .catch(() => {});
      expect(await nativo(page, 'puestos'), `tras «${accion}» seguía puesto el aviso que no se pudo quitar`).toEqual({});
    });
  }
});

test.describe('el permiso que llega tarde', () => {
  /* Sin el permiso no se programa (antes, `schedule` lo habría pedido con la app en el fondo); pero
     si la respuesta llega con la app ya en el fondo, el aviso se pone entonces. */
  test('si Android contesta al permiso con la app ya en el fondo, el aviso se pone entonces', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'prompt' });
    await page.evaluate(() => { window.__nativo.retenerPermiso = true; window.__nativo.permiso = 'granted'; });
    await empezarFoco(page);
    await esperarEnPagina(page, () => window.__nativo.retenidas.length === 1);
    await alFondo(page);
    expect(await cuantas(page, 'schedule'), 'programó sin saber si hay permiso').toBe(0);
    await page.evaluate(() => window.__nativo.soltar());
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
  });
});

test.describe('A3 · puesto solo cuando Android lo confirma', () => {
  test('mientras Android no contesta, no se da por puesto; cuando contesta, sí', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.retener = true; });
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => window.__nativo.retenidas.length === 1);
    expect((await estadoAviso(page)).programado, 'lo dio por puesto antes de que Android contestara').toBe(false);
    await page.evaluate(() => window.__nativo.soltar());
    await esperarEnPagina(page, () => paceAndroidEstado().programado === true);
    expect((await estadoAviso(page)).fallo).toBe(null);
  });

  test('si Android no deja ponerlo, Ajustes lo dice y la campana es de PACE', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.fallaProgramar = 'Exact alarm permission required'; });
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => paceAndroidEstado().fallo !== null);
    expect((await estadoAviso(page)).programado).toBe(false);
    await alVolver(page);
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await expect(page.locator('[data-pace-aj-aviso-fallo]')).toHaveText('Android no dejó poner el último aviso de fin de Foco.');
    await page.keyboard.press('Escape');
    /* Vuelve a salir: Android sigue sin dejar, y el bloque acaba en el fondo. */
    await alFondo(page);
    await esperarEnPagina(page, () => window.__nativo.llamadas.filter((l) => l.metodo === 'schedule').length === 2);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page), 'sin aviso de Android, PACE tenía que sonar').toBe(1);
  });
});

test.describe('A4 · el permiso se vuelve a mirar al volver', () => {
  test('al volver de los ajustes de Android, Ajustes enseña el permiso nuevo sin cerrarse', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'denied' });
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    const fila = page.locator('[data-pace-aj-fila="notify"]');
    const nota = page.getByText('Los avisos de PACE están desactivados en los ajustes de Android.');
    await expect(nota).toBeVisible();
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    /* Se va a los ajustes de Android, activa los avisos de PACE y vuelve. */
    await alFondo(page);
    await page.evaluate(() => { window.__nativo.permiso = 'granted'; });
    await alVolver(page);
    await expect(nota, 'al volver con los avisos activados, seguía diciendo que están desactivados').toHaveCount(0);
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'true');

    /* Y al revés: los apaga en Android y vuelve. */
    await alFondo(page);
    await page.evaluate(() => { window.__nativo.permiso = 'denied'; });
    await alVolver(page);
    await expect(nota, 'al volver con los avisos apagados, no lo dijo').toBeVisible();
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });
});

/* N4 · el aviso fijo con el móvil bloqueado (Ez, N4 A · N4b A del 27 oct.): la cuenta atrás la
   pone Android hasta `hasta`; aquí se mira qué dice, cuándo sale y cuándo se va. */
const finDelBloque = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
const horaDe = (ms) => { const d = new Date(ms); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };

test.describe('N4 · el aviso fijo con el móvil bloqueado', () => {
  test('sin «A tu ritmo»: al irse al fondo dice «Foco · 25 min» y hasta cuándo, y se va al volver', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    expect(await cuantas(page, 'poner'), 'con PACE delante ya se ve el aro').toBe(0);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.fijo);
    const fin = await finDelBloque(page);
    expect(await nativo(page, 'fijo')).toEqual({ titulo: 'Foco · 25 min', texto: 'Hasta las ' + horaDe(fin) + '.', hasta: fin });
    await alVolver(page);
    await esperarEnPagina(page, () => window.__nativo.fijo === null);
    /* En pausa no hay nada que contar. */
    await cta(page).click();
    await alFondo(page);
    await page.waitForTimeout(300);
    expect(await cuantas(page, 'poner'), 'salió con el Foco en pausa').toBe(1);
  });

  test('con «A tu ritmo»: el bloque, la hora a la que acaba y la pausa que viene', async ({ page, context }) => {
    await sembrar(context, { soundOn: false, ritmo: { dia: { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } });
    await comoAndroid(context);
    await context.clock.install({ time: new Date('2026-09-17T09:00:00+02:00') });
    await irAlArtefacto(page);
    await cta(page).click();
    await expect(cta(page)).toHaveText('Pausar');
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.fijo);
    const fin = await finDelBloque(page);
    const fijo = await nativo(page, 'fijo');
    expect(fijo.titulo).toBe('Foco · bloque 1 de 9');
    expect(fijo.texto).toMatch(new RegExp('^Hasta las ' + horaDe(fin) + '\\. Luego, tu pausa: .+ · \\d+ min$'));
    expect(fijo.hasta).toBe(fin);
  });

  test('va con «Aviso al terminar»: apagado, no sale', async ({ page, context }) => {
    await abrir(page, context, {}, { notifyFocusEnd: false });
    await empezarFoco(page);
    await alFondo(page);
    await page.waitForTimeout(300);
    expect(await cuantas(page, 'poner')).toBe(0);
  });

  test('sin permiso de avisos, no sale', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'denied' });
    await empezarFoco(page);
    await alFondo(page);
    await page.waitForTimeout(300);
    expect(await cuantas(page, 'poner')).toBe(0);
  });

  test('al acabar el bloque se quita, y el aviso de fin se queda', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.fijo && !!window.__nativo.puestos[1]);
    await acabarBloque(context);
    await esperarEnPagina(page, () => window.__nativo.fijo === null);
    expect(await nativo(page, 'puestos'), 'al quitar el fijo se quitó también el de fin').toHaveProperty('1');
  });

  test('si Android cerró PACE con el aviso fijo puesto, al abrirla se quita', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.fijo);
    await page.reload();
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await esperarEnPagina(page, () => window.__nativo.llamadas.some((l) => l.metodo === 'quitar'));
  });
});
