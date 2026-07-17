# Auditoría B2.1 · Ejercicio a ejercicio — Mueve · Estira · Registro · Caminos

> **Fecha:** 2026-07-16 · **Base auditada:** v0.53.0 (post-B1.2) · **Sesión:** 109
> **Encargo:** `BASE_MUEVE_ESTIRA.md` §11 — SOLO auditoría, CERO código.
> **Fuentes:** `app/move/MoveModule.jsx` (MOVE_ROUTINES, 14 rutinas / 62 steps) ·
> `app/extra/ExtraModule.jsx` (EXTRA_ROUTINES, 14 rutinas / 71 steps) ·
> `app/custom/exercise-registry.js` (65 ejercicios / 8 grupos) ·
> `app/paths/registry.js` (7 Caminos / 5 steps `body`).
> **Fuera de alcance:** el copy de seguridad (saneado en B1.2, no se re-audita) y
> Respira (su contrato es de fases, no de pasos de ejercicio).
> **Reglas aplicadas:** BASE §3 (unidad por tipo) · §4 (duración calculada) ·
> §5 (rangos de producto) · §6 (transiciones ≠ descansos, ambos contabilizados) ·
> §7 (explicación mínima) · §11 (ficha y decisiones).

---

## 0 · Método y convenciones

- **Unidad de auditoría:** 66 ejercicios únicos (los 65 del registro + `Dead hang
  · opcional`, que vive solo en `move.shoulders.5` y quedó fuera del registro por
  decisión s93) + 28 rutinas como contenedores.
- **Modo actual:** es **uniformemente `timed`** — todo step es `{ dur: segundos }`
  y el runner (`MoveSession`, MoveModule.jsx:226-243) avanza solo al agotar `dur`.
  Por eso Tabla B solo da el modo **recomendado**; el actual es siempre el mismo.
- **Duración activa real:** calculada con §4 (reps × tempo × lados; tiempo por
  lado × 2 + cambio; retención postural = reps × (movimiento + retención +
  regreso)). Tempo por defecto cuando el cue no lo da: fuerza 3-4 s/rep
  controlada, ciclos de movilidad 3-6 s, cambio de lado 5-10 s, cambio de
  posición 10-20 s, suelo↔de pie 15-30 s.
- **Total real estimado:** activa + descansos declarados + colocaciones +
  transiciones §6 + cierre. Rango honesto, no cifra exacta.
- **Decisiones:** `mantener` / `reescribir` / `cambiar temporización` /
  `cambiar de categoría` / `sustituir` / `retirar` / `revisar con fisioterapeuta`.
  «Cambiar temporización» = migrar al contrato de pasos v1 (`reps` / `perSide` /
  `manual`…) en B2.2-B2.3; NO retocar segundos dentro del formato actual.

### Hallazgos estructurales del runner (afectan a las 28 rutinas)

| # | Hallazgo | Evidencia | Regla que incumple |
|---|---|---|---|
| R1 | La preparación es un countdown global de **3 s** y no existe colocación por paso: el timer del paso arranca mientras el usuario aún lee el cue | MoveModule.jsx:210, 218-223 | §3C·D «el temporizador nunca arranca mientras el usuario aún lee cómo colocarse» |
| R2 | Todo paso auto-avanza al agotar `dur` — las reps no terminan en «Terminé» | MoveModule.jsx:226-243 | §3A «NO auto-avanzar», completion manual |
| R3 | El cambio de lado no existe como concepto: ni aviso, ni reinicio de contador, ni tiempo propio | (no hay código de lados en MoveSession) | §3C pasos 4-6, §6 |
| R4 | Los minutos que acreditan stats/logros son los **declarados** (`routine.min`), no los reales | MoveModule.jsx:206-209 (`dispatchComplete`) | §4 — si declarado ≠ real, las stats heredan la mentira |
| R5 | Los descansos son steps normales con glifo/cue: no se distinguen de trabajo ni de transición | steps `Descanso` en 8 rutinas | §6 transición ≠ descanso, ambos como tipos propios |

Estos 5 son **de contrato v1** (B2.2-B2.3), no de contenido: se arreglan una vez
en el runner y liberan a las 28 rutinas a la vez. La auditoría por rutina de
abajo asume que R1-R5 se resuelven ahí y señala solo lo específico de cada una.

---

## 1 · Resumen ejecutivo

### 1.1 Hallazgos sistémicos (contenido)

1. **Reps encerradas en temporizador — 100 % de la fuerza de Mueve.** Las 8
   rutinas de fuerza (empuje, piernas, sigilo-fuerza, espalda) declaran reps en
   el cue («10-12 reps») dentro de un `dur` fijo. En 5 casos la aritmética ni
   siquiera cabe (ver 1.2). Incumple §3A de raíz.
2. **Estáticos sin tiempo por lado.** De los ~14 ejercicios bilaterales en uso,
   **ninguno** tiene el lado como unidad: o el cue reparte a ojo («20 s por
   lado» dentro de un `dur` que no suma el cambio), o ni menciona lados
   (Flexor de cadera en sus 2 usos, Seated twist, External rotation, ATG split
   squat). Incumple §3C.
3. **Transiciones invisibles.** 11 rutinas pasan por suelo, pared o barra y
   ninguna contabiliza el cambio de posición (§6: suelo↔de pie 15-30 s). Es la
   causa principal de que lo declarado quede corto en las rutinas largas.
4. **Declarado ≠ suma ≠ real.** En 19 de 28 rutinas `min` no coincide con la
   suma de steps, y en ~13 la duración real (activa + transiciones + colocación)
   se aleja ≥ 30 s de lo declarado. Con R4, además, las stats acreditan el
   número equivocado.
5. **Ejercicios demasiado avanzados para su contexto.** Nordics, Sissy squat,
   ATG split squat, Couch stretch, Squat profundo (talones abajo) y Ground
   sitting transitions «sin manos» aparecen sin escalón previo ni alternativa
   en cue (salvo Nordics «asistidos», vago). Dos de ellos llegan a novatos vía
   Caminos free (ver 1.2 caso 13).

### 1.2 Los 15 casos peores

| # | Caso | Evidencia | Problema | Propuesta |
|---|---|---|---|---|
| 1 | **Pigeon en `move.hips.5`** | ExtraModule.jsx:103 | «40s por lado» = 80 s dentro de `dur: 60` — **matemáticamente imposible** | perSide 30 s + cambio 10 s, o recortar a 25 s/lado |
| 2 | **Isquio a una pierna** | ExtraModule.jsx:139 | «40s por lado» = 80 s exactos en `dur: 80` → cambio de lado = 0 s | perSide + transición §6; patrón repetido en Plancha lateral (30+30=60 en `dur:60`, MoveModule.jsx:141), Pigeon en couch.stretch (60 en 60, ExtraModule.jsx:113) y Wrist stretch (40 en 40, ExtraModule.jsx:54) |
| 3 | **Gemelos subrepticios** | MoveModule.jsx:64-65 | «25 reps controladas» en 30 s = 1,2 s/rep — el cue contradice al timer; real ≈ 2:00-2:30 vs declarada 1 | reps (2×15-20) con final manual |
| 4 | **Chin tucks en `extra.posture.set`** | MoveModule.jsx:125 | 10 reps posturales (§3E: movimiento + retención 3-5 s + regreso ≈ 6-8 s/rep) en 30 s — caben 4 | posturalControl: 5 reps · retención 3-5 s (BASE lo usa de ejemplo canónico) |
| 5 | **Glúteos invisibles s0** | MoveModule.jsx:75 | «20 apretones firmes, 2 segundos cada uno» = 40 s + soltar, dentro de `dur: 30` | reps con retención; recortar a 12-15 o subir tiempo |
| 6 | **Piernas · a una (entera)** | MoveModule.jsx:108-116 | Búlgara «8 por pierna» = 16 reps + cambio en 50 s (≈3 s/rep con equilibrio: no) · ATG y Sissy sin reps ni lados · real ≈ 5:30-6:00 vs declarada 4 · 3 de 4 ejercicios avanzados | reescribir: bajar volumen, perSide explícito, escalón previo |
| 7 | **Nordics** | ExtraModule.jsx:130, registry:37 | Muy avanzado (excéntrico de isquios de alta demanda) · necesita anclar los pies y el material NO se indica · «asistidos si hace falta» sin decir cómo | **sustituir** en `move.atg.knees` (p. ej. puente isquio a una pierna) + **revisar con fisioterapeuta** antes de reintroducir |
| 8 | **Flexiones de escritorio** | MoveModule.jsx:24-31 | Declarada 2 min · suma 2:10 · real ≈ 3:00 (30 reps × 4 s + descansos + colocación) — y es candidata piloto: arquetipo del caso fuerza | piloto v1: reps 12/10/8 · final manual · duración «2-3 min» |
| 9 | **Sentadilla en pared** | MoveModule.jsx:104-106 | Holds de 60 s — §3D dice 10-30 s según nivel, no 60 automáticos · declarada 2, real 2:45 | 2×30-40 s o rango elegible |
| 10 | **`extra.back.desk` / Superman** | MoveModule.jsx:134 | Único paso de suelo en rutina de silla: silla→suelo→silla ≈ 30-60 s no contados (declarada 3, real ≈ 3:40-4:20) | transición §6 como step propio, o versión de pie (banda/pared) |
| 11 | **Antídoto silla** | ExtraModule.jsx:22-31 | Declarada 5, real ≈ 5:50-6:30 · Flexor de cadera sin lados en el cue · WGS («zancada + mano al suelo + rotación») = 3 acciones en 8 palabras para novatos · candidata piloto por ser la mezcla completa | piloto v1: perSide + transition + flow con ciclos |
| 12 | **`extra.push.ladder` negativas** | MoveModule.jsx:46 | «Baja en 5 segundos» sin número de reps en `dur: 45` → ¿7? ¿5? El tempo declarado es incompatible con un timer mudo | reps con tempo (3-5 × 5 s exc.) |
| 13 | **Caminos free sirven contenido avanzado a novatos** | registry.js:26 (midday→`move.hips.5`), registry.js:79 (weekend→`move.atg.knees` tasting) | midday es free y arrastra el Pigeon imposible + paso por suelo sin anuncio en el Camino; weekend degusta ATG (Nordics, Sissy) como *primer contacto* premium | al pilotar v1: hips.5 dentro; decidir si weekend degusta otra rutina (p. ej. `move.shoulders.5`) |
| 14 | **Duplicados con nombres distintos** | registry:68-69 (Apertura de pecho / Chest opener), registry:100-101 (Squat profundo / Deep squat hold), registry:119-120 (Deep breaths / Reset respiración) | Mismo patrón motor con 2 identidades → 2 glifos, 2 traducciones, 2 fichas | mapa `visualId` B2.2 los unifica sin tocar datos persistidos |
| 15 | **Leftover editorial B1.2** | exercise-registry.js:117 | `Finger extension`: «Abre los dedos al máximo» — el barrido s108 saneó el uso en rutina (`extra.grip.squeeze`: «sin forzar») pero no el registro | 1 línea en B2.2 (es código; hoy no se toca) |

### 1.3 Propuesta de piloto para el contrato de pasos v1 (B2.2)

Confirmo las candidatas de `DECISIONES_PRODUCTO.md` y las razono contra lo
hallado — **6 rutinas, cada una estrena un modo distinto del contrato**:

| Rutina | Módulo | Modos que estrena | Por qué esta |
|---|---|---|---|
| Diafragmática | Respira | `timed` (control) | Caso trivial: valida el fallback sin ruido |
| Coherente 5·5 | Respira | `timed` | Ídem; además vive en 3 Caminos |
| **Flexiones de escritorio** (`extra.desk.pushups`) | Mueve | `reps` + `rest` + final manual | Arquetipo fuerza (caso 8); en `path.afternoon` → el piloto se prueba también dentro del runner de Caminos |
| **Sentadillas de silla** (`extra.chair.squats`) | Mueve | `reps` + `rest` | La fuerza más limpia del catálogo (su aritmética casi cuadra ya): mide el contrato sin arreglar contenido a la vez |
| **Cuello · 3 min** (`move.neck.3`) | Estira | `perSide` + `posturalControl` (reps con retención) | 3 de 4 pasos son bilaterales; en `path.dawn` |
| **Antídoto silla** (`move.chair.antidote`) | Estira | `perSide` + `transition` + flow por ciclos | La mezcla completa (caso 11); en `path.dusk` |

**Suplente prioritaria:** `move.hips.5` — contiene el caso 1 (Pigeon imposible)
y vive en `path.midday` (free). Si el piloto va holgado, entra la 7ª; si no, es
la primera de la ola 2.

---

## 2 · Tabla A — Las 28 rutinas

Columnas: **Decl.** = `min` declarado · **Suma** = Σ `dur` de steps · **Activa**
= trabajo real calculado (§4) · **Total** = activa + descansos + colocaciones +
transiciones + cierre. La decisión es de la RUTINA (la de cada ejercicio va en
Tabla B).

### 2.1 Mueve (`MOVE_ROUTINES`, MoveModule.jsx:19-148)

| Rutina (id) | Acceso | Decl. | Suma | Activa real | Total real | Problemas específicos | Decisión |
|---|---|---|---|---|---|---|---|
| Flexiones de escritorio `extra.desk.pushups` | free | 2 | 2:10 | ≈2:00 (30 reps×4 s) | **2:50-3:10** | Reps en timer (12/10/8 en 30 s: justo en el límite); decl. corta | **cambiar temporización** (piloto) |
| Fondos en silla `extra.chair.dips` | free | 3 | 3:00 | ≈1:45-2:20 | 3:20-3:50 | Reps en timer; ejercicio con carga de hombro (ver ficha) | cambiar temporización |
| Empuje · progresión `extra.push.ladder` | premium | 3 | 2:45 | ≈2:00 | 3:10-3:30 | Negativas sin nº de reps (caso 12); pica sin escalón en cue | cambiar temporización + reescribir cue de negativas |
| Colgarse `extra.hang.bar` | premium | 2 | 2:10 | 1:30 holds | 2:40-3:00 | Unidad correcta (tiempo ✓); falta subir/bajar de barra y decl. corta | **mantener** (ajustar total; material ya anunciado B1.2) |
| Gemelos subrepticios `extra.calves` | free | 1 | 1:00 | ≈1:30-2:15 (45 reps×2-3 s) | **2:00-2:30** | Caso 3: 25 reps «controladas» en 30 s; decl. es la mitad del real | cambiar temporización |
| Grip + antebrazos `extra.grip.squeeze` | free | 1 | 1:00 | ≈1:00-1:20 | 1:20-1:40 | Wrist stretch sin lados; mezcla fuerza+estiramiento sin transición (leve) | mantener (perSide en muñeca al migrar) |
| Glúteos invisibles `extra.glutes.stealth` | free | 2 | 1:45 | ≈2:20 | 2:40-3:00 | Caso 5: 20×2 s = 40 s en `dur:30`; el «Aguanta 10 s, suelta. 3 veces» (39 s en 30) tampoco cabe | cambiar temporización |
| Core silencioso `extra.core.stealth` | premium | 2 | 2:10 | 1:30 holds | 2:30-2:45 | Unidad correcta (isometría 30 s ✓ §3D); solo falta colocación por hold | **mantener** |
| Sentadillas de silla `extra.chair.squats` | free | 3 | 2:40 | ≈1:45-2:00 | 2:50-3:10 | La más honesta de la fuerza; aun así reps en timer | **cambiar temporización** (piloto) |
| Sentadilla en pared `extra.wall.sit` | premium | 2 | 2:30 | 2:00 holds | 2:45-3:00 | Caso 9: holds de 60 s > rango §3D (10-30 s); decl. corta | cambiar temporización (2×30-40 s o elegible) |
| Piernas · a una `extra.legs.single` | premium | 4 | 3:45 | ≈3:50-4:30 | **5:30-6:00** | Caso 6: aritmética imposible + 3/4 ejercicios avanzados sin escalón | **reescribir** |
| Postura reset `extra.posture.set` | free | 2 | 2:00 | ≈2:40 | 3:00-3:20 | Caso 4 (chin tucks); thoracic ext sin ciclos; mezcla postural+movilidad+estático sin transición | cambiar temporización |
| Espalda de oficina `extra.back.desk` | free | 3 | 2:40 | ≈2:45 | **3:40-4:20** | Caso 10: Superman mete silla→suelo→silla sin contar; pull-apart sin nº reps | cambiar temporización + transición §6 |
| Core · plancha `extra.core.plank` | premium | 4 | 3:25 | 2:45 holds | 4:15-4:40 | Plancha lateral 30+30 = `dur:60` exactos (cambio = 0 s); plancha 45 s alta para entrada (§3D) | cambiar temporización (perSide + holds 20-40 s elegibles) |

### 2.2 Estira (`EXTRA_ROUTINES`, ExtraModule.jsx:17-169)

| Rutina (id) | Acceso | Decl. | Suma | Activa real | Total real | Problemas específicos | Decisión |
|---|---|---|---|---|---|---|---|
| Antídoto silla `move.chair.antidote` | free | 5 | 4:20 | ≈4:35 | **5:50-6:30** | Caso 11: flexor sin lados, WGS críptico, suelo sin transición; decl. corta | **cambiar temporización** (piloto) |
| Cuello · 3 min `move.neck.3` | free | 3 | 3:00 | ≈3:00 | 3:15-3:30 | 3 de 4 pasos bilaterales sin aviso ni reparto de lado; chin tucks como timed | **cambiar temporización** (piloto) |
| Escritorio express `move.desk.quick` | free | 2 | 2:00 | ≈2:00-2:30 | 2:15-2:45 | Chin tucks «5 veces» = 25-30 s en `dur:20`; wrist circles 10+10 en 20 s (1 s/círculo); defendible solo como exploratorio §3B — pero declara ciclos | cambiar temporización o reescribir cues a exploratorio |
| Muñecas y manos `move.wrists` | free | 3 | 3:00 | ≈3:00 | 3:10-3:30 | El mejor caso del catálogo; wrist stretch 20+20 = `dur:40` exactos (cambio = 0) | mantener (perSide al migrar) |
| Hombros · 5 pasos `move.shoulders.5` | free | 4 | 3:55 | ≈3:50 | **4:30-5:00** | External rotation sin lados; pull-apart y wall slides sin nº reps; buscar roller/toalla no contado; desc no anuncia roller/toalla (el cue sí) | cambiar temporización |
| Hombros · círculos `move.shoulder.circles` | free | 4 | 4:00 | ≈4:00 | 4:10-4:30 | Ciclos declarados y compatibles (20 círculos×3 s ✓): el más migrable a `ciclos` | **mantener** (migrar a ciclos sin retocar cifras) |
| Columna · ondas `move.spine.waves` | premium | 5 | 4:45 | ≈4:45 | **5:45-6:15** | 4 cambios de posición (suelo↔pie↔sentado) sin contar; gato-camello sin nº ciclos | cambiar temporización + transición §6 |
| Caderas · 5 pasos `move.hips.5` | free | 6 | 5:00 | ≈5:20 | **6:30-7:00** | **Caso 1: Pigeon imposible** (80 s en 60); puente sin reps; pie→suelo sin transición; en `path.midday` free | **cambiar temporización** (suplente piloto) |
| Couch stretch `move.couch.stretch` | premium | 5 | 5:00 | ≈5:00 | **6:00-6:45** | Couch: colocación lenta (20-30 s/lado) no contada — es lo que más come; flexor sin lados; pigeon 60 en 60; curioso: couch 30+30 en `dur:70` SÍ deja 10 s de cambio (único caso) | cambiar temporización |
| Caderas · suelo `move.hips.ground` | premium | 6 | 5:50 | ≈5:50 | 6:30-7:00 | Ground transitions «sin manos» sin alternativa en cue; rana intensa sin escalón; decl. casi honesta | cambiar temporización + cues con alternativa |
| ATG · Rodillas a prueba `move.atg.knees` | premium | 4 | 4:00 | ≈4:10 | **5:00-5:30** | Caso 7: **Nordics** (material de anclaje no indicado, muy avanzado); ATG split sin lados contados; degustada en `path.weekend` | **reescribir** (sustituir Nordics) |
| Cadena posterior `move.hamstrings` | premium | 5 | 4:50 | ≈4:50 | 5:20-5:40 | Caso 2: isquio 40+40 = `dur:80` exactos; pliegue 70 s > rango §3C estándar (defendible como «sesión larga» premium) | cambiar temporización |
| Despertar matinal `move.morning.flow` | free | 5 | 4:45 | ≈4:45 | 5:30-6:00 | Suelo→sentado→pie sin transición; gato-camello sin ciclos | cambiar temporización + transición §6 |
| Ancestral `move.ancestral` | premium | 5 | 4:30 | ≈4:30 | 5:30-6:00 | Deep squat 60 s sin alternativa de talones; transitions sin manos; barra ya anunciada ✓ | cambiar temporización + cues con alternativa |

**Lectura transversal de Tabla A:** ninguna rutina se propone retirar. 2
mantener limpias (`hang.bar`, `core.stealth` — unidad ya correcta), 3 mantener
con migración trivial (`grip.squeeze`, `wrists`, `shoulder.circles`), 21
cambiar temporización (= contrato v1), 2 reescribir (`legs.single`,
`atg.knees`).

---

## 3 · Tabla B — Fichas de los 66 ejercicios únicos

Una fila = ficha §11 compacta. **Modo v1** usa el vocabulario del contrato
(`reps` · `perSide` · `timed` · `ciclos` [= reps de movilidad] · `posturalControl`
[= reps + retención] · `flow` · `rest` · `manual`). **Aparece en** abrevia ids
(`d.pushups` = `extra.desk.pushups`…); ⛰ = llega a un Camino. Los casos con
decisión ≠ mantener/cambiar-temporización llevan nota expandida al pie del grupo.

### Grupo · Empuje y tracción

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Flexiones inclinadas | dynamicStrength | reps (t. 2-0-2) | no | de pie · mesa estable | d.pushups ×3, push.ladder ×2 ⛰afternoon | reps en timer | superficie más alta | cambiar temporización |
| Pica en escritorio | dynamicStrength | reps | no | de pie · mesa estable | push.ladder | intermedio-avanzado, sin escalón en cue | flexión inclinada normal | cambiar temporización + cue con escalón |
| Fondos en silla | dynamicStrength | reps | no | silla estable sin ruedas | ch.dips ×3 | carga de hombro en extensión: rango corto no explicitado | rango corto / flexiones inclinadas | cambiar temporización + **revisar con fisioterapeuta** (nota 1) |
| Hang pasivo | staticStretch (descompresión) | timed | no | barra firme | hang.bar ×2, ancestral | ✓ unidad correcta | pies apoyados en el suelo | mantener |
| Hang activo | isometricHold | timed | no | barra firme | hang.bar | ✓ unidad correcta; exige más hombro | hang pasivo | mantener |

> **Nota 1 · Fondos en silla:** el ejercicio con más literatura de molestia de
> hombro del catálogo doméstico (extensión cargada tras horas encogido). B1.2 ya
> puso silla estable y reps limpias; lo que falta es ESTRUCTURA: limitar
> profundidad en el cue de acción (§7-2) y alternativa por defecto. No se
> propone retirar — es útil y popular — pero sí pasar su ficha por fisio antes
> de B4 (piloto visual).

### Grupo · Piernas

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Sentadilla a silla | dynamicStrength | reps | no | silla estable | ch.squats ×3 | reps en timer (aritmética casi ✓) | sentarse del todo y levantarse | cambiar temporización (piloto) |
| Wall sit | isometricHold | timed 10-30 s | no | pared | wall.sit ×2 | holds de 60 s > §3D | más alto (menos flexión) — ya en cue B1.2 ✓ | cambiar temporización |
| Sentadilla búlgara | dynamicStrength | perSide (reps) | **sí** | de pie · silla estable | legs.single | 8/pierna + cambio en 50 s: imposible; equilibrio no avisado | zancada estática corta | cambiar temporización |
| ATG split squat | dynamicStrength + movilidad cargada | perSide (reps) | **sí** | de pie/rodilla · suelo | legs.single, atg.knees ⛰weekend | avanzado; sin reps ni lados en `dur` fijo | zancada con menos rango | cambiar temporización + cue con escalón |
| Sissy squat | dynamicStrength (rodilla dominante) | reps | no | de pie · apoyo | legs.single, atg.knees ⛰weekend | avanzado, alta cizalla de rodilla; «apoyado» es todo el escalón que hay | sentadilla a silla | **revisar con fisioterapeuta** (nota 2) |
| Nordics | dynamicStrength (excéntrico) | reps | no | rodillas · **anclaje de pies NO indicado** | atg.knees ⛰weekend | caso 7: muy avanzado + material ausente + «asistidos» vago | puente isquio a una pierna | **sustituir + revisar con fisioterapeuta** (nota 2) |
| Tibialis raise | dynamicStrength | reps | no | de pie · pared | atg.knees ⛰weekend | reps sin número | menos rango | cambiar temporización |
| Calf raises | dynamicStrength | reps | a veces («12 por lado» en legs.single) | de pie | calves ×2, glutes.stealth, legs.single | caso 3: 25 «controladas» en 30 s | a dos piernas, menos reps | cambiar temporización |
| Puente con marcha | dynamicStrength/control | reps alternas | alterna | **suelo** | hips.5 ⛰midday, couch, hamstrings | reps sin número; suelo no siempre anunciado por la rutina | puente estático | cambiar temporización |

> **Nota 2 · Nordics y Sissy squat:** son los dos ejercicios que BASE §1
> describiría como «prioritarios o con más riesgo → revisión profesional». Ambos
> viven SOLO en premium, pero `move.atg.knees` se degusta gratis en
> `path.weekend` (registry.js:79). Propuesta concreta: en B2.2, Nordics sale de
> `move.atg.knees` (entra puente isquio a una pierna) y queda en la lista de
> revisión con fisioterapeuta junto a Sissy squat, Fondos en silla y Couch
> stretch para decidir su forma definitiva (o su retirada) antes de v1.0.

### Grupo · Core y espalda

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Plancha | isometricHold | timed 20-40 s | no | **suelo** | core.plank ×2 | 45 s de entrada > §3D para público general | rodillas apoyadas | cambiar temporización |
| Plancha lateral | isometricHold | **perSide** (timed) | **sí** | **suelo** | core.plank | caso 2 (patrón): 30+30 = `dur:60`, cambio = 0 s | rodilla inferior apoyada | cambiar temporización |
| Hollow hold | isometricHold | timed | no | **suelo** | core.plank | avanzado; 30 s razonable con alternativa | rodillas dobladas | mantener (cue con alternativa) |
| Seated hollow | isometricHold | timed | no | silla estable | core.stealth ×3 | ✓ unidad y dosis correctas (B1.2 pulió el cue) | pies más bajos | **mantener** |
| Superman | dynamicStrength | reps lentas | no | **suelo** (boca abajo) | back.desk | única ida al suelo de su rutina (caso 10) | apertura de pecho de pie | cambiar temporización + transición |
| Scapular squeeze | posturalControl | posturalControl (reps + 2 s) | no | silla | posture.set, back.desk | ✓ cue ya trae reps y retención; solo encerrado en timer | menos reps | cambiar temporización |
| Band pull-apart | dynamicStrength ligera | reps | no | de pie/silla · banda opcional | back.desk, shoulders.5, sh.circles | «sin banda: brazos cruzados + abre con tensión» — la alternativa es difícil de visualizar (§7-5, claridad) | — | cambiar temporización + reescribir cue alternativo |
| Apretar glúteos | isometric reps | posturalControl (reps + retención) | no | silla | glutes.stealth ×2 | caso 5: la aritmética del cue no cabe en `dur` | menos apretones | cambiar temporización |

### Grupo · Cuello y hombros

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Chin tucks | posturalControl | posturalControl (5 reps · 3-5 s) | no | silla/de pie | posture.set, neck.3 ⛰dawn, desk.quick | caso 4: reps posturales en timer, no caben en 2 de 3 usos | menos reps | cambiar temporización (§3E, ejemplo canónico de BASE) |
| Cuello y trapecios | staticStretch | **perSide** | **sí** | silla | chair.antidote ⛰dusk, morning.flow | 40-45 s sin reparto de lado ni aviso | menos inclinación | cambiar temporización |
| Inclinación lateral | staticStretch | **perSide** | **sí** | silla | neck.3 ⛰dawn | «cada lado» a ojo dentro de 50 s | ídem | cambiar temporización |
| Rotación lenta | dynamicMobility suave | perSide (ciclos) | **sí** | silla | neck.3 ⛰dawn | ídem | menos rango | cambiar temporización |
| Escalenos | staticStretch | **perSide** | **sí** | silla (mano bajo glúteo) | neck.3 ⛰dawn | 2 lados en 40 s sin aviso = 18 s/lado + cambio no contado | sin anclar la mano | cambiar temporización |
| Shrug + round | dynamicMobility | ciclos | no | silla | desk.quick, sh.circles | sin nº de ciclos en un uso | — | mantener (ciclos al migrar) |
| Círculos de hombro | dynamicMobility | ciclos | por sentido/lado | de pie/silla | sh.circles | ✓ «5 por sentido y lado» compatible con su `dur` | menos amplitud | **mantener** |
| Scapular wall slides | posturalControl/movilidad | reps | no | pared | shoulders.5 | reps sin número | menos rango | cambiar temporización |
| External rotation | dynamicMobility/fuerza ligera | **perSide** (reps) | **sí** | silla/de pie | shoulders.5, sh.circles | cue nunca menciona lados: probablemente la gente hace uno | — | cambiar temporización |
| Apertura de pecho | staticStretch/movilidad | timed o reps | no | silla/de pie | back.desk, chair.antidote ⛰dusk, sh.circles, morning.flow | duplica Chest opener (caso 14) | menos apertura | mantener + **unificar visualId** |
| Chest opener | staticStretch | timed | no | silla/de pie | posture.set | duplicado del anterior con nombre EN | ídem | **sustituir por visualId compartido** (B2.2; sin tocar datos) |
| Thoracic extension | movilidad/estático | reps o timed | no | silla (respaldo) · roller/toalla en shoulders.5 | posture.set, shoulders.5 | material solo en cue, no en desc de shoulders.5; sin ciclos | solo respaldo | cambiar temporización |

### Grupo · Columna

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Rotación torácica | dynamicMobility | perSide (ciclos) | **sí** | silla | chair.antidote ⛰dusk, spine.waves, morning.flow | rotación bilateral sin reparto | menos rango | cambiar temporización |
| Gato-camello | dynamicMobility | ciclos | no | **suelo** (cuadrupedia) | spine.waves, morning.flow | sin nº de ciclos; §3F pide contarlos con principiantes | sentado (gato-vaca en silla) | cambiar temporización |
| Onda espinal | flow | ciclos | no | de pie | spine.waves | sin nº de ciclos; patrón sutil difícil de aprender por texto (candidata B4 dos-poses) | rodar hacia abajo simple | cambiar temporización |
| Puente torácico | flow/movilidad | reps | no | **suelo/sentado** | spine.waves | intermedio-avanzado; sin reps | puente de glúteo corto | cambiar temporización + cue con escalón |
| Rodar hacia abajo | dynamicMobility | ciclos lentos | no | de pie | spine.waves | precaución mareo cubierta por salida lenta §9 ✓; sin ciclos | medio recorrido | cambiar temporización |
| Seated twist | staticStretch/movilidad | **perSide** | **sí** | silla | desk.quick | cue «rota hacia el respaldo» = UN lado; el otro no existe | — | **reescribir** (añadir 2º lado) |
| Rib pull + respiración | dynamicMobility | ciclos | no | **suelo** | ancestral | nombre dice «rib pull», cue dice «movimiento de gato/vaca»: identidad confusa (§7, claridad); posible duplicado funcional de Gato-camello | — | **reescribir** (o unificar con Gato-camello vía visualId) |

### Grupo · Caderas

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Flexor de cadera | staticStretch | **perSide** | **sí** | **suelo** (rodilla apoyada) · cojín opcional | chair.antidote ⛰dusk, couch | el ejemplo de calibración de BASE §4 (1:28-2:02 real); sus 2 usos (50 s) ni mencionan lados | menos empuje de pelvis | cambiar temporización (usar §4 tal cual) |
| Couch stretch | staticStretch intensa | **perSide** | **sí** | **suelo** · pared o silla | couch | colocación lenta no contada; intensidad alta sin escalón intermedio | flexor de cadera normal | cambiar temporización + **revisar con fisioterapeuta** (rodilla en flexión máxima + lumbar en extensión) |
| 90/90 | dynamicMobility/flow | ciclos (entre lados) | alterna | **suelo** | hips.5 ⛰midday, couch, hips.ground | sin nº de ciclos | manos detrás como apoyo | cambiar temporización |
| Pigeon | staticStretch | **perSide** | **sí** | **suelo** | hips.5 ⛰midday, couch | **caso 1: 40 s/lado en `dur:60`** — imposible; intermedio para novatos de Camino free | figura-4 EN SILLA (más de oficina que el propio pigeon) | cambiar temporización + añadir alternativa en cue |
| Rana | staticStretch/movilidad | timed + mecer | no | **suelo** | hips.ground | intensa en aductores, sin escalón | menos apertura de rodillas | mantener (cue con alternativa) |
| Cossack squat | dynamicMobility/fuerza | perSide (reps) | **sí** | de pie | hips.5 ⛰midday, hips.ground | ✓ «5 por lado» compatible (60 s); solo encerrado en timer | menos profundidad | cambiar temporización |
| World's greatest stretch | flow | perSide (ciclos) | **sí** | **suelo** | chair.antidote ⛰dusk | 3 acciones en 8 palabras (caso 11); candidata nº 1 a B4 dos-poses | zancada + rotación sin mano al suelo | **reescribir** cue (formato §7 por capas) |

### Grupo · Suelo y cadena posterior

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Squat profundo | staticStretch/hold | timed | no | **suelo** (talones abajo) | hips.5 ⛰midday, morning.flow, hips.ground | avanzado para público de oficina: muchos no bajan con talones; sin alternativa en 2 de 3 usos | talones sobre toalla / agarrarse a algo | cambiar temporización + cue con alternativa |
| Deep squat hold | staticStretch/hold | timed | no | **suelo** | ancestral | duplicado de Squat profundo (caso 14) | ídem | **unificar visualId** |
| Crawling | flow | timed guiado | contralateral | **suelo** · espacio | ancestral | ✓ tiempo guiado defendible §3F; necesita 2-3 m libres (no indicado) | gateo estático (peso sin avanzar) | mantener (anotar espacio) |
| Ground sitting transitions | flow/fuerza | reps | no | **suelo** | hips.ground, ancestral | «sin manos» sin alternativa = barrera dura para el público objetivo | con manos permitidas | **reescribir** cue (con manos como forma base) |
| Elephant walk | dynamicMobility | ciclos/pasos | alterna | **suelo** (manos) | atg.knees ⛰weekend, hamstrings | pasos sin número | rodillas más dobladas | cambiar temporización |
| Pliegue adelante | staticStretch | timed | no | de pie | hamstrings | 70 s > §3C estándar (ok como premium «larga»); salida lenta ya cubierta §9 ✓ | manos en las rodillas | mantener |
| Isquio a una pierna | staticStretch | **perSide** | **sí** | de pie · apoyo del talón | hamstrings | caso 2: 40+40 = `dur:80` exactos, cambio = 0 | menos inclinación | cambiar temporización |

### Grupo · Muñecas, tobillos y pausas

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Wrist circles | dynamicMobility | ciclos | por sentido | silla | desk.quick, wrists | «10 en cada sentido» en 20 s (desk.quick) = 1 s/círculo | menos círculos | cambiar temporización |
| Wrist stretch | staticStretch | **perSide** | **sí** | silla | grip.squeeze, wrists | 20 s/lado = `dur` exacto, cambio = 0 (patrón caso 2) | menos flexión | cambiar temporización |
| Palmas al suelo | staticStretch | timed | no | mesa | wrists | «al suelo» en el nombre pero el cue dice mesa: identidad confusa (menor) | menos peso | mantener |
| Rezo invertido | staticStretch | timed | no | silla/de pie | wrists | intensidad no graduada (es el estiramiento fuerte de muñeca) | orar normal (palmas juntas) | mantener (cue con alternativa) |
| Squeeze fist | dynamicStrength ligera | reps | no | cualquiera | grip.squeeze | ✓ compatible (20 en 20 s para grip es válido) | menos fuerza | mantener |
| Finger extension | dynamicMobility | reps | no | cualquiera | grip.squeeze, wrists | **leftover B1.2 en el registro: «al máximo»** (exercise-registry.js:117; el uso en rutina ya dice «sin forzar») | — | mantener + 1 línea editorial en B2.2 |
| Ankle circles | dynamicMobility | ciclos | por tobillo/sentido | silla | desk.quick | tobillos/sentidos sin reparto en 20 s | — | cambiar temporización |
| Deep breaths | rest/respiración | rest (timed) | no | cualquiera | desk.quick | duplica Reset respiración (caso 14) | — | **unificar visualId** |
| Reset respiración | rest/respiración | rest (timed) | no | cualquiera | chair.antidote ⛰dusk, morning.flow | ✓ correcto como cierre | — | mantener |
| Descanso | rest | rest (timed) | no | — | 8 rutinas de Mueve | hoy es un step normal con glifo; v1 lo tipa como `rest` (R5) | — | cambiar de categoría (a tipo `rest` del contrato) |

### Fuera del registro

| Ejercicio | Tipo físico | Modo v1 | Lados | Posición · Material | Aparece en | Problema principal | Alternativa fácil | Decisión |
|---|---|---|---|---|---|---|---|---|
| Dead hang · opcional | staticStretch/isometricHold | timed | no | barra firme | shoulders.5 | ✓ B1.2 lo dejó bien: opcional + alternativa en cue + material anunciado | wall slides (ya en cue ✓) | **mantener** |

**Recuento de decisiones (66 ejercicios):** mantener 17 · cambiar temporización
37 · reescribir 4 (Seated twist, Rib pull, WGS, Ground transitions) ·
sustituir/unificar visualId 4 (Chest opener, Deep squat hold, Deep breaths,
Nordics-en-rutina) · cambiar de categoría 1 (Descanso → tipo `rest`) · revisar
con fisioterapeuta 4 (Nordics, Sissy squat, Fondos en silla, Couch stretch) ·
retirar 0.

---

## 4 · Apéndice

### 4.1 Registro vs rutinas — divergencias del mismo ejercicio

El registro (s93) neutralizó cues y fijó `dur` propios; desde entonces las
rutinas evolucionaron (B1.1 recalibró 7 duraciones, B1.2 reescribió cues) y el
registro quedó parcialmente atrás. Consecuencia: una rutina custom hecha con el
constructor hereda cifras y textos distintos de los del catálogo para el mismo
movimiento.

| Ejercicio | En rutina | En registro | Divergencia |
|---|---|---|---|
| Wall sit | 60 s (wall.sit) | 45 s | dur |
| ATG split squat | 60 s (atg.knees) / 50 s (legs.single) | 50 s | dur inconsistente incluso entre rutinas |
| Pigeon | 60 s + «40s/30s por lado» | 50 s, cue sin lados | dur y estructura |
| Couch stretch | 70 s + «30s por lado» | 60 s, cue sin lados | dur y estructura |
| Isquio a una pierna | 80 s + «40s por lado» | 50 s, cue sin lados | dur y estructura |
| Rana | 70 s | 60 s | dur |
| 90/90 | 60-70 s | 60 s | menor |
| Elephant walk | 45-70 s según rutina | 50 s | dur inconsistente |
| Finger extension | «sin forzar» (grip.squeeze, B1.2) | «al máximo» (línea 117) | **editorial** (caso 15) |
| Círculos de hombro | 60 s + «5 por sentido y lado» | 45 s, cue sin ciclos | dur y estructura |

**Propuesta B2.2:** el registro pasa a ser la ÚNICA fuente de la ficha de
ejecución (`execution` del modelo §10) y las rutinas referencian; mientras
tanto, cualquier corrección editorial debe aplicarse SIEMPRE en ambos sitios
(la regla ya existe implícita desde s108 — chin tucks se corrigió en 4 sitios).

### 4.2 Duplicados → mapa `visualId` (insumo directo para B2.2)

| Identidad única propuesta | Absorbe | Notas |
|---|---|---|
| Apertura de pecho | Chest opener | cues casi idénticos; glifo y EN ya existen para ambos |
| Squat profundo | Deep squat hold | mismo patrón; conservar el matiz «relaja» como variante de cue |
| Reset respiración | Deep breaths | ídem |
| Hang pasivo | Dead hang · opcional | ya documentado s93 (el registro excluyó Dead hang por esto) |
| Gato-camello | Rib pull + respiración (¿?) | a confirmar con el usuario: si Rib pull es realmente gato/vaca (su cue lo dice), unificar; si es otro patrón, reescribir el cue |

### 4.3 Steps `body` de los Caminos (registry.js)

| Camino | Acceso | Rutina body | Estado tras esta auditoría |
|---|---|---|---|
| path.dawn | free | `move.neck.3` | piloto v1 propuesto — el Camino estrena perSide |
| path.midday | free | `move.hips.5` | contiene el caso 1 (Pigeon imposible) + suelo sin anuncio en el paso del Camino → suplente piloto |
| path.afternoon | free | `extra.desk.pushups` | piloto v1 propuesto — el Camino estrena reps |
| path.dusk | free | `move.chair.antidote` | piloto v1 propuesto — mezcla completa |
| path.weekend | free (tasting) | `move.atg.knees` | degusta la rutina con Nordics/Sissy a recién llegados (caso 13) — decidir en B2.2 si la degustación cambia de rutina |
| path.tea / path.breath | free | (sin step body) | — |

Nota estructural: el paso de Camino hereda el runner tal cual (R1-R5), así que
el piloto v1 queda cubierto en las dos superficies (biblioteca y Camino) con
las 4 rutinas propuestas sin trabajo extra.

### 4.4 Compatibilidad con lo ya decidido

- Nada de lo propuesto toca IDs persistidos (regla del swap s14, blindada).
- Las 4 reescrituras de cue y el leftover «al máximo» son EDICIÓN DE CONTENIDO
  y esperan a B2.2 con el resto — esta sesión no tocó código, cumpliendo §11.
- Las decisiones «revisar con fisioterapeuta» no bloquean B2.2-B2.3 (el
  contrato v1 es ortogonal); bloquean B4 (piloto visual dos-poses) para esos 4
  ejercicios.
