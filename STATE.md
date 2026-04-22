# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.11.9
**Última sesión:** #14 — 2026-04-22 · Swap Mueve ↔ Estira (contenido invertido + título del modal obsoleto)
**Última actualización de este archivo:** 2026-04-22 · sesión 14

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.11.9, carga limpio |
| `PACE_standalone.html` | Bundle offline inline | v0.11.9 (~182 KB) |
| `app/ui/pace-logo.png` | Logo oficial local (fallback SVG si falla) | Presente |
| `backups/PACE_standalone_v0.11.5_20260422.html` | Backup (4 atrás) | — |
| `backups/PACE_standalone_v0.11.6_20260422.html` | Backup (3 atrás) | — |
| `backups/PACE_standalone_v0.11.7_20260422.html` | Backup (2 atrás) | — |
| `backups/PACE_standalone_v0.11.8_20260422.html` | Backup (1 atrás) | — |

Backups rotados con la regla "máximo 5 más recientes" (ver `CLAUDE.md`).

---

## 🧭 Última sesión (resumen operativo)

**Sesión 14 · v0.11.9 · Swap Mueve ↔ Estira**

Bug arrastrado desde el rebrand parcial de sesión 02: el botón **"Estira"**
abría calistenia y el botón **"Mueve"** abría estiramientos — al revés de
lo que los nombres prometían. Además el modal de "Estira" mostraba el
título obsoleto `"Extra"`.

- **Swap de contenido a nivel de array**, no de cableado:
  `MOVE_ROUTINES` pasa a contener las 7 rutinas de calistenia/fuerza;
  `EXTRA_ROUTINES` pasa a contener las 7 rutinas de movilidad. Tokens de
  color, iconos y funciones de completion quedan intactos — cada botón
  sigue con su paquete estético.
- **Ids `move.*` / `extra.*` no se renombran** al moverse de array.
  Permanecen atados a su rutina histórica para no invalidar localStorage
  de usuarios existentes.
- **Modales renombrados:** `"Movilidad"` → `"Mueve"` y `"Extra"` → `"Estira"`,
  con subtítulos y metas acordes. `ExtraLibrary` recibe la misma fila
  `meta + encabezado "Rutinas"` que ya tenía `MoveLibrary` para emparejar
  la estructura visual.
- `PACE_VERSION` → `v0.11.9`.

Deuda menor introducida: el map `explore.hips/.shoulders/.atg/.ancestral/.neck/.desk`
dentro de `completeMoveSession` queda sin disparar (esas rutinas ahora
pasan por `completeExtraSession`). Se suma al backlog **#9**.

Detalle completo: [`docs/sessions/session-14-swap-mueve-estira.md`](./docs/sessions/session-14-swap-mueve-estira.md).

---

## 📋 Backlog priorizado

### 🏆 Deuda de producto

- **#9** 19 logros sin trigger (`master.*`, `season.*`, `first.ritual`,
  `streak.14/60/365`, etc.) **+ 6 logros `explore.*` huérfanos tras el
  swap de sesión 14** (sus rutinas de movilidad ahora pasan por
  `completeExtraSession`, que no los mira). Decidir: o implementar
  triggers, o marcarlos en la UI como "próximamente" con un glifo
  distinto. Al resolver hay que mover el map de `explore.*` desde
  `completeMoveSession` a `completeExtraSession` (o parametrizarlo).

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

- **Los ids de rutina son identificadores estables, no clasificación
  semántica.** Un id `move.hips.5` puede vivir en `EXTRA_ROUTINES` (como
  ocurre desde sesión 14) y un id `extra.chair.dips` puede vivir en
  `MOVE_ROUTINES`. Si se reordena el contenido, **no renombrar los ids**:
  romperían los logros desbloqueados en localStorage de usuarios
  existentes. (Sesión 14.)
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

1. Decidir qué hacer con los 19 + 6 logros sin trigger (**#9**):
   implementar triggers reales o marcarlos en la UI como "próximamente"
   con glifo distinto. Requiere decisión de diseño antes de tocar código.
2. Mockups extensión Chrome (popup 340×480 + nueva pestaña).
3. Layout "Editorial" — el tweak está listado pero a día de hoy no
   renderiza nada distinto al sidebar.
4. Sonidos sutiles (hay toggle en Tweaks pero no archivos WAV).

---

## 🐛 Bugs / issues abiertos conocidos

*Ninguno reportado al cerrar sesión 14.*

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
