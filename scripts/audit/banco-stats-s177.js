/* PACE · scripts/audit/banco-stats-s177.js (sesión 177)
   =====================================================
   EL CALENDARIO DE STATS, MEDIDO Y CON VARIANTES SOBRE LA APP DE VERDAD.

   LO QUE REPORTO EL USUARIO, en escritorio: «la vista de calendario podia
   ajustarse mas al tamanio de la ventana para que no quede todo tan reducido».

   LO QUE HAY QUE MEDIR, y son tres cosas distintas que se confunden:
     · el ANCHO del modal -- `maxWidth={820}` en StatsPanel.jsx, cuando las tres
       bibliotecas usan 1240 desde s176
     · el TAMANIO DE CELDA del ano -- 11x11 px CABLEADOS con gap 2, o sea 53
       columnas x 13 = 689 px pase lo que pase con la ventana
     · el HUECO MUERTO: la caja comun de s176 mide 385 px de alto y la rejilla
       del ano solo ocupa 7 filas x 13 = 91, asi que sobran ~200 px por debajo

   LA RESTRICCION QUE NO SE PUEDE ROMPER: las cuatro pestanias comparten caja y
   ninguna lleva scroll (s176, pedido por el propio usuario -- «cambiar entre
   pestanias y que varie el tamanio se queda un poco raro»). Cualquier variante
   que ensanche o estire SOLO en «Anio» esta descartada por contradecir eso, y
   este banco lo mide en las CUATRO para que se vea.

   Uso: node scripts/audit/banco-stats-s177.js [puerto] [ancho] [alto]
        (necesita el servidor: node .claude/static-server.js)
*/
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(path.join(ROOT, 'node_modules', 'playwright'));

const PUERTO = process.argv[2] || '8765';
const W = parseInt(process.argv[3] || '1536', 10);
const H = parseInt(process.argv[4] || '714', 10);
const SOLO = (process.argv[5] || '').split(',').filter(Boolean);
const SALIDA = path.join(ROOT, '_maqueta-s177-stats');

const PESTANIAS = ['Semana', 'Mes', 'Año', 'Caminos'];

/* ── las variantes ───────────────────────────────────────────────────────── */
/* El modal ancho. `maxWidth` es un estilo EN LINEA del shell, de ahi el
   !important; se sube a 1240, que es lo que usan las tres bibliotecas. */
const ANCHO = [
  '[data-pace-modal-card]:has([data-pace-stats-vistas]) { max-width: 1240px !important; }',
].join('\n');

/* LA CELDA DEL ANIO, ESCALADA. No se puede hacer solo con CSS -- el tamanio va
   en estilos en linea por celda-- asi que la variante lo fuerza con un factor
   de `zoom` sobre la rejilla, que SI afecta al layout. Es una maqueta: la
   implementacion tendra que calcular la celda desde el ancho disponible. */
const escala = (f) => '[data-pace-year-grid-wrap] { zoom: ' + f + '; }';

/* Centrar la vista en su caja: el hueco muerto deja de caer todo abajo. */
const CENTRAR = [
  '[data-pace-stats-vistas] { display: flex !important; flex-direction: column !important;',
  '  justify-content: center !important; }',
].join('\n');


/* EL MES TAMBIEN CRECE. Con el modal a 1240 y solo el anio escalado, la rejilla
   del mes se queda en 7 columnas de 42 px centradas en 1174: se ve perdida.
   La celda pasa a 64 y el hueco a 8, o sea 7x64 + 6x8 = 496 px de rejilla. */
const MES = (c, g) => [
  '.pace-heatmap-cell, .pace-heatmap-empty { width: ' + c + 'px !important; height: ' + c + 'px !important; }',
  '.pace-heatmap-grid { grid-template-columns: repeat(7, ' + c + 'px) !important; gap: ' + g + 'px !important; }',
  '.pace-heatmap-header-day { width: ' + c + 'px !important; }',
  '.pace-heatmap-day-num { font-size: 14px !important; }',
].join('\n');

const VARIANTES = {
  hoy: { titulo: 'HOY · v0.106.0', css: '' },
  a: { titulo: 'A · modal 1240, celda igual', css: ANCHO },
  b: { titulo: 'B · modal 1240 + calendario escalado al ancho', css: ANCHO + '\n' + escala(1.65) },
  c: { titulo: 'C · B + la vista centrada en su caja', css: ANCHO + '\n' + escala(1.65) + '\n' + CENTRAR },
  d: { titulo: 'D · modal 820 (igual) + calendario escalado', css: escala(1.15) + '\n' + CENTRAR },
  e: { titulo: 'E · C + el mes también crece (celda 64)', css: ANCHO + '\n' + escala(1.65) + '\n' + CENTRAR + '\n' + MES(64, 8) },
  /* LA QUE DE VERDAD RESUELVE LAS DOS COSAS. El anio necesita ANCHO -- 53
     columnas-- y el mes NO puede crecer nada (cualquier celda por encima de 42
     rompe la caja comun de 385). Ensanchar el modal para los dos deja el mes
     pequenio y perdido en 1174 px. Asi que el modal se ensancha, el anio se
     lleva todo el ancho, y las vistas que NO son el anio se acotan a una
     columna de lectura y se centran. El `:has()` distingue una vista de otra
     sin tocar el JSX. */
  h: { titulo: 'H · modal 1240; el año usa todo, el resto se acota', css:
    ANCHO + '\n' + escala(1.65) + '\n' + CENTRAR + '\n'
    + '[data-pace-stats-vistas]:not(:has([data-pace-year-grid-wrap])) > * {'
    + '  max-width: 820px !important; margin-left: auto !important; margin-right: auto !important; }' },
  /* EL MES SOLO PUEDE CRECER HASTA LO QUE QUEPA EN 385. Seis filas mas la
     cabecera: con celda 64 la vista se va a 527,4 px y con 56 a 474,4, o sea
     que E y F devuelven el salto entre pestanias que s176 quito. 48 px de celda
     dan 6 x 54 = 324 mas cabecera, que es lo maximo que entra. */
  g: { titulo: 'G · C + el mes crece LO QUE CABE (celda 48)', css: ANCHO + '\n' + escala(1.65) + '\n' + CENTRAR + '\n' + MES(48, 6) },
  f: { titulo: 'F · modal 1040 intermedio, los dos crecen', css:
    '[data-pace-modal-card]:has([data-pace-stats-vistas]) { max-width: 1040px !important; }\n'
    + escala(1.4) + '\n' + CENTRAR + '\n' + MES(56, 7) },
};

/* ── la medida ───────────────────────────────────────────────────────────── */
function medir() {
  const vis = (s) => [...document.querySelectorAll(s)]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })[0] || null;
  const caja = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return {
      w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10,
    };
  };
  /* El modal de Stats es el ULTIMO con caja no nula: si hubiera otro debajo,
     `querySelector` devolveria el de abajo (trampa de s176). */
  const modales = [...document.querySelectorAll('[data-pace-modal-card]')]
    .filter(e => e.getBoundingClientRect().width > 0);
  const modal = modales.length ? modales[modales.length - 1] : null;
  const vista = vis('[data-pace-stats-vistas]');
  const rejilla = vis('[data-pace-year-grid-wrap]');
  const celda = vis('[data-pace-year-cell]');
  const mes = vis('.pace-heatmap-grid');

  /* HUECO MUERTO: lo que sobra dentro de la vista por debajo de su ultimo hijo
     con caja. Es lo que el usuario ve como «todo tan reducido». */
  let muerto = null;
  if (vista) {
    const rv = vista.getBoundingClientRect();
    let masBajo = rv.top;
    for (const e of vista.querySelectorAll('*')) {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > masBajo) masBajo = r.bottom;
    }
    muerto = Math.round((rv.bottom - masBajo) * 10) / 10;
  }
  /* SCROLL: la mitad de lo que s176 arreglo. Si una variante lo devuelve, no
     sirve por mucho que el calendario se vea mejor. */
  const scroll = vista ? Math.round((vista.scrollHeight - vista.clientHeight) * 10) / 10 : null;

  return {
    modal: caja(modal), vista: caja(vista), rejilla: caja(rejilla),
    celda: caja(celda), mes: caja(mes), muerto, scroll,
  };
}

async function ponerCss(p, css) {
  await p.evaluate((c) => {
    let s = document.getElementById('pace-banco-stats');
    if (!s) { s = document.createElement('style'); s.id = 'pace-banco-stats'; document.head.appendChild(s); }
    s.textContent = c;
  }, css);
  await p.waitForTimeout(260);
}

async function irAPestania(p, nombre) {
  await p.evaluate((n) => {
    const modales = [...document.querySelectorAll('[data-pace-modal-card]')]
      .filter(e => e.getBoundingClientRect().width > 0);
    const raiz = modales.length ? modales[modales.length - 1] : document;
    const b = [...raiz.querySelectorAll('button')]
      .filter(x => x.getBoundingClientRect().width > 0)
      .find(x => (x.textContent || '').trim() === n);
    if (!b) throw new Error('no encuentro la pestania ' + n);
    b.click();
  }, nombre);
  await p.waitForTimeout(420);
}

(async () => {
  if (!fs.existsSync(SALIDA)) fs.mkdirSync(SALIDA, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    if (!localStorage.getItem('pace.state.v2')) {
      localStorage.setItem('pace.state.v2', JSON.stringify({
        firstSeen: 1, lang: 'es', langAuto: false, palette: 'crema', soundOn: false,
      }));
    }
  });
  await p.goto('http://localhost:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  /* GUARD DE LA CAMARA (s177): con la semilla mal puesta la app se monta DEBAJO
     del overlay de bienvenida, los selectores lo encuentran todo y las capturas
     salen del onboarding. */
  if (await p.evaluate(() => /Antídoto a la silla|Tres preguntas breves/i.test(document.body.innerText || ''))) {
    console.error('GUARD: la app está en el ONBOARDING -- la semilla no entró');
    process.exit(2);
  }

  /* Se abre Stats por su boton de la barra lateral/superior. */
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .filter(e => e.getBoundingClientRect().width > 0)
      .find(e => /Ritmo|Estad|Stats/i.test((e.getAttribute('aria-label') || '') + ' ' + (e.textContent || '')));
    if (!b) throw new Error('no encuentro el boton de Stats');
    b.click();
  });
  await p.locator('[data-pace-stats-vistas]').first().waitFor({ state: 'visible', timeout: 20000 });
  await p.waitForTimeout(500);

  const filas = [];
  for (const k of (SOLO.length ? SOLO : Object.keys(VARIANTES))) {
    await ponerCss(p, VARIANTES[k].css);
    for (const pes of PESTANIAS) {
      await irAPestania(p, pes);
      filas.push({ k, pes, m: await p.evaluate(medir) });
      const slug = { 'Semana': 'semana', 'Mes': 'mes', 'Año': 'ano', 'Caminos': 'caminos' }[pes];
      await p.screenshot({ path: path.join(SALIDA, slug + '-' + k + '.png') });
    }
  }
  await browser.close();

  const f1 = (v) => v == null ? '-' : (Math.round(v * 10) / 10).toFixed(1);
  console.log('\n============================================================');
  console.log('BANCO DE STATS s177 · ' + W + 'x' + H);
  console.log('============================================================');
  for (const k of (SOLO.length ? SOLO : Object.keys(VARIANTES))) {
    console.log('\n' + VARIANTES[k].titulo);
    console.log('  ' + 'pestaña'.padEnd(10) + 'modal'.padStart(9) + 'vista alto'.padStart(12) +
      'rejilla'.padStart(11) + 'celda'.padStart(8) + 'hueco muerto'.padStart(14) + 'scroll'.padStart(9));
    for (const f of filas.filter(x => x.k === k)) {
      const m = f.m;
      console.log('  ' + f.pes.padEnd(10) +
        (m.modal ? f1(m.modal.w) : '-').padStart(9) +
        (m.vista ? f1(m.vista.h) : '-').padStart(12) +
        (m.rejilla ? f1(m.rejilla.w) : '-').padStart(11) +
        (m.celda ? f1(m.celda.w) : (m.mes ? 'mes ' + f1(m.mes.w) : '-')).padStart(8) +
        f1(m.muerto).padStart(14) +
        f1(m.scroll).padStart(9));
    }
  }
  console.log('\n--- lo que este banco NO cubre ---');
  console.log('  · un solo viewport: ' + W + 'x' + H + '. Movil va aparte y tiene otra regla');
  console.log('  · el zoom de la variante es una MAQUETA: la implementacion tiene que');
  console.log('    calcular la celda desde el ancho, no escalar la rejilla entera');
  console.log('  · mide cajas, no legibilidad: que la celda sea mayor no dice que el');
  console.log('    calendario se LEA mejor, y eso se decide mirandolo');
  console.log('\ncapturas en ' + path.relative(ROOT, SALIDA) + '/');
})();
