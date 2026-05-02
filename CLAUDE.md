# PACE · Foco · Cuerpo

> Web app + extensión Chrome + app Android de productividad y bienestar
> para trabajo de oficina / remoto.
> Logo: una vaca paciendo (metáfora del "pace" = pacer, ir a tu ritmo).

Stack zero-build: React 18.3.1 + Babel 7.29.0 vía UMD, sin npm, sin
backend, persistencia en `localStorage` bajo `pace.state.v1`. Dos
artefactos vivos: `PACE.html` (modular, entry de desarrollo) y
`PACE_standalone.html` (bundle inline autocontenido).

**Idioma del proyecto:** español. Copy y comentarios en español, tono
cálido literario. Cero emojis en UI (en `.md` sí permitidos).

---

## ⚡ Onboarding obligatorio

Antes de tocar nada, leer en este orden:

1. [`AGENTS.md`](./AGENTS.md) — reglas innegociables (identidad +
   técnicas) y protocolos de sesión (arranque, semáforo, cierre,
   checkpoints).
2. [`STATE.md`](./STATE.md) — versión actual, última sesión cerrada,
   backlog priorizado, decisiones activas.
3. [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — tokens, paletas,
   tipografía, espaciado.
4. Listar `app/` para ver la estructura real de componentes (puede
   haber diferido del árbol documentado).

Tras leer, reportar al usuario el estado y el semáforo de contexto
antes de tocar nada. Ver `AGENTS.md` para el detalle del semáforo.

---

## 🤖 Flujo con Claude Code

Estas notas son específicas del entorno Claude Code (sustituye al
pipeline anterior OpenCode + Big Pickle desde sesión 35).

- **Commits y push los hace el usuario manualmente desde GitHub
  Desktop.** No ejecutar `git commit` ni `git push`. Al cerrar sesión,
  entregar un mensaje de commit sugerido en formato bloque y dejar que
  el usuario lo aplique.
- **Edición in-place sobre el repo real.** Claude Code edita archivos
  directamente en la carpeta de trabajo del usuario. No hay carpeta
  espejo `Pace_app_HH_MM/` (era muleta del sandbox de Genspark; ya no
  aplica). El usuario revisa el diff en GitHub Desktop antes de commitear.
- **Regenerar standalone:** tras editar cualquier cosa en `app/`,
  ejecutar `node scripts/build-standalone.js` para producir
  `PACE_standalone.html` actualizado. El script no tiene dependencias
  npm.
- **Servir `PACE.html` para preview manual.** Los navegadores bloquean
  `text/babel` desde `file://`, así que para abrir el modular hace falta
  servidor local (`python -m http.server 8000` desde la raíz). El
  standalone sí abre con doble clic.

---

## 🪜 Checkpoints de edición (referencia rápida)

Detalle completo en `AGENTS.md`. Aquí van los nombres para citarlos en
los reportes durante la sesión.

| Checkpoint | Cuándo | Qué reportar |
|---|---|---|
| A | Antes de editar | Líneas actuales del archivo objetivo |
| B | Después de editar | Líneas finales tras la edición |
| C | Componente/estilo nuevo | Nombre único exportado a `window` (ej. `focusTimerStyles`, no `styles`) |
| D | Tras editar `app/` | Regenerar `PACE_standalone.html` con el script de build antes de la siguiente subtarea |

---

## 🏗️ Arquitectura de archivos (resumen)

Archivos JSX pequeños (< 500 líneas idealmente) para que sean
revisables y editables sin perder contexto.

```
/
├── AGENTS.md          ← reglas y protocolos (fuente operativa)
├── CLAUDE.md          ← este archivo (onboarding Claude Code)
├── STATE.md           ← presente + próximo (no crece)
├── CHANGELOG.md       ← historial por versión
├── DESIGN_SYSTEM.md   ← tokens, paleta, tipografías
├── CONTENT.md         ← catálogo de rutinas + logros
├── ROADMAP.md         ← visión a medio/largo plazo
├── README.md          ← presentación pública para GitHub
├── HANDOFF.md         ← snapshot histórico v0.9 (congelado)
├── LICENSE            ← Elastic License 2.0
│
├── docs/
│   ├── porting.md     ← cómo portar a Next.js / Chrome / Android
│   ├── audits/        ← informes técnicos puntuales
│   ├── proposals/     ← propuestas de producto / licencia
│   └── sessions/      ← diario completo (una sesión = un archivo)
│
├── PACE.html          ← entry point modular de desarrollo
├── PACE_standalone.html ← bundle offline autocontenido
│
├── scripts/
│   └── build-standalone.js ← inliner Node puro (zero deps)
│
├── app/
│   ├── tokens.css
│   ├── state.jsx                ← store global + acciones + rollover
│   ├── main.jsx                 ← <PaceApp/> root
│   ├── ui/                      ← Primitives, SessionShell, CowLogo,
│   │                              Sound, Toast, pace-logo.png
│   ├── shell/                   ← Sidebar
│   ├── focus/                   ← FocusTimer
│   ├── breathe/                 ← Module + Library + Safety + Visual +
│   │                              Routines + helpers (refactor s33)
│   ├── move/                    ← MoveModule
│   ├── extra/                   ← ExtraModule (calistenia oficina)
│   ├── hydrate/                 ← HydrateModule
│   ├── breakmenu/               ← BreakMenu (post-Pomodoro)
│   ├── achievements/            ← Achievements (catálogo de 100)
│   ├── stats/                   ← WeeklyStats
│   ├── support/                 ← SupportModule (Buy Me a Coffee)
│   ├── welcome/                 ← WelcomeModule (primera vez)
│   └── tweaks/                  ← TweaksPanel
│
├── design/
│   └── glyphs-explorations.html ← canvas de diseño (no tocar)
│
└── backups/
    └── PACE_standalone_vX.Y_YYYYMMDD.html  ← máx 5 backups rotados
```

---

## 🎯 Concepto del producto

PACE es un "todo en uno" de bienestar para quien pasa muchas horas
sentado. Foco: **micro-intervenciones a lo largo del día**, no
entrenamientos largos. "Antídoto a la silla" como frame mental.

| Módulo | Qué hace | Inspiración |
|---|---|---|
| **Foco** | Pomodoro configurable (15/25/35/45 min, pausas cortas/largas) | Técnica Pomodoro clásica |
| **Respira** | Breathwork guiado: pranayamas, coherencia cardíaca, rondas tipo Wim Hof, box, 4-7-8 | [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy) |
| **Mueve** | Movilidad + estiramientos de silla: caderas, hombros, cuello, espalda, ATG | [Strengthside](https://www.youtube.com/@Strengthside) |
| **Extra / Estira** | Calistenia oficina corta, discreta, sin equipo | Strengthside + [Jess Martin](https://www.youtube.com/@jessmartinm) |
| **Hidrátate** | Recordatorios + tracking de vasos de agua | — |

### Tono / filosofía
- **Calmado, artesanal, cuidado.** No gamificación agresiva. No
  métricas abrumadoras.
- Tipografía serif italic para títulos ("Pace", "Respira") — elegante,
  literaria.
- Paleta tierra: verdes oliva, cremas, terracotas suaves, negro tinta.
- Copy corto, en español, con tono cálido ("¿Qué quieres cultivar
  hoy?", "Concentración profunda").

---

## 🧪 Buenas prácticas

### Trazabilidad
- Cada sesión tiene su archivo en `docs/sessions/` con fecha.
- Cada decisión vigente está en `STATE.md` sección "Decisiones activas".
- Los bugs abiertos van en `STATE.md` sección "Backlog priorizado".

### Documentación viva
- Si un componente tiene lógica no-obvia, añadir comentario `/* NOTA: ... */`.
- Si una decisión va contra la intuición, documentarla en `STATE.md`
  o `DESIGN_SYSTEM.md`.
- Si una rutina tiene contraindicaciones (Wim Hof, Kapalabhati),
  disclaimer en `CONTENT.md` + modal de seguridad en el código.

### Testing manual (checklist antes de cerrar sesión)
- [ ] Pomodoro cuenta y termina → abre BreakMenu
- [ ] Respira: librería abre, modal de seguridad (Rondas), sesión con
      círculo animado
- [ ] Mueve: librería abre, sesión con pasos y countdown
- [ ] Hidrátate: +/− funciona, persiste al recargar
- [ ] Logros: al menos 1 se desbloquea automáticamente (`first.step`)
- [ ] Tweaks: cambiar paleta cambia colores, cambiar timer cambia visual
- [ ] Recargar página → estado persiste (localStorage)

### Degradación elegante
- Si `localStorage` falla → la app sigue en memoria (no crashea).
- Si una fuente no carga → fallback serif/sans del sistema.
- Si una animación es costosa → respetar `prefers-reduced-motion`.

### Privacidad
- **Todo local.** `localStorage` únicamente. Sin tracking, sin
  analytics, sin backend.
- Si algún día se añade sync online → opt-in explícito con disclaimer.

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

## 📚 Punteros finales

- Reglas y protocolos de sesión → [`AGENTS.md`](./AGENTS.md).
- Estado actual + backlog + decisiones → [`STATE.md`](./STATE.md).
- Tokens visuales y paletas → [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
- Catálogo de rutinas y logros → [`CONTENT.md`](./CONTENT.md).
- Visión a medio/largo plazo → [`ROADMAP.md`](./ROADMAP.md).
- Historial por versión → [`CHANGELOG.md`](./CHANGELOG.md).
- Diario completo de sesiones → [`docs/sessions/`](./docs/sessions/).
