/* BANCO s165 · EL ANTES Y EL DESPUES DEL PROGRESO DE RESPIRA
 * ==========================================================
 * Fotografia las tres pantallas que s165 cambia, con el `index.html` de HEAD
 * servido EN PARALELO desde el mismo servidor y con el mismo estado sembrado —
 * el metodo de s156/s159/s163. No compara pixeles: aqui lo que se busca es
 * poder mirar las dos, porque el cambio es de diseño y lo juzga una persona.
 *
 * (Su primera version, de esta misma sesion, fotografiaba las variantes con
 * puntos; la decision acabo en barra segmentada y este banco se reescribio.)
 *
 * TRAMPAS MEDIDAS, todas cazadas en esta sesion:
 *  · Un `fastForward` grande NO avanza la sesion: el ticker se resuscribe por
 *    fase y necesita un render entre ticks. De 1 s en 1 s.
 *  · `animations:'disabled'` NO es cosmetica: el loto escala con la fase y en
 *    tiempo REAL aunque el reloj sea virtual, asi que sin congelar, dos fotos
 *    tomadas con medio segundo de diferencia traen el loto de distinto tamaño y
 *    meten una variable ajena en la comparacion.
 *  · Las rondas se fotografian en la RONDA 2: en la primera no hay ni un bloque
 *    completado y la barra segmentada se veria vacia.
 *  · La tecnica se abre por su HEADING (un boton por /Empezar/ caza el «Empezar
 *    foco» de la home, detras del modal — trampa de s154).
 *  · El modal de apnea nace con el boton DISABLED hasta marcar la casilla.
 *
 * Uso:  node banco-respira-capturas.js <repo> <salida> [copia-de-HEAD.html]
 *   (la copia se hace con `git show HEAD:index.html > _revision-head.html`,
 *    que esta gitignorado)
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-respira');
const HEAD_HTML = process.argv[4] || null;
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8797;
const BASE = 'http://localhost:' + PORT;

const ESCENAS = [
  { id: 'rondas-2', rutina: 'Rondas express', rondas: 2, segundos: 30 },
  { id: 'rondas-5', rutina: 'Rondas profundas', rondas: 5, premium: true, segundos: 30 },
  { id: 'tiempo', rutina: 'Box 4·4·4·4', segundos: 90 },
];

async function nuevaPagina(browser, premium) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, locale: 'es-ES', colorScheme: 'light', deviceScaleFactor: 2,
  });
  await context.addInitScript(([c, e]) => {
    localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', premiumUnlocked: !!premium,
  }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { context, page, errores };
}

async function avanzar(page, n) {
  for (let s = 0; s < n; s++) { await page.clock.fastForward(1000); await page.waitForTimeout(20); }
}

async function conducir(page, artefacto, escena) {
  await page.clock.install();
  await page.goto(BASE + artefacto);
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: escena.rutina, exact: true }).click();
  const modal = page.locator('[data-pace-modal-backdrop]');
  if (await modal.count()) {
    await modal.locator('input[type=checkbox]').check();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  await page.waitForTimeout(200);
  /* Hasta la ronda 2, cruzando la retencion por su boton. */
  if (escena.rondas) {
    await avanzar(page, 200);
    await page.getByRole('button', { name: 'Respirar de nuevo' }).click();
    await page.waitForTimeout(150);
  }
  await avanzar(page, escena.segundos);
  await page.waitForTimeout(400);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const errores = [];
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    for (const escena of ESCENAS) {
      for (const [etiqueta, artefacto] of [['hoy', HEAD_HTML], ['nuevo', '/index.html']]) {
        if (!artefacto) continue;
        const { context, page, errores: errs } = await nuevaPagina(browser, escena.premium);
        await conducir(page, artefacto, escena);
        const nombre = escena.id + '-' + etiqueta;
        await page.screenshot({ path: path.join(SALIDA, nombre + '.png'), animations: 'disabled' });
        console.log('  · ' + nombre);
        errores.push(...errs.map(e => nombre + ': ' + e));
        await context.close();
      }
    }
    await browser.close();
    console.log('\nconsola: ' + (errores.length === 0 ? 'LIMPIA en todas las pasadas' : errores.join('\n  ')));
  } finally { srv.kill(); }
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
