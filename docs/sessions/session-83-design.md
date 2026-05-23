# Sesion 83 -- diseno del split de `app/achievements/Achievements.jsx`

**Fecha:** 2026-05-23
**Version origen:** v0.33.2
**Version objetivo:** v0.33.3
**Tipo:** documento de variantes (Tarea 2 del prompt s83)
**Documento previo:** [session-83-audit.md](./session-83-audit.md)

---

## TL;DR

Tres variantes razonadas A/B/C, completamente especificadas. **Variante B
recomendada** (datos a `app/achievements/catalog.js` + glifos a
`app/glyphs/achievement-glyphs.jsx`). Cumple metrica de reduccion >50%,
establece convencion `app/glyphs/` con dos sistemas hermanos
(`exercise-glyphs.jsx` + `achievement-glyphs.jsx`), sin premature
abstraction.

---

## Decisiones arquitectonicas fijas (no negociables)

Antes de las variantes, esto es comun a todas y NO se debate:

1. **`app/glyphs/` es el home definitivo de todos los sistemas de
   glifos.** Si una variante extrae glifos, van a
   `app/glyphs/achievement-glyphs.jsx` (no a `app/achievements/glyphs.jsx`).
   Razon: ya existe `app/glyphs/exercise-glyphs.jsx` desde s60 -- mantener
   los dos sistemas como hermanos en el mismo namespace establece
   convencion clara.

2. **No se modifica `app/glyphs/exercise-glyphs.jsx`.** Ese archivo
   queda intacto en v0.28.1. Sera ampliado/sustituido en s85+ por el
   usuario en sesion paralela.

3. **Extension de archivos nuevos:**
   - `app/glyphs/achievement-glyphs.jsx` -- aunque NO contiene JSX (todo
     son strings de SVG), se usa `.jsx` para coincidir con el hermano
     `exercise-glyphs.jsx`. Trade-off cosmetico aceptado: la coherencia
     dentro de `app/glyphs/` pesa mas que la convencion "`.js` si no
     hay JSX". `<script>` tag no requerira `data-presets="env,react"`
     (no hay JSX que transformar) -- igual que `_bootstrap.js`,
     `paths.js`, etc.
   - `app/achievements/catalog.js` -- `.js` plain, no JSX (la sintaxis
     es literal de objetos y arrays). Coherente con `app/i18n/strings/*.js`
     (s81) y `app/paths/steps/_shared.js` (s80).

4. **Patron de exposicion a window:** cada archivo nuevo termina con un
   `Object.assign(window, { ... })` que expone las constantes/funciones
   que otros consumen. Coherente con el resto del codebase zero-build.

5. **Orden de carga en PACE.html:** los archivos nuevos se insertan ANTES
   de `Achievements.jsx` (linea 169) y, si la dependencia es transitiva
   (catalog lee glyphs), en el orden correcto.

---

## Variante A -- "Solo datos" (todo DATA a un solo catalog.js)

### Archivos

```
app/achievements/
├── Achievements.jsx        (UI raiz, ~175 ln, -57%)
└── catalog.js              (NUEVO, ~245 ln)
```

### Que se mueve a `catalog.js`

| Bloque | Lineas origen | Por que |
|---|---|---|
| SVG helpers (`SVG_PFX`, `SVG_SFX`, `g()`) | 1-8 | El catalogo los necesita para construir entradas con `glyphSvg` |
| `GLYPH_SVG` map (33 paths + alias) | 10-50 | Datos puros, referenciados desde el catalogo |
| `ACHIEVEMENT_CATALOG` | 52-176 | Datos del catalogo |
| `CAT_META` | 178-186 | Metadata de las 7 categorias |
| `IMPLEMENTED_ACHIEVEMENTS` | 188-238 | Set de ids con trigger |

### Que queda en `Achievements.jsx`

| Bloque | Lineas resultado |
|---|---|
| Header doc-comment | ~10 |
| `renderGlyph` helper | 14 |
| `isImplemented` helper | 5 |
| `Achievements` componente | 55 |
| `Seal` componente | 91 |
| `Object.assign(window, { Achievements })` | 1 |
| **Total estimado** | **~176 ln (-57%)** |

### Exposicion a window

```js
// catalog.js
Object.assign(window, {
  GLYPH_SVG,
  ACHIEVEMENT_CATALOG,
  CAT_META,
  IMPLEMENTED_ACHIEVEMENTS,
});
```

`Achievements.jsx` lee los 4 desde window dentro del componente o como
referencias top-level del archivo.

### PACE.html cambios

```html
<!-- ANTES de Achievements.jsx (linea 169 actual) -->
<script type="text/babel" src="app/achievements/catalog.js"></script>
<script type="text/babel" src="app/achievements/Achievements.jsx"></script>
```

### Pros

- 1 archivo nuevo -- overhead minimo en PACE.html.
- Cumple metrica >50% reduccion (-57%).
- Refactor de bloque DATA contiguo: cero clausuras compartidas, riesgo bajo.

### Cons

- `catalog.js` queda como "saco de datos": glifos (strings SVG) + entradas
  del catalogo + metadata categorica + set de implementados, todo
  mezclado. Funcional pero conceptualmente impuro.
- NO prepara terreno para futuros consumidores de glifos (Stats, Sidebar,
  pantalla de Onboarding...). Si alguno necesita pintar un glifo de
  logro sin tirar del catalogo entero, tendria que importar 245 ln para
  acceder al map.
- NO establece convencion clara `app/glyphs/` como home de los sistemas
  de glifos. El proyecto sigue con un solo archivo en esa carpeta hasta
  s85+.

### Esfuerzo y riesgo

- Esfuerzo: **30-45 min**
- Riesgo: **Bajo**
- Reduccion: **-57%** (cumple metrica)

---

## Variante B -- "Datos + Glifos separados" (RECOMENDADA)

### Archivos

```
app/
├── achievements/
│   ├── Achievements.jsx              (UI raiz, ~175 ln, -57%)
│   └── catalog.js                    (NUEVO, ~190 ln)
└── glyphs/
    ├── exercise-glyphs.jsx           (existente, v0.28.1, sin cambios)
    └── achievement-glyphs.jsx        (NUEVO, ~55 ln)
```

### Que se mueve a `app/glyphs/achievement-glyphs.jsx`

| Bloque | Lineas origen |
|---|---|
| Header doc-comment portado | ~7 |
| SVG helpers (`SVG_PFX`, `SVG_SFX`, `g()`) | 6-8 |
| `GLYPH_SVG` map | 10-48 (39 ln) |
| Alias `first.plan` = `first.ritual` | 50 (1 ln) |
| `Object.assign(window, { ACHIEVEMENT_GLYPHS: GLYPH_SVG })` | +1 ln |
| **Total estimado** | **~55 ln** |

### Que se mueve a `app/achievements/catalog.js`

| Bloque | Lineas origen |
|---|---|
| Header doc-comment | ~7 |
| Referencia a glifos: `const G = window.ACHIEVEMENT_GLYPHS;` | +1 ln |
| `ACHIEVEMENT_CATALOG` (con `glyphSvg: G['id']` en vez de `GLYPH_SVG['id']`) | 52-176 (125 ln) |
| `CAT_META` | 178-186 (9 ln) |
| `IMPLEMENTED_ACHIEVEMENTS` | 188-238 (51 ln) |
| `Object.assign(window, { ACHIEVEMENT_CATALOG, CAT_META, IMPLEMENTED_ACHIEVEMENTS })` | +1 ln |
| **Total estimado** | **~195 ln** |

### Que queda en `Achievements.jsx`

| Bloque | Lineas resultado |
|---|---|
| Header doc-comment | ~10 |
| `renderGlyph` helper | 14 |
| `isImplemented` helper (lee `IMPLEMENTED_ACHIEVEMENTS` de window) | 5 |
| `Achievements` componente (lee `ACHIEVEMENT_CATALOG`, `CAT_META` de window) | 55 |
| `Seal` componente | 91 |
| `Object.assign(window, { Achievements })` | 1 |
| **Total estimado** | **~176 ln (-57%)** |

### Exposicion a window

```js
// app/glyphs/achievement-glyphs.jsx
Object.assign(window, {
  ACHIEVEMENT_GLYPHS: GLYPH_SVG,
});

// app/achievements/catalog.js
const G = window.ACHIEVEMENT_GLYPHS || {};
const ACHIEVEMENT_CATALOG = [
  { id: 'first.step', cat: 'primeros', title: '...', desc: '...', glyph: '✦', glyphSvg: G['first.step'] },
  // ...
];
// ...
Object.assign(window, {
  ACHIEVEMENT_CATALOG,
  CAT_META,
  IMPLEMENTED_ACHIEVEMENTS,
});

// app/achievements/Achievements.jsx
// Helpers leen del scope global (al ser <script> top-level, las constantes
// de los archivos anteriores ya estan en window). Para legibilidad,
// referencias internas leen via window:
function isImplemented(a) {
  return a.secret || (window.IMPLEMENTED_ACHIEVEMENTS || new Set()).has(a.id);
}

function Achievements({ open, onClose }) {
  const catalog = window.ACHIEVEMENT_CATALOG || [];
  const catMeta = window.CAT_META || {};
  // ...
}
```

### PACE.html cambios

```html
<!-- ANTES de Achievements.jsx (linea 169 actual):
     primero glifos, luego catalogo, luego componente. -->
<script type="text/babel" src="app/glyphs/achievement-glyphs.jsx"></script>
<script type="text/babel" src="app/achievements/catalog.js"></script>
<script type="text/babel" src="app/achievements/Achievements.jsx"></script>
```

Tres scripts en lugar de uno, en orden estricto. Comentario explicativo
del orden -- patron de s80/s81/s82.

### Pros

- **Convencion `app/glyphs/` establecida** con dos archivos hermanos:
  `exercise-glyphs.jsx` (s60, Move/Stretch, line-art, ampliable s85+)
  + `achievement-glyphs.jsx` (s83, Logros, heraldica, cerrado y estable).
  Dos sistemas, dos archivos, sin colision conceptual.
- `catalog.js` queda **conceptualmente puro**: solo datos del catalogo
  (no glifos inline). Si en el futuro un Stats/Sidebar quiere pintar
  un glifo de logro sin tirar del catalogo, lee `window.ACHIEVEMENT_GLYPHS['id']`
  directamente.
- Coherente con el trabajo paralelo del usuario en s85+ (nuevos glifos
  Move/Stretch a `exercise-glyphs.jsx`): la convencion `app/glyphs/` ya
  esta consolidada cuando llegue ese momento.
- Patron consolidado: mismo enfoque que s80 (`PathRunner` split en
  `steps/`), s81 (`strings.js` split en `strings/`), s82 (`main.jsx`
  split en `main/`).
- Reducir el riesgo de regresion: el bloque DATA y el bloque UI se
  refactorizan en archivos distintos, por lo que un fallo en uno no
  cruza al otro.
- Cumple metrica >50% reduccion (-57%).

### Cons

- 2 archivos nuevos en lugar de 1 (overhead pequeno en PACE.html: dos
  `<script>` extra).
- Orden de carga importa transitivamente: glyphs antes que catalog antes
  que Achievements. Si se invierte, `glyphSvg` de las entradas seria
  `undefined` y los Seals caerian al fallback unicode (degradacion
  graceful pero visible). Riesgo medio-bajo (verificable en T3.5
  intermedia).

### Esfuerzo y riesgo

- Esfuerzo: **45-60 min**
- Riesgo: **Medio-Bajo**
- Reduccion: **-57%** en `Achievements.jsx` (cumple metrica)

---

## Variante C -- "B + Seal aislado"

### Archivos

```
app/
├── achievements/
│   ├── Achievements.jsx              (UI raiz, ~80 ln, -80%)
│   ├── Seal.jsx                      (NUEVO, ~91 ln)
│   └── catalog.js                    (NUEVO, ~190 ln)
└── glyphs/
    ├── exercise-glyphs.jsx           (existente, sin cambios)
    └── achievement-glyphs.jsx        (NUEVO, ~55 ln)
```

Como B mas un cuarto archivo: `Seal.jsx` aislado.

### Que se mueve a `Seal.jsx`

| Bloque | Lineas origen |
|---|---|
| `renderGlyph` helper (Seal lo consume) | 14 |
| `Seal` componente | 91 |
| `Object.assign(window, { Seal, renderGlyph })` | +1 |
| **Total estimado** | **~110 ln** |

### Que queda en `Achievements.jsx`

| Bloque | Lineas resultado |
|---|---|
| Header doc-comment | ~10 |
| `isImplemented` helper | 5 |
| `Achievements` componente (consume `Seal` de window) | 55 |
| `Object.assign(window, { Achievements })` | 1 |
| **Total estimado** | **~75-85 ln (-80%)** |

### PACE.html cambios

```html
<script type="text/babel" src="app/glyphs/achievement-glyphs.jsx"></script>
<script type="text/babel" src="app/achievements/catalog.js"></script>
<script type="text/babel" data-presets="env,react" src="app/achievements/Seal.jsx"></script>
<script type="text/babel" src="app/achievements/Achievements.jsx"></script>
```

4 scripts en orden estricto.

### Pros

- `Achievements.jsx` queda como compositor puro (~80 ln, -80%).
- Maxima granularidad UI -- Seal podria reusarse en un futuro modal de
  preview, en Stats, en Sidebar.

### Cons

- **Premature abstraction**: `Seal` solo se usa dentro de `Achievements`
  (verificado: el unico consumidor del componente actual). No hay caso
  de uso identificado para Seal aislado en el roadmap conocido (s84
  polish, s85 glifos Move/Stretch, s86 premium content).
- **Mas dependencias cross-file**: `Seal.jsx` consume `useT` (i18n),
  `renderGlyph` (helper local pasado a Seal), `Modal`/`Meta`/`displayItalic`
  (UI primitives). El boilerplate de exposicion a window crece.
- `renderGlyph` queda atado a `Seal.jsx` -- si en el futuro otro
  componente (p.ej. Toast.jsx ya consume `window.ACHIEVEMENT_CATALOG`
  para mostrar el titulo en toast) quisiera pintar el glifo del logro
  recien desbloqueado, tendria que cargar `Seal.jsx`. Acoplamiento
  inverso al deseado.
- 4 archivos nuevos en lugar de 2 -- overhead mayor en PACE.html.
- Esfuerzo mayor sin beneficio claro.

### Esfuerzo y riesgo

- Esfuerzo: **60-90 min**
- Riesgo: **Medio**
- Reduccion: **-80%** en `Achievements.jsx` (sobre-cumple metrica)

---

## Recomendacion

### Variante **B** (datos + glifos separados)

**Por que B y no A:**

- A deja `catalog.js` como saco mixto (glifos + datos + metadata). No
  establece `app/glyphs/` como home definitivo. La convencion queda a
  medias.
- A reduce 57% igual que B, pero B reparte ese 57% en dos archivos
  conceptualmente limpios en lugar de uno mixto.
- B mejora la cohesion: `app/glyphs/achievement-glyphs.jsx` es **un
  sistema visual cerrado**, igual que `app/glyphs/exercise-glyphs.jsx`.
  catalog.js es el **catalogo de logros sin glifos** -- mas facil de
  leer, modificar y eventualmente extender.

**Por que B y no C:**

- C es premature abstraction. `Seal` no tiene segundo consumidor hoy ni
  en el roadmap conocido (s84-s86).
- C anyade dependencias cross-file (renderGlyph atado a Seal) que NO
  resuelven un problema actual.
- El principio establecido en s82 -- "no premature abstraction" -- se
  aplica aqui de manera identica: extraer hooks `useOverlayManager` /
  `useGlobalKeyboard` se descarto entonces por el mismo motivo (1
  consumidor).
- Si en el futuro surge un caso de uso real para `Seal` (p.ej. un
  micropreview de logro en el banner del Camino completado, o un
  carrusel de logros recien obtenidos en Stats), entonces si se extrae.
  Y ese extract sera trivial -- el componente ya esta cohesivo.

**Por que B es coherente con el momento:**

- 4a sesion seguida de split mecanico. Patron `app/<carpeta>/` ya es
  convencion: s80 `app/paths/steps/`, s81 `app/i18n/strings/`, s82
  `app/main/`, s83 `app/glyphs/` se anyade como tercer hermano (tras
  exercise-glyphs ya existente).
- Coherente con el contexto narrativo del prompt: tras s83 el backlog
  tecnico de prioridad MEDIA queda visualmente limpio. Esto desbloquea
  psicologicamente la fase de polish + contenido (s84+).
- Encaja con la s85+ planificada: cuando el usuario integre los nuevos
  glifos de Move/Stretch, `app/glyphs/` ya sera home consolidado, con
  dos sistemas conviviendo sin colision.

### Tabla resumen

| Criterio | A | **B** | C |
|---|:---:|:---:|:---:|
| Archivos nuevos | 1 | **2** | 4 |
| Archivos modificados | 2 | **3** | 3 |
| `Achievements.jsx` final | 175 ln (-57%) | **175 ln (-57%)** | 80 ln (-80%) |
| Cumple metrica >50% | Si | **Si** | Si |
| Convencion `app/glyphs/` | -- | **Establecida** | Establecida |
| Premature abstraction | No | **No** | Si |
| Riesgo | Bajo | **Medio-Bajo** | Medio |
| Esfuerzo | 30-45 min | **45-60 min** | 60-90 min |
| Mensaje de commit | "+ catalog" | **"+ catalog + glyphs"** | "+ catalog + glyphs + seal" |

---

## Plan de implementacion para Variante B (preview)

Si se aprueba B, T3 sigue este orden estricto:

1. **Crear `app/glyphs/achievement-glyphs.jsx`** -- copia literal de
   `SVG_PFX`/`SVG_SFX`/`g()`/`GLYPH_SVG` + alias `first.plan` + header
   doc-comment + `Object.assign(window, { ACHIEVEMENT_GLYPHS: GLYPH_SVG })`.

2. **Crear `app/achievements/catalog.js`** -- header + `const G =
   window.ACHIEVEMENT_GLYPHS \|\| {};` + `ACHIEVEMENT_CATALOG` (cambiar
   `GLYPH_SVG['id']` por `G['id']` en cada entrada con `glyphSvg`) +
   `CAT_META` + `IMPLEMENTED_ACHIEVEMENTS` + `Object.assign`.

3. **Editar `PACE.html`** -- anyadir 2 `<script>` antes de la linea 169
   (Achievements.jsx) en orden glyphs -> catalog. Anyadir comentario
   explicativo.

4. **VERIFICACION INTERMEDIA** (3 archivos cargados, Achievements.jsx
   aun sin tocar): abrir PACE.html, consola limpia, catalogo abre y
   pinta igual que v0.33.2. Confirma que la duplicacion temporal
   (constantes en Achievements.jsx + en catalog.js) es idempotente.

5. **Reescribir `Achievements.jsx`** -- eliminar bloques DATA + helpers
   SVG. Dejar solo: header + renderGlyph + isImplemented + Achievements +
   Seal + `Object.assign(window, { Achievements })`. Las referencias a
   `ACHIEVEMENT_CATALOG`/`CAT_META`/`IMPLEMENTED_ACHIEVEMENTS` se leen
   desde `window.*` dentro de los componentes (no como const top-level
   del archivo, para evitar capturar valores `undefined` si el orden de
   carga falla).

6. **Verificar metricas finales** (T3 cierre):
   - `Achievements.jsx`: <200 ln (objetivo: ~175)
   - `catalog.js`: <250 ln (objetivo: ~195)
   - `achievement-glyphs.jsx`: <80 ln (objetivo: ~55)
   - Cero duplicacion entre archivos
   - Reduccion `Achievements.jsx`: >50%

Si alguna metrica se desvia +20% de la estimacion, detener y reportar.

---

## Pausa para decision

**Pregunta para el usuario:** ¿Aprueba **Variante B**?

Si si -> procede T3 (implementacion).
Si no -> indica cual variante prefiere (A o C) o ajustes.
