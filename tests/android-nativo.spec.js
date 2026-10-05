/* PACE · lo que la app de Android le pide al sistema
 * ==================================================
 * En el APK el WebView no trae boton atras propio, ni avisos, ni pantalla
 * encendida, ni descargas: los dan complementos de Capacitor que el lado
 * nativo inyecta en `window.Capacitor.Plugins`. Aqui se sustituyen por espias
 * que apuntan lo que la app les pide. No se prueba Android: se prueba que la app
 * pida lo correcto en el momento correcto. Lo que Android haga con ello (que el
 * aviso llegue a su hora, que la pantalla no se apague, el menu de compartir)
 * se mira en un movil de verdad.
 *
 * El ultimo bloque es el control en web, para que un espia que no mide nada no
 * salga verde.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, capturarErrores, CLAVE_ESTADO } = require('./helpers');

/* Un Capacitor de Android falso con los cinco complementos. `permiso` es lo que
   contesta LocalNotifications al arrancar ('granted', 'denied' o 'prompt') y
   `concede`, lo que contesta si se le pide. */
async function comoAndroid(context, opciones) {
  const o = Object.assign({ permiso: 'prompt', concede: 'granted' }, opciones || {});
  await context.addInitScript(([permiso, concede]) => {
    const nativo = window.__nativo = { llamadas: [], oyentes: {} };
    let estado = permiso;
    const apunta = (plugin, metodo, contesta) => function (opts) {
      nativo.llamadas.push({ plugin, metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      return Promise.resolve(typeof contesta === 'function' ? contesta(opts) : contesta);
    };
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; },
          minimizeApp: apunta('App', 'minimizeApp'),
        },
        KeepAwake: { keepAwake: apunta('KeepAwake', 'keepAwake'), allowSleep: apunta('KeepAwake', 'allowSleep') },
        Filesystem: { writeFile: apunta('Filesystem', 'writeFile', (op) => ({ uri: 'file:///data/user/0/com.ezradesign.pace/cache/' + op.path })) },
        Share: { share: apunta('Share', 'share', {}) },
        LocalNotifications: {
          checkPermissions: apunta('LocalNotifications', 'checkPermissions', () => ({ display: estado })),
          requestPermissions: apunta('LocalNotifications', 'requestPermissions', () => { estado = concede; return { display: estado }; }),
          schedule: apunta('LocalNotifications', 'schedule', { notifications: [] }),
          cancel: apunta('LocalNotifications', 'cancel'),
        },
      },
    };
    /* Lo que hace Android: avisar a quien escucha un evento del complemento. */
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach(cb => cb(datos));
  }, [o.permiso, o.concede]);
}

const llamadas = (page, plugin, metodo) => page.evaluate(([p, m]) =>
  window.__nativo.llamadas.filter(l => l.plugin === p && l.metodo === m), [plugin, metodo]);
const cuantas = async (page, plugin, metodo) => (await llamadas(page, plugin, metodo)).length;
const emitir = (page, evento, datos) => page.evaluate(([e, d]) => window.__nativo.emitir(e, d), [evento, datos]);
const atras = (page) => emitir(page, 'backButton', { canGoBack: false });
const leerEstado = (page) => page.evaluate((clave) => JSON.parse(localStorage.getItem(clave) || '{}'), CLAVE_ESTADO);

async function abrirAjustes(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').waitFor({ state: 'visible' });
}

async function abrirBiblioteca(page, nombre) {
  await page.getByRole('button', { name: nombre }).first().click();
  await page.locator('.pace-lib').waitFor({ state: 'visible' });
}

async function empezarCoherente(page) {
  await abrirBiblioteca(page, 'Respira');
  await page.locator('.pace-lib h4 button', { hasText: 'Coherente 5·5' }).filter({ visible: true }).first().click();
  await page.locator('[data-pace-session-root]').waitFor({ state: 'visible' });
}

test.describe('en Android', () => {
  test('el boton atras cierra lo que esta encima y, sin nada abierto, manda la app al fondo', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoAndroid(context);
    const errores = capturarErrores(page);
    await irAlArtefacto(page);

    await abrirAjustes(page);
    await atras(page);
    await expect(page.locator('[data-pace-tweaks-panel]'), 'atras no cerro Ajustes').toHaveCount(0);

    /* Con el preview encima de la biblioteca, cierra solo el de arriba. */
    await abrirBiblioteca(page, 'Mueve');
    await page.locator('.pace-lib h4 button').filter({ visible: true }).first().click();
    await expect(page.locator('[data-pace-modal-card]')).toHaveCount(2);
    await atras(page);
    await expect(page.locator('[data-pace-modal-card]'), 'atras no cerro el dialogo de arriba').toHaveCount(1);
    await atras(page);
    await expect(page.locator('[data-pace-modal-card]')).toHaveCount(0);
    expect(await cuantas(page, 'App', 'minimizeApp'), 'se fue al fondo con algo abierto').toBe(0);

    await atras(page);
    expect(await cuantas(page, 'App', 'minimizeApp'), 'sin nada abierto, atras no mando la app al fondo').toBe(1);
    expect(errores).toEqual([]);
  });

  test('una sesion guiada mantiene la pantalla con KeepAwake, la suelta al salir, y atras sale de la sesion', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoAndroid(context);
    await irAlArtefacto(page);
    await empezarCoherente(page);
    await page.waitForTimeout(4500);   // de la preparacion al ejercicio: otra pantalla, la misma peticion
    expect(await cuantas(page, 'KeepAwake', 'keepAwake'), 'la sesion no pidio la pantalla a Android').toBe(1);
    expect(await cuantas(page, 'KeepAwake', 'allowSleep')).toBe(0);

    await atras(page);
    await expect(page.locator('[data-pace-session-root]'), 'atras no salio de la sesion').toHaveCount(0);
    await page.waitForTimeout(1900);
    expect(await cuantas(page, 'KeepAwake', 'allowSleep'), 'salir no solto la pantalla').toBe(1);
    expect(await cuantas(page, 'App', 'minimizeApp')).toBe(0);
  });

  test('la copia de «Tus datos» sale por el menu de compartir y no por una descarga', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoAndroid(context);
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
    expect(escrito.opts.encoding).toBe('utf8');
    const copia = JSON.parse(escrito.opts.data);
    expect(copia.app).toBe('PACE');
    expect(copia.state, 'la copia no lleva el estado').toBeTruthy();
    expect(copia.events, 'la copia no lleva los eventos').toBeTruthy();
    const [compartido] = await llamadas(page, 'Share', 'share');
    expect(compartido.opts.files).toEqual(['file:///data/user/0/com.ezradesign.pace/cache/' + escrito.opts.path]);
    expect(descargas, 'intento una descarga, que el WebView tira').toBe(0);
  });

  test('los enlaces legales van a la web publicada y el pie dice donde viven los datos', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoAndroid(context);
    await irAlArtefacto(page);
    await abrirAjustes(page);
    await expect(page.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', 'https://paceweb.pages.dev/privacy');
    await expect(page.getByRole('link', { name: 'Seguridad' })).toHaveAttribute('href', 'https://paceweb.pages.dev/safety');
    await expect(page.getByText('Todo vive en tu móvil.')).toBeVisible();
  });

  test('el aviso de fin de Foco se ofrece en Ajustes y pide el permiso de Android', async ({ page, context }) => {
    await sembrar(context, { soundOn: false, notifyFocusEnd: false });
    await comoAndroid(context, { permiso: 'prompt', concede: 'granted' });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const fila = page.locator('[data-pace-aj-fila="notify"]');
    await expect(fila, 'en Android no se ofrece el aviso').toBeVisible();
    await expect(fila).toContainText('Foco · si la app está en segundo plano');
    await fila.getByRole('switch').click();
    await expect.poll(() => cuantas(page, 'LocalNotifications', 'requestPermissions')).toBe(1);
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect((await leerEstado(page)).notifyFocusEnd).toBe(true);
  });

  test('con los avisos apagados en Android el interruptor no se enciende y la nota dice donde se activan', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await comoAndroid(context, { permiso: 'denied' });
    await irAlArtefacto(page);
    await abrirAjustes(page);
    const fila = page.locator('[data-pace-aj-fila="notify"]');
    await expect(fila.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('Los avisos de PACE están desactivados en los ajustes de Android.')).toBeVisible();
  });

  test('el aviso de fin de Foco lo programa Android solo mientras la app esta en el fondo', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });   // el aviso viene encendido de fabrica
    await comoAndroid(context, { permiso: 'granted' });
    await irAlArtefacto(page);
    await page.getByRole('button', { name: 'Empezar foco', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Pausar', exact: true })).toBeVisible();
    expect(await cuantas(page, 'LocalNotifications', 'schedule'), 'con la app delante ya avisa ella').toBe(0);

    await emitir(page, 'appStateChange', { isActive: false });
    const [programado] = await llamadas(page, 'LocalNotifications', 'schedule');
    expect(programado, 'al irse al fondo no se programo el aviso').toBeTruthy();
    const aviso = programado.opts.notifications[0];
    const fin = await page.evaluate(() => JSON.parse(localStorage.getItem('pace.timer.v1')).endsAt);
    expect(aviso.schedule.at, 'el aviso no es para el final del bloque').toBe(new Date(fin).toISOString());
    expect(aviso.schedule.allowWhileIdle).toBe(true);
    expect(aviso.title).toBe('Foco completado');
    expect(await cuantas(page, 'LocalNotifications', 'requestPermissions'), 'con el permiso dado no se vuelve a pedir').toBe(0);

    await emitir(page, 'appStateChange', { isActive: true });
    expect(await cuantas(page, 'LocalNotifications', 'cancel'), 'al volver no se cancelo: sonarian dos').toBe(1);

    /* En pausa no hay final que avisar. */
    await page.getByRole('button', { name: 'Pausar', exact: true }).click();
    await emitir(page, 'appStateChange', { isActive: false });
    expect(await cuantas(page, 'LocalNotifications', 'schedule'), 'programo un aviso con el Foco en pausa').toBe(1);
  });
});

test.describe('en la web (control)', () => {
  test('nada de esto se activa: la copia se descarga, los enlaces son rutas y el aviso habla de la pestaña', async ({ page, context }) => {
    await sembrar(context, { soundOn: false });
    await context.addInitScript(() => {
      try { Object.defineProperty(Notification, 'permission', { get: () => 'default' }); } catch (e) {}
    });
    await irAlArtefacto(page);
    expect(await page.evaluate(() => paceEsAndroid())).toBe(false);
    await abrirAjustes(page);
    await expect(page.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacy');
    await expect(page.getByText('Todo vive en tu navegador.')).toBeVisible();
    await expect(page.locator('[data-pace-aj-fila="notify"]')).toContainText('Foco · si la pestaña está detrás');
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Exportar una copia', exact: true }).click(),
    ]);
    expect(descarga.suggestedFilename()).toMatch(/^pace-backup-\d{8}\.json$/);
    await expect(page.getByText('Backup descargado.')).toBeVisible();
  });
});
