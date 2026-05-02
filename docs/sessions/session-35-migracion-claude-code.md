# Sesión #35 · 2026-05-01 · Migración a Claude Code + reparación de cierre post-Genspark

## 🎯 Tarea

Migrar el pipeline del agente ejecutor de **OpenCode + Big Pickle (GLM-4.6)** a **Claude Code (Opus 4.7)** y reparar el cierre que quedó pendiente desde la sesión 33: crear el script de empaquetado del standalone, regenerar `PACE_standalone.html` desde el código actual, y dejar la documentación operativa alineada con el nuevo flujo. Tarea atómica de tooling + docs (≈ 1h-1h30 estimado, ejecutado en ~50 min).

Se retoma además el plan que estaba previsto para la sesión 34, abortada antes de tocar archivos al decidirse el cambio de pipeline.

## ⛔ Sesión 34 — abortada (sin commits)

**Decisión previa al arranque de esta sesión:** la 34 se canceló antes de cualquier edición porque se eligió migrar el pipeline en vez de seguir produciendo trabajo en el anterior. Sin commits, sin archivos modificados. El trabajo planificado (crear `scripts/build-standalone.js`) se traslada íntegro a esta sesión 35.

## 📋 Plan (aprobado por usuario)

Seis sub-tareas en orden estricto:

- **A.** Documentar el aborto de la sesión 34 en `STATE.md`.
- **B.** Reescribir `CLAUDE.md` como onboarding específico de Claude Code: corto, autosuficiente, con flujo "no-commit" del agente, checkpoints como referencia rápida, y eliminando duplicación con `AGENTS.md` (ya consolidada en sesión 32).
- **C.** Crear `scripts/build-standalone.js` (Node puro, sin dependencias npm).
- **D.** Ejecutar el script y regenerar `PACE_standalone.html` con el estado actual del código (v0.14.5).
- **E.** Actualizar la sección "Notas de entorno" + el flujo de cierre en `AGENTS.md` para reflejar el nuevo pipeline y el comando del script.
- **F.** Verificación humana del nuevo standalone por el usuario (doble clic + consola limpia + módulos cargan, especialmente `BreatheModule` refactorizado en sesión 33).

## ✅ Ejecutado

### A. Aborto de sesión 34 documentado en `STATE.md`
- Cabecera del archivo: línea "Última sesión" → "Última sesión cerrada" + nueva línea "Sesión 34: abortada (sin commits) — migración OpenCode + Big Pickle (GLM-4.6) → Claude Code (Opus 4.7)".
- Línea de build entregado: pendiente de regeneración movido de "sesión 34" → "sesión 35".
- Insertada sección dedicada `## ⛔ Sesión 34 — abortada (sin commits)` antes de "Última sesión (resumen operativo)" con el motivo de la cancelación.
- Backlog "Refactor aplazado": añadida entrada **"Limpiar splash placeholder `__bundler_thumbnail`"** (~10 min, ahorra ~12 líneas en `PACE.html` y ~600 B en standalone). El bloque `<template>` de las líneas 18-30 era requisito del bundler `super_inline_html` de Genspark; hoy no cumple función. Se mantiene intacto en esta sesión por instrucción del usuario.

### B. `CLAUDE.md` reescrito como onboarding Claude Code
- 255 → 217 líneas (-38 netas).
- Eliminadas las 6 secciones que solo eran punteros a `AGENTS.md` (Arranque, Semáforo, Cierre, Regla de un único sitio, Reglas de código, Qué NO hacer) — ya estaban deduplicadas tras sesión 32.
- Eliminada la sección **"Carpeta espejo `Pace_app_HH_MM/`"** completa (~55 líneas): muleta del sandbox de Genspark, no aplica con Claude Code editando in-place sobre el repo del usuario.
- Añadidas:
  - Sección **"🤖 Flujo con Claude Code"** con las 4 reglas operativas: no commits/push automáticos; edición in-place; regenerar standalone con `node scripts/build-standalone.js`; servir `PACE.html` con `python -m http.server 8000` para preview manual.
  - Tabla **"🪜 Checkpoints de edición (referencia rápida)"** con A/B/C/D y delegación de detalle a `AGENTS.md`.
  - Stack y idioma del proyecto (español + tono cálido literario) en el bloque de contexto introductorio.
- Conservados intactos: árbol de arquitectura (actualizado con `app/breathe/` ya troceado, `app/support/`, `app/welcome/`, `scripts/`, `design/`, `LICENSE`); concepto del producto + tono / filosofía; buenas prácticas (Trazabilidad, Documentación viva, Testing manual, Degradación elegante, Privacidad, Accesibilidad); versionado semántico informal; punteros finales a otros docs.

### C. `scripts/build-standalone.js` creado
- ~200 líneas, Node puro (≥ 14), sin dependencias npm.
- Flujo del script:
  1. Lee `PACE.html` con UTF-8 estricto.
  2. Detecta versión actual del `<title>` (regex `v\d+\.\d+\.\d+`).
  3. Si `PACE_standalone.html` existe en raíz, lo copia a `backups/PACE_standalone_vX.Y_YYYYMMDD.html` antes de sobrescribir.
  4. Lista los backups existentes con regex `^PACE_standalone_v[\d.]+_\d{8}(?:_\d{4})?\.html$`, los ordena por mtime descendente y elimina los que excedan el límite de **5**.
  5. Inlinea referencias locales por regex sobre el HTML:
     - `<link rel="stylesheet" href="LOCAL">` → `<style>...contenido...</style>`.
     - `<script src="LOCAL">...</script>` (cuerpo whitespace) → `<script>...contenido...</script>` preservando atributos como `type="text/babel"`.
     - `<img src="LOCAL.png">` → `<img src="data:image/png;base64,...">` (Opción 1: bundle 100% portable).
  6. **NO toca** scripts/links cuyos `src`/`href` empiezan por `http://`, `https://`, `//` o `data:` — los CDN de React/ReactDOM/Babel quedan intactos con su SRI.
  7. **NO toca** scripts inline con cuerpo no-vacío (mount script al final de `PACE.html` con `data-presets="env,react"`).
  8. Escribe `PACE_standalone.html` y registra log claro: lista de archivos inlineados con tamaño individual + tamaño final del bundle.
- Errores explícitos: si un archivo referenciado falta, `process.exit(1)` con mensaje claro (no produce standalone roto silenciosamente).

### D. `PACE_standalone.html` regenerado a v0.14.5
- Ejecución: `node scripts/build-standalone.js` → OK en ~200 ms.
- **26 archivos inlineados:** 1 CSS (`app/tokens.css`, 4.8 KB) + 24 JSX (todos los módulos) + 1 PNG (logo 100.8 KB como data URI).
- **3 CDN preservados:** React 18.3.1, ReactDOM 18.3.1, Babel 7.29.0 — todos con `integrity` y `crossorigin` intactos.
- **Tamaño final:** 363.1 KB (vs 369 KB del v0.14.0 histórico — diferencia explicada por el refactor de BreatheModule en sesión 33: el código se redistribuyó en 6 archivos y dejó algo menos de overhead).
- Backup rotado: ninguno esta vez (no había `PACE_standalone.html` en raíz por la deuda heredada de sesiones 33-34). 5 backups previos en `backups/` quedan intactos.

### E. `AGENTS.md` actualizado
- 123 → 120 líneas (-3 netas).
- **Notas de entorno:** añadidas 2 entradas:
  1. Pipeline actual: Claude Code (Opus 4.7) desde sesión 35, reemplaza OpenCode + Big Pickle. Aclaración explícita: "el agente NO ejecuta `git commit` ni `git push`".
  2. Comando de regeneración del standalone con detalle del comportamiento (CDN preservados con SRI, logo PNG → data URI, rotación automática de backups, sin deps npm).
- **Cierre (sección 3):** 12 pasos → 8 pasos. Eliminados los pasos del flujo Genspark obsoletos (carpeta espejo `Pace_app_HH_MM/`, `present_fs_item_for_download`, verificación con `show_html` + `get_webview_logs`). Pasos de rotar backup + regenerar consolidados en uno solo (el script lo hace en una llamada). Verificación de la app explícitamente delegada al usuario en Claude Code.
- **Regla técnica B:** "Cambios en `app/` → regenerar `PACE_standalone.html`" ahora cita el comando exacto.
- **Protocolo adaptado al tipo de tarea:** corregida la referencia a "pasos 2, 3, 4, 10" del cierre antiguo (ahora solo 8 pasos). Para tarea de docs: omitir paso 2 (regeneración).

### F. Verificación humana (delegada al usuario)
Tras este diario, el usuario:
1. Abre `PACE_standalone.html` con doble clic (no necesita servidor).
2. Verifica consola del navegador (F12) sin errores.
3. Comprueba que `BreatheModule` carga: biblioteca de respiración, modal de seguridad (Rondas / Wim Hof), círculo animado.
4. Comprueba que el resto de módulos cargan: Foco, Mueve, Estira, Hidrátate, Logros, Stats, Tweaks.

Esta verificación valida retroactivamente el refactor de `BreatheModule.jsx` de la sesión 33 (entrada de backlog "Validar funcionalmente refactor BreatheModule v0.14.4"), que quedó sin probar por bloqueo de `file://` y por imposibilidad de regenerar el standalone.

## 🔧 Cambios cosméticos en `PACE.html`
Aprovechando la sesión:
- **Línea 6:** título bumpeado v0.14.3 → **v0.14.5** (corrige el desfase del bump de v0.14.4 que sesión 33 dejó sin propagar al título, y bumpea para esta sesión).
- **Líneas 10-12:** comentario del logo actualizado — `super_inline_html` reemplazado por la nueva referencia a `scripts/build-standalone.js`.
- **Líneas 14-17:** comentario del splash placeholder reescrito para clarificar que es deuda heredada (la entrada de backlog correspondiente queda registrada en `STATE.md`). El bloque `<template id="__bundler_thumbnail">` en sí queda **intacto** por instrucción del usuario.

## 📊 Resultado cuantitativo
- **+1 archivo nuevo:** `scripts/build-standalone.js` (~200 líneas).
- **+1 archivo nuevo:** `docs/sessions/session-35-migracion-claude-code.md` (este).
- **Modificados:** `STATE.md` (+22 líneas netas), `CLAUDE.md` (-38 líneas netas), `AGENTS.md` (-3 líneas netas), `PACE.html` (+0 líneas netas, 3 ediciones in-place), `PACE_standalone.html` (regenerado completo, 363.1 KB).
- **0 archivos JSX modificados.** **0 cambios de comportamiento observable.**
- **+1 entrada de backlog:** limpieza del splash placeholder `__bundler_thumbnail`.

## 📂 Archivos
- **Nuevos:** `scripts/build-standalone.js`, `docs/sessions/session-35-migracion-claude-code.md`.
- **Modificados:** `STATE.md`, `CLAUDE.md`, `AGENTS.md`, `PACE.html`, `CHANGELOG.md`, `README.md`, `PACE_standalone.html`.

## 🔢 Versión
- **v0.14.4** → **v0.14.5** (patch · tooling + reparación de cierre + reescritura de `CLAUDE.md` para Claude Code).

## 📌 Nota
Primera sesión completa con el pipeline Claude Code. El flujo "edita in-place + el usuario commitea desde GitHub Desktop" funciona con menos fricción que el ciclo descarga/zip/pegar de Genspark. Carpeta espejo `Pace_app_HH_MM/` retirada del protocolo.
