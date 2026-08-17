/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   state-core.support.jsx — detección de entorno, MIGRACIONES y ROLLOVER.
   Extraído de `state-core.jsx` en s148, que llegó a 510 líneas (el límite de
   CLAUDE.md es 500). Mismo patrón `*.support` que `state-achievements.support`
   (s146), `MoveSessionV1.support` y `FocusTimer.support`.

   Qué vive aquí: todo lo que convierte un estado GUARDADO (posiblemente de una
   versión vieja) en un estado de HOY. `state-core.jsx` se queda con el store,
   `loadState`, el tema y los toasts.

   ============================================================
   ESTE ARCHIVO CARGA **ANTES** QUE state-core.jsx. NO ES OPCIONAL.
   ============================================================
   `state-core.jsx` hace `let _state = loadState();` en el cuerpo del archivo,
   o sea que `loadState` corre AL EVALUARSE, no al montar. Y `loadState` llama
   a `rolloverIfNeeded`, `detectInitialPalette`, `isMobileViewport` y
   `reindexWeeklyStatsMondayFirst`, que están aquí. Si este archivo cargara
   después, `loadState` reventaría en el primer arranque de cada pestaña.

   Es la misma razón por la que `state-history.jsx` y `flags.js` van antes que
   `state-core.jsx`: `rolloverIfNeeded` resuelve `archiveDayToHistory` y
   `getMondayOf` por window, y `loadState` lee las banderas de superficie.
   El orden completo en PACE.html es:
     i18n → state-history → flags → state-core.support → state-core → …

   `unlockAchievement` es la excepción y ya lo era: se llama DIFERIDO con
   `setTimeout` porque `state-achievements.jsx` carga después. Ver el comentario
   en `rolloverIfNeeded`.
*/

/* ============================
   UTILS
   ============================ */

function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia &&
         window.matchMedia('(max-width: 768px)').matches;
}

/* Paleta inicial (s89 · P0 auditoria): respeta prefers-color-scheme del
   sistema SOLO en el primer arranque (sin estado guardado). La eleccion
   manual de Tweaks persiste en localStorage y siempre gana en cargas
   posteriores.

   s161 — LA FRASE QUE HABIA AQUI («esto no re-sigue cambios del SO en
   caliente») YA NO ES CIERTA SIEMPRE, y se corrige en vez de borrarse.
   Sigue siendo exacta para quien ELIGE A MANO, que es lo que s89 protegia.
   Lo que se anadio es poder elegir «que mande el sistema»: con
   `state.paletteAuto === true`, `loadState` vuelve a llamar aqui en CADA
   arranque y ademas `state-settings.jsx` sigue al SO mientras la app esta
   abierta —salvo con un bloque de Foco vivo, donde el cambio se aparca—.
   Esta funcion no cambia: sigue respondiendo solo «que quiere el sistema
   ahora», y es la UNICA que lo responde. Ver la fila de s161 en
   DECISIONES_TECNICAS_VIGENTES.md. */
function detectInitialPalette() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'oscuro' : 'crema';
  } catch (e) { return 'crema'; }
}

/* Migration guard (sesion 43): copia weeklyStats → history.days en el primer
   rollover post-upgrade. Solo se ejecuta una vez (_historyMigrated === false). */
function migrateWeeklyStatsToHistory(state) {
  if (state._historyMigrated) return state;
  if (!state.lastActiveDay) return { ...state, _historyMigrated: true };
  let h = state.history || { days: {}, months: {}, years: {} };
  const lastDate = new Date(state.lastActiveDay);
  for (let offset = 0; offset < 7; offset++) {
    const d = new Date(lastDate.getTime() - offset * 86400000);
    h = archiveDayToHistory(h, d.toDateString(), state.weeklyStats);
  }
  return { ...state, history: h, _historyMigrated: true };
}

/* Sesion 69 / v0.28.8: re-indexa weeklyStats de la convencion vieja
   (0=domingo, 1=lunes ... 6=sabado, indexado por getDay()) a la nueva
   (0=lunes, 1=martes ... 6=domingo). Mapping: nuevo[i] = viejo[(i+1)%7]. */
function reindexWeeklyStatsMondayFirst(ws) {
  const rot = (arr) => Array.isArray(arr) && arr.length === 7
    ? [arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[0]]
    : [0,0,0,0,0,0,0];
  return {
    focusMinutes:  rot(ws && ws.focusMinutes),
    breathMinutes: rot(ws && ws.breathMinutes),
    moveMinutes:   rot(ws && ws.moveMinutes),
    waterGlasses:  rot(ws && ws.waterGlasses),
  };
}

/* ============================
   ROLLOVER
   ============================ */

function rolloverIfNeeded(state) {
  const today = new Date();
  const todayStr = today.toDateString();
  if (state.lastActiveDay === todayStr) return state;

  /* Detectar si la migracion s43 esta por ejecutarse en esta llamada.
     Si _historyMigrated era false al entrar, migrateWeeklyStatsToHistory
     ya archivara lastActiveDay y NO debemos volver a archivarlo aqui (C2). */
  const wasAlreadyMigrated = !!state._historyMigrated;
  let migratedState = migrateWeeklyStatsToHistory(state);
  let nextHistory = migratedState.history || { days: {}, months: {}, years: {} };

  /* Archivar el dia previo solo si NO acaba de migrar (la migracion ya lo cubrio). */
  if (migratedState.lastActiveDay && wasAlreadyMigrated) {
    nextHistory = archiveDayToHistory(
      nextHistory, migratedState.lastActiveDay, migratedState.weeklyStats
    );
  }

  /* FIX C1 (sesion 69): si entramos en una nueva semana lunes-domingo,
     resetear weeklyStats por completo. */
  let nextWeekly = migratedState.weeklyStats;
  if (migratedState.lastActiveDay) {
    const prevMonday  = getMondayOf(new Date(migratedState.lastActiveDay)).getTime();
    const todayMonday = getMondayOf(today).getTime();
    if (todayMonday !== prevMonday) {
      nextWeekly = {
        focusMinutes:  [0,0,0,0,0,0,0],
        breathMinutes: [0,0,0,0,0,0,0],
        moveMinutes:   [0,0,0,0,0,0,0],
        waterGlasses:  [0,0,0,0,0,0,0],
      };
    }
  }

  /* FIX A2 (sesion 69): rotura proactiva del streak. Si la ultima sesion
     fue antes de ayer, current=0 inmediatamente (sin esperar a la siguiente). */
  let nextStreak = migratedState.streak;
  if (nextStreak && nextStreak.lastActiveDate) {
    const lastActive = new Date(nextStreak.lastActiveDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);
    if (lastActive.getTime() < yesterday.getTime()) {
      nextStreak = { ...nextStreak, current: 0 };
    }
  }

  /* first.return («Regresas») — abrir la app un dia distinto al ultimo.
     ------------------------------------------------------------------
     SE CONCEDE AQUI, DENTRO DEL ESTADO QUE ESTE ROLLOVER DEVUELVE (s162).

     Hasta v0.92.0 esto era `setTimeout(() => unlockAchievement('first.return'), 0)`
     con un `try/catch` vacio, y el logro **se perdia de forma INTERMITENTE**:
     hallazgo de s148, que lo dio por «no se desbloquea NUNCA» y estuvo 14
     sesiones en el backlog. Ni una cosa ni la otra — es una CARRERA, y por eso
     costo tanto fijarla:

       · `unlockAchievement` vive en `state-achievements.jsx`, que se evalua
         DESPUES que este archivo, y aqui se referencia PELADA: en el artefacto
         cada modulo viaja en su IIFE, asi que el nombre se resuelve contra
         `window` **en el momento de la llamada**.
       · el artefacto tiene **109 etiquetas `<script>`**, una por modulo, o sea
         que los modulos corren en TAREAS SEPARADAS. Un `setTimeout(0)` armado
         mientras corre este script puede dispararse **antes** de que el navegador
         evalue el de logros: ahi el nombre no existe, salta un ReferenceError y
         el `catch` vacio lo entierra sin dejar rastro.
       · quien gana la carrera depende de la carga. En una pagina quieta el parser
         llega a los 109 scripts antes que el timer y el logro SI se concede
         (medido en `index.html` y en `PACE.html`); con la maquina ocupada —la
         suite entera con ocho workers— el timer gana y el sello no aparece.
         Dos sondas tranquilas dijeron «funciona» y la suite completa dijo lo
         contrario **dos veces**: la suite tenia razon.

     Concederlo en el objeto de vuelta quita la carrera de raiz: el rollover es el
     UNICO sitio donde se sabe que el dia ha cambiado, y aqui ese hecho ya esta en
     la mano. Sin timer, sin orden de carga, sin `try/catch` que trague la prueba.

     Es RETROACTIVO por construccion: cualquiera que vuelva tras un dia de uso lo
     gana en ese mismo regreso. Y es IDEMPOTENTE — si ya esta desbloqueado no se
     toca, o la cola de avisos acumularia un duplicado por cada dia.

     Se replica a mano lo que hace `unlockAchievement` (sello + cola) porque esa
     funcion no es alcanzable desde aqui sin volver a la carrera. Lo unico que no
     corre es `checkCollectorAchievements()`: si este fuera el logro nº 50 o nº
     100, el hito de coleccion entraria con el desbloqueo siguiente, que lo
     recalcula igual. Se acepta a proposito. */
  const yaTiene = !!(migratedState.achievements || {})['first.return'];
  const ganaRegreso = !!migratedState.lastActiveDay && !yaTiene;

  return {
    ...migratedState,
    history: nextHistory,
    weeklyStats: nextWeekly,
    streak: nextStreak,
    cycle: 0,
    plan: { muevete: false, respira: false, extra: false, hidratate: false },
    water: { ...migratedState.water, today: 0, lastReset: todayStr },
    lastActiveDay: todayStr,
    achievements: ganaRegreso
      ? { ...(migratedState.achievements || {}), 'first.return': { unlockedAt: Date.now() } }
      : migratedState.achievements,
    achievementQueue: ganaRegreso
      ? [...(migratedState.achievementQueue || []), 'first.return']
      : migratedState.achievementQueue,
  };
}

Object.assign(window, {
  isMobileViewport, detectInitialPalette,
  migrateWeeklyStatsToHistory, reindexWeeklyStatsMondayFirst,
  rolloverIfNeeded,
});
