# HANDOFF · s168 → siguiente sesión

**v0.98.0** · 2026-08-18 · sustituye a [`HANDOFF_s167.md`](./HANDOFF_s167.md),
**agotado**: sus tres decisiones están tomadas y hechas.

Aquí viven **solo las cosas que esperan una decisión del usuario**, cada una con
su pregunta concreta, lo ya medido y una sugerencia. Lo demás (estado,
herramientas, trampas) está en la sección «Próxima sesión» de
[`STATE.md`](../STATE.md).

---

## 1 · La pill: el umbral está medido y la pregunta era otra

### Lo que se pedía, y por qué no tenía respuesta

El encargo era medir **a partir de qué altura** cabe la pill de Foco/Pausa/Larga,
en 568 · 667 · 736 · 844 · 932. Se midió, en esas cinco alturas y en tres anchos,
con la sonda de `tests/home.helpers.js`. Resultado: **no se mueve nada en las 15
combinaciones** — ni el aro, ni la topbar, ni el desbordamiento, ni el bloque de
abajo.

Eso no era una buena noticia, era una pista de que la pregunta estaba mal hecha:

> `[data-pace-tabs]` es **`position: absolute`** centrada con
> `translate(-50%,-50%)` (`TopBar.jsx:46-48`). Está **fuera de flujo**: no puede
> empujar, no puede encoger a nadie y no puede cambiar el alto de la fila. «No
> mueve nada» era estructural, no una medida de que hubiera sitio.

### Lo que sí falla: se solapa

Cruzando rectángulos con los hijos de la topbar:

| ancho | solapa con | ¿limpio? |
|---|---|---|
| 320 | icono 40 px, icono 40 px, icono 15 px | no |
| 375 | icono 40 px, icono 32 px | no |
| 414 | icono 40 px, icono 12 px | no |

**Idéntico de 568 a 932 px de alto.** La altura no interviene en absoluto.
Barriendo anchos, el solape desaparece **entre 520 y 560 px**: a 520 todavía pisa
3 px, a 560 está limpio. Ningún teléfono en vertical llega ahí, y la piel de
móvil se aplica por debajo de 768.

### Lo que costaría la alternativa

Darle **su propia línea** cuesta **+42 px** (la pill mide 34 y su hueco 8).
Simulado creciendo la fila y midiendo qué hace el aro, con el `squeeze` al lado
porque es el candidato natural a gate:

| | 568 | 667 | 736 | 844 | 932 |
|---|---|---|---|---|---|
| `--pace-home-squeeze` | **1** | **0,367** | **0** | **0** | **0** |
| **320** | desborda 50 px | limpio | limpio | limpio | limpio |
| **375** | desborda 50 px | **aro −42 px** | limpio | limpio | limpio |
| **414** | desborda 50 px | **aro −67 px** | **aro −6 px** | limpio | limpio |

Reproducible: `node scripts/audit/banco-pill-movil.js`, que acepta `--anchos` y
`--alturas`.

### Preguntas

1. **¿La pill baja a su propia línea, o son los iconos los que ceden sitio?**
   Son las dos únicas salidas: mientras esté centrada en la misma fila que tres
   iconos de 40 px, no hay ancho de teléfono que las separe.
2. **¿Con qué se gatea?** El umbral existe pero **no es una altura sola**: 667 a
   320 de ancho, 736 a 375, 844 a 414. Una media query por altura a secas elige
   mal en uno de los tres.

### Sugerencia

**Fila propia gateada por `--pace-home-squeeze == 0`, asumiendo 6 px de aro en un
caso.** Y aquí hay una corrección que conviene leer entera, porque la sugerencia
obvia **no sobrevive a su propia medida**:

El gate natural parecía «`squeeze == 0`», o sea «el motor no está comprimiendo
nada». Medido, `squeeze` vale 0 **exactamente cuando el alto ≥ 736**, así que esa
condición y «alto ≥ 736» son la misma, y **deja pasar 414×736, donde el aro pierde
6 px igualmente**. El squeeze mide si hay que comprimir AIRE; no sabe nada de si
al aro le sobran 42 px.

Las dos salidas honestas:

- **`squeeze == 0`** (≡ alto ≥ 736): un solo caso imperfecto, **6 px de 381** en
  414×736, o sea el 1,6 % del aro. A cambio, la pill aparece en las tres
  combinaciones de 736 donde es gratis.
- **alto ≥ 844**: limpio del todo, pero esconde la pill en 320×667, 320×736 y
  375×736, donde **no costaba nada**.

Me inclino por la primera y dejar los 6 px anotados. Si el aro es intocable, la
segunda. Lo que **no** hay que hacer es escribir «squeeze == 0 y alto ≥ 736»
creyendo que son dos condiciones: es una, y no basta.

Y conviene recordar por qué existe la regla de s46 que la oculta: en móvil la
selección post-Pomodoro la hace el **BreakMenu**. La decisión ya tomada es que
**convivan** —el BreakMenu aparece y propone al terminar, la pill deja elegir
modo a propósito en cualquier momento—, así que esto es maquetación, no producto.

> **Esto ya estaba diagnosticado.** La fila de v0.71.0 de
> [`CHANGELOG_TABLA_HISTORICA.md`](./archive/CHANGELOG_TABLA_HISTORICA.md) dice
> desde **s128**: *«no es un simple des-ocultar —son position:absolute centradas
> y colisionan con los 3 iconos top-right en anchos de 390–430px, por eso s46 las
> ocultó—; requiere fila propia gateada por min-height»*. Se archivó con la tabla
> larga y los handoffs sucesivos no lo arrastraron. Lo que faltaba era la medida.

---

## 2 · El color de «La jornada»

La familia nueva heredó **`--hydrate`** (`#5F8A9B`), el token que soltó
«estadísticas» al disolverse. Es **el único color frío de una paleta tierra**, y
ha pasado de estar al final del panel con 4 sellos a estar **en el medio con 9**.

**A favor de dejarlo**: la familia va de la hora del día —reloj de sol, luna,
reloj de bolsillo, sahumerio— y el azul lee como cielo mejor que un ocre. Visto a
tamaño real, el bloque se sostiene solo.

**En contra**: rompe la fila de tierras justo en el centro del panel, y
`DESIGN_SYSTEM.md` describe la paleta como oliva, crema, terracota y negro tinta.

### Pregunta

**¿Se queda el azul, o se reparten los siete tokens otra vez?** Si se reparten,
hay que decidir de quién sale el color cálido y quién se queda el frío — los
siete siguen asignados.

### Sugerencia

**Dejarlo y mirarlo unos días.** Es reversible en una línea de `CAT_META` y no
arrastra nada más: el color no se persiste, no lo consume ningún test y la hoja
de revisión lo lee de la fuente desde s168. Hoja:
`node scripts/audit/revision-familias.js <salida.png>`.

---

## 3 · El equinoccio de otoño, y los dos sistemas juntos

Al mudarse el farol, `season.equinox.autumn` cae a su **glifo de texto `⚖`** —que
resulta ser la balanza de dos platos que su encargo pedía—, pero
`season.equinox.spring` **sí tiene balanza dibujada**. Los dos equinoccios quedan
uno al lado del otro en la misma familia, en sistemas visuales distintos.

### Pregunta

**¿Se acepta el `⚖` de texto mientras llega el dibujo, o el equinoccio de otoño
sube en la cola del encargo?**

### Sugerencia

**Que suba en la cola.** No por el sello suelto —el `⚖` aguanta— sino por el par:
lo que canta no es el glifo de texto, es verlo junto a su gemelo dibujado. El
encargo ya está escrito en
[`GLIFOS_LOGROS_ENCARGO.md`](./product/GLIFOS_LOGROS_ENCARGO.md): *balanza de dos
platos a la misma altura, una hoja en un plato y una espiga en el otro*.

---

## 4 · Lo que NO está aquí

Sigue vivo y documentado en `STATE.md`: los **19 logros sin arte** (con su
reparto nuevo por familia), los **glifos de ejercicio** (mecanismo listo desde
s166, nunca corrido sobre arte real), el **tirón del arco**, **D3**, la **Fase 2
de `pace.events.v1`**, **Wrangler**, **proteger `main`** y **«muy similar a web»
en móvil** (solo queda la rejilla 2×2 contra la fila de cuatro).

Y una que nace aquí, **ya medio cerrada**: la caché de Chromium entró y el push
de cierre la verificó a medias. En el run `32167773908` el cableado hizo lo
correcto con la caché vacía —fallo esperado, descarga completa (217 s), paso de
`install-deps` omitido— y **guardó 268,96 MiB**. Falta ver el **acierto**: en el
primer push de la sesión siguiente, «Cache de Chromium» debe acertar, «Instalar
Chromium» debe omitirse y «Librerías de sistema» debe correr en su lugar.

De paso, ese run corrigió una conclusión mía: dije que los 11 minutos fueron «un
caso patológico» sobre 9 runs, y este tardó **217 s**. Son **2 de 10** por encima
de los tres minutos — la cola recurre, así que la caché vale más de lo que dije.
