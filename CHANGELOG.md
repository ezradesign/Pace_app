# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

| Versión | Fecha | Título | Sesión | Detalle |
|---|---|---|---|---|
| **v0.11.10** | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | [abajo ↓](#v01110--2026-04-22--logros-arreglo-explore--estado-próximamente) |
| **v0.11.9** | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [abajo ↓](#v0119--2026-04-22--swap-mueve--estira) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [session-13-backlog-robustez.md](./docs/sessions/session-13-backlog-robustez.md) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [session-12-barra-horizontal.md](./docs/sessions/session-12-barra-horizontal.md) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [session-11-limpieza.md](./docs/sessions/session-11-limpieza.md) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | [session-10-auditoria.md](./docs/sessions/session-10-auditoria.md) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | [session-09-timer-aro.md](./docs/sessions/session-09-timer-aro.md) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | [session-08-logo-oficial.md](./docs/sessions/session-08-logo-oficial.md) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | [session-07-sidebar-sendero.md](./docs/sessions/session-07-sidebar-sendero.md) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | [session-06-iconos-activitybar.md](./docs/sessions/session-06-iconos-activitybar.md) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | [session-05-fortalecimiento.md](./docs/sessions/session-05-fortalecimiento.md) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | [session-04-reorganizacion.md](./docs/sessions/session-04-reorganizacion.md) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | [session-03-pulido-core.md](./docs/sessions/session-03-pulido-core.md) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | [session-02-refinamiento.md](./docs/sessions/session-02-refinamiento.md) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | [session-01-base.md](./docs/sessions/session-01-base.md) |

---

## [v0.11.10] — 2026-04-22 — Logros: arreglo `explore.*` + estado "Próximamente"

Sesión corta y quirúrgica sobre el backlog **#9** (logros sin trigger).
Usuario eligió vía mixta: reparar los 6 `explore.*` rotos en sesión 14 +
marcar el resto como "Próximamente" en la UI para incentivar sin
prometer.

### Corregido
- **6 logros `explore.*` de movilidad** vuelven a dispararse. El map
  `'move.hips.5' → 'explore.hips'` (y las otras 5 entradas) se movió
  desde `completeMoveSession` a `completeExtraSession` en `state.jsx`,
  porque tras el swap de sesión 14 esas rutinas desembocan ahí. Los ids
  `move.*` se conservan (decisión activa: ids estables ≠ clasificación
  semántica). Comentario inline explicando el desajuste aparente.

### Añadido
- **`IMPLEMENTED_ACHIEVEMENTS`** (Set en `Achievements.jsx`) lista los
  26 ids de logros con trigger real hoy. Fuente de verdad para decidir
  qué se pinta como "disponible" vs "Próximamente". Cuando se implemente
  un trigger nuevo, hay que añadir su id aquí.
- **3er estado visual en `Seal`** — `coming-soon`: borde dotted gris,
  opacidad 0.38, glifo original con opacity 0.25 (se intuye, no se
  afirma), descripción sustituida por "Pronto", badge "Pronto" en
  esquina superior derecha (pill, 7.5px, uppercase). Título se conserva
  para incentivar "lo quiero". Los secretos **no** entran en este
  estado: su mecánica es intriga, no señalización; se siguen pintando
  como `?` / "Secreto" / "?????".

### Cambiado
- **Contador de cabecera** en el modal de Logros: `X / 100 descubiertos`
  · `Por descubrir` → `X / 26 disponibles` · `74 Próximamente`.
  Denominador dinámico (`availableCount`) que crecerá automáticamente
  cuando se implementen más triggers.
- **`PACE_VERSION`** en `state.jsx`: `v0.11.9` → `v0.11.10`.
- **`<title>` de `PACE.html`**: `v0.11.8` → `v0.11.10` (arrastraba desfase
  de sesión 14).

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.10** (~186 KB).
- Rotado `backups/PACE_standalone_v0.11.9_20260422.html` (sale v0.11.5).
- 4 backups activos (v0.11.6 → v0.11.9), dentro del límite de 5.

Detalle: [`docs/sessions/session-15-logros-proximamente.md`](./docs/sessions/session-15-logros-proximamente.md).

---

## [v0.11.9] — 2026-04-22 — Swap Mueve ↔ Estira

Bug de larga data tras el rebrand parcial de sesión 02 (`Extra` →
`Estira` en el sidebar): el botón **"Estira"** abría una librería de
calistenia y el botón **"Mueve"** abría una librería de estiramientos
— exactamente lo contrario de lo que los nombres prometían. Además el
título del modal de "Estira" seguía diciendo `"Extra"` (string obsoleto).
Swap de contenido + renombre de los dos modales en una sola pasada.

### Cambiado
- **`MOVE_ROUTINES` ahora contiene calistenia/fuerza** (flexiones de
  escritorio, fondos en silla, wall sit, gemelos, core silencioso, grip,
  postura reset). Antes vivían en `EXTRA_ROUTINES`.
- **`EXTRA_ROUTINES` ahora contiene movilidad/estiramientos** (antídoto
  silla, caderas, hombros, ATG rodillas, ancestral, cuello, escritorio
  express). Antes vivían en `MOVE_ROUTINES`.
- **`MoveLibrary`**: modal title `"Movilidad"` → `"Mueve"`; subtitle
  reescrito a `"Calistenia y fuerza. Corto, discreto, sin equipo."`;
  meta superior `"Antídoto a estar sentado"` → `"Cuerpo activo"`.
- **`ExtraLibrary`**: modal title `"Extra"` → `"Estira"` (arregla el bug
  de copy reportado); subtitle reescrito a `"Movilidad y estiramientos.
  Antídoto a la silla."`; añadida la fila superior con meta
  `"Afloja tensión"` + encabezado `"Rutinas"` para emparejar la
  estructura visual con `MoveLibrary` (antes era más escueto).
- **`PACE_VERSION`** en `state.jsx`: `v0.11.8` → `v0.11.9`.

### Conservado deliberadamente (no regresión)
- **Los ids `move.*` / `extra.*` permanecen ligados a su rutina
  original**, no al array donde viven ahora. `move.hips.5` sigue siendo
  `move.hips.5` aunque hoy viva en `EXTRA_ROUTINES`. Razón: localStorage
  de usuarios existentes conserva sus logros desbloqueados por id.
- **`completeMoveSession` / `completeExtraSession` sin cambios**. Cada
  botón sigue marcando el bucket correcto del plan (`plan.muevete` vs
  `plan.extra`) vía el prop `kind` de `MoveSession`.
- **Decisión activa "Extra suma a `moveMinutes`" vigente**. La
  justificación pasa de "calistenia es movimiento" a "estiramientos son
  cuerpo activo"; el comportamiento no cambia.

### Deuda introducida (pequeña, acotada)
- El map `explore.hips / .shoulders / .atg / .ancestral / .neck / .desk`
  en `completeMoveSession` queda huérfano: esas rutinas ahora se
  completan vía `completeExtraSession`, que no las mira. Se suman a los
  19 logros sin trigger del backlog **#9**.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.9** (~182 KB).
- Rotado `backups/PACE_standalone_v0.11.8_20260422.html`.
- 4 backups activos (v0.11.5 → v0.11.8), dentro del límite de 5.

Detalle: [`docs/sessions/session-14-swap-mueve-estira.md`](./docs/sessions/session-14-swap-mueve-estira.md).
