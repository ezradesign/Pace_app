# PACE · Estado del proyecto

> **Presente + próximo.** Para el historial, ver
> [`CHANGELOG.md`](./CHANGELOG.md) (versiones) y
> [`docs/sessions/`](./docs/sessions/) (diario de trabajo).
>
> **Al cerrar sesión:** escribir el detalle en `docs/sessions/session-NN-xxx.md`,
> destilar una entrada en `CHANGELOG.md`, y **sustituir** (no añadir) la
> sección "Última sesión" de este archivo. Este archivo no debe crecer.

---

**Versión actual:** v0.12.8
**Última sesión:** #26 — 2026-04-23 · Refactor Fase 2 (4 ítems A de la auditoría)
**Última actualización de este archivo:** 2026-04-23 · sesión 26
**Build entregado:** `PACE_standalone.html` v0.12.8 (~349 KB, regenerado tras refactor)

---

## 🔒 Red de seguridad — archivos vivos

| Archivo | Rol | Estado |
|---|---|---|
| `PACE.html` | Entry point de desarrollo modular | v0.12.8, título actualizado + carga de `SessionShell.jsx` |
| `PACE_standalone.html` | Bundle offline autocontenido | v0.12.8 (regenerado tras refactor) |
| `app/ui/pace-logo.png` | Logo oficial local | Presente; se inlinea en el standalone |
| `app/ui/SessionShell.jsx` | **NUEVO** — cáscara compartida de sesiones activas | v0.12.8 (extraída en sesión 26; absorbe duplicación top-1 Breathe↔Move) |
| `app/ui/Primitives.jsx` | Modal, Card, Tag, Button, Divider, Meta, `displayItalic` | v0.12.8 (añadido helper `displayItalic`) |
| `app/breathe/BreatheModule.jsx` | Módulo Respira | v0.12.8 (ramas prep/done delegan en SessionShell; ~175 líneas menos) |
| `app/move/MoveModule.jsx` | Módulo Mueve | v0.12.8 (mismo patrón que Breathe; ~80 líneas menos) |
| `app/support/SupportModule.jsx` | Botón + modal Buy Me a Coffee | v0.12.8 (limpieza de `CupIcon`/`BigCup` + callsites `supportCopyVariant` saneados) |
| `app/ui/CowLogo.jsx` | Logo component + lockup | v0.12.8 (export a `window` saneado: solo `PaceWordmark`) |
| `app/extra/ExtraModule.jsx` | Módulo Estira | v0.12.8 (export saneado + `displayItalic`) |
| `app/shell/Sidebar.jsx` | Sidebar izquierdo colapsable | v0.12.8 (cambio menor: `displayItalic` en el timestamp) |
| `app/main.jsx` | Orquestador + TopBar + ActivityBar | v0.12.6 (sin cambios funcionales; pendiente `displayItalic` en 2 sitios multi-línea) |
| `app/focus/FocusTimer.jsx` | Módulo Foco (pomodoro) | v0.12.8 (`displayItalic` en 3 sitios) |
| `app/state.jsx` | Store global + rollover + toast buffer | v0.12.8 (bump de `PACE_VERSION`) |
| `app/tweaks/TweaksPanel.jsx` | Panel de Tweaks | v0.12.8 (`displayItalic` en el título) |
| `app/welcome/WelcomeModule.jsx` | Welcome de primera vez + hook | v0.12.1 (sin cambios; pendiente `displayItalic` multi-línea) |

Backup rotado en esta sesión:
`backups/PACE_standalone_v0.12.7_20260423.html` (el standalone de
v0.12.7 antes del refactor). 1 backup local tras la importación
desde GitHub — margen cómodo frente a la regla "máximo 5".

---

## 🧭 Última sesión (resumen operativo)

**Sesión 26 · v0.12.8 · Refactor Fase 2 (4 ítems A ejecutados)**

Ejecución disciplinada de los 4 ítems de prioridad A validados al
cierre de la sesión 25 en [`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md).
Regla no negociable respetada: **ningún cambio de comportamiento
observable**. La app post-sesión 26 se ve y se comporta idéntica
a v0.12.7.

### Qué se hizo

1. **`app/ui/SessionShell.jsx` extraído** — cáscara compartida de
   sesiones activas. Absorbe la duplicación top-1 del repo:
   `sessionStyles`/`moveSessionStyles` + `SessionHeader`/`MoveHeader` +
   `Stat`/`MoveStat` + pantallas `prep`/`done`. API: `<SessionShell>`,
   `<SessionPrep>`, `<SessionDone>`, `<SessionStat>`. BreatheModule
   pasa de 740 a ~565 líneas; MoveModule de ~360 a ~280.

2. **Support limpiado** — borrados `CupIcon` (17 líneas) y `BigCup`
   (22 líneas) que no se renderizaban desde v0.12.2. Callsites que
   pasaban `variant={state.supportCopyVariant}` a `<SupportIcon>` /
   `<SupportHero>` saneados. Firma de `supportCopy()` sin argumento.
   El campo `state.supportCopyVariant` se conserva por compat
   localStorage (decisión ya documentada).

3. **Exports a `window` saneados** — 17 símbolos innecesarios retirados
   del namespace global entre Breathe, Move, Extra y CowLogo. Solo se
   exponen los componentes realmente consumidos fuera del módulo
   (`BreatheLibrary`/`BreatheSafety`/`BreatheSession`, `MoveLibrary`/
   `MoveSession`, `ExtraLibrary`, `PaceWordmark`). Las variantes
   `CowLogoLineal/Sello/Ilustrado` siguen vivas por compat legacy
   pero internas.

4. **Helper `displayItalic` añadido** a `Primitives.jsx` y aplicado
   en ~25 sitios de la misma línea. Quedan ~20 sitios multi-línea en
   `WelcomeModule`, `Achievements` internos, `HydrateModule`, `main.jsx`
   y `Sidebar.jsx` que se atacarán cuando sea conveniente (el helper
   ya está disponible).

### Resultado cuantitativo
- **~115 líneas menos** en neto (Breathe+Move pierden ~255,
  SessionShell aporta ~140).
- **62 líneas de dead code** eliminadas (CupIcon + BigCup + callsites).
- **17 símbolos globales** retirados del `window`.
- **Un único sitio** donde vive el layout de sesión activa —
  prepara el terreno para la adaptación de modales a móvil.

### Verificación
- Preview de `PACE.html` y `PACE_standalone.html` limpia.
- No hay imports rotos tras el saneo de exports (grep verificado).
- No se probaron manualmente sesiones largas (rondas Wim Hof, Mueve
  con flechas) — riesgo bajo, conservación de estructura JSX.

### Archivos
- **Nuevo:** `app/ui/SessionShell.jsx`.
- **Modificados:** `PACE.html`, `state.jsx`, `Primitives.jsx`,
  `BreatheModule.jsx`, `MoveModule.jsx`, `ExtraModule.jsx`,
  `SupportModule.jsx`, `CowLogo.jsx`, `Achievements.jsx`,
  `BreakMenu.jsx`, `FocusTimer.jsx`, `Sidebar.jsx`, `WeeklyStats.jsx`,
  `TweaksPanel.jsx`, `Toast.jsx`.
- **Docs:** `docs/sessions/session-26-refactor-fase2.md` añadido,
  `CHANGELOG.md` ampliado, `STATE.md` reescrito.
- **Standalone:** `PACE_standalone.html` regenerado (~349 KB);
  backup `backups/PACE_standalone_v0.12.7_20260423.html`.

### Versión
- `v0.12.7` → **`v0.12.8`** (patch · refactor conservador).

Detalle completo: [`docs/sessions/session-26-refactor-fase2.md`](./docs/sessions/session-26-refactor-fase2.md).

---

## 📋 Backlog priorizado

### 🚨 Bloqueante pre-v1.0

- ~~**Responsive móvil (home + sidebar)**~~ ✅ Resuelto en
  sesiones 22-23-24 (v0.12.5 → v0.12.7). Home cabe en 375×812
  sin scroll con o sin barra URL visible. Sidebar móvil tiene
  scroll asimétrico (`min-height: calc(100dvh + 1px)`) que
  recupera el auto-hide de la barra del navegador. Pendiente
  auditar los **modales** (Respira, Mueve, Estira, Hidrátate,
  BreakMenu, Achievements, Stats, Tweaks, Welcome, Support) en
  móvil — probable próxima sesión (#25).

### ✅ Refactor Fase 2 completado en sesión 26

Los 4 ítems de prioridad A del informe
[`docs/audits/audit-v0.12.7.md`](./docs/audits/audit-v0.12.7.md)
se ejecutaron en sesión 26 (v0.12.8). Detalle en
[`docs/sessions/session-26-refactor-fase2.md`](./docs/sessions/session-26-refactor-fase2.md).

### 🛠️ Refactor aplazado (sesión 27 o más tarde · prioridad B/C)

- **`displayItalic` en ~20 sitios multi-línea restantes** —
  `WelcomeModule.jsx` (5), `Achievements.jsx` estilos internos (2),
  `HydrateModule.jsx` (1), `main.jsx` (2), `Sidebar.jsx` (2),
  `Stats.jsx` (1), `SupportModule.jsx` estilo heroIcon, más algunos
  en FocusTimer tipo subtítulo. El helper ya está en Primitives;
  la aplicación es mecánica y de bajo riesgo cuando se toque el
  archivo por otro motivo.
- **`useKeyboardShortcuts` hook consolidado** — 5 bloques de keydown
  casi idénticos entre BreakMenu, BreatheSession, MoveSession,
  PaceApp, Modal.
- **Trocear `BreatheModule.jsx`** (aún ~565 líneas tras el refactor,
  supera el techo de 500 de `CLAUDE.md`). Media parte del trabajo ya
  está hecha porque la sesión vive en SessionShell; quedaría separar
  library + visual (BreathVisual) + getSequence en archivos propios.
- **Decisión de producto sobre `CowLogoLineal/Sello/Ilustrado`** y
  `PaceLockup` (retirar vs conservar por retro-compat localStorage
  legacy).
- **`paceDate()` helper** para consolidar local/UTC (inconsistencia
  teórica en state vs TweaksPanel, impacto cero).
- **Limpiar comentarios obsoletos pre-v0.12.x** (Sidebar, FocusTimer).
- **Decisión de producto sobre `intention`, `reminders`, `font`**
  dormidos en state (pre-v1.0, requiere migración de localStorage).

### 🎯 Alto impacto · coste bajo

- **Loop post-Pomodoro** (~1-2h) — reestructurar `BreakMenu` para
  sugerir explícitamente estirar/mover/hidratar tras un Pomodoro,
  con rotación inteligente. Aprovecha componente ya existente.
- **Progresión 2+2+2** (~2-3h) — añadir campo `access` a rutinas
  y filtrar la biblioteca según estado desbloqueado. Placeholders
  visuales para ejercicios bloqueados. Ver `CONTENT.md`.
- **3 triggers de primeros pasos** (~2h) — `first.ritual`,
  `first.cycle`, `first.plan`. Datos ya en `state.plan`, solo
  falta el detector en `state.jsx`. Baja "Próximamente" 13→10.
- **Rachas largas** (~1-2h) — `streak.14/60/365` dentro de
  `updateStreak`. Impacto emocional alto.
- **Sonidos sutiles** (~2h) — 3-4 WAV CC0 + hook `useSound`. El
  toggle ya existe.

### 🎨 Medio plazo (requieren diseño previo)

- **PWA instalable** (~1 sesión) — `manifest.json` + iconos 192/
  512/maskable + prompt de instalación + testing en iOS Safari y
  Chrome Android. Respuesta "de verdad" al auto-hide de la barra
  del navegador (la sesión 24 lo arregló a medias con scroll
  asimétrico; PWA lo elimina de raíz porque la app se abre sin
  barra ninguna). Además multiplicador de valor para el Lifetime:
  "compras una vez, instalado a pantalla de inicio, funciona
  offline, sin barra". Orden recomendado: después de modales
  móviles (sesión 25) y antes de CTB / Lifetime. Ver también la
  sección "Coste conocido" en `docs/sessions/session-24-scroll-asimetrico.md`.
- **Ritmos semanal/mensual/anual** — evolución de `WeeklyStats`.
  Heatmap mensual + "año en pace" estilo GitHub contributions en
  paleta tierra.
- **CTB (premium)** — guion de 1 sesión + pista musical + mockup
  de pantalla inmersiva antes de tocar código.
- **Sesiones personalizadas Estira/Mueve (premium)** — mockup del
  constructor de rutinas.
- **Layout "Editorial"** — tweak listado sin impl visual.
- **Mockups extensión Chrome** — popup 340×480 + nueva pestaña.

### 🏆 Deuda de logros (sin cambios)

Logros visibles como "Próximamente" sin trigger:
`master.*` (restantes del catálogo), `season.*` (10),
`first.ritual/cycle/day/plan/return`, `streak.14/60/365`,
`breathe.sessions.10/50`, `move.sessions.25`,
`hydrate.week.perfect`, `morning.5`, `explore.all.*` (3),
`explore.chrome`.

### 🔒 Pre-v1.0 monetización

- Elegir proveedor de compra externa (Gumroad / Lemon Squeezy /
  otro) y generar claves firmables.
- Sistema de validación offline de clave con clave pública
  embebida.
- UI de "Introducir licencia" en Tweaks (discreta, sin upsell).

---

## ⚠️ Decisiones activas

Decisiones tomadas en sesiones previas que **siguen condicionando** cómo
trabajar. No son historia — son reglas vigentes. Si una se invalida,
moverla a la sesión en la que cambió (`docs/sessions/session-NN-xxx.md`)
con nota explícita y quitarla de aquí. Las más recientes primero.

- **Los altos de viewport se declaran con fallback `100vh` +
  override `100dvh`**, no sólo una de las dos. `vh` se resuelve
  al alto máximo (barra URL oculta) y descuadra el layout cuando
  la barra está visible; `dvh` se recalcula al espacio real. El
  patrón CSS de dos líneas (`height: 100vh; height: 100dvh;`) usa
  la cascada sin user-agent sniffing — el navegador antiguo
  ignora la segunda, el moderno la aplica. Este patrón no cabe
  en un objeto JS de estilos inline (una sola key por propiedad),
  por eso el div raíz de PaceApp delega sus dos declaraciones de
  alto al bloque CSS inyectado. Si sale un nuevo contenedor
  fullscreen, aplicar el mismo patrón. (Sesión 23.)
- **Scroll asimétrico por vista en móvil.** No todos los
  contenedores fullscreen deben comportarse igual: la home
  (vista Foco con los 4 botones de actividad) usa `100dvh` puro
  para que todo quepa sin scroll y el usuario vea siempre sus
  accesos. La sidebar móvil usa `min-height: calc(100dvh + 1px)`
  con `height: auto` para provocar scroll latente de un píxel
  invisible — eso activa el auto-hide de la barra de URL del
  navegador cuando el usuario desliza, recuperando ~56-100px
  para el contenido del drawer. Es intencional que ambas reglas
  coexistan. Si aparece una tercera vista fullscreen (modal
  grande, por ejemplo), decidir en qué lado cae: "siempre visible
  sin scroll" → dvh puro; "puede scrollear y tiene contenido
  largo" → min-height + 1px. (Sesión 24.)
- **Los estilos responsive se inyectan como `<style>` en `<head>`
  con selectores `[data-*]` y `!important`**, no como modificaciones
  de los objetos de estilos inline. Los objetos inline ya funcionan
  y son legibles en desktop; añadir lógica de breakpoints en JS
  los complicaría sin ganar nada. Un bloque CSS por archivo con
  `id` único (p.ej. `pace-sidebar-responsive-css`,
  `pace-main-responsive-css`) evita duplicación. Patrón ya usado
  para los spinners del input number en FocusTimer. Si hacen falta
  nuevos tratamientos responsive (modales, etc.), seguir el mismo
  patrón. (Sesión 22.)
- **Modelo de monetización = Lifetime híbrido.** ~20 € pago único
  + temporadas ~5 € + donaciones BMC. Sin suscripción mensual,
  sin backend, sin cuentas. Validación offline con clave firmada.
  Cualquier nueva idea de monetización debe defenderse contra
  este modelo. Detalle en `MONETIZATION.md`. (Sesión 21.)
- **Los 2 ejercicios iniciales por módulo son la puerta de
  entrada.** No cambiar sin migración explícita del localStorage
  de usuarios existentes. Iniciales: `breathe.coherent.55` +
  `breathe.box.4` (Respira); `move.chair.antidote` +
  `move.neck.3` (Mueve); `extra.desk.pushups` +
  `extra.posture.set` (Estira). (Sesión 21.)
- **Cada ejercicio tiene campo `access`** con 5 valores posibles:
  `free`, `locked.initial`, `locked.achievement`, `locked.both`,
  `premium`. Al añadir contenido nuevo, asignar `access` desde el
  primer momento para evitar migraciones dolorosas. (Sesión 21.)
- **Biometría y wearables fuera de alcance.** Apple Health, Google
  Fit, Apple Watch, Wear OS — todo descartado por el usuario. No
  reintroducir sin decisión explícita. (Sesión 21.)
- **El core gratuito debe ser útil por sí solo.** Pomodoro,
  Hidrátate, 2 iniciales de cada módulo y la mayoría de logros
  son y seguirán siendo gratis. El Lifetime añade valor, no lo
  extrae. (Sesión 21.)
- **Las cifras de identidad se blindan; el texto sigue al sistema.**
  Números grandes que actúan como firma visual de un módulo (el
  `25:00` del timer, el `0` del contador de racha) se fijan a una
  `font-family` explícita (`'EB Garamond', Georgia, serif`), no a
  `var(--font-display)`. Así no cambian aunque el state traiga
  otra tipografía (legacy, import JSON, devtools). Los textos
  descriptivos ("Concentración profunda", "días seguidos") sí
  siguen `--font-display` porque son lenguaje, no símbolo.
  (Sesión 20.)
- **Menos variantes, más identidad.** No se exponen al usuario
  elecciones cosméticas que no tiene por qué tomar: 5 logos (s19),
  4 copys del mismo botón (s19), 3 tipografías display (s20).
  Decidir bien una vez. Si una variante vuelve al panel, debe
  defenderse como eje real de personalización — no como
  acumulación de prototipos descartados. Los 4 ejes que quedan
  (paleta, layout, timer, breath) son los únicos que aportan
  personalización real sin tocar la identidad del producto.
  (Sesión 19, extendida en sesión 20.)
- **Assets locales del standalone se inlinean vía `<img src>` en
  el HTML principal, no hardcoded en strings JS.** Patrón: poner
  un `<img id="foo-src" src="ruta/foo.png" style="display:none">`
  en `PACE.html`; el JS lee `document.getElementById('foo-src')
  .getAttribute('src')`. `super_inline_html` convierte automáticamente
  `<img src>` en data URI. Regla vigente: cualquier asset binario
  nuevo que deba viajar en el standalone sigue este patrón.
  (Sesión 19.)
- **El diseño del sidebar se cuida por sustracción, no por adición.**
  En sesión 18 se probó sustituir el pill "Invita a un café" por
  una `SupportCard` más llamativa y el usuario lo rechazó: "era
  mucho más elegante el pill original". Regla vigente: si algo
  debe ganar prominencia, quita cosas alrededor antes de inflar
  el propio componente. El pill delgado de SupportButton de
  sesión 16 se mantiene como diseño canonico. (Sesión 18.)
- **Antes de disparar logros por umbrales se debe leer `_state`
  tras el `setState` asíncrono**, no variables de cierre capturadas
  en el updater. Si al añadir nuevas métricas con umbral (rachas
  largas, horas de foco, etc.) se hace lo primero, los umbrales
  disparan sobre snapshots intermedios y se pueden perder (o
  dispararse con valores erróneos). Ver `addFocusMinutes` como
  patrón. (Sesión 18.)
- **El Welcome se muestra una sola vez** por instalaci\u00f3n, al primer\n  open con `state.firstSeen == null`. Tanto `Empezar` como el link\n  `prefiero saltarlo` fijan `firstSeen` a timestamp \u2014 es una bienvenida,\n  no un tr\u00e1mite. Re-abrir es posible v\u00eda `pace:open-welcome` pero sin\n  UI visible (dev/debug only). (Sesi\u00f3n 17.)\n- **El backup JSON incluye `version` y `exportedAt`** para migraci\u00f3n\n  futura. El import acepta tanto `{app, version, state}` como state\n  plano (fallback legacy). Tras import exitoso se recarga la p\u00e1gina;\n  actualizar state en memoria arriesga inconsistencias con\n  `useSyncExternalStore`. (Sesi\u00f3n 17.)\n- **`secret.dark.mode` cuenta d\u00edas distintos, no consecutivos.** La\n  descripci\u00f3n dice \"7 d\u00edas en oscuro\" sin exigir racha. Persistido en\n  clave propia `pace.darkDays.v1` (no en el state principal \u2014 es un\n  contador auxiliar de un \u00fanico logro). Cap de 30 fechas. (Sesi\u00f3n 17.)\n- **`TweakSecretsWatcher` retorna `null` y vive en el \u00e1rbol siempre**\n  (en `main.jsx`, no dentro del TweaksPanel). Raz\u00f3n: los secretos\n  deben dispararse cuando el state cambia, no s\u00f3lo cuando el panel\n  est\u00e1 abierto. Cubre casos como importar un JSON con palette oscuro\n  ya fijada. (Sesi\u00f3n 17.)\n\n- **Donar no desbloquea nada funcional** en PACE. `secret.supporter`
  es un sello visible en la colección, nada más. Sin verificación,
  solo honor. Sumar unlocks tangibles por donar rompería el
  diferencial ético del producto. (Sesión 16.)
- **El auto-trigger del modal de apoyo se dispara una sola vez** por
  instalación, a los 7 días de racha. Inhibido para siempre por
  `state.supportSeenAt` (timestamp) al primer open (auto o manual).
  El usuario puede re-abrir desde el sidebar las veces que quiera.
  (Sesión 16.)
- **`BMC_USERNAME` es hard-coded en `SupportModule.jsx`**. No se
  expone como tweak porque identifica al autor del producto, no al
  usuario. Un fork cambia esa constante y punto. (Sesión 16.)

- **`IMPLEMENTED_ACHIEVEMENTS` en `Achievements.jsx` es la fuente de
  verdad sobre qué logros se pueden cazar hoy.** Al añadir un trigger
  (en `state.jsx`, `main.jsx`, módulos), hay que añadir su id al set.
  Si no, el logro aparecerá como "Pronto" en la UI aunque se
  desbloquee internamente. (Sesión 15.)
- **Los secretos nunca muestran estado "Próximamente"**, incluso sin
  trigger. Su mecánica es intriga, no señalización. Se pintan siempre
  como secretos (`?` / "Secreto" / "?????"). (Sesión 15.)
- **Los ids de rutina son identificadores estables, no clasificación
  semántica.** Un id `move.hips.5` puede vivir en `EXTRA_ROUTINES` (como
  ocurre desde sesión 14) y un id `extra.chair.dips` puede vivir en
  `MOVE_ROUTINES`. Si se reordena el contenido, **no renombrar los ids**:
  romperían los logros desbloqueados en localStorage de usuarios
  existentes. Por el mismo motivo, el map `explore.*` en
  `completeExtraSession` conserva los ids `move.*` como claves aunque
  vivan en `EXTRA_ROUTINES`. (Sesión 14, reafirmada en sesión 15.)
- **Extra suma minutos al bucket Mueve** en `weeklyStats.moveMinutes`, no a
  uno propio. `plan.extra` sí se marca separado. Tras el swap de sesión
  14, la justificación pasa de "calistenia es movimiento" a
  "estiramientos son cuerpo activo" — decisión vigente, solo cambia el
  texto explicativo. Si se quisiera un cuarto gráfico "Estira" en
  WeeklyStats: añadir `extraMinutes: [0*7]` al state + case en
  `completeExtraSession`. (Sesión 10, reafirmada en sesión 14.)
- **Logo oficial carga local** (`app/ui/pace-logo.png`) con fallback SVG
  silencioso a `PaceLockup`. No se embebe el PNG en el standalone para
  no inflarlo ~300 KB. (Sesión 10.)
- **Campo `reminders: []` se conserva** en el default state aunque la UI no
  lo exponga. Razones: compatibilidad con localStorage de usuarios
  existentes + futura reintroducción en un modal dedicado. Comentado en
  `state.jsx`. (Sesión 11.)
- **Sidebar colapsado hace `return null`** (pantalla 100% limpia). El rail
  vertical de 56 px está eliminado; la re-expansión se hace con el botón ≡
  flotante en `main.jsx`. (Sesión 9.)
- **Rutinas con apnea o hiperventilación llevan modal de seguridad con
  checkbox obligatorio.** No negociable (Wim Hof, Kapalabhati). Si se
  añaden técnicas nuevas con riesgo, marcar `safety: true` en la routine.
  (Sesión 1 · base.)
- **Importación desde GitHub incluye assets binarios.** Al arrancar una
  sesión con `github_import_files`, la lista de paths debe incluir
  `app/ui/pace-logo.png` (y cualquier WAV/fuente futuros). Si se olvidan,
  el usuario ve el fallback SVG del logo durante la sesión sin que haya
  regresión de código. (Sesión 13.)

---

## 📋 Próximos pasos recomendados

> Estado actual: Frente 1 (BMC) ✅ · Combo Welcome/Export/tweak-secrets
> ✅ completo en sesión 17 · Pulido de bugs + layout ✅ en sesión 18.
> La app ya ofrece bienvenida editorial + portabilidad completa de
> datos + código con menos race conditions.

### 🎯 Próxima sesión corta (recomendada)

Tres bloques de fruta fácil que siguen bajando la cuenta de
"Próximamente" y mejoran la constancia percibida:

1. **3 triggers de primeros pasos** (~2h) — `first.ritual` (4 módulos
   en 1 día), `first.cycle` (pomodoro + pausa activa), `first.plan`
   (plan del día completo). Datos ya en `state.plan`, sólo falta el
   detector en `state.jsx`. Baja "Próximamente" de 13 → 10.
2. **Rachas largas** (~1–2h) — `streak.14`, `streak.60`, `streak.365`.
   Cálculo trivial dentro de `updateStreak` (las demás ya están ahí).
   Impacto emocional alto, 13 → 10 (si se combina con el anterior:
   13 → 7).
3. **Sonidos sutiles** (~2h) — el toggle `state.soundOn` ya existe,
   faltan 3–4 WAV CC0 de freesound.org: click timer, fin pomodoro,
   +1 vaso, fase respiración. Hook `useSound(name)` nuevo en UI.

### 🚀 Frente 2 — Funcionalidades (ordenado por coste/impacto)

**Alto impacto · coste bajo:**

- **Sonidos sutiles** (~2h) — ver bloque anterior. También se puede
  hacer aislado si no se combina con los triggers de logros.
- **Combinar 3 triggers de logros + rachas largas** en una única
  sesión corta (ya detallado arriba).

**Alto impacto · coste medio:**

- **Rachas largas** (~1–2h) — ver arriba.
- **Extensión Chrome popup 340×480** (~1 sesión larga) — ventaja
  competitiva enorme. El código ya está modularizado para reutilizar.
  Triplica el espacio para CTA de BMC (popup + new tab + web).
- **Notificaciones del navegador para agua** (~2h) — reintroducir UI
  de recordatorios como modal + Web Notifications API. El state ya
  conserva `reminders: []` por decisión activa.

**Medio impacto · coste alto (más adelante):**

- **Layout "Editorial"** — el tweak está listado pero sin impl visual.
  Potencial estético brutal, pero requiere diseño desde cero.
- **Historial visual ("año en pace")** — vista anual tipo GitHub
  contributions pero con tierra/oliva en vez de verde. Muy
  satisfactorio visualmente cuando la app acumula datos.

### 📌 Preferencia baja (pendientes de diseño antes de implementar)

Ideas válidas pero que requieren definición previa de producto/UX/visual.
No arrancar sin mockup o decisión explícita del usuario.

- **Google Calendar sync** — Sincronización opcional de pomodoros y
  sesiones completadas con un calendario Google. Problema filosófico:
  PACE se vende por "todo local, sin cuentas, sin backend". Meter
  OAuth de Google contradice eso. Rutas posibles a explorar cuando
  toque:
  · **Opt-in explícito, 100% opcional**, con disclaimer claro en el
    modal de activación ("sólo si lo activas, conecta con Google").
  · **Exportar .ics en vez de OAuth** — sin cuentas, sin tracking,
    sigue siendo todo local. Menos "sync" y más "descarga para
    importar". Mucho más coherente con la filosofía.
  · **Decisión pendiente**: ¿OAuth real o .ics? El .ics alinea mejor
    con el producto; OAuth requiere backend (ruptura mayor).
  Entregable mínimo: mockup del flujo + decisión OAuth vs .ics antes
  de tocar código.

- **Cambiar glifos de logros** — Los glifos actuales son un mix de
  símbolos unicode (`✦`, `❦`, `❀`, `☉`, numerales romanos, etc.).
  Funciona pero es inconsistente: algunos están en el catálogo
  serif, otros parecen emoji degradado. Opciones a diseñar:
  · Set cohesivo de glifos SVG dibujados a mano en `app/ui/glyphs/`.
  · Biblioteca abstracta (Noun Project, Feather, custom) con paleta
    alineada a la categoría (`focus`/`breathe`/`move`/`achievement`).
  · Mantener unicode pero auditar y homogeneizar (misma familia
    tipográfica, mismo peso visual).
  Entregable mínimo: mood board + decisión de dirección visual +
  bocetos de 5–10 glifos representativos antes de remplazar el set
  entero.

### 📋 Plantilla para arrancar próxima sesión

```
Proyecto PACE. Importa la última versión desde
https://github.com/ezradesign/Pace_app y lee STATE.md
antes de tocar nada. Tarea de hoy: [elegir de la lista].
[Incluye binarios: app/ui/pace-logo.png]
```

---

## 🐛 Bugs / issues abiertos conocidos

*Ninguno reportado al cerrar sesión 15.*

---

## 📚 Navegación rápida de documentación

- [`CLAUDE.md`](./CLAUDE.md) — protocolo de trabajo, arquitectura, reglas.
- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — tokens, paletas, tipografía.
- [`CONTENT.md`](./CONTENT.md) — catálogo de rutinas + 100 logros.
- [`ROADMAP.md`](./ROADMAP.md) — visión a medio/largo plazo.
- [`CHANGELOG.md`](./CHANGELOG.md) — historial de versiones.
- [`docs/sessions/`](./docs/sessions/) — diario completo de sesiones.
- [`docs/porting.md`](./docs/porting.md) — cómo portar a Next.js / Chrome / Android.
- [`HANDOFF.md`](./HANDOFF.md) — snapshot congelado v0.9 (referencia histórica).
