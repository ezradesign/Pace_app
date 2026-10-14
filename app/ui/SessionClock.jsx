/* PACE · SessionClock.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL RELOJ DE TIEMPO ACTIVO, COMPARTIDO (s170)
   ============================================
   Un acumulador segmentado: se le dice en cada render si la sesión está
   trabajando AHORA y él suma solo esos tramos. Es el mecanismo que Respira
   tiene desde s98 (hoy, este mismo reloj) y que Mueve/Estira NO tenían: hasta s170 su
   único tiempo era de pared —`Date.now() - sessionStart`— o sea **con las
   pausas dentro**.

   POR QUÉ SALE A UN ARCHIVO PROPIO EN VEZ DE COPIARSE. Con este ya iban a ser
   TRES copias del mismo bucle (Respira + los dos runners de cuerpo), y s147 ya
   se comió que hubiera CUATRO copias del render de glifo: cada copia envejece
   por su lado y el día que una se arregla las otras no se enteran. Lo que se
   comparte es el MECANISMO (segmentar y sumar), nunca la política: qué cuenta
   como «activo» lo decide cada runner al llamar a `marcar()`, y son criterios
   distintos por módulo (§6.4 del esquema de eventos).

   OJO AL TOCARLO: de aquí cuelgan la retención de Respira (`useHoldClock`, que
   delega) y el tiempo activo de Mueve/Estira. Un cambio aquí los mueve a los
   dos.

   MISMA DISCIPLINA QUE EL RELOJ DE s98: timestamp-based (decisión s96), no un
   contador de ticks — un `setInterval` pierde tiempo con la pestaña oculta y
   deriva. El tiempo con la pestaña oculta CUENTA, igual que en Foco; lo que se
   excluye son las pausas explícitas y las fases que el módulo declare inertes.

   CARGA ANTES de sus consumidores: BreatheSession.support.jsx, MoveModule.jsx
   y MoveSessionV1.jsx. Vive en `app/ui/` porque es el primer bloque que los
   tres tienen por delante en el orden de PACE.html.

   EL RATO EN QUE LA PÁGINA NO CORRE NO CUENTA. Con el equipo dormido o la app
   congelada por el sistema, el reloj de la pared sigue y la página no se
   entera: al volver, el tramo abierto llevaba dentro media hora que nadie
   practicó, y se acreditaba (caza del 14 oct., sesiones-1 y sesiones-4). El
   reloj late cada segundo mientras está abierto; si entre dos latidos pasa más
   que `PACE_HUECO_MS`, lo de antes del hueco cuenta y el hueco no. Una página
   viva late cada segundo aunque esté oculta (los navegadores espacian sus
   temporizadores a uno por segundo, y a uno por minuto solo si está callada),
   así que la pestaña oculta con la voz o la música de Respira sigue contando.
*/

const { useRef: useRefSC, useEffect: useEffectSC } = React;

/* Más que esto entre dos latidos es una página que no corría. Holgado frente al
   segundo de un latido normal, y muy por debajo del minuto con que un
   navegador espacia los temporizadores de una pestaña oculta y callada. */
const PACE_HUECO_MS = 15000;

/**
 * Reloj de tiempo activo. Devuelve { marcar, segundos }:
 *   · marcar(activo) — abre o cierra el segmento en curso. IDEMPOTENTE:
 *     llamarlo dos veces con el mismo valor no acumula de más, que es lo que
 *     permite llamarlo desde un efecto sin dependencias finas.
 *   · segundos() — total acumulado, INCLUYENDO el segmento abierto.
 *
 * Que `segundos()` cuente el segmento abierto no es un detalle: es lo que
 * permite leer el total en el mismo gesto que termina la sesión, sin cerrar el
 * reloj a mano antes. El banco de mutaciones de s166 demostró que tener las
 * dos cosas —cerrar a mano Y contar lo abierto— se tapan entre sí: romper
 * cualquiera de las dos dejaba los asertos en verde, o sea que no había forma
 * de saber si alguna funcionaba. Con una sola, la mutación muerde.
 */
/* s186 · ADMITE UNA SEMILLA, para que un reloj pueda CONTINUAR uno anterior.
   La usa la reanudación de Respira: al volver a una sesión interrumpida, la
   retención acumulada antes de irse no puede empezar de cero, o el total que
   se acredita sería menor que la práctica real. Va como valor inicial de un
   `useRef`, así que solo cuenta en el primer render y ningún consumidor
   anterior cambia de comportamiento (sin argumento, sigue valiendo 0). */
function useActiveClock(semillaMs) {
  const acumuladoMs = useRefSC(Number.isFinite(semillaMs) && semillaMs > 0 ? semillaMs : 0);
  const inicioSeg   = useRefSC(null);
  const latido      = useRefSC(null);

  /* Pone al día el tramo abierto. Lo llaman el latido, `marcar` y `segundos`,
     así que el primero que corre al despertar ya deja fuera el hueco. */
  const alDia = (ahora) => {
    if (inicioSeg.current == null) return;
    if (ahora - latido.current > PACE_HUECO_MS) {
      acumuladoMs.current += latido.current - inicioSeg.current;
      inicioSeg.current = ahora;
    }
    latido.current = ahora;
  };

  useEffectSC(() => {
    const id = setInterval(() => alDia(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const marcar = (activo) => {
    const ahora = Date.now();
    alDia(ahora);
    if (activo) {
      if (inicioSeg.current == null) { inicioSeg.current = ahora; latido.current = ahora; }
    } else if (inicioSeg.current != null) {
      acumuladoMs.current += ahora - inicioSeg.current;
      inicioSeg.current = null;
    }
  };

  const segundos = () => {
    const ahora = Date.now();
    alDia(ahora);
    const abierto = inicioSeg.current != null ? ahora - inicioSeg.current : 0;
    return (acumuladoMs.current + abierto) / 1000;
  };

  return { marcar, segundos };
}

/* MENOS DE MEDIO MINUTO NO CUENTA (Ez, 14 oct. 2026, sesiones-7). «Terminar» a
   los pocos segundos, o saltar todos los pasos, contaba una sesión entera: el
   minuto mínimo, la sesión, sus logros y el plan del día. Por debajo de esto el
   cierre dice «Sesión sin contar» y no se acredita nada. No es un número nuevo:
   desde 30 s el redondeo a minutos ya daba uno; por debajo, el minuto se lo
   inventaba el `Math.max(1, …)`. */
const PACE_MINIMO_CUENTA_S = 30;

/* UNA SESIÓN VIVA EN OTRA PESTAÑA no está a medias (caza del 14 oct., sesiones-6).
   El registro de una sesión interrumpida se escribe mientras se practica, así que
   otra pestaña lo leía como «a medias» con la sesión viva aquí, y si se seguía
   allí contaban las dos. La pestaña con la sesión abierta deja un LATIDO en su
   clave (cada 5 s, válido 15 s); mientras late en otra, aquí no se ofrece. Al
   terminar, salir o cerrar se borra; si la pestaña muere sin borrarlo, caduca.
   Va aparte del registro porque es otra cosa: el registro dice por dónde ibas,
   el latido dice que alguien sigue ahí. Lo usan Respira y Mueve/Estira. */
const PACE_VIVA_MS = 15000;
const PACE_PESTANA = Math.random().toString(36).slice(2);

function sesionVivaFuera(clave, ahora) {
  try {
    const v = JSON.parse(localStorage.getItem(clave) || 'null');
    const t = Number.isFinite(ahora) ? ahora : Date.now();
    const late = v && v.pestana !== PACE_PESTANA && Number.isFinite(v.hasta) &&
      v.hasta > t && v.hasta - t <= PACE_VIVA_MS;
    return late ? v : null;
  } catch (e) { return null; }
}

function useSesionViva(clave, routineId, viva) {
  useEffectSC(() => {
    if (!viva || !routineId) return undefined;
    const latir = () => {
      try {
        localStorage.setItem(clave, JSON.stringify({
          pestana: PACE_PESTANA, routineId: routineId, hasta: Date.now() + PACE_VIVA_MS }));
      } catch (e) {}
    };
    const soltar = () => {
      try {
        const v = JSON.parse(localStorage.getItem(clave) || 'null');
        if (v && v.pestana === PACE_PESTANA) localStorage.removeItem(clave);
      } catch (e) {}
    };
    latir();
    const id = setInterval(latir, 5000);
    window.addEventListener('pagehide', soltar);
    return () => { clearInterval(id); window.removeEventListener('pagehide', soltar); soltar(); };
  }, [viva]);
}

Object.assign(window, { useActiveClock, PACE_HUECO_MS, PACE_MINIMO_CUENTA_S, sesionVivaFuera, useSesionViva });
