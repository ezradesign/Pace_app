# Sesión 90 — F4: contenido Respira, 12 → 20 técnicas

**Fecha:** 2026-07-07
**Versión:** v0.34.5 → **v0.35.0**
**Bloque:** Contenido+Premium — Fase 4 (crecer catálogo Respira)

---

## Objetivo

Crecer Respira de 12 a ~20 técnicas con el modelo actual (1 técnica = 1 patrón
animado + BreatheSession). Las CTB completas con audio guiado quedan fuera
(entregable aparte post-bloque, ver ROADMAP); aquí solo entra la variante larga
del patrón `rounds` como precursora.

## Auditoría previa (Tarea 0)

- 12 técnicas / 5 grupos / 4 premium confirmadas en `BREATHE_ROUTINES`.
- `getSequence` con 8 patrones + fallback; los 5 wrappers de BreathVisual con
  `data-pace-essential`.
- `PACE_VERSION v0.34.5` y commit s89 (`d2ca715`) en git, working tree limpio.
- **Hallazgo D-8b (cola cerrada):** `master.collector.half/full` usa umbrales
  fijos de **50/100 logros desbloqueados**, no un denominador por catálogo →
  crecer el catálogo NO lo distorsiona. Cola resuelta sin código.
- `explorationMap` y `BREATH_ROUTINE_CATEGORIES` son mapas cerrados con guard:
  técnicas nuevas sin entrada no rompen nada. Decisión: **sin logros
  `explore.*` nuevos en F4** (coherente con el cap de s78).

## Set aprobado (Tarea 1 — OK del usuario a las 3 preguntas)

8 técnicas nuevas, 4 free + 4 premium. Drone forzado aprobado para Coherente
432 (única pieza que toca Sound.jsx). Tolerancia CO₂ vive en Equilibrio.

| ID | Nombre | Grupo | Patrón | min | safety | access |
|---|---|---|---|---|---|---|
| `breathe.diaphragm` | Diafragmática | equilibrio | **nuevo** `diaphragm` (4·4, "Inhala al vientre") | 5 | — | free |
| `breathe.exhale.46` | Exhalación 4·6 | relajacion | reuso `coherent` [4,0,6,0] | 6 | — | free |
| `breathe.yin` | Rítmica yin | relajacion | **nuevo** `yin` (3·5 + sostén 2) | 8 | — | free |
| `breathe.bhramari` | Bhramari · Abeja | pranayama | **nuevo** `bhramari` (4 + exhala zumbando 8) | 5 | — | free |
| `breathe.coherent.432` | Coherente 432 | balance | reuso `coherent` [6,0,6,0] + `drone: true` | 10 | — | premium |
| `breathe.kumbhaka` | Kumbhaka 1:4:2 | pranayama | reuso `pattern` [4,16,8,0] | 6 | ⚠ | premium |
| `breathe.co2` | Tolerancia CO₂ | equilibrio | **nuevo** `co2` (4·6 + sostén en vacío 10) | 6 | ⚠ | premium |
| `breathe.rounds.long` | Rondas profundas | energia | reuso `rounds` (5×35) | 20 | ⚠ | premium |

## Cambios (Tarea 2)

- **`app/breathe/BreatheLibrary.jsx`** (191 → 202 ln) — 8 items nuevos +
  reorden **free-first dentro de cada grupo** (el usuario free ve antes lo que
  puede usar; en Energía el orden queda además ascendente por profundidad:
  bellows → express → full → long). `aside` nuevo en Energía ("Despierta el
  sistema"). Total: **20 técnicas, 8 premium**. Grupos: energia 4 ·
  equilibrio 4 · balance 3 · relajacion 4 · pranayama 5.
- **`app/breathe/BreatheVisual.jsx`** (203 → 230 ln) — 4 patrones nuevos en
  `getSequence`: `diaphragm`, `yin`, `bhramari`, `co2`. Sin animación nueva
  (los 5 visuales existentes cubren todo; wrapper esencial heredado).
- **`app/breathe/BreatheSession.jsx`** — 3 labels nuevos en `PHASE_KEYS`
  ("Inhala al vientre" / "Exhala zumbando" / "Sostén en vacío");
  `playPhaseSound` mapea vientre→inhale, zumbando→exhale, vacío→silencio;
  `drone.start(routine.drone === true)` fuerza el drone en Coherente 432.
- **`app/ui/Sound.jsx`** — `ambientDrone.start(force)`: flag interno `forced`
  que bypasa `ambientOn` (soundOn manda siempre); `resume()` lo respeta vía
  `shouldPlay()` (sin él, pausar+reanudar mataba el drone forzado); `stop()`
  lo resetea. Primera modificación desde v0.21.0 — quirúrgica, ~10 ln.
- **`app/i18n/strings/sessions.js`** — 3 keys de fase nuevas ES + EN.
- **`app/i18n/strings-content.js`** — 24 keys EN nuevas (8×name/desc/code) +
  `breathe.cat.energia.aside`.
- **Bump v0.35.0**: `PACE.html` título + `PACE_VERSION` (state-core.jsx) +
  `CACHE_NAME pace-v0.35.0` (sw.js).
- Sin logros nuevos; sin tocar el mecanismo de gating; README intacto.

## Verificación (Tarea 3)

Preview :8765 (`PACE.html` y después el standalone regenerado):

- Biblioteca: **20 tarjetas / 5 grupos**; 8 sellos PREMIUM exactos (4 viejos +
  4 nuevos); 6 marcas ⚠ safety (rounds ×3, co2, kapalabhati, kumbhaka);
  minutos visibles en las free, "Pronto" en las premium. Screenshot.
- Sesiones por patrón nuevo (fases muestreadas en vivo, consola limpia):
  - `diaphragm`: Exhala ↔ **Inhala al vientre** ✓ · wrapper
    `data-pace-essential` presente ✓
  - `bhramari`: Inhala → **Exhala zumbando** ✓
  - `yin`: Inhala → Exhala → Sostén ✓
  - `co2` (con `premiumUnlocked=true` temporal): modal seguridad → Inhala →
    Exhala → **Sostén en vacío** ✓
  - `kumbhaka`: modal seguridad → Inhala → Sostén (16s) ✓
  - `rounds.long`: modal seguridad → "Ronda 1 / 5" + "Respiración 1 de 35" ✓
- **Drone forzado (Coherente 432):** con `ambientOn=false` + `soundOn=true` el
  drone arranca ✓, sobrevive a pausar+reanudar ✓, se apaga al salir ✓.
- Estado de prueba restaurado (`premiumUnlocked=false`).
- **Consola sin errores** en todo el recorrido (solo warnings Babel dev).

## Build + cierre

- Backup `backups/PACE_standalone_v0.34.5_20260707.html`; cap 20 mantenido
  (rotado `v0.28.7_20260512.html`).
- `node build-standalone.js`: **638 KB**, 62 archivos validados.
  `index.html` copia exacta (SHA256 idéntico, `82bfe7a9…58a2a41`).
- Standalone verificado en preview: v0.35.0, 8/8 técnicas nuevas, monta sin
  errores.

## Decisiones nuevas

1. **Free-first dentro de cada grupo de biblioteca** — las premium al final.
2. **`ambientDrone.start(force)`** — patrón para sesiones con drone integral;
   `soundOn` es master siempre; el flag muere en `stop()`.
3. **Sin logros `explore.*` para las técnicas F4** — evita inflar el catálogo;
   los mapas cerrados lo permiten sin código.
4. **Cola D-8b cerrada:** denominador de `master.collector.*` es fijo (50/100),
   no depende del catálogo.

## Próxima sesión

**F5 — Estira** (~12-15 rutinas, ~mitad premium). El P1 de la auditoría
(recordatorios opt-in, onboarding, notificación fin de pomodoro) puede
intercalarse entre F4 y F5.
