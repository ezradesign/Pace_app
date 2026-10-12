/* PACE · A tu ritmo · EL RESUMEN DEL DÍA
   ======================================
   El primer paso del motor de la semana (lo de pago de «A tu ritmo»), y el único que
   no se ve: cuando un día de «A tu ritmo» ya ha pasado, se guarda en el registro
   local (`pace.events.v1`, tipo `ritmo.day.closed`) una línea por cada parada que
   sirvió: la hora, las rutinas, si se hizo o se saltó, cuántas veces se pidió
   «Otra» y qué se descartó, y cuántos minutos de reunión hubo a su alrededor
   (media hora antes y después). Ez lo eligió el
   8 de octubre de 2026 para que el motor tenga semanas de datos cuando llegue
   (docs/traspaso/archivos/motor-semana/).

   POR QUÉ HACÍA FALTA: lo saltado (`dia.estados`) y los «Otra» (`dia.cambios`) viven
   en `ritmo.dia`, que es solo de hoy; al elegir el día siguiente se pisaban. Las
   pausas hechas y sus horas ya estaban en el registro (`session.completed`).

   CÓMO: el día no se guarda paso a paso; se RECOMPONE al resumirlo con la misma regla
   que lo sirvió (`ritmoMenuDe`, la de `ritmoMenu` con la fecha de ese día en vez de la
   de hoy) y se cruza con lo guardado. Lo congelado (`dia.pasado`) va tal cual. Lo que
   puede haber cambiado desde entonces —el veto de la pausa, lo abierto en premium—
   se lee como está hoy; es la misma regla y el desvío es pequeño.

   CUÁNDO: en dos sitios, y los dos dejan el resumen en una COLA dentro del estado
   (`ritmo.resumenes`) antes de enviarlo, porque el registro abre tarde (es asíncrono)
   y un resumen calculado no se puede perder:
     · `ritmoResumenAntesDePisar`, desde `ritmoGuardar`: toda escritura de «A tu
       ritmo» pasa por ahí, así que el día de ayer nunca se pisa sin resumirlo;
     · `ritmoResumirAhora`, al arrancar, al volver al frente y cada minuto con la
       página a la vista, como el cambio de día (state-core.dia.js).
   `ritmo.resumido` es la fecha del último día resumido: lo que impide resumir dos
   veces el mismo. La cola sale de uno en uno y cada resumen se quita solo cuando el
   almacén confirma que lo guardó. Con la página oculta no se hace nada, para no
   escribir encima de lo que hace otra pestaña (la misma regla del cambio de día). */

var RITMO_RESUMEN_COLA_MAX = 14;   /* dos semanas sin abrir el registro: lo demás no cabe */
var RITMO_RESUMEN_ALREDEDOR = 30;  /* minutos antes y después de una parada en que una reunión cuenta */

/* El día servido en `dia.fecha`, con lo congelado delante y marcado. */
function ritmoMenuDe(s, dia, cambios) {
  var r = (s && s.ritmo) || {};
  var h0 = Object.assign(ritmoHorarioInicial(), r.horario || {});
  h0.media = ritmoMedia(h0);
  var ocupado = r.ocupado && r.ocupado.fecha === dia.fecha && Array.isArray(r.ocupado.tramos) ? r.ocupado.tramos : [];
  var h = Object.assign({}, h0, { ahora: dia.desde != null ? dia.desde : h0.inicio, ocupado: ocupado });
  var agua = ((s || {}).water && s.water.goal) || 8;
  var pasado = dia.pasado && dia.pasado.length ? dia.pasado : null;
  var previos = pasado ? ritmoPrevios(pasado, dia.primerBloque || null, !!dia.pausaPendiente, dia.bloque || null) : null;
  var pozos = ritmoPozos(s, dia.fecha);
  var m = typeof semanaComponer === 'function'
    ? semanaComponer(dia.opcion, h, pozos, cambios, agua, semanaDe(dia.fecha), previos)
    : ritmoComponer(dia.opcion, h, pozos, cambios, agua, previos);
  if (!m) return null;
  var congelados = pasado ? ritmoHidratar(pasado).map(function (it) { return Object.assign({}, it, { congelado: true }); }) : [];
  return { items: congelados.concat(m.items), horario: h0, ocupado: ocupado };
}

/* Lo que se enseñó y se cambió con «Otra» en un plato: la regla sirve
   `libres[cambios % n]`, así que lo descartado es lo que salía con 0 … n−1. Solo en
   lo no congelado: en lo congelado recomponer devuelve el plato que quedó. */
function ritmoDescartados(s, dia, clave, veces) {
  var out = [];
  for (var k = 0; k < Math.min(veces, 5); k++) {
    var c = Object.assign({}, dia.cambios || {});
    c[clave] = k;
    var m = ritmoMenuDe(s, dia, c);
    var plato = null;
    (m ? m.items : []).forEach(function (it) {
      if (it.congelado) return;
      (it.platos || []).forEach(function (pl) { if (pl.clave === clave) plato = pl; });
    });
    if (plato && out.indexOf(plato.id) === -1) out.push(plato.id);
  }
  return out;
}

/* El resumen de un día, con la forma de `ritmo.day.closed` (events-payloads.js). */
function ritmoResumenDe(s, dia) {
  if (!dia || typeof dia.fecha !== 'string' || !dia.opcion) return null;
  var cambios = dia.cambios || {};
  var m = ritmoMenuDe(s, dia, cambios);
  if (!m) return null;
  var r = (s && s.ritmo) || {};
  var tipo = typeof ritmoSemanaTipoDe === 'function' ? ritmoSemanaTipoDe(r.semanaTipo) : null;
  var habitual = tipo ? tipo[semanaISO(dia.fecha).diaSemana - 1] : null;
  var reuniones = ritmoOcupadoLimpio(m.ocupado, 0, null, 0);
  var estados = dia.estados || {};
  var n = 0;
  var paradas = [];
  m.items.forEach(function (it) {
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre') return;
    n++;   /* el ordinal de `dia.estados` (ritmoOrdinal): cuenta también las paradas sin plato */
    if (!it.platos || !it.platos.length) return;
    /* Reunión ALREDEDOR de la parada, no encima: la regla compone esquivando lo ocupado,
       así que una parada recompuesta nunca queda pisada y «encima» daría siempre 0. Lo
       que el motor necesita saber es si una reunión rondaba la pausa saltada. */
    var reunion = 0;
    var a = it.desde - RITMO_RESUMEN_ALREDEDOR, b = it.desde + it.dur + RITMO_RESUMEN_ALREDEDOR;
    reuniones.forEach(function (o) { reunion += Math.max(0, Math.min(o.hasta, b) - Math.max(o.desde, a)); });
    paradas.push({
      hora: it.desde,
      tipo: it.tipo === 'cierre' ? 'cierre' : (it.larga ? 'larga' : 'pausa'),
      estado: estados[n] === 'hecha' || estados[n] === 'saltada' ? estados[n] : null,
      reunion: reunion,
      platos: it.platos.map(function (pl) {
        var veces = Number(cambios[pl.clave]) || 0;
        return { modulo: pl.modulo, id: pl.id, otras: veces,
                 antes: veces && !it.congelado ? ritmoDescartados(s, dia, pl.clave, veces) : [] };
      }),
    });
  });
  var media = dia.opcion === 'media';
  return { fecha: dia.fecha, opcion: dia.opcion, habitual: habitual,
           inicio: media ? m.horario.media.inicio : m.horario.inicio,
           salida: media ? m.horario.media.salida : m.horario.salida,
           paradas: paradas };
}

/* Desde `ritmoGuardar`, antes de aplicar el cambio: si el día guardado ya pasó y no
   se ha resumido, su resumen entra en la cola. Recibe y devuelve el `ritmo`. */
function ritmoResumenAntesDePisar(s, r) {
  var dia = r && r.dia;
  var hoy = typeof todayISO === 'function' ? todayISO() : '';
  if (!dia || typeof dia.fecha !== 'string' || !hoy || dia.fecha >= hoy || r.resumido === dia.fecha) return r;
  var resumen = null;
  try { resumen = ritmoResumenDe(s, dia); } catch (e) { resumen = null; }
  var cola = (Array.isArray(r.resumenes) ? r.resumenes : []).filter(function (x) { return x && x.fecha !== dia.fecha; });
  if (resumen) cola = cola.concat([resumen]).slice(-RITMO_RESUMEN_COLA_MAX);
  return Object.assign({}, r, { resumido: dia.fecha, resumenes: cola });
}

var ritmoResumenEnviando = false;

/* Resume lo pendiente y envía la cola, de uno en uno. */
function ritmoResumirAhora() {
  if (document.visibilityState === 'hidden' || ritmoResumenEnviando) return;
  try {
    var s = getState();
    var r = (s && s.ritmo) || {};
    if (ritmoResumenAntesDePisar(s, r) !== r) {
      setState(function (prev) {
        return Object.assign({}, prev, { ritmo: ritmoResumenAntesDePisar(prev, prev.ritmo || {}) });
      });
      r = getState().ritmo || {};
    }
    var cola = Array.isArray(r.resumenes) ? r.resumenes : [];
    if (!cola.length || typeof paceEventsCanWrite !== 'function' || !paceEventsCanWrite()) return;
    var primero = cola[0];
    ritmoResumenEnviando = true;
    var enviado = emitRitmoDia(primero, function () {
      ritmoResumenEnviando = false;
      setState(function (prev) {
        var pr = prev.ritmo || {};
        var resto = (Array.isArray(pr.resumenes) ? pr.resumenes : []).filter(function (x) { return !x || x.fecha !== primero.fecha; });
        return Object.assign({}, prev, { ritmo: Object.assign({}, pr, { resumenes: resto }) });
      });
      ritmoResumirAhora();
    }, function () { ritmoResumenEnviando = false; });
    if (!enviado) ritmoResumenEnviando = false;
  } catch (e) { ritmoResumenEnviando = false; }
}

/* Al arrancar el registro abre tarde: unos intentos al principio, y luego los mismos
   momentos que el cambio de día. */
[1500, 5000, 15000].forEach(function (ms) { setTimeout(ritmoResumirAhora, ms); });
document.addEventListener('visibilitychange', ritmoResumirAhora);
setInterval(ritmoResumirAhora, typeof PACE_DIA_CADA_MS === 'number' ? PACE_DIA_CADA_MS : 60 * 1000);

Object.assign(window, {
  RITMO_RESUMEN_COLA_MAX, RITMO_RESUMEN_ALREDEDOR, ritmoMenuDe, ritmoDescartados, ritmoResumenDe,
  ritmoResumenAntesDePisar, ritmoResumirAhora,
});
