# Lo de producto del grupo 2 (30 oct. 2026): la carta para luego, la frase del móvil y mirar un ejercicio

Lo que quedaba del grupo 2 de las revisiones de ChatGPT del 28 oct. (`docs/audits/chatgpt-28oct/`): U3, U5 y, marcadas
«puede esperar a después de v1», U4 y P4. Rama `claude/eloquent-dhawan-80bab5`.

## Lo que eligió Ez

En la maqueta (https://claude.ai/artifact/Y3TxJ1sisYgSFYfHMaux4q, `maqueta.html` aquí), con sus palabras: «1A (me gusta lo
del sobre al lado de logros estadísticas / etc de hecho se puede utilizar para actualizaciones, alguna notificación
puntual y esto y puede ser abierto o cerrado no? + 2A +3A + 4B». La coordinadora le contestó, y así se montó: el sobre
tiene dos estados (cerrado sin leer, abierto leído) y está hecho para llevar más cosas, pero hoy solo lleva la carta.

| Letra | Qué | Dónde |
|---|---|---|
| 1A (U3) | La carta sale sola una vez, con la ×; cerrarla (×, Escape, tocar fuera) no aplica ni rechaza nada y la deja en el sobre de arriba, cerrado con lacre; contestada, el sobre queda abierto y la carta se relee sin botones; la semana que acaba sin contestar no cambia nada | `ritmoCartaLuego`, `ritmoCartaDeLaSemana` (`state-ritmo.motor.jsx`), `RitmoCartaRaiz` y `RitmoCartaLeida` (`ritmo/RitmoCarta.jsx`), `shell/Sobre.jsx`, `main/TopBar.jsx` |
| 2A (U5) | En el móvil, hasta empezar el primer bloque, la fila «Ahora» dice «45 min · empieza en el aro, arriba» | `RitmoMovil` (`ritmo/RitmoPanel.jsx`), `usePaceFocoEmpezado` (`focus/FocusTimer.support.jsx`) |
| 3A (U4) | Después de v1: nada montado | — |
| 4B (P4) | En «Antes de empezar» cada paso es un botón con «›»; la misma ventana pasa al ejercicio (dibujo grande, Colócate, Qué haces, Cuidado) y «‹ Los pasos» vuelve | `ui/RoutinePreview.jsx` |

Pruebas: `tests/carta-luego.spec.js`, `tests/ritmo-frase-movil.spec.js` y `tests/preview-ejercicio.spec.js` (17 de 20 en
rojo contra la 0.187.0; las otras tres vigilan lo que no cambia). Fotos de lo montado:
https://claude.ai/artifact/XSQNEkkt6Nh3cpFE4CR7Zj (`montado.html` aquí).

## Los guiones

Las fotos caen fuera del repo, en `%TEMP%\pace-grupo2-30oct` (o en `PACE_FOTOS`). Levantan su propio servidor en el 8815
(`MAQ_PORT`).

- `hoy.js`: la app tal cual (index.html) en las pantallas de partida.
- `opciones.js` + `variantes.js`: la maqueta. Sirve `PACE.html` con `page.route` y copias de cinco archivos con cada
  opción dentro, encendida por `window.__MAQ`. **Parchea el código de la 0.187.0 (`272ae24c`)**: sobre esta rama ya no
  casa, porque lo elegido está montado. Para rehacerla, en un worktree de ese commit.
- `montado.js`: lo montado, con el index.html compilado de la rama y sin nada inyectado.
- `imagenes.js` e `imagenes-montado.js`: tamaños y recortes para las dos páginas (`maqueta.html` y `montado.html`, que
  leen `fotos/` a su lado).
