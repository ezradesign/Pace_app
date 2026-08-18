/* CENSO s165 · EL RITMO REAL DE LAS 20 RUTINAS DE RESPIRA
 * ========================================================
 * Antes de elegir COMO se dibuja el progreso hay que saber que hay que dibujar.
 * Esto no lee el codigo: carga la app y pregunta a `getSequence()` —la misma
 * funcion que usa la sesion— por la secuencia de CADA rutina del catalogo, y
 * deriva de ahi todo lo demas (ciclo, cuantos ciclos caben, fase mas corta y
 * mas larga, si la cuenta atras llega a verse).
 *
 * POR QUE `PACE.html` Y NO `index.html`: `BREATHE_ROUTINES` es un `const` de
 * modulo. En el artefacto compilado cada modulo va dentro de su IIFE y ese
 * nombre NO existe en `window` (es la otra cara de la trampa de s144/s150); en
 * el entry de desarrollo, Babel standalone evalua en ambito global y si existe.
 * Aqui no se mide ni un pixel, asi que servir el entry de desarrollo es legitimo
 * — y se declara, que es lo que importa.
 *
 * Uso:  node censo-respira-ritmos.js <repo>
 */
'use strict';

const { spawn } = require('child_process');
const REPO = process.argv[2] || process.cwd();
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8796;
const BASE = 'http://localhost:' + PORT;

const CENSO = () => {
  const filas = [];
  for (const [grupo, g] of Object.entries(BREATHE_ROUTINES)) {
    for (const r of g.items) {
      const seq = getSequence(r);
      const ciclo = seq.reduce((s, p) => s + p.duration, 0);
      const fases = seq.map(p => p.duration);
      const total = r.min * 60;
      filas.push({
        grupo,
        id: r.id,
        nombre: r.name,
        min: r.min,
        patron: r.pattern,
        rondas: r.rounds || null,
        respiraciones: r.breaths || null,
        premium: r.access === 'premium',
        seguridad: !!r.safety,
        fasesPorCiclo: seq.length,
        ciclo,
        ciclos: ciclo > 0 ? total / ciclo : null,
        faseMin: Math.min(...fases),
        faseMax: Math.max(...fases),
        /* La cuenta atras solo se pinta si la fase dura >= 4 s (BreatheSession) */
        cuentaAtrasEnAlguna: fases.some(d => d >= 4),
        cuentaAtrasEnTodas: fases.every(d => d >= 4),
        etiquetas: seq.map(p => p.label + ' ' + p.duration).join(' · '),
      });
    }
  }
  return filas;
};

(async () => {
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/PACE.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    const context = await browser.newContext({ locale: 'es-ES' });
    const page = await context.newPage();
    await page.goto(BASE + '/PACE.html');
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible', timeout: 30000 });
    const filas = await page.evaluate(CENSO);

    console.log('CENSO DE RITMOS · ' + filas.length + ' rutinas\n');
    const cab = ['rutina', 'patron', 'min', 'ciclo', '#ciclos', 'fases', 'fase-', 'fase+', 'cuenta', 'secuencia'];
    console.log(cab[0].padEnd(22) + cab[1].padEnd(15) + cab[2].padStart(4) + cab[3].padStart(7)
      + cab[4].padStart(9) + cab[5].padStart(7) + cab[6].padStart(7) + cab[7].padStart(7)
      + '  ' + cab[8].padEnd(8) + cab[9]);
    console.log('-'.repeat(150));
    for (const f of filas) {
      const cuenta = f.cuentaAtrasEnTodas ? 'siempre' : (f.cuentaAtrasEnAlguna ? 'a veces' : 'NUNCA');
      console.log(
        (f.nombre + (f.premium ? ' *' : '')).padEnd(22)
        + f.patron.padEnd(15)
        + String(f.min).padStart(4)
        + String(f.ciclo).padStart(7)
        + (f.ciclos === null ? '-' : f.ciclos.toFixed(1)).padStart(9)
        + String(f.fasesPorCiclo).padStart(7)
        + String(f.faseMin).padStart(7)
        + String(f.faseMax).padStart(7)
        + '  ' + cuenta.padEnd(8)
        + f.etiquetas
      );
    }
    console.log('\nJSON:');
    console.log(JSON.stringify(filas));
    await browser.close();
  } finally { srv.kill(); }
})().catch(e => { console.error('CENSO ROTO:', e.message); process.exit(1); });
