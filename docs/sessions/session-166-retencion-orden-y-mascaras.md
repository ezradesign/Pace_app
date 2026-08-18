# Sesión 166 · La retención, el orden único y el mecanismo de las máscaras

**v0.95.0 → v0.96.0** · 2026-08-18

Cuatro frentes que el usuario pidió en dos tandas, y una lección que los cruza
todos: **de las once mentiras de esta sesión, nueve fueron del instrumento y no
del producto**, y las nueve se cazaron midiendo, no mirando.

---

## 0 · El estado que se encontró no era el que se declaró

El arranque decía «`npm run test:e2e` da 72/72». **Daba 68.**

Tres pasadas sobre el mismo árbol, sin tocar una línea:

| Pasada | Resultado | Reloj |
|---|---|---|
| suite completa (8 workers) | 68 passed / 4 failed | 2,2 min |
| suite completa, repetida | 70 passed / 2 failed | 2,0 min |
| `respira-progreso.spec.js` sola | 5 passed | 29,5 s |

Los cuatro fallos eran **siempre** de `respira-progreso.spec.js` y **siempre
`Test timeout of 60000ms exceeded`**. La pasada 2 dio el número que lo explica,
en los que *sí* pasaron: **58,0 s y 59,6 s contra un `timeout: 60_000`**.

La variable está en `playwright.config.js:47` — `workers: process.env.CI ? 2 :
undefined`, y `undefined` son **8 workers** en esta máquina de 16 hilos. El
control lo cierra:

| Condición | Resultado | Reloj |
|---|---|---|
| 8 workers | 68/72 y 70/72 | 2,2 / 2,0 min |
| **2 workers (lo del CI)** | **72/72** | **1,0 min** |

**A 2 workers no solo sale verde: sale al doble de velocidad.** La configuración
por defecto en local es peor en los dos ejes. El `72/72` del arranque y el
`68/72` de aquí son los dos ciertos, y el CI lleva verde desde s165 por correr
en la condición tranquila — la regla de «un control más tranquilo que el fallo
no es un control», aplicada al instrumento.

**Queda SIN ARREGLAR**, esperando decisión del usuario entre (i) capar workers en
local, (ii) subir el plazo de esa spec —que s165 rechazó por escrito— y (iii)
abaratar los cuatro tests. Toda la sesión se corrió con `--workers=2`, **sin
tocar la config**.

---

## 1 · El CTA del Pomodoro en Pausa y Larga

La etiqueta dependía solo del estado del motor, nunca del modo, así que sobre un
reloj de 5 min invitaba a «Empezar foco». Nueva clave `focus.startPause` y **una
sola constante `startLabel`** usada en los dos sitios que arrancan —idle y
completed—, porque tenerlas separadas fue justo como nació el desajuste.

`scripts/audit/banco-cta-pomodoro.js` mide los **12 casos**: `{foco, pausa,
larga} × {es, en} × {claro, oscuro}`. 0 discrepancias.

> **El usuario reportó que seguía roto** y adjuntó capturas. Eran de
> `paceweb.pages.dev`, el sitio **publicado**: el arreglo vivía sin commitear en
> el árbol local. No había nada que arreglar, había algo que explicar.

---

## 2 · ¿Cabe la barra de Respira en móvil?

s165 lo dejó declarado como no cubierto, con una sospecha escrita: «con
`maxWidth: 260` el caso de 5 rondas aprieta más».

**Cabe de sobra.** Caso peor (Rondas profundas, 5 rondas) a 320×568: barra de
260 px, **5 segmentos de 48,8 px** y **100 px de holgura** por debajo. 16 escenas,
0 fuera de vista.

### La primera versión del banco era una tautología

Medía «¿desborda la fila a su padre?» — y la barra es `width: 100%` **de ese
padre**, así que no puede desbordar nunca. Se saboteó la fuente subiendo
`maxWidth` de 260 a 600: la barra creció a 374 px y el banco siguió diciendo
«0 desbordes» en las 15 escenas.

El guard de cero que tenía («¿se midió?») no bastaba: **un detector que no puede
decir que sí no está midiendo**. Rehecho para mirar el ancho de segmento y que la
barra entre entera en el viewport —el riesgo real de móvil es **vertical**, no
horizontal— y con **control positivo**: una escena a 320×300 que *tiene* que
caer. Cae.

---

## 3 · Un solo orden de home para las dos pieles

El usuario miró móvil y web al lado y pidió que móvil se pareciera a web: **aro →
Actividades → Camino** en todo el viewport.

- **Actividades hereda el papel de horizonte sin mecanismo nuevo**: la regla de
  s156 ya decía «el horizonte es el primero después del aro» con un selector de
  hermano adyacente, y ahora ese primero es siempre Actividades. La tarjeta
  suelta su margen negativo, como escritorio ya hacía desde s126.
- **El lector de `--pace-skin` en JS se retiró entero.** Existía solo para elegir
  el orden; era un re-render de la home completa al cruzar el breakpoint a cambio
  de nada. `--pace-skin` sigue publicándose y las hojas lo siguen leyendo.
- El test del orden móvil pasa a `dial > act > spc`. Su rojo está medido **sin
  sabotear**: el banco confirma que HEAD da `dial > spc > act`.

### Dos afirmaciones que hubo que retirar, y por qué

Se reportó al usuario que el solapamiento pasaba de **64 a 54 px** a 375, y que
el cambio arreglaba un retroceso de foco previo a 320. **Las dos eran falsas, y
las dos eran del banco.**

| Mentira | Causa | Lo que sale bien medido |
|---|---|---|
| «el solapamiento cambia» | esperar 500 ms fijos en vez de a que el motor CALLE (publica más de una vez: pasada síncrona + hasta 8 iteraciones + el reintento de s156) | **idéntico en las 5 vistas**: 47/47 · 54/54 · 57/57 · 1/1 · 80/80, y publicado == real con dif 0 |
| «arregla un retroceso de foco a 320» | a 320 la home desborda **8 px**, tabular arrastra el viewport y el recorrido no cierra (22 paradas en vez de 12) | la lectura **no vale** en ninguna de las dos columnas |
| «`--pace-dial-d` es NaN» | leerlo de `:root`, donde no está | los tokens del motor son `--pace-timer-d` y `--pace-activities-overlap` |
| «hay 1 retroceso en todas las vistas móviles» | contar como retroceso el salto del último control al primero, o sea el ciclo dando la vuelta | 0 |

Las cuatro estaban **ya resueltas** en `tests/home.helpers.js`, con su porqué al
lado. Reimplementarlas fue el error: el banco ahora **consume la sonda de la
suite** (`sonda`, `asentarGeometria`) en vez de la suya.

De propina, el banco contestó una cosa que se había dicho mal: **los chips SÍ
llevan subtítulo** a 360, 375 y 390; solo a 320 desaparecen.

---

## 4 · El tiempo de retención

Aprobado en s165 con **tres condiciones que son la decisión**: total acumulado y
nunca un máximo · invisible durante la práctica · sin logro.

### Primero se montaron seis variantes sobre la app real

`banco-retencion-variantes.js` fotografía el panel Ritmo **de verdad** con cada
variante inyectada sobre el DOM: quinta tarjeta · sublínea en Respira · línea al
pie semanal · la misma línea pero de por vida · quinta fila de barras · y el
«hoy» sin nada. Ninguna maqueta — el método de s165.

**La semilla mintió dos veces seguidas y casi cuesta acusar al producto.** Las
barras salían **rotadas un día**: sembrar `weeklyStats` sin
`_weeklyStatsReindexed_v0_28_8` hace que `loadState` lo crea anterior a v0.28.8 y
le aplique `reindexWeeklyStatsMondayFirst`, que es literalmente `[arr[1]…arr[6],
arr[0]]`. Corregido, seguía marcando discrepancia — y era que **un cero no pinta
`<span>`** (`{v > 0 && …}`), que es lo correcto. De vista las dos pasaban por
buenas; solo cayeron comparando columna a columna contra la semilla.

### Qué quedó implementado

Serie **semanal**: `weeklyStats.holdSeconds` en **segundos** (una retención dura
15–60 s; en minutos sería siempre 0 o 1), que baja al histórico por el rollover.
Se eligió la escala semanal porque **soporta las seis variantes**: desde ella se
puede pintar V3 y V4; al revés no.

Pinta **V3**, línea al pie. Es una **suposición declarada**: la nota de s165 decía
«a escala de semanas», y V3/V4 son las dos que respetan el criterio de s139 §A4
(gana lo más periférico que todavía orienta). Pasar a V4 es una línea.

**No aparece si vale cero**: solo 3 de las 20 rutinas de Respira tienen
retención, así que para la mayoría el cero es el estado normal y un «0 s»
permanente sería el recordatorio de una métrica sin cumplir.

El reloj vive en `BreatheSession.support.jsx` porque el componente estaba a 480
de 500 y STATE.md ya lo tenía dicho. **No es «empezar a contar la apnea»**:
`activeMsRef` suma `hold` desde s98, así que esto saca a un número propio algo que
ya se acreditaba.

### El banco de mutaciones obligó a cambiar el CÓDIGO, no el test

Cuatro mutaciones, una por aserto. **M1 no mordió dos veces seguidas.**

La primera vez el aserto tenía la culpa: salía de la retención por «Respirar de
nuevo», y ese camino pasa por `active`, donde el efecto ya cierra el segmento. El
tramo en riesgo es el de la **última** ronda, donde `releaseHold()` llama a
`finish()` sin pasar por `active`. Se reescribió para recorrer las dos rondas.

**Y siguió sin morder** — y ahí la culpa era del producto: había **dos mecanismos
redundantes**, `finish()` cerraba el reloj *y* `segundos()` contaba el segmento
abierto, así que romper cualquiera de los dos no cambiaba el resultado. Eso no es
defensa: es código del que no se puede saber si funciona. Se quitó uno. **Ahora
las cuatro muerden.**

`banco-retencion-cuadrantes.js` cierra el frente de idioma y paleta: los cuatro
cuadrantes con la misma cifra y la etiqueta de su idioma. Su primera lectura
también mintió —`Meta` es un `<div>`, así que el primer `<span>` era ya la cifra—
y lo cazó el propio aserto.

---

## 5 · El mecanismo de las máscaras de ejercicio

El usuario confirmó que los 62 dibujos del rediseño entran como **máscara CSS** y
dejan de ser SVG en código. El arte todavía no existe, así que se montó **el
mecanismo** de forma que pueda vivir en producción mientras tanto.

`exercise-masks.js` nace con el **mapa vacío**, y `ExerciseGlyph` le da
**precedencia** sobre su SVG — el mismo diseño de s146 para los sellos: con el
mapa vacío la app pinta exactamente lo de ayer, y cada dibujo que entre sustituye
al suyo sin tocar a los demás. **Los 62 no tienen que llegar de golpe.**

`scripts/ingest-glifos-ejercicio.js` empareja por **slug contra la identidad
visual** (nunca por posición: la lección de s146 sigue en pie), escribe el `.webp`
a 384 px y reescribe mapa y precache. Probado sobre **PNG sintéticos**: la
normalización lleva un trazo de L=120 a **alfa 255** — sin ella se quedaría en el
49 %.

**El script se corrigió a sí mismo dos veces:**

| Lectura | Salía | Por qué | Correcto |
|---|---|---|---|
| solo registro + `EXERCISE_GLYPHS` | 51 | faltaban los pasos de las rutinas, y `EXTRA_ROUTINES` **no se publica** en `window` | leerlos del fuente, como el censo de s164 |
| añadiendo las claves dibujadas | 62 | 6 dibujos no los usa nadie, y el encargo dice **expresamente** que no hay que rehacerlos | **61 = 61**, lo que la app PIDE |

### Dos asertos, y el segundo costó tres rojos

`tests/glifos-mascara-ejercicio.spec.js`: con el mapa vacío no hay ni una
máscara, y con filas la máscara gana.

1. Contaba los `<svg>` de la **biblioteca** — pero allí las tarjetas son de
   RUTINA. `ExerciseGlyph` se pinta en el **preview** (§18.3), el runner y el
   constructor. El aserto pasaba en vacío.
2. Reabría el preview con `irAlArtefacto`, que **NAVEGA**: la navegación remonta
   la app y se lleva las filas inyectadas. Reabrir es un click, no un viaje.
3. Apuntaba a un `.webp` inventado → **404**, tres errores de consola. Se apunta
   a un archivo que existe: lo que se prueba es la RAMA de render.

Rojo verificado quitando la rama de máscara: el segundo muerde, el primero no
—que es lo correcto, con el mapa vacío no cambia nada—.

---

## 6 · Verificación

- `npm run verify` **PASA**, 0 problemas. CENSO de i18n **511 → 515**.
- `npm run test:e2e` **78/78** (72 + 4 de retención + 2 de máscaras).
- `index.html` regenerado; **`PACE_standalone.html` intacto en v0.71.0** —
  restaurado tras cada uno de los ~15 builds de la sesión.
- Consola limpia en todas las pasadas de los cinco bancos nuevos.

---

## 7 · Lo que NO se cubre, declarado

- **La variante V3 es una suposición**, no una elección del usuario mirando. V4
  es una línea de distancia.
- **El arreglo del instrumento E2E sigue abierto** (i / ii / iii). Todo se corrió
  con `--workers=2`, sin tocar `playwright.config.js`.
- **La ingesta no se ha corrido sobre arte real**: dos PNG sintéticos. El
  emparejamiento de los 61 nombres solo se sabrá cuando lleguen los del usuario;
  para eso está `--seco`.
- **La retención se miró a 1280×900**; en móvil, sin medir.
- **`BreatheSession.jsx` queda en 493 de 500.** Lo siguiente va al `.support`.
- **La pill de Foco/Pausa/Larga en móvil de pantallas largas** queda anotada con
  sus dos preguntas sin responder: ¿convive con el BreakMenu o lo sustituye?, y
  ¿umbral de altura fijado o medido antes?
- Los bancos **no comparan un píxel** y las capturas son Chromium a
  `deviceScaleFactor: 2`, no el teléfono del usuario.
