# Changelog

Todos los cambios notables del proyecto PACE se documentan aquí.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

---

## [v0.11.2] — 2026-04-22 — Sidebar colapsable, Sendero, logo Pace.

### Añadido
- **Logo nuevo `PaceLockup`** en `app/ui/CowLogo.jsx` — wordmark "Pace." con la vaca integrada dentro de la letra P (lomo + cabeza inclinada paciendo), hierba al pie de la letra, "ace." en cursiva serif verde oliva y punto terracota final. Subtítulo "FOCO · CUERPO" en pequeño.
- Nueva opción `pace` en el eje **Logo de la vaca** del panel Tweaks, marcada como default.
- `state.logoVariant` default cambiado a `'pace'`.
- `state.sidebarCollapsed` (nuevo en el estado, default `false`).
- **Sidebar colapsable** — botón con chevron en cabecera expandida para comprimir a un rail estrecho (56 px) con racha, atajo a logros y a recordatorios. En modo colapsado, chevron inverso para volver a expandir.
- **Sección Sendero** (`SenderoDelDia` en `app/shell/Sidebar.jsx`) — SVG con curva ondulada horizontal que representa el arco del día 6h–22h. Puntos marcan los hitos del día (pomodoros, respiraciones, movimientos, vasos de agua) con color del módulo. Indicador "ahora" negro sobre la curva + etiqueta con hora actual. Contador dinámico `N hitos` en la cabecera.
- Mensaje vacío de Recordatorios (cuando no hay ninguno) con copy italic.

### Cambiado
- **Tweaks movidos** del FAB flotante (bottom-right) al TopBar junto a Stats y Logros — el FAB `fabStyles.tweaks` y su botón fueron eliminados en sesiones previas; el TopBar ahora agrupa los 3 iconos (gear, chart, trophy) arriba a la derecha.
- Atajo `T` para abrir Tweaks sigue activo.

### Eliminado
- **Sección Plan** del sidebar (chips Muévete / Respira / Extra / Hidrátate). Los chips eran redundantes con la ActivityBar inferior y ocupaban espacio que ahora se destina a Recordatorios + Sendero. El estado `plan.*` se conserva internamente para los indicadores activos de la ActivityBar y logros.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.2** (166 KB).
- `backups/PACE_standalone_v0.11.1_20260422.html` (rotado desde v0.11.1).

---

## [v0.11.1] — 2026-04-22 — Iconos ActivityBar restaurados

### Cambiado
- **4 iconos SVG nuevos** en la barra "Actividades" (`app/main.jsx`):
  - **Respira** — pulmones anatómicos con tráquea y bronquios (en lugar de círculo+cruz).
  - **Estira** — figura en postura de puente/arco con cabeza (en lugar de palito con brazos).
  - **Mueve** — mancuerna horizontal con dos discos a cada lado (en lugar de flechas).
  - **Hidrátate** — gota con highlight interior (pequeño reflejo).
- **Layout de tarjeta rediseñado** — de vertical (icono arriba, label abajo) a horizontal (icono izq + bloque de texto derecha).
- **Sublabels añadidos** en italic bajo cada título: `ritmo, calma` / `afloja tensión` / `cuerpo activo` / `agua ahora`.
- Iconos agrandados a 26×26 (antes 22×22) para compensar el layout horizontal más ancho.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.1** (154 KB).
- `backups/PACE_standalone_v0.11.0_20260422.html` (rotado desde v0.11.0).

---

## [v0.11.0] — 2026-04-22 — Fortalecimiento del proyecto

### Añadido
- `README.md` — presentación pública del proyecto para GitHub.
- `.gitignore` — excluye basura del sistema, temporales y la carpeta espejo `Pace_app/`.
- `CHANGELOG.md` — este archivo.
- `ROADMAP.md` — visión a corto / medio / largo plazo separada de `STATE.md`.
- Regla en `CLAUDE.md`: mantener carpeta espejo `Pace_app/` sincronizada para facilitar descargas y sync con GitHub Desktop.

### Cambiado
- `CLAUDE.md` — añadidas reglas de comunicación con semáforo de contexto (🟢🟡🔴) y protocolo de cierre de sesión automático.

---

## [v0.10.1] — 2026-04-22 — Reorganización modular

### Añadido
- `PACE.html` — entry point de desarrollo modular con scripts pinneados (React 18.3.1 + Babel 7.29.0 con SRI).
- Estructura de carpetas `app/` según documentación (`ui/`, `shell/`, `focus/`, `breathe/`, `move/`, `extra/`, `hydrate/`, `breakmenu/`, `achievements/`, `stats/`, `tweaks/`).

### Cambiado
- Todos los JSX movidos desde raíz plana a subcarpetas por dominio.
- `tokens.css`, `state.jsx`, `main.jsx` movidos a `app/`.

### Preservado
- `PACE_standalone.html` intacto como backup funcional offline.

---

## [v0.10] — 2026-04-22 — Pulido del core (Respira + Mueve)

### Añadido
- **Módulo Respira:**
  - Fase de preparación con cuenta atrás de 3s y mensaje calmado.
  - Fase de retención explícita en técnicas con rondas (Wim Hof-like).
  - Logros de apnea desbloqueables en tiempo real (60s / 90s / 2min).
  - Countdown visible dentro del círculo en fases ≥ 4s.
  - Pantalla de completado con stats y mensaje reflexivo.
  - Atajos de teclado: Espacio (pausar), Esc (salir), Enter (avanzar).
- **Módulo Mueve:**
  - Fase de preparación con estética ocre.
  - Glifo placeholder por paso (círculo dashed + símbolo italic rotativo).
  - Preview del siguiente paso bajo la regla de progreso.
  - Pantalla de completado con stats.
  - Atajos de teclado: ←/→ (navegar pasos), Espacio, Esc, Enter.
- Componentes compartidos: `SessionHeader`, `Stat`, `MoveStat`, `StepGlyph`.

### Cambiado
- Tarjetas de rutina rediseñadas en ambas librerías con jerarquía más clara.
- Indicador ⚠️ en rutinas con flag `safety: true`.

---

## [v0.9.2] — 2026-04-22 — Refinamiento post-feedback

### Cambiado
- ActivityBar rediseñada estilo editorial: tarjetas crema con borde fino y sombra suave, iconos terracota stroke 1.2, labels en serif italic.
- "Extra" renombrado a **"Estira"** para coherencia con Strengthside.
- Tipografía display default → Cormorant Garamond (antes EB Garamond).

### Añadido
- Tweak de timer **"Aro"** (nuevo default) — híbrido círculo + barra.
- Tweak de respiración **"Flor"** (nuevo default) — híbrido pulso + pétalo.
- Tweaks reordenados: híbridos recomendados primero.

---

## [v0.9] — 2026-04-22 — Base inicial

### Añadido
- Infraestructura de documentación: `CLAUDE.md`, `STATE.md`, `DESIGN_SYSTEM.md`, `CONTENT.md`, `HANDOFF.md`.
- Stack React 18.3.1 + Babel standalone 7.29.0 pinneado.
- Store global con `useSyncExternalStore` y persistencia en `localStorage` (clave `pace.state.v1`).
- Sistema de tokens CSS con 3 paletas (crema, oscuro, envejecido) y 3 tipografías (EB Garamond, Cormorant, JetBrains Mono).
- **Primitivos UI:** Modal, Card, Tag, Button, Divider, Meta.
- **Logo CowLogo** con 3 variantes (lineal, sello, ilustrado) + wordmark.
- **Toast** de notificaciones de logros.
- **Sidebar** completo: wordmark, ciclos, streak, ritmo, plan, logros, recordatorios, intención.
- **Módulo Foco:** timer real con setInterval, 4 estilos visuales, completePomodoro() dispara logros.
- **Módulo Respira:** librería con 12 técnicas en 5 categorías, modal de seguridad, sesión guiada.
- **Módulo Mueve:** librería con 7 rutinas, sesión con pasos.
- **Módulo Estira (Extra):** 7 rutinas de calistenia oficina.
- **Módulo Hidrátate:** contador X/8, vasos visuales, barra de progreso.
- **BreakMenu:** menú post-Pomodoro (Respira / Mueve / Hidrátate + Saltar).
- **Achievements:** catálogo de 100 logros en 6 categorías con sellos estilo libreta de campo.
- **WeeklyStats:** 4 totales + 4 gráficos de barras por día.
- **TweaksPanel:** 6 ejes de customización en vivo.
- Atajos globales: T (tweaks), S (stats), L (logros).
- Easter egg: 10 clicks en el logo → logro "vaca feliz".
