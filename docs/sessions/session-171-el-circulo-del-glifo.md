# s171 · EL CÍRCULO DEL GLIFO, Y LOS DOS DIBUJOS QUE SOBRABAN

**v0.101.0** · `npm run verify` PASA · `npm run test:e2e` **105/105** (eran 97)
· `PACE_standalone.html` intacto en v0.71.0.

> **La sesión no hizo lo que traía el handoff.** El plan era el PASO 2 de la
> Fase 3 (el emisor de `session.completed`). A mitad de la revisión de glifos el
> usuario mandó cinco capturas con tres defectos visuales que ve en su teléfono
> y en su portátil, y eso pasó a ser el trabajo. **El emisor sigue sin escribir**
> y el terreno reconocido en `HANDOFF_s171.md` §2 sigue valiendo entero.

---

## 1 · Las tres preguntas del handoff, contestadas mirando

### Las 2 piezas sin identificar: no eran identidades nuevas

La numeración de la hoja de contactos de s170 (`09`, `14`) **no es
reproducible**. Regenerarla deduplicando por hash y ordenando por nombre da otro
orden, y los controles lo dicen: mi `01` sale «Flexor de cadera» donde el mapa
cerrado dice «Círculos de muñeca». Así que no se usó.

En su lugar se emparejaron **las 49 fuentes contra las 47 máscaras por
CONTENIDO**: firma de densidad de tinta → recorte al dibujo → 32×32 →
correlación → asignación voraz. **La pareja más débil de las 47 puntuó 0,849**,
o sea que la asignación no es ambigua, y quedaron exactamente dos fuentes sin
reclamar:

- una segunda toma de **Apretar glúteos** con los **dos arcos** de tensión (más
  literal al encargo que la de dos flechas que está puesta);
- una segunda de **90/90** de frente, **con la flecha de rotación** que el
  encargo pide y la puesta no tiene.

**Ninguna de las 14 identidades pendientes las reclama.** El usuario decidió no
cambiar ninguna de las dos.

### ¿Alguno mal asignado? Ninguno — pero hay un defecto

Las 47 revisadas una a una contra la columna «qué debe mostrar». **Cero cruces.**
Los tres que más lo parecían los salvó el propio encargo, que es el recordatorio
de siempre: la sospecha visual sin el texto delante se equivoca.

Lo que sí hay es **fidelidad**, y casi todo es el mismo fallo: **faltan 10
muebles**, no 5. `Puente torácico` no es «le falta la silla» — es **otra
postura** (el encargo pide «desde sentado en la silla»; el dibujo es un puente
invertido en el suelo). Y `Elevación de puntas` **dibuja el gesto de
`Elevación de talones`**: pie plano y flecha en el talón. Todo escrito en
`GLIFOS_EJERCICIOS_REDISENO.md` §4, que es lo que el usuario pidió; el arte lo
genera él.

### La trampa del documento, que casi se cuela

La sección nueva del encargo **corrompió el documento generado** en el primer
intento: `generar-pendientes.js` captura las filas de TRES columnas de ese
archivo, así que una tabla nueva con los mismos nombres de ejercicio
**sobrescribió** `Elevación de puntas`, `Escalenos` y `90/90`, moviéndolos de
grupo y descuadrando cuatro recuentos. **Lo cazó el diff contra el generado
anterior, no la vista.** Arreglo: las dos tablas nuevas llevan **cuatro
columnas**, y el diff se volvió a correr hasta salir byte a byte igual.

---

## 2 · Los tres defectos visuales, medidos antes de tocar

### (1) Las miniaturas del preview se pisaban

`ExerciseGlyph` multiplicaba el tamaño **×1,5** por dentro cuando la pieza era
máscara. La lista de pasos reserva **30 px** y recibía **45**: filas cada 40 px
⇒ **5 px de solape** entre cada dos miniaturas anatómicas. Las 41 SVG, que sí
respetan la caja, quedaban limpias — por eso el defecto se veía a saltos.

Y un segundo error que esto destapó: `exerciseMaskUrl` elegía la variante por
los píxeles **pedidos** (30 ⇒ la de trazo engordado) y luego pintaba a 45, que
es justo el tramo donde no corresponde.

**Arreglo**: `maskScale` es un parámetro **explícito con defecto 1** — la caja
que se pinta es la que el llamante reserva — y la variante se elige por los
píxeles que se **pintan**. El +50 % lo pide `StepGlyph`, que es el único que lo
quiere. Medido después: **9,6 px de aire** entre cada dos miniaturas.

> La decisión se tomó **mirando a tamaño real**, no discutiendo: a 30 px la app
> sirve la variante `.min` y el dibujo sale **más oscuro y más legible que a
> 45**, donde cae la variante normal. El usuario tenía razón y el argumento que
> yo traía (coherencia con los SVG vecinos) además caduca solo, porque esos
> vecinos van a ser sustituidos.

### (2) El círculo no era el mismo · dos causas, no una

| | Círculo | Por qué |
|---|---|---|
| Antídoto silla (móvil 812) | **179 px** | runner **v1**: `0,22 × alto` |
| Escritorio express (móvil 812) | **72 px** | runner **legacy**: 72 fijo |

**6 rutinas de 28** caen al legacy: *Empuje · progresión* y *Piernas · a una*
(Mueve); *Ancestral*, *ATG · Rodillas a prueba*, *Escritorio express* y
*Caderas · suelo* (Estira). No era el arte: el llenado del círculo es idéntico
(91,7 %) en los dos. El usuario eligió **igualar círculo y tipografía**, así que
el legacy pasa a la curva de v1 y a su `clamp(30px, 6.5vh, 52px)` — su nombre de
ejercicio estaba a **56 px fijos**, que es el «letras muy grandes» del reporte.

### (3) El círculo se movía · y la mitad rota era la de móvil

Medido antes de tocar, en móvil: `top` **98 → 108 → 151**, **43 px de deriva**
con el círculo del mismo tamaño. Las reservas de altura que lo anclan existen
desde s119 **solo para ≥641 px**; en móvil aquella sesión renunció a ellas por
desborde. **Se aplican ahora a las dos pieles**, y el desborde que s119 temía
**no reproduce hoy**: 0 px a 360×640, 375×812 y 390×844 (el nombre móvil ya es
un clamp desde entonces). Queda asertado, no anotado.

### (2 bis) El +30 % de escritorio

`V1_GLYPH_WEB = 1.3` aplicado **después del clamp**, o sea sobre la curva entera
(suelo 94, techo 273): mover solo la pendiente aplanaría el aumento justo en las
pantallas grandes, que son las que lo piden. La piel se lee del **contrato
`--pace-skin`**, no de un `matchMedia` con el 769 copiado. Medido: **198 → 257
px** a 1440×900, con **0 px de desborde** — el aumento cabía en el hueco que ya
había.

El aire alrededor del contador se recorta en la piel ancha y solo donde no hay
compactación (`min-height: 769`). **La línea vacía bajo el cue NO se toca, y es
deliberado: ES el anclaje del círculo.** Quitarla devuelve la deriva que la otra
mitad del cambio arregla. Moverla al final del bloque —después de «Cuídate»,
donde no se leería como hueco— exige que el bloque entero declare alto mínimo:
cambio de mecanismo con cinco tiers medidos detrás. **El prerrequisito se hizo en la segunda mitad** (§5: el bloque declara alto mínimo); mover la línea al final del bloque sigue **sin hacer**.

---

## 3 · El banco: `tests/runner-circulo.spec.js`

**8 tests, y los 8 calibrados en rojo uno por uno**, cada uno revirtiendo su
propio arreglo y comprobando que cae **solo** el suyo:

| Se revierte | Cae | Mensaje |
|---|---|---|
| reserva móvil | solo el de móvil | `el círculo se mueve entre pasos` |
| tamaño del legacy | solo el de los dos runners | `el círculo del runner legacy (72) no coincide con el del v1 (205)` |
| `maskScale` implícito | solo el de miniaturas | `«Apertura de pecho» pisa a «Rotación torácica» por 4.8 px` |
| `V1_GLYPH_WEB = 1` | solo el de escritorio | `escritorio (179) debería ser mayor que móvil (179)` |
| reserva a `31em` | los tres de desborde | `el bloque rebasa el centro por 444 px` |

**Ni un número de píxeles vive dentro de un aserto.** El defecto no era un
tamaño equivocado sino que **dos superficies no coincidían**, así que lo que se
defiende es la igualdad, no la cifra — que además es una decisión de diseño viva.

Tres cosas que el banco hace y que costaron una pasada cada una:

- **La versión de un solo viewport no valía.** Escrito primero con el 1280×720
  del config, el test de la deriva **habría pasado en verde antes del arreglo**:
  a esa anchura la reserva ya existía desde s119. Va parametrizado por piel, con
  **guard de `--pace-skin`** para que las dos filas no midan la misma.
- **Guard de cero en cada bucle**: un recorrido que no encuentra pasos, o un
  preview sin miniaturas, deja los `expect` sobre listas vacías y pasa en verde.
- **Control positivo** en el test de los dos runners: si la rutina legacy se
  migrara al contrato v1, compararía v1 consigo mismo. Se aserta que el hook del
  contador v1 **no** existe en aquella.

Y una **mentira del instrumento**, cazada: el primer muestreo dio `76, 76, 76,
122` y el 122 no era ningún paso de trabajo — el recorrido medía también la
pantalla de descanso, que no pinta glifo. El aserto tenía razón; el muestreador,
no. Se filtra por **contador en pantalla**.

---

## 4 · La segunda tanda de arte: 47 → 57 identidades

**Entran 18 dibujos.** Diez son identidades que no tenían nada —`Barbilla atrás`,
`Cuádriceps en pared`, `Inclinación lateral`, `Isquio a una pierna`, `Rotación
lenta`, `Sentadilla búlgara`, `Sentadilla lateral`, `Sentadilla profunda`,
`Sentarse y levantarse del suelo`, `Zancada con apertura`— y ocho son
**reemplazos por el mueble**: `Círculos de tobillo`, `Extensión torácica`,
`Flexiones inclinadas`, `Giro sentado`, `Hueco en silla`, `Puente torácico`,
`Rotación torácica` y `Sentadilla a silla`.

**Quedan 4 sin arte**: `Pica en escritorio`, `Nordics`, `Onda espinal` y `Rana`.
De los 10 muebles que faltaban entran 8; siguen sin él **`Fondos en silla`** y
**`Deslizamientos en pared`**.

**13 se asignaron con evidencia** —el encargo cita una marca y el dibujo la
lleva: la línea del asiento en `Rotación torácica`, el pie bajo la mesa en
`Círculos de tobillo`, el empeine contra la pared en `Cuádriceps en pared`— y
**7 las decidió el usuario** entre dos lecturas posibles. **Dos dibujos quedaron
fuera**: una «V» invertida sin mesa, que habría duplicado la silueta de `Marcha
del elefante`, y una segunda sentadilla que chocaba con `Sentarse y levantarse
del suelo`. El mapa de la tanda, con el porqué de cada fila, está en
`scripts/glifos/mapa-tanda2.txt`.

Auditoría geométrica: **0 piezas fuera del círculo** (radio 97,6–98,3 % del
tope). Censo `precache` subido a mano a **219** — dos filas por pieza desde s170.

### La trampa que más caro sale, y cómo se sorteó

**La ingesta reescribe el mapa ENTERO**: corrida con una carpeta que sólo lleve
los dibujos nuevos, **borra los que ya estaban**. Y la numeración de la hoja de
contactos de s170 **no es reproducible** (§1), así que tampoco servía para
recuperarlos. Los **39 viejos que sobreviven se emparejaron por CONTENIDO**
contra sus máscaras —firma de densidad de tinta → recorte → 32×32 →
correlación—, el mismo mecanismo de §1. **La peor pareja puntuó 0,849**: sin
ambigüedad. El script vive en el scratchpad de s171; si hace falta otra tanda,
**hay que reescribirlo o moverlo a `scripts/glifos/`**.

### Un detector que NO sirvió, para no reintentarlo

Detectar el mueble por «recta larga». Tres versiones, tres respuestas distintas:
la estricta daba **falsos negativos** (la línea de la silla está **partida por el
cuerpo** que se sienta encima), la relajada se disparaba con los contornos del
propio dibujo, y la de tramos colineales perdía la mesa continua. **Lo que
funciona es la pieza a 700 px con la descripción del encargo al lado**, que es lo
que ya midió s170.

---

## 5 · El bloque del runner queda anclado

El usuario lo verificó en su teléfono después del arreglo de §2(3) y **seguía
viendo un salto**. Medido a los dos lados:

| | Antes de s171 | Ahora |
|---|---|---|
| Círculo entre pasos de TRABAJO | 43–65 px | **0 px** |
| Nombre entre pasos de TRABAJO | 94 px | **0 px** |
| Círculo cruzando fases | 65 px | **~25 px** |
| Nombre cruzando fases | 94 px | **~29 px** |

**El mecanismo**: `[data-pace-v1-body]` declara **alto mínimo** —70vh en móvil,
72vh en escritorio— gateado por `min-height: 780px` / `880px`. **Los suelos son
el techo MEDIDO**, no una estimación: el bloque más alto que cabe es 70,1vh a
375×780 · 71,2 a 812 · 72,4 a 844 · 76,0 a 1280×900. Va **en vh y no en px**
porque el bloque crece con la altura del viewport (el glifo es 0,22 × alto) y su
techo también, y los intervalos válidos de 780 y de 844 **no se solapan**.

El rótulo de fase se pinta **siempre, vacío cuando no hay** (`{kicker || null}` +
`[data-pace-v1-kicker]:empty`), para que el nombre no suba y baje 29 px en cada
cambio de fase. Pero **vacío no cuesta nada fuera de los suelos**: a 360×640 esos
11 px eran justo los que faltaban, y allí se prefiere que el nombre salte a que
aparezca barra.

**Lo que queda tiene nombre**: el gate de tipo **`ready`** —el que espera al
usuario porque el paso pide suelo, cojín o pared, p. ej. «Flexor de cadera»—
**no pinta contador**, así que su bloque se queda ~50 px por debajo del suelo que
ancla a los demás. Está asertado como **deuda con trinquete** (tope 30 px) en
`tests/runner-circulo.spec.js`: si se arregla, hay que bajar el tope a 0.

### Cuatro errores míos que la medida corrigió — no repetirlos

1. **Reservar cada texto por separado NO funciona.** Las reservas son
   **aditivas** y el peor caso real no tenía a la vez nombre de 2 líneas y cue de
   3: el bloque pasó de 460 a 529 px y **desbordó donde antes cabía**.
2. **El bloque no se compara contra el alto del CENTRO.** Dentro del centro
   también vive la barra de progreso — **61 px** que no estaba contando. Por eso
   una medida decía «holgura +11» mientras el test de desborde decía «rebasa 51».
3. **Con el bloque anclado no hace falta reservar ningún texto**: por encima del
   nombre sólo hay glifo y rótulo, los dos de alto fijo. Las reservas de `cue` y
   `care` **siguen en el CSS** y no son redundancia: por encima de los suelos ya
   no hacen falta, pero **por debajo son lo único que ancla** — ahí no hay
   `min-height` de bloque.
4. **Los backticks dentro del template literal del CSS**, otra vez (s139, s156,
   s157, s158, s162). El build **aborta**, y con la salida silenciada tres rondas
   de medición corrieron **contra un artefacto viejo**. Si una medida no cambia
   cuando debería, **mira primero si el build pasó**.

---

## 6 · Verificación

`npm run verify` PASA (0 problemas) · `npm run test:e2e` **105/105** (eran 97)
sobre el `index.html` regenerado · `PACE_standalone.html` intacto en v0.71.0 ·
auditoría geométrica de las 57 piezas: 0 fuera del círculo.

**Lo que la sesión NO regeneró y se cazó al abrir s172**:
`docs/product/GLIFOS_EJERCICIOS_PENDIENTES.md` es un documento **generado** y se
quedó diciendo **47 con arte · 14 pendientes** cuando ya eran **57 · 4**. Se
regeneró con `scripts/glifos/generar-pendientes.js` (censo coherente, 0
identidades sin fila en el encargo). `GLIFOS_ESTIRA_PENDIENTES.md`, de s170, se
quedó igual de viejo y **no tiene generador en el repo**: de sus 11, sólo siguen
sin arte `Onda espinal` y `Rana`. **Nada vigila estos dos documentos** — el
`verify.encargo.js` de s169 sólo mira el de logros.

## 7 · NO cubierto

- **El emisor de `session.completed`** (PASO 2 de la Fase 3): sin escribir.
- **El aire bajo el cue** sigue ahí en la piel ancha; la propuesta de moverlo al
  final del bloque está en §2.
- **Las 4 identidades sin arte** (`Pica en escritorio`, `Nordics`, `Onda
  espinal`, `Rana`) y **los 2 muebles** que faltan (`Fondos en silla`,
  `Deslizamientos en pared`): encargo escrito, dibujos por generar.
- **Los 15 glifos por lados** (`GLIFOS_ENCARGO_TANDA.md` §3): sin decidir y
  **sin cablear**. Hoy la app no puede enseñar un glifo distinto por lado — el
  mapa va por identidad y el runner, que sí sabe por cuál va, no se lo pasa.
- **Los prompts de `Descanso` y `Respira`**: pedidos al final de la sesión y no
  entregados.
- **`Puente torácico`** entró con silla en esta tanda y **no se ha mirado a
  tamaño real**; su versión anterior no era «le falta la silla» sino otra
  postura.
- **Ni un píxel comparado**: la suite mide geometría, no aspecto. Los glifos
  nuevos siguen sin mirarse en un teléfono de verdad.
- `v1GlyphSize` lee `innerHeight` en render **sin listener de resize** (deuda de
  s119). El legacy la hereda a propósito, para que los dos runners tengan un
  comportamiento y no dos.
