# s181 · La sidebar que encoge entera, y la tarjeta que se amputaba sola

> **v0.113.0.** Cierra el trabajo que s180 dejó sin commitear y resuelve el
> problema de altura que su handoff dejó ABIERTO — con un diagnóstico distinto
> del que ese handoff daba por bueno, y con una solución que el usuario eligió
> mirándola, después de tirar la que yo había construido.

---

## 0 · De dónde se partía

`docs/HANDOFF_s180.md` dejaba tres cosas: decidir el problema de altura, revisar
el móvil, y commitear o revertir. Del problema de altura decía esto:

> «El contenido mide ~747 px y a 1536×714 hace scroll. […] Se le dieron tres
> salidas y no eligió ninguna todavía: aceptarlo, sacar 1536×714 de los
> objetivos, o recortar ~33 px.»

**Ese párrafo era falso en el número y en el síntoma**, y las tres salidas que
ofrecía estaban mal planteadas por culpa de eso.

---

## 1 · El número del handoff era el suelo comprimido, no la altura

Los 747 px eran reales, pero no eran la altura del contenido: eran **el suelo
con la tarjeta ya aplastada**. La altura natural era **835,9 px**, y lo dijeron
dos cuentas independientes que coincidieron:

- la suma de las piezas menos el chevron (que es `position: absolute` y no ocupa
  columna) daba **835,9**;
- el primer viewport donde no sobraba nada daba **836**.

### El mecanismo, localizado

`sidebarStyles.accion` lleva `overflow: 'hidden'`. Eso **apaga el tamaño mínimo
automático del flex**, que sólo se aplica cuando `overflow` vale `visible`.
Medido: los doce hijos de la columna tenían `flex-shrink: 1` y `min-height:
auto`, y **once estaban protegidos por ese mínimo. La tarjeta no.** Era la única
pieza comprimible, así que absorbía el déficit entero — y como su contenido
interior no se mueve (`Para ahora` en y=15,8, el nombre en y=40,3, la meta en
y=72,9, idénticos comprimida o no), lo que quedaba por debajo del recorte **se
amputaba**.

### Dos umbrales, no uno

| viewport | desborde | tarjeta |
|---|---|---|
| 714 | 36 px | **33,0** — sólo el rótulo |
| 750 | 0 | 35,7 |
| 800 | 0 | 83,1 |
| 836 | 0 | **117,3** íntegra |

Por debajo de **836** la tarjeta perdía contenido; entre **750 y 836** lo perdía
**sin barra de scroll que avisara**. A 1536×714 la tarjeta era una caja con
«PARA AHORA» y nada dentro.

### Y no lo introducía el trabajo sin commitear

`git show HEAD:app/shell/Sidebar.support.jsx` traía la misma línea con el mismo
`overflow: hidden`, y sirviendo HEAD en paralelo a 1536×714 **desbordaba 50 px**,
más que los 36 del árbol. Lo que cambiaba el trabajo nuevo es que la tarjeta
ahora está **siempre** (rama `suggest`), así que el defecto pasaba de salir sólo
los días con algo que continuar a salir todos los días.

**Consecuencia para las tres salidas del handoff:** «recortar ~33 px» habría
quitado la barra de scroll y dejado la tarjeta exactamente igual de amputada.

---

## 2 · Construí la solución equivocada, y el usuario la tiró mirándola

Con la instrucción «tiene que caber todo tal y como está en cualquier resolución
sin scroll», hice un censo de aire: de los 835,9 px, unos **634 eran tinta** y
~200 aire. Apuré ese aire y bajé la columna a **700,3 px** sin quitar ninguna
sección — 135,6 px repartidos en ocho piezas, de los cuales **56 salían sólo de
las cuatro reglas** (márgenes de 12 a 5).

Funcionaba: desborde 0 y tarjeta a 109,6 px a 714, 720, 750, 836 y 1000. Lo
publiqué como artefacto para que se viera al tamaño real.

**Y el usuario lo rechazó en cuanto lo vio**, con la instrucción que lo resuelve
de verdad:

> «Si hay que hacer a la vez pequeños a TODOS los elementos de la sidebar,
> perfecto.»

La diferencia importa y es de fondo: **apretar el aire cambia las proporciones**
—las reglas encogen y el texto no—, mientras que **una escala uniforme no cambia
ninguna**. Es la misma sidebar, más pequeña. La compactación se tiró entera.

---

## 3 · Lo que se implementó

### La escala

Una envoltura (`[data-pace-sidebar-escala]`) con `transform: scale(var(--sb-escala))`,
`transform-origin: top left` y `width`/`min-height` a `calc(100% / var(--sb-escala))`.
Los dos `calc` no son adorno: una transformación **no cambia la caja de layout**,
así que para que el resultado escalado mida justo lo disponible, la caja sin
escalar tiene que medir eso dividido entre el factor.

El factor lo calcula `Sidebar.jsx`: mide el alto natural sumando `offsetHeight` +
márgenes de los hijos —valores de LAYOUT, que la transformación no toca, al
contrario que `getBoundingClientRect`— y lo divide entre el alto de la lente.
**Nunca agranda**: `Math.min(1, …)`, así que por encima del tamaño natural se
queda quieta y el sobrante va al espaciador, que es la geometría fija de
v0.112.0.

Resultado medido: escala **1 · 0,926 · 0,822 · 0,708** a 1000/800/714/620, con el
pie terminando **siempre a 18 px** del borde.

### La lente, que no estaba en el plan

La envoltura desborda **52 px en horizontal** en layout (mide `100%/escala` de
ancho) aunque a la vista quepa. Ese desborde llegaba al `<aside>` y **tumbaba un
guard que ya existía** contra el scroll lateral. La respuesta correcta no era
aflojar el guard sino que el desborde muriera antes: una caja intermedia
(`[data-pace-sidebar-lente]`) con `overflow: hidden` **sólo cuando hay escala de
verdad**. Con `data-escalado` a 0 el aside conserva su `overflow-y: auto`, así
que si el cálculo no llegara a correr saldría scroll —el comportamiento de
siempre— y nunca un recorte mudo.

### Los minutos de Hoy, alineados

`puntosSesion` devolvía **`null`** sin sesiones, así que Foco, Respira y Cuerpo
no tenían fila de bolas y Agua sí (sus ocho vasos van siempre). Como el valor
lleva `marginTop: auto`, en las tres primeras caía al fondo de la celda y en Agua
se quedaba una fila más arriba: **los cuatro números de una misma rejilla no
compartían línea**. Ahora la fila se pinta siempre con `minHeight: 7` —el alto
exacto de una gota— y los cuatro valores están a `top` 57,6. El día que aparezca
la primera bola, nada se mueve de sitio.

### La estructura, contra la referencia del usuario

Trajo una maqueta y dijo «el espaciado, elementos y demás es la referencia».
Salieron dos diferencias reales: **una regla nueva entre «Mis rutinas» y la pill
de apoyo**, y **la pill naranja en «Mis rutinas»** (forma de `SupportButton`,
color de `--premium`).

**Y una lectura mía equivocada, que costó una vuelta:** de su segunda captura
deduje que la regla entre el logo y la semana se había ido, y la quité. La
tercera —con su «así está perfecto»— la mostraba puesta. Se restauró. De paso
quedó comprobado que **el `marginBottom` del `logoBar` depende de esa regla**: al
quitarla el aire bajo el dibujo cayó a **13,5 px contra 25,5 arriba**, justo lo
que avisaba su comentario.

---

## 4 · El rojo intermitente tenía razón, y era del producto

Uno de cada tres. El aserto que caía: a 1000 px de alto la escala debía ser 1 y
daba 0,8291 — **exactamente el valor del arranque a 720**.

La causa **no era del test**: el alto natural depende de las métricas de la
fuente, así que **si las webfonts terminan de cargar después de calcular la
escala, el número queda hecho con la fuente de reserva y nada lo corrige** — el
observador vigila la caja, y la caja no cambia porque cambien las fuentes. En una
conexión lenta eso dejaba la sidebar mal escalada de forma permanente. Se arregla
recalculando también en `document.fonts.ready`.

---

## 5 · Las mentiras del instrumento

1. **Fotografié mi propia mutación.** Dos capturas del mismo viewport se
   contradecían; en la página quedaba un `height: 860px` en línea de mi medición
   anterior. Toda captura, desde carga limpia.
2. **`page.setViewportSize()` de Playwright no emite `resize`.** Cero eventos con
   `innerHeight` ya cambiado, y la escala clavada en el valor del arranque a los
   seis altos mientras el ratio real iba de 1,17 a 0,71.
3. **El `ResizeObserver` tampoco se dispara sobre la lente** en ese headless —
   aunque un RO sobre un div de prueba **sí** reacciona al viewport. En el
   navegador de verdad las dos vías funcionan, comprobado a mano (1000 → escala
   1, 640 → 0,7357). El test emite el evento y **declara que el camino del
   observador se queda sin cubrir**.
4. **`requestAnimationFrame` no dispara con el panel oculto** y colgó una
   medición 45 s. Leyendo `offsetHeight` se fuerza el reflujo igual.
5. **Un script mío resolvía los nombres ingleses con una función inexistente** y
   midió español dos veces dando «178 nombres comprobados».
6. **`ACHIEVEMENT_CATALOG` es un array**, así que pasarle índices como ids
   devolvía títulos «0», «1», «2» — y una tabla de 96 filas idénticas.
7. **Mi propio control positivo estaba mal diseñado**: 120 equis seguidas son una
   palabra impartible, y en una fila flex eso ensancha el ítem en vez de
   partirlo. Con palabras normales, 9 de ellas movían la columna 12,8 px.

El patrón de la 5, 6 y 7 es el mismo y ya tiene nombre en este repo: **216
entradas distintas devolviendo el mismo número no es un resultado, es que la
inyección no llega**. Lo cazó el control positivo, que por eso se pone.

---

## 6 · Lo que costó de oficina

- **Backticks dentro del template literal del CSS**, otra vez. Van cuatro (tres
  en s180, una aquí). El `verify` los caza siempre como error de sintaxis.
- **Las comillas dobles del shell ejecutan los backticks**: un `python -c "…"`
  se comió `\`safety\`` y `\`canAccessRoutine\`` de un comentario y los dejó en
  blanco. Se escribe por stdin con heredoc entrecomillado.
- **La regla §1 saltó dos veces.** `tests/sidebar-redesign.spec.js` llegó a 557 →
  nace `tests/sidebar-altura.spec.js`. `app/shell/Sidebar.support.jsx` llegó a
  526 → nace `app/shell/Sidebar.hoja.jsx`. Los dos cortes por una costura que el
  propio archivo ya declaraba, no por kilometraje.

---

## 7 · Los tests, calibrados en rojo

`tests/sidebar-altura.spec.js`, tres asertos:

1. **Cabe entera y nada se recorta** a 1000, 836, 800, 714, 660 y 620.
2. **La composición es la misma en todo monitor**: las alturas de LAYOUT son
   idénticas y sólo cambia el factor; a 1000 la escala es exactamente 1 y la
   marca 0; a 620 hay escala de verdad.
3. **Encoger no hunde los objetivos táctiles** por debajo de WCAG 2.2 AA.

De la primera versión de estos tests salieron dos lecciones. El aserto de
amputación **no podía fallar** donde lo puse (a 714 ya no hay déficit), así que
se movió a 640, que es donde el defecto puede existir. Y al calibrar, el rojo
salía **por el guard y no por el aserto** —«la columna no desborda», que es
cierto pero señala el efecto en vez de la causa—, así que se reordenaron: ahora
el primer rojo dice «la tarjeta encoge al apretar la columna», esperaba 109,6 y
recibió 52.

---

## 8 · El precio de la decisión, dicho y medido

**La escala encoge también lo que se pulsa.** A 1280×720 el bloque de la semana
pasa de 45 px a **37,1**. Sigue muy por encima del mínimo de WCAG 2.2 AA (24×24,
criterio 2.5.8), pero por debajo de los 44 que s180 buscó a propósito. Lleva su
propio aserto para que no baje más sin avisar.

---

## 9 · Lo que queda abierto

- **El móvil no se ha revisado** con estos ojos. La escala está desactivada por
  debajo de 768 px a propósito (el cajón tiene `height: auto` y allí el scroll es
  correcto por diseño), pero nadie ha mirado el cajón a tamaño real desde el
  rediseño de s180. Decisión del usuario: después de commitear.
- **La pill naranja de «Mis rutinas» es lo más llamativo de la columna** — fondo
  tintado más borde a plena fuerza. El usuario la aceptó «de momento»; quitarle
  el fondo la calmaría sin dejar de ser naranja.
- **Dos cosas de su maqueta que NO se copiaron**, porque avisó de que algún
  elemento podía no estar bien colocado: en su imagen **no aparece el lema** y
  **«Ver la colección» va a la derecha**.
- **Riesgo latente de la escala**: el ancho de la envoltura es `100%/escala`, así
  que si algún texto llegara a partirse en dos líneas a un ancho y no a otro, el
  alto natural dependería del factor. Hoy **no pasa** —comprobado con los 178
  nombres ingleses de rutina y los 96 títulos de logro, ninguno parte— y el
  aserto de «la composición es la misma» es justo el que lo cazaría.
- **Defecto previo y publicado, encontrado de paso**: con la app en inglés, el
  título del último logro sale en español («Regresas» en vez de «You return»).
  `achMini()` devuelve `a.title` sin pasar por i18n, mientras que
  `Achievements.jsx:232` lo hace bien con `tR(…)`. Está en HEAD.
