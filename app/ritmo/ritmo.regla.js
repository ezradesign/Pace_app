/* PACE · A tu ritmo · LA REGLA que compone el día (s192)
   ======================================================
   Una sola pregunta —«¿cuánto trabajas hoy?»— y PACE sirve la jornada entera:
   bloques de foco y, entre ellos, pausas con NOMBRE, duración y motivo. La carta
   completa sigue a un toque («Hoy voy por libre»).

   Nació en las entrevistas de s192 («demasiadas opciones»; mejor un menú completo
   que una carta infinita) y se diseñó en cuatro rondas de maqueta
   (docs/proposals/menu-del-dia-r1…a-tu-ritmo-r4). Esta es la regla de la ronda 4,
   con una diferencia: los POZOS ya no van escritos a mano, salen del catálogo vivo
   (`ritmoPozos`, en state-ritmo.jsx).

   PURA a propósito: no lee el reloj, ni el estado, ni `window`. Todo entra por
   parámetro, así que se puede asertar sin abrir la app. Horas en MINUTOS desde
   medianoche. `var` y `function` (no `const`): el build solo re-expone esos
   nombres fuera de su IIFE (s103).

   EL HORARIO  `{ inicio, comida, comidaDur, salida, ahora }`
     · «Jornada entera» va de tu inicio a tu SALIDA. Las otras opciones sirven sus
       minutos de foco y tampoco pasan de la salida, salvo que ya estés fuera de
       ella: entonces una hora es una hora (quien trabaja por la noche no se queda
       sin menú).
     · La comida empieza a TU HORA EXACTA y dura lo que digas. El bloque que la
       cruzaría se acorta para acabar justo entonces; si le quedarían menos de
       15 min, ese hueco es margen libre.
     · LO OCUPADO (`horario.ocupado`, opcional): las reuniones de tu calendario,
       `[{ desde, dur }]` en minutos. Son obstáculos, como la comida: el bloque
       que llegaría tarde a una se acorta para que su pausa acabe justo al
       empezar (llegas con la pausa hecha); si no caben 15 min de foco, el hueco
       es margen libre. Lo ocupado sale en el día como tramo `ocupado` y no
       reinicia la cuenta de la pausa larga, porque una reunión no es descanso.
       Sin `ocupado`, la regla es la de siempre.
     · LLEGAR TARDE (`ahora` > `inicio`): el día empieza AHORA y sales a tu hora;
       hoy hay menos foco y nada se marca como perdido. Decisión del usuario en la
       ronda 4 («salgo a mi hora», la recomendada; las otras dos quedan pintadas).
     · SIN COLAS RIDÍCULAS: si tras un bloque normal quedaría un resto menor que
       el umbral (30 min, o el bloque − 5 si es más corto), el final se sirve en UN
       bloque (si no pasa de 60) o en DOS iguales.

   RECOLOCAR A MITAD DE DÍA (s194 · v0.125.0): el sexto parámetro, `previos`,
   es lo que ya pasó cuando se vuelve a componer desde AHORA —al empezar cada
   bloque (state-ritmo.jsx, `ritmoBloqueEmpezado`)—: cuántos bloques y pausas
   van hechos, cuánto foco, si ya se comió, qué platos se sirvieron, cuántos
   vasos, y la duración del bloque que ACABA de empezar (el aro ya corre con
   ella; recomponerla a mitad de pomodoro no tiene sentido). Con `previos`, el
   día empieza EXACTAMENTE en `ahora` (también antes de tu hora: llegar antes es
   empezar), el bloque siguiente se numera detrás de los hechos, la cadencia de
   la pausa larga continúa y nada se repite. Lo hecho no se recompone: es
   historia, y viaja aparte (`dia.pasado`).

   LA REGLA de cada pausa (el contador se reinicia al comer):
     1. cada tercera pausa con 75 min de foco desde la anterior larga → larga (15 min):
        Respira + Estira
     2. la que va antes de la larga → Mueve
     3. las demás → Estira (lo mismo que propone la pausa desde s187)
     · CON EL ARO CORTO, LOS BLOQUES SE JUNTAN (Ez, 15 oct.): no hay pausa mientras el
       bloque siguiente no te haga pasar de 30 min de foco seguidos. Con el aro a 10, la
       pausa llega cada tres bloques; a 15, cada dos; de 20 en adelante, tras cada uno,
       así que el Pomodoro de 25 no cambia y nunca pasas de 30 min sin levantarte.
     · En un mismo día no se repite ninguna rutina.
     · El AGUA: un vaso al comer y otro al cerrar; el resto de la meta se reparte
       entre las pausas, sin pasarse. */

var RITMO_OPCIONES = ['1h', '2h', 'media', 'jornada'];
/* `reloj`: lo que dura el día, de reloj, desde que empieza. «Dos horas» acaba a
   las dos horas pase lo que pase (Ez, 14 oct.): con el aro más corto que el
   bloque del plan cada bloque lleva su pausa detrás, y sin este tope los 105 min
   de foco se servían a trozos hasta pasadas las tres horas. Con bloques cortos hay
   menos foco, no más reloj. */
var RITMO_FORMAS = {
  '1h':      { bloque: 25, foco: 50, reloj: 60 },
  '2h':      { bloque: 35, foco: 105, reloj: 120 },
  'media':   { bloque: 45, foco: Infinity },
  'jornada': { bloque: 45, foco: Infinity },
};

/* ritmoComponer(opcion, horario, pozos, cambios, metaAgua, previos) -> el día, o null.
   `pozos` = { estira: [r], mueve: [r], respira: [r], cierre: [r] } con rutinas
   del catálogo (se usan `id`, `name` y `min`). `cambios` = { clave: n } cuando la
   persona ha pedido «otra» n veces en esa pausa. `previos` (opcional) = { bloques,
   pausas, foco, comidaHecha, usados: [id], vasos, ultimoVaso, claves, primerBloque,
   pausaPendiente, bloque } — lo ya hecho cuando se recompone el resto del día desde
   `horario.ahora` (ver arriba). `pausaPendiente` (s195): el bloque acaba de
   TERMINAR y lo primero que se sirve es su pausa, ahora mismo. `bloque` (s195): la
   duración que la persona puso en el aro, que manda en los bloques que vienen.
   `inicio`: la hora a la que empezó el día, de donde se cuenta el `reloj`.
   `pausasLarga`, `focoLarga`, `largaEn` y `largasManana`: la cuenta de la larga (ver
   `pausaDe`) tal como la dejó lo hecho. `seguidos`: el foco desde la última pausa. */
function ritmoComponer(opcion, horario, pozos, cambios, metaAgua, previos) {
  var PAUSA = 5, LARGA = 15, MINIMO = 15, COLA = 30, FOCO_LARGA = 75, JUNTOS = 30;
  var forma = RITMO_FORMAS[opcion];
  if (!forma || !horario) return null;
  /* s197: LA MEDIA JORNADA ES UN HORARIO PROPIO —una mañana o una tarde, de tu hora
     a tu hora— y no «3 h de foco desde que pulsas». Decisión del usuario: «podría ser
     de mañana o de tarde, o sea que el horario es flexible… también la jornada completa
     depende del horario real de cada usuario». Sus horas viven aparte (`horario.media`)
     porque son OTRAS que las de la completa y se recuerdan como preferencia. */
  var med = (opcion === 'media' && horario.media) ? horario.media : null;
  var inicio = med ? med.inicio : horario.inicio;
  var salida = med ? med.salida : horario.salida;
  /* s197: LA COMIDA ES SOLO DE LA JORNADA ENTERA («se entiende que cuando se acabe la
     media jornada ya se hace la comida»). Antes cualquier opción que cruzara la hora la
     servía: «Dos horas» de 13:00 a 15:00 metía la comida a las 14:00. `sinComida`
     (s195b) sigue apagándola también en la entera. */
  var comeA = (opcion === 'jornada' && !horario.sinComida) ? horario.comida : Infinity;
  /* EL MIÉRCOLES («la mitad», ritmo.semana.js) la PRIMERA larga llega una parada antes:
     la segunda de la mañana y no la tercera; las demás van donde irían cualquier otro
     día (Ez, 14 oct.). Antes se corría toda la cadencia y el miércoles salía con tres
     largas donde los demás días hay una. `horario.adelantaLarga`; sin él, lo de siempre. */
  var adelanta = !!horario.adelantaLarga;
  var comidaDur = horario.comidaDur || 60;
  var ahora = horario.ahora != null ? horario.ahora : inicio;
  var P0 = previos || null;
  /* Sin previos, el día espera a tu hora de inicio; recolocando, empieza AHORA. */
  var desde = P0 ? ahora : Math.max(inicio, ahora);
  var ocupado = ritmoOcupadoLimpio(horario.ocupado, desde, (P0 && P0.comidaHecha) || comeA === Infinity ? null : comeA, comidaDur);
  /* s195: si la persona puso el aro a otra duración (25 con un plan de 45), el
     resto del día va con ESA (`previos.bloque`): «si cambio la duración del
     pomodoro, ¿se ajustan las horas?» — sí, y también los bloques que vienen. */
  var bloque = P0 && P0.bloque ? P0.bloque : forma.bloque;
  var P = pozos || {};
  cambios = cambios || {};
  var meta = metaAgua || 8;

  function redondo5(x) { return Math.round(x / 5) * 5; }

  /* Hasta servir `foco` minutos o llegar a `fin`. Solo tramos: los platos se
     sirven después. */
  function componer(fin) {
    var items = [], t = desde, hecho = P0 ? P0.foco || 0 : 0, enMitad = P0 ? P0.pausas || 0 : 0, n = P0 ? P0.bloques || 0 : 0;
    var primeros = n;                                  /* el bloque n+1 es el que acaba de empezar */
    var foco = forma.foco;
    var finTrabajo = fin - PAUSA;                      /* el cierre ocupa un hueco */
    var falta = !(P0 && P0.comidaHecha) && desde < comeA && comeA < finTrabajo;   /* ¿queda comida delante? */
    var cola = Math.min(COLA, bloque - 5);
    /* El bloque más corto que se sirve: 15 min, o lo que marque el aro si es menos (con
       el aro a 10, un último bloque de 10 es un bloque; si no, el día perdía el final). */
    var minimo = Math.min(MINIMO, bloque, bloque * 2 <= JUNTOS ? 10 : MINIMO);   /* aro corto: el último puede ser de 10 */
    /* LA LARGA: la tercera pausa desde la anterior larga (o la comida, o el inicio), y
       solo si desde entonces llevas 75 min de foco; si no, la primera que los cumpla
       (Ez, 15 oct.). Con bloques de 25 o más es la tercera de siempre; con el aro a 5
       o 10, las pausas de dos horas son todas cortas. El miércoles la primera larga de
       la mañana pide dos pausas, y la siguiente las que le faltaron (`largaEn`), así que
       el día tiene las mismas largas que otro. `extra`: el foco del bloque que va delante
       de la pausa y aún no se ha sumado. */
    var cuentaL = P0 ? P0.pausasLarga || 0 : 0, focoL = P0 ? P0.focoLarga || 0 : 0;
    var largaEn = P0 && P0.largaEn ? P0.largaEn : 3, largasManana = P0 ? P0.largasManana || 0 : 0;
    var manana = !(P0 && P0.comidaHecha);
    /* El foco seguido desde la última pausa (o la comida): con el aro corto, la pausa
       espera a que el bloque siguiente te hiciera pasar de 30 min (ver arriba). */
    var seguidos = P0 ? P0.seguidos || 0 : 0;
    function juntar(mas) { return seguidos + mas + bloque <= JUNTOS; }
    /* Con el aro corto, la larga que ya no deja sitio al último bloque se sirve corta,
       también en la jornada: si no, el día acababa un cuarto de hora antes. */
    var corto = bloque * 2 <= JUNTOS;
    function pausaDe(extra) {
      var faltan = adelanta && manana && !largasManana ? 2 : 3 + Math.max(0, 3 - largaEn);
      return cuentaL + 1 >= faltan && focoL + extra >= FOCO_LARGA ? LARGA : PAUSA;
    }
    function contar(larga) {
      if (!larga) { cuentaL++; return; }
      largaEn = cuentaL + 1; cuentaL = 0; focoL = 0;
      if (manana) largasManana++;
    }
    /* Comer «por delante» solo manda si aún queda foco que servir DESPUÉS: si
       no, el día acaba aquí (en la maqueta, «Una hora» esperaba 245 min). */
    function comerAntes() { return falta && foco - hecho >= minimo && finTrabajo - comeA - comidaDur >= minimo; }
    function comer() {
      if (t < comeA) items.push({ tipo: 'libre', desde: t, dur: comeA - t });
      t = Math.max(t, comeA);   /* el bloque forzado puede haber cruzado la hora: se come al acabarlo */
      items.push({ tipo: 'comida', desde: t, dur: comidaDur });
      t += comidaDur; falta = false; enMitad = 0; manana = false; seguidos = 0;
      cuentaL = 0; focoL = 0; largaEn = 3;
    }
    /* Lo ocupado: la próxima reunión que aún no ha acabado, los minutos de
       reunión que quedan antes de `b` y el paso de ir a ella (con el margen libre
       delante si lo hay). */
    var reuniones = ocupado.filter(function (o) { return o.desde < finTrabajo; });
    function sigOcupado() {
      for (var k = 0; k < reuniones.length; k++) if (reuniones[k].hasta > t) return reuniones[k];
      return null;
    }
    function ocupadoAntes(b) {
      var suma = 0;
      reuniones.forEach(function (o) { suma += Math.max(0, Math.min(o.hasta, b) - Math.max(o.desde, t)); });
      return suma;
    }
    function reunirse(o) {
      if (t < o.desde) items.push({ tipo: 'libre', desde: t, dur: o.desde - t });
      t = Math.max(t, o.desde);
      items.push({ tipo: 'ocupado', desde: t, dur: o.hasta - t });
      t = o.hasta;
    }
    /* s195: RECOLOCAR AL TERMINAR. El bloque acaba de acabar y su pausa se sirve
       AHORA, antes de ningún bloque — salvo que ya no quepa otro bloque (entonces
       la pausa es el cierre, que pone el final) o que la comida esté encima (la
       comida es la pausa; el bucle la sirve). */
    if (P0 && P0.pausaPendiente && !juntar(0)) {
      var p0 = pausaDe(0);
      var queda0 = Math.min(foco - hecho, finTrabajo - t - p0 - (falta ? comidaDur : 0) - ocupadoAntes(finTrabajo));
      if (queda0 < minimo && p0 === LARGA && (forma.reloj || corto) && queda0 + LARGA - PAUSA >= minimo) { p0 = PAUSA; queda0 += LARGA - PAUSA; }
      var o0 = sigOcupado();
      if ((queda0 >= minimo || comerAntes()) && !(falta && t + p0 > comeA) && !(o0 && t + p0 > o0.desde)) {
        enMitad++; seguidos = 0;
        items.push({ tipo: 'pausa', larga: p0 === LARGA, n: enMitad, desde: t, dur: p0 });
        contar(p0 === LARGA);
        t += p0;
      }
    }
    for (var vuelta = 0; vuelta < 200; vuelta++) {
      var p = juntar(bloque) ? 0 : pausaDe(bloque);   /* a ojo: el bloque aún no tiene duración */
      var dur;
      var o = sigOcupado();
      var enMarcha = P0 && P0.primerBloque && n === primeros;
      if (o && o.desde <= t && !enMarcha) { reunirse(o); continue; }
      if (enMarcha) {
        /* El bloque que acaba de empezar dura lo que marca el aro, pase lo que pase. */
        dur = P0.primerBloque;
      } else {
        var rem = Math.min(foco - hecho, finTrabajo - t - (falta ? comidaDur : 0) - ocupadoAntes(finTrabajo));
        if (rem < minimo) {
          if (comerAntes()) { comer(); continue; }
          break;
        }
        /* al final de una opción con `reloj`, la larga que no dejaría sitio a otro bloque
           se cuenta ya como corta, para no juntar el final en un bloque largo por ella */
        if (forma.reloj && p === LARGA && rem - bloque - LARGA < minimo && rem - bloque - PAUSA >= minimo) p = PAUSA;
        dur = bloque;
        if (rem <= bloque) dur = rem;
        else if (rem - bloque - p < cola) dur = rem <= 60 ? rem : redondo5((rem - p) / 2);
        /* con el aro corto, ni el final del día junta más de 30 min sin pausa: lo que no
           cabe se queda sin servir */
        if (corto && seguidos + dur > JUNTOS) dur = Math.max(bloque, JUNTOS - seguidos);
        if (falta && t + dur > comeA) {
          if (comeA - t < minimo) { comer(); continue; }
          dur = comeA - t;
        }
        /* Antes de una reunión, el bloque deja sitio a su pausa; si no cabe ni
           eso, acaba al empezar la reunión; si ni así llega a 15 min, margen libre. */
        if (o && t + dur + p > o.desde) {
          if (o.desde - t - p >= minimo) dur = o.desde - t - p;
          else if (o.desde - t >= minimo) dur = o.desde - t;
          else { reunirse(o); continue; }
        }
      }
      n++;
      items.push({ tipo: 'foco', desde: t, dur: dur, n: n });
      t += dur; hecho += dur; focoL += dur; seguidos += dur;
      if (falta && t >= comeA) { comer(); continue; }
      /* Sin pausa detrás: el bloque siguiente va pegado, si aún cabe uno. */
      if (juntar(0)) {
        if (Math.min(foco - hecho, finTrabajo - t - (falta ? comidaDur : 0) - ocupadoAntes(finTrabajo)) < minimo && !comerAntes()) break;
        continue;
      }
      p = pausaDe(0);
      var queda = Math.min(foco - hecho, finTrabajo - t - p - (falta ? comidaDur : 0) - ocupadoAntes(finTrabajo));
      /* Al final de una opción con `reloj`, una larga que ya no deja sitio a otro bloque
         se sirve corta: si no, «Dos horas» con el aro a 10 acababa veinte minutos antes. */
      if (queda < minimo && p === LARGA && (forma.reloj || corto) && queda + LARGA - PAUSA >= minimo) { p = PAUSA; queda += LARGA - PAUSA; }
      if (queda < minimo && !comerAntes()) break;
      if (falta && t + p > comeA) { comer(); continue; }
      o = sigOcupado();
      if (o && t + p > o.desde) { reunirse(o); continue; }
      enMitad++; seguidos = 0;
      items.push({ tipo: 'pausa', larga: p === LARGA, n: enMitad, desde: t, dur: p });
      contar(p === LARGA);
      t += p;
    }
    items.push({ tipo: 'cierre', desde: t, dur: PAUSA });
    return { items: items, hasta: t + PAUSA, foco: hecho };
  }

  /* Pasada la salida, las opciones cortas no se topan con ella. La jornada sí:
     fuera de tu horario no hay jornada que servir. Las cortas, además, acaban a su
     `reloj` contado desde que EMPEZÓ el día (`previos.inicio`), no desde la última
     recomposición: si no, cada bloque empezado tarde movería el final. Por eso
     también «fuera de hora» se mira en ese arranque. */
  var arranque = P0 && P0.inicio != null ? P0.inicio : desde;
  var fueraDeHora = arranque >= salida - PAUSA - MINIMO;
  var fin = (forma.foco !== Infinity && fueraDeHora) ? 24 * 60 : salida;
  /* Las reuniones cuentan: dos horas son dos horas de reloj, con reunión o sin ella (Ez,
     15 oct.); la que cae dentro sale del foco. */
  if (forma.reloj) fin = Math.min(fin, arranque + forma.reloj);
  var dia = componer(Math.min(fin, 24 * 60));

  /* Los platos, en orden, sin repetir en el día (tampoco los ya servidos). */
  var usados = {};
  if (P0) (P0.usados || []).forEach(function (id) { usados[id] = true; });
  function toma(modulo, clave) {
    var pozo = P[modulo] || [];
    if (!pozo.length) return null;
    var libres = pozo.filter(function (r) { return !usados[r.id]; });
    if (!libres.length) libres = pozo;
    var r = libres[(cambios[clave] || 0) % libres.length];
    usados[r.id] = true;
    return { modulo: modulo, id: r.id, name: r.name, min: r.min, clave: clave, rutina: r };
  }
  var i = P0 ? P0.claves || 0 : 0;   /* las claves de «otra» siguen la numeración del día */
  dia.items.forEach(function (it) {
    if (it.tipo === 'pausa') {
      var clave = 'p' + (++i);
      var platos = it.larga ? [toma('respira', clave + 'a'), toma('estira', clave + 'b')]
        : [toma(it.n % 3 === 2 ? 'mueve' : 'estira', clave)];
      it.platos = platos.filter(Boolean);
      it.motivo = it.larga ? 'larga' : (it.platos[0] ? it.platos[0].modulo : 'estira');
    } else if (it.tipo === 'cierre') {
      it.platos = [toma('cierre', 'cierre')].filter(Boolean);
      it.motivo = 'cierre';
    }
  });

  /* EL AGUA VA POR TIEMPO, no por pausas (s195, decisión del usuario). Antes la
     meta del día (8) se repartía entre las pausas que hubiera: «Dos horas» daba
     4 vasos en dos horas y cuarto, uno cada 35 min. La EFSA fija 2,0-2,5 l/día en
     total (un 20-30 % viene de la comida): 6-8 vasos de 250 ml repartidos en el
     día ENTERO, y en salud laboral, un vaso por hora de trabajo. Regla: un vaso
     en cada parada a la que se llega con >= 50 min desde el último (el inicio
     del día cuenta como último); la comida siempre lleva vaso y reinicia la
     cuenta desde que acaba; tope, la meta del día menos lo ya bebido. Una hora
     de trabajo son 1-2 vasos; la jornada entera, 7-8. */
  var CADA = 50;
  var pausas = dia.items.filter(function (it) { return it.tipo === 'pausa'; });
  var comidas = dia.items.filter(function (it) { return it.tipo === 'comida'; });
  var cupo = Math.max(0, meta - (P0 ? P0.vasos || 0 : 0));
  var ultimo = P0 && P0.ultimoVaso != null ? P0.ultimoVaso : desde;
  dia.items.forEach(function (it) {
    if (it.tipo !== 'pausa' && it.tipo !== 'cierre' && it.tipo !== 'comida') return;
    if (cupo <= 0) return;
    if (it.tipo === 'comida') { it.agua = true; ultimo = it.desde + it.dur; cupo--; }
    else if (it.desde - ultimo >= CADA) { it.agua = true; ultimo = it.desde; cupo--; }
  });

  /* (s194: aquí cada bloque llevaba `de`, el total del día. Nadie lo leía —el total
     lo da `plan.total`— y el banco lo destapó como mutante vivo: fuera.) */
  var focos = dia.items.filter(function (it) { return it.tipo === 'foco'; });
  return {
    opcion: opcion, desde: desde, habitual: inicio, tarde: ahora > inicio, hasta: dia.hasta,
    salida: salida, comida: comidas.length ? comeA : null, comidaDur: comidaDur, items: dia.items,
    sinComida: !!horario.sinComida,
    focos: focos, pausas: pausas.length, focoMin: dia.foco,
    vasos: dia.items.filter(function (it) { return it.agua; }).length,
  };
}

/* Las reuniones que entran en el día: desde `desde`, sin la hora de comer (la
   comida manda en su hueco), ordenadas y sin solaparse. Acepta `{ desde, dur }`
   o `[desde, dur]`; lo que no son minutos se ignora. */
function ritmoOcupadoLimpio(lista, desde, comeA, comidaDur) {
  var tramos = [];
  (Array.isArray(lista) ? lista : []).forEach(function (x) {
    var a = Array.isArray(x) ? x[0] : x && x.desde, d = Array.isArray(x) ? x[1] : x && x.dur;
    if (typeof a !== 'number' || typeof d !== 'number' || !isFinite(a) || !isFinite(d) || d <= 0) return;
    var ini = Math.max(a, desde), fin = Math.min(a + d, 24 * 60);
    if (comeA != null && ini < comeA + comidaDur && fin > comeA) {
      if (ini < comeA) tramos.push({ desde: ini, hasta: comeA });
      ini = comeA + comidaDur;
    }
    if (fin > ini) tramos.push({ desde: ini, hasta: fin });
  });
  tramos.sort(function (x, y) { return x.desde - y.desde; });
  var juntos = [];
  tramos.forEach(function (o) {
    var u = juntos[juntos.length - 1];
    if (u && o.desde <= u.hasta) u.hasta = Math.max(u.hasta, o.hasta);
    else juntos.push({ desde: o.desde, hasta: o.hasta });
  });
  return juntos;
}

function ritmoHora(min) {
  var h = Math.floor(min / 60) % 24, m = Math.round(min % 60);
  return h + ':' + (m < 10 ? '0' : '') + m;
}

/* «1 h 30 min», «45 min», «2 h». Igual en los dos idiomas. */
function ritmoDuracion(min, corta) {
  var h = Math.floor(min / 60), r = min % 60;
  var txt = (h ? h + ' h' : '') + (h && r ? ' ' : '') + (r ? r + (corta && h ? '' : ' min') : '');
  return txt || '0 min';
}

Object.assign(window, { RITMO_OPCIONES, RITMO_FORMAS, ritmoComponer, ritmoOcupadoLimpio, ritmoHora, ritmoDuracion });
