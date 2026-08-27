# s174 · LAS TRES LIBRERÍAS, IMPLEMENTADAS — Y LA TRANSICIÓN QUE NO EXISTÍA

**v0.104.0** · `npm run verify` PASA (0 avisos) · `npm run test:e2e` **131/131** ·
**16 mutantes, 16 muerden** · `PACE_standalone.html` intacto en v0.71.0.

> s173 dejó el rediseño **aprobado mirándolo y sin una línea de código**, y siete
> decisiones abiertas en §8. Esta sesión las cierra preguntando primero, las
> implementa, y descubre por el camino que **una de ellas describía un
> movimiento que la app no puede hacer**. Además se programa la retención por
> calendario, que llevaba desde s155 implementada y sin disparar.

---

## 1 · Preguntar antes de escribir, y una regla nueva del usuario

Las siete decisiones de §8 se cerraron **antes** de tocar código, cada una con
sus opciones medidas. La quinta pregunta —cuál de las tres formas de «ya la
hiciste»— se hizo **describiendo** las opciones, y el usuario contestó:

> «dame **siempre** ejemplos en html para que pueda decidir»

Eso **amplía la regla de continuidad de s173**: no basta con maquetar el diseño
que se va a implementar; **toda opción que yo proponga tiene que estar pintada
antes de preguntar**, incluidas las que invento dentro de la pregunta. Se añadió
la tercera forma a la maqueta y se volvió a preguntar. La respuesta final fue
**ninguna**: la marca se cae de la tanda. Como ninguna de las tres cambiaba la
geometría de la tarjeta, se puede añadir después sin tocarla.

**Lo decidido:** «Para ahora» por **contexto + rotación diaria** · premium
**mezcladas, libres primero** · Respira recibe **la tarjeta, no la pantalla** ·
orden **libres primero, luego por duración** · el grupo vacío **explica** ·
«Corto» con **umbral relativo y su número en el chip** · la transición **sí**,
como último bloque.

---

## 2 · Seis números que no cuadraban con lo dado por sabido

| Lo que se daba por hecho | Lo medido |
|---|---|
| «14 patrones de respiración» | **13** motores de ritmo · **19** ritmos distintos. El 14 no sale de ninguna cuenta |
| «el sello de las 5 con apnea» | **6** rutinas llevan `safety` (las 5 de apnea **+ Kapalabhati**, que es respiración rápida) |
| «las 12 premium» | 12 **sólo si Respira se queda fuera**: 6 + 6 + **7 de Respira** = 19 |
| La capitular está completa | **1 de 28** no tiene máscara (`Rana`), y `Descanso` tampoco: **6 de las 14 de Mueve** tienen un solo dibujo con arte. Media por tarjeta: **Estira 5,1 · Mueve 2,9** |
| El estado vacío es de biblioteca | Ninguna combinación de filtros vacía una biblioteca (mínimo 2). Lo que se vacía es el **GRUPO**: con «Aquí mismo», Estira deja `caderas` 0 de 5 y `flujos` 0 de 2 |
| «Corto» ≤ 3 min | Deja **12 de 14** en Mueve (quita dos: no filtra) y **3 de 14** en Estira. El mismo texto hacía dos cosas |

Y sobre **el glifo como filtro**, medido antes de preguntar: en Mueve el **84 %**
de las 25 identidades sale en **una sola rutina**, así que tocar el dibujo
devuelve la tarjeta que ya estabas mirando. Descartado por dato, no por gusto.

---

## 3 · El chrome del modal, o por qué la maqueta mentía sin querer

La maqueta se dibujó sobre un **marco de teléfono a pelo**. La biblioteca real
es un **modal**, y su chrome no estaba en el diseño:

| | Maqueta aprobada | App, al implementar | Tras recortar |
|---|---|---|---|
| Ancho útil a 360 | 328 px | **286** | **310** |
| Pantallas de scroll a 360 | 3,50 | **4,33** | **3,97** |
| Columna en escritorio | 310 px | **242** | **288** |

Las **4,33 pantallas** son la cifra que importa: la app de hoy iba por 4,50, así
que **el rediseño no habría cobrado su promesa**. El recorte va acotado con
`:has(.pace-lib)` y con `!important`, que **no es pereza**: el padding del modal
es un **estilo en línea**, así que la primera versión de esas reglas no movió ni
un píxel y la medida salió idéntica.

---

## 4 · Cuatro defectos que sólo aparecieron al mirar o al medir

1. **«1 SERIES · 5 REPS».** La regla de §3 daba la línea a toda rutina con algún
   paso de repeticiones, y en Estira eso son **dos rutinas con un ÚNICO paso de
   reps entre cuatro y cinco**: la tarjeta afirmaba «1 series» de un movimiento
   de los cuatro. Ahora exige **dos**. Corrige el documento: **10 de 28 → 8**.
2. **El separador se comía su propio espacio.** Iba como `::before` del trozo
   siguiente, y los trozos son *flex items*: el navegador **colapsa el espacio
   al principio de uno**. Además, al partirse la línea el punto **abría el
   renglón**. Ahora cuelga del anterior y no puede hacer ninguna de las dos.
3. **`role="button"` en la tarjeta tumbó 9 tests, con razón**: vuelve
   **presentacionales a sus descendientes**, así que el nombre de la rutina
   dejaba de existir como encabezado — y con él, la única forma que tiene un
   lector de pantalla de recorrer la biblioteca. Reescrita al patrón correcto:
   el encabezado lleva **dentro** un botón que se extiende sobre toda la
   tarjeta. De paso gana teclado, que `Card` nunca tuvo.
4. **El grano se aplicaba dos veces.** `paceGrainUrl()` ya lleva la opacidad
   **dentro** del SVG; repetirla en CSS da 0,011² — invisible. Lo destapó el
   verify quejándose de que `PACE_GRAIN_OPACITY` es un `const` que no cruza la
   IIFE: **el aviso era de ámbito y el defecto, de composición**.

---

## 5 · La transición que el diseño describía no existe

El diseño decía «la capitular crece hasta el círculo del runner». Medido sobre
la app **ya implementada**:

- entre las dos cosas hay **DOS pantallas** — el Preview y la cuenta atrás —
- y el círculo **tarda 3.114 ms** en existir desde que se pulsa «Empezar».

Los dos elementos **nunca están cerca en el tiempo**. Se pintaron los dos
destinos que sí existen y el usuario eligió **A: la cuenta atrás**, que además
está en el sitio donde va a aparecer el círculo. De regalo arregla algo real:
hasta hoy esa pantalla era **un número sobre nada** y no decía qué ibas a hacer.

**Y ponerlo ahí introdujo un defecto peor que el que venía a arreglar:** el
círculo **saltaba 171 px en escritorio y 221 en móvil** al terminar la cuenta,
porque el runner ancla su bloque **arriba** (s172b) y la preparación se
centraba. Con el mismo anclaje y el círculo el primero, **el salto es 0** en las
dos pieles. Contrapartida aceptada: durante esos 3 s queda hueco por debajo.

---

## 6 · La duplicación que engañó SEIS veces

«Para ahora» y los filtros se pintan **dos veces** —lateral y móvil— y la hoja
apaga la copia que sobra. Es lo correcto: s166 **quitó a propósito** el lector de
piel en JS, porque costaba un re-render de la home en cada cruce del breakpoint.

El coste cae en quien consulta el DOM, y cayó seis veces:

| # | Dónde | Qué dijo |
|---|---|---|
| 1-2 | sonda de anchos | midió la tarjeta del **lateral**, no la de la rejilla |
| 3 | sonda de anchos | midió el bloque «solo móvil», a `display:none`: **0 px** |
| 4 | captura de la maqueta | el rótulo decía «por el final» y la imagen enseñaba el principio: **mover un nodo del DOM resetea su scroll** |
| 5 | sonda del camino | no encontraba la capitular y el clic caducaba a los 30 s |
| 6 | **`library-transition.js`** | **en móvil no volaba nada** — y esto ya no era una sonda, era el código que se publica |

La quinta se arregló **moviendo el nodo**, no la sonda: el «Para ahora» de móvil
estaba **dentro de `.pace-lib-rejilla`**, y un subárbol oculto ahí envenena toda
consulta a la rejilla.

---

## 7 · Lo que dijo calibrar en rojo

**16 mutantes, 16 muerden.** Cuatro cosas que sólo se supieron ahí:

1. **La línea de grupo vacío mentía.** Si «Para ahora» sube las únicas rutinas
   visibles de un grupo, `ocultas` valía 1 y la línea decía «La de hombros pide
   suelo» — cierto de esa una y mentira sobre el grupo, que estaba dos dedos más
   arriba. Ahora ese grupo **no se pinta**.
2. **Un guard de cero por biblioteca estaba mal puesto**: **Estira no tiene ni
   una rutina con dos series**, así que su lista esperada vale cero con toda la
   razón. El guard pasa a ser **de la tanda**.
3. **Comparar el JSON del contenedor no prueba que no se escriba**: reescribir
   lo mismo produce la misma cadena. Ahora se **espía `setItem`**, con control
   positivo en la misma prueba.
4. **Dos asertos pasaban por carrera** (el clon del vuelo no existe en el
   instante del clic, sino un frame después de montarse la preparación). Uno
   estaba en verde por azar de milisegundos.

Y **un mutante no muerde con razón**: la limpieza del clon tiene **dos caminos a
propósito**, y matar uno deja el otro cumpliendo la promesa. Está dicho en el
test para que nadie lo cuente como cobertura que no tiene.

---

## 8 · La retención, por fin programada

Llevaba desde s155 **implementada y sin disparar**, y desde s172 su premisa
vieja («sin emisores no hay nada que podar») ya no valía. De las dos vías, el
usuario eligió **el arranque tras `loadState`** y no el rollover:
`rolloverIfNeeded` es **síncrono** y la poda no, así que engancharla allí sería
disparar-y-olvidar dentro de una función que devuelve estado.

Nace `eventsWebPruneByCalendar`, que usa **exactamente** las tres piezas que §12
nombraba. **No escribe si no hay nada que podar** — cada arranque pasa por aquí,
y una escritura inútil despierta a la otra pestaña por nada. El verify deja de
declarar que sigue pendiente.

---

## 9 · Un hallazgo de CATÁLOGO, no de diseño

Tres nombres decían lo que la tarjeta nueva ya dice, y los números coincidían
exactos: `Cuello · 3 min` junto a «3–4 MIN» (que además **se contradicen**), y
`Hombros · 5 pasos` / `Caderas · 5 pasos` junto a una tira que dibuja **5**.
El usuario decidió quitarles la coletilla. Sólo cambia el texto visible: **los
ids no se tocan**, así que no se pierde ni un logro ni una estadística.

---

## 10 · Lo que NO se tocó

- **«Ya la hiciste»**, decidido fuera de la tanda. Lo medido se conserva: sólo
  lo sabe `pace.events.v1`, y en Capacitor el adaptador es `null` — en Android
  no se vería hasta la fase de porting.
- **El glifo como filtro**: descartado con su medida.
- **La pantalla propia de Respira** y sus **13 glifos de ritmo**.
- **`Rana`, `Pica en escritorio` y `descanso.png`** (la cola de 3), `Puente
  torácico` a tamaño real y las 18 piezas de la 2ª tanda.
- El color de «La jornada», el equinoccio de otoño, los 19 glifos de logro y el
  tirón del arco.
