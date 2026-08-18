/* BANCO s166 · LA RETENCION YA IMPLEMENTADA, EN LOS CUATRO CUADRANTES
 * ===================================================================
 * `banco-retencion-variantes.js` fotografiaba SEIS propuestas inyectadas sobre
 * el DOM para elegir mirando. Esto es lo contrario: fotografia lo que quedo
 * IMPLEMENTADO, sin inyectar nada, en {es, en} x {claro, oscuro} — los tres
 * cuadrantes que s165 y la primera mitad de s166 dejaron declarados como no
 * mirados.
 *
 * Y ADEMAS ASERTA, para que no sea solo mirar: el texto de la etiqueta tiene
 * que ser el del idioma, y la cifra la MISMA en los cuatro (el dato no depende
 * ni del idioma ni de la paleta; si cambiara, algo estaria formateando por
 * locale sin querer).
 *
 * TRAMPAS:
 *  · Sembrar `weeklyStats` SIN los guards de migracion hace que `loadState`
 *    aplique `reindexWeeklyStatsMondayFirst` y ROTE la semana un dia. Costo una
 *    acusacion falsa al producto en s166.
 *  · La paleta se fija con `colorScheme` del contexto Y `paletteAuto:true`:
 *    sin Auto, un estado sembrado en «crema» ignora el esquema del navegador y
 *    las dos columnas salen iguales.
 *  · El panel es un modal: se espera a `[data-pace-week-view]`.
 *
 * Uso:  node banco-retencion-cuadrantes.js <repo> <salida>
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-retencion-cuadrantes');
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8809;
const BASE = 'http://localhost:' + PORT;

const HOLD = [38, 26, 71, 12, 55, 0, 44];             // 246 s
const TOTAL = HOLD.reduce((a, b) => a + b, 0);
const ETIQUETA = { es: 'Retención esta semana', en: 'Breath holds this week' };
const CIFRA = '4 min 06 s';

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const filas = [];
  const errores = [];
  let fallos = 0;
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
          viewport: { width: 1280, height: 900 },
          locale: lang === 'es' ? 'es-ES' : 'en-GB',
          colorScheme: paleta, deviceScaleFactor: 2,
        });
        await context.addInitScript(([c, e]) => {
          if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
        }, ['pace.state.v2', {
          firstSeen: 1, lang, langAuto: false, paletteAuto: true,
          weeklyStats: {
            focusMinutes: [50, 75, 25, 100, 50, 0, 25],
            breathMinutes: [12, 8, 20, 4, 16, 0, 12],
            moveMinutes: [10, 0, 15, 10, 0, 20, 5],
            waterGlasses: [6, 8, 5, 8, 7, 3, 6],
            holdSeconds: HOLD,
          },
          breatheSessionsTotal: 34,
          _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
          _historyMigrated: true, lastActiveDay: new Date().toDateString(),
        }]);
        const page = await context.newPage();
        const etq = lang + '-' + paleta;
        page.on('pageerror', e => errores.push(etq + ': pageerror: ' + e.message));
        page.on('console', m => { if (m.type() === 'error') errores.push(etq + ': console: ' + m.text()); });

        await page.goto(BASE + '/index.html');
        await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
        await page.getByRole('button', { name: lang === 'es' ? 'Ver estadísticas' : 'View stats' }).click();
        await page.locator('[data-pace-week-view]').waitFor({ state: 'visible' });
        await page.waitForTimeout(300);

        const leido = await page.evaluate(() => {
          const n = document.querySelector('[data-pace-week-hold]');
          if (!n) return null;
          /* Por HIJOS y no por querySelectorAll("span"): la etiqueta la pinta
             <Meta>, que es un <div class="pace-meta">, asi que el primer <span>
             del nodo era ya la cifra y la etiqueta salia vacia en los cuatro
             cuadrantes. Lo cazo el propio aserto, no una mirada. */
          return {
            atributo: n.getAttribute('data-pace-week-hold'),
            etiqueta: (n.children[0] || {}).textContent || '',
            cifra: (n.children[1] || {}).textContent || '',
          };
        });
        const paletaReal = await page.evaluate(() =>
          document.documentElement.getAttribute('data-palette') || '(sin atributo)');

        const bienEtq = leido && leido.etiqueta.trim() === ETIQUETA[lang];
        const bienCifra = leido && leido.cifra.trim() === CIFRA;
        const bienAttr = leido && leido.atributo === String(TOTAL);
        if (!leido || !bienEtq || !bienCifra || !bienAttr) fallos++;
        filas.push({ etq, paletaReal, leido, bienEtq, bienCifra, bienAttr });

        await page.locator('[data-pace-modal-backdrop]').last()
          .screenshot({ path: path.join(SALIDA, 'retencion-' + etq + '.png'), animations: 'disabled' });
        await context.close();
      }
    }
    await browser.close();
  } finally { srv.kill(); }

  console.log('\n  cuadrante   data-palette  etiqueta                    cifra         attr   ok');
  console.log('  ' + '-'.repeat(88));
  for (const f of filas) {
    const l = f.leido || { etiqueta: '(no existe la linea)', cifra: '-', atributo: '-' };
    console.log('  ' + f.etq.padEnd(12) + String(f.paletaReal).padEnd(14) +
      l.etiqueta.trim().padEnd(28) + l.cifra.trim().padEnd(14) + String(l.atributo).padEnd(7) +
      (f.bienEtq && f.bienCifra && f.bienAttr ? 'si' : 'NO'));
  }
  console.log('\n  cuadrantes: ' + filas.length + ' de 4 · discrepancias: ' + fallos);
  console.log('  consola: ' + (errores.length === 0 ? 'LIMPIA' : '\n    ' + errores.join('\n    ')));
  console.log('\n  capturas en ' + SALIDA);
  /* GUARD DE CERO. */
  if (filas.length !== 4) { console.error('  BANCO ROTO: faltan cuadrantes'); process.exit(1); }
  process.exit(fallos || errores.length ? 1 : 0);
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
