/* PACE · app/move/MoveSessionV1.voz.jsx — QUÉ DICE LA VOZ EN CADA SONIDO DEL RUNNER
   ===================================================================================
   Ez, 15 nov. 2026: 1A 2A 3A (docs/proposals/voz-cuerpo-15nov/). La voz dice lo que ya dice la pantalla, en
   el momento en que suena un cuenco o una madera, y nada más: ni nombres de ejercicio, ni colocaciones, ni
   «baja» o «sube» (el `tempo` del dato no dice en qué orden va cada movimiento: en los talones se sube
   primero). El runner pasa a `playSound` la palabra que toca (`{ voz, max, soloVoz }`); si esa palabra no
   está grabada o no cabe, suena el cuenco o la madera de siempre (Sound.voz.cuerpo.js).

   Va aparte porque el runner roza las 500 líneas. `function` a propósito: un `const` no cruza la IIFE. */

/* El «tres, dos, uno» del final de cualquier cuenta: van de segundo en segundo, así que caben las tres en
   1 s o suenan las tres a madera (Sound.voz.cuerpo.js decide la serie entera). */
var V1_VOZ_CUENTA = ['c3', 'c2', 'c1'];
function v1VozCuenta(n) {
  return n >= 1 && n <= 3 ? { voz: 'c' + n, max: 1, serie: V1_VOZ_CUENTA } : null;
}

/* Cada repetición guiada se cuenta al acabarla, si caben todos los números de la serie en lo que dura una
   repetición; si no, la serie entera va a madera. La última se dice entera y lo que viene después espera a
   que acabe (la cola de Sound.voz.cuerpo.js); con el tono no suena nada en la última, como siempre: en ese
   momento ya suena el cuenco del paso. Una serie de más de 25 no tiene todos sus números: madera. */
function v1VozRep(n, repSec, ultima, total) {
  if (!(n >= 1 && n <= 25 && n === Math.floor(n))) return ultima ? { soloVoz: true } : null;
  const serie = [];
  for (let k = 1; k <= (total || n); k++) serie.push('n' + k);
  return ultima ? { voz: 'n' + n, max: repSec, serie, soloVoz: true, ultima: true } : { voz: 'n' + n, max: repSec, serie };
}

/* Al entrar en un paso: «Descansa»; «Último paso» en el último con ejercicio (si la rutina tiene más de
   uno); «Colócate» si hay que colocarse; «Ya» en la otra serie del mismo ejercicio o al empezar la rutina;
   «Siguiente» si empieza otro ejercicio sin colocarse. */
function v1VozEntrada(routine, idx, fase) {
  const pasos = (routine && routine.steps) || [];
  const st = pasos[idx];
  if (!st) return null;
  if (st.mode === 'rest') return { voz: 'descansa' };
  const conTrabajo = pasos.filter(p => p.mode !== 'rest').length;
  const quedan = pasos.slice(idx + 1).some(p => p.mode !== 'rest');
  if (!quedan && conTrabajo > 1) return { voz: 'ultimo' };
  if (fase === 'place') return { voz: 'colocate' };
  let antes = idx - 1;
  while (antes >= 0 && pasos[antes].mode === 'rest') antes--;
  if (antes < 0 || pasos[antes].name === st.name) return { voz: 'ya' };
  return { voz: 'siguiente' };
}

/* Acaba la cuenta de colocarse o de cambiar de lado: «Ya», o el lado que empieza, que es la palabra que
   abre el texto en pantalla (siempre se empieza por la izquierda). */
function v1VozGo(step, side) {
  if (step && step.mode === 'perSide') return { voz: side === 0 ? 'izquierda' : 'derecha' };
  return { voz: 'ya' };
}

function v1VozLado() { return { voz: 'cambia' }; }

/* La voz de la rutina se descodifica al abrirla, antes de la cuenta de entrada, como en Respira. */
function v1VozPrecarga() {
  try { if (typeof window.paceVozCuerpoPrecarga === 'function') window.paceVozCuerpoPrecarga(); } catch (e) { /* sin voz, cuencos */ }
}

Object.assign(window, { v1VozCuenta, v1VozRep, v1VozEntrada, v1VozGo, v1VozLado, v1VozPrecarga });
