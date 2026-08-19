/* PACE · SessionClock.jsx
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   EL RELOJ DE TIEMPO ACTIVO, COMPARTIDO (s170)
   ============================================
   Un acumulador segmentado: se le dice en cada render si la sesión está
   trabajando AHORA y él suma solo esos tramos. Es el mecanismo que Respira
   tiene desde s98 (`activeMsRef`) y que Mueve/Estira NO tenían: hasta s170 su
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
*/

const { useRef: useRefSC } = React;

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
function useActiveClock() {
  const acumuladoMs = useRefSC(0);
  const inicioSeg   = useRefSC(null);

  const marcar = (activo) => {
    if (activo) {
      if (inicioSeg.current == null) inicioSeg.current = Date.now();
    } else if (inicioSeg.current != null) {
      acumuladoMs.current += Date.now() - inicioSeg.current;
      inicioSeg.current = null;
    }
  };

  const segundos = () => {
    const abierto = inicioSeg.current != null ? Date.now() - inicioSeg.current : 0;
    return (acumuladoMs.current + abierto) / 1000;
  };

  return { marcar, segundos };
}

Object.assign(window, { useActiveClock });
