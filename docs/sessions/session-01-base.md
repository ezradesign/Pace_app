# Sesión 1 (2026-04-22) — Base inicial

**Versión entregada:** v0.9
**Duración / intensidad:** muy larga · construcción desde cero

## Contexto / petición

Construir el proyecto PACE desde cero: web app de productividad y salud
para trabajo de oficina/remoto, con 5 módulos (Foco, Respira, Mueve,
Estira, Hidrátate), estética editorial calmada, sin emojis, sin
gamificación agresiva.

## ✅ Hecho

### Infraestructura y documentación
- `CLAUDE.md` con protocolo de continuidad y arquitectura
- `STATE.md` (este archivo) — estado del proyecto
- `DESIGN_SYSTEM.md` con tokens finales (paleta, tipografía, espaciado, componentes)
- `CONTENT.md` con catálogo completo de rutinas + 100 logros

### Código base
- `PACE.html` — entry point con scripts pinneados (React + Babel)
- `app/tokens.css` — variables CSS para 3 paletas + 3 tipografías
- `app/state.jsx` — store global con localStorage y acciones
- `app/ui/Primitives.jsx` — Modal, Card, Tag, Button, Divider, Meta
- `app/ui/CowLogo.jsx` — 3 variantes del logo (lineal, sello, ilustrado) + wordmark
- `app/ui/Toast.jsx` — notificaciones de logros desbloqueados

### Shell
- `app/shell/Sidebar.jsx` — sidebar completo con:
  - Wordmark PACE
  - Contador de ciclos, streak, días activos
  - Sección RITMO con número grande y semana de dots
  - Sección PLAN con chips tipo pill interactivos
  - Sección LOGROS con preview de 5 sellos
  - Sección RECORDATORIOS con add/remove
  - Sección INTENCIÓN (textarea italic)
  - Footer con versión y "by @acuradesign"

### Módulo Foco (100% funcional)
- `app/focus/FocusTimer.jsx` con:
  - Timer real que cuenta (setInterval)
  - Selector modo: Foco / Pausa / Larga
  - Selector minutos: 15/25/35/45
  - **4 estilos visuales** (tweak): número, círculo con progress, barra, analógico
  - Controles: Comenzar/Pausar + Reset
  - Dots de ciclo
  - Al completar Pomodoro → llama completePomodoro() → desbloquea logros + abre BreakMenu

### Módulo Respira (funcional)
- `app/breathe/BreatheModule.jsx` con:
  - **Librería** con 12 técnicas en 5 categorías (Energía, Equilibrio, Balance, Relajación, Pranayama)
  - **Modal de seguridad** para técnicas con apnea (checkbox obligatorio)
  - **Sesión guiada** a pantalla completa con:
    - Círculo animado (**4 estilos tweak:** pulso, ondas, pétalo, orgánico)
    - Fase actual grande (Inhala / Sostén / Exhala / …)
    - Contador de rondas
    - Dots de progreso
    - Pausar/Terminar

### Módulo Mueve (funcional)
- `app/move/MoveModule.jsx` con:
  - **Librería** con 7 rutinas (Antídoto silla, Caderas, Hombros, ATG, Ancestral, Cuello, Escritorio express)
  - **Sesión con pasos** a pantalla completa:
    - Nombre del paso grande en italic
    - Cue (indicación) debajo
    - Countdown en segundos
    - Regla de progreso por paso
    - Anterior/Pausar/Siguiente

### Módulo Extra (funcional, reusa MoveSession)
- `app/extra/ExtraModule.jsx` con 7 rutinas de calistenia oficina

### Módulo Hidrátate (funcional)
- `app/hydrate/HydrateModule.jsx` con:
  - Contador gigante X/8
  - Vasos visuales que se "llenan" al click
  - Barra de progreso
  - Botones + / −
  - Tip motivacional

### Menú post-Pomodoro
- `app/breakmenu/BreakMenu.jsx` — aparece tras cada ciclo de Foco
  - 3 tarjetas grandes: Respira / Muévete / Hidrátate
  - Botón "Saltar esta pausa"

### Logros (100 sellos)
- `app/achievements/Achievements.jsx` con:
  - Catálogo completo de 100 logros en 6 categorías
  - Modal con contador grande + preview por categoría
  - Sellos circulares (estética "libreta de campo")
  - Secretos ocultos como "?"

### Stats semanales
- `app/stats/WeeklyStats.jsx` con:
  - 4 totales (foco min, breath min, move min, vasos agua)
  - 4 gráficos de barras por día (L-M-X-J-V-S-D)
  - Hoy marcado con opacidad 1

### Tweaks (6 ejes)
- `app/tweaks/TweaksPanel.jsx` — panel flotante bottom-right con:
  1. **Paleta:** crema / oscuro / envejecido
  2. **Tipografía:** EB Garamond / Cormorant / JetBrains Mono
  3. **Layout:** sidebar / minimal / editorial (*solo sidebar y minimal aplicados*)
  4. **Timer:** número / círculo / barra / analógico ✅
  5. **Círculo respiración:** pulso / ondas / pétalo / orgánico ✅
  6. **Logo:** lineal / sello / ilustrado ✅
  - Toggle sonidos
  - Reset de datos

## ⚠️ Decisiones de diseño tomadas

- **Arquitectura de archivos:** 14 JSX pequeños (~50-500 líneas cada uno),
  cada uno exporta a `window`.
- **Estado:** `useSyncExternalStore` + localStorage con clave `pace.state.v1`.
- **Identidad visual:** 3 paletas (crema día default, oscuro noche, papel
  envejecido); 3 tipografías serif/mono.
- **Tipografías finales:** EB Garamond (primaria), Cormorant, JetBrains Mono.
- **100 logros** estilo "sello de libreta de campo" — border dashed, glifo
  italic central, anillo externo.
- **Post-Pomodoro:** menú rápido con 3 opciones (Respira/Mueve/Agua) + Saltar.
- **Copy:** mezcla ritual + antídoto + compañero (ej. "¿Qué quieres
  cultivar hoy?" + "Antídoto exacto a 4h sentado" + mínimo).
- **Sin emojis**, sin gamificación agresiva.
- **Navegación:** atajos T (tweaks), S (stats), L (logros).
- **Secreto oculto:** click 10 veces en el logo (easter egg "vaca feliz").
