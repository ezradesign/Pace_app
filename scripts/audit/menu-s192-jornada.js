/* PACE · la REGLA que compone la jornada «A tu ritmo» (s192 · maqueta, ronda 4)
 * =============================================================================
 * Una sola pregunta —«¿cuánto trabajas hoy?»— y PACE sirve la jornada entera:
 * bloques de foco y, entre ellos, pausas con NOMBRE, duración y motivo.
 *
 * ES PURA Y SE INCRUSTA TAL CUAL en la maqueta (`toString`). Sin dependencias ni
 * `const` de módulo fuera de ella. Las horas van en minutos desde medianoche.
 *
 * EL HORARIO  `{ inicio, comida, comidaDur, salida, ahora, politica }`
 *   · «Jornada entera» va de tu hora de inicio a tu hora de SALIDA (ronda 4). Las
 *     otras opciones sirven sus minutos de foco, pero nunca pasan de la salida.
 *   · La comida empieza a TU HORA EXACTA y dura lo que digas (`comidaDur`). El
 *     bloque que la cruzaría se acorta para acabar justo entonces; si le quedarían
 *     menos de 15 min, ese hueco es margen libre.
 *   · LLEGAR TARDE (`ahora` > `inicio`): el día empieza AHORA, nunca antes. Con la
 *     jornada entera, `politica` decide qué se conserva:
 *       'salida' → sales a tu hora; hoy hay menos foco (por defecto);
 *       'horas'  → haces el foco de un día normal; sales más tarde.
 *     Nada se marca como perdido.
 *   · SIN COLAS RIDÍCULAS: si tras un bloque normal quedaría un resto de menos de
 *     30 min, el final se sirve en UN bloque (si no pasa de 60) o en DOS iguales.
 *
 * LA REGLA de cada pausa (el contador se reinicia al comer):
 *   1. cada tercera pausa → larga (15 min): Respira + Estira
 *   2. la que va antes de la larga → Mueve
 *   3. las demás → Estira (lo mismo que ya propone la pausa desde s187)
 *   · En un mismo día no se repite ninguna rutina.
 *   · El AGUA: un vaso al comer y otro al cerrar; el resto de la meta (8) se
 *     reparte entre las pausas, sin pasarse.
 *
 * LOS POZOS son rutinas REALES y gratuitas que caben junto a la mesa: sin suelo, sin
 * material obligatorio y sin aviso de seguridad (medido con menu-s192-catalogo.js).
 */
'use strict';

function menuJornada(opcion, horario, cambios) {
  var POZOS = {
    estira: [
      { id: 'move.neck.3', nombre: 'Cuello', min: 3 },
      { id: 'move.wrists', nombre: 'Muñecas y manos', min: 3 },
      { id: 'move.hips.standing', nombre: 'Caderas de pie', min: 4 },
      { id: 'move.shoulder.circles', nombre: 'Hombros · círculos', min: 4 },
      { id: 'move.hamstrings.standing', nombre: 'Cadena posterior de pie', min: 4 },
      { id: 'move.desk.quick', nombre: 'Escritorio express', min: 2 },
    ],
    mueve: [
      { id: 'extra.posture.set', nombre: 'Postura reset', min: 2 },
      { id: 'extra.glutes.stealth', nombre: 'Glúteos invisibles', min: 2 },
      { id: 'extra.calves', nombre: 'Gemelos subrepticios', min: 1 },
      { id: 'extra.grip.squeeze', nombre: 'Grip + antebrazos', min: 1 },
    ],
    respira: [
      { id: 'breathe.coherent.55', nombre: 'Coherente 5·5', min: 5 },
      { id: 'breathe.exhale.46', nombre: 'Exhalación 4·6', min: 6 },
      { id: 'breathe.diaphragm', nombre: 'Diafragmática', min: 5 },
    ],
    cierre: [
      { id: 'breathe.physiological', nombre: 'Suspiro fisiológico', min: 2 },
    ],
  };
  var FORMAS = {
    '1h':      { etiqueta: 'Una hora',       bloque: 25, foco: 50 },
    '2h':      { etiqueta: 'Dos horas',      bloque: 35, foco: 105 },
    'media':   { etiqueta: 'Media jornada',  bloque: 45, foco: 180 },
    'jornada': { etiqueta: 'Jornada entera', bloque: 45, foco: Infinity },
  };
  var PAUSA = 5, LARGA = 15, MINIMO = 15, COLA = 30, META_AGUA = 8;
  var MOTIVO = {
    estira: 'Antídoto a la silla', mueve: 'Cuerpo activo',
    larga: 'Pausa larga · respira y suelta', cierre: 'Para cerrar la jornada',
  };
  var forma = FORMAS[opcion];
  if (!forma) return null;
  var H = horario || {};
  var inicio = H.inicio != null ? H.inicio : 540;
  var salida = H.salida != null ? H.salida : 1020;
  var comeA = H.comida != null ? H.comida : 840;
  var comidaDur = H.comidaDur || 60;
  var ahora = H.ahora != null ? H.ahora : inicio;
  var tarde = ahora > inicio;
  cambios = cambios || {};

  function redondo5(x) { return Math.round(x / 5) * 5; }

  /* Compone un día desde `desde` hasta servir `foco` minutos o llegar a `fin`
     (la salida). Devuelve los tramos sin platos: los platos se sirven después, para
     que un día de prueba no gaste rutinas. */
  function componer(desde, foco, fin) {
    var items = [], t = desde, hecho = 0, enMitad = 0, n = 0;
    var finTrabajo = fin - PAUSA;                       /* el cierre ocupa un hueco de pausa */
    var falta = desde < comeA && comeA < finTrabajo;    /* ¿queda comida por delante? */
    /* Un umbral de cola proporcional al bloque: con bloques de 25, un resto de 20
       es un bloque normal, no una cola (el fijo de 30 fundía la hora en uno de 50). */
    var cola = Math.min(COLA, forma.bloque - 5);
    /* Comer «por delante» solo manda si aún queda foco que servir DESPUÉS: si no, el
       día acaba aquí (antes, «Una hora» esperaba 245 min libres a la comida). */
    function comerAntes() { return falta && foco - hecho >= MINIMO && finTrabajo - comeA - comidaDur >= MINIMO; }
    function comer() {
      if (t < comeA) items.push({ tipo: 'libre', desde: t, dur: comeA - t });
      t = comeA;
      items.push({ tipo: 'comida', desde: t, dur: comidaDur });
      t += comidaDur; falta = false; enMitad = 0;
    }
    for (;;) {
      var p = (enMitad + 1) % 3 === 0 ? LARGA : PAUSA;  /* la pausa que vendría detrás */
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

  var desde = Math.max(inicio, ahora);
  var dia;
  if (forma.foco === Infinity && tarde && H.politica === 'horas') {
    var normal = componer(inicio, Infinity, salida);
    dia = componer(desde, normal.foco, 24 * 60);
  } else {
    dia = componer(desde, forma.foco, salida);
  }

  /* Los platos, en orden, sin repetir en el día. */
  var usados = {};
  function toma(modulo, clave) {
    var pozo = POZOS[modulo];
    var libres = pozo.filter(function (r) { return !usados[r.id]; });
    if (!libres.length) libres = pozo;
    var r = libres[(cambios[clave] || 0) % libres.length];
    usados[r.id] = true;
    return { modulo: modulo, id: r.id, nombre: r.nombre, min: r.min, clave: clave };
  }
  var i = 0;
  dia.items.forEach(function (it) {
    if (it.tipo === 'pausa') {
      var clave = 'p' + (++i);
      it.platos = it.larga ? [toma('respira', clave + 'a'), toma('estira', clave + 'b')]
        : [toma(it.n % 3 === 2 ? 'mueve' : 'estira', clave)];
      it.motivo = it.larga ? MOTIVO.larga : MOTIVO[it.platos[0].modulo];
    } else if (it.tipo === 'cierre') {
      it.platos = [toma('cierre', 'cierre')];
      it.motivo = MOTIVO.cierre;
    }
  });

  /* El agua: comida y cierre siempre; el resto, repartido entre las pausas. */
  var pausas = dia.items.filter(function (it) { return it.tipo === 'pausa'; });
  var comidas = dia.items.filter(function (it) { return it.tipo === 'comida'; });
  comidas.forEach(function (it) { it.agua = true; });
  dia.items[dia.items.length - 1].agua = true;
  var quedan = Math.max(0, Math.min(pausas.length, META_AGUA - comidas.length - 1));
  for (var k = 0; k < quedan; k++) pausas[Math.floor((k + 0.5) * pausas.length / quedan)].agua = true;

  var focos = dia.items.filter(function (it) { return it.tipo === 'foco'; });
  focos.forEach(function (it) { it.de = focos.length; });
  var vasos = dia.items.filter(function (it) { return it.agua; }).length;
  return { opcion: opcion, etiqueta: forma.etiqueta, desde: desde, habitual: inicio, tarde: tarde, hasta: dia.hasta,
           salida: salida, comida: comidas.length ? comeA : null, comidaDur: comidaDur, items: dia.items,
           resumen: { focoMin: dia.foco, bloques: focos.length, pausas: pausas.length, vasos: vasos } };
}

function menuHora(min) {
  var h = Math.floor(min / 60) % 24, m = min % 60;
  return h + ':' + (m < 10 ? '0' : '') + m;
}

if (typeof module !== 'undefined') module.exports = { menuJornada, menuHora };

/* Uso directo: imprime varios días, para leerlos sin navegador. */
if (typeof require !== 'undefined' && require.main === module) {
  var CASOS = [
    ['jornada', { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }],
    ['jornada', { inicio: 480, comida: 720, comidaDur: 30, salida: 960 }],
    ['jornada', { inicio: 600, comida: 810, comidaDur: 90, salida: 1140 }],
    ['jornada', { inicio: 720, comida: 840, comidaDur: 60, salida: 1200 }],
    ['jornada', { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 630, politica: 'salida' }],
    ['jornada', { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 630, politica: 'horas' }],
    ['media', { inicio: 540, comida: 840, comidaDur: 60, salida: 1020, ahora: 780 }],
    ['1h', { inicio: 540, comida: 840, comidaDur: 60, salida: 1020 }],
  ];
  CASOS.forEach(function (c) {
    var m = menuJornada(c[0], c[1]);
    var h = c[1];
    console.log('\n' + m.etiqueta.toUpperCase() + ' · ' + menuHora(h.inicio) + '–' + menuHora(h.salida) + ' · come ' + menuHora(h.comida)
      + ' (' + h.comidaDur + ')' + (m.tarde ? ' · llega ' + menuHora(h.ahora) + ' · ' + (h.politica || '') : '')
      + ' → ' + menuHora(m.desde) + '–' + menuHora(m.hasta) + ' · ' + m.resumen.bloques + ' bloques (' + m.resumen.focoMin + ' min) · '
      + m.resumen.pausas + ' pausas · ' + m.resumen.vasos + ' vasos');
    console.log('   ' + m.items.map(function (it) {
      return menuHora(it.desde) + ' ' + (it.tipo === 'foco' ? 'F' + it.dur : it.tipo === 'comida' ? 'COMIDA' + it.dur
        : it.tipo === 'libre' ? 'libre' + it.dur : it.tipo === 'cierre' ? 'cierre' : (it.larga ? 'LARGA' : it.platos[0].modulo)) + (it.agua ? '·v' : '');
    }).join('  '));
  });
}
