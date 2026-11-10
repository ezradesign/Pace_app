/* Las tres opciones del aro, pintadas sobre la app de verdad y medidas.
   Uso: PUERTO=8961 HOY_HTML=<copia del index.html de main> node docs/proposals/aro-fijo-10nov/pintar.js
   · C, como hoy: se sirve la copia del index.html de main (HOY_HTML).
   · A, fijo que solo encoge si no cabe: el index.html de esta rama, tal cual.
   · B, fijo siempre: el de esta rama con dos cambios metidos al servirlo (no toca app/): el aro
     arranca del tamaño fijo aunque el ancho no dé, y el bucle que lo encoge no corre. Lo que no
     cabe se resuelve con scroll de la home.
   Escribe las fotos en fotos/ y lo medido en opciones.json. */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PUERTO = Number(process.env.PUERTO || 8961);
const BASE = 'http://localhost:' + PUERTO;
const DIR = __dirname;
const HOY = '2026-11-10';
const SEMILLA = { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', ritmo: { libre: true }, novedadesVistas: '*', sidebarCollapsed: false };
const JORNADA = { fecha: HOY, opcion: 'jornada', desde: 540, cicloBase: 0, cambios: {} };
const VENTANAS = [[1280, 600], [1536, 710], [1920, 1080], [2560, 1440]];

function variante(nombre, html) {
  if (nombre === 'C') return fs.readFileSync(process.env.HOY_HTML, 'utf8');
  if (nombre === 'A') return html;
  let n = 0;
  const b = html
    .replace('var D = Math.min(widthCap * w, tope);', () => { n++; return 'var D = isDesktop ? tope : Math.min(widthCap * w, tope);'; })
    .replace('if (over <= 0 || D <= piso) { reintentos = 0; break; }', () => { n++; return 'if (isDesktop || over <= 0 || D <= piso) { reintentos = 0; break; }'; });
  if (n !== 2) throw new Error('B: no encuentro las dos líneas del motor en index.html (' + n + ')');
  return b;
}

async function abrir(browser, html, w, h, dia) {
  const context = await browser.newContext({
    viewport: { width: w, height: h }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light',
    serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  const estado = Object.assign({}, SEMILLA, dia ? { ritmo: { dia: JORNADA } } : {});
  await context.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [estado]);
  await context.route('**/index.html', (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html }));
  const page = await context.newPage();
  if (dia) await page.clock.install({ time: new Date(HOY + 'T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  if (dia) {
    const b = page.getByRole('button', { name: 'Empezar jornada', exact: true }).filter({ visible: true }).first();
    try { await b.click({ timeout: 3000 }); } catch (e) { await b.dispatchEvent('click'); }
  }
  await page.waitForTimeout(900);
  return { context, page };
}

/* Lo que se tapa o se sale: scroll, el fondo del panel de abajo, el aro bajo la barra de arriba y
   el botón del aro contra las tarjetas de debajo. */
const medir = (page) => page.evaluate(() => {
  const vis = (s) => [...document.querySelectorAll(s)].find((e) => e.getBoundingClientRect().width > 0);
  const dial = vis('[data-pace-dial-fit]').getBoundingClientRect();
  const body = vis('[data-pace-home-body]');
  const cta = vis('[data-pace-cta]');
  const top = vis('[data-pace-topbar]');
  const act = vis('[data-pace-activitybar]');
  const chip = vis('[data-pace-activitybar-chip], [data-pace-ritmo-panel]');
  const se = document.scrollingElement;
  const antes = body.scrollTop; body.scrollTop = 99999; const scrollHome = body.scrollTop; body.scrollTop = antes;
  const r = (e) => (e ? e.getBoundingClientRect() : null);
  const fondo = Math.max(...[act, vis('[data-pace-spc]')].filter(Boolean).map((e) => r(e).bottom));
  return {
    d: Math.round(dial.width), escala: (window.paceLienzo && window.paceLienzo.escala) || 1,
    scrollPagina: se.scrollHeight - se.clientHeight, scrollHome,
    fueraAbajo: Math.max(0, Math.round(fondo - innerHeight)),
    aroBajoBarra: top ? Math.max(0, Math.round(r(top).bottom - dial.top)) : 0,
    botonTapado: cta && chip ? Math.max(0, Math.round(r(cta).bottom - r(chip).top)) : 0,
  };
});

(async () => {
  const html = await (await fetch(BASE + '/index.html')).text();
  const browser = await chromium.launch();
  const fotos = path.join(DIR, 'fotos');
  fs.mkdirSync(fotos, { recursive: true });
  const filas = [];
  for (const v of (process.env.OPCIONES || 'C,A,B').split(',')) {
    const doc = variante(v, html);
    for (const [w, h] of VENTANAS) {
      for (const dia of [false, true]) {
        const { context, page } = await abrir(browser, doc, w, h, dia);
        const m = await medir(page);
        filas.push(Object.assign({ opcion: v, w, h, dia }, m));
        if (!dia) await page.screenshot({ path: path.join(fotos, v + '-' + w + 'x' + h + '.jpg'), type: 'jpeg', quality: 72 });
        await context.close();
      }
    }
    console.error(v, 'hecha');
  }
  await browser.close();
  fs.writeFileSync(path.join(DIR, 'opciones.json'), JSON.stringify(filas, null, 1));
  for (const f of filas) console.log(f.opcion, f.w + 'x' + f.h, f.dia ? 'día ' : 'libre', 'aro', f.d, 'esc', f.escala, 'scroll', f.scrollPagina, f.scrollHome, 'fuera', f.fueraAbajo, 'barra', f.aroBajoBarra, 'botón', f.botonTapado);
})().catch((e) => { console.error(e); process.exit(1); });
