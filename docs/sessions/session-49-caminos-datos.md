# Sesión 49 · v0.25.4 → v0.26.0-alpha · Caminos parte 1 — capa de datos

**Fecha:** 2026-05-08  
**Duración:** sesión única  
**Contexto:** Primera de tres sesiones del sistema de Caminos. Solo capa de datos — sin UI visible todavía. Las sesiones 50 (PathRunner) y 51 (SuggestedPathCard) añadirán la interfaz sobre esta base.

---

## Decisiones aplicadas

- **5 caminos canónicos:** `path.dawn` · `path.midday` · `path.afternoon` · `path.dusk` · `path.weekend`
- **4 kinds:** `breathe` · `focus` · `body` · `hydrate`. Kind `body` cubre cualquier rutina de Move o Extra.
- **Paso `hydrate` siempre `optional: true`**
- **Skip del último paso completa el camino igualmente** (via `advancePathStep('skip')`)
- **Persistencia bajo `pace.state.v2`** — sin clave nueva
- **Migración defensiva:** si `state.paths` no existe al cargar, se inicializa con `defaultState.paths` sin tocar otros campos

---

## Archivos creados

| Archivo | Descripción |
|---|---|
| `app/paths/registry.js` | `PATH_CATALOG` (5 caminos), `getPath()`, `resolveBodyRoutine()` |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/state.jsx` | `paths` en `defaultState`; migración defensiva en `loadState`; `todayISO()` + 5 funciones de Caminos; bump a v0.26.0-alpha |
| `app/breathe/BreatheLibrary.jsx` | `getBreatheRoutine(id)` + `window.getBreatheRoutine` |
| `app/move/MoveModule.jsx` | `getMoveRoutine(id)` + `window.getMoveRoutine` |
| `app/extra/ExtraModule.jsx` | `getExtraRoutine(id)` + `window.getExtraRoutine` |
| `PACE.html` | Añadido `<script src="app/paths/registry.js">` + bump título |

---

## Tabla de resolución de caminos

| Camino | Step | kind | routineId | Módulo |
|---|---|---|---|---|
| path.dawn | 1 | breathe | `breathe.coherent.55` | BreatheLibrary |
| path.dawn | 2 | focus | — (min: 25) | — |
| path.dawn | 3 | body | `move.neck.3` | ExtraModule |
| path.midday | 1 | hydrate | — (optional) | — |
| path.midday | 2 | body | `move.hips.5` | ExtraModule |
| path.midday | 3 | focus | — (min: 25) | — |
| path.afternoon | 1 | breathe | `breathe.478` | BreatheLibrary |
| path.afternoon | 2 | focus | — (min: 15) | — |
| path.afternoon | 3 | body | `extra.desk.pushups` | MoveModule |
| path.dusk | 1 | breathe | `breathe.coherent.55` | BreatheLibrary |
| path.dusk | 2 | focus | — (min: 25) | — |
| path.dusk | 3 | body | `move.chair.antidote` | ExtraModule |
| path.weekend | 1 | breathe | `breathe.nadi.shodhana` | BreatheLibrary |
| path.weekend | 2 | body | `move.atg.knees` | ExtraModule |
| path.weekend | 3 | hydrate | — (optional) | — |

Todos los routineIds verificados contra los catálogos reales: **9/9 OK**.

---

## Resultado de validación

```
Validacion 5/5 OK
1. Catalogo coherente: OK (9/9)
2. Migracion defensiva: OK
3. Funciones en window: OK (5/5) — startPath, advancePathStep, completePath, abandonPath, getSuggestedPath
4. Helpers lookup: getBreathe=OK getMove=OK getExtra=OK
5. No regresion FocusTimer: OK
```

Build: 488 KB · 0 errores · 2 WARN conocidos (falsos positivos de template literals).

---

## Snippet para validación manual desde consola del navegador

```js
// 1. Iniciar un camino
startPath('path.dawn');
console.log(getState().paths.current);
// Esperado: { id: 'path.dawn', stepIndex: 0, startedAt: ..., skippedSteps: [] }

// 2. Avanzar pasos
advancePathStep('done');   // step 0 -> 1
advancePathStep('done');   // step 1 -> 2
advancePathStep('done');   // step 2 -> completa

// 3. Verificar completado
console.log(getState().paths.completed);
// Esperado: { 'path.dawn': { count: 1, lastDoneAt: 'YYYY-MM-DD' } }
console.log(getState().paths.current);
// Esperado: null

// 4. Skip del último paso también completa
startPath('path.weekend');
advancePathStep('done');
advancePathStep('done');
advancePathStep('skip');   // skip del último => completa igualmente
console.log(getState().paths.completed['path.weekend']);
// Esperado: { count: 1, lastDoneAt: '...' }

// 5. Camino sugerido por hora
console.log(getSuggestedPath());   // depende de hora local

// 6. Resolver una rutina body
console.log(resolveBodyRoutine('move.neck.3'));
// Esperado: { routine: { id: 'move.neck.3', ... }, source: 'extra' }
```

---

## Pendientes

- **Sesión 50:** `PathRunner.jsx` — UI de ejecución paso a paso de un camino
- **Sesión 51:** `SuggestedPathCard.jsx` — tarjeta en home que sugiere el camino del momento
- Claves i18n para los 5 caminos (`paths.path.*.name` / `paths.path.*.tagline`) van en sesión 50
