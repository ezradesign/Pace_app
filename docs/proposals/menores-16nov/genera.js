/* PACE · las fotos y medidas de «Tres arreglos menores» (16 nov. 2026)
   ==================================================================
   Abre el `index.html` compilado con Playwright, a 360 × 640 y en español, llega a cada pantalla como
   una persona (la rutina desde su evento, la jornada con su reloj) y pinta cada opción SOBRE EL DOM DE
   VERDAD: textos puestos en los huecos que ya existen, con su letra y su color. Nada toca `app/`. La C
   de los cambios de lado cambia la rutina EN MEMORIA (el paso pasa a «por lados») y deja que el runner
   de verdad la corra.

   También mide lo que la página cuenta: cuánto crece el texto con la palabra delante, y la jornada con
   el aro a 10, 15, 25 y 45 (pausas de pie y sentadas, gratis y con PACE completo, 20 laborables).
   Lo medido va a `medidas.json`.

   Uso, desde la raíz del repo y con `index.html` recién compilado (node build-standalone.js):
     node docs/proposals/menores-16nov/genera.js          (todo)
     node docs/proposals/menores-16nov/genera.js 1        (solo los cambios dentro del paso)
   Sirve en el puerto 8885 (nunca el 8765 de la suite). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const P = require('./genera.piezas');

const FOTOS = path.join(__dirname, 'fotos');
const PUERTO = 8885;
const BASE = 'http://localhost:' + PUERTO;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*', soundOn: false, sidebarCollapsed: true, ritmo: { libre: true } };
const medidas = {};

async function abrir(browser, { estado, hora, ancho, alto }) {
  const context = await browser.newContext({
    viewport: { width: ancho || 360, height: alto || 640 }, deviceScaleFactor: 2, isMobile: !ancho, hasTouch: !ancho,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  await context.addInitScript(([e]) => {
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [Object.assign({}, SEMILLA, estado || {})]);
  await context.clock.install({ time: hora || new Date('2026-11-18T10:00:00+01:00').getTime() });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return { context, page };
}

async function foto(page, nombre) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('  foto', nombre);
}

/* ---------- 1 · Los cambios dentro de un paso ---------- */

async function escena1(browser) {
  console.log('1 · cambios dentro del paso');
  /* Hoy, A y B: «Brazos libres», en la repetición 5 de 16 (justo tras el primer cambio de sentido). */
  const { context, page } = await abrir(browser, {});
  await P.lanzarRutina(page, 'move.shoulder.circles');
  await P.hastaTrabajo(page);
  await P.avanzar(page, 17);
  medidas.hoy = await P.medirRunner(page);
  await foto(page, '1-hoy');
  medidas.a = await P.pintarPalabra(page, 'Atrás');
  await foto(page, '1-a');
  await P.quitarPalabra(page);
  medidas.b = await P.pintarRotulo(page, 'Brazo 1 · atrás');
  await foto(page, '1-b');
  /* La A otra vez en la repetición 9, el cambio de brazo. */
  await P.pintarRotulo(page, '');
  await P.avanzar(page, 16);
  medidas.a9 = await P.pintarPalabra(page, 'Otro brazo, adelante', true);
  await foto(page, '1-a9');
  await context.close();

  /* C: el paso pasa a «por lados» en memoria y lo corre el runner de verdad: la pantalla de cambio. */
  const c = await abrir(browser, {});
  await P.lanzarRutina(c.page, 'move.shoulder.circles', { porLados: 32 });
  await P.hastaTrabajo(c.page);
  await P.avanzar(c.page, 33);
  medidas.c = await P.medirRunner(c.page);
  await foto(c.page, '1-c');
  await c.context.close();
}

/* ---------- 2 · El cierre que nunca es «Ahora» ---------- */

async function escena2(browser) {
  console.log('2 · el cierre de la jornada');
  const HOY = '2026-11-18';
  const hora = new Date(HOY + 'T15:10:00+01:00').getTime();
  const estado = { ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 },
    dia: { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } };
  const { context, page } = await abrir(browser, { estado, hora });
  medidas.cierre = await P.jornadaHastaElCierre(page, async (n) => foto(page, n));
  await context.close();
  /* La A se pinta sobre la pausa abierta tras el bloque 1, en otra pestaña con el mismo día. */
  const a = await abrir(browser, { estado, hora });
  await P.jornadaHastaElCierre(a.page, async (n) => foto(a.page, n), true);
  await a.context.close();
}

/* ---------- 3 · La tarde sin rutinas de pie ---------- */

async function escena3(browser) {
  console.log('3 · pausas de pie con el aro corto');
  const { context, page } = await abrir(browser, { ancho: 1280, alto: 800 });
  medidas.dePie = await P.medirDePie(page);
  await context.close();
}

/* ---------- 4 · La carta del lunes (la lectura C, ya hecha) ---------- */

async function escena4(browser) {
  console.log('4 · la carta del lunes');
  const { context, page } = await abrir(browser, { hora: new Date(2026, 10, 16, 8, 30).getTime(),
    estado: { ritmo: { horario: { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }, libre: true } } });
  await P.ponerCarta(page);
  await foto(page, '4-carta');
  await context.close();
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const solo = (process.argv[2] || '1,2,3,4').split(',');
  const srv = spawn(process.execPath, [path.join(RAIZ, '.claude', 'static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  try {
    if (solo.includes('1')) await escena1(browser);
    if (solo.includes('2')) await escena2(browser);
    if (solo.includes('3')) await escena3(browser);
    if (solo.includes('4')) await escena4(browser);
  } finally {
    await browser.close();
    srv.kill();
  }
  const archivo = path.join(__dirname, 'medidas.json');
  const antes = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : {};
  fs.writeFileSync(archivo, JSON.stringify(Object.assign(antes, medidas), null, 2) + '\n');
  console.log('medidas.json escrito');
})();
