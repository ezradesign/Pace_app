/* BANCO s163 · ¿ha movido el troceo UN SOLO PIXEL?
 * ================================================
 * La suite no compara ni un pixel, y este troceo ha tocado el sistema visual
 * (tokens.css, _responsive.js y FocusTimer.jsx). La prueba de que las REGLAS son
 * las mismas ya esta hecha por huella; esto cierra lo otro: que el resultado
 * PINTADO sea el mismo.
 *
 * Metodo del proyecto (s156, s159): servir el artefacto de HEAD y el de ahora
 * **en paralelo**, desde el mismo servidor y con el mismo estado sembrado, y
 * fotografiar los dos. Se compara pixel a pixel con `sharp`, que ya es una
 * dependencia del repo.
 *
 * Uso:  node banco-pixeles.js <repo> <copia-de-HEAD.html>
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const HEAD_HTML = process.argv[3];
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));
const sharp = require(require.resolve('sharp', { paths: [REPO] }));

const PORT = 8798;
const BASE = 'http://localhost:' + PORT;
const VISTAS = [
  { nombre: 'escritorio', w: 1280, h: 720 },
  { nombre: 'movil', w: 390, h: 844 },
];

async function foto(browser, ruta, vista, paleta) {
  const context = await browser.newContext({
    viewport: { width: vista.w, height: vista.h },
    locale: 'es-ES',
    colorScheme: 'light',
    deviceScaleFactor: 1,
  });
  await context.addInitScript(([c, e]) => {
    localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', { firstSeen: 1, lang: 'es', langAuto: false, palette: paleta }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  await page.goto(BASE + ruta);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  /* El motor de geometria converge en varias pasadas y la luz esta parada (sin
     sesion), asi que con esperar a que el aro deje de moverse basta. */
  await page.waitForTimeout(2500);
  const png = await page.screenshot({ animations: 'disabled' });
  await context.close();
  return { png, errores };
}

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    const rutaHead = '/' + path.basename(HEAD_HTML);
    console.log('HEAD  -> ' + rutaHead + '     ahora -> /index.html\n');
    let peor = 0;
    for (const vista of VISTAS) {
      for (const paleta of ['crema', 'oscuro']) {
        const a = await foto(browser, rutaHead, vista, paleta);
        const b = await foto(browser, '/index.html', vista, paleta);
        const ra = await sharp(a.png).raw().toBuffer({ resolveWithObject: true });
        const rb = await sharp(b.png).raw().toBuffer({ resolveWithObject: true });
        let distintos = 0;
        let maxDelta = 0;
        if (ra.data.length !== rb.data.length) {
          console.log('  %s/%s: TAMAÑOS DISTINTOS (%d vs %d)',
            vista.nombre, paleta, ra.data.length, rb.data.length);
          peor = Infinity;
          continue;
        }
        const canales = ra.info.channels;
        for (let i = 0; i < ra.data.length; i += canales) {
          let d = 0;
          for (let c = 0; c < canales; c++) d = Math.max(d, Math.abs(ra.data[i + c] - rb.data[i + c]));
          if (d > 0) { distintos++; if (d > maxDelta) maxDelta = d; }
        }
        const total = ra.data.length / canales;
        const pct = (distintos / total * 100).toFixed(4);
        peor = Math.max(peor, distintos);
        console.log('  ' + (vista.nombre + '/' + paleta).padEnd(20)
          + String(vista.w) + 'x' + String(vista.h)
          + '   pixeles distintos: ' + String(distintos).padStart(7)
          + ' de ' + total + ' (' + pct + '%)   delta max: ' + maxDelta
          + (a.errores.length + b.errores.length ? '   CONSOLA: ' +
             (a.errores.concat(b.errores).join(' | ')) : '   consola limpia'));
      }
    }
    await browser.close();
    console.log('\n' + (peor === 0
      ? 'VEREDICTO: ni un pixel distinto en las cuatro combinaciones.'
      : 'VEREDICTO: hay diferencias -- ' + peor + ' pixeles en el peor caso.'));
  } finally { srv.kill(); }
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
