# s176 · Lo que el usuario probó, y los cuatro sitios donde tenía razón

> **v0.106.0** · `verify` PASA · `test:e2e` **146/146** (desde 136) ·
> **12 mutantes calibrados, 12 muerden** · standalone intacto en v0.71.0.

El handoff mandaba preguntar antes de proponer, y la respuesta fue una lista.
Toda la sesión sale de ahí: **cuatro defectos suyos, cuatro reproducidos**.
Ninguno hizo falta discutirlo; lo que costó fue medir por qué.

---

## 0 · Lo que trajo, y lo que resultó ser

| lo que dijo | lo que estaba pasando |
|---|---|
| «la biblioteca de Respira se ve demasiado feo» | 1 columna de **810 px** con ~380 de contenido · **3,90 pantallas**, más que las **3,82** de antes del rediseño |
| «el cuadro de Tus rutinas va demasiado a la derecha» | rejilla con mínimo de **260 px** dentro de un rail de **242** · sobresalía **18 px** |
| «la barra de progreso casi se superpone con los botones» | se metía **15 px dentro** del pie, y estaba **47,2 px** más abajo que en «colócate» |
| «los paneles de estadísticas deberían ser del mismo tamaño y sin scroll» | **163,2 px** de salto entre pestañas y **dos de las cuatro** cortadas |

Más tres encargos: interruptor de voz, `bradford`, y los briefs de música.

---

## 1 · Respira: la decisión de s174 se anula por lo que se vio al probarla

s174 escribió que Respira «comparte la tarjeta y no la pantalla», y su razón
—Mueve y Estira se ordenan por CONTEXTO, Respira por TIEMPO— **sigue siendo
cierta**. Lo que no lo era es la consecuencia: sin pantalla propia, las 20
tarjetas caían en el flujo del modal a todo el ancho.

El número que lo cierra: **el rediseño gastó el ancho y no cobró nada de
scroll**. 3,82 pantallas antes, 3,90 después. Y el sello ⚠ acababa a 700 px del
nombre al que pertenece.

Se pintaron **seis variantes** en iframes de 1536×714 reales, cada una
midiéndose a sí misma. El usuario eligió mirando: primero **E**, luego se
corrigió a **C** (con rail). Implementado C: modal 1240, rejilla de 3 × 288 px,
rail de 262, **1,98 pantallas**.

**Y es menos código, no más**: `LibraryShell` se parametriza con cinco props
—`filtros`, `variant`, `conTuyas`, `pozoAhora`, `ancho`— todas con el valor de
cuerpo por defecto, así que Mueve y Estira no cambian ni un píxel.

### Dos cosas que la maqueta destapó y que no se veían leyendo

**El tercer chip era decoración.** «Sin rondas» parecía un filtro y resultó ser
un **subconjunto estricto** de «Sin retención»: quita `rounds.express`,
`rounds.full` y `rounds.long`, que son exactamente las tres que la otra ya
quita, porque ninguna declara `cycle` y las tres llevan `safety`. Se cayó antes
de cablearse. Respira lleva **dos** chips.

**La sugerencia del día era una apnea avanzada.** El pozo de «Para ahora» es
`libraryPredicado('aqui')` —sin suelo, sin barra— y en Respira **no descarta
nada**: las 20 pasan. El día que se pintó la maqueta tocaba `Kumbhaka 1:4:2`:
premium, bloqueada y con modal de seguridad. Ahora el pozo entra **por
parámetro** y excluye las que llevan aviso; hoy sugiere `Suspiro fisiológico`.

---

## 2 · La voz: interruptor propio, dos voces, y un número que casi digo mal

`bradford` nunca se había medido —sus cifras eran de cabecera MPEG, que ya
publicó dos falsedades— así que se midió **abriendo el archivo**: decodificando
la onda y buscando los extremos sobre **−50 dBFS**, con `sulafat` de control
reproduciendo sus cifras **exactas** (0,003 · 0 · 0 de diferencia).

| | inhala | mantén | exhala | cabe en |
|---|---|---|---|---|
| `sulafat` | 1,404 | 1,320 | 1,478 | **17 de 20** |
| `bradford` | 0,911 | 1,218 | **3,572** | **14 de 20** |

Y su tono: **~193 Hz** contra **~121** — 1,59×. De ahí que las dos voces se
llamen `Clara` y `Grave` y no `Ella` y `Él`: dice lo que se oye y no afirma
nada que la app no sepa.

### El número que casi digo mal, y por qué

Le dije **14** y el test lo puso rojo con **12**. La app decide **señal por
señal** —`paceVozCabe(nombre, faseSeg)` recibe la duración de *esa* fase—
mientras que el test exigía que las tres cupieran en la fase **más corta de la
rutina**, que es más estricto. Los dos modelos **coinciden en `sulafat`** (17 y
17) y se separan en `bradford`, en `breathe.yin` y `breathe.nadi.shodhana`. El
14 es el del producto; el test se corrigió al modelo bueno.

Nadie lo había notado antes porque las tres palabras de `sulafat` miden casi
igual. Hizo falta una voz con un «exhala» del doble para que la diferencia
existiera.

### El bloque de sonido: cinco controles → dos decisiones

Lo pidió con el problema dentro de la petición: «es demasiado menús». Se
pintaron tres variantes en el panel real de 320 px y eligió **V3 · por
función**:

- **Qué marca la fase** → `Tono` | `Voz` → `Clara` | `Grave`
- **Qué suena detrás** → `Nada` | `Ambiente`

No es sólo orden: **es lo único que describe bien el mecanismo**. `playSound`
intenta la voz y **sólo si no cabe** sintetiza, así que una casilla de «añadir
voz» habría mentido sobre lo que hace el código. Medido: 207 px de alto contra
los 291 de la variante plana.

«Música» **no se pinta** hasta que existan los archivos: un control que no hace
nada es peor que un hueco.

---

## 3 · El runner: el hueco no era un margen

Los dos defectos reprodujeron a 1536×714. La barra de progreso **fluía** detrás
del contenido, y la pantalla de trabajo tiene dos piezas que la de colocarse no
tiene —el contador y el «Cuídate»—, así que caía 47,2 px más abajo y se metía
15 px en el pie.

**Anclar la barra no bastó**, y la medida lo dijo: el bloque que la contiene se
centra con `margin:auto` (s112), así que su alto es el del contenido y
`margin-top: auto` la pegaba al fondo del **bloque**, no del centro — 18 px de
hueco en trabajar y 52 en colocarse. Hizo falta que el bloque **ocupe** el
centro (`height: 100%` + columna).

**Y una segunda vuelta por especificidad**: implementada arriba del archivo, la
barra volvía a 592,7 / 545,5, porque cuatro tiers fijan su `margin-top` con
`!important` y a igual especificidad gana la última regla. Va al final.

### Lo que la captura enseñó y la medida no

El contador decía **10 px arriba y 10,1 abajo** — equidistante. Pero la captura
mostraba un hueco enorme encima. Dos causas, ninguna visible en los números de
caja:

1. **Una línea vacía reservada** bajo la descripción (`min-height: 3.1em`,
   s119). s171 dejó escrito que moverla exigía «un cambio de mecanismo»…
   **que s172b ya hizo**, y su propio comentario lo dice: «con el bloque
   anclado no hace falta reservar ningún texto». La reserva sobrevivía por
   inercia y lo único que hacía era empujar el contador.
2. **El interlineado de la cifra**: caja de 112,3 px para un dígito de 104.
   Eso no se quita con un margen.

Quitar la reserva **pagó el anclaje sin tocar el tamaño del número**. Resultado:
**586,5 px en las dos pantallas**, 16 de aire hasta los botones. A 375×812 pasa
de solaparse a 16 iguales; a 360×730, de **−29,5 a −1,5**.

**Lo que no se puede tener:** darle aire al contador rompe la igualdad (596,7
contra 586,5). «Más aire» y «que quepa» no caben juntas — la misma lección que
el rail de s175, en otra superficie.

---

## 4 · Stats: el suelo es lo que cabe, no lo que mide la más alta

El modal saltaba **163,2 px** entre pestañas y dos de las cuatro tenían scroll.
La tentación era fijar la caja a la altura de la más alta; eso habría fijado el
tamaño **dejando el scroll**, que es la mitad de lo que se pidió.

A 714 px el modal da 605 útiles y el cromo se come 220,1 → la vista puede medir
**384,9**. El suelo se pone en **385** (con 382, «Año» y «Caminos» se quedan
2,5 px cortas) y el contenido se compacta para caber:

- calendario **48 → 42 px**, que devuelve justo los 36 que sobraban
- el hueco entre filas de barras, **8 → 4** (los 13 px de «Semana»)

**Las celdas VACÍAS se quedaron en 48** en la primera pasada, y por eso el mes
sólo recuperó 30 de los 36. Lo dijo la medida, no la lectura.

Resultado: **0 px de variación y ninguna con scroll**. `StatsPanel.jsx` se pasó
de las 500 líneas al añadir la caja, así que su hoja se fue a
`StatsPanel.css.jsx` — la extracción más barata que existe.

---

## 5 · Las mentiras del instrumento (seis)

1. **El modal medido a medias.** `pace-modal-in` va de scale .96 a 1: 777,6 px
   donde la app da 810 — el 96 % exacto. Y la primera captura salió con el
   modal a medio fundido.
2. **«Dos lecturas iguales» NO es esperar.** La curva se aplana cerca del
   final, así que dos muestras a 100 ms coinciden **a mitad del fundido**: el
   aserto de Stats salió rojo con 584 contra 607, **con la app ya arreglada**.
   Ahora `getAnimations()` pregunta en vez de estimar.
3. **El badge midió antes de que existiera el contenido.** `document.fonts.ready`
   resuelve casi al instante servido por `file://`, así que se adelantaba al
   parseo: los cinco marcos dijeron «GUARD: sin tarjetas» con las 20 dentro.
4. **`</script>` dentro del bloque de datos** cortaba el script del padre en
   silencio: seis iframes vacíos, cero errores en consola. Y **el primer guard
   que escribí no podía cazarlo** — comparaba contra la primera aparición, así
   que su rebanada nunca podía contenerla.
5. **El separador `·` salía como `\B7`.** El CSS se extrae leyendo el archivo,
   y allí la barra va doblada porque JS se come una al evaluar.
6. **Dos clicks que fallaron el blanco**: «Empezar» encontraba el **«Empezar
   foco» de la home** (arrancaba el Pomodoro y cerraba la biblioteca), y
   `querySelector('[data-pace-modal-card]')` devolvía la **biblioteca** y no el
   preview, que se abre encima. La familia de la trampa de las piezas
   duplicadas, pero por **profundidad**.

Y una del propio banco: el badge de la variante con rail medía **la tarjeta del
rail** (242 px) y no la de la rejilla. Van **nueve** veces que una consulta a la
biblioteca devuelve la pieza equivocada.

---

## 6 · Deuda de documentación pagada

- **La fila de voz de `DECISIONES_TECNICAS_VIGENTES.md` llevaba las cifras que
  s175 descartó**: «cabe en 8 de 20», «DOCE rutinas no admiten la voz» y «el
  único dato bueno es `audio.duration`». Es la fila que el handoff mandaba leer
  antes de tocar la voz. Corregida.
- **`CLAUDE.md` describía Mueve y Estira al revés**, y además ahora dice que los
  ids van cruzados.
- **El `ROADMAP` decía «6 de las 20 para cualquiera de las dos voces»**, cierto
  para `bradford` y falso para `sulafat` (son 3).

---

## 7 · Lo que queda abierto

- **El aside de familia en Respira.** Eligió E (que lo lleva) y se corrigió a C
  (que no). Es una línea y está pintado en los marcos D y E.
- **Un tercer chip para Respira**, si lo quiere: el candidato honesto es
  «Discreta» (sin zumbido ni hiperventilación), que dejaría 14 de 20.
- **1,5 px a 360×730** en el runner: las dos pantallas ya coinciden entre sí,
  pero el contenido sigue siendo más alto que el centro. Venía de 29,5.
- **La música**: los briefs están escritos con los números del catálogo
  (`docs/product/MUSICA_RESPIRA_BRIEFS.md`). **Pranayama no cabe en una sola
  pieza con pulso**: va de 2,1 a 30 respiraciones por minuto.
- **Los términos de uso comercial del audio**, sin revisar. La FASE 5 los pide
  por escrito.
- **Las 18 piezas de la 2ª tanda**, sin mirarse.
