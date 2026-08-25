# s173 · LA INGESTA DEJA DE SER TODO-O-NADA, Y LAS LIBRERÍAS SE DISEÑAN MIRÁNDOLAS

**v0.103.0** · `npm run verify` PASA · `npm run test:e2e` **115/115** ·
`PACE_standalone.html` intacto en v0.71.0.

> La sesión abrió con el plan del handoff —retención, arte, `Puente torácico`— y
> se fue por otro sitio en cuanto el usuario dijo «he añadido 4 glifos». Lo que
> salió: **`--fusionar`**, que mata la trampa más cara de la ingesta; **las
> primeras comprobaciones relacionales del arte de ejercicio**; y un bloque de
> diseño largo que deja el rediseño de las tres librerías **aprobado y sin
> implementar**. La retención sigue sin tocarse.

---

## 1 · Las 4 piezas nuevas, y por qué no entraban

El usuario dejó cuatro dibujos. Identificados mirándolos y **contrastados con su
cue del catálogo**, que es quien manda (lección de s172):

| Archivo | Es | ¿Casa con su cue? |
|---|---|---|
| `asset_hrsndcxk5` | **Fondos en silla** | sí — y **ahora sí sale la silla** |
| `asset_mpv6fmqnm` | **Onda espinal** | sí |
| `asset_wqzorugdt` | **Puente isquio a una pierna** | sí |
| `asset_8z7zeo4s1` | **Deslizamientos en pared** | sí — corrige la contradicción de s172 |

Dos son **sustituciones** y dos **identidades nuevas**: 57 → **59 de 62**.

**Pero la ingesta no podía meterlas.** El `--seco` sobre la carpeta del usuario dio
**62 identidades, 102 PNG, 0 emparejados, 102 huérfanos**: los originales llegan con
nombres opacos (`asset_*.png`) y el emparejamiento es por slug. Y renombrando sólo
esas cuatro, el mapa **se reescribe entero** desde los emparejados, así que las otras
57 desaparecen del mapa y del precache.

La vía de s171 —reconstruir el set emparejando por CONTENIDO— se probó y **no sale
limpia**: firma de tinta a 32×32, peor pareja **0,383** (s171 reportó 0,849), once
piezas por debajo de 0,8 y dos PNG reclamados por dos máscaras. Hay 73 imágenes
distintas para 61 necesarias, así que es reconstruible, pero no a ciegas.

---

## 2 · `--fusionar`

La escritura del mapa y del precache sale a **`ingest-glifos-ejercicio.mapa.js`**
junto con la fusión, porque son la misma decisión. En modo fusión las identidades
que **no** vienen en la carpeta conservan su fila.

**Lo que NO se relaja**, y es lo que lo hace seguro:

- una fila conservada tiene que apuntar a un archivo **que exista**; si no, aborta
  sin escribir ni el mapa ni el precache;
- si el mapa existente no da **ni una** fila reconocible, es **fallo explícito** —
  cero elementos reconocidos no puede parecerse a un censo limpio;
- un **PNG huérfano** sigue siendo salida 1 en los dos modos.

**El código de salida cambia de significado en la otra mitad.** Sin fusión,
«identidad sin dibujo» quiere decir «va a PERDER su fila»: es un fallo. Con fusión
quiere decir «sigue esperando arte», que es el estado normal mientras la cola no esté
vacía — hoy son tres. Un exit code que siempre vale 1 no es una red: es un exit code
que se aprende a ignorar.

**Calibrado con tres mutantes del módulo**: quitar el guard de cero pone en rojo B y
sólo B; quitar el `existsSync` pone en rojo C y sólo C; quitar la fusión pone en rojo
A y D. Y el control que enseña la diferencia, en seco sobre la misma carpeta:

| | sin `--fusionar` | con `--fusionar` |
|---|---|---|
| identidades «sin dibujo» | **58** (el mapa se queda en 4) | **3** |
| filas del mapa al escribir | 4 | **59** |

Resultado real: `4 ingestadas + 55 conservadas`, **59 filas**, **118 de precache**.
Y lo confirma `git`: sólo las 2 sustituidas salen modificadas, las otras 55 ni se
tocaron.

**El troceo se cobró su peaje.** El script llegó a **511 líneas** y el censo salió a
`ingest-glifos-ejercicio.censo.js` (regla §1: trocear, no recortar comentarios). Al
mover `identidadesVisuales()` hubo que **redeclarar `ROOT`**: mismo modo de fallo que
el crash de s144, y ahí el `verify` no mira porque su análisis de ámbito es del
artefacto compilado, no de `scripts/`.

---

## 3 · Nace `verify.mascaras.js`

El arte de EJERCICIO **no tenía ni una comprobación relacional**: el precache cruzaba
sus filas con el mapa de **logros** y nada más. Los 59 dibujos entraban al mapa, al
disco y al precache por tres caminos que nadie contrastaba.

Eso importaba poco mientras la ingesta fuera todo-o-nada. `--fusionar` abre un modo de
fallo nuevo y **mudo**: una fila conservada apuntando a un archivo que ya no está, o un
`.webp` en disco sin fila. Ninguna rompe nada en pantalla — **el glifo cae a su SVG
viejo y el usuario ve otro ejercicio**.

Cinco comprobaciones, todas RELACIONALES y **en los dos sentidos**, con sus **cinco
rojos verificados**:

| Rojo provocado | Lo que dijo |
|---|---|
| borrar `plancha.webp` | `1 fila(s) del mapa SIN archivo en disco (Plancha)` |
| meter un `.webp` intruso | `1 .webp en disco que NINGUNA fila reclama` |
| quitar la miniatura del mapa | `1 identidad(es) con mascara grande y SIN miniatura` |
| quitar una fila de precache | `1 mascara(s) de EJERCICIO que NO estan precacheadas` |
| **vaciar `EXERCISE_MASKS`** | **el guard de cero, y SÓLO el guard** |

Ese último justifica a los otros cuatro: con el mapa vacío **las cuatro relacionales
cruzaban conjuntos vacíos y salían VERDES**. Los ficheros quedaron restaurados byte a
byte (md5 comprobado).

`CENSO.precache` **219 → 223**: +4 porque sólo hay **dos identidades nuevas**; las dos
sustituciones reutilizan su fila.

---

## 4 · Verificado en la app, no sólo en el verify

Servido `index.html` y conducido: el runner pinta `fondos-en-silla.webp` a **188×188**
con el token del módulo, la miniatura del preview `fondos-en-silla.min.webp` a
**30×30**, las dos **200 OK**, cero errores de consola. `Descanso` y `Rana` devuelven
`null` y caen a su SVG, que es lo correcto.

---

## 5 · El arte que queda, y una trampa que sólo se ve con el dibujo en la mano

La cola baja de **7 a 3**: `Descanso` (18 apariciones), `Pica en escritorio`, `Rana`.

**`Descanso` NO entra por la ingesta tal cual está.** Está excluido a mano del censo
—`if (n && n !== 'Descanso')`, con el comentario «no es un ejercicio»— así que un
`descanso.png` en la carpeta sale listado como **huérfano**. Hay que decidir antes si
pasa a ser la identidad nº 63 o si su arte entra por otra vía.

**Y su ficha estaba mal desde hacía dos sesiones.** Pedía «figura sentada en una
silla», y medido: **11 de los 18 descansos ocurren en rutinas `standing`**, 5 en
`seated` y 2 en `floor`. Una silla contradice 13 de 18. Al buscar alternativa salió que
**las cuatro poses tranquilas obvias ya están cogidas** (sentado en silla es `Hueco en
silla`; sentado en el suelo sale tres veces; de pie quieto son `Reset respiración` y
`Onda espinal`), así que la ficha pasa a **recuperar el aliento de pie y de frente**,
que es lo único que dice «he parado» en vez de «estoy en una postura».

Se corrigió también la regla 3 del preámbulo: **«sin rojo» ya no aplica** — las cuatro
piezas vinieron con el músculo en rojo y entraron limpias, porque desde s170 la ingesta
separa mancha de trazo por luminancia.

Y el generador dejó de escribir «las **61** piezas» a mano: ahora lo deriva.

---

## 6 · El bloque de diseño · las tres librerías

**Doce iteraciones de maqueta HTML**, con el catálogo real, las máscaras reales y los
tokens de `DESIGN_SYSTEM.md`, a 360×730 · 412×844 · 1280. Todo lo decidido vive en
**[`LIBRERIAS_REDISENO.md`](../product/LIBRERIAS_REDISENO.md)**. Aquí sólo lo que se
aprendió haciéndolo:

- **La tesis cambió a mitad.** Empecé proponiendo comprimir la tarjeta. Los cuatro
  comentarios del usuario pedían **más** información, no menos ⇒ si la tarjeta tiene
  que crecer, **lo paga el filtro**, no la compresión. Medido: la tarjeta creció y aun
  así scrollea menos (4,50 → 3,57), y con un filtro cae a **1,53**.
- **Los ejes se eligieron midiendo cuál parte el catálogo**, no por criterio. En cuerpo
  la duración no separa nada (todo entre 1 y 6 min) y el contexto parte casi por la
  mitad; en Respira al revés (2 a 20 min). De ahí «gemelas + una aparte».
- **Dos de los cuatro filtros no filtraban**: «Aquí mismo» + «Con suelo» = 14 de 14
  (complementarios exactos) y «De pie» está contenido entero en «Aquí mismo».
- **El color lo decidió la app, no yo.** `Card` (`Primitives.jsx:115`) es **neutra en
  reposo** y pone el `accent` **en el hover**. O sea que en PACE el color de módulo
  **no dice lo que hay, dice lo que estás tocando** — y marcar secciones con él habría
  sido un segundo idioma para el mismo color.
- **El grano que propuse iba 5× el de la app** (0,055 contra `PACE_GRAIN_OPACITY =
  0.011`). Se enseñaron los dos: reutilizar el sistema es una cosa y meter un segundo
  valor para superficies planas es otra, y se dice.
- **Borré «Tus rutinas» sin darme cuenta**, repitiendo un error que **s138 ya había
  diagnosticado y corregido** (estaba al final y nadie lo encontraba). Y su aside «En
  Mueve y en Estira» se quitó porque **no cumplía su trabajo**: existía para que ver la
  misma lista dos veces no pareciera un bug, y no funcionó ni con el autor de la app.

### Cuatro defectos que sólo aparecieron midiendo la maqueta

1. **El bloque «Para ahora» estaba VACÍO** dos versiones, con su título puesto y sin
   una tarjeta dentro. Causa: usé ids `extra.*` para Estira, y **las 14 de Estira
   empiezan por `move.`** — la trampa que la decisión de s172 prohíbe expresamente.
   Arreglado con guard: si un id no existe, avisa y cae a las dos más cortas.
2. **La rejilla desbordaba 35 px** porque la tira de glifos y los tres sellos competían
   por la misma línea (205 + 185 px en una columna de 302). Los sellos bajaron a la
   línea de metadatos, que sabe partirse.
3. **`repeat(3,1fr)` no deja encoger** las columnas por debajo de su contenido mínimo:
   `minmax(0,1fr)`.
4. **Dos reglas para la misma tarjeta**, y la vieja ganaba con `border-left:0`, así que
   el hover estaba bien escrito y **no tenía nada que pintar**. A ojo, idéntica.

---

## 7 · Trampas de la sesión

- **Los backticks dentro de un template literal**, otra vez — la que más vuelve. Rompió
  el generador de la maqueta, y en `bash` una cadena con backticks dentro de comillas
  dobles se ejecutó como comando y dejó una sustitución a medias **sin avisar**.
- **`grep -c` devolviendo 0 corta una cadena `&&`**: un calibrado en rojo no llegó a
  ejecutarse y el `restaurar` siguiente lo dejó todo verde. Es la familia de `| tail`.
- **`git checkout` para restaurar** funcionó porque los archivos estaban limpios; aun
  así se hizo copia previa al scratchpad y se comprobó md5 al volver.
- **El visor del navegador dejó de dar capturas a mitad de sesión** («the Browser pane
  is not displayed»): las últimas maquetas se verificaron **midiendo el DOM**, no
  mirándolas, y se dijo.

---

## 8 · Lo que NO se tocó

**La retención por calendario de `pace.events.v1` sigue sin programar**, que era el
punto 1 del handoff. Su pregunta de diseño está planteada y sin responder: la poda es
asíncrona bajo lock y `rolloverIfNeeded` es síncrono ⇒ ¿efecto disparado-y-olvidado
desde el rollover, o en el arranque tras `loadState`? Las dos cumplen «sin segundo
reloj»; la segunda es más fácil de probar en la suite.

Y siguen vivos, sin tocar: **`Puente torácico` a tamaño real**, los **3 ejercicios sin
paso `perSide`**, el color de «La jornada», el equinoccio, los 19 glifos de logro y el
tirón del arco.
