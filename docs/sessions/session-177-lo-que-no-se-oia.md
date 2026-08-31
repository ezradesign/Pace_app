# Sesión 177 · Lo que no se oía

> **v0.107.0** · `npm run verify` PASA · `npm run test:e2e` **150/150**
> (146 + 4 asertos nuevos) · **6 mutantes calibrados, 6 muerden** ·
> standalone intacto en v0.71.0.

---

## Lo que se hizo, y de dónde salió

Nada de esta sesión estaba en el plan. Los cuatro bloques salieron de lo que el
usuario vio y oyó al probar, que va por **cuatro sesiones seguidas**
reproduciendo.

| bloque | de dónde salió |
|---|---|
| Los prompts de música | «quiero diseñar la música, ¿me das los prompts?» |
| El runner congelado | «la barra de progreso se superpone con las letras» + dos capturas |
| El calendario de Stats | «podía ajustarse más al tamaño de la ventana» + captura |
| La música de fondo | «no escucho la música, ¿dónde está?» — cinco veces |

---

## 1 · Los prompts de música, y las cuatro cifras que estaban mal

Se reescribió [`MUSICA_RESPIRA_BRIEFS.md`](../product/MUSICA_RESPIRA_BRIEFS.md)
con los seis prompts listos para pegar. Al medir lo que había detrás,
**cuatro números del documento no cuadraban**:

- **El drone está en G2 = 96,22 Hz, no en 96,7.** Sale de `note('G2')` con
  `BASE_A = 432`; el LFO modula ganancia, no frecuencia, así que nada lo
  desafina. El 96,7 vivía en un comentario de `Sound.jsx` **desde antes de
  v0.51.0** y de ahí se copió al documento. Corregido en los dos sitios.
- **El choque de afinación es de UNA rutina, no de todas.** «Qué suena detrás»
  es una elección excluyente (s176), así que con música el drone está apagado —
  salvo en `Coherente 432`, que lo **fuerza**. A 440 el batido serían **1,78
  pulsaciones por segundo**.
- **«Bucle de 4 minutos» y «≤ 2 MB» no caben a 96 kbps**: 240 s × 96 kbps =
  2,75 MB. Pasa a 4:00 a 64 kbps mono = **1,83 MB**.
- **Son SEIS archivos y no cuatro, y el ciclo de Balance es de 12 s y no de
  10**: dos de sus tres rutinas respiran a 12.

---

## 2 · El runner: la pantalla se congela

### Lo medido antes de tocar nada, a 1536×714

Censadas **las 28 rutinas de Mueve y Estira paso a paso**
([`censo-runner-solape.js`](../../scripts/audit/censo-runner-solape.js)):

- el «Cuídate» se metía **15,0 px DENTRO de la barra** en **11 de 47 pasos** y
  en **7 de las 16 rutinas libres**;
- entre «colócate» y «ejercicio» se movían el nombre y la descripción **26,4 px**
  (el rótulo de fase vacío, que a esa altura no se reservaba), el número **51,2**
  y su etiqueta **4,6** — y además el número cambiaba de **56 a 104 px**.

**La causa del solape fue un arreglo.** s176 ancló la barra dándole al bloque
`flex: 1 1 auto; min-height: 0`, y eso le permite **encoger por debajo de su
contenido**: el bloque encoge, el texto no, y el texto pinta encima.

### «Subir el número» no se podía hacer moviéndolo

El hueco de arriba eran **10,0 px** y el de abajo **−15,0**. No había holgura
que repartir: **faltaba sitio**. Y arreglar el salto lo empeora, porque reservar
el rótulo cuesta **26,4 px** — sólo con eso el solape pasaba de 15,0 a **41,3**.

### La decisión, tomada mirando

Se pintaron **tres tamaños de número** sobre la app real (96, 76 y 56) y el
usuario eligió **76**, que no es ninguno de los dos de hoy. Eso **anula la
decisión de s112** («el número del gate no es el timer — más pequeño y en tinta
secundaria»). El **color no se unifica**: el gate sigue en tinta secundaria, y
cambiar de color no desplaza nada.

### Resultado

Las **siete piezas** —glifo, nombre, descripción, número, etiqueta, cola y
barra— a **0,0 px** de desplazamiento, con las siete cajas midiendo lo mismo en
las dos pantallas. Solape **0 en las 28 rutinas**. Huecos **9,8 / 9,7**.
Verificado a 714, 768, 800, 900, 1040, 690 y 660 px de alto.

**Alcance: `min-height: 641`.** Por debajo NO se aplica, y es una limitación
medida y no un olvido: a 1280×600 sigue solapando **7,0 px** con el número a 58
y **12,7** con 64, porque el glifo tiene que ser constante.

### El glifo se toca en la FUENTE ÚNICA, no en el CSS del runner

`V1_GLYPH_WEB` pasa de 1,3 a **1,118** (204 → 181 px). Va ahí y no en una regla
del runner porque ese número lo consumen **tres** sitios, y el comentario de
`v1GlyphSizeAhora` dice por qué: si uno se desvía, «el círculo de la sesión no
relevaría al de la preparación **sino que saltaría**». Arreglarlo por CSS habría
creado justo el salto que se estaba quitando. Y es un **factor constante, no un
tramo**: la regla de s119 prohíbe reintroducir saltos por tramos en esa curva.

---

## 3 · Stats: el calendario usa el ancho de la ventana

Medido a 1536×714: el modal gastaba **820 px de 1536** (el 53 %) y la rejilla del
año llevaba **celdas de 11×11 px cableadas** en el JSX. Resultado: la pestaña
«Año» dejaba **163,7 px muertos de sus 385** — el **42 % de su caja** — mientras
las otras tres dejaban 0.

Se pintaron **cuatro opciones** y el usuario eligió la que resuelve las dos
cosas: modal a **1240** (el de sus tres hermanas desde s176), celda **19**, hueco
muerto **52,4**, y las vistas que no son el año acotadas a **820 px** y
centradas.

**EL MES NO PUEDE CRECER, Y ESTÁ MEDIDO.** Con celda 48 su vista se va a
**421,4 px**, con 56 a **474,4** y con 64 a **527,4**, contra los 385 de las
demás — o sea vuelve el salto entre pestañas que s176 quitó a petición del
propio usuario. **Los 42 px de hoy ya son su techo**, que es exactamente lo que
s176 encontró al compactarlo de 48 a 42.

**El centrado se acota al año**: puesto en todas las vistas metía **4,9 px** en
«Semana» (389,9 contra 385), porque una columna flexible no colapsa los márgenes
de sus hijos. **El aserto de s176 tiene 2 px de tolerancia y lo habría cazado** —
la red funcionó.

---

## 4 · La música: cinco «no se oye» y tres errores míos

Se montó una tercera capa de fondo en Respira
([`Sound.musica.jsx`](../../app/ui/Sound.musica.jsx)), y **el usuario reportó
cinco veces que no la oía**. Los tres fallos, en orden:

### 4.1 · La ganancia se iguala por RMS, no por pico

Primera versión: 0,12, calculada igualando el **pico** de la pieza (−15,89 dBFS)
con el del drone (0,02 = −33,98). **El pico no es el volumen que se oye.** El
drone es una onda pura con 3 dB de factor de cresta; la pieza tiene 14,6.
Medido:

| | pico | RMS |
|---|---|---|
| música | −15,89 dBFS | **−30,53** |
| `sulafat-inhala` | −12,26 | **−28,07** |
| `sulafat-exhala` | −8,26 | **−29,95** |
| drone (sine 0,02) | −33,98 | **−36,99** |

Con 0,12 la música quedaba en **−48,9 dBFS, unos 20 dB bajo la voz**: estaba
sonando y era física que no se oyera. Se subió a 0,45.

### 4.2 · El módulo se tragaba el fallo en silencio

Seis `return` mudos y un `catch` vacío sobre la promesa de `play()`, así que «no
se oye nada» no se distinguía de «esta familia no tiene pieza». **Costó tres
vueltas de diagnóstico.** Ahora cada salida deja su motivo en
`paceMusica.ultimo`.

### 4.3 · Y el error de fondo: el criterio de selección estaba invertido

Con 0,45 tampoco se oía. La pieza de Equilibrio tiene el **82,6 % de su energía
por debajo de 200 Hz** (0,5 % entre 500 Hz y 2 kHz, **0 % por encima de 2 kHz**),
o sea justo donde los altavoces de portátil y de monitor no producen nada. Con
ponderación A pierde **12,7 dB** contra los 7,4 de la otra. **No sonaba baja: no
salía.**

Y la recomendé **por ser «la que deja el hueco de voz más limpio»** — 15,59 % en
200 Hz–3 kHz y 0,02 % en la banda de consonantes. Estaba puntuando como mejor
exactamente la medida que la hacía inaudible. **El brief pedía a la vez «rango
medio despejado» y registro grave, y entre las dos cosas no queda banda que un
altavoz normal reproduzca.**

> **AL REESCRIBIR LOS SEIS BRIEFS hay que añadir el requisito que faltaba: el
> grueso de la energía entre 200 Hz y 2 kHz.**

### Lo que queda montado

Una sola pieza (`energia.mp3`, handpan, ganancia **0,09**) en **las seis
familias**, en bucle, **provisional a propósito**: el objetivo es ver el conjunto
con música, no afinar el reparto. Nunca suena con el drone, y la exclusión se
defiende dos veces — en la interfaz y en el módulo, porque `Coherente 432` fuerza
su drone y se la saltaría por el otro lado.

**Precio medido y audible:** el archivo sale con un fundido de **−36,6 dB** en su
último segundo, así que en bucle hay un bajón de ~1 s cada 2:09.

---

## Las trampas que costaron esta sesión

- **LA SEMILLA ES `firstSeen`, NO `onboarded`.** Sembré una clave que no existe.
  La app se monta **por debajo** del overlay de bienvenida, así que todos los
  selectores encontraban el runner y las medidas salían **correctas** — mientras
  la cámara fotografiaba la pantalla de bienvenida. **Veintidós capturas del
  onboarding con una tabla de números buena al lado, y las mandé sin abrirlas.**
  `tests/helpers.js` lo llevaba escrito con el aviso delante. Los bancos llevan
  ahora un **guard de cámara**.
- **`getBoundingClientRect()` devuelve la caja YA TRANSFORMADA.** El número del
  runner lleva `pace-rep-pulse`, que anima `scale` (s113): la misma cifra de
  76 px medía **72,2** en una pantalla y **65,0** en la otra, y la tabla lo
  presentaba como un salto de layout que no existía. Se congela la animación
  para medir.
- **UNA TABLA QUE NO MIDE UNA PIEZA DICE «NO SE MUEVE» IGUAL QUE SI NO SE
  MOVIERA.** El banco comparaba cuatro piezas, daba «salto 0» y el usuario
  seguía viendo moverse el número — que no estaba en la tabla. La cuenta atrás
  del gate **no tiene atributo de datos** y había que buscarla por posición.
- **UN MUTANTE QUE NO MUERDE CORRIGE EL ASERTO, NO AL REVÉS.** Tres versiones
  del test salían verdes al quitar la reserva de la descripción, porque en
  «Hombros · círculos» el texto ocupa lo mismo en las dos pantallas. Se cambió a
  «Flexiones de escritorio», donde son 3 líneas contra 2.
- **`git checkout` RESTAURA AL ÚLTIMO COMMIT** y me borró la implementación
  entera del CSS del runner. Recuperada de una copia hecha un minuto antes. La
  trampa ya estaba anotada de sesiones anteriores.
- **BACKTICKS DENTRO DEL TEMPLATE LITERAL**, dos veces, en dos archivos
  distintos — y `MoveSessionV1.css.jsx` lo avisa **en su propia cabecera**, con
  la lista de las siete sesiones anteriores que lo pagaron. La segunda la cazó
  el checker de ámbito de s150.
- **MANDAR EL BUILD A `/dev/null`** hizo que un censo entero corriera contra un
  artefacto roto. La cabecera de ese mismo archivo lo avisa: «si la salida está
  silenciada las medidas siguientes corren contra un artefacto viejo».
- **RESERVAR DE MÁS CUESTA IGUAL QUE NO RESERVAR.** Dar 41 px a los tres bloques
  de cola convirtió el solape de 15,0 en **27,0** en las pantallas de cambio de
  lado, que pintan **dos**.
- **EL ORDEN DE LAS REGLAS**, otra vez: el bloque de márgenes iba después del
  que congela y traía `[data-pace-v1-care] { margin-top: 6px }`; a igual
  especificidad gana la última, así que la cola se movía **8,0 px** exactos.

---

## Herramientas nuevas

En `scripts/audit/`; sólo leen o generan HTML, y su salida está gitignorada.

| script | qué da |
|---|---|
| `banco-musica-s177.js` | Decodifica cada MP3 y lo mide contra el brief: banda de voz, ataques, planitud, afinación, bucle, ciclo y a qué ganancia ponerlo. **Las locuciones entran en la tabla** para que el margen se calcule en vez de suponerse |
| `censo-runner-solape.js` | Recorre las 28 rutinas paso a paso midiendo solape y salto. **Mide los HIJOS y no el bloque**: con `min-height: 0` el bloque informa de su alto ya encogido |
| `banco-runner-s177.js` | El presupuesto de altura pieza a pieza, con variantes inyectadas sobre la app real y la tabla de **alturas de caja**, que dice *por qué* algo se mueve |
| `banco-stats-s177.js` + `maqueta-s177-stats.js` | Lo mismo para el calendario, midiendo el **hueco muerto** y el scroll en las cuatro pestañas |
| `maqueta-s177-runner.js` | La comparación mirable del runner en un archivo autónomo |
| `prueba-musica-s177.js` | **Página de escucha en otro puerto**, sin service worker ni app, con medidor de nivel. Nació porque la medida y el oído no coincidían y había que **quitar variables, no medir más** |

---

## Abierto

- **Las dos preguntas de s176 siguen sin abrir**: el aside de familia en Respira
  y el tercer chip «Discreta».
- **El lote de música, sin decidir.** Cinco de las seis piezas siguen sin usarse
  y los briefs necesitan el requisito de banda antes de regenerar nada.
- **`sw.js:338` hace `cache.put` de cualquier petición** y la Cache API rechaza
  `HEAD`: cualquier petición HEAD que pase por el service worker lanza una
  excepción no capturada. Guard de una línea, sin tocar.
- **Por debajo de 641 px de alto el runner no está congelado**, y móvil tampoco.
- En las pantallas de **cambio de lado** la línea «El lado siguiente empieza
  solo» todavía se mueve **99,7 px** entre pasos.
- **`library-transition.js` sigue inerte** (130 líneas).
