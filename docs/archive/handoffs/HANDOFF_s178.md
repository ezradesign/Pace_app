# Handoff · s177 → s178

> **v0.107.0** · `npm run verify` PASA · `npm run test:e2e` **150/150** ·
> **6 mutantes calibrados, 6 muerden** · standalone intacto en v0.71.0.
> El detalle vive en [`session-177`](./sessions/session-177-lo-que-no-se-oia.md);
> aquí sólo lo que hace falta para empezar.

---

## 0 · LO PRIMERO: el usuario pidió una AUDITORÍA COMPLETA

Textual, al cerrar s177: **«empezamos s178 haciendo una auditoría completa para
saber qué hay que hacer, qué queda pendiente, qué decisiones están obsoletas,
etc».**

**No es limpieza.** El proyecto lleva **79 decisiones técnicas vigentes**, 15
fases de ROADMAP y un backlog que nadie ha cruzado consigo mismo desde s137. Y
el riesgo está medido dos veces:

- en **s176**, la documentación describía **Mueve y Estira al revés**, y eso
  «mandó a más de una sesión al archivo equivocado»;
- en **s177**, **tres decisiones anularon a otras tres** (s112, y dos del propio
  brief de música de s176) — y ninguna se buscaba: aparecieron al medir.

### Qué tiene que contestar, y con evidencia `file:line`

1. **Qué decisiones están OBSOLETAS o se contradicen.** Las 79 filas de
   `DECISIONES_TECNICAS_VIGENTES.md` cruzadas contra el código de hoy.
2. **Qué queda REALMENTE pendiente** de las 15 fases, y qué se hizo sin marcarse.
   El encargo de glifos de s167/s169 ya demostró que una lista puede estar
   entregada y nadie marcarla — lo destapó `verify.encargo.js`, no una lectura.
3. **Qué hay implementado que nadie sabe que existe.** `library-transition.js`
   lleva **inerte desde s174** (130 líneas, con un test que vigila que no deje
   rastro). Y hay **doce bancos** en `scripts/audit/` sin indexar en ningún sitio.
4. **Qué promesas públicas siguen siendo ciertas**: `privacy.html`, los dos
   README, el copy de premium. s151 encontró un `README_EN.md` vendiendo un
   modelo de negocio muerto, y s162 tuvo que meter los README en el `verify`
   porque llevaban **ocho versiones de deriva**.
5. **Qué deuda de la tabla `Deuda tecnica activa` sigue viva.** s162 cazó que
   esa tabla **mentía en cinco filas**.

> **Y lo de siempre: lo que traiga tras probar manda sobre la auditoría.** En
> s174, s175, s176 y s177 sus defectos reprodujeron **todos**.

---

## 1 · Lo que s177 entregó

| | antes | ahora |
|---|---|---|
| «Cuídate» dentro de la barra del runner | **15,0 px** en 11 de 47 pasos | **0 de 47** |
| Salto entre «colócate» y «ejercicio» | nombre 26,4 · número **51,2** · etiqueta 4,6 | **las 7 piezas a 0,0** |
| Tamaño del número | 56 → 104 px | **76 en las dos** (anula s112) |
| Modal de Stats | 820 de 1536 | **1240**, como sus hermanas |
| «Año»: celda / hueco muerto | 11 px / **163,7** | **19 px / 52,4** |
| Música de fondo | no existía | tercera capa, **provisional** |

---

## 2 · Medido en s177 · no volver a medirlo

- **Runner**: verificado a 714, 768, 800, 900, 1040, 690 y 660 px de alto.
  Huecos 9,8 / 9,7 a 1536×714. **Por debajo de 641 NO se aplica** — a 1280×600
  solapa 7,0 px con el número a 58 y 12,7 con 64. **Móvil tampoco.**
- **Stats**: el mes **no puede crecer** — 421,4 / 474,4 / 527,4 px con celda
  48 / 56 / 64, contra los 385 de las demás.
- **Niveles RMS**: música **−30,53** · `sulafat-inhala` **−28,07** ·
  `sulafat-exhala` **−29,95** · drone (sine 0,02) **−36,99**. Música y voz
  tienen casi el **mismo RMS a ganancia 1**.
- **El drone está en G2 = 96,22 Hz**, no en 96,7 (el comentario de `Sound.jsx`
  mintió desde antes de v0.51.0).
- **Reparto de banda**: `equilibrio` 82,6 % bajo 200 Hz y **0 %** sobre 2 kHz ·
  `energia` 48 / 40,8 / 10,8 / 0,4.

---

## 3 · Trampas que s177 pagó

- **LA SEMILLA ES `firstSeen`, NO `onboarded`** (`tests/helpers.js` lo dice con
  el aviso delante). Con la clave mal puesta la app se monta **debajo** del
  overlay de bienvenida: los selectores lo encuentran todo, **las medidas salen
  correctas** y la cámara fotografía la bienvenida. **Veintidós capturas del
  onboarding con una tabla de números buena al lado.** Los bancos llevan ya un
  guard de cámara.
- **`getBoundingClientRect()` devuelve la caja YA TRANSFORMADA.** El número del
  runner late (`pace-rep-pulse`, s113): la misma cifra de 76 px medía **72,2**
  en una pantalla y **65,0** en la otra. Congelar la animación para medir.
- **Una tabla que no mide una pieza dice «no se mueve»** exactamente igual que
  si no se moviera. El banco comparaba cuatro y el número no estaba.
- **Un mutante que no muerde corrige el ASERTO, no al revés.** Tres versiones
  salían verdes porque la rutina elegida no variaba de texto entre pantallas.
- **`git checkout` restaura al ÚLTIMO COMMIT** y borró una implementación
  entera. Copiar antes de mutar.
- **Backticks dentro del template literal**, dos veces y en dos archivos — y
  `MoveSessionV1.css.jsx` lo avisa **en su cabecera**, con la lista de las siete
  sesiones anteriores que lo pagaron.
- **Mandar el build a `/dev/null`** hizo correr un censo entero contra un
  artefacto roto. Esa misma cabecera lo avisa.
- **Reservar de MÁS cuesta igual que no reservar**: 41 px a tres bloques de cola
  convirtieron un solape de 15,0 en **27,0**.
- **El orden de las reglas**, otra vez: a igual especificidad gana la última del
  archivo, y eso movía la cola **8,0 px** exactos.

---

## 4 · La cola, tras la auditoría

1. **Las dos preguntas de s176**, que s177 no llegó a abrir: el **aside de
   familia** en Respira (eligió E y se corrigió a C; pintado en los marcos D y E
   de `_maqueta-s176-respira.html`, que se regenera con
   `node scripts/audit/maqueta-s176.autonoma.js`) y el **tercer chip
   «Discreta»** (14 de 20), que hay que **pintar antes de preguntar**.
2. **FASE 4 · Stats de verdad.** s177 arregló el ANCHO; el destino de
   `STATS_DESTINO_PROPUESTA.md` sigue entero. El ROADMAP lo llama «el escaparate
   del free».
3. **La música.** Antes de regenerar nada, los seis briefs necesitan el
   requisito que faltaba: **el grueso de la energía entre 200 Hz y 2 kHz**. Y
   los **términos de uso comercial**, sin verificar, que ya valen para seis
   locuciones y las piezas.
4. **El arte**: `Rana` y los 19 glifos de logro; las 18 piezas de la 2ª tanda
   siguen sin mirarse.
5. **FASE 8 · onboarding contextual.**

**Lo que NO conviene abrir:** Travesías, la sidebar (636 líneas, sin
diagnóstico), CTB (fuera de v1 por escrito) y Capacitor.

---

## 5 · Abierto, dicho y no escondido

- **El lote de música, sin decidir.** Cinco de las seis piezas sin usar. La que
  quedó montada es **provisional y suena en las seis familias**, con un bajón de
  ~1 s cada 2:09 (el archivo sale con un fundido de −36,6 dB).
- **`sw.js:338` hace `cache.put` de cualquier petición** y la Cache API rechaza
  `HEAD`: cualquier HEAD que pase por el service worker lanza una excepción no
  capturada. Guard de una línea, sin tocar.
- **Por debajo de 641 px de alto el runner no está congelado**, y móvil tampoco.
- En las pantallas de **cambio de lado** la línea «El lado siguiente empieza
  solo» todavía se mueve **99,7 px** entre pasos.
- **`library-transition.js` sigue inerte** (130 líneas). Borrarlo es decisión
  del usuario.
- **El `CHANGELOG` tiene SEIS bloques de detalle** donde la convención son dos.
  Su contenido no se pierde borrándolos, pero descartar texto es decisión suya.
- **9 de las 14 de Estira piden suelo**, en una biblioteca de oficina.

---

## 6 · Herramientas nuevas de s177

En `scripts/audit/`; sólo leen o generan HTML, y su salida está gitignorada.

| Script | Qué da |
|---|---|
| `banco-musica-s177.js` | Decodifica cada MP3 y lo mide contra el brief: banda de voz, ataques, planitud, afinación, bucle, ciclo y a qué ganancia ponerlo. **Las locuciones entran en la tabla** para que el margen se calcule en vez de suponerse |
| `censo-runner-solape.js` | Recorre **las 28 rutinas paso a paso** midiendo solape y salto. Mide los **HIJOS** y no el bloque: con `min-height: 0` el bloque informa de su alto ya encogido |
| `banco-runner-s177.js` | El presupuesto de altura pieza a pieza, con variantes sobre la app real y la tabla de **alturas de caja**, que dice *por qué* algo se mueve |
| `banco-stats-s177.js` + `maqueta-s177-stats.js` | Lo mismo para el calendario, midiendo **hueco muerto** y scroll en las cuatro pestañas |
| `maqueta-s177-runner.js` | La comparación mirable del runner, en un archivo autónomo |
| **`prueba-musica-s177.js`** | Página de escucha **en otro puerto**, sin service worker ni app, con medidor de nivel. Nació porque la medida y el oído no coincidían y había que **quitar variables, no medir más** |
