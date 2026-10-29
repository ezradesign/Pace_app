/* PACE · Piezas del runner de Mueve y Estira que no caben en MoveSessionV1.jsx (regla de las 500
   líneas). Lo que montó la maqueta del 29 oct. 2026 que eligió Ez (B3, P5, P6 y P8).

   «CON UNA BASTA» (Ez, P6 A). «Levántate y sube» dice en su primera serie «La primera vez, una
   serie basta», pero luego venía la segunda, y saltarla dejaba la rutina «no entera», sin logros.
   Una rutina que lo promete lleva `unaBasta` en su dato, y en cada descanso que separa dos series
   del MISMO ejercicio el runner ofrece «Con una basta», centrada bajo «SEGUNDOS»: salta las series
   que quedan de ese ejercicio (y sus descansos) y sigue con el siguiente. La rutina cuenta entera
   y el cierre dice las series que hiciste, sin inventar las otras (MoveSessionV1.jsx, `bastaRef`).
   Va en el dato y no en el grupo «Para empezar»: es la promesa de la frase la que se cumple. */

/* El paso al que lleva «Con una basta» desde el descanso `idx`, o -1 si ahí no sale. Si no
   queda otro ejercicio, `routine.steps.length`: la rutina se acaba. */
function v1BastaDestino(routine, idx) {
  const pasos = (routine && routine.steps) || [];
  if (!routine || !routine.unaBasta || !pasos[idx] || pasos[idx].mode !== 'rest') return -1;
  let antes = idx - 1;
  while (antes >= 0 && pasos[antes].mode === 'rest') antes--;
  let luego = idx + 1;
  while (luego < pasos.length && pasos[luego].mode === 'rest') luego++;
  if (antes < 0 || luego >= pasos.length || pasos[luego].name !== pasos[antes].name) return -1;
  const nombre = pasos[antes].name;
  while (luego < pasos.length && (pasos[luego].mode === 'rest' || pasos[luego].name === nombre)) luego++;
  return luego;
}

/* ¿Sale «Con una basta» en algún descanso de esta rutina? Entonces su hueco va en todos los pasos
   (MoveSessionV1.cuerpo.jsx): aparecer solo en el descanso movería lo de debajo. */
function v1ConBasta(routine) {
  return !!(routine && routine.unaBasta && (routine.steps || []).some((s, i) => v1BastaDestino(routine, i) >= 0));
}

Object.assign(window, { v1BastaDestino, v1ConBasta });
