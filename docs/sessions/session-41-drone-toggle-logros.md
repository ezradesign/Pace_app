# Sesión 41 — v0.21.0 → v0.22.0
**Fecha:** 2026-05-06
**Título:** feat: split TweakSecretsWatcher + i18n ambient + 5 detectores de logros

---

## Contexto

Dos bloques aplazados desde sesiones anteriores:

- **Bloque A** — el toggle de drone ambiente ya existía en TweaksPanel (líneas
  229-263, sesión no documentada) pero faltaba i18n. Además, TweaksPanel.jsx
  estaba en 553 líneas (>500 límite), lo que bloqueaba añadir cualquier cosa.
- **Bloque B** — cinco detectores de logros sin trigger en state.jsx:
  `hydrate.week.perfect`, `master.box.10`, `master.coherent.10`,
  `master.rounds.10`, `master.atg.20`.

---

## Bloque A — Split TweakSecretsWatcher + i18n

### Split (obligatorio antes de cualquier cambio)

`TweakSecretsWatcher` extraído de `TweaksPanel.jsx` a su propio archivo
`app/tweaks/TweakSecretsWatcher.jsx` (61 líneas). Contiene:
- Constante `DARK_DAYS_KEY`
- Componente `TweakSecretsWatcher` (los 4 efectos: aged, mono, logoVariant, dark-days)
- `Object.assign(window, { TweakSecretsWatcher })`

`TweaksPanel.jsx` pasa de 553 → **479 líneas** (bien bajo el límite).

`PACE.html` actualizado: script de `TweakSecretsWatcher.jsx` insertado antes
del de `TweaksPanel.jsx`. No hace falta añadir `TweakSecretsWatcher` al
mount-loop check (retorna null, no bloquea el render de PaceApp).

### i18n del toggle ambient

El texto y `aria-label` del toggle "+ ambiente durante sesiones" estaban
hardcoded en español. Añadida clave `settings.audio.ambient` en ES y EN:
- ES: `'ambiente durante sesiones'`
- EN: `'ambient sound during sessions'`

TweaksPanel usa ahora `t('settings.audio.ambient')` en ambos sitios.

---

## Bloque B — Detectores de logros (state.jsx)

### IDs reales (corrección al contexto inicial)
Los IDs del catálogo usan prefijo `master.*`:
- `master.coherent.10` (no `coherent.10`)
- `master.rounds.10` (no `rounds.10`)
- `master.atg.20` (no `atg.20`)

### Nuevos campos en defaultState

```js
waterGoalDates: [],   // toDateString() de días con water.today >= goal; cap 14
routineCounts: {},    // { box, coherent, rounds, atg } — acumulados monótonos
```

### Constante BREATH_ROUTINE_CATEGORIES

Mapa `routineId → categoría` para las rutinas de respiración:
- `breathe.box.4 / .6` → `'box'`
- `breathe.coherent.55 / .66` → `'coherent'`
- `breathe.rounds.full / .express` → `'rounds'`

ATG se maneja aparte en `completeExtraSession` (rutina `move.atg.knees`).

### Función checkHydrateWeekPerfect()

Ordena `waterGoalDates` numéricamente, verifica que los 7 últimos valores
disten exactamente 86 400 000 ms entre sí (días estrictamente consecutivos),
y llama `unlockAchievement('hydrate.week.perfect')`.

### Función checkRoutineCountAchievements(category)

Lee `_state.routineCounts` (ya actualizado) y verifica umbrales:
- `box ≥ 10` → `master.box.10`
- `coherent ≥ 10` → `master.coherent.10`
- `rounds ≥ 10` → `master.rounds.10`
- `atg ≥ 20` → `master.atg.20`

### Hooks en acciones

**addWaterGlass:** cuando `delta > 0` y `_state.water.today >= _state.water.goal`,
registra hoy en `waterGoalDates` (si no estaba) y llama
`checkHydrateWeekPerfect()`. Lee `_state` post-setState (patrón sesión 18).

**completeBreathSession:** tras los checks existentes, busca la categoría de
`routineId` en `BREATH_ROUTINE_CATEGORIES`. Si existe, incrementa
`routineCounts[cat]` con un segundo setState y llama
`checkRoutineCountAchievements(cat)`.

**completeExtraSession:** si `routineId === 'move.atg.knees'`, mismo patrón
para `'atg'`.

### IMPLEMENTED_ACHIEVEMENTS (Achievements.jsx)

Añadidos los 5 nuevos IDs:
- Constancia: `hydrate.week.perfect` → **15/15** (categoría cerrada)
- Maestría: `master.box.10`, `master.coherent.10`, `master.rounds.10`,
  `master.atg.20` → **13/25**

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/tweaks/TweakSecretsWatcher.jsx` | **Nuevo** — 61 líneas |
| `app/tweaks/TweaksPanel.jsx` | Split: 553 → 479 líneas; i18n ambient |
| `app/i18n/strings.js` | +clave `settings.audio.ambient` en ES y EN |
| `app/state.jsx` | +2 campos defaultState, +constante, +2 funciones, +hooks en 3 acciones; bump v0.22.0 |
| `app/achievements/Achievements.jsx` | +5 IDs a IMPLEMENTED_ACHIEVEMENTS |
| `PACE.html` | +script TweakSecretsWatcher.jsx |
| `PACE_standalone.html` | Regenerado — 432 KB |
| `backups/PACE_standalone_v0.21.0_20260506.html` | Rotación |

---

## Versión

**v0.21.0 → v0.22.0** (feature: split + i18n + 5 detectores de logros)
