# s197 · La media jornada es un horario, y lo hecho se cuenta (v0.129.0)

**Fecha:** 2026-09-22 · **Versión publicada:** v0.129.0 · **Suite:** 286 → **296**

> Sigue al handoff de s196 ([session-196](./session-196-handoff-decisiones.md)), donde quedó escrito todo lo
> decidido con cinco páginas de propuestas delante. s197 lo implementa. Dos preguntas se cerraron el mismo
> día con una sexta página (`arranque-s197.html`) y dos correcciones del usuario que cambiaron el encargo.

---

## 1 · Lo que el usuario corrigió al ver la página

**«La B no sé, ya que tienen que poder personalizarse por el usuario, tanto la media jornada como la
completa».** La pregunta era si el chip enseña el tramo o solo la hora de fin; la respuesta fue otra cosa —un
requisito—. Se leyó así: si las horas son tuyas, el chip debe enseñarlas. Va el tramo, con **tus** horas:
«De 9:00 a 13:00» y «De 9:00 a 17:00»; «Una hora» y «Dos horas» siguen con «Hasta las…» porque son un rato
desde que pulsas, no un tramo.

**«C no entiendo eso».** La pregunta del paquete (¿en cuántas versiones?) no se entendía porque «versión» es
jerga de este repo. Se explicó en una tabla —qué tendrías y cuándo— y se tomó la recomendación. Lección
repetida de s196: lo que no se entiende no se arregla con más fotos, sino nombrando lo que significa.

**«La media jornada ya no lleva comida, se entiende que cuando se acabe ya se hace la comida — así la comida
solo iría en jornada completa»** y **«la media jornada podría ser de mañana o de tarde, o sea que el horario
es flexible / también la jornada completa es de horario flexible, depende del horario real de cada
usuario»**. Esto cerró la pieza más grande.

## 2 · La media jornada es un horario (no una duración)

Hasta v0.128.1 las tres primeras opciones eran **duraciones desde que pulsas** (`RITMO_FORMAS.media` servía
180 min de foco) y solo «Jornada entera» era un horario. Consecuencias medidas: elegirla a las 10:00 corría
el día entero hasta las 13:30; no se podía decir «hoy trabajo de 15:00 a 19:00»; y nunca comía.

Ahora `media` tiene `foco: Infinity` como la entera, y **sus propias horas**:

- `horario.media = { inicio, salida }`, aparte de las de la completa. Mientras nadie las toque, `ritmoMedia()`
  las **deriva** de tu entrada (cuatro horas): por eso una instalación existente no necesita migración y, si
  mueves la entrada, la media jornada te sigue. En cuanto tocas una de las dos, quedan fijas.
- Se editan **en su cabecera** (dos selectores, ninguno de comida) y en «Ajustar el horario», donde la
  pregunta lleva ahora **dos frases** (variante A1, elegida mirándola: cuesta 22 px de panel en escritorio y
  21 en móvil, medido; meterlas en una sola dejaba seis selectores y un interruptor en la misma línea).
- **La hora de fin manda**: empezar tarde acorta, como en la entera. Y **fuera de su tramo se apaga**
  («Tu jornada ya terminó»), sin caer a «cuatro horas desde ahora».

## 3 · La comida es solo de la jornada entera

`comeA` pasa de `horario.sinComida ? Infinity : horario.comida` a
`(opcion === 'jornada' && !horario.sinComida) ? horario.comida : Infinity`. «Dos horas» de 13:00 a 15:00 ya
no sirve la comida a las 14:00. **Esto rompió un test de s195b** que defendía justo lo contrario («y con la
comida dentro de la ventana, sí la dice»): se reescribió para asertar la regla nueva, con la hora guardada
intacta para la jornada entera. Un test que cae porque una decisión cambió no es un test malo; es el aviso
de que la decisión tenía consecuencias escritas.

## 4 · Lo hecho, contado

La app recordaba hecha/saltada desde s195, pero solo la línea del panel lo enseñaba.

- **La hoja del día** (teléfono) atenuaba **todo** lo pasado al 50 %, hiciera la pausa o la saltara, y «lo
  atenuado lee como no hecho» (s193). Ahora cada parada pasada lleva su estado con la regla de la línea: la
  hecha conserva la tinta y su glifo se rellena al 22 % con borde de 1,5 y dice «hecha · 5 min»; la saltada
  baja al 40 %, puntea, dice «saltada» y pierde la gota del vaso.
- **La tarjeta «Siguiente pausa»** de la barra lateral lleva el recuento en la itálica serif de las losetas:
  **«Llevas seis bloques y cuatro pausas»**. Es lo único que la línea no dice con palabras. Las saltadas no
  se nombran (la línea ya las enseña en gris). El usuario pidió contar «ciclos de concentración»: la palabra
  de la app para eso es **bloque** («Bloque 7 de 9» en el aro). Números en palabras hasta doce
  (`ritmo.numeros` por idioma) y en cifra después; en singular, «Llevas un bloque y una pausa»; **sin un solo
  bloque hecho no aparece** (una tarjeta que dice «llevas cero» no acompaña).
- Se descartó **C3** (los puntos de la línea en miniatura) por **redundante**: repite la línea a 300 px en
  escritorio y la copia compacta en el teléfono. Y **C2** («4 de 7» en la cejilla) por marcador.

## 5 · La red

- **`tests/ritmo-media.spec.js` (6)** y **`tests/ritmo-llevas.spec.js` (4)**, los diez **calibrados en rojo
  contra HEAD** (`git show HEAD:index.html`): el tramo y la tarde, sus horas propias y guardadas, fuera de
  hora, la comida solo en la entera, los chips, la segunda frase; la hoja con estado y pintada, el recuento
  con su tipografía, el singular y el día recién empezado.
- **`scripts/audit/banco-media-s197.js`: 13 de 13 muerden**, con pasada de control. Cada mutante rompe una
  pieza (volver a la duración, usar las horas de la entera, colar la comida, no seguir a la entrada, escribir
  en el horario equivocado, quitar el tramo, quitar la segunda frase, no editar en la cabecera, atenuar todo
  lo pasado, pintar igual hecha y saltada, no contar, contar también las saltadas, contar con cero bloques).
- Tres tests existentes actualizados a la decisión nueva: dos de copy (`ritmo.spec.js`) y el de la comida
  (`ritmo-panel.spec.js`). El censo de i18n sube de 662 a **673**.

## 6 · Lo que se declara sin cubrir

- La **tableta vertical con piel de móvil** (decidida: `(orientation: portrait) and (max-width: 1024px)`)
  va en v0.130.0, con la auditoría de 16 viewports re-medida. El corte vive hoy en 18 archivos.
- Nadie ha usado la app una semana entera todavía: la semana (v0.128.0) sigue sin juicio de uso real.
- El miércoles con tres largas, el modo oscuro del panel y el cierre que nunca es «Ahora» siguen declarados.
- `STATE.md` sigue acumulando bloques de «lo que queda»: la limpieza es de la ruta 5 y no se hizo aquí.
