# Sesión 48b · 2026-05-07 · fix: restauración masiva + glifos canónicos Dirección D

## Contexto

Continuación de sesión 48 (que se cortó por límite de contexto en sesión anterior).
La sesión previa había dejado 12 archivos fuente truncados sin null bytes —
una corrupción silenciosa no detectada por la blindaje de null bytes del build script.

## Problema detectado

`Achievements.jsx` fue restaurado desde el backup v0.25.0 (correcto para la estructura),
pero perdió los glifos canónicos de Dirección D aplicados en s48 (viewBox 44×44 portados
de `design/glyphs-explorations.html`). El archivo restaurado tenía:
- viewBox 24×24 (incorrecto — inventados a ojo)
- Solo 10 entradas en GLYPH_SVG
- Tag `<script type="text/babel">` espurio en línea 1 (artefacto de extracción del backup)

## Fix aplicado

Reescritura completa de `app/achievements/Achievements.jsx` via bash `cat >` (no Edit tool,
que trunca). El nuevo archivo tiene:

- **20 entradas GLYPH_SVG** con viewBox 44×44, portadas literalmente de la exploración canónica
- **21 referencias glyphSvg** en ACHIEVEMENT_CATALOG (alias `first.plan` = `first.ritual`)
- Entradas nuevas con glyphSvg respecto a v0.25.0: `streak.7`, `streak.30`, `streak.365`,
  `focus.hours.100`, `breathe.sessions.10`, `breathe.sessions.50`, `move.sessions.25`,
  `explore.box`, `explore.coherent`, `explore.rounds`
- Sin tag `<script>` espurio
- 389 líneas

## Glifos portados (Dirección D — Constelaciones)

| id | descripción visual |
|---|---|
| first.step | punto central + anillo exterior |
| first.breath | 3 puntos en arco + curva Q |
| first.stretch | 4 puntos en rombo + contorno |
| first.sip | punto + círculo grande |
| first.extra | 4 esquinas + cruz diagonal |
| first.cycle | círculo + punto superior |
| first.ritual | cruz de 4 puntos + centro + líneas cross |
| first.day | arco casi completo + punto |
| streak.3 | 3 puntos en línea |
| streak.7 | 7 puntos en heptágono + contorno |
| streak.30 | círculo + punto central grande |
| streak.365 | 7 puntos irregulares + centro + polígono |
| focus.hours.100 | "C" en EB Garamond italic |
| breathe.sessions.10 | 4 puntos en onda sinusoidal |
| breathe.sessions.50 | 8 puntos en cuadrícula 2×4 |
| move.sessions.25 | 6 puntos en 2 columnas + 3 líneas horizontales |
| explore.box | 4 esquinas + cuadrado |
| explore.coherent | 2 puntos + centro + vesica piscis |
| explore.rounds | 4 puntos cardinales + arco casi completo |
| secret.cow.click | constelación vaca (5+1 puntos reescalados 24→44 ×1.833) |

## Build

```
PACE_standalone.html generado -- 478 KB
Null bytes: 0
U+FFFD: 0
viewBox 44x44 en bundle: 1
glyphSvg en bundle: 22
```

## Archivos modificados

- `app/achievements/Achievements.jsx` — reescrito con glifos canónicos 44×44
- `PACE_standalone.html` — regenerado
- `backups/PACE_standalone_v0.25.1_20260507.html` — backup oficial s48

## Versión

v0.25.0 → v0.25.1 (patch: glifos canónicos Dirección D)
