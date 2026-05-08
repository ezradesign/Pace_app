# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.27.0
**Ultima sesion:** #53 -- 2026-05-08 - feat(paths): Caminos parte 2 - PathsLibrary, favoritos, Repetir, dual SuggestedPathCard
**Ultima actualizacion de este archivo:** 2026-05-08 - sesion 53
**Build entregado:** `PACE_standalone.html` v0.27.0 (526 KB)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.27.0** (script PathsLibrary.jsx anadido s53) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.27.0** (526 KB, regenerado s53) |
| `LICENSE` | Elastic License 2.0 en la raiz | Sin cambios desde v0.12.9 |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/Sound.jsx` | Sonidos sintetizados Web Audio | **v0.21.0** |
| `app/ui/SessionShell.jsx` | Cascara compartida de sesiones activas | **v0.17.0** |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, displayItalic | **v0.19.0** |
| `app/tweaks/TweakSecretsWatcher.jsx` | Detectores de secretos | **v0.22.0** |
| `app/tweaks/TweaksPanel.jsx` | Panel de Ajustes | **v0.22.0** |
| `app/breathe/BreatheVisual.jsx` | Respiracion - visual + getSequence | **v0.16.0** |
| `app/breathe/BreatheLibrary.jsx` | Respiracion - biblioteca + seguridad | **v0.17.0** |
| `app/breathe/BreatheSession.jsx` | Respiracion - sesion guiada | **v0.20.0** |
| `app/move/MoveModule.jsx` | Modulo Mueve | **v0.21.0** |
| `app/extra/ExtraModule.jsx` | Modulo Estira | **v0.17.0** |
| `app/hydrate/HydrateModule.jsx` | Tracker de vasos | **v0.21.0** |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | **v0.19.0** |
| `app/focus/FocusTimer.jsx` | Modulo Foco (pomodoro) | **v0.20.0** |
| `app/breakmenu/BreakMenu.jsx` | Menu post-Pomodoro | **v0.15.0** |
| `app/achievements/Achievements.jsx` | Catalogo + coleccion | **v0.25.3** |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.24.0** |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.24.0** |
| `app/state.jsx` | Store global + rollover + toast + history + paths | **v0.27.0** (setFavoritePath, clearFavoritePath, toggleFavoritePath anadidos s53) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.25.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | v0.12.8 |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.27.0** (11 claves nuevas s53) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.27.0** (boton Repetir en CompletionScreen s53) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.27.0** (dual card + Ver todos s53) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.0** (nuevo s53) |
| `build-standalone.js` | Genera el bundle offline | **v0.26.1** (validateFileEnd + fix WARN s52) |

Backups vigentes (21 -- TODO manual: borrar `backups/PACE_standalone_v0.16.0_20260505.html` para dejar margen):
- `backups/PACE_standalone_v0.27.0_20260508.html` <- creado s53
- `backups/PACE_standalone_v0.26.0_20260508.html`
- `backups/PACE_standalone_v0.26.0-alpha_20260508.html`
- `backups/PACE_standalone_v0.25.4_20260508.html`
- `backups/PACE_standalone_v0.25.2_20260508_pre48d.html`
- `backups/PACE_standalone_v0.25.2_20260507.html`
- `backups/PACE_standalone_v0.25.1_20260507_pre48c.html`
- `backups/PACE_standalone_v0.25.1_20260507.html`
- `backups/PACE_standalone_v0.25.0_20260507.html`
- `backups/PACE_standalone_v0.25.0_20260507_pre48.html`
- `backups/PACE_standalone_v0.24.0_20260506.html`
- `backups/PACE_standalone_v0.23.0_20260506.html`
- `backups/PACE_standalone_v0.22.1_20260506.html`
- `backups/PACE_standalone_v0.22.0_20260506.html`
- `backups/PACE_standalone_v0.21.0_20260506.html`
- `backups/PACE_standalone_v0.20.0_20260506.html`
- `backups/PACE_standalone_v0.19.1_20260505.html`
- `backups/PACE_standalone_v0.18.0_20260505.html`
- `backups/PACE_standalone_v0.17.0_20260505.html`
- `backups/PACE_standalone_v0.16.0_20260505.html` <- BORRAR

---

## Ultima sesion (resumen operativo)

**Sesion 53 - v0.26.1 -> v0.27.0 - feat(paths): Caminos parte 2**

### Que se hizo

Segunda parte del sistema de Caminos. Todo en 7 archivos modificados / 1 creado.

**Creado:**
- `app/paths/PathsLibrary.jsx` (168 ln) -- overlay modal con los 5 caminos del catalogo, toggle favorito por camino, badges "Hecho hoy" / "Favorito", boton Comenzar.

**Modificado:**
- `app/state.jsx` -- tres funciones nuevas: `setFavoritePath`, `clearFavoritePath`, `toggleFavoritePath`. Todas exportadas a window. Bump PACE_VERSION v0.26.1 -> v0.27.0.
- `app/paths/PathRunner.jsx` -- boton "Repetir camino" en CompletionScreen (secundario, llama `startPath(snapshot.pathId)` tras `onBack()`).
- `app/paths/SuggestedPathCard.jsx` -- reescrito: subcomponente `PathMiniCard` reutilizable, logica dual (favorito + sugerido por hora si son distintos), boton "Ver todos" -> CustomEvent pace:open-paths-library.
- `app/i18n/strings.js` -- 11 claves nuevas x 2 idiomas (ES + EN): paths.library.*, paths.suggested.*, paths.runner.repeat, path.card.done/start.
- `PACE.html` -- script PathsLibrary.jsx anadido, titulo v0.27.0.
- `app/main.jsx` -- `<PathsLibrary />` montado junto a `<PathRunner />`.

**Validacion:** Build 526 KB, 0 WARN, 0 ERRORs. 8/8 checks OK.

### Decisiones tomadas
- Sidebar sin entrada de Caminos -- el sidebar no tiene items de navegacion (es decorativo/informativo: streak, trail visual, achievements preview). Anadir un nav item romperia la coherencia.
- Apertura de PathsLibrary via CustomEvent -- mismo patron que Achievements, evita prop drilling.
- Dual SuggestedPathCard solo cuando favorito != sugerido por hora -- evita duplicado cuando el usuario ha puesto como favorito el camino del momento.

### Proxima sesion (backlog)
- Detector `master.midnight.never` (logro no interrumpir el sueno)
- Iconos PNG reales para PWA manifest
- Claves offline Lifetime/Pase en TweaksPanel
- Split state.jsx (935 ln) -- deuda tecnica critica, supera limite 500 ln
- Split main.jsx (600 ln) -- cerca del limite

TODO manual pendiente: borrar `backups/PACE_standalone_v0.16.0_20260505.html`

---

## Decisiones activas

| Decision | Desde | Detalle |
|---|---|---|
| Sintetizar audio (no WAVs) | s28 | Web Audio API, 432 Hz base |
| Elastic License 2.0 | s26 | No SaaS competidores, si uso personal/comercial propio |
| Anti-truncamiento: Python write | s48-s52 | Nunca Edit tool con caracteres especiales |
| Build con validateFileEnd | s52 | Aborta si JS/JSX truncado o comentarios desbalanceados |
| WARN allowlist (SupportModule, Achievements) | s52 | Falsos positivos conocidos de template literals |
| Overlay via CustomEvent | s50+ | PathRunner, PathsLibrary -- evita prop drilling |

---

## Deuda tecnica activa

| Archivo | Lineas | Prioridad |
|---|---|---|
| `app/state.jsx` | 958 | ALTA -- supera limite 500 ln |
| `app/shell/Sidebar.jsx` | 630 | MEDIA |
| `app/i18n/strings.js` | 742 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/main.jsx` | 600 | MEDIA |
