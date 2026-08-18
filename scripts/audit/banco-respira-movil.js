/* BANCO s166 · ¿CABE EN MOVIL LA BARRA DE PROGRESO DE RESPIRA?
 * ===========================================================
 * s165 dejo esto declarado como NO CUBIERTO, con una sospecha razonable
 * escrita: «con maxWidth: 260 el caso de 5 rondas aprieta mas». Todo lo de s165
 * se midio a 1280x800. Esto lo mide donde se dudaba.
 *
 * LA PRIMERA VERSION DE ESTE BANCO MINTIO, y la mentira se cazo con el rojo:
 * medir «¿desborda la fila a su padre?» es una TAUTOLOGIA, porque la barra es
 * `width: 100%` de ese padre. Se saboteo la fuente subiendo `maxWidth` de 260 a
 * 600 y el banco siguio diciendo «0 desbordes» en las 15 escenas — solo que con
 * la barra a 374 px. Un detector que no puede decir que si no esta midiendo.
 * De ahi que lo que se mira ahora sea otra cosa, y que lleve CONTROL POSITIVO.
 *
 * QUE MIDE, y por que:
 *  · ANCHO DE CADA SEGMENTO. Es lo unico que decide si «aprieta»: con 5 rondas
 *    y `gap: 4` el reparto es (W - 16) / 5. Es la pregunta de s165.
 *  · QUE LA BARRA ENTRE ENTERA EN EL VIEWPORT. Este si puede fallar, y es el
 *    riesgo de movil de verdad: no el ancho, sino el ALTO. La barra vive al
 *    final de SessionShell con `flexShrink: 0`, asi que en una pantalla corta
 *    lo que pasa es que se sale por abajo, no que se estreche.
 *
 * CONTROL POSITIVO (escena `control-*`): un viewport deliberadamente bajito.
 * TIENE que salir fuera de vista. Si el control no cae, el detector esta roto y
 * el banco sale con 1 aunque todo lo demas este verde -- es la unica forma de
 * que «0 fuera de vista» signifique algo.
 *
 * TRAMPAS HEREDADAS de los bancos de s164/s165, todas ya pagadas alli:
 *  · Un `fastForward` grande NO avanza la sesion: el ticker se resuscribe por
 *    fase. De 1 s en 1 s.
 *  · La tecnica se abre por su HEADING: un boton por /Empezar/ caza el
 *    «Empezar foco» de la home que esta detras (trampa de s154).
 *  · El modal de apnea nace con el boton DISABLED hasta marcar la casilla.
 *  · Las rutinas de 3 y 5 rondas son PREMIUM: sin sembrar el flag no se abren,
 *    y el caso peor es justo una de ellas.
 *  · `animations:'disabled'` en la captura: el loto escala en tiempo REAL
 *    aunque el reloj sea virtual.
 *
 * GUARD DE CERO: si una escena no llega a medir, el banco SALE CON 1.
 *
 * Uso:  node banco-respira-movil.js <repo> <salida>
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-respira-movil');
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));

const PORT = 8799;
const BASE = 'http://localhost:' + PORT;

/* Suelo de legibilidad de un segmento. No es un gusto: la barra mide 5 px de
   alto, asi que por debajo de ~12 px de ancho un segmento deja de leerse como
   segmento y pasa a ser un punto. Nunca se ha cruzado; esta para que se note
   el dia que una rutina nueva traiga muchas rondas. */
const SUELO_SEGMENTO = 12;

const RUTINAS = [
  { id: 'rondas5', nombre: 'Rondas profundas', rondas: 5, premium: true },  // el caso peor
  { id: 'rondas2', nombre: 'Rondas express',   rondas: 2 },
  { id: 'tiempo',  nombre: 'Box 4·4·4·4',      rondas: 0 },
];

/* Los cuatro anchos que ya vigila la suite (home-geometria) mas uno grande,
   todos con alto de telefono real. Y el CONTROL POSITIVO al final. */
const ESCENAS = [];
for (const rutina of RUTINAS) {
  for (const [w, h] of [[320, 568], [360, 640], [375, 812], [390, 844], [414, 896]]) {
    ESCENAS.push({ rutina, w, h, control: false });
  }
}
ESCENAS.push({ rutina: RUTINAS[0], w: 320, h: 300, control: true });

async function nuevaPagina(browser, escena) {
  const context = await browser.newContext({
    viewport: { width: escena.w, height: escena.h },
    locale: 'es-ES', colorScheme: 'light', deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
  });
  await context.addInitScript(([c, e]) => {
    if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema',
    premiumUnlocked: !!escena.rutina.premium, sidebarCollapsed: true,
  }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { context, page, errores };
}

async function conducir(page, rutina) {
  await page.clock.install();
  await page.goto(BASE + '/index.html');
  await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /^Respira/ }).click();
  await page.getByRole('heading', { name: rutina.nombre, exact: true }).click();
  const modal = page.locator('[data-pace-modal-backdrop]');
  if (await modal.count()) {
    await modal.locator('input[type=checkbox]').check();
    await modal.getByRole('button', { name: 'Empezar sesión' }).click();
  }
  await page.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' }).click();
  for (let s = 0; s < 6; s++) { await page.clock.fastForward(1000); await page.waitForTimeout(20); }
  await page.waitForTimeout(250);
}

const medir = page => page.evaluate(() => {
  const b = document.querySelector('[data-pace-breathe-progress]');
  if (!b) return null;
  const r = b.getBoundingClientRect();
  const segs = [...b.children].map(c => Math.round(c.getBoundingClientRect().width * 10) / 10);
  const alto = window.innerHeight;
  return {
    barraAncho: Math.round(r.width * 10) / 10,
    barraAlto: Math.round(r.height * 10) / 10,
    segmentos: segs,
    segMin: segs.length ? Math.min(...segs) : null,
    /* El riesgo REAL de movil: que se salga por abajo, no que se estreche. */
    bordeInferior: Math.round(r.bottom * 10) / 10,
    viewportAlto: alto,
    holguraAbajo: Math.round((alto - r.bottom) * 10) / 10,
    fueraDeVista: r.bottom > alto + 0.5 || r.top < -0.5,
  };
});

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  let medidas = 0;
  const errores = [];
  const filas = [];
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    for (const escena of ESCENAS) {
      const { context, page, errores: errs } = await nuevaPagina(browser, escena);
      const etiqueta = (escena.control ? 'control-' : '') + escena.rutina.id + '-' + escena.w + 'x' + escena.h;
      try {
        await conducir(page, escena.rutina);
        const m = await medir(page);
        if (!m) throw new Error('la barra no existe en pantalla');
        medidas++;
        filas.push(Object.assign({ escena: etiqueta, control: escena.control }, m));
        await page.screenshot({ path: path.join(SALIDA, etiqueta + '.png'), animations: 'disabled' });
      } catch (e) {
        errores.push(etiqueta + ': ' + e.message);
      }
      errores.push(...errs.map(e => etiqueta + ': ' + e));
      await context.close();
    }
    await browser.close();
  } finally { srv.kill(); }

  console.log('\n  escena                    barra  seg.min  segmentos                   holgura   fuera');
  console.log('  ' + '-'.repeat(96));
  for (const f of filas) {
    console.log(
      '  ' + f.escena.padEnd(24) + String(f.barraAncho).padStart(6) +
      String(f.segMin).padStart(9) + '  ' + JSON.stringify(f.segmentos).padEnd(28) +
      String(f.holguraAbajo).padStart(7) + '   ' + (f.fueraDeVista ? 'SI' : 'no')
    );
  }

  const reales   = filas.filter(f => !f.control);
  const controls = filas.filter(f => f.control);
  const fueraReales = reales.filter(f => f.fueraDeVista);
  const estrechos   = reales.filter(f => f.segMin !== null && f.segMin < SUELO_SEGMENTO);

  console.log('\n  medidas: ' + medidas + ' de ' + ESCENAS.length + ' escenas');
  console.log('  fuera de vista (escenas reales): ' + fueraReales.length);
  console.log('  segmentos por debajo de ' + SUELO_SEGMENTO + ' px: ' + estrechos.length +
              (reales.length ? '  (el mas estrecho: ' + Math.min(...reales.map(f => f.segMin === null ? Infinity : f.segMin)) + ' px)' : ''));
  console.log('  consola: ' + (errores.length === 0 ? 'LIMPIA' : '\n    ' + errores.join('\n    ')));

  /* GUARD DE CERO + CONTROL POSITIVO. El primero dice que se midio; el segundo,
     que el detector sabe decir que SI. Sin los dos, un cero no vale nada. */
  let roto = false;
  if (medidas !== ESCENAS.length) {
    console.error('\n  BANCO ROTO: se esperaban ' + ESCENAS.length + ' medidas y salieron ' + medidas);
    roto = true;
  }
  if (!controls.length || !controls.every(f => f.fueraDeVista)) {
    console.error('\n  BANCO ROTO: el CONTROL POSITIVO no cayo -- el detector de «fuera de vista»\n' +
                  '  no sabe decir que SI, asi que un 0 en las escenas reales no significa nada.');
    roto = true;
  } else {
    console.log('  control positivo: CAE (el detector sabe decir que si)');
  }

  console.log('\n  capturas en ' + SALIDA);
  process.exit(roto || fueraReales.length || estrechos.length || errores.length ? 1 : 0);
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
