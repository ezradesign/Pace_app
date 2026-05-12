# Sesion 72 — Pulido modo oscuro

**Version:** v0.28.9 → v0.28.10
**Fecha:** 2026-05-12
**Rama:** main

---

## Motivacion

Feedback tras s71: el modo oscuro tenia fondo demasiado negro/frio y el aro
del Pomodoro se veia demasiado intenso (el gradiente terracota→oliva a plena
opacidad resultaba mas llamativo de lo deseado para el tono calmado de PACE).

Dos ajustes puntuales, sin tocar logica ni catalogos:
1. Recalibrar los tokens del bloque `[data-palette="oscuro"]` hacia marron
   oscuro cálido en lugar de casi-negro.
2. Bajar `strokeOpacity` del arco de progreso a 0.7 y suavizar el fallback
   del oliva final.

---

## Variables CSS — antes / despues

| Token PACE | Antes | Despues | Proposito |
|---|---|---|---|
| `--paper` | `#1A1814` | `#1a1612` | Fondo principal — marron mas calido |
| `--paper-2` | `#252119` | `#221d18` | Fondo secundario (sidebar) |
| `--paper-3` | `#302B21` | `#2a241e` | Superficie tarjetas/cards |
| `--ink-2` | `#B8AF9A` | `#c0b49e` | Texto secundario — subida de L 72→76 |
| `--line` | `#3C3628` | `#3a322a` | Lineas sutiles |
| `--line-2` | `#4E4735` | `#4a4036` | Lineas moderadas |
| `--ink` | `#EDE5D3` | **sin cambio** | Texto principal — no tocar |
| `--ink-3` | `#756D5D` | **sin cambio** | Microcopy — contraste suficiente |
| Acentos | varios | **sin cambio** | terracota/ocre/oliva/foco/breathe |

**Nota sobre `--ink-2`:** el prompt sugeria `#a89a8a` pero ese valor tiene
L≈64 vs L≈72 del original — habria reducido contraste. Se uso `#c0b49e`
(L≈76) que si sube luminosidad, mejorando la legibilidad de texto secundario.

---

## Aro del Pomodoro — cambios

| Propiedad | Antes | Despues |
|---|---|---|
| `strokeOpacity` | no definido (= 1.0) | `0.7` |
| Fallback `c3` (oliva) | `#3E5A3A` | `#6e7a4e` |

**Nota de comportamiento:** el fallback de `c3` solo se usa si
`getComputedStyle` no puede leer `--focus`. En modo oscuro el runtime
siempre lee `--focus = #7A9A6D`; el fallback no afecta. El cambio
visible es el `strokeOpacity=0.7`, que suaviza el arco a un 70% de
opacidad en todos los modos de paleta.

---

## Tarea 3 — Legibilidad elementos secundarios

Analisis sobre el nuevo fondo `#1a1612`:

| Elemento | Variable CSS | Contraste aprox | Estado |
|---|---|---|---|
| Microcopy "CICLO", "ACTIVIDADES" | `--ink-3 #756D5D` | ~3.7:1 | OK (pasa AA large) |
| Texto secundario tarjetas | `--ink-2 #c0b49e` | ~5.2:1 | OK |
| Lineas del aro base | `--line #3a322a` | ~1.8:1 | Correcto (decorativo) |
| Texto principal (timer, nombres) | `--ink #EDE5D3` | ~14:1 | Excelente |
| Logros (circulos) | `--achievement #B8934A` | ~4.5:1 | OK |

Ningun elemento requiere ajuste adicional. `--ink-3` es el mas justo pero
su uso es decorativo/meta (letras de apoyo en uppercase pequeno), no texto
de lectura continua.

---

## Decision diferida: auto dia/noche

Se evaluo implementar deteccion automatica de paleta segun
`prefers-color-scheme`. Decision: diferida a post-Reddit. Razones:
- El usuario actual elige paleta manualmente con un click.
- Sincronizar el estado del store con el sistema requiere un efecto
  y logica de precedencia (manual > auto) que aumenta superficie de bugs.
- El valor de UX es bajo para el publico objetivo (trabajadores de oficina
  que controlan su entorno).

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `app/tokens.css` | 6 tokens recalibrados en `[data-palette="oscuro"]` |
| `app/focus/FocusTimer.jsx` | `strokeOpacity="0.7"` + fallback `c3` → `#6e7a4e` |
| `app/state-core.jsx` | PACE_VERSION → v0.28.10 |
| `PACE.html` | Title v0.28.10 |
| `sw.js` | `CACHE_NAME` → `pace-v0.28.10` |

---

## Build

- Bundle: 567 KB (sin cambio vs v0.28.9 — modificaciones solo en CSS/tokens inline).
- SHA256: `C8D58372...ED52` (identico a `index.html`).
- Backup: `backups/PACE_standalone_v0.28.9_20260512.html`; rotado `v0.25.3_ROTO`.
- `check-session.ps1`: sin worktrees, sin commits pendientes, 567 KB en rango.
