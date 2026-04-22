# Sesión 15 (2026-04-22) — Logros: arreglo + estado "próximamente"

**Versión entregada:** v0.11.10
**Duración / intensidad:** corta · quirúrgica

## Contexto / petición

> "¿Qué era el #9?" → tras explicar el backlog:
> "una mixta y marcar el resto como próximamente para así incentivar a los usuarios"

Decisión del usuario: **vía mixta**. Arreglar los 6 `explore.*` de
movilidad que quedaron huérfanos en sesión 14 + marcar el resto de
logros sin trigger como "Próximamente" en la UI (incentiva curiosidad
sin prometer lo que el código no puede detectar hoy).

Cuatro preguntas adicionales resolvieron el alcance fino:
- **Alcance**: solo lo acordado. Nada de scope creep con tweak-secrets.
- **Contador cabecera**: `X / 26 disponibles · 74 próximamente` (transparente sobre qué se puede cazar hoy).
- **Glifo del estado "Pronto"**: glifo original con opacidad 0.25 + badge "Pronto" en esquina (mantiene personalidad).
- **Revelado progresivo**: ocultar descripción, mostrar solo título + "Pronto" (crea curiosidad sin ser opaco).

## ✅ Cambios aplicados

**`app/state.jsx`** — Movido el map `explore.*` desde `completeMoveSession`
a `completeExtraSession`. Los 6 logros `explore.hips/.shoulders/.atg/
.ancestral/.neck/.desk` vuelven a funcionar tras el swap de sesión 14,
porque esas rutinas ahora desembocan en `completeExtraSession`. El map
conserva los ids `move.*` (decisión activa: ids = identificadores
estables, no clasificación semántica). Comentario explicando el porqué
del desajuste ids/función para que la próxima sesión no se extrañe.
`PACE_VERSION` bumped a `v0.11.10`.

**`app/achievements/Achievements.jsx`** — Introducido:
- `IMPLEMENTED_ACHIEVEMENTS` (Set de 26 ids con trigger real hoy:
  5 primeros pasos + 7 constancia + 9 exploración breathe + 6 exploración
  move (los arreglados) + 1 maestría + 4 secretos breath.hold/cow.click).
  Cuando un logro gane su trigger, su id se mueve a este set.
- `isImplemented(a)` — helper: los secretos siempre cuentan como
  implementados (su mecánica es intriga, no señalización).
- **Contador nuevo**: `X / 26` (disponibles) + `74` (próximamente). El
  "/100" original desaparece de la cabecera; los bloques por categoría
  siguen mostrando el total (`gotThisCat / items.length`) porque ahí sí
  interesa ver qué ratio de la categoría se ha tocado.
- **3er estado visual en `Seal`**: `isComingSoon = !unlocked && !implemented && !a.secret`.
  Borde dotted gris + opacidad 0.38 + glifo original con opacity 0.25 +
  badge "Pronto" (pill, 7.5px, uppercase, letter-spacing) en top-right +
  descripción sustituida por "Pronto". Título se conserva para incentivar
  "lo quiero".

**`PACE.html`** — Título de la pestaña actualizado `v0.11.8` → `v0.11.10`
(arrastraba desfase desde sesión 14, que bumpeó `PACE_VERSION` pero
olvidó el `<title>`).

**`PACE_standalone.html`** — Regenerado con `super_inline_html` desde
`PACE.html`. ~186 KB.

## 📁 Archivos modificados

- `app/state.jsx` (mover map, bump versión, comentario)
- `app/achievements/Achievements.jsx` (set + helper + contador + 3er estado)
- `PACE.html` (título)
- `PACE_standalone.html` (regenerado)
- `backups/PACE_standalone_v0.11.9_20260422.html` (nuevo)
- `backups/PACE_standalone_v0.11.5_20260422.html` (eliminado, rota)

## 🔒 Red de seguridad
- `PACE.html` carga limpio en dev (solo warning estándar de Babel).
- `PACE_standalone.html` regenerado a v0.11.10 y verificado limpio.
- Backups rotados: sale v0.11.5, entra v0.11.9. Quedan v0.11.6/7/8/9 + standalone actual.

## 🎯 Por qué esta sesión

El backlog #9 tenía dos cosas mezcladas: logros que nunca funcionaron
(19 arrastrados) y logros que **sí funcionaron pero se rompieron en la
sesión anterior** (6 `explore.*` de movilidad). El arreglo de los 6 no
era opcional — era deuda recién introducida. El resto (19) es trabajo
real de implementación que no vamos a abordar aún, pero dejarlos
invisibles/mezclados con los funcionales generaba ruido al usuario
(cazaba logros que nunca se iban a desbloquear). La vía mixta resuelve
ambas cosas en una pasada corta: reparar lo roto + distinguir visualmente
"implementable hoy" de "contenido futuro".

## 📋 Backlog abierto al cerrar

- **#9 reducido**: quedan 19 logros sin trigger (master.*, season.*,
  first.ritual/cycle/day/plan/return, streak.14/60/365, breathe.sessions.*,
  move.sessions.25, hydrate.week.perfect, morning.5, explore.all.*,
  explore.chrome, explore.tweaks). Ahora están marcados como "Pronto" en
  la UI, así que no hay presión urgente — se irán implementando a medida
  que aporten valor.
- **Tweak-secrets fáciles** (secret.aged, secret.dark.mode, secret.mono,
  secret.seal, secret.illustrated, explore.tweaks): pendientes. Son ~1
  línea cada uno en `TweaksPanel.jsx`. Candidatos de sesión corta futura.

## ⚠️ Decisiones tomadas

- **`IMPLEMENTED_ACHIEVEMENTS` es la fuente de verdad sobre qué logros
  se pueden cazar hoy.** Al añadir un trigger nuevo (en `state.jsx`,
  `main.jsx`, módulos), hay que añadir su id a este set — si no, el
  logro aparecerá como "Pronto" aunque se desbloquee. (Sesión 15.)
- **Los secretos nunca muestran estado "Pronto"**, incluso si no tienen
  trigger. Su mecánica es intriga; revelarlos como "contenido futuro"
  rompe esa mecánica. Se pintan siempre como secretos normales (`?`,
  título "Secreto", desc "?????"). (Sesión 15.)
- **El contador de cabecera usa el denominador dinámico `availableCount`
  (26 hoy), no 100 fijo.** Cuando implementemos más triggers y los
  añadamos al set, el contador crece automáticamente. (Sesión 15.)
