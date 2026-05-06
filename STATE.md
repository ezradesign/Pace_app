# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.22.1
**Última sesión:** #42 — 2026-05-06 · fix(ux): UX móvil — hints teclado + title attrs + timer + shortcut BreakMenu
**Última actualización de este archivo:** 2026-05-06 · sesión 42
**Build entregado:** `PACE_standalone.html` v0.22.1 (433 KB — regenerado con build-standalone.js)

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.20.0 patch** (mount loop: 6 checks + 5 s timeout — s38b) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.20.0 patch** (431 684 bytes, regenerado en s38b) |
| `LICENSE` | Elastic License 2.0 en la raíz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** (7 recetas nuevas: move.start/step/end, hydrate.sip/goal, achievement.unlock/secret — s40) |
| `app/ui/SessionShell.jsx` | Cáscara compartida de sesiones activas | **v0.17.0** (bug fix: useT en SessionDone) |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, `displayItalic` | **v0.19.0** (`useT` + `aria-label` migrado a `common.close`) |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos (palette/font/logo) | **v0.22.0** (extraído de TweaksPanel — sesión 41) |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (antes Tweaks) | **v0.22.0** (split: 479 líneas; i18n ambient toggle — sesión 41) |
| `app/breathe/BreatheVisual.jsx` | Respiración — visual + getSequence | **v0.16.0** (nuevo · extraído de BreatheModule) |
| `app/breathe/BreatheLibrary.jsx` | Respiración — biblioteca + seguridad | **v0.17.0** (i18n migrado) |
| `app/breathe/BreatheSession.jsx` | Respiración — sesión guiada | **v0.20.0** (session.start/end + inhale/exhale con dur) |
| `app/move/MoveModule.jsx` | Módulo Mueve | **v0.21.0** (move.start/step/end cableados — s40) |
| `app/support/SupportModule.jsx` | Botón + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | v0.12.8 |
| `app/extra/ExtraModule.jsx` | Módulo Estira | **v0.17.0** (i18n migrado) |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.19.0** (trail hours + "Por descubrir" migrados a t()) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | v0.12.9 |
| `app/focus/FocusTimer.jsx` | Módulo Foco (pomodoro) | **v0.20.0** (pomodoro.start + pomodoro.end cableados) |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** (hydrate.sip/goal cableados — s40) |
| `app/breakmenu/BreakMenu.jsx` | Menú post-Pomodoro | **v0.15.0** (rotación inteligente: `computeScore` + sort + tag "Para ti" + indicador done) |
| `app/achievements/Achievements.jsx` | Catálogo + colección | **v0.17.0** (i18n: CAT_META labelKey + Achievements + Seal; 49 ids) |
| `app/state.jsx` | Store global + rollover + toast buffer | **v0.22.0** (+waterGoalDates, +routineCounts, +5 detectores logros — s41) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez + hook | **v0.19.0** (tooltip toggle lang → i18n keys) |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.21.0** (achievement.unlock/secret al mostrar toast — s40) |

Backups vigentes (7):
- `backups/PACE_standalone_v0.16.0_20260505.html`
- `backups/PACE_standalone_v0.17.0_20260505.html`
- `backups/PACE_standalone_v0.18.0_20260505.html`
- `backups/PACE_standalone_v0.19.1_20260505.html`
- `backups/PACE_standalone_v0.20.0_20260506.html`
- `backups/PACE_standalone_v0.21.0_20260506.html`
- `backups/PACE_standalone_v0.22.0_20260506.html`

---

## 🧭 Última sesión (resumen operativo)

**Sesión 42 · v0.22.0 → v0.22.1 · fix(ux): UX móvil — hints, title attrs, timer, shortcut**

### Qué se hizo

4 fixes quirúrgicos de UX móvil. Sin cambios de comportamiento en desktop ni en lógica de negocio.

- **SessionShell.jsx** — Regla `[data-pace-session-hint]` en el bloque CSS responsive reemplazada: de reescalar `bottom/font-size` a `display: none !important`. Hints de teclado invisibles en ≤640px.
- **MoveModule.jsx (B)** — Eliminados `title="←"`, `title="Espacio"`, `title="→"` de los tres botones de MoveSession.
- **MoveModule.jsx (C)** — `data-pace-move-timer` añadido al div del cronómetro de pasos. Nuevo bloque CSS `pace-move-responsive-css`: 128px → 72px en ≤640px.
- **BreakMenu.jsx** — `data-pace-break-shortcut` en el div contenedor de la fila shortcut. Nuevo bloque CSS `pace-break-responsive-css`: `.pace-meta` oculto en ≤640px (el botón "Saltar" sigue visible).
- **state.jsx** — Bump `PACE_VERSION` v0.22.0 → v0.22.1.

### Archivos modificados
`app/ui/SessionShell.jsx`, `app/move/MoveModule.jsx`, `app/breakmenu/BreakMenu.jsx`,
`app/state.jsx` (bump versión), `PACE_standalone.html` (433 KB),
`backups/PACE_standalone_v0.22.0_20260506.html` (rotación).

### Versión
- **v0.22.0** → **v0.22.1** (patch · bugfix).

### Pendiente funcional (próximas sesiones)
- Iconos PNG reales (192×512) para PWA.
- Heatmap mes/año ("Año en pace").
- README EN.
- Reddit launch.
- Glifos SVG (dirección visual pendiente de validación del usuario).

---

## 🗓️ Sesión anterior — #35 (resumen condensado)

**Sesión 35 · v0.16.0 → v0.17.0 · i18n ES/EN completo: auditoría + bugs + migración total.**
Auditoría de migración externa (2 crashes + 1 code smell corregidos). Migración i18n de 6 módulos:
BreatheLibrary, MoveModule, ExtraModule, HydrateModule, WeeklyStats, Achievements. ~80 claves
nuevas en strings.js. Standalone ~397 KB. Detalle:
[`docs/sessions/session-35-i18n-completo.md`](./docs/sessions/session-35-i18n-completo.md).

---

## 🗓️ Sesión #28 (resumen condensado)

**Sesión 28 · v0.12.10 → v0.13.0 · Fruta fácil: triggers + rachas + sonidos**.
Sesión corta de tres bloques: 5 triggers de "Primeros pasos"
(`first.cycle/ritual/day/plan/return` — categoría cerrada al
100% 10/10), 3 rachas largas (`streak.14/60/365`) +
`master.focus.day` (4h foco/día), y módulo nuevo `app/ui/Sound.jsx`
con sonidos sintetizados Web Audio (4 recetas: tick / complete /
sip / breath, ADSR suaves, sin samples). Cableado en FocusTimer
(fin de bloque), HydrateTracker (vaso) y BreatheModule (cambio
de fase). Decisión técnica activa: sintetizar antes que descargar
WAVs (~3 KB vs 50-100 KB, coherencia "campana de campo, no click
digital"). 0 cambios visuales. Detalle:
[`docs/sessions/session-28-fruta-facil-logros-sonidos.md`](./docs/sessions/session-28-fruta-facil-logros-sonidos.md).

---

## 🗓️ Sesión #27 (resumen condensado)

**Sesión 27 · v0.12.9 → v0.12.10 · Modales responsive en móvil**.
Se cerró el último frente bloqueante pre-v1.0 de adaptación móvil:
los 10 modales del producto, `SessionShell` (pantallas Respira/
Mueve) y `TweaksPanel` reciben tratamiento responsive con el patrón
establecido (decisión activa sesión 22: bloque `<style>` con
selectores `[data-pace-*]` y `!important`). Modal pasa a sheet
inferior en móvil; `TweaksPanel` se transforma en bottom-sheet
full-width. ~40 data-attrs, 3 bloques CSS, 12 superficies modales,
3 archivos. +7 KB. 0 cambios visuales en desktop. Detalle:
[`docs/sessions/session-27-modales-mobile.md`](./docs/sessions/session-27-modales-mobile.md).

---

## 🗓️ Sesiones anteriores (resumen)

**Sesión 26 · v0.12.8 → v0.12.9 · Refactor Fase 2 + cierre de licencia + 4ª vía de monetización**

La sesión se desdobló en dos tramos:
1. **Tramo A (mañana)** — v0.12.7 → v0.12.8 — refactor Fase 2 (4 ítems A).
2. **Tramo B (tarde, 17:00)** — v0.12.8 → v0.12.9 — cierre de la decisión
   de licencia + ampliación del modelo de monetización a 4 vías.

---

### Tramo B — v0.12.9 · Licencia + 4ª vía de monetización

Se cierra la propuesta [`docs/proposals/license-analysis.md`](./docs/proposals/license-analysis.md)
pendiente desde la redacción del análisis. El usuario aprobó
**Elastic License 2.0** tras evaluar las 5 preguntas del apartado 7 del
análisis. En la misma sesión se aprovechó para ampliar
`MONETIZATION.md` de 3 vías (Lifetime + Temporadas + Donaciones) a
**4 vías** añadiendo el **Pase mensual** (pago puntual con caducidad,
sin renovación, sin backend — no es suscripción clásica).

**Archivos tocados:**
- **Nuevo:** `LICENSE` (Elastic License 2.0, copyright © 2026 ezradesign).
- **README.md:** versión v0.12.2 → v0.12.9, nombre de build correcto,
  tamaño actualizado, sección "Licencia" reescrita en claro,
  `LICENSE` añadido al diagrama de estructura.
- **MONETIZATION.md:** reescrito a 4 vías, bloque del Pase mensual
  añadido, bloque "Cómo conviven las 4 vías", "❌ Suscripción mensual"
  matizado (lo que se descarta es la suscripción con renovación +
  backend, no el pago puntual con caducidad).
- **Cabeceras de copyright** en `app/state.jsx`, `app/main.jsx`,
  `app/ui/Primitives.jsx`, `app/ui/SessionShell.jsx`.
- **`app/state.jsx`:** `PACE_VERSION` bump v0.12.8 → v0.12.9.
- **`PACE.html`:** título bumpeado.
- **`CHANGELOG.md`:** entrada v0.12.9 completa.
- **`STATE.md`:** este archivo — celdas de versión, última sesión,
  decisión activa nueva al tope.
- **`PACE_standalone.html`:** regenerado con `super_inline_html`.
- **`backups/PACE_standalone_v0.12.8_20260423_1700.html`:** backup
  del v0.12.8 antes de la regeneración.

**Regla respetada:** 0 cambios de comportamiento observable. Todo es
documentación, metadata y cabeceras. La app v0.12.9 se ve y se
comporta idéntica a v0.12.8.

---

### Tramo A — v0.12.8 · Refactor Fase 2 (4 ítems A ejecutados)

Ejecución disciplinada de los 4 ítems de prioridad A validados al
cierre de la sesión 25 en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md).
Regla no negociable respetada: **ningún cambio de comportamiento
observable**. La app post-sesión 26 se ve y se comporta idéntica
a v0.12.7.

### Qué se hizo

1. **`app/ui/SessionShell.jsx` extraído** — cáscara compartida de
   sesiones activas. Absorbe la duplicación top-1 del repo:
   `sessionStyles`/`moveSessionStyles` + `SessionHeader`/`MoveHeader` +
   `Stat`/`MoveStat` + pantallas `prep`/`done`. API: `<SessionShell>`,
   `<SessionPrep>`, `<SessionDone>`, `<SessionStat>`. BreatheModule
   pasa de 740 a ~565 líneas; MoveModule de ~360 a ~280.

2. **Support limpiado** — borrados `CupIcon` (17 líneas) y `BigCup`
   (22 líneas) que no se renderizaban desde v0.12.2. Callsites que
   pasaban `variant={state.supportCopyVariant}` a `<SupportIcon>` /
   `<SupportHero>` saneados. Firma de `supportCopy()` sin argumento.
   El campo `state.supportCopyVariant` se conserva por compat
   localStorage (decisión ya documentada).

3. **Exports a `window` saneados** — 17 símbolos innecesarios retirados
   del namespace global entre Breathe, Move, Extra y CowLogo. Solo se
   exponen los componentes realmente consumidos fuera del módulo
   (`BreatheLibrary`/`BreatheSafety`/`BreatheSession`, `MoveLibrary`/
   `MoveSession`, `ExtraLibrary`, `PaceWordmark`). Las variantes
   `CowLogoLineal/Sello/Ilustrado` siguen vivas por compat legacy
   pero internas.

4. **Helper `displayItalic` añadido** a `Primitives.jsx` y aplicado
   en ~25 sitios de la misma línea. Quedan ~20 sitios multi-línea en
   `WelcomeModule`, `Achievements` internos, `HydrateModule`, `main.jsx`
   y `Sidebar.jsx` que se atacarán cuando sea conveniente (el helper
   ya está disponible).

### Resultado cuantitativo
- **~115 líneas menos** en neto (Breathe+Move pierden ~255,
  SessionShell aporta ~140).
- **62 líneas de dead code** eliminadas (CupIcon + BigCup + callsites).
- **17 símbolos globales** retirados del `window`.
- **Un único sitio** donde vive el layout de sesión activa —
  prepara el terreno para la adaptación de modales a móvil.

### Verificación
- Preview de `PACE.html` y `PACE_standalone.html` limpia.
- No hay imports rotos tras el saneo de exports (grep verificado).
- No se probaron manualmente sesiones largas (rondas Wim Hof, Mueve
  con flechas) — riesgo bajo, conservación de estructura JSX.

### Archivos
- **Nuevo:** `app/ui/SessionShell.jsx`.
- **Modificados:** `PACE.html`, `state.jsx`, `Primitives.jsx`,
  `BreatheModule.jsx`, `MoveModule.jsx`, `ExtraModule.jsx`,
  `SupportModule.jsx`, `CowLogo.jsx`, `Achievements.jsx`,
  `BreakMenu.jsx`, `FocusTimer.jsx`, `Sidebar.jsx`, `WeeklyStats.jsx`,
  `TweaksPanel.jsx`, `Toast.jsx`.
- **Docs:** `docs/sessions/session-26-refactor-fase2.md` añadido,
  `CHANGELOG.md` ampliado, `STATE.md` reescrito.
- **Standalone:** `PACE_standalone.html` regenerado (~349 KB);
  backup `backups/PACE_standalone_v0.12.7_20260423.html` (creado
  en el tramo A local; en el snapshot 17:25 entregado aparece
  solo el backup v0.12.8 del tramo B porque el del tramo A ya
  estaba en GitHub).

### Versión
- `v0.12.7` → **`v0.12.8`** (patch · refactor conservador).
- `v0.12.8` → **`v0.12.9`** (patch · licencia sin cambio de comportamiento,
  tramo B de la misma sesión).

Detalle del tramo A: [`docs/sessions/session-26-refactor-fase2.md`](./docs/sessions/session-26-refactor-fase2.md).
Detalle del tramo B: este STATE + [`CHANGELOG.md`](./CHANGELOG.md#v0129--2026-04-23--licencia--4ª-vía-de-monetización).

---

## 📋 Backlog priorizado

### 🚨 Bloqueante pre-v1.0

- ~~**Responsive móvil (home + sidebar)**~~ ✅ Resuelto en
  sesiones 22-23-24 (v0.12.5 → v0.12.7).
- ~~**Responsive móvil (modales)**~~ ✅ Resuelto en sesión 27
  (v0.12.10). Patrón `<style>` + `data-pace-*` + `!important`
  aplicado a `Primitives.Modal` (cubre 10 modales), `SessionShell`
  (pantallas Respira/Mueve) y `TweaksPanel` (bottom-sheet). La app
  es utilizable en 375×812 de principio a fin.

### ✅ Refactor Fase 2 completado en sesión 26

Los 4 ítems de prioridad A del informe
[`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md)
se ejecutaron en sesión 26 (v0.12.8). Detalle en
[`docs/sessions/session-26-refactor-fase2.md`](./docs/sessions/session-26-refactor-fase2.md).

### 🛠️ Refactor aplazado (sesión 27 o más tarde · prioridad B/C)

- **`displayItalic` en ~20 sitios multi-línea restantes** —
  `WelcomeModule.jsx` (5), `Achievements.jsx` estilos internos (2),
  `HydrateModule.jsx` (1), `main.jsx` (2), `Sidebar.jsx` (2),
  `Stats.jsx` (1), `SupportModule.jsx` estilo heroIcon, más algunos
  en FocusTimer tipo subtítulo. El helper ya está en Primitives;
  la aplicación es mecánica y de bajo riesgo cuando se toque el
  archivo por otro motivo.
- **`useKeyboardShortcuts` hook consolidado** — 5 bloques de keydown
  casi idénticos entre BreakMenu, BreatheSession, MoveSession,
  PaceApp, Modal.
- ~~**Trocear `BreatheModule.jsx`**~~ ✅ Resuelto en sesión 34 (v0.16.0). Separado en `BreatheVisual.jsx` + `BreatheLibrary.jsx` + `BreatheSession.jsx`.
- **Decisión de producto sobre `CowLogoLineal/Sello/Ilustrado`** y
  `PaceLockup` (retirar vs conservar por retro-compat localStorage
  legacy).
- **`paceDate()` helper** para consolidar local/UTC (inconsistencia
  teórica en state vs TweaksPanel, impacto cero).
- **Limpiar comentarios obsoletos pre-v0.12.x** (Sidebar, FocusTimer).
- **Decisión de producto sobre `intention`, `reminders`, `font`**
  dormidos en state (pre-v1.0, requiere migración de localStorage).

### 🎯 Alto impacto · coste bajo

- ~~**Loop post-Pomodoro**~~ ✅ Resuelto en sesión 33 (v0.15.0).
  `BreakMenu` reordenado por `computeScore` + tag "Para ti" + indicador done.
- **Progresión 2+2+2** (~2-3h) — añadir campo `access` a rutinas
  y filtrar la biblioteca según estado desbloqueado. Placeholders
  visuales para ejercicios bloqueados. Ver `CONTENT.md`.
- ~~**3 triggers de primeros pasos**~~ ✅ Resuelto en sesión 28
  (v0.13.0). Cubiertos `first.cycle`, `first.ritual`, `first.plan`,
  `first.day`, `first.return` (5 en lugar de los 3 inicialmente
  previstos). Categoría "Primeros pasos" cerrada al 100%.
- ~~**Rachas largas**~~ ✅ Resuelto en sesión 28 (v0.13.0).
  `streak.14/60/365` dentro de `updateStreak`.
- ~~**Sonidos sutiles**~~ ✅ Resuelto en sesión 28 (v0.13.0).
  Decisión técnica: sintetizados con Web Audio API en lugar de
  WAVs CC0 — ver decisiones activas y `app/ui/Sound.jsx`. Hook
  `useSound` + función plana `playSound` cableados en FocusTimer,
  HydrateTracker y BreatheModule.
- ~~**6 detectores aplazados de logros**~~ ✅ Resuelto en sesión 29
  (v0.14.0). Cubiertos `breathe.sessions.10/50`, `move.sessions.25`,
  `morning.5`, `master.dawn`, `master.dusk`, `master.long.focus`.
  Constancia 11/15. Maestría 5/25.
- ~~**`master.collector.half/full`, `master.silent.day`, `master.retreat`**~~ ✅ Resuelto en sesión 34 (v0.16.0). Maestría 9/25.
- ~~**Detectores aplazados: hydrate.week.perfect + contadores tipo rutina**~~ ✅ Resuelto en sesión 41 (v0.22.0). Constancia 15/15, Maestría 13/25.
- **Detectores aplazados restantes** — `master.midnight.never` (30 días sin uso tras 23h). Maestría restante (12/25) sin detectores.

### 🎨 Medio plazo (requieren diseño previo)

- ~~**PWA instalable**~~ ✅ Resuelto en sesión 37 (v0.19.0). `manifest.json` conectado, `sw.js` registrado en `PACE.html` y standalone. Deuda pendiente: iconos PNG reales (actualmente SVG).
- **Ritmos semanal/mensual/anual** — evolución de `WeeklyStats`.
  Heatmap mensual + "año en pace" estilo GitHub contributions en
  paleta tierra.
- **CTB (premium)** — guion de 1 sesión + pista musical + mockup
  de pantalla inmersiva antes de tocar código.
- **Sesiones personalizadas Estira/Mueve (premium)** — mockup del
  constructor de rutinas.
- **Layout "Editorial"** — tweak listado sin impl visual.
- **Mockups extensión Chrome** — popup 340×480 + nueva pestaña.

### 🏆 Deuda de logros (sin cambios)

Logros visibles como "Próximamente" sin trigger:
`master.*` (restantes del catálogo), `season.*` (10),
`first.ritual/cycle/day/plan/return`, `streak.14/60/365`,
`breathe.sessions.10/50`, `move.sessions.25`,
`morning.5`, `explore.all.*` (3),
`explore.chrome`.

### 🔒 Pre-v1.0 monetización

- Elegir proveedor de compra externa (Lemon Squeezy preferido
  para UE como merchant of record, Gumroad como fallback) y
  generar claves firmables por producto.
- Sistema de validación offline de clave con clave pública
  embebida. 3 tipos de clave: `lifetime` · `pass` (con
  `expiresAt`) · `season:<id>`.
- **UI de "Introducir licencia"** en Tweaks — discreta, sin upsell.
  Sub-bloques mínimos decididos en sesión 26:
  · Estado actual (línea informativa: "Pase activo · caduca el X").
  · Aviso silencioso cuando queden ≤ 3 días ("Si quieres seguir
    con el contenido premium, puedes conseguir otro") + botón
    "Conseguir otro Pase".
  · Estado "expirado" con frase amable ("Los logros ganados
    siguen contigo") + botón "Conseguir un Pase".
  · **NO** contador agresivo, **NO** modal al abrir la app, **NO**
    badge rojo. Zero-presión como el resto del producto.
- **Semántica del Pase:** no se "renueva", se **vuelve a comprar**.
  El botón abre Lemon Squeezy en pestaña nueva → pago → clave nueva
  por email → se pega en el mismo sitio. Misma UX que la primera
  compra. (Decisión de sesión 26: no hay renovación automática
  porque rompería "todo local".)
- Dominio: `pace.app` ocupado. Evaluar alternativas — ver
  "Dominio pendiente" más abajo.

---

## ⚠️ Decisiones activas

- **Glifos del catálogo de logros: pendiente de elegir dirección
  visual.** El set actual mezcla unicode de varias familias
  (`✦ ❦ ❀ ☉ III VII 𓇼 𓂃 ◌ ▢ ⌢ ⚖ ※`) — funciona pero los pesos
  visuales y las familias tipográficas no casan. Sesión 29 entrega
  `design/glyphs-explorations.html` con 4 direcciones cerradas
  (Línea / Sello hundido / Marca a hierro / Constelación) y
  recomienda **híbrido A+B** (línea por defecto + sello solo en
  logros de cierre de categoría). Cuando el usuario valide, abrir
  sesión dedicada de redibujo (~4-5h: refactor de
  `ACHIEVEMENT_CATALOG` para aceptar `glyphSvg` + `seal`,
  redibujo de los 70 glifos restantes siguiendo la familia
  formal del canvas, actualizar `Toast.jsx` para renderizar SVG).
  Mantener el campo `glyph: string` como fallback durante la
  migración — el localStorage de usuarios existentes guarda solo
  IDs, no snapshots de glyph, así que la migración es **solo de
  catálogo**, no de datos. (Sesión 29.)
- **Sonidos sintetizados con Web Audio en lugar de samples WAV.**
  El módulo `app/ui/Sound.jsx` (sesión 28) define recetas en
  `SOUND_RECIPES` que producen tonos cortos con envolventes ADSR
  suaves (attack 5-15 ms, decay 80-300 ms, peak 0.04-0.10 gain).
  Cualquier sonido nuevo se añade como receta. Si en algún momento
  se necesita un sample real (efecto que no se sintetiza bien —
  viento, campana metálica, etc.), evaluar el coste en KB del
  standalone antes de meterlo. **Regla no negociable:** el sonido
  nunca debe romper la app — todos los `playSound(...)` van
  envueltos en `try/catch` en el lado del consumidor, y el módulo
  es noop silencioso ante cualquier fallo (navegador sin Web Audio,
  contexto suspendido, receta inexistente, `state.soundOn === false`).
  (Sesión 28.)
- **`first.ritual` y `first.plan` comparten trigger.** Decisión de
  producto: "completar el plan del día" === "tocar los 4 módulos
  del día". Si en el futuro se quisieran diferenciar, habría que
  inventar un umbral artificial (p.ej. añadir un campo
  `plan.notes` que el usuario rellena explícitamente) — no merece
  la pena. Documentado para que una sesión futura no se pregunte
  "por qué dos logros con el mismo detector". (Sesión 28.)



Decisiones tomadas en sesiones previas que **siguen condicionando** cómo
trabajar. No son historia — son reglas vigentes. Si una se invalida,
moverla a la sesión en la que cambió (`docs/sessions/session-NN-xxx.md`)
con nota explícita y quitarla de aquí. Las más recientes primero.

- **Código bajo Elastic License 2.0 desde v0.12.9.** Source-available
  (no OSI-approved) — elección consciente, alineada con el modelo
  comercial Lifetime + Pase + Temporadas. Permite leer, clonar,
  modificar y forkear para uso personal / educativo / experimental +
  proponer PRs. Prohíbe (a) ofrecer PACE o una versión modificada
  **como servicio alojado o administrado** a terceros, (b) **eludir
  la validación** Lifetime/Pase, (c) **retirar avisos** de licencia,
  copyright o marca. El Lifetime, el Pase mensual y las Temporadas
  son licencias **comerciales separadas** del producto compilado, no
  licencias del código. Si surge alguna necesidad de licenciar el
  código bajo otros términos (ej: uso interno de una organización que
  no encaje con ELv2), el canal es abrir un issue en GitHub. La
  licencia puede evolucionar hacia adelante siendo el copyright
  holder único (`ezradesign`) pero no se revoca sobre versiones ya
  emitidas. Razonamiento completo y 5 preguntas del apartado 7 del
  análisis respondidas en
  [`docs/proposals/license-analysis.md`](./docs/proposals/license-analysis.md)
  (documento vigente hasta que se marque como histórico). (Sesión 26,
  tramo B.)
- **Modelo de monetización ampliado a 4 vías.** Lifetime (~20 €
  pago único) + **Pase mensual (3,99 € pago puntual con caducidad
  de 30 días, sin renovación automática)** + Temporadas (~5 €
  pago puntual, contenido permanente) + Donaciones BMC. El Pase se
  añade en sesión 26 como onramp alternativo al Lifetime para quien
  prefiere compromisos pequeños. **Regla técnica vigente:** ni el
  Pase ni ninguna otra vía puede requerir backend ni validación
  online — todo se resuelve con claves firmadas offline que incluyen
  `expiresAt` cuando aplica. Si alguien propone "suscripción de
  verdad con renovación automática", tiene que defender por qué se
  rompe el pilar "todo local". Detalle en `MONETIZATION.md`.
  (Sesión 26, tramo B, extiende decisión de sesión 21.)
- **Los altos de viewport se declaran con fallback `100vh` +
  override `100dvh`**, no sólo una de las dos. `vh` se resuelve
  al alto máximo (barra URL oculta) y descuadra el layout cuando
  la barra está visible; `dvh` se recalcula al espacio real. El
  patrón CSS de dos líneas (`height: 100vh; height: 100dvh;`) usa
  la cascada sin user-agent sniffing — el navegador antiguo
  ignora la segunda, el moderno la aplica. Este patrón no cabe
  en un objeto JS de estilos inline (una sola key por propiedad),
  por eso el div raíz de PaceApp delega sus dos declaraciones de
  alto al bloque CSS inyectado. Si sale un nuevo contenedor
  fullscreen, aplicar el mismo patrón. (Sesión 23.)
- **Scroll asimétrico por vista en móvil.** No todos los
  contenedores fullscreen deben comportarse igual: la home
  (vista Foco con los 4 botones de actividad) usa `100dvh` puro
  para que todo quepa sin scroll y el usuario vea siempre sus
  accesos. La sidebar móvil usa `min-height: calc(100dvh + 1px)`
  con `height: auto` para provocar scroll latente de un píxel
  invisible — eso activa el auto-hide de la barra de URL del
  navegador cuando el usuario desliza, recuperando ~56-100px
  para el contenido del drawer. Es intencional que ambas reglas
  coexistan. Si aparece una tercera vista fullscreen (modal
  grande, por ejemplo), decidir en qué lado cae: "siempre visible
  sin scroll" → dvh puro; "puede scrollear y tiene contenido
  largo" → min-height + 1px. (Sesión 24.)
- **Los estilos responsive se inyectan como `<style>` en `<head>`
  con selectores `[data-*]` y `!important`**, no como modificaciones
  de los objetos de estilos inline. Los objetos inline ya funcionan
  y son legibles en desktop; añadir lógica de breakpoints en JS
  los complicaría sin ganar nada. Un bloque CSS por archivo con
  `id` único (p.ej. `pace-sidebar-responsive-css`,
  `pace-main-responsive-css`) evita duplicación. Patrón ya usado
  para los spinners del input number en FocusTimer. Si hacen falta
  nuevos tratamientos responsive (modales, etc.), seguir el mismo
  patrón. (Sesión 22.)
- **Modelo de monetización = Lifetime híbrido.** ~20 € pago único
  + temporadas ~5 € + donaciones BMC. Sin suscripción mensual,
  sin backend, sin cuentas. Validación offline con clave firmada.
  Cualquier nueva idea de monetización debe defenderse contra
  este modelo. Detalle en `MONETIZATION.md`. (Sesión 21.)
- **Los 2 ejercicios iniciales por módulo son la puerta de
  entrada.** No cambiar sin migración explícita del localStorage
  de usuarios existentes. Iniciales: `breathe.coherent.55` +
  `breathe.box.4` (Respira); `move.chair.antidote` +
  `move.neck.3` (Mueve); `extra.desk.pushups` +
  `extra.posture.set` (Estira). (Sesión 21.)
- **Cada ejercicio tiene campo `access`** con 5 valores posibles:
  `free`, `locked.initial`, `locked.achievement`, `locked.both`,
  `premium`. Al añadir contenido nuevo, asignar `access` desde el
  primer momento para evitar migraciones dolorosas. (Sesión 21.)
- **Biometría y wearables fuera de alcance.** Apple Health, Google
  Fit, Apple Watch, Wear OS — todo descartado por el usuario. No
  reintroducir sin decisión explícita. (Sesión 21.)
- **El core gratuito debe ser útil por sí solo.** Pomodoro,
  Hidrátate, 2 iniciales de cada módulo y la mayoría de logros
  son y seguirán siendo gratis. El Lifetime añade valor, no lo
  extrae. (Sesión 21.)
- **Las cifras de identidad se blindan; el texto sigue al sistema.**
  Números grandes que actúan como firma visual de un módulo (el
  `25:00` del timer, el `0` del contador de racha) se fijan a una
  `font-family` explícita (`'EB Garamond', Georgia, serif`), no a
  `var(--font-display)`. Así no cambian aunque el state traiga
  otra tipografía (legacy, import JSON, devtools). Los textos
  descriptivos ("Concentración profunda", "días seguidos") sí
  siguen `--font-display` porque son lenguaje, no símbolo.
  (Sesión 20.)
- **Menos variantes, más identidad.** No se exponen al usuario
  elecciones cosméticas que no tiene por qué tomar: 5 logos (s19),
  4 copys del mismo botón (s19), 3 tipografías display (s20).
  Decidir bien una vez. Si una variante vuelve al panel, debe
  defenderse como eje real de personalización — no como
  acumulación de prototipos descartados. Los 4 ejes que quedan
  (paleta, layout, timer, breath) son los únicos que aportan
  personalización real sin tocar la identidad del producto.
  (Sesión 19, extendida en sesión 20.)
- **Assets locales del standalone se inlinean vía `<img src>` en
  el HTML principal, no hardcoded en strings JS.** Patrón: poner
  un `<img id="foo-src" src="ruta/foo.png" style="display:none">`
  en `PACE.html`; el JS lee `document.getElementById('foo-src')
  .getAttribute('src')`. `super_inline_html` convierte automáticamente
  `<img src>` en data URI. Regla vigente: cualquier asset binario
  nuevo que deba viajar en el standalone sigue este patrón.
  (Sesión 19.)
- **El diseño del sidebar se cuida por sustracción, no por adición.**
  En sesión 18 se probó sustituir el pill "Invita a un café" por
  una `SupportCard` más llamativa y el usuario lo rechazó: "era
  mucho más elegante el pill original". Regla vigente: si algo
  debe ganar prominencia, quita cosas alrededor antes de inflar
  el propio componente. El pill delgado de SupportButton de
  sesión 16 se mantiene como diseño canonico. (Sesión 18.)
- **Antes de disparar logros por umbrales se debe leer `_state`
  tras el `setState` asíncrono**, no variables de cierre capturadas
  en el updater. Si al añadir nuevas métricas con umbral (rachas
  largas, horas de foco, etc.) se hace lo primero, los umbrales
  disparan sobre snapshots intermedios y se pueden perder (o
  dispararse con valores erróneos). Ver `addFocusMinutes` como
  patrón. (Sesión 18.)
- **El Welcome se muestra una sola vez** por instalaci\u00f3n, al primer\n  open con `state.firstSeen == null`. Tanto `Empezar` como el link\n  `prefiero saltarlo` fijan `firstSeen` a timestamp \u2014 es una bienvenida,\n  no un tr\u00e1mite. Re-abrir es posible v\u00eda `pace:open-welcome` pero sin\n  UI visible (dev/debug only). (Sesi\u00f3n 17.)\n- **El backup JSON incluye `version` y `exportedAt`** para migraci\u00f3n\n  futura. El import acepta tanto `{app, version, state}` como state\n  plano (fallback legacy). Tras import exitoso se recarga la p\u00e1gina;\n  actualizar state en memoria arriesga inconsistencias con\n  `useSyncExternalStore`. (Sesi\u00f3n 17.)\n- **`secret.dark.mode` cuenta d\u00edas distintos, no consecutivos.** La\n  descripci\u00f3n dice \"7 d\u00edas en oscuro\" sin exigir racha. Persistido en\n  clave propia `pace.darkDays.v1` (no en el state principal \u2014 es un\n  contador auxiliar de un \u00fanico logro). Cap de 30 fechas. (Sesi\u00f3n 17.)\n- **`TweakSecretsWatcher` retorna `null` y vive en el \u00e1rbol siempre**\n  (en `main.jsx`, no dentro del TweaksPanel). Raz\u00f3n: los secretos\n  deben dispararse cuando el state cambia, no s\u00f3lo cuando el panel\n  est\u00e1 abierto. Cubre casos como importar un JSON con palette oscuro\n  ya fijada. (Sesi\u00f3n 17.)\n\n- **Donar no desbloquea nada funcional** en PACE. `secret.supporter`
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

> Estado actual tras sesión 42: **54/100 logros cazables** (sin cambios). Constancia 15/15 cerrada. Maestría 13/25. i18n total ✅. PWA ✅. UX móvil ✅ (hints + timer + shortcut corregidos). Próximos frentes: (a) iconos PNG reales para PWA, (b) rediseño de glifos SVG, (c) claves offline Lifetime/Pase, (d) heatmap "Año en pace", (e) README EN + Reddit launch.

### 🎯 Próxima sesión corta (recomendada)

Tres bloques de fruta fácil que siguen bajando la cuenta de
"Próximamente" y mejoran la constancia percibida:

1. **3 triggers de primeros pasos** (~2h) — `first.ritual` (4 módulos
   en 1 día), `first.cycle` (pomodoro + pausa activa), `first.plan`
   (plan del día completo). Datos ya en `state.plan`, sólo falta el
   detector en `state.jsx`. Baja "Próximamente" de 13 → 10.
2. **Rachas largas** (~1–2h) — `streak.14`, `streak.60`, `streak.365`.
   Cálculo trivial dentro de `updateStreak` (las demás ya están ahí).
   Impacto emocional alto, 13 → 10 (si se combina con el anterior:
   13 → 7).
3. **Sonidos sutiles** (~2h) — el toggle `state.soundOn` ya existe,
   faltan 3–4 WAV CC0 de freesound.org: click timer, fin pomodoro,
   +1 vaso, fase respiración. Hook `useSound(name)` nuevo en UI.

### 🚀 Frente 2 — Funcionalidades (ordenado por coste/impacto)

**Alto impacto · coste bajo:**

- **Sonidos sutiles** (~2h) — ver bloque anterior. También se puede
  hacer aislado si no se combina con los triggers de logros.
- **Combinar 3 triggers de logros + rachas largas** en una única
  sesión corta (ya detallado arriba).

**Alto impacto · coste medio:**

- **Rachas largas** (~1–2h) — ver arriba.
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

## 🌐 Dominio pendiente

`pace.app` está ocupado (comprobado en sesión 26). Candidatos
razonables a evaluar antes de v1.0 — no hace falta decidir ya,
pero sí reservar uno cuanto antes para que no lo pillen:

- **Con TLD alternativo** (mismo nombre, otra extensión): `pace.so`,
  `pace.co`, `pace.xyz`, `pace.me`.
- **Con palabra añadida** (mantienes "pace" legible): `usepace.app`,
  `getpace.app`, `pace.tools`, `pace.day`, `pace.works`.
- **Con subtítulo del producto** (refuerza la identidad "Foco·Cuerpo"):
  `paceritual.com`, `pacecalm.app`, `paceflow.app`.
- **Nombre compuesto** (si quieres diferenciación fuerte):
  `pacedesk.app`, `officepace.app`, `sitpace.app`.

**Criterios a respetar al elegir:**
- `.app` fuerza HTTPS automático — bueno para confianza.
- Evitar guiones y números.
- Comprobar disponibilidad simultánea en GitHub / X / Instagram
  si vas a hacer marca.
- Registrar en un proveedor serio (Porkbun o Cloudflare Registrar
  son los más baratos y honestos; evitar GoDaddy).

**Decisión a cerrar antes de v1.0.** Mientras, Netlify ya sirve
el proyecto desde un subdominio — suficiente para desarrollo.

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
