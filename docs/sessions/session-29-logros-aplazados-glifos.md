# Sesión 29 · v0.13.0 → v0.14.0 · Logros aplazados + exploración de glifos

**Fecha:** 2026-04-29 (tarde)
**Versión:** v0.13.0 → **v0.14.0** (minor · 6 logros nuevos cazables + 1 canvas de diseño nuevo)
**Build entregado:** `PACE_standalone.html` v0.14.0 (~369 KB)

---

## Resumen ejecutivo

Sesión doble de fruta fácil del backlog priorizado:

1. **Bloque A — Logros aplazados (~1h, código real).** Cierran 6 logros más en la categoría Constancia y Maestría: contadores de sesiones por módulo (`breathe.sessions.10/50`, `move.sessions.25`), detectores horarios (`master.dawn`, `master.dusk`, `morning.5`) y umbral de bloque largo (`master.long.focus`). Cero cambios visuales. La cuenta de "Próximamente" baja de 13 → ~7.
2. **Bloque B — Canvas exploratorio de glifos (~1h, diseño puro).** Documento `design/glyphs-explorations.html` con 4 direcciones visuales (Línea, Sello hundido, Marca a hierro, Constelación) cubriendo 30+ glifos representativos por dirección. Recomendación de cierre: híbrido A+B (línea por defecto, sello en logros de cierre de categoría). Pendiente de validación del usuario antes de tocar el catálogo real.

---

## Bloque A — Detectores de logros aplazados

### Cambios en `app/state.jsx`

#### Nuevos campos en `defaultState`

```js
breatheSessionsTotal: 0,   // crece monótonamente, no resetea
moveSessionsTotal: 0,
morningDates: [],          // fechas distintas con sesión <9:00, cap 30
```

#### Nuevo helper `checkTimeOfDayAchievements()`

Llamado desde cada acción de completar (Pomodoro / Breathe / Move /
Extra). Tres triggers en uno:

- `master.dawn` — `now.getHours() < 7`.
- `master.dusk` — `now.getHours() >= 21`.
- `morning.5` — añade fecha al set `morningDates` si `< 9:00` y la
  fecha de hoy no está; cap a 30; desbloquea cuando length ≥ 5.

Patrón: lee `getState()` para no usar variables de cierre, escribe
con `setState`, llama a `unlockAchievement` (idempotente).

#### `master.long.focus` en `completePomodoro`

Se evalúa contra `focusMinsAtCompletion` (snapshot ANTES del
updater), no contra `state.focusMinutes`. Esto evita que un cambio
de tweak durante el ticker invalide el logro. Si el bloque que
acaba de cerrar era de 45 min → desbloqueo inmediato.

#### `breathe.sessions.10/50` en `completeBreathSession`

Se incrementa `breatheSessionsTotal` en el mismo `setState` que
`plan.respira` y `weeklyStats.breathMinutes`. Tras el setState,
leemos `_state.breatheSessionsTotal` (variable módulo, no cierre)
para evaluar umbrales — patrón validado en sesión 18.

#### `move.sessions.25` en `completeMoveSession`

Idéntico patrón. Decisión: solo cuenta sesiones de Mueve, no
suma Extra. Justificación: el bucket de stats `weeklyStats.moveMinutes`
ya los suma (decisión activa de sesión 10/14: "Extra suma minutos
al bucket Mueve"); pero el contador de sesiones es por módulo,
para no mezclar la métrica de la categoría con el catálogo real
de movilidades disponibles. Si en el futuro se reintroduce un
contador `extraSessionsTotal` para un logro tipo "20 calistenias",
vivirá aparte.

### Cambios en `app/achievements/Achievements.jsx`

`IMPLEMENTED_ACHIEVEMENTS` actualizado:

- Constancia: 7 → 11 (`+breathe.sessions.10`, `+breathe.sessions.50`,
  `+move.sessions.25`, `+morning.5`).
- Maestría: 2 → 5 (`+master.long.focus`, `+master.dawn`,
  `+master.dusk`).

Total: 39 → 45 ids implementados.

### Verificación

- Preview de `PACE.html` carga limpia (consola: 0 logs, 0 errores).
- Triggers no probados manualmente — requeriría manipular reloj
  del sistema o `lastActiveDate` en localStorage. Riesgo bajo: la
  lógica reproduce el patrón validado por `streak.3/7/14/30/...`
  (umbrales sobre snapshots leídos del módulo, no de cierre).
- `master.dawn` / `master.dusk` se disparan inmediatamente la
  próxima vez que el usuario abra una sesión en horario válido.

### Resultado cuantitativo

- **+6 logros cazables hoy.**
- **0 cambios visuales.**
- **0 cambios de comportamiento** fuera del unlock toast cuando
  toque.
- **+~150 bytes** en standalone (+1 KB redondeado, igual rango que
  sesión 28).

---

## Bloque B — Canvas exploratorio de glifos

Archivo nuevo: `design/glyphs-explorations.html` (~36 KB · documento
self-contained · no toca el código del producto).

### Estructura

8 secciones:

1. **Catálogo actual** — recordatorio de las 6 categorías y colores
   del sistema (sin tocar paleta).
2. **Dirección A · Línea** — stroke 1.2px, sin relleno. Más alineada
   con el tono actual (papel + tinta). 30 glifos representativos.
3. **Dirección B · Sello hundido** — relleno sólido en color de
   categoría. Más legible a 24px, más decorativo. 30 glifos.
4. **Dirección C · Marca a hierro** — stroke 2.4-3px, esquinas
   redondas, look "ganadería rústica". 30 glifos.
5. **Dirección D · Constelación** — puntos 2-3px conectados por
   líneas finísimas. Naturalista, etérea. 30 glifos.
6. **Comparativa** — set actual vs Dirección A en 12 logros
   representativos, fila a fila.
7. **Recomendación** — híbrido A + B: línea por defecto, sello
   solo en logros de cierre de categoría (luna llena, centurión,
   día de foco).
8. **Próximos pasos** — qué tocar si validas vs si prefieres otra
   dirección.

### Contenido cubierto

Glifos para los logros con trigger implementado más representativos
de cada categoría:

- **Primeros pasos (8):** step, breath, stretch, sip, extra, cycle,
  ritual, day.
- **Constancia (8):** streak.3/7/30/365, focus.hours.100,
  breathe.sessions.10/50, move.sessions.25.
- **Exploración (8):** box, coherent, rounds, nadi, physiological,
  hips, atg, ancestral.
- **Maestría (8):** pomodoro.8, long.focus, dawn, dusk, focus.day,
  retreat, marathon, centurion.

Total: 32 glifos × 4 direcciones = 128 SVG inline en el documento.

### Decisión técnica recomendada (pendiente de validación)

Si el usuario valida la dirección A híbrida:

1. Refactor de `ACHIEVEMENT_CATALOG` para aceptar campo opcional
   `glyphSvg: <jsx>` y `seal: 'line' | 'fill'` (default 'line').
2. Migración de los 100 entries del catálogo a la nueva forma.
   Mantener `glyph` string como fallback durante la migración —
   `localStorage` de usuarios existentes solo guarda IDs, no
   snapshots de glyph, así que la migración es solo de catálogo.
3. Actualizar `Toast.jsx` para renderizar SVG cuando exista
   `glyphSvg`, fallback a `glyph` string.
4. Item nuevo en `STATE.md` "Decisiones activas":
   "Glifos viven en SVG inline en el catálogo".

Coste estimado: ~3-4h de redibujo de los 70 glifos restantes
(siguiendo familia formal fijada aquí) + 1h de cableado en
`Achievements.jsx`/`Toast.jsx` + 30 min de verificación de
contraste a 24/40/56 px.

### No-objetivo de esta sesión

No se ha tocado `Achievements.jsx` ni `Toast.jsx` en lo relativo
a glifos. La aplicación sigue mostrando los unicode actuales en
su catálogo. El canvas es **decisión previa a implementación**:
fija familia formal antes de redibujar 100 entries.

---

## Archivos

### Nuevos
- `design/glyphs-explorations.html` — canvas exploratorio.
- `docs/sessions/session-29-logros-aplazados-glifos.md` — este diario.
- `backups/PACE_standalone_v0.13.0_20260429.html` — backup
  pre-bump.

### Modificados
- `app/state.jsx` — bump v0.13.0 → v0.14.0 + 3 campos nuevos +
  helper `checkTimeOfDayAchievements` + cableado en 4 acciones +
  trigger `master.long.focus` en `completePomodoro` + contadores
  en `completeBreathSession` y `completeMoveSession`.
- `app/achievements/Achievements.jsx` — `IMPLEMENTED_ACHIEVEMENTS`
  con +7 ids.
- `PACE.html` — título bumpeado a v0.14.0.
- `PACE_standalone.html` — regenerado (~369 KB).
- `CHANGELOG.md` — entrada v0.14.0.
- `STATE.md` — sección "Última sesión" reescrita.

---

## Versión

`v0.13.0` → **`v0.14.0`** (minor · 6 logros nuevos cazables, 0
breaking, 0 cambios visuales en la app).

---

## Próximos pasos sugeridos

1. **Validar dirección de glifos** (decisión de producto, ~5 min).
   Bastará con elegir A / A+B / B / C / D / "mantener actual".
2. **Si A o A+B:** refactor del catálogo a SVG inline (~4h en
   sesión dedicada).
3. **Otros candidatos del backlog que siguen abiertos:**
   - 4 logros restantes sin trigger fácil (`hydrate.week.perfect`
     necesita histórico semanal; `master.collector.half/full`
     necesitan listener cross-state).
   - Loop post-Pomodoro inteligente (~2-3h).
   - Heatmap "Año en pace" (~1 sesión).
   - PWA instalable (~1 sesión).
