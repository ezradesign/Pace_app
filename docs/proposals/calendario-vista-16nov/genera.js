/* PACE · las fotos de «El calendario a la vista» (16 nov. 2026)
   ============================================================
   Abre el `index.html` compilado con Playwright a las 20:35 de un lunes, la hora de la captura de
   Ez («Una hora · Hasta las 21:35», «Media jornada» y «Jornada entera» apagadas), en el ordenador
   (1280 × 800 y 1536 × 710) y en el móvil (360 × 640 y 360 × 740), y pinta cada forma de enseñar el
   calendario en la tarjeta «¿Cuánto trabajas hoy?» SOBRE EL DOM DE VERDAD (genera.piezas.js).
   Luego monta la hoja «Tu día en el calendario» como saldría sin día todavía, en la web sin las
   altas, en la web con ellas, en Android, en el iPhone de hoy y en el iPhone con el plan de EventKit.
   Android y el iPhone se fingen como en las pruebas (`window.Capacitor`), sin tocar el código.

   Mide lo que Ez pide (si la home pide scroll, si lo nuevo pisa algo, el tamaño del aro) también con
   la letra al 115 % y en inglés, y lo deja en `medidas.json`, que la página cita.

   Uso, desde la raíz del repo y con `index.html` recién compilado (node build-standalone.js):
     node docs/proposals/calendario-vista-16nov/genera.js
   Sirve en el puerto 8895 (nunca el 8765 de la suite). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const P = require('./genera.piezas');

const FOTOS = path.join(__dirname, 'fotos');
const PUERTO = Number(process.env.PACE_FOTOS_PORT || 8895);
const BASE = 'http://localhost:' + PUERTO;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*', soundOn: false, sidebarCollapsed: true, ritmo: { libre: true } };
const NOCHE = new Date('2026-11-16T20:35:05+01:00').getTime();
const PANTALLAS = { 1280: { w: 1280, h: 800 }, 1536: { w: 1536, h: 710 }, 640: { w: 360, h: 640, m: true }, 740: { w: 360, h: 740, m: true } };
const medidas = {};

/* Android o el iPhone, fingidos como en tests/android-calendario.spec.js: el calendario del móvil
   sin permiso todavía (la hoja enseña «Conectar»). */
function comoNativo(plataforma) {
  window.Capacitor = {
    getPlatform: () => plataforma, isNativePlatform: () => true,
    Plugins: Object.assign({
      App: { addListener: () => ({ remove() {} }), minimizeApp: () => Promise.resolve() },
      LocalNotifications: { checkPermissions: () => Promise.resolve({ display: 'granted' }), addListener: () => ({ remove() {} }) },
      Filesystem: { writeFile: () => Promise.resolve({ uri: 'file://x' }) },
      Share: { share: () => Promise.resolve() },
    }, plataforma === 'android' ? {
      CapacitorCalendar: {
        requestFullCalendarAccess: () => Promise.resolve({ result: 'granted' }),
        checkAllPermissions: () => Promise.resolve({ result: { readCalendar: 'prompt', writeCalendar: 'prompt' } }),
        listCalendars: () => Promise.resolve({ result: [] }), getDefaultCalendar: () => Promise.resolve({ result: null }),
        listEventsInRange: () => Promise.resolve({ result: [] }),
      },
      PaceCalendario: { instalado: () => Promise.resolve({ instalado: 1760000000000 }) },
    } : {}),
  };
}

async function asentar(page) {
  return page.evaluate(async () => {
    const mc = document.querySelector('[data-pace-main-content]');
    if (mc && mc.getAnimations) await Promise.all(mc.getAnimations().map((a) => a.finished.catch(() => {})));
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const leer = () => getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d').trim();
    let previo = leer(), iguales = 0;
    for (let i = 0; i < 90 && iguales < 3; i++) { await frame(); const a = leer(); iguales = a === previo ? iguales + 1 : 0; previo = a; }
    return iguales >= 3;
  });
}

async function abrir(browser, { pantalla, lang, nativo }) {
  const vp = PANTALLAS[pantalla];
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.m ? 2 : 1, isMobile: !!vp.m, hasTouch: !!vp.m,
    locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  if (nativo) await context.addInitScript(comoNativo, nativo);
  await context.addInitScript(([e]) => {
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [Object.assign({}, SEMILLA, { lang: lang || 'es' })]);
  await context.clock.install({ time: NOCHE });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  await asentar(page);
  return { context, page };
}

async function foto(page, nombre) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('  foto', nombre);
}

/* ---------- La tarjeta: hoy, A, B y C en las cuatro pantallas ---------- */

async function tarjeta(browser) {
  for (const pantalla of [1280, 1536, 640, 740]) {
    const { context, page } = await abrir(browser, { pantalla });
    await asentar(page);
    medidas['hoy-' + pantalla] = await P.medir(page);
    await foto(page, 'hoy-' + pantalla);
    for (const op of ['A', 'B', 'C']) {
      await P.pintar(page, op, { web: true });
      await asentar(page);
      medidas[op + '-' + pantalla] = await P.medir(page);
      await foto(page, op.toLowerCase() + '-' + pantalla);
    }
    /* A, ya conectado: lo que dice la tarjeta al día siguiente. */
    await P.pintar(page, 'A', { conectado: true });
    await asentar(page);
    medidas['A-con-' + pantalla] = await P.medir(page);
    if (pantalla === 1280 || pantalla === 640) await foto(page, 'a-con-' + pantalla);
    await context.close();
  }
}

/* ---------- Con la letra al 115 % y en inglés, en el móvil bajo ---------- */

async function grande(browser) {
  for (const lang of ['es', 'en']) {
    for (const op of ['hoy', 'A', 'B', 'C']) {
      for (const con of op === 'A' ? [false, true] : [false]) {
        const { context, page } = await abrir(browser, { pantalla: 640, lang });
        if (op !== 'hoy') await P.pintar(page, op, { lang, conectado: con, web: true });
        await asentar(page);
        const clave = op + (con ? '-con' : '') + '-640-' + lang;
        medidas[clave] = await P.medir(page);
        await P.letraGrande(page);
        await asentar(page);
        medidas[clave + '-115'] = await P.medir(page);
        if ((!con && (lang === 'es' || op === 'A')) || (con && lang === 'es')) await foto(page, op.toLowerCase() + (con ? '-con' : '') + '-640-' + lang + '-115');
        await context.close();
      }
    }
  }
  /* El inglés en el ordenador, con el enlace más largo. */
  for (const pantalla of [1280, 1536]) {
    const { context, page } = await abrir(browser, { pantalla, lang: 'en' });
    await P.pintar(page, 'A', { lang: 'en', conectado: true });
    await asentar(page);
    medidas['A-con-' + pantalla + '-en'] = await P.medir(page);
    if (pantalla === 1280) await foto(page, 'a-con-1280-en');
    await context.close();
  }
}

/* ---------- La hoja sin día, según dónde estés ---------- */

async function hojas(browser) {
  const casos = [
    { v: 'web', pantalla: 1280, nombre: 'hoja-web-1280' },
    { v: 'altas', pantalla: 1280, nombre: 'hoja-altas-1280' },
    { v: 'android', pantalla: 640, nativo: 'android', nombre: 'hoja-android-640' },
    { v: 'android', pantalla: 640, nativo: 'android', hecho: true, nombre: 'hoja-android-hecho-640' },
    { v: 'iphoneHoy', pantalla: 640, nativo: 'ios', nombre: 'hoja-iphone-hoy-640' },
    { v: 'iphone', pantalla: 640, nativo: 'android', nombre: 'hoja-iphone-plan-640' },
    { v: 'web', pantalla: 640, nombre: 'hoja-web-640' },
  ];
  for (const c of casos) {
    const { context, page } = await abrir(browser, { pantalla: c.pantalla, nativo: c.nativo });
    await P.pintar(page, 'A', { web: c.v === 'web' });
    await P.hoja(page, c.v, { hecho: c.hecho });
    await foto(page, c.nombre);
    medidas[c.nombre] = await page.evaluate(() => {
      const m = document.querySelector('[data-maqueta-hoja] [role="dialog"], [data-maqueta-hoja] [data-pace-modal]') || document.querySelector('[data-pace-cal]');
      const r = m.getBoundingClientRect();
      const caja = m.closest('[data-pace-modal-scroll]') || m.parentElement;
      return { alto: Math.round(r.height), scroll: caja ? Math.round(caja.scrollHeight - caja.clientHeight) : null };
    });
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const srv = spawn(process.execPath, [path.join(RAIZ, '.claude', 'static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch();
  const solo = (process.argv[2] || 'tarjeta,grande,hojas').split(',');
  try {
    if (solo.includes('tarjeta')) { console.log('la tarjeta'); await tarjeta(browser); }
    if (solo.includes('grande')) { console.log('letra al 115 % e inglés'); await grande(browser); }
    if (solo.includes('hojas')) { console.log('la hoja sin día'); await hojas(browser); }
  } finally {
    await browser.close();
    srv.kill();
    const archivo = path.join(__dirname, 'medidas.json');
    let antes = {};
    try { antes = JSON.parse(fs.readFileSync(archivo, 'utf8')); } catch (e) {}
    fs.writeFileSync(archivo, JSON.stringify(Object.assign(antes, medidas), null, 1) + '\n');
  }
})();
