# Sesión 147 — El tramado del papel, el aviso que faltaba, y el sello que flotaba

**Fecha:** 2026-08-03 · **Versión:** v0.79.1 → **v0.80.0**
**Tipo:** revisión de arte + corrección de defectos reportados

---

## 0. De qué iba la sesión

Continuación directa de la s146. El plan de entrada era enseñar tres cosas al
usuario para que decidiera: las **9 apuestas** del mapeo de glifos, los **3
dibujos** que quedaron sueltos, y los **4 glifos flojos**. Se cumplió, pero de
las tres revisiones salieron tres defectos que no estaban en el plan — y los
tres los vio el usuario mirando, no el código.

---

## 1. La hoja de revisión, y por qué no es un PNG

`scripts/audit/revision-glifos.js` genera `_revision-glifos.html` (ignorado por
git, se regenera) y se sirve con el preview.

La decisión de formato no es cosmética: el sello se pinta con `mask-image` sobre
`currentColor` a 56 px. **Una hoja de contacto en PNG mediría otra cosa** —
reproduce el dibujo, no el mecanismo. Sirviendo HTML con las máscaras reales y
`app/tokens.css`, lo que se ve es exactamente lo que pinta `Seal`: mismo tamaño,
mismo borde, mismos tokens. Cada ficha lleva el sello a tamaño real y a 3×,
porque son dos preguntas distintas (¿se reconoce? / ¿cómo está el trazo?).

Los tres dibujos sueltos aún no tenían máscara en el árbol, así que se procesan
al vuelo con el **mismo** `glifos-v2.js` que usa la ingesta y viajan como data
URI. Dos copias del mismo algoritmo sutil es como divergen.

---

## 2. El tramado de semitono — tres intentos

### Lo que reportó el usuario

«Primer aliento tiene como un fondo raro visible», y el Búho igual. Comparado
con su PNG original: **el moteado no está en el dibujo**, lo ponía la ingesta.

### La causa, medida

El fondo de los PNG **no es plano: viene ditherado** entre ~240 y ~254 (modas 241
y 254, 25 % de los píxeles cada una), y `SUELO` está en 238, justo debajo de esa
banda. El recorrido de un archivo:

| Paso | Píxeles bajo el suelo | Mínimo |
|---|---|---|
| gris a resolución nativa | **2,0 %** | 0 |
| tras reducir a 1024 | 2,7 % | 0 |
| tras reducir a 224 | 5,7 % | 122 |
| tras `sharpen(0,5)` | **12,4 %** | **78** |

O sea: la textura del papel entraba como TINTA, y la gamma de igualación la
levantaba todavía más. El moteado pesaba tanto como el trazo real (1,8 % del
cuadro al ~40 % de opacidad, contra 2,2 % de trazo).

### Los dos intentos fallidos, que enseñan más que el bueno

1. **Umbral solo** — aplanar a 255 lo que ya estaba sobre `SUELO`, antes de
   remuestrear. Parece la respuesta obvia: el suelo se aplicaba DESPUÉS del
   remuestreo que se lo lleva por delante. Quita el tramado limpio, pero la banda
   del dither **se solapa con el tono del trazo más pálido**, que es casi todo en
   dibujos a lápiz. Medido: la mediana de tinta se hundió de 2,35 % a 1,1 % y
   `esMarco` **dejó de detectar el aro en los 58** (al subir el fondo local a
   blanco, la línea fina promedia más clara y se sale de `TINTA_CLARA`). Borraba
   dibujo, no solo papel.

2. **`median(3)` a resolución nativa** — un filtro espacial ataca ruido
   ALEATORIO, y esto es una **trama regular de imprenta**. Sobrevivió entera, y
   encima perdió el aro de «Primer ritual», que salió con el círculo pintado
   dentro del sello. `blur()` es peor que no hacer nada: reparte el tramado en
   vez de quitarlo (velo del 18 % al 66 %).

### Lo que funciona: dos buffers, no uno

El umbral era correcto; el error era aplicarlo a TODO. La detección del marco
necesita el original. Así que van por separado:

- el **marco** se busca sobre el buffer sin tocar;
- **todo lo demás** sobre la copia aplanada a resolución nativa.

Resultado: marco detectado en **58 de 58**, peso mediano intacto (2,35 % →
2,17 %) y **248 KB las 58** contra 297 KB que pesaban 55 — más de la mitad del
archivo era tramado.

### La trampa que volvió a morder

`.toColourspace('b-w')` no es decorativo: **sharp promueve el buffer raw de 1
canal a 3 al remuestrearlo**, igual que ya estaba documentado para `.sharpen()`
en ese mismo archivo. Sin eso, leer el resultado como gris desplaza cada fila:
los 58 sellos salieron **idénticos** —un fragmento del aro ampliado— con el
dibujo entero perdido. Ahora lleva la conversión y un assert que aborta.

### Efecto colateral honesto

Al quitar el tramado, la mediana se mide ya sobre tinta REAL, así que **los
flojos pasan de 4 a 8**. No han empeorado: antes cuadraban con relleno que no era
suyo. El usuario los revisó y decidió **dejarlos como están**.

---

## 3. El aviso pintaba el glifo viejo — y eran DOS superficies

Reportado por el usuario: al desbloquear un logro, la notificación seguía
mostrando el dibujo antiguo.

`Toast.jsx` tenía una **tercera copia** del render de glifo, y buscando la clase
entera apareció una **cuarta** en `CompletionScreen.jsx`. La s146 sacó
`renderGlyph` a `window` precisamente para compartirlo, pero solo unificó el
modal y la sidebar. Las dos delegan ya en la misma función.

Verificado en el artefacto compilado (lección de s144: en `PACE.html` no se ve):

```
{"hayToast":true,"conMascara":true,
 "mask":"url(\"app/glyphs/assets/logros/first.step.webp\")",
 "texto":"NUEVO SELLO | Primer paso | Completa tu primer Pomodoro"}
```

Para `CompletionScreen` se comprobó con la MISMA forma de objeto que construye
(`{id, title, glyph, glyphSvg}`), que es todo lo que lee `renderGlyph`.

---

## 4. El sello flotaba con el largo de la descripción

Reportado con una captura: «Setenta y cinco sellos» y «Cartógrafa» no están
alineados.

No era el dibujo, era la tarjeta. `Seal` anclaba el contenido al **centro**, así
que un texto más alto empujaba el círculo hacia arriba. Medido sobre los 96
sellos: **tres posiciones distintas —15, 20 y 26 px del borde— y 11 px de deriva**
dentro de una misma fila, según la descripción ocupara 1, 2 o 3 líneas. El par
que reportó el usuario era el caso extremo.

Se ancla ARRIBA, que es la regla de alturas reservadas de s119: la tarjeta ya
tiene alto fijo (`aspectRatio`) y el círculo también, así que se alinean los
sellos **y** los títulos, y lo que varía cae hacia el hueco de abajo. Seguro
porque se midió antes: **0 de 96 tarjetas desbordan** su alto, y a la más cargada
le sobran 16 px. Después: **deriva 0**, los 96 a 15 px.

---

## 5. El mapeo

- **Las 9 apuestas** (○ del mapeo de s146): confirmadas por el usuario.
- **Los 3 sueltos**, colocados: bambú → `streak.60` «Estación» (crece por nudos)
  · vasija humeante → `explore.478` (el humo sube lento y largo, como la
  exhalación más larga del catálogo) · llave → `secret.bilingual` «Dos lenguas»
  (abre lo que estaba cerrado, y al ser secreto aparece como recompensa).
- **`hydrate.week.perfect` rechazado**: «no cuadra para nada, el glifo es un
  pincel con tinta». Tenía razón, y **el error es de lectura, no de criterio**: el
  mapeo de s146 lo anotó como «aguja con gota». Es un pincel de caligrafía con
  una gota a punto de caer — la MARCA que se hace —, así que va a
  `stats.month.first` «Mes habitado» (veinte marcas en el mismo mes), marcado
  como TEMPORAL. `hydrate.week.perfect` se queda **sin máscara** hasta que haya
  un dibujo de agua: mejor sin arte que con el equivocado.

**58 logros con arte, 38 sin.**

---

## 6. Verificación

- `index.html` regenerado y cargado con SW y cachés purgados y el estado limpiado
  **desde la página viva**: consola sin errores, 58 máscaras, `renderGlyph`
  presente.
- Toast y `CompletionScreen` comprobados por DOM, no por captura: el panel de
  preview devuelve fotogramas con retraso y no sirve de prueba.
- Alineación medida antes y después sobre los 96 sellos, y sobre el par exacto
  que reportó el usuario (misma fila, `topA` = `topB` = 370, diferencia 0).
- 58 máscaras en disco = 58 filas en el mapa = 58 filas en el precache.
- `PACE_standalone.html` restaurado **byte a byte** tras el build, hash
  `998e3e358d689036` (decisión s134).

---

## 7. Lo que queda abierto

- **38 logros sin arte**, entre ellos `hydrate.week.perfect`, que perdió el suyo
  a propósito y necesita un dibujo de agua.
- **El pincel en «Mes habitado» es temporal** — alternativa anotada: «Zen
  accidental».
- **Los 20 glifos de ejercicio de la ola B** (Mueve/Estira) siguen esperando arte.
- **Reescritura editorial de las 28 descripciones**: sigue faltando la referencia
  de tono del usuario.
- **Títulos y descripciones de logro son solo español**, también en inglés
  (hallazgo de s146, sin tocar).
