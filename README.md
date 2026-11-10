# PACE · Foco · Cuerpo

> App de productividad y salud para quien pasa muchas horas sentado, en la web, en Android y en iPhone.
> Micro-intervenciones cuidadas a lo largo del día, no entrenamientos largos.

**Estado:** v0.196.0 · Pre-lanzamiento
**Web:** [pacegrass.app](https://pacegrass.app) · [PACE completo](https://pacegrass.app/premium) · [Pruébala en Android o en iPhone](https://pacegrass.app/beta)
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
| **Respira** | 20 técnicas de breathwork (coherencia, box, 4-7-8, Wim Hof-like, pranayama), 13 gratis |
| **Mueve** | 14 rutinas de fuerza discreta de oficina (para empezar, sigilo, con material y para ir a más), 7 gratis |
| **Estira** | 19 rutinas de movilidad (para empezar, oficina, hombros y columna, caderas y piernas, para ir a más), 15 gratis |
| **Hidrátate** | Tracker de vasos de agua |
| **Caminos** | 7 recorridos guiados sobre una lámina ilustrada, ocultos hasta después de v1 (no se ha borrado nada) |
| **Logros** | Sellos coleccionables estilo libreta de campo; el panel enseña los que ya se pueden ganar, y los demás aparecen el día que tengan su detector |
| **Estadísticas** | Hoy · semana · mes · año (heatmap) |

Además: una **bienvenida** que pregunta cómo es tu semana, el **constructor de rutinas
propias** y una **PWA** instalable que funciona sin conexión.

---

## 📊 Estado actual (v0.196.0)

| Área | Estado |
|---|---|
| A tu ritmo | La home pregunta «¿cuánto trabajas hoy?» y sirve la jornada: bloques de foco y pausas con nombre, según tu horario, y al acabar cada bloque el aviso del sistema te dice qué pausa toca. La carta sigue a un toque |
| Módulos principales | Foco · Respira · Mueve · Estira · Hidrátate — estables |
| Caminos | Sistema completo (biblioteca, runner por pasos, cierre, stats y heatmap anual), oculto hasta después de v1 con `SHOW_CAMINOS` en `app/flags.js` |
| Contenido de cuerpo | Contrato de pasos v1 (modo, lateralidad, dosis, requisitos) + preview «antes de empezar», y un dibujo propio para cada ejercicio de las rutinas |
| Logros | 96 en catálogo · 88 con detector activo · el panel solo enseña y cuenta los que se pueden ganar hoy · el arte que falta lo cuenta `docs/product/GLIFOS_A_DIBUJAR.md` |
| i18n | ES/EN completo, catálogos troceados por dominio |
| PWA | `manifest.webmanifest` + service worker con precache; fuentes self-hosted, cero peticiones externas |
| Android e iPhone | La misma app con Capacitor (`android/`, `ios/`): cada push a `main` compila el APK y el AAB firmado de Android y la app de iPhone. Android está en la prueba cerrada de Google Play e iPhone en TestFlight; las dos tiendas salen el mismo día, con v1 |
| PACE completo | Lo de pago pasa por un solo punto (`app/state-entitlement.jsx`); la licencia firmada existe desde v0.157.0 y hoy la llevan los códigos de los testers. En la web, `/premium` (con el de por vida; el mensual llega con v1), la compra con Stripe (comprobada en modo de prueba y aún sin encender), `/gracias`, `/recuperar` y `/desistir` (cerrada hasta conectar el correo); las condiciones, en borrador. En las apps no hay compra hasta v1. Hasta v1, PACE completo está abierto para todos |
| Robustez | Un dato guardado roto se repara solo (y lo ilegible queda en una copia de rescate) · los diálogos y las sesiones gestionan el foco y el teclado · la pantalla no se apaga en una sesión guiada · si una parte falla, se cierra solo esa parte (con una pantalla de rescate como último recurso) |
| Código | Más de 200 archivos de código en `app/` (.js, .jsx, .css), ninguno por encima de 500 líneas |
| Red de seguridad | `npm run verify` — sintaxis, build, análisis de ámbito del artefacto, coherencia de versión y lo que la web promete · `npm run test:e2e` — más de 1100 pruebas en un navegador real, en Chromium y en el motor de Safari, que el CI pasa en cada push |

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
- **Sin bundler.** npm solo aporta el toolchain de compilación
- **Capacitor** para las apps de Android y de iPhone, compiladas en GitHub Actions (también la de iPhone, sin Mac)
- **Persistencia en `localStorage` e IndexedDB** — sin servidor de datos, sin tracking. Las funciones de Cloudflare
  (`functions/api/`) solo atienden la compra en la web, el código de PACE completo, el desistimiento y la lista
  «Avísame»: ninguna recibe lo que haces en PACE
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
├── premium/ · beta/ · gracias/ · recuperar/ · desistir/   ← las páginas de la web
├── privacy.html · safety.html · legal/   ← privacidad, seguridad y los borradores legales
├── functions/api/           ← funciones de Cloudflare: compra, código, desistir, «Avísame»
├── android/ · ios/          ← las apps nativas (Capacitor)
│
├── docs/
│   ├── BUILD.md             ← cómo funciona el build
│   ├── WORKFLOW.md          ← protocolo de cierre Git
│   ├── product/             ← decisiones vigentes de producto y técnicas
│   ├── launch/              ← Google Play, App Store, cobro y lo legal
│   ├── traspaso/            ← para retomar el proyecto desde cero
│   ├── audits/              ← auditorías con evidencia
│   └── sessions/            ← diarios de sesión hasta octubre de 2026 (historia)
│
├── tests/                   ← las pruebas e2e (Playwright)
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
    ├── paths/       (Caminos, ocultos hasta después de v1: registro, runner, láminas, pasos)
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

El **núcleo de PACE es gratuito** y seguirá estándolo: el Foco entero, «A tu ritmo» de
cada día, 35 rutinas, Hidrátate, los logros y las estadísticas de hoy y de la semana.

**PACE completo** añade las 18 rutinas más profundas, tus propias rutinas, una semana que
aprende de ti y tu mes y tu año. Habrá dos planes, **19,99 € de por vida o 2,99 € al mes
con 7 días gratis**, sin crear una cuenta. Hasta **v1.0**, PACE completo está abierto para
todos y en la web solo se venderá el de por vida; en las apps no hay compra. Con v1.0
deja de estar abierto, llega el mensual y se podrá comprar también en Android y en iPhone.
La licencia ya existe (v0.157.0): un código firmado que la app comprueba por su cuenta y
que hoy llevan los testers.

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
advertencia de que su parte histórica está marcada como tal: hay
**dos planes** (19,99 € de por vida y, con v1, 2,99 € al mes), no cuatro vías.

### Otros usos

Para licencias comerciales alternativas (por ejemplo, uso interno de una organización que no encaje con los términos de la ELv2) abre un [issue en GitHub](https://github.com/ezradesign/Pace_app/issues) describiendo el caso y lo evaluamos.

---

## 🤝 Continuidad

El proyecto se itera en sesiones sucesivas con ayuda de asistentes de diseño. Para retomarlo:

1. [`STATE.md`](./STATE.md) — estado actual, backlog y próximos pasos (desde cero o desde otra cuenta,
   también [`docs/traspaso/LEEME.md`](./docs/traspaso/LEEME.md))
2. [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo y arquitectura
3. [`ROADMAP.md`](./ROADMAP.md) — el camino a v1.0
4. `git log` — qué cambió en cada versión y por qué (los diarios anteriores siguen en [`docs/sessions/`](./docs/sessions/))
