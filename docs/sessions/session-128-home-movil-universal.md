# Sesión 128 — Home móvil universal · «amanecer del Camino» (v0.71.0)

**Fecha:** 2026-07-29 · **Bump:** v0.70.0 → v0.71.0 · **Tipo:** CÓDIGO (layout responsive)

## Origen

Arrancó como diagnóstico de tres cosas que el usuario notó «raras» en móvil:

1. **Icono blanco** (antes terracota suave, con el logo cabiendo en el cuadrado).
2. **Instalada sin pantalla completa** (aparecen los botones ⇄□← del sistema).
3. **Scroll leve** en la home que descentra y oculta/muestra los iconos superiores.

### Diagnóstico (1 y 2 NO son regresión de código)

- El icono y la no-pantalla-completa venían de **instalar desde `/PACE_standalone.html`**,
  que **no tiene** `<link rel="manifest">` (confirmado: 0 coincidencias). Sin manifest,
  Android/Brave no hace WebAPK → acceso directo con chrome del navegador + icono autogenerado
  sobre fondo blanco. La raíz `/` (`index.html`) **sí** tiene manifest → instalar desde ahí da
  el icono maskable (crema cálido) y arranque `standalone`. Manifest e iconos **no cambian
  desde mayo** (git). Los botones ⇄□← son la barra del **sistema Android** (modo de navegación
  del teléfono), no de la app en `standalone`. Solución de uso, sin cambio de código.
- Queda anotado como opción futura: añadir el `<link rel="manifest">` también al standalone.

### El scroll SÍ era de una sesión reciente (s123)

La home **Desktop** tiene un motor JS (`home-geometry.js`) que mide y **encoge el aro hasta
que no hay scroll**. La **móvil no tenía equivalente**: por decisión explícita de s123, el aro
era `min(86vw,520px,max(300px,58dvh))` con el comentario *«en alturas bajas se prefiere SCROLL
vertical»*. En un teléfono corto (Doogee Blade 20 Max) el conjunto rebasaba el viewport por unos
px → ese scroll.

## Decisión del usuario

Tras ver la composición Desktop en su móvil (activó «sitio de escritorio» en Brave), le convenció
y pidió **la home igual en cualquier resolución móvil, sin scroll**, reutilizando el sistema que
hace universal a la Desktop. Refinamiento clave del usuario:

- **Conservar el orden móvil** Timer → Camino → Actividades (no reordenar como Desktop; respeta
  la jerarquía de s122).
- Usar la **tarjeta de Camino como «horizonte»**: sube y oculta parte inferior del aro (el
  «amanecer» del Desktop de s126, pero con **Caminos** en vez de Actividades — la tarjeta es
  ancha y opaca → línea de horizonte fuerte).
- **Motor completo (universal)**: extender `home-geometry.js` a móvil para garantizar cero scroll.

## Cambios entregados — un motor, dos pieles

### `app/main/home-geometry.js`
El motor corre AHORA también en móvil/tablet (≤768). `isDesktop` solo elige las **constantes**:
la rama Desktop queda **byte-idéntica** (`WIDTH_CAP 0.42`, `D_FLOOR 205`); la móvil usa
`WIDTH_CAP_MOBILE 0.86` (arranque por ancho ≈ el 86vw de identidad) y `D_FLOOR_MOBILE 240`. El
resto es común: publica `--pace-timer-d`, `--pace-activities-overlap` (medido desde el **CICLO
real** vía `applyD`/`cicloBottomWithin`, no estimación CSS) y `--pace-home-squeeze`; el bucle de
ajuste `scrollHeight ≤ clientHeight` es el mismo → el aro **solo encoge como último recurso**,
tras comprimir aire y ocultar tras el Camino.

### `app/main/_responsive.js`
- `[data-pace-dial-fit]` global: `height: var(--pace-timer-d, var(--pace-home-timer-size))`
  (fallback pre-JS con su `@supports` dvh) + **`clip-path: inset(0 0 var(--pace-activities-overlap) 0)`**
  (+`-webkit-`): el HORIZONTE, ahora en móvil/tablet. Recorta el MARCO (no el `<svg>` rotado) y
  cubre el halo `::after`. En Desktop lo pisa el bloque `min-width:769px` (mismo valor). Caminos
  NO lleva `[data-pace-dial-fit]` → intacto.
- **Squeeze móvil**: TopBar (padding vertical + min-height), raíz de FocusTimer
  (`[data-pace-main-content] > div` padding-top 8 + gap 14) y ActivityBar (padding vertical) se
  interpolan con `calc(base − delta·var(--pace-home-squeeze,0))`. Solo aire; ningún texto ni
  fuente. Squeeze=0 → valores base de siempre.
- Se **omite** el escalado proporcional del interior (`data-pace-dial-*`) en móvil: rango de D
  estrecho, los `clamp()` inline de TimerDial bastan → menos riesgo.

### `app/paths/SuggestedPathCard.jsx`
El margen de solapamiento pasa a `calc(var(--pace-activities-overlap, var(--pace-home-sunset-overlap, 0px)) * -1)`:
usa el valor MEDIDO por el motor, con la estimación CSS de fallback. La tarjeta ya era opaca y
`z-index:2` sobre el aro → al recortar el aro en su borde superior, el arco de abajo desaparece
limpio. Sin cambio estructural. `TimerDial.jsx` **sin tocar** (los hooks ya existían).

## Verificación (dev PACE.html + bundle index.html construido)

| Viewport | timerD | overlap | squeeze | scrollDelta | horizonte |
|---|---|---|---|---|---|
| 360×640 (Doogee) | 310 | 36 | 0.667 | **0** | CICLO+5px |
| 390×844 | 335 | 49 | 0 | **0** | — |
| 412×915 (EN) | 354 | 57 | 0 | **0** | CYCLE+5px |
| 768×1024 tablet | 520 (cap) | 83 | 0 | **0** | piel móvil (order DOM, tabs off) |
| 1366×768 **Desktop** | 465 (0.42) | 74 | 0 | **0** | order 1/2, **byte-idéntico** |

ES + EN. Consola limpia en dev y en el bundle construido. Standalone regenerado (3247 KB,
markers `WIDTH_CAP_MOBILE`/clip/overlap presentes, v0.71.0).

## Follow-up acordado (NO en esta versión)

**Tabs Foco/Pausa/Larga en móviles altos** (apunte del usuario para «completar espacio y
proporciones» — en 390×844 sobran ~90px arriba/abajo). NO es un simple des-ocultar: las tabs son
`position:absolute` centradas y en anchos de móvil (390–430px) **colisionarían** con los 3 iconos
top-right (por eso s46 las ocultó). Requiere **fila propia** (2ª fila centrada bajo los iconos)
gateada por `min-height`, + decisión consciente de reintroducir en móvil la selección de modo que
hoy vive en BreakMenu. Elegido «aterrizar núcleo y luego tabs» (menos riesgo por tanda).

## Trampas / notas

- El SW sirve `app/*` cacheado en dev (trampa s126): hubo que desregistrar SW + borrar caché
  `pace-vX.Y.Z` para ver los cambios. Verificado también sobre el bundle construido.
- La captura del navegador embebido escala la vertical de forma no lineal (posiciones no fiables);
  `getBoundingClientRect` es la fuente de verdad del layout.
