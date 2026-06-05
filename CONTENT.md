# PACE · Catálogo de contenido

> Rutinas de cada módulo + modelo de gating + taxonomía de logros.
> Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).
> Para la visión a largo plazo, ver [`ROADMAP.md`](./ROADMAP.md).
>
> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras llevar ~60 sesiones
> borrado (se eliminó en el commit `be81606`, era v0.12.9). Refleja el
> catálogo **real** del código a fecha de v0.34.0, no el aspiracional.

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

> Diseñado en s21, **aún no implementado en código** (el campo `access`
> solo existe hoy en `app/paths/registry.js`). Lo implementa la **Fase 3**
> del bloque Contenido+Premium. La columna `access` de las tablas de abajo
> es **propuesta**, se fija en F3.

### Tipos de `access`

| Valor | Significado |
|---|---|
| `free` | Disponible desde el inicio. |
| `locked.initial` | Se desbloquea al completar una de las 2 iniciales del módulo. |
| `locked.achievement` | Desbloqueado por un logro concreto. |
| `locked.both` | Por logro **o** por Lifetime/Pase. |
| `premium` | Solo Lifetime/Pase. Sin ruta por logro. |

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
yin/rítmica) · Tom Woodfin (rondas tipo Wim Hof / CTB).
Datos en `app/breathe/BreatheLibrary.jsx`. Estado actual: **12 técnicas**.

| ID | Nombre | min | safety | `access` propuesto |
|---|---|---|---|---|
| `breathe.coherent.55` | Coherente 5·5 | 5 | — | **free** (inicial) |
| `breathe.box.4` | Box 4·4·4·4 | 5 | — | **free** (inicial) |
| `breathe.physiological` | Suspiro fisiológico | 2 | — | locked.initial |
| `breathe.478` | 4·7·8 | 3 | — | locked.achievement |
| `breathe.box.6` | Box 6·6·6·6 | 7 | — | locked.both |
| `breathe.coherent.66` | Coherente 6·6 | 10 | — | locked.both |
| `breathe.nadi.shodhana` | Nadi Shodhana | 8 | — | locked.both |
| `breathe.ujjayi` | Ujjayi | 6 | — | locked.both |
| `breathe.bellows` | Bhastrika · Fuelle | 3 | — | locked.both |
| `breathe.kapalabhati` | Kapalabhati · Kriya | 3 | ⚠ | locked.both |
| `breathe.rounds.express` | Rondas express (2×25) | 4 | ⚠ | locked.both |
| `breathe.rounds.full` | Respiración en rondas (3×30) | 12 | ⚠ | premium |

> **Seguridad:** toda técnica con `safety: true` (retención / hiperventilación)
> abre el modal de seguridad obligatorio antes de empezar (`BreatheSafety`).
> Las sesiones largas CTB (F4) heredan esta regla sin excepción.

---

## 🦴 Mueve · Fuerza / calistenia

Botón "Mueve". Inspirado en Strengthside + Jess Martin. Ejercicios
cortos, discretos, sin equipo, aptos para la oficina.
Datos en `app/move/MoveModule.jsx` (`MOVE_ROUTINES`, ids `extra.*`).
Estado actual: **7 rutinas**.

| ID | Nombre | min | `access` propuesto |
|---|---|---|---|
| `extra.desk.pushups` | Flexiones de escritorio | 2 | **free** (inicial) |
| `extra.posture.set` | Postura reset | 2 | **free** (inicial) |
| `extra.calves` | Gemelos subrepticios | 1 | locked.initial |
| `extra.grip.squeeze` | Grip + antebrazos | 1 | locked.initial |
| `extra.core.stealth` | Core silencioso | 2 | locked.both |
| `extra.chair.dips` | Fondos en silla | 3 | locked.both |
| `extra.wall.sit` | Sentadilla en pared | 3 | locked.both |

---

## 🤸 Estira · Movilidad / estiramiento

Botón "Estira". Inspirado en Jess Martin (oficina) + Strengthside (ATG,
caderas, hombros). Datos en `app/extra/ExtraModule.jsx` (`EXTRA_ROUTINES`,
ids `move.*`). Estado actual: **7 rutinas**.

| ID | Nombre | min | `access` propuesto |
|---|---|---|---|
| `move.chair.antidote` | Antídoto silla | 5 | **free** (inicial) |
| `move.neck.3` | Cuello · 3 min | 3 | **free** (inicial) |
| `move.desk.quick` | Escritorio express | 2 | locked.initial |
| `move.shoulders.5` | Hombros · 5 pasos | 5 | locked.both |
| `move.hips.5` | Caderas · 5 pasos | 6 | premium |
| `move.atg.knees` | ATG · Rodillas a prueba | 6 | premium |
| `move.ancestral` | Ancestral | 6 | premium |

---

## 💧 Hidrátate

Por defecto: 8 vasos × 250 ml/día. Tap en el icono = +1 vaso.
Doble tap = −1. Siempre `free`. Datos/lógica en `app/hydrate/` +
`app/state-hydrate.jsx`.

---

## 🛤️ Caminos

Secuencias guiadas (respira → foco → cuerpo) según la hora del día.
Catálogo cerrado a **7 caminos**, todos `free`. Único sitio con `access`
ya implementado hoy. Datos en `app/paths/registry.js`.

---

## 🎯 Objetivo del bloque Contenido+Premium (post-v0.34.0)

Crecer el catálogo y activar el gating, en fases (ver `ROADMAP.md`):

- **Respira → ~20 técnicas.** Net-new: diafragmática, exhalación 4-6,
  rítmica yin, coherencia 432Hz, Bhramari, tolerancia CO₂, y las
  **sesiones largas CTB** premium (3/5 rondas, Tummo, inner-dance —
  todas con modal de seguridad).
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
