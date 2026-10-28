/* PACE · useCountdown — motor de cuenta atras timestamp-based (s96 / v0.41.0)
   Compartido por FocusTimer (Pomodoro home) y PathFocusStep (foco
   contextual de Camino). Extraido para no engordar FocusTimer (ya a 493 ln).

   La verdad del tiempo vive en `endsAt` (ms epoch), NO en un contador que se
   decrementa. Un tick de 1s solo fuerza el re-render; `remaining` se deriva
   en cada render con ceil((endsAt - now)/1000). Con la pestana oculta el
   navegador throttlea setInterval a ~1/min, pero como `remaining` se
   recalcula desde `endsAt` NO subcuenta: al volver la pestana
   (visibilitychange) o en el siguiente tick el valor se corrige y, si ya
   paso `endsAt`, la sesion se completa. Cero deriva en background.

   Estados: 'idle' | 'running' | 'paused' | 'completed'.
   'completed' es TERMINAL: start()/toggle() son no-op hasta reset() o hasta
   que cambie el reloj (`durationSec` o `modo`: cambio de modo/minutos en el
   home) -> resetea a idle. Evita el re-credito latente del timer previo.

   Pausa: se congela `remaining`; al reanudar `endsAt = now + remaining`.
   Persistencia: NINGUNA (local al componente; recargar resetea el timer como
   antes -- decision s96: la no-deriva no requiere pace.state).

   Firma: useCountdown(durationSec, onComplete, modo)
     -> { remaining, running, status, start, pause, resume, toggle, reset }
   `modo` (opcional) es parte de la IDENTIDAD del reloj, con la duración: el Foco de 5
   y la pausa corta (5) son relojes distintos, y pasar de uno a otro también vuelve a
   idle. Sin él, una pausa en marcha seguía corriendo como Foco y contaba como trabajo.
   `onComplete` se guarda en ref y se invoca UNA vez en running->completed
   (single-shot; reemplaza los guards justFinished/creditedRef).

   `remaining` es SIEMPRE segundos enteros (ceil): mins/secs y progress se
   derivan de el, asi que ambos cambian una vez por segundo -- identico al
   contador decremental previo (ningun nudge sub-segundo del aro).
*/

const {
  useState: useStateUC, useEffect: useEffectUC,
  useRef: useRefUC, useCallback: useCallbackUC,
} = React;

function useCountdown(durationSec, onComplete, modo) {
  const [status, setStatus] = useStateUC('idle');      // idle | running | paused | completed
  const statusRef = useRefUC('idle');                  // espejo sincrono para los handlers
  const endsAtRef = useRefUC(null);                    // ms epoch; valido solo en 'running'
  const remainingMsRef = useRefUC(durationSec * 1000); // congelado en idle/paused/completed
  const firedRef = useRefUC(false);                    // single-shot de onComplete
  const onCompleteRef = useRefUC(onComplete);
  const [, forceTick] = useStateUC(0);                 // el tick SOLO re-renderiza

  // Ultima onComplete sin re-suscribir el interval (patron latest-ref).
  useEffectUC(() => { onCompleteRef.current = onComplete; });
  // Espejo de status (backstop; los handlers tambien lo escriben a mano).
  useEffectUC(() => { statusRef.current = status; });

  // remaining (segundos enteros) derivado del reloj real.
  let remainingMs;
  if (status === 'running') remainingMs = Math.max(0, endsAtRef.current - Date.now());
  else if (status === 'completed') remainingMs = 0;
  else if (status === 'paused') remainingMs = remainingMsRef.current; // congelado mid-run
  // idle: SIEMPRE la duracion completa (aro vacio -> progress 0). Derivar de
  // `durationSec` y no de remainingMsRef evita que un cambio de preset deje el
  // aro con relleno proporcional: el efecto [durationSec] hace setStatus('idle')
  // que React ignora si ya era 'idle' (no re-render) mientras remainingMsRef
  // aun tenia la duracion vieja -> aro a medias. Aqui el idle no depende del ref
  // ni del re-render (s97).
  else remainingMs = durationSec * 1000;
  const remaining = Math.ceil(remainingMs / 1000);

  const complete = useCallbackUC(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    remainingMsRef.current = 0;
    endsAtRef.current = null;
    statusRef.current = 'completed';
    setStatus('completed');
    try {
      if (typeof onCompleteRef.current === 'function') onCompleteRef.current();
    } catch (e) {}
  }, []);

  // Ticker: solo corre en 'running'. Re-renderiza cada segundo y comprueba el
  // fin contra el reloj real. visibilitychange corrige al instante (sin
  // esperar al siguiente tick throttleado).
  useEffectUC(() => {
    if (status !== 'running') return;
    /* Mira el espejo sincrono antes que la hora: un reinicio (otro reloj, «Cambiar» con la
       pausa del dia) deja `endsAtRef` en null antes de que React quite este tic, y
       `Date.now() >= null` es verdadero. El tic que caia en ese hueco daba el reloj por
       acabado y llamaba a `onComplete` (tests/aro-modo-identidad.spec.js). */
    const check = () => {
      if (statusRef.current !== 'running' || endsAtRef.current == null) return;
      if (Date.now() >= endsAtRef.current) complete();
      else forceTick(n => n + 1);
    };
    const id = setInterval(check, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [status, complete]);

  // Reset por cambio de reloj (home: cambio de modo o de minutos) -> idle.
  useEffectUC(() => {
    firedRef.current = false;
    endsAtRef.current = null;
    remainingMsRef.current = durationSec * 1000;
    statusRef.current = 'idle';
    setStatus('idle');
  }, [durationSec, modo]);

  const start = useCallbackUC(() => {
    if (statusRef.current === 'running' || statusRef.current === 'completed') return;
    firedRef.current = false;
    endsAtRef.current = Date.now() + remainingMsRef.current;
    statusRef.current = 'running';
    setStatus('running');
  }, []);

  const pause = useCallbackUC(() => {
    if (statusRef.current !== 'running') return;
    remainingMsRef.current = Math.max(0, endsAtRef.current - Date.now());
    endsAtRef.current = null;
    statusRef.current = 'paused';
    setStatus('paused');
  }, []);

  const toggle = useCallbackUC(() => {
    if (statusRef.current === 'running') pause();
    else start();
  }, [pause, start]);

  const reset = useCallbackUC(() => {
    firedRef.current = false;
    endsAtRef.current = null;
    remainingMsRef.current = durationSec * 1000;
    statusRef.current = 'idle';
    setStatus('idle');
  }, [durationSec]);

  /* s102: reanuda una sesion running persistida (pace.timer.v1) con su
     endsAt original. Solo desde 'idle'; la coherencia de duracion/modo la
     valida el caller (FocusTimer.support).
     A diferencia de start(), NO recalcula endsAt: el tiempo que paso
     durante la recarga cuenta como transcurrido. Y si ya ha pasado del todo
     (el bloque termino con la pagina cerrada), se completa en el acto, con su
     `onComplete`, igual que al volver a una pestaña que siguio abierta (Ez,
     12 oct. 2026: «que cuente»; si cuenta o no lo decide el caller). */
  const restore = useCallbackUC((endsAtMs) => {
    if (statusRef.current !== 'idle') return;
    if (typeof endsAtMs !== 'number') return;
    if (endsAtMs <= Date.now()) { complete(); return; }
    firedRef.current = false;
    endsAtRef.current = endsAtMs;
    statusRef.current = 'running';
    setStatus('running');
  }, []);

  /* Otra pestaña lleva el mismo bloque (FocusTimer.pestanas.jsx) y manda: `seguir` lo pone a
     correr hasta SU final, venga de donde venga, y `congelar` lo deja en pausa con SU resto.
     Ninguno pasa por 'completed' ni avisa a `onComplete`: eso solo lo hace el reloj. */
  const seguir = useCallbackUC((endsAtMs) => {
    if (!(typeof endsAtMs === 'number' && endsAtMs > Date.now())) return;
    firedRef.current = false;
    endsAtRef.current = endsAtMs;
    statusRef.current = 'running';
    setStatus('running');
    forceTick(n => n + 1);
  }, []);
  const congelar = useCallbackUC((restanteMs) => {
    firedRef.current = false;
    endsAtRef.current = null;
    remainingMsRef.current = Math.max(0, Math.min(restanteMs, durationSec * 1000));
    statusRef.current = 'paused';
    setStatus('paused');
    forceTick(n => n + 1);
  }, [durationSec]);

  return {
    remaining,
    running: status === 'running',
    status,
    /* endsAt expuesto solo en running (para persistencia s102); null en el
       resto de estados. */
    endsAt: status === 'running' ? endsAtRef.current : null,
    /* Lo que queda de un bloque en pausa, en ms, para guardarlo (FocusTimer.support). */
    restanteMs: status === 'paused' ? remainingMsRef.current : null,
    start, pause, resume: start, toggle, reset, restore, seguir, congelar,
  };
}

Object.assign(window, { useCountdown });
