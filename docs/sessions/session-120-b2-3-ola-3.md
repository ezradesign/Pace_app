# Sesión 120 — B2.3 OLA 3 · 5 rutinas mixtas al contrato v1

> **Fecha:** 2026-07-22 · **Versión:** v0.62.0 → **v0.63.0** · **Tipo:** CÓDIGO
> (un solo dominio: contenido). **Rama:** `main`.

---

## Encargo

Tercera ola de **B2.3**: migrar una tanda de rutinas **legacy** al contrato de
pasos v1 (s115), **mecánica y atómica**, sobre el layout ya estable (s119). El
corte proponía además un ajuste de catálogo (intercambio 1×1 de acceso
`core.stealth`↔`back.desk` para elegir la rutina Mueve de entrada).

Principio rector (heredado de OLA 1/2): **migrar CONTENIDO al contrato existente,
NO rediseñar el runner**. El GIRO (s113/s114), el contrato (s115), el feedback
(s116) y el diseño de eventos (s117) están CERRADOS; el layout (FASE A s119) y
SessionShell NO se tocan; eventos NO se implementan; voz/TTS NUNCA; glifos D-4 no
se tocan.

---

## Gates

- **GATE 0 (integridad git):** rama `main`, HEAD `6acd1e2` (v0.62.0, s119), árbol
  limpio salvo `.claude/settings.local.json` modificado (una línea añadida al
  allow-list: `Bash(git status *)`). Se detuvo, se mostró el diff y se pidió
  autorización; el usuario eligió **Opción A** (dejarlo como está, fuera del
  commit). `Loto_png.png` sin cambios inesperados.
- **GATE 1 (arranque):** leídos CLAUDE.md, STATE.md, DECISIONES_PRODUCTO §B2,
  BASE_MUEVE_ESTIRA §3/§6 y la auditoría canónica
  `audit-b2-ejercicios-v0.53.0.md`. Inventario real verificado contra el código
  (14 Mueve, 14 Estira).

---

## Decisión de producto — SIN intercambio de acceso

El corte justificaba el intercambio con «mantener 1 Mueve free + 6 premium». Al
verificar el catálogo real, esa cifra **describía solo el subconjunto de 7 Mueve
todavía legacy**, no una distribución de catálogo ni un objetivo: hoy hay **8
Mueve free / 6 premium**. Seguir el invariante «exactamente 1 Mueve sin access
premium» al pie de la letra habría puesto premium a 7 rutinas hoy gratuitas — una
regresión. Se señaló la discrepancia al usuario con el conteo real.

**Decisión del usuario:** NO aplicar ningún cambio de `access` en s120.
`core.stealth` sigue **premium**, `back.desk` sigue **free**. La sesión se limita
a la migración mecánica; el posible cambio de rutina de entrada se evalúa aparte
como decisión de producto. `canAccessRoutine` intacto.

Se confirmó también la lista OLA 3 (5 rutinas) por AskUserQuestion.

---

## Migración — 5 rutinas mixtas

| Rutina | Módulo | Acceso | Clasificación por paso | Rango est. |
|---|---|---|---|---|
| `extra.hang.bar` | Mueve | premium | timed×3 (holds) + rest×2 suaves · ready s0 (barra) | 160s [2–3] |
| `extra.core.stealth` | Mueve | premium | timed×3 (holds) + rest×2 suaves (cue vacío→«Suelta.») | 145s [2–3] |
| `extra.back.desk` | Mueve | free | reps + timed + **reps(suelo, ready)** + timed | 203s [3–4] |
| `move.spine.waves` | Estira | premium | timed×5 (movilidad) · ready s0 (suelo) | 325s [5–6] |
| `move.hamstrings` | Estira | premium | timed + timed + **perSide** + timed(suelo, ready) | 330s [5–6] |

Reglas aplicadas (contrato s115, patrón OLA 1/2):

- **Rests entre holds isométricos** (hang.bar, core.stealth) = **suaves**, sin
  `restKind`, conservan `dur:20` (patrón `glutes.stealth`, BASE §6). Los cue
  vacíos de core.stealth reutilizan el literal «Suelta.» / «Let go.» de la rest
  suave de glutes.stealth — sin redactar copy nuevo.
- **`setup:{mode:'ready',estimatedSeconds:15}`** donde exige suelo/barra: Superman
  (suelo), Gato-camello y Puente con marcha (suelo), Hang pasivo (barra). El gate
  cuenta la transición vía `estimatedSeconds`.
- **Superman = `reps` + `ready` sobre suelo** — 1ª combinación del catálogo. Se
  verificó en el código (`v1StepSetup:83` devuelve `ready` con cualquier `mode`,
  antes de la rama reps-auto) y en runtime.
- **perSide** (Isquio a una pierna): fix del «40s por lado» en `dur:80` → `dur:40`
  POR LADO + `transition:{seconds:10}` (§6).
- **Copy reutilizado** de OLA 1/2 para ejercicios compartidos (mismo glifo): Band
  pull-apart y Apertura de pecho (shoulder.circles/chair.antidote), Gato-camello y
  Rotación torácica (morning.flow), Puente con marcha (hips.5/couch), Scapular
  squeeze (**12 reps, dosis legacy conservada**; «2 segundos cada una» → tempo
  1-2-1 con 2 s de retención, consistente con posture.set y la audit «reps +
  retención»).
- **Puente torácico** (spine.waves): su ESCALÓN de regresión (audit) queda a la
  **ola editorial**; aquí se consolida el cue existente + `care` derivado ligero.

Migración ATÓMICA por rutina: dato ES (`instruction:{setup,action,care}` +
`tempo`/`completion`/`transition`/`setup.ready` + 5 metadatos, **sin `discrete`**)
+ keys EN `id.sN.instruction.*` + retirada de `id.sN.cue` en el MISMO cambio.
**Ningún `name` cambió** → glifos intactos. Las rutinas legacy no migradas siguen
byte-idénticas (dos `cue` compartidos —Elephant walk, Hang pasivo— persisten en
`atg.knees`/`ancestral`, correctos).

**Archivos:** `app/move/move.data.js` (hang.bar, core.stealth, back.desk),
`app/extra/ExtraModule.jsx` (spine.waves, hamstrings), `app/i18n/content/move.js`
+ `app/i18n/content/extra.js` (keys EN). Tamaños: move.data.js 352 ln,
ExtraModule.jsx **447 ln** (cerca del techo 500 — trocear en la próxima ola de
Estira), content 251/301 ln.

---

## Verificación (dev + standalone)

- **dev-check** `estimateDuration`: las 5 **dentro de rango**, cero drift de `min`.
- **i18n**: 52 keys EN `instruction.*`/`name` resuelven, 0 faltantes, 0 `.cue`
  residual (ES+EN).
- **`canAccessRoutine`**: correcto; acceso inalterado (4 premium + back.desk free).
- **back.desk (run completo, free):** reps 1er set (Scapular squeeze «1 de 10
  reps») + timed auto-place (Band pull-apart, copy OLA 2) + **Superman reps+ready
  sobre suelo** (gate «COLÓCATE», «el ejercicio espera a que estés en posición»,
  sin cuenta → «Estoy listo» → reps work) + timed (Apertura) + DONE «MOVIMIENTO
  COMPLETADO» + stats honestas (2:49 · 4 pasos · 0 reps) + feedback «¿Te ayudó
  esta pausa?».
- **hamstrings (premium, desbloqueo temporal):** dispatch v1, timed con care,
  **perSide place «Empiezas por: Izquierda» + transición «Ahora: Derecha»** (R3
  intacto), glifos, acento Estira. `premiumUnlocked` original (`false`) restaurado.
- Tarjetas: premium muestran rango al desbloquear («Pronto» bloqueadas), legacy con
  `min` único. Sin errores de consola en ninguna fase.
- **Standalone** v0.63.0 (3200 KB) regenerado y montado: versión + Superman
  (`reps`/`ready`) + core.stealth `access:'premium'` + hamstrings perSide + 0 cue
  residual. index.html/PACE.html/PACE_VERSION/CACHE_NAME coinciden en v0.63.0.
- Deuda de entorno s119 aplicada: SW desregistrado + caches `pace-*` limpiadas
  antes de cada carga fresca.

---

## Estado B2.3

13 → **8 legacy**: 4 Mueve premium (`push.ladder`, `wall.sit`, `legs.single`,
`core.plank`) + 4 Estira (`desk.quick`, `hips.ground`, `atg.knees`, `ancestral`).
Más la **ola editorial** (4 cues: Seated twist, Rib pull, WGS, Ground transitions;
+ 2 rutinas: `legs.single`, resto de `atg.knees`; + el escalón de Puente torácico
de `spine.waves`; + `push.ladder` negativas sin nº de reps).

---

## Cierre

Backup `PACE_standalone_v0.62.0_20260722.html` creado (verificado v0.62.0), borrado
el más antiguo `v0.42.0_20260709` (cap 20). Bump v0.63.0 en state-core.jsx +
PACE.html + sw.js antes del build. Docs actualizados: este diario, CHANGELOG (fila
+ detalle; v0.61.0 degradada a enlace), STATE, DECISIONES_PRODUCTO §B2, ROADMAP,
CONTENT.md, memoria. `.claude/settings.local.json` NO se toca ni se commitea.

**Commit sugerido:**

```
feat: v0.63.0 — s120 B2.3 OLA 3 · 5 rutinas mixtas al contrato v1

Migra 5 rutinas legacy mixtas (Mueve+Estira) al contrato de pasos v1:
extra.hang.bar, extra.core.stealth, extra.back.desk, move.spine.waves,
move.hamstrings. SIN intercambio de acceso (la cifra «1 free + 6 premium»
del corte describía solo el subconjunto legacy, no un objetivo de catálogo;
core.stealth sigue premium, back.desk free; entitlement intacto). 13→8 legacy.
```
