# PACE · Foco · Cuerpo

> **Web app + extensión Chrome + app Android** de productividad y salud
> para trabajo de oficina / remoto.
> Logo: una vaca paciendo (metáfora del "pace" = pacer, ir a tu ritmo).

---

## ⚡ Arranque de sesión (obligatorio)

Antes de tocar **nada** en cada sesión nueva:

1. **Lee `CLAUDE.md`** (este archivo) — protocolo y reglas.
2. **Lee `STATE.md`** — versión actual, última sesión, backlog, decisiones activas.
3. **Lee `DESIGN_SYSTEM.md`** — tokens, paletas, tipografía.
4. **Lista `app/`** para ver la estructura real de componentes.
5. **Verifica que `PACE_standalone.html` existe** (backup funcional).
6. **Confirma al usuario el estado** antes de tocar nada.

**Nunca reinventes componentes existentes.** Si algo ya existe, léelo
primero y edítalo en vez de reescribirlo.

**Plantilla para abrir sesión nueva** (el usuario la copia y pega):
```
Proyecto PACE. Importa la última versión desde
https://github.com/ezradesign/Pace_app y lee STATE.md
antes de tocar nada. Tarea de hoy: [descripción].
```

---

## 🧭 Semáforo de contexto

Al inicio de respuestas largas o cuando cambie el estado, indicar:

- 🟢 **Contexto holgado** — podemos iterar con libertad.
- 🟡 **Contexto medio** — conviene cerrar tareas abiertas pronto.
- 🔴 **Contexto ajustado** — disparar cierre de sesión (ver abajo).

El sistema no expone un contador exacto; la señal se basa en longitud de la
conversación, volumen de outputs acumulados y complejidad de lo leído.

---

## 🔒 Cierre de sesión (obligatorio tras cambios significativos)

Disparar cuando el contexto llegue a 🔴, cuando el usuario diga "cierra
sesión", o al terminar una tarea de cambio significativo. **En este orden,
sin excepción:**

1. **Verificar que la app carga limpia** → `done` en `PACE.html` (consola
   sin errores). Si hay errores, arreglar antes de seguir.
2. **Rotar standalone anterior** a `backups/PACE_standalone_vX.Y_YYYYMMDD.html`
   (mantener máximo **5 backups**; borrar el más antiguo).
3. **Regenerar `PACE_standalone.html`** con `super_inline_html` desde
   `PACE.html`.
4. **Verificar el nuevo standalone** con `show_html` + `get_webview_logs`.
5. **Escribir el diario de sesión completo** en
   `docs/sessions/session-NN-titulo-corto.md` (plantilla en
   `docs/sessions/_template.md`). Es el relato detallado: qué, por qué,
   archivos, decisiones, backlog.
6. **Actualizar `CHANGELOG.md`**: añadir fila a la tabla + (si es una de
   las 2 versiones más recientes) incluir detalle completo abajo; si hay
   una versión que cae fuera del top-2, mover su detalle al diario y
   dejar solo la fila de tabla.
7. **Reescribir la sección "Última sesión" de `STATE.md`** — **sustituir,
   no añadir**. Este archivo no crece con el tiempo.
8. **Actualizar backlog/decisiones activas** de `STATE.md` si aplica.
9. **Actualizar `DESIGN_SYSTEM.md` / `CONTENT.md` / `ROADMAP.md`** si hubo
   cambios.
10. **Sincronizar carpeta espejo `Pace_app_HH_MM/`** (ver reglas abajo).
11. **Presentar descarga** con `present_fs_item_for_download`.
12. **Dar al usuario el mensaje exacto de commit sugerido** para GitHub.

### Qué cuenta como "cambio significativo"
- Cualquier cambio funcional (nuevo módulo, feature, bugfix importante).
- Cambios de diseño notables (nueva paleta, tipografía, layout).
- Cambios estructurales de archivos.
- Tweaks visuales menores (1-2 líneas de CSS) **no** requieren regenerar
  standalone, pero sí anotar brevemente en `STATE.md` (sección "Última
  sesión") y en el diario de sesión.

---

## 📒 Regla de un único sitio por tipo de información

Para que `STATE.md` no crezca linealmente con cada sesión:

| Tipo de información | Dónde vive |
|---|---|
| **Estado actual del proyecto** | `STATE.md` (se reescribe cada sesión) |
| **Backlog abierto** | `STATE.md` sección "Backlog priorizado" |
| **Decisiones vigentes** que condicionan futuro | `STATE.md` sección "Decisiones activas" |
| **Historial por versión** (GitHub-friendly) | `CHANGELOG.md` (tabla + 2 últimas versiones) |
| **Diario detallado de cada sesión** | `docs/sessions/session-NN-xxx.md` |
| **Tokens / paleta / tipografía** | `DESIGN_SYSTEM.md` |
| **Catálogo de rutinas y logros** | `CONTENT.md` |
| **Visión a medio/largo plazo** | `ROADMAP.md` |
| **Cómo portar a otro stack** | `docs/porting.md` |
| **Presentación pública** (GitHub reader) | `README.md` |

**No duplicar.** Si el detalle de una sesión está en su archivo de
`docs/sessions/`, no se copia al changelog ni al state. Se enlaza.

---

## 🗂️ Carpeta espejo `Pace_app_HH_MM/`

Mantiene un espejo 1:1 del proyecto listo para descargar y pegar sobre la
carpeta local de GitHub Desktop del usuario.

### Nombrado con timestamp
`Pace_app_HH_MM` donde `HH_MM` es la **hora local del usuario en España**
(CET = UTC+1 / CEST = UTC+2), NO UTC. Pregunta al usuario si no la sabes;
si dice "son las 20:02", usa `Pace_app_20_02/`.

### Sincronización
Cada vez que se cree, modifique, mueva o elimine un archivo del proyecto
(fuera de `Pace_app_*/`), reflejar ese cambio también dentro de la carpeta
espejo **en el mismo tool call o inmediatamente después**.

### Orden crítico al regenerar (NO paralelo)
1. **Copiar primero** desde la raíz del proyecto (NO desde la carpeta
   espejo vieja) a la nueva `Pace_app_HH_MM/`.
2. **Verificar** con `list_files` que la nueva carpeta está completa.
3. **Actualizar `.gitignore`** si es necesario (patrón `Pace_app_*/`).
4. **En tool call SEPARADO**, borrar la carpeta espejo vieja.

⚠️ **Nunca** copiar y borrar en el mismo batch paralelo — el orden no está
garantizado y pueden perderse archivos.

### Excluir de la carpeta espejo
- La propia carpeta espejo (evitar recursión).
- `screenshots/` (no sirve para GitHub).
- Cualquier `.napkin` o temporal.

### `.gitignore` con patrón glob
```
Pace_app/
Pace_app_*/
```

### Regla de "siempre lista antes de quedarse sin contexto"

**SIEMPRE** antes de que el contexto llegue a 🔴, dejar
`Pace_app_HH_MM/` lista para subir a GitHub con:

1. **App estable y sin crashear.** `PACE.html` y `PACE_standalone.html`
   cargan limpios. Si hay cambios a medias que pueden romper algo,
   **revertirlos o completarlos** antes de sincronizar.
2. **Standalone regenerado** a la versión actual.
3. **`STATE.md` actualizado** con lo hecho + lo que quedó a medias
   (marcado como 🚧).
4. **Carpeta espejo sincronizada** 1:1 con el timestamp local.
5. **Descarga preparada** con `present_fs_item_for_download`.

Aplica **incluso si la sesión se interrumpe a mitad de tarea**: mejor
estado anterior estable y documentado que repo roto. Si hay duda, rotar al
último backup funcional de `backups/` y dejar constancia en `STATE.md`.

---

## 🏗️ Arquitectura de archivos

Usamos **archivos JSX pequeños** para que sean fácilmente leíbles y
editables en futuras conversaciones. **Nunca** un archivo > 500 líneas.

```
/
├── CLAUDE.md                    ← este archivo, léelo siempre
├── STATE.md                     ← presente + próximo (no crece)
├── CHANGELOG.md                 ← historial por versión (tabla + 2 últimas)
├── DESIGN_SYSTEM.md             ← tokens, paleta, tipografías
├── CONTENT.md                   ← catálogo de rutinas + logros
├── ROADMAP.md                   ← visión a medio/largo plazo
├── README.md                    ← presentación pública para GitHub
├── HANDOFF.md                   ← snapshot histórico v0.9 (congelado)
│
├── docs/
│   ├── porting.md               ← cómo portar a Next.js / Chrome / Android
│   └── sessions/                ← diario completo de cada sesión
│       ├── README.md            ← índice
│       ├── _template.md         ← plantilla para sesiones nuevas
│       └── session-NN-xxx.md    ← una por sesión
│
├── PACE.html                    ← entry point de desarrollo
├── PACE_standalone.html         ← bundle offline (regenerado cada sesión)
│
├── app/
│   ├── tokens.css
│   ├── state.jsx                ← store global + localStorage + acciones
│   ├── main.jsx                 ← <PaceApp/> root + routing
│   │
│   ├── ui/                      ← primitivos compartidos
│   │   ├── Primitives.jsx       ← Modal, Card, Tag, Button, Divider, Meta
│   │   ├── CowLogo.jsx          ← variantes del logo + wordmark
│   │   ├── Toast.jsx            ← notificaciones de logros
│   │   └── pace-logo.png        ← logo oficial local
│   │
│   ├── shell/
│   │   └── Sidebar.jsx
│   │
│   ├── focus/
│   │   └── FocusTimer.jsx       ← Pomodoro con varios estilos
│   │
│   ├── breathe/
│   │   └── BreatheModule.jsx    ← librería + sesión + modal seguridad
│   │
│   ├── move/
│   │   └── MoveModule.jsx       ← librería + sesión con pasos
│   │
│   ├── extra/
│   │   └── ExtraModule.jsx      ← calistenia oficina (reusa MoveSession)
│   │
│   ├── hydrate/
│   │   └── HydrateModule.jsx
│   │
│   ├── breakmenu/
│   │   └── BreakMenu.jsx        ← menú post-Pomodoro
│   │
│   ├── achievements/
│   │   └── Achievements.jsx     ← 100 logros
│   │
│   ├── stats/
│   │   └── WeeklyStats.jsx
│   │
│   └── tweaks/
│       └── TweaksPanel.jsx
│
└── backups/
    └── PACE_standalone_vX.Y_YYYYMMDD.html   ← máx 5 backups rotados
```

---

## 🧑‍💻 Reglas de código

1. **Archivos < 500 líneas.** Si crecen, trocear.
2. **Cada JSX exporta a `window`** al final:
   ```js
   Object.assign(window, { FocusTimer, MinutesPicker });
   ```
3. **Objetos de estilos con nombre único** por componente:
   ```js
   const focusTimerStyles = { ... }  // ✅
   const styles = { ... }            // ❌ colisiona globalmente
   ```
4. **Orden de carga en `PACE.html`:** `state.jsx` → `ui/*` → `shell/*` →
   módulos → `main.jsx`.
5. **No usar `type="module"`** en scripts — rompe Babel standalone.
6. **Hooks de React** se desestructuran del global:
   `const { useState } = React;`.
7. **Estado persistente** va a `localStorage` bajo la clave `pace.state.v1`.
8. **React 18.3.1 + Babel standalone 7.29.0** pinneados con SRI (ver
   `PACE.html`).
9. **Iconografía mínima.** Tags cortos tipo `SIT`, `HIP`, `SHLD`, `ATG`,
   `ANC` para categorización.

---

## 🎯 Concepto del producto

PACE es un "todo en uno" de bienestar para quien pasa muchas horas
sentado. Foco: **micro-intervenciones a lo largo del día**, no
entrenamientos largos.

| Módulo | Qué hace | Inspiración |
|---|---|---|
| **Foco** | Pomodoro configurable (15/25/35/45 min, pausas cortas/largas) | Técnica Pomodoro clásica |
| **Respira** | Breathwork guiado: pranayamas, coherencia cardíaca, rondas tipo Wim Hof, box, 4-7-8 | [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy) |
| **Mueve** | Movilidad + estiramientos de silla: caderas, hombros, cuello, espalda, ATG | [Strengthside](https://www.youtube.com/@Strengthside) |
| **Extra / Estira** | Calistenia oficina corta, discreta, sin equipo | Strengthside + [Jess Martin](https://www.youtube.com/@jessmartinm) |
| **Hidrátate** | Recordatorios + tracking de vasos de agua | — |

### Tono / filosofía
- **Calmado, artesanal, cuidado.** No gamificación agresiva. No métricas
  abrumadoras.
- Tipografía serif italic para títulos ("Pace", "Respira") — elegante,
  literaria.
- Paleta tierra: verdes oliva, cremas, terracotas suaves, negro tinta.
- Copy corto, en español, con tono cálido ("¿Qué quieres cultivar hoy?",
  "Concentración profunda").
- "Antídoto a la silla" como frame mental para los ejercicios.

---

## 🎨 Identidad visual

Ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para tokens completos,
paletas, tipografía, espaciado, transiciones y utilidades.

---

## 🧪 Buenas prácticas

### Trazabilidad
- Cada sesión tiene su archivo en `docs/sessions/` con fecha.
- Cada decisión vigente está en `STATE.md` sección "Decisiones activas".
- Los bugs abiertos van en `STATE.md` sección "Backlog priorizado".

### Documentación viva
- Si un componente tiene lógica no-obvia, añade un comentario `/* NOTA: ... */`.
- Si una decisión va contra la intuición, documéntala en `STATE.md` o
  `DESIGN_SYSTEM.md`.
- Si una rutina tiene contraindicaciones (p.ej. Wim Hof), disclaimer en
  `CONTENT.md` + modal de seguridad en el código.

### Testing manual (checklist antes de cerrar sesión)
- [ ] Pomodoro cuenta y termina → abre BreakMenu
- [ ] Respira: librería abre, modal de seguridad (Rondas), sesión con
      círculo animado
- [ ] Mueve: librería abre, sesión con pasos y countdown
- [ ] Hidrátate: +/− funciona, persiste al recargar
- [ ] Logros: al menos 1 se desbloquea automáticamente (first.step)
- [ ] Tweaks: cambiar paleta cambia colores, cambiar timer cambia visual
- [ ] Recargar página → estado persiste (localStorage)

### Degradación elegante
- Si `localStorage` falla → la app sigue funcionando en memoria (no crashea).
- Si una fuente no carga → fallback serif/sans del sistema.
- Si una animación es costosa → respetar `prefers-reduced-motion`.

### Privacidad
- **Todo local.** `localStorage` únicamente. Sin tracking, sin analytics,
  sin backend.
- Si algún día se añade sync online → **opt-in explícito** con disclaimer.

### Accesibilidad
- Hit targets ≥ 44 px móvil, ≥ 36 px desktop.
- Contraste AA mínimo (verificar especialmente en paleta oscura).
- Atajos de teclado documentados (T, S, L, Esc).
- Modales cerrables con Esc.

---

## 📐 Versionado semántico informal

- `v0.X` → pre-lanzamiento, iteraciones de diseño.
- `v1.0` → primera versión "completa" (web app + Chrome ready).
- `v1.X` → mejoras post-lanzamiento.
- `v2.0` → app Android añadida.

---

## 🚫 Qué NO hacer

- ❌ Emojis en la UI (rompe el tono artesanal)
- ❌ Gradientes llamativos, sombras exageradas
- ❌ Gamificación agresiva (streaks rojos, notificaciones abrumadoras)
- ❌ Tipografías trilladas (Inter, Roboto, Arial)
- ❌ Consejos médicos sin disclaimer (apnea SIEMPRE lleva modal de seguridad)
- ❌ Archivos monolíticos > 500 líneas
- ❌ Acumular historia en `STATE.md` (va al diario de sesiones)
- ❌ Duplicar la misma sesión en STATE + CHANGELOG + diario
