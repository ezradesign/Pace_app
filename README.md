# PACE · Foco · Cuerpo

> Web app de productividad y salud para quien pasa muchas horas sentado.
> Micro-intervenciones cuidadas a lo largo del día, no entrenamientos largos.

**Estado:** v0.97.0 · Pre-lanzamiento
**Build entregado:** `index.html` — artefacto web/PWA, instalable y offline
**Autor:** [@ezradesign](https://github.com/ezradesign)
**Licencia del código:** [Elastic License 2.0](./LICENSE) — ver [§ Licencia](#-licencia)
**English:** [`README_EN.md`](./README_EN.md)

---

## 🎯 Qué es

PACE es un "todo en uno" de bienestar para trabajo de oficina y remoto: ciclos de
foco y micro-pausas de respiración, movilidad e hidratación, encadenadas en rutinas
guiadas.

| Módulo | Qué hace |
|---|---|
| **Foco** | Pomodoro configurable (15 / 25 / 35 / 45 min) con ciclos y pausas |
| **Respira** | 20 técnicas de breathwork (coherencia, box, 4-7-8, Wim Hof-like, pranayama) |
| **Mueve** | 14 rutinas de movilidad (caderas, hombros, ATG, ancestral, cuello, escritorio) |
| **Estira** | 14 rutinas de calistenia discreta de oficina |
| **Hidrátate** | Tracker de vasos de agua |
| **Caminos** | 7 recorridos guiados que encadenan pasos de foco, respiración, cuerpo e hidratación sobre una lámina ilustrada |
| **Logros** | 96 sellos coleccionables estilo libreta de campo |
| **Ritmo** | Estadísticas por semana · mes · año (heatmap) · Caminos |

Además: **onboarding** de primera vez que propone tu primer Camino, **constructor de
rutinas propias**, y **PWA** instalable que funciona sin conexión.

---

## 📊 Estado actual (v0.97.0)

| Área | Estado |
|---|---|
| Módulos principales | Foco · Respira · Mueve · Estira · Hidrátate — estables |
| Caminos | Sistema completo: biblioteca, runner por pasos, pantalla de cierre, stats y heatmap anual |
| Contenido de cuerpo | Contrato de pasos v1 (modo, lateralidad, dosis, requisitos) + preview «antes de empezar» |
| Logros | 96 en catálogo · 88 con detector activo · 58 con arte propio |
| i18n | ES/EN completo, catálogos troceados por dominio |
| PWA | `manifest.webmanifest` + service worker con precache; fuentes self-hosted, cero peticiones externas |
| Premium | Guard central de entitlement listo; la licencia real aún no existe |
| Código | 97 archivos en `app/`, ninguno por encima de 500 líneas |
| Red de seguridad | `npm run verify` — sintaxis, build, análisis de ámbito del artefacto y coherencia de versión |

---

## 🎨 Filosofía

- **Calmado, artesanal, cuidado.** No gamificado agresivo.
- **Sin emojis** en la UI. Sin tipografías trilladas. Sin gradientes llamativos.
- Paleta tierra: crema, verde oliva, terracota, ocre.
- Tipografía serif italic (Cormorant Garamond) para títulos.
- Copy corto, en español, tono cálido y literario.
- Tus datos viven en tu dispositivo. Sin cuentas, sin analytics, sin cookies.
- *Antídoto a la silla* como frame mental.

---

## 🚀 Cómo abrir el proyecto

### Desarrollo (modular)
Abre `PACE.html` con un servidor estático. Carga cada JSX por separado desde `app/`
y transpila en el navegador con Babel standalone.

### Web / PWA (lo que se publica)
`index.html` es el artefacto canónico: todo compilado e inlineado, sin Babel en
tiempo de ejecución. Sírvelo por HTTP para que el service worker y la instalación
funcionen — abrirlo con `file://` desactiva las dos cosas.

### Compilar
```bash
npm install && npm run build
```

### Antes de publicar
```bash
npm run verify
```

### Requisitos
Chrome/Edge 90+, Firefox 90+, Safari 14+. Node 18+ solo para compilar.

---

## 🏗️ Stack técnico

- **React 18.3.1** (UMD de producción, self-hosted en `vendor/`)
- **Babel standalone 7.29.0** — **solo en desarrollo**; el build compila el JSX a JS
  plano por adelantado y retira Babel del artefacto
- **Sin bundler y sin backend.** npm solo aporta el toolchain de compilación
- **Persistencia en `localStorage`** — sin servidor de datos, sin tracking
- **Fuentes self-hosted** (Cormorant Garamond, EB Garamond, Inter Tight)

---

## 📁 Estructura

```
/
├── PACE.html                ← entry point de desarrollo
├── index.html               ← artefacto WEB/PWA canónico
├── PACE_standalone.html     ← export offline de un solo archivo, bajo demanda
├── build-standalone.js      ← genera ambos artefactos
├── manifest.webmanifest · sw.js
├── LICENSE                  ← Elastic License 2.0
├── CLAUDE.md · STATE.md · CHANGELOG.md
├── DESIGN_SYSTEM.md · CONTENT.md · ROADMAP.md · MONETIZATION.md
│
├── docs/
│   ├── BUILD.md             ← cómo funciona el build
│   ├── WORKFLOW.md          ← protocolo de cierre Git
│   ├── product/             ← decisiones vigentes de producto y técnicas
│   ├── audits/              ← auditorías con evidencia
│   └── sessions/            ← diario de trabajo, una entrada por sesión
│
├── scripts/                 ← verify, ingesta de arte, utilidades
├── vendor/                  ← React UMD self-hosted
├── fonts/                   ← subsets latin self-hosted
│
└── app/
    ├── tokens.css · state*.jsx · main.jsx · flags.js
    ├── ui/          (Primitives, SessionShell, CowLogo, Toast, TimerDial…)
    ├── shell/       (Sidebar)
    ├── focus/       (Pomodoro)
    ├── breathe/     (visual, biblioteca, sesión guiada)
    ├── move/ · extra/   (Mueve y Estira + runner de pasos v1)
    ├── hydrate/ · breakmenu/ · achievements/ · stats/
    ├── paths/       (Caminos: registro, runner, láminas, pasos)
    ├── custom/      (constructor de rutinas propias)
    ├── onboarding/ · support/ · tweaks/
    ├── glyphs/      (arte de ejercicios y de logros)
    └── i18n/        (catálogos ES/EN por dominio)
```

---

## 🎛️ Personalización

| Eje | Opciones |
|---|---|
| Paleta | crema (día) · oscuro (noche) · papel envejecido |
| Idioma | español · inglés |

La paleta oscura se autodetecta del sistema en el primer arranque; la elección
manual persiste y siempre gana después.

> **Ejes dormidos.** Estilos de timer (barra, analógico) y el círculo «orgánico» de
> Respira existen en el código pero están **apagados por bandera** en
> [`app/flags.js`](./app/flags.js): se retiraron por criterio visual, no porque
> estorben, y la bandera los devuelve en una línea. Los ejes de tipografía y layout
> tampoco tienen control en Ajustes. No borres esas ramas sin leer la cabecera del
> archivo.

---

## 💛 Gratuito y Premium

El **núcleo de PACE es gratuito** y seguirá estándolo: los cinco módulos, los ciclos
de foco, los logros y las estadísticas.

**Premium** ampliará rutinas, técnicas y Caminos mediante una **compra única** —
sin suscripción y sin cuenta obligatoria. **v1.0 será la primera versión pagada**;
hasta entonces el sistema de licencia no existe y todo lo construido es accesible.

---

## 🧭 Referencias e inspiración

- **Respiración:** [Breathe With Sandy](https://www.youtube.com/@BreatheWithSandy)
- **Movilidad / ATG:** [Strengthside](https://www.youtube.com/@Strengthside)
- **Calistenia oficina:** [Jess Martin](https://www.youtube.com/@jessmartinm)

Los contenidos de Mueve y Estira se apoyan en material público de NHS, ACSM y OMS.
**No son consejo médico.** Las técnicas con retención de aire llevan siempre un
aviso de seguridad antes de empezar.

---

## 📜 Licencia

El **código fuente** de PACE se publica bajo la [Elastic License 2.0](./LICENSE) — una licencia *source-available*. En claro, para lo que sueles querer saber:

**Puedes:**
- Leer, clonar, estudiar y modificar el código.
- Forkear el repositorio para uso personal, educativo o experimental.
- Proponer cambios vía pull request.

**No puedes:**
- Ofrecer PACE (o una versión modificada) **como servicio alojado o administrado** a terceros.
- **Eludir, desactivar o saltarte** el sistema de validación de licencia.
- **Retirar** los avisos de licencia, copyright o marca.

### La licencia comercial ≠ la licencia del código

La Elastic License 2.0 cubre el **código fuente** del repositorio. La licencia
**Premium** es una licencia comercial **separada**, aplicada sobre el producto
compilado para habilitar contenido y funciones premium. Ver
[`MONETIZATION.md`](./MONETIZATION.md) para el detalle del modelo — con la
advertencia de que su parte histórica está marcada como tal: al lanzamiento hay
**un solo plan**, no cuatro vías.

### Otros usos

Para licencias comerciales alternativas (por ejemplo, uso interno de una organización que no encaje con los términos de la ELv2) abre un [issue en GitHub](https://github.com/ezradesign/Pace_app/issues) describiendo el caso y lo evaluamos.

---

## 🤝 Continuidad

El proyecto se itera en sesiones sucesivas con ayuda de asistentes de diseño. Para retomarlo:

1. [`STATE.md`](./STATE.md) — estado actual, backlog y próximos pasos
2. [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo y arquitectura
3. [`ROADMAP.md`](./ROADMAP.md) — el camino a v1.0
4. [`docs/sessions/`](./docs/sessions/) — diario detallado de cada sesión
