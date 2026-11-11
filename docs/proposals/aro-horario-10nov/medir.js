/* El aro de la home en los tres estados que Ez comparó (10 nov. 2026), medido sobre la app de verdad.
   Uso: PUERTO=8970 node docs/proposals/aro-horario-10nov/medir.js [salida.json]
   Sirve el index.html compilado (.claude/static-server.js), sin service worker. Estados:
     3 · con actividades: sin contestar, Respira/Estira/Mueve/Hidrátate y la tarjeta corta.
     1 · horario abierto: «Ajustar el horario» abre «¿Cuánto trabajas hoy?» entero.
     2 · rutina elegida: «Una hora» elegida, sin empezar.
     2b · día en marcha: lo mismo con «Empezar jornada» pulsado.
   Y el salto: abrir el horario en la MISMA página, para ver si el aro cambia de tamaño.
   Con INYECTA=<archivo.js> mete código antes de arrancar la app (las variantes de la maqueta). */
'use strict';
const { chromium } = require('@playwright/test');
const fs = require('fs');

const PUERTO = Number(process.env.PUERTO || 8970);
const BASE = 'http://localhost:' + PUERTO;
const HOY = '2026-11-10';
const VENTANAS = (process.env.VENTANAS || '1920x860,1536x710').split(',').map((v) => v.split('x').map(Number));
const IDIOMAS = (process.env.IDIOMAS || 'es,en').split(',');

async function abrir(browser, w, h, lang, opts = {}) {
  const context = await browser.newContext({
    viewport: { width: w, height: h }, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid',
    colorScheme: 'light', serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: BASE, localStorage: [{ name: 'pace-cara', value: 'app' }] }] },
  });
  const estado = { firstSeen: 1, lang, langAuto: false, palette: 'crema', novedadesVistas: '*', sidebarCollapsed: false };
  await context.addInitScript(([e]) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(e)); }, [estado]);
  if (opts.inyecta) await context.addInitScript(typeof opts.inyecta === 'function' ? opts.inyecta(w, h, lang) : opts.inyecta);
  if (opts.html) await context.route('**/index.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: opts.html }));
  const page = await context.newPage();
  await page.clock.install({ time: new Date(HOY + 'T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(700);
  return { context, page };
}

const vis = (page, sel) => page.locator(sel).filter({ visible: true }).first();
/* En el móvil el cajón del menú puede quedar por encima: entonces se pulsa por debajo. */
const pulsa = async (page, sel) => { const b = vis(page, sel); try { await b.click({ timeout: 3000 }); } catch (e) { await b.dispatchEvent('click'); } };
async function aEstado(page, e) {
  if (e === '3') return;
  await pulsa(page, '[data-pace-ritmo-ajustar], [data-pace-ritmo-comienza]');
  await page.waitForTimeout(500);
  if (e === '1') return;
  await pulsa(page, '[data-pace-ritmo-estado="pregunta"] button:has-text("' + (await page.evaluate(() => (document.documentElement.lang || 'es').startsWith('en')) ? 'One hour' : 'Una hora') + '")');
  await page.waitForTimeout(600);
  if (e === '2') return;
  await pulsa(page, '[data-pace-cta]');
  await page.waitForTimeout(600);
}

function medir(page) {
  return page.evaluate(() => {
    const v = (s) => [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0);
    const dial = v('[data-pace-dial-fit]');
    const r = dial.getBoundingClientRect();
    const cs = getComputedStyle(document.documentElement);
    const px = (n) => parseFloat(cs.getPropertyValue(n)) || 0;
    const escala = (window.paceLienzo && window.paceLienzo.escala) || 1;
    const body = v('[data-pace-home-body]');
    const se = document.scrollingElement;
    /* Lo que hace de horizonte (Actividades o el panel de A tu ritmo) y la caja con borde que tapa el aro. */
    const barra = v('[data-pace-activitybar]');
    const caja = v('[data-pace-ritmo-panel] .pace-rt-panel') || v('[data-pace-activitybar-chip]') || v('[data-pace-ritmo-panel]');
    const spc = v('[data-pace-spc]');
    const ciclo = [...dial.querySelectorAll('span,div')].filter((n) => /\b(ciclo|cycle)\b/i.test(n.textContent || '') && n.children.length === 0 && n.getBoundingClientRect().height);
    const cta = v('[data-pace-cta]');
    const corte = px('--pace-dial-corte') * escala;
    const fondo = Math.max(...[barra, spc].filter(Boolean).map((e) => e.getBoundingClientRect().bottom), 0);
    const R = (x) => Math.round(x);
    return {
      aro: R(r.width), aroCss: px('--pace-timer-d'), escala,
      aroArriba: R(r.top), aroAbajo: R(r.bottom),
      /* Hasta dónde se pinta el trazo: el aro termina «corte» px por encima de su fondo. */
      trazoHasta: R(r.bottom - corte), corte: R(corte), solape: R(px('--pace-activities-overlap') * escala),
      cajaArriba: caja ? R(caja.getBoundingClientRect().top) : null,
      /* Cuánto del aro queda a la vista, en % del diámetro: lo que Ez ve como «cortado». */
      aroVisible: caja ? Math.round(100 * (Math.min(caja.getBoundingClientRect().top, r.bottom - corte) - r.top) / r.width) : null,
      cicloAbajo: ciclo.length ? R(Math.max(...ciclo.map((n) => n.getBoundingClientRect().bottom))) : null,
      ctaAbajo: cta ? R(cta.getBoundingClientRect().bottom) : null,
      cajaAlto: caja ? R(caja.getBoundingClientRect().height) : null,
      fondo: R(fondo), ventana: innerHeight,
      scroll: Math.max(se.scrollHeight - se.clientHeight, body ? body.scrollHeight - body.clientHeight : 0),
    };
  });
}

async function medirTodo(browser, opts = {}) {
  const filas = [];
  for (const [w, h] of (opts.ventanas || VENTANAS)) for (const lang of (opts.idiomas || IDIOMAS)) {
    for (const e of (opts.estados || ['3', '1', '2', '2b'])) {
      const { context, page } = await abrir(browser, w, h, lang, opts);
      await aEstado(page, e);
      await page.mouse.move(1, 1); await page.waitForTimeout(250);   /* sin nada resaltado bajo el ratón */
      filas.push(Object.assign({ w, h, lang, estado: e }, await medir(page)));
      if (opts.foto) await opts.foto(page, w, h, lang, e);
      await context.close();
    }
    if (opts.sinSalto) continue;
    /* El salto: con actividades y, en la MISMA página, al abrir el horario. */
    const { context, page } = await abrir(browser, w, h, lang, opts);
    const salto = [(await medir(page)).aro];
    await pulsa(page, '[data-pace-ritmo-ajustar], [data-pace-ritmo-comienza]'); await page.waitForTimeout(600);
    salto.push((await medir(page)).aro);
    filas.push({ w, h, lang, estado: 'salto 3→1', salto });
    await context.close();
  }
  return filas;
}

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch();
    const filas = await medirTodo(browser);
    await browser.close();
    const salida = process.argv[2] || __dirname + '/medidas-hoy.json';
    fs.writeFileSync(salida, JSON.stringify(filas, null, 1));
    for (const f of filas) console.log(JSON.stringify(f));
  })().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { abrir, aEstado, medir, medirTodo, vis, pulsa };
