# Glifos a dibujar · las 3 que faltan

> **Autocontenido a propósito**: no hace falta abrir ningún otro documento para
> generar estas piezas. Sale del censo de **s173** — si el catálogo cambia, la
> verdad la dice el generado
> [`GLIFOS_EJERCICIOS_PENDIENTES.md`](GLIFOS_EJERCICIOS_PENDIENTES.md), no esto.
>
> **59 de 62 identidades ya tienen arte.** Aquí sólo está lo que queda, en orden
> de lo que más se nota.
>
> **Ojo, el censo decía 61 y son 62.** El generador sacaba los nombres con un patrón
> que sólo veía los pasos con `mode:` —el contrato del runner v1— y **los pasos
> legacy declaran `dur:`**. Por ese hueco se colaba `Puente isquio a una pierna`, que
> además el encargo daba por «dibujo que no usa nadie». Dos errores independientes
> que se cancelaban en un número creíble. Corregido en s172: patrón arreglado, fila
> escrita en el encargo y censo regenerado.

---

## Lo que hay que dibujar, por orden

| # | Archivo | ¿Dónde sale? | Hoy se ve como |
|---|---|---|---|
| 1 | `descanso.png` | **18 pasos** en 10 rutinas | dos barras de reproductor |
| 2 | `pica-en-escritorio.png` | 1 paso | **glifo por defecto** |
| 3 | `rana.png` | 1 paso | **glifo por defecto** |

**Si sólo vas a hacer una, haz la 1.** `Descanso` se ve más veces que cualquier
ejercicio del set y es el único que hoy rompe el sistema visual. Las otras dos
suman 2 apariciones entre las dos.

> ⚠ **`descanso.png` NO ENTRA POR LA INGESTA TAL CUAL ESTÁ HOY** (medido en s173).
> `Descanso` está excluido a mano del censo de identidades —`if (n && n !==
> 'Descanso')` en `scripts/ingest-glifos-ejercicio.censo.js`, con el comentario «no
> es un ejercicio»—, así que un `descanso.png` en la carpeta de origen sale listado
> como **PNG huérfano** y no se ingesta. Cuando el dibujo llegue hay que decidir
> antes si `Descanso` pasa a ser la identidad nº 63 o si su arte entra por otra vía.
> Su glifo de hoy es el SVG de dos barras de `app/glyphs/exercise-glyphs.jsx`.

---

## Entregado en la 3ª tanda (s173)

Cuatro piezas, todas emparejadas y verificadas: **`fondos-en-silla`** (ahora con la
silla, que era lo que la hacía ilegible), **`onda-espinal`**, **`puente-isquio-a-una-
pierna`** y **`deslizamientos-en-pared`**. Las dos primeras columnas del censo pasan
de 57 a **59 identidades con arte**: `fondos-en-silla` y `deslizamientos-en-pared`
**sustituyen** a un dibujo que ya existía y no suman identidad.

`deslizamientos-en-pared` entró con **dos figuras enteras** (inicio y final) por
decisión del usuario, mirando la pieza al lado de la anterior. Es la única del set con
dos cuerpos —las otras composiciones múltiples son de manos— y por eso cada figura
queda a la mitad del tamaño lineal que las demás; se aceptó porque la pieza anterior
no dejaba leer ni la pared ni el gesto.

*(`Nordics` estaba en la cola y **sale**: no aparece en ninguna rutina del catálogo
—sólo en el constructor— y ya tiene SVG, así que no enseña el glifo por defecto.
Dibujarla no cambia nada que nadie esté viendo. Su ficha, al final.)*

---

## El preámbulo · va delante de cada pieza

El estilo **ya existe y está en producción**: son las 59 piezas de
`app/glyphs/assets/ejercicios/`. Esto no lo reinventa, lo describe.

**Lo que más sube el acierto: adjuntar 2 o 3 piezas existentes como referencia
visual.** Con eso, el texto sólo tiene que decir el gesto.

```
Grabado anatómico de línea, en el estilo de las imágenes de referencia: ilustración
médica clásica, tinta oscura sobre fondo claro liso, sin color.

FIGURA: una sola persona, cuerpo entero, andrógina y calva, sin ropa, misma
constitución en todas las piezas. Rostro mínimo pero presente de perfil (nariz,
oreja, ojo apenas insinuado). Contorno continuo y algo más marcado que el interior;
el volumen se da con RAYADO fino (hatching) en músculos y sombras, nunca con relleno
macizo ni degradado.

VISTA: perfil mirando a la derecha por defecto. De frente sólo si el gesto es
simétrico y de frente se entiende mejor.

ESCENOGRAFÍA: la mínima, y siempre como líneas simples.
  · suelo -> línea horizontal corta bajo los pies
  · pared -> línea vertical que cruza el encuadre, pegada al cuerpo
  · silla o mesa -> una línea recta a la altura del apoyo, sin dibujar el mueble
Nada más: ni habitación, ni objetos, ni fondo.

MOVIMIENTO: si hay recorrido, una línea DE PUNTOS con una punta de flecha pequeña.
Nunca dos posiciones del cuerpo superpuestas.

TEXTO: ninguno.

FORMATO: PNG cuadrado, 2048x2048 o más, fondo blanco o casi blanco. No te preocupes
por centrar ni por el tamaño: sólo por que el cuerpo entre ENTERO en el lienzo.
```

### Cuatro reglas que no son de estilo

1. **El mueble hay que pedirlo EXPLÍCITAMENTE o no aparece.** De las 47 primeras, 17
   trajeron la postura correcta y ninguna silla — y en s173 `Fondos en silla` entró
   bien justo porque el encargo pedía la línea del asiento. En `Pica en escritorio`
   el mueble **es la mitad de la lectura del gesto**.
2. **El trazo, cuanto más marcado mejor.** La app pinta desde 30 px y una línea de
   grabado fino a ese tamaño se vuelve gris.
3. **El rojo del músculo YA NO ES UN PROBLEMA** (medido en s173 sobre las cuatro
   piezas de la 3ª tanda, todas con la zona trabajada en rojo): desde s170 la ingesta
   lo cuenta como tinta y no lo blanquea, porque separa la mancha —tinte claro— del
   trazo por LUMINANCIA y no por tono. Lo que sigue sin poder hacer el color es
   distinguir: en la máscara todo acaba siendo la misma tinta, así que el rojo puede
   señalar dónde se trabaja, pero no puede ser lo único que lo diga.
4. **El nombre de archivo es el que empareja.** Si no coincide, la pieza no entra.

---

## 1 · `descanso.png`

*En pantalla dice: «Respira.»*

**El paso más repetido de toda la app** — 18 apariciones — y la única pieza que no
es un ejercicio: es el descanso entre series. Hoy enseña el símbolo de pausa de un
reproductor entre 59 grabados anatómicos.

> **Gesto** (s173): **de pie y de FRENTE**, en postura de recuperar el aliento. Las
> **manos apoyadas en las caderas** con los codos abiertos, los **hombros caídos**,
> los pies al ancho de las caderas, la cabeza al frente.
>
> **No es un ejercicio y no debe leerse como uno**: nada de flechas, nada de
> recorrido, nada de músculo en rojo, ningún mueble. Lo que tiene que transmitir es
> que aquí NO SE HACE NADA.

**LA SILLA ERA UN ERROR, y estuvo escrito aquí dos sesiones.** La ficha anterior pedía
la figura sentada en una silla; medido en s173, **11 de los 18 descansos ocurren en
rutinas `standing`**, 5 en `seated` y 2 en `floor` — o sea que una silla contradice 13
de 18. Como es UN dibujo para los 18 sitios, tiene que valer en los tres casos.

**Y las cuatro poses tranquilas obvias ya están cogidas**, comprobado mirando las 59:
sentado en silla es `Hueco en silla`; sentado en el suelo con las piernas cruzadas
sale **tres veces** (`Escalenos`, `Cuello y trapecios`, `Inclinación lateral`); y de
pie quieto son `Reset respiración` (de frente) y `Onda espinal` (de perfil). Por eso
gana **recuperar el aliento**: es lo único que dice «he parado» en vez de «estoy en
una postura», y no está en el set.

**Nada de arcos en el pecho**, aunque en pantalla ponga «Respira.». `Reset
respiración` ES «torso de frente con arcos concéntricos en el pecho»: repetirlos aquí
crea justo la confusión que este dibujo tiene que evitar, y encima en la pieza que más
se ve. El reposo lo dicen los hombros y las manos en la cadera, no un símbolo.

**De frente y no de perfil**, y la razón es el tamaño pequeño: el gesto es simétrico
—la regla del set permite frontal ahí— y de frente los dos codos abiertos dejan **dos
triángulos de aire** que separan la silueta de todas las figuras rectas a 30 px. De
perfil sólo se vería un brazo y quedaría demasiado cerca de `Onda espinal`.

## 2 · `pica-en-escritorio.png`

*En pantalla dice: «Cadera arriba, cabeza entre los brazos.»*

> **Gesto**: de perfil, en «V» invertida, con **las manos apoyadas en el borde de
> una MESA** (línea horizontal a la altura de la cadera), pies en el suelo, cadera
> empujada arriba y atrás, cabeza entre los brazos, espalda larga.
>
> **La mesa no es decorado: es lo que distingue esta pieza.** Sin ella el dibujo es
> una «V» invertida en el suelo y duplica la silueta de `Marcha del elefante` — pasó
> en la tanda anterior y ese dibujo hubo que descartarlo por eso.

## 3 · `rana.png`

*En pantalla dice: «Rodillas anchas, empuja cadera atrás. Mece suave.»*

> **Gesto**: a cuatro apoyos con las **rodillas muy abiertas**, cadera empujada
> atrás, y una **flecha de puntos corta hacia atrás** marcando el balanceo.
>
> ⚠ **Decisión de vista, y es la única pieza del set con este problema**: el gesto se
> ve desde atrás o desde arriba, y **todas las demás son perfil o frontal**.
> - **(a) Frontal en cuadrupedia** — mantiene la convención del set y deja ver las
>   rodillas abiertas; la cadera atrás la marca la flecha. **Recomendada.**
> - **(b) 3/4 desde atrás** — más fiel al gesto, pero sería la única en esa vista.

---

## Cuando los tengas

```bash
node scripts/ingest-glifos-ejercicio.js --origen "<carpeta con los PNG>" --fusionar
```

**`--fusionar` (s173) es lo que deja meter SÓLO lo nuevo.** Sin esa bandera la
ingesta reescribe el mapa entero desde la carpeta, así que habría que tener delante
también las 59 que ya están o desaparecen del mapa y del precache. Con ella, las
identidades que no vengan en la carpeta conservan su fila — y si una fila conservada
apunta a un archivo que ya no está, aborta sin escribir nada.

Conviene mirar antes en seco: añade `--seco` y no escribe nada, sólo dice qué
empareja. Un PNG cuyo nombre no case con ninguna identidad sale listado como
huérfano y **es salida 1** en los dos modos.

Después: `node build-standalone.js` · `npm run verify` · `npm run test:e2e`,
re-correr `node scripts/glifos/generar-pendientes.js` y **subir a mano** el censo
`precache` de `scripts/verify.integridad.js` — **dos filas por pieza** (la máscara y
su miniatura).

---

## Aplazada · `nordics.png`

No entra en la cola: **no aparece en ninguna rutina del catálogo**, sólo en el
registro del constructor (`app/custom/exercise-registry.js`), así que la ve quien se
monte una rutina propia con ella. Y **ya tiene SVG**, o sea que tampoco cae al glifo
por defecto. La ficha queda escrita para el día que entre en una rutina fija:

> *«Asistidos si hace falta. Bajada controlada.»* — De perfil, **de rodillas**, tronco
> cayendo hacia delante en una sola línea desde las rodillas a la cabeza, con control.
> **Los tobillos anclados bajo una línea recta** (el borde de un mueble), que es como
> se hace sin compañero. Brazos por delante, listos para amortiguar.
