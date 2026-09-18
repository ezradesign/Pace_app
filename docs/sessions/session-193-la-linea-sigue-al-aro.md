# s193 · La línea sigue al aro (v0.123.0)

**Fecha:** 2026-09-17 → 18 · **Versión publicada:** v0.123.0 · **Suite:** 250 → **253**

> Encargo: el usuario usó «A tu ritmo» sin llegar a acabar un pomodoro y no entendía **cómo se
> enlaza el aro con la línea, las pausas y los ejercicios** («me gusta el botón verde de
> Comenzar jornada, eso sí»). Antes de eso, el troceo que el handoff pedía: `main.jsx` y
> `FocusTimer.jsx` estaban en 500 líneas. Y una dirección para lo que viene: «la idea es
> acompañar el día pero ir ofreciendo propuestas para cada día de la semana/mes».

---

## 0 · El troceo (commit `2a93077`, refactor sin versión)

| Archivo | Antes | Después | Qué salió |
|---|---|---|---|
| `app/focus/FocusTimer.jsx` | 499 | 326 | La luz de la home (s158/s159) → `FocusTimer.luz.jsx`, hook `useLuzHome`, llamado donde estaban sus dos efectos (el orden de hooks no cambia) |
| `app/main.jsx` | 500 | 417 | Los cinco listeners `pace:*` → `main/main.eventos.jsx`, hook `usePaceEventos(acciones)` (el root sigue siendo dueño del estado de los modales); el asa de la sidebar → `main/SidebarHandle.jsx` |

Los cuerpos se copiaron con `sed`, no a mano. `verify` en verde, 250/250 antes de commitear. De
paso el `verify` señaló que **`app/move/MoveSessionV1.jsx` también está en 500**: no se tocó.

---

## 1 · Leer el código antes de contestar

La explicación se dio leyendo `state-ritmo.jsx`, `FocusTimer.jsx:113`, `BreakMenu.support.jsx:155`
y `Sidebar.jsx:119`, y salió con un hueco que no era de explicación:

- **La pausa no existía como estado.** Al acabar el pomodoro, `cycle++` movía el bloque actual al
  siguiente, y la línea pintaba como **pasada** la parada que tocaba ahora (`i < iActual`),
  «AHORA» sobre un bloque sin empezar, y la barra lateral anunciaba la pausa *siguiente* a la que
  estabas haciendo. Hacer la rutina o saltarla no cambiaba nada.
- **La línea no se movía mientras el aro contaba**: era la misma antes y después de pulsar.
- La pausa larga sirve dos platos y el menú propone uno (`platos[0]`). Sigue así, declarado.

## 2 · La maqueta, sobre la app real

`scripts/audit/pausa-s193.js` abre `index.html` con el reloj fijado (con offset, la trampa de s192),
siembra la jornada entera y fotografía la home en cuatro estados —antes de empezar · minuto 12 de
45 · bloque acabado · bloque 2 empezado— dos veces: **hoy** tal cual y **propuesta** con la hoja y el
DOM inyectados encima. Sale `docs/proposals/la-linea-sigue-al-aro-r1.html`.

**La primera tirada se veía cortada** en el panel del usuario: clavaba las fotos a 1280 px. La
segunda es **fluida**: recortes del panel (con `sharp`) que se adaptan al ancho, las pantallas
enteras a tamaño real bajo desplegables con scroll, la explicación y las decisiones dentro
(comprobado a 760 px: `scrollWidth === clientWidth`). Tres correcciones más antes de enviarla,
todas por **mirar las fotos**: la sustitución de la barra lateral pisaba una etiqueta de la línea
(se acotó a `[data-pace-sidebar]`); las filas del móvil se intercambiaban en vez de construirse
desde el plan (la «pausa de ahora» salía con la hora de la siguiente); y la etiqueta AHORA se
borraba en el estado 2 y no volvía en el 3 (ahora se oculta y se restaura).

**Decisiones del usuario, con las fotos delante:**

| Qué | Decidido |
|---|---|
| 1 · El tramo de ahora se rellena con el pomodoro | Sí. Antes de empezar, **encendido al 35 % y vacío** (A) |
| «Atenuado parece como si no se hubiera realizado, ¿no?» | Razón: **lo hecho queda en verde entero** (el relleno llega al 100 % y se queda) y **la parada pasada conserva su fuerza**, solo deja de poder tocarse. El 35 % significa únicamente «a punto de correr» |
| 2 · Al acabar el bloque, «Ahora» es la pausa | Sí, y la cierra **empezar el bloque siguiente** (2A): hagas la rutina o la saltes. Sin estado que pueda quedarse colgado; el menú propone, no obliga |
| La barra lateral | **«Tu pausa · 9:45»** con su plato mientras está abierta |
| 3 · La frase la primera vez | Se queda: «Cada bloque es un pomodoro en el aro; al acabar, te sirvo la pausa que toca.» Hasta que acabe el primer bloque del día |

## 3 · La implementación

- **`state-ritmo.jsx`**: `dia.pausa` = el número de bloques hechos cuando terminó el último,
  mientras su pausa siga abierta. `ritmoBloqueTerminado()` (desde `handleFocusFinish`, después de
  que `completePomodoro` haya subido `cycle`) la abre; `ritmoBloqueEmpezado()` (desde
  `startFocusVisual`, solo en modo foco y solo si no es reanudar) la cierra. `ritmoPlan` devuelve
  `pausa` (la parada tras el último bloque hecho) **solo si el número guardado es el de bloques
  hechos**: si `cycle` se movió por otra vía, la pausa guardada no es de este momento.
  `ritmoSiguiente` devuelve la abierta con `ahora: true`.
- **`FocusTimer.luz.jsx`**: publica **`--pace-bloque`** (el avance del bloque, 96 pasos como
  `--pace-k`, `0` sin sesión viva). La línea lo consume en CSS (`::after` del tramo de ahora):
  ningún re-render.
- **`RitmoLinea.jsx`**: `ritmoIndiceAhora(plan)` (la pausa abierta si la hay); la parada abierta
  lleva `pace-rt-ahora`, la etiqueta y **tocarla la empieza** por `pace:sidebar-action` (`suggest`),
  la misma puerta que la barra lateral, así una rutina con aviso pasa por su modal. La mini línea
  hereda AHORA y lo hecho.
- **`RitmoPanel.jsx`**: `RitmoComo` (la frase, `hechos === 0`); en móvil `RitmoFilaParada` y, con
  la pausa abierta, «Ahora» es la parada y «Luego» el bloque. **`RitmoHoja`**: la parada de ahora
  lleva «ahora».
- **`ritmo.css.jsx`**: ahora = 35 % + relleno con transición de 900 ms; hecho = `--focus` entero;
  parada abierta = borde entero de su módulo + lavado al 14 % + etiqueta en su color; pasada sin
  atenuar.
- **`Sidebar.parts.jsx`** + 3 claves ES/EN (`ritmo.empieza`, `ritmo.como`, `ritmo.sidebar.ahora`);
  censo 643 → 646.

## 4 · Lo que cazó la red

- **`tests/ritmo.spec.js`, 14 → 17**: la línea sigue al aro (frase, `--pace-bloque` a los 12 min y
  el ancho real del `::after`, la parada abierta con su etiqueta, el tramo hecho, «Tu pausa»,
  `dia.pausa`, y empezar el bloque 2 la cierra); la pausa abierta **sembrada** sobrevive a la recarga
  y tocar la parada abre el preview del plato; en móvil «Ahora» es la parada, «Luego» el bloque y la
  lista dice «ahora». La geometría (sin scroll en los cuatro viewports) siguió verde con la frase.
- **`scripts/audit/banco-pausa-s193.js`**: 12 mutantes con pasada de control (resultado en
  `STATE.md`). Declara lo que no muta: los colores y la guarda `pausa === hechos`.
- Para sembrar un bloque hecho hay que sembrar **`lastActiveDay` con el formato del rollover**
  (`toDateString`, «Thu Sep 17 2026») y `_historyMigrated: true`: si no, el relevo de día pone
  `cycle` a cero antes de que el plan lo lea.

## 5 · Trampas de esta sesión

- **`String.replace` con un texto nuevo que contiene `$&` o `$'`** no escribe ese texto: escribe la
  coincidencia o lo que va detrás. Un ayudante de edición duplicó medio script así (687 líneas
  donde había 317). Siempre `replace(viejo, () => nuevo)`.
- **La copia de trabajo va con CRLF** (`autocrlf=true`; el repo guarda LF): un `sed`/`node` que
  inserta líneas con LF deja el archivo mixto y los reemplazos exactos dejan de casar. Se normaliza
  antes de buscar y se escribe CRLF.
- **Un heredoc largo con backticks en Git Bash** volvió a no ejecutarse (`unexpected EOF`): script
  a archivo con Write y `node archivo.js`.
- **Una página de maqueta con fotos a ancho fijo se corta en el panel** del usuario: fluida, con
  recortes, y las enteras bajo desplegable con scroll.
- **El panel del navegador no dibujó una captura** (pantalla en blanco): se fotografió con
  Playwright, como en s192.

## 6 · Lo que no se probó, y lo que queda

- **Ni un píxel comparado**: los colores (verde entero en lo hecho, 35 % en lo de ahora, el lavado
  de la parada) se miraron en las fotos, no se asertan.
- **El cierre** (`ritmoDetras` tras el último bloque) sigue entrando por `RitmoHecho` («Jornada
  cerrada»): la pausa de cierre nunca es «Ahora» en la línea, aunque el menú la proponga.
- **La pausa larga** propone un plato de dos; el segundo solo se ve en la línea.
- **La comida como parada abierta** lleva AHORA sobre su tramo punteado; no se fotografió.
- **La dirección nueva del usuario**: acompañar el día **y proponer para cada día de la semana/mes**
  (variedad y planificación entre días). Va al ROADMAP (Fase 3.6) como norte; hoy los pozos rotan
  por día y nada más.
- Sigue en la cola: recolocar a mitad de día · origen de cada sesión en los eventos · llegar antes ·
  `MoveSessionV1.jsx` en 500 líneas.
