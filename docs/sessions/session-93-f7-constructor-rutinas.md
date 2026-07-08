# Sesión 93 — F7: registro de ejercicios + constructor de rutinas premium

**Fecha:** 2026-07-08 · **Versión:** v0.37.0 → **v0.38.0**
**Bloque:** Contenido+Premium (F1-F6 hechas) · **Fase 7 de 8**

---

## Objetivo

Registro interno de ejercicios (base de datos curada, NO biblioteca
navegable — la unidad gateable sigue siendo la sesión, decisión s85) +
constructor de rutinas premium: el usuario arma su rutina eligiendo
ejercicios + duración, reutilizando el runner data-driven de `MoveSession`.
Superficie premium entera (gateada por `premiumUnlocked`).

## Tarea 0 — Auditoría

- Commit s92 (`3326b1a`, v0.37.0) en git, working tree limpio — sin
  repetición del incidente s91/s92.
- `MoveSession` confirmado 100% data-driven; `dispatchComplete` despacha
  por `kind`. `completeMoveSession` acredita `weeklyStats.moveMinutes` +
  `plan.muevete` + `moveSessionsTotal`; los mapas de logros
  (`exploreMap`, `BREATH_ROUTINE_CATEGORIES`) son cerrados por id → un id
  `custom.*` no dispara nada por accidente.
- 45 keys de glifo por `step.name` ES + `DefaultGlyph` de fallback.
- `state-core.jsx` en ~507 ln (al límite): el CRUD va a archivo nuevo.

## Diseño aprobado (Tarea 1)

- **Registro curado propio** (`app/custom/exercise-registry.js`), NO
  derivado en runtime: unión deduplicada a mano de los steps de
  `MOVE_ROUTINES` + `EXTRA_ROUTINES` con cue neutro (los del catálogo
  dependen del contexto de serie) y dur por defecto. **65 ejercicios en
  8 grupos** (empuje 5 · piernas 9 · core 8 · cuello 11 · columna 8 ·
  caderas 7 · suelo 7 · manos/pausas 10). `name` = ES canónico idéntico
  a la key de glifo. Curación: `Dead hang (si puedes)` fuera (duplica
  Hang pasivo). Al crecer catálogos en F8+, añadir a mano.
- **Ubicación:** sección "Tus rutinas" como **5º grupo al final de la
  biblioteca Mueve** (elegido por el usuario sobre "al inicio" y "ambas
  bibliotecas"). Una sola casa, coherente con el crédito.
- **Estado:** `customRoutines: []` en defaultState (+5 ln state-core,
  511 total — deuda conocida sin agravar; CRUD en `state-custom.jsx`).
  Shape: `{ id: 'custom.<Date.now()>', name, steps: [{name,dur,cue}],
  min (ceil Σdur/60), createdAt, updatedAt }`. Límites: 10 rutinas ·
  1-12 pasos · dur 10-120 s en saltos de 5 · nombre ≤ 40.
- **Gating:** sección entera bloqueada con `premiumUnlocked=false`
  (sello + copy + "Pronto", nada clicable — sin muro a mitad de flujo).
  Rutinas existentes con flag apagado se listan bloqueadas sin borrar.
  RoutineCard/mecanismo de gating intocados.
- **Crédito:** `completeMoveSession(id, min)` vía `handleStartMove`
  existente (`kind='move'`). Cero cambios en state-achievements. Sin
  logros nuevos (decisión F4 en pie).
- Cues **no editables** en F7 (vienen del registro; sería scope creep).

## Implementación (Tarea 2)

### Archivos nuevos

| Archivo | ln | Qué |
|---|---|---|
| `app/custom/exercise-registry.js` | 136 | `EXERCISE_REGISTRY` (8 grupos, 65 ítems) + `getExerciseDef` |
| `app/custom/CustomRoutines.jsx` | 164 | `CustomRoutinesSection` (header+sello, locked, empty, create) + `CustomRoutineCard` (gemela de RoutineCard + lápiz) |
| `app/custom/CustomBuilder.jsx` | 259 | Modal 2 vistas: editor (nombre, filas con glifo/stepper ±5s/reordenar/quitar, total vivo, borrar en 2 toques) + picker agrupado |
| `app/state-custom.jsx` | 100 | `CUSTOM_LIMITS` + CRUD (`add/update/deleteCustomRoutine`, `getCustomRoutine(s)`) con sanitize + lectura defensiva `[]` |
| `app/i18n/content/custom.js` | 168 | EN por nombre canónico: `custom.ex.<name ES>.{name,cue}` (reutiliza los EN de content/move+extra) + `custom.cat.*.label` |

### Modificados

- `MoveModule.jsx` (397→436): `<CustomRoutinesSection/>` tras los grupos
  (guard `typeof`, patrón s83) + helper `tStep`: rutinas custom resuelven
  EN de pasos por nombre (`custom.ex.*`), catálogo sigue por key
  posicional; `displayRoutine` salta el lookup por id en custom (evita
  warns `[i18n]` dev).
- `main.jsx` (280→294): estado `customBuilder` + listener CustomEvent
  `pace:open-custom-builder` (patrón overlay s50+) + monta
  `<CustomBuilder/>`. MoveLibrary se oculta mientras el builder está
  abierto (evita doble listener Escape de Modal); al cerrar reaparece.
- `strings/sessions.js` (265→329): ~33 keys `custom.*` ES+EN (chrome del
  constructor).
- `state-core.jsx` (511): + `customRoutines: []` + bump.
- `PACE.html`: 5 script tags nuevos + título v0.38.0.
- `sw.js`: `CACHE_NAME pace-v0.38.0`.
- `.claude/static-server.js`: + `Cache-Control: no-store` (ver incidente).

## Incidente de verificación (lección s91/s92, segunda forma)

Un fix aplicado a mitad de verificación no llegaba al navegador: **el SW
se re-registra en cada carga** — desregistrarlo una vez al principio no
basta, porque la primera carga lo revive y vuelve a cachear assets
cache-first (quedó congelado el MoveModule intermedio). Diagnóstico con
`window.MoveSession.toString()` (código compilado en runtime) + stack
trace del warn. Doble remedio: purgar SW+caches otra vez antes de
re-verificar, y `Cache-Control: no-store` en el static-server de preview
para eliminar además la capa de caché HTTP heurística (sin validadores,
Chrome no revalidaba los .jsx). **Protocolo actualizado: purgar SW+caches
tras CADA tanda de edits, no solo al arrancar.**

## Verificación runtime (preview :8765)

- **Gating off:** sección con sello + copy + "Pronto", nada clicable;
  las rutinas del catálogo intactas. Screenshot.
- **Gating on (solo prueba, snapshot de estado previo):** crear (nombre
  "Prueba F7", 3 pasos vía picker, stepper 40→50, reorden), guardar
  (shape correcto, `min: 2` = ceil 110 s), editar (renombrar,
  `updatedAt` cambia), lanzar desde la card real → runner completo
  (prep → 3 pasos → "Antídoto completado") → **crédito exacto:**
  moveMinutes 0→2, moveSessionsTotal 0→1, plan.muevete true,
  `first.stretch` desbloqueado (sesión Mueve genuina), **cero
  `explore.*` accidentales**. Borrado en 2 toques OK.
- **Persistencia:** rutina + crédito + flag sobreviven recarga.
- **EN completo:** sección/builder/picker/cards + pasos del runner por
  `custom.ex.*` ("Chair squat", "Next: Rest") + grupos. **Cero warns
  [i18n]** tras el fix de displayRoutine.
- **Restauración:** snapshot restaurado (premiumUnlocked=false, lang=es,
  0 rutinas, stats limpias). **Consola sin errores** en todo momento.
- **Standalone verificado en preview:** v0.38.0, registro 65, sección
  bloqueada correcta, sin errores.

## Build

- `PACE_standalone.html`: **713 KB**, 69 archivos validados (64 + 5
  nuevos). `index.html` copia exacta (SHA256 `0FEBAC12…2349E` idéntico).
- Backup `PACE_standalone_v0.37.0_20260708.html`; cap 20 (rotado
  `v0.28.10_20260512.html`).

## Decisiones nuevas

- Registro curado a mano en `app/custom/` (no derivado runtime); mantener
  al crecer catálogos.
- Prefijo de estado `custom.` para ids de rutinas de usuario; jamás
  colisiona con `extra.*`/`move.*` ni con mapas de logros.
- i18n de ejercicios del registro por **nombre canónico ES como key**
  (`custom.ex.<name>.name/cue`) — mismo criterio que las keys de glifo.
- Builder oculta la biblioteca mientras está abierto (un solo Modal
  escucha Escape); estado del builder en main.jsx, apertura por
  CustomEvent.
- Preview: `no-store` en static-server + purga SW/caches tras cada tanda
  de edits.

## Pendiente / Próxima sesión

- **F8 visual Caminos** (última fase del bloque). P1 auditoría
  (recordatorios opt-in, onboarding, notificación fin pomodoro)
  intercalable. Post-bloque: experiencia CTB completa.
- Cola D-4 sin cambios (35 glifos pendientes de aprobación).
