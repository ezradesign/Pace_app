# Lo que cambia sin avisar y la primera vez en Respira (4 nov. 2026): Q2, Q4 y R1

Tres casos de las revisiones de ChatGPT del 28 oct. (`docs/audits/chatgpt-28oct/`, revisiones 6 y 7) que siguen igual en
la 0.189.0. Van como actualización durante los 14 días de los testers. Rama `claude/sweet-moser-38e06d`.

## Comprobado contra la 0.189.0

- **Q2**: en el escritorio, tocar una parada futura de la línea del día llama a `ritmoOtra` (`app/ritmo/RitmoLinea.jsx`):
  la cambia sin preguntar y sin deshacer. **Y puede cambiar otra más tarde**: tocar la de las 11:55 (Piernas sin pasos)
  sirvió Gemelos subrepticios y pasó la de las 16:20 de Cadena posterior (Estira) a Piernas sin pasos (Mueve). Es el motor
  de las series (`ritmo.series.js`): cada rutina sale una vez al día y el día reparte las zonas del cuerpo. En el móvil la
  jornada entera (`RitmoHoja.jsx`) ya tiene «Otra» aparte.
- **Q4**: `breakVetadas` (`app/breakmenu/BreakMenu.support.jsx`) aparta para siempre lo que tiene algún «No» y ningún
  «Sí»/«Un poco», en la pausa y en los pozos de «A tu ritmo» (`ritmoPozos`, `state-ritmo.jsx`); `SessionFeedback.jsx` solo
  dice «Gracias». La amnistía (si el veto vacía el pozo) sigue.
- **R1**: `BREATHE_ROUTINES` abre con Energía (tres con aviso); «Equilibrio» y «Balance» son grupos aparte; la tarjeta no dice
  si se aguanta el aire aunque el dato existe (`libraryConRetencion`, `library-rules.js`). «Para ahora» rota cada día.

## La maqueta

https://claude.ai/artifact/6eyroLktjNB2grtwdLHAaF (`maqueta.html` aquí; lee `fotos/` a su lado). Recomendado **1A 2A 3A**.

| | A (recomendada) | B | C |
|---|---|---|---|
| 1 · Q2 | Tocar abre una ficha (nombre, frase, minutos) con «Otra» y «Cerrar»; si «Otra» mueve otra pausa, la ficha lo dice | Cambia como hoy, con un aviso «Cambiada por… · Deshacer» | — |
| 2 · Q4 | El «No» la aparta dos semanas y lo dice, con «Deshacer» | El «No» solo valora; «No me la propongas» la aparta dos semanas | — |
| 3 · R1 | «¿Es tu primera vez? Empieza aquí» (Coherente 5·5) en el sitio de «Para ahora» hasta la primera respiración; cada tarjeta dice si se aguanta el aire; Energía al final; «Balance» se lee «Coherencia» | «Empieza aquí» siempre, encima, con el orden de hoy | Solo el orden, el nombre y la frase |

## Lo que eligió Ez (5 nov.) y está montado

Sus palabras: «1A + 2A pero durante una semana y el ahora no debería estar en la linea de abajo de si/un poco/no + 3A».

| Letra | Qué | Dónde |
|---|---|---|
| 1A (Q2) | Tocar una parada futura abre su ficha (hora, minutos, módulo, nombre, frase) con «Otra» y «Cerrar»; si «Otra» mueve otra parada, lo dice («para no repetir rutina ni zona»: la maqueta decía «zona», pero también cambia por no repetir rutina). Escape, «Cerrar» o tocar fuera; sube encima si abajo no cabe | `RitmoFicha` (`ritmo/RitmoLinea.jsx`), `.pace-rt-ficha` (`ritmo.css.jsx`) |
| 2A (Q4) | El «No» aparta UNA semana desde `lastNoDay` (lo guardado antes, desde `lastPromptDay`; sin fecha, nada), lo dice y lleva «Deshacer» (devuelve la pregunta y la entrada de antes). Solo lo promete si la rutina se propone (`breakProponible`). El evento del «No» sale al dejar la pantalla, para que uno deshecho no quede en el registro | `breakVetadas` (`breakmenu/BreakMenu.support.jsx`), `state-feedback.jsx`, `ui/SessionFeedback.jsx` |
| «Ahora no» | En su línea, centrado debajo de Sí · Un poco · No. Ez lo confirmó en la página de lo montado (https://claude.ai/artifact/WagDPPQz4kS2UdQvDiTauq): «El ahora no va en A, perfecto por lo demás» | `ui/SessionFeedback.jsx` |
| 3A (R1) | «¿Es tu primera vez? Empieza aquí» (Coherente 5·5) en el sitio de «Para ahora» hasta `breatheSessionsTotal` > 0; «sin aguantar el aire» / «aguantando el aire» (`libraryAire`); los grupos se pintan Relajación, Coherencia, Equilibrio, Pranayama, Energía; «Balance» se lee «Coherencia» (también el `code`). El catálogo no cambia de orden: lo recorren los pozos de «A tu ritmo» | `breathe/BreatheLibrary.jsx`, `ui/LibraryShell.jsx`, `ui/RoutineCard.jsx`, `ui/library-rules.js` |

Pruebas: `tests/linea-ficha.spec.js`, `tests/feedback-una-semana.spec.js`, `tests/respira-primera-vez.spec.js` (14 de 16 en
rojo contra la 0.189.0; las otras dos vigilan lo que no cambia). Al día con la decisión: `ritmo.spec.js` (la parada),
`cierre-sin-pisar.spec.js` («Ahora no») y `pausa-propone.spec.js` (el veto con fecha). Censo i18n: 1112 (+9).

## Los guiones

Las fotos caen fuera del repo, en `%TEMP%\pace-sin-querer-4nov` (o en `PACE_FOTOS`). Levantan su propio servidor en el 8820
(`MAQ_PORT`).

- `hoy.js`: la app tal cual (index.html) en las pantallas de partida.
- `opciones.js` + `variantes.js`: la maqueta. Sirve `PACE.html` con `page.route` y copias de cinco archivos con cada opción
  dentro, encendida por `window.__MAQ`. Parchea el código de la 0.189.0 (`7b9649a8`).
- `imagenes.js`: tamaños y recortes para la página.
- `montado.js`: lo montado, con el index.html compilado de la rama (usar `MAQ_PORT` distinto del de la suite).
