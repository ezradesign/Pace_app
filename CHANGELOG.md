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
| **v0.11.9** | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [abajo ↓](#v0119--2026-04-22--swap-mueve--estira) |
| **v0.11.8** | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [abajo ↓](#v0118--2026-04-22--backlog-de-robustez) |
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

---

## [v0.11.6] — 2026-04-22 — Limpieza sin riesgo

Sesión quirúrgica. Sin cambios funcionales ni visuales. Solo borrado de
código muerto acumulado tras las refactorizaciones de las sesiones 7–9
(sidebar colapsable, TopBar con tabs, eliminación del bloque Recordatorios).
**~150 líneas menos** en el bundle.

### Eliminado
- **[#18]** Función `ModeToggle({ value, onChange })` completa en
  `FocusTimer.jsx` (33 líneas). Los tabs Foco/Pausa/Larga viven en TopBar
  desde v0.11.4.
- **[#19]** Entrada `focusStyles.modeRow` — envoltura del ModeToggle
  desaparecido.
- **[#20]** Entradas `toggleCollapsed / railItem / railBtn / railDivider`
  en `sidebarStyles` (~30 líneas). Definían el antiguo rail vertical de
  56 px; el sidebar colapsado devuelve `null` desde v0.11.4.
- **[#21]** Entradas `input / addBtn / reminderItem / reminderRemove` en
  `sidebarStyles` (~30 líneas). El bloque Recordatorios se quitó de la UI
  en v0.11.3.
- **[#23]** Rama `if (compact) return ...` en `StatusBar`. Solo se
  invocaba desde el rail colapsado eliminado. `StatusBar` pasa a ser
  `function StatusBar()` sin argumentos.
- **[#24]** Componente `ChevronRightIcon` completo en `Sidebar.jsx`. Se
  usaba para el chevron "expandir" del antiguo rail.

### Cambiado
- **[#26]** Iconos locales del BreakMenu renombrados:
  `WindIcon / MoveIcon / DropIcon` → `BMWindIcon / BMMoveIcon / BMDropIcon`.
  Evita lectura confusa con los `ABBreathe / ABMove / ABDrop` de la
  ActivityBar en `main.jsx` (son iconografías distintas para los mismos
  tres conceptos).
- **[#22]** Añadido comentario de decisión explícito en `app/state.jsx`
  sobre por qué el campo `reminders: []` permanece en el default state a
  pesar de no tener UI: compatibilidad con localStorage de usuarios
  existentes + futura reintroducción en un modal dedicado.

### Añadido
- **Regla nueva en `CLAUDE.md`**: "Carpeta `Pace_app` siempre lista antes
  de quedarse sin contexto". Formaliza que antes de cualquier cierre
  brusco o cambio de contexto, la carpeta espejo tiene que reflejar una
  app **estable y sin crashear**, aunque eso signifique revertir trabajo a
  medias.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.6** (~172 KB, ~2 KB menos
  que v0.11.5).
- Rotado `backups/PACE_standalone_v0.11.5_20260422.html`.
