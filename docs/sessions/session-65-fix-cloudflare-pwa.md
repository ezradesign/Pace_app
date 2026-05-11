# Sesión 65 — fix(deploy): Cloudflare Pages root + manifest PWA + iconos vaca pastando

**Fecha:** 2026-05-11  
**Versión:** v0.28.5 (sin bump — ya fijado en s64)  
**Rama:** `main`

---

## Objetivo

Corregir el despliegue en Cloudflare Pages (que no sirve `https://paceweb.pages.dev/`
porque el bundle se llama `PACE_standalone.html` y no `index.html`) e integrar los
nuevos iconos PNG para la PWA, reemplazando los SVGs eliminados.

---

## Auditoría inicial (Tarea 0)

### Estado encontrado

| Elemento | Estado |
|---|---|
| `build-standalone.js` OUTPUT (línea 34) | Solo escribe `PACE_standalone.html`; sin copia a `index.html` |
| `PACE.html` manifest | `href="manifest.json"` (ruta relativa) |
| `PACE.html` theme-color | `#3E5A3A` (verde viejo) |
| `PACE.html` iconos | Sin `<link rel="icon">` ni `<link rel="apple-touch-icon">` |
| `PACE.html` metas mobile | Sin `mobile-web-app-capable`, `apple-mobile-web-app-*` |
| `manifest.json` | Existía pero apuntaba a SVGs eliminados (`pace-icon-*.svg`), `start_url: "./"`, `scope: "."`, colores viejos |
| `sw.js` CACHE_NAME | `pace-v0.19.0` (muy desactualizado) |
| `sw.js` PRECACHE | Solo `./PACE_standalone.html` |
| `index.html` | NO existía |
| `favicon.ico` | NO existe (fuera de scope de esta sesión) |
| `_redirects` / `_headers` / `wrangler.toml` | NO existen (no necesarios para Fase 1) |

### Iconos encontrados

| Archivo | Dimensiones | Estado |
|---|---|---|
| `icons/icon-192.png` | 192×192 | OK |
| `icons/icon-512.png` | 512×512 | OK |
| `icons/icon-192-maskable.png` | 192×192 | OK |
| `icons/apple-touch-icon.png` | 180×180 | OK |
| `icons/pace-512-maskable.png` | 512×512 | **Nombre incorrecto** — renombrado a `icon-512-maskable.png` |

### Versión

- `PACE_VERSION` ya era `v0.28.5` (bumpeado en sesión 64, sin commit aún).
- Backup `v0.28.4` ya existía (creado en sesión 64).

---

## Cambios realizados

### Previo — Renombrar icono

`icons/pace-512-maskable.png` → `icons/icon-512-maskable.png` para consistencia
con el resto de nombres del sistema.

### Tarea 1 — `build-standalone.js`

Tras `fs.writeFileSync(OUTPUT, html)`, añadido:

```js
var indexPath = path.join(ROOT, 'index.html');
fs.copyFileSync(OUTPUT, indexPath);
console.log('✓ index.html generado (copia de PACE_standalone.html)');
```

`PACE_standalone.html` se mantiene intacto como alias temporal.
`.gitignore` verificado — no ignora `index.html` ni `PACE_standalone.html`.

### Tarea 2 — `manifest.json` (reescrito)

```json
{
  "name": "PACE · Foco · Cuerpo",
  "short_name": "Pace",
  "start_url": "/",
  "scope": "/",
  "theme_color": "#F5EFE0",
  "background_color": "#F5EFE0",
  "icons": [
    { "src": "/icons/icon-192.png",          "purpose": "any" },
    { "src": "/icons/icon-512.png",          "purpose": "any" },
    { "src": "/icons/icon-192-maskable.png", "purpose": "maskable" },
    { "src": "/icons/icon-512-maskable.png", "purpose": "maskable" }
  ]
}
```

Cambios clave: rutas absolutas (`/icons/…`), `start_url` y `scope` a `"/"`,
colores crema, PNGs reales en lugar de SVGs eliminados.

### Tarea 3 — `PACE.html` head

Reemplazado bloque `<link rel="manifest">` + `<meta theme-color>` por:

```html
<link rel="manifest" href="/manifest.json">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="theme-color" content="#F5EFE0">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Pace">
```

### Tarea 4 — `sw.js` (actualizado)

- `CACHE_NAME`: `'pace-v0.19.0'` → `'pace-v0.28.5'`
- `PRECACHE` ampliado a 9 recursos: `/`, `/index.html`, `/PACE_standalone.html`,
  `/manifest.json` y los 5 iconos PNG.

---

## Build

- Bundle: 558 KB → 559 KB (+1 KB). 40 archivos validados.
- `PACE_standalone.html` SHA256: `233034BD2B1DB1414A3AB3542A6C203A79CB5B2AA22793193B645E5919F0E089`
- `index.html` SHA256: `233034BD2B1DB1414A3AB3542A6C203A79CB5B2AA22793193B645E5919F0E089`
- **Idénticos byte a byte.**

---

## Plan Fase 2 (sesión futura, ~3 jun 2026)

Una vez que los usuarios migren a `paceweb.pages.dev/`, eliminar `PACE_standalone.html`
como alias y dejar solo `index.html`. Actualizar `sw.js` PRECACHE para quitar
`/PACE_standalone.html`. Actualizar `build-standalone.js` para no copiar dos archivos
(o renombrar directamente el output a `index.html`).
