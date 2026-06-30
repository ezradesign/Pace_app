# Sesión 87 — F3a: mecanismo de gating premium (v0.34.3)

**Versión:** v0.34.2 → **v0.34.3** (minor-patch)
**Fecha:** 2026-06-30
**Bloque:** Contenido+Premium — **Fase 3a** (mecanismo de gating)
**Tipo:** feat (mecanismo) + verificación en preview + cierre completo

---

## Contexto

F3 del plan (gating a nivel sesión) es una fase grande: campo `access` en
rutinas + sello PREMIUM + desbloqueo (inicial/logro) + superficie premium en
Tweaks. Se trocea en **F3a (mecanismo)** y **F3b (activación)**.

**F3a** construye y verifica el mecanismo, pero lo deja **dormante**: todas las
rutinas siguen `free`, así que nada cambia para el usuario. La decisión de *qué*
rutinas son premium es producto/contenido (F5-F7) y el desbloqueo real es F3b.

Decisiones delegadas por el usuario ("lo que tú recomiendes"): alcance =
mecanismo-only; sello = token nuevo bronce.

---

## Auditoría previa (estructura real, no la memoria de 24 días)

- **`RoutineCard` es un único componente compartido** (definido en
  `BreatheLibrary.jsx`, expuesto a `window`, consumido por `MoveModule` y
  `ExtraModule`). → **un solo punto de inserción** para el sello, no tres.
- 26 rutinas sin campo `access`: Respira 12 (`BREATHE_ROUTINES`, 5 categorías),
  Mueve 7 (`MOVE_ROUTINES`), Estira 7 (`EXTRA_ROUTINES`). Caminos (`registry.js`)
  ya tienen `access: 'free'`.
- No existía ningún token premium/oro/locked. Hallazgo clave: **ya existe
  `--achievement: #B8934A`** (goldenrod) y `--move: #9A7B4F` (tan) — dos golds
  casi iguales chocarían con el tono artesanal.

---

## Decisión de color

`--premium: #9C6B2E` (bronce profundo y saturado) + `--premium-soft`,
deliberadamente **más oscuro** que `--achievement` y `--move` para que el sello
no se confunda con ninguno a simple vista. Tono tierra, sin dorado brillante ni
gradiente — coherente con "NO gradientes, NO emojis, paleta tierra".

---

## Cambios

### Añadido
- **`app/tokens.css`** — `--premium` (#9C6B2E) + `--premium-soft`
  (rgba(156,107,46,0.12)), junto a `--achievement`, con comentario de por qué el
  bronce es distinto.
- **`app/ui/Primitives.jsx`** — componente reutilizable `PremiumSeal` (chip
  inline; prop `label` opcional, por defecto i18n `premium.seal`). Exportado a
  `window` para reuso en F3b (Tweaks / Caminos).
- **`app/i18n/strings/ui.js`** — `premium.seal` ('Premium'/'Premium') y
  `premium.soon` ('Pronto'/'Soon'), ES + EN.

### Cambiado
- **`app/breathe/BreatheLibrary.jsx`** — `RoutineCard` lee `routine.access`:
  - `isPremium = routine.access === 'premium'`.
  - Premium → sello `<PremiumSeal/>` en la fila de tags, "Pronto" en lugar de
    los minutos, y **clic desactivado** (`onClick={isPremium ? undefined : onClick}`,
    `accent` también) → la tarjeta no arranca.
  - Comentario de convención: ausente|`'free'` = libre, `'premium'` = de pago.
- **`DESIGN_SYSTEM.md`** — documentado `--premium` / `--premium-soft`.
- **`PACE.html`** / **`app/state-core.jsx`** / **`sw.js`** — bump v0.34.3.

---

## Convención del campo `access`

```
ausente | 'free'  → libre (clicable, arranca normal)
'premium'         → de pago: sello PREMIUM + "Pronto", NO arranca.
                    Sin ruta de desbloqueo real hasta v1.0.
```

F3b añadirá el desbloqueo (inicial/por logro) + la superficie premium en Tweaks
y designará el set premium real (junto con F5-F7).

---

## Verificación (preview real en localhost:8765)

1. Marqué `breathe.box.6` (Box 6·6·6·6) como `access: 'premium'` **temporalmente**.
2. Build + preview: sello **PREMIUM** en bronce `rgb(156,107,46)` con fondo
   `--premium-soft` y borde `--premium`; **"Pronto"** sustituyendo a los minutos
   (la tarjeta libre Box 4·4·4·4 muestra "5 min" en terracota). Screenshot OK.
3. Confirmado clic: tarjeta libre `cursor: pointer` vs. premium `cursor: default`
   (no clicable).
4. **Revertido el flag temporal** y recompilado limpio: 0 rutinas premium en
   datos, token y `PremiumSeal` presentes, **consola sin errores**.
5. Build: **60 archivos validados**, SHA-256 de `PACE_standalone.html` ===
   `index.html`.

---

## Build

- `PACE_standalone.html`: **625 KB**. `index.html` copia exacta (SHA256 idéntico).
- Backup `PACE_standalone_v0.34.2_20260630.html` creado (snapshot del v0.34.2
  publicado, extraído de `git show HEAD:PACE_standalone.html` para que represente
  el release real F2, sin el código F3a); cap 20 (rotado el más antiguo
  `v0.28.4_20260512.html`).

---

## Decisiones

| ID | Decisión | Razón |
|---|---|---|
| D1 | Trocear F3 en F3a (mecanismo) + F3b (activación) | F3b mezcla decisión de producto (qué rutinas son premium); F3a entrega un mecanismo limpio y verificable sin tocar contenido |
| D2 | `--premium` = bronce #9C6B2E, no un segundo gold | `--achievement` (#B8934A) y `--move` (#9A7B4F) ya ocupan la zona oro/tan; un bronce más oscuro separa premium sin romper el tono |
| D3 | Convención: ausente = free, solo se anota `'premium'` | Evita 26 ediciones de `access:'free'` sin valor; el default es seguro y queda documentado |
| D4 | Sello inline en la fila de tags (no esquina) | La esquina top-right ya la usa el badge `safety` (⚠); inline evita colisión |
| D5 | `PremiumSeal` en Primitives (no local) | Reutilizable en F3b (Tweaks, Caminos); Primitives es el hogar de los primitivos compartidos |

---

## Próxima sesión — F3b

Activar el gating: lógica de desbloqueo (inicial / por logro) + superficie
premium discreta en Tweaks (sello + input de licencia display-only, sin
validación real hasta v1.0) + **designar el set premium inicial** en las rutinas.
Regla del bloque: premium sin ruta de desbloqueo real hasta v1.0 (sello +
"Pronto"); free/locked.initial/locked.achievement sí funcionales.
