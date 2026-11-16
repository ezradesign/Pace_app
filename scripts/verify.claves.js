'use strict';
/* PACE · verify.claves.js — LAS DEUDAS DE CLAVES D-1 Y D-2 NO VUELVEN
   ============================================================
   D-1: `content/*` parcheaba el inglés por encima de `strings/*` y redefinía once
   `breathe.phase.*`; dos lo pisaban sin decirlo (las oceánicas: el valor de sessions.js
   no era el que se veía). Ahora cada clave vive en un solo sitio: falla si content/*
   vuelve a definir una clave que ya trae strings/*.
   D-2: dos claves de los Caminos decían «Hecho hoy» / «Done today» las dos. Falla si
   dos claves `path.*` / `paths.*` vuelven a decir lo mismo en los dos idiomas. */

var sandbox = require('./verify.sandbox.js');

function tandaClaves(ctx, declarados) {
  console.log('\n[claves] Cada clave en un solo sitio (D-1) y sin dos iguales en los Caminos (D-2)');
  var strings = declarados.filter(function (f) { return f.indexOf('app/i18n/strings/') === 0; });
  var content = declarados.filter(function (f) { return f.indexOf('app/i18n/content/') === 0; });
  var sb = sandbox.nuevoSandbox();
  strings.forEach(function (f) { var e = sandbox.cargar(ctx, sb, f); if (e) ctx.falla('claves: no se pudo evaluar ' + e); });
  var S = sb.PACE_STRINGS || { es: {}, en: {} };
  var base = new Set(Object.keys(S.en || {}));

  /* Cada content/* en un PACE_STRINGS vacío: lo que define él solo. */
  var pisa = [];
  content.forEach(function (f) {
    var sc = sandbox.nuevoSandbox();
    sc.PACE_STRINGS = { es: {}, en: {} };
    var e = sandbox.cargar(ctx, sc, f);
    if (e) { ctx.falla('claves: no se pudo evaluar ' + e); return; }
    ['es', 'en'].forEach(function (l) {
      Object.keys(sc.PACE_STRINGS[l] || {}).forEach(function (k) { if (base.has(k)) pisa.push(k + ' (' + f + ')'); });
    });
  });
  if (pisa.length) ctx.falla('claves: content/* redefine ' + pisa.length + ' clave(s) de strings/* (D-1): ' + pisa.join(', ') +
    '. La clave vive en un solo sitio: cambia su texto en strings/*.');
  else ctx.ok('content/* no redefine ninguna clave de strings/* (D-1)');

  var vistos = {}, dobles = [];
  Object.keys(S.es || {}).filter(function (k) { return /^paths?\./.test(k); }).forEach(function (k) {
    var par = JSON.stringify([S.es[k], S.en[k]]);
    if (vistos[par]) dobles.push(vistos[par] + ' = ' + k); else vistos[par] = k;
  });
  if (dobles.length) ctx.falla('claves: dos claves de los Caminos dicen lo mismo en los dos idiomas (D-2): ' + dobles.join(', '));
  else ctx.ok('ninguna clave path.* / paths.* repite el texto de otra (D-2)');
}

module.exports = { tandaClaves: tandaClaves };
