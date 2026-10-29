// Fotos del runner de Mueve y Estira para que Ez elija (B3, P5, P6 y P8 de ChatGPT, 29 oct. 2026): el index.html
// de esta rama tal cual («Hoy») y, encima, cada opción pintada en la misma pantalla con CSS y texto, sin tocar
// el código. Uso: node fotos.js <carpeta-de-fotos> [solo-esta-escena], con la app servida en el 8808
// (PORT=8808 node .claude/static-server.js, desde la raíz del worktree). Las fotos no se suben. Cada escena
// sale a 360 y a 1280 px, en claro y en español.
'use strict';
const path = require('path');
const fs = require('fs');
const R = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app';
const { chromium } = require(R + '/node_modules/playwright');
const OUT = path.resolve(process.argv[2] || __dirname + '/fotos');
const SOLO = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:' + (process.env.PACE_E2E_PORT || '8808');

async function abrirRutina(page, biblioteca, id) {
  const movil = (page.viewportSize() || {}).width < 700;
  if (movil) {
    /* En el móvil las bibliotecas se abren desde los chips de la home. */
    await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  } else {
    await page.getByRole('button', { name: new RegExp('^' + biblioteca) }).first().click();
  }
  await page.locator('.pace-lib').locator('visible=true').first().waitFor();
  await page.waitForTimeout(500);
  await page.evaluate((i) => [...document.querySelectorAll('[data-pace-lib-card="' + i + '"] .pace-lib-hit')]
    .find((e) => e.getBoundingClientRect().width > 0).click(), id);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const ms = [...document.querySelectorAll('[data-pace-modal-card]')].filter((e) => e.getBoundingClientRect().width > 0);
    const raiz = ms.length ? ms[ms.length - 1] : document;
    [...raiz.querySelectorAll('button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /Empezar/i.test(x.textContent || '')).click();
  });
  await page.locator('[data-pace-v1-raiz]').first().waitFor({ timeout: 20000 });
}
const paso = async (page) => +(await page.getByText(/^Paso \d+ de \d+$/).first().textContent()).match(/Paso (\d+)/)[1] - 1;
async function irAlPaso(page, idx) {
  for (let i = 0; i < 40 && (await paso(page)) < idx; i++) { await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(200); }
}
const fase = (page) => page.locator('[data-pace-v1-raiz]').getAttribute('data-pace-v1-fase');

async function abrirApp(browser, w, extra) {
  const movil = w < 700;
  const ctx = await browser.newContext({
    viewport: { width: w, height: movil ? 740 : 720 }, deviceScaleFactor: movil ? 2 : 1, isMobile: movil, hasTouch: movil,
    locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light', serviceWorkers: 'block',
  });
  await ctx.addInitScript((s) => { localStorage.setItem('pace.state.v2', JSON.stringify(s)); },
    Object.assign({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false, ritmo: { libre: true }, sidebarCollapsed: movil }, extra || {}));
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-29T10:00:00+01:00') });
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.mouse.move(1, 1);
  return { ctx, page };
}

/* Lo que se pinta encima para cada opción: CSS con los textos de la propuesta. El runner sigue vivo debajo,
   así que lo que se cambia va por CSS (sobrevive a cada repintado) y por nodos marcados que se quitan antes
   de la siguiente foto. */
async function pintar(page, css, nodos) {
  await page.evaluate(([css, nodos]) => {
    document.querySelectorAll('[data-maq]').forEach((e) => e.remove());
    const st = document.createElement('style'); st.setAttribute('data-maq', ''); st.textContent = css || ''; document.head.appendChild(st);
    for (const n of (nodos || [])) {
      const ref = document.querySelector(n.donde);
      if (!ref) throw new Error('no encuentro ' + n.donde);
      const e = document.createElement(n.tag || 'div'); e.setAttribute('data-maq', ''); e.className = n.clase || ''; e.innerHTML = n.html;
      if (n.estilo) e.style.cssText = n.estilo;
      if (n.como === 'antes') ref.parentNode.insertBefore(e, ref);
      else if (n.como === 'dentro') ref.appendChild(e);
      else ref.parentNode.insertBefore(e, ref.nextSibling);
    }
  }, [css, nodos]);
  await page.waitForTimeout(150);
}
const limpiar = (page) => pintar(page, '', []);

/* Etiquetas bajo los tres botones del mando (P5). `sig` es lo que dice la flecha. */
const etiquetas = (sig, centro) => `
  [data-pace-v1-mando] [data-pace-v1-btn] { overflow: visible; }
  [data-pace-v1-mando] [data-pace-v1-btn]::after { position: absolute; top: calc(50% + 38px); left: 50%; transform: translateX(-50%);
    white-space: nowrap; font: 500 11.5px/1.2 var(--font-ui, 'Inter Tight', system-ui); letter-spacing: .01em; color: var(--ink-2); }
  [data-pace-v1-btn="prev"]::after { content: 'Anterior'; color: var(--ink-3) !important; }
  [data-pace-v1-btn="pausa"]::after { content: '${centro || 'Pausar'}'; }
  [data-pace-v1-btn="next"]::after { content: '${sig}'; color: var(--ink) !important; font-weight: 600 !important; }
  [data-pace-v1-mando] { padding-bottom: 20px; }
  [data-pace-v1-btn] { position: relative; }`;
/* La flecha con su texto dentro, como una píldora (P5, opción C). */
const pildora = (sig) => `
  [data-pace-v1-btn="next"] { width: auto !important; padding: 0 18px 0 20px !important; border-radius: 999px !important; gap: 4px; display: inline-flex; align-items: center; }
  [data-pace-v1-btn="next"]::before { content: '${sig}'; font: 600 14px/1 var(--font-ui, 'Inter Tight', system-ui); color: var(--ink); white-space: nowrap; order: -1; }
  [data-pace-v1-btn="next"] .pace-v1-anillo { display: none; }`;

const ESCENAS = {
  /* B3 · un paso opcional (la banda) con repeticiones y sin Auto. */
  async b3(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.banda.espalda');
    await page.locator('[data-pace-v1-btn="next"]').click();   // colocarse → trabajar
    await page.clock.runFor(300);
    await foto('b3-hoy');
    await pintar(page, etiquetas('Hecho') + `
      [data-pace-v1-siguiente] { visibility: hidden; }`, [
      { donde: '[data-pace-v1-numlabel]', como: 'despues', tag: 'button', clase: 'pace-v1-mas', html: 'Saltar este paso' },
    ]);
    await foto('b3-a');
    await pintar(page, `
      [data-pace-v1-mando] { display: none !important; }`, [
      { donde: '[data-pace-v1-mando]', como: 'despues', html:
        '<div style="display:flex;gap:10px;justify-content:center;align-items:center">' +
        '<button style="border:1px solid var(--line);background:transparent;color:var(--ink-2);border-radius:999px;padding:12px 18px;font:500 14px/1 var(--font-ui,system-ui)">Saltar este paso</button>' +
        '<button style="border:1px solid var(--move);background:var(--move);color:var(--paper);border-radius:999px;padding:12px 22px;font:600 14px/1 var(--font-ui,system-ui)">Hecho, 8 reps</button></div>' },
    ]);
    await foto('b3-b');
    await limpiar(page);
  },
  /* P5 · la flecha: unas reps a tu ritmo, un descanso y un paso por lados. */
  async p5(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.desk.pushups');
    await page.locator('[data-pace-v1-btn="next"]').click();
    await page.clock.runFor(300);
    await foto('p5-hoy');
    await pintar(page, etiquetas('Terminar serie'));
    await foto('p5-a');
    await pintar(page, `[data-pace-v1-siguiente] { visibility: hidden; }`, [
      { donde: '[data-pace-v1-siguiente]', como: 'despues', tag: 'span', html: '<b style="color:var(--ink)">›</b> termina la serie', estilo: 'position:absolute;left:0;font:500 13px/1.4 var(--font-ui,system-ui);color:var(--ink-2)' },
    ]);
    await foto('p5-b');
    await pintar(page, pildora('Terminar serie'));
    await foto('p5-c');
    await limpiar(page);
    await page.locator('[data-pace-v1-btn="next"]').click();   // al descanso
    await page.clock.runFor(4000);
    await pintar(page, etiquetas('Saltar descanso'));
    await foto('p5-a-descanso');
    await limpiar(page);
  },
  async p5lado(page, w, foto) {
    await abrirRutina(page, 'Estira', 'move.hips.standing');
    for (let i = 0; i < 12 && !/lateral/i.test(await page.locator('[data-pace-v1-name]').textContent()); i++) {
      await page.locator('[data-pace-v1-btn="next"]').click(); await page.clock.runFor(300);
    }
    if ((await fase(page)) === 'place') await page.locator('[data-pace-v1-btn="next"]').click();
    await page.clock.runFor(5000);
    await pintar(page, etiquetas('Siguiente lado'));
    await foto('p5-a-lado');
    await limpiar(page);
  },
  /* P6 · «La primera vez, una serie basta», en Levántate y sube: el descanso tras la primera serie. */
  async p6(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.chair.squats');
    await page.locator('[data-pace-v1-btn="next"]').click();
    await page.clock.runFor(300);
    await foto('p6-hoy-serie');
    await page.locator('[data-pace-v1-btn="next"]').click();   // al descanso
    await page.clock.runFor(5000);
    await foto('p6-hoy');
    await pintar(page, '', [
      { donde: '[data-pace-v1-numlabel]', como: 'despues', tag: 'button', clase: 'pace-v1-mas', html: 'Con una basta' },
    ]);
    await foto('p6-a');
    await limpiar(page);
  },
  /* P8 · la pausa, a mitad de un aguante. */
  async p8(page, w, foto) {
    await abrirRutina(page, 'Mueve', 'extra.core.stealth');
    await page.locator('[data-pace-v1-btn="next"]').click();   // de la colocación al aguante
    await page.clock.runFor(12000);
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await page.clock.runFor(300);
    await foto('p8-hoy');
    await pintar(page, `
      [data-pace-v1-kicker] { visibility: hidden; position: relative; }
      [data-pace-v1-kicker]::after { content: 'EN PAUSA'; visibility: visible; position: absolute; top: 0; left: 50%; transform: translateX(-50%); white-space: nowrap; color: var(--ink-2); }
      [data-pace-v1-cue] { visibility: hidden; position: relative; }
      [data-pace-v1-cue]::after { content: 'Suelta la postura. Al volver, unos segundos para colocarte y sigues donde lo dejaste.'; visibility: visible; position: absolute; inset: 0; }
      [data-pace-v1-num], [data-pace-v1-numlabel] { opacity: .38; }
      [data-pace-v1-cola] { visibility: hidden; }
      .pace-v1-aro, [data-pace-v1-glyph] svg { opacity: .55; }`);
    await foto('p8-a');
    await pintar(page, `
      [data-pace-v1-body] { position: relative; }`, [
      { donde: '[data-pace-v1-body]', como: 'dentro', html:
        '<div style="text-align:center;max-width:300px;padding:0 16px"><div style="font:500 11px/1.4 var(--font-ui,system-ui);letter-spacing:.14em;color:var(--ink-3)">SESIÓN EN PAUSA</div>' +
        '<div style="font:italic 500 30px/1.15 var(--font-display,serif);color:var(--ink);margin:8px 0 10px">Descansa</div>' +
        '<div style="font:400 15px/1.45 var(--font-ui,system-ui);color:var(--ink-2)">Sigues desde este punto. Al reanudar, 3, 2, 1 y vuelve la cuenta.</div></div>',
        estilo: 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:color-mix(in oklab, var(--paper) 88%, transparent);backdrop-filter:blur(2px);z-index:5' },
    ]);
    await foto('p8-b');
    await limpiar(page);
    /* Al volver (opción A): la cuenta de colocarse, con lo que quedaba del aguante esperando. */
    await page.locator('[data-pace-v1-btn="pausa"]').click();
    await pintar(page, `
      [data-pace-v1-kicker] { visibility: hidden; position: relative; }
      [data-pace-v1-kicker]::after { content: 'COLÓCATE'; visibility: visible; position: absolute; top: 0; left: 50%; transform: translateX(-50%); white-space: nowrap; color: var(--move); }
      [data-pace-v1-cue] { visibility: hidden; position: relative; }
      [data-pace-v1-cue]::after { content: 'Silla sin ruedas. Atrás del todo, espalda apoyada, manos en el asiento.'; visibility: visible; position: absolute; inset: 0; }
      [data-pace-v1-num] { visibility: hidden; position: relative; }
      [data-pace-v1-num]::after { content: '5'; visibility: visible; position: absolute; inset: 0; text-align: center; color: var(--ink-2); }
      [data-pace-v1-numlabel] { visibility: hidden; position: relative; }
      [data-pace-v1-numlabel]::after { content: 'para seguir · quedan 18 s'; visibility: visible; position: absolute; left: 50%; transform: translateX(-50%); white-space: nowrap; }
      [data-pace-v1-cola] { visibility: hidden; }
      .pace-v1-aro-arco { opacity: .35 !important; }`);
    await foto('p8-a-vuelta');
    await limpiar(page);
  },
};

(async () => {
  const browser = await chromium.launch();
  for (const [nombre, escena] of Object.entries(ESCENAS)) {
    if (SOLO && SOLO !== nombre) continue;
    for (const w of [360, 1280]) {
      const { ctx, page } = await abrirApp(browser, w, { cuerpoAuto: nombre === 'p5' || nombre === 'p5lado' || nombre === 'p8' });
      const foto = async (n) => { await page.screenshot({ path: OUT + '/' + n + '_' + w + '.png' }); console.log(n + '_' + w); };
      try { await escena(page, w, foto); } catch (e) { console.error(nombre, w, e.message); }
      await ctx.close();
    }
  }
  await browser.close();
})();
