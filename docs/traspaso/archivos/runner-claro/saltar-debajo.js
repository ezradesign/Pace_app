// Maqueta para Ez: «Saltar este paso» debajo de «REPS · A TU RITMO», como «Con una basta» bajo
// «SEGUNDOS». El index.html de la rama del runner tal cual, con la propuesta pintada encima con CSS.
// Uso: node maqueta-saltar.js <carpeta>, con la rama servida en el 8808.
'use strict';
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8808';
const WT = R + '/.claude/worktrees/runner-claro-15db3c';
const path = require('path');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };
async function servir(ctx) { await ctx.route(BASE + '/**', async (route) => { const u = new URL(route.request().url()); const f = path.join(WT, decodeURIComponent(u.pathname)); if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream' }); return route.fulfill({ status: 404, body: '' }); }); }
// Como el hueco de «Con una basta»: la fila está en todos los pasos de la rutina (vacía donde no
// hay paso que saltar), así el círculo se mide contando con ella y nada se mueve de un paso a otro.
const PROPUESTA = `
  .pace-v1-numgrupo::after { content: ''; display: block; min-height: 24px; }
  .pace-v1-numgrupo:has([data-pace-v1-saltar])::after { display: none; }
  .pace-v1-numfila:has([data-pace-v1-saltar]) { flex-direction: column; gap: 6px; }
  /* El círculo no cambia (Ez): la fila sale del aire. Arriba, sin el margen de la columna; abajo,
     «Colócate» deja de ocupar su línea y se pinta en medio del hueco entre el círculo y el nombre;
     y la barra de pasos, sin su margen de arriba. Todo por alto o por relleno, que es lo que mide
     el runner al dar tamaño al círculo (los márgenes no los cuenta). */
  .pace-v1 { padding-top: 0 !important; }
  [data-pace-v1-kicker] { min-height: 0 !important; height: 0; overflow: visible; line-height: 1 !important;
    transform: translateY(-6px); }
  .pace-v1-pasos { margin-top: 0 !important; }`;

async function abrir(browser, w, h, css) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: movil, cuerpoAuto: false });
  await servir(ctx);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  if (css) await page.evaluate((c) => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }, css);
  await page.getByRole('button', { name: /^Mueve/ }).first().click();
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate(() => [...document.querySelectorAll('[data-pace-lib-card="extra.banda.espalda"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click());
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
  await page.clock.runFor(300);
  // Antes de la flecha, el paso está en «Colócate»: es donde el hueco de debajo del círculo trabaja.
  await page.screenshot({ path: OUT + '/' + (css ? 'propuesta' : 'hoy') + '-colocate_' + w + 'x' + h + '.png', animations: 'disabled' });
  await page.locator('[data-pace-v1-btn="next"]').click();
  await page.clock.runFor(300);
  return { ctx, page };
}

// Lo que importa medir: que nada se salga ni pida scroll, y dónde queda cada pieza.
async function medir(page) {
  return page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
    const raiz = document.querySelector('[data-pace-v1-raiz]');
    return {
      scroll: document.scrollingElement.scrollHeight > innerHeight + 1 || (raiz && raiz.scrollHeight > raiz.clientHeight + 1),
      nombre: r('[data-pace-v1-name]'), etiqueta: r('[data-pace-v1-numlabel]'), saltar: r('[data-pace-v1-saltar]'),
      cuidate: r('[data-pace-v1-cola]'), pasos: r('[data-pace-v1-progress]'),
      cuerpo: r('.pace-v1'), glifo: r('.pace-v1-glifo'), kicker: r('[data-pace-v1-kicker]'),
      u: raiz && getComputedStyle(raiz).getPropertyValue('--v1-u'),
    };
  });
}

(async () => {
  const browser = await chromium.launch();
  // La propuesta entra antes de abrir la rutina: así el runner encaja el círculo contando con la
  // fila nueva, que es lo que haría el código montado («sube un poco todo el bloque»).
  for (const [w, h] of [[360, 740], [1280, 720], [360, 640]]) {
    for (const cual of ['hoy', 'propuesta']) {
      const { ctx, page } = await abrir(browser, w, h, cual === 'propuesta' ? PROPUESTA : '');
      const tag = w + 'x' + h;
      await page.screenshot({ path: OUT + '/' + cual + '_' + tag + '.png', animations: 'disabled' });
      console.log(cual, tag, JSON.stringify(await medir(page)));
      await ctx.close();
    }
  }
  await browser.close();
})();
