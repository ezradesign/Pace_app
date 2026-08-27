/* PACE · scripts/audit/maqueta-s175.js (sesión 175)
   ==================================================
   LA MAQUETA DE LAS DECISIONES DE s175. Genera `_maqueta-s175.html`.

   TRES REGLAS QUE ESTA MAQUETA SÍ CUMPLE, y que la de s174 no cumplió:

   1. LAS TARJETAS SON LAS DE PRODUCCIÓN, no una copia. `RoutineCard.jsx` se
      renderiza de verdad con `react-dom/server`, cargando los módulos con
      `vm.runInThisContext` — que es lo que emula los 109 `<script>` del
      artefacto y publica `var`/`function` como globales. Con `new Function`
      NO liga `useT`, que la tarjeta referencia pelada: el mismo modo de fallo
      que el crash de s144.
   2. EL CSS ES EL DE PRODUCCIÓN. La hoja sale extraída de `library.css.jsx`;
      cada variante inyecta SÓLO su diferencia encima. Si la hoja real cambia,
      esta maqueta cambia con ella.
   3. CADA VIEWPORT ES UN VIEWPORT DE VERDAD (un `<iframe>` dimensionado), no
      un `<div>` estrecho. En un div las media queries leen el ancho de la
      PÁGINA y la maqueta miente: es exactamente cómo s174 aprobó 328 px de
      ancho útil sobre una superficie que daba 286.

   Y LA MAQUETA SE MIDE A SÍ MISMA: los números de «cabe / se corta N px» y
   «hueco de N px» los calcula la propia página al cargar, dentro de cada
   iframe. No hay ni una cifra escrita a mano en las etiquetas.

   Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const babel = require(path.join(ROOT, 'node_modules', '@babel', 'core'));
const React = require(path.join(ROOT, 'node_modules', 'react'));
const RDS = require(path.join(ROOT, 'node_modules', 'react-dom', 'server'));
const { bocetoRana, VARIANTES_RAIL, VARIANTES_PREP } = require('./maqueta-s175.piezas.js');

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
 'app/i18n/strings/sessions.body.js', 'app/custom/exercise-registry.js',
 'app/custom/exercise-aliases.js', 'app/glyphs/exercise-glyphs.jsx',
 'app/glyphs/exercise-glyphs.extra.jsx', 'app/glyphs/exercise-masks.js',
 'app/ui/library-rules.js', 'app/move/move.data.js'].forEach(f => cargar(f));
cargar('app/extra/ExtraModule.jsx', '\nwindow.EXTRA_ROUTINES = EXTRA_ROUTINES;');

const ESTADO = { lang: 'es', premiumUnlocked: false, restBetweenSets: 30 };
globalThis.usePace = () => [ESTADO, () => {}];
globalThis.useT = () => {
  const ES = window.PACE_STRINGS.es, EN = window.PACE_STRINGS.en;
  const t = k => (ES[k] !== undefined ? ES[k] : (EN[k] !== undefined ? EN[k] : k));
  const tn = (k, v) => { let s = t(k); if (v) Object.keys(v).forEach(x => { s = s.split('{' + x + '}').join(String(v[x])); }); return s; };
  return { t, tn, lang: 'es' };
};
globalThis.canAccessRoutine = () => true;
globalThis.hasPremiumEntitlement = () => false;
globalThis.CUSTOM_LIMITS = { maxRoutines: 10 };
cargar('app/ui/RoutineCard.jsx');
/* «Tus rutinas» ES UN COMPONENTE, y la primera versión de esta maqueta lo
   dibujó a mano: daba 9 px de hueco debajo donde la app da 0, o sea que
   escondía justo el defecto que hay que enseñar. Se carga el de verdad. */
/* Varios módulos INYECTAN su hoja al evaluarse (`document.getElementById(...)`
   en el top level). Aquí no hay DOM, así que se les da un documento de pega:
   sólo tiene que dejarles pasar sin romper — el CSS que quisieran inyectar no
   nos sirve, porque la maqueta usa el extraído de `library.css.jsx`. */
globalThis.document = {
  getElementById: () => null,
  createElement: () => ({ id: '', textContent: '', setAttribute() {}, style: {} }),
  head: { appendChild() {} }, body: { appendChild() {} },
};
cargar('app/ui/Primitives.jsx');   /* `displayItalic` y `Card` viven aquí */
cargar('app/custom/CustomRoutines.jsx');
if (typeof window.CustomRoutinesSection !== 'function') {
  console.error('GUARD: CustomRoutinesSection no cargo'); process.exit(2);
}

/* GUARDS de cero: si algo de esto viene vacío la maqueta saldría plausible y
   falsa, que es peor que no salir (lección de s169). */
if (!window.PACE_STRINGS.es['lib.min']) { console.error('GUARD: i18n sin lib.min'); process.exit(2); }
if (!Object.keys(window.EXERCISE_MASKS || {}).length) { console.error('GUARD: EXERCISE_MASKS vacio'); process.exit(2); }
if (typeof window.RoutineCard !== 'function') { console.error('GUARD: RoutineCard no cargo'); process.exit(2); }

/* ── 2 · el CSS de producción ────────────────────────────────────────────── */
function cssBiblioteca() {
  const src = fs.readFileSync(path.join(ROOT, 'app/ui/library.css.jsx'), 'utf8');
  const i = src.indexOf('s.textContent = `');
  const j = src.indexOf('`;', i + 17);
  if (i < 0 || j < 0) { console.error('GUARD: no encuentro el template de library.css.jsx'); process.exit(2); }
  const css = src.slice(i + 17, j).split('${grano}').join('none');
  if (!/pace-lib-card/.test(css)) { console.error('GUARD: el CSS extraido no es el de la biblioteca'); process.exit(2); }
  return css;
}
function cssTokens() {
  /* rutas absolutas -> relativas: la maqueta se abre desde la raíz del repo */
  return fs.readFileSync(path.join(ROOT, 'app/tokens.css'), 'utf8').split("url('/fonts/").join("url('fonts/");
}
const CSS_LIB = cssBiblioteca();
const CSS_TOK = cssTokens();

/* ── 3 · rutinas y tarjetas reales ───────────────────────────────────────── */
function rutina(id) {
  for (const gs of [window.MOVE_ROUTINES, window.EXTRA_ROUTINES])
    for (const g of Object.keys(gs)) { const f = (gs[g].items || []).find(r => r.id === id); if (f) return f; }
  return null;
}
function grupos(which) {
  const gs = which === 'estira' ? window.EXTRA_ROUTINES : window.MOVE_ROUTINES;
  return Object.keys(gs).map(k => ({ label: gs[k].label, items: gs[k].items || [] }));
}
function tarjeta(r, color) {
  return RDS.renderToStaticMarkup(
    React.createElement(window.RoutineCard, { routine: r, color, onClick: () => {} }));
}
const TONO = 'var(--extra)';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* «Para ahora» de Estira, con el pozo real y el día de hoy */
const todas = grupos('estira').reduce((a, g) => a.concat(g.items), []);
const hoyISO = new Date().toISOString().slice(0, 10);
const ahora2 = window.libraryParaAhora(todas, hoyISO, 2);
const ahora1 = window.libraryParaAhora(todas, hoyISO, 1);
if (!ahora2.length) { console.error('GUARD: «Para ahora» vacio'); process.exit(2); }

/* ── 3bis · CADA MARCO SE MIDE A SÍ MISMO ────────────────────────────────
   El script va DENTRO del iframe, no en la página de fuera: con `file://` el
   documento padre no puede leer el DOM de sus marcos, así que una medida
   hecha desde fuera saldría vacía y la etiqueta mentiría por omisión — que es
   el modo de fallo que s169 dejó escrito. Cada marco imprime su propio número. */
const BADGE_CSS = [
  '.mq-badge{position:fixed;left:0;right:0;bottom:0;z-index:9;background:var(--ink);color:var(--paper);',
  '  font-family:var(--font-ui);font-size:11px;letter-spacing:.04em;padding:5px 10px;text-align:center}',
  '.mq-badge b{color:#F0C98A}',
].join('\n');

const BADGE_RAIL = [
  '<div class="mq-badge" id="mqb"></div>',
  '<script>function mqMide(){',
  /* SE ESPERA A LAS FUENTES. Midiendo en DOMContentLoaded el texto
     todavia esta en la fuente de reserva y la caja no es la final: dos
     marcos del MISMO ancho daban 297 y 312 px de tarjeta segun cuando
     les tocara el turno. `document.fonts.ready` lo cierra, con salida
     por si el navegador no lo trae. */
  /* POR CAJA NO NULA, SIEMPRE. Con `display:none` el lateral SIGUE en el DOM,
     asi que un querySelector a secas lo devuelve y la sonda se cree de
     escritorio: en la pagina del movil eso daba "rail 0 px · huecos 0/0/0/0" en
     los ocho telefonos. Es la trampa que s174 documento seis veces, y la
     septima fue aqui, en mi propio instrumento. */
  '  var lat=[].slice.call(document.querySelectorAll(".pace-lib-lateral"))',
  '    .filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0;})[0];',
  '  var sc=document.querySelector(".mq-scroll");',
  /* EN LA PIEL MOVIL NO HAY RAIL --la hoja lo apaga por debajo de 769-- y eso
     NO es un fallo: la etiqueta pasa a decir lo que si se puede medir ahi, que
     es el ancho util de la tarjeta y cuantas pantallas de scroll hay. Un badge
     que dijera "GUARD: sin rail" en un telefono seria ruido, y uno que callara
     seria peor. */
  '  if(!sc){document.getElementById("mqb").textContent="GUARD: sin scroller";return;}',
  '  if(!lat){',
  '    var t=[].slice.call(document.querySelectorAll(".pace-lib-rejilla .pace-lib-card"))',
  '      .filter(function(e){return e.getBoundingClientRect().width>0;});',
  '    var n=[].slice.call(document.querySelectorAll(".pace-lib-solo-movil [data-pace-lib-now] .pace-lib-card"))',
  '      .filter(function(e){return e.getBoundingClientRect().width>0;});',
  '    document.getElementById("mqb").innerHTML=innerWidth+"x"+innerHeight+" · piel MOVIL (sin lateral) · ancho util <b>"',
  '      +(t.length?Math.round(t[0].getBoundingClientRect().width):0)+" px</b> · <b>"',
  '      +(sc.scrollHeight/sc.clientHeight).toFixed(2)+"</b> pantallas · sugerencias <b>"+n.length+"</b>";',
  '    return;',
  '  }',
  '  var h=[].slice.call(lat.children);',
  '  var top=h[0].getBoundingClientRect().top, bot=h[h.length-1].getBoundingClientRect().bottom;',
  '  var scb=sc.getBoundingClientRect();',
  '  var recorte=Math.max(0,Math.round(bot-scb.bottom));',
  '  var hue=[];for(var i=1;i<h.length;i++){hue.push(Math.round(h[i].getBoundingClientRect().top-h[i-1].getBoundingClientRect().bottom));}',
  '  sc.scrollTop=sc.scrollHeight;',
  '  var vivo=Math.max(0,Math.round(Math.min(h[h.length-1].getBoundingClientRect().bottom,scb.bottom)-Math.max(h[0].getBoundingClientRect().top,scb.top)));',
  '  sc.scrollTop=0;',
  '  document.getElementById("mqb").innerHTML=innerWidth+"x"+innerHeight+" · rail <b>"+Math.round(bot-top)+" px</b> · huecos <b>"+hue.join(" / ")+"</b> px · "',
  '    +(recorte?("<b>SE CORTA "+recorte+" px</b>"):"cabe entero")+" · con el scroll al fondo quedan <b>"+vivo+" px</b> de rail";',
  '}',
  'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(mqMide);}',
  'else{addEventListener("DOMContentLoaded",mqMide);}',
  '</scr' + 'ipt>',
].join('\n');

const BADGE_PREP = [
  '<div class="mq-badge" id="mqb"></div>',
  '<script>function mqMide(){',
  /* SE ESPERA A LAS FUENTES. Midiendo en DOMContentLoaded el texto
     todavia esta en la fuente de reserva y la caja no es la final: dos
     marcos del MISMO ancho daban 297 y 312 px de tarjeta segun cuando
     les tocara el turno. `document.fonts.ready` lo cierra, con salida
     por si el navegador no lo trae. */
  '  var ult=document.querySelector(".mq-pasos");',
  '  if(!ult||getComputedStyle(ult).display==="none") ult=document.querySelector(".mq-copy");',
  '  var cta=document.querySelector(".mq-cta"), arte=document.querySelector(".mq-arte");',
  '  var hueco=Math.round(cta.getBoundingClientRect().top-ult.getBoundingClientRect().bottom);',
  '  var arriba=Math.round(arte.getBoundingClientRect().top);',
  '  var abajo=Math.round(innerHeight-cta.getBoundingClientRect().bottom);',
  '  document.getElementById("mqb").innerHTML=innerWidth+"x"+innerHeight+" · círculo a <b>"+arriba+" px</b> del borde · hueco hasta el CTA <b>"',
  '    +hueco+" px</b> · debajo del CTA <b>"+abajo+" px</b>";',
  '}',
  'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(mqMide);}',
  'else{addEventListener("DOMContentLoaded",mqMide);}',
  '</scr' + 'ipt>',
].join('\n');

/* ── 4 · el documento interior de cada variante del RAIL ─────────────────── */
function docRail(clave) {
  const v = VARIANTES_RAIL[clave];
  const sugeridas = clave === 'a2' ? ahora1 : ahora2;
  const umbral = window.libraryUmbralCorto(todas);
  const chips = [
    '<div class="pace-lib-chips" role="group">',
    '  <button type="button" class="pace-lib-chip">Aquí mismo <b>5</b></button>',
    '  <button type="button" class="pace-lib-chip">Sin material <b>7</b></button>',
    '  <button type="button" class="pace-lib-chip">&le; ' + umbral + ' min <b>6</b></button>',
    '</div>',
  ].join('');
  const tuyas = RDS.renderToStaticMarkup(
    React.createElement(window.CustomRoutinesSection, { onStart: () => {}, accent: TONO }));
  /* LO QUE SUBE A «PARA AHORA» SE RETIRA DE LA REJILLA, igual que en
     `LibraryShell` (`enAhora`). Sin esto la sugerida salia DOS veces y el marco
     daba 4,60 pantallas de scroll donde la app da 3,94: la maqueta habria hecho
     parecer la biblioteca mas larga de lo que es, que es justo la medida que se
     viene a juzgar aqui. */
  const subidas = sugeridas.map(r => r.id);
  const rejilla = grupos('estira').map(g => {
    const items = g.items.filter(r => subidas.indexOf(r.id) === -1);
    if (!items.length) return '';
    return '<div class="pace-lib-grp"><p class="pace-lib-k">' + esc(g.label) + '</p></div>' +
      items.map(r => tarjeta(r, TONO)).join('');
  }).join('');
  const cabecera = [
    '<div class="pace-lib-hd"><div class="pace-lib-hd-fila">',
    '<p class="pace-lib-k">Biblioteca</p></div>',
    '<h2>Estira</h2><p class="pace-lib-sub">Movilidad y estiramientos. Antídoto a la silla.</p></div>',
  ].join('');
  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' + '<base href="../">',
    '<style>', CSS_TOK, CSS_LIB,
    '*{box-sizing:border-box}',   /* el marco no heredaba el reset y el scroller medía 40 px de más */
    'html,body{margin:0;background:var(--paper-2);font-family:var(--font-ui);color:var(--ink)}',
    /* LA GEOMETRÍA DEL SCROLLER NO SE INVENTA: sale de medir la app real a
       1536x714 — clientHeight 605, arranca a 66 px del borde, padding 22/18.
       La primera versión ponía `height: 100vh` y por eso decía «cabe entero»
       donde la app recorta 10 px: la maqueta se daba 109 px que no existen. */
    '.mq-modal{position:absolute;top:66px;left:0;right:0;height:582px;background:var(--paper-3);',
    '  box-shadow:0 2px 24px rgba(0,0,0,.12)}',
    '.mq-scroll{height:582px;overflow:auto;padding:22px 20px 18px}',
    '.mq-scroll::-webkit-scrollbar{width:6px}.mq-scroll::-webkit-scrollbar-thumb{background:var(--line)}',
    /* Y EL CHROME DEL MÓVIL TAMPOCO SE INVENTA: medido a 360x730 en la app,
       el scroller arranca a 16 px del borde, mide 706 de alto con padding
       16/16/20 y deja 310 px de ancho útil. Sin esto el mismo documento
       enseñaría un teléfono con el marco de un escritorio. */
    '@media (max-width: 768px){',
    /* EL ALTO VA RELATIVO, no clavado. La primera version puso 706 px --el
       valor medido a 360x730-- y en un telefono de 568 el modal no cabia: el
       documento del marco sacaba su propia barra de scroll y se comia 15 px de
       ANCHO, asi que dos telefonos de 360 daban 297 y 312 px de tarjeta. Lo
       delato el badge. En la app el modal deja 16 px arriba y 8 abajo. */
    '  .mq-modal{top:16px;left:8px;right:8px;height:calc(100vh - 24px)}',
    '  .mq-scroll{height:calc(100vh - 24px);padding:16px 16px 20px}',
    /* la barra de scroll se OCULTA conservando el scroll, como en la app
       (decision s125). No es cosmetica: una barra visible se come 6 px y
       dejaba la tarjeta en 306 donde la app da 310. */
    '  .mq-scroll{scrollbar-width:none}',
    '  .mq-scroll::-webkit-scrollbar{display:none}',
    '}',
    BADGE_CSS, v.css,
    '</style></head><body>' + BADGE_RAIL + '<div class="mq-modal"><div class="mq-scroll">',
    '<div class="pace-lib pace-lib-cuerpo">',
    '<aside class="pace-lib-lateral">',
    '<p class="pace-lib-lateral-tit">Filtrar</p>', chips, tuyas,
    '<p class="pace-lib-lateral-tit">Para ahora</p>',
    '<div data-pace-lib-now>', sugeridas.map(r => tarjeta(r, TONO)).join(''), '</div>',
    '</aside>',
    '<div class="pace-lib-main">', cabecera,
    /* LAS COPIAS DE MÓVIL, con el MISMO marcador que las del lateral. Las dos
       existen siempre y la hoja apaga la que sobra: es exactamente lo que hace
       `LibraryShell`, y es lo que permite que UN documento sirva en las dos
       pieles. «Para ahora» va FUERA de la rejilla, como en producción. */
    '<div class="pace-lib-solo-movil">', chips, '</div>',
    '<div class="pace-lib-solo-movil"><section data-pace-lib-now>',
    '<h3 class="pace-lib-now">Para ahora</h3>',
    sugeridas.map(r => tarjeta(r, TONO)).join(''),
    '</section></div>',
    '<div class="pace-lib-rejilla">', rejilla, '</div></div>',
    '</div></div></div></body></html>',
  ].join('\n');
}

/* ── 5 · el documento interior de cada variante de la PREPARACIÓN ────────── */
/* `circulo` viaja como parámetro porque el arte de la preparación NO es de
   tamaño fijo: `v1GlyphSizeAhora()` lo escala con la altura del viewport.
   Medido en la app real: 198 px a 1536x714, 186 a 412x844 y 161 a 360x730.
   Dibujar los tres con el mismo círculo sería la mentira de siempre. */
function docPrep(clave, circulo, piel) {
  const v = VARIANTES_PREP[clave];
  const d = circulo || 198;
  const dentro = Math.round(d * 0.92);
  const num = Math.round(d * 0.34);
  /* EL CÍRCULO SE RECALCULA EN EL MARCO, con la fórmula de producción
     (`v1GlyphSize`, MoveSessionV1.support.jsx): round(clamp(72, vpH*0.22, 210))
     por 1.3 si la piel es de escritorio. Así UN SOLO documento sirve para todas
     las resoluciones y no hay que hornear un tamaño por teléfono -- que es lo
     que haría que la maqueta mintiera en cuanto se cambie de móvil. El valor
     horneado arriba queda como fallback si el script no corriera. */
  const AUTO_CIRCULO = [
    '<script>function mqMide(){',
  /* SE ESPERA A LAS FUENTES. Midiendo en DOMContentLoaded el texto
     todavia esta en la fuente de reserva y la caja no es la final: dos
     marcos del MISMO ancho daban 297 y 312 px de tarjeta segun cuando
     les tocara el turno. `document.fonts.ready` lo cierra, con salida
     por si el navegador no lo trae. */
    '  var web = ' + (piel === 'escritorio' ? 'true' : 'false') + ';',
    '  var d = Math.round(Math.max(72, Math.min(210, Math.round(innerHeight * 0.22))) * (web ? 1.3 : 1));',
    '  var r = document.documentElement.style;',
    '  r.setProperty("--mq-d", d + "px");',
    '  r.setProperty("--mq-dentro", Math.round(d * 0.92) + "px");',
    '  r.setProperty("--mq-num", Math.round(d * 0.34) + "px");',
    '}',
  'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(mqMide);}',
  'else{addEventListener("DOMContentLoaded",mqMide);}',
  '</scr' + 'ipt>',
  ].join('\n');
  const r = rutina('move.desk.quick');
  const pasos = window.libraryGlifos(r).slice(0, 4)
    .map(n => '<span class="mq-paso">' + esc(n) + '</span>').join('');
  const arte = window.EXERCISE_MASKS[window.libraryGlifos(r)[0]];
  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8">' + '<base href="../">',
    '<style>', CSS_TOK,
    '*{box-sizing:border-box}',
    'html,body{margin:0;height:100%;background:var(--paper);font-family:var(--font-ui);color:var(--ink)}',
    '.mq-prep{height:100vh;display:flex;flex-direction:column;align-items:center;padding:18px 24px 20px;box-sizing:border-box}',
    '.mq-top{width:100%;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}',
    '.mq-k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}',
    '.mq-tit{font-family:var(--font-display);font-style:italic;font-size:22px;margin:2px 0 0}',
    '.mq-salir{font-size:13px;color:var(--ink-3)}',
    '.mq-arte{position:relative;width:var(--mq-d,' + d + 'px);height:var(--mq-d,' + d + 'px);border-radius:50%;background:var(--extra-soft);display:grid;place-items:center}',
    '.mq-arte i{display:block;width:var(--mq-dentro,' + dentro + 'px);height:var(--mq-dentro,' + dentro + 'px);background-color:var(--extra);',
    '  -webkit-mask-image:url("' + arte + '");mask-image:url("' + arte + '");',
    '  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;',
    '  -webkit-mask-size:contain;mask-size:contain}',
    '.mq-num{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--font-display);',
    '  font-style:italic;font-size:var(--mq-num,' + num + 'px);line-height:1;color:var(--extra);opacity:.34}',
    '.mq-rot{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-3);margin-top:20px}',
    '.mq-copy{font-family:var(--font-display);font-style:italic;font-size:20px;color:var(--ink-2);margin-top:10px;text-align:center;max-width:460px}',
    '.mq-pasos{display:none;margin-top:26px;max-width:460px;text-align:center}',
    '.mq-paso{display:inline-block;font-size:12px;color:var(--ink-3);border:1px solid var(--line);',
    '  border-radius:999px;padding:3px 10px;margin:3px}',
    '.mq-cta{margin-top:auto;border:1px solid var(--line-2);background:transparent;border-radius:4px;',
    '  padding:10px 18px;font-family:var(--font-ui);font-size:14px;color:var(--ink)}',
    '.mq-prep{padding-bottom:44px}', BADGE_CSS,
    v.css,
    '</style></head><body>' + AUTO_CIRCULO + BADGE_PREP,
    '<div class="mq-prep">',
    '  <div class="mq-top"><div><div class="mq-k">Escritorio</div><div class="mq-tit">Escritorio express</div></div>',
    '  <div class="mq-salir">&times; Salir</div></div>',
    '  <div class="mq-arte"><i></i><div class="mq-num">3</div></div>',
    '  <div class="mq-rot">Prepárate</div>',
    '  <div class="mq-copy">De pie. Sin prisa. 6 pasos.</div>',
    '  <div class="mq-pasos">', pasos, '</div>',
    '  <button class="mq-cta">Empezar ahora</button>',
    '</div></body></html>',
  ].join('\n');
}

/* ── 5bis · LA PREPARACIÓN SIN GLIFO (s175) ──────────────────────────────
   La pantalla que quedó tras quitar el arte: rótulo, contador y copy, en ese
   orden y centrados, con el CTA en el pie. NO es una variante CSS de la de
   arriba: el ORDEN de las piezas es otro —el arte iba primero y el rótulo
   debajo— y forzarlo con CSS habría sido maquetar una mentira cómoda.
   Los tamaños del numeral son los de la hoja responsive de sesión y están
   MEDIDOS en la app: 200 px en escritorio y 128 en móvil. */
function docPrepSinGlifo(piel) {
  const escritorio = piel === 'escritorio';
  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="../">',
    '<style>', '*{box-sizing:border-box}', CSS_TOK,
    'html,body{margin:0;height:100%;background:var(--paper);font-family:var(--font-ui);color:var(--ink)}',
    '.mq-prep{height:100vh;display:flex;flex-direction:column;align-items:center;',
    '  justify-content:center;padding:18px 24px 20px;box-sizing:border-box}',
    '.mq-top{position:absolute;top:18px;left:24px;right:24px;display:flex;',
    '  justify-content:space-between;align-items:flex-start}',
    '.mq-k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}',
    '.mq-tit{font-family:var(--font-display);font-style:italic;font-size:22px;margin:2px 0 0}',
    '.mq-salir{font-size:13px;color:var(--ink-3)}',
    '.mq-rot{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-3);margin-bottom:18px}',
    '.mq-num{font-family:var(--font-display);font-style:italic;font-weight:400;',
    '  font-size:' + (escritorio ? 200 : 128) + 'px;line-height:.9;color:var(--extra);',
    '  font-variant-numeric:tabular-nums}',
    '.mq-copy{font-family:var(--font-display);font-style:italic;font-size:20px;color:var(--ink-2);',
    '  margin-top:40px;text-align:center;max-width:460px}',
    '.mq-cta{position:absolute;left:0;right:0;bottom:20px;margin:0 auto;width:max-content;',
    '  border:1px solid var(--line-2);background:transparent;border-radius:4px;',
    '  padding:10px 18px;font-family:var(--font-ui);font-size:14px;color:var(--ink)}',
    BADGE_CSS,
    '</style></head><body>',
    '<div class="mq-badge" id="mqb"></div>',
    '<script>function mqMide(){',
  /* SE ESPERA A LAS FUENTES. Midiendo en DOMContentLoaded el texto
     todavia esta en la fuente de reserva y la caja no es la final: dos
     marcos del MISMO ancho daban 297 y 312 px de tarjeta segun cuando
     les tocara el turno. `document.fonts.ready` lo cierra, con salida
     por si el navegador no lo trae. */
    '  var n=document.querySelector(".mq-num"), c=document.querySelector(".mq-copy"),',
    '      b=document.querySelector(".mq-cta"), r=document.querySelector(".mq-rot");',
    '  document.getElementById("mqb").innerHTML=innerWidth+"x"+innerHeight+" · sin glifo · numeral <b>"',
    '    +getComputedStyle(n).fontSize+"</b> · aire arriba <b>"+Math.round(r.getBoundingClientRect().top)',
    '    +" px</b> · aire abajo <b>"+Math.round(b.getBoundingClientRect().top-c.getBoundingClientRect().bottom)+" px</b>";',
    '}',
  'if(document.fonts&&document.fonts.ready){document.fonts.ready.then(mqMide);}',
  'else{addEventListener("DOMContentLoaded",mqMide);}',
  '</scr' + 'ipt>',
    '<div class="mq-prep">',
    '  <div class="mq-top"><div><div class="mq-k">Escritorio</div><div class="mq-tit">Escritorio express</div></div>',
    '  <div class="mq-salir">&times; Salir</div></div>',
    '  <div class="mq-rot">Prepárate</div>',
    '  <div class="mq-num">3</div>',
    '  <div class="mq-copy">De pie. Sin prisa. 6 pasos.</div>',
    '  <button class="mq-cta">Empezar ahora</button>',
    '</div></body></html>',
  ].join('\n');
}

/* ── 6 · la tarjeta de `Caderas · suelo` con cada boceto de capitular ────── */
function tarjetaRana(cual) {
  const r = rutina('move.hips.ground');
  const html = tarjeta(r, TONO);
  if (cual === 'hoy') return html;
  /* Se sustituye SÓLO el contenido de la capitular; el resto es la tarjeta
     real, sin tocar.

     LA PRIMERA VERSIÓN CONTABA `</span>` A MANO Y SE COMÍA MEDIA TARJETA: la
     capitular de esta rutina no tiene máscara, así que su hijo es un `<svg>` y
     el segundo `</span>` que encontraba ya era el de la TIRA. El ancla ahora es
     explícita —`</svg></span>`— y si el marcado deja de tener esa forma, esto
     falla en voz alta en vez de escribir una tarjeta rota. */
  const ANCLA = '</svg></span>';
  const abre = html.indexOf('<span class="pace-lib-cap"');
  const tras = abre < 0 ? -1 : html.indexOf('>', abre) + 1;
  const fin = tras < 0 ? -1 : html.indexOf(ANCLA, tras);
  if (abre < 0 || fin < 0) {
    console.error('GUARD: la capitular de move.hips.ground no tiene la forma esperada');
    process.exit(2);
  }
  return html.slice(0, tras) + bocetoRana(cual, 62) + html.slice(fin + ANCLA.length - '</span>'.length);
}

function docRana(cual, ancho) {
  const cuerpo = ancho <= 768
    ? '<div class="pace-lib"><div class="pace-lib-rejilla">' + tarjetaRana(cual) + '</div></div>'
    : '<div class="pace-lib pace-lib-cuerpo"><div class="pace-lib-main" style="border-left:none;padding-left:0">' +
      '<div class="pace-lib-rejilla" style="grid-template-columns:1fr">' + tarjetaRana(cual) + '</div></div></div>';
  return ['<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="../"><style>',
    '*{box-sizing:border-box}', CSS_TOK, CSS_LIB,
    'html,body{margin:0;background:var(--paper-3);font-family:var(--font-ui);color:var(--ink)}',
    'body{padding:14px 16px}',
    '</style></head><body>', cuerpo, '</body></html>'].join('\n');
}

module.exports = { docRail, docPrep, docPrepSinGlifo, docRana, tarjetaRana, CSS_TOK, CSS_LIB, esc, rutina, bocetoRana };

/* Si se invoca directamente, escribe la página. La composición vive en
   `maqueta-s175.pagina.js` para no pasar de 500 líneas (regla §1). */
if (require.main === module) require('./maqueta-s175.pagina.js').escribir();
