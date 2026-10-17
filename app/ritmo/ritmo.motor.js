/* PACE · A tu ritmo · EL MOTOR DE LA SEMANA (Ez, 8 y 16 oct. 2026)
   ==============================================================
   Lo de pago de «A tu ritmo»: cada semana PACE mira cómo fue la anterior, cambia una o dos
   cosas de la que empieza y lo cuenta en la carta del lunes. Ez aceptó la página
   (docs/traspaso/archivos/motor-semana/) y el 16 oct. eligió montarlo ya, sin esperar a
   tener semanas de datos: aprende desde la primera semana.

   APRENDE CUATRO COSAS, y cada una cambia algo concreto:
     1. qué te sienta bien («¿Te ayudó?»): lo que te ayudó va delante en los empates de las
        series (vuelve antes en la semana) y «Otra» no lo aparta; lo que no te ayudó ya lo
        aparta la pausa (el veto, gratis), así que el motor no lo repite;
     2. qué pausas saltas: la pausa corta de la misma hora (±15 min) saltada tres días, sin
        reunión alrededor, sirve una rutina de 2 minutos; no se quita, porque una tarde sin
        pausas es justo lo que PACE quiere evitar;
     3. qué cambias con «Otra»: la rutina cambiada tres veces descansa; si lo cambiado en
        Mueve está repartido y es casi todo lo de Mueve, la cadencia trae Estira;
     4. a qué horas trabajas: si empiezas o terminas a media hora o más de tus horas tres
        días de la semana, o el mismo día dos semanas seguidas, lo PREGUNTA: tus horas no
        cambian nunca solas.

   LAS REGLAS DE LA PÁGINA: hay carta tras una semana con tres días o más de «A tu ritmo»;
   un cambio necesita pruebas (tres veces en la semana, o dos semanas seguidas y tres entre
   las dos); como mucho dos cambios, uno de rutinas y uno de la forma del día, y entre los
   dos no más de 10 paradas; nada se aparta para siempre: todo dura cuatro semanas, y lo
   que se rechaza tampoco se vuelve a proponer en cuatro. No pone notas: cuenta veces.

   PURO como la regla: entra la semana y sale qué cambia y por qué. Lo que sabe del pasado
   se lo da state-ritmo.motor.jsx, y lo aprendido llega a las series por su `memoria`.
   `var` y `function`: el build solo re-expone esos nombres. */

var MOTOR_DIAS_CARTA = 3;    /* días de «A tu ritmo» en la semana para que haya carta */
var MOTOR_PRUEBAS = 3;       /* lo mismo tres veces (en la semana o en dos seguidas) */
var MOTOR_DURA = 28;         /* lo aprendido y lo rechazado, cuatro semanas */
var MOTOR_TOPE = 10;         /* paradas que pueden tocar los dos cambios juntos */
var MOTOR_LEJOS = 30;        /* media hora lejos de tus horas */
var MOTOR_MISMA_HORA = 15;   /* dos paradas son «la de la misma hora» a ±15 min */
var MOTOR_CORTA = 2;         /* los minutos de la pausa que saltas */
var MOTOR_CIERRE = 5;        /* lo que dura el cierre: la salida es el último bloque y él */

/* Fechas locales 'YYYY-MM-DD' por partes y en UTC, sin new Date("YYYY-MM-DD") (regla §10). */
function motorFecha(iso, n) {
  var p = String(iso).split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2] + (n || 0))).toISOString().slice(0, 10);
}
function motorDiaSemana(iso) {
  var p = String(iso).split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() || 7;
}
function motorLunes(iso) { return motorFecha(iso, 1 - motorDiaSemana(iso)); }
function motorCinco(n) { return Math.round(n / 5) * 5; }
function motorMediana(xs) {
  var o = xs.slice().sort(function (a, b) { return a - b; });
  return o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2;
}
/* Tres veces en la semana, o dos semanas seguidas y tres entre las dos. */
function motorPruebas(n1, n2) { return n1 >= MOTOR_PRUEBAS || (n1 >= 1 && n2 >= 1 && n1 + n2 >= MOTOR_PRUEBAS); }

/* La clave de un cambio, para no volver a proponer lo rechazado. */
function ritmoMotorClave(c) {
  if (!c) return '';
  if (c.tipo === 'descansa') return 'descansa:' + c.id;
  if (c.tipo === 'menos') return 'menos:' + c.modulo;
  if (c.tipo === 'corta') return 'corta:' + c.hora;
  if (c.tipo === 'hora') return 'hora:' + c.campo + ':' + (c.dia || '*');
  return c.tipo;
}

/* Lo aprendido, saneado y sin lo que ya caducó (`hasta` es el día en que vuelve). */
function ritmoMotorLimpio(a, hoy) {
  a = a && typeof a === 'object' ? a : {};
  var vivo = function (h) { return typeof h === 'string' && h > hoy; };
  var out = { descansa: {}, cortas: [], menos: null, ayuda: null, rechazado: {} };
  Object.keys(a.descansa || {}).forEach(function (id) { if (vivo(a.descansa[id])) out.descansa[id] = a.descansa[id]; });
  (Array.isArray(a.cortas) ? a.cortas : []).forEach(function (c) {
    if (c && typeof c.hora === 'number' && vivo(c.hasta)) out.cortas.push({ hora: c.hora, hasta: c.hasta });
  });
  if (a.menos && a.menos.modulo === 'mueve' && vivo(a.menos.hasta)) out.menos = { modulo: 'mueve', hasta: a.menos.hasta };
  if (a.ayuda && Array.isArray(a.ayuda.ids) && vivo(a.ayuda.hasta)) out.ayuda = { ids: a.ayuda.ids.slice(0, 4), hasta: a.ayuda.hasta };
  Object.keys(a.rechazado || {}).forEach(function (k) { if (vivo(a.rechazado[k])) out.rechazado[k] = a.rechazado[k]; });
  return out;
}

/* Lo que las series leen el día `fecha` (ritmo.series.js, `mem.aprendido`). */
function ritmoMotorVigente(a, fecha) {
  var l = ritmoMotorLimpio(a, fecha);
  var ayuda = {};
  (l.ayuda ? l.ayuda.ids : []).forEach(function (id) { ayuda[id] = true; });
  var descansa = {};
  Object.keys(l.descansa).forEach(function (id) { descansa[id] = true; });
  var cortas = l.cortas.map(function (c) { return { hora: c.hora, min: MOTOR_CORTA, margen: MOTOR_MISMA_HORA }; });
  return { descansa: descansa, cortas: cortas, menos: l.menos ? l.menos.modulo : null, ayuda: ayuda };
}

/* «Vale»: los cambios de la carta pasan a lo aprendido, cuatro semanas. La pregunta de
   las horas no entra aquí: un «Sí» cambia tus horas en el estado, no en lo aprendido. */
function ritmoMotorAplicar(a, res, hoy) {
  var l = ritmoMotorLimpio(a, hoy);
  var hasta = motorFecha(hoy, MOTOR_DURA);
  ((res && res.cambios) || []).forEach(function (c) {
    if (c.tipo === 'descansa') l.descansa[c.id] = hasta;
    if (c.tipo === 'menos') l.menos = { modulo: c.modulo, hasta: hasta };
    if (c.tipo === 'corta') l.cortas = l.cortas.filter(function (x) { return Math.abs(x.hora - c.hora) > MOTOR_MISMA_HORA; }).concat([{ hora: c.hora, hasta: hasta }]);
  });
  if (res && res.ayudo && res.ayudo.length) l.ayuda = { ids: res.ayudo.slice(), hasta: hasta };
  return l;
}

/* «Dejarla como estaba», o «No» a la pregunta: no se vuelve a proponer en cuatro semanas. */
function ritmoMotorRechazar(a, cambios, hoy) {
  var l = ritmoMotorLimpio(a, hoy);
  var hasta = motorFecha(hoy, MOTOR_DURA);
  (cambios || []).forEach(function (c) { var k = ritmoMotorClave(c); if (k) l.rechazado[k] = hasta; });
  return l;
}

/* «Olvidar» en «Tu semana»: lo aprendido con esa clave deja de valer. */
function ritmoMotorOlvidar(a, clave, hoy) {
  var l = ritmoMotorLimpio(a, hoy);
  var p = String(clave).split(':');
  if (p[0] === 'descansa') delete l.descansa[p[1]];
  if (p[0] === 'menos') l.menos = null;
  if (p[0] === 'corta') l.cortas = l.cortas.filter(function (c) { return String(c.hora) !== p[1]; });
  if (p[0] === 'ayuda') l.ayuda = null;
  return l;
}

/* ritmoMotor(e) -> lo que cambia la semana que empieza y por qué.
   `e` = { hoy, dias: [resúmenes de ritmo.day.closed], feedback: [{ fecha, id, r }],
   focos: [{ fecha, desde, hasta }] (bloques de foco, en minutos), horario: { inicio,
   salida, comida, comidaDur, dias: { 1…7: { inicio, salida } } }, aprendido }.
   Devuelve { semana: { lunes, desde, hasta }, dias, carta, ayudo: [ids], hechas, total,
   barras: [{ d, hechas, total }] (lunes a domingo), cambios: [como mucho dos] }. */
function ritmoMotor(e) {
  e = e || {};
  var hoy = e.hoy;
  var lunes = motorLunes(hoy);
  var s1 = { desde: motorFecha(lunes, -7), hasta: motorFecha(lunes, -1) };
  var s2 = { desde: motorFecha(lunes, -14), hasta: motorFecha(lunes, -8) };
  var cuatro = motorFecha(lunes, -MOTOR_DURA);
  var sem = function (f) { return f >= s1.desde && f <= s1.hasta ? 1 : f >= s2.desde && f <= s2.hasta ? 2 : 0; };
  var horario = e.horario || {};
  var a = ritmoMotorLimpio(e.aprendido, hoy);
  var rechazado = function (c) { return !!a.rechazado[ritmoMotorClave(c)]; };

  /* Un resumen por día (el último que llegue manda), solo de las dos semanas. */
  var porFecha = {};
  (e.dias || []).forEach(function (d) { if (d && typeof d.fecha === 'string' && sem(d.fecha) && Array.isArray(d.paradas)) porFecha[d.fecha] = d; });
  var fechas = Object.keys(porFecha).sort();
  var f1 = fechas.filter(function (f) { return sem(f) === 1; });

  /* La cabecera de la carta: las pausas hechas, sus barras y lo que te ayudó. */
  var barras = [1, 2, 3, 4, 5, 6, 7].map(function (d) { return { d: d, hechas: 0, total: 0 }; });
  f1.forEach(function (f) {
    var b = barras[motorDiaSemana(f) - 1];
    porFecha[f].paradas.forEach(function (p) {
      if (p.tipo === 'cierre') return;
      b.total++;
      if (p.estado === 'hecha') b.hechas++;
    });
  });
  var fb = (e.feedback || []).filter(function (x) { return x && x.id && typeof x.fecha === 'string'; });
  var si = {};
  fb.forEach(function (x) {
    if (x.r !== 'yes' || sem(x.fecha) !== 1) return;
    var c = si[x.id] || (si[x.id] = { id: x.id, n: 0, ultima: '' });
    c.n++; if (x.fecha > c.ultima) c.ultima = x.fecha;
  });
  var ayudo = Object.keys(si).map(function (k) { return si[k]; })
    .sort(function (x, y) { return (y.n - x.n) || (y.ultima > x.ultima ? 1 : y.ultima < x.ultima ? -1 : 0) || (x.id < y.id ? -1 : 1); })
    .slice(0, 2).map(function (x) { return x.id; });
  /* Lo que dices pesa más que lo que haces: un «Sí» o un «Un poco» de las cuatro semanas. */
  var protegida = {};
  fb.forEach(function (x) { if ((x.r === 'yes' || x.r === 'some') && x.fecha >= cuatro && x.fecha < lunes) protegida[x.id] = true; });

  /* LAS RUTINAS. Lo descartado con «Otra» (`antes`), contado por semana. */
  var otras = {}, mueve = { m: 0, o1: 0, o2: 0, o: 0 };
  fechas.forEach(function (f) {
    var k = sem(f);
    porFecha[f].paradas.forEach(function (p) {
      p.platos.forEach(function (pl) {
        (pl.antes || []).forEach(function (id) {
          var c = otras[id] || (otras[id] = { n1: 0, n2: 0, modulo: pl.modulo });
          if (k === 1) c.n1++; else c.n2++;
        });
        if (p.tipo === 'pausa' && pl.modulo === 'mueve') {
          mueve.m++;
          if (pl.otras > 0) { mueve.o++; if (k === 1) mueve.o1++; else mueve.o2++; }
        }
      });
    });
  });
  /* Las paradas de la semana pasada que habría tocado: donde salió o se descartó. */
  var paradasDe = function (id) {
    var n = 0;
    f1.forEach(function (f) {
      porFecha[f].paradas.forEach(function (p) {
        if (p.platos.some(function (pl) { return pl.id === id || (pl.antes || []).indexOf(id) !== -1; })) n++;
      });
    });
    return n;
  };
  var rutinas = Object.keys(otras)
    .filter(function (id) { var c = otras[id]; return motorPruebas(c.n1, c.n2) && !protegida[id] && !a.descansa[id]; })
    .sort(function (x, y) {
      var X = otras[x], Y = otras[y];
      return ((Y.n1 + Y.n2) - (X.n1 + X.n2)) || (Y.n1 - X.n1) || (x < y ? -1 : 1);
    })
    .map(function (id) {
      var c = otras[id];
      return { tipo: 'descansa', clase: 'rutinas', id: id, modulo: c.modulo, veces: c.n1 + c.n2, semanas: c.n2 ? 2 : 1, paradas: paradasDe(id) };
    })
    .filter(function (c) { return !rechazado(c); });
  /* Menos Mueve: lo cambiado en Mueve no se junta en una rutina y es casi todo (2 de 3). */
  if (!a.menos && motorPruebas(mueve.o1, mueve.o2) && mueve.o * 3 >= mueve.m * 2) {
    var comeHasta = horario.comida != null ? horario.comida + (horario.comidaDur || 60) : Infinity;
    var cadencia = 0;
    f1.forEach(function (f) {
      var primera = true, trasComer = true;
      porFecha[f].paradas.forEach(function (p) {
        if (p.tipo !== 'pausa') return;
        var esPrimera = primera || (trasComer && p.hora >= comeHasta);
        primera = false;
        if (p.hora >= comeHasta) trasComer = false;
        if (!esPrimera && p.platos.some(function (pl) { return pl.modulo === 'mueve'; })) cadencia++;
      });
    });
    var menos = { tipo: 'menos', clase: 'rutinas', modulo: 'mueve', mas: 'estira', veces: mueve.o, de: mueve.m, paradas: cadencia };
    if (!rechazado(menos)) rutinas.push(menos);
  }

  /* LA FORMA DEL DÍA. Primero tus horas: con ellas mal, se saltan pausas que no tocaban. */
  var forma = motorHoras(e, porFecha, s1, a).concat(motorCortas(porFecha, fechas, f1, sem, a));

  /* Como mucho dos: uno de rutinas y uno de la forma, y entre los dos no más de 10 paradas. */
  var cambios = [], quedan = MOTOR_TOPE;
  [rutinas, forma].forEach(function (lista) {
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].paradas <= quedan) { cambios.push(lista[i]); quedan -= lista[i].paradas; return; }
    }
  });
  var hechas = 0, total = 0;
  barras.forEach(function (b) { hechas += b.hechas; total += b.total; });
  return {
    semana: { lunes: lunes, desde: s1.desde, hasta: s1.hasta },
    dias: f1.length, carta: f1.length >= MOTOR_DIAS_CARTA,
    ayudo: ayudo, hechas: hechas, total: total, barras: barras, cambios: cambios,
  };
}

/* La pausa corta que saltas: saltada (no «sin tocar», que también es la que no llegó),
   sin reunión alrededor, a la misma hora en días distintos. */
function motorCortas(porFecha, fechas, f1, sem, a) {
  var saltadas = [];
  fechas.forEach(function (f) {
    porFecha[f].paradas.forEach(function (p) {
      if (p.tipo === 'pausa' && p.estado === 'saltada' && !(p.reunion > 0)) saltadas.push({ f: f, hora: p.hora, k: sem(f), modulo: p.platos[0].modulo });
    });
  });
  var mejor = null;
  saltadas.forEach(function (c) {
    var grupo = saltadas.filter(function (x) { return Math.abs(x.hora - c.hora) <= MOTOR_MISMA_HORA; });
    var d1 = {}, d2 = {};
    grupo.forEach(function (x) { (x.k === 1 ? d1 : d2)[x.f] = true; });
    var n1 = Object.keys(d1).length, n2 = Object.keys(d2).length;
    if (!motorPruebas(n1, n2)) return;
    if (!mejor || n1 + n2 > mejor.n1 + mejor.n2 || (n1 + n2 === mejor.n1 + mejor.n2 && n1 > mejor.n1)) {
      mejor = { n1: n1, n2: n2, hora: motorCinco(motorMediana(grupo.map(function (x) { return x.hora; }))), modulo: c.modulo };
    }
  });
  if (!mejor) return [];
  if (a.cortas.some(function (c) { return Math.abs(c.hora - mejor.hora) <= MOTOR_MISMA_HORA; })) return [];
  if (Object.keys(a.rechazado).some(function (k) { var p = k.split(':'); return p[0] === 'corta' && Math.abs(Number(p[1]) - mejor.hora) <= MOTOR_MISMA_HORA; })) return [];
  /* Toca los días de la semana pasada que tuvieron una pausa corta a esa hora. */
  var paradas = f1.filter(function (f) {
    return porFecha[f].paradas.some(function (p) { return p.tipo === 'pausa' && Math.abs(p.hora - mejor.hora) <= MOTOR_MISMA_HORA; });
  }).length;
  return [{ tipo: 'corta', clase: 'forma', hora: mejor.hora, modulo: mejor.modulo, min: MOTOR_CORTA, veces: mejor.n1 + mejor.n2, semanas: mejor.n2 ? 2 : 1, paradas: Math.max(paradas, mejor.n1) }];
}

/* Tus horas de verdad: el primer bloque de foco y el último (más el cierre) de los días de
   jornada, contra las horas que tenía ese día. Tres días de la semana hacia el mismo lado,
   o el mismo día de la semana dos semanas seguidas (a media hora o menos entre las dos). */
function motorHoras(e, porFecha, s1, a) {
  var dia = {};
  (e.focos || []).forEach(function (x) {
    var r = x && porFecha[x.fecha];
    if (!r || r.opcion !== 'jornada' || typeof x.desde !== 'number' || typeof x.hasta !== 'number') return;
    var d = dia[x.fecha] || (dia[x.fecha] = { inicio: x.desde, salida: x.hasta + MOTOR_CIERRE });
    d.inicio = Math.min(d.inicio, x.desde); d.salida = Math.max(d.salida, x.hasta + MOTOR_CIERRE);
  });
  var horario = e.horario || {};
  var actual = function (campo, d) {
    var por = horario.dias && horario.dias[d];
    return por && typeof por[campo] === 'number' ? por[campo] : horario[campo];
  };
  var out = [];
  ['inicio', 'salida'].forEach(function (campo) {
    var lejos = function (f) {
      var r = porFecha[f], v = dia[f] && dia[f][campo];
      if (typeof v !== 'number' || typeof r[campo] !== 'number') return 0;
      var delta = v - r[campo];
      return Math.abs(delta) >= MOTOR_LEJOS ? (delta > 0 ? 1 : -1) : 0;
    };
    var cands = [];
    var semana = Object.keys(dia).filter(function (f) { return f >= s1.desde && f <= s1.hasta; }).sort();
    [1, -1].forEach(function (lado) {
      var xs = semana.filter(function (f) { return lejos(f) === lado; });
      if (xs.length >= MOTOR_PRUEBAS) cands.push({ dia: null, veces: xs.length, hora: motorCinco(motorMediana(xs.map(function (f) { return dia[f][campo]; }))) });
    });
    semana.forEach(function (f) {
      var antes = motorFecha(f, -7), lado = lejos(f);
      if (!lado || !dia[antes] || lejos(antes) !== lado) return;
      if (Math.abs(dia[f][campo] - dia[antes][campo]) > MOTOR_LEJOS) return;
      cands.push({ dia: motorDiaSemana(f), veces: 2, hora: motorCinco((dia[f][campo] + dia[antes][campo]) / 2) });
    });
    cands.forEach(function (c) {
      var x = { tipo: 'hora', clase: 'forma', pregunta: true, campo: campo, dia: c.dia, hora: c.hora, veces: c.veces, paradas: 0 };
      var ya = actual(campo, c.dia);
      if (typeof ya === 'number' && Math.abs(ya - c.hora) < MOTOR_LEJOS) return;
      if (!a.rechazado[ritmoMotorClave(x)]) out.push(x);
    });
  });
  return out;
}

Object.assign(window, {
  MOTOR_DIAS_CARTA, MOTOR_DURA, MOTOR_TOPE, MOTOR_CORTA, MOTOR_MISMA_HORA, motorFecha, motorLunes, motorDiaSemana,
  ritmoMotor, ritmoMotorClave, ritmoMotorLimpio, ritmoMotorVigente, ritmoMotorAplicar, ritmoMotorRechazar, ritmoMotorOlvidar,
});
