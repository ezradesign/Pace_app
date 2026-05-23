# Sesion 82 -- refactor(main): split de `app/main.jsx`

**Fecha:** 2026-05-23
**Version:** v0.33.1 -> **v0.33.2** (patch, refactor puro)
**Tipo:** refactor mecanico sin cambios funcionales / visuales / copy / timing
**Modelo:** Opus Max

**Documentos producidos:**
- [session-82-audit.md](./session-82-audit.md) -- auditoria estructural inicial.
- [session-82-design.md](./session-82-design.md) -- 3 variantes razonadas (A/B/C).

---

## TL;DR

`app/main.jsx` (600 ln) -> split en `app/main/` con 3 archivos hermanos
(`_responsive.js` + `TopBar.jsx` + `ActivityBar.jsx`). Variante B
(equilibrada) aprobada del design. `PaceApp` queda como orquestador
puro en main.jsx (279 ln, -53%). Cero cambios en consumidores externos,
cero regresiones, 16/16 invariantes runtime verificadas. Bundle:
614 KB -> 617 KB (+3 KB de cabeceras de doc-comment).

Tercer split mecanico consecutivo (s80 PathRunner, s81 strings, s82
main) -- el patron `app/<carpeta>/` se establece como convencion del
codebase para componer modulos con piezas extraidas.

---

## Auditoria (resumen)

Detalle completo en [session-82-audit.md](./session-82-audit.md).

### Estado previo de main.jsx

`app/main.jsx` (600 ln exactas, sin tocar desde s53) contenia:

| Rango | Seccion | Lineas | Responsabilidad |
|---|---|---:|---|
| 1-16 | Header doc-comment | 16 | Copyright + nota responsive s22 |
| 18 | Hooks alias | 1 | `useStateMain` + `useEffectMain` |
| 20-112 | CSS responsive injection | 93 | `<style id="pace-main-responsive-css">` con @media globales |
| 114-363 | `PaceApp` orquestador | 250 | 9 useState + 8 useEffect + 5 handlers + 138-ln JSX |
| 365-431 | `TopBar` | 67 | Tabs Foco/Pausa/Larga + 3 iconos top-right |
| 433-444 | `topBarStyles` const | 12 | Solo `iconBtn` style |
| 448-534 | `ActivityBar` | 87 | 4 chips + responsive grid |
| 538-591 | 4 iconos SVG `AB*` | 54 | ABBreathe / ABStretch / ABMove / ABDrop |
| 593 | `Object.assign(window)` | 1 | Expone PaceApp, TopBar, ActivityBar |
| 595-600 | Arranque directo `#pace-root` | 6 | Legacy v0.12 |

### Acoplamientos detectados

**Ninguno problematico.** `TopBar` y `ActivityBar` son hijos puros:
- Reciben todas sus dependencias por props (`onOpen*`) o por hooks de
  scope global (`usePace`, `useT`).
- No tienen consumidor externo (verificado por Grep en todo el repo).
- El bloque CSS responsive es global por design (toca selectores
  de ambos componentes + main content + sidebar handle + fallback dvh).

### Patron overlay via CustomEvent

`PaceApp` actua tanto de emisor como receptor:
- Recibe: `pace:cow-click`, `pace:open-achievements`, `pace:open-support`,
  `pace:open-welcome`.
- Despacha: `pace:open-achievements` (desde el icono Logros del TopBar).

Asimetria intencional: Stats y Tweaks abren via prop directa (`onOpenStats`/
`onOpenTweaks`); Logros abre via CustomEvent para consistencia con el
boton equivalente del Sidebar.

`PathRunner` y `PathsLibrary` se montan siempre y se auto-gestionan via
sus propios CustomEvent (`pace:open-paths-library`, etc.). No coordinan
con state de `PaceApp`.

### Invariantes detectadas: 29

29 invariantes numeradas en el audit (montaje, exposicion a window,
bloque CSS responsive, comportamientos clave de modales, coordinacion,
orden de carga en PACE.html, edge cases mobile).

### Edge cases contemplados: 17

Cubren cambio idioma en caliente, recarga durante overlays/sessions,
keyboard shortcuts con focus en INPUT, mobile <=768px, mobile + alto
<=720, fallback dvh vs vh, guard del style block, etc.

### Deudas tecnicas detectadas (NO arregladas en s82)

| ID | Deuda | Razon |
|---|---|---|
| D-1 | `topBarStyles` solo tiene 1 key (`iconBtn`); patron "const styles" overkill | Cosmetico. Mantener convencion CLAUDE.md |
| D-2 | Asimetria Achievements (CustomEvent) vs Stats/Tweaks (prop) en TopBar | Funcional y consistente con Sidebar. Refactor UX fuera de scope |
| D-3 | `TopBar`/`ActivityBar` expuestos a `window` sin consumidor externo | Mantener por estabilidad de superficie publica |
| D-4 | `view` state no persiste recarga -> sesiones fullscreen efimeras | Intencional. Persistencia entraria en debate UX |
| D-5 | Arranque directo en `#pace-root` (L597-600) es legacy de v0.12 | Sin coste, sin consumidor activo, removerlo abre debate |

---

## Variantes propuestas (design)

Detalle completo en [session-82-design.md](./session-82-design.md).

3 variantes con metricas y critica:

- **A -- Minima**: solo `ActivityBar.jsx`. main.jsx -> ~459 ln (-24%).
  **NO cumple metrica `>50%`** del prompt.
- **B -- Equilibrada (aprobada)**: `_responsive.js` + `TopBar.jsx` +
  `ActivityBar.jsx`. main.jsx -> ~255 ln estimado, **279 ln real (-53%)**.
  Sin extraer hooks (PaceApp intacto). Cumple metrica.
- **C -- Maximalista**: B + hook `useOverlayManager` + hook
  `useGlobalKeyboard`. main.jsx -> ~180 ln (-70%). Premature abstraction:
  2 hooks con 1 consumidor.

El usuario delego la decision final: "la que sea mas profesional".
Eleccion: **B**. Razones:
- Cumple metrica del prompt (>50% reduccion).
- Respeta el principio "no premature abstraction" del codebase (mismo
  criterio usado en s80 con `onAbort`).
- Establece `app/main/` como carpeta hermana de `app/paths/steps/`
  (s80) y `app/i18n/strings/` (s81). Tercer split coherente con el
  patron del codebase.
- `PaceApp` queda intacto como orquestador, sin partir su logica en
  hooks sin segundo consumidor.

---

## Implementacion

### Archivos nuevos (3)

```
app/main/
├── _responsive.js          (105 ln; IIFE inyecta <style> globales)
├── TopBar.jsx              (106 ln; TopBar + topBarStyles + window expose)
└── ActivityBar.jsx         (170 ln; ActivityBar + 4 iconos AB* + window expose)
```

`_responsive.js` es una IIFE auto-ejecutable con guard `getElementById`.
No expone nada a `window` -- la inyeccion del style block es su side
effect. Patron coherente con `_shared.js` (s80) y `_bootstrap.js` (s81).

`TopBar.jsx` contiene `function TopBar(props)` + `const topBarStyles`
+ `Object.assign(window, { TopBar })`. Comentarios documentan la
asimetria Logros (CustomEvent) vs Stats/Tweaks (prop).

`ActivityBar.jsx` contiene `function ActivityBar(props)` + los 4 iconos
SVG `ABBreathe/ABStretch/ABMove/ABDrop` (cohesion: solo los usa
`ActivityBar`) + `Object.assign(window, { ActivityBar })`.

### Archivos modificados (4)

- **`app/main.jsx`** -- reescrito (600 -> 279 ln, -53%). Contiene SOLO:
  header reducido, alias hooks, `function PaceApp()` integro,
  `Object.assign(window, { PaceApp })`, arranque directo `#pace-root`.
- **`PACE.html`** -- 3 nuevos `<script src>` insertados antes de
  `main.jsx`, en orden: `_responsive.js` -> `TopBar.jsx` -> `ActivityBar.jsx`.
  Comentario explicativo del orden y razon. Titulo bump a `v0.33.2`.
- **`app/state-core.jsx`** -- `PACE_VERSION = 'v0.33.2'`.
- **`sw.js`** -- `CACHE_NAME = 'pace-v0.33.2'`.

### Cabecera tipica de los archivos nuevos

```jsx
/* PACE · Foco · Cuerpo
   Copyright © 2026 ezradesign
   Licensed under the Elastic License 2.0 — see LICENSE

   <Componente> (sesion 82 / v0.33.2).
   <Resumen funcional>.
   Extraido literal de main.jsx (lineas X-Y) en split mecanico s82.

   Notas de comportamiento (preservadas):
   - ...
   - data-pace-* selectors usados por _responsive.js: ...

   Props: ...
*/
```

### Orden de extraccion (mismo patron que s80)

1. **Crear archivos auxiliares** (`_responsive.js`, `TopBar.jsx`,
   `ActivityBar.jsx`) en paralelo, copy-paste literal desde main.jsx.
2. **Actualizar PACE.html** anyadiendo los 3 nuevos `<script src>`
   antes de `main.jsx`.
3. **Verificacion intermedia**: en este punto `TopBar`/`ActivityBar`
   estan definidos DOS VECES (una en cada archivo nuevo, otra en
   main.jsx aun sin tocar). En JavaScript, function declarations con
   mismo nombre sobrescriben; el ultimo en evaluarse gana. Como ambas
   versiones son identicas (copy-paste literal), el comportamiento es
   indistinguible. **Si algun archivo nuevo tiene un error, el browser
   lo detecta antes de que toquemos main.jsx.**
4. **Reescribir main.jsx** quitando lo extraido.

### Metricas finales

| Archivo | Lineas | Target design |
|---|---:|---:|
| `app/main.jsx` (final) | **279** | 255 |
| `app/main/_responsive.js` | 105 | 105 |
| `app/main/TopBar.jsx` | 106 | 80 |
| `app/main/ActivityBar.jsx` | 170 | 155 |
| **Suma 3 archivos nuevos** | **381** | 340 |
| Reduccion main.jsx | **-53%** (600 -> 279) | ~-57% |
| Original | 600 | -- |

main.jsx final esta 24 ln por encima del target (279 vs 255). Diferencia
atribuible a comentarios preservados de los useEffect listeners (el
contenido del orquestador es identico al original, solo se reformatean
las cabeceras). Sigue dentro del rango `150-280 ln` del prompt.

Cero duplicacion entre archivos: `topBarStyles` y los 4 iconos `AB*`
viven cada uno con su unico consumidor.

---

## Verificacion (Tarea 4)

### Verificacion estatica

- `node build-standalone.js`: **58 archivos validados** (10 .js + 48 .jsx).
  Antes: 55. Diferencia: +3 archivos nuevos en `main/`. ✓
- `validateInlineScripts`: 2 scripts inline validados. ✓
- Bundle generado limpio. ✓

### Verificacion intermedia (3 archivos cargados, main.jsx sin tocar)

Hard reload en preview local (`localhost:8765`):
- ✅ Console errors: 0 (solo warnings de Babel-standalone in-browser).
- ✅ `typeof PaceApp/TopBar/ActivityBar` = function.
- ✅ `<style id="pace-main-responsive-css">` presente.
- ✅ `[data-pace-app-root]`, `[data-pace-topbar]`, `[data-pace-activitybar]`
  presentes con 4 chips, 3 tabs, 3 iconos.

### Verificacion runtime tras reescribir main.jsx (16 invariantes)

Cubierta en 4 fases del prompt (4.1 a 4.4):

#### Fase 4.1 -- TopBar

- ✅ Tabs Foco/Pausa/Larga: click "Larga" -> `state.focusMode='larga'`;
  click "Foco" restaura.
- ✅ Icono Stats: click abre modal con z-index 100, texto "Estadisticas/Ritmo".
  Via prop `onOpenStats`.
- ✅ Icono Logros: click despacha `pace:open-achievements`. Listener
  en `PaceApp` abre modal "Colección". **Invariante mas critica del
  split** -- el CustomEvent debe atravesar el boundary entre TopBar.jsx
  y main.jsx. Verificado.
- ✅ Icono Tweaks: click abre modal con z-index 80, texto "PanelAjustes".
  Via prop `onOpenTweaks`.
- ✅ Cambio idioma ES->EN via Tweaks: tabs pasan a Focus/Pause/Long,
  aria-labels a View stats/View achievements/Open tweaks, chips
  ActivityBar a Breathe/Stretch/Move/Hydrate + subs. Cambio EN->ES:
  reverso correcto.

#### Fase 4.2 -- ActivityBar

- ✅ 4 chips presentes, i18n correcto ES (Respira/Estira/Mueve/Hidratate +
  sublabels "ritmo, calma" / "afloja tension" / "cuerpo activo" / "agua ahora").
- ✅ Click chip Respira: abre `BibliotecaRespiración` (z=100).
- ✅ Click chip Estira: abre `BibliotecaEstira`.
- ✅ Click chip Mueve: abre `BibliotecaMueve`.
- ✅ Click chip Hidratate: abre `HidrataciónHidrátate`.
- ✅ Todos cierran con ESC.

#### Fase 4.3 -- Atajos + cowClicks + overlays + recarga

- ✅ Atajo `S`: toggle Stats (open/close).
- ✅ Atajo `T`: toggle Tweaks (open/close).
- ✅ Atajo `L`: toggle Achievements (open/close).
- ✅ cowClicks: tras delete + disparar 10 events `pace:cow-click`,
  `secret.cow.click` aparece en `getState().achievements`.
- ✅ CustomEvent `pace:open-paths-library`: PathsLibrary overlay abre
  (z=900, texto "Todos los caminos").
- ✅ Persistencia: `focusMode='larga'` se guarda en localStorage y
  sobrevive recarga. Tab "Larga" se muestra como activa post-reload.

#### Fase 4.4 -- Edge cases

- ✅ Atajo `T` con focus en INPUT: NO abre Tweaks (skip por check
  tagName INPUT/TEXTAREA).
- ✅ Guard del style block: re-inyeccion via IIFE manual no anyade
  duplicado (cuenta `#pace-main-responsive-css` = 1 antes y despues).
- ✅ Fallback dvh: bloque CSS contiene `100dvh` y `100vh` (2815 bytes
  preservados literal).
- ✅ Mobile <=768px: tabs ocultos por `[data-pace-tabs]{display:none}`
  via @media (verificado en viewport 406x730: 3 botones existen en
  DOM pero `display=none`).

### Console errors a lo largo de todo el ciclo

**Cero.** Solo warnings esperados de Babel-standalone in-browser
transformer (uno por cada `<script type="text/babel">` cargado).

---

## Decisiones tomadas

| ID | Decision | Razon |
|---|---|---|
| D1 | Variante B aprobada (3 archivos: `_responsive.js` + `TopBar.jsx` + `ActivityBar.jsx`) -- no A ni C | A no cumple metrica >50%. C introduce premature abstraction (hooks con 1 consumidor). B esta en la interseccion: cumple metrica + respeta estilo del codebase |
| D2 | Carpeta `app/main/` -- coherente con `app/paths/steps/` (s80) y `app/i18n/strings/` (s81) | Tercer split mecanico consecutivo con el mismo patron de carpeta hermana |
| D3 | Bloque CSS responsive a `_responsive.js` (IIFE), no inline en TopBar/ActivityBar | El `<style>` toca selectores de AMBOS componentes + main content + sidebar handle. Es config global de layout, no de un componente. Prefijo `_` lo marca como helper |
| D4 | `topBarStyles` viaja con TopBar.jsx; los 4 iconos `AB*` con ActivityBar.jsx | Cada uno tiene exactamente 1 consumidor (verificado por Grep). Mantener juntos respeta cohesion |
| D5 | NO extraer hooks (variante C descartada) | Premature abstraction: 1 consumidor hoy. Si en el futuro hay un segundo entry point (p.ej. EmbedApp), reconsiderar |
| D6 | `Object.assign(window, { TopBar, ActivityBar })` preservado (desde sus archivos respectivos) | Ningun consumidor externo, pero estabilidad de superficie publica. Removerlo abre debate sin beneficio |
| D7 | Arranque directo en `#pace-root` (L597-600) preservado | Legacy de v0.12. Cero coste, removerlo abre debate -- fuera de scope refactor mecanico |
| D8 | `build-standalone.js` sin cambios | `validateAppFiles` walkea `app/` recursivo. Los 3 nuevos se descubren automatico. Verificado: 58 archivos (55 previos + 3 nuevos) |
| D9 | Reusar preview server local heredado de s80 (`.claude/static-server.js`) | Sin dependencias externas. Permite las 16 verificaciones runtime de la Tarea 4 |

---

## Build

- `PACE_standalone.html`: **617 KB (632,064 bytes)**. +3,138 bytes vs
  v0.33.1 (628,926; +0.5%). Crecimiento por cabeceras de doc-comment
  de los 3 archivos nuevos + 2 `Object.assign` + comentarios
  preservados. Estimado en design: +1-2 KB; real: +3 KB (cabeceras
  mas extensas).
- `index.html`: byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `66455A340EBC492CBA07F65FDBE7994345F51A77679091CCFEFF32576F387EFD`.
- 58 archivos validados (10 .js + 48 .jsx) -- antes 55.
- Backup creado: `backups/PACE_standalone_v0.33.1_20260523.html` (614 KB,
  pristino del publicado en s81). Cap 20 mantenido: rotado el mas
  antiguo `v0.27.6_20260511.html`.

`scripts/check-session.ps1`: avisos esperables (cambios sin commitear --
pendiente del cierre Git manual; rango de tamaño del script
desactualizado -- documentado en s79/s80/s81 tambien).

---

## Archivos modificados / nuevos / eliminados

### Nuevos

- `app/main/_responsive.js` (105 ln)
- `app/main/TopBar.jsx` (106 ln)
- `app/main/ActivityBar.jsx` (170 ln)
- `backups/PACE_standalone_v0.33.1_20260523.html` (614 KB; copia del v0.33.1 publicado)
- `docs/sessions/session-82-audit.md`
- `docs/sessions/session-82-design.md`
- `docs/sessions/session-82-main-split.md` (este archivo)

### Modificados

- `app/main.jsx` (600 -> 279 ln; -321 ln)
- `PACE.html` (+ 10 ln para 3 nuevos `<script src>` + comentario explicativo; bump titulo `v0.33.2`)
- `app/state-core.jsx` (PACE_VERSION bump)
- `sw.js` (CACHE_NAME bump)
- `PACE_standalone.html` + `index.html` (rebuild)
- `STATE.md` (cabecera, tabla archivos, backups, ultima sesion, decisiones, deuda)
- `CHANGELOG.md` (entrada v0.33.2 + degradacion de v0.33.0 a fila-de-enlace, detalle nuevo de v0.33.2)

### Eliminados

- `backups/PACE_standalone_v0.27.6_20260511.html` (rotacion cap 20)

---

## Diferido a sesiones siguientes

- **Variante C (hooks)**: extraer `useOverlayManager` (4 listeners
  CustomEvent + cowClicks) y `useGlobalKeyboard` (atajos T/S/L) cuando
  haya un segundo entry point que reutilice esa logica. Hoy no aporta.
- **`app/achievements/Achievements.jsx`** (~500 ln, MEDIA) -- siguiente
  candidato natural de deuda. Catalogo a `catalog.js`.
- **Deudas semanticas i18n D-1/D-2/D-3** heredadas de s81 (override
  silencioso strings-content.js, duplicidad "Hecho hoy", inconsistencia
  path/paths).
- **Catalog split Move/Stretch**: opcional, bajo coste con `steps/` ya
  extraido (s80).
- **`scripts/check-session.ps1`** -- actualizar rango de tamaño
  (530-600 KB desactualizado; real 605-617 KB). Avisa en cada cierre.
  No urgente.
- **`README.md`** -- pendiente polish pre-Reddit (reservado para s84).

---

## Mensaje de commit propuesto

```
refactor(main): split main.jsx en main/ (_responsive + TopBar + ActivityBar) (v0.33.2)
```
