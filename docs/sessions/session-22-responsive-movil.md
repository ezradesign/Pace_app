# Sesión 22 · Responsive móvil (bloqueante pre-v1.0) · v0.12.4 → v0.12.5

**Fecha:** 2026-04-23
**Tipo:** Sesión de código (cambios visuales responsive)
**Resultado:** Sidebar desacoplada y fullscreen en móvil; home acoplada
que cabe en ~375×812 sin scroll. Identidad tipográfica intacta.

---

## 📋 Contexto

Tras la sesión 21 (briefing de dirección, doc-only), el backlog
quedó reordenado con **responsive móvil como bloqueante pre-v1.0**.
El usuario aporta dos capturas del problema:

- **Captura 1 (home):** el aro del Pomodoro se sale por la derecha
  del viewport. Solo se ve la mitad izquierda. Las actividades
  quedan por debajo del fold, inalcanzables sin scroll.
- **Captura 2 (sidebar):** el sidebar ocupa ~280px pero el main
  sigue visible a su derecha (pill negro "PAUSA" asomando).
  Debería ser fullscreen.

Requisitos concretos del briefing:
1. Sidebar desacoplada en móvil (≤768px) ocupa el 100% del viewport.
2. Home acoplada cabe sin scroll en viewport ~375×812: Pomodoro
   central + los 4 accesos rápidos (Respira, Mueve, Estira,
   Hidrátate) encajan en pantalla.

---

## 🧭 Decisiones de implementación

### Estrategia: media queries vía `<style>` inyectado, no cambios de layout

Los estilos del proyecto viven como objetos inline JS (`sidebarStyles`,
`focusStyles`, etc.), y Babel standalone no procesa CSS modules ni
media queries en inline styles. La solución limpia —que ya usa el
proyecto para los spinners del input type=number (ver
`FocusTimer.jsx` línea ~300)— es **inyectar un `<style>` una sola vez
en `document.head` con reglas responsive que sobrescriben los
inline styles vía `!important` sobre selectores `[data-*]`**.

Ventajas:
- No tocamos los objetos de estilos inline que ya funcionan en
  desktop. El desktop queda exactamente igual.
- No añadimos CSS files nuevos ni cambiamos el entrypoint.
- Los hooks `data-*` hacen las reglas CSS trivialmente explícitas
  sobre qué elemento aplica qué override.
- Un único bloque de CSS por archivo (sidebar, main) con `id`
  único para evitar re-inyección.

### Breakpoints
- **≤768px** — bloque móvil principal. Cubre iPhone SE, 12/13/14
  (pro/regular) y tablets pequeñas en portrait.
- **≤768px + ≤720px de alto** — bloque extra para móviles con
  pantalla vertical ajustada (SE, 12 mini): oculta el sub-label de
  los chips de actividad para dejar más aire al aro.

### Cambios por archivo

**`app/shell/Sidebar.jsx`**
- Bloque `pace-sidebar-responsive-css` inyectado una vez en `<head>`.
- En móvil el sidebar pasa a `position:fixed; inset:0; width:100vw;
  height:100vh; z-index:60`. Esto **desacopla el sidebar del layout
  flex**: el main sigue ocupando 100vw debajo pero el sidebar lo
  cubre entero cuando se abre. Es un drawer fullscreen.
- El chevron de cerrar (`[data-pace-sidebar-toggle]`) pasa a
  44×44px con `opacity:1` para hit target accesible.
- `[data-pace-sidebar-logobar]` reduce `min-height` a 84px (antes 96)
  para dejar más espacio a Ritmo/Sendero/Logros/Footer sin scroll.

**`app/main.jsx`**
- Bloque `pace-main-responsive-css` inyectado una vez en `<head>`.
- **TopBar**: padding lateral baja a 12px, altura min a 48px, tabs
  Foco/Pausa/Larga con padding y letter-spacing reducidos. Los 3
  iconos de la derecha (stats/logros/tweaks) pasan a 40×40 hit
  target.
- **Main content**: padding lateral baja de 40px → 12px para
  ganar ancho útil al aro.
- **ActivityBar**: de fila flex con `min-width:180px` por chip
  (que forzaba scroll horizontal) a **grid 2×2** con chips
  compactos verticales. En viewports `max-height:720px` (SE, 12 mini)
  se oculta el sublabel para comprimir aún más.
- Handle flotante `≡` para reabrir sidebar pasa a 44×44px en móvil.

**`app/focus/FocusTimer.jsx`**
- `aroFrame` cambia de `min(56vh, 520px)` a `min(56vh, 86vw, 520px)`.
  El `86vw` manda en móvil (antes el aro calculaba 56vh sin
  contemplar el ancho y se salía del viewport). El 520px techa en
  desktop; los tres valores cohabitan sin breakpoints. Es un
  cambio cosmético cero en desktop: a 1920×1080, 56vh=604, 86vw=1651,
  520; min=520. Sin cambios.
- `focusStyles.root` padding lateral cambia de `40px` fijo a
  `clamp(0px, 4vw, 40px)`. Redunda con el padding del main-content
  pero evita ahogar el aro si alguien tuviera data-pace-main-content
  con padding más alto.

### Lo que NO se ha tocado (intencionalmente)

- **Cifras de identidad**: el `MM:SS` del timer sigue en EB Garamond
  italic blindado (decisión vigente desde sesión 20). El `0` del
  contador de racha del sidebar sigue igual.
- **Subtítulos, labels**: todo sigue con `var(--font-display)`.
- **El layout desktop**: el comportamiento a 1920×1080 es idéntico.
  No hay reflow, no hay cambios de tamaño, no hay cambios de
  composición. Las reglas responsive están todas dentro de media
  queries.
- **Estructura de estado**: ningún cambio en `state.jsx` salvo el
  bump de `PACE_VERSION` a `v0.12.5`.

---

## 📂 Archivos modificados

- `app/shell/Sidebar.jsx` — bloque CSS responsive + `data-*` hooks.
- `app/main.jsx` — bloque CSS responsive + `data-*` hooks en
  TopBar, tabs, iconos, main-content, handle flotante, y todos los
  chips de ActivityBar.
- `app/focus/FocusTimer.jsx` — `aroFrame` con `min(56vh, 86vw, 520px)`
  y `root.padding` con clamp.
- `app/state.jsx` — `PACE_VERSION` `v0.12.1` → `v0.12.5`.
- `PACE.html` — title actualizado a v0.12.5.
- `PACE_standalone.html` — regenerado con super_inline_html.
- `backups/PACE_standalone_v0.12.3_20260423.html` — rotado.
- `CHANGELOG.md` — entrada v0.12.5.
- `STATE.md` — sección "Última sesión" reescrita + backlog
  actualizado (responsive móvil marcado como ✅).

---

## ⚠️ Decisión activa nueva (para STATE.md)

- **Los estilos responsive se inyectan como `<style>` en `<head>`
  con selectores `[data-*]` y `!important`, no como modificaciones
  de los objetos inline.** Razón: los objetos de estilos inline
  ya funcionan y son legibles; añadir lógica de breakpoints en JS
  los complicaría. Un bloque CSS por archivo con `id` único es
  trivial de leer y no se duplica. Si en el futuro hace falta más
  responsive (estados de sesión, modales), seguir el mismo patrón.

---

## 🚀 Próximos pasos

El responsive móvil queda cerrado. El siguiente candidato natural
del backlog es el **loop post-Pomodoro** (reestructurar BreakMenu
para sugerir estirar/mover/hidratar tras un Pomodoro), que es de
coste bajo y aprovecha el componente ya existente. Ver STATE.md.

Detalle completo para otros: en la próxima sesión verificar
visualmente en móvil real o devtools (iPhone 12, SE, Pixel) que
todos los modales (Respira, Mueve, Hidrátate, Achievements, Stats,
Tweaks, Welcome, Support) también encajan. Esta sesión cubrió la
home y el sidebar; los modales podrían necesitar su propio pasaje
de `data-*` + bloque CSS si se ven rotos.
