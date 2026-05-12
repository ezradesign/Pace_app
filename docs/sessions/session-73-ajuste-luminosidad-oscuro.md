# Sesion 73 -- 2026-05-12 -- style(ui): subir luminosidad y escalonar fondos modo oscuro (v0.28.10 -> v0.28.11)

## Motivacion

Tras el pulido del modo oscuro en s72 (v0.28.10), feedback del usuario:

1. El fondo principal seguia percibido como demasiado oscuro -- la sensacion era
   "casi negro" en lugar del "marron noche calido" que buscamos.
2. La sidebar (`--paper-2 #221d18`) era practicamente indistinguible del area
   principal (`--paper #1a1612`). Delta entre niveles insuficiente para crear
   jerarquia visual en modo oscuro.

Objetivo de esta iteracion: subir la luminosidad general de los fondos
manteniendo la sensacion de "noche", y ampliar el escalonamiento entre niveles
(`paper -> paper-2 -> paper-3`) para que sidebar y tarjetas se diferencien del
fondo de un vistazo.

## Tabla de variables -- antes / despues

| Token | Antes (s72) | Despues (s73) | L aprox |
|---|---|---|---|
| `--paper` | `#1a1612` | `#2a241d` | ~15 |
| `--paper-2` (sidebar) | `#221d18` | `#3a3128` | ~21 |
| `--paper-3` (tarjetas) | `#2a241e` | `#453a2e` | ~25 |
| `--line` | `#3a322a` | `#4a3f33` | -- |
| `--line-2` | `#4a4036` | `#5a4d40` | -- |
| `--ink`, `--ink-2`, `--ink-3` | sin cambio | sin cambio | -- |

## Decision de diseno

Escalonamiento ampliado a **~6 unidades L** entre cada nivel (en s72 el delta
entre paper y paper-2 era ~3 unidades, insuficiente). Tres motivos:

1. **Jerarquia perceptible**: el ojo necesita ~5-7 unidades L de diferencia
   para registrar dos superficies adyacentes como "una mas elevada".
2. **Sidebar distinguible**: con paper-2 a L~21 sobre fondo L~15, la sidebar
   se separa visualmente sin recurrir a bordes mas pronunciados.
3. **Tarjetas elevadas**: paper-3 a L~25 hace que las tarjetas de actividad
   (Respira/Estira/Mueve/Hidratate, Atardecer, sugeridas) se vean por encima
   del fondo de su contenedor (que puede ser paper o paper-2).

Tokens de tinta (`--ink-1/2/3`) intencionalmente no tocados: ya quedaron bien
calibrados en s72 y modificarlos ahora rompria el contraste de texto.

## Resultado esperado

- Fondo principal con tono marron-tierra calido (no negro plano).
- Sidebar visiblemente mas clara que el area principal sin gritar.
- Tarjetas/superficies elevadas claramente despegadas del fondo.
- Separadores (`--line`, `--line-2`) sutilmente mas visibles.
- Sigue siendo claramente "noche" -- no se siente como modo claro.

## Verificacion de jerarquia

- Sidebar (`paper-2 L~21`) sobre area principal (`paper L~15`): delta de 6
  unidades L -- diferenciacion clara.
- Tarjetas (`paper-3 L~25`) sobre sidebar (`paper-2 L~21`): delta de 4 unidades
  -- sutil pero perceptible. Sobre area principal (`paper L~15`): delta de 10
  unidades -- elevacion obvia.
- Lineas (`line L~21-ish`) sobre fondo principal: contraste suficiente para
  marcar separacion sin imponerse.

No se detectaron casos de inversion de jerarquia (tarjeta mas oscura que
contenedor).

## Build y entrega

- `PACE_standalone.html`: 567 KB. Sin cambios estructurales -- solo CSS.
- SHA256: `7CE9C44B0A15AE00B03203918F6280DB67184F5AA14D9A9B59FEEDDDE26FA065`
  (identico entre `PACE_standalone.html` e `index.html`).
- Bump: `app/state-core.jsx` `PACE_VERSION -> 'v0.28.11'`, `PACE.html` titulo,
  `sw.js` `CACHE_NAME -> 'pace-v0.28.11'`.
- Backup: `backups/PACE_standalone_v0.28.10_20260512.html`.
- Rotacion: eliminado `backups/PACE_standalone_v0.26.0-alpha_20260508.html`
  para mantener el cap de 20 backups.
- `scripts/check-session.ps1`: sin worktrees, sin commits pendientes, bundle
  en rango.

## Pendientes (sin cambio respecto a s72)

- Auto dia/noche (diferido a s74+ por scope).
- Pendientes A3/A4/M1..M6/B1..B5 del informe s68.
- Resto del backlog en `STATE.md`.

## Commit sugerido

```
style(ui): subir luminosidad y escalonar fondos modo oscuro (v0.28.11)
```
