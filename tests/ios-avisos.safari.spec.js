/* PACE · el aviso de fin de Foco en el iPhone: los cuatro fallos que Android ya no tiene (A1-A4)
 * ==============================================================================================
 * Android los arregló en la 0.184.0 tras la prueba en el móvil de Ez (tests/android-avisos.spec.js),
 * y el iPhone llevaba la misma lógica de antes. Lo que caía contra v0.184.0:
 *   A1  el bloque que acababa con PACE en el fondo sonaba dos veces: el aviso de iOS y, al volver
 *       (o al abrir PACE después de que iOS la cerrara), la campana de PACE.
 *   A2  un aviso que no se llegaba a quitar seguía puesto: si iOS tardaba en contestar al
 *       programarlo, el «quitar» de la vuelta llegaba antes; y si quitarlo fallaba, ya no se
 *       volvía a intentar al pausar o al reiniciar.
 *   A3  PACE daba el aviso por puesto antes de que iOS contestara, y si fallaba no lo decía.
 *   A4  al volver de los Ajustes del iPhone con los avisos cambiados, Ajustes de PACE seguía igual.
 * Y el permiso que llega con la app ya en el fondo: en el iPhone pasa siempre la primera vez,
 * porque la pregunta de iOS deja la app inactiva (`appStateChange` con `isActive: false`).
 *
 * El LocalNotifications falso lleva la cuenta de lo que iOS tiene puesto (`puestos`, con la hora en
 * ms): `schedule` lo pone cuando contesta y `cancel` lo quita cuando contesta. Se le puede pedir
 * que retenga las respuestas de `schedule` o de `requestPermissions`, que falle al programar o al
 * quitar, y cambiarle el permiso como si se tocara en los Ajustes del iPhone. Sin «alarmas
 * exactas» ni botón atrás, que iOS no tiene. La campana se cuenta envolviendo `playSound` desde
 * antes de cargar, como en Android.
 *
 * Corre en los dos motores (`*.safari.spec.js`): el de Safari es el del iPhone.
 *
 * NO CUBRE: que iOS entregue el aviso a su hora, ni el sonido de verdad (en el iPhone, TestFlight).
 * Los CONTROL, sin aviso de iOS y con PACE delante, piden una campana: un arreglo que callara
 * siempre saldría verde sin ellos.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, esperarEnPagina, RUTA_ARTEFACTO } = require('./helpers');

const ARRANQUE = new Date('2026-10-07T10:00:00+02:00');
const BLOQUE = 25 * 60 * 1000;

async function comoIphone(context, opciones) {
  const o = Object.assign({ permiso: 'granted' }, opciones || {});
  await context.addInitScript((o) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {}, puestos: {}, campanas: [],
      permiso: o.permiso, retener: false, retenerPermiso: false, retenidas: [], fallaProgramar: null, fallaQuitar: 0 };
    const apunta = (metodo, opts) => nativo.llamadas.push({ metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
    const LocalNotifications = {
      checkPermissions: (op) => { apunta('checkPermissions', op); return Promise.resolve({ display: nativo.permiso }); },
      requestPermissions: (op) => {
        apunta('requestPermissions', op);
        if (!nativo.retenerPermiso) return Promise.resolve({ display: nativo.permiso });
        return new Promise((ok) => nativo.retenidas.push(() => ok({ display: nativo.permiso })));
      },
      schedule: (op) => {
        apunta('schedule', op);
        if (nativo.fallaProgramar) return Promise.reject(new Error(nativo.fallaProgramar));
        const poner = () => {
          op.notifications.forEach((n) => { nativo.puestos[n.id] = n.schedule.at instanceof Date ? n.schedule.at.getTime() : n.schedule.at; });
          return { notifications: op.notifications.map((n) => ({ id: n.id })) };
        };
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
      getPlatform: () => 'ios',
      isNativePlatform: () => true,
      Plugins: {
        App: { addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; } },
        LocalNotifications,
      },
    };
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach((cb) => cb(datos));
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
const estadoAviso = (page) => page.evaluate(() => paceIosEstado());
const cta = (page) => page.locator('[data-pace-cta]');

async function abrir(page, context, opciones, estado) {
  await sembrar(context, Object.assign({ soundOn: false }, estado || {}));
  await comoIphone(context, opciones);
  await context.clock.install({ time: ARRANQUE });
  await irAlArtefacto(page);
}

async function empezarFoco(page) {
  await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
  await expect(cta(page)).toHaveText('Pausar');
}

async function acabarBloque(context) {
  await context.clock.fastForward(BLOQUE + 2000);
  await context.clock.runFor(1500);
}

test.describe('A1 · en el iPhone, una sola campana al acabar el bloque', () => {
  test('si el bloque acaba con PACE en el fondo, suena el aviso de iOS y no la campana de PACE', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page), 'con el aviso de iOS puesto, PACE también tocó la campana').toBe(0);
    await alVolver(page);
    await context.clock.runFor(1500);
    expect(await campanasDeFin(page), 'al volver, PACE tocó la campana de un bloque que ya avisó iOS').toBe(0);
  });

  test('si iOS cerró PACE con el aviso puesto, al abrirla después del final no vuelve a sonar', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    await page.close();
    await context.clock.fastForward(BLOQUE + 60 * 1000);
    const otra = await context.newPage();
    await otra.goto(RUTA_ARTEFACTO);
    await otra.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await expect(otra.locator('[data-pace-cta]')).toHaveText('Empezar otro ciclo');
    await otra.waitForTimeout(300);
    expect(await campanasDeFin(otra), 'al abrir PACE, el bloque que ya avisó iOS volvió a sonar').toBe(0);
  });

  test('CONTROL · sin aviso de iOS (permiso denegado), la campana es de PACE aunque acabe en el fondo', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'denied' });
    await empezarFoco(page);
    await alFondo(page);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await cuantas(page, 'schedule'), 'programó un aviso sin permiso').toBe(0);
    expect(await campanasDeFin(page), 'sin aviso de iOS no sonó nadie').toBe(1);
  });

  test('CONTROL · con PACE delante, una campana y ningún aviso de iOS', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page)).toBe(1);
    expect(await nativo(page, 'puestos')).toEqual({});
  });
});

test.describe('A2 · en el iPhone, el aviso se quita antes de que llegue', () => {
  test('al volver antes de la hora y pausar, no queda puesto aunque iOS tarde en contestar al programarlo', async ({ page, context }) => {
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

test.describe('en el iPhone, el permiso que llega con la app ya en el fondo', () => {
  /* La pregunta de iOS deja la app inactiva: PACE se cree en el fondo mientras se contesta. Sin
     permiso no se programa (iOS lo guardaría sin enseñarlo, y la campana de PACE callaría por él),
     pero cuando llega el sí, el aviso se pone entonces. */
  test('si iOS contesta al permiso con la app ya en el fondo, el aviso se pone entonces', async ({ page, context }) => {
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

test.describe('A3 · en el iPhone, puesto solo cuando iOS lo confirma', () => {
  test('mientras iOS no contesta, no se da por puesto; cuando contesta, sí', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.retener = true; });
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => window.__nativo.retenidas.length === 1);
    expect((await estadoAviso(page)).programado, 'lo dio por puesto antes de que iOS contestara').toBe(false);
    await page.evaluate(() => window.__nativo.soltar());
    await esperarEnPagina(page, () => paceIosEstado().programado === true);
    expect((await estadoAviso(page)).fallo).toBe(null);
  });

  test('si iOS no deja ponerlo, Ajustes lo dice y la campana es de PACE', async ({ page, context }) => {
    await abrir(page, context);
    await page.evaluate(() => { window.__nativo.fallaProgramar = 'Unable to create notification, trigger failed'; });
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => paceIosEstado().fallo != null);
    expect((await estadoAviso(page)).programado).toBe(false);
    await alVolver(page);
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    await expect(page.locator('[data-pace-aj-aviso-fallo]')).toHaveText('El iPhone no dejó poner el último aviso de fin de Foco.');
    await page.keyboard.press('Escape');
    await alFondo(page);
    await esperarEnPagina(page, () => window.__nativo.llamadas.filter((l) => l.metodo === 'schedule').length === 2);
    await acabarBloque(context);
    await expect(cta(page)).toHaveText('Empezar otro ciclo');
    expect(await campanasDeFin(page), 'sin aviso de iOS, PACE tenía que sonar').toBe(1);
  });
});

test.describe('A4 · en el iPhone, el permiso se vuelve a mirar al volver', () => {
  test('al volver de los Ajustes del iPhone, Ajustes de PACE enseña el permiso nuevo sin cerrarse', async ({ page, context }) => {
    await abrir(page, context, { permiso: 'denied' });
    await page.getByRole('button', { name: 'Abrir ajustes' }).click();
    const fila = page.locator('[data-pace-aj-fila="notify"]');
    const nota = page.getByText('Los avisos de PACE están desactivados en los ajustes del iPhone.');
    await expect(nota).toBeVisible();
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');

    await alFondo(page);
    await page.evaluate(() => { window.__nativo.permiso = 'granted'; });
    await alVolver(page);
    await expect(nota, 'al volver con los avisos activados, seguía diciendo que están desactivados').toHaveCount(0);
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'true');

    await alFondo(page);
    await page.evaluate(() => { window.__nativo.permiso = 'denied'; });
    await alVolver(page);
    await expect(nota, 'al volver con los avisos apagados, no lo dijo').toBeVisible();
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });
});

/* El aviso de fin nombra la pausa de «A tu ritmo» (28 oct.), como en Android: se programa al irse
   al fondo, con el bloque aún sin cerrar, y dice lo mismo que dirá el aviso de la web al acabarlo
   (`ritmoAviso`, la D2 de Ez). Rojo contra v0.184.0, que decía «Foco completado». */
const JORNADA = { fecha: '2026-09-17', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const programados = async (page) => (await nativo(page, 'llamadas')).filter((l) => l.metodo === 'schedule').map((l) => l.opts.notifications[0]);
const avisoDeLaWeb = (page) => page.evaluate(() => {
  const s = getState(), S = window.PACE_STRINGS, lang = s.lang;
  const t = (k) => (S[lang] && S[lang][k] !== undefined ? S[lang][k] : S.en[k] !== undefined ? S.en[k] : k);
  const tn = (k, v) => Object.keys(v || {}).reduce((x, c) => x.split('{' + c + '}').join(String(v[c])), t(k));
  return ritmoAviso(s, t, tn, lang);
});

test.describe('en el iPhone, el aviso de fin dice lo que viene', () => {
  test('con «A tu ritmo», nombra la pausa y dice lo mismo que la web al acabar', async ({ page, context }) => {
    await sembrar(context, { soundOn: false, ritmo: { dia: JORNADA } });
    await comoIphone(context);
    await context.clock.install({ time: new Date('2026-09-17T09:00:00+02:00') });
    await irAlArtefacto(page);
    await cta(page).click();
    await expect(cta(page)).toHaveText('Pausar');
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    const [aviso] = await programados(page);
    expect(aviso.title, 'el aviso de fin no nombra la pausa').toMatch(/^Tu pausa: .+ · \d+ min$/);
    expect(aviso.body).toMatch(/^Bloque 1 de \d+ hecho\. El siguiente, a las \d+:\d\d\.$/);
    const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    await context.clock.fastForward(fin - await page.evaluate(() => Date.now()) + 2000);
    await esperarEnPagina(page, () => ritmoPlan(getState()).hechos === 1);
    expect(await avisoDeLaWeb(page)).toEqual({ title: aviso.title, body: aviso.body });
  });

  test('CONTROL · sin «A tu ritmo», el de siempre', async ({ page, context }) => {
    await abrir(page, context);
    await empezarFoco(page);
    await alFondo(page);
    await esperarEnPagina(page, () => !!window.__nativo.puestos[1]);
    const [aviso] = await programados(page);
    expect([aviso.title, aviso.body]).toEqual(['Foco completado', 'Ciclo cerrado. Elige tu micro-pausa.']);
  });
});
