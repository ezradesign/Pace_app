/* PACE · scripts/audit/maqueta-s176.js (sesión 176)
   ==================================================
   LA BIBLIOTECA DE RESPIRA, EN VARIANTES. Genera `_maqueta-s176/`.

   POR QUÉ EXISTE: el usuario probó v0.105.0 y dijo que Respira «estaba mejor
   en su versión anterior, en la nueva se ve demasiado feo». Medido antes de
   dibujar nada, a 1536 px (su pantalla):

     HOY    modal 860 · UNA columna de 810 px · tarjeta 810x94,75 · 3,90 pantallas
     ANTES  modal 860 · DOS columnas de 392 px                     · 3,82 pantallas

   O sea: el rediseño gastó el ancho y NO cobró nada de scroll (3,82 -> 3,90,
   ligeramente PEOR). Cada tarjeta lleva ~380 px de contenido en 810 px de caja,
   y el sello de seguridad queda a 700 px del nombre al que pertenece.

   LA CAUSA NO ES LA TARJETA, ES LA PANTALLA: `LibraryShell` (rejilla de 3
   columnas + rail) es de Mueve y Estira; Respira comparte la TARJETA y no la
   pantalla (decisión s174), así que sus 20 tarjetas caen en el flujo del modal,
   una debajo de otra, a todo el ancho.

   LAS TRES REGLAS DE LA MAQUETA DE s175, QUE ESTA HEREDA:
   1. LAS TARJETAS SON LAS DE PRODUCCIÓN (`RoutineCard` con `variant="breathe"`
      renderizada con `react-dom/server`), cargadas con `vm.runInThisContext`
      — que es lo que emula los `<script>` del artefacto.
   2. EL CSS ES EL DE PRODUCCIÓN, extraído de `library.css.jsx`. Cada variante
      inyecta SÓLO su diferencia encima.
   3. CADA VIEWPORT ES UN VIEWPORT DE VERDAD (un `<iframe>` dimensionado).

   Y UNA CUARTA, DE ESTA SESIÓN: EL CHROME DEL MODAL NO SE INVENTA NI SE CLAVA.
   Se reproduce como lo escribe `Primitives.jsx` —backdrop en grid centrado con
   su padding, tarjeta con `maxHeight: 85vh` y `overflow-y: auto`— más el
   recorte que la hoja de la biblioteca le aplica con `:has()`. Clavar una
   altura medida (lo que hizo s175) ata la maqueta a UN viewport; así el mismo
   documento sirve en escritorio y en teléfono.

   TRAMPA PAGADA EN ESTA SESIÓN: el modal entra con `pace-modal-in` (scale .96
   -> 1) y medirlo a los 500 ms da 777,6 px donde la app da 810 — el 96 % exacto.
   Vale para cualquier medida futura sobre un modal.

   Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
const React = require(path.join(ROOT, 'node_modules', 'react'));
const RDS = require(path.join(ROOT, 'node_modules', 'react-dom', 'server'));

/* ── 1 · cargar la app como la carga el artefacto ────────────────────────── */
globalThis.window = globalThis;
globalThis.React = React;
function cargar(rel, extra) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const code = babel.transformSync(src, {
    configFile: false, babelrc: false, sourceType: 'script', filename: rel,
    presets: [[path.join(ROOT, 'node_modules', '@babel', 'preset-react'), {}]],
  }).code;
  vm.runInThisContext(code + (extra || ''), { filename: rel });
}
['app/i18n/strings/_bootstrap.js', 'app/i18n/strings/ui.js', 'app/i18n/strings/sessions.js',
 'app/i18n/strings/sessions.body.js', 'app/ui/library-rules.js'].forEach(f => cargar(f));

const ESTADO = { lang: 'es', premiumUnlocked: false, restBetweenSets: 30 };
globalThis.usePace = () => [ESTADO, () => {}];
globalThis.useT = () => {
  const ES = window.PACE_STRINGS.es, EN = window.PACE_STRINGS.en;
  const t = k => (ES[k] !== undefined ? ES[k] : (EN[k] !== undefined ? EN[k] : k));
  const tn = (k, v) => { let s = t(k); if (v) Object.keys(v).forEach(x => { s = s.split('{' + x + '}').join(String(v[x])); }); return s; };
  return { t, tn, lang: 'es' };
};
globalThis.canAccessRoutine = (id) => {
  /* el gating REAL: premium bloqueado, como lo ve quien no ha comprado */
  const r = todasLasRutinas().find(x => x.id === id);
  return !(r && r.access === 'premium');
};
globalThis.hasPremiumEntitlement = () => false;
globalThis.CUSTOM_LIMITS = { maxRoutines: 10 };
globalThis.ExerciseGlyph = () => null;  /* Respira no pinta glifos: variant breathe */
globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ id: '', textContent: '', setAttribute() {}, style: {} }),
  head: { appendChild() {} }, body: { appendChild() {} },
};
cargar('app/breathe/BreatheLibrary.jsx', '\nwindow.BREATHE_ROUTINES = BREATHE_ROUTINES;');
cargar('app/ui/RoutineCard.jsx');

function todasLasRutinas() {
  const out = [];
  const G = window.BREATHE_ROUTINES || {};
  Object.keys(G).forEach(k => (G[k].items || []).forEach(r => out.push(r)));
  return out;
}

/* GUARDS DE CERO: una maqueta plausible y vacía es peor que una que no sale. */
if (typeof window.RoutineCard !== 'function') { console.error('GUARD: RoutineCard no cargo'); process.exit(2); }
if (!window.PACE_STRINGS.es['lib.min']) { console.error('GUARD: i18n sin lib.min'); process.exit(2); }
const RUTINAS = todasLasRutinas();
if (RUTINAS.length !== 20) { console.error('GUARD: esperaba 20 rutinas de Respira, hay ' + RUTINAS.length); process.exit(2); }
if (!RUTINAS.some(r => r.safety)) { console.error('GUARD: ninguna rutina con sello de seguridad'); process.exit(2); }

/* ── 2 · el CSS de producción ────────────────────────────────────────────── */
function cssBiblioteca() {
  const src = fs.readFileSync(path.join(ROOT, 'app/ui/library.css.jsx'), 'utf8');
  const i = src.indexOf('s.textContent = `');
  const j = src.indexOf('`;', i + 17);
  if (i < 0 || j < 0) { console.error('GUARD: no encuentro el template de library.css.jsx'); process.exit(2); }
  /* LAS BARRAS SE DESDOBLAN, y esto salio en la PRIMERA captura: cada tarjeta
     decia «4 MIN \B7 2 rondas de 25» con la cadena literal en vez del punto
     medio. Dentro del template literal de la hoja el separador se escribe con
     DOS barras porque JS se come una al evaluar; leyendo el ARCHIVO se leen
     las dos y el CSS pinta el texto. Igual con la comilla angular de los
     enlaces. Se desdobla aqui, que es donde se lee el archivo.
     (La maqueta de s175 extrae igual y arrastra el mismo defecto: alli el
     separador no se miraba, pero esta escrito por si alguien lo reusa.) */
  const BARRA = String.fromCharCode(92);
  const css = src.slice(i + 17, j).split('${grano}').join('none')
    .split(BARRA + BARRA).join(BARRA);
  if (!/pace-lib-card/.test(css)) { console.error('GUARD: el CSS extraido no es el de la biblioteca'); process.exit(2); }
  if (css.indexOf(BARRA + BARRA) !== -1) { console.error('GUARD: quedan barras dobles en el CSS extraido'); process.exit(2); }
  return css;
}
const CSS_LIB = cssBiblioteca();
const CSS_TOK = fs.readFileSync(path.join(ROOT, 'app/tokens.css'), 'utf8')
  .split("url('/fonts/").join("url('fonts/");

/* ── 3 · las piezas reales ───────────────────────────────────────────────── */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TONO = 'var(--breathe)';

function tarjeta(r) {
  return RDS.renderToStaticMarkup(React.createElement(window.RoutineCard, {
    routine: r, color: TONO, variant: 'breathe', onClick: () => {},
  }));
}

/* Los cinco grupos, en su orden y con su `aside` -- que la app TIENE en el
   catálogo y s174 dejó de pintar. Las variantes que lo recuperan lo sacan de
   aquí, no de un texto inventado. */
function grupos() {
  const G = window.BREATHE_ROUTINES;
  return Object.keys(G).map(k => ({
    k, label: G[k].label, aside: G[k].aside,
    items: window.libraryOrdenar(G[k].items || []),
  }));
}

/* LOS CHIPS DE LA VARIANTE CON RAIL, con sus cuentas DERIVADAS del catálogo.
   No son los de Mueve/Estira: Respira no declara `position` ni `equipment`
   (20 de 20, medido en s174), así que sus ejes tienen que salir de lo que sí
   tiene -- duración, retención y rondas. */
function chipsRespira() {
  const umbral = window.libraryUmbralCorto(RUTINAS);
  const conRetencion = r => Array.isArray(r.cycle) ? (r.cycle[1] > 0 || r.cycle[3] > 0) : !!r.safety;
  const defs = [
    { nombre: '&le; ' + umbral + ' min', n: RUTINAS.filter(r => r.min <= umbral).length },
    { nombre: 'Sin retención', n: RUTINAS.filter(r => !conRetencion(r)).length },
    { nombre: 'Sin rondas', n: RUTINAS.filter(r => r.pattern !== 'rounds').length },
  ];
  defs.forEach(d => { if (!d.n) { console.error('GUARD: chip «' + d.nombre + '» a cero'); process.exit(2); } });
  return '<div class="pace-lib-chips" role="group">' + defs.map(d =>
    '<button type="button" class="pace-lib-chip">' + d.nombre + '<b>' + d.n + '</b></button>').join('') + '</div>';
}

/* La sugerencia de «Para ahora», con el pozo real y el dia de hoy -- una, que
   es lo que decidio s175 al medir que con dos el rail no cabe. */
function sugerida() {
  const s = window.libraryParaAhora(RUTINAS, new Date().toISOString().slice(0, 10), 1);
  if (!s.length) { console.error('GUARD: «Para ahora» vacio'); process.exit(2); }
  return s[0];
}

/* ── 4 · las variantes ───────────────────────────────────────────────────── */
/* Cada una declara su ancho de modal y SÓLO el CSS que la diferencia. */
const REJILLA = (n) => [
  '.pace-lib-resp{display:grid;grid-template-columns:repeat(' + n + ',minmax(0,1fr));',
  '  gap:0 20px;align-content:start}',
  '.pace-lib-resp > .pace-lib-grp{grid-column:1/-1}',
].join('');

const ASIDE = [
  /* el `aside` de familia, en la misma fila que el rótulo: es lo que hacía la
     app antes de s174 y lo único que explica qué separa «Equilibrio» de
     «Balance» sin abrir una rutina */
  '.pace-lib-grp{display:flex;justify-content:space-between;align-items:baseline;gap:14px}',
  '.pace-lib-grp i{font-family:var(--font-display);font-style:italic;font-size:13.5px;',
  '  letter-spacing:0;text-transform:none;color:var(--ink-3);font-weight:400}',
].join('');

const VARIANTES = {
  hoy: {
    modal: 860, cols: 1, aside: false, rail: false,
    titulo: 'HOY · v0.105.0',
    nota: 'Una sola columna de 810 px para una tarjeta con ~380 px de contenido. El sello ⚠ acaba a 700 px del nombre. Es lo que hay publicado.',
    css: '',
  },
  a: {
    modal: 860, cols: 2, aside: false, rail: false,
    titulo: 'A · Dos columnas, mismo modal',
    nota: 'Lo mínimo: la tarjeta nueva en la rejilla que Respira tenía antes. No cambia el ancho del modal ni toca a nadie más.',
    css: REJILLA(2),
  },
  b: {
    modal: 1240, cols: 3, aside: false, rail: false,
    titulo: 'B · Tres columnas, el ancho de sus hermanas',
    nota: 'El mismo modal de 1240 px que Mueve y Estira, con su rejilla de tres. Las tres bibliotecas pasan a ocupar lo mismo en pantalla.',
    css: REJILLA(3),
  },
  c: {
    modal: 1240, cols: 3, aside: false, rail: true,
    titulo: 'C · Con rail, como Mueve y Estira',
    nota: 'Añade el lateral con filtros PROPIOS de Respira (duración, retención, rondas) — no los de cuerpo, que Respira no puede declarar. Es la más completa y la que más decide.',
    css: REJILLA(3),
  },
  d: {
    modal: 860, cols: 2, aside: true, rail: false,
    titulo: 'D · Dos columnas + lo que Respira perdió',
    nota: 'Como A, y además vuelve el «aside» de familia («Despierta el sistema»), que está en el catálogo y s174 dejó de pintar. Es lo único que distingue Equilibrio de Balance sin abrir nada.',
    css: REJILLA(2) + ASIDE,
  },
  e: {
    modal: 1240, cols: 3, aside: true, rail: false,
    titulo: 'E · Tres columnas + el aside de familia',
    nota: 'B y D a la vez: el ancho de sus hermanas y la explicación de familia de vuelta. Es la que más rutinas enseña con la información más completa, sin estrenar filtros.',
    css: REJILLA(3) + ASIDE,
  },
  /* s178 · LA QUE PIDIO EL USUARIO Y NO ESTABA PINTADA. Sus dos mensajes juntos daban «E ·
     tres columnas + aside» y «C · con rail, como Mueve y Estira», que tal como estaban
     maquetadas son EXCLUYENTES: C lleva rail y no aside, E al reves. Esta es la suma, y hay
     que MIRARLA antes de implementarla porque es donde el ancho aprieta: s175 ya midio que
     con DOS sugerencias el rail no cabe, asi que sumarle el aside puede pasarse de largo. */
  f: {
    modal: 1240, cols: 3, aside: true, rail: true,
    titulo: 'F · Tres columnas + rail + el aside de familia',
    nota: 'C y E a la vez, que es lo que pidio el usuario en s178: se navega como Mueve y Estira (rail con los filtros propios de Respira) y ademas vuelve la explicacion de familia. Es la que mas informacion lleva y la que menos ancho deja a la tarjeta — el marco dice cuanto.',
    css: REJILLA(3) + ASIDE,
  },
};

/* ── 5 · el marco se mide a sí mismo ─────────────────────────────────────── */
/* El script va DENTRO del iframe: con `file://` el documento de fuera no puede
   leer el DOM de sus marcos, así que una medida hecha desde fuera saldría
   vacía y la etiqueta mentiría por omisión (s169).
   Y POR CAJA NO NULA, SIEMPRE: en la piel móvil el rail sigue en el DOM con
   `display:none` y un `querySelector` a secas lo devuelve. Van OCHO veces. */
const BADGE = [
  '<div class="mq-badge" id="mqb"></div>',
  '<script>function mqMide(){',
  '  var sc=document.querySelector(".mq-card");',
  '  var vis=function(l){return [].slice.call(document.querySelectorAll(l))',
  '    .filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0;});};',
  /* LA TARJETA QUE SE MIDE ES LA DE LA REJILLA, no la primera del documento:
     en la variante con rail la primera visible es la SUGERENCIA del lateral y
     el badge decia «tarjeta 242 px» -- el ancho del rail, no el del catalogo.
     Es la novena vez que una consulta a la biblioteca devuelve la pieza
     equivocada, y otra vez en un instrumento propio. */
  '  var t=vis(".pace-lib-resp .pace-lib-card");',
  '  if(!sc||!t.length){document.getElementById("mqb").textContent="GUARD: sin tarjetas";return;}',
  '  var caja=sc.getBoundingClientRect();',
  /* «se ven N» = tarjetas cuya caja cae ENTERA dentro del scroller sin mover
     nada. Es la cuenta que responde a «cuánto veo de un vistazo». */
  '  var dentro=t.filter(function(e){var r=e.getBoundingClientRect();',
  '    return r.top>=caja.top-1&&r.bottom<=caja.bottom+1;}).length;',
  '  var lat=vis(".pace-lib-lateral")[0];',
  '  document.getElementById("mqb").innerHTML=innerWidth+"x"+innerHeight+" · tarjeta <b>"',
  '    +Math.round(t[0].getBoundingClientRect().width)+" px</b> · se ven <b>"+dentro',
  '    +"</b> de "+t.length+" · <b>"+(sc.scrollHeight/sc.clientHeight).toFixed(2)+"</b> pantallas"',
  '    +(lat?" · rail <b>"+Math.round(lat.getBoundingClientRect().width)+" px</b>":"");',
  '}',
  /* SE ESPERA A LAS FUENTES **Y** AL DOM, en ese orden y encadenados.
     Colgar la medida solo de `document.fonts.ready` -que es lo que hizo s175-
     funciona mientras las fuentes TARDEN: la promesa resuelve despues del
     parseo y las tarjetas ya existen. Servido por `file://` las fuentes no
     cargan, la promesa resuelve casi al instante y la medida cae ANTES de que
     el modal se haya parseado: los cinco marcos dijeron «GUARD: sin tarjetas»
     con las 20 tarjetas dentro del HTML. Es el guard haciendo su trabajo.
     Ahora se espera al DOM primero, luego a las fuentes, y se mide en el frame
     siguiente para que el layout ya este hecho. */
  'function mqCuando(){var f=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();',
  '  f.then(function(){requestAnimationFrame(mqMide);});}',
  'if(document.readyState==="loading"){addEventListener("DOMContentLoaded",mqCuando);}else{mqCuando();}',
  '</scr' + 'ipt>',
].join('\n');

const CSS_MARCO = [
  '*{box-sizing:border-box}',
  'html,body{margin:0;height:100%;font-family:var(--font-ui);color:var(--ink)}',
  /* el fondo de la home, para juzgar el modal sobre algo y no sobre blanco */
  'body{background:var(--paper-2)}',
  /* EL CHROME DEL MODAL, como lo escribe Primitives.jsx + el recorte que la
     hoja de la biblioteca le aplica con :has(). No se clava ninguna altura. */
  '.mq-back{position:fixed;inset:0;background:rgba(31,28,23,.28);display:grid;',
  '  place-items:center;padding:20px;z-index:2}',
  '.mq-card{background:var(--paper);border:1px solid var(--line);border-radius:var(--r-lg);',
  '  box-shadow:var(--sh-modal);width:100%;max-height:85vh;overflow-y:auto;',
  '  padding:22px 24px 18px;position:relative}',
  '@media (max-width:768px){',
  '  .mq-back{padding:8px}',
  '  .mq-card{padding:16px 16px 20px;max-height:calc(100vh - 16px)}',
  /* la barra de scroll oculta conservando el scroll, como en la app (s125): una
     barra visible se come 6 px de ancho útil y falsea la medida */
  '  .mq-card{scrollbar-width:none}.mq-card::-webkit-scrollbar{display:none}',
  '}',
  '.mq-badge{position:fixed;left:0;right:0;bottom:0;z-index:9;background:var(--ink);',
  '  color:var(--paper);font-family:var(--font-ui);font-size:11px;letter-spacing:.04em;',
  '  padding:5px 10px;text-align:center}',
  '.mq-badge b{color:#F0C98A}',
].join('\n');

function doc(clave) {
  const v = VARIANTES[clave];
  if (!v) { console.error('GUARD: variante desconocida ' + clave); process.exit(2); }

  const cabecera = [
    '<div class="pace-lib-hd">',
    '<div class="pace-lib-k">Biblioteca</div>',
    '<div class="pace-lib-hd-fila"><h2>Respiración</h2></div>',
    '<p class="pace-lib-sub">Breathwork guiado: pranayamas, coherencia, rondas.</p>',
    '</div>',
  ].join('');

  /* LO QUE SUBE A «PARA AHORA» SE RETIRA DE LA REJILLA, igual que hace
     `LibraryShell` con `enAhora`. Sin esto la sugerida sale DOS veces y el
     marco cuenta 21 tarjetas de 20: la maqueta mediria una biblioteca mas
     larga que la real, que es justo el numero que se viene a juzgar (s175). */
  const subida = v.rail ? sugerida().id : null;
  const lista = grupos().map(g => {
    const items = g.items.filter(r => r.id !== subida);
    if (!items.length) return '';
    return '<h3 class="pace-lib-grp">' + esc(g.label) +
      (v.aside ? '<i>' + esc(g.aside) + '</i>' : '') + '</h3>' +
      items.map(tarjeta).join('');
  }).join('');

  const cuerpo = v.rail
    ? ['<div class="pace-lib-cuerpo">',
       '<aside class="pace-lib-lateral">',
       '<p class="pace-lib-lateral-tit">Filtrar</p>', chipsRespira(),
       '<p class="pace-lib-lateral-tit">Para ahora</p>',
       '<div data-pace-lib-now>',
       tarjeta(sugerida()),
       '</div></aside>',
       '<div class="pace-lib-main">', cabecera,
       '<div class="pace-lib-resp">', lista, '</div>',
       '</div></div>'].join('')
    : [cabecera, '<div class="pace-lib-resp">', lista, '</div>'].join('');

  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="../">',
    '<title>Respira · ' + esc(v.titulo) + '</title>',
    '<style>', CSS_TOK, CSS_LIB, CSS_MARCO,
    /* la rejilla SÓLO existe de 769 para arriba: en teléfono Respira es una
       columna y eso NO es el defecto que se viene a arreglar */
    '@media (min-width:769px){', v.css, '}',
    '</style></head><body>', BADGE,
    '<div class="mq-back"><div class="mq-card" style="max-width:' + v.modal + 'px">',
    '<div class="pace-lib" style="--tone:var(--breathe)">', cuerpo, '</div>',
    '</div></div></body></html>',
  ].join('\n');
}

module.exports = { VARIANTES, doc, CSS_TOK, esc };

if (require.main === module) {
  const dir = path.join(ROOT, '_maqueta-s176');
  fs.mkdirSync(dir, { recursive: true });
  Object.keys(VARIANTES).forEach(k =>
    fs.writeFileSync(path.join(dir, 'respira-' + k + '.html'), doc(k), 'utf8'));
  console.log('escritos ' + Object.keys(VARIANTES).length + ' marcos en _maqueta-s176/');
}
