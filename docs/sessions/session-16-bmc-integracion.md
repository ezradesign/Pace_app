# Sesión 16 (2026-04-22) — Integración Buy Me a Coffee

**Versión entregada:** v0.11.11
**Duración / intensidad:** media · feature (frente 1 del plan de
monetización en `STATE.md` anterior).

## Contexto / petición

> "integración buy me a coffe"

Tras la planificación de la sesión 15 (backlog de logros + plan de
monetización), el usuario eligió arrancar por el **Frente 1 completo**:
integrar Buy Me a Coffee respetando los principios éticos del producto
(no freemium, donación voluntaria, calma visual).

Decisiones tomadas antes de picar código (vía formulario):

- Username BMC: **`ezradesign`** → `https://buymeacoffee.com/ezradesign`
- Copy del botón: **3 variantes expuestas como Tweak** (elige el usuario)
- Trigger: **botón permanente en sidebar + auto-modal único a los 7 días
  de racha** (el usuario activo que ya invirtió tiempo es el candidato
  natural para donar; antes de eso, silencio total).
- Wall of Thanks: **no** (rompe la calma visual, y sin backend habría
  que mantenerlo manualmente).
- Logro secreto por donar: **sí, `secret.supporter`** — activable por
  honor con un botón "Ya doné" en el modal. Sin verificación (no hay
  backend); confiar en el usuario es parte del tono.

## ✅ Cambios aplicados

**`app/support/SupportModule.jsx`** *(nuevo, ~290 líneas)* — módulo
autónomo con:
- `SUPPORT_COPY`: 3 variantes (`cafe`, `pasto`, `vaca`) con label y
  title/subtitle diferenciados. Default `cafe`.
- `SupportButton`: pill discreto con icono de taza SVG en `currentColor`.
  Hover suave `paper-3`, sin animación permanente, sin gradiente, sin
  amarillo fosforito. Usa la variante activa del state.
- `SupportModal`: hero con taza terracota sobre círculo `breathe-soft`
  con borde `breathe`, título serif italic **"PACE es gratis. Y lo
  seguirá siendo."**, 3 valores en fila con separadores (`Todo local ·
  Sin tracking · Para siempre`), CTA italic "Si te cuida, ayúdanos a
  cuidarlo. No desbloquea nada. Solo nos da café.", botón terracota
  principal que abre BMC en nueva pestaña + secundario "Copiar enlace"
  con feedback visual (`✓ copiado`), pie con URL + link "Ya doné →"
  que activa `secret.supporter`.
- `useSupportAutoTrigger(setOpen)`: hook que abre el modal **una sola
  vez** cuando `streak.current >= 7` y `supportSeenAt == null`. Se
  dispara con delay de 1.2s tras mount para no competir con toasts de
  logros.
- `BigCup`, `CupIcon`, `Value`: primitivos de presentación locales.
- Objeto de estilos: `supportStyles` (nombre único, regla CLAUDE.md).

**`app/state.jsx`** — añadidos al default state:
- `supportSeenAt: null` — timestamp de la primera apertura. Cuando se
  fija, el auto-trigger ya no se dispara. El usuario puede re-abrir el
  modal manualmente desde el sidebar las veces que quiera.
- `supportCopyVariant: 'cafe'` — variante del copy del botón.
- `PACE_VERSION` → `v0.11.11` (corrige además desfase que arrastraba
  desde sesión 15: state decía `v0.11.9` aunque STATE.md y PACE.html
  decían `v0.11.10`).

**`app/shell/Sidebar.jsx`** — `StatusBar` ampliada:
- Nueva fila entre "En camino · ● Pace" y "Pace vX.Y.Z · by @acuradesign"
  que renderiza `<SupportButton onOpen={dispatch 'pace:open-support'} />`.
- Patrón `CustomEvent` idéntico al de `pace:open-achievements` —
  desacopla el botón del root, igual que el resto del producto.

**`app/main.jsx`** — montado del host + auto-trigger:
- Estado local `openSupport` + `setOpenSupport`.
- Listener para `pace:open-support` que llama `setOpenSupport(true)`.
- Llamada a `useSupportAutoTrigger(setOpenSupport)` en el cuerpo del
  componente (hook sensible a `streak.current` y `supportSeenAt`).
- `<SupportModal>` montado junto al resto de modales.

**`app/tweaks/TweaksPanel.jsx`** — nuevo eje:
- "Copy del botón de apoyo" con las 3 opciones (`cafe`, `pasto`, `vaca`).
  Se añade al final del array `ejes` sin alterar el orden existente
  (el tweak queda bajo "Logo de la vaca").

**`app/achievements/Achievements.jsx`** — nuevo logro y texto:
- Añadido `secret.supporter` al catálogo: categoría `secretos`,
  título "Sostienes el pasto", desc "Apoyaste el proyecto", glifo
  `✦` (chispa cálida, se diferencia del `?` estándar al desbloquearse).
- Añadido a `IMPLEMENTED_ACHIEVEMENTS` (5/21 secretos disponibles).
- Subtitle del modal de logros: `"100 coherentes"` → `"Colección
  creciente"` (evita mentir: ahora son 101).

**`PACE.html`** — carga del módulo + versión:
- `<title>` de `v0.11.10` → `v0.11.11`.
- Nuevo `<script>` para `app/support/SupportModule.jsx` cargado
  **antes** de `Sidebar.jsx` porque éste importa `<SupportButton/>` en
  `StatusBar`.

## 📁 Archivos modificados
- `app/support/SupportModule.jsx` (nuevo, módulo completo)
- `app/state.jsx` (2 campos nuevos + bump `PACE_VERSION`)
- `app/shell/Sidebar.jsx` (StatusBar amplía con SupportButton)
- `app/main.jsx` (listener `pace:open-support` + auto-trigger + montaje modal)
- `app/tweaks/TweaksPanel.jsx` (+ eje `supportCopyVariant`)
- `app/achievements/Achievements.jsx` (+ `secret.supporter` + set + copy)
- `PACE.html` (carga de módulo + bump title)

## 🔒 Red de seguridad
- `PACE.html` carga limpio (consola sin errores).
- Verificación funcional con `eval_js_user_view`:
  - `pace:open-support` → modal se abre con "PACE es gratis".
  - Cambiar `supportCopyVariant` a `vaca`/`pasto` → copy del pill y
    del botón primario se actualizan en vivo.
  - Click en "Ya doné" → `state.achievements['secret.supporter']`
    queda desbloqueado + `supportSeenAt` se marca con timestamp.
- `PACE_standalone.html` regenerado a **v0.11.11** (~198 KB, crece
  ~16 KB respecto a v0.11.10 por el módulo nuevo + cambios).
- Backup rotado: `backups/PACE_standalone_v0.11.10_20260422.html`
  añadido. Quedan activos v0.11.9 y v0.11.10 (dentro del límite de 5).

## 🎯 Por qué esta sesión

El usuario arrancó el frente de monetización del plan de STATE.md
anterior. La integración respeta los 3 principios planteados en ese
documento:

1. **Presencia visible pero calmada** — pill sutil en el footer del
   sidebar, no en zonas de foco. No parpadea, no interrumpe.
2. **Razón explícita para pagar** — el modal comunica filosofía (todo
   local, sin tracking, para siempre) antes que pedir dinero. Así la
   gente paga por valores, no por escasez.
3. **Momento elegido, no impuesto** — auto-trigger único a los 7 días
   de racha; nunca al arrancar, nunca bloqueando flujos. Después de
   verlo una vez, el modal solo se abre manualmente desde el sidebar.

El logro `secret.supporter` por honor (sin verificación) alinea con el
resto del tono del producto: confianza sobre control.

## 📋 Backlog abierto al cerrar

- **Fruta fácil restante (sesión corta #1 del plan original):**
  6 tweak-secrets en ~1h (`secret.aged`, `.dark.mode`, `.mono`, `.seal`,
  `.illustrated`, `explore.tweaks`) + sonidos sutiles (3-4 WAV CC0 de
  freesound.org) + `streak.14/30/60/365`. Bajaría "Próximamente" de
  19 a ~10.
- **Chrome Extension** (sesión larga siguiente según plan): popup
  340×480 + new tab, reutilizando toda la modularidad actual del
  proyecto. Triplica superficie de CTA de BMC.
- **Notificaciones de agua**: state ya conserva `reminders: []` por
  decisión activa — sería reintroducir UI modal + Web Notifications API.
- **Supporter count real** (post-BMC en producción): si la herramienta
  ofrece algún endpoint público con contador de supporters, se podría
  mostrar sutilmente en el modal ("X personas han regado el pasto").
  No crítico; decidido **no Wall of Thanks** en esta sesión.

## ⚠️ Decisiones tomadas

- **Donar no desbloquea nada funcional** — `secret.supporter` es un
  sello visible en la colección, nada más. Sin verificación, solo
  honor. El intento de sumar unlocks tangibles rompería el
  diferencial ético de PACE. Sesión 16.
- **El logro secreto por donar es activable por honor**, con el botón
  "Ya doné" en el modal. Cuando se desbloquea, el toast aparece como
  cualquier otro secreto. `secret.supporter` **sí** entra en
  `IMPLEMENTED_ACHIEVEMENTS` (a diferencia de otros secretos sin
  trigger): su trigger existe, es manual. Sesión 16.
- **Auto-trigger único, inhibido por `supportSeenAt`**. El
  timestamp se fija al abrir el modal por cualquier vía (auto o
  manual) vía `useEffect` en el propio `SupportModal`. Si algún día
  se quiere resetearlo para re-engage, basta con exponer un tweak
  dev-mode — no urgente. Sesión 16.
- **`BMC_USERNAME = 'ezradesign'` es hard-coded en `SupportModule.jsx`**.
  No se expone como tweak porque el username identifica al autor del
  producto, no al usuario. Si se fork-ea el proyecto, basta con
  cambiar esa constante. Sesión 16.
