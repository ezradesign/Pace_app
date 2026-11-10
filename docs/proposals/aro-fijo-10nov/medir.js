/* El aro de la home medido en una rejilla de ventanas de escritorio.
   Uso: PUERTO=8961 node docs/proposals/aro-fijo-10nov/medir.js [salida.json]
   Sirve el index.html compilado (.claude/static-server.js), sin service worker
   (serviceWorkers: 'block'), en español. Para cada ventana abre una página nueva
   (lo que ve quien abre la app en esa ventana) y, aparte, recorre la misma rejilla
   cambiando el tamaño de UNA sola página, para ver si el aro depende del camino. */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');

const PUERTO = Number(process.env.PUERTO || 8961);
const BASE = 'http://localhost:' + PUERTO;
const ANCHOS = (process.env.ANCHOS || '1024,1280,1366,1440,1536,1920,2560').split(',').map(Number);
const ALTOS = (process.env.ALTOS || '600,710,768,900,1080,1440').split(',').map(Number);
const HOY = '2026-11-10';
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*' };
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
/* Una página de la app puede llevar código de prueba inyectado (las variantes de la maqueta). */
const INYECTA = process.env.INYECTA ? fs.readFileSync(process.env.INYECTA, 'utf8') : '';

async function abrir(browser, w, h, sidebar, dia) {
  const context = await browser.newContext({
    viewport: { width: w, height: h }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  const estado = Object.assign({}, SEMILLA, { sidebarCollapsed: sidebar === 'cerrada' }, dia ? { ritmo: { dia: JORNADA } } : {});
  await context.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [estado]);
  if (INYECTA) await context.addInitScript(INYECTA);
  const page = await context.newPage();
  if (dia) await page.clock.install({ time: new Date(HOY + 'T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  if (dia) {
    const b = page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first();
    /* A veces otra pieza tapa el botón en una ventana estrecha: entonces se pulsa por debajo. */
    try { await b.click({ timeout: 3000 }); } catch (e) { console.error('click tapado', w, h, sidebar); await b.dispatchEvent('click'); }
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(600);
  return { context, page };
}

async function asentar(page, w, h) {
  await page.setViewportSize({ width: w, height: h });
  for (let i = 0; i < 100; i++) {
    const ok = await page.evaluate(([w, h]) => {
      if (innerWidth !== w || innerHeight !== h || !window.paceLienzo) return false;
      const s = Math.min(w / 1536, h / 704);
      const e = s > 1 ? Math.floor(s * 1000) / 1000 : 1;
      return window.paceLienzo.escala === e;
    }, [w, h]);
    if (ok) break;
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(400);
}

function medir(page) {
  return page.evaluate(() => {
    const dial = [...document.querySelectorAll('[data-pace-dial-fit]')].find(x => x.getBoundingClientRect().width > 0);
    const r = dial ? dial.getBoundingClientRect() : null;
    const body = document.querySelector('[data-pace-home-body]');
    const se = document.scrollingElement;
    const cs = getComputedStyle(document.documentElement);
    const sb = document.querySelector('[data-pace-sidebar]');
    const sbr = sb ? sb.getBoundingClientRect() : null;
    /* Lo que se sale o se tapa: el fondo del panel de abajo contra la ventana. */
    const act = document.querySelector('[data-pace-activitybar]');
    const spc = document.querySelector('[data-pace-spc]');
    const fondo = Math.max(...[act, spc].filter(Boolean).map(e => e.getBoundingClientRect().bottom), 0);
    return {
      d: r ? +r.width.toFixed(1) : null,
      dCss: parseFloat(cs.getPropertyValue('--pace-timer-d')) || null,
      escala: (window.paceLienzo && window.paceLienzo.escala) || 1,
      sq: parseFloat(cs.getPropertyValue('--pace-home-squeeze')) || 0,
      scrollPagina: se.scrollHeight - se.clientHeight,
      scrollHome: body ? body.scrollHeight - body.clientHeight : null,
      fondo: Math.round(fondo), ventana: innerHeight,
      aroArriba: r ? Math.round(r.top) : null,
      sidebarAncho: sbr ? Math.round(sbr.width) : 0,
    };
  });
}

(async () => {
  const salida = process.argv[2] || 'docs/proposals/aro-fijo-10nov/medidas-hoy.json';
  const browser = await chromium.launch();
  const filas = [];
  const casos = (process.env.CASOS || 'abierta:0,cerrada:0,abierta:1,cerrada:1').split(',');
  for (const caso of casos) {
    const [sidebar, d] = caso.split(':');
    const dia = d === '1';
    for (const w of ANCHOS) for (const h of ALTOS) {
      const { context, page } = await abrir(browser, w, h, sidebar, dia);
      filas.push(Object.assign({ modo: 'nueva', w, h, sidebar, dia }, await medir(page)));
      await context.close();
    }
    if (process.env.SIN_CAMINO) continue;
    /* La misma rejilla en UNA página, cambiando su tamaño: si el aro depende del camino, aquí sale distinto. */
    const { context, page } = await abrir(browser, 1536, 710, sidebar, dia);
    for (const w of ANCHOS) for (const h of ALTOS) {
      await asentar(page, w, h);
      filas.push(Object.assign({ modo: 'misma', w, h, sidebar, dia }, await medir(page)));
    }
    await context.close();
    console.error(caso, 'hecho');
    fs.writeFileSync(salida, JSON.stringify(filas, null, 1));
  }
  /* Arrastrando: 1536×710 → 1920×1080 → 1536×710, a saltos y paso a paso. */
  for (const dia of [false, true]) {
    const { context, page } = await abrir(browser, 1536, 710, 'abierta', dia);
    const arrastre = [];
    arrastre.push(Object.assign({ paso: 'inicio 1536x710' }, await medir(page)));
    await asentar(page, 1920, 1080);
    arrastre.push(Object.assign({ paso: 'salto a 1920x1080' }, await medir(page)));
    await asentar(page, 1536, 710);
    arrastre.push(Object.assign({ paso: 'vuelta a 1536x710' }, await medir(page)));
    /* Arrastre fino: 24 pasos de ida y 24 de vuelta, sin esperar a que se asiente. */
    for (let i = 1; i <= 24; i++) await page.setViewportSize({ width: Math.round(1536 + 384 * i / 24), height: Math.round(710 + 370 * i / 24) });
    await page.waitForTimeout(500);
    arrastre.push(Object.assign({ paso: 'arrastre a 1920x1080' }, await medir(page)));
    for (let i = 23; i >= 0; i--) await page.setViewportSize({ width: Math.round(1536 + 384 * i / 24), height: Math.round(710 + 370 * i / 24) });
    await page.waitForTimeout(500);
    arrastre.push(Object.assign({ paso: 'arrastre de vuelta a 1536x710' }, await medir(page)));
    /* Y a mitad de camino: cada píxel del arrastre, sin pausa, mira si el aro va por saltos. */
    const curva = [];
    for (let i = 0; i <= 24; i++) {
      await page.setViewportSize({ width: Math.round(1536 + 384 * i / 24), height: Math.round(710 + 370 * i / 24) });
      await page.waitForTimeout(120);
      curva.push(Object.assign({ w: Math.round(1536 + 384 * i / 24), h: Math.round(710 + 370 * i / 24) }, await medir(page)));
    }
    filas.push({ modo: 'arrastre', dia, arrastre, curva });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(salida, JSON.stringify(filas, null, 1));
  console.error('escrito', salida, filas.length);
})().catch(e => { console.error(e); process.exit(1); });
