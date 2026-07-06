# Sesión 89 — P0 de la auditoría: fixes + decisiones (v0.34.5)

**Versión:** v0.34.4 → **v0.34.5** (patch)
**Fecha:** 2026-07-07
**Bloque:** P0 de la auditoría integral (`docs/audits/audit-producto-v0.34.4.md`)
**Tipo:** fix (SW, reduced-motion) + feat (dark auto, objetivo de agua) +
refactor (split TweaksPanel) + decisión de producto (D-8)

---

## Contexto

Tras cerrar F3b y entregar la auditoría integral, el usuario pidió "el orden
más óptimo". P0 = decisiones + fixes pequeños que sanean la casa antes de
crecer contenido (F4). Cinco frentes en una sesión.

---

## 1 · D-8 resuelto como decisión de producto (cero código)

**`path.weekend` queda como *degustación curada* deliberada.** El Camino free
lanza `breathe.nadi.shodhana` + `move.atg.knees` (premium) por diseño: probar
contenido premium dentro de una secuencia curada es marketing honesto, no un
bug. Los logros ligados a premium (`explore.nadi/kapalabhati/rounds/atg/
ancestral`, `master.atg.20`) se aceptan como premium-tied por ahora; se
revisará el denominador de colección al crecer el catálogo (F4-F6).

## 2 · Service Worker (A-3)

- **Limpieza de caches**: `activate` borra todo cache `pace-*` distinto de
  `CACHE_NAME`. Antes cada release dejaba un cache huérfano para siempre.
- **Network-first para navegaciones**: las peticiones `mode === 'navigate'`
  van a red primero (con fallback a cache y a `/` si no hay red). Los assets
  siguen cache-first. Las actualizaciones llegan sin esperar al re-chequeo
  del SW.

## 3 · Reduced motion recalibrado (corrección a la propia auditoría)

La auditoría decía "prefers-reduced-motion no detectado" — **error**: existía
un kill global en `tokens.css` que congelaba también la guía visual de
respiración (`BreathVisual` anima con transitions de 1800ms sobre transform).
Con reduced-motion activo, el círculo saltaba en vez de expandirse → el
breathwork guiado perdía su función. WCAG 2.3.3 exime el motion **esencial**.

- `tokens.css`: el kill global ahora excluye subtrees `[data-pace-essential]`
  (via `:not()` de Selectors L4).
- `BreatheVisual.jsx`: los 5 wrappers (flor/ondas/pétalo/orgánico/pulso)
  llevan `data-pace-essential`.
- Todo lo decorativo (fades, slide-ups, pulsos, anillo del timer) sigue
  congelado bajo reduced-motion.

## 4 · Paleta oscura automática (primer arranque)

`detectInitialPalette()` en `state-core.jsx` (expuesta a window): respeta
`prefers-color-scheme: dark` **solo si no hay estado guardado** (rama sin
`raw` + rama catch de `loadState`). La elección manual de Tweaks persiste y
siempre gana después. No re-sigue cambios del SO en caliente. Nota: un
usuario nuevo con SO oscuro empezará a acumular días para `secret.dark.mode`
desde el día 1 — aceptado.

## 5 · Objetivo de agua configurable + split de TweaksPanel

- **Stepper "Objetivo de agua"** en Tweaks (tras los ejes): rango 4-12 (el
  grid del tracker rinde bien hasta 12 columnas), **patch funcional**
  (`set(s => …)`) para que clics rápidos en el mismo render no pisen estado
  (hallado en la verificación: la versión con closure saltaba pasos).
  `HydrateTracker`, `PathHydrateStep`, `addWaterGlass` y los logros ya leían
  `water.goal` dinámicamente — solo faltaba la UI.
- i18n `tweaks.eje.water` / `tweaks.water.value` (ES+EN).
- **Split A-4**: `TweaksPanel.jsx` 519 → **351 ln** (sale de deuda).
  Extraídos `TweaksData.jsx` (193 ln: Export/Import + msg + iconos +
  `tweaksDataStyles`) y `PremiumSection.jsx` (47 ln). Dos script tags nuevos
  en PACE.html antes de TweaksPanel.

---

## Verificación (preview :8765, servidor propio)

- `PACE_VERSION === 'v0.34.5'`; `detectInitialPalette()` → 'crema' en preview
  claro; regla reduced-motion con `:not([data-pace-essential]…)` cargada.
- Panel Tweaks: OBJETIVO DE AGUA (stepper) + TUS DATOS (split) + PREMIUM
  (split) renderizan (screenshot). 1 clic = 1 paso exacto, clamp 4-12,
  persiste en localStorage, label sincronizado.
- Sesión Respira (Box 4·4·4·4): wrapper `[data-pace-essential]` presente.
- **Consola sin errores** en todo el flujo.
- `launch.json`: `autoPort: true` queda **permanente** (evita el conflicto
  recurrente con servidores de otras sesiones en :8765).

## Build

- `PACE_standalone.html`: **633 KB** (62 archivos: +TweaksData +PremiumSection).
  `index.html` copia exacta — SHA256 idéntico (`cc5005ee…cacfe2`).
- Backup `PACE_standalone_v0.34.4_20260707.html`; cap 20 (rotado
  `v0.28.6_20260511.html`). Corregidas también las fechas del s88
  (2026-06-30 → 2026-07-07: la sesión fue hoy; backup renombrado).

---

## Decisiones

| ID | Decisión | Razón |
|---|---|---|
| D1 | `path.weekend` = degustación curada (D-8a) | Probar premium en contexto curado vende mejor que un muro; cero código; reversible en F5/F6 |
| D2 | Logros premium-tied aceptados por ahora (D-8b) | Estándar freemium; revisar denominador de colección cuando el catálogo crezca |
| D3 | Reduced-motion con excepción `data-pace-essential`, no kill total | La expansión del círculo ES la guía de respiración (WCAG 2.3.3: motion esencial). Congelar solo lo decorativo |
| D4 | Dark auto SOLO en primer arranque | La elección manual del usuario es sagrada; no re-seguir el SO en caliente evita sorpresas |
| D5 | Stepper de agua con patch funcional | `set(s=>…)` elimina el closure obsoleto en clics rápidos; patrón a reutilizar en futuros steppers |
| D6 | Split TweaksData + PremiumSection (no un solo archivo) | Cohesión: datos y premium son dominios distintos con futuros distintos (import sanitizado A-7 / licencia real post-v1.0) |

---

## Próxima sesión — F4 (contenido Respira)

Sin cambios respecto al plan: crecer Respira a ~20 técnicas + CTB (todas las
de retención con modal de seguridad), etiquetando `access` con el criterio
binario de s88. P1 de la auditoría (recordatorios opt-in, onboarding,
notificación fin de pomodoro) puede intercalarse entre F4 y F5.
