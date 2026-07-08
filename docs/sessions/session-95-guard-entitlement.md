# Sesión 95 — Cirugía 1: guard central de entitlement + degustación explícita

**Fecha:** 2026-07-08 · **Versión:** v0.39.0 → **v0.40.0**
**Plan maestro:** primera sesión post-bloque Contenido+Premium (ROADMAP
"Camino a v1.0"). Siguiente: s96 timer engine.

---

## Objetivo

Un **único punto de verdad del acceso a contenido**
(`canAccessRoutine`/`canAccessPath`), consumido por todos los que hoy leen
`access`/`premiumUnlocked` sueltos, con la **degustación de `path.weekend`
hecha explícita** (deja de ser excepción tácita). Micro-extra: autofocus
del Welcome que no auto-abra el teclado en móvil.

**Restricción dura:** comportamiento observable IDÉNTICO con
`premiumUnlocked=false`. NO licencia, NO trial, NO validación de claves
(decisión F3b sigue diferida — el guard es el sitio que cambiará cuando se
tome, no hoy).

## Tarea 0 — Auditoría

- Commit s94 (`995f513`, v0.39.0) en git ✓. Working tree limpio.
  `PACE_VERSION` v0.39.0 ✓ · standalone presente ✓.
- **Mapa de puntos que leen acceso hoy:**
  1. `RoutineCard` (BreatheLibrary.jsx:107-108) — **el único gate de las 3
     bibliotecas**. `isPremium = access==='premium'`;
     `isLocked = isPremium && !premiumUnlocked`.
  2. `CustomRoutinesSection` (CustomRoutines.jsx:19) —
     `unlocked = !!premiumUnlocked`. **Feature-gate** de la superficie del
     constructor, no un `routineId`.
  3. `state-core.jsx:38` — default `premiumUnlocked:false`.
  4. `PathBreatheStep`/`PathBodyStep` — **NO comprobaban access**, lanzaban
     directo = degustación.
  5. `getSuggestedPath` (state-paths.jsx) — ignora premium.
  6. `registry.js` — los 7 paths con `access:'free'` (declarativo, sin
     consumidor).
  7. Solo comentarios: CustomBuilder.jsx:15, PremiumSection.jsx:6.
- **Verificado:** el **único** Camino que referencia rutinas premium es
  `path.weekend` (`breathe.nadi.shodhana` + `move.atg.knees`); los demás
  steps apuntan a rutinas free. → solo weekend necesita el flag de
  degustación (coincide exacto con la decisión s89 D-8a).

## Decisiones aprobadas (Tarea 1)

| Decisión | Elección |
|---|---|
| Ubicación del guard | **Archivo nuevo `app/state-entitlement.jsx`** (aísla el sitio que cambiará con la licencia). Descartado: helper en state-paths (mismatch de dominio) |
| RoutineCard consume hoy | **Sí** (centralización barata: bibliotecas y guard comparten una verdad; `usePace()` mantiene la reactividad) |
| Shape de degustación | **`tasting:true` a nivel step** en los 2 steps premium de weekend (preciso; el guard queda puro) |
| Autofocus Welcome | **Saltar en puntero coarse** (`matchMedia('(pointer: coarse)')`): autofocus solo en escritorio |

Firma: `canAccessRoutine(routineId, { tasting = false } = {})` ·
`canAccessPath(pathId)`. `CustomRoutinesSection` se queda en
`premiumUnlocked` (feature-gate, no routineId; revisar en licencia).

## Implementación (Tarea 2)

| Archivo | Cambio |
|---|---|
| `app/state-entitlement.jsx` | **Nuevo (~65 ln).** `resolveAnyRoutine` (Respira→Cuerpo) + `canAccessRoutine` (desconocida→true fail-open, free→true, premium→`premiumUnlocked\|\|tasting`) + `canAccessPath`. Expone a window |
| `PACE.html` | Script tag de state-entitlement.jsx **antes** de state-paths.jsx + bump título v0.40.0 |
| `app/state.jsx` | Re-export de `canAccessRoutine`/`canAccessPath` |
| `app/paths/registry.js` | `tasting:true` en los 2 steps premium de `path.weekend` + comentario (degustación curada explícita) |
| `app/paths/PathRunner.parts.jsx` | **`PathStepLocked`** (auto-skip en silencio, renderiza null) — fallback defensivo, dead code en s95 |
| `app/paths/steps/PathBreatheStep.jsx` | Consulta el guard con `{ tasting: step.tasting }`; rama false→`PathStepLocked` |
| `app/paths/steps/PathBodyStep.jsx` | Idem |
| `app/state-paths.jsx` | `getSuggestedPath`: helper `ok(id)=!canAccessPath\|\|canAccessPath(id)` salta candidatos bloqueados en cada nivel de la jerarquía (todos free→idéntico) |
| `app/breathe/BreatheLibrary.jsx` | `RoutineCard`: `isLocked = !canAccessRoutine(id)` (equivalente exacto; fallback inline; `isPremium` sigue inline para el sello) |
| `app/welcome/WelcomeModule.jsx` | Autofocus enguardado tras `(pointer: coarse)` |
| `app/state-core.jsx` / `sw.js` | Bump `PACE_VERSION` / `CACHE_NAME` a v0.40.0 |

## Verificación (Tarea 3)

Preview :8765, protocolo s93 (purga SW+caches tras cada tanda, no-store
activo). **Diagnóstico por `window.Componente.toString()`** confirmó que
RoutineCard, ambos steps y WelcomeModal consumen el guard en el bundle
compilado.

Con `premiumUnlocked=false`:
- **Guard por caso:** nadi/atg sin tasting → `false`; con tasting → `true`;
  free (478, neck.3) → `true`; desconocido → `true`; paths free → `true`.
- **Gating idéntico al previo:** biblioteca Respira con las 8 premium
  (Rondas ×3, CO₂, Coherente 432, Nadi, Kapalabhati, Kumbhaka) en sello +
  "Pronto" + `cursor:default`; las 12 free clicables.
- **Degustación viva:** `startPath('path.weekend')` → intro "PRANAYAMA ·
  Nadi Shodhana" → la **sesión de Nadi Shodhana (premium) corre en vivo**
  (fases "Sostén", Pausar/Terminar), NO `PathStepLocked`. atg.knees
  resuelve `source:'extra'`, lanza con tasting, bloquea sin él.
- `getSuggestedPath` → `path.afternoon` (miércoles tarde, slot correcto).

Con `premiumUnlocked=true` (snapshot + **restaurado a false** al final):
las premium pasan a `cursor:pointer` conservando el sello, "Pronto"→min —
**reactividad** vía la suscripción `usePace` de RoutineCard.

**Autofocus Welcome:** en puntero fino (escritorio) el input
`#pace-intention` se enfoca a los ~450 ms; forzando `matchMedia('(pointer:
coarse)')` a true, el Welcome abre pero el input **no** se enfoca
(activeElement=BODY). El preview no emula puntero coarse al redimensionar a
375px (reporta `fine`), por eso se verificó la rama forzando matchMedia.

**EN:** premium con "Soon". Estado restaurado (lang=es,
premiumUnlocked=false, sin path activo). **Consola sin errores** en dev y
en el standalone.

## Cierre

- Bump **v0.40.0** (título PACE.html + `PACE_VERSION` + `CACHE_NAME
  pace-v0.40.0`).
- Backup `PACE_standalone_v0.39.0_20260708.html`; cap 20 (rotado el más
  antiguo, `v0.28.12_20260516.html`).
- `node build-standalone.js`: **719 KB**, **70 archivos** validados (+1 =
  state-entitlement.jsx). `index.html` copia exacta (SHA256 idéntico).
  Standalone verificado en preview (v0.40.0, guard presente, 2 steps
  tasting, consola limpia).
- **El guard NO cambia la decisión F3b** (licencia sigue diferida); es el
  cableado que la implementará cuando se tome. Próxima sesión: **s96 —
  timer engine timestamp-based** (plan maestro, ROADMAP.md).
