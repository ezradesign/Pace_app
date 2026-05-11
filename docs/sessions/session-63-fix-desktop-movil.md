# Sesión 63 — Fix scroll residual Stats desktop + sidebar móvil compacta (v0.28.4)

**Fecha:** 2026-05-12
**Versión:** v0.28.3 → v0.28.4
**Commit:** feat(ui): fix scroll residual Stats desktop + sidebar movil compacta (v0.28.4)

---

## Contexto

Continuación de s61/62. Las pestañas Semana, Mes, Año y Caminos del modal Stats
seguían con scroll residual en desktop (1080p). Además los días futuros del heatmap
anual eran indistinguibles de los días pasados sin actividad (mismo fondo paper-3 + borde).
El sidebar en móvil tampoco cabía sin scroll en phones pequeños (iPhone SE).

---

## Cambios aplicados

### 1A — WeekView: nota inferior eliminada

`app/stats/StatsPanel.jsx`

El bloque "Nota: no medimos para juzgarte..." (marginTop:8, padding:6, fontSize:10)
fue eliminado completamente. El subtítulo del modal ("Métricas suaves. Sin ansiedad,
sin comparación.") transmite el mismo mensaje. Ganancia vertical: ~30px en desktop.

### 1B — MonthHeatmap: celdas 56→48

`app/stats/StatsPanel.jsx`

- Celdas: 56px → 48px (ancho + alto en CSS)
- Grid: `repeat(7, 48px)` — centrado igual
- Footer totales: `marginTop:14→10`, `padding:'10px 14px'→'8px 10px'`, `fontSize:12→11`
- Fuente día en celda: 13→12

Cálculo final: 6 filas × 48 + 5 × 6 gap = 318px alto (antes 366px). Elimina ~48px.

### 1C — YearView / PathYearView: días futuros solo borde

`app/stats/YearView.jsx`, `app/stats/PathYearView.jsx`

Los días futuros pasaron de `background:'var(--paper-3)', border:'1px solid var(--line)'`
(idéntico al nivel 0) a `background:'transparent', border:'1px solid var(--line)', opacity:0.3`.
Ahora son claramente distinguibles: los días pasados sin actividad tienen fondo sólido,
los días futuros son casi invisibles (solo borde muy tenue).

### 1D — PathStats / PathYearView: márgenes compactos

`app/stats/PathYearView.jsx`:
- Nav año: `marginBottom:16→10`
- Leyenda: `marginTop:10→4`
- Columnas: `gap:2→1`, `marginRight:2→1` (stride = 11+1=12px)
- Month labels: `marginRight:2→1` alineado con nuevo stride
- Day label column: `gap:2→1`
- Footer totales: `marginTop:12→8`, `padding:'10px 14px'→'8px 10px'`, `fontSize:12→11`

`app/stats/PathStats.jsx`:
- Título heatmap: `marginBottom:6→4`

`PACE.html` (CSS):
- `.path-stats { gap:10px→6px }`

### 2A — Sidebar móvil @640px

`app/shell/Sidebar.jsx`

**CSS** (añadido a `pace-sidebar-responsive-css`):
- LogoBar a 640px: `min-height:48px`, `max-height:48px`, `overflow:hidden` — logo
  recortado al ~50%, tagline oculto por clipping.
- Achievements grid a 640px: `grid-template-columns:repeat(5,40px)`, `gap:4px`,
  `margin-bottom:6px` — círculos 64→40px.

**JS** (`isMob = window.matchMedia('(max-width:640px)').matches`):
- 3 Dividers: `margin:'14/16px 0 16/14px'` → `'8px 0 10px'`
- Section headers RITMO/LOGROS: `marginBottom:10→6`
- streakNum fontSize: `44→32`
- `WeekDots`: dotSize `6→5`, gap `6→4`, marginTop `12→8`
- `SenderoDelDia` SVG: W `240→180`, H `46→36`
- `StatusBar`: `marginTop:14→8`, `paddingTop:12→8`, `gap:10→6`, btn margins compactos

### 2B — StatsPanel Semana móvil

`app/stats/StatsPanel.jsx`

Añadido wrapper `data-pace-week-view` + `<style>` con media queries `@media(max-width:640px)`:
- Cards: `repeat(4,1fr)` → `repeat(2,1fr)`, gap 8px, margin-bottom 10px
- WeekBarRow: `margin-bottom:6px` (antes 8)
- Bar chart: height `28px` (antes 36)

Añadidos data attributes: `data-pace-week-cards`, `data-pace-week-bar-row`, `data-pace-bar-chart`.

### 2C — PathStats Caminos móvil

`PACE.html` (CSS añadido `@media(max-width:640px)`):
- `.path-stats-summary`: `display:grid !important`, `grid-template-columns:repeat(3,1fr)`,
  `gap:8px` — horizontal, sin columna apilada.
- `.path-stat-card`: `min-width:0`, `padding:6px 8px`
- `.path-stat-label`: `font-size:.72em`
- `.path-stat-value`: `font-size:1.05em`

Regla 480px anterior limpiada de `min-width:100%` / `flex-direction:column`.

---

## Build

- Backup: `backups/PACE_standalone_v0.28.3_20260512.html`
- Bundle: 556 KB → 557 KB (+1 KB)
- Versión: v0.28.3 → v0.28.4
- Archivos validados: 40
- Backups tras limpieza: 20 (eliminados los 4 más antiguos v0.22–v0.25.0-pre48)

---

## Verificación esperada por el usuario

**Desktop 1080p (Brave):**
- Semana: cero scroll, sin nota inferior
- Mes: celdas 48px, cero scroll
- Año: días futuros claramente vacíos (solo borde tenue opacity 0.3)
- Caminos: cero scroll con márgenes compactos

**Móvil iPhone 12 / Pixel 5 emulado (390×844):**
- Sidebar: cabe sin scroll (logo 48px, dividers compactos, streakNum 32px)
- Ritmo·Semana: cards 2×2 sin desborde horizontal
- Ritmo·Caminos: summary cards 3 columnas horizontales
