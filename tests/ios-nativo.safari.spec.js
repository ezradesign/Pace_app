/* PACE · lo que la app del iPhone le pide al sistema
 * ==================================================
 * En la app de iOS la web corre en el WKWebView de Capacitor, que es el motor de
 * Safari: no avisa con la app en el fondo, no mantiene la pantalla encendida y
 * no descarga archivos. Los complementos de Capacitor lo dan, y aqui se
 * sustituyen por espias que apuntan lo que la app les pide. No se prueba el
 * iPhone: se prueba que la app pida lo correcto en el momento correcto. Que el
 * aviso llegue, que la pantalla no se apague o que la hoja de compartir salga se
 * mira en un iPhone de verdad (TestFlight).
 *
 * Corre en los dos motores (`*.safari.spec.js`): el de Safari es el del iPhone.
 * La prueba del audio solo en Chromium, porque el WebKit de la suite no trae
 * Web Audio. Los controles en la web y en Android estan al final, para que un
 * espia que no mide nada no salga verde.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO, RUTA_ARTEFACTO } = require('./helpers');
const { esperarInit, leerContenedor, sembrarEventos } = require('./eventos.helpers');

/* Un Capacitor de iOS falso con los cinco complementos que lleva la app.
   `permiso` es lo que contesta LocalNotifications al arrancar ('granted',
   'denied' o 'prompt') y `concede`, lo que contesta si se le pide. iOS no tiene
   «alarmas exactas» ni boton atras: esos metodos no estan, y llamarlos romperia. */
async function comoIphone(context, opciones) {
  const o = Object.assign({ permiso: 'prompt', concede: 'granted' }, opciones || {});
  await context.addInitScript(([permiso, concede]) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {} };
    let estado = permiso;
    const apunta = (plugin, metodo, contesta) => function (opts) {
      /* La fecha del aviso se apunta aparte: al copiarla a JSON dejaria de ser una fecha. */
      const at = opts && opts.notifications && opts.notifications[0] && opts.notifications[0].schedule
        ? opts.notifications[0].schedule.at : undefined;
      nativo.llamadas.push({ plugin, metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)),
                             atEsFecha: at instanceof Date, atMs: at instanceof Date ? at.getTime() : null });
      return Promise.resolve(typeof contesta === 'function' ? contesta(opts) : contesta);
    };
    window.Capacitor = {
      getPlatform: () => 'ios',
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; },
        },
        KeepAwake: { keepAwake: apunta('KeepAwake', 'keepAwake'), allowSleep: apunta('KeepAwake', 'allowSleep') },
        Filesystem: { writeFile: apunta('Filesystem', 'writeFile', (op) => ({ uri: 'file:///var/mobile/Containers/Data/Application/PACE/Library/Caches/' + op.path })) },
        Share: { share: apunta('Share', 'share', {}) },
        LocalNotifications: {
          checkPermissions: apunta('LocalNotifications', 'checkPermissions', () => ({ display: estado })),
          requestPermissions: apunta('LocalNotifications', 'requestPermissions', () => { estado = concede; return { display: estado }; }),
          schedule: apunta('LocalNotifications', 'schedule', { notifications: [] }),
          cancel: apunta('LocalNotifications', 'cancel'),
        },
      },
    };
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach(cb => cb(datos));
  }, [o.permiso, o.concede]);
}

const llamadas = (page, plugin, metodo) => page.evaluate(([p, m]) =>
  window.__nativo.llamadas.filter(l => l.plugin === p && l.metodo === m), [plugin, metodo]);
const cuantas = async (page, plugin, metodo) => (await llamadas(page, plugin, metodo)).length;
const emitir = (page, evento, datos) => page.evaluate(([e, d]) => window.__nativo.emitir(e, d), [evento, datos]);
const leerEstado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);

async function abrirAjustes(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
}

/* No vale (no lo firma la llave de PACE): en la web se lee y se dice que no ha funcionado. */
const CODIGO_FALSO = '#codigo=PACE1.e30.AAAA';

const rachaDe7 = () => ({ current: 7, longest: 7, lastActiveDate: new Date().toDateString() });

test.describe('en el iPhone', () => {
  test('la bienvenida y Ajustes dicen que todo vive en el móvil, y los enlaces legales van a la web publicada', async ({ page, context }) => {
    await comoIphone(context);
    const errores = capturarErrores(page);
    await page.goto(RUTA_ARTEFACTO);
    await expect(page.getByRole('button', { name: 'Comenzar' })).toBeVisible();
    await expect(page.getByText('en tu móvil', { exact: true })).toBeVisible();
    await expect(page.getByText('en tu navegador', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => [pacePlataformaNativa(), paceEsNativo(), paceEsAndroid()])).toEqual(['ios', true, false]);
    expect(errores).toEqual([]);
  });

  test('Ajustes: el pie, la privacidad a la vista y ningún código de PACE completo', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context);
    await irAlArtefacto(page);
    await abrirAjustes(page);
    await expect(page.getByText('Todo vive en tu móvil.')).toBeVisible();
    /* La App Store pide que la política de privacidad se abra desde la app. */
    await expect(page.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', 'https://pacegrass.app/privacy');
    await expect(page.getByRole('link', { name: 'Seguridad' })).toHaveAttribute('href', 'https://pacegrass.app/safety');
    await expect(page.getByText('Tengo un código')).toHaveCount(0);
    expect(await page.evaluate(() => paceLicenciaPermitida())).toBe(false);
  });

  test('un enlace con código de tester ni se lee: se borra de la barra y no avisa de nada', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context);
    await page.goto(RUTA_ARTEFACTO + CODIGO_FALSO);
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    /* En la web el aviso sale en menos de un segundo (el control de abajo); aquí no debe salir. */
    await page.waitForTimeout(2500);
    await expect(page.locator('[data-pace-toast="licencia"]'), 'la App Store no deja abrir contenido con códigos propios').toHaveCount(0);
    expect((await leerEstado(page)).licencia).toBeFalsy();
    expect(await page.evaluate(() => location.hash), 'el código se queda a la vista').toBe('');
  });

  test('no hay apoyo con Buy Me a Coffee: ni la pill, ni el modal, ni su logro secreto', async ({ page, context }) => {
    await sembrar(context, { soundOn: false, streak: rachaDe7(), supportSeenAt: null });
    await comoIphone(context);
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    await expect(page.locator('[data-pace-sidebar]').getByRole('button', { name: 'Mis rutinas' })).toBeVisible();
    await expect(page.locator('[data-pace-sidebar]').getByRole('button', { name: 'Da de pastar a la vaca' })).toHaveCount(0);
    await page.waitForTimeout(1600);   // el aviso de la racha salta a los 1,2 s
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-support')));
    await page.waitForTimeout(300);
    await expect(page.getByText('buymeacoffee.com/ezradesign')).toHaveCount(0);
    expect((await leerEstado(page)).supportSeenAt).toBe(null);
    expect(await page.evaluate(() => ACHIEVEMENT_CATALOG.some(a => a.id === 'secret.supporter'))).toBe(false);
    expect(errores).toEqual([]);
  });

  test('una sesión guiada mantiene la pantalla con KeepAwake y la suelta al salir', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context);
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Respira' }).first().click();
    await page.locator('.pace-lib').waitFor({ state: 'visible' });
    await page.locator('.pace-lib h4 button', { hasText: 'Coherente 5·5' }).filter({ visible: true }).first().click();
    await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
    await expect.poll(() => cuantas(page, 'KeepAwake', 'keepAwake'), { message: 'la sesión no pidió la pantalla al iPhone' }).toBe(1);

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-pace-session-root]')).toHaveCount(0);
    await expect.poll(() => cuantas(page, 'KeepAwake', 'allowSleep'), { message: 'salir no soltó la pantalla' }).toBe(1);
  });

  test('la copia de «Tus datos» sale por la hoja de compartir y no por una descarga', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context);
    await irAlArtefacto(page);
    let descargas = 0;
    page.on('download', () => { descargas++; });
    await abrirAjustes(page);
    await page.getByRole('button', { name: 'Exportar una copia', exact: true }).click();
    await expect(page.getByText('Copia lista: elige dónde guardarla.')).toBeVisible();
    await expect.poll(() => cuantas(page, 'Share', 'share')).toBe(1);
    const [escrito] = await llamadas(page, 'Filesystem', 'writeFile');
    expect(escrito.opts.path).toMatch(/^pace-backup-\d{8}\.json$/);
    expect(escrito.opts.directory).toBe('CACHE');
    expect(JSON.parse(escrito.opts.data).app).toBe('PACE');
    const [compartido] = await llamadas(page, 'Share', 'share');
    expect(compartido.opts.files).toEqual(['file:///var/mobile/Containers/Data/Application/PACE/Library/Caches/' + escrito.opts.path]);
    expect(descargas, 'intentó una descarga, que el WKWebView tira').toBe(0);
  });

  test('el aviso de fin de Foco se ofrece en Ajustes, pide el permiso del iPhone y no habla de alarmas exactas', async ({ page, context }) => {
    await sembrar(context, { soundOn: false, notifyFocusEnd: false });
    await comoIphone(context, { permiso: 'prompt', concede: 'granted' });
    const errores = capturarErrores(page);
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const fila = page.locator('[data-pace-aj-fila="notify"]');
    await expect(fila).toContainText('Foco · si la app está en segundo plano');
    await fila.getByRole('switch').click();
    await expect.poll(() => cuantas(page, 'LocalNotifications', 'requestPermissions')).toBe(1);
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('button', { name: /Que el aviso llegue a su hora/ })).toHaveCount(0);
    expect((await leerEstado(page)).notifyFocusEnd).toBe(true);
    expect(errores).toEqual([]);
  });

  test('con los avisos apagados, la nota dice que se activan en los ajustes del iPhone', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context, { permiso: 'denied' });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    await expect(page.locator('[data-pace-aj-fila="notify"]').getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('Los avisos de PACE están desactivados en los ajustes del iPhone.')).toBeVisible();
  });

  test('el aviso de fin de Foco lo programa iOS solo en el fondo, y la hora va como fecha', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context, { permiso: 'granted' });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();
    expect(await cuantas(page, 'LocalNotifications', 'schedule'), 'con la app delante ya avisa ella').toBe(0);

    await emitir(page, 'appStateChange', { isActive: false });
    const [programado] = await llamadas(page, 'LocalNotifications', 'schedule');
    expect(programado, 'al irse al fondo no se programó el aviso').toBeTruthy();
    /* Con el texto ISO de Android, iOS no encuentra la hora y avisa EN EL ACTO. */
    expect(programado.atEsFecha, 'la hora no va como Date').toBe(true);
    const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    expect(programado.atMs).toBe(fin);
    const aviso = programado.opts.notifications[0];
    expect(aviso.title).toBe('Foco completado');
    expect(aviso.id).toBe(1);
    expect('isExactNotification' in aviso, 'iOS no tiene alarmas exactas').toBe(false);

    const cancelados = await cuantas(page, 'LocalNotifications', 'cancel');
    await emitir(page, 'appStateChange', { isActive: true });
    expect(await cuantas(page, 'LocalNotifications', 'cancel') - cancelados, 'al volver no se canceló: sonarían dos').toBe(1);

    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await emitir(page, 'appStateChange', { isActive: false });
    expect(await cuantas(page, 'LocalNotifications', 'schedule'), 'programó un aviso con el Foco en pausa').toBe(1);
  });

  test('los eventos se guardan con el adaptador web y se pide almacenamiento persistente', async ({ page, context }) => {
    await sembrar(context);
    await context.addInitScript(() => {
      window.__persistencias = 0;
      if (navigator.storage) navigator.storage.persist = function () { window.__persistencias++; return Promise.resolve(true); };
    });
    await comoIphone(context);
    await irAlArtefacto(page);
    await esperarInit(page);
    expect(await page.evaluate(() => [paceEventsRuntime(), paceEventsAdapter(), paceEventsCanWrite()])).toEqual(['capacitor-ios', 'web', true]);
    await sembrarEventos(page, 2);
    expect((await leerContenedor(page)).events.length).toBe(2);
    /* El WebKit de la suite en Windows no trae `navigator.storage`; Safari en el iPhone, sí. */
    const hayAlmacen = await page.evaluate(() => !!(navigator.storage && navigator.storage.persist));
    expect(await page.evaluate(() => window.__persistencias)).toBe(hayAlmacen ? 1 : 0);
  });
});

test.describe('en el iPhone, el audio', () => {
  test.skip(({ browserName }) => browserName === 'webkit', 'el WebKit de la suite no trae Web Audio');

  test('el primer toque crea el audio con un silencio, y al volver del fondo el siguiente lo reanuda', async ({ page, context }) => {
    await sembrar(context, { soundOn: true });
    await comoIphone(context);
    await irAlArtefacto(page);
    expect((await page.evaluate(() => paceIosEstado())).audio, 'despertó el audio sin que nadie tocara').toBe(false);

    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect((await page.evaluate(() => paceIosEstado())).audio, 'el primer toque no desbloqueó el audio').toBe(true);

    /* Lo que deja el fondo, o una llamada: el contexto parado. */
    await page.evaluate(() => paceAudioCtx().suspend());
    const antes = (await page.evaluate(() => paceIosEstado())).despertares;
    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect((await page.evaluate(() => paceIosEstado())).despertares - antes, 'el toque no reanudó el audio parado').toBe(1);
  });

  test('con el sonido apagado en Ajustes, tocar no crea nada', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoIphone(context);
    await irAlArtefacto(page);
    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect((await page.evaluate(() => paceIosEstado())).audio).toBe(false);
  });
});

test.describe('fuera del iPhone (control)', () => {
  test('en la web nada de esto existe: ni plataforma, ni avisos del sistema, ni audio despertado', async ({ page, context }) => {
    await sembrar(context, { soundOn: true });
    await irAlArtefacto(page);
    await page.evaluate(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(await page.evaluate(() => [pacePlataformaNativa(), paceEsNativo(), paceNativoAvisos(), paceIosEstado().audio]))
      .toEqual([null, false, false, false]);
    expect(await page.evaluate(() => paceNativoEnlace('/privacy'))).toBe('/privacy');
  });

  test('en la web el mismo enlace de código se lee y, como no vale, lo dice', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await page.goto(RUTA_ARTEFACTO + CODIGO_FALSO);
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await expect(page.locator('[data-pace-toast="licencia"]'), 'el enlace no se lee: la prueba del iPhone no mide nada').toHaveCount(1);
  });

  test('en Android la capa común llama a android.js y no a ios.js', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await context.addInitScript(() => {
      window.Capacitor = { getPlatform: () => 'android', isNativePlatform: () => true, Plugins: {} };
    });
    await irAlArtefacto(page);
    expect(await page.evaluate(() => [pacePlataformaNativa(), paceEsIos(), paceIosAvisos()])).toEqual(['android', false, false]);
  });
});
