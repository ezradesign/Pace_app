# Sesión #33 · 2026-05-01 · Refactor BreatheModule + edición AGENTS.md + backlog

## 🎯 Tarea
Refactor de `app/breathe/BreatheModule.jsx` (~652 líneas) para bajar de 500 líneas, cumpliendo la regla técnica innegociable de AGENTS.md. Tarea de código, átomo único.

## 📋 Plan de split (aprobado por usuario)
Identificación de unidades cohesivas en BreatheModule.jsx (652 líneas):
1. `BREATHE_ROUTINES` (líneas 8-50) → `BreatheRoutines.jsx` (~45 líneas)
2. `BreatheLibrary` + `RoutineCard` (líneas 55-109) → `BreatheLibrary.jsx` (~57 líneas)
3. `BreatheSafety` (líneas 114-159) → `BreatheSafety.jsx` (~49 líneas)
4. `getSequence` (líneas 443-506) → `breatheHelpers.jsx` (~66 líneas), renombrado a `getBreatheSequence`
5. `BreathVisual` + `visualStyles` (líneas 508-642) → `BreathVisual.jsx` (~134 líneas), renombrado a `breathVisualStyles`
6. `BreatheSession` (líneas 166-437) → queda en `BreatheModule.jsx` reducido (~275 líneas)

## ✅ Ejecutado
- **5 archivos nuevos creados** en `app/breathe/`:
  - `BreatheRoutines.jsx` (45 líneas) — exporta `BREATHE_ROUTINES`
  - `BreatheLibrary.jsx` (57 líneas) — exporta `BreatheLibrary`
  - `BreatheSafety.jsx` (49 líneas) — exporta `BreatheSafety`
  - `breatheHelpers.jsx` (66 líneas) — exporta `getBreatheSequence`
  - `BreathVisual.jsx` (134 líneas) — exporta `BreathVisual`
- **`BreatheModule.jsx` reducido** de 652 → 275 líneas (solo `BreatheSession`)
- **Renombres obligatorios (Checkpoint C)**:
  - `getSequence` → `getBreatheSequence` (regla de nombre único)
  - `visualStyles` → `breathVisualStyles` (regla de objeto de estilo único)
- **`PACE.html` actualizado** con nuevo orden de carga (líneas 64-70)
- **Checkpoint B reportado**:
  - `BreatheModule.jsx`: 275 líneas (era 652) ✅ < 500
  - Resto: 45+57+49+66+134 = 351 líneas en archivos nuevos
- **Grep verificado**: cero referencias externas a `getSequence` o `visualStyles` fuera de `app/breathe/`

## 🔧 Descubrimientos durante sesión
1. **`super_inline_html` no existe en OpenCode**: era herramienta del sandbox Genspark Build AI usado en sesiones anteriores. No disponible localmente.
2. **`PACE.html` no abre con `file://`**: los navegadores bloquean la carga de scripts `text/babel` desde rutas relativas locales. Requiere servidor local (`python -m http.server 8000`).
3. **Regeneración de standalone bloqueada**: sin `super_inline_html` ni script propio, no se puede regenerar `PACE_standalone.html`.

## 📝 Ediciones adicionales (cierre adaptado)
4. **`AGENTS.md` editado**:
   - Paso 3 de Cierre: `super_inline_html` sustituido por `scripts/build-standalone.js`
   - Sección "Notas de entorno" añadida documentando ausencia de `super_inline_html` y bloqueo de `file://`
5. **`STATE.md` backlog ampliado** con 2 entradas:
   - "Crear `scripts/build-standalone.js`" (~30-45 min, bloquea regeneración)
   - "Validar funcionalmente refactor BreatheModule v0.14.4" (~10 min, depende de anterior)
6. **`README.md`** bump v0.14.3 → v0.14.4
7. **`CHANGELOG.md`** entrada v0.14.4 añadida (tabla + detalle)
8. **`STATE.md`** sección "Última sesión" reescrita con resumen de sesión 33

## ⚠️ Deuda técnica
- **`PACE_standalone.html`** queda desactualizado en v0.14.0 (no refleja v0.14.4)
- **Validación funcional pendiente**: refactor no verificado en navegador por bloqueo `file://` y falta de standalone regenerado
- **Sesión 34 dedicada**: crear `scripts/build-standalone.js` para desbloquear regeneración y validación

## 📊 Resultado cuantitativo
- **+5 archivos nuevos** en `app/breathe/`
- **BreatheModule.jsx**: 652 → 275 líneas (cumple regla < 500)
- **Total líneas**: ~626 líneas (antes 652, redistribuidas)
- **Cero cambios de comportamiento** (solo reestructuración)
- **Cero cambios visuales**

## 📂 Archivos
- **Nuevos**: `app/breathe/BreatheRoutines.jsx`, `app/breathe/BreatheLibrary.jsx`, `app/breathe/BreatheSafety.jsx`, `app/breathe/breatheHelpers.jsx`, `app/breathe/BreathVisual.jsx`, `docs/sessions/session-33-refactor-breathe.md`
- **Modificados**: `app/breathe/BreatheModule.jsx`, `PACE.html`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `STATE.md`

## 🔢 Versión
- **v0.14.3** → **v0.14.4** (patch · refactor BreatheModule + edición AGENTS.md + backlog)

## 📌 Nota
Sesión de código pero **sin regeneración de standalone** por ausencia de script de empaquetado. Cierre adaptado según instrucciones del usuario.
