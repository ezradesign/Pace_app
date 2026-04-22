# PACE · Estado del proyecto

> **Actualiza este archivo al final de cada sesión de trabajo.**
> **Sigue el protocolo de `CLAUDE.md` > "PROTOCOLO DE SEGURIDAD (OBLIGATORIO)".**

**Versión actual:** v0.10.1
**Última actualización:** 2026-04-22 · Sesión 4 — Reorganización modular post-GitHub

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
| `CLAUDE.md` | ✅ Con protocolo obligatorio | 2026-04-22 |
| `STATE.md` | ✅ Este archivo | 2026-04-22 |
| `DESIGN_SYSTEM.md` | ✅ Tokens completos | 2026-04-22 |
| `CONTENT.md` | ✅ Rutinas + 100 logros | 2026-04-22 |
| `HANDOFF.md` | ✅ Doc completa para retomar | 2026-04-22 |
| `PACE_standalone.html` | ✅ v0.9 (130KB, offline) | 2026-04-22 |
| `backups/` | ✅ 1 backup (`v0.9_20260422`) | 2026-04-22 |

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
