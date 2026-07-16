# Sesión 106 — v0.51.0

**Onboarding de primera vez: 3 preguntas + primer Camino.**
Fila s106 del plan maestro "Camino a v1.0". La bienvenida deja de ser un
modal de una pantalla (WelcomeModal, s17) y pasa a un **flujo full-screen
de 5 pasos sobre las láminas de Caminos** (arte D-4, s104) que captura un
`profile` en state y aterriza en la home con el primer Camino destacado.
Cumple la petición s103-cierre: bienvenida **vistosa, cercana y
explicativa**.

Fecha: 2026-07-16. Versión: v0.50.0 → **v0.51.0**.

---

## Bifurcaciones decididas por el usuario (AskUserQuestion, patrón s103/s104)

1. **Formato** → *Pantalla completa con arte* (no wizard dentro del modal):
   cada pantalla lleva una escena ilustrada de Caminos de fondo.
2. **Cierre** → *Sugerir en home con CTA grande* (no auto-arrancar el
   runner): coherente con el tono calmado; el usuario decide.
3. **Necesidad** → *Opciones + texto libre*: 4 chips estructurados para el
   perfil + el campo de intención de siempre (opcional, sigue guardando
   `state.intention`).

Después dio el visto bueno global ("hazlo lo mejor y más profesional") y
las decisiones menores (copys, escena por pantalla) se tomaron en la
implementación.

## Qué se hizo

### `app/onboarding/` (nuevo — sustituye a `app/welcome/`)

- **`Onboarding.jsx`** (orquestador, ~380 ln): máquina de pasos 0-4,
  chrome superior (Atrás · puntos de progreso · toggle ES·EN en la
  bienvenida), columna central con reveal escalonado (`data-pace-reveal`,
  `key={step}` remonta y re-dispara), CTA + salida fantasma por pantalla.
  Contrato heredado del WelcomeModal: se muestra una sola vez
  (`state.firstSeen == null`), cerrar por cualquier vía fija `firstSeen`
  (bienvenida, no trámite), re-abrible vía **`pace:open-onboarding`**
  (sustituye a `pace:open-welcome`). **Sin Escape ni backdrop-click**:
  cerrar por accidente = perder la bienvenida para siempre. Sin retraso de
  montaje (el modal antiguo esperaba 1.2 s; full-screen sería un flash).
- **`OnboardingScreens.jsx`** (piezas puras, ~210 ln):
  `ONBOARDING_QUESTIONS` (definición de las 3 preguntas: field, keys,
  escena, opciones con acento), `OnbScene` (lámina cover + velo radial de
  crema FIJA — más denso tras la columna de contenido, abierto hacia los
  bordes para que el arte respire; sin lámina cae a papel liso),
  `OnbChoice` (chip-radio de placa translúcida, misma familia visual que
  las placas del runner s104; label display italic + sub + indicador
  radio en el acento), `OnbDots` (progreso 3 puntos, el activo alargado),
  `OnbLogo` (PNG oficial con tratamiento SIEMPRE de día — multiply, sin
  invert: el arte es papel claro fijo; fallback tipográfico si falla).
- **`pickFirstPath.js`** (~60 ln): candidatos por necesidad
  (calm→breath/dusk/tea · focus→dawn/afternoon/midday ·
  body→midday/weekend/dusk · energy→afternoon/midday/dawn), reordenación
  estable con los cortos primero si `time==='short'` (breath, tea),
  filtro existencia + `canAccessPath`, **fallback `getSuggestedPath()`**
  (todo saltado o sin candidatos vivos). `environment` se guarda pero aún
  no influye (sin metadatos de ruido hasta la taxonomía s108 — documentado
  en el propio archivo). SOLO se usa dentro del onboarding: la jerarquía
  de `getSuggestedPath` (s78) queda intacta; el scoring real es s107.

### Las 5 pantallas

| # | Pantalla | Lámina | Guarda |
|---|---|---|---|
| 0 | Bienvenida — manifiesto + 3 valores (reusa `welcome.*`) + hint "Tres preguntas breves. Medio minuto." | dawn | — |
| 1 | "¿Qué quieres cultivar?" — Calma/Foco/Cuerpo/Energía (acento del módulo) + campo libre | breath | `profile.need` (+`intention`) |
| 2 | "¿Cuánto tiempo sueles tener?" — Un respiro ~5' / Una pausa ~15' / Un bloque 25'+ | tea | `profile.time` |
| 3 | "¿Dónde trabajas?" — En la oficina / En casa / Va cambiando | midday | `profile.environment` |
| 4 | "Tu primer Camino" — lede explicativo + nombre + tagline + pasos del pick | la del pick | `firstSeen`; CTA fija `paths.lastViewed` |

Cada pregunta es **saltable** ("saltar esta pregunta" solo aparece sin
respuesta; el campo queda null). El CTA final "Ver mi Camino" cierra a la
home con el pick destacado (lastViewed = prioridad #1 de getSuggestedPath);
"prefiero explorar por mi cuenta" cierra sin tocarlo. El pick se congela
al ENTRAR al resumen (no en render — no puede cambiar bajo el usuario si
un re-render cruza un límite horario).

### Estado, i18n, tokens, wiring

- **`state-core.jsx`**: `profile: { need, time, environment, completedAt }`
  en `defaultState` (+comentario de contrato). Instalaciones previas lo
  reciben por el merge `{...defaultState, ...parsed}` — sin migración.
- **`app/i18n/strings/onboarding.js`** (nuevo, ~120 ln): keys
  `onboarding.*` ES+EN; la bienvenida reusa las `welcome.*` de `ui.js`
  (tagline/lede/values/lang-toggle quedan vivas).
- **`tokens.css`**: el remap "sobre el arte siempre es de día"
  (`[data-palette="oscuro"] [data-pace-scene-card]`) suma **`--focus-cta`
  y `--achievement`** (el onboarding usa el CTA Comenzar y el acento de
  Energía sobre arte) — copias día, mismo aviso de recalibración.
- **`main.jsx`**: fuera `openWelcome`/`useFirstTimeWelcome`/listener
  `pace:open-welcome`; `<Onboarding />` montado en el bloque de overlays
  (se auto-gestiona). **`app/welcome/WelcomeModule.jsx` ELIMINADO** (su
  manifiesto migró a la pantalla 0; Sidebar solo lo citaba en un
  comentario, actualizado).
- **`PACE.html`**: `strings/onboarding.js` tras achievements; los 3
  archivos de `onboarding/` TRAS el bloque de Caminos (consumen registry +
  paths.index); mount loop con 3 centinelas nuevos
  (`Onboarding`/`OnbScene`/`pickFirstPath` — carrera de evaluación s38b).

### Hallazgo de la sesión

**CTA deshabilitado por `opacity` inline PIERDE contra el reveal**: los
hijos directos de `[data-pace-reveal]` llevan `pace-reveal-rise` con
`forwards` → su `to { opacity: 1 }` gana al estilo inline. El botón
"Continuar" se deshabilita por **contorno neutro** (placa traslúcida +
borde `--line-2` + tinta `--ink-3`), no por opacidad. Regla: dentro de un
subtree con reveal, no señalizar estado con `opacity` inline.

## Verificación

Preview :8765, protocolo s93 (purga SW+caches por tanda + seed
`pace.state.v2` fresco con `firstSeen:null`).

- **Dev**: flujo completo con clicks reales (Foco+bloque → Morning Glory);
  perfil exacto en localStorage; `lastViewed` fijado; home aterriza con la
  card sugerida = el pick; atrás funciona; no reaparece tras recargar.
- **Saltar todo** → fallback horario (Hierbabuena a esa hora) ·
  **"explorar"** → `firstSeen` sí, `lastViewed` NO.
- **Oscuro**: remap día verificado por DOM (`data-palette="oscuro"` con
  fondo del dialog rgb(242,237,224)); texto legible sobre el arte.
- **Móvil 375px**: chips apilados, sin scroll horizontal (verificado por
  DOM: scrollWidth ≤ innerWidth).
- **Compilado (standalone servido)**: v0.51.0, cero `text/babel` residual,
  flujo completo por JS (calm+block → Hálito), perfil guardado, onboarding
  desmontado; **remonte completo del árbol con trap de errores: cero** (en
  dev Y compilado — los 4 errores residuales del buffer de consola eran de
  cargas rotas ANTERIORES al fix del mount loop).
- Build: 78 archivos validados, 79 scripts compilados, 7 láminas + 12
  fuentes inline, invariantes OK. Standalone **3073 KB** / index ~955 KB.

## Cierre

- Bump **v0.51.0** ×3 (título PACE.html + `CACHE_NAME` sw.js +
  `PACE_VERSION` state-core).
- Backup `PACE_standalone_v0.50.0_20260716.html` desde **git HEAD**
  (patrón s87/s103-s105); rotado `v0.34.1_20260605` (cap 20).
- CHANGELOG: fila + detalle v0.51.0; v0.49.0 baja a enlace; retirado
  también el detalle de v0.48.0 que quedó sin retirar en s105.

## Pendiente / siguiente

- **PWA en navegador real** (instalación + notificación): sigue del
  usuario desde s102 (sin confirmar al arrancar s106).
- **s107**: home Caminos al centro + `getSuggestedPath` v2 **con el
  `profile` capturado aquí** + After Pomodoro + mini-Caminos 2-3 min
  (la métrica "primer Camino completado en <3 min" se completa ahí:
  el onboarding ya deja al usuario a un click).
- El copy de opciones/preguntas puede iterarse con feedback real del
  usuario (patrón s104: él aporta, se porta literal).
