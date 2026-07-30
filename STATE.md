# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.71.0 (s128 — **home móvil universal · «amanecer del Camino»**: el motor de geometría de la home (`home-geometry.js`) corre AHORA también en móvil/tablet garantizando CERO scroll, y la **tarjeta de Camino hace de «horizonte»** recortando el arco inferior del aro —el «amanecer» del Desktop s126 pero con Caminos—; se conserva el orden móvil Timer→Camino→Actividades. Desktop **byte-idéntico**). «Salir» de Caminos a la home es de s127/v0.70.0.
**Ultima sesion:** #133 -- 2026-07-30 - **§37 re-decidido y CERRADO · FASE 1 completa**. SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). El §37 estaba PROVISIONAL desde s130; se cerró decisión a decisión con las alternativas y sus costes delante, y queda como **§37 bis** del audit (el texto original se conserva como historia). **Las cuatro decisiones**: (1) **constancia = RITMO SEMANAL** — fuera racha actual y mejor racha (`PathStats.jsx:74-84`, `computePathStreaks`), entran «días con ritmo» sobre la tira de 7 con el criterio de día activo de s69 y hueco neutro, sin récord ni rojo; (2) **equilibrio = TRES MARCAS foco·cuerpo·respiración, SIN nota agregada** (la hidratación acompaña, no es ámbito) — **esto es NUEVO, no estaba en el spec de Stats**; (3) **calendario de Mes y Año por TIPOS DE JORNADA, no por volumen**: `computeDayScore` ([YearView.jsx:11-24](app/stats/YearView.jsx)) deja de ser el criterio de color, y los tipos —con pausas · de foco sin pausas · de cuerpo · sin registro, con «con Camino» como MARCA superpuesta— se deducen de lo que hubo, así que aplican a todo el histórico sin necesitar eventos; (4) **check-in de cierre SÍ, ocasional** en cierres naturales, máx 1/día, opcional, nunca tras cada sesión ni para vender premium ⇒ requiere eventos, llega en la Fase 3. La quinta (comparación retrospectiva) se mantuvo **sin preguntar** porque no añade nada a lo que ya prohíbe §2.2. **§36 actualizado**: 5 preguntas de Métricas y Stats marcadas RESUELTAS, 1 pendiente editorial (formulación de las respuestas del check-in) y 1 abierta a propósito (qué pasa de Stats a la sidebar → §14). **`STATS_DESTINO_PROPUESTA.md` queda SIN condicionantes.** **Comerciales de §36 reasignadas a la FASE 7 con motivo escrito**: el precio no se decide antes de revisar Starter Story a fondo, y móvil y empresas caen fuera de v1. **FASE 1 CERRADA.** Diario: [session-133](./docs/sessions/session-133-cierre-fase-1.md).

**Sesion anterior:** #132 -- 2026-07-30 - **Dirección: un solo plan operativo, con el feedback beta al frente**. SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). **Problema resuelto: había DOS órdenes de trabajo** —la secuencia de `ROADMAP.md` (que llevaba 23 sesiones mostrando como «siguiente» la fila «s107 Caminos al centro», nunca ejecutada) y los Bloques 0–9 del audit— y las sesiones s107→s131 no siguieron ninguno. La sección «Camino a v1.0» de [`ROADMAP.md`](./ROADMAP.md) se reescribió como **PLAN OPERATIVO ÚNICO de 7 fases** (38→15 KB; la anterior en `docs/archive/ROADMAP_CAMINO_V1_HISTORICO.md`). Reparto: **audit = qué/por qué · ROADMAP = ORDEN · STATE = presente**. **Marco del usuario**: v1.0 = **primera versión PAGADA** · **Travesías SÍ** y son el argumento principal de compra · **Viajes de respiración NO** · sin fecha. **FEEDBACK BETA REAL** (aportado por el usuario, antes solo estaba el mensaje sin respuestas): los 5 puntos caen en el mismo sitio —**Mueve y Estira no se entienden**: no está claro cómo hacer el ejercicio · glifos flojos · descripciones vagas · **nombres en inglés en la versión española** · complejos mezclados con sencillos—. **Verificado contra el código**: **34 de 93 nombres (37 %)** llevan inglés (`Dead hang`, `Chin tucks`, `Hollow hold`, `Wall sit`, `Cossack squat`, `Superman`…) · **46 glifos para 92 nombres de paso** ⇒ ~la mitad cae en `DefaultGlyph` · **`level`/`intensity` declarados 44 veces en los datos y CERO consumidores en UI** (la info para separar fácil de complejo ya existe y no se muestra). **Consecuencia de orden**: la comprensibilidad de Mueve/Estira pasa a **FASE 2**, por delante de eventos, Stats y Travesías — es el núcleo diferencial, las Travesías se construyen ENCIMA de estos ejercicios, y los glifos placeholder ya eran bloqueante de venta declarado. Fases: **1** dirección · **2** Mueve/Estira se entiendan · **3** eventos web · **4** Stats · **5** Travesías · **6** descubrimiento · **7** venta. **FASE 1 NO está cerrada**: faltan la re-decisión del **§37** (5 preguntas) y las **comerciales de §36** (precio, precio fundador, empresas, Android/iOS). Diario: [session-132](./docs/sessions/session-132-direccion-plan-unico.md).

**Sesion anterior:** #131 -- 2026-07-30 - **Limpieza estructural: STATE 153→57 KB y CHANGELOG 95→41 KB**. Sesión SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). Ejecuta el §4 de [`AUDITORIA_DOCUMENTAL.md`](docs/product/AUDITORIA_DOCUMENTAL.md). **Los dos pesos gordos de STATE eran «Decisiones activas» (62 KB, 108 filas) y «Red de seguridad» (53 KB, 105 filas) = 115 de los 153 KB.** Las **decisiones técnicas NO se archivan** —son reglas vigentes que evitan reintroducir regresiones— así que se mudan a **[`DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA)** y STATE conserva el ÍNDICE de títulos; el historial por archivo de la Red de seguridad sí es historia → `docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`, y la tabla viva queda en archivo · rol · **versión actual**. En el CHANGELOG las 106 filas conservan su **titular** y el texto largo (hasta 4.000+ caracteres por celda) → `docs/archive/CHANGELOG_TABLA_HISTORICA.md`; **el detalle de las 2 últimas versiones queda intacto**. Verificado: 105/108 filas migradas sin pérdida, las 2 secciones de detalle presentes, y el texto completo de cada decisión localizable en su archivo nuevo. **Trampa encontrada**: en PowerShell `$C` y `$c` son **la misma variable** (no distingue mayúsculas) — el script sobrescribía el contenido del archivo con las celdas de la fila y generaba un CHANGELOG truncado; se detectó comparando el conteo de líneas antes de instalar nada (el fichero nunca se dañó, `git status` limpio). Es el mismo tipo de bug que la regla #8 de CLAUDE.md prohíbe en `.map()`. Diario: [session-131](./docs/sessions/session-131-limpieza-estructural.md).

**Sesion anterior:** #130 -- 2026-07-30 - **Auditoría documental · qué gobierna y qué es historia**. Sesión **SOLO-DOCUMENTAL** (sin bump; la versión sigue en **v0.71.0**). El usuario aportó una copia del audit desde el escritorio como «las decisiones más actualizadas»; **verificado por diff línea a línea: es un snapshot ANTERIOR** (2.200 líneas vs 2.309), sus **12 líneas exclusivas son la versión sin anotar** de líneas que el repo ya tiene actualizadas, y al repo le sobra el **§37 entero**, el **§32.6** y el bloque de jerarquía ⇒ **ninguna decisión existe solo en esa copia**. No era conflicto de canon sino el mismo documento en dos momentos; que la duda pudiera existir es el síntoma. **Entregable: [`AUDITORIA_DOCUMENTAL.md`](docs/product/AUDITORIA_DOCUMENTAL.md)** — cadena de autoridad única (1 audit · 2 DECISIONES · 3 STATE · 4 CHANGELOG+diarios), **inventario de 20 documentos + 7 auditorías etiquetados** (GOBIERNA / VIGENTE PARCIAL / PENDIENTE / ARCHIVAR) con evidencia, **drift detectado** (CONTENT.md declara v0.37.0 pero después hubo B2.3 olas 1–4 y couch.stretch 5→6; ROADMAP.md llama «plan vigente» a un bloque cerrado en s99; MONETIZATION queda subordinado al §20 del audit) y el método para adelgazar STATE/CHANGELOG. **Regla nueva: un documento que no declare su estado en la cabecera NO gobierna.** **EJECUTADO**: 4 documentos movidos a `docs/archive/` con banner propio —`PACE_EVOLUTION_CONTEXT` (volcado de conversación ya destilado), `CONTEXTO_UX_RUNNER_WELCOME` (gobernaba B2.2a.5, cerrada en s112), `license-analysis` (afirmaba que no había LICENSE; existe desde v0.12.9), `smoke-tests` (referencia v0.27.2)— + README en `docs/archive/` y en `docs/audits/` (estas NO se movieron para no romper la cita de CLAUDE.md a `audit-evolucion-v0.51.0`) + cabecera de autoridad en el audit y en DECISIONES + fila nueva en la tabla de CLAUDE.md. **DECISIÓN DEL USUARIO: el §37 (ronda M1–M4) pasa a PROVISIONAL** y sus 5 preguntas **vuelven a §36 como abiertas** (tipos de jornada · racha→ritmo · puntuación de equilibrio · check-in · comparación retrospectiva). **§31.4 y §31.6 NO están afectados** (son anteriores a esa ronda) ⇒ el spec de Stats de s129 **aguanta su columna vertebral**; quedan condicionados solo sus §4.4, §4.5 y parte de §4.6. **NO ejecutado y pendiente**: adelgazar `STATE.md` (150 KB) y `CHANGELOG.md` (94 KB) — método en §4 del entregable. Diario: [session-130](./docs/sessions/session-130-auditoria-documental.md).

**Sesion anterior:** #129 -- 2026-07-30 - **Stats destino · especificación de diseño**. Sesión **SOLO-DOCUMENTAL** (patrón s117/s109): **sin versión nueva, cero código, cero build, cero standalone**. Arrancó para ejecutar «Estabilidad de Stats» (Bloque 0 · §23) — se recomendó ese frente por valor/riesgo frente a bibliotecas (abren el campo `kind` de rutinas propias) y glifos+troceo (chocan con el repensado §14) — y el usuario **paró la sesión** para auditar primero qué dice el sistema completo. **Hallazgo: el audit no pide reestilizar el panel, decide un panel DISTINTO** — §37.4 fija el contenido en **Hoy y Semana**, §31.6 manda **Mes y Año a premium** (re-gating atado a la sesión de licencia), la pestaña **Hoy no existe** ([stats.js:26-53](app/i18n/strings/stats.js)), y §37.3 sustituye **dos mecanismos vivos**: el color por volumen de `computeDayScore` ([YearView.jsx:11-24](app/stats/YearView.jsx)) y las **rachas** de PathStats ([PathStats.jsx:74-84](app/stats/PathStats.jsx)) ⇒ estabilizar las 4 pestañas de hoy habría sido trabajo sobre **vistas condenadas**. Entregable: **[`STATS_DESTINO_PROPUESTA.md`](docs/product/STATS_DESTINO_PROPUESTA.md)** (vistas Free/premium · contenido de Hoy y Semana · **ritmo semanal** reutilizando el criterio de día activo de s69 · taxonomía de **tipos de jornada** con «Con Camino» como MARCA superpuesta, no tipo · qué se retira · **gap de datos** · 4 fases). **Decisiones del usuario**: tipos de jornada **DEDUCIDOS** de lo que hubo (cualitativos, sin puntuar, aplican al histórico ya guardado) · la pestaña **Caminos se INTEGRA** en Hoy y Semana (progreso profundo → premium) · **sidebar** se decide al repensarla (§14), Stats como fuente única · alcance = destino completo por fases. **Medición conservada** (runtime v0.71.0, peor caso: año completo + 7 Caminos): chrome **221px** (209 móvil) · contenido Semana 397 / Mes 368 / Año 226 / **Caminos 529** ⇒ la card salta de **448 a 751px** y su techo **152px** (la mitad del delta, por `placeItems:'center'`); hueco útil **298px** en 1366×610 y 407 en 360×640 ⇒ el exceso es de **VOLUMEN**, no de CSS. **Dos suposiciones corregidas por la medida**: la pestaña más alta es **Caminos**, no Semana; y la cuadrícula de **Año NO puede crecer** porque la limita el **ANCHO** (53 semanas × 13px = 689 de 756 útiles) — Mes sí (celda 48→~60). **Fases**: 0 marco de altura estable (agnóstico al contenido, ejecutable ya) · 1 Hoy+Semana sin eventos · 2 `pace.events.v1` · 3 licencia. Diario: [session-129](./docs/sessions/session-129-stats-destino-diseno.md). Historico previo: [`s128`/`s127`](./CHANGELOG.md#historial-completo).

**Sesion anterior:** #128 -- 2026-07-29 - **Home móvil universal · «amanecer del Camino»**. Sesión de **CÓDIGO (layout responsive)**. Arrancó como diagnóstico de 3 síntomas móviles: (1) **icono blanco** + (2) **instalada sin pantalla completa** = **instalar desde `/PACE_standalone.html`** (sin `<link rel="manifest">`, confirmado 0 coincidencias) en vez de la raíz `/` (`index.html` sí lo tiene) → acceso directo con chrome + icono autogenerado; manifest/iconos SIN cambios desde mayo; los botones ⇄□← son la barra del **sistema Android**, no de la app en `standalone`; **solución de uso, sin código**. (3) **scroll leve** = decisión explícita de s123 («móvil prefiere scroll») que el usuario pidió revertir. **Decisión**: la home **igual en cualquier resolución móvil, sin scroll**, con el sistema que hace universal a la Desktop, pero **conservando el orden móvil** (Timer→Camino→Actividades) y usando la **tarjeta de Camino como «horizonte»** (sube y recorta el arco inferior del aro; el «amanecer» de s126 pero con Caminos). **Un motor, dos pieles**: `home-geometry.js` corre ahora también en ≤768 (`isDesktop` solo elige constantes: rama Desktop **byte-idéntica**; móvil `WIDTH_CAP 0.86`/`D_FLOOR 240`), publica `--pace-timer-d`/`--pace-activities-overlap` (medido del **CICLO real**)/`--pace-home-squeeze` y el mismo bucle `scrollHeight≤clientHeight` (el aro solo encoge en último recurso). CSS: clip del aro en móvil (`inset(0 0 var(--pace-activities-overlap) 0)` sobre `[data-pace-dial-fit]`), squeeze móvil (TopBar/FocusTimer root/ActivityBar), aro por `var(--pace-timer-d, --pace-home-timer-size)`. `SuggestedPathCard` repunta el solapamiento a `--pace-activities-overlap`. `TimerDial` SIN tocar. **Verificado** (dev + bundle construido, ES+EN, 5 viewports 360×640→1366×768): **scrollDelta 0** en todos, horizonte a CICLO+5px sin taparlo, Desktop byte-idéntico, consola limpia. **Follow-up acordado (NO en v0.71.0)**: tabs Foco/Pausa/Larga en móviles altos (2ª fila gateada por `min-height`; no es simple des-ocultar —colisionan con los iconos—; «aterrizar núcleo y luego tabs»). Diario: [session-128](./docs/sessions/session-128-home-movil-universal.md). Historico previo: [`s127`/`s126`](./CHANGELOG.md#historial-completo).
**Ultima actualizacion de este archivo:** 2026-07-30 - sesion 129 (**solo-documental: la version sigue en v0.71.0**)
**Build entregado:** `PACE_standalone.html` v0.71.0 (88 scripts + 7 laminas + 12 fuentes inline, 3247 KB, 100% autocontenido, cero peticiones externas; **sigue SIN link de manifest**, file://) + `index.html` (laminas + fuentes como archivo + precache + `<link rel="manifest">`)

---

## Red de seguridad -- archivos vivos

> Mapa de archivos y **version actual**. El HISTORIAL por archivo (que sesion cambio que) se
> archivo en [`docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`](docs/archive/RED_DE_SEGURIDAD_HISTORICO.md);
> para el detalle de un cambio concreto, `CHANGELOG.md` y `docs/sessions/`.

| Archivo | Rol | Version |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.69.0** |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.69.0** |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.69.0** |
| `app/onboarding/Onboarding.jsx` | Orquestador del onboarding de primera vez: maquina de pasos 0-4, chrome… | **v0.56.0** |
| `app/onboarding/OnboardingScreens.jsx` | Piezas puras: ONBOARDING_QUESTIONS (definicion de las 3 preguntas) + OnbScene… | **v0.56.0** |
| `app/onboarding/pickFirstPath.js` | Primer Camino desde el perfil: candidatos por necesidad + sesgo por tiempo +… | **NUEVO s106** |
| `app/i18n/strings/onboarding.js` | i18n del flujo: navegacion + 3 preguntas + primer Camino, ES+EN | **NUEVO s106** |
| `vendor/` | React 18.3.1 production UMD self-hosted (react + react-dom .min.js) | **NUEVO s103** |
| `package.json` + `package-lock.json` | Toolchain del build (devDependencies) | **s104** |
| `app/paths/illustrations/paths.index.js` | Indice de laminas: pathId → dots {x,y,r,color} + paper + focusY + finish… | **NUEVO s104** |
| `app/paths/illustrations/PathIllustration.jsx` | Escena cover full-bleed del runner: casquetes gris→color de actividad… | **NUEVO s104** |
| `app/paths/illustrations/assets/*.webp` | Las 7 laminas normalizadas (1365x768, WebP q82) | **NUEVO s104** |
| `scripts/ingest-lamina.js` | Ingesta de laminas: normaliza + mide bolas/papel + emite bloque del indice | **NUEVO s104** |
| `safety.html` | Pagina estatica `/safety` (Cloudflare Pages) -- disclaimers… | **v0.46.0** |
| `privacy.html` | Pagina estatica `/privacy` (Cloudflare Pages) -- local-first, sin… | **v0.46.0** |
| `app/state-entitlement.jsx` | Guard central de entitlement: `canAccessRoutine`/`canAccessPath` -- UNICO… | **v0.40.0** |
| `app/custom/exercise-registry.js` | Registro interno de ejercicios (65 items / 8 grupos, curado a mano) +… | **v0.54.0** |
| `app/custom/CustomRoutines.jsx` | Seccion "Tus rutinas" en MoveLibrary (locked/empty/cards + crear) +… | **v0.38.0** |
| `app/custom/CustomBuilder.jsx` | Modal constructor 2 vistas (editor con steppers/reordenar/borrar 2-toques +… | **v0.38.0** |
| `app/state-custom.jsx` | CUSTOM_LIMITS + CRUD de customRoutines (sanitize + lectura defensiva) | **v0.38.0** |
| `app/i18n/content/custom.js` | Patch EN del registro: custom.ex.<name ES>.{name,cue} + custom.cat.*.label | **v0.54.0** |
| `app/glyphs/exercise-glyphs.jsx` | 47 glifos SVG line-art para Move/Stretch (sistema 1) + `ExerciseGlyph` | **v0.54.0** |
| `app/glyphs/achievement-glyphs.jsx` | 34 glifos SVG heraldica para Logros (sistema 2) -- strings de SVG… | **v0.33.3** |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standal… |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.58.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.60.0** |
| `app/ui/SessionShell.responsive.js` | CSS responsive de las sesiones (IIFE que inyecta… | **NUEVO s116** |
| `app/ui/SessionFeedback.jsx` | Bloque de feedback del cierre («¿Te ayudó esta pausa?») — B2.2b-2 | **NUEVO s116** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, PremiumSeal, displayItalic | **v0.44.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.52.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + notificacion + **Sesiones** + reset + legal… | **v0.58.0** |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles | **v0.52.0** |
| `app/tweaks/PremiumSection.jsx` | Superficie premium display-only (sello + input licencia disabled + copy… | **v0.34.5** |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.52.0** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad (define `RoutineCard`, compartido por… | **v0.59.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.60.0** |
| `app/move/MoveModule.jsx` | MoveLibrary + **MoveSession dispatcher** (legacy vs v1) + StepGlyph… | **v0.60.0** |
| `app/move/move.data.js` | `MOVE_ROUTINES` (14 rutinas) + `getMoveRoutine` — extraido de MoveModule | **v0.64.0** |
| `app/move/MoveSessionV1.jsx` | Runner del **contrato de pasos v1** por MODO (place\|work\|change + side) | **v0.62.0** |
| `app/move/MoveSessionV1.support.jsx` | Soporte sin UI del runner v1: constantes + helpers de método/duración + CSS… | **v0.68.0** |
| `app/custom/exercise-aliases.js` | `VISUAL_ALIAS` + `resolveVisualId` — identidad visual compartida (visualId) | **NUEVO s110** |
| `app/extra/ExtraModule.jsx` | Modulo Estira (EXTRA_ROUTINES + getExtraRoutine) | **v0.63.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.52.0** |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.67.0** |
| `app/focus/useCountdown.jsx` | Motor de cuenta atras timestamp-based compartido (FocusTimer home +… | **v0.47.0** |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.69.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | UI pura del catalogo (Achievements modal + Seal componente + renderGlyph +… | **v0.33.3** |
| `app/achievements/catalog.js` | ACHIEVEMENT_CATALOG (106 entradas) + CAT_META (7 categorias) +… | **v0.53.0** |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.52.0** |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.46.0** |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** |
| `app/state-history.jsx` | Utils de fecha + helpers de history + **`getHistoryWithToday` (stats vivos)**… | **v0.52.0** |
| `app/state-core.jsx` | Store, loadState, rollover, migraciones, toast | **v0.68.0** |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro, completeFocusSession | **v0.41.0** |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.46.0** |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.32.0** |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.52.0** |
| `app/state-settings.jsx` | setLang | **v0.27.5** |
| `app/state-feedback.jsx` | Feedback ligero por rutina (B2.2b-2): slice `routineFeedback` + acciones | **NUEVO s116** |
| `app/state.jsx` | Indice — re-export consolidado | **v0.60.0** |
| ~~`app/welcome/WelcomeModule.jsx`~~ | ~~Welcome de primera vez~~ | **RETIRADO s106** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.32.1** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** |
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.66.0** |
| `app/main/home-geometry.js` | Ayudante de geometría de la HOME **Desktop**: mide y publica en `:root`… | **v0.71.0** |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media… | **v0.71.0** |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent /… | **v0.33.2** |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline… | **v0.33.2** |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings +… | **v0.58.0** |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + lib + focus + breathe + move +… | **v0.67.0** |
| `app/i18n/strings/paths.js` | i18n Caminos: path runner + names + kind + library + suggested + hydrate +… | **v0.65.0** |
| `app/i18n/strings/stats.js` | i18n panel Ritmo: stats base + tabs + heatmap mensual + vista anual + caminos | **v0.52.0** |
| `app/i18n/strings/achievements.js` | i18n catalogo de logros: ach.cat/seal/toast | **v0.33.1** |
| `app/i18n/content/breathe.js` | Patch EN de contenido Respira: fases (con override D-1) + categorias + 20… | **v0.52.0** |
| `app/i18n/content/move.js` | Patch EN de contenido Mueve (ids extra.*): grupos mueve.cat.* + 14 rutinas | **v0.64.0** |
| `app/i18n/content/extra.js` | Patch EN de contenido Estira (ids move.*): grupos extra.cat.* + 14 rutinas | **v0.63.0** |
| `app/tokens.css` | Tokens CSS + base | **v0.51.0** |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.40.0** |
| `app/paths/PathRunner.jsx` | Runner de caminos -- SOLO orquestador (maquina de fases + dispatcher) | **v0.49.0** |
| `app/paths/PathRunner.parts.jsx` | PathTopBar + ExitConfirmModal + StepError + PathStepLocked (chrome del… | **v0.40.0** |
| `app/paths/CompletionScreen.jsx` | Pantalla de Camino completado (ceremonia editorial sobre la escena ilustrada) | **v0.49.0** |
| `app/paths/steps/_shared.js` | window.pathStepStyles = { btnTypography, btnOutline } | **v0.33.0** |
| `app/paths/steps/PathBreatheStep.jsx` | Step Respira + SafetyGate | **v0.44.0** |
| `app/paths/steps/PathFocusStep.jsx` | Step Foco (Pomodoro contextual de Camino) | **v0.67.0** |
| `app/paths/steps/PathHydrateStep.jsx` | Step Hidratacion | **v0.44.0** |
| `app/paths/steps/PathBodyStep.jsx` | Step Cuerpo (dispatcher Move/Extra via resolveBodyRoutine) | **v0.44.0** |
| `app/paths/PathTransitions.jsx` | Cards intro/step entre pantallas del Camino | **v0.49.0** |
| `app/paths/SenderoBar.jsx` | Sendero visual clasico -- FALLBACK vivo para caminos sin lamina (hoy los 7… | **v0.45.0** |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.66.0** |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.44.0** |
| `manifest.webmanifest` | PWA manifest (renombrado desde manifest.json en s102) | **v0.47.0** |
| `sw.js` | Service Worker PWA | **v0.68.0** |
| `app/ui/UpdatePrompt.jsx` | Aviso de version nueva del SW ("Actualizar / Luego") | **v0.47.0** |
| `app/focus/FocusTimer.support.jsx` | Helpers sin UI del Pomodoro: `getFocusDescriptorKey` + `maybeNotifyFocusEnd`… | **v0.67.0** |
| `app/focus/FocusTimer.parts.jsx` | Piezas de UI del Pomodoro extraídas: `MinutesPicker` (selector de duración… | **NUEVO s124** |
| `build-standalone.js` | Genera el bundle offline (AHORA compilador: Etapa A) | **v0.48.0** |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80) | **v0.49.0** |

## Ultima sesion -- lo que sigue vivo

> El informe operativo de cada sesion (cambios entregados y verificacion) vive en su diario
> en [`docs/sessions/`](./docs/sessions/) y destilado en [`CHANGELOG.md`](./CHANGELOG.md).
> Aqui solo lo que sigue VIVO: diferido y pendiente.

### Diferido (documentado, NO ejecutado)

- **s125 — scrollbar del runner v1** (HALLAZGO s122, sigue sin tocar):
  `data-pace-session-center` (`overflowY:auto`) desborda ~17px a alturas ≤~660px en pasos
  v1 `perSide` de texto largo. NO compactar copy/glifos/tipografía → sesión corta de runner
  responsive. **Chip de tarea creado.** (El patrón de ocultar la barra de scroll de s123
  puede reutilizarse.)
- **Colisión CTA↔tarjeta en estilos barra/analógico** (no-default): PRE-existente de s123
  (el solapamiento se dimensiona para el aro; los controles de esos estilos van fuera del
  aro). Fuera de s124.
- **git**: `focus/FocusTimer.jsx`, `focus/FocusTimer.support.jsx`, `focus/FocusTimer.parts.jsx`
  (nuevo), `paths/steps/PathFocusStep.jsx`, `ui/TimerDial.jsx`, `i18n/strings/sessions.js` +
  los de bump/build (state-core, PACE.html, sw.js, PACE_standalone, index) + docs; NADA de
  `.claude/settings.local.json`.

### Pendiente

- **Diferidos de s122 (claridad de la home)**:
  - **§0 solapamiento responsive a alturas <720px**: el aro grande fijo + la
    tarjeta no caben sin la geometría responsive de §0 (círculo que encoge por
    altura, safe-zones). El solapamiento «sol» de s122 va con GATE ≥760px; por
    debajo NO se aplica. Sesión propia de §0 (círculo responsive + solapamiento
    controlado en todos los viewports del §8).
  - **§7**: pills «Breve/Tranquilo/Amplio» de Tweaks + estabilidad del contenedor
    de Estadísticas entre pestañas Semana/Mes/Año.
  - **Scrollbar del runner v1 (HALLAZGO s122)**: `data-pace-session-center`
    (`overflowY:auto`) desborda **~17px a alturas ≤~660px** en pasos v1 `perSide`
    de texto largo (glifo v1 escala con la altura → contenido crece con el
    viewport; legacy NO desborda). Restricción del usuario: NO compactar
    copy/glifos/tipografía ni ocultar el overflow → sesión corta de runner
    responsive (`MoveSessionV1.support` / `SessionShell.responsive`; verificar
    ready/timed/reps/perSide/descansos/DONE en 360×640, 390×660, 412×667, ES/EN).
    **Chip de tarea creado.**
- **Las 3 deudas de layout del runner v1 — RESUELTAS s119** (FASE A): barra de
  scroll fantasma (curva de glifo continua + tier de banda 701–768), glifo/botones
  sin anclar (alturas reservadas) y warning rep-pulse (`MoveSessionV1.jsx:441`,
  shorthand→longhand). Ya NO son deuda. (NOTA s122: la barra fantasma reaparece por
  otra vía en pasos `perSide` de texto largo ≤660px — ver diferido arriba.)
- **Migración MECÁNICA de B2.3 CERRADA (s121)** con OLA 4 (core.plank + wall.sit).
  **Quedan 6 rutinas legacy BLOQUEADAS por reescritura editorial / progresión
  técnica / revisión fisio** (`atg.knees` espera la revisión de Sissy squat). **No
  son deuda mecánica.** NO se abrirá una OLA 5 mecánica salvo que una auditoría NUEVA
  demuestre que alguna se puede migrar sin cambiar copy, dosis, estructura,
  lateralidad ni escalones. Las 6: `push.ladder` (negativas sin nº de reps + Pica sin
  escalón) · `legs.single` (aritmética imposible + 3/4 avanzados) · `desk.quick`
  (Seated twist, falta 2º lado) · `hips.ground` (Ground transitions «con manos») ·
  `ancestral` (Ground transitions + Rib pull identidad) · `atg.knees` (editorial +
  FISIO Sissy squat, B4). + escalón de regresión de Puente torácico (`spine.waves`,
  s120). **s122 (claridad UX de la home) HECHA**; la migración editorial de las 6
  legacy sigue condicionada a la validación real de la home (ver "Proxima sesion").
  La IMPLEMENTACIÓN de eventos (EventStore + adaptadores web/Capacitor +
  emisores; diseño `EVENTOS_SCHEMA.md` rev.5, s117) es de fases futuras, antes de
  stats premium / licencia.
- **Consumidor del feedback** (Pausa PACE / recomendador scoring v2 / «qué te
  ayuda» premium): queda para su fase — hoy solo se ALMACENA (nada de
  porcentajes ni comparaciones, decisión s116).
- **Latente (no bloqueante, pre-existente)**: `v1GlyphSize` lee `innerHeight` en
  render y no hay listener de resize → redimensionar EN PAUSA no recomputa el glifo
  hasta el próximo render; con re-render fresco al mismo viewport, los pasos anclan
  (verificado). Place↔work del MISMO paso conserva un pequeño salto (gate 56px vs
  timer 128px) — es transición de fase, no drift entre pasos; no se reserva.
- **Diseño pendiente**: diagramas de dos poses (los itera el usuario, regla
  D-4; candidatos Flexiones inclinadas + Flexor de cadera).
- **Deuda de tamaño**: `MoveSessionV1.jsx` **498 ln** (margen JUSTO — el próximo
  añadido va a `MoveSessionV1.support.jsx`) · `MoveSessionV1.support.jsx` ~305 ln ·
  `ExtraModule.jsx` **447 ln** (cerca del techo 500; al retomar Estira, trocear los
  datos ANTES) · `move.data.js` **396 ln** · `SessionShell.jsx` 336 ln · `dur` en
  pasos `reps` sigue como reserva del fallback legacy.
- **Deuda de entorno (s112/s113/s119)**: SW dev **re-registra tras cada carga
  fresca** → tras editar hay que desregistrar SW + limpiar caches ANTES de recargar
  (si no, sirve código stale; confirmado en s119) · buffer de consola del pane
  duplica y sobrevive recargas → los 4 warnings de rep-pulse que aún aparecen son
  STALE (el compilado es longhand, imposible que React los emita) · a11y (tarjetas sin teclado,
  onboarding sin focus trap) · «Serie X de Y» inexistente (metadatos ya
  presentes, sin consumidor UI aún) · timer de Move sigue setInterval
  (foreground, aceptado).
- **[Feedback s107-cierre] aun sin rutar**: salir de un Camino a la home
  (via tactil explicita; el «×» avanza, diseño s99) · visual Respira «Loto»
  (PNG del usuario, falta en el repo) · laminas HQ de Caminos (re-ingesta con
  `ingest-lamina.js`, REGLA D-4: re-MEDIR, nunca swap directo).
- **PWA en navegador REAL** (instalacion + notificacion): sigue del usuario
  desde s102.
- **B2.3 tras OLA 4 — migración MECÁNICA CERRADA (s121)**: quedan **6 rutinas legacy
  BLOQUEADAS** por reescritura editorial / progresión técnica / revisión fisio, NO
  por mecánica — 4 Mueve premium/free (`push.ladder`, `legs.single`) + parte de
  Estira (`desk.quick`, `hips.ground`, `atg.knees`, `ancestral`) · trabajo de
  lenguaje BASE §7-9: 4 cues (Seated twist, Rib pull, WGS, Ground transitions) + 2
  rutinas (`legs.single`, resto de `atg.knees`) + escalón de Puente torácico
  (`spine.waves`); `atg.knees` además espera la revisión FISIO de Sissy squat (B4).
  (Conteo: 23 pre-OLA-1 → 18 tras s118 → 13 tras s119 → 8 tras s120 → **6 tras
  s121**.)
- `tokens.css` 613 ln y `FocusTimer.jsx` 496 ln (deuda; sin cambio en s114).
- Automatizar el bump de version en el build (package.json como fuente).

### Backlog registrado en s117 (propuestas + multiplataforma; docs-only, SIN implementar)

Registrado al cerrar s117; **ninguna de estas entradas se ha implementado**.

**Visual / UX** (propuesta: [`HOME_REDISENO_PROPUESTA.md`](./docs/product/HOME_REDISENO_PROPUESTA.md)):
- Pills **Breve / Tranquilo / Amplio** de Tweaks: corregir el tratamiento visual.
- **Estadísticas**: dimensiones estables de la carcasa al alternar Semana/Mes/Año
  (responsive entre viewports OK, no entre pestañas del mismo viewport).
- **Jerarquía del Home**: Caminos / Camino sugerido POR ENCIMA de los accesos
  manuales (Respira/Mueve/Estira/Hidrátate).
- **Solapamiento editorial** intencional y responsive (margen negativo con
  `clamp()`, círculo `aspect-ratio:1`, nunca tapar timer/controles/ciclo).

**Multiplataforma** (arquitectura aprobada en `EVENTOS_SCHEMA.md`; implementación PENDIENTE):
- **Capacitor compartido Android/iOS**: build dedicado, detección de runtime,
  adaptadores nativos (SQLite log + Preferences/UserDefaults), lifecycle,
  notificaciones, safe areas, export/import; pruebas en dispositivo real +
  TestFlight iOS.
- **`PurchaseAdapter`**: web · Google Play Billing · StoreKit (tiendas = fuente de
  verdad de precio/moneda; no hardcodear importes en traducciones).
- **Timer de Mueve multiplataforma basado en timestamps** (hoy `setInterval`
  foreground; deuda menor ya registrada en plan-maestro).

**i18n** (propuesta: [`I18N_EXPANSION_PROPUESTA.md`](./docs/product/I18N_EXPANSION_PROPUESTA.md)):
- **I18N-1** modo Automático (detección BCP 47 web+Capacitor, override manual
  persistente, fallback inglés).
- **I18N-2** robustez (paridad de claves, pseudolocalización, pluralización).
- **I18N-3** expansión comercial (validar alemán · pt-BR volumen · francés).
- **I18N-4** localización nativa (permisos, notificaciones, compras, fichas y
  capturas de tienda).

## Proxima sesion -- FASE 2, sesion 1: AUDITORIA de nombres y glifos (sin codigo)

> El orden de trabajo vigente vive en la seccion «Camino a v1.0» de [`ROADMAP.md`](./ROADMAP.md)
> (7 fases, reescrita en s132). **FASE 1 cerrada en s133.** Este apartado solo dice cual es la
> proxima sesion y con que criterio se cierra.

**Por que esta y no otra.** El feedback beta real dijo cinco cosas y las cinco caen en Mueve y
Estira: no se entiende como hacer el ejercicio, los glifos son flojos, las descripciones son
vagas, en espanol se mezclan nombres en ingles, y hay ejercicios muy complejos junto a otros muy
sencillos. Verificado contra el codigo en s132: **34 de 93 nombres (37 %) llevan ingles** · **46
glifos para 92 nombres de paso** (~la mitad cae en `DefaultGlyph`) · **`level` e `intensity`
declarados 44 veces y con CERO consumidores en la UI**.

**Entregable: la matriz §19.2 completa**, docs-only, para los 92 nombres de paso:

| Columna | Qué recoge |
|---|---|
| Nombre actual | tal cual esta en los datos (`name` ES) |
| Nombre propuesto en espanol | solo si hoy lleva ingles; con el termino tecnico entre parentesis si aporta |
| Glifo | existe / placeholder / ausente (cae en `DefaultGlyph`) |
| Alias | si `VISUAL_ALIAS` lo unifica con otro |
| Poses | una o dos, y si necesita flecha o apoyo |
| Zona corporal | para agrupar y para los filtros de la Fase 6 |
| Nivel tecnico e intensidad | los ya declarados en los datos, mas si el valor es correcto |
| Revision tecnica | si necesita fisio antes de tocarlo (p. ej. `atg.knees` / Sissy squat) |

**Trampa que obliga a auditar antes de escribir.** `name` en espanol es **la clave del glifo** y
de la i18n del constructor (decision s93), asi que renombrar exige tocar `exercise-glyphs.jsx` y
`app/i18n/content/*.js` **en el mismo cambio** (decision s108). Si se olvida, el glifo cae **en
silencio** a `DefaultGlyph` — es decir, arreglar el idioma empeoraria justo la queja numero 2.
Por eso la matriz va primero y las olas despues.

**Criterio de cierre de la sesion:** existe la matriz con los 92 pasos, y de ella sale el corte
de las olas siguientes (renombrado + glifos, dos niveles visuales, descripciones, nivel e
intensidad visibles, preview). Cero codigo.

**Lo que NO se toca en esa sesion:** dosis, estructura de pasos, lateralidad, escalones ni
`access` de ninguna rutina. Y los glifos que el usuario dibuje o apruebe se portan **literales**
(regla s84).

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

| Decision | Desde |
|---|---|
| **Barra de scroll del runner v1 OCULTA conservando el scroll; CONFINADA a v1, NUNCA global** | s125 |
| **Layout del runner v1: bloque de alto CONSTANTE (alturas reservadas) + curva de glifo continua… | s119 |
| **B2.3 = migración MECÁNICA de contenido al contrato v1, en OLAS; el runner NO se rediseña** | s118 |
| **Arquitectura de eventos APROBADA (solo DISEÑO), NO implementada** — `pace.events.v1` por… | s117 |
| Feedback ligero por rutina (B2.2b-2): «¿Te ayudó esta pausa?» — solo captura + almacenamiento… | s116 |
| Contrato formal de pasos v1 (B2.2b-1): `instruction.*` + `tempo` + `transition` + `completion`… | s115 |
| CAPA EDITORIAL del runner (CIERRA el GIRO): instrucción por CAPAS · pantalla final por módulo… | s114 |
| Runner GUIADO (enmiendas R2/R3): el usuario toca para empezar, pausar o adaptar — NO para… | s113 |
| Gate de colocacion con TRES modos: `setup:'ready'` espera al usuario; auto deriva del `mode`… | s112 |
| Contrato de pasos v1: `mode` en el step elige runner; sin `mode` = legacy intacto | s110 |
| visualId: identidad visual compartida via alias, SIN tocar `step.name`/localStorage | s110 |
| Editorial de seguridad CERRADO (B1.2): sin lenguaje de fallo/limite/maximo, material anunciado… | s108 |
| Renombrar un `name` de paso EXIGE renombrar su key de glifo EN EL MISMO cambio | s108 |
| Defaults opt-out: `soundOn:true` + `notifyFocusEnd:true`; el permiso de notificacion se pide en… | s108 |
| Claves ISO de fecha SIEMPRE con `parseLocalDateKey()` (regla #10 CLAUDE.md) | s107 |
| Apnea FUERA del producto: sin cronometro de retencion, sin logros por aguantar | s107 (decision auditoria 2026-07-16) |
| Onboarding = flujo FULL-SCREEN sobre las laminas; el WelcomeModal NO vuelve | s106 |
| Cierre del onboarding SUGIERE en home (no auto-arranca el runner) | s106 |
| `profile` en state: null = pregunta saltada; consumidor futuro = scoring s107 | s106 |
| Dentro de `[data-pace-reveal]`, NO señalizar estado con `opacity` inline | s106 |
| Identidad tipografica = **Cormorant** (titulos) + EB Garamond (cifras/glifos/logo) + Inter… | s105 |
| Un Camino cuenta como completado solo con >=1 paso hecho de verdad | s105 |
| Toasts de logro APLAZADOS durante un Camino | s105 |
| Escena ilustrada de Caminos SOLO en el runner; SenderoBar = lenguaje fuera + fallback dentro | s104 |
| Marcadores "casquetes": gris → color de actividad; SIN orbe | s104 |
| "Sobre el arte siempre es de dia" | s104 |
| Laminas: archivo+precache en WEB / data URI SOLO en standalone; el arte se mide UNA vez | s104 |
| Build Etapa A: artefactos COMPILADOS con semantica de eval reproducida (IIFE + re-exposicion… | s103 |
| Toolchain del build PINEADO: Babel major 7 + TypeScript major 5 | s103 |
| SW: updates con PROMPT (worker en waiting), nunca skipWaiting incondicional | s102 |
| Notificacion fin-pomodoro: solo pestaña oculta, silent, solo foco — **default SUPERSEDED s108**… | s102 |
| Pomodoro persiste la recarga via `pace.timer.v1`, FUERA de pace.state.v2 (cierra fork s96) | s102 |
| manifest.webmanifest unico; el build re-inserta el link SOLO en index.html | s102 |
| Enlaces legales (/safety /privacy) viven en Ajustes, solo en web | s102 |
| Stats vivos: los paneles leen `getHistoryWithToday`, el rollover sigue siendo el UNICO escritor… | s101 |
| La serie `moveMinutes` se etiqueta "Cuerpo" en stats (Mueve+Estira comparten cubo) | s101 |
| `/safety` y `/privacy` = paginas estaticas AUTOCONTENIDAS en raiz | s101 |
| CompletionScreen = ceremonia editorial; sin OutroCard; draw-in SOLO alli | s100 |
| Todos los steps de Camino usan el SessionShell compartido | s99 |
| Atmosfera por paso (SessionShell `atmosphere`), SOLO en Camino | s99 |
| Timer: variante `ticks` (aro de marcas de minuto) para el Foco de Camino | s99 |
| Botones del Foco por color (revisa s79) | s99 |
| Sendero: curva fluida original + hito actual acentuado (cierra iteracion cresta/valle) | s99 |
| "Siguiente" (no "Volver al inicio") en el done de una sesion dentro de Camino | s99 |
| BreatheSession: un solo reloj de tiempo activo (timestamp-based) | s98 |
| Logo en oscuro NO se reemplaza (PNG invertido = original) | s97 |
| Progreso de sesiones activas = BARRA SEGMENTADA por bloques, no bolas | s97 |
| 2a recalibracion oscuro EN BLOQUE (`--ink-3`/`--line`/`--line-2`) | s97 |
| Motor de timer timestamp-based, LOCAL (no persiste en pace.state) | s96 |
| Bloque Contenido+Premium: gating a nivel sesion | s85 |
| Gating ANTES del contenido | s85 |
| Copy BMC: nucleo libre (opcion A) + premium aparte | s85 |
| Campo `access` solo en paths/registry.js -- SUPERSEDED s88 | s85 |
| F3b solo binario free/premium (locked.* y licencia real diferidos) | s88 |
| Set premium = 8/26, ~1/3 por modulo, solo lo mas profundo | s88 |
| `premiumUnlocked` controla el bloqueo real; el sello marca "es de pago" | s88 |
| Guard central de entitlement = UNICO punto de verdad del acceso | s95 |
| `path.weekend` = degustacion curada, ahora EXPLICITA (`tasting:true`) | s89, explicita s95 |
| Autofocus del Welcome solo con puntero fino | s95 |
| Reduced-motion con excepcion `data-pace-essential` | s89 |
| Paleta oscura automatica SOLO en primer arranque | s89 |
| Steppers con patch funcional `set(s=>...)` | s89 |
| SW: navegaciones network-first, assets cache-first, cleanup en activate | s89 |
| Free-first dentro de cada grupo de biblioteca | s90 |
| `ambientDrone.start(force)` para sesiones con drone integral | s90 |
| Sin logros `explore.*` para tecnicas F4 (y cola D-8b cerrada) | s90 |
| Bibliotecas de cuerpo agrupadas (mismo shape que BREATHE_ROUTINES) | s91, cerrado s92 |
| Prefijo i18n `mueve.cat.*` para los grupos de Mueve | s92 |
| strings-content.js troceado en `app/i18n/content/` por modulo visual | s92 |
| Pasos nuevos sin glifo usan DefaultGlyph hasta aprobacion (D-4) | s91, s92 |
| Registro de ejercicios CURADO a mano en `app/custom/` (no derivado runtime) | s93 |
| Rutinas custom: prefijo `custom.<Date.now()>` + credito via completeMoveSession | s93 |
| i18n del registro por NOMBRE canonico ES como key (`custom.ex.<name>.*`) | s93 |
| Builder como overlay singleton que OCULTA MoveLibrary mientras esta abierto | s93 |
| Preview: purgar SW+caches tras CADA tanda de edits + static-server con no-store | s93 |
| Sin tokens sinonimos en tokens.css (huerfanas por reemplazo directo) | s94 |
| Plan maestro v1.0 adoptado — secuencia s94→ en ROADMAP.md | s93 |
| Sintetizar audio (no WAVs) | s28 |
| Elastic License 2.0 | s26 |
| Anti-truncamiento: Python write | s48-s52 |
| Build con TS parser real | s56 |
| Overlay via CustomEvent | s50+ |
| Transiciones Camino volatiles | s77, revisada s100 |
| Progreso del Camino solo entre pantallas | s77b |
| Labels SenderoBar: solo hitos done | s77b |
| Nuevo token --focus-cta para CTA Comenzar home | s77b |
| Slot horario 'anytime' como fallback (no compite con slots fijos) | s78 |
| Logro master.path.all7 ("Cartografa") = cap de 1 logro nuevo por sesion | s78 |
| PathHydrateStep usa mismo lenguaje visual que HydrateModule home | s78 |
| PathFocusStep es Pomodoro CONTEXTUAL, no libre | s79 |
| Toast: fade-out aditivo 300ms tras TOAST_DURATION_MS | s79 |
| Paleta oscura recalibrada +10% en superficies/bordes, --ink-* intactos | s79 |
| PathRunner.jsx splittado en `steps/` + `PathRunner.parts.jsx` + `CompletionScreen.jsx` | s80 |
| Estilos comunes entre Steps via `window.pathStepStyles` | s80 |
| PathBodyStep dispatcher (kind:'body' resuelve Move/Extra via resolveBodyRoutine), NO… | s80 |
| i18n splittado en `app/i18n/strings/` con bootstrap explicito + 5 dominios | s81 |
| ES y EN en mismo archivo del split (no separar por idioma) | s81 |
| Override silencioso strings-content.js sobre 3 keys breathe.phase.* (deuda explicita D-1) | s81 |
| `app/main.jsx` splittado en `app/main/` (variante B equilibrada) | s82 |
| CSS responsive global del shell vive en `app/main/_responsive.js` (IIFE) | s82 |
| `Object.assign(window, { TopBar, ActivityBar })` preservado tras split | s82 |
| `app/achievements/Achievements.jsx` splittado en `achievements/` + `glyphs/` (variante B) | s83 |
| Convencion `app/glyphs/` como home definitivo de sistemas de glifos | s83 |
| `IMPLEMENTED_ACHIEVEMENTS` expuesto a window | s83 |
| Achievements.jsx lee globales como `const X = window.X \|\| fallback` al inicio del archivo | s83 |
| Iter glifos canonicos Mueve/Estira cerrado (port literal desde HTML del usuario) | s84 |
| Wrapper G de `exercise-glyphs.jsx` mantenido a strokeWidth 1.8 aunque las versiones aprobadas… | s84 |
| Para los 15 glifos PENDIENTES (sin entrada en `window.APPROVED`), mantener s60 hasta nueva… | s84 |

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/tweaks/TweaksPanel.jsx` | 430 | BAJA (s102: +79 ln de notificacion+legal; re-crece pero dentro de limite. Si vuelve a crecer, candidato natural: extraer el bloque de notificacion a seccion propia como TweaksData/PremiumSection) |
| `app/state-core.jsx` | 442 | BAJA (s106: +10 del profile con comentario de contrato; s101: split a state-history.jsx) |
| `app/focus/FocusTimer.jsx` | 496 | **MEDIA** (s108: +3 ln de la llamada al permiso; s102: +37 ln de notificacion+persistencia -- AL BORDE del tope; los helpers ya viven en FocusTimer.support.jsx, la proxima adicion al modulo Foco debe ir alli o a un split del MinutesPicker) |
| `app/ui/SessionShell.jsx` | 336 | BAJA (s116: CSS responsive EXTRAÍDO a `SessionShell.responsive.js` → **495→336 ln**, sale del borde; + slot `feedback` + guards de teclado) |
| `app/move/MoveSessionV1.jsx` | 495 | **MEDIA** (s116: +7 ln de guard de teclado + slot feedback -- MARGEN JUSTO; el proximo añadido va a `MoveSessionV1.support.jsx`) |
| `app/i18n/strings/ui.js` | 377 | BAJA (s102: +26 ln de keys PWA; dentro de limite, dominio mas grande del split) |
| `app/i18n/strings-content.js` | -- | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/glyphs/exercise-glyphs.jsx` | 554 | BAJA (s84, dentro de limite tras port; iter cerrado 31/46 aprobados) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 279 | SALE (s82, antes 600 -- split en main/_responsive + TopBar + ActivityBar) |
| `app/shell/Sidebar.jsx` | 541 | MEDIA (s101: +6 ln del criterio s69 en WeekDots; s94: re-entro; candidato natural: extraer SenderoDelDia + StatusBar a `shell/`) |
| `app/tokens.css` | 613 | **MEDIA** (s105: +12 @font-face; s106: +4 del remap; es CSS global, no JSX -- candidatos naturales: extraer los @font-face (~90 ln) o el CSS del SenderoBar (~110 ln) a archivo propio cargado tras tokens) |
| `app/paths/PathRunner.jsx` | 244 | SALE (s80, antes 835 -- split en steps/ + parts + CompletionScreen) |
| `app/i18n/strings.js` | -- | SALE (s81, antes 791 -- split en strings/_bootstrap + ui + sessions + paths + stats + achievements) |

**Backlog tecnico MEDIA:** FocusTimer.jsx a 493 ln (ver tabla). Del P2 de
la auditoria (`docs/audits/audit-producto-v0.34.4.md`): build precompilado
(A-5) **HECHO en s103 salvo fuentes (s104)**; quedan tests del state (A-6)
e import sanitizado (A-7). El "manifest rico" del P2 quedo HECHO en s102.

### Deudas semanticas (no de tamaño, no urgentes)

| Item | Detectado en | Detalle |
|---|---|---|
| D-1 override silencioso content/breathe.js (antes strings-content.js) | s81 audit, movido s92 | 3 keys `breathe.phase.*` con valores distintos (Inhale again vs more; Oceanic vs Ocean). 8 keys mas duplicadas pero coincidentes. Tras el split s92 el override vive en `app/i18n/content/breathe.js` (mismo orden de carga). Decision futura |
| D-2 duplicidad "Hecho hoy" | s81 audit | `path.card.done` + `paths.library.doneToday` mismo valor, dos keys. Consolidar a una |
| D-3 namespaces path / paths inconsistentes | s81 audit (existente desde s53) | Singular `path.*` (runner, hydrate, card, error) + plural `paths.*` (library, suggested, path, kind, runner.repeat). Mezcla historica |
| D-4 35 glifos pendientes sin aprobar (15 de s84 + 11 de s91/F5 + 9 de s92/F6) | s84 + s91 + s92 | De s84 (iteraciones v8-v13 en exploracion, no en `window.APPROVED`): World's greatest stretch, Cossack squat, Pigeon, ATG split squat, Tibialis raise, Nordics, Sissy squat, Deep squat hold, Crawling, Ground sitting transitions, Inclinacion lateral, Escalenos, Wrist circles, Seated twist, Ankle circles. De s91/F5 (sin iteracion aun, renderizan DefaultGlyph): Gato-camello, Palmas al suelo, Rezo invertido, Circulos de hombro, Couch stretch, Onda espinal, Puente toracico, Rodar hacia abajo, Rana, Pliegue adelante, Isquio a una pierna. De s92/F6 (idem): Sentadilla a silla, Apretar gluteos, Superman, Pica en escritorio, Sentadilla bulgara, Plancha, Plancha lateral, Hollow hold, Hang activo. Portar cuando el usuario apruebe |
| D-5 divergencia move.desk.quick paso 5 | s84 | HTML del usuario lista `Apertura de pecho` donde repo lista `Chin tucks`. Decision de catalogo en sesion futura (modificar EXTRA_ROUTINES o mantener repo) |
| D-6 strokeWidth wrapper G | s84 | Versiones aprobadas del HTML usan 1.5 (v3-v8, v12) o 2.0 (v9), pero wrapper G del repo unifica a 1.8. Si el usuario quiere unificar a 2.0 (estilo V9), cambio aislado del wrapper afecta los 46 glifos por igual |
| D-7 racha foco-en-Camino (F-1) -- RESUELTO s86 | s86 audit | `PathFocusStep` no llamaba `updateStreak` -> un dia de solo-foco-en-Camino salia activo en heatmap/YearView pero no sumaba a `streak.current`. **Corregido en v0.34.2** (anadido `updateStreak()` tras el credito, idempotente por dia). Ver `docs/audits/audit-tracking-v0.34.1.md` |
| D-8 fuga premium via `path.weekend` + logros ligados a premium -- RESUELTO s89 (decision) + cola cerrada s90 | s88 audit | (a) `path.weekend` declarado **degustacion curada** (decision activa s89, cero codigo). (b) Logros premium-tied aceptados. (c) Cola cerrada en s90: `master.collector.half/full` usa umbrales fijos 50/100 logros desbloqueados, NO un denominador por catalogo -- crecer F4-F6 no lo distorsiona. Ver `docs/audits/audit-producto-v0.34.4.md` |

### Backlog de pulido / UX (feedback usuario s96)

Recogido con capturas al cerrar s96. Lista completa en `ROADMAP.md` ->
"Backlog de pulido / UX (feedback s96)" + memoria `ux-refinement-backlog`.

**Hecho en s97 (v0.42.0):**
- ✓ **Modo oscuro legible**: recalibracion tokens (`--ink-3`/`--line`/
  `--line-2`). El "logo descolorido" NO era bug -> el usuario valida el
  invertido (ver decisiones activas).
- ✓ **Precontador "3" solapa caption** (SessionPrep) + **countdown de Mueve**
  descentrado + **bolas de Respira** sin sentido -> barra segmentada por bloques.

**Hecho en s99 + s100 (v0.44.0 / v0.45.0):**
- ✓ **Caminos runner refinado**: overhaul premium s99 (SessionShell en los 4
  tipos de paso, timer ticks, botones por color, atmosfera, kicker romano) +
  remate s100 (CompletionScreen ceremonia editorial, OutroCard eliminada,
  banding suavizado). Queda OPCIONAL: ilustracion por Camino (espera arte, D-4).

**Hecho en s101 (v0.46.0):**
- ✓ **Stats a fondo** (P2 del usuario, s100): auditoria 8 hallazgos + stats
  vivos (Mes/Año con el dia actual) + WeekDots criterio s69 + fila "Cuerpo" +
  racha Caminos viva + fix DST + WeeklyStats muerto borrado. Diferidos: H7
  (credito solo-al-completar de Mueve/Estira, "Move timer: bajo") y H8
  (proxies del Sendero del dia → s106 sidebar).

**Pendiente (sin planificar):**
- **[Visual]** pomodoro web con semicirculo fijo integrado en las pills
  (no depender del zoom) · sidebar (divisor logo↔Ritmo sube + mas util).
- **[Producto]** builder premium mas visible + ejercicios de Mueve Y Estira
  · filtros en bibliotecas para movil (mapea a la fase de taxonomia+filtros).
- **[Feedback s101-cierre]** AUDIO: Sound.jsx mas pulido y atractivo (encaje:
  sesion de audio premium ANTES del bloque CTB) · GLIFOS: los de Mueve/Estira
  "tienen fallas, no coherentes ni premium" → la iter pre-venta pasa de la
  cola D-4 a revision COMPLETA del set (el usuario itera, port literal) ·
  CONTENIDO: titulos de ejercicios en ingles dificiles de entender →
  auditoria de nomenclatura ES (mapea a s107-108; OJO name ES = key de
  glifo/i18n custom, s93). Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s102-cierre]** POMODORO: subtitulo dinamico por duracion
  (15/25/35/45, ≥2 frases estilo PACE rotando aleatorio por preset; hoy
  `focus.subtitle.focus` es fijo) · CTA: "Comenzar" poco atractivo →
  explorar opciones y que el usuario ELIJA · STATS: panel Ritmo SIN scroll
  vertical en web (reaparecio; la fila "Cuerpo" s101 sumo una fila) ·
  **GAMIFICACION SUAVE** (matiza CLAUDE.md: agresiva no, suave si; video
  ref "I built a habit system as addicting as a casino" de SpoonFedStudy;
  sesion de DISEÑO propia antes de codigo) · PLATAFORMAS: web + Android +
  **iOS** cuando corresponda (Capacitor cubre ambos, post-venta). Principios
  transversales del usuario: bonita, simple, util, profesional, vistosa,
  sencilla y facil de usar. Detalle en ROADMAP "Backlog de pulido".
- **[Feedback s103-cierre]** i18n 3+ IDIOMAS para la app final (preparar
  cuando toque; arquitectura lista, decision s81) · RESEARCH competidores
  Google Play + App Store (leer reseñas, destilar insights; pre-venta) ·
  canal **@StarterStoryBuild** + video monetizacion (memoria
  premium-strategy-sources) · BUILDER "Tus rutinas" para Mueve Y Estira +
  mucho mas visible · boton **(i) de informacion por ejercicio** (mapea
  s107-108) · UI general mas atractiva y vistosa · SIDEBAR mas bonita/
  organizada/util (¿custom routines premium ahi? → decidir en s106) ·
  LOGROS: pacing inicial (demasiados sellos sin casi hacer nada → sesion
  gamificacion suave) + glifos de logros sin coherencia de constelaciones
  (ej. Cuello atendido, Escritorio express) → la revision COMPLETA pre-venta
  cubre TAMBIEN los de logros · estilos de TIMER Barra/Analogico feos vs
  Aro · OPS: protocolo de updates con clientes reales (base SW s102 hecha;
  falta smoke tests + rollback + versionado de datos; pre-venta) · VISUAL
  RESPIRA mas bonito/grafico (sesion de diseño, propuestas registradas) ·
  WELCOME mas vistosa/cercana/explicativa (amplia s105) · BREAKMENU sin los
  glifos de ActivityBar de la home (fix pequeño, proxima sesion de pulido) ·
  **BUG aro del timer**: en PAUSA y LARGA el aro se mueve del sitio y no
  respeta el diseño de FOCO (la fila MIN de presets solo existe en Foco →
  la columna sube; reservar el espacio o equivalente). Detalle en ROADMAP.
- **[Entre sesiones — experimento ilustraciones Caminos]** El usuario
  planea una sesion experimental aparte: ilustracion editorial como fondo
  del modulo Caminos (empieza por path.dawn, asset a
  `app/paths/illustrations/assets/`). Patron arte s84/D-4 (el usuario
  aporta, se porta literal). Si aterriza antes de s104, la Tarea 0 de git
  debe esperar cambios en `app/paths/` + assets nuevos.
