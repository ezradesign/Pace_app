/* PACE · E2E · LO QUE PIDEN LAS TIENDAS (Ez, «PACE, listo para las tiendas», 25 nov. 2026)
 * =====================================================================================
 * L1A · la página de ayuda (/support), la URL de soporte que exige la App Store: el correo, cómo
 *       llevarse los datos, los avisos, restaurar, cancelar y los enlaces a privacidad y seguridad,
 *       en los dos idiomas; abierta desde las apps, sin «Volver a la app».
 * L5A · «Cuéntanoslo» en las dos pantallas de error: un `mailto:` con la versión, la plataforma, dónde
 *       y el error, que la persona lee y envía en su correo. Sin nada que PACE mande solo.
 * L7A · los atajos del icono de las apps: Android (res/xml/shortcuts.xml) y el iPhone (Info.plist) abren
 *       PACE con pace://go/<tipo>, y la web abre lo mismo que con ?go=. Los nativos se leen del disco:
 *       los mismos tipos que el manifiesto de la web, apuntando a la actividad de PACE.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');

const ROOT = path.join(__dirname, '..');
const leer = (r) => fs.readFileSync(path.join(ROOT, r), 'utf8');

test.describe('L1A · la página de ayuda', () => {
  test('responde lo de siempre en los dos idiomas y lleva el correo', async ({ page }) => {
    await page.goto('/support.html');
    const es = page.locator('section[lang="es"]');
    const en = page.locator('section[lang="en"]');
    await expect(es.locator('h1')).toHaveText('Ayuda');
    await expect(en.locator('h1')).toHaveText('Help');
    for (const s of [es, en]) await expect(s.locator('.correo')).toHaveText('hola.ezradesign@gmail.com');
    await expect(es).toContainText('Exportar una copia');
    await expect(es).toContainText('Restaurar compras');
    await expect(es).toContainText('Gestionar la suscripción');
    await expect(en).toContainText('Restore purchases');
    for (const ruta of ['/privacy', '/safety', '/recuperar']) {
      await expect(es.locator('a[href="' + ruta + '"]'), 'falta el enlace a ' + ruta).toHaveCount(1);
    }
    await expect(page.locator('[data-pace-volver]').first()).toBeVisible();
  });

  test('abierta desde las apps (?app=1) no ofrece «Volver a la app»', async ({ page }) => {
    await page.goto('/support.html?app=1');
    await expect(page.locator('[data-pace-volver]')).toHaveCount(0);
    await expect(page.locator('[data-pace-otra-legal]')).toHaveAttribute('href', '/privacy?app=1');
  });

  test('la web la publica y el mapa la lleva', () => {
    expect(leer('scripts/web-dist.js')).toMatch(/WEB_ARCHIVOS = \[[^\]]*'support\.html'/);
    expect(leer('sitemap.xml')).toContain('<loc>https://pacegrass.app/support</loc>');
  });
});

test.describe('L5A · «Cuéntanoslo» en las pantallas de error', () => {
  test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

  test('la pantalla global lleva el correo con la versión, la plataforma y el error', async ({ page }) => {
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ plan: null }));
    const global = page.locator('[data-pace-red="global"]');
    await expect(global).toBeVisible();
    const enlace = global.locator('[data-pace-red-contar] a');
    await expect(enlace).toHaveText('Cuéntanoslo');
    const href = await enlace.getAttribute('href');
    expect(href.startsWith('mailto:hola.ezradesign@gmail.com?subject=')).toBe(true);
    const cuerpo = decodeURIComponent(href.split('&body=')[1]);
    const version = await page.evaluate(() => PACE_VERSION);
    expect(decodeURIComponent(href.split('subject=')[1].split('&')[0])).toBe('PACE ' + version + ' · algo se ha torcido');
    expect(cuerpo).toContain('PACE ' + version + ' · web · ');
    expect(cuerpo).toMatch(/Dónde: global/);
    expect(cuerpo).toMatch(/Error: .+/);
    expect(cuerpo).not.toContain('Error: ?');
  });

  test('el aviso de una parte también lo lleva, y dice dónde', async ({ page }) => {
    await irAlArtefacto(page);
    await page.evaluate(() => window.setState({ weeklyStats: null }));
    await page.getByRole('button', { name: 'Ver estadísticas' }).click();
    await page.locator('[data-pace-stats-tab="week"]').click();
    const parte = page.locator('[data-pace-red="parte"]');
    await expect(parte).toBeVisible();
    const href = await parte.locator('[data-pace-red-contar] a').getAttribute('href');
    expect(decodeURIComponent(href.split('&body=')[1])).not.toContain('Dónde: ?');
  });
});

/* Un Capacitor de Android falso con lo justo para arrancar, y el complemento App que guarda oyentes. */
async function comoAndroid(context) {
  await context.addInitScript(() => {
    const nativo = window.__nativo = { oyentes: {} };
    const vale = (r) => () => Promise.resolve(r);
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
      Plugins: {
        App: {
          addListener: (evento, cb) => { (nativo.oyentes[evento] = nativo.oyentes[evento] || []).push(cb); return { remove() {} }; },
          minimizeApp: vale(),
        },
        KeepAwake: { keepAwake: vale(), allowSleep: vale() },
        LocalNotifications: {
          checkPermissions: vale({ display: 'granted' }), requestPermissions: vale({ display: 'granted' }),
          schedule: vale({ notifications: [] }), cancel: vale(),
          checkExactNotificationSetting: vale({ exact_alarm: 'granted' }), changeExactNotificationSetting: vale({ exact_alarm: 'granted' }),
        },
      },
    };
    nativo.emitir = (evento, datos) => (nativo.oyentes[evento] || []).forEach(cb => cb(datos));
  });
}

test.describe('L7A · los atajos del icono', () => {
  test.beforeEach(async ({ context }) => { await sembrar(context, { soundOn: false }); });

  test('pace://go/<tipo> abre lo mismo que ?go=, y lo que no es un atajo no abre nada', async ({ page, context }) => {
    await comoAndroid(context);
    await irAlArtefacto(page);
    await expect.poll(() => page.evaluate(() => (window.__nativo.oyentes.appUrlOpen || []).length)).toBeGreaterThan(0);
    const emitir = (url) => page.evaluate((u) => window.__nativo.emitir('appUrlOpen', { url: u }), url);

    await emitir('https://ejemplo.com/go/breathe');
    await emitir('pace://go/borrar');
    await page.waitForTimeout(300);
    await expect(page.locator('.pace-lib'), 'abrió algo con una dirección que no es un atajo').toHaveCount(0);

    await emitir('pace://go/breathe');
    await expect(page.locator('.pace-lib')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pace-lib')).toHaveCount(0);

    await emitir('pace://go/hydrate');
    await expect(page.getByRole('dialog', { name: 'Hidrátate', exact: true })).toBeVisible();
  });

  test('en la web no se escucha nada', async ({ page }) => {
    await irAlArtefacto(page);
    expect(await page.evaluate(() => typeof paceNativoAtajos(() => {}))).toBe('function');
    expect(await page.evaluate(() => [paceAtajoDeUrl('pace://go/stretch'), paceAtajoDeUrl('pace://go/x'), paceAtajoDeUrl(null)]))
      .toEqual(['stretch', null, null]);
  });

  test('Android y el iPhone declaran los atajos de la web, y Android los manda a la actividad de PACE', () => {
    const web = JSON.parse(leer('manifest.webmanifest')).shortcuts.map((a) => /go=(\w+)/.exec(a.url)[1]);
    const xml = leer('android/app/src/main/res/xml/shortcuts.xml');
    const android = [...xml.matchAll(/android:data="pace:\/\/go\/(\w+)"/g)].map((m) => m[1]);
    expect(android.length).toBeGreaterThan(0);
    for (const t of android) expect(web, 'Android tiene un atajo que la web no: ' + t).toContain(t);
    expect((xml.match(/android:targetClass="com\.ezradesign\.pace\.MainActivity"/g) || []).length).toBe(android.length);
    expect(leer('android/app/src/main/AndroidManifest.xml')).toContain('android:name="android.app.shortcuts" android:resource="@xml/shortcuts"');
    for (const v of ['values', 'values-es']) {
      const s = leer('android/app/src/main/res/' + v + '/strings.xml');
      for (const n of [...xml.matchAll(/@string\/(\w+)/g)].map((m) => m[1])) expect(s, v + ' sin ' + n).toContain('name="' + n + '"');
    }
    const plist = leer('ios/App/App/Info.plist');
    const ios = [...plist.matchAll(/<string>com\.ezradesign\.pace\.(\w+)<\/string>/g)].map((m) => m[1]);
    expect(ios).toEqual(android);
    expect(leer('ios/App/App/SceneDelegate.swift')).toContain('"pace://go/" + tipo');
    const titulos = [...plist.matchAll(/UIApplicationShortcutItemTitle<\/key>\s*<string>([^<]+)</g)].map((m) => m[1]);
    for (const t of titulos) expect(leer('ios/App/App/en.lproj/InfoPlist.strings')).toContain('"' + t + '" = ');
  });
});
