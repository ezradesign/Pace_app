# Sesion 82 -- diseno del split de `app/main.jsx`

**Fecha:** 2026-05-23
**Version actual:** v0.33.1
**Version objetivo:** v0.33.2 (patch)
**Punto de partida:** [session-82-audit.md](./session-82-audit.md)

---

## Marco general

`app/main.jsx` (600 ln) contiene un orquestador (`PaceApp`, 250 ln), dos
hijos puros (`TopBar` 67 ln + `topBarStyles` 12 ln, y `ActivityBar` 87 ln
+ 4 iconos `AB*` 54 ln), un bloque CSS responsive global (93 ln) y
boilerplate. La auditoria confirma cero acoplamientos problematicos: todo
es extraible.

Las tres variantes se diferencian en **donde se traza la linea entre
"orquestador" y "modulos auxiliares"** -- desde minima (solo ActivityBar
sale) hasta maximalista (solo queda composicion + state).

Patron de extraccion: identico al usado en s80 (`PathRunner.jsx` ->
`steps/*` + `parts.jsx`) y s81 (`strings.js` -> `strings/*`). Cada
archivo nuevo es un script `<script type="text/babel">` cargado en
`PACE.html` ANTES de `app/main.jsx`. Cada archivo termina con
`Object.assign(window, { ... })` para exponer su superficie publica.

Restricciones aplicadas a las tres variantes:
- Cero cambios de comportamiento, timing, copy ni estilos visuales.
- Cero introduccion de librerias o dependencias.
- Cero modificacion de archivos fuera de `app/main.jsx`, `app/main/*`,
  `PACE.html`, `state-core.jsx`, `sw.js`, docs.
- Cada archivo nuevo <200 ln (regla CLAUDE.md).
- `main.jsx` final <500 ln (idealmente <250).

---

## Variante A -- Minima

### Que extrae

Solo `ActivityBar.jsx` (el bloque mas grande, 141 ln).

### Estructura

```
app/
├── main.jsx                    (~459 ln; orquestador + CSS responsive + TopBar)
└── main/
    └── ActivityBar.jsx         (~155 ln; ActivityBar + 4 iconos AB* + Object.assign)
```

### Detalle por archivo

**`app/main/ActivityBar.jsx`** (~155 ln):
```jsx
/* PACE - ActivityBar (sesion 82 / v0.33.2)
   Barra inferior del shell: 4 chips compactos
   (Respira / Estira / Mueve / Hidratate).
   Extraido de main.jsx en split mecanico s82.
*/

const { useState: useStateAB } = React;  // (no usado actualmente, pero coherencia)

function ActivityBar({ onOpenLibrary, onOpenHydrate }) { /* ... 87 ln ... */ }

function ABBreathe() { /* ... */ }
function ABStretch() { /* ... */ }
function ABMove() { /* ... */ }
function ABDrop() { /* ... */ }

Object.assign(window, { ActivityBar });
```

**`app/main.jsx`** (~459 ln tras quitar 141 de ActivityBar):
- Header + alias (17 ln)
- CSS responsive injection (93 ln)
- `PaceApp` (250 ln)
- `TopBar` + `topBarStyles` (79 ln)
- `Object.assign` + bootstrap directo (8 ln)

### Modificaciones a `PACE.html`

Anyadir un `<script src>` antes de `main.jsx`:

```html
<script type="text/babel" src="app/main/ActivityBar.jsx"></script>
<script type="text/babel" src="app/main.jsx"></script>
```

### Metricas

| Metrica | Resultado |
|---|---|
| main.jsx final | **~459 ln** (reduccion -24%) |
| Cada archivo nuevo | 1 archivo, 155 ln (<200 OK) |
| Cumple <500 ln? | Si (459 < 500) |
| Cumple >50% reduccion? | **NO** (24%) |
| Esfuerzo estimado | ~15 min |

### Riesgo

**Bajo.** Cambio mecanico de 1 componente hijo puro. Solo necesita
preservar invariantes 4 (`window.ActivityBar`), 28 (orden carga PACE.html)
y los selectores data-attribute que el CSS responsive sigue tocando.

### Beneficio futuro

- Saca el bloque mas grande (141 ln) del orquestador.
- main.jsx baja a ~459 ln, dentro del limite de 500 pero **sigue siendo
  el archivo mas grande del proyecto fuera del catalogo de glifos**.
- No establece patron de carpeta `app/main/` -- 1 archivo solo es un
  outlier, no una convencion.

### Critica

No cumple la metrica `>50%` del prompt. Es la opcion mas conservadora
pero **deja deuda visible**: `main.jsx` sigue grande, sigue mezclando
CSS global con orquestacion, sigue con TopBar y `topBarStyles` dentro.

---

## Variante B -- Equilibrada

### Que extrae

`TopBar.jsx` + `ActivityBar.jsx` + `_responsive.js` (el bloque CSS global
sale como archivo IIFE separado, igual que `_shared.js` de paths/steps en
s80).

### Estructura

```
app/
├── main.jsx                    (~255 ln; orquestador puro)
└── main/
    ├── _responsive.js          (~105 ln; IIFE injects <style id="pace-main-responsive-css">)
    ├── TopBar.jsx              (~80 ln; TopBar + topBarStyles)
    └── ActivityBar.jsx         (~155 ln; ActivityBar + 4 iconos AB*)
```

### Detalle por archivo

**`app/main/_responsive.js`** (~105 ln):
```js
/* PACE - CSS responsive global del shell (sesion 82 / v0.33.2)
   Inyecta <style id="pace-main-responsive-css"> una sola vez.
   Reglas para data-pace-* selectors (TopBar, ActivityBar, main, sidebar).
   Extraido de main.jsx en split s82.
   Carga ANTES de main.jsx -- es config de layout, no componente.
*/

(function injectPaceMainResponsiveCss() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pace-main-responsive-css')) return;
  const s = document.createElement('style');
  s.id = 'pace-main-responsive-css';
  s.textContent = `
    /* ... 90 ln de CSS literal ... */
  `;
  document.head.appendChild(s);
})();
```

Decision de patron: IIFE auto-ejecutable. Sin exportar a window. La
inyeccion es un side effect del modulo, no una API publica.

**`app/main/TopBar.jsx`** (~80 ln):
```jsx
/* PACE - TopBar del shell (sesion 82 / v0.33.2)
   Barra superior: tabs Foco/Pausa/Larga + 3 iconos top-right
   (Stats / Logros / Tweaks). El icono Logros despacha
   CustomEvent('pace:open-achievements') -- los otros dos usan props.
   Extraido de main.jsx en split s82.
*/

function TopBar({ onOpenLibrary, onOpenHydrate, onOpenStats, onOpenTweaks }) { /* ... 67 ln ... */ }

const topBarStyles = { iconBtn: { /* ... */ } };

Object.assign(window, { TopBar });
```

**`app/main/ActivityBar.jsx`** (~155 ln): identico a Variante A.

**`app/main.jsx`** (~255 ln):
- Header simplificado (~10 ln; sin la nota responsive porque migra a _responsive.js)
- Hooks alias (1 ln)
- `PaceApp` (~240 ln, sin tocar -- es el orquestador)
- `Object.assign({ PaceApp })` (1 ln; solo PaceApp, TopBar/ActivityBar ya estan en window)
- Bootstrap directo (~6 ln)

### Modificaciones a `PACE.html`

Anyadir 3 `<script src>` antes de `main.jsx`:

```html
<script type="text/babel" src="app/main/_responsive.js"></script>
<script type="text/babel" src="app/main/TopBar.jsx"></script>
<script type="text/babel" src="app/main/ActivityBar.jsx"></script>
<script type="text/babel" src="app/main.jsx"></script>
```

Orden: `_responsive.js` primero (side effect ASAP), luego los dos
componentes hijos, luego el orquestador que los referencia.

### Metricas

| Metrica | Resultado |
|---|---|
| main.jsx final | **~255 ln** (reduccion -57%) |
| Cada archivo nuevo | 3 archivos: 105 + 80 + 155 ln (todos <200 OK) |
| Cumple <500 ln? | Si (255 < 500) |
| Cumple <250 ln idealmente? | Roza el limite (255 > 250 por ~5 ln; aceptable) |
| Cumple >50% reduccion? | **SI** (57%) |
| Esfuerzo estimado | ~30 min |

### Riesgo

**Bajo-medio.** El paso de mover el bloque CSS a un archivo
auto-ejecutable es la pieza mas delicada -- si el orden de carga falla
(p.ej. _responsive.js carga DESPUES de algun render de PaceApp), el shell
se renderiza unos ms con estilos default antes de aplicar las reglas
@media. **Verificacion runtime obligatoria post-implementacion.**

### Beneficio futuro

- Carpeta `app/main/` con 3 archivos: establece el patron para futuros
  componentes de shell (p.ej. si se anyade un futuro `Breadcrumb.jsx` o
  `StatusFooter.jsx`).
- main.jsx queda como **orquestador puro** -- solo state, hooks,
  handlers, return JSX. Sin componentes presentacionales internos.
- El CSS global de layout queda separado de la composicion -- mas facil
  de iterar (p.ej. cuando llegue el modo movil mejorado).
- Coherente con el patron establecido en s80 (`paths/steps/_shared.js`)
  y s81 (`i18n/strings/_bootstrap.js`).

### Critica

Tres archivos nuevos para una zona del codigo que historicamente solo
tenia uno. Si la app se mantiene compacta para siempre, es algo de
sobreingenieria pequena. Pero el patron de carpeta es consistente con
las dos sesiones anteriores y abre la puerta a futuro crecimiento.

`PaceApp` sigue dentro de `main.jsx` con sus 250 ln -- es lo correcto:
es el componente raiz, no debe extraerse a otro archivo (rompe la
convencion JSX -> archivo del mismo nombre o equivalente). Lo que SI
podria reducirse mas es lo que vive **dentro** de `PaceApp` (hooks de
listeners de CustomEvent + atajos T/S/L). Eso es Variante C.

---

## Variante C -- Maximalista

### Que extrae

Todo lo de B + 2 hooks que viven dentro de `PaceApp`:
- `useOverlayManager()` -- agrupa los 4 listeners de CustomEvent
  (`pace:cow-click`, `pace:open-achievements`, `pace:open-support`,
  `pace:open-welcome`) + el contador `cowClicks` + el efecto de unlock
  del logro secreto.
- `useGlobalKeyboard()` -- escucha keydown global para los atajos
  T (Tweaks) / S (Stats) / L (Achievements), filtrando INPUT/TEXTAREA.

### Estructura

```
app/
├── main.jsx                    (~180 ln; composicion casi pura)
└── main/
    ├── _responsive.js          (~105 ln)
    ├── TopBar.jsx              (~80 ln)
    ├── ActivityBar.jsx         (~155 ln)
    ├── useOverlayManager.jsx   (~55 ln)
    └── useGlobalKeyboard.jsx   (~30 ln)
```

### Detalle de los nuevos hooks

**`app/main/useOverlayManager.jsx`** (~55 ln):
```jsx
/* PACE - hook useOverlayManager (sesion 82 / v0.33.2)
   Agrupa los 4 listeners de CustomEvent que coordinan apertura
   de overlays desde fuera de PaceApp (Sidebar, atajos, etc.):
   pace:cow-click, pace:open-achievements, pace:open-support, pace:open-welcome.
   Tambien gestiona el contador cowClicks -> logro secreto.
   Recibe los setters de PaceApp para abrir cada overlay.
*/

const { useState: useStateOM, useEffect: useEffectOM } = React;

function useOverlayManager({ setOpenAchievements, setOpenSupport, setOpenWelcome }) {
  const [cowClicks, setCowClicks] = useStateOM(0);

  useEffectOM(() => {
    if (cowClicks >= 10) unlockAchievement('secret.cow.click');
  }, [cowClicks]);

  useEffectOM(() => {
    const h = () => setCowClicks(c => c + 1);
    window.addEventListener('pace:cow-click', h);
    return () => window.removeEventListener('pace:cow-click', h);
  }, []);

  useEffectOM(() => {
    const h = () => setOpenAchievements(true);
    window.addEventListener('pace:open-achievements', h);
    return () => window.removeEventListener('pace:open-achievements', h);
  }, []);

  useEffectOM(() => {
    const h = () => setOpenSupport(true);
    window.addEventListener('pace:open-support', h);
    return () => window.removeEventListener('pace:open-support', h);
  }, []);

  useEffectOM(() => {
    const h = () => setOpenWelcome(true);
    window.addEventListener('pace:open-welcome', h);
    return () => window.removeEventListener('pace:open-welcome', h);
  }, []);
}

Object.assign(window, { useOverlayManager });
```

**`app/main/useGlobalKeyboard.jsx`** (~30 ln):
```jsx
/* PACE - hook useGlobalKeyboard (sesion 82 / v0.33.2)
   Escucha keydown global para los atajos T (Tweaks) / S (Stats) /
   L (Achievements). Ignora si focus esta en INPUT/TEXTAREA.
   Toggle (set(o => !o)), no set absoluto.
*/

const { useEffect: useEffectGK } = React;

function useGlobalKeyboard({ setOpenTweaks, setOpenStats, setOpenAchievements }) {
  useEffectGK(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 't' || e.key === 'T') setOpenTweaks(o => !o);
      if (e.key === 's' || e.key === 'S') setOpenStats(o => !o);
      if (e.key === 'l' || e.key === 'L') setOpenAchievements(o => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

Object.assign(window, { useGlobalKeyboard });
```

**`app/main.jsx`** (~180 ln):
```jsx
/* PACE - main orchestrator (sesion 82 / v0.33.2)
   Composicion del shell + state local de overlays + handlers.
   CSS responsive en _responsive.js. TopBar y ActivityBar en main/.
   Listeners de CustomEvent en useOverlayManager. Atajos en useGlobalKeyboard.
*/

const { useState: useStateMain } = React;

function PaceApp() {
  const [state, set] = usePace();
  const { t } = useT();
  const [view, setView] = useStateMain({ type: 'home' });

  const [openLibrary, setOpenLibrary] = useStateMain(null);
  const [openHydrate, setOpenHydrate] = useStateMain(false);
  const [openAchievements, setOpenAchievements] = useStateMain(false);
  const [openStats, setOpenStats] = useStateMain(false);
  const [openTweaks, setOpenTweaks] = useStateMain(false);
  const [openBreakMenu, setOpenBreakMenu] = useStateMain(false);
  const [openSupport, setOpenSupport] = useStateMain(false);
  const [openWelcome, setOpenWelcome] = useStateMain(false);
  const [safetyRoutine, setSafetyRoutine] = useStateMain(null);

  useOverlayManager({ setOpenAchievements, setOpenSupport, setOpenWelcome });
  useGlobalKeyboard({ setOpenTweaks, setOpenStats, setOpenAchievements });
  useSupportAutoTrigger(setOpenSupport);
  useFirstTimeWelcome(setOpenWelcome);

  // Handlers (5)
  const handleStartBreathe = (routine) => { /* ... */ };
  const handleStartMove = (routine) => { /* ... */ };
  const handleStartExtra = (routine) => { /* ... */ };
  const handleFocusFinish = () => setOpenBreakMenu(true);
  const handleBreakChoice = (choice) => { /* ... */ };

  return ( /* ... JSX root ... */ );
}

Object.assign(window, { PaceApp });

if (typeof document !== 'undefined' && document.getElementById('pace-root')) {
  const root = ReactDOM.createRoot(document.getElementById('pace-root'));
  root.render(<PaceApp />);
}
```

### Modificaciones a `PACE.html`

Anyadir 5 `<script src>` antes de `main.jsx`:

```html
<script type="text/babel" src="app/main/_responsive.js"></script>
<script type="text/babel" src="app/main/useOverlayManager.jsx"></script>
<script type="text/babel" src="app/main/useGlobalKeyboard.jsx"></script>
<script type="text/babel" src="app/main/TopBar.jsx"></script>
<script type="text/babel" src="app/main/ActivityBar.jsx"></script>
<script type="text/babel" src="app/main.jsx"></script>
```

Hooks antes que componentes (siguen la regla "definir antes de usar"
que el zero-build de Babel-standalone impone).

### Metricas

| Metrica | Resultado |
|---|---|
| main.jsx final | **~180 ln** (reduccion -70%) |
| Cada archivo nuevo | 5 archivos: 30 a 155 ln (todos <200 OK) |
| Cumple <500 ln? | Si (180 < 500) |
| Cumple <250 ln idealmente? | Si (180 < 250) |
| Cumple >50% reduccion? | **SI** (70%) |
| Esfuerzo estimado | ~50-60 min |

### Riesgo

**Medio.** Los hooks reciben setters de useState de PaceApp. Tres puntos
de validacion necesarios:
1. El cierre `useEffect(..., [])` con setter como closure: setters de
   useState son estables, pero **el estilo del codebase ya hace
   exactamente esto** en `useSupportAutoTrigger` y `useFirstTimeWelcome`.
   No es un patron nuevo.
2. El contador `cowClicks` vive dentro de `useOverlayManager`. Si se
   quisiera leer desde fuera (p.ej. UI debug "vacas clickeadas: N"),
   habria que retornarlo desde el hook. **Hoy NO se consume** -- vive
   y muere dentro. Decision: NO retornarlo (premature export).
3. Posible problema de cleanup en HMR / dev: cada re-mount de PaceApp
   adjunta y desadjunta listeners. Ya funciona asi en el codigo
   actual, sin regresion.

### Beneficio futuro

- `main.jsx` queda casi inviolable: composicion + state, sin logica
  imperativa. Cualquier cambio de UI no toca este archivo.
- `useOverlayManager` y `useGlobalKeyboard` son hooks **conceptualmente
  reutilizables**. Hoy con un solo consumidor (PaceApp), no aportan, pero
  si en el futuro hay un segundo entry point (p.ej. `EmbedApp` para
  iframe), comparten la logica.
- Arquitectura escalable: muestra "como hacer las cosas" para nuevos
  hooks de shell. Patron `app/main/` con hooks + componentes.

### Critica

**Sobreingenieria documentada.** Los 2 hooks tienen exactamente 1
consumidor hoy (PaceApp). El propio s80 (split de PathRunner) explicito
"premature abstraction" para evitar extraer cosas con 1 consumidor.

Counter-argumento: la s81 (split de strings.js) **si** creo
`_bootstrap.js` con un solo "consumidor conceptual" (el sistema i18n).
La logica era "agrupar piezas pequenas en una raiz limpia". Aplicar el
mismo criterio aqui justificaria los hooks.

Punto medio que dejaria los hooks fuera de scope: si la s82 quiere ser
"split mecanico puro" (igual que s80 y s81), los hooks SON refactor
semantico, no split. Salen del scope.

---

## Tabla comparativa

| Criterio | A -- Minima | B -- Equilibrada | C -- Maximalista |
|---|---|---|---|
| Archivos nuevos | 1 | 3 | 5 |
| `main.jsx` final (ln) | ~459 | ~255 | ~180 |
| Reduccion | -24% | -57% | -70% |
| Cumple metrica prompt (>50%) | **NO** | si | si |
| Riesgo | Bajo | Bajo-medio | Medio |
| Esfuerzo | 15 min | 30 min | 50-60 min |
| Hooks extraidos | -- | -- | 2 |
| Establece carpeta `app/main/` | NO (1 archivo) | si | si |
| Patron coherente con s80/s81 | Parcial (1 archivo solo) | Si (carpeta `main/`) | Si + extra (hooks) |
| Premature abstraction | Cero | Cero | 2 hooks con 1 consumidor |
| Cuanto "queda por hacer" tras s82 | Mucho (deuda visible) | Poco (puede iterarse si crece) | Nada (cerrado) |

---

## Discusion final (sin recomendar -- decision del usuario)

**Si la prioridad es coherencia con s80 y s81** (split mecanico puro,
sin refactor semantico):
- **Variante A** es lo mas analoga: extrae 1 cosa, mantiene
  mecanico. Pero no cumple metrica del prompt.
- **Variante B** es la traduccion directa del prompt: extrae los 2
  componentes hijos + el bloque CSS como helper, deja `PaceApp`
  intacto. Cumple metrica con holgura. Riesgo bajo. La carpeta
  `app/main/` queda establecida como patron para futuros componentes
  de shell.

**Si la prioridad es maximizar limpieza arquitectonica**:
- **Variante C** deja main.jsx en 180 ln (composicion + state +
  handlers + JSX), con toda la logica imperativa en hooks reusables.
  Acepta premature abstraction como precio.

**Tradeoff dominante:** las metricas del prompt favorecen B o C
(reduccion >50%). El estilo "premature abstraction = no" del codebase
favorece A o B (sin hooks de 1 consumidor). **B esta en la
interseccion** -- cumple metrica y respeta el estilo.

---

## Cuestiones abiertas (pendientes de decision del usuario)

1. **Variante elegida (A/B/C).**
2. **Mantener `Object.assign(window, { TopBar, ActivityBar })`** en
   Variante B/C, aunque ningun consumidor externo los use? Recomendacion
   del audit: si (estabilidad de superficie publica). Confirmar.
3. **Naming del responsive helper**: `_responsive.js` (prefijo `_` como
   `_shared.js` / `_bootstrap.js` -- senalizado como "helper, no
   componente") vs `responsive.js` plano. Recomendacion: `_responsive.js`
   por coherencia.
4. **Mantener arranque directo en `#pace-root`** (L597-600)? Es legacy
   de v0.12, sin consumidor activo. Recomendacion: mantener (cero coste,
   removerlo abre debate). Confirmar.

---

**Pausa para decision del usuario antes de Tarea 3 (implementacion).**
