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
  return n >= 1 && n <= 3 ? { voz: 'c' + n, max: 1, serie: V1_VOZ_CUENTA, primera: n === 3 } : null;
}

/* LA VOZ DICE EL NÚMERO QUE LA PANTALLA ACABA DE PONER (Ez, 19 nov. 2026): la pantalla cuenta la
   repetición que empieza (1 al entrar, 2 al acabar la primera…), y la voz contaba la que acababa: decía
   «uno» con un 2 en pantalla, una repetición entera tarde. Ahora, al empezar la repetición `n` (de 2 a
   `total`), suena «n» con su madera. La primera no tiene número: en ese instante ya suena la palabra del
   paso («Ya», «Siguiente», «Último paso») o el cuenco. Y al acabar la última no suena nada: suena lo que
   viene después. La serie son esos números y se decide entera: si uno no cabe en lo que dura una
   repetición, toda a madera. Una serie de más de 25 no tiene todos sus números: madera. */
function v1VozRep(n, repSec, total) {
  if (!(n >= 2 && n <= 25 && n === Math.floor(n) && n <= total)) return null;
  const serie = [];
  for (let k = 2; k <= total; k++) serie.push('n' + k);
  return { voz: 'n' + n, max: repSec, serie, primera: n === 2, ultima: n === total };
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

/* Al pausar, saltar o salir, lo que dice la voz se calla y su fila se vacía (Sound.voz.cuerpo.js). */
function v1VozCalla() {
  try { if (typeof window.paceVozCuerpoCalla === 'function') window.paceVozCuerpoCalla(); } catch (e) { /* sin voz, nada */ }
}

/* La voz de la rutina se descodifica al abrirla, antes de la cuenta de entrada, como en Respira. Y EL
   AUDIO SE DESPIERTA YA, con el toque que abre la rutina: el contexto nacía con la primera madera de la
   cuenta de entrada (el «tres»), y mientras arranca su reloj está parado. El «tres» sonaba medio segundo
   tarde y el «dos» lo encontraba aún sonando: «tres, (madera), uno». Con sonido apagado no se crea. */
function v1VozPrecarga() {
  try {
    const s = typeof getState === 'function' ? getState() : null;
    const ctx = s && s.soundOn && typeof window.paceAudioCtx === 'function' ? window.paceAudioCtx() : null;
    const p = ctx && ctx.state !== 'running' && ctx.state !== 'closed' ? ctx.resume() : null;
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (e) { /* sin audio, nada que despertar */ }
  try { if (typeof window.paceVozCuerpoPrecarga === 'function') window.paceVozCuerpoPrecarga(); } catch (e) { /* sin voz, cuencos */ }
}

Object.assign(window, { v1VozCuenta, v1VozRep, v1VozEntrada, v1VozGo, v1VozLado, v1VozCalla, v1VozPrecarga });
