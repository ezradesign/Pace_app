# PACE · Catálogo de contenido

> Rutinas de cada módulo + modelo de gating + taxonomía de logros.
> Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).
> Para la visión a largo plazo, ver [`ROADMAP.md`](./ROADMAP.md).
>
> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras llevar ~60 sesiones
> borrado (se eliminó en el commit `be81606`, era v0.12.9). Refleja el
> catálogo **real** del código a fecha de **v0.35.0** (s90: Respira crecida
> a 20 técnicas por F4; s88: columnas `access` fijadas por F3b), no el
> aspiracional.

---

## ⚠️ Nota de arquitectura — el swap de ids de sesión 14

Los ids de las rutinas de cuerpo están **cruzados** respecto al módulo
visual, por compatibilidad de `localStorage` y logros:

| Botón (lo que ve el usuario) | Archivo | Constante | ids | Contenido |
|---|---|---|---|---|
| **Mueve** | `app/move/MoveModule.jsx` | `MOVE_ROUTINES` | `extra.*` | Fuerza / calistenia |
| **Estira** | `app/extra/ExtraModule.jsx` | `EXTRA_ROUTINES` | `move.*` | Movilidad / estiramiento |

En este documento, "Mueve" y "Estira" se refieren siempre al **módulo
visual** (el botón). No tocar los ids: están blindados por compat.

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
| `breathe.bellows` | Bhastrika · Fuelle | energia | 3 | — | free (entrada de Energía) |
| `breathe.diaphragm` | Diafragmática | equilibrio | 5 | — | free (F4 — la base de todo) |
| `breathe.exhale.46` | Exhalación 4·6 | relajacion | 6 | — | free (F4 — freno simple) |
| `breathe.yin` | Rítmica yin | relajacion | 8 | — | free (F4 — meditativa accesible) |
| `breathe.bhramari` | Bhramari · Abeja | pranayama | 5 | — | free (F4 — pranayama accesible) |
| `breathe.nadi.shodhana` | Nadi Shodhana | pranayama | 8 | — | **premium** (pranayama avanzado) |
| `breathe.kapalabhati` | Kapalabhati · Kriya | pranayama | 3 | ⚠ | **premium** (kriya avanzado) |
| `breathe.rounds.express` | Rondas express (2×25) | energia | 4 | ⚠ | **premium** (rondas) |
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

Botón "Mueve". Inspirado en Strengthside + Jess Martin. Ejercicios
cortos, discretos, sin equipo, aptos para la oficina.
Datos en `app/move/MoveModule.jsx` (`MOVE_ROUTINES`, ids `extra.*`).
Estado actual: **7 rutinas**.

| ID | Nombre | min | `access` (real, F3b) |
|---|---|---|---|
| `extra.desk.pushups` | Flexiones de escritorio | 2 | **free** (inicial) |
| `extra.posture.set` | Postura reset | 2 | **free** (inicial) |
| `extra.calves` | Gemelos subrepticios | 1 | free (micro de entrada) |
| `extra.grip.squeeze` | Grip + antebrazos | 1 | free (micro de entrada) |
| `extra.chair.dips` | Fondos en silla | 3 | free |
| `extra.core.stealth` | Core silencioso | 2 | **premium** (hollow al límite) |
| `extra.wall.sit` | Sentadilla en pared | 3 | **premium** (isométrico exigente) |

---

## 🤸 Estira · Movilidad / estiramiento

Botón "Estira". Inspirado en Jess Martin (oficina) + Strengthside (ATG,
caderas, hombros). Datos en `app/extra/ExtraModule.jsx` (`EXTRA_ROUTINES`,
ids `move.*`). Estado actual: **7 rutinas**.

| ID | Nombre | min | `access` (real, F3b) |
|---|---|---|---|
| `move.chair.antidote` | Antídoto silla | 5 | **free** (inicial) |
| `move.neck.3` | Cuello · 3 min | 3 | **free** (inicial) |
| `move.desk.quick` | Escritorio express | 2 | free (2 min sin levantarse) |
| `move.shoulders.5` | Hombros · 5 pasos | 5 | free (reset accesible) |
| `move.hips.5` | Caderas · 5 pasos | 6 | free |
| `move.atg.knees` | ATG · Rodillas a prueba | 6 | **premium** (ATG avanzado) |
| `move.ancestral` | Ancestral | 6 | **premium** (suelo/crawl/hang) |

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
- **Estira / Mueve → ~12-15 rutinas c/u, ~mitad premium.** Rutinas
  curadas nuevas que reagrupan pasos existentes + net-new (Couch
  stretch, círculos de hombro, gato-camello). Categorizar como Respira.
- **Constructor de rutinas premium** (`custom.sequence`): el usuario
  arma su rutina eligiendo ejercicios + duración. Requiere un registro
  interno de ejercicios (no una biblioteca navegable de ejercicios
  sueltos). Reutiliza el runner data-driven de `MoveSession`.

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
