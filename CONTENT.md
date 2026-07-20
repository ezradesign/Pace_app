# PACE · Catálogo de contenido

> Rutinas de cada módulo + modelo de gating + taxonomía de logros.
> Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).
> Para la visión a largo plazo, ver [`ROADMAP.md`](./ROADMAP.md).
>
> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras llevar ~60 sesiones
> borrado (se eliminó en el commit `be81606`, era v0.12.9). Refleja el
> catálogo **real** del código a fecha de **v0.37.0** (s92: Mueve crecida a
> 14 rutinas por F6; s91: Estira a 14 por F5; s90: Respira a 20 por F4; s88:
> columnas `access` fijadas por F3b), no el aspiracional.

---

## ⚠️ Nota de arquitectura — el swap de ids de sesión 14

Los ids de las rutinas de cuerpo están **cruzados** respecto al módulo
visual, por compatibilidad de `localStorage` y logros:

| Botón (lo que ve el usuario) | Archivo | Constante | ids | Contenido |
|---|---|---|---|---|
| **Mueve** | `app/move/move.data.js` (s110) | `MOVE_ROUTINES` | `extra.*` | Fuerza / calistenia |
| **Estira** | `app/extra/ExtraModule.jsx` | `EXTRA_ROUTINES` | `move.*` | Movilidad / estiramiento |

En este documento, "Mueve" y "Estira" se refieren siempre al **módulo
visual** (el botón). No tocar los ids: están blindados por compat.

> **Contrato de pasos v1 (s110 · B2.2a; GUIADO desde s113).** Un step puede
> declarar `mode: timed | reps | perSide | rest`; sin `mode` corre el runner
> legacy (idéntico a s109). Pilotado en 7 rutinas (2 Respira control +
> `desk.pushups`, `chair.squats`, `neck.3`, `chair.antidote`,
> `couch.stretch` s112). El runner `MoveSessionV1.jsx` resuelve: colocación
> por paso (el timer no arranca leyendo; `setup:'ready'` espera al usuario),
> **reps GUIADAS con cadencia** (s113: `repSeconds` por paso, default 4 s
> fuerza; avance auto + «Terminar antes»; se acreditan solo las reps
> guiadas), **cambio de lado automático** (10 s con botones opcionales),
> descanso tipado (`restKind:'betweenSets'`; los cierres respiratorios NO se
> tipan) y acredita **minutos reales**. Las otras 22 rutinas migran en olas
> siguientes.
>
> **Sustitución s110:** en `move.atg.knees`, **Nordics → «Puente isquio a una
> pierna»** (sustituto accesible; Nordics muy avanzado y con material de
> anclaje no garantizado). Nordics sigue en el registro del constructor,
> aparcado a revisión con fisioterapeuta (con Sissy squat, Fondos en silla,
> Couch stretch) antes de v1.0.

---

## 🔓 Modelo de gating (decidido en s85)

**Unidad gateable = la sesión que pulsas "empezar".** En Respira eso es
una técnica; en Mueve/Estira, una rutina completa. **No** se gatean pasos
sueltos dentro de una rutina (sería un muro de pago a mitad de flujo).

> **Implementado en F3b (s88, v0.34.4)** con alcance **binario `free`/`premium`**.
> El campo `access` vive ahora en las 3 bibliotecas (8 rutinas `premium` de 26) +
> `paths/registry.js`. Los estados intermedios `locked.*` siguen **diseñados pero
> no en código** — diferidos a post-v1.0 junto con la validación de licencia real.
> Las columnas `access` de abajo reflejan el valor **real** aplicado.

### Tipos de `access`

| Valor | Significado | Estado |
|---|---|---|
| `free` | Disponible desde el inicio (ausente = free). | **en código** |
| `premium` | De pago. Sin compra real hasta v1.0: sello + "Pronto", no arranca. | **en código (F3b)** |
| `locked.initial` | Se desbloquea al completar una de las 2 iniciales del módulo. | diseñado, post-v1.0 |
| `locked.achievement` | Desbloqueado por un logro concreto. | diseñado, post-v1.0 |
| `locked.both` | Por logro **o** por Lifetime/Pase. | diseñado, post-v1.0 |

> El desbloqueo real lo controla `premiumUnlocked` (state, `false` por defecto).
> Mientras es `false`, toda `premium` se ve bloqueada. Flip futuro (compra/logro)
> la abre sin tocar UI.

### Las 2 iniciales `free` por módulo (nunca cambian — puerta de entrada)

| Módulo | Inicial 1 | Inicial 2 |
|---|---|---|
| **Respira** | `breathe.coherent.55` · Coherente 5·5 | `breathe.box.4` · Box 4·4·4·4 |
| **Mueve** | `extra.desk.pushups` · Flexiones de escritorio | `extra.posture.set` · Postura reset |
| **Estira** | `move.chair.antidote` · Antídoto silla | `move.neck.3` · Cuello · 3 min |

**Siempre gratis pase lo que pase:** Pomodoro (Foco), Hidrátate, y las
2 iniciales de cada módulo. El core funciona y es útil por sí solo.

---

## 🌬️ Respira · Breathwork

Modelo: 1 ítem = 1 patrón respiratorio animado (`BreathVisual`).
Fuentes de inspiración: Breathe With Sandy (coherencia, box, 4·7·8,
yin/rítmica, diafragmática) · Tom Woodfin (rondas tipo Wim Hof / CTB,
retenciones, tolerancia CO₂).
Datos en `app/breathe/BreatheLibrary.jsx`. Estado actual: **20 técnicas**
(F4, s90, v0.35.0). Orden en biblioteca: **free primero** dentro de cada
grupo. Grupos: energia 4 · equilibrio 4 · balance 3 · relajacion 4 ·
pranayama 5.

| ID | Nombre | Grupo | min | safety | `access` (real, F4) |
|---|---|---|---|---|---|
| `breathe.coherent.55` | Coherente 5·5 | balance | 5 | — | **free** (inicial) |
| `breathe.box.4` | Box 4·4·4·4 | equilibrio | 5 | — | **free** (inicial) |
| `breathe.physiological` | Suspiro fisiológico | relajacion | 2 | — | free |
| `breathe.478` | 4·7·8 | relajacion | 3 | — | free |
| `breathe.box.6` | Box 6·6·6·6 | equilibrio | 7 | — | free (variante larga, no avanzada) |
| `breathe.coherent.66` | Coherente 6·6 | balance | 10 | — | free (variante larga, no avanzada) |
| `breathe.ujjayi` | Ujjayi | pranayama | 6 | — | free (oceánica accesible) |
| `breathe.bellows` | Bhastrika · Fuelle | pranayama | 3 | — | free (B1.2: mudado de Energía — es pranayama, tag PRA) |
| `breathe.diaphragm` | Diafragmática | equilibrio | 5 | — | free (F4 — la base de todo) |
| `breathe.exhale.46` | Exhalación 4·6 | relajacion | 6 | — | free (F4 — freno simple) |
| `breathe.yin` | Rítmica yin | relajacion | 8 | — | free (F4 — meditativa accesible) |
| `breathe.bhramari` | Bhramari · Abeja | pranayama | 5 | — | free (F4 — pranayama accesible) |
| `breathe.nadi.shodhana` | Nadi Shodhana | pranayama | 8 | — | **premium** (pranayama avanzado) |
| `breathe.kapalabhati` | Kapalabhati · Kriya | pranayama | 3 | ⚠ | **premium** (kriya avanzado) |
| `breathe.rounds.express` | Rondas express (2×25) | energia | 4 | ⚠ | free (B1.2: era premium; sin ella Energía quedaba sin entrada free) |
| `breathe.rounds.full` | Respiración en rondas (3×30) | energia | 12 | ⚠ | **premium** (rondas) |
| `breathe.coherent.432` | Coherente 432 | balance | 10 | — | **premium** (F4 — inmersiva, drone forzado) |
| `breathe.kumbhaka` | Kumbhaka 1:4:2 | pranayama | 6 | ⚠ | **premium** (F4 — retención clásica) |
| `breathe.co2` | Tolerancia CO₂ | equilibrio | 6 | ⚠ | **premium** (F4 — apnea en vacío) |
| `breathe.rounds.long` | Rondas profundas (5×35) | energia | 20 | ⚠ | **premium** (F4 — precursora CTB) |

> **Seguridad:** toda técnica con `safety: true` (retención / hiperventilación
> / apnea) abre el modal de seguridad obligatorio antes de empezar
> (`BreatheSafety`). Sin excepción — F4 lo aplicó a kumbhaka, co2 y
> rounds.long.
>
> **Coherente 432** lleva `drone: true`: fuerza el drone ambiente (base
> 432 Hz) durante la sesión aunque el toggle Ambiente esté apagado; `soundOn`
> (master) manda siempre. Ver `ambientDrone.start(force)` en `Sound.jsx`.
>
> **Patrones de `getSequence`:** rounds, box, coherent, pattern,
> physiological, ujjayi, bhastrika/kapalabhati, nadi + (F4) diaphragm, yin,
> bhramari, co2.

---

## 🦴 Mueve · Fuerza / calistenia

Botón "Mueve". Inspirado en Strengthside (progresiones de empuje,
unilateral, colgarse) + Jess Martin (fuerza discreta de oficina). Ejercicios
cortos, discretos, sin equipo (salvo "Colgarse": barra o marco), aptos para
la oficina. Datos en `app/move/MoveModule.jsx` (`MOVE_ROUTINES`, ids
`extra.*`). Estado actual: **14 rutinas** (F6, s92, v0.37.0), biblioteca
**agrupada en 4 grupos** como Respira/Estira (free primero dentro de cada
grupo): empuje y tracción 4 · sigilo 4 · piernas 3 · espalda y core 3.
Grupos i18n con prefijo `mueve.cat.*` (no `move.cat.*`, que colisionaría
con los ids `move.*` de Estira).

| ID | Nombre | Grupo | min | `access` (real, F6) |
|---|---|---|---|---|
| `extra.desk.pushups` | Flexiones de escritorio | empuje | 3 (s113: 2→3, real guiado 3:00-3:25) | **free** (inicial) |
| `extra.chair.dips` | Fondos en silla | empuje | 3 | free |
| `extra.push.ladder` | Empuje · progresión | empuje | 3 | **premium** (F6 — pica + negativas) |
| `extra.hang.bar` | Colgarse | empuje | 2 | **premium** (F6 — requiere barra) |
| `extra.calves` | Gemelos subrepticios | sigilo | 1 | free (micro de entrada) |
| `extra.grip.squeeze` | Grip + antebrazos | sigilo | 1 | free (micro de entrada) |
| `extra.glutes.stealth` | Glúteos invisibles | sigilo | 2 | free (F6 — micro discreto) |
| `extra.core.stealth` | Core silencioso | sigilo | 2 | **premium** (hollow al límite) |
| `extra.chair.squats` | Sentadillas de silla | piernas | 3 | free (F6 — el patrón más útil) |
| `extra.wall.sit` | Sentadilla en pared | piernas | 2 | **premium** (isométrico exigente) |
| `extra.legs.single` | Piernas · a una | piernas | 4 | **premium** (F6 — unilateral avanzado) |
| `extra.posture.set` | Postura reset | espalda | 2 | **free** (inicial) |
| `extra.back.desk` | Espalda de oficina | espalda | 3 | free (F6 — tracción accesible) |
| `extra.core.plank` | Core · plancha | espalda | 4 | **premium** (F6 — isométricos de suelo) |

> **Glifos (F6):** 9 pasos nuevos renderizan `DefaultGlyph` (tres arcos)
> hasta que el usuario apruebe sus glifos — se suman a la cola D-4 de
> `STATE.md` (ahora 35 pendientes): Sentadilla a silla, Apretar glúteos,
> Superman, Pica en escritorio, Sentadilla búlgara, Plancha, Plancha
> lateral, Hollow hold, Hang activo.

---

## 🤸 Estira · Movilidad / estiramiento

Botón "Estira". Inspirado en Jess Martin (oficina) + Strengthside (ATG,
caderas, hombros, columna, movilidad de suelo, flujos diarios). Datos en
`app/extra/ExtraModule.jsx` (`EXTRA_ROUTINES`, ids `move.*`). Estado actual:
**14 rutinas** (F5, s91, v0.36.0), biblioteca **agrupada en 4 grupos** como
Respira (free primero dentro de cada grupo): oficina 4 · hombros y columna 3
· caderas y piernas 5 · flujos 2.

| ID | Nombre | Grupo | min | `access` (real, F5) |
|---|---|---|---|---|
| `move.chair.antidote` | Antídoto silla | oficina | 5 | **free** (inicial) |
| `move.neck.3` | Cuello · 3 min | oficina | 3 | **free** (inicial) |
| `move.desk.quick` | Escritorio express | oficina | 2 | free (2 min sin levantarse) |
| `move.wrists` | Muñecas y manos | oficina | 3 | free (F5 — antídoto al teclado) |
| `move.shoulders.5` | Hombros · 5 pasos | hombros | 4 | free (reset accesible) |
| `move.shoulder.circles` | Hombros · círculos | hombros | 4 | free (F5 — CARs accesibles) |
| `move.spine.waves` | Columna · ondas | hombros | 5 | **premium** (F5 — segmentación avanzada) |
| `move.hips.5` | Caderas · 5 pasos | caderas | 6 | free |
| `move.couch.stretch` | Couch stretch | caderas | 5 | **premium** (F5 — flexores profundos) |
| `move.hips.ground` | Caderas · suelo | caderas | 6 | **premium** (F5 — flujo de suelo) |
| `move.atg.knees` | ATG · Rodillas a prueba | caderas | 4 | **premium** (ATG avanzado) |
| `move.hamstrings` | Cadena posterior | caderas | 5 | **premium** (F5 — isquios profundos) |
| `move.morning.flow` | Despertar matinal | flujos | 5 | free (F5 — ancla de hábito diario) |
| `move.ancestral` | Ancestral | flujos | 5 | **premium** (suelo/crawl/hang) |

> **Glifos (F5):** 11 pasos nuevos renderizan `DefaultGlyph` (tres arcos)
> hasta que el usuario apruebe sus glifos — se suman a la cola D-4 de
> `STATE.md` (ahora 26 pendientes): Gato-camello, Palmas al suelo, Rezo
> invertido, Círculos de hombro, Couch stretch, Onda espinal, Puente
> torácico, Rodar hacia abajo, Rana, Pliegue adelante, Isquio a una pierna.

---

## 🛠️ Tus rutinas · Constructor premium (F7, s93, v0.38.0)

**Superficie premium entera** (gateada por `premiumUnlocked`, sin muro a
mitad de flujo): sección "Tus rutinas" como 5º grupo al **final de la
biblioteca Mueve**. Bloqueada: sello + copy + "Pronto", nada clicable.
Desbloqueada: crear/editar/borrar rutinas propias y lanzarlas con el
runner de `MoveSession` (una rutina custom = solo datos).

- **Registro interno de ejercicios** (`app/custom/exercise-registry.js`):
  **65 ejercicios en 8 grupos** (empuje 5 · piernas 9 · core 8 · cuello 11
  · columna 8 · caderas 7 · suelo 7 · muñecas/tobillos/pausas 10), unión
  deduplicada **curada a mano** de los steps de `MOVE_ROUTINES` +
  `EXTRA_ROUTINES`, con cue neutro y dur por defecto. `name` = ES canónico
  = key de glifo. **NO es una biblioteca navegable** (decisión s85: la
  unidad gateable sigue siendo la sesión). Al crecer los catálogos,
  añadir a mano los pasos nuevos que merezcan entrar.
- **Rutina custom:** `{ id: 'custom.<timestamp>', name, steps
  [{name,dur,cue}], min }` en `state.customRoutines` (localStorage).
  Límites: **10 rutinas · 1-12 pasos · 10-120 s por paso (saltos de 5) ·
  nombre ≤ 40**. `min` = ceil(Σ dur / 60). Cues no editables en F7.
- **Crédito:** `completeMoveSession(id, min)` — cuenta como sesión Mueve
  (plan.muevete, moveMinutes, moveSessionsTotal, first.stretch). Los ids
  `custom.*` no matchean ningún mapa de logros: **cero logros de
  exploración accidentales y sin logros nuevos** (decisión F4).
- **EN:** por nombre canónico en `app/i18n/content/custom.js`
  (`custom.ex.<name ES>.{name,cue}` + `custom.cat.*.label`).

---

## 💧 Hidrátate

Por defecto: 8 vasos × 250 ml/día. Tap en el icono = +1 vaso.
Doble tap = −1. Siempre `free`. Datos/lógica en `app/hydrate/` +
`app/state-hydrate.jsx`.

---

## 🛤️ Caminos

Secuencias guiadas (respira → foco → cuerpo) según la hora del día.
Catálogo cerrado a **7 caminos**, todos `free`. Datos en
`app/paths/registry.js`.

> **Nota (s88, resuelto s89):** `path.weekend` referencia
> `breathe.nadi.shodhana` + `move.atg.knees` (premium desde F3b). Los steps
> de un Camino se lanzan directamente (no pasan por `RoutineCard`).
> **Decisión activa (s89): es una degustación curada deliberada** — probar
> premium dentro de una secuencia guiada. Revisar al crecer el catálogo
> (F5/F6).

---

## 🎯 Objetivo del bloque Contenido+Premium (post-v0.34.0)

Crecer el catálogo y activar el gating, en fases (ver `ROADMAP.md`):

- **Respira → ~20 técnicas.** ✅ **Hecho en F4 (s90, v0.35.0):** 20 técnicas,
  8 premium. Entraron diafragmática, exhalación 4·6, rítmica yin, coherente
  432 (drone forzado), Bhramari, Kumbhaka 1:4:2, tolerancia CO₂ y rondas
  profundas 5×35 (precursora CTB, con modal de seguridad). La experiencia
  **CTB completa** (guion + pista + mockup inmersivo, 20-45 min) queda como
  entregable aparte post-bloque (ver `ROADMAP.md`); Tummo/inner-dance se
  evaluarán ahí.
- **Estira → ~12-15 rutinas, ~mitad premium.** ✅ **Hecho en F5 (s91,
  v0.36.0):** 14 rutinas, 6 premium, agrupadas en 4 grupos. Entraron las 3
  net-new de este plan (couch stretch, círculos de hombro, gato-camello) +
  despertar matinal, muñecas, caderas·suelo y cadena posterior
  (Strengthside-inspired).
- **Mueve → ~12-15 rutinas, ~mitad premium.** ✅ **Hecho en F6 (s92,
  v0.37.0):** 14 rutinas, 6 premium, agrupadas en 4 grupos free-first
  (prefijo i18n `mueve.cat.*`). Entraron sentadillas de silla, glúteos
  invisibles y espalda de oficina (free) + empuje·progresión, colgarse,
  piernas·a una y core·plancha (premium). De regalo: `strings-content.js`
  troceado en `app/i18n/content/` (breathe/move/extra).
- **Constructor de rutinas premium.** ✅ **Hecho en F7 (s93, v0.38.0):**
  registro interno curado (65 ejercicios / 8 grupos) + constructor
  completo en la biblioteca Mueve (sección "Tus rutinas", superficie
  premium entera). Ver sección propia más arriba.

**Glifos nuevos (los aprueba el usuario):** Couch stretch, círculos de
hombro, gato-camello. Más activar los **15 glifos pendientes** (D-4 de
`STATE.md`) cuando toquen rutinas premium.

---

## 🏆 Logros — taxonomía

> **Fuente de verdad = código:** la lista completa vive en
> `app/achievements/catalog.js` (`ACHIEVEMENT_CATALOG`, **106 entradas**;
> `IMPLEMENTED_ACHIEVEMENTS`, **69 activos**). Aquí solo el mapa de
> categorías para no duplicar (y desincronizar) la lista.

Estética: sello circular, tinta oliva/terracota sobre crema, glifo
heráldico (`app/glyphs/achievement-glyphs.jsx`) + texto en mayúsculas.
`CAT_META` define 7 categorías:

| Categoría | Key | Color | Tema |
|---|---|---|---|
| Primeros pasos | `primeros` | `--ink-3` | Primer uso de cada cosa |
| Constancia | `constancia` | `--focus` | Rachas, horas, sesiones acumuladas |
| Exploración | `exploracion` | `--breathe` | Descubrir cada técnica/rutina |
| Maestría | `maestria` | `--achievement` | Repetición y volumen |
| Secretos | `secretos` | `--ink-2` | Ocultos (incluye `secret.supporter`, solo de honor) |
| Estacionales | `estacionales` | `--move` | Solsticios, equinoccios, estaciones |
| Estadísticas | `estadisticas` | `--hydrate` | Hitos de la colección |

> `secret.supporter` se activa por honor desde el modal de Buy Me a
> Coffee ("Ya doné"). **No hay verificación y no desbloquea contenido** —
> es un sello, coherente con que donar no es freemium (ver
> `MONETIZATION.md`).
