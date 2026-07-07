# Sesión 91 — F5: contenido Estira, 7 → 14 rutinas

**Fecha:** 2026-07-07
**Versión:** v0.35.0 → **v0.36.0**
**Bloque:** Contenido+Premium — Fase 5 (crecer catálogo Estira)

---

## Objetivo

Crecer Estira de 7 a ~12-15 rutinas (~mitad premium) con el runner actual
(`MoveSession`, 100% data-driven). Inspiración pedida por el usuario:
**Strengthside** (caderas/hombros/columna, movilidad de suelo, flujos diarios
cortos, couch stretch) — estructura y técnica, nunca copy literal.

## Auditoría previa

- 7 rutinas planas en `EXTRA_ROUTINES` (ids `move.*` por el swap s14), 5 free
  / 2 premium. `getExtraRoutine` con un único consumidor externo
  (`paths/registry.js` → `resolveBodyRoutine`) → agrupar es seguro.
- `MoveSession` no necesita cambios (rutinas nuevas = solo datos).
- Glifos por nombre de paso ES en `exercise-glyphs.jsx` (46 keys) con
  **fallback `DefaultGlyph`** (tres arcos) para pasos sin glifo.
- Logros: `explorationMap` de extra es mapa cerrado con guard (sin logros
  nuevos, decisión F4).

## Set aprobado (OK del usuario a las 3 preguntas)

7 rutinas nuevas (3 free + 4 premium), biblioteca **agrupada en 4 grupos**
como Respira, y pasos nuevos con **DefaultGlyph hasta aprobar glifos** (cola
D-4, patrón s84: el usuario itera en HTML, se porta literal).

| ID | Nombre | Grupo | min | access | Pasos nuevos |
|---|---|---|---|---|---|
| `move.morning.flow` | Despertar matinal | flujos | 5 | free | Gato-camello |
| `move.wrists` | Muñecas y manos | oficina | 3 | free | Palmas al suelo · Rezo invertido |
| `move.shoulder.circles` | Hombros · círculos | hombros | 4 | free | Círculos de hombro |
| `move.couch.stretch` | Couch stretch | caderas | 5 | premium | Couch stretch |
| `move.spine.waves` | Columna · ondas | hombros | 5 | premium | Gato-camello (compartido) · Onda espinal · Puente torácico · Rodar hacia abajo |
| `move.hips.ground` | Caderas · suelo | caderas | 6 | premium | Rana |
| `move.hamstrings` | Cadena posterior | caderas | 5 | premium | Pliegue adelante · Isquio a una pierna |

**Set final: 14 rutinas, 6 premium (43%).** Grupos: oficina 4 · hombros y
columna 3 · caderas y piernas 5 · flujos 2. Free-first dentro de cada grupo
(decisión s90). Incluye las 3 candidatas net-new de CONTENT (couch stretch,
círculos de hombro, gato-camello). Sin modal de seguridad (no hay apnea en
estiramientos).

## Cambios

- **`app/extra/ExtraModule.jsx`** (103 → 204 ln) — `EXTRA_ROUTINES` pasa de
  array plano a **objeto agrupado** (mismo shape que `BREATHE_ROUTINES`);
  `ExtraLibrary` renderiza grupos con `tR('extra.cat.*')`; `getExtraRoutine`
  adaptado (loop de grupos, misma firma). 7 rutinas nuevas free-first.
- **`app/i18n/strings-content.js`** (280 → 389 ln) — 8 keys de grupos
  (`extra.cat.*`) + ~101 keys EN de las 7 rutinas (name/desc/code +
  sN.name/sN.cue por paso).
- **Bump v0.36.0**: PACE.html título + PACE_VERSION + CACHE_NAME.
- **11 pasos nuevos sin glifo** (renderizan DefaultGlyph): Gato-camello,
  Palmas al suelo, Rezo invertido, Círculos de hombro, Couch stretch, Onda
  espinal, Puente torácico, Rodar hacia abajo, Rana, Pliegue adelante,
  Isquio a una pierna → **se suman a la cola D-4**.
- Sin tocar: gating, MoveSession, glifos existentes, README.

## Verificación

Preview :8765 (nota: hubo que limpiar el SW cache viejo `pace-v0.35.0` —
assets cache-first servían el ExtraModule anterior; en producción el flujo
normal de update del SW lo resuelve solo):

- Biblioteca: **14 tarjetas / 4 grupos** con asides; 6 sellos PREMIUM +
  "Pronto" exactos; minutos en las 8 free; free-first correcto (screenshot).
- Lookup: 7/7 rutinas nuevas resuelven con pasos/min/access correctos;
  estructura agrupada íntegra.
- Sesión "Despertar matinal": empieza en "Paso 1 de 6 — Gato-camello",
  countdown corre, "Siguiente" avanza pasos, **DefaultGlyph renderiza** para
  el paso sin glifo (verificado `EXERCISE_GLYPHS['Gato-camello'] ===
  undefined` + svg presente).
- **EN**: grupos "Office / Shoulders & Spine / Hips & Legs / Flows" y las 14
  tarjetas traducidas (incl. "Wrists & Hands", "Morning Wake-up"). ES
  restaurado tras la prueba.
- **Consola sin errores** en todo el recorrido.

## Build + cierre

- Backup `backups/PACE_standalone_v0.35.0_20260707.html`; cap 20 (rotado
  `v0.28.8_20260512.html`).
- `node build-standalone.js`: **652 KB**, 62 archivos validados.
  `index.html` copia exacta (SHA256 idéntico, `5edfb95e…463ecb`).
- Standalone verificado en preview: v0.36.0, 7/7 rutinas, monta sin errores.

## Decisiones nuevas

1. **Biblioteca Estira agrupada** (4 grupos, mismo shape que Respira). Mueve
   (F6) debería seguir el mismo patrón al crecer.
2. **D-4 crece a 26 pendientes** (15 de s60 + 11 de F5): los pasos nuevos
   usan DefaultGlyph hasta que el usuario apruebe glifos (patrón s84).

## Próxima sesión

**F6 — Mueve** (~12-15 rutinas, ~mitad premium, reclasifica la fuerza;
agrupar como Respira/Estira). P1 de la auditoría sigue disponible para
intercalar.
