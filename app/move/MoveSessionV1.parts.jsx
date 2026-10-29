/* PACE · Piezas del runner de Mueve y Estira que no caben en MoveSessionV1.jsx (regla de las 500
   líneas). Lo que montó la maqueta del 29 oct. 2026 que eligió Ez: «Con una basta» (P6), la pausa
   que se ve (P8) y los atajos de teclado, que salieron con ella.

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

/* LA PAUSA SE VE (Ez, P8 B, con su retoque: «que se vea la bola del dibujo arriba»). Al pausar, un
   velo tapa lo que hay debajo del dibujo (el nombre, la instrucción, el número y la línea de abajo)
   con «Sesión en pausa», «Descansa» y qué pasa al volver; el círculo y su arco quedan a la vista,
   que es lo que se mira para recordar la postura. El velo es una capa encima (VeloV1, dentro del
   cuerpo): no mueve nada. Al reanudar no se sigue al momento: 3, 2, 1 en el velo, con sus maderas,
   y luego lo que quedaba; mientras, la sesión sigue en pausa y el botón del centro vuelve a pausar.
   «‹», «›», «Saltar este paso» y «Con una basta» siguen como siempre: sin cuenta.
   El reloj de la cuenta es el de la preparación (un `setTimeout` por segundo). */
const V1_VUELTA_SEGUNDOS = 3;

function useV1Vuelta(paused, setPaused) {
  const [cuenta, setCuenta] = React.useState(null);   // 3, 2, 1 al volver; null si no se vuelve
  React.useEffect(() => {
    if (cuenta == null) return undefined;
    try { playSound('move.warn'); } catch (e) {}
    const to = setTimeout(() => {
      if (cuenta > 1) setCuenta(cuenta - 1);
      else { setCuenta(null); setPaused(false); }
    }, 1000);
    return () => clearTimeout(to);
  }, [cuenta]);
  const pausar = () => { setCuenta(null); setPaused(true); };
  const reanudar = () => { setCuenta(null); setPaused(false); };
  /* El botón del centro y Espacio: pausan; en pausa, empiezan el 3, 2, 1; durante él, lo paran. */
  const alternar = () => {
    if (!paused) pausar();
    else setCuenta(c => (c == null ? V1_VUELTA_SEGUNDOS : null));
  };
  return { cuenta, pausar, reanudar, alternar };
}

function VeloV1({ aro, cuenta, t }) {
  const volviendo = cuenta != null;
  return (
    <div data-pace-v1-velo className="pace-v1-velo" role="status"
      style={{ top: 'calc(var(--v1-u) * 1.5 + ' + aro + 'px)' }}>
      <div className="pace-v1-velo-kicker">{t(volviendo ? 'move.pausa.vuelta' : 'move.pausa.kicker')}</div>
      <div className="pace-v1-velo-pila">
        <div className="pace-v1-velo-titulo" style={volviendo ? { visibility: 'hidden' } : null}>{t('move.pausa.titulo')}</div>
        <div className="pace-v1-velo-num" data-pace-v1-vuelta style={volviendo ? null : { visibility: 'hidden' }}>{volviendo ? cuenta : ''}</div>
      </div>
      {/* Una oración por línea: «Sigues desde este punto.» / «Al reanudar, 3, 2, 1…». */}
      <p className="pace-v1-velo-texto">{t('move.pausa.texto').replace('. ', '.\n')}</p>
    </div>
  );
}

/* Los atajos: Espacio pausa y reanuda (con el 3, 2, 1), Escape sale y Enter cierra el final.
   Lee lo de cada render por un ref, así que se engancha una vez. */
function useV1Teclas(stage, alternar, onExit, cerrar) {
  const ref = React.useRef();
  ref.current = { stage, alternar, onExit, cerrar };
  React.useEffect(() => {
    const onKey = (e) => {
      const c = ref.current;
      if (e.key === ' ') {
        // No robar Espacio a un control con foco (chips de feedback / CTA en 'done'): que lo
        // active nativamente en vez de hacer preventDefault (s116).
        if (sessionKeyOnControl(e)) return;
        e.preventDefault();
        if (c.stage === 'run') c.alternar();
      }
      if (e.key === 'Escape') c.onExit('exit');
      // Enter cierra el DONE, salvo que el foco esté en un control (feedback o el propio CTA se
      // activan por su onClick) o haya modificadores/IME: guard P0 s116 (evita una SEGUNDA salida).
      if (e.key === 'Enter' && c.stage === 'done' && !sessionDoneKeyBlocked(e)) c.cerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

Object.assign(window, { v1BastaDestino, v1ConBasta, useV1Vuelta, VeloV1, useV1Teclas, V1_VUELTA_SEGUNDOS });
