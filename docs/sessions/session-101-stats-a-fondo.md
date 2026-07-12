# Sesión 101 — Stats a fondo + safety/privacy (v0.46.0)

**Fecha:** 2026-07-10
**Versión:** v0.45.0 → v0.46.0
**Alcance:** auditoría completa del tracking (P2 del usuario en s100: "los
paneles no trackean el progreso de forma adecuada") → 6 fixes aprobados +
stats vivos del plan maestro + páginas estáticas `/safety` y `/privacy`.

---

## Tarea 0 — Git

s100 (`1ffc4c1`, v0.45.0) commiteado y pusheado, working tree limpio,
`main` = `origin/main`. Sin sorpresas.

## Auditoría de tracking (verificada contra el repo, aprobada antes de tocar)

### Mapa escritores → lectores

Todos los escritores van a `weeklyStats[hoy]` (+ acumuladores); `history`
solo se alimenta en el **rollover** (`archiveDayToHistory` del día previo,
state-core). Lectores: Semana lee `weeklyStats` (hoy visible), **Mes/Año
leen `history` (hoy invisible)**, Caminos lee `paths.history` (escritura
inmediata), Ritmo del sidebar lee `streak` + `WeekDots`.

### Hallazgos

| # | Hallazgo | Resolución |
|---|---|---|
| H1 (P0) | Mes/Año ciegos al día actual: celda de hoy vacía, totales de mes sin hoy, "días activos / racha máx / acciones" del Año con un día de retraso | F1 |
| H2 (P0) | `WeekDots` (Sidebar) encendía el día SOLO con foco — un día de solo Respira/Mueve quedaba gris, contra el criterio s69 | F2 |
| H3 (P1) | Estira invisible como categoría: `completeExtraSession` escribe en `moveMinutes` (mismo cubo que Mueve) y la fila "Mueve" mentía por omisión | F6 (etiqueta "Cuerpo", elegida por el usuario sobre serie propia) |
| H4 (P1) | "Racha actual" de Caminos moría a medianoche (hoy sin completar → 0), divergiendo del streak principal que aguanta hasta el rollover | F3 |
| H5 (P2) | `checkHydrateWeekPerfect` exigía diferencia EXACTA de 86 400 000 ms → los cambios de hora (DST) rompían la cadena en silencio | F4 |
| H6 (P2) | `app/stats/WeeklyStats.jsx` muerto: no se cargaba en PACE.html ni viajaba al standalone (superseded por StatsPanel en s43) | F5 (borrado) |
| H7 (nota) | Mueve/Estira acreditan solo al completar todos los pasos y en nominal (`routine.min`); Respira ya es honesto (tiempo activo s98) | Diferido (coherente con plan maestro "Move timer: bajo") |
| H8 (nota) | Sendero del día del sidebar usa proxies (posiciones ficticias, máx 1 hito por módulo) | Mapea al ítem "sidebar" del backlog (s106), sin tocar |

## Fixes (F1–F6)

- **F1 — Stats vivos.** Nuevo **`app/state-history.jsx`** (160 ln, carga
  ANTES de state-core en PACE.html): absorbe los utils de fecha + helpers de
  history de state-core (que baja de 511 → **407 ln, sale de deuda**) y añade
  **`getHistoryWithToday(state)`**: selector memoizado (por identidad de
  `history`/`weeklyStats` + dayKey) que reutiliza `archiveDayToHistory(h,
  hoy, weeklyStats)` — cero lógica nueva de agregación, overwrite idempotente
  de `days[hoy]` + recompute de su mes/año. `StatsPanel` lo consume →
  Mes/Año/totales incluyen HOY. El estado persistido NO cambia (el rollover
  sigue siendo el único escritor). Criterio s69 intacto. Orden de carga: las
  migraciones (`migrateWeeklyStatsToHistory`, `reindexWeeklyStatsMondayFirst`)
  se quedan en state-core y resuelven los helpers vía window (state-history ya
  evaluó cuando `loadState()` corre).
- **F2 — WeekDots criterio s69**: activo = focus|breath|move>0 (agua sola no).
- **F3 — Racha de Caminos viva**: si hoy no está en el set, se cuenta desde
  ayer (`computePathStreaks`).
- **F4 — DST**: `Math.round(diff/86400000) !== 1` en checkHydrateWeekPerfect.
- **F5 — WeeklyStats.jsx borrado** (118 ln muertas).
- **F6 — Etiqueta "Cuerpo"**: key nueva `stats.label.body` (ES "Cuerpo" /
  EN "Body") en la fila de Semana + valores de `stats.month.total.move` y
  `stats.month.tooltip.move` actualizados. Cero migración de datos; la serie
  propia `extraMinutes` queda descartada por ahora (el histórico viejo
  quedaría mezclado igualmente).

## Páginas /safety y /privacy

`safety.html` + `privacy.html` en la raíz (Cloudflare Pages las sirve como
`/safety` y `/privacy`). Estáticas y **autocontenidas** (cero peticiones
externas — coherente con lo que promete la de privacidad), ES + EN en la
misma página, paleta crema con rama oscura vía `prefers-color-scheme`
(valores copiados de tokens.css: si se recalibra la paleta, actualizar),
Georgia serif (el blindaje display), sin emojis ni JS. Safety reusa el copy
del modal in-app (`breathe.safety.*`) ampliado con movilidad e hidratación;
privacy documenta local-first, export/import, CDN y BMC con honestidad.
**Pendiente de decisión**: enlazarlas desde la UI de la app (¿footer del
sidebar? ¿Tweaks?) — propuesto para s102/landing.

## Verificación (preview :8765 propio, protocolo s93)

Purga SW+caches por tanda. **Seed** de `pace.state.v2` con datos conocidos
(mié 8: foco 50 + cuerpo 10 + agua 4 · jue 9: SOLO respira 15 · HOY vie 10:
foco 25 + respira 10 + cuerpo 8 + agua 3 · caminos 5 y 9 de julio):

- **Capa de datos**: selector memo-estable, hoy fusionado {25,10,8,3},
  mes vivo {75,25,18,7}, estado persistido intacto, `getPathStats().
  currentStreak = 1` (antes 0).
- **Montaje aislado de StatsPanel + DOM**: Semana con fila "Cuerpo" y
  totales 75/25/18/7 · Mes con **día 10 (HOY) relleno + contorno** (0.38,
  banda correcta) y totales "Foco 1.3h · Respira 25min · Cuerpo 18min ·
  7 vasos" · Año con 3 celdas y footer "8 acciones · 3 días activos ·
  racha máx: 3" · Caminos "Racha actual: 1 d".
- **WeekDots**: `off off ON ON ON off off` — el jueves (solo Respira)
  enciende, el criterio nuevo funciona. Verificado también en standalone.
- **Consola limpia** (dev + standalone v0.46.0).
- **Incidente instructivo**: la pestaña estrangulada del preview produjo una
  interacción fantasma (huella exacta de un 4-7-8 finalizado: +1 min respira
  y 5 logros a las 15:51:33, ninguno de los cambios s101 toca rutas de
  completado). Re-seed + reload + 8s de reposo → cero auto-disparos.
  Refuerza la regla s93: verificar por montaje aislado + DOM y sembrar
  estado fresco antes de cada aserción, nunca fiarse del estado acumulado
  de la pestaña.

## Cierre

Bump v0.46.0 (state-core + sw.js CACHE_NAME + título PACE.html). Backup
`PACE_standalone_v0.45.0_20260710.html` (rotado `v0.33.0_20260519`, cap 20).
Build **756 KB, 71 archivos** (entra state-history, sale WeeklyStats) +
`index.html`. Standalone verificado. CHANGELOG, STATE, ROADMAP, memorias.
