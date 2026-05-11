# Sesion 59 — 2026-05-11 — feat(glyphs): 46 glifos canonicos por paso

**Version:** v0.27.6 → v0.28.0
**Bundle:** 538 KB → 557 KB (+19 KB, dentro del rango 545-605 KB)
**Modelo:** FASE A Sonnet (auditoria + andamiaje) · FASE B Opus 4.7 (diseno)

---

## Contexto

Durante una sesion activa de Mueve/Estira (y de los pasos `body` de un Camino
via PathRunner → PathBodyStep → MoveSession), todos los ejercicios mostraban
el **mismo placeholder**: un circulo punteado con un caracter tipografico
(`◯ ◬ ◇ △ ▢ ⬡ ✦` rotando segun `stepIdx % 7`). Diferentes ejercicios — la
misma figura. La pantalla activa no comunicaba que ejercicio toca hacer.

Decision de producto:
- Glifos canonicos solo en la **pantalla activa de sesion**, no en las cards
  de biblioteca (donde los codigos tipograficos SIT/HIP/SHLU funcionan bien).
- Lenguaje visual heredado de los 4 glifos de menu (`ABBreathe`, `ABStretch`,
  `ABMove`, `ABDrop`) en [`app/main.jsx:538-591`](../../app/main.jsx).
- Granularidad **por paso individual**, no por rutina: dentro de "Antidoto
  silla" hay 6 ejercicios distintos (Apertura de pecho, Rotacion toracica,
  Flexor de cadera, World's greatest stretch, Cuello y trapecios, Reset
  respiracion) y cada uno necesita su propio glifo.
- BreatheSession queda **fuera de scope** — usa `BreathVisual` (animacion
  guiada de fases), no tiene placeholder de paso que sustituir.

---

## FASE A (Sonnet) — Andamiaje + auditoria

### Archivos creados/modificados
- **NUEVO:** [`app/glyphs/exercise-glyphs.jsx`](../../app/glyphs/exercise-glyphs.jsx)
  — esqueleto con `EXERCISE_GLYPHS = {}`, `DefaultGlyph` (tres arcos
  concentricos suaves), `ExerciseGlyph({ id, size })` con fallback al default.
- [`app/move/MoveModule.jsx`](../../app/move/MoveModule.jsx) — `StepGlyph`
  reescrito: mantiene la moneda circular (`var(--move-soft)` 72×72), reemplaza
  el caracter tipografico por `<ExerciseGlyph id={step.name} size={44} />`.
  La key es `step.name` canonico en espanol (no `routine.id`), por
  granularidad por paso.
- [`PACE.html`](../../PACE.html) — script `app/glyphs/exercise-glyphs.jsx`
  cargado antes de FocusTimer/BreatheVisual/MoveModule/PathRunner.

### Auditoria de pasos (46 unicos)
46 step.name unicos entre `MOVE_ROUTINES` (Mueve, 13) y `EXTRA_ROUTINES`
(Estira, 33). Rango 31-50 → cardinalidad viable. Pasos compartidos entre
rutinas (`Chin tucks`, `Thoracic extension`, `Descanso`) reutilizan glifo
gracias a key compartida.

---

## FASE B (Opus 4.7) — Diseno de los 46 glifos

### Reglas de dibujo
- `viewBox="0 0 44 44"`, helper `<G>` aplica `fill="none"`,
  `stroke="currentColor"`, `strokeWidth="1.6"`, `strokeLinecap="round"`,
  `strokeLinejoin="round"`.
- Sin figura humana completa: objetos (silla, pared, barra, banda, foam
  roller), partes aisladas (cabeza-circulo, codo-angulo, cadera-pivote,
  mano-circulo), trayectorias (arcos, flechas curvas).
- `opacity` 0.35-0.55 para elementos secundarios (suelo, eje vertical,
  marcas 90°).
- `strokeDasharray="2 3"` para lineas de suelo punteado en estiramientos
  de pie/zancada.
- Cada glifo visualmente distinto de los otros 45 y del `DefaultGlyph`.

### Decisiones de diseno destacables
- **`Descanso` vs `Reset respiracion` vs `Deep breaths`**: los tres son
  "pausa/aire" pero diferenciados — Descanso = 3 circulos concentricos
  (pulso calmado), Reset respiracion = flecha circular con ondas internas
  (volver a la respiracion), Deep breaths = 3 ondas horizontales paralelas.
- **`Dead hang` vs `Hang pasivo`**: dos brazos rectos tensos vs dos brazos
  curvos relajados — misma barra, diferente postura.
- **`Wrist stretch` vs `Wrist circles`**: antebrazo + mano doblada con
  arco vs antebrazo + circulo completo de rotacion.
- **`Squat profundo` vs `Deep squat hold`**: M-shape dinamico vs M-shape
  + 3 dots de tiempo (hold indicator).
- **`Thoracic extension` vs `Rib pull + respiracion`**: arco sobre soporte
  estatico vs gato/vaca con puntos de aire.
- **Cuello (`Chin tucks` / `Cuello y trapecios` / `Inclinacion lateral`
  / `Rotacion lenta` / `Escalenos`)**: cada uno con diferente vector —
  flecha atras, inclinacion + tension diagonal, inclinacion sola, arco
  horizontal, anclaje hacia abajo.

### Keys con caracteres especiales
- `World's greatest stretch` (apostrofo)
- `Dead hang (si puedes)` (parentesis)
- `90/90` (barra)
- `Rib pull + respiracion` (signo +)
- `Shrug + round` (signo +)

Todos como strings literales con comillas dobles o simples segun el caso.

---

## Tabla de 46 keys con descripcion visual aplicada

### Mueve (13)
| # | Step name | Glifo aplicado |
|---|---|---|
| 1 | Flexiones inclinadas | Escritorio horizontal + linea diagonal del cuerpo + suelo punteado |
| 2 | Descanso | Tres circulos concentricos con opacidad decreciente |
| 3 | Fondos en silla | Silla en perfil + doble flecha vertical (subir/bajar) |
| 4 | Wall sit | Pared vertical + angulo recto cadera/rodilla 90° + suelo |
| 5 | Calf raises | Pie de perfil con talon despegado + flecha arriba + suelo |
| 6 | Seated hollow | Silla + cuerpo en banana levantado del asiento |
| 7 | Squeeze fist | Puno central + 8 lineas convergentes (fuerza al centro) |
| 8 | Finger extension | Palma + 5 dedos abanicandose hacia arriba |
| 9 | Wrist stretch | Antebrazo + mano doblada + arco curvo flex/ext |
| 10 | Chin tucks | Perfil de cabeza + flecha horizontal atras + neck guide |
| 11 | Scapular squeeze | Dos triangulos-omoplato + flechas inward + eje espinal |
| 12 | Thoracic extension | Arco curvo sobre soporte horizontal (foam roller) |
| 13 | Chest opener | Eje vertical + dos brazos curvos abriendose con manos |

### Estira (33)
| # | Step name | Glifo aplicado |
|---|---|---|
| 14 | Apertura de pecho | Cabeza + dos codos angulados abriendose como alas |
| 15 | Rotacion toracica | Cabeza + arco eliptico horizontal con flecha de giro |
| 16 | Flexor de cadera | Hip pivot + zancada con rodilla trasera al suelo |
| 17 | World's greatest stretch | Zancada profunda + arco de rotacion superior |
| 18 | Cuello y trapecios | Cabeza inclinada + linea trapecio con tension diagonal |
| 19 | Reset respiracion | Flecha circular de reset + dos ondas internas |
| 20 | Cossack squat | Hip + pierna doblada un lado + pierna extendida otro |
| 21 | 90/90 | Hip central + dos L espejadas con marcas 90° sutiles |
| 22 | Pigeon | Tibia frontal cruzada + pierna trasera estirada |
| 23 | Squat profundo | M-shape: rodillas anchas, cadera baja al centro |
| 24 | Puente con marcha | Arco de puente + pierna elevada con flecha |
| 25 | Scapular wall slides | Pared + brazos W → posicion Y deslizando |
| 26 | Band pull-apart | Banda elastica + dos manos + flechas hacia fuera |
| 27 | External rotation | Codo a 90° + arco de rotacion externa del hombro |
| 28 | Dead hang (si puedes) | Barra + dos brazos rectos colgados (rigido) + pies |
| 29 | ATG split squat | Zancada con rodilla muy por delante del pie |
| 30 | Tibialis raise | Pared + pierna + pie en flexion dorsal (puntas arriba) |
| 31 | Nordics | Cuerpo recto inclinado cayendo + pivote en rodillas |
| 32 | Sissy squat | Cuerpo inclinado atras + rodillas adelante + talones arriba |
| 33 | Elephant walk | Dos arcos consecutivos avanzando + puntos suelo + flecha |
| 34 | Deep squat hold | Squat profundo + 3 dots de tiempo (hold) |
| 35 | Crawling | Espalda arqueada + cuatro patas + flecha avance |
| 36 | Hang pasivo | Barra + dos brazos curvos relajados (suave) |
| 37 | Ground sitting transitions | Dos niveles unidos por curva descendente |
| 38 | Rib pull + respiracion | Gato/vaca (dos arcos opuestos) + puntos de aire |
| 39 | Inclinacion lateral | Cabeza inclinada + eje vertical de referencia + flecha |
| 40 | Rotacion lenta | Cabeza + arco eliptico horizontal sobre el hombro |
| 41 | Escalenos | Cabeza inclinada + brazo anclado hacia abajo |
| 42 | Shrug + round | Hombros elevandose + flechas arriba |
| 43 | Wrist circles | Antebrazo + circulo completo de rotacion + flecha |
| 44 | Seated twist | Silla + torso + arco de rotacion hacia el respaldo |
| 45 | Ankle circles | Pierna vertical + circulo en tobillo + flecha rotacion |
| 46 | Deep breaths | Tres ondas horizontales paralelas (inhalaciones) |

---

## Validaciones (V1-V6)

- **V1:** `exercise-glyphs.jsx` = 569 lineas (≤ 700 acordado). `Object.assign(window, {...})` presente 1 vez.
- **V2:** 46 keys presentes en `EXERCISE_GLYPHS`. Conteo confirmado por grep.
- **V3:** Helper `G` aplica `viewBox="0 0 44 44"`, `fill="none"`, `stroke="currentColor"` una sola vez. Sin `<text>` ni `fill` solido. Sin `fillOpacity`.
- **V4:** 46 entradas con paths visualmente distintos por diseno.
- **V5:** Bundle = 557 KB, 0 errores, 0 WARN.
- **V6:** `check-session.ps1` → estado consistente (cambios sin commitear esperados, worktree prunable detectado).

---

## Proxima sesion (sugerencias)
- Verificar visualmente recorriendo 4-5 rutinas distintas en navegador.
- Si algun glifo no comunica bien, iterar con paths refinados.
- Considerar glifos para BreatheSession (fuera de scope ahora, podria entrar
  como capa adicional sin sustituir `BreathVisual`).
- PathYearView mobile (heatmap en 320px) — pendiente desde s58.
- Detector logro `master.midnight.never` — pendiente desde s58.
