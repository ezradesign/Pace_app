/* PACE · las fotos de «Cuatro maquetas hasta v1» (16 nov. 2026)
   =============================================================
   Abre el `index.html` compilado con Playwright, a 360 × 640 y 360 × 740 y en español, llega a cada
   pantalla como lo haría una persona (el constructor de «Tus rutinas», la home al día siguiente de
   acabar la semana de prueba, «Tus datos» en Ajustes durante esa semana, la home con la jornada
   elegida) y pinta cada opción SOBRE EL DOM DE VERDAD: estilos encima de los botones que ya existen,
   o filas, glifos y avisos clonados de los de la app, así que heredan su letra, su color y su sitio.
   Nada de esto toca `app/`: es solo maqueta. Lo que v1 cambia se fuerza como en las pruebas
   (`PREMIUM_ABIERTO_HASTA_V1` en false y `pasoV1` sembrado), sin tocar el código.

   De paso mide lo que Ez pide: si la pantalla pide scroll, si algún botón pisa a otro, el tamaño
   de cada botón y, en la home y en Ajustes, lo mismo con la letra al 115 % (cada tamaño de letra
   × 1,15, como tests/home-sin-scroll.spec.js). Lo medido va a `medidas.json`, que la página cita.

   Uso, desde la raíz del repo y con `index.html` recién compilado (node build-standalone.js):
     node docs/proposals/maquetas-4-16nov/genera.js            (todo)
     node docs/proposals/maquetas-4-16nov/genera.js 1,3        (solo esas escenas)
   Sirve en el puerto 8865 (nunca el 8765 de la suite). */
'use strict';

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const { chromium } = require(path.join(RAIZ, 'node_modules', 'playwright'));
const P = require('./genera.piezas');

const AQUI = __dirname;
const FOTOS = path.join(AQUI, 'fotos');
const PUERTO = Number(process.env.PACE_FOTOS_PORT || 8865);
const BASE = 'http://localhost:' + PUERTO;
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', novedadesVistas: '*', soundOn: false, sidebarCollapsed: true, ritmo: { libre: true } };
const HORARIO = { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 };
const SEMANA = ['jornada', 'jornada', 'jornada', 'jornada', 'jornada', 'libre', 'libre'];
const DIA = 86400000;
const JUEVES = new Date('2026-11-19T10:00:00+01:00').getTime();
/* Quien ya usaba PACE antes de v1, con dos de pago hechas («Rondas completas» y «Colgarse»). */
const USABA = {
  history: { days: { '2026-10-20': { focusMinutes: 50, breathMinutes: 5, moveMinutes: 6, waterGlasses: 4, holdSeconds: 0 } }, months: {}, years: {} },
  routineCounts: { 'rutina.extra.hang.bar': 2, 'rutina.breathe.rounds.full': 1 }, moveSessionsTotal: 2, totalFocusMin: 300,
};
const SUYAS = ['breathe.rounds.full', 'extra.hang.bar'];
const medidas = {};

async function abrir(browser, { estado, hora, alto, v1 }) {
  const context = await browser.newContext({
    viewport: { width: 360, height: alto || 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  if (v1) {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'PREMIUM_ABIERTO_HASTA_V1', { configurable: true, get: () => false, set: () => {} });
    });
  }
  await context.addInitScript(([e]) => {
    if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e));
  }, [Object.assign({}, SEMILLA, estado || {})]);
  await context.clock.install({ time: hora || JUEVES });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  /* La tienda de la web abierta, como el día que se encienda la venta (tests/ajustes-comprar.spec.js). */
  await page.evaluate(() => { if (window.PACE_TIENDA_WEB) window.PACE_TIENDA_WEB.enlaces = { vida: '/index.html#tienda-vida', mes: null }; });
  return { context, page };
}

async function foto(page, nombre) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(FOTOS, nombre + '.jpg'), type: 'jpeg', quality: 84 });
  console.log('  foto', nombre);
}

/* ---------- 1 · Los botones del constructor ---------- */

async function hastaElConstructor(page) {
  await page.getByRole('button', { name: /Abrir panel/ }).filter({ visible: true }).first().click();
  await page.locator('aside[data-pace-sidebar]').getByRole('button', { name: /^Tus rutinas/ }).filter({ visible: true }).first().click();
  await page.getByRole('heading', { name: 'Nueva rutina' }).waitFor();
  for (let k = 0; k < 4; k++) {
    await page.getByRole('button', { name: /Añadir ejercicio/ }).filter({ visible: true }).first().click();
    const filas = page.locator('[data-pace-modal-backdrop]').last().getByRole('button').filter({ hasText: /\d+\s*s$/ });
    await filas.nth(k * 3 + 1).click();
    const volver = page.getByRole('button', { name: /Volver/ }).filter({ visible: true });
    if (await volver.count()) await volver.first().click();
  }
  await page.getByPlaceholder('Mi rutina').fill('Pausa de la tarde');
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.waitForTimeout(400);
  await P.marcarConstructor(page);
}

async function escena1(browser) {
  console.log('1 · el constructor');
  medidas['1'] = {};
  for (const h of [640, 740]) {
    const { context, page } = await abrir(browser, { alto: h });
    await hastaElConstructor(page);
    for (const op of ['hoy', 'A', 'B', 'C']) {
      await P.pintarConstructor(page, op);
      await page.waitForTimeout(250);
      medidas['1'][op + '-' + h] = await P.medirConstructor(page);
      await P.verPasos(page);
      await foto(page, '1-' + op.toLowerCase() + '-' + h);
    }
    await context.close();
  }
}

/* ---------- 2 · La nota al acabar la semana de prueba ---------- */

/* Su semana acabó ayer (miércoles 25), y hoy es jueves 26: lo de pago ya lleva candado. */
const JUEVES26 = new Date('2026-11-26T10:00:00+01:00').getTime();
const ACABADA = Object.assign({}, USABA, {
  pasoV1: { at: JUEVES26 - 8 * DIA, previo: true, hasta: JUEVES26 - DIA, rutinas: SUYAS, avisado: true },
});

async function escena2(browser) {
  console.log('2 · la nota al acabar la semana');
  medidas['2'] = {};
  /* Hoy: nada lo dice; los candados salen al abrir una biblioteca. */
  let r = await abrir(browser, { estado: ACABADA, hora: JUEVES26, v1: true });
  await foto(r.page, '2-hoy-home-640');
  await r.page.locator('[data-pace-activitybar-chip]', { hasText: 'Estira' }).filter({ visible: true }).first().click();
  await r.page.waitForTimeout(900);
  await P.bajarHastaCandado(r.page);
  await foto(r.page, '2-hoy-candados-640');
  await r.context.close();

  /* A · en el sobre de arriba: una fuente más, como la línea de los lunes. */
  for (const h of [640, 740]) {
    r = await abrir(browser, { estado: ACABADA, hora: JUEVES26, v1: true, alto: h });
    await P.apuntarEnElSobre(r.page);
    medidas['2']['A-icono-' + h] = await P.pisados(r.page, '[data-pace-topbar] button, button[aria-label="Abrir panel"]');
    await foto(r.page, '2a-icono-' + h);
    await r.page.locator('[data-pace-sobre]').filter({ visible: true }).first().click();
    await r.page.waitForTimeout(700);
    medidas['2']['A-hoja-' + h] = await P.ocultoDe(r.page, '[data-pace-sobre-hoja]');
    await foto(r.page, '2a-hoja-' + h);
    await r.context.close();
  }

  /* B · una hoja, una vez, al abrir: la del día de v1, con lo que dice al acabar. Se abre por su
     camino de verdad (una semana sin avisar) y se le cambia el texto. */
  for (const h of [640, 740]) {
    const sinAvisar = Object.assign({}, ACABADA, { pasoV1: Object.assign({}, ACABADA.pasoV1, { hasta: JUEVES26 + 3 * DIA, at: JUEVES26 - 4 * DIA, avisado: false }) });
    r = await abrir(browser, { estado: sinAvisar, hora: JUEVES26, v1: true, alto: h });
    await r.page.clock.runFor(2500);
    await r.page.locator('[data-pace-premium-hoja="pasov1"]').waitFor();
    await r.page.waitForTimeout(400);
    await P.hojaDelFinal(r.page);
    medidas['2']['B-' + h] = Object.assign(await P.ocultoDe(r.page, '[data-pace-premium-hoja="pasov1"]'), await P.pisados(r.page, '[data-pace-premium-hoja] button, [data-pace-premium-hoja] a'));
    await foto(r.page, '2b-hoja-' + h);
    await r.context.close();
  }

  /* C · una línea en la biblioteca, la primera vez que abres una con candados. */
  for (const h of [640, 740]) {
    r = await abrir(browser, { estado: ACABADA, hora: JUEVES26, v1: true, alto: h });
    await r.page.locator('[data-pace-activitybar-chip]', { hasText: 'Estira' }).filter({ visible: true }).first().click();
    await r.page.waitForTimeout(900);
    medidas['2']['C-antes-' + h] = await P.alturaCabeceraLib(r.page);
    await P.lineaEnLaBiblioteca(r.page);
    medidas['2']['C-' + h] = await P.alturaCabeceraLib(r.page);
    await foto(r.page, '2c-biblioteca-' + h);
    await r.context.close();
  }
}

/* ---------- 3 · «Tenerlo para siempre» en Ajustes durante la semana ---------- */

const EN_PRUEBA = Object.assign({}, USABA, {
  pasoV1: { at: JUEVES - 2 * DIA, previo: true, hasta: JUEVES + 5 * DIA, rutinas: SUYAS, avisado: true },
});

async function hastaTusDatos(page) {
  await page.getByRole('button', { name: 'Abrir ajustes' }).click();
  await page.locator('[data-pace-tweaks-panel]').waitFor();
  await page.waitForTimeout(500);
  const plegada = page.locator('[data-pace-tweaks-panel] [data-pace-aj-plegada] .pace-aj-sec-accion');
  if (await plegada.isVisible()) {
    await plegada.click();
    await page.locator('[data-pace-tweaks-panel][data-pace-aj-vista="datos"]').waitFor();
  }
  await page.waitForTimeout(500);
}

async function escena3(browser) {
  console.log('3 · Ajustes en la semana de prueba');
  medidas['3'] = {};
  for (const h of [640, 740]) {
    for (const op of ['hoy', 'A', 'B', 'C']) {
      const { context, page } = await abrir(browser, { estado: EN_PRUEBA, v1: true, alto: h });
      await hastaTusDatos(page);
      await P.pintarDatos(page, op);
      await page.waitForTimeout(300);
      const normal = await P.ocultoDe(page, '[data-pace-tweaks-panel]');
      await foto(page, '3-' + op.toLowerCase() + '-' + h);
      await P.letraGrande(page, '[data-pace-tweaks-panel]', true);
      await page.waitForTimeout(500);
      const grande = await P.ocultoDe(page, '[data-pace-tweaks-panel]');
      if (h === 640 && op !== 'hoy') await foto(page, '3-' + op.toLowerCase() + '-640-115');
      medidas['3'][op + '-' + h] = { normal, grande, filas: await P.filasDatos(page) };
      await context.close();
    }
  }
}

/* ---------- 4 · Las bibliotecas a mano con la jornada elegida ---------- */

const CON_DIA = { ritmo: { horario: HORARIO, semanaTipo: SEMANA, dia: { fecha: '2026-11-19', opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} } } };

async function escena4(browser) {
  console.log('4 · las bibliotecas en el móvil');
  medidas['4'] = {};
  for (const h of [640, 740]) {
    for (const op of ['hoy', 'A', 'B', 'C']) {
      const { context, page } = await abrir(browser, { estado: CON_DIA, alto: h });
      if (op !== 'hoy') await P.filaDelCajon(page);
      if (op === 'C') {
        await page.getByRole('button', { name: 'Ver todo' }).filter({ visible: true }).first().click();
        await page.waitForTimeout(800);
      }
      await P.pintarBibliotecas(page, op);
      await page.waitForTimeout(900);
      const m = { home: await P.medirHome(page), toques: await P.pisados(page, '[data-pace-topbar] button, button[aria-label="Abrir panel"], [data-maqueta] button, [data-pace-ritmo-panel] button, [role="dialog"] button', op === 'C' ? '[data-maqueta]' : '[data-maqueta], [data-pace-topbar]') };
      await foto(page, '4-' + op.toLowerCase() + '-' + h);
      if (op === 'A') {
        /* El caso más lleno de la barra: con algo en el sobre, ocho iconos. */
        await P.apuntarEnElSobre(page);
        m.conSobre = await P.pisados(page, '[data-pace-topbar] button, button[aria-label="Abrir panel"]', '[data-maqueta], [data-pace-topbar]');
        if (h === 640) await foto(page, '4-a-sobre-640');
      }
      if (op !== 'C') {
        await P.letraGrande(page, '#root', true);
        await page.waitForTimeout(900);
        m.grande = await P.medirHome(page);
        if (h === 640 && op !== 'hoy') await foto(page, '4-' + op.toLowerCase() + '-640-115');
      }
      medidas['4'][op + '-' + h] = m;
      await context.close();
    }
  }
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const srv = spawn(process.execPath, [path.join(RAIZ, '.claude', 'static-server.js')], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const solo = process.argv[2];
  try {
    const escenas = { 1: escena1, 2: escena2, 3: escena3, 4: escena4 };
    for (const [k, f] of Object.entries(escenas)) {
      if (solo && solo.split(',').indexOf(k) === -1) continue;
      await f(browser);
    }
  } finally {
    await browser.close();
    srv.kill();
    const previo = fs.existsSync(path.join(AQUI, 'medidas.json')) ? JSON.parse(fs.readFileSync(path.join(AQUI, 'medidas.json'), 'utf8')) : {};
    fs.writeFileSync(path.join(AQUI, 'medidas.json'), JSON.stringify(Object.assign(previo, medidas), null, 1));
  }
})().catch((e) => { console.error(e); process.exit(1); });
