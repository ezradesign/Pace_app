# Sesión 115 — B2.2b-1 · contrato + duración derivada (v0.59.0)

**Fecha:** 2026-07-21
**Versión:** v0.58.0 → v0.59.0
**Bloque:** B2.2b-1 (canónico en DECISIONES_PRODUCTO §B2). Formaliza el contrato
de pasos sobre los 5 pilotos ya guiados+editoriales (s113/s114) y deriva la
duración de los datos. El GIRO del runner guiado quedó CERRADO en s114 — aquí
NO se reabre ninguna decisión suya.

**Principio rector (vigente):** «el usuario toca para empezar, pausar o adaptar;
NO para empujar la rutina hacia delante». Comportamiento del runner INTACTO.

---

## 1 · Decisiones de arranque (AskUserQuestion, 4)

1. **Contrato / compatibilidad — migración ATÓMICA** (condicionada a verificar
   ANTES del retiro que los 5 pilotos tienen `instruction.{setup,action,care}`
   completos en ES+EN y que todos los consumidores v1 leen el contrato nuevo).
   Sin fallback dual; `cue` intacto en las 22 rutinas legacy.
2. **Duración — SOLO tarjeta (RoutineCard):** el rango derivado sustituye a
   `routine.min` únicamente en las rutinas v1; el resto (Respira + 22 legacy)
   conserva `routine.min`. `routine.min` queda como baseline de auditoría.
3. **Etiqueta — esquema aprobado:** «ritmo guiado» para guided, «a tu ritmo»
   reservado a `completion:'manual'`. En la tarjeta (compacta) se usa la forma
   corta aprobada «3–4 min» (el qualifier se reserva a superficie con sitio /
   cuando exista una rutina manual con la que contrastar).
4. **Metadatos — 5 campos completos** en los 5 pilotos.

## 2 · Qué se implementó

### Contrato formal (P0-A) — SOLO los 5 pilotos

Cada paso migra a la forma objetiva (alineada con BASE §10):

```
instruction: { setup, action, care }   ← placeCue → setup · cue → action · careCue → care
tempo: { down, hold, up }               ← generaliza el rep-seconds (suma = seg/rep)
transition: { seconds }                 ← cambio de lado perSide (10 s, default s113)
completion: { mode: 'guided' }          ← 'manual' reservado, sin piloto
setup: { mode: 'ready', estimatedSeconds } ← COMPORTAMIENTO del runner (≠ instruction.setup)
position/equipment/requiresFloor/intensity/level  ← metadatos (P1), sin consumidor UI
```

- **Dos «setup» distintos y explícitos** (lo pedía el corte): `instruction.setup`
  = copy de colocación; `setup.mode` = comportamiento; `setup.estimatedSeconds`
  = estimación para duración. `ready` NUNCA se vuelve countdown (placeLeft 0);
  `ready ⇒ estimatedSeconds > 0` (15 s en floor/pared). Sin `discrete`.
- **`v1StepSetup(routine, idx)`** (support) es la ÚNICA fuente del gate: lee
  `setup.mode:'ready'` declarado y DERIVA auto/none igual que s111/s114 (clocked
  idx>0 · 1er set de fuerza con `instruction.setup` no tras rest → auto 5 s;
  resto none). La usan el runner (`startStep`) y la duración → cero divergencia.
- **Migración ATÓMICA**: datos ES + keys i18n EN nuevas
  (`id.sN.instruction.{setup,action,care}`) + lector del runner (`tInstr`)
  cambian a la vez; se RETIRAN `placeCue/cue/careCue` de los 5 pilotos (dato +
  keys EN). Verificado: viejas keys/campos = null/undefined, cero doble fuente.
  `cue` de las 22 legacy INTACTO; fallback general de i18n intacto.

### Fuente ÚNICA de segundos efectivos + fix del criterio de aceptación (P0-A)

- **Deuda real corregida**: `v1StepWeight` (peso de la barra segmentada) leía
  `step.dur` crudo mientras `v1StepProgress`, el `remaining` y el aviso de 5 s
  leían `v1StepDur` (preset). Con descanso 20/45 el peso divergía del llenado.
  Ahora la rama timed/rest de `v1StepWeight` usa `v1StepDur` → **peso =
  progreso = aviso 5 s = duración** sobre la MISMA duración efectiva.
  Verificado con presets 20/30/45 (todo alineado a 20/30/45) y reps (48 = 12×4).
- `v1TempoSeconds` (suma del tempo), `v1RepSeconds` (delega en tempo),
  `v1TransitionSeconds`, `v1CompletionMode` — helpers puros, respaldo a
  `repSeconds`/V1_* legacy. `V1_PREP_SECONDS = 5` (prep global, antes inline).

### Duración derivada (P0-B)

- **`estimateDuration(routine, restBetweenSets) → {minSec, maxSec, breakdown}`**
  — helper PURO en support (testable sin runner, reutilizable). Regla `perSide`:
  activo = `dur POR LADO × 2 + UNA transición` (evita el cuádruple conteo). reps
  guided → `target × tempo` FIJO (planificada, no real; «terminar antes» reduce
  el reloj real, no la promesa). rest betweenSets → preset; cierre → dur. Timed
  → dur. + prep global + setup por paso (ready fijo, nunca cuenta). NO se guarda
  como dato canónico: se recalcula al vuelo.
- **Tarjeta (RoutineCard):** las rutinas v1 muestran el rango derivado
  (`floor(minSec/60)–ceil(maxSec/60) min`, o «N min» si coinciden); Respira +
  legacy conservan `routine.min`; premium bloqueado sigue «Pronto». UNA sola
  promesa por rutina.
- **Dev-check (`v1DevCheckDuration`, solo `_v1IsDev`):** compara `routine.min`
  con el rango a NIVEL de MINUTOS mostrados `[floor,ceil]` (no en segundos: una
  rutina determinista casi nunca es múltiplo exacto de 60 → un umbral en
  segundos avisaría siempre). Avisa SÓLO si los minutos declarados quedan fuera
  del rango que ve el usuario. Corre una vez por sesión (efecto de mount).

### Limpieza (P2)

- Retirada `move.repsGuidedHint` (ES+EN) — sin consumidor tras s114.
- `placeCue/cue/careCue` retirados de los 5 pilotos (dato + keys EN) por la
  migración atómica (ver arriba).

## 3 · Verificación (dev :8765 + standalone; SW purgado + reload MISMO gesto)

- **Datos**: los 5 pilotos con `instruction.*`, `tempo`, `completion`,
  `transition`, `setup:{mode,estimatedSeconds}`, 5 metadatos; campos viejos
  ausentes; keys EN `instruction.*` resuelven (6 muestras), viejas = null.
- **desk.pushups (flujo real dev)**: prep 5 → **colocación** (kicker «Colócate»
  + `instruction.setup` «Apoya las manos en el borde…» + gate 5) → **trabajo**
  (`instruction.action` + «1 de 12 reps» + «CUÍDATE ·» = `instruction.care`) →
  sets tras rest directos (afterRest). EN: «STEP 1 OF 5 · … · TAKE CARE ·».
- **neck.3**: chin tucks reps (tempo 8) · perSide con **lado integrado**
  («Izquierda. …» / auto-cambio a «Derecha. …», `<strong>` acento) + transición
  auto (transition.seconds 10).
- **Criterio de aceptación**: con preset 20/30/45, `v1StepDur = v1StepWeight =
  denominador de progreso = umbral de aviso` (todo alineado). Reps: peso 48 =
  progreso pleno a 48 = 12×4.
- **Duración**: tarjetas v1 «3–4 min» (desk/chair.squats), legacy con `min`
  («3 min» dips…) / «Pronto» (premium). Dev-check: desk/chair.squats/neck/
  antidote **dentro** (log); **couch.stretch** avisa (declarado 5 vs 6–7 min —
  único outlier real). Desglose por paso impreso.
- **Legacy** `move.shoulders.5`: prep **3**, sin atributos v1, sin «CUÍDATE»,
  kicker «Paso 1 de 5» — byte-idéntico (MoveModule.jsx SIN tocar).
- **Consola**: limpia tras el marcador; sin `[i18n] missing` (ES+EN); sin
  «Cannot update while rendering»; sin errores.
- **Layout**: NO se tocó CSS ni estructura (solo el texto de la etiqueta de la
  tarjeta y los mismos strings del runner reubicados a `instruction.*`) → delta
  0 heredado de s114; no re-medido por no haber cambio de layout.
- **Standalone**: regenerado UNA vez (3148 KB, 83 scripts, 82 archivos
  validados por el parser TS, sanity OK). Contrato/duración/dev-check idénticos
  al dev; consola limpia. Bump ×3 (state-core · PACE.html título · sw.js
  CACHE_NAME). Backup `v0.58.0_20260721` (rotado `v0.38.0_20260708`, cap 20).

## 4 · Fuera de alcance respetado

B2.2b-2 feedback · B2.2b-3 eventos · migrar las otras 22 rutinas · reescribir
cues/rutinas (B2.3) · filtros/taxonomía UI · voz/TTS (NUNCA) · diagramas de dos
poses · cambios de layout · el cuerpo de MoveSessionLegacy (byte-idéntico).

## 5 · Hallazgo / deuda

- **Hallazgo del dev-check (para B2.3):** `move.couch.stretch` declara `min:5`
  pero la duración calculada es ~6:10 (6–7 min). Es el único piloto cuyo
  declarado queda fuera del rango mostrado. Se CONSERVA `min` como baseline
  (decisión de la sesión: no reescribir contenido aquí); candidato a alinear a
  6 en la ola de contenido B2.3. Los otros 4 declaran dentro de su rango.
- **Deuda heredada**: `SessionShell.jsx` 494 ln (INTOCADO; el próximo cambio que
  lo toque extrae el CSS primero) · `MoveSessionV1.jsx` 488 ln (margen justo).
- `dur` en los pasos `reps` se conserva SOLO como reserva del fallback legacy
  (documentado); la barra/duración usan `target × tempo`.
