/* PACE · Estadísticas · «QUÉ TE AYUDA», EL CÁLCULO (Ez, 1A 2A 3A del 27 oct. 2026)
   =================================================================================
   Lo último de pago de Estadísticas: lo que se repite en tus pausas y tus Focos, dicho en una
   frase y con de dónde sale. Ez eligió sobre la maqueta (docs/proposals/que-te-ayuda-27oct.html)
   TRES IDEAS, y cada una sale sola cuando llega a su umbral; antes, nada:

     1. Lo que te sienta bien: las rutinas a las que contestaste «Sí» o «Un poco» en «¿Te ayudó?»
        (`feedback.answered`). Una rutina entra con 3 respuestas en 2 días distintos y si te ayudó
        más de la mitad de las veces; la idea sale con 2 rutinas así, y enseña hasta 3.
     2. Tu hora de Foco: cuándo empiezan los Focos que terminas (`session.completed`, módulo
        focus, `natural`). Sale con 12 Focos en 5 días. Una franja se nombra si tiene la mitad o
        más, y dentro de ella las horas seguidas más cortas que juntan dos tercios.
     3. Después del Foco: cuántos de esos Focos tuvieron una pausa de Respira, Mueve o Estira que
        empezó en los 15 minutos siguientes. Sale con 10 Focos en 4 días; mañana y tarde por
        separado cuando cada una llega a 10.

   LOS FOCOS A MEDIAS NO CUENTAN, y no porque se filtren: salir antes no emite nada (§6.3 del
   esquema). Por eso esto dice cuándo terminas tus Focos, nunca con qué duración «te cunden»: el
   otro lado de esa cuenta no existe. Un `early` de Foco (hoy no lo emite nadie) tampoco cuenta.

   CUENTA VECES, como la carta del lunes: «5 de 6», nunca un porcentaje ni una nota. Mira lo que
   guarda el registro (los últimos 120 días) y cada idea dice cuántas semanas abarca.

   PURO: entra la lista de eventos y el día de hoy, y sale lo que se puede decir. Las horas, en la
   hora de aquí del instante (`occurredAt`), y el inicio de una sesión es su fin menos lo que duró
   (`elapsedSeconds`): nunca se resta a una hora de reloj (H3, el cambio de hora).
   `var` y `function`: el build solo re-expone esos nombres. */

var AYUDA_BIEN_RESPUESTAS = 3;   /* respuestas de una rutina para entrar */
var AYUDA_BIEN_DIAS = 2;         /* en días distintos */
var AYUDA_BIEN_RUTINAS = 2;      /* rutinas así para que salga la idea */
var AYUDA_BIEN_ENSENA = 3;       /* las que se enseñan como mucho */
var AYUDA_HORA_FOCOS = 12;
var AYUDA_HORA_DIAS = 5;
var AYUDA_TRAS_FOCOS = 10;
var AYUDA_TRAS_DIAS = 4;
var AYUDA_TRAS_MIN = 15;         /* la pausa empieza en los 15 minutos siguientes */
var AYUDA_TRAS_FRANJA = 10;      /* Focos de la mañana y de la tarde para separarlas */
var AYUDA_MODULO = { breathe: 'respira', move: 'mueve', stretch: 'estira' };

/* La franja de una hora: la mañana de 5 a 14, la tarde de 14 a 21 y la noche el resto. */
function ayudaFranja(h) { return h >= 5 && h < 14 ? 'manana' : h >= 14 && h < 21 ? 'tarde' : 'noche'; }
var AYUDA_FRANJA_HORAS = {
  manana: [5, 6, 7, 8, 9, 10, 11, 12, 13],
  tarde: [14, 15, 16, 17, 18, 19, 20],
  noche: [21, 22, 23, 0, 1, 2, 3, 4],
};

/* Días entre dos claves 'YYYY-MM-DD', por calendario y sin new Date('YYYY-MM-DD') (regla §10). */
function ayudaDias(desde, hasta) {
  var a = String(desde).split('-').map(Number), b = String(hasta).split('-').map(Number);
  return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000);
}
/* Las semanas que abarca algo que empezó el día `desde`, contando la de hoy. */
function ayudaSemanas(desde, hoy) { return desde ? Math.max(1, Math.ceil((ayudaDias(desde, hoy) + 1) / 7)) : 0; }

function ayudaMasViejo(lista) {
  var m = null;
  lista.forEach(function (x) { if (x && (!m || x < m)) m = x; });
  return m;
}

/* Las sesiones terminadas, con su inicio y su fin en ms. */
function ayudaSesiones(eventos) {
  var out = [];
  eventos.forEach(function (e) {
    if (!e || e.type !== 'session.completed' || !e.payload) return;
    var fin = new Date(e.occurredAt).getTime();
    if (isNaN(fin)) return;
    var dura = Math.max(0, Number(e.payload.elapsedSeconds) || 0);
    out.push({ modulo: e.payload.module, fin: fin, inicio: fin - dura * 1000, dia: e.localDay,
      natural: e.payload.completionReason !== 'early', minutos: Math.round((Number(e.payload.plannedSeconds) || 0) / 60) });
  });
  return out.sort(function (a, b) { return a.fin - b.fin; });
}

/* 1 · Lo que te sienta bien. */
function ayudaBien(eventos, hoy, existe) {
  var por = {}, total = 0, dias = [];
  eventos.forEach(function (e) {
    if (!e || e.type !== 'feedback.answered' || !e.payload) return;
    var p = e.payload, id = p.routineId;
    if (!id || ['yes', 'some', 'no'].indexOf(p.response) === -1) return;
    total++; dias.push(e.localDay);
    var c = por[id] || (por[id] = { id: id, modulo: AYUDA_MODULO[p.module] || null, a: 0, b: 0, dias: {} });
    c.b++; if (p.response !== 'no') c.a++;
    c.dias[e.localDay] = true;
    if (!c.modulo && AYUDA_MODULO[p.module]) c.modulo = AYUDA_MODULO[p.module];
  });
  var rutinas = Object.keys(por).map(function (k) { return por[k]; }).filter(function (c) {
    return c.b >= AYUDA_BIEN_RESPUESTAS && Object.keys(c.dias).length >= AYUDA_BIEN_DIAS && c.a * 2 > c.b
      && (!existe || existe(c.id));
  }).sort(function (x, y) { return (y.a * x.b - x.a * y.b) || (y.b - x.b) || (x.id < y.id ? -1 : 1); });
  if (rutinas.length < AYUDA_BIEN_RUTINAS) return null;
  return {
    rutinas: rutinas.slice(0, AYUDA_BIEN_ENSENA).map(function (c) { return { id: c.id, modulo: c.modulo, a: c.a, b: c.b }; }),
    respuestas: total, semanas: ayudaSemanas(ayudaMasViejo(dias), hoy),
  };
}

/* Las horas seguidas más cortas de una franja que juntan dos tercios de sus Focos. */
function ayudaVentana(porHora, franja) {
  var horas = AYUDA_FRANJA_HORAS[franja];
  var n = horas.reduce(function (s, h) { return s + porHora[h]; }, 0);
  var falta = Math.ceil(n * 2 / 3);
  for (var largo = 1; largo <= horas.length; largo++) {
    var mejor = null;
    for (var i = 0; i + largo <= horas.length; i++) {
      var suma = 0;
      for (var j = i; j < i + largo; j++) suma += porHora[horas[j]];
      if (suma >= falta && (!mejor || suma > mejor.suma)) mejor = { desde: horas[i], hasta: (horas[i + largo - 1] + 1) % 24, suma: suma };
    }
    if (mejor) return mejor;
  }
  return null;
}

/* 2 · Tu hora de Foco. */
function ayudaHora(focos, hoy) {
  var dias = {};
  focos.forEach(function (f) { dias[f.dia] = true; });
  if (focos.length < AYUDA_HORA_FOCOS || Object.keys(dias).length < AYUDA_HORA_DIAS) return null;
  var porHora = [];
  for (var h = 0; h < 24; h++) porHora.push(0);
  var franjas = { manana: 0, tarde: 0, noche: 0 }, porMin = {};
  focos.forEach(function (f) {
    var hora = new Date(f.inicio).getHours();
    porHora[hora]++; franjas[ayudaFranja(hora)]++;
    if (f.minutos > 0) porMin[f.minutos] = (porMin[f.minutos] || 0) + 1;
  });
  var dom = ['manana', 'tarde', 'noche'].sort(function (a, b) { return franjas[b] - franjas[a]; })[0];
  var franja = franjas[dom] * 2 >= focos.length ? dom : null;
  var mins = Object.keys(porMin).sort(function (a, b) { return porMin[b] - porMin[a] || a - b; })[0];
  var cuantos = mins ? porMin[mins] : 0;
  var duracion = !mins ? null : cuantos === focos.length ? 'todos' : cuantos * 4 >= focos.length * 3 ? 'casi'
    : cuantos * 2 > focos.length ? 'sobre' : null;
  var usadas = porHora.map(function (n, k) { return n ? k : null; }).filter(function (k) { return k !== null; });
  return {
    focos: focos.length, semanas: ayudaSemanas(ayudaMasViejo(Object.keys(dias)), hoy),
    franja: franja, ventana: franja ? ayudaVentana(porHora, franja) : null,
    minutos: duracion ? Number(mins) : null, duracion: duracion,
    porHora: porHora, desde: Math.min(8, usadas[0]), hasta: Math.max(20, usadas[usadas.length - 1]),
  };
}

/* 3 · Después del Foco. */
function ayudaTras(focos, pausas) {
  var dias = {};
  focos.forEach(function (f) { dias[f.dia] = true; });
  if (focos.length < AYUDA_TRAS_FOCOS || Object.keys(dias).length < AYUDA_TRAS_DIAS) return null;
  var cuenta = { todos: [0, 0], manana: [0, 0], tarde: [0, 0] };
  focos.forEach(function (f) {
    /* Un minuto antes del final vale: el reloj del Foco y el de la pausa no van al segundo. */
    var siguio = pausas.some(function (p) { return p.inicio >= f.fin - 60000 && p.inicio <= f.fin + AYUDA_TRAS_MIN * 60000; });
    var franja = ayudaFranja(new Date(f.inicio).getHours());
    [cuenta.todos, cuenta[franja]].forEach(function (c) { if (c) { c[1]++; if (siguio) c[0]++; } });
  });
  var separa = cuenta.manana[1] >= AYUDA_TRAS_FRANJA && cuenta.tarde[1] >= AYUDA_TRAS_FRANJA;
  return { a: cuenta.todos[0], b: cuenta.todos[1], manana: separa ? cuenta.manana : null, tarde: separa ? cuenta.tarde : null };
}

/* statsAyuda(eventos, hoy, existe) -> { bien, hora, tras, semanas } con null en lo que aún no se
   puede decir. `existe(id)` deja fuera una rutina que ya no está (una tuya borrada): sin nombre,
   no se enseña. `semanas` es lo que abarca lo que se dice, para la cabecera. */
function statsAyuda(eventos, hoy, existe) {
  var ev = Array.isArray(eventos) ? eventos : [];
  var sesiones = ayudaSesiones(ev);
  var focos = sesiones.filter(function (s) { return s.modulo === 'focus' && s.natural; });
  var pausas = sesiones.filter(function (s) { return !!AYUDA_MODULO[s.modulo]; });
  var bien = ayudaBien(ev, hoy, existe);
  var hora = ayudaHora(focos, hoy);
  var tras = ayudaTras(focos, pausas);
  var semanas = Math.max(bien ? bien.semanas : 0, hora || tras ? ayudaSemanas(ayudaMasViejo(focos.map(function (f) { return f.dia; })), hoy) : 0);
  return { bien: bien, hora: hora, tras: tras, semanas: semanas };
}

Object.assign(window, {
  AYUDA_BIEN_RESPUESTAS, AYUDA_BIEN_DIAS, AYUDA_BIEN_RUTINAS, AYUDA_HORA_FOCOS, AYUDA_HORA_DIAS,
  AYUDA_TRAS_FOCOS, AYUDA_TRAS_DIAS, AYUDA_TRAS_MIN, AYUDA_TRAS_FRANJA,
  statsAyuda, ayudaFranja, ayudaSemanas,
});
