# Sesión 48d.1 · v0.25.3 → v0.25.4 · Hotfix: Achievements.jsx truncado

**Fecha:** 2026-05-08
**Versión:** v0.25.3 → v0.25.4 (patch · hotfix truncamiento)

---

## Problema

`PACE_standalone.html` v0.25.3 generado en s48d lanzaba
`Uncaught SyntaxError: Unterminated string constant (275:44)` al cargarse en el navegador.

**Causa raíz:** la llamada al tool `Edit` en s48d que reemplazó el bloque `GLYPH_SVG`
y añadió `glyphSvg` a las 13 entradas del catálogo truncó `app/achievements/Achievements.jsx`
en la línea 273, dejando el archivo a menos de la mitad (el original tenía 389 líneas).
El standalone inlineó el archivo truncado y Babel no pudo parsear el string incompleto.

---

## Diagnóstico

- Archivo en disco: 273 líneas, termina en `{t('ach.av` (mid-string)
- Archivo en `origin/main` (git cache local): 389 líneas, completo — versión v0.25.0 base
- Divergencia: el base de origin/main no tenía las correcciones de s48d (whitespace B-cat,
  `first.ritual` path completo, 13 entradas C añadidas, 13 `glyphSvg` en catálogo)

---

## Solución

1. Base limpia recuperada de git cache (`origin/main`) → `/tmp/achievements-base.jsx`
2. Script Python `/tmp/apply_48d.py` re-aplicó todas las correcciones de s48d:
   - Reemplazo completo del bloque `GLYPH_SVG` (33 entradas + alias, whitespace canónico,
     `first.ritual` con segmento `M22 22 L22 22`, 13 entradas C nuevas)
   - Adición de `glyphSvg: GLYPH_SVG['<id>']` a las 13 entradas del catálogo
3. Script bloqueado por falso positivo: `assert "t('ach.av" not in result` disparaba
   porque el código legítimo contiene `t('ach.available')`. Corregido cambiando
   el check a `assert not result[-1000:].rstrip().endswith("t('ach.av")`.
4. Script re-ejecutado → 402 líneas, todas validaciones OK.
5. Archivo escrito en `app/achievements/Achievements.jsx`.

---

## Validaciones (todas OK)

| Check | Resultado |
|---|---|
| Última línea | `Object.assign(window, { Achievements, ACHIEVEMENT_CATALOG });` |
| Líneas totales | 402 (en rango 280–420) |
| Balance `{` / `}` | 207 / 207 (diff=0) |
| No truncado al final | OK |
| Entradas en `GLYPH_SVG` | 33 explícitas + 1 alias |
| `glyphSvg` en catálogo | 34 referencias |
| `fill="#` en GLYPH_SVG | 0 |
| `stroke="#` en GLYPH_SVG | 0 |

---

## Mejora: validador de strings en build-standalone.js

Se añadió `validateNoUnclosedStrings(content, src)` en modo warning (no aborta el build):
- Detecta strings sin cerrar en la última línea de cada archivo JSX inlineado
- Detecta template literals sin cerrar al final del archivo
- Llama a `console.warn` — el build continúa pero avisa en consola
- Nota: el heurístico de backticks produce falsos positivos en archivos
  cuyo último template literal se cierra correctamente en la última línea.
  Son inofensivos (warning, no error).

---

## Bundle v0.25.4

- `PACE_standalone.html`: 493566 bytes / 481 KB
- `PACE_VERSION` en bundle: `v0.25.4` ✓
- 0 null bytes, `</body>` ×1, `</html>` ×1
- 29 bloques babel ✓
- `Object.assign(window, { Achievements, ACHIEVEMENT_CATALOG })` presente y correctamente cerrado ✓

---

## Backups

- `backups/PACE_standalone_v0.25.3_20260508_ROTO.html` ← bundle truncado (conservado para referencia)
- `backups/PACE_standalone_v0.25.4_20260508.html` ← nuevo bundle sano
- Total backups: 18 (límite 20)

---

## Pendientes

- `secret.cow.click`: sin glifo canónico en `design/glyphs-explorations.html` (pendiente sesión de diseño)
- Glifos del catálogo sin canónico D (unicode puro): `maestria` restantes, `exploracion` no-D,
  `estacionales`, `estadisticas`, `secretos` — candidatos a sesión de diseño futura
- Mejorar heurístico de backticks en `validateNoUnclosedStrings` para eliminar falsos positivos
