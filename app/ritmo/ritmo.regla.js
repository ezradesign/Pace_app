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

/* ritmoComponer(opcion, horario, pozos, cambios, metaAgua) -> el día, o null.
   `pozos` = { estira: [r], mueve: [r], respira: [r], cierre: [r] } con rutinas
   del catálogo (se usan `id`, `name` y `min`). `cambios` = { clave: n } cuando la
   persona ha pedido «otra» n veces en esa pausa. */
function ritmoComponer(opcion, horario, pozos, cambios, metaAgua) {
  var PAUSA = 5, LARGA = 15, MINIMO = 15, COLA = 30;
  var forma = RITMO_FORMAS[opcion];
  if (!forma || !horario) return null;
  var inicio = horario.inicio, salida = horario.salida, comeA = horario.comida;
  var comidaDur = horario.comidaDur || 60;
  var ahora = horario.ahora != null ? horario.ahora : inicio;
  var desde = Math.max(inicio, ahora);
  var P = pozos || {};
  cambios = cambios || {};
  var meta = metaAgua || 8;

  function redondo5(x) { return Math.round(x / 5) * 5; }

  /* Hasta servir `foco` minutos o llegar a `fin`. Solo tramos: los platos se
     sirven después. */
  function componer(fin) {
    var items = [], t = desde, hecho = 0, enMitad = 0, n = 0;
    var foco = forma.foco;
    var finTrabajo = fin - PAUSA;                      /* el cierre ocupa un hueco */
    var falta = desde < comeA && comeA < finTrabajo;   /* ¿queda comida delante? */
    var cola = Math.min(COLA, forma.bloque - 5);
    /* Comer «por delante» solo manda si aún queda foco que servir DESPUÉS: si
       no, el día acaba aquí (en la maqueta, «Una hora» esperaba 245 min). */
    function comerAntes() { return falta && foco - hecho >= MINIMO && finTrabajo - comeA - comidaDur >= MINIMO; }
    function comer() {
      if (t < comeA) items.push({ tipo: 'libre', desde: t, dur: comeA - t });
      t = comeA;
      items.push({ tipo: 'comida', desde: t, dur: comidaDur });
      t += comidaDur; falta = false; enMitad = 0;
    }
    for (;;) {
      var p = (enMitad + 1) % 3 === 0 ? LARGA : PAUSA;
      var rem = Math.min(foco - hecho, finTrabajo - t - (falta ? comidaDur : 0));
      if (rem < MINIMO) {
        if (comerAntes()) { comer(); continue; }
        break;
      }
      var dur = forma.bloque;
      if (rem <= forma.bloque) dur = rem;
      else if (rem - forma.bloque - p < cola) dur = rem <= 60 ? rem : redondo5((rem - p) / 2);
      if (falta && t + dur > comeA) {
        if (comeA - t < MINIMO) { comer(); continue; }
        dur = comeA - t;
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

  /* Los platos, en orden, sin repetir en el día. */
  var usados = {};
  function toma(modulo, clave) {
    var pozo = P[modulo] || [];
    if (!pozo.length) return null;
    var libres = pozo.filter(function (r) { return !usados[r.id]; });
    if (!libres.length) libres = pozo;
    var r = libres[(cambios[clave] || 0) % libres.length];
    usados[r.id] = true;
    return { modulo: modulo, id: r.id, name: r.name, min: r.min, clave: clave, rutina: r };
  }
  var i = 0;
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

  var pausas = dia.items.filter(function (it) { return it.tipo === 'pausa'; });
  var comidas = dia.items.filter(function (it) { return it.tipo === 'comida'; });
  comidas.forEach(function (it) { it.agua = true; });
  dia.items[dia.items.length - 1].agua = true;
  var quedan = Math.max(0, Math.min(pausas.length, meta - comidas.length - 1));
  for (var k = 0; k < quedan; k++) pausas[Math.floor((k + 0.5) * pausas.length / quedan)].agua = true;

  var focos = dia.items.filter(function (it) { return it.tipo === 'foco'; });
  focos.forEach(function (it) { it.de = focos.length; });
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
