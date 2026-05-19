# Sesion 81 -- refactor(i18n): split de app/i18n/strings.js

**Fecha:** 2026-05-19
**Version:** v0.33.0 -> **v0.33.1** (patch, refactor puro)
**Tipo:** refactor mecanico sin cambios funcionales/visuales/copy
**Modelo:** Opus Max

**Documentos producidos:**
- [session-81-audit.md](./session-81-audit.md) -- auditoria inicial.
- [session-81-design.md](./session-81-design.md) -- 3 variantes razonadas.

---

## TL;DR

`app/i18n/strings.js` (791 ln, 664 keys) -> split en `app/i18n/strings/`
con 6 archivos hermanos (`_bootstrap.js` + `ui.js` + `sessions.js` +
`paths.js` + `stats.js` + `achievements.js`). Variante B aprobada del
design. Cero cambios en useT.jsx, en strings-content.js, en consumidores
externos. Bundle: 610 KB -> 614 KB (+4 KB de cabeceras de doc-comment).
332 ES + 545 EN efectivas en runtime (idem a v0.33.0).

---

## Cambio de scope (importante para entender la sesion)

El prompt original de s81 pedia **transiciones contemplativas entre
Steps** (IntroCard, StepIntro, OutroCard + halo SenderoBar). Tras la
auditoria de precondiciones detecto que toda esa infraestructura ya
existia completa desde **s77** (`PathTransitions.jsx` + tokens
`--path-*-ms` + i18n `path.runner.transition.continue` + phase machine
`intro/step/transition/outro` en `PathRunner.jsx`).

El usuario reoriento la sesion al siguiente candidato del backlog que
el diario s80 dejo en cola: **split de `app/i18n/strings.js`** (deuda
ALTA, 776 ln segun STATE.md, 791 ln reales).

Decisiones de scope tomadas:
- Variante B del design aprobada ("la mas profesional sin sobreingenieria").
- Refactor puro mecanico: cero consolidacion semantica de las deudas
  detectadas en el audit.
- Documentos pre-implementacion (audit + design) se mantienen, dando
  trazabilidad al cambio de scope.

---

## Auditoria (resumen)

Detalle completo en [session-81-audit.md](./session-81-audit.md).

### Estado previo del subsistema i18n

```
app/i18n/
├── strings.js          791 ln  -- catalogo principal ES+EN. 664 keys (332+332).
├── strings-content.js  254 ln  -- patch solo EN para contenido (224 keys).
└── useT.jsx             56 ln  -- hook + detectInitialLang().
```

`strings.js` definia `window.PACE_STRINGS = { es: {...}, en: {...} }` por
asignacion directa. `strings-content.js` lo patchaba con
`Object.assign(PACE_STRINGS.en, {...})`. `useT.jsx` consume con fallback
lang -> EN -> raw key.

### Conteo por dominio (en strings.js)

31 bloques de comentario por idioma. Familias semanticas:

| Familia | Keys ES | Bloques |
|---|---:|---|
| Shell UI (welcome + support + sidebar + topbar + activity + settings + tweaks + break + welcome lang toggle) | 130 | 9 |
| Sessions (session + common + lib + focus + breathe + move + extra + hydrate + safety) | 79 | 12 |
| Paths (path.* + paths.*) | 47 | 4 |
| Stats (stats.* incl. caminos) | 42 | 5 |
| Achievements (ach.*) | 16 | 1 |

Total ES = 327 keys (counter Grep `^    '[a-z]+\.[a-z]` = 332,
discrepancia +5 por separadores que el regex cuenta).

### Deudas tecnicas detectadas (NO arregladas en s81)

| ID | Deuda | Por que no se arregla |
|---|---|---|
| D-1 | `strings-content.js` override silencioso 3 keys de `breathe.phase.*` con valores distintos (inhala.mas "Inhale again" vs "Inhale more"; inhala.oceanica "Oceanic inhale" vs "Ocean inhale"; exhala.oceanica "Oceanic exhale" vs "Ocean exhale") | Debate de copy, scope = split mecanico puro |
| D-2 | Duplicidad "Hecho hoy": `path.card.done` + `paths.library.doneToday` | Refactor de UX, fuera de scope |
| D-3 | Namespaces inconsistentes `path.*` (singular) vs `paths.*` (plural) | Existe desde s53, requiere migracion de consumidores |
| D-4 | Bloques minusculos (<=3 keys cada uno: Libraries shared, Welcome lang toggle, Breathe session, Breathe Library, Move Library, Extra Library) | Se agrupan con dominio padre en el split |

### Invariantes preservadas

13 invariantes en el audit. Las 5 mas criticas:
1. `window.PACE_STRINGS` final con misma forma `{ es: {...}, en: {...} }`.
2. **Conteo final de keys identico**: 332 ES + 332 EN en el split, mas
   override de strings-content.js para 11 keys de breathe.phase.*
   (3 divergentes + 8 redundantes).
3. **Valor efectivo de cada key identico**. Override D-1 PRESERVADO --
   las 3 keys siguen ganando con el valor de strings-content.js.
4. `detectInitialLang()` sigue en useT.jsx (no se mueve).
5. **Cero cambios fuera de `app/i18n/` + `PACE.html` + bundler-implicito**.

---

## Variante aprobada (B -- Pragmatica)

Detalle completo en [session-81-design.md](./session-81-design.md).

3 variantes propuestas:
- **A** -- Conservadora: 3 archivos nuevos, strings.js reducido a ~330 ln.
- **B** -- Pragmatica (aprobada): 6 archivos nuevos en `app/i18n/strings/`,
  bootstrap explicito, 5 dominios coherentes.
- **C** -- Maximalista: 14 archivos (1 por dominio). Overkill para 2 idiomas.

El usuario delego la decision final al agente: "LA QUE TU RECOMIENDES Y
SEA MAS PROFESIONAL". Eleccion: **B**. Razones:
- Patron industry-standard (bootstrap + dominios).
- Carpeta `strings/` agrupa visualmente (coherente con `app/paths/steps/` de s80).
- 5 dominios cumplen regla `<500 ln` de CLAUDE.md con holgura (max 310 ln).
- A introduce asimetria (strings.js raiz + 3 patches hijos).
- C es overkill para un proyecto con 2 idiomas hoy.

---

## Implementacion

### Archivos nuevos (6)

```
app/i18n/strings/
├── _bootstrap.js      (15 ln; window.PACE_STRINGS = { es:{}, en:{} } vacio)
├── ui.js              (315 ln; 134 ES + 134 EN -- shell completo)
├── sessions.js        (227 ln; 93 ES + 93 EN -- actividades + safety)
├── paths.js           (122 ln; 47 ES + 47 EN -- todo path/paths)
├── stats.js           (108 ln; 42 ES + 42 EN -- panel Ritmo)
└── achievements.js    (40 ln; 16 ES + 16 EN -- ach.*)
```

`ui.js` agrupa: welcome (17) + welcome lang toggle (2) + support (18) +
break (13) + sidebar (21) + topbar (8) + settings (6) + activity (9) +
tweaks (36) -- todos los dominios de "chrome UI".

`sessions.js` agrupa: session (15) + common (6) + lib shared (2) +
breathe phases (11) + breathe sesion (2) + lib breathe (2) + lib move (3) +
lib extra (3) + focus (14) + move pasos (7) + move sesion add (5) +
hydrate (8) + breathe safety modal (14) -- todas las actividades vivas
+ el modal de seguridad.

### Archivos modificados (3)

- `PACE.html` -- bloque de carga i18n actualizado:
  - Antes: 3 `<script src>` (strings.js + strings-content.js + useT.jsx).
  - Despues: 8 `<script src>` (_bootstrap + 5 dominios + strings-content.js
    + useT.jsx).
  - Comentario explicativo del split anyadido al bloque.
- `app/state-core.jsx` -- `PACE_VERSION = 'v0.33.1'`.
- `sw.js` -- `CACHE_NAME = 'pace-v0.33.1'`.

### Archivos eliminados (1)

- `app/i18n/strings.js` -- borrado tras verificar que las 664 keys quedan
  cubiertas por los 5 archivos del split.

### Archivos intactos (2 dentro de i18n/, decenas fuera)

- `app/i18n/strings-content.js` -- intacto. Sigue cargando despues del
  split (preserva override D-1).
- `app/i18n/useT.jsx` -- intacto. Contrato publico sin cambios.

### Cabecera tipica de un archivo del split

```js
/* PACE - strings i18n - <dominio> (sesion 81 / v0.33.1)
   Extraido de strings.js en split por dominio.
   Patches window.PACE_STRINGS.{es,en} con keys de:
     - <namespace 1> (...)
     - <namespace 2> (...)
   Carga DESPUES de _bootstrap.js y ANTES de useT.jsx.
*/

Object.assign(window.PACE_STRINGS.es, { /* ... */ });
Object.assign(window.PACE_STRINGS.en, { /* ... */ });
```

---

## Verificacion (Tarea 4)

### Verificacion estatica (parser TS real)

`node build-standalone.js` -> **55 archivos validados** (9 .js +
46 .jsx). Antes: 50. Diferencia: +6 archivos nuevos en `strings/` - 1
eliminado (strings.js). Cuadra: 50 + 6 - 1 = 55. ✓

### Conteo de keys post-split

```text
ui.js          268 lns con key  (134 ES + 134 EN)
sessions.js    186 lns con key  ( 93 ES +  93 EN)
paths.js        94 lns con key  ( 47 ES +  47 EN)
stats.js        84 lns con key  ( 42 ES +  42 EN)
achievements.js 32 lns con key  ( 16 ES +  16 EN)
-----------------------------
TOTAL          664              (332 ES + 332 EN)
```

**Coincide exacto** con las 664 keys del strings.js original (Grep
`^    '[a-z]+\.[a-z]`). Cero perdida. ✓

### Verificacion runtime (preview local localhost:8765)

`window.PACE_STRINGS` tras carga completa:

```js
{ esTotal: 332, enTotal: 545, missingKeys: [] }
```

- 332 ES (del split, sin strings-content que solo patcha EN).
- 545 EN = 332 (split) + 213 (unicas de strings-content tras 11 overrides).
- 19 keys sample de los 5 dominios (ES y EN) responden con valor correcto.

Override D-1 verificado en runtime:
- `en.breathe.phase.inhala.mas` = "Inhale again" ✓ (no "Inhale more").
- `en.breathe.phase.inhala.oceanica` = "Oceanic inhale" ✓ (no "Ocean inhale").

Consola: 0 errores tras reload.

Snapshot a11y del home con un Camino activo (Hierbabuena +
PathHydrateStep): textos correctos en TopBar, FocusTimer (FOCO,
Concentracion profunda, Comenzar, Reiniciar, MIN, OTRO, CICLO),
ActivityBar (Respira/Estira/Mueve/Hidratate + subs), Sidebar (Abrir
panel), overlay Camino (Hierbabuena, VASOS HOY, Si te apetece suma un
vaso., Saltar, Beber, Salir del camino). Las 5 cajas del split
funcionan correctamente -- si una fallara, habria texto en bruto
visible en la UI.

---

## Decisiones tomadas

| ID | Decision | Razon |
|---|---|---|
| D1 | Variante B aprobada -- no A ni C | Equilibrio profesional: 5 dominios coherentes, bootstrap explicito, carpeta dedicada. A introducia asimetria; C era overkill para 2 idiomas |
| D2 | Carpeta `app/i18n/strings/` -- no flat con prefijo `strings-*.js` | Agrupa visualmente. Patron coherente con `app/paths/steps/` (s80). Mantenimiento mas claro |
| D3 | Bootstrap explicito `_bootstrap.js` vs "primer archivo crea el objeto" | Robusto contra errores de parse: si un dominio falla, los demas siguen escribiendo sobre un objeto valido (vacio) en vez de explotar |
| D4 | `strings-content.js` intacto, sigue cargando al final | Su rol (patch EN solo de contenido de rutinas) es ortogonal al split por dominio. Mover/renombrar abria debates innecesarios |
| D5 | ES y EN en el mismo archivo (no `welcome-es.js` + `welcome-en.js`) | Siempre se actualizan en paralelo. Separar por idioma duplica archivos sin beneficio |
| D6 | NO consolidar D-1 a D-4 en s81 | Scope = split mecanico puro. Cualquier consolidacion abriria refactor de UX/copy fuera del prompt |
| D7 | Cambio de scope documentado (transiciones existian desde s77 -> strings split) | Tarea 0 falla en precondicion 7 (`PathTransitions.jsx` ya existe). Reporto al usuario, ofrece 4 opciones, elige "Split strings.js (ALTA deuda)" |
| D8 | `build-standalone.js` no requiere cambios | `validateAppFiles` walkea `app/` recursivo. Los 6 archivos nuevos se descubren automatico (+ el eliminado desaparece) |

---

## Build

- Pristino v0.33.0 restaurado desde HEAD antes del backup (`git checkout
  HEAD -- PACE_standalone.html index.html`). 624,539 bytes -- match exacto
  con el publicado en s80.
- Backup: `backups/PACE_standalone_v0.33.0_20260519.html`. Cap 20
  mantenido (el mas antiguo `v0.27.5_20260511.html` ya no existia en el
  filesystem -- discrepancia con STATE.md, sin impacto).
- Bump aplicado:
  - `app/state-core.jsx`: `PACE_VERSION = 'v0.33.1'`.
  - `PACE.html`: `<title>` -> `v0.33.1`.
  - `sw.js`: `CACHE_NAME = 'pace-v0.33.1'`.
- `node build-standalone.js`: OK. 55 archivos validados, 2 scripts inline
  validados. Bundle generado limpio.
- Bundle: **614 KB (628,926 bytes)**. +4,387 bytes vs v0.33.0 = 624,539
  (+0.7%). Crecimiento por cabeceras de doc-comment de los 6 archivos
  nuevos (~6-15 ln cada uno) + Object.assign wrappers (~3 ln × 2
  idiomas × 5 dominios). Estimado en design: +2-3 KB; real: +4 KB.
  Discrepancia atribuible a cabeceras mas extensas de lo previsto.
- SHA-256: `3b9c49c0736e237dfffd37067b88793af501b0ce820221d0cd61934575a367ae`.
- `index.html` byte-a-byte identico a `PACE_standalone.html`.

`check-session.ps1`: no ejecutado en esta sesion (avisos esperables
documentados en s79/s80 -- rango de tamaño desactualizado, sin
impacto).

---

## Archivos modificados / nuevos / eliminados

### Nuevos

- `app/i18n/strings/_bootstrap.js` (15 ln)
- `app/i18n/strings/ui.js` (315 ln)
- `app/i18n/strings/sessions.js` (227 ln)
- `app/i18n/strings/paths.js` (122 ln)
- `app/i18n/strings/stats.js` (108 ln)
- `app/i18n/strings/achievements.js` (40 ln)
- `backups/PACE_standalone_v0.33.0_20260519.html` (610 KB; pristino restaurado de HEAD)
- `docs/sessions/session-81-audit.md` (documento previo a Tarea 2)
- `docs/sessions/session-81-design.md` (3 variantes)
- `docs/sessions/session-81-strings-split.md` (este archivo)

### Modificados

- `PACE.html` (linea de carga i18n: 3 -> 8 scripts + comentario explicativo;
  bump titulo `v0.33.1`)
- `app/state-core.jsx` (`PACE_VERSION` bump)
- `sw.js` (`CACHE_NAME` bump)
- `PACE_standalone.html` + `index.html` (rebuild)
- `STATE.md` (cabecera, tabla archivos, backups, ultima sesion, decisiones,
  deuda)
- `CHANGELOG.md` (entrada v0.33.1 + degradacion de v0.32.1 a fila-de-enlace)

### Eliminados

- `app/i18n/strings.js` (791 ln; reemplazado por 6 archivos del split)
- `backups/PACE_standalone_v0.27.5_20260511.html` (rotacion implicita; ya
  no existia fisicamente cuando se ejecuto el `rm`)

---

## Diferido a sesiones siguientes

- **Override silencioso D-1**: 3 keys `breathe.phase.*` con valores
  distintos entre `strings-content.js` (gana) y `strings/sessions.js`
  (base). Decisiones futuras posibles:
  - Consolidar valores (eliminar redundancia + override).
  - Mover los 11 duplicados de `strings-content.js` a `strings/sessions.js`
    y dejar `strings-content.js` solo con keys *unicas* de contenido
    (rutinas Move/Breathe/Extra EN).
- **D-2** Duplicidad "Hecho hoy" entre `path.card.done` y
  `paths.library.doneToday`.
- **D-3** Inconsistencia namespaces `path.*` (singular) vs `paths.*`
  (plural). Existente desde s53.
- **Resto del backlog s80**:
  - `app/main.jsx` (600 ln, MEDIA): extraer ActivityBar.
  - `app/achievements/Achievements.jsx` (~500 ln, MEDIA): catalogo a `catalog.js`.
  - Catalog split Move/Stretch (trivial ahora con `steps/` extraido).
- **`scripts/check-session.ps1` -- rango de tamaño** (desactualizado a
  530-600 KB; real 605-615 KB).

---

## Mensaje de commit propuesto

```
refactor(i18n): split strings.js en strings/ (ui/sessions/paths/stats/achievements + _bootstrap) (v0.33.1)
```
