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
     1. cada tercera pausa → larga (15 min): Respira + Estira
     2. la que va antes de la larga → Mueve
     3. las demás → Estira (lo mismo que propone la pausa desde s187)
     · En un mismo día no se repite ninguna rutina.
     · El AGUA: un vaso al comer y otro al cerrar; el resto de la meta se reparte
       entre las pausas, sin pasarse. */

var RITMO_OPCIONES = ['1h', '2h', 'media', 'jornada'];
var RITMO_FORMAS = {
  '1h':      { bloque: 25, foco: 50 },
  '2h':      { bloque: 35, foco: 105 },
  'media':   { bloque: 45, foco: 180 },
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
   duración que la persona puso en el aro, que manda en los bloques que vienen. */
function ritmoComponer(opcion, horario, pozos, cambios, metaAgua, previos) {
  var PAUSA = 5, LARGA = 15, MINIMO = 15, COLA = 30;
  var forma = RITMO_FORMAS[opcion];
  if (!forma || !horario) return null;
  var inicio = horario.inicio, salida = horario.salida, comeA = horario.comida;
  var comidaDur = horario.comidaDur || 60;
  var ahora = horario.ahora != null ? horario.ahora : inicio;
  var P0 = previos || null;
  /* Sin previos, el día espera a tu hora de inicio; recolocando, empieza AHORA. */
  var desde = P0 ? ahora : Math.max(inicio, ahora);
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
    /* Comer «por delante» solo manda si aún queda foco que servir DESPUÉS: si
       no, el día acaba aquí (en la maqueta, «Una hora» esperaba 245 min). */
    function comerAntes() { return falta && foco - hecho >= MINIMO && finTrabajo - comeA - comidaDur >= MINIMO; }
    function comer() {
      if (t < comeA) items.push({ tipo: 'libre', desde: t, dur: comeA - t });
      t = Math.max(t, comeA);   /* el bloque forzado puede haber cruzado la hora: se come al acabarlo */
      items.push({ tipo: 'comida', desde: t, dur: comidaDur });
      t += comidaDur; falta = false; enMitad = 0;
    }
    /* s195: RECOLOCAR AL TERMINAR. El bloque acaba de acabar y su pausa se sirve
       AHORA, antes de ningún bloque — salvo que ya no quepa otro bloque (entonces
       la pausa es el cierre, que pone el final) o que la comida esté encima (la
       comida es la pausa; el bucle la sirve). */
    if (P0 && P0.pausaPendiente) {
      var p0 = (enMitad + 1) % 3 === 0 ? LARGA : PAUSA;
      var queda0 = Math.min(foco - hecho, finTrabajo - t - p0 - (falta ? comidaDur : 0));
      if ((queda0 >= MINIMO || comerAntes()) && !(falta && t + p0 > comeA)) {
        enMitad++;
        items.push({ tipo: 'pausa', larga: p0 === LARGA, n: enMitad, desde: t, dur: p0 });
        t += p0;
      }
    }
    for (;;) {
      var p = (enMitad + 1) % 3 === 0 ? LARGA : PAUSA;
      var dur;
      if (P0 && P0.primerBloque && n === primeros) {
        /* El bloque que acaba de empezar dura lo que marca el aro, pase lo que pase. */
        dur = P0.primerBloque;
      } else {
        var rem = Math.min(foco - hecho, finTrabajo - t - (falta ? comidaDur : 0));
        if (rem < MINIMO) {
          if (comerAntes()) { comer(); continue; }
          break;
        }
        dur = bloque;
        if (rem <= bloque) dur = rem;
        else if (rem - bloque - p < cola) dur = rem <= 60 ? rem : redondo5((rem - p) / 2);
        if (falta && t + dur > comeA) {
          if (comeA - t < MINIMO) { comer(); continue; }
          dur = comeA - t;
        }
      }
      n++;
      items.push({ tipo: 'foco', desde: t, dur: dur, n: n });
      t += dur; hecho += dur;
      if (falta && t >= comeA) { comer(); continue; }
      var queda = Math.min(foco - hecho, finTrabajo - t - p - (falta ? comidaDur : 0));
      if (queda < MINIMO && !comerAntes()) break;
      if (falta && t + p > comeA) { comer(); continue; }
      enMitad++;
      items.push({ tipo: 'pausa', larga: p === LARGA, n: enMitad, desde: t, dur: p });
      t += p;
    }
    items.push({ tipo: 'cierre', desde: t, dur: PAUSA });
    return { items: items, hasta: t + PAUSA, foco: hecho };
  }

  /* Pasada la salida, las opciones cortas no se topan con ella. La jornada sí:
     fuera de tu horario no hay jornada que servir. */
  var fueraDeHora = desde >= salida - PAUSA - MINIMO;
  var fin = (forma.foco !== Infinity && fueraDeHora) ? 24 * 60 : salida;
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
    focos: focos, pausas: pausas.length, focoMin: dia.foco,
    vasos: dia.items.filter(function (it) { return it.agua; }).length,
  };
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

Object.assign(window, { RITMO_OPCIONES, RITMO_FORMAS, ritmoComponer, ritmoHora, ritmoDuracion });
