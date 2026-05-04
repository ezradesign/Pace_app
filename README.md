# PACE · Foco · Cuerpo

> Web app de productividad y salud para quien pasa muchas horas sentado.
> Micro-intervenciones cuidadas a lo largo del día, no entrenamientos largos.

**Estado:** v0.12.9 · Pre-lanzamiento · Iteración de diseño
**Build entregado:** `PACE_standalone.html` (standalone autocontenido)
**Autor:** [@ezradesign](https://github.com/ezradesign)
**Licencia del código:** [Elastic License 2.0](./LICENSE) — ver [§ Licencia](#-licencia)

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
├── PACE_standalone.html     ← bundle offline (inline, ~349 KB)
├── LICENSE                  ← Elastic License 2.0
├── CLAUDE.md                ← protocolo y arquitectura
├── STATE.md                 ← estado actual y próximos pasos
├── CHANGELOG.md             ← historial por versión
├── DESIGN_SYSTEM.md         ← tokens, paleta, tipografía
├── CONTENT.md               ← catálogo de rutinas + 100 logros
├── ROADMAP.md               ← visión a medio/largo plazo
├── HANDOFF.md               ← snapshot histórico v0.9 (referencia)
│
├── docs/
│   ├── porting.md           ← cómo portar a Next.js / Chrome / Android
│   └── sessions/            ← diario completo de cada sesión
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

## 🎛️ 5 ejes de personalización (Tweaks)

| Eje | Opciones |
|---|---|
| Paleta | crema · oscuro · envejecido |
| Tipografía | garamond · cormorant · mono |
| Layout | sidebar · minimal · editorial |
| Timer | aro (default) · círculo · barra · número · analógico |
| Círculo respiración | flor (default) · pulso · pétalo · ondas · orgánico |

> El logo y el copy del botón de apoyo eran tweaks configurables hasta
> v0.12.1. Desde v0.12.2 quedan fijos en la variante oficial para
> reforzar la identidad del producto.

---

## 🧭 Referencias e inspiración

- **Respiración:** [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy)
- **Movilidad / ATG:** [Strengthside](https://www.youtube.com/@Strengthside)
- **Calistenia oficina:** [Jess Martin](https://www.youtube.com/@jessmartinm)

---

## 📜 Licencia

El **código fuente** de PACE se publica bajo la [Elastic License 2.0](./LICENSE) — una licencia *source-available*. En claro, para lo que sueles querer saber:

**Puedes:**
- Leer, clonar, estudiar y modificar el código.
- Forkear el repositorio para uso personal, educativo o experimental.
- Proponer cambios vía pull request.

**No puedes:**
- Ofrecer PACE (o una versión modificada) **como servicio alojado o administrado** a terceros.
- **Eludir, desactivar o saltarte** el sistema de validación de licencia Lifetime / Pase.
- **Retirar** los avisos de licencia, copyright o marca.

### Lifetime, Pase y Temporadas ≠ licencia del código

La Elastic License 2.0 cubre el **código fuente** del repositorio. El **Lifetime**, el **Pase mensual** y las **Temporadas** son licencias comerciales **separadas**, aplicadas sobre el producto compilado (`PACE_standalone.html`) para habilitar contenido y funciones premium. Ver [`MONETIZATION.md`](./MONETIZATION.md) para el detalle del modelo de monetización.

### Otros usos

Para licencias comerciales alternativas (por ejemplo, uso interno de una organización que no encaje con los términos de la ELv2) abre un [issue en GitHub](https://github.com/ezradesign/Pace_app/issues) describiendo el caso y lo evaluamos.

---

## 🤝 Continuidad

El proyecto está diseñado para iterarse en múltiples sesiones con ayuda de asistentes de diseño. Para retomar el proyecto:

1. [`STATE.md`](./STATE.md) — estado actual y próximos pasos
2. [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo y arquitectura
3. [`docs/sessions/`](./docs/sessions/) — diario detallado de cada sesión
4. [`HANDOFF.md`](./HANDOFF.md) — snapshot histórico v0.9 (filosofía de base)
