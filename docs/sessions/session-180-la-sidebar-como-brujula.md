# s180 · La sidebar como brújula (v0.111.0)

> **El encargo llegó como un brief largo** (sidebar + sesiones CTB musicales). Lo
> que se implementó es la **primera mitad**: la sidebar entera, escritorio y
> móvil. CTB queda **fuera de v1** por decisión del usuario —el ROADMAP no se
> toca— con permiso para un prototipo técnico cuando llegue su turno.
>
> Y la sesión no empezó por código: **empezó pintando**, que es lo que manda la
> decisión de s174.

---

## 0 · Lo que el brief daba por hacer y ya estaba

Antes de tocar nada se cruzó el brief contra el árbol. **Cinco de sus encargos ya
existían**, y decirlo ahorró trabajo:

| El brief pedía | La realidad |
|---|---|
| Repartir el acceso de las tres rondas | Ya estaba: `express` free, `full` y `long` premium (`BreatheLibrary.jsx:17-19`) |
| Usar `canAccessRoutine()` como guard | Ya es el guard central (`state-entitlement.jsx:40`) |
| Retención libre, sin cronómetro ni récord | Ya lo es desde s166 (`stage:'hold'` + `releaseHold()`), y los tres logros de apnea se retiraron |
| El payload de `session.completed` | Ya lleva los siete campos, `plannedSecondsSource` incluido |
| Test «el agua sola no mantiene racha» | Ya lo garantizaba el código (`Sidebar.parts.jsx:157-163`, criterio de s69) |

**Y una contradicción de dirección**: el brief hacía de CTB el argumento Premium
principal, y el ROADMAP dice literalmente, en su sección «Fuera de v1
(explícito)», *«Viajes de respiración con música/facilitadores y CTB»*. Se le
puso delante al usuario y eligió **fuera de v1, prototipo sí**.

---

## 1 · El logo: 716×471 de lienzo para un dibujo de 488×194

El brief pedía medir el canal alfa antes de tocar CSS, y tenía razón en el
procedimiento. Medido:

```
lienzo 716x471 · dibujo visible 488x194
margenes  izq 85 · dcha 143 · arriba 123 · abajo 154
93,53 % del lienzo a alfa 0 · el eje del dibujo cae 29,5 px a la IZQUIERDA
```

Puesto en la banda de 271 px de la sidebar, eso son **178,3 px de alto de los que
104,9 son aire**. Y de regalo, dos cosas que nadie había visto:

- **El comentario de `CowLogo.jsx:234` es falso**: dice que el PNG «viene con
  fondo crema opaco» y el fondo es transparente. Sobre esa premisa se montaron
  `mix-blend-mode` e `invert(1)`.
- **La banda ya se comprimía sola**: `flex-shrink: 1`, contenido 172 px,
  renderizado 164,7 — **7,3 px de compresión** y la imagen desbordándola 13,7.
  No se veía **porque lo que desbordaba era transparencia**. El margen del PNG
  llevaba meses tapando un defecto real.

**No se creó `pace-logo-sidebar.png`.** El `<img id="pace-logo-src">` lo leen DOS
consumidores (`CowLogo.jsx` y `OnboardingScreens.jsx`), así que mover el archivo
le cambiaba el logo al onboarding; y añadir un segundo lo inlinearía otra vez en
el artefacto (~100 KB de base64 por un dibujo que se pinta una vez). **Se recorta
por CSS**, con la aritmética escrita en la hoja para que se pueda rehacer si el
PNG cambia.

---

## 2 · La maqueta, y las tres veces que mis números eran predicciones

La sidebar se aprobó **mirándola**, en `_maqueta-s180-sidebar.html`, sobre cajas
a medida real (280 de ancho, 18 de padding, 1 de borde ⇒ **243 de contenido** y
**271 de banda de logo**). Nueve variantes, cinco secciones y dos ejes de
decisión pintados antes de preguntar.

**Y tres veces escribí un número que no había medido:**

1. Predije que «Hoy» en cuatro filas ocupaba 118 px y en dos columnas 106.
   Medido: **85,0 y 84,3**. La diferencia real es de **0,7 px**, no de 12 — así
   que entre las dos formas no se elige espacio, se elige lectura.
2. Predije la banda del logo en 178,9. Son **178,3**.
3. El método para medir el suelo **mutaba el layout** (`height:auto` + colapsar
   el espaciador) y devolvía **6 px de más en las cuatro variantes**, suficiente
   para voltear un veredicto. Cambiado por uno que no toca nada
   (`scrollHeight` menos lo único elástico) y **estable en tres tomas**.

**El instrumento mintió cuatro veces más**: el navegador cargó la maqueta como
`data:` y las imágenes y fuentes no existían (medí el alto del texto
alternativo); `document.fonts.check()` dijo que las fuentes no cargaban y
cargaban (comprobaba un peso que se pide en diferido); el panel oculto estranguló
el render y dio capturas en blanco y un `requestAnimationFrame` que no dispara; y
medí el solape del chevron **contra la banda** en vez de contra el dibujo.

---

## 3 · Lo que el usuario decidió mirando

- **Logo al 80 %** (A3). Agranda el dibujo un 17 % y **aun así** baja la banda de
  178,3 a 96, porque lo que se va es aire.
- **Hoy en rejilla 2×2, con los glifos** — y el rótulo y las celdas **centrados**
  (J3).
- **La regla del logo vuelve**, con el margen de las otras dos.
- **Fuera la frase del día activo.** No se entendía, y con razón: «hoy ya cuenta»
  no dice **contar para qué**. Se pintaron tres reescrituras y aun así se
  descartó. Se pierde decir en algún sitio que el agua sola no enciende el día.
- **La barra de progreso de la tarjeta, fuera.**
- **H3 para la acción**: la tarjeta solo puede decir CONTINUAR o REPETIR.
- **Móvil = D3**: el logo capado a 200 px. Sin ese tope, a 390 de ancho crecía a
  **121 px de alto** porque escala con el contenedor.

**Los glifos no hubo que dibujarlos.** Pulmones, mancuerna y gota son los de
`ActivityBar.jsx:113-170`, que el BreakMenu ya reutilizaba desde s105: traerlos
**quita** una incoherencia. El único nuevo es **`ABFocus`**, y faltaba por una
razón: en la home Foco no es un cuadrante, **es el aro**. Su glifo es el aro con
la cabeza del recorrido, la firma de s159.

---

## 4 · Tres cosas que la implementación destapó y cambian lo acordado

### La rama «CONTINÚA» de Camino es HOY INALCANZABLE

`PathRunner` monta un overlay a pantalla completa **siempre que `paths.current`
existe** (`PathRunner.jsx:2`), y salir llama a `abandonPath()`, que lo pone a
`null` (`state-paths.jsx:140`). O sea: un Camino en curso **tapa la sidebar**, o
no existe. No hay estado en el que esa tarjeta se pueda ver.

La rama se conserva escrita y documentada —vuelve a estar viva el día que los
Caminos se puedan pausar— pero **no está probada porque no se puede alcanzar**, y
eso se dice en vez de esconderlo.

### El último logro baja al PIE

Con sección propia costaba **~100 px** (rótulo + sello de 38 + fecha), y con esos
100 la sidebar **no cabe a 1280×720 en cuanto aparece la tarjeta de acción**. Se
sigue enseñando **uno**, que es lo que pedía el brief, pero comparte línea con la
colección: es lo que la variante F4 de la maqueta llamaba «el logro se va al pie».

### La celda de Foco no es un botón

Las otras tres abren su módulo. Foco no tiene nada que abrir —el timer **es** la
home— y un control que no hace nada es peor que un dato.

---

## 5 · Dos defectos que introduje yo, y quién los cazó

**El recorte del logo no se aplicaba.** La caja recortaba bien (107,8 px de alto,
correcto) pero el dibujo seguía a **271 × 178,4**: los estilos **en línea** de
`PaceLogoImage` ganan a la hoja sin necesidad de `!important` del otro lado. Es
el mismo mordisco que s174 documentó con el padding en línea del modal. Lo cazó
mirar la app, no leer el CSS. Y de paso estaba al **100 %** cuando el usuario
había elegido **80 %**.

**La celda «Respira» chocaba con el chip de la ActivityBar.** Dos botones con el
mismo nombre accesible ⇒ `getByRole('button', {name: /^Respira/})` deja de ser
único ⇒ **15 tests en rojo y ninguno era del producto**. El arreglo bueno no era
tocar los tests: la etiqueta pasa a **«Abrir Respira»**, que además es lo que un
botón debe decir, conservando el nombre visible dentro (WCAG 2.5.3).

**Y dos veces caí en los backticks dentro del template literal del CSS**, que es
exactamente la trampa que el proyecto tiene anotada desde s139.

---

## 6 · Los tests, y las tres semillas que hacían falta

Nace `tests/sidebar-redesign.spec.js` — **16 asertos**. Tres calibrados en rojo
con mutantes que muerden: el agua encendiendo el día, la acción sin cambiar de
sitio en móvil, y la celda sin su etiqueta.

**Y una lección de calibración**: el primer mutante **no mordió**, y no porque el
test fuera débil — la suite corre sobre `index.html` y yo había mutado la fuente
**sin reconstruir**. Mutar el árbol sin rebuild no prueba nada.

**Tres rojos seguidos con el mismo síntoma** (la sidebar a ceros) antes de dar
con la causa: sembrar `weeklyStats` o `water` **no basta**.

- Sin `lastActiveDay`, `loadState` ve un día nuevo, corre el rollover y
  **archiva la semana**.
- Sin las guardas de migración, `_historyRecalculated_v0_28_8` **recalcula
  `weeklyStats` desde el histórico**, y con histórico vacío la deja a ceros.

Los dos quedan escritos en la cabecera del spec, con el formato de fecha que la
app escribe (`toDateString()`, nunca ISO: regla §10).

**Un test existente cambió de sonda**: `leerLogros` leía el contador «N/M» del
bloque LOGROS del sidebar, que ya no existe. Ahora `leerUltimoLogro` lee **cuál**
fue el último logro, que aserta más que cuántos hay. El contador sigue vivo donde
manda §15.4: el modal de la colección.

---

## 7 · Las tres de pulido

- **El chevron a 24, no a 44.** WCAG 2.2 AA (2.5.8) pide 24×24 y 22 se queda
  corto. **Tampoco 44**, que sería AAA: medido, a 44 el chevron **pisa el dibujo
  23 px**; a 24 lo pisa 3 (el borde) y a 22 lo rozaba 1. Antes del recorte no se
  tocaban nunca — el PNG traía 54 px de aire ahí. **El recorte crea este roce.**
- **En móvil la acción va primera.** El pulgar llega antes a lo que se pulsa que
  a lo que se lee. Orden de DOM y no `order` de CSS (s160).
- **El cajón se cierra al elegir.** Quedarse abierto tapa justo lo que acabas de
  pedir.

**Y mover la acción de sitio destapó un defecto invisible leyendo**: colgar el
`<Divider/>` de cada bloque daba **dos reglas seguidas** en escritorio y ninguna
antes de la tarjeta. Se arregló el diseño, no el síntoma: las secciones se
componen en una lista y **los separadores van entre ellas**, así un bloque que no
se pinta no deja su regla huérfana. Hay un aserto por piel que lo vigila.

---

## 8 · Los números finales

Medidos en la app servida, con la tarjeta de acción presente:

| | |
|---|---|
| Suelo escritorio | **662** — cabe a 1280×720 con 58 px y a 1536×714 con 52 |
| Antes (la sidebar de s179) | **720 exactos, con el espaciador ya a 0** — a 1536×714 ya hacía scroll |
| Banda del logo | 96 px (dibujo 216,9 × 86,2) contra 164,7 (dibujo 271 × 178,4) |
| Móvil 390×844 | sin scroll · logo 200 × 79,5 · chevron 44 × 44 |
| Móvil 320×568 | **sin scroll tampoco** · cero scroll horizontal · pie alcanzable |
| Suite | **169/169** (eran 153) |

---

## 9 · Lo que queda abierto, dicho y no escondido

- **CTB entero.** Fuera de v1. El prototipo musical, el runner conectado, la
  persistencia y la descarga offline no se han tocado.
- **La rama de Camino de la tarjeta**, inalcanzable hasta que los Caminos se
  puedan pausar.
- **La cola que s178 eligió** —gemelo de pie, flexor de cadera contra la mesa,
  aductores sentado, y la decisión sobre `move.chair.antidote`— queda desplazada
  por decisión del usuario, no perdida.
- **El raíl colapsado NO se propuso**: existía y **el usuario lo mandó quitar en
  s9**. Con los glifos nuevos volvería a tener sentido, pero es decisión suya.
- **Que el agua sola no enciende el día** ya no lo dice ninguna superficie.

---

# Segunda mitad · v0.112.0 · la geometría fija

> El usuario prueba en producción lo que se publicó en v0.111.0 y reporta
> **diez cosas**. Tres eran defectos que estaban publicados.

## 10 · La decisión: geometría FIJA

Sus palabras: *«la barra va a disponer de una geometría fija independientemente
de la resolución del desktop»*. La columna mide lo mismo en un portátil que en
un monitor de 1440, con el pie anclado abajo y el sobrante al final.

Es la decisión correcta y la razón es operativa: **un ritmo que cambia con la
pantalla no se puede afinar**, porque cada número vale una cosa distinta en cada
equipo. Con geometría fija, «sube un 20 %» es una instrucción ejecutable.

**Y de paso corrige un error mío que estuvo a la vista todo el tiempo.** Antes
se probó repartir el sobrante entre las reglas con `margin: auto`, y **nunca
repartió nada**: el espaciador con `flex: 1` se comía el sobrante entero — 378
px a 1030 de alto — porque el flex-grow se resuelve **antes** que los márgenes
automáticos. El número estaba impreso en la propia maqueta: la variante «aire
repartido» daba **455 px** de hueco contra los **389** de la que no repartía, o
sea *más*. Lo publiqué como si funcionara.

## 11 · Los ajustes, medidos uno a uno

| | Antes | Ahora | Pedido |
|---|---|---|---|
| Aire sobre el logo | 31,5 | **27,5** | −12 % |
| Del logo a su regla | 35,6 | **28,5** | −20 % |
| Aire sobre «Esta semana» | 19 | **22** | +15 % |
| Tarjeta de Repetir | 98 px | **117 px** | más aire entre líneas |
| Logo (ancho del dibujo) | 216,9 | **173,4** | −20 % |

El primer intento del −20 % se quedó en **−8,6 %**, y la causa es que ese hueco
son **tres sumandos** —la holgura dentro de la banda, el margen del `logoBar` y
el margen de la regla— y yo toqué uno. Bajar un porcentaje exige saber de qué
está hecho el número.

## 12 · Tres defectos que estaban publicados

- **La tarjeta de acción no era clicable entera.** El objetivo eran **74 × 23 px**
  de una tarjeta de 243 × 117. El patrón de s174 necesita un `::after` absoluto,
  y **React no crea pseudo-elementos desde un estilo en línea**: tiene que estar
  en la hoja. Además debe medirse contra la **tarjeta**, no contra el `<h4>` —
  con el `<h4>` posicionado, el centro pasaba y las esquinas de abajo no.
- **La miniatura del logro renderizaba a 16,1 px.** El 62 % venía de cuando eran
  cinco miniaturas diminutas.
- **«1 días en ritmo».** El singular va como clave aparte: en inglés la frase
  entera cambia de forma, y partirla por la palabra obliga a que las dos lenguas
  compartan gramática.

## 13 · El «+» de Agua, y por qué se va

No era «raro»: **pisaba los ocho vasos 17,2 px**. Y era un **segundo objetivo**
dentro de una celda de 117 px. El usuario eligió entre tres opciones que **la
celda entera sume el vaso**, así que el «+» sobra: el objetivo es mucho mayor y
no hay dos controles que distinguir. Es la única celda que **actúa** en vez de
navegar, y su etiqueta lo dice.

## 14 · El método se cobró una

Al retirar el CSS del «+», el corte **se llevó por delante la regla del
`::after`** que acababa de arreglar la clicabilidad. **La cazó su propio test**,
escrito veinte minutos antes, que prueba las **cuatro esquinas y el centro** en
vez de un punto. Cinco minutos, en vez de publicarlo roto por segunda vez.

Es el argumento entero a favor de calibrar en rojo: el test existía porque vi
fallar el defecto, y por eso supo reconocerlo cuando volvió por otra puerta.

## 15 · El último logro recupera su rótulo

En v0.111.0 bajó al pie por espacio y el usuario lo reportó: ahí «se entiende
raro». **Era el mismo problema que el hueco del final** — al quitarle la sección
se quedó sin lo que lo explicaba. Vuelve como sección compacta en el orden que
eligió: **Hoy → Continúa → Último logro → Esta semana**.

## 16 · Lo que queda para la siguiente

- **CTB entero**, fuera de v1, con permiso de prototipo.
- **La cola de s178**: gemelo de pie, flexor de cadera contra la mesa, aductores
  sentado, y la decisión sobre `move.chair.antidote`.
- **El móvil no se ha revisado con estos ojos**: lleva sus propios números
  (10/10 en vez de 14/14) y nadie los ha mirado a tamaño real.
- **La rama «CONTINÚA» de Camino sigue inalcanzable** y sin probar.
- **Escalar el contenido con la resolución queda DESCARTADO** por la decisión de
  geometría fija.
