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

/* Los minutos que se ha movido el reloj por un cambio de hora desde `ms`: 60 si se
   atrasó, −60 si se adelantó y 0 si no hubo cambio o no se sabe cuándo empezó. Sumados
   a la hora de ahora, dan la hora en el reloj de entonces. */
function ritmoDesfase(ms) {
  if (typeof ms !== 'number' || !isFinite(ms)) return 0;
  return new Date().getTimezoneOffset() - new Date(ms).getTimezoneOffset();
}

/* LA PAUSA (s193). Terminar un bloque la abre con el número de bloques hechos
   —`completePomodoro` ya subió `cycle` cuando main.jsx llama a esto—; empezar
   el siguiente la cierra. Sin menú no hay nada que abrir. `inicioMs` es cuándo
   empezó el bloque (FocusTimer), para contarlo bien si cambió la hora mientras. */
function ritmoBloqueTerminado(inicioMs) {
  var p = ritmoPlan(getState());
  if (!p || p.hechos < 1) return;
  var cambios = { pausa: p.hechos };
  /* s195: RECOLOCAR TAMBIÉN AL TERMINAR (decisión del usuario: «la línea dice la
     verdad» vale también para la pausa abierta, que ya no puede estar en el
     futuro). Si el bloque acaba a una hora que no es la del plan —acortaste el
     pomodoro, lo pausaste—, lo hecho se congela hasta ese bloque, que dura lo que
     duró, y el resto se recompone desde ahora con la pausa la primera. */
  var ultimo = p.m.focos[p.hechos - 1];
  var t = ritmoAhoraExacto();
  /* La hora de acabar en el reloj con que empezó; si aun así queda antes de empezar
     (empezó en la hora repetida, con el plan por delante del reloj), la del plan. */
  var fin = t + ritmoDesfase(inicioMs);
  if (ultimo && fin <= ultimo.desde) fin = ultimo.desde + ultimo.dur;
  var desde = Math.max(t, fin);
  if (ultimo && desde !== ultimo.desde + ultimo.dur) {
    var pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(ultimo) + 1));
    pasado[pasado.length - 1].dur = fin - ultimo.desde;
    cambios.pasado = pasado; cambios.desde = desde; cambios.primerBloque = null; cambios.pausaPendiente = true;
  }
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}
/* La pausa hecha, lo hecho de cada plato y la cuenta del aro: state-ritmo.pausa.jsx. */
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
    /* s195: empezar el bloque sin haber hecho la pausa abierta la deja SALTADA */
    if (p && p.pausa) {
      var n = ritmoOrdinal(p.m, p.pausa);
      if (n != null && (R.dia.estados || {})[n] !== 'hecha') {
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
  var otraDuracion = !!(p && p.actual && mins && mins !== p.actual.dur);
  if (p && p.actual && (t !== p.actual.desde || otraDuracion)) {
    cambios.pasado = ritmoCongelar(p.m.items.slice(0, p.m.items.indexOf(p.actual)));
    cambios.desde = t;
    cambios.primerBloque = mins || p.actual.dur;
    cambios.pausaPendiente = false;
    if (otraDuracion) cambios.bloque = mins;
  }
  if (!Object.keys(cambios).length) return;
  ritmoGuardar(function (r) { return r.dia ? { dia: Object.assign({}, r.dia, cambios) } : {}; });
}

Object.assign(window, { ritmoDesfase, ritmoBloqueTerminado, ritmoBloqueEmpezado });
