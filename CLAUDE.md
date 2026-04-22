# PACE · Foco · Cuerpo

> **Web app + extensión Chrome + app Android** de productividad y salud para trabajo de oficina / remoto.
> Logo: una vaca paciendo (metáfora del "pace" = pacer, ir a tu ritmo).

---

## ⚠️ LEE ESTO ANTES DE NADA

Este proyecto es **continuable a través de múltiples conversaciones**. Antes de tocar nada:

1. **Lee este archivo completo.**
2. **Lee `STATE.md`** — contiene el estado actual del proyecto, qué está hecho, qué falta, últimas decisiones.
3. **Lee `DESIGN_SYSTEM.md`** — paleta, tipografías, tokens, componentes.
4. **Lista los archivos en `app/`** para ver la estructura de componentes actual.
5. Cuando termines una sesión de trabajo, **actualiza `STATE.md`** con lo que hiciste y lo siguiente a hacer.

**Nunca reinventes componentes existentes.** Lee primero lo que hay.

---

## 🔒 PROTOCOLO DE SEGURIDAD (OBLIGATORIO EN CADA SESIÓN)

Este protocolo se aplica **en cada sesión de trabajo, sin excepción**:

### Al inicio de cada sesión
1. Leer `CLAUDE.md`, `STATE.md`, `DESIGN_SYSTEM.md`.
2. Listar `app/` para ver el estado real de los componentes.
3. Verificar que existe `PACE_standalone.html` (el backup funcional).
4. Confirmar al usuario el estado antes de tocar nada.

### Durante la sesión
- **Nunca reescribir componentes que ya existen** sin leerlos primero.
- **Mantener archivos <500 líneas.** Si uno crece, trocearlo.
- **Objetos de estilos con nombres únicos** por componente (`focusTimerStyles`, no `styles`).
- **Exportar a `window`** al final de cada JSX.
- **Commits frecuentes** via `write_file` y `str_replace_edit` (el sistema versiona automáticamente).

### Al terminar cualquier cambio significativo
Ejecutar en este orden **sin excepción**:

1. **Verificar que la app carga limpia** → `done` en `PACE.html` (consola sin errores).
2. **Rotar el standalone anterior a backup:**
   - Copiar `PACE_standalone.html` → `backups/PACE_standalone_vX.Y_YYYYMMDD.html`
   - (Mantener máximo los últimos **5 backups**; eliminar los más antiguos)
3. **Regenerar `PACE_standalone.html`** con `super_inline_html` desde `PACE.html`.
4. **Verificar el nuevo standalone** → `show_html` + `get_webview_logs` sin errores.
5. **Actualizar `STATE.md`:**
   - ✅ Qué se hizo en esta sesión
   - 🚧 Qué quedó a medias
   - 📋 Próximos pasos concretos
   - ⚠️ Decisiones tomadas (con fecha)
   - Actualizar número de versión si aplica
6. **Actualizar `DESIGN_SYSTEM.md`** si hubo cambios de tokens/componentes.
7. **Actualizar `CONTENT.md`** si hubo cambios en rutinas/logros.
8. **Actualizar `HANDOFF.md`** si cambió la arquitectura o hay nuevo módulo relevante.

### Qué cuenta como "cambio significativo"
- Cualquier cambio funcional (nuevo módulo, nueva feature, bugfix importante).
- Cambios de diseño notables (nueva paleta, nueva tipografía, nuevo layout).
- Cambios estructurales de archivos.
- **Tweaks visuales menores (1-2 líneas de CSS)** NO requieren regenerar standalone, pero sí actualizar `STATE.md` brevemente.

### Estructura de backups
```
backups/
├── PACE_standalone_v0.9_20260422.html   ← más antiguo (borrar si >5)
├── PACE_standalone_v0.9.1_20260423.html
├── PACE_standalone_v0.9.2_20260424.html
├── PACE_standalone_v1.0_20260425.html
└── PACE_standalone_v1.0.1_20260426.html ← más reciente
```

### Versionado semántico informal
- `v0.X` → pre-lanzamiento, iteraciones de diseño
- `v1.0` → primera versión "completa" (web app + Chrome ready)
- `v1.X` → mejoras post-lanzamiento
- `v2.0` → app Android añadida

---

## 📋 BUENAS PRÁCTICAS ADICIONALES

Más allá del protocolo obligatorio:

### Trazabilidad
- Cada entrada nueva en `STATE.md` lleva **fecha** (formato `YYYY-MM-DD`).
- Cada decisión importante va en "Decisiones de diseño tomadas" con justificación.
- Los bugs conocidos van en "Bugs / Issues" con fecha de detección.

### Documentación viva
- Si un componente tiene lógica no-obvia, añade un comentario `/* NOTA: ... */` arriba.
- Si una decisión de diseño va contra la intuición, documéntala en `DESIGN_SYSTEM.md`.
- Si una rutina tiene contraindicaciones médicas (p.ej. Wim Hof), el disclaimer va en `CONTENT.md` + modal de seguridad.

### Testing manual antes del handoff
Checklist a ejecutar antes de marcar sesión como cerrada:
- [ ] Pomodoro cuenta y termina → abre BreakMenu
- [ ] Respira: librería abre, modal de seguridad (Rondas), sesión con círculo animado
- [ ] Mueve: librería abre, sesión con pasos y countdown
- [ ] Hidrátate: +/− funciona, persiste al recargar
- [ ] Logros: al menos 1 se desbloquea automáticamente (first.step tras Pomodoro)
- [ ] Tweaks: cambiar paleta cambia colores, cambiar timer cambia visual
- [ ] Recargar página → estado persiste (localStorage)

### Degradación elegante
- Si `localStorage` falla → la app debe seguir funcionando en memoria (no crashear).
- Si una fuente no carga → fallback serif/sans del sistema.
- Si una animación es costosa → respetar `prefers-reduced-motion`.

### Privacidad
- **Todo es local**: `localStorage` únicamente. Sin tracking, sin analytics, sin backend.
- Si algún día se añade sync online → debe ser opt-in explícito con disclaimer.

### Accesibilidad
- Hit targets ≥ 44px en móvil, ≥ 36px desktop.
- Contraste AA mínimo (verificar en paleta oscura especialmente).
- Atajos de teclado documentados (T, S, L, Esc).
- Modales cerrables con Esc.

---

## 🎯 Concepto del producto

PACE es un "todo en uno" de bienestar para quien pasa muchas horas sentado. El foco es **micro-intervenciones a lo largo del día**, no entrenamientos largos.

### Módulos

| Módulo | Qué hace | Inspiración |
|---|---|---|
| **Foco** | Pomodoro configurable (25/45/50 min, pausas cortas/largas) | Técnica Pomodoro clásica |
| **Respira** | Breathwork guiado: pranayamas, coherencia cardíaca, rondas tipo Wim Hof, box breathing, 4-7-8 | [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy) |
| **Mueve** | Movilidad + estiramientos de silla: caderas, hombros, cuello, espalda, ATG para rodillas | [Strengthside](https://www.youtube.com/@Strengthside) |
| **Extra** (calistenia oficina) | Ejercicios cortos que se pueden hacer en el escritorio / al lado | [Strengthside](https://www.youtube.com/@Strengthside) + [Jess Martin](https://www.youtube.com/@jessmartinm) |
| **Hidrátate** | Recordatorios + tracking de vasos de agua | — |

### Tono / Filosofía
- **Calmado, artesanal, cuidado.** No gamificado agresivo. No métricas abrumadoras.
- Tipografía serif italic para títulos (ej. "Pace", "Respira") — elegante, literaria.
- Paleta tierra: verdes oliva, cremas, terracotas suaves, negro tinta.
- Copy corto, en español, con tono cálido ("¿Qué quieres cultivar hoy?", "Concentración profunda").
- "Antídoto a la silla" como frame mental para los ejercicios.

---

## 🏗️ Arquitectura de archivos

Usamos **archivos JSX pequeños** para que sean fácilmente leíbles y editables en futuras conversaciones. **Nunca** un archivo > 500 líneas.

```
/
├── CLAUDE.md                    ← este archivo, léelo siempre
├── STATE.md                     ← estado actual + próximos pasos
├── DESIGN_SYSTEM.md             ← tokens, paleta, tipografías
├── CONTENT.md                   ← catálogo de rutinas (respiración, movilidad…)
│
├── PACE.html                    ← entry point principal
│
├── app/
│   ├── main.jsx                 ← <App/> root, routing entre vistas
│   ├── state.jsx                ← estado global (localStorage, settings)
│   │
│   ├── shell/                   ← layout principal
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   └── StatusBar.jsx
│   │
│   ├── focus/                   ← módulo Pomodoro
│   │   ├── FocusTimer.jsx
│   │   ├── FocusControls.jsx
│   │   └── CycleDots.jsx
│   │
│   ├── breathe/                 ← módulo Respiración
│   │   ├── BreatheLibrary.jsx
│   │   ├── BreatheSession.jsx
│   │   ├── BreatheSafety.jsx   ← modal de seguridad (rondas, apnea)
│   │   └── routines.js         ← definición de cada técnica
│   │
│   ├── move/                    ← módulo Movilidad
│   │   ├── MoveLibrary.jsx
│   │   ├── MoveSession.jsx
│   │   └── routines.js
│   │
│   ├── extra/                   ← módulo Calistenia oficina
│   │   ├── ExtraLibrary.jsx
│   │   ├── ExtraSession.jsx
│   │   └── routines.js
│   │
│   ├── hydrate/                 ← módulo Hidratación
│   │   ├── HydrateTracker.jsx
│   │   └── HydrateReminder.jsx
│   │
│   ├── library/                 ← biblioteca unificada (modales tipo "Respiración", "Movilidad")
│   │   └── LibraryModal.jsx
│   │
│   └── ui/                      ← primitivos compartidos
│       ├── Modal.jsx
│       ├── Card.jsx
│       ├── Tag.jsx
│       └── Button.jsx
│
└── assets/
    ├── logo-cow.svg
    └── (iconos, imágenes)
```

### Reglas de código

1. **Cada componente en su propio archivo.** Nada de meter 5 componentes en un solo JSX.
2. **Exportar al scope global al final de cada archivo:**
   ```js
   Object.assign(window, { FocusTimer, FocusControls });
   ```
3. **Objetos de estilos con nombre único** por componente:
   ```js
   const focusTimerStyles = { ... }  // ✅
   const styles = { ... }            // ❌ rompe
   ```
4. **Estado persistente:** todo va a `localStorage` bajo la clave `pace.<módulo>.<key>`.
5. **React 18.3.1 + Babel standalone** (pinned, ver `PACE.html`).
6. **Iconografía mínima.** Usar texto/tags corto tipo `SIT`, `HIP`, `SHLD`, `ATG`, `ANC`.

---

## 🎨 Identidad visual (resumen — detalle en DESIGN_SYSTEM.md)

- **Fondo:** crema cálido `#F2EDE0` ish
- **Texto:** negro tinta `#1F1C17`
- **Acento verde (Foco):** oliva oscuro `#3E5A3A`
- **Acento terracota (Respira):** `#C97A5D`
- **Tipografía display:** serif italic (tipo "Cormorant Garamond" o "EB Garamond")
- **Tipografía UI:** sans-serif geométrica ligera
- **Estilo:** papel, tinta, mucho espacio en blanco, bordes finos, tags con border-radius pill

---

## 🔒 Protocolo de continuidad entre sesiones

**Al empezar cada nueva conversación:**

```
Lee CLAUDE.md, STATE.md y DESIGN_SYSTEM.md antes de editar nada.
Lista los archivos en app/ para ver qué componentes existen.
No reescribas componentes que ya existen — léelos y edítalos.
```

**Al terminar cada sesión de trabajo (antes de que se llene el contexto):**

1. Actualizar `STATE.md` con:
   - ✅ Lo que acabas de terminar
   - 🚧 Lo que está en progreso
   - 📋 Próximos pasos concretos
   - ⚠️ Decisiones de diseño tomadas esta sesión
2. Si hay componentes nuevos, añadirlos al árbol de arriba.

---

## 📚 Referencias del producto (inspiración de contenido)

- **Respiración:** Breathe With Sandy — pranayamas, coherencia, Wim Hof-like, box breathing, 4-7-8
- **Movilidad + ATG:** Strengthside — antídoto a la silla, caderas profundas, rodillas indestructibles, movilidad ancestral
- **Calistenia oficina:** Strengthside + Jess Martin — ejercicios cortos, sin equipo, aptos para entorno profesional

---

## 🚫 Qué NO hacer

- ❌ Emojis en la UI (rompe el tono artesanal)
- ❌ Gradientes llamativos, sombras exageradas
- ❌ Gamificación agresiva (streaks rojos, notificaciones push abrumadoras)
- ❌ Tipografías trilladas (Inter, Roboto)
- ❌ Consejos médicos sin disclaimer (la respiración con apnea SIEMPRE lleva modal de seguridad)
- ❌ Archivos monolíticos > 500 líneas
