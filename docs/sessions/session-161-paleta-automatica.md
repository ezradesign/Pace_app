# Sesión 161 — La paleta sigue al sistema, salvo cuando el aro es el sol

**v0.91.0 → v0.92.0** · 2026-08-08

> El encargo traía tres puntos y el orden habitual: **medir → entender →
> proponer → esperar elección → implementar**. Se cierran el **1** (día/noche
> automático, con las cuatro decisiones elegidas por el usuario) y el **3** (los
> enlaces rotos del CHANGELOG), y se abre un frente que no estaba en el encargo:
> **el CI llevaba dos versiones en rojo** mientras s159 y s160 cerraron
> declarando verde. El **punto 2 —diagnóstico de Respira— NO se abrió**, y es la
> segunda sesión seguida que se queda fuera.
>
> **El Pomodoro sigue en pausa**: no se ha tocado la atmósfera, la curva, los
> tokens `--sun-*`, la cola, la pausa, el remapeo del arco ni el tirón. **La
> única excepción es `interpolateRingColor`**, que es código del arco y se tocó
> **con autorización expresa del usuario**, después de presentárselo como
> decisión suya: su parser suponía hexadecimal y era lo que impedía que dos
> tokens entraran al fundido.

---

## 0 · El CI estaba rojo, y las dos sesiones anteriores no se enteraron

El usuario lo vio en una captura de GitHub Actions: los runs **#7 (v0.90.0)** y
**#8 (v0.91.0)** en rojo. s159 y s160 cerraron diciendo «verify PASA» y «e2e
PASA» — y era **verdad en local**. Lo verde que declararon nunca fue el CI.

`gh` no estaba instalado, pero **el repositorio es público** y la API de *jobs*
responde sin auth. Eso bastó para localizar el rojo sin adivinar:

| | #7 | #8 |
|---|---|---|
| job `verify` | verde | verde |
| job `e2e` (`npm run test:e2e`) | **ROJO** | **ROJO** |

Reproducido el job `verify` paso a paso en local: `npm run verify` pasa, y el
`index.html` **committeado** coincide byte a byte con el build de las fuentes.
O sea que lo que falla es **comportamiento en Linux**, no frescura ni sintaxis.

Tres hipótesis, **las tres descartadas midiendo**:

- **¿los 2 workers del CI?** No: `CI=true` en local da **58/58 y en 39,1 s**
  — con menos workers los tests van *más rápido*, no más lentos.
- **¿mayúsculas de rutas?** Linux distingue y Windows no. Contrastadas las
  **109 rutas de `PACE.html` y las 84 del precache de `sw.js`** contra el
  nombre real leyendo el directorio (en Windows `existsSync` miente): **cero
  desajustes**.
- **¿el lockfile?** No cambia desde s154, con el CI verde en las cuatro pasadas
  siguientes.

**Cerrado en la misma sesión**, en cuanto el usuario se autenticó: el log dio
la causa en un comando. **2 tests de `home-luz`**, los dos por lo mismo.

`--pace-on` **no es un booleano**: es el interruptor de la luz y se **funde en
1,6 s** (s159). Los dos tests lo leían **justo después de que apareciera
`data-pace-dial-running`** y exigían `> 0`. Medida su curva:

| momento | `--pace-on` |
|---|---|
| justo tras el atributo | **0 exacto** |
| +50 ms | 0,0039 |
| +100 ms | 0,028 |
| +300 ms | 0,373 |
| +800 ms | 0,979 |

O sea que el resultado dependía de si el viaje de ida y vuelta de Playwright
dejaba pasar un frame. En local casi siempre lo dejaba; **en el runner de Linux
caía en el mismo frame**. Dos versiones en rojo por un test que muestreaba un
fundido en su primer instante.

**Se espera a que encienda (`expect.poll`), no se baja el listón**: el contrato
asertado sigue siendo «arrancar un bloque enciende la luz», y **los dos siguen
mordiendo** — comprobado saboteando `publicarLuz` para que `--pace-on` valga
siempre 0, con el artefacto restaurado byte a byte.

**Y cae una suposición heredada**: s159 anotó que `page.clock` congela el
fundido de 1,6 s. Medida la curva con y sin reloj virtual, **es idéntica**.

**Cerrado de verdad, y observado**: empujado el commit, el **run #9 termina en
SUCCESS los dos jobs**. El conteo se lee **en el log** —`65 passed (56.0s)`— y
no se infiere, que es justo la deuda que s154 dejó anotada: entonces el «13
passed» del runner nunca llegó a verse porque los logs daban 403 sin auth.

**La lección, que es de proceso**: «la suite pasa» es una frase sobre una
máquina. Desde s153 el CI existe precisamente porque simular no es ejecutar —
y dos sesiones seguidas cerraron sin mirarlo.

---

## 1 · Día/noche automático: lo que se midió antes de proponer nada

El encargo pedía tener delante tres cosas ya existentes, y las tres se
verificaron **en el código**, no de memoria:

- `detectInitialPalette()` (`state-core.support.jsx:43`) solo se llama en la
  rama **sin `raw`** de `loadState` y en su `catch`. El comentario de s89 dice
  literalmente que «no re-sigue cambios del SO en caliente».
- `langAuto: false` en `defaultState` con su porqué escrito, y `true` **solo**
  en la rama de instalación nueva, resuelto en cada arranque.
- La paleta son dos pills, pero **no como el idioma**: vive en el array
  genérico `ejes` de `TweaksPanel.jsx`, mientras `lang` tiene bloque propio.

### El cambio de paleta NO era un corte seco

Medido en el artefacto real a 1280×720, con `getAnimations()` (lo único que
distingue «salta» de «se funde») y **control positivo** —una cobaya con
transición de 900 ms que tiene que aparecer, y aparece—:

- **28 tokens** cambian de valor entre paletas (26 colores + 2 números). **No
  ~40**, que era la estimación del encargo.
- Eso mueve **1875 declaraciones computadas** sobre 87 nodos: **88 se funden y
  1787 saltan** (94 %). Estable en tres pasadas.
- Y las 88 lo hacen a **cuatro velocidades a la vez**: 180 ms (68), 200 (7),
  220 (35) y los 320 del `body` (2).

O sea que lo que había no era un corte: era un borrón.

### El coste de las cuatro alternativas

Ventana de 1100 ms, muestreo por rAF, **control negativo** (`nada`: misma
ventana, sin cambiar de paleta) para poder atribuir:

| | Pomodoro PARADO | | | CORRIENDO | | |
|---|---|---|---|---|---|---|
| | frames | peor | >32 ms | frames | peor | >32 ms |
| `nada` (control) | 67 | 16,8 | 0 | 66 | 16,8 | 0 |
| corte seco (lo de hoy) | 66 | 16,8 | 0 | 52 | 50,0 | 10 |
| **@property** | **66** | **16,7** | **0** | 32 | 50,1 | 21 |
| @property sin `--sun-*` | 66 | 16,7 | 0 | 37 | 50,1 | 21 |
| View Transitions | 53 | 50,0 | 12 | 42 | 116,8 | 14 |
| velo superpuesto | 67 | 16,8 | 0 | 49 | 50,1 | 10 |

Tres cosas que **solo salen con el control delante**:

1. Con el Pomodoro parado, fundir los tokens es **gratis**: 66 frames contra 67
   del control, cero frames largos, 34 pasos de interpolación.
2. Con sesión viva **cuesta hasta el corte seco** (52 contra 66). El coste no lo
   trae la transición: lo trae invalidar los `--sun-*` con el halo encendido.
3. Registrar los tokens y **no cambiar nada** cuesta **cero**: 66 frames con
   sesión viva, idéntico al control.

**reduced-motion**: el kill de `tokens.css:374` las neutraliza solo, sin caso
especial (16–33 ms). La excepción es View Transitions, que **sigue pagando el
snapshot** (10 frames largos) aunque su animación esté muerta.

### La medida que decidió (b)

A la misma hora, las dos paletas no son el mismo sol con otro papel:
`--sun-noon-core` va de alfa **0,70 a 0,30**, y **`--sun-shade` y `--sun-cast`
valen exactamente CERO en oscuro** (decisión consciente de s158). En claro la
sombra es *cómo se pinta la luz*. Cambiar el papel a mitad de bloque no atenúa
el sol: **le quita la sombra y la proyección**.

### Lo que eligió el usuario

| | elección |
|---|---|
| (a) disparador | **por sistema, en caliente** |
| (b) durante un bloque | **suspender y aplicar al terminar** |
| (c) control en Ajustes | **tercera pill «Auto»** |
| (d) transición | **fundido de tokens, ~640 ms** |

Sobre (a), el argumento que no es preferencia: **esta app ya tiene un día, y
dura 25 minutos**. `--pace-k` recorre amanecer → mediodía → noche dentro de cada
bloque. Una paleta por hora del reloj metería un **segundo ciclo de día a otra
velocidad**: a las 19:00 el papel sería noche mientras el aro amanece.

---

## 2 · Dos comprobaciones ANTES de implementar, no después

**¿Declarar una transición en `:root` reintroduce lo de s160?** El aro y sus
cuatro nodos llevan `transition-property: none` desde s160, así que en principio
no — pero eso se mide:

| condición | aro | `--pace-dial-d` | `--pace-horizon` | scroll |
|---|---|---|---|---|
| sin hoja | 406 | 406px | 65px | 0 |
| **con la hoja** | **406** | **406px** | **65px** | **0** |
| control: `transition:all` en el aro | 417,8 | **420px** | 67px | 0 |

Idéntico con y sin reduced-motion, y **el control positivo reproduce la firma
exacta de s160** (420 px): la sonda ve el defecto.

**¿Hay sol que fundir en reposo?** No: con el Pomodoro parado `--pace-on` vale
`0`, el halo computa `background-image: none` y el grid no tiene ni filtro ni
sombra. Los 11 `--sun-*` se quedan fuera de la lista.

---

## 3 · El defecto de s159 otra vez, en otra superficie

Con el token fundiéndose a 640 ms, **cualquier nodo con transición propia sobre
una propiedad de color persigue a un valor que se mueve** — y una transición
cuyo destino cambia en cada frame **se reinicia en cada frame**: deja de ser un
fundido de 320 ms y pasa a ser un filtro que se queda muy atrás.

Medido en el `body`: el token ya en `rgb(29,26,20)` mientras el body pintaba
`rgb(212,207,195)` — **188 unidades RGB**. Y como las tarjetas pintan con estilo
**inline** (sin transición, o sea siguiendo al token exacto), el resultado era
**el fondo claro con las tarjetas ya oscuras**.

La primera medida del arrastre **no valía**: comparaba el `color` de cada
seguidor contra `--ink` cuando la mayoría pinta con `--ink-2` o `--ink-3`, así
que los «211 de desfase» eran la distancia entre dos tokens distintos. Se cazó
porque el número salía **idéntico en las cuatro condiciones, control incluido**.

Con el instrumento bueno (`getAnimations()` + una **verdad de campo** con todos
los seguidores muertos):

| condición | persiguiendo (pico) | desviación vs verdad |
|---|---|---|
| verdad de campo | 0 | 0 |
| tal como se implementó primero | 112 | **237** |
| sin transición en `body` | 110 | 160 |
| **+ supresión durante el cruce** | 24 | **15** |
| control: la regla sin marcar el flag | 110 | 160 |

El control vuelve exactamente a los números de antes ⇒ **lo que arregla es el
mecanismo, no la presencia de la regla**. No baja a cero a propósito: los
subárboles `data-pace-essential` quedan fuera (WCAG 2.3.3, misma excepción que
el kill de reduced-motion).

---

## 4 · Registrar `--breathe` apagaba la atmósfera del Pomodoro

Lo cazó la suite: dos tests de `home-luz` que pasaban en HEAD y fallaban con el
cambio. **Confirmado que era regresión propia y no previa** sirviendo el
`index.html` de HEAD (la lección de s156 y s159).

Bisecando el cambio en tres piezas, luego familia a familia, luego token a
token: **`--breathe`**.

**El mecanismo**: un token registrado con `@property` deja de valer su texto
literal y pasa a valer su forma **canónica** — `--breathe` deja de leerse
`#C97A5D` y se lee `rgb(201, 122, 93)`. Y `interpolateRingColor`
(`TimerDial.jsx:24-33`) lo lee con `getComputedStyle` y le aplica un `hexToRgb`
que hace `slice()` sobre dos dígitos por canal ⇒ **NaN** ⇒ `--pace-arco`
inválido ⇒ **el degradado entero del bloom caía a `background-image: none`**.

Registrar un color de MÓDULO apagaba la atmósfera del Pomodoro.

**Auditados los 15 candidatos**: solo `--breathe` y `--focus` tenían lector en
JS en todo `app/`, y los dos en la misma función. Los otros 13 se registran sin
riesgo.

### Y al final se arregló el LECTOR, no la lista

Primero se dejaron los dos fuera —lo conservador— y se le presentó al usuario
como decisión suya, porque tocar `interpolateRingColor` es tocar el **arco**,
que estaba en pausa. Lo autorizó, así que:

`aRgb` acepta ahora las dos formas —`#rrggbb`, `#rgb` y `rgb()`/`rgba()`— y, si
no reconoce ninguna, **devuelve un respaldo en vez de NaN**. Eso es lo que de
verdad cierra la clase de defecto: el modo de fallo pasa de «se apaga media home
en silencio» a «el arco usa su color por defecto». Con el lector arreglado
entran los quince tokens al fundido.

**`--move` y `--extra` siguen fuera, y no por descuido**: `interpolateRingColor`
también lee `--move`, así que añadirlos exigiría repetir la auditoría. Son
colores de módulo y no cambian con el papel lo bastante como para pagarlo.

**Aserto nuevo que lo consagra de frente.** El defecto lo había cazado la suite
**por rebote**, en una prueba de la luz; ahora hay uno que lo mira de cara y es
relacional (no dice de qué color es el arco, dice que **es un color**), con un
guard que exige que los tokens estén realmente registrados —si no, pasaría sin
tocar el caso que lo motiva—. **Su rojo costó tres intentos, los tres fallos
míos**: una cadena buscaba el regex con otro escapado del que emite Babel; otra
mutación —«que el respaldo devuelva NaN»— **no podía morder**, porque con el
parser bueno esa rama no se alcanza (romper *una* de las dos protecciones no
reproduce el defecto, que es justo para lo que están); y la tercera se escribió
a mano con los escapes mal. La buena **extrae la cadena del propio artefacto** y
revierte el arreglo entero: muerde con «el arco no es un color en crema».

---

## 5 · El guard de arranque: no reproducía, hasta que reprodujo

El fundido en `:root` crea un riesgo: si el papel se aplica **después** de que
el navegador haya computado `:root` en claro, cada arranque en oscuro sería un
cruce de 640 ms. Se puso un guard (`data-pace-palette-ready`, que `applyTheme`
añade tras la primera aplicación) — y luego hubo que **demostrar que hacía
falta**.

Tres intentos, y los dos primeros no valían:

1. Sonda por rAF: su primera muestra caía en **t≈1322 ms**, porque hasta que
   React monta **no hay frames**. Estaba calibrada (veía 35 pasos en un cambio
   normal) pero **no estaba mirando** durante el arranque.
2. Control positivo por `addInitScript`: reventaba con `Cannot read properties
   of null` — corría antes de que existiera `documentElement`.
3. **Control fiel**: servir el mismo artefacto con el selector del guard
   quitado. Resultado en `index.html`: **0 cruces en las dos condiciones**. El
   flash **no reproduce ahí**.

Pero en **`PACE.html`**, donde Babel procesa los módulos y `applyTheme()` corre
mucho más tarde: **15 cruces en el arranque sin guard** (el primero a 1377 ms
sobre `--ink-3`), **0 con él**. El guard se gana el sitio.

### Y el guard, tal como se escribió, no era fiable — lo destapó la suite

Con el guard puesto, la prueba del arranque **seguía fallando en la suite
completa** y pasando aislada: los **trece** tokens cruzando a la vez, con el
mismo `startTime` (613 ms en una pasada, 632 en otra). Tres cosas hicieron
falta para verlo:

1. **`data-palette` no cambia nunca** después del arranque. Un `MutationObserver`
   sobre `<html>` lo confirmó: en toda la vida de la página solo se añade el
   propio atributo del guard. Así que el cruce **no venía de un cambio de
   paleta**.
2. En una pasada limpia **no hay cruce**: `--paper` va de crema a oscuro a los
   46 ms con `ready=false`, y a los 1331 ms se añade el guard sin mover nada.
3. **La causa es una carrera, y mi propia sonda la tapaba.** El guard armaba la
   transición en el frame siguiente al `setAttribute('data-palette')`. Si el
   navegador **no había recalculado el estilo por su cuenta** en ese hueco —y
   bajo carga no lo hace—, el «estilo previo» que la transición toma como origen
   seguía siendo el de la paleta **clara**: armar la transición y aterrizar el
   papel oscuro caían en el **mismo recálculo** ⇒ cruce de 640 ms en cada
   arranque. La sonda con la que buscaba el defecto **leía estilo computado en
   cada tick**, o sea que **forzaba el recálculo y hacía desaparecer justo lo
   que iba a medir**.

El arreglo es una línea que parece inútil: leer `--paper` **antes** de armar la
transición. Esa lectura vacía el trabajo de estilo pendiente, así que el origen
ya es el papel definitivo y añadir el atributo no mueve nada. Es la octava
mentira del instrumento de la sesión, y la única que **fabricaba** el resultado
correcto en vez de esconderlo.

---

## 6 · La suite: 58 → 65, y tres rojos que no eran del producto

Siete pruebas nuevas en `tests/paleta-auto.spec.js`, todas **relacionales**:
ninguna dice de qué color es la paleta ni cuántos tokens cruzan.

Dos fallaron **solo en la suite completa** y pasaban aisladas. Con `retries: 0`
eso está diciendo algo, y hubo que escucharlo **tres veces**:

**(1) Ruido del instrumento.** La sonda del arranque filtraba por `--` a secas,
así que contaba también **`--pace-luz` y `--pace-nucleo`** —registrados con
`@property` desde s159 y transicionando con la luz del Pomodoro—. Con ocho
workers eso daba **1599 «cruces»** y aislada 0. Acotada a los tokens de paleta y
deduplicada por `(propiedad, startTime)`.

**(2) Un cruce REAL que era la función trabajando.** Ya deduplicada, seguía
fallando — y ahora con nombres: los **trece** tokens compartiendo `startTime`
613,22 ms. Eso no es ruido, es un cambio de paleta de verdad. Lo provocaba **el
montaje de la prueba**: con `paletteAuto: true`, `page.emulateMedia` **corre
contra la navegación**, y bajo carga la app llegaba a arrancar en claro,
resolvía `crema` y el modo Auto la pasaba a oscuro después. La prueba se
sembraba a sí misma el defecto que decía medir. Con la paleta guardada y **sin
Auto**, arrancar en oscuro es determinista.

**(3) El guard de cero mordiendo, y con razón.** La otra prueba pedía más de 10
frames con el cruce vivo y bajo ocho workers hubo **8**: los frames escasean. El
guard hizo exactamente su trabajo —avisar de que la muestra era fina—, así que
lo que se corrigió fue la **ventana** (900 → 1500 ms, el fundido dura 640) y no
la tolerancia. El umbral baja a 4, pero **entra un segundo guard en otro eje**:
que el token haya tomado más de 3 valores distintos. Contar frames mide cuánto
se miró; contar valores mide que lo mirado **se movía**.

**Trampa nueva documentada**: en el panel de Ajustes hay **dos** botones
«Automático» —el de idioma (s139) y el de paleta— y `getByRole` sin acotar
revienta por *strict mode*. La fila se acota por el hermano que solo ella tiene.

**Trampa nueva documentada**: en el panel de Ajustes hay **dos** botones
«Automático» —el de idioma (s139) y el de paleta— y `getByRole` sin acotar
revienta por *strict mode*. La fila se acota por el hermano que solo ella tiene.

---

## Verificación

- `npm run verify` **PASA**. El CENSO de i18n pidió subir 510 → 511 a mano, que
  es exactamente para lo que existe: la paridad ES/EN es **relacional** y pasó
  (511 = 511, biyectiva).
- **Banco de rojos: 6 de 6 mordieron**, cada uno corriendo **exactamente 1
  test** y con el artefacto restaurado **byte a byte**.
- La primera versión del banco **mintió dos veces**: las mutaciones de CSS
  buscaban la regla minificada (el artefacto conserva el formato) y, con
  `shell:true`, `-g` con espacios se partía — «1 failed · 24 passed» en un
  archivo de **seis** tests. Ahora se exige `Running 1 test`.

---

## El instrumento mintió siete veces

1. La primera versión del banco metía la hoja de `@property` **sin `id`** y la
   limpieza no la encontraba: tres candidatas distintas devolvieron **los mismos
   66 frames / 42 pasos / 733,3 ms**.
2. El censo decía «0 de 427 se funden» mientras otra sonda fotografiaba un
   fundido de 300 ms: `getComputedStyle` leído en la misma tarea del
   `setAttribute` devuelve el valor **destino** también para lo que transiciona.
3. La medida del arrastre comparaba cada seguidor contra `--ink` cuando pintan
   con `--ink-2`/`--ink-3`: los «211» eran distancia entre tokens, no retraso.
4. La sonda del flash por rAF no miraba durante el arranque (t≈1322 ms).
5. Su control positivo reventaba antes de existir `documentElement`.
6. El banco de rojos no aplicaba `-g` con `shell:true`.
7. La sonda del arranque en la suite contaba las transiciones de la **luz del
   Pomodoro** como si fueran cruces de paleta (1599 con ocho workers, 0 aislada).

Y dos de proceso: `Reiniciar bloque` solo se renderiza con `status === 'paused'`
(se buscaba sin pausar), y un run de la suite tardó **3,9 h** porque se solaparon
dos pasadas peleando por la máquina — sus resultados se descartaron enteros.

---

## Lo que NO se cubre

- **El CI sigue rojo** y su causa exacta sin leer: falta `gh auth login`, que es
  del usuario.
- **`--breathe` y `--focus` entran secos** en el cruce, a la espera de decisión.
- **El diagnóstico de Respira (punto 2 del encargo) NO se abrió.**
- **Los ~10 enlaces viejos del CHANGELOG (punto 3) NO se tocaron.**
- **Ni un píxel comparado**: se mide coste y existencia del fundido, no su
  aspecto. Todo en headless a 1280×720: **móvil sin medir**.
- El Pomodoro sigue **intacto y en pausa**.
