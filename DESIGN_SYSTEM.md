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

> **Nota (s101):** las páginas estáticas de raíz `safety.html` y
> `privacy.html` llevan **copias inline** de crema + oscuro (son
> autocontenidas, sin acceso a tokens.css). Si se recalibra cualquiera de
> las dos paletas, actualizar también esas dos páginas.

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
| `--focus-cta` | `#50624D` | **CTAs "Comenzar"** principales (s77b): Pomodoro home + Camino sugerido + cada Camino en la biblioteca. Verde apagado equilibrado (mas gris que `--focus` puro). NO usar para acciones secundarias |
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
| `--premium` | `#9C6B2E` | **Sello PREMIUM** / gating de contenido (s87, bloque Contenido+Premium F3a). Bronce profundo, deliberadamente más oscuro que `--achievement` y `--move` para no confundirse a simple vista. Lo usa `PremiumSeal` (Primitives) |
| `--premium-soft` | `rgba(156,107,46,0.12)` | Fondo sutil del sello PREMIUM |

### Oscuro noche

Activa con `[data-palette="oscuro"]`. Desde s89 (v0.34.5) es también el
**default inicial si el SO está en oscuro** (`detectInitialPalette()` lee
`prefers-color-scheme` SOLO en el primer arranque; la elección manual de
Tweaks persiste y siempre gana después). Recalibrada en s79 (v0.32.1):
superficies y bordes +10% luminosidad; `--ink-*` intactos. **Segunda
recalibración en s97 (v0.42.0)** — bug de legibilidad publicado: `--ink-3`
estaba MÁS oscuro que en la paleta clara (`#756D5D` < `#8A8372`) y dejaba
ilegible toda la letra fina (descriptores, labels de sección, "días
seguidos", footer); `--line`/`--line-2` dejaban invisibles el track del aro
(TimerDial usa `--line`) y los bordes de cards. Se subieron **en bloque**
esos 3 peldaños; `--paper*`, `--ink`, `--ink-2` intactos. El **logo** en
oscuro sigue con el PNG `invert+screen` de CowLogo (validado por el usuario
como estética noche, no se reemplaza).

| Token | Valor | Nota |
|---|---|---|
| `--paper` | `#1d1a14` | |
| `--paper-2` | `#26211a` | |
| `--paper-3` | `#2f2920` | |
| `--ink` | `#EDE5D3` | |
| `--ink-2` | `#c0b49e` | |
| `--ink-3` | `#B2A995` | s97: era `#756D5D` (ilegible). Gobierna toda la letra fina; blanco cálido ~7:1, por debajo de `--ink-2` para mantener jerarquía |
| `--line` | `#4d4536` | s97: era `#3d362b` |
| `--line-2` | `#5f5544` | s97: era `#4a4238` |
| `--focus` | `#7A9A6D` |
| `--focus-2` | `#98B58B` |
| `--focus-soft` | `rgba(122,154,109,0.12)` |
| `--focus-cta` | `#8E9D88` |
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
| `[data-font="cormorant"]` | `--font-display` | `'Cormorant Garamond', Georgia, serif' |
| `[data-font="mono"]` | `--font-display`, `--font-ui` | `'JetBrains Mono', ui-monospace, monospace' |

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

**Respeto a `prefers-reduced-motion` (recalibrado s89):** el kill global
exime los subtrees marcados con `data-pace-essential` — hoy, los 5 wrappers
de `BreathVisual`. La expansión del círculo ES la guía de respiración
(WCAG 2.3.3: motion esencial a la funcionalidad); todo lo decorativo
(fades, slide-ups, pulsos, anillo del timer) sí se congela. `tokens.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *:not([data-pace-essential], [data-pace-essential] *),
  *:not([data-pace-essential], [data-pace-essential] *)::before,
  *:not([data-pace-essential], [data-pace-essential] *)::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Si un componente futuro tiene motion funcional (no decorativo), marcarlo
con el mismo atributo en su wrapper.

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
- **Firefox (s99):** `html { scrollbar-width: thin; scrollbar-color: var(--line) transparent; }` — antes Firefox caía al scrollbar por defecto. Mismos tokens, un solo sitio.

---

## Microinteracciones y keyframes (s99-s100 · v0.44.0-v0.45.0)

Bloque en `app/tokens.css` (config global de interacción, no `<style>` nuevo).
Todo es **decorativo** → el kill global de `prefers-reduced-motion` lo neutraliza
(ninguno cuelga de `data-pace-essential`). Patrón s22: `!important` solo para
ganar a estilos inline.

**Keyframes:**
- `pace-module-in` — fade + rise; entrada de `[data-pace-main-content]`.
- `pace-modal-in` — scale (0.96→1) + fade; card de modal (`Primitives.Modal`).
- `pace-dial-glow` — halo que respira detrás del aro del Pomodoro cuando corre
  (`[data-pace-dial-running]::after`, color `--focus-soft`).
- `pace-reveal-rise` — entrada escalonada de hijos directos de `[data-pace-reveal]`
  (nth-child con delays 0–490ms). Usado por TransitionCards y CompletionScreen.
- `pace-sendero-pulse` — anillo pulsante del hito ACTUAL del SenderoBar
  (`.sendero-pulse-ring`, `transform-box: fill-box` → escala sobre su centro).
- `pace-sendero-draw` + `pace-sendero-dot-in` (s100) — **draw-in ceremonial**
  del SenderoBar con la prop `drawIn` (solo la usa CompletionScreen): el trazo
  done se dibuja de izquierda a derecha (`pathLength=1` normaliza el compound
  path; solo se pone con `drawIn` para no romper el punteado pending) y los
  hitos (`g` del SVG) + `hito-label` entran escalonados con delays nth 1–7
  (250ms + 160ms/paso). CSS puro → reduced-motion salta al estado final.

**Ganchos `data-pace-*` añadidos:** `-cta`, `-dial-running`, `-reveal`,
`-plib-row`, `-path-btn`. Los botones del Foco fijan `--pfbtn` (color de relleno
en hover, uno por botón: verde/naranja/gris).

### Atmósfera por paso (Caminos)
`SessionShell` acepta `atmosphere` (token `*-soft` del módulo del paso). El helper
`sessionAtmosphere(soft)` (en `app/ui/SessionShell.jsx`, expuesto a window) devuelve
un `radial-gradient` **doble capa** muy tenue concentrado arriba y desvanecido a
`paper`. Solo se aplica dentro de Caminos (Respira terracota / Foco verde / Cuerpo
tan / Agua azul). **Banding resuelto (s100):** la rampa lineal de 2 stops con
alphas ~0.10 producía anillos de cuantización de 8 bits (peor en oscuro) → hint
de interpolación al 22% (caída ease-out) + **capa de grano SVG** casi invisible
(feTurbulence desaturado, `opacity` 0.04, tile 160px, data-URI inline) como
dither. El grano lee como fibra de papel. Regla: si un wash futuro banda, mismo
remedio — no subir los alphas de los tokens `*-soft`.

### Timer — variante `ticks`
`TimerDial` con prop `ticks` renderiza 60 marcas radiales tipo reloj (cada 5 mayor)
que se encienden con el color del aro según `progress`, + número protagonista
(`numberHugeTicks`, `clamp(78px, 9vw, 128px)`). El Foco de Camino la usa; el home
mantiene el aro clásico con arco + punto guía.

### Escena ilustrada de Caminos (s104 · v0.49.0 · arte D-4)

`PathIllustration` monta la lámina del Camino como escena cover FULL-BLEED
**solo en el runner** (IntroCard/StepIntro/CompletionScreen; las sesiones
activas no llevan arte). Bloque `[data-pace-path-scene]` en `tokens.css`:

- **Casquetes**: las bolas pintadas del arte van SIEMPRE cubiertas en gris
  (`--line` con borde `--line-2`); al completarse se RELLENAN con el color
  de su actividad (`--breathe`/`--focus`/`--move`/`--hydrate` según el
  `kind` real del paso) — pop `pace-scene-fill` + eco `scene-echo-ring`
  (una onda, `pace-sendero-pulse` a 1 iteración). Hito actual:
  `scene-pulse-ring` (latido infinito) en el color de la actividad que toca.
- **Cámara**: encuadre cover centrado en el hito actual (clamp a los bordes
  del arte); pan de 2 s (`--ease`) acompañando el avance en StepIntro; la
  Completion encuadra el `finish` de la lámina (el final del camino).
- **Tipografía sobre arte**: título + tagline arriba (franja del cielo) con
  halo de papel (`textShadow` triple con `--paper`); etiqueta del paso
  (nombre display + numeral romano) en **placa mini** del papel DEL ARTE
  (rgba del `paper` medido + hairline + blur 3px), anclada bajo la bola.
  En la Completion, RECORRIDO/DESBLOQUEADO van sobre placa translúcida
  (`rgba(242,237,224,0.82)` + blur 5px + hairline + `--r-lg`).
- **Reduced-motion**: todo decorativo → el kill global congela pulso, pop,
  eco y pan.

**Regla "sobre el arte siempre es de día":** el arte es papel claro FIJO.
En `[data-palette="oscuro"]`, el selector `[data-pace-scene-card]` re-mapea
`--ink*`, `--paper*`, `--line*` **y los acentos de actividad** a los valores
de la paleta crema dentro de las superficies ilustradas. Son **copias
literales** de la paleta día: si se recalibra la crema, actualizar también
ese bloque (mismo aviso que las copias inline de safety/privacy.html).

**Metadatos por lámina** (`app/paths/illustrations/paths.index.js`): `dots`
{x,y,r,color} medidos por escaneo (`scripts/ingest-lamina.js`, modo híbrido),
`paper` del cielo, `focusY` (franja del sendero) y `finish` (encuadre final).
El arte se mide UNA vez, cuando es definitivo.

---

## Z-index layers

TODO: documentar capas de z-index (sidebar, toasts, modales). Pendiente de extraer de los JSX en tarea separada.
