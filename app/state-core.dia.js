/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.dia.js — el cambio de día con la app abierta.

   El relevo de día (`rolloverIfNeeded`) corre al arrancar y dentro de cada acción que suma (un
   vaso, una sesión, el Foco). Con la pestaña o la PWA abiertas toda la noche, o con el portátil
   cerrado y abierto por la mañana, ni se arranca ni se suma nada: la barra lateral decía «Agua 5 de 8»
   e Hidrátate enseñaba los vasos de ayer hasta el primer gesto, que saltaba de 5/8 a 1/8. Aquí se pide
   el relevo también en los dos momentos en que la mañana llega sin gesto:

   · al volver la página al frente (`visibilitychange`, que también llega al volver desde la caché
     del navegador): la pestaña de fondo y el Android que vuelve del fondo, donde los temporizadores
     han estado dormidos;
   · cada minuto con la página a la vista: la medianoche con la app delante y el portátil que se abre
     sin que el navegador avise de nada, porque al despertar corre los temporizadores vencidos. No vale
     un temporizador puesto a la medianoche: su cuenta se para con el equipo dormido y llegaría tarde.

   CON LA PÁGINA OCULTA NO SE HACE NADA, a propósito. Una pestaña de fondo guarda el estado de cuando se
   abrió; si relevara el día ella sola, escribiría esa copia vieja encima de lo que hiciste en la otra.
   Lo hace al volver al frente, y entonces parte de lo guardado y no de su copia (`ensureDayFresh(true)`):
   lo guardado ya lleva lo que hicieron las otras pestañas.

   `ensureDayFresh` no escribe si el día no ha cambiado (compara dos cadenas), así que mirar cada minuto
   ni toca `localStorage` ni despierta a otra pestaña. Un Foco en marcha sigue: sus minutos van al día
   en que termina, igual que antes, porque `completePomodoro` ya relevaba el día antes de contarlos.
   Carga después de state-core.jsx, que es quien define `ensureDayFresh`. */

var PACE_DIA_CADA_MS = 60 * 1000;

/* LA HORA TAMBIÉN PASA SIN GESTO. Lo que se pinta con la hora de ahora y no con el estado
   (las losetas de «A tu ritmo»: «Una hora · Hasta las 9:00», «Media jornada · De 8:00 a
   12:00») no se repintaba: con PACE abierto desde las 8:00 y sin tocar, a las 12:00 seguía
   ofreciendo «Hasta las 9:00». Quien lo pinta se suscribe con `usePaceMinuto()`, y el mismo
   vigilante del día avisa cuando cambia el minuto. Oculta no avisa: al volver al frente, sí. */
var paceMinutoVisto = Math.floor(Date.now() / 60000);
var paceMinutoOyentes = new Set();

function paceDiaMirar() {
  if (document.visibilityState === 'hidden') return;
  ensureDayFresh(true);
  var minuto = Math.floor(Date.now() / 60000);
  if (minuto !== paceMinutoVisto) {
    paceMinutoVisto = minuto;
    paceMinutoOyentes.forEach(function (f) { f(); });
  }
}

function paceMinutoSuscribir(f) {
  paceMinutoOyentes.add(f);
  return function () { paceMinutoOyentes.delete(f); };
}

/* El minuto que ya se ha avisado: repinta al componente cuando cambia. */
function usePaceMinuto() {
  return React.useSyncExternalStore(paceMinutoSuscribir, function () { return paceMinutoVisto; });
}

document.addEventListener('visibilitychange', paceDiaMirar);
setInterval(paceDiaMirar, PACE_DIA_CADA_MS);

Object.assign(window, { PACE_DIA_CADA_MS, paceDiaMirar, usePaceMinuto });
