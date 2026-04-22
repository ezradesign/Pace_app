# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.11.11
**Última sesión:** #16 — 2026-04-22 · Integración Buy Me a Coffee (frente 1 de monetización)
**Última actualización de este archivo:** 2026-04-22 · sesión 16

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.11.11, carga limpio |
| `PACE_standalone.html` | Bundle offline inline | v0.11.11 (~198 KB) |
| `app/ui/pace-logo.png` | Logo oficial local (fallback SVG si falla) | Presente |
| `app/support/SupportModule.jsx` | Botón + modal Buy Me a Coffee | Nuevo, v0.11.11 |
| `backups/PACE_standalone_v0.11.10_20260422.html` | Backup (1 atrás) | — |
| `backups/PACE_standalone_v0.11.9_20260422.html` | Backup (2 atrás) | — |

Backups rotados con la regla "máximo 5 más recientes" (ver `CLAUDE.md`).
Los backups previos (v0.11.6/7/8) existen en el repo de GitHub pero no se
re-importaron en esta sesión. No es regresión — son archivos versionados
en git, no dependencias activas.

---

## 🧭 Última sesión (resumen operativo)

**Sesión 16 · v0.11.11 · Integración Buy Me a Coffee**

Frente 1 del plan de monetización ejecutado completo. Respeta los 3
principios planteados en la sesión anterior: presencia calmada, razón
por valores, momento elegido.

- **Módulo nuevo `app/support/SupportModule.jsx`** con `SupportButton`
  (pill discreto en footer del sidebar), `SupportModal` (hero de taza
  terracota + título *"PACE es gratis. Y lo seguirá siendo."* + 3
  valores + botón a BMC + `Ya doné →`) y hook `useSupportAutoTrigger`
  que abre el modal una sola vez al llegar a 7 días de racha.
- **Logro `secret.supporter`** ("Sostienes el pasto", glifo `✦`)
  añadido al catálogo y a `IMPLEMENTED_ACHIEVEMENTS` (5/21 secretos
  con trigger). Activable por honor desde el modal.
- **Tweak `supportCopyVariant`** con 3 opciones (`cafe` default,
  `pasto`, `vaca`) actualiza el copy del pill y del botón primario en
  vivo.
- **Campos nuevos en state**: `supportSeenAt` (timestamp, inhibe
  auto-trigger) y `supportCopyVariant`. Se suman al patrón existente
  de persistencia via localStorage.
- **Corrección de versión arrastrada**: `PACE_VERSION` en `state.jsx`
  era `v0.11.9` aunque STATE.md y PACE.html decían `v0.11.10`.
  Corregido a `v0.11.11`.
- Backup rotado `backups/PACE_standalone_v0.11.10_20260422.html`.

Detalle completo: [`docs/sessions/session-16-bmc-integracion.md`](./docs/sessions/session-16-bmc-integracion.md).

---

## 📋 Backlog priorizado

### 🏆 Deuda de producto

- **#9 (reducido)** ~19 logros visibles como "Próximamente" en la UI que
  aún no tienen trigger: `master.*` (24 entradas del catálogo, varias ya
  descontadas), `season.*` (10), `first.ritual/cycle/day/plan/return`,
  `streak.14/60/365`, `breathe.sessions.10/50`, `move.sessions.25`,
  `hydrate.week.perfect`, `morning.5`, `explore.all.*` (3),
  `explore.chrome`, `explore.tweaks`. La UI ya comunica correctamente
  que son futuros. Candidatos de "fruta fácil" para próxima sesión
  corta: los 6 tweak-secrets (`secret.aged`, `.dark.mode`, `.mono`,
  `.seal`, `.illustrated`, `explore.tweaks`) son ~1 línea cada uno en
  `TweaksPanel.jsx`.

### 🎨 Diseño pendiente (del roadmap corto)

- Layout "Editorial" (tweak listado pero sin impl visual distinta al sidebar).
- Mockups extensión Chrome (popup 340×480 + nueva pestaña).
- Sonidos sutiles (hay toggle pero no archivos WAV).

---

## ⚠️ Decisiones activas

Decisiones tomadas en sesiones previas que **siguen condicionando** cómo
trabajar. No son historia — son reglas vigentes. Si una se invalida,
moverla a la sesión en la que cambió (`docs/sessions/session-NN-xxx.md`)
con nota explícita y quitarla de aquí. Las más recientes primero.

- **Donar no desbloquea nada funcional** en PACE. `secret.supporter`
  es un sello visible en la colección, nada más. Sin verificación,
  solo honor. Sumar unlocks tangibles por donar rompería el
  diferencial ético del producto. (Sesión 16.)
- **El auto-trigger del modal de apoyo se dispara una sola vez** por
  instalación, a los 7 días de racha. Inhibido para siempre por
  `state.supportSeenAt` (timestamp) al primer open (auto o manual).
  El usuario puede re-abrir desde el sidebar las veces que quiera.
  (Sesión 16.)
- **`BMC_USERNAME` es hard-coded en `SupportModule.jsx`**. No se
  expone como tweak porque identifica al autor del producto, no al
  usuario. Un fork cambia esa constante y punto. (Sesión 16.)

- **`IMPLEMENTED_ACHIEVEMENTS` en `Achievements.jsx` es la fuente de
  verdad sobre qué logros se pueden cazar hoy.** Al añadir un trigger
  (en `state.jsx`, `main.jsx`, módulos), hay que añadir su id al set.
  Si no, el logro aparecerá como "Pronto" en la UI aunque se
  desbloquee internamente. (Sesión 15.)
- **Los secretos nunca muestran estado "Próximamente"**, incluso sin
  trigger. Su mecánica es intriga, no señalización. Se pintan siempre
  como secretos (`?` / "Secreto" / "?????"). (Sesión 15.)
- **Los ids de rutina son identificadores estables, no clasificación
  semántica.** Un id `move.hips.5` puede vivir en `EXTRA_ROUTINES` (como
  ocurre desde sesión 14) y un id `extra.chair.dips` puede vivir en
  `MOVE_ROUTINES`. Si se reordena el contenido, **no renombrar los ids**:
  romperían los logros desbloqueados en localStorage de usuarios
  existentes. Por el mismo motivo, el map `explore.*` en
  `completeExtraSession` conserva los ids `move.*` como claves aunque
  vivan en `EXTRA_ROUTINES`. (Sesión 14, reafirmada en sesión 15.)
- **Extra suma minutos al bucket Mueve** en `weeklyStats.moveMinutes`, no a
  uno propio. `plan.extra` sí se marca separado. Tras el swap de sesión
  14, la justificación pasa de "calistenia es movimiento" a
  "estiramientos son cuerpo activo" — decisión vigente, solo cambia el
  texto explicativo. Si se quisiera un cuarto gráfico "Estira" en
  WeeklyStats: añadir `extraMinutes: [0*7]` al state + case en
  `completeExtraSession`. (Sesión 10, reafirmada en sesión 14.)
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

> Estado actual: Frente 1 (monetización BMC) ✅ completo. Queda
> alimentar la app con funcionalidades para que la donación tenga
> más sentido y alcance más usuarios.

### 🚀 Frente 2 — Funcionalidades (ordenado por coste/impacto)

**Alto impacto · coste bajo (hacer primero):**

1. **6 tweak-secrets fáciles** (~1h) — `secret.aged`, `.dark.mode`,
   `.mono`, `.seal`, `.illustrated`, `explore.tweaks`. ~1 línea cada
   uno en `TweaksPanel.jsx`. Baja "Próximamente" de 19 a ~13.
2. **Sonidos sutiles** (~2h) — el toggle ya existe en Tweaks, faltan
   3–4 WAVs: click timer, fin pomodoro, inhalar/exhalar, +1 vaso.
   Fuente: [freesound.org](https://freesound.org) con licencia CC0.
3. **3 triggers obvios de logros** (~2h) — `first.ritual` (4 módulos
   en 1 día), `first.cycle` (pomodoro + pausa activa), `first.plan`
   (plan del día completo). Los datos ya están en el state, solo
   falta el detector.

**Alto impacto · coste medio:**

4. **Rachas largas** (~1–2h) — `streak.14/30/60/365`. Cálculo trivial,
   impacto emocional alto. Baja "Próximamente" de ~19 a ~15.
5. **Extensión Chrome popup 340×480** (~1 sesión larga) — ventaja
   competitiva enorme. El código ya está modularizado para reutilizar.
   Triplica el espacio para CTA de BMC (popup + new tab + web).
6. **Notificaciones del navegador para agua** (~2h) — reintroducir UI
   de recordatorios como modal + Web Notifications API. El state ya
   conserva `reminders: []` por decisión activa.

**Medio impacto · coste alto (más adelante):**

7. **Layout "Editorial"** — el tweak está listado pero sin impl visual.
   Potencial estético brutal, pero requiere diseño desde cero.
8. **Export CSV/JSON** de logros, sesiones, minutos. Útil para power
   users. No monetizar como "pro feature" — respeta el principio
   "todo gratis".

### 🗺️ Secuencia recomendada

1. **Sesión corta** (próxima): puntos 1+2+4 → la app se siente
   "completa" con ~30 logros cazables + sonidos + rachas largas.
2. **Sesión larga**: Chrome Extension (punto 5) → triplicas superficie
   de uso y de CTA de BMC.
3. **Sesión media**: resto de triggers (punto 3) + layout editorial
   o notificaciones (según preferencia).

### 📋 Plantilla para arrancar próxima sesión

```
Proyecto PACE. Importa la última versión desde
https://github.com/ezradesign/Pace_app y lee STATE.md
antes de tocar nada. Tarea de hoy: [elegir de la lista].
[Incluye binarios: app/ui/pace-logo.png]
```

---

## 🐛 Bugs / issues abiertos conocidos

*Ninguno reportado al cerrar sesión 15.*

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
