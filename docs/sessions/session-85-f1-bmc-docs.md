# Sesión 85 — F1: copy BMC honesto + recrear CONTENT/ROADMAP

**Versión:** v0.34.0 -> **v0.34.1** (patch)
**Fecha:** 2026-06-05
**Tipo:** fix(support) + docs · **Fase 1** del bloque Contenido+Premium

---

## Contexto

Esta sesión arranca el **bloque Contenido+Premium** (planificado en la
Fase 0, misma fecha). El bloque crece el catálogo (Respira ~20,
Estira/Mueve ~12-15 c/u, ~mitad premium) y activa el gating, en 8 fases.

F1 es la primera fase cerrable: la más barata y desbloqueante. Dos cosas:

1. **Resolver la contradicción Buy Me a Coffee.** El modal de apoyo
   (s16) declara una filosofía "no negociable": *"PACE es gratis y lo
   seguirá siendo. NO es freemium. Donar no desbloquea nada."* Eso
   chocaba de frente con el modelo Lifetime/Pase de `MONETIZATION.md`
   (s21-26), en concreto el valor `support.value.forever.sub` = *"sin
   paywall, sin pro"*.
2. **Recrear `CONTENT.md` y `ROADMAP.md`.** Ambos fueron borrados en el
   commit `be81606` (era v0.12.9) y llevaban ~60 sesiones sin existir,
   pese a que `CLAUDE.md` y `MONETIZATION.md` los citan como "único
   sitio" para catálogo y roadmap.

## Fase 0 — decisiones que gobiernan el bloque

Antes de F1 se cerró la planificación (ver [[content_premium_block]] en
memoria). Decisiones clave:

- **Modelo de contenido = gating a nivel sesión** (no por ejercicio
  suelto). La unidad gateable es lo que pulsas "empezar": en Respira una
  técnica, en Mueve/Estira una rutina. Se descartó exponer ejercicios
  sueltos navegables (un drill de 45s no es una sesión; gatear pasos
  dentro de una rutina = muro de pago a mitad de flujo).
- **Copy BMC = opción A** (truth-fix mínimo en el modal) + superficie
  premium aparte en Tweaks (F3). Mantiene el modal de donación puro.
- **Gating antes del contenido** (no se puede etiquetar `access` con
  honestidad sin el campo ni el sello visible).
- **Constructor de rutinas premium** (`custom.sequence`) como fase
  propia (F7): es donde el registro interno de ejercicios gana su sitio,
  reutilizando el runner data-driven de `MoveSession`.

## Qué se hizo

### 1. Copy Buy Me a Coffee (opción A — truth-fix)

3 strings ES + 3 EN en `app/i18n/strings/ui.js`. Solo lo literalmente
falso; el `lede` (todo local, sin tracking) se mantiene porque sigue
siendo cierto bajo el modelo premium (clave offline, sin cuentas/backend).

| Key | Antes (ES) | Después (ES) |
|---|---|---|
| `support.title.main` | PACE es gratis. | El núcleo de PACE es gratis. |
| `support.value.forever.sub` | sin paywall, sin pro | el núcleo, sin condiciones |
| `support.cta.sub` | No desbloquea nada. Solo nos da café. | No desbloquea nada — es una propina, no una compra. |

EN equivalente: "PACE's core is free." / "the core, no strings" /
"Unlocks nothing — it's a tip, not a purchase." La vaca y "Da de pastar
a la vaca" intactos.

### 2. `CONTENT.md` recreado

Refleja el catálogo **real** v0.34.0 (no el aspiracional): 12 Respira +
7 Mueve + 7 Estira. Documenta el swap de ids s14, el modelo de gating a
nivel sesión con `access` **propuesto** (lo implementa F3), las 2
iniciales free por módulo, y apunta a `app/achievements/catalog.js` como
fuente canónica de los 106 logros (sin duplicar la lista).

### 3. `ROADMAP.md` recreado

Marca lo ya hecho del roadmap original (responsive, Ritmos, loop,
sonidos, Caminos, i18n, PWA, glifos) y detalla las 8 fases del bloque
Contenido+Premium + medio/largo plazo (CTB, Chrome, Android, v1.0).

## Verificación

Preview local en `localhost:8765` (server `pace-preview`):

- **Dev (`PACE.html`)**: `PACE_STRINGS.es/en` devuelven el copy nuevo.
- **Modal de apoyo**: abierto vía botón del sidebar; renderiza el copy
  nuevo con la vaca, los 3 valores y los botones intactos (screenshot).
- **Standalone v0.34.1**: `window.PACE_VERSION === 'v0.34.1'`, title
  `PACE · Foco · Cuerpo — v0.34.1`, copy correcto.
- **Console errors: cero** en dev y en standalone.
- **Build limpio**: 60 archivos validados (11 .js + 49 .jsx), exit 0.

## Build

- `PACE_standalone.html` regenerado: **622 KB**. `index.html` copia exacta.
- Backup `backups/PACE_standalone_v0.34.0_20260605.html` creado.
- Cap 20 mantenido: rotado el más antiguo `v0.28.2_20260511.html`.

## Decisiones

- **Bump patch v0.34.1** (no minor): copy + docs, sin feature.
- **`CONTENT.md` no duplica los 106 logros**: alto riesgo de drift;
  `catalog.js` es la fuente de verdad. CONTENT.md documenta el diseño
  (rutinas + gating + taxonomía de categorías) y enlaza.
- **CHANGELOG**: v0.33.3 degradado a fila-de-enlace (convención: solo 2
  últimas detalladas → v0.34.1 + v0.34.0).

## Próxima sesión — F2 (auditoría de tracking)

Informe punta a punta de weeklyStats, history (días/meses/años), rachas,
heatmaps y detectores de logros, respetando los fixes de s69
(indexado lunes-primero, idempotencia, "día activo" = focus|breath|move>0).
Read-only + micro-fixes si aparecen. Es barata y de-risquea la base
antes de tocar contenido y gating (F3+).
