# Sesión 116 — v0.60.0 · B2.2b-2 · feedback ligero «¿te ayudó esta pausa?»

**Fecha:** 2026-07-21
**Versión:** v0.60.0
**Rama/base:** `main` · parte de `0ac5707` (v0.59.0 · s115 B2.2b-1)

---

## Objetivo

Añadir un feedback **calmado y opcional** al terminar una pausa, coherente con
el tono PACE: una sola pregunta al finalizar, respuestas semánticamente
alineadas, siempre saltable, sin gamificación ni consumidor prematuro. Solo
**captura + almacenamiento** — el consumidor (Pausa PACE / «qué te ayuda»
premium) llega en fases posteriores. NO reabrir el GIRO (s113/s114) ni el
contrato B2.2b-1 (s115).

## Decisiones (AskUserQuestion, 5 — todas la recomendación)

| # | Decisión | Elegido |
|---|---|---|
| 1 | Módulos | Mueve + Estira + Respira, runner **v1 y legacy**; solo `stage:'done'`, fuera de Caminos |
| 2 | Datos | conteos completos `{yes, some, no}` (+`lastPromptDay`); `answered`/`helpScore` DERIVADOS, nunca persistidos; «Ahora no» no cuenta |
| 3 | Presentación | bloque discreto DENTRO del DONE (no pantalla nueva) |
| 4 | Consumidor | NINGUNO en s116 (solo almacenar) |
| 5 | Frecuencia | máx 1 vez por rutina y día local |

Nota: la decisión 2 **supera** el `{done, helped}` que figuraba literal en
`DECISIONES_PRODUCTO.md §B2` — los conteos completos conservan la señal «Un
poco» y dejan `helpScore` como derivación, no como dato fijado.

## Qué se hizo

### Captura + almacenamiento (P0)

- **`app/state-feedback.jsx`** (NUEVO, 90 ln) — slice `routineFeedback` bajo
  `pace.state.v2`: `{ [routineId]: { yes, some, no, lastPromptDay } }`.
  - `nextRoutineFeedback(prev, id, resp)` — helper **PURO**: no muta `prev`,
    devuelve el slice siguiente; escribe `lastPromptDay=todayISO()` en toda
    respuesta válida (incluida `later`); solo `yes|some|no` incrementan su
    contador; entrada inválida (id vacío / respuesta desconocida) → devuelve el
    slice tal cual.
  - `recordRoutineFeedback(id, resp)` — acción pública: `setState` con updater
    **FUNCIONAL** (sin side-effects dentro del updater); sanitiza a
    `yes|some|no|later`, rechaza id vacío.
  - `shouldPromptRoutineFeedback(id)` — `true` si `lastPromptDay !== todayISO()`
    (lectura defensiva: state sin slice → `true`).
  - `answered = yes+some+no` y `helpScore = (yes+some*0.5)/answered` se DERIVAN,
    nunca se persisten.
- **`routineFeedback: {}`** en `defaultState` (state-core) → merge
  `{...defaultState, ...parsed}` cubre instalaciones pre-s116 sin migración.
- Re-export en `state.jsx` + orden de carga en `PACE.html` (tras state-core y
  state-history —que exponen `todayISO`—, antes de state.jsx).

### UI del feedback

- **`app/ui/SessionFeedback.jsx`** (NUEVO, 177 ln) — `routineId` + `kind` +
  `accent`. Pregunta «¿Te ayudó esta pausa?» + 3 respuestas de igual peso
  (Sí · Un poco · No) + «Ahora no» ghost secundario; al responder (o «Ahora
  no») la fila se sustituye por el acuse EFÍMERO «Gracias». Sin emojis, sin
  porcentajes. Filete decorativo, chips con hover al acento del módulo (via
  `--pace-fb-accent`), CSS responsive propio.
  - **Gate por-día capturado en el mount** (`useState(() =>
    shouldPromptRoutineFeedback(id))`): no reactivo, así el acuse «Gracias» no
    desaparece cuando `recordRoutineFeedback` escribe `lastPromptDay` (que haría
    `shouldPrompt` pasar a `false`). Si el gate es `false` → render `null`.
  - **Idempotencia**: `lockRef` (guard SÍNCRONO) bloquea reenvíos antes del
    re-render + `disabled` en los chips; al decidir, el bloque se sustituye por
    «Gracias» (los controles dejan de existir).
- **`SessionDone` gana un slot `feedback`** (afterContent, bajo el copy). Los 3
  runners lo rellenan con `feedback={inPath ? undefined : <SessionFeedback …/>}`
  → **nunca dentro de Caminos** (`PathFocusStep` tampoco lo pasa).

### Guard de teclado (P0) — MoveSessionV1 + MoveSessionLegacy + BreatheSession

Los 3 interpretaban `Enter` en `stage:'done'` como salir. Con botones de
feedback, el atajo global de DONE se IGNORA (helpers `sessionKeyOnControl` /
`sessionDoneKeyBlocked` en SessionShell) si:

- el foco está en un control:
  `event.target.closest('button,a,input,select,textarea,[contenteditable="true"]')`
  (**`closest`, no `matches`** — el target puede ser un `<span>` hijo del botón);
- `event.isComposing` (IME); `event.defaultPrevented`; modificadores Ctrl/Meta/Alt.

El CTA/chip se activan por su propio `onClick` — el guard solo evita una SEGUNDA
salida desde el listener global. Espacio tampoco se roba a un control con foco
(activación nativa en vez de `preventDefault`). `Enter` fuera de un control sigue
cerrando el DONE (comportamiento original intacto).

### Shell / layout

- **CSS responsive del shell EXTRAÍDO** a `app/ui/SessionShell.responsive.js`
  (NUEVO, IIFE idempotente) → SessionShell.jsx **495→336 ln** (sale del borde de
  500 antes de añadir el slot; regla CLAUDE.md).
- En el tier **`≤430`** de altura, el **HERO decorativo del done se oculta**
  (paso 2 del orden de compactación del corte) para que la fila de feedback y el
  CTA quepan sin que el footer tape «Ahora no». La pregunta, las respuestas,
  «Ahora no» y el CTA NUNCA se ocultan; el centro scrollable = red de seguridad.
- El responsive del propio bloque de feedback vive en `SessionFeedback.jsx`.

### i18n

- `session.feedback.{question,yes,some,no,later,thanks}` ES+EN, explícitas.

## Verificación (dev :8765 + standalone; SW purgado + reload mismo gesto)

- **Aparece** en el done de **v1** (`extra.desk.pushups`), **legacy**
  (`extra.chair.dips`, `move.desk.quick`) y **Respira** (`breathe.rounds.express`,
  acento `var(--breathe)`). Responder registra + «Gracias»; «Ahora no» (`later`)
  registra `lastPromptDay` sin sumar conteo; NO aparece en rutina ya respondida
  hoy (gate en done real) ni tras «× Salir».
- **Teclado**: guard verificado con eventos reales — `Enter` sobre un chip NO
  cierra ni duplica (feedback intacto); `Enter` fuera de un control cierra;
  `Escape` cierra; **doble clic no duplica** (`move.wrists {no:1}`, no 2 — guard
  síncrono). El inyector CDP entrega `key:""` para Enter/Space, así que la
  activación nativa de botón se validó por clic de ratón + el helper puro.
- **Persistencia**: `routineFeedback` en pace.state.v2 sobrevive a la recarga;
  un state **pre-s116 sin el slice** → `{}` sin romper; grabación funciona tras
  el merge.
- **Layout** re-medido: 1280×600 · 1024×512 · 360×640 sin scroll; **844×390**
  cabía con «Ahora no» tapada por el footer → se ocultó el hero en ≤430 →
  ahora todo cabe sin scroll (pregunta/respuestas/«Ahora no»/CTA visibles, sin
  scroll horizontal).
- Consola limpia (solo marcadores), sin `[i18n] missing` ES+EN, sin «Element
  type»/«Cannot update». Contrato s115 intacto (tarjetas con rango, capas, lado
  integrado). Legacy byte-idéntico salvo el render del DONE + guard de teclado.
- **Standalone** regenerado UNA vez (3166 KB, 86 scripts compilados) y verificado
  (monta v0.60.0, globales presentes, CSS inyectado, legacy registra
  `move.wrists`, consola limpia). Backup `v0.59.0_20260721` (rotado
  `v0.39.0_20260708`, cap 20). Bump ×3 (PACE_VERSION/título/CACHE_NAME).

## Archivos

**Nuevos (3):** `app/state-feedback.jsx` · `app/ui/SessionFeedback.jsx` ·
`app/ui/SessionShell.responsive.js`.
**Editados:** `app/ui/SessionShell.jsx` (slot + guards + CSS fuera; 336 ln) ·
`app/state-core.jsx` (defaultState + PACE_VERSION) · `app/state.jsx` (re-export)
· `app/i18n/strings/sessions.js` (6 keys ES+EN) · `app/move/MoveSessionV1.jsx`
(guard + slot; 495 ln) · `app/move/MoveModule.jsx` (legacy: guard + slot) ·
`app/breathe/BreatheSession.jsx` (guard + slot) · `PACE.html` (orden de carga +
título) · `sw.js` (CACHE_NAME).

## Pendiente / siguiente

- **B2.2b-3 eventos** (solo diseño) → **B2.3** (migrar las otras 22 rutinas al
  contrato + reescrituras; candidato de contenido `move.couch.stretch.min` 5→6,
  hallazgo del dev-check s115).
- El **consumidor** del feedback (Pausa PACE / recomendador scoring v2 / «qué te
  ayuda» premium) queda para su fase — hoy solo se almacena.
- Deuda de proceso conocida (no de esta sesión): commits unsigned + `main` sin
  protección. `MoveSessionV1.jsx` a 495 ln (margen justo).
- Nota heredada: validar PWA en navegador real (desde s102); diagramas 2 poses
  (los itera el usuario).
