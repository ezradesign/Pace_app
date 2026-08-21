# Glifos a dibujar · las 6 que faltan

> **Autocontenido a propósito**: no hace falta abrir ningún otro documento para
> generar estas piezas. Sale del censo de **s172** (v0.102.2) — si el catálogo
> cambia, la verdad la dice el generado
> [`GLIFOS_EJERCICIOS_PENDIENTES.md`](GLIFOS_EJERCICIOS_PENDIENTES.md), no esto.
>
> **57 de 61 identidades ya tienen arte.** Aquí sólo está lo que queda, en orden
> de lo que más se nota.

---

## Lo que hay que dibujar, por orden

| # | Archivo | ¿Dónde sale? | Hoy se ve como |
|---|---|---|---|
| 1 | `descanso.png` | **18 pasos** en 10 rutinas | dos barras de reproductor |
| 2 | `fondos-en-silla.png` | 3 pasos | grabado **sin silla** = otro ejercicio |
| 3 | `pica-en-escritorio.png` | 1 paso | **glifo por defecto** |
| 4 | `onda-espinal.png` | 1 paso | **glifo por defecto** |
| 5 | `rana.png` | 1 paso | **glifo por defecto** |
| 6 | `deslizamientos-en-pared.png` | 1 paso | grabado, pared no legible |

**Si sólo vas a hacer una, haz la 1.** `Descanso` se ve más veces que cualquier
ejercicio del set y es el único que hoy rompe el sistema visual. Las otras cinco
suman 7 apariciones entre todas.

*(`Nordics` estaba en la cola y **sale**: no aparece en ninguna rutina del catálogo
—sólo en el constructor— y ya tiene SVG, así que no enseña el glifo por defecto.
Dibujarla no cambia nada que nadie esté viendo. Su ficha, al final.)*

---

## El preámbulo · va delante de cada pieza

El estilo **ya existe y está en producción**: son las 57 piezas de
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
   trajeron la postura correcta y ninguna silla. En dos de estas piezas el mueble
   **es la mitad de la lectura del gesto**.
2. **El trazo, cuanto más marcado mejor.** La app pinta desde 30 px y una línea de
   grabado fino a ese tamaño se vuelve gris.
3. **Sin rojo**, o con mucho cuidado: la máscara descarta el color, y si el rojo pisa
   el contorno se come el trazo.
4. **El nombre de archivo es el que empareja.** Si no coincide, la pieza no entra.

---

## 1 · `descanso.png`

*En pantalla dice: «Respira.»*

**El paso más repetido de toda la app** — 18 apariciones — y la única pieza que no
es un ejercicio: es el descanso entre series. Hoy enseña el símbolo de pausa de un
reproductor entre 57 grabados anatómicos.

> **Gesto**: una figura **sentada y quieta**, de perfil mirando a la derecha, sobre
> una **silla dibujada como una línea recta** (asiento y respaldo). Los antebrazos
> reposando sobre los muslos, los hombros bajos, la espalda larga sin tensión, la
> mirada al frente.
>
> **No es un ejercicio y no debe leerse como uno**: nada de flechas, nada de
> recorrido, nada de músculo marcado. Lo que tiene que transmitir es que aquí no se
> hace nada.
>
> **El matiz de la respiración**: como en pantalla dice «Respira.», el dibujo puede
> insinuarlo con **una sola línea suave que sugiera el pecho abierto**. Con cuidado:
> `Reset respiración` ya es «torso de frente con dos arcos concéntricos en el pecho»,
> y si aquí se repiten esos arcos las dos piezas se confunden. **Aquí manda el
> reposo**; la respiración es el matiz, no el gesto.

## 2 · `fondos-en-silla.png`

*En pantalla dice: «Baja doblando los codos hacia atrás. Sube empujando con los brazos.»*

Su grabado actual **no es «le falta la silla»**: apoya las manos en el suelo con la
cadera a ras, o sea que dibuja **otro ejercicio** (un fondo en el suelo).

> **Gesto**: de perfil, **de espaldas a la silla**. Las manos agarradas al **borde
> del asiento** (línea horizontal), la cadera **fuera** del asiento y bajando, los
> **codos apuntando atrás** —no hacia fuera—, los pies en el suelo por delante.
>
> Sin la línea del asiento esto no se distingue de un fondo en paralelas.

## 3 · `pica-en-escritorio.png`

*En pantalla dice: «Cadera arriba, cabeza entre los brazos.»*

> **Gesto**: de perfil, en «V» invertida, con **las manos apoyadas en el borde de
> una MESA** (línea horizontal a la altura de la cadera), pies en el suelo, cadera
> empujada arriba y atrás, cabeza entre los brazos, espalda larga.
>
> **La mesa no es decorado: es lo que distingue esta pieza.** Sin ella el dibujo es
> una «V» invertida en el suelo y duplica la silueta de `Marcha del elefante` — pasó
> en la tanda anterior y ese dibujo hubo que descartarlo por eso.

## 4 · `onda-espinal.png`

*En pantalla dice: «Recorre una ola lenta desde la pelvis hasta la cabeza.»*

> **Gesto**: de perfil, **de pie con las rodillas sueltas**, y una **línea DE PUNTOS
> ondulada que recorre la columna de la pelvis a la cabeza**, con la punta de flecha
> arriba.
>
> La ondulación va **al lado del contorno de la espalda, no encima**: si se confunde
> con el propio contorno, el dibujo se lee como una espalda deformada.

## 5 · `rana.png`

*En pantalla dice: «Rodillas anchas, empuja cadera atrás. Mece suave.»*

> **Gesto**: a cuatro apoyos con las **rodillas muy abiertas**, cadera empujada
> atrás, y una **flecha de puntos corta hacia atrás** marcando el balanceo.
>
> ⚠ **Decisión de vista, y es la única pieza del set con este problema**: el gesto se
> ve desde atrás o desde arriba, y **todas las demás son perfil o frontal**.
> - **(a) Frontal en cuadrupedia** — mantiene la convención del set y deja ver las
>   rodillas abiertas; la cadera atrás la marca la flecha. **Recomendada.**
> - **(b) 3/4 desde atrás** — más fiel al gesto, pero sería la única en esa vista.

## 6 · `deslizamientos-en-pared.png`

*En pantalla dice: «Ponte de espaldas a la pared, brazos en cruz apoyados en ella.
Sube y baja los brazos pegados a la pared, como alas.»*

Su grabado actual ya trae flechas y los brazos arriba; lo que falla es que **la
pared no se lee** —hay una línea vertical que sale de la coronilla y se interpreta
como un artefacto, no como un plano— y que sólo muestra la «Y» final.

> **Gesto**: **de ESPALDAS a la pared** — la pared es una **línea vertical pegada a
> la espalda**, igual que en `Silla en la pared`. Los brazos apoyados en ella, **de
> «W» a «Y»**, con una **flecha de puntos hacia arriba**. Lumbar cerca de la pared.
>
> El gesto se lee mejor de frente y el mueble se lee mejor de perfil: si de frente la
> pared queda ambigua, vale un **3/4** con la línea vertical detrás del hombro.

---

## Cuando los tengas

```bash
node scripts/ingest-glifos-ejercicio.js --origen "<carpeta con los PNG>"
```

**La carpeta de origen tiene que llevar TAMBIÉN las 57 que ya están**, o la ingesta
las borra: reescribe el mapa entero.

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
