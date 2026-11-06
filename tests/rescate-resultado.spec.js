/* PACE · E2E · LA COPIA DE RESCATE DICE CÓMO LE FUE (revisión de ChatGPT del 5 nov. 2026, punto 4)
 * ================================================================================================
 * «Descargar la copia de rescate» (la fila de «Tus datos» que solo existe si un arranque no pudo
 * leer algo) devolvía `true` sin esperar a la hoja de compartir de las apps y no decía nada: si el
 * móvil no podía crear el archivo, fallaba el menú o se cerraba sin elegir, la fila se quedaba
 * muda. Ahora usa los mismos avisos que la copia normal: elige dónde guardarla, cancelada, o no
 * se pudo exportar; en la web, «Copia descargada». No da el logro de exportar.
 *
 * En las apps el Capacitor es un falso con los complementos que la copia necesita (como en
 * android-nativo.spec.js); lo que haga Android con el archivo se mira en un móvil.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto, abrirTusDatos } = require('./helpers');

const RESCATE = JSON.stringify({ v: 1, savedAt: new Date(2026, 9, 4, 9, 0).getTime(), motivo: 'prueba', raw: '{"roto":' });

async function comoAndroid(context) {
  await context.addInitScript(() => {
    const nativo = window.__nativo = { llamadas: [] };
    const apunta = (plugin, metodo, contesta) => function (opts) {
      nativo.llamadas.push({ plugin, metodo, opts: opts === undefined ? null : JSON.parse(JSON.stringify(opts)) });
      return Promise.resolve(typeof contesta === 'function' ? contesta(opts) : contesta);
    };
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: { addListener: () => ({ remove() {} }), minimizeApp: apunta('App', 'minimizeApp') },
        KeepAwake: { keepAwake: apunta('KeepAwake', 'keepAwake'), allowSleep: apunta('KeepAwake', 'allowSleep') },
        Filesystem: { writeFile: apunta('Filesystem', 'writeFile', (op) => ({ uri: 'file:///cache/' + op.path })) },
        Share: { share: apunta('Share', 'share', {}) },
        LocalNotifications: {
          checkPermissions: apunta('LocalNotifications', 'checkPermissions', { display: 'prompt' }),
          requestPermissions: apunta('LocalNotifications', 'requestPermissions', { display: 'granted' }),
          schedule: apunta('LocalNotifications', 'schedule', { notifications: [] }),
          cancel: apunta('LocalNotifications', 'cancel'),
          checkExactNotificationSetting: apunta('LocalNotifications', 'checkExactNotificationSetting', { exact_alarm: 'denied' }),
          changeExactNotificationSetting: apunta('LocalNotifications', 'changeExactNotificationSetting', { exact_alarm: 'granted' }),
        },
      },
    };
  });
}

async function pulsarRescate(page) {
  await page.evaluate((r) => localStorage.setItem('pace.state.v2.rescate', r), RESCATE);
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await abrirTusDatos(page);
  const fila = page.locator('[data-pace-aj-rescate]');
  await expect(fila).toBeVisible();
  await fila.click();
}

const aviso = (page) => page.locator('.pace-aj-msg');
const logro = (page) => page.evaluate(() => !!getState().achievements['secret.backup']);

test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

test('en la web, la copia de rescate dice «Copia descargada.» y no da el logro de exportar', async ({ page }) => {
  await irAlArtefacto(page);
  const [descarga] = await Promise.all([page.waitForEvent('download'), pulsarRescate(page)]);
  expect(descarga.suggestedFilename()).toMatch(/^pace-rescate-\d{8}\.json$/);
  await expect(aviso(page), 'la fila se quedó muda').toHaveText('Copia descargada.');
  await page.waitForTimeout(300);
  expect(await logro(page), 'el rescate no es exportar tus datos').toBe(false);
});

test('en el móvil, con el menú abierto dice «elige dónde guardarla»', async ({ page, context }) => {
  await comoAndroid(context);
  await irAlArtefacto(page);
  await pulsarRescate(page);
  await expect(aviso(page)).toHaveText('Copia lista: elige dónde guardarla.');
  const [escrito] = await page.evaluate(() => window.__nativo.llamadas.filter((l) => l.plugin === 'Filesystem'));
  expect(escrito.opts.path).toMatch(/^pace-rescate-\d{8}\.json$/);
  expect(JSON.parse(escrito.opts.data).kind).toBe('rescate');
});

for (const caso of [
  { nombre: 'se cierra el menú sin elegir', plugin: 'Share', metodo: 'share', error: 'Share canceled', texto: 'Copia cancelada.' },
  { nombre: 'el archivo no se escribe', plugin: 'Filesystem', metodo: 'writeFile', error: 'sin sitio', texto: 'No se pudo exportar.' },
]) {
  test(`en el móvil, si ${caso.nombre}, la fila lo dice`, async ({ page, context }) => {
    await comoAndroid(context);
    await irAlArtefacto(page);
    await page.evaluate(([p, m, e]) => { window.Capacitor.Plugins[p][m] = () => Promise.reject(new Error(e)); },
      [caso.plugin, caso.metodo, caso.error]);
    await pulsarRescate(page);
    await expect(aviso(page), 'la copia de rescate no dijo cómo le fue').toHaveText(caso.texto);
  });
}
