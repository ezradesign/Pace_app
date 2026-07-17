# Sesión 111 — B2 · Método del runner v1 (gate que fluye + reps a gusto)

> **Fecha:** 2026-07-17 · **Versión:** v0.54.0 → **v0.55.0** · **Bloque:** B2
> (fundamentos), 3ª sesión — refinamiento del método, no contenido nuevo.
> **Gobierna:** [`BASE_MUEVE_ESTIRA.md`](../product/BASE_MUEVE_ESTIRA.md) §3/§4/§6 ·
> **Base:** contrato de pasos v1 de [s110](./session-110-b2-2a-contrato-pasos.md)
> (`MoveSessionV1.jsx`) · **Canónico:** [`DECISIONES_PRODUCTO.md`](../product/DECISIONES_PRODUCTO.md) §B2.

---

## Encargo

Feedback de cierre s110: el contrato v1 funciona pero el **método es demasiado
gatillado / incómodo**. Dos roces concretos:

- **(a)** El botón «Empezar» del placement gate **por paso** es un rollo — un
  tap obligatorio antes de cada paso cansa. Además, tras el prep 3·2·1 de la
  sesión, el paso 1 pedía OTRA vez «Empezar» → doble cuenta seguida.
- **(b)** En reps, el número objetivo (p. ej. 12) se leía como **cuota** y la
  única salida era «Terminé», sin flexibilidad ni flujo cómodo.

Objetivo: un método ÚTIL y SENCILLO, SIN perder la honestidad de BASE §3 (el
timer no arranca leyendo la colocación — R1; las reps no son cuenta atrás — R2).

## Método (decisiones ANTES de código)

Arranque completo de CLAUDE.md (STATE, DESIGN_SYSTEM, BASE §3/§4/§6, DECISIONES
§B2, diario s110, runner + datos). Confirmado el estado antes de tocar nada.
**Decisiones vía AskUserQuestion** (§11 de BASE):

1. **(a) Gate de colocación → «Auto + condicional»**. El gate se vuelve
   cuenta-atrás que **fluye sola**, sin tap obligatorio; y los pasos sin cambio
   de posición real se lo saltan.
2. **(b) Reps → «Objetivo suave + Terminé siempre»**. El número se presenta
   como sugerencia; «Terminé» avanza en cualquier momento; sin botón +/− extra.
3. **Corte** → solo el método hoy; B2.2b (metadatos + duración derivada +
   feedback + esquema de eventos) a su sesión propia.

**Refinamiento del desglose (aprobado antes de editar):** el «condicional» se
deriva del propio **`mode`**, sin añadir metadatos (más barato y honesto que un
flag `setup:true`, reservado para B2.2b si hiciera falta afinar).

## Qué se hizo

### 1 · Gate de colocación: auto-countdown + condicional por modo

`MoveSessionV1.jsx`. Regla nueva de `startStep(idx)`:

| Tipo de paso | Gate |
|---|---|
| `reps` / `rest` | **Ninguno** — fluye directo (no hay reloj que proteger; R2). |
| `timed` / `perSide` con **idx > 0** | **Cuenta-atrás auto** «Colócate… 5·4·3·2·1» → arranca el reloj al llegar a 0. |
| Paso **0** (cualquiera) | **Ninguno** — el prep 3·2·1 de la sesión ES su ventana de colocación (evita la doble cuenta). |

- Estado `placeLeft` + efecto de cuenta-atrás (`setInterval` en fase `place`;
  al llegar a 0 → `beginWork()`). **No es el timer del ejercicio** (R1): es una
  ventana de colocación que fluye sola.
- Botones de la fase `place`: **«Empezar ya»** (salta a trabajo) + **«Más
  tiempo»** (+5 s por toque, para retener). Cero tap obligatorio.
- `V1_PLACE_SECONDS = 5` por defecto; `step.setup` opcional para colocaciones
  largas (ninguna rutina lo usa hoy).
- La rama `reps` deja de pasar por `place` (antes había un tap de más antes de
  las reps): ahora va directa a la pantalla de reps, que ya espera sin reloj.

### 2 · Reps a gusto: objetivo suave

- Label bajo la cifra: `move.reps` («reps») → **`move.repsTarget`** («reps · a
  tu ritmo»). El número se lee como sugerencia, no como cuota.
- «Terminé» sigue avanzando en cualquier momento (más o menos reps, sin culpa);
  hint «Haz menos si lo necesitas» intacto. Sin botón +/− (decisión: redundante).

### 3 · i18n

`strings/sessions.js`, 4 keys nuevas ES+EN — `session.beginNow` («Empezar
ya»/«Begin now»), `session.moreTime` («Más tiempo»/«More time»),
`session.placeCountdown` («para empezar»/«to begin»), `move.repsTarget` («reps ·
a tu ritmo»/«reps · your pace»). Actualizado `move.placeHint` para reflejar que
el gate arranca solo («Colócate sin prisa · arranca solo · «Empezar ya» para
saltar»).

## Verificación (preview :8765)

**Nota de proceso:** el SW servía la versión cacheada al arrancar (aviso
«Actualizar»); se desregistró SW + se limpiaron caches para servir archivos
frescos en dev. En el standalone, el `navigate` a la misma URL no recargaba
(persistía la sesión React residual) → se forzó `location.reload()`; NO es bug
de la app (tras recargar, la home queda limpia — las sesiones son estado
efímero, no se persisten).

- **Dev**, paso a paso:
  - `desk.pushups` (reps+rest): paso 1 (reps) **directo a trabajo, sin gate**,
    label **«reps · a tu ritmo»** + «Terminé». Descanso auto-avanza. Paso 3
    (reps) también sin gate. ✓ (a)+(b) para reps.
  - `neck.3`: paso 0 (Chin tucks reps) sin gate. Paso 1 (Inclinación lateral,
    perSide) → **gate «Colócate» que fluye solo** (num 5→0, sin tap); «Más
    tiempo» ×2 → 14 (suma 5 c/u); «Empezar ya» → salta a trabajo «Izquierda». ✓
  - `chair.antidote`: paso 0 (Apertura de pecho, **timed**) → **sin gate**
    (`hasColocate:false`, arranca reloj 40) — el prep cubre la colocación. ✓
  - Consola limpia.
- **Standalone** regenerado (`node build-standalone.js`, 82 scripts, 3100 KB,
  sanity OK): gate perSide «Colócate» + «Empezar ya»/«Más tiempo» + fase
  «Cambia de lado» (captura), reps «reps · a tu ritmo» (desk.pushups), runner
  **legacy** intacto (Hombros · 5 pasos: «segundos»/«Pausar»/«Siguiente»).
  Consola limpia.
- Bump v0.55.0 ×3 (PACE.html título, sw.js CACHE_NAME, state-core PACE_VERSION).
- Backup `PACE_standalone_v0.54.0_20260717.html` desde el standalone en disco
  (rotado el más antiguo `v0.34.5_20260707`, cap 20).

## Archivos tocados

**Editados:** `app/move/MoveSessionV1.jsx` (place gate condicional +
auto-countdown + footer «Más tiempo» + reps soft label; ~255 → ~275 ln) ·
`app/i18n/strings/sessions.js` (4 keys + placeHint) · `PACE.html` + `sw.js` +
`app/state-core.jsx` (bump) · `PACE_standalone.html` + `index.html`
(regenerados).

## Pendiente → B2.2b (próxima)

Metadatos por rutina (`position/equipment/requiresFloor/intensity/level/
discrete`) · duración derivada de pasos + rangos honestos · feedback ligero
«¿te ayudó?» (`{done,helped}` sin eventos) · **diseñar** (solo diseñar) el
esquema de eventos con `schemaVersion`. El flag `setup:true` por paso (para
colocaciones largas suelo/pared) queda disponible como refinamiento opcional
del gate cuando lleguen los metadatos. Después: plan maestro (home Caminos al
centro + After Pomodoro + scoring v2).
