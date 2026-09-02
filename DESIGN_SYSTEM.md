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
| `--sun-dawn-core` / `-body` | `rgba(234,172,182,0.50)` / `rgba(136,152,200,0.42)` | **Las horas del sol** (s158/s159), la luz de la home. Tono PROPIO — no se reutilizan `--breathe` ni `--move`, que son colores de MÓDULO y harían leer la home como si señalara una actividad. **Amanecer**: azul frío con el núcleo rosa |
| `--sun-noon-core` / `-body` | `rgba(252,218,158,0.70)` / `rgba(226,170,96,0.62)` | **Mediodía**, el pico. En la paleta clara el núcleo es cálido y saturado, **no blanco**: sobre papel crema no se puede ser más luminoso que el papel, y lo que lee como luz es la temperatura |
| `--sun-dusk-core` / `-body` | `rgba(240,162,110,0.58)` / `rgba(182,104,80,0.46)` | **Atardecer**: ámbar sobre terracota |
| `--sun-night-core` / `-body` | `rgba(136,156,200,0.48)` / `rgba(74,96,142,0.45)` | **Noche**: azul profundo, núcleo plata. **No es el frío del amanecer** — aquel lleva rosa; por eso son dos paradas y no una reutilizada |
| `--sun-rim` | `rgba(118,136,174,0.55)` | **El borde frío**: el aire dispersa el azul, así que la luz se enfría en su último tramo. La luz se MEZCLA hacia este tono, así que al anochecer la mezcla no hace nada — que es lo correcto |
| `--sun-shade` | `rgba(84,82,72,0.13)` | **La sombra del sol**, solo en la paleta clara: la única forma de que lo iluminado lea como iluminado sobre papel crema es **restar donde no llega el sol**. Vive DENTRO de la caída de la luz, así que muere donde ella y no puede tocar ningún borde |
| `--sun-cast` | `rgba(58,54,44,0.10)` | La sombra que la luz **proyecta** sobre los chips. Fría a propósito —una sombra es ausencia de luz cálida, no luz de otro color— y muy baja: a 0,18 leía como sombra dibujada (s159) |
| `--sun-top` | `0.72` | Cuánta luz llega **arriba**. Sobre el aro solo hay ~59 px hasta los chips; la caída cruza los 536 px de la caja del limbo, o sea un 0,05 % por píxel: atenúa sin dejar frontera |
| `--sun-pausa` | `0.35` | Cuánto se recoge la luz al **pausar**. Valor por PALETA: sobre papel claro la misma recogida se percibe menos, así que en oscuro es 0,45 |
| `--breathe` | `#C97A5D` | Acento Respira |
| `--breathe-2` | `#A85E43` | Acento Respira oscuro |
| `--breathe-soft` | `rgba(201,122,93,0.12)` | Fondos sutiles Respira |
| `--move` | `#9A7B4F` | Acento Mueve |
| `--move-soft` | `rgba(154,123,79,0.12)` | Fondos sutiles Mueve |
| `--extra` | `#6B7A8F` | Acento Extra |
| `--extra-soft` | `rgba(107,122,143,0.12)` | Fondos sutiles Extra |
| `--hydrate` | `#5F8A9B` | Acento Hidrátate · **y desde s168 la familia de logros «La jornada»**, que heredo el token al disolverse «estadisticas». Es **el unico frio de la paleta tierra** y ha pasado del final del panel de Logros (4 sellos) a su mitad (9): decision visual abierta en `HANDOFF_s168.md` |
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
| `--sun-dawn-core` / `-body` | `rgba(233,186,188,0.24)` / `rgba(150,168,208,0.22)` | **Las horas del sol en oscuro** (s158/s159). Los tonos SUBEN de valor: un azul profundo de paleta clara sobre `#1d1a14` seria un agujero negro, no una luz |
| `--sun-noon-core` / `-body` | `rgba(255,248,226,0.30)` / `rgba(238,192,124,0.26)` | Mediodia. Aqui la regla «el nucleo mas palido que el cuerpo» SI funciona y se conserva |
| `--sun-dusk-core` / `-body` | `rgba(240,178,126,0.25)` / `rgba(204,124,90,0.23)` | Atardecer |
| `--sun-night-core` / `-body` | `rgba(180,194,222,0.31)` / `rgba(124,148,192,0.34)` | Noche: azules CLAROS con alfa baja — **luz de luna, no ausencia de luz**. Es el unico momento del ciclo cuya luz subio respecto a la version anterior: con 0,23 el final se quedaba en un aro verde flotando sobre fondo plano |
| `--sun-rim` | `rgba(150,172,208,0.50)` | El borde frio |
| `--sun-shade` | `rgba(0,0,0,0)` | **Cero A PROPOSITO, no por olvido**: aqui el contraste ya lo da el papel, y restar sobre `#1d1a14` solo abriria agujeros negros alrededor del aro |
| `--sun-cast` | `rgba(0,0,0,0)` | Tambien cero: sobre papel oscuro un chip no puede proyectar mas oscuridad de la que ya hay. Lo que lo despega es el **filo**, que si funciona en las dos paletas |
| `--sun-top` | `0.80` | Se atenua menos que en claro: el papel absorbe y la luz superior no molesta igual |
| `--sun-pausa` | `0.45` | La recogida al pausar. Aqui la luz si trabaja por brillo y 0,45 basta para que la sesion quede recogida sin parecer terminada |

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
| `--font-display` | `'EB Garamond', 'Cormorant Garamond', Georgia, serif` | Títulos italic (base; el default `data-font="cormorant"` la sobrescribe a Cormorant) |
| `--font-ui` | `'Inter Tight', system-ui, -apple-system, sans-serif` | UI, texto descriptivo |
| `--font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Devtools, secretos (JetBrains **ya no se carga** → cae a `ui-monospace`) |

> **Self-hosted desde s105 (v0.50.0).** Las fuentes ya no vienen del `@import`
> de Google — copia LOCAL subset **latin** en `fonts/` (`@font-face` en
> `tokens.css`, ruta absoluta `/fonts/…woff2`, `font-display:swap`,
> `unicode-range` latin). Familias hospedadas: **Cormorant Garamond**
> (400/500 romana+itálica), **EB Garamond** (400/500 romana+itálica; el **600
> NO se hospeda**, no lo usa nadie), **Inter Tight** (300/400/500/600).
> **JetBrains Mono retirada** (cae a `ui-monospace`). Web = archivos
> `/fonts/*` + precache `sw.js`; standalone = data URIs (`inlineFonts` del
> build). Cero peticiones a `fonts.googleapis`/`gstatic`. **La identidad real
> de títulos es Cormorant** (default `font:'cormorant'`), no EB Garamond — ver
> nota de tweaks abajo. Si se añade una fuente/peso: `@font-face` en
> `tokens.css` + precache en `sw.js` (el build la inlinea sola).

**Nota:** las cifras de identidad (`MM:SS` del timer, `0` de racha) están blindadas a `'EB Garamond', Georgia, serif` directamente en el JSX (sesión 20). No pasan por `--font-display`. (El `MM:SS` del `TimerDial` compartido sí usa `var(--font-display)` = Cormorant; el blindaje EB Garamond aplica a la racha del sidebar y a los steps de Camino.)

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

Nota: `[data-font="cormorant"]` es el **default** (`defaultState.font='cormorant'`
en `state-core.jsx`) — la identidad de títulos de PACE es Cormorant, no la base
EB Garamond. No es un tweak huérfano (s105 preservó Cormorant self-hosted).
`[data-font="mono"]` sobrescribe display y UI a monoespaciada; como JetBrains
Mono ya no se carga (s105), cae a `ui-monospace` (mono del sistema). Ambos son
ejes dormidos (sin control en la UI de Ajustes desde s20).

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

### La sidebar se escala entera para caber (s181 · v0.113.0)

**Decisión del usuario:** la sidebar tiene que verse **igual en cualquier
resolución**; si no cabe, encogen **todos** sus elementos a la vez. Lo que se
conserva no es un tamaño en píxeles, es la **composición**.

- **Qué NO se hace:** apretar el aire. Se probó —la columna bajaba de 835,9 a
  700,3 px sin quitar ninguna sección— y se rechazó mirándolo: apretar el aire
  cambia las **proporciones** (las reglas encogen y el texto no).
- **Cómo:** `[data-pace-sidebar-escala]` con `transform: scale(var(--sb-escala))`,
  `transform-origin: top left`, y `width` / `min-height` a
  `calc(100% / var(--sb-escala))`. Los dos `calc` son obligatorios: **una
  transformación no cambia la caja de layout**, así que la caja sin escalar tiene
  que medir lo disponible **dividido entre** el factor.
- **La lente:** por eso mismo la envoltura desborda en layout (52 px de ancho
  medidos), y ese desborde muere en `[data-pace-sidebar-lente]`, que sólo recorta
  cuando hay escala de verdad (`[data-escalado="1"]`). Sin ella el `<aside>`
  declara scroll lateral.
- **Nunca agranda.** Por encima del tamaño natural la escala vale 1 y el sobrante
  va al espaciador, que es la **geometría fija** de v0.112.0.

| alto de ventana | escala | el pie termina a |
|---|---|---|
| 1000 | 1 | 18 px del borde |
| 800 | 0,926 | 18 px |
| 714 | 0,822 | 18 px |
| 620 | 0,708 | 18 px |

#### En el cajón de móvil también, con suelo (s182 · v0.114.0)

Hasta v0.113.0 esto se apagaba por debajo de 768 px a propósito. **Se anula esa
decisión**, porque el cajón natural mide **771 px** y ninguna pantalla de móvil
corta los tiene: hasta 428×800 el pie quedaba **1,4 px por debajo del borde**.
Palabras del usuario: *«escalarla en todas las resoluciones que quede bien y en
las más pequeñas aceptamos un pequeño scroll sin barra»*.

- **El suelo es `SUELO_CAJON = 0,80`** (`app/shell/Sidebar.escala.jsx`). Por
  encima de ese factor la pantalla cabe entera; por debajo la columna se queda a
  ese tamaño y **se desplaza, con la barra oculta**.
- **Por qué 0,80:** el bloque de la semana —el objetivo táctil que s180 afinó a
  45 px— se queda en **36**, holgado sobre el mínimo de WCAG 2.2 AA (24), y hace
  caber entero **375×667**, el iPhone SE / 8. Con 0,85 aún se salían 38 px.
- **Se desplaza, NO se recorta.** La lente lleva `overflow: hidden`, así que su
  alto tiene que ser exactamente el que la columna escalada ocupa. Ese número no
  se puede calcular en CSS —el cajón tiene `height: auto` y la lente se
  dimensiona al contenido— así que lo escribe `Sidebar.escala.jsx` en
  `--sb-alto` y la hoja sólo lo consume.
- **La barra se oculta y el scroll se conserva** (`scrollbar-width: none` +
  `::-webkit-scrollbar`), mismo patrón que el centro de sesión. `overflow:
  hidden` haría lo primero matando lo segundo.

| viewport | escala | fuera de pantalla | el texto de 11 px se ve a |
|---|---|---|---|
| 360 × 560 | **0,80** (suelo) | 101 px | 8,8 px |
| 360 × 640 | **0,80** (suelo) | 21 px (sólo el padding) | 8,8 px |
| 375 × 667 | 0,809 | **0** | 8,9 px |
| 390 × 736 | 0,898 | **0** | 9,9 px |
| 428 × 800 | 0,981 | **0** | 10,8 px |
| 375 × 844 | 1 | **0** | 11 px |

**Y de regalo, el aire de la tarjeta «Para ahora» se recorta SÓLO en el cajón**
(`padding-bottom` 16 → 8): bajo su última línea había 28 px y quedan 20. En
escritorio ese aire se afinó mirándolo en s180 y **no se toca**, así que la regla
vive en la hoja y no en `sidebarStyles.accion`, que comparten las dos pieles.

**El precio, que se acepta con los ojos abiertos:** los objetivos táctiles
encogen con todo lo demás. El bloque de la semana pasa de 45 px a **37,1** a
1280×720 — sobre el mínimo de WCAG 2.2 AA (24×24) pero por debajo de los 44 que
s180 buscó a propósito. **El chevron de colapsar queda FUERA de la escala** a
propósito: es un control, no contenido, y s180 lo fijó en 24 px por ese mismo
criterio.

---

### Home Desktop ≥769px — composición proporcional y horizonte (s126 · v0.69.0)

> **Ámbito.** Este bloque rige **solo en Desktop (≥769px)** y **sustituye ahí** al modelo
> «atardecer» de s123 descrito justo debajo. En **móvil/tablet (≤768px) manda s123**, sin
> cambios: el ayudante borra sus variables fuera de Desktop y el CSS entero vive bajo la
> misma media query.

El aro sigue siendo el **sol**, pero en Desktop el **horizonte** es la fila de Actividades,
y el aro se **recorta** en esa línea en lugar de quedar dibujado entero por detrás.

**Fuente única de geometría:** `app/main/home-geometry.js` mide y publica en `:root`

- `--pace-timer-d` → diámetro D del aro
- `--pace-activities-overlap` → solapamiento **y** recorte (mismo valor, una sola fuente)

**Tamaño del aro (D lo manda la ALTURA):** arranca en `min(0.42·W, 520px)` y **encoge hasta
caber** (`overflowV ≤ 1`, 8 pasadas, suelo 205px) ⇒ D es el mayor círculo sin scroll.
Dimensionarlo por ancho confundía causa con efecto: en la referencia v0.64 la proporción
0.255·W era CONSECUENCIA de la altura (`flex:1 + 56vh`).

**Interior proporcional a D:** rótulo, número, descriptor y separador escalan con
`clamp(min, calc(var(--pace-timer-d) * k), max)` sobre los hooks `data-pace-dial-*`. El CTA
conserva su suelo de **44×44 px** (a11y) — es el motivo de que el interior no pueda ser
100 % proporcional.

**Solapamiento = 16 % nominal de D**, aceptación **0.14–0.17**:
`overlap = min(round(0.16·D), dialBottom − cicloBottom − 4px)`. El segundo término es un
**techo de seguridad**: el horizonte nunca sube por encima de los puntos de CICLO.

**Horizonte (recorte del aro):**
```css
[data-pace-dial-fit] {
  -webkit-clip-path: inset(0 0 var(--pace-activities-overlap, 0px) 0);
  clip-path: inset(0 0 var(--pace-activities-overlap, 0px) 0);
}
```
- Se recorta el **MARCO, no el `<svg>`**: el svg lleva `rotate(-90deg)` inline y `clip-path`
  rota con el elemento (un inset inferior le cortaría el lado izquierdo en pantalla).
  Recortar el marco cubre además el halo `[data-pace-dial-running]::after`.
- El **contenido no se recorta por construcción**: la línea nace del bottom del CICLO,
  último hijo del interior, y se mueve con él (idioma, alto del CTA, descriptor).
- `clip-path` es puramente visual ⇒ **cero impacto en layout**.
- Consecuencia asumida: en marcha, arco de progreso y punto guía quedan bajo el horizonte
  (~94° de aro). Decisión explícita (corte duro), igual que en v0.64.

**Compactación en alturas cortas — `--pace-home-squeeze` (0→1).** Por debajo de ~672px de
alto el 16 % no cabe (interior con ~72px fijos ⇒ haría falta D ≥ 413). La única salida sin
tocar contenido ni accesibilidad es recuperar presupuesto vertical EXTERIOR, y eso hace el
squeeze, que el ayudante calcula **progresivamente, no por breakpoint**:

```js
sq = clamp(0, (700 - innerHeight) / (700 - 610), 1)
```

- **≥700px ⇒ sq = 0**: compactación CERO, nada cambia respecto a un viewport alto.
- **610px ⇒ sq = 1**: ~66px liberados, que van **íntegros al diámetro del aro**.

El CSS interpola cada hueco con `calc(base - delta * var(--pace-home-squeeze, 0))`:

| Propiedad | Base | A sq=1 |
|---|---:|---:|
| `[data-pace-topbar]` padding vertical | 14 | 6 |
| `[data-pace-topbar]` **min-height** | 56 | 48 |
| `[data-pace-home-body] [data-pace-main-content]` padding-top | 10 | 2 |
| raíz de FocusTimer: padding-top / `gap` | 8 / 14 | 4 / 6 |
| `[data-pace-activitybar]` padding sup. / inf. | 6 / 20 | 4 / 6 |
| `[data-pace-spc-card]` padding vertical | 14 | 10 |
| `[data-pace-spc]` padding-bottom + enlace | 4 + 2 | 0 + 0 |

**El `min-height` del TopBar es el que manda**: bajar solo su padding no gana nada (suelo de
56px con ~45px de contenido). 48px es el mismo suelo que ya usa el tier móvil.

**Excepción de s169 — la banda donde la pill tiene fila propia.** En
`(min-width: 390px) and (max-width: 768px) and (min-height: 760px)` la topbar suma
**+42 px** a su `padding-top` (34 de pill + 8 de hueco) y alinea a `flex-end`, de modo
que Foco/Pausa/Larga va **arriba** y los iconos debajo. Esos 42 px **salen del aro**, y
por eso el suelo de alto es 760 y no menos: a 736 el aro paga 4 px a 412, 20 a 428 y 30
a 440, y a 760 es gratis en todos los anchos (medido A/B en el mismo viewport). El suelo
de **ancho** no lo pone el aro sino el botón «Abrir panel», que vive **fuera** de la
topbar: la pill mide 244 px fijos y va centrada, así que a 320 lo pisa 15 px y a 390 deja
20. Ojo al tocar esta banda: `--pace-home-squeeze` **ya vale 0 desde 736**, así que no
sirve para distinguirla.

**Solo se toca AIRE**: ningún texto, tamaño de fuente ni glifo cambia, y el CTA conserva su
suelo de 44px. Efecto a 1366×610 (1366×768 con el chrome del navegador): el aro pasa de 256
a 349 y el solapamiento de 0.078 a 0.143.

**Ámbito.** `[data-pace-main-content]` y los bloques de Actividades/Camino cuelgan de
`[data-pace-home-body]` → confinados por selector. **El TopBar no se puede confinar así**:
`[data-pace-home-body]` se renderiza SIEMPRE (los módulos abren como overlay encima, no lo
desmontan), así que `:has([data-pace-home-body])` matchearía siempre. Selector plano y
confinamiento **de facto**: los overlays lo tapan con `[data-pace-modal-backdrop]`.

**Límite residual:** 1280×600 y 1024×600 quedan en 0.137 (3 milésimas bajo el suelo) y las
alturas ≤512px muy por debajo. Ver `docs/product/AUDITORIA_SISTEMA_PACE.md` §32.6.

**Trampa de mantenimiento:** el CSS de `_responsive.js` vive en un **template literal JS** ⇒
**prohibidos los backticks en los comentarios** (rompen el build con «';' expected»).

---

### La luz del Pomodoro (s159 · v0.90.0 — REEMPLAZA el amanecer de s156)

**El aro no TIENE una atmosfera: el aro ES una fuente de luz**, y la home lleva
superficies que la reflejan mientras hay sesion. Con el Pomodoro parado la home
queda **limpia** — no «fria y tenue»: nada.

**Dos capas, y las dos beben de los mismos tokens.** **LIMBO**
(`[data-pace-sun]::before`): corona corta de 1,32 D que abraza el aro en los 360°,
atenuada arriba por `--sun-top` porque sobre el aro solo hay ~59 px hasta los chips.
**BLOOM** (`::after`): derrame de 2,2 × 1,42 D, direccional hacia abajo, con la luz
muriendo a 0,84 D. Alcance largo **solo donde hay sitio**. Ninguna de las dos
desborda el contenedor de scroll: **quien decide donde acaba la luz es el
degradado**, nunca el borde de una caja.

**Cuatro horas del dia, interpoladas en OKLAB**: amanecer (0) → mediodia (0,38) →
atardecer (0,72) → noche (1). **El frio del amanecer NO es el frio de la noche** —el
primero es azul con un punto rosa, el segundo azul profundo—, por eso son dos
paradas y no una reutilizada. Cada hora son **dos** colores: `core` pegado al aro y
`body` hacia fuera.

**Cinco mandos, ninguno hace el trabajo de otro** (los publica `FocusTimer` en
`[data-pace-home-body]`): `--pace-k` la hora · `--pace-i` la envolvente · `--pace-on`
el interruptor (fundido 1,6 s) · `--pace-pausado` la pausa (fundido 500 ms) ·
`--pace-arco` el tono del recorrido, que **tiñe la cola**: bajo el horizonte no hay
tiempo, hay luz. **El estado nunca se comunica solo con la luz**: el numero, el CTA
y «Reiniciar bloque» ya lo dicen.

**El recorrido respira desde la mitad.** El maximo perceptual —presencia y calor—
cae en **p=0,50**, con una meseta muy tendida entre 45 y 55 % que **sale de la
curva** (pendiente cero en el pico) en vez de ser un tramo plano. La bajada usa otra
curva que **llega al final descendiendo**, para que el residuo frio sea residuo y no
un repunte.

**Al calibrar, dos cosas que no son intuitivas.** Sobre **papel claro** la luz no es
mas brillo: es mas **calor** —el papel ya es casi tan claro como cualquier nucleo—,
asi que en la paleta crema los nucleos son tonos calidos saturados y no blancos, y
hay una **sombra** (`--sun-shade`) porque la unica forma de que lo iluminado lea como
iluminado es **restar donde no llega el sol**. Y la **saturacion del halo se mantiene
por debajo de la del arco**: el arco es informacion y el halo ambiente; cuando se
igualaron, el halo se leia como una ampliacion del arco.

Lo que sigue vale igual para esta version:

**Fuente unica de la geometria.** Todo lo que dependa del diametro o del horizonte
consume `--pace-dial-d` y `--pace-horizon`, definidas **solo** en `_responsive.js`
sobre `[data-pace-home-body]`. Ahi, y solo ahi, se decide si manda el motor
(`home-geometry.js`) o el fallback CSS. **No se escriben fallbacks en el punto de
consumo**: cuando cada consumidor traia el suyo, con el motor apagado la tarjeta
subia sobre un aro sin recortar (s156).

**La luz vive FUERA del elemento recortado** (s158, corrige a s156): en
`[data-pace-sun]`, hermano del aro y sin `clip-path`. Metida dentro, el recorte la
cortaba con una arista recta de 54-68 unidades en 1 px — lo que se leyo como «limite
tecnico». z-index 0; el interior del dial va en 1.

**No se inventa curva de luz.** El degradado sale de `paceGlowRamp()` y el grano de
`paceGrainUrl()`, ambos en `app/ui/SessionShell.jsx` — la fuente canonica desde
s140. `_responsive.js` los invoca al inyectar la hoja y hornea el resultado.
Duplicar las paradas en CSS crearia una segunda curva que divergiria a la primera
correccion. **El grano no es decoracion**: sobre papel plano un degradado de esta
amplitud bandea, y va enmascarado con la MISMA caida que la luz.

**Las transiciones son decorativas** y no cuelgan de `data-pace-essential`, asi que
el kill de `prefers-reduced-motion` las neutraliza. **Y ninguna puede perseguir a
otra**: un efecto que cuelgue de la luz no puede vivir en un elemento que ya tenga
`transition` propia — los chips llevan una de 0,22 s inline para su hover, y por eso
la sombra proyectada se declara en el **grid**, no en el chip.

**Reparto del sobrante en movil.** En telefonos el aro topa por ANCHO y sobra alto
por construccion. `--pace-home-slack` lleva el sobrante REAL medido y el CSS lo
reparte **38/62** en vez de centrarlo: masa alta y suelo bajo, que es la lectura de
un amanecer. Con sobrante 0 degrada al centrado de siempre.

---

### Modelo «atardecer» de la home (s123 · v0.66.0 — REEMPLAZA el «sol» provisional de s122)

> **Vigente en ≤768px.** En Desktop lo sustituye el bloque de s126 de arriba.

El aro del timer es el **sol**; la tarjeta de Camino sugerido es el **horizonte** que
cruza su arco INFERIOR. s123 sustituyó el patrón `transform` + gate binario de s122 (que
apagaba el solapamiento en pantallas bajas y dejaba un hueco, y cuyo swap por `order`
rompía la jerarquía) por una geometría **estructural, proporcional y sin gate**. Es la
implementación de la parte §0 sensible a la altura.

**Jerarquía invariante:** Timer → Camino → Actividades = **el orden del DOM, en todo viewport**.
Eso no cambia: el DOM es uno solo y esa es su jerarquía.

**Prohibido `order` en ≤768px** para intercambiar secciones — *acotado en s149; s123 lo escribió
como «bajo ningún breakpoint», y eso ya no es cierto*. En **Desktop (≥769px) s126 SÍ reordena
visualmente**: `[data-pace-activitybar] { order: 1 }` y `[data-pace-spc] { order: 2 }`
(`app/main/_responsive.js:254-263`), de modo que las Actividades van tras el aro y el Camino al
fondo. Es **deliberado y está validado**: la fila de Actividades es el horizonte del modelo de
s126, y el usuario aprobó esa composición mirándola.

> **Por qué se acota en vez de revertirse.** La auditoría integral de s148 lo señaló como una
> incoherencia (§8.1) y al comprobarlo resultó ser del repo consigo mismo: s126 introdujo el
> `order` a propósito y **nadie enmendó la frase**. Se corrige la frase, no el código — pero la
> regla original **sigue viva donde nació**: en móvil y tablet, donde el modelo «atardecer» de
> este bloque necesita que el flujo sea el del DOM para que el margen negativo solape de verdad.
> Cambiar el orden visual en Desktop es una decisión de composición; hacerlo en ≤768px rompe la
> geometría.

**Tamaño del aro (por altura útil, mínimo generoso):**
- `--pace-home-timer-size = min(86vw, 520px, max(300px, 58dvh))` (definida en
  `_responsive.js` sobre `[data-pace-home-body]`; fallback `vh`→`dvh` vía
  `@supports (height:1dvh)` porque los custom properties NO admiten el patrón de doble
  declaración). Consumida por `[data-pace-dial-fit]` (variante `fitHeight` de `TimerDial`;
  Caminos conserva `min(56vh,86vw,520px)`, byte-idéntico).
- NO se encoge agresivamente: 520 en pantallas altas, suelo de **300 px** en las bajas.
  Se **prefiere scroll** antes que achicar el aro / la tipografía / el CTA.

**Solapamiento «atardecer» (SIEMPRE presente, adaptativo — SÍ `margin-top` negativo):**
- `--pace-home-sunset-overlap = max(6px, min(0.19·D, (D−244)/2 − 6px))`, aplicado como
  `margin-top` NEGATIVO a `[data-pace-spc]` (`z-index:2`). Llega al **19% del diámetro**
  donde hay holgura y se limita por el **arco decorativo real bajo las bolas** en aros
  pequeños (el contenido del aro mide ~224–250px casi fijo → arco ≈ (D−244)/2),
  garantizando **≥8px de holgura bajo el CICLO**. La ActivityBar la sigue en flujo (el
  margin negativo arrastra lo posterior) — SIN transform propio.
- **Por qué ahora SÍ funciona el margen negativo** (s122 lo descartó): el timer ya NO es
  `flex:1`. `FocusTimer.root` es `height:auto` y `timerWrap` es `flex:0 0 auto` (altura de
  contenido); la composición se centra con `margin:auto` en `data-pace-home-stack`. Sin
  `flex:1` que reclame el hueco, el margen negativo solapa de verdad y de forma estable.

**Scroll de la home (centrar-o-scrollear, barra oculta):**
- `data-pace-home-stack` con `margin-top/bottom:auto` centra el bloque cuando cabe; cuando
  no, los márgenes colapsan y `data-pace-home-body` (`overflow-y:auto`, `-x:hidden`) hace
  scroll vertical natural. **Nunca `overflow:hidden`** que recorte contenido.
- **Barra de scroll OCULTA** conservando el desplazamiento: sobre `[data-pace-home-body]`,
  `scrollbar-width:none` (Firefox) + `-ms-overflow-style:none` + `::-webkit-scrollbar{
  display:none}` (Chromium/WebKit), con `overflow-y:auto` intacto → rueda/trackpad/gesto/
  teclado siguen funcionando (el foco de teclado autodesplaza) y la barra no consume
  layout (`gutterV=0`). Patrón reutilizable en otros contenedores scrollables (p.ej. el
  runner v1, s125).

**Invariante:** la tarjeta NUNCA tapa el tiempo, el botón, las 4 bolas ni el CICLO.
Verificado ES+EN en 1440×900 · 1280×768 · 1280×600 · 1024×512 · 844×390 · 390×844 ·
360×640 (atardecer 19%→7% adaptativo, ≥8px de holgura, sin scroll horizontal, sin barra
visible).

---

## 🪷 Arte de línea como máscara (s138 · v0.72.0)

Regla nacida con el **loto de Respira** (`app/breathe/assets/loto.webp`) y aplicable a cualquier
arte de línea que aporte el usuario.

**El arte no transporta color.** El PNG original era línea *crema sobre transparente*, y sobre el
papel crema (`--paper #F2EDE0`) resultaba prácticamente invisible. En vez de retocar el arte, se
usa como **máscara CSS** y el color lo pone un token — así el contraste queda garantizado en las
tres paletas sin tocar el original.

Dos mediciones gobiernan cómo se construye la máscara:

| Medición | Consecuencia |
|---|---|
| El **alfa** del PNG es solo la SILUETA (histograma bimodal: 112 985 px a ~0 y 146 964 a 224+) | Enmascarar por alfa da **una mancha sólida** y pierde todo el dibujo |
| El **dibujo** (capas de pétalos, semilla de la vida) vive en la **LUMINANCIA** (L 76–255, media 219) | La máscara se reconstruye desde la **densidad de tinta**: `(255 − L) / (255 − L_min)`, acotada por el alfa original |

Reglas derivadas:

- **El RGB se aplana a blanco.** Solo importa el alfa; además el WebP comprime mucho mejor.
- **El alfa se comprime SIN pérdida** (`alphaQuality: 100`). Es donde vive el dibujo: con pérdida
  se motea por bloques en las venas finas. Se reportó como «pixelado» y **no era resolución**.
- **El color va en CSS por paleta, nunca inline.** `[data-pace-loto]` usa `--breathe-2` (#A85E43,
  terracota profundo) en las paletas claras y `--breathe` en oscuro, donde ya se lee como línea
  encendida. Un `background` inline ganaría a la hoja, y el componente no debe saber qué paleta
  hay puesta.
- **Ingesta reproducible**: `scripts/ingest-loto.js`. Regla D-4 — si el usuario aporta arte nuevo
  se **re-corre el script**, nunca se sustituye el `.webp` a mano.
- **El suelo de papel se aplica ANTES de remuestrear** (s147, arte de logro). El fondo de los PNG
  del usuario no es plano: viene **ditherado** entre ~240 y ~254, justo por encima del suelo de
  238. Declarar el papel *después* de reducir de tamaño no sirve, porque el remuestreo ya ha
  hundido parches del tramado por debajo del suelo y el afilado los amplifica — medido, del
  **2,0 % al 12,4 %** de píxeles «con tinta», y el resultado es un campo de puntos alrededor del
  motivo que no está en el dibujo. Dos avisos que salieron de ahí: **no vale un filtro espacial**
  (`median` no quita una trama regular y se come trazo fino; `blur` la reparte), y **la detección
  del marco necesita el buffer SIN aplanar**, porque el aplanado hace que la línea fina promedie
  más clara y deje de detectarse. Un buffer para el marco, otro para el resto.
- **Distribución** igual que las láminas de Caminos: archivo en web + precache en `sw.js`, data URI
  solo en el standalone (el inliner del build recorre una lista de carpetas de arte).

### Geometría de un visual que respira

- **El wrap declara lo que se pinta a ESCALA MÁXIMA**, no en reposo. Invariante:
  `(1 − 2·inset) × MAX_SCALE ≤ 1` — hoy `0,72 × 1,35 = 0,972`. `BREATH_MAX_SCALE` es la escala
  mayor que declara `getSequence` (**1,35**, patrón fisiológico): si se añade un patrón con una
  escala mayor, **hay que subir esa constante**.
- **Todas las capas comparten el mismo factor de escala**; el tamaño se fija solo con el `inset`.
  Con bases y factores distintos los huecos entre capas crecían un **44 %** al inhalar y cada capa
  parecía ir a su velocidad.
- **La curva es `easeInOutSine`** (`cubic-bezier(0.37, 0, 0.63, 1)`), no `--ease`: esa es la curva
  de UI de Material —sale rápido y frena largo—, buena para un CTA y mala para un pulmón.
- **Respiración asimétrica**: el eje vertical recorre la excursión entera y el horizontal el 88 %,
  con una elevación pequeña al llenarse. Un círculo que escala igual en los dos ejes lee como «una
  imagen que crece».
- **El movimiento continuo va en `@keyframes`**, nunca derivado de `progress` (que avanza una vez
  por segundo y se reinicia en cada fase). Ojo con reduced-motion: el kill global pone
  `animation-duration: 0.01ms`, que sobre una rotación infinita la **acelera** en vez de pararla,
  así que el freno vive en el JSX.

---

## 🃏 La tarjeta de rutina y las bibliotecas (s174 · v0.104.0, ajustada en s175 y s176)

> **s176 · LAS TRES BIBLIOTECAS COMPARTEN PANTALLA, no sólo tarjeta.** s174 dejó Respira
> fuera de `LibraryShell` —se ordena por TIEMPO y no por contexto— y el resultado fue una
> sola columna de **810 px** para tarjetas con ~380 px de contenido: **3,90 pantallas de
> scroll, más que las 3,82 de la biblioteca anterior al rediseño** (medido a 1536×714).
> Ahora Respira usa el mismo modal de 1240, la misma rejilla de tres y su propio rail:
> tarjeta de **288 px** y **1,98 pantallas**. Lo suyo entra por props —`filtros`,
> `variant`, `conTuyas`, `pozoAhora`, `ancho`— y Mueve y Estira no cambian.
> **Sus filtros son DOS** (`≤ 5 min` · `Sin retención`) porque los de cuerpo no descartan
> nada en Respira, y el tercero que se probó resultó ser un subconjunto del segundo.

Componente: [`app/ui/RoutineCard.jsx`](app/ui/RoutineCard.jsx) · hoja:
[`app/ui/library.css.jsx`](app/ui/library.css.jsx) · pantalla:
[`app/ui/LibraryShell.jsx`](app/ui/LibraryShell.jsx). El diseño completo y su
porqué: [`LIBRERIAS_REDISENO.md`](docs/product/LIBRERIAS_REDISENO.md).

| Pieza | Qué es |
|---|---|
| **Capitular** | El primer dibujo de la rutina a **62 px**; el resto de glifos debajo a **20 px** con `opacity: .75`. **El 55 % no valía** — el usuario no los registraba y reportó «sólo muestra un glifo»: si no se leen, no están |
| **Nombre** | `--font-display` itálica **20 px**. La pill de nivel va **FUERA** del `<h4>`: dentro cambia el nombre accesible del encabezado |
| **Pill de nivel** | 9 px, versalita, borde `--line-2`, `--r-pill`. Coste consciente: 14 pills pintan **56 bordes** |
| **Descripción** | 12,5 px, **dos líneas** — caben las 28 sin recortar (mediana 61 caracteres, la mayor 84) |
| **Línea de contexto** | `--font-display` **itálica 15 px**, con todo el cómo-se-hace: dónde · con qué · «por lado» · Premium. **La cifra de minutos en `'EB Garamond', Georgia, serif` a 19 px**, blindada en el CSS igual que la racha del sidebar — no pasa por `--font-display`. «min» sigue en sans a 10 px |
| **Separador** | Cuelga como `::after` del trozo **anterior**, nunca como `::before` del siguiente: los trozos son *flex items* y el navegador **colapsa el espacio al principio** de uno, y al partirse la línea el punto **abriría el renglón** |
| **Línea de series** | Sólo cuando dice series **y** repeticiones, y exige **DOS series** — «1 SERIES» no es una serie. Son **8 de 28** |
| **Grano** | `paceGrainUrl()` tal cual, con su opacidad **dentro del SVG**. No se vuelve a aplicar en CSS: sería 0,011² |

**El color de módulo cambia de función entre pieles, y no es una excepción:**

| | Reposo | Hover |
|---|---|---|
| **Móvil** (≤ 768) | filo de **3 px** del token del módulo — es lo único que dice de un vistazo en qué biblioteca estás con 3 o 4 tarjetas a la vista | — |
| **Escritorio** (≥ 769) | **sin color** — con catorce a la vez, el mismo recurso satura | entra el filo + `translateY(-1px)` + `--sh-soft`, que es lo que hace `Card` |

### s177 · Stats tambien usa el modal de 1240, y cada vista lleva SU ancho

Stats era el ultimo modal ancho que se quedaba en **820 px**, y eso dejaba a la
pestania «Anio» con **163,7 px muertos de sus 385** (el 42 % de su caja) porque
su rejilla lleva **celdas de 11x11 px cableadas** en el JSX: 53 columnas x 13 =
754 px, mida lo que mida la ventana. Con 1240 la celda pasa a **19** y el hueco
muerto a **52,4**. Subirlo **quita una excepcion**, no la anade.

**Pero ensanchar el modal no basta, y agrandar el mes NO SE PUEDE.** Las cuatro
pestanias comparten caja de 385 px (s176) y la del mes se va a **421,4** con
celda 48, **474,4** con 56 y **527,4** con 64: cualquiera devuelve el salto entre
pestanias. Los 42 px de hoy ya son su techo.

Por eso **cada vista lleva su ancho**: el anio usa los 1174 utiles y las demas se
acotan a **820 px** y se centran, con `:has([data-pace-year-grid-wrap])` para
distinguirlas sin tocar el JSX. Y el **centrado vertical se acota al anio**: en
todas las vistas metia 4,9 px en «Semana», porque una columna flexible no colapsa
los margenes de sus hijos.

**El modal de biblioteca recorta su chrome** (`:has(.pace-lib)`, con
`!important` porque el padding va en línea): fondo **8 px** y tarjeta **16 px**
en móvil, **20 / 22-24** en escritorio, con `maxWidth: 1240`. Sin eso el ancho
útil a 360 px cae de 310 a **286** y el scroll sube de 3,97 a **4,33** pantallas.

**s175 · LA COLUMNA DE LA IZQUIERDA SE QUEDA QUIETA Y RESPIRA IGUAL.** El rail
pasa a `position: sticky; top: 0` con `align-self: flex-start` —estirado no puede
pegarse— y el aire deja de colgar del rótulo: la regla era
`.pace-lib-lateral-tit + *`, y «Tus rutinas» es el único bloque que **no va detrás
de una versalita**, así que se caía del selector y quedaba a **0 px** de «Para
ahora». Ahora el margen lo llevan los BLOQUES (`> :not(.pace-lib-lateral-tit)`) y
los rótulos conservan sus 11.

**Y «Para ahora» propone UNA, no dos** —en las dos pieles— porque con dos el rail
no cabe: medido a **1536×714** (1920×1080 al 125 % de escala), 578 px de rail en
556 de hueco. Dar aire **empeora** el recorte (22 → 48 px), así que lo único que
cumple «más aire» y «que quepa» a la vez es una sugerencia. No puede diferir por
piel: lo que sube se **retira** del catálogo, y la segunda no aparecería en
ninguna parte.

**Y una tarjeta clicable no es un `role="button"`**: ese rol vuelve
presentacionales a sus descendientes y el nombre deja de ser encabezado. El
encabezado lleva **dentro** un botón que cubre la tarjeta con un `::after`.

---

## 🗂️ Dónde vive cada hoja de estilos (s148)

`app/tokens.css` llegó a **613 líneas** y más de un tercio no eran tokens: era el
lenguaje visual del módulo Caminos. En s148 se separó — un token es un valor que
consume toda la app; aquello eran reglas de un módulo.

| Hoja | Qué gobierna | Líneas |
|---|---|---:|
| `app/tokens.css` | Paletas · tipografía · espaciado · radios/sombras/transiciones · reset · utilidades · scrollbar · focus · reduced-motion · microinteracciones globales | 386 |
| `app/paths/paths.css` | **Caminos**: SenderoBar · escena ilustrada · variante `lg` · orbe, con sus keyframes | 284 |

Dos reglas que hay que respetar al tocarlas:

- **El orden de los `<link>` es parte del contrato.** `paths.css` va **después** de
  `tokens.css`: la regla que saca la escena del rise escalonado
  (`[data-pace-reveal] > [data-pace-path-scene] { animation: none }`) gana por
  **ORDEN**, no por especificidad. Verificado en el artefacto compilado.
- **El build las inlinea todas**, cada una en su sitio, así que la cascada del
  `index.html` y del standalone es la misma que en dev. Añadir un CSS bajo `app/`
  = declararlo en `PACE.html` y nada más. Ninguna ruta va cableada en el build.

Ninguna de las dos entra en el precache de `sw.js`: en la web viajan inlineadas
dentro de `index.html` y solo las pide `PACE.html` en desarrollo.

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

### Atmósfera de sesión (wash del módulo)
`SessionShell` acepta `atmosphere` (token `*-soft` del módulo). El helper
`sessionAtmosphere(soft)` (en `app/ui/SessionShell.jsx`, expuesto a window) devuelve
un `radial-gradient` muy tenue concentrado arriba y desvanecido a `paper`. Desde
s138 se aplica en **toda** sesión, no solo dentro de Caminos (Respira terracota /
Foco verde / Cuerpo tan / Agua azul).

**Banding — resuelto en s140, midiendo los píxeles reales de la página.** s100 y
s138 lo trataron a base de paradas y grano, sobre dos premisas que resultaron
falsas al medir la pantalla en vez del tile:

- **El grano no dithera, solo tapa.** La escalera vale igual con grano (0,314) que
  sin él (0,318): se compone cuando el degradado **ya** está redondeado a 8 bits, y
  un dither tiene que entrar antes de la cuantización. ⇒ **Añadir paradas no sirve**
  (el número de escalones lo fija el color, no la forma de la rampa) y
  `baseFrequency` tampoco cambia la amplitud.
- **Apilar el mismo degradado dos veces duplica el escalón**, porque los dos
  redondeos caen en los mismos radios: usaba **17 de 24** niveles del recorrido
  (escalón 1,41) contra **22 de 23** con una sola capa (escalón 1,05).

Reglas vigentes para cualquier wash nuevo:

1. **Una sola capa.** Si hace falta más tinte del que da el token, se compone el
   alpha —`1−(1−a)² = a·(2−a)`— con **color relativo** sobre el propio token
   (`rgb(from C r g b / calc(alpha * (2 - alpha)))`), nunca repitiendo la capa. Así
   cada módulo y cada paleta conservan su alpha y **no se sube ninguno** (regla
   s100 intacta). Con caída a la receta antigua vía `CSS.supports`.
2. **El grano se calibra por el ratio σ ÷ escalón**, no a ojo: 0,48 antes, **1,16**
   ahora. Para subir σ sin ensuciar el papel — `color-interpolation-filters='sRGB'`
   (por defecto los filtros SVG van en linearRGB y pierden la mitad), **alpha
   constante** en vez de ruidosa, y curva de contraste estirada alrededor del mismo
   centro. La opacidad vive en `PACE_GRAIN_OPACITY`, constante única que gobierna
   también `PaceDither` (halo del loto y círculo de retención).
3. **En fondos claros el ruido va por composición normal, nunca por blend.** Sobre
   papel casi blanco, `overlay` amplifica lo oscuro (≈1,86) y aplasta lo claro
   (≈0,14): convierte un ruido simétrico en un velo oscuro.

El grano sigue leyéndose como fibra de papel, y ahora el papel no se desvía en
tono: el desvío es parejo en los tres canales (antes −1,79 rojo contra −0,93 azul,
que lo desaturaba; en oscuro llegaba a **aclararlo un 14 %**).

### Timer — variante `ticks`
`TimerDial` con prop `ticks` renderiza 60 marcas radiales tipo reloj (cada 5 mayor)
que se encienden con el color del aro según `progress`, + número protagonista
(`numberHugeTicks`, `clamp(78px, 9vw, 128px)`). El Foco de Camino la usa; el home
mantiene el aro clásico con arco + punto guía.

### Timer de Foco · controles y estados (s124 · v0.67.0)

Controles del timer de Foco de la home (`FocusTimer`, viven DENTRO del aro vía el
slot `inner` de `TimerDial`; no cambian su geometría ni el atardecer de s123).

- **Subtítulo = descriptor por DURACIÓN** en modo foco (`getFocusDescriptorKey` →
  `focus.subtitle.short|deep|sustained|deepWork|extended`, serif itálica `--ink-3`,
  `subtitleItalic` de `TimerDial`). En `status==='completed'` el mismo slot muestra
  «Ciclo completado» (feedback), sin añadir un bloque nuevo. Pausa/larga conservan su
  copy. Los tres estilos (aro/barra/analógico) leen el mismo `subtitle`; el analógico
  lo pinta discreto bajo la cifra (`<text>` fontSize 3.6, sin tocar el reloj).
- **CTA principal** (`startBtnPrimary`): cápsula RELLENA `--focus-cta`, `--r-pill`,
  `var(--font-display)` itálica 16px, `min-height:44px` (a11y), **sin glifos**.
  Running usa `startBtnSecondary` (contorno `--line-2`, fondo `--paper`). Etiqueta y
  acción se derivan de `status` (idle «Empezar foco» · paused «Continuar» · completed
  «Empezar otro ciclo» · running «Pausar»), no de `remaining`.
- **Reset** (`resetTextBtn`): solo en paused. Acción TEXTUAL subrayada (`--ink-3`,
  itálica 13px, `min-height:44px`), NO botón circular. Va **EN FILA junto al CTA**
  (`controlsTight` = row `nowrap` + `flexShrink:0`, la fila desborda centrada el
  `maxWidth:70%` del interior del dial) → mostrarlo NO añade altura al interior del aro
  y no desplaza el «CICLO N/4» ni el solapamiento. Copy `focus.restartBlock`
  («Reiniciar bloque»); el `focus.restart` del Foco de Camino es independiente.
- **Indicador de ciclo** (`cycleDots`): 4 puntos + «CICLO N / 4» (uppercase, `--ink-3`,
  10px, tracking 0.18em); completed → «SIGUIENTE · CICLO N / 4». N = `(state.cycle%4)+1`.
- **a11y**: `aria-live="polite"` en el subtítulo del `TimerDial` (anuncia «Ciclo
  completado»/descriptor, no el contador). `prefers-reduced-motion` respetado (solo
  transiciones de estado 180ms, sin animación de entrada nueva).

### Escena ilustrada de Caminos (s104 · v0.49.0 · arte D-4)

`PathIllustration` monta la lámina del Camino como escena cover FULL-BLEED
**solo en el runner** (IntroCard/StepIntro/CompletionScreen; las sesiones
activas no llevan arte). Bloque `[data-pace-path-scene]` en `app/paths/paths.css`
(vivía en `tokens.css` hasta s148):

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
de la paleta crema dentro de las superficies ilustradas — desde s106 también
`--focus-cta` y `--achievement` (el onboarding usa el CTA y el acento de
Energía sobre arte). Son **copias literales** de la paleta día: si se
recalibra la crema, actualizar también ese bloque (mismo aviso que las
copias inline de safety/privacy.html).

### Onboarding sobre arte (s106 · v0.51.0)

El flujo de primera vez (`app/onboarding/`) monta las láminas como fondo
cover con un **velo radial de crema fija** (denso tras la columna de
contenido `rgba(242,237,224,0.92)`, abierto hacia los bordes `0.16`) y
placas translúcidas de la misma familia que las del runner
(`rgba(242,237,224,0.82)` + hairline `rgba(184,173,142,0.5)` + blur 3px).
La raíz lleva `data-pace-scene-card` (remap día en oscuro). El logo PNG va
SIEMPRE en tratamiento día (multiply, sin invert). **Hallazgo s106:**
dentro de `[data-pace-reveal]`, el `forwards` de `pace-reveal-rise` gana al
`opacity` inline de los hijos directos → los estados deshabilitados se
señalizan por contorno neutro, nunca por opacidad.

**La placa de valores se alinea por abajo, no por el centro (s151).** Las tres columnas
(`Todo local` · `Sin cuentas` · `Núcleo gratuito`) van en `alignItems:'stretch'`, cada
una en columna flex y con el **label creciendo** (`flexGrow:1`). Con el `center` que
tenía, un label que envolviera a dos líneas arrastraba su `sub` **8 px por debajo** del
de sus hermanas — el mismo defecto que el sello de Logros en s147, en otra superficie.
Así los tres subs se alinean solos y **no se añade aire cuando ninguno envuelve**.
**Presupuesto real de texto: 85 px por columna a 360 px de ancho** (el suelo
documentado) — a 14px Cormorant itálica eso son ~12 caracteres. Cualquier copy nuevo
para esta placa se **mide antes de aprobarlo**: «Lo esencial, gratis» daba 87,9 px y
«The essentials, free» 91. Ojo también con el `sub`: un valor a menos de ~1 px del
límite envuelve durante la ventana de `font-display:swap`, porque Georgia es más ancha
que Cormorant.

**Metadatos por lámina** (`app/paths/illustrations/paths.index.js`): `dots`
{x,y,r,color} medidos por escaneo (`scripts/ingest-lamina.js`, modo híbrido),
`paper` del cielo, `focusY` (franja del sendero) y `finish` (encuadre final).
El arte se mide UNA vez, cuando es definitivo.

---

## Z-index layers

TODO: documentar capas de z-index (sidebar, toasts, modales). Pendiente de extraer de los JSX en tarea separada.
