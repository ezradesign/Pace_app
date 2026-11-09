# Segunda revisión de ChatGPT (9 nov. 2026) · dónde se quedó la rama

Rama `claude/chatgpt-jornada-9nov`. Ez dijo «Sí, así»: arreglar 5, 1, 3 y 2 con prueba y mutante, y pintar 4, 6 y 7
para elegir. La revisión y lo comprobado: `respuesta-2-dia-tiempo-cuenta.md`.

## Hecho y subido (cada uno con su fila arriba en DECISIONES_TECNICAS_VIGENTES)

| Punto | Commit | Prueba | Mutante |
|---|---|---|---|
| 5 · un bloque se cuenta una vez por su id | d6683620 | `tests/pestanas-dormida.spec.js` | caen los dos |
| 1 · un Foco pausado suma de foco lo del aro (`foco` en el tramo, `ritmoFocoMin`) | 9a398542 | `tests/ritmo-foco-pausado.spec.js` | sin `foco`, cae |
| 3 · cambiar cadencia, horario, semana o reuniones congela antes lo hecho (`ritmoFijarLoHecho`) | 1c7e6fbd | `tests/ritmo-fijar-lo-hecho.spec.js` | sin congelar, caen las dos |
| 2 · la hora de empezar se guarda también en marcha y viaja con `corre` | el commit que lleva este LEEME | `tests/foco-inicio-recarga.spec.js` | caen los dos |

El 2 subió como «WIP:» por el uso, pero está terminado: verify en verde y la suite de las zonas del Foco
(158 pruebas) en verde salvo una que se pasó de tiempo al cerrar (`eventos-origen`, «el aro con plan»), que
sola pasa. Sin versión, sin STATE ni CHANGELOG: eso lo pone la coordinadora al juntar.

## Lo que falta: la página de 4, 6 y 7 para Ez

Nada montado. Se paró por el uso de la semana (95 %). El guion de las fotos está listo en
`pintar-4-6-7.spec.js.txt`: se copia a `tests/__pintar.spec.js`, se corre con
`PINTAR_OUT=<carpeta> PACE_E2E_PORT=8887 npx playwright test tests/__pintar.spec.js --workers=1` y se borra.
Pinta sobre la app de verdad, a 360 y a 1280 la recomendada, en JPEG pequeños (la página, menos de 500 KB):

- **4 · «Cambiar» con un Foco en marcha.** A: preguntar con la misma ventana que la barra de arriba
  («Llevas 10 min de este bloque…», «Seguir con el bloque» / «Cambiar y dejarlo»). B: sin preguntar, el bloque
  en marcha pasa a ser el bloque 1 del día nuevo, a su hora y con su duración (como `ritmoBloqueEmpezado`).
  C: «Cambiar» apagado hasta acabar el bloque. Recomendación pensada: **B** (nada tapa, nada se pierde, sin
  pregunta nueva); la A tiene a favor que ya existe esa pregunta en la barra de arriba.
- **6 · lo hecho por tu cuenta con jornada.** A: debajo, «Además, por tu cuenta» con las mismas tarjetas.
  B: mezcladas por hora con «Por tu cuenta». C: una línea «Y 2 sesiones por tu cuenta · 6 min ›».
  Recomendación: **A**. Casar sesión y parada por identidad para no duplicar.
- **7 · «Hecha · 5 min» con una rutina de 2.** A: «Hecha · 2 min» (lo hecho de verdad; sin sesión casada,
  solo «Hecha»). B: «Hecha» sin minutos. C: «Hecha · 2 de 5 min». Recomendación: **A**. Y la pausa abierta
  que ya hiciste dice «Hecha», no «Ahora».

El guion no se ha corrido: puede que algún selector del 4 (la ventana de la barra de arriba, el enlace
«Cambiar» a 360) necesite ajuste. Mira las fotos antes de publicar.
