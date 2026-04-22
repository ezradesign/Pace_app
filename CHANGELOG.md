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
| **v0.12.0** | 2026-04-22 | Welcome de primera vez + Export/Import JSON + 6 tweak-secrets | #17 | [abajo ↓](#v0120--2026-04-22--welcome-export-tweak-secrets) |
| **v0.11.11** | 2026-04-22 | Integración Buy Me a Coffee: frente 1 de monetización | #16 | [abajo ↓](#v01111--2026-04-22--integración-buy-me-a-coffee) |
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


