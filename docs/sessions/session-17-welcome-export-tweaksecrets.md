# Sesión 17 (2026-04-22) — Welcome, Export/Import, tweak-secrets

**Versión entregada:** v0.12.0
**Duración / intensidad:** media · exploratoria + fruta fácil

## Contexto / petición

> "tiro por la primera recomendación"

El `STATE.md` cerrado en sesión 16 recomendaba un **combo de sesión corta**
(~5h, alto impacto emocional) como siguiente paso:

1. Welcome screen de primera vez.
2. Export/Import JSON.
3. 6 tweak-secrets (fruta fácil).

Los tres frentes refuerzan la promesa que acaba de prometer el modal de
Buy Me a Coffee: cuando el modal dice "todo local", ahora es lo primero
que el usuario ve al abrir PACE **y** es portátil en un JSON. Además los
tweak-secrets recompensan la curiosidad de forma natural, bajando la
cuenta de "Próximamente" en la colección de logros.

Se eligió subir la versión a **v0.12.0** (y no 0.11.12) porque hay feature
nueva visible (Welcome) + data portability (Export/Import), y la cuenta
menor 0.11.x ya estaba bastante cargada.

## ✅ Cambios aplicados

**`app/welcome/WelcomeModule.jsx`** (nuevo, ~240 líneas) — módulo
completo con:
- `WelcomeModal` — modal editorial (single screen, no onboarding largo).
  Logo oficial via `PaceWordmark` respetando `state.logoVariant`, Meta
  "Bienvenida", título serif italic *"Antídoto a la silla. A tu ritmo."*,
  lede corta, 3 valores en línea (`Todo local · Sin cuentas · Siempre
  gratis`), campo de intención opcional con placeholder cálido, botón
  primario `Empezar` y link discreto `prefiero saltarlo`. Enter en el
  input también termina.
- `useFirstTimeWelcome(setOpen)` — hook que abre el modal una sola vez
  cuando `state.firstSeen == null`. Mismo patrón exacto que
  `useSupportAutoTrigger` de sesión 16, incluida la demora de 1.2s tras
  mount para no competir con toasts.
- Auto-focus del input tras la animación de entrada (320ms, unos ms por
  encima de los 280 del `pace-slide-up`).
- Estilos con nombre único `welcomeStyles` (regla CLAUDE.md).

**`app/state.jsx`**:
- `PACE_VERSION` → `'v0.12.0'`.
- Nuevo campo `firstSeen: null` en `defaultState`, con comentario
  documentando la mecánica (timestamp al primer open, ya sea por botón
  `Empezar` o por `skip`).
- Comentario añadido a `intention` explicando que ahora se captura
  opcionalmente en el Welcome.

**`app/main.jsx`**:
- Nuevo `openWelcome` state.
- Consume `useFirstTimeWelcome(setOpenWelcome)` en el root.
- Listener para evento global `pace:open-welcome` (paralelo al
  `pace:open-support` existente, útil para dev/Tweaks futuros).
- Monta `<WelcomeModal/>` junto al `<SupportModal/>`.
- Monta `<TweakSecretsWatcher/>` en el árbol (retorna null, sólo
  observa cambios de state para desbloquear tweak-secrets incluso si el
  panel está cerrado).

**`app/tweaks/TweaksPanel.jsx`** (refactorizado, ~340 líneas) — además
del panel original, ahora:
- **Export JSON** (~2h estimadas, ~30 min reales) — botón que descarga
  `pace-backup-YYYYMMDD.json` con schema `{app, version, exportedAt,
  state}`. Wrapping en try/catch con feedback inline (verde "Backup
  descargado" / rojo "No se pudo exportar"), fade automático.
- **Import JSON** — botón que dispara file input oculto. Valida schema
  mínimo (acepta formato `{app,state}` y estado plano como fallback),
  muestra `confirm()` con contador rápido ("X logros, Y min de foco"),
  sobreescribe `localStorage['pace.state.v1']` y recarga la página. La
  recarga evita estados inconsistentes con `useSyncExternalStore`.
- **Sección "Tus datos"** con Meta + pequeño caption explicando "Todo
  vive en tu navegador. El backup es un archivo JSON local".
- **`TweakSecretsWatcher`** — componente auxiliar (export via window)
  que monta siempre y observa:
  - `palette === 'envejecido'` → `secret.aged`.
  - `palette === 'oscuro'` → acumula fechas ISO en
    `localStorage.pace.darkDays.v1`; al llegar a 7 días distintos
    (no consecutivos) → `secret.dark.mode`.
  - `font === 'mono'` → `secret.mono`.
  - `logoVariant === 'sello'` → `secret.seal`.
  - `logoVariant === 'ilustrado'` → `secret.illustrated`.
  - Al abrir el panel por primera vez → `explore.tweaks`.

  La idempotencia la garantiza `unlockAchievement` (return false si ya
  está desbloqueado), así los efectos no necesitan guardas.

**`app/achievements/Achievements.jsx`** — añadidos al
`IMPLEMENTED_ACHIEVEMENTS` set:
- `explore.tweaks` (exploración extra, +1/20).
- `secret.aged`, `secret.dark.mode`, `secret.mono`, `secret.seal`,
  `secret.illustrated` (secretos con trigger, +5 → 10/21).

Total visible "Próximamente" baja de 19 → 13 (−6, objetivo cumplido).

**`PACE.html`**:
- Título `v0.11.11` → `v0.12.0`.
- Nuevo `<script>` para `app/welcome/WelcomeModule.jsx`, cargado entre
  `SupportModule.jsx` y `Sidebar.jsx` porque `main.jsx` lo necesita
  disponible antes de montar.

## 📁 Archivos modificados
- `app/welcome/WelcomeModule.jsx` (nuevo)
- `app/state.jsx` (versión + nuevo campo)
- `app/main.jsx` (montaje + hook + listener)
- `app/tweaks/TweaksPanel.jsx` (Export/Import + SecretsWatcher)
- `app/achievements/Achievements.jsx` (set)
- `PACE.html` (título + carga del nuevo módulo)

## 🔒 Red de seguridad
- Standalone regenerado a v0.12.0 (~225 KB, +27 KB sobre v0.11.11).
- Backups rotados: se añade
  `backups/PACE_standalone_v0.11.11_20260422.html`. El repo ya tenía
  v0.11.9 y v0.11.10 → ahora 3 backups, dentro del máximo de 5.
- `PACE.html` cargado en iframe: logs limpios (sólo los 2 warnings
  habituales de Babel standalone).
- `PACE_standalone.html` cargado en iframe: logs limpios (los mismos
  warnings de Babel, uno por script en ambos casos).
- Screenshot manual confirmó el Welcome se muestra correctamente en
  fresh state (firstSeen=null) y no aparece cuando firstSeen está fijado.

## 🎯 Por qué esta sesión

Coherencia narrativa con la sesión 16. El modal de BMC prometía "todo
local, sin cuentas, para siempre"; el Welcome ahora **es lo primero que
el usuario lee** al instalar PACE, con los mismos tres valores. El
Export/Import materializa "todo local": ahora el usuario puede
literalmente guardar su progreso en un archivo y llevárselo.

Los tweak-secrets son fruta baja (1 useEffect cada uno) con impacto
emocional: premian la exploración de estilo sin anunciarla, coherente
con la decisión "los secretos nunca muestran Pronto" (sesión 15).

## 📋 Backlog abierto al cerrar

- **13 logros visibles como "Próximamente"** sin trigger (era 19):
  `master.*` (pendientes restantes), `season.*`, `first.ritual/cycle/
  day/plan/return`, `streak.14/60/365`, `breathe.sessions.10/50`,
  `move.sessions.25`, `hydrate.week.perfect`, `morning.5`,
  `explore.all.*` (3), `explore.chrome`.
- **Siguiente recomendación fruta baja**: los 3 triggers obvios de
  primeros pasos (`first.ritual`, `first.cycle`, `first.plan`) — datos
  ya en state, ~2h.
- **Siguiente recomendación alto impacto**: rachas largas
  (streak.14/30/60/365) — cálculo trivial, refuerza constancia.

## ⚠️ Decisiones tomadas

- **El Welcome se muestra una sola vez**, sin importar si el usuario
  hace "Empezar" o "prefiero saltarlo". Filosofía: es una bienvenida,
  no un trámite. Re-abrir es posible por `pace:open-welcome` pero no
  hay UI para ello (dev/debug only). (Sesión 17.)
- **El campo de intención es opcional** y se cap a 120 chars (`.slice(0,
  120)` defensivo). Si está vacío al cerrar, no se toca `state.intention`
  (podría haber uno previo). Si tiene contenido, se sobreescribe.
  (Sesión 17.)
- **El backup JSON incluye `version` y `exportedAt`** para migración
  futura si el schema cambia. El import acepta formato legacy
  (state plano) como fallback. Tras import exitoso se recarga la
  página — la alternativa (actualizar state en memoria) arriesga
  inconsistencias con `useSyncExternalStore` y listeners pendientes.
  (Sesión 17.)
- **`secret.dark.mode` cuenta días distintos, no consecutivos.** La
  descripción del logro dice "7 días en oscuro" sin exigir racha; la
  lectura amable es acumular 7 días de calendario distintos en los que
  el usuario abrió PACE con paleta oscuro. Se guarda en clave propia
  `pace.darkDays.v1` para no contaminar el state principal — es un
  contador auxiliar de un único logro. Cap de 30 entradas. (Sesión 17.)
- **`TweakSecretsWatcher` retorna `null` y vive en el árbol siempre**
  (no dentro del TweaksPanel). Razón: los secretos deben dispararse
  cuando el state cambia, no sólo cuando el panel está abierto —
  incluye el caso de importar un JSON con palette ya en oscuro o
  cambiar el tweak y cerrar inmediatamente. (Sesión 17.)
