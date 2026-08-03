# Sesión 148 — Cinco archivos por encima del límite, y dos no estaban en la lista

**Fecha:** 2026-08-03 · **Versión:** v0.80.0 → **v0.81.0**
**Tipo:** Fase 8.5 · saneamiento estructural (sin cambio de comportamiento)

---

## 0. De qué iba la sesión

No llegó arte, así que tocaba la primera opción del orden acordado: **Fase 8.5**,
trocear lo que incumple la regla nº 1 de `CLAUDE.md` (< 500 líneas) siguiendo los
patrones que el repo ya usa (`*.support.jsx` / `*.parts.jsx`), sin tocar
comportamiento.

La instrucción de entrada era «mídelos tú, no te fíes de la tabla de STATE». Se
cumplió, y fue lo que dio el primer hallazgo.

---

## 1. La deuda es mayor de lo anotado: cinco, no tres

Medido al arrancar, no leído:

| Archivo | Real | Lo que decía STATE |
|---|---:|---|
| `app/tokens.css` | 613 | 613 ✓ |
| `app/glyphs/exercise-glyphs.jsx` | **571** | 554 · «BAJA, **dentro de límite**» |
| `app/shell/Sidebar.jsx` | 570 | 541 |
| `app/state-core.jsx` | 510 | 494 |
| `app/i18n/strings/sessions.js` | **502** | **no aparecía en la tabla** |
| `app/move/MoveSessionV1.jsx` | 500 | 500 ✓ (en el tope) |

Los dos que faltaban son justo los que nadie vigilaba. `exercise-glyphs.jsx`
estaba **catalogado como sano desde s84** y ya entonces (554) estaba por encima;
`sessions.js` nunca entró en la tabla de deuda pese a ser el dominio más grande
del split de s81. **Una tabla que se actualiza a mano deja de medir.**

Trampa de método, anotada: el primer recuento se hizo con
`Get-Content | Measure-Object -Line`, que **no cuenta líneas en blanco** y daba
41 líneas de menos en `tokens.css`. Las cifras solo cuadraron con
`(Get-Content x).Count`.

---

## 2. Los cinco troceos

| Archivo | Antes | Después | Hermano(s) |
|---|---:|---:|---|
| `tokens.css` | 613 | **386** | `paths/paths.css` 284 |
| `exercise-glyphs.jsx` | 571 | **209** | `.extra.jsx` 406 |
| `Sidebar.jsx` | 570 | **141** | `.parts.jsx` 277 · `.support.jsx` 218 |
| `state-core.jsx` | 510 | **402** | `.support.jsx` 160 |
| `strings/sessions.js` | 502 | **353** | `sessions.body.js` 158 |

Ningún archivo de `app/` pasa ya de 500. El techo queda en `MoveSessionV1.jsx`,
**exactamente en 500** — sigue como estaba y sigue valiendo su restricción: lo
próximo va a su `.support`.

### Cada corte se eligió por una frontera que ya existía

- **`tokens.css`** → salió el **CSS de Caminos** (SenderoBar, escena ilustrada,
  variante `lg`, orbe). No eran tokens: un token es un valor que consume toda la
  app, y esto eran reglas de UN módulo. El archivo ya lo separaba con un banner.
- **`exercise-glyphs.jsx`** → corte **por módulo**, en el separador que el propio
  archivo dibujaba: Mueve se queda, **Estira** se va.
- **`Sidebar.jsx`** → el reparto de Foco (`FocusTimer` + `.support` + `.parts`):
  hoja responsive y estilos a `support`, secciones de UI a `parts`, orquestador
  en su sitio.
- **`state-core.jsx`** → salió **«cómo un estado guardado se convierte en el de
  hoy»**: detección de entorno, migraciones y rollover. El store se queda.
- **`sessions.js`** → salió el dominio **CUERPO** (Mueve/Estira), que era un
  bloque contiguo **y con la misma frontera en los dos idiomas**. ES y EN viajan
  juntos (decisión s81).

---

## 3. Lo que el troceo obligó a resolver (y no es cosmético)

### El build solo sabía inlinear `tokens.css`

El paso 4 de `build-standalone.js` hacía un `replace` con la ruta **cableada**.
Un CSS nuevo se habría quedado fuera del artefacto sin avisar. Se generalizó a
recorrer **todas** las hojas de `app/`, sustituyendo cada enlace **en su sitio**
—así el orden del head se conserva— y **abortando** si una no existe o si no
inlinea ninguna. Va por `replaceOutsideComments`, el helper que ya existía para
que una mención en prosa no se procese como etiqueta real.

### Un `const` no cruza de archivo en el compilado

`sidebarStyles` es un `const`, y el build envuelve cada archivo en su IIFE: las
piezas extraídas dejaban de verlo. Se publica a mano a `window` —misma solución
que `window.pathStepStyles` (s80)— y los consumidores lo referencian **pelado**,
para que se resuelva **al renderizar** y no al evaluar (en dev el orden de
evaluación no está garantizado; en el compilado sí).

Corolario del mismo mecanismo, en la dirección contraria: `function` y `var`
top-level **sí** viajan solos (el build los re-expone), y por eso las seis piezas
de `Sidebar.parts.jsx` y las cinco de `state-core.support.jsx` no necesitaron
nada.

### Los alias de hooks tienen ese nombre raro por un motivo

`useMemoSB` / `useIdSidebar` se conservan tal cual: en dev, Babel evalúa cada
archivo con un eval **indirecto**, así que un `const { useMemo } = React` cae en
el ámbito léxico **global** y choca con el de cualquier otro archivo que haga lo
mismo — y ese archivo entero deja de evaluar.

### Un orden de carga que no es negociable

`state-core.jsx` hace `let _state = loadState()` **en el cuerpo del archivo**: no
al montar. Y `loadState` llama a cuatro de las cinco funciones extraídas. Su
`.support` **tiene que cargar antes**, igual que ya pasaba con `state-history` y
`flags`. Está escrito en las dos cabeceras y en `PACE.html`.

`exercise-glyphs.extra.jsx` **muta** el mapa del hermano en vez de crear uno
propio, porque `ExerciseGlyph` cierra sobre la referencia local: un segundo mapa
habría exigido cambiar su resolución, que es justo el comportamiento que este
troceo no debe tocar. Lleva un **guard que aborta** con mensaje claro si el orden
se invierte, en vez de dejar 25 ejercicios de Estira cayendo al glifo por defecto
en silencio.

---

## 4. Verificación

Cargando **`index.html`** (no `PACE.html`) tras **cada** troceo, con SW y cachés
purgados y el estado limpiado desde la página viva. Consola sin errores en todos.

- **CSS de Caminos**: la cascada se conserva en el artefacto — la hoja va segunda,
  la escena queda fuera del rise (`animation: none`) y su hermano lo conserva
  (`pace-reveal-rise`). Los 5 keyframes que viajaron, presentes.
- **Sidebar**: las cuatro secciones montan; los tres estilos que cruzan por
  `window` llegan — racha en **EB Garamond 44px itálica** (blindaje de s20),
  borde del footer, chevron 44×44.
- **`state-core`**: se probaron **las dos ramas de `loadState`**, prediciendo el
  resultado antes de mirarlo.
  - Arranque limpio: paleta detectada, `langAuto`, guards, tema aplicado.
  - Estado VIEJO sembrado a mano — **7 de 7 predicciones**: `weeklyStats`
    rotado de `getDay()` a lunes-primero (`[10..70]` → `[20,30,40,50,60,70,10]`),
    `envejecido`→`crema`, `barra`→`aro`, `organico`→`flor`, guard a true, racha
    intacta.
  - Rollover completo (último uso 5 días antes, semana anterior) — **9 de 9**:
    semana a cero, racha 5→0 con `longest` intacto, ciclo y plan reseteados,
    agua a 0, **7 días archivados (23–29 jul)** y su mes agregado.
- **Glifos de ejercicio**: **47**, los mismos que antes. Siete claves de Estira
  comprobadas una a una pintan **su propio dibujo**, no el fallback.
- **i18n**: comparación **clave a clave contra `HEAD`**, evaluando los archivos
  en un sandbox en vez de por regex: **195 claves ES y 195 EN, cero perdidas,
  cero nuevas, cero con valor distinto**. El override D-1 de `content/*` sigue
  ganando (`breathe.phase.inhala.mas` = «Inhale again»).
- **Cierre**: 96 logros · 58 máscaras · 88 disponibles (§15.4) · 39 alias · 7
  Caminos · paleta crema↔oscuro ida y vuelta · `renderGlyph` resolviendo
  `first.step.webp`.
- `PACE_standalone.html` restaurado **byte a byte** tras cada build — hash
  `998e3e358d689036` verificado las cinco veces (decisión s134).

---

## 5. Tres hallazgos que no venían en el encargo

### `first.return` NO SE DESBLOQUEA NUNCA — y no lo rompí yo

Al probar el rollover apareció que el logro **«Regresas»** («Abre la app al día
siguiente») no se concede. La causa está en su propio comentario: se llama
`unlockAchievement` **diferido con `setTimeout(…, 0)`** porque
`state-achievements.jsx` aún no ha cargado — pero **0 ms es demasiado poco**: el
callback llega antes de que ese archivo evalúe, `unlockAchievement` es `undefined`
y el `try/catch` **se lo traga en silencio**.

Antes de atribuírmelo se contrastó contra el **artefacto committeado de v0.80.0**
(`git show HEAD:index.html`, servido aparte) con el mismo estado sembrado:
**se comporta idéntico** — mismo `first.return: false`, misma racha a 0, mismos 7
días archivados. **Es preexistente.** No se toca: el encargo era trocear sin
cambiar comportamiento. Queda anotado en el backlog, y con una punta extra —
`first.return.webp` existe: hay arte para un logro que nadie puede ganar.

### El `sw.js` tenía un comentario sin cerrar, y el script de ingesta lo seguía

El bloque de s146 había perdido su cierre y se había **tragado el comentario de
fuentes de s105**. No era prosa mal puesta: `reescribirPrecache()` localiza la
cabecera y **avanza hasta el primer `*/`** para saber dónde insertar, así que
aterrizaba en el cierre del bloque de fuentes y metía los 58 glifos **debajo** de
él, dejando las fuentes sin cabecera. Reparado y **verificado simulando la
búsqueda del script** sobre el archivo corregido: ahora el cierre que encuentra es
el suyo y las filas caen antes del comentario de fuentes.

### `PACE.html.bak.pre-fix` llevaba 15 meses en el repo

Copia de `PACE.html` en **v0.25.0** (7 de mayo, commit `c076061`), **trackeada**,
referenciando aún `manifest.json` (renombrado en s102). Eliminada; recuperable de
git si alguna vez hiciera falta.

---

## 6. Dato menor corregido

Los `explore.*` sin dibujo son **10**, no 11 — `STATE.md` y el plan de la próxima
tanda de arte decían 11. Los diez: `box`, `rounds`, `kapalabhati`, `shoulders`,
`atg`, `ancestral`, `neck`, `desk`, `all.move`, `all.extra`.

---

## 7. Lo que queda abierto

- **`MoveSessionV1.jsx` en 500 exactas.** No se tocó (no está por encima), pero es
  el próximo en caer: lo que se añada va a su `.support`.
- **`first.return` inalcanzable** (ver arriba). Arreglo probable: diferir con
  `requestIdleCallback` o llamarlo desde `state-achievements.jsx` al evaluar, en
  vez de desde el rollover.
- **Resto de la Fase 8.5 sin empezar**: a11y (tarjetas sin teclado, onboarding sin
  focus trap), tests del state (A-6), import sanitizado (A-7), I18N-2.
- Lo de siempre: 38 logros sin arte, ola B de Mueve/Estira, README en v0.27.6.
