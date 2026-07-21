# Sesión 118 — B2.3 · migración de rutinas legacy al contrato v1 (OLA 1)

**Fecha:** 2026-07-22
**Tipo:** sesión de CÓDIGO (bump + build), a diferencia de la solo-docs s117
**Versión:** v0.60.0 → **v0.61.0**
**Base git al arrancar:** `main`, HEAD `220a15a` (s117 · docs de eventos), árbol limpio

---

## 1. Objetivo y alcance

Corte **B2.3 (OLA 1)**: primera ola de migración de rutinas **legacy** de Mueve al
**contrato de pasos v1** (s115), gobernada por `BASE_MUEVE_ESTIRA.md`. Principio
rector: **migrar CONTENIDO al contrato existente, NO rediseñar el runner**. El GIRO
del runner (s113/s114), el contrato B2.2b-1 (s115), el feedback B2.2b-2 (s116) y el
DISEÑO de eventos B2.2b-3 (s117) están CERRADOS y no se reabren. La capa de eventos
**no se implementa** aquí (fases futuras).

**Decisiones de arranque** (AskUserQuestion, todas la recomendación):
tamaño de ola = **5–6 rutinas** · orden = **Mueve primero** · reescrituras (4 cues
+ 2 rutinas) = **aparte, su propia ola** · candidato `couch.stretch.min` 5→6 =
**ahora** · glifos D-4 = **no tocar**. Lista exacta confirmada tras proponerla.

---

## 2. Qué se migró (5 rutinas Mueve, todas gratuitas, sin suelo)

Todas en `app/move/move.data.js` (dato ES) + `app/i18n/content/move.js` (claves EN):

| id | min | modos por paso | notas |
|---|---|---|---|
| `extra.chair.dips` | 3 | reps·rest·reps·rest·reps | gemelo de `desk.pushups`; rest `betweenSets` |
| `extra.calves` | 1 | reps·reps | tempo {1,0,1}=2 s (cadencia rápida controlada) |
| `extra.grip.squeeze` | 1 | reps·reps·timed | wrist stretch `timed` (dos manos, sin lado) |
| `extra.glutes.stealth` | 2 | reps·rest·timed·reps | descanso suave (sin `betweenSets`) + aguante isométrico `timed` (BASE §D) |
| `extra.posture.set` | 2 | reps·reps·timed·timed | control postural (chin tucks/scapular con retención) + movilidad `timed` (§B) |

**Cada paso migrado recibió** (mecánico): `mode` + `instruction:{setup,action,care}`
(consolida el `cue` legacy → `action`; `setup` de colocación en el 1er set de
fuerza → colocación AUTO; `care` con la adaptación/seguridad ya implícita) +
`tempo`/`completion:{mode:'guided'}` en reps + `restKind:'betweenSets'` en los rests
entre series de fuerza + 5 metadatos (`position/equipment/requiresFloor/intensity/
level`, **sin `discrete`**). Claves EN nuevas `id.sN.instruction.{...}` con el mismo
valor traducido; `id.sN.cue` retiradas. **Ningún `name` cambió** → glifos intactos
(los pasos sin glifo siguen con DefaultGlyph, cola D-4 sin tocar).

**Candidato de contenido:** `move.couch.stretch.min` 5→6 en `ExtraModule.jsx` (el
dev-check s115 calculaba 6–7 min y 5 quedaba fuera del rango; único piloto
descuadrado, ahora alineado).

**Duración:** con los tempos elegidos, cada rutina conserva su `min` DENTRO del
rango derivado por `estimateDuration` (verificado). Sin `min` que se moviera en la
ola.

---

## 3. Lo que NO se tocó

- Las **7 rutinas Mueve restantes** (premium: push.ladder, hang.bar, core.stealth,
  wall.sit, core.plank + `legs.single` a reescribir) siguen **LEGACY byte-idénticas**
  (sin `mode`, `cue` intacto).
- Las **14 rutinas de Estira** (menos el candidato de 1 número en el piloto
  `couch.stretch`) sin cambios; su migración va en olas siguientes.
- Runner / contrato / feedback / eventos: no reabiertos.
- `MoveSessionV1.jsx` (runner): sin cambios (deuda de tamaño intacta, 495 ln).

---

## 4. Verificación (dev + standalone)

- **dev-check `v1DevCheckDuration`** en el mount del runner: `chair.dips` «declarado
  3min vs calculado 190–190s (rango 3–4min) — dentro» y `posture.set` «2min vs
  168–168s (2–3min) — dentro». Los 5 dentro de rango vía `estimateDuration` (dev y
  standalone).
- **Tarjetas de la biblioteca**: las 5 migradas muestran el **rango derivado**
  (3–4 / 1–2 / 1–2 / 2–3 / 2–3 min); las legacy siguen con `min` único (p. ej.
  «Espalda de oficina · 3 min»).
- **`chair.dips` de principio a fin**: reps con cadencia + «de 12 reps» + capa
  «Cuídate» + rest `betweenSets` + pantalla **«Movimiento completado»** con stats
  honestas (Tiempo/Series/Reps por `repsGuidedRef`) + bloque **«¿Te ayudó esta
  pausa?»** (fuera de Caminos, por `routine.id`) → registrado
  `routineFeedback['extra.chair.dips']={yes:1}`; completion acreditó minutos y
  logros (sin crash de Toast).
- **`posture.set`**: reps de retención (chin tucks, tempo {2,2,2}) + `timed`
  renderizan; sin scroll vertical/horizontal.
- **i18n**: consola sin `[i18n] missing` en ES+EN; claves EN `instruction.*`
  resuelven; `sN.cue` retiradas; ES desde el dato.
- **Standalone regenerado** `node build-standalone.js` (v0.61.0, 3175 KB) + índice;
  mismo comportamiento; versión embebida verificada.

### Deuda nueva observada (no regresión, fuera de alcance)

- **Warning React de estilo en `MoveSessionV1.jsx:441`**: el elemento del
  rep-pulse mezcla `animation` (shorthand) + `animationPlayState` (longhand), lo que
  dispara «mixing shorthand and non-shorthand… Updating animation animationPlayState»
  al re-render. Es código del runner s113 **no tocado esta sesión** → dispara para
  CUALQUIER rutina de reps (incluidos los pilotos), no es regresión de OLA 1. Fix
  trivial (separar en `animationName`/`animationDuration`/…) cuando se reabra el
  runner; NO se toca ahora (runner fuera de alcance).

---

## 5. Estado de B2.3 al cerrar

- **OLA 1 CERRADA**: 5 rutinas Mueve + candidato `couch.stretch.min`.
- **Pendiente de B2.3** (olas siguientes): **18 rutinas legacy** (7 de Mueve + 11 de
  Estira) + las **reescrituras** (4 cues: Seated twist, Rib pull, WGS, Ground
  transitions · 2 rutinas: `legs.single`, resto de `atg.knees`), que van en su
  **propia ola editorial**.
- **Orden sugerido siguiente ola**: Estira (movilidad — `perSide` + transición +
  gate `ready`, más matiz), empezando por `oficina`/`hombros`; o cerrar Mueve
  premium primero. A decidir al arrancar la ola.

> Nota de conteo: los docs previos decían «22 rutinas legacy»; el conteo real era
> **23** (28 totales − 5 pilotos). Tras OLA 1 quedan **18**.
