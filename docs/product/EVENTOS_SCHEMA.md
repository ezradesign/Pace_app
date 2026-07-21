# PACE · Esquema de eventos (`pace.events.v1`)

> **Corte:** B2.2b-3 · diseño canónico de la capa de eventos.
> **Sesión:** s117 (2026-07-21) · sobre v0.60.0. **Solo diseño, sin código de
> app y sin bump de versión** (patrón s109).
> **Estado:** **rev. 5 — APTO PARA CIERRE** (no se cierra en s117 por decisión del
> usuario). El P0 single-writer queda **resuelto por arquitectura de adaptadores**
> (§29). **Android e iOS (Capacitor) entran como runtimes previstos** desde el
> diseño, aunque su implementación llegue después. Ninguna parte de este documento
> se ha cableado.

Este documento define **cómo serán** los eventos de PACE cuando se implementen.
Es la fuente canónica para las sesiones de código posteriores (§25) y para B2.3.
**No introduce ni describe código existente nuevo**: todo lo que aquí se propone
está por construir.

Decisiones fijadas en s117 (AskUserQuestion, todas la recomendación):

| Decisión | Valor fijado |
|---|---|
| Alcance del documento | D1–D5 completo (blueprint) |
| Almacenamiento | Clave/backend propios, fuera de `pace.state.v2` |
| Puente con datos existentes | Conservar y puentear (sin backfill ficticio) |
| Retención de eventos crudos | 120 días + agregados permanentes |
| Cierre de la sesión | Solo-docs, sin bump de versión (patrón s109) |

> **Historial de revisión.** rev. 1: blueprint D1–D5. rev. 2: `runId`, duraciones,
> `activatedAt`+baseline, UUIDv4, fases. rev. 3: import = reemplazo total,
> correlación tipada, comparador de poda, medición por `TextEncoder`, modelo
> single-writer (dejó 1 P0 abierto). rev. 4: **arquitectura por
> adaptadores** — separa **modelo canónico** (backend-independiente) de **backend de
> persistencia** (por runtime); contrato conceptual **EventStore**; matriz de
> **capacidades** y de **runtimes**; **Web Locks** solo dentro del adaptador web;
> **Android/Capacitor** con backend transaccional nativo (SQLite) previsto; `file://`
> no emite; el P0 queda resuelto. **rev. 5** (esta): +**iOS/Capacitor** como runtime
> previsto (adaptador nativo espejo de Android, mismo contrato y garantías); sin
> reabrir el modelo canónico ni el P0. Ver §30.

---

## 1. Propósito y límites

**Propósito.** Registrar, de forma local e inmutable-mientras-retenida, los hechos
relevantes de uso (una pausa terminada, una respuesta de feedback, un paso de
Camino) para que consumidores futuros —stats premium, el recomendador «Pausa PACE»
/ scoring v2 de `getSuggestedPath`, «qué te ayuda» premium— lean un historial fiable
**sin** reconstruirlo desde agregados que pierden detalle.

**Qué NO es.** No es telemetría, no es analítica, no sale del dispositivo, no
identifica al usuario. No sustituye a los agregados actuales (`history`,
`weeklyStats`, `streak`): los **complementa**. No es un cambio observable en la UI:
en diseño y en la primera fase de implementación **no hay consumidor visible**.

**Arquitectura (rev. 4).** El esquema se define en **dos capas separadas**:
- **A · Modelo canónico** (§5–§17): backend-independiente. No depende de ninguna API
  de navegador concreta.
- **B · Backend de persistencia** (§18–§22): un **adaptador por runtime** que
  implementa el contrato EventStore (§10). `localStorage`, `setItem`, el evento
  `storage`, `navigator.locks`, SQLite, etc. son **detalles de adaptador**, nunca
  invariantes universales del modelo.

**Límite duro de esta sesión (s117).** Diseñar, no implementar. Cero
`state-events.jsx`, cero adaptadores, cero Capacitor, cero cambios en
state/i18n/runner. No se reabren el GIRO (s113/s114), el contrato B2.2b-1 (s115) ni
el feedback B2.2b-2 (s116).

---

## 2. Principios

1. **Local-first estricto.** Los eventos viven en el dispositivo. Cero backend
   remoto, cero red, cero servicio externo. Sin conexión funciona igual.
2. **Backend-independiente.** El modelo canónico (§5) no conoce el backend. Términos
   como `setItem`, evento `storage`, `navigator.locks` o SQLite pertenecen a un
   **adaptador** (§19), no al modelo.
3. **Privacidad por diseño.** Sin PII, sin identificadores de usuario/dispositivo,
   sin fingerprint, **sin texto libre** (matices en §23).
4. **Inmutables mientras están retenidos.** Un evento no se edita; la única
   eliminación es la poda por retención (§12). Es *append + poda determinista*.
5. **Compatibilidad hacia adelante.** Un `type`/`v` desconocido se **conserva** en la
   carga y se ignora en los reducers que no lo entienden; sigue sujeto a retención y
   presupuesto (§9, §12).
6. **Sin telemetría.** Nada se agrega, envía, sincroniza ni comparte.
7. **Determinismo e idempotencia.** Toda reducción a agregados es función pura e
   idempotente de los eventos retenidos + una línea base congelada.
8. **Un solo escritor (single-writer).** Toda mutación se ejecuta bajo **exclusión
   provista por el adaptador** (§10, §19). No se asume que el almacenamiento ofrezca
   compare-and-swap por sí mismo.
9. **Una única fuente de verdad por dominio y runtime.** El mismo estado no se
   escribe a la vez en dos backends (§19.3).
10. **Regla #10 (CLAUDE.md).** El día civil se calcula con `todayISO()` /
    `parseLocalDateKey()`; nunca `new Date("YYYY-MM-DD")` para interpretar una clave
    de día. Un instante absoluto (`new Date().toISOString()`) sí es válido.

---

## 3. Glosario

| Término | Definición |
|---|---|
| **Evento** | Hecho inmutable-mientras-retenido con instante. Fuente NUEVA de este diseño. |
| **Agregado** | Contador/serie permanente, crece o se recalcula, sin instante individual. |
| **Señal derivada** | Valor calculado on-the-fly; nunca se persiste (`helpScore`, racha viva). |
| **Snapshot** | Estado de dominio «cómo están las cosas ahora» (`achievements`, `profile`). |
| **Estado operativo** | Estado efímero/config, no histórico (`plan`, `water.today`). |
| **`runId`** | Identificador efímero y local de una corrida de pausa; correlaciona sus eventos (§7.1). |
| **`pathRunId`** | Identificador de una corrida completa de un Camino; agrupa sus pasos (§7.1). |
| **Modelo canónico** | Envelope, tipos, payloads, orden, baseline, retención, export — sin backend. |
| **Backend de persistencia** | Lectura/escritura/transacción/bloqueo/recuperación físicos, por runtime. |
| **EventStore** | Contrato conceptual entre modelo y backend (§10). |
| **Adaptador** | Implementación del EventStore para un runtime concreto (§19). |
| **Capacidad** | Modo del subsistema: `READ_WRITE` / `READ_ONLY` / `UNAVAILABLE` (§18). |
| **Runtime** | Entorno de ejecución: web/PWA, `file://`, extensión, Android/Capacitor (§19, §29). |

**Regla del glosario:** no todo lo que lleva fecha debe volverse evento. Que «ningún
dato-señal quede huérfano» (§26) significa que cada uno está **clasificado
explícitamente** (conservado / derivable / no-evento), no que todo deba volverse
evento.

---

## 4. Inventario de datos actuales (clasificado)

Cotejado con `defaultState` ([`app/state-core.jsx:27`](../../app/state-core.jsx)).

### 4.1 Agregados permanentes (se CONSERVAN; el evento los complementa)
`weeklyStats.{focusMinutes,breathMinutes,moveMinutes,waterGlasses}` (4×7,
lunes-primero) · `history.{days,months,years}` · `streak.{current,longest,lastActiveDate}`
· `totalFocusMin` · `breatheSessionsTotal`, `moveSessionsTotal` · `routineCounts` ·
`paths.completed` · `routineFeedback:{[id]:{yes,some,no,lastPromptDay}}` (s116).

### 4.2 Listas cronológicas / señales limitadas
`morningDates` (cap 30), `silentDates` (cap 30), `waterGoalDates` (cap 14) ·
`paths.history`, `paths.lastViewed` · `supportSeenAt`, `profile.completedAt`,
`firstSeen`.

### 4.3 Estado operativo (NO evento — nunca se registra)
`plan`, `water.{goal,today,lastReset}`, `paths.current`, `cycle`, `focusMode`,
`focusMinutes` · preferencias/config (`palette`, `font`, `layout`, …) ·
`premiumUnlocked`, `customRoutines`, `reminders`.

### 4.4 Snapshots de dominio
`achievements`, `paths.completed`, `profile`.

**Conclusión.** Los eventos NO reemplazan nada de §4.1–4.4. Introducen una fuente
paralela más rica de la que, en el futuro, podrán derivarse agregados nuevos sin
perder el detalle por-hecho.

---

## 5. Arquitectura: modelo canónico vs. backend

**A · Modelo canónico (backend-independiente).** Es lo que se serializa, se exporta
y viaja entre runtimes: envelope (§7), tipos (§6), payloads (§8), `runId`/`pathRunId`
(§7.1), orden canónico (§11/§12), baseline (§13), retención (§12), consolidación
(§11/§13), export/import (§17) y versión de esquema (§9). **No** menciona API de
navegador.

**B · Backend de persistencia (por runtime).** Provee: lectura, escritura,
**transacción/exclusión**, recuperación, disponibilidad y presupuesto **físico**.
Cada runtime tiene su adaptador (§19). El modelo canónico se apoya en el backend
**solo** a través del contrato EventStore (§10).

> Regla dura: si un requisito nombra `setItem`, `storage`, `navigator.locks` o
> SQLite, pertenece a la capa B (un adaptador), **no** a la A. La capa A solo exige
> *garantías* (exclusión, atomicidad de la mutación, durabilidad), no *mecanismos*.

---

## 6. Taxonomía de eventos

Tipos `dominio.acción`. Vocabulario **pequeño y estable**; ampliar el payload de un
tipo sube su `v` (§9). **Añadir un `type` nuevo NO sube el `v` de los existentes.**

### 6.1 Tipos aprobados (schema inicial) — cada uno con ≥1 consumidor (§24)
| `type` | Cuándo | Consumidor aprobado |
|---|---|---|
| `session.completed` | Fin de una pausa guiada (Foco, Respira, Move, Estira). | Stats premium · scoring v2 · «qué te ayuda» |
| `feedback.answered` | Respuesta a «¿Te ayudó esta pausa?». Puente con `routineFeedback`. | «qué te ayuda» · scoring v2 |
| `path.step.completed` | Un paso de un Camino terminado. | Stats premium (Caminos) |
| `path.completed` | Un Camino terminado por completo. | Stats premium · scoring v2 (repetición) |

### 6.2 Candidatos APLAZADOS (fuera del schema inicial)
`achievement.unlocked` (sin consumidor de lectura claro) · `hydrate.glass` (ya
cubierto por `weeklyStats.waterGlasses` + `waterGoalDates`; si se aprueba,
`{ delta:1, goal, reachedGoal }`, delta explícito).

**No son evento nunca:** cambios de preferencias, apertura de pantallas, navegación,
estado operativo (§4.3).

### 6.3 Semántica de «completado» (CRÍTICO)
- **Salir antes de DONE (`× Salir`) NO emite `session.completed`.**
- `completionReason`: `natural` (se agotó el plan; incluye el legacy que llega al
  final avanzando manualmente — requerir interacción manual NO es `early`) · `early`
  (control explícito de finalización anticipada que acorta trabajo planificado).
- Un consumidor que quiera «sesiones completas» filtra por `completionReason ===
  'natural'`.

### 6.4 Duraciones (perímetros — política canónica, sin cláusulas de escape)
| Campo | Semántica |
|---|---|
| `elapsedSeconds` | Tiempo de pared inicio→final, **incluidas pausas y transiciones**. |
| `activeSeconds` | Tiempo **realizando la actividad principal**. |
| `plannedSeconds` | Duración planificada **conocida antes de empezar**, o `null`. |
| `plannedSecondsSource` | `preset` · `derived` · `declared` · `null`. |

- **Mueve/Estira:** descansos entre series NO cuentan como `activeSeconds`;
  transiciones/avisos de cambio de lado NO; el trabajo de ambos lados SÍ;
  preparaciones y pantallas editoriales NO; todo permanece en `elapsedSeconds`
  mientras la sesión siga abierta. `plannedSeconds` = `estimateDuration()` (v1,
  `derived`) · `routine.min×60` (legacy, `declared`) · `null`.
- **Foco:** tiempo pausado en `elapsedSeconds`, excluido de `activeSeconds`.
  `plannedSeconds` = preset (15/25/35/45), `preset`.
- **Respira:** inhalación, exhalación, retención y recuperación guiada = `activeSeconds`;
  pausa manual excluida. `plannedSeconds` = rondas×ciclo, `derived`, o `null`.
- **Caminos (`path.completed`):** `elapsedSeconds` = tiempo de pared del Camino;
  `activeSeconds` = suma de `activeSeconds` de sus pasos correlacionados (por
  `pathRunId`); transiciones editoriales van a `elapsedSeconds`; `plannedSeconds`
  solo si es calculable antes de empezar con regla determinista, si algún paso no es
  planificable → `plannedSeconds` **y** `plannedSecondsSource` = `null`; pasos
  instantáneos (`hydrate`) aportan `0` a `activeSeconds`.

---

## 7. Envelope canónico

```
{
  id:                string,          // UUIDv4 canónico (§7.2)
  v:                 number,          // versión del ESQUEMA de este evento (§9)
  type:              string,          // dominio.acción (§6)
  occurredAt:        string,          // instante ABSOLUTO ISO (new Date().toISOString())
  localDay:          string,          // día civil local "YYYY-MM-DD" = todayISO()
  timezoneOffsetMin: number,          // offset del huso para ESA fecha (§7.3)
  context:           'standalone' | 'path',
  runId:             string | null,   // según tipo (§7.1)
  pathRunId:         string | null,   // según tipo (§7.1)
  payload:           object,          // específico del type (§8)
}
```
El envelope es **canónico**: idéntico en todos los backends. Ningún campo depende de
un runtime.

### 7.1 `runId` / `pathRunId` — correlación tipada
| `type` | `runId` | `pathRunId` |
|---|---|---|
| `session.completed` | **obligatorio** | opcional (presente si `context:'path'`) |
| `feedback.answered` | **obligatorio** (referencia a un `runId` existente) | opcional |
| `path.step.completed` | opcional — solo si el paso ejecutó sub-sesión correlacionable | **obligatorio** |
| `path.completed` | no aplicable (`null`) | **obligatorio** |

Un paso instantáneo (`hydrate`) puede no tener `runId`. **No se crean `runId`
ficticios.** `session.completed` y su `feedback.answered` comparten `runId`.

**Cardinalidades:** una ejecución de sesión tiene **un** `runId`; un `runId` produce
**≤1** `session.completed`; un `feedback.answered` **referencia** un `runId`
existente; un Camino tiene **un** `pathRunId`; un `pathRunId` agrupa **N** pasos y
**≤1** `path.completed`.

### 7.2 `id` — identidad, idempotencia y orden
- **Función:** identidad estable para el fold **idempotente** (§11) y como
  **desempate del orden de poda** (§12). *La importación NO deduplica por `id`* (es
  reemplazo total, §17).
- **Canónico:** aleatorio de 128 bits, **UUIDv4**. Primario `crypto.randomUUID()`.
  **Fallback** (donde no exista): (1) 16 bytes con
  `crypto.getRandomValues(new Uint8Array(16))`; (2) bits de versión → `0100` (nibble
  alto del byte 6 = `0x4`); (3) bits de variante → `10xx` (dos bits altos del byte 8
  = `10`); (4) serializar 8-4-4-4-12; (5) **nunca** `Math.random`. En Android el
  backend nativo puede proveer UUID equivalente; el **formato canónico** no cambia.
- **`seq`** (contador local del contenedor/tabla) expresa **solo el orden de creación
  dentro de una instalación**. NO participa en el cursor de poda (no es global ni
  estable tras importación).
- **PROHIBIDO:** derivar `id`/`runId` de PII o fingerprint.

### 7.3 Instante, día civil y offset (con estacionalidad)
- `occurredAt` = instante absoluto (`new Date().toISOString()` válido).
- `localDay = todayISO()` al emitir; nunca se reconstruye desde `occurredAt` con el
  huso vigente.
- `timezoneOffsetMin` se captura **para la fecha del evento**, equivale a
  `new Date(occurredAt).getTimezoneOffset()` (minutos a sumar a la hora local para
  llegar a UTC). **Varía por zona y DST; no es propiedad permanente.**

  | Zona | Horario de verano (DST) | Horario estándar |
  |---|---|---|
  | Madrid | `-120` (UTC+2) | `-60` (UTC+1) |
  | Nueva York | `240` (UTC−4) | `300` (UTC−5) |

---

## 8. Payload por tipo

**`session.completed`** (`v:1`)
```
{ module:'focus'|'breathe'|'move'|'stretch', routineId:string,
  completionReason:'natural'|'early',
  elapsedSeconds:number, activeSeconds:number,
  plannedSeconds:number|null, plannedSecondsSource:'preset'|'derived'|'declared'|null,
  variant:'v1'|'legacy'|null }
```
**`feedback.answered`** (`v:1`) — `runId` obligatorio (referencia a la sesión)
```
{ routineId:string, module:'move'|'stretch'|'breathe', response:'yes'|'some'|'no' }
```
`later` («Ahora no») NO emite evento (§15.2).
**`path.step.completed`** (`v:1`) — `pathRunId` obligatorio; `runId` opcional
```
{ pathId:string, stepIndex:number, stepKind:'focus'|'breathe'|'move'|'stretch'|'hydrate' }
```
**`path.completed`** (`v:1`) — `pathRunId` obligatorio; `runId` no aplicable
```
{ pathId:string, stepsCount:number }
```

---

## 9. Versionado (store · por evento · desconocidos)

- **Esquema (`schemaVersion`):** entero del contenedor/snapshot canónico. El sufijo
  `v1` marca un cambio *incompatible* de contenedor; los compatibles suben
  `schemaVersion`.
- **Por evento (`v`):** payload evoluciona de forma aditiva subiendo su `v`; añadir un
  `type` no toca el `v` de los demás.
- **Desconocidos:** un `type`/`v` no comprendido **se conserva** y se omite en
  reducers; sigue sujeto a retención/presupuesto (§12); no se consolida (al podarlo
  se pierde su detalle); una versión antigua **no inventa agregados** para él.

---

## 10. Contrato conceptual EventStore

El modelo canónico habla con el backend **solo** por este contrato. Son **garantías
conceptuales**, no nombres de función definitivos (eso es implementación):

| Operación | Garantía |
|---|---|
| `getCapabilities()` | Devuelve la capacidad actual (§18) sin escribir. |
| `initialize()` | Crea/valida el contenedor; captura baseline si procede (§15.1); idempotente. |
| `readSnapshot()` | Lee el estado canónico coherente (sin mutar). |
| `appendEvent()` | Añade un evento bajo exclusión; mutación única. |
| `runExclusiveMutation()` | Ejecuta una read-modify-write completa bajo exclusión del backend. |
| `consolidate()` | Funde el lote a podar en `baseline`; idempotente. |
| `prune()` | Elimina crudos consolidados según el cursor (§12); transaccional. |
| `exportSnapshot()` | Serializa el snapshot canónico (§17), sin detalles físicos. |
| `validateImport()` | Valida íntegramente un backup **antes** de tocar nada. |
| `replaceFromImport()` | Reemplazo total validado (§17); nunca merge. |
| `reset()` | Vacía el contenedor de eventos; no toca el estado legacy. |
| `recover()` | Repara una operación interrumpida detectada por marcador (§22). |
| `getDiagnostics()` | Expone el estado interno de capacidad (§18) sin PII. |

**Resultado de toda operación mutadora** — exactamente uno:
`committed` · `rejected` (sin modificación) · `interrupted` (recuperable) ·
`unavailable`. **No existe «probablemente escrito».** Solo un adaptador en modo
`READ_WRITE` (§18) puede emitir, consolidar, podar, importar o resetear.

---

## 11. Orden canónico, idempotencia y consolidación (backend-independiente)

- **Comparador canónico de orden (único lugar):** (1) `occurredAt` **ascendente**;
  (2) ante el mismo `occurredAt`, `id` en **orden lexicográfico ascendente**. `seq`
  NO participa (no es global ni estable tras importación, §7.2).
- **Fold idempotente:** `valor vivo = baseline + fold(eventos retenidos)`, keyed por
  `id`; recontar da el mismo valor.
- **Consolidación + poda = una sola mutación exclusiva** (§10 `runExclusiveMutation`):
  el adaptador garantiza que funde el lote en `baseline`, avanza `pruneCursor` y borra
  los crudos de forma **transaccional** (o bajo lock que serialice la RMW completa,
  §19.1). No existe «poda a medias»; un fallo deja el último estado válido.
- **Sin merge en importación:** la importación es reemplazo total (§17); no fusiona
  eventos ni deduplica por `id`.
- **Consistencia entre almacenes** (p.ej. `pace.state.v2` ↔ backend de eventos, o dos
  claves): **no atómica** entre almacenes distintos. Se resuelve con marcador de
  operación + recuperación idempotente (§22), no asumiendo una transacción global.
  Orden: la verdad canónica de agregados (`pace.state.v2`) primero, el detalle-evento
  después.

---

## 12. Retención y poda

- **Ventana de crudos: 120 días** (rango 90–180). Un evento con `localDay` < hoy−120
  es candidato.
- **`pruneCursor = { occurredAt, id }`** = último evento consolidado y eliminado según
  el comparador (§11). La **poda por lotes procesa solo eventos posteriores al
  cursor**, en orden; no salta ni reprocesa.
- **Destilar antes de podar:** el lote se consolida en `baseline` (§13) antes de
  borrarse; nunca se pierde el total, solo el detalle. Los desconocidos no se
  consolidan pero siguen las **mismas** reglas de retención.
- **Sin merge por detrás del cursor:** como la importación es reemplazo total (§17),
  no hay camino que reintroduzca eventos anteriores al cursor → sin doble conteo.
- **Solo el modo `READ_WRITE`** (§18) poda. Puede orquestarse en el rollover diario de
  `state-history` sin crear un segundo reloj.
- Fechas siempre con `parseLocalDateKey`; nunca `new Date("YYYY-MM-DD")`.

---

## 13. Agregados permanentes y baseline

`baseline` congelado en el contenedor; `valor vivo = baseline + fold(retenidos)`.
`baseline` acumula lo consolidado: la captura de activación (§15.1) + cada lote podado
(§12). Candidatos a preservar: totales por `type`/`routineId`; desglose
`natural`/`early`; «días con ritmo»; tallies de `feedback.answered`.

**No se re-derivan desde eventos:** `history`, `weeklyStats`, `streak` siguen siendo
canónicos en `pace.state.v2` (§14). Los de `aggregates` son NUEVOS y complementarios.

---

## 14. Relación con `state-history`

`history.{days,months,years}`, `archiveDayToHistory`, `recomputeAllHistoryAggregates`,
`getHistoryWithToday`, `todayISO`/`parseLocalDateKey`
([`app/state-history.jsx`](../../app/state-history.jsx)). La capa de eventos
**encastra**, no duplica: el rollover `days→months→years` sigue siendo la fuente de
minutos por día; la poda reutiliza el disparador diario; «día con ritmo» debe casar
con el criterio de Stats (foco|respira|move>0; agua sola no cuenta, s69/s107).

---

## 15. Puente con datos anteriores (sin backfill ficticio)

**Conservar y puentear.** No se migra ni se borra ningún dato existente.

### 15.1 Activación y captura única del baseline (bajo exclusión del adaptador)
La captura ocurre **al inicializar el contenedor por primera vez, ANTES de permitir
emisión**, dentro de una mutación exclusiva del adaptador (§10):
1. adquirir exclusión (mecanismo del adaptador, §19);
2. releer el contenedor;
3. si `activatedAt` existe → **no** recapturar baseline;
4. si no existe → capturar `baseline` (p.ej. conteos de `routineFeedback` como tally
   inicial de `feedback.*`) y `activatedAt`;
5. escribir **ambos juntos** en el mismo contenedor;
6. releer y validar;
7. liberar exclusión; solo entonces habilitar emisión.
Solo eventos con `occurredAt > activatedAt` se suman al `baseline`. Tras un fallo sin
contenedor, se **reintenta la inicialización completa**. **Nunca se emite** antes de
verificar que el contenedor puede releerse. No se asume compare-and-swap ni exclusión
mutua del almacenamiento por sí mismo: la exclusión la provee el adaptador (§19).

### 15.2 Puente de `feedback`
Cada respuesta emite además `feedback.answered` (dual-write con
`recordRoutineFeedback`), orden canónico primero, evento después (§11).
`routineFeedback` se conserva como agregado y control de frecuencia. `later` NO emite
evento. La retirada de `routineFeedback` como fuente queda fuera de s117.

### 15.3 Deuda del puente heredada (P1) — REGISTRAR, no arreglar aquí
`nextRoutineFeedback` ([`app/state-feedback.jsx:52`](../../app/state-feedback.jsx))
usa `cur.yes||0` sin coacción; con un contador corrupto (`"3"`) concatenaría (`"31"`).
El contrato de normalización de agregados DEBE cubrirlo (entero finito ≥0). Arreglo
real: microfix junto a B2.3, no en s117.

---

## 16. Presupuesto lógico y retención (cross-runtime)

- **Límite lógico de producto: ~500 KB**, medido sobre el **JSON canónico serializado
  en UTF-8**:
  ```
  bytes = new TextEncoder().encode(JSON.stringify(container)).byteLength
  ```
  Fallback UTF-8 equivalente si `TextEncoder` no existe; **nunca** `string.length` ni
  UTF-16.
- Es un **límite lógico**: **no** es la capacidad física de SQLite, **no** presupone la
  cuota de `localStorage`, y sirve para que los **backups sean comparables** entre
  runtimes. El backend puede tener overhead físico adicional (§19).
- La medición se hace sobre el **contenedor/snapshot canónico final** antes de
  persistir.
- **Poda antes de escribir** al acercarse al límite (antigüedad primero, luego lotes
  más antiguos por encima de un suelo), consolidando en `baseline`.
- **Reintento acotado:** ante error de almacenamiento relevante, podar y reintentar
  **una vez**; si vuelve a fallar, **conservar el último contenedor válido** y
  devolver **error controlado** (sin bucle). No se silencia como
  `persistState()` de `pace.state.v2` (`catch(e){}`,
  [`state-core.jsx:363`](../../app/state-core.jsx)).
- **Prioridad:** agregados > eventos crudos.

---

## 17. Export / import canónico (común a todos los runtimes)

Web y Android comparten el **mismo formato JSON canónico**. El backup **NO** incluye
detalles físicos del backend (nombres de tablas, rutas, claves internas de
Preferences, info de plugin, locks, marcadores ya resueltos).

**Contenido del export:** `schemaVersion` · metadatos · `activatedAt` · `baseline` ·
eventos retenidos · agregados canónicos necesarios · `pruneCursor` · info de
compatibilidad.

**Semántica de import — REEMPLAZO TOTAL, sin merge:**
- `validateImport()` valida íntegro **antes** de tocar nada; si falla, **no** se
  modifica ninguna clave/almacén.
- `replaceFromImport()` reemplaza por completo; **no** mezcla ni deduplica.
  **Idempotente**: el mismo backup produce el mismo estado.
- Backup antiguo sin sección de eventos → reinicia el contenedor **vacío** (nuevo
  `activatedAt`), **previa confirmación explícita**; no conserva los eventos actuales.
- `reset()` vacía eventos; **no** toca el estado legacy (§19.2).
- **Entre almacenes no hay atomicidad** (§11): import/reset usan **marcador de
  operación** + orden de escritura + **recuperación idempotente** (§22), todo bajo la
  exclusión del adaptador. Un backup generado en web debe poder importarse en Android
  y viceversa si `schemaVersion` es compatible.

---

## 18. Matriz de capacidades

| Modo | Permite | Requisitos acumulativos |
|---|---|---|
| **`EVENTS_READ_WRITE`** | emitir, consolidar, podar, importar, resetear | runtime aprobado · exclusión disponible (§19) · almacenamiento persistente · adquisición correcta de la exclusión · inicialización + relectura válida |
| **`EVENTS_READ_ONLY`** | leer y exportar un contenedor existente | contenedor legible, pero sin exclusión fiable o runtime no habilitado para emitir |
| **`EVENTS_UNAVAILABLE`** | nada (subsistema deshabilitado) | no se puede acceder de forma fiable al almacenamiento |

`READ_ONLY` **NO** puede: emitir, capturar/sustituir baseline, consolidar, podar,
importar, resetear ni reparar con escritura. Estados **diagnósticos** internos
(sin PII): `events.read_write`, `events.read_only`, `events.unavailable`,
`events.lock_failed`, `events.storage_failed`, `events.recovery_required`. El
documento **no** obliga aún a diseñar UI nueva; si en el futuro una función visible
depende del log, debe **explicar** su indisponibilidad (p.ej. en standalone), no
fallar en silencio.

---

## 19. Adaptadores por runtime

Cada adaptador implementa el contrato EventStore (§10). El modelo canónico no cambia.

### 19.1 Adaptador Web / PWA
- Persistencia inicial: `localStorage` (clave propia `pace.events.v1`, fuera de
  `pace.state.v2`).
- **Exclusión: Web Locks** — `navigator.locks.request("pace.events.writer.v1",
  { mode:'exclusive' }, cb)`. **Toda** read-modify-write (activación/baseline,
  emisión, consolidación, poda, reset, import y su recuperación) se ejecuta **dentro**
  del lock.
- Atomicidad de una clave: `localStorage.setItem()` escribe el contenedor entero o no
  cambia nada (WHATWG Web Storage) → la RMW dentro del lock no deja «poda a medias».
- El evento `storage` se usa **solo** para refrescar/notificar a otras pestañas,
  **nunca como lock**.
- **Prohibido** cualquier fallback de exclusión basado en `localStorage`, evento
  `storage`, heartbeat, `BroadcastChannel`, `setTimeout` o elección manual de líder:
  comunican pestañas pero **no** dan exclusión mutua atómica. Si `navigator.locks`
  no existe → `READ_ONLY` o `UNAVAILABLE` (no se emite).
- Propiedad **por operación** (no liderazgo indefinido): solicitar lock → releer
  dentro del lock → validar/normalizar → una mutación → serializar + comprobar
  presupuesto → escribir → verificar si procede → liberar. Nunca leer antes del lock y
  escribir esa copia después, ni conservar copia mutable entre adquisiciones, ni
  asumir propiedad continuada, ni usar `storage` como confirmación de propiedad.

### 19.2 Adaptador `file://` (PACE_standalone.html)
- El **estado legacy sigue funcionando** cuando el navegador permita `localStorage`.
- **`pace.events.v1` NO emite en v1**: sin coordinación entre pestañas prometida; **no
  se usa Web Locks aunque el navegador lo exponga**; modo `READ_ONLY` o `UNAVAILABLE`.
- **El resto de la app NO pasa a solo-lectura** (ver §19.5). Servir el standalone por
  `localhost` puede activar el adaptador web en desarrollo; abrirlo como `file://` no.

### 19.3 Adaptador Android / Capacitor (runtime previsto)
Runtime independiente. **No** asumir: que `localStorage` sea persistencia duradera
(el WebView puede purgarlo); que `navigator.locks` esté en todas las versiones de
WebView; que Web Locks sea necesario si el backend nativo da transacciones; que el
origen `localhost` del WebView equivalga a la PWA.
- **Backend nativo persistente:** `@capacitor/preferences` para configuración pequeña,
  flags de migración y estado ligero; **SQLite** (o backend transaccional
  equivalente) para el **log `pace.events.v1`**. El plugin concreto se elige en el
  porting; las **garantías mínimas** se fijan aquí.
- **Garantías del backend Android:** append de evento **transaccional**; `id` único;
  consolidación y poda **transaccionales**; reemplazo de import **transaccional o
  staging+swap**; recuperación tras cierre forzado; persistencia entre reinicios;
  datos eliminados al desinstalar salvo export explícito; **sin** dependencia de
  eventos `storage`; **sin** dependencia obligatoria de Web Locks; **serialización de
  escritores en la capa nativa**.
- **Una única fuente de verdad por dominio** (§2.9): ajustes ligeros → Preferences;
  event log → SQLite; caché/UI efímera → memoria; estado legacy durante la migración →
  `localStorage` **solo como fuente de lectura inicial**, nunca 2ª fuente permanente.
  Prohibido escribir el mismo estado a la vez en `localStorage` + Preferences + SQLite.

### 19.4 Adaptador Extensión Chrome
Adaptador web **tras validación específica** (contexto y almacenamiento de la
extensión no son idénticos a una pestaña normal). Hasta validar: `READ_ONLY` o
`UNAVAILABLE`.

### 19.5 Alcance de la limitación (importante)
Deshabilitar la **emisión** de `pace.events.v1` **NO** convierte la app en
solo-lectura. En `file://` (y en cualquier modo sin `READ_WRITE`) siguen funcionando
por el sistema **legacy** existente: Foco, Respira, Mueve, Estira, Hidrátate, Caminos,
logros, ajustes y la persistencia actual cuando el navegador permita `localStorage`.
Solo queda deshabilitado el **nuevo registro de eventos** y cualquier función que
dependa **exclusivamente** de él. **No** se crean eventos «en memoria para guardarlos
después» (produciría semántica distinta y riesgo de duplicación).

### 19.6 Adaptador iOS / Capacitor (runtime previsto)
Runtime **independiente de Android**. Comparte con §19.3 el **mismo contrato
EventStore, las mismas garantías transaccionales, el mismo formato de export/import,
el presupuesto lógico y la retención**; la **implementación nativa puede diferir**.
**No** debe: caer al adaptador web; usar el `localStorage` de **WKWebView** como
fuente de verdad; depender obligatoriamente de Web Locks; escribir el mismo estado a
la vez en SQLite y `localStorage`; **asumir el mismo lifecycle que Android**.
- **Detección/selección explícita** del adaptador iOS vía la API de Capacitor (§20).
- **Persistencia:** `@capacitor/preferences` / UserDefaults para configuración
  pequeña y flags; **SQLite** nativo para `pace.events.v1`; memoria para lo efímero;
  `localStorage` **solo** como posible fuente legacy de migración; **una única fuente
  de verdad** por dominio.
- **Atomicidad (mismas garantías que Android, §19.3):** append/consolidación/poda
  **transaccionales**; `id` único; import por transacción o **staging+swap**;
  recuperación tras cierre forzado; persistencia entre reinicios; migración
  idempotente (§21); serialización de escritores en la capa nativa; export/import
  compatible con web y Android. **No** necesita Web Locks si el backend nativo provee
  exclusión y transacciones.
- El plugin SQLite concreto queda aplazado, con el **mismo contrato y garantías** que
  Android.

---

## 20. Detección de runtime y selección de adaptador

- La selección **no** se basa solo en `location.protocol`, `location.hostname`,
  `isSecureContext` ni en la mera presencia de `navigator.locks`.
- **Android e iOS (Capacitor)** se detectan por la **API de Capacitor** y capacidades
  reales, y **seleccionan explícitamente** el adaptador de su plataforma (Android o
  iOS). **No** deben caer por accidente al adaptador web porque la URL del WebView
  parezca `https://localhost`.
- `file://` selecciona el adaptador `file://` (§19.2), no el web.
- Ante ambigüedad o almacenamiento bloqueado (`SecurityError`): `UNAVAILABLE`, nunca
  un adaptador «adivinado».

---

## 21. Migración Android / iOS (idempotente y recuperable)

Fase de porting (no en s117):
1. detectar primera ejecución en Capacitor;
2. detectar estado legacy en el WebView;
3. adquirir la exclusión del adaptador Android;
4. leer y validar el estado legacy;
5. capturar el **baseline canónico**;
6. escribir en almacenamiento nativo;
7. releer y verificar;
8. marcar migración completada **en almacenamiento nativo**;
9. **no repetir** la importación;
10. conservar el origen legacy hasta confirmar éxito;
11. decidir después si se elimina o se conserva como backup.

Debe ser **idempotente** y **recuperable** tras cierre forzado; no duplicar baseline
ni eventos. **iOS sigue el mismo flujo** (detección Capacitor → estado legacy del
**WKWebView** → exclusión nativa iOS → baseline → almacenamiento nativo → verificación
→ marca de migración en almacenamiento nativo).

---

## 22. Lifecycle y recuperación

**Regla general:** toda operación que toque varios almacenes deja un **marcador de
operación** (con destino), escribe en orden y ofrece **recuperación idempotente** al
arrancar; si el marcador persiste, la operación quedó a medias → **reintentar desde la
fuente** (backup/estado previo) o **abortar a un estado conocido**, nunca continuar a
ciegas. En el adaptador web todo esto va **dentro del lock**; Web Locks serializa
pestañas cooperativas pero **no** convierte varios `setItem` en una transacción → el
marcador sigue siendo obligatorio.

**Riesgos y criterios (Android, además de los web):** app en segundo plano durante una
escritura · proceso destruido por el SO · restauración tras cierre forzado ·
actualización de la app · WebView actualizado aparte · almacenamiento temporal bajo
presión · orientación/recreación de Activity · import interrumpido · consolidación
interrumpida · reloj/zona horaria cambiados · dispositivo sin espacio. En todos, el
EventStore **se recupera sin duplicar** eventos ni baseline.

**iOS (diferencias, no idénticas a Android):** suspensión de **WKWebView** · proceso
eliminado por iOS · reapertura posterior · reinstalación de la app. **El EventStore no
debe depender de que JavaScript siga ejecutándose en segundo plano.**

---

## 23. Privacidad y amenazas

- **No transmite datos**: local-first, sin red, sin backend remoto, sin cuentas.
- **Sin PII**: `id`/`runId` son UUID locales opacos; **sin texto libre** ni contenido
  del usuario.
- **Siguen siendo datos privados de comportamiento** (no «no hay superficie de
  exfiltración»). **Riesgos residuales reconocidos:** XSS leyendo el almacenamiento,
  extensiones maliciosas, acceso físico, backups compartidos (OWASP HTML5: tratar el
  almacenamiento web como accesible ante XSS; minimizar lo guardado — que es lo que
  hace este esquema).
- **En alcance:** integridad/corrupción local (contenedor ilegible → se reinicia; fold
  idempotente; preservación de agregados).

---

## 24. Contratos de lectura futuros (solo lectura)

- **Stats premium:** `session.completed` (por rutina, `completionReason`, hora) +
  eventos de Camino.
- **Scoring v2 de `getSuggestedPath`** (señales §B3): hora +4 · favorito +3 · repetido
  hoy −4 · ayer −2 · duración compatible +3 · premium −10/teaser. Los eventos aportan
  «repetido hoy/ayer», «duración compatible» (perímetros §6.4) y repetición de Caminos.
- **«Qué te ayuda» premium:** `routineFeedback` + `feedback.answered` (ligado por
  `runId` a su `session.completed`).

Ninguno se implementa aquí.

---

## 25. Plan de implementación por fases

Regla de oro: **no se emite hasta que el adaptador del runtime esté en `READ_WRITE`**
(export/import/reset cableados, baseline capturado, exclusión resuelta).

**Fase 1 — Modelo canónico + adaptador web:** modelo canónico · contrato EventStore ·
adaptador web · Web Locks · baseline · export/import/reset (reemplazo total) ·
recuperación · pruebas multi-pestaña. Sin emisión.
**Fase 2 — Emisores web:** `session.completed`, `path.step.completed`,
`path.completed`, `feedback.answered` (dual-write), con `runId`/`pathRunId`.
**Fase 3 — Consolidación y consumidores web:** reducers de `aggregates`
(idempotentes) + encaje con `state-history` + normalización P1.
**Fase Android / iOS (Capacitor):** shell Capacitor · detección de runtime (§20) ·
adaptador nativo por plataforma (SQLite + Preferences/UserDefaults) · migración legacy
(§21) · lifecycle (§22) · export/import · pruebas en dispositivo real (Android +
TestFlight iOS). Android e iOS **comparten** esquema canónico, contrato EventStore,
formato de export, presupuesto lógico, retención y tests de compatibilidad; la
**implementación nativa puede diferir**.

> **No** instalar Capacitor (Android/iOS), crear el proyecto Xcode ni elegir plugin
> SQLite durante esta revisión documental. Fase 2 **no** emite si Fase 1 no termina en
> `EVENTS_READ_WRITE`.

---

## 26. Criterios de aceptación (de este DISEÑO)

- [x] Modelo canónico separado del backend; ningún `setItem`/`storage`/`navigator.locks`/SQLite como invariante universal (§5).
- [x] Contrato EventStore con resultados `committed`/`rejected`/`interrupted`/`unavailable` (§10).
- [x] Correlación tipada `runId`/`pathRunId` + cardinalidades (§7.1).
- [x] Duraciones sin «según el runner» + Caminos (§6.4).
- [x] `id` = UUIDv4 con fijado de bits en el fallback (§7.2).
- [x] Importación = reemplazo total validado, idempotente, sin merge; marcador + recuperación entre almacenes (§17, §22).
- [x] Comparador de poda canónico en un único lugar; `seq` fuera del cursor (§11, §12).
- [x] Presupuesto lógico UTF-8 vía `TextEncoder`, reintento único, conserva último válido (§16).
- [x] `timezoneOffsetMin` por fecha, con estacionalidad etiquetada (§7.3).
- [x] Activación/baseline única bajo exclusión del adaptador (§15.1).
- [x] Matriz de capacidades; `READ_ONLY` no importa/resetea/emite (§18).
- [x] Adaptadores web / `file://` / Android / **iOS** / extensión; `file://` no emite; app legacy intacta (§19).
- [x] Detección explícita de runtime; Android e iOS no caen al adaptador web (§20).
- [x] Migración Android e iOS idempotente y recuperable; lifecycle cubierto (§21, §22).
- [x] Export/import canónico común web↔Android, sin detalles físicos (§17).
- [x] **P0 single-writer RESUELTO por arquitectura de adaptadores (§29).**

---

## 27. Pruebas de aceptación (para la implementación)

**Web / multi-pestaña:** dos pestañas activan a la vez · dos emiten a la vez · una
espera mientras otra mantiene el lock · la segunda relee tras adquirirlo · cierre de
pestaña con el lock tomado · excepción dentro del callback (lock liberado) · import
interrumpido entre almacenes · recuperación tras marcador incompleto · `navigator.locks`
ausente → no emite · `localStorage` bloqueado → `UNAVAILABLE` · PWA instalada y offline
conserva `READ_WRITE` · extensión validada por separado.
**`file://`:** no emite eventos · la app legacy (Foco/Respira/Mueve/Estira/Hidrátate/
Caminos/logros/ajustes) sigue funcionando.
**Android:** los 11 riesgos de lifecycle (§22) sin duplicar eventos/baseline ·
migración idempotente (§21) · `localStorage` no tratado como durable · no cae al
adaptador web (§20).
**iOS:** suspensión de WKWebView · proceso eliminado por iOS · reapertura · **sin
depender de JS en segundo plano** · migración idempotente · no cae al adaptador web.
**Cross-runtime (import):** web→Android · Android→web · web→iOS · iOS→web · Android→iOS
· iOS→Android · importar dos veces = mismo estado · versión incompatible **rechazada
sin modificar** el almacenamiento; import de backup antiguo reinicia eventos con
confirmación.

---

## 28. No objetivos y decisiones aplazadas

**No objetivos:** código de app (s117 es solo diseño) · backend remoto/telemetría/red
· **multi-writer** de eventos (v1 es single-writer) · consumidor visible (Fase 5) ·
voz/TTS/porcentajes visibles · eventos históricos sin timestamp fiable · `runId`
ficticios · texto libre en eventos · **emisión de eventos en `file://`** (aplazada) ·
instalar Capacitor (Android/iOS), crear el proyecto Xcode o elegir plugin SQLite en
s117 · emitir en Android/iOS antes de su adaptador nativo.

**Aplazadas:** elección concreta del plugin SQLite (garantías ya cerradas, §19.3) ·
validación específica de la extensión (§19.4) · `achievement.unlocked` /
`hydrate.glass` (§6.2) · `event.voided` (correcciones) — hasta entonces no se afirma
«correcciones como eventos nuevos» · retirada de `routineFeedback` tras dual-write ·
normalización P1 (§15.3, junto a B2.3).

**Relación con B2.3 (siguiente prioridad tras s117):** migrar las 22 rutinas legacy al
contrato + reescribir 4 cues / 2 rutinas (candidato `move.couch.stretch.min` 5→6). No
se toca en s117.

---

## 29. Estado del P0 y matriz final de runtimes

**P0 single-writer — RESUELTO documentalmente**, porque:
- Web/PWA usa **Web Locks sin fallback inseguro** (§19.1).
- **`file://` no emite** (§19.2).
- **Android e iOS** se definen con **backend transaccional separado** (SQLite), no
  `localStorage` (§19.3, §19.6).
- El **contrato canónico no depende de `localStorage`** ni de una API de navegador
  (§5, §10).
- **Una única fuente de verdad** por dominio y runtime (§2.9, §19.3, §19.6).
- Android **e iOS no caen por accidente** al adaptador web (§20).

El plugin SQLite concreto queda como decisión de implementación futura **con sus
garantías mínimas ya cerradas** (§19.3).

**Matriz final de runtimes:**

| Runtime | Backend previsto | Exclusión / atomicidad | Escritura de eventos v1 |
|---|---|---|---|
| HTTPS / PWA + Web Locks | `localStorage` v1 | Web Locks | **Sí** (`READ_WRITE`) |
| `localhost` + Web Locks | `localStorage` v1 | Web Locks | **Sí** (desarrollo) |
| Extensión Chrome (validada) | adaptador web, por confirmar | Web Locks | Sí, tras validación |
| `file://` / standalone | legacy `localStorage` | sin garantía | **No** (`READ_ONLY`/`UNAVAILABLE`) |
| Android / Capacitor | **SQLite nativo** + Preferences | transacción nativa | **Sí**, cuando exista el adaptador |
| Android antes del adaptador nativo | ninguno | — | **No** |
| iOS / Capacitor | **SQLite nativo** + Preferences/UserDefaults | transacción nativa | **Sí**, cuando exista el adaptador |
| iOS antes del adaptador nativo | ninguno | — | **No** |
| Almacenamiento bloqueado / `SecurityError` | ninguno | — | **No** (`UNAVAILABLE`) |

> Android e iOS **comparten** esquema canónico, contrato EventStore, formato de
> export, presupuesto lógico, retención y tests de compatibilidad; sus
> **implementaciones nativas pueden diferir**.

---

## 30. Registro de la revisión

**rev. 2:** `runId`/`pathRunId`, perímetros de duración, `activatedAt`+baseline,
UUIDv4, reorden de fases, candidatos aplazados, privacidad honesta.
**rev. 3:** import = reemplazo total, correlación tipada, comparador de poda,
`TextEncoder`, zona horaria estacional, modelo single-writer (dejó 1 P0 abierto).

**rev. 4** (esta) — arquitectura por adaptadores + Android/Capacitor:

| # | Decisión | Resolución | Sección |
|---|---|---|---|
| A | Modelo canónico vs backend | Separación explícita A/B; nada de `setItem`/`storage`/`locks`/SQLite como invariante | §5 |
| B | Contrato EventStore | 13 operaciones + resultados `committed/rejected/interrupted/unavailable` | §10 |
| C | Matriz de capacidades | `READ_WRITE`/`READ_ONLY`/`UNAVAILABLE` + estados diagnósticos | §18 |
| D | Adaptador web | `localStorage` + **Web Locks** (sin fallback inseguro); propiedad por operación | §19.1 |
| E | Adaptador `file://` | No emite; legacy intacto; no Web Locks aunque exista | §19.2, §19.5 |
| F | Adaptador Android | SQLite (log) + Preferences (flags); garantías transaccionales; 1 fuente de verdad | §19.3 |
| G | Detección de runtime | Capacitor API + capacidades; Android no cae al adaptador web | §20 |
| H | Migración Android | 11 pasos idempotentes y recuperables | §21 |
| I | Lifecycle | Riesgos web + Android; marcador + recuperación idempotente | §22 |
| J | Export/import canónico | JSON común sin detalles físicos; web↔Android | §17 |
| K | Presupuesto | Límite **lógico** 500 KB UTF-8; no físico | §16 |
| L | Fases | Fase 1 web + fase Android/Capacitor propia; no emite sin `READ_WRITE` | §25 |
| M | P0 single-writer | **RESUELTO** por adaptadores → **APTO PARA CIERRE** (no se cierra en s117) | §29 |

**rev. 5** (esta) — **+iOS/Capacitor como runtime previsto**: adaptador nativo espejo
de Android (§19.6; mismo contrato EventStore, garantías transaccionales, export,
presupuesto y retención), detección explícita (§20), migración (§21) y lifecycle (§22)
propios de iOS, matriz (§29), fases (§25), criterios (§26) y pruebas (§27)
actualizados. **Sin** reabrir el modelo canónico ni el P0 single-writer. Sigue **APTO
PARA CIERRE**.
