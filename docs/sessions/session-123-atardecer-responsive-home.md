# Sesión 123 — Modelo «atardecer» responsive de la home

**Fecha:** 2026-07-27
**Versión:** v0.65.0 → **v0.66.0**
**Tipo:** CÓDIGO (confinada a la home; §0 de `HOME_REDISENO_PROPUESTA.md`)

---

## Contexto y reencuadre

La sesión iba a ser el **timer editorial** (descriptores por duración, controles/estados,
`completed` inerte). Pero la **prueba real de la home** de s122 destapó una **regresión
bloqueante**: en viewports anchos pero bajos, el intercambio responsive por `order`
introducido en s122 colocaba **Actividades antes que Camino**, y la base del aro (4 bolas /
CICLO / cierre del arco / CTA) se **recortaba** por el `overflow:hidden`.

Con el usuario se **reencuadró** la sesión:

- **s123** → corregir jerarquía + geometría responsive de la home (este diario).
- **s124** → timer editorial.
- **s125** → scrollbar del runner v1.

Esto toca el **núcleo de §0**, porque el swap se había introducido precisamente para evitar
resolver el diámetro del círculo por altura.

## Causa raíz (medida con getBoundingClientRect)

Auditoría runtime en el navegador (SW desregistrado + cachés `pace-*` vaciadas, deuda de
entorno s119):

| Viewport | swap | aro | recorte base | jerarquía | CTA |
|---|---|---|---|---|---|
| 1280×600 | sí | 336 desborda | 52px | Act→Camino ✗ | ok (25px) |
| 1024×512 | sí | 287 desborda | 91px | ✗ | recortada ✗ |
| 844×390 | sí | 219 desborda | 218px (mc=59px) | ✗ | recortada ✗ |

Tres culpables:
1. **Swap por `order`** (`SuggestedPathCard.jsx`, `@media (min-width:700px) and
   (max-height:759px)`).
2. **Aro por `56vh`** (viewport), no por la altura útil real.
3. **`overflow:hidden`** en `main`/`main-content` recortando en vez de scrollear.

## Iteración de diseño (2 rondas con el usuario)

**Ronda 1** (encoger + scroll, aprobada por AskUserQuestion): eliminé el swap, dimensioné el
aro con `min(86vw,520px,max(200px,100dvh−400px))`, envolví en una región scrollable y escalé
el solapamiento con la altura. **Verificada en los 7 viewports.**

**Feedback del usuario:** ese resultado **encogía el aro en exceso** en alturas intermedias y
dejaba un **hueco** entre el aro y la tarjeta (el solapamiento era binario, gate ≥760px → se
apagaba en pantallas bajas). Rompía el modelo editorial **«sol / atardecer»**.

**Ronda 2** (modelo «atardecer», la entregada): rediseño estructural para que la tarjeta
cruce SIEMPRE el arco inferior del aro, de forma progresiva, sin tapar controles.

## Solución entregada (v0.66.0)

- **Jerarquía invariante**: swap eliminado; el orden del DOM (Timer → Camino → Actividades)
  manda en todo viewport. Prohibido `order` para intercambiar.
- **Aro por altura útil con mínimo GENEROSO**:
  `--pace-home-timer-size = min(86vw, 520px, max(300px, 58dvh))` (fallback vh→dvh vía
  `@supports (height:1dvh)` — los custom properties no admiten doble declaración). NO se
  encoge agresivamente; se **prefiere scroll**. `TimerDial` gana la variante aditiva
  `fitHeight` (Caminos byte-idéntico con su `min(56vh,86vw,520px)`).
- **«Atardecer» SIEMPRE presente y PROGRESIVO**: `margin-top` NEGATIVO de la tarjeta
  `= max(6px, min(0.19·D, (D−244)/2 − 6px))`. Hasta **19% del diámetro** donde hay holgura;
  limitado por el arco decorativo real bajo las bolas en aros pequeños (contenido del aro
  ~224–250px casi fijo → arco = (D−244)/2), con ≥8px de holgura bajo el CICLO. La ActivityBar
  la sigue en flujo (sin transform propio).
- **Composición + scroll**: `data-pace-home-stack` con `margin:auto` (centra si cabe, scrollea
  si no); se retira `overflow:hidden`; `FocusTimer.root` a `height:auto` y `timerWrap` a
  `flex:0 0 auto` (evita que `flex:1`=basis 0% colapse el aro en altura de contenido).
- **Barra de scroll OCULTA** en `[data-pace-home-body]` (`scrollbar-width:none` +
  `-ms-overflow-style:none` + `::-webkit-scrollbar{display:none}`) conservando scroll por
  rueda/trackpad/gesto/teclado (el foco de teclado autodesplaza). Un ÚNICO scrollable.

## Archivos tocados (5)

- `app/paths/SuggestedPathCard.jsx` — swap eliminado; solapamiento por margin-top adaptativo.
- `app/main.jsx` — `data-pace-home-stack` (margin:auto) + `main-content` a contenido.
- `app/ui/TimerDial.jsx` — variante `fitHeight` (aditiva; Caminos intacto).
- `app/focus/FocusTimer.jsx` — `fitHeight` al aro; root/timerWrap a altura de contenido.
- `app/main/_responsive.js` — variables `--pace-home-timer-size` / `--pace-home-sunset-overlap`
  + `[data-pace-dial-fit]` + ocultación de scrollbar.

## Verificación

Matriz medida en **1440×900 · 1280×768 · 1280×600 · 1024×512 · 844×390 · 390×844 · 360×640**,
ES y EN:

| Viewport | aro | atardecer | holgura bolas | Camino<Act | scroll V | barra V | scroll H |
|---|---|---|---|---|---|---|---|
| 1440×900 | 520 | 19% | +37 | ✓ | no | no | no |
| 1280×768 | 445 | 19% | +19 | ✓ | no | no | no |
| 1280×600 | 348 | 13% | +8 | ✓ | sí | no | no |
| 1024×512 | 300 | 7% | +16 | ✓ | sí | no | no |
| 844×390 | 300 | 7% | +20 | ✓ | sí | no | no |
| 390×844 | 336 | 12% | +20 | ✓ | no | no | no |
| 360×640 | 310 | 9% | +20 | ✓ | mín | no | no |

En todos: `suggestedPath.top < circle.bottom` (cruza el arco) y a la vez `> cta.bottom` y
`> cycleDots.bottom`; 4 bolas + CICLO visibles; CTA pulsable; foco de teclado autodesplaza;
`gutterV=0` (barra oculta); sin scroll horizontal; sin truncamiento ES/EN. Consola limpia,
sin `[i18n] missing`. Capturas reales entregadas + Artifact de reproducción a escala.

## Notas de proceso

- El SW cacheaba los `.jsx` (cache-first) → lecturas stale durante el testeo; resuelto con
  desregistrar-SW + vaciar cachés + doble recarga.
- Bug propio cazado y arreglado: backticks en un comentario dentro del template literal CSS de
  `SuggestedPathCard` lo cerraban (mismo patrón que ya mordió en s122).

## Deuda / diferido

- `FocusTimer.jsx` en **506 ln** (ya estaba en **505 en HEAD**, sobre el límite de 500 ANTES
  de esta sesión; delta neto +1). Trocear en sesión propia (extraer `MinutesPicker` o
  `TimerBar`/`TimerAnalog`) — decisión del usuario: dejarlo por ahora.
- **s124**: timer editorial (descriptores por duración, controles/estados, `completed` inerte).
- **s125**: scrollbar del runner v1.
