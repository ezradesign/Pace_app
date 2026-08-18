/* REVISION A TAMAÑO REAL de los 19 sellos nuevos (s167).
   La leccion de s147: la revision al tamaño real ES el detector. Ahi salieron
   el sello flotando 11 px y el moteado del tramado, y ninguna red los vio. */
const { chromium } = require('playwright');
/* La semilla y la clave se CONSUMEN de la suite, no se copian: la primera
   version invento `onboarded: true` y la app arranco en el ONBOARDING -- la
   captura no enseñaba el panel y el guard de cero no lo vio, porque los 77
   sellos si estaban pintados detras. El helper lo avisa por escrito: lo que
   abre el onboarding es `firstSeen == null` (helpers.js:16). */
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');
const SALIDA = process.argv[2];
const NUEVOS = ['explore.atg','master.atg.20','hydrate.week.perfect','master.long.focus',
  'explore.neck','explore.desk','explore.all.move','master.rounds.15','secret.dark.mode',
  'master.hips.20','master.extra.all.week','explore.ancestral','master.hydrate.90',
  'master.ancestral.10','season.equinox.autumn','master.midnight.never','secret.lunch',
  'master.hydrate.30','season.autumn'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2, locale: 'es-ES' });
  const ach = {}; NUEVOS.forEach(id => { ach[id] = Date.now(); });
  await ctx.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)),
    [CLAVE_ESTADO, Object.assign({}, SEMILLA, {
      achievements: ach,
      /* Guards de migracion (s166): sin ellos `loadState` rota la semana un dia. */
      _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
      _historyMigrated: true, lastActiveDay: new Date().toDateString(),
    })]);
  const page = await ctx.newPage();
  const errores = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await page.goto('http://localhost:8765/index.html');
  await page.waitForSelector('[data-pace-home]', { timeout: 15000 }).catch(() => {});
  /* El panel se abre por EVENTO, no por un boton con texto: la sidebar hace
     `dispatchEvent(new CustomEvent('pace:open-achievements'))` (Sidebar.jsx:123).
     Buscarlo por rol y nombre fallo -- el texto del enlace es «te quedan N». */
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop]', { timeout: 10000 });
  await page.waitForTimeout(900);

  /* GUARD DE CERO: si no hay sellos pintados, la captura no ha revisado nada. */
  /* GUARD REFORZADO: contar mascaras NO basta -- la primera version conto 77
     con la app en el onboarding, porque el panel renderiza detras. Se exige
     ademas que el modal de LOGROS este visible y traiga su cabecera. */
  const cab = await page.locator('[data-pace-modal-backdrop]').last().innerText();
  if (!/Logros/i.test(cab)) { console.error('REVISION ROTA: el overlay superior no es el panel de Logros'); process.exit(1); }

  const pintados = await page.evaluate(ids => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const m = getComputedStyle(el).webkitMaskImage || getComputedStyle(el).maskImage;
      if (m && m !== 'none' && /logros/.test(m)) out.push(m.match(/logros\/([^.]+(?:\.[^.]+)*)\.webp/)?.[1] || '?');
    }
    return { total: out.length, deLos19: out.filter(x => ids.includes(x)).length, muestra: out.slice(0, 3) };
  }, NUEVOS);
  console.log('sellos con mascara pintados: ' + pintados.total + '  · de los 19 nuevos: ' + pintados.deLos19);
  if (!pintados.total) { console.error('REVISION ROTA: cero mascaras pintadas'); process.exit(1); }

  const modal = page.locator('[data-pace-modal-backdrop]').last();
  await modal.screenshot({ path: SALIDA });
  console.log('errores de consola: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  await b.close();
})();
