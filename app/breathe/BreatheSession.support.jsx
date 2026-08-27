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

/* s172 · EL PLAN DE UNA SESION DE RESPIRA (§6.4), y las dos familias no se
   planifican igual:
     · no-rondas → `routine.min × 60`, `declared`. El motor termina cuando el
       TIEMPO ACTIVO alcanza ese numero (BreatheSession, fin no-rounds), asi que
       es un plan conocido antes de empezar y no una estimacion.
     · rondas    → rondas × respiraciones × ciclo, `derived`. Es lo que §6.4
       nombra, y hay que leerlo con su limite: la RETENCION la suelta el
       usuario, no el reloj, asi que este plan cubre solo la parte respirada y
       siempre va a quedar POR DEBAJO del activo real. Se emite igualmente
       porque el consumidor lo compara con `plannedSecondsSource`, que dice de
       donde sale; lo que no se puede es fingir que planifica la retencion.
   La fila de §6.4 para Respira solo contempla la segunda; la primera se trata
   como el legacy de cuerpo, que es el precedente mas cercano del documento. */
function respiraPlanSec(routine) {
  if (!routine) return null;
  if (routine.pattern === 'rounds') {
    const secs = (routine.rounds || 0) * (routine.breaths || 0) * 4;   // 2 s inhala + 2 s exhala
    return secs > 0 ? secs : null;
  }
  return (typeof routine.min === 'number' && routine.min > 0) ? routine.min * 60 : null;
}

function respiraEventoSesion(routine, inicioMs, activoSec, early, inPath) {
  const plan = respiraPlanSec(routine);
  return {
    inPath: !!inPath,
    elapsedSeconds: Math.max(0, Math.round((Date.now() - inicioMs) / 1000)),
    activeSeconds: Math.max(0, Math.round(activoSec || 0)),
    plannedSeconds: plan,
    plannedSecondsSource: plan === null ? null : (routine.pattern === 'rounds' ? 'derived' : 'declared'),
    variant: null,
    completionReason: early ? 'early' : 'natural',
  };
}

/* s175 · EL MAPEO DE ETIQUETA A SONIDO SALE AQUI. `BreatheSession.jsx` llego
   a 509 lineas al anadir la senal del sosten, y STATE ya dejaba dicho desde
   s166 que «lo siguiente que entre ahi va a su .support». Es ademas lo que
   mejor se va: no toca estado ni React, solo traduce la etiqueta de la fase
   —que viene del catalogo, en espanol— al nombre de la senal.
   `playSound` se lee del global en la llamada, como en todo el repo. */
// Helper: reproduce el sonido de una fase por su label.
// (Decía «Sostén → silencio intencional» hasta s175; ver la rama del sostén.)
function playPhaseSound(phaseLabel, phaseDur) {
  if (phaseLabel === 'Inhala' || phaseLabel === 'Inhala más' ||
      phaseLabel === 'Inhala oceánica' || phaseLabel === 'Inhala izq.' ||
      phaseLabel === 'Inhala dcha.' || phaseLabel === 'Respira' ||
      phaseLabel === 'Inhala al vientre') {
    try { playSound('breathe.inhale', phaseDur); } catch (e) {}
  } else if (phaseLabel === 'Exhala' || phaseLabel === 'Exhala oceánica' ||
             phaseLabel === 'Exhala dcha.' || phaseLabel === 'Exhala izq.' ||
             phaseLabel === 'Exhala zumbando') {
    try { playSound('breathe.exhale', phaseDur); } catch (e) {}
  } else if (phaseLabel === 'Sostén' || phaseLabel === 'Sostén en vacío') {
    /* s175 · EL SOSTÉN DEJA DE SER SILENCIO, y esto cambia una decisión
       anterior a propósito. El silencio era lo correcto mientras el sonido
       era SINTETIZADO: un tono sostenido durante una retención invita a
       escucharlo, no a retener. Una palabra dicha una vez al entrar en la
       fase es otra cosa, y es lo que hace cualquier guía hablada.
       `breathe.hold` NO tiene receta en `SOUND_RECIPES`: si la voz no cabe
       —o no está— `playSound` no encuentra recipe y **vuelve el silencio de
       siempre**, sin ruido nuevo. Quitar esta rama son cuatro líneas. */
    try { playSound('breathe.hold', phaseDur); } catch (e) {}
  }
}


Object.assign(window, { useHoldClock, respiraPlanSec, respiraEventoSesion, playPhaseSound });
