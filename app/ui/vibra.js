/* PACE · app/ui/vibra.js — EL MÓVIL VIBRA AL RITMO DE MUEVE Y ESTIRA
   ===================================================================
   Ez, 15 nov. 2026 (docs/proposals/voz-cuerpo-15nov/, 5A 6A 7A): vibra donde hoy suena algo en el runner
   (un toque por repetición y en el 3, 2, 1; uno medio al empezar y al «Ya»; dos al cambiar de lado; uno
   largo al descansar; tres al acabar). Lo decide la fila «Vibrar» de Ajustes: «No», «Sin sonido» (de
   fábrica: vibra cuando el sonido de PACE está apagado) o «Siempre».

   DÓNDE SE PUEDE: en las apps, con el complemento Haptics de Capacitor (el iPhone no vibra desde la web, y
   el complemento trae a Android el permiso de vibrar, que la app no tenía); en Chrome de Android, con
   `navigator.vibrate`. En el iPhone por la web y en un ordenador no se puede, y la fila no sale
   (`paceVibraPosible`). Lo llama `playSound` con cada sonido de Mueve y Estira, antes de mirar el sonido. */

var PACE_VIBRA_TIPO = { 'move.rep': 'toque', 'move.warn': 'toque', 'move.start': 'medio', 'move.go': 'medio',
  'move.side': 'doble', 'move.rest': 'largo', 'move.end': 'fin' };
/* Android y la web, en milisegundos. Son un punto de partida: se afinan con el móvil en la mano. */
var PACE_VIBRA_MS = { toque: [30], medio: [70], doble: [60, 120, 60], largo: [250], fin: [80, 120, 80, 120, 80] };

function paceHaptics() {
  try {
    var C = window.Capacitor;
    if (!C || typeof C.isNativePlatform !== 'function' || !C.isNativePlatform()) return null;
    return (C.Plugins && C.Plugins.Haptics) || null;
  } catch (e) { return null; }
}

function paceVibraPosible() {
  if (paceHaptics()) return true;
  try { return typeof navigator.vibrate === 'function' && (navigator.maxTouchPoints || 0) > 0; } catch (e) { return false; }
}

function paceVibraModo(s) {
  var v = s && s.vibrar;
  return v === 'no' || v === 'siempre' ? v : 'sinSonido';
}

/* Vibra lo que toca a ese sonido. Devuelve si lo ha pedido. Nunca rompe nada. */
function paceVibra(nombre, s) {
  try {
    var tipo = PACE_VIBRA_TIPO[nombre];
    if (!tipo) return false;
    var modo = paceVibraModo(s);
    if (modo === 'no' || (modo === 'sinSonido' && s && s.soundOn)) return false;
    if (!paceVibraPosible()) return false;
    var H = paceHaptics();
    if (H) {
      var toque = function (estilo) { try { H.impact({ style: estilo }); } catch (e) {} };
      if (tipo === 'toque') toque('LIGHT');
      else if (tipo === 'medio') toque('MEDIUM');
      else if (tipo === 'doble') { toque('MEDIUM'); setTimeout(function () { toque('MEDIUM'); }, 180); }
      else if (tipo === 'largo') { try { H.vibrate({ duration: 250 }); } catch (e) {} }
      else { try { H.notification({ type: 'SUCCESS' }); } catch (e) {} }
      return true;
    }
    return !!navigator.vibrate(PACE_VIBRA_MS[tipo]);
  } catch (e) {
    return false;
  }
}

Object.assign(window, { paceVibra: paceVibra, paceVibraPosible: paceVibraPosible, paceVibraModo: paceVibraModo });
