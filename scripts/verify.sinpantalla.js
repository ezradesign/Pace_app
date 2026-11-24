'use strict';
/* PACE · verify.sinpantalla.js — NINGÚN TEXTO SIN PANTALLA (Ez, U6A del 24 nov. 2026)
   ============================================================
   Al retirar una pantalla se quedaban sus textos: 38 claves que nadie pedía (la bienvenida antigua,
   la barra lateral de antes, «Premium, pronto»…). No se veían, pero confundían a quien lee el código
   y a la otra cuenta. Falla si una clave de `app/i18n/strings/*` no la pide nadie.

   Cuenta como pedida una clave que sale entre comillas en el código (app/ sin los textos, PACE.html y
   landing/), o cuya raíz sale entre comillas: `t(clave + '.1')`, `'cal.resumen' + (uno ? '.uno' : '')`
   o `par(…, 'notify.canal.foco')` piden sus claves de más abajo. Lo que no ve: una clave armada a
   trozos sin ninguna raíz escrita entera. Si hace falta una así, va en SE_ARMA con su porqué. */

var fs = require('fs');
var path = require('path');
var sandbox = require('./verify.sandbox.js');

/* Claves que se piden armadas sin ninguna raíz escrita entera. Vacía a propósito: cada una, con su porqué. */
var SE_ARMA = {};

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) { if (p.replace(/\\/g, '/').indexOf('app/i18n/strings') === -1 && p.replace(/\\/g, '/').indexOf('app/i18n/content') === -1) recorrer(p, out); }
    else if (/\.(js|jsx|html)$/.test(d.name)) out.push(p);
  });
  return out;
}

function tandaSinPantalla(ctx, declarados) {
  console.log('\n[sin pantalla] Cada texto de app/i18n/strings lo pide alguna pantalla (U6A)');
  var sb = sandbox.nuevoSandbox();
  declarados.filter(function (f) { return f.indexOf('app/i18n/strings/') === 0; })
    .forEach(function (f) { var e = sandbox.cargar(ctx, sb, f); if (e) ctx.falla('sin pantalla: no se pudo evaluar ' + e); });
  var claves = Object.keys((sb.PACE_STRINGS || {}).es || {});
  if (claves.length < 1000) { ctx.falla('sin pantalla: GUARD, solo se leyeron ' + claves.length + ' claves'); return; }

  var fuentes = recorrer(path.join(ctx.ROOT, 'app'), []).concat(recorrer(path.join(ctx.ROOT, 'landing'), []), [path.join(ctx.ROOT, 'PACE.html')]);
  var src = fuentes.map(function (f) { return fs.readFileSync(f, 'utf8'); }).join('\n');
  var citada = function (s) { return src.indexOf("'" + s + "'") !== -1 || src.indexOf('"' + s + '"') !== -1 || src.indexOf('`' + s + '`') !== -1 || src.indexOf('`' + s + '${') !== -1; };

  var sueltas = claves.filter(function (k) {
    if (SE_ARMA[k] || citada(k)) return false;
    var partes = k.split('.');
    for (var i = partes.length - 1; i > 0; i--) {
      var raiz = partes.slice(0, i).join('.');
      /* Una raíz de una palabra sola («stats», «focus») es también un id de pantalla: cuenta solo con su punto. */
      if (citada(raiz + '.') || (i > 1 && citada(raiz))) return false;
    }
    return true;
  });
  if (sueltas.length) ctx.falla('sin pantalla: ' + sueltas.length + ' texto(s) que no pide nadie: ' + sueltas.join(', ') +
    '. Si su pantalla ya no existe, bórralos en es y en; si se piden armados, ponlos en SE_ARMA con su porqué.');
  else ctx.ok('las ' + claves.length + ' claves las pide alguna pantalla');
}

var NO_CUBRE = [
  'sin pantalla: una clave armada a trozos sin ninguna raíz escrita entera no se ve, y una clave pedida desde una pantalla que nunca se abre cuenta como pedida',
];

module.exports = { tandaSinPantalla: tandaSinPantalla, NO_CUBRE: NO_CUBRE };
