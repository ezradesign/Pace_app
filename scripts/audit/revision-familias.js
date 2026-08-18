/* PACE · scripts/audit/revision-familias.js (sesion 168)
   Hoja de revision de LAS FAMILIAS del catalogo, para decidir MIRANDO.

   s168 partio «maestria» en dos y disolvio «estadisticas», asi que nace «La
   jornada» y hereda el token que solto la familia disuelta (`--hydrate`). Un
   color no se aprueba leyendo su nombre: esta hoja pinta el panel de verdad,
   con las siete cabeceras y sus sellos, al tamaño al que se mira.

   Uso:  node .claude/static-server.js &
         node scripts/audit/revision-familias.js <salida.png> [ancho]

   La semilla y la clave se CONSUMEN de la suite (tests/helpers.js), no se
   copian: en s167 una semilla inventada arranco la app en el ONBOARDING y la
   captura no enseñaba el panel, con el guard de cero tan contento porque los
   sellos si estaban pintados detras. */
'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { CLAVE_ESTADO, SEMILLA } = require('../../tests/helpers.js');

const ROOT = path.resolve(__dirname, '..', '..');
const SALIDA = process.argv[2] || path.join(ROOT, '_revision-familias.png');
const ANCHO = parseInt(process.argv[3] || '1280', 10);

/* Las familias esperadas salen del CATALOGO, no de una lista escrita aqui:
   si mañana cambian, la hoja cambia con ellas y no miente. */
const sb = { window: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'app', 'achievements', 'catalog.js'), 'utf8'), sb);
const CAT = sb.window.ACHIEVEMENT_CATALOG || [];
const META = sb.window.CAT_META || {};
if (!CAT.length || !Object.keys(META).length) {
  console.error('HOJA ROTA: el catalogo sale vacio'); process.exit(1);
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: ANCHO, height: 900 },
    deviceScaleFactor: 2, locale: 'es-ES' });

  /* TODOS desbloqueados a proposito: un sello bloqueado se pinta con `--ink-3`
     y entonces la hoja no diria nada del color de su familia, que es lo que se
     viene a mirar. No es la vista de un usuario real y no pretende serlo. */
  const ach = {};
  CAT.forEach(a => { ach[a.id] = Date.now(); });
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
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  await page.goto('http://localhost:8765/index.html');
  await page.waitForSelector('[data-pace-home-body]', { timeout: 15000 });
  /* El panel se abre por EVENTO (Sidebar.jsx): por rol y nombre no se encuentra. */
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('pace:open-achievements')));
  await page.waitForSelector('[data-pace-modal-backdrop]', { timeout: 10000 });
  await page.waitForTimeout(900);

  const modal = page.locator('[data-pace-modal-backdrop]').last();
  const texto = await modal.innerText();
  if (!/Logros/i.test(texto)) {
    console.error('HOJA ROTA: el overlay de arriba no es el panel de Logros'); process.exit(1);
  }

  /* GUARD DE CERO Y DE COMPLETITUD. «No falta ninguna» no basta: en s167 un
     guard dio por bueno 20 tarjetas para 19 logros. Aqui se exige la
     BIYECCION -- ni una cabecera de menos ni una de mas -- y comparando por
     NODO EXACTO, porque `includes` casaria «Exploracion» dentro de otra. */
  const esperadas = Object.keys(META).map(c => {
    const k = META[c].labelKey;
    return { cat: c, etiqueta: (sb.window.PACE_STRINGS && sb.window.PACE_STRINGS.es[k]) || k };
  });
  const vistas = await page.evaluate(() =>
    [...document.querySelectorAll('[data-pace-ach-cat]')].map(el => ({
      cat: el.getAttribute('data-pace-ach-cat'),
      etiqueta: (el.querySelector('h3, h4, [data-pace-ach-cat-label]') || el).textContent.trim(),
      sellos: el.querySelectorAll('[data-pace-ach]').length,
    })));

  if (!vistas.length) {
    console.error('HOJA ROTA: cero familias en el DOM -- no se ha revisado nada'); process.exit(1);
  }
  const faltan = esperadas.filter(e => !vistas.some(v => v.cat === e.cat));
  const sobran = vistas.filter(v => !esperadas.some(e => e.cat === v.cat));
  if (faltan.length || sobran.length) {
    console.error('HOJA ROTA: familias que faltan [' + faltan.map(f => f.cat).join(', ') +
                  '] y que sobran [' + sobran.map(s => s.cat).join(', ') + ']');
    process.exit(1);
  }
  const totalSellos = vistas.reduce((n, v) => n + v.sellos, 0);
  if (totalSellos !== CAT.length) {
    console.error('HOJA ROTA: ' + totalSellos + ' sellos pintados contra ' + CAT.length + ' del catalogo');
    process.exit(1);
  }

  console.log('familias pintadas: ' + vistas.length + ' · sellos: ' + totalSellos);
  vistas.forEach(v => console.log('  ' + String(v.sellos).padStart(3) + '  ' + v.cat.padEnd(13) + v.etiqueta));

  /* EL PANEL TIENE SCROLL PROPIO: con un viewport normal, `screenshot` sobre el
     modal devuelve lo VISIBLE y recorta el resto sin decir nada -- la primera
     pasada de s168 salio cortada por «Constancia» y parecia una captura buena.
     Se mide el alto real, se agranda la ventana y se COMPRUEBA que ha entrado. */
  /* Converge en varias pasadas a proposito: la caja del modal es un PORCENTAJE
     del viewport, asi que agrandar la ventana la agranda tambien a ella y de un
     solo salto no entra nunca (a 90vh, con contenido de mas de 2880 px, la
     cuenta no alcanza jamas). Se mide, se crece, se vuelve a medir. */
  const sobra = () => page.evaluate(() => {
    const m = [...document.querySelectorAll('[data-pace-modal-backdrop]')].pop();
    const sc = [...m.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 8);
    return sc ? sc.scrollHeight - sc.clientHeight : 0;
  });
  let vh = 900;
  for (let i = 0; i < 8; i++) {
    const falta = await sobra();
    if (falta <= 8) break;
    vh = Math.min(16000, vh + falta + 200);
    await page.setViewportSize({ width: ANCHO, height: vh });
    await page.waitForTimeout(400);
  }
  const restante = await sobra();
  if (restante > 8) {
    console.error('HOJA ROTA: siguen quedando ' + restante + ' px fuera de la captura -- estaria recortada');
    process.exit(1);
  }
  await modal.screenshot({ path: SALIDA });
  console.log('captura -> ' + SALIDA + '  (ancho ' + ANCHO + ')');
  console.log('errores de consola: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  await b.close();
})();
