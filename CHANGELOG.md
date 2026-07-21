# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

> **Nota — s117 (2026-07-21): sesión SOLO-DOCUMENTAL, sin versión nueva** (patrón
> s109). Se diseñó la capa de eventos local `pace.events.v1` en
> [`docs/product/EVENTOS_SCHEMA.md`](./docs/product/EVENTOS_SCHEMA.md) (rev. 1→5;
> **arquitectura por adaptadores**, P0 single-writer resuelto; **Android e iOS via
> Capacitor previstos**) — **DISEÑO aprobado, NO implementado** (cero código, cero
> bump, cero build/standalone). Se guardaron además dos propuestas pendientes de
> valorar: [`HOME_REDISENO_PROPUESTA.md`](./docs/product/HOME_REDISENO_PROPUESTA.md)
> (solapamiento editorial + jerarquía del home) e
> [`I18N_EXPANSION_PROPUESTA.md`](./docs/product/I18N_EXPANSION_PROPUESTA.md)
> (detección automática + expansión comercial). Diario:
> [session-117](./docs/sessions/session-117-b2-2b-3-eventos-diseno.md).

| Versión | Fecha | Título | Sesión | Detalle |
|---|---|---|---|---|
| **v0.60.0** | 2026-07-21 | feat: **B2.2b-2 — feedback ligero «¿te ayudó esta pausa?»** (captura + almacenamiento, SIN consumidor visible; 5 decisiones por AskUserQuestion, todas la recomendación) -- una sola pregunta CALMADA al alcanzar `stage:'done'` en Mueve/Estira (v1 y legacy) + Respira, **fuera de Caminos** (gate `inPath`) y nunca al pulsar «× Salir» · 3 respuestas de igual peso (**Sí · Un poco · No**) + **«Ahora no»** ghost secundario → la fila se sustituye por acuse «Gracias»; el CTA de regreso SIEMPRE disponible (no hace falta responder para salir) · **slice `routineFeedback`** bajo pace.state.v2 (`{[id]:{yes,some,no,lastPromptDay}}`, conteos COMPLETOS; `answered`/`helpScore` **DERIVADOS**, nunca persistidos; «Ahora no» no cuenta) con helper **PURO** `nextRoutineFeedback` + acción `recordRoutineFeedback` (setState funcional, sanitiza `yes\|some\|no\|later`, rechaza id vacío, merge defensivo en loadState) + `shouldPromptRoutineFeedback` · **frecuencia**: máx 1 vez por rutina y **DÍA LOCAL** (`lastPromptDay=todayISO()`; «Ahora no» también suprime el resto del día sin sumar; salir por el CTA sin responder NO escribe el día → puede reaparecer) · **guard de teclado P0** en los 3 runners: `Enter` en done ignora el atajo global de salida si el foco está en un control (`closest`, no `matches`), IME, `defaultPrevented` o modificadores Ctrl/Meta/Alt — evita una 2ª salida (el CTA/chip se activan por su onClick); Espacio tampoco se roba a un control con foco · componente NUEVO `SessionFeedback.jsx` (gate por-día capturado en el mount + guard SÍNCRONO de idempotencia + disabled) · `SessionDone` gana slot `feedback` · **CSS responsive del shell EXTRAÍDO** a `SessionShell.responsive.js` (495→336 ln) + en el tier ≤430 el HERO decorativo del done se oculta para que la fila de feedback y el CTA quepan sin solape · i18n `session.feedback.*` ES+EN · **legacy byte-idéntico** salvo el render del DONE + guard de teclado (motor/timers/completion/navegación intactos); contrato s115 intacto | #116 | [abajo](#v0600----2026-07-21----feat-b22b-2--feedback-ligero-te-ayudó-esta-pausa) |
| **v0.59.0** | 2026-07-21 | feat(move): **B2.2b-1 — contrato formal + duración derivada** (los 5 pilotos; el GIRO del runner guiado quedó CERRADO en s114, aquí NO se reabre; comportamiento del runner INTACTO) -- **contrato formal por paso** (migración ATÓMICA, sin fallback dual): `instruction:{setup,action,care}` (consolida placeCue/cue/careCue de s114, misma copy) · `tempo:{down,hold,up}` (generaliza el rep-seconds; suma = seg/rep) · `transition:{seconds}` (cambio de lado perSide) · `completion:{mode:'guided'}` ('manual' reservado) · `setup:{mode:'ready',estimatedSeconds}` = **comportamiento** del runner, DISTINTO de `instruction.setup` = copy (los dos «setup» que pedía el corte; ready nunca es countdown, estimatedSeconds>0) · **metadatos** `position/equipment/requiresFloor/intensity/level` (sin consumidor UI) · **keys i18n EN nuevas** `id.sN.instruction.*`; se RETIRAN placeCue/cue/careCue de los 5 pilotos (dato + keys), `cue` de las 22 legacy INTACTO · **fuente ÚNICA de segundos efectivos** + fix de deuda real: `v1StepWeight` (peso de barra) pasa a `v1StepDur` → **peso = progreso = aviso 5 s = duración** (antes divergía con preset 20/45) · **duración DERIVADA**: helper PURO `estimateDuration(routine, rbs)→{minSec,maxSec,breakdown}` (perSide = dur POR LADO ×2 + UNA transición, sin cuádruple conteo; reps guided = target×tempo fijo; + prep + setup) → la **tarjeta** muestra el rango en rutinas v1 (legacy conserva `min`, premium «Pronto»); **dev-check** `min` vs rango de minutos mostrados (avisa solo fuera; sin ruido dentro) · **limpieza** `move.repsGuidedHint` retirada · **legacy byte-idéntico** (prep 3, sin atributos v1) | #115 | [abajo](#v0590----2026-07-21----featmove-b22b-1--contrato-formal--duración-derivada) |
| **v0.58.0** | 2026-07-21 | feat(move): **runner guiado · capa editorial** (GIRO 2ª de 2 — **CIERRA el giro**; sobre el motor de s113; principio rector intacto) -- **instrucciones por CAPAS en los 5 pilotos**: `placeCue` (setup, se muestra en colocación) + `cue`=shortCue (ejecución) + `careCue` («Cuídate», adaptación **siempre visible** en trabajo; en altura baja se oculta el rótulo, nunca el contenido) — `cue` se conserva como fallback ⇒ **cero re-indexado** de las keys EN sN (solo keys NUEVAS `id.sN.placeCue`/`careCue`) · **colocación AUTO para el 1er set de fuerza** (step `reps` con `placeCue` no precedido por rest → ventana para leer el setup y ponerse en posición antes del pacer; sets 2/3 tras un rest van directos, sin doble espera; sigue 0 taps) · **lado integrado en el texto** (perSide: la palabra del lado abre el cue como `<strong>` del acento, no un kicker suelto) · **pantalla final por MÓDULO** (Mueve → «Movimiento completado» · Estira → «Estiramiento completado» — resuelve el P3 `antidoteDone` universal) con **stats honestas** que consumen `repsGuidedRef` (tiempo · series · **reps guiadas reales**, nunca el objetivo; mixtas → tiempo·pasos·reps; movilidad → tiempo·pasos; sin calorías/récords/comparaciones) · **Tweaks «Sesiones»**: descanso entre series **Breve 20 / Tranquilo 30 (recom., default) / Amplio 45** (`restBetweenSets`; helpers `v1RestSeconds`/`v1StepDur`) que SOLO afecta a `restKind:'betweenSets'` (el cierre respiratorio queda en 30) — el descanso GUÍA («Luego: {serie}» + aviso ~5 s) · **audio SIN voz** (familia move 432): `move.warn` (aviso único al cruzar ~5 s en descansos y pasos con reloj, no cuenta atrás) + `move.side` (cambio de lado); todo bajo `soundOn` + try/catch · CSS: tier ≤700 apretado por la línea «Cuídate» → **delta 0 mantenido** en 1280×600·1024×512·844×390·360×640 · legacy intacto (prep 3, sin atributos v1) | #114 | [session-114](./docs/sessions/session-114-runner-guiado-editorial.md) |
| **v0.57.0** | 2026-07-20 | feat(move): **runner guiado · motor** (GIRO post-s112, 1ª de 2: s113 motor · s114 capa editorial; aplica las ENMIENDAS R2/R3/BASE §3-A ya registradas; principio rector: «el usuario toca para empezar, pausar o adaptar; NO para empujar la rutina hacia delante» — la rutina se completa SIN tocar la pantalla salvo los gates `ready`) -- **reps GUIADAS con cadencia** (sustituyen al modo libre s111; ~4 s/rep de fuerza, `repSeconds` por paso — chin tucks 8 s; pulso visual `pace-rep-pulse` + tick suave por rep de la familia actual + contador «n de N reps»; **avance AUTO al objetivo**; «Terminar antes» siempre visible; pausa con Espacio/botón; `repsGuidedRef` acredita solo reps guiadas reales; reduced-motion → contador sin animación) · **transición AUTO de lado** (señal suave → «Cambia de lado» + cuenta 10 s estilo gate + **«Ahora: Derecha»** → el lado 2 empieza solo; «Empezar ya»/«Más tiempo»/«Pausar» opcionales) · **prep 5 s** (legacy sigue 3) · **rest entre series 30 s + `restKind:'betweenSets'`** en desk.pushups/chair.squats (el «Reset respiración» de chair.antidote NO se tipa: es cierre) · **layout compacto por ALTURA** (tiers 700/560/430 en shell + `data-pace-v1-*`; glifo cede antes que instrucciones y se oculta ≤430; tier de espacios en retrato estrecho; sin scrollbar en 1280×600 · 1024×512 · 844×390 · 360×640; scroll = red de seguridad) · `min` desk.pushups 2→3 · **fix**: side-effects fuera de los updaters de setState (warning «Cannot update while rendering», pre-existente s110) · split **`MoveSessionV1.support.jsx`** (constantes+helpers+CSS; patrón FocusTimer.support) · 4 keys i18n nuevas ES+EN, 4 retiradas | #113 | [session-113](./docs/sessions/session-113-runner-guiado-motor.md) |
| **v0.56.0** | 2026-07-18 | feat+fix(ux): **B2.2a.5 — auditoría UX del runner + corte de afinado** (B2.2b EN PAUSA; gobernada por `CONTEXTO_UX_RUNNER_WELCOME.md`, entregable de auditoría ANTES de código y corte aprobado por AskUserQuestion: setup `none\|auto\|ready` · dirección visual B · runner + micro-fix Welcome) -- **auditoría runtime** de los pilotos en 5 viewports con evidencia medida por DOM (3×P1: primaria recortada sin scroll en alturas <~630px; copy funcional del método oculto en móvil por el `display:none` del hint ≤640px; cambio de lado sin lado destino en móvil) · **`setup: 'ready' \| número`** por paso: `ready` (suelo/pared) = «Colócate» SIN cuenta + única primaria **«Estoy listo»** → directo a work (sin segunda cuenta), aplica en cualquier mode incluso paso 0; número = segundos del gate auto; sin setup → derivación s111 intacta · **jerarquía B**: kicker único (el «PASO X DE N» duplicado fuera; el kicker del cuerpo solo Colócate/lado/cambio), copy funcional VISIBLE en contenido (`repsHint`/`placeHint` + **«Empiezas por: {lado}»** / **«Ahora: Derecha»** en acento), gate con identidad propia (56px `--ink-2`, ya no parece el timer), glifo escalado por altura (~150-240px, prop `size` de StepGlyph; legacy 72/44 intacto), UNA primaria RELLENA del acento, h1 `clamp` · **SessionShell**: centro `overflowY:auto` + wrapper `center-body` con margin auto → **la acción primaria SIEMPRE accesible en poca altura** (beneficia a los 4 tipos de sesión + legacy) · **toasts aplazados en sesiones sueltas** (reutiliza `setCaminoUiActive`, guard `!inPath`) — 0 toasts sobre la ceremonia · **5º piloto `move.couch.stretch`** (estático pared/suelo: perSide+ready ×2, timed, perSide; cues sin «30s por lado», EN espejado, sin reindexar sN) + `setup:'ready'` en Flexor/WGS de `chair.antidote` · 3 keys i18n ES+EN (`session.imReady/sideFirst` + `move.placeReadyHint`) · **Welcome micro-fix**: la pregunta 1 cabe en 360×640 (~36px de espaciado) · Welcome auditada: CUMPLE el contrato (titular promesa, CTA único, saltable, sin permisos, cabe en móvil — medido) | #112 | [session-112](./docs/sessions/session-112-b2-2a5-afinado-ux-runner.md) |
| **v0.55.0** | 2026-07-17 | fix(move): **B2 — método del runner v1: gate que fluye + reps a gusto** (feedback de cierre s110; gobernado por `BASE_MUEVE_ESTIRA.md` §3/§6) -- **(a) gate de colocación auto + condicional**: el placement gate deja de exigir tap → **cuenta-atrás que fluye sola** («Colócate… 5·4·3·2·1» → arranca el reloj al llegar a 0) con **«Empezar ya»** (salta) y **«Más tiempo»** (+5 s); y se aplica SOLO a pasos **con reloj** (`timed`/`perSide`) e **idx > 0** — `reps`/`rest` fluyen directos (no hay reloj que proteger, R2) y el paso 0 hereda el prep 3·2·1 de la sesión (evita la doble cuenta). El condicional se deriva del `mode`, sin metadatos nuevos. R1 intacto (esa cuenta es de colocación, no el timer del ejercicio) · **(b) reps a gusto**: el número deja de leerse como cuota — label `reps` → **«reps · a tu ritmo»**; «Terminé» avanza en cualquier momento (más o menos, sin culpa); sin botón +/− · 4 keys i18n ES+EN (`session.beginNow/moreTime/placeCountdown` + `move.repsTarget`) + `placeHint` actualizado · runner **legacy** (sin `mode`) intacto · solo `MoveSessionV1.jsx` + strings (sin tocar datos ni `step.name`) | #111 | [session-111](./docs/sessions/session-111-b2-metodo-runner.md) |
| **v0.54.0** | 2026-07-17 | feat+refactor: **B2.2a — contrato de pasos v1 (pilotado) + visualId** (2ª sesión de B2, 1ª de código; gobernada por `BASE_MUEVE_ESTIRA.md`) -- **contrato de pasos v1** (`mode: timed \| reps \| perSide \| rest`; sin `mode` → runner **legacy** intacto) en nuevo `MoveSessionV1.jsx`; `MoveSession` pasa a dispatcher. Resuelve **R1-R5** de la auditoría B2.1 en 4 pilotos de cuerpo: **R1** placement gate por paso («Colócate»→«Empezar», el timer no arranca leyendo; absorbe el cambio de posición §6) · **R2** `reps` termina en «Terminé» (sin auto-avance) · **R3** `perSide` = Izquierda → gate «Cambia de lado» → Derecha con contador propio · **R4** la completion acredita **minutos REALES** (no `routine.min`; ambos runners) · **R5** `rest` tipado (apagado, «Saltar») · **visualId** (`exercise-aliases.js`): unifica 4 duplicados de glifo sin tocar `step.name`/localStorage (Chest opener→Apertura de pecho, Deep squat hold→Squat profundo, Deep breaths→Reset respiración, Dead hang→Hang pasivo) · pilotos: `desk.pushups`+`chair.squats` (reps+rest), `neck.3`+`chair.antidote` (perSide/postural), cubren biblioteca **y** Caminos · **split** `MOVE_ROUTINES`→`move.data.js` (MoveModule 451→331 ln) · **Nordics → «Puente isquio a una pierna»** en `move.atg.knees` (degustado en `path.weekend`) + glifo/EN en sincronía · leftover B1.2 «al máximo»→«sin forzar» (registro:117) | #110 | [session-110](./docs/sessions/session-110-b2-2a-contrato-pasos.md) |
| **v0.53.0** | 2026-07-16 | fix+feat: **B1.2 editorial de seguridad ES+EN** (CIERRA el bloque B1) -- lenguaje de riesgo fuera con copy realista y explicativo (BASE §7-9): «al fallo» / «al límite» / «más bajo si puedes» / «aguanta» secos / «al máximo» → reps limpias, respiración normal, mantener con condición técnica · claims fuera: «el hombro nace para colgar» (+ fuera «marco» de puerta), «indestructibles» (desc ATG + EN `Bulletproof` + logro), chin tuck sin «papada» (4 sitios) · tag `PULL`→`PUSH` en Fondos en silla · **Dead hang · opcional** con alternativa en cue (key de glifo renombrada en sincronía) · **12 descs anuncian suelo/pared/barra firme/silla estable sin ruedas** ES+EN · **curación Respira·Energía**: Bhastrika (PRA) al grupo Pranayama + `rounds.express` pasa a **FREE** (Energía tenía 0 entradas free) · **defaults opt-out**: `soundOn:true` + `notifyFocusEnd:true` (solo instalaciones nuevas; permiso de notificación pedido en el primer «Comenzar» de Foco vía `maybeRequestNotifyPermission`, denegar apaga el flag) | #108 | [session-108](./docs/sessions/session-108-b1-2-editorial-seguridad.md) |
| **v0.52.0** | 2026-07-16 | fix+feat: **B1.1 saneamiento** (plan de evolución, 1ª sesión de código) -- **`parseLocalDateKey()`** + fix round-trip UTC en `computePathStreaks` (rachas de Caminos rotas en husos negativos; regla #10 en CLAUDE.md: prohibido `new Date("YYYY-MM-DD")`) · **cifras honestas**: contador de logros `/100`→`/106` dinámico (Sidebar), «acciones» del año RETIRADA → **«{n} días con ritmo»** real (isActiveDay s69) + tooltip «intensidad {n}», sendero del día **abstracto** (secuencia equidistante, fuera las horas inventadas) · **acento de Estira por `kind`** en MoveSession (prep/glifo/contador/barra/done → `--extra`) · **BreatheVisual: transición = duración de la fase** (antes fija 1800 ms; fases <2 s → 85 % + ease-in-out) · **7 duraciones recalibradas** (declarado ≈ suma de pasos; Colgarse 4→2 … Ancestral 6→5) · **apnea retirada** (decisión 1): fuera logros 60/90/120 s + cifra-récord 160 px → hold como guía calmada; sustitutos de exploración **Dos lenguas / Cuaderno a salvo / Letra pequeña** (con detectores) · **claims de Respira orientativos** ES+EN (4·7·8, Nadi, Coherente 5·5, Rondas profundas, aside Balance) | #107 | [session-107](./docs/sessions/session-107-b1-saneamiento.md) |
| **v0.51.0** | 2026-07-16 | feat(onboarding): **onboarding de primera vez — 3 preguntas + primer Camino** (plan maestro s106) -- flujo FULL-SCREEN de 5 pantallas sobre las **láminas de Caminos** (bienvenida manifiesto + necesidad/tiempo/entorno → **`profile` en state** + "Tu primer Camino") · **sustituye al WelcomeModal** (s17, retirado; el manifiesto y la intención migran a las pantallas 0-1) · `pickFirstPath(profile)`: candidatos por necesidad + sesgo por tiempo + fallback `getSuggestedPath` — el cierre fija `paths.lastViewed` → la **home destaca el Camino elegido** (sugerir, NO auto-arrancar) · cada pregunta saltable (campo null) · regla "sobre el arte siempre es de día" ampliada (`--focus-cta` + `--achievement` al remap oscuro) · ES+EN (`strings/onboarding.js`) · a11y: dialog + radiogroup, sin cierre accidental | #106 | [session-106](./docs/sessions/session-106-onboarding.md) |
| **v0.50.0** | 2026-07-15 | feat: **fuentes self-hosted (cierra Etapa A) + todayISO local + integridad de Caminos** -- **`todayISO()` a fecha LOCAL** (bug UTC: rachas/history anotaban el día anterior entre medianoche y ~2 AM; 7 sitios, reutiliza `toISODate()`) · **fuentes self-hosted preservando Cormorant** (hallazgo: el default real de títulos es Cormorant, no EB Garamond → decisión s103 revisada): copia local subset-latin de **Cormorant + EB Garamond + Inter Tight** (12 caras, 520 KB) en `fonts/`, `@font-face` con ruta absoluta `/fonts/` (fuera el @import de Google), precache web + **data URIs standalone** (`inlineFonts`), MIME woff2; **JetBrains Mono retirada** (→ ui-monospace) → **cero peticiones externas de fuente** en los 3 artefactos · **BreakMenu coherente**: iconos `AB*` de la home + **Estira** (4 actividades, grid 2×2) · **frame fantasma de PathRunner** resuelto (fase 'intro' fijada en render, no en efecto → sin warning) · **toasts de logro aplazados** durante Caminos (no tapan las pantallas; se vuelcan al salir) · **bug de integridad**: un Camino solo cuenta como completado con **≥1 paso hecho** (antes saltarlo todo desbloqueaba "Cartógrafa") · aro del pomodoro alineado en Pausa/Larga | #105 | [session-105](./docs/sessions/session-105-fuentes-todayiso-caminos.md) |
| **v0.49.0** | 2026-07-14 | feat(paths): **escenas ilustradas de Caminos — arte D-4 completo** (entrega del usuario, iterado en vivo) -- las **7 láminas** editoriales como escena FULL-BLEED del runner (intro/transición/completion vía `PathIllustration`; sesiones activas intactas) · **casquetes**: las bolas pintadas van cubiertas en gris y se **RELLENAN con el color de su actividad** al completarse (pop + eco; el orbe s77 se retiró) · cámara cover que sigue al hito (pan 2s) y encuadra el **final del camino** en la Completion · etiqueta del paso **anclada a la bola** (placa de papel del arte) · **tagline del Camino en la intro** (beneficio visible) · placa translúcida tras RECORRIDO/DESBLOQUEADO · regla **"sobre el arte siempre es de día"** (re-mapeo de tinta/papel/acentos a paleta crema dentro de las superficies ilustradas en oscuro) · pipeline: **archivo+precache en web / data URI solo standalone** (2371 KB autocontenido; index.html 970 KB) · `scripts/ingest-lamina.js` (normaliza+mide, modo híbrido) · fix `PACE_VERSION` desincronizada (v0.46.0 desde s101) · fallback SenderoBar intacto para futuros caminos sin arte | #104 | [session-104](./docs/sessions/session-104-arte-caminos.md) |
| **v0.48.0** | 2026-07-13 | build: **Etapa A — precompilado Babel + React production** (plan maestro s103, 1ª de 2) -- los 74 scripts `text/babel` se **compilan en build** (`@babel/core` 7.29 en memoria, sourceType script + retainLines; IIFE por archivo + re-exposición AST de function/var top-level = semántica exacta del eval de Babel standalone) · **React 18.3.1 production UMD self-hosted** (vendor/ desde npm) e inlineado en ambos artefactos · **@babel/standalone fuera del output** → cero CDN de JS, cero compile en el navegador (antes ~4 MB de unpkg + 1-3 s por carga), standalone 100 % autocontenido en JS por primera vez · dev (PACE.html) intacto · pins deliberados Babel 7 / TypeScript 5 · fuentes self-hosted → s104 | #103 | [session-103](./docs/sessions/session-103-build-etapa-a.md) |
| **v0.47.0** | 2026-07-13 | feat(pwa): **PWA completa** (plan maestro s102) -- **manifest.webmanifest** completo (id, 4 **shortcuts** con deep links `/?go=`, launch_handler, colores alineados a `--paper #F2EDE0`) · **fix despliegue**: `index.html` se servía SIN `<link rel="manifest">` desde s48c (el build lo quitaba del standalone y copiaba literal) → la PWA no era instalable; el build re-inserta el link solo en la copia desplegada · **update prompt** (sw.js sin skipWaiting incondicional → worker en waiting + aviso discreto "Actualizar/Luego" via `UpdatePrompt.jsx`; navegaciones siguen network-first s89) · **notificación fin-pomodoro** opt-in (toggle en Ajustes, permiso al activar, solo pestaña oculta, silent; click enfoca la app) · enlaces **Seguridad · Privacidad** en Ajustes (solo web) · **Pomodoro persiste la recarga** (`pace.timer.v1` fuera de pace.state; reanuda solo si sigue vivo, expirado se descarta sin acreditar — cierra el fork s96) | #102 | [session-102](./docs/sessions/session-102-pwa-completa.md) |
| **v0.46.0** | 2026-07-10 | feat(stats): **stats a fondo** (P2 del usuario) -- auditoría completa del tracking (mapa escritores→lectores, 8 hallazgos) + **stats vivos**: nuevo `state-history.jsx` con `getHistoryWithToday` memoizado (reutiliza `archiveDayToHistory`) → **Mes/Año/totales incluyen el día actual** (antes ciegos hasta el rollover); state-core 511→407 ln (sale de deuda) · **WeekDots del sidebar con criterio s69** (focus\|breath\|move>0; antes solo foco) · fila "Mueve" → **"Cuerpo"** (moveMinutes = Mueve+Estira, la etiqueta mentía) · **racha de Caminos viva** (cuenta desde ayer si hoy no hay) · fix DST en hydrate.week.perfect · WeeklyStats.jsx muerto borrado · páginas estáticas **/safety + /privacy** (autocontenidas, ES+EN, rama oscura) | #101 | [session-101](./docs/sessions/session-101-stats-a-fondo.md) |
| **v0.45.0** | 2026-07-10 | feat(paths): **remate premium de Caminos** (los 3 pendientes de feedback de s99) -- **OutroCard eliminada** (duplicaba la CompletionScreen; el último paso pasa DIRECTO a "Camino completado", PathRunner pierde la fase `outro` y `pendingComplete`, decisión s77 actualizada) · **CompletionScreen "ceremonia editorial"** (fuera el check genérico; kicker + nombre del Camino protagonista + meta "IV pasos · 24 min" con hairline + **sendero héroe con draw-in** (prop `drawIn` de SenderoBar: el trazo se dibuja y los hitos entran escalonados) + recorrido sin caja + logros como sellos) · **banding de atmósfera suavizado** (hint de interpolación 22% + capa de grano SVG ~4% como dither; arregla steps, transiciones y completado a la vez) | #100 | [session-100](./docs/sessions/session-100-remate-caminos.md) |
| **v0.44.0** | 2026-07-09 | feat(ui+paths): **pulido global + overhaul premium de Caminos** -- pack de microinteracciones (glow del aro Pomodoro cuando corre, hover TopBar/CTA, entrada de modulos, modales scale+fade, scrollbar Firefox) · **Caminos**: fix "Volver al inicio" -> **"Siguiente"** en Respira/Mueve/Foco (SessionDone recibe `inPath`) · **PathFocusStep/PathHydrateStep** adoptan el SessionShell compartido (coherencia total con Respira/Mueve) · **timer "aro de marcas de minuto"** + numero protagonista · **botones del Foco por color** (verde/naranja/gris, revisa s79) · **atmosfera por paso** (wash tenue del acento del modulo, solo en Caminos) · cards de transicion editoriales (kicker romano) + sendero con hito actual acentuado · CompletionScreen rediseñada · bola del timer home -50% | #99 | [session-99](./docs/sessions/session-99-pulido-caminos-premium.md) |
| **v0.43.0** | 2026-07-09 | fix(breathe): **tiempo activo en Respira** -- `BreatheSession` mide un `activeTime` timestamp-based (excluye pausas manuales; inmune al estrangulamiento de timers en background) que sustituye al wall-clock/nominal en 3 sitios: **fin de sesion no-rounds** (`getActiveSec() >= routine.min*60`, las pausas ya no acercan el final), **barra de progreso no-rounds** (mismo reloj) y **credito a stats/logros** (`completeBreathSession` recibe minutos activos reales, no `routine.min` -> arregla el sobre-credito al pulsar "Terminar" pronto; firma intacta, cero cambios en state) · pantalla "done" muestra tiempo activo · retira estado muerto `cycle`/`startTime`/`doneInCycle` | #98 | [session-98](./docs/sessions/session-98-tiempo-activo-breathe.md) |
| **v0.42.0** | 2026-07-08 | fix(ui): pulido **modo oscuro legible** (recalibracion en bloque `--ink-3 #756D5D→#B2A995` que gobierna toda la letra fina + `--line`/`--line-2` para aro y bordes; logo invertido intacto por peticion del usuario) · **aro del timer empieza siempre vacio** (useCountdown: idle deriva `remaining` de `durationSec`, ya no reflejaba relleno proporcional al cambiar preset) · **progreso de Respira = barra segmentada por bloques** (un segmento por ciclo/ronda, el activo se rellena por dentro; sustituye las bolas, que se disparaban a ~50-100 en rutinas largas) + retira "Ns/Ns" redundante · fix solape precontador "3" (SessionPrep) y countdown de Mueve centrado | #97 | [session-97](./docs/sessions/session-97-pulido-oscuro-progreso.md) |
| **v0.41.0** | 2026-07-08 | refactor(focus): Cirugia 2 -- **motor de timer basado en timestamps** (`app/focus/useCountdown.jsx`, estados idle/running/paused/completed; `remaining = f(Date.now())` en cada tick -> **cero deriva en background**, la pestana oculta ya no subcuenta) migrado a FocusTimer (home) y PathFocusStep (Camino) · `completeFocusSession(context)` unificado que **PRESERVA la distincion** (home = completePomodoro con cycle+logros de pomodoro; Camino = addFocusMinutes+updateStreak sin cycle) · `'completed'` terminal (cierra un doble-credito latente) · **comportamiento observable identico en primer plano** (creditos, sonidos, logros, drone, single-shot) | #96 | [session-96](./docs/sessions/session-96-timer-engine.md) |
| **v0.40.0** | 2026-07-08 | feat(entitlement): Cirugia 1 -- **guard central `canAccessRoutine`/`canAccessPath`** (UNICO punto de verdad del acceso, hoy derivado de `premiumUnlocked`; el sitio que cambiara con la licencia) consumido por RoutineCard + PathBreatheStep/PathBodyStep + getSuggestedPath · **degustacion EXPLICITA** de path.weekend (`tasting:true` a nivel step, deja de ser excepcion tacita) · autofocus Welcome solo con puntero fino (sin auto-teclado en movil) · **comportamiento observable identico con premiumUnlocked=false** | #95 | [session-95](./docs/sessions/session-95-guard-entitlement.md) |
| **v0.39.0** | 2026-07-08 | feat(paths): F8 -- polish visual de los 6 componentes de Caminos contra DESIGN_SYSTEM (**CIERRA el bloque Contenido+Premium**) · fix huerfanas `--olive`/`--terracota` -> tokens reales (barra de acento invisible + boton salir ilegible) · clipPath unico por instancia en Sidebar · titulos de Caminos tokenizados a var(--font-display) (siguen los tweaks data-font) · purga CSS muerto .path-dots | #94 | [session-94](./docs/sessions/session-94-f8-visual-caminos.md) |
| **v0.38.0** | 2026-07-08 | feat(custom): F7 -- registro interno de ejercicios (65 items / 8 grupos, curado a mano) + constructor de rutinas premium (crear/editar/borrar/lanzar con el runner de MoveSession) · seccion "Tus rutinas" al final de la biblioteca Mueve, superficie premium entera · `customRoutines` en state (CRUD en state-custom.jsx) · crédito via completeMoveSession sin logros nuevos | #93 | [session-93](./docs/sessions/session-93-f7-constructor-rutinas.md) |
| **v0.37.0** | 2026-07-07 | feat(move): F6 -- catalogo Mueve 7 -> 14 rutinas (7 nuevas Strengthside/Jess Martin-inspired: sentadillas de silla, gluteos invisibles, espalda de oficina, empuje·progresion, colgarse, piernas·a una, core·plancha) · MOVE_ROUTINES agrupado en 4 grupos free-first (prefijo mueve.cat.*) · strings-content.js troceado en app/i18n/content/ (breathe/move/extra) · 9 pasos nuevos con DefaultGlyph (cola D-4 -> 35) | #92 | [session-92](./docs/sessions/session-92-f6-contenido-mueve.md) |
| **v0.36.0** | 2026-07-07 | feat(extra): F5 -- catalogo Estira 7 -> 14 rutinas (7 nuevas Strengthside-inspired: despertar matinal, muñecas y manos, hombros·circulos, couch stretch, columna·ondas, caderas·suelo, cadena posterior) · biblioteca agrupada en 4 grupos como Respira · 11 pasos nuevos con DefaultGlyph (cola D-4) · ~109 keys EN | #91 | [session-91](./docs/sessions/session-91-f5-contenido-estira.md) |
| **v0.35.0** | 2026-07-07 | feat(breathe): F4 -- catalogo Respira 12 -> 20 tecnicas (8 nuevas: diafragmatica, exhalacion 4·6, ritmica yin, coherente 432 con drone forzado, bhramari, kumbhaka 1:4:2, tolerancia CO2, rondas profundas 5×35 precursora CTB) · 4 patrones nuevos en getSequence · 3 fases nuevas i18n · ambientDrone.start(force) · free-first en grupos · safety en toda retencion/apnea | #90 | [session-90](./docs/sessions/session-90-f4-contenido-respira.md) |
| **v0.34.5** | 2026-07-07 | fix+feat(P0 auditoria): SW limpia caches viejos + network-first navegaciones · reduced-motion con excepcion motion esencial (BreathVisual) · paleta oscura auto en primer arranque · objetivo de agua configurable en Tweaks (4-12) · split TweaksPanel 519->351 ln (TweaksData + PremiumSection) · D-8 resuelto como degustacion curada | #89 | [session-89](./docs/sessions/session-89-p0-auditoria-fixes.md) |
| **v0.34.4** | 2026-07-07 | feat(premium): F3b -- activacion del gating sobre las rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` en defaultState (cableado, sin compra real) + superficie premium display-only en Tweaks | #88 | [session-88](./docs/sessions/session-88-f3b-activacion-gating.md) |
| **v0.34.3** | 2026-06-30 | feat(premium): F3a -- mecanismo de gating a nivel sesion (campo `access` + componente `PremiumSeal` + sello/Pronto en `RoutineCard` + token `--premium`); dormante (todas las rutinas siguen free) | #87 | [session-87](./docs/sessions/session-87-f3a-gating-mecanismo.md) |
| **v0.34.2** | 2026-06-05 | fix(tracking): F-1 PathFocusStep llama updateStreak (el foco-en-Camino cuenta para la racha, como la home) + docs auditoria F2 de tracking (informe + casos de prueba) | #86 | [session-86](./docs/sessions/session-86-f2-tracking-audit.md) |
| **v0.34.1** | 2026-06-05 | fix(support)+docs: copy Buy Me a Coffee honesto (nucleo libre, fuera "sin pro") + recrear CONTENT.md y ROADMAP.md (borrados en be81606) -- arranque bloque Contenido+Premium F1 | #85 | [session-85](./docs/sessions/session-85-f1-bmc-docs.md) |
| **v0.34.0** | 2026-05-24 | feat(glyphs): cierre iter glifos canonicos Mueve/Estira -- 31/46 aprobados portados literal desde HTML exploracion del usuario (new/alt/v5/v6/v7/v8/v9/v12) + 15 mantenidos del s60 hasta nueva aprobacion | #84 | [session-84](./docs/sessions/session-84-glifos-cierre-iter.md) |
| **v0.33.3** | 2026-05-23 | refactor(achievements): split `app/achievements/Achievements.jsx` (409 ln) en `achievements/` + `glyphs/` (catalog.js + achievement-glyphs.jsx) -- variante B -- 409 ln -> 184 ln (-55%); convencion `app/glyphs/` consolidada con 2 hermanos | #83 | [session-83](./docs/sessions/session-83-achievements-split.md) |
| **v0.33.2** | 2026-05-23 | refactor(main): split `app/main.jsx` (600 ln) en `app/main/` (_responsive + TopBar + ActivityBar) -- variante B (equilibrada) -- 600 ln -> 279 ln (-53%) | #82 | [session-82](./docs/sessions/session-82-main-split.md) |
| **v0.33.1** | 2026-05-19 | refactor(i18n): split `app/i18n/strings.js` (791 ln) en `app/i18n/strings/` (_bootstrap + ui + sessions + paths + stats + achievements) -- variante B (pragmatica) | #81 | [session-81](./docs/sessions/session-81-strings-split.md) |
| **v0.33.0** | 2026-05-18 | refactor(paths): split PathRunner.jsx en steps/ (Breathe/Focus/Hydrate/Body) -- 835 ln -> 244 ln (-71%) + contrato uniforme `(step, onExit(reason))` + `_shared.js` btnTypography/btnOutline | #80 | [session-80](./docs/sessions/session-80-split-pathrunner.md) |
| **v0.32.1** | 2026-05-18 | fix(ui): pomodoro contextual en Camino (aro + pausa/reset/saltar) + fade-out toasts + oscuro +10% | #79 | [session-79](./docs/sessions/session-79-pomodoro-camino-fadeout-oscuro.md) |
| **v0.32.0** | 2026-05-17 | feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica (lastViewed > horario > anytime > catalog[0]) + logro master.path.all7 | #78 | [abajo](#v0320----2026-05-17----featcamino-catalogo-5--7) |
| **v0.31.0** | 2026-05-17 | feat(camino): PathTransitions + fix SenderoBar visible + retirada de sticky + microcopia (Toast 3s, CTA verde musgo) | #77 + #77b | [session-77](./docs/sessions/session-77-path-transitions.md) + [s77b](./docs/sessions/session-77b-fix-microcopia.md) |
| **v0.30.0** | 2026-05-16 | feat(camino): arquitectura overlay -- TimerDial compartido + SenderoBar sticky persistente + CompletionScreen rica | #76 | [session-76](./docs/sessions/session-76-overlay-arquitectura.md) |
| **v0.29.0** | 2026-05-16 | feat(camino): sendero hibrido + renombrado sensorial + fix dawn/dusk + foco interno suma a stats | #75 | [session-75](./docs/sessions/session-75-sendero-implementacion.md) |
| **v0.28.12** | 2026-05-12 | style(ui): recalibrar oscuro a negro calido sutil con escalonamiento reducido | #74 | [session-74](./docs/sessions/session-74-oscuro-recalibrado.md) |
| **v0.28.11** | 2026-05-12 | style(ui): subir luminosidad y escalonar fondos modo oscuro | #73 | [abajo](#v02811----2026-05-12----styleui-subir-luminosidad-y-escalonar-fondos-modo-oscuro) |
| **v0.28.10** | 2026-05-12 | style(ui): marron oscuro calido + aro suavizado en modo oscuro | #72 | [abajo](#v02810----2026-05-12----styleui-marron-oscuro-calido--aro-suavizado) |
| **v0.28.9** | 2026-05-12 | feat(ux): aro dinamico + retira envejecido + logo modo oscuro + reorden tweaks | #71 | [session-71](./docs/sessions/session-71-aro-dinamico-limpieza-tweaks.md) |
| **v0.28.8** | 2026-05-12 | fix(tracking): C1+C2+C3+A1+A2 weeklyStats reset semanal + history idempotente + streak proactivo + dia activo unificado | #69 | [session-69](./docs/sessions/session-69-fix-tracking-idempotente.md) |
| **v0.28.7** | 2026-05-11 | fix(breathe): inhalacion suena en arranque y reinicio de ciclo | #67 | [session-67](./docs/sessions/session-67-fix-breathe-play-inhale.md) |
| **v0.28.6** | 2026-05-12 | fix(ui): logo completo + tagline sidebar movil + cache-bust iconos maskable safe zone | #66 | [session-66](./docs/sessions/session-66-fix-logo-tagline-movil.md) |
| **v0.28.5** | 2026-05-11 | fix(deploy): index.html root + manifest PWA + iconos PNG vaca pastando (Cloudflare Pages) | #65 | [session-65](./docs/sessions/session-65-fix-cloudflare-pwa.md) |
| **v0.28.5** | 2026-05-12 | fix(ui): logo movil cortado + hueco sidebar movil + scroll vertical heatmaps anuales + nota Semana restaurada (desktop only) | #64 | [session-64](./docs/sessions/session-64-fixes-ui-menores.md) |
| **v0.28.4** | 2026-05-12 | feat(ui): scroll residual Stats desktop eliminado (WeekView sin nota, Mes 56->48px, Año futuros solo borde, Caminos margenes) + sidebar movil compacta (logo 48px, dividers, streak 44->32) + Stats movil Semana 2x2/Caminos 3col | #63 | [session-63](./docs/sessions/session-63-fix-desktop-movil.md) |
| **v0.28.3** | 2026-05-11 | chore(ui): WeekView + PathStats compactacion segunda pasada -- barras 44->36, PathStat cards 10/14->8/12, gap 14->10 -- todas las pestanas Stats sin scroll en 1080p + heatmap ano completo (7 etiquetas dia + futuros visibles) | #61/62 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.2** | 2026-05-11 | chore(ui): sidebar mas limpio (eliminados 3 contadores hoy) + Ritmo web sin scroll en Semana/Mes/Ano/Caminos + camino sugerido compacto en movil + Sidebar.jsx 630->497 ln (sale de deuda) | #61 | [session-61](./docs/sessions/session-61-cleanup-sidebar-ritmo.md) |
| **v0.28.1** | 2026-05-11 | refactor(glyphs): iteracion parcial 13/46 glifos hacia lenguaje home (objeto/forma/parte aislada/metafora) -- 4 patrones canonicos definidos, pendiente propagar a 33 restantes | #60 | [session-60](./docs/sessions/session-60-glyphs-iter-incompleto.md) |
| **v0.28.0** | 2026-05-11 | feat(glyphs): 46 glifos canonicos por paso individual Mueve/Estira -- pantalla activa de sesion deja de mostrar placeholder y muestra simbolo abstracto unico por ejercicio | #59 | [abajo](#v0280----2026-05-11----featglyphs-46-glifos-canonicos-por-paso) |
| **v0.27.6** | 2026-05-11 | chore(workflow): blindaje Git -- WORKFLOW.md, check-session.ps1, README actualizado a version real, bump version | #58 | [abajo](#v0276----2026-05-11----choreworkflow-blindaje-git) |
| **v0.27.5** | 2026-05-11 | refactor(state): state.jsx dividido en 6 modulos por dominio (core/timer/hydrate/achievements/paths/settings) sin cambios de comportamiento | #57 | [session-57](./docs/sessions/session-57-refactor-state.md) |
| **v0.27.3** | 2026-05-09 | chore(build): blindaje build con parser sintactico real -- TS parser reemplaza 4 checks heuristicos, aborta con linea/columna exacta | #56 | [abajo](#v0273----2026-05-09----chorebuild-blindaje-build-con-parser-real) |
| **v0.27.2** | 2026-05-09 | chore(polish): i18n sync ES/EN, a11y overlays (role/Escape/focus), mobile audit, smoke tests documentados | #55 | [abajo](#v0272----2026-05-09----chorpolish-i18n-sync-a11y-overlays-mobile-smoke-tests) |
| **v0.27.1b** | 2026-05-09 | fix(i18n): restaurar claves paths.path.*.name/tagline EN truncadas en s54 + refuerzo build check-d/e | #54b | (hotfix, sin seccion detalle) |
| **v0.27.1** | 2026-05-09 | feat(stats): seccion Caminos en Stats -- total, rachas current/best, tabla por camino, heatmap anual + paths.history persistido | #54 | [abajo](#v0271--2026-05-09) |
| **v0.27.0** | 2026-05-08 | feat(paths): Caminos parte 2 -- PathsLibrary overlay, sistema favorito, boton Repetir, sugerencia dual favorito+hora | #53 | [abajo](#v0270--2026-05-08) |
| **v0.26.1** | 2026-05-08 | chore: saneamiento tecnico - encoding STATE.md, validateFileEnd en build, 0 WARN, audit deuda 5 archivos >500 lineas | #52 | [abajo](#v0261--2026-05-08--chore-saneamiento-tecnico) |
| **v0.26.0** | 2026-05-08 | feat(paths): SuggestedPathCard -- tarjeta home que sugiere el camino del momento, 4 icons de paso, doneToday badge, 10 claves i18n -- cierra sistema Caminos | #51 | [abajo ↓](#v0260--2026-05-08--featpaths-suggestedpathcard) |
| **v0.26.0-beta** | 2026-05-08 | feat(paths): PathRunner UI — overlay full-screen, 4 kinds, modal in-app de salida, pantalla de completado, reanudacion tras recarga | #50 | [abajo ↓](#v0260-beta--2026-05-08--featpaths-pathrunner-ui) |
| **v0.26.0-alpha** | 2026-05-08 | feat(paths): Caminos parte 1 — capa de datos (5 caminos canónicos, helpers lookup, funciones state, migración defensiva) | #49 | [abajo ↓](#v0260-alpha--2026-05-08--featpaths-caminos-parte-1--capa-de-datos) |
| **v0.25.4** | 2026-05-08 | fix(achievements): hotfix Achievements.jsx truncado en s48d — restaurado desde origin/main + correcciones 48d re-aplicadas + validador de strings en build-standalone.js | #48d.1 | [session-48d1](./docs/sessions/session-48d1-hotfix-achievements-truncado.md) |
| **v0.25.3** | 2026-05-08 | fix(achievements): auditoría glifos Dirección D — 18 sustituidos por canónicos + 13 nuevos portados desde glyphs-explorations.html | #48d | [session-48d](./docs/sessions/session-48d-auditoria-glifos.md) |
| **v0.25.2** | 2026-05-07 | fix(standalone): repara crash post-s48b — 10 .jsx tenían `<script type="text/babel">` literal al inicio (provocaba doble script en el bundle y SyntaxError de Babel) + PACE.html truncado sin mount loop ni `</body></html>` + manifest.json eliminado del standalone (causaba CORS en file://) | #48c | [abajo ↓](#v0252--2026-05-07--fixstandalone-repara-crash-post-s48b) |
| **v0.25.1** | 2026-05-07 | fix(achievements): 20 glifos Dirección D portados literal de design/glyphs-explorations.html (viewBox 44×44, currentColor) — corrige inventados a ojo de s46; restauración masiva de 12 archivos truncados | #48b | [abajo ↓](#v0251--2026-05-07--fixachievements-glifos-canónicos-dirección-d) |
| **v0.25.0** | 2026-05-06 | feat: stats achievements (4 logros nuevos) + mobile UX fixes (sidebar+tabs) + 10 glifos SVG constelaciones + renderGlyph en Seal y Toast | #46 | [session-46](./docs/sessions/session-46-stats-ux-glifos.md) |
| **v0.24.0** | 2026-05-06 | fix(standalone): regenerar build roto de s44 (truncamiento transitorio — sin cambios en código fuente) | #45 | [session-45](./docs/sessions/session-45-fix-standalone-build.md) |
| **v0.24.0** | 2026-05-06 | feat(stats): YearView — heatmap anual 53×7, score compuesto, 5 niveles tierra→oliva, navegación entre años, click celda→zoom mes, responsive scroll-snap | #44 | [session-44](./docs/sessions/session-44-yearview.md) |
| **v0.23.0** | 2026-05-06 | feat(history): capa de datos history (days/months/years) + migration guard + MonthHeatmap con tabs Semana\|Mes\|Año + tooltip responsive | #43 | [abajo ↓](#v0230--2026-05-06--feathistory-capa-de-datos--heatmap-mensual) |
| **v0.22.1** | 2026-05-06 | fix(ux): hints teclado ocultos en móvil + title attrs eliminados en MoveSession + cronómetro reescalado (128→72px) + shortcut BreakMenu oculto | #42 | [abajo ↓](#v0221--2026-05-06--fixux-corrección-ux-móvil) |
| **v0.22.0** | 2026-05-06 | feat: split TweakSecretsWatcher + i18n ambient toggle + 5 detectores logros (hydrate.week.perfect + master.box/coherent/rounds.10 + master.atg.20) | #41 | [session-41](./docs/sessions/session-41-drone-toggle-logros.md) |
| **v0.21.0** | 2026-05-06 | feat(audio): sonidos move.start/step/end + hydrate.sip/goal + achievement.unlock/secret — capa 1 completa | #40 | [abajo ↓](#v0210--2026-05-06--feataudio-sonidos-movhydrateachievements) |
| **v0.20.0** | 2026-05-06 | fix: crash ToastHost variable shadowing (t/useT) + mount loop 6-check + guard breathNoise | #38b patch | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.20.0** | 2026-05-05 | feat(audio): refactor 432 Hz + primitivas componibles + respiración realista con ruido blanco filtrado + pomodoro.start/end | #38a | [abajo ↓](#v0200--2026-05-05--feataudio-refactor-432-hz) |
| **v0.19.1** | 2026-05-05 | fix(i18n): crash al cargar — useT() faltante en AchievementsPreview + auditoría defensiva de 8 componentes | #37 hotfix | [session-37](./docs/sessions/session-37-i18n-pwa-ajustes.md) |
| **v0.19.0** | 2026-05-05 | Cierre i18n total (fases respiración + 8 strings restantes) + PWA activada (manifest+SW) + panel Ajustes limpiado (audio primero, timer 3 ops, layout 2 ops) + hard reset localStorage v2 | #37 | [abajo ↓](#v0190--2026-05-05--cierre-i18n--pwa--ajustes) |
| **v0.18.0** | 2026-05-05 | i18n de contenido (ejercicios Respira/Mueve/Estira) + FocusTimer i18n completo + toggle ES·EN en WelcomeModal + dot verde del aro eliminado | #36 | [abajo ↓](#v0180--2026-05-05--i18n-contenido--focustimer--dot-eliminado) |
| **v0.17.0** | 2026-05-05 | i18n ES/EN completo: auditoría + 3 bugs críticos corregidos + migración de 6 módulos (BreatheLibrary, MoveModule, ExtraModule, HydrateModule, WeeklyStats, Achievements) | #35 | [session-35](./docs/sessions/session-35-i18n-completo.md) |
| **v0.16.0** | 2026-05-05 | Split BreatheModule (3 archivos: BreatheVisual + BreatheLibrary + BreatheSession) + 4 detectores nuevos (master.collector.half/full, master.silent.day, master.retreat) | #34 | [session-34](./docs/sessions/session-34-split-breathe-logros.md) |
| **v0.15.0** | 2026-05-04 | Loop post-Pomodoro: BreakMenu con rotación inteligente (computeScore + sort + "Para ti" + done indicator) | #33 | [session-33](./docs/sessions/session-33-loop-post-pomodoro.md) |
| **v0.14.3** | 2026-05-04 | Code review: 7 fixes de calidad (dead state, condición redundante, aria-live, sip sound, logros recientes) | #32 | [session-32](./docs/sessions/session-32-code-review-fixes.md) |
| **v0.14.2** | 2026-04-30 | Fix de comillas en DESIGN_SYSTEM.md (revisión externa commit cd75d27) | #31 | [session-31](./docs/sessions/session-31-fix-comillas-design-system.md) |
| **v0.14.1** | 2026-04-30 | DESIGN_SYSTEM.md creado + limpieza de duplicación: tokens, paletas, tipografía, espaciado, breakpoints y utilidades centralizados | #30 | [session-30](./docs/sessions/session-30-design-system.md) |
| **v0.14.0** | 2026-04-29 | Fruta fácil II: 6 logros nuevos cazables (`breathe.sessions.10/50`, `move.sessions.25`, `morning.5`, `master.long.focus`, `master.dawn`, `master.dusk`) + canvas exploratorio de glifos en 4 direcciones visuales | #29 | [session-29](./docs/sessions/session-29-logros-aplazados-glifos.md) |
| **v0.13.0** | 2026-04-29 | Fruta fácil: 8 logros nuevos cazables (5 primeros pasos + 3 rachas largas) + módulo `Sound.jsx` con Web Audio sintetizado (4 tonos) cableado a fin de Pomodoro, vaso de agua y cambio de fase de respiración | #28 | [session-28-fruta-facil-logros-sonidos.md](./docs/sessions/session-28-fruta-facil-logros-sonidos.md) |
| **v0.12.10** | 2026-04-23 | Modales responsive en móvil: patrón `<style>` + `data-pace-*` + `!important` aplicado a Primitives.Modal (10 modales de golpe), SessionShell (prep/done) y TweaksPanel (bottom-sheet) | #27 | [session-27-modales-mobile.md](./docs/sessions/session-27-modales-mobile.md) |
| **v0.12.9** | 2026-04-23 | Licencia: `LICENSE` (Elastic License 2.0) + cabeceras de copyright en fuentes principales + sección "Licencia" en README + 4ª vía de monetización (Pase mensual) | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| v0.12.8 | 2026-04-23 | Refactor Fase 2: extracción de `SessionShell`, limpieza de Support, saneo de exports a `window`, helper `displayItalic` | #26 | [session-26-refactor-fase2.md](./docs/sessions/session-26-refactor-fase2.md) |
| **v0.12.7** | 2026-04-23 | Auditoría interna previa al refactor · sin cambios de código · informe en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md) | #25 | [abajo ↓](#v0127--2026-04-23--auditoria-interna) |
| v0.12.7 | 2026-04-23 | Scroll asimétrico: home con `100dvh` puro (4 botones siempre) + sidebar con `min-height: calc(100dvh + 1px)` que recupera el auto-hide de la barra del navegador | #24 | [session-24-scroll-asimetrico.md](./docs/sessions/session-24-scroll-asimetrico.md) |
| v0.12.6 | 2026-04-23 | DVH fit: `100dvh` con fallback a `100vh` para que el móvil encaje con o sin barra de URL | #23 | [session-23-dvh-fit.md](./docs/sessions/session-23-dvh-fit.md) |
| v0.12.5 | 2026-04-23 | Responsive móvil: sidebar desacoplada fullscreen + home que cabe en 375×812 sin scroll | #22 | [session-22-responsive-movil.md](./docs/sessions/session-22-responsive-movil.md) |
| v0.12.4 | 2026-04-23 | Briefing de dirección: gating 2+2+2, modelo Lifetime, CTB, Ritmos, responsive móvil | #21 | [session-21-briefing-direccion.md](./docs/sessions/session-21-briefing-direccion.md) |
| v0.12.3 | 2026-04-22 | Timer: número gigante con más aire sobre el subtítulo + pill "Otro" para minutos personalizados | #20 | [session-20-timer-aire-otro.md](./docs/sessions/session-20-timer-aire-otro.md) |
| v0.12.2 | 2026-04-22 | Pill de apoyo consolidada + Tweaks de logo/copy retirados + standalone autocontenido | #19 | [session-19-pill-consolidada-standalone.md](./docs/sessions/session-19-pill-consolidada-standalone.md) |
| v0.12.1 | 2026-04-22 | Pulido: bugs de race condition, sidebar más limpio, Welcome compacto | #18 | [session-18-pulido-bugs-layout.md](./docs/sessions/session-18-pulido-bugs-layout.md) |
| v0.12.0 | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | [session-17-welcome-export.md](./docs/sessions/session-17-welcome-export.md) |
| v0.11.11 | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | [session-16-bmc-integracion.md](./docs/sessions/session-16-bmc-integracion.md) |
| v0.11.10 | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | [session-15-logros-proximamente.md](./docs/sessions/session-15-logros-proximamente.md) |
| v0.11.9 | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [session-14-swap-mueve-estira.md](./docs/sessions/session-14-swap-mueve-estira.md) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [session-13-backlog-robustez.md](./docs/sessions/session-13-backlog-robustez.md) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [session-12-barra-horizontal.md](./docs/sessions/session-12-barra-horizontal.md) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [session-11-limpieza.md](./docs/sessions/session-11-limpieza.md) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | [session-10-auditoria.md](./docs/sessions/session-10-auditoria.md) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | [session-09-timer-aro.md](./docs/sessions/session-09-timer-aro.md) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | [session-08-logo-oficial.md](./docs/sessions/session-08-logo-oficial.md) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | [session-07-sidebar-sendero.md](./docs/sessions/session-07-sidebar-sendero.md) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | [session-06-iconos-activitybar.md](./docs/sessions/session-06-iconos-activitybar.md) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | [session-05-fortalecimiento.md](./docs/sessions/session-05-fortalecimiento.md) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | [session-04-reorganizacion.md](./docs/sessions/session-04-reorganizacion.md) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | [session-03-pulido-core.md](./docs/sessions/session-03-pulido-core.md) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | [session-02-refinamiento.md](./docs/sessions/session-02-refinamiento.md) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | [session-01-base.md](./docs/sessions/session-01-base.md) |

---

## [v0.60.0] -- 2026-07-21 -- feat: B2.2b-2 — feedback ligero «¿te ayudó esta pausa?»

Feedback CALMADO y opcional al terminar una pausa, coherente con el tono PACE:
una sola pregunta, respuestas semánticamente alineadas, siempre saltable, sin
gamificación ni consumidor prematuro (nada de porcentajes). **Captura +
almacenamiento** solo: el consumidor (Pausa PACE / «qué te ayuda» premium) llega
en fases posteriores. El GIRO (s113/s114) y el contrato B2.2b-1 (s115) NO se
reabren.

### Decisiones de arranque (AskUserQuestion, 5 — todas la recomendación)

1. **Módulos**: Mueve + Estira + Respira, runner v1 **y** legacy (el futuro
   recomendador aprende de TODO el catálogo, no solo de los 5 pilotos).
2. **Datos**: conteos completos `{yes, some, no}` (+`lastPromptDay`); `answered`
   y `helpScore` DERIVADOS, nunca persistidos (supera el `{done,helped}` que
   figuraba en DECISIONES_PRODUCTO — conserva la señal «Un poco»).
3. **Presentación**: bloque discreto DENTRO del DONE (no pantalla nueva).
4. **Consumidor**: NINGUNO en s116 (solo se almacena).
5. **Frecuencia**: máx 1 vez por rutina y día local.

### Captura + almacenamiento (P0)

- **Superficie** SOLO al alcanzar `stage:'done'` (finalización válida). NUNCA al
  salir con «× Salir» (`onExit('exit')` no llega a done) ni dentro de Caminos
  (los runners pasan `feedback={inPath ? undefined : <SessionFeedback/>}`).
- **Componente NUEVO `app/ui/SessionFeedback.jsx`** (`routineId` + `kind` +
  `accent`): pregunta «¿Te ayudó esta pausa?» + 3 respuestas de igual peso
  (Sí · Un poco · No) + «Ahora no» ghost secundario. Al responder (o «Ahora no»)
  la fila se sustituye por el acuse EFÍMERO «Gracias»; el CTA de regreso del
  DONE sigue SIEMPRE disponible. Sin emojis, sin porcentajes.
- **`SessionDone` gana un slot `feedback`** (afterContent, bajo el copy de
  cierre); los runners lo rellenan.
- **Slice `routineFeedback`** bajo `pace.state.v2` en `app/state-feedback.jsx`:
  `{ [routineId]: { yes, some, no, lastPromptDay } }`. Helper **PURO**
  `nextRoutineFeedback(prev, id, resp)` (no muta; escribe `lastPromptDay` en toda
  respuesta válida incluida `later`; solo yes/some/no incrementan) + acción
  `recordRoutineFeedback` (setState con updater FUNCIONAL; sanitiza a
  `yes|some|no|later`, rechaza id vacío) + `shouldPromptRoutineFeedback`.
  `answered = yes+some+no` y `helpScore = (yes+some*0.5)/answered` se DERIVAN,
  nunca se persisten. Merge defensivo en `loadState` (`{...defaultState,
  ...parsed}`; un state pre-s116 recibe `{}`).

### Idempotencia + frecuencia

- **Idempotencia**: cada montaje acepta como máximo UNA decisión — guard
  SÍNCRONO (`lockRef`) bloquea reenvíos antes del re-render, y al decidir el
  bloque se sustituye por «Gracias» (los controles dejan de existir). Doble clic
  / doble Enter no duplican conteos.
- **Frecuencia**: la pregunta se muestra como máximo UNA vez por rutina y DÍA
  LOCAL (`lastPromptDay = todayISO()` — regla #10, prohibido `new
  Date("YYYY-MM-DD")`). El gate se captura en el **mount** de SessionFeedback
  (no reactivo → «Gracias» no desaparece al escribir `lastPromptDay`). «Ahora
  no» (`later`) NO incrementa contadores pero SÍ escribe el día. Salir por el
  CTA sin responder NO escribe el día → la pregunta puede reaparecer tras otra
  finalización válida el mismo día.

### Guard de teclado (P0) — los 3 runners

- MoveSessionV1 + MoveSessionLegacy + BreatheSession interpretaban `Enter` en
  `stage:'done'` como salir (`onExit('done')`). Con botones de feedback, el
  atajo global de DONE se IGNORA si el foco está en un control
  (`event.target.closest('button,a,input,select,textarea,[contenteditable]')`
  — `closest`, no `matches`), `event.isComposing`, `event.defaultPrevented` o
  hay modificadores Ctrl/Meta/Alt (helpers `sessionKeyOnControl` /
  `sessionDoneKeyBlocked` en SessionShell). El CTA/chip se activan por su propio
  onClick — el guard solo evita una SEGUNDA salida desde el listener global.
  Espacio tampoco se roba a un control con foco (activación nativa en vez de
  `preventDefault`). Enter fuera de un control sigue cerrando el DONE (intacto).

### Layout + límites

- **CSS responsive del shell EXTRAÍDO** a `app/ui/SessionShell.responsive.js`
  (SessionShell.jsx 495→336 ln, sale del borde de 500). El responsive del bloque
  de feedback vive en `SessionFeedback.jsx`. En el tier `≤430` de altura el
  **HERO decorativo del done se oculta** (paso 2 del orden de compactación) para
  que la fila de feedback (pregunta + respuestas + «Ahora no») y el CTA quepan
  sin que el footer tape «Ahora no». La pregunta, las respuestas, «Ahora no» y el
  CTA NUNCA se ocultan; el centro scrollable queda como red de seguridad.
- i18n `session.feedback.*` (question/yes/some/no/later/thanks) ES+EN, explícitas.
- Legacy: solo el render del DONE + guard de teclado (motor/timers/completion/
  navegación byte-idénticos). Contrato s115 intacto.

### Verificación (dev :8765 + standalone)

- Feedback aparece en el done de **v1** (desk.pushups), **legacy** (chair.dips,
  office.express) y **Respira** (rounds.express, acento `var(--breathe)`);
  responder registra + «Gracias»; «Ahora no» registra `lastPromptDay` sin sumar
  conteo; NO aparece en rutina ya respondida hoy (gate) ni tras «× Salir».
- Teclado: guard verificado con eventos reales — `Enter` sobre un chip NO cierra
  ni duplica; `Enter` fuera de un control cierra; Escape cierra; doble clic no
  duplica (guard síncrono; `move.wrists {no:1}`, no 2). (El inyector CDP entrega
  `key:""` para Enter, así que la activación nativa de botón se validó por clic +
  helper puro.)
- Persistencia: `routineFeedback` en pace.state.v2 sobrevive a la recarga; merge
  de un state pre-s116 → `{}` sin romper; grabación funciona tras el merge.
- Layout re-medido: 1280×600 · 1024×512 · 360×640 sin scroll; 844×390 cabe tras
  ocultar el hero en ≤430 (pregunta/respuestas/«Ahora no»/CTA visibles, sin
  scroll horizontal). Consola limpia, sin `[i18n] missing` ES+EN. Standalone
  3166 KB / 86 scripts (verificado: monta, globales presentes, legacy registra).

Diario completo: [session-116](./docs/sessions/session-116-b2-2b-2-feedback-ligero.md).

## [v0.59.0] -- 2026-07-21 -- feat(move): B2.2b-1 — contrato formal + duración derivada

Sesión 115. Formaliza el **contrato de pasos** sobre los 5 pilotos ya
guiados+editoriales (s113/s114) y **deriva la duración de los datos**. El GIRO
del runner guiado quedó CERRADO en s114 — aquí NO se reabre ninguna decisión
suya y el comportamiento del runner queda INTACTO. Diario:
[session-115](./docs/sessions/session-115-b2-2b-1-contrato-duracion.md).

### Decisiones de arranque (AskUserQuestion, 4)

Migración **atómica** de `instruction.*` (sin fallback dual; verificado ES+EN y
todos los consumidores v1 antes de retirar los aliases) · duración derivada
**solo en la tarjeta** · esquema de etiqueta aprobado («ritmo guiado» / «a tu
ritmo» para manual; forma corta «3–4 min» en la tarjeta compacta) · **5
metadatos** completos.

### Contrato formal (P0) — solo los 5 pilotos

- **`instruction:{setup,action,care}`** consolida `placeCue`/`cue`/`careCue` de
  s114 (misma copy). **`tempo:{down,hold,up}`** generaliza el rep-seconds (suma
  = seg/rep; desk/chair `{2,0,2}`=4, chin tucks `{2,4,2}`=8). **`transition:
  {seconds}`** = cambio de lado perSide (10 s, default s113). **`completion:
  {mode:'guided'}`** ('manual' reservado, sin piloto).
- **Los dos «setup» distintos** (lo pedía el corte): `setup:{mode:'ready',
  estimatedSeconds}` = COMPORTAMIENTO del runner (espera al usuario, **nunca**
  countdown; `ready ⇒ estimatedSeconds>0`) · `instruction.setup` = COPY de
  colocación. `v1StepSetup(routine, idx)` es la ÚNICA fuente del gate (lee
  `ready`, deriva auto/none como s111/s114) y la usan el runner y la duración.
- **Migración ATÓMICA**: datos ES + keys i18n EN `id.sN.instruction.{setup,
  action,care}` + lector `tInstr` a la vez; se **retiran** `placeCue/cue/careCue`
  de los 5 pilotos (dato + keys EN). `cue` de las 22 legacy y el fallback
  general de i18n INTACTOS. **Metadatos** `position/equipment/requiresFloor/
  intensity/level` (vocabulario consistente, sin consumidor UI, sin `discrete`).

### Fuente única de segundos + fix del criterio de aceptación (P0)

- **Deuda real corregida**: `v1StepWeight` (peso de la barra segmentada) leía
  `step.dur` crudo mientras el progreso, el `remaining` y el aviso de 5 s leían
  `v1StepDur` (preset) → con descanso 20/45 el peso divergía del llenado. Ahora
  la rama timed/rest usa `v1StepDur` → **peso = progreso = aviso 5 s = duración**
  sobre la misma duración efectiva (verificado en 20/30/45).

### Duración derivada (P0)

- **`estimateDuration(routine, restBetweenSets) → {minSec,maxSec,breakdown}`** —
  helper PURO en support (testable sin runner). `perSide` = **dur POR LADO ×2 +
  UNA transición** (evita el cuádruple conteo); reps guided = `target×tempo`
  FIJO (planificada, no real: «terminar antes» reduce el reloj, no la promesa);
  rest betweenSets → preset, cierre → dur; + prep global + setup por paso (ready
  fijo). No se guarda como dato canónico.
- **Tarjeta (RoutineCard):** las rutinas v1 muestran el rango derivado; Respira +
  22 legacy conservan `routine.min`; premium bloqueado sigue «Pronto». UNA sola
  promesa. **Dev-check** (`_v1IsDev`): compara `routine.min` con el rango de
  **minutos mostrados** [floor,ceil] (no en segundos — una rutina determinista
  casi nunca es múltiplo exacto de 60); avisa solo fuera, sin ruido dentro.

### Limpieza (P2) · Verificación

- Retirada `move.repsGuidedHint` (sin consumidor tras s114).
- Dev :8765 + standalone (SW purgado + reload MISMO gesto). Contrato migrado
  (viejas keys/campos ausentes; EN resuelve); desk.pushups flujo real (prep 5 →
  colocación `instruction.setup` → trabajo `instruction.action` + «CUÍDATE»);
  neck.3 lado integrado + auto-cambio; criterio de aceptación alineado en
  20/30/45; tarjetas v1 con rango, legacy con `min`; dev-check dentro ×4, avisa
  **couch.stretch** (declarado 5 vs 6–7 min, único outlier → candidato B2.3);
  **legacy Hombros byte-idéntico** (prep 3, sin atributos v1); consola limpia
  (sin `[i18n] missing` ES+EN, sin «Cannot update while rendering»). Sin cambios
  de layout (delta 0 heredado de s114). **Standalone** UNA vez (3148 KB, 82
  archivos validados por el parser TS). Bump ×3. Backup `v0.58.0_20260721`
  (rotado `v0.38.0_20260708`, cap 20).

Diario completo: [session-115](./docs/sessions/session-115-b2-2b-1-contrato-duracion.md).
