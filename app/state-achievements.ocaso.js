/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   OCASO Y BÚHO, CON LO QUE PREMIAN AHORA (Ez, D-6 D del 11 nov. 2026: «D adaptarlos»)
   ============================================================
   Premiaban trasnochar: Ocaso, cinco días con sesión después de las 21 h, y Búho, usar PACE entre
   las 2 y las 4. Es lo contrario de una jornada que acaba a su hora. Conservan su dibujo, su id y su
   nombre, así que quien ya los tenía los conserva; cambia lo que premian:

     · OCASO (`master.dusk`): cinco jornadas cerradas a su hora. Cuenta el día en que la jornada
       llega a «Jornada cerrada» con todos sus bloques hechos (no la que se cierra sola por la hora
       con bloques sin hacer), y no lo cuenta si ese día se empezó un Foco después de la hora de
       salida (`ocasoTarde`). Si el Foco tardío llega después de cerrar, el día sale de la cuenta,
       salvo que ese día ya diera el logro: un logro no se quita.
     · BÚHO (`secret.night.owl`, sigue secreto): contestar «¿Te ayudó?» 25 veces (Sí, Un poco o
       No; «Ahora no» no cuenta). Sale de los contadores de `routineFeedback`, que ya se guardaban:
       quien ya llevaba 25 lo recibe en su próxima sesión.

   Se miran desde `checkTimeOfDayAchievements` (al acabar cualquier sesión), desde el final de un
   Foco (`paceOcasoFoco`) y al contestar (`recordRoutineFeedback`). Nunca lanzan.
   ============================================================ */

var PACE_OCASO_DIAS = 5;
var PACE_BUHO_RESPUESTAS = 25;

/* Al acabar un Foco de `minutos`: si empezó después de la hora de salida, hoy no cuenta. */
function paceOcasoFoco(minutos) {
  try {
    var p = typeof ritmoPlan === 'function' ? ritmoPlan(getState()) : null;
    if (!p || !p.m || typeof ritmoTrasElFin !== 'function') return;
    var empezo = Date.now() - (Number(minutos) || 0) * 60000;
    if (ritmoTrasElFin(p.m, empezo)) setState({ ocasoTarde: todayISO() });
  } catch (e) {}
}

/* ¿Hoy es una jornada cerrada a su hora? Apunta o quita el día y da el logro con cinco. */
function paceOcasoMirar() {
  try {
    var s = getState();
    var hoy = todayISO();
    var lista = Array.isArray(s.ocasoDias) ? s.ocasoDias.slice() : [];
    var esta = lista.indexOf(hoy) >= 0;
    var tarde = s.ocasoTarde === hoy;
    var p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
    var cerrada = !!p && p.total > 0 && p.hechos >= p.total;
    if (cerrada && !tarde && !esta) {
      lista = lista.concat([hoy]).slice(-PACE_OCASO_DIAS * 3);
      setState({ ocasoDias: lista });
    } else if (tarde && esta) {
      lista = lista.filter(function (d) { return d !== hoy; });
      setState({ ocasoDias: lista });
    }
    if (lista.length >= PACE_OCASO_DIAS) unlockAchievement('master.dusk');
  } catch (e) {}
}

/* Las veces que se contestó «¿Te ayudó?», de todas las rutinas. */
function paceBuhoRespuestas(s) {
  var fb = (s && s.routineFeedback && typeof s.routineFeedback === 'object') ? s.routineFeedback : {};
  var n = 0;
  Object.keys(fb).forEach(function (id) {
    var r = fb[id] || {};
    ['yes', 'some', 'no'].forEach(function (k) { var v = Number(r[k]); if (isFinite(v) && v > 0) n += v; });
  });
  return n;
}

function paceBuhoMirar() {
  try {
    if (paceBuhoRespuestas(getState()) >= PACE_BUHO_RESPUESTAS) unlockAchievement('secret.night.owl');
  } catch (e) {}
}

Object.assign(window, { PACE_OCASO_DIAS, PACE_BUHO_RESPUESTAS, paceOcasoFoco, paceOcasoMirar, paceBuhoRespuestas, paceBuhoMirar });
