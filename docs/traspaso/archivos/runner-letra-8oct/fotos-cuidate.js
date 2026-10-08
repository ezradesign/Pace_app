/* PACE · «Cuídate» en serif itálica: fotos de antes y después (8 oct. 2026)
   Uso, desde la raíz del repo con index.html construido:
     node docs/traspaso/archivos/runner-letra-8oct/fotos-cuidate.js [puerto]
   Levanta su servidor (8800 por defecto) y retrata Flexiones de escritorio mientras se trabaja,
   cuando sale «Cuídate», a 360×640 y a 1280×800: hoy, y con la variante pintada encima. Mide el
   círculo del dibujo en las dos, porque la línea de abajo también le quita sitio. */
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const RAIZ = path.resolve(__dirname, '../../../..');
const { chromium } = require(path.join(RAIZ, 'node_modules', '@playwright', 'test'));
const PUERTO = Number(process.argv[2] || 8800);

/* La variante: el texto de «Cuídate» en la serif itálica; su rótulo sigue en versalitas de interfaz. */
const VARIANTE = `
  .pace-v1-raiz .pace-v1-cuidate { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.3; }
  .pace-v1-raiz [data-pace-v1-care-label] { font-family: var(--font-ui); font-style: normal; }
  @media (max-width: 640px) { .pace-v1-raiz .pace-v1-cuidate { font-size: 15px; } }`;

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], { cwd: RAIZ, env: Object.assign({}, process.env, { PORT: String(PUERTO) }), stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  const b = await chromium.launch();
  const medidas = {};
  try {
    for (const [w, h] of [[360, 640], [1280, 800]]) {
      for (const variante of [false, true]) {
        const movil = w < 768;
        const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: movil, hasTouch: movil, locale: 'es-ES', deviceScaleFactor: movil ? 3 : 2 });
        await ctx.addInitScript((m) => localStorage.setItem('pace.state.v2', JSON.stringify({ firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', sidebarCollapsed: m, ritmo: { libre: true } })), movil);
        const p = await ctx.newPage();
        await p.goto('http://localhost:' + PUERTO + '/index.html');
        if (variante) await p.addStyleTag({ content: VARIANTE });
        await p.getByRole('button', { name: /^Mueve/ }).first().click();
        await p.locator('.pace-lib').first().waitFor({ state: 'visible' });
        await p.waitForTimeout(400);
        await p.evaluate(() => { const t = [...document.querySelectorAll('[data-pace-lib-card="extra.desk.pushups"]')].find((e) => e.getBoundingClientRect().width > 0); (t.querySelector('.pace-lib-hit') || t).click(); });
        await p.locator('[data-pace-modal-backdrop]').last().getByRole('button', { name: 'Empezar', exact: true }).click();
        await p.getByRole('button', { name: 'Empezar ahora' }).click();
        await p.locator('[data-pace-v1-care]').first().waitFor({ state: 'visible', timeout: 20000 });
        await p.waitForTimeout(600);
        const nombre = (variante ? 'cuidate-despues-' : 'cuidate-antes-') + w + 'x' + h;
        medidas[nombre] = await p.evaluate(() => Math.round(document.querySelector('[data-pace-v1-glyph]').getBoundingClientRect().width));
        await p.screenshot({ path: path.join(__dirname, nombre + '.png') });
        await ctx.close();
      }
    }
  } finally { await b.close(); srv.kill(); }
  console.log(JSON.stringify(medidas));
})().catch((e) => { console.error(e); process.exit(1); });
