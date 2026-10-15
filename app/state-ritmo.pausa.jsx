/* PACE · A tu ritmo · LA PAUSA ENTERA (14 oct. 2026)
   ================================================
   Ez hizo la pausa larga de las 16:02 («Exhalación 4·6 + Cuello · 15 min») y solo le
   salió Respira: la ventana, la parada y la barra lateral abrían el PRIMER plato, nada
   llevaba al segundo, y volver a tocar la parada abría Respira otra vez. Y el aro no
   contaba la pausa. Eligió mirando la app real (A · 2A · 3A,
   docs/traspaso/archivos/pausa-cuello-14oct/):

   · A · LOS PLATOS VAN SEGUIDOS. Al cerrar uno, el cierre dice «Pausa larga · 1 de 2» y
     su botón entra en el siguiente (SessionDone y main.jsx); con la X vuelves a la home
     y las tres puertas ofrecen el que falta. Lo hecho de cada parada se apunta en
     `dia.platos` = { ordinal: [ids] } al terminar la sesión, junto a `dia.estados`.
   · 2A · 3A · EL ARO CUENTA LA PAUSA desde que acaba el bloque, la corta y la larga, con
     el modo «Pausa» o «Larga» de siempre hasta `dia.pausaHasta` (ms). La comida y el
     cierre del día no. Al llegar a cero vuelve al foco con el bloque siguiente, sin
     arrancarlo; «Empezar ya el bloque N» lo arranca antes.

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. */

/* La pausa ABIERTA con sus platos y lo hecho de ella, o null. */
function ritmoPausaAbierta(s) {
  var st = s || getState();
  var p = ritmoPlan(st);
  if (!p || !p.pausa || !p.pausa.platos || !p.pausa.platos.length) return null;
  var n = ritmoOrdinal(p.m, p.pausa);
  if (n == null) return null;
  var dia = ritmoDe(st).dia || {};
  var hechos = (dia.platos || {})[n];
  return { p: p, it: p.pausa, n: n, platos: p.pausa.platos, hechos: Array.isArray(hechos) ? hechos : [] };
}

/* El plato que toca en la pausa abierta: el primero sin hacer; hechos todos, el
   primero otra vez (repetir es tuyo). Sin pausa abierta, null. */
function ritmoPlatoQueToca(s) {
  var a = ritmoPausaAbierta(s);
  if (!a) return null;
  for (var i = 0; i < a.platos.length; i++) {
    if (a.hechos.indexOf(a.platos[i].id) === -1) return a.platos[i];
  }
  return a.platos[0];
}

/* Lo que sigue a una sesión: el primer plato sin hacer DETRÁS del suyo en la pausa
   abierta. null si la sesión no es de esta pausa o detrás no queda nada. `k` y `de`
   son el «1 de 2» del cierre. */
function ritmoPausaSigue(routineId, s) {
  var a = ritmoPausaAbierta(s);
  if (!a || !routineId) return null;
  var i = -1;
  for (var x = 0; x < a.platos.length; x++) if (a.platos[x].id === routineId) { i = x; break; }
  if (i < 0) return null;
  for (var j = i + 1; j < a.platos.length; j++) {
    if (a.hechos.indexOf(a.platos[j].id) === -1) return { plato: a.platos[j], k: i + 1, de: a.platos.length };
  }
  return null;
}

/* Lo que el cierre de una sesión dice cuando la pausa sigue: el rótulo de arriba y el
   botón. El rótulo solo sustituye al de una sesión completada: si el cierre dice otra
   cosa (una sesión que no cuenta), manda lo suyo. */
var RITMO_METAS_DE_FIN = ['session.doneMeta', 'session.stretchDone', 'session.moveDone', 'session.antidoteDone'];
function ritmoSigueCierre(routine, doneMeta, t) {
  var sigue = routine ? ritmoPausaSigue(routine.id) : null;
  if (!sigue) return null;
  var fmt = function (k, v) {
    var str = t(k);
    Object.keys(v).forEach(function (c) { str = str.split('{' + c + '}').join(String(v[c])); });
    return str;
  };
  var esFin = RITMO_METAS_DE_FIN.some(function (k) { return t(k) === doneMeta; });
  return {
    sigue: sigue,
    meta: esFin ? fmt('ritmo.sigue.meta', { k: sigue.k, m: sigue.de }) : doneMeta,
    cta: fmt('ritmo.sigue.cta', { modulo: typeof ritmoModulo === 'function' ? ritmoModulo(sigue.plato.modulo, t) : sigue.plato.modulo }),
  };
}

/* Una sesión terminada con la pausa abierta la deja HECHA (de lo que sea: hiciste una
   pausa, s195) y, si es uno de sus platos, lo apunta como hecho. */
function ritmoPausaHecha(routineId) {
  var a = ritmoPausaAbierta();
  if (!a) return;
  var esPlato = !!routineId && a.platos.some(function (pl) { return pl.id === routineId; });
  ritmoGuardar(function (r) {
    if (!r.dia) return {};
    var cambio = { estados: Object.assign({}, r.dia.estados || {}) };
    cambio.estados[a.n] = 'hecha';
    if (esPlato) {
      cambio.platos = Object.assign({}, r.dia.platos || {});
      var ya = Array.isArray(cambio.platos[a.n]) ? cambio.platos[a.n] : [];
      if (ya.indexOf(routineId) === -1) cambio.platos[a.n] = ya.concat([routineId]);
    }
    return { dia: Object.assign({}, r.dia, cambio) };
  });
}

/* ¿El bloque que acaba de terminar va pegado al siguiente? Con el aro corto los bloques
   se juntan hasta 30 min (ritmo.regla.js) y entonces no hay pausa que abrir: suena el
   final, la ventana no sale y el aro deja listo el bloque siguiente (Ez, 15 oct.). */
function ritmoSinPausa(s) {
  var p = typeof ritmoPlan === 'function' ? ritmoPlan(s || getState()) : null;
  if (!p || p.hechos < 1) return false;
  var it = ritmoDetras(p.m, p.m.focos[p.hechos - 1]);
  return !!it && it.tipo === 'foco';
}

/* --- el aro cuenta la pausa ------------------------------------------------ */

/* Al acabar un bloque (main.jsx, tras ritmoBloqueTerminado). `fin` es la hora a la que
   acabó, en ms: un bloque que terminó con PACE cerrado se cuenta al volver, y su pausa
   empezó entonces. Si ya pasó entera, el aro sigue esperando el bloque como antes. */
function ritmoPausaEmpieza(fin) {
  var a = ritmoPausaAbierta();
  if (!a || a.it.tipo !== 'pausa') return;
  var ahora = Date.now();
  var hasta = (typeof fin === 'number' && fin > 0 && fin <= ahora ? fin : ahora) + a.it.dur * 60000;
  if (hasta <= ahora) return;
  var modo = a.it.larga ? 'larga' : 'pausa';
  setState(function (prev) {
    var r = prev.ritmo || {};
    if (!r.dia) return prev;
    return Object.assign({}, prev, { focusMode: modo,
      ritmo: Object.assign({}, r, { dia: Object.assign({}, r.dia, { pausaHasta: hasta }) }) });
  });
}

/* La pausa que el aro está contando: { modo, hasta, n, de }, o null. `n de` es el bloque
   que viene («Luego, el bloque 3 de 9»). Mira primero la hora guardada, que es barato:
   el aro lo pregunta en cada segundo. */
function ritmoPausaCuenta(s) {
  var r = (s && s.ritmo) || {};
  var hasta = r.dia && r.dia.pausaHasta;
  if (!(typeof hasta === 'number' && hasta > 0)) return null;
  var a = ritmoPausaAbierta(s);
  if (!a || a.it.tipo !== 'pausa') return null;
  return { modo: a.it.larga ? 'larga' : 'pausa', hasta: hasta, n: a.p.hechos + 1, de: a.p.total };
}

/* Una pausa guardada que ya no está abierta (el día se recompuso, cambió de fecha, te
   fuiste por libre): el aro no puede quedarse en «Pausa larga» como si la hubieras
   elegido a mano. */
function ritmoPausaHuerfana(s) {
  var r = (s && s.ritmo) || {};
  return !!(r.dia && typeof r.dia.pausaHasta === 'number' && r.dia.pausaHasta > 0) && !ritmoPausaCuenta(s);
}

/* Se acabó la pausa (o la cortas): el aro vuelve al foco con el bloque que toca. La
   parada sigue abierta, como siempre, hasta que empiece el bloque. */
function ritmoPausaAcabada() {
  setState(function (prev) {
    var r = prev.ritmo || {};
    var cambio = {};
    if (prev.focusMode === 'pausa' || prev.focusMode === 'larga') cambio.focusMode = 'foco';
    if (r.dia && r.dia.pausaHasta != null) {
      cambio.ritmo = Object.assign({}, r, { dia: Object.assign({}, r.dia, { pausaHasta: null }) });
    }
    return Object.keys(cambio).length ? Object.assign({}, prev, cambio) : prev;
  });
  if (typeof ritmoSincronizar === 'function') ritmoSincronizar();
}

Object.assign(window, {
  ritmoSinPausa, ritmoPausaAbierta, ritmoPlatoQueToca, ritmoPausaSigue, ritmoSigueCierre, ritmoPausaHecha,
  ritmoPausaEmpieza, ritmoPausaCuenta, ritmoPausaHuerfana, ritmoPausaAcabada,
});
