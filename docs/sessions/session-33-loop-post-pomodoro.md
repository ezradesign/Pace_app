# Sesión 33 · v0.15.0 · Loop post-Pomodoro

**Fecha:** 2026-05-04
**Versión resultante:** v0.15.0 (minor · loop post-Pomodoro)
**Rama:** main

---

## Objetivo

1. Regenerar `PACE_standalone.html` (pendiente desde sesión 32; herramienta
   `super_inline_html` no disponible en este entorno).
2. Implementar el loop post-Pomodoro: reestructurar `BreakMenu` para que
   tras cada bloque sugiera activamente la actividad que el usuario ha hecho
   menos ese día.

---

## Qué se hizo

### Bloque 1 — Regeneración del standalone

La herramienta `super_inline_html` del entorno anterior (Claude Projects) no
existe en Claude Code CLI. Se creó `build-standalone.js`, un script Node.js
que replaca su función:

1. Lee `PACE.html`.
2. Reemplaza `<link rel="stylesheet" href="app/tokens.css">` con `<style>` inline.
3. Reemplaza cada `<script type="text/babel" src="app/...">` con el contenido
   del archivo inlineado (sin atributo `src`).
4. Convierte `<img id="pace-logo-src" src="app/ui/pace-logo.png">` a data URI
   base64 para que el logo funcione offline.
5. Los scripts CDN (React 18.3.1, ReactDOM, Babel 7.29.0) se mantienen como
   referencias externas — ya estaban así en el standalone anterior.

El script se ejecuta con `node build-standalone.js` y genera el standalone
en el mismo directorio. Salida: `~364 KB` (vs `~371 KB` del standalone previo
generado con `super_inline_html` — diferencia debida a whitespace/formato).

Backup del standalone anterior: `backups/PACE_standalone_v0.14.0_20260504.html`
(5 backups, al límite — eliminar el más antiguo en la próxima sesión si aparece
uno nuevo).

### Bloque 2 — BreakMenu con rotación inteligente

**Problema:** el `BreakMenu` mostraba siempre las 3 opciones en el mismo orden
(Respira / Muévete / Hidrátate). Si el usuario ya había respirado, el menú no
lo reflejaba ni lo orientaba hacia lo que faltaba.

**Solución:** función `computeScore(key, state)` que puntúa cada opción según
el estado del día:

| Opción | Score |
|---|---|
| Respira | `plan.respira ? 0 : 2` |
| Muévete | `plan.muevete ? 0 : 2` |
| Agua | `water.today === 0 → 3` · `today < goal → 1` · `goal met → 0` |

El agua tiene escala 0-3 (vs 0-2 del resto) para priorizar una primera toma si
el usuario no ha bebido nada. Las 3 opciones se ordenan por score descendente.
El sort es estable: los empates conservan el orden original (Respira > Muévete
> Agua) — esto sirve como rotación de desempate implícita según cuál se hizo
primero.

**Señales visuales añadidas:**
- Carta recomendada (posición 0, score > 0): tag `Para ti` en verde focus.
- Cartas ya hechas hoy (score 0): borde muted `var(--line)` + punto semitransparente
  color-módulo en esquina superior derecha + desc cambia a "Ya hecho hoy · otra
  ronda si quieres".
- Los atajos B/M/H siguen mapeados por actividad (no posición), así el
  reordenamiento no los rompe.

**Estado leído:** `getState()` en el render (snapshot al abrir el modal). No se
usa `usePace()` hook porque el BreakMenu se abre post-Pomodoro y el estado no
cambia mientras está visible.

---

## Archivos

| Archivo | Cambio |
|---|---|
| `app/breakmenu/BreakMenu.jsx` | `computeScore` + sort + tag "Para ti" + done indicator |
| `app/state.jsx` | `PACE_VERSION` `'v0.14.2'` → `'v0.15.0'` |
| `PACE.html` | Título `v0.14.0` → `v0.15.0` |
| `PACE_standalone.html` | Regenerado ~364 KB |
| `build-standalone.js` | **Nuevo** — reemplaza `super_inline_html` |
| `backups/PACE_standalone_v0.14.0_20260504.html` | **Nuevo** backup |
| `CHANGELOG.md` | v0.15.0 añadido; v0.14.2 movido a link externo (fuera top-2) |
| `STATE.md` | Versión, última sesión, backlog, tabla de archivos |
| `docs/sessions/session-33-loop-post-pomodoro.md` | **Este archivo** |

---

## Decisiones tomadas

- **`getState()` vs `usePace()`**: el BreakMenu se abre en un contexto
  post-Pomodoro con estado estable. Un snapshot `getState()` en el render es
  suficiente y más simple que suscribirse al store. Si en el futuro el estado
  pudiese cambiar mientras el modal está abierto (p.ej. agua desde notificación
  de sistema), habría que migrar a `usePace()`.

- **Sort estable para empates**: cuando dos opciones tienen el mismo score, el
  orden original (Respira > Muévete > Agua) actúa como desempate determinista.
  Esto evita salteo visual entre renders y da una rotación implícita natural
  (si Respira y Agua están en empate, Respira aparece primero porque es la
  "más fácil de hacer rápido").

- **Escala de agua 0-3**: darle más peso al agua (3 si 0 vasos) refleja que
  la deshidratación es invisible y urgente. Si el usuario lleva 0 vasos a las
  3 pm, el agua debe aparecer por delante de cualquier otra actividad aunque
  sea "lo primero del día".

---

## Backlog afectado

- **"Loop post-Pomodoro"** ✅ cerrado. Era de prioridad "alto impacto · coste bajo".
- **Backups**: hay 5 backups (límite). El más antiguo es `v0.12.8_20260423_1700.html`
  — eliminar en la próxima sesión que genere un nuevo backup.
