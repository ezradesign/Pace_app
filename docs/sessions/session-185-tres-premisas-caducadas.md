# s185 · Tres premisas caducadas, y una regla que nadie vigilaba

**Fecha:** 2026-09-05 · **Versión publicada:** v0.115.1 · **Suite:** 191 → **195**

> Sesión de revisión. No hubo encargo nuevo: el usuario probó v0.115.0 y fue
> señalando. Cada cosa que vio resultó ser cierta y medible **después** de
> verla — y en tres casos la causa era **una premisa escrita al lado del código
> que gobierna, que había dejado de ser verdad**.

---

## 0 · La música: dos requisitos vivos y excluyentes

Lo primero fue desbloquear la Fase 5. `MUSICA_RESPIRA_BRIEFS.md` exigía «rango
medio despejado (200 Hz – 3 kHz sin nada denso)» para dejarle sitio a la
locución, y la decisión de s177 exige lo contrario —«el grueso de la energía
entre 200 Hz y 2 kHz»— porque **midió** que aquella restricción era la causa de
que la pieza no sonara. La auditoría de s183 lo listó como su hallazgo más
peligroso: alimenta a un generador.

**Lo que destrabó la contradicción fue que el brief describía mal a su
competidor.** Dos errores, los dos comprobados en el código:

- **La señal sintetizada no es un tono: es RUIDO.** `breathe.inhale/exhale`
  llaman a `breathNoise()` — ruido blanco por un paso-bajo (Q 1,5) que barre
  **200 → 800 Hz** al inhalar y al revés al exhalar. Y `breathe.hold` **no
  existe**: los sostenes son silencio.
- **Con música esa señal no suena.** Las combinaciones del producto son señal ·
  voz · voz+música, así que lo único que compite es la **locución**.

Y compite menos de lo que parecía: cruzando las duraciones de palabra con
`getSequence()`, la locución suena el **35,9 % del ciclo** de media en las 17
rutinas donde cabe entera — del 15 % en Kumbhaka al **72 %** en las de Rondas.

**La separación queda por comportamiento y por el tramo alto, no por el medio**:
grueso en 200 Hz–2 kHz (audibilidad) y poco por encima de 2 kHz (las
consonantes). En el medio conviven, y se distinguen porque la voz **se mueve**
sobre un fondo plano y quieto — las restricciones de «dinámica plana» y «sin
percusión con ataque» que ya tenía el brief no eran decoración: son el
mecanismo.

**Y apareció un segundo conflicto que la auditoría no había visto**, y que
habría vuelto a tirar la generación: cinco prompts pedían «a sustained low G» y
el de Relajación «everything lives in the low and low-mid register» — o sea,
exactamente la pieza que s177 midió inaudible. La raíz puede seguir siendo
grave; lo que no puede es ser un pad casi senoidal.

**Pendiente declarado**: en el código los dos ejes son independientes
(`voiceOn` y el fondo), así que «Tono» + «Música» sigue siendo alcanzable en
Ajustes. No rompe nada, pero no es la combinación para la que estos briefs se
escriben.

---

## 1 · La bola sobre las tarjetas: el aire despejaba lo que no era

«La bola y aro naranja quedan por debajo como superpuestos». El aire entre el
cabo y el canto de las tarjetas eran **6 px fijos**, y el halo de la bola guía
mide **7,1 px de radio** (r=1,7 en un viewBox de 100 → 0,017 D). Se metía
**1,2 px dentro** de la tarjeta. Despejé el trazo del aro y olvidé que en el
cabo se para la bola. Ahora el aire es **0,030 D**, proporcional.

## 2 · El halo: tres intentos, y los dos primeros eran el mismo problema

«La parte de arriba queda demasiado difusa y con una línea de corte», y después
«el halo por arriba queda recortado de forma rara».

- Una rampa **recta** metía un CODO donde la pendiente cambiaba cuatro veces, y
  el ojo encuentra un quiebre de pendiente igual que encuentra un borde — por
  eso el limbo lleva once paradas y no cinco, escrito tres bloques más arriba.
- Una S **larga** apagaba el NÚCLEO (que vive en 0,505–0,528 D, pegado al trazo):
  «muy tenue».
- Una S **corta** lo recuperaba (45 → 66 sobre una referencia lateral de 77)
  pero dejaba un canto plano sobre un halo redondo: «recortado de forma rara».

Ninguna podía ganar, **porque la corona no cabía**: muere a 0,628 D del centro y
sobre el aro había 24,5 px. La premisa que gobernaba esa rampa decía «por encima
del aro hay ~59 px hasta la fila de minutos». **Era falsa.**

La salida fue darle sitio, y medir de dónde: a **1280×800 el aro está topado por
ANCHO** y a 1920×1080 por el tope de 520 — **no por altura**—, así que un
`margin-top` de 0,055 D en el `timerWrap` no encoge el aro, solo reparte. El
hueco pasa de **24,5 a 47,6 px** y la rampa puede volver a ser larga.

## 3 · El número: las cajas mentían en 42 px

«Sube los minutos… deberían estar a la misma distancia de FOCO MANUAL y de Foco
breve». Por caja estaba a **10,9 arriba y 32,3 abajo** — parecía pegado arriba.
Midiendo **tinta** (primer y último píxel pintado) la verdad era la contraria:
**53 arriba y 23 abajo**. El `line-height: 0.9` de un serif de display deja unos
42 px de aire muerto sobre los glifos.

Y la corrección obvia tampoco funcionó a la primera: un margen negativo en el
número **se lleva consigo todo lo que va debajo**, así que subía los dos juntos
y quedó 38/25. Hay que restar arriba y sumar lo mismo abajo — así el número sube
de verdad y el alto del bloque no cambia, que importa porque el marco lo centra.

Final, tras un último ajuste a ojo del usuario: **43/36** a 1280×800.

## 4 · La regla que nadie vigilaba: cero scroll vertical en escritorio

La maqueta de revisión lo destapó. **La home hacía scroll de verdad**: 29 px a
1536×864 y 11 a 1600×900, comprobado moviendo `scrollTop`. Y **ya estaba en lo
publicado** (15 px en HEAD).

La causa, bisecada: `[data-pace-sun]`. Ocultándolo, 0. Y dentro de él, la caja
del **bloom**. La premisa: *«el hueco entre el CENTRO del aro y el borde inferior
es de 0,96 D en el peor breakpoint… ni la caja ni la luz desbordan NUNCA»*. Se
tomó en cuatro breakpoints y **el peor no estaba entre ellos**: medido en los
nueve, es **0,852 D a 1536×864**. La caja pedía 0,909 D → no cabía por 30 px, y
el scroll medido eran 29. A 1600×900: predice 11, mide 11. **Al píxel.**

`BLOOM_H` 1,42→1,34 · `BLOOM_SUBE` 0,36→0,38 · `BLOOM_R` 0,84→0,77. El coste
medido: luz lateral 72 → 67-68, en Actividades 93 → 84-86.

**Por qué no lo veía nadie:** el motor mide el **stack** (s156, y con razón:
`scrollHeight` es la envolvente de toda decoración absoluta) y el stack cabía.
La suite tenía un test de «encender la luz no le añade scroll», pero **compara
la luz encendida contra apagada y el desborde era idéntico en los dos** — la
opacidad no quita layout. Misma clase que el hallazgo de s183 sobre
`stats-pestanas`: verde sobre el estado equivocado.

## 5 · Y reproduje el defecto de s160/s162, un nodo más afuera

Mi margen del halo es proporcional a D, así que depende de lo que el motor
escribe — y con `reduced-motion` se convertía en transición y aterrizaba un
frame tarde: el aro salía **381 con reduced-motion y 379 sin él**. Lo cazó la
tolerancia de 1 px que dejó s162. `[data-pace-timer-wrap]` entra en la lista de
exenciones.

---

## La red

| Añadido | Qué defiende |
|---|---|
| **4 tests** «la home de escritorio no hace scroll vertical» | La regla del usuario, en los dos estados y en los cuatro viewports críticos. Mide moviendo `scrollTop`, **no** restando `scrollHeight` |
| El **aire del cabo**, ahora relacional al halo | `> 0,017 D` de holgura y `≤ 0,05 D` de distancia, dentro del aserto de recorte y solapamiento que ya medía ese corte |
| `scripts/audit/revision-aro-s185.js` | La maqueta de los nueve viewports con sus números debajo |

**Mutantes calibrados en rojo (3):** el aire del cabo devuelto a los 6 px fijos
de s184 (2 rojos), la caja del bloom devuelta a 1,42 (2 rojos, y son los dos
viewports que fallaban de verdad) y el margen del halo fuera de la lista de
exenciones.

**Y el tercero enseñó algo: un mutante puede necesitar la CARGA de la suite para
morder.** Corriendo su test solo, pasa — 6 de 6 repeticiones en verde. Con el
archivo entero y los workers en paralelo, rojo a la primera. Es la misma
condición que s162 describió como «rojo intermitente», y la conclusión práctica
es que **un mutante de temporización se calibra con el spec entero, no con
`-g`**: en aislamiento el frame tardío llega a tiempo igual.

**Y lo que NINGÚN mutante puede defender, dicho:** que un degradado tenga un codo
o un canto plano es criterio, no aserto — los tres intentos del halo los
distinguió el usuario mirando, y ese sigue siendo el detector.

## Lo que NO cubre

- **1366×610**: el aro está limitado por altura, así que se come el margen del
  halo y quedan 5,3 px sobre ACTIVIDADES. Reservarle holgura al motor sería
  meterse en el bucle de «encoger hasta caber», y no se ha hecho.
- **Móvil**: la revisión de esta sesión es de escritorio. Los números de móvil
  salen del banco, no de la maqueta.
- **La regla de no-scroll solo se vigila en escritorio**, que es donde el usuario
  la pidió. En móvil el scroll es legítimo.

## El incidente del calibrado: `git checkout` restaura al último COMMIT

Escribí el guion de mutantes con un `restaura()` que hacía
`git checkout -- <los tres archivos>`. Los mutantes se aplican sobre la FUENTE, y
la fuente tenía el trabajo de la sesión **sin commitear**: el primer `restaura()`
borró de golpe el ajuste del bloom, la curva del techo, el aire del cabo y la
exención del `timerWrap`. Nueve horas de sesión en tres archivos.

Se recuperó entero —y comprobado: mismas cuentas de líneas, mismo `diff --stat`,
mismas cabeceras de hunk— reconstruyendo las ediciones desde el **transcript de
la sesión**, que guarda cada llamada con su texto exacto. Pero el aprendizaje no
es que se pueda recuperar:

- **La restauración de un mutante no es `git checkout`: es una COPIA.** `cp` antes
  de mutar y `cp` de vuelta. `git checkout` restaura al último commit, no al
  estado anterior a la mutación, y esos dos estados solo coinciden si no hay nada
  sin commitear — que es justo lo que nunca pasa a mitad de sesión.
- Ya estaba escrito en la memoria del proyecto desde antes, con esas palabras.
  Volvió a pasar igual.

## Y una lección de método, porque la pagué dos veces

**La maqueta de revisión volvió a recortar.** Le puse scroll por figura creyendo
que bastaba, y una barra de scroll no es enseñar la captura: de 1536 px para
arriba se veían cortadas. Es literalmente el defecto de s182 —donde el corte que
el usuario reportó era del carrusel de la maqueta, no del producto— y la lección
estaba escrita en el archivo que yo mismo acababa de escribir.
