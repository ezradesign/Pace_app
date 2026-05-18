# Sesion 80 - Auditoria estructural de PathRunner.jsx (Tarea 1)

**Fecha:** 2026-05-18
**Archivo auditado:** `app/paths/PathRunner.jsx` (v0.32.1, 835 lineas)
**Objetivo:** preparar el split tecnico de s80 sin alterar comportamiento.
**Estado:** Tarea 1 cerrada. Pendiente OK del usuario antes de Tarea 2.

---

## TL;DR de la auditoria

- El archivo agrupa **9 componentes** (orquestador + 4 steps + CompletionScreen + 3 piezas chrome) y **1 constante local** (`CS_ROMAN`).
- Hay **4 step kinds** reales en el catalogo (`breathe`, `focus`, `body`, `hydrate`), no 5. El prompt menciona "Move" y "Stretch" como componentes separados, pero el codigo actual usa **un solo `PathBodyStep`** que dispatcha a `MoveSession` con `kind='move'|'extra'` via `resolveBodyRoutine`. Esto se discute mas abajo (apartado "Discrepancia prompt vs codigo").
- El contrato actual de los Steps es **inconsistente**: 3 steps usan `(step, onExit(reason))`, `PathHydrateStep` usa `(onDone, onSkip)`. Aprovechar el split para uniformar.
- Para cumplir la metrica de PathRunner.jsx <=280 lineas hay que extraer **mas** que solo `steps/` y `CompletionScreen.jsx`: tambien `PathTopBar` + `ExitConfirmModal` + `StepError` (ya previsto en el diario s79 como `PathRunner.parts.jsx`). Propuesta concreta en la Tarea 2.
- No se detectan acoplamientos problematicos. Ningun Step muta estado del runner directamente; todo viaja via `onExit(reason)` -> `handleStepExit`.

---

## Mapa de secciones de PathRunner.jsx

| # | Rango | Bloque | Lineas | Responsabilidad | Externos consumidos | Props / contexto |
|---|---|---|---:|---|---|---|
| 1 | 1-10 | Header + hooks alias | 10 | Comentario de cabecera + `useStatePR/useEffectPR/useRefPR` desde `React` global | `React` | -- |
| 2 | 11-36 | `PathTopBar` | 26 | Barra superior fija del overlay: nombre del Camino + boton cerrar (X) | `useT` | `pathName`, `onRequestExit` |
| 3 | 39-102 | `ExitConfirmModal` | 64 | Modal in-app de confirmacion de abandono. Foco al boton "Seguir", Escape cierra | `useT`, `useRefPR`, `useEffectPR` | `open`, `onCancel`, `onConfirm` |
| 4 | 104-107 | `CS_ROMAN` const | 4 (con comentario) | Numerales romanos I-VII para lista del recorrido en CompletionScreen | -- | -- |
| 5 | 109-309 | `CompletionScreen` | 201 | Pantalla de Camino completado: SenderoBar 100% done, lista recorrido, logros desbloqueados, botones back/repeat. Soporta fade-in 400ms | `usePace`, `useT`, `useStatePR`, `useEffectPR`, `getPath`, `SenderoBar`, `window.ACHIEVEMENT_CATALOG`, `startPath` (en callback) | `snapshot`, `onBack`, `fadeIn` |
| 6 | 311-334 | `StepError` | 24 | Fallback visual cuando `routineId` no resuelve | `useT` | `routineId`, `onSkip` |
| 7 | 336-447 | `PathHydrateStep` | 112 | Step de Hidratacion: contador Garamond + grid vasos + 2 botones (Skip/Beber). Rediseñado en s78 | `usePace`, `useT`, `addWaterGlass` | `onDone`, `onSkip` **(contrato disidente)** |
| 8 | 449-572 | `PathFocusStep` | 124 | Step de Foco: TimerDial + subtitle "Concentracion profunda" + 3 botones (Pausar/Reset/Saltar) + bloque done. Acredita foco al llegar a 0 estando running, no en skip/reset. Rediseñado en s79 | `useT`, `useStatePR/useEffectPR/useRefPR`, `TimerDial`, `addFocusMinutes` | `step`, `onExit` |
| 9 | 574-583 | `PathBreatheStep` | 10 | Envoltura sobre `BreatheSession` con resolucion de rutina + gate de seguridad si `routine.safety` | `getBreatheRoutine`, `BreatheSession`, `PathBreatheSafetyGate` (local) | `step`, `onExit` |
| 10 | 585-597 | `PathBreatheSafetyGate` | 13 | Pantalla `BreatheSafety` previa a BreatheSession para rutinas con `safety: true` (e.g. wim-hof, kapalabhati) | `useStatePR`, `BreatheSafety`, `BreatheSession` | `routine`, `onExit` |
| 11 | 599-605 | `PathBodyStep` | 7 | Dispatcher: resuelve `routineId` via `resolveBodyRoutine` -> renderiza `MoveSession` con `kind='move'` o `kind='extra'` | `resolveBodyRoutine`, `MoveSession`, `StepError` | `step`, `onExit` |
| 12 | 607-833 | `PathRunner` | 227 | Orquestador: maquina de fases (intro/step/transition/outro), dispatcher por `step.kind`, handlers de exit + escape, integracion con IntroCard/StepIntro/OutroCard + CompletionScreen | `usePace`, `useT`, `getPath`, `advancePathStep`, `abandonPath`, `setJustCompleted` local, IntroCard/StepIntro/OutroCard (de PathTransitions.jsx) | -- (raiz) |
| 13 | 835 | `Object.assign(window, {...})` | 1 | Export a `window.PathRunner` | -- | -- |

**Total: 835 lineas** (matcheado con `wc -l`).

---

## Componentes internos detectados

Coincide con la lista del prompt + matices:

- `PathTopBar` (chrome)
- `ExitConfirmModal` (chrome / modal)
- `CompletionScreen` (pantalla terminal)
- `StepError` (fallback de Steps)
- `PathHydrateStep` (kind: hydrate)
- `PathFocusStep` (kind: focus)
- `PathBreatheStep` + `PathBreatheSafetyGate` (kind: breathe)
- `PathBodyStep` (kind: body -> dispatcher a MoveSession)
- `PathRunner` (orquestador)

**No existen** en este archivo `IntroCard`/`StepIntro`/`OutroCard`: viven en `app/paths/PathTransitions.jsx` desde s77 (251 ln).
**No existen** `PathMoveStep` ni `PathStretchStep`: la unica forma de movimiento/estiramiento se da via `PathBodyStep` (ver discrepancia mas abajo).

---

## Estado compartido entre componentes

| Pieza | Como viaja |
|---|---|
| `state` (`usePace`) | Hook de contexto consumido directamente por `CompletionScreen` y `PathHydrateStep`. `PathRunner` lo usa para `state.paths.current`. **Ningun otro Step lee `state`.** |
| `cur` (paths.current) | Local a `PathRunner`. Los Steps NO lo reciben; solo reciben `step` (el bloque del catalogo en `cur.stepIndex`). |
| `step` (bloque del catalogo) | Prop por valor a cada Step. Contiene `{ kind, routineId?, min?, optional? }`. |
| `onExit(reason)` / `onDone` / `onSkip` | Callbacks pasados por `PathRunner` a cada Step. Aqui esta la inconsistencia: 3 steps usan `onExit(reason)`, `PathHydrateStep` usa `onDone`/`onSkip` separados. |
| `phase` | Estado local de `PathRunner` (intro/step/transition/outro). Volatil, NO persistido. Los Steps no lo conocen. |
| `pendingComplete` | Estado local de `PathRunner`. Captura snapshot + reason al iniciar OutroCard del ultimo step. Se aplica en `handleOutroDone`. |
| `justCompleted` | Estado local de `PathRunner`. Cuando se rellena, renderiza `CompletionScreen` en vez del overlay normal. |
| `confirmExit` | Estado local de `PathRunner`. Controla `ExitConfirmModal`. |
| `snapshot.startedAt` / `pathId` / `skippedSteps` | Snapshot inmutable que viaja a `CompletionScreen` para listar el recorrido y filtrar logros. |
| `ACHIEVEMENT_CATALOG` (window) | Solo `CompletionScreen` lo lee para resolver glifo + titulo de logros desbloqueados durante el Camino. |

**Conclusion:** todo el estado relevante pasa por props desde `PathRunner` a las hojas, salvo `state` que dos hojas leen via `usePace`. No hay efectos sorpresa: ningun Step muta `cur` directamente.

---

## Side effects identificados

| Componente | Efecto | Dispara | Condicion de limpieza |
|---|---|---|---|
| `PathFocusStep` | `setInterval(1000)` tick + `setRemaining` | useEffect cuando `running` se vuelve true | `clearInterval` en cleanup del effect y al llegar a r<=1 |
| `PathFocusStep` | `addFocusMinutes(step.min)` | Cuando `remaining` llega a 0 estando running, una sola vez via `creditedRef` | -- |
| `PathHydrateStep` | `addWaterGlass(1)` | Solo en `handleDrink` (no en skip) | -- |
| `PathBreatheStep` | Delegado a `BreatheSession` (sonidos, fases, timers internos) | -- | -- |
| `PathBodyStep` | Delegado a `MoveSession` (timers, transiciones) | -- | -- |
| `CompletionScreen` | `requestAnimationFrame` doble para forzar pintado con opacity:0 antes del transition a 1 | useEffect cuando `fadeIn=true` | `cancelAnimationFrame` en cleanup |
| `PathRunner` | Keydown listener (Escape) | useEffect mientras hay `cur` activo | `removeEventListener` en cleanup |
| `PathRunner` | `setJustCompleted(null)` al cambiar `cur.id` | useEffect | -- |
| `PathRunner` | Set phase=intro si recien iniciado (Date.now() - startedAt < 1500ms) | useEffect al cambiar `cur.id` | -- |
| `PathRunner` | `advancePathStep(reason)` en `handleStepExit` (intermedio) o en `handleOutroDone` (ultimo) | Callback | -- |
| `PathRunner` | `abandonPath()` en `handleRequestExit` (si step.optional) o `ExitConfirmModal.onConfirm` | Callback | -- |
| `ExitConfirmModal` | Keydown listener (Escape) + focus al boton cancelar | useEffect cuando `open=true` | `removeEventListener` en cleanup |

**Nota sobre `state-paths.jsx` (no esta en este archivo pero es relevante):** `advancePathStep` internamente persiste `paths.current` en localStorage, llama a `checkAllPathsCompleted` (s78) tras avanzar, etc. Esos efectos quedan **fuera del scope** del split — son propiedad del state layer y deben seguir funcionando identicos.

---

## Invariantes a preservar (lista numerada)

Estas son las propiedades del flujo que **deben seguir siendo verdaderas** tras el refactor. Cada item es verificable durante la fase 4 (no-regresion).

### Foco (PathFocusStep)

1. `addFocusMinutes(step.min)` se llama **una y solo una vez**, cuando `remaining` llega a 0 con `running=true`. Garantizado por `creditedRef`.
2. `handleReset()` restaura `remaining=totalSec` + pausa, **sin** acreditar foco (`creditedRef` intacto) y **sin** avanzar el Camino.
3. Skip (`onExit('skip')`) **no** acredita foco aunque el bloque tenga `remaining < totalSec`.
4. Bloque `done` muestra **solo** "Hecho" como CTA (sin Pausar/Reset/Saltar).
5. `TimerDial` recibe `subtitle={t('focus.subtitle.focus')}` y `mode="foco"`.

### Hidratacion (PathHydrateStep)

6. `addWaterGlass(1)` se llama **solo** en `handleDrink`, no en skip.
7. Vasos renderizados son **no interactivos** (es step de Camino, no tracker).
8. UI espejo de `HydrateModule` home: contador Garamond + grid `goal` vasos + 2 botones (Skip outline / Beber relleno) del mismo peso visual.

### Respira (PathBreatheStep + Safety)

9. Rutina con `routine.safety === true` **siempre** muestra `BreatheSafety` antes de `BreatheSession` (no se puede saltar el gate).
10. `accepted=true` solo via boton del gate; cancelar emite `onExit('skip')`.
11. `routineId` inexistente -> `StepError` (no crashea ni avanza solo).

### Cuerpo (PathBodyStep)

12. `resolveBodyRoutine(routineId)` resuelve primero en MoveModule, luego en ExtraModule. `kind='move'` o `kind='extra'` se pasa a `MoveSession`.
13. `routineId` inexistente -> `StepError`.

### PathRunner (orquestador)

14. **Maquina de fases** (volatil, no persistida):
    - `intro` solo si `cur.stepIndex === 0 && (Date.now() - cur.startedAt) < 1500ms`.
    - `step` por defecto al hidratar / recargar.
    - `transition` tras `handleStepExit` intermedio (advance YA aplicado).
    - `outro` tras `handleStepExit` del ultimo step (advance DIFERIDO).
15. **Step intermedio**: `advancePathStep(reason)` se llama INMEDIATAMENTE en `handleStepExit`, antes de la TransitionCard. Asi, recargar durante la transicion aterriza en el step destino.
16. **Step ultimo**: `advancePathStep(reason)` se DIFIERE hasta `handleOutroDone`. `pendingComplete` captura `{ reason, snapshot }`; al cerrar OutroCard se aplica el avance + se rellena `justCompleted`.
17. **Recarga durante intro/transition/outro** -> phase='step' al rehidratar (el primer useEffect lo fuerza segun la regla de los 1500ms).
18. **SenderoBar superpuesta retirada** (decision s77b): solo aparece dentro de TransitionCards (Intro/Step/Outro) y en CompletionScreen. NUNCA encima del Step activo.
19. **CompletionScreen** con `fadeIn=true` **solo** cuando viene desde OutroCard (no en cualquier otra via).
20. **`justCompleted`** se limpia al arrancar un nuevo Camino (effect que depende de `cur.id`).
21. **CompletionScreen.recorrido**: aplica `skippedSet` para marcar steps saltados con `opacity:0.45` + `text-decoration:line-through`.
22. **CompletionScreen.achievementsDuring**: filtra `state.achievements` por `unlockedAt >= snapshot.startedAt`. Logros previos no aparecen.

### Modales y escape

23. Boton "X" o tecla Escape:
    - Si `ExitConfirmModal` abierto -> cierra modal (no abandona).
    - Si `phase !== 'step'` -> ignora (TransitionCards son tappables).
    - Si `step.optional === true` -> `abandonPath()` directo.
    - Si no -> abre `ExitConfirmModal`.
24. Escape dentro de `<input>` o `<textarea>` se ignora (no interferir con el typeo del usuario).
25. `ExitConfirmModal` enfoca el boton "Seguir" al abrir.

### Persistencia (fuera de este archivo, pero PathRunner es consumidor)

26. `lastViewed` se persiste al iniciar Camino (`setLastViewedPath` se llama desde `startPath`, no desde PathRunner).
27. `paths.current` se persiste en `localStorage` bajo `pace.state.v2` via `state-paths.jsx`. Recargar a mitad de un step rehidrata `cur.stepIndex` correctamente.
28. Logro `master.path.all7` se dispara desde `advancePathStep` (hook s78 en `state-paths.jsx`) cuando todos los Caminos estan completados al menos una vez. PathRunner no lo invoca explicitamente.

---

## Acoplamientos / observaciones

**Sin acoplamientos problematicos.** Todo el flujo respeta la regla "Steps no mutan estado del runner". Las observaciones que siguen son **menores** y se pueden abordar o no en s80; ninguna bloquea el split.

| ID | Observacion | Severidad | Accion sugerida |
|---|---|---|---|
| O1 | Contrato inconsistente: `PathHydrateStep` usa `onDone/onSkip` (separados), los demas Steps usan `onExit(reason)` | Baja | Uniformar a `onExit(reason)` durante el split. Cero cambio de comportamiento, solo de firma |
| O2 | `btnBase` (objeto de estilo de boton outline) duplicado palabra por palabra en `PathFocusStep` (linea 503) y `PathHydrateStep` (linea 356) | Baja | Extraer a `app/paths/steps/_shared.js` durante el split. Es lo unico duplicado entre Steps |
| O3 | `CS_ROMAN` en PathRunner duplica `SB_ROMAN` en SenderoBar | Trivial | Mantener duplicado por ahora (s79 decision: extraer solo si aparece un 3er consumidor). El split no introduce nuevos consumidores |
| O4 | `step.kind` dispatcher en `PathRunner` (lineas 781-795) es un encadenado de 4 `{ ... && ... }`. Funciona pero podria ser una tabla `{ [kind]: Component }` | Trivial | No tocar en s80. Cambio cosmetico, no aporta claridad real con 4 entradas |
| O5 | Para meter PathRunner.jsx en <=280 ln no basta con extraer steps + CompletionScreen. Hay que extraer tambien PathTopBar + ExitConfirmModal + StepError | **MEDIA** | Crear `app/paths/PathRunner.parts.jsx` para esos 3 (plan ya esbozado en el diario s79). Sin esto la metrica del prompt no se cumple |
| O6 | El prompt menciona "PathMoveStep" y "PathStretchStep" como archivos separados, pero el codigo tiene un unico `PathBodyStep` que dispatcha por `resolveBodyRoutine.source` | **MEDIA** | Mantener `PathBodyStep.jsx` como dispatcher. Split a Move/Stretch requeriria cambiar el catalogo (kind='move'/'stretch' en vez de 'body') = cambio de comportamiento, fuera de scope de un refactor puro |

---

## Discrepancia prompt vs codigo (importante)

El prompt define el objetivo asi:

```
steps/
├── PathBreatheStep.jsx
├── PathFocusStep.jsx
├── PathHydrateStep.jsx
├── PathMoveStep.jsx
└── PathStretchStep.jsx
```

El codigo actual tiene **4 step kinds** en el catalogo (`breathe`, `focus`, `body`, `hydrate`). No hay `kind: 'move'` ni `kind: 'stretch'`. El componente `PathBodyStep` (7 ln) es un **dispatcher**: llama a `resolveBodyRoutine(routineId)` y, segun si la rutina vive en MoveModule (move) o ExtraModule (extra/stretch), renderiza `<MoveSession kind="move">` o `<MoveSession kind="extra">`.

### Opciones

**A. Mantener `PathBodyStep.jsx` (recomendado)**
- Crea `app/paths/steps/PathBodyStep.jsx` (~7 ln).
- Cero cambio de comportamiento. Estricto refactor puro.
- El nombre "Body" refleja la realidad del catalogo.
- Contras: no matchea literal lo que pide el prompt.

**B. Dividir a `PathMoveStep.jsx` + `PathStretchStep.jsx`**
- Requiere cambiar el catalogo: `kind: 'body'` -> `kind: 'move' | 'stretch'`.
- Requiere migracion de localStorage (`paths.current.id` no cambia, pero el catalogo si).
- Es **cambio de comportamiento** disfrazado de refactor.
- Estaria fuera del scope de "refactor puro, sin cambios funcionales".

**C. Mantener `PathBodyStep.jsx` como dispatcher + ALIASAR a `PathMoveStep` / `PathStretchStep`**
- Crea 3 archivos para algo que es uno. Sin valor real.
- Descartado.

**Recomendacion:** opcion A. Reportar como discrepancia clara en el prompt y proceder con `PathBodyStep.jsx`. Si el usuario quiere ir a fondo y separar move/stretch a nivel catalogo, eso es una sesion separada (cambio de modelo de datos).

---

## Discrepancia metrica (importante)

El prompt exige PathRunner.jsx final **entre 150 y 280 lineas**.

Si solo extraemos `steps/` y `CompletionScreen.jsx`, las lineas que quedan en PathRunner.jsx son:

| Bloque | Lineas |
|---|---:|
| Header + hooks | 10 |
| `PathTopBar` | 26 |
| `ExitConfirmModal` | 64 |
| `StepError` | 24 |
| `PathRunner` (orquestador) | 227 |
| Object.assign | 1 |
| **Total estimado** | **~352** |

352 > 280 -> **incumple la metrica.**

Para cumplir hay que extraer **tambien** `PathTopBar` + `ExitConfirmModal` + `StepError`. Propuesta concreta en la Tarea 2.

---

## Conclusion de la auditoria

El split es **viable y de bajo riesgo**:

- 0 acoplamientos problematicos detectados.
- Los Steps son hojas puras que reciben props y emiten via callback.
- Las 28 invariantes listadas son verificables y no se ven amenazadas por la separacion fisica.
- El contrato actual de Steps es casi uniforme; solo `PathHydrateStep` rompe (oportunidad de uniformar).
- Para cumplir la metrica del prompt hay que extender el split a `PathRunner.parts.jsx` (`PathTopBar` + `ExitConfirmModal` + `StepError`).
- Discrepancia del prompt sobre Move/Stretch resuelta manteniendo `PathBodyStep` como dispatcher (cualquier otra cosa es cambio de comportamiento).

**Riesgos residuales (bajos):**

- Orden de carga de `<script>` en `PACE.html`: hay que asegurar que cada Step se carga antes que `PathRunner.jsx`. Si se carga `_shared.js` (Tarea 3), debe ir antes de los Steps que lo consumen.
- Posibles dependencias circulares si `_shared.js` exporta a window con un nombre colisionante.
- `CompletionScreen` consume `SenderoBar` y `window.ACHIEVEMENT_CATALOG` -> SenderoBar debe seguir cargando antes que CompletionScreen.jsx, igual que hoy.

Ninguno de estos riesgos requiere rediseño del contrato. Se mitigan con orden cuidadoso de `<script>` tags en `PACE.html` + comprobacion en consola tras la primera carga.

---

## Pausa para revision

Tarea 1 cerrada. Si la auditoria es aceptable, **proceder a Tarea 2** (propuesta de estructura + contrato de Step). Si hay objeciones sobre las opciones A/B/C de Move/Stretch o sobre extender el split a `PathRunner.parts.jsx`, decidir antes de continuar.
