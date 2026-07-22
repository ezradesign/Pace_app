# Sesión 119 — Estabilidad de layout del runner v1 + B2.3 OLA 2

**Fecha:** 2026-07-22 · **Versión:** v0.61.0 → **v0.62.0** · **Tipo:** CÓDIGO (bump + build)
**Corte:** sesión FUSIONADA en 2 fases. FASE A (pulido de layout del runner v1)
cerrada y verificada ANTES de FASE B (migración de contenido legacy al contrato).

---

## FASE A · Estabilidad de layout del runner v1

**Principio rector:** pulido de layout, NO rediseño. El GIRO (s113/s114), el
contrato (s115), el feedback (s116) y el comportamiento guiado NO se tocan —
delta 0 de comportamiento, solo disposición vertical/overflow. Ámbito confinado
a `MoveSessionV1.jsx` + `MoveSessionV1.support.jsx` (`pace-move-v1-css`);
**SessionShell intacto** (decisión del usuario: arreglar en el ámbito más
estrecho).

### Diagnóstico (medido por DOM, no adivinado)

- **Barra fantasma — causa raíz doble.** `v1GlyphSize` saltaba de `0.22·vpH` a
  `0.25·vpH` **exactamente en vpH=720** (glifo 158→180, +22 px de golpe), pero
  los tiers de compactación de altura empezaban en ≤700 → banda muerta ~701–760
  px sin compactar y con glifo grande. Medido a **1280×720**: `centerBody 570.9`
  vs `center 564` → desborde de 7 px que dispara un scrollbar de 15 px. Caso
  común: **portátiles 1366×768** (altura útil ~720–730) caen dentro.
- **Glifo/botones sin anclar — cuantificado.** `centerBody` centra el bloque
  completo con `margin:auto`; su alto varía por paso (cue 1–3 líneas, `care`
  sí/no, place 56px vs work 128px) → `glyph_top` se mueve al revés del alto del
  bloque. Medido a 900px: **+12.4 px** entre dos pasos reps consecutivos solo
  por el nº de líneas del cue; el **footer NO se mueve** (hermano flex pinneado).
- **Verificación tipográfica (pedida por el usuario):** el NOMBRE salta a 2
  líneas en móvil ("Flexiones de escritorio") pero es 1 línea en desktop.

### Cambios

1. **Curva de glifo continua** (`v1GlyphSize`): una sola pendiente
   `Math.max(72, Math.min(210, Math.round(vpH*0.22)))` — elimina la
   discontinuidad en 720.
2. **Alturas reservadas** (`pace-move-v1-css`, solo ≥641 px): cue `min-height
   3.1em` (2 líneas) + «Cuídate» `min-height 3em` (2 líneas) **SIEMPRE
   renderizada en trabajo** aunque el paso no tenga care (JSX: `inWork &&
   !isRest`, contenido condicional). Bloque de alto constante → glifo anclado.
   En móvil (≤640) se renuncia a las reservas (slack pequeño ~12 px, ya presente
   pre-s119; con nombre a 2 líneas y fuentes grandes desbordaba).
3. **Tier de banda 701–768** + compactación reforzada de ≤700 (número 82px) y
   ≤560 (número 58px + fuentes −1) para que las reservas quepan sin barra.
4. **Aislamiento del timer v1:** el hook `data-pace-move-timer` lo comparten el
   runner v1 Y el legacy (`MoveModule.jsx:260`) → mis reglas de número habrían
   encogido el número del legacy (Estira/premium). Añadido `data-pace-v1-timer`
   al div del timer v1; mis 3 reglas de tamaño apuntan ahí → **legacy intacto**.
5. **Micro-fix rep-pulse** (`MoveSessionV1.jsx:441`): shorthand `animation` →
   longhand (`animationName`/`Duration`/`TimingFunction`/`IterationCount` +
   `animationPlayState`). Silencia el warning de React. Delta 0.

### Verificación FASE A (por DOM)

- Sin barra fantasma en **1280×600/720/760/769, 1024×512, 844×390, 360×640**
  (antes 720→7px; con reservas 600→21/512→35/640→59, todos a 0).
- **Glifo anclado:** `glyph_top` idéntico entre pasos (600→83.6, 720→94.6,
  900→128.9); `calves` s1 SIN care → mismo `glyph_top` que s0 (care reservada
  vacía). Footer clavado.
- Aclaración: v1GlyphSize lee `innerHeight` en render (sin listener de resize,
  pre-existente) → redimensionar en PAUSA no recomputa el glifo hasta el próximo
  render; con re-render fresco al mismo viewport, los pasos anclan.
- rep-pulse: DOM/compilado en longhand, sin shorthand → warning imposible (los
  del buffer del pane son stale, deuda conocida).
- Sin regresión: legacy Estira ("Muñecas y manos") conserva número 96px;
  Respira abre sin overflow ni fugas de reglas v1.

---

## FASE B · B2.3 OLA 2 — migración de 5 rutinas de Estira al contrato v1

**Decisiones de arranque** (AskUserQuestion, todas la recomendación): orden =
**Estira**; lista = **5 gratuitas sin cue de reescritura**; reescrituras =
aparte (ola editorial); glifos D-4 = no tocar.

**Migradas** (`ExtraModule.jsx` + keys EN en `content/extra.js`):
`move.wrists` · `move.shoulders.5` · `move.shoulder.circles` · `move.hips.5` ·
`move.morning.flow`.

Clasificación por `BASE_MUEVE_ESTIRA.md` §3:
- **wrists** (min 3): movilidad/estático de muñecas → `timed`×4 + `reps`×1
  (Finger extension, consistente con grip.squeeze de OLA 1).
- **shoulders.5** (min 4): movilidad/isometría → `timed`×5; gate `ready` en
  wall slides (pared) y dead hang (barra).
- **shoulder.circles** (min 4): movilidad → `timed`×5.
- **hips.5** (min 6): estiramiento bilateral → `perSide`×2 (Cossack, Pigeon) +
  `timed`×3; gate `ready` en el primer paso de suelo (90/90).
- **morning.flow** (min 5): flujo → `timed`×4 + `perSide`×1 (Cuello) + `rest` de
  cierre respiratorio (SIN restKind, s113).

Migración ATÓMICA por rutina: `instruction:{setup,action,care}` +
`tempo`/`completion` (reps) + `transition:{seconds:10}` (perSide) +
`setup:{mode:'ready',estimatedSeconds:15}` (suelo/pared/barra) + 5 metadatos
`position/equipment/requiresFloor/intensity/level` (**sin `discrete`**). Keys EN
`id.sN.instruction.*` nuevas + `id.sN.cue` retiradas; **ningún `name` cambió**
→ glifos intactos. Copy reutilizado consistente con los pilotos para ejercicios
compartidos (Apertura de pecho, 90/90, Pigeon, Cuello y trapecios, Puente con
marcha, External rotation…). **Cero drift de `min`** (todas dentro de rango).

### Verificación FASE B (dev + standalone)

- `estimateDuration`: las 5 dentro de rango — wrists 200s [3–4], shoulders.5
  285s [4–5], shoulder.circles 265s [4–5], hips.5 355s [5–6], morning.flow 330s
  [5–6]. Dev-check «dentro» en las 5.
- i18n: sin `[i18n] missing` ES+EN; sin `cue` residual en las 5.
- Runtime: **hips.5** completo (perSide con lado integrado «Izquierda/Derecha» +
  transición «Ahora: Derecha» + gate `ready` en 90/90 + timed; cabe a 1280×720 Y
  360×640 — perSide en móvil sin scroll). **morning.flow** completo (ready +
  timed + perSide + rest de cierre + DONE «Estiramiento completado» + stats
  honestas + feedback). **wrists** (reps con contador «1 de 10 reps»).
  **shoulders.5** (gate `ready` «Colócate»/«Estoy listo» en idx0).
  **shoulder.circles** (todo timed). **EN** resuelve (Wrist circles + cue inglés
  + «Take care · …»). Timer aislado (`data-pace-v1-timer`).

### Standalone

`node build-standalone.js` → v0.62.0, 3192 KB, 86 scripts compilados,
autocontenido. Verificado en navegador: carga limpia, app montada, longhand
rep-pulse en el compilado, wrists migrado (`timed×4/reps`), cero `cue` residual.

---

## Estado B2.3

Conteo: 23 legacy pre-OLA-1 → 18 tras s118 (7 Mueve premium + 11 Estira) →
**13 tras s119** (migradas 5 de las 11 Estira). Quedan:
- **7 Mueve premium:** push.ladder, hang.bar, core.stealth, wall.sit,
  core.plank, back.desk, legs.single.
- **6 Estira:** desk.quick, spine.waves, hips.ground, atg.knees, hamstrings,
  ancestral (varias con cue de reescritura → ola editorial: 4 cues + 2 rutinas).

## Deudas de layout RESUELTAS esta sesión

- Barra de scroll fantasma del runner v1 — RESUELTA (banda 701–768 + glifo
  continuo).
- Glifo/botones sin anclar — RESUELTA (alturas reservadas).
- Warning rep-pulse (`MoveSessionV1.jsx:441`) — RESUELTA (longhand).
