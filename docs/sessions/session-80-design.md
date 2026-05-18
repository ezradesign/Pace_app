# Sesion 80 - Diseño del split (Tarea 2)

**Fecha:** 2026-05-18
**Decisiones aprobadas en la pausa de Tarea 1:**
- Opcion A para Move/Stretch: mantener `PathBodyStep.jsx` como dispatcher.
- Extender el split a `PathRunner.parts.jsx` para cumplir la metrica de PathRunner.jsx <=280 lineas.

---

## Estructura objetivo de archivos

```
app/paths/
├── PathRunner.jsx                  (orquestador, ~238 ln estimado)
├── PathRunner.parts.jsx            (PathTopBar + ExitConfirmModal + StepError, ~120 ln estimado)
├── CompletionScreen.jsx            (extraido del archivo monolitico, ~205 ln estimado)
├── SenderoBar.jsx                  (SIN CAMBIOS)
├── PathTransitions.jsx             (SIN CAMBIOS)
├── SuggestedPathCard.jsx           (SIN CAMBIOS)
├── PathsLibrary.jsx                (SIN CAMBIOS)
├── registry.js                     (SIN CAMBIOS)
└── steps/
    ├── _shared.js                  (estilos comunes btnTypography + btnOutline, ~25 ln)
    ├── PathBreatheStep.jsx         (Breathe + Safety gate, ~30 ln)
    ├── PathFocusStep.jsx           (~120 ln, btnBase compone via _shared)
    ├── PathHydrateStep.jsx         (~110 ln, contrato uniformado + btnBase compone via _shared)
    └── PathBodyStep.jsx            (dispatcher MoveSession move/extra, ~10 ln)
```

### Estimacion de lineas

| Archivo nuevo | Lineas estimadas |
|---|---:|
| `PathRunner.jsx` (final) | ~238 |
| `PathRunner.parts.jsx` | ~125 |
| `CompletionScreen.jsx` | ~210 |
| `steps/_shared.js` | ~25 |
| `steps/PathBreatheStep.jsx` | ~35 |
| `steps/PathFocusStep.jsx` | ~125 |
| `steps/PathHydrateStep.jsx` | ~115 |
| `steps/PathBodyStep.jsx` | ~15 |
| **Suma archivos paths/** | **~888** |

Antes del split: 835 ln + 251 (PathTransitions) + 180 (SenderoBar) + ... = bastante mas. La cifra clave: **PathRunner.jsx pasa de 835 a ~238 ln (-71%)**, por encima del objetivo de reduccion >=60%.

### Cabecera obligatoria de cada archivo nuevo

```jsx
/* PACE · Caminos · <Componente> · sesion 80 (split de PathRunner.jsx)
   <Descripcion breve del rol> */
```

Sin emojis, sin referencias al "antes" de la sesion (CLAUDE.md prohibe acumular historia en el codigo).

---

## Contrato uniforme de Step

### Decision: contrato minimo `(step, onExit(reason))`

```jsx
<PathStep
  step={...}                  // bloque del catalogo: { kind, routineId?, min?, optional? }
  onExit={(reason) => ...}    // reason: 'done' | 'skip'
/>
```

### Justificacion

El prompt propone un contrato mas amplio (`block`, `onDone`, `onSkip`, `onAbort`, `pathContext`). Razones para **rechazar** la version amplia:

1. **`block` vs `step`**: el resto del codigo (catalogo `state-paths.jsx`, helpers, comentarios) usa la palabra "step". Renombrar a "block" solo en la firma del prop introduce inconsistencia. Mantener "step".
2. **`onDone` + `onSkip` separados**: son menos expresivos que `onExit(reason)` y rompen el patron actual de 3/4 Steps. Hoy `PathHydrateStep` es el unico disidente -> uniformar a `onExit(reason)`.
3. **`onAbort`**: ningun Step actual dispara abandonar el Camino. Esa accion vive en `PathRunner` (`abandonPath()` desde `handleRequestExit` o `ExitConfirmModal.onConfirm`). Pasar un `onAbort` no usado es premature abstraction.
4. **`pathContext` (nombre, indice, total)**: ningun Step actual consume esta informacion. La lectura del progreso vive en `SenderoBar` y `PathTransitions`. Pasarlo seria muerto.

### Cambios reales en consumidores

| Consumidor | Antes | Despues |
|---|---|---|
| `PathBreatheStep` | `(step, onExit)` | igual |
| `PathFocusStep` | `(step, onExit)` | igual |
| `PathBodyStep` | `(step, onExit)` | igual |
| `PathHydrateStep` | `(onDone, onSkip)` | `(step, onExit)` |
| `PathRunner` (dispatch) | 4 ramas con firmas distintas | 4 ramas con misma firma |

**Diff esperado en PathRunner para PathHydrateStep:**

```jsx
// Antes
{step.kind === 'hydrate' && (
  <PathHydrateStep
    onDone={() => handleStepExit('done')}
    onSkip={() => handleStepExit('skip')}
  />
)}

// Despues
{step.kind === 'hydrate' && (
  <PathHydrateStep step={step} onExit={handleStepExit} />
)}
```

**Diff esperado dentro de PathHydrateStep:**

```jsx
// Antes
function PathHydrateStep({ onDone, onSkip }) {
  // ...
  const handleDrink = () => {
    if (typeof addWaterGlass === 'function') {
      try { addWaterGlass(1); } catch (e) {}
    }
    onDone();
  };
  // ...
  <button onClick={onSkip}>{t('path.hydrate.skip') || t('path.runner.skip')}</button>
  <button onClick={handleDrink}>{t('path.hydrate.drank')}</button>
}

// Despues
function PathHydrateStep({ step, onExit }) {
  // ...
  const handleDrink = () => {
    if (typeof addWaterGlass === 'function') {
      try { addWaterGlass(1); } catch (e) {}
    }
    onExit('done');
  };
  // ...
  <button onClick={() => onExit('skip')}>{t('path.hydrate.skip') || t('path.runner.skip')}</button>
  <button onClick={handleDrink}>{t('path.hydrate.drank')}</button>
}
```

Nota: el prop `step` no se consume hoy dentro de `PathHydrateStep`. Se acepta de momento por **consistencia de firma**; no es necesario removerlo aunque no se use. Hace explicito que es un Step.

---

## Contenido de `_shared.js`

```js
/* PACE · Caminos · Estilos compartidos entre Steps · sesion 80
   btnTypography: tipografia + radius comunes a botones outline e impactos.
   btnOutline: defaults del boton outline (sin padding -- cada Step decide). */

window.pathStepStyles = {
  btnTypography: {
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    borderRadius: 'var(--r-sm)',
  },
  btnOutline: {
    background: 'transparent',
    border: '1px solid var(--line-2)',
    color: 'var(--ink-2)',
    transition: 'all 180ms var(--ease)',
  },
};
```

### Como cada Step lo consume

**PathFocusStep:**
```js
const { btnTypography, btnOutline } = window.pathStepStyles;
const btnBase = { ...btnTypography, ...btnOutline, padding: '10px 22px' };
```

**PathHydrateStep:**
```js
const { btnTypography } = window.pathStepStyles;
const btnBase = { ...btnTypography, padding: '10px 28px' };
```

Cero cambio visual (mismas propiedades, misma cascada). El refactor solo deduplica los 6 keys tipograficos comunes.

---

## Contenido de `PathRunner.parts.jsx`

Tres componentes auxiliares que viven con PathRunner pero no son orquestador:

```jsx
/* PACE · Caminos · PathRunner parts · sesion 80
   Componentes auxiliares del overlay del Camino:
   - PathTopBar: barra superior con nombre del Camino + boton cerrar.
   - ExitConfirmModal: confirmacion in-app antes de abandonar.
   - StepError: fallback si un routineId no resuelve.
   Aislados aqui para que PathRunner.jsx quede solo con el orquestador. */

const { useEffect: useEffectPP, useRef: useRefPP } = React;

function PathTopBar({ pathName, onRequestExit }) { /* ... */ }
function ExitConfirmModal({ open, onCancel, onConfirm }) { /* ... */ }
function StepError({ routineId, onSkip }) { /* ... */ }

Object.assign(window, { PathTopBar, ExitConfirmModal, StepError });
```

PathRunner.jsx consume los 3 directamente desde window (mismo patron que SenderoBar, TimerDial, IntroCard, etc.).

---

## Contenido de `CompletionScreen.jsx`

Pantalla terminal del Camino, extraida palabra-por-palabra de PathRunner.jsx (lineas 104-309). Incluye:

- Constante local `CS_ROMAN` (numerales I-VII).
- Componente `CompletionScreen` con props `{ snapshot, onBack, fadeIn }`.

```jsx
/* PACE · Caminos · Pantalla de Camino completado · sesion 80
   SenderoBar al 100%, lista del recorrido (numerales romanos), logros
   desbloqueados durante el Camino y botones back/repeat.
   fadeIn=true: cross-fade 400ms al venir de OutroCard. */

const { useState: useStateCS, useEffect: useEffectCS } = React;

const CS_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function CompletionScreen({ snapshot, onBack, fadeIn }) { /* ... */ }

Object.assign(window, { CompletionScreen });
```

`CS_ROMAN` se queda como constante local del archivo (la decision s79 era no exportar hasta tener 3 consumidores; aqui sigue siendo solo 1: CompletionScreen).

---

## Orden de carga en `PACE.html`

Hoy:
```
SenderoBar.jsx
PathTransitions.jsx
PathRunner.jsx              <- contiene todo el monolito
```

Despues del split:
```
SenderoBar.jsx
PathTransitions.jsx
steps/_shared.js            <- NUEVO (debe ir antes de los Steps)
steps/PathBreatheStep.jsx   <- NUEVO
steps/PathFocusStep.jsx     <- NUEVO (consume _shared)
steps/PathHydrateStep.jsx   <- NUEVO (consume _shared)
steps/PathBodyStep.jsx      <- NUEVO
PathRunner.parts.jsx        <- NUEVO (PathTopBar, ExitConfirmModal, StepError)
CompletionScreen.jsx        <- NUEVO (usa SenderoBar)
PathRunner.jsx              <- consume todos los anteriores
```

Todos los Steps + `_shared.js` + `parts` + CompletionScreen DEBEN aparecer **antes** de `PathRunner.jsx`. El defensive `typeof X === 'function'` del PathRunner ya esta presente para IntroCard/StepIntro/OutroCard, asi que un cambio en orden no rompe al limite pero conviene ser preciso para no recurrir al fallback.

---

## Que se preserva (cero cambio funcional)

- 100% del comportamiento de cada Step (copy-paste literal + ajuste de imports/exports).
- Estilos inline tal cual estan.
- Tiempos, sonidos, persistencia, dispatch, transiciones, fade-in de CompletionScreen.
- Las 28 invariantes listadas en `session-80-audit.md`.

## Que NO se toca

- `SenderoBar.jsx`, `TimerDial.jsx`, `Toast.jsx`, `tokens.css`.
- Catalogo (`registry.js`), state layer (`state-paths.jsx`, `state-timer.jsx`, etc.).
- i18n (`strings.js`): cero claves nuevas.
- Comportamiento de Pomodoro home (`FocusTimer.jsx`).
- BreatheSession, MoveSession, HydrateModule.

---

## Riesgos del split + mitigaciones

| Riesgo | Mitigacion |
|---|---|
| Orden de `<script>` mal y un Step intenta consumir `pathStepStyles` antes de cargar | Insertar `_shared.js` ANTES de PathFocusStep.jsx y PathHydrateStep.jsx, verificable en PACE.html |
| `window.PathTopBar` (o similar) ya existe con otro contenido | Buscar conflictos con `Grep` antes de exportar |
| Cambio de firma de PathHydrateStep rompe consumidores externos | Solo PathRunner consume PathHydrateStep. Verificado con Grep |
| `_shared.js` no se incluye en el bundle standalone | `build-standalone.js` recorre `<script src>` en orden; al añadir `_shared.js` en PACE.html se incluye automaticamente. Tamaño +~200 bytes |
| CompletionScreen no encuentra `SenderoBar` global | SenderoBar.jsx se sigue cargando antes; CompletionScreen.jsx tambien -> orden respetado |

---

## Salida tras OK del usuario

Tras aprobar este contrato, procedo a Tarea 3: implementacion mecanica del split en este orden:

1. `steps/_shared.js`
2. `steps/PathBreatheStep.jsx`
3. `steps/PathFocusStep.jsx`
4. `steps/PathHydrateStep.jsx`
5. `steps/PathBodyStep.jsx`
6. `PathRunner.parts.jsx`
7. `CompletionScreen.jsx`
8. Reescritura de `PathRunner.jsx` (eliminacion de codigo migrado + uniformizacion de dispatcher)
9. Actualizacion de `PACE.html` (orden de carga)
10. Verificacion de metricas en cada archivo.

Despues, Tarea 4 (regresion), Tarea 6 (bump+build), Tarea 7 (docs).
