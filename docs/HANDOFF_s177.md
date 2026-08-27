# Handoff · s176 → s177

> **v0.106.0** · `npm run verify` PASA · `npm run test:e2e` **146/146** ·
> **12 mutantes calibrados, 12 muerden** · standalone intacto en v0.71.0.
> El detalle vive en [`session-176`](./sessions/session-176-lo-que-el-usuario-probo.md);
> aquí sólo lo que hay que saber para empezar.

---

## 0 · LO PRIMERO: dos preguntas suyas, las dos ya pintadas

s176 salió entera de lo que el usuario vio al probar, y **los cuatro defectos
que trajo reprodujeron**. Quedaron dos cosas a una línea de distancia:

### 0.1 · El aside de familia en Respira

Eligió **E** y se corrigió a **C**. Las dos variantes se diferencian en **dos**
cosas: el **rail** (que es lo que pidió, ya implementado) y el **aside de
familia** —«Despierta el sistema», «Regula el sistema nervioso»— que **C no
lleva** y que s174 había quitado del catálogo sin sustituirlo por nada.

**No se asumió que lo quería.** Está pintado en los marcos **D** y **E** de
`_maqueta-s176-respira.html` (se regenera con
`node scripts/audit/maqueta-s176.autonoma.js`). Si dice que sí, es una línea en
`LibraryShell.jsx` más una regla en `library.css.jsx` — el CSS ya está escrito
en la maqueta (`ASIDE`, en `scripts/audit/maqueta-s176.js`).

### 0.2 · Un tercer chip para Respira

Hoy lleva **dos**: `≤ 5 min` (9 de 20) y `Sin retención` (11 de 20). El tercero
que se pintó —«Sin rondas»— **se cayó al medirlo**: es un **subconjunto
estricto** del segundo. Si quiere un tercero, el candidato honesto es
**«Discreta»** (sin zumbido ni hiperventilación: dejaría **14 de 20**), y hay
que **pintarlo antes de preguntarle**.

> Y lo de siempre: **lo que traiga tras seguir probando manda sobre cualquier
> plan.** En s174, s175 y s176 sus defectos reprodujeron **todos**.

---

## 1 · Lo que s176 entregó, en una tabla

| | antes | ahora |
|---|---|---|
| Respira, escritorio | 1 columna de **810 px** · 3,90 pantallas | rejilla de 3 × **288** + rail · **1,98** |
| Respira, móvil | sin filtros | chips + «Para ahora» · tarjeta de 310 px |
| «Tus rutinas» en el rail | sobresalía **18 px** | alineada (242 = 242) |
| Ajustes · sonido | 2 pills + 1 casilla; la voz no se podía quitar | **Audio** → *Qué marca la fase* (Tono·Voz→Clara·Grave) → *Qué suena detrás* |
| Barra del runner | **−15 px** (dentro del pie) y 47,2 más abajo que en «colócate» | **586,5 px en las dos**, +16 |
| Stats, 4 pestañas | **163,2 px** de salto, 2 con scroll | **0 px**, ninguna |

**Respira usa `LibraryShell`** — se anula «comparte la tarjeta y no la pantalla»
(s174). Es **menos** código: cinco props (`filtros`, `variant`, `conTuyas`,
`pozoAhora`, `ancho`) con el valor de cuerpo por defecto, así que Mueve y Estira
no cambian ni un píxel.

---

## 2 · Medido en s176 · no volver a medirlo

- **Su pantalla son 1536 CSS px** (1920×1080 al 125 %). A 1920 sus defectos
  **no reproducen**.
- **Las dos voces**, midiendo la **palabra** (onda decodificada, umbral −50 dBFS,
  con `sulafat` de control reproduciendo 0,003 / 0 / 0 de diferencia):

  | | inhala | mantén | exhala | tono | cabe en |
  |---|---|---|---|---|---|
  | `sulafat` | 1,404 | 1,320 | 1,478 | ~193 Hz | **17 de 20** |
  | `bradford` | 0,911 | 1,218 | **3,572** | ~121 Hz | **14 de 20** |

- **Y el MODELO importa al contar**: el producto decide **señal por señal**
  (14); exigir que las tres quepan en la fase **más corta** de la rutina da
  **12**. Coinciden en `sulafat` (17 y 17) y se separan en `breathe.yin` y
  `breathe.nadi.shodhana`. Estuve a punto de dar el número malo.
- **Runner**: barra a **586,5 px** en las dos pantallas, 16 hasta el pie.
  Círculo clavado en **76,4** (1536×714) y **58,6** (móvil).
- **Stats**: a 714 px de alto la vista puede medir **384,9**; el suelo está en
  **385**, que es lo que iguala las cuatro (con 382, «Año» y «Caminos» se quedan
  2,5 px cortas).
- **Precache: 229 filas.** **Claves i18n: 558 por idioma.**
- **Respira: 9 de 20 duran ≤ 5 min · 11 de 20 sin retención · 6 con aviso.**

---

## 3 · Trampas que s176 pagó

- **UN MODAL MEDIDO A MEDIAS DA EL 96 %** (`pace-modal-in`, scale .96 → 1):
  777,6 px donde la app da 810; 584 donde da 607.
- **«Dos lecturas iguales» NO es esperar a un modal.** La curva se aplana y dos
  muestras a 100 ms coinciden **a mitad del fundido** — el aserto de Stats salió
  **rojo con la app ya arreglada**. Usar **`esperarModalAsentado`**
  (`tests/helpers.js`), que pregunta a `getAnimations()`.
- **`querySelector('[data-pace-modal-card]')` devuelve el de ABAJO**: el preview
  se abre **encima** de la biblioteca y los dos están en el DOM. Coger el último.
- **«Empezar» encuentra el «Empezar foco» de la home** y arranca el Pomodoro.
  Todo click va acotado a su contenedor.
- **Un `</script>` dentro de un bloque de datos** cierra el script del padre
  **sin dar error**: seis iframes vacíos y consola limpia. Y el primer guard que
  escribí **no podía cazarlo** (comparaba contra la primera aparición).
- **`document.fonts.ready` resuelve casi al instante en `file://`**, así que una
  medida colgada sólo de él **se adelanta al parseo**.
- **El CSS extraído de un archivo trae las barras DOBLADAS** (`\B7` en vez del
  punto medio): hay que desdoblarlas al leer.
- **Y LA DE SIEMPRE, que va por NUEVE**: toda consulta al DOM de la biblioteca
  **filtra por caja no nula**. En s176 mordió en el badge de mi propio banco.
- **`margin-top: auto` CEDE cuando el contenido desborda**, así que no sirve
  para anclar nada cuyo vecino pueda crecer. Lo cazó **el CI y no el local**: en
  el runner, con otras métricas de fuente, la barra del runner se separaba
  **9,4 px**. Un aserto que sólo se corre en una máquina no prueba nada sobre la
  otra.
- **Backticks dentro del template literal de una hoja CSS**: abortan el build.
  Volvieron a morder en s176, como en s139 y s172b.

---

## 4 · Lo que recomiendo, por orden

1. **Las dos preguntas de §0.** Baratas y delante del usuario.
2. **FASE 4 · Stats de verdad.** s176 arregló **lo que él pidió** (mismo tamaño,
   sin scroll) y **eso no es la fase**: el destino escrito en
   `STATS_DESTINO_PROPUESTA.md` sigue entero, y él mismo dijo «este módulo
   también habrá que optimizarlo cuando llegue su momento». Desbloqueada desde
   s172; el ROADMAP la llama «el escaparate del free».
3. **La música**, si genera las piezas. Los briefs están en
   [`MUSICA_RESPIRA_BRIEFS.md`](./product/MUSICA_RESPIRA_BRIEFS.md) con los
   números del catálogo detrás. **Dos cosas las deciden los números**: Equilibrio
   y Balance **pueden compartir pieza**, y **Pranayama no cabe en una sola pieza
   con pulso** (de 2,1 a 30 respiraciones/min, factor 14). Van a
   `app/breathe/musica/`, **no al precache**, y la tercera pill se enciende en
   `TweaksAudio.jsx`.
4. **El arte**: `Rana` (candidata válida, le faltan fondo blanco y que la flecha
   diga «cadera atrás») y los **19 glifos de logro**. Y **las 18 piezas de la 2ª
   tanda siguen sin mirarse**.
5. **FASE 8 · onboarding contextual**, la raíz real de «no me guía».

**Lo que NO conviene abrir:** Travesías (van tras reescribir los Caminos), la
sidebar (636 líneas y ningún diagnóstico), CTB (fuera de v1 por escrito) y
Capacitor (~4–6 sesiones, detrás de casi todo).

---

## 5 · Abierto, dicho y no escondido

- **`library-transition.js` sigue inerte** (130 líneas, con un test que vigila
  que no dejen rastro). Borrarlo es decisión del usuario.
- **1,5 px a 360×730** en el runner: las dos pantallas ya coinciden entre sí
  (585 y 585,3) pero el contenido sigue siendo más alto que el centro. Venía de
  **−29,5**.
- **Los términos de uso comercial del audio, sin revisar.** La FASE 5 los pide
  por escrito, y ya valen para las **seis** locuciones.
- **El `CHANGELOG` tiene CINCO bloques de detalle** donde la convención son dos.
  Su contenido no se pierde borrándolos —vive en la tabla y en los diarios— pero
  descartar texto es decisión del usuario.
- **9 de las 14 de Estira piden suelo**, en una biblioteca de oficina. Es
  contenido, no diseño.

---

## 6 · Herramientas nuevas de s176

En `scripts/audit/`; sólo leen o generan HTML, y su salida está gitignorada.

| Script | Qué da |
|---|---|
| `maqueta-s176.js` (+ `.audio`, `.pagina`, `.medir`) | Las **seis variantes de Respira** y las **cuatro del bloque de sonido**, en iframes de viewport real, cada marco midiéndose a sí mismo. `.medir` vuelca `medidas.json` para que la tabla no lleve números a mano |
| **`maqueta-s176.autonoma.js`** | La maqueta de Respira en **UN solo archivo** (fuentes e imágenes dentro): se abre desde cualquier carpeta y se puede mandar |
| `banco-runner-s176.js` | El runner con **nueve variantes de CSS inyectadas sobre la app real**, midiendo las dos pantallas a la vez |
