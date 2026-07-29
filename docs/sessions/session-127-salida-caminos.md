# Sesión 127 — «Salir» de un Camino vuelve a la home en vez de avanzar

**Fecha:** 2026-07-29
**Versión:** v0.69.0 → **v0.70.0**
**Tipo:** sesión de CÓDIGO, CORTA y confinada (1 fix + registro documental)
**Base:** `main` @ 2898eac (v0.69.0 publicado)

---

## Encuadre

Sesión deliberadamente **corta** (quedaba ~23 % del límite de horas) para cerrarla completa
y poder migrar a una sesión nueva sin dejar nada a medias.

Se ataca el ítem de **Bloque 0 · Consolidación** (§23 del audit) con mejor relación
valor/riesgo: **«Salida táctil de Caminos»**, que el usuario definió como
*«cuando pulsas salir no sale al home, simplemente va a la siguiente actividad»*. Es un bug
funcional con criterio de «hecho» inequívoco, no un tema de diseño.

---

## Causa raíz (cadena completa)

El botón visible «Salir» emite `onExit('exit')` desde
[`SessionShell.jsx:161`](../../app/ui/SessionShell.jsx). Los runners lo pasan tal cual, y
`PathBodyStep` / `PathBreatheStep` lo entregan directamente a
`PathRunner.handleStepExit`.

**`handleStepExit` no contemplaba `reason === 'exit'`**: caía en `advancePathStep(reason)`
→ avanzaba al siguiente paso en vez de abandonar el Camino.

Lo llamativo es que **la semántica correcta ya estaba escrita, pero nunca implementada**:
[`PathFocusStep.jsx:16`](../../app/paths/steps/PathFocusStep.jsx) dice literalmente
*«onExit('exit') (header "Salir") = misma semántica que Respira/Mueve»*. Y la función que
hace lo correcto (`handleRequestExit`) ya vivía 30 líneas más abajo en el mismo archivo,
usada solo por el botón de salida de la cabecera del runner.

`Escape` emite el mismo `'exit'` en los tres runners
(`MoveSessionV1.jsx:224`, `BreatheSession.jsx:176`, `MoveModule.jsx:141`), así que tenía el
mismo bug.

---

## Fix

En [`app/paths/PathRunner.jsx`](../../app/paths/PathRunner.jsx):

1. `handleRequestExit` se **mueve** por encima de `handleStepExit` (cuerpo **byte-idéntico**,
   solo cambia de sitio) para poder reutilizarlo.
2. `handleStepExit` intercepta el motivo antes de la lógica de avance:

```js
if (reason === 'exit') { handleRequestExit(); return; }
```

**Una sola política de salida** en todo el runner: paso `optional` → abandona directo; paso
normal → confirmación («¿Salir del camino?» / «Perderás el progreso de este camino»).

**Diff funcional total: 1 línea nueva** (el resto del diff son el traslado del helper y
comentarios). `advancePathStep`, `completePath`, `abandonPath` y la contabilidad **no se
tocan**: el fix solo decide a cuál se llama. Los motivos `'done'` y `'skip'` quedan
byte-idénticos, por debajo del early return.

---

## Verificación (runtime, sobre el standalone v0.70.0)

Camino `path.dawn` (3 pasos: breathe → focus → body), iniciado desde el CTA real de la home:

| Comprobación | Resultado |
|---|---|
| «Salir» en el paso 1 (no opcional) → ¿avanza? | **NO** — `stepIndex` se queda en 0 (antes pasaba a 1) |
| ¿Aparece la confirmación? | **Sí** — «¿Salir del camino?» con «Seguir» / «Sí, salir» |
| Al confirmar → ¿vuelve a la home? | **Sí** — `paths.current = null`, sesión desmontada, home visible |
| ¿Acredita algo al salir? | **No** — `totalFocusMin` 0, `breatheSessionsTotal` 0 |

**No regresión fuera de Caminos**: no requiere prueba empírica — `PathRunner` solo se monta
dentro de un Camino, así que ninguna sesión suelta (Respira/Mueve/Estira) atraviesa el
código modificado. El diff lo confirma: un único early return dentro de `handleStepExit`.

Consola limpia. `git diff --check` limpio.

---

## Registro documental (para no perder nada en la migración de sesión)

El usuario definió los ítems restantes del Bloque 0, que en el audit eran una línea suelta
sin desarrollo. Quedan escritos en §23:

- **Estabilidad de Stats** → las pestañas **semana / mes / año / caminos tienen alturas
  distintas** y el salto al cambiar de pestaña es visualmente muy brusco. Trabajo =
  estabilizar la altura del panel, no rehacer las stats.
- **Revisar pills** → **CERRADO** (eran las del timer, ya implementadas). **Sustituido por**:
  reorganizar las **bibliotecas** de Respira/Mueve/Estira para reducir el scroll (sobre todo
  en móvil) y **sacar el selector de rutinas premium a Mueve Y Estira**, en vez de hundido al
  final de la lista.
- **Sidebar (§14)** → debe cumplir las funciones de §14; requiere un **repensado**, no un
  parche.
- **Trocear >500 líneas** → inventario real: solo `app/glyphs/exercise-glyphs.jsx` (571) y
  `app/shell/Sidebar.jsx` (543).
- **Glifos de las bolas de logros (§15.1)** → la maquinaria ya existe (`AchGlyph` con
  `glyphSvg` + fallback unicode); el sendero vive en `Sidebar.jsx`, que además es uno de los
  dos archivos a trocear → conviene hacer ambos juntos.

Además se refrescó §3.1 (decía «Versión analizada: v0.66.0») y se anotó que en Desktop la
home «atardecer» quedó sustituida por §32.6 desde s126.

---

## Siguiente

Candidata natural: **glifos de logros + troceado de `Sidebar.jsx` y `exercise-glyphs.jsx`**,
que cierra dos ítems de Bloque 0 en el mismo sitio. Antes conviene que el usuario responda
las preguntas de §14 (función de la sidebar, qué sobra, qué acción sin modal) para que el
troceado nazca alineado con el rediseño y no haya que rehacerlo.

Decisión pendiente sin bloquear nada: **adelantar `pace.events.v1`** (Bloque 9). No es
urgencia visible sino **tiempo de espera**: es la única tarea cuyo valor depende de haberla
hecho pronto, porque las decisiones M4 («Qué te ayuda», Mes/Año, comparación retrospectiva)
necesitan histórico acumulado que hoy no se está registrando.
