# HANDOFF · s170 — Fase 3: los emisores de `pace.events.v1`

**Punto de partida limpio.** `main` en `2679377`, árbol sin cambios, CI verde,
`npm run verify` PASA, `npm run test:e2e` **95/95**, versión **v0.99.1** en los 7
sitios, `PACE_standalone.html` intacto en v0.71.0.

> **El ESTADO vive en [`STATE.md`](../STATE.md) → «Diferido», no aquí.** Este
> documento es el **plan de trabajo** de la Fase 3: lo que ya está medido para no
> volver a medirlo, lo que sigue sin decidir, y las trampas que costaron tiempo.
> Si los dos se contradicen, gana `STATE.md`.

---

## 0 · Por qué esta fase y no otra

De las 15 fases del «Camino a v1.0», **ésta es la única cuyo valor caduca**: el
ROADMAP lo dice literal — *«el histórico que no se emite no se reconstruye»*.
Cada día que la app corre sin emisores es un día que nadie va a poder mirar
nunca, ni tú ni quien la use.

Y desemboca en lo que hace la app **worth paying for** según el propio plan: la
**Pausa PACE** (Fase 3.5), que en vez de listar módulos recomienda una acción
concreta — *«llevas 50 minutos sentado, te propongo Hombros ligeros, 4 minutos,
sin material»*. Eso responde al problema D del feedback beta («sé que debería
parar, pero no sé qué me conviene») y **necesita hechos, no contadores**.

De paso, el feedback «¿te ayudó esta pausa?» lleva **capturándose desde s116 sin
un solo consumidor**.

---

## 1 · Lo que ya está hecho (no rehacer)

- **Fase 1 del esquema, cerrada en s155**: modelo canónico, adaptador web, Web
  Locks, baseline, export/import/reset, recuperación, pruebas multi-pestaña.
- **La condición de entrada, en v0.99.1** (`e95ff75`): el backup **lleva** la
  sección de eventos **y la devuelve** al importar, con la sección corrupta
  abortando el import entero. 3 tests en `tests/eventos-backup.spec.js`.
- **El store se inicializa solo**: `paceEventsBoot()` corre al cargar el módulo
  (`events-store.js`). No hace falta cablear nada en el arranque — comprobado, y
  yo mismo me equivoqué al principio creyendo lo contrario porque el `grep`
  excluía `app/events/`.

---

## 2 · PASO 1 · Contabilidad de pausa para Mueve y Estira

**Es un prerrequisito, no parte del emisor, y es producto.**

El payload de `session.completed` exige `activeSeconds`. Y las dos familias no
están al mismo nivel:

| | tiempo activo | de dónde |
|---|---|---|
| **Respira** | **sí** | `activeMsRef` desde s98 (`BreatheSession.jsx:50`), acumula ms activos entre pausas |
| **Mueve / Estira** | **NO** | sólo un booleano `paused` y un `sessionStart`: reloj de pared **con las pausas dentro** |

Y `realMin` sale de `Math.max(1, Math.round(...))` — **redondeado y con suelo de
1 minuto**. Sirve para sumar a la semana; **no sirve como hecho**.

**Lo que NO se puede hacer**: poner `activeSeconds = elapsedSeconds`. Es mentira
en cuanto alguien pause, y el consumidor de este campo es el recomendador de la
Fase 3.5 — un campo inventado lo envenena, y no hay forma de saber después
cuáles eran inventados.

⇒ **Replicar el patrón de `activeMsRef` en `MoveSessionV1.jsx`** (y ver si
`MoveModule.jsx` lo necesita también, que es el camino legacy). Es un cambio
pequeño y contenido, pero **cambia lo que la app sabe**, así que merece su test.

---

## 3 · PASO 2 · Los emisores

### La superficie, medida: 6 llamadas en 5 archivos

| llamador | hoy pasa |
|---|---|
| `BreatheSession.jsx:248` | `routine.id`, `activeMin`, `holdSec` |
| `FocusTimer.jsx:43` | `'home'` |
| `MoveModule.jsx:97-98` | `routine.id`, `realMin` (`extra` / `move`) |
| `MoveSessionV1.jsx:73-74` | `routine.id`, `realMin` (`extra` / `move`) |
| `PathFocusStep.jsx:33` | `'path'`, `{ minutes }` |

Más `feedback.answered` en `state-feedback.jsx` y `path.step.completed` /
`path.completed` en `state-paths.jsx`.

### DECISIÓN TOMADA: el emisor va en la CAPA DE ESTADO

Las funciones `complete*` (`state-timer.jsx`, `state-achievements.jsx`) ganan un
argumento opcional con lo que pide el payload y **emiten junto a la escritura
legacy** (el *dual-write* del esquema).

Por qué ahí y no en la UI: **un punto de emisión por módulo en vez de seis
repartidos** por componentes, y es lo que hace auditable el gate del `verify`,
que cuenta emisores fuera de `app/events/`.

### Los cuatro tipos y lo que exige cada uno

`events-payloads.js` es la única fuente de la forma. Resumen:

- `session.completed` — `runId` **requerido** · `module`, `routineId`,
  `completionReason` (`natural`|`early`), `elapsedSeconds`, `activeSeconds`,
  `plannedSeconds` + `plannedSecondsSource`, `variant`.
  **Ojo**: `plannedSeconds` y su origen **viajan juntos**; si uno es `null`, el
  otro también.
- `feedback.answered` — `runId` requerido · `routineId`, `module`, `response`
  (`yes`|`some`|`no`). **`later` NO emite** (§15.2).
- `path.step.completed` — `pathRunId` requerido · `pathId`, `stepIndex`, `stepKind`.
- `path.completed` — `pathRunId` requerido, `runId` **prohibido** · `pathId`, `stepsCount`.

---

## 4 · Lo que sigue SIN decidir

1. **De dónde sale `runId`.** Es requerido en `session.completed` y
   `feedback.answered`, y tiene que ser **el mismo** en los dos para que el
   feedback se pueda correlacionar con su sesión. Hoy no existe: hay que
   crearlo al empezar la sesión y hacerlo llegar hasta el feedback.
2. **De dónde sale `plannedSeconds` y cuál es su `source`** (`preset` /
   `derived` / `declared`). Foco es `preset` (25 min elegidos); Mueve/Estira
   probablemente `declared` o `derived` de los pasos. Hay que mirarlo, no
   suponerlo.
3. **Cómo se deriva `completionReason`.** ¿Qué llama a `complete*` hoy cuando
   alguien sale a mitad? Si sólo se llama al terminar de verdad, `early` no se
   emite nunca y hay que decidir si eso está bien o falta un camino.
4. **`context`: `standalone` vs `path`.** `completeFocusSession('path', …)` ya
   distingue; hay que mapearlo al `context` del evento y al `pathRunId`.

---

## 5 · Trampas que ya costaron tiempo

- **`git checkout` restaura al ÚLTIMO COMMIT, no a hace un minuto.** Un script
  de calibración devolvió dos archivos a HEAD y **borró la implementación
  entera**; los tests salieron rojos por ausencia de producto, no por el aserto.
  **Si la línea base no está committeada, se restaura desde una copia del
  scratchpad.**
- **La suite E2E carga `index.html`, no las fuentes.** Toda mutación de
  calibración necesita `node build-standalone.js` antes de correr el test — y
  `git checkout -- PACE_standalone.html` después, porque el build reescribe los
  dos artefactos y el `verify` sólo restaura alrededor de **su** pasada (s162).
- **Comparar un documento que la app también escribe no prueba nada.** Un aserto
  que comparaba `pace.state.v2` entero contra una foto de antes salió **rojo con
  el producto sano**: la app normaliza y re-persiste su estado al arrancar. Hay
  que mirar **los campos que el cambio habría tocado**.
- **Una espera que sólo aguarda el desenlace bueno da timeouts mudos.** Con el
  producto roto sale `Timeout 15000ms exceeded` en vez del aserto que explica
  qué pasó. Esperar a que el estado **CAMBIE**, o correr **los dos desenlaces**.
- **El `verify` tiene un gate con fecha de caducidad ya satisfecho**: en cuanto
  aparezca un emisor fuera de `app/events/`, exige que `TweaksData.jsx` lleve
  `paceEventsExport`. Ya lo lleva (v0.99.1), así que el primer emisor no puede
  pillarte — pero no lo quites.

---

## 6 · Cabo suelto, ajeno a esta fase

**El camino de FALLO de caché del CI no se ha ejercitado nunca** sin
`--with-deps`. Los tres runs de verificación fueron aciertos. Sólo ocurre al
cambiar `package-lock.json`. Se fuerza con `gh cache delete` más un
`workflow_dispatch`: un run, reversible, la caché se reconstruye sola.
**Requiere permiso del usuario** — borra algo en su repo y gasta un run.

---

## 7 · Y lo demás que sigue vivo

Los **19 glifos de logro** sin dibujar (el encargo ya dice la verdad y el
equinoccio es Prioridad 1) · los **20 glifos de ejercicio** de la ola B de la
Fase 2, cuyo mecanismo de ingesta **lleva listo desde s166 y nunca ha corrido
sobre arte real** — con dos o tres dibujos de verdad se estrena antes de
invertir en los veinte · el **tirón del arco** · **D3** · **Wrangler** ·
**proteger `main`**.
