/* PACE · las medidas y las fotos de la página «Textos largos» (17 nov. 2026)
 * ========================================================================
 * Uso (con el servidor de las pruebas en otro puerto que el 8765):
 *   PORT=8905 node .claude/static-server.js
 *   node docs/proposals/textos-largos-17nov/genera.js [puerto]
 * Recorre las mismas pantallas que tests/textos-largos.spec.js, con los textos largos, en inglés y en
 * castellano, a 360×640, 360×740 y 1280×800, y deja `medidas.json` con todo lo medido. Después saca
 * las fotos de `fotos/`: lo hallado, el arreglo montado y las dos opciones de lo que pide letra
 * (las opciones se pintan con CSS o tocando el DOM en la foto: no están en la app).
 */
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..', '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules/@playwright/test'));
const { instalarTextosLargos } = require(path.join(ROOT, 'tests/textos-largos.pseudo.js'));
const { medirTextos } = require(path.join(ROOT, 'tests/textos-largos.medir.js'));
const { ESCENAS, hora } = require(path.join(ROOT, 'tests/textos-largos.escenas.js'));
const { SEMILLA } = require(path.join(ROOT, 'tests/helpers.js'));

const PUERTO = Number(process.argv[2] || 8905);
const ORIGEN = 'http://localhost:' + PUERTO;
const FOTOS = path.join(__dirname, 'fotos');
const TAMANOS = [[360, 640], [360, 740], [1280, 800]];

async function abrir(b, modo, w, h, e) {
  const lang = modo === 'es' ? 'es' : 'en';
  const movil = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, locale: lang === 'es' ? 'es-ES' : 'en-GB', timezoneId: 'Europe/Madrid',
    isMobile: movil, hasTouch: movil, serviceWorkers: 'block', deviceScaleFactor: 2,
    storageState: { cookies: [], origins: [{ origin: ORIGEN, localStorage: [{ name: 'pace-cara', value: 'app' }] }] } });
  if (modo === 'largos') await instalarTextosLargos(ctx);
  await ctx.addInitScript((s) => { if (!localStorage.getItem('pace.state.v2')) localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({}, SEMILLA, { lang, sidebarCollapsed: true }, e.semilla));
  if (e.antes) await e.antes(ctx);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  await page.clock.install({ time: hora(e.hora) });
  await page.goto(ORIGEN + '/index.html');
  if (!e.sinHome) await page.locator('[data-pace-dial-number]').waitFor();
  await page.waitForTimeout(1200);
  return { ctx, page };
}

/* Una foto de un momento de una escena; `antes` recibe la página justo antes de la foto. Lo que
   se mide en ese momento (con la opción puesta) queda en `fotos.json`. */
const porFoto = {};
async function foto(b, nombre, modo, w, h, id, momento, antes) {
  const e = ESCENAS.find((x) => x.id === id);
  const { ctx, page } = await abrir(b, modo, w, h, e);
  let hecha = false;
  await e.llegar(page, async (m, raiz, sinScroll) => {
    if (hecha || m !== momento) return;
    if (antes) { await page.evaluate(antes); await page.waitForTimeout(400); }
    porFoto[nombre] = await page.evaluate(medirTextos, { raiz, sinScroll, pseudo: modo === 'largos' });
    await page.screenshot({ path: path.join(FOTOS, nombre + '.png') });
    hecha = true;
  });
  await ctx.close();
  if (!hecha) throw new Error('sin foto: ' + nombre);
  process.stderr.write('foto ' + nombre + '\n');
}

(async () => {
  fs.mkdirSync(FOTOS, { recursive: true });
  const b = await chromium.launch();
  const todo = [];
  for (const modo of ['largos', 'en', 'es']) {
    for (const [w, h] of TAMANOS) {
      for (const e of ESCENAS) {
        const { ctx, page } = await abrir(b, modo, w, h, e);
        try {
          await e.llegar(page, async (momento, raiz, sinScroll) => {
            const f = await page.evaluate(medirTextos, { raiz, sinScroll, pseudo: modo === 'largos' });
            todo.push({ modo, tam: w + '×' + h, escena: e.id, nombre: e.nombre, momento, fallos: f });
          });
        } catch (x) { todo.push({ modo, tam: w + '×' + h, escena: e.id, nombre: e.nombre, momento: 'no se llegó', fallos: [{ tipo: 'no se llegó', texto: x.message.split('\n')[0], px: 0 }] }); }
        await ctx.close();
      }
      process.stderr.write(modo + ' ' + w + '×' + h + '\n');
    }
  }
  fs.writeFileSync(path.join(__dirname, 'medidas.json'), JSON.stringify(todo, null, 1));

  /* Cómo se ven los textos largos. */
  await foto(b, 'largos-home-360', 'largos', 360, 740, 'home-jornada', 'la home');
  /* Lo montado: las pestañas de Estadísticas, antes (sin poder encoger) y con el arreglo. */
  const sinEncoger = () => { const s = document.createElement('style'); s.textContent = '[data-pace-stats-tabs],[data-pace-stats-tab]{min-width:auto!important}'; document.head.appendChild(s); };
  await foto(b, 'stats-largos-antes', 'largos', 360, 640, 'estadisticas', 'pestaña today', sinEncoger);
  await foto(b, 'stats-largos-despues', 'largos', 360, 640, 'estadisticas', 'pestaña today');
  /* R1 · Ajustes a 360×640 con «Vibrar» y las notificaciones bloqueadas, y sus dos opciones. */
  await foto(b, 'ajustes-hoy', 'es', 360, 640, 'ajustes', 'ajustes');
  /* A: la nota de «bloqueadas» pasa a la línea pequeña de «Aviso al terminar», sin línea propia. */
  await foto(b, 'ajustes-a', 'es', 360, 640, 'ajustes', 'ajustes', () => {
    const fila = document.querySelector('[data-pace-aj-fila="notify"]');
    const nota = [...document.querySelectorAll('[data-pace-tweaks-panel] .pace-aj-nota')].find((e) => /bloqueadas/.test(e.textContent));
    const sub = fila && [...fila.querySelectorAll('*')].reverse().find((e) => /pestaña está detrás/.test(e.textContent));
    if (nota) nota.style.display = 'none';
    if (sub) sub.innerHTML = '<span style="color:#A85E43">Bloqueado en el navegador</span>';
    window.__opcion = 'A';
  });
  /* B: con la pantalla baja, cada fila 3 px más junta. */
  await foto(b, 'ajustes-b', 'es', 360, 640, 'ajustes', 'ajustes', () => {
    const s = document.createElement('style');
    s.textContent = '@media (max-height: 660px){[data-pace-tweaks-panel] .pace-aj-fila{min-height:31px!important;padding:1px 0!important}}';
    document.head.appendChild(s);
  });
  /* R2 · las otras tres puertas de la pausa, en castellano a 360, y sus dos opciones. */
  await foto(b, 'pausa-hoy', 'es', 360, 640, 'pausa', 'por libre');
  await foto(b, 'pausa-a', 'es', 360, 640, 'pausa', 'por libre', () => {
    const s = document.createElement('style'); s.textContent = '@media (max-width: 400px){.pace-break-otras{column-gap:10px!important}}'; document.head.appendChild(s);
  });
  await foto(b, 'pausa-b', 'es', 360, 640, 'pausa', 'por libre', () => {
    const s = document.createElement('style'); s.textContent = '.pace-break-otras{flex-wrap:wrap!important}'; document.head.appendChild(s);
  });
  await foto(b, 'pausa-largos', 'largos', 360, 640, 'pausa', 'por libre');
  /* Lo que solo pasa con los textos largos. */
  await foto(b, 'pregunta-largos', 'largos', 360, 640, 'tarjeta-dia', 'la pregunta del día');
  await foto(b, 'ajustes-largos', 'largos', 360, 640, 'ajustes', 'ajustes');
  fs.writeFileSync(path.join(__dirname, 'fotos.json'), JSON.stringify(porFoto, null, 1));
  await b.close();
})();
