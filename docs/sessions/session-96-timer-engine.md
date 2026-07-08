# Sesión 96 — Cirugía 2: timer engine timestamp-based

**Fecha:** 2026-07-08 · **Versión:** v0.40.0 → **v0.41.0**
**Plan maestro:** segunda cirugía post-bloque (ROADMAP "Camino a v1.0").
Siguiente: s97 breathe activeTime.

---

## Objetivo

Sustituir los **dos** temporizadores con `setInterval(1000)` + contador
`remaining` en estado de React (derivan en background: la pestaña oculta
throttlea el interval a ~1/min → un pomodoro backgroundeado **subcuenta y
termina tarde**) por un **motor basado en timestamps**: la verdad del
tiempo vive en `endsAt`; un tick de 1 s solo refresca la UI y
`remaining = ceil((endsAt − Date.now())/1000)` → **cero deriva**.

**Restricción dura:** comportamiento observable IDÉNTICO en primer plano —
mismos créditos (minutos, cycle), sonidos (`pomodoro.start`/`end`), logros,
drone, single-shot. Camino sigue SIN cycle++ ni logros de pomodoro.

## Tarea 0 — Auditoría

- Commit s95 (`6622de8`, v0.40.0) en git ✓. Working tree limpio.
  `PACE_VERSION` v0.40.0 ✓ · `CACHE_NAME` pace-v0.40.0 ✓ · standalone
  presente ✓.
- **Mapa de lo acoplado a `remaining`/`running`:**

| Acoplamiento | FocusTimer.jsx (home, 493 ln) | PathFocusStep.jsx (127 ln) |
|---|---|---|
| Ticker | `setInterval(1000)` decrementa `remainingSec` | `setInterval(1000)` decrementa `remaining` |
| Reset por cambio | efecto en `[focusMode, focusMinutes]` → base+stop | n/a (monta fresco por step) |
| Finalización | efecto en `[remainingSec, running, focusMode]`: `pomodoro.end` **siempre** + si `foco` → `completePomodoro()`+`onFinish()` | dentro del ticker a r≤1: `addFocusMinutes(step.min)`+`updateStreak()` |
| Single-shot | guard `if(!running)return` tras `setRunning(false)` | `creditedRef` |
| Drone | efecto en `[running, focusMode, remainingSec]`: stop(800) si no-foco/remaining0; resume/start/pause | **sin drone** |
| Reset/skip | `reset()` no acredita | `handleReset` no acredita; skip→`onExit('skip')` |
| Modos sin crédito | pausa(5)/larga(15) tickan+suenan, NO `completePomodoro` | n/a |

- **Distinción a preservar** (state-timer.jsx): `completePomodoro()` =
  cycle++ + `addFocusMinutes(focusMinutes)` + `first.step`/
  `master.pomodoro.8`(cycle≥8)/`master.long.focus`(min≥45) +
  checkTimeOfDay/checkSilentDay/updateStreak. `addFocusMinutes()` =
  totalFocusMin + weeklyStats + `focus.hours.10/50/100` +
  `master.focus.day`(240/día).
- `TimerDial.jsx`: puramente presentacional (recibe mins/secs/progress) —
  no cambia. Orden de carga: state-timer → TimerDial → FocusTimer → …
  PathFocusStep. Un hook tras TimerDial cubre a ambos.

## Decisiones aprobadas (Tarea 1)

| Decisión | Elección |
|---|---|
| Ubicación/shape del motor | **Hook nuevo `app/focus/useCountdown.jsx`** (`window.useCountdown`), compartido; FocusTimer a 493 ln forzaba extracción |
| **FORK persistencia** | **Local + corrección de deriva** (no persiste en pace.state). Es el objetivo exacto de s96 (no-deriva); persistir en recarga es decisión UX aparte, diferida. Coste ~0, cero migración |
| Semántica de pausa | **Guardar `remaining` al pausar**; reanudar `endsAt = now + remaining` (calca el comportamiento actual, sin acumular `pausedMs`) |
| Estado `completed` | **Terminal** (start/toggle no-op hasta reset o cambio de duración) → cierra un doble-crédito latente. Invisible en flujo normal (BreakMenu tapa el timer al completar) |
| Firma unificada | `completeFocusSession(context, opts)` en state-timer.jsx: `'home'`→`completePomodoro()`; `'path'`→`addFocusMinutes(opts.minutes)+updateStreak()` |

## Implementación (Tarea 2)

| Archivo | Cambio |
|---|---|
| `app/focus/useCountdown.jsx` | **Nuevo (~135 ln).** Motor timestamp-based: `endsAt` como verdad; tick 1 s solo re-renderiza; `visibilitychange` corrige al volver la pestaña; estados idle/running/paused/completed; `onComplete` en ref (single-shot); `completed` terminal. Expone a window |
| `app/state-timer.jsx` | **`completeFocusSession(context, opts)`** (dispatcher que preserva la distinción home/path) + export a window |
| `app/state.jsx` | Re-export de `completeFocusSession` |
| `app/focus/FocusTimer.jsx` | Migrado al hook (**493 → 429 ln**): fuera los 3 useEffect de tiempo y `running`/`remainingSec`; `onComplete` toca `pomodoro.end` (3 modos) + `completeFocusSession('home')` (solo foco). Drone intacto (`remainingSec`→`remaining`). `pomodoro.start` solo en arranque/reanudación real |
| `app/paths/steps/PathFocusStep.jsx` | Migrado al hook; `onComplete`→`completeFocusSession('path', {minutes: step.min\|\|25})`; contrato `(step, onExit)` intacto; reset/skip sin crédito |
| `PACE.html` | Script tag `useCountdown.jsx` tras TimerDial + bump título + comentario orden de carga |
| `app/state-core.jsx` / `sw.js` | Bump `PACE_VERSION` / `CACHE_NAME` a v0.41.0 |

## Verificación (Tarea 3)

Preview :50333, protocolo s93 (purga SW+caches tras cada tanda, no-store
activo).

- **No-deriva:** simulado salto de reloj (mock `Date.now`, `endsAt`
  rebasado) + pestaña oculta → `remaining` se recalcula sin subcontar y
  completa con crédito exacto. (Nota: el preview reporta
  `visibilityState:'hidden'`, así que la finalización llega por el tick del
  interval; con la pestaña visible el `visibilitychange` completa al
  instante — verificado en los tests home cortos.)
- **Home/foco:** cycle 0→1, +25 min (total + `weeklyStats[hoy]`),
  `first.step`; `master.long.focus`(≥45) y `master.pomodoro.8`(cycle≥8);
  **single-shot** (2 disparos → 1 crédito).
- **Camino** (PathFocusStep montado aislado, mismo store): +25 min +
  `streak` **sin cycle ni first.step**; CTA "Hecho" → `onExit('done')`.
  `completeFocusSession('path')` directo confirma la distinción (cycle
  intacto).
- **Pausa/reanuda:** congela `remaining` (24:57→24:57) y continúa (24:56).
- **Reset/Skip:** sin crédito (home y Camino).
- **Pausa(5)/larga(15):** tickan y suenan (`pomodoro.start`+`end`) pero NO
  acreditan (cycle/min intactos) — spy sobre `playSound`.
- **Drone:** start→pause→resume→stop; **muere al completar**
  (`isActive()=false`) — spy sobre `ambientDrone`.
- **`completed` terminal:** pulsar Comenzar en 0:00 no re-acredita ni suena.
- **EN:** Focus/Pause/Long. Estado restaurado. **Consola sin errores** en
  dev y en el standalone.

## Cierre

- Bump **v0.41.0** (título PACE.html + `PACE_VERSION` + `CACHE_NAME
  pace-v0.41.0`).
- Backup `PACE_standalone_v0.40.0_20260708.html`; cap 20 (rotado el más
  antiguo, `v0.29.0_20260516.html`).
- `node build-standalone.js`: **725 KB**, **71 archivos** validados (+1 =
  useCountdown.jsx). `index.html` copia exacta (SHA256 idéntico).
  Standalone verificado en preview (v0.41.0, completa con crédito, consola
  limpia).
- El motor es **local** (no toca pace.state): persistir el Pomodoro home en
  recarga queda como decisión UX aparte (encaja con s99 PWA/notificaciones).
  Próxima sesión: **s97 — BreatheSession tiempo activo** (activeTime vs
  totalTime; stats y logros acreditan activeTime).
