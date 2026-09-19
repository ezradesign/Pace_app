# s195 · La barra fea y el final del día (v0.125.1 · v0.125.2 · v0.125.3)

**Fecha:** 2026-09-18/19 · **Versiones publicadas:** v0.125.1, v0.125.2 y v0.125.3 · **Suite:** 260 → 267 → 268 → **277**

> Encargo: el usuario llegó con una captura de `paceweb.pages.dev` a 1920×1080 con el escritorio
> al 125 % (Brave al 100 %, o sea **1536×704** de viewport): «no entiendo la barra fea del medio
> con líneas» y «los elementos se solapan; revisa todos los viewports de desktop». La pieza 3 del
> norte (`semana-r1.html`) sigue enviada y sin decidir: **esta sesión no la toca**.

---

## 0 · Lo que había en la captura, medido

Se reprodujo el guion del usuario en local antes de tocar nada: «Una hora» empezada a las
17:20, bloque 1 y su pausa hechos, y «Empezar bloque 2» a las 19:30 —recolocar con un hueco
de 17:48 a 19:30 y el bloque de ahora pegado al final del día—. Primera trampa: el service
worker servía el artefacto de **antes** de v0.125.0 (la píldora salía como enlace) y el hueco
medía 2 px sin borde; purgado el SW, la misma página dio la caja de la captura. **Medir sobre
un SW caducado mide otra versión** (ya lo decía s139).

Tres defectos, dos de ellos los del usuario:

1. **La «barra fea con líneas» era un choque de nombres de clase.** En s194 la píldora «HOY VOY
   POR LIBRE» se llamó `.pace-rt-libre`; el tramo del retraso ya se llamaba
   `.pace-rt-seg.pace-rt-libre` por su `tipo` (`'pace-rt-seg pace-rt-' + it.tipo`). El hueco
   heredaba `border: 1px solid var(--focus-cta)`, `padding: 4px 10px` y el radio de píldora:
   medido, **10 px de alto, borde 1 px, padding 4 px**, con el rayado de 2/3 px dentro. Nadie lo
   vio en s194 porque la píldora se aplicó **después** de fotografiar recolocar, y la suite no
   miraba la caja del hueco.
2. **«AHORA» pisaba «50 MIN DE FOCO · 1 PAUSA · 2 VASOS · Cambiar».** El resumen era un absoluto
   a 21 px sobre la línea, anclado a la derecha; la etiqueta se ancla al bloque de ahora, en la
   misma banda. Chocaban en cuanto el bloque actual caía en el último cuarto del día — **en los
   nueve viewports de escritorio medidos**, no por el 125 %. Es de s192/s193: cada tarde.
3. **Uno que no se ve pero se arrastra.** Con el bloque corriendo, la home admitía **46–52 px de
   scroll a 1600×780 y 1440×789** (y 6 en 1536×704 tras arreglar lo anterior, porque el aro
   creció 5 px). La barra está oculta (s123), pero la rueda mueve la home entera. Culpable: la
   caja del bloom de la luz acababa en cy + 0,831 D bajo la premisa de s185 («0,852 D de hueco en
   el peor escritorio»), y **esa premisa se rompió en s192** sin que nadie midiera la caja de la
   luz: con el panel de «A tu ritmo» en su estado más bajo (una hora, sin la frase de la primera
   vez, 151 px) el hueco es de **0,729 D**. Nada de eso era luz: `colaBloom` la apaga en 0,72 D −
   horizonte y el resto de la caja llevaba transparencia.

Lo que **no** era un defecto: el aro que se hunde tras el panel y el rótulo «A TU RITMO ·
HASTA LAS …» a 10 px del canto es el modelo «atardecer» de s123/s184, igual en los nueve.

## 1 · Los arreglos

- **La píldora se llama `.pace-rt-porlibre`.** Los nombres `pace-rt-<tipo>` de los tramos (`foco`
  · `comida` · `libre`) quedan **reservados**: fila nueva en `DECISIONES_TECNICAS_VIGENTES.md`.
- **El resumen vive en la cabecera** (`RitmoSobre`, `data-pace-ritmo-resumen`), y la línea ya no
  lleva nada encima salvo «AHORA». **Dos formas por el ancho del PANEL** (container query, porque
  el panel cambia también al plegar la barra lateral): con ≥ 1000 px de contenido va **en la fila
  del título**, a la izquierda de los chips —el panel no crece ni un píxel, y a 1536×704 baja 4
  (la línea pasa de 22 a 18 de margen)—; por debajo, **dos filas a la derecha**, chips arriba y
  resumen debajo (+19 px). Medido en es: resumen 246 + 14 + chips 327 = 587; el título de «Una
  hora» llegando tarde mide 451 y el de la jornada entera unos 400. Descartada la variante
  «mover el resumen cuando choque» (un texto que salta de sitio) y la de esconder «AHORA» en el
  bloque (la parada abierta del final chocaría igual).
- **La caja del bloom se describe desde el centro del aro** (`BLOOM_CENTRO` 0,509 ·
  `BLOOM_COLA` 0,75) y **resta el horizonte en px**: acaba 0,03 D por debajo de donde la máscara
  apaga la luz. Todo lo que colgaba del borde superior (`direccion`, `colaBloom`, el centro de la
  radial, que ya no se escribe en % de la caja) sigue en su sitio. **Comparado al píxel** en la
  misma página con la caja vieja inyectada por encima: 1536×704, 1600×780, 1280×879 y 412×844,
  con menú y por libre —diferencias ≤ 4 niveles por el grano del ruido, y las únicas > 8 son el
  arco y la bola, que avanzan entre las dos fotos—. El scroll vuelve a 0 en los nueve viewports.

## 2 · Los nueve viewports, antes y después

| Viewport | Antes (bloque corriendo) | Después |
|---|---|---|
| 1920×950 | choque «AHORA» × resumen | limpio · D 520 |
| **1536×704** (el del usuario) | choque · hueco de 10 px | limpio · D 417 → **422** · panel 151 → 147 |
| 1600×780 | choque · **scroll 46** | limpio · scroll 0 |
| 1440×789 | choque · **scroll 22** | limpio · scroll 0 · va en fila: por la tarde el título se parte en dos (+17), por la mañana el panel baja 4 y el aro sube 407 → 412 |
| 1366×657 | choque | limpio · dos filas (+17 / +18 por la mañana) |
| 1280×879 | choque | limpio · dos filas (+17 / +18 por la mañana) |
| 1280×600 | choque | limpio (la mañana con 9 paradas pide 33 px de scroll: 205 de aro y tres niveles de etiquetas, el «scroll de seguridad» de `D_FLOOR`; antes eran 16) |
| 1024×650 | choque · título en 2 líneas | limpio · título en 2 líneas |
| 2560×1300 | choque | limpio |

Censo: `viewports-s195.js` (temp del sistema, no se commitea), tres escenas por viewport.

## 3 · La red

- **`tests/ritmo-linea.spec.js`, 7 tests** (spec hermano: `ritmo.spec.js` está en 465): la caja
  del hueco (2 px, sin borde ni padding, con la píldora como GUARD de que sigue teniendo la
  suya) · nada se pisa y la home no arrastra al final del día en **1536×704 · 1600×780 · 1440×789
  · 1280×879**, por PARES sobre todo lo que lleva texto en el panel, con dos GUARD (el resumen se
  ha medido; «AHORA» está en el último tercio) · el resumen en la fila del título a 1536 y bajo
  los chips a 1280.
- **Pasada de control contra el `index.html` de HEAD**: 5 de 7 en rojo con los mensajes
  correctos. La primera versión dejaba en verde el choque a 1536 y 1280: buscaba el resumen por
  el `data-` nuevo, que en HEAD no existe, y **una medida que no encuentra lo que mide no
  mide**. Se buscó por clase y se añadió el GUARD de nombres; entonces sí: rojo por «piezas que se
  pisan».
- `verify` cazó el trinquete de §1: `_responsive.atmosfera.js` a 510 y `_responsive.js` a 501 por
  mis comentarios. Recortados: 500 y 499.

## 4 · Lo que se declara sin cubrir

- El modo oscuro del hueco punteado y del resumen (pendiente desde s194).
- 1280×600 sigue pidiendo scroll por la mañana (`D_FLOOR`): es el viewport extremo declarado.
- Los viewports con la barra lateral plegada se cubren por la container query, no por un test.
- El resumen en inglés en la fila del título: no se ha medido su ancho.

## 4b · v0.125.2 · las etiquetas se recolocan cuando llegan las fuentes

Salió haciendo las fotos de la página «por dónde seguir»: las variantes B y C daban aro 308 y panel
242 donde la A daba 325 y 227, con la misma pantalla. No era la variante: **las etiquetas de la
línea se colocan con la fuente que hay en ese momento y no se recolocaban al llegar Cormorant**
(la larga «Diafragmática + Cadena posterior de pie» mide 132×68 con la de reserva y 121×53 con la
de verdad). El observador de `RitmoLinea` mira la línea, cuya caja no cambia con la fuente. Medido
un lunes a 1536×704: **tres niveles (zona 122) donde el estado asentado tiene dos (107)**, o sea
15 px de panel y 17 de aro de menos, cada mañana en cuanto la fuente llegue después del primer
render (en un contexto frío un re-render hacia los 1,4 s lo tapaba por casualidad; en uno caliente
no). El arreglo es el de la barra lateral en s181: `document.fonts.ready.then(colocar)`, con guarda
de desmontaje.

**El test tuvo que aprender del re-render de los 1,4 s**: con las fuentes retrasadas 900 ms por
`page.route`, la pasada de control contra HEAD salió VERDE, porque ese re-render recolocaba antes
de medir. Retrasadas 2,5 s (detrás del re-render) y midiendo tras `fonts.ready`: rojo en HEAD
(«siguen colocadas con la fuente de reserva, zona 122»), verde con el arreglo. Suite 267 → **268**.

## 4c · v0.125.3 · la auditoría de viewports y lo que el usuario vio un sábado

El usuario pidió «comprueba los viewports de desktop y teléfono, audita todo», y trajo cuatro
capturas más de uso real. `scripts/audit/auditoria-viewports-s195.js`: **16 viewports** (10 de
escritorio, del 2560×1300 a la tableta vertical de 820×1100; 6 de teléfono, del 360×730 al
768×1024) × **9-10 escenas** (pregunta · mañana · pausa abierta · tarde recolocada · el sábado del
usuario · por libre · jornada cerrada · oscuro · inglés · la hoja en móvil), midiendo errores de
consola, scroll real por arrastre, piezas con texto que se pisan, texto recortado, lo que se sale
del panel y lo que asoma por el borde. **150 celdas, y una foto por celda para la mirada humana.**

Lo que salió, y su arreglo:

1. **«Una hora» a las 14:30 decía «comida a las 16:00 durante 30 min»** (captura). La regla ya sabía
   que no servía comida (`m.comida` null); la frase no lo escuchaba. Plantillas «.sin» en los dos
   idiomas (`ritmo.frase.menu.sin` · `ritmo.frase.movil.sin`), +2 claves en el censo del verify.
2. **«Dos horas · de 14:30 a 12:50»** (captura): con el inicio habitual a las 14:30 y el día empezado
   a las 10:23 («llegar antes es empezar»), la frase mezclaba el selector del horario con la hora
   de hoy. Las opciones que empiezan cuando empiezas (una hora · dos horas · media jornada) llevan
   ahora las horas de HOY en texto; la jornada entera conserva selectores y su «hoy de».
3. **«Cadena posterior de pie» se salía del marco** (captura): la primera parada de un día recolocado
   cae junto al borde y su etiqueta, centrada, asomaba 37 px fuera del panel. `ritmoColocarEtiquetas`
   mide cuánto sobresale de la línea (16 px de aire) y empuja con `margin-left`; el hilo se
   desplaza lo contrario (`--rt-hilo`) para seguir apuntando a su parada.
4. **Tableta vertical (820×1100, piel de escritorio con barra de 280)**: al panel le quedan 460 px, la
   línea con nueve paradas no cabía ni en tres niveles y el título se partía palabra a palabra.
   `[data-pace-ritmo-panel]` es contenedor y por debajo de 620 px manda la copia compacta (la de
   móvil), que está hecha para 360-430. Lo que **no** se toca: la composición de la piel de
   escritorio a ese ancho (aro de 227 flotando en 1100 de alto) — es la pregunta de si una tableta
   vertical debería llevar la piel de móvil, y eso es un breakpoint, no un arreglo.
5. **Por libre, «Hidrátate» asomaba por la derecha a 1024 y a 820**: los cuatro chips miden 756 en
   fila. Container query sobre `[data-pace-activitybar]`: hasta 760 de contenido, chips compactos;
   hasta 560, la rejilla 2×2. Estilos en línea, así que `!important`.
6. **Con la jornada cerrada la home arrastraba 38 px a 1536×704** (8 a 1600×780, 15 a 1366×657, 11 a
   1280×600): el aro crece a 510 con un panel de 73 px y la caja del LIMBO (cuadrada, 1,32 D, y
   tiene que ser cuadrada o el halo sale elipse) sobresale. No se recorta (`clip-path` no quita
   desbordamiento desplazable; `overflow: clip` cortaría el halo en el aro, medido): **el motor de
   geometría mide ahora también la luz** —el `scrollHeight` del `[data-pace-timer-wrap]` la
   envuelve y responde a D en la misma tarea— y toma el mayor de los dos desbordes. El aro cede
   lo justo (510 → 483 a 1536×704 con la jornada cerrada). Y tras publicar el sobrante, que en
   móvil baja el stack un 38 %, se vuelve a medir y se cede sobrante si la luz asoma.
7. **La gota del vaso caía sola en la línea de abajo** en móvil («Para cerrar la jornada 💧» a 360):
   un inline-grid es un átomo para el partido de líneas y salta aunque no haya espacio delante; el
   word joiner no lo evita en Chromium (medido). `RitmoMetaGota`: la última palabra y la gota en un
   `nowrap`.

Lo que se vio y **no** se tocó (para la página de ideas o para el usuario): la etiqueta «BLOQUE 1
DE 9» rozando el trazo del aro a 375×667 por la mañana (D 306, el interior con sus fijos); la
tableta vertical con la piel de escritorio.

**Red:** `tests/ritmo-panel.spec.js`, **9 tests**, todos calibrados en rojo contra el artefacto de
HEAD (el de la etiqueta tuvo que endurecerse: con un bloque de 4 min la etiqueta quedaba 9 px
dentro del borde y salía verde; con uno de 2, como el del usuario, rojo). Suite **268 → 277**.

## 5 · Trampas de la sesión

- **Un SW caducado en el preview mide otra versión**: purgar (`unregister` + `caches.delete`) antes
  de medir; el aviso «Hay una versión nueva» es la pista.
- **`scrollHeight − clientHeight` no dice QUÉ desborda** si lo que desborda es un pseudo-elemento
  (no sale en `querySelectorAll`): se encontró siguiendo la cadena de `scrollHeight` de padre a
  hijo hasta `[data-pace-sun]`.
- **Un comentario CSS con backticks rompe el build** (trampa de s172b, repetida).
- Los cambios de diferencia al píxel llevan siempre el arco, la bola y el relleno de la línea,
  que avanzan entre fotos: se excluyen o se leen aparte.
- **El servidor del 8765 desaparece a mitad** (otra vez): `preview_start` lo relanza.
- **Un contexto frío de Chromium re-renderiza la home hacia los 1,4 s**; un control contra HEAD
  que mida después de eso puede salir verde por casualidad. Las fuentes retrasadas van DETRÁS.
- **Un test de geometría que sale verde en HEAD no vigila nada**: el escenario tiene que ser el
  del usuario (2 min, no 4) y el marco el de la regla (la línea + 16), no el borde del panel.
- **Esperar `document.fonts.ready` desde fuera (Playwright) no es lo mismo que la app**: en las
  fotos dejaba la colocación de reserva; se espera reloj de pared y se comprueba la zona.
