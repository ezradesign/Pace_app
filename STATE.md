# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.11.8
**Última sesión:** #13 — 2026-04-22 · Backlog de robustez (6 bugs del informe de auditoría)
**Última actualización de este archivo:** 2026-04-22 · sesión 13

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.11.8, carga limpio |
| `PACE_standalone.html` | Bundle offline inline | v0.11.8 (~181 KB) |
| `app/ui/pace-logo.png` | Logo oficial local (fallback SVG si falla) | Presente |
| `backups/PACE_standalone_v0.11.5_20260422.html` | Backup (3 atrás) | — |
| `backups/PACE_standalone_v0.11.6_20260422.html` | Backup (2 atrás) | — |
| `backups/PACE_standalone_v0.11.7_20260422.html` | Backup (1 atrás) | — |

Backups rotados con la regla "máximo 5 más recientes" (ver `CLAUDE.md`).

---

## 🧭 Última sesión (resumen operativo)

**Sesión 13 · v0.11.8 · Backlog de robustez**

Cerrado el bloque pendiente del informe de auditoría (sesión 10). 6 bugs
corregidos + 1 documentado. Sin cambio de UX salvo #25.

- **#7** `FocusTimer`: `completePomodoro()` sale del reducer de
  `setRemainingSec` a un `useEffect` dedicado. Previene doble-conteo de
  pomodoro en React 19 / StrictMode.
- **#6 + #5** `state.jsx`: `completePomodoro` y `addFocusMinutes` con
  `setState(prev => ...)` atómico. Umbrales de horas calculados sobre
  `nextTotal` dentro del updater.
- **#1** Buffer `_pendingToasts` en `state.jsx`: los toasts disparados
  antes del mount del `ToastHost` se encolan y drenan al registrar el
  primer listener.
- **#30** `Math.max(0, c-1)` en `setPrepCount` de Breathe + Move
  (cinturón redundante).
- **#25** `BreakMenu`: atajos **B/M/H/Esc** ahora realmente funcionan
  (la UI los anunciaba sin implementarlos).
- **#29** Documentado: `onExit(reason)` en sesiones queda disponible para
  un futuro consumidor; sin cambio de comportamiento.

Detalle completo: [`docs/sessions/session-13-backlog-robustez.md`](./docs/sessions/session-13-backlog-robustez.md).

---

## 📋 Backlog priorizado

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
- **Importación desde GitHub incluye assets binarios.** Al arrancar una
  sesión con `github_import_files`, la lista de paths debe incluir
  `app/ui/pace-logo.png` (y cualquier WAV/fuente futuros). Si se olvidan,
  el usuario ve el fallback SVG del logo durante la sesión sin que haya
  regresión de código. (Sesión 13.)

---

## 📋 Próximos pasos recomendados

1. Decidir qué hacer con los 19 logros sin trigger (**#9**): implementar
   triggers reales o marcarlos en la UI como "próximamente" con glifo
   distinto. Requiere decisión de diseño antes de tocar código.
2. Mockups extensión Chrome (popup 340×480 + nueva pestaña).
3. Layout "Editorial" — el tweak está listado pero a día de hoy no
   renderiza nada distinto al sidebar.
4. Sonidos sutiles (hay toggle en Tweaks pero no archivos WAV).

---

## 🐛 Bugs / issues abiertos conocidos

*Ninguno reportado al cerrar sesión 13. El backlog funcional del informe
de auditoría (sesión 10) queda cerrado con esta sesión.*

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
