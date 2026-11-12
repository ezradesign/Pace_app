/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL ARO CON EL HORARIO ABIERTO (Ez, 11 nov. 2026: la A de docs/proposals/aro-horario-10nov).

   Con «¿Cuánto trabajas hoy?» abierto en escritorio, el panel del horario hace de horizonte y
   no lleva rótulo encima: con el solape de las actividades (16 % de D) su canto subía hasta
   dejar ver el 82 % del aro, y el aro crecía al abrirlo (447 → 487 px a 1920×860). Ez: «queda
   raro». Con las actividades y con la rutina elegida se ve el 89-90 %, y esos dos le gustan.

   Lo que pide la A, y lo que este archivo le da al motor (home-geometry.js):
     · el canto del panel corta el aro donde lo cortan las actividades, a 0,925 D desde
       arriba: solape = 7,5 % de D más la banda de padding que hay encima del canto;
     · el aro tiene el tamaño que tenía con las actividades, así que abrir el horario no lo
       mueve. Ese tamaño solo se puede MEDIR con las actividades en pantalla, y la pregunta
       abierta se guarda para todo el día: al recargar, la app abre ya con el horario. Por
       eso se recuerda por ventana e idioma, en `pace.aro.carta.v1` (prefijo `pace.`, así
       que «Borrar todo» se lo lleva). Sin recuerdo (una ventana que nunca vio las
       actividades), el motor toma el mayor aro que cabe con ese mismo corte: unos píxeles
       más pequeño, nunca cortado ni con scroll.
   Solo lee y guarda números: no sabe de React ni del estado de la app. */

var PACE_ARO_CANTO_HORARIO = 0.075;   // fracción de D que el canto del panel sube sobre el aro
var PACE_ARO_CARTA_CLAVE = 'pace.aro.carta.v1';
var PACE_ARO_CARTA_MAX = 24;          // ventanas recordadas; las más viejas se olvidan
var paceAroCartaMemo = null;

/* ¿Está abierto el horario en la piel de escritorio? El panel de la pregunta va en el DOM
   también en el móvil (oculto por la media query), así que cuenta solo si se pinta. */
function paceAroHorarioAbierto() {
  var p = document.querySelector('.pace-rt-esc[data-pace-ritmo-estado="pregunta"]');
  return !!(p && p.getClientRects().length);
}
/* ¿Están las actividades con la tarjeta de «¿Cuánto trabajas hoy?»? Es el tamaño que se recuerda. */
function paceAroCartaVisible() {
  var t = document.querySelector('[data-pace-ritmo-tarjeta]');
  return !!(t && t.getClientRects().length && document.querySelector('[data-pace-activitybar-chip]'));
}
/* La ventana se dice con el hueco de la home (ya cuenta la barra lateral) y el idioma. */
function paceAroCartaClave(body) {
  return body.clientWidth + 'x' + body.clientHeight + '|' + (document.documentElement.lang || '');
}
function paceAroCartaLeer() {
  if (paceAroCartaMemo) return paceAroCartaMemo;
  try { paceAroCartaMemo = JSON.parse(localStorage.getItem(PACE_ARO_CARTA_CLAVE) || '{}') || {}; } catch (e) { paceAroCartaMemo = {}; }
  if (typeof paceAroCartaMemo !== 'object' || Array.isArray(paceAroCartaMemo)) paceAroCartaMemo = {};
  return paceAroCartaMemo;
}
function paceAroCartaRecordado(clave) {
  var d = paceAroCartaLeer()[clave];
  return typeof d === 'number' && d > 0 ? d : null;
}
/* Solo escribe si cambia: el motor corre en cada resize y en cada cambio del stack. Con la landing
   delante, nunca: `landing/cara.js` enseña la app a quien tenga una clave `pace.*`, y hoy no llega
   aquí solo porque la app no monta; la guarda no depende de eso (como `persistState`). */
function paceAroCartaRecordar(clave, D) {
  if (window.PACE_CARA === 'landing') return;
  var m = paceAroCartaLeer();
  if (m[clave] === D) return;
  delete m[clave];
  m[clave] = D;
  var claves = Object.keys(m);
  for (var i = 0; i < claves.length - PACE_ARO_CARTA_MAX; i++) delete m[claves[i]];
  try { localStorage.setItem(PACE_ARO_CARTA_CLAVE, JSON.stringify(m)); } catch (e) { paceAvisarNoGuarda(e); }
}

Object.assign(window, {
  PACE_ARO_CANTO_HORARIO, paceAroHorarioAbierto, paceAroCartaVisible, paceAroCartaClave,
  paceAroCartaRecordado, paceAroCartaRecordar,
});
