# Roadmap

Visión a medio y largo plazo de PACE.
Para el estado del día a día, ver [`STATE.md`](./STATE.md).
Para el catálogo de contenido, ver [`CONTENT.md`](./CONTENT.md).
Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).

> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras ~60 sesiones
> borrado (commit `be81606`). Refleja lo ya hecho hasta v0.34.0 y el
> plan vigente del bloque Contenido+Premium.

---

## ✅ Hecho desde el roadmap original (s21 → s84)

Buena parte de la visión de corto/medio plazo de 2026-04 ya está en
producción:

- **Responsive móvil** — sidebar fullscreen + home en viewport (s22+).
- **Loop post-Pomodoro** — `BreakMenu` con sugerencias de pausa activa.
- **Ritmos** — vistas semanal / mensual / anual (heatmaps) (s43-s54).
- **Sonidos** — sintetizados con Web Audio (432 Hz), no WAVs (s28+).
- **Caminos** — secuencias guiadas por hora del día, 7 caminos (s49-s80).
- **i18n ES/EN completo** + PWA en Cloudflare Pages.
- **Logros** — catálogo de 106 (69 activos) con glifos heráldicos.
- **Sistema de glifos** de ejercicios (line-art) — iter cerrado 31/46 (s84).

---

## 🎯 Bloque Contenido + Premium (post-v0.34.0) — ✅ CERRADO (s94, v0.39.0)

Bloque grande en fases (1 fase = 1 sesión cerrable). Planificado en la
Fase 0 (s84-bis / 2026-06-05), cerrado en s94 (2026-07-08) con las 8 fases
hechas. Detalle de catálogo en [`CONTENT.md`](./CONTENT.md). El plan
vigente pasa a ser la secuencia post-bloque de "Camino a v1.0" (abajo).

| Fase | Alcance | Estado |
|---|---|---|
| **F1** | Copy Buy Me a Coffee (truth-fix) + recrear `CONTENT.md` y `ROADMAP.md` | **hecho (s85, v0.34.1)** |
| **F2** | Auditoría de tracking punta a punta + micro-fixes | **hecho (s86, v0.34.2)** — tracking sano + fix F-1 |
| **F3a** | Mecanismo de gating: token `--premium` + `PremiumSeal` + `RoutineCard` lee `access` (sello + "Pronto" + clic off) | **hecho (s87, v0.34.3)** — dormante, todas las rutinas `free` |
| **F3b** | Activación: gating encendido sobre rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` cableado (sin compra real) + superficie premium display-only en Tweaks | **hecho (s88, v0.34.4)** — `locked.*` y licencia real diferidos a post-v1.0 |
| **F4** | Contenido Respira → ~20 técnicas (incl. CTB largas premium, con seguridad) | **hecho (s90, v0.35.0)** — 20 técnicas, 8 premium; `rounds.long` 5×35 como precursora CTB; la experiencia CTB completa queda para post-bloque (abajo) |
| **F5** | Contenido Estira → ~12-15 rutinas (~mitad premium), categorizado | **hecho (s91, v0.36.0)** — 14 rutinas, 6 premium, 4 grupos como Respira; 11 pasos nuevos con DefaultGlyph (cola D-4) |
| **F6** | Contenido Mueve → ~12-15 rutinas (~mitad premium), reclasifica la fuerza | **hecho (s92, v0.37.0)** — 14 rutinas, 6 premium, 4 grupos free-first (`mueve.cat.*`); 9 pasos nuevos con DefaultGlyph (cola D-4 → 35); strings-content.js troceado en `app/i18n/content/` |
| **F7** | Registro interno de ejercicios + **constructor de rutinas premium** (`custom.sequence`) | **hecho (s93, v0.38.0)** — registro curado 65 ejercicios / 8 grupos (`app/custom/`) + sección "Tus rutinas" al final de la biblioteca Mueve (superficie premium entera); crédito vía `completeMoveSession`, sin logros nuevos; ids `custom.<ts>` |
| **F8** | Visual de Caminos — auditoría DESIGN_SYSTEM + polish de los 6 componentes | **hecho (s94, v0.39.0)** — huérfanas `--olive`/`--terracota` → tokens reales por reemplazo directo (barra de acento invisible + botón salir ilegible corregidos); clipPath único (vivía en Sidebar, no en SenderoBar); títulos de Caminos a `var(--font-display)` (siguen data-font); SenderoBar auditado limpio, cero cambios — **CIERRA EL BLOQUE** |

**Decisión clave:** el gating va **antes** del contenido (no se puede
etiquetar `access` con honestidad sin el campo ni el sello). La unidad
gateable es la sesión, no el ejercicio suelto (ver `CONTENT.md`).

---

## 🧭 Camino a v1.0 — Plan maestro (adoptado s93, 2026-07-08)

Síntesis de las reflexiones de producto/ingeniería del usuario,
reconciliada contra el código real. **Métrica guía de cada sesión:**
*un usuario nuevo completa su primer Camino en < 3 minutos, sin
fricción, y quiere volver mañana.*

### Hallazgos verificados contra el repo (2026-07-08)

- `--olive`/`--terracota` **huérfanas** (sin definir en tokens.css; usadas
  en PathsLibrary, SuggestedPathCard, PathRunner.parts — pierden color en
  silencio). **RESUELTO s94** (reemplazo directo por `--focus`/`--breathe`).
- React **development** + Babel runtime + unpkg CDN en producción.
- Timers con `setInterval` que derivan en background: prioridad de fix
  **Focus (crítico) > Breathe (activeTime) > Move (bajo — sesiones cortas
  con pantalla activa)**. **Focus RESUELTO s96** (motor timestamp-based
  `useCountdown.jsx`, cero deriva; FocusTimer + PathFocusStep). **Breathe
  RESUELTO s98** (reloj de tiempo activo timestamp-based; excluye pausas del
  fin/barra/credito). Move sin planificar (bajo).
- BreatheSession cuenta pausas como tiempo activo (wall-clock). **RESUELTO
  s98** (`getActiveSec()` con `Date.now()`; el credito son minutos activos
  reales, no el nominal `routine.min`).
- Stats mes/año no muestran el día actual (history se alimenta en
  rollover) → selector `getHistoryWithToday` **memoizado**. **RESUELTO
  s101** (`state-history.jsx`: reutiliza `archiveDayToHistory`, StatsPanel
  lo consume; el rollover sigue siendo el único escritor).
- `path.weekend` lanza premium sin candado: NO es bug (decisión s89,
  degustación curada). **RESUELTO s95** como campo explícito: sus 2 steps
  premium llevan `tasting: true` que el guard central reconoce. La decisión
  final (mantener degustación vs versión free) se toma en la sesión de
  licencia; el cableado ya la soporta.
- Cola D-4 (35 glifos placeholder) es **pre-venta**: no se puede vender
  packs cuyos pasos rendericen DefaultGlyph.
- El Path Builder se abarató ~50% tras F7 (registry + CRUD + builder +
  overlay + runner data-driven reutilizables).

### Secuencia post-bloque (1 fase = 1 sesión cerrable)

| Sesión | Contenido |
|---|---|
| ~~s94~~ | ~~F8 visual Caminos~~ **hecho (v0.39.0)** — huérfanas resueltas + clipPath único (estaba en Sidebar.jsx, no en SenderoBar) + tipografía tokenizada |
| ~~s95~~ | ~~Cirugía 1: guard central de entitlement + degustación explícita~~ **hecho (v0.40.0)** — `state-entitlement.jsx` (`canAccessRoutine`/`canAccessPath`) consumido por RoutineCard + PathBreatheStep/PathBodyStep/getSuggestedPath · `path.weekend` con `tasting:true` explícito · `PathStepLocked` (auto-skip) · autofocus Welcome solo puntero fino · comportamiento idéntico con `premiumUnlocked=false`, **NO toca F3b** |
| ~~s96~~ | ~~Cirugía 2: Timer engine timestamp-based~~ **hecho (v0.41.0)** — `app/focus/useCountdown.jsx` (estados idle/running/paused/completed; `remaining = f(Date.now())` desde `endsAt` → **cero deriva en background**, `visibilitychange` corrige al volver; `completed` terminal) migrado a FocusTimer (493→429 ln) y PathFocusStep · `completeFocusSession(context)` unificado que **preserva la distinción** home(cycle+logros)/Camino(minutos+streak) · **comportamiento idéntico en primer plano** · motor LOCAL (persistir en recarga diferido a s99) |
| ~~s97~~ | ~~(previsto: breathe activeTime)~~ → **pulido oscuro + progreso** **hecho (v0.42.0)** — modo oscuro legible (recalibración en bloque `--ink-3`/`--line`/`--line-2`; logo invertido intacto, validado por el usuario) · **aro del timer empieza siempre vacío** (`useCountdown` idle deriva de `durationSec`) · **progreso de Respira = barra segmentada por bloques** (un segmento por ciclo/ronda, el activo se rellena por dentro) · fixes de countdown (precontador "3", Mueve centrado). Breathe activeTime se corre a s98 |
| ~~s98~~ | ~~BreatheSession tiempo activo~~ **hecho (v0.43.0)** — reloj de tiempo activo timestamp-based (`activeMsRef`/`segStartRef`/`getActiveSec()`, segmentado por `useEffect([stage,paused])`, mide `Date.now()` → inmune a background) que alimenta fin no-rounds (`getActiveSec() >= routine.min*60`) + barra no-rounds + **credito** (`completeBreathSession` recibe minutos activos reales `max(1,round(sec/60))`, no `routine.min`; firma intacta → cero cambios en state) + pantalla done · retira `startTime`/`cycle`/`doneInCycle` · la incoherencia s97 (fin wall-clock vs barra activa) queda unificada al mismo reloj; rama rounds intacta |
| ~~s99~~ | ~~(previsto: stats vivos)~~ → **desvío de pulido** priorizado por el usuario **hecho (v0.44.0)** — pack de microinteracciones global + overhaul premium de Caminos (SessionShell en los 4 pasos, timer ticks, botones por color, atmósfera por paso, kicker romano, sendero con hito acentuado) |
| ~~s100~~ | ~~(previsto: PWA)~~ → **remate de Caminos** (feedback s99) **hecho (v0.45.0)** — **CompletionScreen "ceremonia editorial"** + sendero héroe con draw-in · **OutroCard eliminada** (el último paso pasa directo al completado; decisión s77 revisada) · **banding de atmósfera suavizado** (hint de interpolación 22% + grano SVG como dither) |
| ~~s101~~ | ~~Stats a fondo~~ **hecho (v0.46.0)** — auditoría de tracking (mapa escritores→lectores, 8 hallazgos verificados, plan aprobado antes de tocar) + **stats vivos** (nuevo `state-history.jsx` con `getHistoryWithToday` memoizado → Mes/Año/totales con el día actual; state-core 511→407 ln, sale de deuda) + WeekDots del sidebar con criterio s69 + fila "Mueve"→**"Cuerpo"** (moveMinutes = Mueve+Estira) + racha de Caminos viva + fix DST hydrate.week.perfect + WeeklyStats.jsx muerto borrado + **`/safety` y `/privacy`** estáticas (autocontenidas, ES+EN; sin enlazar desde la UI aún). Diferidos: H7 crédito solo-al-completar de Mueve/Estira ("Move timer: bajo") y H8 proxies del Sendero del día (→s106) |
| ~~s102~~ | ~~PWA completa~~ **hecho (v0.47.0)** — **manifest.webmanifest** completo (id, 4 shortcuts con deep links `/?go=` consumidos una vez, launch_handler, colores → `--paper #F2EDE0`) · **fix despliegue**: `index.html` iba SIN `<link rel="manifest">` desde s48c (no instalable); el build lo re-inserta solo en la copia desplegada · **update prompt** (sw.js sin skipWaiting incondicional → waiting + `UpdatePrompt.jsx` "Actualizar/Luego"; navegaciones siguen network-first s89) · **notificación fin-pomodoro** opt-in (toggle Ajustes, permiso al activar, solo pestaña oculta, silent) · enlaces **Seguridad·Privacidad** en Ajustes (solo web) · **Pomodoro persiste la recarga** (`pace.timer.v1` local; reanuda solo si vivo, expirado sin acreditar — **cierra el fork s96**) |
| ~~s103~~ | ~~Build Etapa A (1 de 2)~~ **hecho (v0.48.0)** — los 74 scripts text/babel **compilados en build** (`@babel/core` 7.29 en memoria: sourceType script, targets evergreen, retainLines; **IIFE por archivo + re-exposición AST de function/var top-level** = semántica exacta del eval indirecto de Babel standalone; hallazgo clave: `RoutineCard` y otros globals implícitos nunca pasaron por Object.assign) + **React 18.3.1 production UMD self-hosted** (vendor/ desde npm, inlineado en ambos artefactos) + **@babel/standalone fuera del output** → cero CDN de JS, cero compile en el navegador (antes ~4 MB de unpkg + 1-3 s por carga) · dev intacto · pins deliberados Babel 7 / TS 5 (los latest rompen el build) · pareja SW s89+s102 re-verificada con dos SW reales · standalone 774→924 KB pero autocontenido en JS por primera vez |
| ~~s104~~ | ~~(previsto: fuentes)~~ → **Arte D-4 completo: escenas ilustradas de Caminos** **hecho (v0.49.0)** — el usuario ENTREGÓ las 7 láminas y las priorizó; escena cover full-bleed en el runner (`PathIllustration` + `paths.index.js` medido por escaneo) · **casquetes** gris→color de actividad (orbe s77 retirado) · cámara con pan + encuadre del FINAL del camino en Completion · etiqueta del paso en placa anclada a la bola · tagline en la intro · regla "sobre el arte siempre es de día" · pipeline archivo+precache web / data URI standalone · `scripts/ingest-lamina.js` (modo híbrido) · fix `PACE_VERSION` · análisis estratégico externo verificado (todayISO UTC = bug real → s105) |
| ~~s105~~ | ~~Fuentes self-hosted + todayISO local~~ **hecho (v0.50.0 — CIERRA Etapa A del build)** — **PRESERVANDO Cormorant** (hallazgo: el default real de títulos es Cormorant, no EB Garamond → decisión s103 revisada con el usuario tras comparativa visual): 3 familias self-hosted subset-latin en `fonts/` (Cormorant títulos + EB Garamond cifras + Inter Tight UI, 12 caras 520 KB), JetBrains Mono retirada → ui-monospace, cero peticiones a Google en los 3 artefactos · todayISO local en 7 sitios (`toISODate()`) · **+4 arreglos en vivo**: BreakMenu coherente (iconos AB* de la home + Estira, 2×2), aro del pomodoro en Pausa/Larga, frame fantasma PathRunner (fase 'intro' en render), toasts de logro aplazados en Camino, y **bug B de integridad** (un Camino solo cuenta con ≥1 paso hecho; antes saltarlo todo desbloqueaba "Cartógrafa"). Original: (a) fix `todayISO()` a fecha LOCAL (bug verificado s104: rachas/history anotan el día anterior entre medianoche y ~2 AM; 7 sitios) con verificación de rollover/rachas/heatmaps; (b) fuentes (bifurcaciones s103): **EB Garamond + Inter Tight** woff2 subset latin → `fonts/` + @font-face (fuera el @import de Google) · index.html `/fonts/*` al PRECACHE · standalone data URIs · MIME woff2 en static-server · decidir tweak `data-font="cormorant"` (quedará huérfano) · cero peticiones a fonts.googleapis en los 3 artefactos |
| ~~s106~~ | ~~Onboarding 3 pantallas~~ **hecho (v0.51.0)** — flujo **full-screen de 5 pantallas sobre las láminas de Caminos** (bienvenida manifiesto + necesidad/tiempo/entorno → **`profile` en state** + "Tu primer Camino"); **sustituye al WelcomeModal** (s17, retirado) · 3 bifurcaciones decididas por el usuario (full-screen con arte / **sugerir en home**, no auto-arrancar / chips + texto libre) · `pickFirstPath(profile)` con fallback `getSuggestedPath`; el cierre fija `paths.lastViewed` → la home destaca el pick · cada pregunta saltable · remap "sobre el arte siempre es de día" ampliado (`--focus-cta`+`--achievement`) · el `profile` queda listo para el scoring v2 de s107 |
| ~~B1.1~~ | **[INSERCIÓN 2026-07-16, sesión de auditoría]** Bloques **B1 (saneamiento) + B2 (fundamentos)** del plan de evolución se insertan ANTES de la fila s107; canónico en [`docs/product/DECISIONES_PRODUCTO.md`](./docs/product/DECISIONES_PRODUCTO.md); la pre-venta se retrasa ~3-4 sesiones. **B1.1 hecho (v0.52.0, sesión #107)** — parseLocalDateKey + rachas UTC · cifras honestas (logros /106, «días con ritmo», sendero abstracto) · acento Estira por kind · BreatheVisual transición=fase · 7 duraciones recalibradas · **apnea retirada** (hold = guía calmada; 3 secretos de exploración sustitutos) · claims Respira orientativos ES+EN |
| **B1.2** | **Editorial de seguridad ES+EN completo** (al fallo/al límite/indestructibles/hombro nace para colgar · chin tuck sin «papada» · PULL→empuje · anunciar suelo/pared/barra · silla estable/barra que soporte peso · Dead hang opcional) con el criterio realista-explicativo (memoria `feedback-realismo-ejercicios`) + curación Respira·Energía (feedback s107-cierre: Bhastrika/pranayama fuera del grupo Energía o re-etiquetado; `rounds.express` free para que Energía no quede vacía en free) |
| **B2** | **Fundamentos** (2-3 sesiones): `visualId`+alias · contrato de pasos v1 (`mode: timed\|reps\|perSide\|rest\|transition\|manual`, fallback timed) · metadatos de rutina · duración derivada + rangos honestos · feedback «¿te ayudó?» · diseño del esquema de eventos. **Base de conocimiento offline**: [`docs/product/BASE_MUEVE_ESTIRA.md`](./docs/product/BASE_MUEVE_ESTIRA.md) (NHS/ACSM/OMS → reglas de unidad por tipo de ejercicio, duración calculada, auditoría ejercicio-a-ejercicio ANTES de tocar código) |
| **s107** | **Home: Caminos al centro** (SuggestedPathCard protagonista, ¿con thumb de su lámina?) + `getSuggestedPath` v2 con scoring + **"After Pomodoro"** (mini-Camino automático sugerido al terminar Foco, en el BreakMenu — análisis s104: materializa el loop trabajo→pausa→volver) + mini-Caminos de activación 2-3 min |
| **s108-109** | **Taxonomía de metadatos** en las 3 bibliotecas (context/bodyZones/goals/intensity/noiseLevel) → **filtros** + categorías por RESULTADO en Respira (calmarme/volver al foco/dormir — análisis s104) + modo **"No puedo levantarme"** (sigilo) |
| pre-venta | Iteración glifos D-4 → **revisión COMPLETA del set** (feedback s101-cierre, patrón s84) · **trial 7 días explícito** (no auto-start; `premiumUnlocked` derivado de licencia‖trial) · **licencia firmada offline ECDSA P-256** (guardar la clave y revalidar en arranque, no un booleano) — requiere **cambiar formalmente la decisión F3b** · landing `/` separada de `/app` · pricing/terms · **estrategia de venta: revisar A FONDO el canal Starter Story** (youtube.com/@starterstory — pedido s101-cierre; casos con cifras reales, playbooks de apps indie, pricing/lanzamiento/distribución; destilar comparables ANTES de fijar pricing/landing; memoria `premium-strategy-sources`) |
| post-venta | Vite/ESM real (Etapa B) · Path Builder (reuso F7) · Modo Estudio · sonidos procedurales premium · CTB completa · **Android + iOS via Capacitor** (notificaciones/hápticos/widget/billing; iOS "cuando corresponda" — feedback s102-cierre) · Wrapped · extensión Chrome · IndexedDB via localForage (antes: `navigator.storage.persist()` tras onboarding, barato) |

**Principios del plan:** local-first ≠ cero servicios (infra de
compra/licencias OK; backend de producto y tracking NO) · no abrir más
de un frente por sesión · el standalone sigue vivo como artefacto de
exportación en todas las etapas.

### Backlog de pulido / UX (feedback usuario s96, 2026-07-08)

Observaciones del usuario con capturas al cerrar s96. Los 2 bugs + los fixes
de progreso de sesión se atacaron en **s97 (v0.42.0)**; el resto sigue sin
planificar. Persistido en memoria `ux-refinement-backlog`.

- ✓ **[HECHO s97] Modo oscuro casi ilegible.** Recalibración EN BLOQUE de
  `tokens.css` oscuro: `--ink-3 #756D5D→#B2A995` (estaba más oscuro que en la
  paleta clara → toda la letra fina ilegible), `--line →#4d4536`,
  `--line-2 →#5f5544` (track del aro de TimerDial + bordes de cards). El
  **logo NO era bug**: el `invert+screen` azul/rosa es el original y el usuario
  lo valida como estética noche → se intentó sustituir por SVG y lo rechazó;
  intacto (ver decisión activa STATE + memoria `feedback-logo-oscuro-original`).
- ✓ **[HECHO s97] Precontador "3" solapa el caption.** Era `SessionPrep`
  (`SessionShell.jsx`), numeral 200px `lineHeight 0.9` con `marginTop 20` →
  subido a 40 (móvil 14→20). `PathTransitions.StepIntro` no tiene numeral.
- ✓ **[HECHO s97] Countdown de Mueve descentrado** (pegado a "SEGUNDOS") →
  rebalanceado 22/22 + `lineHeight 1.08`. Y **progreso de Respira** (bolas sin
  sentido) → barra segmentada por bloques.
- **[Layout web fijo] Pomodoro home: semicírculo integrado en las pills.**
  El aro debe abrazar de forma FIJA la fila FOCO/PAUSA/LARGA (captura de
  referencia), no depender del zoom/resolución. Hoy `TimerDial.frame` =
  `min(56vh, 86vw, 520px)` → tamaño y "abrazo" varían con viewport.
- ✓ **[HECHO s99+s100] Runner de Caminos refinado.** Overhaul premium en
  **s99 (v0.44.0)**: los 4 tipos de paso comparten el `SessionShell` (Foco/Agua
  dejan de ir pelados), **timer aro de marcas de minuto**, **botones del Foco
  por color**, **atmósfera por paso**, cards de transición con kicker romano,
  sendero con hito actual acentuado. **Remate en s100 (v0.45.0)** con el
  feedback: **CompletionScreen "ceremonia editorial"** (kicker + nombre
  protagonista + meta romana + sendero héroe con draw-in + recorrido sin caja +
  logros como sellos), **OutroCard eliminada** (último paso directo al
  completado, decisión s77 revisada) y **banding de atmósfera suavizado**
  (hint + grano SVG dither). El pack de pulido GLOBAL cerró en s99. Queda
  OPCIONAL: ilustración propia por Camino (espera arte aprobado, D-4).
- **[Sidebar]** (a) micro: subir el divisor logo↔Ritmo (menos aire bajo el
  logo, mejor proporción, gana espacio). (b) mayor: más útil / info más
  atractiva. Encaja con **s106** (home Caminos al centro) o aparte.
- **[Premium/builder] Constructor más visible + Mueve Y Estira.** El builder
  (F7, hoy solo al final de MoveLibrary) con más presencia y ejercicios de
  ambos módulos (no solo Mueve). Sigue premium; `exercise-registry.js` ya
  une MOVE+EXTRA, falta exponer Estira en el picker.
- **[UX móvil] Filtros en bibliotecas.** Scroll por catálogos crecidos
  (Estira 14 / Mueve 14 / Respira 20) poco práctico en móvil. Mapea a
  **s107-108 (taxonomía + filtros)**; el usuario prioriza la experiencia
  móvil aquí.
- **[feedback s101-cierre — Audio] Módulo de audio más atractivo.**
  `Sound.jsx` (síntesis Web Audio, v0.35.0) cumple pero el usuario pide
  pulirlo, perfeccionarlo y hacerlo "mucho más atractivo". Encaje natural:
  **sesión propia de audio premium ANTES del bloque CTB** (las sesiones
  largas dependen de él; hoy "sonidos procedurales premium" figura en
  post-venta → adelantar es decisión de calendario al llegar a pre-venta).
- **[feedback s101-cierre — Glifos] Coherencia premium Mueve/Estira.**
  No solo la cola D-4 (35 con DefaultGlyph): los glifos EXISTENTES "tienen
  fallas y no se ven coherentes ni premium". La iteración pre-venta pasa a
  ser **revisión COMPLETA del set (46+)**, con Strengthside como referencia
  visual de Estira. REGLA intacta (s84/D-4): el usuario itera y aprueba,
  se porta literal — nunca dibujar sin su OK.
- **[feedback s101-cierre — Contenido] Títulos de ejercicios en inglés.**
  Varios pasos usan término técnico EN (couch stretch, hollow hold…) y
  "puede ser difícil entender exactamente qué hay que hacer". Auditoría de
  nomenclatura: nombre ES claro y/o cue explicativo. Mapea a **s107-108**
  (la taxonomía ya toca las 3 bibliotecas). OJO: `name` ES canónico es KEY
  de glifo y de i18n custom (decisión s93) — renombrar exige migrar keys.
- **[feedback s101-cierre — Fuentes]** Refuerzo del usuario sobre la memoria
  `breathe-content-sources`: Breathe With Sandy → respiración "muy premium,
  especial y pulida" · Tom Woodfin → sesiones largas premium CTB ·
  Strengthside → pulir Estira premium. Inspiración, no copy literal.
- **[feedback s102-cierre — Pomodoro] Subtítulo dinámico por duración.**
  Hoy `focus.subtitle.focus` es FIJO ("Concentración profunda") para
  cualquier preset. Pedido: frase según duración (ej. 15' → "Foco corto",
  45' → "Concentración profunda"), estilo PACE relajado y original, con
  **≥2 variantes por duración rotando aleatoriamente**. ES+EN. Decidir
  criterio para "Otro" (custom 1-180: por rangos). Sesión de pulido pequeña;
  puede agruparse con el CTA y el scroll de Ritmo.
- **[feedback s102-cierre — CTA] "Comenzar" del pomodoro poco atractivo.**
  El botón/tipografía del CTA principal "no es demasiado atractivo o
  bonito". Abrir exploración de opciones y que el usuario ELIJA (bifurcación
  de diseño): presencia/tamaño, serif italic vs sans actual, pill vs recto,
  microinteracción de press. OJO: su token es `--focus-cta` (s77b) y el
  glow del aro ya existe (`pace-dial-glow`, s99) — coherencia con ambos.
- **[feedback s102-cierre — Stats] Ritmo sin scroll vertical en web.**
  Reapareció la barra de scroll derecha del panel en la versión web
  (s61-s63 ya lo dejaron sin scroll en 1080p; la fila "Cuerpo" de s101
  añadió una fila a Semana). Reformular la ventana para que quepa sin
  scroll — compactar, no amputar.
- **[feedback s102-cierre — Gamificación SUAVE].** "Gamificar un poco más
  la app para que los usuarios se enganchen y les ayude a ser constantes
  — suave pero bien pensada, que sea divertido usarla". Video de referencia
  (solo para ideas): **"I built a habit system as addicting as a casino"
  (SpoonFedStudy)** — youtube.com/watch?v=Qji8_5XgMW4. MATIZA el "sin
  gamificación agresiva" de CLAUDE.md: agresiva no, suave sí. Necesita
  **sesión de diseño propia ANTES de código** (qué mecánicas, qué NO);
  base ya existente: 106 logros + rachas + heatmaps + "Retos semanales"
  (Medio plazo). Principios del usuario para TODO lo visual: bonita,
  simple, útil, profesional, vistosa y sobre todo sencilla y fácil de usar.
- **[feedback s102-cierre — Plataformas] Web + Android + iOS.** iOS entra
  en el mapa ("cuando corresponda"; antes el plan decía v1.0 web+Chrome,
  v2.0 Android). Capacitor cubre Android e iOS con el mismo wrapper → ver
  línea post-venta.
- **[feedback s103-cierre — i18n] Más idiomas que ES/EN** para la app
  final. NO implementar aún — preparar el paso cuando toque: la
  arquitectura ya lo soporta (ampliar `_bootstrap.js` + patch por dominio,
  decisión s81; con un 3er idioma, re-evaluar "ES y EN en mismo archivo").
  OJO: los `name` ES canónicos son keys de glifo/i18n custom (s93).
- **[feedback s103-cierre — Research] Competidores en Google Play + App
  Store.** Identificar competidores directos (pomodoro/focus, breathwork,
  estiramiento de oficina, hábitos), **leer sus reseñas** (quejas
  recurrentes + qué aman) y destilar insights para perfeccionar PACE.
  Sesión de research propia; encaja en pre-venta junto a Starter Story.
- **[feedback s103-cierre — Estrategia] Canal @StarterStoryBuild.**
  Revisar A FONDO youtube.com/@StarterStoryBuild (variante Build del canal
  ya registrado) para **creación y lanzamiento** de la app. Memoria
  `premium-strategy-sources` actualizada.
- **[feedback s103-cierre — Builder] "Tus rutinas" para Mueve Y Estira +
  MUCHO más visible.** Refuerza el ítem existente: hoy solo al final de
  MoveLibrary; debe existir también en Estira y con presencia real
  (¿home? ¿sidebar? — ver ítem Sidebar). El registro ya une MOVE+EXTRA.
- **[feedback s103-cierre — Contenido] Botón (i) de información por
  ejercicio.** Cada ejercicio con acceso a una explicación de CÓMO
  realizarlo (dudas de forma/técnica). Mapea a **s107-108** (taxonomía +
  cues explicativos + nomenclatura ES del feedback s101).
- **[feedback s103-cierre — UI general] Más atractiva y vistosa.**
  Transversal (principios del usuario); cada sesión de pulido lo aplica.
- **[feedback s103-cierre — Sidebar] Más bonita, organizada y útil.**
  Amplía el ítem existente. Pregunta abierta del usuario: ¿las rutinas
  personalizadas premium en la sidebar? Opinión registrada: como ACCESO
  RÁPIDO compacto puede funcionar (la sidebar es "estado del día", no
  biblioteca) — decidir en la sesión de diseño del home/sidebar (s106).
- **[feedback s103-cierre — Logros] Curva de desbloqueo + glifos.**
  (a) Al principio se desbloquean muchos sellos "sin casi hacer nada" →
  revisar el PACING de los logros tempranos (mapea a la sesión de diseño
  de gamificación suave: los primeros sellos deben saber a logro).
  (b) Los glifos de logros "no son nada bonitos ni pulidos" y algunos ni
  siquiera tienen la coherencia de constelaciones del set (ej. "Cuello
  atendido", "Escritorio express") → la revisión COMPLETA pre-venta cubre
  TAMBIÉN los 34+ glifos de logros, no solo los 46+ de ejercicio.
- **[feedback s103-cierre — Timer] Estilos Barra y Analógico
  sencillos/feos.** Frente al Aro (default), los otros dos estilos de
  Tweaks necesitan pulido o rediseño para estar a la altura.
- **[feedback s103-cierre — Ops] Actualizar la app con clientes reales
  sin romperla y sin que lo noten.** Base YA construida: SW waiting +
  UpdatePrompt (s102, re-verificado s103) + migraciones defensivas de
  pace.state. Falta protocolo de despliegue pre-lanzamiento: smoke tests
  pre-publicación, versionado de datos/migraciones, plan de rollback,
  ventana de deploy. Sesión propia ANTES de la pre-venta.
- **[feedback s103-cierre — Respira] Visual de respiración más bonito /
  gráfico / vistoso.** Sesión de diseño con propuestas para que el usuario
  ELIJA; ideas iniciales registradas: florecer orgánico con grano de tinta
  (coherente papel-tinta), ondas concéntricas tipo tinta en agua, pétalos
  que abren por fase con atmósfera del acento. Los 5 estilos actuales
  (Flor/Pulso/Pétalo/Ondas/Orgánico) como base a elevar. OJO: motion
  esencial `data-pace-essential` (s89) se conserva.
- ✓ **[HECHO s106] Bienvenida más vistosa, cercana, explicativa y
  atractiva** (feedback s103-cierre) → **onboarding full-screen v0.51.0**
  sobre las láminas de Caminos: manifiesto con calidez + 3 preguntas de
  perfil + primer Camino sugerido. El copy de las opciones queda iterable
  con feedback real (patrón s104: él aporta, se porta literal).
- **[feedback s103-cierre — BreakMenu] Glifos incoherentes con la home.**
  El menú post-pomodoro no usa los iconos de ActivityBar
  (ABBreathe/ABStretch/ABMove/ABDrop) y "pierde el diseño original".
  Fix pequeño y acotado, agrupable en la próxima sesión de pulido.
- **[feedback s103-cierre — BUG] Aro del pomodoro descolocado en
  Pausa/Larga.** En FOCO el aro respeta el diseño original; al cambiar a
  PAUSA o LARGA "se mueve del sitio" (capturas del usuario): la fila MIN
  de presets solo se renderiza en Foco → toda la columna sube y el aro
  cambia de posición entre pestañas. Fix acotado (reservar el alto de la
  fila o equivalente); candidato a la próxima sesión de pulido junto al
  BreakMenu. Relacionado (NO igual) con el ítem "semicírculo fijo" de s96.
- **[feedback s103-cierre — Estrategia] Video de monetización.**
  youtube.com/watch?v=Di973jC2Jio — "técnicas muy interesantes para
  monetizar la app". Revisar en la pasada de estrategia pre-venta junto a
  @starterstory + @StarterStoryBuild (memoria `premium-strategy-sources`).
- **[s104 — análisis estratégico externo, VERIFICADO] Programas 7/14/30
  días.** Empaquetar contenido EXISTENTE en planes con nombre y beneficio
  ("7-Day Desk Reset", "Focus & Calm Week") — curación, no módulos nuevos;
  capa premium natural sobre Caminos. Encaja en pre-venta.
- **[s104 — análisis] Navegación comercial "Cuerpo".** Evaluar en la
  sesión de diseño del home (s107): agrupar Mueve+Estira como "Cuerpo" en
  UI (el state ya lo hace desde s101) y ActivityBar → "Pausas". Decisión
  de IA/IU con propuestas, no de oídas.
- **[s104 — análisis] ASO/naming/pricing.** Material destilado para la
  pasada pre-venta: naming tipo "Pace: Focus & Wellness", subtítulo
  "healthy Pomodoro breaks", screenshots de beneficios (con las escenas
  ilustradas como identidad), pricing mensual/anual/lifetime early adopter,
  manifest EN para mercado global. Decidir junto a Starter Story.
- ~~**[s104 — BUG pre-existente] Frame fantasma de fase en PathRunner.**~~
  **RESUELTO s105 (v0.50.0)**: la fase 'intro' se fija en RENDER al cambiar el
  Camino (`if (curId !== seenPathId) { setSeenPathId; setPhase(...) }`, patrón
  oficial React "ajustar estado al cambiar una prop"), no en un efecto → React
  re-renderiza PathRunner antes de montar el step; sin mount fantasma ni
  warning. (Descubierto de paso: las cards de transición auto-avanzan por
  diseño, `TransitionCardBase` hold ~2.8s.)
- **[s104 — Ops] Automatizar bump de versión en build** (package.json
  como fuente → título + CACHE_NAME + PACE_VERSION; el desajuste de
  PACE_VERSION vivió 3 sesiones sin detectarse).

---

## 🌱 Medio plazo — tras el bloque

### CTB · Respiración en Trance Consciente (premium)
Sesiones largas (20-45 min): música ambiental sin voz, respiración
guiada prolongada, retenciones conscientes, timer silencioso con hitos
visuales. 4-6 sesiones en el lanzamiento Lifetime. Entregable mínimo
antes de código: guion de 1 sesión + pista musical + mockup inmersivo.
(F4/s90 dejó la precursora `breathe.rounds.long` 5×35 en el catálogo;
converge con el modo "Retiro".)

### Retos semanales (opcional)
Reto que aparece el lunes (ej: "3 sesiones de Respira"). Sin penalización.
Al completarlo, sello de colección. Sin presión.

### Notificaciones inteligentes (opt-in)
El state ya conserva `reminders: []`. Reintroducir UI como modal opt-in:
hidratación, pausa activa tras X horas, sugerencia contextual. Nunca por
defecto, sin spam.

### Feedback literario en Ritmos
Texto breve al cerrar semana/mes que contextualiza sin juzgar
("semana de foco profundo, menos movilidad — mañana suave"). Literario,
no numérico.

### Extensión Chrome
Popup 340×480 (resumen + acciones rápidas) + nueva pestaña (newtab
pantalla completa). Manifest V3, permisos mínimos (`storage`, `alarms`),
persistencia vía `chrome.storage`.

---

## 🌲 Largo plazo — v1.0+

### Lanzamiento pagado v1.0
Ver [`MONETIZATION.md`](./MONETIZATION.md). Lifetime ~20 € + Pase mensual
3,99 € + Temporadas ~5 € + donaciones BMC. Validación de **clave firmada
offline** (sin backend, sin cuentas). Pre-requisitos: bloque
Contenido+Premium cerrado, ≥2 CTB grabadas, constructor de rutinas
funcional, Términos + Privacidad redactados por abogado.

### App Android (v2.0)
Wrapping (Capacitor/Expo), layout móvil heredado del responsive, widget
de inicio (próximo break + vasos).

### Modo "Retiro"
Sesión larga combinando respiración + movilidad con música opcional.
Cercano a CTB — podrían converger en una sección "sesiones largas".

---

## 💭 Ideas sueltas (explorar / descartar)

- Reloj de escritorio (Electron ligero).
- Exportar `.ics` del plan del día (sin OAuth, alineado con "todo local").
- Plugin Notion / Obsidian ("espacio de respiración" entre bloques).

---

## 🚫 Fuera de alcance (nunca)

- Gamificación agresiva (rachas rojas, push abrumador).
- Emojis en la UI.
- Tracking / analytics sin opt-in explícito.
- Publicidad o monetización intrusiva.
- Suscripción mensual clásica con renovación automática (ver `MONETIZATION.md`).
- Consejos médicos sin disclaimer en técnicas de riesgo.
- Copia literal de listas de rutinas de terceros.
- Biometría / wearables (decisión s21 — no encaja con el tono artesanal).
- Muro de pago a mitad de una sesión (el candado vive en la puerta, nunca dentro).
- Modo oscuro OLED #000 — los negros de PACE son cálidos.
- IA generativa como feature visible.
- Backend de cuentas (infra de compra/licencias externa sí; cuentas no).
