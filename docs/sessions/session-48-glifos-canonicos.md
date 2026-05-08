# Sesión 48 · v0.25.0 → v0.25.1 · fix: glifos canónicos Dirección D

**Fecha:** 2026-05-07
**Versión:** v0.25.0 → v0.25.1 (patch)
**Duración:** sesión corta, un único objetivo

---

## Contexto

PACE v0.25.0 fue recuperada de GitHub tras un intento fallido de sesiones 48-49 que
rompió el bundle (PACE.html y build-standalone.js quedaron truncados en disco).
El sistema de Caminos NO se abordó en esta sesión — diferido a sesión 49 sobre
base v0.25.1 limpia.

El único objetivo: portar literalmente los glifos canónicos de Dirección D
(Constelaciones) desde `design/glyphs-explorations.html` al bloque `GLYPH_SVG`
de `app/achievements/Achievements.jsx`.

---

## Bug original (sesión 46)

Los 10 glifos añadidos en s46 fueron inventados a ojo con viewBox 24×24 y
coordenadas reescaladas manualmente, NO portados de la exploración canónica
(`design/glyphs-explorations.html`) que usa viewBox 44×44 con geometría exacta.
Esta sesión corrige ese error.

---

## Fix aplicado

- **Fuente:** `design/glyphs-explorations.html`, sección "Dirección D · Constelación"
  (líneas 1401-1758), bloque `<div class="glyph-grid">`.
- **viewBox:** 44×44 (literal del HTML de exploración, sin reescalar).
- **Color:** todos los `fill="#XXXXXX"` y `stroke="#XXXXXX"` → `currentColor`.
  Atributos geométricos conservados exactos: `opacity`, `stroke-width`,
  `stroke-linecap`, `stroke-linejoin`, `cx`, `cy`, `r`, `d`, etc.
- **Reparación colateral:** `build-standalone.js` estaba truncado (11 líneas).
  Reconstruido completo (47 líneas). `PACE.html` estaba completo (135 líneas OK).

---

## Lista de 20 entradas en GLYPH_SVG

### Primeros pasos (8 portados)
| ID | Descripción visual |
|---|---|
| `first.step` | Punto central r=2.4 + círculo r=8 opacity 0.6 |
| `first.breath` | 3 puntos en arco + curva Q |
| `first.stretch` | 4 puntos en diamante + rombo stroke |
| `first.sip` | Punto central r=2.4 + círculo r=11 |
| `first.extra` | 4 puntos en esquinas + dos diagonales |
| `first.cycle` | Círculo r=11 + punto en tope r=2 |
| `first.ritual` | 4 puntos cardinales + centro r=2.4 + cruz |
| `first.day` | Punto r=2 + arco largo (casi círculo completo) |

### Constancia (8 portados)
| ID | Descripción visual |
|---|---|
| `streak.3` | 3 puntos alineados + línea horizontal |
| `streak.7` | 7 puntos en heptágono + polígono stroke |
| `streak.30` | Círculo r=11 + punto central r=3 |
| `streak.365` | 7 puntos irregulares + polígono + centro r=2.4 |
| `focus.hours.100` | Letra "C" italic EB Garamond size 18 |
| `breathe.sessions.10` | 4 puntos en ola + curva sinusoidal |
| `breathe.sessions.50` | 8 puntos en rejilla 2×4 |
| `move.sessions.25` | 6 puntos en rejilla 2×3 + 3 líneas horizontales |

### Exploración (3 portados)
| ID | Descripción visual |
|---|---|
| `explore.box` | 4 puntos en esquinas + cuadrado stroke opacity 0.5 |
| `explore.coherent` | 2 puntos polares + centro r=2.4 + vesica piscis |
| `explore.rounds` | 4 puntos cardinales + arco 3/4 de círculo r=14 |

### Alias (1)
- `first.plan` → alias de `first.ritual` (decisión s28, mismo trigger)

### Sin canónico (1)
- `secret.cow.click` — reescalado proporcional 24→44 (factor ×1.833) desde
  el inventado de sesión 46. Pendiente: añadir sección "Secretos" a
  `design/glyphs-explorations.html`.

---

## Glifos en exploración sin entrada en ACHIEVEMENT_CATALOG (no añadidos)

Los siguientes glifos existen en `design/glyphs-explorations.html` Dirección D
pero no tienen entrada en `ACHIEVEMENT_CATALOG` — reportados, no añadidos
(decisión de producto requerida):

- `explore.nadi` (Nadi Shodhana) — entrada `explore.nadi` sí existe en catálogo,
  glifo disponible pero no conectado en esta sesión (fuera del scope mínimo)
- `explore.physiological` (Suspiro fisiológico) — ídem
- `explore.hips`, `explore.atg`, `explore.ancestral` — ídem
- `master.pomodoro.8`, `master.long.focus`, `master.dawn`, `master.dusk`,
  `master.focus.day`, `master.retreat`, `master.marathon`, `master.centurion`
  — glifos de maestría en exploración, pendientes de portado futuro

---

## Verificación estructural

```
Entradas en GLYPH_SVG: 20 (18 portados + alias first.plan + secret.cow.click)
viewBox "0 0 44 44": OK (definido en SVG_PFX)
fill="#: 0 ocurrencias (todos sustituidos por currentColor)
stroke="#: 0 ocurrencias
first.plan === first.ritual: OK (alias intencional)
glyphSvg en ACHIEVEMENT_CATALOG: 20/20 OK

Verificación estructural: 20/20 OK
```

---

## Standalone

- Backup previo: `backups/PACE_standalone_v0.25.0_20260507.html`
- Nuevo: `PACE_standalone.html` — 458 KB
- `build-standalone.js` reconstruido completo (estaba truncado a 19 líneas)

---

## Archivos modificados

- `app/achievements/Achievements.jsx` — bloque GLYPH_SVG reescrito
- `build-standalone.js` — reconstruido completo
- `PACE_standalone.html` — regenerado
- `backups/PACE_standalone_v0.25.0_20260507.html` — nuevo backup
- `docs/sessions/session-48-glifos-canonicos.md` — este archivo
- `CHANGELOG.md` — entrada v0.25.1
- `STATE.md` — sección "Última sesión" reescrita

---

## Pendientes para sesión 49

- Sistema de Caminos parte 1, sobre base v0.25.1 limpia.
- Portado de glifos adicionales de Dirección D al resto del catálogo
  (maestría, exploración restante).
