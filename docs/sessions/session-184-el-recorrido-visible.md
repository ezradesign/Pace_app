# s184 · El recorrido que solo pisa lo que se ve

**Fecha:** 2026-09-05 · **Versión publicada:** v0.115.0 · **Suite:** 187 → **191**

> Este diario tiene dos mitades. Los apartados 1–7 son el encargo inicial; del 8 al 10, la
> revisión del usuario y lo que salió de ella. Se deja así a propósito: la segunda mitad son
> defectos que **ninguna suite iba a encontrar** y que solo aparecieron al mirarlo.

---

## El encargo

Con estas palabras, del usuario:

> «cuando se le da a comenzar foco, en vez de que se monte el círculo completo,
> solo trabaje en el rango que se ve en la home, ese semicírculo con parte
> oculta; el timer debería empezar en el extremo izquierdo visible y acabar en
> el derecho visible, unos 270 grados aprox.»

Y, dos aclaraciones después, tres bordes más: que el halo no llegue a pintar la
fila de minutos, que por abajo no parezca cortado, y que los dos cabos del
anillo no parezcan amputados.

---

## 1 · «Unos 270» no se escribe: se mide

Lo primero fue medir, y el número del usuario estaba clavado: **271,58°** a
1280×800 (D=420, horizonte=67 px) y **271,84°** a 390×844 (D=359, horizonte=57).

Pero no es constante. El horizonte es `--pace-horizon`, que el motor
(`home-geometry.js`) publica como el 16 % de D **con un techo por el CICLO**, así
que el ratio real oscila entre **0,147 y 0,176** según el breakpoint y el barrido
va de **~266° a ~276°**.

Un 270 escrito a mano habría pasado cualquier revisión a ojo y habría dejado los
dos cabos **hasta 1,9 px fuera del corte** —medido— en unos tamaños y dentro en
otros: un extremo cortado por la mitad aquí y flotando allá. Por eso el ángulo
sale de la misma pareja de tokens que dibuja el corte, con
`asin((D/2 − H) / 0,475 D)`, y no puede desincronizarse de él.

## 2 · Tres defectos que solo aparecieron midiendo

**El primero: mi versión se quedó redonda con el motor funcionando.** La medida
inicial se hacía en un `useLayoutEffect` con un `ResizeObserver` sobre el marco,
razonando que el horizonte no puede moverse sin que se mueva D. Es cierto **en
régimen** y **falso en el arranque**: la única lectura que llegó a ocurrir
devolvió 360 porque `--pace-horizon` aún no resolvía, y como el marco ya tenía
sus 420 px definitivos el observer **no volvió a disparar nunca**. Se publicaba
un arco de 360 con toda la maquinaria nueva funcionando.

La lección es de tipos, no de timing: **«no lo sé» y «da la vuelta entera» son
respuestas distintas**, y devolver la segunda congela el estado. Ahora
`medirBarridoVisible` devuelve `null` cuando no puede decidir, y el disparador es
un `MutationObserver` sobre el `style` de `<html>` —donde el motor **escribe**
(`setVar`, `home-geometry.js:136`)—, con el `ResizeObserver` de refuerzo para el
caso del motor apagado.

**El segundo: el cabo derecho caía 0,78 px por debajo del izquierdo.** No era
azar. Chrome dibuja el círculo con cuatro béziers cuya longitud de trazado es
**297,97**, no la circunferencia exacta **298,451**; el guion se pasaba un 0,16 %
y el arco se alargaba 0,44°. `pathLength="360"` lo elimina —el motor normaliza
por su propio trazado— y de paso deja el guion escrito **en grados**. Verificado
después: desviación 0,00 px a la izquierda y −0,11 a la derecha, y los dos cabos
simétricos dentro de 0,05 px.

**El tercero: un fantasma de color con el Pomodoro parado.** Al redimensionar,
`stroke-dashoffset` —que lleva una transición de 1 s— viajaba hacia su valor
nuevo **pintando arco por el camino**, y el motor da hasta ocho pasadas de
«encoger hasta caber». Visto en captura a 800×500: un tramo de color en el
extremo izquierdo sin sesión ninguna. Es el mismo principio que s160 dejó escrito
para el alto del aro —**la geometría no se transiciona**—, resuelto colgando el
`key` del `<circle>` del barrido: cuando la geometría cambia, React monta uno
nuevo y el valor no tiene desde dónde viajar.

## 3 · La consecuencia bonita

Con el recorrido centrado en las 12, **a mitad de bloque la punta cae clavada
arriba**. Coincide con el máximo de luz, porque s159 retimó la hora justo para
que el mediodía cayera en la mitad. No se buscó; sale de la geometría.

## 4 · El horizonte: de filo a niebla, en dos pasos

Con el arco ya recortado, la apertura del horizonte de s158 se quedaba sin
trabajo: nació para que el arco **completase los 360** hundiéndose en la luz, y
el arco ya no baja. Se le preguntó al usuario y eligió **corte seco siempre**,
así que se retiró `--pace-abre` (sin más consumidores).

**Y el corte seco duró lo que tardó en verse.** Los dos cabos se leían amputados
—«como si estuvieran cortados»— y el encargo siguiente fue suavizarlos. La
máscara pasa a recorrer **NIEBLA** (0,14 D, 59 px con el aro de 420) y llega a
cero **justo** en el horizonte. Sigue sin haber luz por debajo y sigue sin
depender de la sesión.

**La niebla va con curva, no lineal**, y esa es la diferencia entre «suave» y
«medio arco apagado»: con rampa recta el arco pierde presencia en el 8,5 % final
de cada extremo, y ese tramo es **información** —son los últimos minutos del
bloque—. Con las paradas elegidas mantiene el 94 % de su presencia en tres
cuartas partes del recorrido y solo se apaga en el último tercio. Se decidió
mirando tres variantes al tamaño real.

## 5 · El halo pintaba la fila de minutos, y la premisa que lo permitía era falsa

El comentario que gobernaba la atenuación superior del limbo decía: «por encima
del aro solo hay ~59 px hasta la fila de minutos». **Medido hoy a 1280×800: 24,5
px** (borde del aro en y=167,1; la píldora «45» acaba en y=142,6). Y el limbo
muere a 0,628 D del centro, o sea **64 px pasado el aro**.

Fotografiando el mismo fotograma con el sol encendido y apagado —reloj congelado,
para que digitos y CTA no contaminen la resta— la fila de minutos recibía **57
sobre 255**. No era una precaución: estaba pasando.

Atenuar al 72 % no lo arregla, porque 0,72 nunca es 0. La rampa pasa a **morir**:
transparente por encima de 0,52 D del centro, a pleno desde 0,24 D — **0,28 D de
recorrido**, tan gradual que no hay borde que encontrar. Lo que cuesta está
medido y es casi nada: el brillo pegado al trazo del aro baja de **64 a 58**,
porque el núcleo de la corona vive entre 0,505 y 0,528 D y lo que se recorta es
**la cola**.

**Fila de minutos: 57 → 0-1 sobre 255, en seis viewports** (1280×800, 1440×900,
1280×720, 1920×1080, 768×1024, 390×844).

Y la cola de la luz: a pleno hasta el horizonte, muerta **0,22 D** más abajo. Ni
filo en la línea ni cola hasta la tarjeta. Medido: **30** a 60 px por debajo del
horizonte (era 79) y **0** al pie de Actividades (era 31).

## 6 · La red

**Nace `tests/aro-recorrido.spec.js`** (3 tests). El aserto del barrido **no
compara contra 270**: deriva el ángulo esperado de la **máscara** —un camino
independiente del que recorre el componente, que lee la custom property— y exige
que coincidan dentro de 0,2°. Y mide **por los dos lados**, que es la lección de
s179: un aserto sobre el cabo izquierdo pasa igual con el arco entero, porque ese
cabo está donde está en los dos casos.

**Cuatro mutantes calibrados en rojo**, cada uno con el mensaje que nombra su
defecto:

| Mutante | Muerde con |
|---|---|
| 270 escrito a mano | «el barrido dibujado (270) no es el que da el horizonte (271,58)» |
| sin giro del grupo | «el cabo IZQUIERDO no cae en el horizonte» + «la punta no está en la vertical del centro» |
| punto guía a 360 | «el punto guía no apunta a la punta del arco» |
| pista sin recortar | «el barrido dibujado (360) no es el que da el horizonte» |

**Nace `tests/home-luz-bordes.spec.js`**, al partir `home-luz.spec.js` cuando
llegó a 581 líneas. El corte es por **dominio**: allí vive una sola pregunta,
«dónde acaban la luz y el anillo», y se lleva `perfilDeLuz`, que es su
instrumento y no lo usa nadie más. Tres mutantes más en rojo: el techo que solo
atenúa, la niebla a cero, y las dos colas fuera.

**Y el aserto de la cola sí se pone rojo**, cuando su versión anterior declaraba
por escrito que no se había conseguido. La diferencia no es ingenio: el contrato
cambió. «La cola LLEGA a Actividades» pedía distinguir dos intensidades donde los
chips opacos y el limbo se mezclan; «la cola NO llega a la tarjeta» pide
distinguir **algo de nada**, y eso sí se ve (0 contra 2,896).

## 7 · Tres trampas del instrumento

**El service worker servía `.jsx` cacheados.** Cuatro medidas seguidas midieron
código viejo mientras el fuente ya estaba corregido, incluida una en la que
diagnostiqué «el efecto no se ejecuta nunca» sobre una versión que el navegador
ni había cargado. Es la trampa que s139 dejó escrita —purgar el SW antes de
medir— y se re-registra en **cada carga**.

**Un mutante que mentía en verde.** La hoja declara la máscara **dos veces**,
`-webkit-mask-image` y `mask-image`. Mutar solo la primera no cambia un píxel en
Chrome, que usa la segunda: el mutante salía verde y parecía que el aserto no
servía. Dos pasadas en falso hasta comprobarlo en el artefacto.

**Un perfil contaminado.** Comparar «sesión apagada» contra «sesión al 50 %» mide
también los dígitos, el CTA y el propio arco: el perfil salía con picos de **211**
en la banda del número. La resta buena es el **mismo fotograma** dos veces,
apagando solo `[data-pace-sun]`.

Y una cuarta, que es mía y repetida: **backticks dentro del template literal** de
`_responsive.js`, que aborta el build. Van **seis veces** (s139, s156, s157,
s158, s162 y esta). Lo cazó el `verify` en el paso 2, que es exactamente para lo
que existe.

---

## 8 · La revisión, y las tres cosas que solo se ven mirando

Con el arco ya recortado y todo en verde, el usuario lo probó. Tres correcciones, y las tres
son defectos que ninguna suite iba a encontrar.

**«Tarda en aparecer el contador de la parte izquierda».** Literal y medible: el arco **nace en
el corte**, que es exactamente donde la máscara vale cero, y yo le había puesto encima la niebla
de 0,14 D. A 25 minutos tardaba **~2,2 min** en llegar a plena opacidad; los primeros minutos del
bloque no tenían señal. Y el mismo defecto explicaba la otra mitad de su frase —«no parece que
empiece en el lugar adecuado»—: cuando por fin se veía, el arranque ya estaba a media subida.

La causa de fondo era **una sola niebla para dos cosas que no son la misma**, y el reparto ya
estaba escrito en `tokens.css` desde s158: **«Arco = información; halo = ambiente»**. No lo
apliqué. Ahora la pista vive en su propia capa con la niebla larga —es la escala, puede
disolverse todo lo que haga falta— y el arco lleva 0,035 D, el remate justo. A los 8 segundos ya
está en el extremo izquierdo.

**«La parte de arriba queda demasiado difusa y con una línea de corte».** El corte era el **codo**
de mi rampa: recta de 0 a `--sun-top`, con la pendiente cambiando unas cuatro veces en 0,24 D. El
ojo encuentra un quiebre de pendiente igual que encuentra un borde — que es exactamente por lo que
el limbo lleva once paradas y no cinco, escrito en el propio archivo tres bloques más arriba. La
S nueva no solo quita el borde: pesa **más** en el tramo medio (0,66 contra 0,51 a 0,32 D), así
que quita también lo difuso.

**«¿El aro debería salir casi desde el marco de las tarjetas?»** Sí, y por una razón que cierra el
primer problema de raíz: si el aro llega al canto de las tarjetas, lo que lo termina es una
**oclusión** —son opacas— y una oclusión no se lee nunca como amputación. El rótulo ACTIVIDADES
queda dentro de su abertura. **271,6 → 295,8 grados.**

## 9 · Por qué eso obligó a separar dos tokens

`--pace-horizon` **también mueve el layout**: las dos pieles lo consumen como `margin-top`
negativo y `SuggestedPathCard` igual. Bajarlo habría bajado las tarjetas con el aro y habría
descolocado la composición entera. Son dos preguntas distintas —dónde se corta el aro y cuánto
suben las Actividades— y hasta hoy compartían nombre.

La garantía de s156 no se pierde, cambia de forma: el motor calcula `--pace-dial-corte`
restándole al **mismo** solapamiento la banda del rótulo, que **mide** (32 px a 1280×800, pero
depende del padding de la piel y del idioma). Una fuente, dos consumidores.

Medido tras el cambio: el cabo queda a **5,9 px** del canto de las tarjetas en 1280×800,
1920×1080, 1280×720 y 390×844. Barrido 290,5–298,4 grados.

## 10 · Tres trampas más, todas mías

**Un custom property sin registrar no se computa.** Dejé la resta en CSS y `--pace-corte` valía
literalmente `max(4px, calc(67px - 32px - 6px))`: `getPropertyValue` devuelve el **texto**,
`parseFloat` daba NaN y el aro se quedó dando la vuelta entera. Es el mismo modo de fallo del
apartado 2 —una lectura que no puede decidir— por una causa distinta. Lo resuelve el motor,
publicando el corte ya en px, que es como funcionan los otros dos tokens.

**El signo del aire, invertido.** El corte se mide desde abajo, así que restar la banda lo baja
hasta el canto y hay que **sumar** el aire para subirlo. Con el signo al revés el aro acababa 6 px
**por debajo**, asomando por los huecos entre tarjetas: 310,3 grados en vez de 295,8.

**Una regla que di por añadida y nunca lo estuvo.** El script imprimió «responsive ok» y no
verifiqué el reemplazo: `[data-pace-dial-pista]` estuvo sin máscara propia durante dos rondas de
capturas, o sea que la pista llevó la niebla del arco mientras yo describía lo contrario. Lo cazó
el aserto del reparto — que hubo que escribir **después** de que su mutante saliera verde.

---

## Lo que NO cubre esta sesión

- **Caminos no se toca.** Su aro va por la rama `ticks` —60 marcas, sin arco ni
  pista— y no tiene horizonte del que recortar. Sigue siendo la vuelta entera a
  propósito, y el spec lo declara.
- **Los estilos `barra` y `analogico`** del Pomodoro no pasan por `TimerDial`: ni
  se miran.
- **El perfil de la luz en móvil** lo mide el banco, no la suite: allí la tarjeta
  de Camino se solapa con el aro y las bandas de filas no separan lo mismo.
- **Las dos nieblas se calibraron a 1280×800.** Que 0,14 D y 0,035 D sigan siendo los anchos
  adecuados en móvil se juzgó mirando, no midiendo.
- **Que un degradado tenga un codo visible no lo caza ningún aserto.** Se intentó: devolver la
  recta al techo de la luz deja la suite en verde. Es criterio, y lo detecta la revisión a tamaño
  real.
- **El aro pasa por detrás de las tarjetas, pero no se comprueba qué hay en los HUECOS** entre
  ellas a cada ancho: el cabo cae dentro de una tarjeta en los cuatro viewports medidos, y en
  otros podría caer en un hueco.
- **Ni un píxel del reparto halo/cola** lo aserta la suite: eso sigue siendo la
  revisión a tamaño real, que desde s147 es el detector que manda.

## Archivos

| Archivo | Qué cambió |
|---|---|
| `app/ui/TimerDial.jsx` | El barrido medido, el grupo girado, `pathLength`, el `key` de geometría, y la pista en su propia capa |
| `app/main/_responsive.atmosfera.js` | Las dos nieblas con curva, la S del techo, las dos colas |
| `app/main/_responsive.js` | Retirada de `--pace-abre`, `--pace-corte` separado del horizonte, máscaras de las dos capas del anillo y tercera en cada capa del sol |
| `app/main/home-geometry.js` | Mide la banda del rótulo y publica `--pace-dial-corte` |
| `tests/aro-recorrido.spec.js` | **NUEVO** · 3 tests, 4 mutantes |
| `tests/home-luz-bordes.spec.js` | **NUEVO** · 3 tests, 3 mutantes (sale de `home-luz.spec.js`) |
| `tests/home-luz.spec.js` | 581 → 322 ln |
| `tests/home.helpers.js` | El horizonte se lee como «donde la máscara llega a cero» |
| `tests/home-geometria.spec.js` | Usa el guard nuevo |
