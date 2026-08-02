# Sesión 145 — Fase 2.5: los logros dejan de regalarse de cuatro en cuatro

**Fecha:** 2026-08-02 · **Versión:** v0.77.0 → **v0.78.0** · Sesión de **CÓDIGO**.

Primera mitad de la Fase 2.5, la que no necesita glifos. La queja del usuario era
literal: *«con hacer media cosa o incluso saltando algo ya consigues 4 logros
seguidos»*.

---

## 1 · La queja, medida en el código

Una **primera sesión de Respira a las 6:50** desbloqueaba **cuatro logros de golpe**,
cada uno con su toast en cascada:

| Logro | Por qué salta |
|---|---|
| `first.breath` | siempre, en `completeBreathSession` |
| `explore.<tipo>` | lo tienen **12 de las 20** rutinas de Respira |
| `master.dawn` | por ser antes de las 7 (`checkTimeOfDayAchievements`) |
| `first.day` | `updateStreak()` lo da con `current >= 1` — o sea, con hacer algo |

Y podía ser peor: con el plan del día completo entran además `first.ritual` y
`first.plan`. `unlockAchievement` llamaba a `showToast` en el acto, así que los cuatro
avisos salían pisándose.

## 2 · Lo que se cambia (y lo que NO)

**Decisión del usuario: uno por sesión, cola invisible.** De las tres opciones
planteadas descartó «1 por sesión y día» (demasiado lento para quien arranca fuerte) y
«todos en fila» (arregla el solapamiento pero no la sensación de regalo).

**Lo que NO cambia, y es lo importante:** el logro se **gana** en el momento y queda
registrado en `achievements` al instante. Solo se aplaza el **aviso**. Nadie ve progreso
retroceder, así que la regla **§2.5 «progreso sin culpa» queda intacta** — a diferencia
del recálculo de umbrales, que sí será una excepción consciente y va aparte.

**La cola se persiste** (`achievementQueue` en `defaultState`). Si viviera en memoria,
una recarga se comería las celebraciones pendientes: el logro seguiría ahí, pero no se
anunciaría nunca. Las instalaciones previas la reciben vacía por el merge de `loadState`.

## 3 · Dónde se drena

`flushAchievementToast()` saca **uno** y lo celebra. Se llama en los cierres de sesión,
**gane o no gane un logro nuevo** — si solo drenara al desbloquear algo, una cola de tres
se quedaría esperando para siempre a que hubiera un cuarto.

Cuatro cierres naturales: **Respira · Mueve · Estira · Foco**, justo después de
`updateStreak()`, que es el último paso de la sesión y garantiza que ya corrieron todos
los detectores.

**El agua necesitaba el suyo aparte**: `addWaterGlass` acredita **sin pasar por un cierre
de sesión**, así que sin su propio drenaje quien solo bebiera agua no vería nunca lo que
se ha ganado.

## 4 · Verificación (app real, estado sembrado limpio)

| | Gana | Se anuncia | Queda en cola |
|---|---|---|---|
| Sesión 1 · Respira (Box 4·4·4·4) | 3 | **1** | 2 |
| Sesión 2 · Mueve | +1 | **1** (el más antiguo) | 2 |

Uno por sesión, en orden de llegada (FIFO), y el recuento de `achievements` sube en el
instante del desbloqueo. Consola sin errores nuevos.

## 5 · Cambios en el árbol

| Archivo | Cambio |
|---|---|
| `app/state-achievements.jsx` | `unlockAchievement` encola en vez de avisar · `flushAchievementToast()` nuevo · drenaje en los 3 cierres de sesión de aquí |
| `app/state-core.jsx` | `achievementQueue: []` en `defaultState` |
| `app/state-timer.jsx` | drenaje en el cierre de Foco |
| `app/state-hydrate.jsx` | drenaje propio del agua |

`PACE_standalone.html` **no se regenera** (s134): restaurado byte-idéntico,
`998e3e358d689036`.

## 6 · Lo que queda de la Fase 2.5

- **Subir umbrales (§15.3)** y **recalcular** con las reglas nuevas. El recálculo es la
  **excepción consciente a §2.5 y §2.2** que el usuario aceptó en s136: alguien puede ver
  que ha perdido logros, así que hay que decidir **cómo se le comunica** para que no
  parezca un bug. Esto no se ha tocado.
- **Los glifos**: 34 para 106 logros, y hoy toda miniatura desbloqueada pinta un `✦` fijo
  (`Sidebar.jsx`). Necesita arte del usuario; el sello por categoría (`CAT_META`, 7
  categorías) sigue siendo la transición decidida en s136.
