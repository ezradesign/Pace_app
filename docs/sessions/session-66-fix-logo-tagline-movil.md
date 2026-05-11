# Sesión 66 — fix(ui): logo completo + tagline sidebar móvil + iconos maskable safe zone (v0.28.6)

**Fecha:** 2026-05-12
**Versión:** v0.28.5 → v0.28.6
**Duración estimada:** sesión normal

---

## Objetivo

1. Corregir el logo `Pace.` del sidebar que aparecía recortado en móvil (390×844):
   faltaban cabeza y cuerno de la vaca, y el tagline "TOUCH GRASS, EVEN FROM YOUR DESK"
   no era visible.
2. Cache-bustear el Service Worker para que los móviles con la PWA instalada descarguen
   los nuevos iconos maskable (regenerados por el usuario con safe zone correcta).

---

## Auditoría inicial

### Iconos maskable (ya regenerados por el usuario)

| Archivo | Dimensiones | Tamaño |
|---|---|---|
| `icons/icon-192-maskable.png` | 192×192 px | 10.1 KB |
| `icons/icon-512-maskable.png` | 512×512 px | 41.4 KB |

Ambos correctos. La vaca ocupa ~70-75% del lienzo (safe zone para squircle/círculo de launchers).

### CowLogo.jsx — dimensiones SVG

- `CowLogoLineal`: `viewBox="0 0 80 60"`, ratio 4:3
- `PaceLockup` (SVG fallback): `viewBox="0 0 640 180"`, ratio ~3.6:1
- `PaceLogoImage` (PNG oficial): `<img width:100% height:auto maxWidth:600>` — el tagline
  está **embebido en el PNG** (`pace-logo.png`), no es un elemento HTML separado.

### Causa raíz del recorte

En `app/shell/Sidebar.jsx`, bloque `@media (max-width: 640px)` para
`[data-pace-sidebar] [data-pace-sidebar-logobar]`:

```css
/* ANTES (s64 · v0.28.5) */
min-height: 48px !important;
max-height: 48px !important;   /* ← clippeaba el PNG a 48px de alto */
overflow: hidden !important;   /* ← ocultaba todo lo que sobresalía */
margin-left: 0 !important;
margin-right: 0 !important;
padding: 0 4px !important;
```

El PNG del logo, a ~360px de ancho en un viewport de 390px, renderiza a ~100px de alto
(ratio ~3.6:1). Con `max-height:48px` + `overflow:hidden`, solo se mostraban los 48px
superiores (parte del wordmark "ace."), quedando la vaca y el tagline completamente ocultos.

### sw.js antes del cambio

```
CACHE_NAME = 'pace-v0.28.5'
PRECACHE = 9 recursos (/, /index.html, /PACE_standalone.html, /manifest.json, 5 iconos PNG)
```

---

## Cambios realizados

### 1. `app/shell/Sidebar.jsx`

**CSS `@media (max-width: 640px)` — contenedor del logo:**

| Propiedad | Antes | Después |
|---|---|---|
| `min-height` | `48px !important` | eliminado |
| `max-height` | `48px !important` | eliminado |
| `overflow` | `hidden !important` | `visible !important` |
| `padding` | `0 4px !important` | `6px 4px !important` |
| `margin-left` | `0 !important` | `0 !important` (se mantiene) |
| `margin-right` | `0 !important` | `0 !important` (se mantiene) |

**Nueva regla CSS añadida:**
```css
[data-pace-sidebar] [data-pace-sidebar-logo] {
  max-width: 200px !important;
  width: 100% !important;
  margin: 0 auto !important;
}
```

**JSX — atributo añadido al div contenedor del logo:**
```jsx
<div
  style={{ ...sidebarStyles.logo, cursor: 'pointer' }}
  data-pace-sidebar-logo   /* ← nuevo */
  onClick={...}
  title={...}
>
```

### 2. `sw.js`

```
CACHE_NAME: 'pace-v0.28.5' → 'pace-v0.28.6'
```
Fuerza invalidación del cache en todos los dispositivos con la PWA instalada.

### 3. `app/state-core.jsx`

```
PACE_VERSION: 'v0.28.5' → 'v0.28.6'
```

### 4. `PACE.html`

```html
<title>PACE · Foco · Cuerpo — v0.28.6</title>
```

---

## Qué NO se cambió

- Contadores (pomodoros / rondas / racha) siguen **ocultos** en móvil — decisión de s61/v0.28.2.
- Desktop intacto: logo grande + tagline + contadores visibles.
- Lógica de la app, módulos React, otros componentes: sin tocar.
- Los iconos maskable NO se regeneraron en esta sesión — ya estaban listos.

---

## Build

| Métrica | Valor |
|---|---|
| Bundle `PACE_standalone.html` | 559 KB (sin cambio) |
| Bundle `index.html` | 559 KB (copia exacta) |
| SHA256 ambos archivos | `C0AEBFACFC5DCDB4BB30A4DEE63C5025FAF5582FE1C7860515EC5922A1B2F26A` |
| Archivos validados | 40 (3 .js, 37 .jsx) |
| Backup creado | `backups/PACE_standalone_v0.28.5_20260512.html` |
| Backup rotado | `backups/PACE_standalone_v0.25.1_20260507.html` (más antiguo) |

---

## Instrucciones de verificación

**Brave DevTools móvil 390×844:**
- Logo `Pace.` íntegro: cabeza + cuerno + cuerpo + hierba de la vaca
- Tagline "TOUCH GRASS, EVEN FROM YOUR DESK" visible debajo del wordmark
- Sidebar sin scroll vertical
- Contadores (00/00/00) siguen ocultos — correcto

**Desktop 1080p:**
- Header con logo grande + tagline + contadores — sin cambios

**PWA en móvil real:**
1. Desinstalar la PWA anterior
2. Navegar a `https://paceweb.pages.dev/` (esperar 1-2 min al redeploy tras el push)
3. Instalar PWA desde el banner o menú del navegador
4. El icono maskable debe verse completo en el launcher: vaca dentro del círculo/squircle sin salirse
