# Sesión 126 — Home Desktop: composición proporcional del timer y horizonte del aro

**Fecha:** 2026-07-29
**Versión:** v0.68.0 → **v0.69.0**
**Tipo:** sesión de CÓDIGO (geometría de la home Desktop; sin motor, sin contabilidad)
**Base:** `main` @ c2a7ff1 (v0.68.0 publicado)

---

## Encuadre

Corte: cerrar la geometría responsive de la home tomando como canon **dos capturas del
usuario** — una WEB (composición completa dentro del viewport, 4 Actividades en fila,
Camino ancho, sin scroll) y una MÓVIL (aro grande, Camino solapado, Actividades 2×2).

La sesión arrancó con un WIP en disco de un intento anterior interrumpido por límite de
uso, ya construido pero **sin documentar**: `home-geometry.js` (nuevo), bloque
`@media (min-width:769px)` en `_responsive.js`, hooks `data-pace-dial-*` en `TimerDial.jsx`
y bump a v0.69.0 en `PACE.html` / `state-core.jsx` / `index.html` / `sw.js`.

Ese WIP ya restauraba la composición de la referencia (Timer → Actividades → Camino) pero
**el aro se seguía viendo entero**. El usuario lo señaló comparando su build actual con el
backup v0.64.0: «es ajustar básicamente que no se vea el aro completo del pomodoro».

---

## Diagnóstico medido

**Por qué el aro se veía entero.** `[data-pace-activitybar]` no tiene fondo. El WIP la
subía y la anclaba 4px bajo el CICLO, pero el arco SVG se pinta detrás y atraviesa la banda
transparente de ~40px (padding del bloque + rótulo «ACTIVIDADES»). En v0.64 el aro estaba
literalmente **recortado** por el `overflow:hidden` del contenedor — lo que s123 registró
como regresión y corrigió. La captura de referencia del usuario ES ese recorte.

**Artefacto de entorno que despistó al intento anterior.** El service worker servía un
`_responsive.js` cacheado: el archivo en disco tenía el bloque nuevo (`serverHasClip: true`)
pero el CSS inyectado en la página medía 3678 chars y terminaba en el bloque s123 — de ahí
la conclusión errónea de que «las reglas no se aplican». Se resolvió desregistrando el SW y
borrando la caché `pace-v0.69.0`; la verificación real se hizo sobre el standalone con
cache-bust, que es un único archivo sin subrecursos.

---

## Decisiones del usuario (AskUserQuestion)

1. **Corte duro**, no desvanecido. Se le expuso que un desvanecido dejaría el arco y el
   punto guía atenuados y *visibles* en la banda transparente, a los lados de
   «ACTIVIDADES» — respondió que eso quedaría raro y eligió el corte.
2. **Solo Desktop (≥769px).** En móvil el aro ya queda cortado por el borde superior de la
   tarjeta de Camino (opaca, `var(--paper)`/`var(--paper-2)`, casi de ancho completo): la
   metáfora del sol ya se cumple y extenderlo obligaría a hacer correr el ayudante bajo
   769px, reabriendo el modelo «atardecer» de s123 que hoy cumple sin scroll.
3. **Copy intacto.** De la captura v0.64 se toma SOLO la geometría. Se conservan las
   decisiones de s122/s124: «FOCO MANUAL», «Empezar foco», «CICLO 1 / 4», «Ver caminos»,
   eyebrow «CAMINO SUGERIDO».

**Consecuencia asumida y documentada:** con el timer en marcha, el arco de progreso y el
punto guía quedan ocultos bajo el horizonte (~94° de aro, aprox. entre el 37 % y el 63 %
de la sesión). Es el comportamiento de v0.64. Verificado: a progreso 0.5 el punto caería en
y=493.5 con el horizonte en y=445 (48.5px por debajo).

---

## Cambios

### 1. Horizonte del aro — `app/main/_responsive.js`

Dentro del bloque `@media (min-width: 769px)`:

```css
[data-pace-dial-fit] {
  height: var(--pace-timer-d, 360px) !important;
  -webkit-clip-path: inset(0 0 var(--pace-activities-overlap, 0px) 0);
  clip-path: inset(0 0 var(--pace-activities-overlap, 0px) 0);
}
```

- **Se reutiliza `--pace-activities-overlap`**, que ya vale exactamente
  `dialBottom − cicloBottom − 4px` = distancia del horizonte al fondo del aro. Una sola
  fuente ⇒ recorte y solapamiento no pueden desincronizarse.
- **Se recorta el MARCO, no el `<svg>`**: ese svg lleva `rotate(-90deg)` inline y
  `clip-path` rota con el elemento — un inset inferior le habría cortado el lado izquierdo
  en pantalla. Recortar el marco además cubre el halo `[data-pace-dial-running]::after`
  (círculo `inset:6%` de `tokens.css`), que si no asomaría bajo el horizonte.
- **El contenido nunca se recorta por construcción**: la línea se define desde el bottom
  del CICLO, que es el último hijo del interior del aro, y se mueve con él (idioma, alto
  del CTA, descriptor).
- `clip-path` es puramente visual ⇒ **cero impacto en layout**.

### 2. Solapamiento nominal del 16 % — `app/main/home-geometry.js`

El WIP derivaba el solapamiento del CICLO medido, y el ratio **variaba 0.135 → 0.176**
(a 1920×1080 se salía del contrato 0.14–0.17). Ahora el objetivo es `0.16·D` y el CICLO
actúa solo de **techo de seguridad**:

```js
var maxOverlap = Math.max(0, Math.round(dialBottom - cicloBottom - CICLO_GAP));
var overlap    = Math.min(Math.round(D * OVERLAP_TARGET), maxOverlap);
```

El techo hace falta porque el interior **no puede ser 100 % proporcional**: el CTA tiene un
suelo de 44px por accesibilidad. A D pequeño ese suelo empuja el CICLO hacia abajo; ahí el
techo recorta el objetivo en lugar de tapar el ciclo.

### 3. D lo manda la ALTURA, no el ancho — `app/main/home-geometry.js`

`WIDTH_RATIO = 0.255` (la proporción medida en la captura) → `WIDTH_CAP = 0.42` como mero
techo, arrancando del mayor aro admisible y dejando que el bucle «encoger hasta caber»
encuentre el mayor D sin scroll. `MAX_FIT_PASSES` 6 → 8.

**Por qué.** Fijar D por ancho confundía causa con efecto: en la referencia v0.64 ese 0.255
era CONSECUENCIA de la altura disponible (`flex:1 + 56vh`). Al fijarlo por ancho, a
1280×720 salía D=326 — dejando altura sin usar y, sobre todo, rompiendo el contrato
(ratio 0.135), porque los ~72px fijos del interior (CTA 44 + fila de CICLO) se comen el
16 % cuando D es pequeño.

**Efecto medido:** 1280×720 pasa de D=326 / ratio 0.135 a **D=408 / ratio 0.159**. Y en el
viewport de la referencia (1536×700) sale **D=381** frente a los 392 medidos en la captura
— 3 % de diferencia, con D/W 0.248 vs 0.255.

---

## Corte 2 · el aro se veía reducido a 1366×768

Tras la primera entrega el usuario reportó que **a 1366×768 el aro se ve reducido y pierde
la estructura del diseño**, comparando con una captura suya a mayor altura.

**Diagnóstico:** no era un caso nuevo, era exactamente el límite reportado arriba. Su
pantalla es 1366×768 pero el **viewport real es ~610px**: pestañas + barra de direcciones +
barra de marcadores se comen ~110px. Estaba por debajo del umbral de ~672px, donde el aro
colapsaba a D=256 y el solapamiento a 0.078 — el horizonte prácticamente desaparecía.

**Decisión del usuario (AskUserQuestion, con el desglose de presupuesto delante).** Preguntó
primero si bastaba con compactar al 50 % el hueco entre el selector de modo y el de minutos;
se le respondió con números que **no** (ese hueco mide 18px, liberaría 9 → aro 272, ratio
0.110). Con la tabla de paquetes eligió **«aire puro + tarjeta»**: compactar TopBar, huecos
del selector, paddings de Actividades, zona del enlace y padding vertical de la tarjeta de
Camino. **Sin tocar textos, tamaños de fuente, glifos ni el suelo de 44px del CTA.**

### Implementación: `--pace-home-squeeze` (0 → 1)

`home-geometry.js` publica un factor **progresivo, no un breakpoint**:

```js
sq = clamp(0, (700 - innerHeight) / (700 - 610), 1)
```

- **≥700px de alto ⇒ sq = 0**: compactación CERO. La captura de referencia del usuario
  (~704px) y todo lo que esté por encima quedan **byte-idénticos**. Verificado.
- **610px ⇒ sq = 1**: compactación completa (~66px liberados).
- En medio interpola suave (a 655px, sq = 0.5 y el TopBar mide 56px).

El CSS interpola cada hueco con `calc(base - delta * var(--pace-home-squeeze, 0))`:

| Propiedad | Base | A sq=1 |
|---|---:|---:|
| `[data-pace-topbar]` padding vertical | 14 | 6 |
| `[data-pace-topbar]` **min-height** | 56 | 48 |
| `[data-pace-main-content]` padding-top | 10 | 2 |
| raíz de FocusTimer: padding-top / gap | 8 / 14 | 4 / 6 |
| `[data-pace-activitybar]` padding sup./inf. | 6 / 20 | 4 / 6 |
| `[data-pace-spc-card]` padding vertical | 14 | 10 |
| `[data-pace-spc]` padding-bottom + enlace | 4 + 2 | 0 + 0 |

**El `min-height` del TopBar era el que mandaba**: bajar solo su padding no ganaba nada
(56px de suelo con ~45px de contenido). 48px es el mismo suelo que ya usa el tier móvil.

**Ámbito, con honestidad.** `[data-pace-main-content]` y los bloques de Actividades/Camino
cuelgan de `[data-pace-home-body]` → confinados por selector. **El TopBar no se puede
confinar así**: `[data-pace-home-body]` se renderiza SIEMPRE (los módulos abren como overlay
encima, no lo desmontan), de modo que un `:has([data-pace-home-body])` matchearía siempre y
daría una falsa sensación de confinamiento — se escribió primero así y se corrigió. Se deja
el selector plano: el confinamiento es **de facto**, porque los overlays tapan el TopBar con
`[data-pace-modal-backdrop]` (verificado en runtime), y aunque se viera, 48px siguen
conteniendo sus ~45px sin apretar nada.

## Matriz de aceptación (medición DOM sobre el standalone)

Contrato: `0.14 ≤ overlapRatio ≤ 0.17` · `overflowV ≤ 2` · `overflowH ≤ 2`.

### Desktop (≥769px)

| Viewport | sq | D | D/W | ratio | oV | oH | TopBar | resultado |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| 1920×1080 | 0 | 520 | 0.271 | **0.1596** | 0 | 0 | 64 | OK |
| 1440×900 | 0 | 520 | 0.361 | **0.1596** | 0 | 0 | 64 | OK |
| 1366×768 | 0 | 464 | 0.340 | **0.1595** | 0 | 0 | 64 | OK |
| 1024×768 | 0 | 430 | 0.420 | **0.1605** | 0 | 0 | 64 | OK |
| 1536×704 *(referencia)* | 0 | 387 | 0.252 | **0.1550** | 1 | 0 | 64 | OK |
| 1366×655 | 0.5 | 364 | 0.266 | **0.1484** | 0 | 0 | 56 | OK |
| **1366×610** *(el caso del usuario)* | 1 | **349** | 0.255 | **0.1433** | 0 | 0 | 48 | **OK** |
| 1280×600 | 1 | 335 | 0.262 | 0.1373 | 0 | 0 | 48 | ratio 0.003 corto |
| 1024×600 | 1 | 335 | 0.327 | 0.1373 | 0 | 0 | 48 | ratio 0.003 corto |
| 1024×512 | 1 | 210 | 0.205 | 0.0429 | 0 | 0 | 48 | ratio fuera (sin scroll) |
| 844×390 | 1 | 205 | 0.243 | 0.0341 | 119 | 0 | 48 | ratio fuera + scroll |

**Ganancia del corte 2:** 1366×610 pasa de D=256 / ratio 0.078 a **D=349 / ratio 0.1433**
(+36 % de diámetro) y su **D/W queda en 0.255, idéntico al de la captura de referencia**.
1024×512 **pierde el scroll** (63 → 0) y 844×390 lo reduce de 185 a 119px.

### Móvil (≤768px — bloque Desktop NO aplica; `clip: none` verificado)

| Viewport | D | D/W | solapamiento de la tarjeta | oV | oH | chips/filas |
|---|---:|---:|---:|---:|---:|---|
| 412×915 | 354.3 | 0.860 | — | 0 | 0 | 4/2 |
| 393×852 | 338.5 | 0.859 | 0.1218 | 0 | 0 | 4/2 |
| 375×667 | 322.7 | 0.860 | — | 0 | 0 | 4/2 |
| 360×640 | 309.6 | 0.860 | 0.0866 | 9 | 0 | 4/2 |

D/W móvil 0.859–0.860, dentro del 0.82–0.87 pedido. Los 9px de 360×640 son
**preexistentes** (medidos igual en el baseline v0.68.0 antes de tocar nada).

### Variantes y estados

- **EN + paleta oscura** a 1536×700: D=381, ratio 0.1522, clip 58px, oV/oH 0 — idénticos a
  ES claro. Geometría independiente de idioma y tema.
- **En marcha** (CTA «Pause», halo activo): D, ratio, clip y overflow sin cambio.
- **En pausa** («Continue» + «Restart focus» en la MISMA fila, s124): sin cambio de altura
  del interior ⇒ el horizonte no se mueve.
- CTA 44px en todos los viewports; consola sin errores.

---

## Incumplimiento residual (no se maquilla)

El corte 2 **resolvió el caso real del usuario** (1366×610 entra en contrato) y recuperó
1024×512 del scroll. Queda esto:

- **1280×600 y 1024×600: ratio 0.1373**, tres milésimas por debajo del suelo de 0.14. Se
  podría cerrar con ~3px más, pero solo quedan knobs que el usuario excluyó explícitamente
  (densidad de los chips, contenido de la tarjeta). **No se excede el paquete aprobado en
  silencio**: la diferencia es visualmente indistinguible.
- **1024×512 (0.0429) y 844×390 (0.0341, con 119px de scroll)**: alturas extremas donde la
  aritmética no da. El interior del aro tiene ~72px FIJOS (CTA 44px por a11y + fila de
  CICLO); el hueco libre bajo el CICLO es `(D − H)/2 − 4` con `H ≈ 0.485·D + 72`, así que
  `0.16·D` exige **D ≥ 413** y `0.14·D` exige **D ≥ 342**. A 390px de alto no cabe.

Alternativas descartadas y por qué:

- Subir el solapamiento igualmente ⇒ **taparía los puntos de CICLO** (§5 lo prohíbe). El
  techo de seguridad existe justamente para impedirlo.
- Encoger el CTA por debajo de 44px ⇒ rompe accesibilidad (§7 lo prohíbe explícitamente).
- Seguir compactando ⇒ ya solo queda densidad de contenido, fuera del paquete aprobado.

En ese régimen la degradación es **gradual y segura**: el aro encoge, el solapamiento se
reduce (nunca tapa el CICLO) y la composición se conserva.

---

## Verificación de integridad

- `git diff --check` limpio.
- Ningún archivo de lógica tocado: sin cambios en motor del temporizador, contabilidad,
  persistencia, Caminos, PathRunner, Respira, runners de Mueve/Estira, Stats, logros,
  entitlement, gating ni eventos. `state-core.jsx` solo lleva el bump de `PACE_VERSION`;
  `TimerDial.jsx` solo atributos `data-pace-dial-*` presentacionales.
- Artefactos regenerados y comprobados: `PACE_standalone.html` (3236 KB) e `index.html`
  contienen `--pace-activities-overlap` (8 apariciones), la regla `clip-path` y
  `OVERLAP_TARGET`.
- `CACHE_NAME = 'pace-v0.69.0'`.

---

## Deuda y siguiente

- **1280×600 / 1024×600 en 0.1373** (0.003 bajo el suelo): solo se cierra tocando densidad
  de chips o contenido de la tarjeta, excluidos del paquete aprobado. Decisión del usuario
  si se quiere apurar.
- **Alturas extremas (≤512px)**: aceptadas como excepción documentada (§32.6 del audit).
- El preview embebido de Claude Code **no sirve** para validar esta geometría (pane nativo
  735×307): toda la aceptación se hizo por medición DOM. Falta la pasada en navegador real
  del usuario (Chrome/Edge/Firefox) y la validación PWA pendiente desde s102.
- `FocusTimer.jsx` sigue en 449 ln; sin cambios esta sesión.
