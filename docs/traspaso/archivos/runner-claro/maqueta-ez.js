// Maqueta para Ez: su reparto del runner (29 oct.), pintado con CSS sobre el index.html de la rama
// del runner. Uso: node maqueta-ez.js <carpeta> [css-extra]. Sirve la rama con page.route.
'use strict';
const fs = require('fs');
const path = require('path');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const WT = R + '/.claude/worktrees/runner-claro-15db3c';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8808';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };

// Lo que leo en la maqueta de Ez: cada pastilla (+15 s, «Saltar este paso») centrada bajo su
// etiqueta, con su hueco siempre; «Siguiente» en una línea y «Auto» debajo; el número un poco
// menor y la etiqueta pegada a él. El círculo, como hoy: lo que entra sale del aire.
// Lo que entra sale de alturas y rellenos (los márgenes no los cuenta el runner al dar tamaño al
// círculo): sin el relleno de arriba, la barra pegada a lo de encima como en la maqueta de Ez y,
// en el móvil, el aire entre piezas un poco más justo.
const PROPUESTA = `
  .pace-v1-numfila { flex-direction: column; gap: 6px; min-height: 46px; justify-content: flex-start; }
  /* Una sola fila de pastilla: donde ya está la de «Con una basta», la de +15 s ocupa ese hueco. */
  .pace-v1-numgrupo:has(.pace-v1-numbasta) .pace-v1-numfila { min-height: 0; }
  .pace-v1-numgrupo:has(.pace-v1-numfila .pace-v1-mas) .pace-v1-numbasta { display: none; }
  .pace-v1 { padding-top: 0 !important; }
  .pace-v1-pasos { margin-top: 0 !important; }
  .pace-v1-siguiente { margin-top: 2px !important; }
  @media (max-width: 640px) {
    .pace-v1-siguiente { flex-direction: column; gap: 4px; }
    .pace-v1-raiz { --v1-num: clamp(44px, 6.8vh, 50px); --v1-u: clamp(5px, 0.95vh, 12px); }
  }
  /* En los móviles muy bajos no caben dos líneas ahí: «Auto» vuelve junto a «Siguiente». */
  @media (max-width: 640px) and (max-height: 600px) {
    .pace-v1-siguiente { flex-direction: row; gap: 4px 12px; }
  }
` + (process.argv[3] || '');

async function servir(ctx) {
  await ctx.route(BASE + '/**', async (route) => {
    const f = path.join(WT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream' });
    return route.fulfill({ status: 404, body: '' });
  });
}

async function abrir(browser, w, h, css, id) {
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
  await page.clock.runFor(300);
  return { ctx, page };
}

async function medir(page) {
  return page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; };
    const g = document.querySelector('.pace-v1-glifo');
    return {
      scroll: document.scrollingElement.scrollHeight > innerHeight + 1,
      circulo: g && Math.round(g.getBoundingClientRect().height), justo: !!document.querySelector('[data-pace-v1-justo]'),
      glifo: r('.pace-v1-glifo'), nombre: r('[data-pace-v1-name]'), num: r('[data-pace-v1-num]'), etiqueta: r('[data-pace-v1-numlabel]'),
      cola: r('[data-pace-v1-cola]'), pasos: r('[data-pace-v1-progress]'), auto: r('[data-pace-v1-auto]'), mando: r('.pace-v1-mando'),
    };
  });
}

const ESCENAS = [
  // La pantalla de la maqueta de Ez: colocarse en la apertura con banda.
  { n: 'colocate', id: 'extra.banda.espalda', paso: async () => {} },
  { n: 'saltar', id: 'extra.banda.espalda', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); } },
  // Una rutina sin pastillas en su paso de trabajo, para ver que el círculo se queda.
  { n: 'core', id: 'extra.core.stealth', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(3000); } },
];

(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[360, 740], [412, 915], [1280, 720]]) {
    for (const e of ESCENAS) {
      for (const cual of ['hoy', 'propuesta']) {
        const { ctx, page } = await abrir(browser, w, h, cual === 'propuesta' ? PROPUESTA : '', e.id);
        try {
          await e.paso(page);
          const tag = e.n + '_' + w + 'x' + h;
          await page.screenshot({ path: OUT + '/' + cual + '_' + tag + '.png', animations: 'disabled' });
          console.log(cual.padEnd(9), tag.padEnd(18), JSON.stringify(await medir(page)));
        } catch (err) { console.error(cual, e.n, w, err.message); }
        await ctx.close();
      }
    }
  }
  await browser.close();
})();
