# Auditoría de Caminos · Sprint 75
## Cambio de filosofía: de hora del día a mood/sensación corporal

> **Contexto de versión:** Auditoría solicitada en el sprint de v0.28.10.
> El código auditado es v0.28.12 (últimas dos sesiones solo tocaron el modo oscuro
> en `tokens.css`; el sistema de Caminos no ha cambiado desde **v0.27.5**, sesión 57).
> Fecha: 2026-05-15 · Git status: limpio.

---

## 1. Resumen ejecutivo

El sistema de Caminos está funcionalmente completo y sin regresiones: los 5 caminos
se ejecutan, la persistencia es correcta, la accesibilidad es adecuada. Hay **dos
bugs visuales graves** que afectan la percepción de calidad (el nombre del camino
se muestra como ID crudo en topbar y pantalla de completado). La arquitectura del
runner es limpia y extensible. El mayor problema no es técnico sino conceptual: los
Caminos están nombrados y organizados por franja horaria, lo que los convierte en
un calendario automatizado en vez de una herramienta de escucha interna.

**Fortalezas a conservar:** la estructura de pasos modulares (breathe → focus → body
→ hydrate), el overlay full-screen que aisla al usuario, los dots de progreso en
topbar, la lógica de favorito, y `MoveSession` reutilizado dentro del runner.

**Debilidades principales:** nombres horarios (descartar), ausencia de transición
entre pasos, bugs de nombre crudo, ausencia de copy poético en cierre, selector
que no comunica el contenido del camino antes de entrar.

**Viabilidad de sesiones 75-76:** alta. El rediseño de nombres/copy (s75) no
requiere cambios en la capa de estado salvo la migración de IDs. El sendero visual
de progreso (s76) se añade sobre la estructura existente del runner.

---

## 2. Cambio de filosofía documentado

**Decisión confirmada:** los Caminos NO se nombrarán por hora del día.
Queda descartado cualquier nombre con referencia horaria explícita:
Amanecer, Mediodía, Tarde, Atardecer, Mañana, Noche, Dawn, Dusk, etc.

**Nueva filosofía:** el usuario adulto contemplativo entra preguntando
*"¿cómo quiero sentirme ahora?"* Los Caminos son atajos a estados internos:
despertar suave, foco encendido, calma profunda, asentamiento.
Los nombres serán puramente sensoriales o poético-naturalistas.

**Principio rector (sin cambios):** recorrido predefinido que se atraviesa con calma,
inspirado en el Camino de Santiago. Tono de libro de horas medieval o cuaderno de
naturalista del s. XIX. Sin emojis. Sin gamificación.

---

## 3. Mapa de archivos del sistema de Caminos

| Archivo | Líneas | Rol |
|---|---|---|
| `app/paths/registry.js` | 88 | Catálogo `PATH_CATALOG` + helpers `getPath`, `resolveBodyRoutine` |
| `app/paths/PathRunner.jsx` | 499 | Orquestador del camino activo: overlay, pasos, completado, accesibilidad |
| `app/paths/SuggestedPathCard.jsx` | 192 | Tarjeta sugerida en dashboard + listado "Ver todos" |
| `app/paths/PathsLibrary.jsx` | 180 | Overlay "Todos los caminos" + gestión de favorito |
| `app/state-paths.jsx` | 166 | CRUD de estado: `startPath`, `advancePathStep`, `abandonPath`, `getSuggestedPath`, stats |

**Archivos relacionados (no exclusivos de Caminos):**
- `app/i18n/strings.js` — claves `paths.*` y `path.*` (todos los textos)
- `app/stats/PathStats.jsx` — sección Caminos en StatsPanel
- `app/stats/PathYearView.jsx` — heatmap anual de Caminos
- `app/state-core.jsx` — `defaultState` incluye `paths: { current, completed, history, favorite }`
- `app/main.jsx` — monta `<SuggestedPathCard>`, `<PathRunner>`, `<PathsLibrary>`

**Archivos proveeedores de bloques (cargados antes que registry.js):**
- `app/breathe/BreatheLibrary.jsx` — expone `getBreatheRoutine`
- `app/move/MoveModule.jsx` — expone `getMoveRoutine` (busca en MOVE_ROUTINES)
- `app/extra/ExtraModule.jsx` — expone `getExtraRoutine` (busca en EXTRA_ROUTINES)

---

## 4. Catálogo actual con análisis de mood

> **Nota sobre el swap de sesión 14:** Los ids `move.*` viven en EXTRA_ROUTINES
> (ExtraModule / botón "Estira"); los ids `extra.*` viven en MOVE_ROUTINES
> (MoveModule / botón "Mueve"). Los IDs se mantuvieron para conservar el localStorage.
> `resolveBodyRoutine` busca primero en `getMoveRoutine`, luego en `getExtraRoutine`.

---

### `path.dawn` — Amanecer / Dawn

| Campo | ES | EN |
|---|---|---|
| Nombre | Amanecer | Dawn |
| Tagline | "Empieza bien el dia." | "Start the day right." |

**Estructura de bloques:**

| Orden | Bloque | Referencia | Duración |
|---|---|---|---|
| 1 | Respiración | `breathe.coherent.55` — Coherente 5·5 | 5 min |
| 2 | Foco | `focus 25` | 25 min |
| 3 | Cuerpo | `move.neck.3` — Cuello 3 min | 3 min |

**Total estimado:** ~33 min · **Ventana horaria actual:** 6–11h (laborables)

**Análisis de mood:** Respiración cardiaca (coherencia HRV) que sincroniza el sistema
nervioso autónomo → bloque largo de concentración profunda → micropausa cervical
que libera tensión acumulada. La secuencia genera **calma sistémica → foco sostenido
→ liberación física puntual**. Es el camino más equilibrado: la respiración prepara
el foco, y el cuello cierra la sesión con un gesto de cuidado sin interrumpir la
concentración. El estado inducido es de presencia serena, no de energía elevada.

---

### `path.midday` — Mediodía / Midday

| Campo | ES | EN |
|---|---|---|
| Nombre | Mediodia | Midday |
| Tagline | "Recarga a mitad de jornada." | "Recharge at mid-morning." |

> **Bug copy EN:** "mid-morning" debería ser "midday" o "mid-day".

**Estructura de bloques:**

| Orden | Bloque | Referencia | Duración |
|---|---|---|---|
| 1 | Hidratación | `hydrate` (opcional) | variable |
| 2 | Cuerpo | `move.hips.5` — Caderas 5 pasos | 6 min |
| 3 | Foco | `focus 25` | 25 min |

**Total estimado:** ~31 min + hidratación · **Ventana horaria actual:** 12–14h

**Análisis de mood:** Arrancar con un vaso de agua es una señal de cuidado interno,
pero como "primer paso" resulta un poco frío. Las caderas (la articulación que más
sufre con el trabajo sedentario) se abren antes del foco → el cuerpo libre de
restricción física se concentra mejor. La secuencia genera **nutrición → desbloqueo
físico → reenganche mental**. Es el único camino con el orden cuerpo-antes-de-foco,
lo que tiene lógica fisiológica sólida.

---

### `path.afternoon` — Tarde / Afternoon

| Campo | ES | EN |
|---|---|---|
| Nombre | Tarde | Afternoon |
| Tagline | "Un segundo aire para el resto del dia." | "A second wind for the rest of the day." |

**Estructura de bloques:**

| Orden | Bloque | Referencia | Duración |
|---|---|---|---|
| 1 | Respiración | `breathe.478` — 4·7·8 | 3 min |
| 2 | Foco | `focus 15` (el más corto) | 15 min |
| 3 | Cuerpo | `extra.desk.pushups` — Flexiones escritorio | 2 min |

**Total estimado:** ~20 min · **Ventana horaria actual:** 15–17h

**Análisis de mood:** La exhalación larga del 4·7·8 (8s exhalación) reduce el cortisol
de media tarde y activa el parasimpático → un bloque de foco breve e intenso (15 min,
no 25) que aprovecha la bajada fisiológica → activación muscular con flexiones que
sube el pulso y cierra con energía. La secuencia genera **desfogue nervioso → tarea
concreta → reactivación física**. Es el camino más corto y el único que termina con
activación en vez de relajación, lo que lo hace extrañamente revitalizante.

---

### `path.dusk` — Atardecer / Dusk

| Campo | ES | EN |
|---|---|---|
| Nombre | Atardecer | Dusk |
| Tagline | "Cierra el dia con calma." | "Close the day with calm." |

**Estructura de bloques:**

| Orden | Bloque | Referencia | Duración |
|---|---|---|---|
| 1 | Respiración | `breathe.coherent.55` — Coherente 5·5 | 5 min |
| 2 | Foco | `focus 25` | 25 min |
| 3 | Cuerpo | `move.chair.antidote` — Antídoto silla | 5 min |

**Total estimado:** ~35 min · **Ventana horaria actual:** 18–22h (+ fallback nocturno 23–5h)

**Análisis de mood:** Los dos primeros bloques son **idénticos a `path.dawn`**
(coherente 5·5 + 25 min foco). Solo cambia el bloque final: cuello 3 min → antídoto
silla 5 min (más completo: pecho, torácica, caderas, cuello). La secuencia genera
**calma → foco → liberación corporal completa**. El concepto de "cerrar el día"
queda desdibujado: este camino pide más trabajo profundo (25 min) que relajación.
El antídoto silla tiene una secuencia que cierra con "reset respiración 30s", lo que
da un cierre más orgánico que el cuello de dawn, pero la experiencia general no
diferencia entre inicio y cierre del día.

---

### `path.weekend` — Fin de semana / Weekend

| Campo | ES | EN |
|---|---|---|
| Nombre | Fin de semana | Weekend |
| Tagline | "Ritmo suave. Sin prisas." | "Gentle rhythm. No rush." |

**Estructura de bloques:**

| Orden | Bloque | Referencia | Duración |
|---|---|---|---|
| 1 | Respiración | `breathe.nadi.shodhana` — Nadi Shodhana | 8 min |
| 2 | Cuerpo | `move.atg.knees` — ATG Rodillas | 6 min |
| 3 | Hidratación | `hydrate` (opcional) | variable |

**Total estimado:** ~14 min + hidratación · **Ventana horaria actual:** sáb/dom cualquier hora

**Análisis de mood:** Nadi Shodhana (respiración alternada que equilibra hemisferios)
→ trabajo articular profundo en rodillas y tobillos (ATG = rango de movimiento
completo, ejercicio de mantenimiento estructural) → hidratación como cierre.
Es el **único camino sin bloque de foco**. La secuencia genera **equilibrio mental
→ mantenimiento físico estructural → nutrición**. El tagline "Ritmo suave. Sin
prisas." es el mejor copy actual y anticipa bien el mood. La ausencia de foco es
la mayor fortaleza: este camino siente diferente porque su propósito es completamente
distinto.

---

## 5. Flujo de usuario actual paso a paso

### 5.1 Selección (Dashboard)

- `SuggestedPathCard` se monta en `main.jsx` línea 298, justo debajo del `FocusTimer`
- Llama `getSuggestedPath()` (de `state-paths.jsx`) que evalúa `new Date().getHours()`
- Muestra **una o dos tarjetas** según si el favorito del usuario es distinto al sugerido
  - Una tarjeta: solo el sugerido (o solo el favorito si no hay sugerido)
  - Dos tarjetas en fila: favorito izquierda + sugerido derecha
- Cada tarjeta `PathMiniCard` muestra: barra acento oliva vertical, nombre en Garamond italic,
  tagline en Garamond italic, iconos de pasos (SVG 14px), botón "Comenzar"
- Si el camino ya se completó hoy: botón oculto, badge "Hecho hoy", cursor no-pointer
- Enlace "Ver todos" (11px italic subrayado, muy discreto) en esquina inferior derecha
  → dispara `CustomEvent('pace:open-paths-library')`

**Lógica de sugerencia (umbrales exactos en `state-paths.jsx:89–98`):**

| Condición | Camino |
|---|---|
| `day === 0 \|\| day === 6` (sáb/dom) | `path.weekend` |
| `h >= 6 && h <= 11` | `path.dawn` |
| `h >= 12 && h <= 14` | `path.midday` |
| `h >= 15 && h <= 17` | `path.afternoon` |
| `h >= 18 && h <= 22` | `path.dusk` |
| `h >= 23 \|\| h < 6` (madrugada) | `path.dusk` (fallback) |

### 5.2 Inicio

- Pulsar "Comenzar" → `startPath(pathId)` → `setState` con `paths.current = { id, stepIndex: 0, startedAt: Date.now(), skippedSteps: [] }`
- `PathRunner` detecta `state.paths.current !== null` → renderiza overlay full-screen
- **No hay preview de pasos antes de entrar**
- **No hay pantalla de transición ni "toma tierra"** — el primer paso aparece instantáneamente
- El overlay es `role="dialog" aria-modal="true"` — correcto para accesibilidad

### 5.3 En curso

- `PathTopBar` muestra:
  - Nombre del camino: **BUG** — usa `cur.id.replace('path.', '')` → muestra "dawn", "dusk", no "Amanecer", "Atardecer"
  - `path-dots`: N círculos de 8px (`.path-dot` gris, `.path-dot.active` tinta, `.path-dot.done` tinta-3)
  - Botón × para salir
- El usuario ve **solo la UI del paso actual**: `BreatheSession`, `PathFocusStep`, `MoveSession`, o `PathHydrateStep`
- No hay indicador de duración total ni tiempo restante del camino completo
- No hay contexto del siguiente paso

### 5.4 Transición entre pasos

- **100% manual**: el usuario pulsa "Hecho" / "Saltar" dentro del paso actual
- `handleStepExit(reason)` → `advancePathStep(reason)` → incrementa `stepIndex`
- **Sin transición visual** entre pasos: cambio instantáneo de UI
- **Sin sonido de transición**
- **Sin mensaje de conexión** entre actividades ("Ahora: 25 minutos de foco")
- El salto de registro entre pasos puede ser brusco (ej: de BreatheSession animada a PathFocusStep con timer desnudo)

### 5.5 Cierre

- Cuando `nextIndex >= path.steps.length` → `setJustCompleted({ pathId, startedAt, skippedSteps })` → render de `CompletionScreen`
- `CompletionScreen` muestra:
  - Círculo ✓ con fondo `var(--breathe-soft)` (genérico, no personalizado por camino)
  - "CAMINO COMPLETADO" en uppercase 11px
  - **BUG**: nombre en `{snapshot.pathId.replace('path.', '')}` → muestra "dawn" no "Amanecer"
  - Duración en minutos (calculada desde `startedAt`)
  - Botón "Volver" → `setJustCompleted(null)`
  - Botón "Repetir camino" → `onBack()` + `startPath(snapshot.pathId)`
- El botón "Repetir" funciona pero el flujo es frágil (llama `onBack()` que limpia `justCompleted`, luego `startPath` que necesita que `PathRunner` ya no tenga `justCompleted`)

### 5.6 Persistencia

- **Registro de completado**: `advancePathStep` en el último paso graba en `paths.completed[id] = { count: count+1, lastDoneAt: todayISO() }` y añade `todayISO()` a `paths.history`
- **Pasos saltados**: se registran en `skippedSteps` del snapshot de `justCompleted`, pero NO se persisten en `localStorage` — el historial no distingue "completado íntegro" de "completado con saltos"
- **Abandono**: `abandonPath()` limpia `paths.current` sin registrar nada. No hay rastro en history.
- `paths.history` es un array de fechas ISO (puede tener duplicados si se repite el camino el mismo día). `computePathStreaks` deduplica con `new Set(history)` → correcto.
- `paths.completed[id].count` se incrementa por cualquier camino completado (con o sin saltos), referenciado en PathStats y logros

---

## 6. Evaluación cualitativa por estado

### 6.1 Selector / Dashboard

| | Evaluación |
|---|---|
| ✓ Funciona bien | La tarjeta dual (favorito + sugerido) es una idea elegante. El tagline en Garamond italic da tono PACE. Los iconos de paso (SVG finos, 14px) comunican estructura sin palabras. La lógica "hecho hoy" (deshabilita y muestra badge) es correcta. |
| ⚠ Se siente estático | El sugerido cambia automáticamente sin señal visual (a las 12:00 "Amanecer" desaparece, aparece "Mediodía" — el usuario no sabe por qué). No hay ningún camino para la madrugada (fallback = Atardecer, incoherente). La barra de acento oliva es igual para todos los caminos: decorativa, no semántica. |
| ✗ Genera fricción | Sin preview del contenido antes de iniciar: el usuario no sabe qué le espera. "Ver todos" es demasiado discreto (texto 11px). No hay descripción de duración total en la card. |
| ✗ Incumple principio PACE | Los nombres ("Amanecer", "Mediodía") son referencias horarias explícitas, no sensoriales. La selección automática desvincula la elección del usuario de su estado interno real. |

### 6.2 Inicio

| | Evaluación |
|---|---|
| ✓ Funciona bien | El overlay full-screen crea aislamiento visual inmediato. La accesibilidad es correcta (role, aria-modal, Escape). |
| ⚠ Se siente estático | La transición es instantánea, sin ningún "breath-in" de llegada. El usuario no tiene un momento de preparación o intención antes del primer paso. |
| ✗ Genera fricción | No hay resumen de los pasos que vienen. El usuario entra sin saber si tiene 10 minutos o 35. |

### 6.3 En curso

| | Evaluación |
|---|---|
| ✓ Funciona bien | Cada módulo mantiene su UI completa (BreatheSession, MoveSession). Los dots de topbar dan orientación espacial mínima. El botón × siempre visible permite salir con confirmación. |
| ⚠ Se siente estático | Nombre del camino aparece como "dawn"/"dusk" (bug que hace la experiencia parecer inacabada). Los dots son 8px, muy abstractos. Sin duración global ni tiempo restante. |
| ✗ Genera fricción | Sin sentido de recorrido. El usuario no sabe cuánto queda del camino total. La barra de progreso no existe a nivel de camino, solo de paso individual. |

### 6.4 Transición entre bloques

| | Evaluación |
|---|---|
| ✓ Funciona bien | La transición manual ("Hecho" para continuar) evita avances accidentales. Que los pasos opcionales (hydrate) puedan saltarse con un botón dedicado es correcto. |
| ⚠ Se siente estático | El paso de BreatheSession a PathFocusStep es abrupto: de animación fluida y guía de voz a una pantalla con solo un timer. Sin ningún "respira, ahora foco". |
| ✗ Genera fricción | Sin texto de conexión entre actividades. El usuario no sabe qué viene. El cambio de registro entre bloques puede romper la continuidad. |

### 6.5 Cierre

| | Evaluación |
|---|---|
| ✓ Funciona bien | La `CompletionScreen` tiene buena estructura base. El tiempo transcurrido es un dato útil. "Repetir camino" es una acción pertinente. |
| ⚠ Se siente estático | El ✓ verde sobre `breathe-soft` es genérico (igual para todos los caminos). Sin copy poético de cierre: solo "Camino completado" técnico. La experiencia no tiene peso proporcional al esfuerzo realizado. |
| ✗ Genera fricción | Nombre aparece como "dawn" (mismo bug que topbar). No hay espacio de reflexión ni integración del recorrido. El botón "Volver" lleva directamente al dashboard sin transición de salida. |

---

## 7. Inventario de bloques clasificados por efecto

### Técnicas de respiración

| ID | Nombre ES | Duración | Efecto principal | Efecto secundario | Notas |
|---|---|---|---|---|---|
| `breathe.coherent.55` | Coherente 5·5 | 5 min | **Centra** | Relaja | HRV; usado en path.dawn y path.dusk |
| `breathe.coherent.66` | Coherente 6·6 | 10 min | **Centra** | Relaja | Versión larga; libre en catálogo |
| `breathe.box.4` | Box 4·4·4·4 | 5 min | **Centra** | Relaja | Equilibrio mental, foco |
| `breathe.box.6` | Box 6·6·6·6 | 7 min | **Centra** | Relaja | Versión profunda |
| `breathe.nadi.shodhana` | Nadi Shodhana | 8 min | **Centra** | Asienta | Equilibra hemisferios; usado en weekend |
| `breathe.ujjayi` | Ujjayi | 6 min | **Centra** | Relaja | Oceánica, meditativa |
| `breathe.478` | 4·7·8 | 3 min | **Relaja** | Asienta | Exhalación larga, parasimpático; usado en afternoon |
| `breathe.physiological` | Suspiro fisiológico | 2 min | **Relaja** | Limpia | Reset vagal rápido; el más corto |
| `breathe.bellows` | Bhastrika Fuelle | 3 min | **Despierta** | Limpia | Pranayama energizante |
| `breathe.rounds.express` | Rondas express | 4 min | **Despierta** | Limpia | 2 rondas · safety required |
| `breathe.rounds.full` | Respiración en rondas | 12 min | **Despierta** | Limpia | 3 rondas Wim Hof-style · safety required |
| `breathe.kapalabhati` | Kapalabhati Kriya | 3 min | **Despierta** | Limpia | Enérgico, limpia; safety required |

### Rutinas de movilidad / Estira (EXTRA_ROUTINES en ExtraModule, ids `move.*`)

| ID | Nombre ES | Duración | Efecto principal | Efecto secundario | Notas |
|---|---|---|---|---|---|
| `move.neck.3` | Cuello · 3 min | 3 min | **Activa** | Relaja | Micro-pausa cervical; usado en dawn |
| `move.desk.quick` | Escritorio express | 2 min | **Activa** | Relaja | Sin levantarse; el más discreto |
| `move.chair.antidote` | Antídoto silla | 5 min | **Activa** | Asienta | Caderas, lumbar, cuello + reset resp.; usado en dusk |
| `move.hips.5` | Caderas · 5 pasos | 6 min | **Activa** | Relaja | Desbloqueo profundo; usado en midday |
| `move.shoulders.5` | Hombros · 5 pasos | 5 min | **Activa** | Relaja | Rotadores, pecho, trapecios |
| `move.atg.knees` | ATG · Rodillas | 6 min | **Activa** | Despierta | Mantenimiento articular; usado en weekend |
| `move.ancestral` | Ancestral | 6 min | **Activa** | Asienta | Crawl, hang, squat; full body reset |

### Rutinas de fuerza / Mueve (MOVE_ROUTINES en MoveModule, ids `extra.*`)

| ID | Nombre ES | Duración | Efecto principal | Efecto secundario |
|---|---|---|---|---|
| `extra.desk.pushups` | Flexiones escritorio | 2 min | **Despierta** | Activa |
| `extra.chair.dips` | Fondos en silla | 3 min | **Despierta** | Activa |
| `extra.wall.sit` | Sentadilla en pared | 3 min | **Despierta** | Activa |
| `extra.calves` | Gemelos subrepticios | 1 min | **Despierta** | Activa |
| `extra.core.stealth` | Core silencioso | 2 min | **Despierta** | Centra |
| `extra.grip.squeeze` | Grip + antebrazos | 1 min | **Activa** | Despierta |
| `extra.posture.set` | Postura reset | 2 min | **Activa** | Centra |

### Bloques de foco

| Tipo | Duración | Efecto principal | Notas |
|---|---|---|---|
| `focus` 15 min | 15 min | **Centra** | Solo en path.afternoon; timer simple sin integración FocusTimer |
| `focus` 25 min | 25 min | **Centra** | Estándar; no conecta con el pomodoro principal |

> El foco en Caminos es un timer aislado (`PathFocusStep`), no el pomodoro completo.
> La duración se fija en el catálogo (`min: 15` o `min: 25`), no es configurable por el usuario.

### Bloque de hidratación

| Tipo | Efecto principal | Notas |
|---|---|---|
| `hydrate` (step opcional) | **Limpia** | Llama `addWaterGlass(1)` si el usuario confirma. Sin duración fija. Siempre marcado como `optional: true`. |

> Los pasos opcionales son saltables con botón dedicado. No se cuentan en `skippedSteps`
> de la misma manera que los pasos obligatorios (la implementación actual los marca
> como `skipped` si se salta, pero el historial no persiste esa distinción).

---

## 8. Estado de internacionalización (i18n)

### 8.1 Cobertura

**Completa.** No hay claves bajo `paths.*` o `path.*` sin traducción EN.
Las 50+ claves del sistema de Caminos tienen par ES/EN.

### 8.2 Bug copy EN detectado

`paths.path.midday.tagline` EN: `"Recharge at mid-morning."` — debería ser "midday"
o "mid-day". Error semántico menor pero incorrecto.

### 8.3 Inventario completo de claves

**Nombres y taglines de caminos:**

| Clave | ES | EN |
|---|---|---|
| `paths.path.dawn.name` | Amanecer | Dawn |
| `paths.path.dawn.tagline` | Empieza bien el dia. | Start the day right. |
| `paths.path.midday.name` | Mediodia | Midday |
| `paths.path.midday.tagline` | Recarga a mitad de jornada. | Recharge at mid-morning. ⚠ |
| `paths.path.afternoon.name` | Tarde | Afternoon |
| `paths.path.afternoon.tagline` | Un segundo aire para el resto del dia. | A second wind for the rest of the day. |
| `paths.path.dusk.name` | Atardecer | Dusk |
| `paths.path.dusk.tagline` | Cierra el dia con calma. | Close the day with calm. |
| `paths.path.weekend.name` | Fin de semana | Weekend |
| `paths.path.weekend.tagline` | Ritmo suave. Sin prisas. | Gentle rhythm. No rush. |

**UI de biblioteca y selector:**

| Clave | ES | EN |
|---|---|---|
| `paths.library.title` | Todos los caminos | All paths |
| `paths.library.start` | Comenzar | Start |
| `paths.library.doneToday` | Hecho hoy | Done today |
| `paths.library.favorite` | Favorito | Favorite |
| `paths.library.unfavorite` | Quitar favorito | Remove favorite |
| `paths.library.viewAll` | Ver todos | View all |
| `paths.suggested.label` | Sugerido ahora | Suggested now |
| `paths.suggested.favorite` | Tu favorito | Your favorite |
| `paths.runner.repeat` | Repetir camino | Repeat path |
| `path.card.done` | Hecho hoy | Done today |
| `path.card.start` | Comenzar | Start |

**Runner y pasos:**

| Clave | ES | EN |
|---|---|---|
| `path.runner.exit` | Salir del camino | Exit path |
| `path.runner.exitConfirmTitle` | Salir del camino? | Exit path? |
| `path.runner.exitConfirmBody` | Perderas el progreso de este camino. | You will lose progress on this path. |
| `path.runner.exitConfirmYes` | Si, salir | Yes, exit |
| `path.runner.exitConfirmNo` | Seguir | Stay |
| `path.runner.skip` | Saltar | Skip |
| `path.runner.next` | Siguiente | Next |
| `path.runner.done` | Hecho | Done |
| `path.runner.complete.title` | Camino completado | Path completed |
| `path.runner.complete.body` | Has terminado {name}. | You finished {name}. |
| `path.runner.complete.back` | Volver | Back |
| `path.hydrate.copy` | Un vaso de agua, si te apetece | A glass of water, if you feel like it |
| `path.hydrate.drank` | He bebido | I drank |
| `path.error.routineNotFound` | Rutina no encontrada: {id} | Routine not found: {id} |

**Stats:**

| Clave | ES |
|---|---|
| `stats.paths.title` | Caminos |
| `stats.paths.total` | Total completados |
| `stats.paths.currentStreak` | Racha actual |
| `stats.paths.bestStreak` | Mejor racha |
| `stats.paths.empty` | Aun no has completado ningun camino |
| `stats.paths.heatmap` | Actividad del año |

### 8.4 Calidad del copy actual

- **"Ritmo suave. Sin prisas."** — el mejor copy del sistema; breve, sensorial, cumple el tono PACE
- **"Un segundo aire para el resto del dia."** — imagen concreta, ligera; el segundo mejor
- Los demás taglines son funcionales pero genéricos ("Empieza bien", "Recarga", "Cierra")
- Los nombres de caminos son todos horarios: todos deben remplazarse en s75

---

## 9. Auditoría del selector dashboard (SuggestedPathCard)

**Archivo:** `app/paths/SuggestedPathCard.jsx` (192 líneas)

**Lógica de sugerencia** delegada completamente a `getSuggestedPath()` en
`state-paths.jsx:89–98`. El componente solo la llama y renderiza el resultado.
No tiene lógica de selección propia.

**Listado "Ver todos":** botón texto 11px italic subrayado → dispara
`CustomEvent('pace:open-paths-library')` → `PathsLibrary` overlay (modal centrado
480px max-width, lista vertical de `PLPathCard`, fondo `paper-2`, `overflowY: auto`).
La `PathsLibrary` es un modal separado, no integrado en el dashboard.

**Viabilidad de carrusel horizontal inline:**

| Aspecto | Evaluación |
|---|---|
| Complejidad técnica | Baja — `overflow-x: auto` + `display: flex` en una fila de `PathMiniCard` |
| Riesgo de regresión | Medio — la lógica dual card actual (favorito + sugerido) requiere repensar el layout |
| Ventaja vs modal | Alta — el usuario ve todos los caminos sin abrir overlay; más affordance |
| Mobile | Carrusel horizontal funciona bien en mobile con `snap-type: x mandatory` |
| Recomendación | **Viable y deseable para s75.** Sustituye "Ver todos" + modal por carrusel inline que muestra los N arquetipos con su mood card. `PathsLibrary` modal puede mantenerse como detalle expandido o deprecarse. |

---

## 10. Indicador de progreso interno actual

**Existe, pero es mínimo.** Los **path-dots** en `PathTopBar` (`PathRunner.jsx:10–41`)
son el único indicador de progreso global del camino:

```
.path-dot          { width: 8px; height: 8px; border-radius: 50%; background: var(--line); }
.path-dot.active   { background: var(--ink); }
.path-dot.done     { background: var(--ink-3); }
```

Los dots aparecen en la barra superior junto al nombre (bugueado) y el botón de salida.
No hay etiquetas, no hay duración estimada, no hay nombre del siguiente paso.

**Lo que falta para un sendero visual real (objetivo s76):**
- Hitos visuales con ícono semántico por tipo de paso (breathe/focus/body/hydrate)
- Duración total estimada del camino y tiempo restante global
- Nombre del siguiente paso visible durante el paso actual
- Splash screen de transición entre pasos ("Ahora: Antídoto silla · 5 min")

El componente `PathTopBar` es el punto de extensión natural para estas mejoras.

---

## 11. Propuesta de 6–8 arquetipos de Camino por mood

> Nombres tentativos de trabajo, NO finales. Solo para orientar la conversación.
> Composiciones basadas en bloques disponibles (Sección 7).
> Ningún nombre hace referencia a hora del día.

---

### 1. Brote

**Mood:** Despertar suave. La mente quiere encenderse, el cuerpo todavía está tibio.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.coherent.55` — Coherente 5·5 | 5 min | Centra |
| Foco | `focus 25` | 25 min | Centra |
| Cuerpo | `move.neck.3` — Cuello 3 min | 3 min | Activa |

**Total:** ~33 min

**Contexto vital:** "cuando el cuerpo aún está sereno y la mente quiere encenderse
despacio, sin forzar"

*Evolución natural del path.dawn actual, con nombre sensorial.*

---

### 2. Calma encendida

**Mood:** Foco profundo con fundamento. Cuerpo quieto, mente activada.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.box.4` — Box 4·4·4·4 | 5 min | Centra |
| Foco | `focus 35` | 35 min | Centra |
| Cuerpo | `extra.posture.set` — Postura reset | 2 min | Activa |

**Total:** ~42 min

**Contexto vital:** "antes de una sesión creativa o técnica larga que se anticipa
intensa — cuando quieres entrar con intención, no con inercia"

*Alternativa más larga y estructurada para trabajo profundo.*

---

### 3. Vado

**Mood:** Cruzar el punto medio. Reenganche después de la inercia.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Hidratación | `hydrate` (opcional) | — | Limpia |
| Cuerpo | `move.hips.5` — Caderas 5 pasos | 6 min | Activa |
| Foco | `focus 25` | 25 min | Centra |

**Total:** ~31 min + hidratación

**Contexto vital:** "cuando el cuerpo lleva horas quieto y la mente necesita un
puente antes de volver al trabajo — no rendirse a la inercia del mediodía"

*Evolución del path.midday. El vado: zona de aguas poco profundas donde se puede cruzar el río.*

---

### 4. Brasa

**Mood:** Segundo aire. Reactivación breve sin agotamiento. Fuego que no quema.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.physiological` — Suspiro fisiológico | 2 min | Relaja |
| Foco | `focus 15` | 15 min | Centra |
| Cuerpo | `extra.desk.pushups` — Flexiones escritorio | 2 min | Despierta |

**Total:** ~19 min

**Contexto vital:** "tras una reunión densa, cuando queda energía pero hay que
reencauzarla — necesitas asentar y volver a encenderte en menos de 20 minutos"

*Evolución del path.afternoon. El más corto y más estratégico.*

---

### 5. Tregua

**Mood:** Pausa activa. El sistema nervioso pide parar, no rendir más.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.478` — 4·7·8 | 3 min | Relaja |
| Cuerpo | `move.chair.antidote` — Antídoto silla | 5 min | Activa |
| Hidratación | `hydrate` (opcional) | — | Limpia |

**Total:** ~8 min + hidratación

**Contexto vital:** "cuando el cuerpo grita que necesita soltar, no trabajar más —
sin importar la hora, sin obligación de foco"

*Sin bloque de foco. Nuevo arquetipo sin equivalente actual.*

---

### 6. Niebla baja

**Mood:** Desaceleración contemplativa. El día se asienta sin prisa.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.coherent.66` — Coherente 6·6 | 10 min | Centra/Relaja |
| Cuerpo | `move.ancestral` — Ancestral | 6 min | Activa/Asienta |
| Hidratación | `hydrate` (opcional) | — | Limpia |

**Total:** ~16 min + hidratación

**Contexto vital:** "para asentar el día sin importar la hora — cuando el cuerpo
pide ir hacia adentro, no hacia afuera"

*Largo, sin foco, deliberadamente contemplativo. Reemplaza el concepto de path.dusk
pero sin anclaje horario.*

---

### 7. Aliento

**Mood:** Micropausa restauradora. Mínimo gesto, máximo reset.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.physiological` — Suspiro fisiológico | 2 min | Relaja |
| Cuerpo | `move.desk.quick` — Escritorio express | 2 min | Activa |
| Hidratación | `hydrate` (opcional) | — | Limpia |

**Total:** ~4 min + hidratación

**Contexto vital:** "entre reuniones, cuando hay apenas 5 minutos y el cuerpo lleva
horas acumulando tensión sin poder soltarla"

*El camino más corto. Nuevo arquetipo: la micropausa con intención.*

---

### 8. Refugio

**Mood:** Resiliencia sin obligación. Mantenimiento del cuerpo y la mente libre.

| Bloque | Referencia | Duración | Efecto |
|---|---|---|---|
| Respiración | `breathe.nadi.shodhana` — Nadi Shodhana | 8 min | Centra |
| Cuerpo | `move.atg.knees` — ATG Rodillas | 6 min | Activa |
| Hidratación | `hydrate` (opcional) | — | Limpia |

**Total:** ~14 min + hidratación

**Contexto vital:** "días sin obligaciones o semanas de baja carga — para cuidar
el cuerpo estructuralmente y dejar la mente quieta sin el peso del foco"

*Evolución del path.weekend. El único sin foco mental. El nombre Refugio anticipa
la experiencia mejor que Fin de semana.*

---

## 12. Referencias visuales y conceptuales

### 12.1 Apps que nombran por mood/sensación

**Endel** — el referente más cercano a la filosofía que buscamos.
Nombra sus soundscapes como "Focus", "Relax", "Sleep", "Move", "Off-peak".
El usuario selecciona estado interno; la app adapta el output al contexto (hora,
clima, ritmo cardiaco si hay wearable).
*Trasladable a PACE:* el nombre del camino es la descripción del estado deseado,
no del momento del día. La selección es sobre "¿cómo quiero estar?" no "¿qué hora es?".

**Loóna** (bedtime / sleep app) — nombra sesiones como "Forest Night", "Ocean Drift",
"Rain Shelter", "Mountain Calm". Poético-naturalista, sensorial, sin referencias temporales.
*Trasladable a PACE:* vocabulario de lugar/sensación (Vado, Refugio, Niebla baja)
tiene exactamente este patrón. Loóna es la referencia más directa para el naming.

**Oak Meditation** — "Breathe", "Meditate", "Sleep". Simple, por función.
*Trasladable a PACE:* la claridad funcional como fallback cuando lo poético es ambiguo.

**Headspace** — "Meditation", "Sleep", "Focus", "Move", "Wake Up". Nombra por intención.
*Trasladable a PACE:* la intención como ancla ("Wake Up" = Brote, "Wind Down" = Niebla baja)
puede coexistir con el nombre poético como subtítulo.

**Calm** — categorías por función (Sleep, Meditate, Focus) pero dentro de cada categoría
los objetos tienen nombres naturalistas ("Midnight Rain", "Peaceful Rain", "Ocean").
*Trasladable a PACE:* la estructura dos-capas: función/intención (label discreto) +
nombre poético (nombre principal en Garamond italic).

### 12.2 Sistemas de selección con carruseles cuidados

**Spotify "Made for You"** — carrusel horizontal de tarjetas con gradiente o color
de portada + nombre de playlist + descriptor ("Your Daily Mix", "Discover Weekly").
Patrón: tarjeta con identidad visual propia + texto jerarquizado.
*Trasladable a PACE:* cada camino con color/textura de fondo propio (no todos con
la misma barra oliva), nombre en tipografía display, descriptor de mood.

**Apple Health (Mindfulness)** — tarjetas con gradiente suave + icono + nombre +
duración. El color del gradiente varía por tipo de práctica.
*Trasladable a PACE:* duración estimada visible en la card antes de entrar.
El gradiente de fondo como diferenciador semántico entre arquetipos.

**Sleep Cycle** — carrusel de tarjetas de sonidos ambientales. Diseño minimalista.
*Trasladable a PACE:* la navegación horizontal táctil es natural para 8 arquetipos;
más intuitiva que el modal de lista vertical actual.

**Loóna (selector de experiencias)** — cuadrícula de tarjetas con ilustración +
nombre poético. El usuario navega por mood sin explicaciones largas.
*Trasladable a PACE:* las cartas de camino podrían tener una ilustración botánica
o abstracta mínima coherente con el imaginario naturalista.

### 12.3 Vocabulario poético-naturalista para nombres de Caminos

#### Libros de Horas medievales
Las *Horas* no son un horario: son la plenitud de un momento devocional.
- **Prima** (primera luz, antes del trabajo)
- **Completas / Compline** (cierre del día, retiro)
- **Nona** (el momento de menor energía, la pausa)
- **Vísperas** (tránsito entre actividad y reposo)
*Estos términos pueden usarse como subtítulos o categorías sin ser nombres directos.*

#### Kigo japonés (palabras estacionales, vocabulario para nombres de haiku)
- **Komorebi** (木漏れ日) — luz filtrada entre hojas; quietud luminosa
- **Ma** (間) — la pausa, el espacio entre notas, entre respiraciones
- **Shizuka** (静か) — quietud profunda, silencio interior
- **Yūdachi** (夕立) — lluvia vespertina repentina; cambio de estado
- **Kogarashi** (木枯らし) — viento que anuncia cambio de estación; urgencia suave
- **Natsukashii** (懐かしい) — nostalgia placentera, presencia del pasado en el cuerpo
- **Mitoreru** (見とれる) — quedarse absorto en algo bello; atención plena
- **Aware** (物の哀れ) — sensibilidad a la transitoriedad de las cosas

#### Taxonomía botánica y vocabulario naturalista
- **Vernación** — el proceso de despliegue de una hoja nueva desde su yema
- **Brote** / **Yema** / **Renuevo** / **Vástago** — primer movimiento vital
- **Latencia** — reposo activo, preparación interna invisible
- **Vernalización** — activación por frío previo; el invierno que hace posible la primavera
- **Umbela** — agrupación radial de flores; estructura orgánica
- **Estrato** — capa del bosque; cada ser en su lugar y altura
- **Micelio** — red invisible de conexiones subterráneas
- **Resurgencia** — afloramiento de agua subterránea

#### Vocabulario marinero
- **Sotavento** — el lado protegido del viento; refugio sin inmovilidad
- **Vado** — zona poco profunda donde se puede cruzar un río; paso posible
- **Leva** — movimiento lento y largo del oleaje; ritmo sin urgencia
- **Resaca** — el agua que vuelve; integración, retorno
- **Calma chicha** — quietud total del mar; pausa antes del viento
- **Virazón** — brisa que entra desde el mar al atardecer; transición

#### Vocabulario montañero y de paisaje
- **Collado** — paso entre dos cumbres; el punto de cruce, no la cima
- **Vereda** — camino estrecho de pastores; el camino que ya existe
- **Alpe** — prado de altura; apertura después del bosque
- **Portillo** — abertura pequeña en una pared o montaña; salida inesperada
- **Majada** — lugar de descanso del rebaño; pausa colectiva, refugio temporal
- **Prado de niebla** — imagen: campo donde no se ve el límite, solo el suelo cercano

#### Movimientos musicales
Debussy: *Clair de lune*, *Reflets dans l'eau*, *La cathédrale engloutie*, *Bruyères* (brezal),
*Voiles* (velas/veils), *La fille aux cheveux de lin*, *Jardins sous la pluie*
Satie: *Gymnopédies* (danza lenta sin ritmo marcado), *Gnossiennes*, *Vexations*
Sigur Rós: *Ára bátur* (bote de remos), *Hoppípolla* (saltar en charcos), *Varúð* (advertencia suave), *Festival*
Arvo Pärt: *Spiegel im Spiegel* (espejo en el espejo), *Pari Intervallo* (intervalo igual)

#### Poesía española y universal
**Antonio Machado:**
*"Caminante son tus huellas el camino y nada más"*
Vocabulario útil: **sendero**, **morada**, **polvo**, **barro**, **alba**, **rocío**,
**senda**, **cima**, **veredas**, **tarde**, **campo**, **serranía**

**Rilke (traducido):**
*"Ahora debo aprender a vivir"* — vocabulario: **quietud**, **umbral**, **vecindad**,
**tránsito**, **Adviento** (llegada), **maduración**

**Mary Oliver (naturalista):**
Poemas: "Wild Geese", "The Summer Day", "Morning", "Grasshopper"
Vocabulario: *meadow* (pradera), *belonging* (pertenencia), *attention* (atención),
*one wild and precious life*, *ordinary* (lo ordinario como sagrado)

---

## 13. Riesgos identificados para el rediseño

### R1 — Migración de IDs en `state.paths.completed` (ALTO)

Las claves de `completed` y `favorite` son los IDs actuales (`path.dawn`, `path.dusk`...).
Si se renombran los caminos (ej: `path.brote`, `path.vado`), el historial de usuarios
existentes queda huérfano. **Requiere script de migración en `loadState`** (en `state-core.jsx`)
que remapee IDs viejos → nuevos. Patrón ya establecido en la app para otras migraciones.

### R2 — Claves i18n a renombrar (MEDIO)

~10 claves por camino × 5 caminos = 50 claves bajo `paths.path.*`.
Al renombrar IDs, las claves de traducciones también cambian.
Durante la migración, se deben añadir las nuevas claves SIN borrar las antiguas
hasta confirmar que `loadState` las migró correctamente para todos los usuarios.

### R3 — `getSuggestedPath()` necesita refactor completo (MEDIO)

La función actual es 100% horaria. Con el nuevo sistema de archetipos por mood,
la sugerencia automática por hora deja de tener sentido. Opciones:
a) **Sin sugerencia automática**: siempre mostrar carrusel, sin "sugerido ahora"
b) **Sugerencia por patrones de uso**: sugerir el más completado o el no completado hace más días
c) **Sugerencia contextual ligera**: hora + día laboral/fin de semana como señal parcial, no determinante
Decisión pendiente para s75.

### R4 — Bug `PathTopBar` nombre crudo (BAJO, fácil de corregir)

`PathRunner.jsx:14` — `pathName={cur.id.replace('path.', '')}` → debería ser el nombre traducido.
Corrección: `pathName={t(path.nameKey) || cur.id.replace('path.', '')}`.
Una línea, corregir en s75 antes de cualquier otro cambio.

### R5 — Bug `CompletionScreen` nombre crudo (BAJO, fácil de corregir)

`PathRunner.jsx:140–141` — `const name = path ? snapshot.pathId : snapshot.pathId` (idénticos en ambos casos)
y luego `{snapshot.pathId.replace('path.', '')}`.
Corrección: usar `t(path.nameKey) || snapshot.pathId.replace('path.', '')`.
Una línea, corregir en s75 junto con el anterior.

### R6 — PathFocusStep no integra el pomodoro principal (BAJO, decisión pendiente)

El foco en Caminos es un timer aislado sin conexión con `FocusTimer` ni
`addFocusMinutes`. Los minutos completados en un Camino NO se suman a las
estadísticas de foco. Esto puede ser una omisión o una decisión intencional.
Verificar antes de s75 si se desea integrar.

### R7 — `hydrate` step no llama `completeHydrateSession` (BAJO)

`addWaterGlass(1)` se llama cuando el usuario confirma haber bebido, pero no
dispara los detectores de logros de hidratación semanal. Verificar si es intencional.

---

## 14. Recomendaciones para sesiones 75 y 76

### Sesión 75 — Selector + nombres + copy

**Orden de trabajo sugerido:**

1. **Corregir bugs primero** (10 min):
   - `PathRunner.jsx:14` — nombre en PathTopBar: `t(path.nameKey)`
   - `PathRunner.jsx:140–141` — nombre en CompletionScreen: `t(path.nameKey)`

2. **Decidir arquetipos finales** (conversación con usuario, fuera de código):
   - Elegir 5–8 nombres definitivos del pool de la Sección 11
   - Definir qué pasa con `path.weekend` (¿se mantiene como "Refugio" sin ancla de día?)
   - Decidir la estrategia de sugerencia sin hora

3. **Actualizar `registry.js`**:
   - Cambiar IDs de los 5 caminos (con mapa de migración documentado)
   - Actualizar bloques si se cambia la composición de algún arquetipo
   - Añadir nuevos arquetipos si los hay

4. **Migración en `state-core.jsx`**:
   - En `loadState`, añadir lógica de remap `path.dawn → path.[nuevo]` etc.
   - Probar que el historial existente se migra correctamente

5. **Actualizar `strings.js`**:
   - Nuevas claves `paths.path.[nuevo].name` y `.tagline` con copy poético en ES/EN
   - Mantener claves viejas durante la sesión hasta validar migración
   - Corregir bug EN en midday tagline

6. **Rediseñar `SuggestedPathCard` → carrusel inline**:
   - Sustituir lógica de 1–2 tarjetas + "Ver todos" por carrusel horizontal de todas las cartas
   - Cada carta: nombre, mood en tagline, duración estimada, iconos de pasos
   - PathsLibrary modal puede mantenerse como detalle completo o deprecarse

7. **Refactorizar `getSuggestedPath()`** con la nueva estrategia decidida en paso 2

**Qué NO tocar en s75:**
- La lógica interna del runner (PathRunner, pasos, accesibilidad) — está bien
- Los módulos de actividad (BreatheSession, MoveSession) — no son responsabilidad de Caminos
- La capa de persistencia (state-paths.jsx) salvo la migración de IDs

---

### Sesión 76 — Sendero visual de progreso interno

**Objetivo:** el usuario siente que camina un recorrido, no que salta entre pantallas.

**Componente nuevo: `PathJourneyBar`** (o extensión de `PathTopBar`):
- Reemplaza los 8px dots por hitos visuales con ícono semántico (breathe/focus/body/hydrate)
- Muestra: nombre del paso actual + nombre del siguiente paso
- Duración total estimada del camino + tiempo transcurrido global
- Color de hito por tipo (por ejemplo: breathe en `--breathe`, focus en `--olive`, body en `--terracota`, hydrate en `--hydrate`)

**Splash screen de transición entre pasos:**
- 1.5–2 segundos entre el fin de un paso y el inicio del siguiente
- Solo texto: nombre del siguiente paso + su tipo + duración
- Mismo fondo que el overlay, sin animaciones complejas
- Botón "Continuar" para usuarios que quieren saltarse la pausa

**Copy de cierre en CompletionScreen:**
- Una frase corta y poética distinta por camino (nueva clave i18n: `paths.path.[id].completion`)
- Ejemplo: Vado → *"El río se cruzó."* · Refugio → *"Todo lo que necesitabas estaba aquí."*
- El ✓ puede tener un color distintivo por arquetipo (extraído del token del camino)

**Qué NO tocar en s76:**
- La lógica de `advancePathStep` y `completePath` — funciona correctamente
- La accesibilidad del runner — ya es correcta

---

*Informe generado en sesión 75-prep · 2026-05-15*
*Sistema de Caminos auditado en estado v0.27.5 (sin cambios desde sesión 57)*
