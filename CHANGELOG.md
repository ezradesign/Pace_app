# Changelog

Todos los cambios notables del proyecto PACE.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).
Versionado semántico informal — ver [`CLAUDE.md`](./CLAUDE.md#versionado-semántico-informal).

**Convención:** este archivo solo detalla las **2 últimas versiones**. Para
versiones anteriores, la tabla enlaza al diario completo en
[`docs/sessions/`](./docs/sessions/).

---

## Historial completo

| Versión | Fecha | Título | Sesión | Detalle |
|---|---|---|---|---|
| **v0.12.3** | 2026-04-22 | Timer: número gigante con más aire sobre el subtítulo + pill "Otro" para minutos personalizados | #20 | [abajo ↓](#v0123--2026-04-22--timer-aire-y-minutos-personalizados) |
| **v0.12.2** | 2026-04-22 | Pill de apoyo consolidada + Tweaks de logo/copy retirados + standalone autocontenido | #19 | [session-19-pill-consolidada-standalone.md](./docs/sessions/session-19-pill-consolidada-standalone.md) |
| v0.12.1 | 2026-04-22 | Pulido: bugs de race condition, sidebar más limpio, Welcome compacto | #18 | [session-18-pulido-bugs-layout.md](./docs/sessions/session-18-pulido-bugs-layout.md) |
| v0.12.0 | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | [session-17-welcome-export.md](./docs/sessions/session-17-welcome-export.md) |
| v0.11.11 | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | [session-16-bmc-integracion.md](./docs/sessions/session-16-bmc-integracion.md) |
| v0.11.10 | 2026-04-22 | Logros: arreglo `explore.*` + estado "Próximamente" | #15 | [session-15-logros-proximamente.md](./docs/sessions/session-15-logros-proximamente.md) |
| v0.11.9 | 2026-04-22 | Swap Mueve ↔ Estira: contenido reubicado + título del modal | #14 | [session-14-swap-mueve-estira.md](./docs/sessions/session-14-swap-mueve-estira.md) |
| v0.11.8 | 2026-04-22 | Backlog de robustez: 6 bugs del informe de auditoría | #13 | [session-13-backlog-robustez.md](./docs/sessions/session-13-backlog-robustez.md) |
| v0.11.7 | 2026-04-22 | Barra horizontal del sidebar: logo 2.5× + iconos gráficos | #12 | [session-12-barra-horizontal.md](./docs/sessions/session-12-barra-horizontal.md) |
| v0.11.6 | 2026-04-22 | Limpieza sin riesgo: dead code del backlog de auditoría | #11 | [session-11-limpieza.md](./docs/sessions/session-11-limpieza.md) |
| v0.11.5 | 2026-04-22 | Auditoría: 7 bugs críticos + logo local | #10 | [session-10-auditoria.md](./docs/sessions/session-10-auditoria.md) |
| v0.11.4 | 2026-04-22 | Timer "Aro" alineado a referencia visual | #9 | [session-09-timer-aro.md](./docs/sessions/session-09-timer-aro.md) |
| v0.11.3 | 2026-04-22 | Logo oficial v2, Tweaks topbar-derecha, viewport 1920×1080 | #8 | [session-08-logo-oficial.md](./docs/sessions/session-08-logo-oficial.md) |
| v0.11.2 | 2026-04-22 | Sidebar colapsable, Sendero, logo Pace. lockup | #7 | [session-07-sidebar-sendero.md](./docs/sessions/session-07-sidebar-sendero.md) |
| v0.11.1 | 2026-04-22 | Iconos ActivityBar restaurados | #6 | [session-06-iconos-activitybar.md](./docs/sessions/session-06-iconos-activitybar.md) |
| v0.11.0 | 2026-04-22 | Fortalecimiento del proyecto: README, CHANGELOG, ROADMAP | #5 | [session-05-fortalecimiento.md](./docs/sessions/session-05-fortalecimiento.md) |
| v0.10.1 | 2026-04-22 | Reorganización modular post-GitHub | #4 | [session-04-reorganizacion.md](./docs/sessions/session-04-reorganizacion.md) |
| v0.10 | 2026-04-22 | Pulido del core (Respira + Mueve) | #3 | [session-03-pulido-core.md](./docs/sessions/session-03-pulido-core.md) |
| v0.9.2 | 2026-04-22 | Refinamiento post-feedback: Aro + Flor + Estira | #2 | [session-02-refinamiento.md](./docs/sessions/session-02-refinamiento.md) |
| v0.9 | 2026-04-22 | Base inicial — 14 JSX + 100 logros + 5 módulos | #1 | [session-01-base.md](./docs/sessions/session-01-base.md) |

---

## [v0.12.3] — 2026-04-22 — Timer: aire + Otro + tipografía blindada + tweak retirado

Sesión de pulido que empezó con dos peticiones concretas del usuario
y derivó en cuatro decisiones que refuerzan la filosofía de sesión 19
("menos variantes, más identidad"). Las cifras de identidad se
blindan a EB Garamond, y el tweak de tipografía display se retira:
si PACE ya tiene una identidad tipográfica decidida (Cormorant
default + EB Garamond en cifras), dejar al usuario elegir entre 3
alternativas no aporta.

### Cambiado
- **`app/focus/FocusTimer.jsx` · separación número ↔ subtítulo** — en
  el estilo Aro (default) el `marginTop` del subtítulo pasa de 10 →
  30 (+20px de aire). Los estilos Number y Circle reciben la misma
  separación proporcional. Resultado: el número gigante respira, el
  divisor inferior queda limpio, y la composición del aro gana
  jerarquía tipográfica. No afecta a Bar ni Analog (otras
  composiciones).
- **`app/focus/FocusTimer.jsx` · `MinutesPicker` con opción "Otro"** —
  después del preset 45 se añade una etiqueta "Otro" con el mismo
  tratamiento tipográfico que "MIN" (uppercase, 10px,
  letter-spacing 0.18em, color `--ink-3`, peso 500), separada con
  un margen izquierdo de 6px que deja claro que pertenece a otra
  categoría visual que los numerales. Al clickar se expande a un
  `<input type="number">` inline. Rango válido: 1–180 min. Enter o
  blur confirma, Escape cancela. Si el valor actual no es preset,
  la etiqueta cambia a una pill numeral activa con el valor, que
  se integra con `15/25/35/45`. Los spinners nativos del
  `<input type="number">` quedan ocultos vía CSS para respetar la
  densidad calmada de la línea de presets.

### Notas de diseño
- **Rango 1–180.** Cubre desde pomodoros ultra-cortos (micro-sesiones
  de 1–5 min) hasta deep work real (hasta 3h). Por encima entra en
  territorio donde ya no es un pomodoro — es algo que necesita su
  propia UX.
- **"Otro" como etiqueta hermana de "MIN", no como pill.** El
  primer boceto usaba una pill italic, pero rompía la jerarquía:
  "Otro" no es un valor del mismo rango que los numerales, es una
  acción para abrir otro registro. Darle el mismo tratamiento que
  "MIN" (uppercase pequeño, spacing ancho, color tenue) hace que
  se lea correctamente como meta-opción. Cuando se activa con un
  valor custom, entonces sí pasa a pill numeral para convivir con
  los presets.
- **Icono ausente.** Se probó mentalmente un `+` o lápiz pero rompía
  la densidad de la línea. La palabra "Otro" basta — PACE es
  calmado, no minimalista por minimalismo.

### Cambiado (tipografía de cifras de identidad)
- **`app/shell/Sidebar.jsx` · `streakNum` blindado a EB Garamond** —
  el estilo del número grande del contador de racha pasa de
  `fontFamily: 'var(--font-display)'` a
  `fontFamily: "'EB Garamond', Georgia, serif"`. No pasa por la
  variable, así que aunque se cambie la tipografía display por
  otros medios (import JSON, devtools) el "0" sigue siempre en EB
  Garamond italic. El label "días seguidos" y el sub "Mejor: N
  días" siguen usando `--font-display` (texto descriptivo, no
  cifra de identidad).

### Retirado del panel de Tweaks
- **"Tipografía display"** (`font`): el eje se elimina del panel.
  Los 4 ejes que quedan son **paleta, layout, timer, breath**. La
  identidad tipográfica de PACE ya está decidida: Cormorant
  Garamond como display por defecto + EB Garamond blindado en
  cifras de identidad. No tiene sentido que el usuario elija entre
  3 alternativas — decide PACE.

### Conservado (no retirado)
- El campo `state.font` sigue existiendo en `app/state.jsx` y en el
  `localStorage` de usuarios existentes. Solo se elimina del panel
  de Tweaks. Instalaciones previas que tuvieran `font` distinto de
  `'cormorant'` no pierden datos pero tampoco verán el cambio
  aplicado — el default se impone.
- `TweakSecretsWatcher` sigue escuchando `state.font === 'mono'`
  para disparar `secret.mono` por si el valor llega vía import
  JSON o devtools. Logro dormido pero vivo, mismo patrón que
  `secret.seal` y `secret.illustrated` en sesión 19.

### Notas de diseño — tipografía
- **Las cifras son firma; el texto es lenguaje.** Un número gigante
  (el 25:00 del timer, el 0 del contador de racha) es un símbolo
  visual de identidad — si el usuario cambia la tipografía
  display, no debe cambiar, igual que un logo no cambia con la
  paleta. El texto descriptivo ("Concentración profunda", "días
  seguidos") sí sigue la tipografía display porque es lenguaje.
- **La decisión de display ya no es del usuario.** Se intentó en
  su día ofrecer Cormorant / EB Garamond / Mono como opción. Pero
  una tipografía display es parte del ADN visual de un producto
  calmado — no una preferencia de usuario. Cormorant Garamond es
  suficientemente cálida, editorial y legible para ser *la*
  tipografía de PACE. Decidir bien una vez.

---

## [v0.12.2] — 2026-04-22 — Pill consolidada y standalone autocontenido

Sesión breve de simplificación. El botón de apoyo en el sidebar tenía
cuatro variantes de copy configurables (`cafe`, `pasto`, `vaca`, `come`)
que mezclaban metáforas y diluían la identidad. Se consolidan en una
sola línea alineada con la filosofía del producto (la vaca que *pace* =
PACE), con el icono a la derecha para invertir la jerarquía clásica y
dar más peso al gesto. Además, el tweak "Logo de la vaca" se retira:
decidir entre 5 variantes del logo no aportaba al usuario final y
añadía ruido al panel.

Como efecto colateral, `PACE_standalone.html` por fin es **de verdad
autocontenido**: el logo oficial viaja como data URI dentro del bundle,
sin dependencia de rutas externas.

### Cambiado
- **`app/support/SupportModule.jsx`** — las 4 variantes de copy
  (`cafe`/`pasto`/`vaca`/`come`) se reducen a una única
  `SUPPORT_COPY_DEFAULT`:
  - Label: *"Da de pastar a la vaca"*.
  - Icono: siempre la silueta de vaca (antes alternaba con taza).
  - Orden en el pill y en el CTA del modal: **texto → icono** (icono
    a la derecha), invirtiendo el patrón habitual.
  - `supportCopy(variant)` mantiene la firma pero ignora el argumento
    — compatibilidad con código existente que lo siga llamando.
- **`app/tweaks/TweaksPanel.jsx`** — retirados dos ejes del panel:
  - *"Logo de la vaca"* (`logoVariant`): el logo queda fijo en la
    variante oficial `'pace'`.
  - *"Copy del botón de apoyo"* (`supportCopyVariant`): ya no tiene
    sentido al consolidar el copy.
- **`app/ui/CowLogo.jsx`** — el `PACE_LOGO_URL` ya no es una constante
  hardcoded. Se lee del atributo `src` de un `<img id="pace-logo-src">`
  pre-cargado en `PACE.html`. Esto permite que `super_inline_html`
  inlinee el PNG como data URI al generar el bundle, sin romper la
  carga modular.

### Conservado (no retirado)
- Los campos `logoVariant` y `supportCopyVariant` siguen existiendo en
  `app/state.jsx` y en el `localStorage` de los usuarios. Solo se
  eliminan del panel de Tweaks. Instalaciones existentes no pierden
  datos.
- Los logros secretos `secret.seal` y `secret.illustrated` (ligados a
  `logoVariant`) quedan dormidos pero definidos, por si se reintroducen
  como easter egg futuro.

### Nuevo
- **`PACE_standalone.html` autocontenido de verdad** — el logo PNG se
  inlinea como data URI en el bundle (tamaño: ~326 KB, antes ~225 KB).
  El archivo ahora funciona al 100% sin servidor ni dependencias
  locales. Se ha versionado este build como `PACE_App_1_38.html` a
  efectos de entrega.

### Notas de diseño
- "Da de pastar a la vaca" se eligió sobre "Da de comer" porque
  *pastar* vincula directamente con el brand (PACE = pacer) y con la
  metáfora que recorre toda la UI (la vaca del logo pasta en el campo).
- El icono a la derecha es una decisión intencional: rompe la
  convención del botón web (icono-izquierda) y da al texto el peso de
  la acción. El icono actúa como firma visual, no como señalética.

---

## [v0.12.1] — 2026-04-22 — Pulido: bugs y layout

Sesión corta de consolidación: tras la sesión 17 (feature-heavy) tocó
 revisar código con lupa y arreglar lo que estaba levemente roto pero
 pasaba desapercibido. También dos cambios de UX: quitar la sección
 "Intención" del sidebar (redundante con el Welcome) y rediseñar el
 Welcome para que no necesite scroll en pantallas 720p.

### Arreglado
- **`addFocusMinutes` (state.jsx)** — la evaluación de umbrales de
  logros `focus.hours.10/50/100` dependía de una variable de cierre
  (`nextTotal`) capturada fuera del updater. Ahora se lee `_state`
  tras el `setState` asíncrono: los logros se disparan sobre el valor
  recién persistido, no sobre un snapshot intermedio.
- **`completePomodoro` (state.jsx)** — mismo patrón: el updater ya no
  captura variables para decisiones posteriores; se lee `_state.cycle`
  después del commit para los umbrales de logro.
- **Toast buffer race (state.jsx)** — `onToast` vaciaba el buffer de
  toasts pendientes sólo si el listener entrante era el primero
  (`size === 1`). Bajo StrictMode de React (mount/unmount doble en
  dev), el segundo listener no recibía los toasts acumulados.
  Reemplazado por `wasEmpty` que captura el estado ANTES de añadir.
- **`applyTheme` se llamaba en cada `setState` (state.jsx)** — 2
  `setAttribute()` DOM por cada tick, aunque palette/font no hubieran
  cambiado. Ahora sólo se ejecuta si `prev.palette !== _state.palette`
  o `prev.font !== _state.font`. Micro-optimización de sólo render.

### Cambiado
- **Sidebar: eliminada la sección `Intención`** (tenía un textarea que
  muchos usuarios dejaban vacío). El campo `state.intention` sigue
  existiendo — se captura opcionalmente en el WelcomeModal (decidido
  en sesión 17). La retirada deja más respiro visual y sube la
  prominencia del footer.
- **Sidebar: el pill "Invita a un café" gana prominencia por
  sustracción** — al quitar la sección Intención el footer tiene
  más aire alrededor del pill, así que gana presencia sin necesitar
  rehacer el componente. Se mantiene el diseño elegante original
  de sesión 16 (pill delgado paper con borde fino, icono taza,
  copy italic pequeño). Se probó durante esta sesión una
  `SupportCard` más destacada (3 líneas + CTA pill terracota)
  pero el usuario confirmó que el pill original era más elegante:
  la elegancia viene del contraste con el espacio vacío, no de
  inflar el componente. Revertido al pill original.
- **WelcomeModal rehecho para caber sin scroll en 720p** — antes era
  un apilado vertical (logo + Meta + título + lede + valores +
  intención + botón + skip) que en pantallas cortas pedía scroll.
  Ahora es una grid de 2 columnas en el header (logo+meta a la izq,
  título+lede a la der), fila de valores compacta (10px padding vs
  14px), input de intención ligeramente más corto, y botón +
  "prefiero saltarlo" en línea horizontal. Total: ~440px de alto
  (antes ~620px).
- **`PACE_VERSION`** en `state.jsx`: `v0.12.0` → `v0.12.1`.
- **`<title>` de `PACE.html`**: `v0.12.0` → `v0.12.1`.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.12.1** (~224 KB, sin cambio
  significativo de tamaño).
- `PACE.html` y `PACE_standalone.html` cargan con logs limpios (solo
  warnings habituales de Babel standalone).
- Screenshot del Welcome en fresh state confirma que entra sin
  scroll en viewport 1920×1080.
- Screenshot del sidebar con state populado confirma que el pill
  Invita a un café destaca visualmente con el espacio extra del
  footer, y que la sección Intención ya no aparece.

Detalle: [`docs/sessions/session-18-pulido-bugs-layout.md`](./docs/sessions/session-18-pulido-bugs-layout.md) *(por escribir)*.

---

## [v0.12.0] — 2026-04-22 — Welcome, Export/Import, tweak-secrets

Combo de sesión corta (~5h) recomendado por el `STATE.md` cerrado en
sesión 16. Tres frentes que se refuerzan entre sí: el Welcome es lo
primero que el usuario ve y comunica los mismos valores que el modal
de BMC; el Export/Import hace literal la promesa "todo local, para
siempre"; los tweak-secrets recompensan la exploración de estilo sin
anunciar nada.

### Añadido
- **`app/welcome/WelcomeModule.jsx`** (nuevo, ~240 líneas):
  - `WelcomeModal` — modal single-screen editorial: logo oficial
    (respeta `state.logoVariant`), título serif italic *"Antídoto a
    la silla. A tu ritmo."*, 3 valores (`Todo local · Sin cuentas ·
    Siempre gratis`), campo opcional de intención con auto-focus y
    Enter-to-submit, botón `Empezar` + link discreto `prefiero
    saltarlo`. Cap de 120 chars para la intención.
  - `useFirstTimeWelcome(setOpen)` — abre el modal una sola vez
    cuando `state.firstSeen == null`. Mismo patrón exacto que
    `useSupportAutoTrigger` de sesión 16 (demora 1.2s post-mount).
  - Evento global `pace:open-welcome` para re-abrir manualmente
    (uso dev / futuros Tweaks).
- **Export/Import JSON en Tweaks** (`TweaksPanel.jsx`):
  - Sección "Tus datos" con botones `Exportar` (descarga
    `pace-backup-YYYYMMDD.json` con `{app, version, exportedAt,
    state}`) e `Importar` (valida schema, pregunta `confirm()` con
    contador, reemplaza `localStorage.pace.state.v1`, recarga).
  - Feedback inline `✓ Backup descargado` (verde) / `✗ No se pudo
    exportar` (rojo), fade automático.
  - Caption explicando "Todo vive en tu navegador. El backup es un
    archivo JSON local — sin servidor, sin cuenta."
- **`TweakSecretsWatcher`** (componente auxiliar en mismo archivo,
  retorna `null`, se monta siempre desde `main.jsx`):
  - `secret.aged` cuando `palette === 'envejecido'`.
  - `secret.dark.mode` al acumular 7 días de calendario distintos
    con `palette === 'oscuro'`. Fechas en clave propia
    `pace.darkDays.v1` (cap 30).
  - `secret.mono` cuando `font === 'mono'`.
  - `secret.seal` cuando `logoVariant === 'sello'`.
  - `secret.illustrated` cuando `logoVariant === 'ilustrado'`.
- **`explore.tweaks`** se desbloquea al abrir el panel por primera
  vez (pasa de secreto a exploración visible).
- **Campos nuevos en default state**: `firstSeen: null` (timestamp
  al primer open del Welcome, ya sea "Empezar" o "skip").

### Cambiado
- **`PACE_VERSION`** en `state.jsx`: `v0.11.11` → `v0.12.0`.
- **`<title>` de `PACE.html`**: `v0.11.11` → `v0.12.0`.
- **`IMPLEMENTED_ACHIEVEMENTS`** en `Achievements.jsx` crece
  +6 ids: `explore.tweaks` + los 5 secretos tweak (`secret.aged`,
  `.dark.mode`, `.mono`, `.seal`, `.illustrated`). Total de
  "Próximamente" visible baja de 19 → 13.
- **`main.jsx`** monta `<WelcomeModal/>` y `<TweakSecretsWatcher/>`
  junto al resto de modales; consume `useFirstTimeWelcome`; escucha
  `pace:open-welcome`.
- **`PACE.html`** carga `app/welcome/WelcomeModule.jsx` antes de
  `Sidebar.jsx` porque `main.jsx` lo necesita.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.12.0** (~225 KB, +27 KB
  sobre v0.11.11).
- Rotado `backups/PACE_standalone_v0.11.11_20260422.html`.
- 3 backups activos (v0.11.9, v0.11.10, v0.11.11), bien por debajo
  del límite de 5.
- `PACE.html` y `PACE_standalone.html` cargados en iframe con logs
  limpios (sólo warnings habituales de Babel standalone).
- Screenshot en fresh state confirma que el Welcome aparece; tras
  fijar `firstSeen` manualmente, no vuelve a aparecer.

Detalle: [`docs/sessions/session-17-welcome-export-tweaksecrets.md`](./docs/sessions/session-17-welcome-export-tweaksecrets.md).

---

## [v0.11.11] — 2026-04-22 — Integración Buy Me a Coffee

Primer frente del plan de monetización diseñado en sesión 15: botones +
modal de apoyo a Buy Me a Coffee respetando los 3 principios éticos
(presencia calmada, razón explícita por valores, momento elegido).
El modal se dispara manualmente desde un pill en el sidebar, y una sola
vez automáticamente cuando la racha llega a 7 días.

### Añadido
- **`app/support/SupportModule.jsx`** (nuevo, ~290 líneas) con 3
  exports principales:
  - `SupportButton` — pill paper con borde fino que vive en el footer
    del sidebar. Icono de taza SVG en `currentColor`. Hover suave.
  - `SupportModal` — modal con hero de taza terracota, título serif
    italic **"PACE es gratis. Y lo seguirá siendo."**, 3 valores en
    fila (`Todo local · Sin tracking · Para siempre`), botón terracota
    que abre `buymeacoffee.com/ezradesign` en pestaña nueva, botón
    secundario `Copiar enlace` con feedback `✓ copiado`, y link
    `Ya doné →` que desbloquea `secret.supporter` por honor.
  - `useSupportAutoTrigger(setOpen)` — hook que abre el modal **una
    sola vez** cuando `streak.current >= 7` y `supportSeenAt == null`.
- **Logro `secret.supporter`** ("Sostienes el pasto", glifo `✦`)
  añadido al catálogo y a `IMPLEMENTED_ACHIEVEMENTS` en
  `Achievements.jsx` (5/21 secretos con trigger real).
- **Tweak `supportCopyVariant`** en `TweaksPanel.jsx` con 3 opciones:
  `cafe` ("Invita a un café", default), `pasto` ("Riega el pasto"),
  `vaca` ("Da de comer a la vaca"). El copy del pill del sidebar se
  actualiza en vivo.
- **Evento global `pace:open-support`** escuchado por `main.jsx`,
  mismo patrón que `pace:open-achievements`.
- **Campos nuevos en default state**: `supportSeenAt: null` y
  `supportCopyVariant: 'cafe'`.

### Cambiado
- **`PACE_VERSION`** en `state.jsx`: `v0.11.9` → `v0.11.11`. Corrige
  de paso un desfase que arrastraba desde sesión 15 (state decía
  `v0.11.9` aunque STATE.md y PACE.html decían `v0.11.10`).
- **`<title>` de `PACE.html`**: `v0.11.10` → `v0.11.11`.
- **Subtitle del modal de Logros**: `"100 coherentes"` →
  `"Colección creciente"` (ahora son 101 con el supporter).
- **`StatusBar` del Sidebar**: se inserta `<SupportButton>` entre la
  línea `En camino · ● Pace` y la línea de versión, con
  `marginTop: 10` y `marginBottom: 10` para respirar.

### Red de seguridad
- `PACE_standalone.html` regenerado a **v0.11.11** (~198 KB, +16 KB
  por el módulo nuevo).
- Rotado `backups/PACE_standalone_v0.11.10_20260422.html` (ya existía
  el v0.11.9).
- 2 backups activos (v0.11.9, v0.11.10), bien por debajo del límite.
- Verificación funcional (`eval_js_user_view`):
  - `pace:open-support` abre el modal con el título correcto.
  - Tweak cambia copy del pill y del botón primario en vivo.
  - Botón "Ya doné" desbloquea `secret.supporter` y marca
    `supportSeenAt` con timestamp.

Detalle: [`docs/sessions/session-16-bmc-integracion.md`](./docs/sessions/session-16-bmc-integracion.md).

---

Para versiones anteriores, ver los diarios en [`docs/sessions/`](./docs/sessions/).


