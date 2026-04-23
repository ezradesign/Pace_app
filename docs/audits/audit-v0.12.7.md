# PACE · Auditoría interna v0.12.7

> **Sesión 25 · Fase 1.** Lectura fría del repo tras 24 sesiones de
> acumulación. Este documento es *solo lectura* — no se toca código.
> El usuario valida antes de pasar a Fase 2 (refactor quirúrgico).
>
> **Regla no negociable:** ningún refactor propuesto aquí puede cambiar
> comportamiento observable. Estado visual y funcional al final debe
> ser **idéntico** al de v0.12.7.

---

## 1 · Inventario cuantitativo

### 1.1 Tamaño por archivo (bytes del repo, código fuente modular)

| Archivo | Bytes | % del standalone | Líneas aprox |
|---|---:|---:|---:|
| `app/breathe/BreatheModule.jsx` | 29 333 | 8.4 % | ~740 |
| `app/shell/Sidebar.jsx` | 25 127 | 7.2 % | ~630 |
| `app/main.jsx` | 24 960 | 7.1 % | ~520 |
| `app/focus/FocusTimer.jsx` | 23 200 | 6.6 % | ~575 |
| `app/achievements/Achievements.jsx` | 20 977 | 6.0 % | ~340 |
| `app/support/SupportModule.jsx` | 17 559 | 5.0 % | ~470 |
| `app/tweaks/TweaksPanel.jsx` | 17 544 | 5.0 % | ~430 |
| `app/move/MoveModule.jsx` | 16 214 | 4.6 % | ~360 |
| `app/state.jsx` | 13 169 | 3.8 % | ~310 |
| `app/ui/CowLogo.jsx` | 11 553 | 3.3 % | ~280 |
| `app/welcome/WelcomeModule.jsx` | 9 949 | 2.8 % | ~310 |
| `app/ui/Primitives.jsx` | 7 427 | 2.1 % | ~200 |
| `app/extra/ExtraModule.jsx` | 5 888 | 1.7 % | ~110 |
| `app/tokens.css` | 4 880 | 1.4 % | ~160 |
| `app/stats/WeeklyStats.jsx` | 4 841 | 1.4 % | ~110 |
| `app/breakmenu/BreakMenu.jsx` | 4 643 | 1.3 % | ~115 |
| `app/hydrate/HydrateModule.jsx` | 3 317 | 0.9 % | ~85 |
| `app/ui/Toast.jsx` | 2 177 | 0.6 % | ~60 |
| `PACE.html` | 3 900 | 1.1 % | ~80 |
| **Total modular** | **~247 KB** | — | **~5 900** |
| `PACE_standalone.html` | **349 293** | 100 % | ~7 550 |

### 1.2 Lectura

- **El archivo más grande es `BreatheModule.jsx` (740 líneas)** — por encima
  del techo de 500 líneas de `CLAUDE.md`. Con razón: mete catálogo de rutinas
  + `BreatheLibrary` + `RoutineCard` + `BreatheSafety` + `BreatheSession`
  (prep/active/hold/done) + 5 visualizaciones + `SessionHeader` + `Stat` +
  `getSequence` + 2 bloques de styles. **5 responsabilidades en un archivo.**
- **Sidebar (630 líneas) y main.jsx (520 líneas)** también rozan o superan el
  techo. Sidebar carga los iconos (Pomodoro/Rounds/Flame), WeekDots,
  SenderoDelDia, AchievementsPreview, StatusBar — razonable que sea denso,
  pero es un candidato a trocear.
- **Focus (575 líneas)** contiene 5 `TimerVisualization` inline
  (`Aro`/`Number`/`Circle`/`Bar`/`Analog`) — cada una es un mini-componente,
  trocear es barato.
- El standalone pesa **349 KB**. De eso **~100 KB es el PNG del logo** ya
  embebido como data-URI. El código lógico es ~250 KB; comprimido con gzip
  en Netlify estará en ~60-70 KB, bien.
- **SUM modular (~247 KB) + PNG inlined (~103 KB base64) ≈ 350 KB** ≈ tamaño
  del standalone. Sin holgura inexplicada: no hay "peso fantasma".

### 1.3 % del standalone por módulo (agregado)

```
Módulos de sesión (breathe+move+focus):     ~20 %  ← el corazón
Shell/orquestación (main+sidebar):          ~14 %  ← layout + eventos
Datos/state/rutinas/logros:                 ~11 %  ← state + achievements
Modales secundarios (support+tweaks+welc):  ~13 %  ← onboarding + dona + ajustes
UI compartido (primitives+logo+toast):      ~6 %   ← poco, y parte duplica inline
Tokens CSS + entry:                         ~2.5 %
PNG inlined + fuentes Google:               ~33 %  ← binarios/terceros
```

**Conclusión:** el peso está repartido razonablemente. No hay grasa
estructural obvia. La optimización posible es en *duplicación* dentro
del código, no en tamaño per-archivo.

---

## 2 · Dead code sospechoso

> Formato: `archivo:línea · identificador · confianza · nota`.
> **Ninguno se borra en fase 1.** Todos se listan para discusión.

### 2.1 Código muerto de alta confianza (sin usos reales en la UI)

| Archivo · línea | Símbolo | Nota |
|---|---|---|
| `app/support/SupportModule.jsx:108` | `CupIcon` | Tras consolidar copy a una variante (vaca), `SupportIcon` siempre devuelve `<CowIcon/>`. `CupIcon` queda definido, nunca llamado. **40 líneas muertas.** |
| `app/support/SupportModule.jsx:291` | `BigCup` | Mismo caso en el hero del modal: `SupportHero` siempre devuelve `<BigCow/>`. `BigCup` muerto. **~22 líneas.** |
| `app/ui/CowLogo.jsx:6` | `CowLogoLineal` | La variante de logo que disparaba su render (`logoVariant = 'lineal'`) fue retirada del Tweaks panel en sesión 19. El estado sigue soportándolo pero la UI nunca lo activa salvo por import JSON de un usuario v0.11.x. **~20 líneas, valor histórico.** Confianza MEDIA (puede viajar en localStorage legacy). |
| `app/ui/CowLogo.jsx:26` | `CowLogoSello` | Idem: solo visible si `logoVariant === 'sello'`. Logro `secret.seal` también dormido. **~25 líneas.** MEDIA. |
| `app/ui/CowLogo.jsx:50` | `CowLogoIlustrado` | Idem con `'ilustrado'`. **~27 líneas.** MEDIA. |
| `app/state.jsx:74` | `supportCopyVariant: 'pastar'` | Campo del state nunca consultado con distinción: `supportCopy(_variant)` ignora el argumento. Mantenido por "compat localStorage". Comentario lo reconoce como `DEPRECADO`. ALTA. |
| `app/state.jsx:82` | `reminders: []` | Nunca mutado, nunca leído. Conservado por retro-compat (sesión 11). ALTA de no-uso, decisión activa de conservar. |
| `app/ui/CowLogo.jsx:88` | `PaceLockup` | Solo se invoca desde el fallback de `PaceLogoImage` (cuando el PNG falla) y desde `PaceWordmark` cuando `variant === 'lockup'`. Esta segunda rama nunca se alcanza en la UI: ningún componente pide `variant='lockup'`. El fallback PNG sí se usa. Se puede simplificar la variante pero no borrar. MEDIA. |

### 2.2 Código muerto de confianza media (conservado por decisión documentada)

| Archivo · línea | Símbolo | Nota |
|---|---|---|
| `app/tweaks/TweaksPanel.jsx:344-354` | Watchers de `secret.mono`, `secret.seal`, `secret.illustrated` | Los tweaks que los disparaban se retiraron (s19-20). Los comentarios lo documentan: "dormidos por si se reintroducen". **Se conservan por diseño.** Son ~12 líneas aún vivas. |
| `app/state.jsx:52-55` | `intention: ''` | Capturado en Welcome pero no usado después en UI. Welcome lo lee y precarga, pero ningún módulo lo renderiza. MEDIA — feature latente. |
| `app/state.jsx:25` | `font: 'cormorant'` | El tweak de font fue retirado (s20) pero el watcher de `secret.mono` sigue existiendo. Campo usado en `applyTheme()` → `data-font`. Tokens.css sí mapea. Activo pero inmutable. ALTA de "sin UI que lo toque" + MEDIA de "aún aplica CSS". |
| `app/main.jsx:42` | `ChevronLeftIcon` en Sidebar.jsx:322 | Usado una vez. OK, no muerto. |
| `app/focus/FocusTimer.jsx:359-364` | `TimerNumber`, `TimerCircle`, `TimerBar`, `TimerAnalog` | Solo el estilo `aro` es el default y el que ocupa el 95% del tiempo. Pero siguen siendo seleccionables en Tweaks. **No son dead code** — son features. NO borrar. |

### 2.3 Código muerto de baja confianza (comentarios + CSS no verificables sin test manual)

| Archivo · línea | Símbolo | Nota |
|---|---|---|
| `app/shell/Sidebar.jsx:572` | Comentario histórico sobre `toggleCollapsed/railItem/railBtn/railDivider` | 4 líneas que documentan estilos que ya se borraron (v0.11.6). Informativo. |
| `app/shell/Sidebar.jsx:606` | Comentario sobre "Recordatorios/Intención retirados" | Útil para contexto de sesiones futuras. Conservar. |
| `app/breathe/BreatheModule.jsx:461` | `SessionHeader` exportado a `window` | Se exporta al global namespace pero **Move define su propio `MoveHeader`** local y nunca usa `SessionHeader` del global. No es muerto pero sí export innecesario. BAJA. |
| `app/tokens.css` utilidades | `.pace-display` / `.pace-display-italic` / `.pace-meta` / `.pace-tag` | La clase `.pace-display-italic` está declarada pero **casi nadie la usa** — hay ~50 invocaciones inline de `fontFamily: 'var(--font-display)', fontStyle: 'italic'`. La clase .pace-meta sí la usa `<Meta>`. Oportunidad de consolidación. BAJA/MEDIA. |

---

## 3 · Duplicación detectada

### 3.1 🔥 Top-1 duplicación: `SessionHeader/sessionStyles` vs `MoveHeader/moveSessionStyles`

**Dos componentes prácticamente idénticos en `BreatheModule.jsx` y `MoveModule.jsx`:**

```jsx
// BreatheModule.jsx:461        // MoveModule.jsx:303
function SessionHeader({...})   function MoveHeader({...})
// mismo layout: meta+h2+exit
```

Idéntico JSX salvo la `Meta fontSize`. Y debajo, **dos objetos de estilos
enormes (`sessionStyles` vs `moveSessionStyles`) con mismas keys y valores casi idénticos**:

| Key | `sessionStyles` (breathe) | `moveSessionStyles` (move) | Diff |
|---|---|---|---|
| `root` | pos:fixed, inset:0, paper, zIndex:90, padding:28px 48px 40px | idéntico | 0 |
| `header` | flex space-between | idéntico | 0 |
| `exitBtn` | 13px ink-2 padding:6/10 | idéntico | 0 |
| `center` | flex centered + gap 32 | flex centered (sin gap) | gap |
| `footer` | flex centered gap 16 | flex centered gap 12 | gap 4px |
| `ctrlBtn` | idéntico padding/font/border/bg | idéntico | 0 |

**Además duplican:**
- La pantalla "prep" (countdown 3-2-1 con número 200px) → idéntica salvo `color: breathe` vs `move`.
- La pantalla "done" (círculo check 120px + título + `Stat` + párrafo italic) → idéntica salvo colores.
- Los componentes `Stat` (breathe) y `MoveStat` (move) → idénticos byte-por-byte salvo el nombre.
- Listener de `keydown` con Space=pausa, Esc=exit.

**Ahorro estimado:** extrayendo `SessionShell + SessionStat + SessionPrep + SessionDone` a `app/ui/SessionShell.jsx`:
- **~180 líneas fusionadas** (de 2×110 a 1×100 + 2×20 de uso).
- Un solo sitio donde cambiar el layout de sesión si se hace en móvil.
- Elimina colisión de `SessionHeader` en el window global (hoy: breathe lo
  exporta, move define su propio local).

**Riesgo:** bajo si se hace API-compatible. Los colores y copy dependen del
módulo (terracota+"Bien hecho" vs tierra+"Antídoto completado") → se pasan
como props (`accent`, `doneMeta`, `doneCopy`).

### 3.2 Duplicación: listener de Escape en modales

Cinco bloques casi idénticos de `useEffect` + `keydown` con `Escape`:

| Archivo | Línea | Uso |
|---|---|---|
| `app/ui/Primitives.jsx:10` | Modal base | Cierra onClose |
| `app/breakmenu/BreakMenu.jsx:17` | Break menu | Cierra + atajos B/M/H |
| `app/main.jsx:178` | App root | Atajos T/S/L |
| `app/breathe/BreatheModule.jsx:232` | Sesión | Esc=exit, Space=pause, Enter=next |
| `app/move/MoveModule.jsx:130` | Sesión | Idem + arrows |

Se podría extraer `useKeyboardShortcuts({Escape, ' ', Enter, ...})` a
`Primitives.jsx`. **Ahorro real:** bajo (~15-20 líneas) pero **valor
arquitectónico alto**: consistencia + previene bugs de cleanup (hoy todos
lo hacen bien, pero un futuro módulo podría olvidar el `removeEventListener`).

### 3.3 Duplicación: `fontFamily: 'var(--font-display)' + fontStyle: 'italic'`

**~50 ocurrencias a lo largo de todos los módulos** — siempre el mismo par
inline. La clase CSS `.pace-display-italic` ya existe en `tokens.css` pero
nadie la usa. No es que sobren bytes (son ~40 chars cada vez), sino que
cada cambio al token obligaría a abrir 50 sitios.

**Ahorro:**
- Si se hace como clase (`className="pace-display-italic"`): ~1.5 KB, pero
  rompe elementos con otros estilos inline co-locados.
- **Mejor:** helper `displayItalic = { fontFamily: 'var(--font-display)', fontStyle: 'italic' }`
  en Primitives.jsx y spread (`style={{ ...displayItalic, fontSize: 20 }}`).
  No rompe nada, ahorra ~1.2 KB, y convierte 50 pares en 50 referencias.

Coste medio. Impacto bajo pero limpia mucho. Confianza ALTA.

### 3.4 Duplicación: layout "Library modal" entre Breathe/Move/Extra

Tres librerías tienen estructura idéntica:
- `<Modal tagLabel="Biblioteca" title="..." subtitle="...">`
- `<Meta>` aside
- `<h3>Rutinas</h3>`
- `<div style="grid auto-fill 260">` con mapeo a `<RoutineCard>`

`RoutineCard` **sí está compartido** (vive en BreatheModule pero Extra y
Move lo usan por export a window). Bien. La parte duplicada es pequeña
(~15 líneas cada una) y cada librería tiene su color + un wrapper leve
distinto. **Bajo valor refactorizar.** Dejar.

### 3.5 Duplicación: iconos SVG repetidos

- `BMWindIcon`, `BMMoveIcon`, `BMDropIcon` (BreakMenu.jsx) vs
- `ABBreathe`, `ABStretch`, `ABMove`, `ABDrop` (main.jsx)

Son **distintos a propósito** (metodología visual diferente para los mismos
conceptos — documentado en BreakMenu.jsx:87). No duplicación real. Dejar.

### 3.6 Duplicación: stage 'prep' (countdown 3-2-1)

En Breathe y Move, el stage 'prep' comparte estructura (texto "Prepárate",
contador 200px italic, texto instructivo, botón "Empezar ahora"). Difieren:
- Color del número (breathe vs move).
- Copy ("Siéntate cómodo. Respira natural." vs "De pie. Sin prisa. N pasos.").

Se absorbe en el refactor 3.1 sin esfuerzo adicional.

---

## 4 · Inconsistencias de naming / estructura

| Inconsistencia | Sitio | Severidad |
|---|---|---|
| `SessionHeader` exportado a `window` en Breathe, `MoveHeader` no exportado (es local a Move). Dos componentes que son la misma cosa. | `breathe:737`, `move:303` | Medio |
| `Stat` (en breathe) y `MoveStat` (en move) son idénticos. Nomenclatura sugiere que `Stat` es genérico y `MoveStat` una variante — no lo es. | `breathe:484`, `move:327` | Medio |
| Destructures de React con sufijos únicos: `useStateBR`, `useStateMV`, `useStateFT`, `useStateTW`, `useStateSUP`, `useStateWEL`, `useStateTO`, `useStateMain`, `useStateSB`. **Son necesarios** (Babel standalone no comparte scope entre `<script>` files) pero dispersos. | todos | Bajo — por diseño |
| `supportCopyVariant` en state + `supportCopy(_variant)` que ignora el argumento. El propio autor marca "DEPRECADO" en un comentario. | `state:74`, `support:51` | Alto (confusión lectora) |
| `intention` campo del state + UI solo para **escribirlo** (Welcome), no para **mostrarlo**. | `state:54`, `welcome:119` | Medio — feature incompleta |
| `CupIcon` y `BigCup` viven en `SupportModule.jsx` pero nunca se renderizan. | `support:108, 291` | Alto — confusión |
| `.pace-display-italic` en tokens.css vs ~50 uses inline del mismo par. | global | Bajo |
| `data-pace-*` attrs: muy consistentes, bien. | main/sidebar | — |
| `Object.assign(window, {...})` al final de todo archivo: consistente. | todos | — |

### 4.1 Exports a window — revisión

| Archivo | Exporta | ¿Se consume fuera? |
|---|---|---|
| `state.jsx` | `usePace, getState, setState, subscribe, unlock..., complete..., showToast, onToast, PACE_VERSION, ensureDayFresh` | Sí, todo. |
| `Primitives.jsx` | `Modal, Card, Tag, Button, Divider, Meta` | Sí. |
| `CowLogo.jsx` | `CowLogo, CowLogoLineal, CowLogoSello, CowLogoIlustrado, PaceWordmark, PaceLockup, PaceLogoImage` | `PaceWordmark` sí. El resto son dependencias internas de PaceWordmark — no necesitan ser globales. **Sobre-exportación.** |
| `Toast.jsx` | `ToastHost` | Sí (main). |
| `Sidebar.jsx` | `Sidebar` | Sí. |
| `FocusTimer.jsx` | `FocusTimer` | Sí. `MinutesPicker` no se exporta pero tampoco se necesita. |
| `BreatheModule.jsx` | `BreatheLibrary, BreatheSafety, BreatheSession, BREATHE_ROUTINES, SessionHeader, Stat` | Los tres Library/Safety/Session sí. `BREATHE_ROUTINES`: no se lee fuera. `SessionHeader, Stat`: **no se leen fuera**. |
| `MoveModule.jsx` | `MoveLibrary, MoveSession, MOVE_ROUTINES` | Libs sí. MOVE_ROUTINES no se lee fuera. |
| `ExtraModule.jsx` | `ExtraLibrary, EXTRA_ROUTINES` | Lib sí. EXTRA_ROUTINES no. |
| `Achievements.jsx` | `Achievements, ACHIEVEMENT_CATALOG` | `ACHIEVEMENT_CATALOG` sí lo consume `Toast.jsx`. |
| `support/tweaks/welcome/breakmenu/hydrate/stats` | expected | todo bien |

**Conclusión:** varios exports superfluos (SessionHeader, Stat,
*_ROUTINES). Limpiarlos no gana bytes pero sí claridad — un futuro
contribuidor entenderá que no son parte de la API.

---

## 5 · Riesgos latentes

### 5.1 Re-renders innecesarios

- **`PaceApp` consume `usePace()` completo** y guarda 10 booleanos de
  `open*` en estado local. Cualquier mutación del store dispara re-render
  de todo el árbol. No es crítico (React 18 es rápido) pero `Sidebar` ya
  consume `usePace()` independiente, por lo que se renderiza 2 veces por
  cada setState. BAJA.
- **`SenderoDelDia` usa `useMemoSB`** bien, pero depende de
  `state.weeklyStats` entero → cualquier cambio en breath/move/water
  minutes invalida el memo. OK.

### 5.2 Efectos sin dependencias o con dependencias incompletas

- `app/main.jsx:172` — `useEffectMain(() => { if (cowClicks >= 10) ... }, [cowClicks])` **OK**.
- `app/main.jsx:178-186` — keydown **sin `state` en deps**: corrige ok porque `setOpenX` es estable y no usa state.
- `app/breathe/BreatheModule.jsx:218` — ticker con dep `[phase, paused, routine, stage]`. Al cambiar `phase`, el intervalo se recrea, lo cual tiene sentido para que lea el nuevo phase. Pero ojo: si el tick cae justo antes del cleanup, puede ejecutar `handleCycleComplete` una vez extra. MEDIO.
- `app/breathe/BreatheModule.jsx:255` — `useEffectBR(..., [stage])` pero dentro usa `onExit, releaseHold` → **missing deps**. Funcionalmente OK porque los handlers dependen de state propio, pero lint de React lo marcaría. BAJO.

### 5.3 Listeners sin cleanup

Revisión exhaustiva: **todos los `addEventListener` tienen su
`removeEventListener` en el cleanup del efecto.** Bien. (9/9 verificados.)

### 5.4 Accesos a `localStorage` en render path

- `app/state.jsx:133` — `persistState()` se llama en cada `setState`.
  Síncrono. Si el state crece mucho (achievements > 100 entradas) es
  O(n) por cada setState. A día de hoy n ~ 10-20, no es problema.
- `app/tweaks/TweaksPanel.jsx:365-380` — `TweakSecretsWatcher` hace
  `localStorage.getItem/setItem` **dentro de un useEffect que corre en
  cada cambio de `state.palette`**. Correcto: no está en render path.
  Pero parsea JSON cada vez. Es barato (array de ≤30 strings). OK.

### 5.5 Fechas/horas sin timezone

- `state.jsx` usa `new Date().toDateString()` para el rollover (string
  local del navegador). `new Date().getDay()` para el índice del día
  semana. Todo en **hora local del navegador**. Si un usuario viaja de
  UTC-8 a UTC+9 cerrando sesión pueden pasar dos rollovers raros.
  **No es un bug actual** — solo un caveat. BAJO.
- `tweaks/TweaksPanel.jsx:378` usa `toISOString().slice(0,10)` → UTC.
  **Inconsistente con el resto** (que usa `toDateString()` local). Si
  un usuario cambia de palette a las 23:30 hora local, cuenta un día
  UTC distinto. Bug teórico de impacto cero (logro `secret.dark.mode`
  necesita 7 días, ±1 día no cambia nada). BAJO.

### 5.6 Lógica frágil que no ha explotado todavía

- **`PaceLogoImage` lee el src con `document.getElementById('pace-logo-src')`**
  en el `require time` del módulo (línea `const PACE_LOGO_URL = _getPaceLogoUrl()`).
  Si el `<img>` aún no se ha parseado cuando el script corre (en modular
  mode el orden es PACE.html head → img → scripts async), podría devolver
  `'app/ui/pace-logo.png'` fallback. Funciona hoy porque Babel standalone
  es lento y el DOM ya está listo. MEDIO (frágil, pero pasa los tests
  manuales actuales).
- **`completePomodoro` lee `_state.cycle` después del setState** como
  documenta el código. El setState es síncrono en este store (no React's
  setState). Correcto.
- **`BreatheSession` captura `onExit` y `stage` en un `useEffect`
  `[stage]`** — si `stage` cambia durante un keydown en vuelo, el
  handler obsoleto puede ejecutar. Evento `Escape` → `onExit('exit')` →
  `setView({type:'home'})` desmonta el componente. OK por accidente.
- **`addFocusMinutes` → `completePomodoro` → `addFocusMinutes`**
  cadena de setState. Los dos últimos usan updater-function correctamente.
  El umbral de logros se evalúa tras la cadena leyendo `_state`.
  Frágil si alguien añade otra acción entre medias. MEDIO.

### 5.7 Colisión de `SessionHeader` en window

`breathe` exporta `SessionHeader` al global. **`move` define su propio
`MoveHeader` local** sin importar el global → no se usa la versión de
breathe, pero queda polucionando `window`. Si alguien renombrara por
error o mezclara módulos, podría activarse una versión "fantasma".

---

## 6 · Oportunidades de compresión

Compresión de bundle no tiene sentido (ya usamos Babel standalone +
`super_inline_html`; gzip es cosa de Netlify). Las oportunidades reales
son **limpieza lectora**:

| Ítem | Ahorro bytes (fuente) | Ahorro standalone (post-gzip) |
|---|---:|---:|
| Borrar `CupIcon` + `BigCup` tras confirmar no-reintro | ~1.4 KB | ~0.3 KB |
| Borrar los 3 CowLogo* y mantener solo el fallback SVG de `PaceLogoImage` (o extraerlo) | ~3 KB | ~0.7 KB |
| Borrar `supportCopyVariant` como argumento en todas las llamadas | ~0.3 KB | ~0.1 KB |
| Fusionar `sessionStyles`/`moveSessionStyles` | ~1.2 KB | ~0.3 KB |
| Comentarios obsoletos (historia de v0.11.x en Sidebar, Tweaks) | ~2 KB | minimal (gzip colapsa prosa repetida) |
| `displayItalic` helper (los ~50 pares) | ~1.2 KB | mínimo (gzip ya los colapsa) |

**Total agresivo:** ~9 KB de fuente, ~1.5 KB de standalone gzipped.
No es el valor principal. **El valor es la claridad**, no el tamaño.

Comentarios obsoletos específicos, candidatos a recortar:
- `Sidebar.jsx:98-104` — comentario v0.11.7 sobre reestructuración del logo (útil pero largo).
- `Sidebar.jsx:572-576` — estilos del modo colapsado eliminados v0.11.6.
- `Sidebar.jsx:604-608` — Recordatorios/Intención retirados (útil como contexto, breve ya).
- `FocusTimer.jsx:108` — "ModeToggle interno se eliminó en v0.11.6".
- `SupportModule.jsx:18-44` — el bloque de filosofía de 27 líneas es denso pero valioso; **no tocar**.

---

## 7 · Priorización

> Leyenda — **Impacto**: claridad / riesgo que quita / mantenibilidad.
> **Coste**: tiempo real estimado con tests manuales.
> **Prioridad**: A=atacar esta sesión · B=próxima · C=cuando moleste.

| # | Hallazgo | Impacto | Coste | Prioridad | Sesión sugerida |
|---|---|:---:|:---:|:---:|---|
| 1 | **Fusionar `sessionStyles`/`moveSessionStyles` + `SessionHeader`/`MoveHeader` + `Stat`/`MoveStat`** a `app/ui/SessionShell.jsx` | Alto | Medio (~45 min) | **A** | **25** |
| 2 | **Borrar `CupIcon`, `BigCup` + consumos de `state.supportCopyVariant`** en SupportModule (el state se conserva) | Medio-alto | Bajo (~15 min) | **A** | **25** |
| 3 | **Sanear exports a `window`**: quitar `SessionHeader`, `Stat`, `*_ROUTINES`, `CowLogoLineal/Sello/Ilustrado` que no se consumen | Medio | Bajo (~15 min) | **A** | **25** |
| 4 | **Extraer helper `displayItalic = {…}`** y reemplazar los ~50 pares inline | Medio | Medio (~35 min, muchos sitios) | **A** si queda tiempo / B | 25 / 26 |
| 5 | **Mover countdown 'prep' a un componente `<SessionPrep>`** dentro de SessionShell (cae dentro del #1) | Medio | Bajo (dentro de #1) | **A** | 25 |
| 6 | `CowLogo*` variantes dormidas: decidir si se retiran o se mantienen por retro-compat | Bajo | Bajo | B | 26 |
| 7 | `displayItalic` aplicado a los ~50 sitios (si no se hace en 25) | Medio | Medio | B | 26 |
| 8 | `useKeyboardShortcuts` hook consolidado | Medio | Medio | B | 26 |
| 9 | Consolidar fechas/horas en un `paceDate()` helper (zonaria) | Bajo | Medio | C | después de PWA |
| 10 | Trocear `BreatheModule.jsx` > 500 líneas (separar librería de sesión) | Medio | Alto (cambia imports) | C | tras 26 |
| 11 | Limpiar comentarios obsoletos pre-v0.12.x | Bajo | Bajo | C | cualquiera |
| 12 | `reminders: []` + `intention` + `font` — limpieza de campos dormidos del state (requiere decisión de producto) | Bajo | Alto (migración) | C | pre-v1.0 |

### 7.1 Propuesta de Fase 2 (5 ítems, ~1h45min)

Atacar hoy solo los ítems de prioridad **A**:

1. **#1 + #5 fusión de SessionShell** (absorbe #5 al hacerse). ~45 min.
2. **#2 limpieza Support** (CupIcon, BigCup, supportCopyVariant). ~15 min.
3. **#3 limpieza exports window**. ~15 min.
4. **#4 displayItalic helper** (aplicar a 50 sitios es tedioso pero
   mecánico). ~35 min.

**Total:** ~1h 50min. Ninguno cambia comportamiento observable.

### 7.2 Ítems aplazados (deben quedar registrados)

En `docs/sessions/session-25-auditoria-refactor.md` quedará constancia
explícita de:

- Ítems **B** (#6, #7 si no entra, #8) → sesión 26.
- Ítems **C** (#9, #10, #11, #12) → cuando molesten o antes de v1.0.
- Features originalmente previstas para sesión 25 **retrasadas**
  (modales móvil, PWA, Lifetime, CTB) → sesión 26+.

---

## Resumen ejecutivo

- **Salud del repo: buena**. No hay bugs latentes críticos. Los comentarios
  documentan bien las decisiones. El peso está donde tiene que estar.
- **Deuda real**: duplicación significativa en la capa de *sesiones activas*
  (Breathe ↔ Move) y varias funciones/variables dormidas tras decisiones
  de sustracción acumuladas de s19-s20 (logos, copy variants, fonts).
- **Una sesión quirúrgica de ~2h** deja el repo notablemente más limpio
  sin tocar comportamiento. Ningún ítem A cambia un solo píxel visible.
- **El refactor más valioso** es la extracción de `SessionShell` —
  beneficia inmediatamente la auditoría de modales móvil prevista para
  sesión 26 (solo habrá un layout que adaptar, no dos).

**Siguiente paso:** el usuario valida esta tabla y autoriza
específicamente qué ítems atacar. Solo entonces pasamos a Fase 2.
