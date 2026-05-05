# Sesión 34 · v0.15.0 → v0.16.0 · Split BreatheModule + logros aplazados

**Fecha:** 2026-05-05  
**Versión resultante:** v0.16.0 (minor · refactor + features)  
**Duración estimada:** 1 sesión  

---

## Qué se hizo

### 1. Troceo de BreatheModule.jsx (565 líneas → 3 archivos)

`BreatheModule.jsx` superaba el techo de 500 líneas de CLAUDE.md. La extracción ya estaba en el backlog desde sesión 26 (refactor Fase 2 había bajado de ~740 a ~565 líneas al extraer SessionShell, pero no llegó a trocearlo).

**Nuevos archivos:**

- **`app/breathe/BreatheVisual.jsx`** (~155 líneas)  
  Contiene `getSequence()` (función pura que devuelve la secuencia de fases según el patrón de la rutina) + `breathVisualStyles` + `BreathVisual` (5 variantes: `pulso` default, `ondas`, `petalo`, `organico`, `flor`). Sin hooks de React. Exports: `{ BreathVisual, getSequence }`.  
  Nota: `visualStyles` renombrado a `breathVisualStyles` para evitar colisión con otros objetos de estilos en el namespace global (regla §3 de CLAUDE.md: nombres únicos por componente).

- **`app/breathe/BreatheLibrary.jsx`** (~130 líneas)  
  Contiene `BREATHE_ROUTINES` (catálogo) + `BreatheLibrary` (modal de biblioteca) + `RoutineCard` + `BreatheSafety` (modal de seguridad con checkbox obligatorio). Necesita solo `useStateBR` de React (para BreatheSafety). Exports: `{ BreatheLibrary, BreatheSafety }`.

- **`app/breathe/BreatheSession.jsx`** (~210 líneas)  
  Contiene `BreatheSession` completo: ticker de preparación (3s), ticker principal de fases, ticker de retención en rondas Wim Hof, atajos de teclado (espacio pausar, Esc salir, Enter releaseHold/done), lógica de `handleCycleComplete` / `releaseHold` / `finish`. Aliases renombrados a `useStateBRSess / useEffectBRSess / useRefBRSess` para no colisionar con los de BreatheLibrary (que usa `useStateBR`). Exports: `{ BreatheSession }`.

**`app/breathe/BreatheModule.jsx` eliminado.**

**`PACE.html` actualizado:** la línea de BreatheModule sustituida por 3 líneas en orden de dependencia:
```html
<script type="text/babel" src="app/breathe/BreatheVisual.jsx"></script>
<script type="text/babel" src="app/breathe/BreatheLibrary.jsx"></script>
<script type="text/babel" src="app/breathe/BreatheSession.jsx"></script>
```

El orden importa: BreatheSession depende de `BreathVisual` y `getSequence` expuestos a `window` por BreatheVisual.jsx. Como el lookup de globales en estas funciones Babel se resuelve en *call time* (no en definition time), basta con que BreatheVisual.jsx cargue antes de que BreatheSession se renderice por primera vez.

**`build-standalone.js`** no necesita cambios: lee los `<script src>` directamente de PACE.html, así que ya inlinea los 3 archivos nuevos automáticamente.

---

### 2. Detectores de logros aplazados

4 nuevos triggers en `app/state.jsx`. Maestría pasa de 5/25 a 9/25 cazables.

#### `master.collector.half` y `master.collector.full`

- Función `checkCollectorAchievements()` añadida justo antes de `unlockAchievement`.
- Se llama **al final de cada `unlockAchievement` exitoso** (cuando se añade realmente un logro nuevo).
- Lee `Object.keys(_state.achievements).length` sobre el state ya actualizado.
- Si `>= 50`: desbloquea `master.collector.half`. Si `>= 100`: desbloquea `master.collector.full`.
- **Recursión terminante garantizada:** `unlockAchievement` es idempotente (bail temprano si el logro ya existe), así que la cadena X → checkCollector → collector.half → checkCollector → (collector.half ya existe, bail) no produce bucle infinito. Profundidad máxima: 4 niveles (X → half → full → nada nuevo). Aceptable.

#### `master.silent.day`

- Nuevo campo `silentDates: []` en `defaultState` (array de `toDateString()`, cap 30). Mismo patrón que `morningDates`.
- Función `checkSilentDayAchievement()`: si `_state.soundOn` es falsy, registra hoy en `silentDates` y llama `unlockAchievement('master.silent.day')`.
- Llamada desde: `completeBreathSession`, `completeMoveSession`, `completePomodoro`, `completeExtraSession`, `addWaterGlass` (delta>0).
- El logro se desbloquea la primera vez que el usuario realiza CUALQUIER acción productiva con el sonido apagado.

#### `master.retreat`

- Función `checkRetreatAchievement()`: lee `weeklyStats.breathMinutes[day] + weeklyStats.moveMinutes[day]` del `_state` ya actualizado y compara con `>= 120`.
- **No necesita nuevos campos en state**: los buckets semanales ya existían. Extra suma al bucket `moveMinutes` (decisión activa vigente), así que también cuenta para este logro.
- Llamada desde: `completeBreathSession`, `completeMoveSession`, `completeExtraSession`.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/breathe/BreatheVisual.jsx` | **Nuevo** — getSequence + BreathVisual |
| `app/breathe/BreatheLibrary.jsx` | **Nuevo** — BREATHE_ROUTINES + BreatheLibrary + BreatheSafety |
| `app/breathe/BreatheSession.jsx` | **Nuevo** — BreatheSession |
| `app/breathe/BreatheModule.jsx` | **Eliminado** |
| `PACE.html` | 1 `<script>` → 3 `<script>` + título v0.16.0 |
| `app/state.jsx` | `PACE_VERSION` bump, `silentDates: []`, 3 funciones checker, 6 call-sites |
| `app/achievements/Achievements.jsx` | `IMPLEMENTED_ACHIEVEMENTS` +4 ids (45 → 49) |
| `PACE_standalone.html` | Regenerado (~365 KB) |
| `backups/PACE_standalone_v0.15.0_20260505.html` | Nuevo (rotación, recuperado de git) |
| `backups/PACE_standalone_v0.12.8_20260423_1700.html` | Eliminado (el más antiguo) |
| `CHANGELOG.md` | Entrada v0.16.0 + compresión v0.14.3 |
| `STATE.md` | Actualizado |

---

## Decisiones de implementación

- **Nombre de estilos locales renombrado.** El objeto `visualStyles` en BreatheModule original era un nombre genérico que podía colisionar con otros módulos al vivir en el namespace global de Babel. Al separarlo en su propio archivo se renombra a `breathVisualStyles` siguiendo la regla §3 de CLAUDE.md.
- **Aliases de hooks por archivo, no compartidos.** Cada archivo usa su propio alias (`useStateBR` en Library, `useStateBRSess` en Session) para dejar claro en cada render cuál es el módulo de origen y evitar dudas cuando se lean los archivos por separado.
- **checkCollectorAchievements dentro de unlockAchievement** (no fuera). Así cualquier futuro trigger de logro (incluyendo los de sesiones futuras) automáticamente comprueba los umbrales collector sin que el desarrollador tenga que recordarlo.
- **master.retreat usa buckets existentes.** No se añade un campo de historial diario dedicado porque `weeklyStats.breathMinutes/moveMinutes` ya persiste exactamente lo que se necesita. El rollover los resetea a cero cada día, lo que es correcto (el logro es "2h en un día", no acumulado).

---

## Estado de logros tras esta sesión

| Categoría | Implementados | Total | Porcentaje |
|---|---|---|---|
| Primeros pasos | 10 | 10 | 100% |
| Constancia | 14 | 15 | 93% |
| Exploración | 16 | 20 | 80% |
| Maestría | **9** | 25 | **36%** |
| Secretos | 10 | 21 | 48% |
| Estacionales | 0 | 10 | 0% |
| **Total** | **59** | **101** | **58%** |

(Los 4 nuevos ids de esta sesión son: master.collector.half, master.collector.full, master.silent.day, master.retreat.)

---

## Verificación

- `node build-standalone.js` genera 365 KB sin errores.
- Los 3 nuevos archivos de breathe están en `app/breathe/` y BreatheModule.jsx eliminado.
- `IMPLEMENTED_ACHIEVEMENTS` tiene 49 ids tras la sesión.
- `state.jsx` tiene `silentDates: []` en defaultState y los 3 checkers + 6 call-sites.
- 5 backups en rotación (v0.12.9 → v0.15.0); el v0.12.8 fue eliminado.

---

## Backlog actualizado tras sesión

Deuda pendiente en Maestría (~16/25 por implementar):
- `hydrate.week.perfect` — necesita histórico semanal de días con meta completa.
- `master.midnight.never` — 30 días sin uso tras 23h (requiere evento de unload o rollover con timestamp).
- `master.box.10 / coherent.10 / rounds.10 / atg.20 / hips.20 / shoulders.20 / ancestral.10` — contadores por tipo de rutina (actualmente no se persisten).
- `master.hydrate.30 / hydrate.90` — histórico de días con meta de agua cubierta.
- `master.antidote` — 50 sesiones SIT (subset de moveSessionsTotal, distinguir tipo de rutina).
- `master.marathon` — 2000 min totales (simple: `totalFocusMin + breathMinutes_total + moveMinutes_total`, pero requiere sumar los totales acumulados de breathe y move, no solo focus).
- `master.gardener` — 200 vasos acumulados (necesita campo `waterTotal: 0` en state).
- `master.extra.all.week` — todos los Extra en 1 semana.
- `master.centurion` — 100 sesiones respiración (actualmente `breatheSessionsTotal >= 50` es el máximo, fácil extensión).
