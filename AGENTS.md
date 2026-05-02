# AGENTS.md · Reglas y protocolos de PACE

> Proyecto PACE: web app de productividad y salud para trabajo sedentario. Micro-intervenciones a lo largo del día, no entrenamientos largos.

---

## Reglas innegociables

Ambos bloques son innegociables, sin jerarquía de importancia: solo difieren en naturaleza (qué define al producto vs cómo se construye).

### A) Reglas de identidad y proceso (innegociables)
- Cero emojis en UI (en docs .md sí permitidos).
- Copy en español, tono cálido literario; dudas → TODO.
- Licencia: Elastic 2.0 + Lifetime/Pase como licencia comercial separada (no tocar headers de licencia sin confirmar).
- Tareas atómicas: un objetivo verificable por sesión, no necesariamente pequeño.
- Leer archivo entero antes de editar.
- NO tocar glifos ni `design/glyphs-explorations.html` (decisión del usuario externa).
- Protocolo de cierre adaptado al tipo de tarea (docs no requiere regenerar standalone ni verificar app).

### B) Reglas técnicas del stack (innegociables)
- Archivos < 500 líneas (BreatheModule.jsx ~565 es deuda conocida).
- Zero npm, zero build, zero backend.
- No tocar SRI hashes ni versiones de React 18.3.1 / Babel 7.29.0.
- Solo localStorage bajo `pace.state.v1`; sin cookies, fetch ni tracking.
- Cada JSX exporta a `window` con nombre único.
- Objetos de estilos con nombre único por componente (`focusTimerStyles`, no `styles`).
- Orden de carga en `PACE.html`: `state.jsx` → `ui/*` → `shell/*` → módulos → `main.jsx`.
- No usar `type="module"` (rompe Babel standalone).
- Hooks de React desestructurados del global.
- Cambios en `app/` → regenerar `PACE_standalone.html` con `node scripts/build-standalone.js`.
- Iconografía mínima: tags cortos (`SIT`, `HIP`, `SHLD`, `ATG`, `ANC`).
- Sin gradientes llamativos ni sombras exageradas.

---

## Fases de sesión (flujo completo)

### 1. Arranque (obligatorio)
Antes de tocar nada:
1. Leer `CLAUDE.md` (apuntará a este archivo para reglas).
2. Leer `STATE.md` (versión actual, última sesión, backlog).
3. Leer `DESIGN_SYSTEM.md` (tokens, paletas, tipografía).
4. Listar `app/` para ver estructura de componentes.
5. Verificar que `PACE_standalone.html` existe.
6. Confirmar al usuario el estado antes de tocar nada.

### 2. Semáforo de contexto
Indicar al inicio de respuestas largas o cambios de estado:
- 🟢 Contexto holgado — iterar con libertad.
- 🟡 Contexto medio — cerrar tareas abiertas pronto.
- 🔴 Contexto ajustado — disparar cierre de sesión.

### 3. Cierre (obligatorio tras cambios significativos)
Disparar en contexto 🔴, al usuario decir "cierra sesión", o al terminar tarea de cambio significativo. Orden estricto:
1. Verificar que la app carga limpia (servir `PACE.html` con servidor local, consola sin errores). En Claude Code el agente no tiene acceso a navegador — esta verificación la hace el usuario tras el cierre.
2. Regenerar `PACE_standalone.html` ejecutando `node scripts/build-standalone.js` desde la raíz. El script rota automáticamente el standalone anterior a `backups/PACE_standalone_vX.Y_YYYYMMDD.html` (máx 5 backups; los más viejos se eliminan).
3. Escribir diario de sesión en `docs/sessions/session-NN-titulo-corto.md`.
4. Actualizar `CHANGELOG.md` + `README.md` (versión actual).
5. Reescribir sección "Última sesión" de `STATE.md` (sustituir, no añadir).
6. Actualizar backlog / decisiones activas de `STATE.md` si aplica.
7. Actualizar `DESIGN_SYSTEM.md` / `CONTENT.md` / `ROADMAP.md` si hubo cambios.
8. Entregar mensaje de commit sugerido al usuario. El commit y el push los hace **el usuario manualmente** desde GitHub Desktop — el agente NO ejecuta `git commit` ni `git push`.

#### Qué cuenta como cambio significativo
- Cambio funcional (nuevo módulo, feature, bugfix importante).
- Cambio de diseño notable (nueva paleta, tipografía, layout).
- Cambio estructural de archivos.
- Tweaks menores (1-2 líneas CSS) no requieren regenerar standalone, pero sí anotar en `STATE.md` y diario.

#### Protocolo de cierre adaptado al tipo de tarea
- Tarea de docs (sin tocar `app/`): omitir paso 2 del cierre (no regenerar standalone). El resto se ejecuta normalmente.
- Tarea de código (toca `app/`): ejecutar todos los pasos de cierre, incluyendo regeneración del standalone.

### 4. Regla de un único sitio
Cada tipo de información vive en un único archivo dedicado:
| Tipo de información | Dónde vive |
|---|---|
| Estado actual del proyecto | `STATE.md` (se reescribe cada sesión) |
| Backlog abierto | `STATE.md` sección "Backlog priorizado" |
| Decisiones vigentes | `STATE.md` sección "Decisiones activas" |
| Historial por versión | `CHANGELOG.md` (tabla + 2 últimas versiones) |
| Diario de sesión | `docs/sessions/session-NN-xxx.md` |
| Tokens / paleta / tipografía | `DESIGN_SYSTEM.md` |
| Catálogo de rutinas y logros | `CONTENT.md` |
| Visión a medio/largo plazo | `ROADMAP.md` |
| Cómo portar a otro stack | `docs/porting.md` |
| Presentación pública | `README.md` |

No duplicar: si el detalle está en un archivo, no copiar a otro. Enlazar en su lugar.

---

## Checkpoints de edición (obligatorios)

### A. Antes de editar
Reportar líneas actuales del archivo a modificar.

### B. Después de editar
Reportar líneas nuevas del archivo modificado y del archivo creado (si aplica).

### C. Componentes/estilos nuevos
Confirmar nombre único exportado a `window` antes de escribir (ej. `focusTimerStyles`, no `styles`).

### D. Tras edición en `app/`
Regenerar `PACE_standalone.html` antes de la siguiente subtarea (salvo tweaks menores de 1-2 líneas CSS).

---

## Referencias
- `CLAUDE.md`: arquitectura de archivos, buenas prácticas, decisiones activas.
- `DESIGN_SYSTEM.md`: tokens completos, paletas, tipografía, espaciado.

---

## Notas de entorno

- **Pipeline actual: Claude Code (Opus 4.7)** desde sesión 35 (2026-05-01). Reemplaza al pipeline anterior OpenCode + Big Pickle (GLM-4.6). El usuario edita el repo localmente y commitea/pushea manualmente desde GitHub Desktop — el agente NO ejecuta `git commit` ni `git push`.
- **`super_inline_html`** era herramienta del sandbox Genspark Build AI usado hasta sesión 32. No disponible en otros entornos. Reemplazado por `scripts/build-standalone.js` desde **sesión 35**.
- **Regeneración del standalone:** desde la raíz del repo, ejecutar `node scripts/build-standalone.js`. El script lee `PACE.html`, inlinea todos los `<script>` y `<link>` con rutas locales (los CDN con `integrity` se preservan tal cual), inlinea el logo PNG como data URI base64, rota el standalone anterior a `backups/PACE_standalone_vX.Y_YYYYMMDD.html` (máx 5 backups), y escribe `PACE_standalone.html`. Sin dependencias npm — solo Node ≥ 14.
- **PACE.html no se puede abrir directamente con `file://`** porque los navegadores bloquean la carga de scripts `text/babel` desde rutas relativas locales. Para desarrollo, servir con un servidor local (ej. `python -m http.server 8000` desde la raíz del repo, abrir `http://localhost:8000/PACE.html`). El standalone (`PACE_standalone.html`) sí abre directamente porque todo está inline.
