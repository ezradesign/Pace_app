# Sesión 37 — Cierre i18n total + Activación PWA + Limpieza panel Ajustes

**Fecha:** 2026-05-05
**Versión:** v0.18.0 → v0.19.0
**Modelo:** Claude Sonnet 4.6
**Estimación:** 1.5–2 h

---

## Objetivo de la sesión

Tres frentes en una sola sesión: (A) cierre definitivo de i18n — migrar los últimos strings
hardcodeados visibles en la UI; (B) activar los archivos PWA huérfanos (`manifest.json`,
`sw.js`, `icons/`) que existían en el repo sin estar conectados a `PACE.html`; (C) limpiar el
panel de Ajustes eliminando opciones rotas, reubicando el toggle de audio al primer eje y
renombrando "Tweaks" → "Ajustes" / "Settings".

---

## Decisiones clave

### Hard reset localStorage v1 → v2 (D.1)
Clave de localStorage bumpeada de `pace.state.v1` a `pace.state.v2`. Pre-lanzamiento sin
usuarios reales: no hay coste de migración. Simplifica el código al eliminar la necesidad de
manejar campos legacy (`timerStyle: circle/numero`, `layout: editorial`) en un `loadState` que
ya no los ve. Decisión documentada con comentario en `state.jsx`.

### Eliminación de circle/numero de TimerVisualization (C.2)
Los estilos `circle` y `numero` del timer nunca llegaron a un diseño terminado: layouts
flotantes de 420×420 fijos, sin responsive, sin controles integrados. Se eliminan como opciones
del panel y sus funciones (`TimerCircle`, `TimerNumber`) del código. Solo quedan: `aro`
(default), `barra`, `analogico`.

### Eliminación de layout editorial (C.3)
El layout `editorial` estaba listado como tweak pero nunca tuvo implementación visual real.
Se elimina como opción del panel. El default `sidebar` y la opción `minimal` se conservan.

### Audio como primer eje del panel (C.4)
El toggle de audio pasa de ser un toggle binario aislado con `<button>` a ser el primer eje
del panel con dos pills "Activado / Silenciado" siguiendo el patrón visual de los demás ejes.
Posición: antes de Paleta. Subtítulo discreto "Sonidos de la sesión" en `var(--ink-3)`.

### PWA activada (B)
`manifest.json` y `sw.js` ya existían en el repo pero estaban desconectados. Se añaden
`<link rel="manifest">` y `<meta name="theme-color">` al `<head>` de `PACE.html` (y ya
se propagaron al standalone vía build). El SW se registra con try/catch silencioso antes
de `</body>`. `start_url` cambiado de `PACE_standalone.html` a `./` para compatibilidad
con Cloudflare Pages y apertura local.

### BreatheSession.jsx ya estaba migrado (A.1)
El objeto `PHASE_KEYS` con las claves `breathe.phase.*` y el uso de `tR()` en el render
ya estaban implementados en la sesión anterior. Solo faltaban las strings en `strings.js`,
que se añaden en esta sesión.

### BreatheSafety ya estaba migrado (A.8)
`BreatheSafety` vive en `BreatheLibrary.jsx` y ya usaba `t()` para todo el disclaimer,
incluyendo `breathe.safety.body.*` que ya estaban en `strings.js`. Deuda cerrada en
sesión 36; confirmada en esta sesión.

---

## Archivos modificados

| Archivo | Cambios | Líneas aprox. |
|---|---|---|
| `app/i18n/strings.js` | +18 claves nuevas (breathe.phase.*, sidebar.trail.hour.*, ach.seal.discover, ach.toast.new, settings.title, settings.audio.*, welcome.lang.toggle.*, common.close, focus.minutes.custom.title); −3 claves obsoletas (layout.editorial, timer.circulo, timer.numero) | ~620 |
| `app/breathe/BreatheSession.jsx` | Sin cambios de código (PHASE_KEYS y tR ya presentes). Las claves nuevas de strings.js completan la funcionalidad. | — |
| `app/shell/Sidebar.jsx` | "6h"/"22h" → `t('sidebar.trail.hour.*')`. "Por descubrir" → `t('ach.seal.discover')`. | ~570 |
| `app/tweaks/TweaksPanel.jsx` | Título "Tweaks" → `t('settings.title')`. Audio como primer eje (pills). Eliminar editorial de layout, circulo/numero de timer. Eliminar bloque Sound antiguo. Referencias `pace.state.v1` → `pace.state.v2`. | ~390 |
| `app/ui/Toast.jsx` | `useT()` añadido. "Nuevo sello" → `t('ach.toast.new')`. | ~70 |
| `app/welcome/WelcomeModule.jsx` | Tooltip toggle lang → `t(lang==='es' ? 'welcome.lang.toggle.toEn' : 'welcome.lang.toggle.toEs')`. | ~220 |
| `app/ui/Primitives.jsx` | `useT()` añadido a Modal. `aria-label="Cerrar"` → `t('common.close')`. | ~200 |
| `app/focus/FocusTimer.jsx` | `title="Minutos personalizados…"` → `t('focus.minutes.custom.title')`. `TimerVisualization` limpiado. `TimerCircle`/`TimerNumber` eliminados. | ~480 |
| `app/state.jsx` | `LS_KEY` v1→v2. `PACE_VERSION` v0.18.0→v0.19.0. Comentarios de defaultState actualizados. | ~550 |
| `sw.js` | `CACHE_NAME` v0.17.0→v0.19.0. | ~32 |
| `PACE.html` | `<link rel="manifest">`, `<meta name="theme-color">`, registro SW, título v0.19.0. | ~108 |
| `manifest.json` | `start_url: "./"`. | ~30 |
| `PACE_standalone.html` | Regenerado (~416 KB, incluye todas las adiciones PWA). | — |
| `backups/PACE_standalone_v0.18.0_20260505.html` | Nuevo backup pre-v0.19.0. | — |

---

## Claves i18n añadidas (18 en ES + 18 en EN = 36 strings)

```
breathe.phase.inhala / exhala / sosten / inhala.mas / inhala.oceanica /
exhala.oceanica / inhala.izq / inhala.dcha / exhala.dcha / exhala.izq / respira
sidebar.trail.hour.start / sidebar.trail.hour.end
ach.seal.discover / ach.toast.new
settings.title / settings.audio.label / settings.audio.on / settings.audio.off / settings.audio.hint
welcome.lang.toggle.toEn / welcome.lang.toggle.toEs
common.close
focus.minutes.custom.title
```

Claves eliminadas: `tweaks.layout.editorial`, `tweaks.timer.circulo`, `tweaks.timer.numero`.

---

## Deuda cerrada esta sesión

- i18n total: todos los strings visibles al usuario migrados a `t()`.
- PWA huérfana: `manifest.json`/`sw.js`/`icons/` ahora conectados desde `PACE.html` y el standalone.
- Panel Ajustes limpiado: timer con 3 opciones válidas, layout con 2, audio promovido al primer eje.
- `BreatheSafety` body confirmado migrado desde sesión 36.

---

## Deuda pendiente

- Iconos PNG reales (192×512) para PWA — actualmente SVG. Puede que algunos navegadores no
  los acepten como iconos de instalación.
- Audio refactor 432 Hz / drone ambiente.
- Calendarios mes/año (heatmap "Año en pace").
- README en inglés.
- Reddit launch.
- Glifos SVG personalizados (decisión de dirección visual pendiente del usuario).
- v0.13.0 backup no borrado por permisos de sandbox — el usuario debe eliminarlo manualmente.
