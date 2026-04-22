# PACE · Handoff Package

> **Documentación completa para retomar el proyecto sin contexto previo.**
> Si has llegado aquí sin saber nada de PACE, este archivo te pone al día.

**Versión actual:** v0.9
**Última actualización:** 2026-04-22
**Autor de diseño:** @acuradesign
**Stack:** HTML + React 18 + Babel standalone (sin build step)

---

## 🎯 1. Qué es PACE

PACE es una **web app de productividad y salud** diseñada para quien pasa muchas horas sentado (oficina o remoto). Su filosofía: **micro-intervenciones cuidadas a lo largo del día**, no entrenamientos largos.

**Logo:** una vaca paciendo. Juego de palabras con "pace" (ritmo / pacer).

**Plataformas planeadas:**
- ✅ Web app (implementada)
- 🚧 Extensión Chrome (popup + nueva pestaña) — pendiente
- 🚧 App Android — fase 2

**Módulos:**

| Módulo | Qué hace | Inspiración |
|---|---|---|
| **Foco** | Pomodoro con 15/25/35/45 min | Técnica Pomodoro |
| **Respira** | 12 técnicas de breathwork (coherencia, box, 4-7-8, Wim Hof, pranayama…) | Breathe With Sandy |
| **Mueve** | 7 rutinas de movilidad (caderas, hombros, ATG, ancestral…) | Strengthside |
| **Extra** | 7 ejercicios de calistenia discreta de oficina | Strengthside + Jess Martin |
| **Hidrátate** | Tracker de vasos de agua | — |
| **Logros** | 100 sellos coleccionables estilo "libreta de campo" | — |

**Tono:**
- Mezcla **ritual + antídoto + compañero silencioso**.
- Copy en español, literario pero funcional.
- Paleta crema + verde oliva + terracota.
- Tipografía display: EB Garamond italic.
- **Sin emojis, sin gamificación agresiva.**

---

## 🏗️ 2. Arquitectura del código

### Stack técnico
- **React 18.3.1** (UMD pinneado con SRI hashes)
- **Babel standalone 7.29.0** (transpila JSX en navegador, sin build step)
- **No hay bundler.** Todo se carga con `<script>` tags en orden.
- **No hay backend.** Persistencia 100% en `localStorage`.
- **No hay dependencias npm.** Solo lo que se importa por CDN.

### Estructura de archivos

```
/
├── PACE.html                        ← Entry point principal (desarrollo)
├── PACE_standalone.html             ← Archivo único offline (backup funcional)
│
├── CLAUDE.md                        ← Protocolo de continuidad + reglas
├── STATE.md                         ← Estado actual, hecho/pendiente, decisiones
├── DESIGN_SYSTEM.md                 ← Tokens, paleta, tipografía, componentes
├── CONTENT.md                       ← Catálogo de rutinas + 100 logros
├── HANDOFF.md                       ← Este archivo
│
├── app/
│   ├── tokens.css                   ← Variables CSS (paletas, tipografía, espaciado)
│   ├── state.jsx                    ← Store global + acciones + localStorage
│   ├── main.jsx                     ← Orquestador (<PaceApp/> root + routing)
│   │
│   ├── ui/
│   │   ├── Primitives.jsx           ← Modal, Card, Tag, Button, Divider, Meta
│   │   ├── CowLogo.jsx              ← 3 variantes del logo + wordmark
│   │   └── Toast.jsx                ← Notificaciones de logros
│   │
│   ├── shell/
│   │   └── Sidebar.jsx              ← Sidebar izquierdo completo
│   │
│   ├── focus/
│   │   └── FocusTimer.jsx           ← Pomodoro con 4 estilos de timer
│   │
│   ├── breathe/
│   │   └── BreatheModule.jsx        ← Librería + Sesión + Modal seguridad
│   │
│   ├── move/
│   │   └── MoveModule.jsx           ← Librería + Sesión con pasos
│   │
│   ├── extra/
│   │   └── ExtraModule.jsx          ← Calistenia oficina (reusa MoveSession)
│   │
│   ├── hydrate/
│   │   └── HydrateModule.jsx        ← Tracker de vasos
│   │
│   ├── breakmenu/
│   │   └── BreakMenu.jsx            ← Menú post-Pomodoro
│   │
│   ├── achievements/
│   │   └── Achievements.jsx         ← 100 logros + catálogo
│   │
│   ├── stats/
│   │   └── WeeklyStats.jsx          ← Panel semanal
│   │
│   └── tweaks/
│       └── TweaksPanel.jsx          ← 6 ejes de customización
│
└── backups/
    └── PACE_standalone_vX.Y_YYYYMMDD.html   ← Backups rotados (máx 5)
```

### Reglas de código

1. **Archivos <500 líneas.** Si crecen, trocear.
2. **Cada JSX exporta a `window`** al final:
   ```js
   Object.assign(window, { FocusTimer, MinutesPicker });
   ```
3. **Objetos de estilos con nombre único** por componente:
   ```js
   const focusTimerStyles = { ... }  // ✅
   const styles = { ... }            // ❌ colisiona globalmente
   ```
4. **Orden de carga en `PACE.html`:** `state.jsx` → `ui/*` → `shell/*` → módulos → `main.jsx`.
5. **No usar `type="module"`** en scripts — rompe Babel standalone.
6. **Hooks de React** se desestructuran de `React` globalmente (`const { useState } = React;`).

---

## 💾 3. Estado y persistencia

### Store global (`app/state.jsx`)

Patrón simple con `useSyncExternalStore`:

```js
const [state, set] = usePace();
```

**Clave raíz de localStorage:** `pace.state.v1`

**Estructura del estado:**
```js
{
  // Tweaks (6 ejes)
  palette: 'crema' | 'oscuro' | 'envejecido',
  font: 'garamond' | 'cormorant' | 'mono',
  layout: 'sidebar' | 'minimal' | 'editorial',
  timerStyle: 'numero' | 'circulo' | 'barra' | 'analogico',
  breathStyle: 'pulso' | 'ondas' | 'petalo' | 'organico',
  logoVariant: 'lineal' | 'sello' | 'ilustrado',
  soundOn: bool,

  // Foco
  focusMode: 'foco' | 'pausa' | 'larga',
  focusMinutes: 15 | 25 | 35 | 45,
  cycle: number,           // pomodoros completados hoy
  totalFocusMin: number,   // acumulado total

  // Plan del día (checkboxes)
  plan: { muevete, respira, extra, hidratate },

  // Hidratación
  water: { goal, today, lastReset },

  // Logros
  achievements: { [id]: { unlockedAt, note? } },

  // Stats semanales (array de 7 días, 0=Dom)
  weeklyStats: {
    focusMinutes: [0,0,0,0,0,0,0],
    breathMinutes: [...],
    moveMinutes: [...],
    waterGlasses: [...]
  },

  // Streak
  streak: { current, longest, lastActiveDate },

  // Intención del día (texto libre)
  intention: string,

  // Recordatorios
  reminders: [{ id, text, minutes, createdAt }]
}
```

### Acciones expuestas

Disponibles globalmente en `window`:

- `usePace()` → `[state, setState]`
- `unlockAchievement(id, note?)` → desbloquea y muestra toast
- `completePomodoro()` → +1 ciclo, +minutos, streak, logros
- `completeBreathSession(routineId, min)` → marca plan, stats, explora
- `completeMoveSession(routineId, min)` → idem
- `completeExtraSession()` → idem
- `addWaterGlass(delta)` → +/-1 vaso
- `updateStreak()` → recalcula racha de días

---

## 🎨 4. Sistema visual

Ver `DESIGN_SYSTEM.md` para detalles completos. Resumen:

### Paletas (3)
- **Crema día** (default): `#F2EDE0` fondo, `#1F1C17` texto, `#3E5A3A` verde (foco), `#C97A5D` terracota (respira)
- **Oscuro noche**: fondo `#1A1814`, acentos ajustados
- **Papel envejecido**: amarillento cálido

### Tipografía
- **Display (títulos, cifras):** EB Garamond italic
- **UI (botones, labels):** Inter Tight
- **Alt (tweak):** Cormorant Garamond, JetBrains Mono

### Escala
- Hero (Pomodoro): `clamp(96px, 12vw, 180px)`
- H1: 40px · H2: 28px · H3: 20px · Body: 15px · Meta: 11px uppercase tracked

### Componentes clave
- `<Modal>`: backdrop blur + radius lg + max 680px
- `<Card>`: border fine, radius md, hover eleva
- `<Tag>`: pill outline del color del módulo
- `<Button>`: primary (foco verde) / secondary / ghost / terracota

### 6 ejes de Tweaks
| Eje | Opciones |
|---|---|
| Paleta | crema · oscuro · envejecido |
| Tipografía | garamond · cormorant · mono |
| Layout | sidebar · minimal · editorial (pendiente) |
| Timer | número · círculo · barra · analógico |
| Círculo respiración | pulso · ondas · pétalo · orgánico |
| Logo | lineal · sello · ilustrado |

---

## 🔁 5. Flujos de usuario principales

### Flujo Foco (core)
1. Usuario abre app → ve timer 25:00
2. Ajusta minutos (15/25/35/45) y modo (foco/pausa/larga) si quiere
3. Click "Comenzar" → cuenta regresiva real
4. Al llegar a 00:00 → `completePomodoro()` → desbloquea logros, suma stats
5. **Aparece BreakMenu** con 3 opciones: Respira / Muévete / Hidrátate + "Saltar"
6. Si elige alguna → abre librería/tracker correspondiente
7. Al volver, timer reseteado

### Flujo Respira (con seguridad)
1. Usuario abre librería Respira (desde activity bar abajo o Break menu)
2. Ve 5 categorías con 12 técnicas
3. Selecciona una → si tiene `safety: true` (rondas, kapalabhati) → **modal de seguridad con checkbox obligatorio**
4. Acepta → sesión fullscreen con círculo animado
5. Cada fase (Inhala/Sostén/Exhala) tiene duración y escala del círculo
6. Al completar rondas/tiempo → `completeBreathSession()` → vuelve al home

### Flujo Mueve
1. Librería con 7 rutinas (tag SIT/HIP/SHLD/ATG/ANC)
2. Selección → sesión fullscreen con pasos
3. Cada paso: nombre grande, cue (indicación), countdown
4. Regla inferior marca progreso total
5. Anterior/Siguiente/Pausar

### Easter eggs
- Click 10 veces en logo → logro "Vaca feliz" (`secret.cow.click`)

---

## 🏆 6. Sistema de logros

**Total:** 100 logros en 6 categorías (ver `CONTENT.md` para lista completa):

1. **Primeros pasos** (1-10) — gris
2. **Constancia** (11-25) — verde oliva
3. **Exploración** (26-45) — terracota
4. **Maestría** (46-70) — dorado apagado
5. **Secretos** (71-90) — tinta oscura (se muestran como "?")
6. **Estacionales** (91-100) — multicolor

**Estética:** sello circular con border dashed + glifo italic central + anillo exterior sutil. Al desbloquear → toast animado bottom-center.

**Implementación actual:** ~30 con trigger automático. El resto están en la UI pero necesitan trigger específico.

---

## 🛠️ 7. Cómo retomar el proyecto

### Si tienes acceso a los archivos
1. Lee `STATE.md` → sabrás qué está a medias
2. Abre `PACE.html` en navegador → verás la app funcionando
3. Haz cambios en los JSX correspondientes
4. **IMPORTANTE:** sigue el **protocolo de seguridad** en `CLAUDE.md`:
   - Tras cada cambio → regenerar standalone, rotar backup, actualizar STATE

### Si solo tienes `PACE_standalone.html`
Es un archivo autosuficiente. Puedes:
- Abrirlo en cualquier navegador (funciona offline)
- Usar como referencia para reconstruir la versión modular

### Si quieres portarlo a Next.js / Vite / otro stack
Los JSX están escritos con React 18 puro. Portar implica:
1. `npm install react react-dom`
2. Convertir exports `Object.assign(window, ...)` → `export`
3. Convertir imports implícitos → `import` explícitos
4. Mover `tokens.css` a `globals.css` o módulos CSS
5. Sustituir `localStorage` por lib (ej. `zustand` con `persist`)

### Si quieres convertirlo en extensión Chrome
1. Usar `PACE.html` como `popup.html` o `newtab.html`
2. Crear `manifest.json` (MV3)
3. Ajustar permisos (`storage`, `alarms` para recordatorios)
4. Mover dependencias CDN a archivos locales (Chrome MV3 no permite scripts remotos)

---

## 🚦 8. Qué falta por hacer

Ver `STATE.md` sección "Pendiente / mejorable" para detalle. Resumen:

**Corto plazo:**
- Layout "Editorial" (tweak ya listado pero sin impl visual)
- Mockups extensión Chrome (popup + nueva pestaña)
- Sonidos reales (hay toggle pero no archivos)
- Más triggers automáticos para logros

**Medio plazo:**
- App Android (mockups + export a Capacitor/Expo)
- Widget flotante Chrome
- Sincronización opcional (backend minimal)

**Exploraciones:**
- Integración con calendario
- Modo "retiro" (sesión larga)
- Export/import JSON
- Sync con Apple Health / Google Fit

---

## ⚠️ 9. Avisos importantes

### Seguridad médica
- Las técnicas de respiración con hiperventilación (Rondas, Kapalabhati) **SIEMPRE** llevan modal de seguridad con checkbox.
- Los disclaimers son **no negociables** — son técnicas reales con riesgos reales (apnea, desmayo).
- Si añades nuevas técnicas, evalúa si necesitan flag `safety: true`.

### Privacidad
- **Zero tracking.** Todo en localStorage. Si se añade sync, debe ser opt-in.
- **No copiar listas reales de usuarios / datos de terceros.**

### Copyright / Inspiración
- Las rutinas están **inspiradas** en los canales citados, no son copia literal.
- Los nombres de técnicas (Box, 4-7-8, Coherente, ATG) son términos genéricos del dominio.
- El logo "vaca paciendo" es propio del proyecto.

### Navegadores soportados
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+ (algunos tweaks CSS pueden verse distintos)
- **Requiere:** `CSS custom properties`, `localStorage`, `ES2020`.

---

## 📞 10. Preguntas frecuentes

**¿Por qué sin build step?**
Para que cualquiera pueda abrir un archivo HTML y que funcione. Portabilidad máxima.

**¿Por qué no TypeScript?**
Prioridad de velocidad de iteración en fase de diseño. Fácilmente convertible cuando se estabilice.

**¿Por qué React y no Vue/Svelte?**
Ecosistema para portar a RN (Android) y consistencia con el dev esperado.

**¿Por qué localStorage y no IndexedDB?**
Datos muy pequeños (<50KB por usuario). LS es más simple. IDB sería overkill.

**¿Qué pasa si el usuario borra localStorage?**
Reinicia la app a valores default. No se pierde nada crítico (no hay sincronización aún).

**¿Cómo pruebo cambios localmente?**
Abrir `PACE.html` en navegador. Recargar tras cada cambio.

---

**Fin del handoff.** Para continuar con el proyecto, empieza leyendo `STATE.md`.
