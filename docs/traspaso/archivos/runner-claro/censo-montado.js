// El censo de la tercera vuelta del runner (29 oct.), ya montado: las mismas catorce pantallas y cuatro
// pasos que la tabla de la maqueta (maqueta-c.js), con «hoy» = el index.html de la rama antes del cambio y
// «montado» = el index.html compilado de la copia de trabajo. Los dos se sirven con page.route.
// Mira lo de maqueta-c.js (scroll, piezas que se pisan, textos cortados, el círculo) y además: el círculo bajo la
// cabecera (si el bloque se sale por arriba, queda cortado), «Auto» bajo
// las palabras del mando sin tocarlas, ni la línea de atajos del ordenador, y la pastilla centrada bajo su
// etiqueta.
// Uso: node censo-montado.js <carpeta> <index.html de hoy> [fotos|censo] [pantallas, p. ej. 360x740,1280x720 | todas] [escenas, p. ej. pausa,vuelta]
//   (el de hoy sale de «git show <commit>:index.html»)
'use strict';
const fs = require('fs');
const path = require('path');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const WT = R + '/.claude/worktrees/runner-claro-15db3c';
const { chromium } = require(R + '/node_modules/playwright');
const [OUT, HOY, MODO = 'censo', LISTA = 'todas', SOLO] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:8808';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jsx': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };

async function servir(ctx, cual) {
  await ctx.route(BASE + '/**', async (route) => {
    let f = path.join(WT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (cual === 'hoy' && f.endsWith('index.html')) f = HOY;
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream' });
  });
}

async function abrir(browser, w, h, cual, id, lang) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: lang === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    { firstSeen: 1, lang, langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: w < 1000, cuerpoAuto: false });
  await servir(ctx, cual);
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
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
  await page.clock.runFor(400);
  return { ctx, page };
}

async function revisar(page) {
  return page.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
    const caja = (s) => { const e = [...document.querySelectorAll(s)].find(vis); return e ? e.getBoundingClientRect() : null; };
    const g = document.querySelector('.pace-v1-glifo');
    // El texto de «Colócate» va en una caja de alto fijo: se mide su contenido.
    const k = document.querySelector('[data-pace-v1-kicker]');
    let kick = null;
    if (k && k.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(k); kick = rg.getBoundingClientRect(); }
    // La cabecera de la sesión va primero: si el bloque se sale por arriba, el círculo queda debajo de ella.
    const piezas = [
      ['cabecera', caja('[data-pace-session-header]')], ['circulo', g && g.getBoundingClientRect()], ['colocate', kick], ['nombre', caja('[data-pace-v1-name]')], ['instruccion', caja('[data-pace-v1-cue]')],
      ['numero', caja('[data-pace-v1-num]')], ['etiqueta', caja('[data-pace-v1-numlabel]')],
      ['pastilla', caja('[data-pace-v1-mas], [data-pace-v1-saltar], [data-pace-v1-basta]')], ['cola', caja('[data-pace-v1-cola] > div')],
      ['barra', caja('[data-pace-v1-progress] > div')], ['siguiente', caja('[data-pace-v1-siguiente]')], ['mando', caja('.pace-v1-mando')],
    ].filter((p) => p[1] && p[1].height > 0);
    const pisa = [];
    for (let i = 1; i < piezas.length; i++) {
      const a = piezas[i - 1], b = piezas[i];
      // Hoy, la pastilla va en la fila de la etiqueta.
      if (a[0] === 'etiqueta' && b[0] === 'pastilla' && Math.abs(a[1].top - b[1].top) < 12) continue;
      const hueco = Math.round(b[1].top - a[1].bottom);
      // La caja de la cabecera ya lleva su relleno: el círculo puede empezar justo debajo.
      if (a[0] === 'cabecera' ? hueco < 0 : hueco < 2) pisa.push(a[0] + '→' + b[0] + ' ' + hueco);
    }
    // «Auto»: bajo el mando, por debajo de las palabras de los botones y por encima de la línea de atajos;
    // junto a «Siguiente», va en su fila, dentro de la barra de pasos (si el texto es largo, baja a otra línea, como hoy).
    const rot = [...document.querySelectorAll('.pace-v1-rotulo')].filter(vis).map((e) => e.getBoundingClientRect());
    const autoEl = [...document.querySelectorAll('[data-pace-v1-auto]')].find(vis);
    const au = autoEl && autoEl.getBoundingClientRect();
    const abajo = !!(autoEl && autoEl.closest('[data-pace-v1-mando]'));
    if (au && abajo) {
      const bajoPalabras = Math.round(au.top - Math.max(...rot.map((r) => r.bottom)));
      if (bajoPalabras < 2) pisa.push('palabras→auto ' + bajoPalabras);
      const hint = caja('[data-pace-session-hint]');
      if (hint && hint.top < au.bottom + 2 && hint.bottom > au.top) pisa.push('auto→atajos ' + Math.round(hint.top - au.bottom));
    }
    const hint = caja('[data-pace-session-hint]');
    if (hint && rot.length && hint.top < Math.max(...rot.map((r) => r.bottom)) + 2) pisa.push('palabras→atajos ' + Math.round(hint.top - Math.max(...rot.map((r) => r.bottom))));
    // La pastilla, centrada bajo su etiqueta (en lo montado; en «justo», a su lado).
    const pa = caja('[data-pace-v1-mas], [data-pace-v1-saltar], [data-pace-v1-basta]'), et = caja('[data-pace-v1-numlabel]');
    const centrada = pa && et ? Math.round(Math.abs((pa.left + pa.right) / 2 - (et.left + et.right) / 2)) : null;
    const corta = [];
    document.querySelectorAll('[data-pace-v1-raiz] *, [data-pace-v1-mando] *').forEach((e) => {
      if (!vis(e) || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
      const b = e.getBoundingClientRect();
      // «· Más tiempo» es el texto oculto para el lector de pantalla del +15 s: no se ve.
      if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && !/Más tiempo|More time/.test(e.textContent)) corta.push('ancho:' + e.textContent.trim().slice(0, 24));
      if (b.right > innerWidth + 1 || b.left < -1 || b.bottom > innerHeight + 1) corta.push('fuera:' + e.textContent.trim().slice(0, 24));
    });
    return { scroll: document.scrollingElement.scrollHeight > innerHeight + 1, circulo: g && Math.round(g.getBoundingClientRect().height),
      justo: !!document.querySelector('[data-pace-v1-justo]'), autoAbajo: abajo, centrada, pisa, corta: [...new Set(corta)] };
  });
}

const ESCENAS = [
  { n: 'colocate', id: 'extra.banda.espalda', paso: async () => {} },
  { n: 'saltar', id: 'extra.banda.espalda', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); } },
  { n: 'core', id: 'extra.core.stealth', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(3000); } },
  // En maqueta-c.js, sin Auto, este paso se quedaba en la primera serie (a tu ritmo espera a la flecha): aquí
  // llega al descanso con «Con una basta».
  { n: 'basta', id: 'extra.chair.squats', paso: async (page) => {
    for (let i = 0; i < 4 && !(await page.locator('[data-pace-v1-basta]').count()); i++) { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); }
    if (!(await page.locator('[data-pace-v1-basta]').count())) throw new Error('no llegó a «Con una basta»');
  } },
  // Y la primera serie, la de la tabla de la maqueta.
  { n: 'serie', id: 'extra.chair.squats', paso: async (page) => { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300); } },
  // Para las fotos: la pausa y su 3, 2, 1, con el círculo a la vista.
  { n: 'pausa', id: 'extra.core.stealth', soloFotos: true, paso: async (page) => {
    await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(6000);
    await page.locator('[data-pace-v1-btn="pausa"]').click(); await page.clock.runFor(300);
  } },
  { n: 'vuelta', id: 'extra.core.stealth', soloFotos: true, paso: async (page) => {
    await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(6000);
    await page.locator('[data-pace-v1-btn="pausa"]').click(); await page.clock.runFor(300);
    await page.locator('[data-pace-v1-btn="pausa"]').click(); await page.clock.runFor(200);
  } },
];
const TODAS = [[320, 568], [360, 640], [375, 667], [360, 740], [390, 844], [412, 915], [768, 1024], [1280, 720], [1536, 710], [1440, 900]];
const PANTALLAS = LISTA === 'todas' ? TODAS : LISTA.split(',').map((p) => p.split('x').map(Number));

(async () => {
  const browser = await chromium.launch();
  const tareas = [];
  for (const lang of (MODO === 'censo' ? ['es', 'en'] : ['es'])) for (const [w, h] of PANTALLAS) for (const e of ESCENAS) {
    if (MODO === 'censo' && e.soloFotos) continue;
    if (SOLO && !SOLO.split(',').includes(e.n)) continue;
    if (lang === 'en' && ![320, 360, 1280].includes(w)) continue;
    tareas.push({ lang, w, h, e });
  }
  const filas = [];
  let i = 0;
  async function obrero() {
    while (i < tareas.length) {
      const t = tareas[i++];
      const fila = { t: t.lang + ' ' + t.e.n + ' ' + t.w + 'x' + t.h };
      for (const cual of ['hoy', 'montado']) {
        let ctx, page;
        try {
          ({ ctx, page } = await abrir(browser, t.w, t.h, cual, t.e.id, t.lang));
          await t.e.paso(page);
          fila[cual] = await revisar(page);
          await page.screenshot({ path: OUT + '/' + cual + '_' + t.lang + '_' + t.e.n + '_' + t.w + 'x' + t.h + '.png', animations: 'disabled' });
        } catch (err) { fila[cual] = { error: err.message.slice(0, 90) }; }
        if (ctx) await ctx.close();
      }
      filas.push(fila);
      const h = fila.hoy || {}, p = fila.montado || {};
      console.log(fila.t.padEnd(24), 'circulo', h.circulo, '→', p.circulo, p.justo ? 'JUSTO' : '', p.autoAbajo ? 'auto abajo' : 'auto junto', p.scroll ? 'SCROLL' : '',
        p.centrada != null && p.centrada > 2 ? 'DESCENTRADA ' + p.centrada : '',
        (p.pisa || []).length ? 'PISA ' + p.pisa.join(', ') + ' (hoy ' + (h.pisa || []).join(', ') + ')' : '',
        (p.corta || []).length ? 'CORTA ' + p.corta.join(' | ') : '', p.error || h.error || '');
    }
  }
  await Promise.all([obrero(), obrero(), obrero()]);
  filas.sort((a, b) => a.t.localeCompare(b.t));
  fs.writeFileSync(OUT + '/censo.json', JSON.stringify(filas, null, 1));
  await browser.close();
})();
