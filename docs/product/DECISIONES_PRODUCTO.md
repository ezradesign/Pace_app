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

### B1 · Saneamiento (1-2 sesiones) — SIGUIENTE

Fixes objetivos, cero decisiones de diseño nuevas:

- `parseLocalDateKey()` + fix del round-trip UTC en `computePathStreaks`
  ([state-paths.jsx:204-212]) — rachas de Caminos rotas en husos negativos.
  Prohibir `new Date("YYYY-MM-DD")` en el proyecto. (Migrar `lastActiveDay`
  a ISO queda POSPUESTO.)
- Contador de logros `/100` → `ACHIEVEMENT_CATALOG.length` (Sidebar.jsx:194,201;
  el catálogo tiene 106).
- «Acciones» del año → «días con ritmo» o retirar la cifra (YearView.jsx:80,
  es un score sintético).
- Sendero del día declarado abstracto — sin pretender cronología
  (Sidebar.jsx:233 reparte horas ficticias).
- Acento por `kind` en MoveSession: Estira deja de vivir en `var(--move)`
  (prep, glifo, contador, barra, done).
- BreatheVisual: transición = duración de la fase (hoy fija 1800 ms), con
  tratamiento propio para fases rápidas (<2 s).
- Recalibrar las 7 duraciones desviadas ≥20 % (hang.bar −46 %, atg.knees
  −33 %, push.ladder −31 %, legs.single, ancestral −25 %, shoulders.5 −22 %,
  wall.sit −17 %).
- Editorial de seguridad ES+EN: eliminar «al fallo», «al límite», «más bajo
  si puedes», «indestructibles», «el hombro nace para colgar»; chin tuck sin
  «papada»; tag `PULL`→empuje en fondos; anunciar suelo/pared/barra; «silla
  estable y sin ruedas»; «barra diseñada para soportar peso»; Dead hang
  fuera de Hombros·5 o marcado opcional.
- Claims de Respira → lenguaje orientativo («pensada para favorecer…», sin
  «baja ansiedad / equilibra hemisferios / armoniza HRV / sincroniza corazón
  y mente / antesala del trance»).
- Apnea (decisión 1).

### B2 · Fundamentos (2-3 sesiones)

- **`visualId` + mapa de alias**: los `step.name` ES actuales siguen
  resolviendo; NO se toca localStorage. Desbloquea el renombrado EN→ES de
  títulos técnicos (feedback s101).
- **Contrato de pasos v1**: `mode: timed | reps | perSide | rest |
  transition | manual`, fallback `sin mode → timed`. Pilotar en 4-6 rutinas
  (2 Respira · 2 Mueve · 2 Estira; candidatas: diafragmática, coherente 5·5,
  flexiones de escritorio, sentadillas de silla, cuello·3, antídoto silla).
- **Metadatos de rutina**: `position / equipment / requiresFloor /
  intensity / level / discrete` (base de la taxonomía s108).
- **Duración derivada** de pasos + rangos honestos («3–5 min · a tu ritmo»
  para reps).
- **Feedback ligero «¿te ayudó?»** (Mejor/Igual/No): contador `{done,
  helped}` por rutina, sin sistema de eventos. Alimenta Pausa PACE y el
  futuro «qué te ayuda» premium.
- Diseñar (solo diseñar) el esquema de eventos con `schemaVersion`.

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
