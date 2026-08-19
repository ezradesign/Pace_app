# Sesión 170 · El tiempo activo de Mueve, y el arte anatómico entra de verdad

**v0.99.1 → v0.100.0** · `verify` PASA · **97/97** en la suite E2E

---

## 0 · Lo que la sesión traía y lo que salió

El handoff pedía la **Fase 3 de `pace.events.v1`** empezando por su prerrequisito
(PASO 1: contabilidad de pausa en Mueve/Estira). Eso se hizo y está cerrado. Lo
demás —47 glifos de ejercicio ingestados, un asset nuevo para la miniatura— entró
por petición del usuario a mitad de sesión y acabó siendo el grueso del trabajo.

---

## 1 · Las cuatro decisiones de la §4 del handoff: **las contestaba un documento**

Existe `docs/product/EVENTOS_SCHEMA.md` §6.3/§6.4/§7.1/§7.2, y **decide las cuatro**.
No hacía falta criterio, hacía falta leer. Tres de mis cuatro respuestas iniciales
estaban mal:

| | lo que dije | lo que dice el esquema |
|---|---|---|
| `runId` | inventarlo en el runner | ✅ y la receta UUIDv4 **ya está implementada** (`events-model.js:58`) |
| `plannedSeconds` | legacy = derivado de `dur` | ❌ §6.4: legacy = `routine.min × 60`, **`declared`** |
| `completionReason` | «`early` no se emite nunca» | ❌ §6.3: `finishRepsEarly` ES «control explícito de finalización anticipada» |
| `context`/`pathRunId` | anclar en `paths.current` | ✅ + hallazgo: el registro usa **`kind:'body'`** y el enum no lo tiene |

**Lección**: antes de razonar sobre una decisión, comprobar si ya está escrita.

---

## 2 · PASO 1 · contabilidad de pausa (Fase 3)

`useActiveClock` compartido en `app/ui/SessionClock.jsx`, consumido por los **dos**
runners de cuerpo. `useHoldClock` de Respira pasa a delegar en él: eran a punto de
ser tres copias del mismo bucle, que es el defecto que s147 pagó con el render de
glifo.

La **política** vive aparte y pura en `v1TrabajoActivo` (support) porque *es* la
decisión: fuera preparación, colocación, transición de lado, descansos y pausas
(§6.4 del esquema). En el runner legacy el descanso sólo se distingue **por el
nombre**, misma convención que el censo de s164 y la ingesta de s166.

**No se inventó `activeSeconds`.** En «Flexiones de escritorio» el catálogo declara
120 s de trabajo; con una pausa de 30 s la app mide **activo ≈ 120 · pared ≈ 220**.

**4 mutaciones y las 4 muerden**: contar todo → 220 · contar descansos → 180 ·
contar pausas → 150 · perder el segmento abierto → 88. La cuarta —la trampa de
s166— sólo la caza el test de navegador, que es lo que justifica que haya dos.

---

## 3 · El arte anatómico: de 0 a 47 glifos

El usuario eligió **arte anatómico** en vez del pictograma esquemático del encargo,
con un argumento que se sostiene: un glifo esquemático puede no explicar el
ejercicio. Eso obligó a rehacer media ingesta.

### Lo que costó, en orden

1. **`file://` bloquea la máscara por CORS.** El primer «glifo en blanco» era el
   instrumento, no el producto. Por eso el standalone inlinea y el `index.html` no.
2. **Bug real en la ingesta de s166**, nunca ejercitada sobre arte real: escribía
   las filas de precache con `'./app/...'` cuando el resto de `sw.js` usa `'/app/...'`.
   La app funcionaba; el contrato «declarado ↔ cacheado» no. Lo cazó el test relacional.
3. **`sharp` reordena las operaciones**: `extend` va DESPUÉS de `resize`, así que
   `.extract().extend().resize(384,384)` devolvía 384×404. Relleno vertical sólo
   recortaba; relleno **lateral** alargaba las filas y el dibujo salía en **rayas
   diagonales**. Es la trampa de orden que s146 anotó como «extract antes de extend».
4. **La trampa de canales, TRES veces en la misma sesión.** `sharp` promueve un raw
   de 1 canal al redimensionar. La tercera se arregló leyendo `info.channels` y
   poniendo un **guard que aborta** si el buffer no cuadra.
5. **Dos umbrales de tinta distintos** (recorte con 220, máscara con 238): el
   material tenue de en medio quedaba fuera del encuadre y dentro del dibujo.
   «Superman» salía con radio 95 donde las otras doce daban 85. Arreglado con **un
   solo piso**, no con un parche correctivo.

### El encuadre, corregido TRES veces mirando con el usuario

- por **caja**: el flexor se salía del disco (radio 107 sobre un tope de 94,5).
- por **masa**: dejaba el hueco debajo —12 px de aire arriba contra 62— y el
  usuario lo vio como «está alto».
- por **circunferencia mínima** (lo actual): el usuario reportó **seis piezas** con
  la misma frase, «le sobra más aire por la derecha que por la izquierda». No eran
  seis retoques: era el criterio.

El acierto de fondo: **el contenedor es un círculo y yo normalizaba a un cuadrado**.
Con normalización circular, el tamaño lo fija el radio máximo desde el centro
elegido, así que **minimizar ese radio == maximizar el dibujo dentro del disco**, y
el centro que lo minimiza reparte el aire por definición. **+17,7 % de área de media
en las 47**, sin redibujar nada, y todas al mismo tamaño óptico por construcción —
que es literalmente lo que el encargo exige y un encaje cuadrado no puede dar.

### El detector de rojo se comía el trazo

El usuario reportó «la línea del abdomen desaparece» en Plancha y Hueco abdominal, y
«contorno difuso» en tres piezas de manos. **Era el mismo bug**: el detector era
sólo de TONO (`r − max(g,b) > 18`) y la tinta de estos grabados es **sepia**. Medido:
entre el **39 % y el 43 %** de lo marcado como «rojo» era trazo (lum < 120).

Arreglado con un **suelo de luminancia**. Recuperación de trazo firme: Círculos de
muñeca **+208 %**, Extensión de dedos **+180 %**, Hueco abdominal **+132 %** — y la
pieza que el usuario usó como referencia por verse bien, Estiramiento de muñeca,
sólo **+28 %**. El orden confirma el diagnóstico.

### La miniatura tiene su propio archivo

A 30 px la máscara grande no funciona y no es cuestión de ajustes: una línea de un
píxel promediada 25 veces se vuelve gris. Subir el contraste del asset grande para
arreglar el pequeño estropearía el grande — **comprobado a los tres tamaños** antes
de decidir. Así que la ingesta genera un **`.min.webp`** con el trazo engordado
(dilatación separable ANTES de reducir) y el contraste al límite, y
`exerciseMaskUrl(name, size)` lo prefiere por debajo de 40 px.

---

## 4 · La asignación de los 49 dibujos

La carpeta traía **77 PNG, 49 únicos**, con nombres opacos del generador. Primera
pasada: miré hojas a 300 px y me planté en «no adivino» con 11 asignados. El usuario
insistió. Con **560–760 px por pieza y la descripción del encargo al lado**, casi
todas se resuelven **con evidencia**: el encargo cita una marca concreta (dos flechas
juntándose, círculo punteado, flecha doble) y el dibujo la lleva o no.

Los dos que daba por perdidos los resolvió el **hash, no el ojo**: `18` y `28` eran
los dos PNG originales ya ingestados, lo que además fijó `32`.

**Quedan 2 sin identificar** (`09`, `14`) y **14 identidades sin arte**.

---

## 5 · Los tests que caducaron

`glifos-mascara-ejercicio.spec.js` se reescribió **dos veces en la misma sesión**:

- v1 (s166) exigía el mapa **VACÍO** — premisa muerta al entrar el primer dibujo.
- v2 la cambió por «estos dos pasos concretos no tienen máscara»… y caducó **el
  mismo día**, al ingestar 47 de golpe. Su guard saltó y lo dijo, que es para lo
  que estaba, pero **el patrón era el defectuoso**: atar un aserto a un nombre que
  el proyecto está rellenando a propósito es firmar su caducidad.
- v3 no nombra a nadie: lee cada fila del preview, pregunta al mapa qué debería
  pintar y exige que coincida. Vale con 0 máscaras y con 61. Calibrado en rojo.

---

## 6 · Verificación

`npm run verify` PASA · `npm run test:e2e` **97/97** · `PACE_standalone.html`
intacto en v0.71.0 · auditoría geométrica de las 47: **0 fuera del círculo**,
radio 84,5–85,2 sobre un tope de 94,5.

## 7 · NO cubierto

- El **emisor** de `session.completed` (PASO 2 de la Fase 3) no está escrito.
- Las 2 piezas sin identificar y las 14 sin arte.
- **17 de los 47 glifos son «media-alta»**: la postura casa pero al dibujo le falta
  el mueble (silla, mesa) que el encargo pide. Funcionan, pero pierden el contexto
  de oficina que es la identidad del producto.
- Nadie ha mirado los glifos nuevos **en móvil**.
- El `activeSeconds` de **Respira** no se tocó: ya lo tenía.
