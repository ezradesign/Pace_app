# Sesión 23 · DVH fit — encaje móvil con barra de URL · v0.12.5 → v0.12.6

**Fecha:** 2026-04-23
**Tipo:** Sesión de código (una sola unidad CSS — cirujano)
**Resultado:** El sidebar fullscreen y el layout raíz móvil usan
`100dvh` (dynamic viewport height) con fallback a `100vh`. El
contenido cabe en el espacio realmente visible del navegador,
aparezca o desaparezca la barra de URL.

---

## 📋 Contexto

La sesión 22 (v0.12.5) dejó el responsive móvil funcional con un
caveat importante observado por el usuario:

> "El contenido (sidebar completo y home con los 4 botones de
> actividades) solo encaja sin scroll cuando la barra de URL del
> navegador está oculta."

Síntoma: el sidebar fullscreen se medía a `100vh`, y `vh` siempre
se resuelve al **alto máximo del viewport** (el que tiene el
navegador cuando oculta la barra de URL). Con la barra de URL
desplegada, el contenido del sidebar se desborda unos ~56px y
aparece scroll. Lo mismo con la home cuando la ActivityBar roza
el borde inferior.

Solución: `100dvh` (dynamic viewport height), que se recalcula
en vivo según el espacio **realmente visible**.

---

## 🧭 Decisión técnica

### Fallback + upgrade progresivo, no media queries nuevas

Patrón CSS estándar de dos líneas:

```css
height: 100vh;   /* fallback para navegadores antiguos */
height: 100dvh;  /* navegadores modernos: prevalece */
```

El navegador coge la última que entiende. Navegadores con soporte
dvh (iOS Safari 15.4+, Chrome Android 108+, Firefox 101+) usan
`100dvh`. Navegadores antiguos lo ignoran y se quedan con
`100vh`. Cero lógica, cero user-agent sniffing.

Soporte dvh a día de hoy (abril 2026) cubre ~97% del tráfico
móvil. El fallback protege el ~3% restante — siguen teniendo el
bug de v0.12.5, pero no ven una página rota.

### Por qué aplicarlo también fuera de @media (max-width: 768px)

El usuario preguntó si conviene cambiarlo en desktop o sólo en
móvil. Decisión: **aplicar siempre**. Razones:

1. En desktop (1920×1080 sin barra URL dinámica) `100dvh ===
   100vh`. No hay regresión posible — matemática idéntica.
2. Si en el futuro PACE se abre como PWA sin barra, o en una
   ventana redimensionada con navegador con barra visible, el
   comportamiento ya es correcto sin tocar nada más.
3. Mantener la regla "fuera de media query" evita un if-else
   arbitrario: la unidad moderna es la misma en los dos casos.

### Por qué extraer el `height` del objeto inline de `main.jsx`

El div raíz tenía `style={{height:'100vh', maxHeight:'100vh',…}}`
inline. Un objeto JS **no puede expresar dos valores para la
misma propiedad con cascada** (`height:'100vh'` después
`height:'100dvh'` — el segundo sobreescribe al primero en el
objeto, no convive). CSS puro sí puede, porque el motor de
cascada acepta múltiples declaraciones y se queda con la última
válida. Solución: añadir `data-pace-app-root` al div raíz y
mover **sólo** las dos propiedades de alto al bloque CSS
inyectado (`pace-main-responsive-css`), en una regla fuera de
`@media` para que aplique siempre.

El resto del objeto inline (`display`, `overflow`, `background`,
`position`) se queda tal cual — no necesita cascada de fallback.

Coherente con la regla activa de sesión 22: "los estilos
responsive se inyectan como `<style>` con selectores `[data-*]`".

---

## 📂 Cambios por archivo

**`app/shell/Sidebar.jsx`** (bloque `pace-sidebar-responsive-css`)
- Dentro de `@media (max-width: 768px) [data-pace-sidebar] { … }`:
  se duplica `height` y `max-height` con el patrón fallback.
  Comentario in-place explica el porqué y la ventana de soporte.

**`app/main.jsx`** (bloque `pace-main-responsive-css`)
- Nueva regla CSS **fuera de @media** (aplica desktop + móvil):
  `[data-pace-app-root] { height: 100vh; height: 100dvh;
  max-height: 100vh; max-height: 100dvh; }`
- El div raíz de `PaceApp` recibe `data-pace-app-root` y pierde
  `height` / `maxHeight` de su objeto inline (delegados al CSS
  para poder expresar el fallback). Se conservan `display`,
  `overflow`, `background`, `position` inline.

**`app/state.jsx`** — `PACE_VERSION` `v0.12.5` → `v0.12.6`.

**`PACE.html`** — `<title>` actualizado a `v0.12.6`.

---

## 🔒 Lo blindado (intacto)

- **Cifras de identidad** — `MM:SS` del timer y `0` del contador
  de racha siguen en EB Garamond italic explícito. No se ha
  tocado ni `FocusTimer.jsx` ni `Sidebar.jsx` en su tipografía.
- **Patrón responsive** — sigue siendo `<style>` inyectado una
  sola vez, selectores `[data-*]`, `!important` sobre inline.
  No se añaden media queries nuevas; sólo se edita el contenido
  de las que ya existían.
- **Desktop 1920×1080** — idéntico. `100dvh === 100vh` cuando no
  hay UI dinámica que descontar. Verificado en preview: el root
  tiene `height: 574.4px` con `innerHeight: 574` — cuadra.

---

## ⚙️ Verificación

En preview (desktop):
- `[data-pace-app-root]` resuelve `height: 574.4px` y
  `max-height: 574.4px`, coincidiendo con `window.innerHeight`.
- Ambos bloques CSS contienen simultáneamente `100vh` y `100dvh`
  (fallback + override).

Verificación móvil real (pendiente en device del usuario):
- Abrir el standalone regenerado en Safari iOS / Chrome Android
  con la barra de URL desplegada.
- Confirmar que sidebar fullscreen y home con ActivityBar caben
  sin scroll sin ocultar la barra de URL.

---

## 🚀 Próximos pasos

Responsive móvil cierra aquí. Queda pendiente para próxima
sesión revisar los modales (Respira, Mueve, Achievements, Stats,
Tweaks, Welcome, Support) — si alguno pasara de ~100dvh en
móvil, aplicar el mismo patrón `data-*` + bloque CSS. Esta
sesión sólo tocó sidebar + layout raíz porque eran los dos sitios
con reglas de alto activas.

Tras eso, candidato natural: **loop post-Pomodoro** o el combo
de **3 triggers de primeros pasos + rachas largas + sonidos
sutiles**. Ver STATE.md para ambos.
