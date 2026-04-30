# Sesión 30 · v0.14.0 → v0.14.1 · DESIGN_SYSTEM.md creado + limpieza de duplicación

**Fecha:** 2026-04-30
**Versión:** v0.14.0 → **v0.14.1** (patch · documentación pura, 0 cambios de código)
**Build entregado:** sin cambios (no se tocó `PACE_standalone.html`)

---

## Resumen ejecutivo

Tarea de documentación pura: se crea `DESIGN_SYSTEM.md` (~270 líneas) como
archivo vivo centralizado de tokens, paletas, tipografía, espaciado,
breakpoints y utilidades. Hasta ahora los tokens estaban dispersos en
`tokens.css` y un resumen de 10 líneas en `CLAUDE.md`. Se sustituye
ese resumen por una referencia al nuevo archivo, eliminando la
duplicación de información (regla de "un único sitio").

Cero cambios de código. La app es idéntica a v0.14.0.

---

## Qué se hizo

### 1. Creación de `DESIGN_SYSTEM.md` (~270 líneas)

Archivo centralizado con:

- **Identidad visual (resumen):** fondo, texto, acentos, tipografía, estilo.
- **Paletas completas:** Crema día (default), Oscuro noche, Papel envejecido.
  Todas las variables `--paper`, `--ink`, `--focus`, `--breathe`, `--move`,
  `--extra`, `--hydrate`, `--achievement` y sus variantes `-2`/`-soft`.
- **Tipografía:** `--font-display`, `--font-ui`, `--font-mono`. Jerarquía de
  tamaños (`--size-hero` a `--size-meta`). Interlineado y tracking.
- **Tipografías alternativas (nuevo):** `[data-font="cormorant"]` y
  `[data-font="mono"]` que sobrescriben variables vía Tweaks.
- **Espaciado:** `--s-1` a `--s-9` con tabla de equivalencias y usos.
- **Radios, Sombras, Transiciones:** tokens extraídos de `tokens.css`.
- **Breakpoints y viewport:** 640px (móvil), 768px (tablet), 100vh/100dvh.
- **Clases utilitarias:** `.pace-display`, `.pace-display-italic`,
  `.pace-meta`, `.pace-tag` (con nota de inconsistencia de font-size).
- **Scrollbar y reset base (nuevo):** reset mínimo, transición de paleta,
  `:focus-visible` con outline de 2px, scrollbar custom de 10px.
- **Z-index layers:** placeholder "TODO" pendiente de tarea futura.

Todos los valores numéricos coinciden exactamente con `app/tokens.css`
(187 líneas verificadas). No se inventó ningún token.

### 2. Edición de `CLAUDE.md` (360 → 354 líneas)

- **Eliminado:** resumen de 10 líneas (287-296) con duplicación de
  identidad visual.
- **Añadido:** 4 líneas con referencia a `DESIGN_SYSTEM.md`:
  ```markdown
  ## 🎨 Identidad visual

  Ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para tokens completos,
  paletas, tipografía, espaciado, transiciones y utilidades.
  ```

### 3. Verificaciones en código real (checkpoint de rigor)

| Qué verificar | Dónde | Resultado |
|---|---|---|
| ActivityBar → grid 2×2 en 768px | `app/main.jsx:25-27,73-77` | ✅ Confirmado |
| Sidebar mide 280px en desktop | `app/main.jsx:9`, `Sidebar.jsx:504` | ✅ Confirmado |
| Patrón responsive móvil fue sesión 22 | `CHANGELOG.md:713-716` | ✅ Confirmado |

---

## Resultado cuantitativo

- **+1 archivo nuevo:** `DESIGN_SYSTEM.md` (~270 líneas).
- **CLAUDE.md:** 360 → 354 líneas (menos duplicación).
- **Cero cambios** en `app/`, `PACE.html`, `PACE_standalone.html`.
- **Cero cambios visuales** en la app de producto.

---

## Archivos

- **Nuevos:** `DESIGN_SYSTEM.md`.
- **Modificados:** `CLAUDE.md`.
- **Diario:** este archivo (`session-30-design-system.md`).
- **No tocados (intencional):** `STATE.md` (se actualiza abajo), `CHANGELOG.md`
  (se actualiza abajo), `app/*`, `PACE.html`, `PACE_standalone.html`.

---

## Próximos pasos

1. **Z-index layers:** extraer de los JSX (Sidebar z-index:60, Toast,
   modales) y documentar en `DESIGN_SYSTEM.md` (tarea atómica futura).
2. **Unificar `.pace-tag`** a `var(--size-meta)` (10px → 11px) o
   viceversa, para eliminar la inconsistencia apuntada.
3. **Validar glifos** del canvas `design/glyphs-explorations.html` (sesión 29)
   y ejecutar rediseño si procede.
4. **PWA instalable** — `manifest.json` + iconos + prompt (sesión sugerida).
5. **Sistema de claves offline** para Lifetime/Pase (sesión sugerida).

---

## Notas técnicas

- **Regla de un único sitio respetada:** la info ya no vive en dos
  lugares. `CLAUDE.md` apunta a `DESIGN_SYSTEM.md`.
- **`DESIGN_SYSTEM.md`** es ahora la fuente de verdad para tokens.
  `tokens.css` sigue siendo el que inyecta los valores en el DOM.
- **Cero emojis** en la UI (regla innegociable mantenida).
- **Documentación en español**, tono cálido y literario (ej: "camino",
  "ritmo", "respira").
