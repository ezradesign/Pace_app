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

## La página de 4, 6 y 7 · dónde me quedo (10 nov.)

Publicada en la cuenta de esta rama: **https://claude.ai/artifact/KZFDp3zNhk4JAFHr13ysxq** («Letras 4, 6 y
7 de la jornada»). Desde la otra cuenta esa dirección da 404: se republica desde `pagina-4-6-7.html`
(405 KB, con las fotos dentro). Recomendadas: **4B, 6A, 7A**. Lo que falta es la letra de Ez en cada
punto y, después, montarlas.

- Las fotos salen del guion corregido, `pintar-4-6-7.spec.js.txt` (14 fotos, todas miradas). Para
  rehacerlas: copiarlo a `tests/__pintar.spec.js`, correr con `PINTAR_OUT=<carpeta>
  PACE_E2E_PORT=8887 npx playwright test tests/__pintar.spec.js --workers=1 --project=chromium`,
  luego `node incrustar.js.txt <carpeta> pagina-4-6-7.plantilla.html pagina-4-6-7.html`, y borrar el spec.
- Lo que no salió como decía el guion de antes: la 4A no abre a 360 px (en el móvil no hay barra de
  modos); ahora se pinta con el `Modal` y el `Button` de la app y los textos de la pregunta. La 4B del
  guion pintaba el fallo de hoy, no la opción: ahora el día se recoloca con `desde: 540, primerBloque:
  45, pasado: []` (sin `pasado`, `primerBloque` no se lee) y sale «Una hora · de 9:00 a 9:50», bloque
  de 45 y pausa de cierre a las 9:45. Esa foto del fallo es ahora la de «hoy» del 4. La 6B metía las
  11:20 antes de las 10:35 (ordena por hora). La 7 usa «hecha» en minúscula, como la app, y pinta
  también la pausa de las 13:15 ya hecha (hoy dice «ahora»). En la 6, las sesiones sueltas son Box
  4·4·4·4 y Cuello suave, que no están en el plan del día, para que no parezcan repetidas.
- Qué tapa cada una (medido): A del 4 es una ventana y tapa la pantalla, como la de la barra de arriba
  (lo dice la página); el resto no pisa nada. «Cambiar, al acabar el bloque» cabe a 360 px en la línea
  del título sin tocar «Jornada entera».
