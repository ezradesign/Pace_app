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
   que cambie `durationSec` (cambio de modo/minutos en el home) -> resetea a
   idle. Evita el re-credito latente del timer previo.

   Pausa: se congela `remaining`; al reanudar `endsAt = now + remaining`.
   Persistencia: NINGUNA (local al componente; recargar resetea el timer como
   antes -- decision s96: la no-deriva no requiere pace.state).

   Firma: useCountdown(durationSec, onComplete)
     -> { remaining, running, status, start, pause, resume, toggle, reset }
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

function useCountdown(durationSec, onComplete) {
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
    const check = () => {
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

  // Reset por cambio de duracion (home: cambio de modo/minutos) -> idle.
  useEffectUC(() => {
    firedRef.current = false;
    endsAtRef.current = null;
    remainingMsRef.current = durationSec * 1000;
    statusRef.current = 'idle';
    setStatus('idle');
  }, [durationSec]);

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

  return {
    remaining,
    running: status === 'running',
    status,
    start, pause, resume: start, toggle, reset,
  };
}

Object.assign(window, { useCountdown });
