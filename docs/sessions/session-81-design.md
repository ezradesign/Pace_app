# Sesion 81 -- Diseno: split de app/i18n/strings.js

**Fecha:** 2026-05-19 -- Continuacion de [session-81-audit.md](./session-81-audit.md).
**Tarea 2 del prompt:** 3 variantes razonadas para que el usuario decida.

---

## Resumen ejecutivo

3 variantes con granularidad creciente:

| Variante | Archivos nuevos | Bootstrap | Lineas/archivo (max) | Entradas en PACE.html |
|---|---:|---|---:|---:|
| **A -- Conservadora** | 3 + reduccion de strings.js | implicito (strings.js queda) | ~280 | 6 (de 3 -> 6) |
| **B -- Pragmatica** | 5 + bootstrap explicito | `_bootstrap.js` | ~310 | 8 |
| **C -- Maximalista** | 13 + bootstrap explicito | `_bootstrap.js` | ~100 | 16 |

Todas:
- Preservan `window.PACE_STRINGS = { es: {...}, en: {...} }` final.
- Dejan `strings-content.js` intacto.
- Dejan `useT.jsx` intacto.
- Build-standalone.js no requiere cambios (walk recursivo descubre archivos).

---

## Variante A -- Conservadora (RECOMENDADA para s81)

**Filosofia:** reduccion focalizada. Solo extrae los 3 dominios mas grandes,
deja el resto en strings.js. strings.js sigue siendo el "primer cargado" y
sigue haciendo asignacion directa de `window.PACE_STRINGS = {...}`.
Los 3 nuevos archivos son patches `Object.assign` sobre PACE_STRINGS.

### Estructura

```
app/i18n/
├── strings.js              (~330 ln; 130 ES + 130 EN; shell + welcome + support + ...)
├── strings-paths.js        (~100 ln; 47 ES + 47 EN; PathRunner + names + kind + library)
├── strings-sessions.js     (~180 ln; 85 ES + 85 EN; focus + breathe + move + extra + hydrate + session + common + libs)
├── strings-stats-ach.js    (~126 ln; 58 ES + 58 EN; stats + caminos + achievements)
├── strings-content.js      (sin cambios; sigue siendo el patch EN de contenido)
└── useT.jsx                (sin cambios)
```

`strings.js` reducido contiene EXCLUSIVAMENTE:
- Welcome (17) + welcome lang toggle (2)
- Support (18)
- Break (13)
- Sidebar (21)
- TopBar (8)
- Settings (6)
- ActivityBar (9)
- Tweaks (36)

Total reducido: 130 ES, 130 EN -> ~330 lineas (de 791). **-58%**.

### Orden de carga en PACE.html

```html
<script type="text/babel" src="app/i18n/strings.js"></script>         <!-- bootstrap + shell UI -->
<script type="text/babel" src="app/i18n/strings-sessions.js"></script><!-- patch -->
<script type="text/babel" src="app/i18n/strings-paths.js"></script>    <!-- patch -->
<script type="text/babel" src="app/i18n/strings-stats-ach.js"></script><!-- patch -->
<script type="text/babel" src="app/i18n/strings-content.js"></script>  <!-- patch EN existente -->
<script type="text/babel" src="app/i18n/useT.jsx"></script>            <!-- consume PACE_STRINGS -->
```

### Cabecera tipica de un patch

```js
/* PACE - strings i18n - sessions
   Sesion 81 -- v0.33.1 (extraido de strings.js en split por dominio).
   Patches window.PACE_STRINGS.{es,en} con keys de:
     - session.* (shell de sesiones activas)
     - common.* (compartido entre sesiones)
     - lib.* (etiquetas de biblioteca)
     - focus.*, breathe.*, move.*, hydrate.* (modulos de actividad)
   Carga DESPUES de strings.js (que crea PACE_STRINGS) y ANTES de useT.jsx.
*/
Object.assign(window.PACE_STRINGS.es, { /* ... */ });
Object.assign(window.PACE_STRINGS.en, { /* ... */ });
```

### Pros / Contras

**Pros:**
- Cambio minimo en PACE.html: 3 nuevas entradas (de 3 a 6 scripts i18n).
- strings.js sigue siendo el "raiz" del catalogo -- no se introduce concepto
  nuevo de bootstrap. Patron identico a como ya funciona strings-content.js.
- 0 riesgo de "primer archivo no carga -> resto explota". strings.js sigue
  creando el objeto, sin parses fragiles.
- Diff git pequeno y legible: 1 archivo modificado (strings.js, removidas
  ~460 lineas), 3 archivos nuevos.
- 0 cambios de contrato: el resto del codebase ve `window.PACE_STRINGS` igual.

**Contras:**
- 3 archivos no es "split por dominio" estricto -- strings-sessions.js es
  todavia grande (~180 lns, 85 keys de 6 sub-dominios).
- Asimetria: shell UI vive en strings.js (raiz), pero stats/paths/sessions
  estan en archivos hijos. Un lector nuevo puede no entender el patron sin
  leer la cabecera.

### Coste estimado en build

- strings.js: 791 -> ~330 lns (-461 lns).
- 3 archivos nuevos: ~406 lns sumados (~135 promedio).
- Delta neto: +~25 lns por cabeceras + boilerplate.
- Bundle: estimado +1-2 KB (cabeceras + Object.assign wrappers).

---

## Variante B -- Pragmatica

**Filosofia:** estructura por capa. Bootstrap explicito + 5 dominios coherentes.
strings.js se renombra a `strings/_bootstrap.js` y solo define el objeto vacio.

### Estructura

```
app/i18n/
├── strings/
│   ├── _bootstrap.js      (~12 ln; define window.PACE_STRINGS = { es: {}, en: {} })
│   ├── ui.js              (~310 ln; 150 ES + 150 EN; welcome + support + sidebar + topbar + settings + activity + tweaks + break + welcome lang toggle)
│   ├── sessions.js        (~180 ln; 85 ES + 85 EN; session + common + lib + focus + breathe + move + extra + hydrate)
│   ├── paths.js           (~100 ln; 47 ES + 47 EN; path runner + names + kind + library)
│   ├── stats.js           (~92 ln; 42 ES + 42 EN; stats + tabs + heatmap + year + caminos)
│   └── achievements.js    (~34 ln; 16 ES + 16 EN; ach.*)
├── strings-content.js     (sin cambios -- queda en la raiz de i18n/)
└── useT.jsx               (sin cambios)
```

`strings.js` se ELIMINA (su funcion la asume `strings/_bootstrap.js`).

### Orden de carga en PACE.html

```html
<script type="text/babel" src="app/i18n/strings/_bootstrap.js"></script>
<script type="text/babel" src="app/i18n/strings/ui.js"></script>
<script type="text/babel" src="app/i18n/strings/sessions.js"></script>
<script type="text/babel" src="app/i18n/strings/paths.js"></script>
<script type="text/babel" src="app/i18n/strings/stats.js"></script>
<script type="text/babel" src="app/i18n/strings/achievements.js"></script>
<script type="text/babel" src="app/i18n/strings-content.js"></script>
<script type="text/babel" src="app/i18n/useT.jsx"></script>
```

### Bootstrap (12 lns)

```js
/* PACE - strings bootstrap (s81)
   Inicializa el catalogo i18n vacio.
   Los archivos siguientes (ui.js, sessions.js, ...) inyectan keys via
   Object.assign(window.PACE_STRINGS.{es,en}, ...).
   strings-content.js sigue siendo el patch EN de contenido al final.
*/
window.PACE_STRINGS = { es: {}, en: {} };
```

### Pros / Contras

**Pros:**
- Estructura mas explicita: cada archivo es UN dominio coherente.
- Bootstrap centralizado -- el patron es "asigna shell, luego patches".
  No hay archivo "especial" que mezcle bootstrap con contenido.
- Cada archivo del split es <=310 lns, dentro de la regla de <500 lns
  de CLAUDE.md.
- Carpeta `strings/` agrupa visualmente todos los dominios.
- Si en el futuro hay que pulir nombres o reorganizar, las cajas son
  semanticas y no tecnicas (no hay un "strings-misc.js" generico).

**Contras:**
- Renombra/elimina `strings.js` -- archivo conocido por sesiones previas;
  cualquier referencia en docs antiguas ("ver strings.js linea X") deja
  de aplicar.
- `ui.js` sigue siendo grande (~310 lns, 150 keys). El criterio "<500 lns"
  se cumple pero por poco.
- Crea concepto de "carpeta de strings" -- duplica el patron de
  `app/paths/steps/`. Para 5 archivos puede sentirse ceremonioso.
- Bootstrap archivo de 12 lns es pequeno -- algunos lo veran como overkill.

### Coste estimado en build

- strings.js: 791 -> 0 lns (eliminado).
- 6 archivos nuevos: ~728 lns sumados (incluido bootstrap).
- Delta neto: ~-63 lns (mas cabeceras pero menos boilerplate de objeto unico).
- Bundle: estimado +2-3 KB.

---

## Variante C -- Maximalista

**Filosofia:** un archivo por dominio. 13 archivos en `app/i18n/strings/`.
Granularidad alineada 1:1 con modulos de la app. Mayor coste de tooling pero
maxima localidad de cambios futuros.

### Estructura

```
app/i18n/
├── strings/
│   ├── _bootstrap.js      (~12 ln)
│   ├── welcome.js         (~42 ln; welcome + welcome lang toggle = 19 keys ES)
│   ├── support.js         (~38 ln; 18 keys ES)
│   ├── break.js           (~28 ln; 13 keys ES)
│   ├── shell.js           (~96 ln; sidebar + topbar + settings + activity = 44 keys ES)
│   ├── tweaks.js          (~76 ln; 36 keys ES)
│   ├── session.js         (~50 ln; session + common + lib shared = 23 keys ES)
│   ├── focus.js           (~30 ln; 14 keys ES)
│   ├── breathe.js         (~64 ln; breathe phases + sesion + safety + lib = 29 keys ES)
│   ├── move.js            (~40 ln; move pasos + sesion + lib.move + lib.extra = 18 keys ES)
│   ├── hydrate.js         (~18 ln; 8 keys ES)
│   ├── stats.js           (~92 ln; stats + tabs + heatmap + year + caminos = 42 keys ES)
│   ├── achievements.js    (~34 ln; 16 keys ES)
│   └── paths.js           (~100 ln; path runner + names + kind + library = 47 keys ES)
├── strings-content.js     (sin cambios -- queda en la raiz)
└── useT.jsx               (sin cambios)
```

### Orden de carga en PACE.html

```html
<script type="text/babel" src="app/i18n/strings/_bootstrap.js"></script>
<script type="text/babel" src="app/i18n/strings/welcome.js"></script>
<script type="text/babel" src="app/i18n/strings/support.js"></script>
<script type="text/babel" src="app/i18n/strings/break.js"></script>
<script type="text/babel" src="app/i18n/strings/shell.js"></script>
<script type="text/babel" src="app/i18n/strings/tweaks.js"></script>
<script type="text/babel" src="app/i18n/strings/session.js"></script>
<script type="text/babel" src="app/i18n/strings/focus.js"></script>
<script type="text/babel" src="app/i18n/strings/breathe.js"></script>
<script type="text/babel" src="app/i18n/strings/move.js"></script>
<script type="text/babel" src="app/i18n/strings/hydrate.js"></script>
<script type="text/babel" src="app/i18n/strings/stats.js"></script>
<script type="text/babel" src="app/i18n/strings/achievements.js"></script>
<script type="text/babel" src="app/i18n/strings/paths.js"></script>
<script type="text/babel" src="app/i18n/strings-content.js"></script>
<script type="text/babel" src="app/i18n/useT.jsx"></script>
```

### Pros / Contras

**Pros:**
- Maxima localidad: editar copy de Achievements toca 1 archivo de 34 lns,
  no un archivo de 300+.
- Cada archivo es <=100 lns -- muy facil de revisar de un vistazo.
- Patron escalable: anadir un dominio futuro (ej. nuevos Caminos premium)
  es trivial.
- Alineamiento con la arquitectura del proyecto: 1 modulo -> 1 archivo
  de strings.

**Contras:**
- 13 entradas en PACE.html (de 3 a 16 scripts i18n). Mayor superficie para
  errores de orden de carga.
- Algunos archivos son trivialmente pequenos (hydrate.js = 8 keys = 18 lns).
  Patron de "1-archivo-por-dominio" se siente excesivo para esos casos.
- 13 IIFE wrappers + 13 cabeceras es mas boilerplate proporcional al
  contenido util. Crecimiento de bundle mayor (~5 KB estimado).
- Decision implicita de naming: `move.js` vs `move-extra.js`? `stats.js`
  contiene tambien `stats.tab.paths.*` y `stats.paths.*` -- mezcla con
  paths conceptualmente. Cada archivo crea pequenos debates de scope.

### Coste estimado en build

- strings.js: 791 -> 0 lns.
- 14 archivos nuevos: ~720 lns sumados.
- Delta neto: ~-70 lns (similar a Variante B; el boilerplate suma pero la
  reduccion del objeto unico compensa).
- Bundle: estimado +4-6 KB (mas cabeceras pero mismas keys).

---

## Comparativa rapida

| Criterio | A -- Conservadora | B -- Pragmatica | C -- Maximalista |
|---|---|---|---|
| Archivos nuevos | 3 | 6 (incl. bootstrap) | 14 (incl. bootstrap) |
| `<script src>` en PACE.html (i18n) | 6 | 8 | 16 |
| Lineas/archivo max | ~330 (strings.js) | ~310 (ui.js) | ~100 (paths.js) |
| Linea/archivo min | ~100 (paths.js) | ~12 (_bootstrap) | ~12 (_bootstrap) |
| Renombra strings.js | NO | SI (a _bootstrap.js) | SI (a _bootstrap.js) |
| Bootstrap explicito | NO | SI | SI |
| Coste git (diff lines) | ~+490 nuevos, -460 strings.js | ~+728 nuevos, -791 strings.js | ~+720 nuevos, -791 strings.js |
| Bundle estimado | +1-2 KB | +2-3 KB | +4-6 KB |
| Granularidad por dominio | media | alta | maxima |
| Riesgo de break por orden | bajo | bajo | medio (mas archivos) |

---

## Recomendacion del agente

**Variante A** es la mas conservadora y la menos invasiva. Captura ~58% de
la reduccion buscada (de 791 a ~330 lns en strings.js) con el menor cambio
estructural posible. No introduce bootstrap explicito, no renombra
strings.js, no crea carpeta nueva.

Si la deuda real es "strings.js esta mareantemente largo y dificulta encontrar
cosas", A lo resuelve. Si la deuda es "queremos arquitectura limpia con un
archivo por dominio", B o C son las apropiadas.

Mi sugerencia: **A** si el objetivo es cerrar la deuda con minimo riesgo,
**B** si quieres dejarlo "definitivamente bonito" sin pagar el coste de C.

C es la opcion correcta solo si la app va a crecer mucho en i18n (mas idiomas,
mas dominios). Hoy con ES+EN y 11 modulos, C se siente sobre-disenado.

---

## Pregunta para el usuario

¿Variante **A**, **B** o **C**? Una vez decidida, paso a Tarea 3
(implementacion mecanica) y luego Tareas 4-7 (verificacion + build + docs).
