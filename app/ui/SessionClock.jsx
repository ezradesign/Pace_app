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

Object.assign(window, { useActiveClock, PACE_HUECO_MS });
