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
function useHoldClock(semillaSec) {
  return useActiveClock(Number.isFinite(semillaSec) ? semillaSec * 1000 : 0);
}

/* EL MAPA DE FASES -> CLAVE i18n. Es DATO, no logica, y vive aqui desde s186
   por la regla §1: `BreatheSession.jsx` llego a 500 lineas exactas al entrar la
   reanudacion, y este archivo nacio justo para eso («lo siguiente que entre ahi
   va a un .support»). Se lee por `window` y no pelado porque un `const` no
   cruza de archivo en el compilado (trampa de s148). */
const PHASE_KEYS = {
  'Inhala':           'breathe.phase.inhala',
  'Exhala':           'breathe.phase.exhala',
  'Sostén':           'breathe.phase.sosten',
  'Inhala más':       'breathe.phase.inhala.mas',
  'Inhala oceánica':  'breathe.phase.inhala.oceanica',
  'Exhala oceánica':  'breathe.phase.exhala.oceanica',
  'Inhala izq.':      'breathe.phase.inhala.izq',
  'Inhala dcha.':     'breathe.phase.inhala.dcha',
  'Exhala dcha.':     'breathe.phase.exhala.dcha',
  'Exhala izq.':      'breathe.phase.exhala.izq',
  'Respira':          'breathe.phase.respira',
  'Inhala al vientre': 'breathe.phase.inhala.vientre',
  'Exhala zumbando':  'breathe.phase.exhala.zumbando',
  'Sostén en vacío':  'breathe.phase.sosten.vacio',
};

window.PHASE_KEYS = PHASE_KEYS;

/* ============================================================
   s186 · REANUDAR UNA SESIÓN DE RESPIRA INTERRUMPIDA
   ============================================================
   Clave `pace.breathe.v1`, FUERA de `pace.state.v2`, exactamente por lo mismo
   que el Pomodoro con `pace.timer.v1` (s102): la sesión sigue siendo LOCAL, y
   esta clave solo hace que sobreviva a irse.

   LO QUE SE GUARDA Y LO QUE NO, que es la decisión de producto:

   NO se guarda la fase ni el segundo dentro del ciclo, y no es una simplifica-
   ción: **no puedes reengancharte a mitad de una inhalación que no estabas
   haciendo**. Devolver a alguien al segundo 3 de una exhalación sería fingir
   una continuidad que su cuerpo no tuvo. La unidad que sí significa algo es la
   RONDA en las rutinas de rondas, y el TIEMPO PRACTICADO en las demás. Eso es
   lo que se guarda, y por eso al volver se entra otra vez por la cuenta atrás
   de preparación: hay que re-entrar en la respiración, no reanudar un vídeo.

   NO SE ACREDITA NADA QUE NO SE HAYA PRESENCIADO — la línea de s101/s102. El
   reloj de tiempo activo solo corre en 'active'/'hold' sin pausar, así que el
   rato fuera no suma; al volver, el contador CONTINÚA donde estaba en vez de
   reiniciarse, que es lo que evita el error contrario (regalar los minutos ya
   practicados dos veces, o perderlos).

   CADUCA, y el número es un juicio declarado: mismo DÍA LOCAL y como mucho
   VENTANA_MS. Una sesión de respiración es un estado en el que estabas, no una
   tarea pendiente: ofrecer «continúa» sobre la de anoche es ofrecer algo que ya
   no existe. Un registro caducado se DESCARTA en silencio -- no se ofrece y no
   se avisa de nada; no hace falta borrarlo, porque la siguiente sesion
   escribe encima de la misma clave.

   SE CONSERVA AL SALIR, y ahí está la diferencia con el Pomodoro. Salir de una
   sesión de Respira ES la interrupción que queremos recuperar (te llaman,
   cierras la pestaña, cambias de app). Solo se borra al TERMINAR. */
const RESPIRA_KEY = 'pace.breathe.v1';
const RESPIRA_VENTANA_MS = 2 * 60 * 60 * 1000;   // 2 h · juicio, no medida

function respiraDiaLocal(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
         '-' + String(d.getDate()).padStart(2, '0');
}

/* leerRespiraGuardada() -> el registro si sigue siendo ofrecible, o null.
   Total y silenciosa (patrón `playSound`): cualquier cosa rara -> null. La
   COHERENCIA con el catálogo se comprueba aquí y no en el consumidor, porque
   una rutina puede haber dejado de existir entre versiones. */
function leerRespiraGuardada(ahora) {
  try {
    const crudo = localStorage.getItem(RESPIRA_KEY);
    if (!crudo) return null;
    const g = JSON.parse(crudo);
    const t = Number.isFinite(ahora) ? ahora : Date.now();
    if (!g || g.v !== 1 || typeof g.routineId !== 'string') return null;
    if (!Number.isFinite(g.savedAt) || t - g.savedAt > RESPIRA_VENTANA_MS || t < g.savedAt) return null;
    if (respiraDiaLocal(g.savedAt) !== respiraDiaLocal(t)) return null;
    const rutina = window.getBreatheRoutine && window.getBreatheRoutine(g.routineId);
    if (!rutina) return null;
    /* Blindaje, como el `endsAt-now <= duracion` de s102: un activo mayor que
       tres veces el plan de la rutina es un registro corrupto, no una sesión. */
    const techoMs = Math.max(1, (rutina.min || 1)) * 60 * 1000 * 3;
    if (!Number.isFinite(g.activeMs) || g.activeMs < 0 || g.activeMs > techoMs) return null;
    const rondas = rutina.pattern === 'rounds' ? (rutina.rounds || 1) : 0;
    if (rondas && (!Number.isFinite(g.round) || g.round < 1 || g.round > rondas)) return null;
    return {
      routineId: g.routineId, round: rondas ? g.round : 1,
      breaths: Number.isFinite(g.breaths) && g.breaths > 0 ? g.breaths : 1,
      activeMs: g.activeMs, holdSec: Number.isFinite(g.holdSec) && g.holdSec > 0 ? g.holdSec : 0,
      startedAt: Number.isFinite(g.startedAt) ? g.startedAt : g.savedAt,
      savedAt: g.savedAt, rondas: rondas,
    };
  } catch (e) { return null; }
}

function olvidarRespiraGuardada() {
  try { localStorage.removeItem(RESPIRA_KEY); } catch (e) {}
}

/* respiraReanudacion(routine, guardado) -> los valores de arranque de la
   sesión. PURA. Sin registro utilizable devuelve el comienzo de siempre, así
   que `BreatheSession` no necesita ninguna rama: siempre arranca de aquí. */
function respiraReanudacion(routine, guardado) {
  const ahora = Date.now();
  const cero = { round: 1, breaths: 1, activeMs: 0, holdSec: 0, startedAt: ahora, reanudada: false };
  if (!routine || !guardado || guardado.routineId !== routine.id) return cero;
  /* El arranque es el ORIGINAL y no el del regreso: el evento de sesion lleva
     un `startedAt` de reloj de pared, y decir que empezo al volver borraria de
     la historia el rato que la sesion estuvo abierta. Lo practicado sigue
     siendo `activeMs`, que es lo que se acredita. */
  return {
    round: guardado.round || 1, breaths: guardado.breaths || 1,
    activeMs: guardado.activeMs || 0, holdSec: guardado.holdSec || 0,
    startedAt: Number.isFinite(guardado.startedAt) ? guardado.startedAt : ahora,
    reanudada: true,
  };
}

/* useRespiraPersistencia(datos) — escribe el registro mientras la sesión está
   viva y lo borra cuando termina.

   NO ESCRIBE UNA VEZ POR SEGUNDO: escribe en los CAMBIOS que importan (ronda,
   respiración, stage, pausa) y además cuando la página se esconde o se
   descarga, que es el caso que de verdad hay que cubrir —cerrar la pestaña— y
   el único en el que el tiempo activo tiene que quedar al día.

   `pagehide` y no `beforeunload`: en móvil una pestaña puede irse a la nevera
   sin disparar nunca `beforeunload`, y ese es justo el escenario de esta
   función. `visibilitychange` cubre el cambio de app. */
/* Alias propios, igual que `useEffectM` mas abajo: este archivo no
   desestructura React arriba del todo. */
const { useRef: useRefBS, useEffect: useEffectBS } = React;

function useRespiraPersistencia(datos) {
  const d = datos || {};
  const vivo = d.stage === 'active' || d.stage === 'hold';
  const ref = useRefBS(d);
  ref.current = d;

  const escribir = () => {
    const c = ref.current;
    if (!c || !c.routine) return;
    if (c.stage !== 'active' && c.stage !== 'hold') return;
    try {
      localStorage.setItem(RESPIRA_KEY, JSON.stringify({
        v: 1, routineId: c.routine.id, round: c.round, breaths: c.breathCount,
        activeMs: Math.round(c.getActiveSec() * 1000),
        holdSec: Math.round(c.holdSec()), startedAt: c.startedAt, savedAt: Date.now(),
      }));
    } catch (e) {}
  };

  /* EL REGISTRO TIENE UNA SOLA DUENA, y es este efecto: escribe mientras la
     sesion vive y BORRA en cuanto llega a 'done'. Ponerlo tambien en `finish()`
     serian dos sitios haciendo lo mismo, que es exactamente lo que el banco de
     mutaciones de s166 destapo con el reloj de retencion: con las dos puestas,
     romper cualquiera de ellas deja los asertos en verde. */
  useEffectBS(() => {
    if (d.stage === 'done') { olvidarRespiraGuardada(); return; }
    if (!vivo) return;
    escribir();
  }, [vivo, d.stage, d.round, d.breathCount, d.paused]);

  useEffectBS(() => {
    const alEsconder = () => { if (document.visibilityState === 'hidden') escribir(); };
    window.addEventListener('pagehide', escribir);
    document.addEventListener('visibilitychange', alEsconder);
    return () => {
      window.removeEventListener('pagehide', escribir);
      document.removeEventListener('visibilitychange', alEsconder);
      /* Al desmontar se escribe también: salir de la sesión ES la interrupción
         que se quiere recuperar. `finish()` ya ha borrado antes de llegar aquí
         y ha dejado el stage en 'done', así que una sesión terminada no se
         re-guarda -- lo garantiza el guard de `escribir()`, no el orden. */
      escribir();
    };
  }, []);
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


/* s177 · MUSICA DE FONDO — la tercera capa de «que suena detras».
   Vive AQUI y no en BreatheSession.jsx por la regla de las 500 lineas: aquel
   archivo se quedaba en 505 al meterlo. Tiene la misma forma que el efecto del
   drone -- no arranca en preparacion, sigue durante la retencion, se pausa con
   la sesion y se apaga al terminar-- y por eso se lee al lado.

   `routine.drone` viaja hasta `paceMusica.start` para que `Coherente 432`, que
   FUERZA su drone pase lo que pase, no acabe con las dos capas encima. El resto
   del porque -- que pieza, a que ganancia y que le falta todavia-- vive en
   `Sound.musica.jsx`, que es quien la toca. */
function useMusicaFondo(stage, paused, routine) {
  const { useEffect: useEffectM } = React;
  useEffectM(() => {
    if (!window.paceMusica) return;
    const m = window.paceMusica;
    if (stage === 'done') { m.stop(800); return; }
    if (stage === 'prep' || stage === 'hold') return;
    if (paused) m.pause();
    else if (m.isActive()) m.resume();
    else m.start(routine.tag, routine.drone === true);
  }, [stage, paused]);
}


Object.assign(window, {
  useMusicaFondo, useHoldClock, respiraPlanSec, respiraEventoSesion, playPhaseSound,
  leerRespiraGuardada, olvidarRespiraGuardada, respiraReanudacion, useRespiraPersistencia,
});
