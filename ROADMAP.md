# Roadmap

Visión a medio y largo plazo de PACE.
Para el estado del día a día, ver [`STATE.md`](./STATE.md).
Para el catálogo de contenido, ver [`CONTENT.md`](./CONTENT.md).
Para el modelo de monetización, ver [`MONETIZATION.md`](./MONETIZATION.md).

> **Recreado en sesión 85 (2026-06-05, v0.34.1)** tras ~60 sesiones
> borrado (commit `be81606`). Refleja lo ya hecho hasta v0.34.0 y el
> plan vigente del bloque Contenido+Premium.

---

## ✅ Hecho desde el roadmap original (s21 → s84)

Buena parte de la visión de corto/medio plazo de 2026-04 ya está en
producción:

- **Responsive móvil** — sidebar fullscreen + home en viewport (s22+).
- **Loop post-Pomodoro** — `BreakMenu` con sugerencias de pausa activa.
- **Ritmos** — vistas semanal / mensual / anual (heatmaps) (s43-s54).
- **Sonidos** — sintetizados con Web Audio (432 Hz), no WAVs (s28+).
- **Caminos** — secuencias guiadas por hora del día, 7 caminos (s49-s80).
- **i18n ES/EN completo** + PWA en Cloudflare Pages.
- **Logros** — catálogo de 106 (69 activos) con glifos heráldicos.
- **Sistema de glifos** de ejercicios (line-art) — iter cerrado 31/46 (s84).

---

## 🎯 Bloque actual — Contenido + Premium (post-v0.34.0)

Bloque grande en fases (1 fase = 1 sesión cerrable). Planificado en la
Fase 0 (s84-bis / 2026-06-05). Detalle de catálogo en [`CONTENT.md`](./CONTENT.md).

| Fase | Alcance | Estado |
|---|---|---|
| **F1** | Copy Buy Me a Coffee (truth-fix) + recrear `CONTENT.md` y `ROADMAP.md` | **hecho (s85, v0.34.1)** |
| **F2** | Auditoría de tracking punta a punta + micro-fixes | **hecho (s86, v0.34.2)** — tracking sano + fix F-1 |
| **F3a** | Mecanismo de gating: token `--premium` + `PremiumSeal` + `RoutineCard` lee `access` (sello + "Pronto" + clic off) | **hecho (s87, v0.34.3)** — dormante, todas las rutinas `free` |
| **F3b** | Activación: gating encendido sobre rutinas existentes (8 premium / 26, binario free/premium) + `premiumUnlocked` cableado (sin compra real) + superficie premium display-only en Tweaks | **hecho (s88, v0.34.4)** — `locked.*` y licencia real diferidos a post-v1.0 |
| **F4** | Contenido Respira → ~20 técnicas (incl. CTB largas premium, con seguridad) | **hecho (s90, v0.35.0)** — 20 técnicas, 8 premium; `rounds.long` 5×35 como precursora CTB; la experiencia CTB completa queda para post-bloque (abajo) |
| **F5** | Contenido Estira → ~12-15 rutinas (~mitad premium), categorizado | **hecho (s91, v0.36.0)** — 14 rutinas, 6 premium, 4 grupos como Respira; 11 pasos nuevos con DefaultGlyph (cola D-4) |
| **F6** | Contenido Mueve → ~12-15 rutinas (~mitad premium), reclasifica la fuerza | **hecho (s92, v0.37.0)** — 14 rutinas, 6 premium, 4 grupos free-first (`mueve.cat.*`); 9 pasos nuevos con DefaultGlyph (cola D-4 → 35); strings-content.js troceado en `app/i18n/content/` |
| **F7** | Registro interno de ejercicios + **constructor de rutinas premium** (`custom.sequence`) | pendiente |
| **F8** | Visual de Caminos — auditoría DESIGN_SYSTEM + polish de los 6 componentes | pendiente |

**Decisión clave:** el gating va **antes** del contenido (no se puede
etiquetar `access` con honestidad sin el campo ni el sello). La unidad
gateable es la sesión, no el ejercicio suelto (ver `CONTENT.md`).

---

## 🌱 Medio plazo — tras el bloque

### CTB · Respiración en Trance Consciente (premium)
Sesiones largas (20-45 min): música ambiental sin voz, respiración
guiada prolongada, retenciones conscientes, timer silencioso con hitos
visuales. 4-6 sesiones en el lanzamiento Lifetime. Entregable mínimo
antes de código: guion de 1 sesión + pista musical + mockup inmersivo.
(F4/s90 dejó la precursora `breathe.rounds.long` 5×35 en el catálogo;
converge con el modo "Retiro".)

### Retos semanales (opcional)
Reto que aparece el lunes (ej: "3 sesiones de Respira"). Sin penalización.
Al completarlo, sello de colección. Sin presión.

### Notificaciones inteligentes (opt-in)
El state ya conserva `reminders: []`. Reintroducir UI como modal opt-in:
hidratación, pausa activa tras X horas, sugerencia contextual. Nunca por
defecto, sin spam.

### Feedback literario en Ritmos
Texto breve al cerrar semana/mes que contextualiza sin juzgar
("semana de foco profundo, menos movilidad — mañana suave"). Literario,
no numérico.

### Extensión Chrome
Popup 340×480 (resumen + acciones rápidas) + nueva pestaña (newtab
pantalla completa). Manifest V3, permisos mínimos (`storage`, `alarms`),
persistencia vía `chrome.storage`.

---

## 🌲 Largo plazo — v1.0+

### Lanzamiento pagado v1.0
Ver [`MONETIZATION.md`](./MONETIZATION.md). Lifetime ~20 € + Pase mensual
3,99 € + Temporadas ~5 € + donaciones BMC. Validación de **clave firmada
offline** (sin backend, sin cuentas). Pre-requisitos: bloque
Contenido+Premium cerrado, ≥2 CTB grabadas, constructor de rutinas
funcional, Términos + Privacidad redactados por abogado.

### App Android (v2.0)
Wrapping (Capacitor/Expo), layout móvil heredado del responsive, widget
de inicio (próximo break + vasos).

### Modo "Retiro"
Sesión larga combinando respiración + movilidad con música opcional.
Cercano a CTB — podrían converger en una sección "sesiones largas".

---

## 💭 Ideas sueltas (explorar / descartar)

- Reloj de escritorio (Electron ligero).
- Exportar `.ics` del plan del día (sin OAuth, alineado con "todo local").
- Plugin Notion / Obsidian ("espacio de respiración" entre bloques).

---

## 🚫 Fuera de alcance (nunca)

- Gamificación agresiva (rachas rojas, push abrumador).
- Emojis en la UI.
- Tracking / analytics sin opt-in explícito.
- Publicidad o monetización intrusiva.
- Suscripción mensual clásica con renovación automática (ver `MONETIZATION.md`).
- Consejos médicos sin disclaimer en técnicas de riesgo.
- Copia literal de listas de rutinas de terceros.
- Biometría / wearables (decisión s21 — no encaja con el tono artesanal).
