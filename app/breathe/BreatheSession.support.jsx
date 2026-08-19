/* PACE · Respiración — el RELOJ DE RETENCIÓN (s166)
   =================================================
   Nace aquí y no dentro de `BreatheSession.jsx` por la regla §1: aquel archivo
   estaba en 480 líneas de 500 y STATE.md ya dejaba dicho que «lo siguiente que
   entre ahí va a un .support». Sigue el patrón de `BreatheVisual.support.jsx`.

   CARGA ANTES QUE `BreatheSession.jsx` — el componente lo llama en su cuerpo.

   QUÉ CUENTA, y por qué no es «empezar a contar la apnea». El tiempo de
   retención YA se acreditaba: `activeMsRef` (s98) suma 'active' Y 'hold', así
   que la retención lleva desde entonces entrando en los minutos de Respira. Lo
   que faltaba era poder DECIRLO por separado. Este reloj no cambia lo que se
   acredita; saca un número que ya estaba dentro de otro.

   LAS TRES CONDICIONES de la decisión (aprobada en s165) viven fuera de aquí,
   pero conviene saber cuáles son porque explican lo que este archivo NO hace:
     1. total ACUMULADO, nunca un máximo — B1/s89 no retiró la cifra de la
        retención por ser un dato, la retiró por ser un RÉCORD. Aquí no se
        guarda ni se compara ninguna sesión contra otra.
     2. invisible durante la práctica — este reloj no publica nada al DOM y
        `BreatheSession` no lo pinta ni en 'hold' ni en 'done'.
     3. sin logro asociado — ningún detector lo consume.

   MISMA DISCIPLINA QUE EL RELOJ DE s98: timestamp-based (decisión s96), no un
   contador de ticks. Excluye las pausas manuales; el tiempo con la pestaña
   oculta cuenta, igual que en Foco.
*/

/**
 * Reloj de tiempo en retención. Se le dice en cada render si la sesión está
 * reteniendo AHORA (stage === 'hold' y sin pausar) y él segmenta.
 *
 * Devuelve { marcar, segundos }:
 *   · marcar(activo) — abre o cierra el segmento. Idempotente: llamarlo dos
 *     veces con el mismo valor no acumula de más, que es lo que permite
 *     llamarlo desde un efecto sin dependencias finas.
 *   · segundos() — total acumulado, incluyendo el segmento abierto.
 *
 * EL MECANISMO SE MUDÓ A `app/ui/SessionClock.jsx` EN s170, sin cambiarlo: al
 * darle contabilidad de pausa a Mueve/Estira iban a ser tres copias del mismo
 * bucle, que es el defecto que s147 pagó con el render de glifo. Lo que queda
 * aquí es la POLÍTICA —qué cuenta como retención en Respira— y el nombre con
 * el que la llama `BreatheSession.jsx`.
 *
 * Que `segundos()` incluya el segmento ABIERTO es la línea que carga con el
 * dato, y por eso `finish()` ya no cierra el reloj a mano (lo hacía, y las dos
 * cosas se tapaban entre sí). En la última ronda `releaseHold()` llama a
 * `finish()` sin pasar por 'active', así que al leer el total el segmento de
 * la retención más larga sigue ABIERTO: si no se sumara, esa retención —la que
 * más cuesta— se perdería entera. Medido con el banco de mutaciones de s166.
 */
function useHoldClock() {
  return useActiveClock();
}

Object.assign(window, { useHoldClock });
