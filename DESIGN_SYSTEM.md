# PACE · Design System

> Fuente de verdad para tokens visuales. Si cambias algo aquí, refléjalo también en `app/tokens.css`.

---

## 🎨 Paletas

### Paleta por defecto: **Crema día** (basada en capturas)

| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#F2EDE0` | Fondo principal (crema cálido) |
| `--paper-2` | `#EAE4D4` | Superficies secundarias, sidebar |
| `--paper-3` | `#DFD8C4` | Hover, bordes suaves |
| `--ink` | `#1F1C17` | Texto principal (negro tinta) |
| `--ink-2` | `#4A453C` | Texto secundario |
| `--ink-3` | `#8A8372` | Texto terciario, metadatos |
| `--line` | `#C9C0A8` | Bordes finos |
| `--focus` | `#3E5A3A` | Verde oliva — módulo Foco |
| `--focus-2` | `#2A3E27` | Verde oscuro — estados hover |
| `--breathe` | `#C97A5D` | Terracota — módulo Respira |
| `--breathe-2` | `#A85E43` | Terracota oscuro |
| `--move` | `#9A7B4F` | Ocre — módulo Mueve |
| `--extra` | `#6B7A8F` | Azul piedra — módulo Extra |
| `--hydrate` | `#5F8A9B` | Azul agua — módulo Hidrátate |
| `--achievement` | `#B8934A` | Dorado apagado — logros |

### Paleta **Oscuro noche**

| Token | Hex |
|---|---|
| `--paper` | `#1A1814` |
| `--paper-2` | `#252119` |
| `--paper-3` | `#302B21` |
| `--ink` | `#EDE5D3` |
| `--ink-2` | `#B8AF9A` |
| `--ink-3` | `#756D5D` |
| `--line` | `#3C3628` |
| `--focus` | `#7A9A6D` |
| `--breathe` | `#D99477` |

### Paleta **Papel envejecido**

Versión de crema día con tintes más cálidos y amarillentos. Acentos más apagados. Ideal para modo "ritual".

| Token | Hex |
|---|---|
| `--paper` | `#EDE2C8` |
| `--paper-2` | `#E3D6B6` |
| `--ink` | `#2B241A` |
| `--focus` | `#56663E` |
| `--breathe` | `#B86A4D` |

---

## ✍️ Tipografía

### Display (títulos, cifras del timer, secciones)
- **"EB Garamond"** (primaria, Google Fonts) — italic para títulos de sección ("Respira", "Movilidad"), regular para números grandes del Pomodoro.
- Fallback: `"Cormorant Garamond", Georgia, serif`

### UI (etiquetas, botones, estados, body)
- **"Inter Tight"** en peso 400-500 — limpio, geométrico
  - *Alternativa explorada en tweaks: "JetBrains Mono" para estética editorial-código*
- Fallback: `system-ui, -apple-system, sans-serif`

### Metadatos / tags
- **Mayúsculas**, `letter-spacing: 0.14em`, tamaño `11px`-`12px`. Ejemplo: `BIBLIOTECA`, `ANTES DE EMPEZAR`, `RONDAS`.

### Escala
```css
--size-hero:   clamp(96px, 12vw, 160px);  /* tiempo pomodoro */
--size-h1:     40px;   /* títulos de sección */
--size-h2:     28px;
--size-h3:     20px;
--size-body:   15px;
--size-sm:     13px;
--size-meta:   11px;  /* mayúsculas con tracking */
--lh-tight:    1.1;
--lh-normal:   1.45;
--lh-relaxed:  1.65;
```

---

## 📐 Espaciado

```css
--s-1: 4px;
--s-2: 8px;
--s-3: 12px;
--s-4: 16px;
--s-5: 24px;
--s-6: 32px;
--s-7: 48px;
--s-8: 64px;
--s-9: 96px;
```

---

## 🔲 Bordes + sombras

```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-pill: 999px;

--border-fine: 1px solid var(--line);
--border-strong: 1px solid var(--ink-2);

--shadow-soft: 0 1px 2px rgba(31, 28, 23, 0.06), 0 4px 16px rgba(31, 28, 23, 0.04);
--shadow-modal: 0 8px 40px rgba(31, 28, 23, 0.18);
```

---

## 🏷️ Tags de categoría (pill con border)

Patrón usado en la biblioteca. Border fino del color del módulo, texto mayúsculas.

```
[  SIT  ]   [  HIP  ]   [  SHLD  ]   [  ATG  ]   [  ANC  ]
```

Códigos:
- `SIT` — Antídoto silla (movilidad general)
- `HIP` — Caderas
- `SHLD` — Hombros
- `ATG` — Rodillas ATG
- `ANC` — Ancestral (full body)
- `ENE` — Energía (respiración)
- `BAL` — Balance (coherencia)
- `EQU` — Equilibrio (box)
- `REL` — Relajación
- `PRA` — Pranayama
- `KRI` — Kriya

---

## 🐄 Logo · 3 interpretaciones

1. **Lineal minimalista** — 1 trazo continuo, vaca de perfil pastando. Elegante, funciona en favicon.
2. **Sello tipo café** — círculo con la vaca + texto "PACE · FOCO · CUERPO · EST. 2025" alrededor. Estampado, con textura.
3. **Ilustrado** — vaca más detallada, con el campo, estilo libreta de campo naturalista (acuarela ligera).

El default será el **lineal** (más versátil). El sello aparece en la pantalla de logros. El ilustrado en splash/about.

---

## 🎛️ Ejes de Tweaks (6)

| Tweak | Opciones |
|---|---|
| **Layout** | `sidebar` (default, como capturas) · `minimal` (solo timer centrado) · `editorial` (formato revista) |
| **Paleta** | `crema` (default) · `oscuro` · `envejecido` |
| **Tipografía** | `garamond` (default) · `cormorant` · `mono` (JetBrains) |
| **Timer** | `numero` (default) · `circulo` · `barra` · `analogico` |
| **Círculo respiración** | `pulso` (default) · `ondas` · `petalo` · `organico` |
| **Logo** | `lineal` (default) · `sello` · `ilustrado` |

---

## 🖼️ Componentes clave

### `<Card>` — tarjeta de biblioteca
Fondo `paper`, borde `line` 1px, radius `md`, padding `s-5`. Header con tag + título serif italic + meta.

### `<Modal>` — diálogo
Fondo `paper`, radius `lg`, shadow `modal`, padding `s-6`, max-width 640px. Backdrop `rgba(31,28,23,0.35)`.

### `<Button>`
- **Primary:** fondo `focus`, texto `paper`, radius `md`, height 44px, peso 500.
- **Secondary:** fondo transparente, border `line`, texto `ink`.
- **Ghost:** solo texto con underline al hover.

### `<Tag>`
Pill con border del color del módulo. Text `meta` mayúsculas.

### `<BreathCircle>`
SVG con 3 círculos concéntricos. El central se escala con `transform: scale()` sincronizado al fase (inhala: scale 1 → 1.4; sostén: mantiene; exhala: 1.4 → 1).

---

## 📏 Estados + accesibilidad

- **Focus visible:** outline 2px `focus` con offset 2px.
- **Hit targets:** mínimo 44px altura en móviles; 36px ok en desktop.
- **Contraste:** texto normal ≥ 4.5:1. Verificado en crema y oscuro.
- **Animaciones:** respeta `prefers-reduced-motion` (círculo respira se convierte en cambios de color en lugar de escala).
