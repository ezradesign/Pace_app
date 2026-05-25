# Sesion 84 -- design · plan de port

**Fecha:** 2026-05-24
**Version objetivo:** v0.34.0 (minor — feature: cierre del iter glifos canonicos Mueve/Estira)
**Modelo:** Opus 4.7
**Base:** [session-84-audit.md](./session-84-audit.md) (aprobado por usuario)

---

## 2.1 Lista cerrada de acciones

Tabla definitiva por glifo (snapshot del audit 1.1, sin ambigüedad):

### Mueve (13)

| # | Step name | Accion | Version aprobada | Origen SVG |
|---:|---|---|---|---|
| 1 | Flexiones inclinadas | **port** | new | `asset-03-38a6b0bb.js` |
| 2 | Descanso | **port** | new | `asset-03` |
| 3 | Fondos en silla | **keep idéntico** | new (== actual) | — sin edit |
| 4 | Wall sit | **port** | new | `asset-03` |
| 5 | Calf raises | **port** | alt | `asset-08-0d7ca9ac.js` |
| 6 | Seated hollow | **port** | v5 | `asset-05-feecc6b0.js` |
| 7 | Squeeze fist | **port** | v9 | `asset-04-e83a59e9.js` |
| 8 | Finger extension | **port** | v9 | `asset-04` |
| 9 | Wrist stretch | **port** | v5 | `asset-05` |
| 10 | Chin tucks | **port** | v8 | `asset-09-d9b36172.js` |
| 11 | Scapular squeeze | **port** | new | `asset-03` |
| 12 | Thoracic extension | **port** | new | `asset-03` |
| 13 | Chest opener | **port** | new | `asset-03` |

### Estira (33)

| # | Step name | Accion | Version aprobada | Origen SVG |
|---:|---|---|---|---|
| 14 | Apertura de pecho | **port** | v8 | `asset-09` |
| 15 | Rotacion toracica | **port** | new | `asset-03` |
| 16 | Flexor de cadera | **port** | v8 | `asset-09` |
| 17 | World's greatest stretch | **keep s60** | — | sin edit |
| 18 | Cuello y trapecios | **port** | v6 | `asset-06-41a00797.js` |
| 19 | Reset respiracion | **port** | new | `asset-03` |
| 20 | Cossack squat | **keep s60** | — | sin edit |
| 21 | 90/90 | **port** | alt | `asset-08` |
| 22 | Pigeon | **keep s60** | — | sin edit |
| 23 | Squat profundo | **port** | alt | `asset-08` |
| 24 | Puente con marcha | **port** | new | `asset-03` |
| 25 | Scapular wall slides | **port** | v8 | `asset-09` |
| 26 | Band pull-apart | **port** | new | `asset-03` |
| 27 | External rotation | **port** | alt | `asset-08` |
| 28 | Dead hang (si puedes) | **port** | new | `asset-03` |
| 29 | ATG split squat | **keep s60** | — | sin edit |
| 30 | Tibialis raise | **keep s60** | — | sin edit |
| 31 | Nordics | **keep s60** | — | sin edit |
| 32 | Sissy squat | **keep s60** | — | sin edit |
| 33 | Elephant walk | **port** | v7 | `asset-14-6e883388.js` |
| 34 | Deep squat hold | **keep s60** | — | sin edit |
| 35 | Crawling | **keep s60** | — | sin edit |
| 36 | Hang pasivo | **port** | alt | `asset-08` |
| 37 | Ground sitting transitions | **keep s60** | — | sin edit |
| 38 | Rib pull + respiracion | **keep idéntico** | new (== actual) | — sin edit |
| 39 | Inclinacion lateral | **keep s60** | — | sin edit |
| 40 | Rotacion lenta | **keep idéntico** | new (== actual) | — sin edit |
| 41 | Escalenos | **keep s60** | — | sin edit |
| 42 | Shrug + round | **port** | v12 | `asset-10-64e60ddc.js` |
| 43 | Wrist circles | **keep s60** | — | sin edit |
| 44 | Seated twist | **keep s60** | — | sin edit |
| 45 | Ankle circles | **keep s60** | — | sin edit |
| 46 | Deep breaths | **port** | new | `asset-03` |

### Totales

- **port**: 28 ediciones en exercise-glyphs.jsx (12 Mueve + 16 Estira).
- **keep idéntico**: 3 (sin edit — SVG aprobado byte-igual al actual).
- **keep s60**: 15 (sin edit — pendientes, mantener actual).
- **Total ediciones**: 28.

---

## 2.2 Orden de port

**Orden del archivo** (no por rutina, no por categoría). Mismo orden actual de `EXERCISE_GLYPHS` para minimizar diff de revision.

### Bloque A — Mueve (12 ports + 1 skip)

Glifos 1-13 en orden:
1. Flexiones inclinadas (NEW)
2. Descanso (NEW)
3. ~~Fondos en silla~~ (keep idéntico, skip)
4. Wall sit (NEW)
5. Calf raises (ALT)
6. Seated hollow (V5)
7. Squeeze fist (V9)
8. Finger extension (V9)
9. Wrist stretch (V5)
10. Chin tucks (V8)
11. Scapular squeeze (NEW)
12. Thoracic extension (NEW)
13. Chest opener (NEW)

**Checkpoint A**:
- `node build-standalone.js` debe pasar sin errores de `validateAppFiles`.
- Preview `localhost:8765/PACE.html`: consola limpia, `EXERCISE_GLYPHS=46`, `ExerciseGlyph` funcional.
- Test runtime: `window.EXERCISE_GLYPHS['Flexiones inclinadas']` no es undefined.

### Bloque B — Estira (16 ports + 17 skips)

Glifos 14-46 en orden. Los `keep s60` y `keep idéntico` se SALTAN (cero edit).

Ports en orden de aparicion:
1. Apertura de pecho (V8)
2. Rotacion toracica (NEW)
3. Flexor de cadera (V8)
4. Cuello y trapecios (V6)
5. Reset respiracion (NEW)
6. 90/90 (ALT)
7. Squat profundo (ALT)
8. Puente con marcha (NEW)
9. Scapular wall slides (V8)
10. Band pull-apart (NEW)
11. External rotation (ALT)
12. Dead hang (si puedes) (NEW)
13. Elephant walk (V7)
14. Hang pasivo (ALT)
15. Shrug + round (V12)
16. Deep breaths (NEW)

**Checkpoint B**:
- `node build-standalone.js` OK.
- Preview runtime: `EXERCISE_GLYPHS=46` siempre, render OK en home → Mueve → cualquier rutina, home → Estira → cualquier rutina.

### Politica de checkpoint intermedio

Cada bloque (A y B). Si `validateAppFiles` rompe:
1. Identificar archivo + linea del error.
2. Revertir el ultimo glifo portado del bloque actual.
3. Re-ejecutar `node build-standalone.js`.
4. Si OK → bug en el SVG portado (probable: comilla/llave perdida, JSX mal escrito).
5. Si rompe igual → mas glifos previos tienen el bug; revertir bloque entero y re-portar uno a uno.

---

## 2.3 Decision arquitectonica fija

### Estructura del archivo (PRESERVADA)

```jsx
/* PACE · Glifos canónicos de ejercicio · sesión 84 / v0.34.0 (iter cerrado 31/46 aprobados + 15 mantenidos) */

function G({ size = 88, className = '', children }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
         strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

const EXERCISE_GLYPHS = {
  /* MUEVE ... */
  'Flexiones inclinadas': ({ size, className }) => (
    <G size={size} className={className}>
      {/* cuerpo SVG portado literal */}
    </G>
  ),
  ...
};

function DefaultGlyph({ size, className }) { ... }
function ExerciseGlyph({ id, size, className }) { ... }

Object.assign(window, { ExerciseGlyph, EXERCISE_GLYPHS, DefaultGlyph });
```

- Wrapper `G` intacto (strokeWidth 1.8 forzado a nivel repo, ver audit 1.4).
- 46 entradas en `EXERCISE_GLYPHS`, mismo orden, mismos nombres.
- Comentarios contextuales por glifo: ACTUALIZADOS cuando la metafora cambie (port), MANTENIDOS cuando keep. Convencion preservada (cada glifo lleva 1 linea de comentario).
- `DefaultGlyph` + `ExerciseGlyph` + `Object.assign` finales sin modificar.

### NO troceado en s84

`exercise-glyphs.jsx` actual: **527 lineas**. Estimacion post-port:
- 28 ports promedio 5-8 lineas/glifo (sustitucion del cuerpo SVG): cambio neto esperado ±0-30 lineas (algunos SVG son mas densos, otros mas minimalistas).
- Estimacion final: **510-560 lineas**.

Umbral troceado: >600 ln. **Probable evaluation post-port: no se trocea.** Si se rebasa, abrir s85 para split en `exercise-glyphs/move.jsx` + `stretch.jsx`.

### Comentarios contextuales — política

Para cada `port`:
- Reescribir la linea de comentario `/* N. Descripcion */` para reflejar la nueva metafora.
- Mantener el numero (1-46) para preservar la enumeracion historica.
- Actualizar la version aprobada al final entre parentesis: `/* 7. Núcleo + 2 arcos abrazando (V9). */`

Para cada `keep s60`:
- Mantener el comentario actual sin cambios.

Para cada `keep idéntico`:
- Mantener el comentario actual sin cambios (el SVG no cambia).

### Header del archivo

Actualizar:
```jsx
/* PACE · Glifos canónicos de ejercicio · sesión 84 / v0.34.0
   (iter cerrado: 31/46 aprobados portados + 15 mantenidos del s60)

   31 glifos con version bloqueada por el usuario en exploracion HTML:
   - new (v3): 15  · alt (v4): 5  · v5: 2  · v6: 1  · v7: 1
   - v8: 4         · v9: 2        · v12: 1
   15 glifos siguen en estado canonico s60 (sin aprobacion del usuario).

   GRANULARIDAD: por paso individual, NO por rutina.
   KEY: step.name en español canónico.

   Reglas de dibujo (heredadas de s59, preservadas):
     - viewBox 0 0 44 44
     - fill="none" stroke="currentColor"
     - strokeWidth 1.8 (wrapper G unifica el lenguaje a nivel repo,
       aunque varias versiones aprobadas usen 1.5 o 2.0 — divergencia
       documentada en docs/sessions/session-84-audit.md secc 1.4)
     - strokeLinecap "round", strokeLinejoin "round"
     - Opacidades preservadas tal cual del HTML del usuario
     - BreatheSession queda fuera (usa BreathVisual animado)
*/
```

---

## 2.4 Versionado

**v0.34.0** (minor — feature).

Razon (confirmada por usuario Tarea 0):
- Cierre del iter abierto en s60 (declarado explicitamente en el prompt s84 como objetivo).
- Sustitucion de 28 glifos de un total de 46 = mayoria visible.
- 31 aprobados / 46 totales = 67% del catalogo bloqueado por el usuario.
- Permite que s85 sea polish/Reddit puro sin sensacion de "placeholders pendientes" en runtime.

Cambios de version:
- `app/state-core.jsx:13` → `PACE_VERSION = 'v0.34.0';`
- `PACE.html:6` → `<title>PACE · Foco · Cuerpo — v0.34.0</title>`
- `sw.js:1` → `const CACHE_NAME = 'pace-v0.34.0';`
- `app/glyphs/exercise-glyphs.jsx:1` → header cambia de v0.28.1 a v0.34.0 (ver bloque arriba).

CHANGELOG.md:
- Fila nueva v0.34.0 (cabecera).
- Degradar v0.33.2 a fila-de-enlace (mantener detalle solo para v0.34.0 y v0.33.3).

STATE.md:
- Cabecera y version bumpeada.
- Tabla archivos vivos: `exercise-glyphs.jsx` v0.28.1 → v0.34.0 (iter cerrado 31/46).
- Ultima sesion: reemplazar s83 por s84.
- Decisiones activas: añadir D-sobre cierre del iter s60 + patrón "port literal desde HTML" + politica de los 15 pendientes.
- Deuda tecnica activa: añadir "15 glifos pendientes de aprobacion" + "divergencia menor move.desk.quick".

---

## 2.5 Riesgo y rollback

### Riesgos identificados

| Riesgo | Probabilidad | Mitigacion |
|---|---|---|
| Error de copia (comilla perdida, llave sin cerrar) | Media | Checkpoint validate cada bloque (Tarea 3) |
| Glifo aprobado se ve raro a 44px (subjetivo) | Baja-media | Verificacion Fase 4.1 paso por paso |
| Cambio de stroke 1.5/2.0 → 1.8 hace que glifos finos se vean gruesos | Baja | Documentado divergencia; si molesta, sesion separada para cambiar wrapper |
| Glifo de un step que YO no he visto rompe runtime | Muy baja | StepGlyph cae al DefaultGlyph si la key no existe; cobertura ya verificada 46/46 |
| Bundle delta >10 KB | Muy baja | Audit estima ±0-1 KB |
| Confusion visual entre Squeeze fist v9 / Apertura de pecho v8 a tamaño mini | Subjetiva | Fase 4.1 + 4.5 detectarán; iteracion futura si aplica |

### Plan de rollback (Tarea 5)

Si tras la implementacion:
- >3 glifos rompen visualmente en alguna rutina, o
- algun glifo PENDIENTE (control) cambio (indicaria error en lista), o
- `validateAppFiles` rompe y el fix supera 15 min:

1. Detener implementacion.
2. `git stash` de los cambios (sin perderlos).
3. Reportar al usuario con analisis de causa raiz.
4. Esperar decision: continuar fix glifo a glifo, revertir al subset funcional, o cancelar s84.

---

## 2.6 Metricas objetivas previstas

| Metrica | Estimacion |
|---|---|
| Lineas finales `exercise-glyphs.jsx` | 510-560 ln (actual 527) |
| Bundle delta (vs v0.33.3 = 620 KB / 635,365 bytes) | ±0 a +2 KB |
| Tamaño objetivo bundle | 618-624 KB |
| Cantidad de glifos con >10 elementos SVG | 0 (max actual: Band pull-apart NEW = 9 elementos) |
| Archivos modificados en s84 | 5: `exercise-glyphs.jsx`, `state-core.jsx`, `PACE.html`, `sw.js`, `STATE.md` + `CHANGELOG.md` + 2 docs (`session-84-audit.md` ya existe, `session-84-design.md` actual, `session-84-glifos-cierre-iter.md` nuevo) |
| Archivos creados nuevos | 3 (los 3 docs de sesion) |
| Backups rotados | 1 (oldest borrado, +1 v0.33.3 creado) |

---

## 2.7 Confirmacion ante deudas detectadas en audit

Documentadas como deuda en STATE.md (no se tocan en s84):

1. **15 glifos PENDIENTES** sin aprobacion del usuario. Iteraciones disponibles v8/v9/v10/v11/v12/v13 en exploracion. Mantenidos en s60. Abrir sesion futura cuando el usuario apruebe.
2. **Divergencia `move.desk.quick`**: HTML del usuario lista `Apertura de pecho` donde repo lista `Chin tucks` en paso 5. NO se reconcilia en s84 (scope = solo glifos). Decision futura: actualizar `EXTRA_ROUTINES` para match con HTML, o mantener repo.
3. **`scripts/extract-glyphs-bundle.js`** + carpeta `scripts/extracted-glyphs/`: temporal. Borrar al cerrar s84.
4. **strokeWidth divergencia** entre versiones aprobadas. Wrapper G unificado a 1.8. Si en runtime se decide unificar a 2.0 (estilo V9), cambio aislado del wrapper en sesion separada.

---

**Fin del design. Pausa para aprobacion del usuario antes de Tarea 3 (implementacion).**
