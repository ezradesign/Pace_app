# Changelog

Todos los cambios notables del proyecto PACE se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

---

## [v0.11.6] — 2026-04-22 — Limpieza sin riesgo: dead code del backlog de auditoría

Sesión quirúrgica. Sin cambios funcionales ni visuales. Solo borrado de código muerto acumulado tras las refactorizaciones de las sesiones 7–9 (sidebar colapsable, TopBar con tabs, eliminación del bloque Recordatorios). **~150 líneas menos** en el bundle.

### Eliminado
- **[#18]** Función `ModeToggle({ value, onChange })` completa en `FocusTimer.jsx` (33 líneas). Los tabs Foco/Pausa/Larga viven en TopBar desde v0.11.4.
- **[#19]** Entrada `focusStyles.modeRow` — envoltura del ModeToggle desaparecido.
- **[#20]** Entradas `toggleCollapsed / railItem / railBtn / railDivider` en `sidebarStyles` (~30 líneas). Definían el antiguo rail vertical de 56 px; el sidebar colapsado devuelve `null` desde v0.11.4.
- **[#21]** Entradas `input / addBtn / reminderItem / reminderRemove` en `sidebarStyles` (~30 líneas). El bloque Recordatorios se quitó de la UI en v0.11.3.
- **[#23]** Rama `if (compact) return ...` en `StatusBar`. Solo se invocaba desde el rail colapsado eliminado. `StatusBar` pasa a ser `function StatusBar()` sin argumentos.
- **[#24]** Componente `ChevronRightIcon` completo en `Sidebar.jsx`. Se usaba para el chevron "expandir" del antiguo rail.

### Cambiado
- **[#26]** Iconos locales del BreakMenu renombrados: `WindIcon / MoveIcon / DropIcon` → `BMWindIcon / BMMoveIcon / BMDropIcon`. Evita lectura confusa con los `ABBreathe / ABMove / ABDrop` de la ActivityBar en `main.jsx` (son iconografías distintas para los mismos tres conceptos).
- **[#22]** Añadido comentario de decisión explícito en `app/state.jsx` sobre por qué el campo `reminders: []` permanece en el default state a pesar de no tener UI: compatibilidad con localStorage de usuarios existentes + futura reintroducción en un modal dedicado.

### Añadido
- **Regla nueva en `CLAUDE.md`**: "Carpeta `Pace_app` siempre lista antes de quedarse sin contexto". Formaliza que antes de cualquier cierre brusco o cambio de contexto, la carpeta espejo tiene que reflejar una app **estable y sin crashear**, aunque eso signifique revertir trabajo a medias.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.6** (~172 KB, ~2 KB menos que v0.11.5).
- Rotado `backups/PACE_standalone_v0.11.5_20260422.html`.

---

## [v0.11.5] — 2026-04-22 — Auditoría: bugs críticos + logo local

Sesión de auditoría profesional tras importar desde GitHub. Fixes de los bloqueos funcionales detectados en el informe, sin tocar visuales.

### Corregido
- **[Bug #28] Módulo Extra no desbloqueaba sus logros.** Las rutinas Extra reutilizaban `MoveSession`, que llamaba a `completeMoveSession` en vez de `completeExtraSession`. Resultado: `first.extra` era inalcanzable, `plan.extra` nunca se marcaba, los minutos se sumaban al bucket Mueve sin distinción. Fix: `MoveSession` acepta prop `kind` (`'move'` | `'extra'`) y despacha la completion correcta.
- **[Bug #4] `water.today` no se reseteaba al cambiar de día.** Un usuario que bebía 8 vasos el lunes abría la app el martes con el contador ya completo. El campo `water.lastReset` existía en el default pero nunca se usaba.
- **[Bug #3] `cycle` (pomodoros hoy) y `plan` (actividades hoy) no se reseteaban al cambiar de día.** El sidebar mostraba 40+ ciclos para usuarios veteranos en vez de los de hoy.
- **[Bug #10] Easter egg "vaca feliz" inalcanzable.** El contador `cowClicks` existía en `main.jsx` pero ningún elemento del DOM llamaba a `onCowClick`. El logo oficial (vaca) vive en el Sidebar, donde no llegaba la prop. Fix: CustomEvent global `pace:cow-click` disparado desde el contenedor del logo del sidebar.
- **[Bug #11] `PaceWordmark` ignoraba completamente la prop `variant`.** El TweaksPanel exponía 4 variantes de logo pero todas renderizaban lo mismo (había un `return` temprano incondicional). Los logros `secret.seal` / `secret.illustrated` no tenían sentido visual. Fix: `PaceWordmark` vuelve a discriminar por variante — `pace` = PNG oficial (default), `lockup` = SVG integrado, `lineal`/`sello`/`ilustrado` = pictograma + wordmark clásico. Añadida opción `'Lockup SVG'` al TweaksPanel.
- **[Bug #14] Versión hardcodeada `Pace v0.11.2`** en el StatusBar del Sidebar, dos sesiones desactualizada. Sustituida por constante `PACE_VERSION` exportada desde `state.jsx`.
- **[Bug #12] Logo dependía de URL externa (`genspark.ai/.../gv4cpVUt`).** La app rompía visualmente sin red. Fix: ruta local `app/ui/pace-logo.png` + fallback automático al `PaceLockup` SVG si la imagen falla (útil para standalone offline sin el PNG inline).

### Añadido
- **`rolloverIfNeeded(state)` + `ensureDayFresh()` en `state.jsx`**: función de rollover diario que resetea los contadores "de hoy" (`cycle`, `plan`, `water.today`) cuando la fecha de calendario cambia desde la última actividad. Se llama automáticamente en `loadState()` (cobertura de refresh) y defensivamente desde las actions (`completePomodoro`, `addWaterGlass`, etc.) para cubrir el caso de que la pestaña siga abierta al cruzar la medianoche.
- Campo `lastActiveDay` en el state, con el `toDateString()` del último uso.
- Constante `PACE_VERSION` centralizada, exportada a `window`.

### Cambiado
- **`completeExtraSession(routineId, durationMin)`** ahora acepta argumentos y acumula los minutos en `weeklyStats.moveMinutes` (semánticamente ambos son "cuerpo activo"). `plan.extra` sí se marca separado.
- **Logo oficial** vuelve a cargar local (`app/ui/pace-logo.png`) con fallback SVG silencioso.
- Título en `PACE.html` bump a **v0.11.5**.

### Eliminado
- Prop `onCowClick` en `TopBar` (nunca se enganchaba a nada).
- Código muerto tras el `return` temprano de `PaceWordmark`.

### Decisiones tomadas
- **Extra suma minutos al bucket Mueve en stats**, no a uno propio. Semánticamente ambos son movimiento; `plan.extra` vs `plan.muevete` sigue separado para que los logros diferencien. Si se quisiera en el futuro un cuarto gráfico "Extra" en WeeklyStats, basta con añadir `extraMinutes: [0*7]` al state y un `case` en `completeExtraSession`.
- **Logo offline usa fallback SVG**, no se embebe el PNG en el standalone (seguiría cargando si hay red). Evita hinchar el standalone 300 KB sólo por la imagen.

---

## [v0.11.4] — 2026-04-22 — Timer "Aro" alineado a referencia visual

### Corregido
- **Bug crítico en `TimerVisualization`**: la prop `inner` (botones Comenzar/reset + dots de ciclo) no se estaba propagando al componente `TimerAro`. Resultado visible: botones y ciclo ausentes dentro del aro. Arreglado añadiendo `inner` a la firma de la función y al JSX que instancia `<TimerAro />`.

### Añadido
- **Handle flotante top-left** para re-abrir el sidebar cuando está colapsado (botón ≡ de 30×30px con hover elegante, visible sólo cuando `layout !== 'minimal' && sidebarCollapsed`).
- **Divisor interno fino** (`innerDivider`) dentro del aro del timer, entre el subtítulo italic y los botones.
- **Dots de ciclo dentro del aro** (antes vivían fuera, debajo del timer entero).

### Cambiado
- **Timer "Aro" (default) rediseñado 1:1 con la referencia** del usuario:
  - Anillo más fino (`strokeWidth 0.35`) sin el anillo exterior extra anterior.
  - Arco de progreso sutil (`strokeWidth 0.5 + line-2 + strokeLinecap round`).
  - Punto verde oliva (radio 1.25) como único indicador de progreso.
  - Número italic gigante con `clamp(72px, 9vw, 132px)` para escalar con el viewport.
  - **Botones dentro del aro** (antes estaban fuera) — Comenzar pequeño verde oliva + reset circular 28px.
  - Micro-barra inferior eliminada (la referencia no la tiene).
- **Aro siempre cuadrado y responsive**: `width/height: min(68vh, 620px)` + `aspect-ratio: 1/1` + `flex-shrink: 0`. Evita ovalos en pantallas anchas.
- **Tabs Foco/Pausa/Larga movidos al TopBar**, centrados absolutamente con `left: 50% + translateX(-50%)`. Ya no hay duplicado dentro del FocusTimer.
- **Sidebar colapsado ahora oculta el panel por completo** en vez del rail de 56px con iconos (el rail queda en histórico de git por si se reintroduce).
- **MinutesPicker** pulido: gap de 4px + label `MIN` más spaceado + borders transparentes para transiciones suaves.
- Título en `PACE.html` bump a v0.11.4.

### Eliminado
- El `modeRow` duplicado dentro del FocusTimer (los tabs viven arriba ahora).
- La función `ModeToggle` interna del FocusTimer (sustituida por los tabs del TopBar).
- El rail colapsado del Sidebar (sustituido por `return null` + handle flotante).

### Refactor
- `focusStyles` reestructurado con tokens nuevos agrupados por propósito (`aroFrame`, `aroInner`, `modeLabel`, `numberHuge`, `subtitleItalic`, `innerDivider`, `controls`, `controlsTight`, `startBtnPrimary`, `startBtnSecondary`, `resetCircle`, `cycleDots`).
- `TimerAro` recibe nueva prop `inner` para inyectar los botones desde el padre sin duplicar lógica.

---

## [v0.11.3] — 2026-04-22 — Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080

### Añadido
- **Componente `PaceLogoImage`** en `app/ui/CowLogo.jsx` — renderiza el logo oficial como `<img>` con `mix-blend-mode: multiply` para fundirlo con el paper del sidebar. URL: `https://www.genspark.ai/api/files/s/gv4cpVUt` (logo v2 con fondo blanco sólido, vaca integrada en la "P" de Pace. y subtítulo "Touch grass, even from your desk").
- Botón de **Tweaks** añadido al TopBar como última posición a la derecha. Orden final del TopBar: **Stats · Logros · Tweaks**.

### Cambiado
- **`PaceWordmark` ahora usa siempre el logo oficial** (PNG), independientemente de `state.logoVariant`. Las variantes legacy (`lineal` / `sello` / `ilustrado` / `lockup`) quedan en el código pero no se renderizan. Se pueden reactivar quitando el `return` temprano del default.
- **Layout principal** pasa de `minHeight: 100vh` a `height / maxHeight: 100vh + overflow: hidden`. La interfaz ahora cabe completa en 1920×1080 sin scroll vertical y se adapta al navegador.
- **`<main>` y contenedor del FocusTimer** llevan `minHeight: 0 + overflow: hidden` para que flex distribuya el espacio sin desbordar.
- **`<aside>` del sidebar** con `height: 100vh + overflow-y: auto` como red de seguridad para scroll interno si hiciera falta.
- `ActivityBar` y `TopBar` compactados (paddings reducidos, `flexShrink: 0`).
- `sidebarStyles.logoRow` con `align-items: center + min-height: 48` para que la imagen del logo respire.
- Número de racha reducido de 56 → 44 px para ganar altura.
- Divisores del sidebar reducidos de `margin: 20px/16px` → `16px/14px`.

### Eliminado
- **Sección Recordatorios del sidebar** (apartado de "anotaciones"): input "Avisa…", selector de minutos, lista con scroll y placeholder italic. El estado `state.reminders` se preserva internamente por si se reintroduce la UI. Libera ~220 px de altura.
- Estados `reminderInput` / `reminderMin` y helpers `addReminder` / `removeReminder` eliminados (código muerto).
- Arranque doble del `<PaceApp/>` corregido: `app/main.jsx` ahora solo crea su propio root si existe `#pace-root`. En `PACE.html` el montaje sigue haciéndose en `#root` al final del HTML.

### Notas
- ⚠️ El logo oficial está referenciado por URL externa. El `PACE_standalone.html` necesita conexión para mostrar el logo. Para offline puro hay que descargar el PNG a `app/ui/pace-logo.png` y cambiar la constante `PACE_LOGO_URL` por la ruta relativa. Pendiente para próxima sesión.
- Sesión iterativa: primero probamos un FAB flotante de Tweaks en top-left, pero se descartó en favor de la posición en TopBar, que es más consistente con Stats y Logros.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.3**.
- `backups/PACE_standalone_v0.11.2_20260422.html` (rotado desde v0.11.2).

---

## [v0.11.2] — 2026-04-22 — Sidebar colapsable, Sendero, logo Pace.

### Añadido
- **Logo nuevo `PaceLockup`** en `app/ui/CowLogo.jsx` — wordmark "Pace." con la vaca integrada dentro de la letra P (lomo + cabeza inclinada paciendo), hierba al pie de la letra, "ace." en cursiva serif verde oliva y punto terracota final. Subtítulo "FOCO · CUERPO" en pequeño.
- Nueva opción `pace` en el eje **Logo de la vaca** del panel Tweaks, marcada como default.
- `state.logoVariant` default cambiado a `'pace'`.
- `state.sidebarCollapsed` (nuevo en el estado, default `false`).
- **Sidebar colapsable** — botón con chevron en cabecera expandida para comprimir a un rail estrecho (56 px) con racha, atajo a logros y a recordatorios. En modo colapsado, chevron inverso para volver a expandir.
- **Sección Sendero** (`SenderoDelDia` en `app/shell/Sidebar.jsx`) — SVG con curva ondulada horizontal que representa el arco del día 6h–22h. Puntos marcan los hitos del día (pomodoros, respiraciones, movimientos, vasos de agua) con color del módulo. Indicador "ahora" negro sobre la curva + etiqueta con hora actual. Contador dinámico `N hitos` en la cabecera.
- Mensaje vacío de Recordatorios (cuando no hay ninguno) con copy italic.

### Cambiado
- **Tweaks movidos** del FAB flotante (bottom-right) al TopBar junto a Stats y Logros — el FAB `fabStyles.tweaks` y su botón fueron eliminados en sesiones previas; el TopBar ahora agrupa los 3 iconos (gear, chart, trophy) arriba a la derecha.
- Atajo `T` para abrir Tweaks sigue activo.

### Eliminado
- **Sección Plan** del sidebar (chips Muévete / Respira / Extra / Hidrátate). Los chips eran redundantes con la ActivityBar inferior y ocupaban espacio que ahora se destina a Recordatorios + Sendero. El estado `plan.*` se conserva internamente para los indicadores activos de la ActivityBar y logros.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.2** (166 KB).
- `backups/PACE_standalone_v0.11.1_20260422.html` (rotado desde v0.11.1).

---

## [v0.11.1] — 2026-04-22 — Iconos ActivityBar restaurados

### Cambiado
- **4 iconos SVG nuevos** en la barra "Actividades" (`app/main.jsx`):
  - **Respira** — pulmones anatómicos con tráquea y bronquios (en lugar de círculo+cruz).
  - **Estira** — figura en postura de puente/arco con cabeza (en lugar de palito con brazos).
  - **Mueve** — mancuerna horizontal con dos discos a cada lado (en lugar de flechas).
  - **Hidrátate** — gota con highlight interior (pequeño reflejo).
- **Layout de tarjeta rediseñado** — de vertical (icono arriba, label abajo) a horizontal (icono izq + bloque de texto derecha).
- **Sublabels añadidos** en italic bajo cada título: `ritmo, calma` / `afloja tensión` / `cuerpo activo` / `agua ahora`.
- Iconos agrandados a 26×26 (antes 22×22) para compensar el layout horizontal más ancho.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.1** (154 KB).
- `backups/PACE_standalone_v0.11.0_20260422.html` (rotado desde v0.11.0).

---

## [v0.11.0] — 2026-04-22 — Fortalecimiento del proyecto

### Añadido
- `README.md` — presentación pública del proyecto para GitHub.
- `.gitignore` — excluye basura del sistema, temporales y la carpeta espejo `Pace_app/`.
- `CHANGELOG.md` — este archivo.
- `ROADMAP.md` — visión a corto / medio / largo plazo separada de `STATE.md`.
- Regla en `CLAUDE.md`: mantener carpeta espejo `Pace_app/` sincronizada para facilitar descargas y sync con GitHub Desktop.

### Cambiado
- `CLAUDE.md` — añadidas reglas de comunicación con semáforo de contexto (🟢🟡🔴) y protocolo de cierre de sesión automático.

---

## [v0.10.1] — 2026-04-22 — Reorganización modular

### Añadido
- `PACE.html` — entry point de desarrollo modular con scripts pinneados (React 18.3.1 + Babel 7.29.0 con SRI).
- Estructura de carpetas `app/` según documentación (`ui/`, `shell/`, `focus/`, `breathe/`, `move/`, `extra/`, `hydrate/`, `breakmenu/`, `achievements/`, `stats/`, `tweaks/`).

### Cambiado
- Todos los JSX movidos desde raíz plana a subcarpetas por dominio.
- `tokens.css`, `state.jsx`, `main.jsx` movidos a `app/`.

### Preservado
- `PACE_standalone.html` intacto como backup funcional offline.

---

## [v0.10] — 2026-04-22 — Pulido del core (Respira + Mueve)

### Añadido
- **Módulo Respira:**
  - Fase de preparación con cuenta atrás de 3s y mensaje calmado.
  - Fase de retención explícita en técnicas con rondas (Wim Hof-like).
  - Logros de apnea desbloqueables en tiempo real (60s / 90s / 2min).
  - Countdown visible dentro del círculo en fases ≥ 4s.
  - Pantalla de completado con stats y mensaje reflexivo.
  - Atajos de teclado: Espacio (pausar), Esc (salir), Enter (avanzar).
- **Módulo Mueve:**
  - Fase de preparación con estética ocre.
  - Glifo placeholder por paso (círculo dashed + símbolo italic rotativo).
  - Preview del siguiente paso bajo la regla de progreso.
  - Pantalla de completado con stats.
  - Atajos de teclado: ←/→ (navegar pasos), Espacio, Esc, Enter.
- Componentes compartidos: `SessionHeader`, `Stat`, `MoveStat`, `StepGlyph`.

### Cambiado
- Tarjetas de rutina rediseñadas en ambas librerías con jerarquía más clara.
- Indicador ⚠️ en rutinas con flag `safety: true`.

---

## [v0.9.2] — 2026-04-22 — Refinamiento post-feedback

### Cambiado
- ActivityBar rediseñada estilo editorial: tarjetas crema con borde fino y sombra suave, iconos terracota stroke 1.2, labels en serif italic.
- "Extra" renombrado a **"Estira"** para coherencia con Strengthside.
- Tipografía display default → Cormorant Garamond (antes EB Garamond).

### Añadido
- Tweak de timer **"Aro"** (nuevo default) — híbrido círculo + barra.
- Tweak de respiración **"Flor"** (nuevo default) — híbrido pulso + pétalo.
- Tweaks reordenados: híbridos recomendados primero.

---

## [v0.9] — 2026-04-22 — Base inicial

### Añadido
- Infraestructura de documentación: `CLAUDE.md`, `STATE.md`, `DESIGN_SYSTEM.md`, `CONTENT.md`, `HANDOFF.md`.
- Stack React 18.3.1 + Babel standalone 7.29.0 pinneado.
- Store global con `useSyncExternalStore` y persistencia en `localStorage` (clave `pace.state.v1`).
- Sistema de tokens CSS con 3 paletas (crema, oscuro, envejecido) y 3 tipografías (EB Garamond, Cormorant, JetBrains Mono).
- **Primitivos UI:** Modal, Card, Tag, Button, Divider, Meta.
- **Logo CowLogo** con 3 variantes (lineal, sello, ilustrado) + wordmark.
- **Toast** de notificaciones de logros.
- **Sidebar** completo: wordmark, ciclos, streak, ritmo, plan, logros, recordatorios, intención.
- **Módulo Foco:** timer real con setInterval, 4 estilos visuales, completePomodoro() dispara logros.
- **Módulo Respira:** librería con 12 técnicas en 5 categorías, modal de seguridad, sesión guiada.
- **Módulo Mueve:** librería con 7 rutinas, sesión con pasos.
- **Módulo Estira (Extra):** 7 rutinas de calistenia oficina.
- **Módulo Hidrátate:** contador X/8, vasos visuales, barra de progreso.
- **BreakMenu:** menú post-Pomodoro (Respira / Mueve / Hidrátate + Saltar).
- **Achievements:** catálogo de 100 logros en 6 categorías con sellos estilo libreta de campo.
- **WeeklyStats:** 4 totales + 4 gráficos de barras por día.
- **TweaksPanel:** 6 ejes de customización en vivo.
- Atajos globales: T (tweaks), S (stats), L (logros).
- Easter egg: 10 clicks en el logo → logro "vaca feliz".
