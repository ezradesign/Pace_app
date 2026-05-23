# Sesion 83 -- auditoria estructural de `app/achievements/Achievements.jsx`

**Fecha:** 2026-05-23
**Version origen:** v0.33.2
**Version objetivo:** v0.33.3 (patch, refactor sin cambios funcionales)
**Tipo:** auditoria previa al split (Tarea 1 del prompt s83)

> Documento de apoyo para [session-83-design.md](./session-83-design.md) y
> [session-83-achievements-split.md](./session-83-achievements-split.md).

---

## TL;DR

`app/achievements/Achievements.jsx` -- **409 ln** reales (STATE.md estimaba
~500; sobreestimacion de ~22%). Cuatro bloques bien delimitados con cero
acoplamientos problematicos:

1. **DATA SVG** -- 50 ln (`GLYPH_SVG` map: 33 paths + alias).
2. **DATA catalogo** -- 125 ln (`ACHIEVEMENT_CATALOG`: 100 entradas).
3. **DATA helpers** -- 60 ln (`CAT_META` + `IMPLEMENTED_ACHIEVEMENTS`).
4. **UI** -- 167 ln (`renderGlyph` + `isImplemented` + `Achievements` +
   `Seal`).

Consumidores externos de `window.ACHIEVEMENT_CATALOG`: **2**
(`CompletionScreen.jsx:50`, `Toast.jsx:13`). `IMPLEMENTED_ACHIEVEMENTS`
es local-only (no expuesto). `state-achievements.jsx` no consume ninguna
de las dos constantes (solo dispara `unlockAchievement(id)` con ids
hardcoded). Cero riesgo de romper detectores en el split.

Cero duplicacion de SVG con `app/glyphs/exercise-glyphs.jsx` (v0.28.1,
46 glifos line-art): son **dos sistemas visuales completamente distintos**.

---

## 1.1 Decomposicion del archivo

| Rango | Seccion | Lineas | Tipo | Responsabilidad |
|---|---|---:|---|---|
| 1-5 | Header doc-comment | 5 | -- | Procedencia glifos D + nota s48d/48d.1 |
| 6-8 | SVG helpers | 3 | DATA | `SVG_PFX`, `SVG_SFX`, `g(body)` -- envuelve cuerpos SVG en `<svg viewBox="0 0 44 44">` |
| 10-48 | `GLYPH_SVG` map | 39 | DATA | 33 entradas SVG inline como strings |
| 49-50 | Alias glifo | 2 | DATA | `GLYPH_SVG['first.plan'] = GLYPH_SVG['first.ritual']` (s28) |
| 52-176 | `ACHIEVEMENT_CATALOG` | 125 | DATA | Array de 100 logros por categoria |
| 178-186 | `CAT_META` | 9 | DATA | Map 7 categorias -> `{ labelKey, color }` |
| 188-238 | `IMPLEMENTED_ACHIEVEMENTS` | 51 | DATA | Set de ids con trigger activo (43 ids agrupados por categoria con comentarios de progreso) |
| 240-253 | `renderGlyph` helper | 14 | LOGIC/UI | Inyecta `glyphSvg` via dangerouslySetInnerHTML o unicode fallback |
| 255-259 | `isImplemented` helper | 5 | LOGIC | `secret || IMPLEMENTED_ACHIEVEMENTS.has(id)` |
| 261-315 | `Achievements` componente | 55 | UI | Modal raiz: contador + iteracion por categoria + grid de Seals |
| 317-407 | `Seal` componente | 91 | UI | Card individual con 3 estados (unlocked/locked/coming-soon) + estado secreto |
| 409 | `Object.assign(window)` | 1 | -- | Expone `Achievements` y `ACHIEVEMENT_CATALOG` |

**Totales por tipo:**
- DATA: 234 ln (57% del archivo)
- LOGIC/UI helpers: 19 ln (5%)
- UI componentes: 146 ln (36%)
- Boilerplate: 10 ln (2%)

**Conclusion:** el archivo es **mayoritariamente datos** (57%). El bloque
de componentes UI es relativamente compacto (146 ln). La separacion
natural por tipo (datos a un lado, UI al otro) es limpia: no hay
clausuras compartidas, no hay funciones que combinen datos y JSX a
medio camino.

---

## 1.2 Inventario de glifos SVG

### Cuantos hay

**33 entradas SVG** en `GLYPH_SVG` (lineas 11-47) + **1 alias**
(`first.plan` = `first.ritual`, linea 50). Total efectivo: **34 glifos
SVG**.

Los **66 logros restantes** del catalogo (100 - 34) usan **glyph unicode
fallback** (cadena corta como `'III'`, `'☉'`, `'❀'`, `'?'`).

### Como se almacenan

**Strings de SVG, no JSX.** Cada entrada de `GLYPH_SVG[id]` es el
resultado de `g(body)` -- una funcion que envuelve un cuerpo SVG en
`<svg viewBox="0 0 44 44" xmlns="..." width="100%" height="100%">...</svg>`.

Al renderizar, `renderGlyph()` (lineas 243-253) inyecta el string via
`dangerouslySetInnerHTML`. Si no hay `glyphSvg`, cae a un `<span
style={{fontStyle: 'italic'}}>{a.glyph}</span>` con el unicode.

```js
const SVG_PFX = `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">`;
const SVG_SFX = `</svg>`;
const g = (body) => SVG_PFX + body + SVG_SFX;
```

**Implicacion para el split:** mover el map a otro archivo es trivial.
No hay clausuras, no hay JSX, son strings. El consumidor (`renderGlyph`)
puede vivir donde sea siempre que tenga acceso al map y a React.

### Duplicacion interna en `Achievements.jsx`

**Una sola duplicacion explicita** (line 50): `first.plan` hereda el
glifo de `first.ritual`. Comentario en linea 49 justifica la decision
(misma trigger desde s28). Es un alias intencional, no deuda.

No hay otros glifos identicos (verificado por inspeccion visual de los
33 paths).

### Cruce con `exercise-glyphs.jsx`

`app/glyphs/exercise-glyphs.jsx` (v0.28.1, 527 ln, 46 glifos) usa un
**sistema visual completamente distinto** al de Achievements:

| Aspecto | `Achievements.jsx` (logros) | `exercise-glyphs.jsx` (Move/Stretch) |
|---|---|---|
| Estilo | Heraldica: circulos rellenos + lineas conectoras finas (`stroke-width 0.5-0.6`) | Line-art: trazos `stroke-width 1.8`, sin fill, posturas simplificadas |
| ViewBox | `0 0 44 44` | `0 0 44 44` |
| Almacenamiento | Strings de SVG (mapa `GLYPH_SVG`) | Componentes JSX (mapa `EXERCISE_GLYPHS` con factories `({size, className}) => <G>...</G>`) |
| Inyeccion | `dangerouslySetInnerHTML` desde `renderGlyph()` | Componente React directo `<G>` (helper interno) |
| Keys | Achievement IDs en `kebab.dot.case` (`'explore.hips'`, `'master.path.all7'`) | Nombres de paso en espanol (`'Flexiones inclinadas'`, `'Apertura de pecho'`) |
| Opacidades | 0.4-0.6 secundarios, 1.0 principales | 1.0 principales, 0.5-0.6 secundarios, 0.35 referencia suelo |
| Forma final | Sello: circulos + lineas geometricas (estrellas, heptagonos, soles) | Posturas: cuerpo en accion, objetos reconocibles |

**Conclusion:** dos sistemas conceptual y visualmente independientes. NO
hay SVG identico entre los dos archivos. NO hay imports cruzados (verificado
por grep en `Achievements.jsx`, sin matches para `exercise-glyphs` ni
`ExerciseGlyph`).

**Vinculaciones conceptuales no consolidables hoy:**

| Logro (Achievements) | Posible glifo Move/Stretch relacionado | Decision |
|---|---|---|
| `explore.hips`, `master.hips.20` | `'Flexor de cadera'`, `'90/90'`, etc. | NO consolidar. Sello heraldico (logro) vs postura (ejercicio): dos lenguajes visuales distintos por design |
| `explore.shoulders`, `master.shoulders.20` | `'Apertura de pecho'`, `'Scapular squeeze'` | Idem |
| `explore.ancestral`, `master.ancestral.10` | `'Cossack squat'`, `'90/90'` | Idem |
| `explore.atg`, `master.atg.20` | `'Cossack squat'` (relacionado) | Idem |

**Documentado para registro futuro.** NO consolidar en s83 (scope creep).
Si en s85+ el usuario integra un sistema visual unificado donde un logro
de "completar caderas" reutilice la posicion `90/90`, se evalua entonces.

### Familia visual de glifos relacionados

Algunos glifos forman familias coherentes que deben preservarse:

| Familia | Glifos | Patron visual |
|---|---|---|
| Streaks | `streak.7`, `streak.30`, `streak.365`, `master.path.all7` | Poligonos regulares de N vertices con punto central + linea opacity 0.5 uniendolos |
| Romanos italicos | `master.pomodoro.8` (VIII), `focus.hours.100` (C), `master.centurion` (C) | `<text>` con `font-family EB Garamond`, `font-style italic` |
| Coordenadas radiales | `master.dawn`, `master.dusk`, `master.focus.day`, `master.retreat` | Circulos concentricos + puntos cardinales o ejes |

**`master.path.all7` (s78) heredo el patron de streak.7/365**: 7 vertices
en heptagono + centro 2.4 + linea opacity 0.5. Es crucial que tras el
split este glifo se mantenga intacto -- forma parte de la unica familia
expandida en s78 y es la "joya" del catalogo de Caminos.

### Glifos por categoria (cobertura SVG)

| Categoria | Total logros | Con `glyphSvg` | Solo unicode |
|---|---:|---:|---:|
| Primeros | 10 | 9 (incl. alias `first.plan`) | 1 (`first.return`) |
| Constancia | 15 | 8 | 7 |
| Exploracion | 20 | 8 | 12 |
| Maestria | 26 | 9 | 17 |
| Secretos | 21 | 1 (`secret.cow.click`) | 20 |
| Estadisticas | 4 | 0 | 4 |
| Estacionales | 10 | 0 | 10 |
| **Total** | **106** | **35** (incl. alias) | **71** |

**Nota:** STATE.md y prompt hablan de "100 logros" pero el array
contiene 106 entradas (las 4 de `cat: estadisticas` se anyadieron en s46
sin ajustar el contador). Es deuda menor de copy/contador, no de codigo
-- el `availableCount` se calcula dinamicamente. NO arreglar en s83
(refactor puro, no toca contenido).

---

## 1.3 Dependencias del catalogo

### Consumidores externos de `window.ACHIEVEMENT_CATALOG`

| Archivo | Linea | Uso | Riesgo si cambia |
|---|---:|---|---|
| `app/paths/CompletionScreen.jsx` | 50 | `const catalog = (typeof window !== 'undefined' && window.ACHIEVEMENT_CATALOG) || [];` -- itera para encontrar logros desbloqueados durante el Camino | Bajo (lectura defensiva con fallback `[]`) |
| `app/ui/Toast.jsx` | 13 | `const a = (window.ACHIEVEMENT_CATALOG \|\| []).find(x => x.id === toast.id);` -- busca el logro recien desbloqueado para mostrar su titulo/glifo en el toast | Bajo (idem, lectura defensiva con fallback `[]`) |

**Ambos accesos son defensivos** (`|| []`). Tras el split, basta con
asegurar que `app/achievements/catalog.js` (o donde quede) sigue
asignando `window.ACHIEVEMENT_CATALOG` ANTES de que cualquiera de los
dos consumidores se evalue. Como ambos consumidores son codigo de
funciones que se ejecutan en handlers de UI (no top-level), el orden de
carga de `<script src>` en PACE.html basta.

### Consumidores de `IMPLEMENTED_ACHIEVEMENTS`

**Solo el propio `Achievements.jsx`** (linea 258 en `isImplemented`).
NO esta expuesto a `window`. NO hay consumidores externos.

**Implicacion:** tras el split, `IMPLEMENTED_ACHIEVEMENTS` puede:
- (a) Quedarse local en `catalog.js` y exportarse a `window.IMPLEMENTED_ACHIEVEMENTS` por simetria con `ACHIEVEMENT_CATALOG`, **o**
- (b) Mantenerse no expuesto (scope local del archivo donde viva).

Recomendacion: **(a)** para coherencia con la convencion del codebase
(todo lo que un archivo define se expone a window al final via
`Object.assign`). Coste cero, abre la puerta a que otro modulo lo lea
si surge necesidad futura.

### Consumidores indirectos via `state-achievements.jsx`

`state-achievements.jsx` (268 ln) **NO** lee `ACHIEVEMENT_CATALOG` ni
`IMPLEMENTED_ACHIEVEMENTS`. Solo dispara `unlockAchievement(id)` con
ids hardcoded por sus detectores. Verificado por grep
(`ACHIEVEMENT_CATALOG|IMPLEMENTED_ACHIEVEMENTS`) -- cero matches en
`state-achievements.jsx`.

**`checkAllPathsCompleted` (linea 106)** lee `window.PATH_CATALOG`, no
`ACHIEVEMENT_CATALOG`. Sin riesgo en este split.

### Consumidores de `Achievements` (componente)

Verificado por grep en el repo -- el componente `Achievements` se
referencia desde:
- `app/main.jsx` (renderizado tras `setSeeAch`).
- `PACE.html` orden de carga.

Sin acoplamientos rotos.

---

## 1.4 Invariantes a preservar

Lista numerada exhaustiva. Cada invariante debe sobrevivir al split:

1. **100 (rev. 106) entradas** en `ACHIEVEMENT_CATALOG` con `id`, `cat`,
   `title`, `desc`, `glyph` (y opcionalmente `glyphSvg`, `secret`)
   identicos byte-a-byte.
2. **Orden del array preservado** -- el counter `Object.entries(CAT_META)`
   itera por orden de declaracion. Cambiar el orden no rompe nada pero
   altera la UX visual.
3. **`GLYPH_SVG` map intacto** -- 33 entradas + alias `first.plan` =
   `first.ritual`. Strings byte-a-byte.
4. **`SVG_PFX`/`SVG_SFX`/`g()` helpers preservados** -- si se mueven al
   archivo de glifos, las 33 entradas siguen calculandose igual.
5. **Alias `first.plan`** (linea 50) sigue funcionando. Decision s28
   documentada inline.
6. **`secret.cow.click`** sin canonico (decision excepcional) sigue
   siendo excepcion documentada.
7. **`master.path.all7`** (s78) glifo heptagonal renderiza identico --
   verificacion pixel-perfect en Fase 4.5.
8. **Familia visual** `streak.7`/`streak.30`/`streak.365`/
   `master.path.all7` mantiene coherencia (poligonos regulares + centro
   + linea opacity 0.5).
9. **`CAT_META` con 7 categorias** (primeros, constancia, exploracion,
   maestria, secretos, estacionales, estadisticas) y sus colores/labels.
10. **`IMPLEMENTED_ACHIEVEMENTS` Set** con 43 ids agrupados por categoria.
    Cada id sigue desbloqueando "modo disponible" en `isImplemented`.
11. **`renderGlyph(a, style)`** sigue inyectando `glyphSvg` o fallback
    unicode con misma logica.
12. **`isImplemented(a)`** sigue evaluando `secret || Set.has(id)`.
13. **`Achievements` componente**: Modal con tag/title/subtitle/maxWidth
    920 + contador `unlockedCount/availableCount` + `comingSoonCount` +
    grid por categoria + grid auto-fill 128px.
14. **`Seal` componente** con sus 3 estados (unlocked/locked/coming-soon)
    + estado secreto (cuarto modo). Border solid/dashed/dotted, opacities
    1.0/0.55/0.38, ring externo `-4 inset` opacity 0.4.
15. **Badge "Pronto"** solo en estado coming-soon (top:6 right:6, fontSize
    7.5, letterSpacing 0.14em).
16. **Secretos pintan siempre como '?' + "Secreto"** salvo desbloqueados.
17. **Counter home** (en main.jsx) muestra `{unlockedCount}/{availableCount}
    · {comingSoonCount} to discover →` correcto.
18. **`window.ACHIEVEMENT_CATALOG` expuesto** antes de cualquier render
    de CompletionScreen o Toast.
19. **`window.Achievements` expuesto** -- referenciado desde main.jsx.
20. **Detector `checkAllPathsCompleted`** (state-achievements.jsx:106)
    sigue desbloqueando `master.path.all7` cuando los 7 caminos estan
    completos.
21. **Toast de logro desbloqueado** dispara con fade-out s79
    (`TOAST_DURATION_MS` 3000 + 300ms fade).
22. **Strings i18n** intactas en `app/i18n/strings/achievements.js`:
    `ach.title`, `ach.subtitle`, `ach.tag`, `ach.available`,
    `ach.coming.soon`, `ach.seal.soon`, `ach.seal.secret`,
    `ach.cat.primeros`, `ach.cat.constancia`, `ach.cat.exploracion`,
    `ach.cat.maestria`, `ach.cat.secretos`, `ach.cat.estacionales`,
    `ach.cat.stats`, `ach.toast.*`.
23. **CompletionScreen.jsx:50** sigue leyendo `window.ACHIEVEMENT_CATALOG`
    sin cambios.
24. **Toast.jsx:13** idem.
25. **Modal de logros abierto** sobrevive recarga (NO -- es state local
    de main.jsx, no persiste por design; verificado en s82 que `seeAch`
    no se serializa).

---

## 1.5 Edge cases a contemplar

Casos a probar explicitamente en Fase 4.4:

1. **Logro desbloqueado durante sesion activa de Pomodoro** -- toast
   aparece, sesion no se interrumpe, modal sigue cerrado.
2. **Cambio idioma ES->EN con catalogo abierto** -- las claves
   `ach.cat.*`, `ach.seal.*` se actualizan al instante (re-render por
   `useT`); los titulos/desc de logros NO se internacionalizan (estan
   en castellano duro en el catalogo). Esto es comportamiento existente,
   no se cambia en s83.
3. **Recarga con catalogo abierto** -- abre cerrado (state local).
4. **Logro con `glyphSvg` complejo (heptagonal `master.path.all7`)** --
   pixel-perfect tras split (Fase 4.5).
5. **`unlocked = 0`** -- counter muestra `0 / 71 · 35 to discover`
   (ajustar a los conteos reales de availableCount/comingSoonCount).
6. **`unlocked = total`** -- counter muestra `N / N · 0`. `master.collector.full`
   se desbloquea.
7. **Categoria sin logros desbloqueados** -- titulo de seccion sigue
   visible con `0 / N`, grid muestra todos como locked/coming-soon.
8. **Logro recien desbloqueado mientras modal de Seal abierto** -- s83
   no toca el modal de preview (no existe modal de preview por logro
   individual; el `title=` HTML es la unica preview, y se actualiza
   reactivo). Sin riesgo.
9. **Secreto desbloqueado** -- cambia de '?' + "Secreto" a glifo real +
   titulo real. Solo `secret.cow.click` tiene SVG canonico; el resto
   tendran glyph unicode.
10. **Hover sobre coming-soon** -- `title` muestra `t('ach.coming.soon')`
    en vez de `a.desc`.
11. **`first.plan` desbloqueado** -- usa glifo de `first.ritual` (alias
    s28).
12. **Catalogo cargado antes que main.jsx** -- el orden de `<script src>`
    en PACE.html debe garantizar que `catalog.js` (y `achievement-glyphs.jsx`
    si Variante B/C) van **antes** que `Achievements.jsx` y antes que
    `main.jsx`.

---

## 1.6 Conclusion de la auditoria

El archivo `Achievements.jsx` es un candidato **limpio** para el split:

**Puntos a favor:**
- Mayoritariamente datos (57%) -- separacion natural por tipo.
- Cero clausuras compartidas entre datos y UI.
- Una sola dependencia externa de DATA (`window.ACHIEVEMENT_CATALOG` ->
  2 consumidores defensivos).
- `IMPLEMENTED_ACHIEVEMENTS` local-only -- no propaga riesgo.
- Convencion `app/glyphs/` ya existe (s60: `exercise-glyphs.jsx`).
- `state-achievements.jsx` no acopla.

**Puntos de atencion:**
- Glifos SVG son strings, no JSX -- al moverse, el consumidor
  `renderGlyph()` necesita acceso al map. Decision Variante A/B/C.
- Heptagonal `master.path.all7` debe quedar pixel-perfect (familia s78).
- Counter "100 logros" vs 106 reales -- deuda existente, fuera de scope
  de s83.

**Recomendacion para Tarea 2:** Variante B (datos a `catalog.js` +
glifos a `app/glyphs/achievement-glyphs.jsx`) es el equilibrio natural.
Variante A no aporta lo suficiente (66% del archivo seguiria siendo
datos + UI mezclados). Variante C es premature abstraction (no hay
modal de preview ni filtros complejos en el archivo actual).

Detalle de variantes en [session-83-design.md](./session-83-design.md).
