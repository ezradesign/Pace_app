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

### 🎯 Próxima sesión corta (recomendada)

Combo de 5h con alto impacto emocional. Refuerza el argumento del
modal de BMC: cuando dice "Todo local", ahora es literalmente
exportable; cuando dice "Para siempre", tienes un backup físico.

1. **Welcome screen de primera vez** (~2h) — Modal único que aparece
   cuando `state.firstSeen == null`. Saludo editorial corto, no
   onboarding largo. Logo Pace + frase manifesto + 3 valores en
   positivo ("Todo local · Sin cuentas · Siempre gratis") + botón
   "Empezar". Opcional: pedir intención inicial ("¿Qué quieres
   cultivar?") que se guarda en `state.intention` — deja algo útil.
   Patrón técnico idéntico a `SupportModal`: flag
   `state.firstSeen: null → timestamp`, hook `useFirstTimeWelcome`,
   evento `pace:open-welcome` para re-abrir desde Tweaks dev.
2. **Export/Import JSON** (~2h) — Botón "Exportar mis datos" en
   TweaksPanel descarga `pace-backup-YYYYMMDD.json` con
   `localStorage.getItem('pace.state.v1')`. Botón "Importar" con
   input file: valida schema, pregunta confirmación ("¿Sobreescribir
   datos actuales? N logros, M minutos..."), hace merge o replace.
   Añadir `exportedAt` y `version` al JSON para migración futura.
   Refuerza valor "todo local" de BMC: ahora es local Y portátil.
3. **6 tweak-secrets** (~1h) — fruta fácil, ~1 línea cada uno en
   `TweaksPanel.jsx`: `secret.aged`, `.dark.mode`, `.mono`, `.seal`,
   `.illustrated`, `explore.tweaks`. Baja "Próximamente" de 19 a 13.
   Recompensa la exploración de forma natural.

### 🚀 Frente 2 — Funcionalidades (ordenado por coste/impacto)

**Alto impacto · coste bajo:**

- **Sonidos sutiles** (~2h) — el toggle ya existe en Tweaks, faltan
  3–4 WAVs: click timer, fin pomodoro, +1 vaso, inhalar/exhalar.
  Fuente: [freesound.org](https://freesound.org) con licencia CC0.
- **3 triggers obvios de logros** (~2h) — `first.ritual` (4 módulos
  en 1 día), `first.cycle` (pomodoro + pausa activa), `first.plan`
  (plan del día completo). Datos ya en state, solo falta el detector.

**Alto impacto · coste medio:**

- **Rachas largas** (~1–2h) — `streak.14/30/60/365`. Cálculo trivial,
  impacto emocional alto. Baja "Próximamente" de ~19 a ~15.
- **Extensión Chrome popup 340×480** (~1 sesión larga) — ventaja
  competitiva enorme. El código ya está modularizado para reutilizar.
  Triplica el espacio para CTA de BMC (popup + new tab + web).
- **Notificaciones del navegador para agua** (~2h) — reintroducir UI
  de recordatorios como modal + Web Notifications API. El state ya
  conserva `reminders: []` por decisión activa.

**Medio impacto · coste alto (más adelante):**

- **Layout "Editorial"** — el tweak está listado pero sin impl visual.
  Potencial estético brutal, pero requiere diseño desde cero.
- **Historial visual ("año en pace")** — vista anual tipo GitHub
  contributions pero con tierra/oliva en vez de verde. Muy
  satisfactorio visualmente cuando la app acumula datos.

### 📌 Preferencia baja (pendientes de diseño antes de implementar)

Ideas válidas pero que requieren definición previa de producto/UX/visual.
No arrancar sin mockup o decisión explícita del usuario.

- **Google Calendar sync** — Sincronización opcional de pomodoros y
  sesiones completadas con un calendario Google. Problema filosófico:
  PACE se vende por "todo local, sin cuentas, sin backend". Meter
  OAuth de Google contradice eso. Rutas posibles a explorar cuando
  toque:
  · **Opt-in explícito, 100% opcional**, con disclaimer claro en el
    modal de activación ("sólo si lo activas, conecta con Google").
  · **Exportar .ics en vez de OAuth** — sin cuentas, sin tracking,
    sigue siendo todo local. Menos "sync" y más "descarga para
    importar". Mucho más coherente con la filosofía.
  · **Decisión pendiente**: ¿OAuth real o .ics? El .ics alinea mejor
    con el producto; OAuth requiere backend (ruptura mayor).
  Entregable mínimo: mockup del flujo + decisión OAuth vs .ics antes
  de tocar código.

- **Cambiar glifos de logros** — Los glifos actuales son un mix de
  símbolos unicode (`✦`, `❦`, `❀`, `☉`, numerales romanos, etc.).
  Funciona pero es inconsistente: algunos están en el catálogo
  serif, otros parecen emoji degradado. Opciones a diseñar:
  · Set cohesivo de glifos SVG dibujados a mano en `app/ui/glyphs/`.
  · Biblioteca abstracta (Noun Project, Feather, custom) con paleta
    alineada a la categoría (`focus`/`breathe`/`move`/`achievement`).
  · Mantener unicode pero auditar y homogeneizar (misma familia
    tipográfica, mismo peso visual).
  Entregable mínimo: mood board + decisión de dirección visual +
  bocetos de 5–10 glifos representativos antes de remplazar el set
  entero.

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
