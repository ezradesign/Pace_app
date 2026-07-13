# Sesión 102 — PWA completa (v0.47.0)

**Fecha:** 2026-07-13
**Versión:** v0.46.0 → v0.47.0
**Alcance:** plan maestro "Camino a v1.0", fila s102 — manifest.webmanifest +
shortcuts + update prompt + notificación fin-pomodoro (P1). Además: enlaces
`/safety`+`/privacy` desde la UI (pendiente de s101) y persistencia del
Pomodoro en recarga (fork s96, resuelto).

---

## Tarea 0 — Git

s101 commiteado y pusheado (`5317563`, "feat(stats): live stats +
safety/privacy pages (v0.46.0)") + un commit posterior de docs del usuario
(`1ae5488`, estrategia pre-venta / Starter Story). Working tree limpio,
`main` == `origin/main`. Nada que avisar.

## Bifurcaciones decididas por el usuario (AskUserQuestion, antes de tocar)

1. **Enlaces `/safety`+`/privacy` → Tweaks** (fila discreta al final del
   panel; el home queda limpio, lo legal vive con "Tus datos"/premium).
2. **Notificación fin-pomodoro → toggle opt-in en Tweaks** (default off; el
   permiso del navegador se pide SOLO al activar el toggle, gesto real).
3. **Shortcuts del manifest → 4**: Foco · Respira · Mueve · Hidrátate
   (máximo visible en Android; espeja Foco + ActivityBar; Estira fuera,
   comparte cubo "Cuerpo" con Mueve).
4. **Persistencia del Pomodoro → "solo si sigue vivo"**: reanudar si endsAt
   sigue en el futuro; si expiró estando fuera, descartar en silencio SIN
   acreditar (tracking honesto, línea s101).

## Hallazgo de auditoría (bug de despliegue desde s48c)

`build-standalone.js` elimina el `<link rel="manifest">` del standalone
(CORS en `file://`, decisión s48c) y `index.html` era **copia literal** del
standalone → **la app desplegada en Cloudflare Pages se servía SIN manifest
y no era instalable como PWA**. El manifest.json existía en el servidor,
pero ningún HTML lo referenciaba. Fix: el paso 9 del build re-inserta el
link solo en la copia `index.html` (ancla `<link rel="icon">` + WARN si el
ancla desapareciera); el standalone sigue sin manifest.

## Qué se hizo

### A · manifest.webmanifest + shortcuts + deep links

- `manifest.json` → **`manifest.webmanifest`** (renombrado, no duplicado):
  `id: "/"`, description, `dir`/`lang`, `categories`, **4 shortcuts** con
  URLs `/?go=focus|breathe|move|hydrate` (icono de la app, sin arte nuevo —
  regla D-4), `launch_handler: focus-existing` (los shortcuts reutilizan la
  ventana abierta en vez de abrir otra).
- **Colores alineados a tokens**: `background_color`/`theme_color` y el
  `<meta name="theme-color">` de PACE.html pasan de `#F5EFE0` (huérfano de
  s65) a `--paper` **`#F2EDE0`**. No se tocó ningún token.
- **Deep links** en `main.jsx`: efecto de mount que consume `?go=` UNA vez
  (breathe/move → `setOpenLibrary`, hydrate → tracker, focus → asegura
  `focusMode:'foco'` SIN auto-arrancar el timer — un timer que arranca solo
  al abrir la app sería una sorpresa, no una ayuda) y limpia la URL con
  `history.replaceState` para que recargar no re-dispare.
- `.claude/static-server.js`: MIME `application/manifest+json` + rutas
  bonitas `/safety`→`safety.html`, `/privacy`→`privacy.html` (paridad con
  Cloudflare Pages en el preview).

### B · Update prompt del Service Worker

- `sw.js`: **retirado el `self.skipWaiting()` incondicional del install**
  (con él nunca existía un worker en waiting → el prompt era imposible).
  Nuevo listener `message` → `SKIP_WAITING`. `CACHE_NAME` → `pace-v0.47.0`
  y precache actualizado a `manifest.webmanifest`.
- Registro en PACE.html ampliado: `updatefound`/`statechange` + chequeo de
  `reg.waiting` al cargar (cubre el waiting heredado de una visita
  anterior) → anuncia con `window.__paceSwWaitingReg` + CustomEvent
  `pace:sw-waiting` (la referencia en window cubre el anuncio ANTES de que
  React monte; Babel compila async). `controllerchange` → reload con guard
  `hadController` (el primer install con `clients.claim()` no recarga).
- Nuevo **`app/ui/UpdatePrompt.jsx`** (110 ln): barra discreta bottom-center
  (papel, hairline, zIndex 150 — sobre Tweaks 80, bajo Toast 200) con
  "Hay una versión nueva de PACE · **Actualizar** · Luego". Wrapper flex
  centrador SIN transform (el keyframe `pace-slide-up` anima `transform` y
  pisaría un `translateX(-50%)`). "Luego" cierra; el worker queda waiting y
  activa al cerrar todas las pestañas. Montado en main.jsx junto a ToastHost.
- **Semántica consciente**: las updates del SW dejan de auto-activarse
  (esperan prompt o cierre de pestañas); las **navegaciones siguen
  network-first (decisión s89 intacta)** → el HTML fresco llega igual; el
  prompt gobierna la activación del worker y su precache (offline).

### C · Notificación fin-pomodoro

- `state-core.jsx`: default **`notifyFocusEnd: false`** (merge
  `{...defaultState, ...parsed}` cubre instalaciones existentes, sin
  migración).
- Nuevo **`app/focus/FocusTimer.support.jsx`** (82 ln; evita llevar
  FocusTimer >500): `maybeNotifyFocusEnd(opts)` — dispara SOLO si
  (1) toggle activado, (2) `document` NO visible (mirando la app, la
  campana y la pantalla de fin ya avisan), (3) permiso `granted`. Vía
  `registration.showNotification` (funciona con la PWA instalada) con
  fallback a `new Notification`; `silent: true` (la campana `pomodoro.end`
  de la app es el sonido; el SO no añade un segundo); `tag` colapsa
  duplicados. try/catch integral, patrón playSound.
- `FocusTimer.jsx`: llamada en el `onComplete`, SOLO rama `foco` (pausa y
  larga tickan y suenan pero no notifican).
- `sw.js`: `notificationclick` → cierra la notificación y enfoca la ventana
  (o `openWindow('/')`).
- `TweaksPanel.jsx`: bloque "Aviso de fin de Foco" tras Audio (pills
  Activado/Desactivado, patrón del panel). Gate `canNotify = web +
  Notification`. Permiso al activar; si el navegador lo tiene bloqueado,
  hint `tweaks.notify.blocked` (la rama denegada escribe el mismo `false`
  al store para forzar el re-render que muestra el hint — `permission` no
  es reactivo).
- Limitación de plataforma documentada: con la pestaña de fondo, Chrome
  estrangula el tick a ~1/min → la notificación puede llegar con ese
  retraso (sin Notification Triggers estándar, aceptado P1).

### D · Enlaces /safety + /privacy (decisión de s101 cerrada)

Fila discreta al pie del panel de Ajustes, tras Reset: "Seguridad ·
Privacidad" (`tweaks.legal.*` ES/EN), `target="_blank" rel="noopener"`
(no matar un timer corriendo), **solo si `location.protocol` es http(s)**
(en el standalone `file://` esas rutas no resuelven).

### E · Persistencia del Pomodoro en recarga (fork s96 → resuelto)

- `useCountdown.jsx`: expone `endsAt` (solo en running) y **`restore(endsAtMs)`**
  — reanuda desde idle con el endsAt ORIGINAL (no recalcula: el tiempo de
  la recarga cuenta como transcurrido).
- Clave **`pace.timer.v1` FUERA de `pace.state.v2`** (el timer sigue siendo
  local, decisión s96; solo sobrevive a la recarga). Helpers en
  FocusTimer.support.jsx: se escribe SOLO running en modo foco
  (pausa/reset/fin/otros modos limpian); al montar se reanuda solo si
  endsAt sigue en el futuro Y modo/minutos coinciden con el state (+
  blindaje `endsAt-now <= duración` contra relojes raros); **expirado
  estando fuera → descartar en silencio, sin acreditar**.

### i18n

13 keys nuevas ES+EN en `strings/ui.js`: `tweaks.notify.*` (5),
`tweaks.legal.*` (2), `notify.focus.*` (2), `update.*` (4).

## Verificación (protocolo s93 · preview :8765 propio)

Purga SW+caches+localStorage por tanda + **seed fresco de `pace.state.v2`**
antes de cada aserción. Consola **0 errores** en todas las pasadas.

- **Manifest**: servido `application/manifest+json`, JSON válido, 4
  shortcuts, `theme_color #F2EDE0`, `id "/"`; link presente en DOM.
- **Deep links**: `?go=breathe` (técnicas visibles), `?go=hydrate` (tracker
  "0/8 VASOS HOY"), `?go=move` (sección "Tus rutinas" exclusiva de la
  biblioteca) — URL limpia (`search === ''`) tras consumir en los 3 casos.
- **Tweaks**: bloque notificación completo + enlaces con
  `href="/safety|/privacy"`, `_blank`, `noopener`. El pane embebido tiene
  `Notification.permission === 'denied'` → verificada la rama real de
  bloqueo: hint visible y clic en "Activado" NO enciende el flag.
  `/safety` y `/privacy` responden 200 con su HTML ("Seguridad · PACE").
- **Persistencia** (3 casos): (1) seed endsAt+90s → reanuda running en
  01:14 con "Pausar"; (2) seed expirado → 25:00 idle, clave eliminada,
  cycle 0 y weeklyStats a cero (SIN crédito); (3) flujo real → Comenzar
  escribe `{endsAt≈+25min, mode:'foco', minutes:25}`, Pausar limpia.
- **Update prompt con DOS versiones reales del SW**: SW A (v0.47.0) activo
  sin prompt y sin bucle de reload (guard del primer claim OK) → deploy de
  SW B (CACHE_NAME editado) → reload → **worker en waiting + barra visible**
  ("Hay una versión nueva de PACE | Actualizar | Luego") → "Luego" oculta y
  el waiting persiste → reload → la barra REAPARECE (anuncio del waiting
  heredado) → "Actualizar" → SKIP_WAITING → controllerchange → **recarga
  sola**: SW B `activated`, cache viejo borrado (solo quedaba el de B),
  prompt fuera, app montada. Captura tomada. Revertido el CACHE_NAME y
  purga final (SW + caches limpios).
- **Standalone** (post-build, servido por http): monta, 25:00, título
  v0.47.0, SIN link de manifest, UpdatePrompt null, 0 errores.
- **index.html**: contiene `<link rel="manifest" href="/manifest.webmanifest">`
  (el fix de despliegue); el standalone no (correcto).

## Build + cierre

- Backup `backups/PACE_standalone_v0.46.0_20260713.html` (rotado
  `v0.33.1_20260523.html`, cap 20).
- `node build-standalone.js`: **73 archivos validados** (entran
  UpdatePrompt.jsx y FocusTimer.support.jsx), **774 KB**, index.html con
  manifest.
- CHANGELOG (detalle v0.47.0 + v0.46.0), STATE reescrito, ROADMAP fila
  s102, memorias actualizadas.

## Notas para el futuro

- **No reintroducir `skipWaiting()` incondicional en el install** — mata el
  update prompt. Cualquier cambio de estrategia del SW pasa por revisar la
  pareja network-first (s89) + prompt (s102).
- El toggle de notificación y los enlaces legales comparten el gate `isWeb`;
  si algún día hay más superficie solo-web en Tweaks, reutilizarlo.
- Si el usuario pide notificar también el fin de Pausa/Larga, es UNA rama
  más en el onComplete — decisión de producto, no técnica.
- Los shortcuts usan el icono de la app; iconos propios por shortcut
  (96×96) quedan para cuando haya arte (regla D-4: el usuario itera).
