/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   valoracion.js — LA VENTANA PARA VALORAR PACE EN LA TIENDA, UNA SOLA VEZ
   ============================================================
   Ez, 15 oct. 2026 («Cómo se vende PACE completo», punto 6): la valoración se pide una
   sola vez, con la ventana de la tienda (en Android, la In-App Review de Google Play), al
   terminar la quinta pausa entera. Google no dice si la persona valoró o la cerró, así
   que no se vuelve a lanzar nunca. Nunca en la bienvenida ni en la web.

   LA CUENTA. Una pausa entera es una Respira, un Mueve o un Estira que llegó a su final:
   la misma que da logros (`entera`, state-achievements.jsx). La que se termina antes o
   salta un ejercicio no cuenta, y «Un momento para moverte» tampoco (no es una pausa).
   Se cuenta desde la versión que trae esto y solo donde hay ventana que abrir: en la web
   el estado no apunta nada.

   EL MOMENTO. Con la quinta, la ventana espera a que no haya nada delante: ni la pantalla
   final de la pausa (con su «¿Te ayudó?»), ni otro diálogo, ni el aviso de un sello, ni
   PACE en el fondo. Si PACE se cierra antes, sale al terminar la siguiente pausa entera.

   UNA SOLA VEZ: `valoracion.pedida` se apunta ANTES de llamar a la tienda, porque la tienda
   no contesta si salió (PaceValoracion.java).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_VALORACION_PAUSAS = 5;
/* Dónde hay ventana de la tienda montada. */
var PACE_VALORACION_PLATAFORMAS = ['android'];
/* Lo que se espera, como mucho, a que la pantalla de la pausa se cierre (10 min). */
var PACE_VALORACION_ESPERA_MS = 10 * 60 * 1000;
var _paceValoracion = { espera: null };

function paceValoracionPlugin() {
  try {
    if (PACE_VALORACION_PLATAFORMAS.indexOf(pacePlataformaNativa()) === -1) return null;
    var p = paceNativoPlugin('PaceValoracion');
    return p && typeof p.pedir === 'function' ? p : null;
  } catch (e) { return null; }
}

function paceValoracionEstado() {
  var s = typeof getState === 'function' ? getState() : null;
  var v = s && s.valoracion;
  return v && typeof v === 'object' && !Array.isArray(v) ? v : { pausas: 0, pedida: null };
}

/* Lo llaman las tres `complete*Session` al acabar una pausa; `entera === false` no cuenta. */
function paceValoracionPausa(entera) {
  try {
    if (entera === false || !paceValoracionPlugin()) return;
    var v = paceValoracionEstado();
    if (v.pedida) return;
    var n = (Number(v.pausas) || 0) + 1;
    setState({ valoracion: { pausas: n, pedida: null } });
    if (n >= PACE_VALORACION_PAUSAS) paceValoracionEsperar();
  } catch (e) {}
}

/* ¿Hay algo delante que la ventana taparía? */
function paceValoracionDelante() {
  if (document.hidden) return true;
  return !!document.querySelector('[data-pace-session-root], [role="dialog"], [data-pace-toast]');
}

function paceValoracionEsperar() {
  if (_paceValoracion.espera) return;
  var desde = Date.now();
  _paceValoracion.espera = setInterval(function () {
    if (paceValoracionDelante() && Date.now() - desde < PACE_VALORACION_ESPERA_MS) return;
    clearInterval(_paceValoracion.espera);
    _paceValoracion.espera = null;
    if (!paceValoracionDelante()) paceValoracionPedir();
  }, 500);
}

function paceValoracionPedir() {
  try {
    var v = paceValoracionEstado();
    if (v.pedida || (Number(v.pausas) || 0) < PACE_VALORACION_PAUSAS) return;
    var p = paceValoracionPlugin();
    if (!p) return;
    setState({ valoracion: { pausas: v.pausas, pedida: Date.now() } });
    Promise.resolve(p.pedir()).catch(function () {});
  } catch (e) {}
}

Object.assign(window, { paceValoracionPausa, paceValoracionPedir, PACE_VALORACION_PAUSAS, PACE_VALORACION_PLATAFORMAS });
