# Sesión 48c · v0.25.1 → v0.25.2 — fix: standalone crash + manifest CORS

**Fecha:** 2026-05-07 (segunda sesión del día tras s48b)  
**Versión:** v0.25.1 → **v0.25.2** (patch, hotfix de carga)  
**Bundle entregado:** `PACE_standalone.html` (480 KB, 491 202 bytes, 9 145 líneas)  
**Backup actualizado:** `backups/PACE_standalone_v0.25.2_20260507.html`

---

## TL;DR

El standalone v0.25.1 no cargaba: Babel petaba con
`Uncaught SyntaxError: Unexpected token, expected "}" (41:6)` en
`SessionShell.jsx`, y la consola añadía dos errores CORS sobre `manifest.json`
que asustaban al usuario sin ser críticos.

**Causa raíz** (no detectada en s48b):

1. **10 archivos `.jsx`** tenían como primera línea literal
   `  <script type="text/babel">`. Esto era un residuo de algún copy/paste
   pasado en el que el archivo se escribió desde un bloque HTML completo en
   lugar de su `.jsx` puro. La cabecera era invisible en el render
   final del navegador porque parecía formar parte del wrapping del bundler,
   pero al pasar por `build-standalone.js` se generaba en el bundle:
   `<script type="text/babel">  <script type="text/babel">/* contenido */`
   El primer `</script>` cerraba ambos scripts a nivel de tokenización HTML, y
   el segundo `<script type="text/babel">` quedaba como literal dentro del
   primer script — Babel se atragantaba al ver `<script type="text/babel">` como
   posible JSX abierto que esperaba cerrar.

2. **`PACE.html` estaba truncado**: terminaba en
   `<!-- Monta la app\n     Los <script type="te` sin el mount loop ni
   `</body></html>`. Probablemente un truncamiento heredado de la sesión 48
   original (la que se quedó sin contexto). **Ningún backup posterior a
   v0.20.0 contenía el mount loop completo.**

3. **`<link rel="manifest">`** se inlineaba en el standalone. En `file://` el
   navegador bloquea por CORS y produce dos errores rojos en consola que
   parecen un crash.

**Causa raíz NO encontrada:** ni null bytes, ni U+FFFD, ni truncamientos
intermedios en los `.jsx` (todos pasan balance perfecto de llaves/paréntesis y
acaban en `Object.assign(window, ...)`).

---

## Qué se hizo

### 1. Limpieza de 10 `.jsx`

`tail -n +2` sobre los 10 archivos para borrar la primera línea literal
`  <script type="text/babel">`:

- `app/tweaks/TweaksPanel.jsx` (479 → 478 L)
- `app/breakmenu/BreakMenu.jsx` (176 → 175 L)
- `app/hydrate/HydrateModule.jsx` (81 → 80 L)
- `app/extra/ExtraModule.jsx` (100 → 99 L)
- `app/move/MoveModule.jsx` (324 → 323 L)
- `app/breathe/BreatheSession.jsx` (348 → 347 L)
- `app/focus/FocusTimer.jsx` (596 → 595 L)
- `app/ui/Toast.jsx` (75 → 74 L)
- `app/ui/Sound.jsx` (350 → 349 L)
- `app/ui/SessionShell.jsx` (335 → 334 L)

### 2. Reconstrucción de `PACE.html`

PACE.html previo tenía 87 líneas, terminaba en `Los <script type="te`.
Reescrito completo (135 líneas, 6 721 bytes) usando `cat > PACE.html << 'EOF'`
en bash (la herramienta Edit en este entorno produce truncamientos).

Bloques recuperados:

- `<script type="text/babel" data-presets="env,react">` con `function mount()`
  6-check (PaceApp + BreakMenu + TweaksPanel + BreatheSession + MoveSession +
  ToastHost) y timeout 5 s (decisión vigente s38b).
- Registro del Service Worker para PWA (decisión s37 / v0.19.0).
- Cierres `</body></html>`.

Backup del PACE.html previo: `PACE.html.bak.pre-fix`.

### 3. `build-standalone.js` reescrito completo

El archivo se truncó al editarlo con `Edit` (línea 78 cortada en `'app/ui` sin
el resto de `pace-logo.png'),`). Reescrito completo via `cat > build-standalone.js << 'EOF'`.

**Cambio funcional añadido (paso 0):**
```js
html = html.replace(/\s*<link rel="manifest"[^>]*>\s*/, '\n  ');
```

`PACE.html` (dev / PWA) conserva el `<link rel="manifest">`. Sólo el bundle
standalone lo pierde.

### 4. Bump de versión

- `app/state.jsx`: `PACE_VERSION` `v0.25.0` → `v0.25.2` (la 0.25.1 nunca
  llegó a la constante por la corrupción de s48b).
- `PACE.html`: `<title>` `v0.25.1` → `v0.25.2`.

### 5. Regeneración del standalone

```
$ node build-standalone.js
PACE_standalone.html generado -- 480 KB
```

Verificación final:
- 491 202 bytes (480 KB) / 9 145 líneas
- 0 null bytes, 0 U+FFFD
- 27 bloques `<script type="text/babel">` con balance perfecto
- 0 dobles `<script type="text/babel"><script`
- `</body>` y `</html>` presentes
- Sin `<link rel="manifest">` en el bundle

---

## Verificación de los `.jsx`

Script de validación con `node` (sin Babel, parsing heurístico):

```js
const re = /<script type="text\/babel"(?:\s+data-presets="[^"]*")?>([\s\S]*?)<\/script>/g;
// para cada match: contar llaves y paréntesis abierto vs cerrado
```

Resultado: los 27 bloques tienen `braces=0 parens=0`. El único bloque con
`<script` interno es el mount loop, y la coincidencia es **dentro de un
comentario** (`Los <script type="text/babel" src> se fetchean en paralelo...`).

Verificaciones simbólicas pasadas:
- `function PaceApp` presente
- `function BreakMenu` presente
- `function TweaksPanel` presente
- `function BreatheSession` presente
- `function MoveSession` presente (en `MoveModule.jsx` y exportada)
- `function ToastHost` presente
- `function SessionShell` presente
- `Object.assign(window, { ACHIEVEMENT_CATALOG ...})` en Achievements
- 0 referencias a `manifest.json` en código `.jsx`

---

## Archivos

**Modificados:**
- 10 `.jsx` (lista arriba)
- `PACE.html` (135 L, 6 721 bytes)
- `build-standalone.js` (90 L, 3 090 bytes)
- `app/state.jsx` (bump versión)
- `CHANGELOG.md` (fila + bloque v0.25.2)
- `STATE.md` (sección "Última sesión" reescrita)

**Nuevos:**
- `backups/PACE_standalone_v0.25.1_20260507_pre48c.html`
- `backups/PACE_standalone_v0.25.2_20260507.html`
- `PACE.html.bak.pre-fix`
- `docs/sessions/session-48c-fix-standalone-truncamientos.md` (este archivo)

**Backups:** 15/20.

---

## Decisiones técnicas

- **El standalone elimina `<link rel="manifest">`.** En `file://` (uso típico
  del bundle offline) el manifest dispara CORS y mete dos errores en consola
  que parecen un crash. El standalone no se instala como PWA — la PWA es para
  `PACE.html` servido por HTTP. Mantener el manifest sólo aporta ruido.
- **Preferir `cat > foo << 'EOF'` (bash heredoc) sobre la herramienta Edit
  para archivos `.js` o `.jsx` críticos.** En este entorno Edit ha truncado
  varias veces el contenido escrito (sesiones 48, 48c). El archivo .md o de
  más de un solo cambio puntual usar la herramienta Edit es seguro, pero los
  builds y los `.jsx` largos van con bash.

---

## Pendiente

Sin cambios respecto a STATE.md s48b:

- Próxima sesión 49: **sistema de Caminos parte 1**, sobre base v0.25.2 limpia.
- Portado de glifos adicionales de Dirección D (maestría, exploración restante).
- Iconos PNG reales (192×512) para PWA.
- README EN + Reddit launch.
- Detector `master.midnight.never`.
- Claves offline Lifetime / Pase.
- Sección "Secretos" en `design/glyphs-explorations.html` con `secret.cow.click`.
