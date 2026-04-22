# PACE · Foco · Cuerpo

> Web app de productividad y salud para quien pasa muchas horas sentado.
> Micro-intervenciones cuidadas a lo largo del día, no entrenamientos largos.

**Estado:** v0.11.3 · Pre-lanzamiento · Iteración de diseño
**Autor:** [@acuradesign](https://github.com/ezradesign)

---

## 🎯 Qué es

PACE es un "todo en uno" de bienestar para trabajo de oficina y remoto. Combina:

| Módulo | Qué hace |
|---|---|
| **Foco** | Pomodoro configurable (15 / 25 / 35 / 45 min) |
| **Respira** | 12 técnicas de breathwork (coherencia, box, 4-7-8, Wim Hof-like, pranayama) |
| **Mueve** | 7 rutinas de movilidad (caderas, hombros, ATG, ancestral, cuello, escritorio) |
| **Estira** | 7 ejercicios de calistenia discreta de oficina |
| **Hidrátate** | Tracker de vasos de agua |
| **Logros** | 100 sellos coleccionables estilo libreta de campo |

---

## 🎨 Filosofía

- **Calmado, artesanal, cuidado.** No gamificado agresivo.
- **Sin emojis** en la UI. Sin tipografías trilladas. Sin gradientes llamativos.
- Paleta tierra: crema, verde oliva, terracota, ocre.
- Tipografía serif italic (EB Garamond / Cormorant) para títulos.
- Copy corto, en español, tono cálido y literario.
- *Antídoto a la silla* como frame mental.

---

## 🚀 Cómo abrir el proyecto

### Desarrollo (modular, recomendado)
Abre `PACE.html` en cualquier navegador moderno. Carga cada JSX por separado desde `app/`.

### Offline (un solo archivo)
Abre `PACE_standalone.html`. Contiene todo inlineado y funciona sin servidor.

### Requisitos
Chrome/Edge 90+, Firefox 90+, Safari 14+. Nada de build step, nada de npm.

---

## 🏗️ Stack técnico

- **React 18.3.1** (UMD pinneado con SRI hashes)
- **Babel standalone 7.29.0** (transpila JSX en navegador)
- **Sin bundler, sin backend, sin dependencias npm**
- **Persistencia 100% en `localStorage`** — zero tracking

---

## 📁 Estructura

```
/
├── PACE.html                ← entry point de desarrollo
├── PACE_standalone.html     ← bundle offline
├── CLAUDE.md                ← reglas y protocolo del proyecto
├── STATE.md                 ← estado actual y próximos pasos
├── DESIGN_SYSTEM.md         ← tokens, paleta, tipografía
├── CONTENT.md               ← catálogo de rutinas + 100 logros
├── HANDOFF.md               ← documentación para retomar
├── CHANGELOG.md             ← historial de versiones
├── ROADMAP.md               ← visión a medio/largo plazo
│
└── app/
    ├── tokens.css · state.jsx · main.jsx
    ├── ui/          (Primitives, CowLogo, Toast)
    ├── shell/       (Sidebar)
    ├── focus/       (FocusTimer)
    ├── breathe/     (BreatheModule)
    ├── move/        (MoveModule)
    ├── extra/       (ExtraModule)
    ├── hydrate/     (HydrateModule)
    ├── breakmenu/   (BreakMenu)
    ├── achievements/(Achievements)
    ├── stats/       (WeeklyStats)
    └── tweaks/      (TweaksPanel)
```

---

## 🎛️ 6 ejes de personalización (Tweaks)

| Eje | Opciones |
|---|---|
| Paleta | crema · oscuro · envejecido |
| Tipografía | garamond · cormorant · mono |
| Layout | sidebar · minimal · editorial |
| Timer | número · aro (default) · círculo · barra · analógico |
| Círculo respiración | flor (default) · pulso · ondas · pétalo · orgánico |
| Logo | lineal · sello · ilustrado |

---

## 🧭 Referencias e inspiración

- **Respiración:** [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy)
- **Movilidad / ATG:** [Strengthside](https://www.youtube.com/@Strengthside)
- **Calistenia oficina:** [Jess Martin](https://www.youtube.com/@jessmartinm)

---

## 📜 Licencia

Por definir. Proyecto personal en desarrollo — no reutilizar contenido ni assets sin permiso.

---

## 🤝 Continuidad

El proyecto está diseñado para iterarse en múltiples sesiones con ayuda de asistentes de diseño. Ver [`CLAUDE.md`](./CLAUDE.md) para el protocolo de trabajo y [`HANDOFF.md`](./HANDOFF.md) para retomar el proyecto sin contexto previo.
