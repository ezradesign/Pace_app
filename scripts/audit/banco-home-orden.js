/* BANCO s166 · LA HOME, ANTES Y DESPUES DEL ORDEN UNICO
 * =====================================================
 * s166 pone el MISMO orden en las dos pieles —aro, Actividades, Camino— porque
 * el usuario miro las dos pantallas al lado y pidio que movil se pareciera a
 * web. Esto fotografia las dos pieles con el `index.html` de HEAD servido EN
 * PARALELO y el mismo estado sembrado, que es el metodo de s156/s159/s163: no
 * compara pixeles, porque lo que se juzga es diseño y lo juzga una persona.
 *
 * CONSUME LA SONDA DE LA SUITE (`tests/home.helpers.js`) Y NO UNA PROPIA, y esa
 * decision se pago con TRES lecturas falsas antes de tomarla:
 *   1. Leia `--pace-dial-d` de :root, donde no esta -> NaN en las diez vistas.
 *      Los tokens que publica el motor son `--pace-timer-d` y
 *      `--pace-activities-overlap`.
 *   2. Contaba como retroceso de foco el salto del ultimo control al primero,
 *      o sea el ciclo dando la vuelta -> un falso 1 en TODAS las vistas moviles,
 *      tambien en las de HEAD.
 *   3. Y la cara: esperaba 500 ms fijos en vez de a que el motor CALLE. El motor
 *      publica mas de una vez (pasada sincrona + hasta ocho iteraciones + un
 *      reintento de s156), asi que se media a media convergencia: a 375 salio un
 *      solapamiento de 64 en HEAD contra 54 en el arbol, y se REPORTO como un
 *      efecto del orden nuevo. No lo era -- con `asentarGeometria` los dos dan
 *      54, y el orden no mueve el solapamiento en ninguna vista.
 * Las tres estaban ya resueltas en `tests/home.helpers.js`, con su porque
 * escrito al lado. Reimplementarlas fue el error; esto lo deshace.
 *
 * QUE MIDE:
 *  · El ORDEN VISUAL real (por coordenada Y), no el del DOM.
 *  · Que el orden de TABULACION coincide con el visual — lo que s160 arreglo
 *    midiendo con Tab (622 -> 698 -> 496 era el fallo).
 *  · El aro, el solapamiento PUBLICADO y el REAL, y su diferencia: es el numero
 *    que dice si la composicion «atardecer» sigue sincronizada.
 *  · Si el chip lleva subtitulo, que es lo que separa la home que el usuario ve
 *    en su telefono de la que sale en las capturas de 375 y 390.
 *
 * Uso:  node banco-home-orden.js <repo> <salida> [copia-de-HEAD.html]
 *   (la copia: `git show HEAD:index.html > _revision-head.html`, gitignorado)
 */
'use strict';

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const REPO = process.argv[2] || process.cwd();
const SALIDA = process.argv[3] || path.join(REPO, '_revision-home-orden');
const HEAD_HTML = process.argv[4] || null;
const { chromium } = require(require.resolve('@playwright/test', { paths: [REPO] }));
const { sonda, px, asentarGeometria } = require(path.resolve(REPO, 'tests', 'home.helpers.js'))  /* resolve y no join: con REPO='.' un join da una ruta RELATIVA y require la busca junto a este archivo, no en el repo */;

const PORT = 8801;
const BASE = 'http://localhost:' + PORT;

const VISTAS = [
  { id: 'movil-360x800',  w: 360,  h: 800, movil: true },   // el ancho del telefono del usuario
  { id: 'movil-375x812',  w: 375,  h: 812, movil: true },
  { id: 'movil-390x844',  w: 390,  h: 844, movil: true },
  { id: 'movil-320x568',  w: 320,  h: 568, movil: true },
  { id: 'web-1280x800',   w: 1280, h: 800, movil: false },
];

async function nuevaPagina(browser, vista) {
  const context = await browser.newContext({
    viewport: { width: vista.w, height: vista.h },
    locale: 'es-ES', colorScheme: 'light', deviceScaleFactor: 2,
    isMobile: vista.movil, hasTouch: vista.movil,
  });
  await context.addInitScript(([c, e]) => {
    if (!localStorage.getItem(c)) localStorage.setItem(c, JSON.stringify(e));
  }, ['pace.state.v2', {
    firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', paletteAuto: false,
    sidebarCollapsed: true,
    _weeklyStatsReindexed_v0_28_8: true, _historyRecalculated_v0_28_8: true,
    _historyMigrated: true, lastActiveDay: new Date().toDateString(),
  }]);
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });
  return { context, page, errores };
}

/* El orden de TABULACION, recorrido con Tab de verdad. Se corta al repetirse la
   primera firma porque el foco DA LA VUELTA y ese salto no es un retroceso --
   la trampa la tenia escrita `tests/home-a11y.spec.js` y aqui se copia. */
async function ordenDeFoco(page) {
  const visto = new Set();
  const tops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const p = await page.evaluate(() => {
      const a = document.activeElement;
      const stack = document.querySelector('[data-pace-home-stack]');
      if (!a || a === document.body || !stack || !stack.contains(a)) return null;
      const r = a.getBoundingClientRect();
      return { top: Math.round(r.top), texto: (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 30) };
    });
    if (!p) continue;
    const firma = p.texto + '@' + p.top;
    if (visto.has(firma)) break;
    visto.add(firma);
    tops.push(p.top);
  }
  let retrocesos = 0;
  for (let i = 1; i < tops.length; i++) if (tops[i] < tops[i - 1]) retrocesos++;
  return { retrocesos, paradas: tops.length };
}

const subtituloVisible = page => page.evaluate(() => {
  const s = document.querySelector('[data-pace-chip-sub]');
  return s ? getComputedStyle(s).display !== 'none' : false;
});

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const srv = spawn(process.execPath, ['.claude/static-server.js'], {
    cwd: REPO, env: Object.assign({}, process.env, { PORT: String(PORT) }), stdio: 'ignore',
  });
  const errores = [];
  const filas = [];
  let medidas = 0;
  try {
    for (let i = 0; i < 60; i++) {
      try { const r = await fetch(BASE + '/index.html', { method: 'HEAD' }); if (r.ok) break; }
      catch (e) {}
      await new Promise(r => setTimeout(r, 200));
    }
    const browser = await chromium.launch();
    for (const vista of VISTAS) {
      for (const [etiqueta, artefacto] of [['hoy', HEAD_HTML], ['nuevo', '/index.html']]) {
        if (!artefacto) continue;
        const { context, page, errores: errs } = await nuevaPagina(browser, vista);
        const nombre = vista.id + '-' + etiqueta;
        try {
          await page.goto(BASE + (artefacto.startsWith('/') ? artefacto : '/' + artefacto));
          await page.locator('[data-pace-dial-number]').waitFor({ state: 'visible' });
          await asentarGeometria(page);          // <- la leccion 3
          const m = await sonda(page);
          const sub = await subtituloVisible(page);
          const f = await ordenDeFoco(page);
          medidas++;
          filas.push({
            vista: nombre,
            orden: m.ordenVisual,
            D: px(m.D),
            solape: px(m.solape),
            solapeReal: m.solapeReal,
            sub,
            retrocesos: f.retrocesos,
            paradas: f.paradas,
            /* Si la home DESBORDA en vertical, tabular arrastra el viewport y los
               tops se mueven bajo los pies del recorrido: alli el numero de
               retrocesos NO es de fiar y hay que decirlo, no taparlo. */
            desbordeV: m.desbordeV,
          });
          await page.screenshot({ path: path.join(SALIDA, nombre + '.png'), animations: 'disabled' });
        } catch (e) {
          errores.push(nombre + ': ' + e.message);
        }
        errores.push(...errs.map(e => nombre + ': ' + e));
        await context.close();
      }
    }
    await browser.close();
  } finally { srv.kill(); }

  console.log('\n  vista                   orden visual       aro  solape   real   dif   sub  retroc  paradas  scrollV');
  console.log('  ' + '-'.repeat(98));
  let descuadres = 0;
  for (const f of filas) {
    const dif = (f.solape != null && f.solapeReal != null) ? +(f.solapeReal - f.solape).toFixed(1) : null;
    if (dif != null && Math.abs(dif) > 1) descuadres++;
    console.log(
      '  ' + f.vista.padEnd(24) + String(f.orden).padEnd(19) +
      String(f.D).padStart(4) + String(f.solape).padStart(7) +
      String(f.solapeReal).padStart(7) + String(dif).padStart(6) +
      (f.sub ? '    si' : '    NO') + String(f.retrocesos).padStart(7) + String(f.paradas).padStart(8) + String(f.desbordeV).padStart(9)
    );
  }

  console.log('\n  medidas: ' + medidas + ' de ' + (VISTAS.length * (HEAD_HTML ? 2 : 1)));
  console.log('  solapamiento publicado != real (>1 px): ' + descuadres);
  console.log('  retrocesos de foco: ' + filas.reduce((a, f) => a + f.retrocesos, 0));
  console.log('  consola: ' + (errores.length === 0 ? 'LIMPIA' : '\n    ' + errores.join('\n    ')));
  console.log('\n  capturas en ' + SALIDA);

  /* GUARD DE CERO: sin paradas de foco, el «0 retrocesos» no vale nada. */
  const sinParadas = filas.filter(f => f.paradas < 4);
  if (!medidas) { console.error('  BANCO ROTO: cero medidas'); process.exit(1); }
  if (sinParadas.length) {
    console.error('  BANCO ROTO: ' + sinParadas.map(f => f.vista).join(', ')
      + ' no encontraron controles dentro de la home -- su 0 de retrocesos es vacio');
    process.exit(1);
  }
  process.exit(errores.length || descuadres ? 1 : 0);
})().catch(e => { console.error('BANCO ROTO:', e.message); process.exit(1); });
