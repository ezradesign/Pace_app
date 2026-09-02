# Sesión 182 · El cajón de móvil encoge también, y el censo que un troceo dejó ciego

> **v0.114.0.** Los tres encargos que el usuario sacó de mirar la revisión de
> s181, medidos y **pintados antes de decidir**; y la pregunta de los glifos,
> contestada con un cruce que hubo que arreglar dos veces.
>
> Suite **173 → 185**. `npm run verify` en verde. Seis mutantes calibrados en rojo.

---

## 0 · Cómo empezó

El handoff de s181 dejaba tres encargos «ya medidos» y una pregunta sobre glifos.
La sesión no tuvo que diagnosticar casi nada: tuvo que **desconfiar de sus
propios números**, y con razón, porque dos de ellos eran falsos.

---

## 1 · Los tres encargos

### A · «375 × 844 sale cortada por la derecha» — no era de la app

Verificado y cerrado sin tocar código: a 375×844 el cajón llega a `right = 375`,
el documento da `scrollWidth − clientHeight = 0` y **queda 0 px fuera de la
primera pantalla**. El corte era del carrusel horizontal de la propia página de
revisión de s181, que recortaba capturas sin decirlo.

**La lección, que ya costó una persecución:** una página que se monta para
revisar es un instrumento, y un instrumento que recorta en silencio manda a
alguien a buscar un defecto que no existe. La revisión nueva monta las bandas
con `flex-wrap`, y lo dice en su propio texto.

### B · El aire de la caja «Para ahora»

Medido: bajo la última línea de la tarjeta hay **28 px** (16 de
`padding-bottom` + ~12 del descender). Bajarlo a 8 devuelve **8 px exactos**, y
a 428×800 eso mueve el pie de estar **1,4 px por debajo del borde** a tener
**6,6 px dentro** — o sea, de invisible a visible.

**Va sólo en móvil**, en la hoja y no en `sidebarStyles.accion`, porque ese
objeto lo comparten las dos pieles y en escritorio ese aire se afinó mirándolo
en s180. Y **lleva `!important` por necesidad**: el padding lo pone un estilo en
línea, que gana a la hoja sin que haga falta `!important` del otro lado — la
misma trampa que s180 pagó con el recorte del logo.

### C · La escala en móvil — y el número mío que era falso

El handoff proponía un suelo de 0,85 con este razonamiento: «0,85 × 780 = 663,
así que todo viewport de 667 para arriba entraría entero». **Medido, es falso:**
a 375×667 con 0,85 todavía quedan **38 px fuera**.

Faltaba contar el propio cajón. Tiene **22 px de padding arriba y abajo** más un
`min-height: calc(100dvh + 1px)`, así que a 667 el alto disponible son **622**, no
667. El número estaba construido sobre el viewport en vez de sobre el hueco.

> **Es el mismo modo de fallo que s181 ya documentó de sí misma** —«un número de
> mi propio handoff era falso y viciaba las tres opciones que ofrecía»— y ha
> vuelto a pasar en el handoff siguiente. Un número heredado se vuelve a medir,
> aunque lo haya escrito yo.

**Se pintaron las opciones antes de preguntar**, que es la regla del repo desde
s173/s174: 30 capturas, seis viewports × cinco variantes, cada una al tamaño de
píxel CSS de su pantalla, publicadas como artefacto.

**Y la respuesta del usuario no fue ninguna de las cuatro opciones que ofrecí:**
*«escalarla en todas las resoluciones que quede bien y en las más pequeñas
aceptamos un pequeño scroll sin barra»*. Las cuatro opciones eran «sí con este
suelo» o «no»; su respuesta añade un requisito que ninguna llevaba —**sin
barra**— y delega el suelo en una medida.

---

## 2 · El suelo, elegido por dos medidas y no a ojo

`SUELO_CAJON = 0,80`, en `app/shell/Sidebar.escala.jsx`. Sale de:

- **el objetivo táctil**: el bloque de la semana, que s180 afinó a 45 px, se
  queda en **36** — holgado sobre el mínimo de WCAG 2.2 AA (2.5.8, 24×24 CSS px)
  y lo último que se puede ceder sin acercarse a él;
- **una pantalla concreta**: hace caber entero **375×667**, el iPhone SE / 8, que
  es la pantalla corta más común.

| viewport | escala | fuera | el pie termina a |
|---|---|---|---|
| 360 × 560 | **0,80** (suelo) | 101 px | −79,1 |
| 360 × 640 | **0,80** (suelo) | 21 px (sólo padding) | +0,9 |
| 375 × 667 | 0,809 | **0** | +21,5 |
| 390 × 736 | 0,898 | **0** | +21,5 |
| 428 × 800 | 0,981 | **0** | +21,6 |
| 375 × 844 | 1 | **0** | +50,6 |

El precio, dicho con los ojos abiertos: el texto secundario de 11 px se ve a
**8,8**, y las iniciales de los días, que son de 9, a **7,2**.

---

## 3 · Lo que la implementación tuvo que resolver, y no estaba en el plan

### El alto disponible no se pregunta en el mismo sitio en las dos pieles

En escritorio la lente es un hijo **flexible** y su `clientHeight` ya es el hueco
real. En el cajón es `display: block` y **se dimensiona al contenido**, así que
preguntarle devuelve el alto natural y **la escala sale exactamente 1**: sin
error, sin aviso y sin efecto. Verde, silencioso y falso. Allí manda
`aside.clientHeight` menos su propio padding.

### Y el revés del mismo hecho: la lente hay que altarla a mano

Una transformación no cambia la caja de layout, así que el alto que la columna
escalada **ocupa** tampoco lo sabe el CSS del cajón. Lo escribe el motor en
`--sb-alto` y la hoja sólo lo consume. Si ese número fuera menor que el contenido
escalado, la lente —que lleva `overflow: hidden`— se comería el pie **sin barra
que lo dijera**: exactamente el recorte mudo que toda esta geometría existe para
evitar. Por eso el test no mira alturas: **hace scroll y comprueba que el pie se
ve**.

### El observador tuvo que cambiar, y la guarda dejó de ser una optimización

En el cajón la lente ya no puede avisar de nada, porque su alto **lo escribimos
nosotros, después del cálculo**. Quien avisa allí es el aside, cuyo alto fija el
viewport. Se observan los dos. Y como ahora observamos algo que nosotros mismos
escribimos, la guarda de valor de `aplicar()` pasa de ahorrar escrituras a
**cortar un bucle**: converge en una pasada porque la segunda lee los mismos
números y no escribe.

### La regla §1 mordió, y el troceo tiene costura propia

`Sidebar.jsx` llegó a **506 líneas**. El motor de la escala salió a
`Sidebar.escala.jsx`: `Sidebar.jsx` es el orquestador —compone secciones, no
dibuja ni decide ninguna— y esto es geometría que mide el DOM y escribe dos
custom properties. Misma costura que separó la hoja en s181. Queda en **318**.

---

## 4 · EL BANCO FOTOGRAFIÓ SU PROPIA MUTACIÓN

Con la escala ya implementada, corrí el banco para medir el producto real y me
devolvió esto:

```
375x667   HOY   escala 1.0005   fuera 0   pie -126.4
```

Tres cosas incompatibles en una fila: escala 1, cero desborde y el pie 126 px por
debajo del borde. **Ninguna tabla que se contradice a sí misma vale nada.**

La causa: la limpieza entre variantes del banco hacía
`caja.style.removeProperty('--sb-escala')`, y **`--sb-escala` es exactamente
donde escribe la implementación**. Como `aplicar()` lleva memo, el producto no la
volvía a escribir nunca. El banco borraba la escala del producto y luego
fotografiaba su propio borrado. En vivo la app estaba a **0,8083**.

**Es la trampa que el handoff de s181 lista con nombre** —«no fotografiar tras
medir: una medición que muta el DOM y luego se captura enseña la mutación»— y
volvió a morder, en la sesión siguiente, en el mismo banco.

Dos arreglos, y el segundo es el que importa:

1. **Cada variante recarga la página.** Ninguna hereda el estado de la anterior.
2. **El banco cruza dos instrumentos independientes**: la escala *geométrica*
   (rect ÷ offsetHeight) contra lo que el *producto* dice en `--sb-escala`. Si no
   coinciden, **se para con un error** en vez de imprimir una fila creíble.

---

## 5 · Los glifos: la pregunta del usuario, y un censo ciego desde s178

> «Los ejercicios nuevos de Mueve y Estira a los que aún les faltan glifos,
> ¿dónde están? No los veo en el listado.»

**No los ve porque no faltan.** Las tres rutinas de oficina de s178
(`move.hips.standing`, `move.hamstrings.standing`, `move.spine.chair`) reutilizan
ejercicios que ya tenían arte: **15 de 15 pasos**, verificado uno a uno.

El cruce del handoff decía «61 identidades, 61 sin entrada», que no era un
resultado sino un cruce roto: el mapa está indexado por **nombre** de identidad y
se estaba leyendo el archivo a pelo. Hecho por el camino de la ingesta
(`leerMapaExistente()`), con control positivo en los dos sentidos:

| | |
|---|---|
| Identidades que la app pide | **62** |
| Con arte ingestado | **59** |
| Sin arte | **3** — `Nordics`, `Pica en escritorio`, `Rana` |
| Arte que nadie pide | **0** |

Y los documentos ya decían eso. Lo que despista es que `GLIFOS_A_DIBUJAR.md`
lista `descanso` en vez de `Nordics`, y **está escrito allí a propósito**:
`Nordics` salió de la cola (sólo vive en el constructor y ya tiene SVG) y
`Descanso` entró aunque el censo lo excluya por no ser un ejercicio.

### Pero el instrumento sí estaba roto

`scripts/ingest-glifos-ejercicio.censo.js` sacaba los pasos de Estira con una
expresión regular sobre `app/extra/ExtraModule.jsx`. **s178 troceó ese dato** a
`extra.data.js` + `extra.data.piernas.js` y dejó `ExtraModule.jsx` con **cero
pasos**. El censo siguió dando un número creíble —**61 en vez de 62**— porque el
registro tapaba 24 de las 25 identidades de Estira. La que se perdía,
`Puente isquio a una pierna`, **sí tiene arte**: regenerar el encargo habría
escrito una identidad de menos y una fila de arte aparentemente huérfana.

> **Es la TERCERA vez que este censo da un número erróneo y creíble** (s164: 61 ·
> s172: el patrón pedía `mode:` y los pasos legacy declaran `dur:` · s182: el
> archivo se vació), y las tres veces el síntoma fue el mismo: un total redondo
> que coincidía con otro censo que arrastraba el mismo punto ciego.

Arreglado leyendo `window.MOVE_ROUTINES` y `window.EXTRA_ROUTINES` **ya
evaluados**, que es lo que la app consume: un troceo más no puede volver a
cegarlo. Con **guard de cero por módulo**, calibrado reproduciendo el fallo de
s178 exacto (el primer mutante que probé —vaciar `EXTRA_ROUTINES` en el primer
archivo— **no mordió**, porque `extra.data.piernas.js` añade sus grupos con
`Object.assign` y el catálogo no quedaba a cero).

**Prueba de que el arreglo es correcto:** regenerado
`GLIFOS_EJERCICIOS_PENDIENTES.md`, sale **idéntico byte a byte** al commiteado.

**Y quién no lo vigilaba, dicho:** `verify.encargo.js` es de los glifos de
**logro**, y `verify.mascaras.js` declara por escrito que no comprueba que toda
identidad tenga fila. El alcance de los dos era correcto; el hueco estaba
declarado y se llenaba con el generador, que era justo lo roto.

---

## 6 · La red

`tests/sidebar-movil.spec.js`, **12 asertos**. Cada viewport es su propio
`describe` con `test.use` en vez de `setViewportSize`: así la página nace en su
tamaño y se prueba el camino que recorre un teléfono al abrir, sin el parche de
emitir `resize` a mano que el spec de escritorio necesita (Playwright no lo
emite, y el `ResizeObserver` no dispara en headless — medido en s181).

Calibración: **6 mutantes sobre `index.html`**, que es lo que la suite lee —mutar
el árbol sin reconstruir no prueba nada (s180)—, y **los 6 mordieron**:

| mutante | rojos |
|---|---|
| vuelve el apagado de móvil (`transform: none`) | 4 |
| la lente pierde su alto (vuelve a `auto`) | 3 |
| la lente recorta 60 px de más | 2 |
| vuelve la barra de scroll | 1 |
| el recorte del aire se va al objeto compartido | 1 |
| suelo temerario (0,5) | 2 |

El de la barra y el del objeto compartido muerden **uno cada uno** a propósito:
son los dos asertos por lado. Que en móvil el padding esté recortado no prueba
que en escritorio siga entero.

Y un aserto que faltaba y se añadió al ver la calibración: **el de WCAG**. El
test que comprueba el suelo le *pregunta* el número a la app —copiarlo dejaría el
aserto verde el día que alguien lo mueva— y por eso mismo **no puede cazar un
suelo temerario**. El de WCAG sí: a 0,5 la semana bajaría a 22,5 px y se pone
rojo.

---

## 7 · Dos rojos que no eran del producto, y cómo se supo

La primera pasada de la suite dio **2 rojos y 171 verdes**, los dos en
`home-geometria.spec.js` y los dos por `Test timeout of 60000ms exceeded` — uno
de ellos llamado, para más señas, «el contador del Pomodoro no dispara el
observador de montaje», justo después de que yo añadiera un observador.

No se dio por ruido. Lo que lo cerró fueron dos hechos: el run entero tardó
**31,3 minutos** en vez de ~1,5 (corrí el censo y el generador encima de la
suite, que es la contención de memoria que `playwright.config.js` documenta), y
esos mismos dos tests corridos solos pasan en **1,1 s y 1,6 s** — un margen de 50×
sobre su timeout. La suite completa, corrida sola: **185/185 en 3,3 min**.

---

## 8 · Lo que queda dicho y no hecho

- **360 × 560 sigue desplazándose 101 px** y **360 × 640, 21** (que es sólo el
  padding). Es la decisión del usuario, no un defecto pendiente.
- **La pill naranja de «Mis rutinas»** sigue siendo lo más llamativo de la
  columna. Sin tocar.
- **Dos cosas de la maqueta del usuario** que nunca se copiaron: el lema no
  aparecía en su imagen y «Ver la colección» iba a la derecha.
- **Defecto previo y publicado**: con la app en inglés, el título del último
  logro sale en español. `achMini()` en `Sidebar.parts.jsx` devuelve `a.title`
  sin pasar por i18n; la traducción existe.
- **El índice de decisiones de `STATE.md`** seguía listando «La tarjeta de la
  sidebar solo puede decir CONTINUAR o REPETIR: NUNCA sugiere» **sin la marca de
  anulada**, cuando el documento que gobierna la anuló dentro de la propia s180.
  Detectado al comprobar por qué la tarjeta dice «Para ahora»; corregido.
