# Rediseño de las librerías · Respira · Mueve · Estira

> **Diseño APROBADO mirándolo, NADA implementado** (s173). Cada decisión de aquí se
> tomó sobre una maqueta HTML con el catálogo real, las máscaras reales y los tokens
> de `DESIGN_SYSTEM.md`, a **360×730** y **412×844** en móvil y **1280** en escritorio.
> Doce iteraciones. Lo que sigue es el resultado, no el recorrido.
>
> **Regla de continuidad del usuario (s173):** el diseño se aprueba **viéndolo** en
> una maqueta HTML antes de implementar nada. No es una excepción de esta sesión.

---

## 1 · El problema, medido

| Librería | Rutinas | Alto | Ventana | **Pantallas de scroll** |
|---|---|---|---|---|
| **Respira** · 360×730 | 20 | 4008 px | 705 px | **5,69** |
| **Estira** · 360×730 | 14 | 3170 px | 705 px | **4,50** |
| Mueve · 412×844 | 14 | 1924 px | 610 px | 3,15 |

Cada tarjeta mide **185 px** y es **texto puro**: no hay una sola imagen en la pantalla
donde se elige, con 59 grabados terminados en el repositorio.

**El diagnóstico no es «sobra contenido», es «falta forma de descartar».** Cada rutina
ya declara `position`, `equipment`, `requiresFloor`, `intensity`, `level` y duración
desde s115 — se pintan en la tarjeta y **no filtran nada**. No hay filtro ni buscador
en toda la app.

---

## 2 · Qué eje ordena cada librería

Se eligió midiendo **cuál parte el catálogo de verdad**, no por criterio:

| Eje | Mueve + Estira (28) | Respira (20) |
|---|---|---|
| **Duración** | todo entre **1 y 6 min** — no separa nada | de **2 a 20 min**, factor 10 |
| **Contexto** | **11 de 28 exigen suelo**; 14 no piden material | irrelevante: se respira en cualquier postura |

⇒ **Mueve y Estira se ordenan por CONTEXTO. Respira por TIEMPO.** De ahí que sean
**gemelas + una aparte**, y no tres iguales ni tres distintas.

---

## 3 · La tarjeta

```
[capitular 62 px]  Antídoto silla  (SUAVE)
                   Descompresión de 4 a 6 sentado. Caderas, lumbar, cuello.
                   5 min · en el suelo · cojín opcional · por lado · Premium
                   [resto de glifos, 20 px, al 75 %]
                   3 SERIES · 12·10·8 REPS        ← sólo si dice series
```

- **Capitular + resto al 75 %** (variante «C1»). El primer dibujo a **62 px** hace de
  capitular; los demás debajo a 20 px. **El 55 % de opacidad no valía**: el usuario no
  los registraba y reportó «sólo muestra un glifo» — si no se leen, no están.
- **Nivel en pill junto al nombre**, con borde (`--r-pill`, `--line-2`). Se probaron
  pill sin borde y cursiva; ganó la pill. **Coste medido: las 14 pills pintan 56 bordes**
  — más que todo lo demás junto. Decisión consciente.
- **Descripción a DOS líneas.** Miden 61 caracteres de mediana y 84 la mayor: caben
  todas sin recortar. Recortarlas a una fue un error de la primera maqueta.
- **Línea de contexto en CURSIVA display** (Cormorant itálica, 15 px), redactada como
  se diría en voz alta: *«en el suelo · con silla · contra la pared»*. Se lleva **todo
  lo que es cómo-se-hace**: dónde, con qué, «por lado» y **Premium**.
- **La cifra de minutos en EB Garamond a 19 px**, no en sans. `DESIGN_SYSTEM.md` fija
  EB Garamond como las **cifras de identidad** (racha del sidebar, `MM:SS` del timer):
  la duración es de esa familia y conecta la biblioteca con el timer. **Sólo la cifra**
  — la palabra «min» sigue en sans, y el resto de la línea en cursiva.
- **La línea de series SOBREVIVE SÓLO cuando dice series y repeticiones**, que es
  **10 rutinas de 28**. Las otras 18 decían «5 posturas», y eso ya lo dicen los glifos
  contándolos. La línea aparece **cuando tiene algo que decir**, no por plantilla.
- **Grano de papel al 0,011**, con `baseFrequency` 1.4 y tile 160 — los valores de
  `paceGrainUrl()` / `PACE_GRAIN_OPACITY` (`SessionShell.jsx:162`). **No inventar un
  segundo valor**: la maqueta probó primero 0,055 (cinco veces más) y eso sería una
  decisión nueva, no reutilizar el sistema.

---

## 4 · Móvil

Orden: **cabecera con «Tus rutinas ›» · filtros · Para ahora · catálogo por grupos**.

- **Bloque con filo de color** (3 px del token del módulo, `--paper-2`, `--r-md`).
  En móvil el filo **trabaja**: ves 3 o 4 tarjetas a la vez y es lo único que dice de un
  vistazo si estás en Mueve (ocre) o en Estira (azul) sin leer la cabecera.
- **Tres filtros que caben sin deslizar**: `Aquí mismo` · `Sin material` · `Corto`.
  Medido: **277 px de chip sobre 328 disponibles** a 360 px de ancho.
- **Contador en cada chip.** La regla: **el número sirve donde NO se ve la respuesta.**
  En un chip todavía no ves el resultado ⇒ evita el peor momento de un filtro, que es
  tocarlo y encontrarte con nada. **En el título de grupo se quitó**: las tarjetas están
  ahí debajo, contar es repetir lo que ya se ve.
- **Subtítulo de la biblioteca en cursiva** display, como el nombre. La única versalita
  que queda arriba es `BIBLIOTECA`, que es sistema.
- **Sin la hora en «Para ahora».** Era la entrada de la regla, no información.

### Los dos filtros que se cayeron, y por qué

| | Estira | Mueve |
|---|---|---|
| Aquí mismo | 5 | 11 |
| ~~De pie~~ | 3 | 7 |
| ~~Con suelo~~ | 9 | 2 |
| Sin material | 7 | 7 |

**«Aquí mismo» + «Con suelo» = 14 de 14**: son complementarios exactos, un filtro con
dos nombres. Y **«De pie» está contenido entero en «Aquí mismo»** — cero rutinas de pie
fuera de él. Entra **«Sin material»**, el único que discrimina igual en las dos (7/14).

---

## 5 · Escritorio

- **Lateral de 262 px** sobre `--paper-3` con: filtros en vertical, **«Tus rutinas»** y
  **«Para ahora»**. La rejilla queda de catálogo puro.
- **Rejilla de 3 columnas** con `minmax(0,1fr)` y **la cabecera de grupo a todo el ancho**
  (`grid-column:1/-1`), así ningún grupo se parte entre columnas.
- **El catálogo NO lleva color en reposo.** El filo de móvil satura aquí: ves **14 a la
  vez** y la biblioteca ya la dice la cabecera.
- **El color de módulo entra en el HOVER**, que es lo que hace la app: `Card`
  (`Primitives.jsx:115`, usada por `BreatheLibrary.jsx:139` con `accent`) es **neutra en
  reposo** —`--paper` + `1px solid var(--line)`— y al pasar el ratón hace
  `borderColor = accent` + `translateY(-1px)` + `--sh-soft`. **En PACE el color de módulo
  no dice lo que hay: dice lo que estás tocando.** Marcar secciones con él habría sido un
  segundo idioma para el mismo color.

### `Tus rutinas`: mismo criterio, dos formas

**Móvil** un enlace en la cabecera (`Tus rutinas ›`, cursiva, `--premium`). **Escritorio**
un bloque en el lateral. No es incoherencia: el enlace resuelve la falta de **alto**, y en
1280 px esa falta no existe — ahí el enlace cae en **x=1194 de 1280, 68 px de ancho**, el
punto más ignorable de la pantalla (medido, y el usuario no lo encontró).

**Fuera el aside «En Mueve y en Estira».** La lista es **la misma** en las dos bibliotecas
(un único `pace.customRoutines`, sin campo de módulo; sólo cambia el `accent`), y ese aside
existía para que verla dos veces no pareciera un bug — **no funcionó ni con el autor de la
app**. Las tres formas nuevas lo resuelven por la forma: **un acceso, no una lista repetida**.

---

## 6 · Sin wash

La biblioteca **no** lleva `sessionAtmosphere`. Dos razones:

1. Ese wash es lo que dice «**estás dentro de una actividad**». Si lo lleva también la
   biblioteca deja de decirlo, y el momento de entrar en la sesión se queda sin su cambio
   de atmósfera. **Elegir es una cosa y hacer es otra.**
2. La biblioteca es un **modal sobre la home**, que ya tiene su luz. Apilar dos
   atmósferas sin calibrar es lo que s140 midió: **el escalón se duplica**.

---

## 7 · Lo que gana, medido

| | Pantallas a 360×730 |
|---|---|
| Estira **hoy** | **4,50** |
| Estira rediseñada, sin filtrar | **3,57** |
| Mueve rediseñada, sin filtrar | **3,19** |
| Estira + «Aquí mismo» | **1,53** |
| Estira + dos filtros | **1,00** |

**La tarjeta creció y aun así scrollea menos.** Y quien de verdad recupera el scroll es el
filtro: la tesis es que **si la tarjeta tiene que crecer para informar, lo paga el filtro**,
no la compresión.

---

## 8 · Lo que queda ABIERTO

- **La regla de «Para ahora».** Hoy son dos ids a mano. Falta decidir si elige por hora
  del día, por lo que no has hecho, o por lo más corto que cabe en tu contexto.
- **Respira**: su pantalla propia está esbozada (ordenada por duración, sin arte, con el
  ritmo dicho en palabras y el sello de seguridad de las 5 con apnea) pero **no cerrada**.
  Los **14 patrones** son su información más útil y la más difícil de leer. La salida
  sería **dibujarlos**: 14 glifos de ritmo, encargo de arte como el de ejercicios pero de
  líneas y proporciones, no cuerpos.
- **Las 12 rutinas premium**: ¿mezcladas con sello, o agrupadas aparte?
- **Tres ideas propuestas y sin decidir**:
  - **El glifo como filtro.** Tocar un dibujo = «enséñame todas las rutinas que lo llevan».
    Convierte el arte en índice y **depende de tener 59 dibujos propios**.
  - **La transición biblioteca → sesión.** Como no hay wash, entrar gana significado: la
    capitular de la tarjeta podría **crecer** hasta el círculo del runner.
  - **«Ya la hiciste».** Marca tenue en las de esta semana. Memoria, no racha (s133).
- **El orden dentro de cada grupo** (hoy es orden de catálogo, que no es un orden) y **el
  estado vacío**, que va a existir: 9 de las 14 de Estira piden suelo.

---

## 9 · Un hallazgo de CATÁLOGO, no de diseño

Al construir el filtro «Aquí mismo» (sin suelo, sin barra) salió esto:

- **Estira: sólo 5 de 14** se pueden hacer sin tirarse al suelo.
- **Mueve: 11 de 14.**

En la librería pensada para descomprimir **en la oficina**, dos tercios de Estira no se
puede hacer en una oficina. Ninguna maqueta arregla eso — es contenido. Pero el filtro lo
va a hacer obvio para el usuario en cuanto exista.
