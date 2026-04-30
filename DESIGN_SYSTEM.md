# DESIGN_SYSTEM.md — PACE · Foco · Cuerpo
> Tokens, paletas, tipografía, espaciado, transiciones y utilidades.
> Para protocolo de trabajo, ver [`CLAUDE.md`](./CLAUDE.md).
> Para historial, ver [`CHANGELOG.md`](./CHANGELOG.md).

---

## 🎨 Identidad visual (resumen)

PACE tiene un tono calmado, artesanal y cuidado. No gamificación agresiva.

- **Fondo:** crema cálido `#F2EDE0`
- **Texto:** negro tinta `#1F1C17`
- **Acento verde (Foco):** oliva oscuro `#3E5A3A`
- **Acento terracota (Respira):** `#C97A5D`
- **Tipografía display:** serif italic (EB Garamond / Cormorant Garamond)
- **Tipografía UI:** sans-serif geométrica ligera (Inter Tight)
- **Estilo:** papel, tinta, mucho espacio en blanco, bordes finos, tags
  con border-radius pill.

---

## 🎨 Paletas completas

### Crema día (default)

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#F2EDE0` | Fondo principal |
| `--paper-2` | `#EAE4D4` | Fondo alterno / hover sutil |
| `--paper-3` | `#DFD8C4` | Fondo de cards / modales |
| `--ink` | `#1F1C17` | Texto principal |
| `--ink-2` | `#4A453C` | Texto secundario |
| `--ink-3` | `#8A8372` | Labels, meta, tags |
| `--line` | `#C9C0A8` | Bordes, divisores |
| `--line-2` | `#B8AD8E` | Bordes activos |
| `--focus` | `#3E5A3A` | Acento Foco |
| `--focus-2` | `#2A3E27` | Acento Foco oscuro |
| `--focus-soft` | `rgba(62,90,58,0.10)` | Fondos sutiles Foco |
| `--breathe` | `#C97A5D` | Acento Respira |
| `--breathe-2` | `#A85E43` | Acento Respira oscuro |
| `--breathe-soft` | `rgba(201,122,93,0.12)` | Fondos sutiles Respira |
| `--move` | `#9A7B4F` | Acento Mueve |
| `--move-soft` | `rgba(154,123,79,0.12)` | Fondos sutiles Mueve |
| `--extra` | `#6B7A8F` | Acento Extra |
| `--extra-soft` | `rgba(107,122,143,0.12)` | Fondos sutiles Extra |
| `--hydrate` | `#5F8A9B` | Acento Hidrátate |
| `--hydrate-soft` | `rgba(95,138,155,0.12)` | Fondos sutiles Hidrátate |
| `--achievement` | `#B8934A` | Acento Logros |
| `--achievement-soft` | `rgba(184,147,74,0.12)` | Fondos sutiles Logros |

### Oscuro noche

Activa con `[data-palette="oscuro"]`.

| Token | Valor |
|---|---|
| `--paper` | `#1A1814` |
| `--paper-2` | `#252119` |
| `--paper-3` | `#302B21` |
| `--ink` | `#EDE5D3` |
| `--ink-2` | `#B8AF9A` |
| `--ink-3` | `#756D5D` |
| `--line` | `#3C3628` |
| `--line-2` | `#4E4735` |
| `--focus` | `#7A9A6D` |
| `--focus-2` | `#98B58B` |
| `--focus-soft` | `rgba(122,154,109,0.12)` |
| `--breathe` | `#D99477` |
| `--breathe-2` | `#E8A98F` |
| `--breathe-soft` | `rgba(217,148,119,0.14)` |

### Papel envejecido

Activa con `[data-palette="envejecido"]`.

| Token | Valor |
|---|---|
| `--paper` | `#EDE2C8` |
| `--paper-2` | `#E3D6B6` |
| `--paper-3` | `#D6C8A3` |
| `--ink` | `#2B241A` |
| `--ink-2` | `#5A4F3C` |
| `--ink-3` | `#8F826A` |
| `--line` | `#BEAF8C` |
| `--focus` | `#56663E` |
| `--breathe` | `#B86A4D` |

---

## 🔤 Tipografía

### Fuentes

| Variable | Valor | Uso |
|---|---|---|
| `--font-display` | `'EB Garamond', 'Cormorant Garamond', Georgia, serif` | Títulos italic, identidad |
| `--font-ui` | `'Inter Tight', system-ui, -apple-system, sans-serif` | UI, texto descriptivo |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Devtools, secretos |

**Nota:** las cifras de identidad (`MM:SS` del timer, `0` de racha) están blindadas a `'EB Garamond', Georgia, serif` directamente en el JSX (sesión 20). No pasan por `--font-display`.

### Jerarquía de tamaños

| Token | Valor | Uso típico |
|---|---|---|
| `--size-hero` | `clamp(96px, 12vw, 180px)` | Número gigante del timer (estilo Aro) |
| `--size-h1` | `40px` | Títulos de modal (`SessionPrep`, `SessionDone`) |
| `--size-h2` | `28px` | Títulos de sección en sidebar |
| `--size-h3` | `20px` | Subtítulos, nombres de rutina |
| `--size-body` | `15px` | Texto UI general |
| `--size-sm` | `13px` | Texto secundario |
| `--size-meta` | `11px` | Labels, tags (`SIT`, `HIP`, etc.) |

### Interlineado y tracking

| Token | Valor | Uso |
|---|---|---|
| `--lh-tight` | `1.1` | Títulos, números |
| `--lh-normal` | `1.45` | Texto de lectura |
| `--lh-relaxed` | `1.65` | Descripciones largas |
| `--track-meta` | `0.14em` | Labels, meta (uppercase) |
| `--track-tag` | `0.08em` | Tags pill |

**Nota:** el patrón para títulos italic es usar el helper `displayItalic` definido en `app/ui/Primitives.jsx` (sesión 26).

### Tipografías alternativas (tweaks)

Se activan por `[data-font="..."]` y sobrescriben las variables CSS. Forma parte del sistema de Tweaks del producto.

| Atributo | Variables que cambia | Valor |
|---|---|---|
| `[data-font="cormorant"]` | `--font-display` | `'Cormorant Garamond', Georgia, serif |
| `[data-font="mono"]` | `--font-display`, `--font-ui` | `'JetBrains Mono', ui-monospace, monospace |

Nota: `[data-font="mono"]` sobrescribe tanto display como UI, convirtiendo toda la interfaz a monoespaciada.

---

## 📐 Espaciado

| Token | Valor | Equivalente | Uso típico |
|---|---|---|---|
| `--s-1` | `4px` | | Separación mínima, iconos |
| `--s-2` | `8px` | | Padding interno compacto |
| `--s-3` | `12px` | | Gap entre elementos |
| `--s-4` | `16px` | | Padding estándar de botones |
| `--s-5` | `24px` | | Separación entre secciones |
| `--s-6` | `32px` | | Padding de cards, modales |
| `--s-7` | `48px` | | Separación vertical mayor |
| `--s-8` | `64px` | | Hero, espaciado de pantalla completa |
| `--s-9` | `96px` | | Reservado para futuros layouts editoriales |

**Conversión rápida:** `1rem = 16px` (root font-size por defecto del navegador).

---

## 🔲 Radios · 🌑 Sombras · ⏱️ Transiciones

### Radios

| Token | Valor | Uso |
|---|---|---|
| `--r-xs` | `4px` | Bordes sutiles |
| `--r-sm` | `8px` | Botones, inputs |
| `--r-md` | `12px` | Cards, modales pequeños |
| `--r-lg` | `20px` | Modales, panels |
| `--r-pill` | `999px` | Tags, pills, botones redondeados |

### Sombras

| Token | Valor | Uso |
|---|---|---|
| `--sh-soft` | `0 1px 2px rgba(31,28,23,0.06), 0 4px 16px rgba(31,28,23,0.04)` | Hover sutil |
| `--sh-card` | `0 1px 3px rgba(31,28,23,0.05), 0 8px 24px rgba(31,28,23,0.06)` | Cards elevadas |
| `--sh-modal` | `0 8px 40px rgba(31,28,23,0.18)` | Backdrop de modales |

### Transiciones

| Token | Valor | Uso |
|---|---|---|
| `--dur-quick` | `180ms` | Micro-interacciones (hover, focus) |
| `--dur-normal` | `320ms` | Cambios de tema, transiciones de estado |
| `--dur-slow` | `640ms` | Animaciones de entrada/salida |
| `--ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Curva de aceleración estándar |

**Respeto a `prefers-reduced-motion`:** `tokens.css` incluye:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 Breakpoints y viewport

PACE usa un enfoque móvil-primero con **dos breakpoints principales**:

| Breakpoint | Valor | Uso |
|---|---|---|
| Móvil | `≤ 640px` | Patrón: `<style>` + `[data-pace-*]` + `!important` (decisión sesión 22) |
| Tablet | `≤ 768px` | `ActivityBar` pasa a grid 2×2; sidebar fullscreen |
| Desktop | `> 768px` | Layout flex completo con sidebar de 280px |

### Unidades de viewport

- **`100vh` + `100dvh`** (fallback + override): usado en `app/main.jsx` raíz y `app/shell/Sidebar.jsx`.
- **Scroll asimétrico** (sesión 24): home usa `100dvh` puro (4 botones siempre visibles); sidebar usa `min-height: calc(100dvh + 1px)` con `height: auto` para activar auto-hide de la barra del navegador.

---

## 📋 Clases utilitarias

Definidas en `app/tokens.css`, se aplican con `className`:

| Clase | Descripción |
|---|---|
| `.pace-display` | `font-family: var(--font-display)` — para elementos inline que necesiten la display |
| `.pace-display-italic` | `font-family: var(--font-display); font-style: italic` — títulos cortos |
| `.pace-meta` | Meta labels: `11px`, `0.14em` tracking, uppercase, `color: var(--ink-3)`, `500` weight |
| `.pace-tag` | Tags pill: inline-flex, `3px 10px` padding, `10px` font-size (literal, no `var(--size-meta)` que sería 11px — pequeña inconsistencia a unificar en futura tarea), `0.08em` tracking, uppercase, borde pill |

---

## Scrollbar y reset base

Estilos definidos en `app/tokens.css` que afectan al documento entero:

### Reset mínimo
- `* { box-sizing: border-box }` — todos los elementos.
- `html, body { margin: 0; padding: 0 }` — sin espaciado por defecto.
- `body` usa `font-family: var(--font-ui)`, `font-size: var(--size-body)`, `line-height: var(--lh-normal)`, `color: var(--ink)`, `background: var(--paper)`.
- **Transición automática de fondo y color:** al cambiar paleta (tweak), `body` transiciona con `transition: background-color var(--dur-normal) var(--ease), color var(--dur-normal) var(--ease)`.

### Focus visible
- `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: var(--r-xs); }` — accesibilidad de teclado con aro finito en color de foco.

### Scrollbar custom
- Ancho: `10px` (horizontal y vertical).
- `::-webkit-scrollbar-track { background: transparent; }` — sin fondo visible.
- `::-webkit-scrollbar-thumb { background: var(--line); border-radius: 10px; border: 3px solid var(--paper); }` — grosor visual 4px (thumb 10px - 2×3px border).
- `::-webkit-scrollbar-thumb:hover { background: var(--line-2); }` — oscurece al hover.

---

## Z-index layers

TODO: documentar capas de z-index (sidebar, toasts, modales). Pendiente de extraer de los JSX en tarea separada.
