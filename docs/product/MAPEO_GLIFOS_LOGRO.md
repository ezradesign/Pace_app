# Mapeo del arte de logro — vigente desde s147

> **La fuente de verdad es el objeto `MAPEO` de `scripts/ingest-glifos-logro.js`.**
> Este documento explica el porqué de cada fila; el mapeo mecánico vive ahí y se
> indexa por **clave estable** del archivo, nunca por posición en la carpeta.
>
> Origen: `../Glifos_logros` (91 archivos = **58 dibujos distintos** por hash de
> contenido). Destino: `app/glyphs/assets/logros/*.webp`, máscaras CSS.
> Regla D-4: si llega arte nuevo se **re-corre el script**, nunca se retoca un
> `.webp` a mano.

**Estado: 58 logros con arte · 38 sin.** Los 38 siguen con el sistema heráldico
de s83 o con su carácter — la tanda entra sin dejar huecos, porque la máscara
gana al SVG solo donde existe.

---

## Cómo se decide una fila

Tres grados de certeza, y el tercero es el que hay que revisar con el usuario
mirando el dibujo al tamaño real del sello:

- **●** el dibujo lo dice solo
- **◐** encaja bien, pero hay alternativa
- **○** es una apuesta

Para revisarlas: `node scripts/audit/revision-glifos.js` genera
`_revision-glifos.html`, que se sirve con el preview y pinta cada sello **con el
mecanismo real** (`mask-image` sobre `currentColor`, 56 px, borde y anillo de su
categoría) a tamaño real y a 3×. No vale una hoja de contacto en PNG: reproduce
el dibujo, no el mecanismo.

---

## Las nueve apuestas — CONFIRMADAS por el usuario en s147

| Dibujo | Logro | Por qué |
|---|---|---|
| Semilla con cola | `first.breath` | «Empieza algo». No dice aliento, pero no hay mejor candidato |
| Elipse plana | `explore.nadi` | El lazo del infinito ≈ alternar fosa |
| Espiral con cuentas | `streak.100` | Cuentas = días contados; espiral = que no para |
| Vara con hojas | `explore.hips` | Por «flexible». La más floja de las nueve |
| Cáliz con llama | `master.centurion` | Llama sostenida = 100 sesiones |
| Capullo | `explore.physiological` | El doble golpe de aire antes de soltar |
| Pluma escribiendo | `secret.safety.read` | Pluma = letra pequeña leída. La mejor de las nueve |
| Rosa de los vientos | `explore.all.breathe` | Todas las direcciones = todas las respiraciones |
| Prensa tipográfica | `master.collector.full` | Una prensa hace impresiones, y el logro son 75 sellos |

---

## Los tres que quedaron sueltos — colocados en s147

Al llegar los 8 dibujos nuevos, tres se quedaron sin logro:

| Dibujo | Logro | Por qué |
|---|---|---|
| Bambú | `streak.60` «Estación» | Crece por NUDOS, un tramo cada vez: lo lento que no se detiene |
| Vasija humeante | `explore.478` | El humo sube lento y largo, como la exhalación más larga del catálogo |
| Llave ornamentada | `secret.bilingual` «Dos lenguas» | Abre lo que estaba cerrado. Y al ser **secreto**, el sello sale «?» hasta ganarlo: la llave aparece como recompensa |

---

## Una corrección de s146, y la lección

`hydrate.week.perfect` «Semana hidratada» tenía asignado un dibujo que el mapeo
de s146 anotó como **«aguja con gota»**. El usuario lo rechazó mirándolo: *«no
cuadra para nada, el glifo es un pincel con tinta»*. Y tenía razón — es un
**pincel de caligrafía con una gota a punto de caer**.

**El error fue de LECTURA, no de criterio.** Una descripción equivocada del
dibujo propaga una asignación equivocada sin que nada la detecte: los
guardarraíles del script comprueban que el id exista y que ningún dibujo se use
dos veces, pero **no pueden saber qué hay pintado**. De ahí que la revisión con
el usuario delante del sello a tamaño real no sea opcional.

Consecuencias:

- El pincel pasa a `stats.month.first` «Mes habitado» —la marca que se hace, y el
  logro son veinte marcas en el mismo mes—, **de forma TEMPORAL**. Alternativa
  anotada: `secret.zen` «Zen accidental».
- **`hydrate.week.perfect` se queda SIN máscara** hasta que haya un dibujo de
  agua. Cae a su carácter, y eso es preferible a llevar el dibujo equivocado.

---

## Lo que hay que saber al añadir arte nuevo

- **Índice por clave estable, jamás por posición.** Al subir el usuario 8 dibujos
  con nombre en mayúscula, ordenaron ANTES que el lote original: **0 de 50
  posiciones seguían coincidiendo**. Los 50 glifos se habrían reasignado a logros
  equivocados sin dar un solo error.
- **Las rutas van enteras y literales** en `achievement-masks.js`, y **tampoco
  pueden mencionarse en un comentario**: el inliner del build sustituye
  referencias textuales y su guardarraíl aborta si queda rastro del prefijo.
- **El peso de tinta se iguala en dos pasadas** contra la mediana del conjunto, y
  desde s147 esa mediana se mide sobre tinta REAL (fuera el tramado del papel).
  Por eso hay 8 glifos por debajo del 75 % de la mediana y antes parecían 4: no
  han empeorado, es que antes cuadraban con relleno que no era suyo. El usuario
  los revisó en s147 y decidió **dejarlos como están**.

---

## s168 · El farol se muda, y lo que eso midió

El dibujo #15 del lote de s167 se lee como un **farol**, y estaba en
`season.equinox.autumn`. Ahí el argumento del logro —día y noche iguales— vive en
**el sol y la luna, que son ilegibles a 56 px**: el sello no puede sostener su
propia idea. Pasa a **`stats.streak.30` «Treinta amaneceres»**, donde sol y luna
juntos **son** el amanecer —el momento en que uno releva al otro— y ese detalle
es un **bonus**: el sello ya dice «farol al alba» aunque no distingas los astros.

El equinoccio espera la imagen que su encargo ya tenía escrita —*una balanza de
dos platos a la misma altura, con una hoja en un plato y una espiga en el otro*—
y mientras tanto **cae a su glifo de texto, que es precisamente un `⚖`**. Ojo al
mirarlo: `season.equinox.spring` **sí** tiene su balanza dibujada, así que los
dos equinoccios quedan uno al lado del otro en sistemas visuales distintos.

### Una regla que este cambio permitió acotar

La advertencia vigente es que la ingesta **reescribe todas las máscaras** y que
el peso de tinta se iguala contra la **mediana del conjunto**, así que meter arte
nuevo cambia máscaras viejas: en s167 fueron **17 de 58**.

Medido aquí: cambiaron **cero**. 77 antes y 77 después, una nueva
(`stats.streak.30`), una ida (`season.equinox.autumn`) y **las 76 comunes byte a
byte idénticas**.

> **El efecto de conjunto lo produce cambiar el CONJUNTO DE DIBUJOS, no
> re-correr la ingesta.** Reasignar a qué logro va un dibujo que ya estaba deja
> la mediana intacta. Reordenar el `MAPEO` es barato; añadir arte no.

Los cuatro números del CENSO tampoco se movieron (`mascarasLogro` 77,
`mascarasVisiblesDeSalida` 69, `mascarasDeSecreto` 8, `precache` 105): entra y
sale una máscara **no secreta**.

---

## Huecos conocidos

- **19 logros sin arte.** Mudar el farol no cambió el número, solo *quién*.
  Reparto por familia, con el catálogo de s168:

  | Familia | N | Logros |
  |---|---|---|
  | constancia | 4 | `streak.7` · `streak.14` · `breathe.sessions.50` · `stats.month.focus` |
  | exploración | 5 | `explore.box` · `explore.rounds` · `explore.kapalabhati` · `explore.shoulders` · `explore.all.extra` |
  | maestría | 2 | `master.box.15` · `master.shoulders.20` |
  | la jornada | 1 | `master.pomodoro.8` |
  | secretos | 5 | `secret.cow.click` · `secret.rain` · `secret.first.monday` · `secret.new.year` · `secret.zen` |
  | estacionales | 2 | `season.summer` · `season.equinox.autumn` |

  Medición reproducible: `node scripts/audit/censo-glifos-logro-huecos.js`.
- **Sobran lunas y relojes de arena** para los logros de esa familia; alguno
  acabará sin usar.
- **No hay dibujo evidente** para `streak.7` ni `streak.14` — pero desde s167
  `streak.7` se llama **«Cuarto creciente»**, así que ahora sí lo hay: una luna
  en cuarto creciente.
- `hydrate.week.perfect` perdió el suyo a propósito y **ya lo recuperó**: hoy
  tiene máscara. Esta lista decía **38 sin arte** hasta s168, cuando ya eran 19.
