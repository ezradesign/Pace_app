# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.32.0
**Ultima sesion:** #78 -- 2026-05-17 - feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica + logro master.path.all7 (v0.32.0)
**Ultima actualizacion de este archivo:** 2026-05-17 - sesion 78
**Build entregado:** `PACE_standalone.html` v0.32.0 (605 KB; 619,615 bytes) + `index.html` (idem, copia exacta)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.32.0** (s78: titulo bump; s77: carga PathTransitions.jsx antes de PathRunner.jsx) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.32.0** (605 KB, regenerado s78) |
| `index.html` | Copia de PACE_standalone.html para Cloudflare Pages root | **v0.32.0** (s78: regenerado por build-standalone.js) |
| `app/glyphs/exercise-glyphs.jsx` | 46 glifos SVG -- 13 rediseñados en s60 | **v0.28.1** (iter parcial s60, sin cambios s61) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** (s77: NO modificado, decision 15 -- silencio en transiciones) |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.17.0** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, displayItalic | **v0.19.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes | **v0.28.9** (s71: quitar envejecido, reorden idioma→audio→ejes, ambient marginLeft) |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.16.0** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad | **v0.17.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.28.7** (s67: playPhaseSound helper + fix huecos A/B/C inhalacion) |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.28.0** (StepGlyph usa ExerciseGlyph s59, sin cambios s61) |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.28.8** (s69: WeekDots indexa weeklyStats[i] lunes-primero, hitos usa getDayIndexMondayFirst) |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.31.0** (s77b: startBtnPrimary usa var(--focus-cta) -- verde musgo #506B3E claro / #8AA776 oscuro) |
| `app/ui/TimerDial.jsx` | Anillo circular compartido (FocusTimer + PathFocusStep) | **v0.30.0** (s76, sin cambios s77) |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.32.0** (s78: + entrada master.path.all7 en maestria + glifo SVG heptagonal + IMPLEMENTED_ACHIEVEMENTS subgrupo Caminos) |
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.28.5** (s64: overflowY:hidden en data-pyv-wrap -- fix scroll vertical) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.28.4** (s63: titulo marginBottom 6->4) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.28.8** (s69: isActiveDay helper + computeYearStats unifica criterio "dia activo" = focus|breath|move>0, agua sola NO cuenta) |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.28.8** (s69: WeekBarRow elimina reorder, itera data lunes-primero) |
| `docs/WORKFLOW.md` | Protocolo de cierre de sesion Git | **v0.27.6** (nuevo s58) |
| `scripts/check-session.ps1` | Diagnostico Git solo lectura | **v0.27.6** (nuevo s58) |
| `app/state-core.jsx` | Store, loadState, rollover, history helpers, toast | **v0.32.0** (s78: PACE_VERSION bump; s77b: + constante TOAST_DURATION_MS=3000 exportada a window) |
| `app/state-timer.jsx` | addFocusMinutes, completePomodoro | **v0.28.8** (s69: getDayIndexMondayFirst en addFocusMinutes + checkFocusDayAchievement) |
| `app/state-hydrate.jsx` | addWaterGlass | **v0.28.8** (s69: getDayIndexMondayFirst en addWaterGlass) |
| `app/state-achievements.jsx` | unlockAchievement, detectores, complete*Session | **v0.32.0** (s78: + checkAllPathsCompleted + export a window; s69: getDayIndexMondayFirst en 4 escritores de weeklyStats + checkRetreatAchievement) |
| `app/state-paths.jsx` | Caminos CRUD + stats | **v0.32.0** (s78: getSuggestedPath jerarquica lastViewed>horario>anytime>catalog[0] + hook checkAllPathsCompleted en advancePathStep; s75: getSuggestedPath refactor -> lastViewed + setLastViewedPath) |
| `app/state-settings.jsx` | setLang | **v0.27.5** (nuevo s57) |
| `app/state.jsx` | Indice — re-export consolidado | **v0.29.0** (s75: + setLastViewedPath; s69: recompute*/getDayIndexMondayFirst/getMondayOf) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.31.0** (s77b: lee TOAST_DURATION_MS de window, fallback 3000ms; antes 5000 hardcoded) |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | **v0.28.9** (s71: PaceLogoImage invert+screen en oscuro) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.32.0** (s78: +8 claves -- tea/breath name+tagline ES/EN + microcopy hydrate redisenada -- path.hydrate.copy/drank/skip/glasses.today; s77: + path.runner.transition.continue) |
| `app/tokens.css` | Tokens CSS + base | **v0.31.0** (s77 + s77b: + 5 tokens transicion --path-{intro,step,outro}-ms + --path-card-{fade-ms,scale-from} + bloque .sendero-bar.lg + reglas .lg .hito-labels max-width 720 + .lg .hito-label/roman font-size 12/11 + token --focus-cta crema/oscuro + @keyframes path-orb-travel reservado; **RETIRADO**: --sendero-sticky-h, .sendero-bar.sticky y sus 4 reglas, body[data-pace-path-active], @keyframes sb-halo-fade-in) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.32.0** (s78: + path.tea timeOfDay='afternoon' + path.breath timeOfDay='anytime' -- catalogo cerrado a 7) |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.32.0** (s78: redisenio completo de PathHydrateStep -- contador Garamond clamp(72-112) + grid vasos visuales no interactivos + 2 botones mismo peso visual; 717->815 ln) |
| `app/paths/PathTransitions.jsx` | Cards intro/step/outro entre pantallas del Camino | **v0.31.0** (nuevo s77, 232 ln; s77b: render SenderoBar lg sin guard typeof) |
| `app/paths/SenderoBar.jsx` | Sendero visual del progreso interno | **v0.31.0** (s77: + prop size="lg" + prop orbVisible + orbe viajero via animateMotion sobre la curva Bezier; s77b: **prop sticky retirada** + hito-labels filtran solo done (i<currentIndex) -- comportamiento unificado en lg y CompletionScreen; 148->164 ln) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta) por coherencia con el Pomodoro) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.31.0** (s77b: CTA Comenzar usa var(--focus-cta)) |
| `manifest.json` | PWA manifest | **v0.28.5** (s65: reescrito -- PNGs, start_url /,  scope /, theme crema) |
| `sw.js` | Service Worker PWA | **v0.32.0** (s78: CACHE_NAME pace-v0.32.0) |
| `build-standalone.js` | Genera el bundle offline | **v0.28.5** (s65: añade copia a index.html tras build) |

Backups vigentes (20):
- `backups/PACE_standalone_v0.31.0_20260517.html` <- creado s78 (copia previa al rebuild v0.32.0)
- `backups/PACE_standalone_v0.30.0_20260517.html`
- `backups/PACE_standalone_v0.29.0_20260516.html`
- `backups/PACE_standalone_v0.28.12_20260516.html`
- `backups/PACE_standalone_v0.28.11_20260512.html`
- `backups/PACE_standalone_v0.28.10_20260512.html`
- `backups/PACE_standalone_v0.28.9_20260512.html`
- `backups/PACE_standalone_v0.28.8_20260512.html`
- `backups/PACE_standalone_v0.28.7_20260512.html`
- `backups/PACE_standalone_v0.28.6_20260511.html`
- `backups/PACE_standalone_v0.28.5_20260512.html`
- `backups/PACE_standalone_v0.28.4_20260512.html`
- `backups/PACE_standalone_v0.28.3_20260512.html`
- `backups/PACE_standalone_v0.28.2_20260511.html`
- `backups/PACE_standalone_v0.28.1_20260511.html`
- `backups/PACE_standalone_v0.28.0_20260511.html`
- `backups/PACE_standalone_v0.27.6_20260511.html`
- `backups/PACE_standalone_v0.27.5_20260511.html`
- `backups/PACE_standalone_v0.27.3_20260511.html`
- `backups/PACE_standalone_v0.27.2_20260509.html` (rotado `v0.27.0_20260509.html` en s78 para mantener cap de 20)

---

## Ultima sesion (resumen operativo)

**Sesion 78 - v0.32.0 - feat(camino): catalogo 5 -> 7 (path.tea + path.breath) + redisenio PathHydrateStep + getSuggestedPath jerarquica + logro master.path.all7**

### Contexto

s77+s77b cerro el ciclo UX del overlay Camino (PathTransitions
+ retirada de sticky + microcopia + CTAs `--focus-cta`). v0.31.0
publicado y sin observaciones abiertas. El catalogo seguia en 5
Caminos desde s49. s78 lo cierra a 7 y resuelve la unica incoherencia
visual restante: el PathHydrateStep del PathRunner usaba un lenguaje
distinto del HydrateModule del home (circulo 64 + emoji + 2 botones
de jerarquia desigual).

Diario: [s78](./docs/sessions/session-78-catalogo-caminos.md).

### Que se hizo

1. **NUEVO catalogo +2 entradas (`app/paths/registry.js`)**:
   - `path.tea` (timeOfDay 'afternoon'): breathe.coherent.55 +
     hydrate(opt) + focus 10 min. ~17 min, reenganche progresivo de
     sobremesa.
   - `path.breath` (timeOfDay **'anytime'** -- slot nuevo):
     breathe.478 + breathe.coherent.55. ~8 min, micropausa sin foco
     ni cuerpo.
2. **`getSuggestedPath` reescrita (`app/state-paths.jsx`)** con
   jerarquia explicita de 4 niveles:
   1. `lastViewed` (s75, preferencia del usuario).
   2. `timeOfDay` match (sabado/domingo -> 'weekend'; resto: slot
      horario actual segun hora del sistema).
   3. `'anytime'` (fallback antes de catalog[0]).
   4. `catalog[0]` (ultimo recurso).
   Preserva la inversion s75 (lastViewed wins) e incorpora la logica
   horaria como capa nueva que entra solo cuando lastViewed no aplica.
3. **Hook `checkAllPathsCompleted`** en `advancePathStep` cuando se
   cierra un Camino: dispara `setTimeout(0)` para que el detector lea
   estado ya actualizado y evite re-entradas en el reducer.
4. **`PathHydrateStep` reescrito de cero** (~50 ln -> ~108 ln en
   `app/paths/PathRunner.jsx`):
   - Contador `clamp(72-112px)` EB Garamond italic en `var(--hydrate)`
     con ` / goal` a 0.42em en `var(--ink-3)`.
   - Meta-label "Vasos hoy".
   - Grid de `goal` vasos visuales (no interactivos -- es step de
     Camino, no tracker). Replica 1:1 el patron del HydrateTracker
     del home.
   - Copy 18px Garamond italic max-width 360.
   - 2 botones del **mismo peso visual** via `btnBase` compartido --
     "Saltar" outline / "Beber" relleno var(--hydrate). Refuerza la
     opcionalidad real del paso.
5. **Logro `master.path.all7` ("Cartografa")**:
   - Glifo SVG heptagonal (7 puntos + centro + path en bucle, familia
     visual de streak.7 / streak.365).
   - Entrada en catalogo `maestria` + IMPLEMENTED_ACHIEVEMENTS bajo
     nuevo subgrupo "Caminos (1/1)".
   - Detector en `state-achievements.jsx`: exige
     `paths.completed[id].count >= 1` para cada uno de los 7. Guard
     `catalog.length >= 7` evita falsos positivos si el catalogo se
     reduce en el futuro.
6. **i18n -- 8 claves nuevas (ES/EN)**:
   - `paths.path.tea.{name,tagline}` ES "Infusion" + "Un vapor breve,
     y la tarde recobra forma." / EN "Steeping" + "A brief steam,
     and the afternoon takes shape again.".
   - `paths.path.breath.{name,tagline}` ES "Halito" + "Dos vientos
     cortos para volver." / EN "Breath" + "Two short winds to return.".
   - Microcopy hydrate redisenada: `path.hydrate.copy`
     "Si te apetece, suma un vaso.", `path.hydrate.drank` "Beber"
     (antes "He bebido", pasa de declarativo a infinitivo invitando),
     + 2 claves nuevas `path.hydrate.skip` y
     `path.hydrate.glasses.today`.
7. **Bump v0.32.0** (state-core, PACE.html, sw.js).

### Decisiones tomadas (sin consulta tras "lo mas profesional" del usuario)

- D1 -- `getSuggestedPath`: lastViewed-first preservado, logica
  horaria como capa fallback. **Razon**: preservar inversion s75
  validada por el usuario sin romperla.
- D2 -- Logros con title/desc hardcoded ES, no `t()`. **Razon**:
  consistencia con los 90+ logros existentes; introducir i18n para 1
  sola entrada generaria deuda mayor.
- D3 -- Nombres "Infusion"/"Steeping" + "Halito"/"Breath", taglines
  con lexico sensorial-objeto. **Razon**: encaja con el registro de
  Morning Glory / Spearmint / Matchstrike / Desk Lamp / Open Window.
- D4 -- Logro "Cartografa". **Razon**: encaja con "caminos" como
  dominio.
- D5 -- Glifo heptagonal en familia streak.7/streak.365. **Razon**:
  reuso del modelo visual establecido.
- D6 -- PathsLibrary 7 cards: verificar runtime, ajustar solo si rompe
  el layout. **Resultado**: modal ya scrollea via maxHeight 85vh +
  overflowY auto -- no requirio cambios.

### Validacion runtime usuario

Validado con "si, valido" tras presentacion del checklist completo
(path.tea ejecutable, path.breath ejecutable, PathHydrateStep
rediseniado, PathsLibrary 7 cards, SuggestedPathCard jerarquica,
master.path.all7, recarga durante step, i18n EN, consola limpia).
Sin observaciones que devolvieran al codigo.

### Build

- Bundle: **605 KB** (619,615 bytes; +7,412 bytes vs v0.31.0).
- 43 archivos validados (sin cambios estructurales vs s77b).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- Backup creado: `backups/PACE_standalone_v0.31.0_20260517.html`
  (605 KB). Rotado el mas antiguo: `v0.27.0_20260509.html`.

### Roadmap catalogo Caminos (s49->s51->s53->s78 COMPLETADOS)

✅ s49 -- registry.js + 5 Caminos canonicos + helpers.
✅ s51 -- SuggestedPathCard.
✅ s53 -- PathsLibrary + favoritos.
✅ s78 -- Cierre del catalogo a 7 + slot 'anytime' +
   PathHydrateStep redisenado + master.path.all7.

## Proxima sesion -- s79 (split tecnico, sin features)

### Scope propuesto

1. **Split `app/paths/PathRunner.jsx`** -- ya en 815 ln, sigue marcada
   como deuda ALTA. Candidatos a extraer:
   - `CompletionScreen` -> `app/paths/PathCompletion.jsx`.
   - 4 `Path*Step` (Breathe/Focus/Body/Hydrate) -> archivos hijos.
   - `ExitConfirmModal` + `PathTopBar` + `StepError` -> mover a
     `PathRunner.parts.jsx` o similar.
2. Tras el split, verificar:
   - PathTransitions sigue funcionando (Intro/Step/Outro).
   - getSuggestedPath con jerarquia s78 OK.
   - master.path.all7 detector dispara correctamente.
3. Sin cambios visuales ni de comportamiento -- es refactor puro.

### Precondicion bloqueante

Cierre Git de s78 publicado por el usuario (commit + push manual).

### Decisiones pendientes para el prompt s79

- Donde vive el helper `CS_ROMAN` (numerales) -- exportar de
  `state-core.jsx` o duplicar en CompletionScreen?
- `PathBreatheStep` + `PathBreatheSafetyGate` van juntos en
  `PathBreatheStep.jsx` o cada uno en su archivo?
- Conviene crear un `PathRunner.types.jsx` para `phase` y otros
  tipos compartidos?

---

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Sintetizar audio (no WAVs) | s28 | Web Audio API, 432 Hz base |
| Elastic License 2.0 | s26 | No SaaS competidores, si uso personal/comercial propio |
| Anti-truncamiento: Python write | s48-s52 | Nunca Edit tool con caracteres especiales |
| Build con TS parser real | s56 | Aborta con linea:columna exacta en cualquier error sintactico |
| Overlay via CustomEvent | s50+ | PathRunner, PathsLibrary -- evita prop drilling |
| Transiciones Camino volatiles | s77 | No persisten en paths.current. Step intermedio: advance AHORA. Ultimo: snapshot local pendingComplete + advance diferido |
| Progreso del Camino solo entre pantallas | s77b | Retirada la SenderoBar sticky de s76: vive en TransitionCards (Intro/Step/Outro) + CompletionScreen, no superpuesta sobre cada ejercicio. Razon: usuario validó en runtime que la sticky se sentia invasiva |
| Labels SenderoBar: solo hitos done | s77b | Filtro `i < currentIndex` unificado en lg y CompletionScreen. Current no se etiqueta (ya esta en grande arriba en TransitionCards), pending tampoco (sin spoiler) |
| Nuevo token --focus-cta para CTA Comenzar home | s77b | Variante mas viva y calida que --focus (#506B3E claro / #8AA776 oscuro). NO usar fuera del CTA principal de Pomodoro |
| Slot horario 'anytime' como fallback (no compite con slots fijos) | s78 | getSuggestedPath: si lastViewed no aplica, primero match de slot horario (morning/midday/afternoon/evening + weekend); si no, 'anytime' (path.breath); si no, catalog[0]. lastViewed sigue ganando siempre |
| Logro master.path.all7 ("Cartografa") = cap de 1 logro nuevo por sesion | s78 | Recorre los 7 Caminos al menos una vez. Glifo heptagonal familia streak.7/streak.365. NO meter mas logros en la misma sesion para no inflar el catalogo de golpe |
| PathHydrateStep usa mismo lenguaje visual que HydrateModule home | s78 | Contador Garamond + grid vasos + 2 botones mismo peso visual (Saltar outline / Beber relleno). Vasos NO interactivos -- es step de Camino, no tracker. Refuerza opcionalidad real |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/paths/PathRunner.jsx` | 815 | ALTA (s78: 717->815 ln por redisenio PathHydrateStep, candidato split a PathCompletion + 4xPathSteps + PathRunner.parts; programado en s79) |
| `app/i18n/strings.js` | 776 | ALTA |
| `app/main.jsx` | 600 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/state-core.jsx` | ~475 | BAJA (dentro de limite) |
| `app/shell/Sidebar.jsx` | 497 | SALE (s61, antes 630) |
