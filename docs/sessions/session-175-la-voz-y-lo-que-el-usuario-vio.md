# Sesión 175 · La voz de Respira, y los cuatro defectos que el usuario vio antes que yo

**v0.104.0 → v0.105.0** · `npm run verify` PASA · `npm run test:e2e` **136/136**

---

## Lo que abrió la sesión y lo que acabó siendo

El handoff traía «el arte que falta, y Respira». Se hizo la auditoría de arranque
y se generó la hoja de revisión de las 18 piezas de la 2ª tanda — y ahí el
usuario mandó **cuatro defectos de la biblioteca vistos en la app publicada**,
que pasaron a ser el trabajo. Después llegaron los audios y una petición de
auditoría integral. La sesión tiene, por tanto, tres bloques que no estaban
planificados y uno que sí.

---

## 1 · Los cuatro defectos del usuario, medidos antes de tocar

Reportados sobre `paceweb.pages.dev` a **1920×1080 con escala del 125 %**, que
son **1536 CSS px** — dato que hubo que preguntarle, porque a 1920 el defecto no
reproducía.

| Reportado | Medido |
|---|---|
| «apretado entre Tus rutinas y Para ahora» | Huecos del rail: **11 / 25 / 0 / 11 px**. El cero era exacto y estaba justo donde señaló |
| «al bajar, el lado se queda vacío» | Rail `position: static` con caja estirada a **1250 px** y **566** de contenido; con el scroll al fondo, **144 px** de rail y **697** de columna vacía |
| «que quepa sin scroll» | A su altura la segunda sugerencia **se corta 9 px**; el umbral está en **~723 px** de viewport |
| «Caderas · suelo sin glifo» | **La única capitular vacía de las 28** |

**El 0 px no era un valor mal puesto.** La regla es
`.pace-lib-lateral-tit + * { margin-bottom: 26px }` y «Tus rutinas» es el único
bloque que **no va detrás de un rótulo** —trae su propio título—, así que el
selector de hermano adyacente lo saltaba. Un bloque que se cae del selector, no
un número mal escrito.

### Lo que se pintó antes de preguntar

Cuatro variantes de rail y cuatro de preparación, cada una en un **iframe de
1536×714 reales**, con las tarjetas de producción (`RoutineCard.jsx` renderizado
con `react-dom/server`) y el CSS extraído de `library.css.jsx`. **Cada marco se
mide a sí mismo** y escribe su número en una banda.

Y ahí salió algo que no se ve razonando: **dar aire empeora el recorte**. La
variante que sólo añadía los 26 px pasaba de cortar 22 px a cortar 48. Las dos
peticiones del usuario —más aire y que quepa— no caben juntas con dos
sugerencias. La que cumple las dos es **una sola sugerencia**, que era su propia
propuesta.

### Elegido y entregado

- **A2**: rail `sticky`, aire igual en todos los bloques, **una** sugerencia.
  Resultado medido contra el `index.html` de HEAD servido en paralelo: huecos
  **11/25/25/11**, recorte **0**, y **481 px de rail intactos** con el scroll al
  fondo.
- **B2**: el CTA de «Prepárate» se recoge bajo el texto sin mover el círculo —
  control ejecutado: el círculo está a **76 px en las dos versiones**, así que el
  relevo no ganó brinco. Los 280 px de vacío pasaron de estar **en medio** a
  estar **debajo**.

**Una sugerencia, no dos, en las DOS pieles**, y no por gusto: lo que sube a
«Para ahora» se **retira** del catálogo (`enAhora`), así que pintar dos en móvil
y una en el lateral dejaría la segunda sin aparecer en ninguna parte de la
pantalla de escritorio. Que difirieran exigiría leer la piel en JS, que es lo que
s166 quitó a propósito.

---

## 2 · El prepárate pierde el glifo, y con él la transición de s174

Decisión del usuario mirándolo: **«el prepárate no debería tener ningún glifo,
sólo el contador regresivo»**, en Mueve y Estira (Respira nunca lo tuvo).

**Lo que se fue con el glifo, y no es poco**: ese círculo era el **único destino**
del vuelo de la capitular que s174 construyó. `paceVueloDestino()` ya no
encuentra dónde aterrizar y el vuelo **se retira solo** — está escrito para eso.
Con él se fueron sus tres reglas de hoja, incluida la B2 que se acababa de
implementar: sin anclaje no hay hueco que recoger.

La pantalla resultante **es la que Respira ya usaba**: numeral de 200 px (128 en
móvil), rótulo y copy, centrados. Las tres bibliotecas comparten preparación.

`app/ui/library-transition.js` queda **cargado e inerte**: 130 líneas que no
pueden dispararse. Se deja a propósito y con un test que vigila que no deje
rastro, porque borrarlo es decisión del usuario.

---

## 3 · La voz de Respira

El usuario trajo seis MP3 (dos voces × tres señales) y decidió que **las voces
entran**. Eso **anula una regla escrita en seis sitios** —«Voz/TTS: NUNCA», en
cuatro filas de `DECISIONES_TECNICAS_VIGENTES.md` y dos veces en `ROADMAP.md`—,
así que lo primero fue cambiarla: las cuatro filas quedan marcadas
`SUPERSEDED por s175` (convención del propio documento: marcar, no borrar), más
los tres sitios del ROADMAP y una fila nueva con la decisión y sus límites.

### El número correcto costó tres intentos, y los tres están escritos

| Cómo lo medí | Resultado | Por qué era falso |
|---|---|---|
| Cabecera MPEG (tamaño / bitrate) | «cabe en **14** de 20» | Daba **casi la mitad** de la duración real |
| `audio.duration` | «cabe en **8** de 20» | Correcta, pero **incluye los silencios** del archivo |
| **Extremos de la voz** (onda decodificada) | **17 de 20** | Es lo que suena, y es lo único que puede pisar la señal siguiente |

**El apunte que lo resolvió fue del usuario**: «calcula lo que dura la palabra
porque el audio tiene colas con silencio». Decodificada la onda con dos umbrales
—1 % del pico y −50 dBFS, coinciden dentro de 12 centésimas—:

| | archivo | silencio antes | palabra | cola muda |
|---|---|---|---|---|
| inhala | 2,44 s | 0,39 s | **1,40 s** | 0,65 s |
| mantén | 2,56 s | 0,02 s | **1,32 s** | 1,22 s |
| exhala | 4,96 s | **0,65 s** | **1,48 s** | **2,84 s** |

El «exhala» ocupa casi cinco segundos y la palabra acaba a los **2,12**.

**La forma de equivocarme fue la misma las dos veces: medir el CONTENEDOR en vez
del CONTENIDO.** Está escrito en la cabecera del módulo para que no se repita.

Y el apunte destapó **un segundo defecto que no había visto**: los 0,65 s de
silencio inicial hacían que **la señal llegara tarde**. El clip entra ahora por
donde empieza la voz, con 40 ms de pre-rodadura para no cortar el ataque.

### Cómo quedó

- **La decisión es POR FASE, no global**: `paceVozIntenta(señal, segundos)` sólo
  canta si la palabra entra con su margen; si no, `playSound` sigue al
  sintetizador de siempre.
- **La disponibilidad se sabe por precarga** (`canplaythrough`), no intentando y
  fallando: `play()` es asíncrono y para cuando el fallo llega, la señal ya se
  habría perdido.
- **Fuera quedan sólo las tres de bombeo** (fases de 1 s, 90 ciclos en 3 min).
- **El «mantén» rompe un silencio deliberado**: la retención no sonaba a
  propósito. Reversible en cuatro líneas y marcado en el código.
- **En el standalone no hay voz** por construcción, que es lo que decidió s134.

### Dos trampas del build

1. El build **aborta si queda cualquier referencia bajo la carpeta de arte de
   Respira** que no pueda convertir en data URI. Un MP3 ahí dentro lo tumba: los
   clips viven en `app/breathe/voz/`.
2. Y volvió a tumbarlo **el comentario que explicaba lo anterior**, porque el
   guard busca la CADENA y Babel conserva los comentarios en el artefacto.

`BreatheSession.jsx` se pasó de 500 líneas al añadir la señal del sostén, así que
el mapeo etiqueta→sonido salió a su `.support` — que es lo que STATE dejaba
dicho desde s166.

---

## 4 · Auditoría integral

En [`audit-integral-s175.md`](../audits/audit-integral-s175.md). Cruza el plan
con el árbol; no reescribe el plan. Lo que más cambia la conversación:

- **La FASE 4 (Stats) está desbloqueada** desde que hay emisores (s172), tiene
  destino escrito desde s129 y ya hay 1.111 líneas sobre las que construir.
- **«Que enganche y guíe» no es una fase**, y por eso falla. La raíz está
  localizada en la FASE 8: sin onboarding contextual, «los filtros y la
  recomendación no tienen con qué filtrar».
- **Travesías van DESPUÉS de reescribir los Caminos**, y el ROADMAP dice por qué:
  «se construyen encima».
- **La sidebar es lo único de la lista sin diagnóstico**: 636 líneas y ningún
  documento. No se puede ordenar lo que no se ha medido.
- **CTB está en «Fuera de v1» por escrito**, con su entregable mínimo definido.

---

## 5 · Mentiras del instrumento, y esta vez muchas fueron mías

1. **La maqueta enseñaba el «después» en el marco del «antes»**: lee la hoja de
   producción, y producción ya llevaba el arreglo. Lo delató el badge al dar A0 y
   A1 idénticos.
2. **Dibujé «Tus rutinas» a mano** y daba 9 px donde la app da 0 — escondía justo
   el defecto que había que enseñar.
3. **El marco no heredaba `box-sizing`**: el scroller medía 622 en vez de 582 y
   se regalaba 40 px que no existen.
4. **Consulté el DOM sin filtrar por caja visible** y el badge dijo «rail 0 px»
   en los ocho teléfonos. Es la trampa que s174 documentó **seis** veces; la
   séptima fue en mi propio instrumento.
5. **El alto del modal móvil, clavado** en 706 px: en un teléfono de 568 no cabía
   y aparecía una barra que se comía 15 px de ancho.
6. **El badge medía antes de que cargaran las fuentes**, y dos marcos del mismo
   ancho daban 297 y 312.
7. **Un control que no reproducía las condiciones**: al buscar la altura donde el
   `flex-shrink` decidiera, estreché el root a mano — y eso **no recalcula el
   arte**. No probaba nada.
8. Y **la trampa de los backticks**, otra vez: bash se comió dos palabras dentro
   de un comentario.

---

## 6 · Calibración en rojo

**Once mutantes, diez muerden.** Rail: quitar el sticky · devolver la regla vieja
del aire · volver a dos sugerencias · **el fantasma** (promocionar dos y pintar
una: la segunda desaparece de la pantalla entera). Preparación: quitar el flex
del centro · devolver el arte (muerde 3 de 5). Voz: medir el archivo en vez de la
palabra · reproducir desde 0 · «no saber la fase» = cantar igual.

**El que no mordió está documentado y su test retirado**: quitar el
`flex-shrink` pasaba en verde porque el arte se encoge solo con la altura y el
centro nunca desborda. Un aserto que ningún mutante puede poner rojo es
decoración, y s154 ya pagó cuatro de esos. También se corrigió el comentario del
código, que afirmaba que ese test caía sin el shrink: era falso.

---

## 7 · Lo que NO se cubre

- **No he oído los clips.** Timbre, ruido de fondo y si «mantén» cansa repetido
  veinte veces: sin medir.
- **`bradford` sin medir**: sus cifras eran de cabecera, que ya falló dos veces.
- **Si la voz necesita interruptor propio** en Ajustes: hoy va con `soundOn`. Es
  decisión de diseño y habría que pintarla.
- **Las 18 piezas de la 2ª tanda siguen sin mirarse** (hoja generada, aplazado
  por decisión del usuario).
- **Ni un píxel comparado** en móvil real, ni inglés, ni paleta oscura.
- `library-transition.js` **inerte**, pendiente de decidir si se borra.
