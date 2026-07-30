# Sesión 139 — Respira: remate visible + Fase 1.6 (ajustes)

**Fecha:** 2026-07-30 · **Versión:** v0.72.0 → **v0.73.0** · Sesión de **CÓDIGO**.

Dos bloques: (A) rematar lo visible de Respira que quedó de s138, (B) los cuatro
ítems de la Fase 1.6. Más dos bugs que el usuario reportó en vivo durante la
sesión y un **revert** que hay que contar entero.

---

## Bloque A · Respira

### A1 — REGRESIÓN de s138: el visual no cabía · RESUELTO

**Diagnóstico del usuario, confirmado en el código y luego medido.** Tres
síntomas reportados («el círculo está muy arriba» · «apareció una barra de
scroll» · «el aro se corta por arriba con el scroll bajado») que son **un solo
hecho**: `wrapLoto` pedía `min(400px, 84vw, 56vh)` y `vh` es la VENTANA, no el
hueco donde vive el visual.

**Modelo derivado y verificado en cuatro alturas:**

```
centerH  = vh − padding − header − footer
contenido = visual + 32 + texto(118,6) + 32 + barra(5)
```

| Viewport | `centerH` | Contenido | Desborde | Barra |
|---|---|---|---|---|
| 1280×800 | 644,4 | 587,5 | 0 | no |
| 1280×740 | 584,4 | 587,5 | **4** | 15 px |
| 1280×720 | 564,4 | 587,5 | **24** | 15 px |
| 1366×660 | 534,4 | 557,2 | **23** | 15 px |

**Umbral: por debajo de ~743 px de alto SIEMPRE desbordaba.** Un portátil de
1366×768 con barra de navegador (~660 útiles) cae de lleno dentro. El modelo se
validó por **predicción**: a 1280×740 predijo ~3 px y midió 4 (el `scrollHeight`
redondea al entero superior).

**Por qué el invariante de s138 no protegía:** «el wrap reserva el máximo» protege
al visual de recortarse contra SU PROPIA caja, no contra el presupuesto vertical
de la pantalla.

**Arreglo:**
1. El visual se dimensiona por **alto** (`height: min(400px, 84vw)`) y el ancho lo
   deriva `aspect-ratio`; es el único elemento **elástico** del centro
   (`flex: 0 1 auto`, suelo `min-height: 160` — el tamaño del `core` de los otros
   estilos, con precedente en el archivo). El texto y la barra llevan
   `flexShrink: 0` para que el déficit caiga siempre en el círculo y no dependa
   del reparto automático.
2. `centerBody` pasa a `flex: 1 1 auto` + `justify-content: safe center`,
   confinado con `:has([data-pace-breathe-visual])` — **patrón s125**. El `safe`
   es el cinturón: si ni con el suelo cabe, vuelve a alinear arriba en vez de
   recortar por los dos lados (que es lo que el comentario de s112 evitaba con
   `margin:auto`). El runner v1 y sus alturas reservadas de s119 **no se tocan**.
3. **Aire mínimo garantizado** (`padding-block: 12px`): sin él, en cuanto el
   contenido cabía por los pelos el visual se quedaba a tamaño máximo y se pegaba
   al header (medido: 2,4 px de aire a 1280×720). Es simétrico, así que en
   pantallas holgadas no mueve nada.

**Regla de scroll elevada a decisión del usuario:** ninguna actividad en curso
enseña barra. La regla de s125 se **mudó** de `MoveSessionV1.support.jsx` a
`SessionShell.responsive.js` aplicada a todo `[data-pace-session-center]`, y en su
sitio original queda el diagnóstico + un aviso de no reintroducirla. Las
bibliotecas son modales de Primitives, así que conservan su barra (aceptado).

**Feedback en vivo del usuario mientras se trabajaba** («el icono sigue un poco
arriba» + «has bajado demasiado las barras de progreso»): los dos son **el mismo
hueco muerto**, medido — el wrap reserva su tamaño completo pero el aro exterior
está a `inset 14%` (pinta el 72 %) y con las escalas reales oscila entre el 65 %
y el 94 %, dejando ~42 px vacíos por lado de media. Se reclama con un **margen
negativo INFERIOR**: al re-centrarse el bloque, el círculo baja la mitad de lo
reclamado y la barra sube la otra mitad. El tope es **aritmético**: a escala
máxima al aro le sobran `0,014·W` (~5,6 px en 400), así que
**N ≤ gap − 2,4** ⇒ el reclamo va **atado al tier** (−28 / −16 / −10). Con 28 fijo
la holgura medida caía a 6,4 px y el aro habría rozado el texto en el patrón
fisiológico.

**Verificación final** (peor caso muestreado con **Suspiro fisiológico**, el único
patrón que llega a escala 1,35, con las tres fases observadas):

| Viewport | Visual | Aire sobre el aro | Holgura aro↔texto | Desborde | Barra |
|---|---|---|---|---|---|
| 1920×880 | 400 | 100,2 | 26,0 | 0 | 0 |
| 1280×720 | 380,9 | 21,8 | 18,6 | 0 | 0 |
| 1366×660 | 374,9 | 14,7 | 12,1 | 0 | 0 |
| 1280×560 | 312,6 | 13,7 | 11,1 | 0 | 0 |
| 360×800 | 302,4 = 84vw | — | — | 0 | 0 |

**Móvil sin cambio de tamaño**: el visual lo capa el ANCHO (`84vw`), no la
altura — coherente con que el usuario reportara el móvil como perfecto. Lo único
que se mueve allí son los 28 px del reclamo (círculo −14, barra +14); queda
avisado y es reversible con un gate de ancho si lo prefiere intacto.

### A2 — Banding · PARCIAL, y con un revert

Se trataron los **dos radiales que faltaban** (`BreatheSession` círculo de
retención · `BreatheVisual` halo): pasan de 2 paradas sin dither a la **rampa
compartida de cinco paradas** (`paceGlowRamp`, la curva de s138 renormalizada) +
capa de dither (`PaceDither`, con máscara para que el ruido no forme un disco de
borde duro). El grano se **extrajo a un solo sitio reutilizable** en
`SessionShell.jsx`, como se pidió, y reproduce la cadena de s138 **byte a byte**
con los argumentos por defecto (verificado), así que la atmósfera quedó
demostradamente intacta.

**Modelo cuantitativo del banding** (verificado contra el DOM): el número de
escalones lo fija el color, no la forma de la rampa. `--breathe-soft` sobre
`--paper` recorre **15,72 niveles** de 8 bits en el canal azul ⇒ **3,5 px por
banda** en el círculo de retención (140 px) y **6,8 px** en el halo (288 px).
Alpha máximo tras el cambio: **0,12**, sin tocar (regla s100).

**LO QUE NO QUEDÓ RESUELTO — y es lo que el usuario ve.** Reportó que en PC se
siguen viendo las bandas. Al medirlo:

- **La atmósfera es el peor caso de los tres y no la había tocado**: apila el
  MISMO degradado dos veces ⇒ alpha efectivo `1−(1−0,12)² = 0,2256`, recorre 29,6
  niveles sobre una rampa de ~353 px ⇒ **11,9 px por banda**, casi el doble que
  el halo.
- **El grano de s138 no dithera**: σ medido **0,639 niveles**, por DEBAJO del
  escalón de 1 nivel que debe enmascarar, y baja la media 1,18 (es más un velo
  oscuro que ruido).
- **Causa de fondo encontrada**: los filtros SVG operan por defecto en
  **linearRGB**. Forzar `color-interpolation-filters='sRGB'` sube σ de 0,639 a
  1,004 con la misma opacidad. Y el `baseFrequency` **no influye** en la amplitud
  (0,639 a 1,4 contra 0,636 a 0,9): el ajuste de frecuencia de s138 no movió la
  aguja.

Se probó la receta que medía bien —tile **opaco** de ruido centrado en gris medio
en sRGB compuesto en `overlay`: σ 1,641 y desvío de la media −0,47, verificado en
ambas paletas— y **se revirtió porque rompía el loto**. Motivo: el contenedor del
halo lleva `opacity` variable ⇒ stacking context AISLADO ⇒ un `mix-blend-mode` sin
backdrop pinta el gris opaco tal cual, y aparecía un disco gris sobre el mandala.
Además el `background-blend-mode` de la atmósfera **sí** se aplicó y no resolvió
lo que se ve en pantalla, así que la hipótesis tampoco estaba cerrada.

**Estado: el banding de la atmósfera sigue abierto.** Las mediciones quedan en el
comentario de `SessionShell.jsx` como punto de partida. Regla aprendida: un tile
opaco solo es viable donde haya backdrop garantizado (entre capas de `background`
del MISMO elemento), nunca dentro de subárboles con opacidad.

### A3 — La 2ª capa del loto leía como zoom · RESUELTO

El diagnóstico NO era que faltara giro (contragiraba desde s138), sino que no se
notaba, por dos motivos medibles: a 450 s/vuelta una hoja del mandala tarda 28 s
en ocupar el sitio de la anterior, y a opacidad 0,10–0,16 la capa es un susurro.

Se atacan los dos sin tocar el loto principal:
- contrarrotación **450 s → 300 s** (medido: 23,68° en 20 s frente a los 24°
  predichos). Lo que percibe el ojo es la velocidad RELATIVA entre los dos
  mandalas: 3,2 °/s ⇒ una hoja cada ~7 s.
- **`pace-loto-vela`**: la transparencia también se mueve. Multiplica la opacidad
  de fase, así que el techo **no sube** — medido, opacidad efectiva 0,066–0,153
  contra el 0,16 de s138: solo se abre el suelo. Periodo 17 s, que no es múltiplo
  de ningún ciclo del catálogo (4/8/10/12 s) para que nunca se sincronice con la
  fase y lea como profundidad propia.

Invariantes de s138 intactos: un solo factor de escala, el wrap reserva el máximo,
el giro es animación CSS y nunca sale de `progress`, y el freno de reduced-motion
vive en el JSX y ahora corta las dos animaciones de una vez.

### A4 — Los aros · DECIDIDO SIN CAMBIO

Se le presentaron tres direcciones con el loto y los tokens reales, en dos rondas
(comparativas HTML generadas con `scratchpad/build-aros.js` y `build-aros2.js`).
**Descartó marcas y enso**, y con un criterio que conviene anotar: los dos
**miden** —las marcas son una escala graduada, el enso tiene principio y fin y lee
como arco de progreso— y en una guía de respiración eso invita a mirar la medida
en vez de a respirar. Es el mismo criterio por el que s107 sacó el cronómetro de
la retención.

**Decisión: se mantienen los dos hairlines.** Queda pendiente para sesión futura
la opción «sin aro + loto grande», ya medida: el loto puede subir de `inset 25,5 %`
a `14 %` —el sitio que ocupa hoy el aro— y crece **+46,9 % de diámetro** sin
romper el invariante `(1 − 2·inset) × 1,35 ≤ 1`.

---

## Bloque B · Fase 1.6

### B1 + B2 — Ocultar estilo de timer y «orgánico», con migración

`app/flags.js` **nuevo**: un sitio único para las banderas, con la razón de
conservar el código escrita en la cabecera para que nadie lo tome por muerto.
`SHOW_TIMER_STYLE` y `SHOW_BREATH_ORGANICO` en `false`.

Lo que hace que esto funcione: **la misma bandera gobierna la UI y la migración**.
`loadState` normaliza el valor huérfano leyendo esa constante, así que devolverla a
`true` reabre el selector Y detiene la migración en el mismo gesto, y las dos
mitades no pueden desincronizarse. Precedente: la paleta `envejecido` de s71 se
migró igual pero **sin** bandera, es decir sin vuelta atrás.

**Verificado** con una instalación ATRAPADA sembrada a mano
(`timerStyle:'analogico'`, `breathStyle:'organico'`): en memoria salen `aro`/`flor`
mientras `localStorage` conserva los viejos hasta el primer `set()` (idéntico a
s71, idempotente). Y la ida y vuelta: con las banderas en `true` reaparecen «Barra»
y «Orgánico»; en `false` desaparecen. Los ejes se **filtran**, no se comentan, para
que reactivarlos no exija tocar `TweaksPanel`.

### B3 — Bug del botón fantasma · MEDIDO ANTES DE TOCAR, hipótesis CONFIRMADA

La sospecha de s135 era correcta y la medición añadió el matiz que decidió el
arreglo. Muestreando la transición de las pastillas del descanso entre series:

- el `font-weight` recorre **41 valores fraccionarios** (400 → 400,25 → … →
  483,5 → 500): `transition:'all'` estaba animando el peso de la fuente;
- pero el **ancho solo toma DOS valores** (Tranquilo 95,88 → 93,86 · Amplio
  82,05 → 83,76).

O sea: **el peso se interpola de forma continua mientras la métrica salta**.
`Inter Tight` va self-hosted en caras estáticas (s105), no hay un 436,5 que
pintar, así que el trazo salta de golpe a mitad de vuelo mientras el color sí va
suave, y la pastilla pega un tirón de ~2 px que desplaza a su vecina. Dos cambios
donde debía haber uno.

**Arreglo:** transición explícita por propiedades (`TWEAKS_PILL_TRANSITION`), en
las **cinco** filas de pastillas del panel —no solo en la del descanso— y en
`statsPanelTabStyles.tab`, donde el mismo patrón no daba tirón de ancho (los tabs
son `flex:1`) pero el trazo saltaba igual.

**Verificación por predicción:** 41 valores → **2**; el cambio de peso pasa de
mitad de vuelo a **t = 24 ms** con el clic en t = 20, el mismo instante que el
ancho.

### B4 — Idioma «Auto»

`state.lang` sigue siendo **siempre** un idioma real; el modo vive en
`state.langAuto` y `loadState` lo **resuelve en cada arranque**. Si `lang` valiera
`'auto'`, `useT` buscaría `PACE_STRINGS['auto']` y caería a inglés en cada clave.

El default de `langAuto` en `defaultState` es **false a propósito**: `loadState`
hace `{...defaultState, ...parsed}`, así que ponerlo a true pasaría a Auto a toda
instalación existente y les borraría su elección. El `true` va solo en la rama de
instalación nueva.

**Tres casos verificados:**
1. Instalación existente con `lang:'en'` y navegador en `es` → conserva `en`,
   `langAuto:false`.
2. Instalación nueva → `langAuto:true` y `lang` = detectado.
3. Auto con `lang` guardado obsoleto → se **re-evalúa** al arrancar (`en` → `es`).

**`secret.bilingual`, que era el riesgo señalado:** el watcher ignora el cambio si
`langAuto === true`. Verificado con su control al lado — elegir «Auto» cambia el
idioma y **no** da el logro; elegir después «English» a mano **sí** lo da. Los
arranques en Auto ya eran inofensivos porque se resuelven antes de montar, así que
`prevLangRef` nace con el valor final.

---

## Extras del usuario en vivo

- **BreakMenu: la tarjeta «Para ti» descuadraba la fila.** El `<Tag>` se montaba
  solo en la recomendada y la tarjeta es flex column con `gap:12`, así que empujaba
  su glifo y su título respecto a la vecina. **Altura reservada** (decisión s119,
  el mismo arreglo que el contador de Respira en s138). Medido: los cuatro títulos
  a **102 px** del borde de su tarjeta, dispersión **0**.

---

## Deuda de tamaño atendida

Los cambios de A1–A3 dejaron `BreatheVisual.jsx` en **512 líneas**, por encima del
tope de 500 de CLAUDE.md. Se troceó con el patrón `*.support.jsx` ya existente:
la hoja inyectada (keyframes, tinta por paleta, reparto de alto) pasó a
**`app/breathe/BreatheVisual.support.jsx`** (117 ln) y el componente queda en
**421**. Registrada en `PACE.html` justo después de su componente.

---

## Verificación

Checklist de cierre de CLAUDE.md, todo pasado:

- Pomodoro cuenta y termina → **BreakMenu abre** (overlay z-100, 1 min acreditado,
  ciclo 1).
- Respira: librería · modal de seguridad · sesión animada · pantalla de retención.
- Mueve: librería · runner v1 con pasos y cue.
- Hidrátate: +/− y persiste en `localStorage`.
- Logros: 5 desbloqueados con sus toasts (`first.sip`, `first.step`, `first.day`…).
- Tweaks: la paleta cambia `--paper` (`#F2EDE0` → `#1d1a14`).
- Recargar → el estado persiste.

**Bug propio introducido y corregido en la sesión:** al mudar la regla de scroll
dejé un comentario **dentro de un template literal** con backticks, que lo cerraban
y rompían `MoveSessionV1`. Detectado en consola, corregido, y verificado con un
centinela (`console.error` como marca) que separa lo stale del buffer del pane —
deuda de entorno s112/s119— de lo vivo: **todos los errores del runner son
anteriores al centinela y después no hay ninguno**. Queda un aviso en el archivo.

Consola limpia salvo el warning **PREEXISTENTE** de s116
(`PaceLogoImage`/`BreatheSession`), que es de la Fase 8.5.

**Artefactos:** `index.html` regenerado a **v0.73.0**. `PACE_standalone.html`
restaurado **byte-idéntico** tras el build (hash `061967ee…` antes y después) —
decisión s134: export bajo demanda.
