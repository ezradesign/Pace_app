# Sesión 105 — v0.50.0

**Fuentes self-hosted + todayISO local + integridad de Caminos + pulido.**
Planificada como "fuentes + todayISO" (cierra Etapa A del build); creció con
cuatro arreglos extra pedidos en vivo por el usuario (aro del pomodoro,
BreakMenu, frame fantasma, y **dos bugs de Caminos** detectados por él).

Fecha: 2026-07-15. Versión: v0.49.0 → **v0.50.0**.

---

## Qué se hizo (7 arreglos)

### 1a · `todayISO()` a fecha LOCAL (bug UTC verificado s104)

`new Date().toISOString().slice(0,10)` usa **UTC**: entre medianoche y el
offset (~1-2 AM en España) devolvía el **día anterior**, corrompiendo
rachas/history/Caminos. Se reutiliza el helper `toISODate()` ya existente en
`state-history.jsx` (formatea con `getFullYear/getMonth/getDate` locales).
**7 sitios**: `state-history.jsx` (todayISO canónico → `toISODate(new Date())`),
`PathsLibrary.jsx` + `SuggestedPathCard.jsx` (copias → global `window.todayISO()`),
`state-paths.jsx` ×2 (walkers de racha → `toISODate(y/d)`),
`TweakSecretsWatcher.jsx` (set día oscuro), `TweaksData.jsx` (nombre del
backup — 8º sitio, no estaba en la lista original; el `exportedAt` se queda
en ISO completo, es timestamp). NO se tocó el *parseo* `new Date("YYYY-MM-DD")`
(UTC, inocuo para offsets positivos como España). **Verificado en preview
corriendo en Europe/Madrid**: un instante de las 00:30 daba "2026-07-14" con el
código viejo → ahora "2026-07-15"; walker de racha limpio.

### 1b · Fuentes self-hosted (cierra Etapa A) — **preservando Cormorant**

**Hallazgo clave que cambió el plan s103:** el default real de los títulos es
**Cormorant Garamond** (`defaultState.font='cormorant'` + regla
`[data-font="cormorant"]`), NO EB Garamond. La copia del panel lo dice desde
s20. El plan s103 ("solo EB Garamond, Cormorant cae a Georgia") se tomó dando
por hecho que EB Garamond ya era el display. Con la info completa + comparativa
visual, el usuario decidió **preservar Cormorant** (la identidad de siempre).
Decisión s103 revisada.

- Copia local subset **latin** de 3 familias (desde `fonts.gstatic.com` via
  `scripts/` one-off): **Cormorant** (títulos, 400/500 romana+itálica),
  **EB Garamond** (cifras/glifos/logo, 400/500 romana+itálica — el 600 NO lo
  usa nadie, recortado −93 KB), **Inter Tight** (UI, 300/400/500/600). Total
  **12 caras, 520 KB** → `fonts/`.
- **JetBrains Mono retirada**: `--font-mono` cae a `ui-monospace` (solo lo usa
  devtools/secretos, invisible).
- `tokens.css`: fuera el `@import` de Google → 12 `@font-face` con ruta
  **ABSOLUTA `/fonts/…woff2`** (única que resuelve en dev (css en `app/`),
  index.html (css inline en root) y standalone) + `unicode-range` latin
  (fallback grácil a Georgia/system) + `font-display:swap`. Todo lo demás
  intacto (default Cormorant, regla del tweak).
- `index.html`: `/fonts/*.woff2` como archivos + **12 al PRECACHE de sw.js**.
- Standalone: nuevo paso de build `inlineFonts` (gemelo de `inlineIllustrations`
  6b) → data URIs (100 % autocontenido). Invariante de referencia huérfana.
- `.claude/static-server.js`: MIME `font/woff2`.
- **Verificado en los 3 artefactos**: cero peticiones a `fonts.googleapis`/
  `gstatic`; títulos Cormorant idénticos, cifras EB Garamond, UI Inter Tight,
  acentos á/ñ/¿ correctos; SW precachea las 12; **ciclo SW completo sobre
  página viva** (`reg.update()` → waiting → prompt "Actualizar/Luego" →
  activate). Standalone 2371 → **3052 KB**; index.html ~970 KB.

### 1.5#1 · Aro del pomodoro descolocado en PAUSA/LARGA

En FOCO existe la fila de presets MIN (26 px); en PAUSA/LARGA no se renderiza
→ `timerWrap` (flex:1) recentraba el aro **~30 px arriba**. Fix: un spacer
`<div style={{height:26}}>` en PAUSA/LARGA reserva ese alto (el `gap:14` del
root aplica igual). Verificado por DOM: el aro queda en la misma Y (253) en los
tres modos. `FocusTimer.jsx` 493→498 ln (al borde del tope).

### #2 · BreakMenu coherente con la home

El menú post-Pomodoro usaba iconos genéricos propios (`BM*`: viento/monigote/
gota) y solo 3 actividades. Ahora usa los **glifos `AB*` de la ActivityBar**
(pulmones/puente/mancuerna/gota, expuestos a window desde `main/ActivityBar.jsx`)
y ofrece **las 4 actividades** de la home: se añade **Estira**
(`break.stretch.*` ES+EN, `computeScore`, `handleBreakChoice`→`openLibrary('extra')`,
atajo **E**, cuenta para `first.cycle`). Grid **2×2**. Iconos `BM*` eliminados.

### #3 · Frame fantasma de fase en PathRunner (warning dev)

`PathRunner` arrancaba con `phase='step'` por defecto y corregía a `'intro'`
en un **efecto** → al iniciar un Camino renderizaba 'step' un fotograma,
montando la sesión (`BreatheSession` escribía estado en render → warning React).
Fix: la fase se fija **en render** cuando cambia el Camino (patrón oficial
"ajustar estado al cambiar una prop": `if (curId !== seenPathId) { setSeenPathId;
setPhase(...) }`) → React re-renderiza PathRunner ANTES de montar el step.
**Consola sin el warning**; el Camino arranca en la IntroCard. (Descubierto de
paso: las cards de transición **auto-avanzan por diseño**, `TransitionCardBase`
hold ~2.8s — no es un bug.)

### A · Toasts de logro superpuestos a las pantallas de Camino

El toast (z-index 200) se dibujaba sobre el overlay de Camino (z-index 80).
Decisión del usuario: **aplazar** los toasts, mostrarlos al terminar. En
`state-core.jsx`: cola `_deferredToasts` + flag `_caminoUiActive` +
`setCaminoUiActive()`. `PathRunner` marca la UI de Camino activa mientras haya
`cur || justCompleted` (pasos + transiciones + CompletionScreen); al volver a
home se vuelcan los pendientes (60 ms de respiro). Verificado: logro durante
Camino → 0 toasts en DOM; al salir → aparece.

### B · Logros que se desbloquean sin hacer el Camino (bug de corrección)

`advancePathStep` marcaba el Camino como **completado** (`count++`, history,
`checkAllPathsCompleted` → "Cartógrafa") en cuanto se llegaba al último paso,
**aunque se saliera/saltara todo**. Las sesiones ya no acreditan al salir
(`onExit('exit')` no llama a `complete*Session`), pero el completado a nivel
Camino sí ocurría. Decisión del usuario: **cuenta con ≥1 paso hecho de verdad**.
Fix: `current.doneCount` (incrementa solo con `reason==='done'`); si al terminar
`doneCount < 1` → se abandona sin crédito (nada de count/history/logros).
`PathRunner.handleStepExit` refleja la misma regla para la ceremonia (solo
CompletionScreen si `doneNow >= 1`). Verificado en dev y **compilado**: saltar
todo → no cuenta, 0 logros; ≥1 hecho (incl. mixto 1+resto saltado) → cuenta.

---

## Archivos tocados

`app/state-history.jsx` · `app/paths/PathsLibrary.jsx` ·
`app/paths/SuggestedPathCard.jsx` · `app/state-paths.jsx` (todayISO + doneCount) ·
`app/tweaks/TweakSecretsWatcher.jsx` · `app/tweaks/TweaksData.jsx` ·
`app/tokens.css` (@font-face) · `sw.js` (CACHE_NAME + precache fuentes) ·
`.claude/static-server.js` (MIME) · `build-standalone.js` (inlineFonts) ·
`app/state-core.jsx` (PACE_VERSION + deferred toasts) · `PACE.html` (título) ·
`app/focus/FocusTimer.jsx` (spacer aro) · `app/breakmenu/BreakMenu.jsx` ·
`app/main/ActivityBar.jsx` (export AB*) · `app/main.jsx` (handleBreakChoice) ·
`app/paths/PathRunner.jsx` (fase render-time + doneCount gate + setCaminoUiActive) ·
`app/i18n/strings/ui.js` (break.stretch + atajo) · **`fonts/` nuevo** (12 woff2).

## Verificación + cierre

Preview :8765, protocolo s93 (purga SW+caches por tanda) + seed fresco.
Verificado en **dev, compilado (index.html) y standalone**. Bump v0.50.0:
título ×3 + `CACHE_NAME` + `PACE_VERSION` (checklist ampliado s104). Backup
`v0.49.0_20260715` desde git HEAD (rotado `v0.34.0_20260605`, cap 20). Build
final 3052 KB / index ~970 KB.

## Pendiente / notas

- **PWA en navegador real** (instalación + notificación): sigue pendiente del
  usuario desde s102.
- `tokens.css` creció con los 12 @font-face (deuda; candidato a extraer a
  archivo propio si sigue creciendo).
- `FocusTimer.jsx` a 498 ln (al borde; lo nuevo va a `FocusTimer.support.jsx`).
- Etapa A del build **CERRADA** (precompilado s103 + fuentes s105).
