/* Arma docs/proposals/sobre-5nov.html con las fotos de fotos.js incrustadas (el visor de Ez no resuelve rutas).
   Uso: PACE_FOTOS=<carpeta de fotos.js> node pagina.js */
'use strict';
const fs = require('fs');
const path = require('path');
const FOTOS = path.join(process.env.PACE_FOTOS, 'sobre');
const SALIDA = path.resolve(__dirname, '../../../proposals/sobre-5nov.html');
const med = JSON.parse(fs.readFileSync(path.join(FOTOS, 'medidas.json'), 'utf8'));
const img = (n, alt) => {
  const b = fs.readFileSync(path.join(FOTOS, n + '.jpg')).toString('base64');
  return '<img alt="' + alt + '" src="data:image/jpeg;base64,' + b + '">';
};
const par = (op, extra) => {
  const m = (s) => '<figure class="m">' + img(op + '-' + s, 'Opción ' + op + ' en el móvil') + '<figcaption>' + (s === 'm' ? 'Móvil, claro' : 'Móvil, oscuro') + '</figcaption></figure>';
  const e = (s) => '<figure class="e">' + img(op + '-' + s, 'Opción ' + op + ' en el ordenador') + '<figcaption>' + (s === 'e' ? 'Ordenador, claro' : 'Ordenador, oscuro') + '</figcaption></figure>';
  return '<div class="fotos"><div class="fm">' + m('m') + m('m-osc') + (extra || '') + '</div><div class="fe">' + e('e') + e('e-osc') + '</div></div>';
};
const extra = (n, c) => '<figure class="m">' + img(n, c) + '<figcaption>' + c + '</figcaption></figure>';
/* La medida de la home: la misma con la hoja cerrada y abierta, en las 12 fotos. */
const todas = Object.keys(med).filter((k) => /-(m|e)(-osc)?$/.test(k));
const homeIgual = todas.every((k) => med[k].homeAntes === med[k].homeDespues);
const maxScrollHoja = Math.max.apply(null, todas.map((k) => med[k].scrollHoja));
const altoM = (op) => med[op + '-m'].alto;

let html = fs.readFileSync(path.join(__dirname, 'pagina.plantilla.html'), 'utf8');
const sust = {
  '{{PAR_A}}': par('A', extra('A-detalle-m', 'Un toque en «Novedades»')),
  '{{PAR_B}}': par('B', extra('B-2-m', 'El paso 2 de 3')),
  '{{PAR_C}}': par('C'),
  '{{BARRA_M}}': img('barra-m', 'Barra de arriba con el sobre cerrado, en el móvil'),
  '{{BARRA_ABIERTO}}': img('barra-abierto-m', 'Barra de arriba con el sobre abierto, en el móvil'),
  '{{BARRA_E}}': img('barra-e', 'Barra de arriba con el sobre cerrado, en el ordenador'),
  '{{HOME_IGUAL}}': homeIgual ? 'La home midió lo mismo con la hoja cerrada que con la hoja abierta en las doce fotos: ' + (med['A-m'].homeAntes) + ' px de scroll sobrante en las dos.' : 'ATENCIÓN: la home cambió de medida en alguna foto; revisar medidas.json.',
  '{{ALTO_A}}': String(altoM('A')), '{{ALTO_B}}': String(altoM('B')), '{{ALTO_C}}': String(altoM('C')),
  '{{VH}}': String(med['A-m'].vh),
  '{{SCROLL_HOJA}}': String(maxScrollHoja),
};
Object.keys(sust).forEach((k) => { html = html.split(k).join(sust[k]); });
fs.writeFileSync(SALIDA, html);
console.log(SALIDA, (html.length / 1e6).toFixed(2) + ' MB', JSON.stringify(sust, (k, v) => (typeof v === 'string' && v.length > 200 ? '…' : v)));
