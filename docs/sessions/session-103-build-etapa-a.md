# Sesión 103 — Build Etapa A: precompilado Babel + React production (v0.48.0)

**Fecha:** 2026-07-13
**Versión:** v0.47.0 → v0.48.0
**Alcance:** plan maestro "Camino a v1.0", fila s103-104 (primera de las dos
sesiones). Precompilar los 74 scripts `text/babel` a JS plano en build +
React 18.3.1 production UMD self-hosted e inlineado. **Las fuentes
self-hosted quedan para s104** (decididas ya las bifurcaciones). Cero
cambios de arquitectura: `app/` intacto (ni una línea), `PACE.html` dev
sigue con CDN development + Babel standalone en el navegador.

---

## Tarea 0 — Git

s102 commiteado y pusheado (`e8be7b5`, "feat(pwa): Complete PWA
implementation with updates & deep links") + commit posterior de docs del
usuario (`86f8be6`). Working tree limpio, `main` == `origin/main`.

## Bifurcaciones decididas por el usuario (AskUserQuestion, antes de tocar)

1. **Build Etapa A confirmado** para s103 (el pulido s102-cierre queda
   detrás).
2. **React production inlineado en AMBOS artefactos** (standalone e
   index.html): se mantiene el modelo de un solo artefacto; las únicas
   divergencias siguen siendo el link de manifest (s102) y, en s104, las
   fuentes.
3. **Fuentes (para s104): solo EB Garamond + Inter Tight** (~10 woff2
   latin). Cormorant Garamond (fallback que nunca se ve si EB carga) y
   JetBrains Mono (devtools/secretos) caen a Georgia / ui-monospace.
4. **Standalone con fuentes inline como data URIs (s104)**: el artefacto
   exportable será 100 % autocontenido también en tipografía.

## Hallazgo previo (auditoría)

El "standalone offline" **nunca fue offline de verdad**: cargaba React
development, ReactDOM y Babel standalone (~2,9 MB) desde unpkg y las
fuentes desde Google. Sin CDN no arrancaba. Producción además compilaba
JSX en el navegador en cada carga (1-3 s) con React development.

## Qué se hizo

### A · Toolchain (devDependencies + vendor/)

- `@babel/core` + `@babel/preset-env` + `@babel/preset-react` **pineados a
  major 7** (7.29.x, la MISMA major.minor que el @babel/standalone 7.29.0
  del navegador → semántica de compilación idéntica dev/prod) y
  `typescript` **pineado a major 5** (5.9.x, API clásica que usa el
  validador s56). OJO: `npm install` sin pin trajo **Babel 8 (ESM-only) y
  TypeScript 7 (port Go, sin `ts.createSourceFile` vía require)** — ambos
  rompían el build. Los pins en package.json son deliberados; no subir de
  major sin sesión propia.
- `react@18.3.1` + `react-dom@18.3.1` como devDependencies; los UMD
  `react.production.min.js` (10,7 KB) y `react-dom.production.min.js`
  (131,8 KB) se copiaron del paquete npm (verificado por integrity del
  lockfile, no descarga suelta) a **`vendor/`** (committeado).
- `package-lock.json` nuevo (antes no existía).

### B · build-standalone.js (v0.48.0)

Pipeline nuevo dentro del paso de inlineado (pasos renumerados 1-7):

- **`compileBabel`**: cada `<script type="text/babel">` (73 archivos + el
  mount loop inline) se compila en memoria con `babel.transformSync` —
  `sourceType: 'script'` (no inyecta "use strict"), preset-env con targets
  evergreen (chrome/edge/firefox 90, safari 14.1 → conserva `?.`/`??`
  nativos, cero helpers), preset-react, `retainLines` (los stack traces de
  producción apuntan a la línea real del .jsx).
- **Semántica de scope (el descubrimiento clave de la sesión)**: Babel
  standalone ejecuta cada text/babel vía **eval indirecto** → los
  `function`/`var` top-level se vuelven propiedades de window
  automáticamente (así comparten `RoutineCard`, `getBreatheRoutine`… SIN
  `Object.assign`), y los `const`/`let` quedan privados por archivo. Los
  `<script>` planos hacen exactamente lo contrario (todo comparte el scope
  léxico global). Reproducción fiel en build: **IIFE por archivo** (los
  `const { useState } = React` y `GLYPH_SVG` repetidos entre archivos ya no
  chocan) **+ re-exposición por AST** de los nombres `function`/`var`
  top-level del compilado (`collectGlobalNames` con @babel/core parseSync)
  al final de cada IIFE.
- **React production inlineado desde vendor/** en el output y
  **@babel/standalone retirado**; el reemplazo usa callback de función
  (el `$&`/`$'` del JS minificado envenena los replacement strings de
  `String.replace` — bug real encontrado).
- **`replaceOutsideComments`**: los replaces de scripts saltan los
  comentarios HTML (el bloque "Monta la app" contiene un
  `<script type="text/babel" src>` literal que rompía la compilación del
  inline — mismo motivo por el que validateInlineScripts strippea
  comentarios desde s56).
- **Invariantes nuevas del bundle**: sin tags text/babel residuales (sobre
  tags reales, no cuerpos ni comentarios), sin referencias a unpkg.com,
  sin `</script>` en el JS compilado/vendor, y sanity post-escritura de
  ambos artefactos (React production + mount presentes).

### C · Versión

`PACE.html` título → v0.48.0 · `sw.js` CACHE_NAME → `pace-v0.48.0`. Nada
más: manifest, SW y registro intactos (la pareja s89+s102 no se toca).

## Verificación (preview :8765 propio, protocolo s93 + seed fresco)

- **Dev (`/PACE.html`)**: intacto — Babel in-browser compila y monta igual
  que siempre.
- **Compilado (`/index.html`)**: monta sin `Babel` global, React 18.3.1
  production, 74 scripts IIFE. **Checklist funcional completo**: Welcome
  primera vez (intención persiste) · Respira librería 20 técnicas + sesión
  animada (Exhala→Inhala) · Mueve sesión PASO 1 DE 5 con countdown vivo ·
  Estira librería · Hidrátate +/− (weeklyStats lunes-first correcto) +
  persiste recarga · **logro desbloquea y toast visible** (medido: viewport,
  opacity 1, z 200, "Nuevo sello · Primer sorbo") · paleta Crema↔Oscuro
  (`--paper #F2EDE0 ↔ #1d1a14` exactos) · deep link `?go=breathe` abre y
  limpia URL · **pomodoro s102 en ambas ramas**: reanuda tras recarga
  (00:06→00:04, endsAt original) → completa → BreakMenu + ciclo 1 + 25 min
  acreditados + clave limpia; y expirado-fuera → descarte SIN acreditar.
- **Equivalencia dev=compilado** verificada donde hubo duda (Bhastrika
  arranca directo en ambos; el modal de seguridad está cableado a las
  Rondas, premium/"Pronto" en free).
- **Pareja SW (s89+s102) con DOS SW reales**: primer install sin bucle de
  reload → bump CACHE_NAME → worker nuevo en **waiting** + barra "Hay una
  versión nueva de PACE" (Actualizar/Luego) → "Actualizar" activa, borra el
  cache viejo, recarga sola y el estado del usuario queda intacto. (OJO
  metodológico: el navigate del pane hace hard-reload y deja la página sin
  controlar → el SW nuevo activa directo y el test da falso negativo;
  probar el waiting con `reg.update()` sobre página controlada viva.)
- **Standalone servido**: monta, sin manifest link, sin Babel, React
  production. Referencias externas restantes: SOLO fonts.googleapis (@import,
  cae en s104) + buymeacoffee (href de enlace) + reactjs.org (string del
  error-decoder). **Cero JS por CDN.**
- **index.html conserva `<link rel="manifest">`** (paso 9 intacto).
- Trap de errores en vivo + render completo forzado del árbol + apertura
  de Estira/Ritmo/Logros: **cero errores**. (Los `RoutineCard is not
  defined` que quedaban en el buffer de consola eran de la iteración
  pre-fix, verificado.)

## Números

| | v0.47.0 | v0.48.0 |
|---|---|---|
| Standalone | 774 KB | 924 KB (React production inline + JSX compilado) |
| CDN en runtime | ~4 MB (React dev + ReactDOM dev + Babel 2,9 MB) | **0** |
| Compile en el navegador | 1-3 s por carga | **0** |
| React | development | production |

## Cierre

Backup `v0.47.0_20260713` (desde git HEAD, patrón s87; rotado
`v0.33.2_20260523`, cap 20) · rebuild final 924 KB / 74 scripts · diario ·
CHANGELOG (detalle v0.48.0 + v0.47.0) · STATE reescrito · ROADMAP ·
memorias. DESIGN_SYSTEM sin cambios (cero tokens tocados).

## Pendiente → s104 (segunda mitad de la fila s103-104)

- **Fuentes self-hosted subseteadas**: EB Garamond + Inter Tight woff2
  latin → `fonts/` + @font-face en tokens.css (fuera el @import de Google) ·
  index.html referencia `/fonts/*` y **entran al PRECACHE de sw.js** ·
  standalone las inlinea como data URIs · MIME woff2 en static-server ·
  bump versión + re-check del ciclo waiting→activate.
- Sigue pendiente del usuario (s102): probar instalación + notificación
  PWA en navegador real tras el próximo deploy.
