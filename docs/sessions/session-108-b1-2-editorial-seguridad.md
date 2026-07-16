# Sesión 108 — B1.2 · Editorial de seguridad ES+EN — v0.53.0

> 2026-07-16 · Cierra el **bloque B1** del plan de evolución
> ([`DECISIONES_PRODUCTO.md`](../product/DECISIONES_PRODUCTO.md)). Método
> pactado: estado + desglose confirmados antes de tocar; los textos nuevos
> ES+EN se propusieron **en bloque** y el usuario los aprobó antes de
> aplicar. Decisiones del usuario (AskUserQuestion): Dead hang **opcional
> con alternativa** (no fuera) · extras BASE §9 **dentro** · punto 3
> (defaults) **completo con propuesta A**. Criterio editorial: copy
> **realista y explicativo** (memoria `feedback-realismo-ejercicios`) +
> lenguaje de [`BASE_MUEVE_ESTIRA.md`](../product/BASE_MUEVE_ESTIRA.md)
> §7-9; técnica verificada antes de escribir cada cue.

## Qué se hizo

### 1 · Lenguaje de riesgo (lista cerrada + extras §9)

Todos con su espejo EN en `i18n/content/move.js` / `extra.js`:

- **«Al fallo.»** (Fondos en silla, 3ª serie) → «Última: 8 reps limpias.
  Para si la técnica se rompe.» — sin «tantas como puedas» (prohibido §9).
- **«Al límite.»** (Core silencioso) → «Última. Mantén mientras la lumbar
  siga apoyada.» El «Aguanta.» seco del mismo set → «Mantén. Respira
  normal.»
- **«Más bajo si puedes.»** (Wall sit 2ª) → «Segunda tanda. Elige una
  altura que te deje respirar tranquilo.» La 1ª («Rodillas 90°, aguanta.»)
  → «Rodillas a 90°, espalda en la pared. Respira normal.» (isometría sin
  lenguaje competitivo, respiración normal — §3D/§8).
- **Extras §9 — «al máximo»**: grip «Estira dedos al máximo.» → «Abre bien
  los dedos, sin forzar.» · muñecas «Abre los dedos al máximo, 10 veces.»
  → «Abre bien los dedos, 10 veces.» (el EN de muñecas ya estaba bien).
  El «Aguanta 10 segundos, suelta. 3 veces.» de Glúteos invisibles se
  CONSERVA deliberadamente (estructura clara, no competitivo).

### 2 · Claims y nombres

- **«El hombro nace para colgar» + «barra o un marco»** (Colgarse) → «De
  una barra firme que soporte tu peso. Tracción suave para hombros y
  espalda.» (el marco de puerta desaparece: va contra «barra diseñada para
  soportar peso»). EN espejo.
- **«indestructibles»** (ATG): desc → «Rodillas sobre los dedos, en rangos
  profundos. Necesitas pared y suelo.» · EN name `ATG · Bulletproof Knees`
  → **`ATG · Knees over toes`** · logro «ATG descubierto» (catalog.js):
  desc «Rodillas indestructibles» → «Rodillas en rango profundo».
- **Chin tuck sin «papada»** (4 sitios): ES (Cuello·3 + exercise-registry)
  → «Desliza la barbilla recta hacia atrás; la nuca se alarga.» · EN
  (extra.js + custom.js) → "Glide your chin straight back; the back of
  your neck lengthens."
- **Tag `PULL` → `PUSH`** en Fondos en silla (es empuje de tríceps).

### 3 · Dead hang · opcional (Hombros · 5)

Elección del usuario: opcional con alternativa (duración intacta). Paso
`Dead hang (si puedes)` → **`Dead hang · opcional`** con cue «Solo con
barra firme que soporte tu peso. Sin barra: repite las wall slides.» EN
espejo. **OJO**: el name de paso es key de glifo → renombrada también la
key en `exercise-glyphs.jsx:331` (verificado en runtime: glifo resuelve,
la key vieja ya no existe). Comentario de exclusión en exercise-registry
actualizado.

### 4 · Anunciar suelo / pared / barra / silla (12 descs ES+EN)

Fondos en silla y Sentadillas de silla («silla estable, sin ruedas»),
Piernas · a una (silla estable), Sentadilla en pared (pared), Espalda de
oficina (un paso en suelo — Superman, hallazgo #7), Core · plancha (suelo),
Columna · ondas (suelo), Caderas · 5 (suelo), Couch stretch (rodilla al
suelo), Despertar matinal (empieza en suelo), Antídoto silla (pasarás por
el suelo), Ancestral (suelo y barra firme + cue del hang «De una barra
firme, suelta el peso»), Hombros · 5 (pared; barra opcional). «Caderas ·
suelo» ya lo anunciaba — intocada.

### 5 · Curación Respira · Energía (feedback s107-cierre)

- **Bhastrika (`breathe.bellows`, tag PRA)** sale de Energía → grupo
  **Pranayama** (tras Bhramari, free-first intacto). Ni
  `BREATH_ROUTINE_CATEGORIES` ni `explore.bhastrika` se tocan (van por id).
- **`breathe.rounds.express` → FREE** (fuera `access: 'premium'`): sin
  ella el grupo Energía quedaba sin entrada usable en free. Conserva
  `safety: true` (modal obligatorio). Verificado:
  `canAccessRoutine('breathe.rounds.express') === true` con
  `premiumUnlocked=false` y card sin sello en la biblioteca.
- `CONTENT.md` alineado (grupo + access con nota B1.2).

### 6 · Defaults: audio ON + aviso fin-de-foco ON (propuesta A)

- `soundOn: false → true` y `notifyFocusEnd: false → true` en defaultState
  (**solo instalaciones nuevas**: el merge de loadState conserva lo
  persistido). Colateral aceptado: `master.silent.day` pasa a requerir
  opt-out del audio.
- **Matiz del permiso** (exige gesto): helper nuevo
  `maybeRequestNotifyPermission(state, set)` en `FocusTimer.support.jsx`
  — se pide UNA vez por carga, en el primer «Comenzar» de Foco (gesto
  real), solo en web (`https?:`), solo con permiso `default`; si el
  usuario **deniega**, `notifyFocusEnd` baja a false (el toggle de Ajustes
  refleja la realidad); cerrar el prompt sin responder re-intenta en otra
  carga. El camino de Ajustes (TweaksPanel.enableNotify) queda intacto.
  FocusTimer.jsx solo suma la llamada (2 líneas — el archivo sigue al
  borde del tope, helpers fuera).

## Verificación

Dev server (SW+caches purgados, decisión s93): consola limpia · runtime
via JS: los 30+ textos ES+EN nuevos presentes en `MOVE_ROUTINES` /
`EXTRA_ROUTINES` / `PACE_STRINGS.en` / catálogo de logros / registro ·
glifo `Dead hang · opcional` resuelve y la key vieja no existe · grupos de
Respira correctos (screenshot de Energía: express «4 min» sin sello) ·
primer arranque sin estado: `soundOn:true`, `notifyFocusEnd:true` ·
`canAccessRoutine` express = true. Standalone v0.53.0 regenerado (3079 KB)
y verificado.

## Decisiones nuevas

- **Dead hang = opcional-con-alternativa** dentro de rutinas (patrón para
  pasos con material no garantizado: anunciar el material en el cue + dar
  alternativa concreta para esos segundos).
- **Defaults opt-out**: audio y aviso fin-de-foco ON por defecto; el
  permiso de notificación se pide en el primer gesto real de Foco y una
  denegación apaga el flag.
- Renombrar un `name` de paso EXIGE renombrar su key de glifo en el mismo
  cambio (name ES = key de glifo, s93).

## Pendiente que deja

- B2 · fundamentos (contrato de pasos v1 + auditoría ejercicio a ejercicio
  con ficha, BASE §11) — siguiente bloque.
- Feedback s107-cierre aún sin rutar: salida táctil de Camino · visual
  «Loto» (falta PNG) · láminas HQ (re-ingesta, regla D-4) · PWA real.
