# Sesion 82 -- auditoria estructural de `app/main.jsx`

**Fecha:** 2026-05-23
**Version actual:** v0.33.1
**Version objetivo:** v0.33.2 (patch, refactor puro)
**Archivo bajo auditoria:** `app/main.jsx` (600 ln exactas; sin tocar desde s53)

---

## 0. Resultado de precondiciones (Tarea 0)

| # | Precondicion | Resultado | Evidencia |
|---|---|---|---|
| 1 | `git status` limpio | OK | `(clean)` -- HEAD `90fcb1c` |
| 2 | `PACE_VERSION === 'v0.33.1'` | OK | `app/state-core.jsx:13` |
| 3 | `CACHE_NAME === 'pace-v0.33.1'` | OK | `sw.js:1` |
| 4 | `HEAD == origin/main` | OK | Ambos `90fcb1cbcd01c3e444d162eca410ec99433692d2` |
| 5 | Lectura STATE/CLAUDE/s80/s81 | OK | -- |
| 6 | Standalone v0.33.1 carga sin errores | OK | preview localhost:8765, console errors=0, `PACE_VERSION='v0.33.1'`, `PaceApp/TopBar/ActivityBar` = function, `<title>` v0.33.1 |
| 7 | `app/main.jsx` ~600 ln | OK | 600 ln exactas |

Todas las precondiciones pasan. Procedo a Tarea 1.

---

## 1.1 Estado del orquestador

### Tabla de secciones (`app/main.jsx`, 600 ln)

| Rango | Seccion | Responsabilidad | Lineas | Dependencias |
|---:|---|---|---:|---|
| 1-16 | Header doc-comment | Copyright + nota responsive s22 | 16 | -- |
| 18 | Hooks alias | `useStateMain` + `useEffectMain` (sufijo evita shadowing global) | 1 | `React.useState/useEffect` |
| 20-112 | Bloque CSS responsive global | Inyecta `<style id="pace-main-responsive-css">` una sola vez. 90 ln de reglas `@media` para movil/desktop sobre data-attributes | 93 | DOM `document` |
| 114-363 | `PaceApp` | Orquestador raiz: hooks, 9 estados, 8 useEffect, 5 handlers, 138-ln JSX | 250 | `usePace`, `useT`, `unlockAchievement`, `useSupportAutoTrigger`, `useFirstTimeWelcome`, ~20 componentes hijos |
| 365-431 | `TopBar` | Barra superior: tabs Foco/Pausa/Larga (centrados absolute) + 3 iconos top-right (Stats / Logros / Tweaks) | 67 | `usePace`, `useT`, `topBarStyles` |
| 433-444 | `topBarStyles` | Const local con `iconBtn` style (12 keys) | 12 | -- |
| 448-534 | `ActivityBar` | Barra inferior: 4 chips Respira/Estira/Mueve/Hidratate + Meta + responsive grid | 87 | `usePace`, `useT`, `Meta` (Primitives), `ABBreathe/Stretch/Move/Drop` |
| 538-591 | 4 iconos SVG inline | `ABBreathe`, `ABStretch`, `ABMove`, `ABDrop`. Stroke fino en currentColor | 54 | -- |
| 593 | `Object.assign(window, {...})` | Expone `PaceApp`, `TopBar`, `ActivityBar` a global | 1 | -- |
| 595-600 | Arranque directo opcional | Si `#pace-root` existe en DOM, monta. Backup del entry standalone | 6 | `ReactDOM` |

**Total componentes:** 3 publicos (PaceApp, TopBar, ActivityBar) + 4 internos
(ABBreathe, ABStretch, ABMove, ABDrop, todos solo consumidos por ActivityBar) +
1 estructura de datos privada (topBarStyles, solo consumida por TopBar).

### Componentes internos detectados

| Componente | Uso externo? | Reside en window | Lineas | Notas |
|---|---|---|---:|---|
| `PaceApp` | si (entry point) | si (L593) | 250 | Componente raiz |
| `TopBar` | NO (solo `PaceApp`) | si (L593, posiblemente innecesario) | 67 | Hijo puro |
| `ActivityBar` | NO (solo `PaceApp`) | si (L593, posiblemente innecesario) | 87 | Hijo puro |
| `topBarStyles` | NO (solo `TopBar`) | NO | 12 | Const local |
| `ABBreathe/Stretch/Move/Drop` | NO (solo `ActivityBar`) | NO | 54 | Iconos SVG |

`TopBar` y `ActivityBar` estan expuestos a `window` historicamente, pero nadie
externo los consume (Grep confirma cero uses fuera de `main.jsx`). Si se
mantiene la exposicion postsplit, ningun consumidor se rompe; si se quita,
tampoco. **Decision documentada:** mantener para preservar invariante de
estabilidad de API global expuesta.

### Estado compartido en `PaceApp`

**Por hook a state global:**
- `usePace()`: `state` + setter `set` -- lee `layout`, `sidebarCollapsed`, `plan`, `focusMode`, ... (16 keys del store leidas en el componente).
- `useT()`: `t` (translator). Suscripcion implicita via `state.lang`.

**Por useState local (9):**
- `view: { type, routine?, kind? }` -- pantalla activa (home / breathe-session / move-session). NO persiste.
- `openLibrary: 'breathe'|'move'|'extra'|null` -- modal de libreria abierta.
- `openHydrate: boolean`
- `openAchievements: boolean`
- `openStats: boolean`
- `openTweaks: boolean`
- `openBreakMenu: boolean`
- `openSupport: boolean`
- `openWelcome: boolean`
- `safetyRoutine: routine|null` -- gate de seguridad para apnea/Wim Hof.
- `cowClicks: number` -- contador de clicks en el logo vaca (logro secreto).

**Por window (efectos):**
- Lee/escribe nada directamente en `window.*` desde `PaceApp` (solo via dispatchers de hooks/state global).

**Por CustomEvent (4 escuchados):**
- `pace:cow-click` (L141) -- incrementa contador
- `pace:open-achievements` (L148) -- abre catalogo
- `pace:open-support` (L157) -- abre modal Buy Me a Coffee
- `pace:open-welcome` (L175) -- abre Welcome

**Despachados (1):**
- `pace:open-achievements` despachado desde `TopBar` (L418, icono trofeo). El mismo evento que `Sidebar` ya emite (L195, L197) y que `PaceApp` escucha. Patron consistente.

### Side effects identificados (8 useEffect en `PaceApp`)

| # | Lineas | Trigger | Cleanup | Side effect |
|---|---|---|---|---|
| 1 | 136-138 | `cowClicks` cambia | -- | Si `>= 10` -> `unlockAchievement('secret.cow.click')` |
| 2 | 139-143 | mount | si | listener `pace:cow-click` -> `setCowClicks(c+1)` |
| 3 | 146-150 | mount | si | listener `pace:open-achievements` -> `setOpenAchievements(true)` |
| 4 | 155-159 | mount | si | listener `pace:open-support` -> `setOpenSupport(true)` |
| 5 | 165 | -- | (interno) | `useSupportAutoTrigger(setOpenSupport)` -- hook externo |
| 6 | 169 | -- | (interno) | `useFirstTimeWelcome(setOpenWelcome)` -- hook externo |
| 7 | 173-177 | mount | si | listener `pace:open-welcome` -> `setOpenWelcome(true)` |
| 8 | 180-189 | mount | si | listener `keydown` -> tecla T toggle Tweaks, S toggle Stats, L toggle Achievements. Skip si focus en INPUT/TEXTAREA |

**Tambien (fuera de `PaceApp`):**
- Inyeccion de `<style id="pace-main-responsive-css">` (L30-112) se ejecuta al cargar el modulo, una sola vez (guard por `getElementById`).

---

## 1.2 Patron de comunicacion overlay

Decision activa desde s50+: **overlay via CustomEvent** -- evita prop drilling
hacia componentes lejanos del arbol (`Sidebar`, `TopBar`).

### Como interactua `app/main.jsx` con el patron

`PaceApp` actua tanto de emisor (en `TopBar`) como de receptor:

| Evento | Emisor en main.jsx | Receptor | Otros emisores |
|---|---|---|---|
| `pace:cow-click` | -- | `PaceApp` (L139-143) | `Sidebar.jsx:155` (CowLogo onClick) |
| `pace:open-achievements` | `TopBar` (L418, icono) | `PaceApp` (L146-150) | `Sidebar.jsx:195, 197` (AchievementsPreview + boton expandir) |
| `pace:open-support` | -- | `PaceApp` (L155-159) | `Sidebar.jsx:416` (boton apoyo) |
| `pace:open-welcome` | -- | `PaceApp` (L173-177) | Tweaks dev / pruebas |

**Asimetria intencional:** `TopBar` recibe `onOpenStats` y `onOpenTweaks` como
props (modal directo) pero `Achievements` se abre via CustomEvent dispatch
(consistencia con `Sidebar`).

### Otros overlays: `PathRunner` y `PathsLibrary`

`PathRunner` (L356) y `PathsLibrary` (L357) se montan SIEMPRE en el arbol de
`PaceApp` -- son componentes que gestionan su propia visibilidad via
CustomEvents internos (`pace:open-paths-library`, `pace:start-path`, etc.,
emitidos desde `Sidebar` y `SuggestedPathCard`). El orquestador NO coordina
estos overlays via state local -- son autocontenidos.

Acoplamientos problematicos: **ninguno**. `PathRunner`/`PathsLibrary` no leen
ni escriben state de `PaceApp`. Solo se montan en posicion de root y se
auto-gestionan.

### Implicacion para el split

Los 4 listeners de CustomEvent + el contador `cowClicks` son candidatos
naturales a un hook `useOverlayManager()` si se elige la variante maximalista.
Cada listener sigue el mismo patron (`useEffect` con `addEventListener` y
cleanup). El refactor de extraerlo a hook es trivial y reduce ruido en
`PaceApp` (~20 ln).

El listener de keyboard shortcuts (T/S/L) es independiente y mas complejo
(filtra por `INPUT`/`TEXTAREA`, despacha a 3 setters distintos). Puede ir
junto en `useOverlayManager` o aparte en `useGlobalKeyboard()`.

---

## 1.3 Invariantes a preservar

**Bloque A -- montaje y exposicion:**
1. `PaceApp` se monta como componente React raiz en `#root` (mount loop en `PACE.html:227`, comprueba `typeof PaceApp === 'function'` antes de montar).
2. `PaceApp` tambien se monta directamente en `#pace-root` si existe ese elemento (entry point standalone, L597-600). Backup historico de v0.12, no usado en flujo actual pero mantenido.
3. `PaceApp` queda en `window.PaceApp` tras `Object.assign` (L593).
4. `TopBar` y `ActivityBar` quedan en `window.TopBar` y `window.ActivityBar` (L593). Aunque ningun consumidor externo lo usa hoy, se mantiene por estabilidad de superficie publica.

**Bloque B -- bloque CSS responsive:**
5. El bloque `<style id="pace-main-responsive-css">` se inyecta una sola vez (guard por `getElementById` en L30).
6. Reglas `@media (max-width: 768px)`: aplica padding/font-size reducido a TopBar, oculta tabs, agranda hit-target de iconos top-right, ajusta main content padding, transforma ActivityBar a grid 2x2 con chips compactos, oculta sublabels en alturas <=720.
7. Selectores data-attribute usados por el CSS: `[data-pace-app-root]`, `[data-pace-topbar]`, `[data-pace-tabs]`, `[data-pace-topbar-icon]`, `[data-pace-main-content]`, `[data-pace-activitybar]`, `[data-pace-activitybar-grid]`, `[data-pace-activitybar-chip]`, `[data-pace-chip-label]`, `[data-pace-chip-sub]`, `[data-pace-sidebar-open]`. **Estos data-attributes deben seguir presentes en el JSX postsplit.**
8. Fallback `height: 100vh; height: 100dvh;` para iOS pre-15.4 -- cascada CSS, no expresable inline.

**Bloque C -- comportamientos clave:**
9. Cambio de idioma ES<->EN: `TopBar` y `ActivityBar` consumen `useT()`. Tras `setLang`, ambos re-renderizan automaticamente con strings actualizadas (verificado en s81).
10. Click logo vaca (en Sidebar): emite `pace:cow-click` -> `cowClicks++`. A los 10 clicks: `unlockAchievement('secret.cow.click')`. Comportamiento documentado en CONTENT.md.
11. Apertura de Achievements: TRES caminos -- icono trofeo TopBar (CustomEvent), boton sidebar (CustomEvent), atajo `L` (state local). Todos convergen a `setOpenAchievements(true)`.
12. Apertura de Stats: DOS caminos -- icono grafico TopBar (prop), atajo `S` (state local).
13. Apertura de Tweaks: DOS caminos -- icono engranaje TopBar (prop), atajo `T` (state local).
14. Apertura de Welcome: DOS caminos -- auto-trigger `firstSeen == null` (hook), CustomEvent `pace:open-welcome` (dev).
15. Apertura de Support: DOS caminos -- auto-trigger `streak >= 7` (hook), CustomEvent `pace:open-support` (sidebar).
16. Atajos T/S/L: ignoran cuando focus esta en `INPUT` o `TEXTAREA` (L182). Toggle (no set/reset) -- doble pulsacion cierra.

**Bloque D -- coordinacion de modales:**
17. `openLibrary` es `'breathe' | 'move' | 'extra' | null` -- 3 librerias mutuamente excluyentes. `BreatheLibrary`/`MoveLibrary`/`ExtraLibrary` se renderizan con `open={openLibrary === 'kind'}` (L302-316).
18. `handleStartBreathe`: si `routine.safety`, abre `BreatheSafety` (NO entra directo a sesion). Si no, cierra library + entra a `view = 'breathe-session'`.
19. `handleStartMove` y `handleStartExtra`: cierran library + entran a `view = 'move-session'`. `kind='extra'` se propaga para que `MoveSession` dispare `completeExtraSession` (no `completeMoveSession`).
20. `handleFocusFinish` (Pomodoro acabado): abre `BreakMenu` -- punto unico de orquestacion del descanso post-Foco.
21. `handleBreakChoice`: traduce eleccion (`'breathe'|'move'|'water'`) a apertura de library o hydrate. Cierra BreakMenu.

**Bloque E -- montaje siempre presente:**
22. `TweakSecretsWatcher` (L332) monta siempre, retorna null. Observa el state para desbloquear logros pasivos.
23. `PathRunner` (L356) y `PathsLibrary` (L357) montan siempre. Se auto-gestionan via CustomEvent.
24. `ToastHost` (L360) monta siempre, ultimo del arbol. Gestiona las notificaciones de logros.
25. `<Sidebar/>` se monta solo si `state.layout !== 'minimal'` (L239). Layout minimal es un futuro modo no implementado pero la rama del JSX existe.
26. Handle flotante (boton `≡`) aparece solo si `layout !== 'minimal'` AND `sidebarCollapsed === true` (L245).
27. `<SuggestedPathCard/>` se monta siempre en el footer del main (L298).

**Bloque F -- arranque y orden de carga:**
28. `PACE.html:200` carga `app/main.jsx` como ultimo `<script type="text/babel">` del arbol modular. Cualquier nuevo `<script>` derivado del split DEBE cargarse ANTES de `main.jsx` para que las referencias resuelvan (igual que s80 / s81).
29. `mount()` en `PACE.html:214-238` chequea `PaceApp/BreakMenu/TweaksPanel/BreatheSession/MoveSession/ToastHost = 'function'` antes de montar -- NO chequea `TopBar` ni `ActivityBar`. Si quedaran fuera de orden tras el split, el primer render de PaceApp explotaria con "ReferenceError: TopBar is not defined". **Mitigacion:** cargar `app/main/TopBar.jsx` y `app/main/ActivityBar.jsx` antes de `app/main.jsx` en PACE.html.

---

## 1.4 Edge cases a contemplar

| # | Edge case | Comportamiento actual | Riesgo postsplit |
|---|---|---|---|
| 1 | Cambio de idioma ES<->EN en caliente | `TopBar` (tabs labels) + `ActivityBar` (chip labels) actualizan inmediato via `useT`. State `lang` en pace store. | Bajo -- siempre que los nuevos archivos consuman `useT()` igual |
| 2 | Apertura de library mientras sesion `view='breathe-session'` activa | Imposible por UI: las sessions son fullscreen overlay. Pero el state `openLibrary` puede ser truthy detras. | Cero -- behavior preexistente |
| 3 | Apertura de overlay (`PathRunner`) durante sesion BreatheSession activa | Imposible por UI por el mismo motivo. `PathRunner` ya gestiona su z-index. | Cero -- behavior preexistente |
| 4 | Cierre de modal con Escape (BreatheLibrary, etc.) | Cada Modal maneja Escape internamente (`Primitives.jsx`). PaceApp no escucha Escape global. | Cero |
| 5 | Recarga durante `view='breathe-session'` | Tras reload, `view` es state local de useState -- vuelve a 'home'. Pomodoro/water etc. sí persisten en localStorage. La sesion fullscreen se pierde, mostrando home. | Cero -- behavior intencional (sesion temporal, no persistente) |
| 6 | Recarga durante `openLibrary='breathe'` | Mismo: `openLibrary` no persiste, vuelve a null. | Cero |
| 7 | Cambio de focusMode (foco/pausa/larga) durante Pomodoro corriendo | Solo cambia `state.focusMode` en pace store. NO reinicia el Pomodoro. FocusTimer adapta UI. | Cero -- behavior preexistente |
| 8 | Click en logo vaca exactamente 10 veces | `cowClicks: 10` -> useEffect dispara `unlockAchievement('secret.cow.click')` -> Toast aparece. Tras eso `cowClicks` puede seguir subiendo pero `unlockAchievement` es idempotente. | Bajo -- preservar contador |
| 9 | Pulsar `T` con focus en TweaksPanel input (filtro) | Skip por check `INPUT/TEXTAREA` (L182). Tweaks no se toggle. | Cero |
| 10 | Logro disparado durante mid-session | Sesion no afectada. `ToastHost` muestra toast fade-out 300ms tras 3s visibles. | Cero |
| 11 | Layout `minimal` (rama no implementada): Sidebar oculto, handle flotante no aparece | JSX existe pero `state.layout` nunca se setea a 'minimal' actualmente. Solo via debugger/console. Preservar rama. | Cero |
| 12 | Mobile <=768px width: tabs Foco/Pausa/Larga ocultos | CSS responsive `[data-pace-tabs] { display: none }`. BreakMenu maneja seleccion post-Pomodoro en movil. | Cero -- CSS sigue intacto |
| 13 | Mobile + height <=720: sub-labels de ActivityBar ocultos | CSS `@media (max-width: 768px) and (max-height: 720px)`. | Cero -- CSS sigue intacto |
| 14 | dvh (dynamic viewport) en navegadores modernos vs vh en antiguos | Fallback cascade `height: 100vh; height: 100dvh;` en CSS responsive. NO expresable inline. **Critico: si el CSS responsive se mueve, el fallback debe sobrevivir.** | Medio -- preservar bloque CSS literal |
| 15 | Multiple instancias de `pace-main-responsive-css` en DOM | Guard por `getElementById`: solo se inyecta una vez. Si el archivo extraido se carga dos veces (hot reload?), el style block queda intacto. | Cero |
| 16 | Click rapido sucesivo en chip de ActivityBar | Cada click llama `onOpenLibrary(kind)` -- setea state. React batch-aplica. Sin race. | Cero |
| 17 | Tab ordering / accesibilidad teclado | TopBar tiene 4 botones (3 modes + 3 iconos); ActivityBar tiene 4 botones. Orden DOM = orden visual. Sin tabIndex explicito = orden natural. | Cero -- preservar orden DOM |

---

## Resumen ejecutivo de la auditoria

`app/main.jsx` (600 ln) es el orquestador raiz: monta el shell (Sidebar +
main area), coordina 9 estados locales de modales/sesiones, escucha 4
CustomEvents, despacha 1, ejecuta atajos T/S/L, e inyecta un bloque CSS
responsive global de 93 ln.

**Componentes extraibles sin acoplamiento problematico:**

| Componente | Lineas | Solo consumidor | Dependencias externas |
|---|---:|---|---|
| `TopBar` + `topBarStyles` | 67 + 12 = **79** | `PaceApp` | `usePace`, `useT`, CustomEvent `pace:open-achievements` |
| `ActivityBar` + 4 iconos AB* | 87 + 54 = **141** | `PaceApp` | `usePace`, `useT`, `Meta` |

Suman **220 ln** -- los dos componentes mas el grupo de iconos son el target
natural. Extraerlos a `app/main/` deja el orquestador en ~380 ln.

**Reduccion adicional posible (mas opinada):**
- 4 useEffect de CustomEvent listeners + `cowClicks` = ~20 ln -> hook `useOverlayManager()`.
- 1 useEffect de keyboard shortcuts = ~10 ln -> hook `useGlobalKeyboard()`.
- 93 ln de CSS responsive -> `app/main/_responsive.js` (sigue siendo IIFE de inyeccion).

Estas extras dejan main.jsx en ~150-180 ln, pero **introducen 3 archivos
nuevos solo para hooks de un consumidor unico**. Discutible si vale la
pena -- la s80 (split de PathRunner) hizo extracciones similares solo
cuando habia >=2 consumidores (`_shared.js` para 2 Steps con misma
tipografia). Aqui los hooks son consumidos solo por PaceApp.

**Acoplamientos potencialmente bloqueantes:**

Ninguno detectado. `TopBar` y `ActivityBar` son hijos puros: reciben todas
sus dependencias por props (`onOpen*`) o por hooks de scope global
(`usePace`, `useT`). El bloque CSS responsive es global por design.

**Discrepancias con el prompt:**

Ninguna. La estructura objetivo (`app/main/TopBar.jsx` + `app/main/ActivityBar.jsx`)
es directamente realizable sin cambios de comportamiento.

**Deudas tecnicas detectadas (NO se arreglan en s82, scope = split mecanico):**

| ID | Deuda | Razon de no arreglar |
|---|---|---|
| D-1 | `topBarStyles` solo tiene 1 key (`iconBtn`); el patron "const styles" para un solo valor es overkill | Cosmetico. Mantener convencion CLAUDE.md ("estilos con nombre unico") |
| D-2 | Asimetria abrir Achievements (CustomEvent) vs Stats/Tweaks (prop) en TopBar | Funcional y consistente con `Sidebar`. Refactor de UX, fuera de scope |
| D-3 | `TopBar`/`ActivityBar` expuestos a `window` sin consumidor externo | Mantener por estabilidad de superficie publica |
| D-4 | `view` state no persiste recarga -> sesiones fullscreen efimeras | Intencional. Persistencia entraria en debate de UX (resume / discard) |
| D-5 | Arranque directo en `#pace-root` (L597-600) es legacy de v0.12 | Sin coste, sin consumidor activo, removerlo abre debate -- preservar |

---

## Lista de archivos / componentes que el split tocara

### Obligatorio
- `app/main.jsx` (rewrite)
- `app/main/` (carpeta nueva, no existe)
- `PACE.html` (anyadir `<script src>` antes de `main.jsx`)

### Tocado si Variante C
- `app/main/_responsive.js` (CSS injection extraido)
- `app/main/useOverlayManager.js` (hook 4 listeners + cowClicks)
- `app/main/useGlobalKeyboard.js` (hook T/S/L)

### NO tocados (zero risk)
- `app/state*.jsx` (cero referencias a main.jsx)
- `app/i18n/*` (cero acoplamiento -- main.jsx es consumidor, no contribuidor)
- `app/shell/Sidebar.jsx` (consumidor de CustomEvents, sin cambios)
- `app/ui/*` (independientes)
- Todos los modulos (`focus/`, `breathe/`, `move/`, `extra/`, `hydrate/`, ...)
- Todos los overlays (`paths/`, etc.)

### Tocados solo por bump de version (no por refactor)
- `app/state-core.jsx` (PACE_VERSION)
- `sw.js` (CACHE_NAME)
- `PACE_standalone.html` + `index.html` (rebuild)
- `STATE.md`, `CHANGELOG.md`, `docs/sessions/session-82-*.md`

---

**Pausa para revision del usuario antes de Tarea 2 (design con variantes).**
