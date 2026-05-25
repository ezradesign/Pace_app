# Sesion 84 -- audit · port literal de glifos canonicos Mueve/Estira

**Fecha:** 2026-05-24
**Version:** v0.33.3 -> v0.34.0 (objetivo)
**Modelo:** Opus 4.7
**Scope:** cerrar el iter parcial de glifos abierto en s60 portando literalmente las versiones aprobadas por el usuario desde su HTML de exploracion.

---

## Fuente externa de verdad

HTML del usuario: `C:\Users\ezrav\Desktop\Glifos Mueve y Estira _ standalone v0.19.html` (2.3 MB).

Formato: bundler autoextract (gzip + base64). Desempaquetado con script temporal `scripts/extract-glyphs-bundle.js` en `scripts/extracted-glyphs/` (44 assets: 17 JS Babel + 27 fuentes woff2 + 1 React/ReactDOM/Babel standalone). NO commitear ninguno.

Convencion de la app de exploracion (descubierta en `asset-12-6422ee88.js`):
- **`window.APPROVED[stepName]` es la fuente de verdad** sobre qué version esta bloqueada para cada glifo.
- Valores: `'new'` (v3), `'alt'` (v4), `'v5'`, `'v6'`, `'v7'`, `'v8'`, `'v9'`, `'v12'`.
- Si `APPROVED[stepName]` no esta definido → glifo PENDIENTE (sin aprobar todavia).
- `slot-v9` + `slot-cap.v9tag` (outline verde `#5B7A4F`, fontWeight 600) es la marca visual de aprobacion en el HTML.

Cobertura `APPROVED`: **31 aprobados / 46 totales · 15 pendientes**.

---

## 1.1 Inventario cruzado glifo-actual ↔ version-HTML ↔ accion

Decision del usuario (Tarea 0):
- Aprobados → **port** literal desde la version indicada.
- Pendientes (no en APPROVED) → **keep** s60 actual.

Acciones reales tras comparacion byte-a-byte:
- **port** (28): la version aprobada tiene SVG distinto al actual; sustituir.
- **keep idéntico** (3): la version aprobada es byte-identica al actual (NEW comenta "igual al actual v0.16" o el SVG coincide); cero cambio aunque tecnicamente "aprobada".
- **keep s60** (15): pendiente; mantener actual del repo s60.

### Mueve (13 glifos)

| Step name | Actual (v0.28.1) | APPROVED | SVG version aprobada | Accion |
|---|---|---|---|---|
| Flexiones inclinadas | s60 canonico (mesa pequeña + cuerpo diagonal) | new | mesa de oficina pura, 4 paths | **port** |
| Descanso | s60 canonico (luna creciente + chispa) | new | simbolo pausa (2 lineas verticales) | **port** |
| Fondos en silla | s60 canonico (silla perfil) | new | silla perfil idéntica al actual | **keep idéntico** |
| Wall sit | s60 canonico (cuerpo curvo + pared) | new | pared + cabeza + cuerpo en L | **port** |
| Calf raises | s60 (pie de perfil) | alt | 2 pies frontales + flecha arriba | **port** |
| Seated hollow | s60 (silla + cuerpo banana) | v5 | crescent puro (boat pose abstracto) | **port** |
| Squeeze fist | s60 canonico (puño + nudillos) | v9 | nucleo + 2 arcos abrazando | **port** |
| Finger extension | s60 (5 dedos + palma) | v9 | 5 lineas radiando desde punto | **port** |
| Wrist stretch | s60 (antebrazo + mano + arco) | v5 | antebrazo + abanico 5 trazos | **port** |
| Chin tucks | s60 canonico (cabeza + columna + chin) | v8 | 3 lineas horizontales decrecientes | **port** |
| Scapular squeeze | s60 (2 omoplatos + eje) | new | similar + dash eje + linea convergencia | **port** |
| Thoracic extension | s60 canonico (arco + soporte) | new | identico estructura, opacidad 0.55 | **port** (cambio mínimo) |
| Chest opener | s60 canonico (T-pose) | new | 3 costillas + 4 flechas laterales | **port** |

### Estira (33 glifos)

| Step name | Actual (v0.28.1) | APPROVED | SVG version aprobada | Accion |
|---|---|---|---|---|
| Apertura de pecho | s60 (2 petalos) | v8 | arco + 4 extensiones + arco inferior | **port** |
| Rotacion toracica | s60 (espiral nautilo + flecha) | new | linea hombros rotada + esternon + arco | **port** |
| Flexor de cadera | s60 (cadera + 2 piernas) | v8 | 2 lineas en angulo agudo abstracto | **port** |
| World's greatest stretch | s60 (cadera + zancada + arco superior) | -- | sin APPROVED | **keep s60** |
| Cuello y trapecios | s60 (cabeza + curva trapecio) | v6 | cabeza + trapecio triangular + mano anclada | **port** |
| Reset respiracion | s60 canonico (enso + centro) | new | 3 ondas horizontales + flecha (corriente aire) | **port** |
| Cossack squat | s60 (1 pierna doblada lateral) | -- | sin APPROVED | **keep s60** |
| 90/90 | s60 (2 L espejadas) | alt | 2 L + pies marcados + eje vertical | **port** |
| Pigeon | s60 (cadera + tibia cruzada) | -- | sin APPROVED | **keep s60** |
| Squat profundo | s60 canonico (arco M + cabeza) | alt | cabeza + cuerpo en M + tibias | **port** |
| Puente con marcha | s60 (arco puente + pierna elevada) | new | mismo estilo + posiciones distintas | **port** |
| Scapular wall slides | s60 (pared + W → Y) | v8 | pared + 2 arcos ascendentes abstractos | **port** |
| Band pull-apart | s60 (banda + 2 manos) | new | mismo + 6 lineas tension lateral | **port** |
| External rotation | s60 (codo 90° + arco) | alt | hombro como circulo + antebrazo + arco | **port** |
| Dead hang (si puedes) | s60 (barra + 2 brazos rectos) | new | mismo + manos huecas (circles r=2.4) | **port** (cambio menor) |
| ATG split squat | s60 (zancada ATG) | -- | sin APPROVED | **keep s60** |
| Tibialis raise | s60 (pared + pierna + pie dorsi) | -- | sin APPROVED | **keep s60** |
| Nordics | s60 (cuerpo recto cayendo + pivote) | -- | sin APPROVED | **keep s60** |
| Sissy squat | s60 (cuerpo atras + rodillas adelante) | -- | sin APPROVED | **keep s60** |
| Elephant walk | s60 (2 arcos consecutivos) | v7 | pike claro + 2 brazos colgando + 2 manos | **port** |
| Deep squat hold | s60 (M + 3 dots) | -- | sin APPROVED | **keep s60** |
| Crawling | s60 (espalda arqueada + 4 patas) | -- | sin APPROVED | **keep s60** |
| Hang pasivo | s60 (barra + 2 brazos relajados) | alt | barra + 2 manos + cuerpo relajado completo | **port** |
| Ground sitting transitions | s60 (2 niveles + curva) | -- | sin APPROVED | **keep s60** |
| Rib pull + respiracion | s60 (gato/vaca + puntos aire) | new | identico al actual | **keep idéntico** |
| Inclinacion lateral | s60 (cabeza inclinada + cuerpo curvo) | -- | sin APPROVED | **keep s60** |
| Rotacion lenta | s60 (cabeza + elipse) | new | identico al actual | **keep idéntico** |
| Escalenos | s60 (cabeza + brazo bajando + mano anclada) | -- | sin APPROVED | **keep s60** |
| Shrug + round | s60 (cabeza + arcos espejados) | v12 | cabeza + 2 arcos + torso + 2 flechas verticales | **port** |
| Wrist circles | s60 canonico (antebrazo + circulo) | -- | sin APPROVED | **keep s60** |
| Seated twist | s60 (silla + arco rotacion) | -- | sin APPROVED | **keep s60** |
| Ankle circles | s60 (pierna + circulo tobillo) | -- | sin APPROVED | **keep s60** |
| Deep breaths | s60 canonico (diafragma + susurros) | new | pulmones + flecha aire + expansion lateral | **port** |

### Totales

- **port**: 28 glifos (12 Mueve + 16 Estira).
- **keep idéntico**: 3 glifos (Fondos en silla, Rib pull + respiracion, Rotacion lenta). Tecnicamente aprobados pero su SVG en la version APPROVED es byte-identico al actual; no hay diff. Se documentan como "keep" porque no hay edit.
- **keep s60**: 15 glifos PENDIENTES sin entrada en APPROVED. Decision usuario s84 Tarea 0: mantener s60 actual hasta que apruebe en sesion futura.
- **add**: 0. Las 46 keys de `EXERCISE_GLYPHS` coinciden 1:1 con los step.name de las rutinas del HTML.
- **orphan**: 0. Ningun glifo del repo queda sin paso correspondiente.

Total intervenciones de edicion en `exercise-glyphs.jsx`: **28 ports**.

---

## 1.2 Cobertura del catalogo

### Step names en EXERCISE_GLYPHS (46) vs rutinas reales del repo

Cruzado contra `MoveModule.jsx` (MOVE_ROUTINES) y `ExtraModule.jsx` (EXTRA_ROUTINES):

- **46 keys** en EXERCISE_GLYPHS = **46 step.name únicos** entre MOVE_ROUTINES (13) + EXTRA_ROUTINES (33).
- Paso compartido: `Thoracic extension` aparece en MOVE_ROUTINES (`extra.posture.set`) y EXTRA_ROUTINES (`move.shoulders.5`). Una sola key, reuso correcto.
- Pasos compartidos adicionales: `Chin tucks` aparece en `extra.posture.set`, `move.neck.3` y `move.desk.quick` (3 rutinas). `Apertura de pecho` en `move.chair.antidote` y `move.desk.quick`. `Descanso` en multiples rutinas.

### Pasos en rutinas SIN glifo (caen al fallback)

**Cero pasos** en rutinas del repo caen al `DefaultGlyph` fallback. Cobertura completa.

### Glifos en EXERCISE_GLYPHS SIN rutina

**Cero glifos** huerfanos. Las 46 keys estan todas referenciadas por al menos una rutina.

### Pasos en el HTML del usuario SIN entrada en EXERCISE_GLYPHS

**Cero pasos nuevos**. El HTML del usuario lista exactamente los 46 step names existentes, sin proponer pasos adicionales.

### Divergencia menor detectada en ROUTINES (HTML) vs EXTRA_ROUTINES (repo)

Rutina `move.desk.quick` paso 5:
- HTML: `'Shrug + round', 'Wrist circles', 'Seated twist', 'Ankle circles', 'Apertura de pecho', 'Deep breaths'`
- Repo: `'Shrug + round', 'Wrist circles', 'Seated twist', 'Ankle circles', 'Chin tucks', 'Deep breaths'`

Diferencia: `Apertura de pecho` (HTML) vs `Chin tucks` (repo) en el penultimo paso. Ambos pasos ya tienen glifo en EXERCISE_GLYPHS. Esta es divergencia del CATALOGO de exploracion del usuario, NO afecta al port de glifos. Se documenta como deuda menor (decision: no tocar `move.desk.quick`, fuera de scope).

---

## 1.3 Consumidores de EXERCISE_GLYPHS / ExerciseGlyph

Grep en `app/`:

| Archivo | Linea | Uso |
|---|---:|---|
| `app/glyphs/exercise-glyphs.jsx` | 35 | `const EXERCISE_GLYPHS = {`  (definicion) |
| `app/glyphs/exercise-glyphs.jsx` | 510 | `function DefaultGlyph(...)` (fallback) |
| `app/glyphs/exercise-glyphs.jsx` | 521 | `function ExerciseGlyph({ id, size, className })` (lookup) |
| `app/glyphs/exercise-glyphs.jsx` | 527 | `Object.assign(window, { ExerciseGlyph, EXERCISE_GLYPHS, DefaultGlyph })` |
| `app/move/MoveModule.jsx` | 228 | `<StepGlyph stepName={step.name} />` (uso en sesion) |
| `app/move/MoveModule.jsx` | 286 | `function StepGlyph({ stepName })` (componente local) |
| `app/move/MoveModule.jsx` | 295 | `<ExerciseGlyph id={stepName} size={44} />` (renderizado) |

**Unico consumidor real:** `MoveModule.jsx` via `StepGlyph` que recibe `step.name` y lo pasa como `id` a `ExerciseGlyph`.

**Crítico:** `MoveSession` (definido en `MoveModule.jsx`) se reutiliza para renderizar TANTO rutinas de Mueve (extra.* ids) COMO rutinas de Estira (move.* ids), via:
1. `main.jsx:259` → `<MoveSession routine={view.routine} kind={view.kind || 'move'} ...>` cuando el usuario abre directamente Mueve o Estira desde home.
2. `PathBodyStep.jsx:13` → `<MoveSession routine={resolved.routine} kind={kind} ...>` cuando un Camino llega a un step `kind:'body'`.

Conclusion: **los 28 ports impactan runtime visible en sesiones de Mueve, Estira y Caminos `body`**.

### Dependencias hardcodeadas por nombre

Cero. Nadie hace `EXERCISE_GLYPHS['nombre concreto']` fuera de `ExerciseGlyph.id`. Renombrar/eliminar una key no rompe consumidores externos. Solo afectaria a la rutina cuyo `step.name` hace match.

---

## 1.4 Reglas de dibujo del HTML vs s59

Reglas s59 (ver header `app/glyphs/exercise-glyphs.jsx:10-22`):
- viewBox 0 0 44 44 ✓ (todas las versiones)
- fill="none" stroke="currentColor" ✓ (todas)
- strokeLinecap "round", strokeLinejoin "round" ✓ (todas)
- **strokeWidth 1.8** (proporcion equivalente a 1.2 sobre viewBox 28 de los iconos home)
- Opacidades: 1.0 / 0.5-0.6 / 0.35

### Inventario de strokeWidth por version

| Version | strokeWidth en wrapper G | Match s59? |
|---|---|---|
| OLD (v0.16) | 1.8 | ✓ |
| NEW (v3) | 1.5 | ✗ divergencia -0.3 |
| ALT (v4) | 1.5 | ✗ divergencia -0.3 |
| V5 | 1.5 | ✗ divergencia -0.3 |
| V6 | 1.5 | ✗ divergencia -0.3 |
| V7 | 1.5 | ✗ divergencia -0.3 |
| V8 | 1.5 | ✗ divergencia -0.3 |
| **V9** | **2.0** | ✗ divergencia +0.2 |
| V10 | 2.0 | ✗ divergencia +0.2 (pero ningun glifo APPROVED='v10') |
| V11 | 2.0 | ✗ divergencia +0.2 (pero ningun glifo APPROVED='v11') |
| V12 | 1.5 | ✗ divergencia -0.3 |
| V13 | (no inspeccionado por scope; ningun glifo APPROVED='v13') | -- |

### Politica de port (decision usuario Tarea 0)

**Port literal del CUERPO (paths/circles/etc.) dentro del wrapper G del repo (stroke 1.8).**

- Los SVGs portados PRESERVAN su geometria byte-perfect (mismo `d`, mismo `cx`/`cy`/`r`, mismas opacidades, mismos `strokeDasharray`).
- El strokeWidth efectivo sera **1.8** (el del wrapper actual), NO el 1.5/2.0 del HTML del usuario.
- Documentado como "divergencia consciente del lenguaje visual": el wrapper unifica stroke a 1.8 a nivel repo; si el usuario quiere cambiar el lenguaje base (stroke 2 para todo), es decision separada que afecta los 46 glifos por igual (no caso por caso).

Esto es coherente con el spirit del prompt seccion 1.4: "Si algun glifo del HTML rompe estas reglas: NO corregir en el port — portar literalmente como esta, y documentarlo".

### Otras divergencias observadas

- **strokeDasharray**: los glifos del HTML usan `"1.5 2"` con frecuencia (NEW/ALT/V5/V6/V7), mientras los s60 canonicos usan `"1.5 2.5"` o `"2 3"`. Variacion estilistica menor; se PRESERVA en el port literal (no se normaliza).
- **Opacidades fuera de rango s59 (0.35 / 0.5-0.6 / 1.0)**: NEW usa 0.7 en `Reset respiracion`; ALT usa 0.45 en multiples; V8 usa 0.7 en `External rotation`. Se preservan literal.
- **Apparatus de la cadena del repo**: `<rect>` no aparecia en s59. ALT_GLYPHS para `Seated twist` (pendiente, no se porta) usa `<rect x y width height rx>`. Si se aprobara en el futuro, el wrapper G soporta `<rect>` heredando stroke/fill OK.

---

## 1.5 Invariantes a preservar

1. **46 keys** siguen siendo accesibles por sus nombres actuales (cero renombrados que rompan consumidores).
2. Wrapper `<G size={size} className={className}>{children}</G>` intacto (definicion + uso).
3. `window.EXERCISE_GLYPHS` y `window.ExerciseGlyph` siguen expuestos con el mismo contrato (Object.assign al final del archivo).
4. `window.DefaultGlyph` sigue exportado (fallback de `ExerciseGlyph` cuando `id` no existe).
5. `StepGlyph` en `MoveModule.jsx:286` renderiza al mismo tamaño visible (size=44 prop intacto).
6. Cambio de paleta (Crema dia / Oscuro / Envejecido / Mono via tweak) sigue funcionando: `currentColor` heredado en wrapper G.
7. **Cero impacto en `achievement-glyphs.jsx`** (sistema visual separado: heraldica vs line-art; ni un byte tocado).
8. `BreatheSession` sigue fuera del scope (usa `BreatheVisual` animado, no `ExerciseGlyph`).
9. `MoveSession` renderiza pasos de Mueve+Estira+Caminos `body` con cobertura completa (cero fallback al `DefaultGlyph`).
10. Comentarios contextuales (`/* N. Descripcion del glifo */`) actualizados cuando la metafora cambia significativamente; convencion preservada (cada glifo lleva su comentario).
11. Wrapper G mantiene strokeWidth=1.8 (NO cambia, aunque algunos glifos del HTML usen 1.5 o 2.0).
12. **No troceado en s84** (`app/glyphs/exercise-glyphs/move.jsx` + `stretch.jsx`) salvo que el resultado supere 600 ln. Evaluacion post-port.
13. ROUTINES en HTML del usuario (`asset-07`) NO se importa al repo (es solo data de la exploracion).
14. `MOVE_ROUTINES` y `EXTRA_ROUTINES` del repo **NO se modifican** (scope s84 = solo glifos).
15. `move.desk.quick` divergencia (`Apertura de pecho` vs `Chin tucks`) **NO se reconcilia** en s84 (deuda futura, fuera de scope).

---

## 1.6 Edge cases

1. **Glifos con keys especiales:**
   - `World's greatest stretch` (apostrofe) → JSX requiere `"World's greatest stretch"` con dobles comillas o `\\'`. El archivo actual usa `"World's greatest stretch"`. Preservar.
   - `Dead hang (si puedes)` (parentesis) → string sin escape, preservar.
   - `90/90` (slash) → key con slash, preservar.
   - `Rib pull + respiracion` (signo +) → preservar.
   - `Shrug + round` (signo +) → preservar.

2. **Acentos en keys:** `Rotacion toracica`, `Apertura de pecho`, `Reset respiracion`, `Flexor de cadera`, `Inclinacion lateral`, `Rotacion lenta`, `Cuello y trapecios`, `Escalenos`. Keys actuales en español canonico con acentos UTF-8. PRESERVAR (el HTML del usuario usa los mismos acentos).

3. **Paso sin glifo:** No deberia ocurrir tras s84 (cobertura completa). Si se introdujera un step.name nuevo en una rutina sin entrada en EXERCISE_GLYPHS, caeria al `DefaultGlyph` (tres arcos concentricos).

4. **Glifos con >10 elementos:** El glifo mas denso del HTML aprobado es `Band pull-apart` (NEW): 2 circles + 7 paths = 9 elementos. Dentro del rango aceptable (<=10). Cero ports sobrepasan el umbral.

5. **Versiones con `<rect>`:** Solo aparece en ALT_GLYPHS Seated twist (PENDIENTE, no se porta). Si en el futuro se aprueba, wrapper G soporta `<rect>` con stroke heredado.

6. **Mobile vs desktop:** StepGlyph renderiza siempre `size=44` desde MoveModule:295. Sin variacion responsive. El tamaño visible varia por el contenedor circular (`moneda` 72px en desktop, escalado en mobile). Sin impacto en port.

7. **Transicion entre pasos:** SessionShell no usa keyframes; cambio de glifo es swap del DOM (sin parpadeo). El port preserva la estructura, no introduce ni quita timing.

8. **Glifo `Chin tucks` en 3 rutinas distintas:** `extra.posture.set`, `move.neck.3`, `move.desk.quick`. Un solo glifo (V8) renderizado en 3 contextos. Preservar coherencia visual entre rutinas.

9. **Glifos cuya APPROVED version es BYTE-IDENTICA al actual** (Fondos en silla, Rib pull + respiracion, Rotacion lenta): edit-skip (no editar, ningun cambio en archivo). Documentar como "keep idéntico" en Tabla 1.1.

10. **Bundle delta esperado:** los 28 ports son sustituciones, no añadidos. Algunos SVGs nuevos son MAS densos que los actuales (ej. Band pull-apart NEW tiene +6 paths laterales vs OLD), otros son MAS minimalistas (ej. Squat profundo ALT tiene -1 path que OLD). Delta neto esperado: **±0 a +1 KB**. Si crece >5 KB → revisar.

11. **Cobertura visual de las paletas:** los glifos usan `currentColor` heredado de `var(--move)` (extra.* ids) o `var(--extra)` (move.* ids). Cero referencias hardcodeadas a colores en SVG → el port preserva el comportamiento.

12. **Glifo cuya metafora no se entiende en 1-2 segundos (subjetivo):** mencion al usuario:
    - `Chin tucks` v8 (3 lineas decrecientes) → muy abstracto, podria confundir.
    - `Seated hollow` v5 (crescent puro) → muy abstracto.
    - `Squeeze fist` v9 (nucleo + 2 arcos) → riesgo de leerse como "respiracion" (analogo a algunos breath glyphs).
    - `Flexor de cadera` v8 (2 lineas en angulo) → similar a Cossack squat v8 → posible confusion entre Mueve y Estira.
    - Decision: NO modificar en el port. Si el usuario detecta confusion al verlo en runtime (Fase 4.1), iterar en sesion futura.

---

## Anexo A: politica de port para los 15 PENDIENTES

Decision usuario Tarea 0: **mantener s60 actual** para los 15 pendientes (no portar ninguna iteracion no aprobada).

Lista PENDIENTES (sin entrada en APPROVED):
1. World's greatest stretch
2. Cossack squat
3. Pigeon
4. ATG split squat
5. Tibialis raise
6. Nordics
7. Sissy squat
8. Deep squat hold
9. Crawling
10. Ground sitting transitions
11. Inclinacion lateral
12. Escalenos
13. Wrist circles
14. Seated twist
15. Ankle circles

Iteraciones disponibles para estos 15 en el HTML: v3 (los 15) + v4 (parcial) + v5/v6/v7 (parcial) + v8 (todos los 15) + v9 (todos los 15) + v10/v11 (subset 16 difíciles) + v12 (algunos) + v13 (refinamientos sobre v12). El usuario aun no ha bloqueado ninguna.

Estos 15 quedan **byte-perfect tras el port** y sirven como **CONTROL** de la Fase 4.3 (snapshot comparativo): si alguno cambia, indica error en la lista de acciones.

---

## Anexo B: orden de cambios en exercise-glyphs.jsx

Orden recomendado para Tarea 3 (orden del archivo, NO por categoria):

**Bloque Mueve (12 ports):**
1. Flexiones inclinadas (NEW)
2. Descanso (NEW)
3. (skip Fondos en silla — keep idéntico)
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

→ Checkpoint validate (`node build-standalone.js` + console error check en preview).

**Bloque Estira (16 ports):**
1. Apertura de pecho (V8)
2. Rotacion toracica (NEW)
3. Flexor de cadera (V8)
4. (skip World's greatest stretch — keep s60)
5. Cuello y trapecios (V6)
6. Reset respiracion (NEW)
7. (skip Cossack squat — keep s60)
8. 90/90 (ALT)
9. (skip Pigeon — keep s60)
10. Squat profundo (ALT)
11. Puente con marcha (NEW)
12. Scapular wall slides (V8)
13. Band pull-apart (NEW)
14. External rotation (ALT)
15. Dead hang (si puedes) (NEW)
16. (skip ATG, Tibialis, Nordics, Sissy — keep s60)
17. Elephant walk (V7)
18. (skip Deep squat hold, Crawling — keep s60)
19. Hang pasivo (ALT)
20. (skip Ground sitting transitions — keep s60)
21. (skip Rib pull + respiracion — keep idéntico)
22. (skip Inclinacion lateral, Rotacion lenta, Escalenos — Rotacion lenta keep idéntico, otros keep s60)
23. Shrug + round (V12)
24. (skip Wrist circles, Seated twist, Ankle circles — keep s60)
25. Deep breaths (NEW)

→ Checkpoint validate.

→ Si validateAppFiles OK al final → Tarea 4 verificacion visual.
→ Si cualquier bloque rompe → revertir bloque y debug.

---

## Anexo C: divergencias documentadas para el usuario (post-port)

1. **strokeWidth 1.8 forzado por wrapper G del repo** vs strokeWidth 1.5/2.0 de las versiones APPROVED del HTML. Decision: preservar el wrapper. Si quieres unificar a 2.0 (a la moda V9), cambio aislado del wrapper en sesion separada.

2. **`move.desk.quick` divergencia** en penultimo paso (`Apertura de pecho` HTML vs `Chin tucks` repo). Decision: NO modificar `EXTRA_ROUTINES` en s84 (scope = solo glifos). Documentar en STATE.md como deuda pendiente.

3. **15 PENDIENTES sin aprobar**: mantenidos con el s60 actual. Iteraciones v8/v9/v10/v11/v12/v13 disponibles en exploracion del usuario. Cuando los apruebes, abre s86+ para portarlos.

4. **3 "keep idéntico"** (Fondos en silla, Rib pull, Rotacion lenta): tu version APPROVED='new' es byte-identica al actual del repo. Sin cambio visible. Esto es esperado — los rediseñaste pero respetaste el s60 original.

5. **Glifos visualmente fronterizos** (subjetivo): Chin tucks v8, Seated hollow v5, Squeeze fist v9 son muy abstractos. Si en runtime (Fase 4.1) detectas confusion entre pares (ej. Squeeze fist v9 vs Apertura de pecho v8 a 32px), abrir sesion de iteracion focal.

---

**Fin del audit. Pausa para revision del usuario antes de Tarea 2 (Plan de port).**
