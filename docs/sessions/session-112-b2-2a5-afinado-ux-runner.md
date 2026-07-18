# Sesión 112 — B2.2a.5: auditoría UX del runner + corte de afinado (v0.56.0)

**Fecha:** 2026-07-18
**Versión:** v0.55.0 → v0.56.0
**Bloque:** B2.2a.5 (B2.2b EN PAUSA por decisión del usuario, commit `22c5fd4`)
**Gobernada por:** `docs/product/CONTEXTO_UX_RUNNER_WELCOME.md` (contexto de
producto del usuario; NO orden de implementación — todo se contrastó en runtime
y se aprobó antes de código).

---

## 1 · Formato de la sesión

Dos fases, según el protocolo pedido por el usuario:

1. **Auditoría** (sin tocar código): runtime de los pilotos en 5 viewports +
   mapa de estados + evaluación del placement gate + jerarquía visual +
   auditoría de Welcome + deudas. Entregable completo con evidencia medida.
2. **Corte aprobado** (AskUserQuestion, 3 preguntas agrupadas):
   - Setup → **`setup: none | auto | ready`** (aprobado, recomendado)
   - Dirección visual → **B · Equilibrada** (aprobado, recomendado)
   - Alcance → **runner + micro-fix Welcome** (aprobado, recomendado)

Nota de entorno: el capturador de screenshots del pane embebido no funcionó en
toda la sesión (timeout) → la evidencia de auditoría es **geometría medida por
DOM** (getBoundingClientRect, scrollHeight, visibilidad computada), igual de
verificable. Los clicks de verificación se hicieron vía DOM por la misma razón.

## 2 · Auditoría — hallazgos principales (evidencia en runtime v0.55.0)

### P1 (bloqueaban comprensión)

1. **Acción primaria recortada sin scroll** en alturas <~630px (1280×600:
   «Terminé» en y=590-629; overlay `fixed` con `overflow visible`, sin
   contenedor scrollable). Afectaba a TODOS los runners (v1 y legacy) y a
   landscape móvil.
2. **El copy funcional del método estaba oculto en móvil**: `repsHint` («Haz
   menos si lo necesitas»), `placeHint` y `sideNext` («Ahora: Derecha»)
   viajaban en el hint del shell, y `@media (max-width: 640px)` lo esconde
   (SessionShell responsive, regla pre-v1 pensada para «Espacio pausar · Esc
   salir»). El objetivo suave y el lado siguiente solo existían en desktop.
3. **Cambio de lado sin lado destino en móvil** (consecuencia del anterior):
   «Cambia de lado … Listo» a secas.

### P2

- «PASO X DE N» duplicado (header Meta + kicker idénticos).
- Glifo = sello 72px (SVG 44px): identifica, no enseña.
- Gate visualmente idéntico al timer de trabajo (mismo slot 72/128px; solo
  cambia una etiqueta de 10px).
- En `place` de un perSide no se anunciaba el lado inicial.
- 5s uniformes para colocaciones de suelo (Flexor de cadera, WGS) — el caso
  `ready` del contexto de producto.
- 3 toasts de logro apilados sobre la ceremonia de SessionDone.
- Series invisibles (desk.pushups «3 series» → «PASO 1..5 DE 5») — registrado,
  se resuelve con metadatos en B2.2b-1.
- Duración declarada 2 min vs real 3-5 min — confirmado en runtime, alcance
  B2.2b-1.

### P3 (registrados, no tocados)

- «ANTÍDOTO COMPLETADO» hardcodeado como meta de done para toda rutina v1.
- Legacy y v1 casi indistinguibles en pantalla (síntoma raíz del diagnóstico).
- Tarjetas de biblioteca = `div` sin role/tabindex (sin teclado); onboarding
  sin focus trap (deuda a11y, sesión propia).

### Welcome (= onboarding s106)

Cumple sustancialmente el contrato «Entiendo → Me sirve → Empiezo»: titular
promesa, CTA único, saltable, una sola vez, sin permisos, continuidad con Home,
cabe en 375×812 y 360×640 (medido). Único defecto: la pregunta 1 desbordaba
~35px en 360×640 antes de seleccionar (P3). → micro-fix aprobado.

## 3 · Qué se implementó (corte aprobado)

### `setup: 'ready' | número` (MoveSessionV1.jsx)

- `setup: 'ready'` por paso → fase `place` **sin cuenta**: kicker «Colócate»,
  cue, «Empiezas por: {lado}» si es perSide, y única primaria **«Estoy listo»**
  que pasa DIRECTO a `work` (sin segunda cuenta — el botón ES la
  confirmación). Aplica en cualquier `mode` e incluso en el paso 0 (salta la
  herencia del prep).
- `setup: número` → segundos del gate automático (sustituye los 5 default).
- Sin `setup` → derivación por `mode` de s111 intacta (auto en `timed`/
  `perSide` idx>0; none en `reps`/`rest`/paso 0).

### Jerarquía B (MoveSessionV1.jsx + MoveModule.jsx + SessionShell.jsx)

- **Kicker único**: «PASO X DE N» vive SOLO en el header; el kicker del cuerpo
  se reserva a información del momento (Colócate / Izquierda / Derecha /
  Cambia de lado). El rest pierde el kicker «DESCANSO» (el h1 ya lo dice).
- **Copy funcional visible**: `repsHint`/`placeHint`/`placeReadyHint` y
  `sideFirst`/`sideNext` se renderizan en el contenido central (support +
  supportStrong en acento). El hint del shell vuelve a ser solo atajos de
  teclado.
- **Gate con identidad propia**: el número de colocación baja a 56px en
  `--ink-2` (sin `data-pace-move-timer`) — ya no se confunde con el timer.
- **Glifo escalado**: `StepGlyph` gana prop `size`; el v1 lo calcula por
  altura de viewport (~150-240px; SVG interior ×2.2). El default 72/44 deja el
  legacy idéntico. (El visual instructivo REAL — diagrama de dos poses — se
  diseña aparte contigo, regla D-4; candidatos propuestos: Flexiones
  inclinadas y Flexor de cadera.)
- **Una primaria con peso**: el botón primario va RELLENO del acento
  (`background: stepAccent`); Anterior/Pausar/Más tiempo siguen outline.
- **h1 fluido** (`clamp(30px, 6.5vh, 52px)`) + espaciados compactados.
- **SessionShell**: `center` pasa a `minHeight:0 + overflowY:auto` con wrapper
  `data-pace-session-center-body` (`margin:auto` centra cuando cabe, alinea
  arriba cuando desborda) → **el footer con la acción primaria queda SIEMPRE
  accesible** en cualquier altura. Beneficia a los 4 tipos de sesión + legacy.
- **Toasts aplazados en sesiones sueltas**: MoveSessionV1 reutiliza
  `setCaminoUiActive` (regla s105) con guard `!inPath` (dentro de un Camino lo
  gobierna PathRunner). Los logros de completion aparecen al volver a la home,
  no sobre la ceremonia.

### 5º piloto + datos (ExtraModule.jsx)

- `chair.antidote`: `setup:'ready'` en **Flexor de cadera** y **World's
  greatest stretch** (suelo).
- **`move.couch.stretch` = 5º piloto** (estiramiento estático pared/suelo,
  premium): s0 Flexor `perSide 25 ready` · s1 Couch `perSide 30 ready` ·
  s2 90/90 `timed 60` · s3 Pigeon `perSide 30` · s4 Puente `timed 60`. Los
  cues pierden «30s por lado» (lo lleva el runner); EN espejado. **Solo se
  añaden campos** — los EN posicionales sN no se reindexan.

### i18n (strings/sessions.js)

3 keys ES+EN: `session.imReady` («Estoy listo»), `session.sideFirst`
(«Empiezas por: {side}»), `move.placeReadyHint` («Sin prisa · el ejercicio
espera a que estés en posición»).

### Welcome micro-fix (Onboarding.jsx + OnboardingScreens.jsx)

column paddingBottom 30→16 · options gap 10→8 · chip padding 13/18→11/16
(~36px recuperados). Verificado: la pregunta 1 cabe en 360×640 (584/584).

## 4 · Verificación

**Dev (localhost:8765, consola limpia):**
- `neck.3` 360×640: kicker único · «Haz menos…» VISIBLE · gate auto con
  «Empiezas por: Izquierda» · change con «Ahora: Derecha» · todo cabe.
- `chair.antidote`: paso 2 gate auto · paso 3 Flexor = `ready` sin cuenta,
  «Estoy listo» → directo al reloj del lado izquierdo.
- `couch.stretch` (flag premium temporal en localStorage del perfil dev,
  restaurado a false al terminar): paso 0 `ready` pese a ser el primero ·
  lados/changes correctos · paso 2 `timed` con gate auto.
- `desk.pushups`: reps + support visible · rest sin kicker duplicado.
- **1280×600**: primaria visible (y=560≤600) y centro scrollable (P1 resuelto).
- Legacy `desk.quick`: idéntico a s109 (glifo 44px, misma pantalla) + hereda
  el fix de footer.
- Respira (Diafragmática): renderiza y centra bien sobre el shell modificado.
- Toasts: 0 sobre SessionDone, aparecen al volver a la home.

**Standalone** regenerado UNA vez al cierre (3105 KB, sanity OK): título
v0.56.0, gate `ready` funcional en chair.antidote, consola limpia.

## 5 · Diseñado SIN implementar (para B2.2b re-ordenado)

- Esquema mínimo de metadatos + duración derivada (B2.2b-1, con los 5 pilotos).
- Eventos con `schemaVersion` (B2.2b-3, solo documento).
- Migración `step.id/nameKey/visualId` y EN posicionales → con el contrato.
- `discrete` NO se introduce (preferir `execution.mode` + `completion`).
- Diagramas de dos poses: los itera el usuario (D-4); pilotos propuestos
  Flexiones inclinadas + Flexor de cadera.

## 6 · Deuda registrada (nueva o confirmada)

- SW en dev puede servir versión vieja (fricción de entorno) → sesión propia.
- A11y: tarjetas de biblioteca sin teclado; onboarding sin focus trap.
- «Serie X de Y» no existe como concepto (metadatos B2.2b-1).
- `session.antidoteDone` como meta de done universal del v1 (P3).
- Timer de Move sigue `setInterval` decremental (foreground, aceptado s111).
