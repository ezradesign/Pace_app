# Sesión 92 — F6: catálogo Mueve 7 → 14 rutinas (v0.37.0)

**Fecha:** 2026-07-07
**Versión:** v0.36.0 → v0.37.0
**Bloque:** Contenido+Premium, Fase 6 (tras F5/Estira en s91)

## Objetivo

Crecer Mueve de 7 a ~12-15 rutinas (~mitad premium, criterio s88:
entrada/accesible = free, profundo/avanzado = premium) y agrupar
`MOVE_ROUTINES` como Respira/Estira (grupos + free-first). Inspiración:
Strengthside (progresiones de empuje, unilateral, colgarse) + Jess Martin
(fuerza discreta de oficina). Copy propio de PACE, nunca literal.

## Tarea 0 — Auditoría previa

- **Hallazgo bloqueante:** el commit de s91 (v0.36.0) NO estaba en git — todo
  F5 vivía en el working tree. Avisado el usuario antes de tocar nada; él
  commiteó a mano (`10ab883 feat(extra): F5 catálogo Estira 7→14 rutinas`).
  F6 arrancó sobre working tree limpio.
- Versión v0.36.0 coherente en PACE.html + `PACE_VERSION` + `CACHE_NAME`.
- `MOVE_ROUTINES`: 7 rutinas, array plano, ids `extra.*` (swap s14,
  intocables), 2 premium. `MoveSession` data-driven (sin cambios necesarios).
- Consumidor único de `getMoveRoutine`: `resolveBodyRoutine` en
  `paths/registry.js` (vía window, misma firma). BreakMenu no toca el catálogo.
- `strings-content.js` en 389 ln → con F6 superaría el umbral ~470 → aplica
  el troceo por módulo ya decidido (patrón `strings/`).

## Tarea 1 — Propuesta aprobada por el usuario

- **Set:** 7 nuevas (3 free + 4 premium) → **14 rutinas, 6 premium (43%)**,
  misma foto que Estira (14/6) y Respira (20/8).
- **4 grupos free-first** (las 2 iniciales intocables abren su grupo):
  - `empuje` — Empuje y tracción: desk.pushups (inicial) · chair.dips ·
    **push.ladder** 🔒 · **hang.bar** 🔒
  - `sigilo` — Sigilo: calves · grip.squeeze · **glutes.stealth** ·
    core.stealth 🔒
  - `piernas` — Piernas: **chair.squats** · wall.sit 🔒 · **legs.single** 🔒
  - `espalda` — Espalda y core: posture.set (inicial) · **back.desk** ·
    **core.plank** 🔒
- **Prefijo i18n de grupos: `mueve.cat.*`** (elegido sobre `movelib.cat.*`;
  `move.cat.*` descartado por colisión conceptual con los ids `move.*` de
  Estira).
- 9 pasos net-new a `DefaultGlyph` (cola D-4: 26 → **35**): Sentadilla a
  silla, Apretar glúteos, Superman, Pica en escritorio, Sentadilla búlgara,
  Plancha, Plancha lateral, Hollow hold, Hang activo. Pasos con glifo
  reutilizados donde existían (Flexiones inclinadas, Descanso, Calf raises,
  Scapular squeeze, Band pull-apart, Apertura de pecho, ATG split squat,
  Sissy squat, Hang pasivo).
- Sin logros nuevos (decisión F4/F5). Sin modal de seguridad (no hay apnea).

## Las 7 rutinas nuevas

| ID | Nombre | Grupo | min | access |
|---|---|---|---|---|
| `extra.chair.squats` | Sentadillas de silla | piernas | 3 | free (el patrón más útil) |
| `extra.glutes.stealth` | Glúteos invisibles | sigilo | 2 | free (micro Jess Martin) |
| `extra.back.desk` | Espalda de oficina | espalda | 3 | free (tracción accesible) |
| `extra.push.ladder` | Empuje · progresión | empuje | 4 | premium (pica + negativas) |
| `extra.hang.bar` | Colgarse | empuje | 4 | premium (requiere barra) |
| `extra.legs.single` | Piernas · a una | piernas | 5 | premium (unilateral) |
| `extra.core.plank` | Core · plancha | espalda | 4 | premium (isométricos suelo) |

## Tarea 2 — Implementación

- **`app/move/MoveModule.jsx`** (323 → 397 ln): `MOVE_ROUTINES` pasa de array
  plano a **objeto agrupado** (mismo shape que `EXTRA_ROUTINES`/
  `BREATHE_ROUTINES`). `MoveLibrary` renderiza grupos con
  `tR('mueve.cat.*')` (espejo de `ExtraLibrary`, maxWidth 820→860 por
  paridad; fuera el h3 "Rutinas" + Meta como hizo Estira en s91).
  `getMoveRoutine` adaptado a loop de grupos (misma firma).
- **i18n troceado:** `strings-content.js` (389 ln) **eliminado** y dividido
  en `app/i18n/content/` por módulo visual:
  - `breathe.js` (94 ln) — fases (con override D-1 intacto) + categorías +
    20 técnicas.
  - `move.js` (186 ln) — 8 keys `mueve.cat.*` + 14 rutinas Mueve
    (ids `extra.*`), incluidas las ~100 keys nuevas de F6.
  - `extra.js` (202 ln) — 8 keys `extra.cat.*` + 14 rutinas Estira
    (ids `move.*`).
- **`PACE.html`**: 1 script tag → 3 (content/breathe + move + extra), después
  de `strings/*` para preservar el override `breathe.phase.*`; comentario de
  orden de carga actualizado.
- `sw.js` PRECACHE no lista scripts individuales → sin cambios ahí (solo
  `CACHE_NAME`).

## Tarea 3 — Verificación runtime

Preview :8765 (SW desregistrado + caches borrados ANTES de verificar —
lección s91). En `/PACE.html`:

- Biblioteca: **14 tarjetas / 4 grupos** con asides, free-first, 6 premium
  con "Pronto" (sellos PREMIUM visibles en screenshot), minutos en las 8 free.
- `getMoveRoutine`: id viejo (`extra.wall.sit`) ✓, id nuevo
  (`extra.core.plank`) ✓, id inexistente → `null` ✓.
- Sesión "Sentadillas de silla": paso 1 **Sentadilla a silla con
  DefaultGlyph** (verificado `EXERCISE_GLYPHS['Sentadilla a silla'] ===
  undefined` + svg presente), countdown corre (37→25), "Siguiente →" avanza
  a "Paso 2 de 5 — Descanso". Sesión abandonada sin completar (no contamina
  stats).
- **EN**: grupos "Push & Pull / Stealth / Legs / Back & Core" + 4 asides +
  14 tarjetas traducidas. Checks de `PACE_STRINGS.en` de los 3 archivos del
  split (breathe/extra/mueve) + override D-1 preservado. ES restaurado.
- **Consola sin errores** (solo warnings esperados de Babel standalone).

## Build + cierre

- Bump **v0.37.0**: PACE.html título + `PACE_VERSION` + `CACHE_NAME
  pace-v0.37.0`.
- Backup `backups/PACE_standalone_v0.36.0_20260707.html`; cap 20 (rotado
  `v0.28.9_20260512.html`).
- `node build-standalone.js`: **665 KB**, 64 archivos validados (62 + 3
  content/* − strings-content.js). `index.html` copia exacta (SHA256
  idéntico). Standalone verificado en preview: v0.37.0, grupos + lookup +
  i18n OK, monta sin errores.

## Decisiones nuevas

1. **Prefijo `mueve.cat.*`** para los grupos de la biblioteca Mueve (nombre
   del módulo visual; evita el namespace `move.*` de los ids de Estira).
2. **`strings-content.js` troceado en `app/i18n/content/`** por módulo
   visual (breathe/move/extra), cargando tras `strings/*`. El override D-1
   vive ahora en `content/breathe.js`.
3. **D-4 crece a 35 pendientes** (15 s84 + 11 F5 + 9 F6). Patrón s84 intacto:
   ningún glifo se dibuja sin aprobación del usuario.

## Próxima sesión

**F7 — registro de ejercicios + constructor de rutinas premium**
(`custom.sequence`, reutiliza el runner data-driven de MoveSession). P1 de la
auditoría (recordatorios opt-in, onboarding, notificación fin de pomodoro)
sigue disponible para intercalar. Post-bloque: F8 visual Caminos + experiencia
CTB completa.
