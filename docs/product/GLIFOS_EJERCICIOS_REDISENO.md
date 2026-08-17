# Rediseño desde cero · TODOS los glifos de ejercicio (Mueve y Estira)

**Censo del árbol en s164 (v0.94.0).** La app necesita **61 dibujos distintos**
(+ `Descanso` = **62**). Hoy: **41 dibujados · 20 sin dibujo** (caen a
`DefaultGlyph`). Se rehacen **los 62**, no los 20 huecos: el objetivo es un set
coherente y **mucho más visual y claro**, que es lo que faltaba.

> **Cómo se hizo el censo, porque no es obvio.** La unidad no es el ejercicio: es
> el **dibujo**. Varios ejercicios comparten uno vía `VISUAL_ALIAS` (identidad
> visual, s110), así que se cuenta sobre `resolveVisualId()`. Y no basta el
> registro del constructor: se leyeron también **los 101 pasos** de las rutinas de
> Mueve (51) y Estira (50) — `EXTRA_ROUTINES` no se publica en `window`, así que
> sus nombres se extrajeron del fuente. Resultado: todos los pasos resuelven a
> algún dibujo del registro, así que **61 cubre la app entera**.

---

## 1 · Especificación para el generador

Estos **no** son los sellos de logro: son **pictogramas de un cuerpo haciendo
algo**, y su trabajo es que se entienda el gesto sin leer el texto.

| Qué | Cómo |
|---|---|
| **Formato** | PNG cuadrado, cuanto más grande mejor (2048×2048 o más). |
| **Tinta** | **Negra o muy oscura sobre blanco o casi blanco.** Sin color: el color lo pone el token del módulo. |
| **Encuadre** | **Un cuerpo entero (o la parte implicada), centrado, con margen.** Mismo tamaño óptico en las 62 piezas: si en una el cuerpo ocupa el 80 % del lienzo y en otra el 40 %, en la app se nota como un salto. |
| **Estilo** | Line art de trazo continuo y **peso constante**, extremos redondeados, sin relleno. El set actual usa `strokeWidth 1.8` sobre un lienzo de 44 — o sea un trazo **grueso** en proporción. Sin sombras, sin degradados, sin músculos ni detalle anatómico. |
| **La figura** | Silueta esquemática, **sin cara ni dedos**. Cabeza como círculo simple. Coherencia total entre piezas: la misma «persona» en las 62. |
| **Contexto, solo si el gesto lo necesita** | Silla, mesa, pared o suelo como **una línea recta** cuando el ejercicio los usa (la mitad de este catálogo es de oficina y sin la silla no se entiende). Nada más de escenografía. |
| **Dirección** | **Perfil mirando a la derecha** por defecto. De frente solo cuando el gesto sea simétrico y de frente se lea mejor (círculos de hombro, apertura de pecho). |
| **Movimiento** | Si hay recorrido, **una línea de puntos o una flecha fina**, nunca dos posiciones del cuerpo superpuestas: a tamaño pequeño se convierten en una mancha. |
| **Texto** | **Ninguno.** |
| **EL LÍMITE QUE MANDA** | Se pinta desde **30 px** (miniatura de la biblioteca) hasta ~200 px (el runner). Tiene que leerse a 30. Pocos trazos, gruesos, separados; sin detalle que se cierre al reducir. |
| **Nombre del archivo** | El nombre del ejercicio tal cual, en minúsculas y sin acentos: `flexiones-inclinadas.png`, `gato-camello.png`. Yo hago el mapeo. |

**Cómo entrarán**: me pasas los PNG y los ingesto con un script, igual que el arte
de logro (mismo mecanismo de máscara: alfa = densidad de tinta, color por token).
Eso implica una decisión que ya tomaste al pedir el rediseño completo: los
ejercicios **dejan de ser SVG dibujado en código** y pasan a ser máscaras, como el
loto de Respira y los sellos de logro. Un solo mecanismo para todo el arte.

**Cinco dibujos que NO hay que rehacer** — están dibujados y no los usa nadie
(hallazgo de s142, cada uno tapado por su propio alias): `Apertura de pecho
sentado`, `Puente isquio a una pierna`, `Suspensión pasiva · opcional`,
`Sentadilla profunda sostenida`, `Respiraciones profundas`. Al rehacer el set,
desaparecen.

---

## 2 · Los 62, por grupo

La columna **hoy** dice si existe dibujo (se rehace igual) o si cae a
`DefaultGlyph`. La columna **qué debe mostrar** es el encargo; entre paréntesis va
el *cue* real que el usuario lee en la app, que es la fuente de verdad del gesto.

### Empuje y tracción (5)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Flexiones inclinadas | dibujado | Perfil inclinado con las manos en el borde de una **mesa**, cuerpo en línea recta, codos cerca del tronco. *(«Contra el escritorio, codos cerca del cuerpo.»)* |
| Pica en escritorio | **falta** | «V» invertida: manos en el borde de la mesa, cadera arriba, cabeza entre los brazos. *(«Cadera arriba, cabeza entre los brazos.»)* |
| Fondos en silla | dibujado | Perfil de espaldas a la **silla**, manos en el asiento, codos hacia atrás, cadera bajando. *(«Baja con control, codos atrás.»)* |
| Suspensión pasiva | dibujado | Figura colgando de una **barra horizontal**, cuerpo largo y relajado, hombros altos. *(«Cuelga relajado. Respira.»)* |
| Suspensión activa | **falta** | La misma barra, pero **hombros abajo y atrás** y el pecho un poco alto: la diferencia con la pasiva tiene que verse. *(«Hombros abajo y atrás, codos rectos.»)* |

### Piernas (9)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Sentadilla a silla | **falta** | Perfil a medio bajar con la **silla justo detrás**, roza sin sentarse. *(«Baja hasta rozar la silla, sube sin impulso.»)* |
| Silla en la pared | dibujado | Perfil con la espalda pegada a una **pared vertical**, rodillas a 90°, muslos horizontales. *(«Espalda en pared, rodillas a 90°.»)* |
| Sentadilla búlgara | **falta** | Perfil con el **empeine de atrás sobre la silla** y la rodilla delantera a 90°, tronco vertical. *(«Empeine sobre la silla, baja vertical.»)* |
| Zancada profunda | dibujado | Zancada larga de perfil, **rodilla por delante del pie**, rodilla de atrás cerca del suelo. |
| Sentadilla de cuádriceps | dibujado | De rodillas con el cuerpo echado atrás en línea, **talones levantados**, apoyo con una mano. *(«Apoyado. Rodillas adelante, talones arriba.»)* |
| Nordics | dibujado | De rodillas, tronco cayendo hacia delante con control, **tobillos sujetos**. |
| Elevación de puntas | dibujado | Perfil contra la **pared**, peso en talones, **puntas de los pies levantadas**. |
| Elevación de talones | dibujado | Perfil de pie **de puntillas**, talones arriba; una flecha fina vertical. |
| Puente con marcha | dibujado | Tumbado boca arriba con la **cadera elevada** y **una rodilla subiendo** hacia el pecho. *(«Activación de glúteo profundo.»)* |

### Core y espalda (8)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Plancha | **falta** | Perfil apoyado en **antebrazos**, una sola línea del talón a la cabeza. *(«Antebrazos, cuerpo en línea. Aprieta glúteos.»)* |
| Plancha lateral | **falta** | De lado, **un antebrazo en el suelo**, cadera alta, brazo libre al techo. |
| Hueco abdominal | **falta** | Boca arriba en **arco cóncavo**: lumbar pegada al suelo, hombros y piernas levantados y extendidos. |
| Hueco en silla | dibujado | Sentado en la **silla**, manos en el asiento, **piernas elevadas** y baja espalda apoyada. |
| Superman | **falta** | Boca abajo en **arco convexo**: pecho, brazos y piernas levantados. |
| Juntar omóplatos | dibujado | **De espaldas**, vista trasera, codos atrás y dos flechas cortas juntándose entre los omóplatos. |
| Apertura con banda | dibujado | De frente, brazos al pecho abriéndose contra tensión, con la **banda** como línea entre las manos. *(«Sin banda: brazos cruzados + abre con tensión.»)* |
| Apretar glúteos | **falta** | El más difícil de dibujar: **de pie de perfil, con dos arcos cortos de tensión** en el glúteo. Si no funciona, vale una figura sentada en la silla con los mismos arcos. |

### Cuello y hombros (10)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Barbilla atrás | dibujado | **Cabeza y cuello de perfil**, con una flecha corta horizontal: la barbilla se desliza atrás y la nuca se alarga. **No es bajar la cabeza.** |
| Cuello y trapecios | dibujado | Cabeza y hombros de frente, **oreja hacia el hombro**, mano opcional guiando. |
| Inclinación lateral | dibujado | Igual que el anterior pero **sin mano** y con el arco de recorrido a los dos lados. |
| Rotación lenta | dibujado | Cabeza girada **mirando sobre el hombro**, hombros de frente. |
| Escalenos | dibujado | Sentado, **una mano bajo el glúteo** (ancla el hombro) y la cabeza inclinada al lado opuesto. |
| Encogimiento de hombros | dibujado | Torso de frente, **hombros subidos** hacia las orejas, dos flechas cortas hacia arriba. |
| Círculos de hombro | **falta** | Torso de frente con **un brazo estirado** y un **círculo punteado** describiendo su recorrido. |
| Deslizamientos en pared | dibujado | De frente contra la **pared**, brazos en «W» subiendo a «Y», con flechas. |
| Rotación externa | dibujado | **Codo a 90° pegado al costado**, antebrazo abriéndose hacia fuera, flecha en arco. |
| Apertura de pecho | dibujado | **Manos tras la nuca**, codos muy abiertos, mirada al techo. |

### Columna (8)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Rotación torácica | dibujado | **Sentado en la silla**, manos cruzadas al pecho, tronco rotado, cadera al frente. |
| Extensión torácica | dibujado | Sentado, **arqueado hacia atrás sobre el respaldo** de la silla. |
| Gato-camello | **falta** | A cuatro patas con la espalda en **dos curvas superpuestas** (una arqueada, otra redondeada) y una flecha doble. |
| Onda espinal | **falta** | De pie con una **línea ondulada** recorriendo la columna de la pelvis a la cabeza. |
| Puente torácico | **falta** | **Desde sentado en la silla**: cadera elevada, pecho abierto al techo, manos en el asiento. |
| Rodar hacia abajo | **falta** | De pie doblándose, columna en **espiral suave**, brazos colgando; flecha descendente. |
| Giro sentado | dibujado | Sentado, **rotado hacia el respaldo**, una mano en él. |
| Apertura de costillas + respiración | dibujado | A cuatro patas (gato/vaca) con **dos arcos en las costillas** que indican el aire entrando. |

### Caderas (7)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Flexor de cadera | dibujado | **Una rodilla en el suelo**, la otra delante a 90°, pelvis empujando adelante. |
| Cuádriceps en pared | **falta** | De rodillas con el **empeine contra la pared** (o la silla) y la rodilla al fondo. |
| 90/90 | dibujado | Sentado en el suelo con **las dos rodillas a 90°**, una delante y otra al lado; flecha de rotación entre lados. |
| Paloma | dibujado | **Tibia delantera cruzada** en el suelo, pierna de atrás extendida, peso adelante. |
| Rana | **falta** | Vista desde atrás/arriba: **rodillas muy abiertas** y cadera retrasada, mecido suave. |
| Sentadilla lateral | dibujado | **Peso a un lado** con esa rodilla flexionada y **la otra pierna estirada**. |
| Zancada con apertura | dibujado | Zancada con **una mano en el suelo** y el otro brazo abriéndose al techo (rotación). |

### Suelo y cadena posterior (6)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Sentadilla profunda | dibujado | Sentadilla completa con **talones en el suelo** y **codos por dentro de las rodillas**. |
| Gateo | dibujado | A cuatro patas avanzando **contralateral** (mano derecha y rodilla izquierda), rodillas despegadas. |
| Sentarse y levantarse del suelo | dibujado | Dos siluetas no: **una figura a medio camino entre el suelo y de pie, sin manos apoyadas**. |
| Marcha del elefante | dibujado | Doblado por la cadera **tocando el suelo alternando manos**, piernas casi estiradas. |
| Pliegue adelante | **falta** | **Pies juntos**, tronco colgando, rodillas ligeramente blandas, brazos sueltos. |
| Isquio a una pierna | **falta** | **Talón apoyado en algo bajo** delante, pierna extendida, cadera echada atrás. |

### Muñecas, tobillos y pausas (9, con `Descanso`)

| Ejercicio | Hoy | Qué debe mostrar el dibujo |
|---|---|---|
| Círculos de muñeca | dibujado | **Dos manos** con las muñecas sueltas y un **círculo punteado** en cada una. |
| Estiramiento de muñeca | dibujado | Una mano llevando la otra a **flexión y extensión**, con flecha doble. |
| Palmas al suelo | **falta** | Dos manos **sobre la mesa vistas desde arriba**, dedos apuntando al cuerpo. |
| Rezo invertido | **falta** | Dos manos con los **dorsos en contacto** frente al pecho, dedos hacia abajo. |
| Abrir y cerrar el puño | dibujado | Una mano **abierta y un puño** cerrado, en dos estados claros. |
| Extensión de dedos | dibujado | Una mano con **los dedos muy abiertos** en abanico. |
| Círculos de tobillo | dibujado | Un pie **bajo la mesa** con un círculo punteado en el tobillo. |
| Reset respiración | dibujado | Torso de frente con **dos arcos concéntricos** en el pecho: aire que entra. |
| **Descanso** | dibujado | El único que no es un ejercicio: **una figura sentada y quieta**, o un simple arco de reposo. Aparece entre series, así que debe leerse como pausa y no como gesto. |

---

## 3 · Orden que sugiero para generarlos

1. **Los 20 que faltan**, empezando por los de Core y Columna (9 entre los dos):
   son los que hoy aparecen sin dibujo en las rutinas más usadas.
2. **Los 12 de oficina** (silla, mesa, pared): son la identidad del producto y los
   que más ganan si el mueble se dibuja igual en todos.
3. **El resto**, en tandas por grupo, para que cada tanda salga con la mano puesta
   y no se noten los cambios de estilo entre grupos.

Una **prueba de una sola pieza antes de la tanda**: genera `plancha.png`, la
ingesto y la vemos con el mecanismo real a 30 px y a tamaño de runner. Si el
trazo aguanta a 30, aguanta todo lo demás.
