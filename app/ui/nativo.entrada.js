/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   nativo.entrada.js — EL AVISO A TU HORA DE ENTRADA (Ez, 1A y 2A del 15 nov. 2026)
   ============================================================
   Hasta ahora PACE solo avisaba al acabar un Foco o una pausa: nada te traía de vuelta por la
   mañana. Esto pone un aviso a tu hora de entrada, para quien lo encienda en «Tu semana»
   (`ritmo.avisoEntrada`, RitmoSemanaTipo.jsx), en Android y en el iPhone. Maqueta elegida:
   docs/proposals/maquetas-uso-15nov/.

     · APAGADO DE FÁBRICA. Sin `avisoEntrada === true`, no se pone nada.
     · SOLO LOS DÍAS DE JORNADA O MEDIA de la semana guardada, a su hora de entrada; los días
       libres, nada («PACE te deja en paz»), y sin semana guardada tampoco.
     · DESDE MAÑANA, SIEMPRE. Cada vez que PACE se abre o se va al fondo, se quitan los avisos y
       se ponen los de los siete días siguientes, empezando por mañana. Así, si hoy abriste PACE
       antes de tu hora, el de hoy ya no sale, y «Hoy es distinto» no deja un aviso colgado. Y si
       dejas de abrir PACE, deja de avisar al cabo de una semana: nada de «te echamos de menos».
     · LAS PALABRAS DE LA TARJETA DE LA MAÑANA: «Hoy, como cada jueves» y «Jornada de 9:00 a
       17:00. Tu día ya está preparado.», en el idioma de la app al ponerlo.

   En la web no existe: sin un servidor, la web no puede avisar con PACE cerrado. Que suene en un
   móvil de verdad no se puede probar aquí (pasos en la página de la maqueta).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_ENTRADA_PRIMER_ID = 10;   // del 10 al 16: un aviso por cada uno de los siete días siguientes
var PACE_ENTRADA_DIAS = 7;
var PACE_ENTRADA_CANAL = 'pace_entrada';

/* Un texto de la app en su idioma, con sus {variables}: lo que el sistema enseña fuera de PACE. */
function paceEntradaTexto(s, clave, vars) {
  var l = (s && s.lang) || 'es', t = window.PACE_STRINGS || {};
  var v = (t[l] && t[l][clave]) || (t.en && t.en[clave]) || clave;
  Object.keys(vars || {}).forEach(function (k) { v = v.split('{' + k + '}').join(vars[k]); });
  return v;
}

/* paceEntradaAvisos(s, ahora) -> [{ id, at, title, body }] de los siete días que siguen a hoy.
   PURA respecto al reloj: `ahora` (ms) entra por parámetro. Vacía si el aviso está apagado, si no
   hay semana guardada o si todos esos días son libres. */
function paceEntradaAvisos(s, ahora) {
  var out = [];
  try {
    var r = (s && s.ritmo) || {};
    if (r.avisoEntrada !== true || typeof ritmoSemanaTipoDe !== 'function') return out;
    var semana = ritmoSemanaTipoDe(r.semanaTipo);
    if (!semana) return out;
    var h = typeof ritmoDe === 'function' ? ritmoDe(s).horario : null;
    if (!h) return out;
    var hoy = new Date(ahora);
    var dias = String(paceEntradaTexto(s, 'ritmo.dias')).split(',');
    for (var d = 1; d <= PACE_ENTRADA_DIAS; d++) {
      var dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + d);
      var n = (dia.getDay() + 6) % 7;   // lunes = 0, como la semana tipo
      var tipo = semana[n];
      if (tipo !== 'jornada' && tipo !== 'media') continue;
      var desde = tipo === 'media' ? h.media.inicio : h.inicio;
      var hasta = tipo === 'media' ? h.media.salida : h.salida;
      if (!(desde >= 0) || !(hasta > desde)) continue;
      out.push({
        id: PACE_ENTRADA_PRIMER_ID + d - 1,
        at: new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Math.floor(desde / 60), desde % 60).getTime(),
        title: paceEntradaTexto(s, 'ritmo.manana.titulo', { dia: dias[n] || '' }),
        body: paceEntradaTexto(s, 'notify.entrada.' + tipo, { inicio: ritmoHora(desde), salida: ritmoHora(hasta) }),
      });
    }
  } catch (e) { return []; }
  return out;
}

/* Quita los siete y pone los que tocan. Solo en el móvil y con el permiso de avisos ya dado: el
   permiso se pide al encender el interruptor (paceEntradaEncender), nunca solo. En fila, para que
   dos llamadas seguidas no se pisen. */
var _paceEntrada = { cola: Promise.resolve() };
function paceEntradaPoner() {
  if (typeof paceEsNativo !== 'function' || !paceEsNativo()) return Promise.resolve(null);
  _paceEntrada.cola = _paceEntrada.cola.then(paceEntradaPonerYa, paceEntradaPonerYa);
  return _paceEntrada.cola;
}

function paceEntradaPonerYa() {
  var ln = paceNativoPlugin('LocalNotifications');
  if (!ln || typeof ln.cancel !== 'function' || typeof ln.schedule !== 'function') return null;
  var ids = [];
  for (var i = 0; i < PACE_ENTRADA_DIAS; i++) ids.push({ id: PACE_ENTRADA_PRIMER_ID + i });
  var s = getState();
  var avisos = paceEntradaAvisos(s, Date.now());
  var android = pacePlataformaNativa() === 'android';
  /* El permiso se mira cada vez: el que guarda la app puede no haber llegado aún al abrir. */
  var permiso = null;
  return Promise.resolve(ln.cancel({ notifications: ids })).catch(function () {}).then(function () {
    if (!avisos.length) return null;
    return Promise.resolve(typeof ln.checkPermissions === 'function' ? ln.checkPermissions() : { display: paceNativoAvisoPermiso() })
      .then(function (r) { permiso = r && r.display; }, function () { permiso = null; });
  }).then(function () {
    if (!avisos.length || permiso !== 'granted') return null;
    var canal = android && typeof ln.createChannel === 'function'
      ? Promise.resolve(ln.createChannel({ id: PACE_ENTRADA_CANAL, name: paceEntradaTexto(s, 'notify.canal.entrada'),
          description: paceEntradaTexto(s, 'notify.canal.entrada.desc'), importance: 3 })).catch(function () {})
      : Promise.resolve();
    return canal.then(function () {
      return ln.schedule({ notifications: avisos.map(function (a) {
        var n = { id: a.id, title: a.title, body: a.body };
        /* Android lee ISO en UTC con milisegundos; un par de minutos tarde da igual (sin exacta). */
        if (android) { n.schedule = { at: new Date(a.at).toISOString(), allowWhileIdle: true }; n.channelId = PACE_ENTRADA_CANAL; }
        else n.schedule = { at: new Date(a.at) };
        return n;
      }) });
    });
  }).catch(function () { return null; });
}

/* Al guardar «Tu semana» con el interruptor encendido: pide el permiso de avisos si aún no está
   dado (dentro del toque de «Guardar mi semana») y pone los avisos. */
function paceEntradaEncender() {
  if (typeof paceEsNativo !== 'function' || !paceEsNativo()) return Promise.resolve(null);
  var permiso = paceNativoAvisoPermiso();
  var pedir = permiso === 'granted' ? Promise.resolve() : Promise.resolve(paceNativoAvisoPedir()).catch(function () {});
  return pedir.then(paceEntradaPoner);
}

/* Al abrir PACE y cada vez que se va al fondo o vuelve. */
(function () {
  if (typeof window === 'undefined') return;
  var arrancar = function () {
    if (typeof paceEsNativo !== 'function' || !paceEsNativo()) return;
    paceEntradaPoner();
    try {
      var app = paceNativoPlugin('App');
      if (app && typeof app.addListener === 'function') app.addListener('appStateChange', function () { paceEntradaPoner(); });
    } catch (e) {}
  };
  if (document.readyState === 'complete') setTimeout(arrancar, 0);
  else window.addEventListener('load', function () { setTimeout(arrancar, 0); });
})();

Object.assign(window, { paceEntradaAvisos, paceEntradaPoner, paceEntradaEncender });
