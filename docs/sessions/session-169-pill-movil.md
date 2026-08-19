# s169 · La pill vuelve a móvil, y el censo que miraba el sitio equivocado

**v0.99.0** · 2026-08-18 · desde v0.98.0 (`79bc5ab`)

> **Sesión cortada por límite de tokens y cerrada en una pasada posterior.**
> De las cuatro decisiones que traía el handoff de s168 se implementan **dos**:
> **A** (la pill) y **C** (el encargo de glifos). **B** no pedía código, y **D**
> (el `apt` del CI) queda **decidida y sin hacer** — sigue en
> [`HANDOFF_s169.md`](../HANDOFF_s169.md) con sus medidas.

---

## 1 · Lo entregado

| Frente | Qué |
|---|---|
| **La pill** | Foco/Pausa/Larga vuelve a verse en móvil, en **su propia fila y arriba**, tras una media query con **dos suelos** (`min-width: 390` y `min-height: 760`) |
| **Red de seguridad** | `tests/topbar-pill-movil.spec.js` — **11 tests**, calibrados en rojo antes de darlos por buenos. La suite pasa de 81 a **92** |
| **Encargo de glifos** | Decía que faltaban **38** y faltan **19**: las entregadas quedan marcadas, la cuenta cierra por biyección y el equinoccio sube a **Prioridad 1** |
| **Docs** | La nota de `docs/WORKFLOW.md` que daba `gh` por no instalado, corregida contra la máquina |

Lo que **no** cambia: la regla de s46 sigue siendo el **defecto**. Si no hay
sitio, la pill no aparece y el BreakMenu sigue proponiendo modo al terminar el
Pomodoro. Las dos cosas conviven, no se sustituyen.

---

## 2 · La pregunta de s168 estaba mal hecha, y su respuesta seguía valiendo

s168 preguntó **a partir de qué altura cabe la pill**, midió 15 combinaciones y
no se movió nada en ninguna. La conclusión que sacó es la buena y hay que
repetirla aquí porque es la que gobierna el arreglo: `[data-pace-tabs]` es
`position: absolute` centrada (`TopBar.jsx:46-48`), o sea **fuera de flujo**. No
empuja, no encoge y no puede cambiar el alto de la fila. Lo único que puede
hacer es **solaparse** con los iconos, y lo hace idéntico de 568 a 932 px de
alto. Sólo se limpiaría por encima de **~560 px de ancho**, que ningún teléfono
alcanza en vertical.

Por eso el arreglo no es «dejar sitio»: es **sacarla de la fila de los iconos**.

---

## 3 · Los dos suelos, y de qué medida sale cada uno

El gate no es un breakpoint: son dos umbrales de origen distinto, y conviene no
mezclarlos al tocarlos.

**ALTO ≥ 760 — lo pone el aro.** Darle su propia línea cuesta **+42 px** de
topbar (34 de pill + 8 de hueco) y esos 42 px salen del aro de la home. Barrido
de 9 anchos (320–768) × 8 alturas, **A/B en el mismo viewport**: a 736 el aro
paga 4 px a 412, 20 a 428 y 30 a 440; **a 760 ya es gratis en todos los
anchos**.

**ANCHO ≥ 390 — lo pone el botón de menú.** Este suelo no tiene nada que ver
con el aro. La pill mide 244 px fijos y va centrada, así que su hueco con el
botón «Abrir panel» es `ancho / 2 − 175,5`:

| ancho | hueco con «Abrir panel» |
|---|---|
| 320 | **lo pisa 15 px** |
| 360 | 5 px |
| 375 | 12 px |
| 390 | 20 px |

El usuario descartó los 12 px de 375 por justos ⇒ el suelo es **390**, y por
debajo la pill sencillamente no aparece.

### Dos correcciones al handoff de s168, medidas

- **«alto ≥ 844» no era el umbral.** Era la siguiente altura que s168 había
  medido. El real es **760**.
- **«squeeze == 0» no sirve de gate.** Primero porque `--pace-home-squeeze` es
  una custom property que fija el JS y **una media query no lee custom
  properties**; y segundo porque vale 0 **exactamente desde 736**, o sea justo
  por debajo del umbral bueno.

---

## 4 · El defecto que se escapó: un censo que mira el sitio equivocado

El banco de s168 cruzaba `[data-pace-topbar] > *`. Mi primera sonda cruzaba
`[data-pace-topbar-icon]`. **Las dos daban cero solapes a 320 px mientras la
pill pisaba el botón de menú 15×34 px** — porque ese botón **no es hijo de la
topbar**.

Es la forma más barata de creerse a salvo: un censo que mira donde no está el
problema **dice «limpio» con la misma cara** que uno que mira donde sí. La sonda
del spec cruza ahora **todos** los `button, a, [role=button]` del documento, no
un subárbol.

De ahí salió el suelo de ancho, que en el handoff de s168 no existía.

---

## 5 · La pill va ARRIBA, y eso no es estético

El DOM la tiene **antes** que los iconos (`TopBar.jsx`). Ponerla en la segunda
fila haría que el foco recorriera la topbar **de abajo arriba** — WCAG 2.4.3, el
defecto exacto que s160 arregló en la home. Con la pill arriba, orden visual y
orden del DOM coinciden **sin tocar el JSX**.

Y ninguna prueba se habría enterado: `home-a11y.spec.js` defiende ese invariante
**sólo dentro de `[data-pace-home-stack]`**, filtrando la topbar a propósito. Por
eso el orden de foco de la topbar se aserta en el spec nuevo.

Mecánicamente: `align-items: flex-end` + `padding-top: calc(10px − 4px ×
squeeze + 42px)` en la topbar; la pill sigue siendo `absolute` pero **sólo se
recentra en X** (`translateX(-50%)`), y su Y la fija el padding — el `top: 50%`
de una fila que ahora mide 102 px la dejaría encima de los iconos.

---

## 6 · Lo que el spec aserta (11 tests, los 11 calibrados en rojo)

- **Cero solape con cualquier control** del documento, en las 9 combinaciones.
- **Hueco mínimo de 16 px** con el vecino de su fila. Es un umbral de
  **criterio**, no de medida: 12 px los descartó el usuario y 20 px es lo que
  deja el ancho más estrecho que pasa.
- **El aro no encoge**, medido **A/B en el mismo viewport** (con la pill y con
  la pill forzada a `display:none`), no contra una constante escrita en el test
  — que caducaría en cuanto cambie la geometría.
- **El orden de foco dentro de la topbar**, que ninguna otra prueba mira.
- **No regresión en escritorio**: la pill sigue visible y centrada.

Calibración: bajando el suelo a 320 salieron los tres rojos esperados **con su
mensaje** («queda a 12 px de Abrir panel», «pisa controles a 320x800»).

---

## 7 · El CI: el diagnóstico de s168 estaba mal, y lo corrigió el log

Esto **no se ha ejecutado** — es la decisión D del handoff, que sigue pendiente.
Pero se midió aquí y cambia **la razón** del cambio, no sólo el cambio, así que
queda escrito.

Primero un hecho de la máquina: **`gh` está instalado y autenticado**. s153 lo
dio por ausente y la nota se arrastraba en `docs/WORKFLOW.md` (corregida en esta
sesión). Es lo que permitió leer los logs paso a paso de los 11 últimos runs.

**La cola no era la descarga de Chromium. Era `apt` bajando 21,1 MB de fuentes.**

| run | descarga de Chromium | `apt` bajando fuentes | paso entero |
|---|---|---|---|
| 7 runs rápidos | ~10 s | 0–6 s | 21–28 s |
| el de 672 s | ~11 s | **10 min 49 s** | 672 s |
| el de 217 s (**fallo** de caché) | ~9 s | **3 min 15 s** | 217 s |
| acierto | omitida | **1 min 21 s** | 97 s |
| acierto | omitida | **42 s** | 55 s |

Los **mismos 9 paquetes** (CJK, cirílico, `xfonts-*`) se instalan en **todos**
los runs, con caché y sin ella; todas las librerías del navegador dicen `already
the newest version`, o sea que ya están en la imagen. Por tanto la caché —que
sólo guarda `~/.cache/ms-playwright`— **como mucho ahorra los ~10 s del
binario** y **no puede tocar la cola**, que de hecho volvió a salir en el run
con **fallo** de caché. El comentario del YAML que dice lo contrario es falso.

---
## 8 · C · el equinoccio sube, y al comprobarlo el trabajo creció

La decisión era **mover una fila**. Al medir por qué hacía falta salió algo
mayor: **el encargo decía «los 38 glifos de LOGRO que faltan» y ya sólo faltan
19.** El cálculo era de s164; **s167 entregó 19 y nadie volvió a tocar esa
lista**, así que quien la abriera para ponerse a dibujar se encontraría **la
mitad del trabajo ya hecho**, sin nada que lo marcara. Es la misma deriva que
s168 cazó en `CONTENT.md` (100/92 contra 96/88), pero ésta se paga en horas de
dibujo.

El saneado se hizo **cruzando id a id el documento contra el mapa de máscaras
real**, no de memoria, y la cuenta cierra por **biyección**:

```
catalogo 96 · con arte 77 · sin arte 19
filas 38 = dibujadas 19 + sin arte 19
ids fantasma: 0 · sin arte y no listados: 0
filas con la MARCA equivocada: 0
```

Las cuatro líneas importan por separado. «Ids fantasma» caza filas que ya no
existen en el catálogo; «sin arte y no listados» caza lo contrario —logros que
faltan y el documento **no menciona**, que es el fallo por omisión, el que no se
ve leyendo—; y la última compara **la marca del documento contra el arte real**,
que es lo único que impide que el saneado de hoy sea la mentira de mañana.

### El equinoccio entra en un hueco que estaba libre

`§2 · Prioridad 1` tenía **una sola fila**, `hydrate.week.perfect`, **y también
estaba entregada**. Así que el equinoccio no hubo que colarlo por encima de
nadie.

Y su motivo no es que su sello falle —el `⚖` de texto aguanta solo— sino **el
par**: `season.equinox.spring` **sí** tiene balanza dibujada
(`achievement-masks.js:98`), los dos viven en `estacionales`, son **adyacentes en
el catálogo** (`catalog.js:161-162`) y comparten el mismo carácter de respaldo.
En el panel se ven **uno al lado del otro con dos sistemas visuales distintos**.
De los 19 que faltan es el único **desparejado**; los demás son huecos sueltos.

De paso, el bloque «**estos dos van al final de la cola**» de la §5 **ya no
aplicaba a nadie**: `master.extra.all.week` y `master.midnight.never` están
entregados. Se conserva el criterio —no tienen detector, así que su sello se
pinta «Pronto» aunque llegue el arte— porque volverá a servir.

### El propio cruce cazó un defecto mío

Al mover `hydrate.week.perfect` a una nota en prosa **dejó de ser fila de
tabla**: la biyección cayó a **37 = 18 + 19** contra una cabecera que yo acababa
de escribir diciendo 38. La fila vuelve a la tabla, tachada. Sin el cruce, el
documento habría quedado afirmando un número que él mismo desmentía.

---


## 9 · Trampas de esta sesión

- **Backticks en `_responsive.pieles.js`**, la trampa que su **propia cabecera**
  documenta (s139, s156, s157, s158, s162 — y ahora s169). El build aborta con
  un error de sintaxis en la línea del **comentario**. Escribiendo CSS ahí
  dentro no se usa ni un backtick, tampoco en comentarios.
- **Un banco con guard puede negarse a medir la implementación.**
  `banco-pill-movil.js` aborta con «BANCO ROTO: la pill ya se ve sin forzarla»
  ahora que la pill se ve. El guard es correcto y el banco ya no sirve para
  medir este gate: el A/B se hizo con un script aparte.
- **Un script en el scratchpad no resuelve `require('playwright')`** — hay que
  requerirlo por ruta absoluta al `node_modules` del proyecto.
- El **servidor estático seguía levantado** en 8765 de antes; arrancar otro da
  `EADDRINUSE` y el fallo es del arranque, no del script que lo usa.

---

## 10 · Verificación

- `npm run verify` **PASA** — 0 problemas en 8,7 s, 1 aviso (el `[INFO]` de
  siempre: el build reescribe el standalone y se restaura).
- **Regla §1**: `_responsive.pieles.js` queda en **478 de 500** tras ganar 61
  líneas. Ninguno de los 175 archivos medidos pasa del límite y la deuda sigue
  vacía.
- `index.html` del disco **= build de las fuentes** (`53800C9DCE60E2B7`).
- `npm run test:e2e` **92/92** en 1,2 min, sobre el artefacto ya regenerado
  (81 + los 11 nuevos).
- `PACE_standalone.html` **intacto en v0.71.0**, byte a byte (`998E3E35…`).
  Restaurado a mano tras el build manual: el `verify` sólo lo restaura alrededor
  de **su** pasada (la torpeza de s162).
- Versión **v0.99.0** coherente en los 7 sitios.

---

## 11 · Lo que NO se cubre

- **Ni un píxel comparado.** La suite mide rectángulos y orden de foco; que la
  pill se **vea bien** en un teléfono real no lo prueba nadie.
- **Sin mirar en inglés ni en paleta oscura.** Las etiquetas son más largas en
  inglés y la pill mide 244 px **fijos**: si el texto no cupiera, el aserto de
  solape seguiría en verde.
- **Sin teléfono real**: todo es viewport emulado.
- **Los suelos son de hoy.** Si la topbar o el botón de menú cambian de tamaño,
  el 390 y el 760 dejan de ser los buenos — y el spec lo dirá en rojo, que es
  justo para lo que está.
- ~~**D sigue sin hacer**~~ **hecha después de v0.99.0**, en su propio commit
  (`d14d2a2`) y observada en verde. Ver § 12.
- **El encargo saneado NO prueba que los 19 dibujos sean buenos.** Cruza ids
  contra el mapa de máscaras; que una máscara exista no dice **nada** de si el
  dibujo se lee a 56 px — eso es la revisión a tamaño real, y es del usuario.
- ~~**El cruce del encargo no está en la red de seguridad**~~ **ya lo está**:
  `scripts/verify.encargo.js`, escrito justo después. Ver § 12.
- Sigue vivo lo de siempre: los **19 logros sin arte**, los **glifos de
  ejercicio** (mecanismo listo desde s166, nunca corrido sobre arte real), el
  **tirón del arco**, **D3**, la **Fase 2 de `pace.events.v1`**, **Wrangler** y
  **proteger `main`** — que ahora es más fácil, porque `gh` está disponible.

---

## 12 · Después de v0.99.0 · D y el checker del encargo

Dos commits sin bump, porque ninguno toca la app.

### D · el `apt`, fuera de los dos caminos (`d14d2a2`)

`npx playwright install --with-deps chromium` pierde el `--with-deps` y
desaparece el paso «Librerías de sistema» condicionado a `cache-hit == 'true'`.
El bloque de comentario se reescribe con la tabla medida.

**Observado en verde, no supuesto.** Comparando el run de v0.99.0 (`05a113a`)
con el de D (`d14d2a2`), los dos con acierto de caché:

| paso | antes | después |
|---|---:|---:|
| Caché de Chromium | 6 s | 3 s |
| Instalar Chromium | 0 s (acierto) | 0 s (saltado) |
| **Librerías de sistema** | **14 s** | **no existe** |
| `npm run test:e2e` | 92 s | 91 s |
| **job entero** | **121 s** | **101 s** |

Y una corrección al dato de s168 que sale de aquí: **el paso no era caro, era
variable.** s168 lo midió en 94 s; en el run de v0.99.0 costó **14 s**. Lo que se
quita no es un coste medio de 94 s sino la **varianza** — de 14 s a 10 min 49 s.
El riesgo asumido se cumplió sin incidente: **Chromium arrancó sin las fuentes
CJK ni cirílicas y los 92 tests pasaron.**

**El hueco que queda, dicho y no tapado:** ese run fue **acierto** de caché, así
que el camino de **fallo** —`npx playwright install chromium` ya sin
`--with-deps`— **no se ha ejercitado nunca**, y es el arriesgado. Sólo ocurre al
cambiar `package-lock.json`. Se fuerza borrando la caché y lanzando un
`workflow_dispatch`.

### El checker · `scripts/verify.encargo.js`

C dejó el documento saneado **a mano**, y eso es exactamente lo que ya falló:
nadie vuelve a mirar. Ahora lo mira el `verify`, con **cuatro comprobaciones
relacionales** —ningún número vive dentro— y su **guard de cero**:

1. **Ids fantasma**: filas que piden dibujar algo que ya no está en el catálogo.
2. **El fallo por omisión**: un logro sin arte que el documento **no menciona**.
   Éste no se ve leyendo la lista, y por eso hay una comprobación por sentido y
   no una sola.
3. **La marca contra el mapa real**, en las dos direcciones: fila sin marcar cuyo
   dibujo ya existe, y fila marcada `ENTREGADO` sin máscara.
4. **La cifra de la cabecera** contra los que faltan de verdad — la afirmación
   del documento es lo que está bajo prueba, no la medida.

El guard de cero no es adorno: la detección de filas es una expresión regular
sobre la tabla, así que **cambiar el formato apagaría las cuatro en silencio**.

**Los 7 rojos, verificados uno a uno**, cada uno con su mensaje propio y el
documento restaurado después: guard de cero · id fantasma · logro sin arte no
listado · fila sin marcar ya dibujada · marca falsa · cifra equivocada · cabecera
sin cifra.

Detalle de implementación con historia: `chequeaLogros()` devolvía sólo el mapa
de máscaras y ahora devuelve `{ MASK, CAT }`. Se amplía el retorno en vez de
cargar el sandbox otra vez desde el módulo nuevo — **duplicar la carga fue el
defecto de `revision-glifos.js` que s168 tuvo que arreglar**.

De paso se retira una cifra obsoleta: `STATE.md` y el YAML del CI decían que el
verify tiene «**32 comprobaciones**», censo de s152 que **ya estaba mal en dos**
antes de esta sesión (s168 añadió 2, s169 otras 4). Se quita el número en lugar
de re-contarlo: es justo la clase de cifra que nadie mantiene, que es el mismo
problema que acaba de arreglar el checker.

---

## 13 · v0.99.1 · el backup lleva `pace.events.v1`, y lo devuelve

Arranca la **Fase 2 de `pace.events.v1`** por su **condición de entrada**, puesta
**antes** que el primer emisor a propósito: así el gate del `verify` no puede
pillar a nadie a mitad de camino.

### No era añadir un campo al export

`privacy.html` promete exportar «todo tu estado ... **e importarlo en otro
dispositivo**». La segunda mitad es la que mandaba: **el import tiraba el
historial**, y su comentario lo razonaba bien — *«un backup de PACE no trae
sección de eventos»*, así que reiniciaba el contenedor para evitar la MEZCLA de
§17. Esa frase caduca el día que exista un emisor. Exportar historial que al
restaurar se descarta habría sido **peor** que no exportarlo.

Así que las dos mitades se movieron juntas, con tres caminos:

| el backup… | qué pasa |
|---|---|
| **trae sección** | se **reemplaza** por completo (sin merge, sin deduplicar, idempotente) |
| **no la trae** (todos los anteriores) | se **reinicia**, exactamente como antes |
| **la trae corrupta** | se aborta el import **entero**, y eso incluye **no escribir `pace.state.v2`** |

El tercero es el que importa. El fallo tentador es descartar la sección mala y
«al menos salvar el estado» — y eso deja al usuario con **estado nuevo e
historial ajeno**, que es justo la mezcla que todo el diseño evita. La validación
vive **en la barrera** y no en el llamador, porque es quien puede garantizar el
«antes de tocar nada» de §17.

La sección va **hermana** de `state` y no dentro: son dos almacenes con ciclos de
vida independientes (s155) y mezclarlos en el JSON invitaría a escribirlos como
si fueran uno.

### 3 asertos (92 → 95), los 3 en rojo primero

El primero lee **el archivo que el navegador descarga de verdad**, no el objeto
que lo construye: lo que el usuario se lleva es el archivo. El segundo parte de
**8** eventos y espera **3**, para que reinicio (0) y fusión (11) fallen los dos.

### Dos mentiras del instrumento, y una trampa propia

- **Comparar `pace.state.v2` entero salió rojo con el producto sano.** La app
  normaliza y **re-persiste** su propio estado al arrancar, así que el documento
  cambia sin que nadie importe nada. Comparar un documento que la app también
  escribe **no es** comprobar que el import no escribió. Ahora se miran los
  campos que el backup habría cambiado.
- **Dos esperas aguardaban sólo el desenlace bueno**, así que con el producto
  roto daban `Timeout 15000ms exceeded` y ni una palabra más. Reescritas para
  esperar a que el estado **cambie** (T2) y para **correr los dos desenlaces**
  (T3). Con eso las tres mutaciones caen con su mensaje propio.
- **La trampa propia, y cara:** el primer script de calibración restauraba las
  mutaciones con `git checkout -- <archivo>` sobre dos archivos cuya línea base
  **no estaba committeada**. Los devolvió a HEAD y **borró la implementación
  entera**; los tres tests pasaron a rojo por **ausencia de producto**, no por el
  aserto. `git checkout` restaura al **último commit**, no a como estaba hace un
  minuto. Rehecho restaurando desde una copia en el scratchpad.

### Lo que queda de la Fase 2

Los **cuatro emisores**. El terreno está reconocido y anotado en `STATE.md`: no
viven en la UI sino en la capa de estado, y **el trabajo real no es llamar a
`paceEventsAppend`** sino que esas funciones reciben hoy **minutos** y el payload
pide `activeSeconds`, `plannedSeconds` con su origen, `completionReason`,
`variant` y `runId`.
