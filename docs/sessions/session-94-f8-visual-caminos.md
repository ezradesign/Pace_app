# Sesión 94 — F8: visual de Caminos — cierre del bloque Contenido+Premium

**Fecha:** 2026-07-08 · **Versión:** v0.38.0 → **v0.39.0**
**Bloque:** Contenido+Premium (F1-F7 hechas) · **Fase 8 de 8 — BLOQUE CERRADO**

---

## Objetivo

Auditoría DESIGN_SYSTEM + polish visual de los 6 componentes de Caminos
(SuggestedPathCard, PathsLibrary, PathRunner.parts, SenderoBar,
PathTransitions, CompletionScreen + CSS del runner en PACE.html).
Absorbe 2 fixes verificados: variables huérfanas `--olive`/`--terracota`
y clipPath único por instancia. Solo visual — cero cambios de
comportamiento, gating o ids.

## Tarea 0 — Auditoría

- Commit s93 (`44912f5`, v0.38.0) en git ✓. Working tree con ROADMAP.md +
  STATE.md modificados (volcado del plan maestro del final de s93, sin
  commitear) — avisado al usuario, no bloqueante (F7 sí estaba en git).
- `PACE_VERSION` v0.38.0 ✓ · título PACE.html ✓ · standalone presente ✓.
- **Corrección al encargo:** el clipPath estático NO estaba en
  SenderoBar.jsx (usa `useId` para sus 2 radialGradient desde s75, sin
  clipPath alguno) sino en **`Sidebar.jsx:287`** — el mini-sendero del
  día usaba `id="sendero-clip"` global. Sin colisión activa hoy (Sidebar
  se monta una vez), pero id global estático.
- Huérfanas confirmadas con severidad real: la **barra de acento de las
  cards de Caminos era INVISIBLE** (background con var indefinida →
  transparente) y el **botón "Salir" del ExitConfirmModal era casi
  ilegible** (fondo transparente + texto #fff sobre crema).
- `.path-dots`/`.path-dot` en PACE.html: CSS muerto desde s75 (grep:
  cero consumidores).

## Decisiones aprobadas (Tarea 1)

| Decisión | Elección |
|---|---|
| Huérfanas | **Reemplazo directo** (`--olive`→`var(--focus)`, `--terracota`→`var(--breathe)`) — sin alias sinónimos en tokens.css |
| clipPath | **Fix en Sidebar.jsx** (donde realmente vive) con useId |
| Títulos serif | `var(--font-display)` en PathTransitions (título+hint), CompletionScreen (h2) y ExitConfirmModal (h3, que además pasa a serif italic) |
| Extras | Pack menor: sombra PathsLibrary `--sh-modal` · transitions a tokens · purga `.path-dot*` · asterisco Georgia→`var(--font-display)`. **Descartado:** botón "Volver" en display italic |

## Implementación (Tarea 2)

| Archivo | Cambio |
|---|---|
| `SuggestedPathCard.jsx` | `--olive`→`--focus` (barra + asterisco) · asterisco `Georgia, serif`→`var(--font-display)` · transitions 200/150ms→`var(--dur-quick) var(--ease)` |
| `PathsLibrary.jsx` | `--olive`→`--focus` ×3 (barra, tag Favorito, botón Fav) · panel `--sh-card`→`--sh-modal` · transition→tokens |
| `PathRunner.parts.jsx` | Botón confirmar: `--terracota`→`--breathe` + `#fff`→`var(--paper)` · h3 a `var(--font-display)` italic |
| `PathTransitions.jsx` | Título + hint: stack hardcodeado→`var(--font-display)` |
| `CompletionScreen.jsx` | h2: stack hardcodeado→`var(--font-display)` |
| `Sidebar.jsx` | `useId: useIdSidebar` + `sendero-clip-${useId}` en clipPath y referencia (+5 ln → 535). **Hallazgo:** ya estaba en ~530 ln, no en las 497 que decía STATE (creció sin registrar desde s61) — vuelve a deuda técnica, candidato: extraer SenderoDelDia |
| `PACE.html` | Purga `.path-dots`/`.path-dot` (4 reglas muertas) + bump título |
| `SenderoBar.jsx` | Auditado limpio — **cero cambios** |

## Verificación (Tarea 3)

Preview :8765, protocolo s93 (purga SW+caches tras cada tanda, no-store
activo). Home: barra de card computa `rgb(62,90,58)` = `--focus`.
Biblioteca: 7 barras verdes, sombra `--sh-modal`, toggle Favorito con tag
y botón en `--focus`. **Runner completo** de path.dawn: sesión Respira
terminada → StepIntro (SenderoBar lg + orbe viajero + label "Respira I"
done), Foco saltado, Cuerpo completado → OutroCard → CompletionScreen
(sendero 100%, recorrido con Foco tachado, logros). ExitConfirmModal
verificado en paso no-opcional: título serif italic, botón
`--breathe`/`--paper`.

**Hallazgo feliz:** el perfil del preview tenía `data-font="cormorant"`
persistido — los títulos de Caminos siguieron el tweak, prueba directa
en runtime de que la tokenización cumple su objetivo (antes quedaban
clavados en EB Garamond).

Oscuro: barra recalibra a `#7A9A6D` (`--focus` oscuro); el botón salir
resuelve `#D99477` + texto `#1d1a14` (por eso `var(--paper)` y no #fff).
EN: "All paths"/"Start"/"Favorite". Móvil 375px: sin scroll horizontal,
panel 335px, barra de acento oculta por la regla responsive de s61.
Consola sin errores. Estado del preview restaurado (localStorage limpio).

## Cierre

- Bump **v0.39.0** (título PACE.html + `PACE_VERSION` + `CACHE_NAME`).
- Backup `PACE_standalone_v0.38.0_20260708.html` (cap 20, rotado
  `v0.28.11_20260512.html`).
- `node build-standalone.js`: 713 KB, 69 archivos, SHA256
  standalone = index ✓. Standalone verificado en preview (v0.39.0, cero
  `--olive` en el bundle, consola limpia).
- **El bloque Contenido+Premium queda CERRADO (F1-F8).** Próxima sesión:
  s95 — guard central de entitlement (plan maestro, ROADMAP.md).
