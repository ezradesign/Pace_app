# Sesión 38a — Audio refactor a 432 Hz + respiración realista con ruido filtrado

**Fecha:** 2026-05-05
**Versión:** v0.19.1 → v0.20.0
**Modelo:** Claude Sonnet 4.6
**Estimación:** 50–60 min

---

## Objetivo de la sesión

Reescribir `app/ui/Sound.jsx` con afinación A=432 Hz, primitivas componibles y
respiración realista mediante ruido blanco filtrado. Cablear los nuevos sonidos
en `BreatheSession.jsx` y `FocusTimer.jsx`.

---

## Decisiones clave

### Afinación A=432 Hz (D.1)
Constante `BASE_A = 432` + helper `note(name)` que convierte nombres de nota
('C5', 'G#4', 'F#4', etc.) a Hz usando temperamento igual (2^(1/12)).
Todos los tonos del catálogo usan `note()` en lugar de Hz hardcodeados.
Mantiene proporciones intervalares idénticas al estándar 440 Hz; el resultado
es ligeramente más cálido y menos "estridente" digitalmente.

### Primitivas componibles (D.2)
`tone`, `glide`, `chord`, `bell`, `breathNoise` — cada una autocontenida,
sin estado global compartido. El catálogo `SOUND_RECIPES` las compone para
construir sonidos de mayor nivel. Facilita añadir recetas futuras sin tocar
el plumbing de AudioContext.

### Respiración con ruido blanco filtrado paso-bajo (D.3)
`breathNoise(ctx, dest, direction, t0, dur, peak)` genera un buffer de ruido
blanco y lo procesa con un `BiquadFilterNode` lowpass (Q=1.5). La frecuencia
de corte se desplaza linealmente:
- `direction 'in'`:  200 Hz → 800 Hz  (inhalar: "shhhhh" que sube de tono)
- `direction 'out'`: 800 Hz → 200 Hz  (exhalar: "haaaaa" que baja de tono)

ADSR asimétrico: attack 15% + plateau hasta 65% + release 35% de `dur`.
Sin tonos puros, sin clicks digitales. Inspiración: Inner Breeze (waozixyz/inbreeze).

### Hold = silencio intencional (D.4)
La fase "Sostén" no tiene sonido asociado. El silencio durante la retención
refuerza la concentración interna — es una decisión meditativa, no una omisión.
`breathe.hold` no se define en el catálogo.

### Sonidos de respiración duran toda la fase visual (D.5)
`BreatheSession` pasa `phaseDur = newCur.duration` como argumento a
`playSound('breathe.inhale', phaseDur)` y `playSound('breathe.exhale', phaseDur)`.
El buffer de ruido se genera con la duración exacta de la fase, por lo que el
sonido empieza y termina con el visual. Sin desincronización.

### Volumen peak calibrado (D.6)
- `breathe.inhale`: peak 0.06 (suave, no interfiere con la concentración)
- `breathe.exhale`: peak 0.07 (ligero énfasis en la espiración)
- `breathe.session.end`: peak 0.10 / chord (cierre más audible y cálido)

### Pomodoro minimalista: solo start + end (D.7)
`pomodoro.start` (glide C5→G5, 200 ms) al arrancar el bloque.
`pomodoro.end` (alias de `complete`, campana C5+G5+C6) al finalizar.
Sin tick por minuto ni cuenta atrás final — decisión: minimalismo Pomodoro.

### Alias legacy conservados (D.8)
`tick`, `complete`, `sip`, `breath` delegan a la nueva implementación o
son aliases directos. Módulos no migrados (HydrateModule, Achievements,
etc.) siguen funcionando sin cambios.

---

## Archivos modificados

| Archivo | Cambios | Líneas finales |
|---|---|---|
| `app/ui/Sound.jsx` | Reescrito completo: BASE_A, note(), primitivas (tone/glide/chord/bell/breathNoise), catálogo ampliado, playSound con ...args | 228 |
| `app/breathe/BreatheSession.jsx` | +session.start al arrancar, +inhale/exhale por fase con dur, +session.end en finish() y hold entry | 283 |
| `app/focus/FocusTimer.jsx` | +pomodoro.start en onClick del toggle; complete→pomodoro.end en useEffect de finalización | 562 |
| `app/state.jsx` | PACE_VERSION v0.19.1 → v0.20.0 | ~550 |
| `PACE.html` | Título v0.19.1 → v0.20.0 | ~108 |
| `PACE_standalone.html` | Regenerado (~420 KB, 7 868 líneas) | — |
| `backups/PACE_standalone_v0.19.1_20260505.html` | Nuevo backup pre-v0.20.0 | — |

---

## Deuda cerrada esta sesión

- Audio refactor a 432 Hz (pendiente desde sesión 28).
- Respiración con audio realista (ruido filtrado, no tonos puros).
- Sonidos de respiración sincronizados con duración de fase visual.

---

## Deuda pendiente (sesión 38b)

- Sonidos `move.start`, `move.step`, `move.end` + cableado en MoveSession.
- Sonidos `hydrate.sip` mejorado (reemplazar el legacy), `hydrate.goal`.
- Sonidos `achievement.unlock`, `achievement.secret`.
- Cableado en HydrateModule y ToastHost.
- Drone ambiente opt-in (toggle en Ajustes, oscilador continuo muy bajo).
- Backups v0.13.0 y v0.14.0 pendientes de borrar manualmente (sandbox no puede).
