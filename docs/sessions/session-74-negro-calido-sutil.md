# Sesion 74 -- 2026-05-12 -- style(ui): negro calido sutil (v0.28.11 -> v0.28.12)

## Motivacion

Esta sesion cierra una trayectoria de tres iteraciones sobre el modo oscuro.
Tras s73 (v0.28.11), el fondo se sintio demasiado claro y la sidebar se leia
como "panel" separado en lugar de continuacion del lienzo. Una primera
exploracion en s74 que empujaba hacia terracota (~hue 25) anadia caracter
pero alejaba el modo oscuro de la sensacion de "noche calmada" que persigue
la marca.

Aterrizaje final: volver a "casi negro" -- ~10% menos negro que negro puro --
con apenas un matiz calido retenido del marron-tierra de la paleta clara, y
reducir el escalonamiento entre niveles de ~6 L (v0.28.11) a ~4 L para que
la sidebar se distinga al fijar la vista sin saltar como elemento separado.

## Trayectoria de iteraciones

| Version | `--paper` | `--paper-2` | Delta L | Lectura |
|---|---|---|---|---|
| v0.28.10 (s72) | `#1a1612` (L~9) | `#221d18` (L~12) | ~3 | demasiado oscuro, sidebar invisible |
| v0.28.11 (s73) | `#2a241d` (L~15) | `#3a3128` (L~21) | ~6 | luminoso, sidebar "panel separado" |
| v0.28.12-tc (s74a) | `#2d2218` | `#3d2f24` | ~6 | terracota, demasiado caracter |
| **v0.28.12 (s74)** | **`#15130f` (L~8)** | **`#1d1a15` (L~12)** | **~4** | **casi negro calido, sidebar sutil** |

## Tabla antes / despues

Referencia "antes" = v0.28.11 (los valores con los que arrancamos s74,
descartando la iteracion terracota intermedia que no quedo persistida en
el diseno final).

| Token | v0.28.11 | v0.28.12 | L aprox |
|---|---|---|---|
| `--paper` | `#2a241d` | `#15130f` | ~8 |
| `--paper-2` (sidebar) | `#3a3128` | `#1d1a15` | ~12 |
| `--paper-3` (tarjetas) | `#453a2e` | `#252119` | ~16 |
| `--line` | `#4a3f33` | `#332d24` | -- |
| `--line-2` | `#5a4d40` | `#403930` | -- |
| `--ink-1/2/3` | sin cambio | sin cambio | -- |
| Acentos | sin cambio | sin cambio | -- |

## Decision: delta sidebar reducido a ~4 L

En v0.28.11 el delta entre `--paper` y `--paper-2` fue ~6 L: suficiente
para que la sidebar se leyera claramente, pero excesivo para una UI donde
la sidebar **no** es un panel modal -- es la continuacion del lienzo. Un
delta de ~4 L:

- Hace la sidebar perceptible al fijar la vista (no invisible como s72).
- Evita la sensacion de "dos zonas distintas" (no panel flotante).
- Mantiene jerarquia sutil de tarjetas (`--paper-3`, L~16) sobre sidebar
  (`--paper-2`, L~12) y sobre area principal (`--paper`, L~8).

Regla aplicada: cuando la separacion estructural ya esta clara por
layout (la sidebar siempre vive en el mismo sitio), el delta cromatico
puede ser bajo. La diferenciacion no necesita gritar.

## Hue retenido (matiz calido sutil)

Hex `#15130f`: dominante neutra pero levemente desplazada hacia el calido
(R > G > B). No es terracota: es el mismo eje cromatico que `--paper`
en la paleta clara, escalado hacia negro. Coherencia automatica con la
familia tierra sin recurrir a un hue saturado.

## Build y entrega

- `PACE_standalone.html`: 567 KB. Solo CSS modificado.
- SHA256: `36964C7A5472935E9636B727AB8F26932CEC94A887D08A24AD7CEC35D101334E`
  (identico entre `PACE_standalone.html` e `index.html`).
- Bump: `app/state-core.jsx` `PACE_VERSION -> 'v0.28.12'`, `PACE.html` titulo,
  `sw.js` `CACHE_NAME -> 'pace-v0.28.12'`.
- Backup: `backups/PACE_standalone_v0.28.11_20260512.html`.
- Backups en disco: 20 (cap respetado, sin rotacion adicional).
- `scripts/check-session.ps1`: sin worktrees, sin commits pendientes.

## Verificacion manual esperada

- Fondo principal claramente "noche" -- casi negro, sin lectura cromatica
  evidente. Matiz calido solo perceptible en comparacion lado a lado con
  negro puro.
- Sidebar visible al fijar la vista, no antes. No se siente como panel.
- Tarjetas (Atardecer, sugeridas, actividades) elevadas sobre el fondo
  con jerarquia sutil.
- Lineas de separacion presentes pero no protagonistas.

## Pendientes (sin cambio)

- Auto dia/noche (diferido a s75+).
- Pendientes A3/A4/M1..M6/B1..B5 del informe s68.
- Resto del backlog en `STATE.md`.

## Commit sugerido

```
style(ui): recalibrar oscuro a negro calido sutil con escalonamiento reducido (v0.28.12)
```
