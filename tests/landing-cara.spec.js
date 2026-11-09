/* PACE · LA RAÍZ CON DOS CARAS (opción C, Ez, 9 nov. 2026)
   La raíz decide en el <head> (landing/cara.js) si enseña la app o la landing. Cada caso se
   prueba dos veces: con el index.html de verdad y con un MUTANTE que quita su regla, servido con
   `page.route`; si el mutante no cambia la cara, la prueba no defiende nada y sale roja.
   Aquí no vale la marca de la suite (tests/helpers.js): se entra con el navegador vacío. */
'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { RUTA_ARTEFACTO, CLAVE_ESTADO, MARCA_CARA, SEMILLA } = require('./helpers');
const { paraApps } = require('../scripts/android-www.js');

const INDEX = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const INICIO = INDEX.indexOf('<!--pace-landing-->');
const FIN = INDEX.indexOf('<!--/pace-landing-->', INICIO);

test.use({ storageState: { cookies: [], origins: [] }, serviceWorkers: 'block' });

/* El index.html con `buscar` cambiado por `poner` dentro del bloque de la decisión. */
function mutar([buscar, poner]) {
  const bloque = INDEX.slice(INICIO, FIN);
  if (INICIO < 0 || bloque.indexOf(buscar) < 0) throw new Error('GUARD: «' + buscar + '» no está en landing/cara.js');
  return INDEX.slice(0, INICIO) + bloque.replace(buscar, () => poner) + INDEX.slice(FIN);
}

async function abrirCon(browser, html, antes, arg, url) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route((u) => u.pathname === '/index.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
  if (antes) await page.addInitScript(antes, arg);
  await page.goto(url || RUTA_ARTEFACTO);
  return { ctx, page };
}

const leerCara = (page) => page.evaluate(() => document.documentElement.getAttribute('data-pace-cara'));

const CASOS = [
  { nombre: 'con algo guardado de la app', cara: 'app',
    antes: ([k, v]) => localStorage.setItem(k, v), arg: [CLAVE_ESTADO, JSON.stringify(SEMILLA)],
    mutante: ["if (k && k.indexOf('pace.') === 0 && !AJENAS[k]) return 'app';", ''] },
  { nombre: 'abierta desde el icono instalado', cara: 'app',
    antes: () => { const o = window.matchMedia.bind(window); window.matchMedia = (q) => o(/display-mode:\s*browser/.test(q) ? '(min-width: 99999px)' : q); },
    mutante: ["if (!window.matchMedia || !window.matchMedia('(display-mode: browser)').matches) return 'app';", ''] },
  { nombre: 'iPhone, desde la pantalla de inicio', cara: 'app',
    antes: () => Object.defineProperty(Navigator.prototype, 'standalone', { get: () => true, configurable: true }),
    mutante: ["if (navigator.standalone === true) return 'app';", ''] },
  { nombre: 'enlace de tester con #codigo=', cara: 'app', url: RUTA_ARTEFACTO + '#codigo=PACE1.prueba.firma',
    mutante: ["if (/(^#|[#&])codigo=/.test(location.hash)) return 'app';", ''] },
  { nombre: 'atajo del icono con ?go=', cara: 'app', url: RUTA_ARTEFACTO + '?go=focus',
    mutante: ["if (/[?&]go=/.test(location.search)) return 'app';", ''] },
  { nombre: 'ya pulsó «Abrir PACE» (la marca)', cara: 'app',
    antes: (k) => localStorage.setItem(k, 'app'), arg: MARCA_CARA,
    mutante: ["if (ls.getItem(MARCA)) return 'app';", ''] },
  { nombre: 'error al leer lo guardado', cara: 'app',
    antes: () => Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); }, configurable: true }),
    mutante: ["try { cara = decidir(); } catch (e) { cara = 'app'; }", "try { cara = decidir(); } catch (e) { cara = 'landing'; }"] },
  { nombre: 'Android e iPhone (Capacitor)', cara: 'app',
    antes: () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'android' }; },
    mutante: ["if (window.Capacitor || location.protocol === 'capacitor:') return 'app';", ''] },
  { nombre: 'llega nuevo, sin nada (o un buscador)', cara: 'landing',
    mutante: ["    return 'landing';\n  }", "    return 'app';\n  }"] },
  { nombre: 'solo pasó por /premium (su idioma no es de la app)', cara: 'landing',
    antes: () => localStorage.setItem('pace.premium.lang', 'en'),
    mutante: [' && !AJENAS[k]', ''] },
];

for (const caso of CASOS) {
  test('la cara de la raíz: ' + caso.nombre, async ({ browser }) => {
    for (const [html, esperada, etiqueta] of [[INDEX, caso.cara, 'index.html'], [mutar(caso.mutante), caso.cara === 'app' ? 'landing' : 'app', 'MUTANTE']]) {
      const { ctx, page } = await abrirCon(browser, html, caso.antes, caso.arg, caso.url);
      expect(await leerCara(page), etiqueta + ' · ' + caso.nombre).toBe(esperada);
      await ctx.close();
    }
  });
}

test('sin JavaScript (un buscador que no lo ejecuta), el texto de la landing está en el HTML', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.locator('#pace-landing h1 span[lang="es"]')).toHaveText('Pausas activas para quien trabaja sentado.');
  await expect(page.locator('#pace-landing h1 span[lang="en"]')).toBeHidden();
  await expect(page.locator('#pace-landing a[data-pace-abrir]').first()).toHaveAttribute('href', '/?go=inicio');
  await ctx.close();
});

/* La app evalúa sus módulos detrás de la landing, pero no monta ni abre su base de eventos: el
   MUTANTE abre la base al cargar, como antes de la landing (app/events/events-store.js). */
/* `.pl-foto img { display: block }` ganaba a la regla que esconde el otro idioma y salían las dos. */
test('se ve una sola captura de la jornada, la del idioma de la landing', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.locator('#pace-landing .pl-foto img:visible')).toHaveCount(1);
  await expect(page.locator('#pace-landing .pl-foto img:visible')).toHaveAttribute('lang', 'es');
  await page.locator('[data-pace-landing-idioma-boton]').click();
  await expect(page.locator('#pace-landing .pl-foto img:visible')).toHaveCount(1);
  await expect(page.locator('#pace-landing .pl-foto img:visible')).toHaveAttribute('lang', 'en');
  expect(await page.title()).toBe('PACE · Active breaks for people who work at a desk');
});

test('con la landing delante no se guarda nada, ni pasadas dos horas ni al irse', async ({ browser }) => {
  const app = ['window.paceCuandoAbra(paceEventsBoot);', 'paceEventsBoot();'];
  if (INDEX.indexOf(app[0]) < 0) throw new Error('GUARD: el arranque de los eventos ya no pasa por paceCuandoAbra');
  for (const [html, idb] of [[INDEX, []], [INDEX.replace(app[0], () => app[1]), ['pace.events']]]) {
    const { ctx, page } = await abrirCon(browser, html);
    await page.clock.install();
    await page.reload();
    expect(await leerCara(page)).toBe('landing');
    await page.clock.fastForward('02:00:00');
    await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('blur')); document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.fastForward('00:01:00');
    const guardado = await page.evaluate(async () => ({ ls: Object.keys(localStorage), idb: (await indexedDB.databases()).map((d) => d.name) }));
    expect(guardado, html === INDEX ? 'index.html' : 'MUTANTE').toEqual({ ls: [], idb });
    await ctx.close();
  }
});

test('«Abrir PACE» abre la app en el sitio, sin recargar, y deja la marca', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.locator('#pace-landing h1')).toBeVisible();
  await page.evaluate(() => { window.__sinRecargar = true; });
  await page.locator('.pl-portada [data-pace-abrir]').click();
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
  await expect(page.locator('#pace-landing')).toBeHidden();
  expect(await page.evaluate(() => [window.__sinRecargar, location.pathname + location.search, localStorage.getItem('pace-cara')]))
    .toEqual([true, '/index.html', 'app']);
  await page.reload();
  expect(await leerCara(page)).toBe('app');
});

test('«¿Ya usas PACE? Ábrelo» de la cabecera también abre la app', async ({ page }) => {
  await page.goto(RUTA_ARTEFACTO);
  await page.locator('.pl-ya').click();
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
});

test('quien tiene eventos y no localStorage acaba en la app (y el mutante no)', async ({ browser }) => {
  const sembrarEventos = () => new Promise((ok) => {
    const p = indexedDB.open('pace.events', 1);
    p.onupgradeneeded = () => p.result.createObjectStore('contenedor');
    p.onsuccess = () => {
      const tx = p.result.transaction('contenedor', 'readwrite');
      tx.objectStore('contenedor').put(JSON.stringify({ events: [{ type: 'prueba' }] }), 'pace.events.v1');
      tx.oncomplete = () => { p.result.close(); ok(); };
    };
  });
  const regla = ['if (c && c.events && c.events.length) paceAbrirApp();', ''];
  for (const [html, esperada] of [[INDEX, 'app'], [mutar(regla), 'landing']]) {
    const { ctx, page } = await abrirCon(browser, html);
    expect(await leerCara(page)).toBe('landing');
    await page.evaluate(sembrarEventos);
    await page.reload();
    if (esperada === 'app') await expect.poll(() => leerCara(page)).toBe('app');
    else { await page.waitForTimeout(1500); expect(await leerCara(page), 'MUTANTE').toBe('landing'); }
    await ctx.close();
  }
});

test('en Android e iPhone (www/) no va la landing, y la app monta con el navegador vacío', async ({ page }) => {
  const apps = paraApps('index.html', Buffer.from(INDEX)).toString('utf8');
  expect(INDEX).toContain('id="pace-landing"');
  expect(apps).not.toContain('pace-landing');
  expect(apps).not.toContain('window.paceCuandoAbra = paceCuandoAbra');
  expect(paraApps('privacy.html', Buffer.from('x')).toString()).toBe('x');
  await page.route((u) => u.pathname === '/index.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: apps }));
  await page.goto(RUTA_ARTEFACTO);
  await expect(page.locator('[data-pace-onb-comenzar], [data-pace-dial-number]').first()).toBeVisible();
});
