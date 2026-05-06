# Sesión 40 · v0.20.0 → v0.21.0 · feat(audio): sonidos move/hydrate/achievements

**Fecha:** 2026-05-06
**Versión entregada:** v0.21.0
**Standalone:** 440 256 bytes

---

## Contexto

Continuación de la capa 1 de sonidos sintetizados (Sound.jsx).
La capa 1 (s38a) ya cubría pomodoro y respiración. Esta sesión
completa los 3 bloques pendientes: Mueve, Hidrátate y Logros.

---

## Qué se hizo

### Bloque A — Sonidos Mueve (Sound.jsx + MoveModule.jsx)

**Recetas nuevas en `SOUND_RECIPES`:**

- `move.start` — glide ascendente C4→G4 (0.22 s, peak 0.07, sine).
  Sensación de arranque físico; sube al iniciar la sesión.
- `move.step` — tone triangle A4 (0.06 s, peak 0.04).
  Triángulo (no sine) para diferenciarlo del tick del pomodoro (sine 800 Hz).
  Marca cada avance de paso sin ser intrusivo.
- `move.end` — chord C5+E5+G5 (0.60 s, peak 0.09, sine).
  Do mayor simultáneo, cierre cálido de sesión.

**Cableado en `MoveSession` (MoveModule.jsx):**

Dos `useEffectMV` añadidos tras el bloque de atajos de teclado:

```
useEffectMV([stage]):
  stage === 'active' → playSound('move.start')
  stage === 'done'   → playSound('move.end')

useEffectMV([stepIdx]):
  stage !== 'active' → return  (guard en mount con stage='prep')
  → playSound('move.step')
```

El guard `stage !== 'active'` en el efecto de `stepIdx` evita que suene
en mount (stepIdx=0, stage='prep'). `move.start` y `move.step` no se
pisan porque `stage` y `stepIdx` son dependencias separadas.

### Bloque B — Sonidos Hidrátate (Sound.jsx + HydrateModule.jsx)

**Recetas:**

- `hydrate.sip` — glide descendente G5→D5 (0.18 s, peak 0.07, sine).
  Quinta descendente en el mismo registro; más suave que el legacy `sip`
  (que hacía G5→F#4, más de una octava). Sensación de gota.
- `hydrate.goal` — arpegio ascendente C5+E5+G5+C6 en cascada
  (t0, t0+0.05, t0+0.10, t0+0.15; duraciones decrecientes 0.65→0.35,
  peaks 0.06→0.03). Celebración ligera, distintiva, no fanfarria.

**Cableado en `HydrateTracker` (HydrateModule.jsx):**

Lógica inline en los dos call sites (`+` button y grid button):
```
playSound(today < goal && today + 1 >= goal ? 'hydrate.goal' : 'hydrate.sip')
```
- `hydrate.goal` suena exactamente al alcanzar la meta (no al superarla).
- Alias legacy `sip` conservado en SOUND_RECIPES para compatibilidad.

### Bloque C — Sonidos Logros (Sound.jsx + Toast.jsx)

**Recetas:**

- `achievement.unlock` — bell A5 (0.90 s, peak 0.08).
  Campana con overtones (2.8x + 5.4x). Reconocimiento resonante,
  sin fanfarria. Permanece en el aire.
- `achievement.secret` — glide descendente C5→F#3 (0.55 s, peak 0.05, sine).
  Tritónico (C a F#, ~8va y un tritono). Sensación de misterio/descubrimiento.
  Más suave que el unlock normal.

**Cableado en `ToastHost` (Toast.jsx):**

Una línea añadida en el callback de `onToast`, tras `setToasts`:
```
try { playSound(a.secret ? 'achievement.secret' : 'achievement.unlock'); } catch(e) {}
```
El `try/catch` está en el consumidor — el sonido nunca puede romper la app.
El campo `a.secret` ya existía en `ACHIEVEMENT_CATALOG` (boolean).

---

## Archivos modificados

| Archivo | Líneas finales | Delta |
|---|---|---|
| `app/ui/Sound.jsx` | 350 | +29 (7 recetas) |
| `app/move/MoveModule.jsx` | 309 | +10 (2 useEffectMV) |
| `app/hydrate/HydrateModule.jsx` | 81 | ±0 (sustitucion inline) |
| `app/ui/Toast.jsx` | 70 | +1 (playSound en callback) |
| `app/state.jsx` | — | PACE_VERSION v0.20.0 → v0.21.0 |

---

## Reglas respetadas

- Zero build, zero npm, zero CDN extra.
- Todos los archivos < 500 líneas.
- Todos los `playSound` nuevos en `try/catch` en el consumidor.
- No se exportaron nuevos símbolos a `window`.

---

## Pendiente funcional (próximas sesiones)

- Drone ambiente opt-in (toggle en Ajustes) — capa 2, ya implementada en Sound.jsx pero sin UI.
- Iconos PNG reales para PWA (192×512).
- Heatmap mes/año ("Año en pace").
- README EN + Reddit launch.
