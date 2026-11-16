'use strict';
/* PACE · verify.claves.js — LAS DEUDAS DE CLAVES D-1, D-2 Y D-3 NO VUELVEN
   ============================================================
   D-1: `content/*` parcheaba el inglés por encima de `strings/*` y redefinía once
   `breathe.phase.*`; dos lo pisaban sin decirlo (las oceánicas: el valor de sessions.js
   no era el que se veía). Ahora cada clave vive en un solo sitio: falla si content/*
   vuelve a definir una clave que ya trae strings/*.
   D-2: dos claves de los Caminos decían «Hecho hoy» / «Done today» las dos. Falla si
   dos claves `path.*` / `paths.*` vuelven a decir lo mismo en los dos idiomas.
   D-3: las claves de los Caminos vivían en dos espacios, `path.*` (20) y `paths.*`. Ahora todas
   en `paths.*`: falla si vuelve una `path.*`, y si el código pide una clave de los Caminos que
   no existe. Los ids de los Caminos (`path.dawn`, `path.tea`…) son datos guardados y no se
   tocan; sus textos ya eran `paths.path.dawn.name`. */

var fs = require('fs');
var path = require('path');
var sandbox = require('./verify.sandbox.js');

/* Un t('paths.algo') o tn('paths.algo', …) con la clave entera escrita (no un prefijo). */
var PIDE = /\btn?\(\s*['"](paths?\.[\w.]*\w)['"]/g;

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) { if (d.name !== 'i18n') recorrer(p, out); }
    else if (/\.(js|jsx)$/.test(d.name)) out.push(p);
  });
  return out;
}

function tandaClaves(ctx, declarados) {
  console.log('\n[claves] Cada clave en un solo sitio (D-1), sin dos iguales en los Caminos (D-2) y todas en paths.* (D-3)');
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

  var sueltas = Array.from(new Set(Object.keys(S.en || {}).concat(Object.keys(S.es || {}))))
    .filter(function (k) { return /^path\./.test(k); });
  if (sueltas.length) ctx.falla('claves: ' + sueltas.length + ' clave(s) de los Caminos en path.* (D-3): ' + sueltas.join(', ') +
    '. Van todas en paths.* (path.dawn y compañía son ids de Caminos, no claves).');
  else ctx.ok('las claves de los Caminos, todas en paths.* (D-3)');

  /* Y lo que pide el código existe: un t('path.runner.exit') que se quedara sin renombrar
     pintaría la clave en vez del texto, y los Caminos están ocultos hasta v1 (nadie lo vería). */
  var faltan = [];
  recorrer(path.join(ctx.ROOT, 'app'), []).forEach(function (f) {
    var src = fs.readFileSync(f, 'utf8'), m;
    PIDE.lastIndex = 0;
    while ((m = PIDE.exec(src))) {
      if (S.es[m[1]] === undefined || S.en[m[1]] === undefined) faltan.push(m[1] + ' (' + path.relative(ctx.ROOT, f).split(path.sep).join('/') + ')');
    }
  });
  if (faltan.length) ctx.falla('claves: el código pide claves de los Caminos que no existen: ' + faltan.join(', '));
  else ctx.ok('cada t() de los Caminos en el código tiene su clave en los dos idiomas');
}

module.exports = { tandaClaves: tandaClaves };
