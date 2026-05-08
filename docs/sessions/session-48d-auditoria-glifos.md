# Sesión 48d · v0.25.2 → v0.25.3 · Auditoría glifos Dirección D

**Fecha:** 2026-05-08
**Versión:** v0.25.2 → v0.25.3 (patch · correcciones de glifos)

---

## Contexto

Auditoría sistemática post-s48/48b/48c para verificar que cada `glyphSvg` de
`app/achievements/Achievements.jsx` corresponde **literalmente** al glifo de
Dirección D en `design/glyphs-explorations.html`.

La sesión 48 reducida (v0.25.1) portó 20 entradas a `GLYPH_SVG`. Quedaban
dudas sobre: (a) whitespace entre elementos SVG, (b) un segmento de path en
`first.ritual`, (c) 13 glifos de Dirección D presentes en el HTML pero no
portados al código.

---

## Metodología

Comparación byte a byte mediante script Python:
1. Extracción canónica: sección D del HTML, normalización `fill="#XXXXXX"` →
   `currentColor`, colapso de whitespace.
2. Extracción actual: bloque `GLYPH_SVG` del JSX, misma normalización.
3. Comparación literal de los bodies normalizados.

---

## Totales

- **Glifos en Dirección D (HTML canónico):** 32
- **Entradas explícitas en `GLYPH_SVG` antes:** 20 + 1 alias
- **Entradas explícitas en `GLYPH_SVG` después:** 33 + 1 alias

---

## Tabla de clasificación

| ID | Cat | Resultado |
|---|---|---|
| `first.step` | B | Sustituido (whitespace entre elementos) |
| `first.breath` | B | Sustituido (whitespace) |
| `first.stretch` | B | Sustituido (whitespace) |
| `first.sip` | B | Sustituido (whitespace) |
| `first.extra` | B | Sustituido (whitespace) |
| `first.cycle` | B | Sustituido (whitespace) |
| `first.ritual` | B | Sustituido (**contenido real**: faltaba `M22 22 L22 22` en path + whitespace) |
| `first.day` | B | Sustituido (whitespace) |
| `streak.3` | B | Sustituido (whitespace) |
| `streak.7` | B | Sustituido (whitespace) |
| `streak.30` | B | Sustituido (whitespace) |
| `streak.365` | B | Sustituido (whitespace) |
| `focus.hours.100` | A | Sin cambios (coincidía literalmente) |
| `breathe.sessions.10` | B | Sustituido (whitespace) |
| `breathe.sessions.50` | B | Sustituido (whitespace) |
| `move.sessions.25` | B | Sustituido (whitespace) |
| `explore.box` | B | Sustituido (whitespace) |
| `explore.coherent` | B | Sustituido (whitespace) |
| `explore.rounds` | B | Sustituido (whitespace) |
| `explore.nadi` | C | Añadido desde Dirección D |
| `explore.physiological` | C | Añadido desde Dirección D |
| `explore.hips` | C | Añadido desde Dirección D |
| `explore.atg` | C | Añadido desde Dirección D |
| `explore.ancestral` | C | Añadido desde Dirección D |
| `master.pomodoro.8` | C | Añadido desde Dirección D |
| `master.long.focus` | C | Añadido desde Dirección D |
| `master.dawn` | C | Añadido desde Dirección D |
| `master.dusk` | C | Añadido desde Dirección D |
| `master.focus.day` | C | Añadido desde Dirección D |
| `master.retreat` | C | Añadido desde Dirección D |
| `master.marathon` | C | Añadido desde Dirección D |
| `master.centurion` | C | Añadido desde Dirección D |
| `secret.cow.click` | D | Intacto (sin canónico, es secreto) |
| `first.plan` | E | Alias → `first.ritual` verificado OK |

**Resumen:**
- A (coincidían): 1
- B (sustituidos): 18
- C (añadidos): 13
- D (sin canónico, intactos): 1
- E (alias verificado): 1

---

## Naturaleza de las divergencias B

17 de los 18 B eran **únicamente whitespace**: el código portado en s48 omitía
el espacio entre elementos SVG (`/>` en lugar de `"/> "`). Visualmente idénticos,
pero literalmente distintos del canónico.

El caso real: **`first.ritual`** — el canónico tiene
`<path d="M22 8 L22 36 M8 22 L36 22 M22 22 L22 22" .../>` (con el segmento
degenerado `M22 22 L22 22` que no dibuja nada pero es parte del canónico).
El código previo tenía `<path d="M22 8 L22 36 M8 22 L36 22" .../>` (truncado).

---

## Correcciones en ACHIEVEMENT_CATALOG

Los 13 glifos nuevos (categoría C) también recibieron `glyphSvg:
GLYPH_SVG['<id>']` en sus entradas del catálogo:
`explore.nadi`, `explore.physiological`, `explore.hips`, `explore.atg`,
`explore.ancestral`, `master.pomodoro.8`, `master.long.focus`, `master.dawn`,
`master.dusk`, `master.focus.day`, `master.retreat`, `master.marathon`,
`master.centurion`.

---

## Verificación estructural (5/5 OK)

1. Entradas en `GLYPH_SVG`: **33** explícitas + 1 alias
2. `fill="#` en bloque: **0** ✓
3. `stroke="#` en bloque: **0** ✓
4. `viewBox="0 0 44 44"` en `SVG_PFX`: **OK** ✓
5. IDs sin `glyphSvg` en catálogo: **0** ✓
6. `GLYPH_SVG['first.plan'] === GLYPH_SVG['first.ritual']`: **OK** ✓
7. Líneas totales del archivo: **274** (< 500) ✓

---

## Standalone

- Backup pre-48d: `backups/PACE_standalone_v0.25.2_20260508_pre48d.html`
- Nuevo standalone: `PACE_standalone.html` · 491202 bytes / 479 KB
- Backup post-48d: `backups/PACE_standalone_v0.25.3_20260508.html`
- Checks: 0 null bytes, 0 dobles `<script>`, `</body>` ×1, `</html>` ×1,
  `function mount` ×1, `rel="manifest"` ×0, 29 bloques babel ✓

---

## Pendientes (categoría D + hallazgos)

- `secret.cow.click`: sin glifo canónico en `design/glyphs-explorations.html`.
  Pendiente: añadir sección "Secretos" a la exploración con su glifo definitivo
  (anotado en STATE.md desde s48c).
- Glifos de Dirección D no portados aún (sin entrada en catálogo todavía):
  ninguno — los 32 disponibles en D están todos representados o son secretos.
- Glifos del catálogo sin canónico en D (unicode puro): todos los restantes de
  `maestria`, `exploracion` (no cubiertas por D), `estacionales`, `estadisticas`,
  `secretos`. Son candidatos a sesión de diseño futura.
