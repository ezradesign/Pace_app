# Auditoría integral de producto + técnica — v0.34.4 (sesión 88, 2026-06-30)

> **Read-only.** Sin cambios de código, sin bump. Pedida por el usuario tras
> cerrar F3b: "auditoría completa + proponer todo lo mejorable para ser la
> mejor app y más completa en su sector".
>
> Sector de referencia: productividad + bienestar de oficina — Forest,
> Pomofocus, Session (foco) · Stretchly, Time Out (pausas) · Breathwrk, Oak,
> Othership (respiración) · WaterMinder (hidratación) · Balance, Fabulous
> (hábitos guiados).

---

## 1 · Fortalezas ya diferenciales (no tocar, comunicar)

| # | Fortaleza | Por qué importa |
|---|---|---|
| F1 | **All-in-one coherente**: foco + respiración + movilidad + fuerza + hidratación + Caminos | Ningún competidor cubre los 5 dominios; todos obligan a 3-4 apps |
| F2 | **Local-first radical**: sin cuentas, sin telemetría, export/import JSON | Bandera de privacidad creciente en el sector; casi nadie puede afirmarlo |
| F3 | **Identidad visual propia**: paleta tierra, serif italic, 46+34 glifos SVG a mano | Frente al genérico Inter+gradientes del sector |
| F4 | **Seguridad en breathwork**: modal obligatorio en apnea/hiperventilación | Mejor práctica que apps grandes omiten; postura legal sólida |
| F5 | **Compra única planificada** (Lifetime + pase), donación separada honesta | El sector está saturado de suscripciones; el copy BMC ya es truthful (s85) |
| F6 | **Caminos**: secuencias curadas por momento del día | Concepto casi único; Balance lo roza, nadie lo tiene multi-dominio |
| F7 | PWA offline + standalone de un solo archivo + audio 100% sintetizado (0 assets) | Robustez y peso mínimo |
| F8 | Tracking auditado (s69, s86) e idempotente, índice lunes-primero | Integridad de datos por encima de la media |

---

## 2 · Hallazgos técnicos (por severidad)

### A-1 · MEDIA — Fuga premium vía Camino `path.weekend`
`app/paths/registry.js:73-74`: el Camino `path.weekend` (free) lanza
`breathe.nadi.shodhana` + `move.atg.knees`, ambos `premium` desde F3b. Los
steps de un Camino se ejecutan directos (`PathBreatheStep`/`PathBodyStep`),
**no pasan por `RoutineCard`** → puerta lateral gratuita a 2 rutinas premium.
Opciones: **(a)** declararlo *degustación curada* (decisión consciente, cero
código, incluso es marketing: "prueba lo premium dentro de un Camino");
**(b)** swap a rutinas free equivalentes; **(c)** marcar el Camino premium.
**Recomendación: (a)** a corto plazo, documentada como decisión activa;
revisar al crecer el catálogo (F5/F6). Registrado como **D-8** en STATE.

### A-2 · MEDIA — Logros encadenados a contenido premium
`explore.rounds`, `explore.nadi`, `explore.kapalabhati`, `explore.atg`,
`explore.ancestral` y `master.atg.20` requieren completar rutinas ahora
premium → un usuario free no puede completar la colección
(`master.collector.half/full`). Estándar en freemium, pero debe ser decisión
consciente: **(a)** aceptar (los sellos premium son parte del aliciente);
**(b)** excluir logros premium del denominador de colección. Decidir en F4-F6
cuando el catálogo crezca. Parte de **D-8**.

### A-3 · MEDIA — Service Worker sin limpieza ni revalidación
`sw.js`: el `activate` hace `clients.claim()` pero **no borra caches de
versiones anteriores** → cada release deja un cache `pace-vX.Y.Z` huérfano
ocupando storage del usuario para siempre. Además el fetch es cache-first puro
sin revalidación: un usuario puede quedarse en versión vieja hasta que el
navegador re-chequee el SW. Propuesta (pequeña, ~15 ln): en `activate`,
`caches.keys()` + borrar todo `pace-*` ≠ `CACHE_NAME`; para navegaciones HTML,
*network-first con fallback a cache* (offline sigue funcionando).

### A-4 · BAJA — `TweaksPanel.jsx` a 519 líneas (>500)
Tras la superficie premium de s88. Split natural: extraer
`app/tweaks/PremiumSection.jsx` (~45 ln) + script tag en PACE.html. Registrado
como deuda MEDIA de tamaño en STATE.

### A-5 · ALTA (impacto) / no urgente — Babel standalone compila en runtime
Cada carga compila ~60 archivos JSX en el navegador (también en el standalone:
Babel va inlineado). Coste real de arranque en móvil y primera visita, y ~1 MB
de Babel dentro del bundle. Propuesta para v1.0: **build precompilado**
(esbuild) que emita JS plano — `build-standalone.js` ya centraliza el pipeline
y ya usa el parser de TS, así que el salto es natural. Beneficios: arranque
casi instantáneo, bundle mucho menor, y desaparece la clase entera de errores
"Babel rompe en runtime". Riesgo: cambia el flujo dev (PACE.html con Babel
puede convivir como modo dev).

### A-6 · MEDIA (protección) — Sin tests automatizados del núcleo del state
`state-core` (rollover, reindex lunes-primero, history idempotente, streak) es
lo más delicado de la app y ya requirió dos auditorías manuales (s69, s86). Es
**lógica pura sin DOM** → testeable con Node sin tooling pesado. Propuesta:
`tests/state.test.js` (rollover día/semana, idempotencia archiveDay, streak
proactivo, migraciones) ejecutable con `node --test`; engancharlo como paso
opcional del build.

### A-7 · BAJA — Import JSON con validación superficial
`TweaksPanel.importJSON` acepta cualquier objeto con pinta de state. Un backup
corrupto/manipulado puede inyectar shapes que rompan el render (p. ej.
`weeklyStats` no-array). Propuesta: sanitizador al importar (coerción de tipos
clave sobre `defaultState`, reutilizando las migraciones defensivas de
`loadState`, que ya cubren parte).

### A-8 — Deudas ya registradas que siguen vigentes
D-1 override strings-content (3 keys) · D-2 duplicidad "Hecho hoy" · D-3
namespaces path/paths · D-4 15 glifos pendientes de aprobación · D-5
divergencia `move.desk.quick` paso 5 · D-6 strokeWidth wrapper G. Ninguna
urgente; D-4/D-5 se resuelven naturalmente en F5/F6 con aprobación del usuario.

---

## 3 · Gaps de producto frente al sector

| Capacidad | PACE hoy | Referente | Propuesta |
|---|---|---|---|
| **Recordatorios opt-in** (pausa, agua) | No (`reminders: []` dormido en state desde s37) | Stretchly, WaterMinder | **El gap nº 1.** Modal opt-in + Notification API local. Nunca por defecto, tono calmo. El state ya lo soporta |
| **Centinela de sedentarismo** | Solo BreakMenu post-pomodoro | Stretchly, Time Out | Aviso suave opcional tras X min sin pausa registrada ("llevas 90 min — ¿2 min de cuello?") |
| **Notificación fin de pomodoro en background** | Sonido + nada si la pestaña no está visible | Pomofocus | `document.title` countdown + Notification local opt-in. Sin backend |
| **Onboarding guiado** | Welcome de 1 pantalla | Balance, Fabulous | Tour de 3 pasos: elige tu ritmo → primera respiración de 2 min → conoce las pausas. Activación temprana = retención |
| **Profundidad contenido** | 12 + 7 + 7 rutinas | Breathwrk ~100 | Ya planificado (F4-F6 + CTB). Mantener curaduría sobre volumen |
| **Insight sobre stats** | Heatmaps + números | Rise, Exist | Feedback literario semanal (ya en ROADMAP) — diferenciador de tono perfecto |
| **Bloqueo de distracciones** | No | Forest, Opal, Session | Vía la extensión Chrome del roadmap: blocklist suave opcional durante Foco (cierra el círculo del pomodoro) |
| **Racha compasiva** | Rotura a 0 al fallar un día | (Duolingo freeze, agresivo) | "Pausa consciente" declarada (vacaciones/enfermedad) que congela sin culpa. Coherente con el tono anti-presión |
| **Dark mode automático** | Manual en Tweaks | Estándar | `prefers-color-scheme` como default inicial (el toggle manual ya existe y ganaría) |
| **Reduced motion** | No detectado en el código | Estándar a11y | `prefers-reduced-motion` en BreatheVisual/animaciones. En una app cuyo corazón es una animación de respiración, es a11y de primera clase |
| **Objetivo de hidratación configurable** | Fijo 8 (`water.goal` existe en state, sin UI) | WaterMinder | Input simple en Tweaks (4-16 vasos). Muy barato: el state ya lo soporta |
| **Atajos de teclado descubribles** | Existen por sesión, no hay ayuda | Superhuman-style | Overlay "?" con el mapa de atajos |
| **Manifest PWA rico** | Mínimo (18 ln) | Estándar | `shortcuts` (Foco 25 / Respira / +vaso), `screenshots` para el install sheet |
| **Tercer idioma** | ES + EN | — | FR/PT/DE post-v1.0; el split i18n de s81 lo deja preparado |
| **Landing pública** | index.html ES la app | Todos tienen landing | Mini-landing estática (manifiesto local-first + compra única + screenshots) con la app como demo a un clic |
| **Constructor de rutinas** | No | Casi nadie lo tiene | F7 — el diferenciador premium más fuerte del plan. Mantener |
| **Sesiones largas guiadas** | No | Othership, Breathwrk | CTB + modo Retiro (roadmap) — el ancla del premium |
| **Widget / newtab** | No | Momentum | Extensión Chrome (roadmap) + widget Android (v2.0) |

---

## 4 · Priorización recomendada

### P0 — decisiones + fixes pequeños (1 sesión entre todos)
1. **Decidir D-8** (fuga `path.weekend` + logros premium) — 0-poco código.
2. **A-3 SW**: cleanup de caches viejos + network-first para HTML (~15 ln).
3. **`prefers-reduced-motion` + dark auto** — a11y base de una app de bienestar.
4. **Objetivo de hidratación en Tweaks** — cierra un gap evidente, barato.

### P1 — el bloque actual sigue siendo lo correcto (F4 → F8)
Contenido Respira/Estira/Mueve + constructor + visual Caminos, tal como está
planificado. Intercalar (1 sesión c/u): **onboarding 3 pasos**,
**recordatorios opt-in** (el gap nº 1 del sector), **notificación fin de
pomodoro**.

### P2 — camino a v1.0 (calidad de release)
Build precompilado (A-5) · tests del state (A-6) · import sanitizado (A-7) ·
split TweaksPanel (A-4) · manifest rico · landing + Términos/Privacidad ·
licencia offline · extensión Chrome (popup + newtab + bloqueo suave).

### P3 — post-v1.0
Android v2 (Capacitor + widget) · tercer idioma · racha compasiva · retos
semanales sin presión · feedback literario · health sync opcional.

---

## 5 · Qué NO hacer (proteger la identidad)

- **Nada de presión**: ni streaks rojos, ni push por defecto, ni badges
  ruidosos. La calma ES el producto — es la razón para elegir PACE sobre
  Forest.
- **Ni cuentas ni suscripción obligatoria.** Local-first es la promesa.
- **No vídeos de stock**: los glifos line-art son la voz visual. Antes de
  plantearse vídeo, animar los glifos (SMIL/CSS) — más barato y más PACE.
- **No abrir módulos nuevos** (sueño, meditación larga, nutrición) antes de
  v1.0. Profundidad sobre anchura: el sector castiga a las apps "de todo un
  poco" sin alma.

---

*Auditoría de sesión 88 (anexo post-cierre v0.34.4). Hallazgos accionables
registrados: D-8 + TweaksPanel 519 ln en `STATE.md`. Las propuestas P0-P3
pasan a ROADMAP/STATE cuando el usuario las priorice.*
