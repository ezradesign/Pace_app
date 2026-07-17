# Sesión 110 — B2.2a · Contrato de pasos v1 (pilotado) + visualId

> **Fecha:** 2026-07-17 · **Versión:** v0.53.0 → **v0.54.0** · **Bloque:** B2
> (fundamentos), 2ª sesión — la **primera de código**.
> **Gobierna:** [`BASE_MUEVE_ESTIRA.md`](../product/BASE_MUEVE_ESTIRA.md) §3/§4/§6 ·
> **Insumo directo:** [`audit-b2-ejercicios-v0.53.0`](../audits/audit-b2-ejercicios-v0.53.0.md)
> (B2.1, s109) · **Canónico:** [`DECISIONES_PRODUCTO.md`](../product/DECISIONES_PRODUCTO.md) §B2.

---

## Método

Arranque completo de CLAUDE.md (STATE, DESIGN_SYSTEM, auditoría B2.1, BASE,
DECISIONES). Confirmado el estado antes de tocar nada. **Decisiones abiertas
resueltas ANTES de código** vía AskUserQuestion (§11 de BASE: implementar solo
tras aprobar la tabla):

1. **Fichas «revisar con fisioterapeuta»** (Nordics, Sissy squat, Fondos en
   silla, Couch stretch) → **aparcadas a B4** (el contrato v1 es ortogonal;
   ninguna está en el piloto).
2. **atg.knees + weekend** → **sustituir Nordics** por puente isquio a una
   pierna; `path.weekend` **mantiene** la degustación de atg.knees (ya más
   seguro). Sissy squat queda en la lista de fisio.
3. **6 pilotos confirmados** (4 cuerpo con código + 2 Respira como control
   `timed`). Suplente `move.hips.5`.
4. **Corte** → visualId + contrato **hoy**; metadatos + duración derivada +
   feedback «¿te ayudó?» + esquema de eventos **mañana** (B2.2b).

Desglose confirmado con el usuario antes de editar.

---

## Qué se hizo

### 1 · visualId + mapa de alias

- Nuevo [`app/custom/exercise-aliases.js`](../../app/custom/exercise-aliases.js):
  `VISUAL_ALIAS` + `resolveVisualId(name)`. Colapsa 4 duplicados de nombre en
  una identidad visual **sin tocar `step.name` ni localStorage** (swap s14
  blindado). `ExerciseGlyph` (exercise-glyphs.jsx) resuelve `EXERCISE_GLYPHS[vid]
  || EXERCISE_GLYPHS[id]`: Chest opener→Apertura de pecho · Deep squat
  hold→Squat profundo · Deep breaths→Reset respiración · Dead hang·opcional→Hang
  pasivo. Los 4 glifos absorbidos quedan (inofensivos).
- **Rib pull ↔ Gato-camello NO se unifica** (decisión): es caso «reescribir»,
  no duplicado limpio; su cue espera a la ola de contenido.
- Tag de carga en PACE.html antes de exercise-glyphs.

### 2 · Contrato de pasos v1 + runner R1-R5

- Nuevo [`app/move/MoveSessionV1.jsx`](../../app/move/MoveSessionV1.jsx) (255 ln):
  runner por MODO. Máquina de fases `place | work | change` + `side 0/1`.
  Modos `timed | reps | perSide | rest`.
- `MoveSession` en MoveModule pasa a **dispatcher** (sin hooks): `isV1 =
  steps.some(s => s.mode)`; si v1 → `<MoveSessionV1/>` (guard `typeof` degrada
  a legacy), si no → `MoveSessionLegacy` (byte-idéntico a s109).
- **R1-R5 resueltos, activados por `mode`**:
  - **R1** placement gate por paso: fase `place` con glifo + cue de colocación
    + «Empezar»; el timer no arranca leyendo. Absorbe el cambio de posición
    (§6) sin insertar steps (evita romper los índices EN posicionales).
  - **R2** `reps`: número objetivo + «Terminé» (manual, sin auto-avance, sin
    timer). Hint «Haz menos si lo necesitas».
  - **R3** `perSide`: lado Izquierda (contador) → gate manual «Cambia de lado»
    («Listo») → lado Derecha (contador propio).
  - **R4** `dispatchComplete` acredita **minutos REALES** (`Date.now() -
    sessionStart`, mín. 1) a `completeMove/ExtraSession`, **no** `routine.min`.
    Aplicado a **ambos** runners (legacy incluido) — es runner-level y las
    stats/logro `retreat` heredaban el número declarado.
  - **R5** `rest`: tipo propio, apagado (`--ink-3`, sin glifo), «Saltar»,
    auto-avanza.
- **Pilotos**: `extra.desk.pushups` + `extra.chair.squats` (reps+rest) ·
  `move.neck.3` (reps postural + perSide ×3) · `move.chair.antidote` (timed +
  perSide ×4 + rest). Cubren biblioteca **y** el runner de Caminos
  (dawn/afternoon/dusk). Respira (diafragmática, coherente 5·5) = control
  `timed` conceptual, sin cambio de código (corren en BreatheSession, fuera del
  contrato de pasos).
- 13 keys i18n del contrato ES+EN en `strings/sessions.js`.

### 3 · Split de MoveModule (<500 ln)

- `MOVE_ROUTINES` + `getMoveRoutine` → nuevo
  [`app/move/move.data.js`](../../app/move/move.data.js) (`var` global,
  re-expuesto por el build; MoveModule lo referencia bare como antes).
- **MoveModule 451 → 331 ln.** MoveSessionV1 255 ln, move.data 156 ln.
- Orden de carga PACE.html: `move.data.js` → `MoveModule.jsx` →
  `MoveSessionV1.jsx`.

### 4 · Contenido bundleado

- **Nordics → «Puente isquio a una pierna»** en `move.atg.knees`: sustituto
  accesible de suelo + **glifo nuevo** (`exercise-glyphs.jsx`, name = key) + EN
  (`content/extra.js` → `Single-leg hamstring bridge`). Nordics **sigue en el
  registro** (aparcado a fisio con Sissy squat, Fondos en silla, Couch stretch).
- Cues de pilotos sin el número de reps encerrado (lo lleva el runner): espejo
  EN en `content/move.js` (desk.pushups, chair.squats) y `content/extra.js`
  (neck.3, chair.antidote WGS).
- **Leftover B1.2** (caso 15): `exercise-registry.js:117` «Abre los dedos al
  máximo» → «sin forzar» + EN en `content/custom.js`.

---

## Verificación (preview :8765)

- **Dev**, paso a paso en runtime:
  - `extra.desk.pushups`: prep → **«Colócate»** (place, cue sin nº reps,
    sin pausa) → «Empezar» → **reps** (número + «Terminé», sin auto-avance) →
    **«Descanso»** (rest apagado, sin glifo, cuenta atrás).
  - `move.neck.3`: Chin tucks **reps postural** → Inclinación lateral **place**
    → **Izquierda** (contador + pausa) → **«Cambia de lado»** («Listo») →
    **Derecha**. R3 completo.
  - Consola limpia en todo el recorrido.
- **Standalone** regenerado (`node build-standalone.js`): 82 scripts compilados,
  sin invariantes rotas, 3098 KB. Monta limpio; el contrato v1 corre en el
  bundle («Colócate» renderiza). Consola limpia.
- Bump v0.54.0 ×3 (PACE.html título, sw.js CACHE_NAME, state-core PACE_VERSION).
- Backup `PACE_standalone_v0.53.0_20260717.html` desde el standalone publicado
  (rotado el más antiguo `v0.34.4_20260707`, cap 20).

---

## Archivos tocados

**Nuevos:** `app/custom/exercise-aliases.js` · `app/move/move.data.js` ·
`app/move/MoveSessionV1.jsx`.
**Editados:** `app/move/MoveModule.jsx` (dispatcher + R4 legacy + StepGlyph a
window; −120 ln) · `app/extra/ExtraModule.jsx` (modos neck.3/chair.antidote +
Nordics→puente) · `app/glyphs/exercise-glyphs.jsx` (visualId en ExerciseGlyph +
glifo del puente) · `app/custom/exercise-registry.js` (leftover 117) ·
`app/i18n/strings/sessions.js` (13 keys) · `app/i18n/content/move.js` +
`content/extra.js` + `content/custom.js` (espejos EN) · `PACE.html` (3 tags +
bump) · `sw.js` + `app/state-core.jsx` (bump).

## Pendiente → B2.2b (mañana)

Metadatos por rutina (`position/equipment/requiresFloor/intensity/level/
discrete`) · duración derivada de pasos + rangos honestos · feedback ligero
«¿te ayudó?» (`{done,helped}` sin eventos) · **diseñar** (solo diseñar) el
esquema de eventos con `schemaVersion`. Después: plan maestro (home Caminos al
centro + After Pomodoro + scoring v2).
