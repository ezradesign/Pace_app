# Sesión 165 · el progreso de Respira, decidido mirándolo

**v0.94.0 → v0.95.0** · 2026-08-17 · continúa el diagnóstico de s164, que no tocó
una línea de `app/`.

---

## 0 · De dónde se partía

s164 midió el progreso de una sesión de Respira y dejó un menú de seis decisiones.
El usuario traía cuatro elegidas (**4B** barra continua, **3A** rellenar por
completadas, **5A** quitar el hueco muerto, **6** hooks) y dos abiertas. Al
arrancar, el árbol **no estaba limpio**: tres documentos modificados del tramo
anterior, que registraban «1C, y expresado con **puntos**».

Esa precisión no sobrevivió a la sesión, y conviene decir por qué: **no la tumbó
un argumento, la tumbó una captura**.

---

## 1 · Lo que se implementó primero, y lo que el usuario vio

Se montó 1C con puntos (vocabulario del Pomodoro, `FocusTimer.jsx:170`) y se
fotografió sobre la app real, con el `index.html` de HEAD servido **en paralelo**
para tener el «hoy» al lado. Nueve capturas.

El usuario eligió mirando: **4B sí** («me gusta más solo la barra de progreso para
4.4.4 que tantas minibarras confusa»), **retención tal cual** (sin puntos, con su
cabecera), y para las rondas devolvió… **la captura de HOY**. Es decir, contra 1C.

No se resolvió por deducción: se le dijo que esa captura era la de hoy, con el
hueco de 32 px y la barra de dos segmentos, y **se preguntó**. La respuesta abrió
el trabajo de verdad de esta sesión:

> «revisa bien TODOS los ejercicios de respiración para ver qué sistema es el más
> efectivo, profesional y elegante, puede haber otras alternativas que no estamos
> explorando aún»

---

## 2 · El censo de ritmos · `scripts/audit/censo-respira-ritmos.js`

Se le preguntó a `getSequence()` —la función que usa la sesión— por las 20
rutinas, y se derivó ciclo, número de ciclos, fase más corta y más larga.

**Sirve `PACE.html` y no `index.html`, y se declara**: `BREATHE_ROUTINES` es un
`const` de módulo y en el compilado vive dentro de su IIFE, así que no existe en
`window` (la otra cara de la trampa de s144/s150). Aquí no se mide ni un píxel.

### Tres familias de ritmo, no dos

| Familia | Rutinas | Cómo terminan |
|---|---|---|
| Por bloques | 3 (rondas) | cuando se acaban las rondas · duración **indeterminada** |
| Por tiempo | 15 | por reloj |
| **Bombeo** | **2** (Bhastrika, Kapalabhati) | por reloj, con fases de **1 s** y 90 ciclos en 3 min |

### Tres cosas que el censo corrige de la documentación

1. **El hueco muerto de la cuenta atrás es de 5 rutinas, no de 3.** s164 contó las
   de rondas; las dos de bombeo tienen fases de 1 s y `showCountdown` exige ≥ 4,
   así que también reservan 32 px para un número que no aparece nunca. Corregido
   en el diagnóstico: gana el código.
2. **Una barra de TIEMPO mentiría en las rondas.** No terminan por reloj —la
   retención no tiene duración fijada (B1)—, así que sus 4/12/20 min son
   **nominales**. Este es el argumento duro para que las dos familias no compartan
   forma, y no es estético: es que la app no conoce esa duración.
3. **«Un segmento por ciclo» no era exacto** en las cinco donde los ciclos no caen
   redondos (18,8 · 17,5 · 37,5 · 9,5 · 12,9), y en **10 de las 17** el tope de 24
   ya agrupaba varios ciclos por segmento.

---

## 3 · El listón no era informar

Antes de proponer se fue a verificar una restricción recordada de s139, y estaba
escrita, con su porqué (**§A4**):

> «Descartó marcas y enso … los dos **miden** … en una guía de respiración eso
> invita a mirar la medida en vez de a respirar. Es el mismo criterio por el que
> s107 sacó el cronómetro de la retención.»

Con eso la pregunta deja de ser «cuál informa mejor» y pasa a ser **cuál es el más
periférico que todavía orienta**. De ahí salieron las dos opciones que no estaban
en el menú de s164 —**ningún indicador** y **una línea a sangre en el borde**— y de
ahí que el **aro** entrase también: el usuario pidió expresamente que las
restricciones se le notifiquen y se le propongan, «quizás la restricción varíe
dependiendo del caso».

---

## 4 · El banco de variantes · `scripts/audit/banco-respira-variantes.js`

18 capturas, tres especímenes (Box, Rondas express, Rondas profundas con premium
sembrado), **sobre la app real**: la sesión se conduce de verdad y solo se
sustituye el indicador, por CSS o reescribiendo ese nodo. **Ninguna maqueta** — una
hoja con los valores copiados a mano es exactamente la evidencia que en s149 no
reprodujo. Y **ni una bandera queda en producción**: las variantes se apagan
apuntando a los hooks que la decisión 6 acababa de crear.

Resultado en `_revision-respira-progreso.html` (ignorado por git), generado por
`scripts/audit/revision-respira-progreso.js`, con el censo, los hallazgos, la cita
de s139 y las 18 opciones.

### El banco mintió cuatro veces, y las cuatro habrían decidido por su cuenta

1. **El loto seguía moviéndose entre disparo y disparo.** El reloj de la sesión es
   virtual pero las transiciones CSS corren en tiempo real, así que las dos
   variantes de la cabecera salieron con el loto de distinto tamaño **y la única
   diferencia real era una línea de texto**. Congelado con
   `animations:'disabled'`, y comprobado midiendo: **1090 píxeles de 4 096 000**,
   caja `x 2156-2318 · y 93-114` — el «RONDA 1 / 2» y nada más.
2. **Un `;` suelto entre dos reglas** invalidaba la siguiente: la variante del aro
   salió con los puntos todavía pintados.
3. **La barra segmentada se pintó dentro de la fila del texto** y partió
   «RESPIRACIÓN 9 DE 35» en dos líneas. Esa opción habría perdido por un defecto
   del banco.
4. **El radio del aro se dedujo del `inset: 14%` de la hoja** en vez de medirse:
   dio 147 px donde la línea real está a 126, y el arco salió flotando por fuera.
   Se arregla **midiendo el hairline ya pintado**. «Deducir en vez de medir»,
   dentro del propio instrumento.

Y una quinta que no es del instrumento sino del **estado elegido**: las rondas se
fotografiaban en la **ronda 1**, donde no hay ningún bloque completado. La mitad de
las variantes salía vacía y el aro dibujaba literalmente cero. Se repitió todo en
la **ronda 2**, cruzando la retención con su botón.

---

## 5 · Lo que quedó decidido

| # | Decisión | Cómo |
|---|---|---|
| **4B** | Barra **continua** en las 17 por tiempo | una sola pieza; relleno = tiempo activo / objetivo (s98) |
| **R3** | Barra **segmentada por rondas** en las 3 de bloques | un segmento por ronda; el **en curso con carril**, los pasados llenos, los pendientes finos (vocabulario de `MoveSessionV1.jsx:482`) |
| **3A** | Sin desfase | el segmento se llena cuando la ronda **termina**, que incluye su retención |
| **5A** | El hueco se reserva **por rutina** | `anyLongPhase`: solo si alguna fase llega a 4 s. La razón de s138 sigue viva donde aplica |
| **6** | Cinco hooks `data-pace-breathe-*` | `-phase`, `-countdown`, `-breath`, `-round`, `-progress` (+ `-rounds`) |
| — | La ronda se dice **una vez por pantalla** | fuera de la cabecera en la activa (la cuenta la barra); **se queda en la retención**, que no lleva barra |
| — | Retención | **sin cambios** (2B, elección del usuario) |

Las dos barras comparten sitio, ancho (260 px) y **altura (5 px)**: se igualó a
propósito, porque la maqueta de R3 usaba los 6 px de Mueve y en el mismo hueco se
notaba el escalón entre familias.

**Decisión aplazada por el usuario a la sesión siguiente**: medir y guardar el
tiempo de retención — total acumulado, invisible durante la práctica, **sin récord
y sin logro**. Dato que cambió cómo se planteó: la apnea **ya se acredita** hoy
(`activeMsRef` suma `'hold'`), así que no es «empezar a contarla», es sacarla a un
número propio.

---

## 6 · La red · `tests/respira-progreso.spec.js`

Cinco asertos, y **los cinco se pusieron rojos a propósito** contra un producto
saboteado (banco de mutaciones, artefacto restaurado y reconstruido al final):

| Mutación | Test que muerde |
|---|---|
| Devolver el relleno por respiraciones (D1) | «la barra no va una respiración por delante» |
| Reservar el hueco siempre | «el hueco se reserva por RUTINA» |
| Devolver «RONDA n/N» a la cabecera activa | «la ronda se dice UNA vez por pantalla» |
| Barra continua también en rondas | «cada familia dibuja lo suyo» |
| Congelar el progreso por tiempo | «por tiempo la barra empieza en cero» |

Están escritos como **contratos**, no como fotos del DOM: el número de segmentos no
se escribe a mano, se lee de `data-pace-breathe-rounds` y se exige que coincida con
los hijos, así que el aserto no caduca si mañana Rondas express tiene tres.

### Dos defectos propios en los asertos

- El de D1 apuntaba al **segundo 96** calculado a mano y allí la sesión ya estaba
  en la retención. Reescrito para recorrer la ronda **entera** exigiendo cero en
  todas las muestras, con **guard de cero** (haber visto la respiración 1 y la 25 y
  haber llegado a la retención). El aserto quedó más fuerte que el original.
- El banco de mutaciones dio **«0 failed / 0 passed» en las cuatro** y eso no era
  «no muerden»: `spawnSync('npx.cmd', …)` da **EINVAL en Node 24** y no corrió ni
  un test. Se invoca el CLI por su `.js` y se añadió un **guard de cero** que
  distingue «no muerde» de «no corrió». Sin él, esta sesión habría anotado cuatro
  asertos inútiles como verificados.

---

## 7 · Verificación

- `npm run verify` **PASA** · v0.95.0 coherente en los 7 sitios.
- `npm run test:e2e` sobre el artefacto regenerado: **72 tests** (67 + los 5
  nuevos). El código de salida se leyó de un archivo, nunca por `| tail`.
- Consola **limpia** en las seis pasadas del banco de variantes.
- `PACE_standalone.html` **restaurado byte a byte**: los builds del banco de
  mutaciones lo reescriben, que es la torpeza de s162 repetida y cazada aquí.

---

## 8 · Lo que NO se cubre, declarado

- **Móvil sin medir.** Todo a 1280×800. La barra tiene `maxWidth: 260`, así que en
  móvil el caso de 5 rondas aprieta más — sospecha razonable, sin medir.
- **Inglés sin mirar**, y paleta oscura tampoco.
- **Las dos rutinas de bombeo no se fotografiaron.** El censo las identificó como
  familia propia, pero las capturas usaron Box como espécimen por tiempo.
- **Nada aserta el aspecto**: los cinco tests nuevos miran atributos, no píxeles.
- El **tiempo de retención** queda sin implementar, aplazado a propósito.
- La hoja de revisión es un **archivo local** (`_revision-*.html`, ignorado): si se
  quiere conservar la comparación hay que decidirlo aparte.
