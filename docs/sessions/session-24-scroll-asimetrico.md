# Sesión 24 · Scroll asimétrico — auto-hide recuperado en sidebar · v0.12.6 → v0.12.7

**Fecha:** 2026-04-23
**Tipo:** Sesión de código (una sola unidad CSS — cirujano)
**Resultado:** La home mantiene `100dvh` puro (los 4 botones siempre
a la vista, barra del navegador visible sin desbordar). La sidebar
móvil pasa a `min-height: calc(100dvh + 1px)` con `height: auto`,
forzando scroll latente que provoca el auto-hide de la barra de
URL del navegador — recuperando ~56-100px de espacio para el
contenido del drawer.

---

## 📋 Contexto y hallazgo

Tras la sesión 23 (v0.12.6, DVH fit), el usuario probó en su
móvil real y reportó tres síntomas:

1. "Antes se ocultaba la barra del navegador al hacer scroll,
   ahora ya no".
2. "La sidebar sigue teniendo scroll".
3. "La parte home cabe perfecta pero eso ahora ya nunca
   desaparece la dirección/barra del navegador".

Diagnóstico: los tres síntomas tienen la misma causa. Al usar
`100dvh` con `overflow: hidden` en el layout raíz, el documento
mide exactamente el viewport visible — no hay scroll latente →
el navegador no recibe señal de "el usuario quiere más espacio"
→ la barra de URL nunca se recoge → el usuario queda bloqueado
con ~56-100px menos que su dispositivo podría dar.

La sesión 23 arregló el encaje de la home pero eliminó el
auto-hide de la barra — sustituyó un bug por otro.

---

## 🧭 Decisión: scroll asimétrico por vista

Propuesta del usuario (acertada): "¿y si en la barra sí hay
scroll para que desaparezca el buscador y en home no para que
siempre aparezcan todos los botones?".

Así se resuelve sin compromiso:

- **Home** (vista Foco con timer + ActivityBar + 4 botones):
  `100dvh` puro. Los 4 botones siempre caben sin scroll.
  La barra del navegador se queda visible — aceptamos ese coste.
- **Sidebar** (drawer fullscreen móvil): `min-height: calc(100dvh
  + 1px)` → hay un píxel extra que el visible → scroll real →
  el navegador detecta "el usuario quiere espacio" → auto-hide.

El comportamiento depende de qué vista esté mostrándose. Es
intencional.

### Por qué `min-height + 1px` y no otras vías

Probamos mentalmente tres alternativas antes de decidir:

1. **Volver a `100vh` puro en sidebar** — recupera el auto-hide
   pero vuelve el bug de v0.12.5 (contenido cortado con barra
   visible). Inferior.
2. **Fullscreen API (`requestFullscreen`)** — exige gesto
   explícito, no funciona en iPhone (solo iPad), enseña banner
   intrusivo. Malo para una app productiva.
3. **PWA instalada (`manifest.json` + prompt)** — auto-hide
   permanente y sin barra en absoluto. Correcto pero es sesión
   propia (manifest, iconos, prompt de instalación, testing en
   múltiples devices). Queda en backlog para después de modales
   móviles y antes de Lifetime.

`min-height + 1px` es el fix mínimo que hace lo que el usuario
pidió sin romper nada. El píxel extra es invisible.

### El coste conocido, enumerado

- **Primer abrir del drawer con barra URL visible:** el drawer
  aparece con todo encajado en el espacio visible (con barra).
  Primer gesto de scroll hacia abajo → barra se recoge → drawer
  "crece" ~56-100px y respira. A partir del segundo uso (con la
  barra ya oculta del uso previo), el drawer se abre directamente
  expandido. El tirón se ve una vez, no se repite.
- **Auto-hide no instantáneo:** requiere gesto real del usuario.
  Si abre la sidebar y no desliza, la barra se queda. Esto es
  comportamiento estándar de iOS Safari / Chrome Android y no se
  puede forzar desde CSS/JS sin entrar en fullscreen API. Se
  considera aceptable.

---

## 📂 Cambios por archivo

**`app/shell/Sidebar.jsx`** (bloque `pace-sidebar-responsive-css`)
Dentro de `@media (max-width: 768px) [data-pace-sidebar]`, las
cuatro declaraciones de alto se reemplazan:

```css
/* antes (v0.12.6): */
height: 100vh !important;
height: 100dvh !important;
max-height: 100vh !important;
max-height: 100dvh !important;

/* después (v0.12.7): */
min-height: calc(100vh + 1px) !important;
min-height: calc(100dvh + 1px) !important;
height: auto !important;
max-height: none !important;
```

Comentario in-place explica el porqué, la técnica del +1px y el
coste del tirón. El resto del bloque (`position: fixed`, `inset:
0`, `width: 100vw`, `z-index`, `padding`, `border-right`,
`overflow-y: auto`) se conserva idéntico.

**`app/main.jsx`** — sin cambios. La regla
`[data-pace-app-root] { height: 100vh; height: 100dvh; }` se
queda como estaba. Gobierna la home y todas las vistas de main,
que deben caber sin scroll.

**`app/state.jsx`** — `PACE_VERSION` `v0.12.6` → `v0.12.7`.

**`PACE.html`** — `<title>` actualizado a `v0.12.7`.

---

## 🔒 Lo blindado (intacto)

- **Cifras de identidad** — `MM:SS` del timer y `0` del contador
  de racha siguen en EB Garamond italic blindado. Ninguno de los
  cambios toca tipografía.
- **Patrón responsive** — sigue siendo `<style>` inyectado una
  sola vez con selectores `[data-*]` y `!important`.
- **Desktop 1920×1080** — idéntico. El cambio vive dentro de
  `@media (max-width: 768px)`.
- **Home móvil (sesión 22 + 23)** — idéntica. Sigue con los 4
  botones en grid 2×2, aro del Pomodoro contenido por `min(56vh,
  86vw, 520px)`, y el layout raíz con `100dvh`.

---

## ⚙️ Verificación pendiente en device real

En preview desktop no se puede reproducir el auto-hide de la
barra de URL (no existe esa barra). Verificación real queda para
el usuario en su iPhone/Android:

1. Abrir `PACE_standalone.html` desde el móvil con barra URL
   visible.
2. Ver que la home tiene los 4 botones sin scroll (igual que
   v0.12.6) y la barra URL se mantiene.
3. Abrir la sidebar (≡). Primera vez: drawer aparece encajado en
   espacio visible, con barra URL aún visible.
4. Deslizar ligeramente hacia abajo dentro del drawer. La barra
   URL se recoge y el drawer crece ~56-100px.
5. Cerrar y re-abrir la sidebar. Ahora aparece ya expandida (la
   barra sigue oculta del uso previo).

Si algo de esto falla, probablemente es un matiz del navegador
concreto (Chrome Android con tabs apiladas, Firefox mobile con
su barra en la parte inferior) — documentar y decidir.

---

## 🚀 Próximos pasos

Responsive móvil base cierra aquí (sesiones 22, 23, 24).

**Sesión 25 · Modales móviles** — pendiente auditar y, si hace
falta, aplicar el mismo patrón `data-*` + bloque CSS (+ quizá
scroll asimétrico según el contenido del modal) en: `BreatheModule`,
`MoveModule`, `ExtraModule`, `HydrateModule`, `BreakMenu`,
`Achievements`, `WeeklyStats`, `WelcomeModule`, `SupportModule`,
`TweaksPanel`. Prioridad por volumen de uso: `BreakMenu` y
`Achievements` primero.

**Candidata sesión 26+ · PWA instalable** — la respuesta "real"
al problema del auto-hide. Manifest + iconos + prompt de
instalación. Elimina la barra del navegador por completo cuando
el usuario instala PACE a pantalla de inicio. Además es
multiplicador de valor para el Lifetime (compras una vez, la
tienes instalada, funciona offline, sin barra). Anotar en
STATE.md backlog.
