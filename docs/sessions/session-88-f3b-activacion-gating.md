# Sesión 88 — F3b: activación del gating premium (v0.34.4)

**Versión:** v0.34.3 → **v0.34.4** (patch)
**Fecha:** 2026-07-07
**Bloque:** Contenido+Premium — **Fase 3b** (activación del gating)
**Tipo:** feat (encender el gating sobre las rutinas existentes) + superficie
premium en Tweaks + verificación en preview + cierre completo

---

## Contexto

F3a (s87, v0.34.3) dejó el **mecanismo** de gating listo pero **dormante**:
token `--premium`, componente `PremiumSeal`, y `RoutineCard` (compartido por las
3 bibliotecas) leyendo `routine.access`. Todas las rutinas seguían `free`.

**F3b enciende el gating** sobre las rutinas que ya existen. Alcance acotado a
propósito: **solo el binario `free`/`premium`**, coherente con F3a. Los estados
intermedios de `MONETIZATION.md` (`locked.initial` / `locked.achievement` /
`locked.both`) y el sistema de licencia real (claves firmadas, `expiresAt`,
tipos lifetime/pass/season) quedan **fuera**, para una fase posterior post-v1.0.

---

## Auditoría previa (Tarea 0)

- `PACE_VERSION = 'v0.34.3'`, commit F3a (`d1b4683`) en `git` ✓.
- Mecanismo F3a intacto: `--premium` #9C6B2E + `--premium-soft` (tokens.css),
  `PremiumSeal` (Primitives, en window), `RoutineCard` lee `access` y desactiva
  el clic si `'premium'` (BreatheLibrary.jsx, único componente compartido).
- **26 rutinas, 0 con `access`**: Respira 12 (`BREATHE_ROUTINES`), Mueve 7
  (`MOVE_ROUTINES`, ids `extra.*`), Estira 7 (`EXTRA_ROUTINES`, ids `move.*`).
- `defaultState` sin `premiumUnlocked`. `TweaksPanel` sin superficie premium.
- i18n `premium.seal`/`premium.soon` (ES+EN) ya presentes.

---

## Tarea 1 — Set premium designado (binario, ~1/3 por módulo)

El usuario aprobó la dirección pero pidió **menos premium** (~1/3, solo lo más
profundo). Criterio: lo accesible/de entrada se queda `free`, lo
avanzado/profundo va `premium`. Las 2 iniciales de cada módulo (CONTENT.md,
"nunca cambian") se respetan como `free`.

**Set final: 8 premium / 26 (≈31%).**

| Módulo | premium | free (resto) |
|---|---|---|
| **Respira** (4) | `breathe.rounds.full`, `breathe.rounds.express`, `breathe.nadi.shodhana`, `breathe.kapalabhati` | rounds → safety; el resto incl. box.6 / coherent.66 / ujjayi se queda free (son variantes *más largas* de una técnica free, no avanzadas) |
| **Mueve** (2) | `extra.wall.sit`, `extra.core.stealth` (isométricos "al límite") | desk.pushups, posture.set (iniciales), calves, grip, chair.dips |
| **Estira** (2) | `move.atg.knees`, `move.ancestral` (ATG avanzado + suelo) | chair.antidote, neck.3 (iniciales), desk.quick, shoulders.5, hips.5 |

> Se desvía de la columna *propuesta* de `CONTENT.md` (que usaba `locked.*`,
> fuera de alcance en F3b): aquí todo se colapsa a binario.

`safety: true` se conserva en los datos donde aplica (rounds.full, rounds.express,
kapalabhati): cuando se desbloqueen, el modal seguirá saltando. Mientras están
bloqueadas, el clic está desactivado, así que la seguridad no se ve comprometida.

---

## Tarea 2 — Desbloqueo (cableado, sin compra real)

- **`app/state-core.jsx`** — `premiumUnlocked: false` en `defaultState`. Sin ruta
  de compra real hasta v1.0: permanece `false` y toda rutina `premium` se ve
  bloqueada (sello + "Pronto" + clic off).
- **`app/breathe/BreatheLibrary.jsx`** — `RoutineCard` ahora lee el flag:
  - `isPremium = routine.access === 'premium'` — marca de contenido de pago
    (el sello se muestra siempre que sea premium).
  - `isLocked = isPremium && !pace.premiumUnlocked` — el bloqueo real (accent
    off, `onClick` off, "Pronto" en lugar de minutos) depende del flag.
  - **El cableado queda listo**: poner `premiumUnlocked` a `true` (compra futura
    / `locked.initial` / `locked.achievement`) abre todas las premium sin tocar
    este componente. NO se implementa validación de licencia.

---

## Tarea 3 — Superficie premium en Tweaks (display-only)

**`app/tweaks/TweaksPanel.jsx`** — sección discreta tras "Tus datos", antes de
Reset. Reusa `PremiumSeal`. Copy honesto:
- Sello PREMIUM (bronce).
- Título "Contenido premium" (Garamond italic).
- Cuerpo: "El núcleo de PACE es y será gratis. Las rutinas y técnicas más
  profundas serán parte de una compra única, sin cuentas ni suscripción
  obligatoria."
- Input "Clave de licencia" **disabled** (display-only, sin validación).
- CTA "Pronto" **disabled** (bronce).
- Nota: "Aún no disponible. Cuando llegue, tu clave funcionará sin conexión."

i18n nuevo en `app/i18n/strings/ui.js` (ES+EN): `premium.tweaks.title` /
`.body` / `.placeholder` / `.cta` / `.note`.

---

## Verificación (preview real, propio puerto)

El dev server de otra sesión ocupaba :8765; arranqué uno propio (autoPort →
:65324, revertido en launch.json al cerrar). El `static-server.js` ya respeta
`process.env.PORT`.

- **Respira**: sello PREMIUM bronce + "Pronto" en rounds.full / rounds.express
  (con ⚠ de safety) y nadi.shodhana / kapalabhati. box.6 / coherent.66 / ujjayi
  / 4·7·8 / suspiro / bhastrika → `free` con minutos (screenshot).
- **Mueve**: PREMIUM en wall.sit + core.stealth; resto free (screenshot).
- **Estira**: PREMIUM en atg.knees + ancestral; hombros + caderas free
  (screenshot).
- **Tweaks**: superficie premium completa, discreta, paleta tierra, sin emojis
  (screenshot).
- `eval` de datos: los 8 flags `access:'premium'` correctos, `premiumUnlocked
  === false`, `PACE_VERSION === 'v0.34.4'`.
- **Consola sin errores** en toda la interacción.

---

## Build

- `PACE_standalone.html`: **628 KB**, **60 archivos validados** (11 .js + 49
  .jsx). `index.html` copia exacta — **SHA256 idéntico**
  (`f9b9fef0…18a4dd`).
- Backup `PACE_standalone_v0.34.3_20260707.html` (snapshot del v0.34.3 publicado
  en s87); cap 20 (rotado el más antiguo `v0.28.5_20260512.html`).

---

## Decisiones

| ID | Decisión | Razón |
|---|---|---|
| D1 | F3b solo binario free/premium | Coherente con F3a; los `locked.*` y la licencia real son post-v1.0. Encender lo construido sin abrir el sistema de licencia |
| D2 | Set premium = ~1/3 por módulo, solo lo más profundo | El usuario pidió "menos premium". Las micro-rutinas de entrada y las variantes *más largas* (no más avanzadas) se quedan free; premium = rondas/kriya/pranayama avanzado + isométricos al límite + ATG/suelo |
| D3 | El sello se muestra en toda premium; el bloqueo depende de `premiumUnlocked` | Separa "es contenido de pago" (marca) de "está bloqueado" (estado). Future-proof: flip del flag abre las premium sin tocar UI |
| D4 | Input de licencia + CTA **disabled** (display-only) | Honestidad: no hay validación hasta v1.0. Mejor un placeholder inerte que prometer algo que no funciona |
| D5 | `safety` conservado en las premium con retención | Cuando se desbloqueen, el modal de seguridad sigue siendo obligatorio. Regla del bloque sin excepción |

---

## Próxima sesión — F4 (contenido Respira)

Crecer Respira a ~20 técnicas (net-new: diafragmática, exhalación 4-6, rítmica
yin, coherencia 432Hz, Bhramari, tolerancia CO₂ + sesiones largas **CTB**
premium, todas con modal de seguridad). Etiquetar `access` de las nuevas según
el mismo criterio binario. El gating ya está encendido y verificado.

---

## Anexo (post-cierre, misma fecha) — auditoría integral

Tras el cierre de v0.34.4, el usuario pidió una **auditoría completa de
producto + técnica** con propuestas para ser la app más completa del sector.
Read-only, sin cambios de código ni bump. Informe:
[`docs/audits/audit-producto-v0.34.4.md`](../audits/audit-producto-v0.34.4.md).

Hallazgos destacados registrados en STATE: **D-8** (fuga premium vía
`path.weekend`: registry.js:73-74 lanza nadi.shodhana + atg.knees sin pasar por
`RoutineCard`; + logros explore/master ligados a rutinas premium) y
**TweaksPanel.jsx a 519 ln** (deuda MEDIA, split `PremiumSection.jsx`).
