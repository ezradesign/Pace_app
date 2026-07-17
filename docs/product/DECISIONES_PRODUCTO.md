# PACE · Decisiones de evolución de producto

> **Canónico de la evolución post-v0.51.0.** Destilado de los documentos de
> evolución (`PACE_EVOLUTION_CONTEXT.md` + 2 bloques de ideas, 2026-07)
> contrastados con el código real en
> [`audit-evolucion-v0.51.0`](../audits/audit-evolucion-v0.51.0.md).
> Las sesiones que toquen contenido, actividades, Caminos, stats o el plan
> de evolución leen **este archivo**, no los documentos originales ni la
> auditoría completa. Se actualiza al cerrar cada sesión del plan
> (sustituir, no acumular — mismo contrato que STATE.md).

---

## Decisiones tomadas (2026-07-16, sesión de auditoría)

1. **Apnea — retirar.** Fuera los 3 logros secretos `secret.breath.hold.60/90/120`
   y la cifra-récord del hold (160 px). La retención pasa a guía calmada con
   salida siempre visible. Se sustituyen por 3 secretos de exploración sin
   marca temporal.
2. **Calendario — B1+B2 antes de s107.** El saneamiento y los fundamentos se
   insertan antes de seguir el plan maestro (ROADMAP). La pre-venta se
   retrasa ~3-4 sesiones; After Pomodoro y la taxonomía nacen sobre el
   contrato nuevo.
3. **Stats Free/Premium — dirección fijada** (implementación en la sesión de
   licencia, no antes): Free = resumen de Hoy + tira de 7 días + export y
   borrado siempre gratis. Premium = mes, año, patrones, «qué te ayuda»,
   comparaciones contigo mismo. Premium bloquea interpretación, nunca
   propiedad de los datos. Copy: «Free te ayuda hoy · Premium te ayuda a
   entender tu ritmo».
4. **Descartado definitivamente:** renombrar `extra.*`→`stretch.*` (IDs
   persistidos, swap s14 blindado) · vídeo/fotografía de ejercicios · IA en
   producto · Travesías (12-21 etapas) por ahora.
5. **Contrato de pasos v1 aprobado** (ver B2) con fallback total al formato
   actual.

---

## Plan de bloques (antes de s107; después sigue el plan maestro)

### B1 · Saneamiento — CERRADO (B1.1 s107/v0.52.0 · B1.2 s108/v0.53.0)

**B1.1 hecho** (s107, 2026-07-16; diario
[session-107](../sessions/session-107-b1-saneamiento.md)):
`parseLocalDateKey()` + fix `computePathStreaks` + regla #10 CLAUDE.md
(migrar `lastActiveDay` a ISO sigue POSPUESTO) · contador de logros
dinámico (/106) · «acciones» del año retirada → «días con ritmo» real
(+ tooltip «intensidad {n}», coherencia no aprobada en bloque — revisable) ·
sendero del día abstracto · acento de Estira por `kind` en MoveSession ·
BreatheVisual transición = duración de fase (<2 s → 85 % + ease-in-out) ·
7 duraciones recalibradas (2/4/3/4/5/4/2; CONTENT.md alineado) · apnea
retirada (hold = guía calmada; sustitutos `secret.bilingual` /
`secret.backup` / `secret.safety.read` con detector) · claims de Respira
orientativos ES+EN.

**B1.2 hecho** (s108, 2026-07-16; diario
[session-108](../sessions/session-108-b1-2-editorial-seguridad.md)):
editorial de seguridad ES+EN completo con criterio BASE §7-9 + memoria
`feedback-realismo-ejercicios` — «al fallo»/«al límite»/«más bajo si
puedes»/«aguanta» secos/«al máximo» reescritos (reps limpias, respiración
normal, mantener con condición técnica) · «el hombro nace para colgar» y
el «marco» de puerta → «barra firme que soporte tu peso» ·
«indestructibles» fuera (desc ATG + EN `Knees over toes` + logro) · chin
tuck sin «papada» (4 sitios) · tag `PULL`→`PUSH` en fondos · **Dead hang ·
opcional** con alternativa en cue (decisión del usuario: opcional, no
fuera; key de glifo renombrada en sincronía) · 12 descs anuncian
suelo/pared/barra firme/silla estable sin ruedas · **curación
Respira·Energía**: Bhastrika (PRA) → grupo Pranayama y `rounds.express` a
FREE · **defaults opt-out**: `soundOn:true` + `notifyFocusEnd:true`
(instalaciones nuevas; permiso en el primer «Comenzar» de Foco, denegar
apaga el flag). Extras §9 incluidos por decisión del usuario; el «Aguanta
10 segundos, suelta» de Glúteos invisibles se conservó (estructura, no
competición). **Regla viva: el contenido nuevo (B2+) nace ya con este
lenguaje.**

**Feedback s107-cierre pendiente de rutar** (registrado también en STATE):
**salir de un Camino a la home**: el «×» del paso avanza al siguiente
(diseño s99) y en móvil no existe Esc → hace falta vía táctil explícita de
abandono · visual de Respira **«Loto»** (PNG del usuario como estilo NUEVO
de tweak, sin retirar «flor»; falta el PNG en el repo) · **láminas de
Caminos en más resolución** (el usuario las tiene; re-ingesta con
`ingest-lamina.js` — REGLA D-4: re-medir, jamás swap directo del asset).
Los defaults de audio/aviso quedaron HECHOS en B1.2.

### B2 · Fundamentos (2-3 sesiones)

> **Base de conocimiento offline** (usuario, s107-cierre):
> [`BASE_MUEVE_ESTIRA.md`](./BASE_MUEVE_ESTIRA.md) — NHS/ACSM/OMS
> traducidas a reglas de PACE. Gobierna B2 y el editorial: unidad por tipo
> (fuerza=reps · movilidad=ciclos · estático/isometría=tiempo por lado ·
> postural=reps+retención) · duración CALCULADA (setup+activo+lados+
> transiciones+descansos+cierre) · runner por modo (timer nunca arranca
> mientras se lee la colocación; reps terminan en manual) · explicación
> mínima de 6 partes · molestia≠esfuerzo≠dolor · rangos de producto ·
> **auditoría ejercicio-a-ejercicio con ficha ANTES de tocar código**.

**B2.1 auditoría — HECHA** (s109, 2026-07-16; diario
[session-109](../sessions/session-109-b2-1-auditoria-ejercicios.md); tabla
[`audit-b2-ejercicios-v0.53.0.md`](../audits/audit-b2-ejercicios-v0.53.0.md)).
28 rutinas + 66 fichas §11 auditadas SIN tocar código. Hallazgos clave:
**R1-R5 del runner** (prep sin colocación por paso · auto-avance sin
«Terminé» · sin cambio de lado · **stats acreditan `routine.min` declarado,
no el real** · descansos sin tipar) que se arreglan UNA vez en el contrato
v1. Contenido: reps encerradas en timer (100 % de la fuerza de Mueve) ·
estáticos sin tiempo por lado · transiciones invisibles (11 rutinas) ·
declarado ≠ real (19/28) · el **Pigeon de `move.hips.5`** es imposible
(«40s/lado» en `dur:60`) y vive en `path.midday` free. **Decisiones de la
tabla:** 0 retirar · reescribir 4 cues + 2 rutinas (`legs.single`,
`atg.knees`) · **revisar con fisioterapeuta 4** (Nordics, Sissy squat, Fondos
en silla, Couch stretch) · unificar 4 duplicados vía `visualId` · **sustituir
Nordics** en `move.atg.knees` (degustado gratis en `path.weekend`). **Piloto
v1 propuesto (6):** diafragmática + coherente 5·5 + desk.pushups + chair.squats
+ neck.3 + chair.antidote (suplente `move.hips.5`) — cubren biblioteca Y runner
de Caminos. **Pendiente de aprobación antes de B2.2:** la tabla completa, las
4 fichas de fisio, la sustitución de Nordics y si `path.weekend` cambia de
degustación.

**B2.2a — HECHA** (s110, 2026-07-17; v0.54.0; diario
[session-110](../sessions/session-110-b2-2a-contrato-pasos.md)). Decisiones
resueltas antes de código (AskUserQuestion): fichas fisio → B4 · **Nordics
sustituido** por «Puente isquio a una pierna» en `move.atg.knees`,
`path.weekend` **intacto** · 6 pilotos confirmados · corte visualId+contrato
hoy / resto mañana.

- **`visualId` + mapa de alias — HECHO**: `exercise-aliases.js`
  (`resolveVisualId`) unifica 4 duplicados de glifo; `step.name` ES sigue
  resolviendo, NO se toca localStorage. Rib pull NO unificado (caso
  reescribir). El renombrado EN→ES de títulos queda para una ola de contenido.
- **Contrato de pasos v1 — HECHO (pilotado)**: `mode: timed | reps | perSide
  | rest`, fallback `sin mode → legacy`. `MoveSessionV1.jsx` (runner por modo)
  + `MoveSession` dispatcher. **R1-R5** resueltos: placement gate por paso ·
  reps con «Terminé» · cambio de lado real · **minutos reales** (no
  `routine.min`, ambos runners) · rest tipado. Pilotos: `desk.pushups`,
  `chair.squats`, `neck.3`, `chair.antidote` (2 Respira = control `timed`
  conceptual). `transition`/`manual` reservados (ningún piloto los usa; el
  cambio de posición lo absorbe el placement gate). Split `MOVE_ROUTINES` →
  `move.data.js` (MoveModule 451→331 ln).

**B2.2 método — HECHO** (s111, 2026-07-17; v0.55.0; diario
[session-111](../sessions/session-111-b2-metodo-runner.md)). Refina el
**método** del runner v1 (feedback de cierre s110: demasiado gatillado), sin
contenido nuevo. Decisiones (AskUserQuestion): gate «auto + condicional» ·
reps «objetivo suave + Terminé siempre» · corte «solo el método».

- **Gate de colocación**: deja de exigir tap → **cuenta-atrás que fluye sola**
  («Colócate… 5·4·3·2·1» → arranca el reloj al 0) con «Empezar ya» (salta) +
  «Más tiempo» (+5 s). **Condicional derivado del `mode`** (sin metadatos):
  solo `timed`/`perSide` e **idx>0** — `reps`/`rest` fluyen directos y el paso 0
  hereda el prep 3·2·1 (evita la doble cuenta). **R1 intacto** (la cuenta es de
  colocación, no el timer). `step.setup` por paso queda disponible (sin uso) para
  colocaciones largas suelo/pared → refinar en B2.2b con los metadatos.
- **Reps**: el número deja de leerse como cuota (label «reps · a tu ritmo»);
  «Terminé» avanza en cualquier momento, sin botón +/−. **R2 intacto**.
- Solo `MoveSessionV1.jsx` + `strings/sessions.js` (4 keys). Runner legacy y
  `step.name` intactos.

**B2.2b — PENDIENTE** (próxima sesión):

- **Metadatos de rutina**: `position / equipment / requiresFloor /
  intensity / level / discrete` (base de la taxonomía s108).
- **Duración derivada** de pasos + rangos honestos («3–5 min · a tu ritmo»
  para reps).
- **Feedback ligero «¿te ayudó?»** (Mejor/Igual/No): contador `{done,
  helped}` por rutina, sin sistema de eventos. Alimenta Pausa PACE y el
  futuro «qué te ayuda» premium.
- Diseñar (solo diseñar) el esquema de eventos con `schemaVersion`.
- **B2.3** (olas siguientes): migrar las otras 22 rutinas al contrato +
  reescribir 4 cues (Seated twist, Rib pull, WGS, Ground transitions) + 2
  rutinas (`legs.single`, resto de `atg.knees`).

### B3 · s107-109 ampliadas (el plan maestro absorbe)

- **s107**: After Pomodoro / **Pausa PACE** — el BreakMenu recomienda UNA
  rutina concreta con razón explicable + «Otra opción» + «Ahora no» (el menú
  actual queda detrás). Scoring v2 de `getSuggestedPath` (señales aprobadas:
  hora +4 · favorito +3 — `paths.favorite` existe y hoy NO se consulta —
  repetido hoy −4 · ayer −2 · duración compatible +3 · premium bloqueado
  −10/teaser). Home contextual: la SuggestedPathCard se transforma
  temporalmente post-foco (no se añade superficie nueva). Mini-Caminos 2-3
  min. Regla: **una sola recomendación principal a la vez** en la home.
- **s108-109**: taxonomía + primera capa por NECESIDAD (Activarme / Soltar
  cuello y hombros / Sin levantarme…) + segunda por zona · tarjetas
  enriquecidas (beneficio + 3-4 chips legibles: SENTADO/SUELO/SUAVE, fuera
  SIT/SHLD/ATG/ANC) · vista previa de rutina («Necesitarás… / Harás…») ·
  jerarquía instructiva en sesión (capas: prepárate → muévete → nota →
  ajusta; alternativa fácil; el temporizador deja de dominar).

### B4 · Piloto visual dos-poses (tras B3, junto a la revisión de glifos pre-venta)

12 ejercicios prioritarios con diagrama inicio/final + flecha + zona +
apoyo (candidatos: flexiones inclinadas, sentadilla a silla, chin tucks,
flexor de cadera, rotación torácica, apertura de pecho, 90/90, muñecas,
wall slides, cuello y trapecios, calf raises, cadena posterior).
**REGLA s84 intacta**: el usuario dibuja/aprueba, se porta literal. Los
glifos 44×44 actuales se conservan como sellos/miniaturas (identificar ≠
enseñar). SVG animado SOLO si el estático valida.

---

## Pospuesto (no abrir hasta su fase)

- **Eventos** (`schemaVersion`, retención 90-180 días, agregados
  permanentes): implementar antes de stats premium / licencia.
- **Re-gating de stats** (decisión 3): sesión de licencia.
- **Sidebar Ahora/Hoy/Repetir/Mis pausas**: necesita feedback+eventos; la
  racha compacta y «Hoy» pueden adelantarse en una sesión de pulido.
- Rituales personales (extensión del builder F7) · objetivo semanal suave
  («3 de 4 días laborables», va a la sesión de gamificación) · check-in
  «¿cómo llegas?» · portadas de rutina (nivel 2) · migrar `lastActiveDay` a
  ISO · sendero cronológico real (necesita eventos).

## No re-verificar (auditado 2026-07-16 contra v0.51.0)

- Los glifos **NO** se rompen en inglés: los 3 consumidores de
  `ExerciseGlyph` pasan siempre el nombre canónico ES (MoveModule.jsx:414,
  CustomBuilder.jsx:93,139). La hipótesis llegó 2 veces y está refutada.
- Los IDs de rutina son estables; los IDs cruzados módulo↔prefijo (swap
  s14) están blindados en CONTENT.md — **no tocar**.
- `getSuggestedPath` dominado por `lastViewed` es deliberado (s78) y el
  onboarding s106 depende de ello; el scoring v2 lo evoluciona en s107.
- Hallazgos completos con evidencia file:line, tabla de duraciones y
  cobertura de glifos: ver la auditoría enlazada arriba.
