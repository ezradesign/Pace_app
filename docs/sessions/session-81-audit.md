# Sesion 81 -- Auditoria: split de app/i18n/strings.js

**Fecha:** 2026-05-19
**Scope confirmado:** split de `app/i18n/strings.js` (776 ln; deuda ALTA en s80).
Refactor puro, sin cambios funcionales/visuales/copy. Bump v0.33.0 -> v0.33.1.

> Nota de scope: el prompt original de s81 pedia transiciones del Camino, pero
> esas ya existen completas desde s77 (PathTransitions.jsx + tokens + i18n +
> phase machine en PathRunner). El usuario reorienta a este candidato del
> backlog de s80.

---

## 1.1 Estado actual del subsistema i18n

```
app/i18n/
├── strings.js          791 ln  -- catalogo principal ES+EN. 664 keys (332+332).
├── strings-content.js  254 ln  -- patch solo EN para contenido de ejercicios (224 keys).
└── useT.jsx             56 ln  -- hook + detectInitialLang().
```

Carga en `PACE.html` (lineas 114-116) en este orden:

```html
<script type="text/babel" src="app/i18n/strings.js"></script>
<script type="text/babel" src="app/i18n/strings-content.js"></script>
<script type="text/babel" src="app/i18n/useT.jsx"></script>
```

**Contrato actual:**
- `strings.js` define `window.PACE_STRINGS = { es: {...}, en: {...} }` (asignacion directa).
- `strings-content.js` hace `Object.assign(window.PACE_STRINGS.en, {...})` (patch sobre EN existente).
- `useT.jsx` lee `window.PACE_STRINGS[lang][key]` con fallback a EN.
- `state-core.jsx` (siguiente en cargar) llama `detectInitialLang()` exportado por useT.

**Por que strings.js asigna `window.PACE_STRINGS = ` (no Object.assign):**
es el primer i18n file en cargar. No hay PACE_STRINGS previo que merge.
strings-content.js es el segundo, asi que ya puede usar `Object.assign(window.PACE_STRINGS.en, ...)`.

---

## 1.2 Conteo exacto por dominio (en strings.js)

31 bloques de comentario por idioma. Tamanos (ES, similar en EN):

| # | Bloque (comentario en archivo) | Keys ES | Lineas (es+en) | Linea |
|---|---|---:|---:|---:|
|  1 | Welcome | 17 | ~36 | 9-25 |
|  2 | Support | 18 | ~38 | 27-47 |
|  3 | Break | 13 | ~28 | 49-62 |
|  4 | Sidebar | 21 | ~44 | 64-86 |
|  5 | Welcome lang toggle | 2 | ~6 | 88-90 |
|  6 | TopBar | 8 | ~18 | 92-101 |
|  7 | Settings (panel Ajustes) | 6 | ~14 | 103-109 |
|  8 | ActivityBar | 9 | ~20 | 111-120 |
|  9 | Tweaks | 36 | ~76 | 122-159 |
| 10 | Session (shell+prep+done) | 15 | ~32 | 161-177 |
| 11 | Move / Extra (pasos) | 7 | ~16 | 179-186 |
| 12 | Focus | 14 | ~30 | 188-202 |
| 13 | Common (compartido) | 6 | ~14 | 204-210 |
| 14 | Breathe (fases sesion) | 11 | ~24 | 212-223 |
| 15 | Breathe (sesion) | 2 | ~6 | 225-227 |
| 16 | Libraries (compartido) | 2 | ~6 | 229-231 |
| 17 | Breathe Library | 2 | ~6 | 233-235 |
| 18 | Move Library | 3 | ~8 | 237-240 |
| 19 | Extra Library | 3 | ~8 | 242-245 |
| 20 | Move Session (additional) | 5 | ~12 | 247-252 |
| 21 | Hydrate | 8 | ~18 | 254-262 |
| 22 | Stats (base) | 9 | ~20 | 264-272 |
| 23 | Stats tabs | 3 | ~8 | 273-276 |
| 24 | Stats heatmap mensual | 11 | ~26 | 277-289 |
| 25 | Stats vista anual | 9 | ~22 | 290-299 |
| 26 | Stats Caminos | 10 | ~22 | 301-311 |
| 27 | Achievements | 16 | ~34 | 313-329 |
| 28 | Breathe safety modal | 14 | ~30 | 331-345 |
| 29 | Caminos -- PathRunner | 18 | ~38 | 347-365 |
| 30 | Caminos -- nombres + taglines | 14 | ~30 | 366-380 |
| 31 | Caminos -- nombres por kind | 4 | ~10 | 381-385 |
| 32 | Paths library/favoritos | 11 | ~24 | 386-397 |

**Total ES = 327 keys** (32 bloques despues de subdividir Stats; coincide aprox.
con grep ^    '[a-z]+\.[a-z] = 332 que incluye 5 separadores). EN espeja.

### Familias semanticas (agrupando bloques)

| Familia | Bloques incluidos | Keys ES | Comentario |
|---|---|---:|---|
| **Shell UI** | Sidebar + TopBar + Settings + ActivityBar + Welcome (incl. lang toggle) + Support + Break + Tweaks | 130 | UI cronica de chrome / primera-apertura |
| **Sessions** | Session shared + Common + Focus + Move pasos/sesion/lib + Extra lib + Breathe phases/sesion/lib/safety + Hydrate | 79 | Actividades vivas |
| **Stats** | Stats base + tabs + heatmap + year + Caminos | 42 | Panel Ritmo |
| **Achievements** | Achievements (1 bloque) | 16 | Catalogo de logros |
| **Paths** | PathRunner + names + kind + library | 47 | Subsistema Caminos |
| **Lib shared** | "Libraries (compartido)" (lib.tag, lib.routines) | 2 | Cruza Sessions; podria vivir en cualquiera |

327 ES (+/- 5 por separadores que el grep cuenta como keys). Suma cuadra
razonablemente con el conteo bruto.

---

## 1.3 Deudas tecnicas detectadas (NO a arreglar en s81)

### D-1 -- Override silencioso strings-content.js sobre strings.js

`strings-content.js` define **11 keys de `breathe.phase.*`** que **tambien**
estan en `strings.js` EN. 3 de ellas con valor DISTINTO:

| Key | strings.js EN | strings-content.js EN | Valor efectivo |
|---|---|---|---|
| `breathe.phase.inhala.mas` | "Inhale more" | **"Inhale again"** | "Inhale again" |
| `breathe.phase.inhala.oceanica` | "Ocean inhale" | **"Oceanic inhale"** | "Oceanic inhale" |
| `breathe.phase.exhala.oceanica` | "Ocean exhale" | **"Oceanic exhale"** | "Oceanic exhale" |

Las otras 8 keys (`breathe.phase.inhala/exhala/sosten/inhala.izq/inhala.dcha/
exhala.dcha/exhala.izq/respira`) coinciden -- duplicacion estricta, sin divergencia.

**Por que no se arregla en s81:** scope = split mecanico. Tocar valores semanticos
abre un debate de copy (Ocean vs Oceanic) que no toca a esta sesion. Se documenta
como deuda y se mueve a backlog explicito.

**Decision de scope:** durante el split, mantener el override exactamente como
esta (strings-content.js sigue cargandose despues, sigue ganando). El split
no debe alterar el valor efectivo de ninguna key.

### D-2 -- Duplicidad "Hecho hoy"

Tres keys distintas con el mismo significado:
- `path.card.done` -- "Hecho hoy" / "Done today"
- `paths.library.doneToday` -- "Hecho hoy" / "Done today"
- (`break.done` parcialmente: "Ya hecho hoy · otra ronda si quieres" / "Done today · another round if you like")

`path.card.done` y `paths.library.doneToday` son redundantes. No se consolida en s81.

### D-3 -- Namespaces inconsistentes path / paths

- `path.runner.*` (singular), `path.hydrate.*` (singular), `path.card.*` (singular).
- `paths.library.*` (plural), `paths.suggested.*` (plural), `paths.path.*` (plural).
- `paths.kind.*` (plural), `paths.runner.repeat` (plural, divergente del resto de `path.runner.*`).

Inconsistencia de prefijo conocida desde s53. No se consolida en s81.

### D-4 -- Bloques minusculos

3 bloques tienen <=3 keys (Welcome lang toggle: 2; Breathe session: 2; Libraries: 2;
Breathe Library: 2; Move Library: 3; Extra Library: 3). En el split estos no merecen
archivo propio -- se agrupan con dominio padre.

---

## 1.4 Invariantes que el split DEBE preservar

1. **`window.PACE_STRINGS` queda con la misma forma** `{ es: {...}, en: {...} }`
   tras la ultima carga de i18n.
2. **Conteo final de keys identico**: 332 ES + 332 EN en `window.PACE_STRINGS`
   tras todos los splits + strings-content.js patch.
3. **Valor efectivo de cada key identico**. En particular, las 3 keys de D-1
   siguen efectivamente con el valor de strings-content.js (override preservado).
4. **`detectInitialLang()` sigue en useT.jsx** (no se mueve). Lo llama
   `state-core.jsx` siguiente en carga.
5. **`useT.jsx` no cambia su firma ni sus fallbacks** (lang -> EN -> key).
6. **`_i18nIsDev` warning en localhost** se preserva (no es i18n, vive en useT).
7. **Orden de carga compatible con state-core**: el bloque i18n entero termina
   antes de cualquier `state-*.jsx`. `detectInitialLang()` debe estar disponible
   cuando state-core evalua `loadState()`.
8. **`strings-content.js` sigue siendo un patch (Object.assign) sobre PACE_STRINGS.en**.
   Su tamano y comportamiento no cambian en s81. Solo se renombra si se mueve a una
   subcarpeta (decision a tomar en design).
9. **Comentarios de seccion preservados** dentro de cada archivo del split. Los
   "// Welcome", "// Support", etc. del original sobreviven al menos en cabecera
   o cerca de su bloque correspondiente. No se pierde la organizacion semantica.
10. **Tamano bundle**: crecimiento esperado <=5 KB (cabeceras de doc-comment
    + IIFE wrappers + Object.assign boilerplate; mismo patron que s80 split).
11. **PACE.html ordenado**: los nuevos archivos del split se cargan entre
    `strings.js` (o lo que lo reemplace como primer i18n) y `useT.jsx`. El
    bloque entero sigue antes de los `state-*.jsx`.
12. **Cero cambios en consumidores**: ningun JSX o JS fuera de `app/i18n/`
    referencia `PACE_STRINGS` directamente (verificado: solo useT.jsx lo lee).
    El split no requiere tocar nada fuera de `app/i18n/` + `PACE.html` + bundler.
13. **Build standalone**: `build-standalone.js` debe seguir inlineando todos los
    archivos de `app/i18n/`. Si la lista de archivos esta hardcoded en el builder,
    actualizar; si descubre por glob, no requerir cambios. Verificar en design.

---

## 1.5 Edge cases a contemplar

### E-1 -- Orden de carga: crear vs patch

Si el primer i18n file ya no es "el catalogo completo", hay dos disenios validos:

- **(a) Bootstrap explicito**: un archivo `_bootstrap.js` (o nombre similar)
  carga primero y hace `window.PACE_STRINGS = { es: {}, en: {} }`. Cada
  archivo siguiente hace `Object.assign(PACE_STRINGS.es/en, {...})`.
- **(b) Primer dominio carga raw, resto patch**: el primer dominio (p.ej. `ui.js`)
  hace `window.PACE_STRINGS = { es: {...}, en: {...} }`. Los siguientes hacen
  `Object.assign`.

Riesgo de (b): si el dominio "primer cargado" falla parse, ningun PACE_STRINGS
existe y el resto de Object.assign explota. (a) es mas resistente.

### E-2 -- Que pasa si un archivo del split falla parsing

Babel-standalone aborta solo ese archivo. PACE_STRINGS pierde las keys de ese
archivo. useT cae al fallback EN; si falta tambien en EN, devuelve la key
cruda como texto en la UI. Habria warning en consola por `[i18n] missing key`
(localhost) -- silencioso en produccion.

Mitigacion: el build pasa `parser TS real` (s56), aborta con linea:columna
exacta en cualquier error sintactico. Si el split rompe parse, build no
produce bundle.

### E-3 -- strings-content.js: mover o no

Opcion (a): dejarlo en `app/i18n/strings-content.js` (status quo).
Opcion (b): renombrar/mover a `app/i18n/strings/_content.js` o similar.

Si se mueve, hay que actualizar `<script src=>` en PACE.html y `build-standalone.js`.
No hay otro consumidor fuera del orden de carga -- es seguro moverlo.

### E-4 -- Tweaks (panel) es el bloque mas grande (36 keys)

36 keys de tweaks supera a varios dominios juntos. Posibles disenios:

- (a) Junto con Shell UI (-> archivo grande de ~130 keys).
- (b) Archivo propio `tweaks.js` (-> archivo medio de ~76 lns).
- (c) Sub-split tweaks por seccion (paleta/timer/breath/lang/sounds/data/msg/confirm) --
  premature, no merece complejidad.

### E-5 -- Stats (4 sub-bloques agrupados)

stats base + tabs + heatmap + year + caminos = 42 keys. Logico un solo archivo
`stats.js`. Hueco a evaluar: stats caminos puede ir en `paths.js` por
afinidad funcional, o en `stats.js` por afinidad de uso (mismo panel).
Decision en design.

### E-6 -- Common (6 keys, todas en sesiones activas)

`common.close/time/rounds/breaths/breath/of` se usa en BreatheSession + MoveSession.
Probablemente vive mejor con `sessions.js` o como `common.js` propio.

### E-7 -- Welcome lang toggle (2 keys)

`welcome.lang.toggle.toEn/toEs` viven en bloque Welcome pero se usan en el
toggle de WelcomeModule. Misma decision que el bloque Welcome.

### E-8 -- prefers-reduced-motion / palette no afectan

i18n es ortogonal a tokens visuales. No hay riesgo desde DESIGN_SYSTEM.

### E-9 -- Backwards-compat con localStorage `lang`

`state.lang` se persiste en localStorage; el setLang del tweak panel solo
escribe 'es' o 'en'. No hay riesgo de keys ES huerfanas si el split EN gana
prioridad temporal.

### E-10 -- index.html (pace standalone) inline

El standalone inlinea TODOS los `<script src>` de PACE.html. Si el split
multiplica archivos pero la suma de bytes crece <5 KB, no se ve impacto
runtime. Si el build no recoge alguno, useT devuelve key cruda en la UI
afectada (regresion visible).

---

## 1.6 Decisiones de scope (cerrar antes de diseno)

1. **NO consolidar deudas D-1 a D-4**. Split puro mecanico. Cualquier
   consolidacion semantica vuelve s81 a un refactor de UX no aprobado.
2. **strings-content.js sigue siendo un archivo de patch separado**. No se
   fusiona con el split de dominios. Su rol (contenido EN de ejercicios
   inyectado tras la base) es distinto del resto y se preserva tal cual.
3. **Cero cambios en useT.jsx**. La interfaz publica (`t`, `tn`, `lang`,
   `detectInitialLang`) no se toca.
4. **Cero cambios fuera de `app/i18n/` + `PACE.html` + `build-standalone.js`**.
   No tocar STATE.md decisiones existentes salvo registrar la nueva.
5. **Mantener ES y EN en el mismo archivo del split** (es decir, un `welcome.js`
   contiene welcome.es y welcome.en). Separar por idioma duplicaria el numero
   de archivos sin beneficio -- siempre se actualizan en paralelo. Esta es la
   decision por defecto del diseno; el design puede argumentar lo contrario si
   ve valor.

---

## Cierre del audit

Lo que necesita decision del usuario (Tarea 2 -- design):

- **Granularidad** (cuantos archivos): 5? 9? 13? Trade-off entre claridad y
  numero de `<script src>` en PACE.html.
- **Nomenclatura** (subcarpeta `strings/` o flat con prefijo `strings-*.js`).
- **Bootstrap explicito (E-1a) o primer-archivo-define (E-1b)**.
- **Que hacer con bloques chicos** (welcome lang toggle, Libraries (compartido)):
  fusion con dominio padre o archivo propio.
- **Stats Caminos**: en `stats.js` o en `paths.js`.
- **Common**: en `sessions.js` o `common.js` propio.

Pasamos a Tarea 2.
