/* HUELLA DEL CSS VIVO · s163
 * ==========================
 * `_responsive.js` no se enlaza: INYECTA su hoja desde JS. Asi que para probar
 * que trocearlo no cambia la cascada no basta con leer archivos -- hay que
 * preguntarle al navegador.
 *
 * Esto carga el artefacto, deja que la home se asiente y captura el
 * `textContent` de TODOS los <style> del documento EN ORDEN, que es exactamente
 * lo que el navegador cascadea. Luego quita los comentarios y normaliza el
 * espacio: lo que tiene que quedar igual son las REGLAS y su ORDEN, no la prosa.
 *
 * Tambien lista los <style> con su id y su tamaño, porque un troceo mal enlazado
 * se ve antes ahi (una hoja de menos, o dos en el orden cambiado) que en el hash.
 *
 * Uso:  node css-huella-viva.js <repo> <archivo-de-salida>
 */
'use strict';

const { spawn } = require('child_process');
const io = require('fs');
const crypto = require('crypto');

const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3];
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8797;
const BASE = 'http://localhost:' + PORT;

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
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }, locale: 'es-ES', colorScheme: 'light',
    });
    await context.addInitScript(([c, e]) => {
      if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
    }, ['pace.state.v2', { firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema' }]);
    const page = await context.newPage();
    await page.goto(BASE + '/index.html');
    await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
    await page.waitForTimeout(1500);

    const hojas = await page.evaluate(() => [...document.querySelectorAll('style')].map((s, i) => ({
      i, id: s.id || '(sin id)', bytes: (s.textContent || '').length, css: s.textContent || '',
    })));

    await browser.close();

    console.log('<style> en el documento, EN ORDEN:');
    hojas.forEach(h => console.log('  ' + String(h.i).padStart(2) + '  '
      + h.id.padEnd(34) + String(h.bytes).padStart(7) + ' bytes'));

    const total = hojas.map(h => h.css).join('\n/*<<hoja>>*/\n');
    const reglas = total.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
    console.log('\nhojas: %d · CSS bruto: %d bytes · REGLAS normalizadas: %d bytes',
      hojas.length, total.length, reglas.length);
    console.log('sha256 de las reglas: %s',
      crypto.createHash('sha256').update(reglas).digest('hex').slice(0, 32));
    if (SALIDA) io.writeFileSync(SALIDA, reglas, 'utf8');
  } finally { srv.kill(); }
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
