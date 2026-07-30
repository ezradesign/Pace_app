# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.72.0 (s138 — **Fase 1.5 · pulido visible**: desfase del punto guía del pomodoro MEDIDO (1003 ms a 25 min, 1999 a 45) y corregido a **0 ms** · **atmósfera** del `SessionShell` fuera de Caminos (revisa s99) + 2ª pasada de banding · **constructor premium en Mueve Y Estira** y al principio de la lista · **loto de Respira** integrado como máscara CSS con el color por token. Detalle abajo.)
**Version anterior:** v0.71.0 (s128 — **home móvil universal · «amanecer del Camino»**: el motor de geometría de la home (`home-geometry.js`) corre AHORA también en móvil/tablet garantizando CERO scroll, y la **tarjeta de Camino hace de «horizonte»** recortando el arco inferior del aro —el «amanecer» del Desktop s126 pero con Caminos—; se conserva el orden móvil Timer→Camino→Actividades. Desktop **byte-idéntico**). «Salir» de Caminos a la home es de s127/v0.70.0.
**Ultima sesion:** #138 -- 2026-07-30 - **FASE 1.5 · PULIDO VISIBLE**. Sesión de **CÓDIGO**, la primera tras nueve solo-documentales (s129–s137). Bump **v0.71.0 → v0.72.0**. **Decisión de entrada: el pomodoro-sol de s134 NO entra** —sigue sin aprobar y pasa a sesión propia por detrás de la Fase 2—; el motivo que pesó sobre los otros tres es que **habría impedido medir el ítem 1**, un desfase de milisegundos en ese mismo aro. **(1) Punto guía MEDIDO, no supuesto**: instrumentado con `MutationObserver` sobre el SVG (el muestreo por `rAF` salió inservible, el panel pinta a ~3 fps). Arco avanza en 1025 ms / punto monta en 2028 → **1003 ms** a 25 min; 1014 / 3013 → **1999 ms** a 45. **Causa confirmada por PREDICCIÓN**: el gate `progress > 0.001` ([TimerDial.jsx:110](app/ui/TimerDial.jsx)) equivale a segundos distintos según duración (1,5 s a 25 min ⇒ segundo 2; 2,7 s a 45 ⇒ segundo 3) mientras el arco avanza siempre en el segundo 1 — se predijo 2000 ms para 45 min y salieron 1999. Como `progress` es `1 - remaining/totalSec`, aritmética exacta, el umbral no protegía de nada ⇒ comparar contra `0`. **Verificado: 0 ms en los 4 presets.** **(2) Atmósfera fuera de Caminos** (revisa s99): el código estaba entero, solo había un gate `inPath ?` en tres sitios. **Consecuencia medida**: el banding se hace visible en pantallas grandes (misma rampa, más píxeles); 2ª pasada respetando la regla de s100 de no subir alphas — grano más fino y **cinco paradas** en vez de dos + hint. **(3) Constructor en Mueve Y Estira**, con prop de acento y **al principio** de ambas bibliotecas (estaba al final, tras 4 grupos: por eso no lo encontraba nadie). **SIN campo de módulo** (decisión del usuario, con un argumento que apareció leyendo el código: el registro ya mezcla los 8 grupos de ambos módulos). **Hallazgo corregido**: `handleStartExtra` marcaba `kind:'extra'` y `completeExtraSession` **no incrementa `moveSessionsTotal`** ⇒ quien hiciera sus rutinas propias desde Estira nunca progresaría hacia `move.sessions.25`. **(4) Loto**: se integra como **MÁSCARA CSS**, no como imagen — medido que el alfa del PNG es solo la silueta y el dibujo vive en la luminancia, así que la máscara se reconstruye desde la densidad de tinta y **el color lo pone un token**, que es lo que resuelve el contraste (crema sobre crema era invisible). 959 KB → **146 KB**; el primer intento pesaba 59 KB y se veía pixelado porque el alfa iba con pérdida. Sustituye al estilo `flor` (cero migración: el default ya era una flor). **Cinco correcciones del feedback en vivo**: wrap que reserva el máximo (las capas pintaban 420 con el wrap en 260 y se recortaban), un solo factor de escala (los huecos crecían **+44 %** al inhalar), giro como **animación CSS continua** (iba sobre `progress`, que avanza 1 vez/s ⇒ tirones), tinta `--breathe-2` en claro por paleta, y profundidad con halo + loto de fondo girando al revés + **respiración asimétrica**. **Extra**: salto de texto de **21 px** en Suspiro fisiológico porque `showCountdown` montaba y desmontaba el contador ⇒ altura reservada (s119), **0 px**. Consola limpia salvo un warning **PREEXISTENTE** de s116 (`Sidebar`/`BreatheSession`) → Fase 8.5. Diario: [session-138](./docs/sessions/session-138-pulido-visible.md).

**Sesion anterior:** #137 -- 2026-07-30 - **Recorrido sistemático: 10 bloques del audit × 16 fases**. SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). Se cruzaron los **Bloques 0–9** del audit, los **4 backlogs vivos de STATE**, la deuda técnica y las deudas semánticas contra el plan. **8 de 10 bloques ya estaban cubiertos.** **Convergencia encontrada**: las pills «Breve/Tranquilo/Amplio» que el backlog de s117 pedía revisar **son los botones del descanso entre series**, es decir el bug del botón fantasma → ya cubierto en 1.6, mismo ítem con dos nombres. **11 HUECOS colocados**: **§17 «Pausa PACE»** (el más importante: el BreakMenu debe RECOMENDAR una acción concreta y es el **consumidor del feedback ligero** que se captura desde s116 sin usar; responde al problema D del §27.3) → **FASE 3.5** · trocear >500 líneas —**`tokens.css` 613**, `exercise-glyphs.jsx` ~513, `Sidebar.jsx` ~510—, **a11y** (tarjetas sin teclado, onboarding sin focus trap), **tests del state (A-6)**, **import sanitizado (A-7)**, **i18n robustez I18N-2** + deudas **D-1/D-2/D-3**, **bump automático** y **timer de Mueve por timestamps** → **FASE 8.5 saneamiento** · **onboarding contextual** (Bloque 2; sin él los filtros no tienen con qué filtrar) → Fase 8 · **logros de Caminos y de Travesías** → nacen en sus Fases 6 y 7. **DECISIÓN GRANDE: Android ENTRA en v1** (Fase 9), con el coste asumido tras dárselo medido: el envoltorio de Capacitor es barato porque la app ya es estática, pero **Play Billing obliga a un SEGUNDO camino de entitlement** que choca con la licencia offline sin cuentas ⇒ ~4–6 sesiones más y dependencia de los ciclos de revisión de Google. Recomendé web primero; el usuario eligió Android igualmente. **iOS queda fuera de v1.** Consecuencia: la Fase 3 debe respetar la **arquitectura por adaptadores** desde el día uno y el entitlement seguir pasando por `state-entitlement.jsx` como punto único, o Android obliga a reescribir. **Limpieza**: se marcaron **2 entradas OBSOLETAS de STATE** que contradecían la realidad (el scrollbar del runner figuraba como «sigue sin tocar» cuando s125 lo resolvió; el §0 de alturas <720px seguía pendiente cuando s126/s128 lo cerraron). Diario: [session-137](./docs/sessions/session-137-recorrido-sistematico.md).

**Sesion anterior:** #136 -- 2026-07-30 - **Fase 2.5 definida: logros (Bloque 6)**. SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). **SEGUNDO hueco del plan destapado por la lista del usuario y no por mi auditoría** (el primero fue Respira): el **Bloque 6 del audit —logros— no estaba en ninguna fase**. Motivo del fallo: las fases se construyeron desde el feedback beta y los bloqueantes de venta, sin recorrer sistemáticamente los Bloques 0–9. **Pendiente: hacer ese recorrido completo cuando el usuario termine de soltar su lista, para que no salga un tercero.** **Item corregido con el código delante**: la lógica de «las 5 últimas miniaturas sustituyendo a las antiguas» **YA existe** ([Sidebar.jsx:376-379](app/shell/Sidebar.jsx), ordena por `unlockedAt` desc y toma 5); lo que falta es el **glifo** — hoy **toda miniatura desbloqueada pinta un `'✦'` fijo** ([Sidebar.jsx:403](app/shell/Sidebar.jsx)), por eso parecen inactivas: cambian fondo y color pero todas se ven iguales. **Muro detrás**: solo **34 glifos de logro para 106 logros** (32 %). **Decisiones del usuario**: (1) graduar con **las dos cosas** — entrega escalonada (máx 1 logro por sesión y día, resto en cola; precedente s105 de toasts aplazados en Camino) **y** revisar condiciones al alza (§15.3); (2) **RECALCULAR todo con las reglas nuevas** — **EXCEPCIÓN CONSCIENTE a §2.5 «progreso sin culpa» y §2.2 «nada de pérdida punitiva»**, avisada y elegida igualmente: alguien puede ver que ha perdido logros, así que al implementarlo hay que decidir cómo se comunica para que no parezca un bug; (3) **sello por categoría como solución de TRANSICIÓN** para los ~72 sin glifo (`CAT_META` ya tiene las 7 categorías) **+ entrada de los glifos que el usuario ya tiene diseñados**, que se portan **LITERALES** (regla s84); (4) **fase propia justo después de Mueve y Estira**, porque la matriz de logros (§15.2) y la de ejercicios (§19.2) son el mismo trabajo y sus glifos comparten criterio. Diario: [session-136](./docs/sessions/session-136-fase-2-5-logros.md).

**Sesion anterior:** #135 -- 2026-07-30 - **Fase 1.6 definida: ajustes y dos retiradas**. SOLO-DOCUMENTAL (sin bump; sigue v0.71.0). El usuario aportó 4 ítems nuevos de Ajustes y **tres hallazgos al verificarlos cambiaron el trabajo**: (1) **el idioma YA se auto-configura** en la primera apertura —`detectInitialLang()` existe desde s35 y `loadState()` lo usa ([useT.jsx:8](app/i18n/useT.jsx))—, lo que falta es la opción **«Auto» persistente** que re-evalúe en cada arranque (hoy `state.lang` queda fijo al guardarse); (2) el **botón fantasma** del descanso entre series tiene sospechoso: `transition:'all 180ms'` con `fontWeight` entre las propiedades que cambian ([TweaksPanel.jsx:290-295](app/tweaks/TweaksPanel.jsx)) ⇒ la transición **anima el peso de la fuente**; **hipótesis SIN confirmar**, hay que medir, y el mismo patrón está en `statsPanelTabStyles.tab`; (3) **ocultar el estilo de timer y «orgánico» dejaría gente ATRAPADA**: el default de `timerStyle` ya es `'aro'` ([state-core.jsx:33](app/state-core.jsx)) pero `FocusTimer.jsx:117` sigue leyendo el valor guardado y `BreatheVisual.jsx:197` conserva su rama de `organico`, así que quien los eligió no podría salir. **Decisiones del usuario**: **migrar** los valores huérfanos al cargar · ocultar con **una constante en un solo sitio** (`SHOW_TIMER_STYLE`/`SHOW_BREATH_ORGANICO`), sin borrar y con la razón anotada en `DECISIONES_TECNICAS_VIGENTES.md` para que nadie lo tome por código muerto · **«Auto» como default de instalaciones nuevas**, conservando la elección explícita de las actuales y verificando que no dispare el logro `secret.bilingual` · y **repartir los 8 ítems de pulido en dos sesiones** (1.5 visual, 1.6 ajustes) respetando la regla de un frente por sesión. Diario: [session-135](./docs/sessions/session-135-fase-1-6-ajustes.md).

**Ultima actualizacion de este archivo:** 2026-07-30 - sesion 138 (v0.72.0; se retiraron del encabezado las sesiones s134-s128, que siguen en `CHANGELOG.md` y en sus diarios — este archivo no debe crecer)
**Build entregado:** `index.html` **v0.72.0** (artefacto CANONICO de web/PWA: 7 laminas + **loto de Respira** + fuentes como ARCHIVO + precache en `sw.js` + `<link rel="manifest">`; verificado en el artefacto, cero data URIs). **`PACE_standalone.html` sigue en v0.71.0 A PROPOSITO** — decision s134: es un export BAJO DEMANDA y ya no se regenera en cada cierre; se restauro tras el build. Para regenerarlo: `node build-standalone.js` y rotar a `backups/`.

---

## Red de seguridad -- archivos vivos

> Mapa de archivos y **version actual**. El HISTORIAL por archivo (que sesion cambio que) se
> archivo en [`docs/archive/RED_DE_SEGURIDAD_HISTORICO.md`](docs/archive/RED_DE_SEGURIDAD_HISTORICO.md);
> para el detalle de un cambio concreto, `CHANGELOG.md` y `docs/sessions/`.

| Archivo | Rol | Version |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.72.0** |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.69.0** |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.72.0** |
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
| `app/custom/CustomRoutines.jsx` | Seccion "Tus rutinas" en MoveLibrary (locked/empty/cards + crear) +… | **v0.72.0** |
| `app/custom/CustomBuilder.jsx` | Modal constructor 2 vistas (editor con steppers/reordenar/borrar 2-toques +… | **v0.38.0** |
| `app/state-custom.jsx` | CUSTOM_LIMITS + CRUD de customRoutines (sanitize + lectura defensiva) | **v0.38.0** |
| `app/i18n/content/custom.js` | Patch EN del registro: custom.ex.<name ES>.{name,cue} + custom.cat.*.label | **v0.54.0** |
| `app/glyphs/exercise-glyphs.jsx` | 47 glifos SVG line-art para Move/Stretch (sistema 1) + `ExerciseGlyph` | **v0.54.0** |
| `app/glyphs/achievement-glyphs.jsx` | 34 glifos SVG heraldica para Logros (sistema 2) -- strings de SVG… | **v0.33.3** |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standal… |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.58.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.72.0** |
| `app/ui/SessionShell.responsive.js` | CSS responsive de las sesiones (IIFE que inyecta… | **NUEVO s116** |
| `app/ui/SessionFeedback.jsx` | Bloque de feedback del cierre («¿Te ayudó esta pausa?») — B2.2b-2 | **NUEVO s116** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, PremiumSeal, displayItalic | **v0.44.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.52.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes (ejes + agua + notificacion + **Sesiones** + reset + legal… | **v0.58.0** |
| `app/tweaks/TweaksData.jsx` | Seccion "Tus datos" -- Export/Import JSON + msg + iconos + tweaksDataStyles | **v0.52.0** |
| `app/tweaks/PremiumSection.jsx` | Superficie premium display-only (sello + input licencia disabled + copy… | **v0.34.5** |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.72.0** |
| `app/breathe/assets/loto.webp` | Loto de Respira como **MASCARA CSS** (640x640, 146 KB, alfa = densidad de tinta; el color lo pone el token) | **NUEVO s138** |
| `scripts/ingest-loto.js` | Ingesta del loto: recorte + mascara desde luminancia + WebP con alfa SIN perdida. Regla D-4: si llega arte nuevo se RE-CORRE, no se sustituye el .webp a mano | **NUEVO s138** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad (define `RoutineCard`, compartido por… | **v0.59.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.72.0** |
| `app/move/MoveModule.jsx` | MoveLibrary + **MoveSession dispatcher** (legacy vs v1) + StepGlyph… | **v0.72.0** |
| `app/move/move.data.js` | `MOVE_ROUTINES` (14 rutinas) + `getMoveRoutine` — extraido de MoveModule | **v0.64.0** |
| `app/move/MoveSessionV1.jsx` | Runner del **contrato de pasos v1** por MODO (place/work/change + side) | **v0.72.0** |
| `app/move/MoveSessionV1.support.jsx` | Soporte sin UI del runner v1: constantes + helpers de método/duración + CSS… | **v0.68.0** |
| `app/custom/exercise-aliases.js` | `VISUAL_ALIAS` + `resolveVisualId` — identidad visual compartida (visualId) | **NUEVO s110** |
| `app/extra/ExtraModule.jsx` | Modulo Estira (EXTRA_ROUTINES + getExtraRoutine) | **v0.72.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.52.0** |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.67.0** |
| `app/focus/useCountdown.jsx` | Motor de cuenta atras timestamp-based compartido (FocusTimer home +… | **v0.47.0** |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.72.0** |
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
| `app/state-core.jsx` | Store, loadState, rollover, migraciones, toast | **v0.72.0** |
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
| `app/main.jsx` | Orquestador puro (composicion + state + handlers + JSX root) | **v0.72.0** |
| `app/main/home-geometry.js` | Ayudante de geometría de la HOME **Desktop**: mide y publica en `:root`… | **v0.71.0** |
| `app/main/_responsive.js` | IIFE: inyecta `<style id="pace-main-responsive-css">` con reglas @media… | **v0.71.0** |
| `app/main/TopBar.jsx` | Tabs Foco/Pausa/Larga + 3 iconos top-right (Stats prop / Logros CustomEvent /… | **v0.33.2** |
| `app/main/ActivityBar.jsx` | 4 chips Respira/Estira/Mueve/Hidratate + 4 iconos SVG inline… | **v0.33.2** |
| `app/i18n/strings/_bootstrap.js` | Crea window.PACE_STRINGS = { es:{}, en:{} } vacio | **v0.33.1** |
| `app/i18n/strings/ui.js` | i18n shell UI: welcome + support + sidebar + topbar + activity + settings +… | **v0.72.0** |
| `app/i18n/strings/sessions.js` | i18n actividades vivas: session + common + lib + focus + breathe + move +… | **v0.72.0** |
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
| `sw.js` | Service Worker PWA | **v0.72.0** |
| `app/ui/UpdatePrompt.jsx` | Aviso de version nueva del SW ("Actualizar / Luego") | **v0.47.0** |
| `app/focus/FocusTimer.support.jsx` | Helpers sin UI del Pomodoro: `getFocusDescriptorKey` + `maybeNotifyFocusEnd`… | **v0.67.0** |
| `app/focus/FocusTimer.parts.jsx` | Piezas de UI del Pomodoro extraídas: `MinutesPicker` (selector de duración… | **NUEVO s124** |
| `build-standalone.js` | Genera el bundle offline (AHORA compilador: Etapa A) | **v0.72.0** |
| `.claude/static-server.js` | Mini servidor estatico del preview (s80) | **v0.49.0** |

## Ultima sesion -- lo que sigue vivo

> El informe operativo de cada sesion (cambios entregados y verificacion) vive en su diario
> en [`docs/sessions/`](./docs/sessions/) y destilado en [`CHANGELOG.md`](./CHANGELOG.md).
> Aqui solo lo que sigue VIVO: diferido y pendiente.

### Diferido (documentado, NO ejecutado)

- ~~**s125 — scrollbar del runner v1**~~ **RESUELTO en s125/v0.68.0** (barra oculta conservando el scroll, confinada a v1 con `:has()`). Entrada OBSOLETA detectada en el recorrido de s137; se conserva el texto por su diagnostico medido:
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
  - ~~**§0 solapamiento responsive a alturas <720px**~~ **RESUELTO en s126/v0.69.0 y s128/v0.71.0** (composicion proporcional + horizonte + squeeze, y motor universal en movil). Entrada OBSOLETA detectada en s137: el aro grande fijo + la
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

## Proxima sesion -- FASE 1.6: AJUSTES Y DOS RETIRADAS

> Orden de trabajo vigente: seccion «Camino a v1.0» de [`ROADMAP.md`](./ROADMAP.md) (15 fases).
> **FASE 1 cerrada** (plan + §37 + precio + artefactos). **FASE 1.5 cerrada en s138/v0.72.0.**

Cuatro items, ya definidos en el ROADMAP:

1. **Ocultar el estilo de timer** (queda siempre «aro») y **ocultar «organico»** del circulo de
   respiracion. **Sin borrar**: una constante por opcion en un solo sitio (`SHOW_TIMER_STYLE`,
   `SHOW_BREATH_ORGANICO`), reversible en una linea, con la razon anotada en
   `DECISIONES_TECNICAS_VIGENTES.md` para que nadie lo borre creyendo que es codigo muerto.
2. **Migracion de valores huerfanos** — la parte que no se ve y sin la cual lo anterior rompe.
   `FocusTimer.jsx:117` sigue leyendo `state.timerStyle` y `BreatheVisual.jsx` conserva su rama de
   `organico`, asi que quien los eligio **queda atrapado** si solo se ocultan de la UI.
3. **BUG del boton fantasma** del descanso entre series. Sospechoso: `transition:'all 180ms'` con
   `fontWeight` entre lo que cambia (`TweaksPanel.jsx:290-295`) ⇒ **anima el peso de la fuente**.
   **Hipotesis SIN confirmar: MEDIR antes de tocar** (en s138 la causa «evidente» del punto guia si
   se confirmo, pero solo despues de predecir su comportamiento en otro preset). Mismo patron en
   `statsPanelTabStyles.tab`: revisarlo de paso.
4. **Idioma «Auto»**: tercera opcion del selector y default de instalaciones NUEVAS, reevaluando en
   cada arranque con `detectInitialLang()` (`useT.jsx:8`). Las instalaciones actuales conservan su
   eleccion explicita. **Verificar** que no dispare el logro secreto `secret.bilingual`.

**Criterio de cierre:** ninguna opcion retirada deja a nadie atrapado, el bug medido antes de
tocarlo, y el «Auto» verificado cambiando de verdad el idioma del sistema.

**ABIERTO de s138 (decision del usuario pendiente):** los **aros** del visual de Respira. El usuario
los senalo dos veces («el doble circulo simple funciona pero se puede mejorar»); s138 les anadio
halo, loto de fondo contrarrotando y respiracion asimetrica, pero **siguen siendo dos hairlines**.
Falta direccion suya sobre que quiere en su lugar — no es un bug, es criterio visual (regla D-4).

**TRES REPORTES DEL USUARIO tras cerrar s138** (van con lo anterior, mismo bloque de Respira):

0. **REGRESION de s138 — el visual de Respira no cabe.** Reportado como tres sintomas que son UN
   solo hecho: (a) el circulo y el loto «estan muy arriba», (b) aparecio una barra de scroll dentro
   de la actividad, (c) con el scroll bajado el aro exterior se corta por arriba. Medido:
   `BreatheVisual.jsx:127` paso el wrap de 260x260 fijos a `min(400px, 84vw, 56vh)` => 400 px de
   visual sin descontar header + texto de fase + contador + footer; `SessionShell.jsx:60` tiene
   `overflowY:auto` desde s112 (red de seguridad, correcta) => al desbordar sale la barra; y
   `SessionShell.jsx:64` centra con `margin:auto`, que **alinea ARRIBA al desbordar** => de ahi
   «muy arriba». El invariante de s138 (el wrap reserva el maximo) protege al visual de recortarse
   contra SU PROPIA caja, no contra el presupuesto vertical de la pantalla.
   **Regla de scroll que fija el usuario:** nada de barra en el home ni DENTRO de una actividad en
   curso; en los submenus de seleccion de actividad si se acepta de momento (se optimizaran aparte).
   Precedente a seguir: s125 oculto la BARRA conservando el overflow, confinada con `:has()`
   (`MoveSessionV1.support.jsx:216-229`). Ocultar la barra es el cinturon; el arreglo real es que el
   visual se dimensione contra la altura disponible del centro, no contra `vh` en crudo.

1. **La 2a capa del loto lee como «solo un zoom».** Peticion: que su TRANSPARENCIA tambien se mueva
   (girar / contragirar), no solo escalar. Ojo al diagnosticar: el loto de fondo YA contragira
   (`BreatheVisual.jsx:265`, `gira(450, -1)`), pero a 450 s/vuelta y opacidad 0,10-0,16 el
   movimiento es **imperceptible** — por eso se percibe como zoom. Lo que falta no es el giro sino
   que se NOTE: modular la opacidad en el tiempo, acelerar la contrarrotacion, o ambas.
2. **Siguen viendose las lineas del degradado** (captura en PC, pantalla «Reten sin aire» de Rondas
   express, paleta clara). La 2a pasada de s138 solo toco `sessionAtmosphere`
   (`SessionShell.jsx:123-130`). Quedan **sin tratar** los radiales de 2 paradas y sin grano:
   `BreatheSession.jsx:303` (circulo de retencion, el de la captura) y `BreatheVisual.jsx:244`
   (halo del visual «flor»). `BreatheVisual.jsx:316` es de `organico`, que la Fase 1.6 retira.

**Lo que NO entra:** nada de la Fase 2 (nombres, glifos, descripciones, nivel/intensidad,
preview) — esa arranca con su sesion de AUDITORIA y matriz §19.2 de los 92 pasos.

## Decisiones activas -- indice

> El TEXTO COMPLETO de cada decision vive en
> [`docs/product/DECISIONES_TECNICAS_VIGENTES.md`](docs/product/DECISIONES_TECNICAS_VIGENTES.md) (GOBIERNA).
> Aqui solo el indice, para que este archivo siga siendo ligero en cada arranque.
> **Antes de tocar un subsistema, leer su fila alli.**

| Decision | Desde |
|---|---|
| **Atmosfera del `SessionShell` en TODA sesion, no solo en Camino** — REVISA s99 | s138 |
| **El arte de linea del usuario se integra como MASCARA CSS, no como imagen** | s138 |
| **Un visual que respira reserva su MAXIMO en el wrap y escala con UN SOLO factor** | s138 |
| **Movimiento continuo = animacion CSS; NUNCA derivado de `progress`** | s138 |
| **Las rutinas propias NO pertenecen a un modulo y acreditan SIEMPRE por `completeMoveSession`** | s138 |
| **El punto guia del aro se monta con `progress > 0`, sin umbral** | s138 |
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
| `app/state-core.jsx` | 461 | BAJA (s138: solo el string de version; s106: +10 del profile; s101: split a state-history.jsx) |
| `app/focus/FocusTimer.jsx` | 496 | **MEDIA** (s108: +3 ln de la llamada al permiso; s102: +37 ln de notificacion+persistencia -- AL BORDE del tope; los helpers ya viven en FocusTimer.support.jsx, la proxima adicion al modulo Foco debe ir alli o a un split del MinutesPicker) |
| `app/ui/SessionShell.jsx` | 352 | BAJA (s138: +16 ln de la 2a pasada anti-banding del wash; s116: CSS responsive EXTRAIDO a `SessionShell.responsive.js`) |
| `app/move/MoveSessionV1.jsx` | **500** | **ALTA -- EN EL TOPE** (s138: +2 ln del comentario de atmosfera y llega EXACTO al limite de 500 de CLAUDE.md; el proximo anadido va SI O SI a `MoveSessionV1.support.jsx`) |
| `app/i18n/strings/ui.js` | 395 | BAJA (s138: etiqueta del visual Flor -> Loto, ES+EN; dominio mas grande del split) |
| `app/i18n/strings-content.js` | -- | SALE (s92: troceado en `app/i18n/content/` breathe 94 + move 186 + extra 202 ln al superar ~470 con F6) |
| `app/breathe/BreatheVisual.jsx` | 377 | BAJA (s138: 236 -> 377 por el loto -- 5 capas, keyframes inyectados y el porque de cada medida; margen amplio) |
| `app/glyphs/exercise-glyphs.jsx` | 554 | BAJA (s84, dentro de limite tras port; iter cerrado 31/46 aprobados) |
| `app/achievements/Achievements.jsx` | 184 | SALE (s83, antes 409 -- split en achievements/catalog.js + glyphs/achievement-glyphs.jsx) |
| `app/main.jsx` | 355 | BAJA (s138: +14 ln del enrutado de credito de las rutinas propias; s82: split en main/_responsive + TopBar + ActivityBar) |
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
