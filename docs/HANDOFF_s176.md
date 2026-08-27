# Handoff · s175 → s176

> **v0.105.0** commiteado (`447ed5a`), pusheado y con el **CI en verde observado**
> (los dos jobs en `success`, leídos con `gh`, no inferidos).
> `npm run verify` PASA · `npm run test:e2e` **136/136** · standalone intacto en
> v0.71.0.

---

## 0 · LO PRIMERO, y manda sobre todo lo demás

**El usuario cerró s175 diciendo «voy a probar todo primero».** Tres cosas suyas
están entregadas y **nadie las ha mirado ni escuchado**:

1. **La voz de Respira** — suena en 17 de las 20 rutinas. Nadie ha oído los clips.
2. **El rail de la biblioteca** — fijo, aire igual, una sugerencia.
3. **La preparación sin glifo** — sólo el contador, en las tres bibliotecas.

**Preguntar qué tal fue la prueba antes de proponer nada.** Si trae defectos,
tienen prioridad. En s174 y s175 los suyos reprodujeron **todos**.

---

## 1 · Decisiones abiertas, con lo ya medido

### 1.1 · La voz — tres cosas que sólo puede cerrar el usuario

| Qué | Estado | Lo que hace falta |
|---|---|---|
| **¿Interruptor propio en Ajustes?** | Hoy la voz va con `soundOn` | Quien tenía sonido se encuentra una voz y **no puede quitarla sin apagarlo todo**. Es diseño: hay que **pintarlo** antes de preguntar |
| **¿Se queda el «mantén»?** | Implementado | Rompe un silencio que era deliberado. Reversible en **cuatro líneas**, marcado en el código |
| **`bradford`** | Sin medir | Sus cifras eran de cabecera, y eso ya falló dos veces. Se mide **abriendo el archivo**, nunca leyendo su cabecera |

Y una tarea que no es del usuario: **revisar los términos de uso comercial del
audio**, que la FASE 5 exige por escrito si se generó con IA.

### 1.2 · `library-transition.js` está inerte

**130 líneas cargadas que no pueden dispararse**: su único destino era el arte de
la preparación, que s175 quitó. Se dejó a propósito, con un test que vigila que
no deje rastro. **Borrarlo —o darle otro destino a la capitular— es decisión del
usuario.**

### 1.3 · `Rana` tiene candidata válida

De las dos imágenes que mandó, **la segunda vale**: cuadrupedia frontal, que es
la vista decidida. **Dos arreglos antes de ingestarla**:

- **Fondo aplanado sobre blanco** — la transparencia rompe el criterio de
  luminancia de la ingesta.
- **La flecha tiene que decir «cadera atrás»**, no lateral. En vista frontal
  «atrás» es hacia dentro del papel, así que la flecha es lo único que puede
  contarlo.

**La primera no vale**: no es el gesto —está sentado, no a cuatro apoyos— y su
silueta choca con `Sentadilla profunda`, que ya está en el set.

Comando: `node scripts/ingest-glifos-ejercicio.js --seco --origen "<carpeta>" --fusionar`

---

## 2 · Si no trae defectos, el orden que recomienda la auditoría

La auditoría integral está en
[`audit-integral-s175.md`](./audits/audit-integral-s175.md). Su recomendación:

1. **Cerrar las decisiones de voz** (§1.1). Baratas y delante del usuario.
2. **FASE 4 · Stats.** Lo que más devuelve por sesión: **desbloqueada** desde que
   hay emisores (s172), con destino escrito desde s129 en
   `STATS_DESTINO_PROPUESTA.md` y **1.111 líneas** sobre las que construir. El
   ROADMAP la llama «el escaparate del free».
3. **El arte que queda**: `Rana` (la única capitular vacía de las 28) y los **19
   glifos de logro** en seis familias.
4. **FASE 8 · onboarding contextual**, que es la raíz real de «no me guía»: sin
   capturar el contexto, «los filtros y la recomendación no tienen con qué
   filtrar».

**Lo que NO conviene empezar, y por qué:**

- **Travesías** — van **después** de reescribir los Caminos (FASE 6). El ROADMAP:
  «se construyen encima», y el audit llama *playlists* a los 7 actuales.
- **La sidebar** — 636 líneas y **ningún documento**. Es lo único de la lista del
  usuario **sin diagnóstico**: no se puede ordenar lo que no se ha medido. Si le
  molesta algo concreto, eso sí es una sesión.
- **CTB** — está en «Fuera de v1 (explícito)», con su entregable mínimo ya
  definido: guion + pista + mockup, **antes de código**.
- **Capacitor** — FASE 9, **~4–6 sesiones** por estimación del propio usuario, y
  va detrás de Stats, Caminos, Travesías, Descubrimiento y Saneamiento.

---

## 3 · Medido en s175 · no volver a medirlo

- **La pantalla del usuario es 1536 CSS px** (1920×1080 al **125 % de escala**).
  A 1920 sus defectos **no reproducen**. Preguntar la escala antes de dar un
  layout por bueno.
- **Dar aire a la columna EMPEORA el recorte** (22 → 48 px). «Más aire» y «que
  quepa» no caben juntas con dos sugerencias.
- **Una locución se mide por su PALABRA, no por su archivo.** El «exhala» ocupa
  4,96 s y la palabra acaba a los **2,12**. Ni la cabecera MPEG (dio la mitad) ni
  `audio.duration` (incluye los silencios) sirven.
- **Respira: 17 de 20 admiten voz.** Fuera, las tres de bombeo (fases de 1 s).
- **El precache va por 226 filas.**
- **Arte de ejercicio: 62 identidades, 59 con arte.**
- **9 de las 14 de Estira piden suelo** — es contenido, no diseño.

---

## 4 · Trampas que ya se han pagado

- **El build aborta si queda una referencia bajo la carpeta de arte de Respira**
  que no pueda convertir en data URI. Los MP3 viven en `app/breathe/voz/` por eso.
- **Y vuelve a abortar si un COMENTARIO escribe esa ruta**: el guard busca la
  cadena y Babel conserva los comentarios en el artefacto.
- **Toda consulta al DOM de la biblioteca filtra por caja no nula.** Cada pieza se
  pinta dos veces —lateral y móvil— y la hoja apaga la que sobra. Van **siete**
  veces; la séptima fue en un instrumento de medida propio.
- **Un control que no reproduce las condiciones del fallo no es un control.**
  En s175: estrechar el root a mano no recalcula el arte, así que no probaba nada.
- **Un aserto que ningún mutante puede poner rojo es decoración.** s175 retiró uno.

---

## 5 · Herramientas nuevas de s175

En `scripts/audit/`, sólo leen o generan HTML. Su salida está gitignorada.

| Script | Qué da |
|---|---|
| `revision-tanda2.js` | Las **18 piezas de la 2ª tanda a 700 px** con su encargo al lado y la escalera de tamaños reales. **8 de las 18 SUSTITUYEN** a un dibujo anterior |
| `maqueta-s175.js` (+ `.piezas`, `.pagina`) | Las ocho variantes en **iframes de viewport real**, con la tarjeta de producción y el CSS extraído de la hoja real. Cada marco **se mide a sí mismo** |
| `maqueta-s175.movil.js` | El móvil en **ocho resoluciones**, a tamaño real |
| `censo-respira-fases.js` | Si la voz cabe, **rutina a rutina** |

---

## 6 · Deuda declarada

- **`CLAUDE.md` describe Mueve y Estira AL REVÉS.** Dice «Mueve (movilidad silla)
  · Estira (calistenia oficina)» y es al contrario. Además los ids van cruzados:
  **Mueve lleva ids `extra.*` y Estira `move.*`**. Los ids no se pueden tocar
  (borrarían datos); lo que se arregla es la prosa.
- **El `CHANGELOG` tiene CUATRO bloques de detalle** donde la convención son dos.
  Su contenido no se pierde borrándolos —vive en la tabla y en los diarios— pero
  descartar texto es decisión del usuario.
- **Las 18 piezas de la 2ª tanda siguen sin mirarse.**
