/* PACE · LAS PAUSAS CON BLOQUES CORTOS (Ez, 22 oct. 2026: 4a A · 4b A · 4c A · 5a A)
   ==================================================================================
   Con el aro a 5, 10 o 15 los bloques se juntan hasta media hora (ritmo.regla.js,
   `JUNTOS`) y la pausa con rutina llega a los 30 min de foco seguido. Entre medias, al
   acabar el bloque que llega a 15 min, el aro invita: «Un momento para moverte», con
   «Ver ejercicio» y «Seguir» (FocusTimer.bloques.jsx). Si detrás del bloque va la pausa, no.

   LA PERSONA ELIGE (4b), en la línea del aro y solo con el día empezado: «a mi ritmo»
   (lo de arriba, y lo que vale sin haber elegido) o «después de cada bloque», una pausa
   con rutina tras cada bloque y sin invitaciones. Se guarda en `ejercicioBloques`
   ('ritmo' | 'cada'); no está en `defaultState` y se lee como 'ritmo' si falta.

   SIN DÍA (4c) vale la misma regla con lo último elegido. Hasta ahora, sin día, la
   ventana de la pausa salía tras cada bloque, también con el aro a 5. Como aquí no hay
   plan que diga cuánto foco seguido llevas, se apunta al acabar cada bloque en
   `bloquesSinDia` = { fecha, seguidos, pausa }: `pausa` dice que detrás de ese bloque iba
   la ventana, y entonces el siguiente cuenta desde cero (como la pausa en la regla).

   `var`/`function` a propósito: un `const` no cruza la IIFE del artefacto. */

var BLOQUES_JUNTOS = 30;   /* la misma cifra que `JUNTOS` en ritmo.regla.js */
var BLOQUES_INVITA = 15;   /* la invitación, al llegar a 15 min de foco seguido */

/* 5, 10 y 15: los que se juntan (dos caben en media hora). */
function bloquesCortos(min) {
  var m = Number(min) || 0;
  return m > 0 && m * 2 <= BLOQUES_JUNTOS;
}
function bloquesCadaUno(s) { return !!s && s.ejercicioBloques === 'cada'; }

/* ¿Con `seguidos` min de foco, el siguiente bloque de `bloque` aún va pegado? La misma
   cuenta que `juntar` de la regla: si no, detrás de este bloque va la pausa. */
function bloquesJuntan(seguidos, bloque) { return seguidos + bloque <= BLOQUES_JUNTOS; }

/* ¿Invita el bloque que acaba? `antes`: el foco seguido antes de él; `pausa`: si detrás
   va la pausa con rutina. Solo el bloque que CRUZA los 15 min, una vez por tramo. */
function bloquesInvita(antes, bloque, pausa) {
  return !pausa && bloquesCortos(bloque) && antes < BLOQUES_INVITA && antes + bloque >= BLOQUES_INVITA;
}

/* El foco seguido antes de un bloque del plan: los bloques pegados de delante, hasta la
   pausa o la comida anterior (lo mismo que cuenta `ritmoPrevios` como `seguidos`). */
function bloquesSeguidoAntes(m, tramo) {
  var i = m.items.indexOf(tramo), suma = 0;
  while (--i >= 0) {
    var it = m.items[i];
    if (it.tipo === 'pausa' || it.tipo === 'comida') break;
    if (it.tipo === 'foco') suma += it.dur;
  }
  return suma;
}

/* AL ACABAR UN BLOQUE DE FOCO (FocusTimer, antes de decidir si se abre la ventana).
   Con día lo dice el plan; sin día apunta la cuenta. Devuelve si el aro invita. */
function bloquesTerminado(minutos) {
  var s = getState();
  var cada = bloquesCadaUno(s);
  var p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  if (p) {
    if (p.hechos < 1 || cada) return false;
    var ultimo = p.m.focos[p.hechos - 1];
    var detras = ritmoDetras(p.m, ultimo);
    return bloquesInvita(bloquesSeguidoAntes(p.m, ultimo), ultimo.dur, !(detras && detras.tipo === 'foco'));
  }
  var m = Number(minutos) || 0;
  var hoy = ritmoHoy();
  var c = s.bloquesSinDia;
  var antes = c && c.fecha === hoy && !c.pausa && typeof c.seguidos === 'number' ? c.seguidos : 0;
  var junta = !cada && bloquesCortos(m) && bloquesJuntan(antes + m, m);
  setState({ bloquesSinDia: { fecha: hoy, seguidos: antes + m, pausa: !junta } });
  return !cada && bloquesInvita(antes, m, !junta);
}

/* Los minutos de foco seguido con el bloque que acaba de terminar, para la frase de la hoja
   de «Ver ejercicio» («Llevas 20 minutos sentado»). Con día, el plan; sin día, la cuenta. */
function bloquesSeguidos() {
  var s = getState();
  var p = typeof ritmoPlan === 'function' ? ritmoPlan(s) : null;
  if (p) {
    if (p.hechos < 1) return 0;
    var ultimo = p.m.focos[p.hechos - 1];
    return bloquesSeguidoAntes(p.m, ultimo) + ultimo.dur;
  }
  var c = s.bloquesSinDia;
  return c && c.fecha === ritmoHoy() && !c.pausa && typeof c.seguidos === 'number' ? c.seguidos : 0;
}

/* Sin día: ¿el bloque que acaba de terminar va pegado al siguiente? (ritmoSinPausa) */
function bloquesSinDiaJunta(s) {
  var c = (s || {}).bloquesSinDia;
  return !!c && c.fecha === ritmoHoy() && c.pausa === false;
}

/* 4b · la elección del aro. Cambiarla recompone el día desde la regla (`cadaBloque`). */
function bloquesElegir(valor) {
  setState({ ejercicioBloques: valor === 'cada' ? 'cada' : 'ritmo' });
  if (typeof ritmoSincronizar === 'function') ritmoSincronizar();
}

Object.assign(window, {
  BLOQUES_JUNTOS, BLOQUES_INVITA, bloquesCortos, bloquesCadaUno, bloquesJuntan, bloquesInvita,
  bloquesSeguidoAntes, bloquesTerminado, bloquesSeguidos, bloquesSinDiaJunta, bloquesElegir,
});
