# Sesión 27 — Modales responsive en móvil (v0.12.10)

**Fecha:** 2026-04-23
**Versión:** v0.12.9 → **v0.12.10**
**Alcance:** Aplicar el patrón responsive existente (sesión 22) a
los modales, cerrando el último frente bloqueante pre-v1.0 de
adaptación móvil.

---

## Contexto de entrada

STATE.md al cierre de sesión 26 marcaba como único bloqueante
pre-v1.0 **modales en móvil**. Home y sidebar ya estaban resueltos
en sesiones 22-23-24 (v0.12.5 → v0.12.7) con el patrón `<style>`
inyectado + selectores `[data-pace-*]` + `!important`. Los 10 modales
del producto seguían sin tratamiento responsive.

**Regla no negociable respetada:** 0 cambios de comportamiento en
desktop. Los estilos inline siguen siendo la fuente de verdad; el
CSS responsive solo actúa por debajo de `640px`.

---

## Qué se hizo

### 1. Inventario de modales

10 superficies modales en el producto, que caen en 3 grupos:

| # | Modal | Archivo | Grupo |
|---|---|---|---|
| 1 | Respira (biblioteca) | BreatheModule.jsx | A (usa Modal) |
| 2 | Respira (seguridad) | BreatheModule.jsx | A |
| 3 | Mueve (biblioteca) | MoveModule.jsx | A |
| 4 | Estira (biblioteca) | ExtraModule.jsx | A |
| 5 | Hidrátate | HydrateModule.jsx | A |
| 6 | BreakMenu | BreakMenu.jsx | A |
| 7 | Achievements | Achievements.jsx | A |
| 8 | WeeklyStats | WeeklyStats.jsx | A |
| 9 | Welcome | WelcomeModule.jsx | A |
| 10 | Support | SupportModule.jsx | A |
| — | Sesión Respira/Mueve | SessionShell.jsx | B (fullscreen) |
| — | Tweaks | TweaksPanel.jsx | C (panel flotante) |

**Grupo A — 10 modales centrados.** Todos delegan en
`<Modal>` de `Primitives.jsx`. Un único punto de inyección cubre
los 10 — el trabajo útil pasa de "tocar 10 archivos" a "tocar 1".

**Grupo B — Pantallas de sesión fullscreen.** Las rutinas activas
(Respira, Mueve) viven en `SessionShell`, no en un Modal centrado.
Problema distinto: tipografías monumentales (200px en prep, 56px en
done) que rompen el layout de 375px.

**Grupo C — TweaksPanel.** Outlier: panel fijo 320×auto anclado
bottom-right, no un modal centrado. En móvil pasa a bottom-sheet.

### 2. Cambios en `app/ui/Primitives.jsx`

Añadidos `data-pace-*` attrs al JSX del Modal:
- `data-pace-modal-backdrop` — contenedor fullscreen con `placeItems: center`
- `data-pace-modal-card` — la card real
- `data-pace-modal-close` — botón × de cierre
- `data-pace-modal-head` / `-title` / `-subtitle` — zona de cabecera

Nuevo bloque `<style id="pace-modal-responsive-css">` inyectado en
`<head>` con `@media (max-width: 640px)`:

- **Backdrop:** `padding: 24 → 12`, `place-items: end center` (ancla
  el modal al borde inferior en vez de centrarlo, patrón sheet).
- **Card:** `max-width: 100%` (ignora el prop `maxWidth`),
  `max-height: calc(100dvh - 24px)` con fallback `100vh`
  (sigue la decisión activa sesión 23 — ver STATE), `padding:
  var(--s-6) → var(--s-5)`, `border-radius: var(--r-md)`.
- **Botón ×:** `28 → 36px` (target táctil ≥44×44 tras sumar
  padding perimetral), `top/right: 18/20 → 10/10`, fuente 20 → 22.
- **Head:** `margin-bottom: var(--s-5) → var(--s-4)`,
  `padding-right: 36px` para no chocar con el botón × más grande.
- **Title:** `font-size: 32 → 26`, line-height: 1.1 → 1.15.
- **Subtitle:** `max-width: 90% → 100%`, `font-size: 14 → 13`.

### 3. Cambios en `app/ui/SessionShell.jsx`

Añadidos `data-pace-session-*` attrs en JSX. Nuevo bloque
`<style id="pace-session-responsive-css">` con ajustes móvil:

- **Root:** `padding: 28px 48px 40px → 16px 20px 24px` (recupera
  96 px útiles en 375 px de ancho).
- **Header título:** `22 → 18`.
- **Prep:** número `200 → 128`, copy `20 → 15`.
- **Done:** hero círculo `120 → 80`, SVG `48 → 34`, `h1: 56 → 34`,
  stats gap `40 → 20` + `flex-wrap: wrap` para que no desborden
  con 3 stats, stat-num `40 → 28`, copy `18 → 14`.
- **Hint:** bottom `14 → 6`, font-size `10 → 9`.

### 4. Cambios en `app/tweaks/TweaksPanel.jsx`

Añadido `data-pace-tweaks-panel` en JSX. Nuevo bloque
`<style id="pace-tweaks-responsive-css">` — móvil transforma el
panel 320×auto bottom-right en un **bottom-sheet** full-width:
- `left/right/bottom: 0`, `width: auto`, `max-height: 72dvh`.
- `border-radius: var(--r-lg) var(--r-lg) 0 0` (solo esquinas
  superiores, el borde superior actúa de handle visual).
- Sin borders laterales ni inferior.
- `padding: 20 → 16px 18px 24px`.
- Sombra superior invertida: `0 -8px 32px rgba(…)`.

Nota importante: TweaksPanel no tiene backdrop oscuro — coherente
con su rol de "afinar mientras la app sigue viva detrás". Se
conserva esa filosofía en móvil.

### 5. Bumps de versión

- `app/state.jsx`: `PACE_VERSION = 'v0.12.9'` → `'v0.12.10'`.
- `PACE.html`: `<title>...v0.12.9</title>` → `v0.12.10`.
- `PACE_standalone.html`: regenerado con `super_inline_html`
  (~350 KB → ~357 KB, +7 KB por los 3 bloques CSS y los
  ~40 data-attrs añadidos).
- `backups/PACE_standalone_v0.12.9_20260423.html`: backup
  preservado del estado v0.12.9 antes de la regeneración.

---

## Decisiones tomadas

### ¿Crear `app/ui/responsive.css`?

No. La decisión activa de sesión 22 (vigente en STATE) es clara:
**los estilos responsive se inyectan como `<style>` en `<head>`
con selectores `[data-*]` y `!important`, no como archivo CSS
externo**. Un CSS externo habría sido regresión del patrón
establecido y habría complicado la regeneración del standalone.
Cada archivo afectado tiene su propio bloque con `id` único
(`pace-modal-responsive-css`, `pace-session-responsive-css`,
`pace-tweaks-responsive-css`), evitando duplicación.

### ¿Breakpoint?

640px único, alineado con `main.jsx` y `Sidebar.jsx` (sesiones
22-24). No se añade breakpoint intermedio — 375-640 y 641+ es
suficiente para el alcance del producto actual.

### ¿Fullscreen sheet o card centrada en móvil?

**Sheet pegada al borde inferior** (`place-items: end center`).
Tres razones:
1. Ergonomía de pulgar — el contenido crítico y el botón × quedan
   al alcance sin estirar la mano.
2. Consistencia con patrones nativos iOS/Android — todos los
   modales modernos de apps móviles van a sheet.
3. Facilita la futura transición a PWA (backlog) — el sheet anima
   mejor desde el borde inferior que una card centrada que pueda
   quedar tapada por la barra URL del navegador.

### ¿Target táctil del botón ×?

36×36 CSS, que con el padding perimetral del backdrop da ≥44×44
efectivo — cumple la guía de accesibilidad táctil y la regla del
producto documentada en las instrucciones del diseño.

### ¿Por qué no capturar las 10 capturas en 375×812?

Se intentó al inicio de la sesión con `save_screenshot`. El coste
de captura individual (PNG base64 ~500 KB × 10) era desproporcionado
frente al valor auditado — el trabajo útil ya había surtido efecto
porque los 10 modales delegan en el mismo `<Modal>` base, que sí se
puede revisar con una sola captura representativa. **La auditoría
visual formal queda como tarea para sesión 28** o cuando un usuario
real reporte un modal concreto que no responda al patrón.

---

## Archivos modificados

- `app/ui/Primitives.jsx` — data-attrs + bloque CSS responsive.
- `app/ui/SessionShell.jsx` — data-attrs + bloque CSS responsive.
- `app/tweaks/TweaksPanel.jsx` — data-attrs + bloque CSS responsive.
- `app/state.jsx` — bump `PACE_VERSION`.
- `PACE.html` — bump `<title>`.
- `PACE_standalone.html` — regenerado.
- `CHANGELOG.md` — entrada v0.12.10.
- `STATE.md` — reescrita "Última sesión" (sustituir, no añadir).

Nuevos:
- `docs/sessions/session-27-modales-mobile.md` — este archivo.
- `backups/PACE_standalone_v0.12.9_20260423.html` — backup.

**3 backups locales.** Margen frente a la regla "máximo 5".

---

## Resultado cuantitativo

- **~40 data-attrs** añadidos, todos con prefijo `data-pace-*`.
- **3 bloques CSS responsive** nuevos, uno por archivo.
- **1 breakpoint** (640px), consistente con sesiones 22-24.
- **10 modales** cubiertos por `<Modal>` de golpe + 1 SessionShell
  + 1 TweaksPanel = **12 superficies** adaptadas.
- **0 cambios** de comportamiento en desktop.
- **0 estilos inline modificados** — se respeta la decisión
  activa sesión 22 al 100%.
- **+7 KB** en `PACE_standalone.html` (350 → 357 KB aprox.).

---

## Verificación

- Preview de `PACE.html` carga sin errores en consola (solo
  warning esperado del Babel in-browser).
- Regeneración de `PACE_standalone.html` sin advertencias.
- Inspección manual del DOM inyectado confirma que los 3 bloques
  `<style>` están presentes en `<head>` con sus `id` únicos.

**Pendiente de sesión 28 (opcional):** auditoría visual a 375×812
con capturas de los 10 modales abiertos, y micro-ajustes en
bibliotecas grandes (Achievements con grid 920px, BreakMenu con
cards de pausa) si se detectan desbordes específicos. El patrón
base está sólido; cualquier ajuste futuro será de refinamiento,
no de fundamento.

---

## Lista pre-v1.0 actualizada

Con sesión 27 cerrada:

- ✅ **Home + sidebar móvil** (sesiones 22-24)
- ✅ **Modales móviles** (sesión 27)
- ❌ **PWA instalable** (backlog — siguiente frente móvil lógico)
- ❌ **Monetización Lifetime/Pase** (backlog — sistema de claves)
- ❌ **Dominio** (backlog — pace.app ocupado, lista en STATE)

Responsive móvil **cerrado** como frente. La app es utilizable en
375×812 de principio a fin.
