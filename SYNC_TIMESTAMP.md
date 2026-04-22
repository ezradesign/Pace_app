# Pace_app — Sync timestamp

**Última sincronización:** 2026-04-22 · 19:55 (hora local España, CEST)
**Versión empaquetada:** v0.11.7
**Sesión:** #12 — Barra horizontal del sidebar: logo ~2.5× + contadores centrados + iconos gráficos

## Qué contiene esta carpeta

Espejo 1:1 del proyecto PACE listo para pegar sobre la carpeta local de GitHub Desktop del usuario. Incluye:

- Docs raíz: `CLAUDE.md`, `STATE.md`, `CHANGELOG.md`, `README.md`, `ROADMAP.md`, `HANDOFF.md`, `DESIGN_SYSTEM.md`, `CONTENT.md`.
- Entry points: `PACE.html` (dev modular) + `PACE_standalone.html` (v0.11.7, ~174 KB).
- Todo el árbol `app/**` (14 JSX + tokens.css + pace-logo.png).
- Backups recientes en `backups/`: `v0.11.5_20260422` + `v0.11.6_20260422`.

## Estado de la app

✅ **Estable y sin crashear.** Verificado en esta sesión:
- `PACE.html` carga limpio (solo el warning estándar de Babel in-browser).
- Sidebar verificado con `eval_js`: logo rendered a 261×146 px (antes ~55 px), contadores centrados con iconos SVG (tomate/espiral/llama), chevron de colapsar flotante en esquina superior-derecha.
- `PACE_standalone.html` regenerado a v0.11.7 (~174 KB, ~2 KB más que v0.11.6 por los 3 SVG icons nuevos).

## Cambios respecto a v0.11.6

**Barra horizontal del sidebar** — petición del usuario: logo más grande + contadores centrados con iconografía propia.

- `app/ui/CowLogo.jsx`: `PaceLogoImage.maxWidth` 240 → 600 (y en la llamada desde `PaceWordmark`).
- `app/shell/Sidebar.jsx`:
  - `logoRow` → `logoBar` (centrado, márgenes negativos laterales para ganar espacio).
  - Chevron de colapsar sale de la fila del logo → botón flotante top-right (`toggleFloating`).
  - Contadores reestructurados: de `# 01 | ↻ 00 | ◉ 01` a una fila centrada con pills `<SVG> + <num>` y divisores verticales finos.
  - 3 iconos SVG nuevos: `PomodoroIcon` (tomate), `RoundsIcon` (espiral), `StreakFlameIcon` (llama).
  - `position: relative` en `sidebarStyles.root` como contexto del botón flotante.
- `app/state.jsx`: PACE_VERSION bump v0.11.6 → v0.11.7.
- `PACE.html`: title bump a v0.11.7.

## Commit sugerido

```
v0.11.7 · Barra horizontal del sidebar: logo 2.5× + iconos gráficos

- Logo ampliado ~2.5× (maxWidth 240 → 600). Ocupa toda la franja superior
  del sidebar sin caps artificiales. Altura rendered ~55px → ~146px.

- Chevron de colapsar reubicado: sale de la fila del logo y se convierte
  en botón flotante (position:absolute) en la esquina top-right. El logo
  ya no comparte espacio horizontal con ningún otro elemento.

- Contadores #/↻/◉ reestructurados: de alinear a la izquierda con
  caracteres tipográficos a una fila centrada con pills SVG + número
  separadas por un divisor vertical fino.

- 3 iconos SVG nuevos sustituyen los caracteres tipográficos:
  · PomodoroIcon (tomate)   en vez de #  (pomodoros hoy)
  · RoundsIcon   (espiral)  en vez de ↻  (rondas largas)
  · StreakFlameIcon (llama) en vez de ◉  (días seguidos)

- logoRow → logoBar (justify-center + margin negativos para invadir el
  padding del sidebar). sidebarStyles.root con position:relative como
  contexto del botón flotante.

PACE_standalone.html regenerado a v0.11.7 (~174 KB).
Rotado backups/PACE_standalone_v0.11.6_20260422.html.
```

## Nota

La regla de "carpeta Pace_app siempre lista antes de quedarse sin contexto" se respeta en esta sesión: la app está estable, documentada y la carpeta espejo refleja una versión sin crashear.
