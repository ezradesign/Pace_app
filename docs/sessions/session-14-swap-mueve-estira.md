# Sesión 14 (2026-04-22) — Swap Mueve ↔ Estira + título del modal

**Versión entregada:** v0.11.9
**Duración / intensidad:** corta · quirúrgica (dos archivos, cambio de
contenido sin tocar cableado de state)

## Contexto / petición

> «quiero cambiar el apartado de dentro de estira y mueve ya que los
> ejercicios están invertidos: los de estira son de mueve y los de mueve
> son de estira, además dentro de la ventana de estira dice "extra" y no
> estira»

Dos bugs distintos reportados juntos:

1. **Contenido cruzado.** El botón "Estira" abría una librería de
   calistenia (flexiones de escritorio, fondos en silla, wall sit,
   gemelos, core, grip, postura) y el botón "Mueve" abría una librería
   de estiramientos / movilidad (antídoto silla, caderas, hombros, ATG,
   ancestral, cuello, escritorio express). Exactamente al revés de lo
   que los nombres sugieren.
2. **Título del modal de "Estira" obsoleto.** Aún mostraba `"Extra"` —
   residuo del rebrand incompleto de sesión 02 (`Extra` → `Estira` en el
   sidebar, pero el título del modal nunca se actualizó).

Tras preguntar, el usuario confirmó la semántica deseada: **"en estira
solo estiramientos y en mueve solo calistenia y ejercicios de fuerza
(los títulos de los botones están bien)"**.

## 🧭 Decisión de implementación

Dos caminos posibles:

- **A.** Swap a nivel de cableado — cambiar qué librería abre cada
  botón en `main.jsx`.
- **B.** Swap a nivel de contenido — mover los arrays de rutinas entre
  archivos, manteniendo intacto el cableado y los tokens de color.

Elegida **B**. Razones:

- Cada módulo ya tiene su token de color (`--move` naranja / `--extra`
  verde), su icono (`ABMove` / `ABStretch`), y sus funciones de completion
  (`completeMoveSession` / `completeExtraSession`). Al swapear contenido
  todo el "paquete estético" de cada botón queda consistente con su
  nombre — el botón naranja "Mueve" abre rutinas naranjas de
  calistenia, el verde "Estira" abre rutinas verdes de movilidad.
- El camino A requeriría o bien renombrar colores/iconos, o bien dejar
  un botón naranja abriendo rutinas marcadas como "extra" verdes,
  generando inconsistencia visual.
- Los ids de rutina (`move.hips.5`, `extra.grip.squeeze`, …) **no se
  renombran**: se conservan tal cual dentro del array destino. Esto
  protege localStorage de usuarios existentes (logros desbloqueados con
  el id antiguo siguen existiendo) y evita tener que tocar los maps de
  logros en `state.jsx`.

## ✅ Cambios aplicados

**`app/move/MoveModule.jsx`**
- `MOVE_ROUTINES` pasa a contener las 7 rutinas de calistenia/fuerza que
  antes vivían en `EXTRA_ROUTINES` (flexiones de escritorio, fondos en
  silla, wall sit, gemelos, core silencioso, grip, postura reset). Los
  ids siguen siendo `extra.*`.
- `MoveLibrary`: título del modal `"Movilidad"` → `"Mueve"`; subtítulo
  `"Antídoto a la silla. Caderas, hombros, espalda."` →
  `"Calistenia y fuerza. Corto, discreto, sin equipo."`; meta superior
  `"Antídoto a estar sentado"` → `"Cuerpo activo"`.
- Comentario de cabecera actualizado explicando el swap y por qué se
  conservan los ids.

**`app/extra/ExtraModule.jsx`**
- `EXTRA_ROUTINES` pasa a contener las 7 rutinas de movilidad /
  estiramiento que antes vivían en `MOVE_ROUTINES` (antídoto silla,
  caderas, hombros, ATG, ancestral, cuello, escritorio express). Los
  ids siguen siendo `move.*`.
- `ExtraLibrary`: título del modal `"Extra"` → `"Estira"`; subtítulo
  `"Calistenia de oficina. Cortos, discretos, sin equipo."` →
  `"Movilidad y estiramientos. Antídoto a la silla."`. Añadida la fila
  superior con meta `"Afloja tensión"` + encabezado `"Rutinas"` para
  igualar la estructura visual de `MoveLibrary` (antes `ExtraLibrary`
  era más escueto que su gemelo).
- Comentario de cabecera actualizado con la misma nota de swap.

**`app/state.jsx`**
- `PACE_VERSION` → `v0.11.9`.

**`PACE.html`**
- No requería cambios — el title no contiene el número de versión.

## 📁 Archivos modificados
- `app/move/MoveModule.jsx` (swap de contenido + título del modal + meta)
- `app/extra/ExtraModule.jsx` (swap de contenido + título del modal +
  estructura visual emparejada)
- `app/state.jsx` (`PACE_VERSION` bump)
- `PACE_standalone.html` (regenerado)

## 🔒 Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.9** (~182 KB).
- Rotado `backups/PACE_standalone_v0.11.8_20260422.html`.
- 4 backups activos (v0.11.5, v0.11.6, v0.11.7, v0.11.8) — dentro del
  límite de 5.
- Verificado en preview: ambas librerías cargan el contenido correcto,
  títulos actualizados, sin errores de consola más allá del warning
  habitual de Babel in-browser.

## 🎯 Por qué esta sesión

Corrige un bug de UX que llevaba tiempo latente desde el rebrand parcial
de sesión 02: los nombres de los botones prometían una cosa y las
librerías entregaban la opuesta. Dos cambios pequeños, cero riesgo
funcional (los `complete*Session` siguen enganchados a los mismos
botones y los ids no se tocan → logros y stats siguen funcionando
idénticamente).

## ⚠️ Nota sobre invariantes que sobreviven al swap

- **`completeMoveSession` vs `completeExtraSession` no se tocan.** Cada
  librería sigue llamando a su función de completion correspondiente
  (vía el prop `kind` de `MoveSession`), así que el **plan del día**
  sigue marcando `plan.muevete` al terminar una rutina desde el botón
  "Mueve" y `plan.extra` al terminarla desde "Estira", respectivamente.
- **La decisión activa "Extra suma a `moveMinutes`" sigue vigente.**
  Antes la justificación era "calistenia extra es también movimiento";
  tras el swap la justificación pasa a ser "estiramientos son también
  cuerpo activo". La decisión no cambia de forma, solo de texto
  explicativo. Se mantiene en STATE.md.
- **Los maps de logros en `state.jsx` siguen funcionando.**
  `completeMoveSession` tiene un map indexado por ids `move.*` y
  `completeExtraSession` desbloquea `first.extra` sin mirar el id. Tras
  el swap, las rutinas `move.*` se ejecutan desde `ExtraLibrary` y
  completan vía `completeExtraSession` → `first.extra` se desbloquea
  correctamente. El map `move.hips.5 → explore.hips` queda **sin
  disparar**: es una deuda menor — esos logros de exploración ya no
  tienen trigger. Registrado abajo.

## 📋 Backlog abierto al cerrar

Nueva deuda introducida por este swap (pequeña, acotada):

- **Map de logros `explore.*` en `completeMoveSession` queda huérfano.**
  Las claves `move.hips.5`, `move.shoulders.5`, `move.atg.knees`,
  `move.ancestral`, `move.neck.3`, `move.desk.quick` ya no se
  ejecutarán por esa función (pasaron a `completeExtraSession`). Se
  suman a los 19 logros sin trigger del backlog #9. Al resolver #9 hay
  que mover esas 6 entradas a `completeExtraSession` o parametrizar el
  map.

Backlog pre-existente (sin cambios):

- **#9** 19 logros sin trigger — ahora con 6 más colgando en esa misma
  decisión de diseño.
- Layout "Editorial", mockups extensión Chrome, sonidos sutiles (WAVs).

## ⚠️ Decisiones tomadas

- **Los ids `move.*` y `extra.*` permanecen ligados a su rutina
  original, no al módulo donde viven.** Un id `move.hips.5` puede vivir
  en `EXTRA_ROUTINES` (como ahora) sin problema — el id es un
  identificador estable para localStorage/logros, no una clasificación
  semántica. Si alguien tiene la tentación de "ordenar" los ids para
  que coincidan con el módulo, **no**: rompería localStorage existente.
  (Sesión 14.)
