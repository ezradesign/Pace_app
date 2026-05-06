# Sesión 46 · v0.24.0 → v0.25.0 · stats achievements + mobile UX + 10 constellation glyphs

**Fecha:** 2026-05-06  
**Versión:** v0.24.0 → v0.25.0  
**Duración estimada:** sesión larga multi-bloque

---

## Resumen ejecutivo

Sesión de 5 bloques ejecutados en orden estricto B → C2 → C1 → A → D.
Cierra la deuda de glifos SVG (Dirección D: Constelaciones, invalidando la decisión s29 de híbrido A+B),
añade 4 nuevos logros de la categoría "Estadísticas", y corrige dos fricciones de UX móvil
(sidebar abierto en primera carga, pestañas TopBar que se superponían a iconos).

---

## Bloques ejecutados

### Bloque B — fix(copy): renombrar "Ritmo semanal" → "Ritmo"

El panel de stats pasó a multi-tab en s44. El label del topbar y los títulos de la vista
ya no reflejan solo la semana, sino el ritmo completo (semana/mes/año).

**Cambios en `app/i18n/strings.js`:**
- `topbar.stats.title`: ES `'Ritmo (S)'` → `'Ritmo (S)'` (sin cambio visible, ya correcto)
- `stats.tag`: ES `'Estadísticas'` (nuevo), EN `'Stats'` (nuevo)
- `stats.title`: ES `'Ritmo'`, EN `'Rhythm'`
- `ach.cat.stats`: ES `'Estadísticas'`, EN `'Statistics'` (para el catálogo de logros)

---

### Bloque C2 — fix(mobile): sidebar colapsado en primera carga móvil

`defaultState.sidebarCollapsed: false` causaba que en móvil el sidebar tapara el timer
en la primera carga. Fix: leer `isMobileViewport()` en `loadState()` y colapsar si no
hay preferencia guardada explícitamente.

**Cambios en `app/state.jsx`:**
- Nueva función `isMobileViewport()` (matchMedia ≤768px)
- `loadState()` en sus tres ramas (sin localStorage, parse error, state limpio)
  aplica `sidebarCollapsed: true` cuando `isMobileViewport()` y la preferencia
  no está guardada en `parsed.sidebarCollapsed`

---

### Bloque C1 — fix(mobile): TopBar — ocultar pestañas Foco/Pausa/Larga en ≤414px

En 375px los tabs absolutamente posicionados (left:50%, con fondo sólido) se superponían
al icono de Stats (rightmost). Diagnóstico: no son necesarios en móvil — BreakMenu
post-Pomodoro ya maneja la selección de modo pausa/larga.

**Decisión (opción 2):** ocultar los tabs completamente en móvil (`display: none`).

**Cambios en `app/main.jsx`:**
- Bloque CSS `pace-main-responsive-css` (@media ≤768px):
  ```css
  [data-pace-topbar] [data-pace-tabs] { display: none !important; }
  ```

---

### Bloque A — feat(achievements): categoría "Estadísticas" con 4 logros

Nueva categoría `estadisticas` (color: `var(--hydrate)`) con 4 logros que recompensan
la constancia a escala de mes/año en el panel de Stats.

**IDs y triggers:**

| ID | Trigger |
|---|---|
| `stats.streak.30` | Racha ≥ 30 días (coinice con `streak.30` pero copy diferente) |
| `stats.month.first` | Cualquier mes con ≥ 20 días de uso |
| `stats.month.focus` | Cualquier mes con ≥ 600 min de foco |
| `stats.year.first` | Cualquier año con los 12 meses activos |

**Cambios en `app/achievements/Achievements.jsx`:**
- 4 entradas nuevas en `ACHIEVEMENT_CATALOG` (categoría `estadisticas`)
- `CAT_META.estadisticas` con `labelKey: 'ach.cat.stats'` y color `--hydrate`
- 4 IDs añadidos a `IMPLEMENTED_ACHIEVEMENTS`

**Cambios en `app/state.jsx`:**
- `checkStatsAchievements()` — helper que escanea `history.days` y `history.months`
  buscando los umbrales de mes (20 días, 600 min) y año (12 meses)
- `updateStreak()` — añade `unlockAchievement('stats.streak.30')` cuando racha ≥ 30
- `ensureDayFresh()` — llama `checkStatsAchievements()` tras rollover (en try/catch)

**Cambios en `app/i18n/strings.js`:**
- 2 claves nuevas: `ach.cat.stats` (ES/EN)

---

### Bloque D — feat(glyphs): 10 glifos SVG Constelaciones + refactor catálogo

Adopción de Dirección D (Constelaciones): círculos rellenos r=1.2–1.5, líneas delgadas
stroke-width=0.5–0.6, opacidad 0.4–0.6, viewBox 24×24, `currentColor` para herencia.

**Invalida decisión s29** (híbrido A+B) — sustituida por "Dirección D (Constelaciones) adoptada sesión 46".

**10 glifos SVG implementados:**
`first.step`, `first.breath`, `first.stretch`, `first.sip`, `first.extra`,
`first.cycle`, `first.ritual` (alias `first.plan`), `first.day`, `streak.3`, `secret.cow.click`

**Cambios en `app/achievements/Achievements.jsx`:**
- `GLYPH_SVG` — objeto con 11 entradas (first.plan alias de first.ritual)
- `renderGlyph(a, style)` — función helper que renderiza `glyphSvg` si existe, else `glyph` unicode
- `Seal` — actualizado para usar `renderGlyph`
- Campo `glyphSvg` añadido a 11 entradas del catálogo

**Cambios en `app/ui/Toast.jsx`:**
- `full` ahora incluye `glyphSvg: a.glyphSvg`
- Render del círculo del toast usa `glyphSvg` cuando existe (inline SVG), `glyph` como fallback

**Fichero nuevo:** `design/glyphs-constelaciones-preview.html` — preview de los 10 glifos
a tamaño Seal (56×56) y Toast (40×40) con fondo claro y oscuro para validación visual.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/i18n/strings.js` | 6 claves: stats labels + ach.cat.stats (B+A) |
| `app/state.jsx` | isMobileViewport + loadState móvil (C2) + checkStatsAchievements + updateStreak (A) + PACE_VERSION bump v0.25.0 |
| `app/main.jsx` | CSS ocultar tabs móvil (C1) |
| `app/achievements/Achievements.jsx` | GLYPH_SVG + renderGlyph + Seal + catálogo (A+D) |
| `app/ui/Toast.jsx` | glyphSvg en full + render SVG condicional (D) |
| `PACE.html` | title bump v0.25.0 |
| `PACE_standalone.html` | regenerado 476 KB — cierra con `</body></html>` |

**Nuevo:** `design/glyphs-constelaciones-preview.html`

---

## Versión

- `v0.24.0` → **`v0.25.0`** (minor · nuevas features funcionales + UX fixes)

---

## Estado de logros cazables

- Antes: 54/100 cazables
- Después: **58/100 cazables** (+4 stats)
- Constancia 15/15 ✅ · Maestría 13/25 · Estadísticas 4/4 (nueva categoría)

---

## Pendiente funcional (próximas sesiones)

- Iconos PNG reales (192×512) para PWA
- Ampliar glifos SVG al resto del catálogo (58+ logros sin glyphSvg)
- Detector `master.midnight.never` (30 días sin uso nocturno)
- README EN + Reddit launch
- Claves offline Lifetime/Pase
