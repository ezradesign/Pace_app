/* PACE · app/move/MoveSessionV1.cambios.jsx — LOS CAMBIOS DENTRO DE UN PASO
   =========================================================================
   Ez, 1A del 16 nov. 2026 (docs/proposals/menores-16nov/). Siete pasos cambian de brazo, pie, lado o
   sentido a mitad («cuatro adelante y cuatro atrás. Luego, el otro») y el runner no lo decía: había
   que llevar la cuenta y leer con el brazo en el aire. El dato lo marca en el paso (`cambios`, en
   repeticiones hechas o, con reloj, en segundos) y aquí se decide qué pasa:
     · EN EL MOMENTO DEL CAMBIO suena lo del cambio de lado entre series: los dos cuencos, dos toques
       de vibración y, si es de lado, la voz dice «Cambia de lado» en lugar del número de esa
       repetición. El de sentido no tiene palabra grabada: suenan los cuencos;
     · EL TEXTO EMPIEZA CON LA PALABRA DEL TRAMO (`dice`), en negrita y del color del módulo, como
       «Izquierda.» en los pasos por lados. CON LA CONDICIÓN DE EZ: «que nada modifique las líneas o
       se superponga o cambie el formato». Solo llevan palabra los pasos en los que, a 360 × 640 y
       740, con la letra al 115 % y en los dos idiomas, no añade ninguna línea ni cambia el dibujo
       (medido en docs/proposals/menores-16nov/genera.a-corta.js; lo vigila tests/runner-cambios.spec.js).
       Los demás llevan solo la señal. Círculos de brazos, Gateo con rodillas y Desliza el talón caben
       porque su texto ya no dice lo que dice la palabra (Ez, 19 nov.). La palabra se reserva en la pila del texto (MoveSessionV1.cuerpo.jsx),
       así que nada salta al cambiar;
     · EN EL CAMBIO DE LADO EL DIBUJO SE DA LA VUELTA, como en los pasos por lados.
   Con «Auto» apagado las repeticiones van a tu ritmo y el reloj no sabe por cuál vas: ni palabra ni
   vuelta del dibujo en los pasos de repeticiones.

   `function` a propósito: un `const` no cruza la IIFE del artefacto. */

/* El segundo del paso en que empieza el cambio `c`. */
function v1CambioSeg(step, c) {
  return step.mode === 'reps' ? c.en * v1RepSeconds(step) : c.en;
}

/* Los cambios ya pasados a los `elapsed` segundos del paso. */
function v1CambiosPasados(step, elapsed) {
  const cs = (step && Array.isArray(step.cambios)) ? step.cambios : [];
  return cs.filter((c) => elapsed >= v1CambioSeg(step, c));
}

/* El cambio que empieza justo en este segundo, o null: es el que suena. */
function v1CambioAhora(step, elapsed) {
  const cs = (step && Array.isArray(step.cambios)) ? step.cambios : [];
  return cs.find((c) => v1CambioSeg(step, c) === elapsed) || null;
}

/* Lo que se le pasa a `playSound('move.side', …)`: la voz dice «Cambia de lado» solo en el de lado. */
function v1CambioSonido(c) {
  return c && c.que === 'lado' && typeof v1VozLado === 'function' ? v1VozLado() : undefined;
}

/* ¿Se sabe por qué tramo vas? En las repeticiones, solo con su cadencia (Auto). */
function v1CambiosVivos(step, auto) {
  return !!(step && step.cambios) && (auto || step.mode !== 'reps');
}

/* La palabra que abre el texto ahora, o null (antes del primer cambio, o un tramo sin palabra). */
function v1CambioPalabra(step, elapsed, t, auto) {
  if (!v1CambiosVivos(step, auto)) return null;
  const pasados = v1CambiosPasados(step, elapsed);
  const ultimo = pasados[pasados.length - 1];
  return ultimo && ultimo.dice ? t('move.cambio.' + ultimo.dice) : null;
}

/* Todas las palabras del paso, para reservarlas en la pila del texto. */
function v1CambiosPalabras(step, t) {
  const cs = (step && Array.isArray(step.cambios)) ? step.cambios : [];
  return cs.filter((c) => c.dice).map((c) => t('move.cambio.' + c.dice)).filter((w, i, a) => a.indexOf(w) === i);
}

/* El lado del dibujo: se da la vuelta en cada cambio de lado. null si el paso no tiene cambios. */
function v1CambioLado(step, elapsed, auto) {
  if (!v1CambiosVivos(step, auto)) return null;
  return v1CambiosPasados(step, elapsed).filter((c) => c.que === 'lado').length % 2;
}

Object.assign(window, { v1CambioSeg, v1CambiosPasados, v1CambioAhora, v1CambioSonido, v1CambiosVivos, v1CambioPalabra, v1CambiosPalabras, v1CambioLado });
