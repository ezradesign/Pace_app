# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.11.10
**Última sesión:** #15 — 2026-04-22 · Logros: arreglo `explore.*` + estado "Próximamente"
**Última actualización de este archivo:** 2026-04-22 · sesión 15

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.11.10, carga limpio |
| `PACE_standalone.html` | Bundle offline inline | v0.11.10 (~186 KB) |
| `app/ui/pace-logo.png` | Logo oficial local (fallback SVG si falla) | Presente |
| `backups/PACE_standalone_v0.11.9_20260422.html` | Backup (1 atrás) | — |

Backups rotados con la regla "máximo 5 más recientes" (ver `CLAUDE.md`).
Nota: los backups previos (v0.11.6/7/8) existen en el repo local de GitHub
pero no se re-importaron en esta sesión (solo el más reciente). No es
regresión — son archivos versionados en git, no dependencias activas.

---

## 🧭 Última sesión (resumen operativo)

**Sesión 15 · v0.11.10 · Logros: arreglo `explore.*` + estado "Próximamente"**

Resolución mixta del backlog **#9** (logros sin trigger). Usuario eligió:
reparar lo recién roto + marcar lo nunca implementado como "Próximamente"
en la UI para incentivar curiosidad sin prometer de más.

- **Arreglo de los 6 `explore.*` de movilidad** rotos en sesión 14.
  El map `move.hips.5 → explore.hips` (+ shoulders / atg / ancestral /
  neck / desk) se mudó de `completeMoveSession` a `completeExtraSession`
  en `state.jsx`. Los ids `move.*` se conservan a pesar de vivir en
  `EXTRA_ROUTINES` (decisión activa: ids = identificadores estables).
- **3er estado visual "Próximamente"** en `Achievements.jsx`. Nuevo Set
  `IMPLEMENTED_ACHIEVEMENTS` (26 ids con trigger hoy) + helper
  `isImplemented`. `Seal` pinta borde dotted, opacidad 0.38, glifo
  opaco 0.25, badge "Pronto" en esquina, descripción sustituida por
  "Pronto". Título visible (incentiva "lo quiero"). Secretos no entran
  en este estado (su mecánica es intriga).
- **Contador cabecera reescrito**: `X / 26 disponibles · 74 Próximamente`
  (antes `X / 100 descubiertos · Y Por descubrir`). Denominador
  dinámico: crece cuando se añaden triggers nuevos al set.
- **Títulos HTML realineados**: `PACE.html` decía aún `v0.11.8`.
  Corregido a `v0.11.10`.
- `PACE_VERSION` → `v0.11.10`.

Detalle completo: [`docs/sessions/session-15-logros-proximamente.md`](./docs/sessions/session-15-logros-proximamente.md).

---

## 📋 Backlog priorizado

### 🏆 Deuda de producto

- **#9 (reducido)** 19 logros visibles como "Próximamente" en la UI que
  aún no tienen trigger: `master.*` (24 entradas del catálogo, varias ya
  descontadas), `season.*` (10), `first.ritual/cycle/day/plan/return`,
  `streak.14/60/365`, `breathe.sessions.10/50`, `move.sessions.25`,
  `hydrate.week.perfect`, `morning.5`, `explore.all.*` (3),
  `explore.chrome`, `explore.tweaks`. Sin presión de sesión: la UI ya
  comunica correctamente que son futuros. Se irán implementando a
  medida que aporten valor. Candidatos de "fruta fácil" para próxima
  sesión corta: los 6 tweak-secrets (`secret.aged`, `.dark.mode`,
  `.mono`, `.seal`, `.illustrated`, `explore.tweaks`) son ~1 línea
  cada uno en `TweaksPanel.jsx`.

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

> Objetivo del usuario (sesión 15, 2026-04-22): **empezar a monetizar con
> Buy Me a Coffee + desarrollar funcionalidades al máximo.** El plan
> siguiente está ordenado para que monetización y completitud de producto
> se refuercen mutuamente.

### 💰 Frente 1 — Monetización (Buy Me a Coffee)

**Precondición estratégica:** PACE se vende por valores (todo local, sin
tracking, sin backend), no por escasez. **No freemium.** BMC es donación
voluntaria, no unlock de features. Romper esto destruye el diferencial
ético.

**Requisitos de diseño para integrarlo sin romper la estética:**

1. **Presencia visible pero calmada.** Botón "Apoya el proyecto ☕" en el
   sidebar (sección Sendero o footer) con paleta tierra y serif italic.
   Nada amarillo fosforito. Nada permanente que parpadee.
2. **Razón explícita para pagar.** Modal opcional "Por qué PACE es gratis
   y seguirá siéndolo" con la filosofía + link a BMC. La gente paga
   valores tanto como funciones.
3. **Momento elegido, no impuesto.** Trigger después de: 7 días de racha,
   primer logro de maestría, o 3 días consecutivos completando el plan.
   Nunca al arrancar. Nunca bloqueando flujos.
4. (Opcional) **Wall of thanks** — tier de supporters con nombre visible
   en un modal "Gracias". Muy potente si la app se abre en open source.

**Preguntas de diseño pendientes para la sesión:**
- ¿Widget oficial de BMC (JS embebido) o link externo simple?
- ¿Cuánto agresiva la presencia? ¿Sidebar permanente, trigger por logros,
  solo en menú oculto?
- ¿Incluir Wall of thanks desde el inicio o más adelante?

### 🚀 Frente 2 — Funcionalidades (ordenado por coste/impacto)

**Alto impacto · coste bajo (hacer primero):**

1. **6 tweak-secrets fáciles** (~1h) — `secret.aged`, `.dark.mode`,
   `.mono`, `.seal`, `.illustrated`, `explore.tweaks`. ~1 línea cada uno
   en `TweaksPanel.jsx`. Baja "Próximamente" de 19 a 13.
2. **Sonidos sutiles** (~2h) — el toggle ya existe en Tweaks, faltan 3–4
   WAVs: click timer, fin pomodoro, inhalar/exhalar, +1 vaso. Fuente:
   [freesound.org](https://freesound.org) con licencia CC0.
3. **3 triggers obvios de logros** (~2h) — `first.ritual` (4 módulos en
   1 día), `first.cycle` (pomodoro + pausa activa), `first.plan` (plan
   del día completo). Los datos ya están en el state, solo falta el
   detector.

**Alto impacto · coste medio:**

4. **Extensión Chrome popup 340×480** (~1 sesión larga) — ventaja
   competitiva enorme. El código ya está modularizado para reutilizar.
   Triplica el espacio para CTA de BMC (popup + new tab + web).
5. **Rachas largas** (~1–2h) — `streak.14/30/60/365`. Cálculo trivial,
   impacto emocional alto.
6. **Notificaciones del navegador para agua** (~2h) — reintroducir UI de
   recordatorios como modal + Web Notifications API. El state ya
   conserva `reminders: []` por decisión activa.

**Medio impacto · coste alto (más adelante):**

7. **Layout "Editorial"** — el tweak está listado pero sin impl visual.
   Potencial estético brutal, pero requiere diseño desde cero.
8. **Export CSV/JSON** de logros, sesiones, minutos. Útil para power
   users. No monetizar como "pro feature" — respeta el principio "todo
   gratis".

### 🗺️ Secuencia recomendada

1. **Sesión corta** (próxima): puntos 1+2+5 del frente 2 → la app se
   siente "completa" (30+ logros cazables + sonidos + rachas largas).
2. **Sesión larga**: Chrome Extension (punto 4) → triplicas superficie
   de uso y de CTA de BMC.
3. **Sesión corta**: integración BMC (frente 1) → con app completa y
   Chrome listos, la donación tiene sentido.

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
