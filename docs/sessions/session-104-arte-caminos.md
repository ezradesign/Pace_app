# Sesión 104 — Arte D-4: escenas ilustradas de Caminos (v0.49.0)

**Fecha:** 2026-07-14 · **Versión:** v0.48.0 → v0.49.0

La sesión estaba planificada como "fuentes self-hosted (cierra Etapa A)"
pero el usuario ENTREGÓ el arte D-4 completo (las 7 láminas de Caminos) y
lo priorizó. Las fuentes pasan a la próxima sesión. Todo el diseño se
iteró EN VIVO con el usuario (2 tandas de AskUserQuestion + 4 rondas de
feedback con mockups suyos).

## Qué se hizo

### Escena ilustrada full-bleed (iterada con el usuario hasta s104d)

- **`app/paths/illustrations/paths.index.js`** (nuevo): metadatos por
  camino — `dots` {x,y,r,color} medidos por escaneo (no a ojo), `paper`
  del arte, `focusY` (franja del sendero) y `finish` (encuadre del final
  del camino para la Completion). Las 7 láminas dentro.
- **`app/paths/illustrations/PathIllustration.jsx`** (nuevo): escena
  cover full-bleed con img+SVG en el mismo encuadre (alineación por
  construcción). **Lenguaje final de marcadores ("casquetes")**: las
  bolas pintadas del arte van SIEMPRE cubiertas — gris neutro
  (`--line`/`--line-2`) hasta completarse; al completar un paso la bola
  se RELLENA con el color de SU actividad (mapa kind→token de siempre)
  con un pop (`pace-scene-fill`) + eco de latido; el hito actual late en
  el color de la actividad que toca. El ORBE de s77 se retiró (feedback:
  "raro") — el viaje es el pop + el pan de cámara 2s. La cámara encuadra
  el hito actual y acompaña el paso en viewports estrechos.
- **Etiqueta del paso anclada a la bola** (mockup del usuario): nombre
  display + numeral romano en una placa mini de papel del arte (hairline
  + blur; tinta rebajada a `--ink-2`/`--ink-3` — el negro puro no casaba).
  StepIntro ya no pone título arriba; IntroCard mantiene el título del
  Camino arriba + **tagline del catálogo** (beneficio visible, feedback
  estrategia) y ancla el primer paso a su bola.
- **CompletionScreen**: escena de fondo (fixed, zIndex -1, isolation)
  encuadrada en `finish` (el final del camino: sol/farol/tetera/cabaña/
  loto), rellenos escalonados, y **placa de papel translúcida** tras
  RECORRIDO/DESBLOQUEADO (legibilidad sobre el dibujo).
- **"Sobre el arte siempre es de día"** (tokens.css): dentro de
  `[data-pace-scene-card]` en paleta oscura se re-mapean
  `--ink*`/`--paper*`/`--line*` Y los acentos de actividad a los valores
  CREMA (el arte no se tematiza; sin esto el texto era ilegible y los
  rellenos salían pastel). Son COPIAS de la paleta día — si se recalibra
  la crema, actualizar también ese bloque.
- **Fallback vivo**: caminos sin lámina en el índice conservan el
  SenderoBar clásico EXACTO (verificado antes de que el set se completara).
  SenderoBar no se tocó (decisión s99 intacta); la IntroCard sin escena
  gana la línea "I · Respira" bajo el título.

### Pipeline de assets + build

- Decisión (AskUserQuestion): **archivo en web + data URI solo en el
  standalone**. index.html referencia los .webp (PRECACHE en sw.js →
  offline fiel) y `build-standalone.js` gana el paso 6b
  (`inlineIllustrations`: data URIs SOLO en la copia standalone, con
  invariante de referencia huérfana). MIME .webp en static-server.
- **`scripts/ingest-lamina.js`** (nuevo): normaliza (1365×768 Lanczos3
  WebP q82) + mide bolas + papel + emite el bloque del índice. El
  detector 100% automático NO es fiable en láminas cálidas (el sepia
  enciende los umbrales de croma) → **modo híbrido**: semillas visuales
  `"x:y,..."` como 4º argumento + centroide local + crecimiento radial.
  Ese es el método canónico para futuras láminas.
- Las 7 ingeridas: dawn, midday, afternoon, tea, dusk, weekend, breath
  (2 bolas, caso límite correcto). `sharp` entra como devDependency
  (pins Babel 7/TS 5 intactos).
- Tamaños: standalone **2371 KB** (7 láminas inline, autocontenido);
  index.html **970 KB** (limpio, archivos + precache).

### Análisis estratégico externo (valorado y verificado)

El usuario trajo un análisis de producto/mercado. Verificación de sus P0
contra el repo: CowLogo corrupto **FALSO** (leyó su propio volcado) ·
versión desincronizada **CIERTO** → `PACE_VERSION` v0.46.0→v0.49.0
arreglado (llevaba mal desde s101; entra al checklist de bump) ·
**`todayISO()` usa UTC — CIERTO y grave** (rachas/history anotan el día
anterior entre medianoche y ~2 AM en España; 7 sitios afectados
auditados) → tarea corta propia al arrancar s105. Lo valioso destilado a
ROADMAP: mini-Caminos de activación + **"After Pomodoro" automático**,
programas 7/14 días, beneficio visible en copy (tagline en intro HECHO),
material ASO/pricing a pre-venta. Tweak `data-font="cormorant"` quedará
huérfano con las fuentes → decidir en esa tarea.

## Verificación

Preview :8765, protocolo s93 (purga SW+caches POR TANDA — lección
re-aprendida: el SW re-registrado sirve .jsx cache-first y se vio código
viejo una vez). Dev: los 7 caminos por DOM (imagen 1365 cargada, nº de
bolas exacto, etiqueta por kind — midday dice "Agua · I", pulso activo) +
recorridos completos de dawn en claro/oscuro/móvil + fallback verificado
con midday antes del set completo. Compilado (index.html): monta sin
Babel, dawn completo, .webp servido 1 vez (precache SW). Standalone:
data URI, cero peticiones .webp. Consola limpia en compilado; en DEV
queda un warning React PRE-EXISTENTE (no de esta sesión): frame fantasma
de fase 'step' en PathRunner antes del efecto que pone 'intro' →
BreatheSession monta 1 frame y escribe estado en render (Sidebar). En
producción no existe (React production). **Arreglar en sesión propia.**
OJO herramientas: los screenshots del pane de preview salieron con
zoom/recorte en varias tandas — la geometría se verificó por DOM con
marcadores; no es la app.

## Decisiones nuevas (a STATE)

1. Escena ilustrada = SOLO runner (intro/transición/completion); el
   SenderoBar sigue siendo el lenguaje fuera y el fallback dentro.
2. Casquetes: gris → color de actividad; sin orbe.
3. "Sobre el arte siempre es de día" (re-mapeo día en oscuro).
4. Pipeline: archivo+precache en web / data URI solo standalone.
5. El arte se mide UNA vez (ingest-lamina.js híbrido); no iterar una
   lámina ya medida.

## Pendiente

- **Fuentes self-hosted** (cierra Etapa A) — desplazada por la entrega
  del arte; próxima sesión junto a `todayISO()` local.
- Validación PWA en navegador real (desde s102).
- Frame fantasma PathRunner (warning dev).
- tokens.css ~600 ln (deuda desde s100, creció con el bloque escena).
- FocusTimer.jsx 493 ln al borde (sin cambios esta sesión).
