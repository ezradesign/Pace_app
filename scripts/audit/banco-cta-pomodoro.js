/* BANCO s166 · EL CTA DEL POMODORO EN LOS TRES MODOS, LOS DOS IDIOMAS Y LAS DOS PALETAS
 * =====================================================================================
 * s166 arreglo que en Pausa y Larga el boton dijera «Empezar foco» sobre un
 * reloj que no es de foco. El arreglo se verifico solo en español y en claro, y
 * el usuario pidio expresamente mirar los otros tres cuadrantes.
 *
 * MIDE 12 CASOS: {foco, pausa, larga} x {es, en} x {claro, oscuro}. El texto se
 * lee del DOM y se compara contra lo esperado; no se «mira si parece bien».
 *
 * TRAMPAS:
 *  · Los tabs se leen en MAYUSCULA por `text-transform`, pero `textContent`
 *    trae «Foco». Comparar contra 'FOCO' no casa nunca (trampa de s154). Se
 *    busca sin distinguir caja.
 *  · La paleta se fija con `colorScheme` del contexto Y con `paletteAuto:true`
 *    sembrado, porque `detectInitialPalette()` solo mira `prefers-color-scheme`
 *    en el primer arranque; sin Auto, un estado sembrado en «crema» ignora el
 *    esquema del navegador y las dos columnas saldrian iguales.
 *  · El idioma va por `langAuto:false` + `lang` explicito: con Auto, el locale
 *    del contexto manda y es facil creer que se esta probando otra cosa.
 *
 * GUARD DE CERO: si no se leyeron los 12 casos, sale con 1.
 *
 * Uso:  node banco-cta-pomodoro.js <repo> <salida>
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-cta');
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8807;
const BASE = 'http://localhost:' + PORT;

/* Lo que TIENE que decir cada boton. Es un contrato, no una foto: si manana se
   cambia la palabra hay que cambiarla aqui, y ese es el punto. */
const ESPERADO = {
  es: { foco: 'Empezar foco', pausa: 'Empezar pausa', larga: 'Empezar pausa' },
  en: { foco: 'Start focus',  pausa: 'Start break',   larga: 'Start break'   },
};
const TAB = {
  es: { foco: 'foco', pausa: 'pausa', larga: 'larga' },
  en: { foco: 'focus', pausa: 'pause', larga: 'long' },
};

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const filas = [];
  const errores = [];
  let leidos = 0, fallos = 0;
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    for (const lang of ['es', 'en']) {
      for (const paleta of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: 1280, height: 800 },
          locale: lang === 'es' ? 'es-ES' : 'en-GB',
          colorScheme: paleta, deviceScaleFactor: 2,
        });
        await context.addInitScript(([c, e]) => {
          if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
        }, ['pace.state.v2', {
          firstSeen: 1, lang, langAuto: false, paletteAuto: true,
          _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
          _historyMigrated: true, lastActiveDay: new Date().toDateString(),
        }]);
        const page = await context.newPage();
        page.on('pageerror', e => errores.push(lang + '/' + paleta + ': pageerror: ' + e.message));
        page.on('console', m => { if (m.type() === 'error') errores.push(lang + '/' + paleta + ': console: ' + m.text()); });
        await page.goto(BASE + '/index.html');
        await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });

        const paletaReal = await page.evaluate(() =>
          document.documentElement.getAttribute('data-palette') || '(sin atributo)');

        for (const modo of ['foco', 'pausa', 'larga']) {
          const buscado = TAB[lang][modo];
          const ok = await page.evaluate((b) => {
            const t = [...document.querySelectorAll('button')]
              .find(x => x.textContent.trim().toLowerCase() === b);
            if (!t) return false;
            t.click();
            return true;
          }, buscado);
          if (!ok) { errores.push(lang + '/' + paleta + '/' + modo + ': tab no encontrado'); continue; }
          await page.waitForTimeout(220);
          const leido = await page.evaluate(() => {
            const b = document.querySelector('[data-pace-cta]');
            const reloj = [...document.querySelectorAll('*')]
              .map(e => e.childElementCount === 0 ? e.textContent.trim() : '')
              .find(t => /^\d\d:\d\d$/.test(t));
            return { cta: b ? b.textContent.trim() : null, reloj };
          });
          leidos++;
          const esperado = ESPERADO[lang][modo];
          const bien = leido.cta === esperado;
          if (!bien) fallos++;
          filas.push({ lang, paleta, paletaReal, modo, reloj: leido.reloj, cta: leido.cta, esperado, bien });
          if (modo === 'pausa') {
            await page.screenshot({ path: path.join(SALIDA, 'cta-' + lang + '-' + paleta + '-pausa.png'), animations: 'disabled' });
          }
        }
        await context.close();
      }
    }
    await browser.close();
  } finally { srv.kill(); }

  console.log('\n  idioma  paleta  data-palette  modo    reloj    boton               esperado            ');
  console.log('  ' + '-'.repeat(100));
  for (const f of filas) {
    console.log('  ' + f.lang.padEnd(8) + f.paleta.padEnd(8) + String(f.paletaReal).padEnd(14) +
      f.modo.padEnd(8) + String(f.reloj).padEnd(9) + String(f.cta).padEnd(20) +
      f.esperado.padEnd(20) + (f.bien ? 'OK' : '>>> NO COINCIDE'));
  }
  console.log('\n  casos leidos: ' + leidos + ' de 12 · discrepancias: ' + fallos);
  console.log('  consola: ' + (errores.length === 0 ? 'LIMPIA' : '\n    ' + errores.join('\n    ')));
  console.log('\n  capturas en ' + SALIDA);
  if (leidos !== 12) { console.error('\n  BANCO ROTO: faltan casos por leer'); process.exit(1); }
  process.exit(fallos || errores.length ? 1 : 0);
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
