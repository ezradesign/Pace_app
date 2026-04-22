# PACE · Estado del proyecto

> **Actualiza este archivo al final de cada sesión de trabajo.**
> **Sigue el protocolo de `CLAUDE.md` > "PROTOCOLO DE SEGURIDAD (OBLIGATORIO)".**

**Versión actual:** v0.11.3
**Última actualización:** 2026-04-22 17:16 · Sesión 8 — Logo oficial v2, Tweaks en topbar-derecha, sidebar sin recordatorios, viewport 1920×1080 sin scroll.

---

## 🚜 Sesión 8 (2026-04-22 · 17:16) — Logo oficial v2 + Tweaks topbar-derecha + cabida 1920×1080

### ✅ Cambios aplicados

**Logo oficial v2 (`app/ui/CowLogo.jsx`):**
- Añadido componente `PaceLogoImage` que renderiza el PNG oficial del usuario
  con `mix-blend-mode: multiply` para fundirlo con el paper del sidebar.
- URL final del logo (v2, entregado a las 17:16):
  `https://www.genspark.ai/api/files/s/gv4cpVUt` — vaca integrada en la P de
  "Pace." con subtítulo "Touch grass, even from your desk", fondo blanco sólido.
  La URL anterior (`SgJczZET`) tenía un fondo cream con más ruido; queda
  reemplazada.
- `PaceWordmark` ahora siempre devuelve el logo oficial, independientemente del
  `state.logoVariant`. El pictograma de la vaca + título "Pace." anterior queda
  sustituido por la imagen.
- Las variantes legacy (`lineal` / `sello` / `ilustrado` / `lockup`) quedan en el
  código pero no se renderizan; se pueden reactivar quitando el `return` del
  default si se quisiera volver al wordmark SVG.

**Tweaks en TopBar-derecha (`app/main.jsx`):**
- Iteración final: el botón de Tweaks (icono de engranaje) queda en el **TopBar
  a la derecha de todo**, justo a la derecha del icono de Logros. Orden final del
  TopBar: **Stats · Logros · Tweaks**.
- Se descartó la iteración intermedia de FAB flotante top-left: el usuario prefirió
  tener Tweaks en el TopBar junto a los otros iconos.
- El atajo `T` sigue activo.

**Sidebar (`app/shell/Sidebar.jsx`):**
- **Sección Recordatorios eliminada** (apartado de "anotaciones"). El estado
  `state.reminders` se conserva internamente por si se reintroduce, pero la UI ya
  no la expone. Liberamos ~220 px de altura en el sidebar.
- Estados `reminderInput` / `reminderMin` y helpers `addReminder`/`removeReminder`
  también eliminados (código muerto).
- `logoRow` centra verticalmente el logo con `minHeight: 48` (para que la imagen
  respire). El `padding-left: 34` temporal (cuando había FAB top-left) fue
  retirado — ya no hace falta esquivar nada.
- El contenedor `<aside>` usa `height: 100vh` + `overflow-y: auto` como red de
  seguridad: si algún día se reintroducen secciones, el sidebar scrollea él solo
  sin romper el layout global.

**Layout global (`app/main.jsx`):**
- El wrapper principal pasa de `minHeight: 100vh` a `height / maxHeight: 100vh` +
  `overflow: hidden`. Ahora la interfaz encaja exactamente en 1920×1080 (y se
  adapta al navegador) sin scroll derecho.
- El `<main>` y el contenedor del FocusTimer llevan `minHeight:0 + overflow:hidden`
  para que flex reparta el espacio correctamente sin desbordar.
- `ActivityBar` y `TopBar` compactados ligeramente (paddings reducidos, `flexShrink:0`).
- Arranque doble del `<PaceApp/>` corregido: `app/main.jsx` ahora sólo crea su
  propio root si existe `#pace-root`. En `PACE.html` monta el script en `#root`
  al final (como ya hacía).

### 📁 Archivos modificados
- `app/ui/CowLogo.jsx` (`PaceLogoImage` nuevo · `PaceWordmark` siempre usa el PNG · URL actualizada a gv4cpVUt)
- `app/main.jsx` (Tweaks añadido a TopBar como última posición · layout full-height · `ActivityBar` compactada)
- `app/shell/Sidebar.jsx` (sin Recordatorios · sidebar con scroll interno · logoRow con min-height)
- `PACE.html` (bump de título a v0.11.3 · 17:16)

### 🔒 Red de seguridad
- ✅ `PACE_standalone.html` regenerado a **v0.11.3** (ver commit de la sesión).
- ✅ `backups/PACE_standalone_v0.11.2_20260422.html` (rotado desde v0.11.2).
- ⚠️ **El logo oficial está referenciado por URL externa** (`genspark.ai/.../gv4cpVUt`).
  Para que el standalone funcione 100% offline sin conexión hay que descargar el
  PNG a `app/ui/pace-logo.png` y sustituir la constante `PACE_LOGO_URL` en
  `CowLogo.jsx` por la ruta relativa. El sandbox de esta sesión no tuvo red para
  automatizarlo. Pendiente para próxima sesión.

### 🎯 Por qué esta sesión
El usuario pidió:
1. Insertar el logo oficial que nos pasó adjunto (primer PNG, luego una versión
   mejorada a las 17:16 con fondo blanco sólido y trazos más limpios).
2. Mover el icono de Tweaks — primero probamos "a la izquierda de todo" (FAB
   flotante top-left), pero en la iteración final se dejó **en el TopBar a la
   derecha de Logros**, que es donde vivía ya junto a Stats.
3. Eliminar el apartado de "anotaciones" del sidebar. Interpretamos
   **Recordatorios** (el apartado más voluminoso con input + lista).
4. Hacer que toda la interfaz quepa en 1920×1080 sin scroll y se adapte al
   navegador → logrado con `height: 100vh + overflow: hidden` y compactando
   paddings internos.

La **Intención** (textarea corta) se conserva porque aporta carácter y ocupa poco.

---

## 🚜 Sesión 7 (2026-04-22 · 16:44) — Sidebar colapsable + Sendero + logo Pace.

### ✅ Cambios aplicados

**Logo nuevo (`app/ui/CowLogo.jsx`):**
- `PaceLockup` — la vaca se integra en la letra "P" (lomo + cabeza inclinada paciendo con cuernito y oreja), hierba al pie, "ace." en cursiva serif verde oliva y punto terracota final.
- `PaceWordmark` reescrito para detectar `variant === 'pace'` y delegar en `PaceLockup`; variantes legacy `lineal/sello/ilustrado` conservan comportamiento anterior.
- `state.logoVariant` default cambiado de `'lineal'` a `'pace'` en `app/state.jsx`.
- Añadida opción `{ v: 'pace', name: 'Pace. (lockup, default)' }` como primera del eje de logo en `TweaksPanel`.

**Sidebar reescrito (`app/shell/Sidebar.jsx`):**
- Añadido estado `sidebarCollapsed` (en `app/state.jsx`) y lógica para togglear entre 280 px expandido y 56 px en rail.
- Toggle chevron en cabecera (arriba a la derecha del logo) cuando está expandido.
- Modo colapsado: rail vertical con atajos visuales (número de días, icono logros con contador, icono campana recordatorios, chevron inverso para expandir).
- **Sección Plan eliminada** — los chips interactivos (Muévete/Respira/Extra/Hidrátate) ya no aparecen. El estado `plan.*` se conserva internamente para ActivityBar y logros.
- **Sección Sendero añadida** (componente `SenderoDelDia`):
  - SVG 240×46 px con curva cuadrática horizontal empalmada representando el arco del día 6h→22h.
  - Puntos circulares en la curva marcan hitos reales del día: pomodoros (focus), respiraciones, movimientos, vasos de agua — cada uno con su color de módulo.
  - Pointer negro pequeño sobre la curva indica la hora actual.
  - Debajo: "6h … ahora · HH:MM … 22h" en cursiva.
  - Cabecera con contador dinámico `N hitos`.
- Mensaje placeholder italic cuando no hay recordatorios.
- Altura máxima de la lista de recordatorios con scroll para que no rompa el layout ahora que hay más espacio.

**Tweaks reubicado (`app/main.jsx`):**
- El FAB flotante `fabStyles.tweaks` (bottom-right) ya fue eliminado en sesión previa.
- El TopBar ahora agrupa los 3 iconos arriba a la derecha en este orden: Tweaks (gear) · Stats (chart) · Logros (trophy).
- Atajo `T` sigue activo.

### 📁 Archivos modificados
- `app/ui/CowLogo.jsx` (nuevo componente `PaceLockup`, modificada fábrica `PaceWordmark`)
- `app/shell/Sidebar.jsx` (reescrito: toggle, Sendero, sin Plan, recordatorios con placeholder)
- `app/state.jsx` (default `logoVariant: 'pace'`, añadido `sidebarCollapsed`)
- `app/tweaks/TweaksPanel.jsx` (opción `pace` en logo)

### 🔒 Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.2** (166 KB)
- `backups/PACE_standalone_v0.11.1_20260422.html` (backup previo rotado)
- `backups/PACE_standalone_v0.11.0_20260422.html` (backup aún más antiguo)

### 🎯 Por qué esta sesión
Pulir la presentación del Home antes de llevar todo a GitHub:
- El logo nuevo refuerza la identidad "Pace. · ritmo propio" con la vaca como protagonista visual.
- La barra colapsable libera espacio en pantallas pequeñas y da al usuario control sobre qué ver.
- Sendero vuelve visible el avance del día sin abrumar: una línea con hitos.
- Quitar Plan libera espacio útil; la ActivityBar inferior ya hace ese trabajo.
- Tweaks en el top-right es más consistente con stats y logros y libera la esquina inferior.

---

## 🎨 Sesión 6 (2026-04-22 · 16:35) — Iconos ActivityBar restaurados

### ✅ Cambios aplicados

**`app/main.jsx` — Barra de Actividades rehecha:**
- 4 iconos SVG nuevos, coincidentes con la imagen de referencia del usuario:
  - **Respira** → pulmones anatómicos con tráquea y bronquios
  - **Estira** → figura en postura de puente/arco con cabeza circular
  - **Mueve** → mancuerna horizontal (dos discos a cada lado de la barra)
  - **Hidrátate** → gota con highlight interior
- Layout de tarjeta **cambiado** de vertical (column) a horizontal (row): icono a la izquierda, bloque de texto a la derecha
- **Sublabels añadidos** en italic serif pequeña:
  - Respira · *ritmo, calma*
  - Estira · *afloja tensión*
  - Mueve · *cuerpo activo*
  - Hidrátate · *agua ahora*
- Iconos ampliados de 22×22 a 26×26 para el nuevo layout más ancho
- Tarjetas con `minWidth: 180`, padding `16px 22px`, gap de 16px entre icono y texto

### 📁 Archivos modificados
- `app/main.jsx` (3 edits: array activities con sub, button layout horizontal, 4 componentes SVG reescritos)

### 🔒 Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.1** (154 KB)
- `backups/PACE_standalone_v0.11.0_20260422.html` (backup previo v0.11.0 rotado)

### 🎯 Por qué esta sesión
El usuario había iterado estos iconos en una sesión previa pero se quedó sin contexto antes de consolidarlos; los pulmones, puente, mancuerna y gota se habían perdido en el código modular actual, que tenía versiones simplificadas (círculo+cruz, palito con brazos, flechas). Se restauran según la imagen de referencia, con el extra de sublabels y layout horizontal editorial.

---

## 🏗️ Sesión 5 (2026-04-22) — Fortalecimiento del proyecto

### ✅ Cambios aplicados

**Archivos meta añadidos:**
- `README.md` — presentación pública del proyecto para GitHub (badges, módulos, cómo abrir, stack, estructura, tweaks, inspiración)
- `.gitignore` — excluye basura del sistema (.DS_Store, node_modules, screenshots/, temporales) + carpeta espejo `Pace_app/`
- `CHANGELOG.md` — historial humano v0.9 → v0.11.0 con formato Keep-a-Changelog
- `ROADMAP.md` — visión corto / medio / largo plazo extraída de HANDOFF, + "fuera de alcance" como anclaje

**`CLAUDE.md` — regla nueva:**
- Carpeta espejo `Pace_app/` debe sincronizarse 1:1 con cada cambio del proyecto
- Facilita descarga y sync con GitHub Desktop sin reestructurar

### 📁 Archivos nuevos
- `README.md`, `.gitignore`, `CHANGELOG.md`, `ROADMAP.md`
- Todos espejados en `Pace_app/`

### 🎯 Por qué esta sesión
Fortalecer la base antes de atacar features nuevas:
- GitHub ahora muestra README pegado al entrar al repo (no parece abandonado)
- `.gitignore` evita ensuciar el repo con archivos del sistema
- Historial y visión separados de STATE para no mezclar "lo último" con "el plan"

---

## 🔧 Sesión 4 (2026-04-22) — Reorganización modular post-GitHub

### Contexto
Proyecto importado desde `github.com/ezradesign/Pace_app`. El repo contenía todos los JSX en raíz plana + `PACE_standalone.html` como único entry point. La estructura documentada en `CLAUDE.md`/`HANDOFF.md` describe una organización modular con subcarpetas y un `PACE.html` de desarrollo que aquí faltaba.

### ✅ Cambios aplicados

**Reorganización de archivos** (plano → modular):
- `tokens.css` → `app/tokens.css`
- `state.jsx` → `app/state.jsx`
- `main.jsx` → `app/main.jsx`
- `Primitives.jsx` / `CowLogo.jsx` / `Toast.jsx` → `app/ui/`
- `Sidebar.jsx` → `app/shell/`
- `FocusTimer.jsx` → `app/focus/`
- `BreatheModule.jsx` → `app/breathe/`
- `MoveModule.jsx` → `app/move/`
- `ExtraModule.jsx` → `app/extra/`
- `HydrateModule.jsx` → `app/hydrate/`
- `BreakMenu.jsx` → `app/breakmenu/`
- `Achievements.jsx` → `app/achievements/`
- `WeeklyStats.jsx` → `app/stats/`
- `TweaksPanel.jsx` → `app/tweaks/`

**Creado `PACE.html`** — entry point de desarrollo con:
- React 18.3.1 + ReactDOM + Babel standalone (pinneado con SRI)
- Carga ordenada de todos los JSX (state → ui → shell → módulos → main)
- Montaje de `<PaceApp/>` con retry loop (los `<script type="text/babel" src>` se compilan async, así que espera a que `PaceApp` exista en `window` antes de montar)
- `PACE_standalone.html` preservado como backup funcional offline

### 📁 Archivos modificados/creados
- `PACE.html` (nuevo — entry point modular)
- Todos los JSX/CSS movidos a `app/**`

### 🔒 Red de seguridad
- `PACE_standalone.html` (v0.10, preservado intacto)
- `PACE.html` (nuevo, verificado con screenshot — carga limpia)

---

## 🔄 Flujo de trabajo recomendado (para sesiones futuras)

Para aprovechar al máximo el contexto disponible, sigue este orden en cada sesión:

### 1. Al abrir una sesión
- Leer `CLAUDE.md`, `STATE.md`, `DESIGN_SYSTEM.md` (siempre)
- Listar `app/` para confirmar estructura actual
- Si la sesión es para un módulo específico, leer SOLO ese JSX (no todos)

### 2. Durante el trabajo
- **Ediciones quirúrgicas** con `str_replace_edit` en vez de reescribir archivos enteros
- **Verificar tras cada cambio funcional** con `done` / screenshot (consume pocos tokens)
- **NO hacer screenshots proactivos** de verificación — delegar al `fork_verifier_agent`
- **Mantener commits frecuentes** (cada `write_file`/`str_replace_edit` versiona auto)

### 3. Antes de cerrar la sesión
- Actualizar `STATE.md` (sesión nueva, cambios, pendientes, decisiones)
- Si hubo cambios significativos → regenerar `PACE_standalone.html` con `super_inline_html`
- Rotar backup anterior a `backups/PACE_standalone_vX.Y_YYYYMMDD.html`
- Actualizar `DESIGN_SYSTEM.md` / `CONTENT.md` / `HANDOFF.md` si aplica

### 4. Para subir a GitHub
El sistema versiona automáticamente cada cambio. Para sincronizar con el repo de GitHub:
- Descargar el proyecto con `present_fs_item_for_download` (o copiar archivos sueltos)
- Hacer `git add . && git commit -m "..." && git push` en tu local
- Alternativa: usar GitHub Desktop y arrastrar los archivos descargados sobre la carpeta local del repo

**Tip de tokens:** cuando termines una iteración clara (ej: "pulido de Respira"), el sistema snipea automáticamente el contexto viejo al detectar presión. No necesitas hacer nada manual.

---

## 🎨 Sesión 3 (2026-04-22) — Pulido del core

### ✅ Cambios aplicados

**Módulo Respira** (pulido profundo):
- **Fase de preparación** — cuenta atrás 3s con número gigante italic terracota + mensaje "Siéntate cómodo. Respira natural." + botón "Empezar ahora" para saltar
- **Fase de retención explícita** en técnicas con rondas — pantalla dedicada "Retén sin aire" con cronómetro gigante + botón "Respirar de nuevo"
- **Logros de apnea** se desbloquean en tiempo real (60s / 90s / 2min)
- **Countdown visible** dentro del círculo en fases ≥4s (número terracota bajo el label)
- **Pantalla de completado** con círculo de check, stats (tiempo/rondas/respiraciones) y mensaje "Observa cómo te sientes antes de volver"
- **Atajos de teclado**: Espacio (pausar), Esc (salir), Enter (avanzar en hold/done)
- **Leyenda de atajos** sutil en la parte inferior

**Módulo Mueve** (pulido profundo):
- **Fase de preparación** — misma estructura en ocre (`--move`)
- **Glifo placeholder por paso** — círculo dashed con símbolo italic rotativo (◯◬◇△▢⬡✦), mientras no hay ilustraciones reales
- **Preview del siguiente paso** bajo la regla de progreso ("Siguiente: …")
- **Pantalla de completado** con stats (tiempo/pasos) y mensaje "El cuerpo vuelve a sentirse tuyo"
- **Atajos de teclado**: ←/→ (navegar pasos), Espacio (pausar), Esc (salir), Enter (volver tras completar)

**Librerías (modales)**:
- Tarjetas de rutina **rediseñadas** — jerarquía más clara: tag arriba, título italic grande, descripción, línea divisoria dashed, código y duración destacados en color del módulo
- **Indicador ⚠️** en esquina superior derecha de rutinas con `safety: true`

**Componentes compartidos**:
- `SessionHeader` extraído y reutilizado entre módulos
- `Stat` / `MoveStat` helper para stats de pantalla "completado"
- `StepGlyph` para placeholder visual hasta tener ilustraciones

### 📁 Archivos modificados
- `app/breathe/BreatheModule.jsx` (session reescrita con stages + stats + keyboard shortcuts)
- `app/move/MoveModule.jsx` (session reescrita con mismas mejoras)

### 🔒 Red de seguridad actualizada
- `PACE_standalone.html` **v0.10** (152 KB)
- `backups/PACE_standalone_v0.9.2_20260422.html` (rotado)
- `backups/PACE_standalone_v0.10_20260422.html` (nuevo)

---

---

## 🎨 Sesión 2 (2026-04-22) — Refinamiento post-feedback

### ✅ Cambios aplicados
- **ActivityBar rediseñada** estilo editorial (inspirada en imagen de referencia del usuario):
  - Tarjetas blancas cream con borde fino y sombra suave
  - Iconos en terracota, stroke 1.2 (más fino y elegante)
  - Labels en serif italic (EB Garamond / Cormorant) con color tinta
  - Indicador de estado activo: punto pequeño en esquina superior derecha
  - Hover suave con elevación
  - "Extra" → renombrado a **"Estira"** (mejor coherencia con Strengthside)
  - Nuevos iconos custom: círculo+cruz (Respira), figura zen (Estira), flecha doble (Mueve), gota (Hidrátate)
- **Tipografía display default** → Cormorant Garamond (antes EB Garamond)
- **Nuevo tweak de timer "Aro"** (default) — híbrido círculo + barra:
  - Arco grueso terracota con punto indicador
  - Número gigante italic en el centro
  - Micro-barra inferior como guiño al estilo "barra"
- **Nuevo tweak de respiración "Flor"** (default) — híbrido pulso + pétalo:
  - Anillos concéntricos pulsando
  - Pétalos suaves girando muy lento (rotación sincronizada con progreso)
  - Núcleo luminoso con gradiente radial
- Tweaks reordenados: híbridos recomendados aparecen primero como default

---

## 🔒 Estado de la red de seguridad

| Archivo | Estado | Última actualización |
|---|---|---|
| `CLAUDE.md` | ✅ Con protocolo obligatorio + espejo `Pace_app_HH_MM/` | 2026-04-22 |
| `STATE.md` | ✅ Este archivo | 2026-04-22 16:35 |
| `CHANGELOG.md` | ✅ Historial v0.9 → v0.11.1 | 2026-04-22 16:35 |
| `DESIGN_SYSTEM.md` | ✅ Tokens completos | 2026-04-22 |
| `CONTENT.md` | ✅ Rutinas + 100 logros | 2026-04-22 |
| `HANDOFF.md` | ✅ Doc completa para retomar | 2026-04-22 |
| `ROADMAP.md` | ✅ Corto/medio/largo plazo | 2026-04-22 |
| `README.md` | ✅ Presentación para GitHub | 2026-04-22 |
| `PACE_standalone.html` | ✅ **v0.11.2** (166 KB, offline) | 2026-04-22 16:44 |
| `backups/` | ✅ `v0.11.1_20260422` + `v0.11.0_20260422` (2 backups) | 2026-04-22 16:44 |

---

## ✅ Hecho (Sesión 1)

### Infraestructura y documentación
- [x] `CLAUDE.md` con protocolo de continuidad y arquitectura
- [x] `STATE.md` (este archivo) — estado del proyecto
- [x] `DESIGN_SYSTEM.md` con tokens finales (paleta, tipografía, espaciado, componentes)
- [x] `CONTENT.md` con catálogo completo de rutinas + 100 logros

### Código base
- [x] `PACE.html` — entry point con scripts pinneados (React + Babel)
- [x] `app/tokens.css` — variables CSS para 3 paletas + 3 tipografías
- [x] `app/state.jsx` — store global con localStorage y acciones
- [x] `app/ui/Primitives.jsx` — Modal, Card, Tag, Button, Divider, Meta
- [x] `app/ui/CowLogo.jsx` — 3 variantes del logo (lineal, sello, ilustrado) + wordmark
- [x] `app/ui/Toast.jsx` — notificaciones de logros desbloqueados

### Shell
- [x] `app/shell/Sidebar.jsx` — sidebar completo con:
  - Wordmark PACE
  - Contador de ciclos, streak, días activos
  - Sección RITMO con número grande y semana de dots
  - Sección PLAN con chips tipo pill interactivos
  - Sección LOGROS con preview de 5 sellos
  - Sección RECORDATORIOS con add/remove
  - Sección INTENCIÓN (textarea italic)
  - Footer con versión y "by @acuradesign"

### Módulo Foco (100% funcional)
- [x] `app/focus/FocusTimer.jsx` con:
  - Timer real que cuenta (setInterval)
  - Selector modo: Foco / Pausa / Larga
  - Selector minutos: 15/25/35/45
  - **4 estilos visuales** (tweak): número, círculo con progress, barra, analógico
  - Controles: Comenzar/Pausar + Reset
  - Dots de ciclo
  - Al completar Pomodoro → llama completePomodoro() → desbloquea logros + abre BreakMenu

### Módulo Respira (funcional)
- [x] `app/breathe/BreatheModule.jsx` con:
  - **Librería** con 12 técnicas en 5 categorías (Energía, Equilibrio, Balance, Relajación, Pranayama)
  - **Modal de seguridad** para técnicas con apnea (checkbox obligatorio)
  - **Sesión guiada** a pantalla completa con:
    - Círculo animado (**4 estilos tweak:** pulso, ondas, pétalo, orgánico)
    - Fase actual grande (Inhala / Sostén / Exhala / …)
    - Contador de rondas
    - Dots de progreso
    - Pausar/Terminar

### Módulo Mueve (funcional)
- [x] `app/move/MoveModule.jsx` con:
  - **Librería** con 7 rutinas (Antídoto silla, Caderas, Hombros, ATG, Ancestral, Cuello, Escritorio express)
  - **Sesión con pasos** a pantalla completa:
    - Nombre del paso grande en italic
    - Cue (indicación) debajo
    - Countdown en segundos
    - Regla de progreso por paso
    - Anterior/Pausar/Siguiente

### Módulo Extra (funcional, reusa MoveSession)
- [x] `app/extra/ExtraModule.jsx` con 7 rutinas de calistenia oficina

### Módulo Hidrátate (funcional)
- [x] `app/hydrate/HydrateModule.jsx` con:
  - Contador gigante X/8
  - Vasos visuales que se "llenan" al click
  - Barra de progreso
  - Botones + / −
  - Tip motivacional

### Menú post-Pomodoro
- [x] `app/breakmenu/BreakMenu.jsx` — aparece tras cada ciclo de Foco
  - 3 tarjetas grandes: Respira / Muévete / Hidrátate
  - Botón "Saltar esta pausa"

### Logros (100 sellos)
- [x] `app/achievements/Achievements.jsx` con:
  - Catálogo completo de 100 logros en 6 categorías
  - Modal con contador grande + preview por categoría
  - Sellos circulares (estética "libreta de campo")
  - Secretos ocultos como "?"

### Stats semanales
- [x] `app/stats/WeeklyStats.jsx` con:
  - 4 totales (foco min, breath min, move min, vasos agua)
  - 4 gráficos de barras por día (L-M-X-J-V-S-D)
  - Hoy marcado con opacidad 1

### Tweaks (6 ejes)
- [x] `app/tweaks/TweaksPanel.jsx` — panel flotante bottom-right con:
  1. **Paleta:** crema / oscuro / envejecido
  2. **Tipografía:** EB Garamond / Cormorant / JetBrains Mono
  3. **Layout:** sidebar / minimal / editorial (*solo sidebar y minimal aplicados*)
  4. **Timer:** número / círculo / barra / analógico ✅
  5. **Círculo respiración:** pulso / ondas / pétalo / orgánico ✅
  6. **Logo:** lineal / sello / ilustrado ✅
  - Toggle sonidos
  - Reset de datos

---

## 🚧 Pendiente / mejorable

- [ ] **Layout Editorial** — el tweak está listado pero aún no tiene implementación visual distinta al sidebar
- [ ] **Sonidos reales** — hay toggle pero no hay archivos de audio
- [ ] **Integración con calendario** (fase posterior)
- [ ] **Mockups extensión Chrome** (popup + nueva pestaña) — próxima sesión
- [ ] **Mockups app Android** (fase 2)
- [ ] **Voz guiada** (si se decide añadir luego)
- [ ] **Logros estacionales/secretos** — implementados en la UI pero no todos tienen trigger automático

---

## 📋 Próximos pasos (orden recomendado)

### Para la próxima sesión:
1. **Mockups extensión Chrome** — popup 340×480 + nueva pestaña full-size reusando componentes
2. **Layout Editorial** — diseñar variante tipo revista (hero + columnas)
3. **Sonidos** — campanas sutiles para inicio/fin de Pomodoro y fases de respiración
4. **Más triggers de logros** — maestría, estacionales

### Fase 2:
5. **Mockups app Android** — storyboard en ios_frame/android_frame
6. **Widget de Chrome flotante** sobre cualquier web
7. **Sincronización online** (backend minimalista)

---

## ⚠️ Decisiones de diseño tomadas

### Sesión 1
- **Arquitectura de archivos:** 14 JSX pequeños (~50-500 líneas cada uno), cada uno exporta a `window`.
- **Estado:** `useSyncExternalStore` + localStorage con clave `pace.state.v1`.
- **Identidad visual:** 3 paletas (crema día default, oscuro noche, papel envejecido); 3 tipografías serif/mono.
- **Tipografías finales:** EB Garamond (primaria), Cormorant, JetBrains Mono.
- **100 logros** estilo "sello de libreta de campo" — border dashed, glifo italic central, anillo externo.
- **Post-Pomodoro:** menú rápido con 3 opciones (Respira/Mueve/Agua) + Saltar.
- **Copy:** mezcla ritual + antídoto + compañero (ej. "¿Qué quieres cultivar hoy?" + "Antídoto exacto a 4h sentado" + mínimo).
- **Sin emojis**, sin gamificación agresiva.
- **Navegación:** atajos T (tweaks), S (stats), L (logros).
- **Secreto oculto:** click 10 veces en el logo (easter egg "vaca feliz").

---

## 🐛 Bugs / Issues conocidos

- *ninguno reportado aún* — probar flujos end-to-end en próxima sesión

---

## 💡 Ideas para explorar (futuro)

- Integración con calendario para no interrumpir en reuniones
- "Retiro" modo larga duración (30-60 min de respiración + movilidad)
- Estadísticas agregadas mensuales
- Export/import de datos (JSON)
- Sincronización con Apple Health / Google Fit
- Widget reloj en macOS/Windows
