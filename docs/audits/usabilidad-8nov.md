# Usabilidad del 8 nov. 2026 · PACE para quien la abre cada día

Rama `claude/usabilidad-8nov-587b48`, cortada de `main` local en la 0.194.0. La página para Ez, con
las fotos de hoy y las opciones pintadas sobre la app: https://claude.ai/artifact/BMLmjb9FjynGY8zz6FN4av
(`docs/audits/usabilidad-8nov/pagina-ez.html`). Scripts, en `docs/traspaso/archivos/usabilidad-8nov/`.

## Qué se recorrió

Los cinco scripts del recorrido del 6 nov. (copiados y puestos en el 8886), contra el `index.html` de
la 0.194.0 sin service worker: 40 pasadas a 360×800 y 1280×800, en claro y oscuro y en es y en. La
primera vez (bienvenida, «¿Cómo es tu semana?», PACE completo y la visita); la jornada de alguien con
seis semanas de datos (preparar el día, un bloque, cerrar y volver, la ventana de la pausa, «Antes de
empezar», el runner, las 17:40 y la mañana siguiente); los módulos (Respira con el aviso de la apnea,
Mueve y Estira con el runner y «Auto», Hidrátate, Logros, Estadísticas en sus cinco pestañas y
Ajustes); la jornada entera bloque a bloque hasta la salida; y la web (/premium, /beta, /gracias,
/recuperar, /desistir y la app sin red). En cada pantalla se miden errores de consola, scroll de más,
textos cortados o que se pisan y, en inglés, textos en español; y se mira la foto.

**Resultado: nada roto que arreglar sin preguntar.** Ningún error de la app, ningún scroll de más,
ningún texto cortado ni sin traducir, y el Tab no se escapa de ningún diálogo. Lo que salta en las
medidas y no es fallo:
- «Foco manual» y «Hasta las 17:00» que «se pisan» con el número del aro: son las cajas de línea de
  la serif grande; en la foto no se tocan.
- Los «recortes» de Respira, Mueve y Estira son tarjetas de una lista con scroll, a medio asomar.
- En inglés, la consola de desarrollo avisa de `extra.chair.squats.s{1,2,3,5,6}.instruction.setup`:
  esos pasos no tienen colocación en ningún idioma (son descansos o la segunda serie, ya colocado), y el
  runner pide la clave igual. No se ve nada; es ruido de desarrollo.
- «Tu» (martes) y «Español» en inglés; «Tus rutinas» no está en la home del móvil (vive en la cabecera
  de Mueve): era el script. `04-final-del-dia.js` en inglés se para tras el bloque 1 porque busca
  «Ahora no» en castellano; la ventana sale bien en inglés («Not now», foto de la pasada).

## Las seis mejoras propuestas

Elegidas por lo que ayudan a quien usa PACE a diario. Con su valor y su coste; ninguna está montada.

| # | Qué | Valor | Coste | Recomendada |
|---|---|---|---|---|
| 1 · S9 | Con la jornada cerrada, la fila «Siguiente · Ciclo 4 / 4» sigue bajo el botón y el punto del final del aro cae encima. Durante la jornada no se ve | Cada día, al cerrar: el aro de cierre queda limpio | Bajo: `AroFila` también `oculta` con `cerrada` (FocusTimer.jsx), y un paso en `tests/aro-jornada.spec.js` | **A**, sin la fila |
| 2 | La barra de arriba pregunta antes de dejar un Foco empezado, pero no una pausa: «Foco» la corta sin más (solo en el ordenador) | Medio: un clic sin vuelta atrás | Bajo: una marca de «pausa empezada» como `paceFocoEmpezadoPon`, la misma ventana y cuatro textos es/en | **A**, pregunta también |
| 3 | Tres días con un Foco por libre después de cerrar la jornada y la carta del lunes pregunta «Terminas a las 17:35. ¿Pongo tu salida a las 17:35?» | Protege la salida a su hora, que es lo que pidió E1 | Bajo-medio: `motorHoras` (ritmo.motor.js) deja fuera los Focos que empiezan después de la salida de ese día; prueba en el motor | **A**, no cuenta |
| 4 · Q5 | Si haces la pausa a tu manera (agua, una vuelta) sin abrir la rutina, solo puedes pulsar «Seguir» o «Ahora no», y queda saltada; tres días a la misma hora y la carta propone acortarla | Alto: cada pausa de cada día, y la carta aprende de datos ciertos | Medio: un estado más de la parada («por tu cuenta») que no suma minutos en Estadísticas ni cuenta como saltada en el motor; textos es/en; pruebas de ventana, motor y Estadísticas | **A**, enlace junto a «Ahora no» |
| 5 | «Hasta las 17:00» bajo «Bloque 1 de 9» es la salida, pero va encima de la cuenta del bloque (que acaba a las 9:35) y el aviso del móvil dice «Hasta las 9:35» | Medio-alto: se ve toda la jornada | Bajo: el texto `ritmo.hasta` del aro, es/en (o la hora del bloque) | **A**, «Tu jornada, hasta las 17:00» |
| 6 · R5 | En Ajustes, la voz se elige sin poder oírla, y la Música solo suena en Respira sin decirlo | Medio: se toca una vez, pero se toca a ciegas | Bajo-medio: «Escuchar» con la señal elegida (`ponerSenal`, TweaksAudio.jsx) y una línea | **A**, «Escuchar» y la línea |

La respuesta recomendada: **1A 2A 3A 4A 5A 6A**.

## Lo que se queda fuera y por qué

- **P7, «baja · sube» en las repeticiones**: útil para quien aprende, pero pide probarlo haciendo los
  ejercicios y añade movimiento al runner. Después de v1, con lo que digan los testers.
- **V1, «Solo pausas» sin Pomodoro**: la decisión de producto más grande de las revisiones; no cabe
  antes de v1 sin maqueta propia y testers.
- **V3 y V4** (la salida de un día difícil y el resumen del día con las pausas): el cierre ya cuenta
  el foco hecho; contar pausas sin afirmar lo que no se sabe va mejor con la 4 decidida.
- **La oferta de /premium**: no es de uso diario; va con la revisión del cobro.
- **S3** (los minutos del Foco libre tras la jornada) y **S7** (la comida): ya esperan las letras de Ez
  en la página de la caza de la semana.

## Arreglado sin preguntar

Nada: todo lo que encontré cambia lo que se ve o lo que la app decide, y espera a las letras de Ez.

## Dónde me quedo

- Página publicada (BMLmjb9…) y este informe, en la rama. Espera las letras de Ez.
- Para montar lo elegido: cada mejora dice arriba qué toca; las seis caben en una sesión. Las fotos
  se rehacen con `PACE_E2E_PORT=8887 RECORRIDO_FOTOS=<carpeta> node docs/traspaso/archivos/usabilidad-8nov/fotos-ez.js`
  y la página con `node docs/traspaso/archivos/usabilidad-8nov/pagina.js <carpeta>`.
- Uso al cerrar: la semana al 83 % y las 5 h al 47 %. No seguí con P7 ni con la suite: no hay código
  de la app cambiado que probar.
