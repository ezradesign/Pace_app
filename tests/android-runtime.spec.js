/* PACE · la app dentro de Android (Capacitor)
 * ===========================================
 * En el APK, la web corre en un WebView donde existe `window.Capacitor`. Aqui
 * se simula ese objeto en el navegador de la suite: no se prueba el WebView
 * real, se prueba que la app tome las tres decisiones que dependen de el.
 *
 *   · No registra el service worker: los archivos ya van dentro del APK, y un
 *     worker solo serviria una cache vieja despues de cada actualizacion.
 *   · Los eventos se guardan con el adaptador web (IndexedDB del WebView), no
 *     con el inerte: sin ellos, las estadisticas y «A tu ritmo» no aprenden.
 *   · Pide almacenamiento persistente, para que Chromium no vacie ese
 *     IndexedDB si el movil se queda sin espacio. En la web no se pide.
 *
 * Cada prueba tiene su control en web, para que un espia que no mide nada no
 * salga verde.
 */
'use strict';

const { test, expect } = require('@playwright/test');
const { sembrar, irAlArtefacto } = require('./helpers');
const { esperarInit, leerContenedor, sembrarEventos } = require('./eventos.helpers');

/* Cuenta las llamadas a `register` sin impedirlas. Va en cada navegacion. */
async function espiarServiceWorker(context) {
  await context.addInitScript(() => {
    window.__swRegistros = 0;
    if (!('serviceWorker' in navigator)) return;
    const original = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register = function () {
      window.__swRegistros++;
      return original.apply(null, arguments);
    };
  });
}

/* Cuenta las peticiones de almacenamiento persistente sin hacerlas. */
async function espiarPersistencia(context) {
  await context.addInitScript(() => {
    window.__persistencias = 0;
    if (!navigator.storage) return;
    navigator.storage.persist = function () {
      window.__persistencias++;
      return Promise.resolve(true);
    };
  });
}

async function comoAndroid(context) {
  await context.addInitScript(() => {
    window.Capacitor = {
      getPlatform: () => 'android',
      isNativePlatform: () => true,
    };
  });
}

test.beforeEach(async ({ context }) => {
  await sembrar(context);
  await espiarServiceWorker(context);
});

test('control: en la web se registra el service worker', async ({ page }) => {
  await irAlArtefacto(page);
  await page.waitForLoadState('load');
  await expect.poll(() => page.evaluate(() => window.__swRegistros)).toBe(1);
});

test('en Android no se registra el service worker', async ({ page, context }) => {
  await comoAndroid(context);
  await irAlArtefacto(page);
  await page.waitForLoadState('load');
  expect(await page.evaluate(() => typeof window.Capacitor.getPlatform)).toBe('function');
  expect(await page.evaluate(() => window.__swRegistros)).toBe(0);
});

test('en Android los eventos se guardan con el adaptador web', async ({ page, context }) => {
  await comoAndroid(context);
  await irAlArtefacto(page);
  await esperarInit(page);

  expect(await page.evaluate(() => window.paceEventsRuntime())).toBe('capacitor-android');
  expect(await page.evaluate(() => window.paceEventsAdapter())).toBe('web');
  expect(await page.evaluate(() => window.paceEventsCanWrite())).toBe(true);

  await sembrarEventos(page, 2);
  const c = await leerContenedor(page);
  expect(c.events.length).toBe(2);
});

test('en Android se pide almacenamiento persistente', async ({ page, context }) => {
  await espiarPersistencia(context);
  await comoAndroid(context);
  await irAlArtefacto(page);
  await esperarInit(page);
  expect(await page.evaluate(() => window.__persistencias)).toBe(1);
});

test('en la web no se pide almacenamiento persistente', async ({ page, context }) => {
  await espiarPersistencia(context);
  await irAlArtefacto(page);
  await esperarInit(page);
  expect(await page.evaluate(() => window.__persistencias)).toBe(0);
});

test('control: en iOS los eventos siguen apagados', async ({ page, context }) => {
  await context.addInitScript(() => {
    window.Capacitor = { getPlatform: () => 'ios', isNativePlatform: () => true };
  });
  await irAlArtefacto(page);
  await esperarInit(page);

  expect(await page.evaluate(() => window.paceEventsRuntime())).toBe('capacitor-ios');
  expect(await page.evaluate(() => window.paceEventsAdapter())).toBe('null');
  expect(await page.evaluate(() => window.paceEventsCanWrite())).toBe(false);
});
