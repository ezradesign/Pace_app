// Maqueta para Ez, tercera vuelta del runner (29 oct.): lo que contestó Ez a las cuatro preguntas.
//  1. «Auto» debajo de Anterior · Pausar · Empezar ya, en el móvil y en el ordenador.
//  2. En los móviles altos el círculo crece con lo que sobra, hasta un tope; con mucho aire, las letras un punto.
//  3. En el ordenador, menos aire entre piezas y el círculo mayor.
//  4. «Colócate sin prisa · pulsa «Empezar ya»».
// Se pinta sobre el index.html de la rama del runner servido con page.route: el CSS se añade y, como el tope del
// círculo vive en `useV1Glifo` (dentro de su bloque, no se alcanza desde fuera), se cambia en el texto servido.
// Uso: node maqueta-c.js <carpeta> [fotos|censo] [pantallas, p. ej. 360x740,1280x720 | todas]
'use strict';
const fs = require('fs');
const path = require('path');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const WT = R + '/.claude/worktrees/runner-claro-15db3c';
const { chromium } = require(R + '/node_modules/playwright');
const [OUT, MODO = 'fotos', LISTA = 'todas'] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8808';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };

const TOPE_HOY = 'const techo = Math.min(escritorio ? 250 : 210, Math.round(alto * 0.3));';
const TOPE = 'const techo = Math.min(escritorio ? 300 : 262, Math.round(alto * (escritorio ? 0.36 : 0.3)));';
const TEXTOS = [
  ["'Colócate sin prisa · empiezas con ›'", "'Colócate sin prisa · pulsa «Empezar ya»'"],
  ["'Get set, no rush · start with ›'", "'Get set, no rush · press Begin now'"],
];
const PROPUESTA = `
  /* Una sola fila de pastilla bajo su etiqueta, con su hueco siempre. */
  .pace-v1-numfila { flex-direction: column; gap: 6px; min-height: 46px; justify-content: flex-start; }
  .pace-v1-numgrupo:has(.pace-v1-numbasta) .pace-v1-numfila { min-height: 0; }
  .pace-v1-numgrupo:has(.pace-v1-numfila .pace-v1-mas) .pace-v1-numbasta { display: none; }
  /* El bloque, junto y centrado: el aire que sobra va arriba y abajo. */
  .pace-v1 { padding-top: 0 !important; justify-content: center; }
  .pace-v1-aire { flex: 0 0 0 !important; }
  .pace-v1-pasos { margin-top: 0 !important; }
  .pace-v1-siguiente { margin-top: 4px !important; }
  /* «Auto», debajo de las palabras de los botones: el mando le guarda su sitio abajo. */
  .pace-v1-mando.maq-con-auto { position: relative; padding-bottom: 56px !important; }
  .maq-auto { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); }
  @media (max-width: 640px) {
    .pace-v1-raiz { --v1-num: clamp(44px, 6.8vh, 50px); --v1-u: clamp(5px, 0.95vh, 12px); }
  }
  @media (max-width: 640px) and (min-height: 820px) {
    .pace-v1-raiz { --v1-nombre: 30px; --v1-cue: 18px; --v1-num: 54px; }
  }
  @media (min-width: 641px) {
    .pace-v1-raiz { --v1-u: clamp(5px, calc(0.7 * var(--pace-vh, 1vh)), 12px); --v1-num: clamp(46px, calc(6.8 * var(--pace-vh, 1vh)), 72px); }
    .pace-v1-pasos { margin-bottom: var(--v1-u) !important; }
  }
`;

async function servir(ctx, propuesta) {
  await ctx.route(BASE + '/**', async (route) => {
    const f = path.join(WT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return route.fulfill({ status: 404, body: '' });
    let body = fs.readFileSync(f);
    if (propuesta && f.endsWith('index.html')) {
      let s = body.toString('utf8');
      if (!s.includes(TOPE_HOY)) throw new Error('el tope del círculo ya no está como se esperaba');
      s = s.replace(TOPE_HOY, TOPE);
      for (const [a, b] of TEXTOS) { if (!s.includes(a)) throw new Error('no está el texto ' + a); s = s.split(a).join(b); }
      body = Buffer.from(s, 'utf8');
    }
    return route.fulfill({ body, contentType: MIME[path.extname(f)] || 'application/octet-stream' });
  });
}

let LANG = 'es';
async function abrir(browser, w, h, propuesta, id) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: LANG === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang: LANG, langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: w < 1000, cuerpoAuto: false });
  await servir(ctx, propuesta);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  if (propuesta) await page.evaluate((c) => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }, PROPUESTA);
  await page.getByRole('button', { name: /^(Mueve|Move)/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar|Start/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
  // «Auto», debajo del mando: se lleva el botón (el mismo, con su estado) a una fila tras las palabras.
  if (propuesta) await page.evaluate(() => {
    const auto = document.querySelector('[data-pace-v1-auto]'), mando = document.querySelector('[data-pace-v1-mando]');
    // En las pantallas bajas no cabe una fila más bajo las palabras: «Auto» se queda junto a «Siguiente».
    if (!auto || !mando || innerHeight < 700) return;
    mando.classList.add('maq-con-auto');
    const fila = document.createElement('div'); fila.className = 'maq-auto';
    mando.appendChild(fila); fila.appendChild(auto);
    window.dispatchEvent(new Event('resize'));
  });
  await page.clock.runFor(400);
  return { ctx, page };
}

async function revisar(page) {
  return page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
    const caja = (s) => { const e = [...document.querySelectorAll(s)].find(vis); return e ? e.getBoundingClientRect() : null; };
    const g = document.querySelector('.pace-v1-glifo');
    const piezas = [
      ['circulo', g && g.getBoundingClientRect()], ['nombre', caja('[data-pace-v1-name]')], ['instruccion', caja('[data-pace-v1-cue]')],
      ['numero', caja('[data-pace-v1-num]')], ['etiqueta', caja('[data-pace-v1-numlabel]')],
      ['pastilla', caja('[data-pace-v1-mas], [data-pace-v1-saltar], [data-pace-v1-basta]')], ['cola', caja('[data-pace-v1-cola] > div')],
      ['barra', caja('[data-pace-v1-progress] > div')], ['siguiente', caja('[data-pace-v1-siguiente]')], ['mando', caja('.pace-v1-mando')],
      ['auto', caja('[data-pace-v1-auto]')],
    ].filter((p) => p[1] && p[1].height > 0);
    const pisa = [];
    for (let i = 1; i < piezas.length; i++) {
      const a = piezas[i - 1], b = piezas[i];
      if (a[0] === 'etiqueta' && b[0] === 'pastilla' && Math.abs(a[1].top - b[1].top) < 12) continue;
      if (a[0] === 'siguiente' && b[0] === 'mando') continue;
      // «Auto» va dentro del mando, en el sitio que este le guarda abajo: lo mide la línea de las palabras.
      if (a[0] === 'mando' && b[0] === 'auto') continue;
      const hueco = Math.round(b[1].top - a[1].bottom);
      if (hueco < 2) pisa.push(a[0] + '→' + b[0] + ' ' + hueco);
    }
    // Las palabras de los botones cuelgan del mando: «Auto» no puede tocarlas.
    const rot = [...document.querySelectorAll('.pace-v1-rotulo')].filter(vis).map((e) => e.getBoundingClientRect());
    const au = caja('[data-pace-v1-auto]');
    if (au && rot.length && au.top < Math.max(...rot.map((r) => r.bottom)) + 2) pisa.push('palabras→auto ' + Math.round(au.top - Math.max(...rot.map((r) => r.bottom))));
    const corta = [];
    document.querySelectorAll('[data-pace-v1-raiz] *, .maq-auto *').forEach((e) => {
      if (!vis(e) || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const b = e.getBoundingClientRect();
      if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && !/Más tiempo|More time/.test(e.textContent)) corta.push('ancho:' + e.textContent.trim().slice(0, 24));
      if (b.right > innerWidth + 1 || b.left < -1 || b.bottom > innerHeight + 1) corta.push('fuera:' + e.textContent.trim().slice(0, 24));
    });
    return { scroll: document.scrollingElement.scrollHeight > innerHeight + 1, circulo: g && Math.round(g.getBoundingClientRect().height),
      justo: !!document.querySelector('[data-pace-v1-justo]'), pisa, corta: [...new Set(corta)] };
  });
}

const ESCENAS = [
  { n: 'colocate', id: 'extra.banda.espalda', paso: async () => {} },
  { n: 'saltar', id: 'extra.banda.espalda', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); } },
  { n: 'core', id: 'extra.core.stealth', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(3000); } },
  { n: 'basta', id: 'extra.chair.squats', paso: async (page) => {
    await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300);
    for (let i = 0; i < 30 && !(await page.locator('[data-pace-v1-basta]').count()); i++) await page.clock.runFor(1000);
  } },
];
const TODAS = [[320, 568], [360, 640], [375, 667], [360, 740], [390, 844], [412, 915], [768, 1024], [1280, 720], [1536, 710], [1440, 900]];
const PANTALLAS = LISTA === 'todas' ? TODAS : LISTA.split(',').map((p) => p.split('x').map(Number));

(async () => {
  const browser = await chromium.launch();
  const tareas = [];
  for (const lang of (MODO === 'censo' ? ['es', 'en'] : ['es'])) for (const [w, h] of PANTALLAS) for (const e of ESCENAS) {
    if (MODO === 'fotos' && e.n === 'basta') continue;
    if (lang === 'en' && ![320, 360, 1280].includes(w)) continue;
    tareas.push({ lang, w, h, e });
  }
  const filas = [];
  let i = 0;
  async function obrero() {
    while (i < tareas.length) {
      const t = tareas[i++];
      const fila = { t: t.lang + ' ' + t.e.n + ' ' + t.w + 'x' + t.h };
      for (const cual of ['hoy', 'propuesta']) {
        let ctx, page;
        try {
          LANG = t.lang;
          ({ ctx, page } = await abrir(browser, t.w, t.h, cual === 'propuesta', t.e.id));
          await t.e.paso(page);
          fila[cual] = await revisar(page);
          await page.screenshot({ path: OUT + '/' + cual + '_' + t.lang + '_' + t.e.n + '_' + t.w + 'x' + t.h + '.png', animations: 'disabled' });
        } catch (err) { fila[cual] = { error: err.message.slice(0, 90) }; }
        if (ctx) await ctx.close();
      }
      filas.push(fila);
      const h = fila.hoy || {}, p = fila.propuesta || {};
      console.log(fila.t.padEnd(24), 'circulo', h.circulo, '→', p.circulo, p.justo ? 'JUSTO' : '', p.scroll ? 'SCROLL' : '',
        (p.pisa || []).length ? 'PISA ' + p.pisa.join(', ') + ' (hoy ' + (h.pisa || []).join(', ') + ')' : '',
        (p.corta || []).length ? 'CORTA ' + p.corta.join(' | ') : '', p.error || h.error || '');
    }
  }
  await Promise.all([obrero(), obrero(), obrero()]);
  fs.writeFileSync(OUT + '/censo.json', JSON.stringify(filas, null, 1));
  await browser.close();
})();
