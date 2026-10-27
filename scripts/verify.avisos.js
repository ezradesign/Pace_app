'use strict';
/* PACE · verify.avisos.js — NINGÚN AVISO DEL NAVEGADOR EN LA APP
   ============================================================
   Borrar todo e importar una copia preguntaban con `confirm()`, y la copia que entraba sin su
   registro avisaba con `alert()`: la ventanita «pacegrass.app dice…», los únicos avisos de PACE
   que no eran de PACE (Ez, 3A del 27 oct. 2026). Ahora preguntan con `AjustesAviso`
   (app/tweaks/TweaksPanel.parts.jsx), que es el Modal de la app. Esto falla si vuelve un
   `confirm(`, `alert(` o `prompt(` en app/. Los comentarios no cuentan. */

var fs = require('fs');
var path = require('path');

var LLAMADA = /(?:^|[^.\w$])(?:window\.)?(confirm|alert|prompt)\s*\(/m;

function recorrer(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (d) {
    var p = path.join(dir, d.name);
    if (d.isDirectory()) recorrer(p, out);
    else if (/\.(js|jsx)$/.test(d.name)) out.push(p);
  });
  return out;
}

function sinComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\'"])\/\/.*$/gm, '$1');
}

function tandaAvisos(ctx) {
  console.log('\n[avisos] Lo que pregunta la app lo pregunta PACE, no el navegador');
  var malos = [];
  recorrer(path.join(ctx.ROOT, 'app'), []).forEach(function (p) {
    var m = sinComentarios(fs.readFileSync(p, 'utf8')).match(LLAMADA);
    if (m) malos.push(path.relative(ctx.ROOT, p).replace(/\\/g, '/') + ' (' + m[1] + ')');
  });
  if (malos.length) ctx.falla('aviso del navegador en la app: ' + malos.join(', ') + '. Pregunta con AjustesAviso (TweaksPanel.parts.jsx) o con el Modal de PACE.');
  else ctx.ok('Ningún confirm(), alert() ni prompt() en app/');
}

module.exports = { tandaAvisos: tandaAvisos };
