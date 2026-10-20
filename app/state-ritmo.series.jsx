/* PACE · A tu ritmo · LO QUE LAS SERIES RECUERDAN (Ez, 15 oct. 2026)
   ================================================================
   Las series (ritmo.series.js) eligen cada plato con lo que ya pasó, y eso se guarda en
   `pace.state.v2`, dentro de `ritmo`, porque el día se compone al momento y el registro
   (`pace.events.v1`) se lee tarde:

     servidos  { 'YYYY-MM-DD': { clave: [ids] } } — lo que sirvió cada parada (clave = su
               ordinal, «c» el cierre), los últimos siete días con menú. Se reescribe el
               de hoy en cada escritura de «A tu ritmo» (ritmoGuardar), así que es lo
               último que viste. Unas cincuenta claves.
     hechas    { fecha, ids: [{ id, t }] } — lo terminado hoy, también por libre, con su
               minuto: su zona ya está movida y no se repite en las paradas de después.
               Con otra fecha no existe.

   Lo que lee la regla se arma aquí (`ritmoMemoria`) y entra por parámetro: la regla
   sigue pura. `var`/`function`: un `const` no cruza la IIFE del artefacto. */

var RITMO_SERVIDOS_DIAS = 7;
var RITMO_HECHAS_MAX = 40;

/* Días entre dos fechas locales, sin new Date("YYYY-MM-DD") (regla §10). */
function ritmoDiasEntre(a, b) {
  var x = parseLocalDateKey(a), y = parseLocalDateKey(b);
  if (!x || !y) return null;
  return Math.round((y - x) / 86400000);
}

/* La memoria de las series para el día `fecha`: lo servido la última vez, cuántos días
   hace que salió cada rutina, lo hecho ese día con su zona, y lo ya pasado del día. */
function ritmoMemoria(s, fecha, dia, pasado) {
  var r = (s && s.ritmo) || {};
  var serv = r.servidos && typeof r.servidos === 'object' ? r.servidos : {};
  var fechas = Object.keys(serv).filter(function (f) { return f < fecha; }).sort();
  var dias = {};
  fechas.forEach(function (f) {
    var d = ritmoDiasEntre(f, fecha);
    if (d == null) return;
    Object.keys(serv[f] || {}).forEach(function (k) {
      (Array.isArray(serv[f][k]) ? serv[f][k] : []).forEach(function (id) { if (dias[id] == null || d < dias[id]) dias[id] = d; });
    });
  });
  var h = r.hechas && r.hechas.fecha === fecha && Array.isArray(r.hechas.ids) ? r.hechas.ids : [];
  var hechas = h.filter(function (x) { return x && x.id && typeof x.t === 'number'; }).map(function (x) {
    var rut = typeof ritmoRutinaPorId === 'function' ? ritmoRutinaPorId(x.id) : null;
    return { id: x.id, t: x.t, z: ritmoSeriesZonas(x.id, rut && rut.tag) };
  });
  /* Lo aprendido por el motor de la semana, solo con PACE completo (state-ritmo.motor.jsx). */
  var aprende = typeof ritmoPuedeAprender === 'function' && ritmoPuedeAprender() && typeof ritmoMotorVigente === 'function';
  return {
    ultima: fechas.length ? serv[fechas[fechas.length - 1]] || {} : {},
    dias: dias, hechas: hechas,
    pasado: pasado || [], estados: (dia && dia.estados) || {},
    inicio: pasado && pasado.length ? pasado[0].desde : null,
    aprendido: aprende ? ritmoMotorVigente(r.aprendido, fecha) : null,
    /* que las rutinas cambien de un día a otro, con PACE completo (state-entitlement.jsx) */
    varia: typeof window.puedeVariar === 'function' && window.puedeVariar(),
  };
}

/* Lo que sirve hoy cada parada, dentro de `ritmo` (la escritura que ritmoGuardar va a
   hacer), y solo los siete últimos días. Sin plan hoy, lo de hoy no se toca. */
function ritmoAnotarServidos(prev, ritmo) {
  var hoy = ritmoHoy();
  var p = null;
  try { p = ritmoPlan(Object.assign({}, prev, { ritmo: ritmo })); } catch (e) { p = null; }
  if (!p || !p.m || !hoy) return ritmo;
  var serv = Object.assign({}, ritmo.servidos && typeof ritmo.servidos === 'object' ? ritmo.servidos : {});
  serv[hoy] = ritmoSeriesClaves(p.m.items);
  var fechas = Object.keys(serv).sort();
  while (fechas.length > RITMO_SERVIDOS_DIAS) delete serv[fechas.shift()];
  return Object.assign({}, ritmo, { servidos: serv });
}

/* Una sesión terminada (state-events.jsx, junto a ritmoPausaHecha), del plan o por libre. */
function ritmoAnotarHecha(routineId) {
  if (!routineId || String(routineId).indexOf('custom.') === 0) return;
  var hoy = ritmoHoy(), t = ritmoAhoraExacto();
  ritmoGuardar(function (r) {
    var h = r.hechas && r.hechas.fecha === hoy && Array.isArray(r.hechas.ids) ? r.hechas.ids : [];
    return { hechas: { fecha: hoy, ids: h.concat([{ id: routineId, t: t }]).slice(-RITMO_HECHAS_MAX) } };
  });
}

/* LA FRASE B de una parada («Caderas: sin mover hoy», «Llevas 70 min sentado»), o null:
   entonces se pinta la de siempre. La usan la pausa (BreakMenu.ritmo.jsx) y la línea
   (RitmoPiezas.jsx). */
function ritmoFrase(it, t, tn) {
  var f = it && it.frase;
  if (!f || !f.k) return null;
  if (f.k === 'zona') return f.zona ? tn('ritmo.frase.zona', { zona: t('ritmo.zona.' + f.zona) }) : null;
  if (f.k === 'sentado') return f.n > 0 ? tn('ritmo.frase.sentado', { n: f.n }) : null;
  return t('ritmo.frase.' + f.k);
}

Object.assign(window, {
  RITMO_SERVIDOS_DIAS, ritmoDiasEntre, ritmoMemoria, ritmoAnotarServidos, ritmoAnotarHecha, ritmoFrase,
});
