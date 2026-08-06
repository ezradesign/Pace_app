# Sesión 159 — La luz del Pomodoro

**Fecha:** 2026-08-05 / 2026-08-06 · **Versión:** v0.89.0 → **v0.90.0**

> Cierra un frente que venía abierto desde s157 y s158, **dos sesiones que nunca
> llegaron a cerrarse**: su trabajo estaba en el árbol sin commit y sin una línea
> de documentación. Este commit publica las tres.

---

## 0. De qué se partía

En el árbol, sin commit: la reescritura de la atmósfera de s157 (corona fuera del
recorte, luz de suelo, escala Kelvin) y la de s158 (dos capas —limbo y bloom—,
cuatro horas del día, cola inferior contenida). En disco, `PLAN_ATMOSFERA_HOME.md`
sin trackear, escrito al final de s157 y **ya desfasado**: describe defectos que
s158 resolvió y da por abiertas preguntas que s158 cerró.

La sesión empezó como calibración de la atmósfera y el usuario la reordenó al
detectar una regresión: **el Pomodoro no estaba centrado en móvil.**

---

## 1. El centrado móvil — era PREVIO y estaba publicado

Medido sirviendo los dos artefactos en paralelo (árbol en 8765, HEAD v0.89.0 en
8766): **la desviación era idéntica en los dos**. +11,80 px a 320, +11,89 a 360,
+12,00 a 375 y +12,09 a 390. La atmósfera de s158 **no lo introdujo: lo hizo
visible**, porque el halo cuelga del aro y arrastra el error a un campo de luz de
790 px de ancho.

**La causa, medida y no deducida**, recorriendo la cadena de ancestros del aro:

1. El motor publica `--pace-dial-d` = **0,92 · W del viewport** (techo móvil de
   s156). Su comentario dice que ese techo sale del «ancho REALMENTE usable
   (W−24)», pero **solo descuenta el padding de `main-content`**.
2. La raíz de `FocusTimer` añade **otro** padding lateral, `clamp(0px, 4vw, 40px)`
   — 15,6 px por lado a 390 — que aquel techo no conoce.
3. Su max-content queda en **390,19 px** contra los **366** de ancho útil.
4. `[data-pace-main-content]` es un **grid de UNA sola pista `auto`**: la pista
   crece a 390,19, **desborda** y se coloca desde el **START** en vez de
   centrarse. La mitad del desborde es exactamente la desviación.

**El arreglo**, dos declaraciones en el bloque `≤768px` de `_responsive.js`:
anular el padding lateral (quita la causa) y `justify-content: center` (el
guard). A 320 la primera sola deja solo **2 px de holgura**, así que el guard no
es adorno — y se demostró: el banco de rojos incluye un **control negativo** que
deshace solo el padding y **sigue verde**.

Resultado: **0,00 px** en los cuatro anchos, con luz y sin ella, día y noche.
D, arco, número y `home-geometry.js` intactos; escritorio byte a byte igual.

---

## 2. La curva — M1 y M2

**El diagnóstico.** Con el recorrido lineal, el máximo perceptual compuesto caía
en **p=0,375** y en la mitad ya había bajado un 20 %. Y la curva **no decaía**:
tras el pico tenía **cinco rebotes** (a 1280×720; cuatro a 390×844), porque en
oscuro los tokens de noche pesan más que los del atardecer y la contribución de
color sube **×1,41** en el último tercio mientras la envolvente solo bajaba ×0,74.

**M1 · retiming.** Las cuatro paradas de color no se tocan; lo que deja de ser
lineal es el **recorrido**: la primera mitad del bloque consume amanecer→mediodía
y la segunda el resto. Y la envolvente pasa a dos medias curvas que comparten el
pico. La meseta **sale de la curva** —`curvaSuave` tiene pendiente cero en sus
extremos— en vez de ser un tramo plano escrito aparte: en 45-55 % la intensidad
varía ~1,2 %.

**M2 · la mitad que baja usa OTRA curva.** `curvaCaida` (x^1,5) conserva la
pendiente cero en el pico —y por tanto la meseta— pero **llega al final
bajando**. Eso es lo que mata el rebote de p=1: con la curva simétrica la luz se
aplanaba en el minuto 25 mientras el color seguía subiendo. Cola nocturna de
0,46 a **0,42**, decidido con el usuario.

| | s158 | s159 |
|---|---|---|
| pico de presencia (noche) | p=0,375 | **p=0,495** |
| pico de calor OKLab (noche) | p=0,52 | **p=0,495** |
| rebotes tras el pico | 5 | **2** |
| rebote en p=1 | sí | **eliminado** |

**Lo que NO se corrigió, por decisión del usuario:** en la paleta **clara** la
presencia compuesta no culmina en la mitad —sigue subiendo hasta p≈0,77, porque
sobre papel crema el atardecer contrasta más que el mediodía—. El **calor** sí
culmina centrado (0,495), que es lo que `tokens.css` ya declaraba: «sobre papel
claro la luz no es más brillo, es más calor». Medido, presentado y **no
compensado**.

---

## 3. El parpadeo — M3

Dos cuantizadores sin suavizar ninguno. Medidos por separado, congelando uno y
barriendo el otro: salto de **color 4,9 %** del máximo y de **intensidad 4,7 %**.
Reconstruida la serie segundo a segundo, el bloque tenía **50 saltos, uno cada
30 s**, 47 de ellos ≥2 % y el mayor de **4,47 %**.

k de 24 a **96** e i de 30 a **120**. **No se añadió transición de opacidad**, y
el usuario tenía razón al avisar: una transición sobre `opacity` **no suaviza el
escalón de color**, que vive dentro del degradado. Subir la resolución arregla
las dos mitades con el mismo mecanismo.

| | s158 | s159 |
|---|---|---|
| saltos por bloque | 50 (uno cada 30 s) | **197 (uno cada 7,6 s)** |
| salto mayor | 4,47 % | **2,03 % noche · 2,02 % día** |
| saltos ≥ 2 % | 47 | **1** |

**Coste, medido y no supuesto**, alternando tres modos en la misma pasada
(sin luz / resolución vieja / resolución nueva), 1500 ticks, separando tiempo de
pared de trabajo real por CDP: subir la resolución cuesta **+0,44 s** por bloque
de 25 min (**0,029 %** del tiempo real) y la luz entera **+0,61 s** (0,041 %).

---

## 4. La cola inferior — M4

De la contención de s158: en escritorio la luz llegaba a la banda de Actividades
con 0,75 de desviación y la cola moría en el canto de la tarjeta. Se compararon
tres niveles a tamaño real y el usuario eligió el intermedio: paradas 85 % y 92 %
del bloom de 0,30/0,12 a **0,50/0,28**. **Radio, caja y anclaje sin tocar**, que
es lo que garantiza que no vuelva el scroll.

---

## 5. Tres defectos que encontró el usuario mirando, y los tres eran del mismo tipo

**(a) La sombra de los chips entraba al corte.** Muestreado cada 100 ms desde el
click: con la luz ya al 60 %, la sombra iba por 0,01 de alfa, y al pararse
`--pace-on` daba un tirón de 0,09 a 0,17 en 300 ms. **La causa**: el chip lleva
`transition` de 0,22 s **INLINE sobre todas las propiedades** (su hover), así que
su `filter` perseguía con 220 ms de retraso a un `--pace-on` que viajaba 1,6 s.
No se puede ganar a un `transition` inline sin `!important`, y con `!important`
el hover se quedaría sin transición ⇒ **la sombra se muda al grid**, que es el
padre inmediato de los cuatro chips y no lleva transición ninguna. `drop-shadow`
sobre él proyecta la sombra del contenido renderizado: misma forma, una
declaración en vez de cuatro. Y `--sun-cast` baja de 0,18 a **0,10**: a 0,18
leía como sombra dibujada. **Bajar el alfa sin lo otro habría tapado el síntoma
dejando el corte.**

**(b) Pausar era un salto de un frame.** El 0,45 vivía multiplicado dentro de
`--pace-i`, que no se transiciona: pausar bajaba la luz de 0,517 a 0,233 en un
frame, y continuar al revés. Sale a un **tercer mando**, `--pace-pausado`,
registrado con `@property` e interpolado por su cuenta en 500 ms. Y lo que
publica `FocusTimer` es el **interruptor**, no la profundidad: cuánto se recoge
la luz es un valor **por paleta** (`--sun-pausa` 0,45 en oscuro y 0,35 en claro)
y las paletas viven en CSS.

**(c) La cola no llevaba el color del arco.** El usuario lo formuló como «bajo el
horizonte no hay tiempo, hay luz». `FocusTimer` publica `--pace-arco` con el tono
del recorrido (cuantizado a los mismos 96 pasos) y las dos paradas finales del
bloom lo mezclan al 25 %. Aislado con todo congelado salvo esa variable, el eje
rojo-verde de la cola sigue al arco —**1,25 terracota → 0,95 ocre → 0,45
oliva**— y la presencia solo sube un 5-7 %: **tiñe, no ilumina**. **Solo la
cola, no el limbo**: s158 bajó la saturación un 10 % justo porque el halo llegaba
a leerse como una ampliación del arco.

---

## 6. Lo que se decidió y NO se hizo

**El remapeo del arco** (que el tiempo no se gaste en los 94,3° ocultos, o sea el
**26 % del bloque** con la cabeza invisible). Se montó un mock y el usuario lo
aprobó **para su propia sesión**: toca el arco, los 60 ticks y `TimerDial`, que
está compartido con Caminos. Las cinco decisiones que hay que tomar entonces
están en el backlog de `STATE.md`.

**El sidebar no refleja.** Decidido: fuera. Es la superficie con más texto
pequeño de la app y teñir el chrome es donde empieza lo recargado.

---

## 7. Deuda mecánica

`tests/home-geometria.spec.js` había llegado a **631 líneas** (CLAUDE.md §1 fija
500). Partido en `home.helpers.js` + `home-geometria` + `home-luz` +
`home-luz-curva`, **sin tocar una línea de cuerpo** y con el mismo número de
verdes antes y después. Precedente: s155 con `eventos.spec.js`.

---

## 8. El instrumento mintió SIETE veces

Ninguna era el producto:

1. **`getComputedStyle` de `--pace-luz` devuelve `oklab(L a b / alfa)`**, no RGB.
   El primer parser lo leyó como RGB y situó el máximo de calor en p=0 — un
   instrumento que miente en la dirección contraria.
2. **La presencia medida como `max(0, L − L del papel)` valía CERO** en las diez
   paradas: es un modelo de papel oscuro y la suite corre en claro, donde la luz
   tiene MENOS luminosidad que el papel. El bucle de monotonía comparaba ceros y
   pasaba con cualquier curva. Se arregló con la **distancia OKLab completa**, y
   se le puso un guard.
3. **Apagar `--pace-on` no es «apagar la luz»**: ese mando además cierra el
   horizonte del aro, así que la toma de referencia tenía el arco cortado y la
   diferencia incluía el arco — el pico saltaba de 41 a 121 por eso.
4. **`page.clock` congela el fundido de 1,6 s**: capturas de la home con la luz a
   medio encender, y un guard de un aserto lo cazó (halo 0,067). Precisión
   pagada dos veces: la transición **sí avanza en tiempo real** con el reloj
   instalado; lo que no hace es saltar con `fastForward`.
5. **`circles[último]` del dial es el PUNTO, no el arco**, y el mock del arco
   salió idéntico al estado actual.
6. **El arco lleva `transition: stroke-dashoffset 1s`**: capturar a los 200 ms
   fotografía la animación a medio camino y el trazo aparece donde no está.
7. **`spawnSync('npx.cmd')` sin shell no resuelve en Windows** y devolvió cuatro
   «rojos» con `exit=null` que no habían ejecutado un test. Es la trampa de s154
   por la puerta contraria; se invoca el CLI por su entrada de Node.

Y **backticks dentro del template literal de `_responsive.js` abortaron el build
dos veces más** — la misma trampa de s139, s156 y s157.

---

## 9. Verificación

- `npm run verify` **PASA** con v0.90.0 coherente en los tres sitios.
- `npm run test:e2e` **55/55** (44 previas + 11 nuevas, sin una regresión).
  `checklist-foco` solo tarda **22,3 s**: cuando la suite marcó 56 s era
  **contención**, no coste — atribuido antes de tocar nada.
- **Banco de rojos**: 5 asertos puestos en rojo con mutación controlada y
  restauración por hash, **1 control negativo verde** (el guard del centrado es
  load-bearing) y **1 declarado sin rojo** con su razón medida.
  Cuatro de los cinco **nacieron rojos contra el producto real**.
- Navegador real, 5 combinaciones de viewport y paleta, con sesión y pausa:
  **consola limpia**, scroll horizontal 0 y vertical 0 (salvo 320×568, con 8 px
  que son **previos y además mejoran**: HEAD tenía 40).
- **Cambio día↔noche** a 25/50/75 % del bloque en los dos sentidos, por la UI
  real: `--pace-k`, `--pace-i`, `--pace-on`, diámetro y centro del aro
  **idénticos**; ningún fotograma más claro que los dos estados estables.
- `PACE_standalone.html` restaurado byte-idéntico (`998E3E35…`, decisión s134).

---

## 10. Lo que esta sesión NO cubre

- **Reduced motion**: 11 px de scroll a 1280×720 y aro de 420 en vez de 406.
  Deuda conocida de s156, **intacta y sin crecer**. Es el siguiente trabajo
  técnico pequeño.
- **El orden DOM ≠ orden visual en escritorio** (WCAG 2.4.3), deuda de s156.
- **Ni un píxel comparado en la suite**: el reparto halo/cola se juzga mirando.
- El aserto del **alcance de la cola** no se ha conseguido poner rojo, y se
  declara: en escritorio no hay ni una fila que ilumine el bloom en exclusiva.
