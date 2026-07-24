# Sesión 121 — B2.3 OLA 4 · cierre de la migración mecánica (core.plank + wall.sit)

**Fecha:** 2026-07-24
**Versión:** v0.63.0 → **v0.64.0**
**Tipo:** CÓDIGO (un solo dominio: contenido, Mueve-only)
**Corte:** «B2.3 OLA 4 — CIERRE de la migración mecánica»

---

## Objetivo

Migrar al **contrato de pasos v1** (s115) las **2 únicas** rutinas legacy que
quedaban mecánicamente tractables sin tocar copy, dosis, estructura, lateralidad
ni escalones — `extra.core.plank` y `extra.wall.sit` — y **declarar formalmente
cerrada** la fase mecánica de B2.3. Las 6 rutinas restantes NO son deuda mecánica:
pasan al backlog editorial/técnico/fisio.

Principio rector idéntico a OLA 1/2/3: **migrar CONTENIDO legacy al contrato
EXISTENTE, mecánica y atómica**. NO se rediseña el runner (GIRO s113/s114, contrato
s115, feedback s116), NO se toca el layout (FASE A s119) ni SessionShell, NO se
implementan eventos, voz/TTS NUNCA, glifos D-4 no se tocan.

Alcance fijado de antemano (no re-preguntado): OLA 4 = A (mínima). No se abre la
ola editorial (es s123), no se toca Estira, no se hace split de ExtraModule.jsx.

---

## Lección de s120 aplicada (invariante duro)

NUNCA cambiar la dosis canónica de una rutina para «armonizar» con otra. El objetivo
canónico es SIEMPRE el valor LEGACY de la PROPIA rutina; de un ejercicio compartido
se reutiliza el tempo y el copy, JAMÁS el conteo. Verificado en runtime que las
dosis mostradas = dosis legacy (wall.sit 60 s, plancha lateral 30 s/lado).

---

## Migración — 2 rutinas Mueve premium

Ambas viven en `app/move/move.data.js` (Mueve usa ids `extra.*`). Dosis LEGACY
verificada contra git HEAD (v0.63.0) antes de editar. Ninguna trae reps a inventar.

### `extra.core.plank` (premium, min 4)

| paso | BASE §3 | mode | dosis LEGACY | notas |
|---|---|---|---|---|
| Plancha | isométrico | `timed` | 45 s | `setup:ready` (1er suelo), `care` rodillas |
| Descanso | — | `rest` suave | 20 s | cue legacy «Respira.» preservado verbatim |
| Plancha lateral | bilateral | `perSide` | **30 s/lado** (2×30=60 = legacy) | `transition:{10}`; «por lado» lo integra el runner |
| Descanso | — | `rest` suave | 20 s | «Respira.» |
| Hollow hold | isométrico | `timed` | 30 s | `care` |
| Plancha | isométrico | `timed` | 30 s | `care` rodillas |

Rango derivado: 250 s → **4–5 min** · `min:4` **dentro**.

### `extra.wall.sit` (premium, min 2)

| paso | BASE §3 | mode | dosis LEGACY | notas |
|---|---|---|---|---|
| Wall sit | isométrico | `timed` | **60 s** (CONSERVADA) | `setup:ready` (pared), `care` = altura |
| Descanso | — | `rest` suave | 30 s | cue legacy «Suave.» preservado verbatim |
| Wall sit | isométrico | `timed` | **60 s** | `care` = «altura que te deje respirar» (del cue legacy) |

Rango derivado: 175 s → **2–3 min** · `min:2` **dentro**.

**Disciplina de dosis:** wall.sit conserva 60 s por tanda; el `care` gradúa la
altura, NO convierte la dosis en 30–40 s (lección s120).

### Detalles de la migración (ATÓMICA)

- `instruction:{setup,action,care}` por paso; el `care` = adaptación DERIVADA
  (rodillas apoyadas / graduar altura), sin inventar técnica ni dosis.
- Rests entre holds isométricos **SUAVES**: sin `restKind`, conservan `dur`. Los cue
  legacy («Respira.» / «Suave.») no estaban vacíos → se preservan verbatim (el
  literal «Respira.» de `betweenSets` NO aplica aquí; solo se usaría «Suelta.» si el
  cue hubiese estado vacío, que no es el caso).
- `setup:{mode:'ready',estimatedSeconds:15}` en el 1er paso de suelo (Plancha) y de
  pared (Wall sit). El gate cuenta la colocación, nunca es countdown.
- `transition:{seconds:10}` en la Plancha lateral (perSide).
- 5 metadatos `position/equipment/requiresFloor/intensity/level` (**sin `discrete`**).
- Keys EN `id.sN.instruction.*` nuevas en `app/i18n/content/move.js`; `id.sN.cue`
  retiradas en el MISMO cambio. **Ningún `name` cambió** → glifos intactos.
- **Acceso INTACTO:** ambas siguen premium; `canAccessRoutine` sin cambios.
- `move.data.js` 352 → **396 ln** (bajo 500 → sin split; `ExtraModule.jsx` no se
  toca, sigue a 447 ln).

---

## Verificación (dev + standalone)

Deuda de entorno s119 aplicada antes de cada carga fresca: desregistrar SW + vaciar
caches `pace-*` + recargar.

- **dev-check** (`estimateDuration`): core.plank 250 s [4–5], wall.sit 175 s [2–3];
  ambas **dentro**, cero drift de `min`.
- **i18n:** keys EN `instruction.*`/`name` resuelven (11 de core.plank, 6 de
  wall.sit), 0 faltantes, 0 `.cue` residual (ES+EN, comprobado en app y standalone).
- **acceso:** ambas premium, `canAccessRoutine` inalterado.
- **runtime (premium activado temporal, `premiumUnlocked:false` anotado y
  restaurado):**
  - Tarjetas premium muestran el rango derivado: «Core · plancha 4–5 min»,
    «Sentadilla en pared 2–3 min».
  - **core.plank** corre en MoveSessionV1: gate `ready` de suelo «Colócate» («el
    ejercicio espera a que estés en posición») → paso `timed` con acción + zona
    «Cuídate ·» con el `care` → **Plancha lateral perSide con «Izquierda.»
    integrado** + `care`. **Sin overflow a 1280×720** (0 px).
  - **wall.sit** monta en el runner: prep «3 pasos» → paso 1 «Colócate» (gate
    `ready` de pared) con setup correcto.
  - Consola limpia (0 errores).
- **standalone:** regenerado (v0.64.0, 3205 KB), montado vía servidor; ambas rutinas
  resuelven (dentro de rango, `ready`, core.plank con perSide, access premium), EN
  resuelve, `premiumUnlocked:false`.

Bump v0.64.0 en las 3 fuentes ANTES del build (`PACE_VERSION` en `app/state-core.jsx`
· `<title>` en `PACE.html` · `CACHE_NAME` en `sw.js`); verificado que PACE.html /
index.html / PACE_standalone.html / PACE_VERSION / CACHE_NAME están TODOS en v0.64.0.

Backup: `PACE_standalone_v0.63.0_20260724.html` creado (copia del standalone en disco
antes de regenerar); rotado el más antiguo `v0.43.0_20260709`; cap 20 mantenido
(más antiguo vigente ahora `v0.44.0_20260710`).

---

## Cierre de fase — migración MECÁNICA de B2.3 CERRADA

Con core.plank y wall.sit migradas, la migración **mecánica** de B2.3 queda
**CERRADA (s121)**. **8 → 6 legacy.** Las 6 restantes **NO son deuda mecánica**:
quedan BLOQUEADAS por reescritura editorial / progresión técnica / revisión fisio.

- `push.ladder` → editorial: negativas sin nº de reps + Pica sin escalón.
- `legs.single` → editorial: reescribir (aritmética imposible + 3/4 avanzados).
- `desk.quick` → editorial: Seated twist (falta 2º lado).
- `hips.ground` → editorial: Ground transitions (alternativa «con manos»).
- `ancestral` → editorial: Ground transitions + Rib pull (identidad).
- `atg.knees` → editorial + **BLOQUEADA por revisión FISIO de Sissy squat** (B4).

\+ Pendiente heredado: escalón de regresión de Puente torácico (`spine.waves`, s120).

No se abrirá una OLA 5 mecánica salvo que una auditoría NUEVA demuestre que alguna
rutina puede migrarse sin cambiar copy, dosis, estructura, lateralidad ni escalones.

---

## Archivos tocados

- `app/move/move.data.js` — core.plank + wall.sit al contrato v1 (352 → 396 ln).
- `app/i18n/content/move.js` — keys EN `instruction.*` de las 2, `sN.cue` retiradas.
- `app/state-core.jsx` · `PACE.html` · `sw.js` — bump v0.64.0.
- `PACE_standalone.html` · `index.html` — regenerados por el build.
- `backups/` — rotación (+`v0.63.0_20260724`, −`v0.43.0_20260709`).
- Docs: `CHANGELOG.md`, `STATE.md`, `docs/product/DECISIONES_PRODUCTO.md`,
  `ROADMAP.md`, `CONTENT.md`, este diario.

---

## Próxima sesión

**s122 — CLARIDAD UX de la home** (HOME_REDISENO_PROPUESTA.md, 1ª parte), **NO más
migración**. PACE no necesita más catálogo disponible; necesita que una persona
entienda qué hacer con el que ya tiene: diferenciar Foco manual de Camino guiado,
renombrar CTAs ambiguos, explicar qué es un Camino, un único CTA dominante,
navegación móvil, probar con una persona sin explicaciones.

s123 — OLA EDITORIAL (con el modelo de interacción ya más claro).
