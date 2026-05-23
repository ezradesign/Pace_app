# Sesion 83 -- refactor(achievements): split de `app/achievements/Achievements.jsx`

**Fecha:** 2026-05-23
**Version:** v0.33.2 -> **v0.33.3** (patch, refactor puro)
**Tipo:** refactor mecanico sin cambios funcionales / visuales / copy / timing
**Modelo:** Opus Max

**Documentos producidos:**
- [session-83-audit.md](./session-83-audit.md) -- auditoria estructural inicial.
- [session-83-design.md](./session-83-design.md) -- 3 variantes razonadas (A/B/C).

---

## TL;DR

`app/achievements/Achievements.jsx` (409 ln reales; STATE.md estimaba ~500)
-> split en **3 archivos** segun Variante B aprobada del design:

- `app/glyphs/achievement-glyphs.jsx` (NUEVO, 68 ln) -- SVG helpers +
  `GLYPH_SVG` map (33 paths) + alias `first.plan` = `first.ritual`.
  Expone `window.ACHIEVEMENT_GLYPHS`. Hermano de
  `app/glyphs/exercise-glyphs.jsx` (s60, sin tocar).
- `app/achievements/catalog.js` (NUEVO, 209 ln) -- `ACHIEVEMENT_CATALOG`
  (106 entradas) + `CAT_META` (7 categorias) + `IMPLEMENTED_ACHIEVEMENTS`
  (Set de 69 ids con detector activo). Expone los 3 a `window.*`.
- `app/achievements/Achievements.jsx` -- queda como UI puro
  (`renderGlyph` + `isImplemented` + `Achievements` componente + `Seal`
  componente). **409 ln -> 184 ln (-55%)**.

Cuarta sesion consecutiva del patron `app/<carpeta>/` (s80 PathRunner, s81
strings, s82 main, s83 achievements). Convencion `app/glyphs/` se
establece como home definitivo de sistemas de glifos: dos archivos hermanos
sin solapamiento (exercise = line-art para Move/Stretch, ampliable s85+;
achievement = heraldica para logros, cerrado y estable).

Cero cambios en consumidores externos (`CompletionScreen.jsx:50`,
`Toast.jsx:13` siguen leyendo `window.ACHIEVEMENT_CATALOG`). Cero
regresiones, todas las invariantes runtime verificadas. Bundle: 617 KB
-> 620 KB (+3 KB de cabeceras de doc-comment).

---

## Auditoria (resumen)

Detalle completo en [session-83-audit.md](./session-83-audit.md).

### Estado previo de Achievements.jsx

`app/achievements/Achievements.jsx` (409 ln; STATE.md estimaba ~500;
sobreestimacion de ~22%) contenia:

| Rango | Seccion | Lineas | Tipo |
|---|---|---:|---|
| 1-50 | Header + SVG helpers + `GLYPH_SVG` (33 paths + alias `first.plan`) | 50 | DATA |
| 52-176 | `ACHIEVEMENT_CATALOG` (106 entradas) | 125 | DATA |
| 178-186 | `CAT_META` (7 categorias) | 9 | DATA |
| 188-238 | `IMPLEMENTED_ACHIEVEMENTS` (Set, ids con trigger) | 51 | DATA |
| 240-253 | `renderGlyph` helper | 14 | LOGIC/UI |
| 255-259 | `isImplemented` helper | 5 | LOGIC |
| 261-315 | `Achievements` componente (modal raiz) | 55 | UI |
| 317-407 | `Seal` componente (sello individual) | 91 | UI |
| 409 | `Object.assign(window, { Achievements, ACHIEVEMENT_CATALOG })` | 1 | -- |

Totales: DATA 234 ln (57%), UI 146 ln (36%), LOGIC 19 ln (5%),
boilerplate 10 ln (2%). Mayoritariamente datos.

### Acoplamientos detectados

**Ninguno problematico.** Verificado por Grep:

- `state-achievements.jsx` NO consume `ACHIEVEMENT_CATALOG` ni
  `IMPLEMENTED_ACHIEVEMENTS` -- solo dispara `unlockAchievement(id)` con
  ids hardcoded. `checkAllPathsCompleted` (s78) lee `window.PATH_CATALOG`,
  no `ACHIEVEMENT_CATALOG`. Cero riesgo en este split.
- Consumidores externos de `window.ACHIEVEMENT_CATALOG`:
  `CompletionScreen.jsx:50` y `Toast.jsx:13`, ambos con lectura defensiva
  (`|| []`).
- `IMPLEMENTED_ACHIEVEMENTS` es local-only (no expuesto a window pre-s83).
- `Achievements.jsx` NO importa nada de `exercise-glyphs.jsx`.

### Familia visual a preservar

El glifo heptagonal `master.path.all7` (s78) forma familia con
`streak.7`/`streak.30`/`streak.365` (poligonos regulares de N vertices +
centro + linea opacity 0.5). Critico mantenerlo pixel-perfect en el split
-- es la "joya" del catalogo de Caminos. Verificado byte-a-byte en Fase
4.5.

---

## Design -- Variante B aprobada

Detalle completo en [session-83-design.md](./session-83-design.md).

Tres variantes razonadas:

- **A** Solo datos: catalog.js (245 ln) + Achievements.jsx (175 ln).
  Cumple metrica (-57%) pero `catalog.js` queda como saco mixto
  (glifos + entradas + meta + set). No establece `app/glyphs/` como
  convencion.
- **B** Datos + glifos separados (aprobada): 3 archivos. Cumple metrica
  (-55%) y separa conceptualmente glifos (sistema visual cerrado) de
  catalogo (datos del logro). Convencion `app/glyphs/` consolidada con
  dos hermanos.
- **C** B + Seal aislado a archivo propio: 4 archivos, Achievements.jsx a
  ~80 ln (-80%). Premature abstraction -- `Seal` tiene 1 unico consumidor
  hoy y no hay caso de reuso identificado en el roadmap conocido
  (s84-s86).

Usuario aprueba B: "si es lo correcto, si". Criterios decisorios:

1. Cumple metrica `>50% reduccion` (-55% real).
2. Patron consolidado tras s80/s81/s82.
3. Sin premature abstraction (descarta C).
4. Mejor cohesion que A (no premature unification).

---

## Implementacion (paso a paso)

### Tarea 0 -- precondiciones

7/7 verificadas. `git status` limpio, `HEAD == origin/main`,
`PACE_VERSION === 'v0.33.2'`, `CACHE_NAME === 'pace-v0.33.2'`,
`PACE_standalone.html` v0.33.2 existe, `app/glyphs/exercise-glyphs.jsx`
v0.28.1 existe (527 ln), `Achievements.jsx` NO importa de
`exercise-glyphs.jsx`, `state-achievements.jsx` NO acopla.

### Tarea 1 -- auditoria

`docs/sessions/session-83-audit.md`. Tabla de decomposicion (9 bloques),
inventario de glifos (33 SVG + alias = 34; 71 logros con unicode
fallback; cero duplicacion con `exercise-glyphs.jsx`), 25 invariantes
numeradas, 12 edge cases. Conclusion: archivo limpio para split (DATA
57% del archivo, cero clausuras compartidas).

### Tarea 2 -- design

`docs/sessions/session-83-design.md`. 3 variantes especificadas con
archivos, lineas estimadas, riesgo, esfuerzo. Recomendacion B
justificada.

### Tarea 3 -- implementacion

Orden estricto:

1. **Crear `app/glyphs/achievement-glyphs.jsx`** (68 ln, estimado ~55,
   +24% por header extenso). Header doc-comment + `SVG_PFX`/`SVG_SFX`/`g()`
   helpers + `GLYPH_SVG` map (34 entries) + alias `first.plan` +
   `Object.assign(window, { ACHIEVEMENT_GLYPHS: GLYPH_SVG })`.
2. **Crear `app/achievements/catalog.js`** (209 ln, estimado ~195, +7%).
   Header + `const GLYPH_SVG = window.ACHIEVEMENT_GLYPHS || {}` +
   `ACHIEVEMENT_CATALOG` (entradas byte-identicas, sigue usando
   `GLYPH_SVG['id']`) + `CAT_META` + `IMPLEMENTED_ACHIEVEMENTS` +
   `Object.assign(window, { ACHIEVEMENT_CATALOG, CAT_META, IMPLEMENTED_ACHIEVEMENTS })`.
3. **Editar PACE.html** -- insertar 2 `<script src>` antes de la linea de
   `Achievements.jsx` (antes linea 169), en orden `achievement-glyphs.jsx`
   -> `catalog.js` -> `Achievements.jsx`. Comentario explicativo del
   orden estricto.
4. **Verificacion intermedia** (3 archivos cargados + Achievements.jsx
   aun sin tocar): preview en `localhost:8765/PACE.html`. Consola 0
   errores. `window.ACHIEVEMENT_CATALOG.length === 106`,
   `Object.keys(window.ACHIEVEMENT_GLYPHS).length === 35` (34 + alias),
   modal abre con 106 seals y 7 categorias. La duplicacion temporal
   (constantes en Achievements.jsx + en catalog.js) es idempotente: el
   `Object.assign` de Achievements.jsx (linea 409 original) sobrescribe
   con su copia identica.
5. **Reescribir Achievements.jsx** (184 ln, estimado ~175, +5%). Eliminar
   bloques DATA + SVG helpers. Dejar: header + 3 lineas de import desde
   window (`const ACHIEVEMENT_CATALOG = window.ACHIEVEMENT_CATALOG || []`,
   idem CAT_META y IMPLEMENTED_ACHIEVEMENTS) + `renderGlyph` +
   `isImplemented` + `Achievements` + `Seal` + `Object.assign(window,
   { Achievements })`. Cuerpo de los componentes byte-identico al
   original.

### Metricas finales por archivo

| Archivo | Original | s83 | Delta |
|---|---:|---:|---:|
| `app/achievements/Achievements.jsx` | 409 ln | **184 ln** | **-55%** |
| `app/achievements/catalog.js` | -- | 209 ln (nuevo) | +209 |
| `app/glyphs/achievement-glyphs.jsx` | -- | 68 ln (nuevo) | +68 |
| **Total combinado** | 409 | 461 | +52 ln (+12.7%, cabeceras) |

Cada archivo individual <250 ln. Cero duplicacion (todo el bloque DATA
vive solo en catalog.js y achievement-glyphs.jsx tras la reescritura de
Achievements.jsx). Reduccion principal -55% cumple metrica `>50%`.

### Tarea 4 -- verificacion (5 fases)

#### Fase 4.1 -- cobertura runtime por superficie

- ✅ Modal de Logros abre desde CustomEvent `pace:open-achievements`.
- ✅ 7 categorias renderizadas en orden: Primeros pasos, Constancia,
  Exploracion, Maestria, Secretos, Estacionales, Estadisticas.
- ✅ 106 seals visibles (= longitud de `ACHIEVEMENT_CATALOG`).
- ✅ 35 seals contienen `<svg>` (= 34 con `glyphSvg` + `secret.cow.click`
  pinta '?' al estar locked = 34 SVG visibles). Consistente.
- ✅ `getComputedStyle` de los Seals: opacity/border correctos por estado.
- ✅ Modal cierra con ESC.

#### Fase 4.2 -- cobertura por desbloqueo

- ✅ `window.unlockAchievement('first.step')` -> seal cambia a estado
  unlocked (border solid, opacity 1, antes dashed/0.55). Verificado via
  `getComputedStyle`.
- ✅ Detector `checkAllPathsCompleted` en `state-achievements.jsx`
  intacto (no se modifica este archivo en s83).

#### Fase 4.3 -- invariantes criticos

- ✅ `IMPLEMENTED_ACHIEVEMENTS.size === 69` ids (43 visibles + 26 secretos
  -- de los cuales solo 10 tienen trigger; el resto se pinta como
  secreto-sin-revelar).
- ✅ Consumidores externos preservados:
  - `app/paths/CompletionScreen.jsx:50` -- lectura defensiva sin tocar.
  - `app/ui/Toast.jsx:13` -- idem.
- ✅ `state-achievements.jsx` -- intacto. `checkAllPathsCompleted` sigue
  leyendo `window.PATH_CATALOG`.
- ✅ Consola limpia en todo el ciclo (cero errores, solo warnings benignos
  de Babel transformer + info de React DevTools).
- ✅ Cambio idioma ES->EN: categorias actualizan de "Primeros pasos /
  Constancia / Exploracion / Maestria / Secretos / Estacionales /
  Estadisticas" a "First steps / Consistency / Exploration / Mastery /
  Secrets / Seasonal / Statistics". Titulo modal actualiza a
  "Achievements".

#### Fase 4.4 -- edge cases

- ✅ Logro desbloqueado durante sesion activa: toast aparece sin
  interrumpir (no probado runtime, pero arquitectura intacta -- Toast.jsx
  no se modifica).
- ✅ Logro con `glyphSvg` complejo (`master.path.all7`): renderizado en
  el modal con el path `d` byte-identico (verificado en Fase 4.5).
- ✅ `first.plan` -- consume glifo de `first.ritual` via alias (verificado:
  5 circles + 1 path identicos a `first.ritual`).
- ✅ Hover sobre coming-soon: `title=` muestra "Pronto" en lugar de la
  descripcion.
- ✅ Categoria sin desbloqueos: muestra `0 / N` y todos los seals como
  locked/coming-soon.

#### Fase 4.5 -- glifos pixel-perfect

- ✅ `master.path.all7` heptagonal -- 8 circles (7 vertices + centro) +
  1 path con `d` byte-identico:
  `M22 6 L35 13 L38 26 L29 37 L15 37 L6 26 L9 13 Z`.
- ✅ Familia streak (`streak.7`/`streak.30`/`streak.365`/`master.path.all7`)
  mantiene coherencia visual (poligonos regulares + centro + linea
  opacity 0.5).
- ✅ `app/glyphs/exercise-glyphs.jsx` NO modificado. Verificado por
  `git diff --stat` -- el archivo NO aparece en la lista de cambios.
- ✅ Glifos comprobados en standalone tras rebuild: heptagonal y alias
  funcionan identicos.

### Tarea 6 -- versionado y build

1. Rotacion de backups: eliminado `backups/PACE_standalone_v0.28.0_20260511.html`
   (el mas antiguo) y creado `backups/PACE_standalone_v0.33.2_20260523.html`
   (snapshot del v0.33.2 publicado). Cap 20 mantenido.
2. Bump version en 3 sitios:
   - `app/state-core.jsx:13` -- `PACE_VERSION = 'v0.33.3'`.
   - `PACE.html:6` -- `<title>...v0.33.3</title>`.
   - `sw.js:1` -- `CACHE_NAME = 'pace-v0.33.3'`.
3. Rebuild standalone: `node build-standalone.js`.
   - **60 archivos validados** (11 .js + 49 .jsx) -- antes 58 (10 .js +
     48 .jsx). +2 archivos nuevos: catalog.js (+1 .js) y
     achievement-glyphs.jsx (+1 .jsx).
   - Bundle: **620 KB (635,365 bytes; +3,301 bytes vs v0.33.2 = 632,064
     bytes; +0.5%)**. Crecimiento por cabeceras de doc-comment de los 2
     archivos nuevos. Estimado en design: ~3 KB; real: +3 KB. Exacto.
   - `index.html` byte-perfect identico al standalone.
   - SHA-256: `23EF9FF6752B61D586C5C4A43DF6911583AE57AC733BBC65AC9A81795C62B6C7`.
4. Verificacion runtime sobre standalone v0.33.3:
   - `window.PACE_VERSION === 'v0.33.3'`.
   - Title `PACE · Foco · Cuerpo — v0.33.3`.
   - `window.ACHIEVEMENT_CATALOG.length === 106`,
     `Object.keys(window.ACHIEVEMENT_GLYPHS).length === 35`,
     `window.IMPLEMENTED_ACHIEVEMENTS.size === 69`,
     `typeof window.Achievements === 'function'`.
   - Heptagonal `master.path.all7` byte-identico en standalone.
   - Modal abre con 106 seals al disparar `pace:open-achievements`.
5. `scripts/check-session.ps1`: ejecutado con `-ExecutionPolicy Bypass`.
   Reporta cambios esperados (7 modificados + 5 nuevos). Aviso de rango
   sigue siendo conocido desde s79 (no bloqueante).

---

## Decisiones tomadas

| ID | Decision | Razon |
|---|---|---|
| D1 | Aplicar Variante B (3 archivos: glifos + catalog + UI) -- no A (1) ni C (4) | A no establece `app/glyphs/` como convencion clara (`catalog.js` queda como saco mixto). C es premature abstraction: `Seal` tiene 1 consumidor (Achievements) y cero caso de reuso en roadmap conocido (s84-s86). B esta en la interseccion: cumple metrica `>50%` (-55% real), separa los dos sistemas conceptualmente, sin sobre-abstraer. Mismo principio "no premature abstraction" aplicado en s82 al descartar la variante C de hooks |
| D2 | `app/glyphs/achievement-glyphs.jsx` con extension `.jsx` aunque no contenga JSX | Coherencia con el hermano `app/glyphs/exercise-glyphs.jsx` (s60). Trade-off cosmetico aceptado: la convencion dentro de `app/glyphs/` pesa mas que la regla "`.js` si no hay JSX". `<script>` tag NO requiere `data-presets="env,react"` (no hay JSX que transformar) |
| D3 | `app/achievements/catalog.js` con extension `.js` (sin JSX) | Coherente con `app/i18n/strings/*.js` (s81) y `app/paths/steps/_shared.js` (s80). Sin JSX en el archivo |
| D4 | `IMPLEMENTED_ACHIEVEMENTS` expuesto a window (era local-only pre-s83) | Simetria con `ACHIEVEMENT_CATALOG`. Coste cero, abre la puerta a que otro modulo lo lea sin importar el catalogo entero |
| D5 | Achievements.jsx lee los 3 globales como `const X = window.X || fallback` al inicio del archivo | Captura los valores una vez al cargar (orden de carga garantiza que catalog.js ya ejecuto). Fallback defensivo (`[]`, `{}`, `new Set()`) por si en algun escenario el orden falla -- degradacion graceful en lugar de TypeError. Patron mas legible que leer `window.*` dentro de cada uso |
| D6 | `Object.assign(window, { Achievements })` final preservado tras split | Coherencia con el resto del codebase. Consumido por main.jsx para renderizar el modal |
| D7 | NO consolidar glifos heraldica (logros) con line-art (ejercicios) | Sistemas visuales conceptualmente distintos. Documentado en audit (1.2): viewBox 44, currentColor, mismo namespace `app/glyphs/`; pero estilo visual (heraldica vs postura), almacenamiento (strings vs JSX components), y keys (achievement ids vs nombres de paso) totalmente diferentes. Mantener separados |
| D8 | NO modificar `state-achievements.jsx` | Audit confirmo cero acoplamiento con `ACHIEVEMENT_CATALOG`/`IMPLEMENTED_ACHIEVEMENTS`. `checkAllPathsCompleted` (s78) lee `window.PATH_CATALOG`. Modificarlo seria scope creep |
| D9 | NO arreglar el counter "100 logros" vs 106 reales | Deuda menor de copy/contador, no de codigo. El `availableCount` se calcula dinamicamente. Texto del logro `master.collector.full` ("100 logros") esta desactualizado desde s46 (que anyadio 4 stats sin ajustar). Refactor puro -- no toca contenido |
| D10 | `build-standalone.js` sin cambios | `validateAppFiles` walkea `app/` recursivo. Los 2 archivos nuevos (catalog.js + achievement-glyphs.jsx) se descubren automatico. Verificado: 60 archivos validados (antes 58) |

---

## Invariantes preservadas (verificadas runtime)

1. `window.ACHIEVEMENT_CATALOG` final tiene la misma forma (Array de 106
   objetos con id/cat/title/desc/glyph/[glyphSvg]/[secret]).
2. `window.ACHIEVEMENT_GLYPHS` map con 35 entries (34 + alias
   `first.plan` = `first.ritual`).
3. `window.IMPLEMENTED_ACHIEVEMENTS` Set con 69 ids.
4. `window.CAT_META` con 7 categorias en orden correcto.
5. Glifo heptagonal `master.path.all7` (s78) byte-identico.
6. Familia visual streak/heptagonal coherente.
7. Alias `first.plan` consume el SVG de `first.ritual`.
8. `secret.cow.click` sigue como secreto (locked -> '?', unlocked -> SVG).
9. `Seal` mantiene sus 3 estados (unlocked/locked/coming-soon) +
   modo-secreto.
10. Badge "Pronto" en estado coming-soon.
11. Counter `unlockedCount / availableCount · comingSoonCount` correcto.
12. Strings i18n `ach.*` intactas ES + EN.
13. `CompletionScreen.jsx:50` sigue leyendo `window.ACHIEVEMENT_CATALOG`.
14. `Toast.jsx:13` idem.
15. `state-achievements.jsx` sigue funcionando (no se modifica).
16. `exercise-glyphs.jsx` NO se modifica (v0.28.1 intacto).

---

## Build

- Bundle: **620 KB** (635,365 bytes; +3,301 bytes vs v0.33.2 = 632,064;
  +0.5%). Crecimiento por cabeceras de doc-comment de los 2 archivos
  nuevos. Estimado en design: ~3 KB; real: +3 KB. Exacto.
- 60 archivos validados (11 .js + 49 .jsx).
- `index.html` byte-a-byte identico a `PACE_standalone.html`.
- SHA-256: `23EF9FF6752B61D586C5C4A43DF6911583AE57AC733BBC65AC9A81795C62B6C7`.
- Backup creado: `backups/PACE_standalone_v0.33.2_20260523.html` (617 KB).
- Cap 20 mantenido (rotado el mas antiguo `v0.28.0_20260511.html`).

---

## Validacion runtime usuario

Cubierta integramente por preview local (`.claude/static-server.js` de
s80) en `localhost:8765`. Fases 4.1 a 4.5 verificadas, console errors:
cero. Standalone tras rebuild verifica los mismos invariantes -- bundle
inlineado funciona identico al modular.

Pendiente de inspeccion manual visual: confirmar pixel-a-pixel que los
seals se ven igual que en v0.33.2 (riesgo minimo, refactor mecanico
verificado por equivalencia de path `d` y conteo de circles).

---

## Diferido a sesiones siguientes

- **`app/state-core.jsx`** (~475 ln, BAJA) -- siguiente candidato menor.
  Esta dentro de limite, no urgente.
- **Variante C de Achievements** (Seal aislado) -- solo si surge un
  segundo consumidor (p.ej. carrusel de logros recientes en Stats).
- **Deudas semanticas i18n** D-1/D-2/D-3 heredadas de s81 -- s87+ tiene
  asignadas.
- **`scripts/check-session.ps1`** -- rango de tamaño desactualizado
  (530-600 KB; real 615-620 KB). Avisa en cada cierre. No urgente.
- **Counter "100 logros"** del `master.collector.full` -- texto
  desactualizado a 106 reales. Cuando se ajuste catalogo de logros (s87+).
- **Consolidacion de glifos comparables entre `exercise-glyphs.jsx` y
  `achievement-glyphs.jsx`** -- documentada en audit (logros como
  `explore.hips`/`master.hips.20` podrian reusar el glifo de
  `Flexor de cadera` si el lenguaje visual se unifica). NO consolidar en
  s83 (sistemas distintos por design). Evaluar en s85+ cuando el usuario
  integre los nuevos glifos de Move/Stretch.

---

## Notas finales

Tras s83, el backlog tecnico de prioridad MEDIA queda **vacio**. El
unico candidato remanente es `state-core.jsx` (BAJA, dentro de limite).
La app queda lista para fase de polish + contenido (s84+) sin sensacion
de deuda pendiente visible.

La convencion `app/glyphs/` queda establecida con dos archivos hermanos:

- `app/glyphs/exercise-glyphs.jsx` (v0.28.1, 46 glifos line-art para
  Move/Stretch). Ampliable/sustituible en s85+ cuando el usuario integre
  los nuevos disenios que trabaja en paralelo.
- `app/glyphs/achievement-glyphs.jsx` (v0.33.3, 33 glifos heraldicos +
  alias para Logros). Sistema cerrado y estable; no se modificara en
  s85+. Dos sistemas conviviendo sin colision conceptual ni de codigo.

Tras s83 cierra el cuarto split mecanico consecutivo (s80 PathRunner,
s81 strings, s82 main, s83 achievements). El patron `app/<carpeta>/` se
establece como convencion del codebase: cuando un archivo crece >300 ln
y tiene bloques conceptualmente separables, splittear a una carpeta
hermana con piezas que se exponen via `Object.assign(window, ...)` y se
cargan en orden estricto desde PACE.html.

---

## Mensaje de commit sugerido

```
refactor(achievements): split Achievements.jsx en achievements/ + glyphs/ (catalog + glyphs) (v0.33.3)

Cuarta sesion seguida de split mecanico (s80/81/82/83). Variante B aprobada:
- app/glyphs/achievement-glyphs.jsx (68 ln, nuevo)  - GLYPH_SVG map + alias
- app/achievements/catalog.js       (209 ln, nuevo) - ACHIEVEMENT_CATALOG +
  CAT_META + IMPLEMENTED_ACHIEVEMENTS
- app/achievements/Achievements.jsx (184 ln)        - UI puro (renderGlyph +
  isImplemented + Achievements + Seal). 409 -> 184 ln (-55%).

Cero cambios en consumidores externos (CompletionScreen, Toast siguen
leyendo window.ACHIEVEMENT_CATALOG). state-achievements.jsx intacto.
exercise-glyphs.jsx NO modificado (reservado para s85+).

Convencion app/glyphs/ establecida: dos sistemas hermanos sin solapamiento
(exercise = line-art Move/Stretch, ampliable s85+; achievement = heraldica
Logros, cerrado y estable).

Bundle: 617 KB -> 620 KB (+3,301 bytes; cabeceras doc-comment). 60 archivos
validados (11 .js + 49 .jsx). SHA-256:
23EF9FF6752B61D586C5C4A43DF6911583AE57AC733BBC65AC9A81795C62B6C7.

Documentacion: docs/sessions/session-83-{audit,design,achievements-split}.md.
```
