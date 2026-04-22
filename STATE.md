# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.11.7
**Última sesión:** #12 — 2026-04-22 · Barra horizontal del sidebar (logo 2.5× + iconos gráficos)
**Última actualización de este archivo:** 2026-04-22 · sesión 13 (reestructura de documentación)

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.11.7, carga limpio |
| `PACE_standalone.html` | Bundle offline inline | v0.11.7 (~174 KB) |
| `app/ui/pace-logo.png` | Logo oficial local (fallback SVG si falla) | Presente |
| `backups/PACE_standalone_v0.11.5_20260422.html` | Backup (3 atrás) | — |
| `backups/PACE_standalone_v0.11.6_20260422.html` | Backup (2 atrás) | — |

Backups rotados con la regla "máximo 5 más recientes" (ver `CLAUDE.md`).

---

## 🧭 Última sesión (resumen operativo)

**Sesión 12 · v0.11.7 · Barra horizontal del sidebar**

- Logo oficial ampliado ~2.5× (`PaceLogoImage.maxWidth` 240→600). Altura
  rendered ~55px → ~146px.
- Chevron de colapsar reubicado a botón flotante (`position: absolute`)
  top-right del `<aside>`; ya no comparte fila con el logo.
- Contadores `# / ↻ / ◉` pasan de caracteres tipográficos alineados a la
  izquierda a pills centradas con iconografía SVG propia:
  - `PomodoroIcon` (tomate) en vez de `#`
  - `RoundsIcon` (espiral) en vez de `↻`
  - `StreakFlameIcon` (llama) en vez de `◉`

Detalle completo: [`docs/sessions/session-12-barra-horizontal.md`](./docs/sessions/session-12-barra-horizontal.md).

---

## 📋 Backlog priorizado

### 🐛 Robustez funcional (pendiente de auditoría sesión 10)

- **#1** `ToastHost` pierde toasts que lleguen antes de mount → buffer `_pendingToasts`.
- **#5** `addFocusMinutes` lee stale state para los umbrales de horas (idempotente hoy, frágil mañana).
- **#6** `completePomodoro` lee stale state — usar `setState(prev => ...)`.
- **#7** `completePomodoro` invocado dentro de un reducer de `setRemainingSec` (violación de pureza, warning en React 19).
- **#29** `onExit(argumento)` en sesiones ignora el arg — útil si algún día se quiere discriminar salida vs. completion.
- **#30** Preparación: `setPrepCount(c => c - 1)` sin clamp inferior.

### 🧩 Cosmético visible

- **#25** BreakMenu anuncia atajos `B·M·H·Esc` que no existen — implementar o quitar el Meta.

### 🏆 Deuda de producto

- **#9** 19 logros sin trigger (`master.*`, `season.*`, `first.ritual`,
  `streak.14/60/365`, etc.). Decidir: o implementar triggers, o marcarlos
  en la UI como "próximamente" con un glifo distinto.

### 🎨 Diseño pendiente (del roadmap corto)

- Layout "Editorial" (tweak listado pero sin impl visual distinta al sidebar).
- Mockups extensión Chrome (popup 340×480 + nueva pestaña).
- Sonidos sutiles (hay toggle pero no archivos WAV).

---

## ⚠️ Decisiones activas

Decisiones tomadas en sesiones previas que **siguen condicionando** cómo
trabajar. No son historia — son reglas vigentes. Si una se invalida,
moverla a la sesión en la que cambió (`docs/sessions/session-NN-xxx.md`)
con nota explícita y quitarla de aquí.

- **Extra suma minutos al bucket Mueve** en `weeklyStats.moveMinutes`, no a
  uno propio. `plan.extra` sí se marca separado. Si se quisiera cuarto
  gráfico "Extra" en WeeklyStats: añadir `extraMinutes: [0*7]` al state +
  case en `completeExtraSession`. (Sesión 10.)
- **Logo oficial carga local** (`app/ui/pace-logo.png`) con fallback SVG
  silencioso a `PaceLockup`. No se embebe el PNG en el standalone para
  no inflarlo ~300 KB. (Sesión 10.)
- **Campo `reminders: []` se conserva** en el default state aunque la UI no
  lo exponga. Razones: compatibilidad con localStorage de usuarios
  existentes + futura reintroducción en un modal dedicado. Comentado en
  `state.jsx`. (Sesión 11.)
- **Sidebar colapsado hace `return null`** (pantalla 100% limpia). El rail
  vertical de 56 px está eliminado; la re-expansión se hace con el botón ≡
  flotante en `main.jsx`. (Sesión 9.)
- **Rutinas con apnea o hiperventilación llevan modal de seguridad con
  checkbox obligatorio.** No negociable (Wim Hof, Kapalabhati). Si se
  añaden técnicas nuevas con riesgo, marcar `safety: true` en la routine.
  (Sesión 1 · base.)

---

## 📋 Próximos pasos recomendados

1. **Frente 2 de esta sesión** — (lo que el usuario especifique a continuación).
2. **Frente 3 de esta sesión** — (lo que el usuario especifique a continuación).
3. Atacar bloque de robustez funcional (#1, #6, #7) — son patrones de
   state-stale que van a dar warnings en React 19.
4. Decidir qué hacer con los 19 logros sin trigger (#9).
5. Mockups extensión Chrome (popup + newtab).

---

## 🐛 Bugs / issues abiertos conocidos

*Ninguno reportado al cerrar sesión 12. El backlog funcional del informe de
auditoría (sesión 10) está arriba en "Robustez funcional".*

---

## 📚 Navegación rápida de documentación

- [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo, arquitectura, reglas.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — tokens, paletas, tipografía.
- [`CONTENT.md`](./CONTENT.md) — catálogo de rutinas + 100 logros.
- [`ROADMAP.md`](./ROADMAP.md) — visión a medio/largo plazo.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de versiones.
- [`docs/sessions/`](./docs/sessions/) — diario completo de sesiones.
- [`docs/porting.md`](./docs/porting.md) — cómo portar a Next.js / Chrome / Android.
- [`HANDOFF.md`](./HANDOFF.md) — snapshot congelado v0.9 (referencia histórica).
