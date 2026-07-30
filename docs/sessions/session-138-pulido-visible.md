# Sesión 138 — Fase 1.5 · Pulido visible

**Fecha:** 2026-07-30 · **Versión:** v0.71.0 → **v0.72.0** · **Tipo:** CÓDIGO
(la primera tras nueve sesiones solo-documentales, s129–s137)

Ejecuta la **Fase 1.5** de la sección «Camino a v1.0» de [`ROADMAP.md`](../../ROADMAP.md).
Cuatro ítems previstos + cinco correcciones que salieron del feedback del usuario **durante**
la sesión, todas sobre el visual de Respira.

---

## Decisión de entrada: el pomodoro-sol NO entra

La propuesta de s134 (enriquecer el pomodoro como sol amaneciendo) estaba registrada como
**PROPUESTA NO APROBADA y sin fase asignada**. Se decidió **dejarla fuera de esta sesión**, con
cuatro razones y una que pesa sobre las demás:

1. La 1.5 se definió como «bajo riesgo y efecto inmediato»; el sol es un rediseño.
2. Regla del plan: un solo frente por sesión.
3. Toca el terreno que s126/s128 midieron y cerraron — un `translateY` del aro convive con el
   `clip-path` del horizonte y con la garantía de scroll cero: verificarlo son 5 viewports × 2
   pieles.
4. **Habría impedido medir el ítem 1.** El bug del punto guía es un desfase de milisegundos en
   ese mismo aro; meter una animación nueva encima en el mismo cambio destruye la medición.

Queda como **candidata a sesión propia, por detrás de la Fase 2** (el bloqueante declarado son
Mueve y Estira; el sol es enriquecimiento, no arreglo). **No se abre el plan por ella.**

---

## 1 · BUG del punto guía del pomodoro — MEDIDO y corregido

El encargo pedía explícitamente medir antes de asumir. Se instrumentó el SVG con un
`MutationObserver` (el muestreo por `requestAnimationFrame` resultó inservible: el panel de
preview pinta a ~3 fps, así que se pasó a observar los **renders de React**, que es la señal
determinista).

| Preset | Primer avance del ARCO | Montaje del PUNTO | Desfase |
|---|---|---|---|
| 25 min | 1025 ms | 2028 ms | **1003 ms** |
| 45 min | 1014 ms | 3013 ms | **1999 ms** |

**Causa confirmada por PREDICCIÓN, no por parecido:** el gate `progress > 0.001`
(`TimerDial.jsx:110`) se traduce en un número de segundos distinto según la duración —
`0.001 × 1500 s = 1,5 s` ⇒ el punto espera al segundo 2; `0.001 × 2700 s = 2,7 s` ⇒ al segundo 3—
mientras el arco avanza **siempre** en el segundo 1. Se predijo 2000 ms para 45 min antes de
medirlo y salieron **1999**.

`progress` es `1 - remaining/totalSec` (`FocusTimer.jsx:93`): aritmética exacta que vale 0 clavado
en reposo, así que el umbral **no protegía de ruido de coma flotante**. Fix: comparar contra `0`.

**Verificado tras el fix, con comprobación previa de que el código servido era el nuevo:**
desfase **0 ms en los cuatro presets** (15, 25, 35, 45).

---

## 2 · Atmósfera en los ejercicios sueltos — cambia la decisión s99

El wash de color de la franja superior estaba **confinado a Caminos por decisión explícita de
s99**. El código estaba entero: el helper `sessionAtmosphere` y un gate `inPath ?` en tres sitios.

Se retira el gate en `BreatheSession.jsx:29`, `MoveModule.jsx:67` y `MoveSessionV1.jsx:38`. El
color sigue saliendo del `kind`.

**Verificado en runtime:** Respira `rgba(201,122,93,.12)` = `--breathe-soft` · Mueve `--move-soft`
· Estira `--extra-soft`, con las dos capas del wash y el grano anti-banding de s100 intactos.

---

## 3 · Constructor premium en Mueve Y Estira

Vivía solo en Mueve y **al final de la lista**, tras 4 grupos de tarjetas: por eso no lo
encontraba nadie.

- `CustomRoutinesSection` gana prop `accent` y los **5 sitios** con `var(--move)` fijo pasan a
  usarlo (borde de hover, `+`, `Card accent`, `Tag`, cifra de minutos).
- Entra en `ExtraLibrary` con `var(--extra)` y **sube al primer lugar** en las dos bibliotecas.

**Decisión preguntada al usuario y respondida: SIN campo de módulo.** Argumento que apareció al
leer el código: el registro de ejercicios **ya mezcla los 8 grupos** de Mueve y de Estira (empuje,
piernas, core **y** cuello, columna, caderas, muñecas), así que una rutina propia no pertenece a un
módulo y obligarla a elegir inventaría una taxonomía falsa. Cero migración. El aside lo dice en voz
alta: **«En Mueve y en Estira»** / «In Move and Stretch».

**Hallazgo no previsto, corregido:** `handleStartExtra` marcaba `kind:'extra'`, que acredita por
`completeExtraSession` — y esa **no incrementa `moveSessionsTotal`** (`state-achievements.jsx:214`).
Quien hiciera sus rutinas propias desde Estira **nunca progresaría hacia `move.sessions.25`**, y
además desbloquearía `first.extra` en vez de `first.stretch`. Las rutinas propias se enrutan al
crédito de siempre (decisión s93 intacta). Consecuencia aceptada y anotada: la sesión se pinta con
el acento de Mueve aunque entres por Estira.

**Verificado:** sección primera de 5 en ambas bibliotecas · acento `rgb(154,123,79)` en Mueve y
`rgb(107,122,143)` en Estira en los tres sitios · lanzada desde Estira, la atmósfera sale
`--move-soft` ⇒ `kind='move'`. El estado de pruebas se restauró byte a byte (15 802 chars).

---

## 4 · El loto de Respira

### El asset: máscara, no imagen

Medido con `sharp` antes de decidir nada:

- el **alfa** del PNG es solo la **silueta** (histograma bimodal: 112 985 px a ~0 y 146 964 a 224+)
  ⇒ enmascarar por alfa daba **una mancha sólida** y perdía el dibujo;
- el **dibujo** (capas de pétalos, semilla de la vida) vive en la **luminancia** (L 76–255, media
  219).

Por eso `scripts/ingest-loto.js` reconstruye la máscara desde la **densidad de tinta**
`(255−L)/(255−76)`, acotada por el alfa original, y aplana el RGB a blanco. **El color lo pone un
token**, así que el contraste queda garantizado sin tocar el arte: era invisible sobre papel crema
por ser crema sobre crema.

959 KB → **146 KB** (640×640). El primer intento pesaba 59 KB con `alphaQuality 65`, y el usuario
reportó pixelado: **comprimir con pérdida el canal donde vive el dibujo lo motea por bloques**
(comparado a 3×). No era resolución — el loto se pinta a ~275 px CSS como mucho. Alfa **sin
pérdida**.

### Integración

Sustituye al estilo **`flor`** (mismo id, arte nuevo): cero migración y el default ya era una flor
(`state-core.jsx:34`). Retira los 6 pétalos SVG y el núcleo con degradado — el mandala trae su
propio centro. Etiquetas i18n a «Loto» / «Lotus».

`build-standalone.js` deja de estar cableado al directorio de láminas y recorre una **lista de
carpetas de arte**; `sw.js` precachea el loto.

### Las cinco correcciones del feedback en vivo

1. **Se recortaba por arriba.** El wrap declaraba 260×260 mientras las capas pintaban **420×420**
   (insets negativos): el aro exterior llegaba a `y=60` con el área de scroll empezando en `y=66`.
   Wrap propio `min(400px, 84vw, 56vh)` con las capas **dentro**, en `inset` %.
   **Invariante:** `1 − 2×0,14 = 0,72` y `0,72 × 1,35 = 0,972` ⇒ nada rebasa el wrap ni a escala
   máxima (1,35 del patrón fisiológico).
2. **Cada capa iba a su ritmo.** Combinaban bases y factores distintos (340×0,95·s · 300×1,0·s ·
   260×0,85·s): los huecos pasaban de 10/36 px a 15/51 px, **+44 % al inhalar**. Ahora las tres
   comparten `scale` y el tamaño se fija solo con el `inset`.
3. **El giro saltaba cada segundo.** Iba montado sobre `progress`, que avanza **una vez por
   segundo**, y con una transición de la duración de la fase: cada paso arrancaba una transición de
   ~4 s que no terminaba antes del siguiente; y al cambiar de fase `progress` volvía de 1 a 0, así
   que además contragiraba. Pasa a **animación CSS continua** (`pace-loto-giro`, 180 s) en un
   elemento aparte.
4. **En claro no se sentía premium.** `--breathe` sobre papel crema con la densidad baja de la
   máscara quedaba lavado. La tinta pasa a `--breathe-2` (#A85E43) en claro y se conserva
   `--breathe` en oscuro, vía CSS por paleta — **no en el JSX**, que no debe saber qué paleta hay
   puesta. (El `background` inline hubo que quitarlo del objeto de estilos: ganaba a la hoja.)
5. **Profundidad y respiración asimétrica** (idea del usuario): halo de luz que se recoge y se
   abre, **loto de fondo mayor girando al revés y 2,5× más despacio** (dos mandalas iguales a
   velocidades opuestas dan un brillo lento que lee como volumen), y el eje vertical recorre la
   excursión entera mientras el horizontal solo el 88 %, elevándose al llenarse. Curva
   **easeInOutSine** en vez de `--ease` (que es la curva de UI de Material: sale rápido y frena
   largo, bien para un CTA y mal para un pulmón).

**Reduced motion:** el subtree es `data-pace-essential`, exento del kill global (s89). Correcto
para la escala —es la guía— pero **no** para el giro. El kill de CSS además no serviría: pone
`animation-duration: 0.01ms`, que en una rotación infinita la dispararía a velocidad absurda. El
freno vive en el JSX. **Verificado:** con reduced-motion el giro queda en `none` y la escala sigue
recorriendo 0,912 → 1,3.

---

## Correcciones extra reportadas en vivo

### Salto de texto en Suspiro fisiológico

Medido: el label mantiene 44 px de alto pero su `top` se movía **21 px** entre fases. Causa:
`showCountdown = current.duration >= 4` (`BreatheSession.jsx:324`) **montaba y desmontaba** el
contador — en el suspiro «Inhala» dura 2 s, «Inhala más» 1 s y «Exhala» 5 s, así que solo aparecía
en la exhalación, y como el bloque va centrado con `margin:auto` movía todo el texto.

Fix por **altura reservada** (decisión s119): el hueco existe siempre y solo se oculta el número,
con `visibility:hidden` para que además salga del árbol de accesibilidad.
**Verificado: salto 0 px** en las tres fases.

### Banding de la atmósfera en PC

El remedio de s100 bastaba dentro de Caminos, pero al llevar la atmósfera a las sesiones sueltas
se ve en pantallas grandes: la **misma rampa repartida entre más píxeles** hace que cada peldaño de
8 bits ocupe más ancho (reportado en PC y no en móvil, coherente con la causa). Respetando la regla
de s100 de **no subir alphas**, se actúa sobre el dither y la forma de la rampa: grano más fino
(`baseFrequency` 0.9 → 1.4, opacidad 0.04 → 0.055) y **cinco paradas explícitas** en vez de dos +
hint, para que no quede ningún tramo largo donde el redondeo salte. Afecta también a Caminos, que
comparten el helper.

---

## Verificación

- Punto guía: desfase **0 ms** en 15/25/35/45.
- Atmósfera: los tres módulos con su token correcto, 2 capas + grano.
- Constructor: primero en ambas bibliotecas, acento correcto, crédito enrutado.
- Loto: invariante del wrap OK a escala 1.35 (`Suspiro fisiológico`), sin scroll, en
  **735×694 · 375×812 · 1024×560**; giro continuo (0,815° cada 400 ms); reduced-motion correcto;
  crema y oscuro.
- Los **5 estilos** de respiración siguen renderizando (`flor`, `ondas`, `petalo`, `organico`,
  `pulso`).
- `index.html` regenerado y verificado **en el artefacto**: loto y láminas como **archivo**, cero
  data URIs, `<link rel="manifest">` presente, sin Babel, visual completo.
- **`PACE_standalone.html` NO se regenera** (decisión s134): se restauró a v0.71.0 tras el build.

**Consola:** limpia salvo un warning **PREEXISTENTE** —`Cannot update a component (Sidebar) while
rendering a different component (BreatheSession)`—, de s116; el diff de esta sesión en ese archivo
no añade ninguna escritura de estado. Anotado para la **Fase 8.5**.

---

## Pendiente / abierto

- **Los aros**: el usuario los flagó dos veces («el doble círculo simple funciona pero se puede
  mejorar»). Esta sesión les añadió halo, profundidad y respiración asimétrica, pero **siguen
  siendo dos hairlines**. Falta dirección del usuario sobre qué quiere en su lugar.
- **Warning de `Sidebar`/`BreatheSession`** → Fase 8.5.
- **Pomodoro-sol** → sesión propia, por detrás de la Fase 2.
