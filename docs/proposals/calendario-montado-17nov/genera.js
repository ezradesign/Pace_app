/* PACE · las fotos de «El calendario a la vista, montado» (17 nov. 2026)
   ====================================================================
   Lo que Ez eligió el 16 nov. («Al calendario todo A»), ya montado: abre el `index.html`
   compilado a las 10:00 de un lunes con una reunión de 12:00 a 13:00, en el ordenador
   (1280 × 800 y 1536 × 710) y en el móvil (360 × 640 y 360 × 740), y fotografía la tarjeta con
   el enlace, la hoja sin día en la web de hoy, con las altas, en Android y en el iPhone, lo que
   dice al conectar y la tarjeta ya conectada. Nada pintado: es la app. Android y el iPhone se
   fingen como en las pruebas (`window.Capacitor`); el iPhone de verdad se mira en TestFlight.

   Uso, desde la raíz del repo y con `index.html` recién compilado (node build-standalone.js):
     node docs/proposals/calendario-montado-17nov/genera.js
   Sirve en el puerto 8895 (nunca el 8765 de la suite). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));

const FOTOS = path.join(__dirname, 'fotos');
const PUERTO = Number(process.env.PACE_FOTOS_PORT || 8895);
const BASE = 'http://localhost:' + PUERTO;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*', soundOn: false, sidebarCollapsed: true, ritmo: { libre: true } };
const DIEZ = new Date('2026-11-16T10:00:05+01:00').getTime();
const PANTALLAS = { 1280: { w: 1280, h: 800 }, 1536: { w: 1536, h: 710 }, 640: { w: 360, h: 640, m: true }, 740: { w: 360, h: 740, m: true } };
const medidas = {};

/* Android o el iPhone con el calendario sin permiso y una reunión de 12:00 a 13:00. */
function comoNativo(plataforma) {
  const ms = (h) => new Date('2026-11-16T' + h + ':00+01:00').getTime();
  const nativo = window.__nativo = { eventos: [{ id: '7', title: 'Reunión', startDate: ms('12:00'), endDate: ms('13:00'), isAllDay: false, availability: 0, status: 'confirmed' }], permiso: 'prompt', n: 100 };
  const ok = (v) => () => Promise.resolve(typeof v === 'function' ? v() : v);
  window.Capacitor = {
    getPlatform: () => plataforma, isNativePlatform: () => true,
    Plugins: {
      App: { addListener: () => ({ remove() {} }), minimizeApp: ok() },
      LocalNotifications: { checkPermissions: ok({ display: 'granted' }), addListener: () => ({ remove() {} }) },
      Filesystem: { writeFile: ok({ uri: 'file://x' }) },
      Share: { share: ok() },
      CapacitorCalendar: {
        requestFullCalendarAccess: () => { nativo.permiso = 'granted'; return Promise.resolve({ result: 'granted' }); },
        checkAllPermissions: () => Promise.resolve({ result: { readCalendar: nativo.permiso, writeCalendar: nativo.permiso } }),
        listCalendars: ok({ result: [] }), getDefaultCalendar: ok({ result: null }),
        listEventsInRange: (op) => Promise.resolve({ result: nativo.eventos.filter((e) => e.startDate < op.to && e.endDate > op.from) }),
        createEvent: (op) => { const id = String(nativo.n++); nativo.eventos.push(Object.assign({ id }, op)); return Promise.resolve({ id }); },
        modifyEvent: ok(), deleteEvent: ok(),
      },
      PaceCalendario: { instalado: ok({ instalado: 1763280000000 }), privado: ok({ privado: false }) },
    },
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
  await context.clock.install({ time: DIEZ });
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
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('  foto', nombre);
}

/* Scroll de la home y si el enlace pisa algo o se sale de la tarjeta. */
async function medir(page) {
  return page.evaluate(() => {
    const vista = (e) => e && e.getBoundingClientRect().width > 0;
    const body = Array.from(document.querySelectorAll('[data-pace-home-body]')).find(vista);
    const tarjeta = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta]')).find(vista);
    const enlace = Array.from(document.querySelectorAll('[data-pace-ritmo-tarjeta-calendario]')).find(vista);
    const caja = Array.from(enlace.querySelectorAll('span, svg')).map((e) => e.getBoundingClientRect())
      .reduce((a, b) => ({ left: Math.min(a.left, b.left), right: Math.max(a.right, b.right), top: Math.min(a.top, b.top), bottom: Math.max(a.bottom, b.bottom) }));
    const corta = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
    const pisa = Array.from(tarjeta.querySelectorAll('button, [data-pace-ritmo-tarjeta-titulo], .pace-rt-esq-punto, .pace-rt-tm-nota, .pace-rt-tm-pildora'))
      .filter((e) => vista(e) && !enlace.contains(e) && !e.contains(enlace) && corta(caja, e.getBoundingClientRect())).length;
    const rt = tarjeta.getBoundingClientRect();
    return { scroll: Math.round(body.scrollHeight - body.clientHeight), aro: Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pace-timer-d'))),
      tarjeta: Math.round(rt.height), pisa, dentro: caja.left >= rt.left && caja.right <= rt.right && caja.top >= rt.top && caja.bottom <= rt.bottom };
  });
}

async function letraGrande(page) {
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-pace-home-body], [data-pace-home-body] *'));
    const tam = els.map((e) => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty('font-size', (tam[i] * 1.15) + 'px', 'important'));
    window.dispatchEvent(new Event('pace:home-relayout'));
  });
  await asentar(page);
}

async function tarjeta(browser) {
  for (const pantalla of [1280, 1536, 640, 740]) {
    const { context, page } = await abrir(browser, { pantalla });
    medidas['tarjeta-' + pantalla] = await medir(page);
    await foto(page, 'tarjeta-' + pantalla);
    await context.close();
  }
  for (const lang of ['es', 'en']) {
    const { context, page } = await abrir(browser, { pantalla: 640, lang });
    await letraGrande(page);
    medidas['tarjeta-640-' + lang + '-115'] = await medir(page);
    await foto(page, 'tarjeta-640-' + lang + '-115');
    await context.close();
  }
}

async function hojas(browser) {
  /* La web de hoy, sin las altas: solo el archivo. */
  let r = await abrir(browser, { pantalla: 1280 });
  await r.page.locator('[data-pace-ritmo-tarjeta-calendario]').filter({ visible: true }).click();
  await r.page.locator('[data-pace-cal-resumen]').waitFor();
  await foto(r.page, 'hoja-web-1280');
  const alElegir = r.page.locator('[data-pace-cal-destino="archivo"] button');
  if (await alElegir.count()) { await alElegir.click(); await r.page.waitForTimeout(300); await foto(r.page, 'hoja-web-al-elegir-1280'); }
  await r.context.close();

  /* La web con las altas de Google y Microsoft (los identificadores, de mentira). */
  r = await abrir(browser, { pantalla: 1280 });
  await r.page.evaluate(() => { CALENDARIO_IDS.google = 'foto'; CALENDARIO_IDS.microsoft = 'foto'; });
  await r.page.locator('[data-pace-ritmo-tarjeta-calendario]').filter({ visible: true }).click();
  await r.page.locator('[data-pace-cal-resumen]').waitFor();
  await foto(r.page, 'hoja-altas-1280');
  await r.context.close();

  /* Android y el iPhone: la hoja, «Conectar» y la tarjeta ya conectada. */
  for (const nativo of ['android', 'ios']) {
    r = await abrir(browser, { pantalla: 640, nativo });
    const enlace = r.page.locator('[data-pace-ritmo-tarjeta-calendario]').filter({ visible: true });
    await enlace.click();
    await r.page.locator('[data-pace-cal-resumen]').waitFor();
    await foto(r.page, 'hoja-' + nativo + '-640');
    const fila = r.page.locator('[data-pace-cal-destino="android"] button');
    if (await fila.count()) {
      await fila.click();
      await r.page.locator('[data-pace-cal-aviso="ok"]').waitFor();
      await foto(r.page, 'hoja-' + nativo + '-conectado-640');
      await r.page.getByRole('button', { name: 'Listo', exact: true }).click();
      await asentar(r.page);
      medidas['conectado-' + nativo + '-640'] = await medir(r.page);
      await foto(r.page, 'tarjeta-' + nativo + '-conectado-640');
    }
    await r.context.close();
  }
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const srv = spawn(process.execPath, [path.join(RAIZ, '.claude', 'static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 900));
  const browser = await chromium.launch();
  try {
    console.log('la tarjeta'); await tarjeta(browser);
    console.log('las hojas'); await hojas(browser);
  } finally {
    await browser.close();
    srv.kill();
    fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(medidas, null, 1) + '\n');
  }
})();
