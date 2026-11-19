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
     · DESDE MAÑANA, SIEMPRE. Cada vez que PACE se abre o se va al fondo, se ponen los de los
       siete días siguientes, empezando por mañana, y se quitan los demás. Así, si hoy abriste PACE
       antes de tu hora, el de hoy ya no sale, y «Hoy es distinto» no deja un aviso colgado. Y si
       dejas de abrir PACE, deja de avisar al cabo de una semana: nada de «te echamos de menos».
       Salvo de madrugada: abrir PACE antes de las 4:00 no cuenta como abrirla antes de tu hora.
     · LAS PALABRAS DE LA TARJETA DE LA MAÑANA: «Hoy, como cada jueves» y «Jornada de 9:00 a
       17:00. Tu día ya está preparado.», en el idioma de la app al ponerlo.

   En la web no existe: sin un servidor, la web no puede avisar con PACE cerrado. Que suene en un
   móvil de verdad no se puede probar aquí (pasos en la página de la maqueta).

   `var`/`function` a propósito (un `const` no cruza la IIFE del artefacto).
   ============================================================ */

var PACE_ENTRADA_PRIMER_ID = 10;   // del 10 al 16: un aviso por cada uno de los siete días siguientes
var PACE_ENTRADA_DIAS = 7;
/* CON LAS DOS CAMPANADAS DE LA PAUSA (Ez, 16 nov. 2026: «Dos campanadas»; novena pasada externa,
   nº 6 y 7). Hasta ahora sonaba con el tono de avisos del móvil en Android, aunque el sonido de PACE
   estuviera apagado, y mudo en el iPhone. Ahora suena con `pausa.end`, el mismo .wav del fin de la
   pausa (`res/raw/pausa_aviso.wav` en Android, `pausa-aviso.wav` en el iPhone), y con el sonido
   apagado en Ajustes no suena: en Android, por su canal mudo; en el iPhone, sin `sound`.
   CANALES NUEVOS: Android no deja cambiar el sonido de un canal creado, y `pace_entrada` (0.206.0 y
   0.207.0) ya existe sin sonido en quien encendió el aviso. Se borra al poner los nuevos, para que
   en los ajustes de Android no salgan dos «Al empezar la jornada». */
var PACE_ENTRADA_CANAL = 'pace_entrada_campanas';
var PACE_ENTRADA_CANAL_MUDO = 'pace_entrada_mudo';
var PACE_ENTRADA_CANAL_VIEJO = 'pace_entrada';
var PACE_ENTRADA_SONIDO = 'pausa_aviso.wav';
var PACE_ENTRADA_SONIDO_IOS = 'pausa-aviso.wav';

/* Un texto de la app en su idioma, con sus {variables}: lo que el sistema enseña fuera de PACE. */
function paceEntradaTexto(s, clave, vars) {
  var l = (s && s.lang) || 'es', t = window.PACE_STRINGS || {};
  var v = (t[l] && t[l][clave]) || (t.en && t.en[clave]) || clave;
  Object.keys(vars || {}).forEach(function (k) { v = v.split('{' + k + '}').join(vars[k]); });
  return v;
}

/* paceEntradaAvisos(s, ahora) -> [{ id, at, title, body }] de los siete días que siguen a hoy.
   PURA respecto al reloj: `ahora` (ms) entra por parámetro. Vacía si el aviso está apagado, si no
   hay semana guardada o si todos esos días son libres.
   PASADA LA MEDIANOCHE (novena pasada externa, nº 10): abrir PACE a las 0:10 es aún la noche de
   ayer, no «abrirla antes de tu hora». Hasta las 4:00 (`PACE_ENTRADA_MADRUGADA`) los siete días
   empiezan hoy, y el de hoy cuenta si su hora de entrada aún no ha llegado. Los ids van por su
   puesto en esos siete días, así que siguen siendo del 10 al 16. */
var PACE_ENTRADA_MADRUGADA = 4;
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
    var primero = hoy.getHours() < PACE_ENTRADA_MADRUGADA ? 0 : 1;
    for (var i = 0; i < PACE_ENTRADA_DIAS; i++) {
      var dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + primero + i);
      var n = (dia.getDay() + 6) % 7;   // lunes = 0, como la semana tipo
      var tipo = semana[n];
      if (tipo !== 'jornada' && tipo !== 'media') continue;
      var desde = tipo === 'media' ? h.media.inicio : h.inicio;
      var hasta = tipo === 'media' ? h.media.salida : h.salida;
      if (!(desde >= 0) || !(hasta > desde)) continue;
      var at = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), Math.floor(desde / 60), desde % 60).getTime();
      if (at <= ahora) continue;
      out.push({
        id: PACE_ENTRADA_PRIMER_ID + i,
        at: at,
        title: paceEntradaTexto(s, 'ritmo.manana.titulo', { dia: dias[n] || '' }),
        body: paceEntradaTexto(s, 'notify.entrada.' + tipo, { inicio: ritmoHora(desde), salida: ritmoHora(hasta) }),
      });
    }
  } catch (e) { return []; }
  return out;
}

/* PRIMERO SE PONE, DESPUÉS SE QUITA LO QUE SOBRA (novena pasada externa, nº 3 y 12, 16 nov. 2026).
   Antes se quitaban los siete y se volvían a poner tres pasos después, también al irse al fondo: si
   el sistema congelaba PACE en medio, la mañana se quedaba sin aviso. Ahora se programa la lista
   (el mismo id sustituye al anterior, en Android y en el iPhone) y luego se quitan los ids del 10 al
   16 que no están en ella. Y si lo que toca poner es lo mismo que ya se puso (`firma`, en
   `pace.entrada.puesto`), no se toca nada: así irse al fondo, que es cuando el sistema congela,
   casi nunca llama al complemento. La primera vez de cada proceso se pone igual, si hay algo que
   poner: un cierre forzado o una actualización quitan las alarmas sin decirlo, y la firma seguiría
   diciendo que están. Si quitar falla, la firma no se guarda y se reintenta la vez siguiente (nº 12). */
var PACE_ENTRADA_CLAVE = 'pace.entrada.puesto';
var _paceEntrada = { cola: Promise.resolve(), yaPuso: false };

/* { firma, ids } de lo último que el sistema aceptó, o null. */
function paceEntradaLeer() {
  try {
    var v = JSON.parse(localStorage.getItem(PACE_ENTRADA_CLAVE) || 'null');
    return v && typeof v.firma === 'string' && Array.isArray(v.ids) ? v : null;
  } catch (e) { return null; }
}

/* Solo en las apps, donde no hay landing delante (`PACE_CARA` es de la web). */
function paceEntradaGuardar(firma, ids) {
  try { localStorage.setItem(PACE_ENTRADA_CLAVE, JSON.stringify({ firma: firma, ids: ids })); } catch (e) { paceAvisarNoGuarda(e); }
}

/* Solo en el móvil y con el permiso de avisos ya dado: el permiso se pide al encender el
   interruptor (paceEntradaEncender), nunca solo. En fila, para que dos llamadas seguidas no se pisen. */
function paceEntradaPoner() {
  if (typeof paceEsNativo !== 'function' || !paceEsNativo()) return Promise.resolve(null);
  _paceEntrada.cola = _paceEntrada.cola.then(paceEntradaPonerYa, paceEntradaPonerYa);
  return _paceEntrada.cola;
}

/* Lo que se le pide al sistema por cada aviso, tal cual: también es lo que firma. Android lee ISO
   en UTC con milisegundos. A SU HORA (novena pasada externa, nº 5): tras una noche con el móvil
   quieto, sin alarma exacta Android puede dejarlo para la siguiente ventana de mantenimiento y llegar
   mucho más tarde que la hora de entrada. Exacta solo si «Alarmas y recordatorios» ya está
   concedido, como el aviso del Foco (android.avisos.js): sin él, el complemento la pone inexacta. */
function paceEntradaNotificacion(a, android, exacta, sonido) {
  var n = { id: a.id, title: a.title, body: a.body };
  if (android) {
    n.schedule = { at: new Date(a.at).toISOString(), allowWhileIdle: true };
    n.isExactNotification = exacta === 'granted';
    n.channelId = sonido ? PACE_ENTRADA_CANAL : PACE_ENTRADA_CANAL_MUDO;
  } else {
    n.schedule = { at: new Date(a.at) };
    if (sonido) n.sound = PACE_ENTRADA_SONIDO_IOS;
  }
  return n;
}

/* Los dos canales, como los del Foco y la pausa (android.avisos.js): el sonoro nombra el .wav de
   res/raw y el mudo va con importancia baja, porque sin `sound` el complemento le deja el sonido de
   siempre del móvil. Crear uno que ya existe solo le cambia el nombre (el idioma). */
function paceEntradaCanales(ln, s) {
  if (typeof ln.createChannel !== 'function') return Promise.resolve();
  var desc = paceEntradaTexto(s, 'notify.canal.entrada.desc');
  var crear = function (op) { return Promise.resolve(ln.createChannel(op)).catch(function () {}); };
  return crear({ id: PACE_ENTRADA_CANAL, name: paceEntradaTexto(s, 'notify.canal.entrada'), description: desc, importance: 3, sound: PACE_ENTRADA_SONIDO })
    .then(function () { return crear({ id: PACE_ENTRADA_CANAL_MUDO, name: paceEntradaTexto(s, 'notify.canal.entrada.mudo'), description: desc, importance: 2 }); });
}

/* «Alarmas y recordatorios», mirado ahora (se puede haber cambiado en los ajustes de Android). */
function paceEntradaExacta() {
  if (typeof paceAndroidAvisoExactoMirar !== 'function') return Promise.resolve('denied');
  return Promise.resolve(paceAndroidAvisoExactoMirar()).then(null, function () { return 'denied'; });
}

function paceEntradaPonerYa() {
  var ln = paceNativoPlugin('LocalNotifications');
  if (!ln || typeof ln.cancel !== 'function' || typeof ln.schedule !== 'function') return null;
  var s = getState();
  /* Quien nunca ha tocado el interruptor no tiene nada puesto: ni se quita ni se pone nada, y el
     complemento solo oye a PACE por sus avisos de siempre (lo cuentan android-nativo y ios-avisos).
     Salvo que lo guardado diga que hay avisos puestos: una copia importada sin `avisoEntrada` (nº 4). */
  var tocado = typeof ((s && s.ritmo) || {}).avisoEntrada === 'boolean';
  var puestos = paceEntradaLeer();
  if (!tocado && !(puestos && puestos.ids.length)) return null;
  var avisos = tocado ? paceEntradaAvisos(s, Date.now()) : [];
  var android = pacePlataformaNativa() === 'android';
  /* El permiso se mira cada vez: el que guarda la app puede no haber llegado aún al abrir. */
  var permiso = null, exacta = null;
  var mirar = !avisos.length ? Promise.resolve()
    : Promise.resolve(typeof ln.checkPermissions === 'function' ? ln.checkPermissions() : { display: paceNativoAvisoPermiso() })
      .then(function (r) { permiso = r && r.display; }, function () { permiso = null; })
      .then(function () { return android && permiso === 'granted' ? paceEntradaExacta() : null; })
      .then(function (e) { exacta = e; });
  return mirar.then(function () {
    var sonido = !!(s && s.soundOn);
    var lista = permiso === 'granted' ? avisos.map(function (a) { return paceEntradaNotificacion(a, android, exacta, sonido); }) : [];
    var firma = JSON.stringify(lista);
    if (puestos && puestos.firma === firma && (_paceEntrada.yaPuso || !lista.length)) return null;
    var ids = lista.map(function (n) { return n.id; });
    var sobran = [];
    for (var i = 0; i < PACE_ENTRADA_DIAS; i++) {
      if (ids.indexOf(PACE_ENTRADA_PRIMER_ID + i) < 0) sobran.push({ id: PACE_ENTRADA_PRIMER_ID + i });
    }
    var canal = lista.length && android ? paceEntradaCanales(ln, s) : Promise.resolve();
    return canal.then(function () {
      return lista.length ? ln.schedule({ notifications: lista }) : null;
    }).then(function () {
      _paceEntrada.yaPuso = true;
      return sobran.length ? ln.cancel({ notifications: sobran }) : null;
    }).then(function () {
      paceEntradaGuardar(firma, ids);
      /* El canal de antes, ya sin ningún aviso que lo nombre. */
      if (lista.length && android && typeof ln.deleteChannel === 'function') {
        return Promise.resolve(ln.deleteChannel({ id: PACE_ENTRADA_CANAL_VIEJO })).catch(function () {});
      }
      return null;
    });
  }).catch(function () { return null; });
}

/* «BORRAR TODO» E IMPORTAR UNA COPIA QUITAN LOS SIETE (novena pasada externa, nº 4). Tras recargar,
   el estado nuevo no trae `avisoEntrada` y PACE no tocaba nada: los avisos puestos seguían saliendo
   una semana. «Borrar todo» se lleva también lo guardado de `pace.entrada.puesto`, así que se quitan
   antes de recargar, sin mirar qué hay puesto. Como mucho espera `PACE_ENTRADA_TOPE_MS`: si el
   sistema no contesta, se recarga igual. Si la copia trae el aviso encendido, se vuelve a poner al
   abrir. */
var PACE_ENTRADA_TOPE_MS = 1500;
function paceEntradaQuitar() {
  if (typeof paceEsNativo !== 'function' || !paceEsNativo()) return Promise.resolve(null);
  var quitar = function () {
    var ln = paceNativoPlugin('LocalNotifications');
    if (!ln || typeof ln.cancel !== 'function') return null;
    var ids = [];
    for (var i = 0; i < PACE_ENTRADA_DIAS; i++) ids.push({ id: PACE_ENTRADA_PRIMER_ID + i });
    return Promise.resolve(ln.cancel({ notifications: ids })).then(function () {
      try { localStorage.removeItem(PACE_ENTRADA_CLAVE); } catch (e) {}
    }).catch(function () { return null; });
  };
  _paceEntrada.cola = _paceEntrada.cola.then(quitar, quitar);
  return Promise.race([_paceEntrada.cola, new Promise(function (ok) { setTimeout(ok, PACE_ENTRADA_TOPE_MS); })]);
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

Object.assign(window, { paceEntradaAvisos, paceEntradaPoner, paceEntradaEncender, paceEntradaQuitar });
