# Sesión 109 — B2.1 · Auditoría ejercicio a ejercicio (Mueve · Estira · Registro · Caminos)

**Fecha:** 2026-07-16 · **Versión:** v0.53.0 (sin cambio — sesión solo-docs, CERO código)
**Bloque:** B2 · Fundamentos, 1ª sesión (el plan canónico vive en
`docs/product/DECISIONES_PRODUCTO.md`; el manual que gobierna es
`docs/product/BASE_MUEVE_ESTIRA.md`)

---

## Qué se hizo

**Entregable único:** [`docs/audits/audit-b2-ejercicios-v0.53.0.md`](../audits/audit-b2-ejercicios-v0.53.0.md)
— la auditoría completa con ficha BASE §11 de TODO el inventario de cuerpo,
sin tocar una línea de código (encargo §11: «entregar tabla; implementar solo
tras aprobación»).

Método pactado y cumplido: estado + desglose confirmados con el usuario ANTES
de escribir (inventario real: 14+14 rutinas · 62+71 steps · 65 ejercicios de
registro · 5 steps `body` de Caminos); el usuario eligió **todo en una sesión**
(AskUserQuestion; alternativas de corte Mueve/Estira descartadas).

### Estructura del entregable

1. **Hallazgos R1-R5 del runner** (separados del contenido): prep de 3 s sin
   colocación por paso · auto-avance sin «Terminé» · el cambio de lado no
   existe · **stats acreditan `routine.min` declarado, no el real**
   (MoveModule.jsx:206-209) · descansos indistinguibles de trabajo. Se
   arreglan UNA vez en el contrato v1 y liberan a las 28 rutinas.
2. **5 hallazgos sistémicos de contenido**: reps encerradas en timer (100 %
   de la fuerza de Mueve) · estáticos sin tiempo por lado (ningún bilateral
   lo tiene) · transiciones invisibles (11 rutinas pasan por suelo/pared/
   barra sin contarlo) · declarado ≠ suma ≠ real (19/28 rutinas) · ejercicios
   demasiado avanzados sin escalón (Nordics, Sissy, ATG, Couch, Squat
   profundo, Ground transitions).
3. **Los 15 casos peores** con evidencia file:line. Estrella: Pigeon en
   `move.hips.5` — «40s por lado» dentro de `dur: 60`, imposible — y esa
   rutina vive en `path.midday` (free). Patrón «lado×2 = dur exacto» (cambio
   = 0 s) en 4 ejercicios más.
4. **Tabla A** — 28 rutinas: declarada vs suma vs activa real vs total real +
   decisión. Resultado: 0 retirar · 5 mantener · 21 cambiar temporización ·
   2 reescribir (`extra.legs.single`, `move.atg.knees`).
5. **Tabla B** — 66 fichas de ejercicio (65 registro + `Dead hang · opcional`):
   mantener 17 · cambiar temporización 37 · reescribir 4 · unificar visualId 4
   · a tipo `rest` 1 · **revisar con fisioterapeuta 4** (Nordics, Sissy squat,
   Fondos en silla, Couch stretch) · retirar 0.
6. **Apéndice**: divergencias registro↔rutinas (el registro s93 quedó atrás
   tras B1.1/B1.2 — misma identidad, cifras distintas) · mapa de duplicados
   para `visualId` (Chest opener/Apertura de pecho · Deep squat hold/Squat
   profundo · Deep breaths/Reset respiración · Rib pull↔Gato-camello a
   confirmar) · estado de los 5 steps body de Caminos · **leftover B1.2**:
   «Abre los dedos al máximo» en exercise-registry.js:117 (el barrido s108
   saneó el uso en rutina, no el registro).

### Propuesta de piloto v1 (para B2.2)

Confirmadas las candidatas de DECISIONES, cada una estrena un modo:
diafragmática + coherente 5·5 (fallback `timed`) · **flexiones de escritorio**
(`reps`+`rest`, en path.afternoon) · **sentadillas de silla** (la fuerza más
honesta) · **cuello·3** (`perSide`+postural, en path.dawn) · **antídoto silla**
(mezcla completa, en path.dusk). **Suplente prioritaria: `move.hips.5`**
(caso Pigeon + Camino free). Con las 4 de cuerpo el piloto cubre biblioteca
Y runner de Caminos sin trabajo extra.

## Decisiones de sesión

- Corte: **todo en una sesión** (usuario, AskUserQuestion).
- La auditoría asume R1-R5 resueltos en runner y audita contenido aparte —
  evita repetir 5 veces lo mismo en 28 filas.
- No se re-auditó copy de seguridad (B1.2 cerrado); los 2 hallazgos
  editoriales que asomaron (registry «al máximo»; cue de Band pull-apart
  confuso) van como filas de tabla para B2.2, no como re-apertura de B1.
- Cierre solo-docs: sin regenerar standalone (patrón de la sesión de
  auditoría de evolución, commit e4d7ac1), sin fila nueva en CHANGELOG
  (no hay versión nueva); diario + STATE + DECISIONES_PRODUCTO sí.

## Pendiente / próxima sesión (B2.2)

1. **Aprobación fina de la tabla** al arrancar B2.2 (la implementación
   solo tras OK, §11): en especial las 4 fichas «revisar con fisioterapeuta»,
   la sustitución de Nordics y si `path.weekend` cambia de rutina degustada.
2. **B2.2 — implementación de fundamentos** sobre la tabla: `visualId` +
   mapa de alias (sin tocar localStorage) → contrato de pasos v1 en las 4-6
   piloto → metadatos → duración derivada + rangos honestos.
3. El leftover «al máximo» (exercise-registry.js:117) — 1 línea en B2.2.
