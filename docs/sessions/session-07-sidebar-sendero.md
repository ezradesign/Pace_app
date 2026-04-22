# Sesión 7 (2026-04-22 · 16:44) — Sidebar colapsable + Sendero + logo Pace.

**Versión entregada:** v0.11.2
**Duración / intensidad:** media

## Contexto / petición

Pulir la presentación del Home antes de llevar todo a GitHub:
- El logo nuevo refuerza la identidad "Pace. · ritmo propio" con la vaca
  como protagonista visual.
- La barra colapsable libera espacio en pantallas pequeñas y da al usuario
  control sobre qué ver.
- Sendero vuelve visible el avance del día sin abrumar: una línea con hitos.
- Quitar Plan libera espacio útil; la ActivityBar inferior ya hace ese trabajo.
- Tweaks en el top-right es más consistente con stats y logros y libera la
  esquina inferior.

## ✅ Cambios aplicados

**Logo nuevo (`app/ui/CowLogo.jsx`):**
- `PaceLockup` — la vaca se integra en la letra "P" (lomo + cabeza inclinada
  paciendo con cuernito y oreja), hierba al pie, "ace." en cursiva serif
  verde oliva y punto terracota final.
- `PaceWordmark` reescrito para detectar `variant === 'pace'` y delegar en
  `PaceLockup`; variantes legacy `lineal/sello/ilustrado` conservan
  comportamiento anterior.
- `state.logoVariant` default cambiado de `'lineal'` a `'pace'` en
  `app/state.jsx`.
- Añadida opción `{ v: 'pace', name: 'Pace. (lockup, default)' }` como
  primera del eje de logo en `TweaksPanel`.

**Sidebar reescrito (`app/shell/Sidebar.jsx`):**
- Añadido estado `sidebarCollapsed` (en `app/state.jsx`) y lógica para
  togglear entre 280 px expandido y 56 px en rail.
- Toggle chevron en cabecera (arriba a la derecha del logo) cuando está
  expandido.
- Modo colapsado: rail vertical con atajos visuales (número de días, icono
  logros con contador, icono campana recordatorios, chevron inverso para
  expandir).
- **Sección Plan eliminada** — los chips interactivos
  (Muévete/Respira/Extra/Hidrátate) ya no aparecen. El estado `plan.*` se
  conserva internamente para ActivityBar y logros.
- **Sección Sendero añadida** (componente `SenderoDelDia`):
  - SVG 240×46 px con curva cuadrática horizontal empalmada representando
    el arco del día 6h→22h.
  - Puntos circulares en la curva marcan hitos reales del día (pomodoros,
    respiraciones, movimientos, vasos de agua) — cada uno con su color de
    módulo.
  - Pointer negro pequeño sobre la curva indica la hora actual.
  - Debajo: "6h … ahora · HH:MM … 22h" en cursiva.
  - Cabecera con contador dinámico `N hitos`.
- Mensaje placeholder italic cuando no hay recordatorios.
- Altura máxima de la lista de recordatorios con scroll para que no rompa
  el layout ahora que hay más espacio.

**Tweaks reubicado (`app/main.jsx`):**
- El FAB flotante `fabStyles.tweaks` (bottom-right) ya fue eliminado en
  sesión previa.
- El TopBar ahora agrupa los 3 iconos arriba a la derecha en este orden:
  Tweaks (gear) · Stats (chart) · Logros (trophy).
- Atajo `T` sigue activo.

## 📁 Archivos modificados
- `app/ui/CowLogo.jsx` (nuevo componente `PaceLockup`, modificada fábrica `PaceWordmark`)
- `app/shell/Sidebar.jsx` (reescrito: toggle, Sendero, sin Plan, recordatorios con placeholder)
- `app/state.jsx` (default `logoVariant: 'pace'`, añadido `sidebarCollapsed`)
- `app/tweaks/TweaksPanel.jsx` (opción `pace` en logo)

## 🔒 Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.2** (166 KB)
- `backups/PACE_standalone_v0.11.1_20260422.html` (backup previo rotado)
- `backups/PACE_standalone_v0.11.0_20260422.html` (backup aún más antiguo)
