# s168 · Las familias del catálogo, el farol que se muda, y una pregunta que estaba mal hecha

**v0.98.0** · 2026-08-18 · desde v0.97.0 (`92d69fe`)

---

## 1 · Lo entregado

| Frente | Qué |
|---|---|
| **Familias** | Maestría se parte (26 → 19), «Estadísticas» se disuelve, nace **«La jornada»** (9). Siguen siendo **7** y ningún color se reparte de nuevo |
| **Etiqueta** | «Repertorio» vuelve a ser **«Exploración»** (ES y EN). La clave `exploracion` y los 18 ids `explore.*` ya casaban entre sí |
| **Glifos** | El **farol** deja `season.equinox.autumn` y pasa a `stats.streak.30` «Treinta amaneceres». Siguen 77 máscaras |
| **Red de seguridad** | Dos comprobaciones RELACIONALES nuevas: **familia declarada y vacía** y **`labelKey` sin cadena i18n**. Las dos rojas a propósito, más su guard de cero |
| **Regla §1** | `verify.integridad.js` llegó a 503 líneas al ganarlas: se trocea en **`verify.sandbox.js`** (451 + 78) |
| **Instrumentos** | `revision-familias.js` y `banco-pill-movil.js` nuevos; `revision-glifos.js` deja de duplicar CAT_META |
| **CI** | Caché de Chromium en el job `e2e` — con la medida que corrige su motivo |
| **Docs** | Tres cifras corregidas contra el código: el reparto en `STATE.md`, y 100/92 → **96/88** en `CONTENT.md` |

---

## 2 · Tres cifras que la documentación tenía mal

Antes de tocar nada, medir. `STATE.md` decía que el reparto era
**10 · 15 · 19 · 26 · 12 · 10 · 4** y el `HANDOFF_s167` decía
**10 · 15 · 18 · 26 · 13 · 10 · 4**. Cargando `catalog.js` en un sandbox: gana el
handoff. `exploracion` tenía 18 y `secretos` 13, no 19 y 12.

`CONTENT.md` decía **100 entradas / 92 activos**; el código tiene **96 / 88**.

Y una cuarta costura que no estaba en el handoff: **`explore.tweaks` vive en la
familia `secretos`**. Es el único id cuyo prefijo no casa con su familia, y ese
no se arregla renombrando, porque los ids sí se persisten.

---

## 3 · «La jornada» no es una idea mía: el código ya la trataba junta

La sugerencia escrita era partir maestría por los siete de hora del día y carga
de jornada. Al mirar los detectores apareció el argumento de verdad, en
`state-achievements.jsx`:

```
function checkTimeOfDayAchievements() {
  ... master.dawn      (antes de las 7, 5 días)
  ... master.dusk      (después de las 21, 5 días)
  ... morning.5        (antes de las 9, 5 días)   <- vivía en «constancia»
  ... stats.streak.30  (antes de las 9, 30 días)  <- vivía en «estadísticas»
}
```

**Una sola función desbloqueaba logros de cuatro familias distintas**, y las dos
últimas comparten la lista `morningDates`: son **la misma condición a dos
umbrales**, 5 días y 30. Tres logros de madrugada en tres familias es
exactamente el suelo del que salió el duplicado de s167.

Así que «La jornada» se lleva los siete de la sugerencia **más** `morning.5` y
`stats.streak.30`. Nueve.

**Reparto nuevo:** 10 · 17 · 18 · 19 · 9 · 13 · 10 = 96.

Los otros tres de la familia disuelta (`stats.month.first`, `stats.month.focus`,
`stats.year.first`) van a **constancia** y no a estacionales, que era la otra
opción de la sugerencia: los tres son acumulación sostenida —hermanos de
`focus.hours.*` y de `streak.365`—, mientras que estacionales va de fechas
señaladas del año.

### El nombre no pudo ser «Ritmo»

`stats.title` **es** «Ritmo»: el panel de estadísticas se llama así, y
`sidebar.section.rhythm` también. Bautizar «Ritmo» a la familia justo mientras se
disuelve «Estadísticas» —cuyo pecado era llamarse por el panel del que venía—
habría reconstruido la misma confusión con otro nombre. Queda **«La jornada»**
(EN: «The day»).

---

## 4 · Las dos comprobaciones nuevas, y por qué esas

`catsFuera` ya cazaba **la familia usada sin entrada en CAT_META**. Faltaban las
dos de la otra mano, y son justo las que este cambio podía romper:

1. **Familia declarada y VACÍA.** `Achievements.jsx` itera `CAT_META`, así que si
   los cuatro logros de «estadísticas» se mueven y su entrada se queda, el panel
   pinta una cabecera con nada debajo. Rojo comprobado inyectando una familia
   `fantasma`.
2. **`labelKey` sin cadena i18n, en los DOS idiomas.** Nadie lo miraba: una
   familia nueva sin su etiqueta escrita pinta **la clave cruda**
   («ach.cat.jornada») de cabecera. Rojo comprobado apuntando `jornada` a
   `ach.cat.noexiste` → 2 fallos (falta ES, falta EN).
3. **Y su guard de cero**, que es el que evita que «no he mirado nada» se lea
   como «todo bien». Rojo comprobado pasando `null` en vez de las cadenas:
   *«no me han pasado las cadenas i18n — no he podido mirar un solo labelKey»*.

Para la segunda, `chequeaI18n` pasa a **devolver** las cadenas: eran dos tandas
que hasta hoy no se hablaban.

### El troceo que salió de aquí

Añadirlas dejó `verify.integridad.js` en **503 líneas** y el propio verify se
puso rojo por su regla §1. La regla dice **trocear**, no recortar comentarios
hasta caber. Se extrajo `nuevoSandbox` + `cargar` a **`scripts/verify.sandbox.js`**
(451 + 78 líneas): se eligió esa costura y no la de una tanda entera porque el
sandbox es **infraestructura pura** —no aserta nada, no conoce el dominio—,
mientras que mover `chequeaLogros` habría arrastrado `censo`, `CENSO` y
`listaCorta` detrás. Los nombres locales se conservan, así que las cinco llamadas
no cambian.

---

## 5 · El farol, y una advertencia que se pudo afinar

El dibujo #15 se lee como un farol y el sol y la luna que justifican el
equinoccio son ilegibles a 56 px. Se muda a `stats.streak.30` «Treinta
amaneceres», donde ese mismo detalle es un **bonus** —sol y luna juntos son
literalmente el amanecer— y no el argumento.

**Lo que hay que saber, medido:** el handoff avisaba de que la ingesta reescribe
todas las máscaras y de que el peso de tinta se iguala contra la **mediana del
conjunto**, así que meter dibujos cambia máscaras viejas (17 de 58 en s167).
Aquí no cambió **ninguna**:

```
mascaras antes: 77 | despues: 77
NUEVAS: stats.streak.30
DESAPARECIDAS: season.equinox.autumn
comunes: 76 | de ellas CAMBIADAS: 0
```

El efecto de conjunto viene de cambiar el **conjunto de dibujos**, no de
re-correr la ingesta. Reasignar a qué id va un dibujo deja la mediana intacta y
las demás máscaras salen byte a byte iguales. Los cuatro números del CENSO
(`mascarasLogro` 77, `mascarasVisiblesDeSalida` 69, `mascarasDeSecreto` 8,
`precache` 105) tampoco se tocaron: entra y sale una máscara no secreta.

**Lo que ahora se ve y antes no:** el equinoccio de otoño cae a su glifo de
**texto `⚖`**, que resulta ser la balanza de dos platos que el encargo pedía.
Pero `season.equinox.spring` **sí** tiene dibujo, y es también una balanza: los
dos equinoccios quedan uno al lado del otro en sistemas visuales distintos hasta
que llegue el dibujo de otoño.

---

## 6 · La pill: la pregunta estaba mal hecha

El encargo pedía medir **a partir de qué altura** cabe la pill de
Foco/Pausa/Larga, con las cinco alturas reales de móvil. Se midió eso, en tres
anchos, con la sonda de `tests/home.helpers.js`. Resultado de la primera tabla:
**no se mueve nada en ninguna de las 15 combinaciones**, ni el aro, ni la topbar,
ni el desbordamiento, ni el bloque de abajo.

Eso no significaba que quepa. Significaba que la pregunta era otra:

> `[data-pace-tabs]` es **`position: absolute`** centrada con
> `translate(-50%,-50%)` (TopBar.jsx:46-48). Está **fuera de flujo**: no puede
> empujar, no puede encoger a nadie y no puede cambiar el alto de la fila.
> «No mueve nada» era estructural, no una medida de que hubiera sitio.

Lo que sí puede pasar es que **se solape**, y eso no es reflujo. Midiendo cruces
de rectángulos:

| ancho | solapa con |
|---|---|
| 320 | icono 40 px, icono 40 px, icono 15 px |
| 375 | icono 40 px, icono 32 px |
| 414 | icono 40 px, icono 12 px |

**Idéntico de 568 a 932 px de alto.** La altura no interviene. Barriendo anchos,
el solape desaparece **entre 520 y 560 px**: a 520 todavía pisa 3 px, a 560 está
limpio. Ningún teléfono en vertical llega ahí, y la piel de móvil se aplica por
debajo de 768.

### Y entonces, ¿cuánto costaría?

Sacarla del solape pasa por darle **su propia línea**, y eso sí gasta alto. La
pill mide 34 px, o sea **+42 px** con su hueco. Simulado:

| | 568 | 667 | 736 | 844 | 932 |
|---|---|---|---|---|---|
| **320** | desborda 50 px | limpio | limpio | limpio | limpio |
| **375** | desborda 50 px | **aro −42 px** | limpio | limpio | limpio |
| **414** | desborda 50 px | **aro −67 px** | **aro −6 px** | limpio | limpio |

El umbral existe, pero **no es una altura sola**: depende también del ancho —667
a 320, 736 a 375, 844 a 414—. Una media query por altura a secas elige mal en
uno de los tres.

### Y el gate obvio tampoco sobrevive a su medida

La condición elegante parecía `--pace-home-squeeze == 0`: el motor lo sube de 0 a
1 cuando empieza a comprimir aire, así que «0» suena a «hay sitio de sobra». Se
imprimió en la tabla **para comprobarlo en vez de escribirlo en un handoff**:

| alto | 568 | 667 | 736 | 844 | 932 |
|---|---|---|---|---|---|
| `squeeze` | 1 | 0,367 | **0** | **0** | **0** |

`squeeze == 0` vale **exactamente cuando el alto ≥ 736**, así que no son dos
condiciones sino una — y **deja pasar 414×736, donde el aro pierde 6 px igual**.
El squeeze mide si hay que comprimir AIRE; no sabe si al aro le sobran 42 px. Las
dos salidas honestas quedan escritas en el handoff: aceptar esos 6 px (el 1,6 %
de un aro de 381) o subir a 844 y esconder la pill en tres combinaciones donde
era gratis.

> Un fallo del propio banco, por si vuelve: la tercera medida recibía la hoja CSS
> en un parámetro que la función trataba como booleano (`mostrar ? MOSTRAR :
> null`), así que la tiraba y medía **dos veces lo mismo**. La tabla salía toda
> «no encoge nada» y parecía una buena noticia. Un control que corre en
> condiciones más tranquilas que el fallo no es un control.

### Esto ya estaba escrito, y se había perdido

Al pasar por `docs/archive/CHANGELOG_TABLA_HISTORICA.md`, la fila de **v0.71.0
(s128)** dice, palabra por palabra:

> *«tabs Foco/Pausa/Larga en móviles altos (no es un simple des-ocultar —son
> `position:absolute` centradas y **colisionan** con los 3 iconos top-right en
> anchos de 390–430px, por eso s46 las ocultó—; requiere fila propia gateada por
> `min-height`)»*

s128 ya tenía el diagnóstico entero: fuera de flujo, colisión con los iconos, y
la fila propia como salida. Se archivó con la tabla larga y, al reformularse en
s166 como «¿a partir de qué altura cabe?», la pregunta perdió su respuesta. Lo
que aporta esta sesión es la **medida**: que el solape también existe a 320 y 375
(no solo 390–430), que no depende en absoluto de la altura, que sólo desaparece
por encima de **~560 px de ancho**, y cuánto cuesta la fila propia en cada
combinación.

**La lección no es sobre la pill**: es que el archivo histórico contiene
diagnósticos que los handoffs sucesivos no arrastran. Antes de replantear una
pregunta vieja, conviene buscarla ahí.

---

## 7 · Un `waitForSelector` que llevaba desde s167 esperando a nadie

`revision-sellos-tamano-real.js` hacía
`waitForSelector('[data-pace-home]').catch(() => {})`. **Ese selector no existe**
—es `[data-pace-home-body]`— y el `.catch` se lo tragaba: 15 segundos de espera
muerta por pasada, y la sensación de haber esperado a que la home estuviera
lista. Se descubrió porque el banco nuevo copió la plantilla y **sin** el
`.catch` reventó al instante. Arreglado en los tres sitios.

En la misma línea, `revision-glifos.js` tenía `COLOR_CAT`, una copia a mano de
CAT_META con un `|| 'var(--ink-3)'` detrás: una familia nueva se habría pintado
del color de «primeros pasos» sin decir nada. Ahora lee `catalog.js` y la familia
desconocida revienta la hoja.

---

## 8 · El CI y los 11 minutos que no eran de cada push

El backlog decía que el CI gasta «11 de sus 13 minutos» instalando Chromium en
cada push. Medido sobre los 9 últimos runs con job `e2e`, el paso «Instalar
Chromium» tardó:

```
672 s  <- el run que se miró (v0.97.0)
 28 s · 28 s · 25 s · 24 s · 24 s · 23 s · 23 s · 21 s
```

Mediana **~24 s**. Parecía un caso patológico y no un coste fijo, así que se
cachea por lo que de verdad compra: **quitar esa cola**. La clave lleva
`package-lock.json`, y con acierto de caché hay que seguir poniendo las
librerías de sistema con `install-deps` (apt no vive en `~/.cache/ms-playwright`).

**Y la cola resultó ser más frecuente de lo que dije.** El push de cierre de esta
misma sesión tardó **217 s** en ese paso: son **2 de 10 runs por encima de los
tres minutos**, no uno de nueve. La mediana sigue en ~25 s, pero la razón para
cachear es más fuerte de lo que escribí media hora antes.

**Verificado en el push de cierre** (run `32167773908`, verde los dos jobs), y a
medias a propósito, porque con la caché vacía no se puede ver otra cosa:

```
5. Cache de Chromium                      0 s   <- fallo esperado, no habia nada
6. Instalar Chromium                    217 s   <- rama de descarga completa
7. Librerias de sistema (cache)       omitido   <- correcto: no hubo acierto
16. Post Cache de Chromium                4 s   <- LA CACHE SE GUARDO
```

Quedan **268,96 MiB** bajo la clave `playwright-Linux-<hash del lock>`. El ahorro
se ve en el **siguiente** push: ahí el paso 5 debe acertar, el 6 omitirse y el 7
correr en su lugar. Hasta entonces el frente no está cerrado.

---

## 9 · Verificación de cierre

- `npm run verify` — **PASA**, 0 problemas, 1 aviso (el `[INFO]` de s134 al
  restaurar el standalone). Versión **v0.98.0** coherente en los 7 sitios.
- `node build-standalone.js` — `index.html` regenerado;
  `PACE_standalone.html` restaurado a **v0.71.0**.
- `npm run test:e2e` — **81/81**, exit 0, **76 s** de reloj con `workers: 2`.
- Hoja de revisión: 7 familias, 96 sellos, biyección exacta, **cero errores de
  consola**.
- Las capturas de decisión se miraron a tamaño real sobre la app, a 1280 y
  `deviceScaleFactor` 2.

---

## 10 · Lo que queda abierto

- **La pill**: el umbral está medido y la decisión de maquetarla —darle su propia
  línea, o quitarle sitio a los iconos— no está tomada.
- **El color de «La jornada»**: heredó `--hydrate`, el único frío de una paleta
  tierra, y ha pasado de estar al final del panel con 4 sellos a estar en medio
  con 9.
- **19 logros sin arte**, ahora repartidos 3 · 5 · 3 · 5 · 1 · 2 entre
  constancia, exploración, maestría, secretos, estacionales y la jornada. Dos de
  ellos caen dentro de «La jornada» y se ven como texto suelto entre dibujos.
- **El equinoccio de otoño** espera su balanza de dos platos.
- Glifos de **ejercicio**: mecanismo listo desde s166, nunca corrido sobre arte
  real.
