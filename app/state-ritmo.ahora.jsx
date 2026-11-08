/* PACE · A tu ritmo · EL DÍA SIN EMPEZAR SE LEE DESDE AHORA (Ez, E1 A del 7 nov. 2026)
   ===================================================================================
   Quien elegía «Jornada entera» a las 8:00 y volvía a las 11:00 sin haber empezado leía
   «Bloque 1 de 11», «Siguiente pausa: A las 8:45» y la línea desde las 8:00: todo pasado.
   Mientras no se ha empezado nada (ningún bloque hecho, ninguno en marcha o en pausa,
   ninguna pausa abierta), el día elegido se compone desde la hora de ahora, a la baja de 5
   en 5, como la tarjeta de tu semana antes de elegir. Al pulsar «Empezar jornada» se fija
   a la hora de pulsar (ritmoBloqueEmpezado), como antes.

   SE LEE, NO SE ESCRIBE: `dia.desde` sigue siendo la hora de elegir hasta que empiezas, así
   que una pestaña de fondo no pisa nada y cada una lo lee con su reloj. Como lo que cambia
   es la hora y no el estado, cada minuto a la vista (el vigilante de state-core.dia.js) se
   mira si el día se ha movido y, si sí, se repinta la app sin escribir.

   EL CALENDARIO QUE SE MANTIENE SOLO sigue con el día como se eligió (`comoSeEligio`):
   si siguiera la hora, se reescribiría cada cinco minutos hasta que empezaras. */

/* La hora (minutos) desde la que leer el día de hoy, o null si manda la guardada. */
function ritmoDesdeSinEmpezar(s, R) {
  var d = R && R.dia;
  if (!d || R.libre || d.pausa != null) return null;
  if ((Number((s || {}).cycle) || 0) - (d.cicloBase || 0) > 0) return null;
  if (typeof ritmoFocoCorriendo === 'function' && ritmoFocoCorriendo()) return null;
  var ahora = ritmoAhora();
  return ahora > (Number(d.desde) || 0) ? ahora : null;
}

/* Cuando el día sin empezar se mueve, se repinta todo con la misma copia (como al adoptar la de
   otra pestaña): la barra lateral y el aro no se repintan solos si el estado no cambia. */
var _ritmoSinEmpezarVisto = null;
function ritmoMirarSinEmpezar() {
  try {
    var s = getState();
    var d = ritmoDesdeSinEmpezar(s, ritmoDe(s));
    if (d === _ritmoSinEmpezarVisto) return;
    _ritmoSinEmpezarVisto = d;
    if (d != null && typeof paceAdoptarEstado === 'function') paceAdoptarEstado(Object.assign({}, s));
  } catch (e) {}
}
if (typeof paceMinutoSuscribir === 'function') paceMinutoSuscribir(ritmoMirarSinEmpezar);

/* EL BLOQUE QUE EMPIEZA AHORA, Y NO A SU HORA. Lo que dura el bloque que toca si empieza a la
   hora `t`: lo del plan, salvo que empiece tarde y detrás venga una reunión. Entonces deja sitio a su pausa o, si así no llega a 15 min, acaba al
   empezar la reunión, como el día que compone la regla. Sin esto, el bloque de 9:42 a 10:00
   empezado a las 9:45 duraba sus 18 min, acababa a las 10:03 dentro de la reunión, y la línea
   corría la reunión a las 10:03 (el bloque en marcha manda en `ritmo.regla.js`). */
function ritmoDurSiEmpiezas(p, t) {
  if (!p || !p.actual) return null;
  var a = p.actual, i = p.m.items.indexOf(a), pausa = 0, o = null;
  if (t <= a.desde) return a.dur;
  while (++i < p.m.items.length && !o) {
    var x = p.m.items[i];
    if (x.tipo === 'foco') break;
    if (x.tipo === 'pausa') pausa += x.dur;
    if (x.tipo === 'ocupado') o = x;
  }
  if (!o || t >= o.desde || t + a.dur + pausa <= o.desde) return a.dur;
  var d = o.desde - t - pausa;
  return Math.min(a.dur, d >= 15 ? d : o.desde - t);
}

Object.assign(window, { ritmoDesdeSinEmpezar, ritmoMirarSinEmpezar, ritmoDurSiEmpiezas });
