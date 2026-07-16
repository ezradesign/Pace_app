# Sesión 107 — B1.1 · Saneamiento (plan de evolución) — v0.52.0

> 2026-07-16 · Primera sesión de código del plan de evolución
> ([`DECISIONES_PRODUCTO.md`](../product/DECISIONES_PRODUCTO.md), bloques
> B1-B4 definidos en la sesión de auditoría del mismo día). Alcance
> acordado con el usuario ANTES de tocar (AskUserQuestion): **B1.1 hoy**
> (fixes técnicos + apnea + claims Respira); el **editorial de seguridad
> ES+EN completo queda para B1.2**. Los textos nuevos (claims, secretos
> sustitutos, duraciones, «días con ritmo») se propusieron en bloque y se
> aprobaron antes de aplicar, con un recordatorio del usuario que quedó
> como criterio: **copy de ejercicios realista y explicativo** (hay
> ejercicios difíciles; verificar la técnica antes de escribir cues) —
> aplica de lleno a B1.2.

## Qué se hizo

### 1 · Fechas: `parseLocalDateKey()` (bug rachas en husos negativos)

`computePathStreaks` parseaba claves `"YYYY-MM-DD"` con `new Date(iso)`
(medianoche **UTC**); el round-trip con `toISODate` (local) retrocedía un
día al oeste de UTC y rompía el bucle de racha (hallazgo #1 de la
auditoría, en España no se manifiesta). Nuevo helper `parseLocalDateKey()`
en `state-history.jsx` (parse numérico local, expuesto a window) usado en
los 3 parseos de `computePathStreaks` (`state-paths.jsx`). Regla nueva
**#10 en CLAUDE.md**: prohibido `new Date("YYYY-MM-DD")` en el proyecto.
`PathStats.jsx:34` ya parseaba local vía `iso + 'T00:00:00'` (válido, se
deja). Migrar `lastActiveDay` a ISO sigue POSPUESTO.

### 2 · Cifras honestas

- **Contador de logros** (Sidebar): `/100` y «descubre 100−n» hardcodeados
  desde s12 → `ACHIEVEMENT_CATALOG.length` (106) con fallback y clamp a 0.
  `Achievements.jsx` ya usaba el total real; solo el sidebar mentía.
- **«Acciones» del año retirada** (YearView): era el score sintético
  (bloques de foco cap 3 + presencias + fracción de agua) redondeado y
  presentado como acciones. El footer ya tenía «días activos» (real), así
  que la cifra sintética se elimina y la real se renombra: **«{n} días con
  ritmo» / "{n} days with rhythm"** (criterio `isActiveDay` s69). El
  tooltip por celda decía «{n} acciones» con el mismo score → **«intensidad
  {n}» / "intensity {n}"** (es lo que el color ya codifica). ← este último
  no estaba en el bloque aprobado; revisable.
- **Sendero del día declarado abstracto** (Sidebar): los hitos ya no llevan
  horas inventadas (antes se repartían ficticiamente por el arco 6h→22h);
  ahora son una **secuencia equidistante** en orden fijo (foco → respira →
  cuerpo → agua) a lo largo de todo el trazo. Lo único cronológico real
  sigue siendo el puntero de «ahora».

### 3 · Acento de Estira por `kind` (MoveSession)

Estira reutiliza MoveSession y TODO el acento era `var(--move)` (hallazgo
#16). Ahora `accent`/`accentSoft` derivan de `kind` (`extra` → `--extra`
azul-gris) y gobiernan prep, glifo (StepGlyph vía props), contador de
paso, barra de progreso y done. Mueve y custom quedan idénticos.

### 4 · BreatheVisual: transición = duración de la fase

La transición CSS era fija 1800 ms (hallazgo #17): una exhalación de 8 s
animaba 1,8 s y quedaba estática; en fases de 1 s (Bhastrika) nunca
completaba. Ahora `BreathVisual` recibe `phaseDuration` (BreatheSession le
pasa `current.duration`) y la transición dura la fase entera; **fases
rápidas <2 s**: 85 % de la fase con `ease-in-out` (asienta antes del
cambio), suelo 300 ms. Los 9 usos del template comparten
`transitionDur`/`transitionEase`. Comentario de tokens.css actualizado.

### 5 · Duraciones recalibradas (declarado ≈ suma de pasos)

Las 7 desviadas ≥20 % de la auditoría §C (todas inflaban), aprobadas:
Colgarse 4→**2** · ATG·Rodillas 6→**4** · Empuje·progresión 4→**3** ·
Piernas·a una 5→**4** · Ancestral 6→**5** · Hombros·5 5→**4** ·
Sentadilla en pared 3→**2**. Efecto colateral honesto: el crédito de
minutos (`complete*Session(routine.min)`) deja de sobre-acreditar.
Tablas de CONTENT.md alineadas. (La duración DERIVADA de pasos + rangos
llega en B2.)

### 6 · Apnea retirada (decisión 1 de la auditoría)

- Fuera los 3 secretos `secret.breath.hold.60/90/120` del catálogo y del
  set IMPLEMENTED; fuera el **ticker de retención** y la **cifra-récord de
  160 px** de BreatheSession. La pantalla de hold es ahora **guía
  calmada**: pulso visual suave (`pace-hold-pulse`, 4 s alternate, sin
  números), el cue de siempre («Pulsa cuando sientas la necesidad de
  respirar») y el botón de salida siempre visible. Ids viejos en
  `state.achievements` de instalaciones antiguas: inofensivos (la UI solo
  pinta el catálogo).
- **Sustitutos** (exploración, sin marca temporal, aprobados):
  `secret.bilingual` «Dos lenguas» (cambio de `state.lang` →
  TweakSecretsWatcher, ref del idioma anterior) · `secret.backup`
  «Cuaderno a salvo» (export JSON en TweaksData) · `secret.safety.read`
  «Letra pequeña» (marcar «lo he leído» en el modal de seguridad de
  Respira — donde antes se premiaba aguantar sin aire, ahora se premia
  leer la seguridad). Paridad de acceso con los retirados: los 3 viejos
  también exigían rutinas premium (rondas); safety.read también.

### 7 · Claims de Respira a lenguaje orientativo (ES+EN, aprobados)

4·7·8 «Baja ansiedad, prepara sueño» → «Pensada para soltar el día y
preparar el descanso» · Nadi «Equilibra hemisferios» → «de la tradición
del yoga. Pensada para asentar la atención» · Coherente 5·5 «Respiración
cardíaca. Sincroniza corazón y mente» → «Ritmo constante de cinco y cinco.
Pensada para encontrar un compás estable» · Rondas profundas «Antesala del
trance consciente» → «La práctica más larga e intensa» · aside Balance
«Armoniza HRV» → «Ritmo suave y constante». EN equivalentes en
`content/breathe.js`.

## Verificación (preview :8765, dev + standalone)

Dev sin errores de consola. **En vivo**: contador 0/106 y «106 por
descubrir» (sube al desbloquear) · claims nuevos visibles y CERO claims
viejos (búsqueda DOM) · sendero «1 hito» tras un vaso de agua ·
`secret.bilingual` desbloquea al cambiar ES→EN · sesión de Estira
(Muñecas) con contador `#6B7A8F`, glifo y barra en `var(--extra)` ·
transiciones de BreathVisual medidas en sesión real (Suspiro fisiológico):
Exhala 5 s → `5s var(--ease)`, Inhala 2 s → `2s`, «Inhala más» 1 s →
`0.85s ease-in-out` · round-trip `parseLocalDateKey` correcto incl. fechas
DST (29-mar, 25-oct) · año «0 días con ritmo · racha máx» sin «acciones» ·
las 7 duraciones confirmadas por `getMoveRoutine`/`getExtraRoutine`.
Standalone v0.52.0 (3076 KB): consola limpia + spot-checks (duraciones,
catálogo 106, secretos nuevos, `parseLocalDateKey`). La pantalla de hold
no se probó en vivo (exige rondas premium); cambio revisado en código.

## Cierre

Bump v0.52.0 ×3 (título + PACE_VERSION + CACHE_NAME). Backup
`v0.51.0_20260716` desde git HEAD, byte-idéntico (hash git verificado);
rotado `v0.34.2_20260630` (cap 20). Standalone 3076 KB / index ~978 KB.

## Pendiente → B1.2 (siguiente sesión)

Editorial de seguridad ES+EN completo: «al fallo / al límite / más bajo si
puedes / indestructibles / el hombro nace para colgar», chin tuck sin
«papada», tag PULL→empuje en fondos, anunciar suelo/pared/barra, «silla
estable y sin ruedas», «barra diseñada para soportar peso», Dead hang
fuera de Hombros·5 o marcado opcional. Con el criterio del usuario:
realista y explicativo, verificar técnica antes de escribir cues.
