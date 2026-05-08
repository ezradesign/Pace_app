# Auditoria de tamaños de archivos - 2026-05-08
# Sesion 52 - solo lectura, sin refactorizaciones

## Archivos > 500 lineas (DEUDA TECNICA)

| Lineas | Archivo | Notas |
|---|---|---|
| 935 | `app/state.jsx` | store global - candidato a split por dominio |
| 719 | `app/i18n/strings.js` | catalogo i18n - aceptable, crece con features |
| 631 | `app/shell/Sidebar.jsx` | shell principal - candidato a split |
| 600 | `app/main.jsx` | orquestador + TopBar + ActivityBar - candidato a split |
| 596 | `app/focus/FocusTimer.jsx` | modulo foco - aceptable, logica compleja |

## Archivos en limite (400-500 lineas)

| Lineas | Archivo |
|---|---|
| 479 | `app/tweaks/TweaksPanel.jsx` |
| 437 | `app/support/SupportModule.jsx` |
| 435 | `app/paths/PathRunner.jsx` |
| 403 | `app/achievements/Achievements.jsx` |

## Todos los archivos (ordenados por tamaño)

| Lineas | Archivo |
|---|---|
| 935 | `app/state.jsx` |
| 719 | `app/i18n/strings.js` |
| 631 | `app/shell/Sidebar.jsx` |
| 600 | `app/main.jsx` |
| 596 | `app/focus/FocusTimer.jsx` |
| 479 | `app/tweaks/TweaksPanel.jsx` |
| 437 | `app/support/SupportModule.jsx` |
| 435 | `app/paths/PathRunner.jsx` |
| 403 | `app/achievements/Achievements.jsx` |
| 394 | `app/stats/StatsPanel.jsx` |
| 350 | `app/ui/Sound.jsx` |
| 348 | `app/breathe/BreatheSession.jsx` |
| 335 | `app/ui/SessionShell.jsx` |
| 333 | `app/welcome/WelcomeModule.jsx` |
| 328 | `app/move/MoveModule.jsx` |
| 325 | `app/stats/YearView.jsx` |
| 320 | `app/ui/Primitives.jsx` |
| 289 | `app/ui/CowLogo.jsx` |
| 254 | `app/i18n/strings-content.js` |
| 200 | `app/breathe/BreatheVisual.jsx` |
| 176 | `app/breakmenu/BreakMenu.jsx` |
| 171 | `app/breathe/BreatheLibrary.jsx` |
| 119 | `app/stats/WeeklyStats.jsx` |
| 103 | `app/extra/ExtraModule.jsx` |
| 94 | `app/paths/SuggestedPathCard.jsx` |
| 89 | `app/paths/registry.js` |
| 81 | `app/hydrate/HydrateModule.jsx` |
| 75 | `app/ui/Toast.jsx` |
| 62 | `app/tweaks/TweakSecretsWatcher.jsx` |
| 56 | `app/i18n/useT.jsx` |

## Resumen

- Total archivos: 30
- Archivos > 500 lineas (deuda): 5
- Lineas totales de codigo: 9737
- Limite del proyecto: 500 lineas por archivo (CLAUDE.md)

## TODO para sesiones futuras

Los siguientes archivos superan el limite y deberian trocearse
cuando se toque el archivo por otro motivo (no como sesion dedicada):

- `app/state.jsx` (934): dividir en state-core.jsx + state-paths.jsx + state-achievements.jsx
- `app/shell/Sidebar.jsx` (630): extraer SidebarTrail.jsx o SidebarStats.jsx  
- `app/main.jsx` (599): extraer TopBar.jsx y ActivityBar.jsx a archivos propios
- `app/focus/FocusTimer.jsx` (595): dividir FocusTimer + FocusTimerVisuals
- `app/i18n/strings.js` (718): aceptable por naturaleza del catalogo, baja prioridad
