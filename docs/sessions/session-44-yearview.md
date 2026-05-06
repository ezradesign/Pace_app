# Sesión 44 — feat(stats): YearView — heatmap anual

**Fecha:** 2026-05-06  
**Versión:** v0.23.0 → v0.24.0  
**Objetivo:** Implementar `YearView` (heatmap 53×7 estilo GitHub) dentro del StatsPanel, cerrando el frente Stats al 100%.

---

## Qué se hizo

### BLOQUE A — Claves i18n (strings.js)

10 claves nuevas en ES + EN:

- `stats.year.empty` — mensaje cuando el año no tiene actividad
- `stats.year.totalActions` — pie: total de acciones
- `stats.year.activeDays` — pie: días activos
- `stats.year.maxStreak` — pie: racha máxima
- `stats.year.months.short` — etiquetas de mes (Ene…Dic / Jan…Dec)
- `stats.year.days.label` — etiquetas de fila (L,X,V / M,W,F)
- `stats.year.legend.less` / `stats.year.legend.more` — leyenda
- `stats.year.tooltip.score` — texto del tooltip

### BLOQUE B — YearView.jsx (nuevo archivo)

Extraído a `app/stats/YearView.jsx` (324 líneas) para mantener StatsPanel.jsx < 500 líneas.

**Funciones puras:**
- `computeDayScore(entry)` → score 0..5 (focusBlocks cap 3 + breathSessions + moveSessions + waterFrac/8)
- `computeLevel(score)` → nivel 0-4 con umbrales 0/1.5/3/4.5
- `getYearData(history, year, firstSeenTimestamp)` → array de 365/366 entradas con `{ dateStr, score, level, entry, isPreUse, isFuture, dow, col, d }`. Jan1Dow calculado una sola vez fuera del loop.
- `computeYearStats(yearData)` → `{ totalActions, activeDays, maxStreak }` en una sola pasada
- `getMonthColumns(year, jan1Dow)` → mapa `{ col: monthIndex }` para etiquetas
- `formatDateLiteral(d, lang)` → fecha localizada "12 de marzo" / "12 March"

**Constante:**
- `yearLevelStyles[]` — 5 entradas `{ bg, op }`: nivel 0 = paper-3/1.0, niveles 1-2 = move con 0.22/0.48, nivel 3 = breathe/0.72, nivel 4 = focus/1.0 (salto de familia cromática deliberado para "día pleno")

**Componente `YearView`:**
- Grid 53 cols × 7 filas con `cellMap[col-dow]` para O(1) por celda
- Etiquetas de mes flotando sobre las columnas del 1 de cada mes
- Etiquetas de día (L/X/V en filas 0,2,4) a la izquierda
- Tres estados visuales: pre-uso (crema/borde tenue/opacity 0.35), vacío (paper-3/borde line), niveles 1-4 (div interno con bg+opacity)
- Días futuros: hueco invisible (no renderizado)
- Navegación ‹ AÑO › solo entre `availableYears` (union de `history.years` keys + currentYear)
- Click en celda → `onNavigateToMonth(yr, mo)` → StatsPanel cambia tab a "Mes" y navega al mes
- Tooltip desktop (fixed, pointer-events none) + tooltip móvil (fixed bottom 88px, cierra al tocar fuera via touchstart listener)
- Leyenda "menos ■■■■■ más" con los 5 niveles
- Footer con totales o mensaje de año vacío en italic serif
- CSS responsive via `<style>` con `[data-pace-year-*]` y `!important` (decisión activa s22): celdas 11px en ≤640px, scroll-snap-type x mandatory por trimestre

### BLOQUE C — StatsPanel.jsx (actualizado)

- `MonthHeatmap` recibe `initialYear`/`initialMonth` opcionales (para el jump desde YearView)
- `StatsPanel` añade estado `jumpYear`/`jumpMonth` + callback `handleNavigateToMonth`
- `YearView` recibe `history`, `lang`, `firstSeen`, `onNavigateToMonth`
- `maxWidth` del Modal bumpeado a 820px (el grid de 53 semanas es más ancho)
- `YearView` removido de StatsPanel.jsx → propio archivo

### BLOQUE D — Infraestructura

- `PACE.html`: nuevo script tag `app/stats/YearView.jsx` antes de `StatsPanel.jsx`
- `app/state.jsx`: `PACE_VERSION` v0.23.0 → v0.24.0
- `PACE.html`: `<title>` bumpeado a v0.24.0
- Backup: `backups/PACE_standalone_v0.23.0_20260506.html`
- `PACE_standalone.html` regenerado con `node build-standalone.js` → 451 KB

---

## Decisiones técnicas

**Split YearView → archivo propio.** El componente completo más los helpers sumaban ~320 líneas. En lugar de comprimir agresivamente el código (legibilidad), se extrajo siguiendo la regla de <500 líneas. El patrón zero-build requiere `const { useState, useRef, useEffect } = React;` al inicio de cada archivo — añadido.

**Score compuesto simplificado.** `focusBlocks = min(round(focusMinutes/25), 3)` en lugar de conteo real de sesiones, porque `history.days` solo guarda minutos, no número de sesiones. El cap en 3 evita que un día de mucho foco aplane la distinción de niveles.

**Días futuros = hueco invisible.** Decisión del prompt respetada: renderizar los futuros en crema generaría presión silenciosa ("tantos días por rellenar"), contraria a la filosofía del producto.

**`jan1Dow` fuera del loop.** Calculado una sola vez antes del `for`, no en cada iteración. Mejora menor de rendimiento, mayor claridad.

**`cellMap[col-dow]`** para acceso O(1) en el render del grid. El array de yearData tiene hasta 366 entradas; iterar en cada celda render sería inútilmente O(n).

**`onNavigateToMonth` → jump de año a mes.** El click en una celda llama al callback del padre (`StatsPanel`) que setea `jumpYear`/`jumpMonth` y cambia el tab a "Mes". `MonthHeatmap` ya recibe `initialYear`/`initialMonth` que se pasan al `useState` inicial — si el usuario navega de vuelta al tab Año y vuelve a Mes, el mes reseteará al actual (comportamiento esperado, no un bug).

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/stats/YearView.jsx` | **Nuevo** — 324 líneas |
| `app/stats/StatsPanel.jsx` | Actualizado — 393 líneas (YearView extraído, MonthHeatmap +initialYear/Month, StatsPanel +jump) |
| `app/i18n/strings.js` | +10 claves ES + 10 EN |
| `app/state.jsx` | PACE_VERSION v0.23.0 → v0.24.0 |
| `PACE.html` | +script YearView.jsx, title bumpeado |
| `PACE_standalone.html` | Regenerado — 451 KB |
| `backups/PACE_standalone_v0.23.0_20260506.html` | Backup creado |

---

## Riesgos verificados

- `YearView` no referenciado hasta que StatsPanel.jsx carga, y YearView.jsx carga antes → sin riesgo de `undefined`.
- `history.days` puede ser `{}` (año sin datos) → `getYearData` devuelve entries con score 0 → `computeLevel` retorna 0 → celdas vacías correctas.
- `firstSeen: null` (usuario que saltó el Welcome) → `firstSeenStr = null` → `isPreUse = false` siempre → grid muestra "vacío" en lugar de "pre-uso". Comportamiento conservador correcto.
- `availableYears` siempre incluye `currentYear` → navegación nunca queda sin opciones.
- `Math.round(cell.score * 10) / 10` en tooltip evita decimales largos.
