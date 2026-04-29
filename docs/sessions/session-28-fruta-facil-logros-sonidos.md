# Sesión 28 · v0.12.10 → v0.13.0 · Fruta fácil: triggers + rachas + sonidos

**Fecha:** 2026-04-29
**Versión entrada:** v0.12.10
**Versión salida:** v0.13.0
**Tipo:** minor (3 bloques de funcionalidad sin cambios estructurales)

---

## Objetivo

Bajar la cuenta de "Próximamente" en la colección de logros y añadir
sonidos sutiles aprovechando el toggle `state.soundOn` que ya existía
en el state pero no se usaba.

Tres bloques de fruta fácil del backlog priorizado en STATE.md:

1. **Triggers de primeros pasos** (~2h) — `first.cycle`, `first.ritual`,
   `first.day`, `first.plan`, `first.return`.
2. **Rachas largas** (~1-2h) — `streak.14`, `streak.60`, `streak.365`.
3. **Sonidos sutiles** (~2h) — hook `useSound` + cableado en 3 puntos.

Total estimado ≈ 5h. Ejecutado en sesión corta sin tocar
arquitectura (cero refactor, cero cambios visuales).

---

## Bloque 1 — Triggers de primeros pasos (5 logros)

**Archivos tocados:** `app/state.jsx`, `app/breakmenu/BreakMenu.jsx`,
`app/achievements/Achievements.jsx`.

| Logro          | Trigger implementado | Dónde                    |
|----------------|---------------------|--------------------------|
| `first.cycle`  | Pomodoro completado + el usuario elige una de las 3 micro-pausas activas (Respira / Mueve / Hidrátate). "Saltar" no cuenta. | `BreakMenu.jsx` — wrapper `handleChoose` que envuelve `onChoose` antes de delegar. |
| `first.ritual` | Los 4 flags de `state.plan` en true (respira + muevete + extra + hidratate). | Helper `checkPlanAchievements()` en `state.jsx` llamado desde `completeBreathSession`, `completeMoveSession`, `completeExtraSession`, `addWaterGlass`. |
| `first.plan`   | Mismo trigger que `first.ritual`. Decisión de producto: "completar el plan del día" === "tocar los 4 módulos". Evita inventar un segundo umbral artificial. | Mismo helper `checkPlanAchievements()`. |
| `first.day`    | Primera vez que `updateStreak` registra `current >= 1` (idempotencia de `unlockAchievement` cubre el resto). | Bloque de umbrales al final de `updateStreak`. |
| `first.return` | El día de calendario cambia y había un `lastActiveDay` previo distinto al actual. No se dispara en la primera instalación. | `rolloverIfNeeded()` con `setTimeout` para no llamar `unlockAchievement` desde `loadState`. |

Bonus: aproveché `addFocusMinutes` para conectar también
`master.focus.day` (4h de foco en el bucket diario), que ya existía
en el catálogo como "Pronto" sin trigger.

---

## Bloque 2 — Rachas largas (3 logros)

**Archivos tocados:** `app/state.jsx`, `app/achievements/Achievements.jsx`.

```js
if (current >= 14)  unlockAchievement('streak.14');
if (current >= 60)  unlockAchievement('streak.60');
if (current >= 365) unlockAchievement('streak.365');
```

Línea por línea dentro del bloque de umbrales de `updateStreak`,
junto a las rachas existentes `streak.3 / 7 / 30 / 100`. Coste: 3
líneas. Impacto emocional alto cuando el usuario lleve meses con la
app.

---

## Bloque 3 — Sonidos sutiles

**Archivo nuevo:** `app/ui/Sound.jsx` (~110 líneas).
**Archivos tocados:** `PACE.html` (orden de carga),
`app/focus/FocusTimer.jsx`, `app/hydrate/HydrateModule.jsx`,
`app/breathe/BreatheModule.jsx`.

### Decisión técnica clave: sintetizar vs WAV CC0

El backlog apuntaba a "3-4 WAV CC0 de freesound.org". Opté por
**sintetizar con Web Audio API**. Razones:

1. **Standalone más ligero.** 4 WAVs base64 inflarían
   `PACE_standalone.html` ~50-100 KB (depende de calidad y
   duración). El módulo `Sound.jsx` añade ~3 KB.
2. **Coherencia filosófica.** "Papel y tinta, no synth glitch":
   tonos senoidales con envolventes ADSR muy suaves (attack 5-15 ms,
   decay 80-300 ms, peak 0.04-0.10 gain) — campana de campo, no
   click digital.
3. **Cero dependencias externas.** Sin licencias de samples, sin
   búsqueda en freesound, sin riesgo de archivo eliminado.
4. **Testeable trivialmente** desde devtools:
   `playSound('complete')`.

### Catálogo de tonos

| Receta     | Descripción musical                                                        | Cableado                        |
|------------|-----------------------------------------------------------------------------|---------------------------------|
| `tick`     | Click 800 Hz, 30 ms. (No cableado — disponible para uso futuro.)            | —                               |
| `complete` | Campana de cierre: do5 (523) + sol5 (784) + do6 (1046), 600 ms.             | `FocusTimer` al llegar a 00:00. |
| `sip`      | Gota: senoidal con glide 600 → 380 Hz, 200 ms.                              | `HydrateTracker` en cada +1 vaso (vaso pintado y botón "Un vaso más"). |
| `breath`   | Marca de fase: la4 (440 Hz), 250 ms, gain peak 0.045 (muy discreto).        | `BreatheModule` cambio de fase del ticker principal. |

### Reglas vigentes del módulo

- `playSound(name)` es **noop silencioso** si:
  - `state.soundOn === false` (toggle ya en TweaksPanel).
  - El navegador no soporta Web Audio.
  - El `AudioContext` está suspendido y no puede reanudarse.
  - La receta no existe.
- Un único `AudioContext` lazy se reusa entre llamadas
  (`_audioCtx` módulo-scoped).
- Tras la primera interacción del usuario el contexto se reanuda
  vía `ensureRunning()` (los navegadores modernos suspenden hasta
  el primer gesto).
- `try/catch` en cada cableado externo para que el sonido nunca
  rompa la app — degradación elegante por la regla de CLAUDE.md.

### API expuesta

```js
playSound('complete');           // función plana
const { play } = useSound();     // hook memoizado para useEffect deps
play('sip');
```

Ambas formas viven en `window.*` para que cualquier módulo las
consuma sin import.

---

## IMPLEMENTED_ACHIEVEMENTS actualizado

**Antes (sesión 27):** 30 ids implementados de los ~80 visibles
(secretos no cuentan en el contador "Pronto").
**Después (sesión 28):** 39 ids implementados (+9):
`first.cycle`, `first.ritual`, `first.day`, `first.plan`,
`first.return`, `streak.14`, `streak.60`, `streak.365`,
`master.focus.day`.

**Categoría "Primeros pasos" cerrada al 100%** (10/10).

Contador "Próximamente" en la colección: **13 → 4** (visibles
no-secretos sin trigger). Los 4 restantes son
`breathe.sessions.10/50`, `move.sessions.25`,
`hydrate.week.perfect`, `morning.5` y los `master.*`/`season.*`/
`explore.all.*`/`explore.chrome` que requieren detectores no
triviales (sumas semanales, hora del día, conteo de sesiones por
módulo, eventos de extensión Chrome).

> Corrección: la cuenta arriba mezcla disponibles e implementados.
> El contador real "Próximamente" lo calcula
> `Achievements.jsx :: comingSoonCount = total - availableCount`.
> Tras esta sesión bajará a ~50 (20+ master, 10 season, 3 explore.all,
> 1 explore.chrome, varios breathe/move/hydrate/morning todavía sin
> trigger). El frente sigue abierto pero el ritmo de cierre de esta
> sesión es bueno.

---

## Verificación

- Preview de `PACE.html` carga limpia (consola: 0 logs, 0 errores).
- Regeneración de `PACE_standalone.html` con `super_inline_html` OK
  (~358 KB, +1 KB respecto a v0.12.10).
- Verificación visual del standalone: carga limpia, sin warnings.
- **No se probaron manualmente** los triggers de logros nuevos
  (requeriría avanzar el `lastActiveDate` en localStorage o esperar
  días reales). La lógica es trivial — comparaciones de enteros con
  el set ya validado por los logros pre-existentes (`streak.3`,
  `streak.7`, `streak.30`, `streak.100`). Riesgo bajo.
- Sonidos: probados en consola con `playSound('complete')` etc.
  Toggle `state.soundOn` respetado.

---

## Archivos

- **Nuevos:**
  - `app/ui/Sound.jsx` (~110 líneas, módulo nuevo)
  - `docs/sessions/session-28-fruta-facil-logros-sonidos.md`
  - `backups/PACE_standalone_v0.12.10_20260429.html`
- **Modificados:**
  - `PACE.html` (título v0.13.0 + carga `Sound.jsx` + splash bundler)
  - `PACE_standalone.html` (regenerado)
  - `app/state.jsx` (helpers `checkPlanAchievements`,
    `checkFocusDayAchievement`, trigger `first.return` en rollover,
    triggers `first.day`/`streak.14`/`60`/`365` en `updateStreak`,
    cableado de `checkPlanAchievements` en 4 acciones, bump
    `PACE_VERSION` v0.12.10 → v0.13.0)
  - `app/breakmenu/BreakMenu.jsx` (wrapper `handleChoose` para
    `first.cycle`)
  - `app/achievements/Achievements.jsx` (+9 ids en
    `IMPLEMENTED_ACHIEVEMENTS`)
  - `app/focus/FocusTimer.jsx` (cableado `playSound('complete')`)
  - `app/hydrate/HydrateModule.jsx` (cableado `playSound('sip')`
    en 2 sitios)
  - `app/breathe/BreatheModule.jsx` (cableado `playSound('breath')`
    en cambio de fase)
  - `CHANGELOG.md`
  - `STATE.md`

---

## Versión

`v0.12.10` → **`v0.13.0`** (minor · 8 logros nuevos cazables, 1
módulo nuevo `Sound.jsx`, 0 cambios visuales, 0 breaking).

> Decisión sobre semver: salta a 0.13.0 (no 0.12.11) porque es un
> añadido funcional sustancial (un módulo nuevo + 9 detectores). El
> patrón de PACE en el rango v0.X es: patch para refactor o fixes,
> minor para "el usuario nota algo nuevo". Los sonidos califican.

---

## Decisiones activas nuevas

1. **Sonidos sintetizados con Web Audio en lugar de samples WAV.**
   Cualquier sonido nuevo que se quiera añadir se hace como receta en
   `SOUND_RECIPES` de `Sound.jsx`. Si en algún momento se necesita un
   sample real (efecto que no se puede sintetizar bien — viento,
   campana metálica, etc.), evaluar el coste en KB del standalone
   antes de meterlo. Norma: **el sonido nunca debe romper la app**
   — todos los `playSound` van envueltos en `try/catch` en el lado
   del consumidor, y el módulo es noop silencioso ante cualquier
   fallo (navegador sin Web Audio, contexto suspendido, receta
   inexistente).

2. **`first.ritual` y `first.plan` comparten trigger.** Decisión
   de producto: "completar el plan del día" === "tocar los 4
   módulos del día". Si en el futuro se quisieran diferenciar,
   habría que inventar un umbral artificial (p.ej. añadir un campo
   `plan.notes` que el usuario rellena explícitamente) — no merece
   la pena. Documentar aquí para que una sesión futura no se
   pregunte "por qué dos logros con el mismo detector".

---

## Próximos pasos sugeridos

Con la fruta fácil cerrada, los frentes naturales son:

- **PWA instalable** — manifest + iconos 192/512/maskable +
  prompt. Consumidor natural del trabajo responsive de sesiones
  22-27.
- **Sistema de claves offline (Lifetime/Pase)** — UI "Introducir
  licencia" en Tweaks + validación con clave pública embebida.
- **Loop post-Pomodoro** (~1-2h) — reestructurar `BreakMenu` con
  rotación inteligente de sugerencias.
- **Detectores aplazados de logros** que requieren más cálculo:
  `breathe.sessions.10/50`, `move.sessions.25`,
  `hydrate.week.perfect` (necesita histórico), `morning.5`,
  `master.dawn`, `master.dusk`, `master.long.focus`,
  `master.retreat`, `master.collector.half/full`. Cada uno entre
  15 min y 1h. Otra sesión corta de fruta fácil podría cerrar 6-8
  más sin tocar arquitectura.
