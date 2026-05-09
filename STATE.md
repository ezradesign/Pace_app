# PACE · Estado del proyecto

> **Presente + proximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesion:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no anadir) la
> seccion "Ultima sesion" de este archivo. Este archivo no debe crecer.

---

**Version actual:** v0.27.2
**Ultima sesion:** #55 -- 2026-05-09 - chore(polish): i18n sync ES/EN, a11y overlays, mobile, smoke tests (v0.27.2)
**Ultima actualizacion de este archivo:** 2026-05-09 - sesion 55
**Build entregado:** `PACE_standalone.html` v0.27.2 (544 KB)

---

## Red de seguridad -- archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | **v0.27.2** (titulo + @media mobile Caminos s55) |
| `PACE_standalone.html` | Bundle offline autocontenido | **v0.27.2** (544 KB, regenerado s55) |
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
| `app/stats/PathYearView.jsx` | Heatmap anual de Caminos | **v0.27.1** (nuevo s54) |
| `app/stats/PathStats.jsx` | Seccion Caminos en Stats | **v0.27.1** (nuevo s54) |
| `app/stats/YearView.jsx` | Heatmap anual | **v0.24.0** |
| `app/stats/StatsPanel.jsx` | Panel stats | **v0.27.1** (tab Caminos s54) |
| `app/state.jsx` | Store global + rollover + toast + history + paths | **v0.27.2** (bump version s55) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez | **v0.19.0** |
| `app/ui/Toast.jsx` | Notificaciones de logros | **v0.25.0** |
| `app/support/SupportModule.jsx` | Boton + modal Buy Me a Coffee | v0.12.8 |
| `app/ui/CowLogo.jsx` | Logo component + lockup | v0.12.8 |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | **v0.27.0** (PathsLibrary montado s53) |
| `app/i18n/strings.js` | Strings ES + EN | **v0.27.2** (321 claves ES = 321 EN, 0 diff s55) |
| `app/paths/registry.js` | Catalogo PATH_CATALOG + helpers | **v0.26.0-alpha** |
| `app/paths/PathRunner.jsx` | Runner de caminos | **v0.27.2** (a11y: role/aria-modal/Escape en PathRunner + ExitConfirmModal s55) |
| `app/paths/SuggestedPathCard.jsx` | Tarjeta sugerida home | **v0.27.0** (dual card + Ver todos s53) |
| `app/paths/PathsLibrary.jsx` | Overlay biblioteca de caminos | **v0.27.2** (a11y: aria-labelledby/Escape/focus s55) |
| `build-standalone.js` | Genera el bundle offline | **v0.26.1** (validateFileEnd + fix WARN s52) |

Backups vigentes (22 -- BORRAR MANUALMENTE los 2 mas antiguos para volver a 20):
- `backups/PACE_standalone_v0.27.1b_20260509.html` <- creado s55
- `backups/PACE_standalone_v0.27.0_20260509.html` <- creado s54
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
- `backups/PACE_standalone_v0.18.0_20260505.html` <- BORRAR
- `backups/PACE_standalone_v0.17.0_20260505.html` <- BORRAR

---

## Ultima sesion (resumen operativo)

**Sesion 55 - v0.27.1b -> v0.27.2 - chore(polish): i18n, a11y, mobile, smoke tests**

### Que se hizo

Sesion de pulido sin features nuevas tras las 6 sesiones intensas s49-s54.

**Auditoria i18n:**
- ES vs EN: 321 claves en cada bloque, 0 diferencias. V1 OK.
- Claves t() huerfanas: 0 (53 falsos positivos eran IDs de unlockAchievement). V2 OK.

**Accesibilidad overlays:**
- PathRunner: `role="dialog"`, `aria-modal="true"`, `aria-label`, Escape handler
  (redirige a ExitConfirmModal si obligatorio / abandona si opcional).
- ExitConfirmModal: `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape handler,
  focus inicial en boton Seguir.
- PathsLibrary: `aria-labelledby`, Escape handler, focus inicial en boton cerrar,
  `aria-label={t('common.close')}`, icono canonico ✕.

**Mobile CSS:**
- Anadido primer `@media (max-width:480px)` en PACE.html para componentes Caminos:
  padding reducido en .path-topbar, min-height 44px en botones touch, .path-stats-summary
  en columna, SuggestedPathCard dual colapsado.

**Smoke tests:**
- Creado `docs/qa/smoke-tests.md` con 7 escenarios completos (Pomodoro, path.dawn,
  abandon, favorito dual, libreria, stats Caminos, i18n EN).

**Build:** 544 KB, 0 errores, 0 WARN. V7 OK.

### Decisiones tomadas
- No se refactorizan archivos grandes (state.jsx, Sidebar) - aplazado a s56.
- PathYearView mobile (heatmap en 320px muy denso) aplazado a s56 como TODO.
- Backups: FS sandbox no permite borrar archivos de sesiones previas; hay 22 backups.
  Los 2 mas antiguos (v0.17.0, v0.18.0 del 2026-05-05) deben borrarse manualmente.

### Incidencia
Ninguna. Build limpio en primer intento.

### Proxima sesion (sugerencias)
- s56: Split state.jsx (1025 ln, deuda critica) o split main.jsx (600 ln)
- s56: PathYearView mobile (heatmap en 320px)
- s56: Detector logro master.midnight.never
- s56: Iconos PNG reales PWA manifest
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
| `app/state.jsx` | 1025 | ALTA -- duplica limite 500 ln |
| `app/shell/Sidebar.jsx` | 630 | MEDIA |
| `app/i18n/strings.js` | 742 | MEDIA |
| `app/achievements/Achievements.jsx` | ~500 | MEDIA |
| `app/main.jsx` | 600 | MEDIA |
