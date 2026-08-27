/* PACE · scripts/audit/maqueta-s176.audio.js (sesión 176)
   ========================================================
   EL BLOQUE DE SONIDO DE AJUSTES, en variantes. Escribe en `_maqueta-s176/`.

   POR QUÉ EXISTE: el usuario pidió un interruptor propio para la voz y poder
   elegir `bradford`, y en la misma frase dijo el problema de fondo — «es
   demasiado menús para voz / selección de género / música (si luego vamos a
   meter música) y sonido general on-off». O sea: la pregunta no es dónde meter
   un interruptor más, es cómo NO acabar con cinco.

   LO QUE HAY HOY (`TweaksPanel.jsx`, eje «Audio»):
     · «Audio»  [Activado | Silenciado]   -> state.soundOn
     · casilla  «+ ambiente durante sesiones» -> state.ambientOn, indentada 16 px
       y visible sólo si soundOn
   La voz de s175 NO tiene control: va con `soundOn`, así que hoy no se puede
   quitar sin apagar todo el sonido.

   LA RESTRICCIÓN DE CAJA, que es la que decide: el panel mide 320 px de ancho
   con 20 de padding -> **280 px de contenido**. No es un diálogo ancho.

   LO QUE SE MIDE EN CADA MARCO: el alto del bloque de sonido en píxeles y
   cuántos controles tiene. Las dos cifras salen del propio marco.

   Sólo lee. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const M = require('./maqueta-s176.js');

/* ── el vocabulario visual REAL, copiado de sus archivos ─────────────────── */
/* Las pills y la casilla se escriben con estilos EN LÍNEA en TweaksPanel.jsx,
   así que aquí van sus valores exactos, no unos parecidos. Si aquel cambia,
   esta maqueta deja de ser fiel -- y por eso el valor va con su origen al lado. */
const PILL = (activa) => [
  'padding:6px 10px;font-size:11px;letter-spacing:.2px;cursor:pointer;',
  'font-family:var(--font-ui);border-radius:var(--r-sm);',
  'font-weight:' + (activa ? 500 : 400) + ';',
  'background:' + (activa ? 'var(--ink)' : 'var(--paper-2)') + ';',
  'color:' + (activa ? 'var(--paper)' : 'var(--ink-2)') + ';',
  'border:1px solid ' + (activa ? 'var(--ink)' : 'var(--line)') + ';',
].join('');

const pills = (opts) => '<div style="display:flex;flex-wrap:wrap;gap:4px">' +
  opts.map(o => '<button style="' + PILL(o.on) + '">' + o.n + '</button>').join('') + '</div>';

/* La casilla de «ambiente», tal cual la escribe TweaksPanel.jsx: 14x14, radio 3,
   marcada con --focus, y su etiqueta a 11 px con el «+» delante. */
const casilla = (marcada, texto, sangria) => [
  /* `data-casilla` es para el CONTADOR del badge, que cuenta `button` y se
     dejaba fuera las casillas: V2 decia «4 controles» teniendo siete. */
  '<div data-casilla style="margin-top:8px;margin-left:' + (sangria || 0) + 'px;display:flex;align-items:center;gap:8px">',
  '<span style="width:14px;height:14px;border-radius:3px;flex-shrink:0;display:grid;place-items:center;',
  '  border:1px solid ' + (marcada ? 'var(--focus)' : 'var(--line-2)') + ';',
  '  background:' + (marcada ? 'var(--focus)' : 'transparent') + ';color:var(--paper)">',
  marcada ? '<svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8L7 12L13 4"/></svg>' : '',
  '</span>',
  '<span style="font-size:11px;color:var(--ink-2);letter-spacing:.2px">' + texto + '</span>',
  '</div>',
].join('');

const meta = (txt) => '<div class="pace-meta" style="margin-bottom:4px">' + txt + '</div>';
const pista = (txt) => '<div style="font-size:10.5px;color:var(--ink-3);margin-bottom:6px;letter-spacing:.1px">' + txt + '</div>';
const sub = (txt) => '<div style="font-size:10.5px;color:var(--ink-3);margin:9px 0 5px;letter-spacing:.1px">' + txt + '</div>';

/* ── las variantes ──────────────────────────────────────────────────────── */
const VAR_AUDIO = {
  v1: {
    titulo: 'V1 · Plano — lo que sale de añadir sin pensar',
    nota: 'Cada cosa nueva, una fila más, todas al mismo nivel. Es contra lo que avisaste: cinco controles seguidos y ninguna jerarquía que diga cuál manda sobre cuál.',
    html: [
      meta('Audio'), pista('Sonidos de la sesión'),
      pills([{ n: 'Activado', on: true }, { n: 'Silenciado', on: false }]),
      casilla(true, '+ ambiente durante sesiones', 0),
      '<div style="margin-top:12px"></div>',
      meta('Voz'), pista('Locución de las fases'),
      pills([{ n: 'Activada', on: true }, { n: 'Sin voz', on: false }]),
      '<div style="margin-top:12px"></div>',
      meta('Timbre'),
      pills([{ n: 'Clara', on: true }, { n: 'Grave', on: false }]),
      '<div style="margin-top:12px"></div>',
      meta('Música'), pista('De fondo, por familia'),
      pills([{ n: 'Activada', on: false }, { n: 'Sin música', on: true }]),
    ].join(''),
  },
  v2: {
    titulo: 'V2 · Anidado — el patrón que ya usa «ambiente»',
    nota: 'Un maestro y sus casillas debajo, que es exactamente lo que hoy hace «+ ambiente». Cada cosa nueva es una casilla más, no un eje más. El timbre sólo aparece si la voz está puesta.',
    html: [
      meta('Audio'), pista('Sonidos de la sesión'),
      pills([{ n: 'Activado', on: true }, { n: 'Silenciado', on: false }]),
      casilla(true, '+ ambiente durante sesiones', 16),
      casilla(false, '+ música de fondo', 16),
      casilla(true, '+ voz que guía las fases', 16),
      '<div style="margin-left:38px;margin-top:6px">' +
        pills([{ n: 'Clara', on: true }, { n: 'Grave', on: false }]) + '</div>',
    ].join(''),
  },
  v3: {
    titulo: 'V3 · Por función — señal y fondo',
    nota: 'Cinco controles se vuelven DOS decisiones, porque hay dos funciones y no cinco: lo que MARCA la fase (un tono o una voz — nunca los dos) y lo que SUENA detrás (nada, ambiente o música — nunca dos a la vez). El maestro sigue arriba.',
    html: [
      meta('Audio'), pista('Sonidos de la sesión'),
      pills([{ n: 'Activado', on: true }, { n: 'Silenciado', on: false }]),
      sub('QUÉ MARCA LA FASE'),
      pills([{ n: 'Tono', on: false }, { n: 'Voz', on: true }]),
      '<div style="margin-left:16px;margin-top:6px">' +
        pills([{ n: 'Clara', on: true }, { n: 'Grave', on: false }]) + '</div>',
      sub('QUÉ SUENA DETRÁS'),
      pills([{ n: 'Nada', on: false }, { n: 'Ambiente', on: true }, { n: 'Música', on: false }]),
    ].join(''),
  },
  etiquetas: {
    titulo: 'Cómo se llaman las dos voces',
    nota: 'Medido decodificando la onda: sulafat ~193 Hz y bradford ~121 Hz — 1,59× de diferencia. «Clara / Grave» dice lo que se OYE; «Ella / Él» dice lo que se supone; los nombres de archivo no dicen nada a quien no los puso.',
    html: [
      sub('POR TIMBRE — lo que se oye'),
      pills([{ n: 'Clara', on: true }, { n: 'Grave', on: false }]),
      sub('POR GÉNERO — lo que se supone'),
      pills([{ n: 'Ella', on: true }, { n: 'Él', on: false }]),
      sub('POR NOMBRE — como se llaman los archivos'),
      pills([{ n: 'Sulafat', on: true }, { n: 'Bradford', on: false }]),
    ].join(''),
  },
};

/* ── el marco ───────────────────────────────────────────────────────────── */
/* El panel de Ajustes es `position:fixed` abajo a la derecha, 320 px de ancho
   y 20 de padding (TweaksPanel.jsx:145). Se reproduce ahí para juzgar el
   bloque en su sitio y no flotando en el centro de una página. */
const BADGE = [
  '<div class="mq-badge" id="mqb"></div>',
  '<script>function mqMide(){',
  '  var b=document.getElementById("mqbloque"), p=document.getElementById("mqpanel");',
  '  if(!b||!p){document.getElementById("mqb").textContent="GUARD: sin bloque";return;}',
  '  var ctr=b.querySelectorAll("button").length+b.querySelectorAll("[data-casilla]").length;',
  '  document.getElementById("mqb").innerHTML="panel <b>"+Math.round(p.getBoundingClientRect().width)',
  '    +" px</b> · contenido <b>"+Math.round(b.getBoundingClientRect().width)+" px</b> · el bloque mide <b>"',
  '    +Math.round(b.getBoundingClientRect().height)+" px</b> de alto · <b>"+ctr+"</b> controles";',
  '}',
  'function mqCuando(){var f=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();',
  '  f.then(function(){requestAnimationFrame(mqMide);});}',
  'if(document.readyState==="loading"){addEventListener("DOMContentLoaded",mqCuando);}else{mqCuando();}',
  '</scr' + 'ipt>',
].join('\n');

function docAudio(clave) {
  const v = VAR_AUDIO[clave];
  if (!v) { console.error('GUARD: variante de audio desconocida ' + clave); process.exit(2); }
  return [
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="../">',
    '<title>Ajustes · ' + M.esc(v.titulo) + '</title>',
    '<style>', M.CSS_TOK,
    '*{box-sizing:border-box}',
    'html,body{margin:0;height:100%;background:var(--paper-2);font-family:var(--font-ui);color:var(--ink)}',
    'button{font-family:inherit}',
    '.pace-meta{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3)}',
    /* el panel, con la geometría exacta de TweaksPanel.jsx */
    '#mqpanel{position:fixed;right:24px;bottom:24px;width:320px;max-height:calc(100vh - 48px);',
    '  overflow-y:auto;background:var(--paper);border:1px solid var(--line-2);',
    '  border-radius:var(--r-md);box-shadow:var(--sh-modal);padding:20px;z-index:80}',
    '.mq-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
    '.mq-tit{font-family:var(--font-display);font-style:italic;font-size:22px;font-weight:500}',
    '.mq-otro{margin-bottom:16px;opacity:.45}',
    '.mq-div{height:1px;background:var(--line);margin:14px 0}',
    '.mq-badge{position:fixed;left:0;right:0;bottom:0;z-index:99;background:var(--ink);',
    '  color:var(--paper);font-size:11px;letter-spacing:.04em;padding:5px 10px;text-align:center}',
    '.mq-badge b{color:#F0C98A}',
    '</style></head><body>', BADGE,
    '<div id="mqpanel">',
    '<div class="mq-hd"><div><div class="pace-meta">Ajustes</div>',
    '<div class="mq-tit">Ajustes</div></div>',
    '<div style="font-size:18px;color:var(--ink-3)">&times;</div></div>',
    /* el eje de idioma, apagado: sirve para ver el bloque de sonido EN SU SITIO
       y no aislado -- el vecino de arriba es parte del juicio */
    '<div class="mq-otro"><div class="pace-meta" style="margin-bottom:6px">Idioma</div>',
    pills([{ n: 'Auto', on: true }, { n: 'Español', on: false }, { n: 'English', on: false }]),
    '</div><div class="mq-div"></div>',
    '<div id="mqbloque">', v.html, '</div>',
    '<div class="mq-div"></div>',
    '<div class="mq-otro"><div class="pace-meta" style="margin-bottom:6px">Paleta</div>',
    pills([{ n: 'Crema', on: true }, { n: 'Oscuro', on: false }, { n: 'Papel', on: false }]),
    '</div>',
    '</div></body></html>',
  ].join('\n');
}

module.exports = { VAR_AUDIO, docAudio };

if (require.main === module) {
  const dir = path.join(ROOT, '_maqueta-s176');
  fs.mkdirSync(dir, { recursive: true });
  Object.keys(VAR_AUDIO).forEach(k =>
    fs.writeFileSync(path.join(dir, 'audio-' + k + '.html'), docAudio(k), 'utf8'));
  console.log('escritos ' + Object.keys(VAR_AUDIO).length + ' marcos de audio en _maqueta-s176/');
}
