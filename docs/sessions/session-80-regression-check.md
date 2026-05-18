# Sesion 80 - Checklist de no-regresion del split

**Fecha:** 2026-05-18
**Version pre-split:** v0.32.1 (PathRunner.jsx monolito de 835 ln)
**Version post-split:** v0.33.0 (split en 8 archivos)
**Cambio funcional intencionado:** ninguno (refactor puro + uniformizacion de contrato de PathHydrateStep).

---

## Fase 4.1 -- Cobertura por kind

Un test por tipo de bloque, en el Camino que mejor lo represente. Comportamiento esperado: identico a v0.32.1.

### 1. `breathe` - Morning Glory (path.dawn, bloque 1)

- [ ] Card de transicion (StepIntro) sin glitch.
- [ ] BreatheSession arranca con la rutina `breathe.coherent.55` (coherencia cardiaca 5-5).
- [ ] Fases de inhalacion/exhalacion visibles, sonidos respiratorios audibles.
- [ ] Copy en italic Garamond.
- [ ] Skip o completar transiciona al siguiente bloque.
- [ ] Si la rutina tuviera safety:true (Halito > breathe.478 o nadi.shodhana en weekend) -> BreatheSafety aparece ANTES de la session.

### 2. `focus` - Morning Glory (path.dawn, bloque 2)

- [ ] TimerDial (aro circular) presente, mismo SVG que el Pomodoro home.
- [ ] Subtitulo "Concentracion profunda" debajo del contador.
- [ ] Tres botones del mismo peso visual: Comenzar/Pausar/Continuar (toggle), Reiniciar, Saltar.
- [ ] Sin presets de minutos, sin puntos de ciclo, sin badge tipo sesion.
- [ ] Comenzar -> el contador decrementa.
- [ ] Pausar -> contador se detiene. Continuar -> reanuda.
- [ ] Reiniciar -> contador vuelve a totalSec, queda pausado, NO acredita foco, NO avanza el Camino.
- [ ] Saltar -> avanza al siguiente bloque, NO acredita foco a totalFocusMin.
- [ ] Llegar a 0 estando running -> bloque `done` con CTA "Hecho" centrado + acredita +25 min (o lo que diga `step.min`) a totalFocusMin (UNA sola vez).

### 3. `hydrate` - Hierbabuena (path.midday, bloque 1)

- [ ] Contador grande Garamond italic (today/goal) en color `--hydrate`.
- [ ] Grid de 8 vasos visuales (no clicables).
- [ ] Copy italic reforzando opcionalidad ("Un sorbo, una pausa." o equivalente).
- [ ] Dos botones del mismo peso visual: Saltar (outline) / Beber (relleno azul agua).
- [ ] Saltar -> avanza, NO modifica `state.water.today`.
- [ ] Beber -> incrementa `state.water.today` en 1, avanza al siguiente bloque.
- [ ] Persistencia: recargar la pagina tras beber un vaso -> el conteo se mantiene.

### 4. `move` - Morning Glory (path.dawn, bloque 3)

- [ ] MoveSession arranca con `move.neck.3` (estiramiento cuello en 3 pasos).
- [ ] Glifo SVG del ejercicio (no emoji, no PNG).
- [ ] Temporizador por paso visible.
- [ ] Transicion entre pasos sin glitch.
- [ ] Skip o completar -> transiciona al siguiente bloque (o al outro si es el ultimo).

### 5. `stretch` (kind: 'body' con `source='extra'`) - Lampara de Mesa (path.afternoon, bloque 3)

- [ ] PathBodyStep resuelve `extra.desk.pushups` via `resolveBodyRoutine` -> `source='extra'`.
- [ ] MoveSession recibe `kind='extra'` y renderiza con colores Extra (no Move).
- [ ] Glifo SVG del ejercicio.
- [ ] Temporizador correcto.
- [ ] Skip o completar -> outro -> CompletionScreen (es el ultimo bloque).

---

## Fase 4.2 -- Smoke test de los 7 Caminos

Para cada Camino: Home -> CTA Comenzar -> SenderoBar carga -> avanzar 1 bloque (Skip rapido OK) -> cerrar (X o Escape). No completar el Camino entero.

| # | Camino | ID | Slot | Bloques | OK |
|---|---|---|---|---|---|
| 1 | Morning Glory | path.dawn | morning | breathe + focus + move | [ ] |
| 2 | Hierbabuena | path.midday | midday | hydrate + move + focus | [ ] |
| 3 | Lampara de Mesa | path.afternoon | afternoon | breathe + focus + stretch | [ ] |
| 4 | Te sin Azucar | path.tea | afternoon | breathe + hydrate + focus | [ ] |
| 5 | Chispa de Cerilla | path.dusk | evening | breathe + focus + move | [ ] |
| 6 | Ventana Abierta | path.weekend | weekend | breathe + move + hydrate | [ ] |
| 7 | Halito | path.breath | anytime | breathe + breathe | [ ] |

Para cada Camino verificar:
- [ ] IntroCard aparece (si recien iniciado y stepIndex=0).
- [ ] SenderoBar muestra los hitos del Camino (numero correcto).
- [ ] Tras saltar 1 bloque, StepIntro (transition card) aparece con el nombre del siguiente.
- [ ] Cerrar via X o Escape:
  - Si el step actual es `optional:true` -> abandona directo.
  - Si no -> ExitConfirmModal aparece. Cancelar mantiene el Camino; confirmar abandona.

---

## Fase 4.3 -- Invariantes criticos

### 1. Recarga a mitad de un bloque cualquiera

- [ ] Iniciar Morning Glory, avanzar a bloque 2 (focus), pausar a media cuenta.
- [ ] Recargar la pagina (F5).
- [ ] Al cargar: el Camino sigue activo, en el mismo `stepIndex`.
- [ ] El temporizador del Pomodoro arranca de cero (los timers locales del Step no se persisten -- esto es invariante intencionado).
- [ ] SenderoBar refleja el progreso correcto.

### 2. SenderoBar avanza el halo al cambiar de bloque

- [ ] Iniciar cualquier Camino.
- [ ] Skip rapido -> StepIntro aparece, SenderoBar dentro muestra el hito siguiente como `current` (halo activo).
- [ ] Sin glitches visuales (sin parpadeo, sin salto brusco).

### 3. `lastViewed` se persiste al iniciar Camino

- [ ] Abrir DevTools > Application > Local Storage > `pace.state.v2`.
- [ ] Iniciar Morning Glory.
- [ ] Verificar `state.paths.lastViewed === 'path.dawn'` en localStorage.

### 4. Logro `master.path.all7` (Cartografa)

- [ ] En consola: `window.checkAllPathsCompleted()` -> deberia devolver `false` salvo que ya esten los 7 completados.
- [ ] (Solo verificable end-to-end completando los 7 Caminos: fuera del scope de regresion smoke.)

### 5. Consola limpia

- [ ] Sin warnings nuevos de React ("Each child in a list...", "Cannot update a component...", etc.).
- [ ] Sin 404s (todos los nuevos `<script src>` resuelven).
- [ ] Sin errores de "X is not a function" (load order correcto: `_shared.js` -> Steps -> parts -> CompletionScreen -> PathRunner).

---

## Verificaciones estaticas adicionales (sin browser)

Estas se realizan analizando el codigo, no la app corriendo. Bloquean el commit si fallan.

- [ ] `git diff` entre el viejo PathRunner.jsx y el nuevo: solo migraciones de codigo + cambio del callsite de PathHydrateStep (`onDone/onSkip` -> `step/onExit`).
- [ ] Cada uno de los 7 archivos nuevos parsea con `validateSyntax` del build script.
- [ ] PACE.html: los 7 nuevos `<script src>` resuelven a archivos existentes.
- [ ] Ningun symbol viejo huerfano en PathRunner.jsx (`grep -n "function (PathTopBar|...)"` solo retorna `function PathRunner()`).
- [ ] Las 28 invariantes listadas en `session-80-audit.md` preservadas (revisar uno por uno los archivos nuevos).

---

## Plan de rollback (Tarea 5)

Si tras la implementacion >2 puntos fallan y la causa es >15 min de fix:
1. `git stash` para preservar el split sin contaminar el arbol.
2. Reportar al usuario con analisis de causa raiz.
3. Esperar decision: continuar con fix / revertir a auditoria / cancelar s80.
