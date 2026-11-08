# Recorrido del 6 nov. 2026 · lo que recibirán los testers

Sobre `claude/tanda-jornada-catalogo` (v0.191.1 con la jornada como paso actual y catálogo, cifras
y Auto), compilada a `index.html` y servida sin service worker previo. Rama
`claude/recorrido-6nov-645d6b`. Scripts, siembra y fotos en `docs/traspaso/archivos/recorrido-6nov/`.

**Qué se recorrió**, como alguien que la usa, a 360×800, 1280×800 y 1536×710, en es y en, claro y
oscuro: la primera vez (bienvenida, «¿Cómo es tu semana?», PACE completo y la visita, con Tab y
Escape en cada diálogo); alguien con seis semanas de datos (historial, logros, semana guardada y
215 eventos del registro); la jornada entera de un jueves (preparar el día, empezar, cerrar la
pestaña con el bloque en marcha y volver, la ventana de la pausa, «Ahora no», «Hacer la pausa»
hasta el runner, el final del día bloque a bloque, la medianoche y la mañana siguiente); Respira
con el aviso de la apnea, Mueve y Estira con el runner y «Auto», Hidrátate, Logros, Estadísticas
(Hoy, Semana, Mes, Año y «Qué te ayuda»), «Tus rutinas» y Ajustes; las cinco páginas de la web y
la app sin red.

**Resultado: 8 fallos. 3 arreglados aquí (código, cada uno con su prueba en rojo sin el arreglo) y
5 para Ez** (dos de producto con código detrás, uno de código que espera la misma decisión, dos de
pulido). Lo que salió limpio: ningún error de consola de la app, ningún scroll de más en la home ni
en los diálogos, ningún texto cortado ni sin traducir salvo «chair», y el Tab no se escapa de
ningún diálogo de la pila.

## Arreglado en esta rama

| # | Dónde | Qué pasaba | Clase · gravedad | Arreglo y prueba |
|---|---|---|---|---|
| F1 | Estira, tarjetas de «Tronco sentado», «Postura reset» y «Hombros», es y en | La línea de la tarjeta decía «sentado · **chair**»: faltaba `lib.gear.chair` y `RoutineCard` pinta la clave en crudo (foto `f1-chair-tarjeta.webp`) | texto/código · molesta | «con silla» / «with a chair», y un censo nuevo en `verify` (`chequeaMaterialCatalogo`): todo `equipment` del catálogo pide `lib.gear.*` y `preview.eq.*` en es y en. Sin las claves, `verify` sale rojo |
| F2 | Home, al volver de una sesión o cerrar la ventana de la pausa | El sello del aro («Nuevo sello · 50 horas de foco») se quedaba sus 3 s **encima** de lo que se abriera: la biblioteca, el título de «Antes de empezar» y el runner; y el siguiente sello de la fila salía con la ventana abierta. Rompe la regla de Ez del 8 oct. («los sellos no deben pisar los elementos») (fotos `f2-*.webp`) | código · molesta | `ui/Toast.jsx`: con una ventana, sesión o diálogo abierto el sello no se ve, y la fila espera a que se cierre. `tests/sello-espera.spec.js`, prueba nueva: roja sin el arreglo en sus dos mitades |
| F3 | Ventana de la pausa tras el **último** bloque | «Bloque 1 de 1 · hecho» ofrecía «**Seguir con el bloque 2**» (y la jornada de diez, «bloque 11») (foto `f3-e2-ventana-tras-la-jornada.webp`) | código · molesta | `BreakMenu.ritmo.jsx` pinta «Seguir» solo si queda un bloque. `tests/ritmo-pausa.spec.js`, prueba nueva: roja sin el arreglo |

Pasos para ver F2: terminar un bloque que gane un sello (o una sesión de Respira), cerrar la
ventana con «Ahora no» y pulsar enseguida «Hacer la pausa» o un módulo. Para F3: elegir «Media
jornada» a las 12:00, empezar y dejar acabar el bloque.

Las dos reglas nuevas, arriba del todo en `docs/product/DECISIONES_TECNICAS_VIGENTES.md`.

## Montado con lo que eligió Ez (7 nov.: 1A 2A 3A 4C 5A)

Sobre `main` con la 0.192.0 (juntado en la rama). Cada uno con su prueba, roja con el arreglo quitado (cinco mutantes), y dos filas nuevas arriba en `DECISIONES_TECNICAS_VIGENTES.md`. Fotos del después en `fotos/despues-*.webp` y en la página de Ez: https://claude.ai/artifact/3deGGg5MHvUmihZHqwEj99.

Las pruebas vecinas (7 nov.): las que caían por la 1A describían «Una hora» empezada a las 17:20 y retomada a las 19:30, con su hora (18:20) y la salida (19:00) ya pasadas: un día que ahora está cerrado. `ritmo-linea` (7) pasa a «Dos horas» retomada a las 19:15, antes de su fin, y el móvil de `ritmo-panel` recoloca el bloque 2 a las 18:10. `hora-y-medianoche` (H2, marzo) era un fallo: el cierre llegaba a los 50 minutos de «Una hora» la noche del cambio de hora, porque la hora que no existe contaba; ahora el reloj se cuenta con el de cuando empezó (`ritmoTrasElFin`). `ritmo-pausa:106`, `ritmo-aviso:95` y `ritmo-bloque-siguiente:26` eran carga: pasan con un solo worker.

| # | Lo que eligió | Cómo queda | Prueba |
|---|---|---|---|
| E1 · 1A | Pasada la salida, el día se cierra | El motor da la hora de salida del día (`m.fin`); pasada, sin un bloque empezado antes en marcha ni la pausa abierta en su rato, `ritmoPlan` lo da por terminado. El aro dice «Tu jornada ya terminó» y lo hecho («45 min de foco») en su rótulo y en la línea de la hora; la tarjeta, «Jornada cerrada» con los bloques terminados; el botón y el reloj, los de por libre. El bloque que empezó antes de la salida acaba y ofrece su pausa de cierre. La home se repinta sola cada minuto y al volver a la pestaña, sin escribir | `tests/aro-jornada.spec.js` (abierta a pasos de 5 min, recargada, y el bloque que cruza la salida) |
| E2 · 2A | La pausa de cierre, saltada al empezar otra cosa | Ya se daba por saltada al empezar otro Foco; lo que la reabría era el final de ese Foco (`ritmoBloqueTerminado`). Un Foco por encima del plan (`deMas`) o empezado con el día cerrado ya no la reabre ni la propone: su ventana es «Ciclo completado» | `tests/ritmo-pausa.spec.js` |
| E3 · 3A | La ventana de ayer se cierra sola | `usePausaALaVista` cierra la pausa que abrió cuando cambia `lastActiveDay`; la de un Foco que acaba pasada la medianoche nace con el día nuevo y no se toca. El aro deja el «Ciclo completado» de ayer | `tests/cambio-de-dia.spec.js` |
| P2 · 4C | La «× Salir» de Respira se queda | Sin tocar | — |
| P1 · 5A | Los vasos con nombre | `aria-label` «Vaso 3 de 8» / «Glass 3 of 8»; se sigue viendo el número | `tests/hidratate-botones.spec.js` |

## Lo que esperaba a Ez (ya elegido)

La página para elegir, con fotos y letras, estaba en la otra cuenta (Pd8CZq71NjTMimaydP3caM, allí). Ahora
la misma fuente (`docs/traspaso/archivos/recorrido-6nov/pagina-ez.html`) enseña lo elegido con su antes y
su después: https://claude.ai/artifact/3deGGg5MHvUmihZHqwEj99. E1 es su pregunta 1, E2 la 2, E3 la 3, P2 la 4 y P1 la 5.

| # | Dónde | Qué pasa | Qué debería pasar | Clase · gravedad | Recomendación |
|---|---|---|---|---|---|
| E1 | Jornada a la que se vuelve tarde | Quien deja la jornada en la pausa de las 9:35 y vuelve a las 17:40 (la salida era a las 17:00) ve «Bloque 2 de 9 · Hasta las 17:00 · Empezar bloque 2» y «Tu pausa · Ahora, Empuje sencillo». Si pulsa, empieza un bloque de 45 min «Hasta las 18:30» con una pausa a las 18:25 (fotos `e1-*.webp`). Abierta o recargada, igual | Pasada la salida, el día está cerrado | producto (código detrás) · molesta | **A**: pasada la salida, el aro dice «Tu jornada ya terminó» con lo hecho, y quien quiera sigue por libre |
| E2 | Un Foco libre después de la jornada | Al acabar, la ventana vuelve a decir «Bloque 1 de 1 · hecho · Para cerrar, despacio» con la pausa de cierre, aunque detrás el panel ya dice «Jornada cerrada» (foto `f3-e2-…`) | La ventana de siempre, «Ciclo completado» | código · molesta | **A**: la pausa de cierre se da por saltada en cuanto empiezas otra cosa; va con la decisión de E1 |
| E3 | La ventana de la pausa que se deja abierta | Acabar un Foco a las 18:25 y no tocar nada: a las 8:40 del día siguiente sigue abierta «Ciclo completado · Has cerrado un bloque. Elige tu pausa.», aunque el día ya cambió (reproducido dos veces) | Por la mañana, la home del día nuevo | código · pulido | **A**: al cambiar de día, la ventana de la pausa de ayer se cierra sola |
| P1 | Hidrátate, los ocho vasos | Los botones de los vasos se llaman «1», «2»…: un lector de pantalla no dice qué son | «Vaso 3 de 8» | código (accesibilidad) · pulido | Ponerles nombre; no cambia nada de lo que se ve |
| P2 | Respira, la «× Salir» de arriba | En la sesión va en letra de palo; en «Sesión completada», en cursiva más pequeña (fotos `p2-*.webp`) | La misma en las dos | visual · pulido | **A**: la de la sesión en las dos |

## No son fallos (mirado y descartado)

- Ajustes no encierra el Tab: es un panel flotante a propósito (s198, fila «LO QUE ESPERA A QUE NO
  HAYA NADA ABIERTO…»).
- Los 404 de `/premium` y `/desistir` son `/api/avisame` y `/api/desistir`, funciones de Cloudflare
  que el servidor local no tiene.
- La comida a las 12:00 en inglés y a las 14:00 en castellano: es el horario de cada idioma.
- «Español» en la lista de idiomas en inglés, y «Tu» (martes) en las barras: no son textos sin traducir.
- El Tab que salió una vez de «Nueva rutina» no se reprodujo tecla a tecla (dos veces): no se apunta.
