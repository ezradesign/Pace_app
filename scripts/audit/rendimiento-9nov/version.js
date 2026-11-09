/* Banco 3 · el paso de una versión a otra con el service worker de verdad.
   0.194 instalada en dos pestañas (B en Respira) → el servidor pasa a la nueva → A recarga.
   Uso: node version.js [puerto] */
'use strict';
const WT = 'C:/Users/ezrav/Desktop/Proyectos/Desarrollo de aplicaciones/Pace_app/.claude/worktrees/caza-rendimiento-9nov';
const { chromium } = require(WT + '/node_modules/@playwright/test');
const { SEMILLA, CLAVE_ESTADO } = require(WT + '/tests/helpers.js');
const P = Number(process.argv[2] || 8911), U = 'http://localhost:' + P;
const ver = (v) => fetch(U + '/__version?to=' + v);
const version = (p) => p.evaluate(() => { const m = document.documentElement.outerHTML.match(/v?0\.19[45]\.0/g) || []; return [...new Set(m)].join(','); });
const aviso = (p) => p.getByText('Hay una versión nueva de PACE').isVisible().catch(() => false);
(async () => {
  const r = {};
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'es-ES', timezoneId: 'Europe/Madrid', colorScheme: 'light' });
  await ctx.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); }, [CLAVE_ESTADO, SEMILLA]);
  await ver('v194');
  const A = await ctx.newPage();
  await A.goto(U + '/');
  await A.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 60000 });
  r.instalada = { version: await version(A), caches: await A.evaluate(() => caches.keys()) };
  const B = await ctx.newPage();
  let navB = 0; B.on('framenavigated', (f) => { if (f === B.mainFrame()) navB++; });
  await B.goto(U + '/');
  await B.locator('[data-pace-dial-number]').waitFor();
  await B.getByRole('button', { name: /^Respira/ }).first().click();
  await B.getByRole('heading', { name: 'Suspiro fisiológico', exact: true }).first().click();
  const ya = B.locator('[data-pace-session-root]').getByRole('button', { name: 'Empezar ahora' });
  if (await ya.count()) await ya.click();
  await B.locator('[data-pace-breathe-phase]').waitFor();
  const navB0 = navB;
  await A.waitForTimeout(Number(process.env.IDLE || 0));
  const sw = []; await ctx.route('**/sw.js', (rt) => { sw.push(Date.now()); rt.continue(); });
  const t0 = Date.now();
  /* Sale la versión nueva. A no se entera hasta que navega (no hay reg.update() periódico). */
  await ver('despues');
  await A.waitForTimeout(Number(process.env.ESPERA || 8000));
  r.sinNavegar = { pidenSw: sw.map((x) => x - t0), avisoA: await aviso(A), avisoB: await aviso(B) };
  await A.reload();
  await A.locator('[data-pace-dial-number]').waitFor();
  await A.waitForFunction(() => window.__paceSwWaitingReg, null, { timeout: 60000 }).catch(() => {});
  await A.waitForTimeout(800);
  r.trasRecargar = { versionA: await version(A), avisoA: await aviso(A), avisoB: await aviso(B), caches: await A.evaluate(() => caches.keys()) };
  /* El mismo nombre de archivo con otro contenido: ¿qué copia sirve el SW que manda? */
  r.marca = await A.evaluate(async () => {
    const t = await (await fetch('/app/glyphs/assets/logros/streak.7.webp')).arrayBuffer();
    const sufijo = new TextDecoder().decode(new Uint8Array(t).slice(-11));
    return { bytes: t.byteLength, esLaNueva: sufijo === 'MARCA-NUEVA' };
  });
  /* «Actualizar» en A: ¿qué le pasa a B, que está a mitad de Respira? */
  await A.getByRole('button', { name: 'Actualizar' }).click();
  await A.waitForTimeout(5000);
  await B.waitForLoadState('load').catch(() => {});
  await B.waitForTimeout(1500);
  r.trasActualizar = {
    recargasB: navB - navB0,
    BsigueEnRespira: await B.locator('[data-pace-breathe-phase]').isVisible().catch(() => false),
    versionA: await version(A), versionB: await version(B),
    caches: await A.evaluate(() => caches.keys()),
    marcaA: await A.evaluate(async () => { const t = new Uint8Array(await (await fetch('/app/glyphs/assets/logros/streak.7.webp')).arrayBuffer()); return new TextDecoder().decode(t.slice(-11)) === 'MARCA-NUEVA'; }),
  };
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
