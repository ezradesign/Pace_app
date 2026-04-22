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
| **v0.11.7** | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [abajo ↓](#v0117--2026-04-22--barra-horizontal-del-sidebar) |
| **v0.11.6** | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [abajo ↓](#v0116--2026-04-22--limpieza-sin-riesgo) |
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

## [v0.11.7] — 2026-04-22 — Barra horizontal del sidebar

Logo oficial del PNG quedaba pequeño dentro de la franja superior del
sidebar y los contadores `# 01 | ↻ 00 | ◉ 01` usaban caracteres
tipográficos alineados a la izquierda. Se rediseña la zona superior como
una verdadera "barra horizontal" con el logo dominando la composición y
los contadores centrados debajo con iconografía propia.

### Cambiado
- **Logo ampliado ~2.5×**: `PaceLogoImage.maxWidth` sube de `240` → `600`
  (tanto en la función como en la llamada desde `PaceWordmark` con variant
  `'pace'`). El ancho real efectivo queda limitado por el sidebar (280 px),
  pero el logo ahora ocupa toda la franja sin caps artificiales. Altura
  rendered: ~55 px → ~146 px.
- **Chevron de colapsar reubicado**: sale de la fila del logo y se
  convierte en botón flotante `position: absolute` en la esquina
  superior-derecha del `<aside>` (22×22, opacidad 0.7). Nuevo estilo
  `toggleFloating`. El logo ya no comparte espacio horizontal con ningún
  otro elemento.
- **`logoRow` → `logoBar`**: margin negativos laterales (−14 px) para que
  el logo invada el padding del sidebar y gane más tamaño aparente.
  `justify-content: center` para centrar la imagen.
- **Contadores centrados**: la fila `# 01 | ↻ 00 | ◉ 01` pasa de alinear
  a la izquierda con caracteres tipográficos a una fila centrada con pills
  `<icono SVG> + <número>` separadas por un divisor vertical fino
  (1×14 px, `var(--line)`).

### Añadido
- **3 iconos SVG nuevos** en `Sidebar.jsx` sustituyen los caracteres
  tipográficos:
  - `PomodoroIcon` (tomate con tallo y hojita, relleno `var(--focus)` 14%)
    — reemplaza `#` (pomodoros completados hoy).
  - `RoundsIcon` (espiral de ~1.5 vueltas con cabeza de flecha, stroke
    `var(--ink-2)`) — reemplaza `↻` (rondas largas, cada 4 pomodoros).
  - `StreakFlameIcon` (llama fina de dos trazos, relleno `var(--breathe)`)
    — reemplaza `◉` (días activos seguidos).
- `position: relative` en `sidebarStyles.root` como contexto del botón flotante.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.7** (~174 KB).
- Rotado `backups/PACE_standalone_v0.11.6_20260422.html`.

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
