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
   si siguiera la hora, se reescribiría cada cinco minutos hasta que empezaras.

   CON EL DÍA EMPEZADO, AL VOLVER TRAS LA PAUSA (Ez, S11 A del 8 nov. 2026): quien dejaba PACE de
   fondo en la pausa de las 8:46 y volvía a las 12:10 leía «Ahora · 8:46 Empuje sencillo» y «Luego ·
   8:51 Foco · bloque 2 de 11», y la línea con todo el día en horas pasadas; solo al pulsar «Empezar
   bloque 2» se recolocaba. Ahora, en cuanto el rato de la pausa acabó, el resto del día se lee desde
   ahora, de 5 en 5, con lo hecho y la pausa delante como historia: lo mismo que sale al pulsar. La
   pausa sigue abierta (se puede hacer, y al empezar el bloque queda saltada si no se hizo), pero ya
   no es «Ahora» en la línea, la tarjeta ni la barra lateral (`pausaPasada`). También se lee, no se
   escribe; al empezar, ritmoBloqueEmpezado lo fija. */

/* La hora (minutos) desde la que leer el día de hoy, o null si manda la guardada. */
function ritmoDesdeSinEmpezar(s, R) {
  var d = R && R.dia;
  if (!d || R.libre || d.pausa != null) return null;
  if ((Number((s || {}).cycle) || 0) - (d.cicloBase || 0) > 0) return null;
  if (typeof ritmoFocoCorriendo === 'function' && ritmoFocoCorriendo()) return null;
  var ahora = ritmoAhora();
  return ahora > (Number(d.desde) || 0) ? ahora : null;
}

/* El día leído desde ahora tras una pausa ya acabada: { m, pausa, desde }, o null. `m`, `hechos` y
   `pausa` son los del plan guardado. Sin un bloque en marcha (S8: el que acabó y aún no se contó
   tampoco), y solo si desde ahora aún queda un bloque. */
function ritmoLeerTrasLaPausa(s, R, m, hechos, pausa) {
  if (!pausa || pausa.tipo !== 'pausa' || hechos < 1 || !R || !R.dia) return null;
  var fin = pausa.desde + pausa.dur;
  if (ritmoAhoraExacto() < fin) return null;
  if (typeof ritmoFocoCorriendo === 'function' && ritmoFocoCorriendo()) return null;
  var desde = Math.max(ritmoAhora(), fin);
  var hecho = ritmoCongelar(m.items.slice(0, m.items.indexOf(pausa) + 1));
  var m2 = ritmoMenu(s, R.dia.opcion, R.dia.cambios, desde, hecho, null, false, R.dia.bloque || null);
  if (!m2 || m2.focos.length <= hechos) return null;
  return { m: m2, pausa: ritmoDetras(m2, m2.focos[hechos - 1]), desde: desde };
}

/* Cuando el día sin empezar (o tras la pausa) se mueve, se repinta todo con la misma copia (como al
   adoptar la de otra pestaña): la barra lateral y el aro no se repintan solos si el estado no cambia. */
var _ritmoSinEmpezarVisto = null;
function ritmoMirarSinEmpezar() {
  try {
    var s = getState();
    var d = ritmoDesdeSinEmpezar(s, ritmoDe(s));
    if (d == null) { var pb = ritmoPlanBase(s); if (pb && pb.desdeTras != null) d = 'tras' + pb.desdeTras; }
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
   corría la reunión a las 10:03 (el bloque en marcha manda en `ritmo.regla.js`).
   ANTES DE COMER, IGUAL (Ez, S7 A del 8 nov. 2026): el bloque que empieza antes de la comida acaba
   a la hora de comer, tarde o antes de su hora. Con «Ahora no» en la larga de las 13:45 y «Empezar
   ya el bloque 7» a las 13:46, el bloque de después de comer duraba sus 45 min y se comía la comida
   hasta las 14:31; ahora va de 13:46 a 14:00 y la comida sigue a su hora. Nunca menos de 5 min
   (FOCO_MINIMO: con menos, al recargar el aro no casaría y el bloque se perdería). */
function ritmoDurSiEmpiezas(p, t) {
  if (!p || !p.actual) return null;
  var a = p.actual, i = p.m.items.indexOf(a), pausa = 0, o = null, dur = a.dur;
  while (t > a.desde && ++i < p.m.items.length && !o) {
    var x = p.m.items[i];
    if (x.tipo === 'foco') break;
    if (x.tipo === 'pausa') pausa += x.dur;
    if (x.tipo === 'ocupado') o = x;
  }
  if (o && t < o.desde && t + a.dur + pausa > o.desde) {
    var d = o.desde - t - pausa;
    dur = Math.min(a.dur, d >= 15 ? d : o.desde - t);
  }
  var c = ritmoComidaSinEmpezar(p.m, t);
  if (c && t + dur > c.desde) dur = Math.max(5, c.desde - t);
  return dur;
}

/* La comida de hoy que aún no ha empezado a la hora `t`, o null. */
function ritmoComidaSinEmpezar(m, t) {
  for (var i = 0; m && i < m.items.length; i++) if (m.items[i].tipo === 'comida' && m.items[i].desde > t) return m.items[i];
  return null;
}

Object.assign(window, { ritmoDesdeSinEmpezar, ritmoMirarSinEmpezar, ritmoDurSiEmpiezas, ritmoLeerTrasLaPausa, ritmoComidaSinEmpezar });
