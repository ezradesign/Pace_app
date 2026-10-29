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
let LANG = 'es';
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
    locale: LANG === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang: LANG, langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: w < 1000, cuerpoAuto: false });
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


// Lo que se mira en cada foto: scroll, el círculo, piezas que se pisan (de arriba abajo) y
// textos que se salen de su caja o de la pantalla.
async function revisar(page) {
  return page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
    const caja = (s) => { const e = [...document.querySelectorAll(s)].find(vis); return e ? e.getBoundingClientRect() : null; };
    const g = document.querySelector('.pace-v1-glifo');
    // El texto de «Colócate» va en una caja de alto 0: se mide su contenido.
    const k = document.querySelector('[data-pace-v1-kicker]');
    let kick = null;
    if (k && k.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(k); kick = rg.getBoundingClientRect(); }
    const piezas = [
      ['circulo', g && g.getBoundingClientRect()], ['colocate', kick], ['nombre', caja('[data-pace-v1-name]')],
      ['instruccion', caja('[data-pace-v1-cue]')], ['numero', caja('[data-pace-v1-num]')], ['etiqueta', caja('[data-pace-v1-numlabel]')],
      ['pastilla', caja('[data-pace-v1-mas], [data-pace-v1-saltar], [data-pace-v1-basta]')], ['cola', caja('[data-pace-v1-cola] > div')],
      ['barra', caja('[data-pace-v1-progress] > div')], ['siguiente', caja('[data-pace-v1-siguiente]')], ['auto', caja('[data-pace-v1-auto]')],
      ['mando', caja('.pace-v1-mando')],
    ].filter((p) => p[1] && p[1].height > 0);
    const pisa = [];
    for (let i = 1; i < piezas.length; i++) {
      const a = piezas[i - 1], b = piezas[i];
      // «Siguiente» y «Auto» comparten fila en el ordenador: ahí no cuenta.
      if (a[0] === 'siguiente' && b[0] === 'auto' && Math.abs(a[1].top - b[1].top) < 12) continue;
      if (a[0] === 'etiqueta' && b[0] === 'pastilla' && Math.abs(a[1].top - b[1].top) < 12) continue;
      const hueco = Math.round(b[1].top - a[1].bottom);
      if (hueco < 2) pisa.push(a[0] + '→' + b[0] + ' ' + hueco);
    }
    const corta = [];
    document.querySelectorAll('[data-pace-v1-raiz] *').forEach((e) => {
      if (!vis(e) || !e.childNodes.length || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const b = e.getBoundingClientRect();
      if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible') corta.push('ancho:' + e.textContent.trim().slice(0, 24));
      if (b.right > innerWidth + 1 || b.left < -1 || b.bottom > innerHeight + 1) corta.push('fuera:' + e.textContent.trim().slice(0, 24));
    });
    const rotulos = [...document.querySelectorAll('.pace-v1-rotulo')].filter(vis).map((e) => e.getBoundingClientRect());
    if (rotulos.some((r) => r.bottom > innerHeight)) corta.push('rotulo bajo la pantalla');
    return {
      scroll: document.scrollingElement.scrollHeight > innerHeight + 1, circulo: g && Math.round(g.getBoundingClientRect().height),
      justo: !!document.querySelector('[data-pace-v1-justo]'), pisa, corta: [...new Set(corta)],
      aireBajo: Math.round(innerHeight - Math.max(...rotulos.map((r) => r.bottom), 0)),
    };
  });
}

const ESCENAS = [
  { n: 'colocate', id: 'extra.banda.espalda', paso: async () => {} },
  { n: 'saltar', id: 'extra.banda.espalda', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); } },
  { n: 'core', id: 'extra.core.stealth', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(3000); } },
  // La de los textos más largos del catálogo de pie, con «Con una basta» en su descanso.
  { n: 'basta', id: 'extra.chair.squats', paso: async (page) => {
    await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300);
    for (let i = 0; i < 30 && !(await page.locator('[data-pace-v1-basta]').count()); i++) await page.clock.runFor(1000);
  } },
];
const TODAS = [[320, 568], [360, 640], [375, 667], [360, 740], [390, 844], [412, 915], [768, 1024], [1280, 720], [1536, 710], [1440, 900]];

const PANTALLAS = process.argv[4] && process.argv[4] !== 'todas' ? process.argv[4].split(',').map((p) => p.split('x').map(Number)) : TODAS;
(async () => {
  const browser = await chromium.launch();
  const tareas = [];
  for (const lang of ['es', 'en']) for (const [w, h] of PANTALLAS) for (const e of ESCENAS) {
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
        LANG = t.lang;
        let ctx, page;
        try {
          ({ ctx, page } = await abrir(browser, t.w, t.h, cual === 'propuesta' ? PROPUESTA : '', t.e.id));
          await t.e.paso(page);
          fila[cual] = await revisar(page);
          if (cual === 'propuesta') await page.screenshot({ path: OUT + '/censo_' + t.lang + '_' + t.e.n + '_' + t.w + 'x' + t.h + '.png', animations: 'disabled' });
        } catch (err) { fila[cual] = { error: err.message.slice(0, 80) }; }
        if (ctx) await ctx.close();
      }
      filas.push(fila);
      const h = fila.hoy || {}, p = fila.propuesta || {};
      console.log(fila.t.padEnd(26), 'circulo', h.circulo, '→', p.circulo, h.justo || p.justo ? 'JUSTO ' + h.justo + '/' + p.justo : '',
        p.scroll ? 'SCROLL' : '', (p.pisa || []).length ? 'PISA ' + p.pisa.join(', ') : '', (p.corta || []).length ? 'CORTA ' + p.corta.join(' | ') : '',
        'aire bajo', h.aireBajo, '→', p.aireBajo, p.error || h.error || '');
    }
  }
  await Promise.all([obrero(), obrero(), obrero()]);
  fs.writeFileSync(OUT + '/censo.json', JSON.stringify(filas, null, 1));
  await browser.close();
})();
