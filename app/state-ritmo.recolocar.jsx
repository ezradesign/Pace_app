/* PACE · A tu ritmo · TERMINAR Y EMPEZAR UN BLOQUE (s193-s195)
   ============================================================
   Terminar un bloque abre la pausa y empezar el siguiente la cierra; las dos cosas
   RECOLOCAN el día si la hora no es la del plan (state-ritmo.jsx, «RECOLOCAR A MITAD
   DE DÍA»). Vivían en state-ritmo.jsx, que con el cambio de hora pasaba de 500 líneas.

   EL CAMBIO DE HORA. Las horas del día son las del reloj (minutos desde medianoche) y
   el día del cambio no casan con el tiempo que pasa:
   · cuando se atrasa (en Madrid, el último domingo de octubre), a las 3:00 vuelven a
     ser las 2:00 y esa hora pasa dos veces: un bloque que empieza a las 2:40 acaba a
     las 2:05, y lo hecho en la primera vuelta queda por delante del reloj;
   · cuando se adelanta (el último domingo de marzo), a las 2:00 pasan a ser las 3:00:
     un bloque de 25 min que empieza a la 1:50 acaba a las 3:15, 85 min de reloj.
   Dos reglas: lo que dura un bloque se cuenta con el reloj con el que empezó
   (`ritmoDesfase`), y el día nunca se recoloca hacia atrás de lo ya hecho. Con el reloj
   por detrás, el plan sigue desde lo hecho y va por delante hasta que el reloj lo
   alcanza; la hora que no existió queda como margen libre. Lo vigila
   tests/hora-y-medianoche.spec.js (H1 y H2). */

/* Los minutos que se ha movido el reloj por un cambio de hora desde `ms` hasta `hasta`
   (ahora, si no se dice): 60 si se atrasó, −60 si se adelantó y 0 si no hubo cambio o no
   se sabe cuándo empezó. Sumados a la hora de `hasta`, dan la hora en el reloj de entonces. */
function ritmoDesfase(ms, hasta) {
  if (typeof ms !== 'number' || !isFinite(ms)) return 0;
  var ref = typeof hasta === 'number' && isFinite(hasta) ? new Date(hasta) : new Date();
  return ref.getTimezoneOffset() - new Date(ms).getTimezoneOffset();
}

/* LA PAUSA (s193). Terminar un bloque la abre con el número de bloques hechos
   —`completePomodoro` ya subió `cycle` cuando main.jsx llama a esto—; empezar
   el siguiente la cierra. Sin menú no hay nada que abrir. `inicioMs` es cuándo
   empezó el bloque (FocusTimer), para contarlo bien si cambió la hora mientras, y
   `finMs` cuándo acabó: con el portátil cerrado o PACE cerrado, PACE se entera al
   volver, y el bloque dura lo que duró y no hasta la hora de volver (el rato de en
   medio queda como margen libre). Sin él, ahora. `minutos`, los que contó el aro: lo
   que el bloque suma de foco, sin las veces que se pausó (ver `ritmoFocoMin`). */
function ritmoBloqueTerminado(inicioMs, finMs, minutos) {
  /* El plan base: el bloque que cruzó la salida aún abre su pausa de cierre aunque ya sea la hora. */
  var p = ritmoPlanBase(getState());
  if (!p || p.hechos < 1) return;
  /* Un Foco por libre no reabre la pausa de cierre (Ez, 2A del 7 nov. 2026): el que va detrás del
     último bloque, o el que se empezó con el día ya cerrado. Si no, su ventana volvía a ser
     «Bloque 1 de 1 · hecho» con la pausa de cierre. */
  if (p.deMas || (typeof inicioMs === 'number' && isFinite(inicioMs) && ritmoTrasElFin(p.m, inicioMs))) return;
  var cambios = { pausa: p.hechos };
  /* s195: RECOLOCAR TAMBIÉN AL TERMINAR (decisión del usuario: «la línea dice la
     verdad» vale también para la pausa abierta, que ya no puede estar en el
     futuro). Si el bloque acaba a una hora que no es la del plan —acortaste el
     pomodoro, lo pausaste—, lo hecho se congela hasta ese bloque, que dura lo que
     duró, y el resto se recompone desde ahora con la pausa la primera. */
  var ultimo = p.m.focos[p.hechos - 1];
  var t = ritmoAhoraExacto();
  var finReal = typeof finMs === 'number' && isFinite(finMs) && finMs <= Date.now() &&
    new Date(finMs).toDateString() === new Date().toDateString() ? new Date(finMs) : null;
  /* La hora de acabar en el reloj con que empezó; si aun así queda antes de empezar
     (empezó en la hora repetida, con el plan por delante del reloj), la del plan. */
  var fin = finReal
    ? finReal.getHours() * 60 + finReal.getMinutes() + ritmoDesfase(inicioMs, finReal.getTime())
    : t + ritmoDesfase(inicioMs);
  if (ultimo && fin <= ultimo.desde) fin = ultimo.desde + ultimo.dur;
  var desde = Math.max(t, fin);
  if (ultimo && desde !== ultimo.desde + ultimo.dur) {
    var pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(ultimo) + 1));
    var hecho = pasado[pasado.length - 1];
    hecho.dur = fin - ultimo.desde;
    hecho.foco = Number(minutos) > 0 ? Number(minutos) : ultimo.dur;
    cambios.pasado = pasado; cambios.desde = desde; cambios.primerBloque = null; cambios.pausaPendiente = true;
  }
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}
/* La pausa hecha, lo hecho de cada plato y la cuenta del aro: state-ritmo.pausa.jsx. */

/* LO HECHO NO SE RECOMPONE (revisión de ChatGPT, 9 nov. 2026, punto 3). El día se compone en vivo
   con la cadencia, el horario y las reuniones de ahora, y solo `dia.pasado` queda fuera. Si nada se
   había recolocado (bloques a su hora), cambiar a «después de cada bloque» con seis bloques de 5
   hechos de 9:00 a 9:30 los recomponía con pausas en medio, y la pausa «hecha» (va por ordinal)
   pasaba a ser la de las 9:05. Antes de aplicar uno de esos cambios se congela lo hecho: hasta la
   pausa abierta si la hay (sigue abierta y con lo hecho de ella) o hasta el último bloque; el resto
   se compone desde que acaba eso, o desde ahora. Con un Foco en marcha, todo lo de antes de él, y él
   sigue a su hora y con su duración (como al empezarlo, `ritmoBloqueEmpezado`). Si ya estaba en la
   historia no se toca: congelar dos veces no mueve nada. Sin nada hecho, o con el día cerrado o
   terminado, no hay nada que proteger. Lo llaman bloquesElegir, ritmoHorario, ritmoGuardarSemana y
   calendarioGuardarOcupado ANTES de guardar su cambio. */
function ritmoFijarLoHecho() {
  var s = getState(), R = ritmoDe(s);
  if (!R.dia || R.libre) return;
  var p = ritmoPlanBase(s);
  if (!p || p.hechos < 1 || !p.actual || ritmoPasadaLaSalida(p)) return;
  var corre = typeof ritmoFocoCorriendo === 'function' && ritmoFocoCorriendo();
  var hasta = corre ? p.actual : (p.pausa || p.m.focos[p.hechos - 1]);
  var corte = p.m.items.indexOf(hasta) + (corre ? 0 : 1);
  var ya = (R.dia.pasado || []).length;
  if (!p.m.items.slice(ya, corte).some(function (it) { return it.tipo !== 'libre'; })) return;
  var antes = p.m.items.slice(0, corte);
  while (antes.length && antes[antes.length - 1].tipo === 'libre') antes.pop();
  var fin = antes[antes.length - 1];
  var cambios = { pasado: ritmoCongelar(antes), pausaPendiente: false,
    desde: corre ? p.actual.desde : Math.max(ritmoAhoraExacto(), fin.desde + fin.dur),
    primerBloque: corre ? p.actual.dur : null };
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}
/* Empezar un bloque cierra la pausa y, si la hora no es la del plan, RECOLOCA:
   lo anterior al bloque se congela como historia y el resto se recompone desde
   ahora, con la duración con la que el aro arranca (`minutos`). Llegar antes es
   el mismo caso con la hora por delante. */
function ritmoBloqueEmpezado(minutos) {
  var s = getState();
  var R = ritmoDe(s);
  if (!R.dia) return;
  var cambios = {};
  var p = ritmoPlan(s);
  if (R.dia.pausa != null) {
    cambios.pausa = null;
    cambios.pausaHasta = null;   /* el aro deja de contar la pausa (state-ritmo.pausa.jsx) */
    /* s195: empezar el bloque sin haber hecho la pausa abierta la deja SALTADA; la hecha a tu
       manera se queda así (Ez, 4A del 8 nov. 2026) */
    if (p && p.pausa) {
      var n = ritmoOrdinal(p.m, p.pausa), ya = (R.dia.estados || {})[n];
      if (n != null && ya !== 'hecha' && ya !== 'cuenta') {
        cambios.estados = Object.assign({}, R.dia.estados || {}); cambios.estados[n] = 'saltada';
      }
    }
  }
  if (R.dia.pausaPendiente) cambios.pausaPendiente = false;
  var t = ritmoAhoraExacto();
  /* Antes de que acabe el último bloque hecho solo se está si el reloj ha vuelto atrás
     (la hora repetida): el bloque empieza a su hora del plan, no delante de lo hecho. */
  var hecho = p && p.hechos > 0 ? p.m.focos[p.hechos - 1] : null;
  if (p && p.actual && hecho && t < hecho.desde + hecho.dur) t = p.actual.desde;
  var mins = Number(minutos) || 0;
  /* s195: si el aro no marca lo que el plan (pusiste 25 con un plan de 45), también
     se recoloca, y esa duración manda en los bloques que vienen (`dia.bloque`). */
  var otraDuracion = !!(p && p.actual && mins && mins !== ritmoDurSiEmpiezas(p, t));
  /* Con el día leído desde ahora tras la pausa (S11), empezar a esa misma hora también lo fija. */
  if (p && p.actual && (t !== p.actual.desde || otraDuracion || p.pausaPasada)) {
    var antes = p.m.items.slice(0, p.m.items.indexOf(p.actual));
    /* Empezado antes de comer (S7), la comida aún no ha pasado: no va a la historia, y se sirve detrás. */
    if (antes.some(function (x) { return x.tipo === 'comida' && x.desde > t; })) antes = antes.filter(function (x) { return x.desde < t; });
    /* Leído tras la pausa (S11), el hueco hasta ahora no es historia: lo vuelve a pintar ritmoMenu. */
    while (p.pausaPasada && antes.length && antes[antes.length - 1].tipo === 'libre') antes.pop();
    cambios.pasado = ritmoCongelar(antes);
    cambios.desde = t;
    cambios.primerBloque = mins || p.actual.dur;
    cambios.pausaPendiente = false;
    if (otraDuracion) cambios.bloque = mins;
  }
  /* Sin empezar, el día se leía desde ahora (state-ritmo.ahora.jsx): empezar a esa misma hora lo fija. */
  if (p && p.desdeAhora != null && cambios.desde == null) cambios.desde = t;
  if (!Object.keys(cambios).length) return;
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}

/* PASADA LA SALIDA, EL DÍA SE CIERRA (Ez, 1A del 7 nov. 2026). Quien dejaba la jornada en la pausa
   de las 9:35 y volvía a las 17:40 (salida a las 17:00) leía «Bloque 2 de 9 · Hasta las 17:00» y
   «Tu pausa · Ahora…», y al pulsar empezaba un bloque hasta las 18:30. Cerrado = pasada `m.fin`
   (la salida que usó el motor: la tuya, o el reloj de «Una hora» desde que empezó) sin un bloque
   del plan en marcha (empezado antes de la salida) ni la pausa abierta dentro de su rato: el bloque
   que cruza la salida acaba y su pausa de cierre se ofrece. Después, por libre. */
function ritmoPasadaLaSalida(p) {
  if (!p || !p.m || !ritmoTrasElFin(p.m, Date.now())) return false;
  var t = ritmoAhoraExacto();
  if (p.pausa && t < p.pausa.desde + p.pausa.dur) return false;
  var empezo = ritmoFocoEmpezo();
  return !(empezo != null && !ritmoTrasElFin(p.m, empezo));
}

/* Si el instante `ms` cae en la hora de acabar el día o después. El reloj de «Una hora» y «Dos
   horas» cuenta desde que empezó (`m.finDesde`): el día del cambio de hora se mira en el reloj de
   entonces. Si no, «Una hora» empezada a la 1:20 del último domingo de marzo se cerraba a las 3:10,
   a los 50 minutos, porque la hora que no existió contaba (tests/hora-y-medianoche.spec.js, H2). */
function ritmoTrasElFin(m, ms) {
  if (!m || m.fin == null) return false;
  var d = new Date(ms);
  var min = d.getHours() * 60 + d.getMinutes();
  if (m.finDesde != null) {
    var desde = new Date(ms);
    desde.setHours(0, m.finDesde, 0, 0);
    min += d.getTimezoneOffset() - desde.getTimezoneOffset();
  }
  return min >= m.fin;
}

/* QUE LA HOME SE ENTERE DE LA SALIDA. Al pasar la hora no cambia nada en el estado y nadie volvía a
   pintar la home: con la página abierta, «Bloque 2 de 9» seguía hasta el primer gesto. Cada minuto
   con la página a la vista, y al volver a ella, si el día acaba de cerrarse se repinta SIN escribir
   (la misma copia, como al adoptar la de otra pestaña): una pestaña vieja no pisa lo guardado.
   Se repinta una vez por copia: si nada ha cambiado desde la última, ya se pintó cerrado. */
var _ritmoCierrePintado = null;
function ritmoMirarSalida() {
  try {
    if (document.visibilityState === 'hidden') return;
    var s = getState(), p = ritmoPlan(s);
    if (!p || !p.cerrado || s === _ritmoCierrePintado || typeof paceAdoptarEstado !== 'function') return;
    _ritmoCierrePintado = Object.assign({}, s);
    paceAdoptarEstado(_ritmoCierrePintado);
  } catch (e) {}
}
document.addEventListener('visibilitychange', ritmoMirarSalida);
setInterval(ritmoMirarSalida, typeof PACE_DIA_CADA_MS === 'number' ? PACE_DIA_CADA_MS : 60 * 1000);

/* Cuándo empezó el Foco en marcha o en pausa (ms), o null: lo dice la clave del aro. */
function ritmoFocoEmpezo() {
  try {
    var v = JSON.parse(localStorage.getItem(RITMO_TIMER_KEY) || 'null');
    if (!v) return null;
    /* en marcha, la hora guardada (con sus pausas); si la guardó una versión de antes, el final menos la duración */
    if (v.endsAt && v.endsAt > Date.now()) return typeof v.inicio === 'number' && v.inicio <= v.endsAt ? v.inicio : v.endsAt - (Number(v.minutes) || 0) * 60000;
    return v.pausaMs > 0 && v.dia === new Date().toDateString() ? (v.inicio || null) : null;
  } catch (e) { return null; }
}

/* TUS MINUTOS, ANTES Y DESPUÉS DE LA JORNADA (Ez, S3 A del 8 nov. 2026). El aro mide lo que mide el
   bloque que toca (ritmoSincronizar), y al acabar el día se quedaba con los del último bloque:
   «Seguir por libre» y el Foco de la mañana siguiente empezaban de 33. La primera vez que el plan pone
   sus minutos se guardan los tuyos (`ritmo.focoLibre`) y, sin bloque del plan que medir ni Foco
   empezado, vuelven; sin nada guardado, 25. `ritmo.minutosPlan` son los que puso el plan: si después
   elegiste otros, se quedan los tuyos. Vuelven en el acto al acabar el último bloque porque RitmoHome
   sincroniza cada vez que cambia el bloque que toca, y si no, al minuto. */
function ritmoMinutosDelPlan(s, dur) {
  var r = (s && s.ritmo) || {};
  if (s.focusMinutes === dur && r.minutosPlan === dur) return;
  var cambio = { minutosPlan: dur };
  if (r.minutosPlan == null && ritmoMinutosSonTuyos(s, r)) cambio.focoLibre = s.focusMinutes;
  setState(function (prev) { return Object.assign({}, prev, { focusMinutes: dur, ritmo: Object.assign({}, prev.ritmo || {}, cambio) }); });
}
function ritmoMinutosDevolver(s) {
  var r = (s && s.ritmo) || {};
  if (r.minutosPlan == null) return;
  var tuyos = typeof r.focoLibre === 'number' && r.focoLibre > 0 ? r.focoLibre : 25;
  setState(function (prev) {
    var cambio = { ritmo: Object.assign({}, prev.ritmo || {}, { minutosPlan: null }) };
    if (prev.focusMinutes === r.minutosPlan) cambio.focusMinutes = tuyos;
    return Object.assign({}, prev, cambio);
  });
}
/* Antes de esta versión el plan no apuntaba lo que ponía (`minutosPlan` sin nada): unos minutos que
   no son de la fila (15, 25, 35 o 45) solo pueden venir de un bloque recolocado, y no son tuyos. */
function ritmoMinutosSonTuyos(s, r) {
  return r.minutosPlan === null || [15, 25, 35, 45].indexOf(s.focusMinutes) !== -1;
}

/* LO QUE UN BLOQUE SUMA DE FOCO (revisión de ChatGPT, 9 nov. 2026). Un bloque de 45 pausado 20
   minutos ocupa en la línea de 9:00 a 10:05 (`dur`, 65: la línea dice la verdad), pero de foco son
   los 45 que contó el aro (`foco`, que pone `ritmoBloqueTerminado` al congelarlo), los mismos que
   Estadísticas. Las cuentas del día leen esto: lo hecho al cerrar, la pausa larga (75 min de foco)
   y el foco seguido de los bloques cortos. Un bloque sin `foco` (del plan, o de antes) es su `dur`. */
function ritmoFocoMin(f) {
  return f ? (typeof f.foco === 'number' && f.foco >= 0 ? f.foco : f.dur || 0) : 0;
}
/* Los minutos de foco hechos hoy en el plan: los de sus bloques terminados. */
function ritmoFocoHecho(p) {
  return p && p.m ? p.m.focos.slice(0, p.hechos).reduce(function (a, f) { return a + ritmoFocoMin(f); }, 0) : 0;
}

Object.assign(window, { ritmoDesfase, ritmoBloqueTerminado, ritmoBloqueEmpezado, ritmoPasadaLaSalida, ritmoTrasElFin, ritmoMirarSalida, ritmoFocoEmpezo, ritmoFocoHecho, ritmoFocoMin, ritmoFijarLoHecho,
  ritmoMinutosDelPlan, ritmoMinutosDevolver });
