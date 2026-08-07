# Sesión 160 — El tirón que no reproducía, y dos deudas que sí

**v0.90.0 → v0.91.0** · 2026-08-07

> Tres frentes en el orden que puso el usuario: el tirón del arco que él mismo
> reportó usándolo, la deuda de reduced-motion de s156 y la deuda de a11y de
> s156. El cuarto (diagnóstico de Respira) **no se abrió** y se dice.
> **La validación visual del Pomodoro sigue pendiente del usuario**: no se ha
> tocado la atmósfera, ni la curva, ni los tokens `--sun-*`, ni la cola, ni la
> pausa, ni el remapeo del arco.

---

## 1 · El tirón del arco: NO REPRODUCE, y las dos hipótesis caen medidas

El usuario reportó que el aro de progreso «da un tick por segundo». El encargo
traía dos hipótesis y la orden de separarlas midiendo:
**(a)** la transición termina antes del siguiente tic y espera (sería PREVIO);
**(b)** algo la interrumpe y la reinicia — sospechoso, las ~197 publicaciones de
custom property por bloque que introdujo s159 (sería REGRESIÓN).

Banco: los dos artefactos servidos del mismo servidor —`/index.html` (v0.90.0) y
el `index.html` de `8bf323b` (v0.89.0)— y **alternados A-B-A-B en la misma
pasada**, porque comparar entre corridas no vale. Se muestrea por rAF el
`stroke-dashoffset` **computado**, el `transform` del punto guía y las
**transiciones vivas** por Web Animations API, que es lo único que distingue
«termina antes» de «la reinician».

| Por segundo de bloque (25 min, 1280×720) | v0.90.0 | v0.89.0 |
|---|---|---|
| frames en los que el trazo se mueve | 57,2 | 59,5 |
| ms **quieto** al final de cada segundo | **0** | **0** |
| `currentTime` máximo de la transición | 983-1000 ms | 983 ms |
| publicaciones de `--pace-*` en 8 s | **2** | 0 |
| fps · frames > 25 ms | 58,6 · 13 | 60,3 · **0** |

**(a) cae**: cero milisegundos de espera en todos los tramos, en los dos
artefactos. **(b) cae por dos sitios**: por **ritmo** —2 publicaciones en 8 s, no
60; el guard `if (valor !== actual)` de `FocusTimer.jsx:421` ya las filtra y el
propio diseño las espacia 7,6 s— y por **control positivo**: forzando una
publicación **en cada frame** (460× el ritmo real) la transición **sigue
corriendo** (duty 73 %, 31 frames por tramo). Lo que sí hace es tirar el fps a
36,6.

**El instrumento sabe ver el defecto**, y eso es lo que hace creíble el «no
reproduce»: con `prefers-reduced-motion: reduce` la medida da **duty 1,4 %, un
frame de movimiento y 983 ms quieto por segundo**, con `transition-duration`
computada en `1e-05s`. Ésa es la firma exacta del síntoma, y la produce
`tokens.css:374` — el kill de s89, que **nombra los anillos de timer** como
decorativos. Es PREVIO. Pero **no es el caso del usuario**: el registro de
Windows dice animaciones activadas, y en su móvil la luz sí se funde.

Se cerró además el hueco entre estilo y píxeles fotografiando el aro cada
~130 ms: **cambian píxeles en todas las tomas** (la cabeza se arrastra de x=206 a
x=209 en 3 s ≈ 0,8 px/s, la velocidad teórica). Lo único que cambia una vez por
segundo son los dígitos.

**Lo que sí es de s159, medido y no periódico**: una ráfaga de 13 frames a 33 ms
entre 1,4 s y 1,8 s tras arrancar (el encendido de `--pace-on`), y 58,6 fps
contra 60,3. Emulando el móvil del usuario con CPU frenada 10×: **42,6 fps
contra 57,4**, y frame p95 de 51 ms contra 25,7. En un teléfono flojo ese hueco
es real, pero produce jank irregular, no un tic limpio por segundo.

### Lo que faltaba: sus condiciones

Con tres preguntas salieron los datos que el banco no podía inventar: lo vio en
**paceweb.pages.dev** (artefacto **byte a byte idéntico** al local,
`216A1D2B3BDE5AD1`), en un **Doogee Blade 20 Max con Brave** (Chromium, mismo
motor medido), con un bloque de **1 minuto** —25× más avance por segundo— y lo
que salta es **el punto brillante**, no el trazo. A 1 minuto y en local sigue
siendo fluido (55-59 frames por segundo, también el punto), y bajo presión de
CPU los dos canales caen **juntos**: a 20×, 18,6 fps y hasta **563 ms parado**,
arco y punto por igual. La asimetría no sale de ahí.

**Queda abierto y en manos del usuario**: se le entregó un banco que corre en su
propio teléfono (artefacto publicado) con cuatro aros —el aro tal cual, sin la
máscara de s158, con el punto por CSS, y un **control sin transición que tiene
que dar tirones**—, cada uno con su veredicto en vivo. Calibrado en las dos
direcciones antes de entregarlo, y la verificación **cazó un fallo del propio
banco**: sin copiar el kill de `tokens.css` daba «fluido» con menos-movimiento
activado, o sea un falso negativo justo en el caso más probable.

---

## 2 · Reduced-motion: la microcausa, encontrada — y era un frame

Deuda de s156: a 1280×720 con `prefers-reduced-motion: reduce` el aro salía a
**420 px** en vez de 406 y la home quedaba con **11 px de scroll**. s156 anotó el
síntoma («el alto del stack se quedaba clavado mientras D bajaba de 420 a 322»)
y dejó la microcausa **sin identificar**.

Barriendo D a mano salió algo más fuerte que lo anotado: **no es el stack el que
no responde, es el ARO**. Sin reduce sigue a `--pace-timer-d` exactamente
(440→440, 380→380); con reduce se queda en 420 con **cualquier** valor. Y
siguiendo la cadena eslabón a eslabón: con reduce **ni un `height: 340px
!important` en línea mueve el aro**. En la cascada de CSS solo una cosa gana a
`!important`: **una transición viva**.

**La microcausa**: el kill de `tokens.css` pone `transition-duration` en 0,01 ms
sobre todo lo que no sea esencial, y como el valor inicial de
`transition-property` es **`all`**, eso convierte **cualquier cambio de
geometría en una transición** — cuyo valor aterriza en un frame POSTERIOR.
`home-geometry.js` aplica D y mide en la **misma tarea**, así que bajo
reduced-motion medía siempre el tamaño anterior: el bucle encogía a ciegas,
disparaba su propio guard de s156 («nunca encoger a ciegas») y salía con el
techo por ancho.

Confirmada con tres predicciones, todas cumplidas:
- `dial.getAnimations()` devuelve **`height:running`** justo tras el cambio;
- el valor solo aterriza **dos frames** después;
- simulando el bucle: síncrono, `over` **clavado en 11** mientras D baja de 420 a
  **322** (los números exactos de s156); esperando un frame, converge en **dos
  pasadas** a 406.

**El arreglo, validado antes de proponerlo**: `transition-property: none` en el
aro. Con eso el bucle síncrono converge a 406 en dos pasadas, y extenderlo a la
ActivityBar o a toda la home **no cambia nada** — el aro era el único nodo cuyo
retraso importaba. Quedaban **3 px** de residuo con dueño: el solapamiento salía
en −61 px en vez de −65, porque `applyD()` no mide solo el aro sino **dónde acaba
el CICLO DENTRO del aro**, y los cuatro nodos interiores llevan márgenes
derivados de D. Se nombran uno a uno (no un selector de descendencia: dentro del
aro vive el CTA y su transición de hover es legítima).

**Resultado**: aro **406** y solapamiento **−65 px** con y sin reduced-motion,
scroll **−1** en los dos. Idéntico. v0.89.0 sigue en 420/−67/11 como control.

**Y una edición mía rompió el aro a mitad de camino**: el `}` que metí dejó el
`height: var(--pace-dial-d)` colgando de los nodos interiores y el aro cayó a
327 px con solapamiento 0. Lo cazó la medida siguiente, no la lectura.

---

## 3 · A11y: el orden de foco de escritorio, medido con Tab de verdad

s156 documentó la deuda y decidió no asertarla. Aquí no se infiere: se recorre
con **Tab real** y se apunta dónde cae el foco en pantalla.

**Escritorio**: el swap lo hacía el CSS — `order` **0 / 2 / 1** para
timer / camino / actividades, así que Actividades se pintaba en `top=464` y la
tarjeta en `top=584`, pero en el DOM iba después. El recorrido lo confirma:
`Empezar foco` (387) → `Iniciar camino` (**622**) → `Ver caminos` (**698**) → y
**sube** a los cuatro chips (**496**). WCAG 2.4.3, previo.
**Móvil**: los tres `order` valen 0, el DOM coincide con lo visual y el recorrido
es monótono (134 → 396 → 498 → 559 → 617 → 677). **No había violación.**

Confirmada la propuesta de s156 —es la única salida real, porque las dos pieles
tienen órdenes visuales genuinamente distintos y lo que sobra es el `order`— y
resuelta con dos cautelas que salieron de mirar el código:

- **La piel se lee de `--pace-skin`, que publica la propia hoja de
  `_responsive.js`**, no de un tercer `matchMedia('(min-width: 769px)')` en
  JavaScript. El breakpoint sigue viviendo en un solo sitio y el orden del DOM no
  puede desincronizarse del visual aunque alguien lo mueva.
- **Las keys no son decoración**: sin ellas React reconcilia por posición y al
  cruzar 769 px **remonta** los dos bloques en vez de moverlos.

El orden VISUAL no cambia ni un píxel: 65 / 464 / 584 antes y después.

---

## 4 · La suite: 55 → 58, y dos flakies que no eran del producto

Al añadir 3 tests la suite se puso en 58 y aparecieron dos rojos **que cambiaban
entre pasadas**. El control lo dejó claro: corriendo **la misma suite** contra el
`index.html` de HEAD, `checklist-foco` **falla igual** — no era la app, era el
presupuesto de tiempo con 8 workers.

- **`checklist-foco`**: `runFor(25 min)` ejecuta **1500 callbacks** del intervalo
  con su re-render cada uno. Pasa a **`fastForward`**, que salta el reloj y
  dispara los timers vencidos una vez — y de paso prueba algo que antes no se
  probaba: que el contador es **timestamp-based** (s96). Si dependiera de contar
  tics, con un salto no terminaría.
- **`el contador no dispara el observador`** y **el test nuevo de
  reduced-motion**: los dos medían antes de que el motor convergiera. Nace
  `asentarGeometria()`, que espera a que `--pace-timer-d` repita valor tres
  frames seguidos. **No se mete dentro de `asentar`** a propósito: lo llaman
  veinte sitios, algunos con `page.clock` instalado, y ahí rAF solo corre cuando
  el reloj avanza.

---

## Verificación

- **`npm run verify` PASA** en 7,6 s, v0.91.0 coherente en los 3 sitios.
- **`npm run test:e2e` PASA 58/58**, dos pasadas seguidas, sobre el `index.html`
  recién regenerado.
- **Banco de rojos: 4 de 4 mordieron**, cada uno con su mensaje propio y no por
  un guard, con el artefacto restaurado byte a byte (`241DD403B5A1B84B`) en los
  cuatro. Las mutaciones: quitar el `transition-property` del aro (→ «el aro mide
  distinto con reduced-motion (420 vs 406)»), devolver el `order` de escritorio y
  meter un `order` en móvil (→ «el foco SUBE en la pantalla»), y romper la
  detección del final del bloque (→ el BreakMenu no abre).
- `index.html` **`241DD403B5A1B84B`**, **0 bytes CR** de 1 434 106.
  `PACE_standalone.html` restaurado **`998E3E358D689036`** (v0.71.0, decisión s134).

## El instrumento mintió cinco veces

1. **La pestaña del navegador embebido está `hidden`** y `requestAnimationFrame`
   no dispara: 0 muestras en 9 s. El `setTimeout` y el `MutationObserver` sí
   corrían, así que parecía que el banco funcionaba.
2. **`[data-pace-dial-ring]` lo creó s158 y no existe en v0.89.0**: la primera
   pasada devolvió «sin arco» justo para la mitad de la comparación.
3. **Headed no arranca en este entorno** (`spawn UNKNOWN`): todo está medido en
   headless y el compositor real no se ha probado. Declarado.
4. **Mi propia sonda leía la variable vacía** en las dos condiciones mientras una
   respondía y la otra no — señal de que no estaba leyendo donde creía, y por eso
   se siguió la cadena eslabón a eslabón en vez de concluir.
5. **El banco del móvil daba «fluido» con reduced-motion activado** porque no
   llevaba el kill de `tokens.css`: un falso negativo en el caso más probable,
   cazado por la verificación antes de entregarlo.

## Lo que NO se cubre

- **El tirón del arco sigue abierto**: no reproduce en banco y falta el dato del
  dispositivo del usuario. Ni un píxel comparado en la suite.
- **El diagnóstico de Respira (punto 4) no se abrió.**
- La suite sigue sin cubrir móvil real, inglés, Caminos ni premium.
- El `asentarGeometria` espera a que **el diámetro** calle, no a que la home
  entera esté quieta.
