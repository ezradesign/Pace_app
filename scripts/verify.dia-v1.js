/**
 * verify.dia-v1.js - PACE · red de seguridad LOCAL · LOS TEXTOS DE «HASTA v1», EN SU LISTA
 *
 * No es un script suelto: lo invoca `scripts/verify.js` como una tanda más.
 *
 * QUÉ VIGILA (Ez, 4A del 7 nov. 2026). El día de v1 se apaga `PREMIUM_ABIERTO_HASTA_V1`
 * (app/state-entitlement.jsx), y lo que hoy dice «hasta v1» tiene que cambiar a la vez:
 *   · en la app, cada clave de i18n cuyo texto (es o en) habla de v1 va en `PACE_TEXTOS_V1` con
 *     la que la sustituye desde v1, que existe en los dos idiomas y ya no habla de v1;
 *   · ningún archivo de `app/` pinta una clave de la lista sin pasar por `paceTextoV1(`;
 *   · en las páginas de la web, cada texto que habla de v1 (también su `data-en`) va dentro de
 *     un elemento con `data-v1`, que dice lo de después (vacío: se esconde) y lleva `data-v1-en`
 *     si el texto tiene inglés;
 *   · cada página con `data-v1` tiene su `var DIA_V1 = …;`, que vale lo contrario del
 *     interruptor: si se cambia uno sin los otros, falla.
 *
 * NO CUBRE: textos fuera de i18n y de las páginas (las fichas de las tiendas, los correos de
 * Stripe), ni frases que dependen de v1 sin nombrarlo («cuando llegue el plan al mes», que va con
 * el enlace del mensual y no con el interruptor).
 */

'use strict';

var fs = require('fs');
var path = require('path');
var sandbox = require('./verify.sandbox.js');

/* «v1», «versión 1» y «version 1», sin cazar «PACE1» ni «v10». */
var HABLA_V1 = /\bv1\b|\bversi[oó]n 1\b/i;
/* Y v1 dicho sin nombrarlo, como lo dice la app desde la 4A de Ez (10 nov. 2026): «mientras está en
   pruebas», «cuando salga a la venta». Solo para el censo de la app: lo de antes de v1 sigue en la
   lista aunque ya no diga «v1». No caza el «En pruebas.» del calendario, que es otra cosa. */
var HABLA_V1_SIN_NOMBRE = /salga a la venta|mientras est[aá] en pruebas|goes on sale|while it[’']?s in testing/i;
var PAGINAS = ['privacy.html', 'safety.html', 'calendario.html', 'premium/index.html', 'beta/index.html',
  'gracias/index.html', 'recuperar/index.html', 'desistir/index.html',
  'legal/aviso-legal/index.html', 'legal/condiciones/index.html', 'legal/desistimiento/index.html'];
var VACIOS = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
/* Atributos que no son texto para leer. */
var NO_TEXTO = /^(href|src|class|id|style|type|name|rel|for|data-v1|data-v1-en|data-en-src|width|height|loading|viewBox|d|fill|stroke.*|x|y|rx|cx|cy|r)$/i;

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, out);
    else if (/\.(js|jsx)$/.test(d.name)) out.push(p);
  });
  return out;
}

function atributos(cadena) {
  var out = {};
  var re = /([^\s=>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  var m;
  while ((m = re.exec(cadena))) out[m[1].toLowerCase()] = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4] != null ? m[4] : '';
  return out;
}

/* Lo que dice v1 sin su `data-v1` en una página, y los `data-v1` mal hechos. */
function revisarPagina(html) {
  var limpio = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  var fallos = [];
  var pila = [];
  var dentro = function () { return pila.some(function (e) { return e.v1; }); };
  var re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|([^<]+)/g;
  var m;
  while ((m = re.exec(limpio))) {
    if (m[4] != null) {
      if (HABLA_V1.test(m[4]) && !dentro()) fallos.push('«' + m[4].trim().slice(0, 70) + '» sin data-v1');
      continue;
    }
    var tag = m[2].toLowerCase();
    if (m[1]) {
      for (var i = pila.length - 1; i >= 0; i--) if (pila[i].tag === tag) { pila.length = i; break; }
      continue;
    }
    var a = atributos(m[3]);
    var conV1 = Object.prototype.hasOwnProperty.call(a, 'data-v1');
    Object.keys(a).forEach(function (k) {
      if (NO_TEXTO.test(k) || !HABLA_V1.test(a[k])) return;
      if (!conV1 && !dentro()) fallos.push('<' + tag + ' ' + k + '="' + a[k].slice(0, 60) + '…"> sin data-v1');
    });
    if (conV1) {
      if (HABLA_V1.test(a['data-v1']) || HABLA_V1.test(a['data-v1-en'] || '')) fallos.push('<' + tag + '> dice v1 también en su data-v1');
      if (a['data-v1'] && a['data-en'] != null && a['data-v1-en'] == null) fallos.push('<' + tag + '> con data-v1 y data-en, sin data-v1-en');
    }
    if (!VACIOS.test(tag) && !/\/\s*$/.test(m[3])) pila.push({ tag: tag, v1: conV1 });
  }
  return fallos;
}

function tandaDiaV1(ctx, declarados) {
  console.log('\n[dia-v1] Lo que dice «hasta v1» va en la lista del día de v1 y cambia con el interruptor');
  var leer = function (rel) { return fs.readFileSync(path.join(ctx.ROOT, rel), 'utf8'); };

  var guard = leer(path.join('app', 'state-entitlement.jsx'));
  var mInt = guard.match(/const PREMIUM_ABIERTO_HASTA_V1 = (true|false);/);
  if (!mInt) { ctx.falla('dia-v1: no encuentro `const PREMIUM_ABIERTO_HASTA_V1 = true|false;` en app/state-entitlement.jsx'); return; }
  var abierto = mInt[1] === 'true';

  var sb = sandbox.nuevoSandbox();
  var errores = [];
  declarados.filter(function (f) { return /^app\/i18n\/(strings|content)\//.test(f); })
    .concat(['app/state-entitlement.jsx'])
    .forEach(function (f) { var e = sandbox.cargar(ctx, sb, f); if (e) errores.push(e); });
  if (errores.length) { ctx.falla('dia-v1: no se pudo evaluar ' + errores.join('; ')); return; }
  var S = sb.PACE_STRINGS || {};
  var lista = sb.PACE_TEXTOS_V1;
  if (!lista || typeof lista !== 'object') { ctx.falla('dia-v1: app/state-entitlement.jsx no publica `PACE_TEXTOS_V1`'); return; }

  /* 1 · El censo: lo que habla de v1, en la lista. */
  var fuera = [];
  ['es', 'en'].forEach(function (lang) {
    Object.keys(S[lang] || {}).forEach(function (k) {
      var txt = String(S[lang][k]);
      if ((HABLA_V1.test(txt) || HABLA_V1_SIN_NOMBRE.test(txt)) && !Object.prototype.hasOwnProperty.call(lista, k) && fuera.indexOf(k) === -1) fuera.push(k);
    });
  });
  if (fuera.length) ctx.falla('dia-v1: ' + fuera.length + ' texto(s) de la app hablan de v1 y no están en `PACE_TEXTOS_V1` (app/state-entitlement.jsx): ' + fuera.join(', ') + '. Añádelos con el que dirán desde v1.');
  else ctx.ok('dia-v1: los ' + Object.keys(lista).length + ' textos de la app que hablan de v1 están en la lista');

  /* 2 · Cada entrada: existe, y lo de después también y ya no habla de v1. */
  var malas = [];
  Object.keys(lista).forEach(function (k) {
    ['es', 'en'].forEach(function (lang) {
      if (!(S[lang] && k in S[lang])) malas.push(k + ' no existe en ' + lang);
      var d = lista[k];
      if (d == null) return;
      if (!(S[lang] && d in S[lang])) malas.push(k + ' → ' + d + ', que no existe en ' + lang);
      else if (HABLA_V1.test(String(S[lang][d])) || HABLA_V1_SIN_NOMBRE.test(String(S[lang][d]))) malas.push(k + ' → ' + d + ', que también habla de v1 (' + lang + ')');
    });
  });
  if (malas.length) ctx.falla('dia-v1: la lista tiene entradas que no sirven: ' + malas.join('; '));
  else ctx.ok('dia-v1: cada texto de la lista tiene el suyo de después en es y en, sin v1');

  /* 3 · Nadie pinta una de la lista sin `paceTextoV1(`. */
  var sueltas = [];
  recorrer(path.join(ctx.ROOT, 'app'), []).forEach(function (abs) {
    var rel = path.relative(ctx.ROOT, abs).replace(/\\/g, '/');
    if (rel.indexOf('app/i18n/') === 0 || rel === 'app/state-entitlement.jsx') return;
    var lineas = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    lineas.forEach(function (linea, n) {
      Object.keys(lista).forEach(function (k) {
        var re = new RegExp('[\'"]' + k.replace(/\./g, '\\.') + '[\'"]', 'g');
        var m;
        while ((m = re.exec(linea))) {
          if (!/paceTextoV1\($/.test(linea.slice(0, m.index))) sueltas.push(rel + ':' + (n + 1) + ' (' + k + ')');
        }
      });
    });
  });
  if (sueltas.length) ctx.falla('dia-v1: se pinta un texto de «hasta v1» sin `paceTextoV1(`, y el día de v1 seguiría diciéndolo: ' + sueltas.join(', '));
  else ctx.ok('dia-v1: los textos de la lista solo se pintan con `paceTextoV1`');

  /* 4 · Las páginas: lo que dice v1, con su data-v1; y su DIA_V1, a la par. */
  var conLista = 0, conFallos = 0;
  PAGINAS.forEach(function (rel) {
    var abs = path.join(ctx.ROOT, rel);
    if (!fs.existsSync(abs)) return;
    var html = fs.readFileSync(abs, 'utf8');
    var fallos = revisarPagina(html);
    if (fallos.length) conFallos++;
    if (fallos.length) ctx.falla('dia-v1: ' + rel + ' tiene texto de «hasta v1» que no cambia el día de v1: ' + fallos.slice(0, 4).join('; ') + (fallos.length > 4 ? ' … (+' + (fallos.length - 4) + ')' : ''));
    if (!/\bdata-v1\b/.test(html.replace(/<!--[\s\S]*?-->/g, ''))) return;
    conLista++;
    var mDia = html.match(/var DIA_V1 = (true|false);/);
    if (!mDia || (mDia[1] === 'true') === abierto) conFallos++;
    if (!mDia) ctx.falla('dia-v1: ' + rel + ' lleva data-v1 y no tiene su `var DIA_V1 = true|false;`');
    else if ((mDia[1] === 'true') === abierto) ctx.falla('dia-v1: ' + rel + ' tiene DIA_V1 = ' + mDia[1] + ' y la app PREMIUM_ABIERTO_HASTA_V1 = ' + abierto + ': cámbialos a la vez.');
  });
  if (!conFallos) ctx.ok('dia-v1: ' + conLista + ' página(s) con su lista, a la par con la app (DIA_V1 = ' + !abierto + ')');
}

var NO_CUBRE = [
  'dia-v1: mira i18n de la app y las páginas de la web; las fichas de las tiendas y los correos que hablen de v1 se cambian a mano, y de las frases que hablan de v1 sin nombrarlo solo ve las de la 4A del 10 nov. («cuando salga a la venta», «mientras está en pruebas»)',
];

module.exports = { tandaDiaV1: tandaDiaV1, revisarPagina: revisarPagina, NO_CUBRE: NO_CUBRE, HABLA_V1_SIN_NOMBRE: HABLA_V1_SIN_NOMBRE };
